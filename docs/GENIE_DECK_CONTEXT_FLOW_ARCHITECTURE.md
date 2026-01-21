# Genie Deck - Context Flow & Visualization Decision Architecture

## Overview

This document defines how content types, categories, framework categories, design templates, and visual feature sub-options connect through AI Auto mode, Custom mode, and the Unified Global Tier Filter.

**Key Principle**: Industry should NOT rigidly determine visualization recommendations. Instead, all visualization options remain available, with AI recommendations serving as *suggestions* rather than *restrictions*.

---

## 1. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          UNIFIED GLOBAL TIER FILTER                         │
│                     (Standard | Advanced | Premium)                         │
│  Cascades to: All Models, Output Types, Visual Features, Frameworks         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 0: INPUT CONTEXT                               │
│  • Prompt/Text/URL/Uploads                                                  │
│  • Native Language → English Translation (side-by-side)                     │
│  • Extracted Topics & Keywords                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 1: CONFIGURATION (AI Auto | Custom)                 │
│                                                                             │
│  INPUTS:                                                                    │
│  • Industry Category (healthcare, finance, consulting, etc.)                │
│  • Segment (sub-category within industry)                                   │
│  • Collateral Type (investor-pitch, case-study, training, etc.)            │
│  • Target Audience (executive, technical, general, investor)               │
│                                                                             │
│  OUTPUTS → getRecommendedProviders():                                       │
│  • Text Model recommendation                                                │
│  • Image Model recommendation                                               │
│  • Voice Model recommendation                                               │
│  • Translation Model recommendation                                         │
│  • Video Model recommendation                                               │
│                                                                             │
│  MODE BEHAVIOR:                                                             │
│  • AI Auto: System selects optimal models based on context                 │
│  • Custom: User overrides with manual selections                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              STEP 2: TEMPLATE & BRANDING (AI Auto | Custom)                 │
│                                                                             │
│  FRAMEWORK SELECTION (Multi-select):                                        │
│  • Framework Categories: tier1-strategy, portfolio-analysis, universal...  │
│  • Individual Frameworks: SWOT, Porter's 5, Growth Matrix, etc.            │
│                                                                             │
│  VISUAL FEATURES (Multi-select with Sub-options):                          │
│  • Data: Infographics, Charts, Tables (+ specific types)                   │
│  • Structure: Journey Maps, Timelines, Diagrams                            │
│  • Media: Images, Video, Audio, Animations                                 │
│  • 3D/AR: 3D Objects, Scenes, AR Elements                                  │
│  • Interactive: Clickables, Forms, Quizzes                                 │
│  • Layout: Grids, Sections                                                 │
│                                                                             │
│  MODE BEHAVIOR:                                                             │
│  • AI Auto: Recommends based on industry/collateral context               │
│  • Custom: All options available, user selects freely                      │
│                                                                             │
│  ⚠️ FLEXIBILITY RULE: Industry SUGGESTS but does NOT RESTRICT options     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STEP 3: OUTPUT TYPE                                    │
│                                                                             │
│  Output Format Selection:                                                   │
│  • 2D Static (PPTX, PDF, Keynote)                                          │
│  • 2D Animated (Animated slides)                                           │
│  • Video (Intro, Full, Cinematic)                                          │
│  • 3D (Scene, Animated, Interactive)                                       │
│  • Interactive (Web-based, Scrollable)                                     │
│                                                                             │
│  Tier Filtering: Output options filtered by Global Tier                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STEP 4: AGENTS & LANGUAGES                               │
│                                                                             │
│  Agent Architecture:                                                        │
│  • Single Agent: Simple, fast                                              │
│  • Agentic AI: Multi-agent collaboration                                   │
│  • A2A: Agent-to-agent advanced orchestration                              │
│                                                                             │
│  Language Configuration:                                                    │
│  • Primary + Secondary languages                                           │
│  • Per-language voice provider selection                                   │
│  • Limit: 1 for 3D/Video, up to 7 for 2D                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   STEP 5: REVIEW & GENERATE                                 │
│                                                                             │
│  Pre-Generation Confirmation:                                               │
│  • All context aggregated from Steps 0-4                                   │
│  • Token/Credit estimation                                                 │
│  • Final validation gate                                                   │
│                                                                             │
│  Generation Request includes:                                              │
│  • workflowContext: {industry, segment, collateral, step1Mode}             │
│  • templateContext: {frameworks, visualFeatures, step2Mode}                │
│  • agentContext: {architecture, languages, voiceConfigs}                   │
│  • outputConfig: {format, tier, settings}                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Visualization Recommendation Logic (FLEXIBLE, NOT RESTRICTIVE)

