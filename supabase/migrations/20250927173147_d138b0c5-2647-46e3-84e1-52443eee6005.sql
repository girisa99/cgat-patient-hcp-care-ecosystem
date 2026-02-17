-- CRITICAL SECURITY FIX: Restrict access to sensitive system configuration data
-- Fix for node_config_templates table - contains AI model settings, API endpoints, etc.

-- Drop the overly permissive policy that allows public access to active templates
DROP POLICY IF EXISTS "Users can view active templates" ON public.node_config_templates;

-- Create secure policies that only allow access to authorized users
CREATE POLICY "Admin users can view all templates" 
ON public.node_config_templates FOR SELECT 
USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view their own templates" 
ON public.node_config_templates FOR SELECT 
USING (auth.uid() = created_by);

-- INFO SECURITY FIX: Restrict business metrics access
-- Fix for site_stats table - contains sensitive business metrics

-- Drop the public access policy
DROP POLICY IF EXISTS "Anyone can view site stats" ON public.site_stats;

-- Create restricted access for authenticated users only
CREATE POLICY "Authenticated users can view site stats" 
ON public.site_stats FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- SECURITY FIX: Update functions with proper search_path settings without dropping them
-- This fixes the "Function Search Path Mutable" security warnings

-- Update is_admin_user with secure search_path (keeping existing signature)
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'onboardingTeam')
  );
$$;

-- Update is_admin_user_safe with secure search_path (keeping existing signature)
CREATE OR REPLACE FUNCTION public.is_admin_user_safe(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'onboardingTeam')
  );
$$;