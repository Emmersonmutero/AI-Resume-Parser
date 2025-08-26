-- Create resume_matches table for job matching results
create table if not exists public.resume_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  job_description_id uuid not null references public.job_descriptions(id) on delete cascade,
  
  -- Matching scores (0.0 to 1.0)
  overall_score real not null default 0.0 check (overall_score >= 0.0 and overall_score <= 1.0),
  skills_score real not null default 0.0 check (skills_score >= 0.0 and skills_score <= 1.0),
  experience_score real not null default 0.0 check (experience_score >= 0.0 and experience_score <= 1.0),
  education_score real not null default 0.0 check (education_score >= 0.0 and education_score <= 1.0),
  
  -- Detailed matching analysis
  matched_skills jsonb default '[]'::jsonb,
  missing_skills jsonb default '[]'::jsonb,
  matched_requirements jsonb default '[]'::jsonb,
  missing_requirements jsonb default '[]'::jsonb,
  
  -- Match metadata
  match_explanation text,
  match_confidence real default 0.0,
  matching_model text,
  matching_version text,
  
  -- Status and flags
  is_bookmarked boolean default false,
  is_reviewed boolean default false,
  reviewer_notes text,
  match_status text not null default 'new' check (match_status in ('new', 'reviewed', 'shortlisted', 'rejected', 'contacted')),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique matches per user/resume/job combination
  unique(user_id, resume_id, job_description_id)
);

-- Enable RLS
alter table public.resume_matches enable row level security;

-- RLS Policies for resume_matches
create policy "resume_matches_select_own"
  on public.resume_matches for select
  using (auth.uid() = user_id);

create policy "resume_matches_insert_own"
  on public.resume_matches for insert
  with check (auth.uid() = user_id);

create policy "resume_matches_update_own"
  on public.resume_matches for update
  using (auth.uid() = user_id);

create policy "resume_matches_delete_own"
  on public.resume_matches for delete
  using (auth.uid() = user_id);

-- Admins can view all matches
create policy "resume_matches_select_admin"
  on public.resume_matches for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add updated_at trigger
create trigger resume_matches_updated_at
  before update on public.resume_matches
  for each row execute function public.handle_updated_at();

-- Create indexes for performance
create index idx_resume_matches_user_id on public.resume_matches(user_id);
create index idx_resume_matches_resume_id on public.resume_matches(resume_id);
create index idx_resume_matches_job_id on public.resume_matches(job_description_id);
create index idx_resume_matches_overall_score on public.resume_matches(overall_score desc);
create index idx_resume_matches_status on public.resume_matches(match_status);
create index idx_resume_matches_bookmarked on public.resume_matches(is_bookmarked) where is_bookmarked = true;
create index idx_resume_matches_created_at on public.resume_matches(created_at desc);
