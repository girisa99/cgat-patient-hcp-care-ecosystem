# 🤝 Contributing Guidelines

Welcome! We appreciate your interest in contributing to this project.

---

## 1. Branch Strategy
| Branch | Purpose | Database Schema |
|--------|---------|-----------------|
| `main` | Production-ready code | `public` |
| `dev`  | Integration branch – daily work merges here | `public_dev` |
| `test` | QA / automated E2E testing | `public_test` |
| `uat`  | Client User-Acceptance Testing | `public_uat` |

Feature branches follow the pattern `feature/<topic>` and merge into **dev** via Pull Request.

---

## 2. Pull Requests
1. Create your branch from **dev**.  
   `git checkout -b feature/awesome-thing dev`
2. Commit using [Conventional Commits](https://www.conventionalcommits.org).  
   Example: `feat(api): add tenant switcher endpoint`
3. Open a PR against **dev**; the template checks:
   * ESLint (npm run lint)
   * TypeScript (`tsc --noEmit`)
   * Unit tests (Vitest)
   * Build (`npm run build`)
   * Supabase migration push to `public_dev`
4. At least one reviewer must approve + all checks green before merge.

---

## 3. Local Setup
```bash
# 1. Install deps
npm ci

# 2. Create .env.local (see .env.example)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# 3. Run dev server on :8080
npm run dev

# 4. (Optional) open tunnel
npm run tunnel
```

---

## 4. Running Tests
```bash
# Unit
npm run test:unit -- --watch

# End-to-end (needs dev server)
E2E_BASE_URL=http://localhost:8080 npm run test:e2e
```

---

## 5. Deployment Flow
| Stage | Trigger | Workflow | Schema |
|-------|---------|----------|--------|
| Dev Preview | `push → dev` | `ci-cd.yml` | `public_dev` |
| Test | `push → test` | `ci-cd.yml` | `public_test` |
| UAT | `push → uat` | `ci-cd.yml` | `public_uat` |
| Production | `push → main` | `main.yml` (npm release) & `ci-cd.yml` | `public` |

Each run of `ci-cd.yml` automatically executes:
1. **Lint → Build → Unit tests**
2. `supabase db push` to the branch's schema (idempotent)
3. Optional deploy step for hosting provider (add your own action).

---

## 6. Coding Standards
* Follow existing ESLint rules (`npm run lint:strict` for full list).
* Prefer functional React components with hooks.
* Avoid `any`; use `@/types/*` or extend as needed.
* Keep **tenant isolation** in mind – every query must respect `tenant_id`.

---

## 7. Need Help?
* Open a Discussion or tag @maintainers in your PR.