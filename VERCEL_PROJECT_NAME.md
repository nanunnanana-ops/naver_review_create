# Vercel 프로젝트 이름 변경

## 문제
"Project already exists, please use a new name" 오류가 발생했습니다.

## 해결 방법

### 방법 1: 프로젝트 이름 변경 (권장)

1. **프로젝트 이름 입력 필드 찾기**
   - 설정 화면에서 "Project Name" 또는 "Name" 필드 찾기
   - 현재 이름: `naver-review-create-frcx`

2. **새 이름 입력**
   - 예시:
     - `naver-review-generator`
     - `naver-review-creator`
     - `my-review-generator`
     - `review-generator-2024`
     - `naver-review-app`
   - 원하는 이름으로 변경

3. **저장 후 배포**
   - 이름 변경 후 "Deploy" 버튼 클릭

### 방법 2: 기존 프로젝트 사용

1. **기존 프로젝트 확인**
   - Vercel 대시보드로 이동
   - `naver-review-create-frcx` 프로젝트가 있는지 확인

2. **기존 프로젝트 사용**
   - 기존 프로젝트가 있다면:
     - 해당 프로젝트 클릭
     - Settings → Git
     - 저장소를 새로 연결하거나
     - Deployments → 새 배포 시작

### 방법 3: 기존 프로젝트 삭제 후 재생성

1. **기존 프로젝트 삭제**
   - Vercel 대시보드
   - `naver-review-create-frcx` 프로젝트 찾기
   - Settings → General → Delete Project
   - 삭제 확인

2. **새 프로젝트 생성**
   - 다시 Import
   - 같은 이름 사용 가능

## 추천 프로젝트 이름

- `naver-review-generator`
- `review-generator`
- `naver-review-creator`
- `my-review-app`
- `review-maker`

## 주의사항

- 프로젝트 이름은 고유해야 함
- 소문자, 숫자, 하이픈(-)만 사용 가능
- 공백 불가능
