import React, { useState } from 'react';
import {
  Video,
  Image,
  Share2,
  LayoutTemplate,
  Lightbulb,
  FileText,
  BookOpen,
  Link,
  Mic,
  Presentation,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

// ── Content Intents (what you want to create) ────────────────────────────

const INTENTS = [
  { id: 'product_video', label: 'Product Video', icon: Video },
  { id: 'hero_banner', label: 'Hero Banner', icon: Image },
  { id: 'social', label: 'Social Content', icon: Share2 },
  { id: 'landing', label: 'Landing Section', icon: LayoutTemplate },
] as const;

// ── Generation Modes (how to create it — input→output branching) ─────────

export interface GenerationMode {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  inputType: 'text' | 'document' | 'url' | 'audio' | 'idea';
}

const GENERATION_MODES: GenerationMode[] = [
  {
    id: 'idea_to_script',
    label: 'Idea → Script',
    description: 'Describe your idea and AI generates a full script',
    icon: Lightbulb,
    inputType: 'idea',
  },
  {
    id: 'topic_to_outline',
    label: 'Topic → Outline',
    description: 'Enter a topic and get a structured content outline',
    icon: BookOpen,
    inputType: 'text',
  },
  {
    id: 'blog_to_script',
    label: 'Blog → Script',
    description: 'Paste a blog post and convert it into a video script',
    icon: FileText,
    inputType: 'text',
  },
  {
    id: 'url_to_script',
    label: 'URL → Script',
    description: 'Import content from a URL and generate a script',
    icon: Link,
    inputType: 'url',
  },
  {
    id: 'doc_to_script',
    label: 'Document → Script',
    description: 'Upload PDF, DOCX, or PPTX and extract a script',
    icon: FileText,
    inputType: 'document',
  },
  {
    id: 'audio_to_script',
    label: 'Audio → Script',
    description: 'Upload audio/podcast and transcribe into a script',
    icon: Mic,
    inputType: 'audio',
  },
  {
    id: 'presentation_to_video',
    label: 'Slides → Video',
    description: 'Convert a presentation deck into a narrated video',
    icon: Presentation,
    inputType: 'document',
  },
];

// ── Props ────────────────────────────────────────────────────────────────

interface IntentSelectorProps {
  selectedIntent?: string;
  onSelectIntent: (intent: string) => void;
  selectedGenerationMode?: string;
  onSelectGenerationMode?: (mode: string) => void;
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onSelectIntent,
  selectedGenerationMode,
  onSelectGenerationMode,
  className,
}) => {
  const [showModes, setShowModes] = useState(!!selectedIntent);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Row 1: Content Intent */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          What are you creating?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {INTENTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onSelectIntent(id);
                setShowModes(true);
              }}
              className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${
                selectedIntent === id
                  ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-foreground'
                  : 'border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Generation Mode (collapsible) */}
      {selectedIntent && (
        <div>
          <button
            onClick={() => setShowModes(!showModes)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
          >
            How do you want to create it?
            {showModes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showModes && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {GENERATION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onSelectGenerationMode?.(mode.id)}
                  className={`rounded-lg border p-3 flex items-start gap-3 text-left transition-all ${
                    selectedGenerationMode === mode.id
                      ? 'border-blue-500/30 bg-blue-500/[0.06] text-foreground'
                      : 'border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <mode.icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium flex items-center gap-1">
                      {mode.label}
                      <ArrowRight className="w-3 h-3 opacity-50" />
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                      {mode.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
