/**
 * UNIFIED METRICS - SINGLE SOURCE OF TRUTH
 * 
 * This file consolidates ALL metrics for Genie Studio Command Center.
 * Every tab, component, and display MUST derive values from here.
 * 
 * DO NOT create hardcoded metrics elsewhere!
 * 
 * Last Audit: 2026-01-15
 */

import { GENIE_DYNAMIC_METRICS, GENIE_AI_AGENTS, GENIE_EDGE_FUNCTIONS, GENIE_DATABASE_TABLES, GENIE_HOOKS, GENIE_SERVICES, GENIE_PAGES } from './GenieStudioRegistry';

// =============================================================================
// PHASE DATA - SINGLE SOURCE OF TRUTH FOR P0-P5
// =============================================================================
export interface PhaseData {
  total: number;
  implemented: number;
  status: 'completed' | 'in-progress' | 'planned';
  weeks: string;
  name: string;
}

export const PHASES: Record<string, PhaseData> = {
  P0: { 
    // Core MVP: Auth, DB Schema, Basic UI, Core Edge Functions
    total: 45, 
    implemented: 45, 
    status: 'completed', 
    weeks: '1-4',
    name: 'Core MVP Foundation'
  },
  P1: { 
    // Essential Production: TTS, Video Generation, Basic Editor, Wizard Steps 0-4
    total: 42, 
    implemented: 42, 
    status: 'completed', 
    weeks: '5-8',
    name: 'Essential Production'
  },
  P2: { 
    // AI Agents, Multi-Provider, 206 Pipelines, Confidence Loop, Editor Advanced
    total: 135, 
    implemented: 135, 
    status: 'completed', 
    weeks: '9-12',
    name: 'AI Agents & UX Polish'
  },
  P3: { 
    // PHASE 3 SCOPE (Updated 2026-01-28):
    // - Quick Wins (5✅ DONE)
    // - Label Studio RLHF (10✅ DONE)
    // - Original Implemented (17✅ DONE)
    // - Generation P2 (6✅ ALL DONE)
    // - Admin Hub + Production Hub (8✅ DONE - NEW)
    // - Ask Genie Support (5✅ DONE - NEW)
    // - Pricing & Tier Gating (6✅ DONE - NEW)
    // - Deck & Presentation (4✅ DONE - NEW)
    // - Compliance P3 (5✅ DONE - NOW COMPLETE)
    // TOTAL: 66 in scope | IMPLEMENTED: 66 | ALL COMPLETE
    total: 66, 
    implemented: 66,
    status: 'completed', 
    weeks: '13-18',
    name: 'Generation, Compliance & Segment Gates'
  },
  P4: { 
    // PHASE 4 (Enterprise & Analytics):
    // - Analytics & Insights (10 scenarios)
    // - External Integrations (8 scenarios)
    // - Enterprise Features (18 scenarios)
    // - Segment-Specific Features (22 scenarios) 
    // - Recovery & Error (4), Multi-Language (4), Collaboration (4), Versioning (2), External API (5), Advanced Analytics (31)
    total: 108, 
    implemented: 12, // Analytics dashboard, some integrations started
    status: 'in-progress', 
    weeks: '19-26',
    name: 'Advanced Features & Enterprise'
  },
  P5: { 
    // PHASE 5 (Enterprise Scale - requires P4 completion):
    // - SSO/SAML (8), White-Label (8), HIPAA Full (5), Data Residency (7)
    total: 28, 
    implemented: 0, 
    status: 'planned', 
    weeks: '27+',
    name: 'Enterprise Scale & Compliance'
  },
} as const;

