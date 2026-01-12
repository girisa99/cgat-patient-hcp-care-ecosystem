# Genie Vibe: Module Architecture

> **Version:** 1.0  
> **Last Updated:** 2026-01-12  
> **Tagline:** "Feel the Flow"  
> **Status:** ✅ Production Ready

---

## Overview

Genie Vibe is the creative production layer of Genie Studio, responsible for video recording, audio mixing, and content export across mobile, desktop, and full studio modes.

---

## Module Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    GENIE VIBE                                                 │
│                               "Feel the Flow"                                                 │
│                              Production Layer                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌────────────────────────┐
                              │    DEPLOYMENT MODES    │
                              └───────────┬────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
    │   📱 MOBILE     │         │   🖥️ DESKTOP    │         │   🎬 FULL STUDIO│
    │                 │         │                 │         │                 │
    │ • One-tap rec   │         │ • Full features │         │ • Multi-source  │
    │ • Touch gestures│         │ • Keyboard nav  │         │ • AI agents     │
    │ • Offline mode  │         │ • Split views   │         │ • Collaboration │
    │ • Quick export  │         │ • Pro controls  │         │ • Team workflow │
    └────────┬────────┘         └────────┬────────┘         └────────┬────────┘
             │                           │                           │
             └───────────────────────────┼───────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              RECORDING STUDIO CORE                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐                   │
