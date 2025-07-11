
-- Check what values are allowed for the purpose column in api_integration_registry
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'api_integration_registry_purpose_check';

-- Also check the column details
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'api_integration_registry' 
AND column_name = 'purpose';

-- Check if there's an enum type for purpose
SELECT t.typname, e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%purpose%';
