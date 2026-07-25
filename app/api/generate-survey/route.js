import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json({ success: false, error: "API key is missing." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const body = await request.json();
    
    const { topic, target, draftText, fileBase64, mimeType, mcqType, mcqCount, subjectiveCount, lang } = body;

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

    // 원래 잘 작동하던 모델명 유지
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: parts,
      config: {
        responseMimeType: "application/json"
      }
    });

    let rawText = response.text || "";

    // 1. 마크다운 제거
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. 가장 바깥쪽 { ... } 만 추출 (여분의 ] 나 다른 텍스트 제거)
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      rawText = rawText.substring(firstBrace, lastBrace + 1);
    }

    // 3. trailing comma 제거 (}, ] 앞에 있는 ,)
    rawText = rawText.replace(/,\s*([}\]])/g, '$1');

    let surveyData;
    try {
      surveyData = JSON.parse(rawText);
    } catch (error) {
      console.error("JSON 파싱 에러 발생:", error);
      console.error("문제가 된 텍스트 원본:", rawText);
      
      return NextResponse.json(
        { success: false, error: "AI가 올바른 형식(JSON)으로 응답하지 않았습니다. 다시 시도해 주세요." },
        { status: 500 } 
      );
    }

    // 기본 검증
    if (!surveyData || !Array.isArray(surveyData.questions)) {
      return NextResponse.json(
        { success: false, error: "생성된 설문 데이터 형식이 올바르지 않습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: surveyData });

  } catch (error) {
    console.error("서버 내부 오류 발생:", error);
    return NextResponse.json(
      { success: false, error: "서버 통신 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}