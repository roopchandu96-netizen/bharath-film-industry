-- Migration: fix_payment_sync.sql
-- Goal: Normalize all status fields to uppercase for reliable matching

-- 1. Normalize 'projects' table
UPDATE projects SET status = UPPER(status) WHERE status IS NOT NULL;

-- 2. Normalize 'movie_bookings' table
UPDATE movie_bookings SET status = UPPER(status) WHERE status IS NOT NULL;
UPDATE movie_bookings SET payment_status = UPPER(payment_status) WHERE payment_status IS NOT NULL;

-- 3. Normalize 'payments' table
UPDATE payments SET payment_status = UPPER(payment_status) WHERE payment_status IS NOT NULL;

-- 4. Normalize 'profiles' table
UPDATE profiles SET "kycStatus" = UPPER("kycStatus") WHERE "kycStatus" IS NOT NULL;

-- 5. Normalize 'investments' table
UPDATE investments SET status = UPPER(status) WHERE status IS NOT NULL;

-- 6. Clean up any existing 'verified' vs 'CONFIRMED' issues where tickets/invoices are missing
-- (A true sync script would need to loop and re-trigger edge functions, but we just want to ensure DB matches)
UPDATE payments SET payment_status = 'VERIFIED' WHERE payment_status = 'SUCCESSFUL';
