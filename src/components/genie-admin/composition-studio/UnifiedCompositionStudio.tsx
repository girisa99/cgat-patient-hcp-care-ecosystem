/**
 * UNIFIED COMPOSITION STUDIO
 * 
 * Single interface for creating multi-modal, multi-language content:
 * - Flexible chapter-based composition
 * - Mix-and-match visual types (video, avatar, 3D, animation)
 * - Multi-language TTS with regional routing
 * - Full preview before publishing
 * - Template preview with landing page alignment
 * - Scheduled content management
 * 
 * Replaces fragmented Video Studio + Avatar/3D tabs
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Eye, Send, ArrowLeft, ArrowRight, Clock, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  contentGenerationService, 
  generateChapter as generateChapterService,
  checkGenerationHealth,
  type GenerationRequest,
  type GenerationProgress 
} from '@/services/contentGenerationService';
import type { OutputFormat } from '@/config/content-generation-pipeline';

import { ChapterEditor } from './ChapterEditor';
import { LanguageSelectorPanel } from './LanguageSelectorPanel';
import { PreviewPanel } from './PreviewPanel';
import { TemplatePreviewDialog, TEMPLATE_DEFINITIONS, LANDING_PAGE_SECTIONS } from './TemplatePreviewDialog';
import { ScheduledContentManager } from './ScheduledContentManager';
import { TemplateLandingMapper } from './TemplateLandingMapper';
import { ElementCategoryTabs, type CategoryElement } from './ElementCategoryTabs';
import { ContentReviewQueue, type ReviewItem, getTargetRegionsFromLanguages } from './ContentReviewQueue';
import { AddChapterDialog } from './AddChapterDialog';
import { ChapterRegenerationPanel, type RegenerationTarget, type RegenerationOptions } from './ChapterRegenerationPanel';
import { ThumbnailManager, type ContentMetadata } from './ThumbnailManager';
import type { 
  CompositionProject, 
  CompositionChapter, 
  DEFAULT_CHAPTERS,
  Resolution 
} from './types';

interface UnifiedCompositionStudioProps {
  className?: string;
  compositionId?: string; // When provided, loads existing project from Library
  onOpenLibrary?: () => void; // Callback to navigate to Library
}

// Wizard steps for the composition flow
type WizardStep = 'setup' | 'chapters' | 'languages' | 'preview' | 'publish';

// Dynamic step configuration based on project context
interface DynamicStepConfig {
  id: WizardStep;
  label: string;
  dynamicLabel?: (project: CompositionProject, elementsCount: number, chaptersCount: number) => string;
  description: string;
  dynamicDescription?: (project: CompositionProject, elementsCount: number, chaptersCount: number) => string;
  icon: React.ReactNode;
  getStatus: (project: CompositionProject, elementsCount: number, chaptersCount: number) => 'pending' | 'configured' | 'complete';
  getStatusLabel: (project: CompositionProject, elementsCount: number, chaptersCount: number) => string;
}

const WIZARD_STEPS: DynamicStepConfig[] = [
  { 
    id: 'setup', 
    label: 'Project Setup',
    dynamicLabel: (p) => p.destination === 'multi_platform' 
      ? 'Multi-Platform Setup' 
      : p.destination === 'landing_page' 
        ? `Setup → ${p.placement?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Landing Page'}`
        : 'Project Setup',
    description: 'Configure name, destination, and output settings',
    dynamicDescription: (p) => {
      if (p.destination === 'landing_page') {
        return `Publishing to "${p.placement?.replace(/_/g, ' ')}" section on landing page`;
      } else if (p.destination === 'multi_platform') {
        return 'Content will be distributed across all connected platforms';
      } else if (['youtube', 'linkedin', 'tiktok'].includes(p.destination)) {
        return `Optimizing for ${p.destination.charAt(0).toUpperCase() + p.destination.slice(1)} distribution`;
      }
      return 'Configure name, destination, and output settings';
    },
    icon: <Settings className="w-4 h-4" />,
    getStatus: (p) => p.name.trim() ? 'complete' : 'pending',
    getStatusLabel: (p) => p.name.trim() ? `"${p.name}"` : 'Name required',
  },
  { 
    id: 'chapters', 
    label: 'Build Content',
    dynamicLabel: (p, elements, chapters) => {
      if (chapters > 0 && elements > 0) return `${chapters} Chapters + ${elements} Elements`;
      if (chapters > 0) return `${chapters} Chapter${chapters > 1 ? 's' : ''}`;
      if (elements > 0) return `${elements} Element${elements > 1 ? 's' : ''}`;
      return 'Build Content';
    },
    description: 'Add chapters or individual elements (video, avatar, 3D, etc.)',
    dynamicDescription: (p, elements, chapters) => {
      if (chapters === 0 && elements === 0) {
        return 'Start with a template, add chapters, or mix elements by category';
      }
      const parts: string[] = [];
      if (chapters > 0) parts.push(`${chapters} chapter${chapters > 1 ? 's' : ''}`);
      if (elements > 0) parts.push(`${elements} element${elements > 1 ? 's' : ''}`);
      return `Content includes ${parts.join(' and ')}`;
    },
    icon: <Layers className="w-4 h-4" />,
    getStatus: (p, elements, chapters) => 
      chapters > 0 || elements > 0 ? 'complete' : 'pending',
    getStatusLabel: (p, elements, chapters) => {
      if (chapters === 0 && elements === 0) return 'Optional';
      return `${chapters + elements} items`;
    },
  },
  { 
    id: 'languages', 
    label: 'Languages',
    dynamicLabel: (p) => p.targetLanguages.length > 1 
      ? `${p.targetLanguages.length} Languages` 
      : 'Single Language',
    description: 'Select target languages and regional dialects',
    dynamicDescription: (p) => {
      if (p.targetLanguages.length === 1) {
        return `Primary language: ${p.primaryLanguage.toUpperCase()}. Add more for localization.`;
      }
      return `Localizing to ${p.targetLanguages.length} languages with regional TTS routing`;
    },
    icon: <Globe className="w-4 h-4" />,
    getStatus: (p) => p.targetLanguages.length > 0 ? 'complete' : 'pending',
    getStatusLabel: (p) => {
      if (p.targetLanguages.length === 0) return 'Required';
      return p.targetLanguages.map(l => l.toUpperCase()).join(', ');
    },
  },
  { 
    id: 'preview', 
    label: 'Preview',
    description: 'Generate and review content before publishing',
    icon: <Eye className="w-4 h-4" />,
    getStatus: () => 'pending',
    getStatusLabel: () => 'Generate previews',
  },
  { 
    id: 'publish', 
    label: 'Publish',
    dynamicLabel: (p) => {
      if (p.destination === 'landing_page') return 'Publish to Landing Page';
      if (p.destination === 'multi_platform') return 'Distribute All';
      if (['youtube', 'linkedin', 'tiktok', 'instagram', 'twitter', 'facebook'].includes(p.destination)) {
        return `Post to ${p.destination.charAt(0).toUpperCase() + p.destination.slice(1)}`;
      }
      return 'Publish';
    },
    description: 'Submit for review and schedule publication',
    dynamicDescription: (p) => {
      if (p.destination === 'landing_page') {
        return `Content will appear in "${p.placement?.replace(/_/g, ' ')}" after approval`;
      }
      return 'Submit for review and schedule publication';
    },
    icon: <Send className="w-4 h-4" />,
    getStatus: (p) => p.status === 'published' ? 'complete' : 'pending',
    getStatusLabel: (p) => p.status === 'published' ? 'Published' : 'Ready to submit',
  },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const UnifiedCompositionStudio: React.FC<UnifiedCompositionStudioProps> = ({
  className,
  compositionId,
  onOpenLibrary,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  
  // Template preview dialog state
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<typeof TEMPLATE_DEFINITIONS[0] | null>(null);
  
  // Show scheduler view
  const [showScheduler, setShowScheduler] = useState(false);
  // Show template-landing mapper
  const [showMapper, setShowMapper] = useState(false);
  // Show review queue
  const [showReviewQueue, setShowReviewQueue] = useState(false);
  // Category-based elements
  const [categoryElements, setCategoryElements] = useState<CategoryElement[]>([]);
  // Review items
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  // View mode for chapters step
  const [chaptersViewMode, setChaptersViewMode] = useState<'chapters' | 'categories'>('chapters');
  
  // Add Chapter Dialog
  const [showAddChapterDialog, setShowAddChapterDialog] = useState(false);
  
  // Selected chapter for regeneration
  const [selectedChapterForRegen, setSelectedChapterForRegen] = useState<string | null>(null);
  const [isRegeneratingChapter, setIsRegeneratingChapter] = useState(false);
  const [regenerationProgress, setRegenerationProgress] = useState(0);
  
  // Content metadata (thumbnails, titles)
  const [contentMetadata, setContentMetadata] = useState<ContentMetadata>({
    title: '',
    description: '',
    thumbnails: {},
    suggestedTitles: [],
  });
  
  // Generated content storage - maps "chapterId_language" to content data
  const [generatedContent, setGeneratedContent] = useState<Map<string, { 
    previewUrl: string; 
    script?: string;
    sceneDescription?: string 
  }>>(new Map());
  
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

  // Load existing project from Library when compositionId is provided
  useEffect(() => {
    if (compositionId) {
      setIsLoadingProject(true);
      const loadProject = async () => {
        try {
          const { data, error } = await supabase
            .from('landing_page_videos')
            .select('*')
            .eq('id', compositionId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            // Map library item to project structure
            setProject(prev => ({
              ...prev,
              id: data.id,
              name: data.title || '',
              description: data.description || '',
              targetLanguages: [data.language_code || 'en'],
              primaryLanguage: data.language_code || 'en',
              destination: 'landing_page',
              placement: data.placement || 'hero_showcase',
              status: data.published_at ? 'published' : data.is_active ? 'in_progress' : 'draft',
            }));
            toast.info(`Loaded project: ${data.title}`);
          }
        } catch (err) {
          console.error('Error loading project:', err);
          toast.error('Failed to load project');
        } finally {
          setIsLoadingProject(false);
        }
      };
      loadProject();
    }
  }, [compositionId]);

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

  // Chapter management - enhanced with position support
  const addChapter = useCallback((template?: Partial<CompositionChapter>, position?: 'start' | 'end' | number) => {
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
    
    setChapters(prev => {
      let newChapters: CompositionChapter[];
      
      if (position === 'start') {
        newChapters = [newChapter, ...prev];
      } else if (typeof position === 'number') {
        newChapters = [...prev.slice(0, position), newChapter, ...prev.slice(position)];
      } else {
        newChapters = [...prev, newChapter];
      }
      
      // Reorder
      return newChapters.map((c, i) => ({ ...c, order: i + 1 }));
    });
    
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

  // Selective regeneration handler
  const handleChapterRegeneration = useCallback(async (
    chapterId: string,
    language: string,
    target: RegenerationTarget,
    options: RegenerationOptions
  ) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    setIsRegeneratingChapter(true);
    setRegenerationProgress(0);

    try {
      console.log(`[Studio] Regenerating ${target} for chapter: ${chapter.title}`);
      
      // Update chapter with new script if provided
      if (options.newScript && options.newScript !== chapter.voiceover?.text) {
        updateChapter({
          ...chapter,
          voiceover: { ...chapter.voiceover, text: options.newScript } as any,
        });
      }

      setRegenerationProgress(20);

      // Call appropriate regeneration based on target
      const request: GenerationRequest = {
        templateId: project.name || 'custom',
        chapterIndex: chapters.findIndex(c => c.id === chapterId),
        language,
        outputFormat: 'avatar_ppt',
        visualType: target === 'avatar_only' ? 'avatar' : 
                    target === 'animation_only' ? 'animation' : 
                    (chapter.visual?.type === 'custom' ? 'video' : chapter.visual?.type) || 'video',
        duration: chapter.duration || 30,
        scriptContent: options.newScript || chapter.voiceover?.text || '',
        userTier: 'creator'
      };

      setRegenerationProgress(50);

      const result = await generateChapterService(request, (progress) => {
        setRegenerationProgress(50 + (progress.progress / 2));
      });

      if (result.success) {
        const contentKey = `${chapterId}_${language}`;
        setGeneratedContent(prev => {
          const updated = new Map(prev);
          updated.set(contentKey, {
            previewUrl: result.previewUrl || '',
            script: result.scriptContent,
            sceneDescription: result.sceneDescription
          });
          return updated;
        });

        setChapters(prev => prev.map(c => 
          c.id === chapterId 
            ? { ...c, status: 'complete', previewUrls: { ...c.previewUrls, [language]: result.previewUrl || '' } } 
            : c
        ));

        toast.success(`${target.replace(/_/g, ' ')} regenerated for "${chapter.title}"`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[Studio] Regeneration error:', error);
      toast.error(`Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRegeneratingChapter(false);
      setRegenerationProgress(0);
      setSelectedChapterForRegen(null);
    }
  }, [chapters, project.name, updateChapter]);

  // Quick templates - now supports ALL TEMPLATE_DEFINITIONS
  const loadTemplate = (templateId: string) => {
    // Find template from TEMPLATE_DEFINITIONS
    const templateDef = TEMPLATE_DEFINITIONS.find(t => t.id === templateId);
    
    if (templateDef) {
      // Load from TEMPLATE_DEFINITIONS (has full chapter info)
      setChapters([]);
      templateDef.chapters.forEach((ch, i) => {
        const chapter: CompositionChapter = {
          id: generateId(),
          order: i + 1,
          title: ch.title,
          duration: ch.duration,
          visual: { 
            type: ch.type,
            prompt: ch.description,
          },
          voiceover: { 
            type: ch.type === 'avatar' ? 'lipsync' : 'tts', 
            text: ch.description || '', 
            language: 'en' 
          },
          status: 'draft',
          previewUrls: {},
        };
        setChapters(prev => [...prev, chapter]);
      });
      
      // Update project name and set to chapters view
      setProject(p => ({ 
        ...p, 
        name: p.name || templateDef.label,
        description: templateDef.desc 
      }));
      setChaptersViewMode('chapters');
      setCurrentStep('chapters');
      toast.success(`Loaded "${templateDef.label}" with ${templateDef.chapters.length} chapters`);
      return;
    }
    
    // Fallback for legacy template types
    const legacyTemplates: Record<string, Partial<CompositionChapter>[]> = {
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

    if (legacyTemplates[templateId]) {
      setChapters([]);
      legacyTemplates[templateId].forEach((t, i) => {
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
      setChaptersViewMode('chapters');
      setCurrentStep('chapters');
      toast.success(`Loaded ${templateId} template with ${legacyTemplates[templateId].length} chapters`);
      return;
    }
    
    toast.error(`Template "${templateId}" not found`);
  };

  // Real Generation using contentGenerationService
  const generatePreview = async (chapterId: string, language: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) {
      toast.error('Chapter not found');
      return;
    }

    setChapters(prev => prev.map(c => 
      c.id === chapterId ? { ...c, status: 'generating', progress: 0 } : c
    ));

    try {
      console.log(`[Studio] Generating preview for chapter: ${chapter.title}, language: ${language}`);
      
      // Map chapter visual type to generation request
      const request: GenerationRequest = {
        templateId: project.name || 'custom',
        chapterIndex: chapters.findIndex(c => c.id === chapterId),
        language,
        outputFormat: 'avatar_ppt', // Default format
        visualType: (chapter.visual?.type === 'custom' ? 'video' : chapter.visual?.type) || 'video',
        duration: chapter.duration || 30,
        scriptContent: chapter.visual?.prompt || chapter.voiceover?.text || '',
        userTier: 'creator' // TODO: Get from user context
      };

      const result = await generateChapterService(request, (progress) => {
        setChapters(prev => prev.map(c => 
          c.id === chapterId ? { ...c, progress: progress.progress } : c
        ));
      });

      if (result.success) {
        const previewUrl = result.previewUrl || `https://placehold.co/1920x1080/6366f1/ffffff?text=${encodeURIComponent(chapter.title)}`;
        
        // Store in generated content map
        const contentKey = `${chapterId}_${language}`;
        setGeneratedContent(prev => {
          const updated = new Map(prev);
          updated.set(contentKey, {
            previewUrl,
            script: result.scriptContent,
            sceneDescription: result.sceneDescription
          });
          return updated;
        });
        
        // Update chapter state
        setChapters(prev => prev.map(c => 
          c.id === chapterId 
            ? { 
                ...c, 
                status: 'complete',
                progress: 100,
                previewUrls: { 
                  ...c.previewUrls, 
                  [language]: previewUrl
                } 
              } 
            : c
        ));
        
        console.log(`[Studio] Generated content stored for ${chapter.title} (${language}):`, {
          hasPreview: !!previewUrl,
          hasScript: !!result.scriptContent,
          contentKey
        });
        
        toast.success(`Preview generated for "${chapter.title}" in ${language}`);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Generation failed';
      console.error('[Studio] Generation error:', error);
      
      setChapters(prev => prev.map(c => 
        c.id === chapterId 
          ? { ...c, status: 'error', error: errorMsg, progress: 0 } 
          : c
      ));
      toast.error(`Failed to generate preview: ${errorMsg}`);
    }
  };

  const generateAllPreviews = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const totalTasks = chapters.length * project.targetLanguages.length;
    let completed = 0;
    let errors: string[] = [];

    console.log(`[Studio] Starting generation of ${totalTasks} previews...`);

    for (const chapter of chapters) {
      for (const language of project.targetLanguages) {
        try {
          await generatePreview(chapter.id, language);
        } catch (error) {
          errors.push(`${chapter.title} (${language})`);
        }
        completed++;
        setGenerationProgress(Math.round((completed / totalTasks) * 100));
      }
    }

    setIsGenerating(false);
    
    if (errors.length > 0) {
      toast.warning(`Generated with ${errors.length} errors. Failed: ${errors.join(', ')}`);
    } else {
      toast.success('All previews generated successfully!');
    }
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

  // Loading state for project load
  if (isLoadingProject) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[400px] gap-4", className)}>
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onOpenLibrary && (
            <Button variant="ghost" size="sm" onClick={onOpenLibrary}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Library
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {compositionId ? 'Edit Composition' : 'Composition Studio'}
            </h1>
            <p className="text-muted-foreground">
              {compositionId 
                ? `Editing: ${project.name || 'Untitled Project'}` 
                : 'Create multi-modal, multi-language content with flexible chapter-based composition'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {categoryElements.length > 0 && (
            <Badge variant="outline" className="bg-accent/10">
              {categoryElements.length} Elements
            </Badge>
          )}
          <Badge variant="outline" className="bg-primary/10">
            {chapters.length} Chapters
          </Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
            {project.targetLanguages.length} Languages
          </Badge>
          <Badge variant="outline">
            {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')} Total
          </Badge>
        </div>
      </div>

      {/* Wizard Progress - Dynamic Labels & Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const status = step.getStatus(project, categoryElements.length, chapters.length);
            const dynamicLabel = step.dynamicLabel?.(project, categoryElements.length, chapters.length) || step.label;
            const dynamicDescription = step.dynamicDescription?.(project, categoryElements.length, chapters.length) || step.description;
            const statusLabel = step.getStatusLabel(project, categoryElements.length, chapters.length);
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-3 rounded-lg transition-all min-w-[140px] group",
                    currentStep === step.id 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : status === 'complete'
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                        : index < currentStepIndex
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {status === 'complete' && currentStep !== step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                    <span className="text-sm font-medium">{dynamicLabel}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] max-w-[120px] truncate",
                    currentStep === step.id 
                      ? "text-primary-foreground/80" 
                      : "text-muted-foreground"
                  )}>
                    {statusLabel}
                  </span>
                  {/* Hover tooltip with full description */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg text-xs max-w-[200px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border">
                    {dynamicDescription}
                  </div>
                </button>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className={cn(
                      "h-[2px] w-full max-w-[60px] rounded-full transition-colors",
                      index < currentStepIndex ? "bg-primary" : "bg-border"
                    )} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Current step description */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {WIZARD_STEPS.find(s => s.id === currentStep)?.dynamicDescription?.(project, categoryElements.length, chapters.length) 
                || WIZARD_STEPS.find(s => s.id === currentStep)?.description}
            </p>
          </div>
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {currentStepIndex < WIZARD_STEPS.length - 1 && (
              <Button size="sm" onClick={goNext} disabled={!canGoNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>

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
                      <Label>Placement (Landing Page Section)</Label>
                      <Select
                        value={project.placement}
                        onValueChange={(v) => setProject(p => ({ ...p, placement: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero_showcase">Hero Showcase (Main Hero)</SelectItem>
                          <SelectItem value="product_demo">Product Demo / Use Cases</SelectItem>
                          <SelectItem value="tutorial_howto">Tutorial / How-to</SelectItem>
                          <SelectItem value="testimonials">Testimonials / Social Proof</SelectItem>
                          <SelectItem value="dialect_demo">True Localization Demo (Dialects)</SelectItem>
                          <SelectItem value="industry_showcases">Industry Showcases (IP-based)</SelectItem>
                          <SelectItem value="global_success_stories">Global Success Stories</SelectItem>
                          <SelectItem value="explore_use_cases">Explore Use Cases (View-only)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Content will appear in this section on the landing page. Some sections support user interaction.
                      </p>
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

              {/* Quick Start Templates with Preview Dialog */}
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Quick Start with Template</Label>
                  <span className="text-xs text-muted-foreground">Click to preview and select template</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {TEMPLATE_DEFINITIONS.map((t) => (
                    <div key={t.id} className="relative">
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex flex-col gap-2 w-full hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => {
                          setSelectedTemplateForPreview(t);
                          setTemplatePreviewOpen(true);
                        }}
                      >
                        {t.icon}
                        <span className="font-medium">{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.desc}</span>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {t.landingPageSection.split(' / ')[0]}
                        </Badge>
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Templates are aligned with landing page sections. Click to see chapter breakdown, 
                  landing page placement, and social media distribution options.
                </p>
              </div>
              
              {/* Scheduled Content Link */}
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-lg border bg-accent/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Scheduled Content</span>
                    <p className="text-sm text-muted-foreground">
                      View, edit, and manage your scheduled and generated content
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowScheduler(true)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Scheduler
                </Button>
              </div>
              
              {/* Template-Landing Mapper Link */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <span className="font-medium">Template → Landing Page Mapping</span>
                    <p className="text-sm text-muted-foreground">
                      View which templates publish to which landing page sections
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowMapper(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Mapping
                </Button>
              </div>
              
              {/* Review Queue Link */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Content Review Queue</span>
                    <p className="text-sm text-muted-foreground">
                      Multi-stage review and approval workflow
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowReviewQueue(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Queue
                </Button>
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
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border overflow-hidden">
                  <Button 
                    variant={chaptersViewMode === 'chapters' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setChaptersViewMode('chapters')}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    Chapters
                  </Button>
                  <Button 
                    variant={chaptersViewMode === 'categories' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setChaptersViewMode('categories')}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Categories
                  </Button>
                </div>
                {chaptersViewMode === 'chapters' && (
                  <Button onClick={() => setShowAddChapterDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Chapter
                  </Button>
                )}
              </div>
            </div>

            {/* Category View Mode */}
            {chaptersViewMode === 'categories' && (
              <ElementCategoryTabs
                elements={categoryElements}
                onElementsChange={setCategoryElements}
                currentTier="pro"
              />
            )}

            {/* Chapters View Mode */}
            {chaptersViewMode === 'chapters' && chapters.length === 0 ? (
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
            ) : chaptersViewMode === 'chapters' && chapters.length > 0 ? (
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
            ) : null}
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
            generatedContent={generatedContent}
          />
        )}

        {/* Step 5: Publish */}
        {currentStep === 'publish' && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Publish</CardTitle>
              <CardDescription>
                Review your composition before publishing to {project.destination.replace('_', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
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
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{project.destination === 'multi_platform' ? '7+' : '1'}</div>
                    <div className="text-sm text-muted-foreground">Destinations</div>
                  </CardContent>
                </Card>
              </div>

              {/* Chapter Summary */}
              <div className="space-y-2">
                <Label>Chapter Summary</Label>
                <div className="rounded-lg border divide-y">
                  {chapters.map((ch, i) => (
                    <div key={ch.id} className="flex items-center gap-3 p-3">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                        {i + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{ch.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="capitalize">{ch.visual.type}</span>
                          <span>•</span>
                          <span>{ch.duration}s</span>
                          <span>•</span>
                          <span className="capitalize">{ch.voiceover.type === 'none' ? 'No audio' : ch.voiceover.type}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={ch.status === 'complete' ? 'default' : ch.status === 'generating' ? 'secondary' : 'outline'}
                        className={ch.status === 'complete' ? 'bg-emerald-500' : ''}
                      >
                        {ch.status === 'complete' ? '✓ Ready' : ch.status === 'generating' ? 'Generating...' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-publish Checklist */}
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
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
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

              {/* Publish Actions */}
              <div className="space-y-3">
                <Label>Publish Action</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => {
                      setProject(p => ({ ...p, status: 'draft' }));
                      toast.success('Saved as draft');
                    }}
                    disabled={isGenerating}
                  >
                    <Save className="w-5 h-5" />
                    <span className="font-medium">Save Draft</span>
                    <span className="text-xs text-muted-foreground">Continue later</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 border-primary/50"
                    onClick={() => {
                      setProject(p => ({ ...p, status: 'ready' }));
                      toast.success('Sent for review - will appear in scheduler for approval');
                    }}
                    disabled={isGenerating}
                  >
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="font-medium">Send for Review</span>
                    <span className="text-xs text-muted-foreground">Queue in scheduler</span>
                  </Button>
                  
                  <Button 
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={handlePublish}
                    disabled={isGenerating || project.status === 'published'}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium">Publishing...</span>
                      </>
                    ) : project.status === 'published' ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Published</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="font-medium">Approve & Publish</span>
                        <span className="text-xs opacity-80">Go live immediately</span>
                      </>
                    )}
                  </Button>
                </div>
                
                {project.destination === 'multi_platform' && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                    <p className="font-medium">Multi-Platform Publishing</p>
                    <p className="text-muted-foreground mt-1">
                      Content will be distributed to: YouTube, LinkedIn, Facebook, Instagram, TikTok, X, and your website. 
                      Each platform version will be auto-optimized for that platform's requirements.
                    </p>
                  </div>
                )}
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
      
      {/* Template Preview Dialog */}
      <TemplatePreviewDialog
        open={templatePreviewOpen}
        onOpenChange={setTemplatePreviewOpen}
        template={selectedTemplateForPreview}
        onSelectTemplate={(templateId) => {
          loadTemplate(templateId as any);
          const template = TEMPLATE_DEFINITIONS.find(t => t.id === templateId);
          if (template) {
            setProject(p => ({ ...p, name: p.name || template.label }));
          }
          toast.success(`Loaded ${templateId} template`);
        }}
      />
      
      {/* Scheduler Dialog */}
      {showScheduler && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 md:inset-10 bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Content Manager
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduler(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <ScheduledContentManager 
                onEditProject={(projectId) => {
                  // TODO: Load project for editing
                  setShowScheduler(false);
                  toast.info(`Opening project ${projectId} for editing`);
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Template-Landing Mapper Dialog */}
      {showMapper && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 md:inset-10 bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Template → Landing Page Mapping
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMapper(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <TemplateLandingMapper 
                onSelectTemplate={(templateId) => {
                  const template = TEMPLATE_DEFINITIONS.find(t => t.id === templateId);
                  if (template) {
                    setSelectedTemplateForPreview(template);
                    setTemplatePreviewOpen(true);
                    setShowMapper(false);
                  }
                }}
                onEditTemplate={(templateId) => {
                  loadTemplate(templateId as any);
                  setShowMapper(false);
                  toast.info(`Loaded ${templateId} template for editing`);
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Review Queue Dialog */}
      {showReviewQueue && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 md:inset-10 bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Check className="w-5 h-5" />
                Content Review Queue
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowReviewQueue(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <ContentReviewQueue 
                items={reviewItems}
                onItemsChange={setReviewItems}
                canApprove={true}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Add Chapter Dialog */}
      <AddChapterDialog
        open={showAddChapterDialog}
        onOpenChange={setShowAddChapterDialog}
        onAddChapter={addChapter}
        existingChapters={chapters}
        primaryLanguage={project.primaryLanguage}
      />
    </div>
  );
};

export default UnifiedCompositionStudio;
