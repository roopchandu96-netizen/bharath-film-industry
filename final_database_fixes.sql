-- 1. Fix active role function to ALWAYS fallback correctly
CREATE OR REPLACE FUNCTION public.get_active_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  -- First try active_role
  SELECT active_role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NOT NULL THEN
    RETURN v_role;
  END IF;
  
  -- Fallback to role
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NOT NULL THEN
    RETURN v_role;
  END IF;
  
  RETURN 'MOVIE_LOVER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create RPC function for Admin approvals (BYPASSES RLS)
CREATE OR REPLACE FUNCTION public.admin_verify_user(p_user_id UUID, p_status TEXT)
RETURNS void AS $$
BEGIN
  -- Check if caller is ADMIN
  IF public.get_active_role() = 'ADMIN' THEN
    UPDATE public.profiles SET "kycStatus" = p_status WHERE id = p_user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Only admins can verify users.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
