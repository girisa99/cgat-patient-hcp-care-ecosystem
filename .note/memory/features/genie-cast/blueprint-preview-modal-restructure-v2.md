# Memory: features/genie-cast/blueprint-preview-modal-restructure-v2
Updated: just now

The BlueprintPreviewModal has been refactored from a 535-line monolith into 4 focused sub-components in `src/components/genie-admin/genie-cast/blueprint-preview/`:

1. **OverviewTab** — Quick stats (Duration with min/max range, Total Scenes with optional count, Required Scenes with explanation, Target Platforms), Scene Flow with duration ranges, "Edit Scenes" button linking to Timeline tab, platform badges.

2. **SceneTimelineTab** — Interactive scene editing with duration sliders (min/max constrained), grip handles for reorder intent, expanded details (script template, scene key, repeatable flag), "Add Custom Scene" button, "Remove Optional Scene" for optional scenes.

3. **AIModelsTab** — Pulls all providers dynamically from `MASTER_ECOSYSTEM_REGISTRY` (30+ active providers). Organized by capability task (Video, Image, TTS, LLM, Avatar, 3D, Lipsync). Interactive zone filter buttons (Claude/Alibaba/Gemini/Fallback) with zone details panel showing primary LLM/TTS/Translation per zone. Prompt-based thumbnail regeneration with custom text input.

4. **ProductionConfigTab** (renamed from "Style & Settings") — Structured read-only summary: style_intent badge with description, tone modifier, aesthetic keywords as chips, capability matrix (Avatar/3D/Animation/AR-VR/Lipsync), output format (aspect ratios, duration, platforms), regional support, and "Customizable in Production Setup" checklist.

The modal accepts new props: `onRegenerateThumbnail?: (blueprintId, prompt) => void` and `isRegenerating?: boolean`.
