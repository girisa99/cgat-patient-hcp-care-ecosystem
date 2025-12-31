-- Create storage buckets for video and media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-videos', 'generated-videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-media', 'generated-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for generated-videos bucket
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-videos');

CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-videos' AND auth.uid() IS NOT NULL);

-- Storage policies for generated-media bucket
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-media');

CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-media' AND auth.uid() IS NOT NULL);

-- Create a database table for tracking all generated media
CREATE TABLE public.generated_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('video', 'audio', 'image')),
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  source TEXT DEFAULT 'upload' CHECK (source IN ('upload', 'recording', 'generated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_media ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see their own media
CREATE POLICY "Users can view their own media"
ON public.generated_media FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media"
ON public.generated_media FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
ON public.generated_media FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
ON public.generated_media FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_generated_media_updated_at
BEFORE UPDATE ON public.generated_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();