### Current Problem
The current system risks tying industry selection to specific visualization types, which limits user creativity.

### Correct Approach

```typescript
interface VisualizationRecommendation {
  // AI recommendations (suggestions only)
  recommended: VisualFeatureId[];
  recommendedSubOptions: Record<VisualFeatureId, string[]>;
  reasoning: string;
  
  // ALL options remain available
  available: VisualFeatureId[]; // Always includes ALL features
  
  // Framework-specific suggestions (non-binding)
  frameworkSuggestions: Record<FrameworkId, VisualFeatureId[]>;
}
```

### Framework → Visualization Mapping (Suggestions Only)

| Framework | Suggested Visualizations | Reasoning |
|-----------|-------------------------|-----------|
| SWOT | Quadrant Chart, Comparison Table | Natural 4-quadrant layout |
| Porter's Five Forces | Radar Chart, Pentagon Diagram | 5-factor visualization |
| Growth-Share Matrix | Bubble Chart, Quadrant | 2x2 matrix format |
| Value Chain | Flowchart, Process Flow | Sequential activities |
| Customer Journey | Timeline, Service Blueprint | Journey progression |
| NPS/Loyalty | Gauge Chart, Bar Chart | Score visualization |
| OKR/Balanced Scorecard | Dashboard, KPI Cards | Metrics display |

**IMPORTANT**: These are SUGGESTIONS. User can always select ANY visualization regardless of framework.

### Industry → Default Suggestions (Suggestions Only)

| Industry | Suggested Defaults | Reasoning |
|----------|-------------------|-----------|
| Finance | Waterfall, Candlestick, Tables | Financial data conventions |
| Healthcare | Timeline, Process Flow, Statistics | Clinical workflows |
| Consulting | Quadrant, MECE Diagrams, Frameworks | Strategy methodology |
| Technology | Architecture Diagrams, Flowcharts | Technical documentation |
| Marketing | Funnel, Journey Maps, Visual-heavy | Customer focus |
| Training | Step Icons, Checklists, Interactive | Learning focus |

**IMPORTANT**: These are DEFAULT SUGGESTIONS. All visualization types remain available.

---

## 3. Mode Behavior: AI Auto vs Custom

### AI Auto Mode

```typescript
// When step1Mode === 'ai' or step2Mode === 'ai'
const aiAutoLogic = {
  // Step 1: Model selection
  models: getRecommendedProviders(industry, segment, collateralType, languages),
  
  // Step 2: Template & Visual recommendations
  templates: templateRecommendationService.getRecommendations({
    industry,
    segment,
    contentTypes,
    userPrompt,
    audienceLevel
  }),
  
  // Visual features: AI suggests, but ALL remain selectable
  visualFeatures: {
    recommended: getRecommendedVisualFeatures(context),
    available: EXPANDED_VISUAL_FEATURES // ALWAYS ALL
  },
  
  // Frameworks: AI suggests based on content type
  frameworks: {
    recommended: getRecommendedFrameworks(contentTypes, industry),
    available: EXPANDED_FRAMEWORK_CATEGORIES // ALWAYS ALL
  }
};
```

### Custom Mode

```typescript
// When step1Mode === 'custom' or step2Mode === 'custom'
const customModeLogic = {
  // All options visible without AI filtering
  models: ALL_MODELS_BY_TIER[globalTier],
  templates: ALL_TEMPLATES,
  visualFeatures: EXPANDED_VISUAL_FEATURES,
  frameworks: EXPANDED_FRAMEWORK_CATEGORIES,
  
  // No recommendations shown (or shown as subtle hints)
  showRecommendations: false
};
```

### Combined Logic (Hybrid)

