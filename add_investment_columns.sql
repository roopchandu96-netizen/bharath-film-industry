-- Run this SQL in your Supabase SQL Editor to update your existing database schema.
-- This adds the necessary columns to the investments table for tracking and verifying payments.

ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING';

ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS "txnId" text;

ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS investor text;

ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS project text;
