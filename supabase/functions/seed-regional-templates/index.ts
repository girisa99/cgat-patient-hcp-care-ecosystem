/**
 * Seed Regional Templates
 * 
 * 100+ templates with native language content, cultural standards, and transcreation
 * Organized by 14 regions with local design aesthetics and messaging
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// REGIONAL TEMPLATE CONFIGURATIONS
// ============================================

interface RegionalTemplate {
  name: string;
  native_name: string; // Name in local language
  description: string;
  native_description: string; // Description in local language
  category: string;
  region_code: string;
  language_code: string;
  primary_model: string;
  secondary_models: string[];
  ai_capabilities: any[];
  industry_tags: string[];
  target_platform: string[];
  estimated_duration_seconds: number;
  cultural_notes: string;
  design_style: string;
  tts_provider: string;
  style_preset: any;
}

// ============================================
// ARABIC / MENA REGION TEMPLATES
// ============================================
const ARABIC_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Corporate Introduction - Arabic',
    native_name: 'مقدمة الشركة',
    description: 'Professional corporate introduction with Arabic narration and RTL design',
    native_description: 'مقدمة مهنية للشركة مع سرد عربي وتصميم من اليمين إلى اليسار',
    category: 'corporate',
    region_code: 'mena',
    language_code: 'ar',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'RTL Animation' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Arabic MSA' }
    ],
    industry_tags: ['enterprise', 'finance', 'mena'],
    target_platform: ['linkedin', 'website'],
    estimated_duration_seconds: 90,
    cultural_notes: 'RTL layout, Islamic geometric patterns, modest imagery, gold accents',
    design_style: 'arabesque',
    tts_provider: 'azure_neural',
    style_preset: { rtl: true, text_direction: 'rtl', accent_color: 'gold', pattern: 'islamic_geometric' }
  },
  {
    name: 'Product Launch - Gulf Arabic',
    native_name: 'إطلاق المنتج - الخليجي',
    description: 'Premium product launch video with Gulf Arabic dialect',
    native_description: 'فيديو إطلاق منتج فاخر باللهجة الخليجية',
    category: 'marketing',
    region_code: 'mena',
    language_code: 'ar-AE',
    primary_model: 'sora2',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Sora 2', feature: 'Luxury Aesthetic' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Gulf Arabic' }
    ],
    industry_tags: ['luxury', 'retail', 'uae', 'gulf'],
    target_platform: ['instagram', 'youtube'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Luxury focus, gold/desert tones, premium aesthetics for GCC market',
    design_style: 'luxury_gulf',
    tts_provider: 'azure_neural',
    style_preset: { rtl: true, dialect: 'gulf', luxury: true }
  },
  {
    name: 'Educational Content - Egyptian Arabic',
    native_name: 'محتوى تعليمي - مصري',
    description: 'Educational video with Egyptian Arabic for wider MENA reach',
    native_description: 'فيديو تعليمي باللهجة المصرية للوصول الأوسع في الشرق الأوسط',
    category: 'educational',
    region_code: 'mena',
    language_code: 'ar-EG',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Arabic Presenter' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Egyptian Arabic' }
    ],
    industry_tags: ['education', 'edtech', 'egypt', 'arabic'],
    target_platform: ['youtube', 'lms'],
    estimated_duration_seconds: 180,
    cultural_notes: 'Egyptian dialect understood across Arab world, friendly tone',
    design_style: 'educational_arabic',
    tts_provider: 'azure_neural',
    style_preset: { rtl: true, dialect: 'egyptian', style: 'educational' }
  },
  {
    name: 'Healthcare Patient Guide - Arabic',
    native_name: 'دليل المريض الصحي',
    description: 'Patient education with cultural sensitivity for MENA healthcare',
    native_description: 'تثقيف المريض مع مراعاة الحساسيات الثقافية للرعاية الصحية في الشرق الأوسط',
    category: 'healthcare',
    region_code: 'mena',
    language_code: 'ar',
    primary_model: 'meshy_3d',
    secondary_models: ['azure_neural', 'vertex_veo'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: 'Anatomical Models' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Formal Arabic' }
    ],
    industry_tags: ['healthcare', 'medical', 'patient_education'],
    target_platform: ['hospital_app', 'website'],
    estimated_duration_seconds: 120,
    cultural_notes: 'Modest imagery, gender-appropriate presenters, prayer time considerations',
    design_style: 'medical_arabic',
    tts_provider: 'azure_neural',
    style_preset: { rtl: true, modesty: 'high', medical: true }
  },
];

// ============================================
// CHINESE / CJK REGION TEMPLATES
// ============================================
const CHINESE_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Demo - Simplified Chinese',
    native_name: '产品演示 - 简体中文',
    description: 'Product demonstration optimized for Chinese market',
    native_description: '针对中国市场优化的产品演示',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'zh-CN',
    primary_model: 'alibaba_wan',
    secondary_models: ['cosyvoice', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Alibaba Wan 2.6', feature: 'Chinese Market Video' },
      { type: 'tts', provider: 'CosyVoice', feature: 'Mandarin' }
    ],
    industry_tags: ['ecommerce', 'technology', 'china'],
    target_platform: ['douyin', 'weibo', 'wechat'],
    estimated_duration_seconds: 45,
    cultural_notes: 'Lucky red colors, auspicious numbers, WeChat-optimized format',
    design_style: 'modern_chinese',
    tts_provider: 'cosyvoice',
    style_preset: { lucky_colors: true, platform: 'wechat', aspect: '9:16' }
  },
  {
    name: 'Corporate Training - Mandarin',
    native_name: '企业培训 - 普通话',
    description: 'Enterprise training content with Mandarin narration',
    native_description: '普通话企业培训内容',
    category: 'corporate',
    region_code: 'cjk',
    language_code: 'zh-CN',
    primary_model: 'alibaba_avatar',
    secondary_models: ['cosyvoice', 'alibaba_wan'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba OmniAvatar', feature: 'Chinese Presenter' },
      { type: 'tts', provider: 'CosyVoice', feature: 'Professional Mandarin' }
    ],
    industry_tags: ['enterprise', 'training', 'hr'],
    target_platform: ['lms', 'dingtalk'],
    estimated_duration_seconds: 300,
    cultural_notes: 'Formal business style, hierarchical respect, group harmony focus',
    design_style: 'corporate_chinese',
    tts_provider: 'cosyvoice',
    style_preset: { formal: true, business: true }
  },
  {
    name: 'E-commerce Livestream - Chinese',
    native_name: '电商直播 - 中文',
    description: 'Live commerce style product showcase for Douyin/Taobao',
    native_description: '抖音/淘宝风格的直播电商产品展示',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'zh-CN',
    primary_model: 'alibaba_avatar',
    secondary_models: ['cosyvoice', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Livestream Host' },
      { type: 'effects', provider: 'ModelsLab', feature: 'Engagement Overlays' }
    ],
    industry_tags: ['ecommerce', 'livestream', 'social_commerce'],
    target_platform: ['douyin', 'taobao_live', 'kuaishou'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Fast-paced, interactive, price reveals, countdown urgency',
    design_style: 'livestream_chinese',
    tts_provider: 'cosyvoice',
    style_preset: { livestream: true, urgency: true, interactive: true }
  },
];

// ============================================
// JAPANESE TEMPLATES
// ============================================
const JAPANESE_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Introduction - Japanese',
    native_name: '製品紹介 - 日本語',
    description: 'Minimalist product introduction with Japanese aesthetics',
    native_description: '日本の美学を活かしたミニマリスト製品紹介',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'ja',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Minimalist Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Japanese' }
    ],
    industry_tags: ['technology', 'lifestyle', 'japan'],
    target_platform: ['youtube', 'line', 'website'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Muji-style minimalism, white space, subtle animations, polite language',
    design_style: 'muji_minimal',
    tts_provider: 'azure_neural',
    style_preset: { minimalist: true, white_space: true, keigo: true }
  },
  {
    name: 'Anime Style Explainer - Japanese',
    native_name: 'アニメ風解説動画',
    description: 'Anime-style educational content for Japanese audience',
    native_description: '日本向けアニメ風教育コンテンツ',
    category: 'educational',
    region_code: 'cjk',
    language_code: 'ja',
    primary_model: 'alibaba_wan',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'video', provider: 'Alibaba Wan', feature: 'Anime Generation' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Japanese Narrator' }
    ],
    industry_tags: ['education', 'anime', 'youth'],
    target_platform: ['youtube', 'niconico'],
    estimated_duration_seconds: 180,
    cultural_notes: 'Anime aesthetic, character-driven, engaging for younger demographics',
    design_style: 'anime_educational',
    tts_provider: 'azure_neural',
    style_preset: { animation_style: 'anime', characters: true }
  },
];

// ============================================
// KOREAN TEMPLATES
// ============================================
const KOREAN_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'K-Beauty Product Launch - Korean',
    native_name: 'K-뷰티 제품 출시',
    description: 'K-beauty style product launch with Korean aesthetics',
    native_description: '한국적 감성의 K-뷰티 스타일 제품 출시',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'ko',
    primary_model: 'sora2',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Sora 2', feature: 'Beauty Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Korean' }
    ],
    industry_tags: ['beauty', 'skincare', 'korea', 'kbeauty'],
    target_platform: ['youtube', 'naver', 'kakao'],
    estimated_duration_seconds: 45,
    cultural_notes: 'Soft pastel colors, dewy aesthetic, before/after reveals',
    design_style: 'kbeauty',
    tts_provider: 'azure_neural',
    style_preset: { pastel: true, dewy: true, beauty: true }
  },
  {
    name: 'Tech Review - Korean',
    native_name: '테크 리뷰 - 한국어',
    description: 'Technology product review for Korean market',
    native_description: '한국 시장을 위한 기술 제품 리뷰',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'ko',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'meshy_3d'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Tech Demo' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Korean Tech Narrator' }
    ],
    industry_tags: ['technology', 'electronics', 'samsung', 'lg'],
    target_platform: ['youtube', 'naver_blog'],
    estimated_duration_seconds: 120,
    cultural_notes: 'Detail-oriented, spec comparisons, clean UI overlays',
    design_style: 'korean_tech',
    tts_provider: 'azure_neural',
    style_preset: { technical: true, detailed: true }
  },
];

// ============================================
// HINDI / INDIA TEMPLATES
// ============================================
const HINDI_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Demo - Hindi',
    native_name: 'उत्पाद डेमो - हिंदी',
    description: 'Product demonstration with Hindi narration for Indian market',
    native_description: 'भारतीय बाजार के लिए हिंदी में उत्पाद प्रदर्शन',
    category: 'marketing',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Indian Market Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi' }
    ],
    industry_tags: ['ecommerce', 'technology', 'india'],
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Vibrant colors, family-oriented, value proposition focus, Bollywood-inspired energy',
    design_style: 'indian_vibrant',
    tts_provider: 'azure_neural',
    style_preset: { vibrant: true, family_oriented: true }
  },
  {
    name: 'Educational Course - Hindi',
    native_name: 'शैक्षिक पाठ्यक्रम - हिंदी',
    description: 'Online course content in Hindi',
    native_description: 'हिंदी में ऑनलाइन पाठ्यक्रम सामग्री',
    category: 'educational',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Indian Instructor' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Teacher' }
    ],
    industry_tags: ['education', 'upskilling', 'india'],
    target_platform: ['youtube', 'unacademy', 'byju'],
    estimated_duration_seconds: 300,
    cultural_notes: 'Respectful formal tone, exam-prep focus, detailed explanations',
    design_style: 'indian_educational',
    tts_provider: 'azure_neural',
    style_preset: { formal: true, educational: true }
  },
  {
    name: 'Healthcare Awareness - Hindi',
    native_name: 'स्वास्थ्य जागरूकता - हिंदी',
    description: 'Public health awareness for Indian audience',
    native_description: 'भारतीय दर्शकों के लिए सार्वजनिक स्वास्थ्य जागरूकता',
    category: 'healthcare',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'meshy_3d',
    secondary_models: ['azure_neural', 'vertex_veo'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: 'Medical Visualization' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Medical' }
    ],
    industry_tags: ['healthcare', 'public_health', 'awareness'],
    target_platform: ['youtube', 'whatsapp', 'hospital_app'],
    estimated_duration_seconds: 90,
    cultural_notes: 'Accessible language, family context, preventive care focus',
    design_style: 'indian_healthcare',
    tts_provider: 'azure_neural',
    style_preset: { accessible: true, family: true }
  },
  {
    name: 'Fintech Explainer - Hindi',
    native_name: 'फिनटेक विवरण - हिंदी',
    description: 'Digital payments and fintech education',
    native_description: 'डिजिटल भुगतान और फिनटेक शिक्षा',
    category: 'corporate',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Fintech Demo' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Business' }
    ],
    industry_tags: ['fintech', 'banking', 'upi', 'digital_payments'],
    target_platform: ['youtube', 'app_store'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Trust-building, security emphasis, UPI integration focus',
    design_style: 'indian_fintech',
    tts_provider: 'azure_neural',
    style_preset: { trust: true, security: true }
  },
];

// ============================================
// SPANISH / LATAM TEMPLATES
// ============================================
const SPANISH_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Launch - Mexican Spanish',
    native_name: 'Lanzamiento de Producto - Español Mexicano',
    description: 'Product launch with Mexican Spanish localization',
    native_description: 'Lanzamiento de producto con localización en español mexicano',
    category: 'marketing',
    region_code: 'latam',
    language_code: 'es-MX',
    primary_model: 'vertex_veo',
    secondary_models: ['elevenlabs', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'LatAm Video' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Mexican Spanish' }
    ],
    industry_tags: ['retail', 'consumer', 'mexico', 'latam'],
    target_platform: ['youtube', 'facebook', 'instagram'],
    estimated_duration_seconds: 45,
    cultural_notes: 'Warm colors, family values, aspirational messaging, Mexican dialect',
    design_style: 'latam_vibrant',
    tts_provider: 'elevenlabs',
    style_preset: { warm_colors: true, family: true, dialect: 'mexican' }
  },
  {
    name: 'Corporate Video - Castilian Spanish',
    native_name: 'Video Corporativo - Español Castellano',
    description: 'Professional corporate content for Spain market',
    native_description: 'Contenido corporativo profesional para el mercado español',
    category: 'corporate',
    region_code: 'europe',
    language_code: 'es-ES',
    primary_model: 'vertex_veo',
    secondary_models: ['elevenlabs', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'European Corporate' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Castilian Spanish' }
    ],
    industry_tags: ['enterprise', 'finance', 'spain', 'europe'],
    target_platform: ['linkedin', 'website'],
    estimated_duration_seconds: 90,
    cultural_notes: 'European business style, formal usted usage, Castilian pronunciation',
    design_style: 'european_corporate',
    tts_provider: 'elevenlabs',
    style_preset: { formal: true, european: true, dialect: 'castilian' }
  },
  {
    name: 'Educational - Argentine Spanish',
    native_name: 'Educativo - Español Argentino',
    description: 'Educational content with Argentine Spanish',
    native_description: 'Contenido educativo en español argentino',
    category: 'educational',
    region_code: 'latam',
    language_code: 'es-AR',
    primary_model: 'alibaba_avatar',
    secondary_models: ['elevenlabs'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Spanish Instructor' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Argentine Spanish' }
    ],
    industry_tags: ['education', 'argentina', 'latam'],
    target_platform: ['youtube', 'lms'],
    estimated_duration_seconds: 180,
    cultural_notes: 'Voseo usage, Rioplatense accent, informal educational style',
    design_style: 'latam_educational',
    tts_provider: 'elevenlabs',
    style_preset: { voseo: true, dialect: 'rioplatense' }
  },
];

// ============================================
// PORTUGUESE / BRAZIL TEMPLATES
// ============================================
const PORTUGUESE_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Demo - Brazilian Portuguese',
    native_name: 'Demo de Produto - Português Brasileiro',
    description: 'Product demonstration for Brazilian market',
    native_description: 'Demonstração de produto para o mercado brasileiro',
    category: 'marketing',
    region_code: 'latam',
    language_code: 'pt-BR',
    primary_model: 'vertex_veo',
    secondary_models: ['elevenlabs', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Brazilian Market' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Brazilian Portuguese' }
    ],
    industry_tags: ['ecommerce', 'technology', 'brazil'],
    target_platform: ['youtube', 'instagram', 'mercado_livre'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Energetic, colorful, music-driven, Brazilian expressions',
    design_style: 'brazilian_vibrant',
    tts_provider: 'elevenlabs',
    style_preset: { energetic: true, colorful: true, brazilian: true }
  },
  {
    name: 'Fintech Explainer - Brazilian Portuguese',
    native_name: 'Explicador Fintech - Português Brasileiro',
    description: 'Digital banking and PIX payments education',
    native_description: 'Educação sobre banco digital e pagamentos PIX',
    category: 'corporate',
    region_code: 'latam',
    language_code: 'pt-BR',
    primary_model: 'vertex_veo',
    secondary_models: ['elevenlabs', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Fintech Brazil' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Brazilian Business' }
    ],
    industry_tags: ['fintech', 'banking', 'pix', 'nubank'],
    target_platform: ['youtube', 'app_store'],
    estimated_duration_seconds: 60,
    cultural_notes: 'PIX ecosystem focus, mobile-first, young professional target',
    design_style: 'brazilian_fintech',
    tts_provider: 'elevenlabs',
    style_preset: { mobile_first: true, fintech: true }
  },
];

// ============================================
// INDONESIAN / SEA TEMPLATES
// ============================================
const INDONESIAN_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Promo - Indonesian',
    native_name: 'Promo Produk - Bahasa Indonesia',
    description: 'Product promotion for Indonesian market',
    native_description: 'Promosi produk untuk pasar Indonesia',
    category: 'marketing',
    region_code: 'sea',
    language_code: 'id',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'SEA Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Indonesian' }
    ],
    industry_tags: ['ecommerce', 'tokopedia', 'shopee', 'indonesia'],
    target_platform: ['youtube', 'tiktok', 'tokopedia'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Mobile-first, value-focused, Islamic considerations, local platforms',
    design_style: 'indonesian_mobile',
    tts_provider: 'azure_neural',
    style_preset: { mobile_first: true, value_focused: true }
  },
  {
    name: 'Educational Content - Indonesian',
    native_name: 'Konten Edukasi - Bahasa Indonesia',
    description: 'Educational video for Indonesian audience',
    native_description: 'Video edukasi untuk audiens Indonesia',
    category: 'educational',
    region_code: 'sea',
    language_code: 'id',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Indonesian Presenter' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Indonesian Teacher' }
    ],
    industry_tags: ['education', 'ruangguru', 'zenius'],
    target_platform: ['youtube', 'ruangguru'],
    estimated_duration_seconds: 240,
    cultural_notes: 'Respectful formal language, exam preparation focus',
    design_style: 'indonesian_educational',
    tts_provider: 'azure_neural',
    style_preset: { formal: true, educational: true }
  },
];

// ============================================
// VIETNAMESE TEMPLATES
// ============================================
const VIETNAMESE_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'E-commerce Promo - Vietnamese',
    native_name: 'Quảng Cáo Thương Mại - Tiếng Việt',
    description: 'E-commerce promotion for Vietnamese market',
    native_description: 'Quảng cáo thương mại điện tử cho thị trường Việt Nam',
    category: 'marketing',
    region_code: 'sea',
    language_code: 'vi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Vietnam Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Vietnamese' }
    ],
    industry_tags: ['ecommerce', 'shopee', 'lazada', 'vietnam'],
    target_platform: ['youtube', 'facebook', 'shopee'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Tonal language consideration, price-sensitive messaging, mobile commerce',
    design_style: 'vietnamese_commerce',
    tts_provider: 'azure_neural',
    style_preset: { mobile_commerce: true, price_focused: true }
  },
];

// ============================================
// THAI TEMPLATES
// ============================================
const THAI_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Launch - Thai',
    native_name: 'เปิดตัวผลิตภัณฑ์ - ภาษาไทย',
    description: 'Product launch for Thai market',
    native_description: 'เปิดตัวผลิตภัณฑ์สำหรับตลาดไทย',
    category: 'marketing',
    region_code: 'sea',
    language_code: 'th',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Thai Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Thai' }
    ],
    industry_tags: ['retail', 'beauty', 'thailand'],
    target_platform: ['youtube', 'line', 'facebook'],
    estimated_duration_seconds: 45,
    cultural_notes: 'Respectful of monarchy, Buddhist sensitivities, LINE platform focus',
    design_style: 'thai_elegant',
    tts_provider: 'azure_neural',
    style_preset: { elegant: true, respectful: true }
  },
];

// ============================================
// AFRICAN REGIONAL TEMPLATES
// ============================================
const AFRICAN_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Fintech Explainer - Swahili',
    native_name: 'Maelezo ya Fintech - Kiswahili',
    description: 'Mobile money and fintech education in Swahili',
    native_description: 'Elimu ya pesa za simu na fintech kwa Kiswahili',
    category: 'corporate',
    region_code: 'africa',
    language_code: 'sw',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'African Fintech' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Swahili' }
    ],
    industry_tags: ['fintech', 'mpesa', 'mobile_money', 'east_africa'],
    target_platform: ['youtube', 'whatsapp', 'app_store'],
    estimated_duration_seconds: 60,
    cultural_notes: 'M-Pesa ecosystem, mobile-first, agricultural context, community focus',
    design_style: 'african_fintech',
    tts_provider: 'azure_neural',
    style_preset: { mobile_money: true, community: true }
  },
  {
    name: 'Healthcare Awareness - Swahili',
    native_name: 'Uhamasishaji wa Afya - Kiswahili',
    description: 'Public health content for East African audience',
    native_description: 'Maudhui ya afya ya umma kwa hadhira ya Afrika Mashariki',
    category: 'healthcare',
    region_code: 'africa',
    language_code: 'sw',
    primary_model: 'meshy_3d',
    secondary_models: ['azure_neural', 'vertex_veo'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: 'Medical Visualization' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Swahili Medical' }
    ],
    industry_tags: ['healthcare', 'ngo', 'public_health', 'africa'],
    target_platform: ['youtube', 'whatsapp', 'community_health'],
    estimated_duration_seconds: 90,
    cultural_notes: 'Community health focus, accessible language, visual emphasis',
    design_style: 'african_health',
    tts_provider: 'azure_neural',
    style_preset: { community: true, visual: true }
  },
  {
    name: 'Agricultural Education - Yoruba',
    native_name: 'Ẹ̀kọ́ Iṣẹ́ Àgbẹ̀ - Yorùbá',
    description: 'Agricultural training for Nigerian farmers in Yoruba',
    native_description: 'Ìdánilẹ́kọ̀ọ́ iṣẹ́ àgbẹ̀ fún àwọn àgbẹ̀ Nàìjíríà ní èdè Yorùbá',
    category: 'educational',
    region_code: 'africa',
    language_code: 'yo',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Agricultural Training' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Yoruba' }
    ],
    industry_tags: ['agriculture', 'farming', 'nigeria', 'west_africa'],
    target_platform: ['youtube', 'whatsapp', 'farmer_app'],
    estimated_duration_seconds: 180,
    cultural_notes: 'Local farming context, seasonal awareness, community knowledge sharing',
    design_style: 'african_agricultural',
    tts_provider: 'azure_neural',
    style_preset: { agricultural: true, local: true }
  },
  {
    name: 'E-commerce - Nigerian Pidgin',
    native_name: 'E-commerce - Nigerian Pidgin',
    description: 'E-commerce content in Nigerian Pidgin for mass market',
    native_description: 'E-commerce content for Nigerian market in Pidgin English',
    category: 'marketing',
    region_code: 'africa',
    language_code: 'pcm',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Nigerian Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Nigerian Pidgin' }
    ],
    industry_tags: ['ecommerce', 'jumia', 'konga', 'nigeria'],
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Pidgin for mass appeal, vibrant Afrobeats energy, local humor',
    design_style: 'nigerian_vibrant',
    tts_provider: 'azure_neural',
    style_preset: { pidgin: true, vibrant: true, afro_energy: true }
  },
];

// ============================================
// FRENCH TEMPLATES (EUROPE & AFRICA)
// ============================================
const FRENCH_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Corporate Video - French',
    native_name: 'Vidéo Corporate - Français',
    description: 'Professional corporate content for French market',
    native_description: 'Contenu corporate professionnel pour le marché français',
    category: 'corporate',
    region_code: 'europe',
    language_code: 'fr-FR',
    primary_model: 'vertex_veo',
    secondary_models: ['elevenlabs', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'French Corporate' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'French' }
    ],
    industry_tags: ['enterprise', 'luxury', 'france', 'europe'],
    target_platform: ['linkedin', 'website'],
    estimated_duration_seconds: 90,
    cultural_notes: 'Elegant, sophisticated, formal vous usage, luxury aesthetics',
    design_style: 'french_elegant',
    tts_provider: 'elevenlabs',
    style_preset: { elegant: true, formal: true, luxury: true }
  },
  {
    name: 'Educational - Canadian French',
    native_name: 'Éducatif - Français Canadien',
    description: 'Educational content for Quebec market',
    native_description: 'Contenu éducatif pour le marché québécois',
    category: 'educational',
    region_code: 'western',
    language_code: 'fr-CA',
    primary_model: 'alibaba_avatar',
    secondary_models: ['elevenlabs'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'French Instructor' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Quebec French' }
    ],
    industry_tags: ['education', 'quebec', 'canada'],
    target_platform: ['youtube', 'lms'],
    estimated_duration_seconds: 180,
    cultural_notes: 'Quebec accent, joual expressions where appropriate, bilingual considerations',
    design_style: 'quebec_educational',
    tts_provider: 'elevenlabs',
    style_preset: { quebec: true, bilingual: true }
  },
  {
    name: 'Fintech - West African French',
    native_name: 'Fintech - Français Ouest-Africain',
    description: 'Mobile money education for Francophone Africa',
    native_description: 'Éducation sur le mobile money pour l\'Afrique francophone',
    category: 'corporate',
    region_code: 'africa',
    language_code: 'fr',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'African French Fintech' },
      { type: 'tts', provider: 'Azure Neural', feature: 'African French' }
    ],
    industry_tags: ['fintech', 'mobile_money', 'orange_money', 'francophone_africa'],
    target_platform: ['youtube', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'West African French, mobile money ecosystem, community banking',
    design_style: 'african_french_fintech',
    tts_provider: 'azure_neural',
    style_preset: { mobile_money: true, african_french: true }
  },
];

// ============================================
// GERMAN TEMPLATES
// ============================================
const GERMAN_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Demo - German',
    native_name: 'Produktdemo - Deutsch',
    description: 'Precise product demonstration for German market',
    native_description: 'Präzise Produktdemonstration für den deutschen Markt',
    category: 'marketing',
    region_code: 'europe',
    language_code: 'de',
    primary_model: 'vertex_veo',
    secondary_models: ['elevenlabs', 'meshy_3d'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'German Precision' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'German' }
    ],
    industry_tags: ['technology', 'engineering', 'germany', 'dach'],
    target_platform: ['youtube', 'linkedin', 'xing'],
    estimated_duration_seconds: 90,
    cultural_notes: 'Technical precision, data-driven, formal Sie usage, quality focus',
    design_style: 'german_precision',
    tts_provider: 'elevenlabs',
    style_preset: { precision: true, technical: true, quality: true }
  },
  {
    name: 'Corporate Training - German',
    native_name: 'Unternehmensschulung - Deutsch',
    description: 'Enterprise training with German business culture',
    native_description: 'Unternehmensschulung mit deutscher Geschäftskultur',
    category: 'corporate',
    region_code: 'europe',
    language_code: 'de',
    primary_model: 'alibaba_avatar',
    secondary_models: ['elevenlabs'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'German Presenter' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'German Business' }
    ],
    industry_tags: ['enterprise', 'training', 'hr', 'germany'],
    target_platform: ['lms', 'internal'],
    estimated_duration_seconds: 300,
    cultural_notes: 'Punctuality emphasis, clear structure, formal business style',
    design_style: 'german_corporate',
    tts_provider: 'elevenlabs',
    style_preset: { formal: true, structured: true }
  },
];

// ============================================
// TURKISH TEMPLATES
// ============================================
const TURKISH_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'E-commerce Promo - Turkish',
    native_name: 'E-ticaret Promosyonu - Türkçe',
    description: 'E-commerce promotion for Turkish market',
    native_description: 'Türk pazarı için e-ticaret promosyonu',
    category: 'marketing',
    region_code: 'mena',
    language_code: 'tr',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Turkish Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Turkish' }
    ],
    industry_tags: ['ecommerce', 'trendyol', 'hepsiburada', 'turkey'],
    target_platform: ['youtube', 'instagram', 'trendyol'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Dynamic, campaign-focused, Turkish platforms, family values',
    design_style: 'turkish_dynamic',
    tts_provider: 'azure_neural',
    style_preset: { dynamic: true, campaign: true }
  },
];

// ============================================
// URDU / PAKISTAN TEMPLATES
// ============================================
const URDU_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Product Demo - Urdu',
    native_name: 'مصنوعات کا ڈیمو - اردو',
    description: 'Product demonstration for Pakistani market',
    native_description: 'پاکستانی مارکیٹ کے لیے مصنوعات کا مظاہرہ',
    category: 'marketing',
    region_code: 'india',
    language_code: 'ur',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Pakistan Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Urdu' }
    ],
    industry_tags: ['ecommerce', 'daraz', 'pakistan'],
    target_platform: ['youtube', 'facebook', 'daraz'],
    estimated_duration_seconds: 60,
    cultural_notes: 'RTL script, Islamic sensitivities, family values, Urdu poetry influence',
    design_style: 'pakistani_elegant',
    tts_provider: 'azure_neural',
    style_preset: { rtl: true, elegant: true }
  },
  {
    name: 'Islamic Finance Explainer - Urdu',
    native_name: 'اسلامی مالیات کی وضاحت - اردو',
    description: 'Shariah-compliant finance education',
    native_description: 'شریعہ کے مطابق مالیات کی تعلیم',
    category: 'corporate',
    region_code: 'india',
    language_code: 'ur',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Islamic Finance' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Formal Urdu' }
    ],
    industry_tags: ['islamic_finance', 'halal', 'pakistan', 'banking'],
    target_platform: ['youtube', 'app_store'],
    estimated_duration_seconds: 120,
    cultural_notes: 'Shariah compliance focus, Quranic references where appropriate, trust emphasis',
    design_style: 'islamic_finance',
    tts_provider: 'azure_neural',
    style_preset: { islamic: true, halal: true, formal: true }
  },
];

// ============================================
// BENGALI TEMPLATES
// ============================================
const BENGALI_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'E-commerce Promo - Bengali',
    native_name: 'ই-কমার্স প্রমো - বাংলা',
    description: 'E-commerce promotion for Bangladesh and West Bengal',
    native_description: 'বাংলাদেশ এবং পশ্চিমবঙ্গের জন্য ই-কমার্স প্রচার',
    category: 'marketing',
    region_code: 'india',
    language_code: 'bn',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Bengal Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Bengali' }
    ],
    industry_tags: ['ecommerce', 'bangladesh', 'west_bengal'],
    target_platform: ['youtube', 'facebook', 'daraz_bd'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Literary tradition, Rabindranath influence, colorful aesthetics',
    design_style: 'bengali_cultural',
    tts_provider: 'azure_neural',
    style_preset: { cultural: true, literary: true }
  },
  {
    name: 'Educational Content - Bengali',
    native_name: 'শিক্ষামূলক সামগ্রী - বাংলা',
    description: 'Educational content in Bengali',
    native_description: 'বাংলায় শিক্ষামূলক বিষয়বস্তু',
    category: 'educational',
    region_code: 'india',
    language_code: 'bn',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Bengali Teacher' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Bengali Educational' }
    ],
    industry_tags: ['education', 'bangladesh', 'india'],
    target_platform: ['youtube', '10minuteschool'],
    estimated_duration_seconds: 240,
    cultural_notes: 'Strong educational tradition, exam focus, Kolkata/Dhaka variations',
    design_style: 'bengali_educational',
    tts_provider: 'azure_neural',
    style_preset: { educational: true }
  },
];

// ============================================
// INDIAN REGIONAL LANGUAGE TEMPLATES
// Telugu, Kannada, Tamil, Marathi, Assamese
// ============================================
const INDIAN_REGIONAL_TEMPLATES: RegionalTemplate[] = [
  // TELUGU TEMPLATES
  {
    name: 'Product Demo - Telugu',
    native_name: 'ఉత్పత్తి డెమో - తెలుగు',
    description: 'Product demonstration for Telugu-speaking audience',
    native_description: 'తెలుగు మాట్లాడే ప్రేక్షకుల కోసం ఉత్పత్తి ప్రదర్శన',
    category: 'marketing',
    region_code: 'india',
    language_code: 'te-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Telugu Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Telugu' }
    ],
    industry_tags: ['ecommerce', 'technology', 'telugu', 'andhra', 'telangana'],
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Telugu cinema influence, vibrant colors, family-centric messaging',
    design_style: 'telugu_vibrant',
    tts_provider: 'azure_neural',
    style_preset: { vibrant: true, tollywood: true }
  },
  {
    name: 'Educational Course - Telugu',
    native_name: 'విద్యా కోర్సు - తెలుగు',
    description: 'Online education content in Telugu',
    native_description: 'తెలుగులో ఆన్‌లైన్ విద్యా కంటెంట్',
    category: 'educational',
    region_code: 'india',
    language_code: 'te-IN',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Telugu Instructor' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Telugu Teacher' }
    ],
    industry_tags: ['education', 'edtech', 'competitive_exams', 'telugu'],
    target_platform: ['youtube', 'byju', 'unacademy'],
    estimated_duration_seconds: 300,
    cultural_notes: 'Strong exam prep culture, respectful formal Telugu',
    design_style: 'telugu_educational',
    tts_provider: 'azure_neural',
    style_preset: { formal: true, educational: true }
  },
  // KANNADA TEMPLATES
  {
    name: 'Product Demo - Kannada',
    native_name: 'ಉತ್ಪನ್ನ ಡೆಮೊ - ಕನ್ನಡ',
    description: 'Product demonstration for Karnataka market',
    native_description: 'ಕರ್ನಾಟಕ ಮಾರುಕಟ್ಟೆಗಾಗಿ ಉತ್ಪನ್ನ ಪ್ರದರ್ಶನ',
    category: 'marketing',
    region_code: 'india',
    language_code: 'kn-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Karnataka Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Kannada' }
    ],
    industry_tags: ['technology', 'startup', 'bangalore', 'karnataka'],
    target_platform: ['youtube', 'linkedin', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Tech hub culture, startup ecosystem, Sandalwood influence',
    design_style: 'kannada_tech',
    tts_provider: 'azure_neural',
    style_preset: { tech: true, bangalore_startup: true }
  },
  {
    name: 'Healthcare Awareness - Kannada',
    native_name: 'ಆರೋಗ್ಯ ಜಾಗೃತಿ - ಕನ್ನಡ',
    description: 'Health awareness content for Karnataka',
    native_description: 'ಕರ್ನಾಟಕಕ್ಕಾಗಿ ಆರೋಗ್ಯ ಜಾಗೃತಿ ವಿಷಯ',
    category: 'healthcare',
    region_code: 'india',
    language_code: 'kn-IN',
    primary_model: 'meshy_3d',
    secondary_models: ['azure_neural', 'vertex_veo'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: 'Medical Visualization' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Kannada Medical' }
    ],
    industry_tags: ['healthcare', 'medical', 'karnataka'],
    target_platform: ['youtube', 'whatsapp', 'hospital_app'],
    estimated_duration_seconds: 90,
    cultural_notes: 'Ayurveda heritage, holistic health approach, family care',
    design_style: 'kannada_healthcare',
    tts_provider: 'azure_neural',
    style_preset: { medical: true, ayurveda: true }
  },
  // TAMIL TEMPLATES
  {
    name: 'Product Demo - Tamil',
    native_name: 'தயாரிப்பு டெமோ - தமிழ்',
    description: 'Product demonstration for Tamil Nadu market',
    native_description: 'தமிழ்நாடு சந்தைக்கான தயாரிப்பு ஆர்ப்பாட்டம்',
    category: 'marketing',
    region_code: 'india',
    language_code: 'ta-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Tamil Nadu Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Tamil' }
    ],
    industry_tags: ['ecommerce', 'automotive', 'tamil_nadu', 'chennai'],
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Kollywood influence, Tamil pride, classical heritage',
    design_style: 'tamil_cultural',
    tts_provider: 'azure_neural',
    style_preset: { cultural: true, kollywood: true }
  },
  {
    name: 'Educational - Tamil',
    native_name: 'கல்வி - தமிழ்',
    description: 'Educational content in Tamil',
    native_description: 'தமிழில் கல்வி உள்ளடக்கம்',
    category: 'educational',
    region_code: 'india',
    language_code: 'ta-IN',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Tamil Teacher' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Tamil Educational' }
    ],
    industry_tags: ['education', 'tamil_nadu', 'competitive_exams'],
    target_platform: ['youtube', 'byju', 'vedantu'],
    estimated_duration_seconds: 240,
    cultural_notes: 'High education emphasis, NEET/JEE focus, respectful tone',
    design_style: 'tamil_educational',
    tts_provider: 'azure_neural',
    style_preset: { educational: true, exam_prep: true }
  },
  // MARATHI TEMPLATES
  {
    name: 'Product Demo - Marathi',
    native_name: 'उत्पादन डेमो - मराठी',
    description: 'Product demonstration for Maharashtra market',
    native_description: 'महाराष्ट्र बाजारपेठेसाठी उत्पादन प्रात्यक्षिक',
    category: 'marketing',
    region_code: 'india',
    language_code: 'mr-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Maharashtra Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Marathi' }
    ],
    industry_tags: ['ecommerce', 'mumbai', 'pune', 'maharashtra'],
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Marathi Manoos pride, Bollywood influence, Mumbai hustle',
    design_style: 'marathi_vibrant',
    tts_provider: 'azure_neural',
    style_preset: { vibrant: true, mumbai: true }
  },
  {
    name: 'Fintech Explainer - Marathi',
    native_name: 'फिनटेक स्पष्टीकरण - मराठी',
    description: 'Digital payments education in Marathi',
    native_description: 'मराठीत डिजिटल पेमेंट शिक्षण',
    category: 'corporate',
    region_code: 'india',
    language_code: 'mr-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Fintech Marathi' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Marathi Business' }
    ],
    industry_tags: ['fintech', 'upi', 'mumbai', 'maharashtra'],
    target_platform: ['youtube', 'app_store'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Financial hub focus, UPI adoption, trust-building',
    design_style: 'marathi_fintech',
    tts_provider: 'azure_neural',
    style_preset: { fintech: true, trust: true }
  },
  // ASSAMESE TEMPLATES
  {
    name: 'Product Demo - Assamese',
    native_name: 'প্ৰডাক্ট ডেম - অসমীয়া',
    description: 'Product demonstration for Assam market',
    native_description: 'অসম বজাৰৰ বাবে প্ৰডাক্ট প্ৰদৰ্শন',
    category: 'marketing',
    region_code: 'india',
    language_code: 'as-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Assam Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Assamese' }
    ],
    industry_tags: ['tea', 'northeast', 'assam', 'guwahati'],
    target_platform: ['youtube', 'facebook', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Tea garden heritage, Bihu festival colors, nature-focused',
    design_style: 'assamese_natural',
    tts_provider: 'azure_neural',
    style_preset: { nature: true, bihu: true }
  },
  {
    name: 'Agricultural Training - Assamese',
    native_name: 'কৃষি প্ৰশিক্ষণ - অসমীয়া',
    description: 'Agricultural education for Northeast farmers',
    native_description: 'উত্তৰ-পূব কৃষকৰ বাবে কৃষি শিক্ষা',
    category: 'educational',
    region_code: 'india',
    language_code: 'as-IN',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Assamese Instructor' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Assamese Educational' }
    ],
    industry_tags: ['agriculture', 'tea', 'northeast', 'farming'],
    target_platform: ['youtube', 'whatsapp', 'farmer_app'],
    estimated_duration_seconds: 180,
    cultural_notes: 'Tea cultivation focus, organic farming, sustainable practices',
    design_style: 'assamese_agricultural',
    tts_provider: 'azure_neural',
    style_preset: { agricultural: true, organic: true }
  },
];

// ============================================
// PODCAST & WEBCAST TEMPLATES
// ============================================
const PODCAST_WEBCAST_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Podcast Cover - Professional',
    native_name: 'Podcast Cover - Professional',
    description: 'Professional podcast thumbnail with microphone and audio waveforms',
    native_description: 'Professional podcast cover for audio content creators',
    category: 'podcast',
    region_code: 'global',
    language_code: 'en',
    primary_model: 'vertex_veo',
    secondary_models: ['modelslab', 'openai_dalle'],
    ai_capabilities: [
      { type: 'image', provider: 'Vertex AI', feature: 'Podcast Thumbnail' },
      { type: 'audio', provider: 'ElevenLabs', feature: 'Voice Generation' }
    ],
    industry_tags: ['podcast', 'audio', 'media', 'creator'],
    target_platform: ['spotify', 'apple_podcasts', 'youtube'],
    estimated_duration_seconds: 0,
    cultural_notes: 'Professional broadcasting aesthetic, microphone-centric design',
    design_style: 'podcast_professional',
    tts_provider: 'elevenlabs',
    style_preset: { podcast: true, professional: true }
  },
  {
    name: 'Podcast - Interview Format',
    native_name: 'Podcast - Interview Format',
    description: 'Two-person interview style podcast video template',
    native_description: 'Interview podcast format with split screen capability',
    category: 'podcast',
    region_code: 'global',
    language_code: 'en',
    primary_model: 'alibaba_avatar',
    secondary_models: ['vertex_veo', 'elevenlabs'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Dual Presenters' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Conversational Voices' }
    ],
    industry_tags: ['podcast', 'interview', 'talk_show', 'media'],
    target_platform: ['youtube', 'spotify', 'linkedin'],
    estimated_duration_seconds: 600,
    cultural_notes: 'Professional interview setup, comfortable atmosphere',
    design_style: 'podcast_interview',
    tts_provider: 'elevenlabs',
    style_preset: { interview: true, split_screen: true }
  },
  {
    name: 'Webcast - Corporate Event',
    native_name: 'Webcast - Corporate Event',
    description: 'Professional webcast template for corporate events and announcements',
    native_description: 'High-quality webcast for corporate communications',
    category: 'webcast',
    region_code: 'global',
    language_code: 'en',
    primary_model: 'vertex_veo',
    secondary_models: ['alibaba_avatar', 'elevenlabs'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Webcast Production' },
      { type: 'tts', provider: 'ElevenLabs', feature: 'Professional Narrator' }
    ],
    industry_tags: ['webcast', 'corporate', 'event', 'announcement'],
    target_platform: ['zoom', 'teams', 'linkedin_live', 'youtube'],
    estimated_duration_seconds: 900,
    cultural_notes: 'Professional streaming setup, global audience ready',
    design_style: 'webcast_corporate',
    tts_provider: 'elevenlabs',
    style_preset: { webcast: true, corporate: true, live_ready: true }
  },
  {
    name: 'Webcast - Product Launch',
    native_name: 'Webcast - Product Launch',
    description: 'Live product launch webcast with demo capabilities',
    native_description: 'Exciting product launch webcast with visual effects',
    category: 'webcast',
    region_code: 'global',
    language_code: 'en',
    primary_model: 'sora2',
    secondary_models: ['alibaba_avatar', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Sora 2', feature: 'Launch Event' },
      { type: 'effects', provider: 'ModelsLab', feature: 'Visual Effects' }
    ],
    industry_tags: ['webcast', 'product_launch', 'event', 'technology'],
    target_platform: ['youtube_live', 'twitter_spaces', 'linkedin_live'],
    estimated_duration_seconds: 1800,
    cultural_notes: 'Apple-style product reveals, excitement building',
    design_style: 'webcast_launch',
    tts_provider: 'elevenlabs',
    style_preset: { launch: true, exciting: true }
  },
  {
    name: 'Podcast - Hindi',
    native_name: 'पॉडकास्ट - हिंदी',
    description: 'Hindi podcast template for Indian audience',
    native_description: 'भारतीय दर्शकों के लिए हिंदी पॉडकास्ट टेम्पलेट',
    category: 'podcast',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Hindi Host' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Voice' }
    ],
    industry_tags: ['podcast', 'hindi', 'india', 'audio'],
    target_platform: ['spotify', 'gaana', 'jio_saavn', 'youtube'],
    estimated_duration_seconds: 600,
    cultural_notes: 'Bollywood-inspired energy, conversational Hindi',
    design_style: 'podcast_hindi',
    tts_provider: 'azure_neural',
    style_preset: { podcast: true, hindi: true }
  },
  {
    name: 'Podcast - Arabic',
    native_name: 'بودكاست - عربي',
    description: 'Arabic podcast template for MENA audience',
    native_description: 'قالب بودكاست عربي لجمهور الشرق الأوسط',
    category: 'podcast',
    region_code: 'mena',
    language_code: 'ar',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba', feature: 'Arabic Host' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Arabic Voice' }
    ],
    industry_tags: ['podcast', 'arabic', 'mena', 'audio'],
    target_platform: ['spotify', 'anghami', 'youtube'],
    estimated_duration_seconds: 600,
    cultural_notes: 'RTL design, Islamic-friendly content',
    design_style: 'podcast_arabic',
    tts_provider: 'azure_neural',
    style_preset: { podcast: true, rtl: true }
  },
];

// ============================================
// VISION & HERITAGE TEMPLATES
// ============================================
const VISION_HERITAGE_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Saudi Vision 2030',
    native_name: 'رؤية السعودية 2030',
    description: 'Saudi Vision 2030 transformation and progress showcase',
    native_description: 'عرض تحول ورؤية السعودية 2030',
    category: 'vision',
    region_code: 'mena',
    language_code: 'ar-SA',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'meshy_3d'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Vision Video' },
      { type: '3d', provider: 'Meshy AI', feature: 'NEOM Visualization' }
    ],
    industry_tags: ['government', 'vision_2030', 'saudi', 'transformation'],
    target_platform: ['youtube', 'twitter', 'linkedin'],
    estimated_duration_seconds: 120,
    cultural_notes: 'National pride, futuristic megaprojects, green/vision colors',
    design_style: 'saudi_vision',
    tts_provider: 'azure_neural',
    style_preset: { vision: true, futuristic: true, national_pride: true }
  },
  {
    name: 'Andhra Pradesh Transformation',
    native_name: 'ఆంధ్రప్రదేశ్ పరివర్తన',
    description: 'Andhra Pradesh development and transformation showcase',
    native_description: 'ఆంధ్రప్రదేశ్ అభివృద్ధి మరియు పరివర్తన ప్రదర్శన',
    category: 'vision',
    region_code: 'india',
    language_code: 'te-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'meshy_3d'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'State Development' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Telugu' }
    ],
    industry_tags: ['government', 'andhra_pradesh', 'development', 'infrastructure'],
    target_platform: ['youtube', 'twitter', 'facebook'],
    estimated_duration_seconds: 120,
    cultural_notes: 'Amaravati vision, infrastructure projects, Telugu pride',
    design_style: 'ap_transformation',
    tts_provider: 'azure_neural',
    style_preset: { vision: true, development: true }
  },
  {
    name: 'India Heritage',
    native_name: 'भारत की विरासत',
    description: 'India cultural heritage and tourism showcase',
    native_description: 'भारत की सांस्कृतिक विरासत और पर्यटन प्रदर्शन',
    category: 'heritage',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Heritage Showcase' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Narrator' }
    ],
    industry_tags: ['tourism', 'heritage', 'culture', 'india', 'incredible_india'],
    target_platform: ['youtube', 'instagram', 'twitter'],
    estimated_duration_seconds: 90,
    cultural_notes: 'Rich cultural tapestry, monuments, festivals, traditions',
    design_style: 'india_heritage',
    tts_provider: 'azure_neural',
    style_preset: { heritage: true, cultural: true, tourism: true }
  },
  {
    name: 'UPI Success Story',
    native_name: 'UPI सफलता की कहानी',
    description: 'India UPI digital payments revolution showcase',
    native_description: 'भारत की UPI डिजिटल भुगतान क्रांति प्रदर्शन',
    category: 'fintech',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Fintech Story' },
      { type: 'effects', provider: 'ModelsLab', feature: 'Data Visualization' }
    ],
    industry_tags: ['fintech', 'upi', 'digital_india', 'payments', 'success_story'],
    target_platform: ['youtube', 'linkedin', 'twitter'],
    estimated_duration_seconds: 90,
    cultural_notes: 'Digital India success, financial inclusion, mobile payments',
    design_style: 'upi_success',
    tts_provider: 'azure_neural',
    style_preset: { fintech: true, success: true, digital_india: true }
  },
  {
    name: 'Digital India Initiative',
    native_name: 'डिजिटल भारत पहल',
    description: 'Digital India transformation and e-governance showcase',
    native_description: 'डिजिटल भारत परिवर्तन और ई-शासन प्रदर्शन',
    category: 'vision',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'meshy_3d'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Digital Transformation' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi' }
    ],
    industry_tags: ['government', 'digital_india', 'e_governance', 'technology'],
    target_platform: ['youtube', 'twitter', 'linkedin'],
    estimated_duration_seconds: 120,
    cultural_notes: 'Tech-forward, citizen services, national progress',
    design_style: 'digital_india',
    tts_provider: 'azure_neural',
    style_preset: { vision: true, digital: true, governance: true }
  },
];

// ============================================
// SMB (SMALL & MEDIUM BUSINESS) TEMPLATES
// ============================================
const SMB_TEMPLATES: RegionalTemplate[] = [
  {
    name: 'Food Cart Promo - Hindi',
    native_name: 'फूड कार्ट प्रोमो - हिंदी',
    description: 'Street food vendor promotional video',
    native_description: 'स्ट्रीट फूड विक्रेता प्रचार वीडियो',
    category: 'food_business',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Food Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Casual' }
    ],
    industry_tags: ['food', 'street_food', 'smb', 'vendor', 'local_business'],
    target_platform: ['instagram', 'whatsapp', 'facebook'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Mouth-watering visuals, local flavor, affordable messaging',
    design_style: 'food_cart_indian',
    tts_provider: 'azure_neural',
    style_preset: { food: true, street: true, local: true }
  },
  {
    name: 'Mom and Pop Store - Hindi',
    native_name: 'किराना दुकान - हिंदी',
    description: 'Small local retail store promotional template',
    native_description: 'छोटी स्थानीय खुदरा दुकान प्रचार टेम्पलेट',
    category: 'retail',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Retail Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Friendly' }
    ],
    industry_tags: ['retail', 'kirana', 'smb', 'local_store', 'family_business'],
    target_platform: ['whatsapp', 'instagram', 'facebook'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Trust-based relationship, neighborhood focus, value pricing',
    design_style: 'kirana_store',
    tts_provider: 'azure_neural',
    style_preset: { retail: true, local: true, trust: true }
  },
  {
    name: 'Commodities Market - Hindi',
    native_name: 'सब्जी मंडी - हिंदी',
    description: 'Vegetable and commodities market vendor template',
    native_description: 'सब्जी और कमोडिटी मार्केट विक्रेता टेम्पलेट',
    category: 'food_business',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Market Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Market' }
    ],
    industry_tags: ['commodities', 'vegetables', 'mandi', 'smb', 'wholesale'],
    target_platform: ['whatsapp', 'facebook'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Fresh produce showcase, early morning market energy',
    design_style: 'sabzi_mandi',
    tts_provider: 'azure_neural',
    style_preset: { market: true, fresh: true, wholesale: true }
  },
  {
    name: 'Homecare Services - Hindi',
    native_name: 'होमकेयर सेवाएं - हिंदी',
    description: 'Home healthcare and elderly care services',
    native_description: 'घरेलू स्वास्थ्य सेवा और बुजुर्गों की देखभाल सेवाएं',
    category: 'homecare',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Homecare Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Compassionate' }
    ],
    industry_tags: ['homecare', 'elderly_care', 'healthcare', 'smb', 'family'],
    target_platform: ['youtube', 'facebook', 'whatsapp'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Family values, respect for elders, trust and compassion',
    design_style: 'homecare_indian',
    tts_provider: 'azure_neural',
    style_preset: { homecare: true, compassion: true, family: true }
  },
  {
    name: 'Nursing Care Services - Hindi',
    native_name: 'नर्सिंग केयर सेवाएं - हिंदी',
    description: 'Professional nursing and patient care services',
    native_description: 'पेशेवर नर्सिंग और रोगी देखभाल सेवाएं',
    category: 'nursing',
    region_code: 'india',
    language_code: 'hi',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'meshy_3d'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Healthcare Video' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Hindi Medical' }
    ],
    industry_tags: ['nursing', 'healthcare', 'patient_care', 'smb', 'medical'],
    target_platform: ['youtube', 'linkedin', 'facebook'],
    estimated_duration_seconds: 60,
    cultural_notes: 'Professional care, trained staff, trust building',
    design_style: 'nursing_care_indian',
    tts_provider: 'azure_neural',
    style_preset: { nursing: true, professional: true, medical: true }
  },
  {
    name: 'Food Cart - Telugu',
    native_name: 'ఫుడ్ కార్ట్ - తెలుగు',
    description: 'Andhra/Telangana street food promotion',
    native_description: 'ఆంధ్ర/తెలంగాణ స్ట్రీట్ ఫుడ్ ప్రమోషన్',
    category: 'food_business',
    region_code: 'india',
    language_code: 'te-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Telugu Food' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Telugu' }
    ],
    industry_tags: ['food', 'biryani', 'andhra', 'telangana', 'spicy'],
    target_platform: ['instagram', 'whatsapp', 'youtube'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Spicy Andhra cuisine, biryani focus, local flavors',
    design_style: 'andhra_food',
    tts_provider: 'azure_neural',
    style_preset: { food: true, spicy: true, regional: true }
  },
  {
    name: 'Local Store - Tamil',
    native_name: 'உள்ளூர் கடை - தமிழ்',
    description: 'Tamil Nadu local retail promotion',
    native_description: 'தமிழ்நாடு உள்ளூர் சில்லறை விற்பனை பரப்புரை',
    category: 'retail',
    region_code: 'india',
    language_code: 'ta-IN',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Tamil Retail' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Tamil' }
    ],
    industry_tags: ['retail', 'tamil_nadu', 'local_business', 'smb'],
    target_platform: ['whatsapp', 'instagram', 'facebook'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Tamil business culture, festival-focused promotions',
    design_style: 'tamil_retail',
    tts_provider: 'azure_neural',
    style_preset: { retail: true, tamil: true }
  },
  {
    name: 'Restaurant Promo - Indonesian',
    native_name: 'Promo Restoran - Indonesia',
    description: 'Indonesian restaurant and food business promotion',
    native_description: 'Promosi restoran dan bisnis makanan Indonesia',
    category: 'food_business',
    region_code: 'sea',
    language_code: 'id',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Indonesian Food' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Indonesian' }
    ],
    industry_tags: ['food', 'restaurant', 'indonesia', 'halal', 'smb'],
    target_platform: ['instagram', 'tokopedia', 'gojek'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Halal-certified, local cuisine variety, family dining',
    design_style: 'indonesian_food',
    tts_provider: 'azure_neural',
    style_preset: { food: true, halal: true, indonesia: true }
  },
  {
    name: 'SMB Promo - Nigerian Pidgin',
    native_name: 'SMB Promo - Naija',
    description: 'Small business promotion in Nigerian Pidgin',
    native_description: 'Small business promo for Nigerian market',
    category: 'retail',
    region_code: 'africa',
    language_code: 'pcm',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'Nigerian Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Nigerian Pidgin' }
    ],
    industry_tags: ['smb', 'nigeria', 'africa', 'local_business'],
    target_platform: ['whatsapp', 'instagram', 'facebook'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Pidgin for mass appeal, vibrant energy, local humor',
    design_style: 'nigerian_smb',
    tts_provider: 'azure_neural',
    style_preset: { pidgin: true, vibrant: true, local: true }
  },
  {
    name: 'Market Vendor - Swahili',
    native_name: 'Mfanyabiashara wa Soko - Kiswahili',
    description: 'East African market vendor promotion',
    native_description: 'Utangazaji wa mfanyabiashara wa soko la Afrika Mashariki',
    category: 'retail',
    region_code: 'africa',
    language_code: 'sw',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI', feature: 'East African Market' },
      { type: 'tts', provider: 'Azure Neural', feature: 'Swahili' }
    ],
    industry_tags: ['retail', 'market', 'east_africa', 'smb'],
    target_platform: ['whatsapp', 'facebook'],
    estimated_duration_seconds: 30,
    cultural_notes: 'Community market culture, mobile money integration',
    design_style: 'swahili_market',
    tts_provider: 'azure_neural',
    style_preset: { market: true, community: true }
  },
];

// Combine all regional templates
const ALL_REGIONAL_TEMPLATES: RegionalTemplate[] = [
  ...ARABIC_TEMPLATES,
  ...CHINESE_TEMPLATES,
  ...JAPANESE_TEMPLATES,
  ...KOREAN_TEMPLATES,
  ...HINDI_TEMPLATES,
  ...SPANISH_TEMPLATES,
  ...PORTUGUESE_TEMPLATES,
  ...INDONESIAN_TEMPLATES,
  ...VIETNAMESE_TEMPLATES,
  ...THAI_TEMPLATES,
  ...AFRICAN_TEMPLATES,
  ...FRENCH_TEMPLATES,
  ...GERMAN_TEMPLATES,
  ...TURKISH_TEMPLATES,
  ...URDU_TEMPLATES,
  ...BENGALI_TEMPLATES,
  ...INDIAN_REGIONAL_TEMPLATES,
  ...PODCAST_WEBCAST_TEMPLATES,
  ...VISION_HERITAGE_TEMPLATES,
  ...SMB_TEMPLATES,
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mode = 'add', region = 'all' } = await req.json().catch(() => ({}));

    // Filter templates by region if specified
    let templatesToProcess = ALL_REGIONAL_TEMPLATES;
    if (region !== 'all') {
      templatesToProcess = ALL_REGIONAL_TEMPLATES.filter(t => t.region_code === region);
    }

    console.log(`🌍 Processing ${templatesToProcess.length} regional templates (region: ${region})`);

    // Get existing templates to avoid duplicates
    const { data: existing } = await supabase
      .from('video_blueprints')
      .select('name');
    
    const existingNames = new Set((existing || []).map(t => t.name));
    const toInsert = templatesToProcess.filter(t => !existingNames.has(t.name));
    
    if (toInsert.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All regional templates already exist',
        created: 0,
        skipped: templatesToProcess.length,
        total: existing?.length || 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Insert templates with regional metadata
    const blueprintsToInsert = toInsert.map(t => ({
      name: t.name,
      description: `${t.description}\n\n🌍 Native: ${t.native_description}`,
      category: t.category,
      estimated_duration_seconds: t.estimated_duration_seconds,
      target_platform: t.target_platform,
      industry_tags: [...t.industry_tags, t.region_code, t.language_code],
      style_preset: {
        ...t.style_preset,
        native_name: t.native_name,
        region_code: t.region_code,
        language_code: t.language_code,
        cultural_notes: t.cultural_notes,
        design_style: t.design_style,
        tts_provider: t.tts_provider,
        is_regional: true,
      },
      default_settings: {
        primary_model: t.primary_model,
        secondary_models: t.secondary_models,
        ai_capabilities: t.ai_capabilities,
        regional_variants: [t.region_code],
        language_code: t.language_code,
        tts_provider: t.tts_provider,
      },
      is_system_default: true,
      is_public: true,
      is_active: true,
    }));

    const { data: inserted, error } = await supabase
      .from('video_blueprints')
      .insert(blueprintsToInsert)
      .select('id, name');

    if (error) throw error;

    // Create scenes for each blueprint
    const scenesInserts = [];
    for (const bp of inserted || []) {
      const template = templatesToProcess.find(t => t.name === bp.name);
      if (template) {
        const scenes = [
          { blueprint_id: bp.id, scene_key: 'hook', title: 'Hook', scene_type: 'intro', duration_seconds: 5, order_index: 0, is_optional: false },
          { blueprint_id: bp.id, scene_key: 'intro', title: 'Introduction', scene_type: 'intro', duration_seconds: 15, order_index: 1, is_optional: false },
          { blueprint_id: bp.id, scene_key: 'content', title: 'Main Content', scene_type: 'content', duration_seconds: Math.floor(template.estimated_duration_seconds * 0.6), order_index: 2, is_optional: false },
          { blueprint_id: bp.id, scene_key: 'cta', title: 'Call to Action', scene_type: 'cta', duration_seconds: 10, order_index: 3, is_optional: false },
        ];
        scenesInserts.push(...scenes);
      }
    }

    if (scenesInserts.length > 0) {
      await supabase.from('blueprint_scenes').insert(scenesInserts);
    }

    // Queue thumbnails for the new templates
    const thumbnailQueue = (inserted || []).map(bp => {
      const template = templatesToProcess.find(t => t.name === bp.name);
      return {
        blueprint_id: bp.id,
        status: 'pending',
        region: template?.region_code || 'global',
        prompt: `Regional thumbnail for ${bp.name}`,
        attempts: 0,
      };
    });

    if (thumbnailQueue.length > 0) {
      await supabase.from('thumbnail_generation_queue').insert(thumbnailQueue);
    }

    // Get region summary
    const regionCounts: Record<string, number> = {};
    for (const t of toInsert) {
      regionCounts[t.region_code] = (regionCounts[t.region_code] || 0) + 1;
    }

    return new Response(JSON.stringify({
      success: true,
      created: inserted?.length || 0,
      skipped: existingNames.size,
      total: (existing?.length || 0) + (inserted?.length || 0),
      regions: regionCounts,
      templates: inserted?.map(t => t.name) || [],
      thumbnails_queued: thumbnailQueue.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error seeding regional templates:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
