
-- Enable real-time sync for facilities and modules tables
ALTER TABLE public.facilities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;

ALTER TABLE public.modules REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.modules;

-- Consolidate api_change_tracking into api_lifecycle_events by migrating data and dropping the redundant table
-- First, migrate any existing data from api_change_tracking to api_lifecycle_events
INSERT INTO public.api_lifecycle_events (
  api_integration_id,
  event_type,
  description,
  impact_level,
  metadata,
  created_at
)
SELECT 
  -- Try to find matching API integration by name, fallback to a default UUID if not found
  COALESCE(
    (SELECT id FROM public.api_integration_registry WHERE name = act.api_name LIMIT 1),
    gen_random_uuid()
  ) as api_integration_id,
  CASE 
    WHEN act.type = 'integration' THEN 'integration_registered'
    WHEN act.type = 'module' THEN 'module_added'
    ELSE act.type
  END as event_type,
  CONCAT('Migrated from api_change_tracking: ', act.api_name) as description,
  CASE 
    WHEN act.impact_assessment->>'impact_level' IS NOT NULL 
    THEN act.impact_assessment->>'impact_level'
    ELSE 'low'
  END as impact_level,
  jsonb_build_object(
    'original_data', act.impact_assessment,
    'direction', act.direction,
    'lifecycle_stage', act.lifecycle_stage,
    'migration_notes', act.migration_notes,
    'migrated_from', 'api_change_tracking'
  ) as metadata,
  act.created_at
FROM public.api_change_tracking act
WHERE NOT EXISTS (
  SELECT 1 FROM public.api_lifecycle_events ale 
  WHERE ale.metadata->>'migrated_from' = 'api_change_tracking'
  AND ale.metadata->>'original_api_name' = act.api_name
);

-- Drop the redundant api_change_tracking table
DROP TABLE IF EXISTS public.api_change_tracking CASCADE;

-- Add database indexes for better API performance
CREATE INDEX IF NOT EXISTS idx_api_integration_registry_status_category ON public.api_integration_registry(status, category);
CREATE INDEX IF NOT EXISTS idx_api_integration_registry_direction_lifecycle ON public.api_integration_registry(direction, lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_external_api_registry_status_visibility ON public.external_api_registry(status, visibility);
CREATE INDEX IF NOT EXISTS idx_api_lifecycle_events_integration_type ON public.api_lifecycle_events(api_integration_id, event_type);
CREATE INDEX IF NOT EXISTS idx_api_lifecycle_events_created_at ON public.api_lifecycle_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_api_endpoints_api_method ON public.external_api_endpoints(external_api_id, method);
CREATE INDEX IF NOT EXISTS idx_api_consumption_logs_timestamp ON public.api_consumption_logs(request_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_analytics_timestamp ON public.api_usage_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_developer_notifications_user_read ON public.developer_notifications(user_id, is_read);

-- Review marketplace tables - they appear to be actively used, so we'll optimize rather than remove
-- Add performance indexes for marketplace tables
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status_category ON public.marketplace_listings(listing_status, category);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON public.marketplace_listings(featured, featured_order) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_developer_applications_status ON public.developer_applications(status);
CREATE INDEX IF NOT EXISTS idx_developer_portal_applications_status ON public.developer_portal_applications(status);

-- Optimize user-related indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_assignments_user_active ON public.user_module_assignments(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_facility_access_user_active ON public.user_facility_access(user_id, is_active);
