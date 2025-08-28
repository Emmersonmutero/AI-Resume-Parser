-- Add new columns to the profiles table
alter table public.profiles
add column if not exists phone text,
add column if not exists location text,
add column if not exists linkedin_url text,
add column if not exists website_url text,
add column if not exists professional_summary text,
add column if not exists company text,
add column if not exists department text;
