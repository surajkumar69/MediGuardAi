-- Seed Data for Hackathon
INSERT INTO public.medicines (name) VALUES 
('aspirin'), ('warfarin'), ('atorvastatin'), ('paracetamol'), ('vitamin c')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.drug_interactions (drug_a, drug_b, severity, title, description, clinical_effect, recommendation, source_name, source_url) VALUES 
('aspirin', 'warfarin', 'high', 'Increased Bleeding Risk', 'Combining these medications significantly increases the risk of severe bleeding complications.', 'Synergistic effect on platelet aggregation and the coagulation cascade.', 'Avoid combination unless specifically directed by a cardiologist. Monitor INR closely.', 'DEMO Data', 'https://www.fda.gov');

INSERT INTO public.food_interactions (medicine, food, severity, title, description, recommendation, source_name, source_url) VALUES 
('atorvastatin', 'grapefruit juice', 'high', 'Increased Statin Toxicity', 'Grapefruit juice inhibits the CYP3A4 enzyme, leading to dangerously high levels of atorvastatin in the blood.', 'Avoid consuming grapefruit or grapefruit juice while taking this medication to prevent muscle toxicity and liver strain.', 'DEMO Data', 'https://www.fda.gov');
