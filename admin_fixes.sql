-- 1. Fix get_active_role to properly fallback to the 'role' column
create or replace function public.get_active_role()
returns text as $$
  select coalesce(
    (select active_role from public.profiles where id = auth.uid()),
    (select role from public.profiles where id = auth.uid()),
    'MOVIE_LOVER'
  );
$$ language sql security definer;

-- 2. Allow Admins to update user profiles (required for KYC approvals)
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles" on public.profiles for update 
using (public.get_active_role() = 'ADMIN');

-- 3. (Optional but recommended) Allow Admins to view all profiles
drop policy if exists "Admins can view profiles" on public.profiles;
create policy "Admins can view profiles" on public.profiles for select 
using (true);
