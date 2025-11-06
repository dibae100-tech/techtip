## TCP통신을 하다 보면 장치 업체 담당자들이 안된다고 연락 온다. 이럴때는 아래 내용을 참조 하여 진짜로 연결에 문제 가 없는지를 파악 하는 것이 좋다. 

### 1. TCP 패킷 캡처 툴 사용 (Wireshark, tcpdump)
서버가 HTTP 서버로 동작하지 않아도, 네트워크 인터페이스에서 수신되는 HTTP 요청 패킷은 캡처할 수 있습니다.

#### 방법: tcpdump
    
    sudo tcpdump -i <인터페이스명> port 80 -A
    예시: 유선 인터페이스가 eth0인 경우

    sudo tcpdump -i eth0 port 80 -A
    -A: 패킷 내용을 ASCII로 출력 (가독성 좋음)
    클라이언트에서 보낸 요청 헤더와 바디를 모두 확인 가능
    sudo nohup tcpdump -i any port 9152 -A > /home/roadee/logs/tcpdump/tcpdump.log 2>&1 &

 
### 2. Wireshark GUI 사용 (필요시)
        sudo apt install wireshark
        sudo wireshark
        특정 인터페이스 선택 후, 필터에 http 입력
        클라이언트 요청 패킷을 실시간으로 볼 수 있음
        
### 3. iptables 로그 남기기 (고급)
HTTP 요청을 패킷 수준에서 로깅하는 방법도 있습니다.

#### 예시
        sudo iptables -A INPUT -p tcp --dport 80 -j LOG --log-prefix "HTTP_REQUEST: "
        이후 /var/log/syslog나 /var/log/kern.log에서 로그 확인 가능
        sudo tail -f /var/log/syslog
        이 방식은 패킷 헤더 정보만 나오므로, 실제 HTTP 바디 내용은 보기 어렵습니다.




## 4.현장 예시 

        sudo tcpdump -i eno1 port 9152
        
        sudo iptables -A INPUT -p tcp --dport 9152 -j LOG --log-prefix "HTTP_REQUEST: "
        
        sudo tail -f /var/log/syslog

    <img src="../img/tcpdump01.png" alt="산업용PC" width="900">
