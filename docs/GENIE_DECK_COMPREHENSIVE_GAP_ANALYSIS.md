# Genie Deck - Comprehensive Architecture Gap Analysis

## Executive Summary

This document provides a comprehensive review of the Genie Deck generation system, analyzing the **Visualization Recommendation Service**, **Global Tier Filter**, and **Audio Config** integration. It identifies gaps, missing functionality, and required updates across all scenario combinations.

---

## 1. Current Architecture Assessment

### ✅ What EXISTS and WORKS

| Component | Status | Location |
|-----------|--------|----------|
| Visualization Recommendation Service | ✅ Implemented | `services/visualizationRecommendationService.ts` |
| Framework → Visual Mapping | ✅ Complete (20+ frameworks) | `FRAMEWORK_VISUALIZATION_MAP` |
| Industry → Visual Suggestions | ✅ Complete (10 industries) | `INDUSTRY_VISUALIZATION_SUGGESTIONS` |
| Output Format → Visual Suitability | ✅ Complete | `OUTPUT_FORMAT_VISUALIZATION_MAP` |
| Global Tier Filtering | ⚠️ Documented, partial implementation | `filterByTier()` in architecture doc |
| Audio Generation Config | ✅ Newly added | `outputAwareGenerationService.ts` |
| Expanded Visual Features | ✅ Complete (22 categories, 100+ sub-options) | `expandedVisualFeatures.ts` |
| Expanded Frameworks | ✅ Complete (40+ frameworks, 4 types) | `expandedFrameworks.ts` |
| Expanded Output Types | ✅ Complete (16 types, 3 tiers) | `expandedOutputTypes.ts` |
| Content Fitting Config | ✅ Complete | `generationConfigService.ts` |
| Voice/Audio Config Panel | ✅ Complete UI | `VoiceAudioConfigPanel.tsx` |

### ⚠️ GAPS IDENTIFIED

---

## 2. Critical Gaps & Required Updates

### GAP 1: Global Tier State Not Implemented in Wizard

**Status**: 🔴 MISSING  
**Impact**: High - All tier filtering is theoretical without state

**Problem**: 
The `globalTier` state is documented but not actually declared in `PresentationWizard.tsx`. The architecture assumes it exists but filtering functions aren't hooked up.

**Required Implementation**:
```typescript
// In PresentationWizard.tsx - ADD:
const [globalTier, setGlobalTier] = useState<1 | 2 | 3>(2); // Default: Advanced

// Create filterByTier utility
const filterByTier = <T extends { tier: number }>(items: T[], tier: number): T[] =>
  items.filter(item => item.tier <= tier);

// Apply to all model arrays
const filteredTextProviders = useMemo(() => filterByTier(ALL_TEXT_PROVIDERS, globalTier), [globalTier]);
const filteredImageProviders = useMemo(() => filterByTier(ALL_IMAGE_PROVIDERS, globalTier), [globalTier]);
// ... etc for voice, video, translation models
```

**Files to Update**:
- `src/components/genie-studio/presentation-generator/PresentationWizard.tsx`

---

### GAP 2: Audio Config Not Connected to Generation Request

**Status**: 🔴 MISSING  
**Impact**: High - Audio settings lost during generation

**Problem**: 
The `AudioGenerationConfig` type exists in `outputAwareGenerationService.ts`, but the wizard's `handleGenerate()` doesn't pass audio settings to the generation pipeline.

**Required Implementation**:
```typescript
// In PresentationWizard.tsx handleGenerate():
const generationRequest = {
  // ... existing fields
  audioConfig: {
    enabled: voiceConfig.enabled,
    voiceProvider: voiceConfig.provider,
    voiceId: voiceConfig.voiceId,
    voiceSettings: {
      speed: voiceConfig.speed,
      pitch: voiceConfig.pitch,
      stability: voiceConfig.stability,
      clarity: voiceConfig.clarity,
    },
    backgroundMusic: {
      enabled: voiceConfig.backgroundMusic,
      genre: selectedMusicGenre,
      mood: selectedMusicMood,
      volume: voiceConfig.musicVolume,
    },
    sfx: {
      enabled: outputType.includes('video') || outputType.includes('3d'),
      transitionSounds: true,
      ambientSounds: outputType.includes('immersive'),
    },
    pauseBetweenSlides: voiceConfig.pauseBetweenSlides,
    languageCode: primaryLanguage,
  }
};
```

