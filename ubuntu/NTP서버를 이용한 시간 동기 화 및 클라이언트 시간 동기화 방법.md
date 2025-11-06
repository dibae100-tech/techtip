우분투 서버에서 시간을 동기화 시키고 로컬 서버 와 클라이언트를 다시 시간 동기화 시키는 방법은 2가지로 설정 해야 한다. 



### 1. NTP(Network Time Protocol) 서버를 설치하고 설정하는 방법

   설치 하는 방법은 2가지가 있는데 chrony 또는 ntpd를 사용

#### 1) chrony 설치  

    sudo apt update
    
    sudo apt install chrony -y

이렇게 하고 환경 설정 으로 들어 간다.

      sudo nano /etc/chrony/chrony.conf


      # Chrony Configuration File
      # 로컬 Chrony 서버 설정
      
      server 127.127.1.0 iburst
      local stratum 10
      
      # 외부 NTP 서버 (인터넷 연결 시)
      server time.google.com iburst
      server 0.pool.ntp.org iburst
      server 1.pool.ntp.org iburst
      
      # 로컬 네트워크에서 NTP 서비스 허용
      allow 192.168.0.0/24
      
      # 시스템이 인터넷에 연결되지 않았을 때 RTC 동기화 사용
      # rtcfile /var/lib/chrony/rtc
      
      # 드리프트 파일 저장 위치
      driftfile /var/lib/chrony/chrony.drift
      
      # 시간 조정 설정
      makestep 1 3
      
      # 로그 설정
      logdir /var/log/chrony
      
      # 11분마다 커널 RTC 동기화 활성화
      rtcsync

 Chrony 동기화 상태 확인
 
      sudo systemctl restart chrony
      
      systemctl status chrony

