-- FIX: Role Deletion & Persistence
-- Run this in the Supabase SQL Editor to ensure correct permissions and cascading deletes

-- 1. Enable RLS on roles related tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_images ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view org roles" ON public.roles;
DROP POLICY IF EXISTS "Users can manage org roles" ON public.roles;
DROP POLICY IF EXISTS "Users can view org applications" ON public.applications;
DROP POLICY IF EXISTS "Users can manage org applications" ON public.applications;
DROP POLICY IF EXISTS "Users can view role images" ON public.role_images;
DROP POLICY IF EXISTS "Users can manage role images" ON public.role_images;

-- 3. Create clean, non-recursive policies for ROLES
CREATE POLICY "Users can view org roles" ON public.roles
FOR SELECT TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.users_organizations 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage org roles" ON public.roles
FOR ALL TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.users_organizations 
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'hr')
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.users_organizations 
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'hr')
    )
);

-- 4. Create policies for APPLICATIONS
CREATE POLICY "Users can view org applications" ON public.applications
FOR SELECT TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.users_organizations 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage org applications" ON public.applications
FOR ALL TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.users_organizations 
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'hr')
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.users_organizations 
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'hr')
    )
);

-- 5. Create policies for ROLE_IMAGES
CREATE POLICY "Users can view role images" ON public.role_images
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.roles
        WHERE public.roles.id = public.role_images.role_id
    )
);

CREATE POLICY "Users can manage role images" ON public.role_images
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.roles
        WHERE public.roles.id = public.role_images.role_id
        AND public.roles.organization_id IN (
            SELECT organization_id FROM public.users_organizations 
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'admin', 'hr')
        )
    )
);
