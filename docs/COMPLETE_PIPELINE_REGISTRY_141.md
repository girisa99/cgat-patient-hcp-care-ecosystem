# 📊 COMPLETE PIPELINE REGISTRY - 141 PIPELINES

**Last Updated:** 2025-01-25  
**Total Pipelines:** 141  
**Categories:** 15  
**Core Providers:** 12  
**Coverage:** 100% Production-Ready

---

## 📈 SUMMARY METRICS

| Metric | Value |
|--------|-------|
| **Total Pipelines** | 141 |
| **Production-Ready** | 141 (100%) |
| **Categories** | 15 |
| **Core Providers** | 12 |
| **Starter Tier** | 8 pipelines |
| **Pro Tier** | 103 pipelines |
| **Enterprise Tier** | 30 pipelines |
| **Input Formats** | 55+ |
| **Output Formats** | 50+ |

---

## 🎯 CORE 12 AI PROVIDERS

| Provider | Capabilities | Primary Use Cases |
|----------|-------------|-------------------|
| **OpenAI** | LLM, TTS, STT, Image Gen, Vision | GPT-4o, DALL-E 3, Whisper |
| **Claude** | LLM, Translation, Vision | Content Analysis, Scripts |
| **Gemini** | LLM, OCR, TTS, Image Gen, Vision | India/SEA/Africa routing |
| **DeepSeek** | LLM, Vision, Code | Cost-efficient fallback |
| **Alibaba** | LLM, TTS, STT, Video Gen, Avatars | CJK routing, Qwen-Max, CosyVoice, WAN 2.2 |
| **Azure** | TTS, STT, OCR, Visemes | Neural TTS, Speech Services |
| **ModelsLab** | Image, Video, 3D, Animation | FLUX Pro, AnimateDiff, Mesh |
| **Meshy AI** | 3D Mesh, PBR Textures, Rigging | High-fidelity 3D |
| **Replicate** | Open-source models, Image-to-3D | TripoSR, fallback |
| **ElevenLabs** | TTS, Voice Clone, SFX, Music | Premium voice synthesis |
| **DeepL** | Translation | European languages |
| **Supabase** | Auth, Database, Storage | Infrastructure |

---

## 📚 CATEGORY 1: TEXT-BASED (10 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 1 | `text-to-image` | Text to Image | Starter | OpenAI, ModelsLab, Replicate | txt, json → png, jpg, webp |
| 2 | `text-to-video` | Text to Video | Pro | ModelsLab, Alibaba, Replicate | txt, json → mp4, webm |
| 3 | `text-to-3d` | Text to 3D | Pro | ModelsLab, Replicate, Huggingface | txt, json → glb, gltf, obj, usdz |
| 4 | `text-to-animation` | Text to Animation | Pro | ModelsLab, OpenAI | txt, json → mp4, gif, lottie, spine |
| 5 | `text-to-avatar` | Text to Avatar | Enterprise | Alibaba, ModelsLab, Azure | txt, json → avatar_model, glb, vrm |
| 6 | `text-to-vr` | Text to VR | Enterprise | ModelsLab, Replicate | txt, json → glb, usdz, vr_experience |
| 7 | `text-to-ar` | Text to AR | Enterprise | ModelsLab, Replicate | txt, json → usdz, glb, ar_experience |
| 8 | `text-to-interactive` | Text to Interactive | Pro | OpenAI, Claude, Gemini | txt, json → html, scorm, json |
| 9 | `text-to-music` | Text to Music | Pro | ElevenLabs, Alibaba | txt, json → mp3, wav, midi |
| 10 | `text-to-sfx` | Text to SFX | Starter | ElevenLabs, Alibaba | txt, json → wav, mp3, ogg |

---

## 🖼️ CATEGORY 2: IMAGE-BASED (8 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 11 | `image-to-video` | Image to Video | Pro | ModelsLab, Alibaba, Replicate | png, jpg, webp → mp4, webm |
| 12 | `image-to-3d` | Image to 3D | Pro | ModelsLab, Replicate, Huggingface | png, jpg → glb, gltf, obj, ply |
| 13 | `image-to-animation` | Image to Animation | Pro | ModelsLab, Alibaba | png, jpg, gif → mp4, gif, lottie |
| 14 | `image-to-avatar` | Image to Avatar | Enterprise | Alibaba, ModelsLab | png, jpg → avatar_model, glb, vrm |
| 15 | `image-to-vr` | Image to VR | Enterprise | ModelsLab, Replicate | png, jpg, equirectangular → glb, vr_experience |
| 16 | `image-to-ar` | Image to AR | Enterprise | ModelsLab, Replicate | png, jpg → usdz, ar_experience |
| 17 | `image-to-vfx` | Image to VFX | Pro | ModelsLab, Replicate | png, jpg, exr → mp4, mov_prores, exr_seq |
| 18 | `image-to-portrait` | Image to Portrait | Starter | ModelsLab, Alibaba | png, jpg → png, jpg, mp4 |

