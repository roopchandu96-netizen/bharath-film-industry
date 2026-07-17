-- BFI FIX INVESTOR RLS POLICIES
-- Run this script in your Supabase SQL Editor to guarantee Investors can see Approved scripts.

CREATE OR REPLACE FUNCTION public.get_active_role()
RETURNS text AS $$
  SELECT COALESCE(
    (SELECT UPPER(COALESCE(active_role, role)) FROM public.profiles WHERE id = auth.uid()),
    'MOVIE_LOVER'
  );
$$ LANGUAGE sql SECURITY DEFINER;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Access projects based on active role" ON public.projects;
DROP POLICY IF EXISTS "Active projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Directors can create projects" ON public.projects;
DROP POLICY IF EXISTS "Directors can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Directors can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update any project" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete any project" ON public.projects;
DROP POLICY IF EXISTS "Directors can insert projects" ON public.projects;

-- Allow SELECT based on role and status
CREATE POLICY "Access projects based on active role" ON public.projects FOR SELECT
USING (
  (public.get_active_role() = 'INVESTOR' AND UPPER(status) IN ('ACTIVE', 'APPROVED'))
  OR
  (public.get_active_role() IN ('DIRECTOR', 'WRITER') AND auth.uid() = "directorId")
  OR
  (public.get_active_role() = 'ADMIN')
  OR
  (LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com')
);

-- Allow Directors to INSERT
CREATE POLICY "Directors can insert projects" ON public.projects FOR INSERT WITH CHECK (true);

-- Allow Directors/Admins to UPDATE
CREATE POLICY "Directors can update own projects" ON public.projects FOR UPDATE
USING (
  auth.uid() = "directorId" 
  OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
);

-- Allow Directors/Admins to DELETE
CREATE POLICY "Directors can delete own projects" ON public.projects FOR DELETE
USING (
  auth.uid() = "directorId" 
  OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
);
