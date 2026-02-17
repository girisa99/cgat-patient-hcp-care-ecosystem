/**
 * Provider Capability Matrix Data
 * 
 * Comprehensive data mapping all features × all providers
 * Based on Excel analysis + codebase audit
 * 
 * NOTE: Only includes CONFIGURED providers that we actively use
 * Removed: Suno (music), Runway (video) - not configured, can use ModelsLab/ElevenLabs
 */

import type { 
  Feature, 
  FeatureCategory, 
  ProviderSummary, 
  ProviderId,
  ProviderCapability 
} from './types';

// ============================================
// ALL FEATURES (from Excel + additional)
// ============================================

// ============================================
// FEATURE USE CASES & SCENARIOS
// ============================================
export const FEATURE_USE_CASES: Record<string, { scenarios: string[]; bestFor: string[]; limitations?: string[] }> = {
  // ============================================
  // INPUT FEATURES - Comprehensive Documentation
  // ============================================
  text_prompt: { 
    scenarios: ['Chat conversations', 'Script generation', 'Content creation', 'Translation requests', 'Image/video generation prompts'],
    bestFor: ['Quick ideation', 'Multi-turn dialogue', 'Creative writing', 'Technical documentation'],
    limitations: ['Context window limits vary by provider']
  },
  document_upload: { 
    scenarios: ['PDF analysis', 'DOCX editing', 'Contract review', 'Report summarization', 'Document translation'],
    bestFor: ['Long-form content processing', 'Legal documents', 'Research papers', 'Business reports'],
    limitations: ['File size limits', 'Complex layouts may need OCR']
  },
  url_input: { 
    scenarios: ['Web scraping', 'Article summarization', 'Research aggregation', 'Content repurposing'],
    bestFor: ['News analysis', 'Competitor research', 'Blog-to-video conversion'],
    limitations: ['Dynamic JS content may not load', 'Paywall content inaccessible']
  },
  image_upload: { 
    scenarios: ['Vision analysis', 'Image-to-image editing', 'Style transfer', 'Object detection', 'OCR extraction'],
    bestFor: ['Product photography', 'Medical imaging', 'Design iteration', 'Brand asset editing'],
    limitations: ['Resolution limits', 'Batch processing varies']
  },
  video_upload: { 
    scenarios: ['Video transcription', 'Scene analysis', 'Video-to-video processing', 'Content moderation'],
    bestFor: ['Training content review', 'Social media repurposing', 'Highlight extraction'],
    limitations: ['Duration limits', 'Large file sizes need chunking']
  },
  audio_upload: { 
    scenarios: ['Speech-to-text', 'Audio transcription', 'Voice analysis', 'Music separation'],
    bestFor: ['Podcast transcription', 'Meeting notes', 'Voiceover quality check'],
    limitations: ['Background noise impacts accuracy', 'Multi-speaker diarization varies']
  },
  pptx_import: { 
    scenarios: ['Slide analysis', 'Presentation enhancement', 'Content extraction', 'Template reuse'],
    bestFor: ['Legacy deck updates', 'Brand compliance checks', 'Content migration'],
    limitations: ['Complex animations may not preserve', 'Embedded media extraction']
  },
  voice_recording: { 
    scenarios: ['Live transcription', 'Voice commands', 'Interview capture', 'Note-taking'],
    bestFor: ['Real-time dictation', 'Accessibility', 'Field reporting'],
    limitations: ['Microphone quality matters', 'Accent recognition varies']
  },
  screen_recording: { 
    scenarios: ['Tutorial creation', 'Bug reporting', 'Demo capture', 'Workflow documentation'],
    bestFor: ['Software training', 'Support tickets', 'Process documentation'],
    limitations: ['Resolution/FPS tradeoffs', 'Sensitive data handling']
  },
  csv_data: { 
    scenarios: ['Data visualization', 'Analytics processing', 'Report generation', 'Trend analysis'],
    bestFor: ['Business intelligence', 'Financial modeling', 'Survey analysis'],
    limitations: ['Row/column limits', 'Complex formulas not supported']
  },
  
  // ============================================
  // SCRIPT FEATURES - Comprehensive Documentation
  // ============================================
  ai_script_gen: {
    scenarios: ['Presentation scripts', 'Video narration', 'Training content', 'Marketing copy', 'Educational material'],
    bestFor: ['Rapid content creation', 'Multi-language scripts', 'Brand-consistent messaging', 'Technical documentation'],
    limitations: ['May need human review for accuracy', 'Brand voice requires fine-tuning']
  },
  script_from_url: {
    scenarios: ['Blog-to-video conversion', 'Article repurposing', 'Research synthesis', 'News summarization'],
    bestFor: ['Content repurposing', 'Research aggregation', 'Competitor analysis', 'SEO content'],
    limitations: ['Dynamic content may not extract', 'Paywall restrictions']
  },
  script_editing: {
    scenarios: ['Tone adjustment', 'Length optimization', 'Clarity improvement', 'Grammar correction'],
    bestFor: ['Professional polish', 'Audience adaptation', 'Multi-iteration refinement', 'Translation prep'],
    limitations: ['May alter original intent', 'Style consistency needs attention']
  },
  tone_style: {
    scenarios: ['Professional vs casual', 'Technical vs conversational', 'Formal vs friendly', 'Industry-specific'],
    bestFor: ['Brand alignment', 'Audience targeting', 'Cross-cultural communication', 'Multi-channel content'],
    limitations: ['Subjective evaluation', 'Cultural nuances may need review']
  },
  audience_input: {
    scenarios: ['B2B vs B2C targeting', 'Age-appropriate content', 'Technical level adjustment', 'Industry customization'],
    bestFor: ['Personalized content', 'Targeted marketing', 'Educational materials', 'Healthcare communication'],
    limitations: ['Requires clear audience definition', 'May oversimplify complex topics']
  },
  script_length: {
    scenarios: ['Short social media', 'Medium blog posts', 'Long-form presentations', 'Video duration targeting'],
    bestFor: ['Platform optimization', 'Attention span matching', 'Time-constrained delivery', 'Content series'],
    limitations: ['Quality vs quantity tradeoff', 'May truncate important context']
  },
  multi_scene_script: {
    scenarios: ['Multi-slide presentations', 'Video chapters', 'Training modules', 'Story-driven content'],
    bestFor: ['Complex narratives', 'Educational sequences', 'Product demos', 'Onboarding flows'],
    limitations: ['Scene coherence needs review', 'Timing estimates vary']
  },
  speaker_notes: {
    scenarios: ['Presentation delivery', 'Training facilitation', 'Webinar hosting', 'Conference speaking'],
    bestFor: ['Presenter preparation', 'Talking points', 'Q&A anticipation', 'Timing guidance'],
    limitations: ['May not match presenter style', 'Needs personalization']
  },
  outline_gen: {
    scenarios: ['Content planning', 'Research organization', 'Curriculum design', 'Project scoping'],
    bestFor: ['Quick structuring', 'Brainstorming', 'Collaborative planning', 'Consistency across docs'],
    limitations: ['High-level only', 'May miss nuanced requirements']
  },
  content_summary: {
    scenarios: ['Document analysis', 'Meeting notes', 'Research synthesis', 'News briefings'],
    bestFor: ['Time savings', 'Key point extraction', 'Executive summaries', 'Quick reviews'],
    limitations: ['May miss nuanced details', 'Context dependency']
  },
  script_translation: {
    scenarios: ['Multi-language content', 'Global campaigns', 'Localization workflows', 'Subtitle translation'],
    bestFor: ['Rapid localization', 'Consistent terminology', 'Cost-effective translation', 'CJK markets'],
    limitations: ['Cultural adaptation needs review', 'Technical terms may need glossary']
  },
  script_to_slides: {
    scenarios: ['Auto-presentation', 'Training decks', 'Sales materials', 'Educational content'],
    bestFor: ['Rapid deck creation', 'Consistent formatting', 'Time savings', 'Template reuse'],
    limitations: ['May need visual refinement', 'Complex layouts need editing']
  },
  script_to_video_auto: {
    scenarios: ['Explainer videos', 'Training content', 'Marketing videos', 'Social media content'],
    bestFor: ['Rapid video production', 'Consistent branding', 'Scale content creation', 'Multi-language videos'],
    limitations: ['Quality varies by complexity', 'May need manual editing']
  },
  ai_rewrite: {
    scenarios: ['Style adaptation', 'Clarity improvement', 'Tone adjustment', 'SEO optimization'],
    bestFor: ['Content refresh', 'A/B testing', 'Audience adaptation', 'Quality improvement'],
    limitations: ['May lose original voice', 'Requires human validation']
  },
  brand_voice: {
    scenarios: ['Corporate messaging', 'Marketing consistency', 'Multi-channel content', 'Team alignment'],
    bestFor: ['Brand consistency', 'Team scaling', 'Content governance', 'Quality assurance'],
    limitations: ['Requires training data', 'May drift over time']
  },
  
  // ============================================
  // VOICE FEATURES - Comprehensive Documentation
  // ============================================
  tts: {
    scenarios: ['Video narration', 'Podcast intro', 'E-learning modules', 'Accessibility voiceover', 'IVR systems'],
    bestFor: ['Natural narration', 'Multi-language content', 'Brand voice consistency', 'Accessibility compliance'],
    limitations: ['Long content needs chunking', 'Emotion control varies by provider']
  },
  voice_cloning: {
    scenarios: ['CEO message localization', 'Training personalization', 'Podcast consistency', 'Brand spokesperson'],
    bestFor: ['Brand voice', 'Personalized content', 'Localization without re-recording', 'Consistent narrator'],
    limitations: ['Requires clean audio samples', 'Legal consent required', 'ElevenLabs only currently']
  },
  multi_language_voice: {
    scenarios: ['Global campaigns', 'Multilingual training', 'International webinars', 'Localized marketing'],
    bestFor: ['CJK markets (Alibaba)', 'European languages (ElevenLabs)', 'Cross-border content', 'Native accents'],
    limitations: ['Accent quality varies', 'Some languages limited voice options']
  },
  voice_emotion: {
    scenarios: ['Storytelling narration', 'Dramatic content', 'Customer service IVR', 'Children content'],
    bestFor: ['Emotional engagement', 'Brand personality', 'Entertainment content', 'Training with empathy'],
    limitations: ['Subtle emotions hard to control', 'Alibaba partial support only']
  },
  voice_speed: {
    scenarios: ['Accessibility compliance', 'Fast-paced ads', 'Slow educational content', 'Podcast pacing'],
    bestFor: ['Duration matching', 'Accessibility (slower)', 'Engagement (faster)', 'Platform requirements'],
    limitations: ['Extreme speeds affect quality', 'Pitch changes at high speeds']
  },
  ai_voice_count: {
    scenarios: ['Multi-character content', 'Diverse representation', 'A/B testing voices', 'Regional customization'],
    bestFor: ['Character variety', 'Audience matching', 'Brand testing', 'Accessibility options'],
    limitations: ['Quality varies by voice', 'Premium voices cost more']
  },
  
  // ============================================
  // PUBLISHING FEATURES - Use Cases
  // ============================================
  web_publish: {
    scenarios: ['Cloud hosting', 'Shareable links', 'Public presentations', 'Landing pages'],
    bestFor: ['Quick sharing', 'No-download viewing', 'Analytics tracking', 'Mobile access'],
    limitations: ['Bandwidth costs', 'Privacy considerations']
  },
  embed_website: {
    scenarios: ['Blog embedding', 'Product pages', 'Documentation', 'Course platforms'],
    bestFor: ['Seamless integration', 'Branded experience', 'SEO benefits', 'User engagement'],
    limitations: ['Iframe limitations', 'Cross-origin issues']
  },
  youtube_upload: {
    scenarios: ['Video distribution', 'SEO visibility', 'Monetization', 'Channel building'],
    bestFor: ['Massive reach', 'Search visibility', 'Community building', 'Analytics'],
    limitations: ['API quota limits', 'Content policies']
  },
  linkedin_post: {
    scenarios: ['Professional sharing', 'B2B marketing', 'Thought leadership', 'Recruitment'],
    bestFor: ['Business audience', 'Lead generation', 'Brand awareness', 'Networking'],
    limitations: ['Character limits', 'Media restrictions']
  },
  social_schedule: {
    scenarios: ['Multi-platform campaigns', 'Timed releases', 'Global audiences', 'Content calendars'],
    bestFor: ['Consistency', 'Time zone optimization', 'Team coordination', 'Campaign management'],
    limitations: ['Platform API changes', 'Scheduling conflicts']
  },
  password_protection: {
    scenarios: ['Confidential sharing', 'Gated content', 'Premium access', 'Secure distribution'],
    bestFor: ['Board decks', 'Financial reports', 'Pre-release content', 'NDA materials'],
    limitations: ['Password management', 'User friction']
  },
  analytics_embed: {
    scenarios: ['Viewer tracking', 'Engagement metrics', 'A/B testing', 'ROI measurement'],
    bestFor: ['Performance optimization', 'Content strategy', 'Stakeholder reporting', 'Conversion tracking'],
    limitations: ['Privacy compliance (GDPR)', 'Data retention limits']
  },
  
  // New Social Platforms
  instagram_publish: {
    scenarios: ['Reel publishing', 'Story posting', 'Carousel creation', 'IGTV uploads'],
    bestFor: ['Visual content', 'B2C marketing', 'Influencer campaigns', 'Brand awareness'],
    limitations: ['API restrictions', 'Business account required', 'Content format requirements']
  },
  tiktok_publish: {
    scenarios: ['Short-form videos', 'Trending content', 'Viral marketing', 'Gen Z engagement'],
    bestFor: ['Youth audience', 'Viral potential', 'Music integration', 'Creative content'],
    limitations: ['Duration limits', 'API access requirements', 'Regional availability']
  },
  threads_publish: {
    scenarios: ['Text updates', 'Thread conversations', 'Cross-posting from Instagram', 'Community engagement'],
    bestFor: ['Text-first content', 'Meta ecosystem', 'Real-time updates', 'Professional discourse'],
    limitations: ['Limited media support', 'New platform (evolving API)']
  },
  twitter_publish: {
    scenarios: ['Tweets', 'Thread creation', 'Media sharing', 'Real-time updates'],
    bestFor: ['News distribution', 'Customer service', 'Thought leadership', 'Quick updates'],
    limitations: ['Character limits', 'API rate limits', 'Verification requirements']
  },
  facebook_publish: {
    scenarios: ['Page posts', 'Group sharing', 'Event promotion', 'Video distribution'],
    bestFor: ['Broad demographics', 'Community building', 'Event marketing', 'Video content'],
    limitations: ['Algorithm changes', 'Organic reach decline', 'Business account required']
  },
  pinterest_publish: {
    scenarios: ['Pin creation', 'Board curation', 'Idea sharing', 'Product marketing'],
    bestFor: ['E-commerce', 'DIY/Craft', 'Recipe sharing', 'Visual discovery'],
    limitations: ['Niche audience', 'Image-focused only']
  },
  
  // OAuth & Security
  google_oauth: {
    scenarios: ['YouTube publishing', 'Drive integration', 'Calendar sync', 'Google Workspace'],
    bestFor: ['Full Google ecosystem', 'Enterprise SSO', 'Workspace integration', 'API access'],
    limitations: ['OAuth flow complexity', 'Token refresh management']
  },
  linkedin_oauth: {
    scenarios: ['Profile access', 'Post publishing', 'Company pages', 'Recruiter tools'],
    bestFor: ['B2B marketing', 'Professional networking', 'HR integration', 'Lead gen'],
    limitations: ['Restrictive API', 'Application review required']
  },
  tiktok_oauth: {
    scenarios: ['Video publishing', 'Analytics access', 'Creator tools', 'Business API'],
    bestFor: ['Creator accounts', 'Branded content', 'Analytics integration', 'Automated posting'],
    limitations: ['Developer account required', 'Regional restrictions']
  },
  instagram_oauth: {
    scenarios: ['Business publishing', 'Insights access', 'Story management', 'DM automation'],
    bestFor: ['Business accounts', 'Meta ecosystem', 'Cross-platform (Facebook)', 'Influencer tools'],
    limitations: ['Business/Creator account only', 'Meta approval process']
  },
  twitter_oauth: {
    scenarios: ['Tweet automation', 'Analytics access', 'DM management', 'Thread posting'],
    bestFor: ['Real-time engagement', 'Customer service bots', 'News distribution', 'API automation'],
    limitations: ['Rate limits', 'API tier pricing', 'Bot restrictions']
  },
  mfa_support: {
    scenarios: ['User authentication', 'Admin protection', 'Sensitive data access', 'Compliance requirements'],
    bestFor: ['Enterprise security', 'HIPAA compliance', 'Financial data', 'Healthcare'],
    limitations: ['User friction', 'Backup code management']
  },
  sso_integration: {
    scenarios: ['Enterprise login', 'Workspace integration', 'Multi-tenant access', 'Identity federation'],
    bestFor: ['Large organizations', 'IT governance', 'Seamless experience', 'Audit compliance'],
    limitations: ['SAML/OIDC complexity', 'Provider dependencies']
  },
  api_key_management: {
    scenarios: ['Secret rotation', 'Key generation', 'Access control', 'Usage tracking'],
    bestFor: ['Developer experience', 'Security best practices', 'API governance', 'Audit trails'],
    limitations: ['Key exposure risk', 'Rotation complexity']
  },
  session_management: {
    scenarios: ['Active session tracking', 'Force logout', 'Session timeout', 'Device management'],
    bestFor: ['Security compliance', 'User protection', 'Admin oversight', 'Multi-device support'],
    limitations: ['UX complexity', 'Storage requirements']
  },
  audit_logging: {
    scenarios: ['Action tracking', 'Compliance reporting', 'Security forensics', 'User activity'],
    bestFor: ['Regulatory compliance', 'Security monitoring', 'Troubleshooting', 'Accountability'],
    limitations: ['Storage costs', 'Performance impact', 'Retention policies']
  },
  
  // BUSINESS & COMPLIANCE USE CASES
  stripe_payments: {
    scenarios: ['One-time purchases', 'Credit packs', 'Pay-per-use', 'Digital products'],
    bestFor: ['E-commerce', 'SaaS', 'API credits', 'Token purchases'],
    limitations: ['Transaction fees', 'Regional availability']
  },
  stripe_subscriptions: {
    scenarios: ['Monthly plans', 'Annual subscriptions', 'Tiered pricing', 'Usage-based billing'],
    bestFor: ['SaaS products', 'Content platforms', 'API access tiers', 'Premium features'],
    limitations: ['Churn management', 'Proration complexity']
  },
  token_management: {
    scenarios: ['AI credit allocation', 'Usage tracking', 'Balance management', 'Prepaid credits'],
    bestFor: ['AI platforms', 'API services', 'Metered services', 'Freemium models'],
    limitations: ['Token valuation', 'Expiry management']
  },
  api_rate_limits: {
    scenarios: ['Throttling', 'Quota management', 'Fair usage', 'Burst control'],
    bestFor: ['API protection', 'Cost control', 'DDoS prevention', 'SLA enforcement'],
    limitations: ['User experience', 'Complex tier logic']
  },
  hipaa_compliance: {
    scenarios: ['Healthcare data', 'PHI handling', 'Medical records', 'Patient portals'],
    bestFor: ['Healthcare SaaS', 'Telehealth', 'Medical AI', 'Health records'],
    limitations: ['BAA requirements', 'Audit burden', 'Infrastructure costs']
  },
  gdpr_compliance: {
    scenarios: ['EU users', 'Data subject rights', 'Consent management', 'Data portability'],
    bestFor: ['Global platforms', 'EU market', 'Privacy-first', 'B2C products'],
    limitations: ['Consent complexity', 'Right to deletion']
  },
  ccpa_compliance: {
    scenarios: ['California users', 'Opt-out rights', 'Data sales disclosure', 'Privacy notices'],
    bestFor: ['US market', 'Consumer products', 'Data monetization', 'E-commerce'],
    limitations: ['State-specific', 'Opt-out management']
  },
  terms_conditions: {
    scenarios: ['User agreements', 'Service terms', 'Liability limits', 'Usage policies'],
    bestFor: ['Legal protection', 'User clarity', 'Dispute prevention', 'Service boundaries'],
    limitations: ['Legal review required', 'Jurisdiction complexity']
  },
  privacy_policy: {
    scenarios: ['Data collection', 'Cookie usage', 'Third-party sharing', 'User rights'],
    bestFor: ['Legal compliance', 'Transparency', 'Trust building', 'App store requirements'],
    limitations: ['Frequent updates', 'Multi-jurisdiction']
  },
  ai_transparency: {
    scenarios: ['AI disclosure', 'Model attribution', 'Bias warnings', 'Limitation statements'],
    bestFor: ['AI products', 'Content generation', 'Automated decisions', 'Trust building'],
    limitations: ['Evolving regulations', 'Technical complexity']
  },
  adult_protection: {
    scenarios: ['Age-gated content', 'NSFW filtering', 'Content moderation', 'Safe search'],
    bestFor: ['Content platforms', 'AI generators', 'User safety', 'Brand protection'],
    limitations: ['False positives', 'Regional laws']
  },
  coppa_compliance: {
    scenarios: ['Children under 13', 'Parental consent', 'Data minimization', 'Age verification'],
    bestFor: ['Educational apps', 'Family products', 'Games', 'Social platforms'],
    limitations: ['Age verification difficulty', 'Consent flow UX']
  },
  content_moderation: {
    scenarios: ['User-generated content', 'AI output filtering', 'Harmful content detection', 'Policy enforcement'],
    bestFor: ['Social platforms', 'AI generators', 'Community safety', 'Brand reputation'],
    limitations: ['Context understanding', 'Bias in models']
  },
  baa_agreements: {
    scenarios: ['Healthcare vendors', 'HIPAA partnerships', 'PHI sharing', 'Compliance chain'],
    bestFor: ['Healthcare B2B', 'Medical SaaS', 'Health data processing', 'Telehealth'],
    limitations: ['Legal negotiation', 'Liability allocation']
  },

  // ============================================
  // EXPORT FEATURES - Enhanced with 120+ Language Support
  // ============================================
  pptx_export: {
    scenarios: ['Presentation download', 'Offline sharing', 'Enterprise distribution', 'Template reuse'],
    bestFor: ['Executive decks', 'Sales materials', 'Training content', 'Editable handoffs'],
    limitations: ['Complex animations may not preserve', 'Large file sizes']
  },
  pdf_export: {
    scenarios: ['Print-ready documents', 'Static sharing', 'Archival', 'Compliance documentation'],
    bestFor: ['Legal documents', 'Reports', 'Handouts', 'Print materials'],
    limitations: ['Not editable', 'No animation support']
  },
  mp4_export: {
    scenarios: ['Video sharing', 'Social media', 'LMS upload', 'Webinar recordings'],
    bestFor: ['Marketing videos', 'Training modules', 'Social content', 'Presentations'],
    limitations: ['File size', 'Encoding time for 4K']
  },
  html_export: {
    scenarios: ['Web embedding', 'Self-hosted presentations', 'Interactive content', 'Documentation'],
    bestFor: ['Developer docs', 'Product demos', 'Interactive training', 'Web publishing'],
    limitations: ['Browser dependencies', 'Hosting required']
  },
  multilang_export: {
    scenarios: ['Global distribution', 'CJK font embedding', 'RTL language support', 'African script support'],
    bestFor: ['Multinational companies', 'Localized content', 'Inclusive design', 'Government documents'],
    limitations: ['Larger file sizes for font embedding', 'Complex layout for mixed scripts']
  },
  dom_capture: {
    scenarios: ['3D content export', 'Animation capture', 'Interactive element preservation', 'Avatar screenshots'],
    bestFor: ['Immersive presentations', '3D product demos', 'Animated infographics', 'Dynamic dashboards'],
    limitations: ['Static representation of dynamic content', 'Performance for complex scenes']
  },

  // ============================================
  // EDITING FEATURES - Generative Editor Refinement
  // ============================================
  regenerate: {
    scenarios: ['Complete redo', 'Alternative versions', 'Creative exploration', 'Quality improvement'],
    bestFor: ['Unsatisfactory results', 'A/B testing', 'Iterative design', 'Brainstorming'],
    limitations: ['Credit consumption', 'May lose desired elements']
  },
  enhance: {
    scenarios: ['Quality boost', 'Resolution improvement', 'Detail addition', 'Professional polish'],
    bestFor: ['Draft refinement', 'Pre-publish cleanup', 'Image upscaling', 'Voice clarity'],
    limitations: ['May alter original intent', 'Processing time']
  },
  refine: {
    scenarios: ['Targeted adjustments', 'Minor corrections', 'Style tweaks', 'Tone shifts'],
    bestFor: ['Fine-tuning', 'Client feedback', 'Brand alignment', 'Consistency checks'],
    limitations: ['Subtle changes only', 'May need multiple iterations']
  },
  polish: {
    scenarios: ['Professional review', 'Grammar correction', 'Clarity improvement', 'Executive ready'],
    bestFor: ['Final review', 'C-suite presentations', 'Published content', 'External communications'],
    limitations: ['May change voice', 'Requires human validation']
  },
  translate_element: {
    scenarios: ['In-place localization', 'Mixed-language content', 'Subtitle translation', 'Element-level targeting'],
    bestFor: ['Multilingual decks', 'Global teams', 'Quick localization', 'Partial translations'],
    limitations: ['Cultural context needs review', 'Layout shifts for different text lengths']
  },
  version_history: {
    scenarios: ['Change tracking', 'Rollback', 'Comparison', 'Audit trail'],
    bestFor: ['Collaborative editing', 'Client revisions', 'Compliance', 'Learning from changes'],
    limitations: ['Storage overhead', 'History depth limits']
  },
  batch_edit: {
    scenarios: ['Bulk updates', 'Style propagation', 'Mass translation', 'Template application'],
    bestFor: ['Large decks', 'Brand refreshes', 'Consistency enforcement', 'Time savings'],
    limitations: ['May introduce errors', 'Review overhead']
  },

  // ============================================
  // PIPELINE FEATURES - Transformation Orchestration
  // ============================================
  idea_to_presentation: {
    scenarios: ['Rapid prototyping', 'Pitch deck creation', 'Conference talks', 'Training outlines'],
    bestFor: ['Quick starts', 'Idea validation', 'Time-pressed executives', 'Non-designers'],
    limitations: ['May need refinement', 'Generic without context']
  },
  document_to_presentation: {
    scenarios: ['Report conversion', 'Research summarization', 'Proposal visualization', 'Document repurposing'],
    bestFor: ['Academic presentations', 'Business reports', 'Technical documentation', 'Content reuse'],
    limitations: ['Complex formatting may not translate', 'Image extraction quality']
  },
  presentation_to_video: {
    scenarios: ['Video marketing', 'E-learning modules', 'Webinar recordings', 'Social clips'],
    bestFor: ['Async training', 'YouTube content', 'Marketing campaigns', 'Sales enablement'],
    limitations: ['Voice quality depends on TTS provider', 'Timing synchronization']
  },
  script_to_avatar: {
    scenarios: ['Training videos', 'Product explainers', 'Customer support', 'Corporate messaging'],
    bestFor: ['Scalable video production', 'Multilingual content', 'Consistent branding', 'Cost reduction'],
    limitations: ['Avatar realism varies', 'Lip-sync quality']
  },
  multilingual_dub: {
    scenarios: ['Global campaigns', 'International training', 'Localized marketing', 'Accessibility'],
    bestFor: ['Multinational companies', 'E-learning platforms', 'Media companies', 'Government'],
    limitations: ['Voice matching across languages', 'Cultural adaptation needs review']
  },
  a2a_orchestration: {
    scenarios: ['Multi-step workflows', 'Complex generation', 'Pipeline coordination', 'Agent handoffs'],
    bestFor: ['Enterprise automation', 'Complex content production', 'Multi-modal generation', 'Scale operations'],
    limitations: ['Orchestration complexity', 'Error handling across agents']
  },

  // ============================================
  // SFX FEATURES - Sound Effects Use Cases
  // ============================================
  ai_sfx_generation: {
    scenarios: ['Video sound design', 'Podcast effects', 'Game audio', 'App sounds', 'Presentation audio'],
    bestFor: ['Custom sound creation', 'Unique audio branding', 'Rapid prototyping', 'Content enhancement'],
    limitations: ['Quality varies by prompt', 'Complex sounds may need editing']
  },
  elevenlabs_sfx: {
    scenarios: ['Professional SFX', 'Trailer audio', 'Advertisement sounds', 'Interactive media'],
    bestFor: ['High-quality effects', 'Commercial production', 'Brand audio', 'Premium content'],
    limitations: ['Credit consumption', 'Rate limits']
  },
  ambient_audio: {
    scenarios: ['Background ambience', 'Meditation apps', 'ASMR content', 'Atmospheric videos'],
    bestFor: ['Mood setting', 'Focus content', 'Relaxation audio', 'Immersive experiences'],
    limitations: ['Loop continuity', 'Genre variety']
  },
  sound_library: {
    scenarios: ['Quick sound selection', 'Royalty-free audio', 'Common effects', 'Standard sounds'],
    bestFor: ['Fast turnaround', 'Budget production', 'Template content', 'Basic needs'],
    limitations: ['Limited uniqueness', 'Overused sounds']
  },
  audio_effects: {
    scenarios: ['Voice effects', 'Audio styling', 'Sound manipulation', 'Creative audio'],
    bestFor: ['Post-production', 'Audio enhancement', 'Special effects', 'Artistic expression'],
    limitations: ['Processing time', 'Quality degradation with heavy effects']
  },
  foley_generation: {
    scenarios: ['Film sound design', 'Video games', 'Animation', 'Documentary'],
    bestFor: ['Realistic sounds', 'Scene enhancement', 'Immersive audio', 'Professional production'],
    limitations: ['Context accuracy', 'Complex actions']
  },
  music_stems: {
    scenarios: ['Remix creation', 'Karaoke tracks', 'Music production', 'Content adaptation'],
    bestFor: ['Audio isolation', 'Creative remixing', 'Educational content', 'Cover versions'],
    limitations: ['Separation quality', 'Complex mixes']
  },
  audio_mix_master: {
    scenarios: ['Final audio polish', 'Podcast production', 'Video mastering', 'Music finishing'],
    bestFor: ['Professional output', 'Consistent levels', 'Broadcast ready', 'Quality assurance'],
    limitations: ['Automated limitations', 'Genre-specific needs']
  },

  // ============================================
  // DOWNLOAD FEATURES - Export & Distribution Use Cases
  // ============================================
  universal_download: {
    scenarios: ['One-click export', 'Multi-format download', 'Quick sharing', 'Archive creation'],
    bestFor: ['Convenience', 'Time savings', 'Workflow efficiency', 'Universal access'],
    limitations: ['File size limits', 'Network dependency']
  },
  platform_downloads: {
    scenarios: ['Social media optimization', 'Platform-specific formats', 'Vertical video', 'Thumbnail generation'],
    bestFor: ['Social content', 'Marketing assets', 'Cross-platform distribution', 'Optimized delivery'],
    limitations: ['Platform API changes', 'Format restrictions']
  },
  vfx_download: {
    scenarios: ['VFX asset library', 'Effect templates', 'Animation exports', 'Creative assets'],
    bestFor: ['Professional editing', 'Asset reuse', 'Template creation', 'Creative workflow'],
    limitations: ['Large file sizes', 'Format compatibility']
  },
  media_library_export: {
    scenarios: ['Bulk download', 'Asset backup', 'Project archival', 'Team sharing'],
    bestFor: ['Organization', 'Backup strategy', 'Migration', 'Collaboration'],
    limitations: ['Storage requirements', 'Download time']
  },
  cloud_sync_download: {
    scenarios: ['Google Drive sync', 'Dropbox integration', 'OneDrive backup', 'Cloud collaboration'],
    bestFor: ['Remote access', 'Team workflows', 'Automatic backup', 'Cross-device access'],
    limitations: ['Sync conflicts', 'API quotas']
  },
  batch_download: {
    scenarios: ['Multi-asset export', 'Project completion', 'Bulk delivery', 'Archive creation'],
    bestFor: ['Efficiency', 'Project handoffs', 'Client delivery', 'Asset organization'],
    limitations: ['Processing time', 'Memory usage']
  },
  offline_package: {
    scenarios: ['Internet-free viewing', 'Kiosk presentations', 'Trade show displays', 'Portable content'],
    bestFor: ['Reliable playback', 'No-network environments', 'Embedded displays', 'Self-contained delivery'],
    limitations: ['File size', 'No live updates']
  },
  source_files_export: {
    scenarios: ['Editable handoff', 'Team collaboration', 'Future modifications', 'Version control'],
    bestFor: ['Client delivery', 'Ongoing projects', 'Design flexibility', 'Professional workflows'],
    limitations: ['Format support', 'Feature preservation']
  },
  branding_kit_export: {
    scenarios: ['Brand guidelines', 'Asset packages', 'Marketing kits', 'Partner distribution'],
    bestFor: ['Brand consistency', 'Team alignment', 'External agencies', 'Franchise distribution'],
    limitations: ['Customization limits', 'Update management']
  },
  api_download: {
    scenarios: ['Programmatic access', 'Integration workflows', 'Automated exports', 'Custom applications'],
    bestFor: ['Developer workflows', 'Enterprise integration', 'Custom pipelines', 'Automation'],
    limitations: ['API rate limits', 'Authentication complexity']
  },

  // ═══════════════════════════════════════════════════════════════
  // 3D FEATURES - Comprehensive Scenario Mappings
  // ═══════════════════════════════════════════════════════════════
  '3d_text': {
    scenarios: ['Product titles', 'Logo animations', 'Title sequences', 'Brand elements'],
    bestFor: ['Marketing videos', 'Title cards', 'Logo reveals', 'Promotional content'],
    limitations: ['Font compatibility', 'Complex scripts need testing']
  },
  '3d_objects': {
    scenarios: ['Product visualization', 'Architectural demos', 'Educational models', 'Interactive presentations'],
    bestFor: ['E-commerce', 'Real estate', 'Science education', 'Manufacturing'],
    limitations: ['File size for complex models', 'Rendering performance']
  },
  '3d_scene_gen': {
    scenarios: ['Virtual environments', 'Game levels', 'Architectural viz', 'Training simulations'],
    bestFor: ['VR experiences', 'Metaverse content', 'Film previs', 'Product staging'],
    limitations: ['Complexity limits', 'Generation time for detailed scenes']
  },
  '3d_avatar': {
    scenarios: ['Digital humans', 'Game characters', 'Virtual influencers', 'Training personas'],
    bestFor: ['Gaming', 'Metaverse', 'Corporate training', 'Brand mascots'],
    limitations: ['Uncanny valley risk', 'Rigging complexity']
  },
  mesh_generation: {
    scenarios: ['Product prototyping', 'Game assets', 'Architectural elements', 'Custom objects'],
    bestFor: ['Rapid prototyping', 'Asset creation', 'Concept visualization', 'Manufacturing preview'],
    limitations: ['Quality varies by complexity', 'May need manual refinement']
  },
  image_to_3d: {
    scenarios: ['Photo-to-product', 'Character creation', 'Asset digitization', 'Reference-based modeling'],
    bestFor: ['E-commerce', 'Digital twins', 'Asset libraries', 'Quick prototyping'],
    limitations: ['Single view limitations', 'Texture accuracy']
  },
  pbr_textures: {
    scenarios: ['Realistic materials', 'Product renders', 'Game assets', 'Architectural viz'],
    bestFor: ['High-fidelity rendering', 'Professional visualization', 'AAA quality assets'],
    limitations: ['Large file sizes', 'Requires compatible renderer']
  },
  '3d_rigging': {
    scenarios: ['Character animation', 'Product demonstrations', 'Tutorial animations', 'Game development'],
    bestFor: ['Animation pipelines', 'Interactive 3D', 'Game characters', 'Educational content'],
    limitations: ['Complex characters need manual adjustment', 'Bone count limits']
  },
  '3d_animation': {
    scenarios: ['Product demos', 'Explainer videos', 'Game cutscenes', 'Marketing content'],
    bestFor: ['Dynamic presentations', 'Animated explainers', 'Interactive experiences'],
    limitations: ['Rendering time', 'File size for long animations']
  },
  '3d_export_formats': {
    scenarios: ['Web deployment', 'AR apps', 'Game engines', 'CAD integration'],
    bestFor: ['Cross-platform delivery', 'AR Quick Look', 'Unity/Unreal', 'Web 3D'],
    limitations: ['Format-specific features may not transfer', 'Optimization needed per platform']
  },
  stylized_3d: {
    scenarios: ['Cartoon characters', 'Anime assets', 'Children content', 'Brand mascots'],
    bestFor: ['Entertainment', 'Educational games', 'Social media', 'Unique brand identity'],
    limitations: ['Style consistency', 'Less suitable for professional/corporate']
  },
  product_3d: {
    scenarios: ['E-commerce catalogs', 'Configurators', 'Marketing materials', 'Packaging preview'],
    bestFor: ['Online retail', 'Product launches', 'Customer engagement', 'Reduced photography costs'],
    limitations: ['Material accuracy', 'Complex product assembly']
  },

  // ═══════════════════════════════════════════════════════════════
  // AR/VR FEATURES - Comprehensive Scenario Mappings
  // ═══════════════════════════════════════════════════════════════
  ar_preview: {
    scenarios: ['Furniture placement', 'Product try-on', 'Architecture preview', 'Educational AR'],
    bestFor: ['E-commerce AR', 'Real estate', 'Manufacturing', 'Training simulations'],
    limitations: ['Device compatibility', 'Lighting conditions affect quality']
  },
  vr_export: {
    scenarios: ['Immersive training', 'Virtual tours', 'Entertainment', 'Therapeutic applications'],
    bestFor: ['Corporate training', 'Tourism', 'Healthcare', 'Education'],
    limitations: ['Headset requirements', 'Motion sickness considerations']
  },
  spatial: {
    scenarios: ['Apple Vision Pro apps', 'Mixed reality presentations', '3D document viewing', 'Collaborative workspaces'],
    bestFor: ['Enterprise presentations', 'Design review', 'Remote collaboration', 'Premium experiences'],
    limitations: ['Limited device adoption', 'Development complexity']
  },
  immersive: {
    scenarios: ['Keynote presentations', 'Product showcases', 'Virtual showrooms', 'Brand experiences'],
    bestFor: ['Executive presentations', 'Trade shows', 'Investor pitches', 'Marketing events'],
    limitations: ['Requires preparation', 'Hardware dependencies']
  },
  webxr: {
    scenarios: ['Browser AR/VR', 'No-app experiences', 'Web-based training', 'Interactive demos'],
    bestFor: ['Accessibility', 'Low-friction experiences', 'Wide reach', 'Marketing campaigns'],
    limitations: ['Browser performance', 'Feature limitations vs native']
  },
  ar_filters: {
    scenarios: ['Social media content', 'Brand activations', 'Try-before-buy', 'Entertainment'],
    bestFor: ['Gen Z marketing', 'Product trials', 'User-generated content', 'Viral campaigns'],
    limitations: ['Platform-specific formats', 'Face tracking accuracy']
  },
  ar_product_view: {
    scenarios: ['Furniture visualization', 'Appliance sizing', 'Art placement', 'Decor preview'],
    bestFor: ['Home goods retail', 'Automotive', 'Luxury products', 'Real estate staging'],
    limitations: ['Scale accuracy', 'Surface detection quality']
  },
  mixed_reality: {
    scenarios: ['Industrial training', 'Surgery simulation', 'Remote assistance', 'Design review'],
    bestFor: ['Manufacturing', 'Healthcare', 'Architecture', 'Field service'],
    limitations: ['High hardware costs', 'Complex content creation']
  },
  vr_360_video: {
    scenarios: ['Virtual tours', 'Event coverage', 'Documentary', 'Training environments'],
    bestFor: ['Real estate', 'Tourism', 'Journalism', 'Safety training'],
    limitations: ['Large file sizes', 'Stitching quality', 'Motion sickness']
  },
  hand_tracking: {
    scenarios: ['Gesture control', 'Sign language', 'Medical training', 'Interactive installations'],
    bestFor: ['Accessibility', 'Natural interaction', 'Medical simulation', 'Art exhibitions'],
    limitations: ['Tracking accuracy', 'Gesture recognition limits']
  },

  // ═══════════════════════════════════════════════════════════════
  // EXPANDED VIDEO/AVATAR FEATURES - Comprehensive Scenario Mappings
  // ═══════════════════════════════════════════════════════════════
  ai_avatars: {
    scenarios: ['Training videos', 'Product demos', 'Customer support', 'Corporate communications', 'E-learning'],
    bestFor: ['Scalable video production', 'Multilingual content', 'Cost reduction', 'Brand consistency'],
    limitations: ['Avatar realism varies', 'Limited customization on basic tiers']
  },
  custom_avatar: {
    scenarios: ['Brand spokesperson', 'Personal avatar', 'Influencer clone', 'Executive presenter'],
    bestFor: ['Brand personalization', 'CEO messages', 'Consistent narrator', 'Unique identity'],
    limitations: ['Photo/video input quality', 'Training time', 'Premium tier required']
  },
  full_body_avatar: {
    scenarios: ['Product demos with gestures', 'Training with physical demonstrations', 'Metaverse presence', 'Virtual events'],
    bestFor: ['Physical product demos', 'Exercise/fitness content', 'Interactive presentations', 'Virtual influencers'],
    limitations: ['Alibaba OmniAvatar only', 'Enterprise tier', 'Higher costs']
  },
  avatar_gestures: {
    scenarios: ['Emphasizing points', 'Product pointing', 'Emotional expression', 'Cultural gestures'],
    bestFor: ['Engaging presentations', 'Sales demos', 'Training with emphasis', 'Regional customization'],
    limitations: ['Limited gesture library', 'Regional appropriateness needs review']
  },
  avatar_expressions: {
    scenarios: ['Emotional storytelling', 'Customer service empathy', 'Children content', 'Entertainment'],
    bestFor: ['Narrative videos', 'Support videos', 'Educational content', 'Brand personality'],
    limitations: ['Subtle expressions hard to control', 'Uncanny valley risk']
  },
  lip_sync: {
    scenarios: ['Talking head videos', 'Dubbing', 'Audio-to-video sync', 'Personalized messages'],
    bestFor: ['Training videos', 'Marketing', 'Localization', 'Corporate comms'],
    limitations: ['Audio quality affects results', 'Complex mouth movements']
  },
  lip_sync_audio: {
    scenarios: ['Voice-over sync', 'Podcast visualization', 'Audio book videos', 'Music videos'],
    bestFor: ['Audio content visualization', 'Accessible content', 'Podcast promotion'],
    limitations: ['Requires clean audio', 'Timing sync precision']
  },
  lip_sync_realtime: {
    scenarios: ['Live streaming', 'Virtual meetings', 'Real-time avatars', 'Gaming'],
    bestFor: ['Live events', 'Virtual influencers', 'Interactive experiences'],
    limitations: ['Latency', 'Compute requirements', 'Quality trade-offs']
  },
  talking_photo: {
    scenarios: ['Historical figures', 'Memorial videos', 'Photo revival', 'Marketing campaigns'],
    bestFor: ['Educational content', 'Personal memories', 'Creative marketing', 'Storytelling'],
    limitations: ['Photo quality requirements', 'Ethical considerations']
  },
  video_dubbing: {
    scenarios: ['Movie/show dubbing', 'Training localization', 'Marketing adaptation', 'Accessibility'],
    bestFor: ['Global content distribution', 'E-learning platforms', 'Media companies'],
    limitations: ['Voice matching', 'Lip-sync alignment', 'Cultural adaptation']
  },

  // ═══════════════════════════════════════════════════════════════
  // EXPANDED ANIMATION FEATURES - Comprehensive Scenario Mappings
  // ═══════════════════════════════════════════════════════════════
  kinetic_typography: {
    scenarios: ['Lyric videos', 'Quote animations', 'Title sequences', 'Social media content'],
    bestFor: ['Music videos', 'Inspirational content', 'Brand messaging', 'Reels/TikTok'],
    limitations: ['Text-heavy content only', 'Language/script complexity']
  },
  character_animation: {
    scenarios: ['Mascot animation', 'Explainer videos', 'Game cutscenes', 'Educational content'],
    bestFor: ['Brand storytelling', 'Children content', 'Gaming', 'Entertainment'],
    limitations: ['Rigging required', 'Animation keyframing needed']
  },
  skeletal_animation: {
    scenarios: ['Character movement', 'Dance sequences', 'Action scenes', 'Motion transfer'],
    bestFor: ['Gaming', 'Film production', 'Sports analysis', 'Medical training'],
    limitations: ['Complex setup', 'Retargeting for different characters']
  },
  procedural_animation: {
    scenarios: ['Crowds', 'Nature simulations', 'Abstract visuals', 'Data visualization'],
    bestFor: ['Large-scale scenes', 'Dynamic backgrounds', 'Artistic content', 'Scientific viz'],
    limitations: ['Control precision', 'Rendering complexity']
  },
};

