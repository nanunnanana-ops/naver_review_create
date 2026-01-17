# API 키 이름 관련 정보

## 중요: 이름은 상관없습니다!

**API 키의 이름은 단지 관리용 라벨일 뿐입니다.**
- "Default Gemini API Key"
- "My API Key"
- "Production Key"

어떤 이름이든 상관없습니다.

## 중요한 것은 값(Value)

Vercel 환경 변수에 설정할 때는:
- **Key**: `GEMINI_API_KEY` (변수 이름)
- **Value**: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg` (실제 API 키 값)

이 두 가지만 중요합니다!

## 확인 사항

### 현재 API 키
- 화면에 표시된 값: `AlzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
- 처음에 제공받은 값: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`

**주의**: 첫 글자가 "AIza"인지 "Alza"인지 확인해주세요!

올바른 값: `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`

### Vercel 환경 변수 확인

1. **Settings → Environment Variables**
2. **`GEMINI_API_KEY` 확인**
3. **값이 정확한지 확인**:
   - `AIzaSyAQ2mhRaor0A7X3cgdrZcKW55vY8eJuEZg`
   - 대소문자 정확히 일치해야 함
   - 공백이나 잘못된 문자 없어야 함

4. **없으면 추가하고 재배포**

## 결론

- ✅ 이름은 바꿀 필요 없음
- ✅ 값이 정확한지 확인
- ✅ Vercel 환경 변수에 올바르게 설정되어 있는지 확인
