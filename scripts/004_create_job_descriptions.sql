-- Create job_descriptions table for matching functionality
create table if not exists public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text,
  department text,
  location text,
  employment_type text check (employment_type in ('full-time', 'part-time', 'contract', 'internship', 'temporary')),
  experience_level text check (experience_level in ('entry', 'mid', 'senior', 'lead', 'executive')),
  
  -- Job details
  description text not null,
  requirements text,
  responsibilities text,
  benefits text,
  salary_range text,
  
  -- Structured requirements (JSON arrays)
  required_skills jsonb default '[]'::jsonb,
  preferred_skills jsonb default '[]'::jsonb,
  required_experience jsonb default '[]'::jsonb,
  required_education jsonb default '[]'::jsonb,
  
  -- Status and metadata
  status text not null default 'active' check (status in ('active', 'paused', 'closed', 'draft')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.job_descriptions enable row level security;

-- RLS Policies for job_descriptions
create policy "job_descriptions_select_own"
  on public.job_descriptions for select
  using (auth.uid() = user_id);

create policy "job_descriptions_insert_own"
  on public.job_descriptions for insert
  with check (auth.uid() = user_id);

create policy "job_descriptions_update_own"
  on public.job_descriptions for update
  using (auth.uid() = user_id);

create policy "job_descriptions_delete_own"
  on public.job_descriptions for delete
  using (auth.uid() = user_id);

-- Admins can view all job descriptions
create policy "job_descriptions_select_admin"
  on public.job_descriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add updated_at trigger
create trigger job_descriptions_updated_at
  before update on public.job_descriptions
  for each row execute function public.handle_updated_at();

-- Create indexes for performance
create index idx_job_descriptions_user_id on public.job_descriptions(user_id);
create index idx_job_descriptions_status on public.job_descriptions(status);
create index idx_job_descriptions_priority on public.job_descriptions(priority);
create index idx_job_descriptions_created_at on public.job_descriptions(created_at desc);

-- GIN indexes for JSON fields
create index idx_job_descriptions_required_skills on public.job_descriptions using gin(required_skills);
create index idx_job_descriptions_preferred_skills on public.job_descriptions using gin(preferred_skills);

-- Full-text search index
create index idx_job_descriptions_text_search on public.job_descriptions using gin(to_tsvector('english', coalesce(description || ' ' || requirements || ' ' || responsibilities, '')));
