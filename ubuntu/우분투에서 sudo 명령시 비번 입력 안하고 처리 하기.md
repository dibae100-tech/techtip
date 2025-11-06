### 1. sudoers 파일 수정

sudoers 파일을 직접 수정하는 것은 위험할 수 있으므로, 항상 visudo 명령을 사용해야 합니다.

    sudo visudo
    
### 2. 사용자에 대한 비밀번호 요구 비활성화

sudoers 파일에 다음과 같은 내용을 추가하거나 수정합니다. 이때, <username>은 비밀번호 요구를 비활성화하려는 사용자 이름으로 변경하세요.

    <username> ALL=(ALL) NOPASSWD:ALL
    
    예를 들어, 사용자 이름이 roadee라면 다음과 같이 입력합니다:

    roadee ALL=(ALL) NOPASSWD:ALL
    
### 3. 파일 저장

  Ctrl + X → Y → Enter를 눌러 변경 사항을 저장하고 나옵니다.
