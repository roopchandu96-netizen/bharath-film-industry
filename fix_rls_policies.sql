-- SQL Execution to fix Supabase RLS policies

-- Allow ADMIN to update any project (for approvals)
CREATE POLICY "Admins can update any project" ON projects
FOR UPDATE USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'ADMIN'
  )
);

-- Allow ADMIN to view pending projects, etc. (Actually, public select is already true, but this might be useful)

-- Allow ADMIN to delete any project (optional, maybe for future use)
CREATE POLICY "Admins can delete any project" ON projects
FOR DELETE USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'ADMIN'
  )
);

-- Allow DIRECTORS to delete ONLY their own projects
CREATE POLICY "Directors can delete own projects" ON projects
FOR DELETE USING (auth.uid() = "directorId");
