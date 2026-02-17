-- ============================================================
-- HIPAA Certification & Data Residency Controls
-- P5 Commercialization - Compliance Infrastructure
-- ============================================================

-- 1. HIPAA Certification Status Table (user-scoped, not workspace-scoped)
CREATE TABLE public.hipaa_certification_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Certification Status
  certification_level TEXT NOT NULL DEFAULT 'none' CHECK (certification_level IN ('none', 'pending', 'basic', 'full', 'enterprise')),
  baa_signed BOOLEAN DEFAULT false,
  baa_signed_at TIMESTAMPTZ,
  baa_document_url TEXT,
  
  -- Compliance Checks
  encryption_at_rest_enabled BOOLEAN DEFAULT false,
  encryption_in_transit_enabled BOOLEAN DEFAULT false,
  audit_logging_enabled BOOLEAN DEFAULT false,
  access_controls_configured BOOLEAN DEFAULT false,
  phi_handling_trained BOOLEAN DEFAULT false,
  breach_notification_plan BOOLEAN DEFAULT false,
  
  -- Audit Trail
  last_audit_date TIMESTAMPTZ,
  next_audit_due TIMESTAMPTZ,
  audit_score INTEGER CHECK (audit_score >= 0 AND audit_score <= 100),
  audit_findings JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 2. HIPAA Audit Log (Immutable for compliance)
CREATE TABLE public.hipaa_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'phi_access', 'phi_create', 'phi_update', 'phi_delete', 'phi_export',
    'login', 'logout', 'failed_login', 'password_change', 'role_change',
    'consent_given', 'consent_revoked', 'data_request', 'data_deletion',
    'baa_signed', 'certification_change', 'audit_performed', 'breach_detected'
  )),
  event_description TEXT NOT NULL,
  
  -- Context
  resource_type TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Immutable timestamp (no updates allowed)
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Extra metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Data Residency Configuration
CREATE TABLE public.data_residency_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Region Configuration
  primary_region TEXT NOT NULL DEFAULT 'us-east-1' CHECK (primary_region IN (
    'us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 
    'ap-southeast-1', 'ap-northeast-1', 'ap-south-1',
    'me-south-1', 'af-south-1', 'sa-east-1'
  )),
  allowed_regions TEXT[] DEFAULT ARRAY['us-east-1'],
  restricted_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Compliance Flags
  gdpr_compliant BOOLEAN DEFAULT false,
  hipaa_compliant BOOLEAN DEFAULT false,
  ccpa_compliant BOOLEAN DEFAULT false,
  data_sovereignty_required BOOLEAN DEFAULT false,
  
  -- Cross-border Transfer Rules
  cross_border_transfers_allowed BOOLEAN DEFAULT true,
  transfer_requires_consent BOOLEAN DEFAULT false,
  sccs_in_place BOOLEAN DEFAULT false,
  
  -- Data Retention
  retention_policy_days INTEGER DEFAULT 365,
  auto_delete_enabled BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 4. Data Residency Audit Trail
CREATE TABLE public.data_residency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'region_changed', 'cross_border_transfer', 'data_exported',
    'gdpr_request', 'deletion_request', 'consent_updated',
    'compliance_check', 'policy_violation'
  )),
  
  from_region TEXT,
  to_region TEXT,
  event_details JSONB DEFAULT '{}'::jsonb,
  
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.hipaa_certification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hipaa_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_residency_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_residency_events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for HIPAA Certification
CREATE POLICY "Users can view own HIPAA status"
  ON public.hipaa_certification_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own HIPAA status"
  ON public.hipaa_certification_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own HIPAA status"
  ON public.hipaa_certification_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. RLS Policies for HIPAA Audit Log
CREATE POLICY "Users can view own audit logs"
  ON public.hipaa_audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
  ON public.hipaa_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. RLS Policies for Data Residency
CREATE POLICY "Users can view own residency config"
  ON public.data_residency_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own residency config"
  ON public.data_residency_config FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own residency events"
  ON public.data_residency_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert residency events"
  ON public.data_residency_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9. Indexes for performance
CREATE INDEX idx_hipaa_certification_user ON public.hipaa_certification_status(user_id);
CREATE INDEX idx_hipaa_audit_user ON public.hipaa_audit_log(user_id);
CREATE INDEX idx_hipaa_audit_event_type ON public.hipaa_audit_log(event_type);
CREATE INDEX idx_hipaa_audit_occurred ON public.hipaa_audit_log(occurred_at DESC);
CREATE INDEX idx_data_residency_user ON public.data_residency_config(user_id);
CREATE INDEX idx_data_residency_events_user ON public.data_residency_events(user_id);

-- 10. Triggers for updated_at
CREATE TRIGGER update_hipaa_certification_updated_at
  BEFORE UPDATE ON public.hipaa_certification_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_residency_updated_at
  BEFORE UPDATE ON public.data_residency_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Function to auto-log HIPAA events (security definer)
CREATE OR REPLACE FUNCTION public.log_hipaa_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_description TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.hipaa_audit_log (
    user_id, event_type, event_description,
    resource_type, resource_id, metadata
  ) VALUES (
    p_user_id, p_event_type, p_description,
    p_resource_type, p_resource_id, p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 12. Function to calculate HIPAA compliance score
CREATE OR REPLACE FUNCTION public.calculate_hipaa_compliance_score(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
  v_status RECORD;
BEGIN
  SELECT * INTO v_status FROM public.hipaa_certification_status WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Score calculation (each item worth points)
  IF v_status.baa_signed THEN v_score := v_score + 20; END IF;
  IF v_status.encryption_at_rest_enabled THEN v_score := v_score + 15; END IF;
  IF v_status.encryption_in_transit_enabled THEN v_score := v_score + 15; END IF;
  IF v_status.audit_logging_enabled THEN v_score := v_score + 15; END IF;
  IF v_status.access_controls_configured THEN v_score := v_score + 15; END IF;
  IF v_status.phi_handling_trained THEN v_score := v_score + 10; END IF;
  IF v_status.breach_notification_plan THEN v_score := v_score + 10; END IF;
  
  RETURN v_score;
END;
$$;

-- 13. Function to log data residency events
CREATE OR REPLACE FUNCTION public.log_residency_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_from_region TEXT DEFAULT NULL,
  p_to_region TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.data_residency_events (
    user_id, event_type, from_region, to_region, event_details
  ) VALUES (
    p_user_id, p_event_type, p_from_region, p_to_region, p_details
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;