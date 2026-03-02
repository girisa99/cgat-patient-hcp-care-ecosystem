/**
 * CreateTemplateDialog — 4-Step Wizard aligned with CREATE flow
 *
 * Steps: Describe & Enhance → Category & Style → Platforms & Regions → Review & Create
 *
 * Uses the same categories (SEED_CATEGORIES), styles (unified-style-registry),
 * platforms (TARGET_PLATFORMS), and prompt enhancement (PromptEnhancer) as the
 * CREATE flow pipeline to ensure consistency.
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
  Globe2, Loader2, Check, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { SEED_CATEGORIES } from '@/config/cast-content-seeds';
import { ALL_STYLES } from '@/config/unified-style-registry';
import { partitionStylesByMatch } from '@/config/style-category-format-map';
import { TARGET_PLATFORMS, getPlatformsByCategory, getPlatformCategories } from '@/config/target-platforms-registry';
import {
  MASTER_REGION_GROUPS,
  getLanguagesForRegions,
  buildRegionDropdownOptions,
  toggleParentRegion,
} from '@/config/regionConfig';
import { PromptEnhancer } from './PromptEnhancer';
import { PortalDropdown } from './create-wizard/PortalDropdown';
import { WizardProgress, WIZARD_STEPS } from './create-wizard/WizardProgress';

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

/** Per-category enrichment prompt tags — same as CreateConfigureStep */
const ENRICHMENT_TAG_MAP: Record<string, string[]> = {
  healthcare: ['Patient Education', 'HCP Training', 'Clinical Evidence', 'Drug MOA', 'Compliance', 'Patient Journey'],
  education: ['Curriculum Aligned', 'Student Engagement', 'Assessment Ready', 'E-Learning', 'Micro-Learning', 'Interactive'],
  technology: ['Product Demo', 'Developer Docs', 'Architecture Overview', 'Release Notes', 'API Walkthrough', 'Tech Deep-Dive'],
  finance: ['ROI Focus', 'Compliance Safe', 'Market Analysis', 'Investor Ready', 'Risk Awareness', 'Regulatory Update'],
  retail: ['Brand Story', 'Product Showcase', 'Customer Testimonial', 'Flash Sale', 'Seasonal Campaign', 'Competitive Edge'],
  entertainment: ['Trailer Style', 'Behind the Scenes', 'Fan Engagement', 'Premiere Event', 'Artist Spotlight', 'Cultural Impact'],
  government: ['Public Service', 'Policy Explainer', 'Civic Engagement', 'Transparency Report', 'Town Hall', 'Accessibility'],
  manufacturing: ['Safety Training', 'Process Optimization', 'Quality Control', 'ESG Reporting', 'Operational Update', 'Supply Chain'],
  travel: ['Destination Showcase', 'Cultural Guide', 'Hotel Tour', 'Travel Vlog', 'Itinerary Builder', 'Local Experience'],
  celebrations: ['Cultural Ceremony', 'Family Story', 'Regional Traditions', 'Invitation Style', 'Blessing & Prayer', 'Life Milestone'],
  corporate: ['Brand Story', 'Internal Comms', 'Investor Update', 'ESG Report', 'Culture Video', 'Leadership Message'],
  _default: ['Brand Story', 'Product Demo', 'ROI Focus', 'Thought Leadership', 'Competitive Edge', 'Customer Testimonial'],
};

// Category options from SEED_CATEGORIES (the same source as the CREATE flow)
const CATEGORY_OPTIONS = SEED_CATEGORIES
  .filter(c => c.is_active)
  .sort((a, b) => a.sort_order - b.sort_order)
  .map(c => ({
    value: c.name,
    label: c.label,
    icon: '',
    description: c.description,
  }));

// Platform options from TARGET_PLATFORMS registry (same as CREATE flow)
const PLATFORM_OPTIONS = TARGET_PLATFORMS.map(p => ({
  value: p.id,
  label: p.label,
  icon: '',
  description: `${p.category} · ${p.aspectRatios.join(', ')}`,
}));

