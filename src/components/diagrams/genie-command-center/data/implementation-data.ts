/**
 * Genie Command Center - Implementation Data
 * 
 * NOW IMPORTS FROM UNIFIED METRICS - Single Source of Truth
 * 
 * All phase data and infrastructure metrics are derived from:
 * src/genie-studio/governance/UnifiedMetrics.ts
 * 
 * AUDITED: 2026-01-15
 */

import type { ImplementationPhase, ScenarioCategory, StageGateItem, Product } from '../types';
import { 
  PHASES,
  SCENARIO_METRICS,
  PLATFORM_TOTALS,
  GENIE_COUNTS,
  HEALTHCARE_COUNTS,
  INFRASTRUCTURE_METRICS,
  getPhaseProgress,
} from '@/genie-studio/governance';

// =============================================================================
// IMPLEMENTATION PHASES (P0-P5) - DERIVED FROM UNIFIED METRICS
// =============================================================================
export const implementationPhases: ImplementationPhase[] = [
  {
    id: 'P0',
    name: PHASES.P0.name,
    weeks: PHASES.P0.weeks,
    status: PHASES.P0.status,
    completion: getPhaseProgress('P0').percentage,
    scenariosTotal: PHASES.P0.total,
    scenariosComplete: PHASES.P0.implemented,
    features: [
      { name: 'Script Management & Storage', status: 'done' },
      { name: 'TTS Multi-Provider Integration (Google, Azure, OpenAI, Amazon, ElevenLabs)', status: 'done' },
      { name: 'Recording Studio with Teleprompter', status: 'done' },
      { name: 'Export Pipeline (MP4, WAV, SRT)', status: 'done' },
      { name: 'Mind↔Vibe Bidirectional Bridge', status: 'done' },
      { name: 'Subscription Hooks & Credit System', status: 'done' },
      { name: 'User Authentication (Email/OAuth)', status: 'done' },
      { name: 'Agent Core Integration', status: 'done' },
      { name: 'Stripe Checkout & Portal', status: 'done' },
      { name: 'Module Access Control (RBAC)', status: 'done' },
    ],
  },
  {
    id: 'P1',
    name: PHASES.P1.name,
    weeks: PHASES.P1.weeks,
    status: PHASES.P1.status,
    completion: getPhaseProgress('P1').percentage,
    scenariosTotal: PHASES.P1.total,
    scenariosComplete: PHASES.P1.implemented,
    features: [
      { name: 'Route Guards & Protected Routes', status: 'done' },
      { name: 'Module Access Gates', status: 'done' },
      { name: 'Mobile Responsive Layouts', status: 'done' },
      { name: 'Pricing Page with Segment Filter', status: 'done' },
      { name: 'Customer Portal Integration', status: 'done' },
      { name: 'Subscription Extended Features', status: 'done' },
      { name: 'Free Trial Start/Expiration', status: 'partial' },
    ],
  },
  {
    id: 'P2',
    name: PHASES.P2.name,
    weeks: PHASES.P2.weeks,
    status: PHASES.P2.status,
    completion: getPhaseProgress('P2').percentage,
    scenariosTotal: PHASES.P2.total,
    scenariosComplete: PHASES.P2.implemented,
    features: [
      { name: 'Voice Coaching Agent', status: 'done' },
      { name: 'Scene Analysis Agent', status: 'done' },
      { name: 'Content Analyzer Agent', status: 'done' },
      { name: 'Universal AI Processor', status: 'done' },
      { name: 'PWA Installation', status: 'done' },
      { name: 'Service Worker Caching', status: 'done' },
      { name: 'Ask Genie Context-Aware Assistant', status: 'done' },
      { name: 'Guided Wizards (Spark 5-phase, Vibe 7-phase, Hub 7-phase)', status: 'done' },
      { name: 'Mobile Components (23 total)', status: 'done' },
      { name: 'Production Hub Kanban', status: 'done' },
      { name: 'Cross-Product Integration (Mind↔Vibe↔Spark↔Hub)', status: 'done' },
      { name: 'Context-Aware AI Assistance (1,318 lines)', status: 'done' },
    ],
  },
  {
    id: 'P3',
    name: PHASES.P3.name,
    weeks: PHASES.P3.weeks,
    status: PHASES.P3.status,
    completion: getPhaseProgress('P3').percentage,
    scenariosTotal: PHASES.P3.total,
    scenariosComplete: PHASES.P3.implemented,
    features: [
      { name: 'Landing Page (Genie Suite Marketing Website)', status: 'pending' },
      { name: 'Custom Domain & SSL Setup', status: 'pending' },
      { name: 'Bulk Video Generation', status: 'partial' },
      { name: 'Auto Thumbnail Creation (AI-powered)', status: 'done' },
      { name: 'SEO Optimization Tools', status: 'done' },
      { name: 'Social Cuts (Auto-format for TikTok/Reels)', status: 'done' },
      { name: 'Voice Cloning Integration', status: 'pending' },
      { name: 'B-Roll Library Integration', status: 'done' },
      { name: 'Platform Publishing (YouTube, LinkedIn)', status: 'done' },
      { name: 'Unified Content Tools Panel', status: 'done' },
      { name: 'Innovative Publishing (Thread Generator, Carousel Creator)', status: 'done' },
      { name: 'Bulk Content Panel (Batch Processing)', status: 'done' },
      { name: 'Integrations Settings Hub (OAuth Management)', status: 'done' },
      { name: 'Bulk Job Manager (DB-backed)', status: 'done' },
    ],
  },
  {
    id: 'P4',
    name: PHASES.P4.name,
    weeks: PHASES.P4.weeks,
    status: PHASES.P4.status,
    completion: getPhaseProgress('P4').percentage,
    scenariosTotal: PHASES.P4.total,
    scenariosComplete: PHASES.P4.implemented,
    features: [
      { name: 'Multi-Language Support (140+ languages via Synthesia parity)', status: 'pending' },
      { name: 'Real-time Collaboration', status: 'pending' },
      { name: 'Version Control & History', status: 'pending' },
      { name: 'Advanced Analytics Dashboard', status: 'pending' },
      { name: 'Compliance & Legal Review Gates', status: 'pending' },
      { name: 'HIPAA Full Certification', status: 'pending' },
    ],
  },
  {
    id: 'P5',
    name: PHASES.P5.name,
    weeks: PHASES.P5.weeks,
    status: PHASES.P5.status,
    completion: getPhaseProgress('P5').percentage,
    scenariosTotal: PHASES.P5.total,
    scenariosComplete: PHASES.P5.implemented,
    features: [
      { name: 'SSO/SAML Integration', status: 'pending' },
      { name: 'White-Label Options', status: 'pending' },
      { name: 'SLA Monitoring Dashboard', status: 'pending' },
      { name: 'Data Residency Controls', status: 'pending' },
      { name: 'Enterprise Admin Console', status: 'pending' },
      { name: 'Custom AI Model Training', status: 'pending' },
    ],
  },
];

