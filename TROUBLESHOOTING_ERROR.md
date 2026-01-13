# 리뷰 생성 에러 해결 방법

## 에러 발생 시 확인 사항

### 1. 환경 변수 확인 (가장 중요!)

Vercel 대시보드에서:
1. 프로젝트 → Settings → Environment Variables
2. `GEMINI_API_KEY` 확인
3. 값: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
4. **없으면 추가하고 재배포 필요!**

### 2. 재배포

환경 변수를 추가/수정했다면:
1. Deployments 탭
2. 최신 배포 → "..." → "Redeploy"
3. 또는 Settings 저장 후 자동 재배포 대기

### 3. 브라우저 콘솔 확인

1. F12 키 누르기
2. Console 탭 확인
3. 에러 메시지 확인:
   - "API 키가 설정되지 않았습니다" → 환경 변수 추가 필요
   - "Gemini API error" → API 키 확인
   - "Network error" → 네트워크 문제

### 4. Vercel Function 로그 확인

1. Vercel 대시보드 → 프로젝트
2. Deployments → 최신 배포 클릭
3. "Functions" 또는 "Logs" 탭
4. 에러 로그 확인

## 수정된 사항

### 템플릿 폴백 추가
- API 키가 없어도 템플릿 기반으로 리뷰 생성
- 작동은 하지만 AI 품질보다 낮음

### 에러 처리 개선
- 더 자세한 에러 메시지
- 콘솔 로그 개선

## 빠른 해결

1. **환경 변수 확인 및 추가**
   - Settings → Environment Variables
   - `GEMINI_API_KEY` = `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`

2. **재배포**
   - Deployments → Redeploy

3. **테스트**
   - 사이트에서 리뷰 생성 시도
   - F12로 콘솔 에러 확인

## 여전히 에러가 발생하면

1. 브라우저 콘솔의 에러 메시지 복사
2. Vercel Function 로그 확인
3. 에러 메시지를 알려주시면 추가 도움 가능
