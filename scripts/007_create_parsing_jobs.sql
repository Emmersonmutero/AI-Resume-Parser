-- Create parsing_jobs table for async processing tracking
create table if not exists public.parsing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  
  -- Job details
  job_type text not null default 'resume_parsing' check (job_type in ('resume_parsing', 'job_matching', 'skill_extraction')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority integer not null default 5 check (priority >= 1 and priority <= 10),
  
  -- Processing details
  worker_id text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  processing_time_ms integer,
  
  -- Error handling
  error_message text,
  error_details jsonb,
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  
  -- Job configuration
  job_config jsonb default '{}'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.parsing_jobs enable row level security;

-- RLS Policies for parsing_jobs
create policy "parsing_jobs_select_own"
  on public.parsing_jobs for select
  using (auth.uid() = user_id);

create policy "parsing_jobs_insert_own"
  on public.parsing_jobs for insert
  with check (auth.uid() = user_id);

create policy "parsing_jobs_update_own"
  on public.parsing_jobs for update
  using (auth.uid() = user_id);

-- Admins can view all parsing jobs
create policy "parsing_jobs_select_admin"
  on public.parsing_jobs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add updated_at trigger
create trigger parsing_jobs_updated_at
  before update on public.parsing_jobs
  for each row execute function public.handle_updated_at();

-- Create indexes for job processing
create index idx_parsing_jobs_user_id on public.parsing_jobs(user_id);
create index idx_parsing_jobs_resume_id on public.parsing_jobs(resume_id);
create index idx_parsing_jobs_status on public.parsing_jobs(status);
create index idx_parsing_jobs_priority on public.parsing_jobs(priority desc);
create index idx_parsing_jobs_created_at on public.parsing_jobs(created_at desc);
create index idx_parsing_jobs_queue on public.parsing_jobs(status, priority desc, created_at) where status in ('pending', 'processing');
