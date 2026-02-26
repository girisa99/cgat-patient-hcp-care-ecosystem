/**
 * FORMAT STUDIO ROUTER
 *
 * Renders format-aware editor interfaces based on selected content formats.
 * All format metadata (label, description, icon, checklist, editor placeholder)
 * is pulled from the DB via useCastContentRegistry — no hardcoded FORMAT_REGISTRY.
 *
 * Each format gets its own Card with:
 * - Format icon and label (from DB)
 * - Editor description / placeholder (from DB)
 * - Format-specific readiness checklist (from DB)
 * - Generate button with status indicator
 */

import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
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
  Smile,
  MonitorSmartphone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useCastContentRegistry, type ContentFormat } from '@/hooks/useCastContentRegistry';

// Lazy-loaded format-specific editors
const LazyPodcastEditor = lazy(() => import('./PodcastEditorPanel'));
const LazySlideComposer = lazy(() => import('./SlideComposer'));

// Format name patterns that trigger specialized editors
const PODCAST_FORMATS = ['podcast', 'audio_podcast', 'interview_podcast', 'panel_discussion', 'dialogue'];
const PRESENTATION_FORMATS = ['presentation', 'slide_deck', 'pitch_deck', 'webinar', 'keynote'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GenerationStatus = 'not_started' | 'generating' | 'complete';

interface FormatStudioRouterProps {
  selectedFormats: string[];
  projectId?: string;
  /** Called when user clicks Generate. Returns a Promise — status updates
   *  when the promise resolves (complete) or rejects (error). */
  onGenerate?: (formatName: string) => void | Promise<void>;
  /** External status overrides (e.g., from production pipeline events) */
  externalStatuses?: Record<string, GenerationStatus>;
  /** External progress per format (0-100) from production pipeline */
  externalProgress?: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Icon resolver: maps DB icon name strings to Lucide components
// New icons can be added here when new formats use them, or falls back to
// FileText for any unrecognized icon name.
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ElementType> = {
  Video,
  Film: Video,
  Mic,
  Mic2: Mic,
  Radio,
  Globe,
  BarChart3,
  BookOpen,
  Book: BookOpen,
  Users,
  Mail,
  Calendar,
  FileText,
  FileCheck: FileText,
  Presentation,
  Smile,
  MonitorSmartphone,
  // Common aliases
  Monitor: MonitorSmartphone,
  Gamepad2: Play,
  ShoppingCart: Globe,
  Clapperboard: Video,
  Wand2: Play,
  Package: Globe,
  Layout: Globe,
  Image: Globe,
  MousePointer: Globe,
  Library: BookOpen,
  PlayCircle: Play,
  Workflow: Users,
  GitBranch: Users,
  Repeat: Mail,
  Newspaper: Mail,
  UserPlus: Users,
  HelpCircle: BookOpen,
  Music: Mic,
  Sparkles: Play,
  ClipboardCheck: FileText,
  Award: FileText,
  Target: BarChart3,
  Drama: Mic,
};

function resolveIcon(iconName: string | null | undefined): React.ElementType {
  if (!iconName) return FileText;
  return ICON_MAP[iconName] || FileText;
}

// ---------------------------------------------------------------------------
// Default fallbacks when DB columns are null (for newly created formats
// that haven't had their UI metadata filled in yet)
// ---------------------------------------------------------------------------

const DEFAULT_PLACEHOLDER = 'Content editor will render here. Build and configure content for this format.';
const DEFAULT_CHECKLIST = ['Content created', 'Quality review passed', 'Assets embedded', 'Ready for export'];

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
  format: ContentFormat;
  status: GenerationStatus;
  progress: number;
  onGenerate: () => void;
}

function FormatCard({ formatName, format, status, progress, onGenerate }: FormatCardProps) {
  const Icon = resolveIcon(format.icon);
  const checklist = format.checklist?.length ? format.checklist : DEFAULT_CHECKLIST;
  const placeholder = format.editor_placeholder || DEFAULT_PLACEHOLDER;

  // Determine if this format has a specialized editor
  const isPodcast = PODCAST_FORMATS.some(p => formatName.toLowerCase().includes(p));
  const isPresentation = PRESENTATION_FORMATS.some(p => formatName.toLowerCase().includes(p));
  const hasSpecializedEditor = isPodcast || isPresentation;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-md', format.color ? `bg-opacity-10` : 'bg-primary/10')}>
              <Icon className={cn('h-5 w-5', format.color || 'text-primary')} />
            </div>
            <CardTitle className="text-lg">{format.label}</CardTitle>
          </div>
          {statusBadge(status)}
        </div>
        {format.description && (
          <CardDescription className="mt-1.5">{format.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Format-specific editor or generic placeholder */}
        {hasSpecializedEditor ? (
          <Suspense fallback={<div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}>
            {isPodcast && <LazyPodcastEditor topic={format.label} />}
            {isPresentation && <LazySlideComposer deckTitle={format.label} />}
          </Suspense>
        ) : (
          <div className="rounded-md border border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-sm text-muted-foreground min-h-[80px] flex items-center justify-center text-center">
            {placeholder}
          </div>
        )}

        {/* Progress bar — uses real progress from pipeline, not static mapping */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Readiness checklist */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Readiness Checklist
          </p>
          <FormatChecklist items={checklist} status={status} />
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
                Generating {format.label}...
              </>
            ) : status === 'complete' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Regenerate {format.label}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate {format.label}
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
  externalStatuses,
  externalProgress,
}: FormatStudioRouterProps) {
  const contentRegistry = useCastContentRegistry();

  // Track per-format generation status locally
  const [statuses, setStatuses] = useState<Record<string, GenerationStatus>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});

  // Build a name→ContentFormat lookup from DB data
  const formatsByName = useMemo(() => {
    const map: Record<string, ContentFormat> = {};
    for (const fmt of contentRegistry.formats) {
      map[fmt.name] = fmt;
    }
    return map;
  }, [contentRegistry.formats]);

  // Merge external statuses when provided (from production pipeline)
  const mergedStatuses = useMemo(() => ({
    ...statuses,
    ...(externalStatuses || {}),
  }), [statuses, externalStatuses]);

  const mergedProgress = useMemo(() => ({
    ...progress,
    ...(externalProgress || {}),
  }), [progress, externalProgress]);

  const handleGenerate = useCallback(
    async (formatName: string) => {
      setStatuses((prev) => ({ ...prev, [formatName]: 'generating' }));
      setProgress((prev) => ({ ...prev, [formatName]: 0 }));

      try {
        // Call the real production handler — async, driven by pipeline events
        await onGenerate?.(formatName);
        setStatuses((prev) => ({ ...prev, [formatName]: 'complete' }));
        setProgress((prev) => ({ ...prev, [formatName]: 100 }));
      } catch {
        // On error, reset to not_started so user can retry
        setStatuses((prev) => ({ ...prev, [formatName]: 'not_started' }));
        setProgress((prev) => ({ ...prev, [formatName]: 0 }));
      }
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
          // Look up from DB; fall back to a synthetic entry for unknown names
          const format: ContentFormat = formatsByName[formatName] ?? {
            id: formatName,
            name: formatName,
            label: formatName.charAt(0).toUpperCase() + formatName.slice(1).replace(/_/g, ' '),
            icon: 'FileText',
            color: 'text-primary',
            description: null,
            requires_messaging: false,
            requires_tts: false,
            requires_video: false,
            enrichment_config: {},
            editor_placeholder: DEFAULT_PLACEHOLDER,
            checklist: DEFAULT_CHECKLIST,
            sort_order: 99,
            is_active: true,
          };
          const status = mergedStatuses[formatName] ?? 'not_started';
          const formatProgress = mergedProgress[formatName] ?? statusProgress(status);

          return (
            <FormatCard
              key={formatName}
              formatName={formatName}
              format={format}
              status={status}
              progress={formatProgress}
              onGenerate={() => handleGenerate(formatName)}
            />
          );
        })}
      </div>
    </div>
  );
}
