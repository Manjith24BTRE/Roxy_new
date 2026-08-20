-- Production Database Migration: Expand Profiles Schema
-- Phase 1A: Account and Profile Settings Persistence

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS username TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English (US)',
    ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC+5:30 (IST)',
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS occupation TEXT,
    ADD COLUMN IF NOT EXISTS company TEXT,
    ADD COLUMN IF NOT EXISTS website TEXT,
    ADD COLUMN IF NOT EXISTS portfolio TEXT,
    ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Create case-insensitive unique index for usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower 
    ON public.profiles (LOWER(username)) 
    WHERE username IS NOT NULL;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
    ON public.profiles (phone) 
    WHERE phone IS NOT NULL;
