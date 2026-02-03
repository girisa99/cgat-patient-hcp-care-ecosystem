-- Create storage buckets for Full Production Mode assets
-- Avatar segments, 3D elements, and transitions

-- Avatar segments bucket (generated avatar videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatar-segments', 'avatar-segments', true, 104857600, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- 3D elements bucket (GLB, GLTF, FBX files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('3d-elements', '3d-elements', true, 52428800, ARRAY['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'])
ON CONFLICT (id) DO NOTHING;

-- Transitions bucket (animated transition clips)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('transitions', 'transitions', true, 52428800, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- Ensure genie-media bucket exists (for TTS and general media)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('genie-media', 'genie-media', true, 104857600, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'video/mp4', 'video/webm', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatar-segments
CREATE POLICY "Public read access for avatar-segments"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar-segments');

CREATE POLICY "Service role upload for avatar-segments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatar-segments');

CREATE POLICY "Service role update for avatar-segments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatar-segments');

-- RLS policies for 3d-elements
CREATE POLICY "Public read access for 3d-elements"
ON storage.objects FOR SELECT
USING (bucket_id = '3d-elements');

CREATE POLICY "Service role upload for 3d-elements"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-elements');

-- RLS policies for transitions
CREATE POLICY "Public read access for transitions"
ON storage.objects FOR SELECT
USING (bucket_id = 'transitions');

CREATE POLICY "Service role upload for transitions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'transitions');