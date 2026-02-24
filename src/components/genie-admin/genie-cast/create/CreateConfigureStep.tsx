/**
 * CREATE CONFIGURE STEP
 *
 * Steps 4-7 of the CREATE workflow:
 * - Step 4: Platform & Languages (primary platform, input language, script transcreation, dubbing/subtitle)
 * - Step 5: Visual & Asset Configuration (styles, resolution, characters, duration, capabilities, asset source, lip-sync, dubbing)
 * - Step 6: Universal Enrichment Prompt
 * - Step 7: Production & Safety Pipeline (info only)
 *
 * Extracted from GenieCastConsolidatedTabs.tsx for maintainability.
 */

import React from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { PortalDropdown } from '../create-wizard/PortalDropdown';
import { StyleCustomizationPanel } from '../StyleCustomizationPanel';
import { REGION_HIERARCHY } from '@/config/regionHierarchy';
import type { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import type { useHolidayAwareness } from '@/hooks/useHolidayAwareness';

interface CreateConfigureStepProps {
  // Session state (read)
  selectedCategoryId: string | null;
  selectedFormatId: string | null;
  selectedSubFormatId: string | null;
  primaryPlatform: string;
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

  // Session setters
  setPrimaryPlatform: (v: string) => void;
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

export function CreateConfigureStep({
  selectedCategoryId,
  selectedFormatId,
  selectedSubFormatId,
  primaryPlatform,
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
  setPrimaryPlatform,
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
  contentRegistry,
  holidayAwareness,
  onDialectChange,
  onBackToIntent,
  onContinueToTemplates,
  renderRegionHierarchySelector,
}: CreateConfigureStepProps) {
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
      {/* Back to Content Selection */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 mb-1 text-muted-foreground hover:text-foreground"
        onClick={onBackToIntent}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Content Selection
      </Button>

      {/* ================================================================ */}
      {/* STEP 4: Platform + Languages                                     */}
      {/* ================================================================ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 4</Badge>
              Platform & Languages
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Select your primary platform and output languages for regional distribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Primary Platform</Label>
              <Select value={primaryPlatform} onValueChange={setPrimaryPlatform}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram_reels">Instagram Reels</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="product_page">Product Page</SelectItem>
                  <SelectItem value="ott_ctv">OTT / CTV</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="digital_signage">Digital Signage</SelectItem>
                  <SelectItem value="presentation_slides">Presentation</SelectItem>
                </SelectContent>
              </Select>
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
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* STEP 5: Visual & Asset Configuration                             */}
      {/* ================================================================ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <span className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 5</Badge>
              Visual & Asset Configuration
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Generation style, capabilities, asset source, lip-sync & dubbing settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              {/* Parent Style Dropdown -- with sub-count hints */}
              <PortalDropdown
                label="Style"
                icon={<span className="text-sm">{'\uD83C\uDFA8'}</span>}
                placeholder="Select styles..."
                options={contentRegistry.visualStyles
                  .filter(s => !s.parent_style_id)
                  .sort((a, b) => {
                    if (a.category !== b.category) return a.category.localeCompare(b.category);
                    return a.sort_order - b.sort_order;
                  })
                  .map(s => {
                    const subCount = contentRegistry.visualStyles.filter(sub => sub.parent_style_id === s.id).length;
                    const catLabel = s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : '';
                    return {
                      value: s.id,
                      label: s.label + (subCount > 0 ? ` (${subCount})` : ''),
                      icon: s.icon === 'Film' ? '\uD83C\uDFAC' : s.icon === 'Palette' ? '\uD83C\uDFA8' : s.icon === 'Camera' ? '\uD83D\uDCF7' : s.icon === 'Star' ? '\u2B50' : s.icon === 'Box' ? '\uD83D\uDCE6' : '\uD83C\uDFAD',
                      description: catLabel + (subCount > 0 ? ` \u2022 ${subCount} sub-styles` : ' \u2022 no sub-styles'),
                    };
                  })}
                selected={selectedVisualStyleIds.filter(id => {
                  const style = contentRegistry.visualStyles.find(s => s.id === id);
                  return style && !style.parent_style_id;
                })}
                onToggle={(id) => {
                  setSelectedVisualStyleIds(prev => {
                    const isRemoving = prev.includes(id);
                    if (isRemoving) {
                      // Remove parent + its sub-styles
                      const subIds = contentRegistry.visualStyles.filter(s => s.parent_style_id === id).map(s => s.id);
                      return prev.filter(p => p !== id && !subIds.includes(p));
                    } else {
                      return [...prev, id];
                    }
                  });
                  // Auto-select capabilities
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
                  {contentRegistry.outputPresets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => { setSelectedResolution(`${preset.width}x${preset.height}`); setSelectedAspectRatio(preset.aspect_ratio); }}
                      className={cn(
                        "flex flex-col items-center gap-0.5 p-2.5 rounded-lg border text-xs transition-all",
                        selectedResolution === `${preset.width}x${preset.height}`
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-sm">{preset.icon}</span>
                      <span className="font-bold text-xs">{preset.label}</span>
                      <span className="text-[10px] text-muted-foreground">{preset.width}\u00D7{preset.height}</span>
                      <span className="text-[9px] text-muted-foreground">{preset.description}</span>
                      {preset.is_default && <Badge variant="secondary" className="text-[8px] px-1 py-0">Default</Badge>}
                    </button>
                  ))}
                </div>
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
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Resolution & Quality (extends Step 5)                            */}
      {/* ================================================================ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Resolution & Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* STEP 6: Universal Enrichment Prompt                              */}
      {/* ================================================================ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 6</Badge>
              Universal Enrichment Prompt
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Describe your vision in any language. AI generates scenes/templates scoped by ALL above selections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* STEP 7 Preview: Safety Pipeline (info only)                      */}
      {/* ================================================================ */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 font-mono">Step 7</Badge>
              Production & Safety Pipeline
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Automated safety checks run during production.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

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
