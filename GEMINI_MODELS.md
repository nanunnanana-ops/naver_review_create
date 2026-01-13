# Gemini API 무료 모델 정보

## 무료 티어에서 사용 가능한 모델

### 1. gemini-pro (레거시 - 가장 안정적)
- 무료 티어에서 사용 가능
- 안정적이고 검증됨
- API 엔드포인트: `gemini-pro:generateContent`

### 2. gemini-1.5-flash (최신 - 빠르고 저렴)
- 무료 티어에서 사용 가능
- gemini-pro보다 빠르고 저렴
- API 엔드포인트: `gemini-1.5-flash:generateContent`

### 3. gemini-1.5-pro (더 강력하지만 제한적)
- 무료 티어에서 제한적
- 더 높은 품질이지만 무료 할당량 적음

## 권장 사항

### 안정성을 위해
- **gemini-pro** 사용 (레거시, 가장 안정적)

### 속도와 비용을 위해
- **gemini-1.5-flash** 사용 (최신, 빠르고 저렴)

## 현재 설정

코드에서 사용 중인 모델:
- `gemini-1.5-flash` → `gemini-pro`로 변경 중

## 모델 변경 방법

`api/generate.js` 파일에서:
```javascript
// gemini-1.5-flash
models/gemini-1.5-flash:generateContent

// gemini-pro (더 안정적)
models/gemini-pro:generateContent
```

## 무료 티어 제한

- 월 60회 무료 호출
- 두 모델 모두 무료 티어에서 사용 가능
- gemini-pro가 더 안정적이고 검증됨
