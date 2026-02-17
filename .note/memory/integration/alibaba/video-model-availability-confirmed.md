# Memory: integration/alibaba/video-model-availability-confirmed
Updated: 2026-02-10

## Video Models — Complete Regional Availability (from Official Docs)

### Deployment Modes
- **Global**: Virginia access, compute scheduled worldwide
- **International**: Singapore access, compute worldwide excluding China
- **US**: Virginia access, compute restricted to US
- **Mainland China**: Beijing access, compute restricted to China

### Video Generation Models

| Model | Global (Virginia) | International (Singapore) | US (Virginia) | China (Beijing) | Features |
|-------|:-----------------:|:------------------------:|:-------------:|:---------------:|----------|
| **wan2.6-t2v** ⭐ | ✅ | ✅ | ✅ | ✅ | Text+audio→video, multi-shot, 720P/1080P, 5/10/15s |
| **wan2.6-i2v** ⭐ | ✅ | ✅ | ✅ | ✅ | Image+text+audio→video, multi-shot, 720P/1080P, 5/10/15s |
| **wan2.2-kf2v-flash** ⭐ | ❌ | ✅ | ❌ | ✅ | First+last frame→video, 480P/720P/1080P, 5s |
| **wan2.1-kf2v-plus** | ❌ | ✅ | ❌ | ✅ | First+last frame→video, 720P, 5s |
| **wan2.6-r2v** ⭐ | ✅ | ✅ | ❌ | ✅ | Reference video→new video, multi-role, 720P/1080P, 5/10s |
| **wan2.1-vace-plus** | ❌ | ✅ | ❌ | ✅ | General editing: multi-ref, redraw, inpaint, extend, expand, 720P, 5s |

### Digital Human / Avatar Models

| Model | Global | International | US | China | Features |
|-------|:------:|:------------:|:--:|:-----:|----------|
| **wan2.2-s2v** (Digital Human) | ❌ | ❌ | ❌ | ✅ | Image+audio→lip-sync video, 480P/720P, up to 20s |
| **wan2.2-animate-move** (Image-to-Action) | ❌ | ✅ | ❌ | ✅ | Image+ref video→motion transfer, 720P, 2-30s, std/pro modes |
| **wan2.2-animate-mix** (Character Swap) | ❌ | ✅ | ❌ | ✅ | Video+image→character swap, 720P, 2-30s, std/pro modes |
| **AnimateAnyone** | ❌ | ❌ | ❌ | ✅ | Dance replacement, cost-effective, 720P, 2-60s |
| **EMO** | ❌ | ❌ | ❌ | ✅ | Singing lip-sync, 512×512 or 512×704, up to 60s |
| **LivePortrait** | ❌ | ❌ | ❌ | ✅ | Narration lip-sync, up to 4K, up to 180s, best for >20s |
| **Emoji** | ❌ | ❌ | ❌ | ✅ | Emoji templates, 512×512, up to 5s |
| **VideoRetalk** | ❌ | ❌ | ❌ | ✅ | Lip replacement in video, up to 2K, 2-120s |
| **Video Style Transfer** | ❌ | ❌ | ❌ | ✅ | Fixed style templates, up to 4K, up to 30s |

### Video Model Selection Guide
| Scenario | Recommended Model | Region |
|----------|-------------------|--------|
| Text→video generation | wan2.6-t2v | All regions |
| Image→cinematic video | wan2.6-i2v | All regions |
| First+last frame transition | wan2.2-kf2v-flash | Singapore/Beijing |
| Character consistency from ref | wan2.6-r2v | Global/Singapore/Beijing |
| Video editing (local/extend/expand) | wan2.1-vace-plus | Singapore/Beijing |
| Digital human lip-sync (<20s) | wan2.2-s2v | Beijing only |
| Digital human lip-sync (>20s) | LivePortrait | Beijing only |
| Motion transfer from ref video | wan2.2-animate-move | Singapore/Beijing |
| Character swap in video | wan2.2-animate-mix | Singapore/Beijing |
| Dance replacement (budget) | AnimateAnyone | Beijing only |
| Singing performance | EMO | Beijing only |
| Video lip replacement | VideoRetalk | Beijing only |
| Video style redraw (templates) | Video Style Transfer | Beijing only |
| Video style redraw (custom prompts) | wan2.1-vace-plus | Singapore/Beijing |

### Key Specs
- All async (submit task → poll result)
- All output: 30 fps, MP4 H.264 (except AnimateAnyone/EMO/LivePortrait: 15fps)
- wan2.6 models support audio input for A/V sync
- Generated URLs expire after 24 hours
- Batch Operations must be enabled for async calls

### Fallback Strategy
```
Video Generation:
  wan2.6-t2v (Singapore) → Vertex Veo 3 → Sora 2

Digital Human:
  wan2.2-s2v (Beijing) → ModelsLab (International)

Motion Transfer:
  wan2.2-animate-move (Singapore) → wan2.2-animate-move (Beijing)

Video Editing:
  wan2.1-vace-plus (Singapore) → wan2.1-vace-plus (Beijing)
```
