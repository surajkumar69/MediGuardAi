-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Medicines Table
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    generic_name TEXT,
    brand_names TEXT[],
    dosage_forms TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Drug Interactions Table
CREATE TYPE severity_level AS ENUM ('low', 'moderate', 'high');

CREATE TABLE IF NOT EXISTS public.drug_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drug_a TEXT NOT NULL,
    drug_b TEXT NOT NULL,
    severity severity_level NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    clinical_effect TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(drug_a, drug_b)
);

-- 3. Food Interactions Table
CREATE TABLE IF NOT EXISTS public.food_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine TEXT NOT NULL,
    food TEXT NOT NULL,
    severity severity_level NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(medicine, food)
);

-- 4. Prescription Checks Table
CREATE TABLE IF NOT EXISTS public.prescription_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_name TEXT,
    medicines_detected TEXT[] NOT NULL,
    interactions_found JSONB NOT NULL DEFAULT '[]'::jsonb,
    highest_severity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_checks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for public knowledge tables
CREATE POLICY "Allow public read access for medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Allow public read access for drug_interactions" ON public.drug_interactions FOR SELECT USING (true);
CREATE POLICY "Allow public read access for food_interactions" ON public.food_interactions FOR SELECT USING (true);

-- Allow anonymous insert for prescription_checks (in a real app, bind to user ID)
CREATE POLICY "Allow public insert to prescription_checks" ON public.prescription_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read own checks" ON public.prescription_checks FOR SELECT USING (true);
