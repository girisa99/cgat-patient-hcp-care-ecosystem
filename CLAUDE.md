# CLAUDE.md — GenieSuite Ecosystem

## Identity
Multi-product AI healthcare platform. Products, regions, models, and providers are ALL dynamic — driven by DB tables and registries, never hardcoded.

## Build
```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build   # Required — plain npm run build OOMs
npm run dev                                               # Dev server
```
Vercel: `NODE_OPTIONS=--max-old-space-size=8192` as env var in dashboard only.

## Core Principles
1. **DB is the single source of truth** — `ai_model_registry` for models, `ai_model_regional_routing` for routing
2. **Zero-deploy model updates** — change DB row, everything adapts in ≤5 min
3. **Never hardcode model IDs** — use `resolveModelId()` (client) or `resolveModel()` (edge)
4. **Never hardcode provider selections** — use routing tables driven by region/language/capability
5. **All features work across ALL regions** — 16 parent regions, 62 subregions, 85+ languages
6. **Filter data: URIs before payloads** — base64 images = MBs, always strip before sending

## Dynamic Registries
| Registry | Source | Resolver |
|----------|--------|----------|
| AI Models | `ai_model_registry` table | `resolveModelId()` / `resolveModel()` |
| Regional Routing | `ai_model_regional_routing` table | `getRegionalModel()` |
| Client Models | `provider-version-registry.ts` → `initializeFromDB()` | `getActiveModel()` |
| React Components | `useModelRegistry.ts` hook | `resolveModel()` / `getActiveModelForProvider()` |

## Adding New Models / Retiring Old Ones
```sql
-- Add: INSERT into ai_model_registry
-- Retire: UPDATE status='retired', replaced_by='new-model', add old ID to new model's model_alias[]
-- Route: UPSERT into ai_model_regional_routing
```
No code changes. No deploys. The alias system auto-resolves old → new.

## Edge Function Limits
- ~150MB memory, ~6MB request body
- `ai-universal-processor` = main dispatcher (19+ providers)
- `ai-model-admin` = model management API (register/deprecate/retire/route/health)

## Locked Files (never modify)
- `src/constants/genie-products.ts`
- `src/hooks/useMasterAuth.tsx`
- `src/components/auth/ProtectedRoute.tsx`, `GenieStudioProtectedRoute.tsx`
- `src/components/layout/AppLayout.tsx`, `GenieStudioLayout.tsx`
- `src/integrations/supabase/**`
- `src/config/genieStudioNavItems.ts`

## Conventions
- TypeScript strict, 2-space indent
- Edge functions use Deno + `https://esm.sh/` imports
- Supabase `cast-assets` bucket: public, no `application/json` mime
- All new AI code must go through dynamic model resolution — PR reviews should reject hardcoded model strings
