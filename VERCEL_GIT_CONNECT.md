# Vercel GitHub 저장소 연결하기

## 문제
프로젝트에 "No Production Deployment"가 표시되고, GitHub 저장소가 연결되어 있지 않습니다.

## 해결 방법

### 방법 1: 프로젝트에서 Git 연결

1. **프로젝트 클릭**
   - "naver-review-create" 프로젝트 클릭
   - (또는 원하는 프로젝트)

2. **Settings로 이동**
   - 프로젝트 페이지 상단 메뉴
   - "Settings" 탭 클릭

3. **Git 연결**
   - 왼쪽 메뉴에서 "Git" 클릭
   - "Connect Git Repository" 버튼 클릭
   - 또는 "Connect Repository" 버튼

4. **저장소 선택**
   - GitHub 저장소 목록 표시
   - `nanunnanana-ops/naver_review_create` 찾기
   - 선택 또는 "Connect" 클릭

5. **연결 완료**
   - 저장소가 연결되면 자동으로 배포 시작될 수 있음
   - 또는 수동으로 배포 필요

### 방법 2: Deployments에서 배포 시작

Git 연결 후에도 배포가 자동으로 시작되지 않으면:

1. **Deployments 탭 클릭**
2. **"Deploy" 또는 "Redeploy" 버튼 클릭**
3. 배포 시작!

### 방법 3: 기존 프로젝트 사용

이미 GitHub가 연결된 프로젝트가 있다면:

1. **"naver-review-create" 프로젝트 클릭**
2. **Deployments 탭 확인**
3. **"Deploy" 또는 "Redeploy" 버튼 클릭**

## 빠른 해결

1. 프로젝트 클릭 → Settings → Git
2. "Connect Git Repository" 클릭
3. `nanunnanana-ops/naver_review_create` 선택
4. 연결 완료
5. Deployments 탭 → "Deploy" 클릭

## 확인

Git 연결 후:
- ✅ 프로젝트에 GitHub 저장소 표시됨
- ✅ Deployments 탭에서 배포 가능
- ✅ GitHub에 푸시하면 자동 배포
