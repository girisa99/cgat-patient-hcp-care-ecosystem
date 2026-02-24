/**
 * Seed Mobile-First Regional Templates
 * 
 * 100+ mobile-optimized templates for TikTok, Instagram, Facebook, X, LinkedIn
 * Covering: Africa, India, Pakistan, Bangladesh, Indonesia, CJK, Europe, LATAM
 * With proper TTS routing per 4-zone strategy
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// TTS PROVIDER ROUTING (4-ZONE STRATEGY)
// DIFFERENTIATOR: Azure Neural as PRIMARY for Europe/LATAM (not ElevenLabs!)
// This is our competitive advantage for Visemes/Lip-sync quality
// ============================================
const TTS_ROUTING = {
  // Claude Zone (Western): Azure Neural PRIMARY (differentiator - NOT ElevenLabs!)
  western: { primary: 'azure_neural', fallback: 'elevenlabs', tertiary: 'google_tts' },
  europe: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'elevenlabs' },
  latam: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'elevenlabs' },
  
  // Alibaba Zone (CJK, MENA): Qwen3-TTS PRIMARY
  cjk: { primary: 'alibaba_qwen3_tts', fallback: 'azure_neural', tertiary: 'google_tts' },
  china: { primary: 'alibaba_qwen3_tts', fallback: 'azure_neural', tertiary: 'google_tts' },
  japan: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  korea: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  mena: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  arabic: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  
  // Gemini Zone (South Asia, SEA, Africa): Azure Neural PRIMARY (Visemes/Lip-sync)
  india: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  pakistan: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  bangladesh: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  sea: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  indonesia: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
  africa: { primary: 'azure_neural', fallback: 'alibaba_qwen3_tts', tertiary: 'google_tts' },
};

// ============================================
// VIDEO PROVIDER ROUTING (Production Priority)
// ============================================
const VIDEO_ROUTING = {
  primary: ['vertex_veo_3', 'sora2', 'alibaba_wan26'],
  secondary: ['alibaba_wan22', 'modelslab', 'deepseek'],
  fallback: ['replicate', 'gemini_video'],
};

// ============================================
// IMAGE/THUMBNAIL PROVIDER ROUTING
// Gemini 3 (Vertex AI) PRIMARY, Gemini 2.5 FALLBACK
// ============================================
const IMAGE_ROUTING = {
  primary: ['vertex_imagen3', 'banana_nano', 'gemini_3_pro'],
  secondary: ['alibaba_wanx', 'modelslab_flux', 'deepseek'],
  fallback: ['gemini_2_flash', 'replicate_sdxl', 'huggingface_flux'],
  last_resort: ['openai_dalle'], // OpenAI DALL-E is LAST resort, not primary
};

// ============================================
// INDIAN REGIONAL LANGUAGE TEMPLATES
// ============================================
const INDIAN_REGIONAL_TEMPLATES = [
  // Telugu
  {
    name: 'Product Demo - Telugu',
    native_name: 'ఉత్పత్తి డెమో - తెలుగు',
    description: 'Product demonstration for Telugu-speaking market',
    native_description: 'తెలుగు మాట్లాడే మార్కెట్ కోసం ఉత్పత్తి ప్రదర్శన',
    category: 'marketing',
    region_code: 'india',
    language_code: 'te-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'youtube_shorts', 'whatsapp'],
    cultural_notes: 'Andhra/Telangana specific aesthetics, regional festivals, local business context',
    style_preset: { mobile_first: true, aspect: '9:16', regional: 'telugu' }
  },
  {
    name: 'Andhra Pradesh Transformation Story',
    native_name: 'ఆంధ్రప్రదేశ్ పరివర్తన కథ',
    description: 'State development and transformation video',
    native_description: 'రాష్ట్ర అభివృద్ధి మరియు పరివర్తన వీడియో',
    category: 'vision',
    region_code: 'india',
    language_code: 'te-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'linkedin', 'website'],
    cultural_notes: 'Government initiative focus, Amaravati, tech hubs, agricultural innovation',
    style_preset: { documentary: true, government: true, regional: 'telugu' }
  },
  // Kannada
  {
    name: 'Tech Startup Pitch - Kannada',
    native_name: 'ಟೆಕ್ ಸ್ಟಾರ್ಟಪ್ ಪಿಚ್ - ಕನ್ನಡ',
    description: 'Startup pitch for Bangalore tech ecosystem',
    native_description: 'ಬೆಂಗಳೂರು ಟೆಕ್ ಇಕೋಸಿಸ್ಟಮ್‌ಗಾಗಿ ಸ್ಟಾರ್ಟಪ್ ಪಿಚ್',
    category: 'corporate',
    region_code: 'india',
    language_code: 'kn-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['linkedin', 'youtube', 'twitter'],
    cultural_notes: 'Silicon Valley of India, tech innovation, startup culture',
    style_preset: { mobile_first: true, tech: true, regional: 'kannada' }
  },
  {
    name: 'Local Business Promo - Kannada',
    native_name: 'ಸ್ಥಳೀಯ ವ್ಯಾಪಾರ ಪ್ರಚಾರ - ಕನ್ನಡ',
    description: 'Local business promotion for Karnataka market',
    native_description: 'ಕರ್ನಾಟಕ ಮಾರುಕಟ್ಟೆಗಾಗಿ ಸ್ಥಳೀಯ ವ್ಯಾಪಾರ ಪ್ರಚಾರ',
    category: 'smb',
    region_code: 'india',
    language_code: 'kn-IN',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'facebook', 'whatsapp'],
    cultural_notes: 'Local shops, traditional businesses, festival promotions',
    style_preset: { mobile_first: true, aspect: '9:16', regional: 'kannada' }
  },
  // Tamil
  {
    name: 'Product Launch - Tamil',
    native_name: 'தயாரிப்பு வெளியீடு - தமிழ்',
    description: 'Product launch for Tamil Nadu market',
    native_description: 'தமிழ்நாடு சந்தைக்கான தயாரிப்பு வெளியீடு',
    category: 'marketing',
    region_code: 'india',
    language_code: 'ta-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'youtube_shorts', 'facebook'],
    cultural_notes: 'Chennai-specific, Kollywood inspiration, vibrant colors, classical elements',
    style_preset: { mobile_first: true, aspect: '9:16', regional: 'tamil' }
  },
  {
    name: 'Educational Content - Tamil',
    native_name: 'கல்வி உள்ளடக்கம் - தமிழ்',
    description: 'Educational explainer in Tamil',
    native_description: 'தமிழில் கல்வி விளக்கம்',
    category: 'educational',
    region_code: 'india',
    language_code: 'ta-IN',
    primary_model: 'alibaba_avatar',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'website'],
    cultural_notes: 'Academic excellence focus, exam preparation, respected teacher persona',
    style_preset: { educational: true, formal: true, regional: 'tamil' }
  },
  // Marathi
  {
    name: 'Business Promo - Marathi',
    native_name: 'व्यवसाय प्रचार - मराठी',
    description: 'Business promotion for Maharashtra market',
    native_description: 'महाराष्ट्र मार्केटसाठी व्यवसाय प्रचार',
    category: 'marketing',
    region_code: 'india',
    language_code: 'mr-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'youtube_shorts', 'whatsapp'],
    cultural_notes: 'Mumbai-Pune corridor, Maratha pride, festival-centric, local business',
    style_preset: { mobile_first: true, aspect: '9:16', regional: 'marathi' }
  },
  {
    name: 'Kirana Store Digital - Marathi',
    native_name: 'किराणा दुकान डिजिटल - मराठी',
    description: 'Digital transformation for local grocery stores',
    native_description: 'स्थानिक किराणा दुकानांसाठी डिजिटल परिवर्तन',
    category: 'smb',
    region_code: 'india',
    language_code: 'mr-IN',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['whatsapp', 'facebook', 'instagram'],
    cultural_notes: 'Local kirana ecosystem, digital payments, home delivery',
    style_preset: { mobile_first: true, local_business: true, regional: 'marathi' }
  },
  // Assamese
  {
    name: 'Cultural Heritage - Assamese',
    native_name: 'সাংস্কৃতিক ঐতিহ্য - অসমীয়া',
    description: 'Northeast India cultural showcase',
    native_description: 'উত্তৰ-পূব ভাৰতৰ সাংস্কৃতিক প্ৰদৰ্শন',
    category: 'heritage',
    region_code: 'india',
    language_code: 'as-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'instagram', 'facebook'],
    cultural_notes: 'Bihu festival, tea gardens, one-horned rhino, Brahmaputra heritage',
    style_preset: { documentary: true, cultural: true, regional: 'assamese' }
  },
  {
    name: 'Tourism Promo - Assamese',
    native_name: 'পৰ্যটন প্ৰচাৰ - অসমীয়া',
    description: 'Northeast tourism promotion',
    native_description: 'উত্তৰ-পূব পৰ্যটন প্ৰচাৰ',
    category: 'travel',
    region_code: 'india',
    language_code: 'as-IN',
    primary_model: 'sora2',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'youtube', 'website'],
    cultural_notes: 'Kaziranga, Majuli, tea tourism, tribal heritage',
    style_preset: { cinematic: true, travel: true, regional: 'assamese' }
  },
  // Bengali
  {
    name: 'Product Demo - Bengali',
    native_name: 'পণ্য ডেমো - বাংলা',
    description: 'Product demonstration for Bengali market',
    native_description: 'বাংলা বাজারের জন্য পণ্য প্রদর্শন',
    category: 'marketing',
    region_code: 'india',
    language_code: 'bn-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'youtube_shorts', 'facebook'],
    cultural_notes: 'Kolkata culture, Durga Puja, intellectual heritage, artistic flair',
    style_preset: { mobile_first: true, aspect: '9:16', regional: 'bengali' }
  },
  // UPI Success Story
  {
    name: 'UPI Success Story - Hindi',
    native_name: 'यूपीआई सफलता की कहानी',
    description: 'Digital payments revolution story',
    native_description: 'डिजिटल भुगतान क्रांति की कहानी',
    category: 'fintech',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'linkedin', 'website'],
    cultural_notes: 'India Stack, PhonePe/Paytm/GPay ecosystem, financial inclusion',
    style_preset: { documentary: true, fintech: true, success_story: true }
  },
  {
    name: 'India Heritage Documentary',
    native_name: 'भारत विरासत वृत्तचित्र',
    description: 'Cultural heritage and monuments',
    native_description: 'सांस्कृतिक विरासत और स्मारक',
    category: 'heritage',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'sora2',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'website'],
    cultural_notes: 'UNESCO sites, traditional arts, ancient wisdom, Incredible India',
    style_preset: { cinematic: true, heritage: true, documentary: true }
  },
];

// ============================================
// SMB / LOCAL BUSINESS TEMPLATES (India)
// ============================================
const INDIAN_SMB_TEMPLATES = [
  {
    name: 'Food Cart Promo - Hindi',
    native_name: 'फूड कार्ट प्रोमो',
    description: 'Street food cart promotion',
    native_description: 'स्ट्रीट फूड कार्ट प्रचार',
    category: 'food_business',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'whatsapp', 'facebook'],
    cultural_notes: 'Chaat, golgappe, local street food, vibrant market atmosphere',
    style_preset: { mobile_first: true, aspect: '9:16', food: true, local: true }
  },
  {
    name: 'Sabzi Mandi Digital - Hindi',
    native_name: 'सब्जी मंडी डिजिटल',
    description: 'Vegetable market digital presence',
    native_description: 'सब्जी मंडी डिजिटल उपस्थिति',
    category: 'retail',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['whatsapp', 'facebook'],
    cultural_notes: 'Fresh vegetables, daily deals, home delivery, local farmers',
    style_preset: { mobile_first: true, aspect: '1:1', local: true }
  },
  {
    name: 'Kirana Store Ad - Hindi',
    native_name: 'किराना दुकान विज्ञापन',
    description: 'Local grocery store advertisement',
    native_description: 'स्थानीय किराना दुकान विज्ञापन',
    category: 'retail',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['whatsapp', 'instagram', 'facebook'],
    cultural_notes: 'Neighborhood store, credit khata, home delivery, personal service',
    style_preset: { mobile_first: true, aspect: '9:16', local: true }
  },
  {
    name: 'Homecare Services - Hindi',
    native_name: 'होमकेयर सेवाएं',
    description: 'Home healthcare and elderly care services',
    native_description: 'घरेलू स्वास्थ्य देखभाल और वृद्ध देखभाल सेवाएं',
    category: 'homecare',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'alibaba_avatar',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'facebook', 'website'],
    cultural_notes: 'Family values, elderly respect, trust-building, professional care',
    style_preset: { compassionate: true, family: true, healthcare: true }
  },
  {
    name: 'Nursing Care - Hindi',
    native_name: 'नर्सिंग केयर सेवाएं',
    description: 'Professional nursing and patient care',
    native_description: 'पेशेवर नर्सिंग और रोगी देखभाल',
    category: 'nursing',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'alibaba_avatar',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'website'],
    cultural_notes: 'Medical professionalism, patient comfort, family involvement',
    style_preset: { medical: true, professional: true, trust: true }
  },
];

// ============================================
// PAKISTAN TEMPLATES
// ============================================
const PAKISTAN_TEMPLATES = [
  {
    name: 'Product Launch - Urdu',
    native_name: 'پروڈکٹ لانچ - اردو',
    description: 'Product launch for Pakistan market',
    native_description: 'پاکستان مارکیٹ کے لیے پروڈکٹ لانچ',
    category: 'marketing',
    region_code: 'pakistan',
    language_code: 'ur-PK',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'tiktok', 'youtube_shorts'],
    cultural_notes: 'RTL text, Islamic design elements, family values, modest imagery',
    style_preset: { rtl: true, mobile_first: true, aspect: '9:16' }
  },
  {
    name: 'E-commerce Promo - Urdu',
    native_name: 'ای کامرس پرومو - اردو',
    description: 'Online shopping promotion for Pakistani audience',
    native_description: 'پاکستانی سامعین کے لیے آن لائن شاپنگ پروموشن',
    category: 'marketing',
    region_code: 'pakistan',
    language_code: 'ur-PK',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok', 'instagram', 'facebook'],
    cultural_notes: 'Daraz, COD preference, Eid shopping, family bundles',
    style_preset: { rtl: true, mobile_first: true, ecommerce: true }
  },
  {
    name: 'Educational Content - Urdu',
    native_name: 'تعلیمی مواد - اردو',
    description: 'Educational content for Pakistan',
    native_description: 'پاکستان کے لیے تعلیمی مواد',
    category: 'educational',
    region_code: 'pakistan',
    language_code: 'ur-PK',
    primary_model: 'alibaba_avatar',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'website'],
    cultural_notes: 'Formal Urdu, academic focus, exam preparation',
    style_preset: { rtl: true, educational: true, formal: true }
  },
  {
    name: 'Food Business - Urdu',
    native_name: 'کھانے کا کاروبار - اردو',
    description: 'Food business promotion for Pakistan',
    native_description: 'پاکستان کے لیے فوڈ بزنس پروموشن',
    category: 'food_business',
    region_code: 'pakistan',
    language_code: 'ur-PK',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'tiktok', 'whatsapp'],
    cultural_notes: 'Halal focus, biryani, nihari, street food culture',
    style_preset: { rtl: true, mobile_first: true, food: true }
  },
];

// ============================================
// BANGLADESH TEMPLATES
// ============================================
const BANGLADESH_TEMPLATES = [
  {
    name: 'Product Demo - Bangla',
    native_name: 'পণ্য ডেমো - বাংলা',
    description: 'Product demonstration for Bangladesh market',
    native_description: 'বাংলাদেশ মার্কেটের জন্য পণ্য প্রদর্শন',
    category: 'marketing',
    region_code: 'bangladesh',
    language_code: 'bn-BD',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['facebook', 'youtube_shorts', 'tiktok'],
    cultural_notes: 'Dhaka-centric, bKash integration, Bengali pride, garment industry',
    style_preset: { mobile_first: true, aspect: '9:16' }
  },
  {
    name: 'E-commerce - Bangla',
    native_name: 'ই-কমার্স - বাংলা',
    description: 'E-commerce for Bangladesh',
    native_description: 'বাংলাদেশের জন্য ই-কমার্স',
    category: 'marketing',
    region_code: 'bangladesh',
    language_code: 'bn-BD',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['facebook', 'instagram'],
    cultural_notes: 'Daraz Bangladesh, f-commerce, bKash payments',
    style_preset: { mobile_first: true, ecommerce: true }
  },
  {
    name: 'SMB Promo - Bangla',
    native_name: 'এসএমবি প্রোমো - বাংলা',
    description: 'Small business promotion for Bangladesh',
    native_description: 'বাংলাদেশের জন্য ছোট ব্যবসার প্রচার',
    category: 'smb',
    region_code: 'bangladesh',
    language_code: 'bn-BD',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['facebook', 'whatsapp'],
    cultural_notes: 'Local businesses, mobile-first audience, social commerce',
    style_preset: { mobile_first: true, local: true }
  },
];

// ============================================
// INDONESIA / SEA TEMPLATES
// ============================================
const INDONESIA_TEMPLATES = [
  {
    name: 'Product Launch - Bahasa Indonesia',
    native_name: 'Peluncuran Produk - Indonesia',
    description: 'Product launch for Indonesian market',
    native_description: 'Peluncuran produk untuk pasar Indonesia',
    category: 'marketing',
    region_code: 'sea',
    language_code: 'id-ID',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok', 'instagram', 'youtube_shorts'],
    cultural_notes: 'Tokopedia/Shopee ecosystem, influencer culture, halal-friendly',
    style_preset: { mobile_first: true, aspect: '9:16' }
  },
  {
    name: 'UMKM Digital - Bahasa Indonesia',
    native_name: 'UMKM Digital',
    description: 'SME digital transformation for Indonesia',
    native_description: 'Transformasi digital UMKM untuk Indonesia',
    category: 'smb',
    region_code: 'sea',
    language_code: 'id-ID',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'tiktok', 'whatsapp'],
    cultural_notes: 'Warung culture, GoPay/OVO payments, local entrepreneurship',
    style_preset: { mobile_first: true, local: true }
  },
  {
    name: 'Food Business - Bahasa Indonesia',
    native_name: 'Bisnis Makanan - Indonesia',
    description: 'Food business for Indonesian market',
    native_description: 'Bisnis makanan untuk pasar Indonesia',
    category: 'food_business',
    region_code: 'sea',
    language_code: 'id-ID',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok', 'instagram', 'gofood'],
    cultural_notes: 'Warung, street food, halal certified, GoFood/GrabFood',
    style_preset: { mobile_first: true, food: true }
  },
  {
    name: 'E-commerce - Bahasa Indonesia',
    native_name: 'E-commerce - Indonesia',
    description: 'E-commerce content for Indonesia',
    native_description: 'Konten e-commerce untuk Indonesia',
    category: 'marketing',
    region_code: 'sea',
    language_code: 'id-ID',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok_shop', 'shopee', 'tokopedia'],
    cultural_notes: 'Live shopping, flash sales, COD popular, ramadan sales',
    style_preset: { mobile_first: true, ecommerce: true }
  },
];

// ============================================
// AFRICA TEMPLATES
// ============================================
const AFRICA_TEMPLATES = [
  // Swahili
  {
    name: 'Product Launch - Swahili',
    native_name: 'Uzinduzi wa Bidhaa - Kiswahili',
    description: 'Product launch for East Africa (Kenya, Tanzania)',
    native_description: 'Uzinduzi wa bidhaa kwa Afrika Mashariki',
    category: 'marketing',
    region_code: 'africa',
    language_code: 'sw-KE',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok', 'instagram', 'youtube_shorts'],
    cultural_notes: 'M-Pesa integration, vibrant colors, community focus, Nairobi tech hub',
    style_preset: { mobile_first: true, aspect: '9:16' }
  },
  {
    name: 'SMB Promo - Swahili',
    native_name: 'Promosheni SMB - Kiswahili',
    description: 'Small business promotion for East Africa',
    native_description: 'Ukuzaji wa biashara ndogo Afrika Mashariki',
    category: 'smb',
    region_code: 'africa',
    language_code: 'sw-KE',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['whatsapp', 'facebook', 'instagram'],
    cultural_notes: 'Jua Kali businesses, M-Pesa payments, community trust',
    style_preset: { mobile_first: true, local: true }
  },
  // Nigerian English / Pidgin
  {
    name: 'Product Launch - Nigerian English',
    native_name: 'Product Launch - Naija Style',
    description: 'Product launch for Nigerian market',
    native_description: 'Product launch for our Naija people',
    category: 'marketing',
    region_code: 'africa',
    language_code: 'en-NG',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok', 'instagram', 'youtube_shorts'],
    cultural_notes: 'Lagos-centric, Afrobeats energy, Nollywood inspiration, vibrant',
    style_preset: { mobile_first: true, aspect: '9:16', vibrant: true }
  },
  {
    name: 'Fintech - Nigerian',
    native_name: 'Fintech - Nigeria',
    description: 'Fintech and mobile banking for Nigeria',
    native_description: 'Fintech and mobile money for Naija',
    category: 'fintech',
    region_code: 'africa',
    language_code: 'en-NG',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'linkedin', 'twitter'],
    cultural_notes: 'Paystack, Flutterwave, mobile banking revolution, Lagos fintech hub',
    style_preset: { fintech: true, professional: true }
  },
  // Yoruba
  {
    name: 'Cultural Content - Yoruba',
    native_name: 'Àṣà Yorùbá',
    description: 'Cultural content for Yoruba speakers',
    native_description: 'Àkóónú àṣà fún àwọn tí ń sọ èdè Yorùbá',
    category: 'heritage',
    region_code: 'africa',
    language_code: 'yo-NG',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'facebook'],
    cultural_notes: 'Yoruba heritage, Osun festival, traditional patterns, Nollywood',
    style_preset: { cultural: true, heritage: true }
  },
  // Amharic (Ethiopia)
  {
    name: 'Business Promo - Amharic',
    native_name: 'የንግድ ማስተዋወቂያ - አማርኛ',
    description: 'Business promotion for Ethiopian market',
    native_description: 'ለኢትዮጵያ ገበያ የንግድ ማስተዋወቂያ',
    category: 'marketing',
    region_code: 'africa',
    language_code: 'am-ET',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['telegram', 'youtube', 'facebook'],
    cultural_notes: 'Ethiopian calendar, coffee culture, Addis Ababa tech scene',
    style_preset: { mobile_first: true }
  },
];

// ============================================
// EUROPE TEMPLATES
// ============================================
const EUROPE_TEMPLATES = [
  // German
  {
    name: 'Product Demo - German',
    native_name: 'Produktdemo - Deutsch',
    description: 'Product demonstration for DACH market',
    native_description: 'Produktdemonstration für den DACH-Markt',
    category: 'marketing',
    region_code: 'europe',
    language_code: 'de-DE',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['linkedin', 'youtube', 'xing'],
    cultural_notes: 'Precision, quality focus, professional tone, GDPR compliant',
    style_preset: { professional: true, quality: true }
  },
  {
    name: 'Corporate Training - German',
    native_name: 'Unternehmensschulung - Deutsch',
    description: 'Corporate training for German enterprises',
    native_description: 'Unternehmensschulung für deutsche Unternehmen',
    category: 'corporate',
    region_code: 'europe',
    language_code: 'de-DE',
    primary_model: 'alibaba_avatar',
    tts_provider: 'elevenlabs',
    target_platform: ['lms', 'teams'],
    cultural_notes: 'Formal Sie form, structured content, efficiency focus',
    style_preset: { formal: true, corporate: true }
  },
  // French
  {
    name: 'Product Launch - French',
    native_name: 'Lancement de Produit - Français',
    description: 'Product launch for French market',
    native_description: 'Lancement de produit pour le marché français',
    category: 'marketing',
    region_code: 'europe',
    language_code: 'fr-FR',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['linkedin', 'youtube', 'twitter'],
    cultural_notes: 'Elegant design, sophistication, French luxury aesthetic',
    style_preset: { elegant: true, sophisticated: true }
  },
  {
    name: 'Beauty/Fashion - French',
    native_name: 'Beauté/Mode - Français',
    description: 'Beauty and fashion content for France',
    native_description: 'Contenu beauté et mode pour la France',
    category: 'marketing',
    region_code: 'europe',
    language_code: 'fr-FR',
    primary_model: 'sora2',
    tts_provider: 'elevenlabs',
    target_platform: ['instagram', 'tiktok', 'youtube'],
    cultural_notes: 'Paris fashion, haute couture, skincare, luxury brands',
    style_preset: { luxury: true, fashion: true }
  },
  // Italian
  {
    name: 'Product Showcase - Italian',
    native_name: 'Vetrina Prodotti - Italiano',
    description: 'Product showcase for Italian market',
    native_description: 'Vetrina prodotti per il mercato italiano',
    category: 'marketing',
    region_code: 'europe',
    language_code: 'it-IT',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['instagram', 'youtube', 'linkedin'],
    cultural_notes: 'Made in Italy, artisanal quality, design excellence, La Dolce Vita',
    style_preset: { artisanal: true, design: true }
  },
  // Spanish (Spain)
  {
    name: 'Corporate Video - Spanish (Spain)',
    native_name: 'Vídeo Corporativo - Español',
    description: 'Corporate video for Spanish market',
    native_description: 'Vídeo corporativo para el mercado español',
    category: 'corporate',
    region_code: 'europe',
    language_code: 'es-ES',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['linkedin', 'youtube', 'website'],
    cultural_notes: 'Castilian Spanish, European business culture, professional',
    style_preset: { corporate: true, professional: true }
  },
];

// ============================================
// LATAM TEMPLATES
// ============================================
const LATAM_TEMPLATES = [
  // Mexican Spanish
  {
    name: 'Product Launch - Mexican Spanish',
    native_name: 'Lanzamiento de Producto - Español MX',
    description: 'Product launch for Mexican market',
    native_description: 'Lanzamiento de producto para el mercado mexicano',
    category: 'marketing',
    region_code: 'latam',
    language_code: 'es-MX',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['tiktok', 'instagram', 'youtube_shorts'],
    cultural_notes: 'Mexican slang, vibrant colors, Day of the Dead aesthetic options',
    style_preset: { mobile_first: true, aspect: '9:16', vibrant: true }
  },
  {
    name: 'SMB Tiendita - Mexican Spanish',
    native_name: 'Tiendita Digital - Español MX',
    description: 'Local store digital presence',
    native_description: 'Presencia digital de tiendita local',
    category: 'smb',
    region_code: 'latam',
    language_code: 'es-MX',
    primary_model: 'modelslab_flux',
    tts_provider: 'elevenlabs',
    target_platform: ['whatsapp', 'facebook', 'instagram'],
    cultural_notes: 'Tiendita culture, OXXO competition, community service',
    style_preset: { mobile_first: true, local: true }
  },
  // Brazilian Portuguese
  {
    name: 'Product Demo - Brazilian Portuguese',
    native_name: 'Demo de Produto - Português BR',
    description: 'Product demonstration for Brazilian market',
    native_description: 'Demonstração de produto para o mercado brasileiro',
    category: 'marketing',
    region_code: 'latam',
    language_code: 'pt-BR',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['tiktok', 'instagram', 'youtube_shorts'],
    cultural_notes: 'Brazilian Portuguese, Mercado Livre, PIX payments, carnival energy',
    style_preset: { mobile_first: true, aspect: '9:16', vibrant: true }
  },
  {
    name: 'E-commerce - Brazilian Portuguese',
    native_name: 'E-commerce - Português BR',
    description: 'E-commerce content for Brazil',
    native_description: 'Conteúdo de e-commerce para o Brasil',
    category: 'marketing',
    region_code: 'latam',
    language_code: 'pt-BR',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['instagram', 'tiktok', 'youtube'],
    cultural_notes: 'PIX instant payments, Black Friday Brazil, Mercado Livre',
    style_preset: { ecommerce: true, mobile_first: true }
  },
  // Argentine Spanish
  {
    name: 'Startup Pitch - Argentine Spanish',
    native_name: 'Pitch de Startup - Español AR',
    description: 'Startup pitch for Argentine market',
    native_description: 'Pitch de startup para el mercado argentino',
    category: 'corporate',
    region_code: 'latam',
    language_code: 'es-AR',
    primary_model: 'vertex_veo',
    tts_provider: 'elevenlabs',
    target_platform: ['linkedin', 'youtube'],
    cultural_notes: 'Buenos Aires startup scene, voseo, tech innovation',
    style_preset: { tech: true, startup: true }
  },
];

// ============================================
// CJK MOBILE-FIRST TEMPLATES
// ============================================
const CJK_MOBILE_TEMPLATES = [
  // China
  {
    name: 'Douyin Product Demo - Chinese',
    native_name: '抖音产品演示 - 中文',
    description: 'Short-form product demo for Douyin',
    native_description: '抖音短视频产品演示',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'zh-CN',
    primary_model: 'alibaba_wan',
    tts_provider: 'qwen3_tts',
    target_platform: ['douyin', 'kuaishou', 'xiaohongshu'],
    cultural_notes: '9:16 vertical, fast-paced, trending music, hashtag challenges',
    style_preset: { mobile_first: true, aspect: '9:16', social: true }
  },
  {
    name: 'Xiaohongshu Review - Chinese',
    native_name: '小红书种草 - 中文',
    description: 'Product review for Xiaohongshu',
    native_description: '小红书平台产品种草',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'zh-CN',
    primary_model: 'alibaba_avatar',
    tts_provider: 'qwen3_tts',
    target_platform: ['xiaohongshu'],
    cultural_notes: 'Lifestyle aesthetic, authentic reviews, beauty/fashion focus',
    style_preset: { mobile_first: true, lifestyle: true }
  },
  // Japan
  {
    name: 'TikTok Japan - Japanese',
    native_name: 'TikTok日本 - 日本語',
    description: 'TikTok content for Japan',
    native_description: '日本向けTikTokコンテンツ',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'ja-JP',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok', 'instagram'],
    cultural_notes: 'Kawaii aesthetic, anime influences, trending sounds',
    style_preset: { mobile_first: true, aspect: '9:16', kawaii: true }
  },
  // Korea
  {
    name: 'Reels Korea - Korean',
    native_name: '릴스 코리아 - 한국어',
    description: 'Instagram Reels for Korean market',
    native_description: '한국 시장을 위한 인스타그램 릴스',
    category: 'marketing',
    region_code: 'cjk',
    language_code: 'ko-KR',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'tiktok', 'youtube_shorts'],
    cultural_notes: 'K-pop aesthetics, trendy, idol-inspired, pastel colors',
    style_preset: { mobile_first: true, aspect: '9:16', kpop: true }
  },
];

// ============================================
// MENA / SAUDI TEMPLATES
// ============================================
const MENA_MOBILE_TEMPLATES = [
  {
    name: 'Saudi Vision 2030',
    native_name: 'رؤية السعودية 2030',
    description: 'Saudi Vision 2030 transformation story',
    native_description: 'قصة تحول رؤية المملكة العربية السعودية 2030',
    category: 'vision',
    region_code: 'mena',
    language_code: 'ar-SA',
    primary_model: 'sora2',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'twitter', 'linkedin'],
    cultural_notes: 'NEOM, entertainment sector, tourism, economic diversification',
    style_preset: { rtl: true, documentary: true, vision: true }
  },
  {
    name: 'TikTok MENA - Arabic',
    native_name: 'تيك توك الشرق الأوسط - عربي',
    description: 'TikTok content for Arab world',
    native_description: 'محتوى تيك توك للعالم العربي',
    category: 'marketing',
    region_code: 'mena',
    language_code: 'ar',
    primary_model: 'vertex_veo',
    tts_provider: 'azure_neural',
    target_platform: ['tiktok', 'instagram', 'snapchat'],
    cultural_notes: 'RTL text, modest content, family-friendly, ramadan specials',
    style_preset: { rtl: true, mobile_first: true, aspect: '9:16' }
  },
  {
    name: 'E-commerce - Gulf Arabic',
    native_name: 'التجارة الإلكترونية - الخليجي',
    description: 'E-commerce for Gulf region',
    native_description: 'التجارة الإلكترونية لمنطقة الخليج',
    category: 'marketing',
    region_code: 'mena',
    language_code: 'ar-AE',
    primary_model: 'modelslab_flux',
    tts_provider: 'azure_neural',
    target_platform: ['instagram', 'snapchat', 'noon'],
    cultural_notes: 'Noon/Amazon.ae, luxury shopping, same-day delivery',
    style_preset: { rtl: true, luxury: true, ecommerce: true }
  },
];

// ============================================
// PODCAST/WEBCAST TEMPLATES
// ============================================
const PODCAST_WEBCAST_TEMPLATES = [
  {
    name: 'Podcast Intro - Universal',
    native_name: 'Podcast Introduction',
    description: 'Podcast intro template with audio waveform',
    native_description: 'Podcast introduction with professional audio visualization',
    category: 'podcast',
    region_code: 'global',
    language_code: 'en',
    primary_model: 'modelslab_flux',
    tts_provider: 'elevenlabs',
    target_platform: ['spotify', 'apple_podcasts', 'youtube'],
    cultural_notes: 'Audio waveform visualization, professional studio look, engaging',
    style_preset: { podcast: true, audio_visual: true }
  },
  {
    name: 'Webcast Corporate - Universal',
    native_name: 'Corporate Webcast',
    description: 'Professional corporate webcast template',
    native_description: 'Professional webcast for corporate events',
    category: 'webcast',
    region_code: 'global',
    language_code: 'en',
    primary_model: 'alibaba_avatar',
    tts_provider: 'elevenlabs',
    target_platform: ['zoom', 'teams', 'youtube_live'],
    cultural_notes: 'Professional presenter, corporate branding, Q&A ready',
    style_preset: { webcast: true, corporate: true }
  },
  {
    name: 'Interview Podcast - Hindi',
    native_name: 'इंटरव्यू पॉडकास्ट - हिंदी',
    description: 'Interview podcast for Hindi audience',
    native_description: 'हिंदी दर्शकों के लिए इंटरव्यू पॉडकास्ट',
    category: 'podcast',
    region_code: 'india',
    language_code: 'hi-IN',
    primary_model: 'alibaba_avatar',
    tts_provider: 'azure_neural',
    target_platform: ['youtube', 'spotify', 'jiosaavn'],
    cultural_notes: 'Conversational Hindi, celebrity interviews, trending topics',
    style_preset: { podcast: true, interview: true }
  },
  {
    name: 'Tech Webcast - Chinese',
    native_name: '科技直播 - 中文',
    description: 'Technology webcast for Chinese audience',
    native_description: '面向中国观众的科技直播',
    category: 'webcast',
    region_code: 'cjk',
    language_code: 'zh-CN',
    primary_model: 'alibaba_avatar',
    tts_provider: 'qwen3_tts',
    target_platform: ['bilibili', 'douyu', 'huya'],
    cultural_notes: 'Tech launches, live demos, interactive Q&A, danmaku-ready',
    style_preset: { webcast: true, tech: true }
  },
];

// ============================================
// MAIN SERVE FUNCTION
// ============================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { region, category } = await req.json().catch(() => ({}));

    console.log('🌍 Seeding mobile-first regional templates...');

    // Combine all templates
    const ALL_TEMPLATES = [
      ...INDIAN_REGIONAL_TEMPLATES,
      ...INDIAN_SMB_TEMPLATES,
      ...PAKISTAN_TEMPLATES,
      ...BANGLADESH_TEMPLATES,
      ...INDONESIA_TEMPLATES,
      ...AFRICA_TEMPLATES,
      ...EUROPE_TEMPLATES,
      ...LATAM_TEMPLATES,
      ...CJK_MOBILE_TEMPLATES,
      ...MENA_MOBILE_TEMPLATES,
      ...PODCAST_WEBCAST_TEMPLATES,
    ];

    // Filter by region/category if specified
    let templatesToSeed = ALL_TEMPLATES;
    if (region) {
      templatesToSeed = templatesToSeed.filter(t => t.region_code === region);
    }
    if (category) {
      templatesToSeed = templatesToSeed.filter(t => t.category === category);
    }

    console.log(`📋 Processing ${templatesToSeed.length} templates`);

    let inserted = 0;
    let skipped = 0;

    for (const template of templatesToSeed) {
      // Check if exists
      const { data: existing } = await supabase
        .from('video_blueprints')
        .select('id')
        .eq('name', template.name)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const ttsConfig = TTS_ROUTING[template.region_code as keyof typeof TTS_ROUTING] || TTS_ROUTING.western;

      const { error } = await supabase.from('video_blueprints').insert({
        name: template.name,
        description: template.description,
        category: template.category,
        is_active: true,
        primary_model: template.primary_model,
        secondary_models: ['azure_neural', 'modelslab_flux'],
        ai_capabilities: [
          { type: 'video', provider: template.primary_model },
          { type: 'tts', provider: ttsConfig.primary, fallback: ttsConfig.fallback },
        ],
        industry_tags: [template.region_code, template.category],
        target_platform: template.target_platform,
        estimated_duration_seconds: 60,
        style_preset: {
          ...template.style_preset,
          native_name: template.native_name,
          native_description: template.native_description,
          language_code: template.language_code,
          region_code: template.region_code,
          cultural_notes: template.cultural_notes,
          tts_provider: ttsConfig.primary,
          tts_fallback: ttsConfig.fallback,
        },
      });

      if (error) {
        console.error(`❌ Failed to insert ${template.name}:`, error.message);
      } else {
        inserted++;
      }
    }

    // Queue thumbnails for new templates
    const { data: missingThumbnails } = await supabase
      .from('video_blueprints')
      .select('id, name, category, style_preset')
      .is('thumbnail_url', null)
      .eq('is_active', true);

    if (missingThumbnails && missingThumbnails.length > 0) {
      const queueItems = missingThumbnails.map(t => ({
        blueprint_id: t.id,
        prompt: `Professional video thumbnail for ${t.name}`,
        status: 'pending',
        region: t.style_preset?.region_code || 'global',
        attempts: 0,
      }));

      // Insert in batches to avoid conflicts
      for (let i = 0; i < queueItems.length; i += 50) {
        const batch = queueItems.slice(i, i + 50);
        await supabase.from('thumbnail_generation_queue').upsert(batch, {
          onConflict: 'blueprint_id',
          ignoreDuplicates: true,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        total: templatesToSeed.length,
        thumbnails_queued: missingThumbnails?.length || 0,
        tts_routing: TTS_ROUTING,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding templates:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
