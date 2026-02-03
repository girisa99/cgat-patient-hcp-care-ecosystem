# Memory: architecture/marketing/video-messaging-and-version-tracking-v1
Updated: just now

## Video Messaging & Version Tracking Architecture

### Overview
The Genie Cast video production system includes four critical services for maintaining up-to-date, compelling marketing content:

1. **Product Version Tracking Service** (`productVersionTrackingService.ts`)
2. **AI Messaging Generator Service** (`aiMessagingGeneratorService.ts`)
3. **Messaging Feedback Service** (`messagingFeedbackService.ts`) - NEW
4. **React Hooks** (`useProductChangeAlerts.ts`, `useAIMessaging.ts`, `useMessagingFeedback.ts`)

### Product Version Tracking

**Purpose**: Detect product changes and alert Genie Cast when screenshots/videos need regeneration.

**Detection Strategy**: Git-based + Version Comparison
- Tracks semantic versions (MAJOR.MINOR.PATCH)
- Classifies changes: `added`, `modified`, `removed`, `ui_update`
- Auto-generates alerts by severity: `critical`, `warning`, `info`

**Alert Types**:
- `screenshot_outdated` - Screenshots no longer match current UI
- `video_outdated` - Marketing video needs regeneration
- `messaging_outdated` - Hooks/CTAs need refresh
- `new_feature` - New feature added, needs dedicated video

### AI Messaging Generator

**Purpose**: Generate feature-specific hooks, CTAs, and positioning statements with admin approval workflow.

**Messaging Components Generated**:
- `headline`, `hook`, `subHook`
- `cta`, `ctaSecondary`
- `valueProposition`
- `painPoints[]`, `benefits[]`, `differentiators[]`
- `openingLine`, `closingLine`, `transitionPhrases[]`
- Scripts: `shortScript` (30s), `mediumScript` (60s), `longScript` (90s)
- SEO: `hashtags[]`, `keywords[]`, `metaDescription`

### Messaging Feedback & Improvement System (NEW)

**Purpose**: Bi-weekly analysis of user feedback, usage patterns, and confusion signals to suggest messaging improvements.

**Feedback Sources**:
- `user_survey` - Direct user feedback
- `support_ticket` - Help desk tickets
- `rlhf_thumbs` - 👍/👎 reactions
- `confusion_signal` - Behavioral signals
- `abandonment` - Drop-off analysis
- `competitor_mention` - Competitive intel

**Confusion Signal Types** (weighted):
- `repeated_help_request` (1.0) - User asks same question multiple times
- `quick_exit` (0.8) - User leaves quickly
- `back_navigation` (0.6) - User goes back frequently
- `long_dwell` (0.5) - User stares at screen
- `tooltip_hover` (0.3) - User hovers on help tooltips
- `video_rewatch` (0.4) - User rewatches tutorial

**Improvement Types Generated**:
- `hook` - Main value proposition hook
- `cta` - Call-to-action improvements
- `value_prop` - Value proposition clarity
- `clarification` - Feature explanation
- `differentiation` - Competitive positioning

**Bi-Weekly Cycle**:
1. Collect feedback for 14 days
2. Analyze sentiment, keywords, confusion signals
3. Generate improvement suggestions with confidence scores
4. Admin reviews and approves/rejects
5. Approved messaging applied to video generation

### UI Integration

The Genie Cast Video Studio now includes 7 tabs:

1. **Screenshots** - Multi-product screenshot capture
2. **Quick Generate** - Single language video generation
3. **Matrix** - Full production matrix (14 languages × 8 products × 4 tiers)
4. **Library** - Generated video library
5. **Alerts** - Product change alerts + Feature video generator
6. **Messaging** - Bi-weekly messaging improvement panel
7. **Analytics** - Video performance metrics

### Hooks

**useProductChangeAlerts**:
```typescript
const { alerts, criticalAlerts, markScreenshotsCaptured, registerChange } = useProductChangeAlerts({
  showNotifications: true,
  productIds: ['spark', 'deck'],
});
```

**useAIMessaging**:
```typescript
const { generateMessaging, pendingApprovals, approveMessaging } = useAIMessaging();
await generateMessaging('spark', {
  type: 'feature',
  featureId: 'idea_generation',
  targetAudience: ['content_creators'],
  competitors: ['canva'],
});
```

**useMessagingFeedback** (NEW):
```typescript
const { 
  pendingImprovements,
  runAnalysis,
  approveImprovement,
  recordFeedback,
  recordConfusion,
  cycleProgress,
  daysRemaining,
} = useMessagingFeedback({ showNotifications: true });

// Record feedback from any source
recordFeedback('spark', 'The interface is confusing', 'user_survey');

// Record confusion signal from user behavior
recordConfusion('spark', 'repeated_help_request', 'idea_generation');

// Run bi-weekly analysis
const analysis = await runAnalysis();
```

### Files

**Services**:
- `src/services/marketing/productVersionTrackingService.ts`
- `src/services/marketing/aiMessagingGeneratorService.ts`
- `src/services/marketing/messagingFeedbackService.ts`
- `src/services/marketing/index.ts` (barrel exports)

**Hooks**:
- `src/hooks/useProductChangeAlerts.ts`
- `src/hooks/useAIMessaging.ts`
- `src/hooks/useMessagingFeedback.ts`

**Components**:
- `src/components/genie-admin/UnifiedVideoGenerationPanel.tsx`
- `src/components/genie-admin/ProductChangeAlertPanel.tsx`
- `src/components/genie-admin/MessagingImprovementPanel.tsx`
- `src/components/genie-admin/FeatureVideoGenerator.tsx`
- `src/components/genie-admin/MultiScreenshotGallery.tsx`

### Priority: HIGH - Core Marketing Automation