---

## 🎙️ CATEGORY 3: VOICE/AUDIO (8 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 19 | `voice-to-animation` | Voice to Animation | Pro | Azure, Alibaba, ModelsLab | mp3, wav, webm → mp4, gif, lottie |
| 20 | `voice-to-avatar` | Voice to Avatar | Enterprise | Alibaba, Azure, ModelsLab | mp3, wav → mp4, webm, avatar_model |
| 21 | `voice-to-3d` | Voice to 3D | Enterprise | Alibaba, ModelsLab | mp3, wav → glb, gltf |
| 22 | `voice-to-interactive` | Voice to Interactive | Pro | OpenAI, Azure, Claude | mp3, wav → html, scorm |
| 23 | `voice-to-video` | Voice to Video | Pro | ModelsLab, Alibaba | mp3, wav, aac → mp4, webm |
| 24 | `voice-to-vr` | Voice to VR | Enterprise | ModelsLab, Replicate | mp3, wav → glb, vr_experience |
| 25 | `audio-to-animation` | Audio to Animation | Pro | ModelsLab, Alibaba | mp3, wav, midi → mp4, gif |
| 26 | `audio-to-vfx` | Audio to VFX | Pro | ModelsLab, ElevenLabs | mp3, wav → mp4, mov_prores |

---

## 📄 CATEGORY 4: DOCUMENT/PPT (10 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 27 | `ppt-to-video` | PPT to Video | Pro | Gemini, OpenAI, ElevenLabs | pptx, ppt, odp → mp4, webm |
| 28 | `ppt-to-animation` | PPT to Animation | Pro | ModelsLab, OpenAI | pptx → mp4, gif, lottie |
| 29 | `ppt-to-interactive` | PPT to Interactive | Pro | OpenAI, Claude | pptx → html, scorm |
| 30 | `ppt-to-3d` | PPT to 3D | Pro | ModelsLab, Replicate | pptx → glb, gltf |
| 31 | `ppt-to-vr` | PPT to VR | Enterprise | ModelsLab, Replicate | pptx → glb, vr_experience |
| 32 | `document-to-video` | Document to Video | Pro | OpenAI, Gemini, ElevenLabs | docx, pdf, txt → mp4, webm |
| 33 | `document-to-slides` | Document to Slides | Pro | OpenAI, Claude, Gemini | docx, pdf, txt, md → pptx, pdf |
| 34 | `document-to-interactive` | Document to Interactive | Pro | OpenAI, Claude | docx, pdf → html, scorm |
| 35 | `pdf-to-video` | PDF to Video | Pro | OpenAI, Gemini, ElevenLabs | pdf → mp4, webm |
| 36 | `pdf-to-interactive` | PDF to Interactive | Pro | OpenAI, Claude | pdf → html, scorm |

---

## 🎬 CATEGORY 5: VIDEO-BASED (9 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 37 | `video-to-avatar` | Video to Avatar | Enterprise | Alibaba, ModelsLab | mp4, mov, webm → avatar_model, lora, vrm |
| 38 | `video-to-3d` | Video to 3D | Enterprise | ModelsLab, Replicate | mp4, mov, webm → glb, gltf, ply, splat |
| 39 | `video-to-animation` | Video to Animation | Pro | ModelsLab, Alibaba | mp4, mov → gif, lottie, mp4 |
| 40 | `video-to-interactive` | Video to Interactive | Pro | OpenAI, Claude | mp4, webm → html, scorm |
| 41 | `video-to-vr` | Video to VR | Enterprise | ModelsLab, Replicate | mp4, mov, equirect_video → glb, vr_experience |
| 42 | `video-to-vfx` | Video to VFX | Pro | ModelsLab, Replicate | mp4, mov, prores → mp4, mov_prores, exr_seq |
| 43 | `video-to-multilingual` | Video to Multilingual | Pro | ElevenLabs, Alibaba, DeepL | mp4, mov → mp4, srt, vtt |
| 44 | `video-to-clips` | Video to Clips | Pro | Gemini, OpenAI | mp4, mov, webm → mp4, gif |
| 45 | `video-to-summary` | Video to Summary | Starter | Gemini, Claude, OpenAI | mp4, mov → txt, json, md |

