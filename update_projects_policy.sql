-- BFI DATABASE SCHEMA & RLS POLICIES INITIALIZATION
-- Run this exactly as is in your Supabase SQL Editor to set up everything!

-- ==========================================
-- 1. BOOKING TABLES INITIALIZATION
-- ==========================================

-- Create Movie Bookings Table if not exists
CREATE TABLE IF NOT EXISTS public.movie_bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  movie_id uuid,
  booking_id text not null unique,
  amount numeric not null check (amount >= 0),
  status text not null check (status in ('pending', 'confirmed', 'failed', 'cancelled')) default 'pending',
  payment_status text not null check (payment_status in ('pending', 'verified', 'failed')) default 'pending',
  created_at timestamptz default now() not null,
  confirmed_at timestamptz
);

-- Ensure all booking fields exist in movie_bookings
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS booking_id TEXT UNIQUE;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Drop check constraints to avoid casing issues (pending vs PENDING)
ALTER TABLE public.movie_bookings DROP CONSTRAINT IF EXISTS movie_bookings_status_check;
ALTER TABLE public.movie_bookings DROP CONSTRAINT IF EXISTS movie_bookings_payment_status_check;
ALTER TABLE public.movie_bookings DROP CONSTRAINT IF EXISTS movie_bookings_booking_status_check;

-- Create Payments Table if not exists
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references movie_bookings(id) on delete cascade not null,
  gateway_order_id text not null,
  gateway_payment_id text,
  gateway_signature text,
  amount numeric not null check (amount >= 0),
  payment_status text not null check (payment_status in ('pending', 'verified', 'failed')) default 'pending',
  verified_at timestamptz
);

-- Ensure all payments fields exist in payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_order_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_signature TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Drop payments check constraints to avoid casing issues
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_status_check;

-- Create Tickets Table if not exists
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references movie_bookings(id) on delete cascade not null unique,
  ticket_number text not null unique,
  invoice_number text not null unique,
  pdf_url text,
  email_sent boolean default false not null
);

-- Enable RLS on all booking tables
ALTER TABLE public.movie_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Grant access to standard Supabase roles
GRANT ALL ON public.movie_bookings TO postgres, service_role, authenticated, anon;
GRANT ALL ON public.payments TO postgres, service_role, authenticated, anon;
GRANT ALL ON public.tickets TO postgres, service_role, authenticated, anon;

-- ==========================================
-- 2. USER PROFILE & PROJECTS SCHEMA UPDATES
-- ==========================================

-- Ensure status column exists in projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';

-- Add multi-role columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS movie_lover_activated BOOLEAN DEFAULT FALSE;

-- Initialize existing accounts with their current role
UPDATE public.profiles SET primary_role = role WHERE primary_role IS NULL;
UPDATE public.profiles SET active_role = role WHERE active_role IS NULL;
UPDATE public.profiles SET movie_lover_activated = TRUE WHERE role = 'MOVIE_LOVER' AND movie_lover_activated IS NULL;
UPDATE public.profiles SET movie_lover_activated = FALSE WHERE movie_lover_activated IS NULL;

-- ==========================================
-- 3. HELPER FUNCTIONS
-- ==========================================

