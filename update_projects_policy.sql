-- UPDATE BFI DATABASE POLICIES & SCHEMA
-- Run this exactly as is in your Supabase SQL Editor.

-- 1. Add multi-role columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS movie_lover_activated BOOLEAN DEFAULT FALSE;

-- Initialize existing accounts with their current role
UPDATE public.profiles SET primary_role = role WHERE primary_role IS NULL;
UPDATE public.profiles SET active_role = role WHERE active_role IS NULL;
UPDATE public.profiles SET movie_lover_activated = TRUE WHERE role = 'MOVIE_LOVER' AND movie_lover_activated IS NULL;
UPDATE public.profiles SET movie_lover_activated = FALSE WHERE movie_lover_activated IS NULL;

-- 2. Helper function to fetch the current active role from the profiles table.
CREATE OR REPLACE FUNCTION public.get_active_role()
RETURNS text AS $$
  SELECT coalesce(
    (SELECT active_role FROM public.profiles WHERE id = auth.uid()),
    'MOVIE_LOVER'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Project Select Policy for Investors
DROP POLICY IF EXISTS "Access projects based on active role" ON public.projects;
CREATE POLICY "Access projects based on active role" ON public.projects
FOR SELECT USING (
  (public.get_active_role() = 'INVESTOR')
  OR
  ((public.get_active_role() = 'DIRECTOR' OR public.get_active_role() = 'WRITER') AND auth.uid() = "directorId")
  OR
  (public.get_active_role() = 'ADMIN')
);

-- 4. Admin Policies for Movie Bookings
DROP POLICY IF EXISTS "Admins can select all bookings" ON public.movie_bookings;
CREATE POLICY "Admins can select all bookings" ON public.movie_bookings FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.movie_bookings;
CREATE POLICY "Admins can update all bookings" ON public.movie_bookings FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- 5. Admin Policies for Payments
DROP POLICY IF EXISTS "Admins can select all payments" ON public.payments;
CREATE POLICY "Admins can select all payments" ON public.payments FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can insert all payments" ON public.payments;
CREATE POLICY "Admins can insert all payments" ON public.payments FOR INSERT
  WITH CHECK (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
CREATE POLICY "Admins can update all payments" ON public.payments FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- 6. Admin Policies for Tickets
DROP POLICY IF EXISTS "Admins can select all tickets" ON public.tickets;
CREATE POLICY "Admins can select all tickets" ON public.tickets FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can insert all tickets" ON public.tickets;
CREATE POLICY "Admins can insert all tickets" ON public.tickets FOR INSERT
  WITH CHECK (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- 7. User Policies for Payments (Allows client-side inserts of pending payments)
DROP POLICY IF EXISTS "Users can insert payments for their pending bookings" ON public.payments;
CREATE POLICY "Users can insert payments for their pending bookings" 
  ON public.payments FOR INSERT 
  WITH CHECK (
    exists (
      select 1 from public.movie_bookings 
      where public.movie_bookings.id = payments.booking_id 
      and public.movie_bookings.user_id = auth.uid()
      and public.movie_bookings.status = 'pending'
    )
  );
