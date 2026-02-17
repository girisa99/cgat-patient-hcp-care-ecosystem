-- Ensure brand-assets bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('brand-assets', 'brand-assets', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true;