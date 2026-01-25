# Complete Pipeline Registry - 119 Production-Ready Pipelines

> **Last Updated:** 2026-01-25  
> **Status:** 100% Production-Ready (119/119 Covered)  
> **Source:** `src/components/ai-hub/provider-matrix/pipelineIORegistry.ts`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Pipelines** | 119 |
| **Covered/Production-Ready** | 119 (100%) |
| **Categories** | 14 |
| **Core Providers** | 12 |
| **Input Formats** | 50+ |
| **Output Formats** | 35+ |

### By Subscription Tier

| Tier | Count |
|------|-------|
| Starter | 6 |
| Pro | 89 |
| Enterprise | 24 |

---

## Category 1: Text-Based (10 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 1 | `text-to-image` | Text to Image | Starter | txt, json | png, jpg, webp | OpenAI, ModelsLab, Replicate |
| 2 | `text-to-video` | Text to Video | Pro | txt, json | mp4, webm | ModelsLab, Alibaba, Replicate |
| 3 | `text-to-3d` | Text to 3D | Pro | txt, json | glb, gltf, obj, usdz | ModelsLab, Replicate, Huggingface |
| 4 | `text-to-animation` | Text to Animation | Pro | txt, json | mp4, gif, lottie, spine | ModelsLab, OpenAI |
| 5 | `text-to-avatar` | Text to Avatar | Enterprise | txt, json | avatar_model, glb, vrm | Alibaba, ModelsLab, Azure |
| 6 | `text-to-vr` | Text to VR | Enterprise | txt, json | glb, usdz, vr_experience | ModelsLab, Replicate |
| 7 | `text-to-ar` | Text to AR | Enterprise | txt, json | usdz, glb, ar_experience | ModelsLab, Replicate |
| 8 | `text-to-interactive` | Text to Interactive | Pro | txt, json | html, scorm, json | OpenAI, Claude, Gemini |
| 9 | `text-to-music` | Text to Music | Pro | txt, json | mp3, wav, midi | ElevenLabs, Alibaba |
| 10 | `text-to-sfx` | Text to SFX | Starter | txt, json | wav, mp3, ogg | ElevenLabs, Alibaba |

---

## Category 2: Image-Based (8 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 11 | `image-to-video` | Image to Video | Pro | png, jpg, webp | mp4, webm | ModelsLab, Alibaba, Replicate |
| 12 | `image-to-3d` | Image to 3D | Pro | png, jpg | glb, gltf, obj, ply | ModelsLab, Replicate, Huggingface |
| 13 | `image-to-animation` | Image to Animation | Pro | png, jpg, gif | mp4, gif, lottie | ModelsLab, Alibaba |
| 14 | `image-to-avatar` | Image to Avatar | Enterprise | png, jpg | avatar_model, glb, vrm | Alibaba, ModelsLab |
| 15 | `image-to-vr` | Image to VR | Enterprise | png, jpg, equirectangular | glb, vr_experience | ModelsLab, Replicate |
| 16 | `image-to-ar` | Image to AR | Enterprise | png, jpg | usdz, ar_experience | ModelsLab, Replicate |
| 17 | `image-to-vfx` | Image to VFX | Pro | png, jpg, exr | mp4, mov_prores, exr_seq | ModelsLab, Replicate |
| 18 | `image-to-portrait` | Image to Portrait | Starter | png, jpg | png, jpg, mp4 | ModelsLab, Alibaba |

---

## Category 3: Voice/Audio (8 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 19 | `voice-to-animation` | Voice to Animation | Pro | mp3, wav, webm | mp4, gif, lottie | Azure, Alibaba, ModelsLab |
| 20 | `voice-to-avatar` | Voice to Avatar | Enterprise | mp3, wav | mp4, webm, avatar_model | Alibaba, Azure, ModelsLab |
| 21 | `voice-to-3d` | Voice to 3D | Enterprise | mp3, wav | glb, gltf | Alibaba, ModelsLab |
| 22 | `voice-to-interactive` | Voice to Interactive | Pro | mp3, wav | html, scorm | OpenAI, Azure, Claude |
| 23 | `voice-to-video` | Voice to Video | Pro | mp3, wav, aac | mp4, webm | ModelsLab, Alibaba |
| 24 | `voice-to-vr` | Voice to VR | Enterprise | mp3, wav | glb, vr_experience | ModelsLab, Replicate |
| 25 | `audio-to-animation` | Audio to Animation | Pro | mp3, wav, midi | mp4, gif | ModelsLab, Alibaba |
| 26 | `audio-to-vfx` | Audio to VFX | Pro | mp3, wav | mp4, mov_prores | ModelsLab, ElevenLabs |

