# Genie Support & Genie Cast Documentation

## Complete Technical Reference

---

## 📞 GENIE SUPPORT SYSTEM

### Overview
The Genie Support system follows an **"Ask Genie First"** model - AI-powered assistance before human escalation.

### Components

#### 1. GenieSupportPage (`src/pages/GenieSupportPage.tsx`)
**Purpose:** Main entry point for all support interactions

| Feature | Description |
|---------|-------------|
| Route | `/genie-support` or `/support` |
| Auth | Optional (enhanced experience when signed in) |
| Layout | AppLayout wrapper with centered container |

**Key Elements:**
- Header with HelpCircle icon
- Auth prompt card for unauthenticated users
- SupportTicketCreator component
- Quick links: Documentation, FAQs, Community

---

#### 2. SupportTicketCreator (`src/components/genie-support/SupportTicketCreator.tsx`)
**Purpose:** Unified AI chat + formal ticket submission

**Two Tabs:**

##### Tab 1: "Ask Genie" (AI Chat)
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

**Flow:**
1. User types question
2. AI analyzes for escalation keywords (`bug`, `error`, `not working`, `broken`)
3. If technical issue detected → suggests creating formal ticket
4. Chat logged to `genie_support_tickets` table

##### Tab 2: "Submit Ticket" (Formal)
```typescript
const TICKET_CATEGORIES = [
  'Account & Billing',
  'Technical Issue',
  'Feature Request',
  'Content Generation',
  'Integration Help',
  'Other',
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-green-500/20' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20' },
];
```

**Ticket Submission:**
- Requires authentication
- Fields: Subject, Category, Priority, Description
- Auto-links to `genie_studio_user_id`
- Captures user tier for SLA routing

---

#### 3. Engineering Context Export (`src/services/engineeringContextExportService.ts`)
**Purpose:** Developer handoff for technical issues

```typescript
interface EngineeringContext {
  ticketId: string;
  summary: string;
  category: string;
  priority: string;
  stackTraces: string[];
  networkFailures: Array<{
    url: string;
    method: string;
    status: number;
    error: string;
    timestamp: string;
  }>;
  sessionReplayUrl?: string;
  environmentSnapshot: {
    browser: string;
    os: string;
    screenSize: string;
    timezone: string;
    language: string;
    appVersion: string;
  };
  reproductionSteps: string[];
}
```

**Export Formats:**
- Markdown (AI-ready for Cursor/Claude)
- JSON (Structured data)
- Email (Human-readable summary)

---

#### 4. Internal User Admin Panel (`src/components/genie-admin/InternalUserAdminPanel.tsx`)
**Purpose:** Manage internal support team

**Roles:**
| Role | Permissions |
|------|-------------|
| `super_admin` | Full system access |
| `content_manager` | Content review/approval |
| `marketing_lead` | Marketing campaign access |
| `creator` | Standard creator access |

---

#### 5. Database Schema

```sql
-- Ticket Categories
CREATE TYPE genie_ticket_category AS ENUM (
  'account', 'billing', 'technical', 'feature_request', 
  'bug_report', 'content_generation', 'integration', 'other'
);

-- Support Sessions (AI Chat)
CREATE TABLE genie_support_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_token TEXT UNIQUE,  -- For anonymous sessions
  ...
);

-- Support Tickets (Formal)
CREATE TABLE genie_support_tickets (
  id UUID PRIMARY KEY,
  genie_studio_user_id UUID,
  user_email TEXT,
  user_name TEXT,
  subject TEXT,
  description TEXT,
  category genie_ticket_category,
  priority TEXT,  -- low, medium, high, urgent
  status TEXT,    -- open, in_progress, resolved, closed
  user_tier TEXT,
  ...
);
```

---

## 📡 GENIE CAST (7th Core Product)

### Tagline: "Make It. Show It. Scale It."

### Overview
Genie Cast is the **global distribution and marketing engine** that automates content creation and publishing across 14 regions and 6 platforms using Genie's own 119 pipelines.

---

### Core Components

#### 1. Genie Cast Integration Config (`src/config/genie-dogfood-integration.ts`)

**Feature Types:**
```typescript
export type GenieCastFeatureType = 
  | 'daily_showcase'        // Hero rotating content
  | 'avatar_presenter'      // Regional AI avatars
  | '3d_hero'               // Interactive 3D scenes
  | 'video_testimonials'    // AI-generated testimonials
  | 'product_demo_video'    // Product-specific demos
  | 'interactive_demo'      // Live mini-generation
  | 'feature_showcase'      // Individual feature highlights
  | 'pipeline_showcase'     // Pipeline capability demos
  | 'regional_content'      // Localized content
  | 'platform_distribution' // Multi-platform publishing
```

