/**
 * CREATE CONFIGURE STEP — Redesigned for Intuitive UX
 *
 * Steps 4-7 of the CREATE workflow:
 * - Step 4: Platform & Languages (primary platform, input language, script transcreation, dubbing/subtitle)
 * - Step 5: Visual & Asset Configuration (styles, resolution, characters, duration, capabilities, asset source, lip-sync, dubbing)
 * - Step 6: Universal Enrichment Prompt
 * - Step 7: Production & Safety Pipeline (info only)
 *
 * UX Improvements:
 * - Tooltips on every section explaining what it does
 * - Collapsible sections for progressive disclosure (not overwhelming)
 * - Preview popout button for real-time configuration preview
 * - Cleaner visual hierarchy with step numbers and completion indicators
 *
 * Extracted from GenieCastConsolidatedTabs.tsx for maintainability.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Globe,
  Palette,
  Settings2,
  Wand2,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Eye,
  ZoomIn,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CreateHeroBanner } from './CreateHeroBanner';
import { PreviewPopout } from './PreviewPopout';
import { PortalDropdown } from '../create-wizard/PortalDropdown';
import { StyleCustomizationPanel } from '../StyleCustomizationPanel';
import { REGION_HIERARCHY } from '@/config/regionHierarchy';
import { TARGET_PLATFORMS, getPlatformsByCategory, getPlatformCategories } from '@/config/target-platforms-registry';
import { partitionStylesByMatch } from '@/config/style-category-format-map';
import {
  IMAGINATION_PRESETS,
  getPresetCategories,
  recommendPresetsForRegion,
  type ImaginationPreset,
  type ImaginationCategory,
} from '@/services/production/creativeImaginationRegistry';
import type { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import type { useHolidayAwareness } from '@/hooks/useHolidayAwareness';

/**
 * Collapsible section wrapper with tooltip, step indicator, and completion state.
 * Progressive disclosure: only the section the user is actively working on is open.
 */
