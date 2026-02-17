
-- Seed Product Knowledge Registry for all 8 Genie products
INSERT INTO public.product_knowledge_registry (product_id, version, is_current, value_proposition, positioning_statement, tagline, elevator_pitch, pain_points, key_benefits, use_cases, differentiators, competitive_edge, competitive_category, is_system_default, status)
VALUES
-- Genie Spark
('8526e2cc-3db2-4d5f-9d17-34cff668743b', 1, true,
 'Go from blank page to brilliant content plan in under 60 seconds using AI that thinks creatively across formats.',
 'The only ideation tool that combines multi-modal AI brainstorming with instant content scaffolding for every channel.',
 'Ignite your Ideas',
 'Genie Spark is an AI-powered ideation engine that transforms vague concepts into actionable content strategies using multi-model brainstorming.',
 '["Creative block and blank-page paralysis","Hours wasted on manual brainstorming sessions","Disconnected ideation across content formats","Ideas that never translate to actionable plans"]'::jsonb,
 '["Generate 50+ content ideas in seconds","AI brainstorming canvas with visual mind-mapping","Instant content starters for any format","Cross-format idea expansion (blog to video to social)"]'::jsonb,
 '["Marketing teams needing weekly content calendars","Solo creators overcoming creative block","Agencies brainstorming campaigns for multiple clients"]'::jsonb,
 '["Multi-format ideation in one tool","Visual brainstorming canvas","Direct handoff to production tools","Multi-model AI for diverse perspectives"]'::jsonb,
 'Unlike single-model text generators, Spark uses multi-modal AI brainstorming with visual mind-mapping and direct production handoff.',
 'ideation', true, 'active'),

-- Genie Mind
('c7e199a9-08d7-4fd8-9388-53d60e1e96a4', 1, true,
 'Transform rough ideas into polished, production-ready scripts with AI that understands storytelling, pacing, and audience psychology.',
 'The AI script writing studio that bridges the gap between creative vision and production-ready content.',
 'Script Writing & Enhancement',
 'Genie Mind is an AI-powered script writing and enhancement studio that transforms rough concepts into polished, production-ready scripts.',
 '["Scripts that sound robotic and generic","Hours of manual rewriting for different formats","No consistency between script versions","Difficult to adapt scripts for different regions"]'::jsonb,
 '["AI-enhanced script polishing and refinement","Multi-format script adaptation","Tone and audience-aware writing","Regional transcreation support"]'::jsonb,
 '["Video producers needing professional scripts","Content teams scaling script production","Marketers adapting messaging across regions"]'::jsonb,
 '["Understands storytelling structure and pacing","Audience psychology-aware writing","Seamless format adaptation","Regional and cultural sensitivity"]'::jsonb,
 'Goes beyond text generation with deep understanding of storytelling structure, pacing, and audience psychology for production-ready output.',
 'scriptwriting', true, 'active'),

-- Genie Vibe
('021192bf-c66f-4c36-a015-579840928c56', 1, true,
 'Create stunning visual content that matches your brand identity using AI-powered design and video production tools.',
 'The visual production suite that turns brand guidelines into consistent, on-brand creative assets at scale.',
 'Visual Production Suite',
 'Genie Vibe produces professional visual content aligned with brand identity using AI-powered design and video production.',
 '["Inconsistent visual branding across campaigns","Expensive design tools with steep learning curves","Slow turnaround for visual content","Generic templates that dont match brand identity"]'::jsonb,
 '["Brand-consistent visual generation","Multi-format output (video, image, social)","AI-powered design that learns your brand","Rapid visual content production"]'::jsonb,
 '["Brand managers maintaining visual consistency","Social media teams needing daily visuals","Marketing teams producing campaign assets"]'::jsonb,
 '["Brand-aware AI design engine","Multi-format visual output","Template-free creative generation","Style learning and adaptation"]'::jsonb,
 'Unlike template-based design tools, Vibe learns your brand identity and generates unique, on-brand visuals without template constraints.',
 'visual_production', true, 'active'),

-- Genie Deck
('23ac1d25-03c3-43f2-9dbc-53ee0c389b77', 1, true,
 'Transform any content into compelling presentations with AI that understands narrative flow, data visualization, and audience engagement.',
 'The AI presentation engine that creates investor-grade decks from raw ideas in minutes, not days.',
 'Presentations Reimagined',
 'Genie Deck creates professional presentations from raw content using AI that understands narrative structure and visual storytelling.',
 '["Hours spent on slide design instead of content","Presentations that lack visual impact","Difficulty translating data into compelling stories","Inconsistent deck quality across teams"]'::jsonb,
 '["AI-generated slide narratives from raw content","Smart data visualization","Professional design without design skills","Consistent quality across all presentations"]'::jsonb,
 '["Sales teams creating pitch decks","Executives preparing board presentations","Educators creating course materials","Startups building investor decks"]'::jsonb,
 '["Narrative-aware slide generation","Automatic data visualization","Multi-audience adaptation","Export to multiple formats"]'::jsonb,
 'Goes beyond slide templates with AI that understands narrative structure, automatically visualizes data, and adapts tone for different audiences.',
 'presentations', true, 'active'),

