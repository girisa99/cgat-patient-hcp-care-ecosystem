# Wizard Pipeline Flow - End-to-End Architecture

## Complete 8-Step Flow Diagram

```mermaid
graph TB
    subgraph "USER INPUT LAYER"
        U[User] --> S0[Step 0: Input]
    end
    
    subgraph "STEP 0: Universal Input Gateway (UIG)"
        S0 --> UIG{Input Type?}
        UIG --> |Text/Prompt| TEXT[textAdapter]
        UIG --> |Document| DOC[documentAdapter]
        UIG --> |Image| IMG[imageAdapter]
        UIG --> |Video| VID[videoAdapter]
        UIG --> |Audio| AUD[audioAdapter]
        UIG --> |URL| URL[urlAdapter]
        UIG --> |Screen| SCR[screenAdapter]
        
        TEXT --> SI[StandardizedInput]
        DOC --> SI
        IMG --> SI
        VID --> SI
        AUD --> SI
        URL --> SI
        SCR --> SI
        
        SI --> |Extracted Content| S1
        SI --> |AI Suggestions| HINTS[Compatibility Hints]
    end
    
    subgraph "STEP 1: Configure (Industry Context)"
        S1[Step 1: Configure] --> IND[Industry Selection]
        S1 --> SEG[Segment Selection]
        S1 --> CT[Content Type]
        
        IND --> |Healthcare| IND_H[Healthcare Providers]
        IND --> |Finance| IND_F[Finance Providers]
        IND --> |Tech| IND_T[Tech Providers]
        
        HINTS --> |Auto-suggest| IND
        
        IND_H --> WC[workflowContext]
        IND_F --> WC
        IND_T --> WC
        SEG --> WC
        CT --> WC
    end
    
    subgraph "STEP 2: Template & Branding"
        S2[Step 2: Template] --> TPL[Template Selection]
        S2 --> THM[Theme Selection]
        S2 --> BRD[Brand Config]
        S2 --> VF[Visual Features]
        
        WC --> |Filter by Industry| TPL
        
        TPL --> TC[templateContext]
        THM --> TC
        BRD --> TC
        VF --> |100+ Sub-options| TC
    end
    
    subgraph "STEP 3: Output Type"
        S3[Step 3: Output] --> OT{Output Type}
        OT --> |2D| OT_2D[Presentation/PDF/Doc]
        OT --> |Video| OT_V[MP4/WebM/4K]
        OT --> |3D/VR| OT_3D[GLTF/WebXR]
        OT --> |Interactive| OT_I[HTML5/SCORM]
        
        OT_2D --> OC[outputConfig]
        OT_V --> OC
        OT_3D --> OC
        OT_I --> OC
    end
    
    subgraph "STEP 4: Agents & Languages"
        S4[Step 4: Agents] --> AG[Agent Selection]
        S4 --> LG[Language Config]
        S4 --> MO[Model Overrides]
        
        AG --> AC[agentContext]
        LG --> AC
        MO --> AC
    end
    
    subgraph "STEP 5: Voice & Music"
        S5[Step 5: Voice] --> VC[Voice Config]
        S5 --> MC[Music Config]
        
        VC --> |Provider + Voice| VCF[voiceConfig]
        MC --> |Track + Volume| VCF
    end
    
    subgraph "STEP 6: Generate (Orchestration)"
        S6[Step 6: Generate] --> HG[handleGenerate]
        
        HG --> |Aggregate All| PR[PresentationRequest]
        
        WC --> PR
        TC --> PR
        OC --> PR
        AC --> PR
        VCF --> PR
        
        PR --> |With globalTier| A2A[ai-a2a-coordinator]
    end
    
    subgraph "A2A COORDINATOR"
        A2A --> VAL[Validate Context]
        VAL --> |Check Tier| TIER{Tier Valid?}
        
        TIER --> |No| UPGRADE[Request Upgrade]
        TIER --> |Yes| ROUTE[Route to Pipelines]
        
        ROUTE --> |Filter 107+ Pipelines| PIP[useDynamicPipeline]
        PIP --> |Select Best Match| EXEC[Execute Pipeline]
    end
    
    subgraph "PIPELINE EXECUTION"
        EXEC --> |Parallel Tasks| T1[Content Agent]
        EXEC --> T2[Design Agent]
        EXEC --> T3[Image Agent]
        EXEC --> T4[Voice Agent]
        
        T1 --> |Slides| RES[Generated Result]
        T2 --> RES
        T3 --> RES
        T4 --> RES
    end
    
    subgraph "STEP 7: Embedded Editor"
        RES --> S7[Step 7: Editor]
        S7 --> EEP[EmbeddedEditorPanel]
        
        EEP --> |Transform| UE[UniversalElement[]]
        UE --> EDIT[Real-time Editing]
        
        EDIT --> |Re-pipeline| PIP
    end
    
    subgraph "STEP 8: Publish"
        S7 --> S8[Step 8: Publish]
        S8 --> EXP[Export Formats]
        S8 --> CLD[Cloud Publishing]
        S8 --> SOC[Social Platforms]
    end
```

