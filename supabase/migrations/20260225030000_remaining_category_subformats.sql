-- ============================================================================
-- Phase 7C: Sub-formats for remaining 8 categories
-- ============================================================================
-- Fills the gap for categories added in 20260225010000 that did not receive
-- dedicated sub-formats: aerospace_defense, mining_metals, fashion_apparel,
-- music_arts, hospitality_hotels, environmental, pet_care, wellness_spa
-- ============================================================================

-- 1. AEROSPACE & DEFENSE sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'aero_mission_brief', 'Mission Briefing', 'Plane', 'text-slate-600', 'Mission overview and objectives video', ARRAY['website','lms'], '{"tone":"authoritative","structure":"briefing","narrative":"mission_critical"}', 70),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'aero_flight_demo', 'Flight Demonstration', 'Rocket', 'text-blue-700', 'Aircraft or spacecraft capability demo', ARRAY['youtube','linkedin'], '{"tone":"impressive","structure":"demo","narrative":"capability_showcase"}', 71),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'aero_defense_proposal', 'Defense Proposal', 'Shield', 'text-slate-700', 'Defense contract proposal deck', ARRAY['website'], '{"tone":"formal","structure":"proposal","narrative":"strategic"}', 54),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'aero_manufacturing', 'Aerospace Manufacturing', 'Factory', 'text-gray-600', 'Precision manufacturing process showcase', ARRAY['youtube','linkedin'], '{"tone":"technical","structure":"process","narrative":"precision"}', 72)
ON CONFLICT (format_id, name) DO NOTHING;

-- 2. MINING & METALS sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mining_operations', 'Mining Operations', 'Mountain', 'text-amber-700', 'Mining site operations overview', ARRAY['youtube','linkedin'], '{"tone":"industrial","structure":"documentary","narrative":"operations"}', 73),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mining_safety', 'Mine Safety Training', 'HardHat', 'text-red-700', 'Underground and surface safety protocols', ARRAY['lms','youtube'], '{"tone":"serious","structure":"training","narrative":"compliance"}', 74),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'mining_exploration', 'Exploration Report', 'Map', 'text-amber-600', 'Geological survey and exploration results', ARRAY['linkedin','website'], '{"tone":"data_driven","structure":"report","narrative":"findings"}', 55),
  ((SELECT id FROM cast_content_formats WHERE name='infographic'), 'mining_supply_chain', 'Metals Supply Chain', 'Link', 'text-gray-600', 'Mine-to-market supply chain visualization', ARRAY['website','linkedin'], '{"tone":"analytical","structure":"flow","narrative":"process"}', 51)
ON CONFLICT (format_id, name) DO NOTHING;

-- 3. FASHION & APPAREL sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'fashion_lookbook', 'Lookbook Video', 'Shirt', 'text-pink-600', 'Seasonal collection lookbook', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"stylish","structure":"showcase","narrative":"editorial"}', 75),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'fashion_runway', 'Runway Recap', 'Sparkles', 'text-purple-500', 'Fashion show highlights and commentary', ARRAY['youtube','instagram_reels'], '{"tone":"glamorous","structure":"highlights","narrative":"fashion_forward"}', 76),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'fashion_styling', 'Styling Tips', 'Palette', 'text-rose-500', 'How-to style and outfit ideas', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"friendly","structure":"tips","narrative":"how_to"}', 77),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'fashion_behind_scenes', 'Design Process', 'Scissors', 'text-amber-500', 'Behind-the-scenes design and craftsmanship', ARRAY['youtube','instagram'], '{"tone":"authentic","structure":"documentary","narrative":"craftsmanship"}', 78)
ON CONFLICT (format_id, name) DO NOTHING;

-- 4. MUSIC & ARTS sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'music_performance', 'Live Performance', 'Music', 'text-violet-600', 'Concert or studio performance capture', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"energetic","structure":"performance","narrative":"immersive"}', 79),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'music_lyric_video', 'Lyric Video', 'Type', 'text-indigo-500', 'Animated lyrics with visuals', ARRAY['youtube','spotify_canvas'], '{"tone":"creative","structure":"lyric_sync","narrative":"visual_storytelling"}', 80),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'music_artist_story', 'Artist Story', 'Mic', 'text-purple-600', 'Artist biography and journey documentary', ARRAY['youtube','instagram'], '{"tone":"intimate","structure":"narrative","narrative":"biographical"}', 81),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'arts_exhibition', 'Exhibition Tour', 'Frame', 'text-amber-600', 'Gallery or museum virtual tour', ARRAY['youtube','website'], '{"tone":"contemplative","structure":"tour","narrative":"guided"}', 82),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'arts_tutorial', 'Art Tutorial', 'PaintBucket', 'text-orange-500', 'Painting, drawing, or sculpting instruction', ARRAY['youtube','tiktok'], '{"tone":"instructive","structure":"step_by_step","narrative":"hands_on"}', 83)
ON CONFLICT (format_id, name) DO NOTHING;

