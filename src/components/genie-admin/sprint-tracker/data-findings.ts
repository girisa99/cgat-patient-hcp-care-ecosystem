// Sprint Tracker — Sprint Findings (Days 1-4)
// Updated: 2026-02-20 (Day 4) — includes Day 2-3 completed task findings
import type { TaskFindings } from './types';

// ─── Day 1 Findings (Diagnosis) ────────────────────────────────────────────
export const DAY1_FINDINGS: Record<string, TaskFindings> = {
  'C-101': {
    summary: 'GenieSpark: critical race conditions in save+navigate, missing error handling, broken route, inconsistent stats.',
    totalIssues: 14, issuesBySeverity: { critical: 3, high: 3, medium: 5, low: 3 },
    dayTwoImpact: 'Handlers fixed. Day 3 C-301 (SmartContentPipeline) and C-302 (SparkGuidedWizard) remain.',
    findings: [
      { id: 'S-001', severity: 'critical', file: 'src/pages/GenieSpark.tsx', line: 45, issue: 'Race condition: saveScript() not awaited before navigate()', rootCause: 'saveScript is async but called synchronously', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-002', severity: 'critical', file: 'src/pages/GenieSpark.tsx', line: 50, issue: 'handleSendToVibe: same race condition + missing stats', rootCause: 'Copy-paste error', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-003', severity: 'critical', file: 'src/pages/GenieSpark.tsx', line: 84, issue: 'Broken route: /genie-studio/productions does not exist', rootCause: 'Moved to /genie-admin?tab=library', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-004', severity: 'high', file: 'src/pages/GenieSpark.tsx', line: 28, issue: 'No error handling on any content handler', rootCause: 'Handlers lacked try/catch', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-005', severity: 'high', file: 'src/pages/GenieSpark.tsx', line: 88, issue: 'handleSaveToKnowledgeBase is a no-op stub', rootCause: 'Never completed', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-006', severity: 'high', file: 'src/components/genie-studio/SmartContentPipeline.tsx', issue: 'Uses simulated AI not real API', rootCause: '80KB component has placeholder generation', status: 'fixed', fixedIn: 'C-301' },
      { id: 'S-007', severity: 'medium', file: 'src/constants/genie-products.ts', line: 109, issue: 'Tagline capitalization mismatch', rootCause: '"Ignite your Ideas" vs "Ignite Your Ideas"', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-008', severity: 'medium', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', line: 130, issue: 'onGenerate uses simulated 2s delay', rootCause: 'Fake callback with setTimeout', status: 'fixed', fixedIn: 'C-302' },
      { id: 'S-009', severity: 'medium', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', line: 162, issue: 'Phase buttons lack ARIA roles', rootCause: 'Accessibility gap', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-010', severity: 'medium', file: 'src/pages/GenieSpark.tsx', line: 26, issue: 'savedScripts destructured but never used', rootCause: 'Dashboard moved to GenieMind', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'S-011', severity: 'medium', file: 'src/pages/GenieSpark.tsx', line: 179, issue: 'Image-to-Script saves but never navigates', rootCause: 'No UX to find result', status: 'fixed', fixedIn: 'C-304' },
      { id: 'S-012', severity: 'low', file: 'src/pages/GenieSpark.tsx', line: 162, issue: 'QuickTemplateSelector no template pre-fill', rootCause: 'Tab switches but no data passed', status: 'open' },
      { id: 'S-013', severity: 'low', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', line: 97, issue: 'Refine/Export phases always incomplete', rootCause: 'No completion tracking', status: 'fixed', fixedIn: 'C-302' },
      { id: 'S-014', severity: 'low', file: 'src/pages/GenieSpark.tsx', issue: 'Duplicate script creation logic', rootCause: 'No shared factory', status: 'fixed', fixedIn: 'abb79815' },
    ],
  },
  'C-102': {
    summary: 'GenieMind: wrong tagline, voiceover save stub, 127KB ScriptEditorTab needs deep dive.',
    totalIssues: 13, issuesBySeverity: { critical: 2, high: 3, medium: 5, low: 3 },
    dayTwoImpact: 'Mind scheduled for Day 4. Voiceover stub and ScriptEditorTab are critical.',
    findings: [
      { id: 'M-001', severity: 'critical', file: 'src/components/navigation/QuadrantProductHeader.tsx', line: 50, issue: 'Mind tagline "Think Beyond Limits" instead of "AI That Understands"', rootCause: 'Hardcoded separately from genie-products.ts', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-002', severity: 'critical', file: 'src/pages/GenieMind.tsx', line: 241, issue: 'Voiceover save is stub — no persist', rootCause: 'useGenieMediaLibrary has no saveVoiceover', status: 'open' },
      { id: 'M-003', severity: 'high', file: 'src/components/genie-studio/ScriptEditorTab.tsx', issue: '127KB file needs deep investigation', rootCause: 'Massive single-file component', status: 'open' },
      { id: 'M-004', severity: 'high', file: 'src/pages/GenieMind.tsx', line: 301, issue: 'Audio delete says "Delete via Genie Vibe"', rootCause: 'Cross-product delete not implemented', status: 'open' },
      { id: 'M-005', severity: 'high', file: 'src/components/genie-studio/CrossFunctionalMusic.tsx', issue: 'Music generation API needs verification', rootCause: 'Scheduled for C-403', status: 'open' },
      { id: 'M-006', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 2, issue: 'Doc comment tagline wrong', rootCause: 'Copy-paste of old tagline', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-007', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 57, issue: 'No loading indicator for media library', rootCause: 'mediaLoading not rendered', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-008', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 325, issue: 'Audio elements lack aria-label', rootCause: 'Accessibility gap', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'M-009', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 82, issue: 'Stats bar 5-col grid breaks on mobile', rootCause: 'No responsive breakpoint', status: 'open' },
      { id: 'M-010', severity: 'medium', file: 'src/pages/GenieMind.tsx', line: 40, issue: 'Tab changes not reflected in URL', rootCause: 'useState captures initial value only', status: 'open' },
      { id: 'M-011', severity: 'low', file: 'src/pages/GenieMind.tsx', line: 149, issue: 'Script card click opens tab not specific script', rootCause: 'No script ID passed', status: 'open' },
      { id: 'M-012', severity: 'low', file: 'src/components/genie-studio/SavedAudioCard.tsx', issue: 'Possible stale audio URL handling', rootCause: 'Needs investigation', status: 'open' },
      { id: 'M-013', severity: 'low', file: 'src/pages/GenieMind.tsx', line: 256, issue: 'BatchScriptGenerationWorkflow no callbacks', rootCause: 'Self-contained component', status: 'open' },
    ],
  },
  'C-103': {
    summary: 'GenieDeck most production-ready. Polish: fallback UI, image loading, error messages.',
    totalIssues: 6, issuesBySeverity: { critical: 0, high: 0, medium: 3, low: 3 },
    dayTwoImpact: 'Deck scheduled for Day 2. Focus on PresentationWizard flow.',
    findings: [
      { id: 'D-001', severity: 'medium', file: 'src/pages/GenieDeck.tsx', line: 158, issue: 'Support email hardcoded as support@example.com', rootCause: 'Placeholder', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'D-002', severity: 'medium', file: 'src/components/landing/demo-hub/DeckDemoCard.tsx', line: 545, issue: 'Returns null when industry data missing', rootCause: 'No fallback UI', status: 'fixed', fixedIn: 'L-201' },
      { id: 'D-003', severity: 'medium', file: 'src/config/genieStudioNavItems.ts', line: 143, issue: 'Tier gating starter but no client-side check', rootCause: 'Route guard does auth not tier', status: 'open' },
      { id: 'D-004', severity: 'low', file: 'src/components/landing/demo-hub/DeckDemoCard.tsx', line: 560, issue: 'Error messages generic', rootCause: 'Generic strings', status: 'fixed', fixedIn: 'C-201' },
      { id: 'D-005', severity: 'low', file: 'src/components/landing/demo-hub/DeckDemoCard.tsx', line: 628, issue: 'AI image generation no loading skeleton', rootCause: 'No visual feedback', status: 'fixed', fixedIn: 'L-203' },
      { id: 'D-006', severity: 'low', file: 'src/components/navigation/QuadrantProductHeader.tsx', line: 149, issue: 'Carousel buttons lack aria-pressed', rootCause: 'Accessibility gap', status: 'fixed', fixedIn: 'C-201' },
    ],
  },
  'C-104': {
    summary: '33 total issues across 3 products. 11 fixed Day 1. 22 remain for Days 2-4.',
    totalIssues: 33, issuesBySeverity: { critical: 5, high: 6, medium: 13, low: 9 },
    dayTwoImpact: 'Day 2 focus: GenieDeck PresentationWizard.',
    findings: [
      { id: 'X-001', severity: 'high', file: 'src/constants/genie-products.ts', issue: 'Tagline inconsistency between constants and header', rootCause: 'Two sources of truth', status: 'fixed', fixedIn: 'abb79815' },
      { id: 'X-002', severity: 'medium', file: 'src/components/navigation/QuadrantProductHeader.tsx', issue: 'Hardcodes data instead of importing', rootCause: 'Built independently', status: 'open' },
      { id: 'X-003', severity: 'medium', file: 'N/A', issue: 'No shared error boundary for product pages', rootCause: 'Each page handles errors independently', status: 'open' },
    ],
  },
  'S-101': {
    summary: 'Build passes. 7 files changed. Branch pushed.',
    totalIssues: 0, issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    dayTwoImpact: 'Branch clean. Ready for Day 2.',
    findings: [],
  },
};

// ─── Day 2 Findings (Deck Module Complete) ─────────────────────────────────
export const DAY2_FINDINGS: Record<string, TaskFindings> = {
  'C-201': {
    summary: 'GenieDeck PresentationWizard: auth validation, progress bar, onComplete, ARIA fixes.',
    totalIssues: 5, issuesBySeverity: { critical: 1, high: 2, medium: 1, low: 1 },
    dayTwoImpact: 'Deck create flow fully operational.',
    findings: [
      { id: 'D-201', severity: 'critical', file: 'src/hooks/usePresentationSession.ts', issue: 'createSession had no userId validation before DB insert', rootCause: 'Auth not checked before Supabase insert', status: 'fixed', fixedIn: 'C-201' },
      { id: 'D-202', severity: 'high', file: 'src/components/genie-studio/presentation-generator/PresentationWizard.tsx', issue: 'Progress bar hardcoded at 50%', rootCause: 'Static value instead of phase-aware calculation', status: 'fixed', fixedIn: 'C-201' },
      { id: 'D-203', severity: 'high', file: 'src/components/genie-studio/presentation-generator/PresentationWizard.tsx', issue: 'onComplete callback not wired to parent', rootCause: 'Callback prop existed but never invoked', status: 'fixed', fixedIn: 'C-201' },
      { id: 'D-204', severity: 'medium', file: 'src/pages/GenieDeck.tsx', issue: 'Error messages say generic text instead of "Genie Deck"', rootCause: 'No product branding in error strings', status: 'fixed', fixedIn: 'C-201' },
      { id: 'D-205', severity: 'low', file: 'src/components/navigation/QuadrantProductHeader.tsx', issue: 'Carousel aria-controls and disabled state missing', rootCause: 'Accessibility gap in carousel navigation', status: 'fixed', fixedIn: 'C-201' },
    ],
  },
  'C-202': {
    summary: 'Presentation sub-components: ComplianceChecker error handling, wizard navigation, all 8 steps verified.',
    totalIssues: 3, issuesBySeverity: { critical: 1, high: 1, medium: 1, low: 0 },
    dayTwoImpact: 'All 8 wizard steps verified. Deck pipeline complete.',
    findings: [
      { id: 'D-206', severity: 'critical', file: 'src/hooks/usePresentationSession.ts', issue: 'saveSession used unsafe object spread for DB update', rootCause: 'Direct spread of session object into Supabase update', status: 'fixed', fixedIn: 'C-202' },
      { id: 'D-207', severity: 'high', file: 'src/components/genie-studio/presentation-generator/ComplianceChecker.tsx', issue: 'Compliance check failures silently swallowed', rootCause: 'No toast/notification on failure', status: 'fixed', fixedIn: 'C-202' },
      { id: 'D-208', severity: 'medium', file: 'src/components/genie-studio/presentation-generator/', issue: 'Wizard step navigation allowed skipping steps', rootCause: 'No step completion validation', status: 'fixed', fixedIn: 'C-202' },
    ],
  },
  'C-203': {
    summary: 'Deck E2E verified: input → slides → preview → save. Full workflow works.',
    totalIssues: 0, issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    dayTwoImpact: 'Deck module production-ready. H-201 handoff ready.',
    findings: [
      { id: 'D-E2E', severity: 'low', file: 'src/pages/GenieDeck.tsx', issue: 'E2E verification pass — all 8 steps: Input/Configure/Template/Output/Agents/Voice/Generate/Publish', rootCause: 'N/A — verification only', status: 'fixed', fixedIn: 'C-203' },
    ],
  },
  'S-201': {
    summary: 'Build passes (55s). Rebased on dev. PR #35 open. H-201 ready.',
    totalIssues: 0, issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    dayTwoImpact: 'Build clean. Deck module complete. Effort tracking added.',
    findings: [],
  },
};

// ─── Day 3 Findings (Spark Module Complete) ────────────────────────────────
export const DAY3_FINDINGS: Record<string, TaskFindings> = {
  'C-301': {
    summary: 'SmartContentPipeline: presentation flow wired to real Supabase services, URL validation, image null-check.',
    totalIssues: 4, issuesBySeverity: { critical: 0, high: 2, medium: 2, low: 0 },
    dayTwoImpact: 'S-006 resolved. Pipeline uses real AI services.',
    findings: [
      { id: 'S-301A', severity: 'high', file: 'src/components/genie-studio/SmartContentPipeline.tsx', issue: 'Presentation onComplete never set generatedContent', rootCause: 'Missing setGeneratedContent + auto-save draft call', status: 'fixed', fixedIn: 'C-301' },
      { id: 'S-301B', severity: 'high', file: 'src/components/genie-studio/SmartContentPipeline.tsx', issue: 'URL input accepted any string without validation', rootCause: 'No new URL() validation', status: 'fixed', fixedIn: 'C-301' },
      { id: 'S-301C', severity: 'medium', file: 'src/components/genie-studio/SmartContentPipeline.tsx', issue: 'Image upload showed preview for null file', rootCause: 'Missing null check on preview URL', status: 'fixed', fixedIn: 'C-301' },
      { id: 'S-301D', severity: 'medium', file: 'src/components/genie-studio/SmartContentPipeline.tsx', issue: 'File validation included presentation/pipeline types incorrectly', rootCause: 'Validation regex too broad', status: 'fixed', fixedIn: 'C-301' },
    ],
  },
  'C-302': {
    summary: 'SparkGuidedWizard: real Supabase save, phase completion tracking, back-nav guard, success feedback.',
    totalIssues: 4, issuesBySeverity: { critical: 0, high: 2, medium: 2, low: 0 },
    dayTwoImpact: 'S-008 and S-013 resolved. Wizard flow fully functional.',
    findings: [
      { id: 'S-302A', severity: 'high', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', issue: 'onGenerate was a fake setTimeout callback', rootCause: 'Placeholder never replaced with real save', status: 'fixed', fixedIn: 'C-302' },
      { id: 'S-302B', severity: 'high', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', issue: 'Refine/Export phases had no completion state', rootCause: 'No hasVisitedRefine tracking', status: 'fixed', fixedIn: 'C-302' },
      { id: 'S-302C', severity: 'medium', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', issue: 'Back button allowed navigation during generation', rootCause: 'No isGenerating guard on back button', status: 'fixed', fixedIn: 'C-302' },
      { id: 'S-302D', severity: 'medium', file: 'src/components/genie-spark/SparkGuidedWizard.tsx', issue: 'No success feedback after generation completes', rootCause: 'Missing success banner/toast', status: 'fixed', fixedIn: 'C-302' },
    ],
  },
  'C-303': {
    summary: 'useGenieScripts: auth race condition fixed, updateScript synced, stats serialization, mapRowToScript helper.',
    totalIssues: 4, issuesBySeverity: { critical: 1, high: 2, medium: 1, low: 0 },
    dayTwoImpact: 'Script persistence reliable. C-304 and C-401 unblocked.',
    findings: [
      { id: 'S-303A', severity: 'critical', file: 'src/components/genie-studio/useGenieScripts.ts', issue: 'Auth state change did not reload scripts', rootCause: 'onAuthStateChange listener missing', status: 'fixed', fixedIn: 'C-303' },
      { id: 'S-303B', severity: 'high', file: 'src/components/genie-studio/useGenieScripts.ts', issue: 'updateScript returned void instead of DB state', rootCause: 'Missing .select().single() on update query', status: 'fixed', fixedIn: 'C-303' },
      { id: 'S-303C', severity: 'high', file: 'src/components/genie-studio/useGenieScripts.ts', issue: 'Stats serialization inconsistent (string vs object)', rootCause: 'JSON.parse/stringify not applied uniformly', status: 'fixed', fixedIn: 'C-303' },
      { id: 'S-303D', severity: 'medium', file: 'src/components/genie-studio/useGenieScripts.ts', issue: 'Row-to-script mapping duplicated in 3 places', rootCause: 'No shared helper function', status: 'fixed', fixedIn: 'C-303' },
    ],
  },
  'C-304': {
    summary: 'GenieSpark E2E: real DB saves, temp IDs removed, saveGeneratedContent helper, wizard saves draft.',
    totalIssues: 3, issuesBySeverity: { critical: 0, high: 2, medium: 1, low: 0 },
    dayTwoImpact: 'S-011 resolved. Spark E2E complete. H-301 ready.',
    findings: [
      { id: 'S-304A', severity: 'high', file: 'src/pages/GenieSpark.tsx', issue: 'Save handlers used temporary IDs instead of DB UUIDs', rootCause: 'Local temp- prefix IDs passed to navigation', status: 'fixed', fixedIn: 'C-304' },
      { id: 'S-304B', severity: 'high', file: 'src/pages/GenieSpark.tsx', issue: 'Wizard onGenerate saved locally but not to Supabase', rootCause: 'Missing DB insert in generate handler', status: 'fixed', fixedIn: 'C-304' },
      { id: 'S-304C', severity: 'medium', file: 'src/pages/GenieSpark.tsx', issue: 'Production Hub deep-link used wrong ID format', rootCause: 'Used local ID instead of saved.id from DB response', status: 'fixed', fixedIn: 'C-304' },
    ],
  },
  'S-301': {
    summary: 'Build passes (56s). All Day 3 tasks complete. H-301 ready. Sprint data updated.',
    totalIssues: 0, issuesBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    dayTwoImpact: 'Build clean. Spark module complete. 8 files changed.',
    findings: [],
  },
};

// ─── Product Market Research Summary ───────────────────────────────────────
// Consolidated from market-data.ts, competitiveIntelligenceService.ts,
// competitiveLanguageMatrix.ts, and marketing collateral docs.
export interface ProductResearch {
  product: string;
  tagline: string;
  marketPosition: string;
  competitors: string[];
  uniqueAdvantage: string;
  tam: string;
  sprintStatus: 'complete' | 'in-progress' | 'backlog';
  openIssues: number;
  notes: string;
}

export const PRODUCT_RESEARCH: ProductResearch[] = [
  {
    product: 'Genie Spark',
    tagline: 'Ignite Your Ideas',
    marketPosition: 'Script generation from any input (Doc, PPT, Video, Audio, URL, Image)',
    competitors: ['Jasper AI ($80M ARR)', 'Copy.ai ($30M ARR)', 'Writesonic'],
    uniqueAdvantage: 'Multi-modal input (7 formats) vs competitors\' text-only. AI generates image when none exists.',
    tam: '$35B Knowledge Sharing segment',
    sprintStatus: 'complete',
    openIssues: 1, // S-012 (low — template pre-fill)
    notes: 'Days 1+3 complete. All critical/high issues fixed. E2E verified. H-301 ready for Lovable.',
  },
  {
    product: 'Genie Mind',
    tagline: 'AI That Understands',
    marketPosition: 'AI script editing + TTS + voice cloning + music generation',
    competitors: ['Descript (3M users, $50M ARR)', 'ElevenLabs (voice)', 'Murf.ai (TTS)'],
    uniqueAdvantage: 'Unified edit+voice+music in one tool. RAG-powered context memory. 70+ language TTS.',
    tam: '$250B Creator Economy segment',
    sprintStatus: 'in-progress',
    openIssues: 9, // M-002 through M-013 (minus fixed ones)
    notes: 'Day 4 focus: C-401 (ScriptEditorTab 127KB), C-402 (SavedAudioCard), C-403 (CrossFunctionalMusic), C-404 (Spark→Mind flow). Critical: voiceover save stub (M-002).',
  },
  {
    product: 'Genie Deck',
    tagline: 'Ideas to Impact',
    marketPosition: 'AI presentation generation with smart layouts and branding',
    competitors: ['Beautiful.ai ($15M ARR)', 'Gamma.app', 'Tome ($75M funding)', 'SlidesAI'],
    uniqueAdvantage: '8-step wizard with compliance check. Script-to-slides pipeline. Multi-language export.',
    tam: '$15B SMB segment',
    sprintStatus: 'complete',
    openIssues: 1, // D-003 (tier gating — PO decision pending)
    notes: 'Day 2 complete. Full E2E verified. 8 wizard steps operational. PPTX+PDF export functional.',
  },
  {
    product: 'Genie Vibe',
    tagline: 'Script to Screen',
    marketPosition: 'Full audio/video production hub — podcast, recording, dubbing, lip-sync, avatar',
    competitors: ['CapCut (500M+ users, $200M+ ARR)', 'Descript', 'Synthesia (100K users, $60M ARR)', 'HeyGen'],
    uniqueAdvantage: 'Script-first workflow (vs CapCut effects-first). Arabic dialect support (7 dialects). 50% cheaper TTS than Synthesia.',
    tam: '$250B Creator Economy + $40B Enterprise Video',
    sprintStatus: 'backlog',
    openIssues: 0,
    notes: 'Not in Sprint 1 scope. Post-sprint priority. Key differentiator: 22 Indian languages, 10 African languages, 7 Arabic dialects — zero competitor coverage.',
  },
  {
    product: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    marketPosition: 'Global distribution + marketing engine — 14-region localization, multi-platform publishing',
    competitors: ['Buffer ($25M ARR)', 'Hootsuite ($200M ARR)', 'Sprout Social ($300M ARR)'],
    uniqueAdvantage: '14-region content localization built-in. Script→Video→Distribute in one platform. Regional avatar support.',
    tam: '$21B Influencer segment + $15B SMB',
    sprintStatus: 'backlog',
    openIssues: 0,
    notes: 'Post-sprint. Marketing playbook complete (GENIE_CAST_MESSAGING_PLAYBOOK.md). 119 marketing pipelines defined across 14 categories.',
  },
  {
    product: 'Ask Genie',
    tagline: 'Your wish is my command',
    marketPosition: 'Universal AI companion — cross-product navigation, contextual help, workflow automation',
    competitors: ['ChatGPT (OpenAI)', 'Gemini (Google)', 'Copilot (Microsoft)'],
    uniqueAdvantage: 'Deep integration with all 6 Genie products. Creative-suite-specific context. Not a general chatbot.',
    tam: '$12B Education + $25B Healthcare (AI assistant)',
    sprintStatus: 'backlog',
    openIssues: 0,
    notes: 'Post-sprint. Product definition complete in genie-products.ts. Personality traits defined (empathetic, creative, witty).',
  },
  {
    product: 'Genie Hub',
    tagline: 'Your Creative Command Center',
    marketPosition: 'Production orchestration — scheduling, Kanban, assets, review workflows',
    competitors: ['Monday.com ($700M ARR)', 'Asana ($550M ARR)', 'Notion ($200M ARR)'],
    uniqueAdvantage: 'Media-production-specific workflows. Integrated with Genie creation tools. Review + approval chains for content.',
    tam: '$40B Enterprise segment',
    sprintStatus: 'backlog',
    openIssues: 0,
    notes: 'Post-sprint. Formerly "Genie Arc" — renamed to Hub in Day 4 brand refresh.',
  },
];

// ─── Backlog Summary (Remaining Open Issues) ───────────────────────────────
export const BACKLOG_SUMMARY = {
  totalOpen: 5,
  byProduct: {
    spark: { count: 1, items: ['S-012: QuickTemplateSelector no template pre-fill (low)'] },
    mind: { count: 9, items: [
      'M-002: Voiceover save stub (critical) — target C-401/C-404',
      'M-003: ScriptEditorTab 127KB deep dive (high) — target C-401',
      'M-004: Audio delete says "Delete via Genie Vibe" (high) — target C-401',
      'M-005: CrossFunctionalMusic API verification (high) — target C-403',
      'M-009: Stats bar 5-col grid mobile break (medium) — target C-401',
      'M-010: Tab changes not in URL (medium) — target C-404',
      'M-011: Script card click opens tab not script (low) — target C-404',
      'M-012: SavedAudioCard stale URL (low) — target C-402',
      'M-013: BatchScriptGenerationWorkflow no callbacks (low) — target C-401',
    ]},
    deck: { count: 1, items: ['D-003: Tier gating no client-side check (medium) — PO decision pending'] },
    cross: { count: 2, items: [
      'X-002: QuadrantProductHeader hardcodes data (medium) — deferred',
      'X-003: No shared error boundary for product pages (medium) — Day 5',
    ]},
    vibe: { count: 0, items: [] },
    cast: { count: 0, items: [] },
    hub: { count: 0, items: [] },
    askGenie: { count: 0, items: [] },
  },
  sprintCompletion: {
    tasksCompleted: 23,
    tasksTotal: 41,
    percentComplete: 56,
    issuesFound: 33,
    issuesFixed: 20,
    issuesOpen: 13,
  },
};
