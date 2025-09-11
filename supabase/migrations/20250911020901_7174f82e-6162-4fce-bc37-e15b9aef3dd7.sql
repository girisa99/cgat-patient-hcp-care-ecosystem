-- Create NPI verification results table
CREATE TABLE public.npi_verification_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  npi VARCHAR(10) NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('individual', 'organization')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'failed', 'partial', 'pending')),
  verification_data JSONB NOT NULL DEFAULT '{}',
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  issues TEXT[] DEFAULT '{}',
  facility_id UUID,
  enrollment_id UUID,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.npi_verification_results ENABLE ROW LEVEL SECURITY;

-- Create policies for NPI verification results
CREATE POLICY "Users can view verification results for their facilities"
  ON public.npi_verification_results
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      -- Users can see results for their own facilities
      EXISTS (
        SELECT 1 FROM public.facilities f
        WHERE f.id = npi_verification_results.facility_id
        AND f.created_by = auth.uid()
      )
      OR
      -- Users can see results for their own enrollments
      EXISTS (
        SELECT 1 FROM public.enrollment_instances e
        WHERE e.id = npi_verification_results.enrollment_id
        AND e.created_by = auth.uid()
      )
      OR
      -- Admins can see all
      is_admin_user_safe(auth.uid())
    )
  );

CREATE POLICY "System can insert verification results"
  ON public.npi_verification_results
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update verification results for their facilities"
  ON public.npi_verification_results
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.facilities f
        WHERE f.id = npi_verification_results.facility_id
        AND f.created_by = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.enrollment_instances e
        WHERE e.id = npi_verification_results.enrollment_id
        AND e.created_by = auth.uid()
      )
      OR
      is_admin_user_safe(auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_npi_verification_results_npi ON public.npi_verification_results(npi);
CREATE INDEX idx_npi_verification_results_facility_id ON public.npi_verification_results(facility_id);
CREATE INDEX idx_npi_verification_results_enrollment_id ON public.npi_verification_results(enrollment_id);
CREATE INDEX idx_npi_verification_results_status ON public.npi_verification_results(verification_status);
CREATE INDEX idx_npi_verification_results_verified_at ON public.npi_verification_results(verified_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_npi_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_npi_verification_updated_at
  BEFORE UPDATE ON public.npi_verification_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_npi_verification_updated_at();

-- Add verification_status and npi_verified_at to enrollment_instances if not exists
ALTER TABLE public.enrollment_instances 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS npi_verified_at TIMESTAMP WITH TIME ZONE;