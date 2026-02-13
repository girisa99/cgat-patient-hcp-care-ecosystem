/**
 * Create Template Dialog - Portal-based dropdowns
 * Uses React Portal to render dropdowns outside dialog for proper z-index and scroll
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  ArrowLeft,
  Wand2,
  Copy,
  Layers,
  Sparkles,
  Globe2,
  Loader2,
  Check,
  Languages,
  Search,
  ChevronDown,
  X,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { useVideoBlueprints } from '@/hooks/useVideoBlueprints';

export interface CreateTemplateInitialContext {
  product?: string;
  audience?: string;
  platform?: string;
  goal?: string;
}

interface CreateTemplateDialogProps {
  onCreated?: () => void;
  templateToClone?: VideoBlueprint | null;
  /** Controlled open state from parent (e.g., SmartTemplateRecommender fallback CTA) */
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
  /** Pre-fill context from SmartTemplateRecommender when no matches found */
  initialContext?: CreateTemplateInitialContext | null;
}

// Categories
const TEMPLATE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing', icon: '📈' },
  { value: 'educational', label: 'Educational', icon: '📚' },
  { value: 'storytelling', label: 'Storytelling', icon: '📖' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'corporate', label: 'Corporate', icon: '🏢' },
  { value: 'animation', label: 'Animation', icon: '🎨' },
  { value: '3d', label: '3D/VR', icon: '🧊' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'interactive', label: 'Interactive', icon: '🎮' },
  { value: 'ppt', label: 'PPT/Slides', icon: '📊' },
  { value: 'smb', label: 'SMB/Local', icon: '🏪' },
  { value: 'oil_gas', label: 'Oil & Gas', icon: '⛽' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'hospitality', label: 'Hospitality', icon: '🍽️' },
  { value: 'consulting', label: 'Consulting', icon: '💼' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'technology', label: 'Technology', icon: '💻' },
];

// Video styles
const VIDEO_STYLES = [
  { value: 'photorealistic', label: 'Photorealistic', icon: '📸' },
  { value: 'hyper_real', label: 'Hyper-Realistic 4K', icon: '🎥' },
  { value: 'product_hero', label: 'Product Hero', icon: '🛍️' },
  { value: 'pixar_disney', label: 'Pixar/Disney', icon: '🎪' },
  { value: 'talking_head', label: 'Talking Head', icon: '👤' },
  { value: 'anime', label: 'Anime', icon: '🎌' },
  { value: 'whiteboard', label: 'Whiteboard', icon: '📝' },
  { value: 'explainer', label: 'Explainer', icon: '💡' },
  { value: 'motion_graphics', label: 'Motion Graphics', icon: '✨' },
  { value: 'documentary', label: 'Documentary', icon: '🎥' },
  { value: 'kinetic_typography', label: 'Kinetic Typography', icon: '📝' },
  { value: 'ppt_animation', label: 'PPT Animation', icon: '📊' },
];

// Platforms
const PLATFORM_OPTIONS = [
  { value: 'tiktok', label: 'TikTok (9:16)', icon: '' },
  { value: 'instagram_reels', label: 'Instagram Reels (9:16)', icon: '' },
  { value: 'instagram_feed', label: 'Instagram Feed (1:1)', icon: '' },
  { value: 'youtube', label: 'YouTube (16:9)', icon: '' },
  { value: 'youtube_shorts', label: 'YouTube Shorts (9:16)', icon: '' },
  { value: 'facebook', label: 'Facebook (16:9)', icon: '' },
  { value: 'linkedin', label: 'LinkedIn (16:9)', icon: '' },
];

// AI Capabilities
const AI_CAPABILITIES = [
  { value: 'text_to_video', label: 'Text-to-Video', icon: '📹' },
  { value: 'image_to_video', label: 'Image-to-Video', icon: '🎞️' },
  { value: '3d_generation', label: '3D Generation', icon: '🧊' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'lipsync', label: 'Lipsync', icon: '👄' },
  { value: 'tts', label: 'TTS Voiceover', icon: '🎙️' },
  { value: 'music_gen', label: 'Music Generation', icon: '🎵' },
  { value: 'video_effects', label: 'Video Effects', icon: '✨' },
];

