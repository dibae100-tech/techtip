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

## 📚 References

- [Qwen3-TTS GitHub](https://github.com/QwenLM/Qwen3-TTS)
- [Qwen3-TTS Blog](https://qwen.ai/blog?id=qwen3tts-0115)
- [Hugging Face Models](https://huggingface.co/collections/Qwen/qwen3-tts)

## 📄 License

MIT License
