# Memory: architecture/marketing/dynamic-registry-architecture-v1
Updated: just now

## Dynamic Marketing Registry Architecture

The marketing infrastructure has been migrated from hardcoded constants (`GENIE_PRODUCTS`, `TARGET_AUDIENCES`) to a database-driven dynamic registry system. This enables:

### Database Tables (4 new tables)

1. **`marketing_products`** - Product catalog with name, tagline, features, colors, icons
2. **`marketing_audiences`** - Target audience segments with pain points and messaging angles  
3. **`marketing_languages`** - Language configurations with TTS provider mappings
4. **`marketing_brand_assets`** - Brand assets (logos, icons, screenshots) per product

### Key Design Decisions

- **`is_system_default`** flag distinguishes Genie's internal products from external subscriber products
- **RLS Policies** ensure users see system defaults + their own data only
- **Fallback Pattern** - Service falls back to hardcoded data if database unavailable
- **Legacy Compatibility** - `getLegacyProducts()` and `getLegacyAudiences()` methods maintain backward compatibility

### Service Layer

- **`dynamicMarketingRegistryService`** - Singleton service with CRUD operations and 5-minute cache
- **`useMarketingRegistry`** hook - React Query-based hook with mutations and optimistic updates

### Migration Path for Existing Code

Old pattern (hardcoded):
```typescript
import { GENIE_PRODUCTS, TARGET_AUDIENCES } from './productVersionTrackingService';
```

New pattern (dynamic):
```typescript
const { products, audiences } = useMarketingRegistry();
// OR
const products = await dynamicMarketingRegistryService.getProducts();
```

### Seeded Data

- 8 Genie products (Studio, Spark, Mind, Vibe, Arc, Deck, Cast, Ask Genie)
- 20 target audiences across 6 industry verticals
- 14 languages with TTS provider mappings

### Future: External Subscriber Flow

When self-service is enabled:
1. Subscribers authenticate via Genie Studio subscription
2. Create custom products via `createProduct()` with their `user_id`
3. Define custom audiences via `createAudience()`
4. Upload brand assets via `createBrandAsset()`
5. Use same Generate → Matrix → Library workflow with their data
