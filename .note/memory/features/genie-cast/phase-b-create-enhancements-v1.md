# Memory: features/genie-cast/phase-b-create-enhancements-v1
Updated: just now

Phase B of the CREATE experience adds three features:

1. **SmartTemplateRecommender** (`src/components/genie-admin/genie-cast/SmartTemplateRecommender.tsx`) — Context-driven template scoring using product type (10 options), audience segment (8 options), platform target (8 options), and free-text goal keywords. Scoring algorithm: Product match (0-35pts), Audience fit (0-25pts), Platform match (0-20pts with duration heuristics for TikTok/YouTube), Goal keywords (0-15pts), Popularity bonus (0-5pts). Returns top 6 ranked results with match percentage, reasons, and 'Compare Top 3' shortcut. Sits above the BlueprintTemplatesGrid.

2. **TemplateComparisonView** (`src/components/genie-admin/genie-cast/TemplateComparisonView.tsx`) — Side-by-side modal comparing 2-3 blueprints across 14 dimensions: Category, Duration, Type, Usage Count, Style Intent, Tone, Target Platforms, Industry Tags, Target Regions, Aesthetic Keywords, and a capability matrix (Avatar, 3D, Animation, AR/VR, Lipsync). Checkbox-based selection on template cards (max 3) with a floating comparison bar. Each compared template has a 'Use' action button.

3. **AISceneCustomizer** (`src/components/genie-admin/genie-cast/blueprint-preview/AISceneCustomizer.tsx`) — Natural language prompt parser that interprets user intents (add, remove, duplicate, reorder) and modifies the scene sequence locally. Supports 8 scene templates (testimonial, demo, cta, intro, feature, comparison, pricing, outro) with positional awareness ('after the demo', 'before the CTA'). Includes undo support, change log, and quick suggestion buttons. Integrated into the SceneTimelineTab of BlueprintPreviewModal.