export const ALL_FEATURES: Feature[] = [
  // INPUT FEATURES - Now with descriptions
  { id: 'text_prompt', name: 'Text Prompt', category: 'INPUT', priority: 'critical', description: 'Natural language input for all AI capabilities' },
  { id: 'document_upload', name: 'Document Upload (DOCX/PDF)', category: 'INPUT', priority: 'critical', description: 'Upload and analyze documents' },
  { id: 'url_input', name: 'URL/Web Page Input', category: 'INPUT', priority: 'high', description: 'Extract and analyze web content' },
  { id: 'image_upload', name: 'Image Upload', category: 'INPUT', priority: 'high', description: 'Upload images for vision analysis or editing' },
  { id: 'video_upload', name: 'Video Upload', category: 'INPUT', priority: 'medium', description: 'Upload videos for analysis or processing' },
  { id: 'audio_upload', name: 'Audio Upload', category: 'INPUT', priority: 'medium', description: 'Upload audio for transcription or analysis' },
  { id: 'pptx_import', name: 'PowerPoint Import', category: 'INPUT', priority: 'high', description: 'Import and enhance presentations' },
  { id: 'voice_recording', name: 'Voice Recording', category: 'INPUT', priority: 'medium', description: 'Real-time voice capture and transcription' },
  { id: 'screen_recording', name: 'Screen Recording', category: 'INPUT', priority: 'medium', description: 'Capture screen for tutorials or demos' },
  { id: 'csv_data', name: 'CSV/Data Files', category: 'INPUT', priority: 'medium', description: 'Import data for analysis and visualization' },
  
  // SCRIPT FEATURES
  { id: 'ai_script_gen', name: 'AI Script Generation', category: 'SCRIPT', priority: 'critical' },
  { id: 'script_from_url', name: 'Script from URL/Document', category: 'SCRIPT', priority: 'high' },
  { id: 'script_editing', name: 'Script Editing/Refinement', category: 'SCRIPT', priority: 'high' },
  { id: 'tone_style', name: 'Tone/Style Selection', category: 'SCRIPT', priority: 'medium' },
  { id: 'audience_input', name: 'Target Audience Input', category: 'SCRIPT', priority: 'medium' },
  { id: 'script_length', name: 'Script Length Control', category: 'SCRIPT', priority: 'medium' },
  { id: 'multi_scene_script', name: 'Multi-Scene Script Gen', category: 'SCRIPT', priority: 'high' },
  { id: 'speaker_notes', name: 'Speaker Notes Generation', category: 'SCRIPT', priority: 'medium' },
  { id: 'outline_gen', name: 'Outline Generation', category: 'SCRIPT', priority: 'high' },
  { id: 'content_summary', name: 'Content Summarization', category: 'SCRIPT', priority: 'high' },
  { id: 'script_translation', name: 'Script Translation', category: 'SCRIPT', priority: 'high' },
  { id: 'script_to_slides', name: 'Script-to-Slides Auto', category: 'SCRIPT', priority: 'critical' },
  { id: 'script_to_video_auto', name: 'Script-to-Video Auto', category: 'SCRIPT', priority: 'high' },
  { id: 'ai_rewrite', name: 'AI Rewrite/Improve', category: 'SCRIPT', priority: 'high' },
  { id: 'brand_voice', name: 'Brand Voice Training', category: 'SCRIPT', priority: 'medium' },
  
  // VOICE FEATURES
  { id: 'tts', name: 'Text-to-Speech (TTS)', category: 'VOICE', priority: 'critical' },
  { id: 'voice_cloning', name: 'Voice Cloning', category: 'VOICE', priority: 'high' },
  { id: 'multi_language_voice', name: 'Multiple Language Voices', category: 'VOICE', priority: 'high' },
  { id: 'voice_emotion', name: 'Voice Emotion Control', category: 'VOICE', priority: 'medium' },
  { id: 'voice_speed', name: 'Voice Speed/Pitch Control', category: 'VOICE', priority: 'medium' },
  { id: 'ai_voice_count', name: 'AI Voice Options (500+)', category: 'VOICE', priority: 'high' },
  
  // AUDIO FEATURES
  { id: 'stt', name: 'Speech-to-Text (STT)', category: 'AUDIO', priority: 'critical' },
  { id: 'bg_music', name: 'Background Music Library', category: 'AUDIO', priority: 'medium' },
  { id: 'sfx_library', name: 'Sound Effects Library', category: 'AUDIO', priority: 'medium' },
  { id: 'ai_music_gen', name: 'AI Music Generation', category: 'AUDIO', priority: 'medium' },
  { id: 'ai_sfx_gen', name: 'AI SFX Generation', category: 'AUDIO', priority: 'medium' },
  { id: 'noise_reduction', name: 'Audio Noise Reduction', category: 'AUDIO', priority: 'medium' },
  { id: 'audio_ducking', name: 'Audio Ducking', category: 'AUDIO', priority: 'low' },
  { id: 'multi_track', name: 'Multi-Track Audio', category: 'AUDIO', priority: 'low' },
  { id: 'audio_sync', name: 'Audio Sync to Video', category: 'AUDIO', priority: 'medium' },
  
  // IMAGE FEATURES
  { id: 'ai_image_gen', name: 'AI Image Generation', category: 'IMAGE', priority: 'critical' },
  { id: 'text_to_image', name: 'Text-to-Image', category: 'IMAGE', priority: 'critical' },
  { id: 'image_to_image', name: 'Image-to-Image Edit', category: 'IMAGE', priority: 'high' },
  { id: 'bg_removal', name: 'Background Removal', category: 'IMAGE', priority: 'high' },
  { id: 'bg_generation', name: 'Background Generation', category: 'IMAGE', priority: 'medium' },
  { id: 'image_upscaling', name: 'Image Upscaling', category: 'IMAGE', priority: 'medium' },
  { id: 'object_removal', name: 'Object Removal (Eraser)', category: 'IMAGE', priority: 'medium' },
  { id: 'image_filters', name: 'Image Filters/Effects', category: 'IMAGE', priority: 'low' },
  { id: 'stock_images', name: 'Stock Image Library', category: 'IMAGE', priority: 'medium' },
  { id: 'image_animation', name: 'Image Animation', category: 'IMAGE', priority: 'medium' },
  { id: 'smart_crop', name: 'Smart Crop/Resize', category: 'IMAGE', priority: 'medium' },
  { id: 'style_transfer', name: 'Image Style Transfer', category: 'IMAGE', priority: 'medium' },
  { id: 'controlnet', name: 'ControlNet (Pose/Depth)', category: 'IMAGE', priority: 'high' },
  { id: 'inpainting', name: 'Inpainting', category: 'IMAGE', priority: 'high' },
  
  // ═══════════════════════════════════════════════════════════════
  // VIDEO FEATURES - Expanded for AI Avatar & Lip-sync
  // ═══════════════════════════════════════════════════════════════
  { id: 'text_to_video', name: 'Text-to-Video (AI Gen)', category: 'VIDEO', priority: 'critical', description: 'Generate video from text prompts' },
  { id: 'image_to_video', name: 'Image-to-Video', category: 'VIDEO', priority: 'high', description: 'Animate still images' },
  { id: 'script_to_video', name: 'Script-to-Video', category: 'VIDEO', priority: 'high', description: 'Full video from script' },
  { id: 'url_to_video', name: 'URL/Blog to Video', category: 'VIDEO', priority: 'medium', description: 'Convert web content to video' },
  { id: 'ppt_to_video', name: 'PPT to Video', category: 'VIDEO', priority: 'high', description: 'Convert presentations to video' },
  { id: 'video_trimming', name: 'Video Trimming/Cutting', category: 'VIDEO', priority: 'medium', description: 'Cut and trim video segments' },
  { id: 'video_merging', name: 'Video Merging', category: 'VIDEO', priority: 'medium', description: 'Combine multiple video clips' },
  { id: 'speed_control', name: 'Speed Control', category: 'VIDEO', priority: 'medium', description: 'Slow-mo and speed up' },
  { id: 'video_transitions', name: 'Video Transitions', category: 'VIDEO', priority: 'medium', description: 'Smooth scene transitions' },
  { id: 'ai_avatars', name: 'AI Avatars', category: 'VIDEO', priority: 'critical', description: 'AI-generated talking avatars' },
  { id: 'custom_avatar', name: 'Custom Avatar Creation', category: 'VIDEO', priority: 'high', description: 'Create personalized avatars' },
  { id: 'full_body_avatar', name: 'Full-Body Avatar', category: 'VIDEO', priority: 'high', description: 'Full-body animated characters' },
  { id: 'avatar_gestures', name: 'Avatar Gestures', category: 'VIDEO', priority: 'medium', description: 'Hand and body gestures' },
  { id: 'avatar_expressions', name: 'Avatar Facial Expressions', category: 'VIDEO', priority: 'medium', description: 'Emotional facial animations' },
  { id: 'lip_sync', name: 'Lip-Sync Video', category: 'VIDEO', priority: 'critical', description: 'Sync audio to mouth movements' },
  { id: 'lip_sync_audio', name: 'Audio-Driven Lip-Sync', category: 'VIDEO', priority: 'high', description: 'Lip-sync from audio file' },
  { id: 'lip_sync_realtime', name: 'Real-Time Lip-Sync', category: 'VIDEO', priority: 'medium', description: 'Live lip-sync generation' },
  { id: 'video_enhancement', name: 'AI Video Enhancement', category: 'VIDEO', priority: 'medium', description: 'Upscale and enhance video' },
  { id: 'stock_video', name: 'Stock Video Library', category: 'VIDEO', priority: 'medium', description: 'Pre-made video clips' },
  { id: 'auto_subtitles', name: 'Auto Subtitles/Captions', category: 'VIDEO', priority: 'high', description: 'AI-generated captions' },
  { id: 'talking_photo', name: 'Talking Photo', category: 'VIDEO', priority: 'high', description: 'Animate photos with speech' },
  { id: 'video_dubbing', name: 'Video Dubbing (Voice Replace)', category: 'VIDEO', priority: 'high', description: 'Replace voice in video' },
  
  // ═══════════════════════════════════════════════════════════════
  // ANIMATION FEATURES - Expanded for Motion Graphics
  // ═══════════════════════════════════════════════════════════════
  { id: 'text_animation', name: 'Text Animation', category: 'ANIMATION', priority: 'high', description: 'Animated typography' },
  { id: 'object_animation', name: 'Object Animation', category: 'ANIMATION', priority: 'medium', description: 'Animate objects on screen' },
  { id: 'slide_transitions', name: 'Slide Transitions', category: 'ANIMATION', priority: 'high', description: 'Smooth slide changes' },
  { id: 'motion_graphics', name: 'Motion Graphics', category: 'ANIMATION', priority: 'high', description: 'Professional animated graphics' },
  { id: 'animated_stickers', name: 'Animated Stickers/GIFs', category: 'ANIMATION', priority: 'medium', description: 'Animated emoji and stickers' },
  { id: 'lottie', name: 'Lottie Animations', category: 'ANIMATION', priority: 'high', description: 'Vector-based animations' },
  { id: 'custom_paths', name: 'Custom Animation Paths', category: 'ANIMATION', priority: 'medium', description: 'Custom motion paths' },
  { id: 'auto_animate', name: 'Auto-Animate (AI)', category: 'ANIMATION', priority: 'high', description: 'AI-generated animations' },
  { id: 'kinetic_typography', name: 'Kinetic Typography', category: 'ANIMATION', priority: 'medium', description: 'Moving text sequences' },
  { id: 'character_animation', name: 'Character Animation', category: 'ANIMATION', priority: 'high', description: '2D/3D character movement' },
  { id: 'skeletal_animation', name: 'Skeletal Animation', category: 'ANIMATION', priority: 'medium', description: 'Bone-based animation' },
  { id: 'procedural_animation', name: 'Procedural Animation', category: 'ANIMATION', priority: 'medium', description: 'Algorithm-driven motion' },
  
  // ═══════════════════════════════════════════════════════════════
  // 3D FEATURES - Expanded for Meshy AI, ModelsLab, Replicate
  // ═══════════════════════════════════════════════════════════════
  { id: '3d_text', name: '3D Text', category: '3D', priority: 'medium', description: 'Extruded text with materials and lighting' },
  { id: '3d_objects', name: '3D Objects/Models', category: '3D', priority: 'high', description: 'Pre-built 3D model library' },
  { id: '3d_scene_gen', name: '3D Scene Generation', category: '3D', priority: 'high', description: 'AI-generated 3D environments from text' },
  { id: '3d_avatar', name: '3D Avatar/Character', category: '3D', priority: 'high', description: '3D character meshes with rigging' },
  { id: '360_view', name: '360° View Support', category: '3D', priority: 'medium', description: 'Panoramic and spherical content' },
  { id: '3d_import', name: '3D Model Import', category: '3D', priority: 'medium', description: 'Import GLTF/GLB/OBJ/FBX files' },
  { id: 'mesh_generation', name: 'AI Mesh Generation', category: '3D', priority: 'critical', description: 'Text-to-3D mesh with textures' },
  { id: 'image_to_3d', name: 'Image-to-3D', category: '3D', priority: 'high', description: 'Convert 2D images to 3D models' },
  { id: 'pbr_textures', name: 'PBR Texture Generation', category: '3D', priority: 'high', description: 'Physically-based rendering textures' },
  { id: '3d_rigging', name: '3D Auto-Rigging', category: '3D', priority: 'high', description: 'Automatic skeleton rigging for animation' },
  { id: '3d_animation', name: '3D Animation', category: '3D', priority: 'high', description: 'Animated 3D models and sequences' },
  { id: '3d_export_formats', name: '3D Export (GLTF/USDZ)', category: '3D', priority: 'high', description: 'Export for web, AR, and apps' },
  { id: 'stylized_3d', name: 'Stylized 3D (Cartoon/Anime)', category: '3D', priority: 'medium', description: 'Non-photorealistic 3D styles' },
  { id: 'product_3d', name: '3D Product Visualization', category: '3D', priority: 'high', description: 'E-commerce product renders' },
  
  // ═══════════════════════════════════════════════════════════════
  // AR/VR FEATURES - Expanded for Immersive Experiences
  // ═══════════════════════════════════════════════════════════════
  { id: 'ar_preview', name: 'AR Preview/Export', category: 'AR_VR', priority: 'high', description: 'Export USDZ for iOS Quick Look' },
  { id: 'vr_export', name: 'VR-Ready Export', category: 'AR_VR', priority: 'medium', description: '360° video for VR headsets' },
  { id: 'spatial', name: 'Spatial Presentations', category: 'AR_VR', priority: 'medium', description: 'Apple Vision Pro spatial computing' },
  { id: 'immersive', name: 'Immersive Mode', category: 'AR_VR', priority: 'medium', description: 'Full-screen immersive viewing' },
  { id: 'webxr', name: 'WebXR Support', category: 'AR_VR', priority: 'high', description: 'Browser-based AR/VR experiences' },
  { id: 'ar_filters', name: 'AR Face Filters', category: 'AR_VR', priority: 'medium', description: 'Face-tracking AR effects' },
  { id: 'ar_product_view', name: 'AR Product Viewer', category: 'AR_VR', priority: 'high', description: 'Place 3D products in real space' },
  { id: 'mixed_reality', name: 'Mixed Reality Content', category: 'AR_VR', priority: 'low', description: 'Blend virtual and real world' },
  { id: 'vr_360_video', name: 'VR 360° Video', category: 'AR_VR', priority: 'medium', description: 'Immersive spherical video' },
  { id: 'hand_tracking', name: 'Hand Tracking Support', category: 'AR_VR', priority: 'low', description: 'Gesture-based VR interaction' },
  
  // VFX FEATURES
  { id: 'video_filters', name: 'Video Filters', category: 'VFX', priority: 'medium' },
  { id: 'color_grading', name: 'Color Grading', category: 'VFX', priority: 'medium' },
  { id: 'green_screen', name: 'Green Screen/Chroma', category: 'VFX', priority: 'medium' },
  { id: 'motion_tracking', name: 'Motion Tracking', category: 'VFX', priority: 'low' },
  { id: 'ai_bg_replace', name: 'AI Background Replace', category: 'VFX', priority: 'high' },
  { id: 'particle_effects', name: 'Particle Effects', category: 'VFX', priority: 'low' },
  { id: 'visual_overlays', name: 'Visual Overlays', category: 'VFX', priority: 'medium' },
  
  // INTERACTIVE FEATURES
  { id: 'clickable_cta', name: 'Clickable CTAs in Video', category: 'INTERACTIVE', priority: 'medium' },
  { id: 'branching', name: 'Branching Paths', category: 'INTERACTIVE', priority: 'low' },
  { id: 'embedded_quizzes', name: 'Embedded Quizzes', category: 'INTERACTIVE', priority: 'low' },
  { id: 'polls_surveys', name: 'Polls & Surveys', category: 'INTERACTIVE', priority: 'low' },
  { id: 'hotspots', name: 'Hotspots/Clickable Areas', category: 'INTERACTIVE', priority: 'medium' },
  { id: 'figma_embed', name: 'Figma/Miro Embeds', category: 'INTERACTIVE', priority: 'low' },
  { id: 'interactive_charts', name: 'Interactive Charts', category: 'INTERACTIVE', priority: 'medium' },
  { id: 'video_chapters', name: 'Video Chapters/Navigation', category: 'INTERACTIVE', priority: 'medium' },
  { id: 'viewer_analytics', name: 'Viewer Analytics', category: 'INTERACTIVE', priority: 'high' },
  { id: 'ai_chatbot', name: 'AI Chatbot in Presentation', category: 'INTERACTIVE', priority: 'medium' },
  
  // TRANSLATION FEATURES
  { id: 'one_click_translate', name: '1-Click Video Translation', category: 'TRANSLATION', priority: 'high' },
  { id: 'auto_subtitles_translate', name: 'Auto-Translate Subtitles', category: 'TRANSLATION', priority: 'high' },
  { id: 'voice_dubbing', name: 'Voice Dubbing (AI)', category: 'TRANSLATION', priority: 'high' },
  { id: 'lip_sync_translate', name: 'Lip-Sync for Translation', category: 'TRANSLATION', priority: 'medium' },
  { id: 'multi_lang_export', name: 'Multi-Language Export', category: 'TRANSLATION', priority: 'medium' },
  { id: 'rtl_support', name: 'RTL Language Support', category: 'TRANSLATION', priority: 'medium' },
  { id: 'localization', name: 'Localization (Cultural Adapt)', category: 'TRANSLATION', priority: 'medium' },
  { id: 'accent_dialects', name: 'Accent/Dialect Options', category: 'TRANSLATION', priority: 'medium' },
  { id: 'multilingual_avatars', name: 'Multilingual Avatars', category: 'TRANSLATION', priority: 'low' },
  { id: 'languages_70plus', name: '70+ Languages Support', category: 'TRANSLATION', priority: 'high' },
  
  // EXPORT FEATURES (Enhanced for 120+ language support)
  { id: 'pptx_export', name: 'PPTX Export', category: 'EXPORT', priority: 'critical', description: 'Export to PowerPoint with full formatting' },
  { id: 'pdf_export', name: 'PDF Export', category: 'EXPORT', priority: 'high', description: 'Export to PDF with embedded fonts' },
  { id: 'mp4_export', name: 'MP4 Video Export', category: 'EXPORT', priority: 'critical', description: 'Export animated content to video' },
  { id: '4k_export', name: '4K Resolution Export', category: 'EXPORT', priority: 'medium', description: 'High resolution video export' },
  { id: 'watermark_free', name: 'Watermark-Free Export', category: 'EXPORT', priority: 'high', description: 'Clean export without branding' },
  { id: 'scorm_export', name: 'LMS Integration (SCORM)', category: 'EXPORT', priority: 'medium', description: 'Export for learning management systems' },
  { id: 'html_export', name: 'HTML Package Export', category: 'EXPORT', priority: 'high', description: 'Self-contained web presentation' },
  { id: 'json_export', name: 'JSON Data Export', category: 'EXPORT', priority: 'medium', description: 'Raw data export for integrations' },
  { id: 'image_zip_export', name: 'Image ZIP Export', category: 'EXPORT', priority: 'medium', description: 'Export all slides as images' },
  { id: 'svg_export', name: 'SVG Vector Export', category: 'EXPORT', priority: 'medium', description: 'Scalable vector graphics export' },
  { id: 'markdown_export', name: 'Markdown Export', category: 'EXPORT', priority: 'medium', description: 'Export content as markdown' },
  { id: 'csv_export', name: 'CSV Data Export', category: 'EXPORT', priority: 'low', description: 'Export data tables to CSV' },
  { id: 'multilang_export', name: '120+ Language Export', category: 'EXPORT', priority: 'high', description: 'Font embedding for all languages including CJK, RTL, Indic' },
  { id: 'dom_capture', name: 'DOM Capture Export', category: 'EXPORT', priority: 'high', description: 'Capture 3D, animations, and interactive elements' },

  // EDITING FEATURES (Generative Editor Refinement)
  { id: 'regenerate', name: 'AI Regenerate', category: 'EDITING', priority: 'critical', description: 'Completely regenerate selected element' },
  { id: 'enhance', name: 'AI Enhance', category: 'EDITING', priority: 'high', description: 'Improve quality of existing content' },
  { id: 'refine', name: 'AI Refine', category: 'EDITING', priority: 'high', description: 'Make targeted adjustments' },
  { id: 'rewrite', name: 'AI Rewrite', category: 'EDITING', priority: 'high', description: 'Rewrite with different style or tone' },
  { id: 'expand', name: 'AI Expand', category: 'EDITING', priority: 'medium', description: 'Add more detail to content' },
  { id: 'summarize', name: 'AI Summarize', category: 'EDITING', priority: 'medium', description: 'Make content more concise' },
  { id: 'polish', name: 'AI Polish', category: 'EDITING', priority: 'high', description: 'Professional refinement pass' },
  { id: 'add_stats', name: 'Add Statistics', category: 'EDITING', priority: 'medium', description: 'Insert relevant data and stats' },
  { id: 'add_visuals', name: 'Add Visuals', category: 'EDITING', priority: 'medium', description: 'Enhance with images and graphics' },
  { id: 'simplify', name: 'Simplify Language', category: 'EDITING', priority: 'medium', description: 'Reduce complexity of content' },
  { id: 'add_table', name: 'Convert to Table', category: 'EDITING', priority: 'medium', description: 'Transform content into table format' },
  { id: 'translate_element', name: 'Translate Element', category: 'EDITING', priority: 'high', description: 'Translate specific elements in-place' },
  { id: 'style_update', name: 'Update Style', category: 'EDITING', priority: 'medium', description: 'Change visual styling of elements' },
  { id: 'model_change', name: 'Change AI Model', category: 'EDITING', priority: 'medium', description: 'Switch to different AI provider mid-edit' },
  { id: 'version_history', name: 'Version History', category: 'EDITING', priority: 'high', description: 'Track and revert element changes' },
  { id: 'batch_edit', name: 'Batch Edit', category: 'EDITING', priority: 'medium', description: 'Apply changes to multiple elements' },

  // SFX FEATURES (Sound Effects Generation)
  { id: 'ai_sfx_generation', name: 'AI SFX Generation', category: 'SFX', priority: 'high', description: 'Generate custom sound effects via AI' },
  { id: 'elevenlabs_sfx', name: 'ElevenLabs Sound Effects', category: 'SFX', priority: 'high', description: 'Premium AI sound effects via ElevenLabs' },
  { id: 'ambient_audio', name: 'Ambient Audio Generation', category: 'SFX', priority: 'medium', description: 'Generate background ambience' },
  { id: 'sound_library', name: 'Sound Effects Library', category: 'SFX', priority: 'medium', description: 'Pre-made SFX library access' },
  { id: 'audio_effects', name: 'Audio Effects Processing', category: 'SFX', priority: 'medium', description: 'Apply reverb, echo, distortion' },
  { id: 'foley_generation', name: 'Foley Sound Generation', category: 'SFX', priority: 'low', description: 'Generate realistic foley sounds' },
  { id: 'music_stems', name: 'AI Music Stems', category: 'SFX', priority: 'medium', description: 'Generate separated music tracks' },
  { id: 'audio_mix_master', name: 'Audio Mix & Master', category: 'SFX', priority: 'medium', description: 'Automated audio mixing' },

  // DOWNLOAD FEATURES (Universal Export & Distribution)
  { id: 'universal_download', name: 'Universal Download', category: 'DOWNLOAD', priority: 'critical', description: 'One-click export to all formats' },
  { id: 'platform_downloads', name: 'Platform-Optimized Downloads', category: 'DOWNLOAD', priority: 'high', description: 'Format presets for YouTube, LinkedIn, TikTok' },
  { id: 'vfx_download', name: 'VFX Asset Download', category: 'DOWNLOAD', priority: 'medium', description: 'Download visual effects as assets' },
  { id: 'media_library_export', name: 'Media Library Export', category: 'DOWNLOAD', priority: 'medium', description: 'Export entire media library' },
  { id: 'cloud_sync_download', name: 'Cloud Sync Download', category: 'DOWNLOAD', priority: 'medium', description: 'Sync to Dropbox, GDrive, OneDrive' },
  { id: 'batch_download', name: 'Batch Download', category: 'DOWNLOAD', priority: 'high', description: 'Download multiple assets at once' },
  { id: 'offline_package', name: 'Offline Package', category: 'DOWNLOAD', priority: 'medium', description: 'Self-contained offline presentation' },
  { id: 'source_files_export', name: 'Source Files Export', category: 'DOWNLOAD', priority: 'medium', description: 'Export editable source files' },
  { id: 'branding_kit_export', name: 'Branding Kit Export', category: 'DOWNLOAD', priority: 'low', description: 'Export brand assets package' },
  { id: 'api_download', name: 'API Download Endpoints', category: 'DOWNLOAD', priority: 'high', description: 'Programmatic download via API' },

  // PIPELINE FEATURES (Transformation Orchestration)
  { id: 'idea_to_presentation', name: 'Idea → Presentation', category: 'PIPELINE', priority: 'critical', description: 'Full automated deck creation' },
  { id: 'document_to_presentation', name: 'Document → Presentation', category: 'PIPELINE', priority: 'high', description: 'Convert documents to slides' },
  { id: 'presentation_to_video', name: 'Presentation → Video', category: 'PIPELINE', priority: 'high', description: 'Convert slides to narrated video' },
  { id: 'script_to_avatar', name: 'Script → Avatar Video', category: 'PIPELINE', priority: 'high', description: 'AI avatar reads script' },
  { id: 'text_to_video_pipeline', name: 'Text → Video', category: 'PIPELINE', priority: 'high', description: 'Generate video from text prompt' },
  { id: 'image_to_video_pipeline', name: 'Image → Video', category: 'PIPELINE', priority: 'medium', description: 'Animate static images' },
  { id: 'url_to_video', name: 'URL → Video', category: 'PIPELINE', priority: 'medium', description: 'Convert web content to video' },
  { id: 'ppt_to_video', name: 'PPT → Video', category: 'PIPELINE', priority: 'high', description: 'Convert PowerPoint to video' },
  { id: 'long_to_short', name: 'Long → Short Clips', category: 'PIPELINE', priority: 'medium', description: 'Extract social clips from long videos' },
  { id: 'multilingual_dub', name: 'Multilingual Dubbing', category: 'PIPELINE', priority: 'high', description: 'Dub video into multiple languages' },
  { id: 'avatar_lip_sync', name: 'Avatar Lip-Sync', category: 'PIPELINE', priority: 'high', description: 'Sync avatar to voiceover' },
  { id: 'data_to_dashboard', name: 'Data → Dashboard', category: 'PIPELINE', priority: 'medium', description: 'Generate visual dashboards from data' },
  { id: 'auto_record_to_avatar', name: 'Recording → Avatar', category: 'PIPELINE', priority: 'medium', description: 'Replace presenter with AI avatar' },
  { id: 'text_to_3d_scene', name: 'Text → 3D Scene', category: 'PIPELINE', priority: 'low', description: 'Generate 3D environments from text' },
  { id: 'image_to_3d_mesh', name: 'Image → 3D Mesh', category: 'PIPELINE', priority: 'medium', description: 'Convert 2D images to 3D models' },
  { id: 'a2a_orchestration', name: 'A2A Orchestration', category: 'PIPELINE', priority: 'critical', description: 'Agent-to-agent coordination for complex workflows' },

  // PUBLISHING FEATURES (Expanded for 8-Step Wizard)
  { id: 'web_publish', name: 'Web Publishing/Link Sharing', category: 'PUBLISHING', priority: 'high' },
  { id: 'embed_website', name: 'Embed on Website', category: 'PUBLISHING', priority: 'medium' },
  { id: 'youtube_upload', name: 'YouTube Direct Upload', category: 'PUBLISHING', priority: 'medium' },
  { id: 'social_schedule', name: 'Social Media Scheduling', category: 'PUBLISHING', priority: 'medium' },
  { id: 'gdrive_integration', name: 'Google Drive Integration', category: 'PUBLISHING', priority: 'medium' },
  { id: 'api_access', name: 'API for Publishing', category: 'PUBLISHING', priority: 'high' },
  { id: 'custom_domain', name: 'Custom Domain Hosting', category: 'PUBLISHING', priority: 'medium' },
  { id: 'password_protection', name: 'Password Protection', category: 'PUBLISHING', priority: 'medium' },
  { id: 'linkedin_post', name: 'LinkedIn Direct Post', category: 'PUBLISHING', priority: 'high' },
  { id: 'vimeo_upload', name: 'Vimeo Direct Upload', category: 'PUBLISHING', priority: 'low' },
  { id: 'slideshare_upload', name: 'SlideShare Upload', category: 'PUBLISHING', priority: 'low' },
  { id: 'instagram_publish', name: 'Instagram Direct Publish', category: 'PUBLISHING', priority: 'high' },
  { id: 'tiktok_publish', name: 'TikTok Direct Publish', category: 'PUBLISHING', priority: 'high' },
  { id: 'threads_publish', name: 'Threads Direct Publish', category: 'PUBLISHING', priority: 'medium' },
  { id: 'twitter_publish', name: 'X/Twitter Direct Publish', category: 'PUBLISHING', priority: 'medium' },
  { id: 'facebook_publish', name: 'Facebook Direct Publish', category: 'PUBLISHING', priority: 'medium' },
  { id: 'pinterest_publish', name: 'Pinterest Direct Publish', category: 'PUBLISHING', priority: 'low' },
  { id: 'analytics_embed', name: 'Analytics Dashboard', category: 'PUBLISHING', priority: 'medium' },
  { id: 'qr_code_share', name: 'QR Code Sharing', category: 'PUBLISHING', priority: 'low' },
  { id: 'email_distribution', name: 'Email Distribution', category: 'PUBLISHING', priority: 'medium' },
  
  // SECURITY & AUTH FEATURES
  { id: 'google_oauth', name: 'Google OAuth', category: 'SECURITY', priority: 'critical' },
  { id: 'linkedin_oauth', name: 'LinkedIn OAuth', category: 'SECURITY', priority: 'high' },
  { id: 'tiktok_oauth', name: 'TikTok OAuth', category: 'SECURITY', priority: 'high' },
  { id: 'instagram_oauth', name: 'Instagram/Meta OAuth', category: 'SECURITY', priority: 'high' },
  { id: 'twitter_oauth', name: 'X/Twitter OAuth', category: 'SECURITY', priority: 'medium' },
  { id: 'mfa_support', name: 'Multi-Factor Authentication', category: 'SECURITY', priority: 'critical' },
  { id: 'sso_integration', name: 'SSO Integration', category: 'SECURITY', priority: 'high' },
  { id: 'api_key_management', name: 'API Key Management', category: 'SECURITY', priority: 'high' },
  { id: 'session_management', name: 'Session Management', category: 'SECURITY', priority: 'high' },
  { id: 'audit_logging', name: 'Audit Logging', category: 'SECURITY', priority: 'medium' },
  
  // BUSINESS & COMPLIANCE FEATURES
  { id: 'stripe_payments', name: 'Stripe Payment Gateway', category: 'BUSINESS', priority: 'critical' },
  { id: 'stripe_subscriptions', name: 'Stripe Subscriptions', category: 'BUSINESS', priority: 'critical' },
  { id: 'token_management', name: 'Token/Credit Management', category: 'BUSINESS', priority: 'high' },
  { id: 'api_rate_limits', name: 'API Rate Limiting', category: 'BUSINESS', priority: 'high' },
  { id: 'usage_metering', name: 'Usage Metering', category: 'BUSINESS', priority: 'high' },
  { id: 'billing_portal', name: 'Customer Billing Portal', category: 'BUSINESS', priority: 'medium' },
  { id: 'invoice_generation', name: 'Invoice Generation', category: 'BUSINESS', priority: 'medium' },
  { id: 'hipaa_compliance', name: 'HIPAA Compliance', category: 'BUSINESS', priority: 'critical' },
  { id: 'gdpr_compliance', name: 'GDPR Compliance', category: 'BUSINESS', priority: 'critical' },
  { id: 'ccpa_compliance', name: 'CCPA Compliance', category: 'BUSINESS', priority: 'high' },
  { id: 'terms_conditions', name: 'Terms & Conditions', category: 'BUSINESS', priority: 'critical' },
  { id: 'privacy_policy', name: 'Privacy Policy', category: 'BUSINESS', priority: 'critical' },
  { id: 'ai_transparency', name: 'AI Transparency Statement', category: 'BUSINESS', priority: 'high' },
  { id: 'data_retention', name: 'Data Retention Policy', category: 'BUSINESS', priority: 'high' },
  { id: 'adult_protection', name: 'Adult Content Protection', category: 'BUSINESS', priority: 'critical' },
  { id: 'age_verification', name: 'Age Verification', category: 'BUSINESS', priority: 'high' },
  { id: 'coppa_compliance', name: 'COPPA Compliance', category: 'BUSINESS', priority: 'high' },
  { id: 'content_moderation', name: 'AI Content Moderation', category: 'BUSINESS', priority: 'high' },
  { id: 'baa_agreements', name: 'BAA Agreements', category: 'BUSINESS', priority: 'critical' },
  { id: 'soc2_compliance', name: 'SOC 2 Compliance', category: 'BUSINESS', priority: 'high' },
];

