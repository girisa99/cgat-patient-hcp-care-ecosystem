/**
 * Provider Capability Matrix Data
 * 
 * Comprehensive data mapping all features × all providers
 * Based on Excel analysis + codebase audit
 */

import type { 
  Feature, 
  FeatureCategory, 
  ProviderSummary, 
  FeatureCapabilityEntry,
  ProviderId,
  ProviderCapability 
} from './types';

// ============================================
// ALL FEATURES (from Excel + additional)
// ============================================

export const ALL_FEATURES: Feature[] = [
  // INPUT FEATURES
  { id: 'text_prompt', name: 'Text Prompt', category: 'INPUT', priority: 'critical' },
  { id: 'document_upload', name: 'Document Upload (DOCX/PDF)', category: 'INPUT', priority: 'critical' },
  { id: 'url_input', name: 'URL/Web Page Input', category: 'INPUT', priority: 'high' },
  { id: 'image_upload', name: 'Image Upload', category: 'INPUT', priority: 'high' },
  { id: 'video_upload', name: 'Video Upload', category: 'INPUT', priority: 'medium' },
  { id: 'audio_upload', name: 'Audio Upload', category: 'INPUT', priority: 'medium' },
  { id: 'pptx_import', name: 'PowerPoint Import', category: 'INPUT', priority: 'high' },
  { id: 'voice_recording', name: 'Voice Recording', category: 'INPUT', priority: 'medium' },
  { id: 'screen_recording', name: 'Screen Recording', category: 'INPUT', priority: 'medium' },
  { id: 'csv_data', name: 'CSV/Data Files', category: 'INPUT', priority: 'medium' },
  
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
  { id: 'script_to_video', name: 'Script-to-Video Auto', category: 'SCRIPT', priority: 'high' },
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
// PROVIDER SUMMARIES
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
    id: 'azure',
    name: 'Microsoft Azure',
    website: 'https://azure.microsoft.com',
    status: 'needs_key',
    secretKey: 'AZURE_SPEECH_KEY',
    totalFeatures: 35,
    implementedFeatures: 10,
    partialFeatures: 5,
    missingFeatures: 20,
    capabilities: ['VOICE', 'AUDIO', 'IMAGE'],
    strengths: ['Neural TTS', 'Form Recognizer', 'Enterprise', 'Visemes'],
    weaknesses: ['Complex setup', 'Enterprise pricing'],
    costTier: 'enterprise',
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
    id: 'suno',
    name: 'Suno AI',
    website: 'https://suno.ai',
    status: 'needs_key',
    secretKey: 'SUNO_API_KEY',
    totalFeatures: 5,
    implementedFeatures: 0,
    partialFeatures: 0,
    missingFeatures: 5,
    capabilities: ['AUDIO'],
    strengths: ['Best AI music', 'Vocals', 'Full songs'],
    weaknesses: ['Music only', 'API access limited'],
    costTier: 'standard',
  },
  {
    id: 'runway',
    name: 'Runway',
    website: 'https://runwayml.com',
    status: 'needs_key',
    secretKey: 'RUNWAY_API_KEY',
    totalFeatures: 15,
    implementedFeatures: 0,
    partialFeatures: 0,
    missingFeatures: 15,
    capabilities: ['VIDEO', 'VFX'],
    strengths: ['Gen-3 Alpha', 'Best video quality', '10s clips'],
    weaknesses: ['Expensive', 'API access limited'],
    costTier: 'premium',
  },
];

// ============================================
// FEATURE IMPLEMENTATION STATUS
// ============================================

