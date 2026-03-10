-- ============================================================
-- CLEANUP: Purge base64 data URIs from scene_config JSONB
-- Run this in Supabase SQL Editor to restore IO budget
-- ============================================================

-- Step 1: Check current bloat (diagnostic — run first)
SELECT
  scene_key,
  length(scene_config::text) as config_bytes,
  pg_size_pretty(length(scene_config::text)::bigint) as config_size
FROM cast_project_scenes
WHERE scene_config IS NOT NULL
ORDER BY length(scene_config::text) DESC
LIMIT 20;

-- Step 2: Find rows with base64 data URIs embedded
SELECT
  scene_key,
  length(scene_config::text) as config_bytes,
  (scene_config::text LIKE '%data:image%') as has_base64_image,
  (scene_config::text LIKE '%data:video%') as has_base64_video,
  (scene_config::text LIKE '%data:audio%') as has_base64_audio
FROM cast_project_scenes
WHERE scene_config::text LIKE '%data:%'
ORDER BY length(scene_config::text) DESC;

-- Step 3: Strip base64 URLs from artifacts in scene_config
-- This replaces any "data:..." value in artifact URL maps with empty string
-- while preserving all other data (pipeline, music, assembly URLs, etc.)
--
-- IMPORTANT: This only cleans the artifacts sub-object, not the whole config.

-- Clean videoUrls
UPDATE cast_project_scenes
SET scene_config = jsonb_set(
  scene_config::jsonb,
  '{artifacts,videoUrls}',
  (
    SELECT COALESCE(jsonb_object_agg(
      key,
      CASE
        WHEN value::text LIKE '"data:%' THEN '""'::jsonb
        ELSE value
      END
    ), '{}'::jsonb)
    FROM jsonb_each(scene_config::jsonb -> 'artifacts' -> 'videoUrls')
  )
)
WHERE scene_config::jsonb -> 'artifacts' -> 'videoUrls' IS NOT NULL
  AND scene_config::text LIKE '%data:%';

-- Clean imageUrls
UPDATE cast_project_scenes
SET scene_config = jsonb_set(
  scene_config::jsonb,
  '{artifacts,imageUrls}',
  (
    SELECT COALESCE(jsonb_object_agg(
      key,
      CASE
        WHEN value::text LIKE '"data:%' THEN '""'::jsonb
        ELSE value
      END
    ), '{}'::jsonb)
    FROM jsonb_each(scene_config::jsonb -> 'artifacts' -> 'imageUrls')
  )
)
WHERE scene_config::jsonb -> 'artifacts' -> 'imageUrls' IS NOT NULL
  AND scene_config::text LIKE '%data:%';

-- Clean avatarUrls
UPDATE cast_project_scenes
SET scene_config = jsonb_set(
  scene_config::jsonb,
  '{artifacts,avatarUrls}',
  (
    SELECT COALESCE(jsonb_object_agg(
      key,
      CASE
        WHEN value::text LIKE '"data:%' THEN '""'::jsonb
        ELSE value
      END
    ), '{}'::jsonb)
    FROM jsonb_each(scene_config::jsonb -> 'artifacts' -> 'avatarUrls')
  )
)
WHERE scene_config::jsonb -> 'artifacts' -> 'avatarUrls' IS NOT NULL
  AND scene_config::text LIKE '%data:%';

-- Clean lipsyncUrls
UPDATE cast_project_scenes
SET scene_config = jsonb_set(
  scene_config::jsonb,
  '{artifacts,lipsyncUrls}',
  (
    SELECT COALESCE(jsonb_object_agg(
      key,
      CASE
        WHEN value::text LIKE '"data:%' THEN '""'::jsonb
        ELSE value
      END
    ), '{}'::jsonb)
    FROM jsonb_each(scene_config::jsonb -> 'artifacts' -> 'lipsyncUrls')
  )
)
WHERE scene_config::jsonb -> 'artifacts' -> 'lipsyncUrls' IS NOT NULL
  AND scene_config::text LIKE '%data:%';

-- Also clean any base64 in tts_audio_url column (separate column, not JSONB)
UPDATE cast_project_script_lines
SET tts_audio_url = NULL
WHERE tts_audio_url LIKE 'data:%';

-- Step 4: Verify cleanup worked
SELECT
  scene_key,
  length(scene_config::text) as config_bytes_after,
  pg_size_pretty(length(scene_config::text)::bigint) as config_size_after
FROM cast_project_scenes
WHERE scene_config IS NOT NULL
ORDER BY length(scene_config::text) DESC
LIMIT 20;

-- Step 5: VACUUM to reclaim disk space (run after cleanup)
VACUUM ANALYZE cast_project_scenes;
VACUUM ANALYZE cast_project_script_lines;
