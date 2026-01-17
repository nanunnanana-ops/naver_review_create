/**
 * admin.js - 관리자 페이지 로직
 * 설정 편집 및 저장 처리
 */

console.log('admin.js 로드됨');

let config = null;
let pinVerified = false;

// ========== 초기화 ==========
async function init() {
  console.log('admin.js init() 함수 호출됨');
  
  config = await loadConfig();
  
  console.log('관리자 페이지 - 로드된 설정:', config);
  console.log('관리자 페이지 - 필수 키워드:', config.requiredKeywords);
  
  setupEventListeners();
  setupPIN();
  
  console.log('관리자 페이지 초기화 완료');
}

// ========== PIN 검증 ==========
function setupPIN() {
  const pinInput = document.getElementById('pinInput');
  const pinSubmitBtn = document.getElementById('pinSubmitBtn');
  const pinError = document.getElementById('pinError');
  const pinModal = document.getElementById('pinModal');
  const adminContainer = document.getElementById('adminContainer');

  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      verifyPIN();
    }
  });

  pinSubmitBtn.addEventListener('click', verifyPIN);

  function verifyPIN() {
    const inputPin = pinInput.value.trim();
    if (inputPin === ADMIN_PIN) {
      pinVerified = true;
      pinModal.classList.remove('active');
      adminContainer.style.display = 'block';
      loadConfigToForm();
    } else {
      pinError.style.display = 'block';
      pinInput.value = '';
      pinInput.focus();
      setTimeout(() => {
        pinError.style.display = 'none';
      }, 2000);
    }
  }
}

// ========== 이벤트 리스너 ==========
function setupEventListeners() {
  document.getElementById('saveLocalBtn').addEventListener('click', handleSaveLocal);
  document.getElementById('downloadBtn').addEventListener('click', handleDownload);
  document.getElementById('resetBtn').addEventListener('click', handleReset);
}

// ========== 설정 폼에 로드 ==========
function loadConfigToForm() {
  if (!pinVerified) return;

  document.getElementById('storeName').value = config.storeName || '';
  document.getElementById('requiredKeywords').value = config.requiredKeywords.join(', ');
  document.getElementById('promoKeywordsPool').value = config.promoKeywordsPool.join(', ');
  document.getElementById('menus').value = config.menus.join('\n');
  document.getElementById('sides').value = config.sides.join(', ');
  document.getElementById('themeBg').value = config.ui.themeBg || '#FDFBF8';
  document.getElementById('accent').value = config.ui.accent || '#C0362C';
  document.getElementById('subtitle').value = config.ui.subtitle || '';
}

// ========== 폼에서 설정 수집 ==========
function collectConfigFromForm() {
  const requiredKeywordsInput = document.getElementById('requiredKeywords').value;
  console.log('필수 키워드 입력값 (원본):', requiredKeywordsInput);
  
  const parsedRequired = parseCommaSeparated(requiredKeywordsInput);
  console.log('파싱된 필수 키워드:', parsedRequired);
  
  const newConfig = {
    storeName: document.getElementById('storeName').value.trim() || DEFAULT_CONFIG.storeName,
    requiredKeywords: parsedRequired,
    promoKeywordsPool: parseCommaSeparated(document.getElementById('promoKeywordsPool').value),
    menus: parseNewlineOrComma(document.getElementById('menus').value),
    sides: parseNewlineOrComma(document.getElementById('sides').value),
    lengthOptions: config.lengthOptions || DEFAULT_CONFIG.lengthOptions,
    ui: {
      themeBg: document.getElementById('themeBg').value || DEFAULT_CONFIG.ui.themeBg,
      accent: document.getElementById('accent').value || DEFAULT_CONFIG.ui.accent,
      subtitle: document.getElementById('subtitle').value.trim() || DEFAULT_CONFIG.ui.subtitle
    }
  };

  console.log('수집된 설정 (빈 배열 체크 전):', newConfig);
  console.log('필수 키워드 배열 길이:', newConfig.requiredKeywords.length);

  // 빈 배열 방지 (단, 사용자가 입력한 경우에는 덮어쓰지 않도록 수정)
  // parseCommaSeparated가 빈 문자열을 빈 배열로 반환하는 경우에만 기본값 사용
  if (newConfig.requiredKeywords.length === 0 && requiredKeywordsInput.trim() === '') {
    console.log('필수 키워드가 비어있어 기본값 사용');
    newConfig.requiredKeywords = DEFAULT_CONFIG.requiredKeywords;
  }
  if (newConfig.promoKeywordsPool.length === 0) {
    newConfig.promoKeywordsPool = DEFAULT_CONFIG.promoKeywordsPool;
  }
  if (newConfig.menus.length === 0) {
    newConfig.menus = DEFAULT_CONFIG.menus;
  }
  if (newConfig.sides.length === 0) {
    newConfig.sides = DEFAULT_CONFIG.sides;
  }

  console.log('최종 설정:', newConfig);
  console.log('최종 필수 키워드:', newConfig.requiredKeywords);

  return newConfig;
}

// ========== 로컬 저장 ==========
function handleSaveLocal() {
  if (!pinVerified) return;

  const newConfig = collectConfigFromForm();
  
  // 디버깅: 저장하려는 설정 확인
  console.log('저장할 설정:', newConfig);
  console.log('필수 키워드:', newConfig.requiredKeywords);
  
  const success = saveConfig(newConfig);

  if (success) {
    config = newConfig;
    
    // localStorage에 실제로 저장되었는지 확인
    const saved = localStorage.getItem('reviewGeneratorConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('저장된 설정:', parsed);
      console.log('저장된 필수 키워드:', parsed.requiredKeywords);
    }
    
    showToast('설정이 저장되었습니다. 메인 페이지를 새로고침해주세요.');
  } else {
    showToast('저장에 실패했습니다. (remote 모드에서는 다운로드를 사용하세요)');
  }
}

// ========== JSON 다운로드 ==========
function handleDownload() {
  if (!pinVerified) return;

  const newConfig = collectConfigFromForm();
  downloadConfig(newConfig);
  showToast('config.json 파일이 다운로드되었습니다.');
}

// ========== 설정 초기화 ==========
function handleReset() {
  if (!pinVerified) return;

  if (confirm('설정을 초기값으로 되돌리시겠습니까?')) {
    config = { ...DEFAULT_CONFIG };
    loadConfigToForm();
    showToast('설정이 초기화되었습니다. 저장 버튼을 눌러 적용하세요.');
  }
}

// ========== 페이지 로드 시 초기화 ==========
document.addEventListener('DOMContentLoaded', init);