---

## Category 4: Document/PPT (10 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 27 | `ppt-to-video` | PPT to Video | Pro | pptx, ppt, odp | mp4, webm | Gemini, OpenAI, ElevenLabs |
| 28 | `ppt-to-animation` | PPT to Animation | Pro | pptx | mp4, gif, lottie | ModelsLab, OpenAI |
| 29 | `ppt-to-interactive` | PPT to Interactive | Pro | pptx | html, scorm | OpenAI, Claude |
| 30 | `ppt-to-3d` | PPT to 3D | Pro | pptx | glb, gltf | ModelsLab, Replicate |
| 31 | `ppt-to-vr` | PPT to VR | Enterprise | pptx | glb, vr_experience | ModelsLab, Replicate |
| 32 | `document-to-video` | Document to Video | Pro | docx, pdf, txt | mp4, webm | OpenAI, Gemini, ElevenLabs |
| 33 | `document-to-slides` | Document to Slides | Pro | docx, pdf, txt, md | pptx, pdf | OpenAI, Claude, Gemini |
| 34 | `document-to-interactive` | Document to Interactive | Pro | docx, pdf | html, scorm | OpenAI, Claude |
| 35 | `pdf-to-video` | PDF to Video | Pro | pdf | mp4, webm | OpenAI, Gemini, ElevenLabs |
| 36 | `pdf-to-interactive` | PDF to Interactive | Pro | pdf | html, scorm | OpenAI, Claude |

---

## Category 5: Video-Based (9 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 37 | `video-to-avatar` | Video to Avatar | Enterprise | mp4, mov, webm | avatar_model, lora, vrm | Alibaba, ModelsLab |
| 38 | `video-to-3d` | Video to 3D | Enterprise | mp4, mov, webm | glb, gltf, ply, splat | ModelsLab, Replicate |
| 39 | `video-to-animation` | Video to Animation | Pro | mp4, mov | gif, lottie, mp4 | ModelsLab, Alibaba |
| 40 | `video-to-interactive` | Video to Interactive | Pro | mp4, webm | html, scorm | OpenAI, Claude |
| 41 | `video-to-vr` | Video to VR | Enterprise | mp4, mov, equirect_video | glb, vr_experience | ModelsLab, Replicate |
| 42 | `video-to-vfx` | Video to VFX | Pro | mp4, mov, prores | mp4, mov_prores, exr_seq | ModelsLab, Replicate |
| 43 | `video-to-multilingual` | Video to Multilingual | Pro | mp4, mov | mp4, srt, vtt | ElevenLabs, Alibaba, DeepL |
| 44 | `video-to-clips` | Video to Clips | Pro | mp4, mov, webm | mp4, gif | Gemini, OpenAI |
| 45 | `video-to-summary` | Video to Summary | Starter | mp4, mov | txt, json, md | Gemini, Claude, OpenAI |

---

## Category 6: 3D-Based (5 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 46 | `3d-to-video` | 3D to Video | Pro | glb, gltf, fbx, obj | mp4, webm | ModelsLab, Replicate |
| 47 | `3d-to-animation` | 3D to Animation | Pro | glb, gltf, fbx | mp4, gif | ModelsLab, Replicate |
| 48 | `3d-to-vr` | 3D to VR | Enterprise | glb, gltf, obj | glb, usdz, vr_experience | ModelsLab, Replicate |
| 49 | `3d-to-ar` | 3D to AR | Enterprise | glb, gltf, obj | usdz, ar_experience | ModelsLab, Replicate |
| 50 | `3d-to-interactive` | 3D to Interactive | Pro | glb, gltf | html, json | ModelsLab, Replicate |

