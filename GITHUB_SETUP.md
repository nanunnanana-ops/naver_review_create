# GitHub 저장소 만들기 가이드

## 1단계: GitHub에 저장소 생성

1. https://github.com/new 접속
2. 로그인 (GitHub 계정 필요)
3. 저장소 정보 입력:
   - **Repository name**: `naver-review-generator` (또는 원하는 이름)
   - **Description**: (선택사항) "네이버 영수증 리뷰 문구 생성기"
   - **Public** 또는 **Private** 선택
   - **Initialize this repository with** 체크박스는 모두 해제 (이미 로컬에 파일이 있으므로)
4. "Create repository" 클릭

## 2단계: 저장소 URL 확인

생성 후 나오는 페이지에서 URL을 복사합니다:
- 예: `https://github.com/사용자명/naver-review-generator.git`

## 3단계: 로컬에서 연결

아래 명령어를 실행하세요 (URL은 위에서 복사한 것으로 변경):

```bash
git remote add origin https://github.com/사용자명/저장소명.git
git branch -M main
git push -u origin main
```

## 예시

만약 GitHub 사용자명이 `khj88`이고 저장소명이 `naver-review-generator`라면:

```bash
git remote add origin https://github.com/khj88/naver-review-generator.git
git branch -M main
git push -u origin main
```

## 문제 해결

- **"remote origin already exists" 오류**: 
  ```bash
  git remote remove origin
  git remote add origin https://github.com/사용자명/저장소명.git
  ```

- **인증 오류**: GitHub Personal Access Token 필요할 수 있음
