# 🎬 Genie Suite

> **Mind to Media** - AI-Powered Media Production Suite

## Overview

Genie Suite is a commercial-ready AI platform for content creation, video production, and media automation. This folder contains all Genie Suite-specific code, isolated from other products in the repository.

## Products

| Product | Description | Status |
|---------|-------------|--------|
| **Genie Mind** | Script writing & enhancement | ✅ Production |
| **Genie Vibe** | Recording studio with teleprompter | ✅ Production |
| **Genie Spark** | AI-assisted ideation | ✅ Production |
| **Genie Hub** | Your Creative Command Center | ✅ Production |
| **Genie Deck** | Presentation generation | ✅ Production |
| **Genie Cast** | Distribution & publishing | ✅ Production |

## Folder Structure

```
src/genie-studio/
├── index.ts              # Main export file
├── components/           # Genie-specific UI components
│   ├── studio/           # Main studio components
│   ├── vibe/             # Recording components
│   ├── content/          # Content tools
│   └── production/       # Production hub
├── hooks/                # Genie-specific hooks
├── services/             # Genie-specific services
├── types/                # TypeScript type definitions
├── constants/            # Constants and configuration
└── pages/                # Page components (migrated)
```

## Key Files

- `index.ts` - Main entry point with all exports
- `../shared/config/product-config.ts` - Product boundaries

## Development Guidelines

### ✅ DO
- Keep all Genie code in this folder or `src/components/genie-*`
- Use shared hooks from `src/shared/`
- Follow the feature flag system for gradual rollouts
- Test features in isolation before integration

### ❌ DON'T
- Import from `src/healthcare/`
- Add healthcare-specific logic
- Modify shared infrastructure without review
- Skip the pre-commit validation

## Edge Functions

Genie-specific edge functions are in `supabase/functions/genie/`:

| Function | Purpose |
|----------|---------|
| `ai-video-generator` | Video generation |
| `social-publish` | Multi-platform publishing |
| `voice-clone-processor` | Voice cloning |
| `auto-thumbnail-generator` | AI thumbnails |

## Database Tables

| Table | Purpose |
|-------|---------|
| `genie_projects` | Project metadata |
| `genie_scripts` | Script content |
| `genie_recordings` | Recording metadata |
| `bulk_jobs` | Batch processing |
| `social_publish_analytics` | Publishing metrics |

## Commercial Launch Timeline

- **Beta Testing**: 15-20 days
- **Target Launch**: Q1 2026
- **Initial Segments**: Creators, Marketers, Educators

## Related Documentation

- [Product Config](../shared/config/product-config.ts)
- [Governance Data](../components/diagrams/genie-command-center/data/governance-data.ts)
- [Scenario Map](../../docs/GENIE_STUDIO_SCENARIO_MAP.md)
