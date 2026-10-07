import { createClient } from '@supabase/supabase-js';

export interface ExtractedMedicine {
  name: string;
  originalText: string;
  confidence: number;
  needsVerification: boolean;
}

function getClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Missing Supabase env vars, OCR extractor might fail.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

export async function extractMedicinesFromText(
  text: string,
  geminiCandidates?: { name: string; originalText: string; confidence: number; needs_verification: boolean }[]
): Promise<ExtractedMedicine[]> {
  
  const supabase = getClient();
  const { data: dbMedicines, error } = await supabase
    .from('medicines')
    .select('name');

  if (error || !dbMedicines) {
    console.error("Error fetching medicines for extraction:", error);
    throw new Error("Failed to extract medicines against database");
  }

  const validNames = dbMedicines.map(m => m.name.toLowerCase());
  const results: ExtractedMedicine[] = [];
  const foundNames = new Set<string>();

  // If Gemini provided structured candidates, process them
  if (geminiCandidates && geminiCandidates.length > 0) {
    for (const candidate of geminiCandidates) {
      if (!candidate.name) continue;
      
      const normalized = candidate.name.toLowerCase().trim();
      let finalName = normalized;
      let finalNeedsVerification = candidate.needs_verification;
      let finalConfidence = Math.round(candidate.confidence * 100);

      // Verify against Supabase 'medicines' table
      if (validNames.includes(normalized)) {
        // Exact database match: trust it more
        finalNeedsVerification = false;
        finalConfidence = Math.max(finalConfidence, 95);
      } else {
        // No exact match in DB: try a simple fuzzy match or force verification
        const fuzzyMatch = validNames.find(v => v.includes(normalized) || normalized.includes(v));
        if (fuzzyMatch) {
          finalName = fuzzyMatch;
          finalNeedsVerification = true;
          finalConfidence = 70;
        } else {
          // Keep the Gemini identified name but force verification
          finalNeedsVerification = true;
          finalConfidence = Math.min(finalConfidence, 60);
        }
      }

      if (!foundNames.has(finalName)) {
        results.push({
          name: finalName,
          originalText: candidate.originalText || candidate.name,
          confidence: finalConfidence,
          needsVerification: finalNeedsVerification
        });
        foundNames.add(finalName);
      }
    }
    console.log(`[OCR] Extractor | Total Candidates: ${geminiCandidates.length} | Kept: ${results.length}`);
    return results;
  }

  // Fallback: Demo mode or naive text extraction if Gemini structured data is missing
  console.log(`[OCR] Extractor | Running Demo Mode Extraction (No Gemini Candidates)`);
  const words = text.split(/[\s,.;:\n\-]+/).map(w => w.trim().toLowerCase()).filter(w => w.length > 3);

  for (const word of words) {
    // Exact match
    if (validNames.includes(word) && !foundNames.has(word)) {
      results.push({
        name: word,
        originalText: word,
        confidence: 95,
        needsVerification: false
      });
      foundNames.add(word);
    } else {
      // Fuzzy match (very basic simulation)
      for (const validName of validNames) {
        if (!foundNames.has(validName) && (validName.includes(word) || word.includes(validName)) && Math.abs(validName.length - word.length) <= 2) {
          results.push({
            name: validName,
            originalText: word,
            confidence: 60, // Low confidence due to fuzzy match
            needsVerification: true
          });
          foundNames.add(validName);
        }
      }
    }
  }

  return results;
}
