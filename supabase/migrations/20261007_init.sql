-- Initial schema for MediGuard AI

-- Medicines Table
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug Interactions Table
CREATE TABLE IF NOT EXISTS public.drug_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drug_a TEXT NOT NULL,
    drug_b TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    clinical_effect TEXT,
    recommendation TEXT,
    source_name TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food Interactions Table
CREATE TABLE IF NOT EXISTS public.food_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine TEXT NOT NULL,
    food TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    recommendation TEXT,
    source_name TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription Checks Table
CREATE TABLE IF NOT EXISTS public.prescription_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_name TEXT,
    medicines_detected JSONB,
    interactions_found JSONB,
    highest_severity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security (RLS) policies for anonymous access
-- Note: In a production environment, you would restrict these based on authentication.
-- For this hackathon, we allow public read access, and insert access to prescription_checks.

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on medicines" ON public.medicines FOR SELECT USING (true);

ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on drug_interactions" ON public.drug_interactions FOR SELECT USING (true);

ALTER TABLE public.food_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on food_interactions" ON public.food_interactions FOR SELECT USING (true);

ALTER TABLE public.prescription_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on prescription_checks" ON public.prescription_checks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on prescription_checks" ON public.prescription_checks FOR INSERT WITH CHECK (true);
