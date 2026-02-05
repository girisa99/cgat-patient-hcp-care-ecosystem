-- Clean up duplicate queue entries - keep only the latest pending one per blueprint
DELETE FROM thumbnail_generation_queue 
WHERE id NOT IN (
  SELECT DISTINCT ON (blueprint_id) id
  FROM thumbnail_generation_queue
  WHERE status = 'pending'
  ORDER BY blueprint_id, created_at DESC
)
AND status = 'pending';

-- Also remove any queue entries for blueprints that already have thumbnails
DELETE FROM thumbnail_generation_queue 
WHERE blueprint_id IN (
  SELECT id FROM video_blueprints 
  WHERE thumbnail_url IS NOT NULL 
  AND thumbnail_url != ''
  AND thumbnail_url NOT LIKE '%blob.core.windows%'
)
AND status = 'pending';