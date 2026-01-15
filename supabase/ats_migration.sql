-- ATS Migration: Aligning with Mental Model
-- Run this in the Supabase SQL Editor

-- 1. Roles Table Updates
ALTER TABLE public.roles
ADD COLUMN IF NOT EXISTS stages JSONB NOT NULL DEFAULT '["New", "Shortlisted", "Interview Scheduled", "Interviewed", "Offer", "Hired", "Rejected"]'::jsonb,
ADD COLUMN IF NOT EXISTS hiring_manager UUID REFERENCES public.employees(id);

-- 2. Applications Table Updates
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS current_stage TEXT NOT NULL DEFAULT 'New',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Deprecate 'status' column in favor of 'current_stage'
-- We keep 'status' for now to avoid breaking existing queries immediately, 
-- but 'current_stage' is the single source of truth.
COMMENT ON COLUMN public.applications.status IS 'DEPRECATED: Use current_stage instead.';


-- 3. Interviews Table (New)
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('virtual', 'in_person')),
  status TEXT CHECK (status IN ('scheduled', 'completed', 'missed')) DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  meeting_link TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view interviews for their organization
CREATE POLICY "Users can view org interviews" ON public.interviews
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert/update interviews for their organization
CREATE POLICY "Users can manage org interviews" ON public.interviews
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.employees WHERE user_id = auth.uid()
    )
  );


-- 4. Activity Logs Table (New)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('application', 'interview', 'role')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES public.users(id), -- Nullable for system actions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view logs for their organization
CREATE POLICY "Users can view org activity logs" ON public.activity_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert logs (or system can)
CREATE POLICY "Users can insert org activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_org_id ON public.interviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_interviews_applicant_id ON public.interviews(applicant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON public.activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON public.activity_logs(entity_id);