// Expanded Regions with comprehensive languages
const REGIONS = [
  { value: 'western', label: 'Western/US', icon: '🇺🇸', languages: ['en', 'es_mx', 'es_us', 'fr_ca'] },
  { value: 'europe', label: 'Europe', icon: '🇪🇺', languages: ['en_gb', 'de', 'de_at', 'de_ch', 'fr', 'fr_be', 'fr_ch', 'it', 'es', 'pt_pt', 'nl', 'nl_be', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'el', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'sl', 'hr', 'sr', 'bs', 'mk', 'sq', 'uk', 'be', 'ru', 'ga', 'cy', 'gd', 'mt', 'lb', 'is', 'fo', 'ca', 'gl', 'eu', 'ast'] },
  { value: 'cjk', label: 'CJK', icon: '🇨🇳', languages: ['zh_cn', 'zh_tw', 'zh_hk', 'ja', 'ko', 'mn'] },
  { value: 'india', label: 'India', icon: '🇮🇳', languages: ['hi', 'en_in', 'te', 'kn', 'ta', 'mr', 'bn', 'gu', 'ml', 'pa', 'or', 'as', 'ks', 'ne', 'sd', 'ur', 'si', 'dv', 'bho', 'mai', 'kok', 'doi', 'mni', 'sat'] },
  { value: 'mena', label: 'MENA', icon: '🇸🇦', languages: ['ar_sa', 'ar_eg', 'ar_ae', 'ar_ma', 'ar_dz', 'ar_tn', 'ar_lb', 'ar_jo', 'ar_iq', 'ar_kw', 'ar_bh', 'ar_qa', 'ar_om', 'ar_ye', 'ar_ly', 'ar_sd', 'he', 'fa', 'ps', 'ku', 'tr', 'az'] },
  { value: 'sea', label: 'Southeast Asia', icon: '🇸🇬', languages: ['id', 'ms', 'th', 'vi', 'fil', 'tl', 'my', 'km', 'lo', 'jv', 'su', 'ceb', 'ilo', 'war', 'bcl'] },
  { value: 'latam', label: 'Latin America', icon: '🇧🇷', languages: ['es_ar', 'es_mx', 'es_co', 'es_cl', 'es_pe', 'es_ve', 'es_ec', 'es_bo', 'es_py', 'es_uy', 'es_cr', 'es_pa', 'es_cu', 'es_do', 'es_pr', 'es_gt', 'es_hn', 'es_sv', 'es_ni', 'pt_br', 'ht', 'gn', 'qu', 'ay'] },
  { value: 'africa', label: 'Africa', icon: '🌍', languages: ['en_za', 'en_ng', 'en_ke', 'en_gh', 'af', 'zu', 'xh', 'st', 'tn', 'sw', 'am', 'om', 'ti', 'so', 'ha', 'ig', 'yo', 'rw', 'mg', 'sn', 'nd', 'ny', 'lg'] },
  { value: 'oceania', label: 'Oceania', icon: '🇦🇺', languages: ['en_au', 'en_nz', 'mi', 'sm', 'to', 'fj', 'ty', 'haw'] },
];

