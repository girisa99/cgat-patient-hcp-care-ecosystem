# Genie Studio: Overall System Architecture

> **Version:** 1.0  
> **Last Updated:** 2026-01-12  
> **Status:** Production-Ready | 177 Scenarios | 28% Implemented

---

## Executive Summary

Genie Studio is a comprehensive AI-powered media production suite that transforms ideas into polished video content through an integrated pipeline of intelligent modules.

---

## Master Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              GENIE STUDIO - COMPLETE SYSTEM                                   │
│                          "From Imagination to Publication"                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌────────────────────┐
                                    │      USER          │
                                    │   (All Segments)   │
                                    └─────────┬──────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
          │   GENIE SPARK   │       │   GENIE MIND    │       │   GENIE VIBE    │
          │ "Ignite Ideas"  │       │ "AI Understands"│       │ "Feel the Flow" │
          │                 │       │                 │       │                 │
          │ • Quick Start   │──────►│ • AI Analysis   │──────►│ • Recording     │
          │ • Templates     │       │ • Script Gen    │       │ • Production    │
          │ • Inspiration   │       │ • Enhancement   │       │ • Export        │
          └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
                   │                         │                         │
                   │              ┌──────────┴──────────┐              │
                   │              ▼                     ▼              │
                   │    ┌─────────────────┐   ┌─────────────────┐      │
                   │    │   GENIE ARC     │   │ PRODUCTION HUB  │      │
                   │    │  "Build Agents" │   │ "Orchestrate"   │      │
                   │    │                 │   │                 │      │
                   │    │ • Agent Builder │   │ • Team Collab   │      │
                   │    │ • Workflows     │   │ • Approvals     │      │
                   │    │ • Automation    │   │ • Scheduling    │      │
                   │    └────────┬────────┘   └────────┬────────┘      │
                   │             │                     │               │
                   └─────────────┴──────────┬──────────┴───────────────┘
                                            │
                                            ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                  SHARED SERVICES LAYER                  │
                   ├────────────────────────────────────────────────────────┤
                   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
                   │  │ Universal AI │  │   TTS/Voice  │  │  FFmpeg.wasm │  │
                   │  │  Processor   │  │   Engine     │  │  Processing  │  │
                   │  └──────────────┘  └──────────────┘  └──────────────┘  │
                   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
                   │  │   Supabase   │  │  IndexedDB   │  │   Stripe     │  │
                   │  │   Backend    │  │   Storage    │  │   Billing    │  │
                   │  └──────────────┘  └──────────────┘  └──────────────┘  │
                   └────────────────────────────────────────────────────────┘
                                            │
                                            ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                    OUTPUT LAYER                         │
                   ├────────────────────────────────────────────────────────┤
                   │  📱 Mobile App  │  🖥️ Desktop  │  ☁️ Cloud  │  📺 Social │
                   └────────────────────────────────────────────────────────┘
