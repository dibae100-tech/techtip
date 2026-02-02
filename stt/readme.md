# Whisper STT Server

한국어 음성 인식(STT) 서버 - Faster-Whisper 기반

## 🎯 Features

- **고품질 한국어 STT**: Whisper large-v3 모델 사용
- **빠른 응답**: GPU 가속으로 ~1초 내 인식
- **REST API**: 간단한 HTTP POST 요청으로 음성 인식
- **Buffer 지원**: Node-RED, ESP32 등에서 직접 전송 가능

## 📋 Requirements

- Ubuntu 22.04
- NVIDIA GPU (12GB+ VRAM 권장)
- CUDA 12.1+
- Python 3.12

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/[username]/whisper-stt-server.git
cd whisper-stt-server
```

### 2. Environment Setup

```bash
conda create -n voice-ai python=3.12 -y
conda activate voice-ai
```

### 3. Install Dependencies

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
pip install faster-whisper fastapi uvicorn
```

### 4. Run Server

```bash
python stt_server.py
```

### 5. Test

```bash
curl -X POST "http://localhost:42424/stt" \
  --data-binary @test.wav \
  -H "Content-Type: audio/wav"
```

## 📡 API

### Health Check

```
GET /health
```

Response:
```json
{"status": "ok"}
```

### Speech-to-Text

```
POST /stt
Content-Type: audio/wav
Body: [WAV 파일 바이너리]
```

Response:
```json
{
  "text": "인식된 텍스트",
  "time": 0.82
}
```

### Example (Python)

```python
import requests

with open('audio.wav', 'rb') as f:
    audio_bytes = f.read()

r = requests.post('http://localhost:42424/stt', data=audio_bytes)
print(r.json())
# {"text": "안녕하세요", "time": 0.82}
```

### Example (Node-RED)

Function 노드:
```javascript
msg.payload = Buffer.from(msg.payload);
msg.headers = {
    "Content-Type": "audio/wav"
};
return msg;
```

HTTP request 노드:
- Method: POST
- URL: \`http://[서버IP]:42424/stt\`
- Return: a parsed JSON object

## 📁 Project Structure

```
whisper-stt-server/
├── README.md
├── stt_server.py      # Main server
├── test_stt.py        # Test script
└── requirements.txt
```

## 🔧 Server Code

```python
# stt_server.py
import time
from fastapi import FastAPI, Request
from faster_whisper import WhisperModel
import uvicorn

app = FastAPI()

print("Whisper 모델 로딩 중...")
model = WhisperModel("large-v3", device="cuda", compute_type="float16")
print("STT 서버 준비 완료!")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/stt")
async def stt(request: Request):
    start = time.time()
    
    audio_bytes = await request.body()
    with open("/tmp/stt_input.wav", "wb") as f:
        f.write(audio_bytes)
    
    segments, info = model.transcribe("/tmp/stt_input.wav", language="ko")
    text = "".join([seg.text for seg in segments])
    
    return {"text": text, "time": round(time.time() - start, 2)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=42424)
```

## 🔄 Systemd Service

자동 시작 등록:

```bash
sudo cat << 'EOF' > /etc/systemd/system/stt-server.service
[Unit]
Description=Whisper STT Server
After=network.target

[Service]
Type=simple
User=ai
WorkingDirectory=/home/ai/voice-ai
ExecStart=/home/ai/miniconda3/envs/voice-ai/bin/python /home/ai/voice-ai/stt_server.py
Restart=always
RestartSec=10
Environment="PATH=/home/ai/miniconda3/envs/voice-ai/bin"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable stt-server
sudo systemctl start stt-server
```

서비스 관리:
```bash
# 상태 확인
sudo systemctl status stt-server

# 로그 보기
sudo journalctl -u stt-server -f

# 재시작
sudo systemctl restart stt-server

# 중지
sudo systemctl stop stt-server
```

## ⚡ Performance

| GPU | 응답 시간 | 모델 |
|-----|----------|------|
| RTX 5060 Ti 16GB | ~0.8초 | large-v3 |
| RTX 3060 12GB | ~1.5초 | large-v3 |

## 🎤 Supported Audio Format

- Format: **WAV**
- Sample Rate: 16kHz 권장
- Channels: Mono
- Bit Depth: 16-bit

## 📚 References

- [Faster-Whisper GitHub](https://github.com/SYSTRAN/faster-whisper)
- [OpenAI Whisper](https://github.com/openai/whisper)

## 📄 License

MIT License
