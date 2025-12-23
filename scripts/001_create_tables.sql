-- Create profiles table with role-based access
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student', 'alumni')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_profiles table for detailed student information
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_number TEXT UNIQUE,
  branch TEXT,
  year_of_study INTEGER,
  phone TEXT,
  bio TEXT,
  skills TEXT[], -- Array of skills
  interests TEXT[], -- Array of interests
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alumni_profiles table for alumni information
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  graduation_year INTEGER,
  branch TEXT,
  current_company TEXT,
  current_position TEXT,
  years_of_experience INTEGER,
  phone TEXT,
  bio TEXT,
  skills TEXT[], -- Array of skills
  expertise_areas TEXT[], -- Array of expertise
  linkedin_url TEXT,
  github_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE, -- Admin verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table for alumni-led sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL REFERENCES public.alumni_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('mentorship', 'technical', 'career_guidance', 'interview_prep', 'project_review', 'other')),
  duration_minutes INTEGER,
  max_participants INTEGER,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  meeting_link TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_registrations table for students registering for sessions
CREATE TABLE IF NOT EXISTS public.session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for student_profiles table
CREATE POLICY "Anyone can view student profiles"
  ON public.student_profiles FOR SELECT
  USING (true);

CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can update their own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for alumni_profiles table
CREATE POLICY "Anyone can view verified alumni profiles"
  ON public.alumni_profiles FOR SELECT
  USING (is_verified = true OR auth.uid() = id);

CREATE POLICY "Alumni can insert their own profile"
  ON public.alumni_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Alumni can update their own profile"
  ON public.alumni_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any alumni profile"
  ON public.alumni_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for sessions table
CREATE POLICY "Anyone can view sessions from verified alumni"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alumni_profiles
      WHERE alumni_profiles.id = sessions.alumni_id AND alumni_profiles.is_verified = true
    )
  );

CREATE POLICY "Alumni can insert their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = alumni_id);

CREATE POLICY "Alumni can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = alumni_id);

CREATE POLICY "Alumni can delete their own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = alumni_id);

-- RLS Policies for session_registrations table
CREATE POLICY "Students can view their own registrations"
  ON public.session_registrations FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Alumni can view registrations for their sessions"
  ON public.session_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = session_registrations.session_id AND sessions.alumni_id = auth.uid()
    )
  );

CREATE POLICY "Students can register for sessions"
  ON public.session_registrations FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can cancel their registrations"
  ON public.session_registrations FOR DELETE
  USING (auth.uid() = student_id);

-- Create function to automatically create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$;

-- Create trigger to call function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_alumni_verified ON public.alumni_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_sessions_alumni ON public.sessions(alumni_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_registrations_session ON public.session_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student ON public.session_registrations(student_id);
