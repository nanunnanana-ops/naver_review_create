# 배포 가이드

## Vercel 환경 변수 설정

### 방법 1: Vercel 대시보드에서 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴
4. 다음 환경 변수 추가:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: (Google AI Studio에서 발급받은 API 키 입력)
   - **Environment**: Production, Preview, Development 모두 선택
5. "Save" 클릭
6. 재배포 (Deployments → 최신 배포 → "Redeploy")

### 방법 2: Vercel CLI로 설정

```bash
# Vercel CLI 설치 (이미 설치했다면 생략)
npm i -g vercel

# 환경 변수 추가
vercel env add GEMINI_API_KEY

# 프롬프트에 키 입력: (Google AI Studio에서 발급받은 API 키 입력)
# Environment 선택: Production, Preview, Development 모두 선택

# 재배포
vercel --prod
```

## 로컬 테스트 (선택사항)

로컬에서 테스트하려면:

1. `.env.local` 파일 생성 (프로젝트 루트에)
2. 다음 내용 추가:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**주의**: `.env.local` 파일은 Git에 커밋하지 마세요! (이미 .gitignore에 포함됨)

## 배포 후 확인

배포가 완료되면:
1. `https://your-project.vercel.app/index.html` 접속
2. 메뉴 선택 후 "리뷰 3개 만들기" 클릭
3. AI가 생성한 리뷰가 표시되는지 확인

## 문제 해결

- API 키가 작동하지 않으면: Vercel 환경 변수가 제대로 설정되었는지 확인
- 재배포 후에도 안 되면: Vercel 대시보드에서 환경 변수 확인 후 재배포