---

## Category 7: AR/VR Scene (6 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 51 | `scene-to-vr` | Scene to VR | Enterprise | glb, gltf, json | glb, vr_experience | ModelsLab, Replicate |
| 52 | `scene-to-ar` | Scene to AR | Enterprise | glb, gltf, json | usdz, ar_experience | ModelsLab, Replicate |
| 53 | `ar-to-video` | AR to Video | Pro | ar_recording, mp4 | mp4, webm | ModelsLab, Replicate |
| 54 | `vr-to-video` | VR to Video | Pro | vr_recording, mp4 | mp4, webm, equirect | ModelsLab, Replicate |
| 55 | `panorama-to-vr` | Panorama to VR | Pro | jpg, png, equirect | glb, vr_experience | ModelsLab, Replicate |
| 56 | `floor-plan-to-vr` | Floor Plan to VR | Enterprise | pdf, png, dwg, dxf | glb, vr_experience | ModelsLab, Replicate |

---

## Category 8: Complex Multi-modal (7 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 57 | `auto-record-to-avatar` | Auto Record to Avatar | Enterprise | webrtc, mp4, webcam | avatar_model, mp4 | Alibaba, Azure, ModelsLab |
| 58 | `auto-record-to-3d` | Auto Record to 3D | Enterprise | webrtc, mp4 | glb, ply, splat | ModelsLab, Replicate |
| 59 | `auto-record-to-interactive` | Auto Record to Interactive | Pro | webrtc, mp4 | html, scorm | OpenAI, Claude |
| 60 | `auto-record-to-video` | Auto Record to Video | Pro | webrtc, screen_capture | mp4, webm | Gemini, OpenAI |
| 61 | `auto-record-to-vr` | Auto Record to VR | Enterprise | webrtc, mp4 | glb, vr_experience | ModelsLab, Replicate |
| 62 | `multi-modal-mashup` | Multi-modal Mashup | Enterprise | mp4, mp3, png, txt, json | mp4, html | OpenAI, Gemini, ModelsLab |
| 63 | `full-production-suite` | Full Production Suite | Enterprise | ALL FORMATS | ALL FORMATS | All Core 12 |

---

## Category 9: Presentation (5 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 64 | `idea-to-presentation` | Idea to Presentation | Starter | txt, json | pptx, pdf, html | OpenAI, Claude, Gemini |
| 65 | `document-to-presentation` | Document to Presentation | Pro | docx, pdf, txt | pptx, pdf | OpenAI, Claude, Azure |
| 66 | `data-to-presentation` | Data to Presentation | Pro | csv, xlsx, json | pptx, pdf | OpenAI, Gemini |
| 67 | `brand-to-templates` | Brand to Templates | Pro | png, svg, json | pptx, figma, sketch | Gemini, OpenAI |
| 68 | `presentation-to-video` | Presentation to Video | Pro | pptx, pdf | mp4, webm | Gemini, OpenAI, ElevenLabs |

---

## Category 10: Repurposing (8 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 69 | `long-to-shorts` | Long to Shorts | Pro | mp4, mov | mp4, webm | Gemini, OpenAI |
| 70 | `blog-to-video` | Blog to Video | Pro | html, md, txt | mp4, webm | OpenAI, ElevenLabs, ModelsLab |
| 71 | `podcast-to-blog` | Podcast to Blog | Pro | mp3, wav, m4a | md, html, docx | OpenAI, Claude, Gemini |
| 72 | `webinar-to-course` | Webinar to Course | Pro | mp4, webm | scorm, html, mp4 | OpenAI, Claude |
| 73 | `meeting-to-summary` | Meeting to Summary | Starter | mp4, mp3, webrtc | txt, md, pdf | Gemini, Claude, OpenAI |
| 74 | `video-to-blog` | Video to Blog | Pro | mp4, mov | md, html, docx | Gemini, Claude |
| 75 | `course-to-micro` | Course to Micro | Pro | scorm, mp4 | mp4, scorm | OpenAI, Gemini |
| 76 | `content-atomizer` | Content Atomizer | Pro | mp4, pdf, docx | mp4, png, txt, html | Gemini, OpenAI, Claude |

