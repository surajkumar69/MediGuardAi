import { NextResponse } from 'next/server';
import { checkDrugInteractions, checkFoodInteractions } from '@/lib/interaction-engine';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { medicines } = body;

    if (!medicines || !Array.isArray(medicines)) {
      return NextResponse.json(
        { success: false, error: "Invalid input. Expected an array of medicines." },
        { status: 400 }
      );
    }

    if (medicines.length === 0) {
      return NextResponse.json({
        success: true,
        medicines: [],
        drugInteractions: [],
        foodInteractions: [],
        highestSeverity: null,
        checkId: null
      });
    }

    const [drugResults, foodResults] = await Promise.all([
      checkDrugInteractions(medicines),
      checkFoodInteractions(medicines)
    ]);

    console.log(`[Interaction API] Medicines Submitted: ${medicines.length} (${medicines.join(', ')})`);
    console.log(`[Interaction API] Drug-Drug Found: ${drugResults.interactions.length}`);
    console.log(`[Interaction API] Drug-Food Found: ${foodResults.interactions.length}`);

    // Combine severities
    const allInteractions = [
      ...drugResults.interactions,
      ...foodResults.interactions
    ];
    
    let highestSeverity = null;
    if (allInteractions.length > 0) {
      const hasHigh = allInteractions.some(i => i.severity === 'high');
      const hasModerate = allInteractions.some(i => i.severity === 'moderate');
      if (hasHigh) highestSeverity = 'high';
      else if (hasModerate) highestSeverity = 'moderate';
      else highestSeverity = 'low';
    }

    // Save to prescription_checks
    let checkId = null;
    const supabase = getClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('prescription_checks')
        .insert({
          prescription_name: 'Manual Check',
          medicines_detected: drugResults.medicines,
          interactions_found: allInteractions,
          highest_severity: highestSeverity
        })
        .select('id')
        .single();
        
      if (!error && data) {
        checkId = data.id;
      } else if (error) {
        console.error("Failed to log prescription check:", error);
      }
    }

    return NextResponse.json({
      success: true,
      medicines: drugResults.medicines,
      drugInteractions: drugResults.interactions,
      foodInteractions: foodResults.interactions,
      highestSeverity,
      checkId
    });

  } catch (error: unknown) {
    console.error("Interaction API Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Internal server error while checking interactions.' },
      { status: 500 }
    );
  }
}