**Pipeline Mappings:**
| Feature | Pipelines | Providers | Refresh |
|---------|-----------|-----------|---------|
| Daily Showcase | text-to-video, script-to-avatar, ppt-to-video | ModelsLab, ElevenLabs, Alibaba | 24h |
| Avatar Presenter | text-to-avatar, script-to-avatar, voice-to-lipsync | Alibaba OmniAvatar, HeyGen, Azure | 168h |
| 3D Hero | text-to-3d, image-to-3d | Meshy AI, Tripo3D | 48h |
| Video Testimonials | video_avatar, text-to-video | ElevenLabs, Alibaba Wan2.2 | 72h |
| Product Demo | screen-to-video, ppt-to-video, script-to-video | ModelsLab, Azure | 168h |
| Interactive Demo | text-to-presentation, text-to-video, voice-clone | OpenAI, ElevenLabs, ModelsLab | On-demand |

**Regional Avatar Configuration:**
```typescript
export const REGIONAL_AVATAR_CONFIG = {
  en: { avatarStyle: 'professional_western', voiceProvider: 'ElevenLabs', voiceId: 'rachel' },
  ar: { avatarStyle: 'professional_mena', voiceProvider: 'Azure', voiceId: 'ar-SA-HamedNeural' },
  zh: { avatarStyle: 'professional_cjk', voiceProvider: 'Alibaba', voiceId: 'zhixiaobai' },
  hi: { avatarStyle: 'professional_south_asian', voiceProvider: 'Azure', voiceId: 'hi-IN-MadhurNeural' },
  ja: { avatarStyle: 'professional_cjk', voiceProvider: 'Alibaba', voiceId: 'sicheng' },
  ko: { avatarStyle: 'professional_cjk', voiceProvider: 'Azure', voiceId: 'ko-KR-InJoonNeural' },
  es: { avatarStyle: 'professional_western', voiceProvider: 'ElevenLabs', voiceId: 'matilda' },
  fr: { avatarStyle: 'professional_western', voiceProvider: 'ElevenLabs', voiceId: 'charlotte' },
  de: { avatarStyle: 'professional_western', voiceProvider: 'Azure', voiceId: 'de-DE-ConradNeural' },
  pt: { avatarStyle: 'professional_latam', voiceProvider: 'Azure', voiceId: 'pt-BR-AntonioNeural' },
};
```

---

#### 2. Dogfooding Marketing Engine (`src/services/dogfoodingMarketingEngine.ts`)

**Purpose:** "We eat our own dogfood" - generating daily content using Genie's pipelines

**Content Types:**
```typescript
export type ContentFormat = 
  | 'video_avatar'      // AI Avatar presenter video
  | 'video_animated'    // Motion graphics
  | 'video_3d'          // 3D immersive
  | 'video_journey'     // Step-by-step journey
  | 'shorts_vertical'   // TikTok/Reels/Shorts
  | 'carousel'          // LinkedIn/Instagram carousel
  | 'thread'            // Twitter/LinkedIn thread
  | 'blog_post'         // SEO blog article
  | 'infographic'       // Static visual
  | 'podcast_clip';     // Audio with visuals
```

**Platforms:**
```typescript
export type Platform = 
  | 'linkedin' | 'youtube' | 'youtube_shorts'
  | 'tiktok' | 'instagram_reels' | 'instagram_feed'
  | 'twitter' | 'facebook' | 'blog' | 'threads';
```

**Product Positioning Catalog:**
| Product | Tagline | Value Proposition |
|---------|---------|-------------------|
| Spark | "From blank canvas to brilliant content in minutes" | AI-guided ideation |
| Mind | "Your knowledge, amplified by AI" | RAG-powered knowledge base |
| Vibe | "Capture now, create later—anywhere" | Mobile-first recording |
| Deck | "Presentations that don't break on export" | High-fidelity PPTX |
| Arc | "Agency-quality production, zero agency cost" | Full video production |
| Hub | "Your entire content operation, unified" | Enterprise command center |

**Daily Content Generation:**
```typescript
class DogfoodingMarketingEngine {
  generateDailyPlan(date: Date): DailyContentPlan {
    // Rotate through 119 pipelines
    // Generate content for 14 regional bundles
    // Create multiple format variations per region
    // Schedule optimal posting times per platform
  }
}
```

---

#### 3. Marketing Content Manager (`src/services/marketingContentManager.ts`)

**Purpose:** Complete content lifecycle management

**Content Status Flow:**
```
draft → pending_review → approved → scheduled → publishing → published
                      ↘ rejected (needs revision)
                                              ↘ failed
```

**All 119 Pipelines by Category:**

