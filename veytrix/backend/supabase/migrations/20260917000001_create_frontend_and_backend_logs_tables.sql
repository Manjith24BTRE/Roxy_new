-- Create frontend_logs table
CREATE TABLE IF NOT EXISTS public.frontend_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create backend_logs table
CREATE TABLE IF NOT EXISTS public.backend_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for frontend_logs
CREATE INDEX IF NOT EXISTS idx_frontend_logs_created_at_desc ON public.frontend_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_frontend_logs_category ON public.frontend_logs (category);
CREATE INDEX IF NOT EXISTS idx_frontend_logs_level ON public.frontend_logs (level);

-- Indexes for backend_logs
CREATE INDEX IF NOT EXISTS idx_backend_logs_created_at_desc ON public.backend_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backend_logs_service ON public.backend_logs (service);
CREATE INDEX IF NOT EXISTS idx_backend_logs_level ON public.backend_logs (level);

-- Enable RLS
ALTER TABLE public.frontend_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backend_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'frontend_logs' AND policyname = 'Allow frontend_logs select'
    ) THEN
        CREATE POLICY "Allow frontend_logs select" ON public.frontend_logs FOR SELECT TO authenticated, anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'frontend_logs' AND policyname = 'Allow frontend_logs insert'
    ) THEN
        CREATE POLICY "Allow frontend_logs insert" ON public.frontend_logs FOR INSERT TO authenticated, anon WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'backend_logs' AND policyname = 'Allow backend_logs select'
    ) THEN
        CREATE POLICY "Allow backend_logs select" ON public.backend_logs FOR SELECT TO authenticated, anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'backend_logs' AND policyname = 'Allow backend_logs insert'
    ) THEN
        CREATE POLICY "Allow backend_logs insert" ON public.backend_logs FOR INSERT TO authenticated, anon WITH CHECK (true);
    END IF;
END $$;

-- Enable Realtime publication for both tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'frontend_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.frontend_logs;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'backend_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.backend_logs;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