// Comprehensive Language names (140+ languages)
const LANGUAGE_NAMES: Record<string, string> = {
  // English variants
  en: 'English (US)', en_us: 'English (US)', en_gb: 'English (UK)', en_au: 'English (Australia)', 
  en_nz: 'English (New Zealand)', en_in: 'English (India)', en_za: 'English (South Africa)',
  en_ng: 'English (Nigeria)', en_ke: 'English (Kenya)', en_gh: 'English (Ghana)',
  // Spanish variants
  es: 'Spanish (Spain)', es_mx: 'Spanish (Mexico)', es_us: 'Spanish (US)', es_ar: 'Spanish (Argentina)',
  es_co: 'Spanish (Colombia)', es_cl: 'Spanish (Chile)', es_pe: 'Spanish (Peru)', es_ve: 'Spanish (Venezuela)',
  es_ec: 'Spanish (Ecuador)', es_bo: 'Spanish (Bolivia)', es_py: 'Spanish (Paraguay)', es_uy: 'Spanish (Uruguay)',
  es_cr: 'Spanish (Costa Rica)', es_pa: 'Spanish (Panama)', es_cu: 'Spanish (Cuba)', es_do: 'Spanish (Dominican Rep)',
  es_pr: 'Spanish (Puerto Rico)', es_gt: 'Spanish (Guatemala)', es_hn: 'Spanish (Honduras)',
  es_sv: 'Spanish (El Salvador)', es_ni: 'Spanish (Nicaragua)',
  // Portuguese variants
  pt: 'Portuguese', pt_br: 'Portuguese (Brazil)', pt_pt: 'Portuguese (Portugal)',
  // French variants
  fr: 'French (France)', fr_ca: 'French (Canada)', fr_be: 'French (Belgium)', fr_ch: 'French (Switzerland)',
  // German variants
  de: 'German (Germany)', de_at: 'German (Austria)', de_ch: 'German (Switzerland)',
  // Chinese variants
  zh: 'Chinese', zh_cn: 'Chinese (Simplified)', zh_tw: 'Chinese (Traditional)', zh_hk: 'Chinese (Hong Kong)',
  // Arabic variants (7 dialects)
  ar: 'Arabic (Standard)', ar_sa: 'Arabic (Saudi)', ar_eg: 'Arabic (Egyptian)', ar_ae: 'Arabic (UAE)',
  ar_ma: 'Arabic (Moroccan)', ar_dz: 'Arabic (Algerian)', ar_tn: 'Arabic (Tunisian)', ar_lb: 'Arabic (Lebanese)',
  ar_jo: 'Arabic (Jordanian)', ar_iq: 'Arabic (Iraqi)', ar_kw: 'Arabic (Kuwaiti)', ar_bh: 'Arabic (Bahraini)',
  ar_qa: 'Arabic (Qatari)', ar_om: 'Arabic (Omani)', ar_ye: 'Arabic (Yemeni)', ar_ly: 'Arabic (Libyan)',
  ar_sd: 'Arabic (Sudanese)',
  // Dutch variants
  nl: 'Dutch (Netherlands)', nl_be: 'Dutch (Belgium/Flemish)',
  // European languages
  it: 'Italian', pl: 'Polish', cs: 'Czech', sk: 'Slovak', hu: 'Hungarian',
  ro: 'Romanian', bg: 'Bulgarian', el: 'Greek', sv: 'Swedish', da: 'Danish',
  no: 'Norwegian', fi: 'Finnish', et: 'Estonian', lv: 'Latvian', lt: 'Lithuanian',
  sl: 'Slovenian', hr: 'Croatian', sr: 'Serbian', bs: 'Bosnian', mk: 'Macedonian',
  sq: 'Albanian', uk: 'Ukrainian', be: 'Belarusian', ru: 'Russian',
  ga: 'Irish', cy: 'Welsh', gd: 'Scottish Gaelic', mt: 'Maltese', lb: 'Luxembourgish',
  is: 'Icelandic', fo: 'Faroese', ca: 'Catalan', gl: 'Galician', eu: 'Basque', ast: 'Asturian',
  // CJK
  ja: 'Japanese', ko: 'Korean', mn: 'Mongolian',
  // Indian languages (24+)
  hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ta: 'Tamil', mr: 'Marathi', bn: 'Bengali',
  gu: 'Gujarati', ml: 'Malayalam', pa: 'Punjabi', or: 'Odia', as: 'Assamese',
  ks: 'Kashmiri', ne: 'Nepali', sd: 'Sindhi', ur: 'Urdu', si: 'Sinhala', dv: 'Dhivehi',
  bho: 'Bhojpuri', mai: 'Maithili', kok: 'Konkani', doi: 'Dogri', mni: 'Manipuri', sat: 'Santali',
  // MENA
  he: 'Hebrew', fa: 'Persian/Farsi', ps: 'Pashto', ku: 'Kurdish', tr: 'Turkish', az: 'Azerbaijani',
  // Southeast Asian
  id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese', fil: 'Filipino', tl: 'Tagalog',
  my: 'Burmese', km: 'Khmer', lo: 'Lao', jv: 'Javanese', su: 'Sundanese',
  ceb: 'Cebuano', ilo: 'Ilocano', war: 'Waray', bcl: 'Bikol',
  // Latin American indigenous
  ht: 'Haitian Creole', gn: 'Guaraní', qu: 'Quechua', ay: 'Aymara',
  // African languages
  af: 'Afrikaans', zu: 'Zulu', xh: 'Xhosa', st: 'Sotho', tn: 'Tswana',
  sw: 'Swahili', am: 'Amharic', om: 'Oromo', ti: 'Tigrinya', so: 'Somali',
  ha: 'Hausa', ig: 'Igbo', yo: 'Yoruba', rw: 'Kinyarwanda', mg: 'Malagasy',
  sn: 'Shona', nd: 'Ndebele', ny: 'Chewa', lg: 'Luganda',
  // Oceanian
  mi: 'Māori', sm: 'Samoan', to: 'Tongan', fj: 'Fijian', ty: 'Tahitian', haw: 'Hawaiian',
};

