-- Migration: Create platform_events Table for Real-Time Activity Tracking
CREATE TABLE IF NOT EXISTS public.platform_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL CHECK (event_category IN ('Users', 'Projects', 'Billing', 'Security', 'System')),
    event_title TEXT NOT NULL,
    event_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_platform_events_created_at_desc ON public.platform_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_events_event_type ON public.platform_events (event_type);
CREATE INDEX IF NOT EXISTS idx_platform_events_event_category ON public.platform_events (event_category);
CREATE INDEX IF NOT EXISTS idx_platform_events_user_id ON public.platform_events (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'platform_events' AND policyname = 'Allow platform_events select'
    ) THEN
        CREATE POLICY "Allow platform_events select" ON public.platform_events FOR SELECT TO authenticated, anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'platform_events' AND policyname = 'Allow platform_events insert'
    ) THEN
        CREATE POLICY "Allow platform_events insert" ON public.platform_events FOR INSERT TO authenticated, anon WITH CHECK (true);
    END IF;
END $$;

-- Add platform_events to Supabase Realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'platform_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_events;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
