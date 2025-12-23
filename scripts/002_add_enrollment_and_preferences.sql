-- Add enrollment_number column to alumni_profiles for verification
ALTER TABLE public.alumni_profiles
ADD COLUMN IF NOT EXISTS enrollment_number TEXT UNIQUE;

-- Add preferences field to student_profiles for matching
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS preferences TEXT[];

-- Create index for faster enrollment number lookups
CREATE INDEX IF NOT EXISTS idx_alumni_enrollment ON public.alumni_profiles(enrollment_number);

-- Create index for preferences matching
CREATE INDEX IF NOT EXISTS idx_student_preferences ON public.student_profiles USING GIN(preferences);
