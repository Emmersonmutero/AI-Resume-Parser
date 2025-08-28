-- Create a new enum type for permissions
create type public.permission as enum (
  'jobs:create',
  'jobs:read',
  'jobs:update',
  'jobs:delete',
  'candidates:create',
  'candidates:read',
  'candidates:update',
  'candidates:delete',
  'applications:create',
  'applications:read',
  'applications:update',
  'applications:delete',
  'interviews:create',
  'interviews:read',
  'interviews:update',
  'interviews:delete',
  'users:create',
  'users:read',
  'users:update',
  'users:delete'
);

-- Create the role_permissions table
create table if not exists public.role_permissions (
  role public.user_role not null,
  permission public.permission not null,
  primary key (role, permission)
);

-- Populate the role_permissions table
insert into public.role_permissions (role, permission)
values
  -- Super Admin
  ('super_admin', 'jobs:create'),
  ('super_admin', 'jobs:read'),
  ('super_admin', 'jobs:update'),
  ('super_admin', 'jobs:delete'),
  ('super_admin', 'candidates:create'),
  ('super_admin', 'candidates:read'),
  ('super_admin', 'candidates:update'),
  ('super_admin', 'candidates:delete'),
  ('super_admin', 'applications:create'),
  ('super_admin', 'applications:read'),
  ('super_admin', 'applications:update'),
  ('super_admin', 'applications:delete'),
  ('super_admin', 'interviews:create'),
  ('super_admin', 'interviews:read'),
  ('super_admin', 'interviews:update'),
  ('super_admin', 'interviews:delete'),
  ('super_admin', 'users:create'),
  ('super_admin', 'users:read'),
  ('super_admin', 'users:update'),
  ('super_admin', 'users:delete'),

  -- Recruiter
  ('recruiter', 'jobs:create'),
  ('recruiter', 'jobs:read'),
  ('recruiter', 'jobs:update'),
  ('recruiter', 'jobs:delete'),
  ('recruiter', 'candidates:create'),
  ('recruiter', 'candidates:read'),
  ('recruiter', 'candidates:update'),
  ('recruiter', 'candidates:delete'),
  ('recruiter', 'applications:create'),
  ('recruiter', 'applications:read'),
  ('recruiter', 'applications:update'),
  ('recruiter', 'applications:delete'),
  ('recruiter', 'interviews:create'),
  ('recruiter', 'interviews:read'),
  ('recruiter', 'interviews:update'),
  ('recruiter', 'interviews:delete'),

  -- Hiring Manager
  ('hiring_manager', 'jobs:read'),
  ('hiring_manager', 'candidates:read'),
  ('hiring_manager', 'applications:read'),
  ('hiring_manager', 'applications:update'),
  ('hiring_manager', 'interviews:create'),
  ('hiring_manager', 'interviews:read'),
  ('hiring_manager', 'interviews:update'),

  -- Candidate
  ('candidate', 'applications:create'),
  ('candidate', 'applications:read'),

  -- Interviewer
  ('interviewer', 'candidates:read'),
  ('interviewer', 'interviews:read'),
  ('interviewer', 'interviews:update'),

  -- Sourcing Specialist
  ('sourcing_specialist', 'candidates:create'),
  ('sourcing_specialist', 'candidates:read'),

  -- Recruiting Coordinator
  ('recruiting_coordinator', 'interviews:create'),
  ('recruiting_coordinator', 'interviews:read'),
  ('recruiting_coordinator', 'interviews:update');
