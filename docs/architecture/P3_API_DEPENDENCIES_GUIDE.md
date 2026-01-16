# P3 API Dependencies & Configuration Guide

> **Version:** 2.0  
> **Updated:** 2026-01-16  
> **Purpose:** Complete guide to API keys and external dependencies for P3 features  
> **Source of Truth:** `src/genie-studio/governance/ApiProductionConfig.ts`

## 🚨 Production Readiness Summary

| Metric | Value |
|--------|-------|
| Total APIs Configured | 16 |
| Production Ready | 12 (75%) |
| Needs Upgrade | 4 (Gemini, DocuSign, Label Studio, Resend) |
| Estimated Monthly Cost | ~$592 |
| Stage Gate Progress | 17/29 (59%) |

**⚠️ PROD ACTIONS REQUIRED:**
1. **Gemini**: Switch v1beta → v1 endpoint
2. **DocuSign**: Switch demo → production endpoint, upgrade tier
3. **Label Studio**: Deploy production instance, configure SSO
4. **Resend**: Upgrade Free → Pro tier (3000/mo limit too low)

---

## 🔑 API Keys Overview

### Tier 1: Core AI & Communication (Configured)

These keys are already configured and ready to use:

| Key | Environment Variable | Used By | Cost Model |
|-----|---------------------|---------|------------|
| Lovable AI | `LOVABLE_API_KEY` | All AI features | Usage-based |
| OpenAI | `OPENAI_API_KEY` | GPT models | Usage-based |
| Anthropic | `ANTHROPIC_API_KEY` | Claude models | Usage-based |
| Claude Direct | `CLAUDE_API_KEY` | Direct Claude access | Usage-based |
| Google Gemini | `GEMINI_API_KEY` | Gemini models | Usage-based |
| Google Services | `GOOGLE_API_KEY` | TTS, translation | Usage-based |

### Tier 2: Media & Voice (Configured)

| Key | Environment Variable | Used By | Cost Model |
|-----|---------------------|---------|------------|
| ElevenLabs | `ELEVENLABS_API_KEY` | Voice synthesis | Character-based |
| Replicate | `REPLICATE_API_TOKEN` | Video/Image generation | Usage-based |
| HuggingFace | `HUGGING_FACE_ACCESS_TOKEN` | ML models | Free tier available |

### Tier 3: Communication (Configured)

| Key | Environment Variable | Used By | Cost Model |
|-----|---------------------|---------|------------|
| Twilio SID | `TWILIO_ACCOUNT_SID` | All Twilio services | Usage-based |
| Twilio Token | `TWILIO_AUTH_TOKEN` | Authentication | - |
| Twilio Phone | `TWILIO_PHONE_NUMBER` | Outbound calls | Usage-based |
| Twilio WhatsApp | `TWILIO_WHATSAPP_NUMBER` | WhatsApp messages | Usage-based |
| Resend | `RESEND_API_KEY` | Transactional email | Usage-based |
| SendGrid | `SENDGRID_API_KEY` | Bulk email | Usage-based |

### Tier 4: Business Services (Configured)

| Key | Environment Variable | Used By | Cost Model |
|-----|---------------------|---------|------------|
| Stripe | `STRIPE_SECRET_KEY` | Payments | Transaction % |
| DocuSign | `DOCUSIGN_API_KEY` | E-signatures | Per envelope |
| Arize | `ARIZE_API_KEY` | AI observability | Free tier available |
| LangWatch | `LANGWATCH_API_KEY` | LLM monitoring | Free tier available |

---

## ⚠️ Keys Needed for Specific Features

### Publishing Agent (Multi-Channel)

To enable the Publishing Agent for multi-channel distribution:

```bash
# Required for YouTube publishing
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret

# Required for LinkedIn publishing
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Required for Instagram publishing (Meta Business)
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
```

**Setup Instructions:**

