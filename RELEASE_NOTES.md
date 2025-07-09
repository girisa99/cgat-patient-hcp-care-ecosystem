# 📝 Release Notes – 2025-07-09

## 🚀 Highlights
* **Port migration:** Dev server & tunnel relocated from 5173 → **8080**.
* **Multi-tenant support:**
  * Added `TenantProvider`, `useTenant` hook, and `useRBAC` helper.
  * Database schema updated with `tenant_id` column + RLS policies.
  * New SQL migration `20250709182000_multi_tenant_rls.sql`.
* **Branch-aware CI/CD:** GitHub Actions workflow (`ci-cd.yml`) builds, tests, and pushes migrations to schema clones `public_dev`, `public_test`, `public_uat`.
* **Data layer upgrades:**
  * `useMasterData` now fetches real users, facilities, modules, API services.
  * Dashboard counts use live statistics.
* **Cleanup:** Migration `20250709183000_cleanup_test_data.sql` purges mock rows (example.com, Test Facility, etc.).

## 🐛 Fixes
* Stray Vite process on port 8080 terminated; `npm run dev --strictPort` enforced.
* Navigation mismatch for **API Services** resolved – route & page restored.
* Linter/type errors fixed after adding tenant hooks.

## 🏗️ Infrastructure
* Supabase roles `app_anon`, `app_user`, `app_admin` created with granular grants.
* RLS helper function `current_tenant_uuid()` added.
* GitHub Actions caches npm deps, runs lint/tsc/tests, then pushes migrations via `supabase/setup-cli@v1`.

## 💥 Breaking Changes
1. **Env Vars:** `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` are now mandatory for all builds.
2. **Database:** Every shared table now requires a non-NULL `tenant_id`.
3. **Roles:** Front-end JWT must include `tenant_id` and `role` claims.

## 🔮 Upcoming
* Tenant switcher UI for super-admin users.
* Automated tenant bootstrap command.
* Additional RLS policies on new tables (audit_log, documents, etc.).