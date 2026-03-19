# extraCBT

중고등학생이 스마트폰으로 쉽게 사고기록지를 작성하고, 교사가 학생 기록을 안전하게 확인할 수 있도록 만든 계정 기반 CBT 웹앱 데모입니다.

## 포함된 기능
- 학생/교사 로그인 데모 계정
- 학생용 단계형 사고기록지 작성 흐름
- 임시저장/완료 상태 구분 및 기록 상세 조회
- 사후 평가 작성 및 이전 응답 확인
- 교사용 학생 기록 조회, 작성 현황, 간단한 계정 추가
- 모바일 우선 반응형 UI

## 실행 방법

### 1) Windows BAT로 내부망/같은 PC에서 실행
`start-local.bat`

### 2) Windows BAT로 외부 공개 링크까지 실행
`start-public.bat`

이 BAT는 아래 순서로 동작합니다.
1. `tools/ensure-cloudflared.ps1`로 `cloudflared` 존재 여부 확인
2. 없으면 **winget 설치** 시도
3. winget이 없거나 PATH 반영이 안 되면 저장소 내부 `.tools/cloudflared/cloudflared.exe`로 **직접 다운로드**
4. 설치가 끝나면 `cloudflared tunnel --url http://127.0.0.1:8000` 방식으로 외부 공개 URL 생성

성공하면 콘솔에 `Public URL`이 출력되고, 학생은 그 링크로 외부망에서도 접속할 수 있습니다.

### 3) Python으로 직접 실행
```bash
python3 serve.py --host 0.0.0.0 --port 8000
```

외부 공개 링크까지 필요하면 아래처럼 실행하세요.
```bash
python3 serve.py --host 0.0.0.0 --port 8000 --tunnel cloudflared
```

> 참고: Python 직접 실행 모드는 `cloudflared`가 PATH에 있거나, 저장소 내부 `.tools/cloudflared/`에 다운로드되어 있어야 합니다.

## 데모 계정
- 학생: `minji / student123`
- 학생: `jun / student123`
- 교사: `teacher / teacher123`

## 외부 접속 관련 준비
- `start-public.bat`은 Windows에서 `PowerShell`과 `python` 실행이 가능해야 합니다.
- 학교/가정 네트워크 정책에 따라 터널 서비스 접속이 차단될 수 있습니다.
- 교사 PC 전원과 네트워크가 유지되어야 학생이 계속 접속할 수 있습니다.
- 실서비스에서는 학교 서버/클라우드 이전, HTTPS, 계정 보안, 서버 측 인증/권한 분리가 필요합니다.

## 주의
이 저장소는 MVP 데모이므로 민감정보 보호를 위한 실제 서버 인증, 비밀번호 해시, 데이터베이스 RBAC는 포함하지 않습니다. 실서비스 전환 시 백엔드와 HTTPS 구성이 필요합니다.
