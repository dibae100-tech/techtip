## visual studio에서 우분투의 shell 등을 수정 하면 windows -> ubuntu shell이 실행 이 안되는 현상 이발생 한다. 

문제는 윈도우 코드 체계 와 우분투의 코드 체계가 달라서 발생.

    해결책 : sudo apt-get install dos2unix

설치 후에 sh file을 변환 시킬 것.

    ex) dos2unix ltm-nodered.sh

이렇게 하고 나느 실행 하면 실행이 된다.

    sudo chmod +x ltm-nodered.sh
    
은 꼭 실행 시킬 것.
