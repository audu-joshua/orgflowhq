-- SECURITY HARDENING: Explicit Search Path & Performance Optimization
-- Purpose: Lock the search_path to prevent hijacking and optimize helper performance.
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- 1. Utility / Trigger Functions
ALTER FUNCTION public.update_updated_at_column() 
  SET search_path = public, extensions;

ALTER FUNCTION public.handle_new_user() 
  SET search_path = public, extensions;

ALTER FUNCTION public.prevent_owner_deletion() 
  SET search_path = public, extensions;

-- 2. RLS & Permission Helpers (Hardened and Optimized)
-- SET search_path ensures the function always finds tables in public and tools in extensions.
-- STABLE tells Postgres the result won't change within a single scan, improving RLS speed.

ALTER FUNCTION public.is_org_admin(uuid) 
  SET search_path = public, extensions;
ALTER FUNCTION public.is_org_admin(uuid) STABLE;

ALTER FUNCTION public.is_org_member(uuid) 
  SET search_path = public, extensions;
ALTER FUNCTION public.is_org_member(uuid) STABLE;

ALTER FUNCTION public.verify_reset_permission(uuid) 
  SET search_path = public, extensions;
ALTER FUNCTION public.verify_reset_permission(uuid) STABLE;

-- 3. Business Logic / Audit Triggers
ALTER FUNCTION public.check_timesheet_immutability() 
  SET search_path = public, extensions;

ALTER FUNCTION public.log_timesheet_changes() 
  SET search_path = public, extensions;

-- NOTE: If you get an error that a function "does not exist", ensure the argument 
-- types (uuid, etc.) exactly match your function signatures in the Supabase Dashboard.
