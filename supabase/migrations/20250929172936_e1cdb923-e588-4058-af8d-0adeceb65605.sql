-- Fix search_path for new Genie tracking functions (drop triggers first)

-- Drop triggers first
DROP TRIGGER IF EXISTS update_genie_conversation_analytics_updated_at ON public.genie_conversation_analytics;
DROP TRIGGER IF EXISTS update_genie_rate_limits_updated_at ON public.genie_rate_limits;
DROP TRIGGER IF EXISTS update_genie_ip_tracking_updated_at ON public.genie_ip_tracking;
DROP TRIGGER IF EXISTS update_genie_deployments_updated_at ON public.genie_deployments;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_genie_conversation_analytics();
DROP FUNCTION IF EXISTS public.update_genie_rate_limits();
DROP FUNCTION IF EXISTS public.update_genie_ip_tracking();
DROP FUNCTION IF EXISTS public.update_genie_deployments();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_genie_conversation_analytics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_genie_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_genie_ip_tracking()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_genie_deployments()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_genie_conversation_analytics_updated_at
  BEFORE UPDATE ON public.genie_conversation_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_conversation_analytics();

CREATE TRIGGER update_genie_rate_limits_updated_at
  BEFORE UPDATE ON public.genie_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_rate_limits();

CREATE TRIGGER update_genie_ip_tracking_updated_at
  BEFORE UPDATE ON public.genie_ip_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_ip_tracking();

CREATE TRIGGER update_genie_deployments_updated_at
  BEFORE UPDATE ON public.genie_deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_deployments();