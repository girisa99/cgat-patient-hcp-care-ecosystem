# SEO Performance Tracking & API Integration Strategy

> **Version:** 1.0  
> **Updated:** 2026-02-05  
> **Purpose:** Document the hybrid approach for video-first SEO with internal capabilities + external API integrations  
> **Related:** `src/components/genie-admin/genie-cast/seo/`

---

## 🎯 Executive Summary

Genie Cast's SEO suite uses a **hybrid architecture** combining:
1. **Internal Capabilities** - Video-specific optimization we build ourselves
2. **External APIs** - Global search/trend data we cannot manufacture

This approach differentiates from traditional web-SEO agencies by being **video-first** and **workflow-integrated**.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Genie Cast SEO Suite                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐    ┌──────────────────────┐                   │
│  │   INTERNAL ENGINE    │    │   EXTERNAL APIs      │                   │
│  │   (We Build)         │    │   (We Integrate)     │                   │
│  ├──────────────────────┤    ├──────────────────────┤                   │
│  │ • Keyword extraction │    │ • Google Trends API  │                   │
│  │   from video scripts │    │ • Social Blade API   │                   │
│  │ • Platform-specific  │    │ • YouTube Analytics  │                   │
│  │   metadata generation│    │ • TikTok Analytics   │                   │
│  │ • SERP simulation    │    │ • LinkedIn Analytics │                   │
│  │ • Hashtag suggestions│    │ • X/Twitter API      │                   │
│  │ • Character limits   │    │                      │                   │
│  │ • Multi-platform copy│    │                      │                   │
│  └──────────┬───────────┘    └──────────┬───────────┘                   │
│             │                           │                                │
│             └───────────┬───────────────┘                                │
│                         ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    COMBINED VALUE OUTPUT                          │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ • Script keywords → matched to trending topics                    │   │
│  │ • Competitor gap analysis with actionable recommendations         │   │
│  │ • Predicted rank vs actual rank tracking                          │   │
│  │ • Optimal posting time recommendations                            │   │
│  │ • View velocity predictions                                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Internal Capabilities (What We Build)

### 1. Keyword Extraction Engine

**Purpose:** Extract SEO-relevant keywords directly from video scripts during authoring.

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Script Analysis | NLP-based keyword extraction from generated scripts | AI processor |
| Density Scoring | Keyword frequency and placement optimization | Client-side algorithm |
| Intent Mapping | Map keywords to user intent (informational, transactional) | AI classification |

**Location:** `src/services/seo/KeywordExtractor.ts` (to be created)

### 2. Platform-Specific Metadata Generation

**Purpose:** Auto-generate optimized titles, descriptions, tags for each platform.

| Platform | Title Limit | Description Limit | Hashtag Strategy |
|----------|-------------|-------------------|------------------|
| YouTube | 100 chars | 5000 chars | Tags field (500 chars) |
| TikTok | 150 chars | 2200 chars | In-caption hashtags |
| LinkedIn | 150 chars | 3000 chars | 3-5 professional hashtags |
| Instagram | N/A | 2200 chars | 30 hashtags max |
| X/Twitter | 280 chars | N/A | 2-3 trending hashtags |

**Location:** `src/components/genie-admin/genie-cast/seo/SEOOptimizerPanel.tsx`

### 3. SERP Preview Simulation

**Purpose:** Visual preview of how content appears in search results.

| Preview Type | Platforms | Features |
|--------------|-----------|----------|
| Video Card | YouTube, TikTok | Thumbnail, title, view count |
| Social Card | LinkedIn, X | OG image, title, description |
| Search Result | Google Video | Rich snippet, timestamp |

**Location:** `src/components/genie-admin/genie-cast/seo/SERPPreviewPanel.tsx`

### 4. Hashtag Intelligence

**Purpose:** Context-aware hashtag recommendations.

- **Niche hashtags:** Low competition, high relevance
- **Trending hashtags:** Time-sensitive, high visibility
- **Branded hashtags:** Company-specific, trackable
- **Community hashtags:** Audience-specific engagement

---

## 🌐 External API Integrations (Why We Need Them)

### The Core Problem

> **We cannot manufacture global search data or competitor metrics.**

No matter how sophisticated our internal engine, we need external data sources for:

| Data Type | Why We Can't Build It | External Source |
|-----------|----------------------|-----------------|
| Global search volume | Requires Google's index | Google Trends API |
| Competitor growth rates | Requires access to their analytics | Social Blade API |
| Our own video performance | Platform-specific metrics | YouTube/TikTok Analytics |
| Real-time trending topics | Requires platform firehose | Twitter/X API, TikTok |

### API Integration Matrix

#### 1. Google Trends API

**Purpose:** Real-time search interest data for keyword timing and topic validation.

```typescript
interface GoogleTrendsIntegration {
  endpoint: 'https://trends.google.com/trends/api/';
  features: [
    'interest_over_time',      // Historical search volume
    'related_queries',         // Discover related keywords
    'interest_by_region',      // Geographic targeting
    'real_time_trends'         // Breaking topics
  ];
  tier: 'business';            // Tier gating
  rateLimit: '100/day';        // API limits
  costModel: 'free';           // No direct cost (scraping-based)
}
```

