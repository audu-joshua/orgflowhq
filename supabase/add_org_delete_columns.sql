-- Add deletion confirmation columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS delete_confirmation_code TEXT,
ADD COLUMN IF NOT EXISTS delete_confirmation_expires_at TIMESTAMPTZ;
