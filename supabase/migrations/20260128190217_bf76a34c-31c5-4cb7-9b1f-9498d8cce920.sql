-- P5: Legal Acceptance Tracking Infrastructure
-- =============================================
-- Tracks user acceptance of Terms of Service, Privacy Policy, Cookie Policy

-- Legal document versions table
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('terms_of_service', 'privacy_policy', 'cookie_policy', 'data_processing_agreement', 'baa')),
  version TEXT NOT NULL DEFAULT '1.0',
  content_hash TEXT, -- For tracking if document changed
  effective_date TIMESTAMPTZ DEFAULT now(),
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User legal acceptances table
CREATE TABLE IF NOT EXISTS public.user_legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('terms_of_service', 'privacy_policy', 'cookie_policy', 'data_processing_agreement', 'baa')),
  document_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  acceptance_method TEXT DEFAULT 'click' CHECK (acceptance_method IN ('click', 'checkbox', 'signature', 'api')),
  is_valid BOOLEAN DEFAULT true, -- Can be invalidated if user revokes or new version required
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, document_type, document_version)
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_legal_acceptances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_documents (read-only for users, admin can manage)
CREATE POLICY "Users can view current legal documents"
  ON public.legal_documents FOR SELECT
  USING (is_current = true);

-- RLS Policies for user_legal_acceptances
CREATE POLICY "Users can view their own acceptances"
  ON public.user_legal_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acceptances"
  ON public.user_legal_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own acceptances"
  ON public.user_legal_acceptances FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_id ON public.user_legal_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_document_type ON public.user_legal_acceptances(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_type_current ON public.legal_documents(document_type, is_current);

-- Function to check if user has accepted all required documents
CREATE OR REPLACE FUNCTION public.check_user_legal_compliance(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_tos_accepted BOOLEAN := false;
  v_privacy_accepted BOOLEAN := false;
  v_cookie_accepted BOOLEAN := false;
BEGIN
  -- Check Terms of Service
  SELECT EXISTS (
    SELECT 1 FROM user_legal_acceptances 
    WHERE user_id = p_user_id 
      AND document_type = 'terms_of_service' 
      AND is_valid = true
  ) INTO v_tos_accepted;
  
  -- Check Privacy Policy
  SELECT EXISTS (
    SELECT 1 FROM user_legal_acceptances 
    WHERE user_id = p_user_id 
      AND document_type = 'privacy_policy' 
      AND is_valid = true
  ) INTO v_privacy_accepted;
  
  -- Check Cookie Policy
  SELECT EXISTS (
    SELECT 1 FROM user_legal_acceptances 
    WHERE user_id = p_user_id 
      AND document_type = 'cookie_policy' 
      AND is_valid = true
  ) INTO v_cookie_accepted;
  
  v_result := json_build_object(
    'user_id', p_user_id,
    'terms_of_service', v_tos_accepted,
    'privacy_policy', v_privacy_accepted,
    'cookie_policy', v_cookie_accepted,
    'all_accepted', (v_tos_accepted AND v_privacy_accepted),
    'checked_at', now()
  );
  
  RETURN v_result;
END;
$$;

-- Function to record legal acceptance
CREATE OR REPLACE FUNCTION public.record_legal_acceptance(
  p_user_id UUID,
  p_document_type TEXT,
  p_version TEXT DEFAULT '1.0',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_method TEXT DEFAULT 'click'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acceptance_id UUID;
BEGIN
  INSERT INTO user_legal_acceptances (
    user_id, document_type, document_version, ip_address, user_agent, acceptance_method
  ) VALUES (
    p_user_id, p_document_type, p_version, p_ip_address, p_user_agent, p_method
  )
  ON CONFLICT (user_id, document_type, document_version) 
  DO UPDATE SET 
    is_valid = true,
    revoked_at = NULL,
    accepted_at = now()
  RETURNING id INTO v_acceptance_id;
  
  RETURN json_build_object(
    'success', true,
    'acceptance_id', v_acceptance_id,
    'document_type', p_document_type,
    'version', p_version,
    'accepted_at', now()
  );
END;
$$;