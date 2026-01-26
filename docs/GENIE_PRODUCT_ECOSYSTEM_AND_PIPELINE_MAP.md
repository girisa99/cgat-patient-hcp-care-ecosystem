# Genie Product Ecosystem & Pipeline Mapping

> **Last Updated:** 2026-01-26  
> **Status:** AUTHORITATIVE REFERENCE  
> **Total Pipelines:** 181 across 18 categories  
> **Products:** 7 Core + 1 AI Support

---

## 🧞 Product Overview (Official Taglines)

| Product | Official Tagline | Primary Function |
|---------|------------------|------------------|
| **Genie Studio** | Mind to Media — AI-Powered Production Suite | Master Orchestrator |
| **Genie Spark** | Ignite your Ideas | Script Generation (from any input) |
| **Genie Mind** | AI That Understands | Script Editing, TTS, Voice, Music |
| **Genie Vibe** | Script to Screen | Audio/Video Recording & Production |
| **Genie Deck** | Ideas to Impact | Presentation Generation |
| **Genie Arc** | Your Production Journey With Infinite Possibilities | Scheduling, Kanban, Project Management |
| **Genie Cast** | Make It. Show It. Scale It. | Distribution & Publishing |
| **Ask Genie** | Your wish is my command | AI Support Layer |

---

## 🔄 Complete Product Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GENIE STUDIO (Master Orchestrator)                    │
│                   "Mind to Media — AI-Powered Production Suite"          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐                                                       │
│   │    SPARK     │   INPUT: Doc, PPT, Video, Audio, URL, Image           │
│   │ "Ignite your │ → OUTPUT: Generated Script                            │
│   │    Ideas"    │   (+ generate image if missing)                       │
│   └──────┬───────┘                                                       │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────┐                                                       │
│   │     MIND     │   INPUT: Raw Script                                   │
│   │"AI That      │ → OUTPUT: Edited Script + TTS + Voice + Music         │
│   │ Understands" │                                                       │
│   └──────┬───────┘                                                       │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────┐                                                       │
│   │     VIBE     │   INPUT: Enhanced Script                              │
│   │ "Script to   │ → OUTPUT: Audio/Video Production                      │
│   │   Screen"    │   (Podcast, Recording, Editing, Dubbing)              │
│   └──────┬───────┘                                                       │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────┐                                                       │
│   │     DECK     │   INPUT: Any content                                  │
│   │ "Ideas to    │ → OUTPUT: Presentation (PPTX, PDF, Video)             │
│   │   Impact"    │   (+ Avatars, 3D, Animation, Immersive)               │
│   └──────┬───────┘                                                       │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────┐                                                       │
│   │      ARC     │   INPUT: All production assets                        │
│   │"Your Journey │ → OUTPUT: Scheduled, tracked, managed projects        │
│   │With Infinite │   (Kanban, Timeline, Team)                            │
│   │Possibilities"│                                                       │
│   └──────┬───────┘                                                       │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────┐                                                       │
│   │     CAST     │   INPUT: Final content                                │
│   │"Make It.Show │ → OUTPUT: Published across platforms                  │
│   │It.Scale It." │   (14 regions, 70+ languages)                         │
│   └──────────────┘                                                       │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │                         ASK GENIE                                 │   │
│   │                  "Your wish is my command"                        │   │
│   │            AI Support across all products (181 pipelines)         │   │
│   └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 ADVANCED CROSS-FUNCTIONAL CAPABILITIES

These advanced capabilities are **shared across products** and can be used in combination:

### Cross-Functional Matrix

