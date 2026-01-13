# GitHub 연결 완료 - 배포 시작하기

## 현재 상태
✅ GitHub 저장소 연결됨: `nanunnanana-ops/naver_review_create`
✅ "Connected 31m ago" - 연결 완료

## 다음 단계: 배포 시작

### 방법 1: Deployments 탭에서 배포

1. **프로젝트 페이지로 이동**
   - 좌측 상단의 프로젝트 이름 클릭
   - 또는 "← Back" 버튼

2. **"Deployments" 탭 클릭**
   - 프로젝트 페이지 상단 메뉴

3. **"Deploy" 버튼 클릭**
   - 또는 "Redeploy" 버튼
   - 배포 시작!

### 방법 2: GitHub에 다시 푸시 (자동 배포)

GitHub에 푸시하면 자동으로 배포가 시작됩니다:

```bash
# 작은 변경사항 추가
echo "" >> README.md
git add README.md
git commit -m "Trigger deployment"
git push
```

### 방법 3: Settings에서 배포 확인

1. **Settings → General**
2. 프로젝트 설정 확인:
   - Framework Preset: Other
   - Build Command: (비워두기)
   - Output Directory: ./

## 환경 변수 확인 (중요!)

배포 전에 환경 변수를 확인하세요:

1. **Settings → Environment Variables**
2. `GEMINI_API_KEY` 확인:
   - 없으면 추가: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
   - 있으면 값 확인

## 배포 후

배포가 시작되면:
1. Deployments 탭에서 상태 확인
2. "Building..." → "Deploying..." → "Ready"
3. 배포된 URL 확인
4. 사이트 접속 테스트
