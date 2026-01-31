

# Plan: Fix TTS Regional Routing & Multi-Provider Fallback Chain

## Problem Summary

The TTS generation for **Telugu** and **Hindi** (Gemini Zone languages) is failing because:
1. **Google TTS is selected as primary** (correct per routing logic)
2. **Google TTS fails** (likely due to API key incompatibility - GEMINI_API_KEY ≠ Google Cloud TTS API key)
3. **Fallback attempts OpenAI** which fails on the 4096 character limit
4. **ElevenLabs is never tried** because the fallback chain breaks on OpenAI failure

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    TTS PROVIDER FALLBACK CHAIN                      │
├─────────────────────────────────────────────────────────────────────┤
│  GEMINI ZONE (hi, te, ta, bn, etc.)                                │
│  ┌─────────┐    ┌─────────┐    ┌────────────┐    ┌─────────┐       │
│  │ Azure   │ ─► │ Google  │ ─► │ ElevenLabs │ ─► │ OpenAI  │       │
│  │ Neural  │    │ TTS     │    │            │    │ (last)  │       │
│  └─────────┘    └─────────┘    └────────────┘    └─────────┘       │
│      P1            P2               P3              P4              │
├─────────────────────────────────────────────────────────────────────┤
│  CLAUDE ZONE (en, de, fr, es, etc.)                                │
│  ┌────────────┐    ┌─────────┐    ┌─────────┐                      │
│  │ ElevenLabs │ ─► │ OpenAI  │ ─► │ Azure   │                      │
│  └────────────┘    └─────────┘    └─────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Update TTS Provider Priority for Gemini Zone

**File:** `supabase/functions/multi-provider-tts/index.ts`

Change Gemini Zone routing to prefer Azure Neural (which works well with Indian languages) over Google TTS:

**Current (line 206-208):**
```typescript
if (GEMINI_REGIONS.includes(region) && hasProvider('google')) {
  console.log('🌏 Gemini Zone: Routing to Google TTS');
  return { provider: 'google', cost: 0.016, zone: 'gemini', quality: 'standard' };
}
```

**Updated:**
```typescript
// South Asian/SEA: Prefer Azure Neural (excellent Indian language support)
if (GEMINI_REGIONS.includes(region)) {
  if (hasProvider('azure')) {
    console.log('🌏 Gemini Zone: Routing to Azure Neural TTS');
    return { provider: 'azure', cost: 0.016, zone: 'gemini', quality: 'premium' };
  }
  if (hasProvider('google')) {
    console.log('🌏 Gemini Zone fallback: Routing to Google TTS');
    return { provider: 'google', cost: 0.016, zone: 'gemini', quality: 'standard' };
  }
}
```

---

### Step 2: Implement Resilient Multi-Provider Fallback Chain

**File:** `supabase/functions/multi-provider-tts/index.ts`

Replace the current simple fallback (lines 532-546) with a complete fallback chain:

```typescript
} catch (primaryError) {
  console.warn(`⚠️ Primary provider ${routing.provider} failed:`, primaryError.message);
  
  // Build fallback chain based on zone
  const fallbackChain: TTSProvider[] = [];
  
  if (routing.zone === 'gemini') {
    // Gemini Zone: Azure → Google → ElevenLabs → OpenAI
    fallbackChain.push('azure', 'google', 'elevenlabs', 'openai');
  } else if (routing.zone === 'alibaba') {
    // Alibaba Zone: Azure → ElevenLabs → OpenAI → Google
    fallbackChain.push('azure', 'elevenlabs', 'openai', 'google');
  } else {
    // Claude Zone: ElevenLabs → OpenAI → Azure → Google
    fallbackChain.push('elevenlabs', 'openai', 'azure', 'google');
  }
  
  // Remove already-tried provider and unavailable providers
  const availableProviders = getAvailableProviders().filter(p => p.available).map(p => p.id);
  const remainingProviders = fallbackChain.filter(
    p => p !== routing.provider && availableProviders.includes(p)
  );
  
  console.log(`🔄 Fallback chain: ${remainingProviders.join(' → ')}`);
  
  let lastError = primaryError;
  for (const fallbackProvider of remainingProviders) {
    try {
      console.log(`🔄 Trying fallback: ${fallbackProvider}`);
      
      switch (fallbackProvider) {
        case 'elevenlabs':
          audioBuffer = await generateElevenLabsTTS(request.text, request.voice, request.speed);
          break;
        case 'openai':
          audioBuffer = await generateOpenAITTS(request.text, request.voice, request.speed);
          break;
        case 'azure':
          audioBuffer = await generateAzureTTS(request.text, languageCode, request.voice);
          break;
        case 'google':
          audioBuffer = await generateGoogleTTS(request.text, languageCode, request.voice);
          break;
        default:
          continue;
      }
      
      routing.provider = fallbackProvider;
      routing.zone = 'fallback';
      console.log(`✅ Fallback to ${fallbackProvider} succeeded`);
      break; // Success - exit loop
      
    } catch (fallbackError) {
      console.warn(`⚠️ Fallback ${fallbackProvider} failed:`, fallbackError.message);
      lastError = fallbackError;
    }
  }
  
  if (!audioBuffer) {
    throw lastError; // All providers failed
  }
}
```

