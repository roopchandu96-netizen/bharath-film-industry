-- Migration: Secure Row Level Security (RLS) Policies based on Active Role
-- Apply this file to your Supabase project (either via CLI or SQL Editor)

-- 1. Helper function to fetch the current active role from the profiles table.
-- Using security definer to run with database privileges during query.
create or replace function public.get_active_role()
returns text as $$
  select coalesce(
    (select active_role from public.profiles where id = auth.uid()),
    'MOVIE_LOVER'
  );
$$ language sql security definer;

-- ==========================================
-- PROFILES TABLE SECURITY
-- ==========================================
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles select policy" on public.profiles;
drop policy if exists "Profiles insert policy" on public.profiles;
drop policy if exists "Profiles update policy" on public.profiles;

create policy "Profiles select policy" on public.profiles for select using (true);
create policy "Profiles insert policy" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles update policy" on public.profiles for update using (auth.uid() = id);


-- ==========================================
-- PROJECTS (SCRIPTS) TABLE SECURITY
-- ==========================================
alter table public.projects enable row level security;

drop policy if exists "Active projects are viewable by everyone" on public.projects;
drop policy if exists "Directors can create projects" on public.projects;
drop policy if exists "Directors can update own projects" on public.projects;
drop policy if exists "Directors can delete own projects" on public.projects;
drop policy if exists "Admins can update any project" on public.projects;
drop policy if exists "Admins can delete any project" on public.projects;
drop policy if exists "Access projects based on active role" on public.projects;
drop policy if exists "Directors can insert projects" on public.projects;

create policy "Access projects based on active role" on public.projects for select
using (
  (public.get_active_role() = 'INVESTOR' and status = 'ACTIVE')
  or
  ((public.get_active_role() = 'DIRECTOR' or public.get_active_role() = 'WRITER') and auth.uid() = "directorId")
  or
  (public.get_active_role() = 'ADMIN')
);

create policy "Directors can insert projects" on public.projects for insert
with check (
  (public.get_active_role() = 'DIRECTOR' and auth.uid() = "directorId")
  or
  (public.get_active_role() = 'ADMIN')
);

create policy "Directors can update own projects" on public.projects for update
using (
  (public.get_active_role() = 'DIRECTOR' and auth.uid() = "directorId")
  or
  (public.get_active_role() = 'ADMIN')
);

create policy "Directors can delete own projects" on public.projects for delete
using (
  (public.get_active_role() = 'DIRECTOR' and auth.uid() = "directorId")
  or
  (public.get_active_role() = 'ADMIN')
);


-- ==========================================
-- INVESTMENTS TABLE SECURITY
-- ==========================================
alter table public.investments enable row level security;

drop policy if exists "Investments viewable by owner" on public.investments;
drop policy if exists "Investors can create investments" on public.investments;
drop policy if exists "Investments select policy" on public.investments;

create policy "Investments select policy" on public.investments for select
using (auth.uid() = "userId");

create policy "Investors can insert investments" on public.investments for insert
with check (
  ((public.get_active_role() = 'INVESTOR' or public.get_active_role() = 'ADMIN') and auth.uid() = "userId")
);


-- ==========================================
-- AI HISTORY TABLE SECURITY
-- ==========================================
alter table public.ai_history enable row level security;

drop policy if exists "AI History viewable by owner" on public.ai_history;
drop policy if exists "AI History insertable by owner" on public.ai_history;
drop policy if exists "AI History deletable by owner" on public.ai_history;
drop policy if exists "AI History select policy" on public.ai_history;
drop policy if exists "AI History insert policy" on public.ai_history;
drop policy if exists "AI History delete policy" on public.ai_history;

create policy "AI History select policy" on public.ai_history for select using (auth.uid() = user_id);
create policy "AI History insert policy" on public.ai_history for insert with check (auth.uid() = user_id);
create policy "AI History delete policy" on public.ai_history for delete using (auth.uid() = user_id);


-- ==========================================
-- MOVIE BOOKINGS TABLE SECURITY
-- ==========================================
alter table public.movie_bookings enable row level security;

drop policy if exists "Users can view their own bookings" on public.movie_bookings;
drop policy if exists "Users can create their own pending bookings" on public.movie_bookings;
drop policy if exists "Users can insert own bookings when Movie Lover" on public.movie_bookings;
drop policy if exists "Only admin can update bookings" on public.movie_bookings;
drop policy if exists "Only admin can delete bookings" on public.movie_bookings;

create policy "Users can select own bookings" on public.movie_bookings for select
using (auth.uid() = user_id);

create policy "Users can insert own bookings when Movie Lover" on public.movie_bookings for insert
with check (
  ((public.get_active_role() = 'MOVIE_LOVER' or public.get_active_role() = 'ADMIN') and auth.uid() = user_id)
);

create policy "Only admin can update bookings" on public.movie_bookings for update
using (public.get_active_role() = 'ADMIN');

create policy "Only admin can delete bookings" on public.movie_bookings for delete
using (public.get_active_role() = 'ADMIN');


-- ==========================================
-- PAYMENTS TABLE SECURITY
-- ==========================================
alter table public.payments enable row level security;

drop policy if exists "Users can view payments for their own bookings" on public.payments;
drop policy if exists "Users can select own payments" on public.payments;
drop policy if exists "Only admin can insert payments" on public.payments;
drop policy if exists "Only admin can update payments" on public.payments;
drop policy if exists "Only admin can delete payments" on public.payments;

create policy "Users can select own payments" on public.payments for select
using (
  exists (
    select 1 from public.movie_bookings
    where public.movie_bookings.id = payments.booking_id
    and public.movie_bookings.user_id = auth.uid()
  )
);

create policy "Only admin can insert payments" on public.payments for insert
with check (public.get_active_role() = 'ADMIN');

create policy "Only admin can update payments" on public.payments for update
using (public.get_active_role() = 'ADMIN');

create policy "Only admin can delete payments" on public.payments for delete
using (public.get_active_role() = 'ADMIN');


-- ==========================================
-- TICKETS TABLE SECURITY
-- ==========================================
alter table public.tickets enable row level security;

drop policy if exists "Users can view tickets for their own bookings" on public.tickets;
drop policy if exists "Users can select own tickets" on public.tickets;
drop policy if exists "Only admin can write tickets" on public.tickets;
drop policy if exists "Only admin can update tickets" on public.tickets;
drop policy if exists "Only admin can delete tickets" on public.tickets;

create policy "Users can select own tickets" on public.tickets for select
using (
  exists (
    select 1 from public.movie_bookings
    where public.movie_bookings.id = tickets.booking_id
    and public.movie_bookings.user_id = auth.uid()
  )
);

create policy "Only admin can write tickets" on public.tickets for insert
with check (public.get_active_role() = 'ADMIN');

create policy "Only admin can update tickets" on public.tickets for update
using (public.get_active_role() = 'ADMIN');

create policy "Only admin can delete tickets" on public.tickets for delete
using (public.get_active_role() = 'ADMIN');
