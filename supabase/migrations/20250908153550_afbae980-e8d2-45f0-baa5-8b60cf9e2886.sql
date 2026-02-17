-- Critical fix: reduce seq scans by indexing foreign keys on onboarding tables
CREATE INDEX IF NOT EXISTS idx_onboarding_additional_licenses_onboarding_id ON onboarding_additional_licenses(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_controlling_entities_onboarding_id ON onboarding_controlling_entities(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_document_uploads_onboarding_id ON onboarding_document_uploads(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_principal_owners_onboarding_id ON onboarding_principal_owners(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_references_onboarding_id ON onboarding_references(onboarding_id);

-- Update stats so planner picks the new indexes
ANALYZE onboarding_additional_licenses;
ANALYZE onboarding_controlling_entities;
ANALYZE onboarding_document_uploads;
ANALYZE onboarding_principal_owners;
ANALYZE onboarding_references;