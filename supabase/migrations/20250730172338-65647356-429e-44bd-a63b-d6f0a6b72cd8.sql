-- Create secure credit applications table with encryption for sensitive data
CREATE TABLE public.credit_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id),
  applicant_user_id UUID REFERENCES auth.users(id),
  
  -- Application details
  requested_credit_limit NUMERIC(15,2),
  payment_terms_requested TEXT CHECK (payment_terms_requested IN ('net_30', 'net_60', 'net_90', 'cod', 'prepaid', 'custom')),
  business_type TEXT NOT NULL,
  
  -- Encrypted sensitive fields - stored as encrypted text
  encrypted_ssn TEXT, -- Encrypted SSN
  encrypted_federal_id TEXT, -- Encrypted Federal Tax ID
  encrypted_bank_account TEXT, -- Encrypted bank account info
  
  -- Business information (non-sensitive)
  years_in_business INTEGER,
  annual_revenue_range TEXT,
  number_of_employees INTEGER,
  business_description TEXT,
  
  -- Contact information
  primary_contact_name TEXT NOT NULL,
  primary_contact_title TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  
  -- Trade references (up to 5)
  trade_references JSONB DEFAULT '[]'::jsonb,
  
  -- Bank references
  bank_references JSONB DEFAULT '[]'::jsonb,
  
  -- Financial information
  financial_statements JSONB DEFAULT '{}'::jsonb,
  debt_to_income_ratio NUMERIC(5,2),
  credit_score_range TEXT,
  
  -- Terms and conditions
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  terms_version TEXT,
  privacy_policy_accepted BOOLEAN DEFAULT FALSE,
  privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  credit_check_authorized BOOLEAN DEFAULT FALSE,
  credit_check_authorized_at TIMESTAMP WITH TIME ZONE,
  
  -- Application status and workflow
  application_status TEXT DEFAULT 'draft' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'pending_documents')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  decision_date TIMESTAMP WITH TIME ZONE,
  decision_reason TEXT,
  approved_credit_limit NUMERIC(15,2),
  approved_payment_terms TEXT,
  
  -- Security and audit
  ip_address INET,
  user_agent TEXT,
  encryption_key_id TEXT, -- Reference to encryption key used
  data_classification TEXT DEFAULT 'confidential',
  retention_policy TEXT DEFAULT '7_years',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create secure document storage for credit applications
CREATE TABLE public.credit_application_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_application_id UUID NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
  
  -- Document details
  document_type TEXT NOT NULL CHECK (document_type IN (
    'business_license', 'tax_return', 'bank_statement', 'financial_statement', 
    'articles_of_incorporation', 'w9_form', 'insurance_certificate', 
    'trade_reference_form', 'credit_report', 'other'
  )),
  document_name TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  
  -- Storage details (encrypted)
  storage_path TEXT NOT NULL, -- Path in encrypted storage bucket
  encrypted_checksum TEXT, -- Encrypted file checksum for integrity
  encryption_method TEXT DEFAULT 'AES-256-GCM',
  
  -- Classification and compliance
  data_classification TEXT DEFAULT 'highly_confidential',
  compliance_tags TEXT[] DEFAULT ARRAY['PCI', 'SOX', 'HIPAA'],
  retention_years INTEGER DEFAULT 7,
  
  -- Access control
  uploaded_by UUID REFERENCES auth.users(id),
  access_level TEXT DEFAULT 'restricted' CHECK (access_level IN ('public', 'internal', 'restricted', 'confidential')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create terms and conditions management
CREATE TABLE public.credit_application_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  terms_type TEXT NOT NULL CHECK (terms_type IN ('credit_terms', 'privacy_policy', 'data_processing', 'security_policy')),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Full terms text
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  requires_signature BOOLEAN DEFAULT TRUE,
  compliance_framework TEXT[] DEFAULT ARRAY['SOX', 'PCI-DSS'],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(terms_type, version)
);

-- Create audit trail for credit applications
CREATE TABLE public.credit_application_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_application_id UUID NOT NULL REFERENCES public.credit_applications(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'created', 'updated', 'submitted', 'reviewed', 'approved', 'rejected', 
    'document_uploaded', 'document_deleted', 'data_accessed', 'data_exported'
  )),
  field_changed TEXT,
  old_value_hash TEXT, -- Hash of old value for sensitive fields
  new_value_hash TEXT, -- Hash of new value for sensitive fields
  actor_user_id UUID REFERENCES auth.users(id),
  actor_ip_address INET,
  actor_user_agent TEXT,
  additional_context JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_application_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_application_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_applications
CREATE POLICY "Users can view their own credit applications" 
ON public.credit_applications FOR SELECT 
USING (applicant_user_id = auth.uid() OR is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can create their own credit applications" 
ON public.credit_applications FOR INSERT 
WITH CHECK (applicant_user_id = auth.uid());

CREATE POLICY "Users can update their own draft applications" 
ON public.credit_applications FOR UPDATE 
USING (applicant_user_id = auth.uid() AND application_status = 'draft')
WITH CHECK (applicant_user_id = auth.uid());

CREATE POLICY "Admins can manage all credit applications" 
ON public.credit_applications FOR ALL 
USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for credit_application_documents
CREATE POLICY "Users can view their application documents" 
ON public.credit_application_documents FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.credit_applications ca 
  WHERE ca.id = credit_application_documents.credit_application_id 
  AND (ca.applicant_user_id = auth.uid() OR is_admin_user_safe(auth.uid()))
));