// ============================================
// AI Providers - Following Master Routing Registry
// Locked defaults based on 4-zone regional routing
// ============================================
type ProviderCategory = 'video' | 'tts' | 'llm' | 'image' | '3d' | 'avatar' | 'audio';

interface AIProviderEntry {
  value: string;
  label: string;
  icon: string;
  category: ProviderCategory;
  priority: number;
  isDefault: boolean;
  locked?: boolean;
  zones?: string[];
}

const AI_PROVIDERS_REGISTRY: AIProviderEntry[] = [
  // VIDEO GENERATION - Veo 3 → Sora 2 → Wan 2.6
  { value: 'vertex_veo3', label: 'Vertex Veo 3 (P1)', icon: '🎬', category: 'video', priority: 1, isDefault: true, locked: true, zones: ['global'] },
  { value: 'sora2', label: 'Sora 2 (P2)', icon: '🌟', category: 'video', priority: 2, isDefault: true, zones: ['western'] },
  { value: 'alibaba_wan26', label: 'Alibaba Wan 2.6 (P3)', icon: '🌊', category: 'video', priority: 3, isDefault: true, zones: ['cjk'] },
  { value: 'modelslab', label: 'ModelsLab AnimateDiff', icon: '🎞️', category: 'video', priority: 4, isDefault: false },
  { value: 'replicate_svd', label: 'Replicate SVD', icon: '📹', category: 'video', priority: 5, isDefault: false },
  
  // TTS - Azure Neural (Primary) → Qwen3-TTS (CJK)
  { value: 'azure_neural', label: 'Azure Neural TTS (P1)', icon: '🔊', category: 'tts', priority: 1, isDefault: true, locked: true, zones: ['western', 'europe', 'mena', 'india', 'latam', 'africa'] },
  { value: 'alibaba_qwen3_tts', label: 'Alibaba Qwen3-TTS (P1-CJK)', icon: '🗣️', category: 'tts', priority: 1, isDefault: true, zones: ['cjk'] },
  { value: 'elevenlabs', label: 'ElevenLabs (P3)', icon: '🎙️', category: 'tts', priority: 3, isDefault: false },
  { value: 'google_tts', label: 'Google Cloud TTS', icon: '📢', category: 'tts', priority: 4, isDefault: false },
  { value: 'amazon_polly', label: 'Amazon Polly', icon: '🔈', category: 'tts', priority: 5, isDefault: false },
  { value: 'openai_tts', label: 'OpenAI TTS', icon: '🎤', category: 'tts', priority: 6, isDefault: false },

  // LLM - Gemini 3 → GPT-4o → Claude → Qwen → DeepSeek
  { value: 'gemini3_pro', label: 'Gemini 3.0 Pro (P1)', icon: '🔮', category: 'llm', priority: 1, isDefault: true, locked: true, zones: ['global'] },
  { value: 'openai_gpt4o', label: 'OpenAI GPT-4o (P2)', icon: '🧠', category: 'llm', priority: 2, isDefault: true },
  { value: 'claude_35', label: 'Claude 3.5 Sonnet (P3)', icon: '🎭', category: 'llm', priority: 3, isDefault: false },
  { value: 'alibaba_qwen', label: 'Alibaba Qwen-Max (P4)', icon: '🌊', category: 'llm', priority: 4, isDefault: false, zones: ['cjk'] },
  { value: 'deepseek_v3', label: 'DeepSeek V3 (P5)', icon: '🔍', category: 'llm', priority: 5, isDefault: false },
  { value: 'gemini3_flash', label: 'Gemini 3.0 Flash', icon: '⚡', category: 'llm', priority: 6, isDefault: false },

  // IMAGE - Gemini 3 Pro → Imagen 3 → FLUX Pro
  { value: 'gemini3_image', label: 'Gemini 3 Pro Image (P1)', icon: '🖼️', category: 'image', priority: 1, isDefault: true, locked: true },
  { value: 'vertex_imagen3', label: 'Vertex Imagen 3 (P2)', icon: '🎨', category: 'image', priority: 2, isDefault: true },
  { value: 'flux_pro', label: 'FLUX Pro (P3)', icon: '✨', category: 'image', priority: 3, isDefault: false },
  { value: 'stability_sdxl', label: 'Stability SDXL', icon: '🌈', category: 'image', priority: 4, isDefault: false },
  { value: 'midjourney', label: 'Midjourney', icon: '🎆', category: 'image', priority: 5, isDefault: false },
  { value: 'openai_dalle', label: 'OpenAI DALL-E 3 (Fallback)', icon: '🖌️', category: 'image', priority: 6, isDefault: false },

  // 3D/VR/AR - Meshy AI (Primary) → Alibaba 3D
  { value: 'meshy_ai', label: 'Meshy AI (P1)', icon: '🧊', category: '3d', priority: 1, isDefault: true, locked: true },
  { value: 'alibaba_3d', label: 'Alibaba 3D (P2)', icon: '🔺', category: '3d', priority: 2, isDefault: true, zones: ['cjk'] },
  { value: 'rodin_gen1', label: 'Rodin Gen-1', icon: '🗿', category: '3d', priority: 3, isDefault: false },
  { value: 'tripo3d', label: 'Tripo3D AI', icon: '🔷', category: '3d', priority: 4, isDefault: false },
  { value: 'modelslab_3d', label: 'ModelsLab 3D', icon: '📦', category: '3d', priority: 5, isDefault: false },

  // AVATAR - Wan 2.2 S2V → OmniAvatar → HeyGen
  { value: 'alibaba_wan22', label: 'Alibaba Wan 2.2 S2V (P1)', icon: '👤', category: 'avatar', priority: 1, isDefault: true, locked: true },
  { value: 'omni_avatar', label: 'OmniAvatar (P2)', icon: '🧑', category: 'avatar', priority: 2, isDefault: true },
  { value: 'tao_avatar', label: 'TaoAvatar', icon: '👥', category: 'avatar', priority: 3, isDefault: false, zones: ['cjk'] },
  { value: 'heygen', label: 'HeyGen', icon: '🎭', category: 'avatar', priority: 4, isDefault: false },
  { value: 'synthesia', label: 'Synthesia', icon: '📺', category: 'avatar', priority: 5, isDefault: false },
  { value: 'd_id', label: 'D-ID', icon: '🖥️', category: 'avatar', priority: 6, isDefault: false },

  // AUDIO - Voice Cloning, Music, SFX
  { value: 'suno_music', label: 'Suno AI Music', icon: '🎵', category: 'audio', priority: 1, isDefault: false },
  { value: 'udio_music', label: 'Udio Music', icon: '🎶', category: 'audio', priority: 2, isDefault: false },
  { value: 'elevenlabs_clone', label: 'ElevenLabs Voice Clone', icon: '🔊', category: 'audio', priority: 3, isDefault: false },
];

