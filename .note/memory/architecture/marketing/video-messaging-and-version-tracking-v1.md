# Memory: architecture/marketing/video-messaging-and-version-tracking-v1
Updated: just now

## Video Messaging & Version Tracking Architecture

### Overview
The Genie Cast video production system includes two critical services for maintaining up-to-date, compelling marketing content:

1. **Product Version Tracking Service** (`productVersionTrackingService.ts`)
2. **AI Messaging Generator Service** (`aiMessagingGeneratorService.ts`)

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

**Integration Points**:
- `useProductChangeAlerts` hook for React components
- Subscription-based listener pattern for real-time notifications
- Auto-resolve on screenshot capture or video generation

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

**Approval Workflow**:
1. Admin triggers generation for product/feature
2. AI generates messaging using `ai-universal-processor`
3. Falls back to template-based generation if AI unavailable
4. Admin reviews and approves/rejects
5. Approved messaging registers with `featureDiscoveryService`

**Marketing Pipeline Integration**:
- `MESSAGING_TEMPLATES` from featureDiscoveryService
- `JOURNEY_TEMPLATES` & `FRAMEWORK_TEMPLATES` from aiGenerationIntegration
- `COMPETITOR_DATABASE` for battle cards
- `TARGET_AUDIENCES` for pain point mapping

### Hooks

**useProductChangeAlerts**:
```typescript
const { alerts, criticalAlerts, markScreenshotsCaptured, registerChange } = useProductChangeAlerts({
  showNotifications: true,
  productIds: ['spark', 'deck'], // optional filter
});
```

**useAIMessaging**:
```typescript
const { generateMessaging, pendingApprovals, approveMessaging } = useAIMessaging();
await generateMessaging('spark', {
  type: 'feature',
  featureId: 'idea_generation',
  featureName: 'AI Idea Generation',
  targetAudience: ['content_creators', 'marketers'],
  competitors: ['canva', 'tome'],
});
```

### Screenshot → Script → Video Sync

1. **Screenshot Capture**: `MultiScreenshotGallery` captures product UI screens
2. **Script Association**: Each screenshot maps to a chapter ID in `PRODUCT_SCREENS`
3. **Messaging Integration**: `aiMessagingGeneratorService` provides per-chapter scripts
4. **TTS Generation**: 4-zone regional routing produces voiceovers
5. **Assembly**: `genie-cast-assembler` stitches screenshots + audio into final video

### Change Detection Flow

```
Product Code Change
       ↓
registerProductChange() called
       ↓
ProductVersion created (semantic version bump)
       ↓
Alerts generated (screenshot_outdated, video_outdated, etc.)
       ↓
Admin sees alerts in Genie Cast dashboard
       ↓
Admin runs auto-capture → markScreenshotsCaptured()
       ↓
Admin regenerates video → markVideoGenerated()
       ↓
Alerts auto-resolved
```

### Files

- `src/services/marketing/productVersionTrackingService.ts`
- `src/services/marketing/aiMessagingGeneratorService.ts`
- `src/hooks/useProductChangeAlerts.ts`
- `src/hooks/useAIMessaging.ts`
- `src/components/genie-admin/MultiScreenshotGallery.tsx`

### Priority: HIGH - Core Marketing Automation
