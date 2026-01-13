# Vercel 배포 버튼 문제 해결

## 배포 버튼이 반응하지 않을 때

### 1. 필수 설정 확인

배포 버튼이 작동하려면 다음이 필요합니다:

✅ **Framework Preset 선택**
- "Other" 또는 "Other (No Framework)" 선택했는지 확인
- 선택하지 않으면 배포 버튼이 비활성화될 수 있음

✅ **저장소 연결 확인**
- GitHub 저장소가 제대로 Import 되었는지 확인
- 저장소 이름이 표시되어 있는지 확인

### 2. 브라우저 문제 해결

1. **페이지 새로고침**
   - F5 키 또는 Ctrl+R
   - 또는 브라우저 새로고침 버튼

2. **브라우저 캐시 삭제**
   - Ctrl+Shift+Delete
   - 캐시 삭제 후 다시 시도

3. **다른 브라우저로 시도**
   - Chrome, Firefox, Edge 등 다른 브라우저 사용

4. **시크릿 모드로 시도**
   - Ctrl+Shift+N (Chrome)
   - 시크릿 창에서 Vercel 접속

### 3. JavaScript 오류 확인

1. **개발자 도구 열기**
   - F12 키 누르기
   - Console 탭 확인
   - 빨간색 에러 메시지가 있는지 확인

2. **에러가 있다면**
   - 에러 메시지 복사
   - 문제 해결에 도움됨

### 4. Vercel 계정 권한 확인

1. **GitHub 권한 확인**
   - Vercel이 GitHub 저장소에 접근할 수 있는지 확인
   - Settings → Git → GitHub 연결 확인

2. **저장소 권한 확인**
   - GitHub에서 저장소가 Private인지 Public인지 확인
   - Private이면 Vercel이 접근할 수 있는지 확인

### 5. 대안: Vercel CLI 사용

웹에서 안 되면 CLI로 배포:

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 디렉토리에서
vercel

# 질문에 답변:
# - Set up and deploy? → Y
# - Which scope? → 본인 계정 선택
# - Link to existing project? → N
# - Project name? → naver-review-create
# - Directory? → ./
# - Override settings? → N

# 환경 변수 추가
vercel env add GEMINI_API_KEY
# 프롬프트에 입력: AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg
# Environment: Production, Preview, Development 모두 선택

# 배포
vercel --prod
```

### 6. 수동으로 설정 확인

다음 항목들을 하나씩 확인:

1. **프로젝트 이름**
   - 프로젝트 이름이 입력되어 있는지

2. **Root Directory**
   - `./` 또는 비워두기

3. **Build Command**
   - 비워두기 (아무것도 입력하지 않음)

4. **Output Directory**
   - `./` 또는 비워두기

5. **Install Command**
   - 기본값 그대로 (보통 `npm install`)

### 7. Vercel 상태 확인

1. **Vercel 상태 페이지 확인**
   - https://www.vercel-status.com/
   - 서버 문제가 있는지 확인

2. **잠시 후 재시도**
   - Vercel 서버가 일시적으로 문제가 있을 수 있음
   - 5-10분 후 다시 시도

### 8. 프로젝트 다시 Import

1. **새 프로젝트로 다시 시작**
   - 대시보드로 돌아가기
   - "Add New..." → "Project"
   - 저장소 다시 Import

2. **설정 다시 입력**
   - Framework: Other
   - 환경 변수 추가
   - Deploy 클릭

## 빠른 체크리스트

배포 전 확인:
- [ ] Framework Preset 선택됨 (Other)
- [ ] GitHub 저장소 연결됨
- [ ] 프로젝트 이름 입력됨
- [ ] 환경 변수 추가됨 (선택사항)
- [ ] 브라우저 새로고침 함
- [ ] JavaScript 오류 없음 (F12로 확인)

## 여전히 안 되면

1. **스크린샷 공유**
   - 현재 화면 캡처
   - 어떤 메시지가 보이는지 확인

2. **에러 로그 확인**
   - F12 → Console 탭
   - 에러 메시지 확인

3. **Vercel CLI 사용**
   - 웹보다 CLI가 더 안정적일 수 있음
