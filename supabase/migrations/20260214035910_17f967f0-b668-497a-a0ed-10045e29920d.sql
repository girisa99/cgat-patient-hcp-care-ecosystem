
-- Seed competitive intelligence into universal_knowledge_base for cross-system access
INSERT INTO public.universal_knowledge_base (domain, content_type, finding_category, finding_name, description, metadata)
VALUES
  ('marketing_intelligence', 'competitor_analysis', 'competitive_intelligence', 'Competitive Landscape Overview',
   'Genie Suite operates in a fragmented market with 10+ competitors across Direct (CapCut, Descript, Synthesia, HeyGen), Adjacent (Canva, Lumen5, InVideo), and Emerging (Runway ML, Pika Labs, Opus Clip) categories. Key differentiator: Only full-ecosystem platform with 8 integrated products, 200+ AI pipelines, 50+ languages, and 62+ sub-regions. Competitors average 3-4/10 on multilingual support vs our 9/10.',
   '{"seeded_from": "command_center", "competitor_count": 10, "categories": ["direct", "adjacent", "emerging"]}'::jsonb),

  ('marketing_intelligence', 'market_analysis', 'market_segments', 'Target Market Segments Intelligence',
   'Eight primary segments identified: Creator Economy ($50B TAM), Healthcare ($12B TAM), SMB Marketing ($30B TAM), Enterprise ($25B TAM), Education ($8B TAM), E-commerce ($15B TAM), Real Estate ($5B TAM), Finance ($10B TAM). Top pain points: tool fragmentation, lack of multilingual support, manual workflows, inconsistent branding. Pricing sensitivity ranges from High (Creators) to Low (Enterprise).',
   '{"seeded_from": "command_center", "segment_count": 8, "total_tam": "$155B"}'::jsonb),

  ('marketing_intelligence', 'trend_analysis', 'industry_trends', 'AI Content Creation Industry Trends 2025-2026',
   'Key trends: (1) AI-Generated Video replacing stock (85% relevance), (2) Multilingual Content Demand surging in MENA/SEA/LATAM (90% relevance), (3) Enterprise AI Governance requirements rising (80% relevance), (4) Creator Economy consolidation driving all-in-one preference (85% relevance), (5) Short-form Video dominance on social platforms (88% relevance). Gartner positions AI video tools in Peak of Inflated Expectations.',
   '{"seeded_from": "command_center", "trend_count": 8, "sources": ["gartner", "mckinsey", "forrester"]}'::jsonb),

  ('marketing_intelligence', 'pricing_analysis', 'pricing_intelligence', 'Competitive Pricing Analysis',
   'Market pricing tiers: Free/Freemium (CapCut, Canva), $10-30/mo (Descript, Lumen5, InVideo), $30-100/mo (Synthesia, HeyGen), $100+/mo (Enterprise). Genie Suite value-based positioning at $29-149/mo covers 8 products vs competitors single-product at same price. Bundled ecosystem pricing creates 3-5x better value perception vs point solutions.',
   '{"seeded_from": "command_center", "pricing_tiers": 4}'::jsonb),

  ('marketing_intelligence', 'strategic_analysis', 'swot_analysis', 'Genie Suite SWOT Analysis',
   'STRENGTHS: Full 8-product ecosystem, 200+ AI pipelines, 30+ providers, 50+ languages, 62+ sub-regions, healthcare vertical depth. WEAKNESSES: Brand awareness gap vs CapCut/Canva, complex onboarding for full suite. OPPORTUNITIES: MENA/SEA/LATAM underserved markets, enterprise AI governance gap, healthcare AI compliance void. THREATS: Big tech bundling (Google, Microsoft), AI commoditization, regulatory uncertainty.',
   '{"seeded_from": "command_center", "analysis_type": "swot"}'::jsonb);
