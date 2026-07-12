-- BFI Database Migration: Update User Profiles Role Check Constraint
-- Run this in your Supabase SQL Editor to allow new signup roles!

-- 1. Drop the existing constraint if it exists (usually auto-named 'profiles_role_check')
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add the updated check constraint containing all roles, including MOVIE_LOVER
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'INVESTOR', 
  'DIRECTOR', 
  'ADMIN', 
  'PRODUCER', 
  'WRITER', 
  'ACTOR', 
  'CREW', 
  'VENDOR', 
  'DISTRIBUTOR', 
  'SERVICE_PROVIDER', 
  'STUDENT', 
  'MOVIE_LOVER'
));
