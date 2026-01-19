// templates.js
// 목적: AI 호출 없이도 자연스러운 네이버 영수증 리뷰 2개 생성
// 원칙: 완성문 저장 X / 슬롯(빈칸) 템플릿 + 조립 + 규칙 기반 치환 O

// =========================
// 0) 유틸
// =========================
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
function uniq(arr) {
  return Array.from(new Set(arr));
}
function clampTextLen(text, min = 80, max = 200) {
  let t = text.replace(/\s+/g, " ").trim();
  if (t.length < min) {
    const pads = shuffle(PADDING_SENTENCES);
    for (const p of pads) {
      if (t.length >= min) break;
      // 같은 문장 반복 방지
      if (!t.includes(p.slice(0, 8))) t += " " + p;
    }
  }
  if (t.length > max) t = t.slice(0, max - 1).trim() + "…";
  return t;
}
function joinMenus(menus = []) {
  const clean = menus.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]}랑 ${clean[1]}`;
  // 3개 이상은 "A, B, C" 형태 + 마지막 "그리고"
  return clean.slice(0, -1).join(", ") + ` 그리고 ${clean.at(-1)}`;
}
function joinSides(sides = []) {
  const clean = sides.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]}랑 ${clean[1]}`;
  return clean.slice(0, -1).join(", ") + ` 그리고 ${clean.at(-1)}`;
}
function safeKeywordPack(keywords = []) {
  // 키워드는 "장소/근처" 같은 것만 남기고, 금지어/비문 유발어는 제거
  const banned = ["국물했어요", "어국수했어요", "맛집임", "국물맛집"]; // 비문/부자연 표현 방지
  return uniq(
    keywords
      .filter(Boolean)
      .map((k) => String(k).trim())
      .filter((k) => k && !banned.includes(k))
  );
}
function pickLocationHint(keywords = []) {
  // 키워드에서 위치 힌트 후보를 골라 자연스럽게 한 문장으로
  // 예: 서대문역 / 영천시장 / 강북삼성병원
  const locCandidates = keywords.filter((k) =>
    /(서대문역|영천시장|강북삼성병원)/.test(k)
  );
  if (locCandidates.length === 0) return pick(LOCATION_HINTS_NEUTRAL);
  const loc = pick(locCandidates);
  const map = {
    서대문역: pick(LOCATION_HINTS_SEO),
    영천시장: pick(LOCATION_HINTS_YEONG),
    강북삼성병원: pick(LOCATION_HINTS_KB),
  };
  return map[loc] || pick(LOCATION_HINTS_NEUTRAL);
}
function pickTone() {
  return pick(["담백", "감성", "단골", "혼밥", "소개"]);
}

// =========================
// 1) 문장 조각(슬롯 템플릿)
// =========================
const OPENERS = [
  // {storeName}, {visitContext}, {menuText}
  "{visitContext} {storeName} 들렀어요. {menuOrderLine}",
  "서대문 쪽 볼 일 보고 {storeName}에 들렀습니다. {menuOrderLine}",
  "{storeName}는 예전부터 궁금했는데 오늘 처음 방문했어요. {menuOrderLine}",
  "{storeName}는 지나가다 몇 번 봤던 곳인데 드디어 먹어봤네요. {menuOrderLine}",
  "가볍게 한 끼 하려고 {storeName} 갔는데 {menuOrderLine}",
  "요즘같이 추울 때는 따뜻한 국물 생각나서 {storeName}로 갔어요. {menuOrderLine}",
];

const MENU_ORDER_LINES = [
  // {menuText}
  "{menuText} 주문했어요.",
  "{menuText} 시켰습니다.",
  "{menuText} 먹었는데요,",
  "{menuText}로 골랐어요.",
  "{menuText} 위주로 주문했어요.",
];

const BROTH_LINES = [
  // "국물"을 자연스럽게 (국물맛집 같은 키워드 그대로 사용 X)
  "국물이 진하고 깔끔해서 첫 숟갈부터 안정감이 있더라고요.",
  "육수 맛이 과하지 않고 담백하게 깊어서 계속 손이 갔어요.",
  "국물이 칼칼하면서도 끝맛이 정돈돼서 부담 없이 먹기 좋았어요.",
  "국물 온도도 좋고 감칠맛이 살아 있어서 추운 날에 딱이었어요.",
  "짠맛이 튀지 않고 균형이 좋아서 마지막까지 맛있게 먹었습니다.",
  "국물에서 비린 맛이 없고 시원한 느낌이 좋아요.",
  "국물이 뒷맛이 깔끔해서 면이랑 잘 어울렸습니다.",
];

