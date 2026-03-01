/**
 * CreateTemplateDialog — 7-Step Progressive Wizard
 * 
 * Steps: Describe → Category → Styles → Capabilities → Platforms → Regions → Review
 * Uses DB-driven hooks (useCastRegistry) with live token estimation.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  Plus, ArrowLeft, ArrowRight, Wand2, Layers, Sparkles,
  Globe2, Loader2, Check, Languages, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';
import {
  AI_PROVIDERS_REGISTRY,
  getDefaultZoneProviders,
  type AIProviderCategory,
} from '@/config/aiProvidersConfig';
import {
  MASTER_REGION_GROUPS,
  getLanguagesForRegions,
  buildRegionDropdownOptions,
  toggleParentRegion,
} from '@/config/regionConfig';
import {
  useCastStyles,
  useCastCapabilities,
  useCastStyleCapabilityMap,
  useCastStylePlatforms,
  deriveCapabilities,
  derivePlatforms,
  estimateTokens,
} from '@/hooks/useCastRegistry';
import { PortalDropdown } from './create-wizard/PortalDropdown';
import { WizardProgress, WIZARD_STEPS } from './create-wizard/WizardProgress';
import { WizardTokenBadge } from './create-wizard/WizardTokenBadge';

// ============================================
// CONFIG
// ============================================

export interface CreateTemplateInitialContext {
  product?: string;
  audience?: string;
  platform?: string;
  goal?: string;
  /** Full CREATE context passthrough */
  categoryName?: string;
  formatName?: string;
  visualStyleIds?: string[];
  capabilityIds?: string[];
  platformIds?: string[];
  enrichmentPrompt?: string;
  regionCode?: string;
}

interface CreateTemplateDialogProps {
  onCreated?: () => void;
  templateToClone?: VideoBlueprint | null;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
  initialContext?: CreateTemplateInitialContext | null;
}

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

