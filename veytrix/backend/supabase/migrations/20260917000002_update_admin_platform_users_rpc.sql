-- Migration: Update Admin Platform Users RPC to return 100% real database metrics, auth emails, subscriptions, credits, and counts
CREATE OR REPLACE FUNCTION public.get_admin_platform_users(
  p_search TEXT DEFAULT '',
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_plan_filter TEXT DEFAULT 'All',
  p_status_filter TEXT DEFAULT 'All'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_count INT;
  v_filtered_count INT;
  v_users JSONB;
  v_active_24h INT;
  v_new_today INT;
  v_paid_users INT;
  v_free_users INT;
  v_suspended INT;
BEGIN
  -- Total users in auth.users
  SELECT COUNT(*) INTO v_total_count FROM auth.users;

  -- 24h active users
  SELECT COUNT(*) INTO v_active_24h FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours';

  -- New users today
  SELECT COUNT(*) INTO v_new_today FROM auth.users WHERE created_at >= NOW() - INTERVAL '24 hours';

  -- Paid vs Free users
  SELECT COUNT(*) INTO v_paid_users FROM public.subscriptions WHERE LOWER(plan) != 'free' AND status = 'active';
  SELECT COUNT(*) INTO v_free_users FROM auth.users u 
    LEFT JOIN public.subscriptions s ON s.user_id = u.id 
    WHERE s.plan IS NULL OR LOWER(s.plan) = 'free';

  -- Suspended users
  SELECT COUNT(*) INTO v_suspended FROM public.subscriptions WHERE status IN ('suspended', 'banned', 'canceled');

  -- Filtered Count
  SELECT COUNT(*) INTO v_filtered_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  LEFT JOIN public.subscriptions s ON s.user_id = u.id
  WHERE (
    p_search = '' OR
    u.email ILIKE '%' || p_search || '%' OR
    p.display_name ILIKE '%' || p_search || '%' OR
    u.id::text ILIKE '%' || p_search || '%'
  )
  AND (p_plan_filter = 'All' OR LOWER(s.plan) = LOWER(p_plan_filter))
  AND (p_status_filter = 'All' OR LOWER(s.status) = LOWER(p_status_filter));

  -- Fetch paginated users
  SELECT jsonb_agg(user_row) INTO v_users
  FROM (
    SELECT 
      u.id AS id,
      u.email AS email,
      COALESCE(p.display_name, split_part(u.email, '@', 1), 'Anonymous User') AS display_name,
      p.avatar_url,
      COALESCE(s.plan, 'FREE') AS plan,
      COALESCE(s.status, 'Active') AS status,
      COALESCE(c.balance, 100) AS credits,
      (SELECT COUNT(*) FROM public.projects pr WHERE pr.user_id = u.id AND pr.deleted_at IS NULL) AS projects_count,
      (SELECT COUNT(*) FROM public.exports ex WHERE ex.user_id = u.id) AS exports_count,
      u.created_at AS joined_at,
      COALESCE(u.last_sign_in_at, u.created_at) AS last_login_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    LEFT JOIN public.subscriptions s ON s.user_id = u.id
    LEFT JOIN public.credits c ON c.user_id = u.id
    WHERE (
      p_search = '' OR
      u.email ILIKE '%' || p_search || '%' OR
      p.display_name ILIKE '%' || p_search || '%' OR
      u.id::text ILIKE '%' || p_search || '%'
    )
    AND (p_plan_filter = 'All' OR LOWER(s.plan) = LOWER(p_plan_filter))
    AND (p_status_filter = 'All' OR LOWER(s.status) = LOWER(p_status_filter))
    ORDER BY u.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) user_row;

  RETURN jsonb_build_object(
    'total_users', v_total_count,
    'filtered_users', v_filtered_count,
    'active_24h', v_active_24h,
    'new_today', v_new_today,
    'paid_users', v_paid_users,
    'free_users', v_free_users,
    'suspended_users', v_suspended,
    'users', COALESCE(v_users, '[]'::jsonb)
  );
END;
$$;