function ConfigSection({
  step,
  title,
  description,
  tooltip,
  icon,
  isComplete,
  defaultOpen = false,
  children,
}: {
  step: number;
  title: string;
  description: string;
  tooltip: string;
  icon: React.ReactNode;
  isComplete: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <TooltipProvider>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className={cn(
          "transition-all",
          isComplete && !open && "border-green-500/30 bg-green-500/[0.02]",
          open && "ring-1 ring-primary/20"
        )}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {/* Step number circle */}
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                    isComplete
                      ? "bg-green-500 text-white"
                      : "bg-primary/10 text-primary"
                  )}>
                    {isComplete ? <Check className="h-3 w-3" /> : step}
                  </div>
                  {icon}
                  <span>{title}</span>
                  {/* Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] text-xs">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isComplete && !open && (
                    <Badge variant="secondary" className="text-[9px] bg-green-500/10 text-green-600">
                      Done
                    </Badge>
                  )}
                  {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
              <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-4 pt-0">
                  {children}
                </CardContent>
              </motion.div>
            </AnimatePresence>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </TooltipProvider>
  );
}

interface CreateConfigureStepProps {
  // Session state (read)
  selectedCategoryId: string | null;
  selectedFormatId: string | null;
  selectedSubFormatId: string | null;
  primaryPlatform: string;
  targetPlatformIds: string[];
  selectedDialectCodes: string[];
  outputLanguages: string[];
  dubbingSubtitleLanguages: string[];
  selectedVisualStyleIds: string[];
  selectedCapabilityIds: string[];
  autoSelectedCapIds: string[];
  selectedCharacterIds: string[];
  characterFramePercent: number;
  targetDuration: number;
  selectedAssetSource: string;
  lipSyncEnabled: boolean;
  dubbingEnabled: boolean;
  selectedResolution: string;
  selectedAspectRatio: string;
  productionQuality: string;
  enrichmentPrompt: string;
  imaginationPreset: string | null;
  selectedRegion: string;

  // Multi-output presets
  selectedOutputPresets: string[];

  // Session setters
  setPrimaryPlatform: (v: string) => void;
  setTargetPlatformIds: (v: string[]) => void;
  setOutputLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  setDubbingSubtitleLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedVisualStyleIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCapabilityIds: React.Dispatch<React.SetStateAction<string[]>>;
  setAutoSelectedCapIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCharacterIds: React.Dispatch<React.SetStateAction<string[]>>;
  setCharacterFramePercent: (v: number) => void;
  setTargetDuration: (v: number) => void;
  setSelectedAssetSource: (v: string) => void;
  setLipSyncEnabled: (v: boolean) => void;
  setDubbingEnabled: (v: boolean) => void;
  setSelectedResolution: (v: string) => void;
  setSelectedAspectRatio: (v: string) => void;
  setProductionQuality: (v: string) => void;
  setEnrichmentPrompt: (v: string) => void;
  setImaginationPreset: (v: string | null) => void;
  setSelectedOutputPresets: (v: string[]) => void;

  // Content registry
  contentRegistry: ReturnType<typeof useCastContentRegistry>;

  // Holiday awareness (optional)
  holidayAwareness?: ReturnType<typeof useHolidayAwareness>;

  // Dialect change handler
  onDialectChange: (codes: string[]) => void;

  // Navigation
  onBackToIntent: () => void;
  onContinueToTemplates: () => void;

  // Region hierarchy selector renderer
  renderRegionHierarchySelector: (
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    variant: 'script' | 'dubbing'
  ) => React.ReactNode;
}

// ─── PLATFORM → RESOLUTION AUTO-DERIVATION ───────────────────────────────
// When user selects platforms, auto-set resolution + aspect ratio defaults
// unless user has manually overridden.

const PLATFORM_RESOLUTION_DEFAULTS: Record<string, { aspectRatio: string; resolution: string }> = {
  youtube:              { aspectRatio: '16:9', resolution: '1920x1080' },
  youtube_shorts:       { aspectRatio: '9:16', resolution: '1080x1920' },
  tiktok:               { aspectRatio: '9:16', resolution: '1080x1920' },
  instagram_reels:      { aspectRatio: '9:16', resolution: '1080x1920' },
  instagram_post:       { aspectRatio: '1:1',  resolution: '1080x1080' },
  linkedin:             { aspectRatio: '16:9', resolution: '1920x1080' },
  facebook:             { aspectRatio: '16:9', resolution: '1920x1080' },
  twitter:              { aspectRatio: '16:9', resolution: '1280x720' },
  whatsapp_status:      { aspectRatio: '9:16', resolution: '1080x1920' },
  sms_mms:              { aspectRatio: '1:1',  resolution: '720x720' },
  landing_page:         { aspectRatio: '16:9', resolution: '1920x1080' },
  website_embed:        { aspectRatio: '16:9', resolution: '1920x1080' },
  webinar:              { aspectRatio: '16:9', resolution: '1920x1080' },
  digital_signage:      { aspectRatio: '16:9', resolution: '3840x2160' },
  ott_ctv:              { aspectRatio: '16:9', resolution: '3840x2160' },
  presentation_slides:  { aspectRatio: '16:9', resolution: '1920x1080' },
};

export function CreateConfigureStep({
  selectedCategoryId,
  selectedFormatId,
  selectedSubFormatId,
  primaryPlatform,
  targetPlatformIds,
  selectedDialectCodes,
  outputLanguages,
  dubbingSubtitleLanguages,
  selectedVisualStyleIds,
  selectedCapabilityIds,
  autoSelectedCapIds,
  selectedCharacterIds,
  characterFramePercent,
  targetDuration,
  selectedAssetSource,
  lipSyncEnabled,
  dubbingEnabled,
  selectedResolution,
  selectedAspectRatio,
  productionQuality,
  enrichmentPrompt,
  imaginationPreset,
  selectedRegion,
  setPrimaryPlatform,
  setTargetPlatformIds,
  setOutputLanguages,
  setDubbingSubtitleLanguages,
  setSelectedVisualStyleIds,
  setSelectedCapabilityIds,
  setAutoSelectedCapIds,
  setSelectedCharacterIds,
  setCharacterFramePercent,
  setTargetDuration,
  setSelectedAssetSource,
  setLipSyncEnabled,
  setDubbingEnabled,
  setSelectedResolution,
  setSelectedAspectRatio,
  setProductionQuality,
  setEnrichmentPrompt,
  setImaginationPreset,
  setSelectedOutputPresets,
  selectedOutputPresets,
  contentRegistry,
  holidayAwareness,
  onDialectChange,
  onBackToIntent,
  onContinueToTemplates,
  renderRegionHierarchySelector,
}: CreateConfigureStepProps) {
  const [showPreview, setShowPreview] = useState(false);
  // Track whether resolution was auto-set (vs. manually overridden by user)
  const [resolutionManuallySet, setResolutionManuallySet] = useState(false);

  // Auto-derive resolution from primary platform selection
  const handlePlatformToggle = (id: string) => {
    const next = targetPlatformIds.includes(id)
      ? targetPlatformIds.filter(p => p !== id)
      : [...targetPlatformIds, id];
    const finalPlatforms = next.length > 0 ? next : ['youtube'];
    setTargetPlatformIds(finalPlatforms);

    // Auto-set resolution from the first (primary) platform if user hasn't overridden
    if (!resolutionManuallySet) {
      const primaryId = finalPlatforms[0];
      const defaults = PLATFORM_RESOLUTION_DEFAULTS[primaryId];
      if (defaults) {
        setSelectedResolution(defaults.resolution);
        setSelectedAspectRatio(defaults.aspectRatio);
      }
    }
  };

  // Completion checks
  const isPlatformComplete = targetPlatformIds.length > 0;
  const isStyleComplete = selectedVisualStyleIds.length > 0;
  const isEnrichmentComplete = !!enrichmentPrompt;

  return (
    <motion.div
      key="configure"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <CreateHeroBanner pageId="configure" />

      {/* Top bar: Back + Preview button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={onBackToIntent}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Content Selection
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowPreview(true)}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview Configuration
        </Button>
      </div>

      {/* Preview Popout */}
      <PreviewPopout
        open={showPreview}
        onClose={() => setShowPreview(false)}
        selectedCategoryId={selectedCategoryId}
        selectedFormatId={selectedFormatId}
        selectedSubFormatId={selectedSubFormatId}
        selectedVisualStyleIds={selectedVisualStyleIds}
        selectedCapabilityIds={selectedCapabilityIds}
        selectedCharacterIds={selectedCharacterIds}
        targetDuration={targetDuration}
        selectedResolution={selectedResolution}
        selectedAspectRatio={selectedAspectRatio}
        productionQuality={productionQuality}
        enrichmentPrompt={enrichmentPrompt}
        primaryPlatform={primaryPlatform}
        targetPlatformIds={targetPlatformIds}
        lipSyncEnabled={lipSyncEnabled}
        dubbingEnabled={dubbingEnabled}
        contentRegistry={contentRegistry}
      />

      {/* ================================================================ */}
      {/* STEP 4: Platform + Languages                                     */}
      {/* ================================================================ */}
      <ConfigSection
        step={4}
        title="Platform & Languages"
        description="Select your primary platform and output languages for regional distribution."
        tooltip="Choose where your content will be published (YouTube, TikTok, etc.) and which languages to generate. The platform choice auto-optimizes aspect ratio and duration. Languages enable AI transcreation for each region."
        icon={<Globe className="w-4 h-4 text-primary" />}
        isComplete={isPlatformComplete}
        defaultOpen={true}
      >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <PortalDropdown
                label="Target Platforms"
                icon={<Globe className="w-3.5 h-3.5" />}
                placeholder="Select platforms..."
                options={getPlatformCategories().flatMap(cat =>
                  getPlatformsByCategory(cat).map(p => ({
                    value: p.id,
                    label: p.label,
                    description: (cat === 'social' ? 'Social' : cat === 'web' ? 'Web' : cat === 'messaging' ? 'Messaging' : cat === 'broadcast' ? 'Broadcast' : 'Presentation')
                      + (p.maxDurationSeconds ? ` · ≤${p.maxDurationSeconds}s` : '')
                      + (p.aspectRatios?.length ? ` · ${p.aspectRatios[0]}` : ''),
                  }))
                )}
                selected={targetPlatformIds}
                onToggle={handlePlatformToggle}
                multi
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Input Language <span className="text-muted-foreground">(Transcreation: DeepL)</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs font-normal">
                    <span className="truncate">
                      {selectedDialectCodes[0]
                        ? (() => {
                            // Find region name from hierarchy
                            for (const g of REGION_HIERARCHY) {
                              for (const c of g.children) {
                                if (c.code === selectedDialectCodes[0]) return `${c.flag} ${c.name}`;
                                if (c.children) {
                                  for (const gc of c.children) {
                                    if (gc.code === selectedDialectCodes[0]) return `${gc.flag} ${gc.name}`;
                                  }
                                }
                              }
                            }
                            return selectedDialectCodes[0];
                          })()
                        : 'Select input language\u2026'}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[420px] p-0 z-50 bg-popover" align="start">
                  <ScrollArea className="h-[380px]">
                    <div className="p-2 space-y-1">
                      {REGION_HIERARCHY.map(group => (
                        <div key={group.groupCode} className="mb-1">
                          {/* Parent region header */}
                          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <span>{group.groupFlag}</span>
                            <span>{group.groupName}</span>
                          </div>
                          {/* Zones and leaves */}
                          <div className="ml-2 space-y-0.5">
                            {group.children.map(zone => {
                              if (zone.children && zone.children.length > 0) {
                                return (
                                  <div key={zone.code}>
                                    <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                      {zone.flag} {zone.name}
                                    </div>
                                    <div className="ml-4 space-y-0.5">
                                      {zone.children.map(leaf => (
                                        <button
                                          key={leaf.code}
                                          type="button"
                                          className={cn(
                                            "w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-[10px] transition-colors",
                                            selectedDialectCodes[0] === leaf.code
                                              ? "bg-primary/10 text-primary font-medium"
                                              : "hover:bg-muted/50"
                                          )}
                                          onClick={() => { onDialectChange([leaf.code]); }}
                                        >
                                          <span>{leaf.flag}</span>
                                          <span className="flex-1">{leaf.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              // Flat leaf
                              return (
                                <button
                                  key={zone.code}
                                  type="button"
                                  className={cn(
                                    "w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-[10px] transition-colors",
                                    selectedDialectCodes[0] === zone.code
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "hover:bg-muted/50"
                                  )}
                                  onClick={() => { onDialectChange([zone.code]); }}
                                >
                                  <span>{zone.flag}</span>
                                  <span className="flex-1">{zone.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* -- Script Transcreation Languages -- */}
          <div className="space-y-1.5">
            <Label className="text-xs">Script Transcreation Languages <span className="text-muted-foreground">(LLM transcreation per zone)</span></Label>
            {renderRegionHierarchySelector(outputLanguages, setOutputLanguages, 'script')}
          </div>

          {/* -- Dubbing & Subtitle Languages -- */}
          <div className="space-y-1.5">
            <Label className="text-xs">Dubbing & Subtitle Languages <span className="text-muted-foreground">(TTS + subtitles per zone)</span></Label>
            {renderRegionHierarchySelector(dubbingSubtitleLanguages, setDubbingSubtitleLanguages, 'dubbing')}
          </div>
      </ConfigSection>

      {/* ================================================================ */}
      {/* STEP 5: Visual & Asset Configuration                             */}
      {/* ================================================================ */}
      <ConfigSection
        step={5}
        title="Visual & Asset Configuration"
        description="Generation style, capabilities, asset source, lip-sync & dubbing settings."
        tooltip="Define the look and feel of your content. Pick visual styles (cinematic, minimal, etc.), choose AI capabilities (avatar, lip-sync, 3D), set resolution, and configure how assets are sourced. Each style auto-selects recommended capabilities."
        icon={<Palette className="w-4 h-4 text-primary" />}
        isComplete={isStyleComplete}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* Holiday/Festival Awareness Banner */}
          {holidayAwareness?.topSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {holidayAwareness.topSuggestion.holiday.holiday_type === 'religious' ? '\uD83D\uDE4F' :
                     holidayAwareness.topSuggestion.holiday.holiday_type === 'national' ? '\uD83C\uDFF3\uFE0F' :
                     holidayAwareness.topSuggestion.holiday.holiday_type === 'seasonal' ? '\uD83C\uDF38' :
                     holidayAwareness.topSuggestion.holiday.holiday_type === 'commercial' ? '\uD83D\uDECD\uFE0F' : '\uD83C\uDF89'}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">
                      {holidayAwareness.topSuggestion.holiday.name}
                      {holidayAwareness.topSuggestion.holiday.local_name && (
                        <span className="text-muted-foreground font-normal ml-1">
                          ({holidayAwareness.topSuggestion.holiday.local_name})
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {holidayAwareness.topSuggestion.urgency === 'now' ? '\uD83D\uDD34 Happening now!' :
                       holidayAwareness.topSuggestion.urgency === 'soon' ? `\u23F0 In ${holidayAwareness.topSuggestion.daysUntil} days` :
                       `\uD83D\uDCC5 ${holidayAwareness.topSuggestion.daysUntil} days away`}
                      {' \u00B7 '}
                      {holidayAwareness.topSuggestion.holiday.region_code.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-7"
                  onClick={() => {
                    // Apply holiday style suggestions
                    const suggestedIds = holidayAwareness.topSuggestion?.holiday.suggested_style_ids || [];
                    if (suggestedIds.length > 0) {
                      const matchedStyles = contentRegistry.visualStyles.filter(s => suggestedIds.includes(s.id));
                      if (matchedStyles.length > 0) setSelectedVisualStyleIds(prev => Array.from(new Set([...prev, ...matchedStyles.map(s => s.id)])));
                    }
                    // Apply suggested capabilities
                    const suggestedCaps = holidayAwareness.topSuggestion?.holiday.suggested_capabilities || [];
                    if (suggestedCaps.length > 0) {
                      const capIds = contentRegistry.productionCapabilities
                        .filter(c => suggestedCaps.includes(c.name))
                        .map(c => c.id);
                      setSelectedCapabilityIds(prev => Array.from(new Set([...prev, ...capIds])));
                    }
                    toast.success(`Applied ${holidayAwareness.topSuggestion?.holiday.name} settings`);
                  }}
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Apply Holiday Style
                </Button>
              </div>
              {/* Color palette preview */}
              {holidayAwareness.topSuggestion.holiday.color_palette.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground mr-1">Colors:</span>
                  {holidayAwareness.topSuggestion.holiday.color_palette.map((color: string, i: number) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
              {/* More upcoming holidays */}
              {holidayAwareness.suggestions.length > 1 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {holidayAwareness.suggestions.slice(1, 4).map(s => (
                    <Badge key={s.holiday.id} variant="outline" className="text-[9px] px-1.5 py-0">
                      {s.holiday.name} \u00B7 {s.daysUntil}d
                    </Badge>
                  ))}
                  {holidayAwareness.suggestions.length > 4 && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      +{holidayAwareness.suggestions.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* 5a: Generation Style -- Side-by-side dropdowns (multi-select) */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Generation Style</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Parent Style Dropdown -- filtered & ranked by category+format match */}
              {(() => {
                const contentCatName = contentRegistry.categories.find(c => c.id === selectedCategoryId)?.name || null;
                const contentFmtName = contentRegistry.formats.find(f => f.id === selectedFormatId)?.name || null;
                const parentStyles = contentRegistry.visualStyles.filter(s => !s.parent_style_id);
                const { recommended, compatible, other } = partitionStylesByMatch(parentStyles, contentCatName, contentFmtName);

                const iconMap = (icon: string | undefined) =>
                  icon === 'Film' ? '\uD83C\uDFAC' : icon === 'Palette' ? '\uD83C\uDFA8' : icon === 'Camera' ? '\uD83D\uDCF7' : icon === 'Star' ? '\u2B50' : icon === 'Box' ? '\uD83D\uDCE6' : '\uD83C\uDFAD';

                const sortFn = (a: typeof parentStyles[0], b: typeof parentStyles[0]) => {
                  if (a.category !== b.category) return a.category.localeCompare(b.category);
                  return a.sort_order - b.sort_order;
                };

                const mapStyle = (s: typeof parentStyles[0], tag: string) => {
                  const subCount = contentRegistry.visualStyles.filter(sub => sub.parent_style_id === s.id).length;
                  const catLabel = s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : '';
                  return {
                    value: s.id,
                    label: s.label + (subCount > 0 ? ` (${subCount})` : ''),
                    icon: iconMap(s.icon),
                    description: `${tag} \u2022 ${catLabel}${subCount > 0 ? ` \u2022 ${subCount} sub-styles` : ''}`,
                  };
                };

                const options = [
                  ...recommended.sort(sortFn).map(s => mapStyle(s, '\u2B50 Best Match')),
                  ...compatible.sort(sortFn).map(s => mapStyle(s, '\u2705 Compatible')),
                  ...other.sort(sortFn).map(s => mapStyle(s, 'More')),
                ];

                return (
                  <PortalDropdown
                    label="Style"
                    icon={<span className="text-sm">{'\uD83C\uDFA8'}</span>}
                    placeholder="Select styles..."
                    options={options}
                    selected={selectedVisualStyleIds.filter(id => {
                      const style = contentRegistry.visualStyles.find(s => s.id === id);
                      return style && !style.parent_style_id;
                    })}
                    onToggle={(id) => {
                      setSelectedVisualStyleIds(prev => {
                        const isRemoving = prev.includes(id);
                        if (isRemoving) {
                          const subIds = contentRegistry.visualStyles.filter(s => s.parent_style_id === id).map(s => s.id);
                          return prev.filter(p => p !== id && !subIds.includes(p));
                        } else {
                          return [...prev, id];
                        }
                      });
                      const rules = contentRegistry.getCapabilityRulesForStyle(id);
                      const autoIds = rules.filter(r => r.auto_select).map(r => r.capability_id);
                      if (autoIds.length > 0) {
                        setAutoSelectedCapIds(p => Array.from(new Set([...p, ...autoIds])));
                        setSelectedCapabilityIds(p => Array.from(new Set([...p, ...autoIds])));
                        const lipSyncCap = contentRegistry.productionCapabilities.find(c => c.name === 'lip_sync');
                        if (lipSyncCap && autoIds.includes(lipSyncCap.id)) setLipSyncEnabled(true);
                      }
                    }}
                    multi
                  />
                );
              })()}

              {/* Sub-Style Dropdown -- shows sub-styles of all selected parents */}
              {(() => {
                const selectedParentIds = selectedVisualStyleIds.filter(id => {
                  const style = contentRegistry.visualStyles.find(s => s.id === id);
                  return style && !style.parent_style_id;
                });
                const availableSubStyles = contentRegistry.visualStyles
                  .filter(s => s.parent_style_id && selectedParentIds.includes(s.parent_style_id))
                  .sort((a, b) => a.sub_sort_order - b.sub_sort_order);

                if (selectedParentIds.length === 0) return (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><span className="text-sm">{'\uD83C\uDFAD'}</span>Sub-Style</Label>
                    <div className="flex items-center justify-center h-10 border rounded-md bg-muted/30 text-xs text-muted-foreground">
                      Select a parent style first
                    </div>
                  </div>
                );

                if (availableSubStyles.length === 0) return (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><span className="text-sm">{'\uD83C\uDFAD'}</span>Sub-Style</Label>
                    <div className="flex items-center justify-center h-10 border rounded-md bg-muted/30 text-xs text-muted-foreground">
                      No sub-styles for selected style(s)
                    </div>
                  </div>
                );

                return (
                  <PortalDropdown
                    label="Sub-Style"
                    icon={<span className="text-sm">{'\uD83C\uDFAD'}</span>}
                    placeholder="Select sub-styles..."
                    options={availableSubStyles.map(s => {
                      const parent = contentRegistry.visualStyles.find(p => p.id === s.parent_style_id);
                      return { value: s.id, label: s.label, description: parent ? `${parent.label}` : undefined };
                    })}
                    selected={selectedVisualStyleIds.filter(id => {
                      const style = contentRegistry.visualStyles.find(s => s.id === id);
                      return style && !!style.parent_style_id;
                    })}
                    onToggle={(id) => {
                      setSelectedVisualStyleIds(prev =>
                        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
                      );
                      // Auto-select capabilities for sub-style
                      const rules = contentRegistry.getCapabilityRulesForStyle(id);
                      const autoIds = rules.filter(r => r.auto_select).map(r => r.capability_id);
                      if (autoIds.length > 0) {
                        setAutoSelectedCapIds(p => Array.from(new Set([...p, ...autoIds])));
                        setSelectedCapabilityIds(p => Array.from(new Set([...p, ...autoIds])));
                        const lipSyncCap = contentRegistry.productionCapabilities.find(c => c.name === 'lip_sync');
                        if (lipSyncCap && autoIds.includes(lipSyncCap.id)) setLipSyncEnabled(true);
                      }
                    }}
                    multi
                  />
                );
              })()}
            </div>

            {selectedVisualStyleIds.length > 0 && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                {'\uD83D\uDEE1\uFE0F'} IP-safe style — prevents photorealistic deepfakes
              </p>
            )}
          </div>

          {/* 5a-ii: Output Resolution / Pixel Size -- DB-driven */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{'\uD83D\uDCD0'} Output Resolution</Label>
            {contentRegistry.outputPresets.length > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {contentRegistry.outputPresets.map(preset => {
                    const isSelected = selectedOutputPresets.includes(preset.id);
                    const isPrimaryRes = selectedResolution === `${preset.width}x${preset.height}`;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          // Set as primary resolution (manual override)
                          setSelectedResolution(`${preset.width}x${preset.height}`);
                          setSelectedAspectRatio(preset.aspect_ratio);
                          setResolutionManuallySet(true);
                          // Toggle in multi-output presets list
                          if (isSelected) {
                            setSelectedOutputPresets(selectedOutputPresets.filter(id => id !== preset.id));
                          } else {
                            setSelectedOutputPresets([...selectedOutputPresets, preset.id]);
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center gap-0.5 p-2.5 rounded-lg border text-xs transition-all relative",
                          isPrimaryRes
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                            : isSelected
                              ? "border-primary/50 bg-primary/5 text-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[8px]">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <span className="text-sm">{preset.icon}</span>
                        <span className="font-bold text-xs">{preset.label}</span>
                        <span className="text-[10px] text-muted-foreground">{preset.width}{'\u00D7'}{preset.height}</span>
                        <span className="text-[9px] text-muted-foreground">{preset.description}</span>
                        {preset.is_default && <Badge variant="secondary" className="text-[8px] px-1 py-0">Default</Badge>}
                      </button>
                    );
                  })}
                </div>
                {selectedOutputPresets.length > 1 && (
                  <p className="text-[10px] text-primary flex items-center gap-1">
                    Multi-output: {selectedOutputPresets.length} preset(s) selected — video will be encoded to each format
                  </p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Aspect: <span className="font-semibold text-foreground">{selectedAspectRatio}</span></span>
                  <span>&bull;</span>
                  <span>Res: <span className="font-semibold text-foreground">{selectedResolution.replace('x', '\u00D7')}</span></span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-16 border rounded-md bg-muted/30 text-xs text-muted-foreground">
                Loading resolution presets...
              </div>
            )}
          </div>

          {/* 5a-ii-b: Style Preview -- show AI-generated preview for selected styles */}
          {selectedVisualStyleIds.length > 0 && (() => {
            const selectedStyles = selectedVisualStyleIds
              .map(id => contentRegistry.visualStyles.find(s => s.id === id))
              .filter((s): s is NonNullable<typeof s> => !!s);
            const withPreview = selectedStyles.filter(s => s.preview_image_url);
            if (withPreview.length === 0 && selectedStyles.length > 0) return (
              <div className="space-y-2">
                <Label className="text-xs font-medium">{'\uD83D\uDDBC\uFE0F'} Style Preview</Label>
                <div className="flex items-center justify-center h-20 border border-dashed rounded-lg bg-muted/20 text-xs text-muted-foreground">
                  <Sparkles className="w-4 h-4 mr-2 text-primary/50" />
                  AI preview images will be generated for {selectedStyles.map(s => s.label).join(', ')}
                </div>
              </div>
            );
            return withPreview.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-xs font-medium">{'\uD83D\uDDBC\uFE0F'} Style Preview</Label>
                <div className="grid grid-cols-2 gap-2">
                  {withPreview.map(style => (
                    <div key={style.id} className="rounded-lg border overflow-hidden bg-muted/20">
                      <img src={style.preview_image_url!} alt={style.label} className="w-full h-28 object-cover" />
                      <div className="p-1.5 text-center">
                        <span className="text-[10px] font-medium">{style.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* 5a-iii: Style Customization -- B-007: Always visible (no pre-select gate) */}
          <StyleCustomizationPanel
            selectedStyles={selectedVisualStyleIds
              .map(id => contentRegistry.visualStyles.find(s => s.id === id))
              .filter((s): s is NonNullable<typeof s> => !!s)}
            allStyles={contentRegistry.visualStyles}
            characterFramePercent={characterFramePercent}
            onCharacterFrameChange={setCharacterFramePercent}
            onStyleCreated={contentRegistry.refresh}
          />

          {/* 5a-iv: Character selection -- enlarged cards with thumbnails & descriptions */}
          {selectedVisualStyleIds.length > 0 && (() => {
            // Collect characters for all selected styles
            const allChars = selectedVisualStyleIds.flatMap(id =>
              contentRegistry.getCharactersForStyle(id)
            );
            // Deduplicate by id
            const uniqueChars = Array.from(new Map(allChars.map(c => [c.id, c])).values());
            if (uniqueChars.length === 0) return (
              <div className="space-y-2">
                <Label className="text-xs font-medium">{'\uD83C\uDFAD'} Characters</Label>
                <div className="flex items-center justify-center h-16 border rounded-md bg-muted/30 text-xs text-muted-foreground">
                  No characters available for selected style(s)
                </div>
              </div>
            );
            const selectedChars = uniqueChars.filter(ch => selectedCharacterIds.includes(ch.id));
            return (
              <div className="space-y-2">
                <Label className="text-xs font-medium">{'\uD83C\uDFAD'} Characters ({uniqueChars.length} available{selectedChars.length > 0 ? ` \u2022 ${selectedChars.length} selected` : ''})</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {uniqueChars.map(ch => {
                    const isSelected = selectedCharacterIds.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedCharacterIds(prev =>
                          prev.includes(ch.id) ? prev.filter(c => c !== ch.id) : [...prev, ch.id]
                        )}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                          isSelected
                            ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                            : "bg-muted/20 border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        {ch.thumbnail_url ? (
                          <img src={ch.thumbnail_url} alt={ch.label} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border/50" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
                            {ch.icon || '\uD83C\uDFAD'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-xs truncate">{ch.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </div>
                          {ch.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{ch.description}</p>
                          )}
                          <span className="text-[9px] text-muted-foreground/70 mt-0.5 block">{ch.character_type}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <Separator />

          {/* 5a-iii: Duration & Scene Planning */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{'\u23F1\uFE0F'} Target Duration & Scene Planning</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '30s', value: 30, desc: 'Short clip' },
                { label: '1 min', value: 60, desc: 'Standard' },
                { label: '3 min', value: 180, desc: 'Detailed' },
                { label: '5 min', value: 300, desc: 'Full production' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTargetDuration(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-2.5 rounded-lg border text-xs transition-all",
                    targetDuration === opt.value
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <span className="font-bold">{opt.label}</span>
                  <span className="text-[9px] text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
            {/* Auto-calculated estimation */}
            {(() => {
              const est = contentRegistry.estimateScenes(targetDuration, selectedVisualStyleIds[0] || null);
              return (
                <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/60 grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{est.scenes}</p>
                    <p className="text-[9px] text-muted-foreground">Scenes</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{est.perSceneDuration}s</p>
                    <p className="text-[9px] text-muted-foreground">Per scene</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{est.totalSizeMb < 1000 ? `${est.totalSizeMb}MB` : `${(est.totalSizeMb / 1000).toFixed(1)}GB`}</p>
                    <p className="text-[9px] text-muted-foreground">Est. size</p>
                  </div>
                  <div>
                    <p className={cn("text-lg font-bold", est.renderTime === 'high' ? 'text-destructive' : est.renderTime === 'low' ? 'text-green-600' : 'text-foreground')}>
                      {est.renderTime === 'high' ? '\uD83D\uDD25' : est.renderTime === 'low' ? '\u26A1' : '\u23F1\uFE0F'}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{est.renderTime} load</p>
                  </div>
                </div>
              );
            })()}
          </div>

          <Separator />

          {/* 5b: Production Capabilities (with auto-select indicators) */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Production Capabilities</Label>
            {autoSelectedCapIds.length > 0 && (
              <p className="text-[10px] text-primary flex items-center gap-1">
                {'\u26A1'} {autoSelectedCapIds.length} auto-selected based on your style — you can toggle them off
              </p>
            )}
            {/* Show recommended capabilities */}
            {selectedVisualStyleIds.length > 0 && (() => {
              const allRules = selectedVisualStyleIds.flatMap(id => contentRegistry.getCapabilityRulesForStyle(id));
              const recommended = allRules.filter(r => r.is_recommended && !r.auto_select);
              if (recommended.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-1 mb-1">
                  {recommended.map(r => {
                    const cap = contentRegistry.productionCapabilities.find(c => c.id === r.capability_id);
                    if (!cap) return null;
                    return (
                      <Badge key={r.id} variant="outline" className="text-[9px] cursor-pointer hover:bg-primary/10"
                        onClick={() => setSelectedCapabilityIds(prev => prev.includes(cap.id) ? prev : [...prev, cap.id])}>
                        {'\uD83D\uDCA1'} {cap.label} — {r.reason}
                      </Badge>
                    );
                  })}
                </div>
              );
            })()}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(selectedFormatId
                ? contentRegistry.getCapabilitiesForFormat(selectedFormatId)
                : contentRegistry.productionCapabilities
              ).map(cap => {
                const isAutoSelected = autoSelectedCapIds.includes(cap.id);
                const isSelected = selectedCapabilityIds.includes(cap.id);
                return (
                  <button
                    key={cap.id}
                    onClick={() => setSelectedCapabilityIds(prev =>
                      prev.includes(cap.id) ? prev.filter(c => c !== cap.id) : [...prev, cap.id]
                    )}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border text-xs transition-all text-left relative",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    {isAutoSelected && isSelected && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center">{'\u26A1'}</span>
                    )}
                    <span className="text-sm">
                      {cap.name === 'lip_sync' ? '\uD83D\uDC44' : cap.name === 'dubbing' ? '\uD83C\uDF0D' : cap.name === 'avatar_talking_head' ? '\uD83E\uDDD1' : cap.name === 'avatar_full_body' ? '\uD83D\uDD7A' : cap.name === 'text_to_video' ? '\uD83C\uDFAC' : cap.name === 'text_to_image' ? '\uD83D\uDDBC\uFE0F' : cap.name === 'image_to_image' ? '\uD83D\uDD04' : cap.name === 'vr_ar_immersive' ? '\uD83E\uDD7D' : cap.name === 'pixar_3d' ? '\uD83D\uDCE6' : cap.name === 'cartoon_animation' ? '\uD83C\uDFA8' : cap.name === 'ar_filters' ? '\u2728' : cap.name === 'music_sfx_gen' ? '\uD83C\uDFB5' : cap.name === 'multi_camera' ? '\uD83D\uDCD0' : cap.name === 'green_screen' ? '\uD83D\uDFE9' : cap.name === 'voice_clone' ? '\uD83C\uDF99\uFE0F' : cap.name === 'motion_capture' ? '\uD83C\uDFC3' : cap.name === 'brand_watermark' ? '\uD83D\uDEE1\uFE0F' : cap.name === '3d_scene_gen' ? '\uD83C\uDFD4\uFE0F' : cap.name === 'style_transfer' ? '\uD83C\uDFA8' : cap.name === 'subtitle_burn' ? '\uD83D\uDCAC' : '\u26A1'}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{cap.label}</span>
                      {cap.description && (
                        <span className="text-[9px] text-muted-foreground leading-tight line-clamp-1">{cap.description}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* 5c: Asset Source */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Asset Source</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {contentRegistry.assetSourceTypes.map(src => (
                <button
                  key={src.id}
                  onClick={() => setSelectedAssetSource(src.name)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs transition-all",
                    selectedAssetSource === src.name
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <span className="text-base">
                    {src.name === 'generate' ? '\u2728' : src.name === 'pre_uploaded' ? '\uD83D\uDCC1' : src.name === 'upload_new' ? '\uD83D\uDCE4' : src.name === 'stock' ? '\uD83C\uDFEA' : src.name === 'screen_capture' ? '\uD83D\uDCF8' : '\uD83D\uDCCE'}
                  </span>
                  <span className="font-medium text-center">{src.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 5d: Lip-sync & Dubbing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium">{'\uD83D\uDC44'} Lip-sync</Label>
                <p className="text-[10px] text-muted-foreground">Auto-sync per scene</p>
              </div>
              <Button
                variant={lipSyncEnabled ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setLipSyncEnabled(!lipSyncEnabled)}
              >
                {lipSyncEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium">{'\uD83C\uDF0D'} Dubbing</Label>
                <p className="text-[10px] text-muted-foreground">Auto transcreation for output regions</p>
              </div>
              <Button
                variant={dubbingEnabled ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setDubbingEnabled(!dubbingEnabled)}
              >
                {dubbingEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </div>
      </ConfigSection>

      {/* ================================================================ */}
      {/* Resolution & Quality (extends Step 5)                            */}
      {/* ================================================================ */}
      <ConfigSection
        step={5}
        title="Resolution & Quality"
        description="Output resolution, aspect ratio, and production quality settings."
        tooltip="Set the pixel resolution and aspect ratio for your output. Higher resolution takes longer to render. Quality presets control encoding: Preview is fast/low-size, Production is balanced, Cinematic is highest fidelity."
        icon={<Settings2 className="w-4 h-4 text-primary" />}
        isComplete={!!selectedResolution}
        defaultOpen={false}
      >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Aspect Ratio</Label>
              <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait / Reels)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="21:9">21:9 (Cinematic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Resolution</Label>
              <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentRegistry.outputPresets.length > 0 ? (
                    (() => {
                      const grouped = contentRegistry.outputPresets.reduce((acc, p) => {
                        const cat = p.category || 'general';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(p);
                        return acc;
                      }, {} as Record<string, typeof contentRegistry.outputPresets>);
                      return Object.entries(grouped).map(([cat, presets]) => (
                        <SelectGroup key={cat}>
                          <SelectLabel className="text-[10px] uppercase">{cat}</SelectLabel>
                          {presets.map(p => (
                            <SelectItem key={p.id} value={`${p.width}x${p.height}`}>
                              {p.icon} {p.label} ({p.width}\u00D7{p.height})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ));
                    })()
                  ) : (
                    <>
                      <SelectItem value="3840x2160">4K (3840\u00D72160)</SelectItem>
                      <SelectItem value="1920x1080">Full HD (1920\u00D71080)</SelectItem>
                      <SelectItem value="1280x720">HD (1280\u00D7720)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label className="text-xs">Quality Preset</Label>
            <div className="flex gap-2">
              {(['preview', 'production', 'cinematic'] as const).map(q => (
                <Button
                  key={q}
                  variant={productionQuality === q ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs capitalize flex-1"
                  onClick={() => setProductionQuality(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
      </ConfigSection>

      {/* ================================================================ */}
      {/* STEP 6: Universal Enrichment Prompt + Imagination Preset          */}
      {/* ================================================================ */}
      <ConfigSection
        step={6}
        title="Creative Vision & Enrichment"
        description="Pick a visual world preset and describe your vision. AI generates full production configs scoped by ALL above selections."
        tooltip="Choose an imagination preset to set the visual DNA (style, music, characters, narrative), then write your creative brief. The enrichment engine combines preset + prompt + region + style to build the complete production pipeline."
        icon={<Wand2 className="w-4 h-4 text-primary" />}
        isComplete={isEnrichmentComplete}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {/* ── Imagination Preset Picker ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary" />
              Creative Imagination Preset
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px] text-xs">
                    Each preset captures a complete visual world DNA: render style, lighting, music genre, character proportions, narrative pacing, and AI prompt modifiers. Region-recommended presets are highlighted.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>

            {/* Region-recommended presets */}
            {(() => {
              const recommended = recommendPresetsForRegion(selectedRegion || 'NAM_US', 4);
              if (recommended.length === 0) return null;
              return (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Recommended for your region</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {recommended.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setImaginationPreset(imaginationPreset === preset.id ? null : preset.id)}
                        className={cn(
                          'p-2.5 rounded-lg border text-left transition-all hover:shadow-md',
                          imaginationPreset === preset.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                            : 'border-border/30 bg-card/40 hover:border-border/60',
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ background: `linear-gradient(135deg, ${preset.visual.colorPalette[0] || '#6366f1'}, ${preset.visual.colorPalette[1] || '#a855f7'})` }}
                          />
                          <span className="text-[10px] font-bold text-foreground truncate">{preset.name}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground line-clamp-2">{preset.tagline}</p>
                        <Badge variant="secondary" className="text-[8px] mt-1 bg-amber-500/10 text-amber-600 border-0">
                          Recommended
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* All presets by category */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">All presets by category</p>
              <div className="space-y-2">
                {getPresetCategories().map(({ category, presets: presetIds }) => (
                  <Collapsible key={category}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-muted/30 transition-colors">
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium capitalize">{category.replace(/_/g, ' ')}</span>
                        <Badge variant="outline" className="text-[8px] h-4 ml-auto">{presetIds.length}</Badge>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 pl-5 pt-1">
                        {presetIds.map(pid => {
                          const preset = IMAGINATION_PRESETS[pid];
                          if (!preset) return null;
                          return (
                            <button
                              key={pid}
                              onClick={() => setImaginationPreset(imaginationPreset === pid ? null : pid)}
                              className={cn(
                                'p-2 rounded-md border text-left transition-all',
                                imaginationPreset === pid
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                  : 'border-border/20 hover:border-border/40',
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${preset.visual.colorPalette[0] || '#6366f1'}, ${preset.visual.colorPalette[1] || '#a855f7'})` }}
                                />
                                <span className="text-[10px] font-medium truncate">{preset.name}</span>
                              </div>
                              <p className="text-[8px] text-muted-foreground mt-0.5 line-clamp-1">{preset.tagline}</p>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>

            {/* Selected preset summary */}
            {imaginationPreset && IMAGINATION_PRESETS[imaginationPreset] && (() => {
              const p = IMAGINATION_PRESETS[imaginationPreset];
              return (
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{p.name}</span>
                    <button onClick={() => setImaginationPreset(null)} className="text-[10px] text-muted-foreground hover:text-foreground">Clear</button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[8px]">{p.visual.renderStyle}</Badge>
                    <Badge variant="outline" className="text-[8px]">{p.music.genre}</Badge>
                    <Badge variant="outline" className="text-[8px]">{p.narrative.pacing} pacing</Badge>
                    <Badge variant="outline" className="text-[8px]">{p.character.motionStyle}</Badge>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {p.visual.colorPalette.slice(0, 6).map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-border/30" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <Separator className="my-2" />

          {/* ── Enrichment Prompt ── */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Your Creative Brief</Label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              placeholder="e.g. Create a cinematic product demo for our AI platform. Focus on enterprise decision-makers. Tone: professional yet innovative. Highlight ROI metrics and competitive advantages..."
              value={enrichmentPrompt}
              onChange={(e) => setEnrichmentPrompt(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              {['Patient Services', 'ROI Focus', 'Brand Story', 'Product Demo', 'Competitive Edge', 'Thought Leadership'].map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setEnrichmentPrompt(enrichmentPrompt ? `${enrichmentPrompt}. ${tag}` : tag)}
                >
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ConfigSection>

      {/* ================================================================ */}
      {/* STEP 7 Preview: Safety Pipeline (info only)                      */}
      {/* ================================================================ */}
      <ConfigSection
        step={7}
        title="Production & Safety Pipeline"
        description="Automated safety checks run during production."
        tooltip="These safety checks run automatically when your content is produced. They detect faces, enforce style guidelines (no deepfakes), add provenance watermarks (C2PA), and handle legal consent workflows. No action needed from you."
        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        isComplete={true}
        defaultOpen={false}
      >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: '\uD83D\uDD0D', label: 'Upload Scan', desc: 'Face & trademark detection' },
              { icon: '\uD83C\uDFA8', label: 'Style Enforcement', desc: 'No photorealistic deepfakes' },
              { icon: '\uD83D\uDCA7', label: 'Watermark + C2PA', desc: 'Provenance metadata' },
              { icon: '\uD83D\uDCCB', label: 'Legal Consent', desc: 'Face consent workflow' },
            ].map(item => (
              <div key={item.label} className="p-2 rounded-lg bg-muted/50 text-center space-y-1">
                <span className="text-lg">{item.icon}</span>
                <p className="text-[10px] font-medium">{item.label}</p>
                <p className="text-[9px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
      </ConfigSection>

      {/* Continue to Templates */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
          {selectedVisualStyleIds.length > 0 && <span>{'\u2705'} {selectedVisualStyleIds.length} Style{selectedVisualStyleIds.length > 1 ? 's' : ''}</span>}
          {selectedCharacterIds.length > 0 && <span>{'\u2705'} {selectedCharacterIds.length} chars</span>}
          {targetDuration > 0 && <span>{'\u2705'} {targetDuration}s / {contentRegistry.estimateScenes(targetDuration, selectedVisualStyleIds[0] || null).scenes} scenes</span>}
          {selectedCapabilityIds.length > 0 && <span>{'\u2705'} {selectedCapabilityIds.length} capabilities</span>}
          {enrichmentPrompt && <span>{'\u2705'} Enrichment</span>}
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={onContinueToTemplates}
        >
          Continue to Templates
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
