-- SUPABASE SQL SCRIPT
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/qpgidlybygavthytsxvl/sql/new)
-- This confirms the Play Store tester accounts and seeds their profiles.

-- 1. Confirm the demo accounts in auth.users (bypasses "Email not confirmed" error)
UPDATE auth.users
SET email_confirmed_at = now(),
    confirmed_at = now(),
    last_sign_in_at = now()
WHERE email IN ('investor-demo@bfi.com', 'director-demo@bfi.com');

-- 2. Insert public profile for the Investor Demo
INSERT INTO public.profiles (id, name, email, role, "kycStatus", "totalInvested", created_at)
VALUES (
  'b17f9849-7381-4c8a-9af5-1c70b914586b',
  'Investor Demo',
  'investor-demo@bfi.com',
  'INVESTOR',
  'VERIFIED',
  0,
  now()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'INVESTOR', "kycStatus" = 'VERIFIED';

-- 3. Insert public profile for the Director Demo
INSERT INTO public.profiles (id, name, email, role, "kycStatus", "totalInvested", created_at)
VALUES (
  'da7bc151-9dc9-4c76-ba4e-a35329c8292b',
  'Director Demo',
  'director-demo@bfi.com',
  'DIRECTOR',
  'VERIFIED',
  0,
  now()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'DIRECTOR', "kycStatus" = 'VERIFIED';
