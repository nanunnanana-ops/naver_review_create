/**
 * shared.js - 공통 유틸리티 및 설정 관리
 * 
 * 커스텀 포인트:
 * - ADMIN_PIN: 관리자 페이지 접근 PIN (기본값: 2222)
 * - CONFIG_SOURCE: "local" | "remote" - 설정 저장/로드 방식
 * - REMOTE_CONFIG_URL: remote 모드일 때 config.json URL
 * - DEMO_MODE: true면 서버 없이 로컬에서 리뷰 생성
 */

// ========== 커스텀 설정 ==========
const ADMIN_PIN = '2222';
const CONFIG_SOURCE = 'local'; // 'local' 또는 'remote'
const REMOTE_CONFIG_URL = './config.json'; // remote 모드일 때 사용
const DEMO_MODE = false; // false면 AI API 사용 (Gemini/Hugging Face), true면 템플릿 기반 (로컬 테스트용)

// ========== 기본 설정 ==========
const DEFAULT_CONFIG = {
  storeName: "어국수",
  requiredKeywords: ["어국수", "국물"],
  promoKeywordsPool: ["시원", "깔끔", "매콤", "어묵국수"],
  menus: ["어묵국수", "얼큰바지락국수", "소갈비국수", "잔치국수"],
  sides: ["소주", "맥주", "김치전", "부추전", "없음"],
  lengthOptions: {
    short: 2,
    normal: 3,
    long: 4
  },
  ui: {
    themeBg: "#FDFBF8",
    accent: "#C0362C",
    subtitle: "복사해서 네이버 영수증 리뷰에 붙여넣기만 하세요"
  }
};

// ========== 설정 로드 ==========
async function loadConfig() {
  if (CONFIG_SOURCE === 'remote') {
    try {
      const response = await fetch(REMOTE_CONFIG_URL);
      if (!response.ok) throw new Error('설정 파일을 불러올 수 없습니다');
      const config = await response.json();
      return { ...DEFAULT_CONFIG, ...config };
    } catch (error) {
      console.error('Remote config load failed:', error);
      // 실패 시 localStorage에서 로드 시도
      const localConfig = loadConfigFromLocal();
      return localConfig || DEFAULT_CONFIG;
    }
  } else {
    return loadConfigFromLocal();
  }
}

function loadConfigFromLocal() {
  try {
    const saved = localStorage.getItem('reviewGeneratorConfig');
    console.log('localStorage에서 읽은 원본 데이터:', saved);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('파싱된 설정:', parsed);
      console.log('파싱된 필수 키워드:', parsed.requiredKeywords);
      console.log('파싱된 필수 키워드 타입:', typeof parsed.requiredKeywords, Array.isArray(parsed.requiredKeywords));
      
      // parsed 값이 있으면 그대로 사용 (병합하지 않음 - 저장된 값이 우선)
      // 단, 배열 필드는 안전하게 처리
      const merged = {
        ...DEFAULT_CONFIG,
        ...parsed,
        // 배열 필드는 명시적으로 저장된 값 사용 (없으면 기본값)
        requiredKeywords: Array.isArray(parsed.requiredKeywords) && parsed.requiredKeywords.length > 0
          ? parsed.requiredKeywords
          : (parsed.requiredKeywords || DEFAULT_CONFIG.requiredKeywords),
        promoKeywordsPool: Array.isArray(parsed.promoKeywordsPool) && parsed.promoKeywordsPool.length > 0
          ? parsed.promoKeywordsPool
          : (parsed.promoKeywordsPool || DEFAULT_CONFIG.promoKeywordsPool),
        menus: Array.isArray(parsed.menus) && parsed.menus.length > 0
          ? parsed.menus
          : (parsed.menus || DEFAULT_CONFIG.menus),
        sides: Array.isArray(parsed.sides) && parsed.sides.length > 0
          ? parsed.sides
          : (parsed.sides || DEFAULT_CONFIG.sides),
      };
      
      console.log('병합된 설정:', merged);
      console.log('병합된 필수 키워드:', merged.requiredKeywords);
      console.log('병합된 필수 키워드 개수:', merged.requiredKeywords ? merged.requiredKeywords.length : 0);
      
      return merged;
    }
  } catch (error) {
    console.error('Local config load failed:', error);
  }
  
  console.log('기본 설정 사용:', DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

// ========== 설정 저장 ==========
function saveConfig(config) {
  if (CONFIG_SOURCE === 'remote') {
    // remote 모드는 다운로드만 제공 (admin.js에서 처리)
    return false;
  } else {
    try {
      console.log('saveConfig 호출됨 - 저장할 설정:', config);
      console.log('저장할 필수 키워드:', config.requiredKeywords);
      console.log('저장할 필수 키워드 타입:', typeof config.requiredKeywords, Array.isArray(config.requiredKeywords));
      
      const jsonString = JSON.stringify(config);
      console.log('JSON 문자열로 변환:', jsonString);
      console.log('JSON 문자열 길이:', jsonString.length);
      
      localStorage.setItem('reviewGeneratorConfig', jsonString);
      
      // 저장 후 즉시 확인
      const verify = localStorage.getItem('reviewGeneratorConfig');
      const verifyParsed = JSON.parse(verify);
      console.log('저장 후 확인 - 읽은 값:', verifyParsed);
      console.log('저장 후 확인 - 필수 키워드:', verifyParsed.requiredKeywords);
      console.log('저장 후 확인 - 필수 키워드 개수:', verifyParsed.requiredKeywords ? verifyParsed.requiredKeywords.length : 0);
      
      return true;
    } catch (error) {
      console.error('Local config save failed:', error);
      console.error('에러 스택:', error.stack);
      return false;
    }
  }
}

// ========== 설정 다운로드 ==========
function downloadConfig(config) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========== 유틸리티 함수 ==========
function parseCommaSeparated(str) {
  if (!str || typeof str !== 'string') {
    return [];
  }
  const result = str.split(',').map(s => s.trim()).filter(s => s.length > 0);
  console.log('parseCommaSeparated 입력:', str, '결과:', result);
  return result;
}

function parseNewlineOrComma(str) {
  return str.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
}

function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    animation: fadeIn 0.3s;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}

