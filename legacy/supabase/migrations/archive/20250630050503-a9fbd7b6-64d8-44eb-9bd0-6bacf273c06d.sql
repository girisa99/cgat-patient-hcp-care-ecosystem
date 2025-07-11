
-- Part 2: Create the comprehensive onboarding system tables and infrastructure

-- Create enums for various categories
CREATE TYPE purchasing_method AS ENUM (
  'just_in_time',
  'bulk_ordering',
  'consignment',
  'drop_ship',
  'blanket_orders'
);

CREATE TYPE inventory_model AS ENUM (
  'traditional_wholesale',
  'consignment',
  'vendor_managed',
  'drop_ship_only',
  'hybrid'
);

CREATE TYPE compliance_program AS ENUM (
  'joint_commission',
  'cap_accreditation',
  'iso_certification',
  'fda_inspection_ready',
  'state_board_compliance'
);

CREATE TYPE technology_integration AS ENUM (
  'edi_integration',
  'api_integration',
  'manual_processes',
  'hybrid_approach'
);

CREATE TYPE sla_tier AS ENUM (
  'standard',
  'priority',
  'critical',
  'emergency_only'
);

CREATE TYPE risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'very_high'
);

-- Purchasing & Inventory Management
CREATE TABLE public.onboarding_purchasing_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  preferred_purchasing_methods purchasing_method[] DEFAULT '{}',
  inventory_management_model inventory_model NOT NULL,
  automated_reordering_enabled BOOLEAN DEFAULT false,
  reorder_points JSONB DEFAULT '{}',
  preferred_order_frequency TEXT,
  inventory_turnover_targets JSONB DEFAULT '{}',
  storage_capacity_details JSONB DEFAULT '{}',
  temperature_controlled_storage BOOLEAN DEFAULT false,
  hazmat_storage_capabilities BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clinical & Regulatory Compliance
CREATE TABLE public.onboarding_compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  required_compliance_programs compliance_program[] DEFAULT '{}',
  quality_assurance_protocols JSONB DEFAULT '{}',
  documentation_requirements JSONB DEFAULT '{}',
  staff_training_requirements JSONB DEFAULT '{}',
  audit_frequency_preferences TEXT,
  regulatory_reporting_needs JSONB DEFAULT '{}',
  patient_safety_protocols JSONB DEFAULT '{}',
  adverse_event_reporting_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Technology Integration Requirements
CREATE TABLE public.onboarding_technology_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  current_ehr_system TEXT,
  current_inventory_system TEXT,
  preferred_integration_method technology_integration NOT NULL,
  api_capabilities JSONB DEFAULT '{}',
  edi_transaction_sets TEXT[] DEFAULT '{}',
  real_time_inventory_tracking BOOLEAN DEFAULT false,
  automated_billing_integration BOOLEAN DEFAULT false,
  reporting_dashboard_requirements JSONB DEFAULT '{}',
  mobile_access_requirements JSONB DEFAULT '{}',
  security_requirements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service Level Agreements
CREATE TABLE public.onboarding_sla_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  delivery_time_requirements JSONB DEFAULT '{}',
  emergency_delivery_needs BOOLEAN DEFAULT false,
  service_tier sla_tier NOT NULL DEFAULT 'standard',
  uptime_requirements DECIMAL(5,2) DEFAULT 99.9,
  response_time_requirements JSONB DEFAULT '{}',
  escalation_procedures JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  penalty_structures JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Financial Risk Assessment
CREATE TABLE public.onboarding_financial_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  annual_revenue_range TEXT,
  credit_score_range TEXT,
  years_in_operation INTEGER,
  debt_to_equity_ratio DECIMAL(10,4),
  current_ratio DECIMAL(10,4),
  days_sales_outstanding INTEGER,
  payment_history_rating TEXT,
  insurance_coverage JSONB DEFAULT '{}',
  financial_guarantees JSONB DEFAULT '{}',
  risk_assessment_score INTEGER,
  risk_level risk_level,
  credit_limit_recommendation DECIMAL(12,2),
  payment_terms_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contract Terms & Negotiations
CREATE TABLE public.onboarding_contract_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  contract_duration_months INTEGER DEFAULT 12,
  auto_renewal_clause BOOLEAN DEFAULT true,
  pricing_structure JSONB DEFAULT '{}',
  volume_discounts JSONB DEFAULT '{}',
  rebate_programs JSONB DEFAULT '{}',
  exclusivity_agreements JSONB DEFAULT '{}',
  termination_clauses JSONB DEFAULT '{}',
  force_majeure_provisions JSONB DEFAULT '{}',
  liability_limitations JSONB DEFAULT '{}',
  intellectual_property_terms JSONB DEFAULT '{}',
  data_protection_clauses JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Management & Approvals