---

## 🔮 CATEGORY 6: 3D-BASED (5 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 46 | `3d-to-video` | 3D to Video | Pro | ModelsLab, Replicate | glb, gltf, fbx, obj → mp4, webm |
| 47 | `3d-to-animation` | 3D to Animation | Pro | ModelsLab, Replicate | glb, gltf, fbx → mp4, gif |
| 48 | `3d-to-vr` | 3D to VR | Enterprise | ModelsLab, Replicate | glb, gltf, obj → glb, usdz, vr_experience |
| 49 | `3d-to-ar` | 3D to AR | Enterprise | ModelsLab, Replicate | glb, gltf, obj → usdz, ar_experience |
| 50 | `3d-to-interactive` | 3D to Interactive | Pro | ModelsLab, Replicate | glb, gltf → html, json |

---

## 🥽 CATEGORY 7: AR/VR SCENE (6 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 51 | `scene-to-vr` | Scene to VR | Enterprise | ModelsLab, Replicate | glb, gltf, json → glb, vr_experience |
| 52 | `scene-to-ar` | Scene to AR | Enterprise | ModelsLab, Replicate | glb, gltf, json → usdz, ar_experience |
| 53 | `ar-to-video` | AR to Video | Pro | ModelsLab, Replicate | ar_recording, mp4 → mp4, webm |
| 54 | `vr-to-video` | VR to Video | Pro | ModelsLab, Replicate | vr_recording, mp4 → mp4, webm, equirect |
| 55 | `panorama-to-vr` | Panorama to VR | Pro | ModelsLab, Replicate | jpg, png, equirect → glb, vr_experience |
| 56 | `floor-plan-to-vr` | Floor Plan to VR | Enterprise | ModelsLab, Replicate | pdf, png, dwg, dxf → glb, vr_experience |

---

## 🔄 CATEGORY 8: COMPLEX MULTI-MODAL (7 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 57 | `auto-record-to-avatar` | Auto Record to Avatar | Enterprise | Alibaba, Azure, ModelsLab | webrtc, mp4, webcam → avatar_model, mp4 |
| 58 | `auto-record-to-3d` | Auto Record to 3D | Enterprise | ModelsLab, Replicate | webrtc, mp4 → glb, ply, splat |
| 59 | `auto-record-to-interactive` | Auto Record to Interactive | Pro | OpenAI, Claude | webrtc, mp4 → html, scorm |
| 60 | `auto-record-to-video` | Auto Record to Video | Pro | Gemini, OpenAI | webrtc, screen_capture → mp4, webm |
| 61 | `auto-record-to-vr` | Auto Record to VR | Enterprise | ModelsLab, Replicate | webrtc, mp4 → glb, vr_experience |
| 62 | `multi-modal-mashup` | Multi-modal Mashup | Enterprise | OpenAI, Gemini, ModelsLab | mp4, mp3, png, txt, json → mp4, html |
| 63 | `full-production-suite` | Full Production Suite | Enterprise | All Core 12 | ALL FORMATS → ALL FORMATS |

---

## 📊 CATEGORY 9: PRESENTATION (5 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 64 | `idea-to-presentation` | Idea to Presentation | Starter | OpenAI, Claude, Gemini | txt, json → pptx, pdf, html |
| 65 | `document-to-presentation` | Document to Presentation | Pro | OpenAI, Claude, Azure | docx, pdf, txt → pptx, pdf |
| 66 | `data-to-presentation` | Data to Presentation | Pro | OpenAI, Gemini | csv, xlsx, json → pptx, pdf |
| 67 | `brand-to-templates` | Brand to Templates | Pro | Gemini, OpenAI | png, svg, json → pptx, figma, sketch |
| 68 | `presentation-to-video` | Presentation to Video | Pro | Gemini, OpenAI, ElevenLabs | pptx, pdf → mp4, webm |

---

