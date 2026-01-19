/**
 * Vercel Serverless Function
 * Groq API를 사용하여 리뷰 생성 (무료 티어 제공)
 * 
 * Groq는 OpenAI-compatible API를 제공하며 무료 티어가 매우 관대함
 */

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { storeName, menus, sides, keywordsBundle, requiredKeywords, promoKeywordsPool, targetLength, nonce } = req.body;

    if (!menus || menus.length === 0) {
      return res.status(400).json({ error: "메뉴가 필요합니다" });
    }

    // 메뉴 텍스트 생성
    const menuText = menus.length === 1 ? menus[0] : menus.join("과 ");
    const sideText = sides && sides.length > 0 ? sides.join(", ") : "";
    
    // 필수 키워드와 선택 키워드 분리 (app.js에서 requiredKeywords가 앞에 오므로)
    // keywordsBundle 구조: [requiredKeywords..., selectedMenus..., promoKeywords...]
    // 클라이언트에서 requiredKeywords 개수를 보내주는 게 이상적이지만, 
    // 일단 keywordsBundle 전체를 사용하되 검증에서 강화
    
    // 키워드를 자연어 phrase로 변환
    const keywordsPhrases = convertKeywordsToPhrases(keywordsBundle || []);
    const keywordsText = keywordsPhrases.join(", ");
    
    // 필수 키워드를 phrase로 변환 (프롬프트에 명확히 표시)
    // 필수 키워드가 비어있으면 기본값으로 보정
    const fallbackRequiredKeywords = ["서대문역", "국물", "강북삼성병원", "영천시장"];
    const requiredKeywordsArray = Array.isArray(requiredKeywords)
      ? requiredKeywords
      : (requiredKeywords ? [requiredKeywords] : []);
    const effectiveRequiredKeywords = requiredKeywordsArray.length > 0
      ? requiredKeywordsArray
      : fallbackRequiredKeywords;
    
    const requiredKeywordsPhrases = effectiveRequiredKeywords.length > 0
      ? convertKeywordsToPhrases(effectiveRequiredKeywords)
      : [];
    const requiredKeywordsText = requiredKeywordsPhrases.join(", ");
    
    // 원본 키워드 목록 (검증용 - phrase 변환 전)
    const originalKeywords = keywordsBundle || [];

    // 프로모션 키워드 풀 (LLM이 1~3개 선택)
    const promoPool = Array.isArray(promoKeywordsPool) ? promoKeywordsPool : [];

    // API 선택: GROQ_API_KEY가 있으면 Groq, 없으면 템플릿 폴백
    const groqKey = process.env.GROQ_API_KEY;

    let reviews = [];

    if (groqKey) {
      // Groq API 사용 (OpenAI-compatible)
      const requiredKeywordsPhrases = effectiveRequiredKeywords && effectiveRequiredKeywords.length > 0
        ? convertKeywordsToPhrases(effectiveRequiredKeywords)
        : [];
      const requiredKeywordsText = requiredKeywordsPhrases.join(", ");
      try {
        reviews = await generateWithGroq(
          menuText,
          sideText,
          keywordsText,
          keywordsPhrases,
          originalKeywords,
          effectiveRequiredKeywords,
          requiredKeywordsText,
          promoPool,
          storeName,
          targetLength,
          groqKey
        );
      } catch (error) {
        console.error("Groq 호출 실패, 템플릿 폴백 사용:", error);
        reviews = generateFallbackReviews(menuText, sideText, keywordsBundle || [], storeName);
      }
    } else {
      // API 키가 없으면 템플릿 기반 생성 (폴백)
      console.warn("API 키가 없어 템플릿 기반 생성 사용");
      console.warn("GROQ_API_KEY:", groqKey ? "있음 (마스킹됨)" : "없음");
      reviews = generateFallbackReviews(menuText, sideText, keywordsBundle || [], storeName);
    }

    // 최소 2개 리뷰 보장 (API 호출 실패 시에만)
    if (reviews.length < 2) {
      console.warn("리뷰가 2개 미만, 기본 템플릿 사용");
      const kb = keywordsBundle || [];
      reviews = generateFallbackReviews(menuText, sideText, kb, storeName);
    }

    // 필수 키워드가 누락된 경우 보정 (최소한의 문장 추가)
    if (effectiveRequiredKeywords.length > 0) {
      reviews = ensureRequiredKeywords(reviews, effectiveRequiredKeywords);
    }

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("API error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: "리뷰 생성에 실패했습니다.",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

// ========== 필수 키워드 보정 ==========
function ensureRequiredKeywords(reviews, requiredKeywords) {
  return reviews.map((review) => {
    let updated = review;
    const missing = requiredKeywords.filter((kw) => {
      const keywordTrimmed = String(kw).trim();
      if (!keywordTrimmed) return false;
      const regex = new RegExp(keywordTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      return !regex.test(updated);
    });

    if (missing.length === 0) return updated;

    // 누락 키워드를 자연스러운 문장으로 분산 삽입
    let sentences = splitSentences(updated);
    const missingKeywords = missing.map((kw) => String(kw).trim()).filter(Boolean);
    const insertions = buildNaturalKeywordInsertions(missingKeywords);
    const maxLength = 380;

    insertions.forEach((sentence, idx) => {
      const targetIndex = Math.min(
        sentences.length,
        Math.max(0, Math.floor((idx + 1) * (sentences.length / (insertions.length + 1))))
      );
      sentences.splice(targetIndex, 0, sentence);
    });

    // 문장 수를 3으로 맞춤 (초과 시 병합)
    while (sentences.length > 3) {
      const last = sentences.pop();
      sentences[sentences.length - 1] = `${sentences[sentences.length - 1]} ${last}`.replace(/\s+/g, " ").trim();
    }

    updated = sentences.join(" ").replace(/\s+/g, " ").trim();
    if (updated.length > maxLength) {
      updated = updated.substring(0, maxLength).trim();
    }

    return updated;
  });
}

function countSentences(text) {
  if (!text) return 0;
  return splitSentences(text).length;
}

function splitSentences(text) {
  return text.split(/(?:[.!?]|다\.)\s+/).filter(Boolean);
}

function isLocationKeyword(keyword) {
  const locationHints = ["역", "병원", "시장", "터미널", "공원", "학교", "사거리", "거리", "동", "구", "로", "길"];
  return locationHints.some((hint) => String(keyword).includes(hint));
}


function buildNaturalKeywordSentence(keyword) {
  if (!keyword) return "";

  const locationHints = ["역", "병원", "시장", "터미널", "공원", "학교", "사거리", "거리", "동", "구", "로", "길"];
  const isLocation = locationHints.some((hint) => keyword.includes(hint));

  if (isLocation) {
    const templates = [
      `${keyword} 근처라 들르기 편했어요.`,
      `${keyword} 인근에 있어서 찾기 쉬웠어요.`,
      `${keyword} 쪽이라 접근성이 좋았어요.`,
      `${keyword} 주변이라 이동이 수월했어요.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  const templates = [
    `${keyword} 부분도 만족스러웠어요.`,
    `${keyword} 느낌이 좋았습니다.`,
    `${keyword}이(가) 자연스럽게 느껴졌어요.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function buildNaturalKeywordInsertions(keywords) {
  if (!keywords || keywords.length === 0) return [];

  const locationHints = ["역", "병원", "시장", "터미널", "공원", "학교", "사거리", "거리", "동", "구", "로", "길"];
  const isLocationKeyword = (kw) => locationHints.some((hint) => kw.includes(hint));

  const locations = keywords.filter(isLocationKeyword);
  const others = keywords.filter((kw) => !isLocationKeyword(kw));

  const sentences = [];

  if (locations.length > 0) {
    const locationSentences = buildIndependentLocationSentences(locations);
    sentences.push(...locationSentences);
  }

  others.forEach((kw) => {
    sentences.push(buildNaturalKeywordSentence(kw));
  });

  return sentences.filter(Boolean);
}

function buildIndependentLocationSentences(locations) {
  const uniqLocations = Array.from(new Set(locations));
  const results = [];
  const shuffled = shuffleArray(uniqLocations);

  shuffled.forEach((loc) => {
    const templates = [
      `${loc} 근처라 들르기 편했어요.`,
      `${loc} 인근이라 접근이 쉬웠어요.`,
      `${loc} 주변이라 자연스럽게 들렀어요.`,
      `${loc} 쪽이라 위치 설명하기 좋았어요.`,
    ];
    results.push(pickRandom(templates));
  });

  return results;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ========== 키워드를 자연어 phrase로 변환 ==========
function convertKeywordsToPhrases(keywordsBundle) {
  // 키워드별 자연스러운 phrase 템플릿
  const phraseTemplates = {
    "국물": ["국물이 진했어요", "국물이 깔끔했어요", "국물 맛이 좋았어요"],
    "어국수": ["어국수에서 먹었어요", "어국수가 맛있었어요", "어국수 맛집이었어요"],
    "시원": ["시원했어요", "시원한 맛이었어요"],
    "깔끔": ["깔끔했어요", "깔끔한 맛이었어요"],
    "매콤": ["매콤했어요", "매콤한 맛이 좋았어요"],
    "어묵국수": ["어묵국수가 맛있었어요", "어묵국수 맛이 좋았어요"],
  };

  return keywordsBundle.map((keyword) => {
    const key = keyword.trim();
    // 템플릿이 있으면 랜덤 선택
    if (phraseTemplates[key]) {
      const templates = phraseTemplates[key];
      return templates[Math.floor(Math.random() * templates.length)];
    }
    // 템플릿이 없으면 기본 형태로 변환 (조사/어미 추가)
    return `${key}이(가) 좋았어요`;
  });
}

// ========== Groq API (OpenAI-compatible) ==========
async function generateWithGroq(menuText, sideText, keywordsText, keywordsPhrases, originalKeywords, requiredKeywords, requiredKeywordsText, promoPool, storeName, targetLength, apiKey) {
  const keywordsList = keywordsPhrases || (keywordsText ? keywordsText.split(", ").filter((k) => k.trim()) : []);
  
  // 검증 및 재시도 로직
  let reviews = null;
  let temperature = 0.8;
  const maxRetries = 4; // 비문/키워드 검증 포함해서 4회로 증가
  
  // 필수 키워드 phrase 배열 추출 (검증용)
  const requiredKeywordsPhrasesArray = requiredKeywordsText ? requiredKeywordsText.split(", ") : [];
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // 반복 금지 문구 리스트
    const forbiddenPhrases = [
      "다음에도 방문할 예정입니다",
      "가격 대비 만족스러웠어요",
      "친구들에게도 추천하고 싶습니다",
      "자주 찾을 수 있을 것 같습니다",
      "또 올게요",
      "재방문",
      "가격 대비"
    ];
    
    // 프롬프트 구성 - 필수 키워드를 명확히 구분
    let keywordsSection = "";
    if (requiredKeywordsText) {
      keywordsSection = `- 필수 키워드 (각 리뷰에 100% 반드시 포함): ${requiredKeywordsText}`;
      if (keywordsText && keywordsText !== requiredKeywordsText) {
        // 선택 키워드가 있으면 추가 (필수 키워드 제외)
        const requiredKeywordsWords = requiredKeywords || [];
        const otherKeywords = keywordsText.split(", ").filter(k => {
          // 필수 키워드의 핵심 단어가 포함되지 않은 것만
          return !requiredKeywordsWords.some(rk => {
            const rkWord = rk.trim();
            return k.includes(rkWord) || k.includes(rkWord.split(/[이가을를에에서]/)[0]);
          });
        });
        if (otherKeywords.length > 0) {
          keywordsSection += `\n- 추가 키워드 (자연스럽게 포함 권장): ${otherKeywords.join(", ")}`;
        }
      }
    } else if (keywordsText) {
      keywordsSection = `- 포함할 키워드 (각 리뷰에 자연스럽게 1회씩 포함): ${keywordsText}`;
    }
    
    // 필수 키워드가 있을 때는 간소화된 프롬프트 (필수 키워드 우선)
    const prompt = requiredKeywords && requiredKeywords.length > 0
      ? `너는 실제 사람이 쓴 것 같은 “네이버 영수증 리뷰”를 생성하는 작가다.
입력으로 (1) 손님이 고른 메뉴, (2) 사장님이 지정한 필수 키워드, (3) 랜덤 프로모션 키워드 후보가 주어진다.
이 3가지를 활용해 자연스럽고 광고처럼 보이지 않는 후기를 작성하라.

입력

방문상황/원문(있으면 참고): ${""}

손님이 선택한 메뉴(반드시 언급): ${menuText}

사장님 필수 키워드(반드시 포함): ${requiredKeywords.join(", ")}

프로모션 키워드 풀(선택적으로 1~3개만 사용): ${Array.isArray(promoPool) ? promoPool.join(", ") : ""}

핵심 규칙(중요)

필수 키워드는 반드시 포함하되, 한 문장에 키워드가 2개 이상 몰리지 않게 분산해라.

키워드끼리는 관련이 없을 수 있다. 따라서

“A 갔다가 B 갔다가”

“A 근처라서 B에서 먹었다”
같은 동선/순서/인과 연결 문장을 절대 임의로 만들어내지 마라.
(이미 RAW_CONTEXT에 그런 동선이 명시된 경우에만 자연스럽게 사용 가능)

장소 키워드(가능성)는 “위치/근처/접근성” 문장에서 짧게 1번만 언급하고 끝내라.

‘국물/면/온도/감칠맛’ 같은 소재 키워드는 “맛/식감” 파트에서만 사용해라.

프로모션 키워드는 문장 단조로움 방지용이다.

무조건 다 쓰지 말고 1~3개만 골라

“형용사 나열”처럼 보이지 않게, 맛/분위기/컨디션 중 한 곳에만 녹여라.

문체는 정리체(“전반적으로”, “재방문 의사”)를 피하고, 사람 후기 말투로 작성해라.

길이는 80~200자 랜덤. 문장은 완벽하게 끝나지 않아도 되고, 존댓말이 아니어도 됨.
“~함/~임” 말투도 포함해 다양하게 써라.

서로 다른 장소 키워드가 2개 이상 있을 때, 두 장소를 한 문장에 함께 넣지 마라.
장소 키워드는 “동선”이 아니라 “그 지역에서 떠오르는/근처”처럼 독립적으로만 언급하라.

출력

완성된 리뷰 텍스트만 출력.

출력 형식:
JSON 배열만 출력 (설명 없이)
["리뷰1","리뷰2"]`
      : `네이버 영수증 리뷰 2개를 작성해줘.

[필수 조건]
- 매장명: ${storeName}
- 주문: ${menuText}
${sideText ? `- 함께 먹은 것: ${sideText}` : ""}
${keywordsSection ? keywordsSection + "\n" : ""}

[작성 규칙]
1. 길이: 각 리뷰 80~200자 (완전한 문장일 필요 없음)
2. 비문 절대 금지: "국물했어요", "어국수했어요" 같은 패턴
3. 반복 금지: ${forbiddenPhrases.slice(0, 3).join(", ")} 같은 문구 사용 금지
4. 2개 리뷰는 서로 다른 톤

출력 형식:
JSON 배열만 출력 (설명 없이)
["리뷰1","리뷰2"]`; 

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: temperature,
          max_tokens: 2000,
        }),
      });

    if (!response.ok) {
      const errorData = await response.text();
      // Rate limit은 템플릿 폴백으로 처리
      if (response.status === 429 || /rate_limit/i.test(errorData)) {
        throw new Error("GROQ_RATE_LIMIT");
      }
      throw new Error(`Groq API error: ${errorData}`);
    }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content?.trim() || "";

      // JSON 배열 추출
      let extractedReviews = [];
      try {
        // JSON 배열 직접 파싱 시도
        const jsonMatch = responseText.match(/\[(.*?)\]/s);
        if (jsonMatch) {
          extractedReviews = JSON.parse(jsonMatch[0]);
        } else {
          // 직접 파싱 시도
          const parsed = JSON.parse(responseText);
          if (Array.isArray(parsed)) {
            extractedReviews = parsed;
          } else if (Array.isArray(parsed.reviews)) {
            extractedReviews = parsed.reviews;
          } else {
            // 객체의 키에서 배열 찾기
            const keys = Object.keys(parsed);
            for (const key of keys) {
              if (Array.isArray(parsed[key])) {
                extractedReviews = parsed[key];
                break;
              }
            }
          }
        }
      } catch (parseError) {
        console.warn("JSON 파싱 실패, 재시도:", parseError.message);
        if (attempt < maxRetries - 1) {
          temperature = 0.4; // 재시도 시 temperature 낮춤
          continue;
        }
        throw new Error("JSON 파싱 실패");
      }

      // 검증
      const validation = validateReviews(extractedReviews, keywordsList, originalKeywords, requiredKeywords);
      
      // 비문 패턴 체크
      const hasGrammaticalError = checkGrammaticalErrors(extractedReviews);
      
      if (validation.isValid && !hasGrammaticalError.hasError) {
        reviews = extractedReviews;
        break;
      } else {
        const errors = [...(validation.errors || []), ...(hasGrammaticalError.errors || [])];
        console.warn(`검증 실패 (시도 ${attempt + 1}/${maxRetries}):`, errors);
        if (attempt < maxRetries - 1) {
          if (hasGrammaticalError.hasError) {
            // 비문이 있으면 temperature를 더 낮춤
            temperature = 0.3;
          } else {
            temperature = 0.4; // 재시도 시 temperature 낮춤
          }
        }
      }
    } catch (error) {
      console.error(`Groq API error (시도 ${attempt + 1}/${maxRetries}):`, error);
      if (String(error.message || "").includes("GROQ_RATE_LIMIT")) {
        // 바로 폴백 사용
        return generateFallbackReviews(menuText, sideText, originalKeywords, storeName);
      }
      if (attempt === maxRetries - 1) {
        throw error;
      }
      temperature = 0.4; // 재시도 시 temperature 낮춤
    }
  }

  // 검증 실패하거나 null이면 최소한의 리뷰 반환
  if (!reviews || reviews.length < 3) {
    console.warn("검증 실패 또는 리뷰 부족, 기본 리뷰 반환");
    return generateFallbackReviews(menuText, sideText, keywordsList, storeName);
  }

  return reviews;
}

