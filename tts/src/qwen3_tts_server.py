from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel
import subprocess
import tempfile
import io
import os
import logging
from datetime import datetime
from pathlib import Path

# ============================================================
# 로깅 설정
# ============================================================
log_dir = Path("./logs")
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "tts.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================================
# Flask 앱 생성 + CORS
# ============================================================
app = Flask(__name__, template_folder='public', static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})

# ============================================================
# Qwen3-TTS 설정
# ============================================================
GPU_DEVICE = "cuda:0"
QWEN_MODEL_NAME = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
QWEN_LANGUAGES = ["Korean", "Chinese", "English", "Japanese"]
QWEN_SPEAKERS = ["Sohee", "Vivian", "Serena", "Ryan", "Aiden"]

qwen_model = None

# ============================================================
# Edge-TTS 설정
# ============================================================
EDGE_VOICES = {
    "sunhi":    {"id": "ko-KR-SunHiNeural",    "label": "SunHi (여성)",   "lang": "ko"},
    "injoon":   {"id": "ko-KR-InJoonNeural",    "label": "InJoon (남성)",  "lang": "ko"},
    "hyunsu":   {"id": "ko-KR-HyunsuNeural",    "label": "Hyunsu (남성)",  "lang": "ko"},
    "jenny":    {"id": "en-US-JennyNeural",      "label": "Jenny (여성)",   "lang": "en"},
    "guy":      {"id": "en-US-GuyNeural",        "label": "Guy (남성)",     "lang": "en"},
    "xiaoxiao": {"id": "zh-CN-XiaoxiaoNeural",   "label": "Xiaoxiao (여성)","lang": "zh"},
    "nanami":   {"id": "ja-JP-NanamiNeural",     "label": "Nanami (여성)",  "lang": "ja"},
}
DEFAULT_EDGE_VOICE = "ko-KR-SunHiNeural"

# ============================================================
# Qwen3-TTS 모델 로드
# ============================================================
def load_qwen_model():
    global qwen_model
    try:
        logger.info("Qwen3-TTS 모델 로드 중...")
        qwen_model = Qwen3TTSModel.from_pretrained(
            QWEN_MODEL_NAME,
            device_map=GPU_DEVICE,
            dtype=torch.bfloat16,
            attn_implementation="eager",
        )
        logger.info("✓ Qwen3-TTS 모델 로드 완료")
        return True
    except Exception as e:
        logger.error(f"Qwen3-TTS 모델 로드 실패: {e}")
        return False

# ============================================================
# Edge-TTS → WAV 변환
# ============================================================
def generate_edge_wav(text, voice):
    """Edge-TTS 실행 후 WAV 16bit 24kHz mono 변환"""
    tmp_mp3_path = None
    tmp_wav_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp_mp3:
            tmp_mp3_path = tmp_mp3.name

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_wav:
            tmp_wav_path = tmp_wav.name

        # Edge-TTS 실행
        cmd = ['edge-tts', '--text', text, '--voice', voice, '--write-media', tmp_mp3_path]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            logger.error(f"edge-tts 오류: {result.stderr}")
            return None

        # FFmpeg로 WAV 16bit 변환
        ffmpeg_cmd = [
            'ffmpeg', '-y',
            '-i', tmp_mp3_path,
            '-acodec', 'pcm_s16le',
            '-ar', '24000',
            '-ac', '1',
            tmp_wav_path
        ]
        ffmpeg_result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, timeout=30)

        if ffmpeg_result.returncode != 0:
            logger.error(f"ffmpeg 오류: {ffmpeg_result.stderr}")
            return None

        with open(tmp_wav_path, 'rb') as f:
            audio_data = f.read()

        return audio_data

    except Exception as e:
        logger.error(f"Edge-TTS 오류: {e}")
        return None
    finally:
        # 임시 파일 정리
        if tmp_mp3_path and os.path.exists(tmp_mp3_path):
            os.unlink(tmp_mp3_path)
        if tmp_wav_path and os.path.exists(tmp_wav_path):
            os.unlink(tmp_wav_path)

# ============================================================
# 웹 페이지 (루트)
# ============================================================
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api-docs")
def api_docs():
    return render_template("api-docs.html")



# ============================================================
# API 엔드포인트
# ============================================================
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "qwen_model_loaded": qwen_model is not None,
        "device": GPU_DEVICE,
        "edge_tts": "available",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/config", methods=["GET"])
def get_config():
    return jsonify({
        "service": "TTS Server (Qwen3 + Edge)",
        "output": "WAV 16bit 24kHz mono",
        "endpoints": {
            "/": "테스트 웹 페이지",
            "/health": "서버 상태 확인",
            "/voices": "음성 목록",
            "/tts/instant": "Qwen3-TTS (고품질, 느림)",
            "/tts/edge": "Edge-TTS (빠름)"
        }
    })

