# Unified Media Infrastructure Architecture

> **Document Version:** 1.1.0  
> **Last Updated:** 2026-02-03  
> **Status:** Active - Phase 1 Implementation (JSON2Video Integrated in genie-cast-assembler)

## Overview

This document defines the shared media infrastructure architecture for the Genie Studio ecosystem, enabling video assembly, avatar generation, 3D rendering, and VR/AR across all products with tier-based access control.

## Mobile-to-Cloud Sync Architecture

Vibe Mobile uses **unique offline capture services** that sync to desktop/cloud:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VIBE MOBILE SYNC FLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📱 Mobile (Offline)                                                     │
│  ├── Capture: MediaRecorder / Camera API                                │
│  ├── Store: IndexedDB + useVibeMobileSync queue                         │
│  └── Status: VibeMobileSyncStatus component                             │
│                     │                                                    │
│                     ▼ [Network Restored]                                 │
│                                                                          │
│  ☁️ Cloud Sync                                                          │
│  ├── Auto-sync on reconnect                                             │
│  ├── Manual sync button                                                 │
│  └── Background sync with push notifications                            │
│                     │                                                    │
│                     ▼                                                    │
│                                                                          │
│  🗄️ Supabase Storage                                                    │
│  ├── genie-media/vibe-recordings/                                       │
│  ├── genie-media/vibe-clips/                                            │
│  └── vibe_recordings + vibe_timeline_clips tables                       │
│                     │                                                    │
│                     ▼                                                    │
│                                                                          │
│  🖥️ Desktop/Backend                                                     │
│  ├── JSON2Video Assembly (genie-cast-assembler)                         │
│  ├── Avatar Lip-Sync (Phase 2: Cloud Run GPU)                           │
│  └── Completed video returned to mobile for preview                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Sync Options (All Enabled)

| Option | Description |
|--------|-------------|
| **Auto-sync on reconnect** | Automatically uploads queued recordings when network is restored |
| **Manual sync button** | User explicitly triggers sync to control bandwidth/timing |
| **Background sync + notification** | Silent upload when app is backgrounded, with push notification on complete |

### Key Files

- `src/hooks/useVibeMobileSync.ts` - Core sync service with queue management
- `src/components/mobile/VibeMobileSyncStatus.tsx` - UI indicator (compact + full modes)
- `src/hooks/useVibeRecordingPersistence.ts` - Database persistence for recordings
- `src/hooks/useOfflineSync.ts` - Generic offline queue (used as base pattern)

## Integration Scope by Application

| Application | JSON2Video | Video Assembly | Avatar/Lip-sync | 3D | Notes |
|-------------|------------|----------------|-----------------|-----|-------|
| **Production Hub / Cast** | ✅ Primary | Full pipeline | Phase 2 | Phase 2 | Main batch production via `genie-cast-assembler` |
| **Vibe (Desktop)** | ✅ Recording edits | Recording + editing | Phase 2 | - | `ai-video-generator` |
| **Vibe (Mobile)** | ❌ Sync to cloud | Submit to backend | - | - | `useVibeMobileSync` for offline queue |
| **Deck** | ✅ Slide exports | Slide-to-video | - | - | `share-presentation` |
| **Spark** | ❌ | ❌ | ❌ | ❌ | Text/ideation only |
| **Mind** | ❌ | TTS audio only | ❌ | ❌ | Script enhancement |
| **Ask Genie** | ❌ | ❌ | ❌ | ❌ | Chat support only |

