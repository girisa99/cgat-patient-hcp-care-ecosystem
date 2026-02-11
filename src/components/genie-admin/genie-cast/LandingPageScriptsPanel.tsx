/**
 * LANDING PAGE SCRIPTS PANEL
 * Manages regional hero narration scripts with versioning + A/B variants.
 * 
 * Sub-tabs:
 * - Scripts: CRUD for regional_narration_scripts with version/variant support
 * - TTS Preview: Audio preview with Azure Neural / Qwen3-TTS
 * - Versions: Version history timeline per region
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Globe, FileText, Headphones, History, Plus, Copy, Check, X,
  Play, Pause, Volume2, Edit, Trash2, ChevronDown, Tag, Sparkles,
  ArrowUpDown, Filter, MoreHorizontal, Eye, RefreshCw, Mic, AlertTriangle,
  MessageCircle, Lightbulb, TrendingUp, Zap, Send, ThumbsUp, ThumbsDown, GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScriptProductionWorkflowDiagram } from './ScriptProductionWorkflowDiagram';

// ─── Types ───────────────────────────────────────────────────────────
interface NarrationScript {
  id: string;
  region_code: string;
  region_display_name: string;
  language_code: string;
  language_display_name: string;
  hook: string;
  problem_statement: string;
  solution: string;
  cta: string;
  full_script: string | null;
  positioning_angles: string[];
  target_personas: string[];
  emotional_tones: string[];
  tts_provider: string | null;
  tts_voice_id: string | null;
  tts_voice_name: string | null;
  tts_speed: number | null;
  tts_pitch: string | null;
  background_music_url: string | null;
  background_music_volume: number | null;
  generated_audio_url: string | null;
  audio_duration_seconds: number | null;
  audio_generated_at: string | null;
  version: number;
  status: string;
  is_default: boolean | null;
  variant_label: string | null;
  impression_count: number | null;
  play_count: number | null;
  completion_rate: number | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Generation metadata
  llm_provider: string | null;
  llm_model: string | null;
  llm_temperature: number | null;
  llm_token_count: number | null;
  llm_prompt_template: string | null;
  routing_decision: string | null;
  routing_confidence_score: number | null;
  routing_zone: string | null;
  generation_timestamp: string | null;
  is_english_base: boolean | null;
  english_base_script_id: string | null;
}

type ScriptStatus = 'draft' | 'review' | 'active' | 'archived';

interface RegionGroup {
  groupCode: string;
  groupName: string;
  groupFlag: string;
  children: { code: string; name: string; flag: string }[];
}

const REGION_HIERARCHY: RegionGroup[] = [
  {
    groupCode: 'NAM', groupName: 'North America', groupFlag: '🇺🇸',
    children: [
      { code: 'NAM_US', name: 'United States', flag: '🇺🇸' },
      { code: 'NAM_CA', name: 'Canada (EN + FR)', flag: '🇨🇦' },
    ],
  },
  {
    groupCode: 'EU', groupName: 'Europe', groupFlag: '🇪🇺',
    children: [
      { code: 'EU_WEST', name: 'UK & Ireland', flag: '🇬🇧' },
      { code: 'EU_DACH', name: 'DACH (Germany, Austria, Switzerland)', flag: '🇩🇪' },
      { code: 'EU_FRANCE', name: 'France & Francophone', flag: '🇫🇷' },
      { code: 'EU_IBERIA', name: 'Spain & Portugal', flag: '🇪🇸' },
      { code: 'EU_NORDIC', name: 'Nordics (Sweden, Norway, Denmark, Finland)', flag: '🇸🇪' },
      { code: 'EU_EAST', name: 'Eastern Europe (Poland, Czech, Romania, Hungary)', flag: '🇵🇱' },
    ],
  },
  {
    groupCode: 'LATAM', groupName: 'Latin America', groupFlag: '🌎',
    children: [
      { code: 'LATAM_BRAZIL', name: 'Brazil (Português)', flag: '🇧🇷' },
      { code: 'LATAM_MEXICO', name: 'Mexico & Central America', flag: '🇲🇽' },
      { code: 'LATAM_ANDEAN', name: 'Andean (Colombia, Peru, Ecuador)', flag: '🇨🇴' },
      { code: 'LATAM_CONESUR', name: 'Southern Cone (Argentina, Chile, Uruguay)', flag: '🇦🇷' },
      { code: 'LATAM_CARIB', name: 'Caribbean (DR, PR, Cuba, Venezuela)', flag: '🇩🇴' },
    ],
  },
  {
    groupCode: 'MENA', groupName: 'Middle East & North Africa', groupFlag: '🌍',
    children: [
      { code: 'MENA_GULF', name: 'Gulf (UAE, Saudi, Qatar, Kuwait)', flag: '🇦🇪' },
      { code: 'MENA_EGYPT', name: 'Egypt (مصري)', flag: '🇪🇬' },
      { code: 'MENA_LEVANT', name: 'Levant (Lebanon, Jordan, Iraq)', flag: '🇱🇧' },
      { code: 'MENA_MAGHREB', name: 'Maghreb (Morocco, Algeria, Tunisia)', flag: '🇲🇦' },
      { code: 'MENA_MSA', name: 'Pan-Arab (Modern Standard Arabic)', flag: '🕌' },
    ],
  },
  {
    groupCode: 'AFRICA', groupName: 'Africa', groupFlag: '🌍',
    children: [
      { code: 'AFRICA_WEST', name: 'West Africa (Nigeria, Ghana)', flag: '🇳🇬' },
      { code: 'AFRICA_EAST', name: 'East Africa (Kenya, Tanzania)', flag: '🇰🇪' },
      { code: 'AFRICA_SOUTH', name: 'Southern Africa (South Africa)', flag: '🇿🇦' },
      { code: 'AFRICA_FRANCO', name: 'Francophone Africa (Senegal, DRC)', flag: '🇸🇳' },
    ],
  },
  { groupCode: 'PAKISTAN', groupName: 'Pakistan (Urdu)', groupFlag: '🇵🇰', children: [] },
  { groupCode: 'BANGLADESH', groupName: 'Bangladesh (Bengali)', groupFlag: '🇧🇩', children: [] },
  {
    groupCode: 'INDIA', groupName: 'India', groupFlag: '🇮🇳',
    children: [
      { code: 'INDIA_NORTH', name: 'North India (Hindi Belt)', flag: '🇮🇳' },
      { code: 'INDIA_SOUTH', name: 'South India (Dravidian)', flag: '🇮🇳' },
      { code: 'INDIA_WEST', name: 'West India (Maharashtra, Gujarat)', flag: '🇮🇳' },
      { code: 'INDIA_EAST', name: 'East India (Bengal, Odisha)', flag: '🇮🇳' },
      { code: 'INDIA_PAN', name: 'Pan-India (English)', flag: '🇮🇳' },
    ],
  },
  {
    groupCode: 'SEA', groupName: 'Southeast Asia', groupFlag: '🌏',
    children: [
      { code: 'SEA_MALAY', name: 'Malaysia & Indonesia', flag: '🇲🇾' },
      { code: 'SEA_THAI', name: 'Thailand', flag: '🇹🇭' },
      { code: 'SEA_VIET', name: 'Vietnam', flag: '🇻🇳' },
      { code: 'SEA_PHIL', name: 'Philippines', flag: '🇵🇭' },
      { code: 'SEA_PAN', name: 'Pan-SEA (Singapore)', flag: '🇸🇬' },
    ],
  },
  {
    groupCode: 'CJK', groupName: 'China, Japan & Korea', groupFlag: '🌏',
    children: [
      { code: 'CJK_CN', name: 'China (Mainland, HK, Macau)', flag: '🇨🇳' },
      { code: 'CJK_TW', name: 'Taiwan (Traditional Chinese)', flag: '🇹🇼' },
      { code: 'CJK_JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'CJK_KR', name: 'South Korea', flag: '🇰🇷' },
    ],
  },
];

// Flatten for backward compatibility — includes both parent-level (lowercase) and sub-region codes
const REGION_OPTIONS = REGION_HIERARCHY.flatMap(g =>
  g.children.length > 0
    ? [
        // Add parent-level entry with lowercase code for DB compatibility
        { code: g.groupCode.toLowerCase(), name: g.groupName, flag: g.groupFlag },
        ...g.children,
      ]
    : [{ code: g.groupCode, name: g.groupName, flag: g.groupFlag },
       { code: g.groupCode.toLowerCase(), name: g.groupName, flag: g.groupFlag }]
);

// Get all codes for a group — includes the parent groupCode (both cases) + children codes
// DB stores lowercase parent codes (africa, cjk) while hierarchy uses uppercase sub-region codes (AFRICA_WEST)
const getGroupCodes = (group: RegionGroup): string[] => {
  const parentCode = group.groupCode;
  const parentLower = parentCode.toLowerCase();
  if (group.children.length > 0) {
    return [parentCode, parentLower, ...group.children.map(c => c.code)];
  }
  return [parentCode, parentLower];
};

const POSITIONING_ANGLE_OPTIONS = [
  'Speed & Efficiency', 'Cost Savings', 'Innovation', 'Simplicity',
  'Enterprise Scale', 'Security & Compliance', 'AI-Powered', 'Time-to-Market',
  'User Experience', 'ROI & Growth', 'Cultural Relevance', 'Accessibility',
];

const EMOTIONAL_TONE_OPTIONS = [
  'Empowering', 'Warm', 'Professional', 'Urgent', 'Inspirational',
  'Conversational', 'Bold', 'Reassuring', 'Playful', 'Authoritative',
  'Compassionate', 'Energetic',
];

const STATUS_CONFIG: Record<ScriptStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Edit },
  review: { label: 'In Review', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Eye },
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: Check },
  archived: { label: 'Archived', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: X },
};

// ─── Sub-tab: Landing Page Scripts ───────────────────────────────────
type LandingPageSubTab = 'scripts' | 'tts-preview' | 'versions' | 'feedback' | 'workflow';

// ─── Feedback types ──────────────────────────────────────────────────
interface ImprovementNote {
  id: string;
  script_id: string;
  note_type: 'reviewer_comment' | 'ab_learning' | 'ai_suggestion' | 'performance_insight' | 'tts_feedback';
  content: string;
  section_target: string | null;
  priority: string;
  status: string;
  ai_model_used: string | null;
  framework_tag: string | null;
  metadata: any;
  created_by: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

const NOTE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  reviewer_comment: { label: 'Reviewer', icon: MessageCircle, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  ab_learning: { label: 'A/B Learning', icon: TrendingUp, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  ai_suggestion: { label: 'AI Suggestion', icon: Sparkles, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  performance_insight: { label: 'Insight', icon: Lightbulb, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  tts_feedback: { label: 'TTS Feedback', icon: Mic, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' },
};

// ─── Zone-Based AI Provider Recommendations ──────────────────────────
interface AIProviderOption {
  id: string;
  name: string;
  model: string;
  zone: string;
  isRecommended: boolean;
  reason: string;
}

/**
 * Returns AI providers ranked by zone routing with the recommended one first.
 * Follows master-provider-routing-registry: Claude Zone → claude-4, Alibaba Zone → qwen-max, Gemini Zone → gemini-3-pro
 */
/**
 * Returns the recommended TTS provider + voice locale for a sub-region.
 * Follows master routing: Azure Neural (global) / Qwen3-TTS (CJK).
 */
/**
 * Normalize display-friendly TTS provider names to DB-compatible values.
 * DB constraint allows: 'azure', 'qwen3', 'elevenlabs'
 */
function normalizeTTSProvider(displayProvider: string): string {
  const p = displayProvider.toLowerCase();
  if (p.includes('azure') || p.includes('neural')) return 'azure';
  if (p.includes('qwen')) return 'qwen3';
  if (p.includes('eleven')) return 'elevenlabs';
  return 'azure'; // safe default
}

