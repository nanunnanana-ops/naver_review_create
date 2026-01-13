# 네이버 영수증 리뷰 문구 생성기

네이버 플레이스 영수증 리뷰를 쉽게 작성할 수 있도록 도와주는 웹 애플리케이션입니다.

## 기능

- 메뉴 및 사이드 메뉴 선택 (복수 선택 가능)
- 35글자 내외의 자연스러운 리뷰 문구 3개 자동 생성
- 클립보드 복사 및 네이버 플레이스 링크로 바로 이동
- 관리자 페이지에서 설정 커스터마이징

## 파일 구조

- `index.html` - 손님용 메인 페이지
- `admin.html` - 관리자 설정 페이지 (PIN: 2222)
- `app.js` - 손님용 로직
- `admin.js` - 관리자용 로직
- `shared.js` - 공통 유틸리티 및 설정 관리
- `styles.css` - 공통 스타일시트

## Vercel 배포 방법

### 1. GitHub에 코드 업로드

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vercel에 배포

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (비워두기)
   - Output Directory: ./
5. **환경 변수 설정** (중요!):
   - Environment Variables 섹션에서 추가
   - **옵션 1 (권장)**: Google Gemini API (무료)
     - Key: `GEMINI_API_KEY`
     - Value: Gemini API 키 (아래 발급 방법 참고)
   - **옵션 2**: Hugging Face API (완전 무료)
     - Key: `HUGGING_FACE_API_KEY`
     - Value: Hugging Face API 키
6. "Deploy" 클릭

### 3. 배포 완료 후

- 배포된 URL에서 `index.html` 접속
- 관리자 페이지는 `admin.html`로 접속 (PIN: 2222)

### 4. 무료 AI API 키 발급 방법

#### Google Gemini API (권장 - 월 60회 무료)

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 키를 복사하여 Vercel 환경 변수에 설정
5. **무료 티어**: 월 60회 무료 호출 (충분히 사용 가능!)

#### Hugging Face API (완전 무료)

1. [Hugging Face](https://huggingface.co) 접속
2. 회원가입 및 로그인
3. Settings → Access Tokens 메뉴
4. "New token" 클릭하여 생성
5. 생성된 토큰을 복사하여 Vercel 환경 변수에 설정
6. **완전 무료**: 제한 없이 사용 가능 (단, 응답 속도가 느릴 수 있음)

**참고**: 
- Gemini API가 더 빠르고 품질이 좋아서 권장합니다
- API 키가 없으면 템플릿 기반으로 자동 폴백됩니다

## 로컬 개발

```bash
# 간단한 로컬 서버 실행
npx serve .
```

또는 Python을 사용:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

브라우저에서 `http://localhost:8000` 접속

## 설정 커스터마이징

`shared.js` 파일에서 다음 설정을 변경할 수 있습니다:

- `ADMIN_PIN`: 관리자 페이지 PIN (기본값: 2222)
- `CONFIG_SOURCE`: "local" 또는 "remote"
- `REMOTE_CONFIG_URL`: remote 모드일 때 config.json URL
- `DEMO_MODE`: 
  - `false` (기본값): AI API 사용 (Gemini 또는 Hugging Face)
  - `true`: 템플릿 기반 로컬 생성 (API 키 없이 테스트용)

## AI API 모델 변경

`api/generate.js` 파일에서 사용할 AI를 선택할 수 있습니다:
- **Google Gemini** (권장): 빠르고 품질 좋음, 월 60회 무료
- **Hugging Face**: 완전 무료, 응답 속도 느릴 수 있음

환경 변수에 `GEMINI_API_KEY` 또는 `HUGGING_FACE_API_KEY` 중 하나만 설정하면 됩니다.

## 라이선스

MIT