// Build visual style options from unified registry (same source as CREATE flow)
const CAST_STYLES = ALL_STYLES
  .filter(s => s.castCompatible)
  .map(s => ({
    id: s.id,
    value: s.id,
    label: s.title,
    icon: s.icon,
    description: s.description,
    category: s.category,
  }));

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
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    videoStyles: [] as string[],
    regions: ['NAM', 'NAM_US', 'NAM_CA'] as string[],
    languages: ['en'] as string[],
    platforms: ['youtube'] as string[],
    enrichmentPrompt: '',
  });

  // Partition styles into recommended/compatible/other based on selected category
  const partitionedStyles = useMemo(() => {
    if (!formData.category) return { recommended: CAST_STYLES, compatible: [], other: [] };
    // partitionStylesByMatch expects (styles[], categoryName, formatName)
    const partition = partitionStylesByMatch(CAST_STYLES, formData.category, null);
    return partition;
  }, [formData.category]);

  // Style options for dropdown — recommended first, then compatible, then other
  const styleOptions = useMemo(() => {
    const all = [
      ...partitionedStyles.recommended.map(s => ({ ...s, label: `${s.label}` })),
      ...partitionedStyles.compatible,
      ...partitionedStyles.other,
    ];
    // Remove duplicates
    const seen = new Set<string>();
    return all.filter(s => {
      if (seen.has(s.value)) return false;
      seen.add(s.value);
      return true;
    });
  }, [partitionedStyles]);

  // Enrichment tags for the selected category
  const enrichmentTags = useMemo(() => {
    return ENRICHMENT_TAG_MAP[formData.category] || ENRICHMENT_TAG_MAP._default;
  }, [formData.category]);

  // Region options
  const regionOptions = buildRegionDropdownOptions();
  const availableLanguages = getLanguagesForRegions(formData.regions);

  // Keep languages in sync with regions
  useEffect(() => {
    const validLangCodes = availableLanguages.map(l => l.value);
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => validLangCodes.includes(l)).length > 0
        ? prev.languages.filter(l => validLangCodes.includes(l))
        : validLangCodes.slice(0, 1) as string[],
    }));
  }, [formData.regions.join(',')]);

  // Pre-fill from CREATE context when dialog opens
  useEffect(() => {
    if (open && initialContext) {
      const updates: Partial<typeof formData> = {};

      // Map category from context
      if (initialContext.categoryName) {
        const matchedCat = SEED_CATEGORIES.find(
          c => c.name === initialContext.categoryName || c.label.toLowerCase() === initialContext.categoryName?.toLowerCase()
        );
        if (matchedCat) updates.category = matchedCat.name;
      } else if (initialContext.product) {
        const matchedCat = SEED_CATEGORIES.find(
          c => c.name === initialContext.product || c.label.toLowerCase() === initialContext.product?.toLowerCase()
        );
        if (matchedCat) updates.category = matchedCat.name;
      }

      // Pre-fill styles from CREATE flow
      if (initialContext.visualStyleIds?.length) {
        updates.videoStyles = initialContext.visualStyleIds;
      }

      // Pre-fill platforms from CREATE flow
      if (initialContext.platformIds?.length) {
        updates.platforms = initialContext.platformIds;
      }

      // Pre-fill enrichment prompt
      if (initialContext.enrichmentPrompt) {
        updates.enrichmentPrompt = initialContext.enrichmentPrompt;
      }

      // Build name/description from context
      if (initialContext.goal) {
        updates.name = `${(initialContext.goal as string).split(' — ')[0]} Template`;
        updates.description = initialContext.goal;
      }

      // Auto-generate enrichment prompt from context parts
      if (!updates.enrichmentPrompt) {
        const parts: string[] = [];
        if (initialContext.categoryName) parts.push(`for the ${initialContext.categoryName} industry`);
        if (initialContext.formatName) parts.push(`as a ${initialContext.formatName}`);
        if (initialContext.audience) parts.push(`targeting ${initialContext.audience.replace(/_/g, ' ')}`);
        if (initialContext.platform) parts.push(`optimized for ${initialContext.platform}`);
        if (initialContext.goal) parts.push(`focused on: ${initialContext.goal}`);
        if (parts.length > 0) {
          updates.enrichmentPrompt = `Create a video template ${parts.join(', ')}`;
        }
      }

      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined && v !== '')),
      }));
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
        description: formData.description || formData.enrichmentPrompt,
        category: formData.category || 'retail',
        estimated_duration_seconds: 60,
        target_platform: formData.platforms,
        industry_tags: [formData.category, ...formData.videoStyles.slice(0, 3)],
        default_settings: {
          videoStyles: formData.videoStyles,
          platforms: formData.platforms,
          languages: formData.languages,
          regions: formData.regions,
          enrichmentPrompt: formData.enrichmentPrompt,
        },
        style_preset: { style: formData.videoStyles[0] || 'motion_graphics' },
        style_intent: formData.videoStyles[0] || 'motion_graphics',
        target_regions: formData.regions,
        tone_modifier: formData.category,
        aesthetic_keywords: formData.videoStyles.slice(0, 5),
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
        name: '', description: '', category: '', videoStyles: [],
        regions: ['NAM', 'NAM_US', 'NAM_CA'], languages: ['en'],
        platforms: ['youtube'], enrichmentPrompt: '',
      });
    } catch (err: any) {
      toast({ title: 'Failed to create template', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const isExternallyControlled = externalOpen !== undefined;

  // Step validation
  const canProceed = useCallback((step: number): boolean => {
    switch (step) {
      case 0: return formData.enrichmentPrompt.trim().length > 0 || formData.name.trim().length > 0;
      case 1: return formData.category.length > 0;
      case 2: return formData.platforms.length > 0 && formData.regions.length > 0;
      default: return true;
    }
  }, [formData]);

  // Resolve category label
  const selectedCategoryLabel = SEED_CATEGORIES.find(c => c.name === formData.category)?.label || formData.category;

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

        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 220px)' }}>
          {/* ═══ STEP 0: DESCRIBE & ENHANCE ═══ */}
          {currentStep === 0 && (
            <div className="space-y-4 mt-2">
              {/* Context banner if pre-filled from CREATE flow */}
              {initialContext?.categoryName && (
                <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Pre-filled from your CREATE flow:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {initialContext.categoryName && <Badge variant="secondary" className="text-xs">{initialContext.categoryName}</Badge>}
                      {initialContext.formatName && <Badge variant="outline" className="text-xs">{initialContext.formatName}</Badge>}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="E.g., Healthcare Product Launch, Travel Destination Reel..."
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this template for..."
                  className="min-h-[50px]"
                />
              </div>

              {/* Enrichment Prompt with enhancement */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Creative Brief / Enrichment Prompt
                </Label>
                <p className="text-xs text-muted-foreground">
                  Describe your vision — the prompt enhancer will refine it with regional and style context.
                </p>

                {/* Quick tags for the selected category */}
                {enrichmentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {enrichmentTags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            enrichmentPrompt: prev.enrichmentPrompt
                              ? `${prev.enrichmentPrompt}. Focus on ${tag}.`
                              : `Create a video focused on ${tag}.`,
                          }));
                        }}
                      >
                        + {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Textarea for enrichment prompt */}
                <Textarea
                  value={formData.enrichmentPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, enrichmentPrompt: e.target.value }))}
                  placeholder="E.g., Create a 90-second explainer video about our new cardiac monitoring device for cardiologists in the MENA region..."
                  className="min-h-[100px]"
                />

                {/* PromptEnhancer — shows quality score + "Enhance" button once prompt is long enough */}
                <PromptEnhancer
                  rawPrompt={formData.enrichmentPrompt}
                  onAccept={(enhanced) => setFormData(prev => ({ ...prev, enrichmentPrompt: enhanced }))}
                  region={formData.regions[0]}
                  format={initialContext?.formatName}
                  visualStyle={formData.videoStyles[0]}
                  intent={formData.category}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* ═══ STEP 1: CATEGORY & STYLES ═══ */}
          {currentStep === 1 && (
            <div className="space-y-4 mt-2">
              {/* Category from SEED_CATEGORIES */}
              <PortalDropdown
                label="Content Category *"
                options={CATEGORY_OPTIONS}
                selected={formData.category ? [formData.category] : []}
                onToggle={(v) => setFormData(prev => ({ ...prev, category: v }))}
                multi={false}
                placeholder="Select a category (same as CREATE flow)"
                maxHeight={360}
              />

              {/* Visual Styles — partitioned by category match */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Visual Styles
                </Label>
                {formData.category && partitionedStyles.recommended.length > 0 && (
                  <div className="p-2 border rounded-lg bg-primary/5 border-primary/20 space-y-1.5">
                    <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Recommended for {selectedCategoryLabel}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {partitionedStyles.recommended.slice(0, 8).map(s => {
                        const isSelected = formData.videoStyles.includes(s.value);
                        return (
                          <Badge
                            key={s.value}
                            variant={isSelected ? 'default' : 'outline'}
                            className={cn(
                              "text-xs cursor-pointer transition-colors",
                              isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
                            )}
                            onClick={() => toggleArrayItem('videoStyles', s.value)}
                          >
                            {s.icon} {s.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                <PortalDropdown
                  label={`All Styles (${CAST_STYLES.length} available)`}
                  options={styleOptions}
                  selected={formData.videoStyles}
                  onToggle={(v) => toggleArrayItem('videoStyles', v)}
                  multi={true}
                  placeholder="Search and select styles"
                  maxHeight={320}
                />
                {formData.videoStyles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.videoStyles.map(sv => {
                      const style = CAST_STYLES.find(s => s.value === sv);
                      return style ? (
                        <Badge key={sv} variant="secondary" className="text-xs gap-1">
                          {style.icon} {style.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 2: PLATFORMS & REGIONS ═══ */}
          {currentStep === 2 && (
            <div className="space-y-4 mt-2">
              {/* Platforms from TARGET_PLATFORMS registry */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" />
                  Target Platforms
                </Label>
                {/* Quick picks by category */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {getPlatformCategories().map(cat => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-primary/10 capitalize"
                      onClick={() => {
                        const platIds = getPlatformsByCategory(cat).map(p => p.id);
                        setFormData(prev => {
                          const merged = new Set([...prev.platforms, ...platIds]);
                          return { ...prev, platforms: [...merged] };
                        });
                      }}
                    >
                      + All {cat}
                    </Badge>
                  ))}
                </div>
                <PortalDropdown
                  label="Platforms"
                  options={PLATFORM_OPTIONS}
                  selected={formData.platforms}
                  onToggle={(v) => toggleArrayItem('platforms', v)}
                  multi={true}
                  placeholder="Select target platforms"
                  maxHeight={320}
                />
              </div>

              {/* Regions */}
              <PortalDropdown
                label="Target Regions"
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
                maxHeight={320}
              />

              {/* Languages */}
              {availableLanguages.length > 0 && (
                <PortalDropdown
                  label={`Languages (${availableLanguages.length} available)`}
                  options={availableLanguages}
                  selected={formData.languages}
                  onToggle={(v) => toggleArrayItem('languages', v)}
                  multi={true}
                  placeholder="Select languages"
                  maxHeight={280}
                />
              )}
            </div>
          )}

          {/* ═══ STEP 3: REVIEW ═══ */}
          {currentStep === 3 && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{formData.name || '—'}</p>
                </div>
                <div className="p-3 border rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{selectedCategoryLabel || '—'}</p>
                </div>
              </div>

              {/* Enrichment prompt */}
              {formData.enrichmentPrompt && (
                <div className="p-3 border rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Creative Brief</p>
                  <p className="text-sm">{formData.enrichmentPrompt}</p>
                </div>
              )}

              {/* Styles */}
              <div className="p-3 border rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground">Visual Styles ({formData.videoStyles.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.videoStyles.map(sv => {
                    const style = CAST_STYLES.find(s => s.value === sv);
                    return <Badge key={sv} variant="secondary" className="text-xs">{style?.icon} {style?.label || sv}</Badge>;
                  })}
                  {formData.videoStyles.length === 0 && <span className="text-xs text-muted-foreground">None selected</span>}
                </div>
              </div>

              {/* Platforms + Regions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground">Platforms ({formData.platforms.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.platforms.slice(0, 4).map(pv => {
                      const plat = TARGET_PLATFORMS.find(p => p.id === pv);
                      return <Badge key={pv} variant="secondary" className="text-[10px]">{plat?.label || pv}</Badge>;
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

              {/* Edit name if missing */}
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
            {currentStep < WIZARD_STEPS.length - 1 && (
              <Button onClick={goNext} disabled={!canProceed(currentStep)} className="gap-1" size="sm">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {currentStep === WIZARD_STEPS.length - 1 && (
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
