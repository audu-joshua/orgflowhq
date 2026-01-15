-- 1. Add role and profile columns to public.users if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 1b. Ensure users can read their own data (including role)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (
    auth.uid() = id
);

-- 2. Update your user to be super_admin
UPDATE public.users 
SET role = 'super_admin' 
WHERE email = 'empire4josh@gmail.com';

-- 3. Verify the change
SELECT id, email, role FROM public.users WHERE email = 'empire4josh@gmail.com';

-- 4. Create an admin logs table for audit (Optional but recommended)
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS on admin_logs (Only admins can view/insert)
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can view logs" ON public.admin_logs;
CREATE POLICY "Super admins can view logs" ON public.admin_logs
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

DROP POLICY IF EXISTS "Super admins can insert logs" ON public.admin_logs;
CREATE POLICY "Super admins can insert logs" ON public.admin_logs
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
