# 로컬 테스트 방법

## 방법 1: 간단한 로컬 서버 (템플릿 모드)

### DEMO_MODE = true로 설정됨
- 템플릿 기반으로 리뷰 생성 (AI 없음)
- 즉시 테스트 가능

### 실행 방법

```bash
# 간단한 HTTP 서버 실행
npx serve .
```

또는 Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

브라우저에서:
- http://localhost:8000 접속
- 또는 http://localhost:3000 (serve 사용 시)

## 방법 2: Vercel Dev로 전체 테스트 (AI 포함)

### 실행 방법

1. **환경 변수 설정**
   - `.env.local` 파일 생성
   ```
   GEMINI_API_KEY=AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg
   ```

2. **Vercel CLI 설치 및 로그인**
   ```bash
   npm i -g vercel
   vercel login
   ```

3. **로컬 개발 서버 실행**
   ```bash
   vercel dev
   ```

4. **브라우저 접속**
   - http://localhost:3000 접속

## 방법 3: DEMO_MODE로 빠른 테스트

현재 `DEMO_MODE = true`로 설정되어 있습니다:
- AI API 없이 즉시 테스트 가능
- 템플릿 기반 리뷰 생성
- 빠르고 간단

### 실행

```bash
npx serve .
```

브라우저에서 http://localhost:3000 (또는 표시된 포트) 접속

## 테스트 체크리스트

- [ ] 메인 페이지 로드됨
- [ ] 메뉴 선택 가능
- [ ] 함께 먹은 것 선택 가능
- [ ] "리뷰 3개 만들기" 버튼 작동
- [ ] 리뷰 3개 생성됨
- [ ] 복사 버튼 작동
- [ ] 관리자 페이지 접속 가능 (`/admin.html`)

## 문제 해결

### 포트가 이미 사용 중일 때
```bash
# 다른 포트 사용
npx serve . -l 8080
```

### CORS 에러
- 로컬 서버를 사용하면 CORS 문제 없음
- `file://` 프로토콜로 열면 API가 작동하지 않음

## 배포 전 확인

로컬에서 테스트 완료 후:
1. `DEMO_MODE = false`로 변경 (AI 사용하려면)
2. 환경 변수 설정 확인
3. 배포