CREATE TABLE public.onboarding_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  completion_date TIMESTAMPTZ,
  required_documents TEXT[] DEFAULT '{}',
  approval_level TEXT,
  escalation_rules JSONB DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced Audit Trail
CREATE TABLE public.onboarding_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  section_affected TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.onboarding_purchasing_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_technology_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_sla_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_financial_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
-- Purchasing Preferences
CREATE POLICY "Users can manage their own purchasing preferences"
  ON public.onboarding_purchasing_preferences FOR ALL
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all purchasing preferences"
  ON public.onboarding_purchasing_preferences FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Compliance Requirements
CREATE POLICY "Users can manage their own compliance requirements"
  ON public.onboarding_compliance_requirements FOR ALL
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all compliance requirements"
  ON public.onboarding_compliance_requirements FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Technology Integration
CREATE POLICY "Users can manage their own technology integration"
  ON public.onboarding_technology_integration FOR ALL
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all technology integration"
  ON public.onboarding_technology_integration FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- SLA Requirements
CREATE POLICY "Users can manage their own SLA requirements"
  ON public.onboarding_sla_requirements FOR ALL
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all SLA requirements"
  ON public.onboarding_sla_requirements FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Financial Assessment (restricted access)
CREATE POLICY "Users can view their own financial assessment"
  ON public.onboarding_financial_assessment FOR SELECT
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Only finance team can manage financial assessments"
  ON public.onboarding_financial_assessment FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin') OR public.has_role(auth.uid(), 'financeTeam'));

-- Contract Terms (restricted access)
CREATE POLICY "Users can view their own contract terms"
  ON public.onboarding_contract_terms FOR SELECT
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Only contract team can manage contract terms"
  ON public.onboarding_contract_terms FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin') OR public.has_role(auth.uid(), 'contractTeam'));

