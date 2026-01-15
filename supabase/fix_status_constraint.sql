-- FIX: Update employees status constraint to allow 'invited'
-- Run this in the Supabase SQL Editor

ALTER TABLE public.employees
DROP CONSTRAINT IF EXISTS employees_status_check;

ALTER TABLE public.employees
ADD CONSTRAINT employees_status_check 
CHECK (status IN ('active', 'inactive', 'terminated', 'invited'));

-- Verify the comment matches the new reality
COMMENT ON COLUMN employees.status IS 'Employee lifecycle status: invited, active, inactive, or terminated';
