-- Create tables for signature management and DocuSign integration

-- Application signatures table
CREATE TABLE IF NOT EXISTS public.application_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.credit_applications(id) ON DELETE CASCADE,
  signer_name VARCHAR(255) NOT NULL,
  signer_email VARCHAR(255) NOT NULL,
  signer_role VARCHAR(100) NOT NULL,
  signer_order INTEGER NOT NULL,
  signature_data TEXT, -- Base64 encoded signature image
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
  signed_at TIMESTAMPTZ,
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DocuSign envelopes table
CREATE TABLE IF NOT EXISTS public.docusign_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.credit_applications(id) ON DELETE CASCADE,
  envelope_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'completed', 'declined', 'expired')),
  signers JSONB NOT NULL DEFAULT '[]',
  envelope_data JSONB,
  webhook_events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PDF documents table
CREATE TABLE IF NOT EXISTS public.application_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.credit_applications(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  pdf_type VARCHAR(50) DEFAULT 'final' CHECK (pdf_type IN ('draft', 'final', 'signed')),
  includes_signatures BOOLEAN DEFAULT false,
  file_size INTEGER,
  generated_at TIMESTAMPTZ DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id)
);

-- Add signature-related columns to credit_applications table
ALTER TABLE public.credit_applications 
ADD COLUMN IF NOT EXISTS signatures_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS all_signatures_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS docusign_envelope_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS signature_workflow_status VARCHAR(50) DEFAULT 'not_started' 
  CHECK (signature_workflow_status IN ('not_started', 'in_progress', 'completed', 'failed'));

-- Enable RLS on new tables
ALTER TABLE public.application_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docusign_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_pdfs ENABLE ROW LEVEL SECURITY;

-- RLS policies for application_signatures
CREATE POLICY "Users can view signatures for their applications" 
ON public.application_signatures 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.credit_applications ca 
    WHERE ca.id = application_signatures.application_id 
    AND ca.applicant_user_id = auth.uid()
  )
  OR signer_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create signatures for their applications" 
ON public.application_signatures 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.credit_applications ca 
    WHERE ca.id = application_signatures.application_id 
    AND ca.applicant_user_id = auth.uid()
  )
);

CREATE POLICY "Signers can update their own signatures" 
ON public.application_signatures 
FOR UPDATE 
USING (
  signer_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- RLS policies for docusign_envelopes
CREATE POLICY "Users can view envelopes for their applications" 
ON public.docusign_envelopes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.credit_applications ca 
    WHERE ca.id = docusign_envelopes.application_id 
    AND ca.applicant_user_id = auth.uid()
  )
);

CREATE POLICY "Users can create envelopes for their applications" 
ON public.docusign_envelopes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.credit_applications ca 
    WHERE ca.id = docusign_envelopes.application_id 
    AND ca.applicant_user_id = auth.uid()
  )
);

CREATE POLICY "System can update envelope status" 
ON public.docusign_envelopes 
FOR UPDATE 
USING (true);

-- RLS policies for application_pdfs
CREATE POLICY "Users can view PDFs for their applications" 
ON public.application_pdfs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.credit_applications ca 
    WHERE ca.id = application_pdfs.application_id 
    AND ca.applicant_user_id = auth.uid()
  )
);

CREATE POLICY "Users can create PDFs for their applications" 
ON public.application_pdfs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.credit_applications ca 
    WHERE ca.id = application_pdfs.application_id 
    AND ca.applicant_user_id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_signatures_application_id ON public.application_signatures(application_id);
CREATE INDEX IF NOT EXISTS idx_application_signatures_signer_email ON public.application_signatures(signer_email);
CREATE INDEX IF NOT EXISTS idx_docusign_envelopes_application_id ON public.docusign_envelopes(application_id);
CREATE INDEX IF NOT EXISTS idx_docusign_envelopes_envelope_id ON public.docusign_envelopes(envelope_id);
CREATE INDEX IF NOT EXISTS idx_application_pdfs_application_id ON public.application_pdfs(application_id);

-- Triggers for updated_at
CREATE TRIGGER update_application_signatures_updated_at
  BEFORE UPDATE ON public.application_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_docusign_envelopes_updated_at
  BEFORE UPDATE ON public.docusign_envelopes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for credit documents (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'credit-documents',
  'credit-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for credit documents
CREATE POLICY "Users can upload documents for their applications"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'credit-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view documents for their applications"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'credit-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);