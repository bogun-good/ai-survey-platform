import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  // body 변수를 try/catch 바깥 스코프에 선언
  let body = {};

  try {
    // 1. 요청 바디는 한 번만 읽습니다.
    body = await request.json();
  } catch (parseError) {
    console.error("요청 바디 JSON 파싱 실패:", parseError);
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { topic, target, draftText, fileBase64, mimeType, mcqType, mcqCount = 3, subjectiveCount = 2, lang = 'ko' } = body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY가 설정되지 않아 폴백 설문을 생성합니다.");
      const fallbackData = generateFallbackSurvey(topic, target, draftText, mcqType, mcqCount, subjectiveCount, lang);
      return NextResponse.json({ success: true, data: fallbackData });
    }

    const ai = new GoogleGenAI({ apiKey });

    let sourceDescription = "";
    let textSection = "";

    if (topic && target) {
      sourceDescription = `the topic "${topic}" and target audience "${target}"`;
    } else if (fileBase64) {
      sourceDescription = "the attached document";
    } else {
      sourceDescription = "the following draft text";
      textSection = draftText ? `\n--- DRAFT TEXT ---\n${draftText}\n------------------\n` : "";
    }

    let mcqInstruction = "";
    if (mcqType === "ox") {
      mcqInstruction = 'provide exactly 2 options (e.g., "O/X", "True/False", "Yes/No" appropriately translated in the requested language).';
    } else if (mcqType === "4") {
      mcqInstruction = 'provide exactly 4 distinct and meaningful options.';
    } else if (mcqType === "5") {
      mcqInstruction = 'provide exactly 5 distinct and meaningful options.';
    } else {
      mcqInstruction = 'provide 4 to 5 distinct and meaningful options.';
    }

    const promptText = `
      You are an expert survey designer. Create a professional survey in language code "${lang}" based strictly on ${sourceDescription} provided by the user.
      ${textSection}
      Requirements:
      - Multiple Choice Questions (객관식) count: ${mcqCount}
      - Subjective Questions (주관식) count: ${subjectiveCount}

      CRITICAL RULES:
      1. Every question must be highly relevant to the source material or topic.
      2. For multiple-choice questions (type: "mcq"), ${mcqInstruction}
      3. For subjective questions (type: "subjective"), omit the "options" field or leave it as an empty array [].
      4. Return the output STRICTLY in valid JSON format. Do not include any markdown formatting like \`\`\`json.
      5. Do not add any extra characters, trailing commas, or additional brackets outside the root JSON object.

      JSON structure format:
      {
        "questions": [
          {
            "id": 1,
            "type": "mcq",
            "question": "Question derived from the material?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
          },
          {
            "id": 2,
            "type": "subjective",
            "question": "Open-ended question derived from the material?",
            "options": []
          }
        ]
      }
    `;

    const parts = [{ text: promptText }];

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      });
    }

    // 올바른 Gemini 모델 목록
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash-8b'
    ];

    let response = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`[Gemini AI] Attempting generation with model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: parts,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response && response.text) {
          console.log(`[Gemini AI] Successfully generated content using model: ${modelName}`);
          break;
        }
      } catch (err) {
        console.warn(`[Gemini AI] Model ${modelName} failed:`, err.message || err);
      }
    }

    let surveyData;

    if (response && response.text) {
      let rawText = response.text || "";

      // 마크다운 및 감싸진 문자열 정리
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        rawText = rawText.substring(firstBrace, lastBrace + 1);
      }

      rawText = rawText.replace(/,\s*([}\]])/g, '$1');

      try {
        surveyData = JSON.parse(rawText);
      } catch (error) {
        console.error("JSON 파싱 에러 발생:", error);
      }
    }

    // AI 결과 생성이 안 되었을 경우 폴백 작동
    if (!surveyData || !Array.isArray(surveyData.questions)) {
      console.warn("[Gemini AI] Fallback triggered. Generating structured template survey.");
      surveyData = generateFallbackSurvey(topic, target, draftText, mcqType, mcqCount, subjectiveCount, lang);
    }

    return NextResponse.json({ success: true, data: surveyData });

  } catch (error) {
    console.error("서버 내부 예외 발생, 폴백 생성 진행:", error);
    // 이미 파싱된 body 데이터로 안전하게 폴백 생성 (request.json() 재호출 안 함)
    const fallbackData = generateFallbackSurvey(
      topic, target, draftText, mcqType, mcqCount, subjectiveCount, lang
    );
    return NextResponse.json({ success: true, data: fallbackData });
  }
}

// 스마트 폴백 설문 생성 함수
function generateFallbackSurvey(topic, target, draftText, mcqType, mcqCount = 3, subjectiveCount = 2, lang = 'ko') {
  const isKo = lang === 'ko';
  const subject = topic || target || (draftText ? draftText.substring(0, 25) : '설문 주제');
  const questions = [];

  const mCount = Number(mcqCount) || 0;
  const sCount = Number(subjectiveCount) || 0;

  for (let i = 1; i <= mCount; i++) {
    let options = [];
    if (mcqType === 'ox') {
      options = isKo ? ['예 (O)', '아니오 (X)'] : ['Yes (O)', 'No (X)'];
    } else if (mcqType === '5') {
      options = isKo
        ? ['매우 그렇다', '그렇다', '보통이다', '그렇지 않다', '매우 그렇지 않다']
        : ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'];
    } else {
      options = isKo
        ? ['매우 만족', '만족', '보통', '불만족']
        : ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'];
    }

    questions.push({
      id: i,
      type: 'mcq',
      question: isKo 
        ? `[${subject}] 관련 객관식 문항 ${i}: 이에 대해 전반적으로 어떻게 생각하십니까?`
        : `[${subject}] Question #${i}: What is your overall opinion on this?`,
      options
    });
  }

  for (let j = 1; j <= sCount; j++) {
    questions.push({
      id: mCount + j,
      type: 'subjective',
      question: isKo 
        ? `[${subject}] 관련 주관식 문항 ${j}: 추가적인 의견이나 바라는 점을 자유롭게 작성해 주세요.`
        : `[${subject}] Open Question #${j}: Please share any additional thoughts or suggestions.`,
      options: []
    });
  }

  return { questions };
}