---

### Step 3: Add Text Chunking to Azure TTS

**File:** `supabase/functions/multi-provider-tts/index.ts`

Azure TTS needs chunking support for long content (currently only OpenAI, ElevenLabs, and Google have it):

```typescript
async function generateAzureTTS(text: string, languageCode?: string, voice?: string): Promise<ArrayBuffer> {
  const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY');
  const AZURE_SPEECH_REGION = Deno.env.get('AZURE_SPEECH_REGION') || 'eastus';
  if (!AZURE_SPEECH_KEY) throw new Error('Azure Speech key not configured');

  // Voice mapping for Indic languages
  const voiceMap: Record<string, string> = {
    'en-US': 'en-US-JennyNeural',
    'hi-IN': 'hi-IN-SwaraNeural',
    'te-IN': 'te-IN-ShrutiNeural',
    'ta-IN': 'ta-IN-PallaviNeural',
    'bn-IN': 'bn-IN-TanishaaNeural',
    'mr-IN': 'mr-IN-AarohiNeural',
    'gu-IN': 'gu-IN-DhwaniNeural',
    'kn-IN': 'kn-IN-SapnaNeural',
    'ml-IN': 'ml-IN-SobhanaNeural',
    // ... other languages
  };

  const AZURE_MAX_CHARS = 4000; // Azure SSML limit
  const chunks = chunkTextBySentences(text, AZURE_MAX_CHARS);
  console.log(`☁️ Azure: Processing ${chunks.length} chunk(s), total ${text.length} chars`);

  const audioBuffers: ArrayBuffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const lang = languageCode || 'en-US';
    const selectedVoice = voice || voiceMap[lang] || 'en-US-JennyNeural';

    const ssml = `<speak version='1.0' xml:lang='${lang}'><voice name='${selectedVoice}'>${chunk}</voice></speak>`;

    const response = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure TTS error: ${error}`);
    }

    audioBuffers.push(await response.arrayBuffer());
  }

  return chunks.length === 1 ? audioBuffers[0] : await concatenateAudioBuffers(audioBuffers);
}
```

---

### Step 4: Add Better Logging for Debugging

Add detailed logging to track the full routing decision:

```typescript
console.log(`📢 TTS Request Details:
  - Text Length: ${request.text.length} chars
  - Region: ${region}
  - Language: ${languageCode}
  - Tier: ${tier}
  - Zone Detection:
    - Is CJK Region: ${CJK_REGIONS.includes(region)}
    - Is MENA Region: ${MENA_REGIONS.includes(region)}
    - Is Gemini Region: ${GEMINI_REGIONS.includes(region)}
    - Is ElevenLabs Region: ${ELEVENLABS_REGIONS.includes(region)}
  - Available Providers: ${providers.filter(p => p.available).map(p => p.id).join(', ')}
`);
```

---

## Testing Validation

After implementation, test with:

1. **Telugu text (te-IN)** - Should route: Azure → Google → ElevenLabs → OpenAI
2. **Hindi text (hi-IN)** - Should route: Azure → Google → ElevenLabs → OpenAI
3. **English text (en-US)** - Should route: ElevenLabs → OpenAI → Azure
4. **Arabic text (ar-SA)** - Should route: Azure → ElevenLabs → OpenAI

---

## Technical Summary

| Change | Purpose |
|--------|---------|
| Azure as Gemini Zone primary | Azure Neural has excellent Indic language support |
| Complete fallback chain | All 4 providers tried before failure |
| Azure text chunking | Handles long-form content |
| Enhanced logging | Debug routing decisions |