function getSubRegionTTSProvider(regionCode: string): { provider: string; locale: string; label: string; voiceId: string; voiceName: string } {
  const r = regionCode?.toUpperCase() || '';
  const ttsMap: Record<string, { provider: string; locale: string; label: string; voiceId: string; voiceName: string }> = {
    // NAM
    'NAM_US': { provider: 'azure', locale: 'en-US', label: 'Azure Neural (en-US)', voiceId: 'en-US-JennyNeural', voiceName: 'Jenny (US English)' },
    'NAM_CA': { provider: 'azure', locale: 'en-CA', label: 'Azure Neural (en-CA, fr-CA)', voiceId: 'en-CA-ClaraNeural', voiceName: 'Clara (Canadian English)' },
    // EU
    'EU_WEST': { provider: 'azure', locale: 'en-GB', label: 'Azure Neural (en-GB)', voiceId: 'en-GB-SoniaNeural', voiceName: 'Sonia (British English)' },
    'EU_DACH': { provider: 'azure', locale: 'de-DE', label: 'Azure Neural (de-DE/AT/CH)', voiceId: 'de-DE-KatjaNeural', voiceName: 'Katja (German)' },
    'EU_FRANCE': { provider: 'azure', locale: 'fr-FR', label: 'Azure Neural (fr-FR/BE)', voiceId: 'fr-FR-DeniseNeural', voiceName: 'Denise (French)' },
    'EU_IBERIA': { provider: 'azure', locale: 'es-ES', label: 'Azure Neural (es-ES, pt-PT)', voiceId: 'es-ES-ElviraNeural', voiceName: 'Elvira (Spanish)' },
    'EU_NORDIC': { provider: 'azure', locale: 'sv-SE', label: 'Azure Neural (Nordic)', voiceId: 'sv-SE-SofieNeural', voiceName: 'Sofie (Swedish)' },
    'EU_EAST': { provider: 'azure', locale: 'pl-PL', label: 'Azure Neural (Eastern EU)', voiceId: 'pl-PL-ZofiaNeural', voiceName: 'Zofia (Polish)' },
    // LATAM
    'LATAM_BRAZIL': { provider: 'azure', locale: 'pt-BR', label: 'Azure Neural (pt-BR)', voiceId: 'pt-BR-FranciscaNeural', voiceName: 'Francisca (Brazilian Portuguese)' },
    'LATAM_MEXICO': { provider: 'azure', locale: 'es-MX', label: 'Azure Neural (es-MX)', voiceId: 'es-MX-DaliaNeural', voiceName: 'Dalia (Mexican Spanish)' },
    'LATAM_ANDEAN': { provider: 'azure', locale: 'es-CO', label: 'Azure Neural (es-CO/PE)', voiceId: 'es-CO-SalomeNeural', voiceName: 'Salome (Colombian Spanish)' },
    'LATAM_CONESUR': { provider: 'azure', locale: 'es-AR', label: 'Azure Neural (es-AR/CL)', voiceId: 'es-AR-ElenaNeural', voiceName: 'Elena (Argentine Spanish)' },
    'LATAM_CARIB': { provider: 'azure', locale: 'es-DO', label: 'Azure Neural (es-DO/VE)', voiceId: 'es-DO-RamonaNeural', voiceName: 'Ramona (Dominican Spanish)' },
    // MENA
    'MENA_GULF': { provider: 'azure', locale: 'ar-SA', label: 'Azure Neural (ar-SA/AE)', voiceId: 'ar-SA-ZariyahNeural', voiceName: 'Zariyah (Saudi Arabic)' },
    'MENA_EGYPT': { provider: 'azure', locale: 'ar-EG', label: 'Azure Neural (ar-EG)', voiceId: 'ar-EG-SalmaNeural', voiceName: 'Salma (Egyptian Arabic)' },
    'MENA_LEVANT': { provider: 'azure', locale: 'ar-JO', label: 'Azure Neural (ar-JO/IQ)', voiceId: 'ar-JO-SanaNeural', voiceName: 'Sana (Jordanian Arabic)' },
    'MENA_MAGHREB': { provider: 'azure', locale: 'ar-MA', label: 'Azure Neural (ar-MA, fr-MA)', voiceId: 'ar-MA-MounaNeural', voiceName: 'Mouna (Moroccan Arabic)' },
    'MENA_MSA': { provider: 'azure', locale: 'ar-SA', label: 'Azure Neural (MSA)', voiceId: 'ar-SA-ZariyahNeural', voiceName: 'Zariyah (MSA)' },
    // Pakistan & Bangladesh
    'PAKISTAN': { provider: 'azure', locale: 'ur-PK', label: 'Azure Neural (ur-PK)', voiceId: 'ur-PK-UzmaNeural', voiceName: 'Uzma (Urdu)' },
    'BANGLADESH': { provider: 'azure', locale: 'bn-BD', label: 'Azure Neural (bn-BD)', voiceId: 'bn-BD-NabanitaNeural', voiceName: 'Nabanita (Bengali)' },
    // India
    'INDIA_NORTH': { provider: 'azure', locale: 'hi-IN', label: 'Azure Neural (hi-IN)', voiceId: 'hi-IN-SwaraNeural', voiceName: 'Swara (Hindi)' },
    'INDIA_SOUTH': { provider: 'azure', locale: 'ta-IN', label: 'Azure Neural (ta/te-IN)', voiceId: 'ta-IN-PallaviNeural', voiceName: 'Pallavi (Tamil)' },
    'INDIA_WEST': { provider: 'azure', locale: 'mr-IN', label: 'Azure Neural (mr/gu-IN)', voiceId: 'mr-IN-AarohiNeural', voiceName: 'Aarohi (Marathi)' },
    'INDIA_EAST': { provider: 'azure', locale: 'bn-IN', label: 'Azure Neural (bn-IN)', voiceId: 'bn-IN-TanishaaNeural', voiceName: 'Tanishaa (Bengali India)' },
    'INDIA_PAN': { provider: 'azure', locale: 'en-IN', label: 'Azure Neural (en-IN)', voiceId: 'en-IN-NeerjaNeural', voiceName: 'Neerja (Indian English)' },
    // SEA
    'SEA_MALAY': { provider: 'azure', locale: 'ms-MY', label: 'Azure Neural (ms-MY, id-ID)', voiceId: 'ms-MY-YasminNeural', voiceName: 'Yasmin (Malay)' },
    'SEA_THAI': { provider: 'azure', locale: 'th-TH', label: 'Azure Neural (th-TH)', voiceId: 'th-TH-PremwadeeNeural', voiceName: 'Premwadee (Thai)' },
    'SEA_VIET': { provider: 'azure', locale: 'vi-VN', label: 'Azure Neural (vi-VN)', voiceId: 'vi-VN-HoaiMyNeural', voiceName: 'HoaiMy (Vietnamese)' },
    'SEA_PHIL': { provider: 'azure', locale: 'fil-PH', label: 'Azure Neural (fil-PH)', voiceId: 'fil-PH-BlessicaNeural', voiceName: 'Blessica (Filipino)' },
    'SEA_PAN': { provider: 'azure', locale: 'en-SG', label: 'Azure Neural (en-SG)', voiceId: 'en-SG-LunaNeural', voiceName: 'Luna (Singapore English)' },
    // CJK — Qwen3-TTS primary
    'CJK_CN': { provider: 'qwen3', locale: 'zh-CN', label: 'Qwen3-TTS (zh-CN)', voiceId: 'longwan', voiceName: 'Longwan (Mandarin)' },
    'CJK_TW': { provider: 'azure', locale: 'zh-TW', label: 'Azure Neural (zh-TW)', voiceId: 'zh-TW-HsiaoChenNeural', voiceName: 'HsiaoChen (Traditional Chinese)' },
    'CJK_JP': { provider: 'qwen3', locale: 'ja-JP', label: 'Qwen3-TTS (ja-JP)', voiceId: 'longyue', voiceName: 'Longyue (Japanese)' },
    'CJK_KR': { provider: 'azure', locale: 'ko-KR', label: 'Azure Neural (ko-KR)', voiceId: 'ko-KR-SunHiNeural', voiceName: 'SunHi (Korean)' },
    // Africa
    'AFRICA_WEST': { provider: 'azure', locale: 'en-NG', label: 'Azure Neural (yo/en-NG)', voiceId: 'en-NG-EzinneNeural', voiceName: 'Ezinne (Nigerian English)' },
    'AFRICA_EAST': { provider: 'azure', locale: 'sw-KE', label: 'Azure Neural (sw-KE)', voiceId: 'sw-KE-ZuriNeural', voiceName: 'Zuri (Swahili)' },
    'AFRICA_SOUTH': { provider: 'azure', locale: 'en-ZA', label: 'Azure Neural (zu/en-ZA)', voiceId: 'en-ZA-LeahNeural', voiceName: 'Leah (South African English)' },
    'AFRICA_FRANCO': { provider: 'azure', locale: 'fr-SN', label: 'Azure Neural (fr-SN/CD)', voiceId: 'fr-FR-DeniseNeural', voiceName: 'Denise (French - Africa)' },
  };
  return ttsMap[r] || { provider: 'azure', locale: 'en-US', label: 'Azure Neural (Default)', voiceId: 'en-US-JennyNeural', voiceName: 'Jenny (US English)' };
}

function getZoneAIProviders(regionCode: string): AIProviderOption[] {
  const r = regionCode?.toUpperCase();
  
  // Determine zone and sub-zone for fallback selection
  const zone = (() => {
    if (r?.startsWith('NAM')) return 'western';
    if (r?.startsWith('EU')) return 'western';
    if (r?.startsWith('LATAM')) return 'western';
    if (r?.startsWith('CJK')) return 'cjk';
    if (r?.startsWith('MENA')) return 'mena';
    if (['PAKISTAN'].includes(r)) return 'pakistan';
    if (['BANGLADESH'].includes(r)) return 'bangladesh';
    if (r?.startsWith('SEA')) return 'india';
    if (r?.startsWith('INDIA')) return 'india';
    if (r?.startsWith('AFRICA')) return 'africa';
    return 'western';
  })();

  const providers: AIProviderOption[] = [
    { id: 'claude', name: 'Claude 4', model: 'claude-4', zone: 'western', isRecommended: false, reason: 'Best for Western/EU/LATAM copywriting — nuanced tone, cultural context' },
    { id: 'alibaba', name: 'Qwen Max', model: 'qwen-max', zone: 'cjk', isRecommended: false, reason: 'Best for CJK & formal Arabic — native dialect handling, cultural adaptation' },
    { id: 'gemini', name: 'Gemini 3 Pro', model: 'gemini-3-pro', zone: 'india', isRecommended: false, reason: 'Best for India/SEA/Africa/Bangladesh — multilingual, strong regional context' },
    { id: 'openai', name: 'GPT-4o', model: 'gpt-4o', zone: 'fallback', isRecommended: false, reason: 'Strong Arabic dialects, Nordic/Eastern EU — reliable all-rounder' },
    { id: 'deepseek', name: 'DeepSeek V3', model: 'deepseek-v3', zone: 'fallback', isRecommended: false, reason: 'Cost-effective alternative — good for bulk script generation' },
  ];

  // Zone → primary provider (hybrid routing)
  const zoneMap: Record<string, string> = {
    western: 'claude',
    cjk: 'alibaba',
    mena: 'openai',
    pakistan: 'openai',
    bangladesh: 'gemini',
    india: 'gemini',
    africa: 'gemini',
  };
  
  // Sub-region hybrid overrides (where primary differs from zone default)
  const subRegionOverrides: Record<string, string> = {
    // MENA hybrid
    'MENA_GULF': 'alibaba',
    'MENA_EGYPT': 'openai',
    'MENA_LEVANT': 'openai',
    'MENA_MAGHREB': 'claude',
    'MENA_MSA': 'alibaba',
    // EU hybrid — Nordic/Eastern use GPT-4o (better smaller language coverage)
    'EU_NORDIC': 'openai',
    'EU_EAST': 'openai',
    // LATAM hybrid — Andean/Caribbean use GPT-4o (better less-resourced Spanish dialects)
    'LATAM_ANDEAN': 'openai',
    'LATAM_CARIB': 'openai',
  };
  
  const recommended = subRegionOverrides[r] || zoneMap[zone] || 'claude';
  
  // Sub-region fallback preferences (affects sort order after recommended)
  const subRegionFallbackOrder: Record<string, string[]> = {
    // NAM sub-regions
    'NAM_US': ['claude', 'openai', 'gemini', 'alibaba', 'deepseek'],
    'NAM_CA': ['claude', 'openai', 'gemini', 'alibaba', 'deepseek'],
    // EU sub-regions
    'EU_WEST': ['claude', 'openai', 'gemini', 'alibaba', 'deepseek'],
    'EU_DACH': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
    'EU_FRANCE': ['claude', 'openai', 'deepseek', 'gemini', 'alibaba'],
    'EU_IBERIA': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
    'EU_NORDIC': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
    'EU_EAST': ['openai', 'claude', 'deepseek', 'gemini', 'alibaba'],
    // LATAM sub-regions
    'LATAM_BRAZIL': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
    'LATAM_MEXICO': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
    'LATAM_ANDEAN': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
    'LATAM_CONESUR': ['claude', 'openai', 'gemini', 'deepseek', 'alibaba'],
    'LATAM_CARIB': ['openai', 'claude', 'gemini', 'deepseek', 'alibaba'],
    // Africa sub-regions
    'AFRICA_WEST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'AFRICA_EAST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'AFRICA_SOUTH': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
    'AFRICA_FRANCO': ['gemini', 'alibaba', 'openai', 'claude', 'deepseek'],
    // Pakistan & Bangladesh
    'PAKISTAN': ['openai', 'gemini', 'claude', 'alibaba', 'deepseek'],
    'BANGLADESH': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    // India sub-regions
    'INDIA_NORTH': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'INDIA_SOUTH': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'INDIA_WEST': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
    'INDIA_EAST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'INDIA_PAN': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
    // SEA sub-regions
    'SEA_MALAY': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'SEA_THAI': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'SEA_VIET': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'SEA_PHIL': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
    'SEA_PAN': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
    // CJK sub-regions
    'CJK_CN': ['alibaba', 'openai', 'gemini', 'claude', 'deepseek'],
    'CJK_JP': ['alibaba', 'openai', 'claude', 'gemini', 'deepseek'],
    'CJK_KR': ['alibaba', 'openai', 'claude', 'gemini', 'deepseek'],
    'CJK_TW': ['alibaba', 'claude', 'openai', 'gemini', 'deepseek'],
    // MENA sub-regions
    'MENA_GULF': ['alibaba', 'openai', 'claude', 'gemini', 'deepseek'],
    'MENA_EGYPT': ['openai', 'alibaba', 'claude', 'gemini', 'deepseek'],
    'MENA_LEVANT': ['openai', 'alibaba', 'claude', 'gemini', 'deepseek'],
    'MENA_MAGHREB': ['claude', 'openai', 'alibaba', 'gemini', 'deepseek'],
    'MENA_MSA': ['alibaba', 'claude', 'openai', 'gemini', 'deepseek'],
  };
  
  const fallbackOrder = subRegionFallbackOrder[r];
  
  return providers
    .map(p => ({ ...p, isRecommended: p.id === recommended }))
    .sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      if (fallbackOrder) {
        return fallbackOrder.indexOf(a.id) - fallbackOrder.indexOf(b.id);
      }
      return 0;
    });
}

