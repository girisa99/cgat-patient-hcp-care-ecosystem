/**
 * LANDING PAGE SCRIPTS PANEL
 * Manages regional hero narration scripts with versioning + A/B variants.
 * 
 * Sub-tabs:
 * - Scripts: CRUD for regional_narration_scripts with version/variant support
 * - TTS Preview: Audio preview with Azure Neural / Qwen3-TTS
 * - Versions: Version history timeline per region
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Globe, FileText, Headphones, History, Plus, Copy, Check, X,
  Play, Pause, Volume2, Edit, Trash2, ChevronDown, Tag, Sparkles,
  ArrowUpDown, Filter, MoreHorizontal, Eye, RefreshCw, Mic,
  MessageCircle, Lightbulb, TrendingUp, Zap, Send, ThumbsUp, ThumbsDown,
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
}

type ScriptStatus = 'draft' | 'review' | 'active' | 'archived';

interface RegionGroup {
  groupCode: string;
  groupName: string;
  groupFlag: string;
  children: { code: string; name: string; flag: string }[];
}

const REGION_HIERARCHY: RegionGroup[] = [
  { groupCode: 'NAM', groupName: 'North America', groupFlag: '🇺🇸', children: [] },
  { groupCode: 'EU', groupName: 'Europe', groupFlag: '🇪🇺', children: [] },
  { groupCode: 'LATAM', groupName: 'Latin America', groupFlag: '🌎', children: [] },
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

// Flatten for backward compatibility
const REGION_OPTIONS = REGION_HIERARCHY.flatMap(g =>
  g.children.length > 0
    ? g.children
    : [{ code: g.groupCode, name: g.groupName, flag: g.groupFlag }]
);

// Get all codes for a group (the group code itself for leaf groups, children codes for parent groups)
const getGroupCodes = (group: RegionGroup): string[] =>
  group.children.length > 0 ? group.children.map(c => c.code) : [group.groupCode];

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
type LandingPageSubTab = 'scripts' | 'tts-preview' | 'versions' | 'feedback';

// ─── Feedback types ──────────────────────────────────────────────────
interface ImprovementNote {
  id: string;
  script_id: string;
  note_type: 'reviewer_comment' | 'ab_learning' | 'ai_suggestion' | 'performance_insight';
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
function getZoneAIProviders(regionCode: string): AIProviderOption[] {
  const r = regionCode?.toUpperCase();
  
  // Determine zone and sub-zone for fallback selection
  const zone = (() => {
    if (['NAM', 'EU', 'LATAM'].includes(r)) return 'western';
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
    { id: 'openai', name: 'GPT-4o', model: 'gpt-4o', zone: 'fallback', isRecommended: false, reason: 'Strong Arabic dialects (Egyptian/Levantine) — reliable all-rounder fallback' },
    { id: 'deepseek', name: 'DeepSeek V3', model: 'deepseek-v3', zone: 'fallback', isRecommended: false, reason: 'Cost-effective alternative — good for bulk script generation' },
  ];

  // Zone → primary provider (hybrid routing)
  const zoneMap: Record<string, string> = {
    western: 'claude',
    cjk: 'alibaba',
    mena: 'openai', // Default MENA — overridden per sub-region below
    pakistan: 'openai',
    bangladesh: 'gemini',
    india: 'gemini',
    africa: 'gemini',
  };
  
  // MENA sub-region hybrid overrides
  const menaOverrides: Record<string, string> = {
    'MENA_GULF': 'alibaba',   // Qwen Max — strongest formal + Gulf Arabic corpus
    'MENA_EGYPT': 'openai',   // GPT-4o — best Egyptian colloquial
    'MENA_LEVANT': 'openai',  // GPT-4o — strong Levantine handling
    'MENA_MAGHREB': 'claude', // Claude 4 — French-Arabic code-switching
    'MENA_MSA': 'alibaba',    // Qwen Max — formal/literary Arabic
  };
  
  const recommended = menaOverrides[r] || zoneMap[zone] || 'claude';
  
  // Sub-region fallback preferences (affects sort order after recommended)
  const subRegionFallbackOrder: Record<string, string[]> = {
    // Africa sub-regions
    'AFRICA_WEST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'AFRICA_EAST': ['gemini', 'openai', 'claude', 'alibaba', 'deepseek'],
    'AFRICA_SOUTH': ['gemini', 'claude', 'openai', 'alibaba', 'deepseek'],
    'AFRICA_FRANCO': ['gemini', 'alibaba', 'openai', 'claude', 'deepseek'],
    // Pakistan — GPT-4o primary (strong Urdu), Gemini fallback
    'PAKISTAN': ['openai', 'gemini', 'claude', 'alibaba', 'deepseek'],
    // Bangladesh — Gemini primary (strong Bengali), GPT-4o fallback
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
    // MENA sub-regions (hybrid routing)
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
  const [subTab, setSubTab] = useState<LandingPageSubTab>('scripts');
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingScript, setEditingScript] = useState<NarrationScript | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Feedback state
  const [notes, setNotes] = useState<ImprovementNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<string>('reviewer_comment');
  const [newNoteSection, setNewNoteSection] = useState<string>('general');
  const [newNoteScriptId, setNewNoteScriptId] = useState<string>('');
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

  // ── Filtered scripts ──
  const filteredScripts = useMemo(() => {
    return scripts.filter(s => {
      if (filterRegions.length > 0 && !filterRegions.includes(s.region_code)) return false;
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
          tts_provider: baseScript.tts_provider,
          tts_voice_id: baseScript.tts_voice_id,
          tts_voice_name: baseScript.tts_voice_name,
          tts_speed: baseScript.tts_speed,
          tts_pitch: baseScript.tts_pitch,
          version: baseScript.version,
          status: 'draft',
          variant_label: variantLabel,
          is_default: false,
        } as any);

      if (error) throw error;
      toast.success(`Variant "${variantLabel}" created`);
      fetchScripts();
    } catch (err) {
      console.error('[LandingPageScripts] Create variant error:', err);
      toast.error('Failed to create variant');
    }
  }, [fetchScripts]);

  // ── Update script status ──
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
    } catch (err) {
      console.error('[LandingPageScripts] Status change error:', err);
      toast.error('Failed to update status');
    }
  }, [fetchScripts]);

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
          tts_provider: baseScript.tts_provider,
          tts_voice_id: baseScript.tts_voice_id,
          tts_voice_name: baseScript.tts_voice_name,
          tts_speed: baseScript.tts_speed,
          tts_pitch: baseScript.tts_pitch,
          version: maxVersion + 1,
          status: 'draft',
          variant_label: baseScript.variant_label,
          is_default: false,
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

      setImprovedPreview({
        scriptId,
        hook: parsed.hook || script.hook,
        problem_statement: parsed.problem_statement || script.problem_statement,
        solution: parsed.solution || script.solution,
        cta: parsed.cta || script.cta,
        changes_summary: parsed.changes_summary || 'No summary provided',
        framework_used: parsed.framework_used || 'Auto',
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
      const { error } = await supabase
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
        } as any);

      if (error) {
        console.error('[LandingPageScripts] Supabase insert error:', JSON.stringify(error));
        throw error;
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

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2">
        {[
          { id: 'scripts' as const, label: 'Regional Scripts', icon: FileText },
          { id: 'feedback' as const, label: 'Feedback & Suggestions', icon: Lightbulb },
          { id: 'tts-preview' as const, label: 'TTS Preview', icon: Headphones },
          { id: 'versions' as const, label: 'Version History', icon: History },
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
                        </CardTitle>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium line-clamp-1">
                                      🎯 {script.hook}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {script.problem_statement}
                                    </p>
                                    {script.positioning_angles?.length > 0 && (
                                      <p className="text-[10px] text-muted-foreground italic">
                                        Angles: {script.positioning_angles.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
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
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-primary" />
                  TTS Audio Preview
                </CardTitle>
                <CardDescription className="text-xs">
                  Preview narration audio using Azure Neural TTS (most regions) or Qwen3-TTS (CJK).
                  Select a script to generate and listen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scripts.filter(s => s.status === 'active').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No active scripts to preview. Set a script to "Active" first.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scripts.filter(s => s.status === 'active').map(script => (
                      <div key={script.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="flex-shrink-0 text-lg">
                          {REGION_OPTIONS.find(r => r.code === script.region_code)?.flag || '🌍'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {script.region_display_name}
                            {script.variant_label && ` — ${script.variant_label}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            v{script.version} • {script.tts_provider || 'Azure Neural'} • {script.tts_voice_name || 'Default'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {script.generated_audio_url ? (
                            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" asChild>
                              <a href={script.generated_audio_url} target="_blank" rel="noopener noreferrer">
                                <Play className="w-3 h-3" />
                                Play
                              </a>
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              No audio yet
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" disabled>
                            <Sparkles className="w-3 h-3" />
                            Generate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground text-center mt-4">
                  TTS generation uses Azure Neural for NAM, EU, LATAM, MENA, Africa, India, SEA — and Qwen3-TTS for CJK regions.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── VERSIONS TAB ─── */}
        {subTab === 'versions' && (
          <motion.div
            key="versions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {REGION_OPTIONS.map(region => {
              const regionScripts = scripts
                .filter(s => s.region_code === region.code)
                .sort((a, b) => b.version - a.version);
              if (regionScripts.length === 0) return null;

              return (
                <Card key={region.code}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span>{region.flag}</span>
                      {region.name}
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {regionScripts.length} version{regionScripts.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-[300px]">
                      <div className="divide-y">
                        {regionScripts.map((script, idx) => {
                          const statusCfg = STATUS_CONFIG[script.status as ScriptStatus] || STATUS_CONFIG.draft;
                          return (
                            <div key={script.id} className="flex items-center gap-3 px-4 py-3">
                              {/* Timeline dot */}
                              <div className="flex flex-col items-center">
                                <div className={cn(
                                  "w-3 h-3 rounded-full border-2",
                                  script.status === 'active' ? 'bg-green-500 border-green-600' : 'bg-muted border-border'
                                )} />
                                {idx < regionScripts.length - 1 && (
                                  <div className="w-px h-8 bg-border mt-1" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold">v{script.version}</span>
                                  {script.variant_label && (
                                    <Badge variant="secondary" className="text-[10px]">{script.variant_label}</Badge>
                                  )}
                                  <Badge className={cn("text-[10px]", statusCfg.color)}>{statusCfg.label}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {new Date(script.updated_at).toLocaleDateString()} — {script.hook?.slice(0, 60)}...
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
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
            {/* Add New Feedback */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Add Feedback / Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    <Label className="text-[10px] text-muted-foreground">Type</Label>
                    <Select value={newNoteType} onValueChange={setNewNoteType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reviewer_comment">💬 Reviewer Comment</SelectItem>
                        <SelectItem value="ab_learning">📊 A/B Learning</SelectItem>
                        <SelectItem value="ai_suggestion">✨ AI Suggestion</SelectItem>
                        <SelectItem value="performance_insight">💡 Performance Insight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Section</Label>
                    <Select value={newNoteSection} onValueChange={setNewNoteSection}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="hook">🎯 Hook</SelectItem>
                        <SelectItem value="problem_statement">😰 Problem</SelectItem>
                        <SelectItem value="solution">✨ Solution</SelectItem>
                        <SelectItem value="cta">📢 CTA</SelectItem>
                        <SelectItem value="full_script">📄 Full Script</SelectItem>
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
                <div className="flex gap-2">
                  <Textarea
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder="Enter your feedback, suggestion, or A/B learning..."
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
                    <p className="text-sm font-semibold">Generate Improved Version</p>
                    <p className="text-[10px] text-muted-foreground">
                      AI analyzes all open feedback using zone-routed providers. Select a script and optionally override the recommended AI provider.
                    </p>
                  </div>
                </div>

                {/* Script Selector */}
                <div className="flex items-center gap-2">
                  <Select value={selectedScriptForImprovement} onValueChange={setSelectedScriptForImprovement}>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="Select script to improve..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scripts.map(s => {
                        const openNotes = notes.filter(n => n.script_id === s.id && (n.status === 'open' || n.status === 'accepted'));
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            {REGION_OPTIONS.find(r => r.code === s.region_code)?.flag} {s.region_display_name} v{s.version}
                            {s.variant_label ? ` (${s.variant_label})` : ''}
                            {openNotes.length > 0 ? ` — ${openNotes.length} notes` : ' — no notes'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
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
                        <Label className="text-[10px] text-muted-foreground font-medium">AI Provider</Label>
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

            {/* Existing Notes List */}
            {notes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No feedback yet. Add your first suggestion above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notes.map(note => {
                  const typeCfg = NOTE_TYPE_CONFIG[note.note_type] || NOTE_TYPE_CONFIG.reviewer_comment;
                  const TypeIcon = typeCfg.icon;
                  const scriptRef = scripts.find(s => s.id === note.script_id);
                  return (
                    <Card key={note.id} className="overflow-hidden">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", typeCfg.color)}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={cn("text-[10px]", typeCfg.color)}>{typeCfg.label}</Badge>
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
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{note.content}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(note.created_at).toLocaleDateString()}
                              {note.framework_tag && ` • Framework: ${note.framework_tag}`}
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
                    <PopoverContent className="w-56 p-2 z-[100001]" align="start">
                      <ScrollArea className="max-h-48">
                        <div className="space-y-1">
                          {POSITIONING_ANGLE_OPTIONS.map(o => {
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
                    <PopoverContent className="w-56 p-2 z-[100001]" align="start">
                      <ScrollArea className="max-h-48">
                        <div className="space-y-1">
                          {EMOTIONAL_TONE_OPTIONS.map(o => {
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
                    <PopoverContent className="w-56 p-2 z-[100001]" align="start">
                      <ScrollArea className="max-h-48">
                        <div className="space-y-1">
                          {(audienceOptions.length > 0 ? audienceOptions : ['Content Creators', 'Marketing Teams', 'Enterprise Teams', 'Educators', 'Healthcare Professionals']).map(o => {
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