// ============================================
// PROVIDER SUMMARIES (Only configured/active providers)
// ============================================

export const PROVIDER_SUMMARIES: ProviderSummary[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    website: 'https://openai.com',
    status: 'configured',
    secretKey: 'OPENAI_API_KEY',
    totalFeatures: 35,
    implementedFeatures: 28,
    partialFeatures: 5,
    missingFeatures: 2,
    capabilities: ['SCRIPT', 'VOICE', 'IMAGE', 'AUDIO'],
    strengths: ['GPT-4o Vision', 'DALL-E 3', 'Whisper STT', 'TTS'],
    weaknesses: ['No video generation', 'Higher cost'],
    costTier: 'premium',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    website: 'https://ai.google.dev',
    status: 'configured',
    secretKey: 'GEMINI_API_KEY',
    totalFeatures: 40,
    implementedFeatures: 32,
    partialFeatures: 6,
    missingFeatures: 2,
    capabilities: ['SCRIPT', 'IMAGE', 'VIDEO', 'AUDIO', 'TRANSLATION'],
    strengths: ['1M+ context', 'Multimodal', 'Image gen', 'Fast'],
    weaknesses: ['Voice quality lower', 'Regional limits'],
    costTier: 'standard',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    website: 'https://anthropic.com',
    status: 'configured',
    secretKey: 'ANTHROPIC_API_KEY',
    totalFeatures: 25,
    implementedFeatures: 22,
    partialFeatures: 3,
    missingFeatures: 0,
    capabilities: ['SCRIPT', 'TRANSLATION'],
    strengths: ['200K context', 'Nuanced writing', 'Safety'],
    weaknesses: ['No media generation', 'No voice'],
    costTier: 'premium',
  },
  {
    id: 'modelslab',
    name: 'ModelsLab',
    website: 'https://modelslab.com',
    status: 'configured',
    secretKey: 'MODELSLAB_API_KEY',
    totalFeatures: 45,
    implementedFeatures: 35,
    partialFeatures: 7,
    missingFeatures: 3,
    capabilities: ['IMAGE', 'VIDEO', '3D', 'ANIMATION'],
    strengths: ['FLUX Pro', 'AnimateDiff', '3D Mesh', 'ControlNet', 'Low cost'],
    weaknesses: ['Async for complex jobs', 'Queue times'],
    costTier: 'budget',
  },
  {
    id: 'alibaba',
    name: 'Alibaba DashScope',
    website: 'https://dashscope.aliyun.com',
    status: 'configured',
    secretKey: 'ALIBABA_API_KEY',
    totalFeatures: 50,
    implementedFeatures: 30,
    partialFeatures: 12,
    missingFeatures: 8,
    capabilities: ['SCRIPT', 'VOICE', 'IMAGE', 'VIDEO', 'TRANSLATION'],
    strengths: ['CJK native', 'Qwen 2.5', 'WAN 2.2 video', 'Qwen3-TTS', 'Paraformer'],
    weaknesses: ['Newer models need testing', 'Regional focus'],
    costTier: 'budget',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    website: 'https://deepseek.com',
    status: 'configured',
    secretKey: 'DEEPSEEK_API_KEY',
    totalFeatures: 30,
    implementedFeatures: 15,
    partialFeatures: 8,
    missingFeatures: 7,
    capabilities: ['SCRIPT', 'IMAGE'],
    strengths: ['V3 MoE LLM', 'Vision', 'Ultra low cost', 'Code expert'],
    weaknesses: ['R1 reasoning not integrated', 'Janus missing'],
    costTier: 'budget',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    website: 'https://elevenlabs.io',
    status: 'configured',
    secretKey: 'ELEVENLABS_API_KEY',
    totalFeatures: 20,
    implementedFeatures: 18,
    partialFeatures: 2,
    missingFeatures: 0,
    capabilities: ['VOICE', 'AUDIO'],
    strengths: ['Best TTS quality', 'Voice cloning', 'SFX', '29 languages'],
    weaknesses: ['Higher cost', 'Rate limits'],
    costTier: 'premium',
  },
  {
    id: 'deepl',
    name: 'DeepL',
    website: 'https://deepl.com',
    status: 'configured',
    secretKey: 'DEEPL_API_KEY',
    totalFeatures: 10,
    implementedFeatures: 10,
    partialFeatures: 0,
    missingFeatures: 0,
    capabilities: ['TRANSLATION'],
    strengths: ['Best translation quality', 'Glossary', 'Formality'],
    weaknesses: ['30 languages only', 'No CJK specialty'],
    costTier: 'standard',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    website: 'https://replicate.com',
    status: 'configured',
    secretKey: 'REPLICATE_API_TOKEN',
    totalFeatures: 40,
    implementedFeatures: 25,
    partialFeatures: 10,
    missingFeatures: 5,
    capabilities: ['IMAGE', 'VIDEO', 'AUDIO'],
    strengths: ['Many models', 'SDXL', 'Video models', 'Pay-per-use'],
    weaknesses: ['Cold starts', 'Variable quality'],
    costTier: 'standard',
  },
  {
    id: 'google',
    name: 'Google Cloud',
    website: 'https://cloud.google.com',
    status: 'configured',
    secretKey: 'GOOGLE_CLIENT_ID',
    totalFeatures: 25,
    implementedFeatures: 15,
    partialFeatures: 8,
    missingFeatures: 2,
    capabilities: ['PUBLISHING', 'SECURITY', 'TRANSLATION'],
    strengths: ['OAuth', 'YouTube API', 'Drive API', 'Analytics'],
    weaknesses: ['Complex setup', 'OAuth refresh'],
    costTier: 'standard',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    website: 'https://supabase.com',
    status: 'configured',
    secretKey: 'SUPABASE_URL',
    totalFeatures: 35,
    implementedFeatures: 30,
    partialFeatures: 5,
    missingFeatures: 0,
    capabilities: ['PUBLISHING', 'SECURITY', 'BUSINESS'],
    strengths: ['Auth', 'Database', 'Edge Functions', 'Storage', 'Realtime'],
    weaknesses: ['Self-managed scaling'],
    costTier: 'standard',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    website: 'https://stripe.com',
    status: 'configured',
    secretKey: 'STRIPE_SECRET_KEY',
    totalFeatures: 15,
    implementedFeatures: 12,
    partialFeatures: 3,
    missingFeatures: 0,
    capabilities: ['BUSINESS'],
    strengths: ['Payments', 'Subscriptions', 'Invoicing', 'Billing Portal'],
    weaknesses: ['Transaction fees'],
    costTier: 'standard',
  },
];

