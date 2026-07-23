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
    
    // 💡 수정됨: 프론트엔드에서 보내는 mcqType(객관식 유형) 추가
    const { topic, target, draftText, fileBase64, mimeType, mcqType, mcqCount, subjectiveCount, lang } = body;

    // 전달받은 데이터(모드)에 따라 프롬프트 문맥 동적 변경
    let sourceDescription = "";
    let textSection = "";

    if (topic && target) {
      // 모드 1: 주제와 대상이 있는 경우
      sourceDescription = `the topic "${topic}" and target audience "${target}"`;
    } else if (fileBase64) {
      // 모드 3: 첨부 파일이 있는 경우
      sourceDescription = "the attached document";
    } else {
      // 모드 2: 텍스트(초안)가 있는 경우
      sourceDescription = "the following draft text";
      textSection = draftText ? `\n--- DRAFT TEXT ---\n${draftText}\n------------------\n` : "";
    }

    // 💡 수정됨: mcqType에 따라 객관식 보기 생성 지시어 동적 생성
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
    
    // 파일 데이터가 넘어오면 inlineData로 추가
    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      });
    }

    // Gemini API 호출
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: parts,
      config: {
        responseMimeType: "application/json"
      }
    });

    let rawText = response.text || "";
    rawText = rawText.replace(/```json/i, '').replace(/```/g, '').trim();
    const surveyData = JSON.parse(rawText);

    return NextResponse.json({ success: true, data: surveyData });
    
  } catch (error) {
    console.error('Gemini API Error Detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}