-- Create export_preferences table
CREATE TABLE IF NOT EXISTS public.export_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resolution TEXT NOT NULL DEFAULT '1080p (1920x1080)',
    fps TEXT NOT NULL DEFAULT '60 fps',
    codec TEXT NOT NULL DEFAULT 'H.264 / AVC',
    bitrate TEXT NOT NULL DEFAULT 'High (15 Mbps)',
    audio_codec TEXT NOT NULL DEFAULT 'Stereo (320 kbps)',
    export_folder TEXT NOT NULL DEFAULT '/users/veytrix/exports',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS POLICIES FOR EXPORT PREFERENCES
ALTER TABLE public.export_preferences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'export_preferences' AND policyname = 'Users can access own export preferences'
    ) THEN
        CREATE POLICY "Users can access own export preferences"
            ON public.export_preferences FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END $$;