// 검증 함수
function validateReviews(reviews, keywordsList, originalKeywords = [], requiredKeywords = []) {
  const errors = [];

    // 배열 2개인지 확인
    if (!Array.isArray(reviews) || reviews.length !== 2) {
      errors.push(`리뷰가 2개가 아님 (현재: ${reviews?.length || 0}개)`);
    return { isValid: false, errors };
  }

  // 각 리뷰 검증
  reviews.forEach((review, index) => {
    if (typeof review !== "string") {
      errors.push(`리뷰 ${index + 1}이 문자열이 아님`);
      return;
    }

    const length = review.length;

    // 길이 검증 (80~200자 범위)
    if (length < 80 || length > 200) {
      errors.push(`리뷰 ${index + 1} 길이 부적절 (${length}자, 허용: 80~200자)`);
    }

    // 장소 키워드가 한 문장에 2개 이상 들어가는지 확인
    const locationKeywords = (requiredKeywords || []).filter(isLocationKeyword);
    if (locationKeywords.length > 1) {
      const sentences = splitSentences(review);
      sentences.forEach((sentence) => {
        const hitCount = locationKeywords.filter((kw) => sentence.includes(kw)).length;
        if (hitCount > 1) {
          errors.push(`리뷰 ${index + 1}에 장소 키워드가 한 문장에 2개 이상 포함됨`);
        }
      });
    }

    // 필수 키워드 검증: 100% 포함 필수
    if (requiredKeywords && requiredKeywords.length > 0) {
      const missingRequired = [];
      
      
      requiredKeywords.forEach((keyword) => {
        const keywordTrimmed = String(keyword).trim();
        if (keywordTrimmed) {
          // 대소문자 구분 없이, 부분 일치로 체크
          const regex = new RegExp(keywordTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
          const found = regex.test(review);
          if (!found) {
            missingRequired.push(keywordTrimmed);
          }
        }
      });

      // 필수 키워드가 하나라도 누락되면 실패
      if (missingRequired.length > 0) {
        errors.push(`리뷰 ${index + 1}에 필수 키워드 누락 (${missingRequired.join(", ")})`);
      }
    }

    // 전체 키워드 검증: 나머지 키워드는 일부 포함되면 OK
    const otherKeywords = originalKeywords.filter(k => !requiredKeywords || !requiredKeywords.includes(k));
    if (otherKeywords.length > 0) {
      let keywordFoundCount = 0;
      otherKeywords.forEach((keyword) => {
        const keywordTrimmed = String(keyword).trim();
        if (keywordTrimmed) {
          const regex = new RegExp(keywordTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
          if (regex.test(review)) {
            keywordFoundCount++;
          }
        }
      });

      // 전체 키워드 중 최소 1개 이상 포함 권장 (필수는 아님, 필수 키워드가 이미 체크됨)
      if (keywordFoundCount === 0 && otherKeywords.length > 0) {
        // 경고만 표시, 에러는 아님 (필수 키워드만 필수)
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

// 비문 패턴 검증 함수
function checkGrammaticalErrors(reviews) {
  const errors = [];
  let hasError = false;

  // 비문 패턴: "명사+했어요", "명사하고 명사+했어요" 등
  // 허용: "시원했어요", "깔끔했어요" (형용사)
  // 금지: "국물했어요", "어국수했어요", "어국수하고 국물했어요" (명사)
  const forbiddenPatterns = [
    /(국물|어국수|어묵국수|국수|국|맛)(했어요|했음|했던|했고|했는데|하고\s+[가-힣]+했어요)/g,
    // "X하고 Y했어요" 패턴 체크
    /([가-힣]+(국물|어국수|어묵|국수))하고\s+([가-힣]+)(했어요|했음)/g,
  ];

  // 반복 문구 체크
  const forbiddenPhrases = [
    "다음에도 방문할 예정입니다",
    "가격 대비 만족스러웠어요",
    "친구들에게도 추천하고 싶습니다",
    "자주 찾을 수 있을 것 같습니다",
    "또 올게요",
  ];

  reviews.forEach((review, index) => {
    // 비문 패턴 체크
    forbiddenPatterns.forEach((pattern) => {
      const matches = review.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          errors.push(`리뷰 ${index + 1}에 비문 패턴 발견: "${match}"`);
          hasError = true;
        });
      }
    });

    // 반복 문구 체크 (같은 리뷰 내에서 2회 이상 사용)
    forbiddenPhrases.forEach((phrase) => {
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = review.match(regex);
      if (matches && matches.length > 1) {
        errors.push(`리뷰 ${index + 1}에 "${phrase}" 반복 사용 (${matches.length}회)`);
        hasError = true;
      }
    });

    // 3개 리뷰 간 동일 문구 반복 체크 (2개 이상 리뷰에서 동일 문구 사용)
    forbiddenPhrases.forEach((phrase) => {
      const count = reviews.filter(r => r.includes(phrase)).length;
      if (count >= 2 && review.includes(phrase)) {
        errors.push(`리뷰 ${index + 1}에 "${phrase}" 사용 (전체 ${count}개 리뷰에서 반복)`);
        hasError = true;
      }
    });
  });

  return {
    hasError: hasError,
    errors: errors,
  };
}

// ========== 템플릿 기반 폴백 ==========
// 템플릿 생성 로직은 templates.js에서 가져옴
const { generateReviews: generateTemplateReviews } = require("./templates.js");

function generateFallbackReviews(menuText, sideText, keywordsBundle, storeName = "어국수") {
  // 템플릿 기반 생성 사용
  // menuText는 문자열이거나 배열일 수 있으므로 배열로 변환
  const menus = typeof menuText === "string" ? menuText.split("과 ").filter(Boolean) : [menuText];
  const sides = sideText ? sideText.split(", ").filter(Boolean) : [];
  
  try {
    return generateTemplateReviews({
      storeName: storeName || "어국수",
      menus: menus,
      sides: sides,
      keywordsBundle: keywordsBundle || [],
      targetLength: 300,
    });
  } catch (error) {
    console.error("Template generation error:", error);
    // 템플릿 생성 실패 시 간단한 폴백
    const k1 = keywordsBundle?.[0] || "";
    return [
      `${menuText}${k1 ? ` ${k1}` : ""} 먹었어요.${sideText ? ` ${sideText}도 주문했는데 괜찮았습니다.` : ""} 맛이 제대로 느껴졌어요.`,
      `${menuText} 주문했습니다. 포장 상태도 좋았어요.${sideText ? ` ${sideText}도 함께 시켰는데` : ""} 괜찮았습니다.`,
      `${menuText} 시켰어요. 양도 충분했습니다.${sideText ? ` ${sideText}도` : ""} 같이 먹으니 좋았어요.`,
    ];
  }
}
