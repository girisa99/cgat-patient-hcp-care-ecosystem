-- Fix the remaining function with missing search_path

CREATE OR REPLACE FUNCTION public.search_medical_imaging_knowledge(
    query_embedding vector, 
    filter_modality text DEFAULT NULL::text, 
    match_threshold double precision DEFAULT 0.7, 
    match_count integer DEFAULT 5
)
RETURNS TABLE(
    id uuid, 
    modality text, 
    finding_name text, 
    description text, 
    clinical_significance text, 
    key_features jsonb, 
    dataset_source text, 
    similarity double precision
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    mik.id,
    mik.modality,
    mik.finding_name,
    mik.description,
    mik.clinical_significance,
    mik.key_features,
    mik.dataset_source,
    1 - (mik.embedding <=> query_embedding) AS similarity
  FROM public.medical_imaging_knowledge mik
  WHERE 
    (filter_modality IS NULL OR mik.modality = filter_modality)
    AND 1 - (mik.embedding <=> query_embedding) > match_threshold
  ORDER BY mik.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;