// Get default locked providers
const DEFAULT_LOCKED_PROVIDERS = AI_PROVIDERS_REGISTRY
  .filter(p => p.isDefault)
  .map(p => p.value);

// Providers that cannot be removed
const LOCKED_PROVIDER_VALUES = AI_PROVIDERS_REGISTRY
  .filter(p => p.locked)
  .map(p => p.value);

// Format for dropdown with category grouping
const AI_PROVIDERS = AI_PROVIDERS_REGISTRY.map(p => ({
  value: p.value,
  label: p.locked ? `🔒 ${p.label}` : p.label,
  icon: p.icon,
}));

// Category labels
const PROVIDER_CATEGORIES: Record<ProviderCategory, string> = {
  video: '🎬 Video Generation',
  tts: '🔊 Text-to-Speech',
  llm: '🧠 Language Models',
  image: '🖼️ Image Generation',
  '3d': '🧊 3D/VR/AR',
  avatar: '👤 Avatar/Talking Head',
  audio: '🎵 Audio/Music',
};

// ============================================
// Portal-based Dropdown with search and scroll
// ============================================
interface PortalDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: { value: string; label: string; icon?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
  placeholder?: string;
  maxHeight?: number;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  label,
  icon,
  options,
  selected,
  onToggle,
  multi = true,
  placeholder = 'Select...',
  maxHeight = 280,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const selectedLabels = options.filter(o => selected.includes(o.value));
  
