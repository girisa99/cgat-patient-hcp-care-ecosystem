-- Create NPI verification results table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.npi_verification_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  npi TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'individual',
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'failed', 'pending')),
  verification_data JSONB,
  provider_name TEXT,
  specialty TEXT,
  practice_address JSONB,
  mailing_address JSONB,
  credentials JSONB DEFAULT '[]'::jsonb,
  taxonomies JSONB DEFAULT '[]'::jsonb,
  verification_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.npi_verification_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view NPI verification results" 
ON public.npi_verification_results 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create NPI verification results" 
ON public.npi_verification_results 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_npi_verification_results_npi ON public.npi_verification_results(npi);
CREATE INDEX IF NOT EXISTS idx_npi_verification_results_status ON public.npi_verification_results(verification_status);
CREATE INDEX IF NOT EXISTS idx_npi_verification_results_created_at ON public.npi_verification_results(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_npi_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_npi_verification_updated_at
BEFORE UPDATE ON public.npi_verification_results
FOR EACH ROW
EXECUTE FUNCTION public.update_npi_verification_updated_at();