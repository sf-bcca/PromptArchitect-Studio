-- Enable the UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create the prompt_history table
create table if not exists public.prompt_history (
  id uuid default uuid_generate_v4() primary key,
  original_input text not null,
  result jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add a comment to the table
comment on table public.prompt_history is 'Stores the history of engineered prompts.';

-- Enable Row Level Security (RLS)
alter table public.prompt_history enable row level security;

-- Create a policy to allow anonymous read access (adjust based on actual requirements)
create policy "Allow public read access"
  on public.prompt_history
  for select
  to anon
  using (true);

-- Create a policy to allow anonymous insert access (since the edge function likely inserts, or the client does?
-- The code in App.tsx reads, but the insert happens in the Edge Function according to comments:
-- "The Edge Function already saved the item to DB".
-- Edge functions usually use the service_role key, bypassing RLS.
-- So we might not strictly need an insert policy for anon if only the edge function writes.)
