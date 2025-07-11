
-- First, let's check what data exists in our external_api_endpoints table
SELECT 
    eae.id,
    eae.external_api_id,
    eae.internal_endpoint_id,
    eae.external_path,
    eae.method,
    eae.summary,
    eae.description,
    eae.created_at
FROM external_api_endpoints eae
ORDER BY eae.created_at DESC;

-- Check the external_api_registry entries and their relationship to internal APIs
SELECT 
    ear.id as external_api_id,
    ear.external_name,
    ear.internal_api_id,
    ear.status,
    ear.visibility,
    ear.created_at,
    ear.published_at
FROM external_api_registry ear
WHERE ear.status = 'published'
ORDER BY ear.created_at DESC;

-- Check if we have any internal API integration registry entries
SELECT 
    air.id,
    air.name,
    air.description,
    air.type,
    air.direction,
    air.status,
    air.endpoints_count,
    air.created_at
FROM api_integration_registry air
ORDER BY air.created_at DESC;

-- Check for any API lifecycle events that might show sync activity
SELECT 
    ale.id,
    ale.api_integration_id,
    ale.event_type,
    ale.description,
    ale.created_at
FROM api_lifecycle_events ale
ORDER BY ale.created_at DESC
LIMIT 10;

-- Cross-check: Find external APIs with their endpoint counts
SELECT 
    ear.id as external_api_id,
    ear.external_name,
    ear.internal_api_id,
    COUNT(eae.id) as actual_endpoints_count
FROM external_api_registry ear
LEFT JOIN external_api_endpoints eae ON ear.id = eae.external_api_id
WHERE ear.status = 'published'
GROUP BY ear.id, ear.external_name, ear.internal_api_id
ORDER BY ear.created_at DESC;

-- Check if there are any API consumption or usage logs that might indicate endpoint activity
SELECT 
    acl.id,
    acl.api_integration_id,
    acl.endpoint_path,
    acl.method,
    acl.request_timestamp
FROM api_consumption_logs acl
ORDER BY acl.request_timestamp DESC
LIMIT 5;
