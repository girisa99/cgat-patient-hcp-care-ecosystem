-- Create storage bucket for agent assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agents', 'agents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for agent assets
CREATE POLICY "Agent assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agents');

CREATE POLICY "Users can upload their own agent assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own agent assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own agent assets"
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'agents' AND auth.uid()::text = (storage.foldername(name))[1]);