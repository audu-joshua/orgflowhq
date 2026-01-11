-- Create user_integrations table to store OAuth tokens
create table if not exists user_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade hum not null,
  provider text not null, -- 'google'
  access_token text not null,
  refresh_token text,
  expires_at bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one provider integration per user
  unique(user_id, provider)
);

-- Enable RLS
alter table user_integrations enable row level security;

-- Policies
create policy "Users can view their own integrations"
  on user_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own integrations"
  on user_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own integrations"
  on user_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own integrations"
  on user_integrations for delete
  using (auth.uid() = user_id);
