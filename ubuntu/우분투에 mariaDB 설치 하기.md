#### Step1. MariaDB 서버 설치

    sudo apt install mariadb-server

#### Step 2. 보안 정보 등록 

    sudo mysql_secure_installation  비밀 번호 랑 기타 이상 야릇한것 들 등록

#### ※만약에 아래와 같은 내용이 나온다면 
<img src="../img/mariadb01.png" alt="산업용PC" width="900">

        1. Check If You Have Sudo Privileges
        Run the following command to check if your user (roadee) is in the sudo group:
        
        groups roadee
        If you don't see sudo in the output, you need to add your user to the sudo group:
        
        sudo usermod -aG sudo roadee
        Then, restart your session:
        
        su - roadee
        2. Use Sudo to Enable MariaDB
        Try running the command with sudo:
        
        sudo systemctl enable mariadb
