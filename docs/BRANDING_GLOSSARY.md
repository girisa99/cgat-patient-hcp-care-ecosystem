# 🎨 Genie AI Suite — Branding Glossary & Naming Governance

> **Single Source of Truth** for all product names, banned terms, and correct usage.
> Every developer, AI agent, and CI pipeline MUST reference this file before introducing product names.

---

## 📛 Rebrand Mapping (Old → New)

| ❌ BANNED (Old Name) | ✅ CORRECT (New Name) | Context |
|---|---|---|
| `Genie Studio` (as umbrella/brand) | **Genie Suite** | The umbrella brand for all 7 products. Tagline: "Mind to Media" |
| `Genie Arc` | **Genie Hub** | Creative Command Center — centralized workspace for all tools |
| `CosyVoice` | **Qwen3-TTS** | Alibaba DashScope TTS model (`qwen3-tts-flash`). Provider label: "Qwen3-TTS" |
| `Genie Studio` (as product) | **Genie Studio** | ✅ STILL VALID as the internal production hub workspace within the Suite |

### ⚠️ Important Distinction

- **"Genie Suite"** = The umbrella brand (replaces "Genie Studio" when used as the overall platform name)
- **"Genie Studio"** = Still valid as the internal production workspace/hub product
- When in doubt: if you mean "the whole platform" → **Genie Suite**. If you mean "the production workspace" → **Genie Studio**

---

## 🏷️ Official Product Lineup (7 Products)

| Product | Tagline | Internal ID |
|---|---|---|
| **Genie Spark** | AI-Powered Ideation | `spark` |
| **Genie Mind** | Script Writing & Enhancement | `mind` |
| **Genie Vibe** | Recording Studio & Teleprompter | `vibe` |
| **Genie Deck** | AI Presentation Generation | `deck` |
| **Genie Hub** | Your Creative Command Center | `hub` |
| **Genie Cast** | Make It. Show It. Scale It. | `cast` |
| **Ask Genie** | Conversational AI Assistant | `ask-genie` |

**Parent Brand:** Genie AI Suite (`genieaisuite.com`)
**Tagline:** Mind to Media
**Provider Count:** **19 AI Providers** (verified from `src/config/master-provider-routing-registry.ts` → `TOTAL_PROVIDER_COUNT = 19`)

> ⚠️ **NEVER** use "15 AI Providers" or "18 AI Providers" — the correct count is **19**.

---

## 🚫 Banned Terms List

These terms MUST NOT appear in **user-visible text**, **documentation**, or **new code comments**:

| Banned Term | Replacement | Notes |
|---|---|---|
| `Genie Arc` | `Genie Hub` | All contexts — UI, docs, comments, configs |
| `CosyVoice` | `Qwen3-TTS` | Model refs, routing tables, UI labels |
| `cosyvoice` | `qwen3-tts` | Variable names, config keys, function names |
| `Genie Studio` (as umbrella) | `Genie Suite` | When referring to the whole platform/brand |

### Allowed Legacy References (Internal Only)

These **folder/URL slugs** remain unchanged to prevent breaking changes:
- `src/genie-studio/` — folder path (internal, not user-visible)
- `/genie-studio` — URL route slug
- `genie_studio_users` — database table name
- `useGenieStudioAuth` — hook name (internal)

These are **technical identifiers**, not branding. They do NOT need renaming.

---

## 🤖 AI Provider Naming Standards

| ❌ NEVER USE | ✅ ALWAYS USE | Model ID |
|---|---|---|
| CosyVoice | **Qwen3-TTS** | `qwen3-tts-flash` |
| CosyVoice-2 | **Qwen3-TTS** | `qwen3-tts-flash` |
| Alibaba TTS | **Qwen3-TTS** (via Alibaba DashScope) | `qwen3-tts-flash` |

### Provider Display Names

| Provider | Display Name | Internal Key |
|---|---|---|
| Google | Vertex AI (Veo 3 / Imagen 3) | `google-vertex` |
| Alibaba | Qwen3-TTS / Wan 2.6 / Qwen-Max | `alibaba-dashscope` |
| Microsoft | Azure Neural TTS | `azure-neural` |
| ElevenLabs | ElevenLabs | `elevenlabs` |
| OpenAI | OpenAI GPT-4o / Sora 2 | `openai` |
| Anthropic | Claude | `anthropic` |
| Meshy | Meshy AI | `meshy` |

---

## 📐 Usage Examples

### ✅ Correct Usage

```typescript
// Good: Genie Suite as umbrella
const BRAND_NAME = 'Genie Suite';
const TAGLINE = 'Mind to Media';

// Good: Genie Hub as product
const HUB_PRODUCT = { name: 'Genie Hub', tagline: 'Your Creative Command Center' };

// Good: Qwen3-TTS as provider
const TTS_PROVIDER = 'Qwen3-TTS';
const TTS_MODEL = 'qwen3-tts-flash';

// Good: Genie Studio as production workspace (not umbrella)
const STUDIO_WORKSPACE = 'Genie Studio'; // Internal production hub
```

### ❌ Incorrect Usage

```typescript
// BAD: Old umbrella name
const BRAND_NAME = 'Genie Studio'; // ← Use 'Genie Suite'

// BAD: Old product name
const ARC_PRODUCT = 'Genie Arc'; // ← Use 'Genie Hub'

// BAD: Old TTS provider name
const TTS = 'CosyVoice'; // ← Use 'Qwen3-TTS'
```

---

## 🔧 Enforcement

### Automated (CI/Build)
- `scripts/validate-product-structure.ts` includes a **banned terms checker**
- Scans all `.ts`, `.tsx`, `.md` files for banned terms
- Fails CI if banned terms found in user-visible text

### Manual (Code Review)
- Reviewers MUST check for banned terms in PRs
- AI agents MUST reference this glossary before introducing product names

### Project Knowledge (AI Sessions)
- Custom instructions include rebrand mappings
- AI will auto-correct banned terms in suggestions

---

## 📅 Changelog

| Date | Change |
|---|---|
| 2026-02-10 | Initial glossary created. Genie Studio→Suite, Arc→Hub, CosyVoice→Qwen3-TTS |

---

**Last Updated:** 2026-02-10
**Status:** ACTIVE — Enforced on ALL new development
