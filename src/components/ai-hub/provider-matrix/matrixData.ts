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
  
  // VIDEO FEATURES
  { id: 'text_to_video', name: 'Text-to-Video (AI Gen)', category: 'VIDEO', priority: 'high' },
  { id: 'image_to_video', name: 'Image-to-Video', category: 'VIDEO', priority: 'high' },
  { id: 'script_to_video', name: 'Script-to-Video', category: 'VIDEO', priority: 'high' },
  { id: 'url_to_video', name: 'URL/Blog to Video', category: 'VIDEO', priority: 'medium' },
  { id: 'ppt_to_video', name: 'PPT to Video', category: 'VIDEO', priority: 'high' },
  { id: 'video_trimming', name: 'Video Trimming/Cutting', category: 'VIDEO', priority: 'medium' },
  { id: 'video_merging', name: 'Video Merging', category: 'VIDEO', priority: 'medium' },
  { id: 'speed_control', name: 'Speed Control', category: 'VIDEO', priority: 'low' },
  { id: 'video_transitions', name: 'Video Transitions', category: 'VIDEO', priority: 'medium' },
  { id: 'ai_avatars', name: 'AI Avatars', category: 'VIDEO', priority: 'high' },
  { id: 'custom_avatar', name: 'Custom Avatar Creation', category: 'VIDEO', priority: 'medium' },
  { id: 'lip_sync', name: 'Lip-Sync Video', category: 'VIDEO', priority: 'high' },
  { id: 'video_enhancement', name: 'AI Video Enhancement', category: 'VIDEO', priority: 'medium' },
  { id: 'stock_video', name: 'Stock Video Library', category: 'VIDEO', priority: 'medium' },
  { id: 'auto_subtitles', name: 'Auto Subtitles/Captions', category: 'VIDEO', priority: 'high' },
  
  // ANIMATION FEATURES
  { id: 'text_animation', name: 'Text Animation', category: 'ANIMATION', priority: 'high' },
  { id: 'object_animation', name: 'Object Animation', category: 'ANIMATION', priority: 'medium' },
  { id: 'slide_transitions', name: 'Slide Transitions', category: 'ANIMATION', priority: 'high' },
  { id: 'motion_graphics', name: 'Motion Graphics', category: 'ANIMATION', priority: 'medium' },
  { id: 'animated_stickers', name: 'Animated Stickers/GIFs', category: 'ANIMATION', priority: 'low' },
  { id: 'lottie', name: 'Lottie Animations', category: 'ANIMATION', priority: 'medium' },
  { id: 'custom_paths', name: 'Custom Animation Paths', category: 'ANIMATION', priority: 'low' },
  { id: 'auto_animate', name: 'Auto-Animate (AI)', category: 'ANIMATION', priority: 'medium' },
  
  // 3D FEATURES
  { id: '3d_text', name: '3D Text', category: '3D', priority: 'medium' },
  { id: '3d_objects', name: '3D Objects/Models', category: '3D', priority: 'medium' },
  { id: '3d_scene_gen', name: '3D Scene Generation', category: '3D', priority: 'low' },
  { id: '3d_avatar', name: '3D Avatar/Character', category: '3D', priority: 'medium' },
  { id: '360_view', name: '360° View Support', category: '3D', priority: 'low' },
  { id: '3d_import', name: '3D Model Import', category: '3D', priority: 'low' },
  { id: 'mesh_generation', name: 'AI Mesh Generation', category: '3D', priority: 'medium' },
  
  // AR/VR FEATURES
  { id: 'ar_preview', name: 'AR Preview/Export', category: 'AR_VR', priority: 'low' },
  { id: 'vr_export', name: 'VR-Ready Export', category: 'AR_VR', priority: 'low' },
  { id: 'spatial', name: 'Spatial Presentations', category: 'AR_VR', priority: 'low' },
  { id: 'immersive', name: 'Immersive Mode', category: 'AR_VR', priority: 'low' },
  
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
  
  // EXPORT FEATURES
  { id: 'pptx_export', name: 'PPTX Export', category: 'EXPORT', priority: 'critical' },
  { id: 'pdf_export', name: 'PDF Export', category: 'EXPORT', priority: 'high' },
  { id: 'mp4_export', name: 'MP4 Video Export', category: 'EXPORT', priority: 'critical' },
  { id: '4k_export', name: '4K Resolution Export', category: 'EXPORT', priority: 'medium' },
  { id: 'watermark_free', name: 'Watermark-Free Export', category: 'EXPORT', priority: 'high' },
  { id: 'scorm_export', name: 'LMS Integration (SCORM)', category: 'EXPORT', priority: 'medium' },
  
  // PUBLISHING FEATURES
  { id: 'web_publish', name: 'Web Publishing/Link Sharing', category: 'PUBLISHING', priority: 'high' },
  { id: 'embed_website', name: 'Embed on Website', category: 'PUBLISHING', priority: 'medium' },
  { id: 'youtube_upload', name: 'YouTube Direct Upload', category: 'PUBLISHING', priority: 'medium' },
  { id: 'social_schedule', name: 'Social Media Scheduling', category: 'PUBLISHING', priority: 'medium' },
  { id: 'gdrive_integration', name: 'Google Drive Integration', category: 'PUBLISHING', priority: 'medium' },
  { id: 'api_access', name: 'API for Publishing', category: 'PUBLISHING', priority: 'high' },
  { id: 'custom_domain', name: 'Custom Domain Hosting', category: 'PUBLISHING', priority: 'medium' },
  { id: 'password_protection', name: 'Password Protection', category: 'PUBLISHING', priority: 'medium' },
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
    strengths: ['CJK native', 'Qwen 2.5', 'WAN 2.2 video', 'CosyVoice', 'Paraformer'],
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
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'alibaba-tts', notes: 'CosyVoice' },
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
  
  // 3D FEATURES
  '3d_text': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  '3d_objects': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  '3d_scene_gen': {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 40 },
  },
  '3d_avatar': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  '360_view': {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  '3d_import': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 50 },
  },
  mesh_generation: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 75, edgeFunctionUsed: 'modelslab-media' },
  },
  
  // AR/VR FEATURES
  ar_preview: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  vr_export: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  spatial: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  immersive: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0 },
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
  
  // PUBLISHING FEATURES
  web_publish: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 88 },
  },
  embed_website: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85 },
  },
  youtube_upload: {
    openai: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  social_schedule: {
    openai: { status: 'configured', implementation: 'not_started', confidence: 0 },
  },
  gdrive_integration: {
    gemini: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
  api_access: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 95 },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 92 },
  },
  custom_domain: {
    openai: { status: 'configured', implementation: 'partial', confidence: 50 },
  },
  password_protection: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 85 },
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
  IMAGE: computeCategorySummary('IMAGE'),
  VIDEO: computeCategorySummary('VIDEO'),
  ANIMATION: computeCategorySummary('ANIMATION'),
  '3D': computeCategorySummary('3D'),
  AR_VR: computeCategorySummary('AR_VR'),
  VFX: computeCategorySummary('VFX'),
  INTERACTIVE: computeCategorySummary('INTERACTIVE'),
  TRANSLATION: computeCategorySummary('TRANSLATION'),
  EXPORT: computeCategorySummary('EXPORT'),
  PUBLISHING: computeCategorySummary('PUBLISHING'),
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
    ],
    useCases: ['Web scraping', 'Article summarization', 'Competitor research', 'Blog-to-video'],
    scenarios: ['News analysis', 'Research aggregation', 'Content repurposing', 'SEO analysis'],
    recommendedProviders: ['openai', 'gemini'],
    recommendedLLMs: ['GPT-4o', 'Gemini 2.5 Pro'],
    genieProducts: ['deck', 'mind', 'spark', 'ask_genie'],
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
      { featureId: 'image_to_video', category: 'VIDEO', relationship: 'enhances' },
    ],
    useCases: ['Video transcription', 'Scene analysis', 'Video-to-video processing', 'Content moderation'],
    scenarios: ['Training content review', 'Social media repurposing', 'Highlight extraction', 'Video summarization'],
    recommendedProviders: ['openai', 'gemini', 'alibaba', 'modelslab', 'replicate'],
    recommendedLLMs: ['Gemini 2.5 Pro', 'GPT-4o Vision', 'Qwen2.5-VL'],
    genieProducts: ['vibe', 'arc', 'mind'],
  },
  {
    primaryFeatureId: 'audio_upload',
    primaryCategory: 'INPUT',
    relatedFeatures: [
      { featureId: 'stt', category: 'AUDIO', relationship: 'enables' },
      { featureId: 'auto_subtitles', category: 'VIDEO', relationship: 'enables' },
      { featureId: 'voice_recording', category: 'INPUT', relationship: 'alternative' },
      { featureId: 'content_summary', category: 'SCRIPT', relationship: 'enables' },
    ],
    useCases: ['Transcription', 'Voice analysis', 'Meeting notes', 'Speaker diarization'],
    scenarios: ['Podcast transcription', 'Interview capture', 'Voiceover QC', 'Multi-speaker meetings'],
    recommendedProviders: ['openai', 'elevenlabs', 'alibaba', 'gemini'],
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
    ],
    useCases: ['Tutorial creation', 'Bug reporting', 'Demo capture', 'Workflow documentation'],
    scenarios: ['Software training', 'Support tickets', 'Process documentation', 'Product demos'],
    recommendedProviders: ['openai', 'gemini', 'alibaba'],
    recommendedLLMs: ['Gemini 2.5 Pro', 'GPT-4o Vision', 'Qwen-VL'],
    genieProducts: ['vibe', 'arc', 'hub'],
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
  // 3D CATEGORY
  {
    primaryFeatureId: '3d_scene_gen',
    primaryCategory: '3D',
    relatedFeatures: [
      { featureId: 'mesh_generation', category: '3D', relationship: 'enhances' },
      { featureId: 'controlnet', category: 'IMAGE', relationship: 'requires' },
      { featureId: 'ar_preview', category: 'AR_VR', relationship: 'enables' },
    ],
    useCases: ['Architectural viz', 'Product 3D', 'Virtual environments'],
    scenarios: ['Real estate', 'E-commerce', 'Gaming'],
    recommendedProviders: ['modelslab', 'replicate'],
    recommendedLLMs: ['GPT-4o'],
    genieProducts: ['vibe', 'arc'],
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
