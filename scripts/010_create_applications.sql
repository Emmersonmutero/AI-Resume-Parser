-- Adding applications table for job application tracking
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  ai_match_score INTEGER CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  ai_match_explanation TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  recruiter_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own applications" ON applications
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Users can create their own applications" ON applications
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Users can update their own applications" ON applications
  FOR UPDATE USING (candidate_id = auth.uid());

-- Recruiters can view applications for their jobs
CREATE POLICY "Recruiters can view applications for their jobs" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_descriptions 
      WHERE job_descriptions.id = applications.job_id 
      AND job_descriptions.created_by = auth.uid()
    )
  );

-- Recruiters can update applications for their jobs
CREATE POLICY "Recruiters can update applications for their jobs" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM job_descriptions 
      WHERE job_descriptions.id = applications.job_id 
      AND job_descriptions.created_by = auth.uid()
    )
  );