| Capability | Spark | Mind | Vibe | Deck | Arc | Cast | Primary Providers |
|------------|:-----:|:----:|:----:|:----:|:---:|:----:|-------------------|
| **Avatars (Talking Head)** | ✅ | ✅ | ✅ | ✅ | - | ✅ | Alibaba Wan2.2, HeyGen |
| **Full-Body Avatars** | ✅ | ✅ | ✅ | ✅ | - | ✅ | Alibaba OmniAvatar |
| **3D Generation** | ✅ | - | ✅ | ✅ | - | - | Meshy AI, Tripo3D, ModelsLab |
| **Lip-Sync** | - | ✅ | ✅ | ✅ | - | ✅ | Azure Visemes, Alibaba |
| **Animation** | ✅ | - | ✅ | ✅ | - | ✅ | ModelsLab AnimateDiff |
| **Kinetic Typography** | - | ✅ | ✅ | ✅ | - | - | ModelsLab |
| **AR Experiences** | - | - | ✅ | ✅ | - | ✅ | ModelsLab, Replicate |
| **VR Experiences** | - | - | ✅ | ✅ | - | ✅ | ModelsLab, Replicate |
| **Immersive Scenes** | - | - | ✅ | ✅ | - | ✅ | ModelsLab |
| **Podcast Production** | ✅ | ✅ | ✅ | - | - | ✅ | Multi-provider |
| **Webcast/Live** | - | ✅ | ✅ | - | - | ✅ | Azure, Multi-provider |
| **Dubbing (70+ langs)** | - | ✅ | ✅ | ✅ | - | ✅ | ElevenLabs, Azure, Alibaba |
| **Voice Cloning** | - | ✅ | ✅ | ✅ | - | - | ElevenLabs, Alibaba CosyVoice |
| **TTS (70+ langs)** | - | ✅ | ✅ | ✅ | - | - | ElevenLabs, Azure, Alibaba |
| **STT Transcription** | ✅ | ✅ | ✅ | ✅ | - | - | Azure, Whisper |
| **Music Generation** | - | ✅ | ✅ | ✅ | - | - | ElevenLabs, Suno |
| **SFX Generation** | - | ✅ | ✅ | ✅ | - | - | ElevenLabs, Alibaba |
| **Data Visualization** | ✅ | - | - | ✅ | - | - | Internal + AI |

---

## 📋 COMPLETE 181 PIPELINE REGISTRY (18 Categories)

### Category 1: Text-Based Pipelines (10)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `text-to-image` | Text → generated image | Spark, Deck | Creator |
| `text-to-video` | Text → video | Vibe, Deck | Pro |
| `text-to-3d` | Text → 3D mesh | Deck, Vibe | Business |
| `text-to-animation` | Text → animated content | Deck, Vibe | Pro |
| `text-to-avatar` | Text → talking head avatar | Spark, Vibe, Deck | Business |
| `text-to-vr` | Text → VR experience | Deck, Vibe | Enterprise |
| `text-to-ar` | Text → AR experience | Deck, Vibe | Enterprise |
| `text-to-speech` | Text → voice (TTS) | Mind, Vibe, Deck | Creator |
| `text-to-music` | Text → music | Mind, Vibe | Pro |
| `text-to-sfx` | Text → sound effects | Mind, Vibe | Pro |

### Category 2: Image-Based Pipelines (8)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `image-to-video` | Image → video | Spark, Vibe | Pro |
| `image-to-3d` | Image → 3D model | Deck, Vibe | Business |
| `image-to-avatar` | Image → talking avatar | Vibe, Deck | Business |
| `image-to-text` | Image → description (OCR) | Spark, Mind | Creator |
| `image-to-animation` | Image → animated | Vibe, Deck | Pro |
| `image-upscale` | Low-res → high-res | Vibe, Deck | Creator |
| `image-variation` | Image → variations | Spark, Deck | Creator |
| `image-edit` | AI-powered image editing | Spark, Deck | Creator |

### Category 3: Voice & Audio Pipelines (8)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `voice-to-text` | Speech → text (STT) | Spark, Mind, Vibe | Creator |
| `voice-clone` | Clone any voice | Mind, Vibe | Pro |
| `audio-to-video` | Audio → video | Vibe | Pro |
| `audio-enhance` | Improve audio quality | Mind, Vibe | Creator |
| `voice-to-avatar` | Voice → animated avatar | Vibe, Deck | Business |
| `podcast-to-clips` | Podcast → short clips | Vibe, Cast | Pro |
| `audio-translate` | Audio → translated audio | Mind, Vibe | Pro |
| `voice-to-animation` | Voice → character animation | Vibe, Deck | Business |

