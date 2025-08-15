-- Fix Security Issues: Enable RLS on publicly readable tables
-- This will restrict access to authenticated users only, preserving all existing functionality

-- Healthcare/Clinical Data Tables (Issue 1)
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;

-- Business Operations Tables (Issue 2)
ALTER TABLE public.action_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_providers ENABLE ROW LEVEL SECURITY;

-- Customer Onboarding Table (Issue 3)
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;

-- Create safe policies for authenticated users to access these tables
-- Healthcare/Clinical Data - Read access for authenticated users
CREATE POLICY "authenticated_users_can_read_commercial_products" ON public.commercial_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_clinical_trials" ON public.clinical_trials FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_manufacturers" ON public.manufacturers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_therapies" ON public.therapies FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_modalities" ON public.modalities FOR SELECT TO authenticated USING (true);

-- Business Operations - Read access for authenticated users
CREATE POLICY "authenticated_users_can_read_action_templates" ON public.action_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_action_template_tasks" ON public.action_template_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_agent_templates" ON public.agent_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_mcp_servers" ON public.mcp_servers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_service_providers" ON public.service_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_users_can_read_voice_providers" ON public.voice_providers FOR SELECT TO authenticated USING (true);

-- Customer Onboarding - More restrictive, users can only see their own data
CREATE POLICY "users_can_read_own_onboarding_data" ON public.treatment_center_onboarding FOR SELECT TO authenticated USING (auth.uid() = user_id);