
-- ============================================================
-- Step 1: Enrich competitor_profiles schema
-- ============================================================
ALTER TABLE competitor_profiles 
  ADD COLUMN IF NOT EXISTS revenue_estimate text,
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_editing_rating smallint,
  ADD COLUMN IF NOT EXISTS ease_of_use_rating smallint,
  ADD COLUMN IF NOT EXISTS learning_curve text,
  ADD COLUMN IF NOT EXISTS genie_differentiator text,
  ADD COLUMN IF NOT EXISTS segment text,
  ADD COLUMN IF NOT EXISTS competitor_type text DEFAULT 'Direct';

-- ============================================================
-- Step 2: Create market_segments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.market_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id text NOT NULL UNIQUE,
  name text NOT NULL,
  full_name text,
  emoji text,
  priority text DEFAULT 'P1',
  market_size text,
  growth_rate text,
  cagr text,
  tam text,
  sam text,
  som text,
  competition_level text,
  entry_barrier text,
  genie_fit smallint DEFAULT 3,
  tagline text,
  pain_points text[] DEFAULT '{}',
  avg_time_spent text,
  fragmentation text,
  content_importance smallint DEFAULT 5,
  -- Pricing intelligence
  current_spend text,
  price_threshold text,
  competitor_price text,
  value_drivers text[] DEFAULT '{}',
  buying_behavior text,
  decision_maker text,
  voice_of_customer text,
  -- Metadata
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.market_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read market segments" ON public.market_segments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage segments" ON public.market_segments FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================
-- Step 3: Enrich existing competitors with Command Center data
-- ============================================================

-- CapCut
UPDATE competitor_profiles SET
  estimated_users = '500M+ downloads',
  revenue_estimate = '$200M+ ARR (est.)',
  founded_year = 2020,
  platforms = ARRAY['Mobile', 'Web', 'Desktop'],
  video_editing_rating = 5,
  ease_of_use_rating = 5,
  learning_curve = '< 1 hour',
  languages_supported = 45,
  strengths = ARRAY['Free tier dominates', 'TikTok ecosystem', 'Best mobile UX', 'Trending templates/sounds', 'AI effects'],
  weaknesses = ARRAY['No AI voiceover', 'Limited collaboration', 'Basic analytics', 'Consumer focus only', 'ByteDance ownership concerns'],
  genie_differentiator = 'Script-first workflow, enterprise-grade security, multi-segment templates, HIPAA-ready',
  pricing_range = 'Free / $7.99/mo Pro',
  segment = 'Creator',
  competitor_type = 'Direct'
WHERE name = 'CapCut';

-- Descript
UPDATE competitor_profiles SET
  estimated_users = '3M+ users',
  revenue_estimate = '$50M ARR',
  founded_year = 2017,
  platforms = ARRAY['Desktop', 'Web'],
  video_editing_rating = 4,
  ease_of_use_rating = 3,
  learning_curve = '2-4 hours',
  languages_supported = 25,
  strengths = ARRAY['Transcription-first editing', 'Overdub voice cloning', 'Podcast focus', 'Word-based editing', 'AI filler removal'],
  weaknesses = ARRAY['Expensive for features', 'Complex UI', 'No mobile app', 'Desktop-centric', 'Slow rendering'],
  genie_differentiator = 'Mobile-first, 50% cheaper, unified script-to-publish pipeline, real-time collaboration',
  pricing_range = '$12-24/mo',
  segment = 'Creator',
  competitor_type = 'Direct'
WHERE name = 'Descript';

-- Synthesia
UPDATE competitor_profiles SET
  estimated_users = '100K+ users',
  revenue_estimate = '$60M ARR',
  founded_year = 2017,
  platforms = ARRAY['Web'],
  video_editing_rating = 3,
  ease_of_use_rating = 4,
  learning_curve = '1-2 hours',
  languages_supported = 140,
  strengths = ARRAY['AI avatars (150+)', 'Multi-language (140)', 'Enterprise ready', 'Template library', 'Brand consistency'],
  weaknesses = ARRAY['Expensive ($67/mo Teams)', 'Robotic feel', 'No real presenter option', 'Limited editing', 'No mobile'],
  genie_differentiator = '70% cheaper, natural TTS, real presenter + AI hybrid option, mobile support',
  pricing_range = '$22-67/mo',
  segment = 'SMB',
  competitor_type = 'Direct'
