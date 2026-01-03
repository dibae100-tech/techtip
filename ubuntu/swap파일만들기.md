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

❗ 에러 발생 시 이미 비활성화된 상태일 수 있으며, 무시해도 됩니다.
