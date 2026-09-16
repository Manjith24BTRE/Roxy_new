-- Create avatars storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Storage RLS Policies for avatars bucket

-- 1. Public Read Access for Avatars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Read Avatars'
    ) THEN
        CREATE POLICY "Public Read Avatars"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'avatars');
    END IF;
END $$;

-- 2. Authenticated Users Can Upload Own Avatar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Users Upload Avatar'
    ) THEN
        CREATE POLICY "Authenticated Users Upload Avatar"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'avatars' AND
                auth.role() = 'authenticated' AND
                (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

-- 3. Authenticated Users Can Update Own Avatar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Users Update Avatar'
    ) THEN
        CREATE POLICY "Authenticated Users Update Avatar"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'avatars' AND
                auth.role() = 'authenticated' AND
                (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

-- 4. Authenticated Users Can Delete Own Avatar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Users Delete Avatar'
    ) THEN
        CREATE POLICY "Authenticated Users Delete Avatar"
            ON storage.objects FOR DELETE
            USING (
                bucket_id = 'avatars' AND
                auth.role() = 'authenticated' AND
                (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;