**Files to Update**:
- `src/components/genie-studio/presentation-generator/PresentationWizard.tsx`
- `src/services/universalPresentationService.ts` (add audioConfig to interface)

---

### GAP 3: Visualization Recommendations Not Used in UI

**Status**: 🟡 PARTIAL  
**Impact**: Medium - Recommendations generated but not displayed

**Problem**: 
The `visualizationRecommendationService` is exported but not called from `TemplateBrandingPanelV2` or `VisualFeaturesDropdown`.

**Required Implementation**:
```typescript
// In TemplateBrandingPanelV2.tsx - ADD:
const visualRecommendations = useMemo(() => 
  getVisualizationRecommendations({
    industry: selectedIndustry,
    segment: selectedSegment,
    contentTypes: selectedContentTypes,
    selectedFrameworks: selectedFrameworkIds,
    outputType: selectedOutputType,
    globalTier,
    userPrompt: inputPrompt,
  }),
  [selectedIndustry, selectedFrameworkIds, outputType, globalTier]
);

// Display AI badges on recommended features
// Show \"AI Suggested\" tooltip with reasoning
```

**Files to Update**:
- `src/components/genie-studio/presentation-generator/TemplateBrandingPanelV2.tsx`
- Create: `src/components/genie-studio/presentation-generator/components/VisualFeatureRecommendationBadge.tsx`

---

### GAP 4: Framework Tier Filtering Not Applied

**Status**: 🔴 MISSING  
**Impact**: Medium - Premium frameworks shown to all tiers

**Problem**: 
Frameworks in `expandedFrameworks.ts` have `tier` properties but no filtering is applied based on `globalTier`.

**Required Implementation**:
```typescript
// Add filterFrameworksByTier utility
export function filterFrameworksByTier(
  categories: FrameworkCategory[], 
  maxTier: number
): FrameworkCategory[] {
  return categories.map(cat => ({
    ...cat,
    frameworks: cat.frameworks.filter(f => f.tier <= maxTier)
  })).filter(cat => cat.frameworks.length > 0);
}

// Apply in wizard:
const filteredFrameworks = useMemo(() => 
  filterFrameworksByTier(EXPANDED_FRAMEWORK_CATEGORIES, globalTier),
  [globalTier]
);
```

**Files to Update**:
- `src/components/genie-studio/presentation-generator/constants/expandedFrameworks.ts`
- `src/components/genie-studio/presentation-generator/TemplateBrandingPanelV2.tsx`

---

### GAP 5: Language-Voice Provider Pairing Not Enforced

**Status**: 🟡 PARTIAL  
**Impact**: High - Wrong voice for language

**Problem**: 
`VoiceAudioConfigPanel` allows any voice provider selection, but language-specific pairing (e.g., Alibaba CosyVoice for CJK) isn't enforced.

**Required Implementation**:
```typescript
// Create language-voice pairing validator
interface LanguageVoicePairing {
  languageCode: string;
  primaryProvider: string;
  fallbackProviders: string[];
  nativeVoiceIds: string[];
}

const LANGUAGE_VOICE_PAIRINGS: LanguageVoicePairing[] = [
  { languageCode: 'zh', primaryProvider: 'alibaba', fallbackProviders: ['azure', 'google'], nativeVoiceIds: ['cosyvoice-zh'] },
  { languageCode: 'ja', primaryProvider: 'alibaba', fallbackProviders: ['azure', 'google'], nativeVoiceIds: ['cosyvoice-ja'] },
  { languageCode: 'en', primaryProvider: 'elevenlabs', fallbackProviders: ['openai', 'azure'], nativeVoiceIds: ['rachel', 'josh'] },
  // ... etc
];

// Warn user when selecting non-optimal provider
function validateVoiceSelection(languageCode: string, provider: string): { valid: boolean; warning?: string } {
  const pairing = LANGUAGE_VOICE_PAIRINGS.find(p => p.languageCode === languageCode);
  if (pairing && provider !== pairing.primaryProvider && !pairing.fallbackProviders.includes(provider)) {
    return { valid: true, warning: `${pairing.primaryProvider} is recommended for ${languageCode}` };
  }
  return { valid: true };
}
```

