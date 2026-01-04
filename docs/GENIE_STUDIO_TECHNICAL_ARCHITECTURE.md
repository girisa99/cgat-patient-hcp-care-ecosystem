# Genie Studio & Recording Studio: Technical Architecture

> **Version:** 1.0  
> **Last Updated:** 2026-01-04  
> **Scope:** P0-P2 Implementation | P3-P4 Roadmap

---

## Table of Contents

1. [System Overview](#system-overview)
2. [P0 Core Architecture](#p0-core-architecture)
3. [P1 Essential Architecture](#p1-essential-architecture)
4. [P2 Important Architecture](#p2-important-architecture)
5. [P3-P4 Future Roadmap](#p3-p4-future-roadmap)
6. [Component Diagrams](#component-diagrams)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [API Specifications](#api-specifications)
9. [Database Schema](#database-schema)
10. [Integration Points](#integration-points)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              GENIE STUDIO ECOSYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────┐      ┌─────────────────────────────────────┐   │
│  │       GENIE STUDIO              │      │       RECORDING STUDIO              │   │
│  │     (Pre-Production)            │◄────►│        (Production)                 │   │
│  │                                 │      │                                     │   │
│  │  • Script Editor                │      │  • Video Capture                    │   │
│  │  • TTS Generation               │      │  • Teleprompter                     │   │
│  │  • AI Enhancement               │      │  • Audio Mixer                      │   │
│  │  • Template Library             │      │  • Recording Controls               │   │
│  │  • Media Library                │      │  • Export Engine                    │   │
│  │  • Show Scheduling              │      │  • Recording Library                │   │
│  └─────────────────────────────────┘      └─────────────────────────────────────┘   │
│                    │                                        │                        │
│                    └────────────────┬───────────────────────┘                        │
│                                     │                                                │
│  ┌──────────────────────────────────▼──────────────────────────────────────────┐    │
│  │                         SHARED SERVICES LAYER                                │    │
│  │                                                                              │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐             │    │
│  │  │  Lovable   │  │ ElevenLabs │  │   FFmpeg   │  │  IndexedDB │             │    │
│  │  │     AI     │  │    TTS     │  │   .wasm    │  │  Storage   │             │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘             │    │
│  │                                                                              │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐             │    │
│  │  │   Web      │  │   Media    │  │  Supabase  │  │   Edge     │             │    │
│  │  │  Audio API │  │ Recorder   │  │  Storage   │  │ Functions  │             │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘             │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI Components |
| **Styling** | Tailwind CSS + shadcn/ui | Design System |
| **State** | React Hooks + Context | Local State |
| **Data Fetching** | TanStack Query | Server State |
| **Audio** | Web Audio API | Real-time Mixing |
| **Video** | MediaRecorder API | Capture |
| **Processing** | FFmpeg.wasm | In-browser Transcoding |
| **AI** | Lovable AI Gateway | Script Generation |
| **TTS** | ElevenLabs + OpenAI | Voice Generation |
| **Storage** | IndexedDB + Supabase | Persistence |
| **Backend** | Supabase Edge Functions | Server Logic |

---

## P0 Core Architecture

### Implemented Scenarios: 1-4, 7-10

### P0.1 Script Generation Pipeline

**Scenario 1: Text Prompt → Script → Video**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         SCRIPT GENERATION PIPELINE                            │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   USER INPUT       │───►│   AI PROCESSING    │───►│   SCRIPT OUTPUT    │
│                    │    │                    │    │                    │
│ • Text Prompt      │    │ • Lovable AI       │    │ • Formatted Script │
│ • Template Select  │    │ • gemini-2.5-flash │    │ • Timing Markers   │
│ • Context Data     │    │ • Prompt Engineering│   │ • Word Count Stats │
└────────────────────┘    └────────────────────┘    └────────────────────┘
                                    │
                                    ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   TTS GENERATION   │───►│   AUDIO MIXING     │───►│   VIDEO ASSEMBLY   │
│                    │    │                    │    │                    │
│ • ElevenLabs API   │    │ • Web Audio API    │    │ • MediaRecorder    │
│ • OpenAI TTS       │    │ • Volume Control   │    │ • FFmpeg Export    │
│ • Voice Selection  │    │ • Background Music │    │ • MP4/WebM Output  │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

**Component Structure:**

```typescript
// src/pages/GenieStudio.tsx - Main Orchestrator
GenieStudio
├── ScriptEditorTab         // Script creation and editing
│   ├── TemplateSelector    // Pre-built templates
│   ├── AIEnhancer          // Script improvement
│   └── StatisticsPanel     // Word count, reading time
├── VoiceSelector           // TTS voice selection
├── SavedAudioCard          // Generated audio management
└── useGenieScripts         // Script state management

// src/components/document-processing/RecordingStudio/
RecordingStudio
├── FloatingTeleprompter    // Script display with sync
├── FloatingAudioMixer      // Multi-channel audio
├── RecordingControls       // Start/stop/countdown
├── VideoPreview            // Camera/screen preview
└── useRecording            // Recording state machine
```

### P0.2 Manual Recording Pipeline

**Scenario 3: Script Only → Manual Record**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        MANUAL RECORDING PIPELINE                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SCRIPT    │────►│ TELEPROMPTER│────►│  RECORDING  │────►│   EXPORT    │
│   LOADED    │     │    SYNC     │     │   CAPTURE   │     │   ENGINE    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ • Clean     │     │ • Auto-     │     │ • Camera    │     │ • MP4       │
│   content   │     │   scroll    │     │ • Screen    │     │ • WebM      │
│ • Timing    │     │ • Speed     │     │ • PiP       │     │ • Audio     │
│   cues      │     │   control   │     │ • Audio mix │     │ • SRT       │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### P0.3 Template System

**Scenario 6: Template → Customize → Video**

```typescript
// Template Configuration
interface ScriptTemplate {
  id: string;
  name: string;
  category: 'Marketing' | 'Education' | 'Corporate' | 'Podcast' | 'Webcast' | 'Broadcast';
  type: 'video' | 'audio' | 'podcast' | 'webcast' | 'broadcast';
  content: string;           // Template with placeholders
  icon?: LucideIcon;
  estimatedDuration?: number;
}

// Implemented Templates (src/pages/GenieStudio.tsx lines 138-580)
const SCRIPT_TEMPLATES = [
  { id: 'product-demo', category: 'Marketing', type: 'video' },
  { id: 'tutorial', category: 'Education', type: 'video' },
  { id: 'announcement', category: 'Corporate', type: 'video' },
  { id: 'explainer', category: 'Education', type: 'video' },
  { id: 'testimonial', category: 'Marketing', type: 'video' },
  { id: 'podcast-episode', category: 'Podcast', type: 'podcast' },
  { id: 'webcast-webinar', category: 'Webcast', type: 'webcast' },
  { id: 'live-broadcast', category: 'Broadcast', type: 'broadcast' },
];
```

### P0.4 Document Processing Pipeline

**Scenarios 7-8: Document/PPT → Script → Video**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      DOCUMENT PROCESSING PIPELINE                             │
└──────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │   FILE UPLOAD       │
                        │  (PPT/PDF/DOCX)     │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
           ┌────────────┐  ┌────────────┐  ┌────────────┐
           │    PPT     │  │    PDF     │  │   DOCX     │
           │  Extractor │  │   Parser   │  │   Parser   │
           └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
                 │               │               │
                 └───────────────┼───────────────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │   CONTENT ANALYSIS  │
                    │  • Structure detect │
                    │  • Key points       │
                    │  • Section breaks   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   AI SCRIPT GEN     │
                    │  • Context aware    │
                    │  • Format preserve  │
                    │  • Timing estimate  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   → TTS → VIDEO     │
                    │   (Standard flow)   │
                    └─────────────────────┘
```

### P0 Data Models

```typescript
// Core Data Types

interface GenieProject {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed';
  scripts: GenieScript[];
  recordings: Recording[];
  assets: MediaAsset[];
  createdAt: Date;
  updatedAt: Date;
}

interface GenieScript {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'audio' | 'podcast' | 'webcast' | 'broadcast';
  enhancedContent?: string;
  cleanContent?: string;  // For TTS (markers stripped)
  stats: {
    wordCount: number;
    sentenceCount: number;
    characterCount: number;
    estimatedReadingMinutes: number;
    estimatedSpeakingMinutes: number;
    readabilityScore: 'easy' | 'moderate' | 'difficult';
  };
  voiceoverId?: string;
  hasVoiceover: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Recording {
  id: string;
  projectId: string;
  scriptId?: string;
  blob: Blob;
  type: 'video' | 'audio';
  format: 'mp4' | 'webm' | 'mp3' | 'wav';
  duration: number;
  size: number;
  metadata: RecordingMetadata;
  createdAt: Date;
}

interface TTSGeneration {
  id: string;
  scriptId: string;
  provider: 'elevenlabs' | 'openai';
  voiceId: string;
  audioUrl: string;
  duration: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
}
```

---

## P1 Essential Architecture

### Implemented Scenarios: 5-6, 11-16, 21-24

### P1.1 Voice Cloning Pipeline (Planned)

**Scenario 5: Voice Clone → Script → Video**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        VOICE CLONING PIPELINE                                 │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  VOICE SAMPLE   │────►│  CLONE ENGINE   │────►│  CLONED VOICE   │
│                 │     │                 │     │                 │
│ • 30sec+ audio  │     │ • ElevenLabs    │     │ • Voice profile │
│ • Clean quality │     │   Instant Clone │     │ • Ready for TTS │
│ • Single speaker│     │ • Processing    │     │ • Persistent ID │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────────────────────────────┐
                        │       STANDARD TTS PIPELINE             │
                        │  (Use cloned voice instead of preset)   │
                        └─────────────────────────────────────────┘
```

### P1.2 Recording Refinement Loops

**Scenarios 21-24: Record → Refine Cycles**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      RECORDING REFINEMENT LOOP                                │
└──────────────────────────────────────────────────────────────────────────────┘

         ┌─────────────────────────────────────────────────────┐
         │                                                     │
         ▼                                                     │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FIRST TAKE    │────►│   AI REVIEW     │────►│   FEEDBACK      │
│                 │     │                 │     │                 │
│ • Raw recording │     │ • Transcribe    │     │ • Issue markers │
│ • Full duration │     │ • Analyze pace  │     │ • Suggestions   │
│ • All audio     │     │ • Detect fillers│     │ • Timestamps    │
└─────────────────┘     └─────────────────┘     └──────┬──────────┘
                                                       │
         ┌─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SELECTIVE     │────►│   AI POLISH     │────►│   FINAL OUTPUT  │
│   RE-RECORD     │     │                 │     │                 │
│                 │     │ • Remove fillers│     │ • Polished video│
│ • Section only  │     │ • Fix pacing    │     │ • Clean audio   │
│ • TTS fill gaps │     │ • Normalize vol │     │ • Chapters      │
│ • Punch-in mode │     │ • Add transitions│    │ • Multi-format  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                                │
         └────────────────────────────────────────────────┘
                        (Iterate until satisfied)
```

### P1.3 Asset Transformation Pipeline

**Scenarios 11-16: Upload → Production**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     ASSET TRANSFORMATION PIPELINE                             │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           INPUT PROCESSORS                                    │
├──────────────────┬───────────────────┬───────────────────┬───────────────────┤
│   Raw Video      │    Images + Text  │   Multiple Files  │   Audio Only      │
│   Processor      │    Combiner       │   Merger          │   Visualizer      │
└────────┬─────────┴─────────┬─────────┴─────────┬─────────┴─────────┬─────────┘
         │                   │                   │                   │
         └───────────────────┴───────────────────┴───────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │      TRANSFORMATION ENGINE      │
                    │                                │
                    │  • AI Content Analysis         │
                    │  • Automatic Arrangement       │
                    │  • Transition Generation       │
                    │  • B-Roll Suggestion          │
                    │  • Chapter Detection          │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │        OUTPUT OPTIONS          │
                    │                                │
                    │  • Full Video                  │
                    │  • Short Clips                 │
                    │  • Audio Extract               │
                    │  • Transcript/Captions         │
                    └────────────────────────────────┘
```

---

## P2 Important Architecture

### Scenarios: 17-20, 25-32

### P2.1 Reverse Engineering Pipeline

**Scenarios 17-20: Video → Script → Enhance**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    REVERSE ENGINEERING PIPELINE                               │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  EXISTING VIDEO │────►│   TRANSCRIPTION │────►│  SCRIPT FORMAT  │
│                 │     │                 │     │                 │
│ • Any format    │     │ • Whisper API   │     │ • Structured    │
│ • Any quality   │     │ • Speaker ID    │     │ • Timing marks  │
│ • Any language  │     │ • Timestamps    │     │ • Sections      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                    ┌────────────────────────────────────┼────────────────────┐
                    │                                    │                    │
                    ▼                                    ▼                    ▼
           ┌────────────────┐               ┌────────────────┐      ┌────────────────┐
           │    ENHANCE     │               │   TRANSLATE    │      │   REPURPOSE    │
           │                │               │                │      │                │
           │ • AI rewrite   │               │ • Multi-lang   │      │ • Chunk into   │
           │ • Better flow  │               │ • TTS in new   │      │   shorts       │
           │ • Fix errors   │               │   language     │      │ • Platform cuts│
           └────────┬───────┘               └────────┬───────┘      └────────┬───────┘
                    │                                │                       │
                    ▼                                ▼                       ▼
           ┌────────────────┐               ┌────────────────┐      ┌────────────────┐
           │   RE-RECORD    │               │  DUBBED VIDEO  │      │ MULTIPLE VIDEOS│
           └────────────────┘               └────────────────┘      └────────────────┘
```

### P2.2 Cross-Studio Integration

**Scenarios 25-32: Hybrid Flows**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     CROSS-STUDIO INTEGRATION                                  │
└──────────────────────────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────────────────────────────────────┐
     │                        SHARED STATE LAYER                           │
     │                                                                     │
     │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
     │  │   Project     │  │    Assets     │  │   Versions    │           │
     │  │   Context     │  │   Library     │  │   History     │           │
     │  └───────────────┘  └───────────────┘  └───────────────┘           │
     └─────────────────────────────────────────────────────────────────────┘
                    │                   │                   │
         ┌──────────┘                   │                   └──────────┐
         │                              │                              │
         ▼                              ▼                              ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│  GENIE STUDIO   │◄────────►│  SYNC ENGINE    │◄────────►│RECORDING STUDIO │
│                 │          │                 │          │                 │
│ • Edit script   │          │ • Real-time     │          │ • Record        │
│ • Generate TTS  │          │   updates       │          │ • Review        │
│ • AI enhance    │          │ • Conflict      │          │ • Export        │
│                 │          │   resolution    │          │                 │
└─────────────────┘          └─────────────────┘          └─────────────────┘
         │                                                         │
         └─────────────────────────────────────────────────────────┘
                              ROUND-TRIP FLOW
```

### P2.3 Version Management

```typescript
// Version Control Architecture

interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;  // Semantic versioning
  type: 'auto' | 'manual' | 'milestone';
  snapshot: {
    scripts: GenieScript[];
    recordings: RecordingRef[];
    assets: AssetRef[];
  };
  changes: VersionChange[];
  createdAt: Date;
  createdBy: string;
}

interface VersionChange {
  type: 'script_edit' | 'recording_add' | 'asset_add' | 'setting_change';
  path: string;
  before?: any;
  after?: any;
  timestamp: Date;
}

// Diff Visualization
interface ScriptDiff {
  additions: TextRange[];
  deletions: TextRange[];
  modifications: TextRange[];
  summary: string;
}
```

---

## P3-P4 Future Roadmap

### P3 Differentiators (Planned)

| Feature | Architecture | Dependencies | Effort |
|---------|--------------|--------------|--------|
| **Bulk Video Generation** | Batch processor + Template engine | Queue system | 3 weeks |
| **Auto Shot List** | AI scene analysis | Vision model | 2 weeks |
| **Legal Review Gate** | Workflow engine + Role system | Approval API | 4 weeks |
| **Compliance Check** | Pattern detection + NER | ML models | 4 weeks |
| **HIPAA Redaction** | PHI detection + Blur engine | ML + FFmpeg | 5 weeks |
| **Accessibility** | Caption gen + Audio desc | Whisper + AI | 3 weeks |

### P4 Future (Roadmap)

| Feature | Architecture | Dependencies | Effort |
|---------|--------------|--------------|--------|
| **Multi-language** | Translation pipeline | Google/DeepL API | 4 weeks |
| **Voice Dubbing** | Lip sync engine | ML + FFmpeg | 6 weeks |
| **Real-time Collab** | WebSocket sync | CRDT library | 8 weeks |
| **Recovery System** | Cache + Retry logic | IndexedDB | 2 weeks |

---

## Component Diagrams

### Frontend Component Hierarchy

```
App
└── GenieStudio (Page)
    ├── Header
    │   ├── ProjectSelector
    │   └── ActionButtons
    ├── MainContent
    │   ├── Tabs
    │   │   ├── ScriptsTab
    │   │   │   ├── ScriptEditorTab
    │   │   │   ├── TemplateSelector
    │   │   │   ├── VoiceSelector
    │   │   │   └── SavedScriptsList
    │   │   ├── MediaTab
    │   │   │   ├── SavedAudioCard[]
    │   │   │   └── MediaUploader
    │   │   ├── ShowsTab
    │   │   │   ├── ShowScheduler
    │   │   │   └── ParticipantManager
    │   │   └── ArchitectureTab
    │   │       └── DiagramViewer
    │   └── SidePanel (conditional)
    └── Dialogs
        └── RecordingStudio (Modal/Popout)
            ├── VideoPreview
            ├── FloatingTeleprompter
            ├── FloatingAudioMixer
            ├── RecordingControls
            └── ExportPanel
```

### Hook Dependencies

```
useGenieStudio (orchestrator)
├── useGenieScripts
│   ├── useState (scripts)
│   ├── useCallback (CRUD ops)
│   └── useEffect (persistence)
├── useGenieMediaLibrary
│   ├── useRecordingLibrary
│   │   └── IndexedDB operations
│   └── useQuery (Supabase)
├── useTTSGeneration
│   ├── ElevenLabs API
│   ├── OpenAI API
│   └── useCallback (generate)
└── useMediaProject
    ├── useState (project)
    └── useCallback (sync)

useRecordingStudio (orchestrator)
├── useRecording
│   ├── MediaRecorder
│   └── State machine
├── useCamera
│   └── getUserMedia
├── useScreenShare
│   └── getDisplayMedia
├── useAudioPlayback
│   └── Web Audio API
├── useBackgroundBlur
│   └── ML model
├── useScriptVersions
│   └── Version history
└── useKeyboardShortcuts
    └── Event listeners
```

---

## Data Flow Diagrams

### Script Creation Flow

```
User Types Text
       │
       ▼
┌─────────────────┐
│ ScriptEditorTab │
│   onChange()    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useGenieScripts │
│  updateScript() │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌────────────┐
│ State  │  │ Debounced  │
│ Update │  │ Persist    │
└────────┘  └─────┬──────┘
                  │
                  ▼
         ┌────────────────┐
         │   IndexedDB    │
         │   (local)      │
         └────────────────┘
```

### TTS Generation Flow

```
User Clicks "Generate"
         │
         ▼
┌─────────────────────┐
│  useTTSGeneration   │
│    generate()       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Edge Function     │
│  /tts-generation    │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌─────────┐
│ElevenLabs│ │ OpenAI  │
│   API    │ │   API   │
└────┬─────┘ └────┬────┘
     │            │
     └─────┬──────┘
           │
           ▼
┌─────────────────────┐
│   Audio Blob        │
│   returned          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Save to Library   │
│   (IndexedDB +      │
│    Supabase)        │
└─────────────────────┘
```

### Recording Flow

```
User Starts Recording
         │
         ▼
┌─────────────────────┐
│   useRecording      │
│   startRecording()  │
└──────────┬──────────┘
           │
     ┌─────┼─────┐
     │     │     │
     ▼     ▼     ▼
┌───────┐ ┌───────┐ ┌───────┐
│Camera │ │Screen │ │ Audio │
│Stream │ │Share  │ │ Mixer │
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    └─────────┼─────────┘
              │
              ▼
    ┌─────────────────────┐
    │   MediaRecorder     │
    │   (composite)       │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │   ondataavailable   │
    │   (chunks)          │
    └──────────┬──────────┘
               │
    User Stops │
               ▼
    ┌─────────────────────┐
    │   Create Blob       │
    │   (MP4/WebM)        │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │   FFmpeg Process    │
    │   (if needed)       │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │   Save to Library   │
    └─────────────────────┘
```

---

## API Specifications

### Edge Functions

| Function | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/tts-generation` | POST | Generate speech from text | Required |
| `/script-enhance` | POST | AI-enhance script content | Required |
| `/transcribe` | POST | Transcribe audio to text | Required |
| `/document-parse` | POST | Extract content from docs | Required |

### TTS Generation API

```typescript
// Request
POST /functions/v1/tts-generation
{
  "text": "Script content to speak",
  "provider": "elevenlabs" | "openai",
  "voiceId": "voice-identifier",
  "settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "speed": 1.0
  }
}

// Response
{
  "success": true,
  "audioUrl": "data:audio/mp3;base64,...",
  "duration": 45.2,
  "characterCount": 450
}
```

### Script Enhancement API

```typescript
// Request
POST /functions/v1/script-enhance
{
  "script": "Original script content",
  "type": "video" | "podcast" | "webcast",
  "instructions": "Make it more conversational",
  "targetAudience": "professionals",
  "tone": "friendly"
}

// Response
{
  "enhanced": "Enhanced script content...",
  "changes": [
    { "type": "rewrite", "before": "...", "after": "..." }
  ],
  "stats": {
    "originalWords": 150,
    "enhancedWords": 175,
    "readabilityImprovement": 15
  }
}
```

---

## Database Schema

### Current Tables

```sql
-- genie_projects (planned)
CREATE TABLE genie_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- genie_scripts (planned)
CREATE TABLE genie_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES genie_projects,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  enhanced_content TEXT,
  clean_content TEXT,
  type TEXT DEFAULT 'video',
  stats JSONB DEFAULT '{}',
  has_voiceover BOOLEAN DEFAULT false,
  voiceover_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- genie_recordings (planned)
CREATE TABLE genie_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES genie_projects,
  script_id UUID REFERENCES genie_scripts,
  user_id UUID REFERENCES auth.users NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT DEFAULT 'video',
  format TEXT DEFAULT 'mp4',
  duration DECIMAL,
  size BIGINT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- genie_tts_generations (planned)
CREATE TABLE genie_tts_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES genie_scripts,
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration DECIMAL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### IndexedDB Schema (Current)

```typescript
// RecordingStudioDB
interface RecordingStudioDB {
  recordings: {
    key: string;  // UUID
    value: {
      id: string;
      name: string;
      blob: Blob;
      type: 'video' | 'audio';
      format: string;
      duration: number;
      size: number;
      scriptId?: string;
      createdAt: number;
      metadata: {
        originalScript?: string;
        scriptType?: string;
      };
    };
    indexes: {
      'by-date': number;
      'by-script': string;
    };
  };
}
```

---

## Integration Points

### External Services

| Service | Purpose | Status | Notes |
|---------|---------|--------|-------|
| **Lovable AI Gateway** | Script generation, enhancement | ✅ Active | Rate limited |
| **ElevenLabs** | Premium TTS voices | ✅ Active | API key required |
| **OpenAI TTS** | Fallback TTS | ✅ Active | API key required |
| **Supabase Storage** | File storage | ✅ Active | Auto-configured |
| **FFmpeg.wasm** | Video processing | ✅ Active | Client-side |
| **Whisper** | Transcription | 🔶 Partial | Via edge function |

### Internal Integration Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION POINTS                                    │
└──────────────────────────────────────────────────────────────────────────────┘

  Document Processing ◄────────────────────► Genie Studio
        │                                         │
        │  • PDF/DOCX parsed content             │
        │  • Extracted text for scripts          │
        │                                         │
        ▼                                         ▼
  ┌─────────────┐                        ┌─────────────┐
  │   Agent     │◄───────────────────────│  Recording  │
  │   System    │                        │   Studio    │
  └─────────────┘                        └─────────────┘
        │                                         │
        │  • Automated workflows                 │
        │  • AI agent orchestration              │
        │                                         │
        └──────────────────┬──────────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │    Knowledge    │
                 │      Base       │
                 └─────────────────┘
                           │
                           │  • RAG context
                           │  • Historical data
                           │
                           ▼
                 ┌─────────────────┐
                 │   Supabase      │
                 │   (Storage +    │
                 │    Database)    │
                 └─────────────────┘
```

---

## Next Steps

### Immediate (P0 Completion)
1. Add image generation to pipeline (Scenario 2)
2. Implement URL scraping (Scenario 9)
3. Add transcription for audio input (Scenario 10)

### Short-term (P1)
1. Voice cloning integration (Scenario 5)
2. Recording refinement UI (Scenarios 21-24)
3. B-roll integration (Scenario 14)

### Medium-term (P2)
1. Video → Script extraction (Scenario 17)
2. Cross-studio sync (Scenarios 25-26)
3. Version comparison UI (Scenario 28)

---

*Document maintained by Genie Studio Architecture Team*
