
-- Align cast_content_categories with shared INDUSTRY_VERTICALS constant

-- Update existing entries to match unified naming
UPDATE cast_content_categories SET label = 'Finance & Banking', description = 'Financial services and banking content' WHERE name = 'finance';
UPDATE cast_content_categories SET label = 'Food & Beverages', name = 'food_beverage', description = 'Food and beverage industry content' WHERE name = 'food_and_beverage_industry';
UPDATE cast_content_categories SET label = 'Entertainment & Media', name = 'entertainment', description = 'Entertainment and media production' WHERE name = 'media';
UPDATE cast_content_categories SET label = 'Travel & Hospitality', description = 'Travel and hospitality content' WHERE name = 'travel';
UPDATE cast_content_categories SET label = 'Healthcare & Wellness', description = 'Healthcare and wellness content' WHERE name = 'healthcare';
UPDATE cast_content_categories SET label = 'Education & E-Learning', description = 'Education and e-learning content' WHERE name = 'education';
UPDATE cast_content_categories SET label = 'Government & Public Sector', description = 'Government and public sector content' WHERE name = 'government';
UPDATE cast_content_categories SET label = 'Technology & SaaS', description = 'Technology and SaaS content' WHERE name = 'technology';
UPDATE cast_content_categories SET label = 'Retail & E-Commerce', name = 'retail', description = 'Retail and e-commerce content', icon = 'ShoppingCart' WHERE name = 'commercial';

-- Merge Fintech into Finance & Banking
-- Move any cast_category_formats links from fintech to finance
UPDATE cast_category_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name = 'finance') WHERE category_id = (SELECT id FROM cast_content_categories WHERE name = 'fintech');
-- Delete fintech category
DELETE FROM cast_content_categories WHERE name = 'fintech';

-- Rename Oil & Gas to Manufacturing (broader vertical)
UPDATE cast_content_categories SET label = 'Manufacturing', name = 'manufacturing', description = 'Manufacturing and industrial content', icon = 'Factory', color = 'text-amber-600' WHERE name = 'oil_gas';

-- Add missing verticals from shared INDUSTRY_VERTICALS constant
INSERT INTO cast_content_categories (name, label, description, icon, color, sort_order) VALUES
  ('real_estate', 'Real Estate', 'Real estate and property content', 'Building2', 'text-orange-600', 12),
  ('automotive', 'Automotive', 'Automotive industry content', 'Car', 'text-gray-600', 13),
  ('professional_services', 'Professional Services', 'Professional and consulting services', 'Briefcase', 'text-blue-500', 14),
  ('nonprofit', 'Nonprofit & NGO', 'Nonprofit and NGO content', 'Heart', 'text-pink-600', 15),
  ('legal', 'Legal Services', 'Legal industry content', 'Scale', 'text-slate-700', 16),
  ('logistics', 'Logistics & Supply Chain', 'Logistics and supply chain content', 'Truck', 'text-teal-600', 17),
  ('telecom', 'Telecom & Communications', 'Telecom and communications content', 'Radio', 'text-violet-600', 18),
  ('insurance', 'Insurance', 'Insurance industry content', 'Shield', 'text-emerald-600', 19)
ON CONFLICT DO NOTHING;
