# Memory: features/genie-cast/scene-script-variable-injection-contract
Updated: just now

## AI-Smart Scene-Messaging Assignment (v2)

Scene-level scripts now use an **AI-smart assignment** strategy instead of manual variable injection. The system automatically determines which messaging elements best fit each scene type:

### Scene → Messaging Element Map
| Scene Type | Assigned Elements | Reasoning |
|---|---|---|
| intro/hook | hook, subHook, valueProposition, openingLine | Grabs attention and establishes value |
| hero_banner | headline, valueProposition, cta, differentiators | Positioning with headline and differentiators |
| positioning_statement | valueProposition, differentiators, headline | Competitive positioning |
| feature/demo | benefits, painPoints, shortScript | Benefits solving pain points |
| comparison | differentiators, painPoints, benefits | Competitive contrast |
| cta/outro/closing | cta, ctaSecondary, closingLine, differentiators | Drives action |
| stats_data | benefits, differentiators | Quantifiable impact |
| pricing | cta, benefits, valueProposition | Ties cost to value |

### How It Works
1. `getSmartMessagingAssignment(sceneType)` in `useSceneScriptGenerator.ts` maps scene type → messaging elements
2. `extractMessagingForScene()` pulls actual values from `approvedMessaging`
3. Both full messaging context AND focused `smartAssignment` are sent to the edge function
4. Edge function prioritizes assigned elements when generating the scene script
5. Partial matches supported: `custom_hero_banner_123` → matches `hero_banner`
6. Unknown scene types fall back to `hook + benefits + cta`

### UI Display
`SceneScriptAIPanel.tsx` shows a "Smart Assignment" badge per scene with:
- Assigned elements as pills
- Reasoning text explaining the AI's logic
- Variables filled after generation

Last Updated: 2026-02-14