WHERE name = 'Synthesia';

-- HeyGen
UPDATE competitor_profiles SET
  estimated_users = '50K+ users',
  revenue_estimate = '$35M ARR',
  founded_year = 2020,
  platforms = ARRAY['Web'],
  video_editing_rating = 3,
  ease_of_use_rating = 4,
  learning_curve = '1-2 hours',
  languages_supported = 40,
  strengths = ARRAY['Best avatar quality', 'Video translation', 'Voice cloning', 'Enterprise features'],
  weaknesses = ARRAY['No RAG/knowledge base', 'No end-to-end pipeline', 'Limited compliance', 'Expensive at scale'],
  genie_differentiator = 'Full content pipeline from script to publish, RAG integration, HIPAA compliance',
  pricing_range = '$24-$180/mo',
  segment = 'Enterprise',
  competitor_type = 'Direct'
WHERE name = 'HeyGen';

-- Runway
UPDATE competitor_profiles SET
  estimated_users = '5M+ users',
  revenue_estimate = '$100M+ ARR',
  founded_year = 2018,
  platforms = ARRAY['Web'],
  video_editing_rating = 5,
  ease_of_use_rating = 3,
  learning_curve = '4-8 hours',
  languages_supported = 1,
  strengths = ARRAY['Best-in-class Gen-2/Gen-3 video AI', 'Creative tool leader', 'Strong brand', 'Motion brush'],
  weaknesses = ARRAY['No TTS', 'No PPT', 'No localization', 'No knowledge base', 'Creative-only focus'],
  genie_differentiator = 'End-to-end production pipeline vs creative-only, multi-modal, enterprise compliance',
  pricing_range = '$12-$76/mo',
  segment = 'Creator',
  competitor_type = 'Direct'
WHERE name = 'Runway';

-- Canva
UPDATE competitor_profiles SET
  estimated_users = '170M+ users (Canva total)',
  revenue_estimate = '$2.3B ARR (Canva)',
  founded_year = 2013,
  platforms = ARRAY['Web', 'Mobile', 'Desktop'],
  video_editing_rating = 3,
  ease_of_use_rating = 5,
  learning_curve = '< 1 hour',
  languages_supported = 100,
  strengths = ARRAY['Brand kits', 'Design ecosystem', 'Team features', 'Huge template library', 'Stock media'],
  weaknesses = ARRAY['Basic video editing', 'No AI narration', 'Limited effects', 'Not video-first', 'No TTS'],
  genie_differentiator = 'AI TTS, script-first workflow, advanced video editing, production pipeline',
  pricing_range = '$0-$30/mo',
  segment = 'SMB',
  competitor_type = 'Feature'
WHERE name = 'Canva';

-- Lumen5
UPDATE competitor_profiles SET
  estimated_users = '1M+ users',
  revenue_estimate = '$15M ARR',
  founded_year = 2017,
  platforms = ARRAY['Web'],
  video_editing_rating = 3,
  ease_of_use_rating = 4,
  learning_curve = '< 1 hour',
  strengths = ARRAY['Blog-to-video automation', 'Simple UI', 'Template library'],
  weaknesses = ARRAY['No AI generation', 'No voice synthesis', 'Template-only', 'Limited customization'],
  genie_differentiator = 'Full AI generation not just templates, TTS, multi-language, compliance',
  pricing_range = '$19-$149/mo',
  segment = 'SMB',
  competitor_type = 'Direct'
WHERE name = 'Lumen5';

-- Pictory
UPDATE competitor_profiles SET
  estimated_users = '500K+ users',
  revenue_estimate = '$10M ARR',
  founded_year = 2019,
  platforms = ARRAY['Web'],
  video_editing_rating = 3,
  ease_of_use_rating = 4,
  learning_curve = '< 1 hour',
  strengths = ARRAY['Text-to-video', 'Blog repurposing', 'Quick turnaround'],
  weaknesses = ARRAY['No avatar', 'No 3D', 'No multi-language TTS', 'Limited editing'],
  genie_differentiator = 'Full production pipeline, avatar support, multi-language, compliance',
  pricing_range = '$19-$99/mo',
  segment = 'SMB',
  competitor_type = 'Direct'