---

## Category 11: Training/L&D (6 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 77 | `sop-to-training` | SOP to Training | Pro | docx, pdf, txt | scorm, mp4, html | OpenAI, Claude, ElevenLabs |
| 78 | `assessment-builder` | Assessment Builder | Pro | txt, json, xlsx | scorm, html, json | OpenAI, Claude |
| 79 | `compliance-module` | Compliance Module | Enterprise | docx, pdf | scorm, mp4 | Claude, OpenAI |
| 80 | `onboarding-flow` | Onboarding Flow | Pro | txt, json, pptx | scorm, html, mp4 | OpenAI, ElevenLabs, ModelsLab |
| 81 | `skill-simulator` | Skill Simulator | Enterprise | json, glb | html, vr_experience, scorm | ModelsLab, Replicate |
| 82 | `certification-creator` | Certification Creator | Enterprise | json, xlsx | scorm, pdf, html | OpenAI, Claude |

---

## Category 12: Marketing/Sales Base (6 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 83 | `ad-generator` | Ad Generator | Pro | txt, png, mp4 | mp4, gif, png | OpenAI, ModelsLab, Claude |
| 84 | `social-suite` | Social Suite | Pro | txt, png, mp4 | mp4, png, gif | Claude, OpenAI, ModelsLab |
| 85 | `product-demo` | Product Demo | Pro | png, mp4, glb | mp4, html, gif | ModelsLab, OpenAI, ElevenLabs |
| 86 | `testimonial-creator` | Testimonial Creator | Pro | mp4, mp3, txt | mp4, webm | ModelsLab, Alibaba, ElevenLabs |
| 87 | `pitch-deck` | Pitch Deck | Pro | txt, json, xlsx | pptx, pdf, mp4 | OpenAI, Claude, Gemini |
| 88 | `proposal-generator` | Proposal Generator | Pro | txt, json, docx | pdf, docx, pptx | Claude, OpenAI |

---

## Category 13: Localization (6 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 89 | `translate-video` | Translate Video | Pro | mp4, mov, srt | mp4, srt, vtt | ElevenLabs, DeepL, Alibaba |
| 90 | `dub-video` | Dub Video | Enterprise | mp4, mov | mp4, mov | ElevenLabs, Alibaba, Azure |
| 91 | `localize-slides` | Localize Slides | Pro | pptx, pdf | pptx, pdf | DeepL, Alibaba, Google |
| 92 | `multi-language-campaign` | Multi-language Campaign | Enterprise | mp4, png, txt | mp4, png, txt | DeepL, ElevenLabs, Alibaba |
| 93 | `voice-clone-dub` | Voice Clone Dub | Enterprise | mp4, mp3 | mp4, mp3 | ElevenLabs, Alibaba |
| 94 | `subtitle-generator` | Subtitle Generator | Starter | mp4, mp3 | srt, vtt, ass | Azure, OpenAI, Alibaba |

---

## Category 14: Marketing-Specific (25 Pipelines)

