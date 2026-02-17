# Combination Teaser System Architecture

## Overview

The Combination Teaser System is a smart conversion tool that showcases premium combination features (3D, Avatars, Immersive, Animation) to users at strategic intervals during their generation workflow.

## Core Principles

1. **Value Discovery**: Show users what they COULD have without being pushy
2. **Smart Timing**: Display teasers at optimal moments based on user journey
3. **AI Learning**: Every interaction feeds back to Label Studio for personalization
4. **Flexible Monetization**: Works with base subscription + optional add-on credits

## Commercial Model

### Base Subscription Tiers
| Tier | Price | Included Combinations |
|------|-------|----------------------|
| Free | $0 | View teasers only |
| Starter | $12 | 0 (teasers shown) |
| Creator | $29 | 5 basic combinations/mo |
| Pro | $59 | 20 combinations/mo (animated, avatar, kinetic) |
| Business | $149 | 50 combinations/mo (all including 3D, immersive) |
| Enterprise | Custom | Unlimited |

### Add-On Credit System
Users can purchase additional combination credits beyond their tier limit:

| Combination Type | Credit Cost | Typical Use Case |
|-----------------|-------------|------------------|
| Animated Slides | 50 | Full deck transitions |
| Kinetic Typography | 40 | Per-slide emphasis |
| Data Visualization | 60 | Per-slide charts |
| Avatar Narrator | 100 | Full deck narration |
| Talking Photo | 80 | Per-slide presenter |
| 3D Elements | 150 | Per-slide product/model |
| Immersive Journey | 200 | Full deck experience |
| Full-Body Avatar | 300 | Premium full deck |

### Credit Multipliers
- **Complexity**: 1x (basic) to 4x (advanced)
- **Provider Tier**: 1x (standard) to 5x (premium)
- **Segment Discount**: Education/Nonprofit get 25% off

## Teaser Sequence Strategy

```
Generation 1: Show animated_slides or kinetic_typography
  ↓ (user engages or skips)
Generation 2-3: Wait (cooldown)
  ↓
Generation 4: Show avatar_narrator or talking_photo
  ↓ (user engages or skips)
Generation 5-6: Wait (cooldown)
  ↓
Generation 7: Show data_visualization or 3d_elements
  ↓
Generation 8+: Personalized based on engagement scores
```

## User Preference Scoring

Each user has a preference score (-100 to +100) per combination type:

| Action | Score Change |
|--------|-------------|
| Like (👍) | +20 |
| Interested | +30 |
| Skip (X) | -5 |
| Not Now | -10 |
| Dislike (👎) | -25 |

High-scoring combinations are shown more frequently.

## Teaser Display Modes

### 1. Floating Preview (Post-Generation)
- Appears bottom-right after generation completes
- 30-60 second watermarked preview
- Full feedback panel with Like/Dislike/Interested

### 2. Inline Slide Card (Within Editor)
- Subtle suggestion within specific slides
- "This slide could be better with X"
- Quick Try It / Not Now buttons

### 3. Gallery View (Manual Browse)
- Full catalog of available combinations
- Filtered by user tier accessibility
- "Recommended" badges based on content context

## Label Studio Integration

Every teaser interaction is recorded for AI learning:

```typescript
// Event recorded to Label Studio
{
  eventType: 'thumbnail_chosen',
  context: {
    product: 'spark',
    contentType: 'avatar_narrator',
    originalValue: 'teaser_avatar_narrator',
    selectedValue: 'like', // or 'dislike', 'interested', etc.
    userAction: 'accept' // or 'reject', 'ignore'
  },
  metadata: {
    teaserId: 'teaser_avatar_narrator',
    generationNumber: 4,
    industry: 'technology',
    slideNumber: 5
  }
}
```

This data trains the recommendation model to:
- Predict which users are likely to convert
- Personalize teaser timing per user
- Identify which combinations resonate with which industries

## Component Architecture

```
src/
├── services/
│   └── combinationTeaserService.ts    # Core logic + state
├── components/genie-studio/presentation-generator/
│   ├── CombinationTeaserPreview.tsx   # Floating preview
│   ├── InlineTeaserCard.tsx           # In-slide suggestion
│   ├── TeaserGallery.tsx              # Full catalog
│   └── hooks/
│       └── useTeaserIntegration.ts    # React hook
```

## Scope Options

Combinations can be applied at different scopes:

| Scope | Description | Example |
|-------|-------------|---------|
| `per_slide` | Applied to individual slides | 3D product on slide 5 |
| `full_deck` | Applied to entire presentation | Avatar narrates all slides |
| `infographic` | Applied to data-focused slides | Animated charts |
| `journey_flow` | Applied as narrative experience | Immersive storytelling |

## Rate Limiting

To avoid fatigue:
- **minGenerationsBetween**: 2 (show every 2-3 generations)
- **maxPerSession**: 3 (max 3 teasers per session)
- **cooldownAfterDismiss**: 5 (wait 5 generations after "not interested")

## Edge Function Routing

When user converts and requests a combination:

```
User Selects Combination
        ↓
ai-a2a-coordinator (orchestrator)
        ↓
┌───────────────────────────────────────┐
│ Based on combination type:            │
├───────────────────────────────────────┤
│ animated_slides → modelslab-media     │
│ avatar_narrator → ai-video-generator  │
│ 3d_elements → modelslab-media (3D)    │
│ immersive_journey → combined pipeline │
│ kinetic_typography → modelslab-media  │
│ data_visualization → chart-animator   │
│ talking_photo → replicate-media       │
│ full_body_avatar → alibaba-avatar     │
└───────────────────────────────────────┘
        ↓
Regional routing applied (5-zone)
        ↓
Output rendered with combination
```

## Success Metrics

Track these KPIs:
- **Teaser View Rate**: % of users who see teasers
- **Engagement Rate**: % who interact (like/dislike/interested)
- **Conversion Rate**: % who upgrade or purchase credits
- **Revenue per Teaser**: Average revenue generated per teaser shown
- **Preference Accuracy**: How well AI predicts user preferences

## Privacy & Consent

- All tracking is tied to session, not PII
- Users can disable teasers via settings
- Feedback is used only for product improvement
- GDPR compliant: data deleted on account deletion
