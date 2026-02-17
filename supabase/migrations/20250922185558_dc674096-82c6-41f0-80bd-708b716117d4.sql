-- Populate enrollment_patient_info table with basic data from existing enrollments
-- This will create default patient info records so dashboard shows real enrollment data

-- First, let's create basic patient info records for existing enrollments that don't have patient info
INSERT INTO public.enrollment_patient_info (
  enrollment_id,
  first_name,
  last_name,
  email,
  phone,
  created_at,
  updated_at
)
SELECT DISTINCT
  pe.id as enrollment_id,
  'Patient' as first_name,
  CASE 
    WHEN pe.session_id LIKE 'mcp-%' THEN 'MCP-' || SUBSTRING(pe.session_id FROM 5 FOR 6)
    WHEN pe.session_id LIKE 'diagnostic-%' THEN 'Test-' || SUBSTRING(pe.session_id FROM 12 FOR 6)
    ELSE 'Enrollment-' || SUBSTRING(pe.id::text FROM 1 FOR 8)
  END as last_name,
  COALESCE(
    CASE 
      WHEN pe.enrollment_source = 'mcp' THEN 'mcp.patient@enrollment.local'
      WHEN pe.enrollment_source = 'diagnostic_test' THEN 'test.patient@enrollment.local'
      ELSE 'patient@enrollment.local'
    END
  ) as email,
  '' as phone,
  pe.created_at,
  pe.updated_at
FROM public.patient_enrollments pe
LEFT JOIN public.enrollment_patient_info epi ON pe.id = epi.enrollment_id
WHERE epi.enrollment_id IS NULL
  AND pe.is_active = true
ON CONFLICT (enrollment_id) DO NOTHING;