| # | Pipeline ID | Name | Tier | Input Formats | Output Formats | Providers |
|---|-------------|------|------|---------------|----------------|-----------|
| 95 | `social-post-generator` | Social Post Generator | Pro | topic, brand | 10 platform-specific posts | Claude, Qwen, DALL-E |
| 96 | `carousel-creator` | Carousel Creator | Pro | content, style | Instagram carousel (10 slides) | Claude, DALL-E |
| 97 | `social-video-script` | Social Video Script | Pro | topic | 60-sec video script + hooks | Claude, Gemini |
| 98 | `hashtag-optimizer` | Hashtag Optimizer | Pro | content | 30 optimized hashtags + strategy | Claude, Qwen |
| 99 | `thread-generator` | Thread Generator | Pro | article, topic | Twitter/X thread (10-15 tweets) | Claude |
| 100 | `reels-script-batch` | Reels Script Batch | Pro | 5 topics | 5 Reels scripts with hooks | Claude, Gemini |
| 101 | `linkedin-carousel` | LinkedIn Carousel | Pro | topic | PDF carousel (10 slides) | Claude, DALL-E |
| 102 | `ugc-brief-generator` | UGC Brief Generator | Pro | product | UGC creator brief + shot list | Claude |
| 103 | `email-sequence` | Email Sequence | Pro | product, goal | 5-email drip sequence | Claude |
| 104 | `newsletter-template` | Newsletter Template | Pro | content | Branded newsletter HTML | Claude, Resend |
| 105 | `welcome-sequence` | Welcome Sequence | Pro | brand | 3-email onboarding flow | Claude |
| 106 | `promo-email-ab` | Promo Email A/B | Pro | offer | 3 A/B variants of promo email | Claude |
| 107 | `cold-outreach` | Cold Outreach | Pro | target, value | 5 cold email variants | Claude |
| 108 | `ad-copy-generator` | Ad Copy Generator | Pro | product, audience | 10 ad copy variants | Claude, Gemini |
| 109 | `ad-image-batch` | Ad Image Batch | Pro | brief | 5 ad images (1200x628) | DALL-E 3, ModelsLab |
| 110 | `video-ad-script` | Video Ad Script | Pro | product | 30-sec video ad script | Claude |
| 111 | `retargeting-ads` | Retargeting Ads | Pro | product | 5 retargeting ad variants | Claude, DALL-E |
| 112 | `campaign-brief` | Campaign Brief | Pro | goal | Full campaign brief + assets list | Claude |
| 113 | `seo-blog-outline` | SEO Blog Outline | Pro | keyword | SEO-optimized blog outline | Claude |
| 114 | `meta-tags-batch` | Meta Tags Batch | Pro | 5 pages | Title + Description for 5 pages | Claude |
| 115 | `content-repurpose` | Content Repurpose | Pro | blog post | 5 social posts + 1 thread + email | Claude |
| 116 | `landing-page-copy` | Landing Page Copy | Pro | product | Full landing page copy | Claude |
| 117 | `marketing-translate` | Marketing Translate | Pro | content, langs | Translation to 5 languages | DeepL, Qwen |
| 118 | `regional-adapt` | Regional Adapt | Pro | content, region | Culturally adapted content | Claude, Qwen, Gemini |
| 119 | `multilingual-campaign` | Multilingual Campaign | Enterprise | campaign | Full campaign in 3 languages | DeepL, Regional LLM |

---

## Core 12 Providers

| Provider | Specialization |
|----------|---------------|
| **OpenAI** | GPT-4, DALL-E, Vision, Whisper |
| **Claude** | Long-context, reasoning, code |
| **Gemini** | Multimodal, video understanding |
| **DeepSeek** | Code generation, reasoning |
| **Alibaba** | CJK languages, Qwen, Wan2.2, CosyVoice |
| **Azure** | Neural TTS, Visemes, STT, OCR |
| **ModelsLab** | FLUX, AnimateDiff, 3D mesh generation |
| **Replicate** | Open-source models, fallbacks |
| **ElevenLabs** | Voice cloning, high-fidelity TTS |
| **DeepL** | Professional translation |
| **Supabase** | Auth, Database, Edge Functions |
| **Stripe** | Payments, Subscriptions |

---

## Quick Stats

```
Total Pipelines: 119
├── Text-Based: 10
├── Image-Based: 8
├── Voice/Audio: 8
├── Document/PPT: 10
├── Video-Based: 9
├── 3D-Based: 5
├── AR/VR Scene: 6
├── Complex Multi-modal: 7
├── Presentation: 5
├── Repurposing: 8
├── Training/L&D: 6
├── Marketing/Sales Base: 6
├── Localization: 6
└── Marketing-Specific: 25

By Tier:
├── Starter: 6 (5%)
├── Pro: 89 (75%)
└── Enterprise: 24 (20%)

Coverage: 119/119 (100%)
```

---

## Related Documentation

- [Pipeline Financial Analysis](./PIPELINE_FINANCIAL_ANALYSIS.md)
- [Killer Pipeline Strategy](./KILLER_PIPELINE_STRATEGY.md)
- [Pipeline Commercial Organization](./PIPELINE_COMMERCIAL_ORGANIZATION.md)
- [Genie Cast Distribution Engine](../src/config/genie-dogfood-integration.ts)