## ♻️ CATEGORY 10: REPURPOSING (8 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 69 | `long-to-shorts` | Long to Shorts | Pro | Gemini, OpenAI | mp4, mov → mp4, webm |
| 70 | `blog-to-video` | Blog to Video | Pro | OpenAI, ElevenLabs, ModelsLab | html, md, txt → mp4, webm |
| 71 | `podcast-to-blog` | Podcast to Blog | Pro | OpenAI, Claude, Gemini | mp3, wav, m4a → md, html, docx |
| 72 | `webinar-to-course` | Webinar to Course | Pro | OpenAI, Claude | mp4, webm → scorm, html, mp4 |
| 73 | `meeting-to-summary` | Meeting to Summary | Starter | Gemini, Claude, OpenAI | mp4, mp3, webrtc → txt, md, pdf |
| 74 | `video-to-blog` | Video to Blog | Pro | Gemini, Claude | mp4, mov → md, html, docx |
| 75 | `course-to-micro` | Course to Micro | Pro | OpenAI, Gemini | scorm, mp4 → mp4, scorm |
| 76 | `content-atomizer` | Content Atomizer | Pro | Gemini, OpenAI, Claude | mp4, pdf, docx → mp4, png, txt, html |

---

## 🎓 CATEGORY 11: TRAINING/L&D (6 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 77 | `sop-to-training` | SOP to Training | Pro | OpenAI, Claude, ElevenLabs | docx, pdf, txt → scorm, mp4, html |
| 78 | `assessment-builder` | Assessment Builder | Pro | OpenAI, Claude | txt, json, xlsx → scorm, html, json |
| 79 | `compliance-module` | Compliance Module | Enterprise | Claude, OpenAI | docx, pdf → scorm, mp4 |
| 80 | `onboarding-flow` | Onboarding Flow | Pro | OpenAI, ElevenLabs, ModelsLab | txt, json, pptx → scorm, html, mp4 |
| 81 | `skill-simulator` | Skill Simulator | Enterprise | ModelsLab, Replicate | json, glb → html, vr_experience, scorm |
| 82 | `certification-creator` | Certification Creator | Enterprise | OpenAI, Claude | json, xlsx → scorm, pdf, html |

---

## 📢 CATEGORY 12: MARKETING/SALES - BASE (6 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 83 | `ad-generator` | Ad Generator | Pro | OpenAI, ModelsLab, Claude | txt, png, mp4 → mp4, gif, png |
| 84 | `social-suite` | Social Suite | Pro | Claude, OpenAI, ModelsLab | txt, png, mp4 → mp4, png, gif |
| 85 | `product-demo` | Product Demo | Pro | ModelsLab, OpenAI, ElevenLabs | png, mp4, glb → mp4, html, gif |
| 86 | `testimonial-creator` | Testimonial Creator | Pro | ModelsLab, Alibaba, ElevenLabs | mp4, mp3, txt → mp4, webm |
| 87 | `pitch-deck` | Pitch Deck | Pro | OpenAI, Claude, Gemini | txt, json, xlsx → pptx, pdf, mp4 |
| 88 | `proposal-generator` | Proposal Generator | Pro | Claude, OpenAI | txt, json, docx → pdf, docx, pptx |

---

## 🌍 CATEGORY 13: LOCALIZATION (6 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 89 | `translate-video` | Translate Video | Pro | ElevenLabs, DeepL, Alibaba | mp4, mov, srt → mp4, srt, vtt |
| 90 | `dub-video` | Dub Video | Enterprise | ElevenLabs, Alibaba, Azure | mp4, mov → mp4, mov |
| 91 | `localize-slides` | Localize Slides | Pro | DeepL, Alibaba, Google | pptx, pdf → pptx, pdf |
| 92 | `multi-language-campaign` | Multi-language Campaign | Enterprise | DeepL, ElevenLabs, Alibaba | mp4, png, txt → mp4, png, txt |
| 93 | `voice-clone-dub` | Voice Clone Dub | Enterprise | ElevenLabs, Alibaba | mp4, mp3 → mp4, mp3 |
| 94 | `subtitle-generator` | Subtitle Generator | Starter | Azure, OpenAI, Alibaba | mp4, mp3 → srt, vtt, ass |

---

## 📱 CATEGORY 14: MARKETING-SPECIFIC (25 Pipelines)

