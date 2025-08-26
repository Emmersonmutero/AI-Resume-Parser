-- Create parsed_resumes table for structured resume data
create table if not exists public.parsed_resumes (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Personal Information
  candidate_name text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  
  -- Professional Summary
  summary text,
  objective text,
  
  -- Experience (JSON array)
  experience jsonb default '[]'::jsonb,
  
  -- Education (JSON array)
  education jsonb default '[]'::jsonb,
  
  -- Skills (JSON array)
  skills jsonb default '[]'::jsonb,
  
  -- Certifications (JSON array)
  certifications jsonb default '[]'::jsonb,
  
  -- Languages (JSON array)
  languages jsonb default '[]'::jsonb,
  
  -- Projects (JSON array)
  projects jsonb default '[]'::jsonb,
  
  -- Awards and achievements (JSON array)
  awards jsonb default '[]'::jsonb,
  
  -- Raw extracted text
  raw_text text,
  
  -- Parsing metadata
  parsing_confidence real default 0.0,
  parsing_model text,
  parsing_version text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.parsed_resumes enable row level security;

-- RLS Policies for parsed_resumes
create policy "parsed_resumes_select_own"
  on public.parsed_resumes for select
  using (auth.uid() = user_id);

create policy "parsed_resumes_insert_own"
  on public.parsed_resumes for insert
  with check (auth.uid() = user_id);

create policy "parsed_resumes_update_own"
  on public.parsed_resumes for update
  using (auth.uid() = user_id);

create policy "parsed_resumes_delete_own"
  on public.parsed_resumes for delete
  using (auth.uid() = user_id);

-- Admins can view all parsed resumes
create policy "parsed_resumes_select_admin"
  on public.parsed_resumes for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add updated_at trigger
create trigger parsed_resumes_updated_at
  before update on public.parsed_resumes
  for each row execute function public.handle_updated_at();

-- Create indexes for performance and search
create index idx_parsed_resumes_resume_id on public.parsed_resumes(resume_id);
create index idx_parsed_resumes_user_id on public.parsed_resumes(user_id);
create index idx_parsed_resumes_candidate_name on public.parsed_resumes(candidate_name);
create index idx_parsed_resumes_email on public.parsed_resumes(email);

-- GIN indexes for JSON fields to enable fast searching
create index idx_parsed_resumes_skills on public.parsed_resumes using gin(skills);
create index idx_parsed_resumes_experience on public.parsed_resumes using gin(experience);
create index idx_parsed_resumes_education on public.parsed_resumes using gin(education);

-- Full-text search index
create index idx_parsed_resumes_text_search on public.parsed_resumes using gin(to_tsvector('english', coalesce(raw_text, '')));
