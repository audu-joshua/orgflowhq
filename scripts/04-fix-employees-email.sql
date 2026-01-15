-- Fix missing columns in employees table
-- Run this if you get column errors

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Update unique constraint to allow NULL employee_id
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_employee_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS employees_employee_id_key 
ON public.employees (employee_id) WHERE employee_id IS NOT NULL;