// ============================================
// FEATURE IMPLEMENTATION STATUS
// ============================================

export const FEATURE_IMPLEMENTATION_MATRIX: Record<string, Partial<Record<ProviderId, Partial<ProviderCapability>>>> = {
  // INPUT FEATURES
  text_prompt: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 99, edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ai-universal-processor' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 99, edgeFunctionUsed: 'ai-universal-processor' },
    deepseek: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'ai-universal-processor' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Qwen 2.5' },
    deepl: { status: 'configured', implementation: 'implemented', confidence: 99, edgeFunctionUsed: 'translate', notes: 'Text input for translation' },
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Text prompts for image/video generation' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Text prompts for AI models' },
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 98, notes: 'Text input for TTS' },
  },
  document_upload: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'ai-universal-processor', notes: 'GPT-4o Vision' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 98, notes: '1M context for large docs' },
    deepl: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Document translation' },
  },
  url_input: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90, edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 92 },
  },
  image_upload: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 98, notes: 'GPT-4o Vision for analysis & understanding', edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 97, notes: 'Gemini 2.5 Pro multimodal', edgeFunctionUsed: 'ai-universal-processor' },
    deepseek: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'DeepSeek-VL vision model', edgeFunctionUsed: 'ai-universal-processor' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Qwen-VL for CJK-optimized vision', edgeFunctionUsed: 'ai-universal-processor' },
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'img2img, ControlNet, inpainting', edgeFunctionUsed: 'modelslab-image' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'SDXL img2img, style transfer', edgeFunctionUsed: 'replicate-image' },
    stability: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Stable Diffusion image-to-image' },
  },
  video_upload: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Via frame extraction + Vision', edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 98, notes: 'Native video understanding up to 1hr', edgeFunctionUsed: 'ai-universal-processor' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Qwen2.5-VL video analysis', edgeFunctionUsed: 'alibaba-video' },
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Video-to-video, AnimateDiff', edgeFunctionUsed: 'modelslab-video' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'SVD, video processing models', edgeFunctionUsed: 'replicate-video' },
  },
  audio_upload: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ask-genie-voice', notes: 'Whisper for 99+ languages' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'alibaba-stt', notes: 'Paraformer CJK optimized' },
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 97, edgeFunctionUsed: 'elevenlabs-stt', notes: 'Scribe STT with speaker diarization' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Native audio understanding', edgeFunctionUsed: 'ai-universal-processor' },
  },
  pptx_import: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Text extraction + analysis' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Slide image analysis' },
  },
  voice_recording: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Whisper real-time STT', edgeFunctionUsed: 'ask-genie-voice' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Paraformer streaming', edgeFunctionUsed: 'alibaba-stt' },
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 97, notes: 'Scribe real-time with VAD', edgeFunctionUsed: 'elevenlabs-stt' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Live audio input', edgeFunctionUsed: 'ai-universal-processor' },
  },
  screen_recording: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Via frame capture + Vision', edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Native video understanding for screen content', edgeFunctionUsed: 'ai-universal-processor' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 80, notes: 'Qwen-VL screen analysis', edgeFunctionUsed: 'ai-universal-processor' },
  },
  csv_data: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Code Interpreter for analysis' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Large table understanding' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Structured data analysis' },
  },
  
  // SCRIPT FEATURES
  ai_script_gen: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'ai-universal-processor' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 97, edgeFunctionUsed: 'ai-universal-processor' },
    deepseek: { status: 'configured', implementation: 'implemented', confidence: 90, edgeFunctionUsed: 'ai-universal-processor' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 85, notes: 'Qwen integration started' },
  },
  script_from_url: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 92, edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  script_editing: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 97, notes: 'Best for nuanced edits' },
  },
  tone_style: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 92 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Excellent tone control' },
  },
  audience_input: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 88 },
  },
  script_length: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 92 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 94 },
  },
  multi_scene_script: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 92 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  speaker_notes: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 92 },
  },
  outline_gen: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 96 },
  },
  content_summary: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 98, notes: 'Great for long docs' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 96 },
  },
  script_translation: {
    deepl: { status: 'configured', implementation: 'implemented', confidence: 99, edgeFunctionUsed: 'translate' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Best for CJK' },
  },
  script_to_slides: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 92, edgeFunctionUsed: 'ai-universal-processor', notes: 'Primary provider' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'ai-universal-processor', notes: 'Multi-modal support' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Fallback provider' },
  },
  script_to_video_auto: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Manual workflow - pending VOICE/tts integration' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'Pending VOICE/tts integration' },
  },
  ai_rewrite: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 94 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 96, notes: 'Best for rewrites' },
  },
  brand_voice: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'ai-universal-processor', notes: 'System prompt customization' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 90, edgeFunctionUsed: 'ai-universal-processor', notes: 'Best for brand consistency' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 82, notes: 'Alternative provider' },
  },
  
  // VOICE FEATURES
  tts: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ai-tts-unified' },
    openai: { status: 'configured', implementation: 'implemented', confidence: 90, edgeFunctionUsed: 'ai-tts-unified' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'alibaba-tts', notes: 'Qwen3-TTS' },
  },
  voice_cloning: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 98 },
  },
  multi_language_voice: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 95, notes: '29 languages' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'CJK native' },
  },
  voice_emotion: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 92 },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 75 },
  },
  voice_speed: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 95 },
    openai: { status: 'configured', implementation: 'implemented', confidence: 88 },
  },
  ai_voice_count: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 95, notes: '500+ voices' },
  },
  
  // AUDIO FEATURES
  stt: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ask-genie-voice', notes: 'Whisper' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'alibaba-stt', notes: 'Paraformer' },
  },
  bg_music: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Limited library' },
  },
  sfx_library: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'elevenlabs-sfx' },
  },
  ai_music_gen: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Use ElevenLabs SFX as alternative' },
  },
  ai_sfx_gen: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'elevenlabs-sfx' },
  },
  noise_reduction: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  audio_ducking: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  multi_track: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  audio_sync: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  
  // IMAGE FEATURES
  ai_image_gen: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'modelslab-media', notes: 'FLUX Pro' },
    openai: { status: 'configured', implementation: 'implemented', confidence: 92, edgeFunctionUsed: 'generate-image', notes: 'DALL-E 3' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'gemini-image-generation' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 80, notes: 'Wanx basic only' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 85 },
  },
  text_to_image: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'FLUX/SDXL' },
    openai: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'DALL-E 3' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 85 },
  },
  image_to_image: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 88 },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 82 },
  },
  bg_removal: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 90 },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 85 },
  },
  bg_generation: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 75 },
  },
  image_upscaling: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'API available' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  object_removal: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
    replicate: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  image_filters: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 80 },
  },
  stock_images: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Generate on demand' },
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  image_animation: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'AnimateDiff' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  smart_crop: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  style_transfer: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  controlnet: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 75, notes: 'Pose only, depth missing' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  inpainting: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'API available, partial integration' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  
  // VIDEO FEATURES
  text_to_video: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'ai-video-generator' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 80, edgeFunctionUsed: 'ai-video-generator', notes: 'WAN 2.2' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 75 },
  },
  image_to_video: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'AnimateDiff' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 75 },
  },
  script_to_video: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70 },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  url_to_video: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  ppt_to_video: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  video_trimming: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  video_merging: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  speed_control: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  video_transitions: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  ai_avatars: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Basic avatar, not full talking head' },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 70, notes: 'EMO API available' },
  },
  custom_avatar: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  lip_sync: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'Wav2Lip API available' },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'V-Express available' },
  },
  video_enhancement: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
    replicate: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  stock_video: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 80, notes: 'Generate on demand' },
  },
  auto_subtitles: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Whisper transcription' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Paraformer' },
  },
  
  // ANIMATION FEATURES
  text_animation: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  object_animation: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  slide_transitions: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  motion_graphics: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 50 },
  },
  animated_stickers: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  lottie: {
    replicate: { status: 'configured', implementation: 'not_started', confidence: 40 },
  },
  custom_paths: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  auto_animate: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 3D FEATURES - Updated with Meshy AI (Core 13)
  // ═══════════════════════════════════════════════════════════════
  '3d_text': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
    meshy: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'High-quality 3D text' },
  },
  '3d_objects': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
    meshy: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Text-to-3D objects' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'TripoSR' },
  },
  '3d_scene_gen': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 50 },
    meshy: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Scene composition from objects' },
  },
  '3d_avatar': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
    meshy: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Stylized 3D characters' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'OmniAvatar for full-body' },
  },
  '360_view': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 40 },
  },
  '3d_import': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 50 },
    meshy: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'GLTF/GLB/OBJ import' },
  },
  mesh_generation: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 75, edgeFunctionUsed: 'modelslab-media' },
    meshy: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'meshy-3d', notes: 'Best-in-class mesh' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 80, notes: 'TripoSR Image-to-3D' },
  },
  image_to_3d: {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Photo-to-3D model' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'TripoSR' },
  },
  pbr_textures: {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'High-fidelity PBR' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  '3d_rigging': {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Auto-rigging' },
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 30 },
  },
  '3d_animation': {
    meshy: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Basic animation support' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  '3d_export_formats': {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'GLTF/USDZ/FBX export' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  stylized_3d: {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Cartoon/Anime styles' },
  },
  product_3d: {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'E-commerce ready' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // AR/VR FEATURES - Updated with WebXR and expanded providers
  // ═══════════════════════════════════════════════════════════════
  ar_preview: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55, notes: '3D model export for AR' },
    meshy: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'USDZ export for iOS AR' },
  },
  vr_export: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 45, notes: '360° video support' },
  },
  spatial: {
    modelslab: { status: 'configured', implementation: 'planned', confidence: 30, notes: 'Apple Vision Pro format planned' },
  },
  immersive: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55, notes: '3D scene immersion mode' },
  },
  webxr: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'WebGL/Three.js export' },
    meshy: { status: 'configured', implementation: 'implemented', confidence: 80, notes: 'Web-ready GLTF' },
  },
  ar_filters: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 50 },
  },
  ar_product_view: {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Product AR via USDZ' },
  },
  mixed_reality: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 25 },
  },
  vr_360_video: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 45 },
  },
  hand_tracking: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 15, notes: 'Hardware dependent' },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // EXPANDED VIDEO/AVATAR - Alibaba WAN 2.2 & OmniAvatar
  // ═══════════════════════════════════════════════════════════════
  full_body_avatar: {
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'OmniAvatar - Premium' },
  },
  avatar_gestures: {
    alibaba: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'WAN 2.2' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  avatar_expressions: {
    alibaba: { status: 'configured', implementation: 'partial', confidence: 75 },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  lip_sync_audio: {
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'V-Express' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Wav2Lip' },
  },
  lip_sync_realtime: {
    alibaba: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  talking_photo: {
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'EMO/WAN 2.2' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  video_dubbing: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Voice clone + TTS' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Qwen3-TTS' },
  },
  
  // EXPANDED ANIMATION
  kinetic_typography: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  character_animation: {
    meshy: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'Rigged characters' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 50 },
  },
  skeletal_animation: {
    meshy: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Auto-rigging' },
  },
  procedural_animation: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 45 },
  },
  
  // VFX FEATURES
  video_filters: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  color_grading: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  green_screen: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  motion_tracking: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  ai_bg_replace: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70 },
    replicate: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  particle_effects: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  visual_overlays: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  
  // INTERACTIVE FEATURES
  clickable_cta: {
    openai: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'Via slide templates' },
  },
  branching: {
    openai: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  embedded_quizzes: {
    openai: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  polls_surveys: {
    openai: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  hotspots: {
    openai: { status: 'configured', implementation: 'partial', confidence: 50 },
  },
  figma_embed: {
    openai: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  interactive_charts: {
    openai: { status: 'configured', implementation: 'partial', confidence: 65 },
    gemini: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  video_chapters: {
    openai: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  viewer_analytics: {
    openai: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  ai_chatbot: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 85 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 88 },
  },
  
  // TRANSLATION FEATURES
  one_click_translate: {
    deepl: { status: 'configured', implementation: 'implemented', confidence: 99, edgeFunctionUsed: 'translate' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Best for CJK' },
  },
  auto_subtitles_translate: {
    deepl: { status: 'configured', implementation: 'implemented', confidence: 95 },
  },
  voice_dubbing: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 75, notes: 'Manual workflow' },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 70 },
  },
  lip_sync_translate: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'Wav2Lip available' },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'V-Express available' },
  },
  multi_lang_export: {
    deepl: { status: 'configured', implementation: 'implemented', confidence: 90 },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85 },
  },
  rtl_support: {
    deepl: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  localization: {
    deepl: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  accent_dialects: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 85 },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 80, notes: 'CJK dialects' },
  },
  multilingual_avatars: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  languages_70plus: {
    deepl: { status: 'configured', implementation: 'partial', confidence: 60, notes: '30 languages only' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 88 },
  },
  
  // EXPORT FEATURES
  pptx_export: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'pptxgenjs integration' },
  },
  pdf_export: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  mp4_export: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 85 },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 80 },
  },
  '4k_export': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Processing intensive' },
  },
  watermark_free: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 95 },
  },
  scorm_export: {
    openai: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  html_export: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'comprehensiveExportService' },
  },
  json_export: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Universal export hook' },
  },
  image_zip_export: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'JSZip integration' },
  },
  svg_export: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  markdown_export: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  csv_export: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 95 },
  },
  multilang_export: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 95, notes: '120+ language font mappings in comprehensiveExportService' },
    deepl: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Translation integration' },
  },
  dom_capture: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'html2canvas for 3D/animation capture' },
  },

  // EDITING FEATURES (Generative Editor - useElementEditor)
  regenerate: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'ai-universal-processor' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 93 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  enhance: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 92 },
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Image upscaling' },
  },
  refine: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Best for nuanced refinements' },
  },
  rewrite: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 94 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 96, notes: 'Best for rewrites' },
  },
  expand: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 88 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  summarize: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 98, notes: 'Great for long docs' },
  },
  polish: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 90 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'SlideAIEnhancer integration' },
  },
  add_stats: {
    openai: { status: 'configured', implementation: 'partial', confidence: 75, notes: 'Web search integration needed' },
    gemini: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  add_visuals: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'modelslab-media' },
    openai: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'DALL-E 3' },
  },
  simplify: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 88 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  add_table: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 88 },
  },
  translate_element: {
    deepl: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'translate' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Qwen-MT for CJK' },
  },
  style_update: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Client-side styling' },
  },
  model_change: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'FlexibleAgentConfigService' },
  },
  version_history: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'useElementEditor tracking' },
  },
  batch_edit: {
    openai: { status: 'configured', implementation: 'partial', confidence: 65 },
    supabase: { status: 'configured', implementation: 'partial', confidence: 60 },
  },

  // PIPELINE FEATURES (Transformation Orchestration - ai-a2a-coordinator)
  idea_to_presentation: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 92 },
    claude: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  document_to_presentation: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'GPT-4o Vision for document parsing' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 92, notes: '1M context for large docs' },
  },
  presentation_to_video: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70 },
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'TTS narration' },
  },
  script_to_avatar: {
    alibaba: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'WAN 2.2 Avatar' },
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  text_to_video_pipeline: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'modelslab-video' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 80, notes: 'WAN 2.2' },
  },
  image_to_video_pipeline: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'AnimateDiff/SVD' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 82 },
  },
  // Note: url_to_video and ppt_to_video already defined in VIDEO FEATURES section
  long_to_short: {
    openai: { status: 'configured', implementation: 'partial', confidence: 55, notes: 'AI highlight detection' },
    gemini: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Video understanding' },
  },
  multilingual_dub: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Multi-language TTS' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Qwen3-TTS for CJK' },
    deepl: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Script translation' },
  },
  avatar_lip_sync: {
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'V-Express API available' },
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'Wav2Lip API available' },
  },
  data_to_dashboard: {
    openai: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Chart generation' },
    gemini: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  auto_record_to_avatar: {
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'OmniAvatar pending' },
  },
  text_to_3d_scene: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 55, notes: '3D mesh generation' },
  },
  image_to_3d_mesh: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 78, edgeFunctionUsed: 'modelslab-3d' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  a2a_orchestration: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'ai-a2a-coordinator' },
    openai: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Primary LLM router' },
  },

  // SFX FEATURES (Sound Effects Generation)
  ai_sfx_generation: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 92, edgeFunctionUsed: 'elevenlabs-sfx', notes: 'AI Sound Effects API' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'Audio generation via Qwen3-TTS' },
  },
  elevenlabs_sfx: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'elevenlabs-sfx' },
  },
  ambient_audio: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Via SFX + composition' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  sound_library: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Sound effect library access' },
    supabase: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Static assets storage' },
  },
  audio_effects: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'Basic effects processing' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 55 },
  },
  foley_generation: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 55, notes: 'Via SFX prompts' },
  },
  music_stems: {
    replicate: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Demucs audio separation' },
    elevenlabs: { status: 'configured', implementation: 'not_started', confidence: 40 },
  },
  audio_mix_master: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 50 },
    replicate: { status: 'configured', implementation: 'partial', confidence: 45 },
  },

  // DOWNLOAD FEATURES (Universal Export & Distribution)
  universal_download: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'useUniversalExport hook' },
  },
  platform_downloads: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Format presets for social platforms' },
  },
  vfx_download: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'VFX asset export' },
    supabase: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  media_library_export: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Bulk export via JSZip' },
  },
  cloud_sync_download: {
    google: { status: 'needs_key', implementation: 'partial', confidence: 55, notes: 'Google Drive sync' },
    supabase: { status: 'configured', implementation: 'partial', confidence: 50 },
  },
  batch_download: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'ZIP batch export' },
  },
  offline_package: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Self-contained HTML export' },
  },
  source_files_export: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Editable formats export' },
  },
  branding_kit_export: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 55, notes: 'Brand asset packaging' },
  },
  api_download: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Edge function download endpoints' },
  },

  web_publish: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Cloud URL generation' },
    supabase: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Edge function hosting' },
  },
  embed_website: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85 },
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90 },
  },
  youtube_upload: {
    google: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'Requires OAuth2' },
  },
  social_schedule: {
    supabase: { status: 'configured', implementation: 'planned', confidence: 0, notes: 'Scheduling backend pending' },
  },
  gdrive_integration: {
    google: { status: 'needs_key', implementation: 'partial', confidence: 65, notes: 'Drive API setup needed' },
    gemini: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  api_access: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 92 },
    supabase: { status: 'configured', implementation: 'implemented', confidence: 98, notes: 'Edge function APIs' },
  },
  custom_domain: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 50, notes: 'DNS setup required' },
  },
  password_protection: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'RLS policies' },
  },
  linkedin_post: {
    microsoft: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'LinkedIn API credentials needed' },
  },
  vimeo_upload: {
    supabase: { status: 'configured', implementation: 'planned', confidence: 0, notes: 'Vimeo API integration' },
  },
  slideshare_upload: {
    supabase: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'SlideShare deprecated, alternatives needed' },
  },
  analytics_embed: {
    google: { status: 'needs_key', implementation: 'partial', confidence: 50, notes: 'GA4 integration' },
    supabase: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Internal analytics' },
  },
  qr_code_share: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'QR code generation library' },
  },
  email_distribution: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Resend/SendGrid via edge function' },
  },
  
  // NEW SOCIAL PLATFORMS
  instagram_publish: {
    supabase: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'Meta Business API required' },
  },
  tiktok_publish: {
    supabase: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'TikTok for Developers API' },
  },
  threads_publish: {
    supabase: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'Threads API (Meta Graph API)' },
  },
  twitter_publish: {
    supabase: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'X API v2 required' },
  },
  facebook_publish: {
    supabase: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'Meta Business API' },
  },
  pinterest_publish: {
    supabase: { status: 'needs_key', implementation: 'not_started', confidence: 0, notes: 'Pinterest API' },
  },
  
  // SECURITY & AUTH FEATURES
  google_oauth: {
    google: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Supabase Google OAuth configured' },
    supabase: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Native OAuth support' },
  },
  linkedin_oauth: {
    microsoft: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'LinkedIn OAuth credentials needed' },
    supabase: { status: 'configured', implementation: 'planned', confidence: 60, notes: 'OAuth flow available' },
  },
  tiktok_oauth: {
    supabase: { status: 'needs_key', implementation: 'not_started', confidence: 0, notes: 'TikTok Login Kit' },
  },
  instagram_oauth: {
    supabase: { status: 'needs_key', implementation: 'planned', confidence: 0, notes: 'Instagram Basic Display API / Graph API' },
  },
  twitter_oauth: {
    supabase: { status: 'needs_key', implementation: 'not_started', confidence: 0, notes: 'X OAuth 2.0' },
  },
  mfa_support: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Supabase MFA integration' },
    azure: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Azure AD B2C MFA' },
  },
  sso_integration: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'SAML/OIDC via Supabase' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Azure AD SSO' },
  },
  api_key_management: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Edge function secrets' },
  },
  session_management: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Supabase session handling' },
  },
  audit_logging: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'postgres_logs + custom tables' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Azure Monitor logs' },
  },
  
  // BUSINESS & COMPLIANCE FEATURES
  stripe_payments: {
    stripe: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Stripe connector available' },
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Edge function integration' },
  },
  stripe_subscriptions: {
    stripe: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Subscription management' },
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Create-checkout edge function' },
  },
  token_management: {
    supabase: { status: 'configured', implementation: 'planned', confidence: 50, notes: 'Custom implementation needed' },
  },
  api_rate_limits: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 70, notes: 'Edge function rate limiting' },
  },
  usage_metering: {
    stripe: { status: 'configured', implementation: 'planned', confidence: 40, notes: 'Stripe metered billing' },
    supabase: { status: 'configured', implementation: 'planned', confidence: 50, notes: 'Custom metering tables' },
  },
  billing_portal: {
    stripe: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Stripe Billing Portal' },
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Customer-portal edge function' },
  },
  invoice_generation: {
    stripe: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Stripe invoice API' },
  },
  hipaa_compliance: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Supabase HIPAA add-on available' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Azure HIPAA BAA' },
  },
  gdpr_compliance: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Data deletion, consent management' },
  },
  ccpa_compliance: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 75, notes: 'Opt-out mechanisms' },
  },
  terms_conditions: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Legal page templates' },
  },
  privacy_policy: {
    supabase: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Privacy page templates' },
  },
  ai_transparency: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 65, notes: 'AI disclosure statements' },
  },
  data_retention: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Supabase data lifecycle' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'Azure data retention policies' },
  },
  adult_protection: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Content moderation API' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 88, notes: 'Azure Content Safety' },
  },
  age_verification: {
    supabase: { status: 'configured', implementation: 'planned', confidence: 30, notes: 'Third-party integration needed' },
  },
  coppa_compliance: {
    supabase: { status: 'configured', implementation: 'planned', confidence: 40, notes: 'Parental consent flow needed' },
  },
  content_moderation: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Moderation API' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 90, notes: 'Azure Content Safety' },
  },
  baa_agreements: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 50, notes: 'Supabase BAA available' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Azure BAA' },
  },
  soc2_compliance: {
    supabase: { status: 'configured', implementation: 'partial', confidence: 55, notes: 'Supabase SOC 2 Type II' },
    azure: { status: 'configured', implementation: 'implemented', confidence: 95, notes: 'Azure SOC 2 Type II' },
  },
};

