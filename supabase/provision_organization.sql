-- Atomic Organization Provisioning Function
-- This function handles the entire setup of a new organization in a single transaction.

CREATE OR REPLACE FUNCTION public.provision_organization(
    p_user_id UUID,
    p_user_email TEXT,
    p_org_name TEXT,
    p_org_slug TEXT,
    p_full_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_org_id UUID;
    v_dept_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Check if user already has an organization primary link
    -- This handles idempotency for partially failed flows
    SELECT organization_id INTO v_org_id
    FROM public.users_organizations
    WHERE user_id = p_user_id AND role = 'owner'
    LIMIT 1;

    IF v_org_id IS NOT NULL THEN
        -- User already owns an organization, just return existing details
        SELECT jsonb_build_object(
            'success', true,
            'organization_id', id,
            'slug', slug,
            'already_exists', true
        ) INTO v_result
        FROM public.organizations
        WHERE id = v_org_id;
        
        RETURN v_result;
    END IF;

    -- 2. Create Organization
    INSERT INTO public.organizations (name, slug)
    VALUES (p_org_name, p_org_slug)
    RETURNING id INTO v_org_id;

    -- 3. Create "Management" Department
    INSERT INTO public.departments (organization_id, name, description)
    VALUES (v_org_id, 'Management', 'Executive and Administrative management team')
    RETURNING id INTO v_dept_id;

    -- 4. Upsert User Profile
    INSERT INTO public.users (id, email, organization_id, full_name, role)
    VALUES (p_user_id, p_user_email, v_org_id, p_full_name, 'user')
    ON CONFLICT (id) DO UPDATE 
    SET organization_id = EXCLUDED.organization_id,
        full_name = COALESCE(public.users.full_name, EXCLUDED.full_name);

    -- 5. Link User as Owner
    INSERT INTO public.users_organizations (user_id, organization_id, role)
    VALUES (p_user_id, v_org_id, 'owner')
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    -- 6. Create Employee Record for Owner
    INSERT INTO public.employees (
        organization_id, 
        user_id, 
        department_id, 
        full_name, 
        email, 
        employee_id, 
        position, 
        status, 
        hire_date
    )
    VALUES (
        v_org_id, 
        p_user_id, 
        v_dept_id, 
        p_full_name, 
        p_user_email, 
        'OWN-001', 
        'Owner', 
        'active', 
        CURRENT_DATE
    )
    ON CONFLICT (organization_id, employee_id) DO NOTHING;

    -- Return Success
    RETURN jsonb_build_object(
        'success', true,
        'organization_id', v_org_id,
        'slug', p_org_slug,
        'already_exists', false
    );

EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic in PL/pgSQL
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;