const FOOD_DETAIL_LINES = [
  "면발도 퍼지지 않고 탱글해서 국물과 같이 먹기 좋았어요.",
  "양도 넉넉해서 한 끼 든든하게 해결했습니다.",
  "전체적으로 간이 세지 않아서 편하게 먹었어요.",
  "재료가 신선한 느낌이라 먹는 내내 기분 좋았습니다.",
  "토핑도 알차게 올라가서 맛이 단조롭지 않았어요.",
  "뜨끈하게 나오니까 겨울에 더 만족도가 높네요.",
];

const SIDE_LINES = [
  // {sideText} (없으면 조립 시 제거)
  "{sideText}도 같이 먹었는데 조합이 괜찮았어요.",
  "{sideText} 곁들이니까 훨씬 만족스럽더라고요.",
  "중간중간 {sideText} 같이 먹으니 질리지 않았어요.",
  "{sideText}까지 같이 주문하길 잘했어요.",
];

const SERVICE_LINES = [
  "사장님도 친절하시고 응대가 편안해서 좋았어요.",
  "직원분들도 응대가 빠르고 친절했습니다.",
  "가게 분위기가 깔끔하고 편해서 식사하기 좋았어요.",
  "매장도 정돈돼 있어서 혼밥하기에도 부담 없었습니다.",
  "자리도 편하고 전반적으로 관리가 잘 되는 느낌이었어요.",
];

const LOCATION_HINTS_SEO = [
  "서대문역 근처에서 한 끼 해결하기 좋아요.",
  "서대문역 쪽 오면 생각날 것 같습니다.",
  "서대문역 근방에서 국수/국물 찾을 때 괜찮은 선택지예요.",
];
const LOCATION_HINTS_YEONG = [
  "영천시장 들렀다가 같이 가기 좋은 코스네요.",
  "영천시장 근처에서 따뜻한 국물 찾으면 추천할 만해요.",
  "영천시장 쪽 오면 한 번씩 들를 것 같습니다.",
];
const LOCATION_HINTS_KB = [
  "강북삼성병원 근처라 식사하기 편했어요.",
  "강북삼성병원 쪽에서 든든한 한 끼로 좋네요.",
  "강북삼성병원 근처에서 깔끔한 국물 찾을 때 괜찮습니다.",
];
const LOCATION_HINTS_NEUTRAL = [
  "근처 오면 또 들를 것 같아요.",
  "동네에서 따뜻한 국물 생각날 때 찾기 좋은 곳이에요.",
  "재방문 의사 있습니다.",
];

// 클로징은 '추천/재방문/가성비' 중 하나만 선택되도록 분기
const CLOSERS_REVISIT = [
  "다음에도 생각나면 또 갈게요.",
  "재방문할 것 같습니다.",
  "또 먹고 싶어지는 맛이라 조만간 다시 올 듯해요.",
  "날씨 더 추워지면 여기 국물 먼저 떠오를 것 같아요.",
];
const CLOSERS_RECOMMEND = [
  "주변에 조용히 추천하고 싶은 곳이에요.",
  "국물 좋아하는 분들은 한 번 드셔보셔도 좋을 듯합니다.",
  "근처 지인들에게도 소개해볼게요.",
];
const CLOSERS_VALUE = [
  "가격 대비 만족스러웠어요.",
  "가성비도 괜찮아서 부담이 덜했어요.",
  "이 정도 퀄리티면 충분히 만족입니다.",
];

// 문장 길이 채우는 패딩(반복 티 덜 나는 중립 문장)
const PADDING_SENTENCES = [
  "사진은 못 찍었는데 먹는 데 집중하게 되더라고요.",
  "전체적으로 자극적이지 않아서 더 마음에 들었습니다.",
  "한 그릇 먹고 나니 속이 편안한 느낌이었어요.",
  "요즘 같은 날씨엔 이런 따뜻한 메뉴가 최고네요.",
  "다음엔 다른 메뉴도 같이 먹어보고 싶습니다.",
  "기다림이 길지 않았고 회전도 빠른 편이었어요.",
  "정리도 깔끔하게 되어 있어 기분 좋게 나왔습니다.",
  "국물 온도 유지가 잘 돼서 끝까지 따뜻했어요.",
];