@app.route("/voices", methods=["GET"])
def get_voices():
    return jsonify({
        "qwen": {
            "speakers": QWEN_SPEAKERS,
            "languages": QWEN_LANGUAGES
        },
        "edge": {
            "voices": EDGE_VOICES,
            "default": DEFAULT_EDGE_VOICE
        }
    })

# ============================================================
# Qwen3-TTS
# ============================================================
@app.route("/tts/instant", methods=["GET", "POST"])
def tts_qwen():
    try:
        if not qwen_model:
            return jsonify({"error": "Qwen3 모델이 로드되지 않았습니다."}), 503

        # 파라미터 추출
        if request.method == "GET":
            text = request.args.get("text", "")
            language = request.args.get("language", "Korean")
            speaker = request.args.get("speaker", "Sohee")
        else:
            data = request.get_json(silent=True) or {}
            text = data.get("text", "")
            language = data.get("language", "Korean")
            speaker = data.get("speaker", "Sohee")

        if not text:
            return jsonify({"error": "text 파라미터가 필요합니다."}), 400

        if language not in QWEN_LANGUAGES:
            return jsonify({"error": f"지원 언어: {QWEN_LANGUAGES}"}), 400

        if speaker not in QWEN_SPEAKERS:
            return jsonify({"error": f"지원 스피커: {QWEN_SPEAKERS}"}), 400

        logger.info(f"[Qwen3] lang={language}, speaker={speaker}, text={text[:80]}")

        wavs, sr = qwen_model.generate_custom_voice(
            text=text,
            language=language,
            speaker=speaker,
            instruct="",
        )

        wav_buffer = io.BytesIO()
        sf.write(wav_buffer, wavs[0], sr, format='WAV', subtype='PCM_16')
        wav_buffer.seek(0)

        size_kb = wav_buffer.getbuffer().nbytes / 1024
        logger.info(f"✓ [Qwen3] 완료: {size_kb:.1f}KB")

        return send_file(
            wav_buffer,
            mimetype="audio/wav",
            download_name=f"qwen_{datetime.now().strftime('%H%M%S')}.wav"
        )

    except Exception as e:
        logger.error(f"[Qwen3] 오류: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# ============================================================
# Edge-TTS
# ============================================================
@app.route("/tts/edge", methods=["GET", "POST"])
def tts_edge():
    try:
        if request.method == "GET":
            text = request.args.get("text", "")
            voice = request.args.get("voice", DEFAULT_EDGE_VOICE)
        else:
            data = request.get_json(silent=True) or {}
            text = data.get("text", "")
            voice = data.get("voice", DEFAULT_EDGE_VOICE)

        if not text:
            return jsonify({"error": "text 파라미터가 필요합니다."}), 400

        # 축약 키 → 실제 음성 ID 변환
        if voice in EDGE_VOICES:
            voice = EDGE_VOICES[voice]["id"]

        logger.info(f"[Edge] voice={voice}, text={text[:80]}")

        audio_data = generate_edge_wav(text, voice)

        if not audio_data:
            return jsonify({"error": "Edge-TTS 음성 생성 실패"}), 500

        logger.info(f"✓ [Edge] 완료: {len(audio_data)/1024:.1f}KB")

        return send_file(
            io.BytesIO(audio_data),
            mimetype="audio/wav",
            download_name=f"edge_{datetime.now().strftime('%H%M%S')}.wav"
        )

    except Exception as e:
        logger.error(f"[Edge] 오류: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# ============================================================
# 에러 핸들러
# ============================================================
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "엔드포인트를 찾을 수 없습니다.", "available": ["/", "/health", "/voices", "/tts/instant", "/tts/edge"]}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "서버 내부 오류"}), 500

# ============================================================
# 메인
# ============================================================
if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("  TTS 서버 시작")
    logger.info("=" * 60)

    model_loaded = load_qwen_model()

    if not model_loaded:
        logger.warning("⚠ Qwen3 모델 로드 실패 - Edge-TTS만 사용 가능")

    logger.info(f"  on-TTS: {'✓ 사용 가능' if model_loaded else '✗ 사용 불가'}")
    logger.info(f"  Edge-TTS:  ✓ 사용 가능")
    logger.info(f"  웹 테스트: http://localhost:5000")
    logger.info(f"  출력 포맷: WAV 16bit 24kHz mono")
    logger.info("=" * 60)

    app.run(host="0.0.0.0", port=5000, debug=False)