  // Filtered options
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleItemClick = (value: string) => {
    onToggle(value);
    if (!multi) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-popover border rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 999999,
      }}
    >
      {/* Search input for long lists */}
      {options.length > 10 && (
        <div className="p-2 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>
      )}
      <div 
        className="overflow-y-auto p-1"
        style={{ maxHeight }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => handleItemClick(opt.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                selected.includes(opt.value) 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-accent"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                selected.includes(opt.value) 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30"
              )}>
                {selected.includes(opt.value) && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span className="truncate">{opt.label}</span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No options found
          </div>
        )}
      </div>
      {multi && selected.length > 0 && (
        <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
          {selected.length} selected
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </Label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 min-h-10 text-left",
          "border rounded-md bg-background",
          "hover:bg-accent/50 transition-colors",
          isOpen && "ring-2 ring-primary"
        )}
      >
        {selectedLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1 pr-4 flex-1">
            {selectedLabels.slice(0, 3).map(opt => (
              <Badge key={opt.value} variant="secondary" className="text-xs">
                {opt.icon && <span className="mr-1">{opt.icon}</span>}
                {opt.label}
              </Badge>
            ))}
            {selectedLabels.length > 3 && (
              <Badge variant="outline" className="text-xs">+{selectedLabels.length - 3}</Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {dropdownContent}
    </div>
  );
};

// ============================================
// Portal-based Clone Template Dropdown
// ============================================
interface PortalCloneDropdownProps {
  templates: VideoBlueprint[];
  selected: VideoBlueprint | null;
  onSelect: (t: VideoBlueprint) => void;
}

const PortalCloneDropdown: React.FC<PortalCloneDropdownProps> = ({
  templates,
  selected,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Filtered templates
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleSelect = (template: VideoBlueprint) => {
    onSelect(template);
    setIsOpen(false);
    setSearchQuery('');
  };

  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-popover border rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 999999,
      }}
    >
      <div className="p-2 border-b bg-muted/30">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
      </div>
      <div 
        className="overflow-y-auto p-1"
        style={{ maxHeight: '300px' }}
      >
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(t => (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-sm rounded-md cursor-pointer transition-colors",
                selected?.id === t.id 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-accent"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                selected?.id === t.id 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30"
              )}>
                {selected?.id === t.id && (
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{t.category}</Badge>
              <span className="flex-1 truncate">{t.name}</span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No templates found for "{searchQuery}"
          </div>
        )}
      </div>
      <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
        {filteredTemplates.length} of {templates.length} templates
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 min-h-10 text-left",
          "border rounded-md bg-background",
          "hover:bg-accent/50 transition-colors",
          isOpen && "ring-2 ring-primary"
        )}
      >
        {selected ? (
          <div className="flex items-center gap-2 flex-1">
            <Badge variant="secondary">{selected.category}</Badge>
            <span className="truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Search {templates.length} templates...</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {dropdownContent}
    </>
  );
};

