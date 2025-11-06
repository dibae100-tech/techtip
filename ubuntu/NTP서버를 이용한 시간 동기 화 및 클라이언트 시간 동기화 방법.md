우분투 서버에서 시간을 동기화 시키고 로컬 서버 와 클라이언트를 다시 시간 동기화 시키는 방법은 2가지로 설정 해야 한다. 



### 1. NTP(Network Time Protocol) 서버를 설치하고 설정하는 방법

   설치 하는 방법은 2가지가 있는데 chrony 또는 ntpd를 사용

#### 1) chrony 설치  

    sudo apt update
    
    sudo apt install chrony -y