```

---

## Module Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              MODULE INTERACTION MATRIX                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                          SPARK    MIND     VIBE      ARC      HUB
                        ┌────────┬────────┬────────┬────────┬────────┐
          SPARK         │   -    │   →    │   →    │   ◇    │   ◇    │
                        ├────────┼────────┼────────┼────────┼────────┤
          MIND          │   ←    │   -    │   ↔    │   ←    │   ←    │
                        ├────────┼────────┼────────┼────────┼────────┤
          VIBE          │   ←    │   ↔    │   -    │   ◇    │   →    │
                        ├────────┼────────┼────────┼────────┼────────┤
          ARC           │   ◇    │   →    │   ◇    │   -    │   ↔    │
                        ├────────┼────────┼────────┼────────┼────────┤
          HUB           │   ◇    │   →    │   ←    │   ↔    │   -    │
                        └────────┴────────┴────────┴────────┴────────┘

Legend: → One-way flow | ↔ Bidirectional | ◇ Optional/Conditional | ← Receives from
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRIMARY DATA FLOWS                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

FLOW 1: CREATION PIPELINE (Mind → Vibe)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[User Input] → [AI Processing] → [Script] → [TTS] → [Recording] → [Export] → [Publish]
     │              │              │          │           │           │          │
     ▼              ▼              ▼          ▼           ▼           ▼          ▼
  • Text        • Claude 3.5   • Markdown  • ElevenLabs • Camera   • MP4/WebM  • YouTube
  • Prompt      • GPT-4o       • Original  • OpenAI     • Screen   • Audio     • TikTok
  • Template    • Gemini       • Enhanced  • Azure      • PiP      • GIF       • LinkedIn
  • Document                                                                   • Storage


FLOW 2: ANALYSIS PIPELINE (Vibe → Mind → Vibe)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Existing Content] → [Content Analyzer] → [Mind AI] → [Enhanced Script] → [Vibe Recording]
       │                    │                │               │                  │
       ▼                    ▼                ▼               ▼                  ▼
   • Recording         • Extract text    • Analyze      • Original +       • Teleprompter
   • PPT/PDF           • OCR images      • Summarize      Enhanced         • Audio mixer
   • URL               • Parse structure • Generate      • Keywords        • Multi-source
   • Images                              • Optimize      • TTS-ready


FLOW 3: COLLABORATION PIPELINE (Multi-User)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Host Creates] → [Invites] → [Participants Join] → [Feedback Loop] → [Approval] → [Publish]
      │              │              │                    │               │            │
      ▼              ▼              ▼                    ▼               ▼            ▼
  • Session      • Email        • Waiting room      • Suggestions   • Review     • Final
  • Agenda       • Calendar     • Role assignment   • Real-time     • Approve    • Export
  • Schedule     • SMS          • Test area         • Status sync   • Reject     • Archive
```

---

## Technology Stack Overview

| Layer | Technology | Purpose | Status |
|-------|------------|---------|--------|
| **Frontend** | React 18 + TypeScript | UI Components | ✅ |
| **Styling** | Tailwind CSS + shadcn/ui | Design System | ✅ |
| **State** | TanStack Query + React Context | State Management | ✅ |
| **Video** | MediaRecorder + FFmpeg.wasm | Video Processing | ✅ |
| **Audio** | Web Audio API + ElevenLabs | Audio Processing | ✅ |
| **AI** | OpenAI + Claude + Gemini | AI Processing | ✅ |
| **Backend** | Supabase Edge Functions | Server Logic | ✅ |
| **Database** | PostgreSQL (Supabase) | Data Persistence | ✅ |
| **Storage** | Supabase Storage + IndexedDB | File Storage | ✅ |
| **Auth** | Supabase Auth + Stripe | Authentication | ✅ |
| **Mobile** | Capacitor + PWA | Mobile Deployment | ✅ |

---

## Module Summary

| Module | Tagline | Primary Function | Tier |
|--------|---------|------------------|------|
| **Spark** | "Ignite Your Ideas" | Quick content generation | Free |
| **Mind** | "AI That Understands" | AI intelligence & analysis | Business+ |
| **Vibe** | "Feel the Flow" | Production & recording | Business+ |
| **Arc** | "Build & Deploy" | Agent creation & automation | Pro+ |
| **Hub** | "Orchestrate Excellence" | Team coordination | Pro+ |

---

## Phase Implementation Status

| Phase | Scenarios | Implemented | Status |
|-------|-----------|-------------|--------|
| **P0** | 35 | 33 (94%) | ✅ Near Complete |
| **P1** | 32 | 5 (16%) | 🔶 In Progress |
| **P2** | 50 | 12 (24%) | 🔶 In Progress |
| **P3** | 26 | 0 (0%) | ⏳ Planned |
| **P4** | 24 | 0 (0%) | ⏳ Planned |
| **P5** | 10 | 0 (0%) | ⏳ Planned |
| **Total** | 177 | 50 (28%) | Active |

---

## Cross-References

| Document | Purpose |
|----------|---------|
| `GENIE_MIND_ARCHITECTURE.md` | Mind module details |
| `GENIE_VIBE_ARCHITECTURE.md` | Vibe module details |
| `GENIE_ARC_PRODUCTION_HUB_ARCHITECTURE.md` | Arc & Hub details |
| `GENIE_SPARK_ARCHITECTURE.md` | Spark module details |
| `COMPREHENSIVE_177_SCENARIO_PHASE_REVIEW.md` | Full scenario mapping |
| `GENIE_PHASE_IMPLEMENTATION_ROADMAP.md` | Implementation timeline |

---

*Document maintained by Genie Studio Development Team*
