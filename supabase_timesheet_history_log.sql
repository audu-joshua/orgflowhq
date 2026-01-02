-- LAYER 12: Timesheet History Log
-- Purpose: Maintain a full JSON audit trail of every modification.

-- 1. Add History Column
ALTER TABLE public.timesheets 
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- 2. Create Trigger Function to log changes
CREATE OR REPLACE FUNCTION public.log_timesheet_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    changes JSONB;
BEGIN
    -- Get current user ID (safe fallback if system update)
    current_user_id := auth.uid();
    
    -- Calculate what changed (Simple Diff)
    -- We only care about specific operational fields
    changes := '{}'::jsonb;
    
    IF NEW.clock_out IS DISTINCT FROM OLD.clock_out THEN
        changes := changes || jsonb_build_object('clock_out', NEW.clock_out);
    END IF;
    
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        changes := changes || jsonb_build_object('status', NEW.status);
    END IF;
    
    IF NEW.notes IS DISTINCT FROM OLD.notes THEN
        changes := changes || jsonb_build_object('notes', NEW.notes);
    END IF;

    IF NEW.override_reason IS DISTINCT FROM OLD.override_reason THEN
        changes := changes || jsonb_build_object('override_reason', NEW.override_reason);
    END IF;

    -- Only append log if there are actual changes
    IF changes != '{}'::jsonb THEN
        NEW.history := COALESCE(OLD.history, '[]'::jsonb) || jsonb_build_object(
            'timestamp', now(),
            'actor_id', current_user_id,
            'changes', changes
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS trigger_log_timesheet_changes ON public.timesheets;

CREATE TRIGGER trigger_log_timesheet_changes
BEFORE UPDATE ON public.timesheets
FOR EACH ROW
EXECUTE FUNCTION public.log_timesheet_changes();