| # | Pipeline ID | Name | Tier | Providers | I/O |
|---|-------------|------|------|-----------|-----|
| 95 | `social-post-generator` | Social Post Generator | Pro | Claude, Qwen, DALL-E | topic, brand → 10 platform-specific posts |
| 96 | `carousel-creator` | Carousel Creator | Pro | Claude, DALL-E | content, style → Instagram carousel (10 slides) |
| 97 | `social-video-script` | Social Video Script | Pro | Claude, Gemini | topic → 60-sec video script + hooks |
| 98 | `hashtag-optimizer` | Hashtag Optimizer | Pro | Claude, Qwen | content → 30 optimized hashtags + strategy |
| 99 | `thread-generator` | Thread Generator | Pro | Claude | article, topic → Twitter/X thread (10-15 tweets) |
| 100 | `reels-script-batch` | Reels Script Batch | Pro | Claude, Gemini | 5 topics → 5 Reels scripts with hooks |
| 101 | `linkedin-carousel` | LinkedIn Carousel | Pro | Claude, DALL-E | topic → PDF carousel (10 slides) |
| 102 | `ugc-brief-generator` | UGC Brief Generator | Pro | Claude | product → UGC creator brief + shot list |
| 103 | `email-sequence` | Email Sequence | Pro | Claude | product, goal → 5-email drip sequence |
| 104 | `newsletter-template` | Newsletter Template | Pro | Claude, Resend | content → Branded newsletter HTML |
| 105 | `welcome-sequence` | Welcome Sequence | Pro | Claude | brand → 3-email onboarding flow |
| 106 | `promo-email-ab` | Promo Email A/B | Pro | Claude | offer → 3 A/B variants of promo email |
| 107 | `cold-outreach` | Cold Outreach | Pro | Claude | target, value → 5 cold email variants |
| 108 | `ad-copy-generator` | Ad Copy Generator | Pro | Claude, Gemini | product, audience → 10 ad copy variants |
| 109 | `ad-image-batch` | Ad Image Batch | Pro | DALL-E 3, ModelsLab | brief → 5 ad images (1200x628) |
| 110 | `video-ad-script` | Video Ad Script | Pro | Claude | product → 30-sec video ad script |
| 111 | `retargeting-ads` | Retargeting Ads | Pro | Claude, DALL-E | product → 5 retargeting ad variants |
| 112 | `campaign-brief` | Campaign Brief | Pro | Claude | goal → Full campaign brief + assets list |
| 113 | `seo-blog-outline` | SEO Blog Outline | Pro | Claude | keyword → SEO-optimized blog outline |
| 114 | `meta-tags-batch` | Meta Tags Batch | Pro | Claude | 5 pages → Title + Description for 5 pages |
| 115 | `content-repurpose` | Content Repurpose | Pro | Claude | blog post → 5 social posts + 1 thread + email |
| 116 | `landing-page-copy` | Landing Page Copy | Pro | Claude | product → Full landing page copy |
| 117 | `marketing-translate` | Marketing Translate | Pro | DeepL, Qwen | content, langs → Translation to 5 languages |
| 118 | `regional-adapt` | Regional Adapt | Pro | Claude, Qwen, Gemini | content, region → Culturally adapted content |
| 119 | `multilingual-campaign` | Multilingual Campaign | Enterprise | DeepL, Regional LLM | campaign → Full campaign in 3 languages |

---

## ✨ CATEGORY 15: CREATOR/ENHANCEMENT (22 Pipelines) - HIGH DEMAND

### Video Enhancement

| # | Pipeline ID | Name | Tier | Providers | Notes |
|---|-------------|------|------|-----------|-------|
| 120 | `ai-background-removal` | AI Background Removal | Pro | ModelsLab, Replicate, Azure | HIGH DEMAND |
| 121 | `ai-video-upscaling` | AI Video Upscaling | Pro | ModelsLab, Replicate, Alibaba | HIGH DEMAND - 720p→4K |
| 122 | `ai-audio-enhancement` | AI Audio Enhancement | Pro | ElevenLabs, Azure, Alibaba | HIGH DEMAND - Noise removal |
| 123 | `ai-green-screen` | AI Green Screen | Pro | ModelsLab, Replicate | MEDIUM DEMAND |
| 124 | `ai-filler-removal` | AI Filler Word Removal | Pro | ElevenLabs, Azure, OpenAI | HIGH DEMAND |
| 125 | `ai-beat-sync-editing` | AI Beat-Sync Editing | Pro | OpenAI, Gemini, ModelsLab | HIGH DEMAND |

### Captions & Subtitles

| # | Pipeline ID | Name | Tier | Providers | Notes |
|---|-------------|------|------|-----------|-------|
| 126 | `ai-auto-captions` | AI Auto-Captions | Starter | Azure, OpenAI, Alibaba, ElevenLabs | VERY HIGH DEMAND - Table stakes |
| 127 | `ai-styled-captions` | AI Styled Captions | Pro | ModelsLab, OpenAI | HIGH DEMAND - Trending styles |
| 128 | `ai-realtime-translation` | AI Real-time Translation | Enterprise | Azure, DeepL, Alibaba | MEDIUM DEMAND |