**Files to Update**:
- Create: `src/components/genie-studio/presentation-generator/services/languageVoicePairingService.ts`
- `src/components/genie-studio/presentation-generator/VoiceAudioConfigPanel.tsx`

---

### GAP 6: Output Type → Required Audio Not Auto-Enabled

**Status**: 🔴 MISSING  
**Impact**: High - Required voiceover not auto-enabled

**Problem**: 
When user selects `video-full` or `3d-animated` (which have `requiresVoice: true`), the voice toggle isn't automatically enabled.

**Required Implementation**:
```typescript
// In OutputTypePanel.tsx or wizard:
useEffect(() => {
  const selectedOutput = getOutputById(selectedOutputType);
  if (selectedOutput?.requiresVoice && !voiceConfig.enabled) {
    // Auto-enable voice with suggestion
    toast({
      title: \"Voiceover Enabled\",
      description: `${selectedOutput.name} requires voiceover. Voice has been enabled.`,
    });
    setVoiceConfig(prev => ({ ...prev, enabled: true }));
  }
}, [selectedOutputType]);
```

**Files to Update**:
- `src/components/genie-studio/presentation-generator/PresentationWizard.tsx`
- `src/components/genie-studio/presentation-generator/OutputTypePanel.tsx`

---

### GAP 7: Multi-Language Audio Generation Not Orchestrated

**Status**: 🔴 MISSING  
**Impact**: High - Only single language voiceover generated

**Problem**: 
When multiple languages are selected (up to 7 for 2D), audio generation only considers primary language.

**Required Implementation**:
```typescript
// In outputAwareGenerationService.ts - ADD:
export interface MultiLanguageAudioConfig {
  languages: {
    code: string;
    isPrimary: boolean;
    voiceProvider: string;
    voiceId: string;
  }[];
  generateParallel: boolean;
  syncDuration: boolean; // Ensure all languages have same duration
}

// Extend SlideRenderDecision:
export interface SlideRenderDecision {
  // ... existing fields
  multiLanguageAudio?: {
    [languageCode: string]: {
      voiceProvider: string;
      voiceId: string;
      script: string;
    };
  };
}
```

**Files to Update**:
- `src/components/genie-studio/presentation-generator/services/outputAwareGenerationService.ts`
- `src/components/genie-studio/presentation-generator/AgentLanguageConfigPanel.tsx`

---

### GAP 8: SFX Generation Not Implemented

**Status**: 🔴 MISSING  
**Impact**: Medium - No sound effects for video/3D

**Problem**: 
`AudioGenerationConfig.sfx` is defined but no edge function or service exists to generate SFX.

**Required Implementation**:
1. Create edge function: `supabase/functions/elevenlabs-sfx/index.ts`
2. Add SFX service method to `outputAwareGenerationService`
3. Integrate with video/3D output pipeline

```typescript
// SFX types to generate:
type SFXType = 
  | 'transition-whoosh'
  | 'transition-fade'
  | 'click'
  | 'notification'
  | 'ambient-office'
  | 'ambient-nature'
  | 'success'
  | 'error';

async function generateSFX(type: SFXType, duration: number): Promise<string> {
  // Call ElevenLabs SFX API
}
```

**Files to Create**:
- `supabase/functions/elevenlabs-sfx/index.ts`
- `src/services/sfxGenerationService.ts`

---

### GAP 9: Background Music Generation Not Implemented

**Status**: 🔴 MISSING  
**Impact**: Medium - No background music for video

**Problem**: 
Music generation is flagged in config but no edge function exists.

**Required Implementation**:
Create edge function using ElevenLabs Music API or Mubert:

```typescript
// supabase/functions/generate-background-music/index.ts
interface MusicRequest {
  duration: number;
  genre: 'corporate' | 'upbeat' | 'ambient' | 'cinematic';
  mood: 'professional' | 'energetic' | 'calm' | 'inspirational';
  bpm?: number;
}
```

**Files to Create**:
- `supabase/functions/elevenlabs-music/index.ts`
- `src/services/musicGenerationService.ts`

