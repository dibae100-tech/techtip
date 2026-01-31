# Qwen3-TTS Server

한국어 음성 합성(TTS) 서버 - Qwen3-TTS 기반

## 🎯 Features

- **고품질 한국어 TTS**: Qwen3-TTS 1.7B 모델 사용
- **빠른 응답**: RTX 5060 Ti 기준 ~1초 응답
- **REST API**: 간단한 HTTP GET 요청으로 음성 생성
- **다양한 화자**: Sohee(한국어), Ryan(영어) 등 9종 지원

## 📋 Requirements

- Ubuntu 22.04
- NVIDIA GPU (12GB+ VRAM 권장)
- CUDA 12.1+
- Python 3.12

## 🚀 Quick Start

### 1. Clone

\`\`\`bash
git clone https://github.com/[username]/qwen3-tts-server.git
cd qwen3-tts-server
\`\`\`

### 2. Environment Setup

\`\`\`bash
conda create -n voice-ai python=3.12 -y
conda activate voice-ai
\`\`\`

### 3. Install Dependencies

\`\`\`bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
pip install -U qwen-tts fastapi uvicorn
sudo apt install sox libsox-fmt-all -y
\`\`\`

### 4. Run Server

\`\`\`bash
python tts_server.py
\`\`\`

### 5. Test

\`\`\`bash
curl "http://localhost:42423/tts?text=안녕하세요" -o test.wav
\`\`\`

## 📡 API

### Health Check

\`\`\`
GET /health
\`\`\`

Response:
\`\`\`json
{"status": "ok"}
\`\`\`

### Text-to-Speech

\`\`\`
GET /tts?text={텍스트}&speaker={화자}&seed={시드}
\`\`\`

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| text | ✅ | - | 변환할 텍스트 |
| speaker | ❌ | Sohee | 화자 선택 |
| seed | ❌ | None | 음성 일관성용 시드값 |

Response: \`audio/wav\`

### Example

\`\`\`python
import requests

r = requests.get('http://localhost:42423/tts?text=안녕하세요')
with open('output.wav', 'wb') as f:
    f.write(r.content)
\`\`\`

## 🎤 Available Speakers

| Speaker | Description | Best Language |
|---------|-------------|---------------|
| **Sohee** | 따뜻하고 감정 풍부한 여성 | 한국어 ⭐ |
| Vivian | 밝고 엣지있는 젊은 여성 | 중국어 |
| Serena | 따뜻하고 부드러운 여성 | 중국어 |
| Ryan | 다이나믹한 남성 | 영어 |
| Aiden | 밝은 미국 남성 | 영어 |
| Ono_Anna | 일본 여성 | 일본어 |

## ⚡ Performance

| GPU | Response Time | RTF |
|-----|---------------|-----|
| RTX 5060 Ti 16GB | ~1.0s | ~1.3 |
| RTX 3060 12GB | ~2.4s | ~1.5 |

> RTF (Real-Time Factor): < 1 means faster than realtime

## 📁 Project Structure

\`\`\`
qwen3-tts-server/
├── README.md
├── tts_server.py      # Main server
├── test_tts.py        # Basic test
├── test_speed.py      # Speed benchmark
└── requirements.txt
\`\`\`

## 🔧 Configuration

서버 포트 변경:

\`\`\`python
# tts_server.py
uvicorn.run(app, host="0.0.0.0", port=42423)  # 포트 변경
\`\`\`

방화벽 설정:

\`\`\`bash
sudo ufw allow 42423
\`\`\`

## 🧪 Testing

### 기본 TTS 테스트

\`\`\`python
# test_tts.py
import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

print("모델 로딩 중...")
model = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
    device_map="cuda:0",
    dtype=torch.float16,
)

print("음성 생성 중...")
wavs, sr = model.generate_custom_voice(
    text="안녕하세요, 반갑습니다! 저는 인공지능 음성 비서입니다.",
    language="Korean",
    speaker="Sohee",
)

sf.write("test_output.wav", wavs[0], sr)
print("완료! test_output.wav 생성됨")
\`\`\`

실행:
\`\`\`bash
python test_tts.py
aplay test_output.wav
\`\`\`

### 속도 테스트

\`\`\`python
# test_speed.py
import torch
import time
from qwen_tts import Qwen3TTSModel

print("모델 로딩 중...")
model = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
    device_map="cuda:0",
    dtype=torch.float16,
)

texts = [
    "안녕하세요.",
    "안녕하세요, 반갑습니다.",
    "안녕하세요, 저는 인공지능 음성 비서입니다. 무엇을 도와드릴까요?",
]

print("\n=== 속도 테스트 (Sohee) ===\n")

# 워밍업
model.generate_custom_voice(text="테스트", language="Korean", speaker="Sohee")

for text in texts:
    start = time.time()
    wavs, sr = model.generate_custom_voice(
        text=text,
        language="Korean",
        speaker="Sohee",
    )
    elapsed = time.time() - start
    audio_duration = len(wavs[0]) / sr
    rtf = elapsed / audio_duration
    
    print(f"텍스트: {text}")
    print(f"  생성 시간: {elapsed:.2f}초 | 오디오: {audio_duration:.2f}초 | RTF: {rtf:.2f}")
    print()
\`\`\`

실행:
\`\`\`bash
python test_speed.py
\`\`\`

출력 예시:
\`\`\`
=== 속도 테스트 (Sohee) ===

텍스트: 안녕하세요.
  생성 시간: 1.44초 | 오디오: 0.78초 | RTF: 1.85

텍스트: 안녕하세요, 반갑습니다.
  생성 시간: 3.08초 | 오디오: 2.14초 | RTF: 1.44

텍스트: 안녕하세요, 저는 인공지능 음성 비서입니다. 무엇을 도와드릴까요?
  생성 시간: 7.57초 | 오디오: 5.82초 | RTF: 1.30
\`\`\`

### 전체 화자 테스트

\`\`\`python
# test_all_voices.py
import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

print("모델 로딩 중...")
model = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
    device_map="cuda:0",
    dtype=torch.float16,
)

speakers = [
    ("Sohee", "따뜻하고 감정 풍부한 한국 여성"),
    ("Vivian", "밝고 엣지있는 젊은 여성"),
    ("Serena", "따뜻하고 부드러운 여성"),
    ("Ryan", "다이나믹한 남성"),
    ("Aiden", "밝은 미국 남성"),
    ("Ono_Anna", "일본 여성"),
]

text = "안녕하세요, 저는 인공지능 음성 비서입니다. 무엇을 도와드릴까요?"

for speaker, desc in speakers:
    print(f"생성 중: {speaker} ({desc})")
    try:
        wavs, sr = model.generate_custom_voice(
            text=text,
            language="Korean",
            speaker=speaker,
        )
        sf.write(f"voice_{speaker}.wav", wavs[0], sr)
        print(f"완료: voice_{speaker}.wav")
    except Exception as e:
        print(f"실패: {speaker} - {e}")

print("\n모든 음성 생성 완료!")
\`\`\`

실행:
\`\`\`bash
python test_all_voices.py
\`\`\`

### API 서버 테스트

서버 실행 후 새 터미널에서:

\`\`\`bash
# Health Check
curl http://localhost:42423/health

# TTS 요청 (Python)
python -c "
import requests
import time

start = time.time()
r = requests.get('http://localhost:42423/tts?text=안녕하세요')
print(f'응답 시간: {time.time()-start:.2f}초')
print(f'파일 크기: {len(r.content)} bytes')

with open('test.wav', 'wb') as f:
    f.write(r.content)
print('저장: test.wav')
"

# 재생
aplay test.wav
\`\`\`

### 원격 서버 테스트

\`\`\`python
import requests

# 서버 IP로 변경
SERVER_IP = "192.168.1.34"
PORT = 42423

# Health Check
r = requests.get(f'http://{SERVER_IP}:{PORT}/health')
print(r.json())

# TTS 요청
r = requests.get(f'http://{SERVER_IP}:{PORT}/tts?text=안녕하세요&speaker=Sohee')
with open('remote_test.wav', 'wb') as f:
    f.write(r.content)
print(f'저장 완료: {len(r.content)} bytes')
\`\`\`







## 📚 References

- [Qwen3-TTS GitHub](https://github.com/QwenLM/Qwen3-TTS)
- [Qwen3-TTS Blog](https://qwen.ai/blog?id=qwen3tts-0115)
- [Hugging Face Models](https://huggingface.co/collections/Qwen/qwen3-tts)

## 📄 License

MIT License