| Category | Count | Example Pipelines |
|----------|-------|-------------------|
| Text-Based | 10 | text-to-image, text-to-video, text-to-3d, text-to-avatar |
| Image-Based | 8 | image-to-video, image-to-3d, image-enhance, style-transfer |
| Voice/Audio | 10 | text-to-speech, voice-clone, music-generation, podcast-editing |
| Document/PPT | 8 | doc-to-video, slides-to-video, ppt-enhance, doc-summary |
| Video-Based | 12 | video-enhance, video-lipsync, video-dubbing, shorts-generator |
| 3D-Based | 8 | 3d-mesh-gen, 3d-texture, 3d-rigging, 3d-animation |
| AR/VR | 6 | ar-object, vr-environment, ar-try-on, vr-tour |
| Multimodal | 8 | script-to-video, idea-to-content, data-to-story |
| Presentation | 7 | script-to-deck, deck-to-video, interactive-presentation |
| Repurposing | 8 | blog-to-video, webinar-to-shorts, podcast-to-clips |
| Training/L&D | 6 | course-creator, microlearning, assessment-generator |
| Marketing/Sales | 31 | carousel-creator, social-post-generator, email-sequence |
| Localization | 5 | video-translation, cultural-adaptation, multilingual-dub |
| Social Publishing | 2 | multi-platform-publish, content-scheduler |

---

#### 4. AI Generation Integration (`src/services/marketing/aiGenerationIntegration.ts`)

**Purpose:** Bridge marketing engine to production pipelines

```typescript
class AIGenerationIntegration {
  // Create generation request
  async createRequest(config): Promise<GenerationRequest>;
  
  // Generate avatar video (TTS → Video → Thumbnail)
  async generateAvatarVideo(request): Promise<GeneratedAssets>;
  
  // Generate 3D scene
  async generate3DScene(request): Promise<GeneratedAssets>;
  
  // Generate multi-step journey content
  async generateJourneyContent(request): Promise<GeneratedAssets>;
}
```

**Regional Voice Configuration:**
```typescript
const REGIONAL_VOICE_CONFIG = {
  en: { provider: 'elevenlabs', voiceIds: { male: 'adam', female: 'rachel' } },
  ar: { provider: 'azure', voiceIds: { male: 'ar-SA-HamedNeural', female: 'ar-SA-ZariyahNeural' } },
  zh: { provider: 'alibaba', voiceIds: { male: 'zhixiaobai', female: 'zhixiaomei' } },
  // ... 10 regions total
};
```

---

#### 5. Genie Cast Architecture Diagram (`src/components/diagrams/architecture/GenieCastArchitectureDiagram.tsx`)

**Visual representation of:**
- 119 Pipeline Rotation Engine
- 14 Regional Bundles
- 6 Platform Distribution (YouTube, LinkedIn, TikTok, Instagram, X, Blog)
- Content Lifecycle (Draft → Review → Scheduled → Published)
- Provider Integration (12 Core AI Providers)

---

### Database Schema for Genie Cast

```sql
-- Genie Cast Content
CREATE TABLE genie_cast_content (
  id UUID PRIMARY KEY,
  product TEXT,           -- spark, mind, vibe, deck, arc, hub
  platform TEXT,          -- youtube, linkedin, tiktok, etc.
  region TEXT,            -- en, ar, zh, hi, etc.
  format TEXT,            -- video_avatar, carousel, etc.
  headline TEXT,
  hook TEXT,
  body TEXT,
  cta TEXT,
  media_assets JSONB,
  seo_data JSONB,
  status TEXT,            -- draft, scheduled, published
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  analytics JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Genie Cast Schedules
CREATE TABLE genie_cast_schedules (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES genie_cast_content(id),
  scheduled_at TIMESTAMPTZ,
  timezone TEXT,
  platform TEXT,
  status TEXT,           -- pending, processing, completed, failed
  published_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔗 Integration Points

### Support → Cast
- Support tickets about generation issues inform Cast content improvements
- Common questions become tutorial content for Cast distribution

### Cast → Support
- Cast publishes help articles and video tutorials
- AI-generated FAQ content from support patterns

### Microservices Architecture

| Domain | Services |
|--------|----------|
| **Genie Cast** | genie-cast-scheduler, genie-cast-publisher, social-connectors, analytics-collector, cdn-manager |
| **Support** | support-ticket-processor, ai-chat-handler, escalation-router, knowledge-base-sync |

---

## 📊 Summary Metrics

| Metric | Value |
|--------|-------|
| **Total Pipelines** | 119 |
| **Regional Bundles** | 14 |
| **Distribution Platforms** | 6 |
| **AI Providers** | 12 |
| **Content Formats** | 15 |
| **Product Lines** | 7 (Spark, Mind, Vibe, Deck, Arc, Hub, Cast) |
| **Support Tiers** | 4 (Starter, Pro, Enterprise, Internal) |
| **Languages** | 70+ |

---

**Last Updated:** 2026-01-25
**Version:** 1.0