WHERE name = 'Pictory';

-- Riverside
UPDATE competitor_profiles SET
  estimated_users = '200K+ users',
  revenue_estimate = '$20M ARR',
  founded_year = 2019,
  platforms = ARRAY['Web'],
  video_editing_rating = 2,
  ease_of_use_rating = 4,
  learning_curve = '< 30 min',
  languages_supported = 10,
  strengths = ARRAY['Best recording quality', 'Separate tracks', 'Cloud-based', 'Transcription'],
  weaknesses = ARRAY['Recording only', 'No AI generation', 'No localization', 'No compliance'],
  genie_differentiator = 'Full pipeline from script to publish, not just recording',
  pricing_range = '$15-$24/mo',
  segment = 'Creator',
  competitor_type = 'Direct'
WHERE name = 'Riverside';

-- D-ID
UPDATE competitor_profiles SET
  estimated_users = '100K+ users',
  revenue_estimate = '$20M ARR',
  founded_year = 2017,
  platforms = ARRAY['Web', 'API'],
  video_editing_rating = 2,
  ease_of_use_rating = 3,
  learning_curve = '1-2 hours',
  strengths = ARRAY['Photo-to-video AI', 'API access', 'Creative agents'],
  weaknesses = ARRAY['Limited customization', 'No PPT', 'No knowledge base', 'Avatar-only focus'],
  genie_differentiator = 'Full suite vs avatar-only, script-first, multi-modal, compliance',
  pricing_range = '$0-$108/mo',
  segment = 'Enterprise',
  competitor_type = 'Direct'
WHERE name = 'D-ID';

