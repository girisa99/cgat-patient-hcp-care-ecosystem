# Memory: architecture/ai/master-provider-routing-immutable-v1
Updated: just now

## Canonical Provider Routing Registry (IMMUTABLE)

The file `src/config/master-provider-routing-registry.ts` is the **single source of truth** for ALL media capability routing. All configs are frozen via `Object.freeze()` to prevent mutation.

### 18 Integrated Providers

**VIDEO**: Vertex Veo 3, Sora 2, Alibaba Wan 2.6/2.2, ModelsLab, Replicate, DeepSeek
**IMAGE**: Gemini 3 Pro, Vertex Imagen 3, Banana Nano, ModelsLab FLUX/SDXL, Stability SDXL, OpenAI DALL-E
**LLM**: Claude 3.5, Qwen Max, Gemini Pro, GPT-4o, DeepSeek V3, Mistral, Cohere, Groq
**TTS**: Azure Neural, Alibaba CosyVoice, Google TTS, ElevenLabs, OpenAI TTS, Amazon Polly
**STT**: Deepgram Nova 2, Alibaba Paraformer, Azure STT, OpenAI Whisper
**AVATAR/3D**: Alibaba Wan 2.2, OmniAvatar, TaoAvatar, MACH, Meshy AI, ModelsLab 3D
**TRANSLATION**: DeepL, Qwen-MT, Azure Translator, Google Translate, AWS Translate

### TTS Routing Hierarchy (Differentiator-First)

| Region/Zone | PRIMARY | SECONDARY | TERTIARY | Voice Clone |
|-------------|---------|-----------|----------|-------------|
| **Western/Europe/LATAM** | Azure Neural | Alibaba CosyVoice | Google TTS | ElevenLabs (premium) |
| **CJK (China/Japan/Korea)** | Alibaba CosyVoice | Azure Neural | Google TTS | Alibaba CosyVoice |
| **MENA/RTL (7 Arabic dialects)** | Azure Neural | Alibaba CosyVoice | Google TTS | ElevenLabs |
| **South Asia (India/Pakistan/Bangladesh)** | Azure Neural | Google TTS | Alibaba CosyVoice | ElevenLabs |
| **SEA (Indonesia/Vietnam/Thailand)** | Azure Neural | Google TTS | Alibaba CosyVoice | ElevenLabs |
| **Africa (Swahili/Yoruba/Amharic)** | Azure Neural | Google TTS | Alibaba CosyVoice | — |

**Key**: 
- Azure Neural is PRIMARY for MENA/RTL because it provides superior Viseme data for lip-sync
- 7 Arabic dialects: ar-SA, ar-AE, ar-EG, ar-MA, ar-JO, ar-IQ, ar-LB
- ElevenLabs is **NEVER** primary for production TTS (premium clone only)
- Alibaba CosyVoice PRIMARY for CJK (native dialect handling)

### Video Generation Hierarchy

| Capability | PRIMARY | SECONDARY | TERTIARY | FALLBACK |
|------------|---------|-----------|----------|----------|
| **Text-to-Video** | Vertex Veo 3 | Sora 2 | Alibaba Wan 2.6 | ModelsLab |
| **Image-to-Video** | Vertex Veo 3 | Alibaba Wan 2.6 | ModelsLab SVD | Replicate |
| **Video-to-Video** | Alibaba Wan 2.6 | Vertex Veo 3 | ModelsLab | Replicate |
| **Video Transitions** | ModelsLab AnimateDiff | Alibaba Wan 2.6 | Vertex Veo 3 | Replicate |
| **Motion Control** | Alibaba Wan 2.6 | ModelsLab | Vertex Veo 3 | Replicate |
| **Video Effects** | ModelsLab | Alibaba Wan 2.6 | Vertex Veo 3 | Replicate |

### Image Generation Hierarchy

| Capability | PRIMARY | SECONDARY | TERTIARY | FALLBACK | LAST RESORT |
|------------|---------|-----------|----------|----------|-------------|
| **Text-to-Image** | Gemini 3 Pro | Vertex Imagen 3 | Banana Nano (2.5 Flash) | ModelsLab FLUX | OpenAI DALL-E |
| **Image-to-Image** | Vertex Imagen 3 | Gemini 3 Pro | ModelsLab SDXL | Replicate | OpenAI DALL-E |
| **Thumbnails** | Gemini 3 Pro | Vertex Imagen 3 | Banana Nano | HuggingFace FLUX | OpenAI DALL-E |

**Key**: OpenAI DALL-E is **LAST RESORT ONLY** — never primary.

