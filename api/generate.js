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
    const { storeName, menus, sides, keywordsBundle, targetLength, nonce } = req.body;

    if (!menus || menus.length === 0) {
      return res.status(400).json({ error: "메뉴가 필요합니다" });
    }

    // 메뉴 텍스트 생성
    const menuText = menus.length === 1 ? menus[0] : menus.join("과 ");
    const sideText = sides && sides.length > 0 ? sides.join(", ") : "";
    
    // 키워드를 자연어 phrase로 변환
    const keywordsPhrases = convertKeywordsToPhrases(keywordsBundle || []);
    const keywordsText = keywordsPhrases.join(", ");

    // API 선택: GROQ_API_KEY가 있으면 Groq, 없으면 템플릿 폴백
    const groqKey = process.env.GROQ_API_KEY;

    let reviews = [];

    if (groqKey) {
      // Groq API 사용 (OpenAI-compatible)
      reviews = await generateWithGroq(menuText, sideText, keywordsText, keywordsPhrases, storeName, targetLength, groqKey);
    } else {
      // API 키가 없으면 템플릿 기반 생성 (폴백)
      console.warn("API 키가 없어 템플릿 기반 생성 사용");
      console.warn("GROQ_API_KEY:", groqKey ? "있음 (마스킹됨)" : "없음");
      reviews = generateFallbackReviews(menuText, sideText, keywordsBundle || []);
    }

    // 최소 3개 리뷰 보장 (API 호출 실패 시에만)
    if (reviews.length < 3) {
      console.warn("리뷰가 3개 미만, 기본 템플릿 사용");
      const kb = keywordsBundle || [];
      reviews = generateFallbackReviews(menuText, sideText, kb);
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
async function generateWithGroq(menuText, sideText, keywordsText, keywordsPhrases, storeName, targetLength, apiKey) {
  const keywordsList = keywordsPhrases || (keywordsText ? keywordsText.split(", ").filter((k) => k.trim()) : []);
  
  // 검증 및 재시도 로직
  let reviews = null;
  let temperature = 0.8;
  const maxRetries = 3; // 비문 재생성 포함해서 3회
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const prompt = `네이버 영수증 리뷰 3개를 작성해줘.

조건:
- 매장명: ${storeName}
- 주문: ${menuText}
${sideText ? `- 함께 먹은 것: ${sideText}` : ""}
${keywordsList.length > 0 ? `- 포함 키워드(각 리뷰에 자연스럽게 1회만): ${keywordsText}` : ""}
- 각 리뷰는 230~320자
- 말투는 실제 방문자가 쓴 자연스러운 한국어(과장 X)
- 같은 문장/표현 반복 금지
${attempt > 0 ? "- 특히 \"친절\", \"추천\", \"가격 대비\", \"재방문\", \"또 올게요\" 같은 상투어 반복 금지" : ""}
- 비문 금지: "국물했어요", "어국수했어요" 같은 "명사+했어요" 패턴 절대 금지
- 키워드는 조사/어미를 붙여서 자연스럽게만 사용 (예: "국물이 진했어요", "어국수에서 먹었어요")
${attempt > 1 ? "- 반드시 조사/어미를 붙여서 자연스럽게 표현하세요. "X했어요" 같은 비문 패턴을 절대 사용하지 마세요." : ""}
- 3개는 서로 톤이 달라야 함:
  1) 담백/정보형  2) 감정 조금 있는 후기형  3) 디테일 묘사형

출력 형식:
반드시 JSON 배열만 출력
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
      const validation = validateReviews(extractedReviews, keywordsList);
      
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
    return generateFallbackReviews(menuText, sideText, keywordsList);
  }

  return reviews;
}

// 검증 함수
function validateReviews(reviews, keywordsList) {
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

    // 키워드 검증 (각 키워드가 1회만 포함되어야 함)
    keywordsList.forEach((keyword) => {
      const keywordTrimmed = keyword.trim();
      if (keywordTrimmed) {
        // 키워드 phrase에서 핵심 단어 추출 (예: "국물이 진했어요" → "국물")
        const coreKeyword = keywordTrimmed.split(/[이가을를에에서]/)[0].trim();
        if (coreKeyword) {
          const regex = new RegExp(coreKeyword, "g");
          const matches = review.match(regex);
          const count = matches ? matches.length : 0;

          if (count === 0) {
            errors.push(`리뷰 ${index + 1}에 키워드 "${coreKeyword}" 없음`);
          } else if (count > 2) {
            // phrase 형태로 변환했으므로 1-2회 정도는 허용
            errors.push(`리뷰 ${index + 1}에 키워드 "${coreKeyword}" ${count}회 포함 (과도함)`);
          }
        }
      }
    });
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

  // 비문 패턴: "명사+했어요", "명사+했음", "명사+했던" 등
  // 허용: "시원했어요", "깔끔했어요" (형용사)
  // 금지: "국물했어요", "어국수했어요" (명사)
  const forbiddenPatterns = [
    /(국물|어국수|어묵국수|국수|국)(했어요|했음|했던|했고|했는데)/g,
    // 일반적인 명사+했어요 패턴 (너무 포괄적이므로 주석 처리)
    // /([가-힣]+국물|[가-힣]+국수|[가-힣]+어국수)(했어요|했음)/g,
  ];

  reviews.forEach((review, index) => {
    forbiddenPatterns.forEach((pattern) => {
      const matches = review.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          errors.push(`리뷰 ${index + 1}에 비문 패턴 발견: "${match}"`);
          hasError = true;
        });
      }
    });
  });

  return {
    hasError: hasError,
    errors: errors,
  };
}

// ========== 템플릿 기반 폴백 ==========
function generateFallbackReviews(menuText, sideText, keywordsBundle) {
  const k1 = keywordsBundle[0] || "";
  const k2 = keywordsBundle[1] || "";
  const k3 = keywordsBundle[2] || "";

  // 간단한 템플릿 (후처리로 늘리지 않음)
  const reviews = [
    `${menuText}${k1 ? ` ${k1}` : ""} 먹었어요.${sideText ? ` ${sideText}도 주문했는데 괜찮았습니다.` : ""} ${menuText}의 맛이 제대로 느껴졌어요.`,
    `${menuText} 주문했습니다.${k2 ? ` ${k2}했고` : ""} 포장 상태도 좋았어요.${sideText ? ` ${sideText}도 함께 시켰는데` : ""} 괜찮았습니다.`,
    `${menuText} 시켰어요.${k3 ? ` ${k3}` : ""} 했고 양도 충분했습니다.${sideText ? ` ${sideText}도` : ""} 같이 먹으니 좋았어요.`,
  ];

  return reviews;
}
