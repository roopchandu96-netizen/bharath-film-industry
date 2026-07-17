-- 1. Create a secure view/function for Admins to fetch users + auth.users data (Last Login, Status)
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  "kycStatus" TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  is_suspended BOOLEAN
) AS $$
BEGIN
  -- Verify admin access
  IF public.get_active_role() != 'ADMIN' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view full user details.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.role,
    p."kycStatus",
    p.created_at,
    au.last_sign_in_at,
    (au.banned_until IS NOT NULL AND au.banned_until > now()) as is_suspended
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