1. **YouTube API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project and enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **LinkedIn API**
   - Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
   - Create an app
   - Request Marketing Developer Platform access
   - Configure OAuth 2.0

3. **Instagram/Meta API**
   - Go to [Meta Developer Portal](https://developers.facebook.com/)
   - Create a Meta Business App
   - Add Instagram Graph API product
   - Get Instagram Business Account ID

### NPI Verification Agent

The NPPES API is **free** but rate-limited:

```bash
# No API key required, but configure rate limiting
NPPES_RATE_LIMIT_PER_MINUTE=20
```

**Usage Notes:**
- API endpoint: `https://npiregistry.cms.hhs.gov/api/`
- No authentication required
- Rate limit: ~20 requests per minute recommended
- Use caching for frequently accessed NPIs

### Accessibility Agent

For WCAG compliance checking:

```bash
# Axe DevTools API (optional)
AXE_API_KEY=your_axe_api_key

# WAVE API (alternative)
WAVE_API_KEY=your_wave_api_key
```

**Free Alternatives:**
- Axe-core library (client-side, no API key needed)
- Pa11y (open-source, self-hosted)

---

## 🏥 Healthcare-Specific APIs

### NPI/NPPES Lookup

```typescript
// Example usage in edge function
const npiLookup = async (npi: string) => {
  const response = await fetch(
    `https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`
  );
  return response.json();
};
```

### openFDA Drug Lookup

```typescript
// Free API, no key required
const drugLookup = async (drugName: string) => {
  const response = await fetch(
    `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=5`
  );
  return response.json();
};
```

### CMS/Medicare APIs

For Medicare verification (requires registration):

```bash
# CMS Developer Portal registration required
CMS_API_KEY=your_cms_api_key
```

---

## 🔒 Security Best Practices

### API Key Storage

1. **Never commit keys to code**
   - Use Supabase Secrets
   - Use environment variables in edge functions

2. **Rotate keys regularly**
   - Set calendar reminders for rotation
   - Use short-lived tokens where possible

3. **Limit key permissions**
   - Create keys with minimum required permissions
   - Use separate keys for dev/staging/production

### Rate Limiting

All edge functions should implement rate limiting:

```typescript
const RATE_LIMITS = {
  NPPES: { requests: 20, windowMs: 60000 },
  YOUTUBE: { requests: 10000, windowMs: 86400000 },
  OPENAI: { requests: 3500, windowMs: 60000 },
};
```

---

## 📊 API Usage Monitoring

### Configured Monitoring

| Service | Monitoring Tool | Dashboard |
|---------|-----------------|-----------|
| OpenAI | Arize | AI Gateway metrics |
| Anthropic | LangWatch | LLM tracing |
| Supabase | Built-in | Edge function logs |
| All APIs | Supabase | `api_consumption_logs` table |

### Cost Alerts

Set up alerts for:
- Monthly spend thresholds
- Unusual usage patterns
- Failed request spikes
- Rate limit approaches

---

## 🚀 Quick Start: Adding a New API Key

1. **Add to Supabase Secrets**
   ```bash
   # Via Lovable Cloud dashboard or CLI
   lovable secrets set NEW_API_KEY "your-key-value"
   ```

2. **Access in Edge Function**
   ```typescript
   const apiKey = Deno.env.get('NEW_API_KEY');
   if (!apiKey) {
     throw new Error('NEW_API_KEY not configured');
   }
   ```

3. **Document the Key**
   - Add to this document
   - Update P3_CLOSEOUT_PRODUCTION_READINESS.md
   - Update relevant edge function README

---

## 📚 Related Documentation

- [P3 Closeout & Production Readiness](./P3_CLOSEOUT_PRODUCTION_READINESS.md)
- [Edge Functions Guide](./EDGE_FUNCTIONS_GUIDE.md)
- [Security Best Practices](../SECURITY_BEST_PRACTICES.md)

---

*Document maintained by Genie Studio DevOps Team*
