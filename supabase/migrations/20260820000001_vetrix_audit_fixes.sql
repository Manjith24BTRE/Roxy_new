-- ==============================================================================
-- VETRYX CONTROL CENTRE — SUPABASE DATABASE FIXES
-- Migration: 20260820000001_vetrix_audit_fixes.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Resolve Data Duplication (profiles -> users)
-- ------------------------------------------------------------------------------

-- Add missing fields to users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Migrate data from profiles to users if users already exist, or insert missing
INSERT INTO public.users (auth_user_id, email, full_name, avatar_url, phone, status, created_at, updated_at)
SELECT 
  p.id, 
  au.email,
  p.full_name,
  p.avatar_url,
  p.phone,
  p.status,
  p.created_at,
  p.updated_at
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
ON CONFLICT (id) DO NOTHING;

UPDATE public.users u
SET 
  avatar_url = p.avatar_url,
  phone = p.phone
FROM public.profiles p
WHERE u.auth_user_id = p.id;

-- Update the new user trigger to write to public.users directly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name, avatar_url, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'active'
  );
  RETURN NEW;
END;
$$;

-- Drop profiles table since we've merged it into users
DROP TABLE IF EXISTS public.profiles CASCADE;


-- ------------------------------------------------------------------------------
-- 2. Fix Insecure RLS Policies (user_roles)
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "user_roles_write_policy" ON public.user_roles;
CREATE POLICY "user_roles_write_policy" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));


-- ------------------------------------------------------------------------------
-- 3. Fix Insecure RLS Policies (audit_logs)
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_user_id);


-- ------------------------------------------------------------------------------
-- 4. Subscription Date Integrity Constraints
-- ------------------------------------------------------------------------------

ALTER TABLE public.subscriptions 
ADD CONSTRAINT check_subscription_dates 
CHECK (current_period_end >= current_period_start);
