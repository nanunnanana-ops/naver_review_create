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
    const keywordsText = (keywordsBundle || []).join(", ");

    // API 선택: GROQ_API_KEY가 있으면 Groq, 없으면 템플릿 폴백
    const groqKey = process.env.GROQ_API_KEY;

    let reviews = [];

    if (groqKey) {
      // Groq API 사용 (OpenAI-compatible)
      reviews = await generateWithGroq(menuText, sideText, keywordsText, storeName, targetLength, groqKey);
    } else {
      // API 키가 없으면 템플릿 기반 생성 (폴백)
      console.warn("API 키가 없어 템플릿 기반 생성 사용");
      console.warn("GROQ_API_KEY:", groqKey ? "있음 (마스킹됨)" : "없음");
      reviews = generateFallbackReviews(menuText, sideText, keywordsBundle || []);
    }

    // 최소 3개 리뷰 보장
    if (reviews.length < 3) {
      const kb = keywordsBundle || [];
      const templates = [
        `${menuText} 먹었는데 맛있었어요. ${kb[0] || "좋았어요"}.`,
        `${menuText} 주문했어요. ${kb[1] || "만족스러웠어요"}.`,
        `${menuText} 시켰는데 ${kb[2] || "괜찮았어요"}.`,
      ];
      while (reviews.length < 3) {
        reviews.push(templates[reviews.length] || `${menuText} 먹었어요.`);
      }
    }

    // 글자 수 조정 (200~400글자)
    reviews = reviews.map((review) => {
      const length = review.length;
      if (length < 200) {
        // 짧으면 내용 추가
        const additions = [
          " 다음에도 방문할 예정입니다.",
          " 가격 대비 만족스러웠어요.",
          " 친구들에게도 추천하고 싶습니다.",
          " 분위기도 좋고 맛도 좋았습니다.",
        ];
        const addition = additions[Math.floor(Math.random() * additions.length)];
        return review + addition;
      } else if (length > 400) {
        // 길면 자르기
        return review.substring(0, 397) + "...";
      }
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

// ========== Groq API (OpenAI-compatible) ==========
async function generateWithGroq(menuText, sideText, keywordsText, storeName, targetLength, apiKey) {
  const prompt = `네이버 플레이스 영수증 리뷰를 작성해주세요.

요구사항:
- 매장명: ${storeName}
- 주문한 메뉴: ${menuText}
${sideText ? `- 함께 먹은 것: ${sideText}` : ""}
- 반드시 포함할 키워드: ${keywordsText}
- 글자 수: ${targetLength || 300}글자 내외 (200~400글자)
- 자연스럽고 진짜 손님이 쓴 것 같은 말투로 작성
- 키워드는 문장 속에 자연스럽게 1회씩만 포함
- 키워드를 나열하지 말고 문장으로 자연스럽게 표현
- 3개의 서로 다른 스타일의 리뷰를 작성 (말투, 감정 강도, 문장 구조가 다르게)

응답 형식: JSON 배열로 3개의 리뷰만 반환
예시: ["리뷰1", "리뷰2", "리뷰3"]
다른 설명 없이 JSON 배열만 반환해주세요.`;

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
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${errorData}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content?.trim() || "";

    // JSON 배열 추출
    let reviews = [];
    try {
      // JSON 파싱
      const parsed = JSON.parse(responseText);
      // JSON 객체에서 배열 추출
      if (Array.isArray(parsed.reviews)) {
        reviews = parsed.reviews;
      } else if (Array.isArray(parsed)) {
        reviews = parsed;
      } else {
        // 객체의 키에서 배열 찾기
        const keys = Object.keys(parsed);
        for (const key of keys) {
          if (Array.isArray(parsed[key])) {
            reviews = parsed[key];
            break;
          }
        }
      }
    } catch (parseError) {
      // JSON 배열 찾기 시도
      const jsonMatch = responseText.match(/\[(.*?)\]/s);
      if (jsonMatch) {
        try {
          reviews = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // 줄바꿈으로 분리 시도
          reviews = responseText
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.startsWith("[") && !line.startsWith("]"))
            .map((line) => line.replace(/^["']|["']$/g, "").replace(/^-\s*/, ""))
            .filter((line) => line.length > 200)
            .slice(0, 3);
        }
      }
    }

    return reviews.slice(0, 3);
  } catch (error) {
    console.error("Groq API error:", error);
    throw error;
  }
}

// ========== 템플릿 기반 폴백 ==========
function generateFallbackReviews(menuText, sideText, keywordsBundle) {
  const templates = [
    () => {
      const k1 = keywordsBundle[0] || "맛있었어요";
      const k2 = keywordsBundle[1] || "좋았어요";
      if (sideText) {
        return `${menuText} 먹었는데 ${k1}하고 ${k2}했어요. ${sideText}도 괜찮았습니다.`;
      }
      return `${menuText} 먹었는데 ${k1}하고 ${k2}했어요. 다음에 또 올게요.`;
    },
    () => {
      const k1 = keywordsBundle[0] || "맛있었어요";
      if (sideText) {
        return `${menuText} 주문했어요. ${k1}하고 ${sideText}도 함께 먹으니 좋았습니다.`;
      }
      return `${menuText} 주문했어요. ${k1}해서 만족스러웠어요.`;
    },
    () => {
      const k1 = keywordsBundle[0] || "괜찮았어요";
      const k2 = keywordsBundle[1] || "좋았어요";
      if (sideText) {
        return `${menuText} 시켰는데 ${k1}했어요. ${sideText}도 ${k2}습니다.`;
      }
      return `${menuText} 시켰는데 ${k1}했어요. ${k2}습니다.`;
    },
  ];

  return templates.map((template) => {
    let review = template();
    // 200~400글자 내외로 조정
    while (review.length < 200) {
      const additions = [
        " 다음에도 방문할 예정입니다.",
        " 가격 대비 만족스러웠어요.",
        " 친구들에게도 추천하고 싶습니다.",
        " 분위기도 좋고 맛도 좋았습니다.",
        " 사장님도 친절하시고 음식도 맛있었어요.",
        " 자주 찾을 수 있을 것 같습니다.",
        " 주변에 소개하고 싶은 맛집입니다.",
      ];
      const addition = additions[Math.floor(Math.random() * additions.length)];
      review = review + addition;
    }
    if (review.length > 400) {
      review = review.substring(0, 397) + "...";
    }
    return review;
  });
}
