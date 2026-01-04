-- FINAL MIGRATION: Auth & Employee Lifecycle
-- Run in Supabase SQL Editor

-- 1. Track first successful login (activation)
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- 2. Update status constraint and document canonical lifecycle states
ALTER TABLE public.employees
DROP CONSTRAINT IF EXISTS employees_status_check;

ALTER TABLE public.employees
ADD CONSTRAINT employees_status_check 
CHECK (status IN ('active', 'inactive', 'terminated', 'invited'));

COMMENT ON COLUMN employees.status IS
'Employee lifecycle status: invited (created, not logged in), active (first login completed), terminated (access revoked, historical record retained)';

-- 3. Optional but STRONGLY recommended RLS hard-stop
-- Prevent invited or terminated users from accessing employee-scoped data
-- This ensures business rules are enforced at the database level.

-- NOTE: Replace "Employees can view own data" with your actual policy name if different
-- To see existing policies: SELECT * FROM pg_policies WHERE tablename = 'employees';

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'employees' AND policyname = 'Employees can view own data'
    ) THEN
        ALTER POLICY "Employees can view own data"
        ON employees
        USING (
          auth.uid() = user_id
          AND status = 'active'
        );
    END IF;
END $$;
-- 4. Enable RLS and add policy for Organizations
-- This ensures that getUserProfile can fetch organization details (like slug)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own organizations" ON public.organizations;
CREATE POLICY "Users can view their own organizations" ON public.organizations
FOR SELECT USING (
    id IN (
        SELECT organization_id FROM public.users_organizations 
        WHERE user_id = auth.uid()
    )
);
