import { OcrProvider, OcrResult } from './index';

export class DemoOcrProvider implements OcrProvider {
  async extractText(_fileBuffer: Buffer, _mimeType: string): Promise<OcrResult> {
    // Simulate network/processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return fake OCR text
    const demoText = `
Dr. Jane Doe, MD
General Practice
123 Medical Center Blvd

Patient: John Smith
Date: 10/07/2026

Rx:
- Warfarin 5 mg, take one tablet daily by mouth
- Aspirin 75 mg, take one tablet daily
- Ibuprofen 400 mg as needed for pain
- Lisinoprl 10mg daily

Notes:
Take with food. Do not chew.
    `.trim();

    return {
      text: demoText,
      isDemo: true,
    };
  }
}
