-- 1. Add missing columns to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 2. Update the sync trigger function to include metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, profile_image_url, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.created_at, 
    new.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    profile_image_url = EXCLUDED.profile_image_url,
    updated_at = EXCLUDED.updated_at;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update existing users from auth.users metadata (One-time sync)
UPDATE public.users u
SET 
  full_name = a.raw_user_meta_data->>'full_name',
  profile_image_url = a.raw_user_meta_data->>'avatar_url'
FROM auth.users a
WHERE u.id = a.id;