### Recording Tools

| # | Pipeline ID | Name | Tier | Providers | Notes |
|---|-------------|------|------|-----------|-------|
| 129 | `ai-teleprompter` | AI Teleprompter | Pro | OpenAI, Claude | HIGH DEMAND |
| 130 | `ai-screen-recording-edit` | Screen Recording + AI Edit | Pro | Gemini, OpenAI, ModelsLab | HIGH DEMAND |
| 131 | `ai-meeting-clips` | AI Meeting Clips | Pro | Gemini, Claude, OpenAI | MEDIUM DEMAND |

### Content Generation

| # | Pipeline ID | Name | Tier | Providers | Notes |
|---|-------------|------|------|-----------|-------|
| 132 | `ai-thumbnail-creator` | AI Thumbnail Creator | Starter | OpenAI, ModelsLab, Alibaba | HIGH DEMAND |
| 133 | `ai-b-roll-generator` | AI B-Roll Generator | Pro | ModelsLab, Alibaba, Replicate | MEDIUM DEMAND |
| 134 | `ai-meme-generator` | AI Meme Generator | Starter | OpenAI, Claude, ModelsLab | MEDIUM DEMAND |
| 135 | `ai-photo-slideshow` | AI Photo Slideshow | Starter | ModelsLab, OpenAI | MEDIUM DEMAND |
| 136 | `ai-progress-bar-animations` | AI Progress Bar Animations | Pro | ModelsLab, OpenAI | HIGH DEMAND - TikTok style |
| 137 | `ai-trending-templates` | AI Trending Templates | Pro | Claude, Gemini, ModelsLab | HIGH DEMAND |

### Avatar & Voice

| # | Pipeline ID | Name | Tier | Providers | Notes |
|---|-------------|------|------|-----------|-------|
| 138 | `ai-voice-clone-reuse` | AI Voice Clone for Videos | Enterprise | ElevenLabs, Alibaba, Azure | HIGH DEMAND |
| 139 | `ai-streaming-avatars` | AI Streaming Avatars | Enterprise | Alibaba, ModelsLab, Azure | HIGH DEMAND |
| 140 | `ai-avatar-library` | Pre-built Avatar Library | Pro | Alibaba, ModelsLab | HIGH DEMAND - 50+ avatars |
| 141 | `ai-podcast-to-clips` | AI Podcast to Clips | Pro | Gemini, OpenAI, ElevenLabs | HIGH DEMAND |

---

## 📊 TIER DISTRIBUTION

| Tier | Count | Percentage | Features |
|------|-------|------------|----------|
| **Starter** | 8 | 5.7% | Basic pipelines, essential tools |
| **Pro** | 103 | 73.0% | Full production capabilities |
| **Enterprise** | 30 | 21.3% | VR/AR, avatars, advanced AI |

---

## 🌐 5-ZONE REGIONAL ROUTING

| Zone | Languages | Primary Provider | Fallback |
|------|-----------|-----------------|----------|
| **Claude Zone** | EN, FR, DE, ES, PT, IT | Claude 3.5 Sonnet | GPT-4o |
| **Alibaba Zone** | ZH, JA, KO, VI, TH | Qwen-Max, CosyVoice | Gemini |
| **Arabic Zone** | AR, HE, FA, UR | GPT-4o | Azure |
| **Gemini Zone** | HI, BN, TA, TE, ID, SW | Gemini 2.5 Pro | GPT-4o |
| **Fallback Zone** | All others | DeepSeek V3 | OpenAI |

---

## 🔗 INTEGRATION POINTS

- **Ask Genie**: Full knowledge of all 141 pipelines
- **LoopAgent**: 98% automation with self-correction
- **A2A Coordinator**: Multi-agent orchestration
- **8-Step Wizard**: Dynamic pipeline selection
- **Genie Cast**: Marketing distribution automation

---

## 📁 SOURCE FILES

- Registry: `src/components/ai-hub/provider-matrix/pipelineIORegistry.ts`
- Knowledge Base: `src/services/askGeniePipelineKnowledgeBase.ts`
- LoopAgent: `src/services/executionEngines/LoopAgentSelfCorrectionEngine.ts`
- Dynamic Selection: `src/hooks/useDynamicPipeline.ts`

---

**Document Version:** 2.0  
**Last Updated:** 2025-01-25  
**Maintained By:** Genie AI Engineering Team
