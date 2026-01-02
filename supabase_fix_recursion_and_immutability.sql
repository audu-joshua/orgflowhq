-- FIX: Infinite Recursion and Enforce Immutability
-- Problem: The previous RLS policy queried 'public.timesheets' inside itself, causing Error 42P17.
-- Solution: Use a BEFORE UPDATE Trigger to enforce column immutability. This is the standard PostgreSQL pattern for "Read-Only After Create" fields.

-- 1. Create the Function to Check Immutability
CREATE OR REPLACE FUNCTION public.check_timesheet_immutability()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if Identity fields are being changed
    IF NEW.employee_id IS DISTINCT FROM OLD.employee_id THEN
        RAISE EXCEPTION 'Security Violation: Cannot change employee_id on an existing timesheet.';
    END IF;

    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
        RAISE EXCEPTION 'Security Violation: Cannot change organization_id on an existing timesheet.';
    END IF;

    IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
        RAISE EXCEPTION 'Security Violation: Cannot change created_by audit trail.';
    END IF;

    IF NEW.created_via IS DISTINCT FROM OLD.created_via THEN
        RAISE EXCEPTION 'Security Violation: Cannot change created_via audit trail.';
    END IF;

    -- If all checks pass, return the new row to proceed with user update
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind the Trigger to the Table
DROP TRIGGER IF EXISTS ensure_timesheet_immutability ON public.timesheets;

CREATE TRIGGER ensure_timesheet_immutability
BEFORE UPDATE ON public.timesheets
FOR EACH ROW
EXECUTE FUNCTION public.check_timesheet_immutability();


-- 3. Fix the RLS Policy (Remove the Recursive Checks)
-- The Trigger now handles the "Identity Tampering" protection.
-- The RLS just needs to verify "Who is allowed to update at all".

DROP POLICY IF EXISTS "Admins update timesheets" ON public.timesheets;

CREATE POLICY "Admins update timesheets" ON public.timesheets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = public.timesheets.organization_id
      AND uo.role IN ('owner', 'admin', 'finance')
    )
  );