// =========================
// 2) 톤별 조립 규칙
// =========================
function buildReview({ storeName = "어국수", menus = [], sides = [], keywords = [], targetLength = 300 }) {
  const tone = pickTone();
  const kw = safeKeywordPack(keywords);

  const menuText = joinMenus(menus);
  const sideText = joinSides(sides);

  const visitContext = pick([
    "오늘",
    "퇴근길에",
    "점심에",
    "저녁에",
    "지나가다",
    "근처 들른 김에",
  ]);

  // 메뉴 주문 라인
  const menuOrderLine = MENU_ORDER_LINES.length
    ? pick(MENU_ORDER_LINES).replace("{menuText}", menuText || "국수")
    : `${menuText} 주문했어요.`;

  // 오프너
  let text = pick(OPENERS)
    .replace("{visitContext}", visitContext)
    .replace("{storeName}", storeName)
    .replace("{menuOrderLine}", menuOrderLine);

  // 바디: 국물(필수로 1개는 포함)
  const brothLine = pick(BROTH_LINES);
  const detailLine = pick(FOOD_DETAIL_LINES);

  // 사이드 문장(사이드 없으면 제거)
  const sideLine = sideText ? pick(SIDE_LINES).replace("{sideText}", sideText) : "";

  // 서비스/분위기
  const serviceLine = pick(SERVICE_LINES);

  // 위치 힌트 (키워드에서 자연어로)
  const locationHint = pickLocationHint(kw);

  // 클로징: 세 가지 중 하나만
  const closingType = pick(["revisit", "recommend", "value"]);
  const closer =
    closingType === "revisit"
      ? pick(CLOSERS_REVISIT)
      : closingType === "recommend"
      ? pick(CLOSERS_RECOMMEND)
      : pick(CLOSERS_VALUE);

  // 톤별로 조립 순서 약간 변경(반복감 감소)
  if (tone === "담백") {
    text += ` ${brothLine} ${detailLine} ${sideLine} ${locationHint} ${closer}`;
  } else if (tone === "감성") {
    text += ` ${pick([
      "따뜻한 국물 한 입에 몸이 풀리는 느낌이었어요.",
      "추운 날엔 이런 국물이 진짜 위로가 되네요.",
      "한 그릇 먹고 나니 기분이 좀 정리되는 느낌이랄까요.",
    ])} ${brothLine} ${sideLine} ${serviceLine} ${closer}`;
  } else if (tone === "단골") {
    text += ` ${pick([
      "여긴 기본이 탄탄한 편이라 종종 생각나요.",
      "갈 때마다 편차가 크지 않은 편이라 믿고 가게 됩니다.",
      "자극적이지 않아서 오히려 더 자주 찾게 되더라고요.",
    ])} ${brothLine} ${detailLine} ${locationHint} ${closer}`;
  } else if (tone === "혼밥") {
    text += ` ${pick([
      "혼자 먹기에도 부담 없는 분위기라 좋았고,",
      "혼밥하기 편해서 조용히 먹고 나오기 좋았습니다.",
      "바쁜 시간대에도 혼자 한 끼 하기 괜찮았어요.",
    ])} ${brothLine} ${detailLine} ${closer}`;
  } else {
    // 소개/가이드 톤
    text += ` ${serviceLine} ${brothLine} ${detailLine} ${sideLine} ${locationHint} ${closer}`;
  }

  // 키워드(예: 어국수, 서대문역, 영천시장, 강북삼성병원, 국물맛집)를 "그대로 나열"하지 말고
  // 이미 자연어로 녹였기 때문에 여기서 추가 삽입은 하지 않음.
  // 다만 매장명 어국수는 storeName으로 이미 들어감.

  // 글자수 조정
  return clampTextLen(text, Math.max(180, targetLength - 80), Math.min(390, targetLength + 80));
}

// =========================
// 3) 외부에서 호출할 함수
// =========================
function generateReviews({ storeName = "어국수", menus = [], sides = [], keywordsBundle = [], targetLength = 140 }) {
  const kw = safeKeywordPack(keywordsBundle);

  // 2개 리뷰 생성 (중복 방지용으로 조금 더 뽑고 unique)
  const candidates = [];
  for (let i = 0; i < 8; i++) {
    candidates.push(
      buildReview({
        storeName,
        menus,
        sides,
        keywords: kw,
        targetLength,
      })
    );
  }

  const reviews = uniq(candidates).slice(0, 2);

  // 혹시 2개 미만이면 채우기
  while (reviews.length < 2) {
    reviews.push(buildReview({ storeName, menus, sides, keywords: kw, targetLength }));
  }

  return reviews;
}

// CommonJS export for Vercel
module.exports = { generateReviews };
