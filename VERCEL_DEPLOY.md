# Vercel 배포 가이드

## 필요한 것들

1. ✅ **코드 파일들** - 모두 준비됨
2. ⚠️ **Git 저장소** - 아직 없음 (지금 만들어야 함)
3. ⚠️ **GitHub 계정** - 필요
4. ⚠️ **Vercel 계정** - 필요 (무료)
5. ⚠️ **Gemini API 키** - 이미 있음: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`

## 배포 방법 (2가지)

### 방법 1: GitHub 연동 (권장)

#### 1단계: Git 저장소 초기화 및 GitHub 업로드

```bash
# Git 초기화
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: 네이버 리뷰 생성기"

# GitHub에 새 저장소 만들기 (웹에서)
# https://github.com/new 접속해서 저장소 생성

# GitHub 저장소 연결 (your-username과 your-repo-name을 실제 값으로 변경)
git remote add origin https://github.com/your-username/your-repo-name.git

# 업로드
git branch -M main
git push -u origin main
```

#### 2단계: Vercel에 배포

1. [Vercel](https://vercel.com) 접속 및 로그인 (GitHub로 로그인)
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (기본값)
   - **Build Command**: (비워두기)
   - **Output Directory**: `./` (기본값)
5. **환경 변수 추가**:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
   - Environment: Production, Preview, Development 모두 선택
6. "Deploy" 클릭
7. 배포 완료 후 URL 확인!

### 방법 2: Vercel CLI로 직접 배포 (빠름)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 로그인 (브라우저에서)
# 프로젝트 설정 질문에 답변:
# - Set up and deploy? → Y
# - Which scope? → 본인 계정 선택
# - Link to existing project? → N
# - Project name? → naver-review-generator (또는 원하는 이름)
# - Directory? → ./
# - Override settings? → N

# 환경 변수 추가
vercel env add GEMINI_API_KEY
# 프롬프트에 입력: AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg
# Environment 선택: Production, Preview, Development 모두 선택

# 배포
vercel --prod
```

## 배포 후 확인

1. 배포된 URL 접속 (예: `https://your-project.vercel.app`)
2. `index.html` 접속
3. 메뉴 선택 후 "리뷰 3개 만들기" 클릭
4. Gemini AI가 리뷰 생성하는지 확인!

## 문제 해결

- **배포 실패**: `package.json`이 있는지 확인
- **API 작동 안 함**: Vercel 환경 변수 확인
- **404 에러**: `index.html`로 직접 접속
