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
    total: 35, 
    implemented: 35, 
    status: 'completed', 
    weeks: '1-4',
    name: 'Core MVP Foundation'
  },
  P1: { 
    total: 32, 
    implemented: 32, 
    status: 'completed', 
    weeks: '5-8',
    name: 'Essential Production'
  },
  P2: { 
    total: 118, 
    implemented: 118, 
    status: 'completed', 
    weeks: '9-12',
    name: 'AI Agents & UX Polish'
  },
  P3: { 
    // UPDATED: 72 original + 58 consolidated = 130 total
    // Categories: Generation (12), Compliance (8), Session Advanced (10), 
    // Integrations (8), Analytics (10), Segment-Specific (22), Enterprise (18)
    total: 130, 
    implemented: 17, 
    status: 'in-progress', 
    weeks: '13-20',
    name: 'Differentiators & Go-Live'
  },
  P4: { 
    total: 50, 
    implemented: 0, 
    status: 'planned', 
    weeks: '21-26',
    name: 'Advanced Features'
  },
  P5: { 
    total: 28, 
    implemented: 0, 
    status: 'planned', 
    weeks: '27+',
    name: 'Enterprise & Scale'
  },
} as const;

// =============================================================================
// P3 CONSOLIDATED SCENARIO BREAKDOWN
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
  
  // PRIORITY 2: Core Generation (Weeks 14-15) - 12 scenarios
  generation: {
    batchScriptGeneration: { id: 'P3-GEN-01', name: 'Batch Script Generation', status: 'pending', priority: 2 },
    autoPublishScheduling: { id: 'P3-GEN-02', name: 'Auto-Publish Scheduling', status: 'pending', priority: 2 },
    multiLanguageQuickDub: { id: 'P3-GEN-03', name: 'Multi-Language Quick Dub', status: 'pending', priority: 2 },
    contentRecycling: { id: 'P3-GEN-04', name: 'Content Recycling Engine', status: 'pending', priority: 2 },
    templateVariants: { id: 'P3-GEN-05', name: 'Template Variant Generation', status: 'pending', priority: 2 },
    voiceCloning: { id: 'P3-GEN-06', name: 'Voice Cloning for Dubs', status: 'pending', priority: 2 },
  },
  
  // PRIORITY 3: Compliance & Legal (Weeks 15-16) - 8 scenarios
  compliance: {
    copyrightDetection: { id: 'P3-COMP-01', name: 'Copyright Detection', status: 'pending', priority: 3 },
    hipaaCompliance: { id: 'P3-COMP-02', name: 'HIPAA Compliance Check', status: 'pending', priority: 3 },
    gdprCompliance: { id: 'P3-COMP-03', name: 'GDPR Data Compliance', status: 'pending', priority: 3 },
    accessibilityWCAG: { id: 'P3-COMP-04', name: 'WCAG 2.1 AA Compliance', status: 'pending', priority: 3 },
    disclaimerInjection: { id: 'P3-COMP-05', name: 'Auto-Disclaimer Injection', status: 'pending', priority: 3 },
  },
  
  // PRIORITY 4: Analytics & Insights (Weeks 16-17) - 10 scenarios
  analytics: {
    performanceInsights: { id: 'P3-ANA-01', name: 'Performance Insights Dashboard', status: 'pending', priority: 4 },
    competitorAnalysis: { id: 'P3-ANA-02', name: 'Competitor Content Analysis', status: 'pending', priority: 4 },
    trendPrediction: { id: 'P3-ANA-03', name: 'Trend Prediction Engine', status: 'pending', priority: 4 },
    crossPlatformOptimization: { id: 'P3-ANA-04', name: 'Cross-Platform Optimization', status: 'pending', priority: 4 },
    engagementPrediction: { id: 'P3-ANA-05', name: 'Engagement Prediction AI', status: 'pending', priority: 4 },
    abTestingEngine: { id: 'P3-ANA-06', name: 'A/B Testing Framework', status: 'pending', priority: 4 },
  },
  
  // PRIORITY 5: Segment-Specific (Weeks 17-18) - 22 scenarios
  segmentSpecific: {
    // Healthcare
    patientEducation: { id: 'P3-SEG-01', name: 'Patient Education Videos', status: 'pending', priority: 5, segment: 'healthcare' },
    clinicalTrialContent: { id: 'P3-SEG-02', name: 'Clinical Trial Content', status: 'pending', priority: 5, segment: 'healthcare' },
    medicalTranscription: { id: 'P3-SEG-03', name: 'Medical Transcription', status: 'pending', priority: 5, segment: 'healthcare' },
    // Travel
    travelerKit: { id: 'P3-SEG-04', name: 'Traveler Content Kit', status: 'pending', priority: 5, segment: 'travel' },
    destinationShowcase: { id: 'P3-SEG-05', name: 'Destination Showcase', status: 'pending', priority: 5, segment: 'travel' },
    // Real Estate
    propertyTour: { id: 'P3-SEG-06', name: 'Property Virtual Tour', status: 'pending', priority: 5, segment: 'realestate' },
    listingOptimization: { id: 'P3-SEG-07', name: 'Listing Content Optimization', status: 'pending', priority: 5, segment: 'realestate' },
    // E-commerce
    productShowcase: { id: 'P3-SEG-08', name: 'Product Showcase Videos', status: 'pending', priority: 5, segment: 'ecommerce' },
    ugcCompilation: { id: 'P3-SEG-09', name: 'UGC Compilation Engine', status: 'pending', priority: 5, segment: 'ecommerce' },
  },
  
  // PRIORITY 6: External Integrations (Weeks 18-19) - 8 scenarios
  integrations: {
    adobeIntegration: { id: 'P3-INT-01', name: 'Adobe Creative Cloud', status: 'pending', priority: 6 },
    figmaIntegration: { id: 'P3-INT-02', name: 'Figma Design Import', status: 'pending', priority: 6 },
    canvaIntegration: { id: 'P3-INT-03', name: 'Canva Asset Import', status: 'pending', priority: 6 },
    youtubeStudioSync: { id: 'P3-INT-04', name: 'YouTube Studio Sync', status: 'pending', priority: 6 },
    tiktokCreatorTools: { id: 'P3-INT-05', name: 'TikTok Creator Tools', status: 'pending', priority: 6 },
  },
  
  // PRIORITY 7: Enterprise Features (Weeks 19-20) - 18 scenarios
  enterprise: {
    enterpriseSSO: { id: 'P3-ENT-01', name: 'Enterprise SSO (SAML/OIDC)', status: 'pending', priority: 7 },
    auditLogs: { id: 'P3-ENT-02', name: 'Comprehensive Audit Logs', status: 'pending', priority: 7 },
    whiteLabel: { id: 'P3-ENT-03', name: 'White-Label Customization', status: 'pending', priority: 7 },
    roleBasedAccess: { id: 'P3-ENT-04', name: 'Role-Based Access Control', status: 'pending', priority: 7 },
    apiRateLimiting: { id: 'P3-ENT-05', name: 'API Rate Limiting', status: 'pending', priority: 7 },
    customBranding: { id: 'P3-ENT-06', name: 'Custom Branding Portal', status: 'pending', priority: 7 },
  },
  
  // ALREADY IMPLEMENTED (17 scenarios)
  implemented: {
    legalReviewGate: { id: 'P3-IMP-01', name: 'Legal Review Gate', status: 'complete', priority: 0 },
    bulkOperations: { id: 'P3-IMP-02', name: 'Bulk Operations', status: 'complete', priority: 0 },
    workspaceCollaboration: { id: 'P3-IMP-03', name: 'Workspace Collaboration', status: 'complete', priority: 0 },
    advancedAnalyticsDashboard: { id: 'P3-IMP-04', name: 'Advanced Analytics Dashboard', status: 'complete', priority: 0 },
    templateMarketplace: { id: 'P3-IMP-05', name: 'Template Marketplace', status: 'complete', priority: 0 },
    // Plus 12 more from original P3
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
  version: '4.0.0',
  lastUpdated: '2026-01-16T10:00:00Z',
  lastAuditedBy: 'System Architect',
  nextAuditDue: '2026-02-01',
  changeLog: [
    { date: '2026-01-16', change: 'Consolidated 58 new P3 scenarios - total now 130 (was 72)', by: 'Dev Team' },
    { date: '2026-01-16', change: 'Added P3_SCENARIO_BREAKDOWN with priority categories', by: 'Architecture' },
    { date: '2026-01-16', change: 'Updated total scenarios from 335 to 393', by: 'System' },
    { date: '2026-01-15', change: 'Consolidated all metrics into UnifiedMetrics.ts', by: 'Architecture' },
    { date: '2026-01-15', change: 'Added P3 in-progress status with 17/72 implemented', by: 'Dev Team' },
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

