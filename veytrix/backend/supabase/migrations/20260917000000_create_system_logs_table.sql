-- Create system_logs table for production audit and system execution tracking
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at_desc ON public.system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_service ON public.system_logs (service);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs (level);

-- Enable Row Level Security (RLS)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_logs' AND policyname = 'Allow system logs select'
    ) THEN
        CREATE POLICY "Allow system logs select"
            ON public.system_logs FOR SELECT
            TO authenticated, anon
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'system_logs' AND policyname = 'Allow system logs insert'
    ) THEN
        CREATE POLICY "Allow system logs insert"
            ON public.system_logs FOR INSERT
            TO authenticated, anon
            WITH CHECK (true);
    END IF;
END $$;

-- Enable Supabase Realtime for system_logs table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'system_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
