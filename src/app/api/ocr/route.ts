import { NextResponse } from 'next/server';
import { processPrescriptionImage } from '@/lib/ocr';
import { extractMedicinesFromText } from '@/lib/ocr/extractor';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const mimeType = file.type;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only JPG, PNG, and PDF are supported.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Process with OCR
    const ocrResult = await processPrescriptionImage(buffer, mimeType);

    if (!ocrResult.text || ocrResult.text.trim() === '') {
      return NextResponse.json({ success: false, error: 'No readable text found in the image.' }, { status: 400 });
    }

    // 2. Extract Medicines
    const extractedMedicines = await extractMedicinesFromText(
      ocrResult.text,
      ocrResult.geminiCandidates
    );

    return NextResponse.json({
      success: true,
      text: ocrResult.text,
      isDemo: ocrResult.isDemo,
      extractedMedicines,
    });

  } catch (error: unknown) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Internal server error during OCR processing.' },
      { status: 500 }
    );
  }
}
