# Vercel 배포 상세 가이드

## 준비사항 확인

✅ GitHub 저장소: https://github.com/nanunnanana-ops/naver_review_create
✅ 코드 푸시 완료
✅ Gemini API 키: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`

## 단계별 배포 가이드

### 1단계: Vercel 계정 만들기

1. **Vercel 웹사이트 접속**
   - https://vercel.com 접속

2. **회원가입/로그인**
   - "Sign Up" 또는 "Log In" 클릭
   - **GitHub로 로그인** 선택 (권장)
   - GitHub 계정으로 인증
   - Vercel이 GitHub 저장소에 접근할 수 있도록 권한 승인

### 2단계: 새 프로젝트 생성

1. **대시보드에서 프로젝트 추가**
   - 로그인 후 대시보드 화면에서
   - "Add New..." 버튼 클릭
   - 또는 상단의 "+ New Project" 버튼 클릭

2. **GitHub 저장소 선택**
   - "Import Git Repository" 섹션에서
   - GitHub 저장소 목록이 표시됨
   - `nanunnanana-ops/naver_review_create` 저장소 찾기
   - 저장소 옆의 "Import" 버튼 클릭

### 3단계: 프로젝트 설정

프로젝트를 Import하면 설정 화면이 나타납니다:

#### Framework Preset
- **선택**: `Other` 또는 `Other (No Framework)`
- (React, Next.js 등은 선택하지 마세요)

#### Root Directory
- **값**: `./` (기본값 그대로)
- 변경하지 않음

#### Build Command
- **값**: (비워두기)
- 아무것도 입력하지 않음

#### Output Directory
- **값**: `./` (기본값 그대로)
- 변경하지 않음

#### Install Command
- **값**: (기본값 그대로)
- `npm install` 또는 비워두기

### 4단계: 환경 변수 설정 (중요!)

1. **환경 변수 섹션 찾기**
   - 설정 화면 아래쪽에 "Environment Variables" 섹션 있음
   - 또는 "Advanced" 섹션 안에 있을 수 있음

2. **환경 변수 추가**
   - "Add" 또는 "+" 버튼 클릭
   - 다음 정보 입력:
     ```
     Key: GEMINI_API_KEY
     Value: AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg
     ```
   - **Environment 선택** (옵션이 보이면):
     - ✅ Production (체크)
     - ✅ Preview (체크)
     - ✅ Development (체크)
     - 세 가지 모두 선택!
   - **옵션이 안 보이면**: 그냥 Key와 Value만 입력하고 저장 (자동으로 모든 환경에 적용됨)

3. **저장**
   - "Add" 또는 "Save" 버튼 클릭

### 5단계: 배포 시작

1. **배포 버튼 클릭**
   - 화면 하단 또는 우측 상단의 "Deploy" 버튼 클릭

2. **배포 진행 확인**
   - 배포가 시작되면 진행 상황이 표시됨
   - "Building..." → "Deploying..." → "Ready" 순서로 진행
   - 약 1-2분 소요

### 6단계: 배포 완료 확인

1. **배포 완료 알림**
   - "Congratulations! Your project has been deployed" 메시지 표시
   - 배포된 URL이 표시됨
   - 예: `https://naver-review-create.vercel.app`

2. **프로젝트 대시보드**
   - 자동으로 프로젝트 대시보드로 이동
   - 배포 상태, 로그 등을 확인할 수 있음

### 7단계: 사이트 테스트

1. **메인 페이지 접속**
   - 배포된 URL 접속
   - 예: `https://naver-review-create.vercel.app/index.html`
   - 또는 `https://naver-review-create.vercel.app/` (자동으로 index.html로 리다이렉트)

2. **기능 테스트**
   - 메뉴 선택
   - "리뷰 3개 만들기" 버튼 클릭
   - Gemini AI가 리뷰를 생성하는지 확인

3. **관리자 페이지 테스트**
   - `https://naver-review-create.vercel.app/admin.html` 접속
   - PIN: `2222` 입력
   - 설정 페이지가 열리는지 확인

## 문제 해결

### 배포 실패 시

1. **로그 확인**
   - Vercel 대시보드 → 프로젝트 → "Deployments" 탭
   - 실패한 배포 클릭 → "Build Logs" 확인
   - 에러 메시지 확인

2. **일반적인 문제들**
   - **"Module not found"**: `package.json` 확인
   - **"API key not found"**: 환경 변수 설정 확인
   - **"404 Not Found"**: `index.html` 경로 확인

### API가 작동하지 않을 때

1. **환경 변수 확인**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - `GEMINI_API_KEY`가 제대로 설정되었는지 확인
   - 세 가지 Environment 모두 선택되었는지 확인

2. **재배포**
   - Settings에서 환경 변수를 수정했다면
   - Deployments 탭 → 최신 배포 → "..." 메뉴 → "Redeploy" 클릭

### 커스텀 도메인 설정 (선택사항)

1. **도메인 추가**
   - 프로젝트 → Settings → Domains
   - 원하는 도메인 입력
   - DNS 설정 안내 따르기

## 배포 후 관리

### 코드 업데이트 시

1. **로컬에서 수정**
   ```bash
   # 파일 수정 후
   git add .
   git commit -m "업데이트 내용"
   git push
   ```

2. **자동 재배포**
   - GitHub에 푸시하면 Vercel이 자동으로 감지
   - 자동으로 새 배포 시작
   - 약 1-2분 후 새 버전 배포 완료

### 환경 변수 수정 시

1. **Vercel 대시보드에서 수정**
   - Settings → Environment Variables
   - 수정 후 "Save" 클릭
   - **재배포 필요**: Deployments → 최신 배포 → Redeploy

## 유용한 기능

### 배포 이력 확인
- Deployments 탭에서 모든 배포 이력 확인
- 각 배포의 상태, 시간, 커밋 메시지 확인

### 로그 확인
- 각 배포의 "Logs" 버튼으로 빌드/런타임 로그 확인
- 에러 디버깅에 유용

### 프리뷰 배포
- Pull Request를 만들면 자동으로 프리뷰 URL 생성
- 프로덕션에 영향 없이 테스트 가능

## 비용

- **Hobby 플랜**: 완전 무료
- 제한: 월 100GB 대역폭, 무제한 배포
- 우리 프로젝트는 무료 플랜으로 충분!

## 다음 단계

배포가 완료되면:
1. ✅ 배포된 URL 확인
2. ✅ 사이트 테스트
3. ✅ 관리자 페이지 테스트
4. ✅ 친구들에게 공유!

문제가 있으면 Vercel 대시보드의 로그를 확인하거나 알려주세요!
