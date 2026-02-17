-- Fix branding: Genie Studio → Genie Suite, Genie Arc → Genie Hub
UPDATE marketing_products SET name = 'Genie Suite', tagline = 'Mind to Media' WHERE name = 'Genie Studio';
UPDATE marketing_products SET name = 'Genie Hub', tagline = 'Your Creative Command Center' WHERE name = 'Genie Arc';
