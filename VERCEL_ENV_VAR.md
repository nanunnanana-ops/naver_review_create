# Vercel 환경 변수 설정 가이드

## 환경 변수 추가 방법

### 방법 1: 프로젝트 Import 시 추가

1. 프로젝트 Import 화면에서
2. "Environment Variables" 섹션 찾기
3. "Add" 또는 "+" 버튼 클릭
4. 입력:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
5. Environment 선택 옵션이 **보이면**: Production, Preview, Development 모두 선택
6. Environment 선택 옵션이 **안 보이면**: 그냥 저장 (자동으로 모든 환경에 적용됨)
7. "Add" 또는 "Save" 클릭

### 방법 2: 배포 후 Settings에서 추가

1. 프로젝트 대시보드로 이동
2. 상단 메뉴에서 **"Settings"** 클릭
3. 왼쪽 메뉴에서 **"Environment Variables"** 클릭
4. "Add New" 버튼 클릭
5. 입력:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
6. Environment 선택 (이 경우 보통 옵션이 표시됨):
   - Production
   - Preview  
   - Development
   - 모두 선택하거나, 최소한 Production은 선택
7. "Save" 클릭
8. **중요**: 재배포 필요!
   - Deployments 탭 → 최신 배포 → "..." 메뉴 → "Redeploy"

## 확인 방법

환경 변수가 제대로 설정되었는지 확인:

1. Settings → Environment Variables
2. `GEMINI_API_KEY`가 목록에 있는지 확인
3. 값이 올바른지 확인 (마스킹되어 있을 수 있음)

## 문제 해결

### 환경 변수가 작동하지 않을 때

1. **재배포 확인**
   - 환경 변수를 추가/수정했다면 반드시 재배포 필요
   - Deployments → 최신 배포 → Redeploy

2. **환경 변수 이름 확인**
   - 정확히 `GEMINI_API_KEY`인지 확인 (대소문자 구분)
   - 오타가 없는지 확인

3. **API 키 확인**
   - Gemini API 키가 유효한지 확인
   - https://aistudio.google.com/app/apikey 에서 확인

## 참고

- 환경 변수는 배포 시점에 주입됩니다
- 환경 변수를 변경했다면 반드시 재배포해야 적용됩니다
- Production 환경만 설정해도 대부분의 경우 충분합니다
