
-- Add new columns to existing treatment_center_onboarding table for simple fields
ALTER TABLE public.treatment_center_onboarding 
ADD COLUMN operational_hours jsonb DEFAULT '{}',
ADD COLUMN payment_terms_preference text,
ADD COLUMN preferred_payment_methods text[] DEFAULT '{}',
ADD COLUMN is_340b_entity boolean DEFAULT false,
ADD COLUMN gpo_memberships text[] DEFAULT '{}';

-- Create table for online platform users
CREATE TABLE public.onboarding_platform_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('primary_admin', 'secondary_admin', 'ordering_user', 'receiving_user', 'accounting_user')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  access_level text NOT NULL CHECK (access_level IN ('full', 'limited', 'view_only')),
  can_place_orders boolean DEFAULT false,
  can_manage_users boolean DEFAULT false,
  can_view_reports boolean DEFAULT false,
  notification_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create table for 340B program details
CREATE TABLE public.onboarding_340b_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  program_type text NOT NULL CHECK (program_type IN ('hospital', 'fqhc', 'ryan_white', 'other')),
  registration_number text NOT NULL,
  parent_entity_name text,
  contract_pharmacy_locations text[] DEFAULT '{}',
  eligible_drug_categories text[] DEFAULT '{}',
  compliance_contact_name text,
  compliance_contact_email text,
  compliance_contact_phone text,
  audit_requirements jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create table for GPO membership details  
CREATE TABLE public.onboarding_gpo_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  gpo_name text NOT NULL,
  membership_number text,
  contract_effective_date date,
  contract_expiration_date date,
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_phone text,
  covered_categories text[] DEFAULT '{}',
  tier_level text,
  rebate_information jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create table for enhanced payment terms
CREATE TABLE public.onboarding_payment_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES public.treatment_center_onboarding(id) ON DELETE CASCADE,
  preferred_terms text NOT NULL CHECK (preferred_terms IN ('net_30', 'net_60', 'net_90', '2_10_net_30', 'cod', 'prepay')),
  credit_limit_requested numeric,
  payment_method text NOT NULL CHECK (payment_method IN ('ach', 'wire', 'check', 'credit_card')),
  early_payment_discount_interest boolean DEFAULT false,
  consolidation_preferences jsonb DEFAULT '{}',
  billing_frequency text CHECK (billing_frequency IN ('daily', 'weekly', 'monthly')),
  created_at timestamptz DEFAULT now()
);

-- Add RLS policies for all new tables
ALTER TABLE public.onboarding_platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_340b_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_gpo_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_payment_terms ENABLE ROW LEVEL SECURITY;

-- Create policies for platform users table
CREATE POLICY "Users can view their own platform users" 
  ON public.onboarding_platform_users FOR SELECT 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own platform users" 
  ON public.onboarding_platform_users FOR INSERT 
  WITH CHECK (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own platform users" 
  ON public.onboarding_platform_users FOR UPDATE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own platform users" 
  ON public.onboarding_platform_users FOR DELETE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

-- Create policies for 340B programs table
CREATE POLICY "Users can view their own 340B programs" 
  ON public.onboarding_340b_programs FOR SELECT 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own 340B programs" 
  ON public.onboarding_340b_programs FOR INSERT 
  WITH CHECK (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own 340B programs" 
  ON public.onboarding_340b_programs FOR UPDATE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own 340B programs" 
  ON public.onboarding_340b_programs FOR DELETE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

-- Create policies for GPO memberships table
CREATE POLICY "Users can view their own GPO memberships" 
  ON public.onboarding_gpo_memberships FOR SELECT 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own GPO memberships" 
  ON public.onboarding_gpo_memberships FOR INSERT 
  WITH CHECK (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own GPO memberships" 
  ON public.onboarding_gpo_memberships FOR UPDATE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own GPO memberships" 
  ON public.onboarding_gpo_memberships FOR DELETE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

-- Create policies for payment terms table
CREATE POLICY "Users can view their own payment terms" 
  ON public.onboarding_payment_terms FOR SELECT 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own payment terms" 
  ON public.onboarding_payment_terms FOR INSERT 
  WITH CHECK (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own payment terms" 
  ON public.onboarding_payment_terms FOR UPDATE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own payment terms" 
  ON public.onboarding_payment_terms FOR DELETE 
  USING (onboarding_id IN (SELECT id FROM public.treatment_center_onboarding WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_onboarding_platform_users_onboarding_id ON public.onboarding_platform_users(onboarding_id);
CREATE INDEX idx_onboarding_340b_programs_onboarding_id ON public.onboarding_340b_programs(onboarding_id);
CREATE INDEX idx_onboarding_gpo_memberships_onboarding_id ON public.onboarding_gpo_memberships(onboarding_id);
CREATE INDEX idx_onboarding_payment_terms_onboarding_id ON public.onboarding_payment_terms(onboarding_id);

-- Add audit triggers for the new tables
CREATE TRIGGER audit_onboarding_platform_users
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_platform_users
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_340b_programs
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_340b_programs
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_gpo_memberships
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_gpo_memberships
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_onboarding_payment_terms
  AFTER INSERT OR UPDATE OR DELETE ON public.onboarding_payment_terms
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