// ============================================
// COMPUTE CATEGORY SUMMARIES FROM ACTUAL DATA
// ============================================

const computeCategorySummary = (category: FeatureCategory) => {
  const features = ALL_FEATURES.filter(f => f.category === category);
  let implemented = 0;
  let partial = 0;
  let planned = 0;
  let notStarted = 0;

  features.forEach(feature => {
    const featureImpl = FEATURE_IMPLEMENTATION_MATRIX[feature.id];
    if (!featureImpl || Object.keys(featureImpl).length === 0) {
      notStarted++;
      return;
    }
    
    // Get best status across all providers
    const statuses = Object.values(featureImpl).map(p => p?.implementation);
    if (statuses.includes('implemented')) {
      implemented++;
    } else if (statuses.includes('partial')) {
      partial++;
    } else if (statuses.includes('planned')) {
      planned++;
    } else {
      notStarted++;
    }
  });

  return { total: features.length, implemented, partial, planned, notStarted };
};

export const CATEGORY_IMPLEMENTATION_SUMMARY: Record<FeatureCategory, { 
  total: number; 
  implemented: number; 
  partial: number; 
  planned: number;
  notStarted: number;
}> = {
  INPUT: computeCategorySummary('INPUT'),
  SCRIPT: computeCategorySummary('SCRIPT'),
  VOICE: computeCategorySummary('VOICE'),
  AUDIO: computeCategorySummary('AUDIO'),
  SFX: computeCategorySummary('SFX'),
  IMAGE: computeCategorySummary('IMAGE'),
  VIDEO: computeCategorySummary('VIDEO'),
  ANIMATION: computeCategorySummary('ANIMATION'),
  '3D': computeCategorySummary('3D'),
  AR_VR: computeCategorySummary('AR_VR'),
  VFX: computeCategorySummary('VFX'),
  INTERACTIVE: computeCategorySummary('INTERACTIVE'),
  TRANSLATION: computeCategorySummary('TRANSLATION'),
  EXPORT: computeCategorySummary('EXPORT'),
  DOWNLOAD: computeCategorySummary('DOWNLOAD'),
  EDITING: computeCategorySummary('EDITING'),
  PIPELINE: computeCategorySummary('PIPELINE'),
  PUBLISHING: computeCategorySummary('PUBLISHING'),
  SECURITY: computeCategorySummary('SECURITY'),
  BUSINESS: computeCategorySummary('BUSINESS'),
  USE_CASE: { total: 0, implemented: 0, partial: 0, planned: 0, notStarted: 0 },
};

