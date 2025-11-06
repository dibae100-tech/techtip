## visual studio에서 우분투의 shell 등을 수정 하면 windows -> ubuntu shell이 실행 이 안되는 현상 이발생 한다. 

가끔 웁분투에서 shell file을 만들때가 있다. 이때 에디터로 visual studio 를 사용 하는데, 이게 실행이 안된다. 

스크립트에 잘못된 줄바꿈(CRLF):

Windows에서 작성한 파일을 Linux에서 실행할 때, 줄바꿈 형식 문제로 인해 발생할 수 있습니다.
이런 문제로 인하여 다음과 같은 설정을 해 줘야 한다. 


문제는 윈도우 코드 체계 와 우분투의 코드 체계가 달라서 발생.

    해결책 : sudo apt-get install dos2unix

설치 후에 sh file을 변환 시킬 것.

    ex) dos2unix ltm-nodered.sh

이렇게 하고 나느 실행 하면 실행이 된다.

    sudo chmod +x ltm-nodered.sh
    
은 꼭 실행 시킬 것.