// =============================================================================
// SCENARIO CATEGORIES (A-AF)
// =============================================================================
export const scenarioCategories: ScenarioCategory[] = [
  // P0 Categories (100% Complete - 35 scenarios)
  { id: 'A', name: 'Imagination → Production', range: '1-10', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P0' },
  { id: 'L', name: 'Bidirectional Mind↔Vibe', range: '61-65', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P0' },
  { id: 'M', name: 'Commercialization Infrastructure', range: '66-70', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P0' },
  { id: 'Q', name: 'Agent Integration Core', range: '111-120', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P0' },
  { id: 'S', name: 'Subscription & Access', range: '141-150', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P0' },
  
  // P1 Categories (100% Complete - 32 scenarios)
  { id: 'B', name: 'Upload → Production', range: '11-16', total: 6, implemented: 6, partial: 0, pending: 0, phase: 'P1' },
  { id: 'D', name: 'Record → Refine Loops', range: '21-24', total: 4, implemented: 4, partial: 0, pending: 0, phase: 'P1' },
  { id: 'M2', name: 'Access Control', range: '71-75', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P1' },
  { id: 'N', name: 'Mobile-First Features', range: '81-90', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P1' },
  { id: 'S2', name: 'Subscription Extended', range: '151-157', total: 7, implemented: 7, partial: 0, pending: 0, phase: 'P1' },
  
  // P2 Categories (100% Complete - 118 scenarios)
  { id: 'C', name: 'Video → Script → Enhance', range: '17-20', total: 4, implemented: 4, partial: 0, pending: 0, phase: 'P2' },
  { id: 'E', name: 'Hybrid & Cross-Studio', range: '25-32', total: 8, implemented: 8, partial: 0, pending: 0, phase: 'P2' },
  { id: 'M3', name: 'Public Landing & Pricing', range: '76-80', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P2' },
  { id: 'P', name: 'Remix & Clip Assembly', range: '101-110', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P2' },
  { id: 'Q2', name: 'Agent Advanced', range: '121-125', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P2' },
  { id: 'T', name: 'Mobile Deployment (PWA)', range: '156-165', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P2' },
  { id: 'U', name: 'P2 AI Agents (12 agents)', range: '166-177', total: 12, implemented: 12, partial: 0, pending: 0, phase: 'P2' },
  { id: 'V', name: 'Cross-Product Integration', range: '178-195', total: 18, implemented: 18, partial: 0, pending: 0, phase: 'P2' },
  { id: 'W', name: 'Guided Experiences', range: '196-210', total: 15, implemented: 15, partial: 0, pending: 0, phase: 'P2' },
  { id: 'X', name: 'Ask Genie Context-Aware', range: '211-225', total: 15, implemented: 15, partial: 0, pending: 0, phase: 'P2' },
  { id: 'AE', name: 'Advanced Editing & Timeline', range: '297-305', total: 9, implemented: 9, partial: 0, pending: 0, phase: 'P2' },
  { id: 'AF', name: 'AI-Powered Editing Tools', range: '306-313', total: 7, implemented: 7, partial: 0, pending: 0, phase: 'P2' },
  
  // P3 Categories (In Progress - 72 scenarios, 16 implemented)
  { id: 'F', name: 'Generation & Automation', range: '33-42', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P3' },
  { id: 'G', name: 'Compliance & Legal', range: '43-46', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P3' },
  { id: 'O', name: 'Segment-Specific Features', range: '91-100', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P3' },
  { id: 'R', name: 'API Integration', range: '126-135', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P3' },
  { id: 'Y', name: 'Bulk Processing', range: '226-237', total: 12, implemented: 0, partial: 0, pending: 12, phase: 'P3' },
  { id: 'Z', name: 'Content Tools (SEO, Thumbnails, etc)', range: '238-253', total: 16, implemented: 16, partial: 0, pending: 0, phase: 'P3' },
  { id: 'AA', name: 'Go-Live Website', range: '254-263', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P3' },
  
  // P4 Categories (Planned - 50 scenarios)
  { id: 'H', name: 'Recovery & Error Handling', range: '47-50', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P4' },
  { id: 'I', name: 'Multi-Language & Localization', range: '51-54', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P4' },
  { id: 'J', name: 'Collaboration & Handoffs', range: '55-58', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P4' },
  { id: 'K', name: 'Versioning & Archival', range: '59-60', total: 2, implemented: 0, partial: 0, pending: 2, phase: 'P4' },
  { id: 'R2', name: 'External API Integration', range: '136-140', total: 5, implemented: 0, partial: 0, pending: 5, phase: 'P4' },
  { id: 'AB', name: 'Advanced Analytics', range: '264-294', total: 31, implemented: 0, partial: 0, pending: 31, phase: 'P4' },
  
  // P5 Categories (Enterprise - 28 scenarios)
  { id: 'AC', name: 'Enterprise SSO/SAML', range: '295-302', total: 8, implemented: 0, partial: 0, pending: 8, phase: 'P5' },
  { id: 'AD', name: 'White-Label & Custom', range: '303-310', total: 8, implemented: 0, partial: 0, pending: 8, phase: 'P5' },
  { id: 'AE2', name: 'HIPAA & Compliance', range: '311-315', total: 5, implemented: 0, partial: 0, pending: 5, phase: 'P5' },
  { id: 'AF2', name: 'Data Residency', range: '316-322', total: 7, implemented: 0, partial: 0, pending: 7, phase: 'P5' },
];

// =============================================================================
// STAGE GATE CHECKLIST
// =============================================================================
export const stageGateChecklist: StageGateItem[] = [
  // Authentication & Authorization - ALL DONE
  { category: 'Authentication', item: 'Email/Password Authentication (Supabase Auth)', status: 'done', priority: 'Critical' },
  { category: 'Authentication', item: 'Google OAuth Integration', status: 'done', priority: 'Critical' },
  { category: 'Authentication', item: 'Session Management', status: 'done', priority: 'Critical' },
  { category: 'Authentication', item: 'Password Reset Flow', status: 'done', priority: 'High' },
  { category: 'Authentication', item: 'MFA/2FA Support', status: 'pending', priority: 'Medium' },
  
  // Authorization - ALL DONE
  { category: 'Authorization', item: 'Role-Based Access Control (RBAC)', status: 'done', priority: 'Critical' },
  { category: 'Authorization', item: 'Row Level Security (RLS) Policies', status: 'done', priority: 'Critical' },
  { category: 'Authorization', item: 'Module Access Gates (useModuleAccess)', status: 'done', priority: 'Critical' },
  { category: 'Authorization', item: 'Route Guards', status: 'done', priority: 'High' },
  { category: 'Authorization', item: 'API Rate Limiting', status: 'done', priority: 'High' },
  
  // Subscriptions & Billing - ALL DONE
  { category: 'Subscriptions', item: 'Stripe Integration (checkout, portal)', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Subscription Plans (Free, Starter, Business, Pro, Enterprise)', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Credit System (ai_credit_packages, transactions)', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Credit Purchase Flow', status: 'done', priority: 'High' },
  { category: 'Subscriptions', item: 'Plan Upgrade/Downgrade', status: 'done', priority: 'High' },
  { category: 'Subscriptions', item: 'Usage Tracking', status: 'done', priority: 'High' },
  { category: 'Subscriptions', item: 'Trial Period Management', status: 'in-progress', priority: 'Medium', notes: 'Start works, expiration partial' },
  
  // Core Features - ALL DONE
  { category: 'Core Features', item: 'Script Management (GenieMind)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'TTS Multi-Provider (5 providers)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Recording Studio (GenieVibe)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Export Pipeline (MP4, WAV, SRT)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Agent System (agent_sessions, agents tables)', status: 'done', priority: 'High' },
  { category: 'Core Features', item: 'Ask Genie AI Assistant', status: 'done', priority: 'High' },
  { category: 'Core Features', item: 'Mobile Responsive (23 components)', status: 'done', priority: 'High' },
  { category: 'Core Features', item: 'PWA Installation', status: 'done', priority: 'Medium' },
  
  // Infrastructure - MIXED
  { category: 'Infrastructure', item: 'Supabase Backend', status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: `Edge Functions (${PLATFORM_TOTALS.edgeFunctions}+ deployed)`, status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: 'Database Backups', status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: 'CDN for Assets', status: 'done', priority: 'High' },
  { category: 'Infrastructure', item: 'Error Monitoring (Sentry)', status: 'pending', priority: 'High' },
  
  // Legal & Compliance - PENDING
  { category: 'Legal', item: 'Terms of Service', status: 'pending', priority: 'Critical' },
  { category: 'Legal', item: 'Privacy Policy', status: 'pending', priority: 'Critical' },
  { category: 'Legal', item: 'Cookie Consent', status: 'pending', priority: 'High' },
  { category: 'Legal', item: 'GDPR Compliance', status: 'pending', priority: 'High' },
  
  // Go-Live Website - P3
  { category: 'Go-Live Website', item: 'Landing Page (Genie Suite Marketing)', status: 'pending', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Custom Domain Setup', status: 'pending', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Pricing Page with Plan Comparison', status: 'done', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Login/Signup Page', status: 'done', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Stripe Checkout Integration', status: 'done', priority: 'Critical' },
];

// =============================================================================
// PRODUCTS
// =============================================================================
export const products: Product[] = [
  {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI-Powered Script Intelligence',
    description: 'Transform ideas into polished scripts with AI assistance.',
    icon: '🧠',
    color: 'hsl(258, 90%, 66%)',
    wowFeatures: [
      'Natural language → production-ready script in 60 seconds',
      'Platform-optimized formatting (YouTube, TikTok, LinkedIn)',
      'Bidirectional sync with Vibe recording studio',
    ],
    status: 'complete',
    phase: 'P0',
    scenariosCovered: 25,
    agents: ['script_generator_agent', 'content_analyzer_agent', 'seo_optimizer_agent'],
    apis: ['ai-universal-processor', 'analyze-script', 'enhance-script'],
  },
  {
    id: 'ask',
    name: 'Ask Genie',
    tagline: 'Your Context-Aware AI Guide',
    description: 'Conversational AI that guides you through the entire production process.',
    icon: '✨',
    color: 'hsl(38, 92%, 50%)',
    wowFeatures: [
      'Knows your exact project state across all products',
      'Proactive suggestions with visual workflow diagrams',
      '1,318 lines of personality-driven AI assistance',
    ],
    status: 'complete',
    phase: 'P2',
    scenariosCovered: 15,
    agents: ['conversation_agent', 'suggestion_agent'],
    apis: ['ai-universal-processor', 'genie-chat'],
  },
  {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Production & Recording Studio',
    description: 'Professional recording studio with 5-stage pipeline.',
    icon: '🎬',
    color: 'hsl(350, 70%, 50%)',
    wowFeatures: [
      'Script-synced teleprompter with AI pacing',
      'One-click multi-format export (vertical, square, widescreen)',
      '15 shared components, 7-phase guided wizard',
    ],
    status: 'complete',
    phase: 'P0',
    scenariosCovered: 40,
    agents: ['tts_orchestrator_agent', 'recording_agent', 'voice_director_agent', 'scene_analyzer_agent'],
    apis: ['text-to-speech', 'audio-mixer', 'auto-thumbnail-generator', 'scene-analyzer'],
  },
  {
    id: 'arc',
    name: 'Genie Arc',
    tagline: 'Agent Builder & Workflows',
    description: 'Build custom agents and automation workflows.',
    icon: '🔄',
    color: 'hsl(160, 84%, 39%)',
    wowFeatures: [
      'Visual agent builder with workflow canvas',
      'Podcast-to-video conversion pipeline',
      'Direct integration with Production Hub',
    ],
    status: 'complete',
    phase: 'P0',
    scenariosCovered: 15,
    agents: ['workflow_executor', 'agent_generator'],
    apis: ['generate-agent-from-prompt', 'workflow-executor'],
  },
  {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Quick-Start Content Creation',
    description: 'Jump-start your production with 5-phase guided wizard.',
    icon: '⚡',
    color: 'hsl(199, 89%, 48%)',
    wowFeatures: [
      'Image → Script generation in seconds',
      '5-phase guided wizard for complete beginners',
      'One-tap export to any Genie product',
    ],
    status: 'complete',
    phase: 'P2',
    scenariosCovered: 20,
    agents: ['template_agent', 'quick_start_agent'],
    apis: ['ai-image-generator', 'gemini-generate-image'],
  },
  {
    id: 'hub',
    name: 'Production Hub',
    tagline: 'Orchestrate Your Content Pipeline',
    description: 'Team collaboration hub with vertical Kanban swimlanes.',
    icon: '🎯',
    color: 'hsl(215, 16%, 47%)',
    wowFeatures: [
      'Visual Kanban with drag-and-drop across categories',
      'Multi-stakeholder approval chains',
      '7-phase guided wizard for complex productions',
    ],
    status: 'complete',
    phase: 'P2',
    scenariosCovered: 20,
    agents: ['production_orchestrator_agent', 'approval_workflow_agent'],
    apis: ['workspace-collaboration', 'distribution-agent'],
  },
];

// =============================================================================
// CALCULATED TOTALS - DERIVED FROM UNIFIED METRICS
// =============================================================================
export const getTotalScenarios = () => SCENARIO_METRICS.totalScenarios;
export const getImplementedScenarios = () => SCENARIO_METRICS.implementedScenarios;
export const getPendingScenarios = () => SCENARIO_METRICS.totalScenarios - SCENARIO_METRICS.implementedScenarios;
export const getOverallProgress = () => SCENARIO_METRICS.completionPercentage;

// Phase-specific calculations
export const getPhaseStats = (phaseId: string) => {
  const progress = getPhaseProgress(phaseId);
  return { 
    total: progress.total, 
    implemented: progress.implemented, 
    partial: 0, 
    pending: progress.total - progress.implemented,
    completion: progress.percentage 
  };
};

// =============================================================================
// INFRASTRUCTURE METRICS - FROM UNIFIED SOURCE
// =============================================================================
export const infrastructureMetrics = {
  edgeFunctions: {
    total: INFRASTRUCTURE_METRICS.edgeFunctions.total,
    genieStudio: INFRASTRUCTURE_METRICS.edgeFunctions.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.edgeFunctions.healthcare,
    shared: INFRASTRUCTURE_METRICS.edgeFunctions.shared,
  },
  hooks: {
    total: INFRASTRUCTURE_METRICS.hooks.total,
    genieStudio: INFRASTRUCTURE_METRICS.hooks.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.hooks.healthcare,
    shared: INFRASTRUCTURE_METRICS.hooks.shared,
  },
  databaseTables: {
    total: INFRASTRUCTURE_METRICS.databaseTables.total,
    genieStudio: INFRASTRUCTURE_METRICS.databaseTables.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.databaseTables.healthcare,
    shared: INFRASTRUCTURE_METRICS.databaseTables.shared,
  },
  aiAgents: {
    total: INFRASTRUCTURE_METRICS.aiAgents.total,
    genieStudio: INFRASTRUCTURE_METRICS.aiAgents.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.aiAgents.healthcare,
    shared: INFRASTRUCTURE_METRICS.aiAgents.shared,
  },
  mobileComponents: {
    total: INFRASTRUCTURE_METRICS.mobileComponents.total,
    genieStudio: INFRASTRUCTURE_METRICS.mobileComponents.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.mobileComponents.healthcare,
    shared: INFRASTRUCTURE_METRICS.mobileComponents.shared,
  },
  apiServices: {
    total: INFRASTRUCTURE_METRICS.services.total,
    genieStudio: INFRASTRUCTURE_METRICS.services.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.services.healthcare,
    shared: INFRASTRUCTURE_METRICS.services.shared,
  },
  components: {
    total: INFRASTRUCTURE_METRICS.components.total,
    genieStudio: INFRASTRUCTURE_METRICS.components.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.components.healthcare,
    shared: INFRASTRUCTURE_METRICS.components.shared,
  },
  pages: {
    total: INFRASTRUCTURE_METRICS.pages.total,
    genieStudio: INFRASTRUCTURE_METRICS.pages.genieStudio,
    healthcare: INFRASTRUCTURE_METRICS.pages.healthcare,
    shared: INFRASTRUCTURE_METRICS.pages.shared,
  }
};

// Legacy exports for backward compatibility
export const edgeFunctionCount = PLATFORM_TOTALS.edgeFunctions;
export const hooksCount = PLATFORM_TOTALS.hooks;
export const databaseTablesCount = PLATFORM_TOTALS.databaseTables;
export const mobileComponentCount = PLATFORM_TOTALS.mobileComponents;
export const aiAgentCount = PLATFORM_TOTALS.aiAgents;

// Product-Scenario Cross-Reference
export const productScenarioMapping = {
  mind: { implemented: 32, total: 45, crossFunctional: ['vibe', 'spark', 'hub'] },
  vibe: { implemented: 52, total: 65, crossFunctional: ['mind', 'spark', 'hub'] },
  spark: { implemented: 25, total: 35, crossFunctional: ['mind', 'vibe'] },
  arc: { implemented: 18, total: 28, crossFunctional: ['hub', 'vibe'] },
  hub: { implemented: 22, total: 32, crossFunctional: ['arc', 'vibe', 'mind'] },
  askGenie: { implemented: 16, total: 20, crossFunctional: ['mind', 'vibe', 'spark', 'arc', 'hub'] },
};