// ============================================
// GAP ANALYSIS (Using configured providers only)
// ============================================

export interface CriticalGap {
  feature: string;
  featureId?: string; // Links to ALL_FEATURES
  category: FeatureCategory;
  provider: string;
  providerId?: ProviderId;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  notes: string;
  relatedUseCases?: string[];
  relatedLLMs?: string[];
  crossFunctional?: { category: FeatureCategory; features: string[] }[];
}

export const CRITICAL_GAPS: CriticalGap[] = [
  { 
    feature: 'Lip-Sync Translation', 
    featureId: 'lip_sync_translate',
    category: 'TRANSLATION',
    provider: 'ModelsLab (Wav2Lip) / Alibaba (V-Express)', 
    providerId: 'modelslab',
    priority: 'high', 
    effort: 'medium', 
    notes: 'APIs available, need integration',
    relatedUseCases: ['Voice dubbing', 'Multilingual video', 'Localization'],
    relatedLLMs: ['Qwen 2.5', 'GPT-4o'],
    crossFunctional: [
      { category: 'VOICE', features: ['voice_cloning', 'multi_language_voice'] },
      { category: 'VIDEO', features: ['lip_sync', 'ai_avatars'] }
    ]
  },
  { 
    feature: 'AI Music Generation', 
    featureId: 'ai_music_gen',
    category: 'AUDIO',
    provider: 'ElevenLabs SFX (Alternative)', 
    providerId: 'elevenlabs',
    priority: 'medium', 
    effort: 'low', 
    notes: 'Use ElevenLabs SFX as workaround',
    relatedUseCases: ['Background music', 'Video scoring', 'Podcast intros'],
    crossFunctional: [
      { category: 'VIDEO', features: ['text_to_video', 'script_to_video'] }
    ]
  },
  { 
    feature: 'DeepSeek R1 Reasoning', 
    featureId: 'ai_script_gen',
    category: 'SCRIPT',
    provider: 'DeepSeek', 
    providerId: 'deepseek',
    priority: 'high', 
    effort: 'low', 
    notes: 'Model available, needs integration',
    relatedUseCases: ['Complex analysis', 'Multi-step reasoning', 'Technical docs'],
    relatedLLMs: ['DeepSeek V3', 'GPT-4o'],
    crossFunctional: [
      { category: 'INPUT', features: ['document_upload', 'csv_data'] }
    ]
  },
  { 
    feature: 'ControlNet Depth/Canny', 
    featureId: 'controlnet',
    category: 'IMAGE',
    provider: 'ModelsLab', 
    providerId: 'modelslab',
    priority: 'medium', 
    effort: 'medium', 
    notes: 'Pose working, add depth/canny modes',
    relatedUseCases: ['Architectural viz', 'Product mockups', 'Character design'],
    crossFunctional: [
      { category: '3D', features: ['3d_scene_gen', 'mesh_generation'] }
    ]
  },
  { 
    feature: 'Image Inpainting', 
    featureId: 'inpainting',
    category: 'IMAGE',
    provider: 'ModelsLab / Replicate', 
    providerId: 'modelslab',
    priority: 'medium', 
    effort: 'low', 
    notes: 'APIs ready, need UI integration',
    relatedUseCases: ['Object removal', 'Background editing', 'Photo restoration'],
    crossFunctional: [
      { category: 'VFX', features: ['ai_bg_replace', 'object_removal'] }
    ]
  },
  { 
    feature: 'Advanced AI Avatars', 
    featureId: 'ai_avatars',
    category: 'VIDEO',
    provider: 'ModelsLab / Alibaba EMO', 
    providerId: 'alibaba',
    priority: 'high', 
    effort: 'high', 
    notes: 'Complex integration, multiple APIs',
    relatedUseCases: ['Training videos', 'Marketing content', 'Personalized messages'],
    relatedLLMs: ['GPT-4o', 'Claude 3.5'],
    crossFunctional: [
      { category: 'VOICE', features: ['tts', 'voice_cloning'] },
      { category: 'ANIMATION', features: ['motion_graphics', 'auto_animate'] }
    ]
  },
  { 
    feature: 'AR/VR Export', 
    featureId: 'ar_preview',
    category: 'AR_VR',
    provider: 'ModelsLab 3D', 
    providerId: 'modelslab',
    priority: 'low', 
    effort: 'high', 
    notes: 'Future roadmap - requires 3D pipeline',
    relatedUseCases: ['Immersive training', 'Virtual tours', 'Product demos'],
    crossFunctional: [
      { category: '3D', features: ['3d_scene_gen', '360_view', 'mesh_generation'] },
      { category: 'INTERACTIVE', features: ['spatial', 'immersive'] }
    ]
  },
  { 
    feature: 'Multilingual AI Avatars', 
    featureId: 'multilingual_avatars',
    category: 'TRANSLATION',
    provider: 'Alibaba / ModelsLab', 
    providerId: 'alibaba',
    priority: 'medium', 
    effort: 'high', 
    notes: 'Combine avatar + translation + lip-sync',
    relatedUseCases: ['Global marketing', 'E-learning localization', 'Corporate comms'],
    relatedLLMs: ['Qwen 2.5', 'Gemini 2.5 Pro'],
    crossFunctional: [
      { category: 'VIDEO', features: ['ai_avatars', 'lip_sync'] },
      { category: 'VOICE', features: ['multi_language_voice', 'voice_cloning'] }
    ]
  },
];

// ============================================
// GENIE SUITE PRODUCTS
// ============================================

export type GenieProduct = 'deck' | 'vibe' | 'spark' | 'mind' | 'arc' | 'hub' | 'ask_genie';

export const GENIE_PRODUCT_LABELS: Record<GenieProduct, { name: string; emoji: string; description: string }> = {
  deck: { name: 'Deck', emoji: '📊', description: 'Presentation & slides generation' },
  vibe: { name: 'Vibe', emoji: '🎬', description: 'Video production & editing' },
  spark: { name: 'Spark', emoji: '✨', description: 'Creative content & ideation' },
  mind: { name: 'Mind', emoji: '🧠', description: 'Knowledge & document analysis' },
  arc: { name: 'Arc', emoji: '🎯', description: 'Production hub & workflow' },
  hub: { name: 'Hub', emoji: '🔗', description: 'AI model & provider management' },
  ask_genie: { name: 'Ask Genie', emoji: '💬', description: 'Conversational AI assistant' },
};

// ============================================
// CROSS-FUNCTIONAL FEATURE MAPPING
// ============================================

export interface CrossFunctionalMapping {
  primaryFeatureId: string;
  primaryCategory: FeatureCategory;
  relatedFeatures: { featureId: string; category: FeatureCategory; relationship: 'requires' | 'enhances' | 'enables' | 'alternative' }[];
  useCases: string[];
  scenarios: string[];
  recommendedProviders: ProviderId[];
  recommendedLLMs: string[];
  genieProducts: GenieProduct[];
}