CREATE POLICY "Users can upload documents to their applications" 
ON public.credit_application_documents FOR INSERT 
WITH CHECK (
  uploaded_by = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.credit_applications ca 
    WHERE ca.id = credit_application_documents.credit_application_id 
    AND ca.applicant_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all application documents" 
ON public.credit_application_documents FOR ALL 
USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for terms and conditions (public read, admin manage)
CREATE POLICY "Anyone can view active terms" 
ON public.credit_application_terms FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage terms" 
ON public.credit_application_terms FOR ALL 
USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for audit trail
CREATE POLICY "Users can view their application audit logs" 
ON public.credit_application_audit FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.credit_applications ca 
  WHERE ca.id = credit_application_audit.credit_application_id 
  AND (ca.applicant_user_id = auth.uid() OR is_admin_user_safe(auth.uid()))
));

CREATE POLICY "System can insert audit logs" 
ON public.credit_application_audit FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" 
ON public.credit_application_audit FOR SELECT 
USING (is_admin_user_safe(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_credit_applications_applicant ON public.credit_applications(applicant_user_id);
CREATE INDEX idx_credit_applications_status ON public.credit_applications(application_status);
CREATE INDEX idx_credit_applications_submitted ON public.credit_applications(submitted_at);
CREATE INDEX idx_credit_application_documents_app_id ON public.credit_application_documents(credit_application_id);
CREATE INDEX idx_credit_application_audit_app_id ON public.credit_application_audit(credit_application_id);
CREATE INDEX idx_credit_application_audit_created ON public.credit_application_audit(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_credit_applications_updated_at
  BEFORE UPDATE ON public.credit_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_application_documents_updated_at
  BEFORE UPDATE ON public.credit_application_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_application_terms_updated_at
  BEFORE UPDATE ON public.credit_application_terms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for encrypted credit documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'credit-documents', 
  'credit-documents', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for credit documents (highly secure)
CREATE POLICY "Users can upload to their credit application folder" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'credit-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own credit documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'credit-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own credit documents" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'credit-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all credit documents" 
ON storage.objects FOR ALL 
USING (bucket_id = 'credit-documents' AND is_admin_user_safe(auth.uid()));

-- Insert default terms and conditions
INSERT INTO public.credit_application_terms (terms_type, version, title, content, requires_signature) VALUES 
('credit_terms', '1.0', 'Credit Application Terms and Conditions', 
'CREDIT APPLICATION TERMS AND CONDITIONS

By submitting this credit application, you acknowledge and agree to the following terms:

1. ACCURACY OF INFORMATION
You certify that all information provided in this application is true, complete, and accurate. Any false or misleading information may result in the denial of credit or immediate termination of any credit agreement.

2. CREDIT INVESTIGATION AUTHORIZATION
You authorize us to investigate your credit history, including but not limited to:
- Obtaining credit reports from credit bureaus
- Contacting banks, trade references, and other creditors
- Verifying financial information provided
- Conducting background checks as deemed necessary

3. CONFIDENTIALITY AND DATA PROTECTION
- All personal and financial information will be encrypted and stored securely
- Access to your information is restricted to authorized personnel only
- Data is protected in accordance with applicable privacy laws
- Information may be shared with credit bureaus and authorized third parties for credit evaluation

4. CREDIT DECISION
- Credit decisions are made based on various factors including credit history, financial capacity, and business requirements
- We reserve the right to approve, deny, or modify credit terms at our sole discretion
- You will be notified of our credit decision within 30 business days

5. CREDIT TERMS
If approved:
- Credit limits may be modified at any time
- Payment terms will be clearly specified in your credit agreement  
- Interest may be charged on overdue amounts
- Personal guarantees may be required

6. DATA RETENTION
Your information will be retained for a minimum of 7 years in accordance with regulatory requirements.

7. COMPLIANCE
This application and any resulting credit agreement shall comply with all applicable federal and state laws, including the Fair Credit Reporting Act and Equal Credit Opportunity Act.

By signing below, you acknowledge that you have read, understood, and agree to these terms and conditions.', 
true),

('privacy_policy', '1.0', 'Credit Application Privacy Policy',
'PRIVACY POLICY FOR CREDIT APPLICATIONS

This Privacy Policy describes how we collect, use, and protect your personal information in connection with your credit application.

INFORMATION WE COLLECT:
- Personal identifying information (name, address, SSN, Federal ID)
- Financial information (income, assets, liabilities, bank accounts)
- Business information (years in operation, ownership structure)
- Credit history and references

HOW WE USE YOUR INFORMATION:
- To evaluate your creditworthiness
- To verify the information provided
- To comply with legal and regulatory requirements
- To maintain accurate records

DATA SECURITY:
- All sensitive data is encrypted using industry-standard encryption
- Access is restricted to authorized personnel only
- Regular security audits are conducted
- Secure transmission protocols are used

YOUR RIGHTS:
- Right to access your personal information
- Right to correct inaccurate information
- Right to request deletion (subject to legal requirements)
- Right to file complaints with regulatory authorities

CONTACT INFORMATION:
If you have questions about this privacy policy, please contact our Privacy Officer.

This policy is effective as of the date of your application and may be updated periodically.', 
true);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_credit_application_audit(
  p_credit_application_id UUID,
  p_action_type TEXT,
  p_field_changed TEXT DEFAULT NULL,
  p_old_value TEXT DEFAULT NULL,
  p_new_value TEXT DEFAULT NULL,
  p_additional_context JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.credit_application_audit (
    credit_application_id,
    action_type,
    field_changed,
    old_value_hash,
    new_value_hash,
    actor_user_id,
    additional_context
  ) VALUES (
    p_credit_application_id,
    p_action_type,
    p_field_changed,
    CASE WHEN p_old_value IS NOT NULL THEN encode(sha256(p_old_value::bytea), 'hex') ELSE NULL END,
    CASE WHEN p_new_value IS NOT NULL THEN encode(sha256(p_new_value::bytea), 'hex') ELSE NULL END,
    auth.uid(),
    p_additional_context
  );
END;
$$;