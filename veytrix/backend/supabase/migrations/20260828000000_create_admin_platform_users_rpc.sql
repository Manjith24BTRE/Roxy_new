-- Migration: Create Admin Platform Users RPC
-- File: backend/supabase/migrations/20260828000000_create_admin_platform_users_rpc.sql

CREATE OR REPLACE FUNCTION public.get_admin_platform_users(
  p_search TEXT DEFAULT '',
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_email TEXT;
  v_total_count INT;
  v_filtered_count INT;
  v_users JSONB;
BEGIN
  -- 1. Extract caller email from JWT claim
  v_caller_email := auth.jwt() ->> 'email';

  -- 2. Security validation: Caller must be official@mavrostech.in
  IF v_caller_email IS NULL OR v_caller_email != 'official@mavrostech.in' THEN
    RAISE EXCEPTION 'Access Denied: Control Centre administrator credentials required.';
  END IF;

  -- 3. Calculate total users count
  SELECT COUNT(*) INTO v_total_count FROM public.profiles;

  -- 4. Calculate filtered count
  SELECT COUNT(*) INTO v_filtered_count
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE (
    p_search = '' OR
    p.display_name ILIKE '%' || p_search || '%' OR
    p.username ILIKE '%' || p_search || '%' OR
    u.email ILIKE '%' || p_search || '%'
  );

  -- 5. Fetch paginated users array as JSONB
  SELECT jsonb_agg(user_row) INTO v_users
  FROM (
    SELECT 
      p.user_id AS id,
      COALESCE(u.email, p.username || '@veytrix.com', 'user@veytrix.com') AS email,
      COALESCE(p.display_name, p.username, 'Anonymous User') AS display_name,
      p.username,
      p.created_at,
      p.updated_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    WHERE (
      p_search = '' OR
      p.display_name ILIKE '%' || p_search || '%' OR
      p.username ILIKE '%' || p_search || '%' OR
      u.email ILIKE '%' || p_search || '%'
    )
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) user_row;

  -- 6. Return response JSON structure
  RETURN jsonb_build_object(
    'total_users', v_total_count,
    'filtered_users', v_filtered_count,
    'users', COALESCE(v_users, '[]'::jsonb)
  );
END;
$$;