// ============================================
// Main Component — Single AI-First Flow
// ============================================
export function CreateTemplateDialog({ onCreated, templateToClone, externalOpen, onExternalOpenChange, initialContext }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const { blueprints } = useVideoBlueprints();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onExternalOpenChange) onExternalOpenChange(value);
    setInternalOpen(value);
  };
  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  // Two-stage flow: 'describe' → 'review'
  const [stage, setStage] = useState<'describe' | 'review'>('describe');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'marketing',
    videoStyle: 'motion_graphics',
    capabilities: [] as string[],
    regions: ['western'] as string[],
    languages: ['en'] as string[],
    providers: DEFAULT_LOCKED_PROVIDERS,
    platforms: ['youtube', 'tiktok'] as string[],
    aiPrompt: '',
  });

  // Pre-fill from intent context when dialog opens
  useEffect(() => {
    if (open && initialContext) {
      const productToCategoryMap: Record<string, string> = {
        saas: 'technology', healthcare: 'healthcare', education: 'educational',
        ecommerce: 'retail', finance: 'finance', travel: 'travel',
        food: 'hospitality', corporate: 'corporate', entertainment: 'entertainment',
        smb: 'smb', marketing: 'marketing', social: 'marketing',
        creative: 'entertainment', enterprise: 'corporate', events: 'corporate',
      };
      const category = productToCategoryMap[initialContext.product || ''] || formData.category;

      const promptParts = [
        initialContext.product && `for ${initialContext.product} industry`,
        initialContext.audience && `targeting ${initialContext.audience.replace(/_/g, ' ')}`,
        initialContext.platform && `optimized for ${initialContext.platform}`,
        initialContext.goal && `focused on: ${initialContext.goal}`,
      ].filter(Boolean);

      const aiPrompt = promptParts.length > 0
        ? `Create a video template ${promptParts.join(', ')}`
        : '';

      setFormData(prev => ({
        ...prev,
        category,
        aiPrompt,
        name: initialContext.goal
          ? `${(initialContext.goal as string).split(' — ')[0]} Template`
          : prev.name,
        description: initialContext.goal
          ? `Custom template ${promptParts.join(', ')}`
          : prev.description,
      }));
      setStage('describe');
    }
  }, [open, initialContext]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStage('describe');
    }
  }, [open]);

  // Get all available languages based on selected regions
  const availableLanguages = [...new Set(
    REGIONS
      .filter(r => formData.regions.includes(r.value))
      .flatMap(r => r.languages)
  )].map(code => ({
    value: code,
    label: LANGUAGE_NAMES[code] || code,
    icon: ''
  }));

  // Update languages when regions change
  useEffect(() => {
    const validLangCodes = availableLanguages.map(l => l.value);
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => validLangCodes.includes(l)).length > 0 
        ? prev.languages.filter(l => validLangCodes.includes(l))
        : validLangCodes.slice(0, 1),
    }));
  }, [formData.regions.join(',')]);

  const toggleArrayItem = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(item)
        ? (prev[key] as string[]).filter(i => i !== item)
        : [...(prev[key] as string[]), item]
    }));
  };

  const setSingleValue = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({ ...prev, [key]: item }));
  };

  // AI Generation — enhances the prompt and populates all fields
  const generateWithAI = async () => {
    if (!formData.aiPrompt.trim()) {
      toast({ title: 'Please describe what template you want', variant: 'destructive' });
      return;
    }
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-ai', {
        body: { prompt: formData.aiPrompt, region: formData.regions[0] || 'western' }
      });
      if (error) throw error;
      if (data?.template) {
        setFormData(prev => ({
          ...prev,
          name: data.template.name || prev.name,
          description: data.template.description || prev.description,
          category: data.template.category || prev.category,
          videoStyle: data.template.videoStyle || prev.videoStyle,
          capabilities: data.template.capabilities || prev.capabilities,
          regions: data.template.regions || prev.regions,
        }));
      }
      setStage('review');
      toast({ title: '✨ AI configured your template', description: 'Review and adjust the settings below.' });
    } catch (err: any) {
      // On AI failure, still advance to review with what we have
      setStage('review');
      toast({ title: 'AI generation failed — configure manually', description: err.message, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  // Skip AI, go straight to manual review
  const skipToManual = () => {
    setStage('review');
  };

  // Create template
  const createTemplate = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Template name is required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        estimated_duration_seconds: 60,
        target_platform: formData.platforms,
        industry_tags: [formData.category, formData.videoStyle],
        default_settings: {
          videoStyle: formData.videoStyle,
          providers: formData.providers,
          platforms: formData.platforms,
          languages: formData.languages,
        },
        style_preset: {
          style: formData.videoStyle,
          capabilities: formData.capabilities,
        },
        is_system_default: false,
        created_by: user?.user?.id || null,
        is_active: true,
        is_public: true,
        usage_count: 0,
      };
      const { error } = await supabase.from('video_blueprints').insert(templateData);
      if (error) throw error;
      toast({ title: 'Template created!', description: formData.name });
      setOpen(false);
      onCreated?.();
      setFormData({
        name: '', description: '', category: 'marketing', videoStyle: 'motion_graphics',
        capabilities: [], regions: ['western'], languages: ['en'],
        providers: DEFAULT_LOCKED_PROVIDERS, platforms: ['youtube', 'tiktok'], aiPrompt: '',
      });
    } catch (err: any) {
      toast({ title: 'Failed to create template', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const isExternallyControlled = externalOpen !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isExternallyControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {templateToClone ? 'Clone' : 'Create Template'}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-visible" style={{ zIndex: 99998 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Create Custom Template
          </DialogTitle>
          <DialogDescription>
            {stage === 'describe'
              ? 'Describe your template — AI will configure everything for you'
              : 'Review and adjust the AI-configured settings'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {/* ═══ STAGE 1: DESCRIBE ═══ */}
          {stage === 'describe' && (
            <div className="space-y-4 mt-2">
              {/* Context Banner — shows what intent was passed */}
              {initialContext?.goal && (
                <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Creating from intent:</p>
                    <p className="text-sm font-medium truncate">{initialContext.goal}</p>
                  </div>
                </div>
              )}

              <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Describe your template and AI will auto-configure category, style, platforms, regions, and providers
                </p>
                <Textarea
                  placeholder="E.g., Create a TikTok product demo template with 3D avatar for Indian Telugu audience..."
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                  className="min-h-[120px] bg-background"
                />
                <div className="flex gap-2">
                  <Button onClick={generateWithAI} disabled={aiGenerating || !formData.aiPrompt.trim()} className="flex-1 gap-2">
                    {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {aiGenerating ? 'AI Configuring...' : 'Generate & Configure'}
                  </Button>
                  <Button variant="outline" onClick={skipToManual} disabled={aiGenerating}>
                    Configure Manually
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STAGE 2: REVIEW & EDIT ═══ */}
          {stage === 'review' && (
            <div className="space-y-4 mt-2">
              {/* Back to describe */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                onClick={() => setStage('describe')}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to prompt
              </Button>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Template"
                  />
                </div>
                <PortalDropdown
                  label="Category"
                  options={TEMPLATE_CATEGORIES}
                  selected={[formData.category]}
                  onToggle={(v) => setSingleValue('category', v)}
                  multi={false}
                  placeholder="Select category"
                />
              </div>

              {/* Video Style */}
              <PortalDropdown
                label="Video Style"
                options={VIDEO_STYLES}
                selected={[formData.videoStyle]}
                onToggle={(v) => setSingleValue('videoStyle', v)}
                multi={false}
                placeholder="Select style"
              />

              {/* Platforms */}
              <PortalDropdown
                label="Target Platforms"
                icon={<Globe2 className="h-4 w-4" />}
                options={PLATFORM_OPTIONS}
                selected={formData.platforms}
                onToggle={(v) => toggleArrayItem('platforms', v)}
                multi={true}
                placeholder="Select platforms"
              />

              {/* AI Capabilities */}
              <PortalDropdown
                label="AI Capabilities"
                icon={<Sparkles className="h-4 w-4" />}
                options={AI_CAPABILITIES}
                selected={formData.capabilities}
                onToggle={(v) => toggleArrayItem('capabilities', v)}
                multi={true}
                placeholder="Select capabilities"
              />

              {/* Regions */}
              <PortalDropdown
                label="Target Regions"
                icon={<Globe2 className="h-4 w-4" />}
                options={REGIONS.map(r => ({ value: r.value, label: r.label, icon: r.icon }))}
                selected={formData.regions}
                onToggle={(v) => toggleArrayItem('regions', v)}
                multi={true}
                placeholder="Select regions"
              />

              {/* Languages */}
              {availableLanguages.length > 0 && (
                <PortalDropdown
                  label={`Languages (${availableLanguages.length} available)`}
                  icon={<Languages className="h-4 w-4" />}
                  options={availableLanguages}
                  selected={formData.languages}
                  onToggle={(v) => toggleArrayItem('languages', v)}
                  multi={true}
                  placeholder="Select languages"
                  maxHeight={320}
                />
              )}

              {/* AI Providers */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Wand2 className="h-4 w-4" />
                  AI Providers (4-Zone Routing)
                </Label>
                <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/30 rounded-md border flex items-center gap-2">
                  <span className="text-primary">🔒</span>
                  <span>Locked providers follow the master routing strategy. You can add optional providers.</span>
                </div>
                <PortalDropdown
                  label=""
                  options={AI_PROVIDERS}
                  selected={formData.providers}
                  onToggle={(v) => {
                    if (LOCKED_PROVIDER_VALUES.includes(v) && formData.providers.includes(v)) return;
                    toggleArrayItem('providers', v);
                  }}
                  multi={true}
                  placeholder="Select providers"
                  maxHeight={360}
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.providers
                    .map(v => AI_PROVIDERS_REGISTRY.find(p => p.value === v))
                    .filter(Boolean)
                    .sort((a, b) => (a?.priority || 99) - (b?.priority || 99))
                    .slice(0, 6)
                    .map(provider => (
                      <Badge 
                        key={provider!.value} 
                        variant={provider!.locked ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          provider!.locked && "bg-primary/20 text-primary border-primary/30"
                        )}
                      >
                        {provider!.locked && <span className="mr-1">🔒</span>}
                        {provider!.icon} {provider!.label.replace('🔒 ', '').split(' (')[0]}
                      </Badge>
                    ))}
                  {formData.providers.length > 6 && (
                    <Badge variant="outline" className="text-xs">+{formData.providers.length - 6} more</Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this template for..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <div className="flex gap-2">
            {stage === 'review' && (
              <Button
                onClick={createTemplate}
                disabled={creating || !formData.name.trim()}
                className="gap-2"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {creating ? 'Creating...' : 'Create Template'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}