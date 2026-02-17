# Genie Studio Ecosystem Connection Map

> **Last Updated:** 2026-01-28  
> **Status:** Active Implementation Guide

This document explains how ALL system components are connected and work together.

---

## 🎯 MASTER FLOW DIAGRAM

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        GENIE STUDIO ECOSYSTEM                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │   WIZARD    │────▶│  GENERATION │────▶│   EDITING   │────▶│  PUBLISHING │  │
│  │  (0-8 Steps)│     │  + LOOP     │     │  + LEARNING │     │  + STORAGE  │  │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘  │
│         │                   │                   │                   │         │
│         ▼                   ▼                   ▼                   ▼         │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                    ecosystemIntegrationService                            │ │
│  │  (Central orchestrator connecting ALL components)                         │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│         │                   │                   │                   │         │
│         ▼                   ▼                   ▼                   ▼         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │ ASK GENIE   │     │ BETA AWARDS │     │ RLHF/LABEL  │     │ PRODUCTION  │  │
│  │ (Support)   │     │(Gamification│     │   STUDIO    │     │    HUB      │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘  │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ CONFIDENCE LOOP & LEARNING (95% Target)

### How It Works

```typescript
// Location: src/services/executionEngines/ConfidenceLoopEngine.ts

Flow:
┌──────────────┐
│   INPUT      │
│  (Pipeline)  │
└──────┬───────┘
       ▼
┌──────────────────────────────────────────────────────────┐
│              CONFIDENCE LOOP (5 iterations max)          │
│                                                          │
│   Iteration 1: Primary provider (OpenAI/Claude)          │
│   Iteration 2: Adjust prompt, increase specificity       │
│   Iteration 3: Switch to secondary provider if < 80%     │
│   Iteration 4: Combine outputs (ensemble approach)       │
│   Iteration 5: Human-assisted refinement parameters      │
│                                                          │
│   SCORING WEIGHTS:                                       │
│   • Provider Response Quality: 25%                       │
│   • Language Accuracy: 20%                               │
│   • Format Compliance: 15%                               │
│   • Content Relevance: 20%                               │
│   • Technical Quality: 20%                               │
└──────────────────────────────────────────────────────────┘
       │
       ▼ (If score ≥ 95%)
┌──────────────┐
│   OUTPUT     │
│  (Passed)    │
└──────────────┘
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `pipeline_feedback` | Stores confidence scores per iteration |
| `conversation_learning_feedback` | User corrections for RLHF |
| `genie_session_feedback` | Session-level ratings |

### Learning Flow

```
User Feedback ──▶ ecosystemIntegrationService.trackEvent('feedback_submitted')
                           │
                           ▼
                  labelStudioService.recordEvent()
                           │
                           ▼
                  ┌────────────────┐
                  │ RLHF Training  │
                  │ (Background)   │
                  └────────────────┘
                           │
                           ▼
                  Improved provider selection
                  Better prompt adjustments
                  Higher confidence scores
```

---

## 2️⃣ FILE STORAGE & VERSIONING

### Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILE STORAGE FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ORIGINAL INPUT                                                  │
│  └── Stored in: media_assets (type: 'original')                 │
│      └── Fields: file_url, thumbnail_url, metadata               │
│                                                                  │
│  GENERATED OUTPUT (Version 1, 2, 3...)                          │
│  └── Stored in: presentation_versions                            │
│      └── Fields: version, slides_json, status, confidence_scores │
│      └── Relationship: presentation_id → presentations           │
│                                                                  │
│  EDIT SESSIONS                                                   │
│  └── Stored in: pipeline_edit_sessions                           │
│      └── Fields: pipeline_id, session_data, edit_history         │
│                                                                  │
│  DRAFTS (Auto-save)                                              │
│  └── Stored in: editor_drafts                                    │
│      └── Synced via: useSupabasePersistence hook                 │
│      └── Offline backup: IndexedDB via useOfflineQueue           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Original vs Versions Differentiation

```sql
-- presentation_versions table structure
- id: UUID (primary key)
- presentation_id: UUID (foreign key → original)
- version: INTEGER (1, 2, 3...)
- language_code: TEXT (for multi-language)
- slides_json: JSONB (the actual content)
- status: TEXT ('generating' | 'completed' | 'failed')
- confidence_scores: JSONB (per-slide confidence)
- created_at: TIMESTAMP

-- Query: Get original vs latest version
SELECT * FROM presentation_versions 
WHERE presentation_id = {id} 
ORDER BY version DESC;
```

---

## 3️⃣ WIZARD STEPS (0-8) CONNECTION

### Step-by-Product Mapping

```
┌────────────────────────────────────────────────────────────────────┐
│                    8-STEP WIZARD → PRODUCT FLOW                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 0: Universal Input Gateway ────────────▶ SPARK (Owner)       │
│          (Video, Audio, URL, Document, Screen)                      │
│                                                                     │
│  Step 1: Language Selection ─────────────────▶ ALL PRODUCTS        │
│          (70+ languages, 6-zone routing)                            │
│                                                                     │
│  Step 2: Industry & Segment ─────────────────▶ SPARK/MIND          │
│          (25 industries, context setup)                             │
│                                                                     │
│  Step 3: Framework & Category ───────────────▶ DECK/MIND           │
│          (101 frameworks)                                           │
│                                                                     │
│  Step 4: Design & Template ──────────────────▶ DECK                │
│          (Visual themes, branding)                                  │
│                                                                     │
│  Step 5: Visual Features ────────────────────▶ DECK/VIBE           │
│          (100+ features, 22 categories)                             │
│                                                                     │
│  Step 6: Agent & Voice Orchestration ────────▶ MIND/VIBE           │
│          (A2A agents, TTS, voice cloning)                          │
│                                                                     │
│  Step 7: Generation & Editing ───────────────▶ PRODUCT-AWARE       │
│          • VIBE → Timeline Editor                                   │
│          • DECK → Canvas Editor                                     │
│          • SPARK/MIND → Document Editor                             │
│          + Confidence Loop (95% target)                             │
│          + Proactive Editing Suggestions                            │
│                                                                     │
│  Step 8: Publishing & Distribution ──────────▶ CAST                │
│          (14 regions, 10+ platforms)                                │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Wizard Tracking Integration

```typescript
// Location: src/hooks/useWizardEcosystemIntegration.ts

// Every step completion is tracked:
onStepComplete(step, stepName, selections) ─▶ ecosystemIntegrationService
                                                      │
                                                      ▼
                                              ┌───────────────┐
                                              │ Beta Awards   │ (points)
                                              │ Ask Genie     │ (context)
                                              │ Analytics     │ (metrics)
                                              └───────────────┘
```

---

## 4️⃣ 206 PIPELINES → 21 CATEGORIES

### Distribution Map

```
┌───────────────────────────────────────────────────────────────────────────────┐
│              206 PIPELINES ACROSS 7 PRODUCTS & 21 CATEGORIES                  │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  SPARK (28 pipelines) - "Ignite your Ideas"                                   │
│  ├── input-processing (8) ─────────▶ document-processor edge function         │
│  ├── script-generation (12) ───────▶ ai-universal-processor                   │
│  └── content-extraction (8) ───────▶ azure-form-recognizer                    │
│                                                                                │
│  MIND (30 pipelines) - "AI That Understands"                                  │
│  ├── script-enhancement (10) ──────▶ enhance-script                           │
│  ├── tts-generation (8) ───────────▶ elevenlabs-voice                         │
│  ├── music-generation (6) ─────────▶ multi-provider-music                     │
│  └── translation (6) ──────────────▶ translation-service                      │
│                                                                                │
│  VIBE (74 pipelines) - "Script to Screen"                                     │
│  ├── video-generation (15) ────────▶ ai-video-generator                       │
│  ├── video-editing (15) ───────────▶ pipeline-editor-processor                │
│  ├── audio-production (10) ────────▶ audio-mixer                              │
│  ├── podcast-webcast (16) ─────────▶ extract-video-audio                      │
│  ├── avatar-lipsync (10) ──────────▶ ai-video-generator                       │
│  └── dubbing (8) ──────────────────▶ multi-language-audio-orchestrator        │
│                                                                                │
│  DECK (34 pipelines) - "Ideas to Impact"                                      │
│  ├── presentation (12) ────────────▶ share-presentation                       │
│  ├── visual-design (10) ───────────▶ ai-image-generator                       │
│  └── 3d-immersive (12) ────────────▶ modelslab-media                          │
│                                                                                │
│  ARC (14 pipelines) - "Production Journey"                                    │
│  ├── scheduling (8) ───────────────▶ calendar-sync                            │
│  └── collaboration (6) ────────────▶ workspace-collaboration                  │
│                                                                                │
│  CAST (26 pipelines) - "Make It. Show It. Scale It."                          │
│  ├── distribution (12) ────────────▶ social-publish                           │
│  ├── marketing (8) ────────────────▶ marketing-auto-scheduler                 │
│  └── analytics (6) ────────────────▶ analytics-dashboard                      │
│                                                                                │
│  STUDIO - Master Orchestrator (ALL 206 pipelines access)                      │
│                                                                                │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Category → Edge Function Mapping

```typescript
// Location: src/constants/ecosystemRegistry.ts (CATEGORY_REGISTRY)

Each category maps to:
1. Primary Product (owner)
2. Shared Products (cross-functional)
3. Pipeline Count
4. Edge Function (backend execution)

Example:
'avatar-lipsync': {
  product: 'vibe',
  pipelines: 10,
  edgeFunction: 'ai-video-generator'
}
```

---

## 5️⃣ SUPPORT & ASK GENIE CONNECTION

### Knowledge Base Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                    ASK GENIE KNOWLEDGE FLOW                       │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  askGeniePipelineKnowledgeBase.ts                                 │
│  └── Contains:                                                     │
│      • All 206 pipelines with troubleshooting                      │
│      • 8-step wizard guidance                                      │
│      • Editing modes (Canvas/Timeline/Document)                    │
│      • A2A agent orchestration knowledge                          │
│      • Common issues + solutions                                   │
│                                                                    │
│  SUPPORT ESCALATION PATH:                                          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │  Ask Genie  │────▶│   Ticket    │────▶│   Human     │          │
│  │   (AI L1)   │     │  (Pro+)     │     │   Agent     │          │
│  └─────────────┘     └─────────────┘     └─────────────┘          │
│                                                                    │
│  TIER-BASED SLAs:                                                  │
│  • Enterprise: < 30 min                                            │
│  • Business: < 2 hours                                             │
│  • Pro: < 12 hours                                                 │
│  • Free/Starter: < 24 hours (AI only)                              │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Support Integration Points

```typescript
// ecosystemIntegrationService handles:
- 'support_ticket_created' event → tracked for analytics
- 'feedback_submitted' event → routes to RLHF
- 'bug_reported' event → Beta Awards + tracking
- 'feature_requested' event → Beta Awards + backlog

// Ask Genie context includes:
{
  pipelines: 206,
  wizardSteps: 8,
  currentProduct: context.product,
  tier: context.tier,
  capabilities: [
    'Pipeline troubleshooting',
    'Wizard guidance',
    'Editor assistance',
    'Feature recommendations',
    'Upgrade suggestions'
  ]
}
```

---

## 6️⃣ PRODUCTION HUB CONNECTION

### Hub → Ecosystem Integration

```
┌───────────────────────────────────────────────────────────────────┐
│                    PRODUCTION HUB (/genie-admin)                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  10+ TABS (Consolidated from Arc + Legacy)                        │
│  ├── Kanban ──────────────────▶ project workflows                 │
│  ├── Calendar ────────────────▶ scheduling (was Arc)              │
│  ├── Content Library ─────────▶ show_assets, media_project_assets │
│  ├── Composition Studio ──────▶ Mix-and-match generation          │
│  ├── Scheduler ───────────────▶ distribution scheduling           │
│  ├── Analytics ───────────────▶ usage metrics                     │
│  ├── Workspaces ──────────────▶ team isolation                    │
│  ├── Team ────────────────────▶ RBAC management                   │
│  └── Whitelabel ──────────────▶ branding config                   │
│                                                                    │
│  DATA FLOW:                                                        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │  Generation │────▶│   Library   │────▶│   Publish   │          │
│  │  (Wizard)   │     │  (Storage)  │     │   (Cast)    │          │
│  └─────────────┘     └─────────────┘     └─────────────┘          │
│                             │                                      │
│                             ▼                                      │
│                    presentation_versions                           │
│                    media_project_assets                            │
│                    show_assets                                     │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

---

## 7️⃣ TIER FEATURE GATING

### Integration with Pricing

```typescript
// Location: src/config/tierFeatureGating.ts

TIER_FEATURE_ACCESS maps to:
├── Pricing Page (EnhancedPricingSection.tsx)
├── Wizard Steps (feature availability)
├── Mix-and-Match Selector (combination limits)
└── Editor (premium editing tools)

GATING EXAMPLES:
• Lipsync/Dubbing: Creator+ (Free gets 1-min preview)
• AI Avatar: Pro+
• 3D/Immersive: Pro+
• VR/AR: Enterprise only
```

---

## 8️⃣ CROSS-FUNCTIONAL CAPABILITIES

### 25 Capabilities Across Products

```
┌───────────────────────────────────────────────────────────────────┐
│              CROSS-FUNCTIONAL CAPABILITY REGISTRY                 │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CATEGORY: Avatar (5 capabilities)                                │
│  └── ai-avatar, avatar-lipsync, talking-head, avatar-gesture      │
│  └── Products: Vibe, Deck, Cast                                   │
│                                                                    │
│  CATEGORY: Immersive (6 capabilities)                             │
│  └── 3d-generation, ar-preview, vr-presentation, 360-video        │
│  └── Products: Deck, Vibe                                         │
│                                                                    │
│  CATEGORY: Audio (4 capabilities)                                 │
│  └── tts, voice-clone, music-generation, sfx                      │
│  └── Products: Mind, Vibe, Deck                                   │
│                                                                    │
│  CATEGORY: Localization (4 capabilities)                          │
│  └── translation, dubbing, transcreation, dialect-adaptation      │
│  └── Products: Mind, Vibe, Cast                                   │
│                                                                    │
│  CATEGORY: Video (3 capabilities)                                 │
│  └── video-generation, lip-sync, video-editing                    │
│  └── Products: Vibe                                               │
│                                                                    │
│  CATEGORY: Collaboration (2 capabilities)                         │
│  └── real-time-editing, version-control                           │
│  └── Products: Arc, All                                           │
│                                                                    │
│  CATEGORY: Distribution (1 capability)                            │
│  └── multi-platform-publish                                       │
│  └── Products: Cast                                               │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

---

## 9️⃣ COMPLETE DATA FLOW

```
USER ACTION                  SERVICE LAYER                DATABASE
───────────────────────────────────────────────────────────────────

1. Start Wizard
   └─▶ useWizardEcosystemIntegration ─▶ ecosystemIntegrationService
                                                    │
2. Complete Steps                                   │
   └─▶ trackEvent('wizard_step_completed') ────────│
                                                    │
3. Generate Content                                 │
   └─▶ confidenceLoopEngine.executeWithConfidenceLoop()
       └─▶ Up to 5 iterations for 95%              │
       └─▶ logToLabelStudio() ─────────────────────┼─▶ pipeline_feedback
                                                    │
4. Save Output                                      │
   └─▶ presentation_versions ──────────────────────┼─▶ Version 1,2,3...
   └─▶ media_project_assets ───────────────────────┼─▶ Files/URLs
                                                    │
5. Edit in Editor                                   │
   └─▶ proactivePipelineEditorService              │
   └─▶ pipeline_edit_sessions ─────────────────────┼─▶ Edit history
   └─▶ editor_drafts ──────────────────────────────┼─▶ Auto-save
                                                    │
6. Submit Feedback                                  │
   └─▶ trackEvent('feedback_submitted')            │
       └─▶ betaAwardsService.recordActivity() ─────┼─▶ Points
       └─▶ labelStudioService.recordEvent() ───────┼─▶ RLHF data
                                                    │
7. Publish                                          │
   └─▶ Cast distribution ──────────────────────────┼─▶ 10+ platforms
                                                    │
8. Support Query                                    │
   └─▶ Ask Genie (askGeniePipelineKnowledgeBase)   │
       └─▶ 206 pipeline troubleshooting            │
       └─▶ Escalate to ticket if needed ───────────┼─▶ support_tickets

───────────────────────────────────────────────────────────────────
```

---

## 🔑 KEY FILES REFERENCE

| Component | File Location |
|-----------|---------------|
| Confidence Loop | `src/services/executionEngines/ConfidenceLoopEngine.ts` |
| Ecosystem Integration | `src/services/ecosystemIntegrationService.ts` |
| Ask Genie Knowledge | `src/services/askGeniePipelineKnowledgeBase.ts` |
| Ecosystem Registry | `src/constants/ecosystemRegistry.ts` |
| Pipeline Mapping | `src/constants/pipelineProductMapping.ts` |
| Cross-Functional | `src/constants/crossFunctionalCapabilities.ts` |
| Wizard Integration | `src/hooks/useWizardEcosystemIntegration.ts` |
| Proactive Editing | `src/services/proactivePipelineEditorService.ts` |
| Tier Gating | `src/config/tierFeatureGating.ts` |
| Label Studio RLHF | `src/services/labelStudioBackgroundService.ts` |

---

## ✅ VALIDATION CHECKLIST

- [ ] 206 pipelines distributed across 7 products
- [ ] 21 categories mapped to edge functions
- [ ] 25 cross-functional capabilities available
- [ ] Confidence Loop targets 95% quality
- [ ] File versioning tracks original vs iterations
- [ ] Wizard steps 0-8 connected to products
- [ ] Support escalation path defined by tier
- [ ] Production Hub consolidates Arc + admin tools
- [ ] Tier gating enforced across UI and pricing
