-- Migration: Add multi-role columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS movie_lover_activated BOOLEAN DEFAULT FALSE;

-- Initialize existing accounts with their current role
UPDATE public.profiles SET primary_role = role WHERE primary_role IS NULL;
UPDATE public.profiles SET active_role = role WHERE active_role IS NULL;
UPDATE public.profiles SET movie_lover_activated = TRUE WHERE role = 'MOVIE_LOVER' AND movie_lover_activated IS NULL;
UPDATE public.profiles SET movie_lover_activated = FALSE WHERE movie_lover_activated IS NULL;
