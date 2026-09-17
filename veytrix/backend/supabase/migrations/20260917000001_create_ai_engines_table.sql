-- Migration: Create AI Engines Table
-- File: backend/supabase/migrations/20260917000001_create_ai_engines_table.sql

CREATE TABLE IF NOT EXISTS public.ai_engines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0',
    status TEXT NOT NULL DEFAULT 'Active',
    provider TEXT NOT NULL DEFAULT 'Veytrix Native',
    description TEXT,
    usage_count INT NOT NULL DEFAULT 0,
    success_rate INT NOT NULL DEFAULT 100,
    avg_latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_engines ENABLE ROW LEVEL SECURITY;

-- Allow public read access to AI engines
CREATE POLICY "Anyone can view ai engines"
    ON public.ai_engines FOR SELECT
    USING (true);
