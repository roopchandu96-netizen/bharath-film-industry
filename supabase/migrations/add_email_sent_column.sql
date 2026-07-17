-- add_email_sent_column.sql
-- Adds the email_sent flag to tickets table
ALTER TABLE tickets
  ADD COLUMN email_sent boolean NOT NULL DEFAULT false;
