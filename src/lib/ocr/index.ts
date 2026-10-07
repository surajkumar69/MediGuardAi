import { GoogleGenAI } from '@google/genai';

export interface OcrResult {
  text: string;
  isDemo: boolean;
  geminiCandidates?: {
    name: string;
    originalText: string;
    confidence: number;
    needs_verification: boolean;
  }[];
}

export interface OcrProvider {
  extractText(fileBuffer: Buffer, mimeType: string): Promise<OcrResult>;
}

export async function processPrescriptionImage(fileBuffer: Buffer, mimeType: string): Promise<OcrResult> {
  const useRealOcr = process.env.ENABLE_REAL_OCR === 'true';
  const apiKey = process.env.GEMINI_API_KEY;

  if (useRealOcr) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing or invalid. Please configure it in .env.local');
    }
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert medical OCR system. Read this prescription image very carefully.
Extract the visible text and identify any medicine names (including dosages or instructions).
Return a valid JSON object strictly matching this schema:
{
  "rawText": "Exact text you see on the prescription",
  "medicines": [
    {
      "name": "Normalized medicine name (e.g. Aspirin)",
      "originalText": "Exact text snippet from image (e.g. Aspirin 75mg daily)",
      "confidence": 0.95,
      "needs_verification": false
    }
  ]
}
RULES:
1. Do NOT invent or guess medicines that are not in the image.
2. If you are unsure about a medicine name, set "needs_verification" to true and confidence lower than 0.8.
3. Do NOT detect drug interactions.
4. Output ONLY the raw JSON string. Do NOT wrap in markdown \`\`\`json.`;

      console.log(`[OCR] Request Started | Size: ${fileBuffer.length} bytes | MIME: ${mimeType}`);

      const MODELS = ['gemini-3.8-flash', 'gemini-flash-lite-latest'];
      const MAX_RETRIES = 1;
      let response = null;
      let lastError = null;

      for (const model of MODELS) {
        if (response) break;
        let attempt = 0;
        
        while (attempt <= MAX_RETRIES) {
          try {
            console.log(`[OCR] Attempt ${attempt + 1}/${MAX_RETRIES + 1} with model ${model}`);
            const apiPromise = ai.models.generateContent({
              model: model,
              contents: [
                prompt,
                {
                  inlineData: {
                    data: fileBuffer.toString("base64"),
                    mimeType: mimeType,
                  },
                }
              ],
              config: {
                temperature: 0.1,
                responseMimeType: "application/json",
              }
            });

            // 15 second timeout to prevent the 60s serverless function from crashing
            let timeoutId: ReturnType<typeof setTimeout>;
            const timeoutPromise = new Promise<never>((_, reject) => {
              timeoutId = setTimeout(() => reject(new Error("Gemini API request timed out after 15 seconds")), 15000);
            });

            const responseObj = await Promise.race([apiPromise, timeoutPromise]);
            clearTimeout(timeoutId!);
            response = responseObj;
            break; // Success!
          } catch (err) {
            lastError = err;
            const errString = String(err);
            if (errString.includes("503") || errString.includes("UNAVAILABLE") || errString.includes("high demand") || errString.includes("500") || errString.includes("429") || errString.includes("timed out")) {
              console.warn(`[OCR] High Demand/Timeout on ${model}. Retrying...`);
              if (attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(res => setTimeout(res, delay));
              }
              attempt++;
            } else {
              throw err; // Not a retryable error
            }
          }
        }
      }

      if (!response) {
        throw new Error(`OCR processing failed after exhausting retries and fallbacks. Last error: ${lastError?.message || lastError}`);
      }

      // @ts-expect-error property text exists on response but TS might complain depending on SDK version
      const responseText = response.text;
      
      if (!responseText) {
        throw new Error("Received empty result from Gemini Vision API.");
      }

      // Safely strip any markdown formatting that Gemini might accidentally include
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      console.log(`[OCR] Response Received | Raw Text Length: ${parsed.rawText?.length || 0} | Candidates Found: ${parsed.medicines?.length || 0}`);

      if (!parsed.rawText && (!parsed.medicines || parsed.medicines.length === 0)) {
        throw new Error("Unreadable image or empty prescription. No medicines found.");
      }

      return {
        text: parsed.rawText || "",
        isDemo: false,
        geminiCandidates: parsed.medicines || []
      };
      
    } catch (error) {
      console.error("Gemini OCR Error:", error);
      // DO NOT silently fallback if Real OCR was explicitly requested but failed.
      // Throw a clear user-friendly error.
      throw new Error(`OCR processing failed: ${(error as Error).message}`);
    }
  } else {
    // Fallback if real OCR is disabled or API key is missing
    const { DemoOcrProvider } = await import('./demo-provider');
    const provider = new DemoOcrProvider();
    return provider.extractText(fileBuffer, mimeType);
  }
}