```typescript
// AI provides suggestions, user has full control
const hybridLogic = {
  // Show AI recommendations with "AI Suggested" badge
  aiRecommendations: {
    models: getRecommendedProviders(...),
    visualFeatures: getRecommendedVisualFeatures(...),
    frameworks: getRecommendedFrameworks(...)
  },
  
  // But ALL options are available
  availableOptions: {
    models: filterByTier(ALL_MODELS, globalTier),
    visualFeatures: filterByTier(EXPANDED_VISUAL_FEATURES, globalTier),
    frameworks: EXPANDED_FRAMEWORK_CATEGORIES
  },
  
  // User selection can override AI
  userOverrides: userState.selections
};
```

---

## 4. Global Tier Filter Integration

```typescript
// Applied at wizard level
const globalTier: 1 | 2 | 3 = wizardState.globalTier;

// Filtering function
function filterByTier<T extends { tier: number }>(items: T[], maxTier: number): T[] {
  return items.filter(item => item.tier <= maxTier);
}

// Applied to:
const filteredModels = {
  text: filterByTier(ALL_TEXT_MODELS, globalTier),
  image: filterByTier(ALL_IMAGE_MODELS, globalTier),
  video: filterByTier(ALL_VIDEO_MODELS, globalTier),
  voice: filterByTier(ALL_VOICE_MODELS, globalTier),
  translation: filterByTier(ALL_TRANSLATION_MODELS, globalTier)
};

const filteredOutputTypes = filterByTier(EXPANDED_OUTPUT_CONFIGS, globalTier);
const filteredVisualFeatures = getVisualFeaturesByTier(globalTier);
const filteredFrameworks = filterFrameworksByTier(EXPANDED_FRAMEWORK_CATEGORIES, globalTier);
```

---

## 5. Generation Pipeline Data Aggregation (Including Audio)

```typescript
// In PresentationWizard.handleGenerate()
const generationRequest: PresentationRequest = {
  // Input context
  inputSource,
  inputContent,
  
  // Workflow context (Step 1)
  workflowContext: {
    industry: selectedIndustry,
    segment: selectedSegment,
    collateralType,
    step1Mode, // 'ai' | 'custom'
    globalTier
  },
  
  // Template context (Step 2)
  templateContext: {
    selectedFrameworkCategories,
    selectedFrameworkIds, // Individual frameworks
    visualFeatureSelections, // { featureId, subOptions[] }[]
    step2Mode, // 'ai' | 'custom'
    designTemplateId
  },
  
  // Output config (Step 3)
  outputConfig: {
    outputType, // '2d-static', 'video-full', '3d-animated', etc.
    format: outputFormat,
    settings: outputSettings
  },
  
  // Audio config (integrated with Step 3 & 4)
  audioConfig: {
    enabled: voiceEnabled,
    voiceProvider: selectedVoiceProvider, // elevenlabs, openai, azure, google
    voiceId: selectedVoiceId,
    voiceSettings: {
      speed: voiceSpeed,
      pitch: voicePitch,
      stability: voiceStability,
      clarity: voiceClarity
    },
    backgroundMusic: {
      enabled: musicEnabled,
      genre: selectedMusicGenre,
      mood: selectedMusicMood,
      volume: musicVolume
    },
    sfx: {
      enabled: sfxEnabled,
      transitionSounds: true,
      ambientSounds: is3DOrImmersive
    },
    pauseBetweenSlides: pauseDuration,
    languageCode: primaryLanguage
  },
  
  // Agent context (Step 4)
  agentContext: {
    architecture: selectedArchitecture,
    languages: selectedLanguages,
    primaryLanguage,
    voiceConfigs: perLanguageVoiceConfigs
  },
  
  // Model selections
  aiModels: {
    textModel: selectedTextModel,
    imageModel: selectedImageModel,
    videoModel: selectedVideoModel,
    voiceModel: selectedVoiceModel,
    translationModel: selectedTranslationModel
  }
};
```

---

## 5.1 Audio Generation Flow