-- 5. HOSPITALITY & HOTELS sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'hotel_virtual_tour', 'Hotel Virtual Tour', 'Building2', 'text-amber-600', 'Room and amenity walkthrough', ARRAY['youtube','website','booking'], '{"tone":"welcoming","structure":"tour","narrative":"experiential"}', 84),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'hotel_concierge', 'Concierge Guide', 'MapPin', 'text-teal-600', 'Local attractions and dining recommendations', ARRAY['youtube','website'], '{"tone":"helpful","structure":"recommendations","narrative":"local_expert"}', 85),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'hotel_event_venue', 'Event Venue Showcase', 'PartyPopper', 'text-rose-500', 'Banquet halls and event space highlight', ARRAY['youtube','instagram','website'], '{"tone":"elegant","structure":"showcase","narrative":"possibilities"}', 86),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'hospitality_training', 'Hospitality Training', 'GraduationCap', 'text-blue-600', 'Guest service and operations training', ARRAY['lms','youtube'], '{"tone":"professional","structure":"training","narrative":"service_excellence"}', 87)
ON CONFLICT (format_id, name) DO NOTHING;

-- 6. ENVIRONMENTAL sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'env_impact_report', 'Impact Report Video', 'TreePine', 'text-green-700', 'Environmental impact assessment documentary', ARRAY['youtube','linkedin'], '{"tone":"urgent","structure":"documentary","narrative":"call_to_action"}', 88),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'env_conservation', 'Conservation Story', 'Leaf', 'text-emerald-600', 'Wildlife and habitat conservation narrative', ARRAY['youtube','instagram'], '{"tone":"emotive","structure":"story","narrative":"hope"}', 89),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'env_sustainability', 'Sustainability Guide', 'Recycle', 'text-green-500', 'Corporate or personal sustainability tips', ARRAY['youtube','linkedin','tiktok'], '{"tone":"optimistic","structure":"tips","narrative":"actionable"}', 90),
  ((SELECT id FROM cast_content_formats WHERE name='infographic'), 'env_carbon_tracker', 'Carbon Footprint Tracker', 'BarChart3', 'text-green-600', 'Emissions data visualization', ARRAY['website','linkedin'], '{"tone":"data_driven","structure":"dashboard","narrative":"monitoring"}', 52)
ON CONFLICT (format_id, name) DO NOTHING;

-- 7. PET CARE sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'pet_training', 'Pet Training Guide', 'Dog', 'text-amber-500', 'Dog, cat, and pet training tutorials', ARRAY['youtube','tiktok','instagram_reels'], '{"tone":"friendly","structure":"tutorial","narrative":"step_by_step"}', 91),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'pet_health', 'Pet Health & Nutrition', 'Heart', 'text-red-500', 'Veterinary and nutrition guidance', ARRAY['youtube','website'], '{"tone":"caring","structure":"educational","narrative":"expert_advice"}', 92),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'pet_product_review', 'Pet Product Review', 'Star', 'text-yellow-500', 'Pet food, toy, and accessory reviews', ARRAY['youtube','tiktok','instagram_reels'], '{"tone":"honest","structure":"review","narrative":"comparison"}', 93),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'pet_adoption', 'Adoption Story', 'HeartHandshake', 'text-pink-500', 'Pet adoption awareness and stories', ARRAY['youtube','instagram','facebook'], '{"tone":"heartwarming","structure":"story","narrative":"emotional"}', 94)
ON CONFLICT (format_id, name) DO NOTHING;

-- 8. WELLNESS & SPA sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'wellness_meditation', 'Guided Meditation', 'CloudSun', 'text-sky-500', 'Mindfulness and meditation sessions', ARRAY['youtube','spotify','website'], '{"tone":"calming","structure":"guided","narrative":"relaxation"}', 95),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'wellness_yoga', 'Yoga & Movement', 'Flower2', 'text-purple-400', 'Yoga flow and body movement sessions', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"peaceful","structure":"follow_along","narrative":"flow"}', 96),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'spa_treatment', 'Spa Treatment Tour', 'Droplets', 'text-cyan-500', 'Spa services and treatment showcase', ARRAY['youtube','instagram','website'], '{"tone":"luxurious","structure":"showcase","narrative":"experiential"}', 97),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'wellness_holistic', 'Holistic Health', 'Sun', 'text-orange-400', 'Holistic and alternative wellness practices', ARRAY['youtube','tiktok'], '{"tone":"nurturing","structure":"educational","narrative":"wellness_journey"}', 98)
ON CONFLICT (format_id, name) DO NOTHING;
