-- BFI COMPLETE DATABASE MIGRATION & RLS SECURITY POLICIES RESET
-- Run this entire script in your Supabase SQL Editor to verify columns and authorize Admin approvals/rejections.

-- ==========================================
-- 0. SCHEMA MIGRATION: ENSURE ALL COLUMNS EXIST
-- ==========================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS movie_lover_activated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "photoURL" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "photoFileName" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "kycStatus" TEXT DEFAULT 'NOT_STARTED';

-- Initialize role columns for existing users
UPDATE public.profiles SET primary_role = role WHERE primary_role IS NULL;
UPDATE public.profiles SET active_role = role WHERE active_role IS NULL;
UPDATE public.profiles SET movie_lover_activated = TRUE WHERE role = 'MOVIE_LOVER' AND movie_lover_activated IS NULL;
UPDATE public.profiles SET movie_lover_activated = FALSE WHERE movie_lover_activated IS NULL;

-- ==========================================
-- 1. PROFILES TABLE POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

-- ==========================================
-- 2. PROJECTS (SCREENPLAYS) TABLE POLICIES
-- ==========================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Access projects based on active role" ON public.projects;
CREATE POLICY "Access projects based on active role" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Directors can insert projects" ON public.projects;
CREATE POLICY "Directors can insert projects" ON public.projects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Directors can update own projects" ON public.projects;
CREATE POLICY "Directors can update own projects" ON public.projects FOR UPDATE
  USING (
    auth.uid() = "directorId" 
    OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

DROP POLICY IF EXISTS "Directors can delete own projects" ON public.projects;
CREATE POLICY "Directors can delete own projects" ON public.projects FOR DELETE
  USING (
    auth.uid() = "directorId" 
    OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

-- ==========================================
-- 3. MOVIE BOOKINGS TABLE POLICIES
-- ==========================================
ALTER TABLE public.movie_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own bookings" ON public.movie_bookings;
CREATE POLICY "Users can select own bookings" ON public.movie_bookings FOR SELECT
  USING (
    auth.uid() = user_id 
    OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

DROP POLICY IF EXISTS "Users can insert own bookings" ON public.movie_bookings;
CREATE POLICY "Users can insert own bookings" ON public.movie_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admin can update bookings" ON public.movie_bookings;
CREATE POLICY "Only admin can update bookings" ON public.movie_bookings FOR UPDATE
  USING (
    LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

DROP POLICY IF EXISTS "Only admin can delete bookings" ON public.movie_bookings;
CREATE POLICY "Only admin can delete bookings" ON public.movie_bookings FOR DELETE
  USING (
    LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

-- ==========================================
-- 4. PAYMENTS TABLE POLICIES
-- ==========================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own payments" ON public.payments;
CREATE POLICY "Users can select own payments" ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movie_bookings
      WHERE public.movie_bookings.id = payments.booking_id
        AND public.movie_bookings.user_id = auth.uid()
    )
    OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admin can update payments" ON public.payments;
CREATE POLICY "Only admin can update payments" ON public.payments FOR UPDATE
  USING (
    LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

-- ==========================================
-- 5. TICKETS TABLE POLICIES
-- ==========================================
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own tickets" ON public.tickets;
CREATE POLICY "Users can select own tickets" ON public.tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can insert tickets" ON public.tickets;
CREATE POLICY "Only admin can insert tickets" ON public.tickets FOR INSERT
  WITH CHECK (
    LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

DROP POLICY IF EXISTS "Only admin can update tickets" ON public.tickets;
CREATE POLICY "Only admin can update tickets" ON public.tickets FOR UPDATE
  USING (
    LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

-- ==========================================
-- 6. INVESTMENTS TABLE POLICIES
-- ==========================================
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investments select policy" ON public.investments;
CREATE POLICY "Investments select policy" ON public.investments FOR SELECT
  USING (
    auth.uid() = "userId"
    OR LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

DROP POLICY IF EXISTS "Investors can create investments" ON public.investments;
CREATE POLICY "Investors can create investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Only admin can update investments" ON public.investments;
CREATE POLICY "Only admin can update investments" ON public.investments FOR UPDATE
  USING (
    LOWER(auth.jwt() ->> 'email') = 'bharathfilmindustry@gmail.com'
  );

-- ==========================================
-- 7. NOTIFICATIONS TABLE POLICIES
-- ==========================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select notifications" ON public.notifications;
CREATE POLICY "Anyone can select notifications" ON public.notifications FOR SELECT USING (true);
