# LocalStorage 디버깅 가이드

## 브라우저에서 직접 확인하는 방법

### 방법 1: 개발자 도구에서 확인

1. **관리자 페이지 또는 메인 페이지 접속**
   - https://your-site.vercel.app/admin.html
   - 또는 https://your-site.vercel.app/

2. **개발자 도구 열기**
   - `F12` 키 누르기
   - 또는 `우클릭 → 검사`

3. **Application 탭으로 이동**
   - 개발자 도구 상단 메뉴에서 "Application" 탭 클릭
   - (Chrome 기준, Firefox는 "Storage" 탭)

4. **Local Storage 확인**
   - 왼쪽 메뉴에서 "Local Storage" 펼치기
   - 사이트 URL 클릭 (예: `https://your-site.vercel.app`)
   - `reviewGeneratorConfig` 키 찾기

5. **값 확인**
   - `reviewGeneratorConfig` 클릭
   - 오른쪽에 JSON 값이 표시됨
   - `requiredKeywords` 배열 확인
   - 필수 키워드 개수 확인

### 방법 2: Console에서 직접 확인

1. **개발자 도구 Console 탭 열기**

2. **다음 명령어 입력하여 확인**:

```javascript
// 저장된 설정 확인
const saved = localStorage.getItem('reviewGeneratorConfig');
console.log('저장된 JSON:', saved);

// 파싱하여 확인
if (saved) {
  const parsed = JSON.parse(saved);
  console.log('필수 키워드:', parsed.requiredKeywords);
  console.log('필수 키워드 개수:', parsed.requiredKeywords ? parsed.requiredKeywords.length : 0);
  console.log('전체 설정:', parsed);
}
```

3. **수동으로 저장 테스트**:

```javascript
// 테스트 설정 저장
const testConfig = {
  storeName: "어국수",
  requiredKeywords: ["어국수", "국물", "시원", "깔끔"],
  promoKeywordsPool: ["시원", "깔끔", "매콤"],
  menus: ["어묵국수", "얼큰바지락국수"],
  sides: ["소주", "맥주", "없음"],
  lengthOptions: { short: 2, normal: 3, long: 4 },
  ui: {
    themeBg: "#FDFBF8",
    accent: "#C0362C",
    subtitle: "테스트"
  }
};

localStorage.setItem('reviewGeneratorConfig', JSON.stringify(testConfig));
console.log('저장 완료!');

// 확인
const verify = JSON.parse(localStorage.getItem('reviewGeneratorConfig'));
console.log('확인 - 필수 키워드:', verify.requiredKeywords);
console.log('확인 - 필수 키워드 개수:', verify.requiredKeywords.length);
```

4. **LocalStorage 삭제 (필요 시)**:

```javascript
localStorage.removeItem('reviewGeneratorConfig');
console.log('삭제 완료!');
```

### 방법 3: 관리자 페이지에서 확인

1. **관리자 페이지 접속**
   - PIN 입력: `2222`

2. **필수 키워드 필드 확인**
   - 현재 표시된 값 확인
   - 쉼표로 구분된 키워드 확인

3. **저장 후 Console 확인**
   - 개발자 도구 Console 열기
   - "저장할 필수 키워드:" 메시지 확인
   - "저장된 필수 키워드:" 메시지 확인

## 문제 진단

### 필수 키워드가 2개만 저장되는 경우

1. **Console에서 확인**:
   - "파싱된 필수 키워드:" 메시지에서 몇 개가 나오는지 확인
   - "저장할 필수 키워드:" 메시지에서 몇 개가 나오는지 확인

2. **Application 탭에서 확인**:
   - `reviewGeneratorConfig` 값 직접 확인
   - `requiredKeywords` 배열에 몇 개가 있는지 확인

3. **가능한 원인**:
   - 입력 필드에서 파싱이 잘못됨
   - 저장 시 배열이 잘못 처리됨
   - 로드 시 기본값으로 덮어쓰임

## 해결 방법

### 1. LocalStorage 초기화 후 재시도

Console에서:
```javascript
localStorage.removeItem('reviewGeneratorConfig');
location.reload(); // 페이지 새로고침
```

### 2. 수동으로 올바른 값 저장

Console에서:
```javascript
// 현재 config 가져오기
let config = { ...DEFAULT_CONFIG };
config.requiredKeywords = ["어국수", "국물", "시원", "깔끔", "추가키워드"];
localStorage.setItem('reviewGeneratorConfig', JSON.stringify(config));
location.reload();
```

### 3. 관리자 페이지에서 다시 저장

- LocalStorage 삭제 후
- 관리자 페이지에서 필수 키워드 입력
- "저장 (로컬)" 버튼 클릭
