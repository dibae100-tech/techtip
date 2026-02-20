## 서비스 상태 확인
```
# 현재 실행 중인 모든 서비스 확인
sudo systemctl list-units --type=service --state=running

# tts 관련 서비스 찾기
sudo systemctl list-units --type=service | grep -i tts

# 또는 더 넓게 검색
sudo systemctl list-units --type=service | grep -iE "tts|qwen|flask|app"

# 등록된 서비스 파일 전체에서 찾기 (비활성 포함)
sudo systemctl list-unit-files --type=service | grep -iE "tts|qwen|flask|app"

# 5000번 포트 사용 중인 프로세스 확인
sudo lsof -i :5000

# 또는
sudo ss -tlnp | grep 5000

# 서비스 파일 직접 검색
ls /etc/systemd/system/*.service

# 서비스 상태 확인
sudo systemctl status korean-stt

# 상세 로그 확인 (최근 100줄)
sudo journalctl -u korean-stt -n 100 --no-pager

# 서비스 파일 내용 확인
sudo cat /etc/systemd/system/korean-stt.service

# 서비스 재시작
sudo systemctl restart korean-stt

# 재시작 후 바로 로그 추적
sudo systemctl restart korean-stt && sudo journalctl -u korean-stt -f


```
