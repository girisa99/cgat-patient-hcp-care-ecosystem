# GENIE ECOSYSTEM COMPLETE MATRIX - 2026

> **Last Updated**: 2026-01-30
> **Status**: PRODUCTION VERIFIED
> **Total**: 7 Products | 21 Categories | 206 Pipelines | 25 Capabilities | 15 AI Providers

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [7 Products Overview](#7-products-overview)
3. [21 Categories → 206 Pipelines](#21-categories--206-pipelines)
4. [15 AI Providers Matrix](#15-ai-providers-matrix)
5. [14 Capability → Provider Routing](#14-capability--provider-routing)
6. [Combination Workflows](#combination-workflows)
7. [Regional Routing (7 Zones)](#regional-routing-7-zones)
8. [Edge Function Mapping](#edge-function-mapping)
9. [Editor Mode Mapping](#editor-mode-mapping)
10. [Production Hub Integration](#production-hub-integration)
11. [Wizard Step Routing](#wizard-step-routing)
12. [Verification Checklist](#verification-checklist)

---

## 📊 EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| **Products** | 7 (Spark, Mind, Vibe, Deck, Arc, Cast, Studio) |
| **Pipeline Categories** | 21 |
| **Total Pipelines** | 206 |
| **Cross-Functional Capabilities** | 25 |
| **AI Providers (Configured)** | 15 |
| **Regional Zones** | 7 |
| **Combination Workflows** | 25+ |
| **Edge Functions** | 18+ |
| **Supported Languages** | 70+ |

---

## 🎯 7 PRODUCTS OVERVIEW

### Product → Category → Pipeline Distribution

| Product | Tagline | Primary Pipelines | Shared Access | Total Access | Categories |
|---------|---------|-------------------|---------------|--------------|------------|
| **Spark** | "Ignite your Ideas" | 28 | 12 | 40 | 3 (Input, Script, Extraction) |
| **Mind** | "AI That Understands" | 30 | 15 | 45 | 4 (Enhancement, TTS, Music, Translation) |
| **Vibe** | "Script to Screen" | 64 | 20 | 84 | 6 (Video, Editing, Audio, Podcast, Avatar, Dubbing) |
| **Deck** | "Ideas to Impact" | 34 | 18 | 52 | 3 (Presentation, Visual, 3D) |
| **Arc** | "Production Journey" | 14 | 10 | 24 | 2 (Scheduling, Collaboration) |
| **Cast** | "Make It. Show It. Scale It." | 26 | 24 | 50 | 3 (Distribution, Marketing, Analytics) |
| **Studio** | "Universal Orchestrator" | 0 | 206 | 206 | All 21 |

### Quadrant Workflow

```
CREATE (Spark, Mind, Deck) → PRODUCE (Vibe) → MANAGE (Arc, Hub) → PUBLISH (Cast)
```

---

## 📂 21 CATEGORIES → 206 PIPELINES

### SPARK Categories (3) - 28 Pipelines

| Category ID | Category Name | Pipelines | Edge Function | Editor Mode |
|-------------|---------------|-----------|---------------|-------------|
| `input-processing` | Input Processing | 8 | `document-processor` | Document |
| `script-generation` | Script Generation | 12 | `ai-universal-processor` | Document |
| `content-extraction` | Content Extraction | 8 | `azure-form-recognizer` | Document |

**Pipelines Include**: Document-to-Script, PPT-to-Script, Video-to-Script, Audio-to-Script, URL-to-Script, Image-to-Script, Screen-to-Script, OCR Extraction, Summarization, Key Point Extraction

---

### MIND Categories (4) - 30 Pipelines

| Category ID | Category Name | Pipelines | Edge Function | Editor Mode |
|-------------|---------------|-----------|---------------|-------------|
| `script-enhancement` | Script Enhancement | 10 | `enhance-script` | Document |
| `tts-generation` | TTS & Voice | 8 | `elevenlabs-voice` | Timeline |
| `music-generation` | Music & Audio | 6 | `multi-provider-music` | Timeline |
| `translation` | Translation | 6 | `translation-service` | Document |

**Pipelines Include**: AI Editing, Tone Adjustment, Style Refinement, Text-to-Speech (70+ languages), Voice Cloning, Multi-Language Translation, Music Generation, Audio Enhancement

---

### VIBE Categories (6) - 74 Pipelines

| Category ID | Category Name | Pipelines | Edge Function | Editor Mode |
|-------------|---------------|-----------|---------------|-------------|
| `video-generation` | Video Generation | 15 | `ai-video-generator` | Timeline |
| `video-editing` | Video Editing | 15 | `pipeline-editor-processor` | Timeline |
| `audio-production` | Audio Production | 10 | `audio-mixer` | Timeline |
| `podcast-webcast` | Podcast & Webcast | 16 | `extract-video-audio` | Timeline |
| `avatar-lipsync` | Avatar & Lip-sync | 10 | `ai-video-generator` | Timeline |
| `dubbing` | Dubbing & Localization | 8 | `multi-language-audio-orchestrator` | Timeline |

**Pipelines Include**: Text-to-Video, Image-to-Video, Script-to-Video, Video Trim/Crop/Stitch, AI Avatar, Lip-Sync, Talking Photo, Multi-Language Dubbing, Podcast Recording, Webcast Production

---

### DECK Categories (3) - 34 Pipelines

| Category ID | Category Name | Pipelines | Edge Function | Editor Mode |
|-------------|---------------|-----------|---------------|-------------|
| `presentation` | Presentation Generation | 12 | `share-presentation` | Canvas |
| `visual-design` | Visual Design | 10 | `ai-image-generator` | Canvas |
| `3d-immersive` | 3D & Immersive | 12 | `modelslab-media` | Canvas |

**Pipelines Include**: AI Slide Creation, PPT Export, PDF Export, Infographics, Charts, Diagrams, 3D Models, VR/AR Experiences, Interactive 3D

---

### ARC Categories (2) - 14 Pipelines

| Category ID | Category Name | Pipelines | Edge Function | Editor Mode |
|-------------|---------------|-----------|---------------|-------------|
| `scheduling` | Scheduling & Workflow | 8 | `calendar-sync` | Canvas |
| `collaboration` | Collaboration | 6 | `workspace-collaboration` | Canvas |

**Pipelines Include**: Project Scheduling, Kanban, Task Management, Team Workflows, Review, Approval Chains

---

### CAST Categories (3) - 26 Pipelines

| Category ID | Category Name | Pipelines | Edge Function | Editor Mode |
|-------------|---------------|-----------|---------------|-------------|
| `distribution` | Distribution | 12 | `social-publish` | Canvas |
| `marketing` | Marketing Engine | 8 | `marketing-auto-scheduler` | Canvas |
| `analytics` | Analytics | 6 | `analytics-dashboard` | Canvas |

**Pipelines Include**: YouTube Publish, LinkedIn Publish, TikTok Publish, Instagram Publish, X Publish, Automated Marketing, Regional Campaigns, Performance Tracking

---

## 🔑 15 AI PROVIDERS MATRIX

### Configured Providers with API Keys

| # | Provider | API Key | Primary Capabilities | Regional Strength |
|---|----------|---------|---------------------|-------------------|
| 1 | **OpenAI** | `OPENAI_API_KEY` | LLM, TTS, STT (Whisper), Image (DALL-E 3), Vision | Global, LATAM |
| 2 | **Claude** | `ANTHROPIC_API_KEY` | LLM, Translation (Literary), Vision, NLP | Western/EU |
| 3 | **Gemini** | `GEMINI_API_KEY` | LLM, Translation, OCR, Image Gen, Vision, NLP | India/SEA, Africa |
| 4 | **Deepgram** | `DEEPGRAM_API_KEY` | **PRIMARY STT** (<100ms real-time), 36+ languages | Global |
| 5 | **DeepSeek** | `DEEPSEEK_API_KEY` | LLM (CJK), Translation, OCR, Vision (low cost) | CJK |
| 6 | **Alibaba** | `ALIBABA_API_KEY` + `ALIBABA_CHINA_API_KEY` | LLM, TTS (Qwen3-TTS), STT, **PRIMARY Avatar/Lip-Sync**, Video, Image | CJK (⚠️ Avatar/3D pending rep activation) |
| 7 | **Azure** | `AZURE_SPEECH_KEY` | TTS (Neural, Visemes), STT, OCR, Translation | MENA, Enterprise |
| 8 | **DeepL** | `DEEPL_API_KEY` | **PRIMARY Translation** (European) | Western/EU |
| 9 | **ElevenLabs** | `ELEVENLABS_API_KEY` | **PRIMARY TTS**, Voice Clone, **PRIMARY Music**, SFX | Western/EU, LATAM |
| 10 | **Sora2API** | `SORA2API_KEY` | **PRIMARY Video** (Cinematic, Realistic) | Global |
| 11 | **ModelsLab** | `MODELSLAB_API_KEY` | **PRIMARY Image** (FLUX), AnimateDiff, SVD, 3D | Global |
| 12 | **Meshy** | `MESHY_API_KEY` | **PRIMARY 3D** (PBR textures, rigging, USDZ/GLTF/FBX) | Global |
| 13 | **Replicate** | `REPLICATE_API_TOKEN` | Image, Video, 3D (fallback), TripoSR | Global (Fallback) |
| 14 | **Google Cloud** | `GOOGLE_API_KEY` | TTS (WaveNet), STT, Translation, Vision | India/SEA, Africa |
| 15 | **HuggingFace** | `HUGGING_FACE_ACCESS_TOKEN` | Open models, LLM fallback, Image fallback | Budget Fallback |

### ❌ NOT Configured (Excluded)

| Provider | Reason | Alternative |
|----------|--------|-------------|
| HeyGen | No API Key | Alibaba WAN 2.2 |
| Suno | No API Key | ElevenLabs Music |
| RunPod | No Docker setup | ModelsLab/Meshy |
| Runway Gen-3 | No API Key | Sora2API |

---

## 🎯 14 CAPABILITY → PROVIDER ROUTING

### Complete Fallback Chains (P1 → P5+)

| Capability | P1 (Primary) | P2 | P3 | P4 | P5+ (Budget) |
|------------|--------------|-----|-----|-----|--------------|
| **LLM** | Gemini | OpenAI | Claude | DeepSeek | Alibaba, HuggingFace |
| **Translation** | DeepL | Azure | Claude | Google | OpenAI, DeepSeek |
| **OCR** | Azure Form Recognizer | Gemini | Google Vision | Alibaba | DeepSeek |
| **TTS** | ElevenLabs | Azure Neural | OpenAI | Google WaveNet | Alibaba, ModelsLab |
| **STT** | **Deepgram** (<100ms) | OpenAI Whisper | Azure | Google | Alibaba |
| **Image** | ModelsLab FLUX | Gemini | OpenAI DALL-E 3 | Replicate | Alibaba, HuggingFace |
| **Video** | **Sora2API** | ModelsLab | Gemini Veo | Replicate | Alibaba |
| **3D** | **Meshy** | ModelsLab | Replicate (TripoSR) | Alibaba | - |
| **VR/AR** | **Meshy** (USDZ/GLTF) | ModelsLab | - | - | - |
| **Avatar** | **Alibaba WAN 2.2** | Azure Visemes | ModelsLab | - | - |
| **Lip-Sync** | **Alibaba WAN 2.2** | Azure Visemes | ModelsLab | - | - |
| **Music** | **ElevenLabs** | ModelsLab | Alibaba | - | - |
| **SFX** | **ElevenLabs** | ModelsLab | Azure | - | - |
| **Vision** | Gemini | OpenAI GPT-4V | Claude | Google | Alibaba, DeepSeek |
| **NLP** | Gemini | OpenAI | Claude | Azure Language | DeepSeek, Alibaba |

---

## 🔗 COMBINATION WORKFLOWS

### 25+ Pre-Defined Workflows by Tier

#### Basic Workflows (Free - Starter)

| Workflow ID | Name | Elements | Cost | Tier |
|-------------|------|----------|------|------|
| `basic_presentation` | Basic Presentation | Slides + PDF | 1 | Free |
| `professional_deck` | Professional Deck | Slides + PPTX | 2 | Starter |

#### Animated Workflows (Creator)

| Workflow ID | Name | Elements | Cost | Tier |
|-------------|------|----------|------|------|
| `animated_presentation` | Animated Presentation | Slides + Charts + Transitions | 6 | Creator |
| `motion_graphics_video` | Motion Graphics Video | Slides + Typography + Music | 13 | Creator |

#### Video + Narration Workflows (Creator - Pro)

| Workflow ID | Name | Elements | Cost | Tier |
|-------------|------|----------|------|------|
| `narrated_presentation` | Narrated Presentation | Slides + Voiceover + Transitions | 8 | Creator |
| `global_video` | Global Multi-Language | Slides + Dubbing (70+ langs) | 25 | Pro |

#### Avatar Workflows (Pro - Business)

| Workflow ID | Name | Elements | Cost | Tier |
|-------------|------|----------|------|------|
| `avatar_presenter` | AI Avatar Presenter | Slides + Avatar + Lip-Sync | 31 | Pro |
| `full_body_presenter` | Full-Body Presenter | Slides + Full Avatar + Music | 55 | Business |
| `talking_photo_story` | Talking Photo Story | Photo + Voice + Music | 25 | Pro |

#### 3D & Immersive Workflows (Pro - Enterprise)

| Workflow ID | Name | Elements | Cost | Tier |
|-------------|------|----------|------|------|
| `3d_product_showcase` | 3D Product Showcase | Slides + 3D + Voice | 31 | Pro |
| `3d_avatar_experience` | 3D + Avatar Experience | Avatar + 3D + Video | 60 | Business |
| `vr_presentation` | VR Presentation | Slides + 3D + VR Export | 80 | Enterprise |
| `ar_product_demo` | AR Product Demo | 3D + AR + Voice | 60 | Business |

#### Interactive Workflows (Creator - Pro)

| Workflow ID | Name | Elements | Cost | Tier |
|-------------|------|----------|------|------|
| `interactive_training` | Interactive Training | Slides + Quiz + Voice | 15 | Creator |
| `microlearning_series` | Microlearning Series | Modules + Voice + Music | 20 | Pro |
| `branching_course` | Branching Narrative | Branches + Avatar + Tracking | 40 | Pro |

### Combination Matrix (What Mixes With What)

| Base | +TTS | +Avatar | +3D | +VR/AR | +Video | Providers Used |
|------|------|---------|-----|--------|--------|----------------|
| **PPT** | ✅ | ✅ | ✅ | ✅ | ✅ | Gemini, ElevenLabs, Alibaba, Meshy, Sora2API |
| **Video** | ✅ | ✅ | ✅ | ✅ | - | Sora2API, ElevenLabs, Alibaba, Meshy |
| **Avatar** | ✅ | - | ✅ | ✅ | ✅ | Alibaba, Meshy, ElevenLabs |
| **3D** | ✅ | ✅ | - | ✅ | ✅ | Meshy, Alibaba, Sora2API |

---

## 🌍 REGIONAL ROUTING (7 ZONES)

### Zone Configuration

| Zone | Primary LLM | Primary TTS | Primary STT | Primary Video | Primary 3D | Status |
|------|-------------|-------------|-------------|---------------|------------|--------|
| **1: Western/EU** | Claude | ElevenLabs | Deepgram | Sora2API | Meshy | ✅ |
| **2: CJK** | Alibaba Qwen | Azure Neural (interim) | Deepgram | Wan 2.6 (Intl) | Meshy | ⚠️ TTS/Avatar pending |
| **3: India/SEA** | Gemini | Azure Neural | Deepgram | Sora2API | Meshy | ✅ |
| **4: MENA** | Claude | Azure Neural | Deepgram | Sora2API | Meshy | ✅ |
| **5: LATAM** | OpenAI | ElevenLabs | Deepgram | Sora2API | Meshy | ✅ |
| **6: Africa** | Gemini | Azure Neural | Deepgram | Gemini Veo | Meshy | ✅ |
| **7: Global English** | OpenAI | ElevenLabs | Deepgram | Sora2API | Meshy | ✅ |

> **Note (Feb 2026):** CJK Zone TTS now uses Qwen3-TTS (qwen3-tts-flash) as primary via Singapore DashScope REST API, with Azure Neural as fallback. Avatar models (Wan 2.2, OmniAvatar, TaoAvatar, MACH) pending activation — ModelsLab/Azure serve as fallbacks.

### Regional Language Mappings

| Zone | Languages | TTS Dialects |
|------|-----------|--------------|
| CJK | zh, ja, ko | 7 Chinese dialects, Japanese, Korean |
| MENA | ar, he, fa, ur | 7 Arabic dialects (Gulf, Egyptian, Levantine, etc.) |
| India/SEA | hi, ta, te, th, vi, id, ms | Hindi, Tamil, Telugu, Thai, Vietnamese, Indonesian |
| LATAM | es, pt | Latin Spanish, Brazilian Portuguese |
| Africa | sw, ha, yo, zu, am | Swahili, Hausa, Yoruba, Zulu, Amharic |

---

## ⚡ EDGE FUNCTION MAPPING

### Category → Edge Function

| Edge Function | Categories Served | Primary Provider |
|---------------|-------------------|------------------|
| `ai-universal-processor` | script-generation, script-enhancement, presentation | Gemini, OpenAI |
| `document-processor` | input-processing, content-extraction | Azure, Gemini |
| `ai-video-generator` | video-generation, avatar-lipsync | Sora2API, Alibaba |
| `pipeline-editor-processor` | video-editing | FFmpeg |
| `elevenlabs-voice` | tts-generation | ElevenLabs |
| `multi-provider-music` | music-generation | ElevenLabs |
| `translation-service` | translation | DeepL, Azure |
| `modelslab-media` | 3d-immersive, visual-design | Meshy, ModelsLab |
| `social-publish` | distribution | Platform APIs |
| `marketing-auto-scheduler` | marketing | Internal |
| `multi-language-audio-orchestrator` | dubbing | ElevenLabs, Azure, Alibaba |
| `azure-form-recognizer` | content-extraction | Azure |
| `audio-mixer` | audio-production | FFmpeg |
| `extract-video-audio` | podcast-webcast | FFmpeg |
| `share-presentation` | presentation | Browser Render |
| `calendar-sync` | scheduling | Internal |
| `workspace-collaboration` | collaboration | Supabase |
| `analytics-dashboard` | analytics | Supabase |

---

## 🎨 EDITOR MODE MAPPING

### Category → Editor Mode

| Editor Mode | Categories | Products |
|-------------|------------|----------|
| **Document** | input-processing, script-generation, content-extraction, script-enhancement, translation | Spark, Mind |
| **Timeline** | tts-generation, music-generation, video-generation, video-editing, audio-production, podcast-webcast, avatar-lipsync, dubbing | Mind, Vibe |
| **Canvas** | presentation, visual-design, 3d-immersive, scheduling, collaboration, distribution, marketing, analytics | Deck, Hub, Cast |
| **Hybrid** | Full production workflows | Suite |

---

## 🏭 PRODUCTION HUB INTEGRATION

### Production Hub Stages → Categories

| Stage | Categories | Edge Functions | Editor Mode |
|-------|------------|----------------|-------------|
| **Setup** | input-processing | document-processor | Document |
| **Create** | script-generation, script-enhancement | ai-universal-processor | Document |
| **Voice** | tts-generation, music-generation | elevenlabs-voice, multi-provider-music | Timeline |
| **Visual** | visual-design, 3d-immersive, video-generation | modelslab-media, ai-video-generator | Canvas/Timeline |
| **Avatar** | avatar-lipsync | ai-video-generator | Timeline |
| **Review** | video-editing, audio-production | pipeline-editor-processor | Timeline |
| **Schedule** | scheduling | calendar-sync | Canvas |
| **Publish** | distribution, marketing | social-publish | Canvas |
| **Analyze** | analytics | analytics-dashboard | Canvas |

---

## 🧙 WIZARD STEP ROUTING

### Step → Categories → Providers

| Step | Name | Categories Used | Primary Providers |
|------|------|-----------------|-------------------|
| 0 | Input | input-processing, content-extraction | Azure, Deepgram, Gemini |
| 1 | Language | translation | DeepL, Azure, Google |
| 2 | Industry | script-generation | Gemini, OpenAI |
| 3 | Framework | script-enhancement | Gemini, Claude |
| 4 | Design | visual-design, presentation | ModelsLab, Gemini |
| 5 | Visual | 3d-immersive, tts-generation | Meshy, ElevenLabs |
| 6 | Voice | tts-generation, music-generation, avatar-lipsync | ElevenLabs, Alibaba |
| 7 | Generation | video-generation, video-editing | Sora2API, ModelsLab |
| 8 | Publishing | distribution, marketing, analytics | Platform APIs |

---

## ✅ VERIFICATION CHECKLIST

### Providers
- [x] 15 providers with API keys configured
- [x] Deepgram as PRIMARY STT (<100ms) across all regions
- [x] Sora2API as PRIMARY video (cinematic/realistic)
- [x] Alibaba WAN 2.2 as PRIMARY avatar/lip-sync
- [x] Meshy as PRIMARY 3D (PBR, rigging, USDZ/GLTF/FBX)
- [x] ElevenLabs as PRIMARY TTS + Music + SFX
- [x] ModelsLab as PRIMARY image (FLUX)
- [x] HeyGen, Suno, RunPod EXCLUDED (no keys)

### Categories & Pipelines
- [x] 21 categories mapped to products
- [x] 206 pipelines distributed correctly
- [x] Each category has edge function assignment
- [x] Editor modes assigned per category

### Combinations
- [x] 25+ preset workflows defined
- [x] Tier gating enforced
- [x] Credit costs calculated
- [x] Provider chains defined per workflow

### Regional Routing
- [x] 7 zones with complete fallback chains
- [x] Regional provider priorities set
- [x] Language-specific TTS routing

---

## 📥 DOWNLOAD OPTIONS

This document is available in the following formats:
- **Markdown**: `docs/GENIE_ECOSYSTEM_COMPLETE_MATRIX_2026.md`
- **PDF**: Export via browser print (Ctrl+P → Save as PDF)
- **JSON**: See `src/constants/ecosystemRegistry.ts` for programmatic access

---

*Generated by Genie Studio Governance System*
*Version: 2026.01.30*
