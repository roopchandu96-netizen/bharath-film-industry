
-- Update a specific user to be an ADMIN
-- Run this in your Supabase SQL Editor
UPDATE profiles
SET role = 'ADMIN'
WHERE id = '88b6f47c-abbf-41f4-a633-1f933245314f' OR email = 'bharathfilmindustry@gmail.com';