---

### GAP 10: Token/Credit Estimation Missing Audio Costs

**Status**: 🟡 PARTIAL  
**Impact**: Medium - Inaccurate cost estimates

**Problem**: 
`tokenEstimationService` calculates text/image/video costs but doesn't include:
- Per-language voiceover costs
- Background music costs
- SFX costs

**Required Implementation**:
```typescript
// In tokenEstimationService.ts - ADD:
const AUDIO_TOKEN_COSTS = {
  voiceoverPerMinute: { elevenlabs: 1500, openai: 500, google: 300, azure: 400 },
  backgroundMusicPerMinute: 2000,
  sfxPerEffect: 200,
  voiceCloning: 5000, // Premium feature
};

function estimateAudioTokens(config: AudioGenerationConfig, slideCount: number, languages: string[]): TokenBreakdown {
  const avgDurationPerSlide = 30; // seconds
  const totalMinutes = (slideCount * avgDurationPerSlide) / 60;
  
  let tokens = 0;
  
  if (config.enabled) {
    // Multiply by language count
    tokens += AUDIO_TOKEN_COSTS.voiceoverPerMinute[config.voiceProvider] * totalMinutes * languages.length;
  }
  
  if (config.backgroundMusic.enabled) {
    tokens += AUDIO_TOKEN_COSTS.backgroundMusicPerMinute * totalMinutes;
  }
  
  if (config.sfx.enabled) {
    tokens += AUDIO_TOKEN_COSTS.sfxPerEffect * slideCount; // Assume 1 SFX per slide
  }
  
  return { category: 'audio', tokens, breakdown: { /* ... */ } };
}
```

**Files to Update**:
- `src/components/genie-studio/presentation-generator/services/tokenEstimationService.ts`

---

## 3. Missing Scenario Combinations

### Matrix: Output Type × Audio × Language × Tier

| Output Type | Audio Required | Multi-Lang | Tier 1 | Tier 2 | Tier 3 |
|-------------|---------------|------------|--------|--------|--------|
| pdf-export | ❌ | N/A | ✅ | ✅ | ✅ |
| 2d-static | ⚙️ Optional | ✅ (7) | ✅ | ✅ | ✅ |
| 2d-animated | ⚙️ Optional | ✅ (7) | ❌ | ✅ | ✅ |
| video-short | ✅ | ✅ (3) | ❌ | ✅ | ✅ |
| video-full | ✅ | ✅ (3) | ❌ | ❌ | ✅ |
| 3d-static | ⚙️ | ❌ (1) | ❌ | ✅ | ✅ |
| 3d-animated | ✅ | ❌ (1) | ❌ | ❌ | ✅ |
| interactive | ⚙️ | ✅ (7) | ❌ | ❌ | ✅ |
| vr-experience | ✅ | ❌ (1) | ❌ | ❌ | ✅ |
| ar-overlay | ⚙️ | ❌ (1) | ❌ | ❌ | ✅ |
| mixed-reality | ✅ | ✅ (3) | ❌ | ❌ | ✅ |

**Missing Enforcement**:
- [ ] Language count limits per output type
- [ ] Auto-tier selection based on output type
- [ ] Tier upgrade prompts for restricted outputs

---

## 4. Visual Feature × Output Type Compatibility Matrix

| Visual Feature | 2D Static | 2D Animated | Video | 3D | Interactive |
|----------------|-----------|-------------|-------|-----|-------------|
| Charts | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Data Tables | ✅ | ✅ | ❌ | ❌ | ✅ |
| Diagrams | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Journey Maps | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Timelines | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Images | ✅ | ✅ | ✅ | ✅ | ✅ |
| Video Clips | ❌ | ⚠️ | ✅ | ⚠️ | ✅ |
| Audio | ❌ | ⚠️ | ✅ | ✅ | ✅ |
| Animations | ❌ | ✅ | ✅ | ✅ | ✅ |
| 3D Objects | ❌ | ❌ | ⚠️ | ✅ | ⚠️ |
| 3D Scenes | ❌ | ❌ | ❌ | ✅ | ⚠️ |
| AR Elements | ❌ | ❌ | ❌ | ⚠️ | ⚠️ |
| Clickable | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| Forms | ❌ | ❌ | ❌ | ❌ | ✅ |
| Quizzes | ❌ | ❌ | ❌ | ❌ | ✅ |
| Real-time | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend**: ✅ Optimal | ⚠️ Limited | ❌ Not Supported

