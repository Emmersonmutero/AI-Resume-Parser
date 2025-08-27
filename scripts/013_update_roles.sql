-- Drop the existing check constraint on the role column
alter table public.profiles drop constraint if exists profiles_role_check;

-- Create a new enum type for user roles
create type public.user_role as enum (
  'super_admin',
  'recruiter',
  'hiring_manager',
  'candidate',
  'interviewer',
  'sourcing_specialist',
  'recruiting_coordinator'
);

-- Alter the profiles table to use the new enum type
alter table public.profiles
add column role_temp public.user_role;

-- Update the new role_temp column based on the old role column
update public.profiles
set role_temp = case
  when role = 'admin' then 'super_admin'::public.user_role
  when role = 'recruiter' then 'recruiter'::public.user_role
  when role = 'hr_manager' then 'hiring_manager'::public.user_role
  when role = 'candidate' then 'candidate'::public.user_role
  when role = 'viewer' then 'interviewer'::public.user_role
  else 'candidate'::public.user_role -- Default value for any other existing roles
end;

-- Drop the old role column
alter table public.profiles
drop column role;

-- Rename the new role_temp column to role
alter table public.profiles
rename column role_temp to role;

-- Add a default value to the new role column
alter table public.profiles
alter column role set default 'candidate'::public.user_role;

-- Add a not null constraint to the new role column
alter table public.profiles
alter column role set not null;