// ─── Main Component ──────────────────────────────────────────────────
export const LandingPageScriptsPanel: React.FC = () => {
  const [scripts, setScripts] = useState<NarrationScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<LandingPageSubTab>('workflow');
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingScript, setEditingScript] = useState<NarrationScript | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [generatingTTSForScript, setGeneratingTTSForScript] = useState<string | null>(null);
  const [expandingRegion, setExpandingRegion] = useState<string | null>(null);

  // TTS audio versions state
  const [ttsVersions, setTtsVersions] = useState<any[]>([]);

  // Audio playback state
  const [playingScriptId, setPlayingScriptId] = useState<string | null>(null);
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Feedback state
  const [notes, setNotes] = useState<ImprovementNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<string>('reviewer_comment');
  const [newNoteSection, setNewNoteSection] = useState<string>('general');
  const [newNoteScriptId, setNewNoteScriptId] = useState<string>('');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<'all' | 'script' | 'tts'>('all');
  const [newNotePriority, setNewNotePriority] = useState<string>('medium');

  // AI generation state
  const [isGeneratingImproved, setIsGeneratingImproved] = useState(false);
  const [selectedAIProvider, setSelectedAIProvider] = useState<string>('');
  const [improvedPreview, setImprovedPreview] = useState<{
    scriptId: string;
    hook: string;
    problem_statement: string;
    solution: string;
    cta: string;
    changes_summary: string;
    framework_used: string;
    // Generation metadata
    llm_provider?: string;
    llm_model?: string;
    llm_temperature?: number;
    llm_token_count?: number;
    llm_prompt_template?: string;
    routing_decision?: string;
    routing_confidence_score?: number;
    routing_zone?: string;
  } | null>(null);
  const [showImprovedPreview, setShowImprovedPreview] = useState(false);
  const [selectedScriptForImprovement, setSelectedScriptForImprovement] = useState<string>('');

  // Audience registry for persona options
  const [audienceOptions, setAudienceOptions] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from('marketing_audiences').select('label').eq('is_active', true).order('sort_order').then(({ data }) => {
      setAudienceOptions(data?.map((a: any) => a.label) || []);
    });
  }, []);
  // ── Fetch scripts ──
  const fetchScripts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('regional_narration_scripts')
        .select('*')
        .order('region_code')
        .order('version', { ascending: false });

      if (error) throw error;
      setScripts((data || []) as unknown as NarrationScript[]);
    } catch (err) {
      console.error('[LandingPageScripts] Fetch error:', err);
      toast.error('Failed to load scripts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchScripts(); }, [fetchScripts]);

  // ── Fetch TTS audio versions ──
  const fetchTTSVersions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tts_audio_versions')
        .select('*')
        .order('generated_at', { ascending: false });
      if (error) throw error;
      setTtsVersions((data || []) as any[]);
    } catch (err) {
      console.error('[LandingPageScripts] TTS versions fetch error:', err);
    }
  }, []);

  useEffect(() => { fetchTTSVersions(); }, [fetchTTSVersions]);

  // ── Delete TTS version ──
  const handleDeleteTTSVersion = useCallback(async (versionId: string) => {
    try {
      const { error } = await supabase
        .from('tts_audio_versions')
        .delete()
        .eq('id', versionId);
      if (error) throw error;
      toast.success('TTS version deleted');
      fetchTTSVersions();
    } catch (err) {
      console.error('[TTS Version] Delete error:', err);
      toast.error('Failed to delete TTS version');
    }
  }, [fetchTTSVersions]);

  // ── Fetch improvement notes ──
  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('script_improvement_notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes((data || []) as unknown as ImprovementNote[]);
    } catch (err) {
      console.error('[LandingPageScripts] Notes fetch error:', err);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ── Add improvement note ──
  const handleAddNote = useCallback(async () => {
    if (!newNoteContent.trim() || !newNoteScriptId) {
      toast.error('Select a script and enter your feedback');
      return;
    }
    try {
      const { error } = await supabase
        .from('script_improvement_notes')
        .insert({
          script_id: newNoteScriptId,
          note_type: newNoteType,
          content: newNoteContent.trim(),
          section_target: newNoteSection,
          priority: newNotePriority,
          status: 'open',
        } as any);
      if (error) throw error;
      toast.success('Feedback added');
      setNewNoteContent('');
      fetchNotes();
    } catch (err) {
      console.error('[LandingPageScripts] Add note error:', err);
      toast.error('Failed to add feedback');
    }
  }, [newNoteContent, newNoteScriptId, newNoteType, newNoteSection, newNotePriority, fetchNotes]);

  // ── Update note status ──
  const handleNoteStatus = useCallback(async (noteId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('script_improvement_notes')
        .update({ status, updated_at: new Date().toISOString() } as any)
        .eq('id', noteId);
      if (error) throw error;
      toast.success(`Note ${status}`);
      fetchNotes();
    } catch (err) {
      toast.error('Failed to update note');
    }
  }, [fetchNotes]);

  // ── Notes grouped by script ──
  const notesByScript = useMemo(() => {
    const map: Record<string, ImprovementNote[]> = {};
    notes.forEach(n => {
      if (!map[n.script_id]) map[n.script_id] = [];
      map[n.script_id].push(n);
    });
    return map;
  }, [notes]);

  // ── Filtered scripts — case-insensitive matching for region codes ──
  const filteredScripts = useMemo(() => {
    const lowerFilterRegions = filterRegions.map(r => r.toLowerCase());
    return scripts.filter(s => {
      if (filterRegions.length > 0 && !lowerFilterRegions.includes(s.region_code.toLowerCase())) return false;
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      return true;
    });
  }, [scripts, filterRegions, filterStatus]);

  // ── Group by region ──
  const groupedByRegion = useMemo(() => {
    const groups: Record<string, NarrationScript[]> = {};
    filteredScripts.forEach(s => {
      if (!groups[s.region_code]) groups[s.region_code] = [];
      groups[s.region_code].push(s);
    });
    return groups;
  }, [filteredScripts]);

  // ── Create variant ──
  const handleCreateVariant = useCallback(async (baseScript: NarrationScript, variantLabel: string) => {
    try {
      const { error } = await supabase
        .from('regional_narration_scripts')
        .insert({
          region_code: baseScript.region_code,
          region_display_name: baseScript.region_display_name,
          language_code: baseScript.language_code,
          language_display_name: baseScript.language_display_name,
          hook: baseScript.hook,
          problem_statement: baseScript.problem_statement,
          solution: baseScript.solution,
          cta: baseScript.cta,
          positioning_angles: baseScript.positioning_angles,
          target_personas: baseScript.target_personas,
          emotional_tones: baseScript.emotional_tones,
          tts_provider: baseScript.tts_provider || getSubRegionTTSProvider(baseScript.region_code).provider,
          tts_voice_id: baseScript.tts_voice_id || getSubRegionTTSProvider(baseScript.region_code).voiceId,
          tts_voice_name: baseScript.tts_voice_name || getSubRegionTTSProvider(baseScript.region_code).voiceName,
          tts_speed: baseScript.tts_speed,
          tts_pitch: baseScript.tts_pitch,
          version: baseScript.version,
          status: 'draft',
          variant_label: variantLabel,
          is_default: false,
          // Carry forward generation metadata
          llm_provider: baseScript.llm_provider,
          llm_model: baseScript.llm_model,
          routing_zone: baseScript.routing_zone,
          is_english_base: baseScript.is_english_base,
          english_base_script_id: baseScript.english_base_script_id,
        } as any);

      if (error) throw error;
      toast.success(`Variant "${variantLabel}" created`);
      fetchScripts();
    } catch (err) {
      console.error('[LandingPageScripts] Create variant error:', err);
      toast.error('Failed to create variant');
    }
  }, [fetchScripts]);

  // ── Generate TTS for a script using sub-region routing ──
  // GATED: Only active/approved scripts can generate TTS
  const handleGenerateTTS = useCallback(async (script: NarrationScript, mode: 'auto' | 'manual' = 'manual') => {
    if (script.status !== 'active') {
      toast.error('TTS generation requires an approved (active) script. Please approve the script first.');
      return;
    }
    setGeneratingTTSForScript(script.id);
    try {
      const ttsInfo = getSubRegionTTSProvider(script.region_code);
      const text = script.full_script || `${script.hook}\n\n${script.problem_statement}\n\n${script.solution}\n\n${script.cta}`;
      
      if (!text.trim()) {
        toast.error('Script has no content to generate TTS');
        return;
      }

      console.log(`[TTS Generate] Script: ${script.region_code}, Provider: ${ttsInfo.provider}, Voice: ${ttsInfo.voiceId}, Locale: ${ttsInfo.locale}, Mode: ${mode}`);

      const resolvedProvider = script.tts_provider || (ttsInfo.provider === 'Qwen3-TTS' ? 'alibaba' : 'azure');
      const resolvedVoiceId = script.tts_voice_id || ttsInfo.voiceId;

      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text,
          languageCode: script.language_code,
          provider: resolvedProvider,
          voiceId: resolvedVoiceId,
          speed: script.tts_speed || 1.0,
          tier: 'premium',
          regionCode: script.region_code,
        },
      });

      if (error) throw error;

      const audioUrl = data?.audioUrl || (data?.audioContent ? `data:audio/mpeg;base64,${data.audioContent}` : null);

      // Store TTS version in tts_audio_versions (never overwrites — append only)
      const { error: versionError } = await supabase
        .from('tts_audio_versions')
        .insert({
          script_id: script.id,
          region_code: script.region_code,
          language_code: script.language_code,
          tts_provider: data?.provider || ttsInfo.provider,
          tts_voice_id: data?.voice || resolvedVoiceId,
          tts_voice_name: data?.voiceName || ttsInfo.voiceName,
          tts_locale: ttsInfo.locale,
          tts_speed: script.tts_speed || 1.0,
          audio_url: audioUrl,
          audio_duration_seconds: data?.durationSeconds,
          characters_processed: text.length,
          generation_mode: mode,
          generation_trigger: mode === 'auto' ? 'script_approval' : 'user_action',
          routing_zone: ttsInfo.provider === 'Qwen3-TTS' ? 'cjk' : 'global',
          fallback_used: data?.fallbackUsed || false,
          fallback_from: data?.fallbackFrom,
          status: 'completed',
        } as any);

      if (versionError) {
        console.error('[TTS Version] Save error:', versionError);
      }

      // Also update the script's audio URL for quick access
      await supabase
        .from('regional_narration_scripts')
        .update({
          generated_audio_url: audioUrl,
          audio_duration_seconds: data?.durationSeconds,
          audio_generated_at: new Date().toISOString(),
          tts_provider: data?.provider || ttsInfo.provider,
          tts_voice_id: data?.voice || resolvedVoiceId,
          tts_voice_name: data?.voiceName || ttsInfo.voiceName,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', script.id);

      toast.success(`TTS generated for ${script.region_display_name} (${ttsInfo.provider})`);
      fetchScripts();
      fetchTTSVersions();
    } catch (err) {
      console.error('[TTS Generate] Error:', err);
      
      // Store failed version for audit trail
      try {
        await supabase.from('tts_audio_versions').insert({
          script_id: script.id,
          region_code: script.region_code,
          language_code: script.language_code,
          tts_provider: getSubRegionTTSProvider(script.region_code).provider,
          tts_locale: getSubRegionTTSProvider(script.region_code).locale,
          generation_mode: mode,
          generation_trigger: mode === 'auto' ? 'script_approval' : 'user_action',
          status: 'failed',
          error_message: err instanceof Error ? err.message : String(err),
        } as any);
      } catch (_) { /* ignore audit log failures */ }

      toast.error(`TTS generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeneratingTTSForScript(null);
    }
  }, [fetchScripts, fetchTTSVersions]);

  // ── Update script status (with auto-generate TTS on approval) ──
  const handleStatusChange = useCallback(async (scriptId: string, newStatus: ScriptStatus) => {
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'active') {
        updateData.approved_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('regional_narration_scripts')
        .update(updateData)
        .eq('id', scriptId);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
      fetchScripts();

      // Auto-generate TTS when script is set to active (approved)
      if (newStatus === 'active') {
        const script = scripts.find(s => s.id === scriptId);
        if (script) {
          toast.info(`🔊 Auto-generating TTS for ${script.region_display_name}...`);
          // Use setTimeout to let the UI update first
          setTimeout(() => handleGenerateTTS({ ...script, status: 'active' }, 'auto'), 500);
        }
      }
    } catch (err) {
      console.error('[LandingPageScripts] Status change error:', err);
      toast.error('Failed to update status');
    }
  }, [fetchScripts, scripts, handleGenerateTTS]);

  // ── Re-transcreate a single sub-region script from its English base ──
  const handleReTranscreate = useCallback(async (script: NarrationScript) => {
    const baseScript = script.english_base_script_id
      ? scripts.find(s => s.id === script.english_base_script_id)
      : scripts.find(s => s.region_code === 'ENGLISH_BASE' && s.is_english_base && s.status === 'active');

    if (!baseScript) {
      toast.error('No approved English Base Script found. Approve the English Base first.');
      return;
    }

    toast.info(`🔄 Re-transcreating ${script.region_display_name}...`);

    try {
      const providers = getZoneAIProviders(script.region_code);
      const provider = providers.find(p => p.isRecommended) || providers[0];
      const ttsProvider = getSubRegionTTSProvider(script.region_code);

      const prompt = `You are a world-class localization expert specializing in regional cultural adaptation.

TASK: Re-transcreate the following marketing script for ${script.region_display_name}. Adapt cultural context, idioms, and emotional resonance while maintaining the Hook → Problem → Solution → CTA structure.

ORIGINAL SCRIPT (English Base):
HOOK: ${baseScript.hook}
PROBLEM: ${baseScript.problem_statement}
SOLUTION: ${baseScript.solution}
CTA: ${baseScript.cta}

TARGET REGION: ${script.region_display_name}
TARGET LANGUAGE: ${script.language_code}
POSITIONING: ${script.positioning_angles?.join(', ') || 'value-driven'}
PERSONAS: ${script.target_personas?.join(', ') || 'general'}
TONE: ${script.emotional_tones?.join(', ') || 'professional'}

Return ONLY valid JSON: {"hook":"...","problem_statement":"...","solution":"...","cta":"..."}`;

      const response = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_text',
          provider: provider.id,
          model: provider.model,
          prompt,
          systemPrompt: 'You are a regional script transcreation expert. Return ONLY valid JSON.',
        },
      });

      if (response.error) throw response.error;

      const content = response.data?.content || response.data?.text || '';
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Create new version with re-transcreated content
      const maxVersion = scripts
        .filter(s => s.region_code === script.region_code)
        .reduce((max, s) => Math.max(max, s.version), 0);

      const { error } = await supabase
        .from('regional_narration_scripts')
        .insert({
          region_code: script.region_code,
          region_display_name: script.region_display_name,
          language_code: script.language_code,
          language_display_name: script.language_display_name,
          hook: parsed.hook || baseScript.hook,
          problem_statement: parsed.problem_statement || baseScript.problem_statement,
          solution: parsed.solution || baseScript.solution,
          cta: parsed.cta || baseScript.cta,
          positioning_angles: script.positioning_angles,
          target_personas: script.target_personas,
          emotional_tones: script.emotional_tones,
          tts_provider: ttsProvider.provider,
          tts_voice_id: ttsProvider.voiceId,
          tts_voice_name: ttsProvider.voiceName,
          tts_speed: script.tts_speed || 1.0,
          version: maxVersion + 1,
          status: 'review',
          is_english_base: false,
          english_base_script_id: baseScript.id,
          llm_provider: provider.id,
          llm_model: provider.model,
          llm_temperature: 0.7,
          llm_prompt_template: 'regional_re_transcreation_v1',
          routing_decision: `Re-transcreation: ${provider.name} for ${script.region_display_name}`,
          routing_confidence_score: provider.isRecommended ? 0.95 : 0.75,
          routing_zone: script.routing_zone,
          generation_timestamp: new Date().toISOString(),
        } as any);

      if (error) throw error;
      toast.success(`✅ Re-transcreated ${script.region_display_name} v${maxVersion + 1} (status: review)`);
      fetchScripts();
    } catch (err) {
      console.error('[ReTranscreate] Error:', err);
      toast.error(`Failed to re-transcreate ${script.region_display_name}`);
    }
  }, [scripts, fetchScripts]);

  // ── Layered Feedback Escalation: TTS feedback → voice-only regen OR content escalation ──
  const handleFeedbackEscalation = useCallback(async (note: ImprovementNote, escalationType: 'voice_issue' | 'content_issue') => {
    const script = scripts.find(s => s.id === note.script_id);
    if (!script) {
      toast.error('Script not found');
      return;
    }

    if (escalationType === 'voice_issue') {
      // Voice/prosody issue → re-generate TTS only (no script changes)
      toast.info(`🔊 Re-generating TTS for ${script.region_display_name} (voice issue)...`);

      // Force status to active so TTS gating passes (the script itself is fine)
      if (script.status === 'active') {
        await handleGenerateTTS(script, 'manual');
      } else {
        toast.error('Script must be active to regenerate TTS. Approve the script first.');
        return;
      }

      // Mark the note as applied
      await supabase
        .from('script_improvement_notes')
        .update({
          status: 'applied',
          resolved_at: new Date().toISOString(),
          metadata: { escalation_type: 'voice_issue', action: 'tts_regenerated' },
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', note.id);

      toast.success('TTS re-generated. Voice feedback resolved.');
      fetchNotes();
    } else {
      // Content issue → revert script to "review" and trigger re-transcreation
      toast.info(`📝 Escalating content issue for ${script.region_display_name}...`);

      // Revert script status to "review"
      const { error } = await supabase
        .from('regional_narration_scripts')
        .update({
          status: 'review',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', script.id);

      if (error) {
        toast.error('Failed to revert script status');
        return;
      }

      // Update note with escalation metadata
      await supabase
        .from('script_improvement_notes')
        .update({
          status: 'accepted',
          metadata: { escalation_type: 'content_issue', action: 'script_reverted_to_review' },
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', note.id);

      toast.success(`Script reverted to "review". Re-transcreation recommended for ${script.region_display_name}.`);
      fetchScripts();
      fetchNotes();
    }
  }, [scripts, handleGenerateTTS, fetchScripts, fetchNotes]);

  // ── Save edited script ──
  const handleSaveScript = useCallback(async (script: NarrationScript) => {
    try {
      const { error } = await supabase
        .from('regional_narration_scripts')
        .update({
          hook: script.hook,
          problem_statement: script.problem_statement,
          solution: script.solution,
          cta: script.cta,
          positioning_angles: script.positioning_angles,
          target_personas: script.target_personas,
          emotional_tones: script.emotional_tones,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', script.id);
      if (error) throw error;
      toast.success('Script saved');
      setShowEditor(false);
      setEditingScript(null);
      fetchScripts();
    } catch (err) {
      console.error('[LandingPageScripts] Save error:', err);
      toast.error('Failed to save script');
    }
  }, [fetchScripts]);

  // ── Create new version ──
  const handleNewVersion = useCallback(async (baseScript: NarrationScript) => {
    const maxVersion = scripts
      .filter(s => s.region_code === baseScript.region_code && s.variant_label === baseScript.variant_label)
      .reduce((max, s) => Math.max(max, s.version), 0);

    try {
      const { error } = await supabase
        .from('regional_narration_scripts')
        .insert({
          region_code: baseScript.region_code,
          region_display_name: baseScript.region_display_name,
          language_code: baseScript.language_code,
          language_display_name: baseScript.language_display_name,
          hook: baseScript.hook,
          problem_statement: baseScript.problem_statement,
          solution: baseScript.solution,
          cta: baseScript.cta,
          positioning_angles: baseScript.positioning_angles,
          target_personas: baseScript.target_personas,
          emotional_tones: baseScript.emotional_tones,
          tts_provider: baseScript.tts_provider || getSubRegionTTSProvider(baseScript.region_code).provider,
          tts_voice_id: baseScript.tts_voice_id || getSubRegionTTSProvider(baseScript.region_code).voiceId,
          tts_voice_name: baseScript.tts_voice_name || getSubRegionTTSProvider(baseScript.region_code).voiceName,
          tts_speed: baseScript.tts_speed,
          tts_pitch: baseScript.tts_pitch,
          version: maxVersion + 1,
          status: 'draft',
          variant_label: baseScript.variant_label,
          is_default: false,
          llm_provider: baseScript.llm_provider,
          llm_model: baseScript.llm_model,
          routing_zone: baseScript.routing_zone,
          is_english_base: baseScript.is_english_base,
          english_base_script_id: baseScript.english_base_script_id,
        } as any);

      if (error) throw error;
      toast.success(`Version ${maxVersion + 1} created`);
      fetchScripts();
    } catch (err) {
      console.error('[LandingPageScripts] New version error:', err);
      toast.error('Failed to create new version');
    }
  }, [scripts, fetchScripts]);

  // ── Generate Improved Version via AI ──
  const handleGenerateImproved = useCallback(async () => {
    const scriptId = selectedScriptForImprovement || newNoteScriptId;
    if (!scriptId) {
      toast.error('Select a script to improve');
      return;
    }

    const script = scripts.find(s => s.id === scriptId);
    if (!script) {
      toast.error('Script not found');
      return;
    }

    // Gather open/accepted feedback for this script
    const relevantNotes = notes.filter(
      n => n.script_id === scriptId && (n.status === 'open' || n.status === 'accepted')
    );

    if (relevantNotes.length === 0) {
      toast.error('No open feedback to incorporate. Add feedback first.');
      return;
    }

    setIsGeneratingImproved(true);

    try {
      // Build structured feedback summary
      const feedbackBySection: Record<string, string[]> = {};
      relevantNotes.forEach(n => {
        const section = n.section_target || 'general';
        if (!feedbackBySection[section]) feedbackBySection[section] = [];
        const prefix = n.note_type === 'ab_learning' ? '[A/B LEARNING]' :
                       n.note_type === 'performance_insight' ? '[PERFORMANCE]' :
                       n.note_type === 'ai_suggestion' ? '[AI SUGGESTION]' : '[REVIEWER]';
        feedbackBySection[section].push(`${prefix} (${n.priority}): ${n.content}`);
      });

      const feedbackText = Object.entries(feedbackBySection)
        .map(([section, items]) => `### ${section.toUpperCase()} feedback:\n${items.join('\n')}`)
        .join('\n\n');

      const prompt = `You are a world-class marketing copywriter specializing in regional content localization.

TASK: Improve the following regional narration script by incorporating the accumulated feedback below. Maintain the Hook → Problem → Solution → CTA structure.

CURRENT SCRIPT (Region: ${script.region_display_name}, Personas: ${script.target_personas?.join(', ') || 'General'}, Tones: ${script.emotional_tones?.join(', ') || 'Professional'}):

HOOK: ${script.hook}

PROBLEM: ${script.problem_statement}

SOLUTION: ${script.solution}

CTA: ${script.cta}

---
ACCUMULATED FEEDBACK TO INCORPORATE:
${feedbackText}

---
INSTRUCTIONS:
1. Apply ALL feedback marked as [REVIEWER] and [A/B LEARNING] directly
2. Consider [PERFORMANCE] insights for engagement optimization  
3. Incorporate [AI SUGGESTION] items where they improve quality
4. Maintain the original emotional tones: ${script.emotional_tones?.join(', ') || 'professional'}
5. Keep the regional cultural context for ${script.region_display_name}
6. Use ${script.positioning_angles?.join(', ') || 'value-driven'} positioning

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{"hook":"improved hook text","problem_statement":"improved problem text","solution":"improved solution text","cta":"improved cta text","changes_summary":"bullet list of what changed and why","framework_used":"primary framework applied (StoryBrand/AIDA/JTBD/PAS)"}`;

      // Determine provider: user selection → zone recommendation → fallback
      const zoneProviders = getZoneAIProviders(script.region_code);
      const chosenProvider = selectedAIProvider 
        ? zoneProviders.find(p => p.id === selectedAIProvider) 
        : zoneProviders.find(p => p.isRecommended);
      const provider = chosenProvider || zoneProviders[0];

      const response = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_text',
          provider: provider.id,
          model: provider.model,
          prompt,
          systemPrompt: 'You are a regional marketing script optimizer. Return ONLY valid JSON, no markdown fences.',
          context: {
            region: script.region_code,
            persona: script.target_personas?.join(', '),
            framework: 'auto-detect',
            selectedProvider: provider.name,
          },
        },
      });

      if (response.error) throw response.error;

      const content = response.data?.content || response.data?.text || '';
      
      // Parse the JSON from the AI response
      let parsed;
      try {
        // Strip potential markdown fences
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('[LandingPageScripts] AI response parse error:', parseErr, content);
        toast.error('AI returned invalid format. Please try again.');
        return;
      }

      // Determine routing zone from region code
      const zoneMap: Record<string, string> = {
        'NAM': 'western', 'EU': 'western', 'LATAM': 'latam',
        'CJK': 'cjk', 'MENA': 'mena', 'INDIA': 'india',
        'SEA': 'sea', 'AFRICA': 'africa',
      };
      const parentZone = script.region_code.split('_')[0];
      const routingZone = zoneMap[parentZone] || 'western';

      setImprovedPreview({
        scriptId,
        hook: parsed.hook || script.hook,
        problem_statement: parsed.problem_statement || script.problem_statement,
        solution: parsed.solution || script.solution,
        cta: parsed.cta || script.cta,
        changes_summary: parsed.changes_summary || 'No summary provided',
        framework_used: parsed.framework_used || 'Auto',
        llm_provider: provider.id,
        llm_model: provider.model,
        llm_temperature: 0.7,
        llm_token_count: response.data?.usage?.totalTokens || response.data?.tokenCount || null,
        llm_prompt_template: 'regional_script_improvement_v1',
        routing_decision: `Zone-optimized: ${provider.name} selected for ${script.region_display_name} (${parentZone})`,
        routing_confidence_score: provider.isRecommended ? 0.95 : 0.75,
        routing_zone: routingZone,
      });
      setShowImprovedPreview(true);
      toast.success('Improved version generated! Review the changes.');
    } catch (err) {
      console.error('[LandingPageScripts] AI generation error:', err);
      toast.error('Failed to generate improved version');
    } finally {
      setIsGeneratingImproved(false);
    }
  }, [selectedScriptForImprovement, newNoteScriptId, scripts, notes, selectedAIProvider]);

  // ── Auto-generate English companion script for non-English regions ──
  const autoGenerateEnglishCompanion = useCallback(async (
    regionalScript: NarrationScript,
    preview: NonNullable<typeof improvedPreview>,
    version: number,
    regionalScriptId: string
  ) => {
    try {
      // Check if English companion already exists for this region + version
      const { data: existing } = await supabase
        .from('regional_narration_scripts')
        .select('id')
        .eq('region_code', regionalScript.region_code)
        .eq('language_code', 'en')
        .eq('version', version)
        .eq('is_english_base', true)
        .maybeSingle();

      if (existing) {
        console.log('[EnglishCompanion] Already exists for', regionalScript.region_code, 'v' + version);
        return;
      }

      // Insert English base version (same content as source, English language)
      const { data: englishScript } = await supabase
        .from('regional_narration_scripts')
        .insert({
          region_code: regionalScript.region_code,
          region_display_name: regionalScript.region_display_name,
          language_code: 'en',
          language_display_name: 'English',
          hook: preview.hook,
          problem_statement: preview.problem_statement,
          solution: preview.solution,
          cta: preview.cta,
          positioning_angles: regionalScript.positioning_angles,
          target_personas: regionalScript.target_personas,
          emotional_tones: regionalScript.emotional_tones,
          tts_provider: 'azure',
          tts_voice_id: 'en-US-JennyNeural',
          tts_voice_name: 'Jenny (US English)',
          tts_speed: regionalScript.tts_speed || 1.0,
          tts_pitch: regionalScript.tts_pitch || 'default',
          version,
          status: 'draft',
          variant_label: regionalScript.variant_label,
          is_default: false,
          is_english_base: true,
          llm_provider: preview.llm_provider || null,
          llm_model: preview.llm_model || null,
          llm_temperature: preview.llm_temperature || null,
          llm_token_count: preview.llm_token_count || null,
          llm_prompt_template: 'english_companion_auto',
          routing_decision: `Auto-generated English companion for ${regionalScript.region_display_name}`,
          routing_confidence_score: 1.0,
          routing_zone: 'western',
          generation_timestamp: new Date().toISOString(),
        } as any)
        .select('id')
        .single();

      // Link regional script to its English base
      if (englishScript?.id) {
        await supabase
          .from('regional_narration_scripts')
          .update({ english_base_script_id: englishScript.id } as any)
          .eq('id', regionalScriptId);
      }

      console.log('[EnglishCompanion] Created for', regionalScript.region_code, 'v' + version);
      toast.info(`🌐 English companion auto-generated for ${regionalScript.region_display_name}`);
    } catch (err) {
      console.error('[EnglishCompanion] Error:', err);
      // Non-blocking — don't fail the main operation
    }
  }, []);

  // ── Accept improved version → create new version with AI content ──
  const handleAcceptImproved = useCallback(async () => {
    if (!improvedPreview) return;

    const script = scripts.find(s => s.id === improvedPreview.scriptId);
    if (!script) return;

    const maxVersion = scripts
      .filter(s => s.region_code === script.region_code && s.variant_label === script.variant_label)
      .reduce((max, s) => Math.max(max, s.version), 0);

    try {
      // Note: full_script is a generated column - do NOT include it in insert
      const { data: insertedScript, error } = await supabase
        .from('regional_narration_scripts')
        .insert({
          region_code: script.region_code,
          region_display_name: script.region_display_name,
          language_code: script.language_code,
          language_display_name: script.language_display_name,
          hook: improvedPreview.hook,
          problem_statement: improvedPreview.problem_statement,
          solution: improvedPreview.solution,
          cta: improvedPreview.cta,
          positioning_angles: script.positioning_angles,
          target_personas: script.target_personas,
          emotional_tones: script.emotional_tones,
          tts_provider: script.tts_provider,
          tts_voice_id: script.tts_voice_id,
          tts_voice_name: script.tts_voice_name,
          tts_speed: script.tts_speed,
          tts_pitch: script.tts_pitch,
          version: maxVersion + 1,
          status: 'draft',
          variant_label: script.variant_label,
          is_default: false,
          // Generation metadata
          llm_provider: improvedPreview.llm_provider || null,
          llm_model: improvedPreview.llm_model || null,
          llm_temperature: improvedPreview.llm_temperature || null,
          llm_token_count: improvedPreview.llm_token_count || null,
          llm_prompt_template: improvedPreview.llm_prompt_template || null,
          routing_decision: improvedPreview.routing_decision || null,
          routing_confidence_score: improvedPreview.routing_confidence_score || null,
          routing_zone: improvedPreview.routing_zone || null,
          generation_timestamp: new Date().toISOString(),
          is_english_base: script.language_code === 'en',
        } as any)
        .select('id')
        .single();

      if (error) {
        console.error('[LandingPageScripts] Supabase insert error:', JSON.stringify(error));
        throw error;
      }

      // Auto-generate English companion if this is a non-English script
      if (script.language_code !== 'en' && insertedScript?.id) {
        await autoGenerateEnglishCompanion(script, improvedPreview, maxVersion + 1, insertedScript.id);
      }

      // Mark applied notes as 'applied'
      const relevantNoteIds = notes
        .filter(n => n.script_id === improvedPreview.scriptId && (n.status === 'open' || n.status === 'accepted'))
        .map(n => n.id);

      if (relevantNoteIds.length > 0) {
        await supabase
          .from('script_improvement_notes')
          .update({ status: 'applied', resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any)
          .in('id', relevantNoteIds);
      }

      toast.success(`Improved version ${maxVersion + 1} created! ${relevantNoteIds.length} notes marked as applied.`);
      setShowImprovedPreview(false);
      setImprovedPreview(null);
      fetchScripts();
      fetchNotes();
    } catch (err: any) {
      console.error('[LandingPageScripts] Accept improved error:', err);
      const msg = err?.message || err?.details || err?.hint || 'Unknown error';
      toast.error(`Failed to save improved version: ${msg}`);
    }
  }, [improvedPreview, scripts, notes, fetchScripts, fetchNotes]);

  // ── English Base Workflow: Create source script ──
  const englishBaseScript = useMemo(() => 
    scripts.find(s => s.region_code === 'ENGLISH_BASE' && s.is_english_base),
    [scripts]
  );

  const handleCreateEnglishBase = useCallback(async () => {
    setEditingScript(null);
    setShowEditor(false);
    // Open new editor for English Base creation
    setEditingScript({
      id: `new-${Date.now()}`,
      region_code: 'ENGLISH_BASE',
      region_display_name: 'English (Source)',
      language_code: 'en',
      language_display_name: 'English',
      hook: '',
      problem_statement: '',
      solution: '',
      cta: '',
      positioning_angles: [],
      target_personas: [],
      emotional_tones: [],
      tts_provider: 'azure',
      tts_voice_id: 'en-US-JennyNeural',
      tts_voice_name: 'Jenny (US English)',
      tts_speed: 1.0,
      tts_pitch: 'default',
      background_music_url: null,
      background_music_volume: null,
      generated_audio_url: null,
      audio_duration_seconds: null,
      audio_generated_at: null,
      version: 1,
      status: 'draft',
      is_default: false,
      variant_label: null,
      impression_count: null,
      play_count: null,
      completion_rate: null,
      created_by: null,
      approved_by: null,
      approved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      llm_provider: null,
      llm_model: null,
      llm_temperature: null,
      llm_token_count: null,
      llm_prompt_template: null,
      routing_decision: null,
      routing_confidence_score: null,
      routing_zone: null,
      generation_timestamp: null,
      is_english_base: true,
      english_base_script_id: null,
      full_script: null,
    } as NarrationScript);
    setShowEditor(true);
  }, []);

  const handleSaveEnglishBase = useCallback(async () => {
    if (!editingScript) return;
    
    try {
      if (editingScript.id.startsWith('new-')) {
        // Create new English base
        const maxVersion = scripts
          .filter(s => s.region_code === 'ENGLISH_BASE')
          .reduce((max, s) => Math.max(max, s.version), 0);

        const { error } = await supabase
          .from('regional_narration_scripts')
          .insert({
            region_code: 'ENGLISH_BASE',
            region_display_name: 'English (Source)',
            language_code: 'en',
            language_display_name: 'English',
            hook: editingScript.hook,
            problem_statement: editingScript.problem_statement,
            solution: editingScript.solution,
            cta: editingScript.cta,
            positioning_angles: editingScript.positioning_angles,
            target_personas: editingScript.target_personas,
            emotional_tones: editingScript.emotional_tones,
            tts_provider: 'azure',
            tts_voice_id: 'en-US-JennyNeural',
            tts_voice_name: 'Jenny (US English)',
            tts_speed: 1.0,
            version: maxVersion + 1,
            status: 'draft',
            is_english_base: true,
            llm_provider: null,
            routing_zone: 'western',
            generation_timestamp: new Date().toISOString(),
          } as any);

        if (error) throw error;
        toast.success('English Base Script created (v' + (maxVersion + 1) + ')');
      } else {
        // Update existing English base
        const { error } = await supabase
          .from('regional_narration_scripts')
          .update({
            hook: editingScript.hook,
            problem_statement: editingScript.problem_statement,
            solution: editingScript.solution,
            cta: editingScript.cta,
            positioning_angles: editingScript.positioning_angles,
            target_personas: editingScript.target_personas,
            emotional_tones: editingScript.emotional_tones,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', editingScript.id);

        if (error) throw error;
        toast.success('English Base Script updated');
      }

      setShowEditor(false);
      setEditingScript(null);
      fetchScripts();
    } catch (err) {
      console.error('[EnglishBase] Save error:', err);
      toast.error('Failed to save English Base Script');
    }
  }, [editingScript, scripts, fetchScripts]);

  const handleApproveEnglishBase = useCallback(async () => {
    if (!englishBaseScript) {
      toast.error('No English Base Script found');
      return;
    }

    try {
      // Step 1: Update English base status to active
      const { error: updateError } = await supabase
        .from('regional_narration_scripts')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', englishBaseScript.id);

      if (updateError) throw updateError;

      toast.success('✅ English Base Script approved!');

      // Step 2: Trigger auto-expand to all 38 sub-regions with transcreation
      await handleAutoExpandAndTranscreate(englishBaseScript);

      fetchScripts();
    } catch (err) {
      console.error('[EnglishBase] Approval error:', err);
      toast.error('Failed to approve English Base Script');
    }
  }, [englishBaseScript, fetchScripts]);

  // ── Auto-expand English base to all 38 sub-regions ──
  const handleAutoExpandAndTranscreate = useCallback(async (baseScript: NarrationScript) => {
    try {
      // Collect all sub-region codes from REGION_HIERARCHY
      const subRegionCodes: string[] = [];
      REGION_HIERARCHY.forEach(group => {
        if (group.children.length > 0) {
          group.children.forEach(child => subRegionCodes.push(child.code));
        } else {
          // Groups without children (Pakistan, Bangladesh)
          subRegionCodes.push(group.groupCode);
        }
      });

      console.log(`[AutoExpand] Starting transcreation for ${subRegionCodes.length} sub-regions`);

      // For each sub-region, call ai-universal-processor to transcreate the script
      const transcreationPromises = subRegionCodes.map(async (subRegionCode) => {
        try {
          // Get regional info
          const regionOption = REGION_OPTIONS.find(r => r.code === subRegionCode);
          if (!regionOption) return;

          // Determine zone and language code from region
          const zoneMap: Record<string, string> = {
            'NAM': 'western', 'EU': 'western', 'LATAM': 'latam',
            'CJK': 'cjk', 'MENA': 'mena', 'INDIA': 'india',
            'SEA': 'sea', 'AFRICA': 'africa', 'PAKISTAN': 'india', 'BANGLADESH': 'sea',
          };
          const parentZone = subRegionCode.split('_')[0];
          const routingZone = zoneMap[parentZone] || 'western';

          // Get AI provider for this zone
          const providers = getZoneAIProviders(subRegionCode);
          const provider = providers.find(p => p.isRecommended) || providers[0];

          // Get language code (simplified mapping)
          const languageMap: Record<string, string> = {
            'NAM_US': 'en', 'NAM_CA': 'fr',
            'EU_WEST': 'en', 'EU_DACH': 'de', 'EU_FRANCE': 'fr', 'EU_IBERIA': 'es', 'EU_NORDIC': 'sv', 'EU_EAST': 'pl',
            'LATAM_BRAZIL': 'pt-BR', 'LATAM_MEXICO': 'es', 'LATAM_ANDEAN': 'es', 'LATAM_CONESUR': 'es', 'LATAM_CARIB': 'es',
            'MENA_GULF': 'ar', 'MENA_EGYPT': 'ar', 'MENA_LEVANT': 'ar', 'MENA_MAGHREB': 'ar', 'MENA_MSA': 'ar',
            'AFRICA_WEST': 'en', 'AFRICA_EAST': 'sw', 'AFRICA_SOUTH': 'en', 'AFRICA_FRANCO': 'fr',
            'PAKISTAN': 'ur', 'BANGLADESH': 'bn',
            'INDIA_NORTH': 'hi', 'INDIA_SOUTH': 'ta', 'INDIA_WEST': 'gu', 'INDIA_EAST': 'bn', 'INDIA_PAN': 'en',
            'SEA_MALAY': 'ms', 'SEA_THAI': 'th', 'SEA_VIET': 'vi', 'SEA_PHIL': 'tl', 'SEA_PAN': 'en',
            'CJK_CN': 'zh', 'CJK_TW': 'zh', 'CJK_JP': 'ja', 'CJK_KR': 'ko',
          };
          const languageCode = languageMap[subRegionCode] || 'en';

          const maxVersion = scripts
            .filter(s => s.region_code === subRegionCode)
            .reduce((max, s) => Math.max(max, s.version), 0);

          // Build transcreation prompt
          const transcreationPrompt = `You are a world-class localization expert specializing in regional cultural adaptation.

TASK: Transcreate (not translate) the following marketing script for ${regionOption.name}. Adapt cultural context, idioms, and emotional resonance while maintaining the Hook → Problem → Solution → CTA structure.

ORIGINAL SCRIPT (English Base):
HOOK: ${baseScript.hook}
PROBLEM: ${baseScript.problem_statement}
SOLUTION: ${baseScript.solution}
CTA: ${baseScript.cta}

TARGET REGION: ${regionOption.name}
TARGET LANGUAGE: ${languageCode}
POSITIONING: ${baseScript.positioning_angles?.join(', ') || 'value-driven'}
PERSONAS: ${baseScript.target_personas?.join(', ') || 'general'}
TONE: ${baseScript.emotional_tones?.join(', ') || 'professional'}

INSTRUCTIONS:
1. Adapt all cultural references to resonate with ${regionOption.name}
2. Use local idioms and colloquialisms where appropriate
3. Maintain the original emotional tones
4. Keep the Hook → Problem → Solution → CTA structure
5. Return ONLY valid JSON (no markdown):
{"hook":"transcreated hook","problem_statement":"transcreated problem","solution":"transcreated solution","cta":"transcreated cta","cultural_adaptations":"list of key cultural changes made"}`;

          // Call transcreation API
          const response = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              action: 'generate_text',
              provider: provider.id,
              model: provider.model,
              prompt: transcreationPrompt,
              systemPrompt: 'You are a regional script transcreation expert. Return ONLY valid JSON, no markdown fences.',
              context: {
                region: subRegionCode,
                language: languageCode,
                zone: routingZone,
              },
            },
          });

          if (response.error) {
            console.error(`[AutoExpand] Transcreation failed for ${subRegionCode}:`, response.error);
            return;
          }

          // Parse transcreated content
          const content = response.data?.content || response.data?.text || '';
          let transcreated;
          try {
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            transcreated = JSON.parse(cleaned);
          } catch (parseErr) {
            console.error(`[AutoExpand] Parse error for ${subRegionCode}:`, parseErr);
            return;
          }

          // Get TTS provider for this sub-region
          const ttsProvider = getSubRegionTTSProvider(subRegionCode);

          // Insert transcreated script
          const { error: insertError } = await supabase
            .from('regional_narration_scripts')
            .insert({
              region_code: subRegionCode,
              region_display_name: regionOption.name,
              language_code: languageCode,
              language_display_name: regionOption.name,
              hook: transcreated.hook || baseScript.hook,
              problem_statement: transcreated.problem_statement || baseScript.problem_statement,
              solution: transcreated.solution || baseScript.solution,
              cta: transcreated.cta || baseScript.cta,
              positioning_angles: baseScript.positioning_angles,
              target_personas: baseScript.target_personas,
              emotional_tones: baseScript.emotional_tones,
              tts_provider: ttsProvider.provider,
              tts_voice_id: ttsProvider.voiceId,
              tts_voice_name: ttsProvider.voiceName,
              tts_speed: baseScript.tts_speed || 1.0,
              tts_pitch: baseScript.tts_pitch || 'default',
              version: maxVersion + 1,
              status: 'draft',
              is_english_base: false,
              english_base_script_id: baseScript.id,
              llm_provider: provider.id,
              llm_model: provider.model,
              llm_temperature: 0.7,
              llm_token_count: response.data?.usage?.totalTokens || null,
              llm_prompt_template: 'regional_transcreation_v1',
              routing_decision: `Zone-optimized: ${provider.name} selected for ${regionOption.name} (${parentZone})`,
              routing_confidence_score: provider.isRecommended ? 0.95 : 0.75,
              routing_zone: routingZone,
              generation_timestamp: new Date().toISOString(),
            } as any);

          if (insertError) {
            console.error(`[AutoExpand] Insert failed for ${subRegionCode}:`, insertError);
            return;
          }

          console.log(`[AutoExpand] ✅ Created transcreation for ${subRegionCode}`);
        } catch (err) {
          console.error(`[AutoExpand] Error processing ${subRegionCode}:`, err);
        }
      });

      // Execute all transcreations in parallel (batched to avoid rate limits)
      const BATCH_SIZE = 5;
      for (let i = 0; i < transcreationPromises.length; i += BATCH_SIZE) {
        const batch = transcreationPromises.slice(i, i + BATCH_SIZE);
        await Promise.all(batch);
        if (i + BATCH_SIZE < transcreationPromises.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between batches
        }
      }

      toast.success(`🌍 Auto-expanded English base to ${subRegionCodes.length} sub-regions!`);
    } catch (err) {
      console.error('[AutoExpand] Error:', err);
      toast.error('Failed to auto-expand to sub-regions');
    }
  }, [scripts, fetchScripts]);

  // ── Expand a parent-level script to its sub-regions (manual trigger) ──

  const handleExpandToSubRegions = useCallback(async (parentScript: NarrationScript) => {
    // Find the region group for this script
    const parentCode = parentScript.region_code.toUpperCase();
    const group = REGION_HIERARCHY.find(g => 
      g.groupCode === parentCode || g.groupCode.toLowerCase() === parentScript.region_code
    );
    
    if (!group || group.children.length === 0) {
      toast.error('This region has no sub-regions to expand to.');
      return;
    }

    // Check which sub-regions already have scripts
    const existingSubRegions = scripts
      .filter(s => group.children.some(c => c.code === s.region_code))
      .map(s => s.region_code);

    const missingSubRegions = group.children.filter(c => !existingSubRegions.includes(c.code));

    if (missingSubRegions.length === 0) {
      toast.info(`All ${group.children.length} sub-regions already have scripts.`);
      return;
    }

    setExpandingRegion(parentScript.region_code);
    toast.info(`🌍 Expanding to ${missingSubRegions.length} sub-regions for ${group.groupName}...`);

    try {
      const BATCH_SIZE = 3;
      let created = 0;

      for (let i = 0; i < missingSubRegions.length; i += BATCH_SIZE) {
        const batch = missingSubRegions.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (child) => {
          try {
            const providers = getZoneAIProviders(child.code);
            const provider = providers.find(p => p.isRecommended) || providers[0];
            const ttsProvider = getSubRegionTTSProvider(child.code);

            // Language mapping
            const languageMap: Record<string, string> = {
              'AFRICA_WEST': 'en', 'AFRICA_EAST': 'sw', 'AFRICA_SOUTH': 'en', 'AFRICA_FRANCO': 'fr',
              'NAM_US': 'en', 'NAM_CA': 'fr',
              'EU_WEST': 'en', 'EU_DACH': 'de', 'EU_FRANCE': 'fr', 'EU_IBERIA': 'es', 'EU_NORDIC': 'sv', 'EU_EAST': 'pl',
              'LATAM_BRAZIL': 'pt-BR', 'LATAM_MEXICO': 'es', 'LATAM_ANDEAN': 'es', 'LATAM_CONESUR': 'es', 'LATAM_CARIB': 'es',
              'MENA_GULF': 'ar', 'MENA_EGYPT': 'ar', 'MENA_LEVANT': 'ar', 'MENA_MAGHREB': 'ar', 'MENA_MSA': 'ar',
              'INDIA_NORTH': 'hi', 'INDIA_SOUTH': 'ta', 'INDIA_WEST': 'gu', 'INDIA_EAST': 'bn', 'INDIA_PAN': 'en',
              'SEA_MALAY': 'ms', 'SEA_THAI': 'th', 'SEA_VIET': 'vi', 'SEA_PHIL': 'tl', 'SEA_PAN': 'en',
              'CJK_CN': 'zh', 'CJK_TW': 'zh', 'CJK_JP': 'ja', 'CJK_KR': 'ko',
            };
            const languageCode = languageMap[child.code] || 'en';

            const zoneMap: Record<string, string> = {
              'NAM': 'western', 'EU': 'western', 'LATAM': 'latam',
              'CJK': 'cjk', 'MENA': 'mena', 'INDIA': 'india',
              'SEA': 'sea', 'AFRICA': 'africa',
            };
            const parentZone = child.code.split('_')[0];
            const routingZone = zoneMap[parentZone] || 'western';

            // Transcreation prompt
            const prompt = `You are a world-class localization expert specializing in regional cultural adaptation.

TASK: Transcreate (not translate) the following marketing script for ${child.name}. Adapt cultural context, idioms, and emotional resonance while maintaining the Hook → Problem → Solution → CTA structure.

ORIGINAL SCRIPT:
HOOK: ${parentScript.hook}
PROBLEM: ${parentScript.problem_statement}
SOLUTION: ${parentScript.solution}
CTA: ${parentScript.cta}

TARGET REGION: ${child.name}
TARGET LANGUAGE: ${languageCode}
POSITIONING: ${parentScript.positioning_angles?.join(', ') || 'value-driven'}
TONE: ${parentScript.emotional_tones?.join(', ') || 'professional'}

Return ONLY valid JSON: {"hook":"...","problem_statement":"...","solution":"...","cta":"..."}`;

            const response = await supabase.functions.invoke('ai-universal-processor', {
              body: {
                action: 'generate_text',
                provider: provider.id,
                model: provider.model,
                prompt,
                systemPrompt: 'You are a regional script transcreation expert. Return ONLY valid JSON.',
              },
            });

            if (response.error) {
              console.error(`[ExpandSub] Transcreation failed for ${child.code}:`, response.error);
              return;
            }

            const content = response.data?.content || response.data?.text || '';
            let transcreated;
            try {
              const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              transcreated = JSON.parse(cleaned);
            } catch {
              console.error(`[ExpandSub] Parse error for ${child.code}`);
              return;
            }

            const { error: insertError } = await supabase
              .from('regional_narration_scripts')
              .insert({
                region_code: child.code,
                region_display_name: child.name,
                language_code: languageCode,
                language_display_name: child.name,
                hook: transcreated.hook || parentScript.hook,
                problem_statement: transcreated.problem_statement || parentScript.problem_statement,
                solution: transcreated.solution || parentScript.solution,
                cta: transcreated.cta || parentScript.cta,
                positioning_angles: parentScript.positioning_angles,
                target_personas: parentScript.target_personas,
                emotional_tones: parentScript.emotional_tones,
                tts_provider: ttsProvider.provider,
                tts_voice_id: ttsProvider.voiceId,
                tts_voice_name: ttsProvider.voiceName,
                tts_speed: parentScript.tts_speed || 1.0,
                version: 1,
                status: 'draft',
                is_english_base: false,
                english_base_script_id: parentScript.id,
                llm_provider: provider.id,
                llm_model: provider.model,
                llm_temperature: 0.7,
                llm_prompt_template: 'sub_region_expansion_v1',
                routing_decision: `Sub-region expansion: ${provider.name} for ${child.name}`,
                routing_confidence_score: provider.isRecommended ? 0.95 : 0.75,
                routing_zone: routingZone,
                generation_timestamp: new Date().toISOString(),
              } as any);

            if (insertError) {
              console.error(`[ExpandSub] Insert failed for ${child.code}:`, insertError);
              return;
            }
            created++;
            console.log(`[ExpandSub] ✅ Created ${child.code}`);
          } catch (err) {
            console.error(`[ExpandSub] Error for ${child.code}:`, err);
          }
        }));

        if (i + BATCH_SIZE < missingSubRegions.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`🌍 Expanded to ${created}/${missingSubRegions.length} sub-regions for ${group.groupName}!`);
      fetchScripts();
    } catch (err) {
      console.error('[ExpandSub] Error:', err);
      toast.error('Failed to expand to sub-regions');
    } finally {
      setExpandingRegion(null);
    }
  }, [scripts, fetchScripts]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Landing Page Scripts
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage regional hero narration scripts with versioning and A/B variants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {scripts.length} scripts
          </Badge>
          <Badge variant="outline" className="text-xs">
            {scripts.filter(s => s.status === 'active').length} active
          </Badge>
          <Button size="sm" variant="outline" onClick={fetchScripts} className="gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── ENGLISH BASE WORKFLOW SECTION ─── */}
      {englishBaseScript ? (
        <Card className="bg-gradient-to-r from-blue-50/50 to-blue-50/30 border-primary/30">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <CardTitle className="text-sm font-semibold">
                  English Base Script (Source of Truth)
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  v{englishBaseScript.version}
                </Badge>
                <Badge
                  className={cn(
                    'text-[10px]',
                    englishBaseScript.status === 'active'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  )}
                >
                  {englishBaseScript.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1"
                  onClick={() => {
                    setEditingScript(englishBaseScript);
                    setShowEditor(true);
                  }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                {englishBaseScript.status !== 'active' && (
                  <Button
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={handleApproveEnglishBase}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <span className="font-medium">Hook:</span> {englishBaseScript.hook}
            </div>
            <div>
              <span className="font-medium">Problem:</span> {englishBaseScript.problem_statement}
            </div>
            <div>
              <span className="font-medium">Solution:</span> {englishBaseScript.solution}
            </div>
            <div>
              <span className="font-medium">CTA:</span> {englishBaseScript.cta}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">No English Base Script</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create the source script first. This becomes the base for all regional transcreations.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1"
              onClick={handleCreateEnglishBase}
            >
              <Plus className="w-3.5 h-3.5" />
              Create English Base
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2">
        {[
          { id: 'workflow' as const, label: 'Workflow', icon: GitBranch },
          { id: 'scripts' as const, label: 'Regional Scripts', icon: FileText },
          { id: 'tts-preview' as const, label: 'TTS Preview', icon: Headphones },
          { id: 'versions' as const, label: 'Version History', icon: History },
          { id: 'feedback' as const, label: 'Feedback & Suggestions', icon: Lightbulb },
        ].map(tab => (
          <Button
            key={tab.id}
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 text-xs font-medium",
              subTab === tab.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted/50"
            )}
            onClick={() => setSubTab(tab.id)}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs min-w-[180px] justify-between">
                <span className="truncate">
                  {filterRegions.length === 0
                    ? 'All Regions'
                    : filterRegions.length === 1
                      ? (REGION_OPTIONS.find(r => r.code === filterRegions[0])?.name ?? filterRegions[0])
                      : `${filterRegions.length} regions`}
                </span>
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="p-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-7"
                  onClick={() => setFilterRegions([])}
                >
                  <Globe className="w-3.5 h-3.5 mr-2" />
                  All Regions
                  {filterRegions.length === 0 && <Check className="w-3.5 h-3.5 ml-auto" />}
                </Button>
              </div>
              <ScrollArea className="h-[320px]">
                <div className="p-1">
                  {REGION_HIERARCHY.map(group => {
                    const codes = getGroupCodes(group);
                    const allSelected = codes.every(c => filterRegions.includes(c));
                    const someSelected = codes.some(c => filterRegions.includes(c));
                    const hasChildren = group.children.length > 0;

                    const toggleGroup = () => {
                      if (allSelected) {
                        setFilterRegions(prev => prev.filter(c => !codes.includes(c)));
                      } else {
                        setFilterRegions(prev => [...new Set([...prev, ...codes])]);
                      }
                    };

                    const toggleChild = (code: string) => {
                      setFilterRegions(prev =>
                        prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
                      );
                    };

                    return (
                      <div key={group.groupCode} className="mb-0.5">
                        <div
                          className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer text-xs"
                          onClick={hasChildren ? toggleGroup : () => toggleChild(group.groupCode)}
                        >
                          <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected && !allSelected}
                            onCheckedChange={hasChildren ? toggleGroup : () => toggleChild(group.groupCode)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="mr-1">{group.groupFlag}</span>
                          <span className="font-medium">{group.groupName}</span>
                          {hasChildren && (
                            <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                              {codes.filter(c => filterRegions.includes(c)).length}/{codes.length}
                            </Badge>
                          )}
                        </div>
                        {hasChildren && (
                          <div className="ml-5 border-l border-border/50 pl-2">
                            {group.children.map(child => (
                              <div
                                key={child.code}
                                className="flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-accent cursor-pointer text-xs"
                                onClick={() => toggleChild(child.code)}
                              >
                                <Checkbox
                                  checked={filterRegions.includes(child.code)}
                                  onCheckedChange={() => toggleChild(child.code)}
                                  className="h-3.5 w-3.5"
                                />
                                <span className="mr-1">{child.flag}</span>
                                <span className="text-muted-foreground">{child.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              {filterRegions.length > 0 && (
                <div className="p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-7 text-muted-foreground"
                    onClick={() => setFilterRegions([])}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── SCRIPTS TAB ─── */}
        {subTab === 'scripts' && (
          <motion.div
            key="scripts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : Object.keys(groupedByRegion).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Globe className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No scripts found matching filters</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedByRegion).map(([regionCode, regionScripts]) => {
                const regionInfo = REGION_OPTIONS.find(r => r.code === regionCode);
                // Check if this is a parent-level script that has sub-regions
                const parentGroup = REGION_HIERARCHY.find(g => 
                  g.groupCode === regionCode.toUpperCase() || g.groupCode.toLowerCase() === regionCode
                );
                const hasSubRegions = parentGroup && parentGroup.children.length > 0;
                const existingSubRegionCount = hasSubRegions 
                  ? parentGroup.children.filter(c => scripts.some(s => s.region_code === c.code)).length 
                  : 0;
                const isExpanding = expandingRegion === regionCode;

                return (
                  <Card key={regionCode} className="overflow-hidden">
                    <CardHeader className="py-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="text-lg">{regionInfo?.flag}</span>
                          {regionInfo?.name || regionCode}
                          <Badge variant="outline" className="text-[10px] ml-2">
                            {regionScripts.length} script{regionScripts.length > 1 ? 's' : ''}
                          </Badge>
                          {hasSubRegions && (
                            <Badge variant="secondary" className="text-[10px]">
                              {existingSubRegionCount}/{parentGroup.children.length} sub-regions
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {/* Expand to Sub-Regions button — visible for parent-level scripts */}
                          {hasSubRegions && existingSubRegionCount < parentGroup.children.length && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 gap-1"
                              disabled={isExpanding}
                              onClick={() => handleExpandToSubRegions(regionScripts[0])}
                            >
                              {isExpanding ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Globe className="w-3 h-3" />
                              )}
                              {isExpanding ? 'Expanding...' : `Expand to ${parentGroup.children.length - existingSubRegionCount} Sub-Regions`}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCreateVariant(regionScripts[0], `Variant ${String.fromCharCode(65 + regionScripts.length)}`)}>
                                <Tag className="w-3.5 h-3.5 mr-2" />
                                New A/B Variant
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleNewVersion(regionScripts[0])}>
                                <History className="w-3.5 h-3.5 mr-2" />
                                New Version
                              </DropdownMenuItem>
                              {hasSubRegions && existingSubRegionCount < parentGroup.children.length && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleExpandToSubRegions(regionScripts[0])}
                                    disabled={isExpanding}
                                  >
                                    <Globe className="w-3.5 h-3.5 mr-2" />
                                    Expand to Sub-Regions
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {regionScripts.map(script => {
                          const statusCfg = STATUS_CONFIG[script.status as ScriptStatus] || STATUS_CONFIG.draft;
                          const StatusIcon = statusCfg.icon;
                          return (
                            <div key={script.id} className="p-4 hover:bg-muted/20 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-2">
                                  {/* Meta row */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={cn("text-[10px] gap-1", statusCfg.color)}>
                                      <StatusIcon className="w-3 h-3" />
                                      {statusCfg.label}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      v{script.version}
                                    </Badge>
                                    {script.variant_label && (
                                      <Badge variant="secondary" className="text-[10px] gap-1">
                                        <Tag className="w-2.5 h-2.5" />
                                        {script.variant_label}
                                      </Badge>
                                    )}
                                    {script.is_default && (
                                      <Badge className="text-[10px] bg-primary/10 text-primary">
                                        Default
                                      </Badge>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {script.language_display_name}
                                    </span>
                                    {script.tts_provider && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Mic className="w-2.5 h-2.5" />
                                        {script.tts_provider}
                                      </span>
                                    )}
                                  </div>

                                  {/* Script preview */}
                                  <div className="space-y-1.5">
                                    <p className="text-sm font-medium line-clamp-1">
                                      🎯 {script.hook}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {script.problem_statement}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      ✨ {script.solution}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      📢 {script.cta}
                                    </p>
                                    {/* Tags row: Positioning, Tones, Personas */}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {script.positioning_angles?.length > 0 && script.positioning_angles.map(a => (
                                        <Badge key={`pa-${a}`} variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                                          📐 {a}
                                        </Badge>
                                      ))}
                                      {script.emotional_tones?.length > 0 && script.emotional_tones.map(t => (
                                        <Badge key={`et-${t}`} variant="outline" className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200">
                                          🎭 {t}
                                        </Badge>
                                      ))}
                                      {script.target_personas?.length > 0 && script.target_personas.map(p => (
                                        <Badge key={`tp-${p}`} variant="outline" className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
                                          👥 {p}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* Visible Approve button for review scripts */}
                                  {script.status === 'review' && (
                                    <Button
                                      size="sm"
                                      className="text-xs h-7 gap-1"
                                      onClick={() => handleStatusChange(script.id, 'active')}
                                    >
                                      <Check className="w-3 h-3" />
                                      Approve
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setEditingScript({ ...script });
                                      setShowEditor(true);
                                    }}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleStatusChange(script.id, 'review')}>
                                        <Eye className="w-3.5 h-3.5 mr-2" />
                                        Submit for Review
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusChange(script.id, 'active')}>
                                        <Check className="w-3.5 h-3.5 mr-2" />
                                        Set Active
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {!script.is_english_base && (
                                        <DropdownMenuItem onClick={() => handleReTranscreate(script)}>
                                          <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                          Re-transcreate from English Base
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => handleCreateVariant(script, `Variant ${String.fromCharCode(65 + regionScripts.length)}`)}>
                                        <Copy className="w-3.5 h-3.5 mr-2" />
                                        Clone as Variant
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleNewVersion(script)}>
                                        <History className="w-3.5 h-3.5 mr-2" />
                                        New Version
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleStatusChange(script.id, 'archived')} className="text-destructive">
                                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                                        Archive
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              {/* Analytics mini row */}
                              {(script.impression_count || script.play_count) ? (
                                <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                                  <span>👁 {script.impression_count || 0} impressions</span>
                                  <span>▶ {script.play_count || 0} plays</span>
                                  {script.completion_rate != null && (
                                    <span>✅ {(script.completion_rate * 100).toFixed(0)}% completion</span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </motion.div>
        )}

        {/* ─── TTS PREVIEW TAB ─── */}
        {subTab === 'tts-preview' && (
          <motion.div
            key="tts-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {scripts.filter(s => s.status === 'active' || s.status === 'review').length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground text-sm">
                    No active or in-review scripts to preview. Submit a script for review or set it to "Active" first.
                  </div>
                </CardContent>
              </Card>
            ) : (
              REGION_HIERARCHY.map(group => {
                const groupCodes = getGroupCodes(group);
                const groupScripts = scripts.filter(s => (s.status === 'active' || s.status === 'review') && groupCodes.includes(s.region_code));
                if (groupScripts.length === 0) return null;

                return (
                  <Card key={group.groupCode}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-primary" />
                        <span>{group.groupFlag}</span>
                        {group.groupName}
                        <Badge variant="outline" className="text-[10px] ml-auto">
                          {groupScripts.length} script{groupScripts.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {groupScripts.map(script => {
                          const ttsInfo = getSubRegionTTSProvider(script.region_code);
                          const regionOpt = REGION_OPTIONS.find(r => r.code === script.region_code);
                          const scriptTTSVersions = ttsVersions.filter(tv => tv.script_id === script.id);
                          const latestTTS = scriptTTSVersions[0];
                          const ttsFeedbackCount = notes.filter(n => n.script_id === script.id && n.note_type === 'tts_feedback' && (n.status === 'open' || n.status === 'accepted')).length;
                          const isGenerating = generatingTTSForScript === script.id;

                          return (
                            <div key={script.id} className="flex items-center gap-3 px-4 py-3">
                              <div className="flex-shrink-0 text-lg">
                                {regionOpt?.flag || group.groupFlag}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {script.region_display_name}
                                  {script.variant_label && <span className="text-muted-foreground"> — {script.variant_label}</span>}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                    v{script.version}
                                  </Badge>
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                    🔊 {latestTTS?.tts_provider || script.tts_provider || ttsInfo.provider}
                                  </Badge>
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                    🌐 {latestTTS?.tts_locale || ttsInfo.locale}
                                  </Badge>
                                  {scriptTTSVersions.length > 0 && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                      🎙 {scriptTTSVersions.length} TTS version{scriptTTSVersions.length !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                  {ttsFeedbackCount > 0 && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                      💬 {ttsFeedbackCount} TTS note{ttsFeedbackCount !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                                {latestTTS && (
                                  <p className="text-[9px] text-muted-foreground mt-0.5">
                                    Latest: {new Date(latestTTS.generated_at).toLocaleString()} • {latestTTS.generation_mode === 'auto' ? '⚡ Auto' : '✋ Manual'}
                                    {latestTTS.audio_duration_seconds && ` • ${Number(latestTTS.audio_duration_seconds).toFixed(1)}s`}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {/* Approve button for review scripts */}
                                {script.status === 'review' && (
                                  <Button
                                    size="sm"
                                    className="gap-1 text-xs h-7"
                                    onClick={() => handleStatusChange(script.id, 'active')}
                                  >
                                    <Check className="w-3 h-3" />
                                    Approve
                                  </Button>
                                )}
                                {(latestTTS?.audio_url || script.generated_audio_url) ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs h-7"
                                    onClick={async () => {
                                      const url = latestTTS?.audio_url || script.generated_audio_url;
                                      if (!url) return;
                                      if (playingScriptId === script.id) {
                                        playingAudioRef.current?.pause();
                                        playingAudioRef.current = null;
                                        setPlayingScriptId(null);
                                      } else {
                                        playingAudioRef.current?.pause();
                                        const audio = new Audio();
                                        
                                        // Set audio source directly - browsers natively handle data URIs
                                        audio.src = url;
                                        
                                        audio.onended = () => { setPlayingScriptId(null); playingAudioRef.current = null; };
                                        audio.onerror = (e) => { 
                                          console.error('[TTS Play] Audio error:', e); 
                                          toast.error('Failed to play audio'); 
                                          setPlayingScriptId(null); 
                                        };
                                        
                                        playingAudioRef.current = audio;
                                        setPlayingScriptId(script.id);
                                        audio.play().catch((err) => {
                                          console.error('[TTS Play] Play error:', err);
                                          toast.error('Playback failed');
                                          setPlayingScriptId(null);
                                        });
                                      }
                                    }}
                                  >
                                    {playingScriptId === script.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    {playingScriptId === script.id ? 'Stop' : 'Play'}
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-[10px]">
                                    No audio yet
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-xs h-7"
                                  disabled={isGenerating || script.status !== 'active'}
                                  onClick={() => handleGenerateTTS(script, 'manual')}
                                  title={script.status !== 'active' ? 'Script must be approved (active) before TTS generation' : 'Generate TTS audio'}
                                >
                                  {isGenerating ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3 h-3" />
                                  )}
                                  {isGenerating ? 'Generating...' : script.status !== 'active' ? 'Approve First' : 'Generate'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
            <p className="text-[10px] text-muted-foreground text-center">
              TTS routing: Azure Neural (NAM, EU, LATAM, MENA, Africa, India, SEA, CJK_TW, CJK_KR) • Qwen3-TTS (CJK_CN, CJK_JP)
            </p>
          </motion.div>
        )}

        {/* ─── VERSIONS TAB ─── */}
        {subTab === 'versions' && (
          <motion.div
            key="versions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1"
          >
            {REGION_HIERARCHY.map(group => {
              const groupCodes = getGroupCodes(group);
              const groupScripts = scripts.filter(s => groupCodes.includes(s.region_code));
              if (groupScripts.length === 0) return null;

              // Group scripts by sub-region — scripts may use parent-level codes (africa) or sub-region codes (AFRICA_WEST)
              const matchedByChild = group.children.length > 0
                ? group.children.map(child => ({
                    ...child,
                    scripts: groupScripts.filter(s => s.region_code === child.code).sort((a, b) => b.version - a.version),
                  })).filter(sr => sr.scripts.length > 0)
                : [];
              // Scripts using parent-level code (e.g. 'africa') that don't match any child
              const childCodes = group.children.map(c => c.code);
              const parentLevelScripts = groupScripts.filter(s => !childCodes.includes(s.region_code)).sort((a, b) => b.version - a.version);
              const subRegions = [
                ...(parentLevelScripts.length > 0 ? [{ code: group.groupCode, name: group.groupName, flag: group.groupFlag, scripts: parentLevelScripts }] : []),
                ...matchedByChild,
              ];

              return (
                <Card key={group.groupCode}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" />
                      <span>{group.groupFlag}</span>
                      {group.groupName}
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {groupScripts.length} version{groupScripts.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-y-auto">
                      {subRegions.map((sr) => {
                        // Get TTS versions for this sub-region's scripts
                        const srScriptIds = sr.scripts.map(s => s.id);
                        const srTTSVersions = ttsVersions.filter(tv => srScriptIds.includes(tv.script_id));

                        // Build interleaved timeline: script events + TTS events
                        type TimelineItem = 
                          | { type: 'script'; script: NarrationScript; timestamp: string }
                          | { type: 'tts'; ttsVersion: any; scriptRef: NarrationScript | undefined; timestamp: string };

                        const timeline: TimelineItem[] = [
                          ...sr.scripts.map(s => ({ type: 'script' as const, script: s, timestamp: s.updated_at })),
                          ...srTTSVersions.map(tv => ({
                            type: 'tts' as const,
                            ttsVersion: tv,
                            scriptRef: sr.scripts.find(s => s.id === tv.script_id),
                            timestamp: tv.generated_at,
                          })),
                        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                        return (
                          <div key={sr.code}>
                            {group.children.length > 0 && (
                              <div className="px-4 py-1.5 bg-muted/50 border-y flex items-center gap-2">
                                <span className="text-xs">{sr.flag}</span>
                                <span className="text-[11px] font-medium">{sr.name}</span>
                                <Badge variant="outline" className="text-[9px] ml-auto">
                                  {sr.scripts.length} script{sr.scripts.length !== 1 ? 's' : ''} • {srTTSVersions.length} TTS
                                </Badge>
                              </div>
                            )}
                            <div className="divide-y">
                              {timeline.map((item, idx) => {
                                if (item.type === 'script') {
                                  const script = item.script;
                                  const statusCfg = STATUS_CONFIG[script.status as ScriptStatus] || STATUS_CONFIG.draft;
                                  const ttsInfo = getSubRegionTTSProvider(script.region_code);
                                  const scriptFeedback = notes.filter(n => n.script_id === script.id && n.note_type !== 'tts_feedback' && (n.status === 'open' || n.status === 'accepted')).length;

                                  return (
                                    <div key={`s-${script.id}`} className="flex items-center gap-3 px-4 py-3">
                                      <div className="flex flex-col items-center">
                                        <div className={cn(
                                          "w-3 h-3 rounded-full border-2",
                                          script.status === 'active' ? 'bg-primary border-primary' : 'bg-muted border-border'
                                        )} />
                                        {idx < timeline.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="outline" className="text-[9px] px-1 py-0">📝 Script</Badge>
                                          <span className="text-xs font-semibold">v{script.version}</span>
                                          {script.variant_label && <Badge variant="secondary" className="text-[10px]">{script.variant_label}</Badge>}
                                          <Badge className={cn("text-[10px]", statusCfg.color)}>{statusCfg.label}</Badge>
                                          <Badge variant="outline" className="text-[9px] px-1 py-0">🔊 {ttsInfo.provider}</Badge>
                                          {scriptFeedback > 0 && <Badge variant="secondary" className="text-[9px] px-1 py-0">💬 {scriptFeedback}</Badge>}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                          {new Date(script.updated_at).toLocaleString()} — {script.hook?.slice(0, 60)}...
                                        </p>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  const tv = item.ttsVersion;
                                  const ttsFeedback = notes.filter(n => (n as any).tts_version_id === tv.id && (n.status === 'open' || n.status === 'accepted')).length;

                                  return (
                                    <div key={`t-${tv.id}`} className="flex items-center gap-3 px-4 py-3 bg-muted/20">
                                      <div className="flex flex-col items-center">
                                        <div className={cn(
                                          "w-3 h-3 rounded-full border-2",
                                          tv.status === 'completed' ? 'bg-accent border-accent' : tv.status === 'failed' ? 'bg-destructive border-destructive' : 'bg-muted border-border'
                                        )} />
                                        {idx < timeline.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="outline" className="text-[9px] px-1 py-0">🎙 TTS v{tv.version_number}</Badge>
                                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                            🔊 {tv.tts_provider}
                                          </Badge>
                                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                                            🌐 {tv.tts_locale}
                                          </Badge>
                                          <Badge variant={tv.generation_mode === 'auto' ? 'default' : 'secondary'} className="text-[9px] px-1 py-0">
                                            {tv.generation_mode === 'auto' ? '⚡ Auto' : '✋ Manual'}
                                          </Badge>
                                          {tv.status === 'failed' && <Badge variant="destructive" className="text-[9px] px-1 py-0">Failed</Badge>}
                                          {tv.fallback_used && <Badge variant="outline" className="text-[9px] px-1 py-0">↩ Fallback</Badge>}
                                          {ttsFeedback > 0 && <Badge variant="secondary" className="text-[9px] px-1 py-0">💬 {ttsFeedback}</Badge>}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                          {new Date(tv.generated_at).toLocaleString()}
                                          {tv.audio_duration_seconds && ` • ${Number(tv.audio_duration_seconds).toFixed(1)}s`}
                                          {tv.characters_processed && ` • ${tv.characters_processed} chars`}
                                          {item.scriptRef && ` • Script v${item.scriptRef.version}`}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {tv.audio_url && tv.status === 'completed' && (
                                          <Button variant="ghost" size="sm" className="h-7" asChild>
                                            <a href={tv.audio_url} target="_blank" rel="noopener noreferrer">
                                              <Play className="w-3 h-3" />
                                            </a>
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={() => handleDeleteTTSVersion(tv.id)}
                                          title="Delete this TTS version"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* ─── FEEDBACK & SUGGESTIONS TAB ─── */}
        {subTab === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Feedback Category Tabs: Script vs TTS */}
            <div className="flex gap-2 border-b pb-2">
              {[
                { id: 'all', label: '📋 All Feedback', desc: 'Show everything' },
                { id: 'script', label: '📝 Script Feedback', desc: 'Content, messaging, transcreation' },
                { id: 'tts', label: '🎙 TTS / Audio Feedback', desc: 'Voice, prosody, pronunciation' },
              ].map(cat => {
                const isActive = (feedbackCategoryFilter || 'all') === cat.id;
                return (
                  <Button
                    key={cat.id}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => setFeedbackCategoryFilter(cat.id as 'all' | 'script' | 'tts')}
                  >
                    {cat.label}
                  </Button>
                );
              })}
            </div>

            {/* Add New Feedback */}
            <Card className={cn(
              newNoteType === 'tts_feedback' 
                ? 'border-violet-300 dark:border-violet-700 bg-violet-50/30 dark:bg-violet-950/20' 
                : ''
            )}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  {newNoteType === 'tts_feedback' ? '🎙 Add TTS / Audio Feedback' : '📝 Add Script Feedback / Suggestion'}
                </CardTitle>
                {newNoteType === 'tts_feedback' && (
                  <p className="text-[10px] text-violet-600 dark:text-violet-400">
                    Voice issues (accent, pacing, tone) → TTS regeneration only. Content issues → escalate to script revision.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Row 1: Script, Type, Region/Sub-region */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Script</Label>
                    <Select value={newNoteScriptId} onValueChange={setNewNoteScriptId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select script..." />
                      </SelectTrigger>
                      <SelectContent>
                        {scripts.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {REGION_OPTIONS.find(r => r.code === s.region_code)?.flag} {s.region_display_name} v{s.version}
                            {s.variant_label ? ` (${s.variant_label})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Feedback Type</Label>
                    <Select value={newNoteType} onValueChange={(v) => {
                      setNewNoteType(v);
                      // Reset section when switching types
                      if (v === 'tts_feedback') setNewNoteSection('voice_quality');
                      else if (newNoteSection.startsWith('voice_') || newNoteSection === 'pronunciation' || newNoteSection === 'pacing_timing' || newNoteSection === 'tts_provider_issue') setNewNoteSection('general');
                    }}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reviewer_comment">💬 Script: Reviewer Comment</SelectItem>
                        <SelectItem value="ab_learning">📊 Script: A/B Learning</SelectItem>
                        <SelectItem value="ai_suggestion">✨ Script: AI Suggestion</SelectItem>
                        <SelectItem value="performance_insight">💡 Script: Performance Insight</SelectItem>
                        <SelectItem value="tts_feedback">🎙 TTS: Audio/Voice Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      {newNoteType === 'tts_feedback' ? 'TTS Issue Area' : 'Script Section'}
                    </Label>
                    <Select value={newNoteSection} onValueChange={setNewNoteSection}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {newNoteType === 'tts_feedback' ? (
                          <>
                            <SelectItem value="voice_quality">🎤 Voice Quality / Naturalness</SelectItem>
                            <SelectItem value="pronunciation">🗣 Pronunciation / Accent</SelectItem>
                            <SelectItem value="pacing_timing">⏱ Pacing / Timing / Speed</SelectItem>
                            <SelectItem value="voice_tone">🎭 Emotional Tone / Inflection</SelectItem>
                            <SelectItem value="tts_provider_issue">⚙️ Provider-Specific Issue</SelectItem>
                            <SelectItem value="content_mismatch">📝 Content Needs Script Change (Escalate)</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="hook">🎯 Hook</SelectItem>
                            <SelectItem value="problem_statement">😰 Problem</SelectItem>
                            <SelectItem value="solution">✨ Solution</SelectItem>
                            <SelectItem value="cta">📢 CTA</SelectItem>
                            <SelectItem value="full_script">📄 Full Script</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Priority</Label>
                    <Select value={newNotePriority} onValueChange={setNewNotePriority}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Region/Sub-region filter + TTS Provider (shown for TTS feedback) */}
                {newNoteType === 'tts_feedback' && (() => {
                  const selectedScript = newNoteScriptId ? scripts.find(s => s.id === newNoteScriptId) : null;
                  const ttsInfo = selectedScript ? getSubRegionTTSProvider(selectedScript.region_code) : null;
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2 rounded-md bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">Region / Sub-Region</Label>
                        <div className="text-xs font-medium flex items-center gap-1">
                          {selectedScript ? (
                            <>
                              {REGION_OPTIONS.find(r => r.code === selectedScript.region_code)?.flag}{' '}
                              {selectedScript.region_display_name}
                              <Badge variant="outline" className="text-[9px] ml-1">{selectedScript.region_code}</Badge>
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">Select a script above</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">TTS Provider</Label>
                        <div className="text-xs font-medium flex items-center gap-1">
                          {ttsInfo ? (
                            <>
                              <Badge className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">{ttsInfo.provider}</Badge>
                              <span className="text-muted-foreground">{ttsInfo.label}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">Voice</Label>
                        <div className="text-xs font-medium">
                          {ttsInfo ? (
                            <>
                              {ttsInfo.voiceName}
                              <span className="text-muted-foreground ml-1">({ttsInfo.locale})</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-2">
                  <Textarea
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder={newNoteType === 'tts_feedback' 
                      ? "Describe the audio issue: accent, pacing, pronunciation, tone..." 
                      : "Enter your feedback, suggestion, or A/B learning..."}
                    className="text-sm min-h-[60px] flex-1"
                  />
                  <Button onClick={handleAddNote} className="self-end gap-1" disabled={!newNoteContent.trim() || !newNoteScriptId}>
                    <Send className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Rewrite Suggestion Card */}
            <Card className="border-primary/20">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Generate Improved Script Version</p>
                    <p className="text-[10px] text-muted-foreground">
                      AI rewrites the <strong>script text</strong> using zone-routed LLM providers (not TTS). TTS audio is regenerated separately in the TTS Preview tab.
                    </p>
                  </div>
                </div>

                {/* Script Selector with Region/Sub-region display */}
                <div className="space-y-2">
                  <Select value={selectedScriptForImprovement} onValueChange={setSelectedScriptForImprovement}>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="Select script to improve..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_HIERARCHY.map(group => {
                        const groupScripts = scripts.filter(s => {
                          const codes = getGroupCodes(group);
                          return codes.some(c => c.toLowerCase() === s.region_code?.toLowerCase());
                        });
                        if (groupScripts.length === 0) return null;
                        return (
                          <React.Fragment key={group.groupCode}>
                            <SelectItem value={`__group_${group.groupCode}`} disabled className="font-semibold text-muted-foreground">
                              {group.groupFlag} {group.groupName}
                            </SelectItem>
                            {groupScripts.map(s => {
                              const openNotes = notes.filter(n => n.script_id === s.id && (n.status === 'open' || n.status === 'accepted'));
                              return (
                                <SelectItem key={s.id} value={s.id}>
                                  {'  '}{REGION_OPTIONS.find(r => r.code === s.region_code)?.flag} {s.region_display_name} v{s.version}
                                  {s.variant_label ? ` (${s.variant_label})` : ''}
                                  {openNotes.length > 0 ? ` — ${openNotes.length} notes` : ''}
                                </SelectItem>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Show region + TTS provider info for selected script */}
                  {(() => {
                    const sid = selectedScriptForImprovement;
                    const script = sid ? scripts.find(s => s.id === sid) : null;
                    if (!script) return null;
                    const ttsInfo = getSubRegionTTSProvider(script.region_code);
                    return (
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <Badge variant="outline">
                          {REGION_OPTIONS.find(r => r.code === script.region_code)?.flag} {script.region_code}
                        </Badge>
                        <Badge variant="outline" className="bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200">
                          🎙 TTS: {ttsInfo.provider} — {ttsInfo.voiceName} ({ttsInfo.locale})
                        </Badge>
                      </div>
                    );
                  })()}
                </div>

                {/* AI Provider Selector — Zone-routed with user override */}
                {(() => {
                  const sid = selectedScriptForImprovement || newNoteScriptId;
                  const script = sid ? scripts.find(s => s.id === sid) : null;
                  const providers = getZoneAIProviders(script?.region_code || 'NAM');
                  const recommended = providers.find(p => p.isRecommended);
                  const currentSelection = selectedAIProvider || recommended?.id || '';

                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground font-medium">AI Provider <span className="text-blue-600 dark:text-blue-400">(for Script Rewrite — not TTS)</span></Label>
                        {recommended && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            ⭐ {recommended.name} recommended for {script?.region_display_name || 'this region'}
                          </Badge>
                        )}
                      </div>
                      <Select value={currentSelection} onValueChange={setSelectedAIProvider}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Auto (zone-routed)" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-center gap-2">
                                <span>{p.name}</span>
                                {p.isRecommended && <Badge variant="default" className="text-[8px] px-1 py-0 ml-1">Recommended</Badge>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {currentSelection && (
                        <p className="text-[9px] text-muted-foreground italic">
                          {providers.find(p => p.id === currentSelection)?.reason}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Generate Button */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="gap-1 text-xs flex-1"
                    disabled={isGeneratingImproved || (!selectedScriptForImprovement && !newNoteScriptId)}
                    onClick={handleGenerateImproved}
                  >
                    {isGeneratingImproved ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {isGeneratingImproved ? 'Generating...' : 'Generate Improved Version'}
                  </Button>
                </div>
                {(() => {
                   const sid = selectedScriptForImprovement || newNoteScriptId;
                   const count = sid ? notes.filter(n => n.script_id === sid && (n.status === 'open' || n.status === 'accepted')).length : 0;
                   return count > 0 ? (
                     <p className="text-[10px] text-muted-foreground">
                       ✅ {count} open feedback note{count !== 1 ? 's' : ''} will be incorporated into the improved version.
                     </p>
                   ) : sid ? (
                     <p className="text-[10px] text-destructive">
                       ⚠️ No open feedback for this script. Add feedback above first.
                     </p>
                   ) : null;
                 })()}
               </CardContent>
             </Card>

            {/* Existing Notes List — filtered by category */}
            {(() => {
              const filteredNotes = notes.filter(n => {
                if (feedbackCategoryFilter === 'tts') return n.note_type === 'tts_feedback';
                if (feedbackCategoryFilter === 'script') return n.note_type !== 'tts_feedback';
                return true;
              });
              if (filteredNotes.length === 0) return (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {feedbackCategoryFilter === 'tts' ? 'No TTS feedback yet.' : feedbackCategoryFilter === 'script' ? 'No script feedback yet.' : 'No feedback yet.'} Add your first suggestion above.
                  </p>
                </CardContent>
              </Card>
              );
              return (
              <div className="space-y-3">
                {filteredNotes.map(note => {
                  const typeCfg = NOTE_TYPE_CONFIG[note.note_type] || NOTE_TYPE_CONFIG.reviewer_comment;
                  const TypeIcon = typeCfg.icon;
                  const scriptRef = scripts.find(s => s.id === note.script_id);
                  const ttsInfo = scriptRef ? getSubRegionTTSProvider(scriptRef.region_code) : null;
                  const isTTS = note.note_type === 'tts_feedback';
                  return (
                    <Card key={note.id} className={cn(
                      "overflow-hidden border-l-4",
                      isTTS 
                        ? "border-l-violet-500 border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/10" 
                        : "border-l-blue-500 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10"
                    )}>
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", typeCfg.color)}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                           <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={cn("text-[10px]", typeCfg.color)}>{typeCfg.label}</Badge>
                              {isTTS ? (
                                <Badge className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 font-semibold">🎙 TTS Audio</Badge>
                              ) : (
                                <Badge className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold">📝 Script</Badge>
                              )}
                              {note.section_target && note.section_target !== 'general' && (
                                <Badge variant="outline" className="text-[10px]">→ {note.section_target}</Badge>
                              )}
                              <Badge variant={note.priority === 'critical' ? 'destructive' : 'outline'} className="text-[10px]">
                                {note.priority}
                              </Badge>
                              <Badge variant={note.status === 'applied' ? 'default' : 'secondary'} className="text-[10px]">
                                {note.status}
                              </Badge>
                              {scriptRef && (
                                <span className="text-[10px] text-muted-foreground">
                                  {REGION_OPTIONS.find(r => r.code === scriptRef.region_code)?.flag} {scriptRef.region_display_name} v{scriptRef.version}
                                  <Badge variant="outline" className="text-[8px] ml-1">{scriptRef.region_code}</Badge>
                                </span>
                              )}
                              {isTTS && ttsInfo && (
                                <Badge variant="outline" className="text-[9px] border-violet-300 text-violet-600 dark:text-violet-400">
                                  {ttsInfo.provider} • {ttsInfo.voiceName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{note.content}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(note.created_at).toLocaleDateString()}
                              {note.framework_tag && ` • Framework: ${note.framework_tag}`}
                              {isTTS && ttsInfo && ` • TTS: ${ttsInfo.provider} (${ttsInfo.locale})`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => handleNoteStatus(note.id, 'accepted')}
                              title="Accept"
                            >
                              <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => handleNoteStatus(note.id, 'rejected')}
                              title="Reject"
                            >
                              <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => handleNoteStatus(note.id, 'applied')}
                              title="Mark Applied"
                            >
                              <Check className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            {/* Layered Escalation: TTS feedback gets voice/content escalation buttons */}
                            {isTTS && note.status !== 'applied' && (
                              <>
                                <Separator orientation="vertical" className="h-5 mx-0.5" />
                                <Button
                                  variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-1.5"
                                  onClick={() => handleFeedbackEscalation(note, 'voice_issue')}
                                  title="Voice/prosody issue → Re-generate TTS only"
                                >
                                  <Mic className="w-3 h-3" />
                                  Regen TTS
                                </Button>
                                <Button
                                  variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-1.5 text-amber-600"
                                  onClick={() => handleFeedbackEscalation(note, 'content_issue')}
                                  title="Content issue → Revert script to review for re-transcreation"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  Escalate
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              );
            })()}
          </motion.div>
        )}

        {/* ─── WORKFLOW DIAGRAM TAB ─── */}
        {subTab === 'workflow' && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ScriptProductionWorkflowDiagram />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EDITOR DIALOG ─── */}
      <Dialog open={showEditor} onOpenChange={setShowEditor} modal={false}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Script — {editingScript?.region_display_name}
              {editingScript?.variant_label && ` (${editingScript.variant_label})`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              v{editingScript?.version} • {editingScript?.language_display_name}
            </DialogDescription>
          </DialogHeader>

          {editingScript && (
            <div className="space-y-4">
              {/* Multi-select: Positioning Angles */}
              <div className="space-y-2">
                <Label className="text-xs">📐 Positioning Angles</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingScript.positioning_angles || []).map(angle => (
                    <Badge key={angle} variant="secondary" className="text-xs gap-1">
                      {angle}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setEditingScript({
                        ...editingScript,
                        positioning_angles: editingScript.positioning_angles.filter(a => a !== angle),
                      })} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs h-8 flex-1 justify-between">
                        <span className="text-muted-foreground">Add angle...</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 z-[100001] bg-popover border shadow-md" align="start" side="bottom" sideOffset={4}>
                      <ScrollArea className="h-[280px]">
                        <div className="space-y-1">
                          {[...new Set([...POSITIONING_ANGLE_OPTIONS, ...(editingScript.positioning_angles || [])])].map(o => {
                            const selected = (editingScript.positioning_angles || []).includes(o);
                            return (
                              <label key={o} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs">
                                <Checkbox checked={selected} onCheckedChange={() => {
                                  if (selected) {
                                    setEditingScript({ ...editingScript, positioning_angles: editingScript.positioning_angles.filter(a => a !== o) });
                                  } else {
                                    setEditingScript({ ...editingScript, positioning_angles: [...(editingScript.positioning_angles || []), o] });
                                  }
                                }} />
                                {o}
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <div className="flex gap-1">
                    <Input value={customTagInput.positioning || ''} onChange={e => setCustomTagInput({ ...customTagInput, positioning: e.target.value })} placeholder="Custom..." className="text-xs h-8 w-28" onKeyDown={e => { if (e.key === 'Enter' && customTagInput.positioning?.trim()) { e.preventDefault(); const v = customTagInput.positioning.trim(); if (!(editingScript.positioning_angles || []).includes(v)) { setEditingScript({ ...editingScript, positioning_angles: [...(editingScript.positioning_angles || []), v] }); } setCustomTagInput({ ...customTagInput, positioning: '' }); } }} />
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { const v = customTagInput.positioning?.trim(); if (v && !(editingScript.positioning_angles || []).includes(v)) { setEditingScript({ ...editingScript, positioning_angles: [...(editingScript.positioning_angles || []), v] }); } setCustomTagInput({ ...customTagInput, positioning: '' }); }}><Plus className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>

              {/* Multi-select: Emotional Tones */}
              <div className="space-y-2">
                <Label className="text-xs">🎭 Emotional Tones</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingScript.emotional_tones || []).map(tone => (
                    <Badge key={tone} variant="secondary" className="text-xs gap-1">
                      {tone}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setEditingScript({
                        ...editingScript,
                        emotional_tones: editingScript.emotional_tones.filter(t => t !== tone),
                      })} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs h-8 flex-1 justify-between">
                        <span className="text-muted-foreground">Add tone...</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 z-[100001] bg-popover border shadow-md" align="start" side="bottom" sideOffset={4}>
                      <ScrollArea className="h-[280px]">
                        <div className="space-y-1">
                          {[...new Set([...EMOTIONAL_TONE_OPTIONS, ...(editingScript.emotional_tones || [])])].map(o => {
                            const selected = (editingScript.emotional_tones || []).includes(o);
                            return (
                              <label key={o} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs">
                                <Checkbox checked={selected} onCheckedChange={() => {
                                  if (selected) {
                                    setEditingScript({ ...editingScript, emotional_tones: editingScript.emotional_tones.filter(t => t !== o) });
                                  } else {
                                    setEditingScript({ ...editingScript, emotional_tones: [...(editingScript.emotional_tones || []), o] });
                                  }
                                }} />
                                {o}
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <div className="flex gap-1">
                    <Input value={customTagInput.tone || ''} onChange={e => setCustomTagInput({ ...customTagInput, tone: e.target.value })} placeholder="Custom..." className="text-xs h-8 w-28" onKeyDown={e => { if (e.key === 'Enter' && customTagInput.tone?.trim()) { e.preventDefault(); const v = customTagInput.tone.trim(); if (!(editingScript.emotional_tones || []).includes(v)) { setEditingScript({ ...editingScript, emotional_tones: [...(editingScript.emotional_tones || []), v] }); } setCustomTagInput({ ...customTagInput, tone: '' }); } }} />
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { const v = customTagInput.tone?.trim(); if (v && !(editingScript.emotional_tones || []).includes(v)) { setEditingScript({ ...editingScript, emotional_tones: [...(editingScript.emotional_tones || []), v] }); } setCustomTagInput({ ...customTagInput, tone: '' }); }}><Plus className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>

              {/* Multi-select: Target Personas */}
              <div className="space-y-2">
                <Label className="text-xs">👥 Target Personas</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingScript.target_personas || []).map(p => (
                    <Badge key={p} variant="secondary" className="text-xs gap-1">
                      {p}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setEditingScript({
                        ...editingScript,
                        target_personas: editingScript.target_personas.filter(t => t !== p),
                      })} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs h-8 flex-1 justify-between">
                        <span className="text-muted-foreground">Add persona...</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2 z-[100001] bg-popover border shadow-md" align="start" side="bottom" sideOffset={4}>
                      <ScrollArea className="h-[280px]">
                        <div className="space-y-1">
                          {[...new Set([...(audienceOptions.length > 0 ? audienceOptions : ['Content Creators', 'Marketing Teams', 'Enterprise Teams', 'Educators', 'Healthcare Professionals']), ...(editingScript.target_personas || [])])].map(o => {
                            const selected = (editingScript.target_personas || []).includes(o);
                            return (
                              <label key={o} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs">
                                <Checkbox checked={selected} onCheckedChange={() => {
                                  if (selected) {
                                    setEditingScript({ ...editingScript, target_personas: editingScript.target_personas.filter(t => t !== o) });
                                  } else {
                                    setEditingScript({ ...editingScript, target_personas: [...(editingScript.target_personas || []), o] });
                                  }
                                }} />
                                {o}
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <div className="flex gap-1">
                    <Input value={customTagInput.persona || ''} onChange={e => setCustomTagInput({ ...customTagInput, persona: e.target.value })} placeholder="Custom..." className="text-xs h-8 w-28" onKeyDown={e => { if (e.key === 'Enter' && customTagInput.persona?.trim()) { e.preventDefault(); const v = customTagInput.persona.trim(); if (!(editingScript.target_personas || []).includes(v)) { setEditingScript({ ...editingScript, target_personas: [...(editingScript.target_personas || []), v] }); } setCustomTagInput({ ...customTagInput, persona: '' }); } }} />
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { const v = customTagInput.persona?.trim(); if (v && !(editingScript.target_personas || []).includes(v)) { setEditingScript({ ...editingScript, target_personas: [...(editingScript.target_personas || []), v] }); } setCustomTagInput({ ...customTagInput, persona: '' }); }}><Plus className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">🎯 Hook</Label>
                <Textarea
                  value={editingScript.hook}
                  onChange={e => setEditingScript({ ...editingScript, hook: e.target.value })}
                  className="text-sm min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">😰 Problem Statement</Label>
                <Textarea
                  value={editingScript.problem_statement}
                  onChange={e => setEditingScript({ ...editingScript, problem_statement: e.target.value })}
                  className="text-sm min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">✨ Solution</Label>
                <Textarea
                  value={editingScript.solution}
                  onChange={e => setEditingScript({ ...editingScript, solution: e.target.value })}
                  className="text-sm min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">📢 CTA</Label>
                <Textarea
                  value={editingScript.cta}
                  onChange={e => setEditingScript({ ...editingScript, cta: e.target.value })}
                  className="text-sm min-h-[40px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={() => editingScript && handleSaveScript(editingScript)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── IMPROVED VERSION PREVIEW DIALOG ─── */}
      <Dialog open={showImprovedPreview} onOpenChange={setShowImprovedPreview}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Improved Version Preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              {improvedPreview?.framework_used && `Framework: ${improvedPreview.framework_used}`}
              {' • '}Review the changes below before accepting.
            </DialogDescription>
          </DialogHeader>

          {improvedPreview && (
            <div className="space-y-4">
              {/* Changes Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Changes Summary
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{improvedPreview.changes_summary}</p>
                </CardContent>
              </Card>

              {/* Side-by-side comparison for each section */}
              {[
                { label: '🎯 Hook', key: 'hook' as const },
                { label: '😰 Problem Statement', key: 'problem_statement' as const },
                { label: '✨ Solution', key: 'solution' as const },
                { label: '📢 CTA', key: 'cta' as const },
              ].map(section => {
                const original = scripts.find(s => s.id === improvedPreview.scriptId);
                const originalText = original ? original[section.key] : '';
                const newText = improvedPreview[section.key];
                const changed = originalText !== newText;

                return (
                  <div key={section.key} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-semibold">{section.label}</Label>
                      {changed && <Badge className="text-[9px] bg-primary/10 text-primary">Modified</Badge>}
                    </div>
                    <Textarea
                      value={newText}
                      onChange={e => setImprovedPreview({ ...improvedPreview, [section.key]: e.target.value })}
                      className={cn(
                        "text-sm min-h-[60px]",
                        changed && "border-primary/30 bg-primary/5"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowImprovedPreview(false)}>
              Discard
            </Button>
            <Button onClick={handleAcceptImproved} className="gap-1">
              <Check className="w-3.5 h-3.5" />
              Accept & Create New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPageScriptsPanel;