export const CROSS_FUNCTIONAL_MAPPINGS: CrossFunctionalMapping[] = [
  // ============================================
  // INPUT CATEGORY - All 10 Input Features
  // ============================================
  {
    primaryFeatureId: 'text_prompt',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'ai_image_gen', category: 'IMAGE', relationship: 'enables' },
      { featureId: 'tts', category: 'VOICE', relationship: 'enables' },
      { featureId: 'one_click_translate', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Content creation', 'Script writing', 'Image generation', 'Translation requests'],
    scenarios: ['Quick ideation', 'Multi-turn dialogue', 'Creative writing', 'Technical documentation'],
    recommendedProviders: ['openai', 'gemini', 'claude', 'deepseek', 'alibaba', 'deepl', 'modelslab', 'replicate', 'elevenlabs'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro', 'Claude 3.5 Sonnet', 'DeepSeek V3', 'Qwen 2.5'],
    genieProducts: ['deck', 'vibe', 'spark', 'mind', 'arc', 'hub', 'ask_genie'],
  },
  {
    primaryFeatureId: 'document_upload',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'script_from_url', category: 'SCRIPT', relationship: 'alternative' },
      { featureId: 'pptx_import', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'one_click_translate', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Document analysis', 'Contract review', 'Research summarization', 'Document translation'],
    scenarios: ['PDF analysis', 'DOCX editing', 'Report generation', 'Legal document review'],
    recommendedProviders: ['openai', 'gemini', 'deepl'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'mind', 'arc', 'ask_genie'],
  },
  {
    primaryFeatureId: 'url_input',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'script_from_url', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'document_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'pptx_import', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'one_click_translate', category: 'TRANSLATION', relationship: 'enables' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'idea_to_presentation', category: 'PIPELINE', relationship: 'enables' },
    ],
    useCases: ['Web scraping', 'Article summarization', 'Competitor research', 'Blog-to-video', 'Content aggregation'],
    scenarios: ['News analysis', 'Research aggregation', 'Content repurposing', 'SEO analysis', 'Blog-to-presentation'],
    recommendedProviders: ['openai', 'gemini', 'claude'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'mind', 'spark', 'vibe', 'ask_genie'],
  },
  {
    primaryFeatureId: 'image_upload',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'image_to_image', category: 'IMAGE', relationship: 'enables' },
      { featureId: 'controlnet', category: 'IMAGE', relationship: 'enables' },
      { featureId: 'style_transfer', category: 'IMAGE', relationship: 'enables' },
      { featureId: 'bg_removal', category: 'IMAGE', relationship: 'enables' },
      { featureId: 'inpainting', category: 'IMAGE', relationship: 'enables' },
    ],
    useCases: ['Vision analysis', 'Image editing', 'Style transfer', 'OCR extraction', 'Object detection'],
    scenarios: ['Product photography', 'Medical imaging', 'Design iteration', 'Brand asset editing'],
    recommendedProviders: ['openai', 'gemini', 'deepseek', 'alibaba', 'modelslab', 'replicate', 'stability'],
    recommendedLLMs: ['GPT-4o Vision', 'Gemini 2.5 Pro', 'DeepSeek-VL', 'Qwen-VL'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc'],
  },
  {
    primaryFeatureId: 'video_upload',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'video_trimming', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'audio_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'screen_recording', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'image_to_video', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'stt', category: 'AUDIO', relationship: 'enables' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'video_enhancement', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'long_to_short', category: 'PIPELINE', relationship: 'enables' },
      { featureId: 'voice_dubbing', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Video transcription', 'Scene analysis', 'Video-to-video processing', 'Content moderation', 'Highlight extraction', 'Video dubbing'],
    scenarios: ['Training content review', 'Social media repurposing', 'Highlight extraction', 'Video summarization', 'Long-to-short clips'],
    recommendedProviders: ['openai', 'gemini', 'alibaba', 'modelslab', 'replicate', 'elevenlabs'],
    recommendedLLMs: ['Gemini 2.5 Pro', 'GPT-4o Vision', 'Qwen2.5-VL'],
    genieProducts: ['vibe', 'arc', 'mind', 'spark'],
  },
  {
    primaryFeatureId: 'audio_upload',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'stt', category: 'AUDIO', relationship: 'enables' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'voice_recording', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'video_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'one_click_translate', category: 'TRANSLATION', relationship: 'enables' },
      { featureId: 'voice_dubbing', category: 'TRANSLATION', relationship: 'enables' },
      { featureId: 'noise_reduction', category: 'AUDIO', relationship: 'enhances' },
      { featureId: 'music_stems', category: 'SFX', relationship: 'enables' },
    ],
    useCases: ['Transcription', 'Voice analysis', 'Meeting notes', 'Speaker diarization', 'Audio dubbing', 'Podcast processing'],
    scenarios: ['Podcast transcription', 'Interview capture', 'Voiceover QC', 'Multi-speaker meetings', 'Audio localization'],
    recommendedProviders: ['openai', 'elevenlabs', 'alibaba', 'gemini', 'assemblyai'],
    recommendedLLMs: ['Whisper', 'Scribe', 'Paraformer'],
    genieProducts: ['vibe', 'mind', 'arc', 'ask_genie'],
  },
  {
    primaryFeatureId: 'pptx_import',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'document_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'script_to_slides', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'pptx_export', category: 'EXPORT', relationship: 'enables' },
    ],
    useCases: ['Slide analysis', 'Presentation enhancement', 'Content extraction', 'Template reuse'],
    scenarios: ['Legacy deck updates', 'Brand compliance checks', 'Content migration', 'Deck translation'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'arc'],
  },
  {
    primaryFeatureId: 'voice_recording',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'stt', category: 'AUDIO', relationship: 'enables' },
      { featureId: 'audio_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'tts', category: 'VOICE', relationship: 'enhances' },
    ],
    useCases: ['Live transcription', 'Voice commands', 'Interview capture', 'Note-taking'],
    scenarios: ['Real-time dictation', 'Accessibility', 'Field reporting', 'Voice search'],
    recommendedProviders: ['openai', 'alibaba', 'elevenlabs', 'gemini'],
    recommendedLLMs: ['Whisper', 'Paraformer', 'Scribe'],
    genieProducts: ['ask_genie', 'mind', 'arc'],
  },
  {
    primaryFeatureId: 'screen_recording',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'video_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'video_trimming', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'image_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'stt', category: 'AUDIO', relationship: 'enables' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'script_to_slides', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'auto_record_to_avatar', category: 'PIPELINE', relationship: 'enables' },
    ],
    useCases: ['Tutorial creation', 'Bug reporting', 'Demo capture', 'Workflow documentation', 'Training video production'],
    scenarios: ['Software training', 'Support tickets', 'Process documentation', 'Product demos', 'Screen-to-slides'],
    recommendedProviders: ['openai', 'gemini', 'alibaba', 'elevenlabs'],
    recommendedLLMs: ['Gemini 2.5 Pro', 'GPT-4o Vision', 'Qwen-VL'],
    genieProducts: ['vibe', 'arc', 'hub', 'deck'],
  },
  {
    primaryFeatureId: 'csv_data',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'interactive_charts', category: 'INTERACTIVE', relationship: 'enables' },
      { featureId: 'document_upload', category: 'INPUT', relationship: 'alternative' },
    ],
    useCases: ['Data visualization', 'Analytics processing', 'Report generation', 'Trend analysis'],
    scenarios: ['Business intelligence', 'Financial modeling', 'Survey analysis', 'Dashboard creation'],
    recommendedProviders: ['openai', 'gemini', 'claude'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'mind', 'arc'],
  },
  // ============================================
  // SCRIPT CATEGORY - All 15 Script Features
  // ============================================
  {
    primaryFeatureId: 'ai_script_gen',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', relationship: 'requires' },
      { featureId: 'script_to_slides', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'script_to_video_auto', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'tts', category: 'VOICE', relationship: 'enables' },
      { featureId: 'multi_scene_script', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['Presentation scripts', 'Video narration', 'Training content', 'Marketing copy', 'Educational material'],
    scenarios: ['Quick ideation', 'Multi-scene generation', 'Brand voice', 'Multi-language scripts'],
    recommendedProviders: ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
    recommendedLLMs: ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 2.5 Pro', 'DeepSeek V3', 'Qwen 2.5'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc', 'ask_genie'],
  },
  {
    primaryFeatureId: 'script_from_url',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'url_input', category: 'INPUT', relationship: 'requires' },
      { featureId: 'document_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['Blog-to-video conversion', 'Article repurposing', 'Research synthesis', 'News summarization'],
    scenarios: ['Content repurposing', 'SEO content', 'Competitor analysis', 'Aggregation'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'vibe', 'mind', 'spark'],
  },
  {
    primaryFeatureId: 'script_editing',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'tone_style', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'ai_rewrite', category: 'SCRIPT', relationship: 'alternative' },
    ],
    useCases: ['Tone adjustment', 'Length optimization', 'Clarity improvement', 'Grammar correction'],
    scenarios: ['Professional polish', 'Audience adaptation', 'Multi-iteration refinement'],
    recommendedProviders: ['openai', 'claude'],
    recommendedLLMs: ['Claude 3.5 Sonnet', 'GPT-4o'],
    genieProducts: ['deck', 'vibe', 'spark', 'mind'],
  },
  {
    primaryFeatureId: 'tone_style',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'brand_voice', category: 'SCRIPT', relationship: 'alternative' },
      { featureId: 'audience_input', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['Professional vs casual', 'Technical vs conversational', 'Formal vs friendly'],
    scenarios: ['Brand alignment', 'Audience targeting', 'Cross-cultural communication'],
    recommendedProviders: ['openai', 'claude'],
    recommendedLLMs: ['Claude 3.5 Sonnet', 'GPT-4o'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc'],
  },
  {
    primaryFeatureId: 'audience_input',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'tone_style', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'script_length', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['B2B vs B2C targeting', 'Age-appropriate content', 'Technical level adjustment'],
    scenarios: ['Personalized content', 'Targeted marketing', 'Educational materials'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc'],
  },
  {
    primaryFeatureId: 'script_length',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'alternative' },
    ],
    useCases: ['Short social media', 'Medium blog posts', 'Long-form presentations'],
    scenarios: ['Platform optimization', 'Attention span matching', 'Time-constrained delivery'],
    recommendedProviders: ['openai', 'claude'],
    recommendedLLMs: ['GPT-4o', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'vibe', 'spark'],
  },
  {
    primaryFeatureId: 'multi_scene_script',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'script_to_video_auto', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'outline_gen', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['Multi-slide presentations', 'Video chapters', 'Training modules', 'Story-driven content'],
    scenarios: ['Complex narratives', 'Educational sequences', 'Product demos'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'vibe', 'arc'],
  },
  {
    primaryFeatureId: 'speaker_notes',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'script_to_slides', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['Presentation delivery', 'Training facilitation', 'Webinar hosting'],
    scenarios: ['Presenter preparation', 'Talking points', 'Q&A anticipation'],
    recommendedProviders: ['openai', 'claude'],
    recommendedLLMs: ['GPT-4o', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'arc'],
  },
  {
    primaryFeatureId: 'outline_gen',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', relationship: 'requires' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enables' },
      { featureId: 'multi_scene_script', category: 'SCRIPT', relationship: 'enables' },
    ],
    useCases: ['Content planning', 'Research organization', 'Curriculum design'],
    scenarios: ['Quick structuring', 'Brainstorming', 'Collaborative planning'],
    recommendedProviders: ['openai', 'claude'],
    recommendedLLMs: ['GPT-4o', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'mind', 'spark'],
  },
  {
    primaryFeatureId: 'content_summary',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'document_upload', category: 'INPUT', relationship: 'requires' },
      { featureId: 'audio_upload', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enables' },
    ],
    useCases: ['Document analysis', 'Meeting notes', 'Research synthesis'],
    scenarios: ['Time savings', 'Key point extraction', 'Executive summaries'],
    recommendedProviders: ['openai', 'gemini', 'claude'],
    recommendedLLMs: ['Gemini 2.5 Pro', 'GPT-4o', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'mind', 'arc', 'ask_genie'],
  },
  {
    primaryFeatureId: 'script_translation',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'one_click_translate', category: 'TRANSLATION', relationship: 'enables' },
      { featureId: 'voice_dubbing', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Multi-language content', 'Global campaigns', 'Localization workflows'],
    scenarios: ['Rapid localization', 'Consistent terminology', 'CJK markets'],
    recommendedProviders: ['deepl', 'alibaba', 'gemini'],
    recommendedLLMs: ['Qwen 2.5', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'vibe', 'mind', 'arc'],
  },
  {
    primaryFeatureId: 'script_to_slides',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'ai_image_gen', category: 'IMAGE', relationship: 'enhances' },
      { featureId: 'speaker_notes', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'pptx_export', category: 'EXPORT', relationship: 'enables' },
    ],
    useCases: ['Auto-presentation', 'Training decks', 'Sales materials', 'Educational content'],
    scenarios: ['Pitch decks', 'Educational slides', 'Corporate training', 'Rapid deck creation'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'arc'],
  },
  {
    primaryFeatureId: 'script_to_video_auto',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'ai_image_gen', category: 'IMAGE', relationship: 'enhances' },
      { featureId: 'text_to_video', category: 'VIDEO', relationship: 'alternative' },
    ],
    useCases: ['Explainer videos', 'Training content', 'Marketing videos', 'Social media'],
    scenarios: ['Rapid video production', 'Consistent branding', 'Multi-language videos'],
    recommendedProviders: ['modelslab', 'alibaba', 'openai', 'elevenlabs'],
    recommendedLLMs: ['GPT-4o', 'Qwen 2.5'],
    genieProducts: ['vibe', 'arc'],
  },
  {
    primaryFeatureId: 'ai_rewrite',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'script_editing', category: 'SCRIPT', relationship: 'alternative' },
      { featureId: 'tone_style', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['Style adaptation', 'Clarity improvement', 'Tone adjustment', 'SEO optimization'],
    scenarios: ['Content refresh', 'A/B testing', 'Audience adaptation'],
    recommendedProviders: ['openai', 'claude'],
    recommendedLLMs: ['Claude 3.5 Sonnet', 'GPT-4o'],
    genieProducts: ['deck', 'vibe', 'spark', 'mind'],
  },
  {
    primaryFeatureId: 'brand_voice',
    primaryCategory: 'SCRIPT',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'tone_style', category: 'SCRIPT', relationship: 'alternative' },
    ],
    useCases: ['Corporate messaging', 'Marketing consistency', 'Multi-channel content'],
    scenarios: ['Brand consistency', 'Team scaling', 'Content governance'],
    recommendedProviders: ['openai', 'claude'],
    recommendedLLMs: ['GPT-4o', 'Claude 3.5 Sonnet'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc'],
  },
  // VOICE CATEGORY
  {
    primaryFeatureId: 'tts',
    primaryCategory: 'VOICE',
    relatedFeatures: [
      { featureId: 'voice_cloning', category: 'VOICE', relationship: 'enhances' },
      { featureId: 'voice_emotion', category: 'VOICE', relationship: 'enhances' },
      { featureId: 'lip_sync', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enables' },
    ],
    useCases: ['Narration', 'Accessibility', 'Voiceovers'],
    scenarios: ['Video narration', 'Podcast intro', 'E-learning modules'],
    recommendedProviders: ['elevenlabs', 'openai', 'alibaba'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'vibe', 'mind', 'arc', 'ask_genie'],
  },
  {
    primaryFeatureId: 'voice_cloning',
    primaryCategory: 'VOICE',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'voice_dubbing', category: 'TRANSLATION', relationship: 'enables' },
      { featureId: 'multilingual_avatars', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Brand voice', 'Personalized content', 'Localization'],
    scenarios: ['CEO message localization', 'Training personalization', 'Podcast'],
    recommendedProviders: ['elevenlabs'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'mind', 'arc'],
  },
  {
    primaryFeatureId: 'multi_language_voice',
    primaryCategory: 'VOICE',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'script_translation', category: 'SCRIPT', relationship: 'enhances' },
      { featureId: 'one_click_translate', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Global campaigns', 'Multilingual training', 'International webinars', 'Localized marketing'],
    scenarios: ['CJK content', 'European localization', 'APAC markets', 'LatAm expansion'],
    recommendedProviders: ['elevenlabs', 'alibaba'],
    recommendedLLMs: ['GPT-4o', 'Qwen 2.5'],
    genieProducts: ['deck', 'vibe', 'mind', 'arc'],
  },
  {
    primaryFeatureId: 'voice_emotion',
    primaryCategory: 'VOICE',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'enhances' },
    ],
    useCases: ['Storytelling', 'Brand personality', 'Entertainment', 'Training empathy'],
    scenarios: ['Children content', 'Drama narration', 'IVR systems', 'Customer service'],
    recommendedProviders: ['elevenlabs'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'mind', 'arc'],
  },
  {
    primaryFeatureId: 'voice_speed',
    primaryCategory: 'VOICE',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'audio_sync', category: 'AUDIO', relationship: 'enhances' },
    ],
    useCases: ['Duration matching', 'Accessibility', 'Platform requirements', 'Pacing control'],
    scenarios: ['Timed ads', 'Accessibility compliance', 'Podcast pacing', 'Video sync'],
    recommendedProviders: ['elevenlabs', 'openai'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'vibe', 'mind', 'arc'],
  },
  {
    primaryFeatureId: 'ai_voice_count',
    primaryCategory: 'VOICE',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'voice_cloning', category: 'VOICE', relationship: 'alternative' },
    ],
    useCases: ['Character variety', 'Audience matching', 'Brand testing', 'Accessibility'],
    scenarios: ['Multi-character scripts', 'A/B voice testing', 'Regional customization', 'Diverse representation'],
    recommendedProviders: ['elevenlabs'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'vibe', 'mind', 'spark', 'arc'],
  },
  // IMAGE CATEGORY
  {
    primaryFeatureId: 'ai_image_gen',
    primaryCategory: 'IMAGE',
    relatedFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', relationship: 'requires' },
      { featureId: 'image_to_image', category: 'IMAGE', relationship: 'enhances' },
      { featureId: 'controlnet', category: 'IMAGE', relationship: 'enhances' },
      { featureId: 'image_animation', category: 'IMAGE', relationship: 'enables' },
      { featureId: 'text_to_video', category: 'VIDEO', relationship: 'enables' },
    ],
    useCases: ['Visual content', 'Marketing assets', 'Product mockups'],
    scenarios: ['Hero images', 'Social media', 'Slide visuals'],
    recommendedProviders: ['modelslab', 'openai', 'replicate'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc'],
  },
  {
    primaryFeatureId: 'controlnet',
    primaryCategory: 'IMAGE',
    relatedFeatures: [
      { featureId: 'image_upload', category: 'INPUT', relationship: 'requires' },
      { featureId: 'ai_image_gen', category: 'IMAGE', relationship: 'enhances' },
      { featureId: '3d_scene_gen', category: '3D', relationship: 'enables' },
    ],
    useCases: ['Pose control', 'Depth mapping', 'Edge detection'],
    scenarios: ['Character design', 'Architectural viz', 'Product mockups'],
    recommendedProviders: ['modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'spark', 'arc'],
  },
  // VIDEO CATEGORY
  {
    primaryFeatureId: 'script_to_video',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'ai_script_gen', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'tts', category: 'VOICE', relationship: 'enhances' },
      { featureId: 'ai_image_gen', category: 'IMAGE', relationship: 'enables' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enhances' },
    ],
    useCases: ['Training videos', 'Marketing content', 'Educational material'],
    scenarios: ['Explainer videos', 'Product demos', 'Onboarding'],
    recommendedProviders: ['gemini', 'openai', 'modelslab', 'elevenlabs'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['vibe', 'arc'],
  },
  {
    primaryFeatureId: 'text_to_video',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', relationship: 'requires' },
      { featureId: 'ai_image_gen', category: 'IMAGE', relationship: 'alternative' },
      { featureId: 'image_to_video', category: 'VIDEO', relationship: 'alternative' },
      { featureId: 'bg_music', category: 'AUDIO', relationship: 'enhances' },
    ],
    useCases: ['Social media', 'Ads', 'Explainer videos'],
    scenarios: ['Short-form content', 'Reels', 'TikTok'],
    recommendedProviders: ['modelslab', 'replicate', 'alibaba'],
    recommendedLLMs: ['Gemini 2.5 Pro'],
    genieProducts: ['vibe', 'spark', 'arc'],
  },
  {
    primaryFeatureId: 'lip_sync',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'ai_avatars', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'lip_sync_translate', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Talking head videos', 'Localization', 'Personalized messages'],
    scenarios: ['Training videos', 'Marketing', 'Corporate comms'],
    recommendedProviders: ['modelslab', 'alibaba'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'arc'],
  },
  // TRANSLATION CATEGORY
  {
    primaryFeatureId: 'one_click_translate',
    primaryCategory: 'TRANSLATION',
    relatedFeatures: [
      { featureId: 'auto_subtitles_translate', category: 'TRANSLATION', relationship: 'enhances' },
      { featureId: 'voice_dubbing', category: 'TRANSLATION', relationship: 'enables' },
      { featureId: 'lip_sync_translate', category: 'TRANSLATION', relationship: 'enables' },
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
    ],
    useCases: ['Global content', 'Localization', 'Multi-market distribution'],
    scenarios: ['Video translation', 'Document localization', 'Subtitle generation'],
    recommendedProviders: ['deepl', 'alibaba', 'elevenlabs'],
    recommendedLLMs: ['Qwen 2.5', 'Claude 3.5 Sonnet'],
    genieProducts: ['vibe', 'deck', 'mind', 'arc'],
  },
  {
    primaryFeatureId: 'voice_dubbing',
    primaryCategory: 'TRANSLATION',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'voice_cloning', category: 'VOICE', relationship: 'enhances' },
      { featureId: 'lip_sync_translate', category: 'TRANSLATION', relationship: 'enables' },
    ],
    useCases: ['Video localization', 'Film dubbing', 'E-learning'],
    scenarios: ['Multi-language video', 'Training localization', 'Marketing'],
    recommendedProviders: ['elevenlabs', 'alibaba', 'deepl'],
    recommendedLLMs: ['Qwen 2.5'],
    genieProducts: ['vibe', 'arc'],
  },
  // AUDIO CATEGORY
  {
    primaryFeatureId: 'stt',
    primaryCategory: 'AUDIO',
    relatedFeatures: [
      { featureId: 'audio_upload', category: 'INPUT', relationship: 'requires' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
    ],
    useCases: ['Transcription', 'Subtitles', 'Meeting notes'],
    scenarios: ['Podcast transcription', 'Video subtitles', 'Interview notes'],
    recommendedProviders: ['openai', 'alibaba', 'elevenlabs'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'mind', 'arc', 'ask_genie'],
  },
  {
    primaryFeatureId: 'ai_music_gen',
    primaryCategory: 'AUDIO',
    relatedFeatures: [
      { featureId: 'bg_music', category: 'AUDIO', relationship: 'alternative' },
      { featureId: 'text_to_video', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'script_to_video', category: 'VIDEO', relationship: 'enhances' },
    ],
    useCases: ['Background music', 'Video scoring', 'Podcast intros'],
    scenarios: ['Promo videos', 'Presentations', 'Social media'],
    recommendedProviders: ['elevenlabs'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'arc'],
  },
  // ============================================
  // 3D CATEGORY - Comprehensive 21 Features
  // ============================================
  {
    primaryFeatureId: '3d_scene_gen',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'mesh_generation', category: '3D', relationship: 'enhances' },
      { featureId: 'controlnet', category: 'IMAGE', relationship: 'requires' },
      { featureId: 'ar_preview', category: 'AR_VR', relationship: 'enables' },
      { featureId: 'pbr_textures', category: '3D', relationship: 'enhances' },
      { featureId: 'vr_360_video', category: 'AR_VR', relationship: 'enables' },
    ],
    useCases: ['Architectural viz', 'Product 3D', 'Virtual environments', 'E-commerce catalogs', 'Virtual tours'],
    scenarios: ['Real estate walkthroughs', 'Product configurators', 'Gaming environments', 'Virtual showrooms'],
    recommendedProviders: ['modelslab', 'meshy', 'replicate'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['vibe', 'arc', 'hub'],
  },
  {
    primaryFeatureId: 'mesh_generation',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', relationship: 'requires' },
      { featureId: '3d_scene_gen', category: '3D', relationship: 'enables' },
      { featureId: 'pbr_textures', category: '3D', relationship: 'enhances' },
      { featureId: '3d_rigging', category: '3D', relationship: 'enables' },
    ],
    useCases: ['Game asset creation', 'Product prototyping', '3D printing prep', 'Character design'],
    scenarios: ['Rapid prototyping', 'Custom 3D assets', 'Product visualization', 'Concept art to 3D'],
    recommendedProviders: ['meshy', 'modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'hub'],
  },
  {
    primaryFeatureId: 'image_to_3d',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'image_upload', category: 'INPUT', relationship: 'requires' },
      { featureId: 'mesh_generation', category: '3D', relationship: 'enables' },
      { featureId: 'pbr_textures', category: '3D', relationship: 'enhances' },
      { featureId: 'ar_product_view', category: 'AR_VR', relationship: 'enables' },
    ],
    useCases: ['Product digitization', 'Photo to 3D model', 'Asset generation from sketches', 'E-commerce 3D'],
    scenarios: ['Product photography to 3D', 'Art concept to model', 'Furniture visualization', 'Fashion 3D'],
    recommendedProviders: ['meshy', 'replicate', 'modelslab'],
    recommendedLLMs: ['GPT-4o Vision', 'Gemini 2.5 Pro'],
    genieProducts: ['vibe', 'arc', 'hub'],
  },
  {
    primaryFeatureId: 'pbr_textures',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'mesh_generation', category: '3D', relationship: 'requires' },
      { featureId: '3d_scene_gen', category: '3D', relationship: 'enhances' },
      { featureId: 'stylized_3d', category: '3D', relationship: 'alternative' },
    ],
    useCases: ['Photorealistic rendering', 'Game-ready assets', 'Architectural materials', 'Product visualization'],
    scenarios: ['High-fidelity product shots', 'Game asset creation', 'VFX production', 'Automotive viz'],
    recommendedProviders: ['meshy', 'modelslab'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'hub'],
  },
  {
    primaryFeatureId: '3d_rigging',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'mesh_generation', category: '3D', relationship: 'requires' },
      { featureId: '3d_animation', category: '3D', relationship: 'enables' },
      { featureId: 'skeletal_animation', category: 'ANIMATION', relationship: 'enables' },
    ],
    useCases: ['Character animation prep', 'Game character rigging', 'Avatar creation', 'Motion capture ready'],
    scenarios: ['Character design', 'Animation production', 'Game development', 'VTuber creation'],
    recommendedProviders: ['meshy', 'modelslab', 'alibaba'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'hub'],
  },
  {
    primaryFeatureId: '3d_animation',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: '3d_rigging', category: '3D', relationship: 'requires' },
      { featureId: 'skeletal_animation', category: 'ANIMATION', relationship: 'enhances' },
      { featureId: 'character_animation', category: 'ANIMATION', relationship: 'enhances' },
    ],
    useCases: ['Product demos', 'Character movement', 'Explainer animations', 'Tutorial content'],
    scenarios: ['Product reveal videos', 'Character showcases', '3D explainer videos', 'Game trailers'],
    recommendedProviders: ['modelslab', 'meshy', 'alibaba'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'arc'],
  },
  {
    primaryFeatureId: '3d_export_formats',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'mesh_generation', category: '3D', relationship: 'requires' },
      { featureId: 'ar_preview', category: 'AR_VR', relationship: 'enables' },
      { featureId: 'gltf_export', category: 'EXPORT', relationship: 'enables' },
    ],
    useCases: ['Cross-platform delivery', 'AR deployment', 'Game engine import', '3D printing'],
    scenarios: ['Unity/Unreal import', 'AR Quick Look', 'WebXR content', 'Model viewer embed'],
    recommendedProviders: ['meshy', 'modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'hub', 'arc'],
  },
  {
    primaryFeatureId: 'stylized_3d',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'mesh_generation', category: '3D', relationship: 'requires' },
      { featureId: 'style_transfer', category: 'IMAGE', relationship: 'enhances' },
      { featureId: 'pbr_textures', category: '3D', relationship: 'alternative' },
    ],
    useCases: ['Artistic 3D', 'Low-poly game assets', 'Cartoon characters', 'Brand-specific styles'],
    scenarios: ['Mobile game assets', 'Children content', 'Brand mascots', 'NFT art'],
    recommendedProviders: ['meshy', 'modelslab'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'spark'],
  },
  {
    primaryFeatureId: 'product_3d',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'image_to_3d', category: '3D', relationship: 'requires' },
      { featureId: 'ar_product_view', category: 'AR_VR', relationship: 'enables' },
      { featureId: 'pbr_textures', category: '3D', relationship: 'enhances' },
    ],
    useCases: ['E-commerce catalogs', 'Product configurators', 'Virtual try-on', '360° product views'],
    scenarios: ['Online retail', 'Furniture shopping', 'Automotive configurator', 'Fashion retail'],
    recommendedProviders: ['meshy', 'modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['arc', 'hub'],
  },
  // ============================================
  // AR/VR CATEGORY - Comprehensive 10 Features
  // ============================================
  {
    primaryFeatureId: 'ar_preview',
    primaryCategory: 'AR_VR',
    relatedFeatures: [
      { featureId: '3d_scene_gen', category: '3D', relationship: 'requires' },
      { featureId: 'ar_product_view', category: 'AR_VR', relationship: 'enhances' },
      { featureId: 'webxr', category: 'AR_VR', relationship: 'enables' },
    ],
    useCases: ['Product placement', 'Interior design', 'Retail try-before-buy', 'Education'],
    scenarios: ['Furniture AR', 'Fashion try-on', 'Packaging preview', 'Training simulations'],
    recommendedProviders: ['modelslab', 'meshy', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['arc', 'hub'],
  },
  {
    primaryFeatureId: 'webxr',
    primaryCategory: 'AR_VR',
    relatedFeatures: [
      { featureId: 'ar_preview', category: 'AR_VR', relationship: 'requires' },
      { featureId: '3d_scene_gen', category: '3D', relationship: 'requires' },
      { featureId: 'vr_360_video', category: 'AR_VR', relationship: 'enhances' },
    ],
    useCases: ['Web-based AR/VR', 'Cross-platform XR', 'No-app experiences', 'Instant access'],
    scenarios: ['Marketing experiences', 'Training modules', 'Virtual tours', 'Product demos'],
    recommendedProviders: ['modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['hub', 'arc'],
  },
  {
    primaryFeatureId: 'ar_filters',
    primaryCategory: 'AR_VR',
    relatedFeatures: [
      { featureId: 'face_tracking', category: 'AR_VR', relationship: 'requires' },
      { featureId: 'ar_preview', category: 'AR_VR', relationship: 'enhances' },
      { featureId: 'brand_overlays', category: 'IMAGE', relationship: 'enhances' },
    ],
    useCases: ['Social media filters', 'Brand campaigns', 'Virtual try-on', 'Entertainment'],
    scenarios: ['Instagram filters', 'TikTok effects', 'Beauty try-on', 'Event experiences'],
    recommendedProviders: ['modelslab', 'alibaba', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'spark'],
  },
  {
    primaryFeatureId: 'ar_product_view',
    primaryCategory: 'AR_VR',
    relatedFeatures: [
      { featureId: 'product_3d', category: '3D', relationship: 'requires' },
      { featureId: 'ar_preview', category: 'AR_VR', relationship: 'enhances' },
      { featureId: 'image_to_3d', category: '3D', relationship: 'requires' },
    ],
    useCases: ['E-commerce AR', 'Furniture placement', 'Product try-on', 'Scale visualization'],
    scenarios: ['IKEA-style placement', 'Watch try-on', 'Sneaker preview', 'Home decor'],
    recommendedProviders: ['meshy', 'modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['arc', 'hub'],
  },
  {
    primaryFeatureId: 'mixed_reality',
    primaryCategory: 'AR_VR',
    relatedFeatures: [
      { featureId: 'ar_preview', category: 'AR_VR', relationship: 'requires' },
      { featureId: 'vr_360_video', category: 'AR_VR', relationship: 'enhances' },
      { featureId: 'hand_tracking', category: 'AR_VR', relationship: 'enhances' },
    ],
    useCases: ['Hybrid experiences', 'Industrial training', 'Medical visualization', 'Remote collaboration'],
    scenarios: ['HoloLens apps', 'Quest mixed reality', 'Industrial maintenance', 'Surgical planning'],
    recommendedProviders: ['azure', 'modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['hub'],
  },
  {
    primaryFeatureId: 'vr_360_video',
    primaryCategory: 'AR_VR',
    relatedFeatures: [
      { featureId: '3d_scene_gen', category: '3D', relationship: 'requires' },
      { featureId: 'spatial_audio_3d', category: 'AUDIO', relationship: 'enhances' },
      { featureId: 'webxr', category: 'AR_VR', relationship: 'enables' },
    ],
    useCases: ['Virtual tours', 'Training simulations', 'Event experiences', 'Real estate'],
    scenarios: ['Property tours', 'Museum experiences', 'Travel previews', 'Conference replays'],
    recommendedProviders: ['modelslab', 'alibaba', 'replicate'],
    recommendedLLMs: ['Gemini 2.5 Pro', 'GPT-4o'],
    genieProducts: ['vibe', 'hub'],
  },
  {
    primaryFeatureId: 'hand_tracking',
    primaryCategory: 'AR_VR',
    relatedFeatures: [
      { featureId: 'mixed_reality', category: 'AR_VR', relationship: 'enhances' },
      { featureId: 'gesture_recognition', category: 'AR_VR', relationship: 'enables' },
      { featureId: 'interactive_3d', category: 'INTERACTIVE', relationship: 'enables' },
    ],
    useCases: ['Controller-free VR', 'Sign language recognition', 'Gesture UI', 'Physical therapy'],
    scenarios: ['Quest hand tracking', 'Medical training', 'Industrial simulation', 'Accessibility'],
    recommendedProviders: ['azure', 'alibaba', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['hub'],
  },
  // ============================================
  // ANIMATION CATEGORY - Comprehensive 12 Features
  // ============================================
  {
    primaryFeatureId: 'motion_graphics',
    primaryCategory: 'ANIMATION',
    relatedFeatures: [
      { featureId: 'text_prompt', category: 'INPUT', relationship: 'requires' },
      { featureId: 'kinetic_typography', category: 'ANIMATION', relationship: 'enhances' },
      { featureId: 'brand_consistency', category: 'IMAGE', relationship: 'enhances' },
    ],
    useCases: ['Title sequences', 'Explainer videos', 'Social content', 'Presentations'],
    scenarios: ['Video intros', 'Lower thirds', 'Animated infographics', 'Logo animations'],
    recommendedProviders: ['modelslab', 'alibaba', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'deck', 'spark'],
  },
  {
    primaryFeatureId: 'kinetic_typography',
    primaryCategory: 'ANIMATION',
    relatedFeatures: [
      { featureId: 'motion_graphics', category: 'ANIMATION', relationship: 'requires' },
      { featureId: 'text_prompt', category: 'INPUT', relationship: 'requires' },
      { featureId: 'tts', category: 'VOICE', relationship: 'enhances' },
    ],
    useCases: ['Lyric videos', 'Quote animations', 'Podcast visuals', 'Social clips'],
    scenarios: ['Music videos', 'Motivational content', 'Audiogram enhancement', 'Promo videos'],
    recommendedProviders: ['modelslab', 'alibaba'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'spark'],
  },
  {
    primaryFeatureId: 'character_animation',
    primaryCategory: 'ANIMATION',
    relatedFeatures: [
      { featureId: '3d_rigging', category: '3D', relationship: 'requires' },
      { featureId: 'skeletal_animation', category: 'ANIMATION', relationship: 'enhances' },
      { featureId: 'lip_sync_audio', category: 'VIDEO', relationship: 'enables' },
    ],
    useCases: ['Animated characters', 'Mascot animations', 'Game cutscenes', 'Educational content'],
    scenarios: ['Brand mascot videos', 'Character explainers', 'Children content', 'Training avatars'],
    recommendedProviders: ['alibaba', 'modelslab', 'meshy'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'hub'],
  },
  {
    primaryFeatureId: 'skeletal_animation',
    primaryCategory: 'ANIMATION',
    relatedFeatures: [
      { featureId: '3d_rigging', category: '3D', relationship: 'requires' },
      { featureId: 'character_animation', category: 'ANIMATION', relationship: 'enhances' },
      { featureId: 'full_body_avatar', category: 'VIDEO', relationship: 'enables' },
    ],
    useCases: ['Motion capture retargeting', 'Game animations', 'VTuber movement', 'Avatar gestures'],
    scenarios: ['Game character movement', 'Virtual presenter', 'Motion library', 'Dance animations'],
    recommendedProviders: ['alibaba', 'meshy', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'hub'],
  },
  {
    primaryFeatureId: 'lottie_animation',
    primaryCategory: 'ANIMATION',
    relatedFeatures: [
      { featureId: 'motion_graphics', category: 'ANIMATION', relationship: 'requires' },
      { featureId: 'svg_animation', category: 'ANIMATION', relationship: 'alternative' },
      { featureId: 'web_embed', category: 'PUBLISHING', relationship: 'enables' },
    ],
    useCases: ['Web animations', 'App loading states', 'Icon animations', 'Micro-interactions'],
    scenarios: ['Website elements', 'Mobile app UX', 'Email animations', 'Button effects'],
    recommendedProviders: ['modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['hub', 'arc'],
  },
  // ============================================
  // ADVANCED VIDEO/AVATAR CATEGORY - 23 Features
  // ============================================
  {
    primaryFeatureId: 'full_body_avatar',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'avatar_generation', category: 'VIDEO', relationship: 'requires' },
      { featureId: 'skeletal_animation', category: 'ANIMATION', relationship: 'enhances' },
      { featureId: 'lip_sync_audio', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'avatar_gestures', category: 'VIDEO', relationship: 'enhances' },
    ],
    useCases: ['Virtual presenters', 'Training instructors', 'Metaverse avatars', 'Digital influencers'],
    scenarios: ['Corporate training', 'E-learning', 'Virtual events', 'Product demos'],
    recommendedProviders: ['alibaba', 'modelslab', 'azure'],
    recommendedLLMs: ['GPT-4o', 'Qwen 2.5'],
    genieProducts: ['vibe', 'hub', 'arc'],
  },
  {
    primaryFeatureId: 'lip_sync_audio',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
      { featureId: 'avatar_generation', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'full_body_avatar', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'viseme_generation', category: 'AUDIO', relationship: 'requires' },
    ],
    useCases: ['Avatar videos', 'Dubbing', 'Localization', 'Character animation'],
    scenarios: ['Multi-language avatars', 'Video localization', 'Talking heads', 'Animated characters'],
    recommendedProviders: ['azure', 'alibaba', 'modelslab'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'arc'],
  },
  {
    primaryFeatureId: 'talking_photo',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'image_upload', category: 'INPUT', relationship: 'requires' },
      { featureId: 'lip_sync_audio', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'tts', category: 'VOICE', relationship: 'requires' },
    ],
    useCases: ['Historical figures', 'Memorial videos', 'Photo animation', 'Marketing'],
    scenarios: ['Museum exhibits', 'Family memories', 'Social content', 'Education'],
    recommendedProviders: ['alibaba', 'replicate', 'modelslab'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'spark'],
  },
  {
    primaryFeatureId: 'avatar_gestures',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'full_body_avatar', category: 'VIDEO', relationship: 'requires' },
      { featureId: 'emotion_control', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'skeletal_animation', category: 'ANIMATION', relationship: 'requires' },
    ],
    useCases: ['Natural presentation', 'Emphasis gestures', 'Cultural gestures', 'Accessibility'],
    scenarios: ['Training videos', 'Explainer content', 'Sign language', 'Sales presentations'],
    recommendedProviders: ['alibaba', 'azure', 'modelslab'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'hub'],
  },
  {
    primaryFeatureId: 'emotion_control',
    primaryCategory: 'VIDEO',
    relatedFeatures: [
      { featureId: 'avatar_generation', category: 'VIDEO', relationship: 'requires' },
      { featureId: 'voice_emotion', category: 'VOICE', relationship: 'enhances' },
      { featureId: 'avatar_gestures', category: 'VIDEO', relationship: 'enhances' },
    ],
    useCases: ['Storytelling', 'Dramatic content', 'Customer service', 'Children content'],
    scenarios: ['Emotional narratives', 'Empathetic responses', 'Character acting', 'Training scenarios'],
    recommendedProviders: ['alibaba', 'azure', 'modelslab'],
    recommendedLLMs: ['GPT-4o', 'Claude 3.5 Sonnet'],
    genieProducts: ['vibe', 'hub'],
  },
  // EXPORT CATEGORY
  {
    primaryFeatureId: 'pptx_export',
    primaryCategory: 'EXPORT',
    relatedFeatures: [
      { featureId: 'script_to_slides', category: 'SCRIPT', relationship: 'requires' },
      { featureId: 'pdf_export', category: 'EXPORT', relationship: 'alternative' },
    ],
    useCases: ['Presentation sharing', 'Offline viewing', 'Client delivery'],
    scenarios: ['Sales decks', 'Training materials', 'Reports'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'arc'],
  },
  {
    primaryFeatureId: 'mp4_export',
    primaryCategory: 'EXPORT',
    relatedFeatures: [
      { featureId: 'script_to_video', category: 'VIDEO', relationship: 'requires' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enhances' },
    ],
    useCases: ['Video distribution', 'Social sharing', 'Archival'],
    scenarios: ['YouTube upload', 'Social media', 'Training'],
    recommendedProviders: ['modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'arc'],
  },
  // ============================================
  // PUBLISHING CATEGORY - All Publishing Features
  // ============================================
  {
    primaryFeatureId: 'web_publish',
    primaryCategory: 'PUBLISHING',
    relatedFeatures: [
      { featureId: 'pptx_export', category: 'EXPORT', relationship: 'alternative' },
      { featureId: 'embed_website', category: 'PUBLISHING', relationship: 'enables' },
      { featureId: 'password_protection', category: 'PUBLISHING', relationship: 'enhances' },
    ],
    useCases: ['Shareable links', 'Client previews', 'Public presentations', 'Internal sharing'],
    scenarios: ['Sales deck sharing', 'Training distribution', 'Marketing campaigns', 'Portfolio showcase'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc'],
  },
  {
    primaryFeatureId: 'youtube_upload',
    primaryCategory: 'PUBLISHING',
    relatedFeatures: [
      { featureId: 'mp4_export', category: 'EXPORT', relationship: 'requires' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enhances' },
      { featureId: 'social_schedule', category: 'PUBLISHING', relationship: 'enhances' },
    ],
    useCases: ['Video publishing', 'Channel management', 'Content marketing', 'SEO optimization'],
    scenarios: ['Product demos', 'Tutorial publishing', 'Marketing videos', 'Educational content'],
    recommendedProviders: ['modelslab', 'replicate', 'elevenlabs'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['vibe', 'arc'],
  },
  {
    primaryFeatureId: 'social_schedule',
    primaryCategory: 'PUBLISHING',
    relatedFeatures: [
      { featureId: 'youtube_upload', category: 'PUBLISHING', relationship: 'enhances' },
      { featureId: 'web_publish', category: 'PUBLISHING', relationship: 'enhances' },
      { featureId: 'mp4_export', category: 'EXPORT', relationship: 'requires' },
    ],
    useCases: ['Content calendar', 'Multi-platform posting', 'Campaign management', 'Optimal timing'],
    scenarios: ['Marketing campaigns', 'Product launches', 'Event promotions', 'Regular content'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'spark', 'arc'],
  },
  {
    primaryFeatureId: 'embed_website',
    primaryCategory: 'PUBLISHING',
    relatedFeatures: [
      { featureId: 'web_publish', category: 'PUBLISHING', relationship: 'requires' },
      { featureId: 'custom_domain', category: 'PUBLISHING', relationship: 'enhances' },
    ],
    useCases: ['Website integration', 'Blog embeds', 'Knowledge base', 'Product pages'],
    scenarios: ['Landing pages', 'Documentation', 'Training portals', 'Sales pages'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'vibe', 'hub'],
  },
  {
    primaryFeatureId: 'api_access',
    primaryCategory: 'PUBLISHING',
    relatedFeatures: [
      { featureId: 'web_publish', category: 'PUBLISHING', relationship: 'enables' },
      { featureId: 'gdrive_integration', category: 'PUBLISHING', relationship: 'alternative' },
    ],
    useCases: ['Automation', 'Integrations', 'Batch processing', 'Custom workflows'],
    scenarios: ['Enterprise integration', 'CMS sync', 'LMS integration', 'CRM publishing'],
    recommendedProviders: ['openai', 'gemini', 'claude'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['hub', 'arc', 'deck'],
  },
  {
    primaryFeatureId: 'custom_domain',
    primaryCategory: 'PUBLISHING',
    relatedFeatures: [
      { featureId: 'embed_website', category: 'PUBLISHING', relationship: 'enhances' },
      { featureId: 'password_protection', category: 'PUBLISHING', relationship: 'enhances' },
      { featureId: 'web_publish', category: 'PUBLISHING', relationship: 'requires' },
    ],
    useCases: ['White-label hosting', 'Brand consistency', 'Enterprise publishing', 'Client portals'],
    scenarios: ['Agency deliverables', 'Enterprise training', 'Partner portals', 'Branded content hubs'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'vibe', 'arc', 'hub'],
  },
  {
    primaryFeatureId: 'password_protection',
    primaryCategory: 'PUBLISHING',
    relatedFeatures: [
      { featureId: 'web_publish', category: 'PUBLISHING', relationship: 'enhances' },
      { featureId: 'viewer_analytics', category: 'INTERACTIVE', relationship: 'enhances' },
    ],
    useCases: ['Confidential sharing', 'Gated content', 'Premium access', 'Secure distribution'],
    scenarios: ['Board decks', 'Financial reports', 'Pre-release content', 'NDA materials'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['deck', 'vibe', 'arc'],
  },
];

// ============================================
// LLM COMPARISON DATA (For LLM Tab)
// ============================================

export interface LLMComparison {
  model: string;
  provider: string;
  providerId: ProviderId;
  costTier: '$' | '$$' | '$$$';
  accuracy: number; // 0-100
  speed: 'fast' | 'medium' | 'slow';
  contextWindow: string;
  bestForIndustries: string[];
  bestForOutputTypes: string[];
  inputStrengths: string[];
  notes: string;
}

export const LLM_COMPARISONS: LLMComparison[] = [
  {
    model: 'GPT-4o',
    provider: 'OpenAI',
    providerId: 'openai',
    costTier: '$$$',
    accuracy: 98,
    speed: 'medium',
    contextWindow: '128K',
    bestForIndustries: ['Healthcare', 'Finance', 'Legal', 'Enterprise'],
    bestForOutputTypes: ['Long-form', 'Code', 'JSON', 'Technical docs'],
    inputStrengths: ['Vision', 'PDF', 'Audio', 'Complex docs', 'Multi-modal'],
    notes: 'Best overall accuracy. Use for critical tasks requiring high precision.',
  },
  {
    model: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerId: 'gemini',
    costTier: '$$',
    accuracy: 95,
    speed: 'fast',
    contextWindow: '1M+',
    bestForIndustries: ['Education', 'Research', 'Media', 'Marketing'],
    bestForOutputTypes: ['Multimodal', 'Image+Text', 'Video analysis', 'Long context'],
    inputStrengths: ['1M context', 'Video', 'Images', 'Long documents'],
    notes: 'Best for large documents and video understanding. Fast and cost-effective.',
  },
  {
    model: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerId: 'claude',
    costTier: '$$$',
    accuracy: 97,
    speed: 'medium',
    contextWindow: '200K',
    bestForIndustries: ['Enterprise', 'Compliance', 'Legal', 'Academic'],
    bestForOutputTypes: ['Nuanced writing', 'Safety-critical', 'Analysis'],
    inputStrengths: ['200K context', 'Complex reasoning', 'Structured output'],
    notes: 'Best for nuanced writing and compliance-sensitive content.',
  },
  {
    model: 'DeepSeek V3',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    costTier: '$',
    accuracy: 90,
    speed: 'fast',
    contextWindow: '64K',
    bestForIndustries: ['Tech', 'Startups', 'Development', 'Data'],
    bestForOutputTypes: ['Code', 'Math', 'Technical', 'JSON'],
    inputStrengths: ['Vision', 'Code repos', 'Technical diagrams'],
    notes: 'Ultra low cost. Excellent for code and technical content.',
  },
  {
    model: 'Qwen 2.5',
    provider: 'Alibaba',
    providerId: 'alibaba',
    costTier: '$',
    accuracy: 88,
    speed: 'fast',
    contextWindow: '128K',
    bestForIndustries: ['APAC', 'E-commerce', 'Manufacturing', 'Logistics'],
    bestForOutputTypes: ['Multilingual', 'CJK Native', 'Translation'],
    inputStrengths: ['Chinese', 'Japanese', 'Korean docs', 'APAC languages'],
    notes: 'Best for CJK languages and APAC content. Very cost-effective.',
  },
];

// ============================================
// ROUTING STRATEGY
// ============================================

export const ROUTING_STRATEGY = {
  primary: 'Quality-First',
  fallback: 'Cost-Optimized',
  explanation: `
    Primary requests use the highest-accuracy model for the task type (GPT-4o for healthcare/finance, 
    Gemini for large docs, Claude for nuanced writing). Fallback chain uses progressively 
    lower-cost models (DeepSeek, Qwen) that still meet quality thresholds.
  `,
  whyNotCheapestFirst: `
    User experience is prioritized over cost. Critical sectors (Healthcare, Finance, Legal) 
    require high accuracy where errors have significant consequences. Cost optimization 
    happens in the fallback chain, not primary selection. Budget models serve as reliable 
    fallbacks when premium providers are unavailable or rate-limited.
  `,
};
