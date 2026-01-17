/**
 * app.js - 손님용 메인 페이지 로직
 * 리뷰 생성 및 UI 인터랙션 처리
 */

console.log('app.js 로드됨');

let config = null;

// ========== 초기화 ==========
async function init() {
  console.log('init() 함수 호출됨');
  
  config = await loadConfig();
  
  // 디버깅: 로드된 설정 확인
  console.log('로드된 설정:', config);
  console.log('필수 키워드:', config.requiredKeywords);
  console.log('필수 키워드 개수:', config.requiredKeywords ? config.requiredKeywords.length : 0);
  
  applyConfig();
  setupEventListeners();
  
  console.log('초기화 완료');
}

function applyConfig() {
  // 매장명 및 부제목 적용
  document.getElementById('storeName').textContent = config.storeName;
  document.getElementById('subtitle').textContent = config.ui.subtitle;

  // CSS 변수 적용
  document.documentElement.style.setProperty('--theme-bg', config.ui.themeBg);
  document.documentElement.style.setProperty('--accent', config.ui.accent);

  // 메뉴 체크박스 채우기
  const menusGroup = document.getElementById('menusGroup');
  menusGroup.innerHTML = '';
  config.menus.forEach(menu => {
    const item = document.createElement('div');
    item.className = 'checkbox-item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `menu_${menu}`;
    checkbox.value = menu;
    const label = document.createElement('label');
    label.htmlFor = `menu_${menu}`;
    label.textContent = menu;
    item.appendChild(checkbox);
    item.appendChild(label);
    menusGroup.appendChild(item);
  });

  // 사이드 옵션 채우기
  const sidesGroup = document.getElementById('sidesGroup');
  sidesGroup.innerHTML = '';
  config.sides.forEach(side => {
    const item = document.createElement('div');
    item.className = 'checkbox-item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `side_${side}`;
    checkbox.value = side;
    const label = document.createElement('label');
    label.htmlFor = `side_${side}`;
    label.textContent = side;
    item.appendChild(checkbox);
    item.appendChild(label);
    sidesGroup.appendChild(item);
  });
}

function setupEventListeners() {
  // 생성 버튼
  document.getElementById('generateBtn').addEventListener('click', handleGenerate);

  // 모달 닫기
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('copyModal').classList.remove('active');
  });

  // 모달 배경 클릭 시 닫기
  document.getElementById('copyModal').addEventListener('click', (e) => {
    if (e.target.id === 'copyModal') {
      document.getElementById('copyModal').classList.remove('active');
    }
  });
}

