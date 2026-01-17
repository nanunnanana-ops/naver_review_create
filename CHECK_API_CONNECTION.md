# Gemini API 연결 확인 방법

## 문제 증상
- 리뷰가 짧고 어법이 이상함
- 글자수가 200-400자가 아님
- 템플릿 기반 폴백이 작동 중

## 확인 방법

### 1. Vercel 환경 변수 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 클릭

2. **Settings → Environment Variables**
   - `GEMINI_API_KEY` 확인
   - 값: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
   - 없으면 추가!

3. **환경 변수 추가 방법**
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
   - Environment: Production, Preview, Development 모두 선택
   - 저장

4. **재배포 (중요!)**
   - Settings에서 환경 변수 추가 후 반드시 재배포 필요
   - Deployments → 최신 배포 → "..." → "Redeploy"

### 2. Function 로그 확인

1. **Deployments → 최신 배포 클릭**
2. **Functions 탭 또는 Logs 탭**
3. **에러 메시지 확인**:
   - "API 키가 설정되지 않았습니다" → 환경 변수 없음
   - "Gemini API error" → API 키 문제
   - 기타 에러 메시지 확인

### 3. 브라우저 콘솔 확인

1. **F12 키 누르기**
2. **Console 탭**
3. **에러 메시지 확인**:
   - API 호출 실패 메시지
   - 500 에러 등

### 4. DEMO_MODE 확인

- `shared.js`에서 `DEMO_MODE = false`인지 확인
- true면 템플릿만 사용 (AI 미사용)

## 빠른 해결

1. **환경 변수 확인 및 추가**
   - Settings → Environment Variables
   - `GEMINI_API_KEY` 추가

2. **재배포**
   - Deployments → Redeploy

3. **테스트**
   - 사이트에서 다시 시도
   - F12 → Console에서 에러 확인