## Workflow: Create → Produce → Publish

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GENIE STUDIO PIPELINE                          │
├─────────────────┬─────────────────────────┬─────────────────────────────┤
│   CREATE        │      PRODUCE            │        PUBLISH              │
│   (Assets)      │      (Assembly)         │        (Distribution)       │
├─────────────────┼─────────────────────────┼─────────────────────────────┤
│ • Spark: Ideas  │ • Vibe: Recording       │ • Cast: Distribution        │
│ • Mind: Scripts │ • Deck: Presentations   │ • Arc: Scheduling           │
│ • TTS: Audio    │ • JSON2Video: Stitching │ • Hub: Assets Library       │
│ • Screenshots   │ • Avatar (Phase 2)      │ • Analytics                 │
└─────────────────┴─────────────────────────┴─────────────────────────────┘
```

## Production Hub Navigation Structure

The Production Hub Admin is organized into two main sections:

### CREATE Section
| Tab | Component | Purpose |
|-----|-----------|---------|
| **Studio** | `SimpleCompositionStudio` | Video composition workspace |
| **Genie Cast** | `UnifiedVideoGenerationPanel` | 8-tab video production (Screenshots, Generate, Matrix, Library, Alerts, Messaging, Analytics, Flow) |
| **Library** | `ContentLibrary` | Asset management and search |

### PUBLISH Section
| Tab | Component | Purpose |
|-----|-----------|---------|
| **Review & Enhance** | Quality control | Final review before distribution |
| **Assets** | Asset export | Download/prepare assets for platforms |
| **Scheduler** | `ContentSchedulerDashboard` | Schedule content publishing |
| **Distribution** | Platform publishing | Push to YouTube, TikTok, LinkedIn, etc. |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED MEDIA INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────────────────┐ │
│  │  JSON2Video API  │    │  Cloud Run GPU   │    │  Supabase Edge Funcs   │ │
│  │  (Phase 1 - NOW) │    │  (Phase 2 - Q2)  │    │     (Existing)         │ │
│  │                  │    │                  │    │                        │ │
│  │ • Video Assembly │    │ • Avatar Lip-    │    │ • TTS Generation       │ │
│  │ • Timeline Edit  │    │   sync (Wan 2.2) │    │ • 4-Zone Routing       │ │
│  │ • Transitions    │    │ • 3D Gen (Meshy) │    │ • Quota Management     │ │
│  │ • Audio Overlay  │    │ • VR/AR Render   │    │ • Provider Fallback    │ │
│  │ • Text/Graphics  │    │ • FFmpeg Heavy   │    │                        │ │
│  │                  │    │ • Custom Edit    │    │                        │ │
│  └────────┬─────────┘    └────────┬─────────┘    └───────────┬────────────┘ │
│           │                       │                          │              │
│           └───────────────────────┼──────────────────────────┘              │
│                                   ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    UNIFIED SERVICE LAYER                               │  │
│  │                                                                        │  │
│  │  unifiedMediaOrchestrator.ts                                          │  │
│  │  ├── globalTierService.ts (tier routing)                              │  │
│  │  ├── 4ZoneRegionalRouter.ts (geo-based provider selection)            │  │
│  │  └── quotaManager.ts (usage tracking per tier)                        │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                         │
├───────────────────────────────────┼─────────────────────────────────────────┤
│              APP CONSUMPTION (Tier-Gated per App)                           │
│                                   ▼                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐ │
│  │  Deck   │ │  Vibe   │ │  Mind   │ │  Spark  │ │Ask Genie│ │ Prod Hub  │ │
│  │Present  │ │Record   │ │Script   │ │Ideas    │ │Chat     │ │ Admin     │ │
│  │         │ │Desktop  │ │         │ │         │ │         │ │           │ │
│  │ Pro+    │ │+Mobile  │ │Creator+ │ │Creator+ │ │All Tiers│ │ Internal  │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Subscription Tiers & Capabilities

### Tier Mapping (Hybrid Model)

| Tier | Video Assembly | Avatar | 3D/VR | Monthly Quota | Quality |
|------|---------------|--------|-------|---------------|---------|
| **Free** | Preview only | ❌ | ❌ | 0 min | - |
| **Creator** | JSON2Video | Basic preset | ❌ | 10 min | 720p |
| **Pro** | JSON2Video | Custom lip-sync | Basic 3D | 60 min | 1080p |
| **Business** | Full pipeline | Wan 2.2 full | Meshy full | 300 min | 4K |
| **Enterprise** | Unlimited | Custom training | VR/AR | Unlimited | 4K+ |
| **Internal Admin** | All features | Full access | Full access | No quota | Max |

### Internal vs External Users

```typescript
// Internal Admin: Unlimited access, no quotas
// External Subscribers: Tier-gated with quotas
const accessModel = {
  internal: {
    roles: ['superAdmin', 'admin', 'internalCreator'],
    quotaEnforced: false,
    allFeaturesEnabled: true,
  },
  external: {
    roles: ['creator', 'pro', 'business', 'enterprise'],
    quotaEnforced: true,
    featuresGatedByTier: true,
  }
};
```

## Phase 1: JSON2Video Integration (Current)

### API Configuration

```typescript
// Secret: JSON2VIDEO_API_KEY (Render tier)
// Role: Render - API access for job submission & retrieval
// Pricing: ~$0.05/minute of rendered video

