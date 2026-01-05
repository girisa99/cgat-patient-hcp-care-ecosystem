# Genie Mind & Genie Vibe: Functional Architecture

> **Version:** 1.3  
> **Last Updated:** 2026-01-05  
> **Scope:** P0-P2 Implementation | P3-P4 Roadmap
> **Suite:** Mind to Media — AI-Powered Production Suite

---

## Table of Contents

1. [User Journey Maps](#user-journey-maps)
2. [Bidirectional Flows](#bidirectional-flows)
3. [P0 Core User Flows](#p0-core-user-flows)
4. [P1 Essential User Flows](#p1-essential-user-flows)
5. [P2 Advanced User Flows](#p2-advanced-user-flows)
6. [P3-P4 Future Flows](#p3-p4-future-flows)
7. [Feature Matrix](#feature-matrix)
8. [UI/UX Specifications](#uiux-specifications)
9. [Persona Workflows](#persona-workflows)
10. [Production Hub (Optional)](#production-hub-optional)

---

## User Journey Maps

### Primary User Personas

| Persona | Role | Primary Goal | Key Scenarios |
|---------|------|--------------|---------------|
| **Content Creator** | Marketing | Create product videos | 1, 3, 6, 21, 61 |
| **Educator** | Training | Build tutorials | 2, 7, 8, 17, 62 |
| **Podcaster** | Entertainment | Produce episodes | 15, 25, 32, 63 |
| **Enterprise Comms** | Corporate | Internal videos | 6, 43, 44, 46, 64 |
| **Healthcare Pro** | Clinical | Compliant content | 8, 44, 45, 46, 65 |

### Master User Journey (Updated with Bidirectional Flow)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY OVERVIEW                               │
└──────────────────────────────────────────────────────────────────────────────┘

    START                                                                  END
      │                                                                     │
      ▼                                                                     ▼
┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│  IDEATE   │──►│  CREATE   │──►│  PRODUCE  │──►│  REFINE   │──►│  PUBLISH  │
│           │   │           │   │           │   │           │   │           │
│ • Concept │   │ • Script  │   │ • Record  │   │ • Review  │   │ • Export  │
│ • Plan    │   │ • Assets  │   │ • Capture │   │ • Edit    │   │ • Share   │
│ • Research│   │ • TTS     │   │ • Mix     │   │ • Polish  │   │ • Deliver │
└───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
      │               │               │               │               │
      │               ├───────────────┼───────────────┤               │
      │               │    VIBE ↔ MIND LOOP           │               │
      │               │   (Analyze → Enhance → Record)│               │
      │               │               │               │               │
      └───────────────┴───────────────┴───────────────┼───────────────┘
                                                      │
                                              (Iterate as needed)
```

---

## Bidirectional Flows (NEW - Implemented 2026-01-05)

### Flow: Vibe → Mind → Vibe (Content Analysis Loop)

**User Goal:** Take existing content (recording, PPT, PDF, URL) and generate AI-enhanced scripts

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     FLOW: VIBE → MIND → VIBE                                 │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 1: User has content in Vibe (Recording Studio)
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Recording Studio]                                                         │
│                                                                             │
│  Content Available:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📹 Screen Recording     │  📄 Imported PPT/PDF  │  🌐 URL Content   │   │
│  │  Just recorded a demo    │  Presentation slides   │  Web page info    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [🧠 Analyze with Mind]  ← Click to send to Mind for AI analysis           │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: ContentAnalyzer Dialog Opens
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Genie Mind Logo]                                                   │   │
│  │  Analyze with Genie Mind                                             │   │
│  │  ─────────────────────────────────────────────────────────────────   │   │
│  │                                                                       │   │
│  │  Content: "Product Demo Recording" (Screen Recording)                │   │
│  │                                                                       │   │
│  │  What Mind will do:                                                   │   │
│  │  • Analyze visual and text content                                   │   │
│  │  • Generate a narration script                                       │   │
│  │  • Suggest improvements                                               │   │
│  │  • Optimize for voiceover                                             │   │
│  │                                                                       │   │
│  │  Generate outputs:                                                    │   │
│  │  [✓ Script] [○ TTS Audio] [○ Background Music]                       │   │
│  │                                                                       │   │
│  │  [Cancel]                    [✨ Analyze with Mind →]                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: AI Analysis & Script Generation
┌─────────────────────────────────────────────────────────────────────────────┐
│  Progress: [████████████████████████████░░] 85%                             │
│                                                                             │
│  • Extracting content... ✓                                                  │
│  • Analyzing structure... ✓                                                 │
│  • Generating script... (in progress)                                       │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 4: Script Generated - Return to Vibe
┌─────────────────────────────────────────────────────────────────────────────┐
│  Generated Script:                                    ~3.5 min              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  │                                                                     │   │
│  │  [AI-generated script based on content analysis...]                 │   │
│  │                                                                     │   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Keywords: [tutorial] [walkthrough] [guide]                                 │
│                                                                             │
│  [Mind] → [Script] → [Vibe]  (Flow Indicator)                               │
│                                                                             │
│  [Start Over]                      [✓ Use Script in Vibe]                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Production Hub (Optional - For Team Coordination)

**Purpose:** Pre-production coordination for larger team productions

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION HUB (OPTIONAL)                                 │
│            "For Coordinated Team Productions"                                │
└──────────────────────────────────────────────────────────────────────────────┘

When to use Production Hub:
• Multi-person productions requiring coordination
• Content requiring approval workflows
• Projects with multiple stakeholders
• Large-scale content series

Quick Create (Default - No Hub needed):
• Solo creators
• Single-session recordings
• Simple script → record → publish flow

Production Hub Features:
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Pre-production Tracking    │  • Team Role Assignment                     │
│  • Approval Workflows         │  • Status Dashboard                         │
│  • Asset Coordination         │  • Publication Schedule                     │
└─────────────────────────────────────────────────────────────────────────────┘

Note: Publishing always happens from Vibe. Production Hub tracks readiness.
```

---

## P0 Core User Flows

### Flow 1: Text → Script → Video (Scenario 1)

**User Goal:** Create a video from a text idea

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     FLOW 1: TEXT → SCRIPT → VIDEO                            │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 1: Enter Genie Studio
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Genie Studio]                                                    [Record] │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Scripts  │  Media  │  Shows  │  Architecture                          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌──────────────────────┐  ┌─────────────────────────────────────────────┐ │
│  │  📝 New Script       │  │  SCRIPT EDITOR                              │ │
│  │  ─────────────────── │  │  ──────────────────────────────────────────  │ │
│  │  [+ Create New]      │  │  Title: [_________________________]         │ │
│  │                      │  │                                             │ │
│  │  Recent Scripts:     │  │  [                                   ]      │ │
│  │  • Product Demo      │  │  [  Type your idea here...          ]      │ │
│  │  • Tutorial v2       │  │  [                                   ]      │ │
│  │  • Q1 Update         │  │  [                                   ]      │ │
│  └──────────────────────┘  │                                             │ │
│                            │  [✨ AI Enhance]  [📊 Stats]  [🎙️ Generate] │ │
│                            └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: Write or Generate Script
┌─────────────────────────────────────────────────────────────────────────────┐
│  User Action: Types text prompt or selects template                        │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Option A: Free-form                    Option B: Template                  │
│  ┌───────────────────────────┐          ┌───────────────────────────┐      │
│  │ "Create a 2-minute video  │          │ [Select Template]          │      │
│  │  about our new AI feature │          │ ┌─────────────────────────┐│      │
│  │  that helps with data     │          │ │ 📹 Product Demo         ││      │
│  │  analysis..."             │          │ │ 📚 Tutorial             ││      │
│  └───────────────────────────┘          │ │ 📢 Announcement         ││      │
│                                         │ │ 💡 Explainer            ││      │
│  [✨ Generate Script]                   │ │ 🎙️ Podcast Episode      ││      │
│                                         │ └─────────────────────────┘│      │
│                                         └───────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: AI Generates Script
┌─────────────────────────────────────────────────────────────────────────────┐
│  System Action: Lovable AI generates script                                │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  GENERATED SCRIPT                                           [Edit] │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  Welcome to our latest AI-powered data analysis feature!            │   │
│  │                                                                     │   │
│  │  Today, I'll show you how this game-changing tool can              │   │
│  │  transform the way you work with data...                           │   │
│  │                                                                     │   │
│  │  [Script continues...]                                             │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  📊 Stats: 245 words | 1:38 speaking time | Easy readability               │
│                                                                             │
│  [Save Draft]  [✨ Enhance More]  [🎙️ Generate Voice]                      │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 4: Generate TTS Audio
┌─────────────────────────────────────────────────────────────────────────────┐
│  User Action: Select voice and generate TTS                                │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Voice Selection:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Provider: [ElevenLabs ▼]                                           │   │
│  │                                                                     │   │
│  │  Voice:    [Rachel - Professional Female ▼]                        │   │
│  │                                                                     │   │
│  │  Preview:  [▶️ Play Sample]                                         │   │
│  │                                                                     │   │
│  │  Settings:                                                          │   │
│  │    Stability:    [━━━━━━●━━━] 0.5                                   │   │
│  │    Similarity:   [━━━━━━━●━] 0.75                                   │   │
│  │    Speed:        [━━━━●━━━━] 1.0x                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [🎙️ Generate Voiceover]                                                   │
│                                                                             │
│  ⏳ Generating... (estimated 30 seconds)                                   │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 5: Launch Recording Studio
┌─────────────────────────────────────────────────────────────────────────────┐
│  User Action: Open Recording Studio with context                           │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  [🎬 Open Recording Studio]                                                │
│                                                                             │
│  Context Transferred:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✓ Script loaded to teleprompter                                   │   │
│  │  ✓ TTS audio available in mixer                                    │   │
│  │  ✓ Project settings preserved                                      │   │
│  │  ✓ Background music options ready                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 6: Record in Recording Studio
┌─────────────────────────────────────────────────────────────────────────────┐
│  RECORDING STUDIO                                              [× Close]   │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │                                     │  │  TELEPROMPTER               │  │
│  │                                     │  │  ─────────────────────────  │  │
│  │         [Camera Preview]            │  │  Welcome to our latest      │  │
│  │                                     │  │  AI-powered data analysis   │  │
│  │                                     │  │  feature!                   │  │
│  │                                     │  │                             │  │
│  │                                     │  │  Today, I'll show you how   │  │
│  │                                     │  │  this game-changing tool... │  │
│  └─────────────────────────────────────┘  │                             │  │
│                                           │  Speed: [━━━●━━] 1.0x       │  │
│  ┌─────────────────────────────────────┐  └─────────────────────────────┘  │
│  │  🎚️ AUDIO MIXER                    │                                   │
│  │  ─────────────────────────────────  │                                   │
│  │  🎙️ Mic:     [━━━━━●━━━] 80%       │                                   │
│  │  🎧 TTS:     [━━━━━━●━━] 70%       │                                   │
│  │  🎵 Music:   [━━●━━━━━━] 20%       │                                   │
│  └─────────────────────────────────────┘                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │   [⏺ Record]    [⏸ Pause]    [⏹ Stop]    |    Duration: 00:00:00   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 7: Export Video
┌─────────────────────────────────────────────────────────────────────────────┐
│  User Action: Export final video                                           │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Export Options:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Format:     [MP4 (H.264) ▼]                                        │   │
│  │  Quality:    [1080p HD ▼]                                           │   │
│  │  Include:                                                           │   │
│  │    ☑ Video track                                                    │   │
│  │    ☑ Mixed audio                                                    │   │
│  │    ☐ Separate audio track                                           │   │
│  │    ☑ Captions (SRT)                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [📥 Export Video]                                                         │
│                                                                             │
│  ⏳ Processing... 45%                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Template → Customize → Video (Scenario 6)

**User Goal:** Quickly create a video using a proven template

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    FLOW 2: TEMPLATE → CUSTOMIZE → VIDEO                      │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 1: Browse Templates
┌─────────────────────────────────────────────────────────────────────────────┐
│  Template Gallery                                                          │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Categories: [All] [Marketing] [Education] [Corporate] [Podcast] [Live]    │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ 📹          │  │ 📚          │  │ 📢          │  │ 💡          │       │
│  │ Product     │  │ Tutorial    │  │ Announce-   │  │ Explainer   │       │
│  │ Demo        │  │ How-To      │  │ ment        │  │             │       │
│  │             │  │             │  │             │  │             │       │
│  │ [Use]       │  │ [Use]       │  │ [Use]       │  │ [Use]       │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                         │
│  │ 🎙️          │  │ 📺          │  │ 📻          │                         │
│  │ Podcast     │  │ Webcast     │  │ Broadcast   │                         │
│  │ Episode     │  │ Webinar     │  │ Live        │                         │
│  │             │  │             │  │             │                         │
│  │ [Use]       │  │ [Use]       │  │ [Use]       │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: Customize Template
┌─────────────────────────────────────────────────────────────────────────────┐
│  Customizing: Product Demo Template                                        │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Welcome to [Product Name]!                                         │   │
│  │               ▲                                                     │   │
│  │               │ Click to edit placeholder                          │   │
│  │                                                                     │   │
│  │  Today, I'll walk you through the key features that make our       │   │
│  │  solution stand out.                                               │   │
│  │                                                                     │   │
│  │  First, let's look at [Feature 1]. This allows you to              │   │
│  │  [benefit 1], saving you time and effort.                          │   │
│  │                 ▲                   ▲                               │   │
│  │                 │                   │                               │   │
│  │                 Placeholder fields highlighted                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Placeholders to fill:                                                     │
│  ┌────────────────────────────────────────────────────┐                    │
│  │  [Product Name]:  [DataFlow Pro____________]      │                    │
│  │  [Feature 1]:     [AI-Powered Analytics____]      │                    │
│  │  [benefit 1]:     [insights in seconds_____]      │                    │
│  └────────────────────────────────────────────────────┘                    │
│                                                                             │
│  [Auto-Fill All]  [Preview]  [Continue to Voice →]                         │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: Quick Voice Selection
┌─────────────────────────────────────────────────────────────────────────────┐
│  Quick Voice Setup                                                         │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Recommended voices for Product Demo:                                      │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ 👤 Rachel       │  │ 👤 Josh         │  │ 👤 Sarah        │            │
│  │ Professional    │  │ Confident       │  │ Friendly        │            │
│  │ Female          │  │ Male            │  │ Female          │            │
│  │ [▶️] [Select]   │  │ [▶️] [Select]   │  │ [▶️] [Select]   │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  [🎙️ Generate Voice & Record]                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Document → Script → Video (Scenarios 7-8)

**User Goal:** Transform existing documents into video content

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    FLOW 3: DOCUMENT → SCRIPT → VIDEO                         │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 1: Upload Document
┌─────────────────────────────────────────────────────────────────────────────┐
│  Document Upload                                                           │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │            ┌──────────────────────────────────┐                    │   │
│  │            │         📄                        │                    │   │
│  │            │                                  │                    │   │
│  │            │    Drop files here or            │                    │   │
│  │            │    [Browse Files]                │                    │   │
│  │            │                                  │                    │   │
│  │            │    Supports: PDF, DOCX, PPTX     │                    │   │
│  │            └──────────────────────────────────┘                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Recent uploads:                                                           │
│  • Q1-Report.pdf (processed 2h ago)                                        │
│  • Product-Roadmap.pptx (processed yesterday)                              │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: Content Extraction
┌─────────────────────────────────────────────────────────────────────────────┐
│  Processing: Annual-Report-2025.pdf                                        │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ⏳ Analyzing document structure...                                        │
│                                                                             │
│  Detected:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📄 Pages: 24                                                       │   │
│  │  📊 Charts/Graphs: 8                                                │   │
│  │  📝 Sections: 6                                                     │   │
│  │  💬 Key Points: 15                                                  │   │
│  │                                                                     │   │
│  │  Suggested Script Type: [Explainer Video ▼]                        │   │
│  │  Estimated Length: ~4 minutes                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Sections to include:                                                      │
│  ☑ Executive Summary                                                       │
│  ☑ Key Highlights                                                          │
│  ☑ Financial Performance                                                   │
│  ☐ Detailed Appendix                                                       │
│  ☐ Technical Notes                                                         │
│                                                                             │
│  [Generate Script from Selected Sections]                                  │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: Script Review & Edit
┌─────────────────────────────────────────────────────────────────────────────┐
│  Generated Script from Document                                            │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  INTRODUCTION                                                       │   │
│  │  ─────────────                                                      │   │
│  │  Let's take a look at the highlights from our 2025 Annual Report.  │   │
│  │                                                                     │   │
│  │  SECTION 1: EXECUTIVE SUMMARY                                       │   │
│  │  ─────────────                                                      │   │
│  │  This year marked a significant milestone for our organization...  │   │
│  │                                                                     │   │
│  │  [AI extracted and reformatted content continues...]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Source Preview:                                      Generated Script:    │
│  [Show Original] [Show Diff]                          [Edit] [Enhance]     │
│                                                                             │
│  [Approve & Continue to Voice →]                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## P1 Essential User Flows

### Flow 4: Record → Review → Re-record (Scenario 21)

**User Goal:** Iteratively improve recording quality

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    FLOW 4: RECORD → REVIEW → RE-RECORD                       │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 1: Initial Recording
┌─────────────────────────────────────────────────────────────────────────────┐
│  Recording Complete                                                        │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ▶️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  03:24      │   │
│  │                                                                     │   │
│  │  [▶️ Play]  [⏸ Pause]  [⏮ -10s]  [⏭ +10s]                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  AI Analysis:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Issues Detected:                                                │   │
│  │                                                                     │   │
│  │  🔴 0:45 - Filler word ("um") detected                             │   │
│  │  🟡 1:23 - Long pause (3.2 seconds)                                 │   │
│  │  🔴 2:15 - Unclear pronunciation                                    │   │
│  │  🟡 2:58 - Background noise spike                                   │   │
│  │                                                                     │   │
│  │  Overall Score: 72/100                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [🔄 Re-record All]  [✂️ Fix Sections]  [✅ Accept & Export]               │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: Selective Re-record
┌─────────────────────────────────────────────────────────────────────────────┐
│  Section Re-record Mode                                                    │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Selected Section: 0:45 - 1:02 (Filler word issue)                        │
│                                                                             │
│  Original Script for this section:                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  "This feature, um, allows you to analyze data in real-time,       │   │
│  │   giving you insights exactly when you need them."                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Corrected version:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  "This feature allows you to analyze data in real-time,            │   │
│  │   giving you insights exactly when you need them."                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [Camera Preview]                                                   │   │
│  │                                                                     │   │
│  │  3... 2... 1... [Recording...]                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [⏹ Stop & Insert]  [🔄 Try Again]                                        │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: Review Patched Recording
┌─────────────────────────────────────────────────────────────────────────────┐
│  Patched Recording Review                                                  │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Timeline with patches:                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ━━━━━[🔄]━━━━━━━━━━━━━━━━━━[🔄]━━━━━━━━━━━━━━━━━━━━━━━━━━━        │   │
│  │       ↑                      ↑                                      │   │
│  │    0:45                   2:15                                      │   │
│  │  Re-recorded            Re-recorded                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Updated Score: 94/100  (+22 improvement)                                  │
│                                                                             │
│  [Preview Full Video]  [Export Final]                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 5: Multi-Channel Audio Mixing (Scenario 23)

**User Goal:** Combine live recording with TTS and background music

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    FLOW 5: MULTI-CHANNEL AUDIO MIXING                        │
└──────────────────────────────────────────────────────────────────────────────┘

AUDIO MIXER INTERFACE
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎚️ FLOATING AUDIO MIXER                                         [─][□][×]│
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 🎙️ MIC      │ │ 🎧 TTS      │ │ 🎤 VOICEOVER│ │ 🎵 MUSIC    │          │
│  │ ────────    │ │ ────────    │ │ ────────    │ │ ────────    │          │
│  │             │ │             │ │             │ │             │          │
│  │    ┃       │ │    ┃       │ │    ┃       │ │    ┃       │          │
│  │    ┃       │ │    ┃       │ │    ┃       │ │    ┃       │          │
│  │    ┃██     │ │    ┃██     │ │    ┃       │ │    ┃█      │          │
│  │    ┃██     │ │    ┃██     │ │    ┃       │ │    ┃█      │          │
│  │    ┃██     │ │    ┃██     │ │    ┃       │ │    ┃█      │          │
│  │    ┃██     │ │    ┃███    │ │    ┃       │ │    ┃██     │          │
│  │    ┃███    │ │    ┃███    │ │    ┃       │ │    ┃██     │          │
│  │    ┃███    │ │    ┃████   │ │    ┃       │ │    ┃███    │          │
│  │             │ │             │ │             │ │             │          │
│  │   80%      │ │   70%      │ │   0%       │ │   25%      │          │
│  │             │ │             │ │             │ │             │          │
│  │ [🔇] [▶️]   │ │ [🔇] [▶️]   │ │ [🔇] [📂]   │ │ [🔇] [🔁]   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                             │
│  Master: ━━━━━━━━━━━━●━━━━━  85%                                           │
│                                                                             │
│  Presets: [Voice Priority] [Music Focus] [Balanced] [Custom]               │
└─────────────────────────────────────────────────────────────────────────────┘

CHANNEL DETAILS

Channel 1: MICROPHONE
┌─────────────────────────────────────────────────────────────────────────────┐
│  Input: USB Microphone (Blue Yeti)                                         │
│  Status: ● Active                                                          │
│  Noise Gate: On                                                            │
│  Compression: Medium                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

Channel 2: TTS (Pre-generated)
┌─────────────────────────────────────────────────────────────────────────────┐
│  Source: product-demo-rachel.mp3                                           │
│  Duration: 2:45                                                            │
│  Sync Mode: Manual trigger                                                 │
│  [▶️ Play] [⏸ Pause] [⏹ Stop]                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Channel 3: VOICEOVER (Upload)
┌─────────────────────────────────────────────────────────────────────────────┐
│  Source: None selected                                                     │
│  [📂 Load Voiceover File]                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Channel 4: BACKGROUND MUSIC
┌─────────────────────────────────────────────────────────────────────────────┐
│  Source: upbeat-corporate.mp3                                              │
│  Loop: ● Enabled                                                           │
│  Fade: In 3s / Out 3s                                                      │
│  [🎵 Change Track]                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## P2 Advanced User Flows

### Flow 6: Video → Script → Translate → New Video (Scenario 19)

**User Goal:** Repurpose existing video for different language markets

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                 FLOW 6: VIDEO → SCRIPT → TRANSLATE → VIDEO                   │
└──────────────────────────────────────────────────────────────────────────────┘

STEP 1: Upload Existing Video
┌─────────────────────────────────────────────────────────────────────────────┐
│  Video Transcription                                                       │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Source: product-demo-english.mp4                                          │
│  Duration: 3:24                                                            │
│  Language Detected: English (US)                                           │
│                                                                             │
│  [▶️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]  03:24                              │
│                                                                             │
│  ⏳ Transcribing with Whisper...                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  78%                          │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: Review Extracted Script
┌─────────────────────────────────────────────────────────────────────────────┐
│  Extracted Script                                                          │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [00:00] Welcome to DataFlow Pro, the future of data analytics.    │   │
│  │  [00:05] Today, I'll show you how easy it is to get started.       │   │
│  │  [00:12] First, connect your data sources with just one click.     │   │
│  │  [00:18] Our AI automatically detects your data structure...       │   │
│  │  [...]                                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Accuracy: 98.5%  |  245 words  |  42 sentences                            │
│                                                                             │
│  [Edit Script]  [Translate →]                                              │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: Select Target Languages
┌─────────────────────────────────────────────────────────────────────────────┐
│  Translation Setup                                                         │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Source: English (US)                                                      │
│                                                                             │
│  Target Languages:                                                         │
│  ☑ Spanish (ES)         ☑ French (FR)                                      │
│  ☑ German (DE)          ☐ Japanese (JP)                                    │
│  ☐ Mandarin (ZH)        ☐ Portuguese (BR)                                  │
│  ☐ Italian (IT)         ☐ Korean (KR)                                      │
│                                                                             │
│  Voice Matching:                                                           │
│  ☑ Use similar voice characteristics                                       │
│  ☐ Use specific voice per language                                         │
│                                                                             │
│  Output Options:                                                           │
│  ☑ Dubbed video (replace audio)                                            │
│  ☐ Subtitled video (keep original audio)                                   │
│  ☑ Generate SRT files                                                      │
│                                                                             │
│  [Translate & Generate]                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 4: Review Translations
┌─────────────────────────────────────────────────────────────────────────────┐
│  Translation Review: Spanish (ES)                                          │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Side-by-side comparison:                                                  │
│                                                                             │
│  English (Original):              Spanish (Translated):                    │
│  ┌─────────────────────────┐      ┌─────────────────────────┐             │
│  │ Welcome to DataFlow Pro,│      │ Bienvenido a DataFlow   │             │
│  │ the future of data      │      │ Pro, el futuro del      │             │
│  │ analytics.              │      │ análisis de datos.      │             │
│  │                         │      │                         │             │
│  │ Today, I'll show you    │      │ Hoy, te mostraré lo     │             │
│  │ how easy it is to get   │      │ fácil que es comenzar.  │             │
│  │ started.                │      │                         │             │
│  └─────────────────────────┘      └─────────────────────────┘             │
│                                                                             │
│  [▶️ Preview Original]  [▶️ Preview Spanish]  [✏️ Edit Translation]        │
│                                                                             │
│  [← Previous Language]  [Approve & Continue →]  [Next Language →]          │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 5: Generate Localized Videos
┌─────────────────────────────────────────────────────────────────────────────┐
│  Generating Localized Videos                                               │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Spanish (ES)                                                       │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ✅ Complete           │   │
│  │  Generated: product-demo-spanish.mp4                                │   │
│  │                                                                     │   │
│  │  French (FR)                                                        │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ⏳ 67%                │   │
│  │  Generating TTS audio...                                            │   │
│  │                                                                     │   │
│  │  German (DE)                                                        │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ⏳ Queued             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Estimated time remaining: 4 minutes                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 7: Cross-Studio Round Trip (Scenario 25)

**User Goal:** Edit script in Genie, record, return to Genie for enhancement

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     FLOW 7: CROSS-STUDIO ROUND TRIP                          │
└──────────────────────────────────────────────────────────────────────────────┘

PHASE 1: GENIE STUDIO (Pre-Production)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─── Script created and enhanced ───┐                                     │
│  │                                   │                                     │
│  │  "Welcome to DataFlow Pro..."     │                                     │
│  │                                   │                                     │
│  └───────────────────────────────────┘                                     │
│                      │                                                      │
│                      ▼                                                      │
│            [Open Recording Studio]                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                       │
                       │  Context Transfer:
                       │  • Script content
                       │  • TTS audio files
                       │  • Project settings
                       │
                       ▼
PHASE 2: RECORDING STUDIO (Production)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─── First take recorded ───┐       ┌─── Issues identified ───┐          │
│  │                           │       │                          │          │
│  │  [Camera] [Teleprompter]  │  ───► │  • Pacing too fast      │          │
│  │  [Audio Mixer]            │       │  • Missed key point     │          │
│  │                           │       │  • Script needs edit    │          │
│  └───────────────────────────┘       └──────────────────────────┘          │
│                                                                             │
│            [Return to Genie for Script Edit]                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                       │
                       │  Context Transfer:
                       │  • Recording reference
                       │  • Timestamp markers
                       │  • Issue notes
                       │
                       ▼
PHASE 3: GENIE STUDIO (Enhancement)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Script Comparison View:                                                   │
│                                                                             │
│  ┌─── Original ───┐                   ┌─── Revised ───┐                    │
│  │                │                   │               │                    │
│  │ "Today I'll    │        ▶         │ "Today, let   │                    │
│  │  show you..."  │                   │  me walk you  │                    │
│  │                │                   │  through..."  │                    │
│  └────────────────┘                   └───────────────┘                    │
│                                                                             │
│  Changes: +15 words | Readability: Improved                                │
│                                                                             │
│            [Regenerate TTS]  [Return to Recording]                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
PHASE 4: RECORDING STUDIO (Final Take)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Updated Context:                                                          │
│  • New script loaded                                                       │
│  • New TTS available                                                       │
│  • Previous recording archived                                             │
│                                                                             │
│            [Record Final Version]                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## P3-P4 Future Flows

### P3: Compliance & Legal Flows (Scenarios 43-46)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    P3 FUTURE: COMPLIANCE WORKFLOW                            │
└──────────────────────────────────────────────────────────────────────────────┘

LEGAL REVIEW GATE (Scenario 43)
┌─────────────────────────────────────────────────────────────────────────────┐
│  Content Approval Workflow                                                 │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Status: Pending Legal Review                                              │
│                                                                             │
│  ┌─── Approval Chain ───────────────────────────────────────────────────┐  │
│  │                                                                      │  │
│  │  [✅ Creator] ──► [✅ Editor] ──► [⏳ Legal] ──► [○ Compliance] ──► [○ Publish]
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Legal Reviewer: John Smith                                                │
│  Assigned: 2 hours ago                                                     │
│  SLA: 24 hours remaining                                                   │
│                                                                             │
│  Comments:                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  @1:23 - "Please verify this claim about 99% accuracy"              │  │
│  │  @2:45 - "Trademark symbol needed after 'DataFlow Pro'"             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

HIPAA REDACTION (Scenario 45)
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHI Detection & Redaction                                                 │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Scan Results:                                                             │
│                                                                             │
│  🔴 HIGH CONFIDENCE (Auto-redacted):                                       │
│  ├── @0:45 Patient name "John Doe" → [REDACTED]                           │
│  ├── @1:12 SSN pattern "XXX-XX-1234" → [REDACTED]                         │
│  └── @2:30 Phone number → [REDACTED]                                       │
│                                                                             │
│  🟡 MEDIUM CONFIDENCE (Review required):                                   │
│  ├── @1:45 Possible address reference → [Review]                          │
│  └── @3:00 Date of birth context → [Review]                               │
│                                                                             │
│  [Preview Redacted Version]  [Export Compliance Report]                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### P4: Advanced Collaboration (Scenarios 55-58)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    P4 FUTURE: REAL-TIME COLLABORATION                        │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Collaborative Editing Session                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│                                                                             │
│  Project: Q1 Marketing Video                                               │
│  Collaborators: 👤 Alice (editing) 👤 Bob (reviewing) 👤 Carol (comment)   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Welcome to DataFlow Pro!                                           │   │
│  │  ─────────────────────────                                          │   │
│  │  Today, I'll show you how easy it is to |                          │   │
│  │                                         └─ 👤 Alice typing...       │   │
│  │                                                                     │   │
│  │  [Bob's comment: "Maybe add more enthusiasm here?"]                │   │
│  │  ───────────────────────────────────────────────                    │   │
│  │                                                                     │   │
│  │  First, connect your data sources with just one click.             │   │
│  │  ─────────────────────────────────────────────                      │   │
│  │  [Carol's suggestion: "Change to 'Connect instantly'"]             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Chat:                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Bob: Looking good! Ready for final review?                         │  │
│  │  Alice: Almost, just finishing the intro section                    │  │
│  │  Carol: I'll prepare the voice selection                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Matrix

### Current Features (Implemented)

| Feature | Location | Status | Scenarios |
|---------|----------|--------|-----------|
| Script Editor | GenieStudio | ✅ | 1, 3, 6 |
| AI Script Enhancement | GenieStudio | ✅ | 1, 4 |
| Template Library | GenieStudio | ✅ | 6 |
| TTS Generation (ElevenLabs) | GenieStudio | ✅ | 1, 4, 6 |
| TTS Generation (OpenAI) | GenieStudio | ✅ | 1, 4, 6 |
| Voice Selection | GenieStudio | ✅ | 1, 5, 6 |
| Media Library | GenieStudio | ✅ | All |
| Show Scheduling | GenieStudio | ✅ | Podcast/Webcast |
| Video Recording | RecordingStudio | ✅ | 3, 21 |
| Screen Capture | RecordingStudio | ✅ | 3 |
| Picture-in-Picture | RecordingStudio | ✅ | 3 |
| Floating Teleprompter | RecordingStudio | ✅ | 1, 3, 21 |
| Floating Audio Mixer | RecordingStudio | ✅ | 1, 3, 23 |
| Recording Library | RecordingStudio | ✅ | All |
| Background Blur | RecordingStudio | ✅ | 3 |
| FFmpeg Export | RecordingStudio | ✅ | All |
| Keyboard Shortcuts | RecordingStudio | ✅ | All |

### Planned Features (P1-P2)

| Feature | Priority | Target | Scenarios |
|---------|----------|--------|-----------|
| Voice Cloning | P1 | Phase 2 | 5 |
| Recording AI Review | P1 | Phase 2 | 21, 22 |
| Section Re-record | P1 | Phase 2 | 21 |
| Transcription (Whisper) | P1 | Phase 2 | 10, 17 |
| B-Roll Integration | P1 | Phase 2 | 14 |
| Video → Script | P2 | Phase 3 | 17, 18 |
| Translation | P2 | Phase 3 | 19, 51 |
| Cross-Studio Sync | P2 | Phase 3 | 25, 26 |
| Version Compare | P2 | Phase 3 | 28 |

### Future Features (P3-P4)

| Feature | Priority | Roadmap | Scenarios |
|---------|----------|---------|-----------|
| Legal Review Gate | P3 | Q2 2026 | 43 |
| Compliance Check | P3 | Q2 2026 | 44 |
| HIPAA Redaction | P3 | Q3 2026 | 45 |
| Accessibility | P3 | Q3 2026 | 46 |
| Bulk Generation | P3 | Q2 2026 | 33 |
| Real-time Collab | P4 | Q4 2026 | 57 |
| Voice Dubbing | P4 | Q4 2026 | 52 |

---

## UI/UX Specifications

### Design Principles

1. **Progressive Disclosure** - Show essential features first, advanced on demand
2. **Context Preservation** - Maintain state across studio transitions
3. **Non-destructive Editing** - Always preserve original content
4. **Real-time Feedback** - Immediate response to user actions
5. **Keyboard-first** - Full functionality via shortcuts

### Component Library

| Component | Usage | Location |
|-----------|-------|----------|
| `ScriptEditorTab` | Main script editing | Genie Studio |
| `VoiceSelector` | TTS voice selection | Genie Studio |
| `SavedAudioCard` | Audio file display | Genie Studio |
| `FloatingTeleprompter` | Script display during recording | Recording Studio |
| `FloatingAudioMixer` | Multi-channel audio control | Recording Studio |
| `RecordingControls` | Start/stop/pause | Recording Studio |
| `VideoPreview` | Camera/screen preview | Recording Studio |

### Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+Enter` | Start/Stop Recording | Recording Studio |
| `Space` | Pause/Resume Teleprompter | Recording Studio |
| `↑/↓` | Scroll Teleprompter | Recording Studio |
| `Ctrl+S` | Save Script | Genie Studio |
| `Ctrl+E` | AI Enhance | Genie Studio |
| `Ctrl+G` | Generate TTS | Genie Studio |
| `Ctrl+R` | Open Recording Studio | Genie Studio |
| `Esc` | Close Dialog/Panel | Global |

---

## Persona Workflows

### Content Creator Workflow

```
Daily Workflow:
1. Open Genie Studio → Scripts tab
2. Select or create script
3. Use AI to enhance
4. Generate TTS preview
5. Open Recording Studio
6. Record with teleprompter
7. Review and re-record sections
8. Export to MP4
9. Upload to platform

Time: ~30 minutes per 3-minute video
```

### Educator Workflow

```
Course Development:
1. Upload course materials (PDF/PPTX)
2. Generate scripts per section
3. Review and customize
4. Generate TTS for accessibility
5. Record tutorials with screen share
6. Export with captions
7. Add to LMS

Time: ~2 hours per module
```

### Enterprise Comms Workflow

```
Corporate Video Production:
1. Start from template (Announcement)
2. Fill in placeholders
3. Submit for legal review (P3)
4. Receive approval
5. Record with brand guidelines
6. Export multiple formats
7. Distribute via channels

Time: ~4 hours including review
```

---

*Document maintained by Genie Studio UX Team*
