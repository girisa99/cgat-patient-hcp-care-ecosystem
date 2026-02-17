-- Clean up empty draft applications that have no company information
DELETE FROM treatment_center_onboarding 
WHERE status = 'draft' 
  AND (legal_name IS NULL OR legal_name = '') 
  AND (dba_name IS NULL OR dba_name = '');