-- Fix Function Search Path issues for trigger functions
-- These functions need search_path set for security

-- Fix update_app_configuration_updated_at
CREATE OR REPLACE FUNCTION public.update_app_configuration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_document_type_configs_updated_at
CREATE OR REPLACE FUNCTION public.update_document_type_configs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_newsletter_updated_at
CREATE OR REPLACE FUNCTION public.update_newsletter_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Note: The vector extension functions (subvector, ivfflathandler, hnswhandler, etc.) 
-- are C language functions from the pgvector extension and cannot be modified.
-- The extension itself is installed in public schema which is a common pattern for pgvector.

-- Add comment documenting the security consideration
COMMENT ON EXTENSION vector IS 'pgvector extension for vector similarity search - installed in public schema as required by the extension';

-- Create a schema for future extensions if needed (optional best practice)
CREATE SCHEMA IF NOT EXISTS extensions;
COMMENT ON SCHEMA extensions IS 'Schema for database extensions - new extensions should be installed here';