-- Genie Hub
('8fd4faae-bd5b-4bc9-825a-3484db800fd3', 1, true,
 'Your central command center for managing all creative projects, team collaboration, and content workflows in one unified dashboard.',
 'The creative operations hub that eliminates tool-switching and brings all content workflows under one roof.',
 'Your Creative Command Center',
 'Genie Hub centralizes creative project management, team collaboration, and content workflows in a unified dashboard.',
 '["Content scattered across multiple tools","No visibility into project status","Team collaboration friction","Manual handoffs between creation and publishing"]'::jsonb,
 '["Unified creative project dashboard","Real-time team collaboration","Automated workflow orchestration","Cross-tool content management"]'::jsonb,
 '["Creative directors managing multiple campaigns","Marketing ops streamlining workflows","Agencies coordinating client deliverables"]'::jsonb,
 '["Single pane of glass for all creative work","Automated handoffs between tools","Real-time collaboration","Integrated approval workflows"]'::jsonb,
 'Unlike generic project management tools, Hub is purpose-built for creative workflows with native integration across all Genie production tools.',
 'project_management', true, 'active'),

-- Genie Cast
('63f0fc4b-411b-4f9c-8df6-0fac366e4735', 1, true,
 'Produce, transcreate, and publish multi-format content across 62+ regions with one click — video, avatar, 3D, and more.',
 'The only end-to-end production platform that takes content from script to screen to 62+ regional markets automatically.',
 'Make It. Show It. Scale It.',
 'Genie Cast is the end-to-end content production and distribution platform for multi-regional, multi-format content at scale.',
 '["Content that doesnt resonate in local markets","Expensive localization for each region","Months-long production cycles","Separate tools for video, avatar, and 3D content"]'::jsonb,
 '["One template, many regional videos","AI transcreation (not just translation)","Multi-modal production (video, avatar, 3D, PPT)","62+ sub-regional targeting with cultural adaptation"]'::jsonb,
 '["Global brands scaling content across markets","Agencies producing regional campaigns","SaaS companies localizing product demos","E-commerce expanding to new markets"]'::jsonb,
 '["True transcreation with cultural adaptation","62+ sub-region support","Multi-modal production pipeline","Integrated regional TTS providers"]'::jsonb,
 'The only platform combining transcreation (not translation), multi-modal production, and 62+ sub-regional targeting in one pipeline.',
 'content_production', true, 'active'),

-- Ask Genie
('63a1f612-133b-40ba-adbe-84403d7b1498', 1, true,
 'Get instant, context-aware answers about your content, projects, and creative workflows from an AI that knows your entire ecosystem.',
 'The intelligent assistant that understands your entire creative ecosystem and provides actionable guidance.',
 'Your Creative AI Assistant',
 'Ask Genie is a context-aware AI assistant that provides instant answers about content, projects, and workflows across the Genie ecosystem.',
 '["Searching through multiple tools for answers","Onboarding friction for new team members","Repetitive questions consuming team time","No institutional knowledge capture"]'::jsonb,
 '["Context-aware answers across all Genie tools","Instant onboarding and training","Institutional knowledge capture","Natural language workflow automation"]'::jsonb,
 '["New team members learning the platform","Managers needing quick project updates","Creators seeking workflow optimization"]'::jsonb,
 '["Deep ecosystem awareness","Cross-tool context understanding","Natural language interface","Proactive workflow suggestions"]'::jsonb,
 'Unlike generic chatbots, Ask Genie has deep context awareness across the entire creative ecosystem, providing actionable guidance not just answers.',
 'ai_assistant', true, 'active'),

-- Genie Suite
('3da815ca-3801-41dc-b9e4-8451c5d38590', 1, true,
 'The complete AI-powered creative production platform — from ideation to publication across every format, channel, and market.',
 'The worlds first end-to-end AI creative suite that replaces 10+ disconnected tools with one unified platform.',
 'Mind to Media',
 'Genie Suite is the complete AI-powered creative production platform spanning ideation, scripting, design, video, presentations, and distribution.',
 '["10+ disconnected creative tools","Inconsistent brand output across channels","Massive creative production costs","Weeks-long content production cycles"]'::jsonb,
 '["One platform for the entire creative workflow","Consistent brand output across all channels","90% reduction in production time","AI-powered at every stage"]'::jsonb,
 '["Enterprise marketing departments","Creative agencies","Content-first companies scaling globally","SMBs competing with enterprise-level content"]'::jsonb,
 '["End-to-end integrated workflow","AI at every production stage","Multi-format, multi-channel output","Global market readiness built-in"]'::jsonb,
 'Replaces an entire creative tool stack (Canva + Lumen5 + Synthesia + Beautiful.AI + project management) with one AI-native platform.',
 'creative_suite', true, 'active');

