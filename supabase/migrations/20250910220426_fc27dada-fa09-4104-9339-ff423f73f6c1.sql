-- Drop existing policies if they exist and recreate them properly
DROP POLICY IF EXISTS "Users can view their own provider profile" ON public.provider_profiles;
DROP POLICY IF EXISTS "Users can create their own provider profile" ON public.provider_profiles;
DROP POLICY IF EXISTS "Users can update their own provider profile" ON public.provider_profiles;
DROP POLICY IF EXISTS "Users can delete their own provider profile" ON public.provider_profiles;
DROP POLICY IF EXISTS "Admins can manage all provider profiles" ON public.provider_profiles;

DROP POLICY IF EXISTS "Users can view their own insurance coverages" ON public.insurance_coverages;
DROP POLICY IF EXISTS "Users can create their own insurance coverages" ON public.insurance_coverages;
DROP POLICY IF EXISTS "Users can update their own insurance coverages" ON public.insurance_coverages;
DROP POLICY IF EXISTS "Users can delete their own insurance coverages" ON public.insurance_coverages;
DROP POLICY IF EXISTS "Providers can view patient insurance for their enrollments" ON public.insurance_coverages;
DROP POLICY IF EXISTS "Admins can manage all insurance coverages" ON public.insurance_coverages;

DROP POLICY IF EXISTS "Users can view their own treatment assessments" ON public.treatment_assessments;
DROP POLICY IF EXISTS "Providers can manage assessments for their patients" ON public.treatment_assessments;
DROP POLICY IF EXISTS "Medical reviewers can view and update assessments" ON public.treatment_assessments;
DROP POLICY IF EXISTS "Medical reviewers can view assessments" ON public.treatment_assessments;
DROP POLICY IF EXISTS "Medical reviewers can update assessments" ON public.treatment_assessments;
DROP POLICY IF EXISTS "Admins can manage all treatment assessments" ON public.treatment_assessments;

-- Now create the policies fresh
-- RLS Policies for provider_profiles table
CREATE POLICY "Users can view their own provider profile"
  ON public.provider_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own provider profile"
  ON public.provider_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile"
  ON public.provider_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider profile"
  ON public.provider_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all provider profiles"
  ON public.provider_profiles FOR ALL
  USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for insurance_coverages table
CREATE POLICY "Users can view their own insurance coverages"
  ON public.insurance_coverages FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can create their own insurance coverages"
  ON public.insurance_coverages FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their own insurance coverages"
  ON public.insurance_coverages FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can delete their own insurance coverages"
  ON public.insurance_coverages FOR DELETE
  USING (auth.uid() = patient_id);

CREATE POLICY "Providers can view patient insurance for their enrollments"
  ON public.insurance_coverages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollment_instances ei
      JOIN public.provider_profiles pp ON pp.id = ei.provider_id
      WHERE ei.id = enrollment_instance_id
      AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all insurance coverages"
  ON public.insurance_coverages FOR ALL
  USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for treatment_assessments table
CREATE POLICY "Users can view their own treatment assessments"
  ON public.treatment_assessments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Providers can manage assessments for their patients"
  ON public.treatment_assessments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      WHERE pp.id = provider_id
      AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Medical reviewers can view assessments"
  ON public.treatment_assessments FOR SELECT
  USING (
    auth.uid() = medical_reviewer_id OR
    is_admin_user_safe(auth.uid())
  );

CREATE POLICY "Medical reviewers can update assessments"
  ON public.treatment_assessments FOR UPDATE
  USING (
    auth.uid() = medical_reviewer_id OR
    is_admin_user_safe(auth.uid())
  );

CREATE POLICY "Admins can manage all treatment assessments"
  ON public.treatment_assessments FOR ALL
  USING (is_admin_user_safe(auth.uid()));