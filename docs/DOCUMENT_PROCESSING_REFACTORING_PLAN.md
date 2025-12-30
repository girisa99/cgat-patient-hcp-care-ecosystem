# Document Processing Refactoring Plan

## Overview

This document outlines the safe refactoring strategy for `src/pages/DocumentProcessing.tsx` (4,159 lines) into smaller, maintainable components while preserving 100% of existing functionality.

## Verification Status ✅

### Backend Verified
- **Edge Functions**: `document-processor` deployed with `verify_jwt=false`
- **Secrets Configured**: 
  - `GEMINI_API_KEY` ✅
  - `CLAUDE_API_KEY` ✅
  - `OPENAI_API_KEY` ✅
  - `GOOGLE_API_KEY` ✅ (for Vision OCR)
- **Stage 2 Model Routing**: Active with fallback chains

### Model Routing Configuration
| Document Type | Primary | Fallback Chain | Pipeline |
|---------------|---------|----------------|----------|
| prescription | Claude | Gemini → OpenAI | single |
| insurance | Claude | Gemini → OpenAI | single |
| patient-onboarding | Gemini | Claude → OpenAI | single |
| xray/ct-scan/mri | Gemini | Claude | sequential-hybrid |
| invoice | OpenAI | Claude → Gemini | single |

---

## Complete Functionality Inventory

### 1. State Management (Lines 260-780)
| State Group | Variables | New Location |
|-------------|-----------|--------------|
| Document Type | selectedDocType, customDocTypes, currentConfig | useDocumentProcessingState.ts |
| Tab Navigation | activeTab, dynamicTabs | useDocumentProcessingState.ts |
| Processing Result | processingResult, pendingResult, processingHistory | useDocumentProcessingState.ts |
| Medication States | drugSearchQuery, sigInstructions, searchResults, selectedNdc, parsedSig | useMedicationSearch.ts |
| Medication Dropdowns | selectedDose, selectedRoute, selectedFrequency, selectedDuration | useMedicationSearch.ts |
| Medical Imaging | medicalImageBase64, medicalImageMimeType | useDocumentProcessingState.ts |
| Processing Settings | enableOCR, enableHandwriting, enableTableExtraction, etc. | useDocumentProcessingState.ts |
| Agent Mode | processingMode, selectedAgentWorkflow, isAgentProcessing | useDocumentProcessingState.ts |
| Dialog States | showSettingsDialog, showVerificationDialog, showSubAgentDialog | useDocumentProcessingState.ts |

### 2. Core Functions (Lines 780-2000)
| Function | Purpose | New Location |
|----------|---------|--------------|
| loadHistory | Load from document_processing_jobs | useDocumentExtraction.ts |
| onDrop | Handle file upload | useDocumentExtraction.ts |
| runAutoProcessing | Full OCR + extraction pipeline | useDocumentExtraction.ts |
| handleDrugSearch | NDC/RxNorm lookup | useMedicationSearch.ts |
| parseSigToSelectors | Parse SIG to dropdowns | useMedicationSearch.ts |
| normalizeDrugName | Normalize drug name for API | useMedicationSearch.ts |
| expandAbbreviation | Healthcare abbreviation expansion | utils/healthcareAbbreviations.ts |

### 3. Tab Components (Lines 2272-3722)
| Tab ID | Lines | Current Content | New Component |
|--------|-------|-----------------|---------------|
| upload | 2272-2702 | Dropzone, extraction display, save button | UploadTab.tsx |
| medication | 2705-3172 | Drug search, NDC codes, SIG parsing, alternatives | MedicationTab.tsx |
| insurance-details | 3175-3360 | Insurance fields, tables, save flow | InsuranceTab.tsx |
| patient-info | 3363-3495 | Patient demographics, consent sections | PatientInfoTab.tsx |
| treatment-center | 3496-3527 | Treatment center details | TreatmentCenterTab.tsx |
| customer-info | 3529-3562 | Customer information | CustomerInfoTab.tsx |
| image-analysis | 3565-3640 | MedicalImageAnalysis wrapper | (inline - uses existing component) |
| rcm-analysis | 3643-3677 | InvoiceRCMAnalysis wrapper | (inline - uses existing component) |
| history | 3680-3722 | ProcessingHistoryWithExport | HistoryTab.tsx |

