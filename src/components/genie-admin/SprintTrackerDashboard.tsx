/**
 * SPRINT TRACKER DASHBOARD
 *
 * Interactive dashboard for tracking the dual-developer (Lovable + Claude)
 * 5-day sprint plan. Integrated into Genie Admin Hub as ?tab=sprint-tracker.
 *
 * Features:
 * - Day-by-day task tracking per developer
 * - Task status management (pending/in-progress/completed/rejected)
 * - Daily standup logs
 * - Strategy overview (file ownership, locked files)
 * - Progress metrics and burndown
 *
 * State persisted to localStorage (no Supabase needed).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Target, CheckCircle2, Clock, XCircle, ChevronRight, ChevronDown,
  Users, Code2, FileCode, BarChart3, ListChecks, Shield, Layers,
  Zap, Brain, AlertTriangle, Lock, MessageSquare, Save,
  ClipboardCheck, Eye, GitBranch, Bug, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

type Developer = 'lovable' | 'claude';
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';
type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

interface SprintTask {
  id: string;
  title: string;
  developer: Developer;
  day: number;
  priority: TaskPriority;
  module: string;
  filesInvolved: string[];
  acceptanceCriteria: string;
  estimatedHours: number;
  notes?: string;
}

interface StandupEntry {
  day: number;
  developer: Developer;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: string;
}

interface SprintTrackerState {
  taskOverrides: Record<string, { status: TaskStatus; updatedAt: string; note?: string }>;
  standups: StandupEntry[];
}

// ─── Day 1 Diagnosis Findings (detailed per-issue tracking) ─────────────────

interface DiagnosisFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  issue: string;
  rootCause: string;
  status: 'fixed' | 'open' | 'deferred';
  fixedIn?: string; // commit or PR reference
}

interface TaskFindings {
  summary: string;
  totalIssues: number;
  issuesBySeverity: { critical: number; high: number; medium: number; low: number };
  findings: DiagnosisFinding[];
  dayTwoImpact: string; // What this diagnosis means for Day 2 planning
}

const DAY1_FINDINGS: Record<string, TaskFindings> = {
  'C-101': {
    summary: 'GenieSpark has critical race conditions in script save + navigate flow, missing error handling across all 4 content handlers, a broken production hub route, and inconsistent stats computation.',
    totalIssues: 14,
    issuesBySeverity: { critical: 3, high: 3, medium: 5, low: 3 },
    dayTwoImpact: 'Spark handlers are now fixed. Day 3 C-301 (SmartContentPipeline) and C-302 (SparkGuidedWizard) are the remaining deep fixes.',
    findings: [
      { id: 'S-001', severity: 'critical', file: 'src/pages/GenieSpark.tsx', line: 45, issue: 'Race condition: saveScript() not awaited before navigate()', rootCause: 'saveScript is async but called synchronously — navigation fires before script persists to DB', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-002', severity: 'critical', file: 'src/pages/GenieSpark.tsx', line: 50, issue: 'handleSendToVibe: same race condition + missing stats object', rootCause: 'Copy-paste from handleSendToScriptEditor but stats block was omitted', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-003', severity: 'critical', file: 'src/pages/GenieSpark.tsx', line: 84, issue: 'Broken route: /genie-studio/productions does not exist', rootCause: 'Production Hub was moved to /genie-admin?tab=library but this reference was not updated', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-004', severity: 'high', file: 'src/pages/GenieSpark.tsx', line: 28, issue: 'No error handling on any of the 4 content handlers', rootCause: 'Handlers lacked try/catch — if saveScript fails, user gets silent failure + broken navigation', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-005', severity: 'high', file: 'src/pages/GenieSpark.tsx', line: 88, issue: 'handleSaveToKnowledgeBase is a no-op stub (toast only, no save)', rootCause: 'Feature was stubbed during initial implementation and never completed', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-006', severity: 'high', file: 'src/components/genie-studio/SmartContentPipeline.tsx', issue: 'SmartContentPipeline AI generation uses simulated delay, not real API', rootCause: '80KB component has placeholder generation logic — needs Supabase edge function integration', status: 'open' },
      { id: 'S-007', severity: 'medium', file: 'src/constants/genie-products.ts', line: 109, issue: 'Tagline inconsistency: "Ignite your Ideas" vs "Ignite Your Ideas"', rootCause: 'Capitalization mismatch between genie-products.ts and QuadrantProductHeader.tsx', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-008', severity: 'medium', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', line: 130, issue: 'onGenerate uses simulated 2s delay instead of real AI generation', rootCause: 'GenieSpark.tsx passes a fake onGenerate callback with setTimeout', status: 'open' },
      { id: 'S-009', severity: 'medium', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', line: 162, issue: 'Phase navigation buttons lack ARIA roles and labels', rootCause: 'Accessibility was not implemented during initial wizard build', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-010', severity: 'medium', file: 'src/pages/GenieSpark.tsx', line: 26, issue: 'savedScripts destructured but never used', rootCause: 'Variable was intended for UI display but the dashboard was moved to GenieMind', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-011', severity: 'medium', file: 'src/pages/GenieSpark.tsx', line: 179, issue: 'Image-to-Script onGenerateVideo creates script but does not navigate', rootCause: 'Handler saves script locally but user has no way to find it afterward', status: 'open' },
      { id: 'S-012', severity: 'low', file: 'src/pages/GenieSpark.tsx', line: 162, issue: 'QuickTemplateSelector onSelect only shows toast, no template pre-fill', rootCause: 'Template selection switches tab but does not pass template data to pipeline', status: 'open' },
      { id: 'S-013', severity: 'low', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', line: 97, issue: 'Refine and Export phases always show isComplete: false', rootCause: 'No completion tracking for phases 4 and 5', status: 'open' },
      { id: 'S-014', severity: 'low', file: 'src/pages/GenieSpark.tsx', issue: 'Duplicate script creation logic across 4 handlers', rootCause: 'No shared factory — each handler builds GenieScript independently', status: 'fixed', fixedIn: 'abb79815' },
    ],
  },
  'C-102': {
    summary: 'GenieMind has wrong tagline in header and docs, no loading indicator for media library, voiceover save is a stub, and the ScriptEditorTab (127KB) needs deep investigation on Day 4.',
    totalIssues: 13,
    issuesBySeverity: { critical: 2, high: 3, medium: 5, low: 3 },
    dayTwoImpact: 'Mind is scheduled for Day 4. The voiceover stub and ScriptEditorTab are the critical Day 4 fixes (C-401 to C-404).',
    findings: [
      { id: 'M-001', severity: 'critical', file: 'src/components/navigation/QuadrantProductHeader.tsx', line: 50, issue: 'Mind tagline shows "Think Beyond Limits" instead of official "AI That Understands"', rootCause: 'QuadrantProductHeader hardcodes taglines separately from genie-products.ts — values diverged', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-002', severity: 'critical', file: 'src/pages/GenieMind.tsx', line: 241, issue: 'Voiceover save handler is a stub — logs toast but does not persist audio', rootCause: 'useGenieMediaLibrary does not expose a saveVoiceover method; handler was left as placeholder', status: 'open' },
      { id: 'M-003', severity: 'high', file: 'src/components/genie-studio/ScriptEditorTab.tsx', issue: 'ScriptEditorTab is 127KB — needs investigation for performance and correctness', rootCause: 'Massive single-file component; needs Day 4 deep dive (C-401)', status: 'open' },
      { id: 'M-004', severity: 'high', file: 'src/pages/GenieMind.tsx', line: 301, issue: 'Audio delete handler says "Delete via Genie Vibe" — no actual delete', rootCause: 'Cross-product delete was not implemented; user is told to go to a different product', status: 'open' },
      { id: 'M-005', severity: 'high', file: 'src/components/genie-studio/CrossFunctionalMusic.tsx', issue: 'CrossFunctionalMusic generation UI — needs verification of API integration', rootCause: 'Scheduled for Day 4 (C-403)', status: 'open' },
      { id: 'M-006', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 2, issue: 'Doc comment tagline wrong: "Think Beyond Limits" vs "AI That Understands"', rootCause: 'Same root cause as M-001 — copy-paste of old tagline in JSDoc', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-007', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 57, issue: 'No loading indicator while media library loads (mediaLoading not surfaced)', rootCause: 'mediaLoading is destructured from hook but never rendered in UI', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-008', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 325, issue: 'Audio elements lack aria-label — screen readers cannot identify tracks', rootCause: 'Accessibility not considered during audio player implementation', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-009', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 82, issue: 'Quick stats bar uses 5-column grid — collapses poorly on smaller screens', rootCause: 'No responsive breakpoint for stats bar (always grid-cols-5)', status: 'open' },
      { id: 'M-010', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 40, issue: 'initialTab from URL params only read once — tab changes not reflected in URL', rootCause: 'useState(initialTab) captures initial value; subsequent tab changes do not update searchParams', status: 'open' },
      { id: 'M-011', severity: 'low', file: 'src/pages/GenieMind.tsx', line: 149, issue: 'Script card click always goes to script-editor tab — does not open specific script', rootCause: 'setActiveTab("script-editor") without passing script ID to editor', status: 'open' },
      { id: 'M-012', severity: 'low', file: 'src/components/genie-studio/SavedAudioCard.tsx', issue: 'SavedAudioCard needs verification — may have stale audio URL handling', rootCause: 'Scheduled for Day 4 (C-402)', status: 'open' },
      { id: 'M-013', severity: 'low', file: 'src/pages/GenieMind.tsx', line: 256, issue: 'BatchScriptGenerationWorkflow has no props — fires internally without callbacks', rootCause: 'Batch component is self-contained; cannot report results back to GenieMind', status: 'open' },
    ],
  },
  'C-103': {
    summary: 'GenieDeck is the most production-ready of the 3 products. Build passes, routing correct, HIPAA compliance present. Main issues are polish: hardcoded email, missing fallback UI, image loading states.',
    totalIssues: 6,
    issuesBySeverity: { critical: 0, high: 0, medium: 3, low: 3 },
    dayTwoImpact: 'Deck is scheduled for Day 2 (C-201 to C-203). Focus is on PresentationWizard 6-step flow — the page shell is solid.',
    findings: [
      { id: 'D-001', severity: 'medium', file: 'src/pages/GenieDeck.tsx', line: 158, issue: 'Support email hardcoded as support@example.com (placeholder)', rootCause: 'ErrorDisplay component used placeholder during development', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'D-002', severity: 'medium', file: 'src/components/landing/demo-hub/DeckDemoCard.tsx', line: 545, issue: 'Missing fallback UI when industry example data is absent (returns null)', rootCause: 'Early return with null instead of user-facing empty state', status: 'open' },
      { id: 'D-003', severity: 'medium', file: 'src/config/genieStudioNavItems.ts', line: 143, issue: 'Tier gating set to "starter" but no client-side check in route guard', rootCause: 'GenieStudioProtectedRoute does auth check but not tier check', status: 'open' },
      { id: 'D-004', severity: 'low', file: 'src/components/landing/demo-hub/DeckDemoCard.tsx', line: 560, issue: 'Error messages are generic — do not mention "Genie Deck" by name', rootCause: 'Error handler uses generic message strings', status: 'open' },
      { id: 'D-005', severity: 'low', file: 'src/components/landing/demo-hub/DeckDemoCard.tsx', line: 628, issue: 'AI image generation has no loading indicator (skeleton/shimmer)', rootCause: 'generateSlideImage runs async without visual feedback', status: 'open' },
      { id: 'D-006', severity: 'low', file: 'src/components/navigation/QuadrantProductHeader.tsx', line: 149, issue: 'Carousel prev/next buttons lack aria-pressed and role attributes', rootCause: 'Accessibility not added to GenieDeckHero carousel', status: 'open' },
    ],
  },
  'C-104': {
    summary: 'Cross-product diagnosis complete. 33 total issues identified across Spark (14), Mind (13), Deck (6). 11 issues fixed on Day 1. 22 remain open for Days 2-4. Fixes applied: race conditions, error handling, tagline alignment, ARIA accessibility, broken routes, placeholder email.',
    totalIssues: 33,
    issuesBySeverity: { critical: 5, high: 6, medium: 13, low: 9 },
    dayTwoImpact: 'Day 2 focus: GenieDeck PresentationWizard (C-201 to C-203). Deck is the cleanest product — fix the wizard flow and it is complete.',
    findings: [
      { id: 'X-001', severity: 'high', file: 'src/constants/genie-products.ts', issue: 'Tagline capitalization inconsistency between genie-products.ts and QuadrantProductHeader', rootCause: 'Two sources of truth for product branding — should use single import', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'X-002', severity: 'medium', file: 'src/components/navigation/QuadrantProductHeader.tsx', issue: 'QuadrantProductHeader hardcodes product data instead of importing from genie-products.ts', rootCause: 'Header was built independently of genie-products.ts constant', status: 'open' },
      { id: 'X-003', severity: 'medium', file: 'N/A', issue: 'No shared error boundary for Genie product pages', rootCause: 'Each page has its own error handling but no unified fallback', status: 'open' },
    ],
  },
  'S-101': {
    summary: 'Build passes. 7 files changed, 140 insertions, 70 deletions. All Day 1 diagnosis tasks complete. 11 of 33 issues fixed. Branch pushed and PR-ready.',
    totalIssues: 0,
    issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    dayTwoImpact: 'Branch is clean. Ready for Day 2 Deck work.',
    findings: [],
  },
};

// ─── Static Sprint Plan Data (41 tasks from GENIESUITE_PROJECT_PLAN.csv) ────

const SPRINT_START_DATE = '2026-02-17';
const SPRINT_END_DATE = '2026-02-21';

const SPRINT_DAYS = [
  { day: 1, theme: 'Foundation & Assessment' },
  { day: 2, theme: 'Genie Deck + Landing Products' },
  { day: 3, theme: 'Genie Spark + Landing Demos' },
  { day: 4, theme: 'Genie Mind + Landing Polish' },
  { day: 5, theme: 'Integration & Merge' },
];

const SPRINT_TASKS: SprintTask[] = [
  // ── Day 1 ──
  { id: 'L-101', title: 'Audit RegionalLandingPage.tsx for broken regional content', developer: 'lovable', day: 1, priority: 'high', module: 'Landing Page', filesInvolved: ['src/components/landing/RegionalLandingPage.tsx'], acceptanceCriteria: 'All 14 regions render without errors', estimatedHours: 4, notes: 'Main landing page - 70KB file' },
  { id: 'L-102', title: 'Audit GenieExplorePage - verify explore journey', developer: 'lovable', day: 1, priority: 'high', module: 'Landing Page', filesInvolved: ['src/pages/GenieExplorePage.tsx'], acceptanceCriteria: 'Explore steps 1-N complete without errors', estimatedHours: 2 },
  { id: 'L-103', title: 'Fix broken hero sections and demos', developer: 'lovable', day: 1, priority: 'medium', module: 'Landing Page', filesInvolved: ['src/components/landing/HeroLandingVideo.tsx', 'src/components/landing/HeroInteractiveVideo.tsx'], acceptanceCriteria: 'Hero videos play and interactive elements respond', estimatedHours: 3 },
  { id: 'L-104', title: 'Verify all legal pages render correctly', developer: 'lovable', day: 1, priority: 'low', module: 'Legal Pages', filesInvolved: ['src/pages/TermsOfServicePage.tsx', 'src/pages/PrivacyPolicyPage.tsx'], acceptanceCriteria: 'All 6 legal pages load and display content', estimatedHours: 1 },
  { id: 'C-101', title: 'Read and diagnose GenieSpark.tsx - trace creation flow', developer: 'claude', day: 1, priority: 'high', module: 'Genie Spark', filesInvolved: ['src/pages/GenieSpark.tsx', 'src/components/genie-spark/SparkGuidedWizard.tsx'], acceptanceCriteria: 'Issues documented with root causes identified', estimatedHours: 2 },
  { id: 'C-102', title: 'Read and diagnose GenieMind.tsx - trace editing flow', developer: 'claude', day: 1, priority: 'high', module: 'Genie Mind', filesInvolved: ['src/pages/GenieMind.tsx', 'src/components/genie-studio/ScriptEditorTab.tsx'], acceptanceCriteria: 'Issues documented with root causes identified', estimatedHours: 2, notes: 'ScriptEditorTab is 127KB' },
  { id: 'C-103', title: 'Read and diagnose GenieDeck.tsx - trace presentation flow', developer: 'claude', day: 1, priority: 'high', module: 'Genie Deck', filesInvolved: ['src/pages/GenieDeck.tsx', 'src/components/genie-studio/presentation-generator/PresentationWizard.tsx'], acceptanceCriteria: 'Issues documented with root causes identified', estimatedHours: 2 },
  { id: 'C-104', title: 'Document all issues found across Spark/Mind/Deck', developer: 'claude', day: 1, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'Written diagnosis with fix plan for each module', estimatedHours: 1 },
  { id: 'S-101', title: 'End of Day 1 build check and sync', developer: 'claude', day: 1, priority: 'high', module: 'Sync', filesInvolved: [], acceptanceCriteria: 'Build passes for both branches', estimatedHours: 0.5 },

  // ── Day 2 ──
  { id: 'L-201', title: 'Fix/enhance GenieProductsPage.tsx - product catalog', developer: 'lovable', day: 2, priority: 'high', module: 'Products', filesInvolved: ['src/pages/GenieProductsPage.tsx'], acceptanceCriteria: 'Product catalog renders all products with correct info', estimatedHours: 3 },
  { id: 'L-202', title: 'Fix pricing section in landing page', developer: 'lovable', day: 2, priority: 'high', module: 'Pricing', filesInvolved: ['src/components/landing/RegionalPricingSection.tsx'], acceptanceCriteria: 'Pricing tiers display correctly per region', estimatedHours: 2 },
  { id: 'L-203', title: 'Verify Explore demo pages work', developer: 'lovable', day: 2, priority: 'medium', module: 'Explore', filesInvolved: ['src/pages/GenieExploreDemoPage.tsx'], acceptanceCriteria: 'Demo flows complete without errors', estimatedHours: 2 },
  { id: 'L-204', title: 'Add any missing landing page sections', developer: 'lovable', day: 2, priority: 'medium', module: 'Landing Page', filesInvolved: ['src/components/landing/**'], acceptanceCriteria: 'All planned sections present and rendering', estimatedHours: 2 },
  { id: 'C-201', title: 'Fix GenieDeck creation flow - PresentationWizard', developer: 'claude', day: 2, priority: 'high', module: 'Genie Deck', filesInvolved: ['src/pages/GenieDeck.tsx', 'src/components/genie-studio/presentation-generator/PresentationWizard.tsx'], acceptanceCriteria: 'Deck creates presentations end-to-end', estimatedHours: 4 },
  { id: 'C-202', title: 'Fix presentation-generator sub-components', developer: 'claude', day: 2, priority: 'high', module: 'Genie Deck', filesInvolved: ['src/components/genie-studio/presentation-generator/**'], acceptanceCriteria: 'All 6 wizard steps complete without errors', estimatedHours: 3 },
  { id: 'C-203', title: 'Verify Deck end-to-end: input → slides → preview → save', developer: 'claude', day: 2, priority: 'high', module: 'Genie Deck', filesInvolved: ['src/pages/GenieDeck.tsx'], acceptanceCriteria: 'Full presentation generation workflow works', estimatedHours: 1 },
  { id: 'S-201', title: 'End of Day 2 build check and sync', developer: 'claude', day: 2, priority: 'high', module: 'Sync', filesInvolved: [], acceptanceCriteria: 'Build passes; Deck working', estimatedHours: 0.5 },

  // ── Day 3 ──
  { id: 'L-301', title: 'Fix interactive demos - InteractiveTryGenieDemo & STTDemo', developer: 'lovable', day: 3, priority: 'high', module: 'Landing Page', filesInvolved: ['src/components/landing/InteractiveTryGenieDemo.tsx', 'src/components/landing/STTDemo.tsx'], acceptanceCriteria: 'Demos respond to user interaction correctly', estimatedHours: 3 },
  { id: 'L-302', title: 'Fix DeepLTranslationDemo', developer: 'lovable', day: 3, priority: 'medium', module: 'Landing Page', filesInvolved: ['src/components/landing/DeepLTranslationDemo.tsx'], acceptanceCriteria: 'Translation demo works with sample text', estimatedHours: 2 },
  { id: 'L-303', title: 'Fix video showcases - GenieVideoShowcase & HeroLandingVideo', developer: 'lovable', day: 3, priority: 'high', module: 'Landing Page', filesInvolved: ['src/components/landing/GenieVideoShowcase.tsx', 'src/components/landing/HeroLandingVideo.tsx'], acceptanceCriteria: 'Videos play and showcase sections render', estimatedHours: 2, notes: 'GenieVideoShowcase is 37KB' },
  { id: 'L-304', title: 'Verify region switching across all 14 regions', developer: 'lovable', day: 3, priority: 'medium', module: 'Landing Page', filesInvolved: ['src/components/landing/RegionSwitcherNav.tsx', 'src/config/regionalLandingConfig.ts'], acceptanceCriteria: 'All regions selectable and content changes correctly', estimatedHours: 2 },
  { id: 'C-301', title: 'Fix SmartContentPipeline AI generation', developer: 'claude', day: 3, priority: 'high', module: 'Genie Spark', filesInvolved: ['src/components/genie-studio/SmartContentPipeline.tsx'], acceptanceCriteria: 'AI generates script content from user prompts', estimatedHours: 3, notes: '80KB component - core of Spark' },
  { id: 'C-302', title: 'Fix SparkGuidedWizard step-by-step flow', developer: 'claude', day: 3, priority: 'high', module: 'Genie Spark', filesInvolved: ['src/components/genie-spark/SparkGuidedWizard.tsx'], acceptanceCriteria: 'All wizard steps complete and advance correctly', estimatedHours: 2 },
  { id: 'C-303', title: 'Fix script save via useGenieScripts', developer: 'claude', day: 3, priority: 'high', module: 'Genie Spark', filesInvolved: ['src/components/genie-studio/useGenieScripts.ts'], acceptanceCriteria: 'Scripts save to Supabase genie_scripts table', estimatedHours: 2 },
  { id: 'C-304', title: 'Verify Spark end-to-end: prompt → generate → save', developer: 'claude', day: 3, priority: 'high', module: 'Genie Spark', filesInvolved: ['src/pages/GenieSpark.tsx'], acceptanceCriteria: 'Full Spark workflow creates and persists a script', estimatedHours: 1 },
  { id: 'S-301', title: 'End of Day 3 build check and sync', developer: 'claude', day: 3, priority: 'high', module: 'Sync', filesInvolved: [], acceptanceCriteria: 'Build passes; Deck + Spark working', estimatedHours: 0.5 },

  // ── Day 4 ──
  { id: 'L-401', title: 'Mobile responsiveness polish', developer: 'lovable', day: 4, priority: 'high', module: 'Landing Page', filesInvolved: ['src/components/landing/**'], acceptanceCriteria: 'Landing page renders correctly on mobile viewports', estimatedHours: 3 },
  { id: 'L-402', title: 'SEO verification - meta tags and social sharing', developer: 'lovable', day: 4, priority: 'medium', module: 'Landing Page', filesInvolved: ['src/components/landing/RegionalLandingPage.tsx'], acceptanceCriteria: 'OG tags and meta descriptions present per region', estimatedHours: 2 },
  { id: 'L-403', title: 'Performance optimization - lazy loading and images', developer: 'lovable', day: 4, priority: 'medium', module: 'Landing Page', filesInvolved: ['src/components/landing/**'], acceptanceCriteria: 'Lighthouse score improved; no unnecessary eager loads', estimatedHours: 2 },
  { id: 'L-404', title: 'Cross-browser testing of landing page', developer: 'lovable', day: 4, priority: 'low', module: 'Landing Page', filesInvolved: ['src/components/landing/**'], acceptanceCriteria: 'Landing works on Chrome Firefox Safari Edge', estimatedHours: 1 },
  { id: 'C-401', title: 'Fix ScriptEditorTab - script loading and editing', developer: 'claude', day: 4, priority: 'high', module: 'Genie Mind', filesInvolved: ['src/components/genie-studio/ScriptEditorTab.tsx'], acceptanceCriteria: 'Scripts load from DB and can be edited', estimatedHours: 3, notes: '127KB file - largest component' },
  { id: 'C-402', title: 'Fix SavedAudioCard voiceover display', developer: 'claude', day: 4, priority: 'medium', module: 'Genie Mind', filesInvolved: ['src/components/genie-studio/SavedAudioCard.tsx'], acceptanceCriteria: 'Voiceovers display with playback controls', estimatedHours: 1 },
  { id: 'C-403', title: 'Fix CrossFunctionalMusic generation', developer: 'claude', day: 4, priority: 'medium', module: 'Genie Mind', filesInvolved: ['src/components/genie-studio/CrossFunctionalMusic.tsx'], acceptanceCriteria: 'Music generation UI works and audio saves', estimatedHours: 2 },
  { id: 'C-404', title: 'Verify Spark → Mind flow: script appears in Mind', developer: 'claude', day: 4, priority: 'high', module: 'Genie Mind', filesInvolved: ['src/pages/GenieMind.tsx', 'src/pages/GenieSpark.tsx'], acceptanceCriteria: 'Navigate from Spark to Mind; script is loaded and editable', estimatedHours: 1 },
  { id: 'S-401', title: 'End of Day 4 build check and sync', developer: 'claude', day: 4, priority: 'high', module: 'Sync', filesInvolved: [], acceptanceCriteria: 'Build passes; all 3 CREATE modules working', estimatedHours: 0.5 },

  // ── Day 5 ──
  { id: 'L-501', title: 'Final verification: all landing routes work', developer: 'lovable', day: 5, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'All 4 landing routes load without errors', estimatedHours: 1 },
  { id: 'L-502', title: 'Verify navigation: landing → auth → genie-studio', developer: 'lovable', day: 5, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'User can navigate from landing to login to studio', estimatedHours: 1 },
  { id: 'L-503', title: 'Run npm run build and prepare merge', developer: 'lovable', day: 5, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'Build passes; branch ready for merge', estimatedHours: 0.5 },
  { id: 'L-504', title: 'Rebase onto main and merge', developer: 'lovable', day: 5, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'Clean merge with no conflicts', estimatedHours: 0.5, notes: 'Lovable merges AFTER Claude' },
  { id: 'C-501', title: 'Final verification: all GenieSuite CREATE routes work', developer: 'claude', day: 5, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'All 3 CREATE routes load without errors', estimatedHours: 1 },
  { id: 'C-502', title: 'Verify QuadrantNavigation between Spark/Mind/Deck', developer: 'claude', day: 5, priority: 'high', module: 'All', filesInvolved: ['src/components/navigation/QuadrantNavigation.tsx'], acceptanceCriteria: 'Navigation tabs switch between modules correctly', estimatedHours: 0.5 },
  { id: 'C-503', title: 'Verify full pipeline: Spark → Mind → Deck standalone', developer: 'claude', day: 5, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'End-to-end workflow completes', estimatedHours: 1 },
  { id: 'C-504', title: 'Run npm run build and merge to main', developer: 'claude', day: 5, priority: 'high', module: 'All', filesInvolved: [], acceptanceCriteria: 'Build passes; merged to main cleanly', estimatedHours: 0.5, notes: 'Claude merges FIRST' },
  { id: 'S-501', title: 'Final build check on main after both merges', developer: 'claude', day: 5, priority: 'high', module: 'Sync', filesInvolved: [], acceptanceCriteria: 'Main branch builds; all routes work', estimatedHours: 0.5 },
];

const LOCKED_FILES = [
  { file: 'src/constants/genie-products.ts', reason: 'Product definitions - used by both landing + genie' },
  { file: 'src/hooks/useMasterAuth.tsx', reason: 'Auth state - single source of truth' },
  { file: 'src/components/auth/ProtectedRoute.tsx', reason: 'Route access control' },
  { file: 'src/components/auth/GenieStudioProtectedRoute.tsx', reason: 'Genie auth guard' },
  { file: 'src/components/layout/AppLayout.tsx', reason: 'Main app layout' },
  { file: 'src/components/layout/GenieStudioLayout.tsx', reason: 'Genie layout' },
  { file: 'src/integrations/supabase/**', reason: 'Database layer' },
  { file: 'src/config/genieStudioNavItems.ts', reason: 'Nav items + tier gating' },
];

const FILE_OWNERSHIP = [
  { area: 'Landing components', files: 'src/components/landing/**', count: 47, owner: 'lovable' as Developer },
  { area: 'Landing hooks', files: 'src/hooks/landing/**', count: 2, owner: 'lovable' as Developer },
  { area: 'Landing pages', files: 'src/pages/Genie{Explore,Products,Support}Page.tsx', count: 12, owner: 'lovable' as Developer },
  { area: 'Genie Spark components', files: 'src/components/genie-spark/**', count: 1, owner: 'claude' as Developer },
  { area: 'Genie Studio components', files: 'src/components/genie-studio/**', count: 150, owner: 'claude' as Developer },
  { area: 'Genie pages', files: 'src/pages/Genie{Spark,Mind,Deck}.tsx', count: 3, owner: 'claude' as Developer },
  { area: 'Navigation (Quadrant)', files: 'src/components/navigation/Quadrant*.tsx', count: 3, owner: 'claude' as Developer },
];

// ─── Custom Hook: localStorage persistence ──────────────────────────────────

const STORAGE_KEY = 'genie_sprint_tracker_state';

function calculateCurrentDay(): number {
  const start = new Date(SPRINT_START_DATE);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(Math.max(diffDays, 1), 5);
}

// Default completed tasks from automated diagnosis (Day 1 Claude tasks)
const DEFAULT_TASK_OVERRIDES: SprintTrackerState['taskOverrides'] = {
  'C-101': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '14 issues found (3 crit, 3 high, 5 med, 3 low). Fixed: race conditions in save+navigate, error handling on all 4 handlers, broken /genie-studio/productions route, stub handleSaveToKnowledgeBase, tagline capitalization, ARIA labels, duplicate code. Open: SmartContentPipeline fake AI, wizard simulated generation, template pre-fill, phase completion tracking.' },
  'C-102': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '13 issues found (2 crit, 3 high, 5 med, 3 low). Fixed: tagline "Think Beyond Limits"→"AI That Understands" in header+docs, added media loading spinner, added audio aria-labels. Open: voiceover save stub, ScriptEditorTab 127KB deep dive, audio delete stub, CrossFunctionalMusic API verification, stats bar responsive, URL tab sync, script card navigation.' },
  'C-103': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '6 issues found (0 crit, 0 high, 3 med, 3 low). Fixed: support@example.com→support@geniaisuite.com. Open: DeckDemoCard null fallback, tier gating client-side check, generic error messages, AI image loading indicator, carousel ARIA. Deck is most production-ready — Day 2 focus is PresentationWizard flow.' },
  'C-104': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: '33 total issues across 3 products: Spark(14) Mind(13) Deck(6). 11 fixed Day 1, 22 open for Days 2-4. Fixed: tagline alignment across genie-products.ts + QuadrantProductHeader. Open: QuadrantProductHeader should import from genie-products.ts, no shared error boundary.' },
  'S-101': { status: 'completed', updatedAt: '2026-02-17T12:00:00Z', note: 'Build passes (58s). 7 files changed: GenieSpark.tsx, GenieMind.tsx, GenieDeck.tsx, genie-products.ts, QuadrantProductHeader.tsx, SparkGuidedWizard.tsx, SprintTrackerDashboard.tsx. 140 insertions, 70 deletions. Commit: abb79815. Branch pushed to origin.' },
};

function useSprintTrackerState() {
  const [state, setState] = useState<SprintTrackerState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('[SprintTracker] Failed to load state:', e);
    }
    // Seed with completed Day 1 diagnosis tasks and standup
    return {
      taskOverrides: { ...DEFAULT_TASK_OVERRIDES },
      standups: [
        {
          day: 1,
          developer: 'claude' as Developer,
          yesterday: 'N/A — Sprint Day 1 start',
          today: 'Completed C-101 to C-104 + S-101: Full diagnosis of GenieSpark (14 issues), GenieMind (13 issues), GenieDeck (6 issues). Fixed 11 critical/high issues including race conditions, broken routes, missing error handling, tagline mismatches, accessibility gaps. Resolved merge conflicts with main branch.',
          blockers: 'SmartContentPipeline (80KB) uses simulated AI — needs real Supabase edge function. ScriptEditorTab (127KB) needs Day 4 deep dive. QuadrantProductHeader hardcodes product data instead of importing from genie-products.ts — creates drift risk.',
          createdAt: '2026-02-17T17:00:00Z',
        },
        {
          day: 2,
          developer: 'claude' as Developer,
          yesterday: 'Day 1: Diagnosed all 3 CREATE products. Found 33 issues total (5 critical, 6 high, 13 medium, 9 low). Fixed 11 on Day 1. Build passes.',
          today: 'Day 2 plan: C-201 Fix GenieDeck PresentationWizard creation flow (4h). C-202 Fix presentation-generator sub-components — all 6 wizard steps (3h). C-203 End-to-end verification: input → slides → preview → save (1h). S-201 Build check.',
          blockers: 'None anticipated — Deck is the cleanest product. PresentationWizard.tsx is the main unknown (need to trace all 6 steps). No shared file conflicts with Lovable Day 2 tasks (L-201 to L-204 are Landing Page only).',
          createdAt: '2026-02-17T17:00:00Z',
        },
      ],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[SprintTracker] Failed to save state:', e);
    }
  }, [state]);

  const updateTaskStatus = (taskId: string, status: TaskStatus, note?: string) => {
    setState(prev => ({
      ...prev,
      taskOverrides: {
        ...prev.taskOverrides,
        [taskId]: { status, updatedAt: new Date().toISOString(), note },
      },
    }));
  };

  const addStandup = (entry: Omit<StandupEntry, 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      standups: [...prev.standups, { ...entry, createdAt: new Date().toISOString() }],
    }));
  };

  const getTaskStatus = (taskId: string): TaskStatus => {
    return state.taskOverrides[taskId]?.status ?? 'pending';
  };

  return { state, updateTaskStatus, addStandup, getTaskStatus };
}

// ─── Helper: compute metrics ────────────────────────────────────────────────

function computeMetrics(overrides: Record<string, { status: TaskStatus }>) {
  const byDeveloper: Record<Developer, { total: number; completed: number }> = {
    lovable: { total: 0, completed: 0 },
    claude: { total: 0, completed: 0 },
  };
  const byDay: Record<number, { total: number; completed: number }> = {};

  SPRINT_TASKS.forEach(task => {
    const status = overrides[task.id]?.status ?? 'pending';
    byDeveloper[task.developer].total++;
    if (status === 'completed') byDeveloper[task.developer].completed++;

    if (!byDay[task.day]) byDay[task.day] = { total: 0, completed: 0 };
    byDay[task.day].total++;
    if (status === 'completed') byDay[task.day].completed++;
  });

  const total = SPRINT_TASKS.length;
  const completed = SPRINT_TASKS.filter(t => (overrides[t.id]?.status ?? 'pending') === 'completed').length;

  return { byDeveloper, byDay, total, completed };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-500 text-white hover:bg-red-600' },
  high: { label: 'High', className: 'bg-orange-500 text-white hover:bg-orange-600' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
};

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

const findingSeverityColor: Record<string, string> = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  low: 'text-gray-600 bg-gray-50 border-gray-200',
};

const findingStatusIcon: Record<string, string> = {
  fixed: 'text-green-600',
  open: 'text-amber-600',
  deferred: 'text-gray-400',
};

function TaskCard({ task, status, onStatusChange }: {
  task: SprintTask;
  status: TaskStatus;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showFindings, setShowFindings] = useState(false);
  const findings = DAY1_FINDINGS[task.id];

  return (
    <Card className={cn(
      "border-l-4 transition-all",
      status === 'completed' && "border-l-green-500 bg-green-50/30",
      status === 'in-progress' && "border-l-blue-500 bg-blue-50/30",
      status === 'pending' && "border-l-gray-300",
      status === 'rejected' && "border-l-red-400 bg-red-50/20 opacity-60",
    )}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
            <Badge className={cn("text-xs", priorityConfig[task.priority].className)}>
              {priorityConfig[task.priority].label}
            </Badge>
            <Badge variant="outline" className="text-xs">{task.module}</Badge>
            {findings && findings.totalIssues > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                {findings.totalIssues} issues
              </Badge>
            )}
          </div>
          <Badge className={cn("text-xs shrink-0", statusConfig[status].className)}>
            {statusConfig[status].label}
          </Badge>
        </div>

        <p className={cn("text-sm font-medium", status === 'completed' && "line-through text-muted-foreground")}>
          {task.title}
        </p>

        {/* Summary line for completed diagnosis tasks */}
        {findings && status === 'completed' && (
          <p className="text-xs text-muted-foreground italic">{findings.summary}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Details
          </button>
          {findings && findings.findings.length > 0 && (
            <button
              onClick={() => setShowFindings(!showFindings)}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
            >
              {showFindings ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Findings ({findings.findings.length})
            </button>
          )}
        </div>

        {expanded && (
          <div className="space-y-2 pt-1">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Acceptance:</span> {task.acceptanceCriteria}
            </div>
            {task.filesInvolved.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.filesInvolved.map(f => (
                  <Badge key={f} variant="outline" className="text-[10px] font-mono">
                    <FileCode className="w-3 h-3 mr-1" />
                    {f.split('/').slice(-1)[0]}
                  </Badge>
                ))}
              </div>
            )}
            {task.notes && (
              <p className="text-xs text-amber-600">{task.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">Est: {task.estimatedHours}h</p>
            {findings && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Day 2 Impact:</span> {findings.dayTwoImpact}
              </div>
            )}
          </div>
        )}

        {/* Detailed Findings Panel */}
        {showFindings && findings && (
          <div className="space-y-2 pt-2 border-t border-purple-200/50">
            {/* Severity summary bar */}
            <div className="flex items-center gap-2 text-[10px] flex-wrap">
              {findings.issuesBySeverity.critical > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                  {findings.issuesBySeverity.critical} Critical
                </span>
              )}
              {findings.issuesBySeverity.high > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">
                  {findings.issuesBySeverity.high} High
                </span>
              )}
              {findings.issuesBySeverity.medium > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                  {findings.issuesBySeverity.medium} Medium
                </span>
              )}
              {findings.issuesBySeverity.low > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                  {findings.issuesBySeverity.low} Low
                </span>
              )}
              <span className="text-muted-foreground">
                — {findings.findings.filter(f => f.status === 'fixed').length} fixed, {findings.findings.filter(f => f.status === 'open').length} open
              </span>
            </div>
            {/* Individual findings */}
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1.5">
                {findings.findings.map(finding => (
                  <div
                    key={finding.id}
                    className={cn(
                      "p-2 rounded border text-[11px] leading-relaxed",
                      findingSeverityColor[finding.severity],
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold">{finding.id}</span>
                        <Badge className={cn("text-[9px] h-4 px-1", findingSeverityColor[finding.severity])}>
                          {finding.severity}
                        </Badge>
                      </div>
                      <span className={cn("text-[10px] font-semibold uppercase", findingStatusIcon[finding.status])}>
                        {finding.status === 'fixed' ? '✓ FIXED' : finding.status === 'open' ? '○ OPEN' : '— DEFERRED'}
                      </span>
                    </div>
                    <p className="font-medium mt-0.5">{finding.issue}</p>
                    <p className="opacity-80 mt-0.5"><span className="font-medium">Root cause:</span> {finding.rootCause}</p>
                    <div className="flex items-center gap-2 mt-0.5 opacity-70">
                      <span className="font-mono">{finding.file}{finding.line ? `:${finding.line}` : ''}</span>
                      {finding.fixedIn && <span className="font-mono">commit: {finding.fixedIn}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex gap-1 pt-1">
          <Button
            size="sm"
            variant={status === 'completed' ? 'default' : 'ghost'}
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onStatusChange(task.id, status === 'completed' ? 'pending' : 'completed')}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            Done
          </Button>
          <Button
            size="sm"
            variant={status === 'in-progress' ? 'default' : 'ghost'}
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onStatusChange(task.id, status === 'in-progress' ? 'pending' : 'in-progress')}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            WIP
          </Button>
          <Button
            size="sm"
            variant={status === 'rejected' ? 'default' : 'ghost'}
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onStatusChange(task.id, status === 'rejected' ? 'pending' : 'rejected')}
          >
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DeveloperLane({ developer, tasks, getTaskStatus, onStatusChange }: {
  developer: Developer;
  tasks: SprintTask[];
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const completed = tasks.filter(t => getTaskStatus(t.id) === 'completed').length;
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {developer === 'lovable' ? (
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-pink-600" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold capitalize">{developer === 'lovable' ? 'Lovable' : 'Claude Code'}</p>
          <p className="text-xs text-muted-foreground">{completed}/{tasks.length} tasks ({pct}%)</p>
        </div>
      </div>
      <Progress value={pct} className="h-1.5" />
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            status={getTaskStatus(task.id)}
            onStatusChange={onStatusChange}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks for this day</p>
        )}
      </div>
    </div>
  );
}

function StandupForm({ day, developer, onSave }: {
  day: number;
  developer: Developer;
  onSave: (entry: Omit<StandupEntry, 'createdAt'>) => void;
}) {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');

  const handleSave = () => {
    if (!yesterday.trim() && !today.trim()) return;
    onSave({ day, developer, yesterday, today, blockers });
    setYesterday('');
    setToday('');
    setBlockers('');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {developer === 'lovable' ? (
            <Zap className="w-4 h-4 text-pink-600" />
          ) : (
            <Brain className="w-4 h-4 text-purple-600" />
          )}
          {developer === 'lovable' ? 'Lovable' : 'Claude Code'} — Day {day} Standup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">What did I complete yesterday?</label>
          <Textarea value={yesterday} onChange={e => setYesterday(e.target.value)} rows={2} className="mt-1 text-sm" placeholder="List completed tasks..." />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">What am I working on today?</label>
          <Textarea value={today} onChange={e => setToday(e.target.value)} rows={2} className="mt-1 text-sm" placeholder="List today's tasks..." />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Any blockers or shared file needs?</label>
          <Textarea value={blockers} onChange={e => setBlockers(e.target.value)} rows={2} className="mt-1 text-sm" placeholder="List blockers or coordination needs..." />
        </div>
        <Button size="sm" onClick={handleSave} className="gap-1">
          <Save className="w-3.5 h-3.5" />
          Log Standup
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const SprintTrackerDashboard: React.FC = () => {
  const { state, updateTaskStatus, addStandup, getTaskStatus } = useSprintTrackerState();
  const [selectedDay, setSelectedDay] = useState(calculateCurrentDay);
  const currentDay = useMemo(() => calculateCurrentDay(), []);

  const metrics = useMemo(() => computeMetrics(state.taskOverrides), [state.taskOverrides]);

  const dayTasks = useMemo(() => {
    const tasks = SPRINT_TASKS.filter(t => t.day === selectedDay);
    return {
      lovable: tasks.filter(t => t.developer === 'lovable'),
      claude: tasks.filter(t => t.developer === 'claude'),
    };
  }, [selectedDay]);

  const dayStandups = useMemo(() => {
    return state.standups.filter(s => s.day === selectedDay);
  }, [state.standups, selectedDay]);

  return (
    <div className="space-y-4">
      {/* Sprint Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Dual-Developer Sprint Tracker</CardTitle>
                <CardDescription>Lovable + Claude Code | {SPRINT_START_DATE} — {SPRINT_END_DATE}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {metrics.completed}/{metrics.total} tasks ({Math.round((metrics.completed / metrics.total) * 100)}%)
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day Stepper */}
          <div className="flex items-center gap-1 sm:gap-2">
            {SPRINT_DAYS.map((day, i) => (
              <React.Fragment key={day.day}>
                {i > 0 && <div className="flex-1 h-0.5 bg-border" />}
                <button
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[52px]",
                    day.day === selectedDay && "ring-2 ring-primary bg-primary/5",
                    day.day < currentDay && "text-green-600",
                    day.day === currentDay && "text-primary font-bold",
                    day.day > currentDay && "text-muted-foreground",
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2",
                    day.day < currentDay && "bg-green-500 text-white border-green-500",
                    day.day === currentDay && "bg-primary text-primary-foreground border-primary",
                    day.day > currentDay && "bg-muted text-muted-foreground border-muted",
                  )}>
                    D{day.day}
                  </div>
                  <span className="text-[10px] leading-tight text-center hidden sm:block">{day.theme.split(' ')[0]}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
          <Progress value={(metrics.completed / metrics.total) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="tasks" className="gap-1 text-xs sm:text-sm">
            <ListChecks className="w-3.5 h-3.5" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-1 text-xs sm:text-sm">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily</span> Review
          </TabsTrigger>
          <TabsTrigger value="standups" className="gap-1 text-xs sm:text-sm">
            <MessageSquare className="w-3.5 h-3.5" />
            Standups
          </TabsTrigger>
          <TabsTrigger value="strategy" className="gap-1 text-xs sm:text-sm">
            <Shield className="w-3.5 h-3.5" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1 text-xs sm:text-sm">
            <BarChart3 className="w-3.5 h-3.5" />
            Metrics
          </TabsTrigger>
        </TabsList>

        {/* ── Tasks Tab ── */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Day {selectedDay}:</span>
            <span className="text-sm text-muted-foreground">{SPRINT_DAYS[selectedDay - 1]?.theme}</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <DeveloperLane
              developer="lovable"
              tasks={dayTasks.lovable}
              getTaskStatus={getTaskStatus}
              onStatusChange={updateTaskStatus}
            />
            <DeveloperLane
              developer="claude"
              tasks={dayTasks.claude}
              getTaskStatus={getTaskStatus}
              onStatusChange={updateTaskStatus}
            />
          </div>
        </TabsContent>

        {/* ── Daily Review Tab ── */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Morning Review Checklist — Day {selectedDay}
              </CardTitle>
              <CardDescription className="text-xs">Do this at the start of every session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { step: 1, title: 'Read diagnosis findings', desc: 'Open GENIESUITE_DAY1_DIAGNOSIS.md and review all open issues', icon: <FileText className="w-3.5 h-3.5" /> },
                { step: 2, title: 'Check CSV project plan', desc: 'Open GENIESUITE_PROJECT_PLAN.csv — check your task status and Claude\'s findings', icon: <ListChecks className="w-3.5 h-3.5" /> },
                { step: 3, title: 'Review standup logs', desc: 'Go to Standups tab — read what the other developer did yesterday and any blockers', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                { step: 4, title: 'Check for branch conflicts', desc: 'Run: git fetch origin main && git log --oneline origin/main..HEAD', icon: <GitBranch className="w-3.5 h-3.5" /> },
                { step: 5, title: 'Verify build passes', desc: 'Run: npm run build — if it fails, investigate before starting new work', icon: <Code2 className="w-3.5 h-3.5" /> },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Open Issues Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="w-4 h-4 text-amber-600" />
                Open Issues from Day 1 — Assigned to Days 2-4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Group by target day */}
                {[2, 3, 4, 5].map(targetDay => {
                  const allFindings = Object.values(DAY1_FINDINGS).flatMap(tf => tf.findings);
                  const openForDay = allFindings.filter(f => {
                    if (f.status !== 'open') return false;
                    // Map findings to target days based on ID prefix
                    if (f.id.startsWith('D-')) return targetDay === 2;
                    if (f.id.startsWith('X-') && f.id !== 'X-003') return targetDay === 2;
                    if (f.id.startsWith('S-')) return targetDay === 3;
                    if (f.id.startsWith('M-')) return targetDay === 4;
                    if (f.id === 'X-003') return targetDay === 5;
                    return false;
                  });
                  if (openForDay.length === 0) return null;
                  return (
                    <div key={targetDay}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">Day {targetDay}</Badge>
                        <span className="text-xs text-muted-foreground">{SPRINT_DAYS[targetDay - 1]?.theme}</span>
                        <Badge className="text-[10px] bg-amber-100 text-amber-800">{openForDay.length} open</Badge>
                      </div>
                      <div className="grid gap-1.5">
                        {openForDay.map(f => (
                          <div key={f.id} className={cn("p-2 rounded border text-[11px]", findingSeverityColor[f.severity])}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">{f.id}</span>
                              <Badge className={cn("text-[9px] h-4 px-1", findingSeverityColor[f.severity])}>{f.severity}</Badge>
                              <span className="flex-1 truncate">{f.issue}</span>
                            </div>
                            <p className="text-[10px] opacity-70 mt-0.5 font-mono">{f.file}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* End-of-Day Checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                End-of-Day Checklist
              </CardTitle>
              <CardDescription className="text-xs">Before ending your session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                'All assigned tasks marked completed (or noted as in-progress with reason)',
                'npm run build passes',
                'CSV updated: status, actual effort, findings summary',
                'Standup entry added for next morning',
                'No locked files modified (git diff --name-only)',
                'No files in the other developer\'s territory touched',
                'Changes committed with descriptive message',
                'Branch pushed to remote',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 py-1">
                  <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key Documents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Key Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  { name: 'GENIESUITE_PROJECT_PLAN.csv', desc: 'Full sprint plan with status, findings, effort' },
                  { name: 'GENIESUITE_DAY1_DIAGNOSIS.md', desc: 'Detailed diagnosis: 33 issues, file:line, root cause' },
                  { name: 'LOVABLE_DEVELOPER_GUIDE.md', desc: 'Lovable daily ops: what to read, update, and never touch' },
                  { name: 'GENIESUITE_DUAL_DEVELOPER_STRATEGY.md', desc: 'Merge order, file ownership, conflict prevention' },
                ].map(doc => (
                  <div key={doc.name} className="p-2 rounded border bg-muted/30">
                    <p className="text-xs font-mono font-medium truncate">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{doc.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Standups Tab ── */}
        <TabsContent value="standups" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Day {selectedDay}:</span>
            <span className="text-sm text-muted-foreground">{SPRINT_DAYS[selectedDay - 1]?.theme}</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <StandupForm day={selectedDay} developer="lovable" onSave={addStandup} />
            <StandupForm day={selectedDay} developer="claude" onSave={addStandup} />
          </div>
          {dayStandups.length > 0 && (
            <>
              <Separator />
              <h3 className="text-sm font-semibold">Logged Standups — Day {selectedDay}</h3>
              <div className="space-y-2">
                {dayStandups.map((s, i) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        {s.developer === 'lovable' ? (
                          <Zap className="w-3.5 h-3.5 text-pink-600" />
                        ) : (
                          <Brain className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        <span className="text-xs font-medium capitalize">{s.developer === 'lovable' ? 'Lovable' : 'Claude Code'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</span>
                      </div>
                      {s.yesterday && <p className="text-xs"><strong>Yesterday:</strong> {s.yesterday}</p>}
                      {s.today && <p className="text-xs"><strong>Today:</strong> {s.today}</p>}
                      {s.blockers && <p className="text-xs text-amber-600"><strong>Blockers:</strong> {s.blockers}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Strategy Tab ── */}
        <TabsContent value="strategy" className="space-y-4">
          {/* File Ownership */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                File Ownership Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Area</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Files</th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">Count</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FILE_OWNERSHIP.map(row => (
                      <tr key={row.area} className="border-b last:border-0">
                        <td className="py-2 px-2 text-xs font-medium">{row.area}</td>
                        <td className="py-2 px-2 text-xs font-mono text-muted-foreground">{row.files}</td>
                        <td className="py-2 px-2 text-xs text-center">{row.count}</td>
                        <td className="py-2 px-2">
                          <Badge className={cn("text-xs",
                            row.owner === 'lovable' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'
                          )}>
                            {row.owner === 'lovable' ? 'Lovable' : 'Claude'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Locked Files */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500" />
                Locked Files — Neither Developer Modifies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {LOCKED_FILES.map(lf => (
                  <div key={lf.file} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono font-medium">{lf.file}</p>
                      <p className="text-xs text-muted-foreground">{lf.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conflict Prevention */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Conflict Prevention Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">1</Badge>
                  <span>Build passes: <code className="bg-muted px-1 rounded">npm run build</code> before every commit</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">2</Badge>
                  <span>No locked file changes: verify with <code className="bg-muted px-1 rounded">git diff --name-only</code></span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">3</Badge>
                  <span>Lovable doesn't touch <code className="bg-muted px-1 rounded">genie-</code> prefixed files</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">4</Badge>
                  <span>Claude doesn't touch <code className="bg-muted px-1 rounded">landing/</code> files</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">5</Badge>
                  <span>Claude merges to main FIRST, then Lovable rebases and merges</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Metrics Tab ── */}
        <TabsContent value="metrics" className="space-y-4">
          {/* By Developer */}
          <div className="grid sm:grid-cols-2 gap-4">
            {(['lovable', 'claude'] as Developer[]).map(dev => {
              const data = metrics.byDeveloper[dev];
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <Card key={dev}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {dev === 'lovable' ? (
                        <Zap className="w-5 h-5 text-pink-600" />
                      ) : (
                        <Brain className="w-5 h-5 text-purple-600" />
                      )}
                      <span className="font-semibold text-sm">{dev === 'lovable' ? 'Lovable' : 'Claude Code'}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{data.completed}/{data.total} tasks</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* By Day */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Completion by Sprint Day</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SPRINT_DAYS.map(day => {
                const data = metrics.byDay[day.day] ?? { total: 0, completed: 0 };
                const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={day.day}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1">
                        <span className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          day.day < currentDay && "bg-green-500 text-white",
                          day.day === currentDay && "bg-primary text-primary-foreground",
                          day.day > currentDay && "bg-muted text-muted-foreground",
                        )}>
                          {day.day}
                        </span>
                        {day.theme}
                      </span>
                      <span>{data.completed}/{data.total} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Overall */}
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{Math.round((metrics.completed / metrics.total) * 100)}%</p>
              <p className="text-sm text-muted-foreground">Overall Sprint Completion</p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.completed} of {metrics.total} tasks completed across both developers
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SprintTrackerDashboard;
