## tip sudo 실행시 password안치고 실행 하기 


    sudo visudo

를 실행 후 마지막 부분에 

    roadee ALL=(ALL) NOPASSWD: ALL

를 추가 한다. 이때 yourusername 은 현재값 roadee(예시:나의 owner명) 로 변경

혹은

    sudo /etc/sudoers.d/roadee

한후 위와 같이 저장
