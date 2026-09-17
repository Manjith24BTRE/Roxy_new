-- Migration: Rebuild Credit Economy into Real Database-Driven System
-- File: backend/supabase/migrations/20260917000000_rebuild_credit_system.sql

-- 1. Extend public.credits table
ALTER TABLE public.credits 
    ADD COLUMN IF NOT EXISTS current_balance INT NOT NULL DEFAULT 100,
    ADD COLUMN IF NOT EXISTS total_credits_issued INT NOT NULL DEFAULT 100,
    ADD COLUMN IF NOT EXISTS total_credits_consumed INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill current_balance from balance if necessary
UPDATE public.credits SET current_balance = balance WHERE current_balance IS NULL OR current_balance = 100 AND balance != 100;

-- 2. Create public.credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    reason TEXT NOT NULL,
    created_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create public.credit_audit_logs table
CREATE TABLE IF NOT EXISTS public.credit_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user TEXT NOT NULL,
    affected_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_balance INT NOT NULL,
    new_balance INT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_audit_logs_affected_user ON public.credit_audit_logs(affected_user);
CREATE INDEX IF NOT EXISTS idx_credit_audit_logs_timestamp ON public.credit_audit_logs(timestamp DESC);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on credit_transactions"
    ON public.credit_transactions FOR ALL
    USING (true);

CREATE POLICY "Users can view own audit logs"
    ON public.credit_audit_logs FOR SELECT
    USING (auth.uid() = affected_user);

CREATE POLICY "Service role full access on credit_audit_logs"
    ON public.credit_audit_logs FOR ALL
    USING (true);

-- 4. Stored RPC Functions

-- Assign Credits
CREATE OR REPLACE FUNCTION public.assign_user_credits(
    p_user_id UUID,
    p_amount INT,
    p_reason TEXT DEFAULT 'Admin Credit Assignment',
    p_admin_identifier TEXT DEFAULT 'Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_balance INT;
    v_new_balance INT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero.';
    END IF;

    -- Ensure row exists in credits table
    INSERT INTO public.credits (user_id, balance, current_balance, total_credits_issued, total_credits_consumed, updated_at, last_updated)
    VALUES (p_user_id, 100, 100, 100, 0, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- Get old balance
    SELECT balance INTO v_old_balance FROM public.credits WHERE user_id = p_user_id;

    v_new_balance := v_old_balance + p_amount;

    -- Update credits table
    UPDATE public.credits
    SET balance = v_new_balance,
        current_balance = v_new_balance,
        total_credits_issued = total_credits_issued + p_amount,
        updated_at = NOW(),
        last_updated = NOW()
    WHERE user_id = p_user_id;

    -- Insert into transactions ledger
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, reason, created_by)
    VALUES (p_user_id, p_amount, 'credit', p_reason, p_admin_identifier);

    -- Insert into audit logs
    INSERT INTO public.credit_audit_logs (admin_user, affected_user, old_balance, new_balance, reason)
    VALUES (p_admin_identifier, p_user_id, v_old_balance, v_new_balance, p_reason);

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'old_balance', v_old_balance,
        'new_balance', v_new_balance,
        'amount_added', p_amount
    );
END;
$$;

-- Deduct Credits
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
    p_user_id UUID,
    p_amount INT,
    p_reason TEXT DEFAULT 'Manual Deduction',
    p_admin_identifier TEXT DEFAULT 'Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_balance INT;
    v_new_balance INT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero.';
    END IF;

    -- Get current balance
    SELECT balance INTO v_old_balance FROM public.credits WHERE user_id = p_user_id;

    IF v_old_balance IS NULL THEN
        RAISE EXCEPTION 'User credit record not found.';
    END IF;

    IF v_old_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient credit balance.';
    END IF;

    v_new_balance := v_old_balance - p_amount;

    -- Update credits table
    UPDATE public.credits
    SET balance = v_new_balance,
        current_balance = v_new_balance,
        total_credits_consumed = total_credits_consumed + p_amount,
        updated_at = NOW(),
        last_updated = NOW()
    WHERE user_id = p_user_id;

    -- Insert into transactions ledger
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, reason, created_by)
    VALUES (p_user_id, -p_amount, 'debit', p_reason, p_admin_identifier);

    -- Insert into audit logs
    INSERT INTO public.credit_audit_logs (admin_user, affected_user, old_balance, new_balance, reason)
    VALUES (p_admin_identifier, p_user_id, v_old_balance, v_new_balance, p_reason);

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'old_balance', v_old_balance,
        'new_balance', v_new_balance,
        'amount_deducted', p_amount
    );
END;
$$;

-- Reset Credits
CREATE OR REPLACE FUNCTION public.reset_user_credits(
    p_user_id UUID,
    p_target_balance INT DEFAULT 100,
    p_reason TEXT DEFAULT 'Reset Credits',
    p_admin_identifier TEXT DEFAULT 'Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_balance INT;
    v_diff INT;
    v_type TEXT;
BEGIN
    SELECT balance INTO v_old_balance FROM public.credits WHERE user_id = p_user_id;

    IF v_old_balance IS NULL THEN
        v_old_balance := 0;
        INSERT INTO public.credits (user_id, balance, current_balance, total_credits_issued, total_credits_consumed)
        VALUES (p_user_id, p_target_balance, p_target_balance, p_target_balance, 0);
    ELSE
        UPDATE public.credits
        SET balance = p_target_balance,
            current_balance = p_target_balance,
            last_reset = NOW(),
            updated_at = NOW(),
            last_updated = NOW()
        WHERE user_id = p_user_id;
    END IF;

    v_diff := p_target_balance - v_old_balance;
    v_type := CASE WHEN v_diff >= 0 THEN 'credit' ELSE 'debit' END;

    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, reason, created_by)
    VALUES (p_user_id, v_diff, v_type, p_reason, p_admin_identifier);

    INSERT INTO public.credit_audit_logs (admin_user, affected_user, old_balance, new_balance, reason)
    VALUES (p_admin_identifier, p_user_id, v_old_balance, p_target_balance, p_reason);

    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'old_balance', v_old_balance,
        'new_balance', p_target_balance
    );
END;
$$;