**Value Proposition:**
- Know *what* to create before competitors
- Time content releases to search interest peaks
- Validate keyword opportunities before production

#### 2. Social Blade API

**Purpose:** Competitor channel analytics for benchmarking.

```typescript
interface SocialBladeIntegration {
  endpoint: 'https://api.socialblade.com/v2/';
  features: [
    'channel_stats',           // Subscriber counts, views
    'growth_history',          // Historical growth rates
    'grade_ranking',           // A-F channel grades
    'estimated_earnings'       // Revenue estimates
  ];
  tier: 'enterprise';          // Premium tier only
  rateLimit: '100/day';
  costModel: '$10/month basic';
}
```

**Value Proposition:**
- Benchmark against industry leaders
- Identify viral content patterns
- Track competitor posting frequency
- Estimate market opportunity

#### 3. YouTube Analytics API (Own Channel)

**Purpose:** Performance tracking for published content.

```typescript
interface YouTubeAnalyticsIntegration {
  endpoint: 'https://youtubeanalytics.googleapis.com/v2/';
  features: [
    'views',                   // View counts
    'watch_time',              // Retention metrics
    'impressions',             // Search/browse impressions
    'click_through_rate',      // CTR from impressions
    'traffic_sources',         // Where views come from
    'audience_retention'       // Drop-off analysis
  ];
  tier: 'pro';                 // Available from Pro tier
  rateLimit: '10000/day';
  costModel: 'free';           // OAuth-based
  requires: 'Channel connection via OAuth';
}
```

**Value Proposition:**
- Measure actual vs predicted performance
- Identify optimization opportunities
- A/B test thumbnail/title effectiveness
- Track keyword ranking over time

#### 4. TikTok Analytics API

**Purpose:** Short-form video performance tracking.

```typescript
interface TikTokAnalyticsIntegration {
  endpoint: 'https://open.tiktokapis.com/v2/';
  features: [
    'video_insights',          // Views, likes, shares
    'follower_insights',       // Growth tracking
    'content_insights',        // Best performing content
    'audience_insights'        // Demographics
  ];
  tier: 'business';
  rateLimit: '1000/day';
  costModel: 'free';
  requires: 'TikTok Business Account';
}
```

#### 5. LinkedIn Analytics API

**Purpose:** Professional video performance.

```typescript
interface LinkedInAnalyticsIntegration {
  endpoint: 'https://api.linkedin.com/v2/';
  features: [
    'share_statistics',        // Impressions, clicks
    'follower_statistics',     // Growth tracking
    'visitor_demographics'     // Audience insights
  ];
  tier: 'business';
  rateLimit: '100/day';
  costModel: 'free';
  requires: 'LinkedIn Page Admin access';
}
```

---

## 🔐 Tier Gating Strategy

### Feature Access by Subscription Tier

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| **Internal Engine** |
| Keyword extraction | ✅ | ✅ | ✅ | ✅ |
| Platform metadata gen | ✅ | ✅ | ✅ | ✅ |
| Hashtag suggestions | ✅ | ✅ | ✅ | ✅ |
| Character optimization | ✅ | ✅ | ✅ | ✅ |
| SERP Preview | ❌ | ✅ | ✅ | ✅ |
| Multi-platform copy | ❌ | ✅ | ✅ | ✅ |
| **External APIs** |
| YouTube Analytics | ❌ | ✅ | ✅ | ✅ |
| Google Trends | ❌ | ❌ | ✅ | ✅ |
| TikTok Analytics | ❌ | ❌ | ✅ | ✅ |
| LinkedIn Analytics | ❌ | ❌ | ✅ | ✅ |
| Social Blade competitor | ❌ | ❌ | ❌ | ✅ |
| API access (programmatic) | ❌ | ❌ | ❌ | ✅ |
| White-label reports | ❌ | ❌ | ❌ | ✅ |

### Implementation Reference

```typescript
// From src/components/genie-admin/genie-cast/seo/index.ts
export const SEO_FEATURE_TIERS = {
  free: [
    'basic_seo_analysis',
    'platform_optimization',
    'keyword_extraction',
    'hashtag_suggestions',
  ],
  pro: [
    'serp_preview',
    'enhanced_recommendations',
    'multi_platform_copy',
    'character_optimization',
    'youtube_analytics',      // Added
  ],
  business: [
    'real_time_trends',       // Google Trends
    'performance_tracking',   // Multi-platform analytics
    'rank_monitoring',
    'velocity_analysis',
    'posting_time_optimizer',
    'tiktok_analytics',       // Added
    'linkedin_analytics',     // Added
  ],
  enterprise: [
    'competitor_analysis',    // Social Blade
    'content_gap_detection',
    'api_access',
    'white_label',
    'custom_reports',
  ],
} as const;
```

---

## 📈 Performance Tracking Dashboard

### Metrics We Track

#### 1. Rank Tracking

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| YouTube search rank | YouTube Data API | Daily |
| Google Video rank | Custom scraper | Weekly |
| TikTok discovery rank | TikTok API | Daily |