// ========== 리뷰 생성 ==========
async function handleGenerate() {
  // 선택된 메뉴 수집 (복수 선택)
  const selectedMenus = Array.from(document.querySelectorAll('#menusGroup input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  if (selectedMenus.length === 0) {
    showToast('메뉴를 하나 이상 선택해주세요.');
    return;
  }

  // 함께 먹은 것 수집
  const selectedSides = Array.from(document.querySelectorAll('#sidesGroup input[type="checkbox"]:checked'))
    .map(cb => cb.value)
    .filter(v => v !== '없음');

  // 키워드 번들 생성
  const keywordsBundle = [
    ...config.requiredKeywords,
    ...selectedMenus
  ];

  // 프로모션 키워드 풀에서 랜덤 2~4개 선택
  const promoCount = Math.floor(Math.random() * 3) + 2; // 2~4개
  const shuffledPromo = [...config.promoKeywordsPool].sort(() => Math.random() - 0.5);
  keywordsBundle.push(...shuffledPromo.slice(0, promoCount));

  // nonce 생성
  const nonce = Date.now().toString(36) + Math.random().toString(36).substr(2);

  // 로딩 표시
  const generateBtn = document.getElementById('generateBtn');
  const originalText = generateBtn.textContent;
  generateBtn.textContent = '생성 중...';
  generateBtn.disabled = true;

  try {
    let reviews = [];

    if (DEMO_MODE) {
      // 데모 모드: 로컬에서 생성
      reviews = generateReviewsDemo(
        config.storeName,
        selectedMenus,
        selectedSides,
        keywordsBundle
      );

      // 유사도 검사 및 재생성
      let attempts = 0;
      while (checkReviewsSimilarity(reviews) && attempts < 1) {
        reviews = generateReviewsDemo(
          config.storeName,
          selectedMenus,
          selectedSides,
          keywordsBundle
        );
        attempts++;
      }
    } else {
    // 서버 모드: API 호출
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeName: config.storeName,
        menus: selectedMenus,
        sides: selectedSides,
        keywordsBundle: keywordsBundle,
        requiredKeywords: config.requiredKeywords || [], // 필수 키워드 별도 전송
        targetLength: 300, // 200~400글자 내외
        nonce: nonce
      })
    });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        console.error('API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || errorData.error || `리뷰 생성에 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      reviews = data.reviews || [];
      
      if (!reviews || reviews.length === 0) {
        console.error('No reviews in response:', data);
        throw new Error('리뷰가 생성되지 않았습니다.');
      }

      // 유사도 검사 및 재요청
      let attempts = 0;
      while (checkReviewsSimilarity(reviews) && attempts < 1) {
        const retryResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storeName: config.storeName,
            menus: selectedMenus,
            sides: selectedSides,
            keywordsBundle: keywordsBundle,
            targetLength: 300,
            nonce: nonce + '_retry' + attempts
          })
        });
        const retryData = await retryResponse.json();
        reviews = retryData.reviews || [];
        attempts++;
      }
    }

    if (reviews.length === 0) {
      throw new Error('리뷰를 생성할 수 없습니다.');
    }

    displayReviews(reviews);
  } catch (error) {
    console.error('Generate error:', error);
    const errorMessage = error.message || '리뷰 생성 중 오류가 발생했습니다.';
    console.error('Error details:', error);
    showToast(`${errorMessage} 다시 시도해주세요.`);
  } finally {
    generateBtn.textContent = originalText;
    generateBtn.disabled = false;
  }
}

// ========== 리뷰 표시 ==========
function displayReviews(reviews) {
  const container = document.getElementById('reviewsContainer');
  container.innerHTML = '';

  reviews.forEach((review, index) => {
    const card = document.createElement('div');
    card.className = 'review-card';

    const text = document.createElement('div');
    text.className = 'review-text';
    text.textContent = review; // XSS 방지: innerText 사용

    const actions = document.createElement('div');
    actions.className = 'review-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-secondary btn-copy';
    copyBtn.textContent = '복사';
    copyBtn.addEventListener('click', () => copyReview(review));

    actions.appendChild(copyBtn);
    card.appendChild(text);
    card.appendChild(actions);
    container.appendChild(card);
  });

  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========== 복사 기능 ==========
async function copyReview(text) {
  const NAVER_PLACE_URL = 'https://m.place.naver.com/my';
  
  try {
    await navigator.clipboard.writeText(text);
    // 복사 성공 후 네이버 플레이스 링크로 이동
    window.open(NAVER_PLACE_URL, '_blank');
    document.getElementById('copyModal').classList.add('active');
    setTimeout(() => {
      document.getElementById('copyModal').classList.remove('active');
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
    // 폴백: 텍스트 영역 사용
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      // 복사 성공 후 네이버 플레이스 링크로 이동
      window.open(NAVER_PLACE_URL, '_blank');
      document.getElementById('copyModal').classList.add('active');
      setTimeout(() => {
        document.getElementById('copyModal').classList.remove('active');
      }, 2000);
    } catch (err) {
      showToast('복사에 실패했습니다.');
    }
    document.body.removeChild(textarea);
  }
}

// ========== 페이지 로드 시 초기화 ==========
document.addEventListener('DOMContentLoaded', init);
