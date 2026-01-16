
-- Add unique constraint to subscriptions table to support UPSERT on organization_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_organization_id_key'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_organization_id_key UNIQUE (organization_id);
    END IF;
END $$;
