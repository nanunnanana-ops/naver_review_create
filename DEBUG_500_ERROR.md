# 500 Internal Server Error 해결 방법

## 에러 확인

Network 탭에서 `/api/generate` 요청이 **500 Internal Server Error**를 반환하고 있습니다.

## 해결 방법

### 1. Response 탭에서 에러 메시지 확인

1. **Network 탭에서 `generate` 요청 클릭**
2. **Response 탭 확인**
3. **에러 메시지 확인**:
   - JSON 형식의 에러 메시지가 표시됨
   - `error`, `message` 필드 확인

### 2. Vercel Function 로그 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 클릭

2. **Deployments → 최신 배포 클릭**
3. **Functions 탭 또는 Logs 탭**
4. **에러 로그 확인**:
   - "API 키가 없어 템플릿 기반 생성 사용"
   - "Gemini API error: ..."
   - 기타 에러 메시지

### 3. 가능한 원인 및 해결

#### 원인 1: 환경 변수 없음

**증상:**
- 로그: "API 키가 없어 템플릿 기반 생성 사용"
- Response: "API 키가 설정되지 않았습니다"

**해결:**
1. Settings → Environment Variables
2. `GEMINI_API_KEY` 추가: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
3. 재배포

#### 원인 2: Gemini API 호출 실패

**증상:**
- 로그: "Gemini API error: ..."
- Response: "리뷰 생성에 실패했습니다"

**해결:**
- API 키 확인
- Gemini API 서버 상태 확인
- API 호출 코드 확인

#### 원인 3: 코드 오류

**증상:**
- 로그에 스택 트레이스 표시
- 예상치 못한 에러

**해결:**
- Vercel 로그에서 상세 에러 확인
- 코드 수정 후 재배포

## 빠른 확인 체크리스트

- [ ] Network 탭 → generate 요청 → Response 탭 확인
- [ ] Vercel Function 로그 확인
- [ ] 환경 변수 설정 확인
- [ ] 재배포 여부 확인

## 다음 단계

1. **Response 탭에서 에러 메시지 복사**
2. **Vercel Function 로그 확인**
3. **에러 메시지를 알려주시면 정확히 해결 가능**

Network 탭의 Response를 확인하거나 Vercel Function 로그를 확인해주세요!