// Use Partial for sparse matrix - not all providers support all features
export const FEATURE_IMPLEMENTATION_MATRIX: Record<string, Partial<Record<ProviderId, Partial<ProviderCapability>>>> = {
  // SCRIPT FEATURES
  ai_script_gen: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ai-universal-processor' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'ai-universal-processor' },
    claude: { status: 'configured', implementation: 'implemented', confidence: 97, edgeFunctionUsed: 'ai-universal-processor' },
    deepseek: { status: 'configured', implementation: 'implemented', confidence: 90, edgeFunctionUsed: 'ai-universal-processor' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 85, notes: 'Qwen integration started' },
  },
  
  // VOICE FEATURES
  tts: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ai-tts-unified' },
    openai: { status: 'configured', implementation: 'implemented', confidence: 90, edgeFunctionUsed: 'ai-tts-unified' },
    google: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'ai-tts-unified' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'alibaba-tts' },
    azure: { status: 'needs_key', implementation: 'partial', confidence: 95, notes: 'Neural TTS ready, needs key' },
  },
  voice_cloning: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 98 },
    azure: { status: 'needs_key', implementation: 'not_started', confidence: 92 },
  },
  
  // IMAGE FEATURES
  ai_image_gen: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 95, edgeFunctionUsed: 'modelslab-media' },
    openai: { status: 'configured', implementation: 'implemented', confidence: 92, edgeFunctionUsed: 'generate-image' },
    gemini: { status: 'configured', implementation: 'implemented', confidence: 88, edgeFunctionUsed: 'gemini-image-generation' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 80, notes: 'Wanx basic only' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 85 },
  },
  controlnet: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 75, notes: 'Pose only, depth missing' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  inpainting: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'API available, not integrated' },
    replicate: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  image_upscaling: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'API available' },
  },
  
  // VIDEO FEATURES
  text_to_video: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'ai-video-generator' },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 80, edgeFunctionUsed: 'ai-video-generator', notes: 'WAN 2.2' },
    replicate: { status: 'configured', implementation: 'implemented', confidence: 75 },
    runway: { status: 'needs_key', implementation: 'not_started', confidence: 95, notes: 'Best quality' },
  },
  image_to_video: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 85, notes: 'AnimateDiff' },
    alibaba: { status: 'configured', implementation: 'partial', confidence: 75 },
  },
  ai_avatars: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60, notes: 'Basic avatar, not full talking head' },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 70, notes: 'EMO API available' },
  },
  lip_sync: {
    modelslab: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'Wav2Lip API available' },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 0, notes: 'V-Express available' },
  },
  
  // AUDIO FEATURES
  stt: {
    openai: { status: 'configured', implementation: 'implemented', confidence: 98, edgeFunctionUsed: 'ask-genie-voice', notes: 'Whisper' },
    google: { status: 'configured', implementation: 'implemented', confidence: 90 },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'alibaba-stt', notes: 'Paraformer' },
    assemblyai: { status: 'needs_key', implementation: 'not_started', confidence: 97, notes: 'Best for medical' },
  },
  ai_music_gen: {
    suno: { status: 'needs_key', implementation: 'not_started', confidence: 98, notes: 'Best quality' },
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 70 },
  },
  ai_sfx_gen: {
    elevenlabs: { status: 'configured', implementation: 'implemented', confidence: 85, edgeFunctionUsed: 'elevenlabs-sfx' },
  },
  
  // TRANSLATION FEATURES
  one_click_translate: {
    deepl: { status: 'configured', implementation: 'implemented', confidence: 99, edgeFunctionUsed: 'translate' },
    google: { status: 'configured', implementation: 'implemented', confidence: 90 },
    alibaba: { status: 'configured', implementation: 'implemented', confidence: 92, notes: 'Best for CJK' },
    microsoft: { status: 'configured', implementation: 'implemented', confidence: 88 },
  },
  voice_dubbing: {
    elevenlabs: { status: 'configured', implementation: 'partial', confidence: 75, notes: 'Manual workflow' },
    alibaba: { status: 'configured', implementation: 'not_started', confidence: 70 },
  },
  
  // 3D FEATURES
  mesh_generation: {
    modelslab: { status: 'configured', implementation: 'implemented', confidence: 75, edgeFunctionUsed: 'modelslab-media' },
  },
  '3d_avatar': {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 60 },
  },
  
  // VFX FEATURES
  ai_bg_replace: {
    modelslab: { status: 'configured', implementation: 'partial', confidence: 70 },
    replicate: { status: 'configured', implementation: 'partial', confidence: 65 },
  },
};

// ============================================
// CATEGORY SUMMARIES
// ============================================

export const CATEGORY_IMPLEMENTATION_SUMMARY: Record<FeatureCategory, { 
  total: number; 
  implemented: number; 
  partial: number; 
  planned: number;
  notStarted: number;
}> = {
  INPUT: { total: 10, implemented: 7, partial: 2, planned: 1, notStarted: 0 },
  SCRIPT: { total: 15, implemented: 12, partial: 2, planned: 1, notStarted: 0 },
  VOICE: { total: 6, implemented: 4, partial: 2, planned: 0, notStarted: 0 },
  AUDIO: { total: 9, implemented: 4, partial: 2, planned: 1, notStarted: 2 },
  IMAGE: { total: 14, implemented: 8, partial: 3, planned: 2, notStarted: 1 },
  VIDEO: { total: 15, implemented: 6, partial: 4, planned: 3, notStarted: 2 },
  ANIMATION: { total: 8, implemented: 3, partial: 2, planned: 2, notStarted: 1 },
  '3D': { total: 7, implemented: 2, partial: 2, planned: 1, notStarted: 2 },
  AR_VR: { total: 4, implemented: 0, partial: 0, planned: 2, notStarted: 2 },
  VFX: { total: 7, implemented: 2, partial: 3, planned: 1, notStarted: 1 },
  INTERACTIVE: { total: 10, implemented: 3, partial: 2, planned: 3, notStarted: 2 },
  TRANSLATION: { total: 10, implemented: 6, partial: 2, planned: 1, notStarted: 1 },
  EXPORT: { total: 6, implemented: 4, partial: 1, planned: 1, notStarted: 0 },
  PUBLISHING: { total: 8, implemented: 4, partial: 2, planned: 1, notStarted: 1 },
  USE_CASE: { total: 0, implemented: 0, partial: 0, planned: 0, notStarted: 0 },
};

// ============================================
// GAP ANALYSIS
// ============================================

export const CRITICAL_GAPS = [
  { feature: 'Lip-Sync Translation', provider: 'Alibaba (V-Express) / ModelsLab (Wav2Lip)', priority: 'high', effort: 'medium' },
  { feature: 'AI Music Generation', provider: 'Suno AI', priority: 'medium', effort: 'low' },
  { feature: 'DeepSeek R1 Reasoning', provider: 'DeepSeek', priority: 'high', effort: 'low' },
  { feature: 'Runway Gen-3 Video', provider: 'Runway', priority: 'medium', effort: 'low' },
  { feature: 'ControlNet Depth/Canny', provider: 'ModelsLab', priority: 'medium', effort: 'medium' },
  { feature: 'Image Inpainting', provider: 'ModelsLab', priority: 'medium', effort: 'low' },
  { feature: 'Azure Neural TTS', provider: 'Azure', priority: 'high', effort: 'low' },
  { feature: 'Qwen2.5-VL Video Understanding', provider: 'Alibaba', priority: 'medium', effort: 'medium' },
  { feature: 'EMO Facial Animation', provider: 'Alibaba', priority: 'low', effort: 'high' },
  { feature: 'DeepSeek Janus Vision', provider: 'DeepSeek', priority: 'low', effort: 'medium' },
];
