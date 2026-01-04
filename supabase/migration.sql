-- Migration: Update employees table for advanced auth flow
-- Run this in the Supabase SQL Editor

-- 1. Add activated_at column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Update status column to accept 'invited'
-- (Assuming status is a text column)
COMMENT ON COLUMN employees.status IS 'Status can be active, inactive, terminated, or invited';
COMMENT ON COLUMN employees.activated_at IS 'Timestamp of when the employee first logged in and activated their account';
