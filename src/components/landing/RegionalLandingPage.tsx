/**
 * REGIONAL LANDING PAGE
 * 
 * Fully transcreated landing page per region.
 * Renders region-specific content: hero, providers, industries, language demo, pricing, SEO.
 * English is always present alongside native language content.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, Play, Sparkles, Globe, Brain, Cpu, Zap, Eye, Mic, Languages, Layers, Wand2, Video, Image, FileText, AudioLines,
  Box, Palette, Volume2, Subtitles, MonitorPlay, VolumeX, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRegionalLandingNarration } from '@/hooks/useRegionalLandingNarration';
import { useGeoNarrationResolver } from '@/hooks/useGeoNarrationResolver';
import { useRegionalLandingContent } from '@/hooks/useRegionalLandingContent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  REGIONAL_CONFIGS, 
  detectRegionFromTimezone, 
  getAllRegionSlugs,
  type RegionSlug, 
  type RegionalConfig 
} from '@/config/regionalLandingConfig';
import { RegionalPricingSection } from '@/components/landing/RegionalPricingSection';
import { ProfessionalAvatarShowcase } from '@/components/landing/video/ProfessionalAvatarShowcase';
import { ProductDetailShowcase } from '@/components/landing/ProductDetailShowcase';
import { DogfoodingProof } from '@/components/landing/DogfoodingProof';
import { IndustryShowcases } from '@/components/landing/IndustryShowcases';
import { RegionSwitcherNav } from '@/components/landing/RegionSwitcherNav';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';
// Region-specific hero backgrounds — all 4 slides per region
import heroRegionNam from '@/assets/hero-region-nam.jpg';
import heroNamPipeline from '@/assets/hero-nam-pipeline.jpg';
import heroNamLanguages from '@/assets/hero-nam-languages.jpg';
import heroNamTranscreation from '@/assets/hero-nam-transcreation.jpg';

import heroRegionEurope from '@/assets/hero-region-europe.jpg';
import heroEuropePipeline from '@/assets/hero-europe-pipeline.jpg';
import heroEuropeLanguages from '@/assets/hero-europe-languages.jpg';
import heroEuropeTranscreation from '@/assets/hero-europe-transcreation.jpg';

import heroRegionMena from '@/assets/hero-region-mena.jpg';
import heroMenaPipeline from '@/assets/hero-mena-pipeline.jpg';
import heroMenaLanguages from '@/assets/hero-mena-languages.jpg';
import heroMenaTranscreation from '@/assets/hero-mena-transcreation.jpg';

import heroRegionIndia from '@/assets/hero-region-india.jpg';
import heroIndiaPipeline from '@/assets/hero-india-pipeline.jpg';
import heroIndiaLanguages from '@/assets/hero-india-languages.jpg';
import heroIndiaTranscreation from '@/assets/hero-india-transcreation.jpg';

import heroRegionAfrica from '@/assets/hero-region-africa.jpg';
import heroAfricaPipeline from '@/assets/hero-africa-pipeline.jpg';
import heroAfricaLanguages from '@/assets/hero-africa-languages.jpg';
import heroAfricaTranscreation from '@/assets/hero-africa-transcreation.jpg';

import heroRegionApac from '@/assets/hero-region-apac.jpg';
import heroApacPipeline from '@/assets/hero-apac-pipeline.jpg';
import heroApacLanguages from '@/assets/hero-apac-languages.jpg';
import heroApacTranscreation from '@/assets/hero-apac-transcreation.jpg';

import heroRegionLatam from '@/assets/hero-region-latam.jpg';
import heroLatamPipeline from '@/assets/hero-latam-pipeline.jpg';
import heroLatamLanguages from '@/assets/hero-latam-languages.jpg';
import heroLatamTranscreation from '@/assets/hero-latam-transcreation.jpg';

import heroRegionCaribbean from '@/assets/hero-region-caribbean.jpg';
import heroCaribbeanPipeline from '@/assets/hero-caribbean-pipeline.jpg';
import heroCaribbeanLanguages from '@/assets/hero-caribbean-languages.jpg';
import heroCaribbeanTranscreation from '@/assets/hero-caribbean-transcreation.jpg';

const REGION_HERO_IMAGES: Record<RegionSlug, string[]> = {
  nam: [heroRegionNam, heroNamPipeline, heroNamLanguages, heroNamTranscreation],
  europe: [heroRegionEurope, heroEuropePipeline, heroEuropeLanguages, heroEuropeTranscreation],
  mena: [heroRegionMena, heroMenaPipeline, heroMenaLanguages, heroMenaTranscreation],
  india: [heroRegionIndia, heroIndiaPipeline, heroIndiaLanguages, heroIndiaTranscreation],
  africa: [heroRegionAfrica, heroAfricaPipeline, heroAfricaLanguages, heroAfricaTranscreation],
  apac: [heroRegionApac, heroApacPipeline, heroApacLanguages, heroApacTranscreation],
  latam: [heroRegionLatam, heroLatamPipeline, heroLatamLanguages, heroLatamTranscreation],
  caribbean: [heroRegionCaribbean, heroCaribbeanPipeline, heroCaribbeanLanguages, heroCaribbeanTranscreation],
  // P0 regions — alias to closest primary
  oceania: [heroRegionNam, heroNamPipeline, heroNamLanguages, heroNamTranscreation],
  turkey: [heroRegionEurope, heroEuropePipeline, heroEuropeLanguages, heroEuropeTranscreation],
  // P1 regions — alias to closest primary
  pakistan: [heroRegionIndia, heroIndiaPipeline, heroIndiaLanguages, heroIndiaTranscreation],
  bangladesh: [heroRegionIndia, heroIndiaPipeline, heroIndiaLanguages, heroIndiaTranscreation],
  eastern_europe: [heroRegionEurope, heroEuropePipeline, heroEuropeLanguages, heroEuropeTranscreation],
  central_asia: [heroRegionNam, heroNamPipeline, heroNamLanguages, heroNamTranscreation],
};

// ============================================
// SEO HEAD COMPONENT
// ============================================
const RegionalSEOHead: React.FC<{ config: RegionalConfig; currentSlug: string }> = ({ config, currentSlug }) => {
  const allSlugs = getAllRegionSlugs();
  const baseUrl = 'https://cgat-patient-hcp-care-ecosystem.lovable.app';
  
  return (
    <Helmet>
      <html lang={config.seo.hreflang} dir={config.hero.isRTL ? 'rtl' : 'ltr'} />
      <title>{config.seo.title}</title>
      <meta name="description" content={config.seo.description} />
      <meta name="keywords" content={config.seo.keywords.join(', ')} />
      <meta property="og:title" content={config.seo.title} />
      <meta property="og:description" content={config.seo.description} />
      <meta property="og:locale" content={config.seo.ogLocale} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${baseUrl}/genie-landing/${currentSlug}`} />
      <link rel="canonical" href={`${baseUrl}/genie-landing/${currentSlug}`} />
      {/* Hreflang tags for all regions */}
      {allSlugs.map(slug => (
        <link 
          key={slug}
          rel="alternate" 
          hrefLang={REGIONAL_CONFIGS[slug].seo.hreflang} 
          href={`${baseUrl}/genie-landing/${slug}`} 
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/genie-landing`} />
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Genie Suite',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          description: config.seo.description,
          url: `${baseUrl}/genie-landing/${currentSlug}`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier with 50 credits',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1200',
          },
          availableLanguage: config.languageShowcase.languages.map(l => l.name),
        })}
      </script>
    </Helmet>
  );
};

// ============================================
// AI PROVIDER LOGOS — Real brand logos ribbon
// ============================================
import geminiLogo from '@/assets/logos/providers/gemini.svg';
import openaiLogo from '@/assets/logos/providers/openai.svg';
import anthropicLogo from '@/assets/logos/providers/anthropic.png';
import azureLogo from '@/assets/logos/providers/azure.svg';
import meshyLogo from '@/assets/logos/providers/meshy-official.png';
import elevenlabsLogo from '@/assets/logos/providers/elevenlabs-official.png';
import deeplLogo from '@/assets/logos/providers/deepl.svg';
import alibabaLogo from '@/assets/logos/providers/alibaba.jpg';
import modelslabLogo from '@/assets/logos/providers/modelslab.jpg';
import deepgramLogo from '@/assets/logos/providers/deepgram.png';
import deepseekLogo from '@/assets/logos/providers/deepseek.png';
import gcpLogo from '@/assets/logos/providers/gcp-official.png';
import replicateLogo from '@/assets/logos/providers/replicate.png';
import json2videoLogo from '@/assets/logos/providers/json2video.png';
import supabaseLogo from '@/assets/logos/providers/supabase.svg';

const PROVIDER_SHOWCASE = [
  { label: 'Gemini 3 Pro', logo: geminiLogo, capability: 'Image & LLM' },
  { label: 'Vertex / GCP', logo: gcpLogo, capability: 'Video Gen' },
  { label: 'Claude 4', logo: anthropicLogo, capability: 'Transcreation' },
  { label: 'GPT-4o', logo: openaiLogo, capability: 'Content AI' },
  { label: 'Meshy AI', logo: meshyLogo, capability: '3D Models' },
  { label: 'Azure Neural', logo: azureLogo, capability: 'TTS & Lipsync' },
  { label: 'ElevenLabs', logo: elevenlabsLogo, capability: 'Voice Clone' },
  { label: 'DeepL', logo: deeplLogo, capability: 'Translation' },
  { label: 'Alibaba Wan', logo: alibabaLogo, capability: 'Avatar Gen' },
  { label: 'ModelsLab', logo: modelslabLogo, capability: 'Animation' },
  { label: 'Deepgram', logo: deepgramLogo, capability: 'STT Nova 2' },
  { label: 'DeepSeek', logo: deepseekLogo, capability: 'Reasoning' },
  { label: 'Replicate', logo: replicateLogo, capability: 'Open Models' },
  { label: 'JSON2Video', logo: json2videoLogo, capability: 'Assembly' },
  { label: 'Supabase', logo: supabaseLogo, capability: 'Backend AI' },
];

const ProviderRibbon: React.FC = () => (
  <div className="relative overflow-hidden py-3">
    <motion.div
      className="flex gap-4 whitespace-nowrap"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
    >
      {[...PROVIDER_SHOWCASE, ...PROVIDER_SHOWCASE].map((p, i) => (
        <div key={`${p.label}-${i}`} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15">
          <img src={p.logo} alt={p.label} className="w-5 h-5 rounded-sm object-contain" />
          <span className="text-xs font-bold text-white/90">{p.label}</span>
          <span className="text-[10px] text-white/40 font-medium">{p.capability}</span>
        </div>
      ))}
    </motion.div>
  </div>
);

// ============================================
// TEMPLATE PREVIEW CARDS — Floating glassmorphic
// ============================================
const TEMPLATE_PREVIEWS = [
  { title: 'Product Launch', style: 'Cinematic 4K', provider: 'Vertex Veo 3', badge: 'Video', color: 'border-sky-500/30' },
  { title: '3D Explainer', style: 'Pixar Quality', provider: 'Meshy AI', badge: '3D', color: 'border-violet-500/30' },
  { title: 'Avatar Presenter', style: 'Photorealistic', provider: 'Alibaba Wan', badge: 'Avatar', color: 'border-amber-500/30' },
  { title: 'Social Reel', style: 'UGC Authentic', provider: 'ModelsLab', badge: 'Animation', color: 'border-pink-500/30' },
];

const FloatingTemplateCards: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  // Only show on large screens to avoid hero text overlap
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden xl:block">
      {TEMPLATE_PREVIEWS.map((tmpl, i) => (
        <motion.div
          key={tmpl.title}
          className={`absolute w-44 bg-black/40 backdrop-blur-lg rounded-xl border ${tmpl.color} p-2.5 shadow-xl`}
          style={{
            right: `${3 + (i % 2) * 8}%`,
            top: `${20 + i * 18}%`,
          }}
          initial={{ opacity: 0, x: 60, scale: 0.8 }}
          animate={{
            opacity: [0, 0.7, 0.6],
            x: [60, 0, 5, 0],
            scale: [0.8, 1, 0.98, 1],
          }}
          transition={{ delay: 1 + i * 0.3, duration: 1.5, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">{tmpl.badge}</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40 font-medium">{tmpl.provider}</span>
          </div>
          <p className="text-xs font-bold text-white/80 mb-1">{tmpl.title}</p>
          <div className="flex items-center gap-1">
            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.5 + i * 0.3, duration: 2 }}
              />
            </div>
            <span className="text-[8px] text-white/30 font-mono">{tmpl.style}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// PIPELINE VISUAL — Cinematic production flow
// ============================================
const PIPELINE_STEPS = [
  { icon: Wand2, label: 'Ideation', provider: 'Gemini 3', color: 'from-violet-500 to-purple-600' },
  { icon: FileText, label: 'Script', provider: 'GPT-4o', color: 'from-emerald-500 to-teal-600' },
  { icon: Mic, label: 'Voice', provider: 'Azure TTS', color: 'from-blue-500 to-indigo-600' },
  { icon: Video, label: 'Video', provider: 'Vertex Veo', color: 'from-sky-500 to-cyan-600' },
  { icon: Box, label: '3D/Avatar', provider: 'Meshy + Wan', color: 'from-amber-500 to-orange-600' },
  { icon: Globe, label: 'Distribute', provider: '140+ Lang', color: 'from-rose-500 to-pink-600' },
];

const CinematicPipeline: React.FC = () => (
  <div className="flex items-center justify-center gap-1 sm:gap-3 pt-8 flex-wrap">
    {PIPELINE_STEPS.map((step, i) => {
      const Icon = step.icon;
      return (
        <React.Fragment key={step.label}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 180, damping: 20 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl relative overflow-hidden`}
              whileHover={{ scale: 1.15, rotate: 5 }}
              animate={{
                boxShadow: [
                  '0 4px 20px rgba(0,0,0,0.3)',
                  '0 12px 40px rgba(0,0,0,0.5)',
                  '0 4px 20px rgba(0,0,0,0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" strokeWidth={1.5} />
            </motion.div>
            <span className="text-xs font-bold text-white/90">{step.label}</span>
            <span className="text-[9px] text-white/40 font-medium">{step.provider}</span>
          </motion.div>
          {i < PIPELINE_STEPS.length - 1 && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
              className="hidden sm:flex items-center mb-8"
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
              >
                <ArrowRight className="w-5 h-5 text-white/30" />
              </motion.div>
            </motion.div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ============================================
// TTS VOICEOVER HOOK — Region-aware
// ============================================
interface VoiceOption {
  code: string;
  label: string;
  nativeLabel: string;
  azureVoice: string;
  flag: string;
}

// Regional voice options — sourced from regionalLandingConfig languageShowcase
const REGION_VOICES: Record<string, VoiceOption[]> = {
  nam: [
    { code: 'en-US', label: 'US English', nativeLabel: 'English', azureVoice: 'en-US-JennyNeural', flag: '🇺🇸' },
    { code: 'en-GB', label: 'British English', nativeLabel: 'English', azureVoice: 'en-GB-SoniaNeural', flag: '🇬🇧' },
    { code: 'es-MX', label: 'Mexican Spanish', nativeLabel: 'Español', azureVoice: 'es-MX-DaliaNeural', flag: '🇲🇽' },
    { code: 'fr-CA', label: 'Canadian French', nativeLabel: 'Français', azureVoice: 'fr-CA-SylvieNeural', flag: '🇨🇦' },
  ],
  europe: [
    { code: 'en-GB', label: 'English', nativeLabel: 'English', azureVoice: 'en-GB-SoniaNeural', flag: '🇬🇧' },
    { code: 'de-DE', label: 'German', nativeLabel: 'Deutsch', azureVoice: 'de-DE-KatjaNeural', flag: '🇩🇪' },
    { code: 'fr-FR', label: 'French', nativeLabel: 'Français', azureVoice: 'fr-FR-DeniseNeural', flag: '🇫🇷' },
    { code: 'es-ES', label: 'Spanish', nativeLabel: 'Español', azureVoice: 'es-ES-ElviraNeural', flag: '🇪🇸' },
    { code: 'it-IT', label: 'Italian', nativeLabel: 'Italiano', azureVoice: 'it-IT-ElsaNeural', flag: '🇮🇹' },
  ],
  mena: [
    { code: 'ar-MSA', label: 'MSA (Formal)', nativeLabel: 'فصحى', azureVoice: 'ar-SA-ZariyahNeural', flag: '📖' },
    { code: 'ar-SA', label: 'Saudi', nativeLabel: 'سعودي', azureVoice: 'ar-SA-HamedNeural', flag: '🇸🇦' },
    { code: 'ar-AE', label: 'Gulf/UAE', nativeLabel: 'خليجي', azureVoice: 'ar-AE-HamdanNeural', flag: '🇦🇪' },
    { code: 'ar-EG', label: 'Egyptian', nativeLabel: 'مصري', azureVoice: 'ar-EG-ShakirNeural', flag: '🇪🇬' },
    { code: 'ar-LB', label: 'Levantine', nativeLabel: 'لبناني', azureVoice: 'ar-LB-LaylaNeural', flag: '🇱🇧' },
    { code: 'ar-IQ', label: 'Iraqi', nativeLabel: 'عراقي', azureVoice: 'ar-IQ-BasselNeural', flag: '🇮🇶' },
    { code: 'ar-MA', label: 'Maghrebi', nativeLabel: 'مغربي', azureVoice: 'ar-MA-JamalNeural', flag: '🇲🇦' },
    { code: 'tr-TR', label: 'Turkish', nativeLabel: 'Türkçe', azureVoice: 'tr-TR-EmelNeural', flag: '🇹🇷' },
    { code: 'he-IL', label: 'Hebrew', nativeLabel: 'עברית', azureVoice: 'he-IL-AvriNeural', flag: '🇮🇱' },
    { code: 'ur-PK', label: 'Urdu', nativeLabel: 'اردو', azureVoice: 'ur-PK-AsadNeural', flag: '🇵🇰' },
  ],
  india: [
    { code: 'hi-IN', label: 'Hindi', nativeLabel: 'हिंदी', azureVoice: 'hi-IN-MadhurNeural', flag: '🇮🇳' },
    { code: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்', azureVoice: 'ta-IN-ValluvarNeural', flag: '🇮🇳' },
    { code: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు', azureVoice: 'te-IN-ShrutiNeural', flag: '🇮🇳' },
    { code: 'bn-IN', label: 'Bengali', nativeLabel: 'বাংলা', azureVoice: 'bn-IN-BashkarNeural', flag: '🇮🇳' },
    { code: 'mr-IN', label: 'Marathi', nativeLabel: 'मराठी', azureVoice: 'mr-IN-AarohiNeural', flag: '🇮🇳' },
    { code: 'kn-IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', azureVoice: 'kn-IN-SapnaNeural', flag: '🇮🇳' },
    { code: 'ml-IN', label: 'Malayalam', nativeLabel: 'മലയാളം', azureVoice: 'ml-IN-SobhanaNeural', flag: '🇮🇳' },
    { code: 'gu-IN', label: 'Gujarati', nativeLabel: 'ગુજરાતી', azureVoice: 'gu-IN-DhwaniNeural', flag: '🇮🇳' },
    { code: 'as-IN', label: 'Assamese', nativeLabel: 'অসমীয়া', azureVoice: 'as-IN-PriyomNeural', flag: '🇮🇳' },
  ],
  africa: [
    { code: 'en-KE', label: 'English', nativeLabel: 'English', azureVoice: 'en-KE-AsiliaNeural', flag: '🇰🇪' },
    { code: 'sw-KE', label: 'Swahili', nativeLabel: 'Kiswahili', azureVoice: 'sw-KE-ZuriNeural', flag: '🇰🇪' },
    { code: 'fr-FR', label: 'French', nativeLabel: 'Français', azureVoice: 'fr-FR-DeniseNeural', flag: '🇫🇷' },
    { code: 'am-ET', label: 'Amharic', nativeLabel: 'አማርኛ', azureVoice: 'am-ET-MekdesNeural', flag: '🇪🇹' },
  ],
  apac: [
    { code: 'ja-JP', label: 'Japanese', nativeLabel: '日本語', azureVoice: 'ja-JP-NanamiNeural', flag: '🇯🇵' },
    { code: 'zh-CN', label: 'Chinese', nativeLabel: '中文', azureVoice: 'zh-CN-XiaoxiaoNeural', flag: '🇨🇳' },
    { code: 'ko-KR', label: 'Korean', nativeLabel: '한국어', azureVoice: 'ko-KR-SunHiNeural', flag: '🇰🇷' },
    { code: 'id-ID', label: 'Indonesian', nativeLabel: 'Bahasa', azureVoice: 'id-ID-GadisNeural', flag: '🇮🇩' },
    { code: 'th-TH', label: 'Thai', nativeLabel: 'ไทย', azureVoice: 'th-TH-PremwadeeNeural', flag: '🇹🇭' },
  ],
  latam: [
    { code: 'es-MX', label: 'Spanish', nativeLabel: 'Español', azureVoice: 'es-MX-DaliaNeural', flag: '🇲🇽' },
    { code: 'pt-BR', label: 'Portuguese', nativeLabel: 'Português', azureVoice: 'pt-BR-FranciscaNeural', flag: '🇧🇷' },
    { code: 'en-US', label: 'English', nativeLabel: 'English', azureVoice: 'en-US-JennyNeural', flag: '🇺🇸' },
  ],
  caribbean: [
    { code: 'en-US', label: 'English', nativeLabel: 'English', azureVoice: 'en-US-JennyNeural', flag: '🇺🇸' },
    { code: 'es-MX', label: 'Spanish', nativeLabel: 'Español', azureVoice: 'es-MX-DaliaNeural', flag: '🇲🇽' },
    { code: 'fr-FR', label: 'French', nativeLabel: 'Français', azureVoice: 'fr-FR-DeniseNeural', flag: '🇫🇷' },
  ],
};

const useHeroVoiceover = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string, langCode?: string, regionSlug?: string, slideId?: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;
    setIsSpeaking(true);

    const effectiveLang = langCode || 'en-US';
    const cacheKey = `${regionSlug || 'unknown'}_${slideId || 'slide'}_${effectiveLang}`;

    try {
      // Step 1: Check DB cache first
      let audioBase64: string | null = null;

      try {
        const { data: cached } = await supabase
          .from('tts_audio_cache')
          .select('audio_base64')
          .eq('cache_key', cacheKey)
          .maybeSingle();

        if (cached?.audio_base64) {
          console.log(`[Hero TTS] Cache HIT: ${cacheKey}`);
          audioBase64 = cached.audio_base64;
        }
      } catch {
        // Cache miss or error — proceed to live API
      }

      // Step 2: If no cache, call live API via Supabase client
      if (!audioBase64) {
        console.log(`[Hero TTS] Cache MISS: ${cacheKey}, calling API...`);
        const { data, error } = await supabase.functions.invoke('dialect-tts-demo', {
          body: {
            action: 'custom_tts',
            text,
            languageCode: effectiveLang,
          },
        });

        if (error) throw new Error(`TTS failed: ${error.message}`);
        audioBase64 = data?.audioContent || data?.audio_base64 || data?.audioBase64;
        if (!audioBase64) throw new Error('No audio returned');

        // Step 3: Save to cache (fire & forget — don't block playback)
        if (regionSlug && slideId) {
          // Fire & forget cache write — don't block playback
          (async () => {
            try {
              await supabase
                .from('tts_audio_cache')
                .upsert({
                  cache_key: cacheKey,
                  region_slug: regionSlug,
                  slide_id: slideId,
                  lang_code: effectiveLang,
                  audio_base64: audioBase64!,
                  text_hash: btoa(text.slice(0, 100)),
                }, { onConflict: 'cache_key' });
              console.log(`[Hero TTS] Cached: ${cacheKey}`);
            } catch { /* cache write failed — non-critical */ }
          })();
        }
      }

      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
      audio.src = audioUrl;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
};

// ============================================
// UNIFIED HERO CAROUSEL — Cinematic Enterprise
// ============================================
const HeroCarousel: React.FC<{ config: RegionalConfig; productContext?: string | null; regionSlug?: RegionSlug }> = ({ config, productContext, regionSlug = 'nam' }) => {
  const { hero, stats, cta } = config;
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const { speak, stop, isSpeaking } = useHeroVoiceover();
  const [showVoicePicker, setShowVoicePicker] = React.useState(false);
  const voiceOptions = REGION_VOICES[regionSlug] || REGION_VOICES.nam;
  const [selectedVoice, setSelectedVoice] = React.useState(voiceOptions[0]);
  // Track whether per-slide audio is playing (manual-only, no auto-play)
  const [isSlideAudioPlaying, setIsSlideAudioPlaying] = React.useState(false);

  // ── Auto-detect sub-region via IP + timezone with VPN protection ──
  const { 
    subRegionCode: autoSubRegion, 
    vpnDetected, 
    riskScore: geoRiskScore,
    bypassReasons: geoBypassReasons,
  } = useGeoNarrationResolver();

  // ── DB-driven regional narration (approved scripts + pre-generated TTS) ──
  // Pass auto-detected sub-region for precise narration; null if VPN detected (falls back to parent)
  const { 
    script: dbNarrationScript, 
    ttsAudio: dbTtsAudio, 
    playNarration: playDbNarration, 
    stopNarration: stopDbNarration, 
    isPlaying: isDbPlaying 
  } = useRegionalLandingNarration(regionSlug, autoSubRegion || undefined);

  const heroImages = REGION_HERO_IMAGES[regionSlug] || REGION_HERO_IMAGES.nam;

  const slides = [
    {
      id: 'platform',
      badge: `${hero.flag} ${productContext ? `Genie ${productContext.charAt(0).toUpperCase() + productContext.slice(1)} for ${hero.regionName}` : config.differentiators.heroBadge}`,
      headline: [hero.englishHeadline.split('—')[0]?.trim() + ' — ', hero.regionName],
      subtitle: hero.englishSubheadline,
      description: `${LANDING_METRICS.aiProviders} AI providers · ${LANDING_METRICS.pipelines} pipelines · ${LANDING_METRICS.languages} languages · ${LANDING_METRICS.industries} industries. The world's only all-in-one AI content production suite — from idea to published, region-ready media.`,
      type: 'platform' as const,
    },
    {
      id: 'mind-to-media',
      badge: `${hero.flag} Mind to Media — ${hero.regionName}`,
      headline: ['One Prompt. ', `${hero.regionName}-Ready Content.`],
      subtitle: 'Minutes, Not Months. Zero Agencies.',
      description: `Script, voice, avatar, 3D, video, translation — all generated from a single prompt, culturally tuned for ${hero.regionName} and its sub-regions. ${LANDING_METRICS.pipelines} pipelines. No plugins. No exports. No waiting.`,
      type: 'pipeline' as const,
    },
    {
      id: 'language',
      badge: `${hero.flag} ${LANDING_METRICS.languages} Languages · ${LANDING_METRICS.dialects} Dialects · ${LANDING_METRICS.regions} Regions`,
      headline: ['Your Language. ', 'Your Market.'],
      subtitle: hero.nativeHeadline,
      description: `Not translation — transcreation. We adapt tone, idioms, humor, and cultural context so ${hero.regionName} audiences feel you were built for them. ${LANDING_METRICS.arabicDialects} Arabic dialects. ${LANDING_METRICS.indianLanguages} Indian languages. RTL-native. Zone-routed AI.`,
      type: 'stats' as const,
    },
    {
      id: 'transcreation',
      badge: `${hero.flag} AI Transcreation Engine`,
      headline: ['Meaning, ', 'Not Just Words.'],
      subtitle: `Cultural Intelligence at Scale for ${hero.regionName}.`,
      description: `Translation converts words. Transcreation converts intent, emotion, and cultural context — powered by ${LANDING_METRICS.aiProviders} zone-routed AI models. Same video, ${LANDING_METRICS.languages} culturally authentic versions.`,
      type: 'comparison' as const,
    },
  ];

  // ── Audio is manual-only — NO auto-play on page load ──
  // Users click the play button to start narration

  // Carousel auto-advance: pause only during per-slide audio
  React.useEffect(() => {
    if (isSlideAudioPlaying) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [slides.length, isSlideAudioPlaying]);

  // Track when per-slide audio finishes
  React.useEffect(() => {
    if (isSlideAudioPlaying && !isSpeaking && !isDbPlaying) {
      setIsSlideAudioPlaying(false);
    }
  }, [isSpeaking, isDbPlaying, isSlideAudioPlaying]);
  

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const slide = slides[current];

  return (
    <section className={`relative min-h-[100vh] overflow-hidden ${hero.isRTL ? 'rtl' : 'ltr'}`}>
      {/* Full-bleed hero image background with Ken Burns motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-img-${current}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <motion.img
            src={heroImages[current]}
            alt=""
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.06] }}
            transition={{ duration: 12, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          />
          {/* Gradient overlay — lighter to keep hero images visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Animated mesh gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
          animate={{ x: ['-10%', '60%', '-10%'], y: ['10%', '50%', '10%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, hsl(200, 80%, 60%) 0%, transparent 70%)' }}
          animate={{ x: ['10%', '-50%', '10%'], y: ['-10%', '-40%', '-10%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Ambient rising particles — reduced for performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${10 + i * 11}%`,
              top: `${75 + (i % 3) * 8}%`,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -250],
            }}
            transition={{
              duration: 5 + i * 0.8,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Floating template preview cards (on platform slide) */}
      <FloatingTemplateCards visible={current === 0} />

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 pt-28 pb-20 flex flex-col items-center justify-center min-h-[85vh] z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: direction * 80, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 50, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-6 w-full"
          >
            {/* Badge — Large & High Visibility */}
            <motion.div initial={{ opacity: 0, y: -15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}>
              <Badge className="bg-primary/20 backdrop-blur-xl border-2 border-primary/40 text-white text-base md:text-lg px-6 py-3 shadow-2xl shadow-primary/30 font-bold tracking-wide">
                {slide.badge}
              </Badge>
            </motion.div>

            {/* Headline — massive cinematic type with strong drop-shadow */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, type: 'spring', stiffness: 100 }}
            >
              <span className="text-white">{slide.headline[0]}</span>
              <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {slide.headline[1]}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              {slide.subtitle}
            </motion.p>

            <motion.p
              className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            >
              {slide.description}
            </motion.p>

            {/* === SLIDE-SPECIFIC CONTENT === */}

            {/* Platform slide — Stats + CTAs */}
            {slide.type === 'platform' && (
              <motion.div className="space-y-6 pt-4" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                  {[
                    { value: stats.audienceReach, label: 'Audience Reach' },
                    { value: stats.dialects || stats.languages, label: stats.dialects ? 'Dialects' : 'Languages' },
                    { value: stats.costSavings || '60%+', label: 'Cost Savings' },
                    { value: stats.localMetric?.value || 'N/A', label: stats.localMetric?.label || 'Local Metric' },
                  ].filter(s => s.value).map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-4 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
                      whileHover={{ y: -4, scale: 1.04 }}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.45 + i * 0.08, type: 'spring', stiffness: 180 }}
                    >
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                      <p className="text-[11px] text-white/70 font-semibold">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
                {/* HIGH-VISIBILITY CTAs */}
                <div className="flex flex-wrap gap-4 justify-center pt-3">
                  <Link to="/genie-studio-auth?tab=signup">
                    <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 hover:from-primary/90 hover:via-blue-400 hover:to-cyan-400 text-white font-bold shadow-[0_8px_32px_rgba(59,130,246,0.5)] text-lg px-10 py-7 rounded-xl border border-white/20 tracking-wide">
                        {cta.primary}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                  <a href="#products" onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" variant="outline" className="border-2 border-white/60 text-foreground bg-background/80 font-bold hover:bg-background hover:border-primary text-lg px-10 py-7 rounded-xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <Play className="mr-2 h-5 w-5" />
                        {cta.secondary}
                      </Button>
                    </motion.div>
                  </a>
                </div>
                <p className="text-white/50 text-xs font-medium">{cta.freeCredits}</p>
              </motion.div>
            )}

            {/* Pipeline slide — Cinematic flow */}
            {slide.type === 'pipeline' && <CinematicPipeline />}

            {/* Stats / Language slide */}
            {slide.type === 'stats' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
                {[
                  { value: LANDING_METRICS.languages, label: 'Languages', icon: Languages, glow: 'shadow-blue-500/30' },
                  { value: LANDING_METRICS.dialects, label: 'Dialects', icon: Mic, glow: 'shadow-violet-500/30' },
                  { value: String(LANDING_METRICS.regions), label: 'Regions', icon: Globe, glow: 'shadow-emerald-500/30' },
                  { value: `${LANDING_METRICS.subRegions}+`, label: 'Sub-Regions', icon: Eye, glow: 'shadow-amber-500/30' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className={`text-center p-6 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-primary/50 transition-all group shadow-xl ${stat.glow}`}
                      initial={{ opacity: 0, y: 30, rotateX: -20 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.25 + i * 0.12, type: 'spring', stiffness: 150 }}
                      whileHover={{ y: -6, scale: 1.06 }}
                    >
                      <Icon className="w-6 h-6 text-white/50 mx-auto mb-3 group-hover:text-primary transition-colors" />
                      <p className="text-4xl font-black text-white">{stat.value}</p>
                      <p className="text-xs text-white/60 font-semibold mt-1">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Comparison / Transcreation slide */}
            {slide.type === 'comparison' && (
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6">
                <motion.div
                  className="p-7 bg-red-950/40 backdrop-blur-xl rounded-2xl border border-red-500/25 text-left space-y-3 relative overflow-hidden"
                  initial={{ opacity: 0, x: -40, rotateY: -10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/15 rounded-full blur-3xl" />
                  <p className="text-sm font-bold text-red-400 uppercase tracking-wider">❌ Translation</p>
                  <p className="text-white font-semibold text-lg drop-shadow-md">"Our product helps you save time and money."</p>
                  <p className="text-xs text-white/50 italic">Word-for-word. Literal. Generic. No cultural context.</p>
                  <div className="flex gap-1.5 pt-2">
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-red-500/15 text-red-300/80 border border-red-500/25 font-semibold">DeepL Only</span>
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-red-500/15 text-red-300/80 border border-red-500/25 font-semibold">No Context</span>
                  </div>
                </motion.div>
                <motion.div
                  className="p-7 bg-emerald-950/40 backdrop-blur-xl rounded-2xl border border-primary/35 text-left space-y-3 relative overflow-hidden ring-1 ring-primary/15"
                  initial={{ opacity: 0, x: 40, rotateY: 10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.45, type: 'spring' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 rounded-full blur-3xl" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 15, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-primary/50" />
                  </motion.div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wider">✅ Transcreation</p>
                  <p className="text-white font-semibold text-lg drop-shadow-md" dir="rtl">"لأن وقتك أغلى من أي استثمار"</p>
                  <p className="text-xs text-white/50 italic" dir="ltr">Culturally adapted. Emotionally resonant. Market-ready.</p>
                  <div className="flex gap-1.5 pt-2">
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-primary/15 text-primary/80 border border-primary/25 font-semibold">Gemini 3 Pro</span>
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-primary/15 text-primary/80 border border-primary/25 font-semibold">Zone-Routed</span>
                    <span className="text-[9px] px-2.5 py-1 rounded-full bg-primary/15 text-primary/80 border border-primary/25 font-semibold">MENA</span>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* TTS Voiceover Widget — fixed bottom-right with dialect picker */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
        {/* Dialect picker dropdown */}
        <AnimatePresence>
          {showVoicePicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl max-h-64 overflow-y-auto min-w-[200px]"
            >
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider px-3 py-1.5">
                {hero.regionName} — Select Language
              </p>
              {voiceOptions.map((voice) => (
                <button
                  key={voice.code}
                  onClick={() => {
                    setSelectedVoice(voice);
                    setShowVoicePicker(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                    selectedVoice.code === voice.code
                      ? 'bg-primary/20 border border-primary/40'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{voice.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{voice.label}</p>
                    <p className="text-[10px] text-white/50">{voice.nativeLabel}</p>
                  </div>
                  {selectedVoice.code === voice.code && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/30 text-primary font-bold">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice controls row */}
        <div className="flex items-center gap-2">
          {/* Language selector chip */}
          <motion.button
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-black/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVoicePicker(!showVoicePicker)}
          >
            <span>{selectedVoice.flag}</span>
            <span>{selectedVoice.nativeLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showVoicePicker ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Play/Stop button — prefers DB narration TTS, falls back to real-time */}
          <motion.button
            className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-[0_4px_24px_rgba(59,130,246,0.5)] border-2 border-white/20 hover:shadow-[0_8px_40px_rgba(59,130,246,0.6)] transition-shadow"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowVoicePicker(false);
              const isAnyPlaying = isSpeaking || isDbPlaying;
              if (isAnyPlaying) {
                // Stop ALL audio sources to prevent parallel playback
                stop();
                stopDbNarration();
                setIsSlideAudioPlaying(false);
              } else {
                // Stop any lingering audio first, then start fresh
                stop();
                stopDbNarration();
                setIsSlideAudioPlaying(true);
                // If DB narration has pre-generated TTS audio, play it
                if (dbTtsAudio?.audio_url || dbNarrationScript?.generated_audio_url) {
                  playDbNarration();
                } else {
                  // Fallback to real-time TTS generation for slide content
                  speak(`${slide.headline.join('')}. ${slide.subtitle}. ${slide.description}`, selectedVoice.code, regionSlug, slide.id);
                }
              }
            }}
            title={(isSpeaking || isDbPlaying) ? 'Stop voiceover' : `Listen in ${selectedVoice.label}`}
          >
            {(isSpeaking || isDbPlaying) ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <VolumeX className="w-6 h-6" />
              </motion.div>
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* DB Narration info badge — shows when pre-generated TTS is available */}
      {dbNarrationScript && (dbTtsAudio?.audio_url || dbNarrationScript.generated_audio_url) && (
        <div className="fixed bottom-44 right-6 z-50">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/70 backdrop-blur-xl rounded-xl border border-primary/30 px-3 py-2 max-w-[220px]"
          >
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider mb-0.5">
              🎙 Pre-Generated Narration
            </p>
            <p className="text-[10px] text-white/80 line-clamp-2">
              {dbNarrationScript.hook?.slice(0, 80)}…
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {dbTtsAudio?.tts_provider && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary/80 border border-primary/25 font-semibold">
                  {dbTtsAudio.tts_provider}
                </span>
              )}
              {dbTtsAudio?.tts_locale && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/15 font-semibold">
                  {dbTtsAudio.tts_locale}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Provider ribbon — continuously scrolling */}
      <div className="absolute bottom-28 left-0 right-0 z-20">
        <ProviderRibbon />
      </div>

      {/* Navigation dots with labels */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5 z-20">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="group flex flex-col items-center gap-1.5"
          >
            <span className={`text-[10px] font-bold transition-all duration-300 ${
              i === current ? 'text-white opacity-100' : 'text-white/0 group-hover:text-white/60 opacity-0 group-hover:opacity-100'
            }`}>
              {['Platform', 'Pipeline', 'Languages', 'Transcreation'][i]}
            </span>
            <div className="relative">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-14 bg-gradient-to-r from-primary to-cyan-400 shadow-lg shadow-primary/50' : 'w-3 bg-white/25 group-hover:bg-white/50'
              }`} />
              {i === current && (
                <motion.div
                  className="absolute inset-0 h-2.5 rounded-full bg-primary/30"
                  animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
// RegionalIndustries removed — consolidated into IndustryShowcases component

// ============================================
// TranscreationShowcase removed — consolidated into EverythingYouNeedSection

// ============================================
// CONSISTENT METRICS — Single source of truth
// ============================================
const LANDING_METRICS = {
  regions: 15,
  subRegions: 60,
  languages: '140+',
  dialects: '50+',
  aiProviders: 19,
  pipelines: 206,
  industries: '50+',
  arabicDialects: 7,
  indianLanguages: 22,
} as const;

// ============================================
// REGION NAVIGATOR — Auto-scrolling marquee with parent/child hierarchy
// ============================================

import { REGION_HIERARCHY } from '@/config/regionHierarchy';

// Primary 8 region slugs only (no expansion aliases that duplicate content)
const PRIMARY_REGION_SLUGS: RegionSlug[] = ['nam', 'europe', 'mena', 'india', 'africa', 'apac', 'latam', 'caribbean'];

// Build parent region items from REGION_HIERARCHY
interface ParentMarqueeItem {
  flag: string;
  name: string;
  childCount: number;
  langHint?: string;
  slug?: RegionSlug;
}

interface SubRegionMarqueeItem {
  flag: string;
  name: string;
  subCount: number;
}

const SLUG_BY_GROUP: Record<string, RegionSlug | undefined> = {
  NAM: 'nam', EU: 'europe', LATAM: 'latam', MENA: 'mena',
  AFRICA: 'africa', INDIA: 'india', SEA: 'apac', CJK: 'apac',
  OCEANIA: 'oceania', TURKEY: 'turkey', CARIBBEAN: 'caribbean',
  PAKISTAN: 'pakistan', BANGLADESH: 'bangladesh', EURASIA: 'eastern_europe',
  CENTRAL_ASIA: 'central_asia', SOUTH_ASIA: undefined,
};

// Row 1: Parent regions — deduplicated by slug so groups sharing a landing page
// (e.g., SEA + CJK → apac) appear only once. Groups with no slug are skipped.
const PARENT_MARQUEE: ParentMarqueeItem[] = (() => {
  const seen = new Set<string>();
  const items: ParentMarqueeItem[] = [];
  for (const g of REGION_HIERARCHY) {
    const slug = SLUG_BY_GROUP[g.groupCode];
    if (!slug) continue; // skip groups with no landing page
    if (seen.has(slug)) continue; // skip duplicate slugs (e.g., CJK after SEA both → apac)
    seen.add(slug);
    const cfg = REGIONAL_CONFIGS[slug];
    items.push({
      flag: cfg?.hero.flag ?? g.groupFlag,
      name: cfg?.hero.regionName ?? g.groupName,
      childCount: g.children.length,
      langHint: cfg?.stats.languages,
      slug,
    });
  }
  return items;
})();

// Row 2: Leaf-only sub-regions (no parent+child duplication)
// If a zone has grandchildren, show ONLY the grandchildren (leaf countries).
// If a zone has no children, show the zone itself.
// Deduplicate by name to avoid cross-group overlaps (e.g., Georgia in both EURASIA & CENTRAL_ASIA).
const SUB_REGION_MARQUEE: SubRegionMarqueeItem[] = (() => {
  const seen = new Set<string>();
  const items: SubRegionMarqueeItem[] = [];
  for (const g of REGION_HIERARCHY) {
    for (const child of g.children) {
      if (child.children && child.children.length > 0) {
        // Has grandchildren → show only leaf countries
        for (const gc of child.children) {
          if (!seen.has(gc.name)) {
            seen.add(gc.name);
            items.push({ flag: gc.flag, name: gc.name, subCount: 0 });
          }
        }
      } else {
        // Leaf zone → show the zone itself
        if (!seen.has(child.name)) {
          seen.add(child.name);
          items.push({ flag: child.flag, name: child.name, subCount: 0 });
        }
      }
    }
  }
  return items;
})();

const RegionNavigator: React.FC<{ currentSlug: RegionSlug }> = ({ currentSlug }) => {
  return (
    <section className="py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-5 px-4">
          <Globe className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-foreground">
            {LANDING_METRICS.regions} Global Regions · {LANDING_METRICS.subRegions}+ Sub-Regions · {LANDING_METRICS.languages} Languages
          </span>
          <Globe className="w-5 h-5 text-primary" />
        </div>

        {/* Row 1: Parent regions — scrolls left to right, pauses on hover */}
        <div className="marquee-container relative overflow-hidden mb-3">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          <div className="marquee-track-left flex gap-3 py-2" style={{ width: 'max-content' }}>
            {[...PARENT_MARQUEE, ...PARENT_MARQUEE, ...PARENT_MARQUEE].map((item, i) => {
              const isActive = item.slug === currentSlug;
              return (
                <Link
                  key={`p-${i}`}
                  to={item.slug ? `/genie-landing/${item.slug}` : '#'}
                  className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/30'
                      : 'bg-card border-2 border-primary/20 text-foreground hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <span className="text-xl leading-none">{item.flag}</span>
                  <span className="whitespace-nowrap">{item.name}</span>
                  {item.childCount > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                    }`}>
                      {item.childCount} zones
                    </span>
                  )}
                  {item.langHint && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                      isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-accent/10 text-accent-foreground/70'
                    }`}>
                      {item.langHint} langs
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Row 2: Sub-regions + countries — scrolls right to left, pauses on hover */}
        <div className="marquee-container relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          <div className="marquee-track-right flex gap-2.5 py-2" style={{ width: 'max-content' }}>
            {[...SUB_REGION_MARQUEE, ...SUB_REGION_MARQUEE, ...SUB_REGION_MARQUEE].map((item, i) => (
              <span
                key={`s-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-muted/60 border border-border/40 text-muted-foreground shrink-0 hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap"
              >
                <span className="text-sm leading-none">{item.flag}</span>
                <span>{item.name}</span>
                {item.subCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary font-bold">
                    {item.subCount}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Quick-jump: only primary 8 regions (no duplicates) */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 px-4">
          {PRIMARY_REGION_SLUGS.map((slug) => {
            const r = REGIONAL_CONFIGS[slug];
            const isActive = slug === currentSlug;
            return (
              <Link
                key={slug}
                to={`/genie-landing/${slug}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card/80 border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <span className="leading-none">{r.hero.flag}</span>
                <span>{r.hero.regionName}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA FOOTER
// ============================================
const RegionalCTAFooter: React.FC<{ config: RegionalConfig }> = ({ config }) => (
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-background" />
    <div className="relative max-w-4xl mx-auto px-4 text-center">
      <Badge variant="outline" className="mb-6 border-primary/40 text-primary">
        <Globe className="h-3 w-3 mr-1" />
        Ready for {config.hero.regionName}
      </Badge>
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
        Your Audience Deserves Content
        <br />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          That Feels Like Home.
        </span>
      </h2>
      
      <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
        {LANDING_METRICS.languages} languages across {LANDING_METRICS.dialects} dialects. {LANDING_METRICS.industries} industries. {LANDING_METRICS.regions} regions. From idea to global distribution.
      </p>
      <p className="text-lg text-primary font-semibold mb-8">
        💰 {config.comparisonSavings}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <Link to="/genie-studio-auth?tab=signup">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-lg px-8 py-6">
            {config.cta.primary}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/support">
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
            Schedule a Guided Demo
          </Button>
        </Link>
      </div>

      <p className="text-muted-foreground text-sm mb-2">
        <Link to="/genie-studio-auth" className="text-primary hover:underline font-medium">
          {config.cta.signIn}
        </Link>
      </p>
      <p className="text-muted-foreground text-sm">{config.cta.freeCredits}</p>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-border">
        <div className="flex justify-center items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-bold text-foreground">Genie Suite</span>
          <span className="text-muted-foreground">© 2026</span>
        </div>
      </div>
    </div>
  </section>
);

// ============================================
// NAVBAR
// ============================================
const RegionalNavbar: React.FC<{ config: RegionalConfig }> = ({ config }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/genie-landing" className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Genie Suite
          </span>
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#products" className="text-muted-foreground hover:text-foreground transition">Products</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
          <Link to="/explore">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Explore
            </Button>
          </Link>
          <RegionSwitcherNav variant="navbar" />
          <Link to="/genie-studio-auth">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              {config.cta.primary}
            </Button>
          </Link>
        </div>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              <a href="#products" onClick={() => setMobileOpen(false)} className="text-foreground font-medium py-2">Products</a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-foreground font-medium py-2">Pricing</a>
              <Link to="/explore" onClick={() => setMobileOpen(false)} className="text-foreground font-medium py-2">Explore</Link>
              <Link to="/genie-studio-auth" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                  {config.cta.primary}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ============================================
// MAIN COMPONENT — Unified Landing Page
// ============================================
// Slug → DB region code mapping
const SLUG_TO_REGION_CODE: Record<string, string> = {
  nam: 'NAM', europe: 'WESTERN', mena: 'MENA', india: 'IND',
  africa: 'AFR', apac: 'APAC', latam: 'LATAM', caribbean: 'CARIB',
  oceania: 'WESTERN', turkey: 'TURKEY', pakistan: 'IND',
  bangladesh: 'IND', eastern_europe: 'EUR_EASTERN', central_asia: 'MENA',
};

export const RegionalLandingPage: React.FC = () => {
  const { region } = useParams<{ region: string }>();
  const [searchParams] = useSearchParams();
  const productContext = searchParams.get('product');
  const [activeProduct, setActiveProduct] = useState('studio');

  // Validate region slug
  const regionSlug = region as RegionSlug;
  const config = REGIONAL_CONFIGS[regionSlug];

  // Phase A3: DB-driven content with fallback to constants
  const dbRegionCode = SLUG_TO_REGION_CODE[regionSlug] || 'WESTERN';
  const { content: dbContent, variants: dbVariants, fallbackTier, deviceType, isRTL: dbIsRTL } = useRegionalLandingContent(dbRegionCode);

  if (!config) {
    // Auto-detect and redirect
    const detected = detectRegionFromTimezone();
    return <Navigate to={`/genie-landing/${detected}`} replace />;
  }

  // Merge DB content over hardcoded config when available (DB wins)
  const mergedConfig: RegionalConfig = dbContent ? {
    ...config,
    hero: {
      ...config.hero,
      englishHeadline: dbContent.headline || config.hero.englishHeadline,
      englishSubheadline: dbContent.subheadline || config.hero.englishSubheadline,
      isRTL: dbContent.rtl_enabled ?? config.hero.isRTL,
    },
    cta: {
      ...config.cta,
      primary: dbContent.cta_primary_text || config.cta.primary,
      secondary: dbContent.cta_secondary_text || config.cta.secondary,
    },
    welcomeScript: dbContent.welcome_script || config.welcomeScript,
  } : config;

  // Use device-aware variants for mobile headlines when DB content exists
  const heroHeadline = deviceType === 'mobile' && dbVariants
    ? dbVariants.headlineMobile
    : mergedConfig.hero.englishHeadline;

  const heroSubheadline = deviceType === 'mobile' && dbVariants
    ? dbVariants.subheadlineMobile
    : mergedConfig.hero.englishSubheadline;

  return (
    <main className={`min-h-screen bg-background text-foreground ${mergedConfig.hero.isRTL ? 'rtl' : 'ltr'}`}>
      <RegionalSEOHead config={mergedConfig} currentSlug={regionSlug} />
      <RegionalNavbar config={mergedConfig} />
      <HeroCarousel config={mergedConfig} productContext={productContext} regionSlug={regionSlug} />
      <RegionNavigator currentSlug={regionSlug} />

      {/* Product Ecosystem — 7 Products, 206 Pipelines + Why Genie */}
      <section id="products" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
              7 Products · {LANDING_METRICS.pipelines} Pipelines · {LANDING_METRICS.aiProviders} AI Providers · {LANDING_METRICS.languages} Languages
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              The Genie Suite — Mind to Media
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One platform. Every format. Every language. Every market.
            </p>
          </div>
          <ProductDetailShowcase 
            activeProduct={activeProduct} 
            onProductChange={setActiveProduct} 
          />

          {/* Differentiators moved to hero banner */}
        </div>
      </section>

      {/* Industry Showcases — See It In Action */}
      <IndustryShowcases region={regionSlug} config={mergedConfig} />

      {/* Regional Pricing */}
      <section id="pricing">
        <RegionalPricingSection regionSlug={regionSlug} />
      </section>

      {/* Dogfooding Proof */}
      <DogfoodingProof />
      
      <RegionalCTAFooter config={mergedConfig} />
    </main>
  );
};

export default RegionalLandingPage;