-- Seed Competitor Landscape (global scope, no names exposed in output)
INSERT INTO public.competitor_landscape (product_id, competitor_name, competitor_category, competitor_weakness, our_advantage, battle_card, positioning_against, is_system_default, scope)
VALUES
-- Spark competitors
('8526e2cc-3db2-4d5f-9d17-34cff668743b', 'ChatGPT', 'ai_chat', 'Text-only ideation, no visual brainstorming, no production handoff', 'Multi-format ideation with visual canvas and direct production pipeline integration', 'When prospects use general AI chatbots for brainstorming: highlight our visual canvas, multi-format output, and seamless handoff to video/presentation production', 'general_purpose_ai', true, 'global'),
('8526e2cc-3db2-4d5f-9d17-34cff668743b', 'Jasper', 'ai_writing', 'Marketing copy only, no multi-format scaffolding, no brainstorming canvas', 'Cross-format content blueprints with visual brainstorming that feeds directly into production', 'When prospects consider marketing AI writers: emphasize our ideation-to-production pipeline vs their text-only output', 'ai_copywriting', true, 'global'),

-- Mind competitors
('c7e199a9-08d7-4fd8-9388-53d60e1e96a4', 'Copy.ai', 'ai_writing', 'Generic copy, no script structure understanding, no regional adaptation', 'Production-ready scripts with storytelling structure, pacing, and regional transcreation', 'When prospects evaluate AI writing tools for video scripts: highlight our understanding of scene structure, timing, and cultural adaptation', 'ai_copywriting', true, 'global'),

-- Vibe competitors
('021192bf-c66f-4c36-a015-579840928c56', 'Canva', 'design', 'Template-dependent, limited AI generation, no brand learning', 'AI that learns brand identity and generates unique visuals without template constraints', 'When prospects compare with design platforms: emphasize brand-aware AI generation vs template-based design', 'design_platforms', true, 'global'),

-- Deck competitors
('23ac1d25-03c3-43f2-9dbc-53ee0c389b77', 'Beautiful.AI', 'presentations', 'No video output, limited narrative understanding, template-heavy', 'AI-driven narrative structure with data visualization and multi-audience tone adaptation', 'When prospects evaluate presentation tools: highlight narrative intelligence and multi-format export vs static slides', 'presentation_tools', true, 'global'),
('23ac1d25-03c3-43f2-9dbc-53ee0c389b77', 'Gamma', 'presentations', 'No audio/video, limited customization, no regional support', 'Full multi-media presentation with audio narration, regional adaptation, and export flexibility', 'When prospects consider modern presentation tools: emphasize multimedia capabilities and regional support', 'presentation_tools', true, 'global'),

-- Cast competitors
('63f0fc4b-411b-4f9c-8df6-0fac366e4735', 'Synthesia', 'avatar_video', 'Avatar-only, no multi-modal pipeline, limited regional support', 'End-to-end production pipeline with video, avatar, 3D, transcreation across 62+ sub-regions', 'When prospects evaluate avatar video platforms: highlight our complete production pipeline and true transcreation vs their single-format output', 'avatar_video', true, 'global'),
('63f0fc4b-411b-4f9c-8df6-0fac366e4735', 'Lumen5', 'video', 'Template-based only, no transcreation, no multi-modal support', 'AI-driven video production with cultural transcreation and multi-modal output options', 'When prospects compare video creation tools: emphasize transcreation capabilities and multi-modal production vs template editing', 'video_creation', true, 'global'),
('63f0fc4b-411b-4f9c-8df6-0fac366e4735', 'Pictory', 'video', 'Basic editing only, no regional adaptation, no avatar/3D support', 'Full production suite with regional targeting, multi-format output, and integrated TTS', 'When prospects evaluate video editors: highlight our production depth and regional capabilities vs their basic editing', 'video_creation', true, 'global'),

-- Suite competitors
('3da815ca-3801-41dc-b9e4-8451c5d38590', 'Adobe Creative Cloud', 'creative_suite', 'Steep learning curve, no AI-native workflow, expensive per-tool licensing', 'AI-native from ground up, unified workflow, fraction of the cost with faster output', 'When enterprises compare full creative suites: emphasize AI-native architecture, unified workflow, and total cost of ownership', 'enterprise_creative', true, 'global'),
('3da815ca-3801-41dc-b9e4-8451c5d38590', 'Descript', 'video_editing', 'Video editing only, steep learning curve, no multi-format production', 'Complete creative pipeline spanning ideation to distribution across all formats', 'When prospects evaluate advanced editing tools: highlight our end-to-end coverage vs their single-format focus', 'video_editing', true, 'global');
