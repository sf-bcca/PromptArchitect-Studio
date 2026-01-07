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


-- Create the user_favorites table
create table if not exists public.user_favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt_history_id uuid references public.prompt_history(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, prompt_history_id)
);

-- Add a comment to the table
comment on table public.user_favorites is 'Stores user favorite prompts linking to their history.';

-- Create index for efficient lookups
create index if not exists user_favorites_user_id_idx on public.user_favorites(user_id);
create index if not exists user_favorites_prompt_history_id_idx on public.user_favorites(prompt_history_id);

-- Enable Row Level Security (RLS)
alter table public.user_favorites enable row level security;

-- PRIVACY: Users can only read their own favorites
create policy "Users can read own favorites"
  on public.user_favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

-- PRIVACY: Users can only insert their own favorites
create policy "Users can insert own favorites"
  on public.user_favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- PRIVACY: Users can only delete their own favorites
create policy "Users can delete own favorites"
  on public.user_favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);
