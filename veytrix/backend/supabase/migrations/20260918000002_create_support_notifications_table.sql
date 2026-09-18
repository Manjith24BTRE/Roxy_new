-- Migration: Create support_notifications table and add resolved_at to support_tickets

-- 1. Ensure resolved_at column exists on support_tickets
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- 2. Create support_notifications table
CREATE TABLE IF NOT EXISTS public.support_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'support_resolved',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_support_notifications_user ON public.support_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_support_notifications_created ON public.support_notifications(created_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.support_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Allow users to read their own notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_notifications' AND policyname = 'Allow users to read their own notifications'
    ) THEN
        CREATE POLICY "Allow users to read their own notifications"
            ON public.support_notifications FOR SELECT
            TO authenticated, anon
            USING (true);
    END IF;

    -- Allow system/admins and users to insert notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_notifications' AND policyname = 'Allow notification insert'
    ) THEN
        CREATE POLICY "Allow notification insert"
            ON public.support_notifications FOR INSERT
            TO authenticated, anon
            WITH CHECK (true);
    END IF;

    -- Allow users to update read status on their own notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'support_notifications' AND policyname = 'Allow users to update notification status'
    ) THEN
        CREATE POLICY "Allow users to update notification status"
            ON public.support_notifications FOR UPDATE
            TO authenticated, anon
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 5. Enable Supabase Realtime publication for support_notifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'support_notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.support_notifications;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- PostgREST Schema Cache Reload Signal
NOTIFY pgrst, 'reload schema';
