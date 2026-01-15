-- LAYER 11: Admin Timesheet Management
-- Purpose: Enable Admins/Finance to create and update timesheets for ANY employee.
-- Critical for: Manual timesheet creation and "Force Clock Out" features.

-- 1. Drop potentially conflicting legacy policies to ensure a clean slate
DROP POLICY IF EXISTS "Finance can approve/reject" ON public.timesheets;
DROP POLICY IF EXISTS "Admins can manage all timesheets" ON public.timesheets;

-- 2. Create a comprehensive Admin/Owner/Finance Policy
-- This allows SELECT, INSERT, UPDATE, DELETE for these high-level roles on ALL timesheets in their org.
CREATE POLICY "Admins can manage all timesheets" ON public.timesheets
  FOR ALL TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.users_organizations uo
        WHERE uo.user_id = auth.uid()
        AND uo.organization_id = public.timesheets.organization_id
        AND uo.role IN ('owner', 'admin', 'finance')
    )
  )
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users_organizations uo
        WHERE uo.user_id = auth.uid()
        AND uo.organization_id = public.timesheets.organization_id
        AND uo.role IN ('owner', 'admin', 'finance')
    )
  );

-- 3. Ensure "Managers" can at least VIEW all timesheets (for oversight)
-- Note: Mangers usually can't edit payroll data, but they need to see it.
DROP POLICY IF EXISTS "Managers can view all timesheets" ON public.timesheets;
CREATE POLICY "Managers can view all timesheets" ON public.timesheets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
        SELECT 1 FROM public.users_organizations uo
        WHERE uo.user_id = auth.uid()
        AND uo.organization_id = public.timesheets.organization_id
        AND uo.role = 'manager'
    )
  );
