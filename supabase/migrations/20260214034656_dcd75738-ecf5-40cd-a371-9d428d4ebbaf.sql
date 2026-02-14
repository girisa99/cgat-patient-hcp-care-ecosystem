-- Remove duplicate Beautiful.ai entry (keep original Beautiful.AI)
DELETE FROM competitor_profiles WHERE name = 'Beautiful.ai' AND id != (SELECT id FROM competitor_profiles WHERE name = 'Beautiful.AI' LIMIT 1);
