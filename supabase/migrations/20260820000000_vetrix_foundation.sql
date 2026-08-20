-- ==============================================================================
-- VETRYX CONTROL CENTRE — SUPABASE POSTGRESQL DATABASE FOUNDATION
-- Migration: 20260820000000_vetrix_foundation.sql
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. REUSABLE TRIGGER FUNCTIONS
-- ==============================================================================

-- Automatic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ==============================================================================
-- 2. CORE TABLES & ENUMS / CONSTRAINTS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: profiles (1-to-1 with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on profiles
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for automatic profile creation on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- Table: roles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_role_updated ON public.roles;
CREATE TRIGGER on_role_updated
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Table: permissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: user_roles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);

-- ------------------------------------------------------------------------------
-- Table: role_permissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_role_permissions UNIQUE (role_id, permission_id)
);

-- ------------------------------------------------------------------------------
-- Table: users (Platform / Application Users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  country TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_platform_user_updated ON public.users;
CREATE TRIGGER on_platform_user_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Table: plans
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly', 'one_time')),
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_plan_updated ON public.plans;
CREATE TRIGGER on_plan_updated
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Table: subscriptions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_subscription_updated ON public.subscriptions;
CREATE TRIGGER on_subscription_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Table: transactions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'credit', 'adjustment')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  external_reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: ai_jobs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'canceled')),
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  input_tokens INTEGER DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER DEFAULT 0 CHECK (output_tokens >= 0),
  total_tokens INTEGER DEFAULT 0 CHECK (total_tokens >= 0),
  estimated_cost NUMERIC(10, 6) DEFAULT 0 CHECK (estimated_cost >= 0),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_ai_job_updated ON public.ai_jobs;
CREATE TRIGGER on_ai_job_updated
  BEFORE UPDATE ON public.ai_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Table: ai_usage
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  input_tokens BIGINT NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens BIGINT NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  total_tokens BIGINT NOT NULL DEFAULT 0 CHECK (total_tokens >= 0),
  estimated_cost NUMERIC(12, 6) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_ai_usage_user_model_date UNIQUE (user_id, model, usage_date)
);

-- ------------------------------------------------------------------------------
-- Table: audit_logs (Append-only)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE & LOOKUPS
-- ==============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- users
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- plans
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON public.plans(is_active);

-- subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ai_jobs
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON public.ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_model ON public.ai_jobs(model);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON public.ai_jobs(created_at DESC);

-- ai_usage
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON public.ai_usage(model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_usage_date ON public.ai_usage(usage_date DESC);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 4. SECURITY DEFINER HELPER FUNCTIONS FOR RLS
-- ==============================================================================

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
    WHERE ur.user_id = _user_id
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
    WHERE ur.user_id = _user_id
      AND p.name = _permission_name
  );
$$;

-- Check if a user is an administrator (super_admin or admin)
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
    WHERE ur.user_id = _user_id
      AND r.name IN ('super_admin', 'admin')
  );
$$;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 12 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.read')
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.update')
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.update')
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- RLS: roles & permissions (Admin / Security)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "roles_read_policy" ON public.roles;
CREATE POLICY "roles_read_policy" ON public.roles
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR public.has_role(auth.uid(), 'support')
  );

