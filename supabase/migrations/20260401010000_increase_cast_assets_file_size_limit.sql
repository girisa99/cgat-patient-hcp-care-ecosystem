-- Increase cast-assets bucket file size limit from 100MB to 500MB
-- Required for stitched final videos (12 parts, 41+ minutes, ~250MB after compression)
UPDATE storage.buckets
SET file_size_limit = 524288000  -- 500MB
WHERE id = 'cast-assets';
