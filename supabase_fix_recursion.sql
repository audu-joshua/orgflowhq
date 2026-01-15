-- FIX: Infinite Recursion in RLS Policies
-- Problem: The 'users_organizations' policy queries itself to check if a user is an admin.
-- This creates an infinite loop (Policy -> Select -> Policy -> Select...).
-- Solution: Use a "SECURITY DEFINER" function to check the role. This bypasses RLS for the check itself.

-- 1. Create a secure helper function (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_org_role(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Runs with privileges of the creator (postgres), bypassing RLS
SET search_path = public -- Secure search path
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.users_organizations
    WHERE organization_id = org_id
    AND user_id = auth.uid();
    
    RETURN user_role;
END;
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins view org roles" ON public.users_organizations;
DROP POLICY IF EXISTS "Admins manage org roles" ON public.users_organizations;

-- 3. Re-create policies using the helper function (No Recursion)

-- A. "Admins/Owners view ALL roles in their organization"
CREATE POLICY "Admins view org roles" ON public.users_organizations
FOR SELECT USING (
    get_org_role(organization_id) IN ('owner', 'admin')
);

-- B. "Admins/Owners MANAGE roles in their organization"
CREATE POLICY "Admins manage org roles" ON public.users_organizations
FOR ALL USING (
    get_org_role(organization_id) IN ('owner', 'admin')
)
WITH CHECK (
    get_org_role(organization_id) IN ('owner', 'admin')
);

-- Note: "View own roles" policy created previously is fine as it doesn't query other rows.
-- CREATE POLICY "View own roles" ... (user_id = auth.uid()) - This is safe.