-- Workflow Steps
CREATE POLICY "Users can view workflow steps for their applications"
  ON public.onboarding_workflow_steps FOR SELECT
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Assigned users can update workflow steps"
  ON public.onboarding_workflow_steps FOR UPDATE
  USING (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Workflow managers can manage all workflow steps"
  ON public.onboarding_workflow_steps FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin') OR public.has_role(auth.uid(), 'workflowManager'));

-- Audit Trail (read-only for most users)
CREATE POLICY "Users can view audit trail for their applications"
  ON public.onboarding_audit_trail FOR SELECT
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "System can insert audit records"
  ON public.onboarding_audit_trail FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can manage audit trail"
  ON public.onboarding_audit_trail FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

-- Create indexes for performance
CREATE INDEX idx_onboarding_purchasing_preferences_onboarding_id ON public.onboarding_purchasing_preferences(onboarding_id);
CREATE INDEX idx_onboarding_compliance_requirements_onboarding_id ON public.onboarding_compliance_requirements(onboarding_id);
CREATE INDEX idx_onboarding_technology_integration_onboarding_id ON public.onboarding_technology_integration(onboarding_id);
CREATE INDEX idx_onboarding_sla_requirements_onboarding_id ON public.onboarding_sla_requirements(onboarding_id);
CREATE INDEX idx_onboarding_financial_assessment_onboarding_id ON public.onboarding_financial_assessment(onboarding_id);
CREATE INDEX idx_onboarding_contract_terms_onboarding_id ON public.onboarding_contract_terms(onboarding_id);
CREATE INDEX idx_onboarding_workflow_steps_onboarding_id ON public.onboarding_workflow_steps(onboarding_id);
CREATE INDEX idx_onboarding_workflow_steps_assigned_to ON public.onboarding_workflow_steps(assigned_to);
CREATE INDEX idx_onboarding_workflow_steps_status ON public.onboarding_workflow_steps(status);
CREATE INDEX idx_onboarding_audit_trail_onboarding_id ON public.onboarding_audit_trail(onboarding_id);
CREATE INDEX idx_onboarding_audit_trail_created_at ON public.onboarding_audit_trail(created_at);

-- Add updated_at triggers
CREATE TRIGGER update_onboarding_purchasing_preferences_updated_at
  BEFORE UPDATE ON public.onboarding_purchasing_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_compliance_requirements_updated_at
  BEFORE UPDATE ON public.onboarding_compliance_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_technology_integration_updated_at
  BEFORE UPDATE ON public.onboarding_technology_integration
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_sla_requirements_updated_at
  BEFORE UPDATE ON public.onboarding_sla_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_financial_assessment_updated_at
  BEFORE UPDATE ON public.onboarding_financial_assessment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_contract_terms_updated_at
  BEFORE UPDATE ON public.onboarding_contract_terms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_workflow_steps_updated_at
  BEFORE UPDATE ON public.onboarding_workflow_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit triggers for change tracking
CREATE TRIGGER audit_onboarding_purchasing_preferences
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_purchasing_preferences
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_compliance_requirements
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_compliance_requirements
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_technology_integration
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_technology_integration
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_sla_requirements
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_sla_requirements
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_financial_assessment
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_financial_assessment
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_contract_terms
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_contract_terms
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_workflow_steps
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_workflow_steps
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create specialized functions for onboarding workflow management
CREATE OR REPLACE FUNCTION public.initialize_onboarding_workflow(
  p_onboarding_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert standard workflow steps
  INSERT INTO public.onboarding_workflow_steps (onboarding_id, step_name, step_type, step_order, approval_level)
  VALUES 
    (p_onboarding_id, 'Initial Review', 'review', 1, 'level_1'),
    (p_onboarding_id, 'Credit Assessment', 'assessment', 2, 'level_2'),
    (p_onboarding_id, 'Compliance Verification', 'verification', 3, 'level_2'),
    (p_onboarding_id, 'Contract Negotiation', 'negotiation', 4, 'level_3'),
    (p_onboarding_id, 'Final Approval', 'approval', 5, 'level_4'),
    (p_onboarding_id, 'Account Setup', 'setup', 6, 'level_2'),
    (p_onboarding_id, 'Integration Testing', 'testing', 7, 'level_2'),
    (p_onboarding_id, 'Go-Live', 'activation', 8, 'level_3');
END;
$$;

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION public.calculate_financial_risk_score(
  p_annual_revenue_range TEXT,
  p_years_in_operation INTEGER,
  p_debt_to_equity_ratio DECIMAL,
  p_current_ratio DECIMAL,
  p_days_sales_outstanding INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  risk_score INTEGER := 0;
BEGIN
  -- Revenue scoring (higher revenue = lower risk)
  CASE p_annual_revenue_range
    WHEN 'under_1m' THEN risk_score := risk_score + 30;
    WHEN '1m_to_5m' THEN risk_score := risk_score + 20;
    WHEN '5m_to_25m' THEN risk_score := risk_score + 10;
    WHEN '25m_to_100m' THEN risk_score := risk_score + 5;
    WHEN 'over_100m' THEN risk_score := risk_score + 0;
  END CASE;

  -- Years in operation (more years = lower risk)
  IF p_years_in_operation < 2 THEN
    risk_score := risk_score + 25;
  ELSIF p_years_in_operation < 5 THEN
    risk_score := risk_score + 15;
  ELSIF p_years_in_operation < 10 THEN
    risk_score := risk_score + 10;
  ELSE
    risk_score := risk_score + 0;
  END IF;

  -- Debt to equity ratio (higher ratio = higher risk)
  IF p_debt_to_equity_ratio > 2.0 THEN
    risk_score := risk_score + 20;
  ELSIF p_debt_to_equity_ratio > 1.0 THEN
    risk_score := risk_score + 10;
  ELSIF p_debt_to_equity_ratio > 0.5 THEN
    risk_score := risk_score + 5;
  END IF;

  -- Current ratio (lower ratio = higher risk)
  IF p_current_ratio < 1.0 THEN
    risk_score := risk_score + 20;
  ELSIF p_current_ratio < 1.5 THEN
    risk_score := risk_score + 10;
  ELSIF p_current_ratio < 2.0 THEN
    risk_score := risk_score + 5;
  END IF;

  -- Days sales outstanding (higher DSO = higher risk)
  IF p_days_sales_outstanding > 60 THEN
    risk_score := risk_score + 15;
  ELSIF p_days_sales_outstanding > 45 THEN
    risk_score := risk_score + 10;
  ELSIF p_days_sales_outstanding > 30 THEN
    risk_score := risk_score + 5;
  END IF;

  RETURN LEAST(risk_score, 100); -- Cap at 100
END;
$$;

-- Function to determine risk level from score
CREATE OR REPLACE FUNCTION public.determine_risk_level(p_risk_score INTEGER)
RETURNS risk_level
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_risk_score <= 25 THEN
    RETURN 'low'::risk_level;
  ELSIF p_risk_score <= 50 THEN
    RETURN 'medium'::risk_level;
  ELSIF p_risk_score <= 75 THEN
    RETURN 'high'::risk_level;
  ELSE
    RETURN 'very_high'::risk_level;
  END IF;
END;
$$;

-- Function to log onboarding audit trail
CREATE OR REPLACE FUNCTION public.log_onboarding_audit(
  p_onboarding_id UUID,
  p_action_type TEXT,
  p_action_description TEXT,
  p_section_affected TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.onboarding_audit_trail (
    onboarding_id,
    user_id,
    action_type,
    action_description,
    section_affected,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    p_onboarding_id,
    auth.uid(),
    p_action_type,
    p_action_description,
    p_section_affected,
    p_old_values,
    p_new_values,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet
      ELSE NULL 
    END,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN current_setting('request.headers', true)::json->>'user-agent'
      ELSE NULL 
    END
  );
END;
$$;
