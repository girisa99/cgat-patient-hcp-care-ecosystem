/**
 * UNIFIED COMPOSITION STUDIO
 * 
 * Single interface for creating multi-modal, multi-language content:
 * - Flexible chapter-based composition
 * - Mix-and-match visual types (video, avatar, 3D, animation)
 * - Multi-language TTS with regional routing
 * - Full preview before publishing
 * 
 * Replaces fragmented Video Studio + Avatar/3D tabs
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Wand2, Plus, Layers, Globe, Play, Upload, Save,
  Settings, Sparkles, Video, User, Box, FileVideo,
  ChevronRight, Check, AlertCircle, Loader2, 
  Eye, Send, ArrowLeft, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

import { ChapterEditor } from './ChapterEditor';
import { LanguageSelectorPanel } from './LanguageSelectorPanel';
import { PreviewPanel } from './PreviewPanel';
import type { 
  CompositionProject, 
  CompositionChapter, 
  DEFAULT_CHAPTERS,
  Resolution 
} from './types';

interface UnifiedCompositionStudioProps {
  className?: string;
}

// Wizard steps for the composition flow
type WizardStep = 'setup' | 'chapters' | 'languages' | 'preview' | 'publish';

const WIZARD_STEPS: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  { id: 'setup', label: 'Project Setup', icon: <Settings className="w-4 h-4" /> },
  { id: 'chapters', label: 'Build Chapters', icon: <Layers className="w-4 h-4" /> },
  { id: 'languages', label: 'Languages', icon: <Globe className="w-4 h-4" /> },
  { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
  { id: 'publish', label: 'Publish', icon: <Send className="w-4 h-4" /> },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const UnifiedCompositionStudio: React.FC<UnifiedCompositionStudioProps> = ({
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // Project state
  const [project, setProject] = useState<CompositionProject>({
    id: generateId(),
    name: '',
    description: '',
    targetLanguages: ['en'],
    primaryLanguage: 'en',
    resolution: '1080p',
    aspectRatio: '16:9',
    chapters: [],
    globalSettings: {},
    destination: 'landing_page',
    placement: 'hero_showcase',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '',
    status: 'draft',
  });

  const [chapters, setChapters] = useState<CompositionChapter[]>([]);

  // Navigation
  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  // Chapters are optional - compositions can be single elements without chapters
  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'setup': return project.name.trim().length > 0;
      case 'chapters': return true; // Chapters are optional - allow proceeding without them
      case 'languages': return project.targetLanguages.length > 0;
      case 'preview': return true; // Can always proceed from preview
      default: return false;
    }
  }, [currentStep, project, chapters]);

  const goNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id);
    }
  };

  // Chapter management
  const addChapter = useCallback((template?: Partial<CompositionChapter>) => {
    const newChapter: CompositionChapter = {
      id: generateId(),
      order: chapters.length + 1,
      title: template?.title || `Chapter ${chapters.length + 1}`,
      duration: template?.duration || 30,
      visual: template?.visual || { type: 'video', prompt: '' },
      voiceover: template?.voiceover || { type: 'tts', text: '', language: project.primaryLanguage },
      status: 'draft',
      previewUrls: {},
    };
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapter(newChapter.id);
  }, [chapters.length, project.primaryLanguage]);

  const updateChapter = useCallback((updated: CompositionChapter) => {
    setChapters(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setChapters(prev => {
      const filtered = prev.filter(c => c.id !== id);
      return filtered.map((c, i) => ({ ...c, order: i + 1 }));
    });
  }, []);

  const duplicateChapter = useCallback((id: string) => {
    const original = chapters.find(c => c.id === id);
    if (original) {
      addChapter({
        ...original,
        title: `${original.title} (Copy)`,
      });
    }
  }, [chapters, addChapter]);

  // Quick templates
  const loadTemplate = (type: 'hero' | 'product' | 'tutorial' | 'testimonial') => {
    const templates: Record<string, Partial<CompositionChapter>[]> = {
      hero: [
        { title: 'Opening Hook', duration: 15, visual: { type: 'animation' }, voiceover: { type: 'tts', text: 'Discover the future of content creation...', language: 'en' } },
        { title: 'Product Reveal', duration: 30, visual: { type: '3d' }, voiceover: { type: 'tts', text: 'Introducing Genie Studio...', language: 'en' } },
        { title: 'Call to Action', duration: 15, visual: { type: 'video' }, voiceover: { type: 'tts', text: 'Start your free trial today.', language: 'en' } },
      ],
      product: [
        { title: 'Introduction', duration: 20, visual: { type: 'avatar', avatarStyle: 'professional_western', enableLipSync: true }, voiceover: { type: 'lipsync', text: 'Welcome to Genie Studio...', language: 'en' } },
        { title: 'Feature 1', duration: 45, visual: { type: 'video' }, voiceover: { type: 'tts', text: 'First, lets look at...', language: 'en' } },
        { title: 'Feature 2', duration: 45, visual: { type: '3d' }, voiceover: { type: 'tts', text: 'Next, discover...', language: 'en' } },
        { title: 'Closing', duration: 20, visual: { type: 'avatar', enableLipSync: true }, voiceover: { type: 'lipsync', text: 'Thank you for watching.', language: 'en' } },
      ],
      tutorial: [
        { title: 'Overview', duration: 30, visual: { type: 'avatar' }, voiceover: { type: 'lipsync', text: 'In this tutorial...', language: 'en' } },
        { title: 'Step 1', duration: 60, visual: { type: 'screen_recording' }, voiceover: { type: 'tts', text: 'First, click on...', language: 'en' } },
        { title: 'Step 2', duration: 60, visual: { type: 'screen_recording' }, voiceover: { type: 'tts', text: 'Then, configure...', language: 'en' } },
        { title: 'Summary', duration: 30, visual: { type: 'avatar' }, voiceover: { type: 'lipsync', text: 'Now you know how to...', language: 'en' } },
      ],
      testimonial: [
        { title: 'Testimonial 1', duration: 45, visual: { type: 'avatar', avatarStyle: 'professional_western' }, voiceover: { type: 'lipsync', text: 'Genie Studio transformed our workflow...', language: 'en' } },
        { title: 'Testimonial 2', duration: 45, visual: { type: 'avatar', avatarStyle: 'professional_cjk' }, voiceover: { type: 'lipsync', text: 'We saved 70% on production costs...', language: 'en' } },
        { title: 'Results', duration: 30, visual: { type: 'animation' }, voiceover: { type: 'tts', text: 'Join thousands of happy customers.', language: 'en' } },
      ],
    };

    setChapters([]);
    templates[type].forEach((t, i) => {
      const chapter: CompositionChapter = {
        id: generateId(),
        order: i + 1,
        title: t.title || `Chapter ${i + 1}`,
        duration: t.duration || 30,
        visual: t.visual as any || { type: 'video' },
        voiceover: t.voiceover as any || { type: 'tts', text: '', language: 'en' },
        status: 'draft',
        previewUrls: {},
      };
      setChapters(prev => [...prev, chapter]);
    });
    toast.success(`Loaded ${type} template with ${templates[type].length} chapters`);
  };

  // Generation
  const generatePreview = async (chapterId: string, language: string) => {
    setChapters(prev => prev.map(c => 
      c.id === chapterId ? { ...c, status: 'generating', progress: 0 } : c
    ));

    try {
      // TODO: Call actual generation edge function
      // Simulate progress for now
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 300));
        setChapters(prev => prev.map(c => 
          c.id === chapterId ? { ...c, progress: i } : c
        ));
      }

      setChapters(prev => prev.map(c => 
        c.id === chapterId 
          ? { 
              ...c, 
              status: 'complete',
              previewUrls: { 
                ...c.previewUrls, 
                [language]: `https://placeholder-video.com/${chapterId}-${language}.mp4` 
              } 
            } 
          : c
      ));
      toast.success(`Preview generated for chapter in ${language}`);
    } catch (error) {
      setChapters(prev => prev.map(c => 
        c.id === chapterId 
          ? { ...c, status: 'error', error: 'Generation failed' } 
          : c
      ));
      toast.error('Failed to generate preview');
    }
  };

  const generateAllPreviews = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const totalTasks = chapters.length * project.targetLanguages.length;
    let completed = 0;

    for (const chapter of chapters) {
      for (const language of project.targetLanguages) {
        await generatePreview(chapter.id, language);
        completed++;
        setGenerationProgress(Math.round((completed / totalTasks) * 100));
      }
    }

    setIsGenerating(false);
    toast.success('All previews generated!');
  };

  const handlePublish = async () => {
    setIsGenerating(true);
    try {
      // TODO: Actual publish logic
      await new Promise(r => setTimeout(r, 2000));
      
      setProject(prev => ({ ...prev, status: 'published' }));
      toast.success('Content published to landing page!');
    } catch (error) {
      toast.error('Failed to publish');
    } finally {
      setIsGenerating(false);
    }
  };

  // Stats
  const totalDuration = chapters.reduce((sum, c) => sum + c.duration, 0);
  const completedChapters = chapters.filter(c => c.status === 'complete').length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Composition Studio
          </h1>
          <p className="text-muted-foreground">
            Create multi-modal, multi-language content with flexible chapter-based composition
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10">
            {chapters.length} Chapters
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
            {project.targetLanguages.length} Languages
          </Badge>
          <Badge variant="outline">
            {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')} Total
          </Badge>
        </div>
      </div>

      {/* Wizard Progress */}
      <div className="flex items-center justify-between px-4">
        {WIZARD_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                currentStep === step.id 
                  ? "bg-primary text-primary-foreground" 
                  : index < currentStepIndex
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStepIndex ? (
                <Check className="w-4 h-4" />
              ) : (
                step.icon
              )}
              <span className="text-sm font-medium">{step.label}</span>
            </button>
            {index < WIZARD_STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {/* Step 1: Project Setup */}
        {currentStep === 'setup' && (
          <Card>
            <CardHeader>
              <CardTitle>Project Setup</CardTitle>
              <CardDescription>
                Configure your composition project settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project Name *</Label>
                    <Input
                      value={project.name}
                      onChange={(e) => setProject(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Q1 Product Launch Video"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => setProject(p => ({ ...p, description: e.target.value }))}
                      placeholder="Brief description of this project..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select
                      value={project.resolution}
                      onValueChange={(v) => setProject(p => ({ ...p, resolution: v as Resolution }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p (Fast)</SelectItem>
                        <SelectItem value="1080p">1080p (Recommended)</SelectItem>
                        <SelectItem value="4k">4K (Premium)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Aspect Ratio</Label>
                    <Select
                      value={project.aspectRatio}
                      onValueChange={(v) => setProject(p => ({ ...p, aspectRatio: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait/Mobile)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Select
                      value={project.destination}
                      onValueChange={(v) => setProject(p => ({ ...p, destination: v as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Website Destinations */}
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                        <SelectItem value="website">Website / Blog</SelectItem>
                        {/* Social Media Destinations */}
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="linkedin">LinkedIn (Personal)</SelectItem>
                        <SelectItem value="linkedin_company">LinkedIn (Company)</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="twitter">X (Twitter)</SelectItem>
                        {/* Other */}
                        <SelectItem value="download">Download</SelectItem>
                        <SelectItem value="storage">Cloud Storage</SelectItem>
                        <SelectItem value="multi_platform">Multi-Platform (Schedule All)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {project.destination === 'landing_page' && (
                    <div className="space-y-2">
                      <Label>Placement</Label>
                      <Select
                        value={project.placement}
                        onValueChange={(v) => setProject(p => ({ ...p, placement: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero_showcase">Hero Showcase</SelectItem>
                          <SelectItem value="product_demo">Product Demo</SelectItem>
                          <SelectItem value="testimonials">Testimonials</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="feature_highlight">Feature Highlight</SelectItem>
                          <SelectItem value="use_case_demo">Use Case Demo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {['youtube', 'linkedin', 'linkedin_company', 'facebook', 'instagram', 'tiktok', 'twitter'].includes(project.destination) && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                      <p className="font-medium text-primary">Social Media Destination</p>
                      <p className="text-muted-foreground mt-1">
                        Content will be optimized for {project.destination === 'twitter' ? 'X (Twitter)' : project.destination} 
                        and queued in the scheduler for distribution.
                      </p>
                    </div>
                  )}
                  {project.destination === 'multi_platform' && (
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                      <p className="font-medium text-accent-foreground">Multi-Platform Distribution</p>
                      <p className="text-muted-foreground mt-1">
                        Content will be scheduled for distribution across all connected platforms 
                        (YouTube, LinkedIn, Facebook, TikTok, X, Instagram, and website).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Start Templates */}
              <Separator />
              <div className="space-y-3">
                <Label>Quick Start with Template</Label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'hero', label: 'Hero Video', icon: <Sparkles className="w-5 h-5" />, desc: '3 chapters, 60s' },
                    { id: 'product', label: 'Product Demo', icon: <FileVideo className="w-5 h-5" />, desc: '4 chapters, 130s' },
                    { id: 'tutorial', label: 'Tutorial', icon: <Video className="w-5 h-5" />, desc: '4 chapters, 180s' },
                    { id: 'testimonial', label: 'Testimonials', icon: <User className="w-5 h-5" />, desc: '3 chapters, 120s' },
                  ].map((t) => (
                    <Button
                      key={t.id}
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => {
                        loadTemplate(t.id as any);
                        setProject(p => ({ ...p, name: p.name || t.label }));
                      }}
                    >
                      {t.icon}
                      <span className="font-medium">{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Build Content */}
        {currentStep === 'chapters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Build Your Content</h2>
                <p className="text-sm text-muted-foreground">
                  Choose single elements or create multi-chapter compositions
                </p>
              </div>
              {chapters.length > 0 && (
                <Button onClick={() => addChapter()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Chapter
                </Button>
              )}
            </div>

            {chapters.length === 0 ? (
              <div className="space-y-6">
                {/* Quick Single Element Cards */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Quick Create - Single Element</Label>
                  <p className="text-sm text-muted-foreground">
                    Create a single visual element without chapters
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { type: 'video' as const, icon: Video, label: 'AI Video', desc: 'Generate video from prompt' },
                      { type: 'avatar' as const, icon: User, label: 'AI Avatar', desc: 'Speaking avatar with lip-sync' },
                      { type: '3d' as const, icon: Box, label: '3D Model', desc: 'Generate 3D assets' },
                      { type: 'animation' as const, icon: Sparkles, label: 'Animation', desc: 'Motion graphics & effects' },
                    ].map((item) => (
                      <Card 
                        key={item.type}
                        className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group"
                        onClick={() => addChapter({
                          title: item.label,
                          duration: 30,
                          visual: { type: item.type },
                          voiceover: { type: 'none', text: '', language: project.primaryLanguage },
                        })}
                      >
                        <CardContent className="pt-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                            <item.icon className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="font-medium mb-1">{item.label}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Combination Elements */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Combination Workflows</Label>
                  <p className="text-sm text-muted-foreground">
                    Mix multiple visual types for richer content
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { 
                        label: 'Avatar + 3D Product', 
                        desc: 'Avatar presents a 3D product model',
                        icons: [User, Box],
                        chapters: [
                          { title: 'Avatar Introduction', visual: { type: 'avatar' as const, avatarStyle: 'professional_western', enableLipSync: true }, voiceover: { type: 'lipsync' as const, text: 'Let me show you our product...', language: 'en' }, duration: 15 },
                          { title: '3D Product Showcase', visual: { type: '3d' as const }, voiceover: { type: 'tts' as const, text: 'Here is the product in 3D...', language: 'en' }, duration: 30 },
                        ]
                      },
                      { 
                        label: 'Video + Avatar Closing', 
                        desc: 'AI-generated video with avatar wrap-up',
                        icons: [Video, User],
                        chapters: [
                          { title: 'Main Video Content', visual: { type: 'video' as const }, voiceover: { type: 'tts' as const, text: '', language: 'en' }, duration: 45 },
                          { title: 'Avatar Summary', visual: { type: 'avatar' as const, enableLipSync: true }, voiceover: { type: 'lipsync' as const, text: 'Thank you for watching...', language: 'en' }, duration: 15 },
                        ]
                      },
                      { 
                        label: 'Animation + 3D Scene', 
                        desc: 'Motion graphics with 3D environments',
                        icons: [Sparkles, Box],
                        chapters: [
                          { title: 'Animated Intro', visual: { type: 'animation' as const }, voiceover: { type: 'tts' as const, text: '', language: 'en' }, duration: 10 },
                          { title: '3D Environment', visual: { type: '3d' as const }, voiceover: { type: 'tts' as const, text: '', language: 'en' }, duration: 30 },
                        ]
                      },
                    ].map((combo, idx) => (
                      <Card 
                        key={idx}
                        className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group"
                        onClick={() => {
                          setChapters([]);
                          combo.chapters.forEach((c, i) => {
                            const chapter: CompositionChapter = {
                              id: generateId(),
                              order: i + 1,
                              title: c.title,
                              duration: c.duration,
                              visual: c.visual as any,
                              voiceover: c.voiceover as any,
                              status: 'draft',
                              previewUrls: {},
                            };
                            setChapters(prev => [...prev, chapter]);
                          });
                          toast.success(`Loaded ${combo.label} combination`);
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            {combo.icons.map((Icon, i) => (
                              <React.Fragment key={i}>
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                {i < combo.icons.length - 1 && (
                                  <Plus className="w-4 h-4 text-muted-foreground" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          <h4 className="font-medium text-center mb-1">{combo.label}</h4>
                          <p className="text-xs text-muted-foreground text-center">{combo.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Multi-Chapter Builder */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Multi-Chapter Composition</Label>
                  <p className="text-sm text-muted-foreground">
                    Build custom chapter-based content from scratch
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => addChapter()} variant="outline" className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Start with Empty Chapter
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentStep('setup')} className="flex-1">
                      <Layers className="w-4 h-4 mr-2" />
                      Use Template from Setup
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {chapters.map((chapter) => (
                    <ChapterEditor
                      key={chapter.id}
                      chapter={chapter}
                      languages={project.targetLanguages}
                      onUpdate={updateChapter}
                      onDelete={() => deleteChapter(chapter.id)}
                      onDuplicate={() => duplicateChapter(chapter.id)}
                      onPreview={(lang) => generatePreview(chapter.id, lang)}
                      isExpanded={expandedChapter === chapter.id}
                      onToggleExpand={() => setExpandedChapter(
                        expandedChapter === chapter.id ? null : chapter.id
                      )}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Step 3: Languages */}
        {currentStep === 'languages' && (
          <LanguageSelectorPanel
            selectedLanguages={project.targetLanguages}
            primaryLanguage={project.primaryLanguage}
            onLanguagesChange={(langs) => setProject(p => ({ ...p, targetLanguages: langs }))}
            onPrimaryChange={(lang) => setProject(p => ({ ...p, primaryLanguage: lang }))}
          />
        )}

        {/* Step 4: Preview */}
        {currentStep === 'preview' && (
          <PreviewPanel
            project={project}
            chapters={chapters}
            onGeneratePreview={generatePreview}
            onGenerateAll={generateAllPreviews}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
          />
        )}

        {/* Step 5: Publish */}
        {currentStep === 'publish' && (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Publish</CardTitle>
              <CardDescription>
                Review your composition and publish to {project.destination.replace('_', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{chapters.length}</div>
                    <div className="text-sm text-muted-foreground">Chapters</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{project.targetLanguages.length}</div>
                    <div className="text-sm text-muted-foreground">Languages</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</div>
                    <div className="text-sm text-muted-foreground">Total Duration</div>
                  </CardContent>
                </Card>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <Label>Pre-publish Checklist</Label>
                <div className="space-y-2">
                  {[
                    { label: 'All chapters configured', done: chapters.every(c => c.visual.type && (c.visual.prompt || c.visual.avatarStyle || c.visual.meshPrompt)) },
                    { label: 'Voiceover scripts added', done: chapters.every(c => c.voiceover.type === 'none' || c.voiceover.text) },
                    { label: 'Previews generated', done: completedChapters === chapters.length },
                    { label: 'Languages selected', done: project.targetLanguages.length > 0 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {item.done ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={cn(
                        "text-sm",
                        item.done ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  size="lg"
                  onClick={handlePublish}
                  disabled={isGenerating || project.status === 'published'}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : project.status === 'published' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Published
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish to {project.destination.replace('_', ' ')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {currentStep !== 'publish' && (
          <Button
            onClick={goNext}
            disabled={!canGoNext}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UnifiedCompositionStudio;
