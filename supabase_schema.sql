-- Enable the UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create the prompt_history table
create table if not exists public.prompt_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  original_input text not null,
  result jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add a comment to the table
comment on table public.prompt_history is 'Stores the history of engineered prompts, scoped to individual users.';

-- Create index for efficient user-based lookups
create index if not exists prompt_history_user_id_idx on public.prompt_history(user_id);

-- Enable Row Level Security (RLS)
alter table public.prompt_history enable row level security;

-- PRIVACY: Users can only read their own history
create policy "Users can read own history"
  on public.prompt_history
  for select
  to authenticated
  using (auth.uid() = user_id);

-- PRIVACY: Users can only delete their own history
create policy "Users can delete own history"
  on public.prompt_history
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- NOTE: Insert operations are handled by the Edge Function using service_role key,
-- which bypasses RLS. This is intentional for secure server-side insertions.

