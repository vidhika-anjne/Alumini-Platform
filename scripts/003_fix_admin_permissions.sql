-- Add policy to allow admins to view all alumni profiles
CREATE POLICY "Admins can view all alumni profiles"
  ON public.alumni_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
