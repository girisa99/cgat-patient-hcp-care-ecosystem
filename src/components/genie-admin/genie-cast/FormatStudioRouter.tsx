/**
 * FORMAT STUDIO ROUTER
 *
 * Renders format-aware editor interfaces based on selected content formats.
 * Replaces the hardcoded "Generate Video" approach with a routing/dispatch
 * component that shows format-specific generation controls and checklists.
 *
 * Each format gets its own Card with:
 * - Format icon and label
 * - Editor description (placeholder for actual editor)
 * - Format-specific readiness checklist
 * - Generate button with status indicator
 */

import React, { useState, useCallback } from 'react';
import {
  Video,
  Presentation,
  Mic,
  Radio,
  Globe,
  BarChart3,
  BookOpen,
  Users,
  Mail,
  Calendar,
  FileText,
  Play,
  CheckCircle,
  Circle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GenerationStatus = 'not_started' | 'generating' | 'complete';

interface ChecklistItem {
  label: string;
  done: boolean;
}

interface FormatConfig {
  icon: React.ElementType;
  label: string;
  description: string;
  editorPlaceholder: string;
  checklist: string[];
}

interface FormatStudioRouterProps {
  selectedFormats: string[];
  projectId?: string;
  onGenerate?: (formatName: string) => void;
}

// ---------------------------------------------------------------------------
// Format configuration registry
// ---------------------------------------------------------------------------

const FORMAT_REGISTRY: Record<string, FormatConfig> = {
  video: {
    icon: Video,
    label: 'Video',
    description: 'Video timeline with scene-by-scene editing, transitions, and TTS sync.',
    editorPlaceholder: 'Video timeline + scene editor will render here. Add scenes, arrange clips, sync voiceover, and preview transitions.',
    checklist: [
      'All scenes rendered',
      'TTS audio synced to scenes',
      'Transitions applied',
      'Final preview reviewed',
    ],
  },
  ugc: {
    icon: Video,
    label: 'UGC Video',
    description: 'User-generated content style video with authentic, lo-fi aesthetic.',
    editorPlaceholder: 'UGC video timeline + scene editor will render here. Arrange clips, add captions, and apply UGC-style effects.',
    checklist: [
      'All scenes rendered',
      'TTS audio synced to scenes',
      'Captions generated',
      'UGC style filters applied',
    ],
  },
  presentation: {
    icon: Presentation,
    label: 'Presentation',
    description: 'Slide editor with per-slide video/animation embeds and speaker notes.',
    editorPlaceholder: 'Slide editor will render here. Design individual slides, embed videos or animations, and add speaker notes.',
    checklist: [
      'All slides complete',
      'Optional videos embedded',
      'Speaker notes added',
      'Slide transitions configured',
    ],
  },
  podcast: {
    icon: Mic,
    label: 'Podcast',
    description: 'Audio timeline with multi-track mixing, music beds, and SFX layers.',
    editorPlaceholder: 'Audio timeline will render here. Arrange voice tracks, add music beds, insert SFX, and fine-tune levels.',
    checklist: [
      'Audio tracks mixed',
      'Intro/outro attached',
      'Music beds leveled',
      'Final audio mastered',
    ],
  },
  voice: {
    icon: Mic,
    label: 'Voice Content',
    description: 'Voice-first content with TTS generation and audio post-processing.',
    editorPlaceholder: 'Voice editor will render here. Generate TTS, adjust pacing, and apply audio enhancements.',
    checklist: [
      'TTS generated for all segments',
      'Pacing and pauses adjusted',
      'Audio post-processing applied',
      'Quality review passed',
    ],
  },
  tts: {
    icon: Mic,
    label: 'Text-to-Speech',
    description: 'TTS generation pipeline with voice selection and prosody controls.',
    editorPlaceholder: 'TTS studio will render here. Select voices, adjust prosody, and generate speech output.',
    checklist: [
      'Voice profile selected',
      'All text segments converted',
      'Prosody tuned',
      'Output quality verified',
    ],
  },
  webcast: {
    icon: Radio,
    label: 'Webcast',
    description: 'Combined slides + video overlay with live streaming configuration.',
    editorPlaceholder: 'Webcast editor will render here. Arrange slides with video overlay, configure live settings, and set up interactive elements.',
    checklist: [
      'Slide deck linked',
      'Video overlay configured',
      'Live stream settings saved',
      'Interactive elements tested',
    ],
  },
  website: {
    icon: Globe,
    label: 'Website',
    description: 'Page section builder with responsive layout and media embedding.',
    editorPlaceholder: 'Page section builder will render here. Drag-and-drop sections, embed media, and preview responsive layouts.',
    checklist: [
      'All sections built',
      'Responsive preview passed',
      'Media assets embedded',
      'SEO metadata configured',
    ],
  },
  infographic: {
    icon: BarChart3,
    label: 'Infographic',
    description: 'Visual canvas with motion keyframes and animated data visualizations.',
    editorPlaceholder: 'Infographic canvas will render here. Place data visualizations, add motion keyframes, and configure animation timings.',
    checklist: [
      'Data visualizations placed',
      'Motion keyframes set',
      'Animation timing reviewed',
      'Static fallback exported',
    ],
  },
  training: {
    icon: BookOpen,
    label: 'Training Module',
    description: 'Chapter/module editor with assessments, quizzes, and progress tracking.',
    editorPlaceholder: 'Training module editor will render here. Create chapters, add assessments, and configure learner progress tracking.',
    checklist: [
      'All chapters/modules created',
      'Assessments configured',
      'Media assets embedded',
      'Learning path validated',
    ],
  },
  kids_education: {
    icon: BookOpen,
    label: 'Kids Education',
    description: 'Educational content editor with age-appropriate activities and interactive elements.',
    editorPlaceholder: 'Kids education editor will render here. Build interactive lessons, add gamification elements, and set difficulty levels.',
    checklist: [
      'Lesson modules created',
      'Interactive elements added',
      'Age-appropriate review passed',
      'Gamification configured',
    ],
  },
  meeting_intelligence: {
    icon: Users,
    label: 'Meeting Intelligence',
    description: 'Diagram and flow editor for meeting summaries, action items, and insights.',
    editorPlaceholder: 'Diagram/flow editor will render here. Visualize meeting flow, highlight decisions, and map action items.',
    checklist: [
      'Meeting flow diagrammed',
      'Key decisions highlighted',
      'Action items mapped',
      'Summary document generated',
    ],
  },
  email_campaign: {
    icon: Mail,
    label: 'Email Campaign',
    description: 'Email sequence builder with A/B variants, scheduling, and analytics hooks.',
    editorPlaceholder: 'Email sequence builder will render here. Design email templates, configure send sequences, and set up A/B variants.',
    checklist: [
      'Email templates designed',
      'Send sequence configured',
      'A/B variants created',
      'Preview across clients tested',
    ],
  },
  event_content: {
    icon: Calendar,
    label: 'Event Content',
    description: 'Event highlight reel editor with multi-camera timeline and branding.',
    editorPlaceholder: 'Event highlight reel editor will render here. Arrange multi-camera footage, add branding overlays, and trim highlights.',
    checklist: [
      'Highlight clips selected',
      'Branding overlays applied',
      'Timeline arranged',
      'Final reel reviewed',
    ],
  },
  document: {
    icon: FileText,
    label: 'Document',
    description: 'Rich text document editor with formatting, media embedding, and export.',
    editorPlaceholder: 'Document editor will render here. Write and format content, embed media, and configure export settings.',
    checklist: [
      'Content drafted',
      'Formatting applied',
      'Media embedded',
      'Export format configured',
    ],
  },
  script: {
    icon: FileText,
    label: 'Script',
    description: 'Script/screenplay editor with scene headings, dialogue, and action blocks.',
    editorPlaceholder: 'Script editor will render here. Write scene headings, dialogue, and action descriptions with industry-standard formatting.',
    checklist: [
      'All scenes written',
      'Dialogue finalized',
      'Stage directions added',
      'Script review completed',
    ],
  },
};

// Fallback config for unknown format names
const FALLBACK_FORMAT: FormatConfig = {
  icon: FileText,
  label: 'Custom Format',
  description: 'Generic content editor for this format type.',
  editorPlaceholder: 'Content editor will render here. Build and configure content for this format.',
  checklist: [
    'Content created',
    'Quality review passed',
    'Assets embedded',
    'Ready for export',
  ],
};

// ---------------------------------------------------------------------------
// Helper: resolve a format name to its config
// ---------------------------------------------------------------------------

function resolveFormatConfig(formatName: string): FormatConfig {
  const key = formatName.toLowerCase().trim();
  if (FORMAT_REGISTRY[key]) {
    return FORMAT_REGISTRY[key];
  }
  // Return a fallback with the raw name as label
  return {
    ...FALLBACK_FORMAT,
    label: formatName.charAt(0).toUpperCase() + formatName.slice(1),
  };
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

function statusBadge(status: GenerationStatus) {
  switch (status) {
    case 'not_started':
      return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
    case 'generating':
      return <Badge variant="secondary" className="animate-pulse">Generating...</Badge>;
    case 'complete':
      return <Badge variant="default" className="bg-green-600">Complete</Badge>;
  }
}

function statusProgress(status: GenerationStatus): number {
  switch (status) {
    case 'not_started': return 0;
    case 'generating': return 55;
    case 'complete': return 100;
  }
}

// ---------------------------------------------------------------------------
// Sub-component: Format checklist
// ---------------------------------------------------------------------------

interface FormatChecklistProps {
  items: string[];
  status: GenerationStatus;
}

function FormatChecklist({ items, status }: FormatChecklistProps) {
  return (
    <ul className="space-y-1.5 mt-3">
      {items.map((item, idx) => {
        const done = status === 'complete';
        const inProgress = status === 'generating' && idx === 0;
        return (
          <li key={idx} className="flex items-center gap-2 text-sm">
            {done ? (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            ) : inProgress ? (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            )}
            <span className={cn(done && 'text-muted-foreground line-through')}>
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Single format card
// ---------------------------------------------------------------------------

interface FormatCardProps {
  formatName: string;
  config: FormatConfig;
  status: GenerationStatus;
  onGenerate: () => void;
}

function FormatCard({ formatName, config, status, onGenerate }: FormatCardProps) {
  const Icon = config.icon;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{config.label}</CardTitle>
          </div>
          {statusBadge(status)}
        </div>
        <CardDescription className="mt-1.5">{config.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Editor placeholder */}
        <div className="rounded-md border border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-sm text-muted-foreground min-h-[80px] flex items-center justify-center text-center">
          {config.editorPlaceholder}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{statusProgress(status)}%</span>
          </div>
          <Progress value={statusProgress(status)} className="h-2" />
        </div>

        {/* Readiness checklist */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Readiness Checklist
          </p>
          <FormatChecklist items={config.checklist} status={status} />
        </div>

        {/* Generate button */}
        <div className="mt-auto pt-2">
          <Button
            className="w-full"
            disabled={status === 'generating'}
            variant={status === 'complete' ? 'outline' : 'default'}
            onClick={onGenerate}
          >
            {status === 'generating' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating {config.label}...
              </>
            ) : status === 'complete' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Regenerate {config.label}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate {config.label}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FormatStudioRouter({
  selectedFormats,
  projectId,
  onGenerate,
}: FormatStudioRouterProps) {
  // Track per-format generation status locally
  const [statuses, setStatuses] = useState<Record<string, GenerationStatus>>({});

  const handleGenerate = useCallback(
    (formatName: string) => {
      setStatuses((prev) => ({ ...prev, [formatName]: 'generating' }));
      onGenerate?.(formatName);

      // Simulate generation completing after a delay (placeholder behaviour).
      // In production this would be driven by actual generation progress events.
      setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [formatName]: 'complete' }));
      }, 3000);
    },
    [onGenerate],
  );

  if (!selectedFormats.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <FileText className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No content formats selected.</p>
        <p className="text-xs mt-1">
          Select one or more formats in your session to see the format-specific editors.
        </p>
      </div>
    );
  }

  // Determine grid columns based on count
  const gridCols =
    selectedFormats.length === 1
      ? 'grid-cols-1 max-w-2xl mx-auto'
      : selectedFormats.length === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Format Studio</h3>
          <p className="text-sm text-muted-foreground">
            {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''} selected
            {projectId ? ` \u00b7 Project ${projectId}` : ''}
          </p>
        </div>
      </div>

      <div className={cn('grid gap-4', gridCols)}>
        {selectedFormats.map((formatName) => {
          const config = resolveFormatConfig(formatName);
          const status = statuses[formatName] ?? 'not_started';

          return (
            <FormatCard
              key={formatName}
              formatName={formatName}
              config={config}
              status={status}
              onGenerate={() => handleGenerate(formatName)}
            />
          );
        })}
      </div>
    </div>
  );
}
