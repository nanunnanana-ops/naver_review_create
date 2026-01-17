# 빠른 재배포 가이드

## 자동 재배포 확인

GitHub에 푸시하면 Vercel이 **자동으로 재배포**합니다.
- 보통 1-2분 소요
- Deployments 탭에서 "Building" → "Ready" 상태로 변경됨

## 수동 재배포 방법 (필요 시)

### 방법 1: Vercel 대시보드에서

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 클릭**
   - 배포한 프로젝트 선택

3. **Deployments 탭**
   - 상단 메뉴에서 "Deployments" 클릭

4. **재배포 실행**
   - 최신 배포의 오른쪽 "..." 메뉴 클릭
   - "Redeploy" 선택
   - "Redeploy" 버튼 클릭

5. **대기**
   - "Building" 상태 확인
   - 1-2분 후 "Ready" 상태로 변경
   - 완료되면 새 버전 반영됨

### 방법 2: 빈 커밋 푸시 (Git 사용)

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## 배포 완료 확인

1. **Deployments 탭에서**
   - 최신 배포 상태가 "Ready" (초록색)인지 확인

2. **사이트 접속 테스트**
   - 관리자 페이지 접속
   - 변경사항 확인

## 문제 해결

### 재배포가 안 될 때
- Vercel 대시보드 → Settings → Git
- GitHub 연결 상태 확인
- 연결이 끊어졌다면 다시 연결

### 배포가 실패할 때
- Deployments → 실패한 배포 클릭 → "Logs" 탭
- 에러 메시지 확인
- 에러 해결 후 재배포
