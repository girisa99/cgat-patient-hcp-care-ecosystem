-- Create storage bucket for production hub attachments (scripts, documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('production-attachments', 'production-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket objects
CREATE POLICY "Authenticated users can upload production attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'production-attachments');

CREATE POLICY "Anyone can read production attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'production-attachments');

CREATE POLICY "Authenticated users can update their own production attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'production-attachments');

CREATE POLICY "Authenticated users can delete their own production attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'production-attachments');