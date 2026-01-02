-- LAYER 11: Enterprise-Grade Admin Timesheets
-- Purpose: Enable auditable Admin override for timesheets.
-- Adds columns to track WHO created the record and WHY.

-- 1. Schema Updates (Audit Columns)
ALTER TABLE public.timesheets 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'employee' CHECK (created_via IN ('employee', 'admin_override')),
ADD COLUMN IF NOT EXISTS override_reason TEXT;

-- 2. Drop legacy/conflicting policies
DROP POLICY IF EXISTS "Finance can approve/reject" ON public.timesheets;
DROP POLICY IF EXISTS "Admins can manage all timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Employees can manage own timesheets" ON public.timesheets;

-- 3. RLS: Strict Employee Insert
-- Employees can ONLY insert if they mark it as 'employee' created (default)
CREATE POLICY "Employees insert own timesheets" ON public.timesheets
  FOR INSERT TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
    AND created_via = 'employee'
    AND created_by = auth.uid()
     -- Ensure employees start with 'pending' status
    AND status = 'pending'
  );

-- 4. RLS: Admin Override Insert
-- Admins can insert ONLY if they provide a reason and mark it as 'admin_override'
CREATE POLICY "Admins create override timesheets" ON public.timesheets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = public.timesheets.organization_id
      AND uo.role IN ('owner', 'admin', 'finance')
    )
    AND created_via = 'admin_override'
    AND created_by = auth.uid()
    AND override_reason IS NOT NULL
  );

-- 5. RLS: General Update (Admin-Only for Status/Clock-Out)
-- Retain ability for Admins to update status or clock-out (for existing records)
-- BUT prevent tampering with Identity fields (employee_id, etc.)
CREATE POLICY "Admins update timesheets" ON public.timesheets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = public.timesheets.organization_id
      AND uo.role IN ('owner', 'admin', 'finance')
    )
  )
  WITH CHECK (
    -- Prevent identity tampering: Ensure these fields are NOT changing
    employee_id = (SELECT t.employee_id FROM public.timesheets t WHERE t.id = public.timesheets.id)
    AND organization_id = (SELECT t.organization_id FROM public.timesheets t WHERE t.id = public.timesheets.id)
    AND created_by = (SELECT t.created_by FROM public.timesheets t WHERE t.id = public.timesheets.id)
    AND created_via = (SELECT t.created_via FROM public.timesheets t WHERE t.id = public.timesheets.id)
  );

-- 6. RLS: Visibility (Select)
-- Employees see their own; Admins/Managers see all in Org
CREATE POLICY "View Timesheets" ON public.timesheets
  FOR SELECT TO authenticated
  USING (
    -- User is the employee
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    OR
    -- User is Admin/Manager/Finance in the Org
    EXISTS (
        SELECT 1 FROM public.users_organizations uo
        WHERE uo.user_id = auth.uid()
        AND uo.organization_id = public.timesheets.organization_id
        AND uo.role IN ('owner', 'admin', 'finance', 'manager')
    )
  );

-- 7. RLS: Employee Clock Out (Update Own)
-- Employees need to be able to clock out (Update their own record)
CREATE POLICY "Employees clock out" ON public.timesheets
  FOR UPDATE TO authenticated
  USING (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    AND status = 'pending' -- Can only update if pending
  )
  WITH CHECK (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
    -- Prevent employees from approving their own timesheets
    AND status = 'pending' 
  );
