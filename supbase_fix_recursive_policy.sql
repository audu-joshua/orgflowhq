-- FIX: Infinite Recursion in Timesheets Policy
-- Using 'SELECT ... FROM table' inside a policy for the same table causes infinite loops.
-- We must simplify the policy to rely on role checks only.

DROP POLICY IF EXISTS "Finance can approve/reject" ON public.timesheets;

CREATE POLICY "Finance can approve/reject" ON public.timesheets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users_organizations
      WHERE user_id = auth.uid()
      AND organization_id = public.timesheets.organization_id
      AND role = 'finance'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_organizations
      WHERE user_id = auth.uid()
      AND organization_id = public.timesheets.organization_id
      AND role = 'finance'
    )
  );

-- Also, let's make sure the Employee policy isn't causing issues either
DROP POLICY IF EXISTS "Employees can manage own timesheets" ON public.timesheets;

CREATE POLICY "Employees can manage own timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  )
  WITH CHECK (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  );
