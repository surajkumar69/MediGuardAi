-- MediGuard AI Hackathon Demo Seed Data
-- Note: All medicine names are stored in lowercase for easier exact matching by the interaction engine.

-- 1. Insert Demo Medicines
INSERT INTO public.medicines (name) VALUES 
('aspirin'),
('warfarin'),
('ibuprofen'),
('lisinopril'),
('atorvastatin'),
('amoxicillin'),
('metformin'),
('levothyroxine'),
('omeprazole'),
('simvastatin')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Drug-Drug Interactions
INSERT INTO public.drug_interactions (drug_a, drug_b, severity, title, description, clinical_effect, recommendation, source_name, source_url) VALUES 
('aspirin', 'warfarin', 'high', 'Increased Bleeding Risk', 'Combining these medications significantly increases the risk of severe bleeding complications.', 'Synergistic effect on platelet aggregation and the coagulation cascade.', 'Avoid combination unless specifically directed by a cardiologist. Monitor INR closely.', 'Reference Demo DB', 'https://www.fda.gov'),
('ibuprofen', 'lisinopril', 'moderate', 'Reduced Antihypertensive Efficacy', 'NSAIDs like Ibuprofen can reduce the blood pressure lowering effects of ACE inhibitors like Lisinopril.', 'Decreased renal prostaglandins leading to reduced vasodilation and potential renal impairment.', 'Monitor blood pressure. Consider alternative analgesics (e.g., Acetaminophen) for pain relief.', 'Reference Demo DB', 'https://www.fda.gov'),
('amoxicillin', 'methotrexate', 'high', 'Increased Methotrexate Toxicity', 'Penicillins can decrease the renal clearance of methotrexate, leading to dangerous toxicity.', 'Elevated serum methotrexate concentrations.', 'Close monitoring of methotrexate levels is required if co-administration cannot be avoided.', 'Reference Demo DB', 'https://www.fda.gov')
;

-- 3. Insert Drug-Food Interactions
INSERT INTO public.food_interactions (medicine, food, severity, title, description, recommendation, source_name, source_url) VALUES 
('atorvastatin', 'grapefruit juice', 'high', 'Increased Statin Toxicity', 'Grapefruit juice inhibits the CYP3A4 enzyme, leading to dangerously high levels of atorvastatin in the blood.', 'Avoid consuming grapefruit or grapefruit juice while taking this medication to prevent muscle toxicity and liver strain.', 'Reference Demo DB', 'https://www.fda.gov'),
('simvastatin', 'grapefruit juice', 'high', 'Increased Statin Toxicity', 'Grapefruit juice drastically increases the bioavailability of simvastatin.', 'Strict avoidance of grapefruit is recommended during therapy.', 'Reference Demo DB', 'https://www.fda.gov'),
('warfarin', 'leafy greens (vitamin k)', 'moderate', 'Decreased Anticoagulant Effect', 'Foods high in Vitamin K (like spinach, kale) can counteract the blood-thinning effects of Warfarin.', 'Maintain a consistent daily intake of Vitamin K-rich foods rather than avoiding them entirely, so medication dosing can be adjusted and maintained steadily.', 'Reference Demo DB', 'https://www.fda.gov'),
('levothyroxine', 'calcium or iron supplements', 'moderate', 'Decreased Absorption', 'Calcium and iron can bind to levothyroxine in the gastrointestinal tract, significantly reducing its absorption into the body.', 'Separate administration of levothyroxine and supplements by at least 4 hours.', 'Reference Demo DB', 'https://www.fda.gov')
;
