
-- Many-to-many: Blueprint ↔ Product mapping
CREATE TABLE public.blueprint_product_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_id UUID NOT NULL REFERENCES public.video_blueprints(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.marketing_products(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blueprint_id, product_id)
);

-- Index for fast lookups
CREATE INDEX idx_bpa_blueprint ON public.blueprint_product_assignments(blueprint_id);
CREATE INDEX idx_bpa_product ON public.blueprint_product_assignments(product_id);

-- Enable RLS
ALTER TABLE public.blueprint_product_assignments ENABLE ROW LEVEL SECURITY;

-- Read: Anyone authenticated can see assignments
CREATE POLICY "Authenticated users can view blueprint-product assignments"
  ON public.blueprint_product_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Write: Authenticated users can manage assignments
CREATE POLICY "Authenticated users can insert blueprint-product assignments"
  ON public.blueprint_product_assignments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blueprint-product assignments"
  ON public.blueprint_product_assignments FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blueprint-product assignments"
  ON public.blueprint_product_assignments FOR DELETE
  USING (auth.role() = 'authenticated');

-- Asset inventory tracking table
CREATE TABLE public.product_asset_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.marketing_products(id) ON DELETE CASCADE,
  screen_key TEXT NOT NULL,
  screen_name TEXT NOT NULL,
  storage_path TEXT,
  public_url TEXT,
  capture_method TEXT NOT NULL DEFAULT 'manual',
  file_hash TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_outdated BOOLEAN NOT NULL DEFAULT false,
  replaced_by UUID REFERENCES public.product_asset_inventory(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, screen_key)
);

CREATE INDEX idx_pai_product ON public.product_asset_inventory(product_id);
CREATE INDEX idx_pai_outdated ON public.product_asset_inventory(is_outdated);

-- Enable RLS
ALTER TABLE public.product_asset_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view product asset inventory"
  ON public.product_asset_inventory FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage product asset inventory"
  ON public.product_asset_inventory FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product asset inventory"
  ON public.product_asset_inventory FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product asset inventory"
  ON public.product_asset_inventory FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_product_asset_inventory_updated_at
  BEFORE UPDATE ON public.product_asset_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
