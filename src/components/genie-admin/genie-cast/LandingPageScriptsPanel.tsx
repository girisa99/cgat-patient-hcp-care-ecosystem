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
  positioning_angle: string | null;
  target_persona: string | null;
  emotional_tone: string | null;
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

const REGION_OPTIONS = [
  { code: 'NAM', name: 'North America', flag: '🇺🇸' },
  { code: 'EU', name: 'Europe', flag: '🇪🇺' },
  { code: 'LATAM', name: 'Latin America', flag: '🌎' },
  { code: 'MENA', name: 'Middle East & North Africa', flag: '🌍' },
  { code: 'AFRICA', name: 'Sub-Saharan Africa', flag: '🌍' },
  { code: 'INDIA', name: 'India & South Asia', flag: '🇮🇳' },
  { code: 'SEA', name: 'Southeast Asia', flag: '🌏' },
  { code: 'CJK', name: 'China, Japan & Korea', flag: '🌏' },
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

// ─── Main Component ──────────────────────────────────────────────────
export const LandingPageScriptsPanel: React.FC = () => {
  const [scripts, setScripts] = useState<NarrationScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<LandingPageSubTab>('scripts');
  const [filterRegion, setFilterRegion] = useState<string>('all');
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
      if (filterRegion !== 'all' && s.region_code !== filterRegion) return false;
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      return true;
    });
  }, [scripts, filterRegion, filterStatus]);

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
          full_script: baseScript.full_script,
          positioning_angle: baseScript.positioning_angle,
          target_persona: baseScript.target_persona,
          emotional_tone: baseScript.emotional_tone,
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
          full_script: script.full_script,
          positioning_angle: script.positioning_angle,
          target_persona: script.target_persona,
          emotional_tone: script.emotional_tone,
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
          full_script: baseScript.full_script,
          positioning_angle: baseScript.positioning_angle,
          target_persona: baseScript.target_persona,
          emotional_tone: baseScript.emotional_tone,
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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {REGION_OPTIONS.map(r => (
                <SelectItem key={r.code} value={r.code}>
                  {r.flag} {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                                    {script.positioning_angle && (
                                      <p className="text-[10px] text-muted-foreground italic">
                                        Angle: {script.positioning_angle}
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
              <CardContent className="py-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Generate Improved Version</p>
                  <p className="text-[10px] text-muted-foreground">
                    AI analyzes all open feedback, A/B learnings, and performance insights to create an optimized new version using StoryBrand/AIDA/JTBD frameworks.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 text-xs" disabled>
                  <Sparkles className="w-3.5 h-3.5" />
                  Coming Soon
                </Button>
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
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Positioning Angle</Label>
                  <Input
                    value={editingScript.positioning_angle || ''}
                    onChange={e => setEditingScript({ ...editingScript, positioning_angle: e.target.value })}
                    className="text-sm"
                    placeholder="e.g., Speed & Efficiency"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Emotional Tone</Label>
                  <Input
                    value={editingScript.emotional_tone || ''}
                    onChange={e => setEditingScript({ ...editingScript, emotional_tone: e.target.value })}
                    className="text-sm"
                    placeholder="e.g., Empowering, Warm"
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label className="text-xs">Target Persona</Label>
                <Input
                  value={editingScript.target_persona || ''}
                  onChange={e => setEditingScript({ ...editingScript, target_persona: e.target.value })}
                  className="text-sm"
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
    </div>
  );
};

export default LandingPageScriptsPanel;
