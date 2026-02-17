-- Create storage bucket for agent assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agent-assets', 'agent-assets', true);

-- Create storage policies for agent assets
CREATE POLICY "Agent assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agent-assets');

CREATE POLICY "Users can upload their own agent assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agent-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own agent assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agent-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own agent assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'agent-assets' AND auth.uid() IS NOT NULL);