const PLATFORM_OPTIONS = [
  { value: 'tiktok', label: 'TikTok (9:16)', icon: '📱' },
  { value: 'instagram_reels', label: 'Instagram Reels (9:16)', icon: '📱' },
  { value: 'instagram_feed', label: 'Instagram Feed (1:1)', icon: '📷' },
  { value: 'instagram_stories', label: 'Instagram Stories (9:16)', icon: '📸' },
  { value: 'youtube', label: 'YouTube (16:9)', icon: '▶️' },
  { value: 'youtube_shorts', label: 'YouTube Shorts (9:16)', icon: '⚡' },
  { value: 'facebook', label: 'Facebook (16:9)', icon: '👍' },
  { value: 'linkedin', label: 'LinkedIn (16:9)', icon: '💼' },
  { value: 'x_twitter', label: 'X/Twitter (16:9)', icon: '🐦' },
  { value: 'snapchat', label: 'Snapchat (9:16)', icon: '👻' },
  { value: 'landing_page', label: 'Landing Page', icon: '🌐' },
  { value: 'blog_post', label: 'Blog Post', icon: '📝' },
  { value: 'email_campaign', label: 'Email Campaign', icon: '📧' },
  { value: 'newsletter', label: 'Newsletter', icon: '📰' },
  { value: 'presentation', label: 'Presentation/PPT', icon: '📊' },
  { value: 'webinar', label: 'Webinar', icon: '🎥' },
  { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
  { value: 'meta_ads', label: 'Meta Ads', icon: '📢' },
  { value: 'display_ads', label: 'Display Ads (Banner)', icon: '🖼️' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'tv_broadcast', label: 'TV/Broadcast (16:9)', icon: '📺' },
];

const DEFAULT_ZONE_PROVIDERS = getDefaultZoneProviders();

const PROVIDER_CATEGORIES: Record<AIProviderCategory, string> = {
  video: '🎬 Video Generation',
  tts: '🔊 Text-to-Speech',
  llm: '🧠 Language Models',
  image: '🖼️ Image Generation',
  '3d': '🧊 3D/VR/AR',
  avatar: '👤 Avatar/Talking Head',
  audio: '🎵 Audio/Music',
};

// ============================================
// MAIN COMPONENT
// ============================================

export function CreateTemplateDialog({ onCreated, templateToClone, externalOpen, onExternalOpenChange, initialContext }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onExternalOpenChange) onExternalOpenChange(value);
    setInternalOpen(value);
  };

  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'marketing',
    videoStyles: [] as string[],
    capabilities: [] as string[],
    regions: ['NAM', 'NAM_US', 'NAM_CA'] as string[],
    languages: ['en'] as string[],
    providers: [...DEFAULT_ZONE_PROVIDERS],
    platforms: [] as string[],
    aiPrompt: '',
  });

  // ═══ DB-DRIVEN HOOKS ═══
  const { data: dbStyles = [] } = useCastStyles();
  const { data: dbCapabilities = [] } = useCastCapabilities();
  const { data: styleCapMap = [] } = useCastStyleCapabilityMap(formData.videoStyles);
  const { data: stylePlatformMap = [] } = useCastStylePlatforms(formData.videoStyles);

  // Convert DB styles to dropdown options
  const styleOptions = useMemo(() =>
    dbStyles.map(s => ({ value: s.value, label: s.label, icon: s.icon, description: s.description || undefined })),
    [dbStyles]
  );

  // Convert DB capabilities to dropdown options
  const capabilityOptions = useMemo(() =>
    dbCapabilities.map(c => ({ value: c.value, label: c.label, icon: c.icon, description: c.description || undefined })),
    [dbCapabilities]
  );

  // Auto-derive capabilities when styles change
  const derivedCaps = useMemo(() => {
    if (formData.videoStyles.length === 0 || styleCapMap.length === 0) return null;
    return deriveCapabilities(formData.videoStyles, styleCapMap);
  }, [formData.videoStyles, styleCapMap]);

  // Auto-derive platforms when styles change
  const derivedPlatforms = useMemo(() => {
    if (formData.videoStyles.length === 0 || stylePlatformMap.length === 0) return null;
    return derivePlatforms(formData.videoStyles, stylePlatformMap);
  }, [formData.videoStyles, stylePlatformMap]);

  // Auto-apply derived capabilities
  useEffect(() => {
    if (derivedCaps && derivedCaps.required.length > 0) {
      setFormData(prev => {
        const merged = new Set([...prev.capabilities, ...derivedCaps.required]);
        return { ...prev, capabilities: [...merged] };
      });
    }
  }, [derivedCaps?.required.join(',')]);

  // Auto-apply derived platforms
  useEffect(() => {
    if (derivedPlatforms && derivedPlatforms.recommended.length > 0 && formData.platforms.length === 0) {
      setFormData(prev => ({
        ...prev,
        platforms: derivedPlatforms.recommended,
      }));
    }
  }, [derivedPlatforms?.recommended.join(',')]);

  // Token estimation
  const tokenEstimate = useMemo(() => {
    if (formData.videoStyles.length === 0 || formData.capabilities.length === 0) return null;
    return estimateTokens(
      formData.videoStyles,
      formData.capabilities,
      dbCapabilities,
      styleCapMap,
      formData.platforms.length,
      formData.regions.length,
    );
  }, [formData.videoStyles, formData.capabilities, formData.platforms.length, formData.regions.length, dbCapabilities, styleCapMap]);

  // Regions & languages
  const regionOptions = buildRegionDropdownOptions();
  const availableLanguages = getLanguagesForRegions(formData.regions);

  useEffect(() => {
    const validLangCodes = availableLanguages.map(l => l.value);
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => validLangCodes.includes(l)).length > 0
        ? prev.languages.filter(l => validLangCodes.includes(l))
        : validLangCodes.slice(0, 1) as string[],
    }));
  }, [formData.regions.join(',')]);

  // Pre-fill from context (supports both intent-based and full CREATE context passthrough)
  useEffect(() => {
    if (open && initialContext) {
      const productToCategoryMap: Record<string, string> = {
        saas: 'technology', healthcare: 'healthcare', education: 'educational',
        ecommerce: 'retail', finance: 'finance', travel: 'travel',
        food: 'hospitality', corporate: 'corporate', entertainment: 'entertainment',
        smb: 'smb', marketing: 'marketing',
      };
      const category = productToCategoryMap[initialContext.product || ''] || formData.category;
      const promptParts = [
        initialContext.product && `for ${initialContext.product} industry`,
        initialContext.categoryName && `in ${initialContext.categoryName}`,
        initialContext.formatName && `as ${initialContext.formatName}`,
        initialContext.audience && `targeting ${initialContext.audience.replace(/_/g, ' ')}`,
        initialContext.platform && `optimized for ${initialContext.platform}`,
        initialContext.goal && `focused on: ${initialContext.goal}`,
      ].filter(Boolean);
      const aiPrompt = initialContext.enrichmentPrompt
        || (promptParts.length > 0 ? `Create a video template ${promptParts.join(', ')}` : '');
      const updates: Partial<typeof formData> = {
        category,
        aiPrompt,
        name: initialContext.goal ? `${(initialContext.goal as string).split(' — ')[0]} Template` : undefined,
        description: initialContext.goal ? `Custom template ${promptParts.join(', ')}` : undefined,
      };
      // Full CREATE context passthrough — pre-fill styles, capabilities, platforms
      if (initialContext.visualStyleIds?.length) updates.videoStyles = initialContext.visualStyleIds;
      if (initialContext.capabilityIds?.length) updates.capabilities = initialContext.capabilityIds;
      if (initialContext.platformIds?.length) updates.platforms = initialContext.platformIds;
      if (initialContext.enrichmentPrompt) {
        updates.aiPrompt = initialContext.enrichmentPrompt;
        if (!initialContext.goal) updates.description = initialContext.enrichmentPrompt;
      }
      setFormData(prev => ({ ...prev, ...Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined)) }));
      setCurrentStep(0);
    }
  }, [open, initialContext]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [open]);

  // Helpers
  const toggleArrayItem = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(item)
        ? (prev[key] as string[]).filter(i => i !== item)
        : [...(prev[key] as string[]), item]
    }));
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const goNext = () => {
    markStepComplete(currentStep);
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  };

  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // AI Generation
  const generateWithAI = async () => {
    if (!formData.aiPrompt.trim()) {
      toast({ title: 'Please describe what template you want', variant: 'destructive' });
      return;
    }
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-ai', {
        body: {
          prompt: formData.aiPrompt,
          region: formData.regions[0] || 'western',
          context: {
            selectedCapabilities: formData.capabilities,
            selectedVideoStyles: formData.videoStyles,
            selectedPlatforms: formData.platforms,
            selectedRegions: formData.regions,
            selectedLanguages: formData.languages,
            category: formData.category,
          },
          seed: Date.now(),
        }
      });
      if (error) throw error;
      if (data?.template) {
        const t = data.template;
        const regionCodeMap: Record<string, string[]> = {
          western: ['NAM', 'NAM_US', 'NAM_CA'], europe: ['EUR', 'EUR_WEST', 'EUR_NORTH'],
          cjk: ['CJK', 'CJK_JP', 'CJK_KR', 'CJK_CN'], india: ['INDIA', 'INDIA_NORTH', 'INDIA_SOUTH'],
          mena: ['MENA', 'MENA_GCC', 'MENA_LEVANT'], africa: ['AFRICA', 'AFRICA_WEST', 'AFRICA_EAST'],
          latam: ['LATAM', 'LATAM_BR', 'LATAM_MX'], sea: ['SEA', 'SEA_ID', 'SEA_PH'],
          global: ['NAM', 'NAM_US', 'EUR', 'INDIA', 'MENA', 'CJK'],
          caribbean: ['CARIBBEAN'], pakistan: ['PAKISTAN'], oceania: ['OCEANIA'],
          central_asia: ['CENTRAL_ASIA'], russia: ['EASTERN_EUR'],
        };
        const mappedRegions = (t.regions || []).flatMap((r: string) =>
          regionCodeMap[r] || (MASTER_REGION_GROUPS.some(g => g.parent === r || g.regions.some(sr => sr.code === r)) ? [r] : [])
        );
        setFormData(prev => ({
          ...prev,
          name: t.name || prev.name,
          description: t.description || prev.description,
          category: t.category || prev.category,
          videoStyles: Array.isArray(t.videoStyles) && t.videoStyles.length > 0
            ? t.videoStyles : (t.videoStyle ? [t.videoStyle] : prev.videoStyles),
          capabilities: Array.isArray(t.capabilities) && t.capabilities.length > 0 ? t.capabilities : prev.capabilities,
          regions: mappedRegions.length > 0 ? [...new Set(mappedRegions)] as string[] : prev.regions,
          platforms: Array.isArray(t.platforms) && t.platforms.length > 0 ? t.platforms : prev.platforms,
          languages: Array.isArray(t.languages) && t.languages.length > 0 ? t.languages : prev.languages,
        }));
      }
      // Jump to review (step 6)
      setCompletedSteps(new Set([0, 1, 2, 3, 4, 5]));
      setCurrentStep(6);
      toast({ title: '✨ AI configured your template', description: 'Review and adjust the settings below.' });
    } catch (err: any) {
      setCompletedSteps(new Set([0]));
      setCurrentStep(1);
      toast({ title: 'AI generation failed — configure manually', description: err.message, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
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

      // Thumbnail generation
      let thumbnailUrl: string | null = null;
      try {
        const prompt = `Professional video template thumbnail for "${formData.name}". Category: ${formData.category}. Style: ${formData.videoStyles.join(', ')}. Modern, vibrant, cinematic quality. 16:9 aspect ratio. No text.`;
        const { data, error } = await supabase.functions.invoke('ai-image-generator', {
          body: { prompt, size: '1024x576', quality: 'high', style_intent: formData.videoStyles[0] || 'cinematic' }
        });
        if (!error && data?.imageUrl) thumbnailUrl = data.imageUrl;
      } catch { /* thumbnail optional */ }

      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        estimated_duration_seconds: 60,
        target_platform: formData.platforms,
        industry_tags: [formData.category, ...formData.videoStyles],
        default_settings: {
          videoStyles: formData.videoStyles,
          providers: formData.providers,
          platforms: formData.platforms,
          languages: formData.languages,
          regions: formData.regions,
          capabilities: formData.capabilities,
          tokenEstimate: tokenEstimate?.totalTokens || null,
        },
        style_preset: { style: formData.videoStyles[0] || 'motion_graphics', capabilities: formData.capabilities },
        style_intent: formData.videoStyles[0] || 'motion_graphics',
        target_regions: formData.regions,
        tone_modifier: formData.category,
        aesthetic_keywords: [...formData.videoStyles, ...formData.capabilities],
        is_system_default: false,
        created_by: user?.user?.id || null,
        is_active: true,
        is_public: true,
        usage_count: 0,
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
      };
      const { error } = await supabase.from('video_blueprints').insert(templateData);
      if (error) throw error;
      toast({ title: 'Template created!', description: formData.name });
      setOpen(false);
      onCreated?.();
      setFormData({
        name: '', description: '', category: 'marketing', videoStyles: [],
        capabilities: [], regions: ['NAM', 'NAM_US', 'NAM_CA'], languages: ['en'],
        providers: [...DEFAULT_ZONE_PROVIDERS], platforms: [], aiPrompt: '',
      });
    } catch (err: any) {
      toast({ title: 'Failed to create template', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const isExternallyControlled = externalOpen !== undefined;

  // ═══ STEP VALIDATION ═══
  const canProceed = useCallback((step: number): boolean => {
    switch (step) {
      case 0: return formData.aiPrompt.trim().length > 0 || formData.name.trim().length > 0;
      case 1: return formData.name.trim().length > 0 && formData.category.length > 0;
      case 2: return formData.videoStyles.length > 0;
      case 3: return formData.capabilities.length > 0;
      case 4: return formData.platforms.length > 0;
      case 5: return formData.regions.length > 0 && formData.languages.length > 0;
      default: return true;
    }
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      {!isExternallyControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {templateToClone ? 'Clone' : 'Create Template'}
          </Button>
        </DialogTrigger>
      )}
      {open && <div className="fixed inset-0 bg-black/50 z-[99997]" onClick={() => setOpen(false)} />}
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-visible" style={{ zIndex: 99998 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Create Custom Template
          </DialogTitle>
          <DialogDescription className="text-xs">
            Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep]?.label}
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress */}
        <WizardProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
        />

        {/* Token Estimate (always visible after step 3) */}
        {currentStep >= 3 && tokenEstimate && (
          <WizardTokenBadge estimate={tokenEstimate} className="mx-1" />
        )}

        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 260px)' }}>
          {/* ═══ STEP 0: DESCRIBE ═══ */}
          {currentStep === 0 && (
            <div className="space-y-4 mt-2">
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
                  Describe your template — AI will auto-configure everything, or skip to manual
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
                    {aiGenerating ? 'AI Configuring...' : 'Generate & Configure All'}
                  </Button>
                  <Button variant="outline" onClick={goNext} disabled={aiGenerating}>
                    Configure Manually <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 1: CATEGORY & NAME ═══ */}
          {currentStep === 1 && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Template"
                  autoFocus
                />
              </div>
              <PortalDropdown
                label="Category *"
                options={TEMPLATE_CATEGORIES}
                selected={[formData.category]}
                onToggle={(v) => setFormData(prev => ({ ...prev, category: v }))}
                multi={false}
                placeholder="Select category"
              />
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

          {/* ═══ STEP 2: VIDEO STYLES (DB-driven) ═══ */}
          {currentStep === 2 && (
            <div className="space-y-4 mt-2">
              <div className="p-3 border rounded-lg bg-muted/30 flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                Select styles to auto-derive AI capabilities, platforms, and token costs from the registry
              </div>
              {dbStyles.length > 0 ? (
                <PortalDropdown
                  label={`Video Styles (${dbStyles.length} available from registry)`}
                  options={styleOptions}
                  selected={formData.videoStyles}
                  onToggle={(v) => toggleArrayItem('videoStyles', v)}
                  multi={true}
                  placeholder="Select one or more styles"
                  maxHeight={360}
                />
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading styles from registry...
                </div>
              )}
              {/* Selected styles summary */}
              {formData.videoStyles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.videoStyles.map(sv => {
                    const style = dbStyles.find(s => s.value === sv);
                    return style ? (
                      <Badge key={sv} variant="secondary" className="text-xs gap-1">
                        {style.icon} {style.label}
                        <span className="text-muted-foreground/60 ml-1">{style.base_token_cost}t</span>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 3: AI CAPABILITIES (auto-derived) ═══ */}
          {currentStep === 3 && (
            <div className="space-y-4 mt-2">
              {derivedCaps && derivedCaps.required.length > 0 && (
                <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 space-y-2">
                  <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Auto-derived from selected styles
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {derivedCaps.required.map(cv => {
                      const cap = dbCapabilities.find(c => c.value === cv);
                      return cap ? (
                        <Badge key={cv} className="text-xs gap-1 bg-primary/10 text-primary border-primary/30">
                          {cap.icon} {cap.label} <span className="text-primary/60">required</span>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  {derivedCaps.optional.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {derivedCaps.optional.map(cv => {
                        const cap = dbCapabilities.find(c => c.value === cv);
                        return cap ? (
                          <Badge key={cv} variant="outline" className="text-xs gap-1">
                            {cap.icon} {cap.label} <span className="text-muted-foreground/60">optional</span>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
              <PortalDropdown
                label="AI Capabilities"
                icon={<Sparkles className="h-4 w-4" />}
                options={capabilityOptions}
                selected={formData.capabilities}
                onToggle={(v) => toggleArrayItem('capabilities', v)}
                multi={true}
                placeholder="Add or remove capabilities"
              />
            </div>
          )}

          {/* ═══ STEP 4: PLATFORMS (auto-derived) ═══ */}
          {currentStep === 4 && (
            <div className="space-y-4 mt-2">
              {derivedPlatforms && derivedPlatforms.recommended.length > 0 && (
                <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 space-y-1">
                  <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5" /> Recommended for selected styles
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {derivedPlatforms.recommended.map(pid => {
                      const plat = PLATFORM_OPTIONS.find(p => p.value === pid);
                      return plat ? (
                        <Badge key={pid} className="text-xs bg-primary/10 text-primary border-primary/30">{plat.icon} {plat.label}</Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              <PortalDropdown
                label="Target Platforms"
                icon={<Globe2 className="h-4 w-4" />}
                options={PLATFORM_OPTIONS}
                selected={formData.platforms}
                onToggle={(v) => toggleArrayItem('platforms', v)}
                multi={true}
                placeholder="Select platforms"
              />
            </div>
          )}

          {/* ═══ STEP 5: REGIONS & LANGUAGES ═══ */}
          {currentStep === 5 && (
            <div className="space-y-4 mt-2">
              <PortalDropdown
                label="Target Regions & Sub-Regions"
                icon={<Globe2 className="h-4 w-4" />}
                options={regionOptions}
                selected={formData.regions}
                onToggle={(v) => {
                  const isParent = MASTER_REGION_GROUPS.some(g => g.parent === v);
                  if (isParent) {
                    setFormData(prev => ({ ...prev, regions: toggleParentRegion(v, prev.regions) }));
                  } else {
                    toggleArrayItem('regions', v);
                  }
                }}
                multi={true}
                placeholder="Select regions"
                maxHeight={360}
              />
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
                  <Wand2 className="h-4 w-4" /> AI Providers
                </Label>
                <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/30 rounded-md border flex items-center gap-2">
                  <span className="text-primary">🌍</span>
                  Zone suggests defaults (★) — toggle any provider on/off
                </div>
                <div className="space-y-3 max-h-[280px] overflow-y-auto border rounded-md p-2">
                  {(Object.keys(PROVIDER_CATEGORIES) as AIProviderCategory[]).map(cat => {
                    const catProviders = AI_PROVIDERS_REGISTRY.filter(p => p.category === cat);
                    if (catProviders.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground px-1">{PROVIDER_CATEGORIES[cat]}</p>
                        {catProviders.map(provider => {
                          const isSelected = formData.providers.includes(provider.value);
                          return (
                            <div
                              key={provider.value}
                              onClick={() => toggleArrayItem('providers', provider.value)}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors",
                                isSelected ? "bg-primary/10 text-primary" : "hover:bg-accent"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                                isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                              )}>
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className="shrink-0">{provider.icon}</span>
                              <span className="flex-1 truncate">{provider.label}</span>
                              {provider.isDefault && <span className="text-xs text-amber-500">★</span>}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 6: REVIEW ═══ */}
          {currentStep === 6 && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{formData.name || '—'}</p>
                </div>
                <div className="p-3 border rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{TEMPLATE_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category}</p>
                </div>
              </div>

              {/* Styles */}
              <div className="p-3 border rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground">Video Styles ({formData.videoStyles.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.videoStyles.map(sv => {
                    const style = dbStyles.find(s => s.value === sv);
                    return <Badge key={sv} variant="secondary" className="text-xs">{style?.icon} {style?.label || sv}</Badge>;
                  })}
                  {formData.videoStyles.length === 0 && <span className="text-xs text-muted-foreground">None selected</span>}
                </div>
              </div>

              {/* Capabilities */}
              <div className="p-3 border rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground">AI Capabilities ({formData.capabilities.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.capabilities.map(cv => {
                    const cap = dbCapabilities.find(c => c.value === cv);
                    return <Badge key={cv} variant="outline" className="text-xs">{cap?.icon} {cap?.label || cv}</Badge>;
                  })}
                </div>
              </div>

              {/* Platforms + Regions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">Platforms ({formData.platforms.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.platforms.slice(0, 4).map(pv => {
                      const plat = PLATFORM_OPTIONS.find(p => p.value === pv);
                      return <Badge key={pv} variant="secondary" className="text-[10px]">{plat?.icon} {plat?.label || pv}</Badge>;
                    })}
                    {formData.platforms.length > 4 && <Badge variant="outline" className="text-[10px]">+{formData.platforms.length - 4}</Badge>}
                  </div>
                </div>
                <div className="p-3 border rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">Regions ({formData.regions.length}) · Languages ({formData.languages.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.regions.slice(0, 3).map(r => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}
                    {formData.regions.length > 3 && <Badge variant="outline" className="text-[10px]">+{formData.regions.length - 3}</Badge>}
                  </div>
                </div>
              </div>

              {/* Token Estimate */}
              {tokenEstimate && <WizardTokenBadge estimate={tokenEstimate} />}

              {/* Edit name if needed */}
              {!formData.name.trim() && (
                <div className="space-y-2 p-3 border rounded-lg border-destructive/30 bg-destructive/5">
                  <Label className="text-destructive text-xs">Template name is required</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between gap-2 pt-4 border-t mt-auto">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 6 && currentStep > 0 && (
              <Button onClick={goNext} disabled={!canProceed(currentStep)} className="gap-1" size="sm">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {currentStep === 6 && (
              <Button onClick={createTemplate} disabled={creating || !formData.name.trim()} className="gap-2">
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
