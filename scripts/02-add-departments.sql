-- Add departments and employees tables
-- Run this after 01-init-schema.sql

-- Create departments table first
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table (which references departments)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  employee_id TEXT UNIQUE,
  position TEXT,
  phone TEXT,
  hire_date DATE,
  profile_image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments
CREATE POLICY "Users can view departments in their organization" ON public.departments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create departments in their organization" ON public.departments
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update departments in their organization" ON public.departments
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete departments in their organization" ON public.departments
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for employees
CREATE POLICY "Users can view employees in their organization" ON public.employees
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create employees in their organization" ON public.employees
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update employees in their organization" ON public.employees
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete employees in their organization" ON public.employees
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.users_organizations 
      WHERE user_id = auth.uid()
    )
  );