#### 2. View Velocity

```typescript
interface ViewVelocityMetrics {
  first24h: number;      // Views in first 24 hours
  first7d: number;       // Views in first week
  velocity_score: number; // Normalized 0-100 score
  trend: 'accelerating' | 'stable' | 'declining';
  benchmark: number;     // Industry average for comparison
}
```

#### 3. Engagement Metrics

| Metric | Calculation | Benchmark |
|--------|-------------|-----------|
| Engagement Rate | (likes + comments + shares) / views | 4-6% good |
| Watch Time % | avg_watch_time / video_duration | 50%+ good |
| CTR | clicks / impressions | 2-10% varies |

#### 4. Keyword Performance

```typescript
interface KeywordPerformance {
  keyword: string;
  targetRank: number;
  currentRank: number;
  searchVolume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}
```

---

## 🔌 API Integration Implementation

### Edge Function Architecture

```
supabase/functions/
├── seo-google-trends/       # Google Trends data fetching
├── seo-social-blade/        # Competitor analytics
├── seo-youtube-analytics/   # Own channel metrics
├── seo-tiktok-analytics/    # TikTok metrics
└── seo-linkedin-analytics/  # LinkedIn metrics
```

### Required Secrets

| Secret | API | Tier Required |
|--------|-----|---------------|
| `GOOGLE_API_KEY` | Google Trends (via SerpAPI or custom) | Business |
| `SOCIAL_BLADE_API_KEY` | Social Blade | Enterprise |
| `YOUTUBE_CLIENT_ID` | YouTube Analytics | Pro |
| `YOUTUBE_CLIENT_SECRET` | YouTube Analytics | Pro |
| `TIKTOK_CLIENT_KEY` | TikTok Analytics | Business |
| `TIKTOK_CLIENT_SECRET` | TikTok Analytics | Business |
| `LINKEDIN_CLIENT_ID` | LinkedIn Analytics | Business |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn Analytics | Business |

### Database Schema

```sql
-- Performance tracking table
CREATE TABLE seo_performance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES video_assets(id),
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Rank metrics
  search_rank INTEGER,
  keyword TEXT,
  
  -- View metrics
  views INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4),
  
  -- Engagement
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  
  -- Calculated
  engagement_rate DECIMAL(5,4),
  velocity_score DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(video_id, platform, date, keyword)
);

-- Competitor tracking table (Enterprise only)
CREATE TABLE seo_competitor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  competitor_channel_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  
  subscribers INTEGER,
  total_views BIGINT,
  video_count INTEGER,
  avg_views_per_video INTEGER,
  growth_rate DECIMAL(5,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, competitor_channel_id, date)
);

-- Trend tracking table
CREATE TABLE seo_trend_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  region TEXT DEFAULT 'US',
  date DATE NOT NULL,
  
  interest_score INTEGER, -- 0-100 from Google Trends
  related_queries JSONB,
  rising_queries JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(keyword, region, date)
);
```

---

## 🚀 Implementation Roadmap

### Phase 1: Internal Engine (Current)
- [x] Basic keyword extraction
- [x] Platform metadata generation
- [x] SERP preview simulation
- [x] Hashtag suggestions
- [x] Tier gating infrastructure

### Phase 2: YouTube Analytics (Next)
- [ ] OAuth flow for YouTube connection
- [ ] Edge function for analytics fetching
- [ ] Performance dashboard UI
- [ ] Rank tracking visualization

### Phase 3: Google Trends Integration
- [ ] Trends API integration
- [ ] Keyword opportunity scoring
- [ ] Optimal timing recommendations
- [ ] Trend alerts

### Phase 4: Competitor Analysis (Enterprise)
- [ ] Social Blade integration
- [ ] Competitor benchmarking
- [ ] Content gap detection
- [ ] Market opportunity analysis

### Phase 5: Multi-Platform Analytics
- [ ] TikTok Analytics integration
- [ ] LinkedIn Analytics integration
- [ ] Cross-platform performance comparison
- [ ] Unified dashboard

---

## 📚 Related Documentation

- [P3 API Dependencies Guide](./P3_API_DEPENDENCIES_GUIDE.md)
- [Genie Cast SEO Components](../../src/components/genie-admin/genie-cast/seo/)
- [Tier Gating Strategy](../TIER_GATING_STRATEGY.md)
- [Video Assembly Pipeline](../VIDEO_ASSEMBLY_PIPELINE.md)

---

## 🔗 Quick Links

- [SEO Feature Tiers](../../src/components/genie-admin/genie-cast/seo/index.ts)
- [Performance Tracking Panel](../../src/components/genie-admin/genie-cast/seo/PerformanceTrackingPanel.tsx)
- [Competitor Analysis Panel](../../src/components/genie-admin/genie-cast/seo/CompetitorAnalysisPanel.tsx)
- [Real-Time Trends Panel](../../src/components/genie-admin/genie-cast/seo/RealTimeTrendsPanel.tsx)

---

*Document maintained by Genie Studio Product Team*
