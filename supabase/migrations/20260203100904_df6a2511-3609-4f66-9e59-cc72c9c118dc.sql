-- Add DELETE policy for product-screenshots bucket
CREATE POLICY "Authenticated users can delete product screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-screenshots');

-- Also add UPDATE policy for completeness
CREATE POLICY "Authenticated users can update product screenshots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-screenshots');