### Category 4: Document & PPT Pipelines (10)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `doc-to-ppt` | Document → presentation | Spark, Deck | Creator |
| `ppt-to-video` | PPT → video | Vibe, Deck | Pro |
| `pdf-to-slides` | PDF → slides | Spark, Deck | Creator |
| `doc-to-infographic` | Document → visual | Deck | Pro |
| `ppt-to-web` | PPT → web slideshow | Deck, Cast | Pro |
| `doc-to-audio` | Document → audiobook | Mind, Vibe | Pro |
| `ppt-to-social` | PPT → social content | Cast | Creator |
| `doc-to-interactive` | Document → interactive | Deck | Business |
| `ppt-to-training` | PPT → eLearning | Deck | Business |
| `doc-to-summary` | Document → summary | Spark, Mind | Creator |

### Category 5: Video-Based Pipelines (9)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `video-to-clips` | Video → short clips | Vibe, Cast | Creator |
| `video-to-text` | Video → transcript | Spark, Mind | Creator |
| `video-upscale` | Video → 4K | Vibe | Pro |
| `video-to-gif` | Video → GIF | Vibe | Creator |
| `video-translate` | Video → dubbed video | Vibe, Cast | Pro |
| `video-to-audio` | Extract audio | Vibe | Creator |
| `video-enhance` | AI enhancement | Vibe | Pro |
| `video-to-3d` | Video → 3D scene | Vibe, Deck | Enterprise |
| `video-to-avatar` | Video → avatar | Vibe, Deck | Business |

### Category 6: 3D-Based Pipelines (5)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `3d-to-video` | 3D model → video render | Vibe, Deck | Business |
| `3d-to-image` | 3D model → image render | Deck | Pro |
| `3d-to-vr` | 3D → VR experience | Deck, Vibe | Enterprise |
| `3d-to-ar` | 3D → AR experience | Deck, Vibe | Enterprise |
| `3d-enhance` | AI 3D enhancement | Vibe | Business |

### Category 7: AR/VR Scene Pipelines (6)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `scene-to-vr` | Scene → VR experience | Deck, Vibe | Enterprise |
| `scene-to-ar` | Scene → AR experience | Deck, Vibe | Enterprise |
| `vr-to-video` | VR → video capture | Vibe | Enterprise |
| `ar-to-video` | AR → video capture | Vibe | Enterprise |
| `immersive-training` | Immersive training module | Deck | Enterprise |
| `spatial-presentation` | Spatial presentation | Deck | Enterprise |

### Category 8: Complex Multi-modal Pipelines (7)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `full-production` | End-to-end production | Studio | Business |
| `auto-record-to-avatar` | Recording → avatar video | Vibe, Deck | Business |
| `data-to-dashboard` | Data → visual dashboard | Deck | Pro |
| `research-to-presentation` | Research → presentation | Spark, Deck | Pro |
| `meeting-to-content` | Meeting → content suite | Spark, Mind, Vibe | Pro |
| `podcast-to-video` | Podcast → video podcast | Vibe | Pro |
| `live-to-clips` | Live stream → clips | Vibe, Cast | Pro |

### Category 9: Presentation Pipelines (5)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `smart-context` | Context-aware slides | Deck | Pro |
| `quick-generate` | Fast deck generation | Deck | Creator |
| `branded-deck` | Brand-applied deck | Deck | Pro |
| `template-apply` | Apply design template | Deck | Creator |
| `slide-enhance` | AI slide improvement | Deck | Creator |

