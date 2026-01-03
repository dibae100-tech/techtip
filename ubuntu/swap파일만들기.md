# Ubuntu Swap File 64GB 설정 가이드 (AI / ComfyUI 최적화)

본 문서는 **Ubuntu 환경에서 Swap File을 64GB로 확장**하는 방법과  
**GPU 16GB + RAM 64GB 환경에서의 주의사항**을 정리한 가이드입니다.

AI 이미지/영상 생성(ComfyUI, Wan, Flux 등) 환경에서  
**OOM(Out Of Memory) 방지와 시스템 안정성 확보**를 목표로 합니다.

---

## 📌 시스템 기준
- **GPU VRAM**: 16GB
- **System RAM**: 64GB
- **Swap File**: 64GB
- **OS**: Ubuntu 22.04 / 24.04

> ⚠️ Swap은 VRAM을 대체하지 않습니다.  
> Swap은 **최후의 안전망(OOM 방지)** 역할입니다.

---

## 1️⃣ 현재 Swap 상태 확인 (선택)
```bash
swapon --show
free -h
```

## 2️⃣ 기존 Swap File 비활성화
```bash
sudo swapoff /swapfile
```

> ❗ 에러 발생 시 이미 비활성화된 상태일 수 있으며, 무시해도 됩니다.

## 3️⃣ 기존 Swap File 삭제
```bash
sudo rm /swapfile
```

## 4️⃣ 64GB Swap File 생성 (권장 방식)
> ⚠️ fallocate 대신 dd 방식 권장

AI 워크로드 환경에서는 fallocate가 실패하거나 성능 이슈가 발생할 수 있습니다.
```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=65536 status=progress
```

> ⏱️ 디스크 성능에 따라 수 분 소요될 수 있습니다.

## 5️⃣ Swap File 권한 설정 (필수)

```bash
sudo chmod 600 /swapfile
```

## 6️⃣ Swap 영역 생성

```bash
sudo mkswap /swapfile
```

## 7️⃣ Swap 활성화

```bash
sudo swapon /swapfile
```

## 8️⃣ 적용 확인

```bash
free -h
swapon --show
```

> 정상이라면 Swap 64G가 표시됩니다.

## 9️⃣ 재부팅 후 자동 적용 설정

> /etc/fstab에 Swap File 등록
```bash
sudo nano /etc/fstab
```

> 아래 줄을 맨 마지막에 추가
```bash
/swapfile none swap sw 0 0
```

> 저장: Ctrl + O → Enter → Ctrl + X

## 🔧 10️⃣ Swappiness 설정 (강력 권장)

> RAM이 충분한 환경에서는 Swap 사용을 최소화해야 합니다.

즉시 적용
```bash
sudo sysctl vm.swappiness=10
```

영구 적용
```bash
sudo nano /etc/sysctl.conf
```

아래 내용 추가
```bash
vm.swappiness=10
```

## 🧠 Swap 동작 구조 이해

```md
GPU VRAM (16GB)
   ↓
System RAM (64GB)
   ↓
Swap File (64GB)
```

Swap은 GPU VRAM을 늘려주지 않음

VRAM 부족 시 → RAM → Swap 순으로 메모리 이동

Swap의 목적은 속도 향상 ❌ / 안정성 ✔

## 🎯 AI / ComfyUI 환경에서 Swap이 필요한 이유

다음 상황에서 Swap은 매우 중요합니다:

- Wan / Flux / Video 모델 사용

- 고해상도 (≥1024px)

- 프레임 수 증가

- SageAttention 사용

- 여러 Workflow 동시 실행

- Python 메모리 파편화 누적


➡️ Swap 없음

- CUDA OOM

- ComfyUI 프로세스 강제 종료

➡️ Swap 있음

- 일시적 속도 저하

- 작업 정상 완료

## ⚠️ 주의 사항 (중요)

### 1. SSD 수명

- Swap은 디스크 쓰기를 유발

- 과도한 Swap 사용은 SSD 수명 감소

- → Swappiness를 낮게 유지해야 함

### 2. 성능 오해

- Swap은 성능 향상 도구가 아님

- 느려지는 대신 죽지 않게 만드는 장치

### 3. VRAM 한계

- Swap으로 VRAM 부족을 해결할 수 없음

- VRAM 최적화는 별도 설정 필요

## ✅ 권장 최종 세팅 요약
| 항목         | 값            |
| ---------- | ------------ |
| GPU VRAM   | 16GB         |
| System RAM | 64GB         |
| Swap Size  | 64GB         |
| Swappiness | 10           |
| 목적         | OOM 방지 / 안정성 |


## 📎 참고

- AI / GPU 워크로드 환경에서는 Swap = 보험

- RAM이 많아도 Swap은 필요

- 특히 Video / Diffusion 계열 작업에서 필수

## 🧪 모니터링 명령어
```bash
watch -n 1 free -h

vmstat 1
```
