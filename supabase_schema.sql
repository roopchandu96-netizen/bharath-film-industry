
-- Profile Table (Extends Auth)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  role text check (role in ('INVESTOR', 'DIRECTOR', 'ADMIN')),
  "kycStatus" text default 'NOT_STARTED',
  "totalInvested" bigint default 0,
  created_at timestamptz default now()
);

-- Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  tagline text,
  genre text,
  "posterUrl" text,
  "teaserUrl" text,
  description text,
  budget bigint,
  "fundingGoal" bigint,
  "currentFunding" bigint default 0,
  "investorCount" int default 0,
  director text,
  "directorId" uuid references auth.users(id),
  status text default 'PENDING',
  created_at timestamptz default now()
);

-- Investments Table
create table investments (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid references profiles(id),
  "projectId" uuid references projects(id),
  amount bigint not null,
  date timestamptz default now(),
  tier text
);

-- AI History Table
create table ai_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  role text,
  content text,
  "createTime" timestamptz default now()
);

-- Security Policies (RLS)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table investments enable row level security;
alter table ai_history enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Active projects are viewable by everyone" on projects for select using (true);
create policy "Directors can create projects" on projects for insert with check (auth.uid() = "directorId");
create policy "Directors can update own projects" on projects for update using (auth.uid() = "directorId");

create policy "Investments viewable by owner" on investments for select using (auth.uid() = "userId");
create policy "Investors can create investments" on investments for insert with check (auth.uid() = "userId");

create policy "AI History viewable by owner" on ai_history for select using (auth.uid() = user_id);
create policy "AI History insertable by owner" on ai_history for insert with check (auth.uid() = user_id);
create policy "AI History deletable by owner" on ai_history for delete using (auth.uid() = user_id);