const JSON2VIDEO_CONFIG = {
  baseUrl: 'https://api.json2video.com/v2',
  role: 'render', // Render tier for API-only access
  capabilities: [
    'timeline-based-editing',
    'audio-overlay',
    'text-graphics',
    'transitions',
    'template-rendering',
  ],
  outputFormats: ['mp4', 'webm'],
  maxDuration: 600, // 10 minutes per job
};
```

### Edge Function Integration

```typescript
// genie-cast-assembler calls JSON2Video for final stitching
const assemblyPipeline = {
  step1: 'TTS generation (4-zone routing)',
  step2: 'Asset collection (screenshots, graphics)',
  step3: 'JSON2Video timeline composition',
  step4: 'Render job submission',
  step5: 'Poll for completion',
  step6: 'Store final video in Supabase Storage',
};
```

## Phase 2: Cloud Run GPU (Planned Q2 2026)

### Workloads for Cloud Run

| Workload | Provider | Processing Time | Why Cloud Run |
|----------|----------|-----------------|---------------|
| Avatar Lip-sync | Alibaba Wan 2.2 S2V | 30-60s | GPU required |
| 3D Generation | Meshy AI | 2-5 min | Heavy compute |
| VR/AR Rendering | TaoAvatar | 3-8 min | Real-time 3DGS |
| Custom FFmpeg | Self-hosted | 1-3 min | Long processing |

### Cloud Run Configuration (Future)

```yaml
# cloud-run-gpu-config.yaml (for subscription planning)
service: genie-media-processor
region: us-central1  # Primary, with multi-region failover
scaling:
  minInstances: 0
  maxInstances: 10
  concurrency: 1  # GPU jobs are sequential
resources:
  cpu: 4
  memory: 16Gi
  gpu:
    type: nvidia-l4
    count: 1
timeout: 900s  # 15 min max for heavy jobs

# Estimated costs:
# - GPU instance: ~$0.50/hour (L4)
# - Average job: 2 min = ~$0.017/job
# - At scale (10k jobs/month): ~$170/month
```

### Migration Path: JSON2Video → Custom

```
Phase 1 (Now)           Phase 2 (Q2 2026)        Phase 3 (Optional)
─────────────────────   ─────────────────────    ──────────────────────
JSON2Video API          + Cloud Run GPU          Replace JSON2Video
• Fast integration      • Avatar lip-sync        • Custom FFmpeg
• Proven, scalable      • 3D generation          • Full control
• ~$0.05/min render     • VR/AR rendering        • Lower cost at scale
                        • Heavy processing       • Keep JSON2Video as
                                                   fallback