### Avatar Generation (GLOBAL - Not Regional)

| Capability | PRIMARY | SECONDARY | TERTIARY | FALLBACK |
|------------|---------|-----------|----------|----------|
| **Talking Head** | Alibaba Wan 2.2 | Azure Video | ModelsLab | Replicate |
| **Full Body** | Alibaba OmniAvatar | Alibaba TaoAvatar | Meshy 3D | ModelsLab |
| **Lip Sync** | Alibaba Wan 2.2 S2V | Azure Viseme | ModelsLab | Replicate |
| **Dubbing** | Alibaba Wan 2.2 S2V | Azure Viseme | ModelsLab | Replicate |
| **Photo-to-Avatar** | Alibaba MACH | Meshy Image-to-3D | ModelsLab 3D | Replicate |

### 3D/VR/AR Generation (GLOBAL)

| Capability | PRIMARY | SECONDARY | TERTIARY | FALLBACK |
|------------|---------|-----------|----------|----------|
| **Text-to-3D** | Meshy | Alibaba MACH | ModelsLab 3D | Replicate |
| **Image-to-3D** | Meshy | Alibaba Richdreamer | ModelsLab 3D | Replicate |
| **AR Avatar** | Alibaba TaoAvatar (90 FPS) | Meshy | ModelsLab | Replicate |
| **VR Scene** | Meshy | Alibaba 3D | ModelsLab | Replicate |
| **Texture Gen** | Meshy Texture | ModelsLab | Alibaba | Replicate |

### Audio Generation

| Capability | PRIMARY | SECONDARY | TERTIARY | FALLBACK |
|------------|---------|-----------|----------|----------|
| **Voice Clone** | Alibaba CosyVoice | ElevenLabs | Azure Custom | ModelsLab |
| **Noise Removal** | Deepgram Enhance | Adobe Podcast | Azure Audio | ModelsLab |
| **Music Gen** | Alibaba FunAudio | ElevenLabs Music | ModelsLab MusicGen | Replicate |
| **SFX Gen** | ElevenLabs SFX | Alibaba SFX | ModelsLab Bark | Replicate |
| **STT** | Deepgram Nova 2 | Azure STT | Alibaba Paraformer | OpenAI Whisper |

### Style Transform

| Style | PRIMARY | SECONDARY | TERTIARY |
|-------|---------|-----------|----------|
| **Anime** | ModelsLab Anime | Alibaba Wan 2.6 | Replicate |
| **Pixar 3D** | Alibaba Wan 2.6 | ModelsLab | Meshy 3D |
| **Photorealistic** | Vertex Veo 3 | Sora 2 | Alibaba Wan 2.6 |
| **Cinematic** | Vertex Veo 3 | Sora 2 | Alibaba Wan 2.6 |
| **Watercolor** | ModelsLab | Vertex Imagen 3 | Alibaba |

### LLM Routing by Zone

| Zone | PRIMARY | FALLBACK |
|------|---------|----------|
| **Claude Zone** (Western/EU) | Claude 3.5 Sonnet | GPT-4o |
| **Alibaba Zone** (CJK/MENA) | Qwen Max | GPT-4o |
| **Gemini Zone** (India/SEA/Africa) | Gemini Pro | GPT-4o |
| **Technical/Code** | DeepSeek V3 | Claude 3.5 |
| **Enterprise Embeddings** | Cohere | OpenAI |
| **Ultra-Fast Inference** | Groq | Gemini Flash |

### Enforcement

All routing configurations in `master-provider-routing-registry.ts` are **frozen** with `Object.freeze()`. Any code that needs provider routing MUST import from this file:

```typescript
import { 
  getTTSRouting, 
  getVideoRouting, 
  getAvatarRouting,
  INTEGRATED_PROVIDERS,
  ARABIC_DIALECTS,
  RTL_LANGUAGES,
} from '@/config/master-provider-routing-registry';
```

### Competitive Differentiators

1. **Azure Neural over ElevenLabs** for production TTS → Superior Viseme data for lip-sync
2. **7 Arabic dialects** vs competitors' 1-2 → ar-SA, ar-AE, ar-EG, ar-MA, ar-JO, ar-IQ, ar-LB
3. **Alibaba CosyVoice for CJK** → Native dialect support (keigo, tones)
4. **Vertex Veo 3 over Sora** for video → Better availability
5. **Gemini 3 Pro over DALL-E** for images → Cost-effective, higher quality
6. **Deepgram Nova 2 for STT** → <100ms real-time latency
7. **18 integrated providers** vs competitors' 1-3 → Maximum flexibility
