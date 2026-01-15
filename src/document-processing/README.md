# 📄 Document Processing

> **AI-Powered Document Intelligence** - Multi-Model OCR & Extraction Suite

## Overview

Document Processing is a comprehensive AI platform for document extraction, OCR, and intelligent data mapping. This folder contains all Document Processing-specific code, isolated from other products in the repository.

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Two-Stage Pipeline** | OCR + Vision AI extraction | ✅ Production |
| **Multi-Model Routing** | Dynamic provider selection | ✅ Production |
| **Medical Document Processing** | Prescription, insurance, labs | ✅ Production |
| **Invoice/RCM Analysis** | Revenue cycle management | ✅ Production |
| **Medical Imaging AI** | CNN-based image analysis | ✅ Production |
| **Fax Processing** | Legacy document digitization | ✅ Production |

## Folder Structure

```
src/document-processing/
├── index.ts              # Main export file
├── components/           # Document processing UI components
│   ├── dialogs/          # Modal dialogs
│   ├── tabs/             # Tab components
│   ├── studio/           # Smart document studio
│   └── diagrams/         # Architecture diagrams
├── hooks/                # Document processing hooks
├── services/             # Processing services
├── types/                # TypeScript type definitions
├── constants/            # Constants and configuration
└── config/               # Configuration files
```

## Key Components

### Core Hooks
- `useDocumentExtraction` - OCR + extraction pipeline
- `useDocumentProcessingState` - Central state management (50+ variables)
- `useMedicationSearch` - RxNorm/NDC lookups
- `useDocumentRouterOrchestrator` - Multi-model routing
- `useModelRouting` - AI model selection

### Configuration
- `documentTypes.ts` - Document type definitions
- `documentModelRouting.ts` - AI model routing rules

## Edge Functions

Document Processing edge functions in `supabase/functions/`:

| Function | Purpose | Phase |
|----------|---------|-------|
| `document-processor` | Core multi-model OCR/Extraction | P0 |
| `process-documents` | Legacy document extraction | P0 |
| `execute-document-agent` | Workflow integration | P1 |
| `pdf-voice-processor` | Voice-enabled PDF reading | P1 |
| `fax-processing` | Fax-specific OCR | P1 |
| `extract-enrollment-form` | Enrollment form extraction | P1 |
| `medical-imaging-cnn` | CNN-based medical imaging | P2 |

## Database Tables

| Table | Purpose |
|-------|---------|
| `document_processing_jobs` | Job tracking |
| `document_processing_queue` | Processing queue |
| `document_metadata` | Document metadata |
| `extracted_entities` | Extracted data entities |

## AI Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    TWO-STAGE AI PIPELINE                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    Stage 1: OCR Layer    ┌─────────────┐       │
│  │  Document   │ ──────────────────────►  │  Raw Text   │       │
│  │   Upload    │    Google Vision OCR     │  Extraction │       │
│  └─────────────┘    Tesseract Fallback    └─────────────┘       │
│                                                  │               │
│                                                  ▼               │
│  ┌─────────────┐   Stage 2: Vision AI    ┌─────────────┐       │
│  │  Structured │ ◄─────────────────────  │   Gemini    │       │
│  │    JSON     │   Field Extraction      │  Pro Vision │       │
│  └─────────────┘                         └─────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Development Guidelines

### ✅ DO
- Keep all Document Processing code in this folder
- Use shared hooks from `src/shared/`
- Follow the model routing configuration
- Add proper error handling and logging

### ❌ DON'T
- Import from `src/genie-studio/`
- Add media production logic
- Modify shared infrastructure without review

## Metrics (Current)

| Metric | Count |
|--------|-------|
| Edge Functions | 7 |
| Hooks | 8 |
| Components | 50+ |
| Database Tables | 4 |
| AI Models Supported | 5 |

## Related Documentation

- [Document Types Config](../config/documentTypes.ts)
- [Model Routing](../config/documentModelRouting.ts)
- [Refactoring Plan](../../docs/DOCUMENT_PROCESSING_REFACTORING_PLAN.md)
- [LinkedIn Article](../../docs/LINKEDIN_ARTICLE_DOCUMENT_PROCESSING.md)
