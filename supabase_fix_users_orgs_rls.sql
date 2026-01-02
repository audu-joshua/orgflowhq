-- FIX: Allow Owners/Admins to manage system roles (users_organizations)
-- This resolves the 403 Forbidden error when promoting employees.

-- 1. Enable RLS (just in case)
ALTER TABLE public.users_organizations ENABLE ROW LEVEL SECURITY;

-- 2. Drop restrictive policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.users_organizations;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.users_organizations;
DROP POLICY IF EXISTS "View own roles" ON public.users_organizations;
DROP POLICY IF EXISTS "Admins view org roles" ON public.users_organizations;
DROP POLICY IF EXISTS "Admins manage org roles" ON public.users_organizations;

-- 3. Policy: View own roles (Essential for login/authService)
CREATE POLICY "View own roles" ON public.users_organizations
FOR SELECT USING (
    user_id = auth.uid()
);

-- 4. Policy: Admins/Owners view ALL roles in their organization
CREATE POLICY "Admins view org roles" ON public.users_organizations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users_organizations admin_link
        WHERE admin_link.user_id = auth.uid()
        AND admin_link.organization_id = public.users_organizations.organization_id
        AND admin_link.role IN ('owner', 'admin')
    )
);

-- 5. Policy: Admins/Owners MANAGE roles (Insert/Update/Delete) in their organization
-- The WITH CHECK clause ensures the acting user has permission to perform the action
CREATE POLICY "Admins manage org roles" ON public.users_organizations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users_organizations admin_link
        WHERE admin_link.user_id = auth.uid()
        AND admin_link.organization_id = public.users_organizations.organization_id
        AND admin_link.role IN ('owner', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users_organizations admin_link
        WHERE admin_link.user_id = auth.uid()
        AND admin_link.organization_id = public.users_organizations.organization_id
        AND admin_link.role IN ('owner', 'admin')
    )
);
