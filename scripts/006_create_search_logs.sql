-- Create search_logs table for analytics and audit trail
create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Search details
  search_type text not null check (search_type in ('resume_search', 'candidate_search', 'job_match', 'skill_search')),
  search_query text,
  search_filters jsonb default '{}'::jsonb,
  
  -- Results
  results_count integer not null default 0,
  results_ids jsonb default '[]'::jsonb,
  
  -- Performance metrics
  execution_time_ms integer,
  
  -- Context
  page_url text,
  user_agent text,
  ip_address inet,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.search_logs enable row level security;

-- RLS Policies for search_logs
create policy "search_logs_select_own"
  on public.search_logs for select
  using (auth.uid() = user_id);

create policy "search_logs_insert_own"
  on public.search_logs for insert
  with check (auth.uid() = user_id);

-- Admins can view all search logs
create policy "search_logs_select_admin"
  on public.search_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes for analytics queries
create index idx_search_logs_user_id on public.search_logs(user_id);
create index idx_search_logs_search_type on public.search_logs(search_type);
create index idx_search_logs_created_at on public.search_logs(created_at desc);
create index idx_search_logs_filters on public.search_logs using gin(search_filters);
