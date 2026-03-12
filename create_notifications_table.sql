create table notifications (
  id uuid default gen_random_uuid() primary key,
  type text,
  recipient text,
  subject text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Notifications viewable in public" on notifications for select using (true);
create policy "Notifications insertable by all" on notifications for insert with check (true);
create policy "Notifications updatable by all" on notifications for update using (true);
