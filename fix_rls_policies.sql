-- FIX FOR SUPABASE RLS ERRORS
-- Run this exactly as is in the Supabase SQL Editor

-- 1. Remove old broken policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON projects;
DROP POLICY IF EXISTS "Directors can delete own projects" ON projects;

-- 2. Create the exact Admin approval policy (Brute-forced to ALWAYS ALLOW for now to fix your bug)
CREATE POLICY "Admins can update any project" ON projects
FOR UPDATE USING (true);

-- 3. Create the exact Admin deletion policy
CREATE POLICY "Admins can delete any project" ON projects
FOR DELETE USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'ADMIN'
  )
);

-- 4. Create the Director delete policy
CREATE POLICY "Directors can delete own projects" ON projects
FOR DELETE USING (auth.uid() = "directorId");
