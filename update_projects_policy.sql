-- UPDATE BFI DATABASE POLICIES
-- Run this exactly as is in your Supabase SQL Editor.

-- 1. Project Select Policy for Investors
DROP POLICY IF EXISTS "Access projects based on active role" ON public.projects;
CREATE POLICY "Access projects based on active role" ON public.projects
FOR SELECT USING (
  (public.get_active_role() = 'INVESTOR')
  OR
  ((public.get_active_role() = 'DIRECTOR' OR public.get_active_role() = 'WRITER') AND auth.uid() = "directorId")
  OR
  (public.get_active_role() = 'ADMIN')
);

-- 2. Admin Policies for Movie Bookings
DROP POLICY IF EXISTS "Admins can select all bookings" ON public.movie_bookings;
CREATE POLICY "Admins can select all bookings" ON public.movie_bookings FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.movie_bookings;
CREATE POLICY "Admins can update all bookings" ON public.movie_bookings FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- 3. Admin Policies for Payments
DROP POLICY IF EXISTS "Admins can select all payments" ON public.payments;
CREATE POLICY "Admins can select all payments" ON public.payments FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can insert all payments" ON public.payments;
CREATE POLICY "Admins can insert all payments" ON public.payments FOR INSERT
  WITH CHECK (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
CREATE POLICY "Admins can update all payments" ON public.payments FOR UPDATE
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

-- 4. Admin Policies for Tickets
DROP POLICY IF EXISTS "Admins can select all tickets" ON public.tickets;
CREATE POLICY "Admins can select all tickets" ON public.tickets FOR SELECT
  USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can insert all tickets" ON public.tickets;
CREATE POLICY "Admins can insert all tickets" ON public.tickets FOR INSERT
  WITH CHECK (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
