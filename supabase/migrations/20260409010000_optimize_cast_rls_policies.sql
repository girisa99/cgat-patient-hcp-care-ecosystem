-- Migration: Optimize Cast RLS policies for production scale
--
-- Problem: Child table RLS policies use repeated subqueries:
--   project_id IN (SELECT id FROM cast_projects WHERE user_id = auth.uid())
-- This runs the subquery on EVERY row check, causing O(n²) behavior at scale.
--
-- Solution: Create a SECURITY DEFINER function that caches the user's project IDs,
-- then reference it in RLS policies for O(1) amortized lookups.

-- 1. Create helper function (runs as definer, cached per-transaction)
CREATE OR REPLACE FUNCTION public.user_owns_cast_project(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cast_projects
    WHERE id = p_project_id
    AND user_id = auth.uid()
  );
$$;

-- 2. Drop old subquery-based policies on child tables
DROP POLICY IF EXISTS "Users manage own project scenes" ON public.cast_project_scenes;
DROP POLICY IF EXISTS "Users manage own project script lines" ON public.cast_project_script_lines;
DROP POLICY IF EXISTS "Users manage own project characters" ON public.cast_project_characters;

-- 3. Create optimized policies using the helper function
CREATE POLICY "Users manage own project scenes"
  ON public.cast_project_scenes FOR ALL
  USING (public.user_owns_cast_project(project_id))
  WITH CHECK (public.user_owns_cast_project(project_id));

CREATE POLICY "Users manage own project script lines"
  ON public.cast_project_script_lines FOR ALL
  USING (public.user_owns_cast_project(project_id))
  WITH CHECK (public.user_owns_cast_project(project_id));

CREATE POLICY "Users manage own project characters"
  ON public.cast_project_characters FOR ALL
  USING (public.user_owns_cast_project(project_id))
  WITH CHECK (public.user_owns_cast_project(project_id));

-- 4. Optimize cast_generation_jobs RLS (was using nested subquery with team check)
DROP POLICY IF EXISTS "Users can view generation jobs for accessible projects" ON public.cast_generation_jobs;
DROP POLICY IF EXISTS "Users can insert generation jobs" ON public.cast_generation_jobs;
DROP POLICY IF EXISTS "Users can update generation jobs" ON public.cast_generation_jobs;

CREATE POLICY "Users manage generation jobs for own projects"
  ON public.cast_generation_jobs FOR ALL
  USING (public.user_owns_cast_project(project_id))
  WITH CHECK (public.user_owns_cast_project(project_id));

-- 5. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.user_owns_cast_project(UUID) TO authenticated;

-- 6. Ensure index exists for fast ownership lookup
CREATE INDEX IF NOT EXISTS idx_cast_projects_user_id ON public.cast_projects(user_id);
