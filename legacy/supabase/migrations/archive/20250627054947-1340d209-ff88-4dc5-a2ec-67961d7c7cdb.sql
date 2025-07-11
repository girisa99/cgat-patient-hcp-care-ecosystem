
-- Enable RLS on user_facility_access table (if not already enabled)
ALTER TABLE public.user_facility_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own facility access" ON public.user_facility_access;
DROP POLICY IF EXISTS "Users can view facilities they have access to" ON public.user_facility_access;
DROP POLICY IF EXISTS "Admins can manage facility access" ON public.user_facility_access;

-- Create comprehensive RLS policies for user_facility_access
CREATE POLICY "Users can view their own facility access" ON public.user_facility_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all facility access" ON public.user_facility_access
  FOR SELECT USING (
    public.check_user_has_role(auth.uid(), 'superAdmin') OR
    public.check_user_has_role(auth.uid(), 'caseManager')
  );

CREATE POLICY "Admins can manage facility access" ON public.user_facility_access
  FOR ALL USING (
    public.check_user_has_role(auth.uid(), 'superAdmin') OR
    public.check_user_has_role(auth.uid(), 'onboardingTeam')
  );

CREATE POLICY "Users can insert their own facility access" ON public.user_facility_access
  FOR INSERT WITH CHECK (user_id = auth.uid());
