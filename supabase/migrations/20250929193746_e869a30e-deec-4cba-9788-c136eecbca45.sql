-- Update RLS policy to allow viewing domain verifications for public/system configs
DROP POLICY IF EXISTS "Users can manage their domain verifications" ON genie_domain_verifications;

CREATE POLICY "Users can manage their domain verifications" 
ON genie_domain_verifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_domain_verifications.brand_config_id
    AND (
      genie_brand_configs.created_by = auth.uid()
      OR genie_brand_configs.created_by IS NULL  -- Allow viewing public/system configs
      OR is_admin_user_safe(auth.uid())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM genie_brand_configs
    WHERE genie_brand_configs.id = genie_domain_verifications.brand_config_id
    AND (
      genie_brand_configs.created_by = auth.uid()
      OR is_admin_user_safe(auth.uid())
    )
  )
);