-- ============================================================
-- Step 4: Seed market segments from Command Center
-- ============================================================
INSERT INTO market_segments (segment_id, name, full_name, emoji, priority, market_size, growth_rate, cagr, tam, sam, som, competition_level, entry_barrier, genie_fit, tagline, pain_points, avg_time_spent, fragmentation, content_importance, current_spend, price_threshold, competitor_price, value_drivers, buying_behavior, decision_maker, voice_of_customer) VALUES
('creator', 'Creator', 'Creator Economy', '🎨', 'P0', '$250B (2027)', '+20% YoY', '14.8%', '$250B', '$50B', '$2.5B', 'Very High', 'Medium', 5, '"I just want to go viral, is that too much to ask?" 🚀', ARRAY['Juggling 5-7 different tools', 'Hours wasted on repetitive editing', 'No time to learn complex software', 'Platform algorithms changing', 'Burnout from content treadmill'], '8-12 hours per video', 'Extremely High - Average creator uses 6.2 tools', 10, '$0-12/mo', '$5-15/mo MAX', 'CapCut: Free/$7.99 | Descript: $12-24', ARRAY['Time savings', 'All-in-one solution', 'Easy to use'], 'Individual', 'Self', '"I just want to go viral, is that too much to ask?"'),
('influencer', 'Influencer', 'Social Media Influencers', '📱', 'P0', '$21B (2024)', '+29% YoY', '24.5%', '$21B', '$8B', '$800M', 'Very High', 'Low', 5, '"8 videos a week across 5 platforms - I''m exhausted" 😓', ARRAY['Multi-platform requires different formats', 'Algorithm changes need adaptation', 'Content repurposing is manual', 'Burnout from daily demands', 'Brand consistency hard'], '25+ hours per week', 'Very High - TikTok, IG, YT each need different tools', 10, '$20-50/mo across tools', '$10-25/mo', 'VN: $9.99 | Riverside: $15-24', ARRAY['Multi-platform export', 'Content repurposing', 'Speed'], 'Individual', 'Self or Manager', '"8 videos a week across 5 platforms - I''m exhausted"'),
('knowledge', 'Knowledge Sharer', 'Experts & Course Creators', '💡', 'P0', '$35B (online learning)', '+22% YoY', '17.8%', '$35B', '$10B', '$1B', 'Medium', 'High', 5, '"I know my craft inside out but can''t make a video" 🎓', ARRAY['Deep expertise but no video skills', 'Camera anxiety', 'Course platforms dont help with creation', 'High production costs', 'No idea how to structure lessons'], 'N/A - most never start', 'High - Kajabi, Teachable, Thinkific hosting only', 9, '$49-399/mo', '$15-50/mo', 'Teachable: $39-199 | Kajabi: $149-399', ARRAY['No video skills needed', 'Script-to-course', 'Camera anxiety removal'], 'Individual', 'Self', '"I know my craft inside out but can''t make a video"'),
('smb', 'SMB', 'Small & Medium Business Marketing', '🏪', 'P0', '$15B', '+25% YoY', '18.2%', '$15B', '$4B', '$400M', 'High', 'Medium', 5, '"Synthesia is amazing but $67/month is too much" 💸', ARRAY['Video production costs $1000+ via agencies', 'Agency turnaround takes 2-4 weeks', 'In-house team lacks expertise', 'Constant need for fresh content', 'Cant afford enterprise tools'], '20+ hours per video', 'High - Canva, Loom, Synthesia fragmented', 9, '$22-67/mo', '$15-40/mo', 'Synthesia: $22-67 | Loom: $12.50 | InVideo: $15-30', ARRAY['Cost savings vs agency', 'Team collaboration', 'Quick turnaround'], 'Team', 'Marketing Manager/Owner', '"Synthesia is amazing but $67/month is too much"'),
('healthcare', 'Healthcare', 'Healthcare & Patient Education', '🏥', 'P0', '$25B', '+22% YoY', '19.1%', '$25B', '$6B', '$600M', 'Low', 'Very High', 5, '"Patients forget 80% of what I tell them" 💊', ARRAY['HIPAA compliance is complex', 'Generic content doesnt resonate', 'No time during appointments', 'Multi-language needs', 'Existing solutions cost $50K+/year'], '10+ hours per compliant video', 'Low - Healthwise, Emmi dominate (expensive)', 10, '$50K+/year', '$50-200/mo per provider', 'Healthwise: $50K+/yr | VIDIZMO: $1000+/mo', ARRAY['HIPAA compliance', '95% cost savings', 'Patient outcomes'], 'Enterprise', 'CMIO/CIO/Practice Manager', '"Patients forget 80% of what I tell them"'),
('education', 'Education', 'Education & eLearning', '📚', 'P1', '$12B', '+18% YoY', '15.4%', '$12B', '$3B', '$150M', 'Medium', 'High', 4, '"4 hours to make a 10-minute lesson video" ⏰', ARRAY['Creating engaging content is time-consuming', 'LMS integration is painful', 'Students expect Netflix-quality', 'Accessibility requirements', 'Budget constraints'], '4-6 hours per 10-minute lesson', 'Medium - Panopto, WeVideo, Loom Education', 8, '$0-249 one-time', '$10-30/mo or $99-249 one-time', 'Camtasia: $249 | Screencastify: Free-$49', ARRAY['Lesson scripting', 'Accessibility', 'LMS integration'], 'Individual', 'Teacher/Admin', '"4 hours to make a 10-minute lesson video"'),
('enterprise', 'Enterprise', 'Enterprise & Corporate', '🏢', 'P1', '$40B', '+15% YoY', '13.2%', '$40B', '$10B', '$500M', 'High', 'High', 4, '"Legal review takes 3 weeks per video" ⚖️', ARRAY['Complex approval workflows', 'Localization for global teams expensive', 'Security and compliance requirements', 'Training content outdated before released', 'Integration with existing tech stack'], '40+ hours per video (incl. approvals)', 'High - Kaltura, Brightcove, Microsoft Stream', 8, '$180-1000+/mo', '$100-500/mo', 'HeyGen: $180+ | Kaltura: Custom', ARRAY['Approval workflows', 'Localization', 'Security'], 'Enterprise', 'L&D Manager/VP/Procurement', '"Legal review takes 3 weeks per video"'),
('traveler', 'Traveler', 'Traveler & Experience', '✈️', 'P1', '$8B', '+15% YoY', '12.3%', '$8B', '$2B', '$100M', 'Medium', 'Low', 4, '"500 photos from vacation, zero edited videos" 📸', ARRAY['Thousands of photos/clips no time to organize', 'Trips forgotten without video', 'Basic editing too slow on mobile', 'No internet during travel'], '2-4 hours per trip video (rarely completed)', 'Medium - GoPro Quik, InShot dominant', 7, '$0-7/mo', '$5-10/mo MAX', 'GoPro Quik: Free/$49/yr | InShot: $3.99', ARRAY['Auto-editing', 'Trip memories', 'Easy mobile'], 'Individual', 'Self', '"500 photos from vacation, zero edited videos"')
ON CONFLICT (segment_id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  priority = EXCLUDED.priority,
  market_size = EXCLUDED.market_size,
  growth_rate = EXCLUDED.growth_rate,
  cagr = EXCLUDED.cagr,
  tam = EXCLUDED.tam,
  sam = EXCLUDED.sam,
  som = EXCLUDED.som,
  pain_points = EXCLUDED.pain_points,
  current_spend = EXCLUDED.current_spend,
  price_threshold = EXCLUDED.price_threshold,
  competitor_price = EXCLUDED.competitor_price,
  value_drivers = EXCLUDED.value_drivers,
  voice_of_customer = EXCLUDED.voice_of_customer,
  updated_at = now();

-- ============================================================
-- Step 5: Seed market trends into trend_monitoring_log
-- ============================================================
INSERT INTO trend_monitoring_log (title, description, trend_type, impact_level, source, source_url, affected_products) VALUES
('AI Adoption Rate Surge to 82% by 2026', 'McKinsey reports 72% enterprise AI adoption by 2025, projected 82% by 2026. Genie Suite positioned to capture this wave.', 'market_shift', 'critical', 'McKinsey Digital 2024', 'https://mckinsey.com/capabilities/mckinsey-digital/our-insights', ARRAY['Genie Mind', 'Genie Spark', 'Genie Vibe']),
('Creator Economy Reaches $250B by 2027', 'Statista projects creator economy valued at $250B by 2027 with 50M+ global creators. Video-first creators are fastest growing segment.', 'market_growth', 'high', 'Statista 2024', 'https://statista.com/statistics/1092819/worldwide-creator-economy-market-size', ARRAY['Genie Vibe', 'Genie Cast', 'Genie Spark']),
('GenAI Content: 30% of Marketing by 2026', 'Gartner predicts AI-generated content will constitute 30% of all marketing content by 2026, up from <5% in 2023.', 'technology', 'critical', 'Gartner 2024', 'https://gartner.com/en/marketing/insights/articles/ai-generated-content', ARRAY['Genie Cast', 'Genie Mind', 'Genie Deck']),
('AI Video Startup Funding Up 340% YoY', 'CB Insights reports AI video startups raised $2.1B in 2023, a 340% increase year-over-year. Market validation for Genie Suite approach.', 'investment', 'high', 'CB Insights 2024', 'https://cbinsights.com/research/ai-video-startup-funding', ARRAY['Genie Vibe', 'Genie Cast']),
('Video ROI Exceeds All Other Content', 'Adobe State of Create survey: 85% marketers say video ROI exceeds other content forms. 91% businesses use video marketing (Wyzowl).', 'market_validation', 'high', 'Adobe / Wyzowl 2024', 'https://adobe.com/express/learn/blog/state-of-create', ARRAY['Genie Vibe', 'Genie Cast', 'Genie Spark']),
('Enterprise Video Market: $40B by 2027', 'Forrester projects enterprise video platform market reaching $40B by 2027. Corporate training and internal comms driving growth.', 'market_growth', 'medium', 'Forrester 2024', 'https://forrester.com/report/the-forrester-wave-enterprise-video-platforms', ARRAY['Genie Arc', 'Genie Vibe', 'Genie Deck']),
('Tool Fragmentation Crisis: 6.2 Average Tools', 'Video creators use an average of 6.2 different tools per production. Unified AI suites replacing single-purpose apps.', 'pain_point', 'high', 'Video Creator Tools Survey 2024', NULL, ARRAY['Genie Studio', 'All Products']),
('90% Time Savings: Manual to AI-Assisted', 'Market shift from 40+ hours manual editing to 2-4 hours AI-assisted. Cost per video dropping 70%.', 'technology', 'critical', 'Industry Analysis 2024', NULL, ARRAY['Genie Vibe', 'Genie Spark', 'Genie Mind']);
