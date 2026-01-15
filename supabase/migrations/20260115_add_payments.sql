-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- 'Free', 'Mid-Level', 'Premium'
    slug TEXT NOT NULL UNIQUE, -- 'free', 'mid-monthly', 'mid-yearly', 'premium-monthly', 'premium-yearly'
    paystack_plan_code TEXT, -- nullable for free plan
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    interval TEXT NOT NULL, -- 'monthly', 'yearly'
    description TEXT,
    features JSONB, -- Store features as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can read plans" ON public.plans;
CREATE POLICY "Everyone can read plans" ON public.plans FOR SELECT USING (true);


-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'cancelled', 'incomplete', 'trialing'
    paystack_subscription_code TEXT,
    paystack_email_token TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their organization's subscription" ON public.subscriptions;
CREATE POLICY "Users can view their organization's subscription" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users_organizations uo
            WHERE uo.organization_id = subscriptions.organization_id
            AND uo.user_id = auth.uid()
        )
    );

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    reference TEXT NOT NULL UNIQUE,
    paystack_transaction_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their organization's payments" ON public.payments;
CREATE POLICY "Users can view their organization's payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users_organizations uo
            WHERE uo.organization_id = payments.organization_id
            AND uo.user_id = auth.uid()
        )
    );

-- Insert default plans (Placeholders, these should be updated with real Paystack Plan Codes later)
INSERT INTO public.plans (name, slug, price, currency, interval, description)
VALUES 
    ('Free Tier', 'free', 0, 'NGN', 'monthly', 'Perfect for individuals and small startups.'),
    ('Mid-Level Monthly', 'mid-monthly', 35000, 'NGN', 'monthly', 'For growing teams.'),
    ('Mid-Level Yearly', 'mid-yearly', 380000, 'NGN', 'yearly', 'For growing teams (Yearly).'),
    ('Premium Monthly', 'premium-monthly', 800, 'NGN', 'monthly', 'Full power for large organizations.'),
    ('Premium Yearly', 'premium-yearly', 8000, 'NGN', 'yearly', 'Full power for large organizations (Yearly).')
ON CONFLICT (slug) DO UPDATE SET
    paystack_plan_code = CASE 
        WHEN plans.slug = 'mid-monthly' THEN 'PLN_z22t8y70ra8id53'
        WHEN plans.slug = 'premium-monthly' THEN 'PLN_p0d5pe8x0s8aftf'
        ELSE plans.paystack_plan_code
    END,
    price = EXCLUDED.price,
    currency = 'NGN';
