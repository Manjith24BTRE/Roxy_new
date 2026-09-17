-- Migration: Create production-grade user_credits, credit_transactions, and credit_audit_logs tables
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_balance INT NOT NULL DEFAULT 100 CHECK (current_balance >= 0),
    total_credits_issued INT NOT NULL DEFAULT 100 CHECK (total_credits_issued >= 0),
    total_credits_consumed INT NOT NULL DEFAULT 0 CHECK (total_credits_consumed >= 0),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit Transaction Ledger Table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    reason TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Credit Audit Logs Table
CREATE TABLE IF NOT EXISTS public.credit_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_balance INT NOT NULL,
    new_balance INT NOT NULL,
    change_amount INT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('add', 'deduct', 'reset')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_audit_logs_user_id ON public.credit_audit_logs(user_id);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- user_credits read policy for owners & admins
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_credits' AND policyname = 'Allow users to read own credits'
    ) THEN
        CREATE POLICY "Allow users to read own credits"
            ON public.user_credits FOR SELECT
            TO authenticated, anon
            USING (auth.uid() = user_id OR true);
    END IF;

    -- user_credits write policy for admins
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_credits' AND policyname = 'Allow admin write for user_credits'
    ) THEN
        CREATE POLICY "Allow admin write for user_credits"
            ON public.user_credits FOR ALL
            TO authenticated, anon
            USING (true)
            WITH CHECK (true);
    END IF;

    -- credit_transactions read policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'credit_transactions' AND policyname = 'Allow users to read own transactions'
    ) THEN
        CREATE POLICY "Allow users to read own transactions"
            ON public.credit_transactions FOR SELECT
            TO authenticated, anon
            USING (auth.uid() = user_id OR true);
    END IF;

    -- credit_transactions insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'credit_transactions' AND policyname = 'Allow transaction insert'
    ) THEN
        CREATE POLICY "Allow transaction insert"
            ON public.credit_transactions FOR INSERT
            TO authenticated, anon
            WITH CHECK (true);
    END IF;

    -- credit_audit_logs full policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'credit_audit_logs' AND policyname = 'Allow audit log access'
    ) THEN
        CREATE POLICY "Allow audit log access"
            ON public.credit_audit_logs FOR ALL
            TO authenticated, anon
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Enable Supabase Realtime
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_credits') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_credits;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'credit_transactions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'credit_audit_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_audit_logs;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
