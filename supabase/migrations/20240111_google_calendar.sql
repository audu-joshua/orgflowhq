-- Create user_integrations table to store OAuth tokens
create table if not exists user_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null check (provider in ('google')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one provider integration per user
  unique(user_id, provider)
);

-- Index for faster lookups
create index if not exists idx_user_integrations_user_id on user_integrations(user_id);

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
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own integrations"
  on user_integrations for delete
  using (auth.uid() = user_id);

-- Updated at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_integrations_updated_at on user_integrations;
create trigger set_user_integrations_updated_at
before update on user_integrations
for each row
execute procedure set_updated_at();
