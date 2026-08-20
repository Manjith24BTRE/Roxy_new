-- ==============================================================================
-- VETRYX CONTROL CENTRE — SUPABASE DATABASE ARCHITECTURE FIXES
-- Migration: 20260820000002_vetrix_architecture_fixes.sql
-- ==============================================================================

DO $$ 
DECLARE
  v_dup_auth INT;
  v_dup_email INT;
  v_orphan_roles INT;
  v_constraint_def TEXT;
  v_fk_target_schema TEXT;
BEGIN

  -- ------------------------------------------------------------------------------
  -- 1. DUPLICATE VALIDATION
  -- ------------------------------------------------------------------------------
  
  -- Check for duplicate auth_user_id
  SELECT COUNT(*)
  INTO v_dup_auth
  FROM (
    SELECT auth_user_id FROM public.users
    WHERE auth_user_id IS NOT NULL
    GROUP BY auth_user_id
    HAVING COUNT(*) > 1
  ) as duplicates;

  IF v_dup_auth > 0 THEN
    RAISE EXCEPTION 'Duplicate auth_user_id found in public.users (Count: %). Resolve duplicates before applying constraints.', v_dup_auth;
  END IF;

  -- Check for duplicate email
  SELECT COUNT(*)
  INTO v_dup_email
  FROM (
    SELECT email FROM public.users
    GROUP BY email
    HAVING COUNT(*) > 1
  ) as duplicates;

  IF v_dup_email > 0 THEN
    RAISE EXCEPTION 'Duplicate email found in public.users (Count: %). Resolve duplicates before applying constraints.', v_dup_email;
  END IF;

  -- ------------------------------------------------------------------------------
  -- 2. SAFE UNIQUE CONSTRAINT CREATION
  -- ------------------------------------------------------------------------------
  
  -- Add UNIQUE for auth_user_id
  SELECT pg_get_constraintdef(c.oid) INTO v_constraint_def
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public' AND t.relname = 'users' AND c.conname = 'users_auth_user_id_key';

  IF v_constraint_def IS NULL THEN
    ALTER TABLE public.users ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);
  ELSIF v_constraint_def != 'UNIQUE (auth_user_id)' THEN
    RAISE EXCEPTION 'Constraint users_auth_user_id_key exists but has wrong definition: %', v_constraint_def;
  END IF;

  -- Add UNIQUE for email
  SELECT pg_get_constraintdef(c.oid) INTO v_constraint_def
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public' AND t.relname = 'users' AND c.conname = 'users_email_key';

  IF v_constraint_def IS NULL THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  ELSIF v_constraint_def != 'UNIQUE (email)' THEN
    RAISE EXCEPTION 'Constraint users_email_key exists but has wrong definition: %', v_constraint_def;
  END IF;

  -- ------------------------------------------------------------------------------
  -- 3. SAFE COLUMN TRANSITION (auth.users -> public.users)
  -- ------------------------------------------------------------------------------
  
  -- Determine what user_roles.user_id currently references
  SELECT ccu.table_schema 
  INTO v_fk_target_schema
  FROM information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_roles'
    AND kcu.column_name = 'user_id'
  LIMIT 1;

  -- Only perform the transition if it still references auth.users
  IF v_fk_target_schema = 'auth' THEN
    
    -- Step A: Add temporary column
    ALTER TABLE public.user_roles 
      ADD COLUMN platform_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

    -- Step B: Backfill column matching auth_user_id
    UPDATE public.user_roles ur
    SET platform_user_id = u.id
    FROM public.users u
    WHERE ur.user_id = u.auth_user_id;

    -- Step C: Validation (NULL Check & Orphan Check)
    SELECT COUNT(*)
    INTO v_orphan_roles
    FROM public.user_roles
    WHERE platform_user_id IS NULL;

    IF v_orphan_roles > 0 THEN
      RAISE EXCEPTION 'Migration validation failed: % orphaned user_roles records found with no matching public.users record. Transaction aborted to prevent data loss.', v_orphan_roles;
    END IF;

    -- Step D: Safely drop old foreign key/column, and rename new column
    ALTER TABLE public.user_roles DROP COLUMN user_id CASCADE;
    ALTER TABLE public.user_roles RENAME COLUMN platform_user_id TO user_id;

    -- Recreate index on the new user_id column
    CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
    
  END IF;

END $$;

-- ------------------------------------------------------------------------------
-- 4. UPDATE SECURITY FUNCTIONS
-- ------------------------------------------------------------------------------

-- Check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id UUID,
  _role_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.users u ON u.id = ur.user_id
    WHERE u.auth_user_id = _user_id
      AND r.name = _role_name
  );
$$;

-- Check if a user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    JOIN public.users u ON u.id = ur.user_id
    WHERE u.auth_user_id = _user_id
      AND p.name = _permission_name
  );
$$;

-- Check if a user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin(
  _user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.users u ON u.id = ur.user_id
    WHERE u.auth_user_id = _user_id
      AND r.name IN ('super_admin', 'admin')
  );
$$;

-- ------------------------------------------------------------------------------
-- 5. RECREATE POLICIES (due to column drop cascade)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_roles_read_policy" ON public.user_roles;
CREATE POLICY "user_roles_read_policy" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "user_roles_write_policy" ON public.user_roles;
CREATE POLICY "user_roles_write_policy" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
