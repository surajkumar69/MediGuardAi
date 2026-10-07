import { createClient } from '@supabase/supabase-js'

// Use standard anon client for interaction checking
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

const DEMO_DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    id: "demo-dd-1",
    drug_a: "aspirin",
    drug_b: "warfarin",
    severity: "high",
    title: "[DEMO] Increased Bleeding Risk",
    description: "Combining these medications significantly increases the risk of severe bleeding complications.",
    clinical_effect: "Synergistic effect on platelet aggregation and the coagulation cascade.",
    recommendation: "Avoid combination unless specifically directed by a cardiologist. Monitor INR closely.",
    source_name: "Reference Demo DB",
    source_url: "https://www.fda.gov"
  },
  {
    id: "demo-dd-2",
    drug_a: "ibuprofen",
    drug_b: "lisinopril",
    severity: "moderate",
    title: "[DEMO] Reduced Antihypertensive Efficacy",
    description: "NSAIDs like Ibuprofen can reduce the blood pressure lowering effects of ACE inhibitors like Lisinopril.",
    clinical_effect: "Decreased renal prostaglandins leading to reduced vasodilation and potential renal impairment.",
    recommendation: "Monitor blood pressure. Consider alternative analgesics (e.g., Acetaminophen) for pain relief.",
    source_name: "Reference Demo DB",
    source_url: "https://www.fda.gov"
  }
];

const DEMO_FOOD_INTERACTIONS: FoodInteraction[] = [
  {
    id: "demo-df-1",
    medicine: "atorvastatin",
    food: "grapefruit juice",
    severity: "high",
    title: "[DEMO] Increased Statin Toxicity",
    description: "Grapefruit juice inhibits the CYP3A4 enzyme, leading to dangerously high levels of atorvastatin in the blood.",
    recommendation: "Avoid consuming grapefruit or grapefruit juice while taking this medication.",
    source_name: "Reference Demo DB",
    source_url: "https://www.fda.gov"
  }
];

export async function checkDrugInteractions(medicines: string[]) {
  if (!medicines || medicines.length < 2) {
    return { medicines, interactions: [], highestSeverity: null };
  }

  const normalizedMedicines = medicines.map(m => m.toLowerCase().trim());
  const supabase = getClient();
  
  const { data, error } = await supabase
    .from('drug_interactions')
    .select('*')
    .in('drug_a', normalizedMedicines)
    .in('drug_b', normalizedMedicines);

  if (error) {
    console.error("Error fetching drug interactions:", error);
    throw new Error("Failed to check drug interactions");
  }

  let interactions = data as DrugInteraction[];
  
  // Hackathon Fallback: If DB is completely empty (0 rows returned even for matches), use demo data for testing.
  if (interactions.length === 0) {
    // Check if the DB is actually empty by doing a fast global check
    const { count } = await supabase.from('drug_interactions').select('*', { count: 'exact', head: true });
    if (count === 0) {
      console.log("[Interaction Engine] DB drug_interactions is empty. Using Hackathon Demo Data.");
      interactions = DEMO_DRUG_INTERACTIONS.filter(
        row => normalizedMedicines.includes(row.drug_a) && normalizedMedicines.includes(row.drug_b)
      );
    }
  }
  
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

  const { data, error } = await supabase
    .from('food_interactions')
    .select('*')
    .in('medicine', normalizedMedicines);

  if (error) {
    console.error("Error fetching food interactions:", error);
    throw new Error("Failed to check food interactions");
  }

  let interactions = data as FoodInteraction[];

  if (interactions.length === 0) {
    const { count } = await supabase.from('food_interactions').select('*', { count: 'exact', head: true });
    if (count === 0) {
      console.log("[Interaction Engine] DB food_interactions is empty. Using Hackathon Demo Data.");
      interactions = DEMO_FOOD_INTERACTIONS.filter(
        row => normalizedMedicines.includes(row.medicine)
      );
    }
  }

  return {
    medicines: normalizedMedicines,
    interactions
  };
}