│   │  VIDEO CAPTURE    │    │  AUDIO MIXING     │    │   TELEPROMPTER    │                   │
│   │                   │    │                   │    │                   │                   │
│   │ • Camera (front/  │    │ • Mic input       │    │ • Script display  │                   │
│   │   rear)           │    │ • TTS playback    │    │ • Speed control   │                   │
│   │ • Screen capture  │    │ • Music layer     │    │ • Section markers │                   │
│   │ • PiP mode        │    │ • SFX layer       │    │ • Sync scroll     │                   │
│   │ • Background blur │    │ • Master mix      │    │ • Original/Enh    │                   │
│   └───────────────────┘    └───────────────────┘    └───────────────────┘                   │
│                                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────────────────────┐ │
│   │                            RECORDING CONTROLS                                          │ │
│   │  [🔴 Record] [⏸️ Pause] [⏹️ Stop] [🔄 Retake] [⏱️ Timer] [📊 Levels]                   │ │
│   └───────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              P2 AI AGENTS (6 TOTAL)                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │   VOICE     │  │   SCENE     │  │   SCRIPT    │  │   MUSIC     │  │   AUTO      │       │
│   │  DIRECTOR   │  │  ANALYZER   │  │   MATCHER   │  │  COMPOSER   │  │   EDITOR    │       │
│   │             │  │             │  │             │  │             │  │             │       │
│   │ • Coaching  │  │ • Frame AI  │  │ • Embedding │  │ • Generate  │  │ • Trim      │       │
│   │ • Feedback  │  │ • Shot type │  │ • Match     │  │ • SFX       │  │ • Cuts      │       │
│   │ • TTS style │  │ • B-roll    │  │ • Arrange   │  │ • Ambient   │  │ • Effects   │       │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                                               │
│   ┌──────────────────────────────────────────────────────────────────┐                       │
│   │                        DISTRIBUTION AGENT                         │                       │
│   │  • YouTube • TikTok • Instagram • LinkedIn • Twitter • Export    │                       │
│   └──────────────────────────────────────────────────────────────────┘                       │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              7-PHASE GUIDED EXPERIENCE                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   Phase 1      Phase 2      Phase 3      Phase 4      Phase 5      Phase 6      Phase 7     │
│  ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐    │
│  │RECORD│────►│ANALYZE────►│ORGANIZE───►│ EDIT │────►│ENHANCE────►│MUSIC │────►│DISTRIB│   │
│  │      │     │      │     │      │     │      │     │      │     │      │     │      │    │
│  │Voice │     │Scene │     │Script│     │ Auto │     │  AI  │     │Music │     │Multi │    │
│  │Direct│     │Analyz│     │Match │     │Editor│     │Assist│     │Compos│     │Platf │    │
│  └──────┘     └──────┘     └──────┘     └──────┘     └──────┘     └──────┘     └──────┘    │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              EXPORT & PUBLISHING                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐                   │
│   │   FILE EXPORT     │    │   CLOUD STORAGE   │    │   SOCIAL PUBLISH  │                   │
│   │                   │    │                   │    │                   │                   │
│   │ • MP4 (H.264)     │    │ • Supabase        │    │ • YouTube         │                   │
│   │ • WebM (VP9)      │    │ • Google Drive    │    │ • TikTok          │                   │
│   │ • Audio only      │    │ • Dropbox         │    │ • Instagram       │                   │
│   │ • GIF             │    │ • S3              │    │ • LinkedIn        │                   │
│   └───────────────────┘    └───────────────────┘    └───────────────────┘                   │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Mode Comparison

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              VIBE DEPLOYMENT MODES                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    📱 MOBILE MODE                                             │
│                              "Record Anywhere, Anytime"                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   Features:                          UI Layout:                                               │
│   ✅ One-tap recording               ┌─────────────────────────┐                             │
│   ✅ Touch gestures                  │ ┌───────────────────┐   │                             │
│   ✅ Offline recording               │ │                   │   │                             │
│   ✅ PWA + Native app                │ │   Camera View     │   │                             │
│   ✅ Location tagging                │ │                   │   │                             │
│   ✅ Quick templates                 │ │                   │   │                             │
│   ✅ Social sharing                  │ └───────────────────┘   │                             │
│   ⏳ Voice commands                  │ ┌─────┬─────┬─────┐     │                             │
│                                      │ │ 🔴  │ ⏸️  │ 📤  │     │                             │
│   Target: Creator, Traveler         │ └─────┴─────┴─────┘     │                             │
│   Screen: < 768px                    └─────────────────────────┘                             │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🖥️ DESKTOP MODE                                            │
│                              "Professional Control"                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   Features:                          UI Layout:                                               │
│   ✅ Full keyboard nav               ┌─────────────────────────────────────────────┐         │
│   ✅ Split-screen views              │ ┌─────────────────┬───────────────────────┐ │         │
│   ✅ Multi-monitor                   │ │                 │                       │ │         │
│   ✅ Pro audio controls              │ │  Camera View    │   Teleprompter        │ │         │
│   ✅ FFmpeg processing               │ │                 │                       │ │         │
│   ✅ Advanced timeline               │ │                 │                       │ │         │
│   ✅ All AI agents                   │ └─────────────────┴───────────────────────┘ │         │
│   ✅ Collaboration                   │ ┌─────────────────────────────────────────┐ │         │
│                                      │ │     Controls  │  Audio  │  Timeline     │ │         │
│   Target: Pro, Business, Enterprise  │ └─────────────────────────────────────────┘ │         │
│   Screen: 768px - 1440px             └─────────────────────────────────────────────┘         │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🎬 FULL STUDIO MODE                                        │
│                              "Complete Production Suite"                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   Features:                          UI Layout:                                               │
│   ✅ Multi-source capture            ┌─────────────────────────────────────────────────────┐ │
│   ✅ All 6 AI agents                 │ ┌───────────────┬───────────────┬─────────────────┐ │ │
│   ✅ 7-phase guided exp              │ │   Source 1    │   Source 2    │   Source 3      │ │ │
│   ✅ Team collaboration              │ │ (Camera)      │ (Screen)      │ (PiP)           │ │ │
│   ✅ Approval workflows              │ └───────────────┴───────────────┴─────────────────┘ │ │
│   ✅ Advanced export                 │ ┌─────────────────────────────────────────────────┐ │ │
│   ✅ Session management              │ │              Teleprompter                        │ │ │
│   ✅ HIPAA compliance                │ └─────────────────────────────────────────────────┘ │ │
│   ✅ Analytics                       │ ┌───────────┬───────────┬───────────┬─────────────┐ │ │
│                                      │ │  Agents   │  Controls │   Audio   │  Timeline   │ │ │
│   Target: Enterprise, Healthcare     │ └───────────┴───────────┴───────────┴─────────────┘ │ │
│   Screen: > 1440px                   └─────────────────────────────────────────────────────┘ │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
src/
├── components/document-processing/RecordingStudio/
│   ├── index.tsx                          # Main Recording Studio
│   ├── RecordingCanvas.tsx                # Video canvas
│   ├── RecordingControls.tsx              # Control buttons
│   ├── RecordingLibrary.tsx               # Saved recordings
│   │
│   ├── components/
│   │   ├── ContentAnalyzer.tsx            # Vibe → Mind bridge
│   │   ├── VibeToMindBridge.tsx           # Quick Mind actions
│   │   ├── FloatingTeleprompter.tsx       # Script display
│   │   ├── FloatingAudioMixer.tsx         # Audio control
│   │   └── BackgroundBlurControl.tsx      # ML background
│   │
│   └── hooks/
│       ├── useRecording.ts                # Recording state
│       ├── useRecordingLibrary.ts         # IndexedDB storage
│       ├── useCamera.ts                   # Camera control
│       ├── useScreenShare.ts              # Screen capture
│       ├── useBackgroundBlur.ts           # ML processing
│       └── useStudioSound.ts              # Audio coordination
│
├── components/mobile/
│   ├── VoiceDirectorPanel.tsx             # AI agent
│   ├── SceneAnalyzerPanel.tsx             # AI agent
│   ├── DistributionAgentPanel.tsx         # AI agent
│   ├── ScriptVideoMatcherPanel.tsx        # AI agent
│   ├── MusicComposerPanel.tsx             # AI agent
│   ├── AutoEditorPanel.tsx                # AI agent
│   ├── GuidedEditingExperience.tsx        # 7-phase wizard
│   ├── OfflineStudioMode.tsx              # Offline support
│   ├── UniversalAIEditingAssistant.tsx    # AI assistant
│   └── SmartEditingSidebar.tsx            # Editing tools
│
└── hooks/
    ├── useVoiceDirectorAgent.ts           # Voice AI
    ├── useSceneAnalyzerAgent.ts           # Scene AI
    ├── useDistributionAgent.ts            # Distribution
    ├── useScriptVideoMatcher.ts           # Matching AI
    ├── useMusicComposerAgent.ts           # Music AI
    └── useAutoEditorAgent.ts              # Editing AI
