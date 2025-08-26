-- Create resumes table for file storage and metadata
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_filename text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text not null check (file_type in ('pdf', 'docx', 'txt')),
  upload_status text not null default 'uploaded' check (upload_status in ('uploaded', 'processing', 'parsed', 'failed')),
  parsing_status text not null default 'pending' check (parsing_status in ('pending', 'processing', 'completed', 'failed')),
  parsing_error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.resumes enable row level security;

-- RLS Policies for resumes
create policy "resumes_select_own"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "resumes_insert_own"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "resumes_update_own"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "resumes_delete_own"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- Admins can view all resumes
create policy "resumes_select_admin"
  on public.resumes for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add updated_at trigger
create trigger resumes_updated_at
  before update on public.resumes
  for each row execute function public.handle_updated_at();

-- Create indexes for performance
create index idx_resumes_user_id on public.resumes(user_id);
create index idx_resumes_parsing_status on public.resumes(parsing_status);
create index idx_resumes_created_at on public.resumes(created_at desc);