### Category 10: Repurposing Pipelines (8)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `blog-to-social` | Blog → social posts | Cast | Creator |
| `video-to-blog` | Video → blog article | Spark, Cast | Pro |
| `podcast-to-article` | Podcast → article | Spark, Cast | Pro |
| `ppt-to-blog` | PPT → blog post | Spark, Cast | Creator |
| `webinar-to-clips` | Webinar → clips | Vibe, Cast | Pro |
| `long-to-short` | Long video → shorts | Vibe, Cast | Creator |
| `article-to-video` | Article → video | Vibe | Pro |
| `content-refresh` | Update old content | Mind | Pro |

### Category 11: Training & L&D Pipelines (6)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `doc-to-elearning` | Document → eLearning | Deck | Business |
| `video-to-training` | Video → training module | Vibe, Deck | Business |
| `quiz-generator` | Generate quizzes | Deck | Pro |
| `scenario-builder` | Interactive scenarios | Deck | Business |
| `compliance-training` | Compliance content | Deck | Business |
| `onboarding-flow` | Onboarding content | Deck | Pro |

### Category 12: Marketing & Sales Pipelines (31)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `pitch-deck` | Sales pitch deck | Deck | Pro |
| `product-demo` | Product demo video | Vibe, Deck | Pro |
| `case-study` | Case study content | Spark, Deck | Pro |
| `testimonial-video` | Testimonial video | Vibe | Pro |
| `ad-creative` | Ad creative generation | Deck, Cast | Pro |
| `email-campaign` | Email content | Spark, Cast | Creator |
| `social-campaign` | Social campaign | Cast | Creator |
| `landing-page` | Landing page content | Spark | Pro |
| `explainer-video` | Explainer video | Vibe | Pro |
| `brand-video` | Brand video | Vibe | Business |
| `promo-video` | Promotional video | Vibe | Pro |
| `event-promo` | Event promotion | Vibe, Cast | Pro |
| `product-launch` | Launch content | Cast | Business |
| `competitor-content` | Competitive content | Spark | Pro |
| `seo-content` | SEO-optimized content | Spark, Cast | Creator |
| `thought-leadership` | Thought leadership | Spark | Pro |
| `whitepaper` | Whitepaper generation | Spark | Business |
| `newsletter` | Newsletter content | Spark, Cast | Creator |
| `press-release` | Press release | Spark | Pro |
| `investor-deck` | Investor presentation | Deck | Business |
| `sales-enablement` | Sales content | Deck | Pro |
| `proposal-generator` | Proposal creation | Deck | Pro |
| `roi-calculator` | ROI content | Deck | Pro |
| `comparison-sheet` | Comparison content | Deck | Pro |
| `feature-spotlight` | Feature highlight | Vibe, Deck | Pro |
| `customer-story` | Customer story | Spark, Vibe | Pro |
| `industry-report` | Industry report | Spark | Business |
| `trend-analysis` | Trend content | Spark | Pro |
| `how-to-guide` | How-to content | Spark | Creator |
| `faq-video` | FAQ video | Vibe | Creator |
| `product-update` | Product update | Cast | Creator |

### Category 13: Localization Pipelines (6)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `full-localization` | Complete localization | All | Business |
| `voice-localization` | Voice dubbing | Mind, Vibe | Pro |
| `subtitle-generation` | Auto subtitles | Vibe | Creator |
| `cultural-adaptation` | Cultural customization | Mind, Cast | Business |
| `regional-compliance` | Regional compliance | Cast | Business |
| `multi-market-launch` | Multi-market launch | Cast | Enterprise |

### Category 14: Social & Publishing Pipelines (8)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `youtube-optimize` | YouTube optimization | Cast | Creator |
| `tiktok-format` | TikTok formatting | Cast | Creator |
| `linkedin-adapt` | LinkedIn adaptation | Cast | Creator |
| `instagram-format` | Instagram formatting | Cast | Creator |
| `twitter-thread` | Twitter/X threads | Cast | Creator |
| `podcast-publish` | Podcast publishing | Cast | Creator |
| `blog-publish` | Blog publishing | Cast | Creator |
| `cross-platform` | Cross-platform sync | Cast | Pro |