---

## Data Flow Examples

### Example 1: Healthcare Pitch Deck

```
Step 0 (Input):
├── User uploads: "PatientEngagement.pdf"
├── UIG detects: type = "document"
├── documentAdapter processes → extracts text, tables, images
└── StandardizedInput = {
      type: "document",
      content: { text: "...", tables: [...] },
      suggestions: {
        recommendedIndustry: "healthcare",
        recommendedFramework: "patient-journey",
        compatibleOutputs: ["presentation", "video", "pdf"]
      }
    }

Step 1 (Configure):
├── Industry auto-suggested: "Healthcare"
├── Segment selected: "Patient Engagement"
├── Content Type: "Pitch Deck"
└── workflowContext = {
      industryCategory: "healthcare",
      segment: "patient-engagement",
      selectedContentTypes: ["pitch-deck"],
      aiModels: { text: "gemini-2.5-pro", image: "flux-pro" }
    }

Step 2 (Template):
├── Filtered templates (healthcare only)
├── Selected: "Medical Blue Theme"
├── Visual features: ["infographics", "journey-maps", "icons"]
└── templateContext = {
      selectedTemplateId: "medical-blue",
      visualFeatures: [
        { featureId: "infographics", subOptions: ["patient-flow", "statistics"] },
        { featureId: "journey-maps", subOptions: ["5-stage"] }
      ]
    }

Step 3 (Output):
├── Primary: "presentation"
├── Secondary: "video", "pdf"
├── Resolution: "1080p"
└── outputConfig = {
      outputType: "presentation",
      outputTypes: ["presentation", "video", "pdf"],
      slideCount: 12,
      resolution: "1080p"
    }

Step 4 (Agents):
├── Agents: ["content-strategist", "design-director", "medical-specialist"]
├── Languages: ["en", "es"]
└── agentContext = {
      selectedAgentIds: ["content-strategist", "design-director", "medical-specialist"],
      languageVoiceConfigs: [
        { languageCode: "en", voiceProvider: "elevenlabs" },
        { languageCode: "es", voiceProvider: "azure-neural" }
      ]
    }

Step 5 (Voice):
├── Enabled: true
├── Provider: "elevenlabs"
├── Voice: "professional-male"
└── voiceConfig = {
      enabled: true,
      provider: "elevenlabs",
      voiceId: "professional-male",
      backgroundMusic: true,
      musicTrack: "corporate-ambient"
    }

Step 6 (Generate):
├── handleGenerate() aggregates all contexts
├── PresentationRequest = { ...all contexts }
├── ai-a2a-coordinator validates tier (beta = enterprise)
├── Selects pipeline: "document-to-presentation-with-video"
└── Executes parallel agents → returns slides[]

Step 7 (Editor):
├── Slides transformed to UniversalElement[]
├── User edits title on slide 3
├── Re-runs "design-director" agent for that slide only
└── Updated slides[]

Step 8 (Publish):
├── Export: PPTX, MP4, PDF
├── Cloud: Shareable link generated
└── Platforms: LinkedIn scheduled post
```

---

### Example 2: Quick Social Video

```
Step 0 (Input):
├── User types: "3 benefits of AI in customer service"
├── UIG detects: type = "text"
└── StandardizedInput = {
      type: "text",
      content: { text: "3 benefits of AI in customer service" },
      suggestions: {
        recommendedIndustry: "technology",
        recommendedOutputs: ["social-video", "presentation"]
      }
    }

Step 1 (Configure):
├── Industry: "Technology"
├── Content Type: "Social Media Post"
└── workflowContext = {
      industryCategory: "technology",
      segment: "saas",
      selectedContentTypes: ["social-video"]
    }

Step 3 (Output):
├── Output Type: "social-video"
├── Resolution: "1080p"
├── Aspect: "9:16" (vertical)
└── outputConfig = {
      outputType: "social-video",
      resolution: "1080p",
      aspectRatio: "9:16"
    }

Step 6 (Generate):
├── Pipeline selected: "text-to-social-video"
├── Agents: ["script-writer", "video-editor", "motion-graphics"]
└── Result: 30-second vertical video with animations

Step 8 (Publish):
├── Platforms: TikTok, Instagram Reels, YouTube Shorts
└── Scheduled: Tomorrow 9:00 AM
```

