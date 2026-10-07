import { createClient } from '@supabase/supabase-js'

function getClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Missing Supabase env vars, interaction engine might fail.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export type Severity = "low" | "moderate" | "high";

export interface DrugInteraction {
  id: string;
  drug_a: string;
  drug_b: string;
  severity: Severity;
  title: string;
  description: string;
  clinical_effect: string;
  recommendation: string;
  source_name: string;
  source_url: string;
}

export interface FoodInteraction {
  id: string;
  medicine: string;
  food: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  source_name: string;
  source_url: string;
}

export async function checkDrugInteractions(medicines: string[]) {
  if (!medicines || medicines.length < 2) {
    return { medicines, interactions: [], highestSeverity: null };
  }

  const normalizedMedicines = medicines.map(m => m.toLowerCase().trim());
  const supabase = getClient();
  
  // Create an explicit OR query for all combinations in both directions
  const orConditions = [];
  for (let i = 0; i < normalizedMedicines.length; i++) {
    for (let j = i + 1; j < normalizedMedicines.length; j++) {
      const a = normalizedMedicines[i];
      const b = normalizedMedicines[j];
      orConditions.push(`and(drug_a.ilike.${a},drug_b.ilike.${b})`);
      orConditions.push(`and(drug_a.ilike.${b},drug_b.ilike.${a})`);
    }
  }
  
  const { data, error } = await supabase
    .from('drug_interactions')
    .select('*')
    .or(orConditions.join(','));

  if (error) {
    console.error("Error fetching drug interactions:", error);
    throw new Error("Failed to check drug interactions");
  }

  const interactions = data as DrugInteraction[];
  
  return {
    medicines: normalizedMedicines,
    interactions
  };
}

export async function checkFoodInteractions(medicines: string[]) {
  if (!medicines || medicines.length === 0) {
    return { medicines, interactions: [], highestSeverity: null };
  }

  const normalizedMedicines = medicines.map(m => m.toLowerCase().trim());
  const supabase = getClient();

  const foodOrConditions = normalizedMedicines.map(m => `medicine.ilike.${m}`);
  const { data, error } = await supabase
    .from('food_interactions')
    .select('*')
    .or(foodOrConditions.join(','));

  if (error) {
    console.error("Error fetching food interactions:", error);
    throw new Error("Failed to check food interactions");
  }

  const interactions = data as FoodInteraction[];

  return {
    medicines: normalizedMedicines,
    interactions
  };
}


