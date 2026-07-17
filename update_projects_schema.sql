-- BFI SCRIPT DOCUMENT SCHEMA UPDATE
-- Run this script in your Supabase SQL Editor to support script document uploads.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "scriptUrl" text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "scriptFileName" text;

-- Ensure the storage bucket exists for user_uploads if it doesn't already
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user_uploads', 'user_uploads', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies to allow authenticated users to upload and anyone to read
DROP POLICY IF EXISTS "Give users access to own folder 1qaz" ON storage.objects;
CREATE POLICY "Give users access to own folder 1qaz" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'user_uploads' AND auth.uid()::text = (storage.foldername(name))[1] );

DROP POLICY IF EXISTS "Give public access to all files" ON storage.objects;
CREATE POLICY "Give public access to all files" ON storage.objects FOR SELECT USING ( bucket_id = 'user_uploads' );
