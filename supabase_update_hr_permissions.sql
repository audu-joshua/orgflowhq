-- FIX: Allow all privileged roles to view roles within their organization
-- Resolves "infinite recursion detected" by using a SECURITY DEFINER function.

-- 1. Ensure the helper function exists (Bypasses RLS for the check)
CREATE OR REPLACE FUNCTION public.get_org_role(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
DROP POLICY IF EXISTS "Privileged users view org roles" ON public.users_organizations;
DROP POLICY IF EXISTS "Admins/HR manage org roles" ON public.users_organizations;
DROP POLICY IF EXISTS "Admins view org roles" ON public.users_organizations;
DROP POLICY IF EXISTS "Admins manage org roles" ON public.users_organizations;

-- 3. Create non-recursive policies using the helper
-- Allows privileged users (Owner, Admin, HR, Manager, Finance) to see other roles in the same organization
CREATE POLICY "Privileged users view org roles" ON public.users_organizations
FOR SELECT USING (
    get_org_role(organization_id) IN ('owner', 'admin', 'hr', 'manager', 'finance')
);

-- Allows Admins/HR/Owner to manage system roles (Insert/Update/Delete)
CREATE POLICY "Admins/HR manage org roles" ON public.users_organizations
FOR ALL USING (
    get_org_role(organization_id) IN ('owner', 'admin', 'hr')
)
WITH CHECK (
    get_org_role(organization_id) IN ('owner', 'admin', 'hr')
);

-- 4. LAYER 13: Protection for the Owner Record
-- Purpose: Ensures the Owner record can NEVER be deleted, providing a last line of defense in the database.

-- Trigger Function to prevent Owner Deletion
CREATE OR REPLACE FUNCTION public.prevent_owner_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the employee being deleted is an owner via the users_organizations table
    IF EXISTS (
        SELECT 1 FROM public.users_organizations uo
        WHERE uo.user_id = OLD.user_id
        AND uo.organization_id = OLD.organization_id
        AND uo.role = 'owner'
    ) THEN
        RAISE EXCEPTION 'CRITICAL: The Owner account cannot be deleted from the system.';
    END IF;
    
    -- Fallback: Also check by position (Case-insensitive)
    IF LOWER(OLD.position) = 'owner' THEN
        RAISE EXCEPTION 'CRITICAL: The record marked as Owner cannot be deleted.';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the Trigger
DROP TRIGGER IF EXISTS trigger_prevent_owner_deletion ON public.employees;
CREATE TRIGGER trigger_prevent_owner_deletion
BEFORE DELETE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_deletion();