// =============================================================================
// P3 CONSOLIDATED SCENARIO BREAKDOWN (UPDATED 2026-01-28)
// =============================================================================
export const P3_SCENARIO_BREAKDOWN = {
  // PRIORITY 1: Quick Wins (Weeks 13-14) - 5 scenarios ✅ COMPLETE
  quickWins: {
    smartThumbnails: { id: 'P3-QW-01', name: 'Smart Thumbnail Generation', status: 'complete', priority: 1 },
    captionGeneration: { id: 'P3-QW-02', name: 'AI Caption Generation', status: 'complete', priority: 1 },
    hashtagOptimization: { id: 'P3-QW-03', name: 'Hashtag Optimization', status: 'complete', priority: 1 },
    accessibilityCheck: { id: 'P3-QW-04', name: 'Accessibility Compliance Check', status: 'complete', priority: 1 },
    brandGuidelinesCheck: { id: 'P3-QW-05', name: 'Brand Guidelines Verification', status: 'complete', priority: 1 },
  },
  
  // PRIORITY 2: Core Generation (Weeks 14-15) - 6 scenarios ✅ COMPLETE
  generation: {
    batchScriptGeneration: { id: 'P3-GEN-01', name: 'Batch Script Generation', status: 'complete', priority: 2, completedDate: '2026-01-16' },
    autoPublishScheduling: { id: 'P3-GEN-02', name: 'Auto-Publish Scheduling', status: 'complete', priority: 2, completedDate: '2026-01-16' },
    multiLanguageQuickDub: { id: 'P3-GEN-03', name: 'Multi-Language Quick Dub', status: 'complete', priority: 2, completedDate: '2026-01-16' },
    contentRecycling: { id: 'P3-GEN-04', name: 'Content Recycling Engine', status: 'complete', priority: 2, completedDate: '2026-01-16' },
    templateVariants: { id: 'P3-GEN-05', name: 'Template Variant Generation', status: 'complete', priority: 2, completedDate: '2026-01-16' },
    voiceCloning: { id: 'P3-GEN-06', name: 'Voice Cloning for Dubs', status: 'complete', priority: 2, completedDate: '2026-01-16' },
  },
  
  // PRIORITY 3: Compliance & Legal (Weeks 15-16) - 5 scenarios ✅ COMPLETE (2026-01-28)
  compliance: {
    copyrightDetection: { id: 'P3-COMP-01', name: 'Copyright Detection', status: 'complete', priority: 3, completedDate: '2026-01-28' },
    hipaaCompliance: { id: 'P3-COMP-02', name: 'HIPAA Compliance Check', status: 'complete', priority: 3, completedDate: '2026-01-28' },
    gdprCompliance: { id: 'P3-COMP-03', name: 'GDPR Data Compliance', status: 'complete', priority: 3, completedDate: '2026-01-28' },
    accessibilityWCAG: { id: 'P3-COMP-04', name: 'WCAG 2.1 AA Compliance', status: 'complete', priority: 3, completedDate: '2026-01-28' },
    disclaimerInjection: { id: 'P3-COMP-05', name: 'Auto-Disclaimer Injection', status: 'complete', priority: 3, completedDate: '2026-01-28' },
  },
  
  // NEW: Admin Hub & Production Hub (8 scenarios) - Added 2026-01-28 ✅ COMPLETE
  adminHub: {
    kanbanBoard: { id: 'P3-ADM-01', name: 'Production Kanban Board', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    calendarScheduling: { id: 'P3-ADM-02', name: 'Calendar Scheduling System', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    contentLibrary: { id: 'P3-ADM-03', name: 'Content Library Management', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    compositionStudio: { id: 'P3-ADM-04', name: 'Unified Composition Studio', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    teamManagement: { id: 'P3-ADM-05', name: 'Team & Workspace Management', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    whitelabelConfig: { id: 'P3-ADM-06', name: 'Whitelabel Configuration', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    analyticsTab: { id: 'P3-ADM-07', name: 'Admin Analytics Tab', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    internalRouting: { id: 'P3-ADM-08', name: 'Internal vs External Routing', status: 'complete', priority: 2, addedDate: '2026-01-28' },
  },
  
  // NEW: Ask Genie Support (5 scenarios) - Added 2026-01-28 ✅ COMPLETE
  askGenieSupport: {
    aiKnowledgeBase: { id: 'P3-ASK-01', name: 'Ask Genie Knowledge Base (206 pipelines)', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    tierEscalation: { id: 'P3-ASK-02', name: 'Tier-Based Escalation Model', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    voiceSupport: { id: 'P3-ASK-03', name: 'Ask Genie Voice Interface', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    proactiveGuidance: { id: 'P3-ASK-04', name: 'Proactive Editing Suggestions', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    wizardIntegration: { id: 'P3-ASK-05', name: 'Wizard Step Guidance', status: 'complete', priority: 1, addedDate: '2026-01-28' },
  },
  
  // NEW: Pricing & Tier Gating (6 scenarios) - Added 2026-01-28 ✅ COMPLETE
  pricingTierGating: {
    tierFeatureConfig: { id: 'P3-TIER-01', name: 'Tier Feature Configuration', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    pricingPage: { id: 'P3-TIER-02', name: 'Dynamic Pricing Page', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    featureAccessBadges: { id: 'P3-TIER-03', name: 'Feature Access Badges', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    mixMatchGating: { id: 'P3-TIER-04', name: 'Mix-and-Match Tier Gating', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    lipsyncDubbingGating: { id: 'P3-TIER-05', name: 'Lipsync/Dubbing Tier Gating', status: 'complete', priority: 2, addedDate: '2026-01-28' },
    creditSystem: { id: 'P3-TIER-06', name: 'AI Credit System Integration', status: 'complete', priority: 1, addedDate: '2026-01-28' },
  },
  
  // NEW: Deck & Presentation (4 scenarios) - Added 2026-01-28 ✅ COMPLETE
  deckPresentation: {
    presentationWizard: { id: 'P3-DECK-01', name: '8-Step Presentation Wizard', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    slideGeneration: { id: 'P3-DECK-02', name: 'AI Slide Generation', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    presentationEditor: { id: 'P3-DECK-03', name: 'Canvas-Based Slide Editor', status: 'complete', priority: 1, addedDate: '2026-01-28' },
    exportFormats: { id: 'P3-DECK-04', name: 'Multi-Format Export (PPTX, PDF, HTML)', status: 'complete', priority: 2, addedDate: '2026-01-28' },
  },
  
  // =========================================================================
  // DEFERRED TO PHASE 4 (Requires Segment Selection & Pricing Finalization)
  // =========================================================================
  
  // DEFERRED: Analytics & Insights → P4 (needs segment metrics)
  analytics_DEFERRED_P4: {
    performanceInsights: { id: 'P4-ANA-01', name: 'Performance Insights Dashboard', status: 'deferred', phase: 'P4' },
    competitorAnalysis: { id: 'P4-ANA-02', name: 'Competitor Content Analysis', status: 'deferred', phase: 'P4' },
    trendPrediction: { id: 'P4-ANA-03', name: 'Trend Prediction Engine', status: 'deferred', phase: 'P4' },
    crossPlatformOptimization: { id: 'P4-ANA-04', name: 'Cross-Platform Optimization', status: 'deferred', phase: 'P4' },
    engagementPrediction: { id: 'P4-ANA-05', name: 'Engagement Prediction AI', status: 'deferred', phase: 'P4' },
    abTestingEngine: { id: 'P4-ANA-06', name: 'A/B Testing Framework', status: 'deferred', phase: 'P4' },
  },
  
  // DEFERRED: Segment-Specific Features → P4 (needs segment selection flow)
  segmentSpecific_DEFERRED_P4: {
    patientEducation: { id: 'P4-SEG-01', name: 'Patient Education Videos', status: 'deferred', phase: 'P4', segment: 'healthcare' },
    clinicalTrialContent: { id: 'P4-SEG-02', name: 'Clinical Trial Content', status: 'deferred', phase: 'P4', segment: 'healthcare' },
    medicalTranscription: { id: 'P4-SEG-03', name: 'Medical Transcription', status: 'deferred', phase: 'P4', segment: 'healthcare' },
    travelerKit: { id: 'P4-SEG-04', name: 'Traveler Content Kit', status: 'deferred', phase: 'P4', segment: 'travel' },
    destinationShowcase: { id: 'P4-SEG-05', name: 'Destination Showcase', status: 'deferred', phase: 'P4', segment: 'travel' },
    propertyTour: { id: 'P4-SEG-06', name: 'Property Virtual Tour', status: 'deferred', phase: 'P4', segment: 'realestate' },
    listingOptimization: { id: 'P4-SEG-07', name: 'Listing Content Optimization', status: 'deferred', phase: 'P4', segment: 'realestate' },
    productShowcase: { id: 'P4-SEG-08', name: 'Product Showcase Videos', status: 'deferred', phase: 'P4', segment: 'ecommerce' },
    ugcCompilation: { id: 'P4-SEG-09', name: 'UGC Compilation Engine', status: 'deferred', phase: 'P4', segment: 'ecommerce' },
  },
  
  // DEFERRED: External Integrations → P4 (needs enterprise features)
  integrations_DEFERRED_P4: {
    adobeIntegration: { id: 'P4-INT-01', name: 'Adobe Creative Cloud', status: 'deferred', phase: 'P4' },
    figmaIntegration: { id: 'P4-INT-02', name: 'Figma Design Import', status: 'deferred', phase: 'P4' },
    canvaIntegration: { id: 'P4-INT-03', name: 'Canva Asset Import', status: 'deferred', phase: 'P4' },
    youtubeStudioSync: { id: 'P4-INT-04', name: 'YouTube Studio Sync', status: 'deferred', phase: 'P4' },
    tiktokCreatorTools: { id: 'P4-INT-05', name: 'TikTok Creator Tools', status: 'deferred', phase: 'P4' },
  },
  
  // DEFERRED: Enterprise Features → P4 (needs pricing tiers)
  enterprise_DEFERRED_P4: {
    enterpriseSSO: { id: 'P4-ENT-01', name: 'Enterprise SSO (SAML/OIDC)', status: 'deferred', phase: 'P4' },
    auditLogs: { id: 'P4-ENT-02', name: 'Comprehensive Audit Logs', status: 'deferred', phase: 'P4' },
    whiteLabel: { id: 'P4-ENT-03', name: 'White-Label Customization', status: 'deferred', phase: 'P4' },
    roleBasedAccess: { id: 'P4-ENT-04', name: 'Role-Based Access Control', status: 'deferred', phase: 'P4' },
    apiRateLimiting: { id: 'P4-ENT-05', name: 'API Rate Limiting', status: 'deferred', phase: 'P4' },
    customBranding: { id: 'P4-ENT-06', name: 'Custom Branding Portal', status: 'deferred', phase: 'P4' },
  },
  
  // PREVIOUSLY IMPLEMENTED (17 + 10 Label Studio)
  implemented: {
    legalReviewGate: { id: 'P3-IMP-01', name: 'Legal Review Gate', status: 'complete', priority: 0 },
    bulkOperations: { id: 'P3-IMP-02', name: 'Bulk Operations', status: 'complete', priority: 0 },
    workspaceCollaboration: { id: 'P3-IMP-03', name: 'Workspace Collaboration', status: 'complete', priority: 0 },
    advancedAnalyticsDashboard: { id: 'P3-IMP-04', name: 'Advanced Analytics Dashboard', status: 'complete', priority: 0 },
    templateMarketplace: { id: 'P3-IMP-05', name: 'Template Marketplace', status: 'complete', priority: 0 },
    ragKnowledgeBase: { id: 'P3-IMP-06', name: 'RAG Knowledge Base', status: 'complete', priority: 0 },
    aiCreditSystem: { id: 'P3-IMP-07', name: 'AI Credit System', status: 'complete', priority: 0 },
    workflowExecutor: { id: 'P3-IMP-08', name: 'Workflow Executor Engine', status: 'complete', priority: 0 },
    recurringScheduler: { id: 'P3-IMP-09', name: 'Recurring Scheduler', status: 'complete', priority: 0 },
    viralScorePredictor: { id: 'P3-IMP-10', name: 'Viral Score Predictor', status: 'complete', priority: 0 },
    seoOptimizationService: { id: 'P3-IMP-11', name: 'SEO Optimization Service', status: 'complete', priority: 0 },
    threadGenerator: { id: 'P3-IMP-12', name: 'Thread Generator', status: 'complete', priority: 0 },
    carouselCreator: { id: 'P3-IMP-13', name: 'Carousel Creator', status: 'complete', priority: 0 },
    shortsGenerator: { id: 'P3-IMP-14', name: 'Shorts Generator', status: 'complete', priority: 0 },
    quizVideoGenerator: { id: 'P3-IMP-15', name: 'Quiz Video Generator', status: 'complete', priority: 0 },
    unifiedContentTools: { id: 'P3-IMP-16', name: 'Unified Content Tools', status: 'complete', priority: 0 },
    contextualToolsPanel: { id: 'P3-IMP-17', name: 'Contextual Tools Panel', status: 'complete', priority: 0 },
  },

  // LABEL STUDIO INTEGRATION (10 scenarios)
  labelStudio: {
    lsUniversalProvider: { id: 'P3-LS-01', name: 'LS Universal Provider', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsBackgroundService: { id: 'P3-LS-02', name: 'LS Background Service', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsSparkIntegration: { id: 'P3-LS-03', name: 'LS Spark Integration Hook', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsVibeIntegration: { id: 'P3-LS-04', name: 'LS Vibe Recording Capture', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsTTSIntegration: { id: 'P3-LS-05', name: 'LS TTS Quality Training', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsDocumentProcessing: { id: 'P3-LS-06', name: 'LS Document Processing', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsEcosystemWidget: { id: 'P3-LS-07', name: 'LS Ecosystem Widget', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsInlineHints: { id: 'P3-LS-08', name: 'LS Inline Content Hints', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsEdgeFunctionConnector: { id: 'P3-LS-09', name: 'LS Edge Function Connector', status: 'complete', priority: 0, addedDate: '2026-01-14' },
    lsAskGenieIntegration: { id: 'P3-LS-10', name: 'LS Ask Genie Training', status: 'complete', priority: 0, addedDate: '2026-01-14' },
  },
} as const;

// =============================================================================
// COMPUTED SCENARIO METRICS
// =============================================================================
export const SCENARIO_METRICS = {
  get totalScenarios() {
    return Object.values(PHASES).reduce((sum, p) => sum + p.total, 0);
  },
  get implementedScenarios() {
    return Object.values(PHASES).reduce((sum, p) => sum + p.implemented, 0);
  },
  get completionPercentage() {
    return Math.round((this.implementedScenarios / this.totalScenarios) * 100);
  },
  get completedPhases() {
    return Object.entries(PHASES)
      .filter(([_, p]) => p.status === 'completed')
      .map(([key]) => key);
  },
  get inProgressPhases() {
    return Object.entries(PHASES)
      .filter(([_, p]) => p.status === 'in-progress')
      .map(([key]) => key);
  },
  get plannedPhases() {
    return Object.entries(PHASES)
      .filter(([_, p]) => p.status === 'planned')
      .map(([key]) => key);
  },
};

// =============================================================================
// PLATFORM-WIDE INFRASTRUCTURE TOTALS
// =============================================================================
export const PLATFORM_TOTALS = {
  edgeFunctions: 140,
  hooks: 280,
  databaseTables: 180,
  aiAgents: 15,
  mobileComponents: 23,
  pages: 85,
  components: 500,
  services: 35,
  ttsProviders: 5,
  products: 6,
} as const;

// =============================================================================
// GENIE STUDIO SPECIFIC COUNTS (from registry)
// =============================================================================
export const GENIE_COUNTS = {
  edgeFunctions: GENIE_DYNAMIC_METRICS.edgeFunctions,
  hooks: GENIE_DYNAMIC_METRICS.hooks,
  databaseTables: GENIE_DYNAMIC_METRICS.databaseTables,
  aiAgents: GENIE_DYNAMIC_METRICS.aiAgents,
  pages: GENIE_DYNAMIC_METRICS.pages,
  services: GENIE_DYNAMIC_METRICS.services,
  mobileComponents: 18, // Verified from mobile/index.ts
  components: 55, // Verified from genie-studio/components barrel exports
} as const;

// =============================================================================
// HEALTHCARE SPECIFIC COUNTS
// =============================================================================
export const HEALTHCARE_COUNTS = {
  edgeFunctions: 28,
  hooks: 65,
  databaseTables: 55,
  aiAgents: 3,
  mobileComponents: 5,
  pages: 25,
  components: 120,
  services: 3,
} as const;

// =============================================================================
// CALCULATED SHARED COUNTS (Platform - Genie - Healthcare)
// =============================================================================
export const SHARED_COUNTS = {
  get edgeFunctions() {
    return PLATFORM_TOTALS.edgeFunctions - GENIE_COUNTS.edgeFunctions - HEALTHCARE_COUNTS.edgeFunctions;
  },
  get hooks() {
    return PLATFORM_TOTALS.hooks - GENIE_COUNTS.hooks - HEALTHCARE_COUNTS.hooks;
  },
  get databaseTables() {
    return PLATFORM_TOTALS.databaseTables - GENIE_COUNTS.databaseTables - HEALTHCARE_COUNTS.databaseTables;
  },
  get aiAgents() {
    return PLATFORM_TOTALS.aiAgents - GENIE_COUNTS.aiAgents - HEALTHCARE_COUNTS.aiAgents;
  },
  get mobileComponents() {
    return PLATFORM_TOTALS.mobileComponents - GENIE_COUNTS.mobileComponents - HEALTHCARE_COUNTS.mobileComponents;
  },
  get pages() {
    return PLATFORM_TOTALS.pages - GENIE_COUNTS.pages - HEALTHCARE_COUNTS.pages;
  },
  get components() {
    return PLATFORM_TOTALS.components - GENIE_COUNTS.components - HEALTHCARE_COUNTS.components;
  },
  get services() {
    return PLATFORM_TOTALS.services - GENIE_COUNTS.services - HEALTHCARE_COUNTS.services;
  },
};

// =============================================================================
// INFRASTRUCTURE METRICS (for UI display)
// =============================================================================
export const INFRASTRUCTURE_METRICS = {
  edgeFunctions: {
    total: PLATFORM_TOTALS.edgeFunctions,
    genieStudio: GENIE_COUNTS.edgeFunctions,
    healthcare: HEALTHCARE_COUNTS.edgeFunctions,
    get shared() { return SHARED_COUNTS.edgeFunctions; },
  },
  hooks: {
    total: PLATFORM_TOTALS.hooks,
    genieStudio: GENIE_COUNTS.hooks,
    healthcare: HEALTHCARE_COUNTS.hooks,
    get shared() { return SHARED_COUNTS.hooks; },
  },
  databaseTables: {
    total: PLATFORM_TOTALS.databaseTables,
    genieStudio: GENIE_COUNTS.databaseTables,
    healthcare: HEALTHCARE_COUNTS.databaseTables,
    get shared() { return SHARED_COUNTS.databaseTables; },
  },
  aiAgents: {
    total: PLATFORM_TOTALS.aiAgents,
    genieStudio: GENIE_COUNTS.aiAgents,
    healthcare: HEALTHCARE_COUNTS.aiAgents,
    get shared() { return SHARED_COUNTS.aiAgents; },
  },
  mobileComponents: {
    total: PLATFORM_TOTALS.mobileComponents,
    genieStudio: GENIE_COUNTS.mobileComponents,
    healthcare: HEALTHCARE_COUNTS.mobileComponents,
    get shared() { return SHARED_COUNTS.mobileComponents; },
  },
  pages: {
    total: PLATFORM_TOTALS.pages,
    genieStudio: GENIE_COUNTS.pages,
    healthcare: HEALTHCARE_COUNTS.pages,
    get shared() { return SHARED_COUNTS.pages; },
  },
  components: {
    total: PLATFORM_TOTALS.components,
    genieStudio: GENIE_COUNTS.components,
    healthcare: HEALTHCARE_COUNTS.components,
    get shared() { return SHARED_COUNTS.components; },
  },
  services: {
    total: PLATFORM_TOTALS.services,
    genieStudio: GENIE_COUNTS.services,
    healthcare: HEALTHCARE_COUNTS.services,
    get shared() { return SHARED_COUNTS.services; },
  },
};

// =============================================================================
// FINANCIAL METRICS
// =============================================================================
export const FINANCIAL_METRICS = {
  unitEconomics: {
    blendedLTV: 420,
    blendedCAC: 35,
    ltvCacRatio: 12,
    blendedARPU: 17.50,
    blendedChurn: 5,
    grossMargin: 85,
  },
  marketSize: {
    tam: '$500B+',
    sam: '$50B',
    som: '$5B',
    targetYear1ARR: '$2.4M',
    targetYear3ARR: '$50M',
  },
  lastUpdated: '2026-01-15',
} as const;

// =============================================================================
// HELPER FUNCTIONS FOR UI
// =============================================================================
export const getPhaseProgress = (phaseId: string) => {
  const phase = PHASES[phaseId];
  if (!phase) return { implemented: 0, total: 0, percentage: 0 };
  return {
    implemented: phase.implemented,
    total: phase.total,
    percentage: phase.total > 0 ? Math.round((phase.implemented / phase.total) * 100) : 0,
  };
};

export const getPhaseDisplayString = (phaseId: string) => {
  const { implemented, total, percentage } = getPhaseProgress(phaseId);
  return `${implemented}/${total} (${percentage}%)`;
};

export const getScenarioDisplayString = () => 
  `${SCENARIO_METRICS.implementedScenarios}/${SCENARIO_METRICS.totalScenarios}`;

export const getCompletionDisplayString = () => 
  `${SCENARIO_METRICS.completionPercentage}%`;

export const getCompletedPhasesString = () => 
  SCENARIO_METRICS.completedPhases.join(', ');

// =============================================================================
// VALIDATION
// =============================================================================
export const validateMetrics = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate phase data
  Object.entries(PHASES).forEach(([phaseId, phase]) => {
    if (phase.implemented > phase.total) {
      errors.push(`${phaseId}: implemented (${phase.implemented}) exceeds total (${phase.total})`);
    }
    if (phase.status === 'completed' && phase.implemented !== phase.total) {
      warnings.push(`${phaseId} marked complete but only ${phase.implemented}/${phase.total} implemented`);
    }
    if (phase.status === 'planned' && phase.implemented > 0) {
      warnings.push(`${phaseId} marked planned but has ${phase.implemented} implemented scenarios`);
    }
  });

  // Validate Genie counts don't exceed totals
  Object.keys(GENIE_COUNTS).forEach((key) => {
    const genieVal = GENIE_COUNTS[key as keyof typeof GENIE_COUNTS];
    const totalVal = PLATFORM_TOTALS[key as keyof typeof PLATFORM_TOTALS];
    if (totalVal && genieVal > totalVal) {
      errors.push(`Genie ${key} (${genieVal}) exceeds platform total (${totalVal})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    lastChecked: new Date().toISOString(),
  };
};

// =============================================================================
// METADATA
// =============================================================================
export const METRICS_METADATA = {
  version: '6.0.0',
  lastUpdated: '2026-01-28T02:00:00Z',
  lastAuditedBy: 'Full Ecosystem Audit',
  nextAuditDue: '2026-02-15',
  changeLog: [
    { date: '2026-01-28', change: 'P3 COMPLETE: All 66 scenarios implemented including 5 compliance checks', by: 'Dev Team' },
    { date: '2026-01-28', change: 'Added: pipeline_feedback + media_assets tables for Confidence Loop & versioning', by: 'Dev Team' },
    { date: '2026-01-28', change: 'Added: Admin Hub (8), Ask Genie (5), Pricing/Tier (6), Deck (4) scenarios to P3', by: 'Dev Team' },
    { date: '2026-01-28', change: 'Created content-compliance-check edge function for 5 compliance scenarios', by: 'Dev Team' },
    { date: '2026-01-28', change: 'Updated phase counts: P0(45), P1(42), P2(135), P3(66), P4(108), P5(28) = 424 total', by: 'Dev Team' },
    { date: '2026-01-16', change: 'Full consolidation: All docs now reference unified metrics', by: 'System' },
    { date: '2026-01-16', change: 'Added Label Studio (10 scenarios) to P3', by: 'Dev Team' },
    { date: '2026-01-15', change: 'Consolidated all metrics into UnifiedMetrics.ts (Single Source of Truth)', by: 'Architecture' },
  ],
};

// Re-export registry items for convenience
export { 
  GENIE_AI_AGENTS, 
  GENIE_EDGE_FUNCTIONS, 
  GENIE_DATABASE_TABLES,
  GENIE_HOOKS,
  GENIE_SERVICES,
  GENIE_PAGES,
  GENIE_DYNAMIC_METRICS,
};

