-- Migration: Create public.notifications table for unified Notification Bell delivery

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow reading notifications'
    ) THEN
        CREATE POLICY "Allow reading notifications"
            ON public.notifications FOR SELECT
            TO authenticated, anon
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow inserting notifications'
    ) THEN
        CREATE POLICY "Allow inserting notifications"
            ON public.notifications FOR INSERT
            TO authenticated, anon
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow updating notification status'
    ) THEN
        CREATE POLICY "Allow updating notification status"
            ON public.notifications FOR UPDATE
            TO authenticated, anon
            USING (true)
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow deleting notifications'
    ) THEN
        CREATE POLICY "Allow deleting notifications"
            ON public.notifications FOR DELETE
            TO authenticated, anon
            USING (true);
    END IF;
END $$;

-- Enable Supabase Realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- PostgREST Schema Cache Reload Signal
NOTIFY pgrst, 'reload schema';