### 4. Dialogs (Lines 3725-4155)
| Dialog | Lines | New Component |
|--------|-------|---------------|
| Settings | 3725-3869 | SettingsDialog.tsx |
| Clinical Recommendation | 3872-3896 | ClinicalRecommendationDialog.tsx |
| Verification | 3898-4118 | VerificationDialog.tsx |
| Custom Document Type | 4120-4128 | (existing CustomDocumentTypeDialog) |
| Sub-Agent Recommendation | 4131-4155 | (existing SubAgentRecommendationDialog) |

---

## File Structure After Refactoring

```
src/
├── pages/
│   └── DocumentProcessing.tsx (~150 lines - orchestrator only)
│
├── components/document-processing/
│   ├── index.ts (exports)
│   │
│   ├── tabs/
│   │   ├── UploadTab.tsx (~400 lines)
│   │   ├── MedicationTab.tsx (~500 lines)
│   │   ├── InsuranceTab.tsx (~200 lines)
│   │   ├── PatientInfoTab.tsx (~150 lines)
│   │   └── HistoryTab.tsx (~50 lines)
│   │
│   ├── dialogs/
│   │   ├── SettingsDialog.tsx (~150 lines)
│   │   ├── VerificationDialog.tsx (~200 lines)
│   │   └── ClinicalRecommendationDialog.tsx (~50 lines)
│   │
│   ├── DocumentProcessingHeader.tsx (~150 lines)
│   └── AgentWorkflowSelector.tsx (~100 lines)
│
├── hooks/
│   ├── useDocumentProcessingState.ts (~300 lines)
│   ├── useDocumentExtraction.ts (~350 lines)
│   └── useMedicationSearch.ts (~200 lines)
│
└── utils/
    └── healthcareAbbreviations.ts (~80 lines)
```

---

## Refactoring Phases

### Phase 1: Extract Hooks (LOWEST RISK)
1. Create `useDocumentProcessingState.ts` with all 50+ state variables
2. Create `useDocumentExtraction.ts` with processing logic
3. Create `useMedicationSearch.ts` with drug search logic
4. Update main file to use hooks

### Phase 2: Extract Utilities
1. Create `healthcareAbbreviations.ts` for HEALTHCARE_ABBREVIATIONS
2. Move helper functions

### Phase 3: Extract Tab Components
1. Create tab components one at a time
2. Test each extraction individually
3. Preserve all props and callbacks

### Phase 4: Extract Dialogs
1. Create dialog components
2. Preserve all handlers

### Phase 5: Final Cleanup
1. Reduce main file to orchestrator
2. Update imports/exports
3. Final testing

---

## Preservation Guarantees

| Aspect | Guarantee |
|--------|-----------|
| UI/UX | 100% identical appearance and behavior |
| Functionality | All 12 document types fully working |
| Backend Integration | All edge function calls preserved |
| State Persistence | SessionStorage restoration unchanged |
| Model Routing | Stage 2 routing with fallbacks intact |
| Navigation | Tab switching and deep links work |
| Dialogs | All 5 dialogs fully functional |

---

## Rollback Strategy

1. **Additive Changes Only**: New files added first, old code kept until verified
2. **Git History**: Each phase committed separately
3. **Feature Flags**: Can revert to monolithic file instantly
4. **Pre/Post Verification**: Test each extraction before proceeding

---

## Dependencies

No new packages required. Uses existing:
- react-dropzone
- @supabase/supabase-js
- sonner (toast)
- lucide-react
- All existing UI components

---

## Estimated Reduction

| Before | After |
|--------|-------|
| 1 file @ 4,159 lines | 15 files @ ~2,700 total lines |
| Difficult to maintain | Easy to locate and modify |
| All logic in one place | Separation of concerns |

---

*Last Updated: 2024-12-30*
*Status: READY TO IMPLEMENT*
