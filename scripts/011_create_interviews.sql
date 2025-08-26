-- Adding interviews table for interview scheduling
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  interview_type VARCHAR(50) DEFAULT 'video' CHECK (interview_type IN ('video', 'phone', 'in-person')),
  meeting_link TEXT,
  location TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  ai_questions JSONB,
  interviewer_notes TEXT,
  candidate_feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Candidates can view their own interviews" ON interviews
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Interviewers can view their interviews" ON interviews
  FOR SELECT USING (interviewer_id = auth.uid());

CREATE POLICY "Interviewers can create interviews" ON interviews
  FOR INSERT WITH CHECK (interviewer_id = auth.uid());

CREATE POLICY "Interviewers can update their interviews" ON interviews
  FOR UPDATE USING (interviewer_id = auth.uid());

CREATE POLICY "Candidates can update their interview feedback" ON interviews
  FOR UPDATE USING (candidate_id = auth.uid());
