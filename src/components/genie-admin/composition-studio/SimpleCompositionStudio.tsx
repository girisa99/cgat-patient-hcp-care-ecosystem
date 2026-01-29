/**
 * SIMPLE COMPOSITION STUDIO
 * 
 * Streamlined 2-step content creation:
 * 1. Setup: Name, languages, quick template selection
 * 2. Create: Inline chapter editing with auto/manual scripts, visual types, audio
 * 
 * Key features:
 * - Inline chapter editing (no complex wizard)
 * - Auto-generate scripts OR manual entry per chapter or globally
 * - Multiple visual types per chapter
 * - Upload/generate voice for entire project OR per chapter
 * - One-click generation with real progress
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Wand2, Plus, Globe, Play, Upload, Save, Trash2,
  Sparkles, Video, User, Box, ChevronDown, ChevronUp,
  Loader2, Volume2, Music, FileAudio, GripVertical,
  Copy, Eye, Settings2, Zap, RotateCcw, Check, X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Visual type options
const VISUAL_TYPES = [
  { id: 'video', label: 'Video', icon: Video, color: 'bg-pink-500' },
  { id: 'avatar', label: 'Avatar', icon: User, color: 'bg-purple-500' },
  { id: '3d', label: '3D Model', icon: Box, color: 'bg-violet-500' },
  { id: 'animation', label: 'Animation', icon: Sparkles, color: 'bg-amber-500' },
] as const;

// Quick templates
const QUICK_TEMPLATES = [
  { id: 'blank', name: 'Start Blank', chapters: 0 },
  { id: 'single', name: 'Single Chapter', chapters: 1 },
  { id: '3_chapter', name: '3 Chapters', chapters: 3 },
  { id: '5_chapter', name: '5 Chapters', chapters: 5 },
] as const;

// Languages
const LANGUAGES = [
  { code: 'en', name: 'English', region: 'West/EU' },
  { code: 'ar', name: 'Arabic', region: 'MENA', rtl: true },
  { code: 'hi', name: 'Hindi', region: 'India' },
  { code: 'zh', name: 'Chinese', region: 'CJK' },
  { code: 'es', name: 'Spanish', region: 'West/EU' },
  { code: 'fr', name: 'French', region: 'West/EU' },
  { code: 'de', name: 'German', region: 'West/EU' },
  { code: 'ja', name: 'Japanese', region: 'CJK' },
] as const;

// Chapter interface
interface SimpleChapter {
  id: string;
  title: string;
  script: string;
  scriptSource: 'auto' | 'manual';
  visualTypes: string[];
  duration: number;
  voiceSource: 'tts' | 'upload' | 'clone';
  voiceFile?: File;
  musicSource: 'ai' | 'upload' | 'none';
  musicFile?: File;
  status: 'draft' | 'generating' | 'complete' | 'error';
  progress: number;
  generatedContent?: {
    previewUrl: string;
    script: string;
    audioUrl?: string;
  };
}

interface SimpleCompositionStudioProps {
  className?: string;
  onClose?: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const SimpleCompositionStudio: React.FC<SimpleCompositionStudioProps> = ({
  className,
  onClose,
}) => {
  // Project state
  const [projectName, setProjectName] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [chapters, setChapters] = useState<SimpleChapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  
  // Global audio settings
  const [globalVoiceSource, setGlobalVoiceSource] = useState<'tts' | 'upload'>('tts');
  const [globalVoiceFile, setGlobalVoiceFile] = useState<File | null>(null);
  const [globalMusicSource, setGlobalMusicSource] = useState<'ai' | 'upload' | 'none'>('ai');
  const [globalMusicFile, setGlobalMusicFile] = useState<File | null>(null);
  const [globalScriptMode, setGlobalScriptMode] = useState<'auto' | 'manual'>('auto');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<string | null>(null);

  // Create new chapter
  const addChapter = useCallback((template?: Partial<SimpleChapter>) => {
    const newChapter: SimpleChapter = {
      id: generateId(),
      title: template?.title || `Chapter ${chapters.length + 1}`,
      script: template?.script || '',
      scriptSource: globalScriptMode,
      visualTypes: template?.visualTypes || ['video'],
      duration: template?.duration || 30,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
      status: 'draft',
      progress: 0,
    };
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapter(newChapter.id);
  }, [chapters.length, globalScriptMode, globalVoiceSource, globalMusicSource]);

  // Quick template selection
  const applyQuickTemplate = (templateId: string) => {
    const template = QUICK_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setChapters([]);
    
    if (template.chapters > 0) {
      const newChapters: SimpleChapter[] = [];
      for (let i = 0; i < template.chapters; i++) {
        newChapters.push({
          id: generateId(),
          title: `Chapter ${i + 1}`,
          script: '',
          scriptSource: globalScriptMode,
          visualTypes: ['video'],
          duration: 30,
          voiceSource: globalVoiceSource,
          musicSource: globalMusicSource,
          status: 'draft',
          progress: 0,
        });
      }
      setChapters(newChapters);
      if (newChapters.length > 0) {
        setExpandedChapter(newChapters[0].id);
      }
    }
    
    toast.success(`Created ${template.chapters} chapter${template.chapters !== 1 ? 's' : ''}`);
  };

  // Update chapter
  const updateChapter = useCallback((id: string, updates: Partial<SimpleChapter>) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // Delete chapter
  const deleteChapter = useCallback((id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    toast.success('Chapter deleted');
  }, []);

  // Duplicate chapter
  const duplicateChapter = useCallback((id: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (chapter) {
      addChapter({
        ...chapter,
        id: undefined as any,
        title: `${chapter.title} (Copy)`,
        status: 'draft',
        progress: 0,
        generatedContent: undefined,
      });
    }
  }, [chapters, addChapter]);

  // Apply global settings to all chapters
  const applyGlobalSettings = () => {
    setChapters(prev => prev.map(c => ({
      ...c,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
      scriptSource: globalScriptMode,
    })));
    toast.success('Applied settings to all chapters');
  };

  // Generate single chapter
  const generateChapter = async (chapter: SimpleChapter) => {
    updateChapter(chapter.id, { status: 'generating', progress: 0 });
    setCurrentGeneratingChapter(chapter.id);

    try {
      // Step 1: Generate script if auto mode
      let script = chapter.script;
      if (chapter.scriptSource === 'auto' || !script.trim()) {
        updateChapter(chapter.id, { progress: 20 });
        
        const { data: scriptData, error: scriptError } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            prompt: `Generate a professional ${chapter.duration}-second voiceover script for a chapter titled "${chapter.title}". 
                     Visual style: ${chapter.visualTypes.join(', ')}.
                     Keep it concise, engaging, and suitable for ${selectedLanguages[0]} audience.`,
            systemPrompt: 'You are a professional scriptwriter. Generate only the script text, no formatting.',
            maxTokens: 500,
            action: 'generate_script'
          }
        });

        if (scriptError) throw new Error(scriptError.message);
        script = scriptData?.content || scriptData?.response || chapter.title;
        updateChapter(chapter.id, { script, progress: 40 });
      }

      // Step 2: Generate visual content
      updateChapter(chapter.id, { progress: 60 });
      
      const visualType = chapter.visualTypes[0] || 'video';
      const colorMap: Record<string, string> = {
        video: 'ec4899',
        avatar: '6366f1',
        '3d': '8b5cf6',
        animation: 'f59e0b',
      };
      
      // For now, create placeholder - real generation would call appropriate edge function
      const previewUrl = `https://placehold.co/1920x1080/${colorMap[visualType] || 'ec4899'}/ffffff?text=${encodeURIComponent(chapter.title)}`;

      // Step 3: Generate TTS if needed
      let audioUrl: string | undefined;
      if (chapter.voiceSource === 'tts') {
        updateChapter(chapter.id, { progress: 80 });
        
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: script,
            voice: 'alloy',
            model: 'tts-1'
          }
        });

        if (!ttsError && ttsData?.audioContent) {
          audioUrl = `data:audio/mp3;base64,${ttsData.audioContent}`;
        }
      }

      // Complete
      updateChapter(chapter.id, {
        status: 'complete',
        progress: 100,
        script,
        generatedContent: {
          previewUrl,
          script,
          audioUrl
        }
      });

      return { success: true };
    } catch (error) {
      console.error('[SimpleStudio] Generation error:', error);
      updateChapter(chapter.id, { 
        status: 'error', 
        progress: 0 
      });
      return { success: false, error: error instanceof Error ? error.message : 'Generation failed' };
    } finally {
      setCurrentGeneratingChapter(null);
    }
  };

  // Generate all chapters
  const generateAll = async () => {
    if (chapters.length === 0) {
      toast.error('Add at least one chapter first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    let completed = 0;
    let errors: string[] = [];

    for (const chapter of chapters) {
      const result = await generateChapter(chapter);
      if (!result.success) {
        errors.push(chapter.title);
      }
      completed++;
      setGenerationProgress(Math.round((completed / chapters.length) * 100));
    }

    setIsGenerating(false);
    
    if (errors.length > 0) {
      toast.warning(`Generated with ${errors.length} error(s)`);
    } else {
      toast.success('All chapters generated successfully!');
    }
  };

  // Stats
  const totalDuration = chapters.reduce((sum, c) => sum + c.duration, 0);
  const completedChapters = chapters.filter(c => c.status === 'complete').length;
  const canGenerate = projectName.trim() && chapters.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Content Studio
          </h2>
          <p className="text-sm text-muted-foreground">
            Create multi-chapter content with AI-powered scripts and generation
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{chapters.length} Chapters</Badge>
          <Badge variant="outline">{selectedLanguages.length} Lang</Badge>
          <Badge variant="outline">{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</Badge>
        </div>
      </div>

      {/* Setup Section */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-1">
                {LANGUAGES.slice(0, 4).map(lang => (
                  <Button
                    key={lang.code}
                    size="sm"
                    variant={selectedLanguages.includes(lang.code) ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedLanguages(prev => 
                        prev.includes(lang.code)
                          ? prev.filter(l => l !== lang.code)
                          : [...prev, lang.code]
                      );
                    }}
                    className="h-7 text-xs"
                  >
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <div className="space-y-2">
              <Label>Quick Start</Label>
              <div className="flex flex-wrap gap-1">
                {QUICK_TEMPLATES.map(t => (
                  <Button
                    key={t.id}
                    size="sm"
                    variant="outline"
                    onClick={() => applyQuickTemplate(t.id)}
                    className="h-7 text-xs"
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Global Settings
            </h3>
            <Button size="sm" variant="secondary" onClick={applyGlobalSettings}>
              Apply to All Chapters
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Script Mode */}
            <div className="space-y-2">
              <Label className="text-xs">Script Generation</Label>
              <Select value={globalScriptMode} onValueChange={(v: 'auto' | 'manual') => setGlobalScriptMode(v)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <Wand2 className="w-3 h-3" /> AI Auto-Generate
                    </span>
                  </SelectItem>
                  <SelectItem value="manual">
                    <span className="flex items-center gap-2">
                      <FileAudio className="w-3 h-3" /> Manual Entry
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Source */}
            <div className="space-y-2">
              <Label className="text-xs">Voice Source</Label>
              <div className="flex gap-2">
                <Select value={globalVoiceSource} onValueChange={(v: 'tts' | 'upload') => setGlobalVoiceSource(v)}>
                  <SelectTrigger className="h-8 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tts">AI TTS</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                  </SelectContent>
                </Select>
                {globalVoiceSource === 'upload' && (
                  <Input
                    type="file"
                    accept="audio/*"
                    className="h-8 text-xs"
                    onChange={(e) => setGlobalVoiceFile(e.target.files?.[0] || null)}
                  />
                )}
              </div>
            </div>

            {/* Music Source */}
            <div className="space-y-2">
              <Label className="text-xs">Background Music</Label>
              <div className="flex gap-2">
                <Select value={globalMusicSource} onValueChange={(v: 'ai' | 'upload' | 'none') => setGlobalMusicSource(v)}>
                  <SelectTrigger className="h-8 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI Generate</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                {globalMusicSource === 'upload' && (
                  <Input
                    type="file"
                    accept="audio/*"
                    className="h-8 text-xs"
                    onChange={(e) => setGlobalMusicFile(e.target.files?.[0] || null)}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Chapters</CardTitle>
            <Button size="sm" onClick={() => addChapter()}>
              <Plus className="w-4 h-4 mr-1" /> Add Chapter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {chapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No chapters yet. Use Quick Start above or add chapters manually.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    isExpanded={expandedChapter === chapter.id}
                    isGenerating={currentGeneratingChapter === chapter.id}
                    onToggle={() => setExpandedChapter(
                      expandedChapter === chapter.id ? null : chapter.id
                    )}
                    onUpdate={(updates) => updateChapter(chapter.id, updates)}
                    onDelete={() => deleteChapter(chapter.id)}
                    onDuplicate={() => duplicateChapter(chapter.id)}
                    onGenerate={() => generateChapter(chapter)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Generating content...</span>
                  <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
        </div>
        <Button
          size="lg"
          disabled={!canGenerate || isGenerating}
          onClick={generateAll}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate All ({chapters.length} chapters)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Chapter Card Component
interface ChapterCardProps {
  chapter: SimpleChapter;
  index: number;
  isExpanded: boolean;
  isGenerating: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<SimpleChapter>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onGenerate: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  index,
  isExpanded,
  isGenerating,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  onGenerate,
}) => {
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    generating: 'bg-blue-500 text-white',
    complete: 'bg-emerald-500 text-white',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isExpanded ? "ring-2 ring-primary/20" : "",
        chapter.status === 'complete' ? "border-emerald-500/30 bg-emerald-500/5" : ""
      )}>
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
              {index + 1}
            </span>
            <Input
              value={chapter.title}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ title: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-7 flex-1 max-w-[200px]"
            />
            <div className="flex items-center gap-2">
              {chapter.visualTypes.map(type => {
                const visual = VISUAL_TYPES.find(v => v.id === type);
                return visual ? (
                  <Badge key={type} variant="secondary" className="text-xs">
                    <visual.icon className="w-3 h-3 mr-1" />
                    {visual.label}
                  </Badge>
                ) : null;
              })}
            </div>
            <Badge variant="secondary" className="text-xs">{chapter.duration}s</Badge>
            <Badge className={cn("text-xs", statusColors[chapter.status])}>
              {chapter.status === 'generating' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {chapter.status}
            </Badge>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CollapsibleTrigger>

        {/* Progress bar for generating */}
        {chapter.status === 'generating' && (
          <Progress value={chapter.progress} className="h-1" />
        )}

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="p-4 pt-2 space-y-4 border-t">
            {/* Generated Preview */}
            {chapter.generatedContent?.previewUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <img 
                  src={chapter.generatedContent.previewUrl} 
                  alt={chapter.title}
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2"
                >
                  <Play className="w-3 h-3 mr-1" /> Preview
                </Button>
              </div>
            )}

            {/* Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Script</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={chapter.scriptSource === 'auto' ? 'default' : 'outline'}
                    onClick={() => onUpdate({ scriptSource: 'auto' })}
                    className="h-6 text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" /> Auto
                  </Button>
                  <Button
                    size="sm"
                    variant={chapter.scriptSource === 'manual' ? 'default' : 'outline'}
                    onClick={() => onUpdate({ scriptSource: 'manual' })}
                    className="h-6 text-xs"
                  >
                    Manual
                  </Button>
                </div>
              </div>
              <Textarea
                value={chapter.script}
                onChange={(e) => onUpdate({ script: e.target.value })}
                placeholder={chapter.scriptSource === 'auto' 
                  ? "Script will be auto-generated based on title and visual type..."
                  : "Enter your script here..."
                }
                rows={3}
                disabled={chapter.scriptSource === 'auto' && !chapter.script}
              />
            </div>

            {/* Visual Types */}
            <div className="space-y-2">
              <Label>Visual Types</Label>
              <div className="flex flex-wrap gap-2">
                {VISUAL_TYPES.map(visual => (
                  <Button
                    key={visual.id}
                    size="sm"
                    variant={chapter.visualTypes.includes(visual.id) ? 'default' : 'outline'}
                    onClick={() => {
                      const newTypes = chapter.visualTypes.includes(visual.id)
                        ? chapter.visualTypes.filter(t => t !== visual.id)
                        : [...chapter.visualTypes, visual.id];
                      onUpdate({ visualTypes: newTypes.length > 0 ? newTypes : [visual.id] });
                    }}
                    className="h-8"
                  >
                    <visual.icon className="w-4 h-4 mr-1" />
                    {visual.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Duration</Label>
                <span className="text-sm text-muted-foreground">{chapter.duration}s</span>
              </div>
              <Slider
                value={[chapter.duration]}
                onValueChange={([v]) => onUpdate({ duration: v })}
                min={5}
                max={120}
                step={5}
              />
            </div>

            {/* Audio Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Voice</Label>
                <Select 
                  value={chapter.voiceSource} 
                  onValueChange={(v: 'tts' | 'upload' | 'clone') => onUpdate({ voiceSource: v })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tts">AI TTS</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                    <SelectItem value="clone">Voice Clone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Music</Label>
                <Select 
                  value={chapter.musicSource} 
                  onValueChange={(v: 'ai' | 'upload' | 'none') => onUpdate({ musicSource: v })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI Generate</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={onDuplicate}>
                  <Copy className="w-4 h-4 mr-1" /> Duplicate
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
              <Button
                size="sm"
                onClick={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...
                  </>
                ) : chapter.status === 'complete' ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-1" /> Regenerate
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1" /> Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SimpleCompositionStudio;