DROP POLICY IF EXISTS "roles_write_policy" ON public.roles;
CREATE POLICY "roles_write_policy" ON public.roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "permissions_read_policy" ON public.permissions;
CREATE POLICY "permissions_read_policy" ON public.permissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "permissions_write_policy" ON public.permissions;
CREATE POLICY "permissions_write_policy" ON public.permissions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ------------------------------------------------------------------------------
-- RLS: user_roles & role_permissions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_roles_read_policy" ON public.user_roles;
CREATE POLICY "user_roles_read_policy" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "user_roles_write_policy" ON public.user_roles;
CREATE POLICY "user_roles_write_policy" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "role_permissions_read_policy" ON public.role_permissions;
CREATE POLICY "role_permissions_read_policy" ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "role_permissions_write_policy" ON public.role_permissions;
CREATE POLICY "role_permissions_write_policy" ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ------------------------------------------------------------------------------
-- RLS: users (Platform users)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_read_policy" ON public.users;
CREATE POLICY "users_read_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.read')
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "users_write_policy" ON public.users;
CREATE POLICY "users_write_policy" ON public.users
  FOR ALL
  TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.update')
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'users.update')
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- RLS: plans (Public read for active plans, Admin management)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "plans_select_policy" ON public.plans;
CREATE POLICY "plans_select_policy" ON public.plans
  FOR SELECT
  TO public
  USING (
    is_active = true
    OR (auth.role() = 'authenticated' AND (public.is_admin(auth.uid()) OR public.has_permission(auth.uid(), 'billing.read')))
  );

DROP POLICY IF EXISTS "plans_admin_write_policy" ON public.plans;
CREATE POLICY "plans_admin_write_policy" ON public.plans
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_permission(auth.uid(), 'billing.update'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_permission(auth.uid(), 'billing.update'));

-- ------------------------------------------------------------------------------
-- RLS: subscriptions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'subscriptions.read')
    OR public.is_admin(auth.uid())
    OR public.has_role(auth.uid(), 'support')
  );

DROP POLICY IF EXISTS "subscriptions_write_policy" ON public.subscriptions;
CREATE POLICY "subscriptions_write_policy" ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (
    public.has_permission(auth.uid(), 'subscriptions.update')
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'subscriptions.update')
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- RLS: transactions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
CREATE POLICY "transactions_select_policy" ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'billing.read')
    OR public.is_admin(auth.uid())
    OR public.has_role(auth.uid(), 'analyst')
  );

DROP POLICY IF EXISTS "transactions_write_policy" ON public.transactions;
CREATE POLICY "transactions_write_policy" ON public.transactions
  FOR ALL
  TO authenticated
  USING (
    public.has_permission(auth.uid(), 'billing.update')
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'billing.update')
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- RLS: ai_jobs
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "ai_jobs_select_policy" ON public.ai_jobs;
CREATE POLICY "ai_jobs_select_policy" ON public.ai_jobs
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'ai_jobs.read')
    OR public.is_admin(auth.uid())
    OR public.has_role(auth.uid(), 'analyst')
  );

DROP POLICY IF EXISTS "ai_jobs_insert_policy" ON public.ai_jobs;
CREATE POLICY "ai_jobs_insert_policy" ON public.ai_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'ai_jobs.create')
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "ai_jobs_modify_policy" ON public.ai_jobs;
CREATE POLICY "ai_jobs_modify_policy" ON public.ai_jobs
  FOR UPDATE
  TO authenticated
  USING (
    public.has_permission(auth.uid(), 'ai_jobs.cancel')
    OR public.has_permission(auth.uid(), 'ai_jobs.retry')
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'ai_jobs.cancel')
    OR public.has_permission(auth.uid(), 'ai_jobs.retry')
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- RLS: ai_usage
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "ai_usage_select_policy" ON public.ai_usage;
CREATE POLICY "ai_usage_select_policy" ON public.ai_usage
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR public.has_permission(auth.uid(), 'ai_usage.read')
    OR public.is_admin(auth.uid())
    OR public.has_role(auth.uid(), 'analyst')
  );

DROP POLICY IF EXISTS "ai_usage_write_policy" ON public.ai_usage;
CREATE POLICY "ai_usage_write_policy" ON public.ai_usage
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- RLS: audit_logs (Append-only, strictly immutable)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.has_permission(auth.uid(), 'audit_logs.read')
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Explicitly prevent UPDATE and DELETE on audit_logs
DROP POLICY IF EXISTS "audit_logs_no_update" ON public.audit_logs;
CREATE POLICY "audit_logs_no_update" ON public.audit_logs
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "audit_logs_no_delete" ON public.audit_logs;
CREATE POLICY "audit_logs_no_delete" ON public.audit_logs
  FOR DELETE
  USING (false);