// ========== 리뷰 생성 (데모 모드) ==========
// 35글자 내외로 자연스러운 리뷰 생성
function generateReviewsDemo(storeName, menus, sides, keywordsBundle) {
  // 메뉴 텍스트 생성 (복수 선택 시)
  const menuText = menus.length === 1 ? menus[0] : menus.join('과 ');
  
  // 사이드 텍스트 생성
  const sideText = sides.length > 0 ? sides.join(', ') : '';
  
  // 키워드 풀에서 자연스럽게 사용할 키워드 선택
  const usedKeywords = [...keywordsBundle].sort(() => Math.random() - 0.5);
  
  // 다양한 말투의 템플릿 (35글자 내외)
  const templates = [
    // 스타일 1: 간단하고 담백한 말투
    () => {
      const k1 = usedKeywords[0] || '맛있었어요';
      const k2 = usedKeywords[1] || '좋았어요';
      if (sideText) {
        return `${menuText} 먹었는데 ${k1}하고 ${k2}했어요. ${sideText}도 괜찮았습니다.`;
      }
      return `${menuText} 먹었는데 ${k1}하고 ${k2}했어요. 다음에 또 올게요.`;
    },
    // 스타일 2: 약간 긍정적인 말투
    () => {
      const k1 = usedKeywords[0] || '맛있었어요';
      if (sideText) {
        return `${menuText} 주문했어요. ${k1}하고 ${sideText}도 함께 먹으니 좋았습니다.`;
      }
      return `${menuText} 주문했어요. ${k1}해서 만족스러웠어요.`;
    },
    // 스타일 3: 무심한 만족 말투
    () => {
      const k1 = usedKeywords[0] || '괜찮았어요';
      const k2 = usedKeywords[1] || '좋았어요';
      if (sideText) {
        return `${menuText} 시켰는데 ${k1}했어요. ${sideText}도 ${k2}습니다.`;
      }
      return `${menuText} 시켰는데 ${k1}했어요. ${k2}습니다.`;
    },
    // 스타일 4: 짧고 간결한 말투
    () => {
      const k1 = usedKeywords[0] || '맛있었어요';
      if (sideText) {
        return `${menuText} 먹었어요. ${k1}하고 ${sideText}도 괜찮았습니다.`;
      }
      return `${menuText} 먹었어요. ${k1}해서 다음에도 올 것 같아요.`;
    },
    // 스타일 5: 친근한 말투
    () => {
      const k1 = usedKeywords[0] || '좋았어요';
      if (sideText) {
        return `${menuText} 주문했는데 ${k1}했어요. ${sideText}도 같이 먹었습니다.`;
      }
      return `${menuText} 주문했는데 ${k1}했어요. 추천합니다.`;
    },
    // 스타일 6: 간단한 만족 표현
    () => {
      const k1 = usedKeywords[0] || '맛있었어요';
      const k2 = usedKeywords[1] || '좋았어요';
      if (sideText) {
        return `${menuText} 먹었는데 ${k1}했어요. ${sideText}도 ${k2}습니다.`;
      }
      return `${menuText} 먹었는데 ${k1}했어요. ${k2}습니다.`;
    }
  ];

  // 3개의 서로 다른 리뷰 생성
  const reviews = [];
  const usedIndices = new Set();
  
  while (reviews.length < 3) {
    let review = '';
    let attempts = 0;
    
    // 템플릿 랜덤 선택 (중복 최소화)
    let templateIndex;
    do {
      templateIndex = Math.floor(Math.random() * templates.length);
    } while (usedIndices.has(templateIndex) && attempts++ < 10);
    
    usedIndices.add(templateIndex);
    review = templates[templateIndex]();
    
    // 35글자 내외로 조정
    review = adjustLength(review, 30, 40);
    
    reviews.push(review);
  }

  return reviews;
}

// ========== 글자 수 조정 함수 ==========
function adjustLength(text, minLength, maxLength) {
  const currentLength = text.length;
  
  if (currentLength >= minLength && currentLength <= maxLength) {
    return text;
  }
  
  if (currentLength < minLength) {
    // 짧으면 자연스러운 표현 추가
    const additions = ['정말', '너무', '완전', '진짜'];
    const addition = additions[Math.floor(Math.random() * additions.length)];
    return text.replace(/먹었어요|주문했어요|시켰는데/, `${addition} $&`);
  }
  
  if (currentLength > maxLength) {
    // 길면 불필요한 부분 제거
    text = text.replace(/다음에 또 올게요/g, '');
    text = text.replace(/다음에도 올 것 같아요/g, '');
    text = text.replace(/추천합니다/g, '');
    text = text.replace(/만족스러웠어요/g, '좋았어요');
    text = text.replace(/인상적이었습니다/g, '좋았어요');
    
    // 여전히 길면 자르기
    if (text.length > maxLength) {
      text = text.substring(0, maxLength - 2) + '요.';
    }
  }
  
  return text;
}

// ========== 유사도 검사 ==========
function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size; // Jaccard similarity
}

function checkReviewsSimilarity(reviews) {
  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      if (calculateSimilarity(reviews[i], reviews[j]) > 0.6) {
        return true; // 너무 비슷함
      }
    }
  }
  return false;
}