```

---

## AI Agent Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AI AGENT INTEGRATION FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

RECORDING INPUT
      │
      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│   PHASE 1: VOICE DIRECTOR                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ • Analyze speech patterns (pace, tone, clarity)                                      │ │
│   │ • Provide real-time coaching ("Speak slower", "More energy")                         │ │
│   │ • Evaluate recordings with suggestions                                               │ │
│   │ • Guide TTS generation with style presets                                            │ │
│   └─────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│   PHASE 2: SCENE ANALYZER                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ • Frame-by-frame visual analysis                                                     │ │
│   │ • Shot type classification (wide, medium, close-up)                                  │ │
│   │ • Lighting and composition scoring                                                   │ │
│   │ • B-roll insertion point suggestions                                                 │ │
│   └─────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│   PHASE 3: SCRIPT-VIDEO MATCHER                                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ • Generate vector embeddings for script segments                                     │ │
│   │ • Match clips to script using AI similarity                                          │ │
│   │ • Arrange timeline automatically                                                     │ │
│   │ • Multiple matching modes: transcript, visual, semantic, hybrid                      │ │
│   └─────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│   PHASE 4: AUTO-EDITOR                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ • Automatic silence removal                                                          │ │
│   │ • Smart cuts at natural break points                                                 │ │
│   │ • Beat-sync editing for music                                                        │ │
│   │ • Color correction and stabilization                                                 │ │
│   │ • Client-side FFmpeg processing                                                      │ │
│   └─────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│   PHASE 5: AI EDITING ASSISTANT                                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ • Text overlays and captions                                                         │ │
│   │ • Transition suggestions                                                             │ │
│   │ • Visual effects application                                                         │ │
│   │ • Final polish and refinement                                                        │ │
│   └─────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│   PHASE 6: MUSIC COMPOSER                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ • AI music generation via ElevenLabs                                                 │ │
│   │ • Sound effect generation                                                            │ │
│   │ • Ambient/background audio                                                           │ │
│   │ • Mood presets: cinematic, upbeat, corporate, etc.                                   │ │
│   └─────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│   PHASE 7: DISTRIBUTION AGENT                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│   │ • Platform-specific format adaptation                                                │ │
│   │ • Caption and hashtag generation                                                     │ │
│   │ • Optimal posting time suggestions                                                   │ │
│   │ • Cross-platform analytics                                                           │ │
│   └─────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
PUBLISHED CONTENT
```

---

## Feature Matrix by Mode

| Feature | Mobile | Desktop | Full Studio |
|---------|:------:|:-------:|:-----------:|
| Camera Recording | ✅ | ✅ | ✅ |
| Screen Recording | ❌ | ✅ | ✅ |
| PiP Mode | ❌ | ✅ | ✅ |
| Background Blur | ✅ | ✅ | ✅ |
| Teleprompter | ✅ | ✅ | ✅ |
| Audio Mixer | Basic | ✅ | ✅ |
| Offline Mode | ✅ | ⏳ | ⏳ |
| Voice Director | ✅ | ✅ | ✅ |
| Scene Analyzer | ❌ | ✅ | ✅ |
| Script Matcher | ❌ | ✅ | ✅ |
| Music Composer | Basic | ✅ | ✅ |
| Auto-Editor | Basic | ✅ | ✅ |
| Distribution Agent | ✅ | ✅ | ✅ |
| 7-Phase Guided | ❌ | ✅ | ✅ |
| Team Collaboration | ❌ | Basic | ✅ |
| Multi-Source | ❌ | ❌ | ✅ |
| Session Management | ❌ | Basic | ✅ |

---

## Related Scenarios

| Phase | Scenarios | Focus |
|-------|-----------|-------|
| P0 | 3, 61-65 | Core recording, bidirectional flow |
| P1 | 11-16, 21-24 | Upload, refine loops |
| P2 | 17-32, 166-177 | AI agents, guided experience |
| P3 | 33-42 | Advanced automation |

---

*Part of Genie Studio Architecture Documentation*