Audio is generated as part of the output-aware generation pipeline:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AUDIO GENERATION PIPELINE                              │
│                                                                             │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐              │
│  │ Slide Text  │ ──► │ Script Gen   │ ──► │ TTS Generation  │              │
│  │ + Notes     │     │ (Narration)  │     │ (Voice Provider)│              │
│  └─────────────┘     └──────────────┘     └─────────────────┘              │
│                                                    │                        │
│                                                    ▼                        │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐              │
│  │ Output Type │ ──► │ Background   │ ──► │ SFX Generation  │              │
│  │ Detection   │     │ Music Gen    │     │ (Transitions)   │              │
│  └─────────────┘     └──────────────┘     └─────────────────┘              │
│                                                    │                        │
│                                                    ▼                        │
│                           ┌──────────────────────────────┐                  │
│                           │ Audio Mixing & Sync to Slides │                  │
│                           └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output Types and Audio Requirements

| Output Type | Voiceover | Background Music | SFX | Notes |
|-------------|-----------|------------------|-----|-------|
| pdf-export | ❌ | ❌ | ❌ | No audio support |
| pptx-export | ⚙️ Optional | ❌ | ❌ | Embedded audio optional |
| 2d-static | ❌ | ❌ | ❌ | No audio support |
| 2d-animated | ⚙️ Optional | ⚙️ Optional | ⚙️ Optional | Animation triggers |
| video-short | ✅ Required | ⚙️ Optional | ⚙️ Optional | Short-form narration |
| video-full | ✅ Required | ✅ Recommended | ✅ Recommended | Full production |
| 3d-static | ⚙️ Optional | ❌ | ❌ | Minimal audio |
| 3d-animated | ✅ Required | ✅ Recommended | ✅ Required | Spatial audio |
| interactive | ⚙️ Optional | ⚙️ Optional | ✅ Recommended | Feedback sounds |
| vr-experience | ✅ Required | ✅ Required | ✅ Required | Immersive audio |
| ar-overlay | ⚙️ Optional | ❌ | ⚙️ Optional | Context-aware |
| mixed-reality | ✅ Required | ✅ Required | ✅ Required | Full audio suite |

---

## 6. Visual Feature Sub-Options in Generation

Visual feature sub-options are injected into the AI prompt:

```typescript
// Example: User selected 'charts' with sub-options ['bar-chart', 'waterfall']
// And 'journey-maps' with sub-options ['customer-journey', 'roadmap']

const visualElementsPrompt = `
[Visual Elements Required]
- Charts: Bar Chart, Waterfall Chart
- Journey Maps: Customer Journey, Product Roadmap
- Infographics: Comparison Charts, Process Flow

Generate slides that incorporate these specific visualization types where appropriate.
`;

// This gets appended to the main generation prompt
```

---

## 7. Implementation Checklist

- [ ] Add `globalTier` state to PresentationWizard
- [ ] Create `filterByTier()` utility in wizard
- [ ] Update model selectors to respect tier filter
- [ ] Update visual feature dropdown to respect tier filter
- [ ] Update output type selector to respect tier filter
- [ ] Create VisualizationRecommendationService (suggestions only)
- [ ] Ensure AI Auto mode shows badges on recommended items
- [ ] Ensure Custom mode shows all options without AI filtering
- [ ] Add tier selector UI visible in Steps 1, 2, 3, 4
- [ ] Update generation request to include all context
- [ ] Inject visual sub-options into AI prompt

---

## 8. Key Principles

1. **Industry is Context, Not Restriction**: Industry selection provides context for AI recommendations but never limits available options.

2. **Frameworks Suggest, Not Mandate**: Framework selection suggests compatible visualizations but user can choose any.

3. **Tier Filters Everything**: The global tier filter is the ONLY restriction mechanism, applied uniformly.

4. **AI Auto = Suggestions**: AI Auto mode provides recommendations with badges, not restrictions.

5. **Custom = Full Access**: Custom mode shows everything within the selected tier.

6. **Sub-Options Matter**: Visual feature sub-options (specific chart types, journey map variants) are captured and used in generation.

7. **Mode Independence**: Step 1 and Step 2 can independently be in AI Auto or Custom mode.

---

*Last Updated: 2025-01-21*
*Status: Architecture Document - Ready for Implementation*
