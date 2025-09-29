-- Update RLS policy to allow viewing public/system Genie configs
DROP POLICY IF EXISTS "Users can manage their own brand configs" ON genie_brand_configs;

CREATE POLICY "Users can manage their own brand configs" 
ON genie_brand_configs 
FOR ALL 
USING (
  created_by = auth.uid() 
  OR is_admin_user_safe(auth.uid())
  OR created_by IS NULL  -- Allow viewing public/system configs
);