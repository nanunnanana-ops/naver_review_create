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
    const { storeName, menus, sides, keywordsBundle, requiredKeywords, targetLength, nonce } = req.body;

    // 디버깅: 받은 데이터 확인
    console.log('=== API 요청 받음 ===');
    console.log('requiredKeywords (원본):', requiredKeywords);
    console.log('requiredKeywords 타입:', typeof requiredKeywords, Array.isArray(requiredKeywords));
    console.log('requiredKeywords 개수:', requiredKeywords ? requiredKeywords.length : 0);
    console.log('keywordsBundle:', keywordsBundle);

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
    const requiredKeywordsArray = Array.isArray(requiredKeywords) ? requiredKeywords : (requiredKeywords ? [requiredKeywords] : []);
    console.log('필수 키워드 배열 (확인):', requiredKeywordsArray);
    
    const requiredKeywordsPhrases = requiredKeywordsArray.length > 0
      ? convertKeywordsToPhrases(requiredKeywordsArray)
      : [];
    const requiredKeywordsText = requiredKeywordsPhrases.join(", ");
    
    console.log('필수 키워드 phrase 변환 결과:', requiredKeywordsPhrases);
    console.log('필수 키워드 phrase 텍스트:', requiredKeywordsText);
    
    // 원본 키워드 목록 (검증용 - phrase 변환 전)
    const originalKeywords = keywordsBundle || [];

    // API 선택: GROQ_API_KEY가 있으면 Groq, 없으면 템플릿 폴백
    const groqKey = process.env.GROQ_API_KEY;

    let reviews = [];

    if (groqKey) {
      // Groq API 사용 (OpenAI-compatible)
      const requiredKeywordsPhrases = requiredKeywords && requiredKeywords.length > 0
        ? convertKeywordsToPhrases(requiredKeywords)
        : [];
      const requiredKeywordsText = requiredKeywordsPhrases.join(", ");
      reviews = await generateWithGroq(menuText, sideText, keywordsText, keywordsPhrases, originalKeywords, requiredKeywords || [], requiredKeywordsText, storeName, targetLength, groqKey);
    } else {
      // API 키가 없으면 템플릿 기반 생성 (폴백)
      console.warn("API 키가 없어 템플릿 기반 생성 사용");
      console.warn("GROQ_API_KEY:", groqKey ? "있음 (마스킹됨)" : "없음");
      reviews = generateFallbackReviews(menuText, sideText, keywordsBundle || [], storeName);
    }

    // 최소 3개 리뷰 보장 (API 호출 실패 시에만)
    if (reviews.length < 3) {
      console.warn("리뷰가 3개 미만, 기본 템플릿 사용");
      const kb = keywordsBundle || [];
      reviews = generateFallbackReviews(menuText, sideText, kb, storeName);
    }

    // 길이 검증만 수행 (후처리로 늘리지 않음)
    reviews = reviews.map((review, index) => {
      const length = review.length;
      // 400자 초과 시에만 자르기
      if (length > 400) {
        console.warn(`리뷰 ${index + 1}이 너무 김 (${length}자), 자름`);
        return review.substring(0, 397) + "...";
      }
      // 200자 미만이어도 후처리로 늘리지 않음 (API가 생성한 그대로 사용)
      return review;
    });

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
async function generateWithGroq(menuText, sideText, keywordsText, keywordsPhrases, originalKeywords, requiredKeywords, requiredKeywordsText, storeName, targetLength, apiKey) {
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
    
    const prompt = `네이버 영수증 리뷰 3개를 작성해줘.

[필수 조건]
- 매장명: ${storeName}
- 주문: ${menuText}
${sideText ? `- 함께 먹은 것: ${sideText}` : ""}
${keywordsSection ? keywordsSection + "\n" : ""}

[작성 규칙 - 절대 위반 금지]
1. 길이: 각 리뷰 230~320자
2. 비문 절대 금지:
   ❌ "국물했어요", "어국수했어요", "어국수하고 국물했어요" 같은 패턴
   ✅ "국물이 진했어요", "어국수에서 먹었어요", "어국수 맛이 좋았어요"
   - 명사 뒤에는 반드시 조사(이/가/을/를/에서/의 등)를 붙이고, 동사/형용사로 연결
   - "X하고 Y했어요" 같은 비문 절대 금지

3. 반복 금지 (같은 문장/표현을 리뷰 내에서 또는 3개 리뷰 간에 반복 불가):
${forbiddenPhrases.map(p => `   - "${p}"`).join('\n')}
   - 위 문구들은 절대 사용하지 마세요

4. 각 리뷰마다 다른 톤:
   1) 담백/정보형: 사실만 간단히 서술
   2) 감정 후기형: 약간의 감정 표현 포함
   3) 디테일 묘사형: 구체적인 묘사와 경험

5. 필수 키워드 포함 (절대 필수):
${requiredKeywordsText ? `   - 필수 키워드는 위 [필수 조건]에 명시된 "필수 키워드"를 의미합니다` : ""}
${requiredKeywords && requiredKeywords.length > 0 ? `   - 필수 키워드 목록 (원본): ${requiredKeywords.join(", ")}` : ""}
   - 위 필수 키워드들은 각 리뷰마다 반드시 100% 자연스럽게 포함해야 합니다
   - 키워드를 나열하지 말고 문장 속에 자연스럽게 녹여야 합니다
   - 필수 키워드가 하나라도 누락되면 안 됩니다

${attempt > 0 ? `[중요] 이전 결과에서 키워드 포함 부족, 비문, 또는 반복이 발견되었습니다. 위 규칙을 더욱 엄격히 준수하세요. 특히 키워드를 반드시 포함하세요.` : ""}

출력 형식:
JSON 배열만 출력 (설명 없이)
["리뷰1","리뷰2","리뷰3"]`;

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

  // 배열 3개인지 확인
  if (!Array.isArray(reviews) || reviews.length !== 3) {
    errors.push(`리뷰가 3개가 아님 (현재: ${reviews?.length || 0}개)`);
    return { isValid: false, errors };
  }

  // 각 리뷰 검증
  reviews.forEach((review, index) => {
    if (typeof review !== "string") {
      errors.push(`리뷰 ${index + 1}이 문자열이 아님`);
      return;
    }

    const length = review.length;

    // 길이 검증 (230~320자 목표, 200~400 허용 범위)
    if (length < 200 || length > 400) {
      errors.push(`리뷰 ${index + 1} 길이 부적절 (${length}자, 목표: 230~320자, 허용: 200~400자)`);
    }

    // 필수 키워드 검증: 100% 포함 필수
    if (requiredKeywords && requiredKeywords.length > 0) {
      const missingRequired = [];
      
      requiredKeywords.forEach((keyword) => {
        const keywordTrimmed = String(keyword).trim();
        if (keywordTrimmed) {
          // 대소문자 구분 없이, 부분 일치로 체크
          const regex = new RegExp(keywordTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
          if (!regex.test(review)) {
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