### Category 15: Creator Enhancement Pipelines (22)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `ai-auto-captions` | Auto captions | Vibe | Creator |
| `video-upscaling-4k` | 4K upscaling | Vibe | Pro |
| `ai-background-removal` | Background removal | Vibe, Deck | Creator |
| `ai-thumbnail-creator` | Thumbnail creation | Vibe, Cast | Creator |
| `audio-enhancement` | Audio enhancement | Mind, Vibe | Creator |
| `ai-color-grading` | Color grading | Vibe | Pro |
| `ai-video-stabilization` | Video stabilization | Vibe | Creator |
| `ai-noise-reduction` | Noise reduction | Mind, Vibe | Creator |
| `ai-teleprompter` | AI teleprompter | Vibe | Creator |
| `ai-clip-finder` | Smart clip finding | Vibe | Pro |
| `ai-highlight-reel` | Highlight reel | Vibe | Pro |
| `ai-b-roll-generator` | B-roll generation | Vibe | Pro |
| `ai-transitions` | Smart transitions | Vibe, Deck | Creator |
| `ai-music-sync` | Music sync | Vibe | Pro |
| `ai-voice-clone` | Voice cloning | Mind, Vibe | Pro |
| `ai-lip-sync` | Lip sync | Vibe, Deck | Business |
| `ai-avatar-library` | Avatar library | Vibe, Deck | Business |
| `ai-podcast-to-clips` | Podcast clips | Vibe, Cast | Pro |
| `ai-shorts-generator` | Shorts generation | Vibe, Cast | Creator |
| `ai-watermark-removal` | Watermark removal | Vibe | Pro |
| `ai-aspect-ratio` | Aspect ratio change | Vibe | Creator |
| `ai-speed-ramp` | Speed ramping | Vibe | Pro |

### Category 16: Podcast & Webcast Pipelines (16)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `podcast-record` | Multi-track recording | Vibe | Creator |
| `podcast-edit` | Podcast editing | Vibe | Creator |
| `podcast-enhance` | Audio enhancement | Mind, Vibe | Pro |
| `podcast-transcribe` | Transcription | Mind, Vibe | Creator |
| `podcast-chapters` | Chapter markers | Vibe | Creator |
| `podcast-highlights` | Highlight extraction | Vibe | Pro |
| `podcast-distribution` | Multi-platform publish | Cast | Creator |
| `podcast-to-video` | Video podcast | Vibe | Pro |
| `webcast-setup` | Live stream setup | Vibe | Pro |
| `webcast-record` | Live recording | Vibe | Pro |
| `webcast-multitrack` | Multi-guest recording | Vibe | Pro |
| `webcast-to-clips` | Live → clips | Vibe, Cast | Pro |
| `webcast-captions` | Live captions | Vibe | Pro |
| `webcast-qa` | Live Q&A | Vibe | Pro |
| `webcast-replay` | Replay generation | Vibe, Cast | Pro |
| `webcast-analytics` | Stream analytics | Arc, Cast | Pro |

### Category 17: Editing Pipelines (15)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `video-trim` | Trim video | Vibe | Creator |
| `video-stitch` | Combine clips | Vibe | Creator |
| `video-split` | Split video | Vibe | Creator |
| `video-merge` | Merge videos | Vibe | Creator |
| `audio-trim` | Trim audio | Vibe | Creator |
| `audio-stitch` | Combine audio | Vibe | Creator |
| `audio-mix` | Mix audio tracks | Vibe | Creator |
| `timeline-edit` | Timeline editing | Vibe | Creator |
| `multi-track-edit` | Multi-track editing | Vibe | Pro |
| `effects-apply` | Apply effects | Vibe | Creator |
| `transitions-add` | Add transitions | Vibe | Creator |
| `text-overlay` | Text overlays | Vibe, Deck | Creator |
| `image-overlay` | Image overlays | Vibe, Deck | Creator |
| `pip-edit` | Picture-in-picture | Vibe | Creator |
| `green-screen` | Green screen | Vibe | Pro |

