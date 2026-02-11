# Genie Cast — 26 Pipeline Usage Map

> **Last Updated:** 2026-02-11
> **Status:** Living document — update as pipelines are wired

## Overview

Cast has **3 categories / 26 pipelines** in the ecosystem registry (`CATEGORY_REGISTRY`):

| Category | Pipelines | Edge Function | Status |
|---|---|---|---|
| `distribution` | 12 | `social-publish` | ⏳ Phase 3B |
| `marketing` | 8 | `marketing-auto-scheduler` | ⏳ Phase 3B |
| `analytics` | 6 | `analytics-dashboard` | ✅ Wired (narration playback) |

## Category 1: Distribution (12 pipelines)

**Purpose:** Post-production publishing to external platforms (YouTube, LinkedIn, TikTok, Instagram, Twitter/X, Facebook, Bluesky).

| # | Pipeline | Description | Status | Edge Function |
|---|---|---|---|---|
| 1 | social-publish-youtube | Publish to YouTube | ⏳ Phase 3B | `social-publish` |
| 2 | social-publish-linkedin | Publish to LinkedIn | ⏳ Phase 3B | `social-publish` |
| 3 | social-publish-tiktok | Publish to TikTok | ⏳ Phase 3B | `social-publish` |
| 4 | social-publish-instagram | Publish to Instagram | ⏳ Phase 3B | `social-publish` |
| 5 | social-publish-twitter | Publish to Twitter/X | ⏳ Phase 3B | `social-publish` |
| 6 | social-publish-facebook | Publish to Facebook | ⏳ Phase 3B | `social-publish` |
| 7 | social-publish-bluesky | Publish to Bluesky | ⏳ Phase 3B | `social-publish` |
| 8 | embed-widget-generate | Generate embeddable widgets | ⏳ Phase 3B | `social-publish` |
| 9 | interactive-web-deploy | Deploy interactive web content | ⏳ Phase 3B | `social-publish` |
| 10 | landing-page-deploy | Deploy regional landing pages | ⏳ Phase 3B | `social-publish` |
| 11 | email-campaign-distribute | Distribute via email campaigns | ⏳ Phase 3B | `social-publish` |
| 12 | content-syndication | Cross-platform syndication | ⏳ Phase 3B | `social-publish` |

## Category 2: Marketing (8 pipelines)

**Purpose:** Scheduling, automation, and content refresh cycles.

| # | Pipeline | Description | Status | Edge Function |
|---|---|---|---|---|
| 1 | auto-schedule-social | Auto-schedule social posts | ⏳ Phase 3B | `marketing-auto-scheduler` |
| 2 | content-refresh-cycle | Periodic content regeneration | ⏳ Phase 3B | `marketing-auto-scheduler` |
| 3 | regional-content-rotation | Rotate hero/feature content by region | ⏳ Phase 3B | `marketing-auto-scheduler` |
| 4 | ab-test-scheduler | A/B test scheduling & rotation | ⏳ Phase 3B | `marketing-auto-scheduler` |
| 5 | campaign-orchestrator | Multi-channel campaign orchestration | ⏳ Phase 3B | `marketing-auto-scheduler` |
| 6 | audience-segment-push | Push content to audience segments | ⏳ Phase 3B | `marketing-auto-scheduler` |
| 7 | drip-campaign-automation | Automated drip campaigns | ⏳ Phase 3B | `marketing-auto-scheduler` |
| 8 | competitor-response-auto | Auto-respond to competitor moves | ⏳ Phase 3B | `marketing-auto-scheduler` |

## Category 3: Analytics (6 pipelines)

**Purpose:** Track engagement, measure performance, and optimize content.

| # | Pipeline | Description | Status | Edge Function |
|---|---|---|---|---|
| 1 | narration-playback-track | Track regional narration plays on landing pages | ✅ Wired | `analytics-dashboard` |
| 2 | regional-engagement-track | Track per-region engagement metrics | ✅ Wired | `analytics-dashboard` |
| 3 | ab-performance-compare | Compare A/B test performance | ⏳ Phase 3B | `analytics-dashboard` |
| 4 | content-roi-measure | Measure content generation ROI | ⏳ Phase 3B | `analytics-dashboard` |
| 5 | pipeline-usage-monitor | Monitor pipeline usage & costs | ⏳ Phase 3B | `analytics-dashboard` |
| 6 | audience-insights-aggregate | Aggregate audience insights | ⏳ Phase 3B | `analytics-dashboard` |

## Pipeline↔Flow Mapping

### Script Production Flow (Content Creation — NOT Cast pipelines)
- **Transcreation:** `ai-universal-processor` (LLM routing)
- **TTS Generation:** `multi-provider-tts` (Azure/Qwen3)
- **Storage:** `regional_narration_scripts` + `tts_audio_versions` tables

### Landing Page Delivery (Consumer — Cast Analytics)
- **Fetch:** `useRegionalLandingNarration` hook → direct DB query
- **Playback tracking:** `narration_playback_events` table (Cast analytics pipeline #1)
- **Edge function:** `analytics-dashboard` (aggregation & dashboards)

## Key Principle

Cast pipelines are for **post-production operations** (distribute, market, analyze), NOT content creation. Content creation uses Spark/Mind/Vibe pipelines. Cast consumes finished assets and handles their lifecycle after approval.

## Cross-References
- Ecosystem Registry: `src/constants/ecosystemRegistry.ts`
- Content Generation Service: `src/services/contentGenerationService.ts`
- Cast Admin: `src/components/genie-admin/genie-cast/`
- Regional Narration Hook: `src/hooks/useRegionalLandingNarration.ts`
