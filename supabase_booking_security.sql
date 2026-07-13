-- Secure Payment Verification & Ticket Generation Schema

-- 1. Create Movie Bookings Table
create table movie_bookings (
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

-- 2. Create Payments Table
create table payments (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references movie_bookings(id) on delete cascade not null,
  gateway_order_id text not null,
  gateway_payment_id text,
  gateway_signature text,
  amount numeric not null check (amount >= 0),
  payment_status text not null check (payment_status in ('pending', 'verified', 'failed')) default 'pending',
  verified_at timestamptz
);

-- 3. Create Tickets Table
create table tickets (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references movie_bookings(id) on delete cascade not null unique,
  ticket_number text not null unique,
  invoice_number text not null unique,
  pdf_url text,
  email_sent boolean default false not null
);

-- 4. Enable Row Level Security (RLS) on all tables
alter table movie_bookings enable row level security;
alter table payments enable row level security;
alter table tickets enable row level security;

-- 5. Row Level Security Policies for movie_bookings
-- Authenticated users can read their own bookings
create policy "Users can view their own bookings" 
  on movie_bookings for select 
  using (auth.uid() = user_id);

-- Authenticated users can insert their own bookings in 'pending' status
create policy "Users can create their own pending bookings" 
  on movie_bookings for insert 
  with check (
    auth.uid() = user_id 
    and status = 'pending' 
    and payment_status = 'pending'
  );

-- STRICTLY BLOCK ALL UPDATES AND DELETIONS BY REGULAR USERS
-- (No UPDATE policy is declared for users. Only service_role can update).

-- 6. Row Level Security Policies for payments
-- Users can view payments associated with their bookings
create policy "Users can view payments for their own bookings" 
  on payments for select 
  using (
    exists (
      select 1 from movie_bookings 
      where movie_bookings.id = payments.booking_id 
      and movie_bookings.user_id = auth.uid()
    )
  );

-- STRICTLY BLOCK INSERT/UPDATE/DELETE ON PAYMENTS BY REGULAR USERS
-- (No write policies are declared. Only service_role can write to payments).

-- 7. Row Level Security Policies for tickets
-- Users can view tickets associated with their bookings
create policy "Users can view tickets for their own bookings" 
  on tickets for select 
  using (
    exists (
      select 1 from movie_bookings 
      where movie_bookings.id = tickets.booking_id 
      and movie_bookings.user_id = auth.uid()
    )
  );

-- STRICTLY BLOCK INSERT/UPDATE/DELETE ON TICKETS BY REGULAR USERS
-- (No write policies are declared. Only service_role can write/issue tickets).


-- 8. Admin Write and Read Policies for Booking Flow Management
create policy "Admins can select all bookings" on public.movie_bookings for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admins can update all bookings" on public.movie_bookings for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admins can select all payments" on public.payments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admins can insert all payments" on public.payments for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admins can update all payments" on public.payments for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admins can select all tickets" on public.tickets for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));

create policy "Admins can insert all tickets" on public.tickets for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'));
