# Vercel 수동 배포 방법

## Clear Filters를 눌러도 반응이 없을 때

이것은 **배포가 실제로 없는 상태**를 의미합니다.
배포를 수동으로 시작해야 합니다.

## 해결 방법

### 방법 1: Vercel 대시보드에서 배포 (가장 간단)

1. **프로젝트 페이지로 이동**
   - Vercel 대시보드에서 프로젝트 클릭
   - 또는 상단 메뉴에서 프로젝트 선택

2. **"Deploy" 버튼 찾기**
   - 프로젝트 페이지 상단
   - 또는 우측 상단
   - "Deploy" 또는 "Deploy Now" 버튼 클릭

3. **배포 시작**
   - 버튼 클릭하면 배포 시작
   - "Building..." 상태로 변경됨

### 방법 2: Settings에서 Git 연결 확인 후 배포

1. **Settings → Git 확인**
   - GitHub 저장소가 연결되어 있는지 확인
   - 연결 안 되어 있다면:
     - "Connect Git Repository" 클릭
     - `nanunnanana-ops/naver_review_create` 선택
     - 연결

2. **연결 후 자동 배포**
   - GitHub에 푸시하면 자동 배포
   - 또는 수동으로 "Deploy" 클릭

### 방법 3: Vercel CLI로 배포 (확실한 방법)

터미널에서 실행:

```bash
# Vercel CLI 설치 (없다면)
npm i -g vercel

# 로그인
vercel login

# 프로젝트 디렉토리에서
vercel

# 질문에 답변:
# - Set up and deploy? → Y
# - Which scope? → 본인 계정 선택
# - Link to existing project? → Y (기존 프로젝트에 연결)
# - What's the name of your existing project? → 프로젝트 이름 입력
# - 또는 N (새 프로젝트 생성)

# 환경 변수 추가
vercel env add GEMINI_API_KEY
# 프롬프트에 입력: AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg
# Environment: Production, Preview, Development 모두 선택

# 프로덕션 배포
vercel --prod
```

### 방법 4: GitHub에 다시 푸시 (자동 배포 트리거)

```bash
# 작은 변경사항 추가
echo "" >> README.md
git add README.md
git commit -m "Trigger deployment"
git push
```

## 배포 버튼을 찾을 수 없을 때

### 프로젝트 페이지 확인

1. **프로젝트 대시보드로 이동**
   - Vercel 대시보드 → 프로젝트 클릭

2. **다른 탭 확인**
   - "Overview" 탭
   - "Deployments" 탭
   - "Settings" 탭

3. **상단 메뉴 확인**
   - 우측 상단에 "Deploy" 버튼이 있을 수 있음

## 프로젝트가 제대로 생성되었는지 확인

1. **프로젝트 목록 확인**
   - Vercel 대시보드에서 프로젝트가 있는지 확인
   - 프로젝트 이름 확인

2. **프로젝트가 없다면**
   - "Add New..." → "Project"
   - GitHub 저장소 Import
   - 설정 후 Deploy

## 가장 확실한 방법: Vercel CLI 사용

웹에서 버튼을 찾기 어렵다면 CLI가 가장 확실합니다:

```bash
vercel --prod
```

이 명령어로 바로 배포할 수 있습니다.