-- ==============================================================================
-- 6. REFERENCE SEED DATA
-- ==============================================================================

-- Seed Initial Roles
INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Full administrative and security privileges across the Veytrix platform.'),
  ('admin', 'Operational management and configuration access.'),
  ('support', 'Customer support, session view, and ticket troubleshooting access.'),
  ('analyst', 'Read-only access to analytical metrics, jobs, and usage reports.')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- Seed Standard Permissions
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('users.read', 'users', 'read', 'View platform users and profiles'),
  ('users.create', 'users', 'create', 'Create platform user accounts'),
  ('users.update', 'users', 'update', 'Update user profiles and statuses'),
  ('users.delete', 'users', 'delete', 'Delete platform user records'),
  ('users.suspend', 'users', 'suspend', 'Suspend or ban platform user accounts'),

  ('billing.read', 'billing', 'read', 'View transactions, plans, and invoices'),
  ('billing.create', 'billing', 'create', 'Create billing plans and charges'),
  ('billing.update', 'billing', 'update', 'Update plans and billing settings'),
  ('billing.refund', 'billing', 'refund', 'Issue customer refunds and credit adjustments'),

  ('subscriptions.read', 'subscriptions', 'read', 'View active and canceled subscriptions'),
  ('subscriptions.create', 'subscriptions', 'create', 'Create or assign customer subscriptions'),
  ('subscriptions.update', 'subscriptions', 'update', 'Modify subscription terms and plans'),
  ('subscriptions.cancel', 'subscriptions', 'cancel', 'Cancel customer subscriptions'),

  ('ai_jobs.read', 'ai_jobs', 'read', 'View AI processing jobs and statuses'),
  ('ai_jobs.create', 'ai_jobs', 'create', 'Queue new AI processing jobs'),
  ('ai_jobs.retry', 'ai_jobs', 'retry', 'Retry failed AI execution jobs'),
  ('ai_jobs.cancel', 'ai_jobs', 'cancel', 'Cancel running or queued AI jobs'),

  ('ai_usage.read', 'ai_usage', 'read', 'View AI token consumption and cost analytics'),

  ('audit_logs.read', 'audit_logs', 'read', 'View platform security and audit logs'),

  ('settings.read', 'settings', 'read', 'View system settings and configurations'),
  ('settings.update', 'settings', 'update', 'Modify system settings and configurations')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- Map Permissions to Roles
DO $$
DECLARE
  v_super_admin_id UUID;
  v_admin_id UUID;
  v_support_id UUID;
  v_analyst_id UUID;
BEGIN
  SELECT id INTO v_super_admin_id FROM public.roles WHERE name = 'super_admin';
  SELECT id INTO v_admin_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO v_support_id FROM public.roles WHERE name = 'support';
  SELECT id INTO v_analyst_id FROM public.roles WHERE name = 'analyst';

  -- Super Admin gets all permissions
  IF v_super_admin_id IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_super_admin_id, p.id FROM public.permissions p
    ON CONFLICT DO NOTHING;
  END IF;

  -- Admin gets all except role/permission restructuring
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_admin_id, p.id FROM public.permissions p
    WHERE p.name NOT IN ('users.delete')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Support gets user and subscription management permissions
  IF v_support_id IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_support_id, p.id FROM public.permissions p
    WHERE p.name IN ('users.read', 'users.update', 'subscriptions.read', 'ai_jobs.read', 'ai_jobs.retry', 'billing.read')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Analyst gets read-only analytical permissions
  IF v_analyst_id IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_analyst_id, p.id FROM public.permissions p
    WHERE p.name IN ('users.read', 'billing.read', 'subscriptions.read', 'ai_jobs.read', 'ai_usage.read', 'audit_logs.read', 'settings.read')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
