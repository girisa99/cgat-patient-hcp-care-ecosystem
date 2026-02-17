-- Fix security warnings by setting search paths for the new functions
ALTER FUNCTION public.update_provider_enrollments_updated_at() SET search_path = public;
ALTER FUNCTION public.update_treatment_center_enrollments_updated_at() SET search_path = public;
ALTER FUNCTION public.update_referral_network_enrollments_updated_at() SET search_path = public;