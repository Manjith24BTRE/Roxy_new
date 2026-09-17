-- Migration: Create production-grade platform_announcements and announcement_analytics tables
CREATE TABLE IF NOT EXISTS public.platform_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    type TEXT DEFAULT 'general',
    announcement_type TEXT DEFAULT 'General',
    priority TEXT NOT NULL DEFAULT 'medium',
    target_audience TEXT NOT NULL DEFAULT 'all_users',
    banner_style TEXT DEFAULT 'default',
    banner_color TEXT DEFAULT 'blue',
    icon TEXT DEFAULT 'bell',
    cta_text TEXT,
    cta_url TEXT,
    start_date TIMESTAMPTZ,
    starts_at TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'Active',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alias view/table for legacy queries on public.announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT,
    audience TEXT DEFAULT 'All Users',
    status TEXT DEFAULT 'Published',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table for impressions, clicks, and dismissals
CREATE TABLE IF NOT EXISTS public.announcement_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES public.platform_announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('viewed', 'clicked', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance and rapid filtering
CREATE INDEX IF NOT EXISTS idx_platform_announcements_is_active ON public.platform_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_platform_announcements_status ON public.platform_announcements(status);
CREATE INDEX IF NOT EXISTS idx_platform_announcements_created_at ON public.platform_announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_announcements_start_date ON public.platform_announcements(start_date);
CREATE INDEX IF NOT EXISTS idx_platform_announcements_starts_at ON public.platform_announcements(starts_at);
CREATE INDEX IF NOT EXISTS idx_platform_announcements_end_date ON public.platform_announcements(end_date);
CREATE INDEX IF NOT EXISTS idx_platform_announcements_expires_at ON public.platform_announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_announcement_analytics_announcement_id ON public.announcement_analytics(announcement_id);

-- Enable RLS
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_analytics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Public/Users read active announcements policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'platform_announcements' AND policyname = 'Allow users to read active announcements'
    ) THEN
        CREATE POLICY "Allow users to read active announcements"
            ON public.platform_announcements FOR SELECT
            TO authenticated, anon
            USING (is_active = true OR status = 'Active' OR status = 'Scheduled');
    END IF;

    -- Admins write policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'platform_announcements' AND policyname = 'Admins can manage announcements'
    ) THEN
        CREATE POLICY "Admins can manage announcements"
            ON public.platform_announcements FOR ALL
            TO authenticated, anon
            USING (true)
            WITH CHECK (true);
    END IF;

    -- Analytics insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'announcement_analytics' AND policyname = 'Allow analytics insert'
    ) THEN
        CREATE POLICY "Allow analytics insert"
            ON public.announcement_analytics FOR INSERT
            TO authenticated, anon
            WITH CHECK (true);
    END IF;

    -- Analytics read policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'announcement_analytics' AND policyname = 'Allow analytics select'
    ) THEN
        CREATE POLICY "Allow analytics select"
            ON public.announcement_analytics FOR SELECT
            TO authenticated, anon
            USING (true);
    END IF;
END $$;

-- Enable Supabase Realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'platform_announcements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_announcements;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- PostgREST Schema Cache Reload Signal
NOTIFY pgrst, 'reload schema';
