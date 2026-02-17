-- Phase 3 FINAL Critical Security Fix - Remove ALL qual:true policies

-- ============================================================================
-- CRITICAL: Remove policies with qual:true (unrestricted access)
-- ============================================================================

-- Fix action_template_tasks - remove public access policies
DROP POLICY IF EXISTS "Users can view template tasks" ON public.action_template_tasks;
DROP POLICY IF EXISTS "authenticated_users_can_read_action_template_tasks" ON public.action_template_tasks;

-- Fix agent_template_journey_stages - remove unrestricted policy 
DROP POLICY IF EXISTS "Users can manage their own template journey stages" ON public.agent_template_journey_stages;

-- Fix modalities - remove overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view modalities" ON public.modalities;

-- Fix services - remove overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;

-- ============================================================================
-- Create secure, restrictive replacement policies
-- ============================================================================

-- Secure action_template_tasks access
CREATE POLICY "Admin users can view action template tasks" 
ON public.action_template_tasks 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Secure agent_template_journey_stages access
CREATE POLICY "Admin users can manage template journey stages" 
ON public.agent_template_journey_stages 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Secure modalities access
CREATE POLICY "Healthcare professionals can view modalities secure" 
ON public.modalities 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_modalities'::text)
);

-- Services already has a secure policy, but let's ensure no conflicts
-- Remove the overly permissive one and keep the secure one

-- ============================================================================
-- Ensure ALL sensitive tables have RLS enabled
-- ============================================================================

ALTER TABLE public.action_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_template_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Phase 3 FINAL security lockdown complete - all qual:true policies removed