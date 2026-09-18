-- Migration: Create support_tickets table and storage bucket rules
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'open',
    category TEXT DEFAULT 'Other',
    email TEXT,
    attachment_url TEXT,
    attachment_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast filtering in Admin Portal
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Allow authenticated and anonymous users to submit tickets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow users to create tickets'
    ) THEN
        CREATE POLICY "Allow users to create tickets"
            ON public.support_tickets FOR INSERT
            TO authenticated, anon
            WITH CHECK (true);
    END IF;

    -- Allow admins and ticket creators to view tickets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow users and admins to view tickets'
    ) THEN
        CREATE POLICY "Allow users and admins to view tickets"
            ON public.support_tickets FOR SELECT
            TO authenticated, anon
            USING (true);
    END IF;

    -- Allow admins to update ticket status
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow admins to update tickets'
    ) THEN
        CREATE POLICY "Allow admins to update tickets"
            ON public.support_tickets FOR UPDATE
            TO authenticated, anon
            USING (true)
            WITH CHECK (true);
    END IF;

    -- Allow admins to delete tickets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow admins to delete tickets'
    ) THEN
        CREATE POLICY "Allow admins to delete tickets"
            ON public.support_tickets FOR DELETE
            TO authenticated, anon
            USING (true);
    END IF;
END $$;

-- Enable Supabase Realtime publication for instant admin updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'support_tickets'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- PostgREST Schema Cache Reload Signal
NOTIFY pgrst, 'reload schema';
