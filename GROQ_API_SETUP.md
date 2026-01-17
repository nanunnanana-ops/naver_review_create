# Groq API 설정 가이드

## Groq API로 변경 완료

코드가 Groq API를 사용하도록 변경되었습니다.

## Groq API 키 발급 방법

1. **Groq 웹사이트 접속**
   - https://console.groq.com 접속
   - 또는 https://groq.com

2. **회원가입/로그인**
   - Google 계정 또는 이메일로 가입
   - 무료 계정 생성

3. **API 키 발급**
   - 대시보드에서 "API Keys" 메뉴
   - "Create API Key" 클릭
   - API 키 복사

## Vercel 환경 변수 설정

### 환경 변수 변경

**기존 (Gemini):**
- Key: `GEMINI_API_KEY`

**변경 후 (Groq):**
- Key: `GROQ_API_KEY`
- Value: (Groq에서 발급받은 API 키)

### 설정 방법

1. **Vercel 대시보드**
   - 프로젝트 → Settings → Environment Variables

2. **기존 GEMINI_API_KEY 제거** (선택사항)
   - 더 이상 사용하지 않으면 제거 가능

3. **GROQ_API_KEY 추가**
   - Key: `GROQ_API_KEY`
   - Value: (Groq API 키)
   - Environment: Production, Preview, Development 모두 선택

4. **재배포**
   - Deployments → 최신 배포 → "..." → "Redeploy"

## Groq API 장점

- ✅ **매우 관대한 무료 티어**
- ✅ **빠른 응답 속도**
- ✅ **OpenAI-compatible API** (표준 형식)
- ✅ **Llama 모델 사용** (오픈소스)

## 사용 모델

- `llama-3.1-8b-instant`: 빠르고 무료 티어 친화적