**Missing**: Filter visual features based on selected output type in UI

---

## 5. Implementation Priority Queue

### Phase 1: Critical (Week 1)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| P0 | Implement `globalTier` state in wizard | PresentationWizard.tsx | 2h |
| P0 | Connect audio config to generation request | PresentationWizard.tsx, universalPresentationService.ts | 3h |
| P0 | Auto-enable voice for required output types | OutputTypePanel.tsx | 1h |
| P1 | Apply tier filter to all model arrays | PresentationWizard.tsx | 2h |
| P1 | Apply tier filter to frameworks | expandedFrameworks.ts, TemplateBrandingPanelV2.tsx | 2h |

### Phase 2: High Priority (Week 2)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| P1 | Integrate visualization recommendations in UI | TemplateBrandingPanelV2.tsx | 4h |
| P1 | Create language-voice pairing service | languageVoicePairingService.ts | 3h |
| P1 | Add audio costs to token estimation | tokenEstimationService.ts | 2h |
| P2 | Filter visual features by output type | VisualFeaturesDropdown.tsx | 2h |

### Phase 3: Medium Priority (Week 3)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| P2 | Multi-language audio orchestration | outputAwareGenerationService.ts | 4h |
| P2 | Create SFX generation edge function | elevenlabs-sfx/index.ts | 3h |
| P2 | Create music generation edge function | elevenlabs-music/index.ts | 3h |
| P2 | Language count enforcement by output type | AgentLanguageConfigPanel.tsx | 2h |

### Phase 4: Enhancements (Week 4+)

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| P3 | Tier upgrade prompts | PresentationWizard.tsx | 2h |
| P3 | Visual feature compatibility warnings | VisualFeaturesDropdown.tsx | 2h |
| P3 | Audio preview before generation | VoiceAudioConfigPanel.tsx | 4h |
| P3 | Per-language voice preview | AgentLanguageConfigPanel.tsx | 3h |

---

## 6. New Services to Build

### 1. `languageVoicePairingService.ts`
- Language → Provider pairing matrix
- Fallback chain per language
- Voice ID recommendations per language/accent

### 2. `sfxGenerationService.ts`
- SFX type definitions
- ElevenLabs SFX API integration
- Caching for common effects

### 3. `musicGenerationService.ts`
- Genre/mood configuration
- Duration-aware generation
- Looping for long presentations

### 4. `outputCompatibilityService.ts`
- Visual feature → Output type compatibility
- Auto-disable incompatible features
- User warnings for limitations

### 5. `tierEnforcementService.ts`
- Centralized tier validation
- Upgrade prompts
- Feature availability by tier

---

## 7. Testing Scenarios

### Critical Test Cases

1. **Tier 1 + Video Full** → Should block (video-full is Tier 3)
2. **3D Animated + 7 Languages** → Should reduce to 1 language
3. **Video + Data Tables** → Should warn (not suitable)
4. **Finance + SWOT** → Should recommend waterfall + quadrant charts
5. **Multi-language + Voice** → Should use language-specific providers
6. **Interactive + Forms** → Should work (compatible)
7. **AR Overlay + Quizzes** → Should warn (not suitable)

---

## 8. Summary

### ✅ Complete
- Visualization Recommendation Service logic
- Expanded Visual Features (22 categories)
- Expanded Frameworks (40+)
- Expanded Output Types (16)
- Audio Config types
- Content Fitting logic

### 🔴 Missing (Critical)
- Global Tier state implementation
- Audio config → Generation request connection
- Voice auto-enable for required outputs
- Multi-language audio orchestration

### 🟡 Partial
- Visualization recommendations UI integration
- Language-voice pairing enforcement
- Output type → Visual feature filtering

### ❌ Not Built
- SFX generation edge function
- Music generation edge function
- Audio token cost estimation
- Tier enforcement service

---

*Document Version: 1.0*  
*Last Updated: 2026-01-21*  
*Author: Genie AI Architecture Review*
