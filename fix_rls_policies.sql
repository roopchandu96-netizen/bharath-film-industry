-- BFI COMPLETE RLS SECURITY POLICIES RESET
-- Run this entire script in your Supabase SQL Editor to authorize Admin approvals/rejections, screenplays, bookings, and payments.

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
    OR (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
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
    OR (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Directors can delete own projects" ON public.projects;
CREATE POLICY "Directors can delete own projects" ON public.projects FOR DELETE
  USING (
    auth.uid() = "directorId" 
    OR (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

-- ==========================================
-- 3. MOVIE BOOKINGS TABLE POLICIES
-- ==========================================
ALTER TABLE public.movie_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own bookings" ON public.movie_bookings;
CREATE POLICY "Users can select own bookings" ON public.movie_bookings FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Users can insert own bookings" ON public.movie_bookings;
CREATE POLICY "Users can insert own bookings" ON public.movie_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admin can update bookings" ON public.movie_bookings;
CREATE POLICY "Only admin can update bookings" ON public.movie_bookings FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Only admin can delete bookings" ON public.movie_bookings;
CREATE POLICY "Only admin can delete bookings" ON public.movie_bookings FOR DELETE
  USING (
    (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
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
    OR (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admin can update payments" ON public.payments;
CREATE POLICY "Only admin can update payments" ON public.payments FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
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
    (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Only admin can update tickets" ON public.tickets;
CREATE POLICY "Only admin can update tickets" ON public.tickets FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

-- ==========================================
-- 6. INVESTMENTS TABLE POLICIES
-- ==========================================
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investments select policy" ON public.investments;
CREATE POLICY "Investments select policy" ON public.investments FOR SELECT
  USING (
    auth.uid() = "userId"
    OR (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

DROP POLICY IF EXISTS "Investors can create investments" ON public.investments;
CREATE POLICY "Investors can create investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Only admin can update investments" ON public.investments;
CREATE POLICY "Only admin can update investments" ON public.investments FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') IN (
      'bharathfilmindustry@gmail.com',
      'shubhamghodageri@gmail.com',
      'thechittoortimes@gmail.com',
      'chanduchowdary324@gmail.com',
      'prathapaneniroopchandu@gmail.com',
      'siriprathapaneni@gmail.com',
      'roopchandu96@gmail.com'
    )
  );

-- ==========================================
-- 7. NOTIFICATIONS TABLE POLICIES
-- ==========================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select notifications" ON public.notifications;
CREATE POLICY "Anyone can select notifications" ON public.notifications FOR SELECT USING (true);
