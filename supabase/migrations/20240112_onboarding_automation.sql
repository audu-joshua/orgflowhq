-- Add welcome_doc_url and address to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS welcome_doc_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;

-- Create organization_docs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization_docs', 'organization_docs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for organization_docs (Hardened for Multi-tenancy)
DROP POLICY IF EXISTS "Public Document Access" ON storage.objects;
CREATE POLICY "Public Document Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization_docs');

DROP POLICY IF EXISTS "Organization Upload Policy" ON storage.objects;
CREATE POLICY "Organization Upload Policy"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'organization_docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Organization Update Policy" ON storage.objects;
CREATE POLICY "Organization Update Policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization_docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM public.employees 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Organization Delete Policy" ON storage.objects;
CREATE POLICY "Organization Delete Policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization_docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM public.employees 
    WHERE user_id = auth.uid()
  )
);
