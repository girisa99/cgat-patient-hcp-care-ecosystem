# Memory: features/genie-cast/messaging-integration-v1
Updated: just now

## Messaging & Positioning Integration for Genie Cast

### Issue Resolved
The video script generation was NOT using approved messaging from `aiMessagingGeneratorService`. Custom hooks, CTAs, and positioning statements were being ignored.

### Root Cause
The `getChapterScript()` function in `genie-cast-assembler` only returned hardcoded transcreated scripts. The `customScript`, `customHook`, `customCta`, and `useApprovedMessaging` parameters were received but never used.

### Solution Implemented

**Priority-Based Script Generation**:
1. **Chapter-specific messaging** (from Matrix view) - Highest priority
2. **Approved messaging** (from aiMessagingGeneratorService) - Full messaging object
3. **Custom script/hook/cta** (from Quick Generate)
4. **Rich transcreated base scripts** (landing page quality) - Fallback

### Key Changes

**genie-cast-assembler/index.ts**:
- Added `MessagingContextType` interface
- `getChapterScript()` now accepts `messagingContext` parameter
- New helper functions:
  - `buildOpeningFromMessaging()` - Constructs opening from hook, headline, value prop
  - `buildClosingFromMessaging()` - Uses closing line, CTA, differentiators
  - `buildProductChapterFromMessaging()` - Uses medium/short scripts or builds from pain points/benefits

**genieCastOrchestrationService.ts**:
- Now passes full `approvedMessaging` object to edge function
- Includes: headline, hook, subHook, cta, ctaSecondary, valueProposition, painPoints, benefits, differentiators, openingLine, closingLine, transitionPhrases, shortScript, mediumScript, longScript

### Script Flow Example

When `useApprovedMessaging=true` and messaging exists:
```
Opening Chapter:
  → Hook: "Stop struggling with content creation..."
  → Opening Line: "What if AI could do it all?"
  → Value Proposition: "206 pipelines, 70+ languages"
  → Transition: "Let me show you how..."

Product Chapter (Spark):
  → Pain Point: "Ever struggled with writer's block?"
  → Solution: [mediumScript or shortScript]
  → Benefits: "Save 10x time. Professional results."
  → Transition: "But that's not all..."

Closing Chapter:
  → Differentiators: "Only platform with 200+ AI pipelines"
  → Closing Line: "Your wish is our command"
  → CTA: "Try Genie Studio Free"
  → CTA Secondary: "Watch Demo"
```

### Files Modified
- `supabase/functions/genie-cast-assembler/index.ts`
- `src/services/marketing/genieCastOrchestrationService.ts`

### Next Steps
- Enable messaging approval in admin dashboard
- Add per-chapter messaging editor in Matrix view
- Track messaging performance via analytics
