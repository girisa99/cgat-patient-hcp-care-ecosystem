/**
 * CreateFlowWizard — 8-step glassmorphism wizard for GenieSpark
 *
 * Wires useCreateFlow to glass-morphism UI with:
 * - Step progress rail (glass badges)
 * - LiquidGlassCard for each step panel
 * - Inline editing, format selection, language I/O
 * - Review + produce summary
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useCreateFlow } from '@/hooks/useCreateFlow';
import {
  GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle,
  GlassPanel, GlassButton, GlassInput, GlassBadge,
} from '@/components/ui/glass-primitives';
import { LiquidGlassCard } from '@/components/shared/LiquidGlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft, ArrowRight, Check, FileText, Sparkles, Languages,
  LayoutGrid, Palette, ClipboardCheck, Rocket, Upload, Zap,
  RotateCcw, RotateCw, Save, Plus, X, ChevronLeft,
} from 'lucide-react';
import type { CreateFlowStep } from '@/services/createFlowOrchestrator';

const STEP_ICONS: Record<CreateFlowStep, React.ReactNode> = {
  input: <Upload className="h-4 w-4" />,
  enrichment: <Sparkles className="h-4 w-4" />,
  script: <FileText className="h-4 w-4" />,
  language: <Languages className="h-4 w-4" />,
  format: <LayoutGrid className="h-4 w-4" />,
  style: <Palette className="h-4 w-4" />,
  review: <ClipboardCheck className="h-4 w-4" />,
  producing: <Rocket className="h-4 w-4" />,
};

interface CreateFlowWizardProps {
  onBack: () => void;
  initialChainId?: string;
  className?: string;
}

export const CreateFlowWizard: React.FC<CreateFlowWizardProps> = ({
  onBack,
  initialChainId,
  className,
}) => {
  const flow = useCreateFlow('pro', 'simple');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Top bar: back + mode toggle + undo/redo + save */}
      <div className="glass-panel rounded-xl p-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="h-4 w-px bg-border/30" />
          <div className="flex items-center gap-2 text-sm">
            <span className={cn('text-xs', flow.isSimpleMode ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Simple
            </span>
            <Switch
              checked={flow.isAdvancedMode}
              onCheckedChange={flow.toggleMode}
              className="h-5 w-9"
            />
            <span className={cn('text-xs', flow.isAdvancedMode ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Advanced
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="icon"
            disabled={!flow.canUndo}
            onClick={flow.globalUndo}
            className="h-7 w-7"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            disabled={!flow.canRedo}
            onClick={flow.globalRedo}
            className="h-7 w-7"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={flow.saveNow}
            className="h-7 gap-1.5 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {flow.hasUnsavedChanges ? 'Save' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Step progress rail */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {flow.stepStatus.map((s, i) => (
          <React.Fragment key={s.step}>
            {i > 0 && (
              <div className={cn(
                'h-px flex-1 min-w-[16px] transition-colors',
                s.status === 'completed' || s.status === 'current'
                  ? 'bg-primary/40'
                  : 'bg-border/20',
              )} />
            )}
            <button
              onClick={() => s.status !== 'locked' && flow.goToStep(s.step)}
              disabled={s.status === 'locked'}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                s.status === 'current' && 'glass-tab-active text-primary',
                s.status === 'completed' && 'glass-panel text-emerald-400',
                s.status === 'upcoming' && 'text-muted-foreground hover:text-foreground',
                s.status === 'locked' && 'text-muted-foreground/50 cursor-not-allowed',
              )}
            >
              {s.status === 'completed' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                STEP_ICONS[s.step]
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <LiquidGlassCard variant="elevated" noHover className="min-h-[400px]">
        {flow.currentStep === 'input' && <InputStep flow={flow} />}
        {flow.currentStep === 'enrichment' && <EnrichmentStep flow={flow} />}
        {flow.currentStep === 'script' && <ScriptStep flow={flow} />}
        {flow.currentStep === 'language' && <LanguageStep flow={flow} />}
        {flow.currentStep === 'format' && <FormatStep flow={flow} />}
        {flow.currentStep === 'style' && <StyleStep flow={flow} />}
        {flow.currentStep === 'review' && <ReviewStep flow={flow} />}
        {flow.currentStep === 'producing' && <ProducingStep flow={flow} />}
      </LiquidGlassCard>

      {/* Navigation footer */}
      {flow.currentStep !== 'producing' && (
        <div className="flex items-center justify-between">
          <GlassButton
            variant="ghost"
            onClick={flow.goPrev}
            disabled={!flow.canGoPrev}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={flow.goNext}
            disabled={!flow.canGoNext}
            className="gap-2"
          >
            {flow.currentStep === 'review' ? 'Produce' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </GlassButton>
        </div>
      )}
    </div>
  );
};

/* ─── Step Components ─────────────────────────────────────────────────── */

type FlowProps = { flow: ReturnType<typeof useCreateFlow> };

const InputStep: React.FC<FlowProps> = ({ flow }) => {
  const simpleModes = flow.simpleModes;

  return (
    <div className="space-y-5 p-1">
      <div>
        <h3 className="font-semibold text-lg">What do you want to create from?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your input type, then provide the content.
        </p>
      </div>

      {/* Input mode selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {simpleModes.map((mode) => (
          <button
            key={mode.mode}
            onClick={() => flow.setInputMode(mode.mode)}
            className={cn(
              'glass-panel rounded-xl p-3 text-left transition-all',
              flow.inputMode === mode.mode
                ? 'ring-2 ring-primary/30 border-primary/20 bg-primary/[0.06]'
                : 'hover:border-white/15',
            )}
          >
            <span className="text-lg">{mode.icon}</span>
            <p className="text-xs font-medium mt-1.5">{mode.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{mode.description}</p>
          </button>
        ))}
      </div>

      {/* Content input */}
      <div className="space-y-2">
        {flow.inputMode === 'google_places_to_script' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <GlassInput
              placeholder="Business name..."
              value={flow.session.input.businessName || ''}
              onChange={(e) => flow.setBusinessInfo(e.target.value, flow.session.input.businessLocation || '')}
            />
            <GlassInput
              placeholder="Location (city, state)..."
              value={flow.session.input.businessLocation || ''}
              onChange={(e) => flow.setBusinessInfo(flow.session.input.businessName || '', e.target.value)}
            />
          </div>
        ) : flow.inputMode === 'text_to_script' || flow.inputMode === 'topic_to_script' ? (
          <Textarea
            placeholder="Describe what you want to create..."
            value={flow.inputContent}
            onChange={(e) => flow.setInputContent(e.target.value)}
            className="glass-input min-h-[120px] resize-none"
          />
        ) : (
          <div className="glass-panel rounded-xl p-8 border-2 border-dashed border-white/10 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop your file here or click to upload
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Supports PDF, PPTX, DOCX, images, audio, video
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const EnrichmentStep: React.FC<FlowProps> = ({ flow }) => (
  <div className="space-y-5 p-1">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-lg">AI Enrichment</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle what data feeds the AI. Higher score = richer output.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Enrichment Score</span>
        <GlassBadge className={cn(
          'text-sm font-bold',
          flow.enrichmentScore >= 70 ? 'text-emerald-400' :
          flow.enrichmentScore >= 40 ? 'text-amber-400' : 'text-red-400',
        )}>
          {flow.enrichmentScore}%
        </GlassBadge>
      </div>
    </div>

    <div className="space-y-3">
      {Object.entries((flow.enrichment as any).sections || {}).map(([section, fields]) => (
        <GlassCard key={section}>
          <GlassCardContent className="p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {section.replace(/_/g, ' ')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(fields as Record<string, boolean>).map(([field, enabled]) => (
                <button
                  key={field}
                  onClick={() => flow.toggleEnrichmentField(section, field)}
                  className={cn(
                    'text-[11px] px-2 py-1.5 rounded-md border transition-all text-left',
                    enabled
                      ? 'border-primary/30 bg-primary/[0.06] text-foreground'
                      : 'border-white/[0.06] text-muted-foreground hover:border-white/15',
                  )}
                >
                  {field.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      ))}
    </div>

    {flow.promptPreview && (
      <div className="glass-panel rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Assembled Prompt Preview</p>
        <p className="text-xs text-foreground/80 whitespace-pre-wrap line-clamp-6">{flow.promptPreview}</p>
      </div>
    )}
  </div>
);

const ScriptStep: React.FC<FlowProps> = ({ flow }) => (
  <div className="space-y-5 p-1">
    <div>
      <h3 className="font-semibold text-lg">Script Editor</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Edit your script inline. Every field supports undo/redo.
      </p>
    </div>

    {/* Title */}
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">Title</label>
      <GlassInput
        value={flow.scriptTitle.value}
        onChange={(e) => flow.editTitle('update', e.target.value)}
        placeholder="Script title..."
      />
    </div>

    {/* Synopsis */}
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">Synopsis</label>
      <Textarea
        value={flow.scriptSynopsis.value}
        onChange={(e) => flow.editSynopsis('update', e.target.value)}
        placeholder="Brief synopsis..."
        className="glass-input min-h-[60px] resize-none"
      />
    </div>

    {/* Script lines */}
    <ScrollArea className="max-h-[300px]">
      <div className="space-y-2">
        {flow.scriptLines.length === 0 ? (
          <div className="glass-panel rounded-xl p-6 text-center text-sm text-muted-foreground">
            Script lines will appear here after generation.
            <br />
            <span className="text-xs">You can proceed to set up languages and format first.</span>
          </div>
        ) : (
          flow.scriptLines.map((line, i) => (
             <div key={(line as any).id || i} className="glass-panel rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {(line as any).speaker || line.voice || `Line ${i + 1}`}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {(line as any).duration ? `${(line as any).duration}s` : line.durationEst ? `${line.durationEst}s` : ''}
                </span>
              </div>
              <Textarea
                value={line.text}
                onChange={(e) => flow.editScriptLine(i, 'update', e.target.value)}
                className="glass-input min-h-[40px] text-sm resize-none"
              />
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  </div>
);

const LanguageStep: React.FC<FlowProps> = ({ flow }) => (
  <div className="space-y-5 p-1">
    <div>
      <h3 className="font-semibold text-lg">Language I/O</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Input language and up to 5 output languages with transcreation.
      </p>
    </div>

    {/* Input language */}
    <GlassCard>
      <GlassCardContent className="p-3 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">Input Language</h4>
        <div className="glass-panel rounded-lg p-2.5 flex items-center gap-2">
          <span className="text-sm font-medium">{(flow.inputLanguage as any).nativeLabel || flow.inputLanguage.name}</span>
          <GlassBadge className="text-[10px]">{flow.inputLanguage.code}</GlassBadge>
        </div>
      </GlassCardContent>
    </GlassCard>

    {/* Output languages */}
    <GlassCard>
      <GlassCardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Output Languages ({flow.outputLanguages.length}/5)
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Transcreation</span>
            <Switch
              checked={flow.languageIO.transcreationEnabled}
              onCheckedChange={flow.toggleTranscreation}
              className="h-4 w-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          {flow.outputLanguages.map((lang) => (
            <div key={lang.code} className="glass-panel rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{(lang as any).nativeLabel || lang.name}</span>
                <GlassBadge className="text-[10px]">{lang.code}</GlassBadge>
                {(lang as any).region && (
                  <span className="text-[10px] text-muted-foreground">{(lang as any).region}</span>
                )}
              </div>
              <button
                onClick={() => flow.removeOutputLanguage(lang.code)}
                className="text-muted-foreground hover:text-red-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {flow.canAddMoreLanguages && (
            <button className="glass-panel rounded-lg p-2.5 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border-dashed border border-white/10">
              <Plus className="h-3.5 w-3.5" />
              Add language
            </button>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  </div>
);

const FormatStep: React.FC<FlowProps> = ({ flow }) => (
  <div className="space-y-5 p-1">
    <div>
      <h3 className="font-semibold text-lg">Output Formats</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Select one or more output formats. Cross-format conversion is automatic.
      </p>
    </div>

    <ScrollArea className="max-h-[400px]">
      <div className="space-y-4">
        {Object.entries(flow.formatsByCategory).map(([category, formats]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {category.replace(/_/g, ' ')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {formats.map((fmt) => {
                const isSelected = flow.selectedFormats.includes(fmt.format);
                return (
                  <button
                    key={fmt.format}
                    onClick={() => flow.toggleFormat(fmt.format)}
                    className={cn(
                      'glass-panel rounded-lg p-2.5 text-left transition-all',
                      isSelected
                        ? 'ring-2 ring-primary/30 border-primary/20 bg-primary/[0.06]'
                        : 'hover:border-white/15',
                    )}
                  >
                    <p className="text-xs font-medium">{fmt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {fmt.aspectRatios?.[0] || '16:9'} &middot; {fmt.durationRange?.min || 0}s &middot; {fmt.minTier || 'free'}
                    </p>
                    {isSelected && (
                      <Check className="h-3 w-3 text-primary mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>

    {flow.selectedFormats.length > 0 && (
      <div className="glass-panel rounded-xl p-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Selected:</span>
        {flow.selectedFormats.map((f) => (
          <GlassBadge key={f} className="text-[10px] gap-1">
            {f.replace(/_/g, ' ')}
            <button onClick={() => flow.toggleFormat(f)}>
              <X className="h-2.5 w-2.5" />
            </button>
          </GlassBadge>
        ))}
      </div>
    )}
  </div>
);

const StyleStep: React.FC<FlowProps> = ({ flow }) => (
  <div className="space-y-5 p-1">
    <div>
      <h3 className="font-semibold text-lg">Style & Scenario</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Choose the visual style and content scenario for your output.
      </p>
    </div>

    <GlassCard>
      <GlassCardContent className="p-3 space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">Scene Style</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['cinematic', 'minimal', 'corporate', 'playful', 'editorial', 'bold'].map((style) => (
            <button
              key={style}
              onClick={() => flow.setSceneStyle(style as any)}
              className={cn(
                'glass-panel rounded-lg p-2.5 text-xs capitalize transition-all',
                flow.sceneStyle === style
                  ? 'ring-2 ring-primary/30 border-primary/20 bg-primary/[0.06]'
                  : 'hover:border-white/15',
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>

    <GlassCard>
      <GlassCardContent className="p-3 space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">Content Scenario</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['product_video', 'social_promo', 'tutorial', 'brand_story', 'testimonial_video', 'explainer'].map((sc) => (
            <button
              key={sc}
              onClick={() => flow.setScenario(sc as any)}
              className={cn(
                'glass-panel rounded-lg p-2.5 text-xs transition-all text-left',
                flow.scenario === sc
                  ? 'ring-2 ring-primary/30 border-primary/20 bg-primary/[0.06]'
                  : 'hover:border-white/15',
              )}
            >
              {sc.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  </div>
);

const ReviewStep: React.FC<FlowProps> = ({ flow }) => (
  <div className="space-y-5 p-1">
    <div>
      <h3 className="font-semibold text-lg">Review & Produce</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Review your configuration before producing.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <GlassCard>
        <GlassCardContent className="p-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Input</h4>
          <p className="text-sm">{flow.inputMode.replace(/_/g, ' ')}</p>
          {flow.inputContent && (
            <p className="text-xs text-muted-foreground line-clamp-2">{flow.inputContent}</p>
          )}
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardContent className="p-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Languages</h4>
          <p className="text-sm">
            {flow.inputLanguage.name} &rarr; {flow.outputLanguages.map(l => l.name).join(', ') || 'English'}
          </p>
          {flow.languageIO.transcreationEnabled && (
            <GlassBadge className="text-[10px]">Transcreation ON</GlassBadge>
          )}
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardContent className="p-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Formats</h4>
          <div className="flex flex-wrap gap-1">
            {flow.selectedFormats.length > 0
              ? flow.selectedFormats.map(f => (
                  <GlassBadge key={f} className="text-[10px]">{f.replace(/_/g, ' ')}</GlassBadge>
                ))
              : <p className="text-xs text-muted-foreground">No formats selected</p>
            }
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardContent className="p-3 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Estimates</h4>
          <div className="flex items-center gap-4 text-sm">
            <span><strong>{flow.estimatedDuration}s</strong> duration</span>
            <span><strong>{flow.estimatedCredits}</strong> credits</span>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>

    {flow.warnings.length > 0 && (
      <div className="glass-panel rounded-xl p-3 border-amber-500/20">
        <h4 className="text-xs font-semibold text-amber-400 mb-1">Warnings</h4>
        <ul className="space-y-1">
          {flow.warnings.map((w, i) => (
            <li key={i} className="text-xs text-muted-foreground">- {w}</li>
          ))}
        </ul>
      </div>
    )}

    <GlassButton
      variant="primary"
      onClick={() => flow.goToStep('producing')}
      disabled={!flow.isReadyToProduce}
      className="w-full justify-center gap-2 py-3"
    >
      <Rocket className="h-4 w-4" />
      Start Production
    </GlassButton>
  </div>
);

const ProducingStep: React.FC<FlowProps> = ({ flow }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6 p-1">
    <div className="relative">
      <div className="h-20 w-20 rounded-2xl glass-elevated flex items-center justify-center">
        <Rocket className="h-10 w-10 text-primary animate-pulse" />
      </div>
      <div className="absolute -inset-4 rounded-3xl border border-primary/10 animate-ping opacity-20" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="font-bold text-xl">Producing Your Content</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Your {flow.selectedFormats.length} format(s) are being generated
        across {flow.outputLanguages.length} language(s).
        This page will update in real-time.
      </p>
    </div>
    <div className="flex gap-2">
      {flow.selectedFormats.slice(0, 4).map(f => (
        <GlassBadge key={f} className="text-xs animate-pulse">{f.replace(/_/g, ' ')}</GlassBadge>
      ))}
    </div>
  </div>
);

export default CreateFlowWizard;
