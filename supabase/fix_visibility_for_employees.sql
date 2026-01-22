-- COMPREHENSIVE FIX: Non-recursive Visibility and Creation
-- This script fixes "Infinite Recursion" and "Forbidden 403" errors.
-- We use auth.jwt() metadata for efficient, non-recursive org checks.

-- 1. Ensure users can see their own membership in users_organizations
ALTER TABLE public.users_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memberships" ON public.users_organizations;
CREATE POLICY "Users can view own memberships" ON public.users_organizations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. Update Departments RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- SELECT: Allow if user is in users_organizations OR has org_id in their JWT
DROP POLICY IF EXISTS "Users can view departments in their organization" ON public.departments;
CREATE POLICY "Users can view departments in their organization" ON public.departments
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid = organization_id
  );

-- INSERT/UPDATE/DELETE: Allow owners, admins, and HR
DROP POLICY IF EXISTS "Users can create departments in their organization" ON public.departments;
CREATE POLICY "Users can create departments in their organization" ON public.departments
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'hr')
    )
  );

DROP POLICY IF EXISTS "Users can update departments in their organization" ON public.departments;
CREATE POLICY "Users can update departments in their organization" ON public.departments
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'hr')
    )
  );

-- 3. Update Organizations RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own organizations" ON public.organizations;
CREATE POLICY "Users can view their own organizations" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid = id
  );

-- 4. Update Employees RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- SELECT: BREAK RECURSION. Do not query 'employees' table inside this policy.
DROP POLICY IF EXISTS "Users can view employees in their organization" ON public.employees;
DROP POLICY IF EXISTS "Users can view own employee profile" ON public.employees;

CREATE POLICY "Users can view employees in their organization" ON public.employees
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'hr', 'finance')
    )
    OR
    -- Check JWT for org membership if not in users_organizations
    (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid = organization_id
  );

-- INSERT: Allow admins/owners/HR
DROP POLICY IF EXISTS "Users can create employees in their organization" ON public.employees;
CREATE POLICY "Users can create employees in their organization" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'hr')
    )
  );

-- UPDATE: Allow admins/owners/HR or self
DROP POLICY IF EXISTS "Users can update employees in their organization" ON public.employees;
CREATE POLICY "Users can update employees in their organization" ON public.employees
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'hr')
    )
  );