### Category 18: Mobile Pipelines (5)
| Pipeline | Description | Products | Tier |
|----------|-------------|----------|------|
| `mobile-capture` | Mobile recording | Vibe | Creator |
| `mobile-edit` | Mobile editing | Vibe | Creator |
| `mobile-publish` | Mobile publishing | Cast | Creator |
| `mobile-review` | Mobile review | Arc | Creator |
| `mobile-collaborate` | Mobile collab | Arc | Pro |

---

## 🎭 ADVANCED CAPABILITY DETAILS

### Avatars & Talking Heads

| Pipeline | Description | Providers | Products | Tier |
|----------|-------------|-----------|----------|------|
| `text-to-avatar` | Text → talking head | Alibaba Wan2.2, HeyGen | Spark, Vibe, Deck | Business |
| `image-to-avatar` | Photo → talking avatar | Alibaba Wan2.2 | Vibe, Deck | Business |
| `script-to-avatar` | Script → avatar video | Alibaba Wan2.2 | Vibe, Deck | Business |
| `voice-to-avatar` | Voice → synced avatar | Azure Visemes, Alibaba | Vibe, Deck | Business |
| `full-body-avatar` | Full-body animated avatar | Alibaba OmniAvatar | Vibe, Deck | Enterprise |
| `avatar-library` | Pre-built avatar selection | Multi-provider | Vibe, Deck | Pro |

### 3D Generation & Scenes

| Pipeline | Description | Providers | Products | Tier |
|----------|-------------|-----------|----------|------|
| `text-to-3d` | Text → 3D mesh | Meshy AI, Tripo3D | Deck, Vibe | Business |
| `image-to-3d` | Image → 3D model | Meshy AI, ModelsLab | Deck, Vibe | Business |
| `3d-product-shot` | Product → 3D product | Meshy AI | Deck | Business |
| `3d-scene-build` | Build 3D scenes | ModelsLab | Deck, Vibe | Business |
| `3d-animation` | Animate 3D models | ModelsLab | Vibe, Deck | Business |
| `3d-render` | High-quality render | ModelsLab | Deck, Vibe | Pro |

### Immersive Experiences (AR/VR)

| Pipeline | Description | Providers | Products | Tier |
|----------|-------------|-----------|----------|------|
| `scene-to-vr` | Scene → VR experience | ModelsLab, Replicate | Deck, Vibe | Enterprise |
| `scene-to-ar` | Scene → AR experience | ModelsLab, Replicate | Deck, Vibe | Enterprise |
| `immersive-training` | VR training module | ModelsLab | Deck | Enterprise |
| `spatial-presentation` | Spatial slide deck | ModelsLab | Deck | Enterprise |
| `product-ar` | AR product viewer | ModelsLab | Deck | Business |
| `360-tour` | 360° virtual tour | ModelsLab | Vibe | Enterprise |

### Animation & Motion

| Pipeline | Description | Providers | Products | Tier |
|----------|-------------|-----------|----------|------|
| `animated-slides` | Animated slide transitions | ModelsLab AnimateDiff | Deck | Pro |
| `kinetic-typography` | Animated text | ModelsLab | Deck, Vibe | Pro |
| `motion-graphics` | Motion graphics | ModelsLab | Vibe, Deck | Pro |
| `character-animation` | Character animation | ModelsLab | Vibe | Business |
| `logo-animation` | Animated logos | ModelsLab | Deck, Vibe | Pro |
| `data-animation` | Animated charts | Internal | Deck | Pro |

### Lip-Sync & Dubbing

| Pipeline | Description | Providers | Products | Tier |
|----------|-------------|-----------|----------|------|
| `voice-to-lipsync` | Voice → synced video | Azure Visemes, Alibaba | Vibe, Deck | Business |
| `video-lipsync` | Re-sync existing video | Azure, Alibaba | Vibe | Business |
| `video-dubbing` | Full video dubbing (70+ langs) | ElevenLabs, Azure, Alibaba | Vibe, Cast | Pro |
| `auto-dub` | Automated dubbing | ElevenLabs, Azure | Vibe | Pro |
| `multi-language-dub` | Multi-language output | Multi-provider | Cast | Business |

