import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interaction, language } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "AI API key is missing or invalid on the server. Please configure it in .env.local" },
        { status: 500 }
      );
    }

    if (!interaction) {
      return NextResponse.json({ success: false, error: "Missing interaction data" }, { status: 400 });
    }

    const systemInstruction = `You are a medical information explanation assistant.
You are NOT a doctor.
You must explain ONLY the verified interaction information provided in the input.
Never invent drug interactions, medical facts, dosages, diagnoses, contraindications, or sources.
Never tell the user to start, stop, replace, or change medication.
Never provide personalized treatment instructions.
If the provided information is insufficient, say that there is insufficient information and recommend consulting a qualified healthcare professional.
Use simple, understandable language.
Clearly distinguish between verified information and general safety guidance.

Return a strict JSON object with these keys ONLY:
- "summary": A brief, plain language summary of the interaction.
- "why_it_matters": Explanation of the clinical concern provided in the data.
- "possible_concern": What the patient should be aware of based on the clinical effect.
- "what_to_do": Safe advice strictly matching the recommendation provided. MUST tell patient to discuss with a healthcare professional. DO NOT advise stopping medication.
- "professional_guidance": Reiterate that they should consult a doctor or pharmacist.
- "source": The source name provided in the input.

${language === 'hi' ? 'IMPORTANT: Write all the values in simple Hindi language (Devanagari script). Keep the JSON keys in English. Do not translate medicine names unnecessarily.' : 'Output must be in simple English.'}`;

    const prompt = `Verified Interaction Data:
Type: ${interaction.type}
Medicines: ${interaction.medicineA} and ${interaction.medicineB}
Severity: ${interaction.severity}
Description: ${interaction.description}
Clinical Effect: ${interaction.clinicalEffect || 'Same as description'}
Recommendation: ${interaction.recommendation}
Source Name: ${interaction.sourceName}`;

    console.log(`[AI Explanation API] Language: ${language}`);
    console.log(`[AI Explanation API] Input Interaction: ${interaction.medicineA} + ${interaction.medicineB} (${interaction.severity})`);

    let result = null;
    let lastError = null;
    const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-flash-latest"];
    const MAX_RETRIES = 2;

    for (const modelName of MODELS) {
      if (result) break;
      const currentModel = genAI.getGenerativeModel({ model: modelName });
      let attempt = 0;
      
      while (attempt <= MAX_RETRIES) {
        try {
          console.log(`[AI Explanation API] Attempt ${attempt + 1}/${MAX_RETRIES + 1} with model ${modelName}`);
          result = await currentModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction,
            generationConfig: {
              responseMimeType: "application/json",
            },
          });
          break; // Success
        } catch (err) {
          lastError = err;
          const errString = String(err);
          if (errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("high demand") || errString.includes("500") || errString.includes("429")) {
            console.warn(`[AI Explanation API] High Demand/Timeout on ${modelName}. Retrying...`);
            if (attempt < MAX_RETRIES) {
              const delay = Math.pow(2, attempt) * 1000;
              await new Promise(res => setTimeout(res, delay));
            }
            attempt++;
          } else {
            throw err; // Not a 503, throw immediately
          }
        }
      }
    }

    if (!result) {
      throw new Error(`AI explanation failed after exhausting retries and fallbacks. Last error: ${lastError?.message || lastError}`);
    }

    const text = result.response.text();
    console.log(`[AI Explanation API] Response generated successfully.`);
    const aiExplanation = JSON.parse(text);

    return NextResponse.json({ success: true, explanation: aiExplanation });
  } catch (error: unknown) {
    console.error("Explain Interaction API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while generating explanation." },
      { status: 500 }
    );
  }
}
