# Vercel CLI 로그인 방법

## 로그인 방법

### 1. 터미널에서 로그인 명령어 실행

```bash
vercel login
```

### 2. 로그인 과정

1. **명령어 실행 후**
   - 브라우저가 자동으로 열립니다
   - 또는 URL이 표시됩니다

2. **브라우저에서**
   - Vercel 로그인 페이지로 이동
   - GitHub 계정으로 로그인 (권장)
   - 또는 이메일/비밀번호로 로그인

3. **승인**
   - "Authorize Vercel" 또는 "승인" 클릭
   - CLI 접근 권한 승인

4. **완료**
   - 브라우저에 "Success!" 메시지 표시
   - 터미널에도 로그인 완료 메시지 표시

### 3. 로그인 확인

```bash
vercel whoami
```

로그인된 계정 정보가 표시되면 성공!

## 문제 해결

### 브라우저가 자동으로 안 열릴 때

1. **터미널에 표시된 URL 복사**
   - 예: `https://vercel.com/login?next=...`
   
2. **브라우저에 직접 입력**
   - URL을 브라우저 주소창에 붙여넣기

### 로그인이 안 될 때

1. **브라우저 팝업 차단 확인**
   - 브라우저에서 팝업 허용

2. **다시 시도**
   ```bash
   vercel logout
   vercel login
   ```

### 토큰 방식으로 로그인 (대안)

1. **Vercel 웹사이트에서 토큰 생성**
   - https://vercel.com/account/tokens
   - "Create Token" 클릭
   - 토큰 이름 입력
   - 토큰 복사

2. **CLI에서 토큰 사용**
   ```bash
   vercel login --token YOUR_TOKEN
   ```

## 로그인 후 배포

로그인이 완료되면:

```bash
# 프로덕션 배포
vercel --prod --yes
```

또는 대화형으로:

```bash
vercel
```
