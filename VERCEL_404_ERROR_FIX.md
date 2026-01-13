# Vercel 404 에러 해결 방법

## 문제
"404: NOT_FOUND" / "DEPLOYMENT_NOT_FOUND" 에러가 발생했습니다.

## 원인
1. 배포가 아직 완료되지 않음
2. 배포가 실패함
3. 잘못된 URL 접속
4. 배포가 삭제됨

## 해결 방법

### 1. Vercel 대시보드에서 배포 상태 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 로그인

2. **프로젝트 찾기**
   - 프로젝트 목록에서 배포한 프로젝트 찾기
   - 프로젝트 이름 클릭

3. **배포 상태 확인**
   - "Deployments" 탭 클릭
   - 최신 배포 상태 확인:
     - ✅ **Ready** (초록색) = 성공
     - ⏳ **Building** (노란색) = 진행 중
     - ❌ **Error** (빨간색) = 실패

### 2. 배포가 진행 중인 경우

- **"Building" 또는 "Deploying" 상태**
  - 1-2분 더 기다리기
  - 자동으로 완료됨
  - 완료되면 "Ready" 상태로 변경

### 3. 배포가 실패한 경우

- **"Error" 상태**
  1. **에러 로그 확인**
     - 배포 클릭 → "Logs" 탭
     - 에러 메시지 확인

  2. **일반적인 에러들**
     - **"Module not found"**: package.json 확인
     - **"Build failed"**: 설정 확인
     - **"API key not found"**: 환경 변수 확인

  3. **재배포**
     - "Redeploy" 버튼 클릭
     - 또는 Settings 수정 후 재배포

### 4. 올바른 URL 확인

1. **프로젝트 대시보드에서 URL 확인**
   - 프로젝트 대시보드 상단
   - "Domains" 섹션
   - 정확한 URL 확인
   - 예: `https://프로젝트명.vercel.app`

2. **올바른 경로로 접속**
   - 메인: `https://프로젝트명.vercel.app/`
   - 또는: `https://프로젝트명.vercel.app/index.html`
   - 관리자: `https://프로젝트명.vercel.app/admin.html`

### 5. 재배포 방법

#### 방법 1: 대시보드에서 재배포
1. 프로젝트 → Deployments
2. 최신 배포 클릭
3. "..." 메뉴 → "Redeploy"
4. 확인

#### 방법 2: GitHub에 푸시
```bash
# 코드 수정 (필요시)
git add .
git commit -m "Fix deployment"
git push
```
- GitHub에 푸시하면 자동으로 재배포됨

#### 방법 3: Vercel CLI로 재배포
```bash
vercel --prod
```

### 6. 환경 변수 확인

배포가 실패한 경우 환경 변수를 확인:

1. **Settings → Environment Variables**
2. `GEMINI_API_KEY` 확인
3. 값이 올바른지 확인
4. 수정 후 재배포

### 7. 프로젝트 설정 확인

1. **Settings → General**
2. 다음 확인:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (비워두기)
   - Output Directory: ./
   - Install Command: npm install (기본값)

## 빠른 해결 체크리스트

- [ ] Vercel 대시보드에서 배포 상태 확인
- [ ] 배포가 "Ready" 상태인지 확인
- [ ] 올바른 URL로 접속했는지 확인
- [ ] `/index.html` 경로로 접속 시도
- [ ] 배포가 실패했다면 로그 확인
- [ ] 환경 변수 설정 확인
- [ ] 재배포 시도

## 여전히 안 되면

1. **배포 로그 공유**
   - Deployments → 최신 배포 → Logs
   - 에러 메시지 복사

2. **프로젝트 설정 스크린샷**
   - Settings 화면 캡처

3. **새 프로젝트로 다시 시작**
   - 기존 프로젝트 삭제
   - 새로 Import
   - 다시 배포