```

## 4-Zone Regional Routing Integration

The unified media infrastructure respects the existing 4-zone routing:

```typescript
const ZONE_MEDIA_ROUTING = {
  claude_zone: {
    regions: ['US', 'UK', 'EU', 'LATAM', 'AU', 'NZ'],
    video: ['json2video', 'vertex-veo'],
    avatar: ['elevenlabs-avatar', 'wan-2.2'],
    tts: ['elevenlabs', 'azure-neural'],
  },
  alibaba_zone: {
    regions: ['CN', 'JP', 'KR', 'MENA'],
    video: ['alibaba-wan', 'json2video'],
    avatar: ['wan-2.2-s2v', 'omniavatar'],
    tts: ['cosyvoice', 'azure-neural'],
  },
  gemini_zone: {
    regions: ['IN', 'PK', 'BD', 'SEA', 'Africa'],
    video: ['vertex-veo', 'json2video'],
    avatar: ['wan-2.2', 'modelslab'],
    tts: ['azure-neural', 'google-tts'],
  },
  global_fallback: {
    video: ['json2video', 'modelslab'],
    avatar: ['wan-2.2'],
    tts: ['openai-tts', 'google-tts'],
  },
};
```

## App-Specific Access (Tier-Gated)

### Desktop Applications

| App | Min Tier | Video | Avatar | 3D |
|-----|----------|-------|--------|-----|
| **Deck** | Pro | ✅ Slides → Video | ❌ | ❌ |
| **Vibe Desktop** | Creator | ✅ Recording edit | ✅ Basic | ❌ |
| **Mind** | Creator | ✅ Script → Video | ❌ | ❌ |
| **Spark** | Creator | ✅ Idea previews | ❌ | ❌ |
| **Production Hub** | Internal | ✅ Full pipeline | ✅ Full | ✅ Full |

### Mobile Applications

| App | Min Tier | Capability | Notes |
|-----|----------|------------|-------|
| **Vibe Mobile** | Creator | View + Light edit | Preview mode, submit for desktop render |
| **Ask Genie** | All | Chat only | No video generation on mobile |

## Secrets Configuration

### Current (Phase 1)

| Secret | Purpose | Status |
|--------|---------|--------|
| `JSON2VIDEO_API_KEY` | Video assembly API | ✅ Configured |
| `ELEVENLABS_API_KEY` | TTS + Avatar | ✅ Existing |
| `ALIBABA_API_KEY` | Qwen, Wan, CosyVoice | ✅ Existing |

### Future (Phase 2 - Cloud Run)

| Secret | Purpose | When Needed |
|--------|---------|-------------|
| `GCP_SERVICE_ACCOUNT_KEY` | Cloud Run auth | Phase 2 |
| `MESHY_API_KEY` | 3D generation | Phase 2 |
| `CLOUD_RUN_ENDPOINT` | Custom GPU service URL | Phase 2 |

## Token Consumption Tracking

All media operations track consumption through the existing token transparency system:

```typescript
const mediaConsumption = {
  json2video: {
    unit: 'render_minutes',
    costPerUnit: 0.05,
    trackingTable: 'genie_usage_logs',
  },
  avatar: {
    unit: 'generation_seconds',
    costPerUnit: 0.10,
    trackingTable: 'genie_usage_logs',
  },
  tts: {
    unit: 'characters',
    costPerUnit: 0.00003, // varies by provider
    trackingTable: 'genie_usage_logs',
  },
};
```

## Related Documentation

- [4-Zone Regional Routing](./FOUR_ZONE_REGIONAL_ROUTING.md)
- [Global Tier Service](../src/services/shared/globalTierService.ts)
- [Genie Cast Assembler](../supabase/functions/genie-cast-assembler/)
- [Provider Verification Matrix](./PROVIDER_VERIFICATION_MATRIX_2026.md)
- [Combination Workflow Orchestration](./COMBINATION_WORKFLOW_EDGE_ROUTING.md)

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-03 | 1.2.0 | Added Mobile-to-Cloud Sync architecture, `useVibeMobileSync` hook, `VibeMobileSyncStatus` component |
| 2026-02-03 | 1.1.0 | Added Integration Scope table, Production Hub navigation structure, updated app documentation |
| 2026-02-03 | 1.0.0 | Initial documentation, Phase 1 JSON2Video integration |