-- Helper function to fetch the current active role from the profiles table.
CREATE OR REPLACE FUNCTION public.get_active_role()
RETURNS text AS $$
  SELECT coalesce(
    (SELECT active_role FROM public.profiles WHERE id = auth.uid()),
    'MOVIE_LOVER'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==========================================
-- 4. SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- ------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public profiles are viewable by everyone
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT USING (true);

-- Users can insert their own profiles
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profiles
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can update all profiles (for approving KYC status)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- ------------------------------------------
-- PROJECTS (SCRIPTS) POLICIES
-- ------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Project Select Policy for Investors
DROP POLICY IF EXISTS "Access projects based on active role" ON public.projects;
CREATE POLICY "Access projects based on active role" ON public.projects
FOR SELECT USING (
  (public.get_active_role() = 'INVESTOR')
  OR
  ((public.get_active_role() = 'DIRECTOR' OR public.get_active_role() = 'WRITER') AND auth.uid() = "directorId")
  OR
  (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'))
);

-- Directors can insert screenplays
DROP POLICY IF EXISTS "Directors can insert projects" ON public.projects;
CREATE POLICY "Directors can insert projects" ON public.projects FOR INSERT
  WITH CHECK (
    (public.get_active_role() = 'DIRECTOR' and auth.uid() = "directorId")
    or
    (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'))
  );

-- Directors and Admins can update screenplays
DROP POLICY IF EXISTS "Directors can update own projects" ON public.projects;
CREATE POLICY "Directors can update own projects" ON public.projects FOR UPDATE
  USING (
    (public.get_active_role() = 'DIRECTOR' and auth.uid() = "directorId")
    or
    (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'))
  );

-- Directors and Admins can delete screenplays
DROP POLICY IF EXISTS "Directors can delete own projects" ON public.projects;
CREATE POLICY "Directors can delete own projects" ON public.projects FOR DELETE
  USING (
    (public.get_active_role() = 'DIRECTOR' and auth.uid() = "directorId")
    or
    (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'))
  );

-- Admins can update any project status
DROP POLICY IF EXISTS "Admins can update any project" ON public.projects;
CREATE POLICY "Admins can update any project" ON public.projects FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- Admins can delete any project
DROP POLICY IF EXISTS "Admins can delete any project" ON public.projects;
CREATE POLICY "Admins can delete any project" ON public.projects FOR DELETE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- ------------------------------------------
-- INVESTMENTS POLICIES
-- ------------------------------------------
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Investments viewable by owner
DROP POLICY IF EXISTS "Investments select policy" ON public.investments;
CREATE POLICY "Investments select policy" ON public.investments FOR SELECT
  USING (auth.uid() = "userId");

-- Investors can create investments
DROP POLICY IF EXISTS "Investors can insert investments" ON public.investments;
CREATE POLICY "Investors can insert investments" ON public.investments FOR INSERT
  WITH CHECK (
    ((public.get_active_role() = 'INVESTOR' or public.get_active_role() = 'ADMIN') and auth.uid() = "userId")
  );

-- Admins can select all investments
DROP POLICY IF EXISTS "Admins can select all investments" ON public.investments;
CREATE POLICY "Admins can select all investments" ON public.investments FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- Admins can update all investments (for approving them)
DROP POLICY IF EXISTS "Admins can update all investments" ON public.investments;
CREATE POLICY "Admins can update all investments" ON public.investments FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- ------------------------------------------
-- MOVIE BOOKINGS POLICIES
-- ------------------------------------------

-- User Policies for Bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.movie_bookings;
CREATE POLICY "Users can view their own bookings" ON public.movie_bookings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own pending bookings" ON public.movie_bookings;
CREATE POLICY "Users can create their own pending bookings" ON public.movie_bookings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    and (status = 'PENDING' OR status = 'pending')
    and (payment_status = 'PENDING' OR payment_status = 'pending')
  );

-- Admin Policies for Movie Bookings
DROP POLICY IF EXISTS "Admins can select all bookings" ON public.movie_bookings;
CREATE POLICY "Admins can select all bookings" ON public.movie_bookings FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.movie_bookings;
CREATE POLICY "Admins can update all bookings" ON public.movie_bookings FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- ------------------------------------------
-- PAYMENTS POLICIES
-- ------------------------------------------

-- User Policies for Payments
DROP POLICY IF EXISTS "Users can view payments for their own bookings" ON public.payments;
CREATE POLICY "Users can view payments for their own bookings" ON public.payments FOR SELECT
  USING (exists (select 1 from public.movie_bookings where id = payments.booking_id and movie_bookings.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert payments for their pending bookings" ON public.payments;
CREATE POLICY "Users can insert payments for their pending bookings" ON public.payments FOR INSERT 
  WITH CHECK (
    exists (
      select 1 from public.movie_bookings 
      where public.movie_bookings.id = payments.booking_id 
      and public.movie_bookings.user_id = auth.uid()
      and (public.movie_bookings.status = 'PENDING' OR public.movie_bookings.status = 'pending')
    )
  );

-- Admin Policies for Payments
DROP POLICY IF EXISTS "Admins can select all payments" ON public.payments;
CREATE POLICY "Admins can select all payments" ON public.payments FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can insert all payments" ON public.payments;
CREATE POLICY "Admins can insert all payments" ON public.payments FOR INSERT
  WITH CHECK (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
CREATE POLICY "Admins can update all payments" ON public.payments FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- ------------------------------------------
-- TICKETS POLICIES
-- ------------------------------------------

-- User Policies for Tickets
DROP POLICY IF EXISTS "Users can view tickets for their own bookings" ON public.tickets;
CREATE POLICY "Users can view tickets for their own bookings" ON public.tickets FOR SELECT
  USING (exists (select 1 from public.movie_bookings where id = tickets.booking_id and movie_bookings.user_id = auth.uid()));

-- Admin Policies for Tickets
DROP POLICY IF EXISTS "Admins can select all tickets" ON public.tickets;
CREATE POLICY "Admins can select all tickets" ON public.tickets FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can insert all tickets" ON public.tickets;
CREATE POLICY "Admins can insert all tickets" ON public.tickets FOR INSERT
  WITH CHECK (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- ==========================================
-- 5. RELOAD SCHEMA CACHE
-- ==========================================
NOTIFY pgrst, 'reload schema';
