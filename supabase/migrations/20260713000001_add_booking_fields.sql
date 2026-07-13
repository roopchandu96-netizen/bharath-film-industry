-- Migration: Add columns to movie_bookings table to support backend ticket and invoice generation
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.movie_bookings ADD COLUMN IF NOT EXISTS name TEXT;
