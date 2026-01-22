-- INIT STORAGE: Create 'employees' bucket for profile images
-- Run this in the Supabase SQL Editor

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('employees', 'employees', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies for 'employees' bucket

-- ALLOW PUBLIC ACCESS to view images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'employees');

-- ALLOW AUTHENTICATED USERS to upload their own profile images
-- We restrict it so a user can only upload to its own folder (named by employee_id or user_id)
-- Note: our service uses 'employeeId/timestamp.ext'
CREATE POLICY "Employees can upload own profile image" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'employees' 
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- ALLOW AUTHENTICATED USERS to update/delete their own profile images
CREATE POLICY "Employees can update own profile image" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'employees' 
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can delete own profile image" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'employees' 
    AND (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.employees WHERE user_id = auth.uid()
    )
  );
