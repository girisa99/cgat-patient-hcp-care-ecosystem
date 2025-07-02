# ESLint Issues Fix Action Plan

## Summary of Issues
- **Total**: 1,085 problems (1,056 errors, 29 warnings)
- **Primary Issue**: `@typescript-eslint/no-explicit-any` (95%+ of all errors)
- **Secondary Issues**: React hooks violations, empty object types, other TypeScript issues

---

## Strategy: Systematic Fixing Approach

### Phase 1: Quick Wins (Allow Commits ASAP) ⚡
**Goal**: Temporarily disable strict rules to unblock development

### Phase 2: Type Definition Creation 🏗️
**Goal**: Create proper TypeScript interfaces/types

### Phase 3: Gradual Migration 🔄
**Goal**: Replace `any` types with proper types file by file

### Phase 4: React Hooks Fixes 🎣
**Goal**: Fix React hooks violations

### Phase 5: Final Cleanup 🧹
**Goal**: Address remaining issues

---

## Phase 1: Immediate Fix (Unblock Commits)

### Option A: Temporarily Disable Rules
Update `eslint.config.js` to allow commits while we fix:

```javascript
// Add to rules section
rules: {
  '@typescript-eslint/no-explicit-any': 'warn', // Change from error to warning
  'react-hooks/rules-of-hooks': 'warn',
  'react-hooks/exhaustive-deps': 'warn',
  '@typescript-eslint/no-empty-object-type': 'warn',
  'react-refresh/only-export-components': 'warn'
}
```

### Option B: Targeted Suppressions
Add `/* eslint-disable @typescript-eslint/no-explicit-any */` to critical files

---

## Phase 2: Type Definition Strategy

### 2.1 Create Core Type Definitions
**Files to create/enhance:**
- `src/types/api.ts` - API response types
- `src/types/user.ts` - User/auth types  
- `src/types/patient.ts` - Patient data types
- `src/types/facility.ts` - Facility types
- `src/types/module.ts` - Module types
- `src/types/testing.ts` - Testing framework types
- `src/types/common.ts` - Common/shared types

### 2.2 Database Schema Types
Enhance existing `src/types/database.ts`:
```typescript
// Replace empty interfaces with proper definitions
export interface Tables {
  users: {
    Row: {
      id: string;
      email: string;
      role: string;
      // ... other fields
    };
    Insert: {
      email: string;
      role?: string;
      // ... 
    };
    Update: {
      email?: string;
      role?: string;
      // ...
    };
  };
  // ... other tables
}
```

---

## Phase 3: File-by-File Migration Priority

### 3.1 High Priority Files (Core Infrastructure)
1. `src/hooks/useCleanAuth.tsx` - 3 errors
2. `src/utils/auth/authStateManager.ts` - 1 error  
3. `src/components/auth/CleanAuthProvider.tsx` - 1 warning
4. `src/types/database.ts` - 2 errors

### 3.2 Medium Priority (API & Data)
1. API Integration files (`src/components/admin/ApiIntegrations/*`)
2. Data import utilities (`src/hooks/useDataImport.tsx`)
3. Patient management (`src/hooks/patients/*`)

### 3.3 Lower Priority (UI Components)
1. Dashboard components
2. Testing components  
3. Verification utilities

---

## Phase 4: React Hooks Fixes

### 4.1 Rules of Hooks Violations
**Files with hook violations:**
- `src/components/admin/Testing/TestingModule.tsx`
- `src/hooks/useOnboardingWorkflow.tsx`
- `src/hooks/useServices.tsx`
- `src/hooks/useTherapies.tsx`

**Fix Pattern:**
```typescript
// ❌ Wrong: Conditional hook usage
if (condition) {
  const data = useQuery(...);
}

// ✅ Correct: Always call hooks
const data = useQuery(..., { enabled: condition });
```

### 4.2 Exhaustive Dependencies
**Common fixes:**
- Add missing dependencies to `useEffect`
- Use `useCallback` for function dependencies
- Extract functions outside component if they don't need props/state

---

## Phase 5: Specific Fix Patterns

### 5.1 API Response Types
```typescript
// ❌ Before
const handleApiCall = (data: any) => { ... }

// ✅ After  
interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

const handleApiCall = (data: ApiResponse<UserData>) => { ... }
```

### 5.2 Event Handlers
```typescript
// ❌ Before
const handleSubmit = (e: any) => { ... }

// ✅ After
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { ... }
```

### 5.3 Supabase Queries
```typescript
// ❌ Before
const { data } = await supabase.from('users').select('*');

// ✅ After
const { data }: { data: Database['public']['Tables']['users']['Row'][] | null } = 
  await supabase.from('users').select('*');
```

---

## Implementation Timeline

### Week 1: Emergency Unblock
- [ ] Update ESLint config to warnings
- [ ] Create core type definitions
- [ ] Fix critical auth/database types

### Week 2: API & Data Layer
- [ ] Fix API integration components
- [ ] Implement proper API response types
- [ ] Fix data import utilities

### Week 3: React Hooks & Components
- [ ] Fix all React hooks violations
- [ ] Type major UI components
- [ ] Address component prop types

### Week 4: Final Cleanup
- [ ] Address remaining warnings
- [ ] Re-enable strict rules gradually
- [ ] Add type checking CI checks

---

## Automated Fix Commands

### 1. Safe Auto-fixes
```bash
# Fix simple issues automatically
npm run lint -- --fix

# Fix React hooks deps (be careful!)
npm run lint -- --fix --rule react-hooks/exhaustive-deps
```

### 2. Type Generation
```bash
# Generate Supabase types
npx supabase gen types typescript --project-id ithspbabhmdntioslfqe > src/types/supabase.ts
```

### 3. Batch Replace Common Patterns
```bash
# Replace simple any usages (review before running!)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/: any\[\]/: unknown[]/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/: any)/: unknown)/g'
```

---

## Risk Mitigation

### Before Starting
1. **Create feature branch**: `git checkout -b fix/eslint-cleanup`
2. **Backup current state**: `git tag pre-eslint-fixes`
3. **Test core functionality** after each phase

### Testing Strategy
1. Run `npm run build` after each major change
2. Test authentication flow
3. Test database operations
4. Verify API integrations still work

### Rollback Plan
```bash
# If issues arise, rollback to previous state
git reset --hard pre-eslint-fixes
```

---

## Success Metrics

### Phase Completion Criteria
- [ ] Phase 1: Commits no longer blocked by linting
- [ ] Phase 2: Core types defined, <500 any usages
- [ ] Phase 3: <100 any usages in critical files  
- [ ] Phase 4: 0 React hooks violations
- [ ] Phase 5: <50 total linting issues

### Final Goal
- **Target**: <10 linting errors total
- **Timeline**: 4 weeks
- **Maintainability**: New code requires proper types

---

*Generated: December 2024*
*Priority: CRITICAL - Blocking Development*