-- FIX: Ensure Employees can be seen by their owners
-- This is critical for the "Timesheets" policy to work, as it checks 'public.employees'

-- 1. Ensure RLS is ON for employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to SEE their own employee record
DROP POLICY IF EXISTS "Users can view own employee profile" ON public.employees;
CREATE POLICY "Users can view own employee profile" ON public.employees
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    -- Also allow Admins/Finance/HR to view all (optional but good for safety)
    EXISTS (
        SELECT 1 FROM public.users_organizations uo
        WHERE uo.user_id = auth.uid()
        AND uo.organization_id = public.employees.organization_id
        AND uo.role IN ('owner', 'admin', 'hr', 'finance')
    )
  );

-- 3. Re-apply the Timesheets Policy (Safe Version)
DROP POLICY IF EXISTS "Employees can manage own timesheets" ON public.timesheets;

CREATE POLICY "Employees can manage own timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- 4. Allow Finance to approve/reject (Safe non-recursive)
DROP POLICY IF EXISTS "Finance can approve/reject" ON public.timesheets;

CREATE POLICY "Finance can approve/reject" ON public.timesheets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = public.timesheets.organization_id
      AND uo.role IN ('owner', 'admin', 'finance')
    )
  );
