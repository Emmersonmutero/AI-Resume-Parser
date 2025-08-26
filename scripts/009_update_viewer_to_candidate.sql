-- Update viewer role to candidate role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('recruiter', 'admin', 'candidate'));

-- Update any existing viewer records to candidate
UPDATE public.profiles SET role = 'candidate' WHERE role = 'viewer';
