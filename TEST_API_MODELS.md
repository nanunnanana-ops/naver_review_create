# Gemini API 모델 테스트

## v1beta API에서 사용 가능한 모델 확인

에러 메시지: "models/gemini-pro is not found for API version v1beta"

## 가능한 해결 방법

1. **gemini-1.5-flash** (현재 시도 중)
2. **API 버전 변경**: v1beta → v1
3. **모델명 형식 확인**: 정확한 모델명 확인 필요

## 확인 필요 사항

Google AI Studio나 API 문서에서 정확한 모델명 확인 필요:
- v1beta에서 지원하는 모델 목록
- 정확한 엔드포인트 형식