---

## Pipeline Selection Logic

```typescript
// useDynamicPipeline.ts - How pipelines are selected

const PIPELINE_SELECTION_FLOW = {
  1. "Gather Context": {
    inputSource: "document" | "text" | "url" | "image" | ...,
    outputType: "presentation" | "video" | "pdf" | ...,
    userTier: "starter" | "pro" | "enterprise" // from globalTier
  },
  
  2. "Filter by Tier": {
    // TIER_MAP converts globalTier to pricing tier
    // beta → enterprise (dev mode)
    // standard → starter
    // advanced → pro
    // premium → enterprise
  },
  
  3. "Match Pipelines": {
    // Filter PIPELINE_CAPABILITY_MATRIX by:
    // - inputSource matches pipeline.supportedInputs
    // - outputType matches pipeline.supportedOutputs
    // - userTier >= pipeline.minimumTier
  },
  
  4. "Rank by Score": {
    // Score = quality + speed + costEfficiency
    // Adjusted by industry match bonus
  },
  
  5. "Return Top Pipeline": {
    pipelineId: "document-to-presentation-enhanced",
    providers: ["gemini-2.5-pro", "flux-pro"],
    agents: ["content-strategist", "design-director"]
  }
};
```

---

## State Connection Map

| Step | UI Component | State Variable | Flows To |
|------|-------------|----------------|----------|
| 0 | UnifiedInputStep | `inputSource`, `inputContent` | workflowContext.content |
| 1 | ConfigurationPanel | `workflowConfig` | workflowContext |
| 2 | TemplateBrandingPanel | `selectedTemplate`, `visualFeatureSelections` | templateContext |
| 3 | OutputTypePanel | `outputSettings` | outputConfig |
| 4 | AgentLanguageConfigPanel | `selectedAgents`, `languageModelConfigs` | agentContext |
| 5 | VoiceMusicStep | `voiceConfig` | voiceConfig |
| 6 | GenerationProgressPanel | `generationPhase`, `slides` | PresentationRequest |
| 7 | EmbeddedEditorPanel | `slides` as `UniversalElement[]` | Re-pipeline option |
| 8 | PublishingPanel | `exportFormats`, `platforms` | Distribution |

---

## Tier-Based Access Matrix

| Tier (globalTier) | Mapped Pricing | Pipelines Access | Features |
|-------------------|----------------|------------------|----------|
| free | starter | 20 basic pipelines | PDF export only |
| standard | starter | 35 pipelines | + PPTX, basic video |
| advanced | pro | 70 pipelines | + 4K video, avatars |
| premium | enterprise | All 107 pipelines | + VR, 3D, custom |
| **beta (dev)** | **enterprise** | **All 107 pipelines** | **Full access** |

---

## Key Files Reference

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Main Wizard | `src/components/genie-studio/presentation-generator/PresentationWizard.tsx` | 8-step orchestrator |
| Step Registry | `src/components/genie-studio/presentation-generator/registry/stepRegistry.ts` | Step definitions |
| Configure Panel | `src/components/genie-studio/presentation-generator/ConfigurationPanel.tsx` | Industry/Segment/Content |
| UIG Gateway | `src/services/universal-input-gateway/UniversalInputGateway.ts` | Input processing |
| Pipeline Hook | `src/hooks/useDynamicPipeline.ts` | Pipeline selection |
| A2A Service | `src/hooks/useA2ACoordinatorService.ts` | Orchestration |
| Regional Routing | `src/hooks/useRegionalLanguage.ts` | Tier + Provider routing |
| Embedded Editor | `src/components/genie-studio/presentation-generator/components/EmbeddedEditorPanel.tsx` | Post-gen editing |

---

## Summary: How User Selections Connect to Generation

1. **User enters input** → UIG normalizes to `StandardizedInput` with AI suggestions
2. **User configures context** → Builds `workflowContext` (industry, segment, content types)
3. **User selects template/visuals** → Builds `templateContext` (template, theme, features)
4. **User picks output format** → Builds `outputConfig` (type, resolution, slide count)
5. **User configures agents** → Builds `agentContext` (agents, languages, model overrides)
6. **User configures voice** → Builds `voiceConfig` (provider, voice, music)
7. **Generate clicked** → `handleGenerate()` aggregates all into `PresentationRequest`
8. **A2A Coordinator** → Validates tier, routes to best pipeline from 107 options
9. **Pipeline executes** → Parallel agents generate content
10. **Editor receives slides** → User can edit and re-trigger specific agents
11. **Publish** → Export and distribute to selected platforms
