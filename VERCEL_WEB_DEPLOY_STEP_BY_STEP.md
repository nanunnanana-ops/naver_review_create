# Vercel 웹에서 배포하기 (단계별)

## 정확한 배포 방법

### 1단계: Vercel 대시보드 접속
1. https://vercel.com/dashboard 접속
2. 로그인

### 2단계: 프로젝트 찾기 또는 생성

#### 프로젝트가 이미 있다면:
- 프로젝트 목록에서 찾기
- 프로젝트 클릭

#### 프로젝트가 없다면:
1. "Add New..." 버튼 클릭
2. "Project" 선택
3. "Import Git Repository" 클릭
4. `nanunnanana-ops/naver_review_create` 찾기
5. "Import" 클릭

### 3단계: 프로젝트 설정 (Import 시)

1. **Framework Preset**
   - 드롭다운 클릭
   - "Other" 또는 "Other (No Framework)" 선택

2. **Root Directory**
   - `./` (기본값, 변경 안 함)

3. **Build Command**
   - 비워두기 (아무것도 입력 안 함)

4. **Output Directory**
   - `./` (기본값, 변경 안 함)

5. **Environment Variables** (중요!)
   - "Environment Variables" 섹션 찾기
   - "Add" 또는 "+" 버튼 클릭
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
   - 저장

### 4단계: 배포 시작

1. **"Deploy" 버튼 찾기**
   - 화면 하단 또는 우측 상단
   - 파란색 "Deploy" 버튼
   - 또는 "Deploy Project" 버튼

2. **클릭**
   - 배포 시작!

### 5단계: 배포 완료 대기

1. **Deployments 탭 확인**
   - "Building..." → "Deploying..." → "Ready"
   - 약 1-2분 소요

2. **완료 후**
   - 배포된 URL 확인
   - 예: `https://프로젝트명.vercel.app`

## 프로젝트가 이미 있는 경우

### 배포 버튼 찾기

1. **프로젝트 페이지에서**
   - 상단 메뉴 확인
   - "Deploy" 또는 "Redeploy" 버튼 찾기

2. **Deployments 탭에서**
   - "Redeploy" 버튼 클릭

3. **Settings에서**
   - Git 연결 확인
   - 연결 안 되어 있다면 연결

## 문제 해결

### 배포 버튼이 안 보일 때

1. **프로젝트가 제대로 생성되었는지 확인**
   - 프로젝트 목록에 있는지 확인

2. **다른 브라우저로 시도**
   - Chrome, Firefox, Edge 등

3. **페이지 새로고침**
   - F5 키

### Git 연결 확인

1. **Settings → Git**
2. GitHub 저장소 연결 확인
3. 연결 안 되어 있다면:
   - "Connect Git Repository" 클릭
   - `nanunnanana-ops/naver_review_create` 선택

## 가장 확실한 방법

1. **프로젝트 삭제 후 재생성**
   - Settings → General → Delete Project
   - "Add New..." → "Project"
   - 저장소 Import
   - 설정 후 Deploy

2. **또는 새 프로젝트 생성**
   - 기존 프로젝트는 그대로 두고
   - 새 프로젝트로 다시 Import