---

## 📊 Pipeline Summary by Product

| Product | Tagline | Core Pipelines | Advanced Access | Total |
|---------|---------|----------------|-----------------|-------|
| **Studio** | Mind to Media | 181 (all) | All | 181 |
| **Spark** | Ignite your Ideas | 28 | Avatar, Image Gen | 35 |
| **Mind** | AI That Understands | 24 | TTS, Voice Clone, Music | 30 |
| **Vibe** | Script to Screen | 45 | Avatar, Lip-sync, 3D, Podcast | 65 |
| **Deck** | Ideas to Impact | 35 | Avatar, 3D, Animation, AR/VR | 55 |
| **Arc** | Infinite Possibilities | 30 | Analytics, Team | 32 |
| **Cast** | Make It. Show It. Scale It. | 25 | Dubbing, Regional | 35 |
| **Ask Genie** | Your wish is my command | 181 (knowledge) | All | 181 |

**Note:** Many pipelines are cross-functional and accessible from multiple products.

---

## 🎨 Product Branding Reference

| Product | Emoji | Color Gradient | Border |
|---------|-------|----------------|--------|
| Studio | 🎨 | Indigo → Violet | `border-indigo-200` |
| Spark | ✨ | Amber → Orange | `border-amber-200` |
| Mind | 🧠 | Blue → Cyan | `border-blue-200` |
| Vibe | 🎬 | Purple → Pink | `border-purple-200` |
| Deck | 📊 | Purple → Violet | `border-purple-200` |
| Arc | 🎯 | Emerald → Teal | `border-emerald-200` |
| Cast | 📢 | Rose → Pink | `border-rose-200` |
| Ask Genie | 🧞 | Violet → Fuchsia | `border-violet-200` |

---

## 🔗 8-Agent A2A Orchestration

| Agent | Role | Primary Products |
|-------|------|------------------|
| **Content Analyst** | Input analysis, content extraction | Spark, Mind |
| **Script Writer** | Script generation, enhancement | Spark, Mind |
| **Visual Designer** | Image, slide, layout design | Deck, Spark |
| **Audio Producer** | TTS, music, SFX, voice | Mind, Vibe |
| **Video Producer** | Video creation, editing, animation | Vibe |
| **3D Artist** | 3D models, scenes, AR/VR | Deck, Vibe |
| **Localization Expert** | Translation, dubbing, regional | Cast, Mind |
| **Quality Reviewer** | Review, feedback, optimization | All |

---

## 🌍 5-Zone Regional Routing

| Zone | Primary Provider | Languages | Products Affected |
|------|------------------|-----------|-------------------|
| **Zone 1: Claude/EU** | Claude, DeepL | English, Western EU | All |
| **Zone 2: Alibaba/CJK** | Alibaba Qwen, CosyVoice | Chinese, Japanese, Korean | All |
| **Zone 3: Azure/MENA** | Azure, GPT-4o | Arabic, Farsi, Hebrew | All |
| **Zone 4: Gemini/India-SEA** | Gemini | Hindi, Tamil, Thai, Vietnamese | All |
| **Zone 5: Fallback** | GPT-4o, Multi | African, Rare languages | All |

---

## 📍 Source Files

| File | Purpose |
|------|---------|
| `src/constants/genie-products.ts` | Official product definitions & taglines |
| `src/assets/logos/` | Product logos |
| `src/services/askGeniePipelineKnowledgeBase.ts` | Pipeline knowledge base |
| `src/components/ai-hub/provider-matrix/pipelineIORegistry.ts` | Pipeline I/O registry |
| `src/services/combinationWorkflowService.ts` | Cross-functional workflows |
| `src/config/genie-dogfood-integration.ts` | Cast integration config |

---

*Document Version: 4.0 | January 2026 | AUTHORITATIVE REFERENCE*
