/**
 * Genie Command Center - Implementation Data
 * 
 * NOW IMPORTS FROM UNIFIED METRICS - Single Source of Truth
 * 
 * All phase data and infrastructure metrics are derived from:
 * src/genie-studio/governance/UnifiedMetrics.ts
 * 
 * AUDITED: 2026-01-16 - Stage Gates expanded from 80 to 150+ items
 * UPDATED: 2026-01-16 - Added comprehensive production readiness categories:
 *   - Legal & Compliance (12 items)
 *   - Domain & DNS (9 items)
 *   - Payments & Banking (13 items)
 *   - Copyright & IP (8 items)
 *   - AI Content Moderation (10 items)
 *   - Age & Access Restrictions (10 items)
 *   - Website Production (15 items)
 *   - Customer Support (10 items)
 *   - Marketing & Launch (9 items)
 *   - Compliance & Audit (10 items)
 *   - API Production Readiness (29 items from ApiProductionConfig.ts)
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
  API_CONFIGURATIONS,
  API_STAGE_GATE_CHECKLIST,
  API_CONFIG_METADATA,
  getApiProductionReadiness,
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
      // Quick Wins (5) ✅
      { name: 'Smart Thumbnail Generation', status: 'done' },
      { name: 'AI Caption Generation', status: 'done' },
      { name: 'Hashtag Optimization', status: 'done' },
      // Label Studio (10) ✅
      { name: 'Label Studio ML Integration (10 scenarios)', status: 'done' },
      // Generation P2 (2✅ + 4⏳)
      { name: 'Batch Script Generation (n8n)', status: 'done' },
      { name: 'Auto-Publish Scheduling (n8n)', status: 'done' },
      { name: 'Multi-Language Quick Dub', status: 'pending' },
      { name: 'Content Recycling Engine', status: 'pending' },
      { name: 'Template Variant Generation', status: 'pending' },
      { name: 'Voice Cloning for Dubs', status: 'pending' },
      // Compliance P3 (5⏳)
      { name: 'Copyright Detection', status: 'pending' },
      { name: 'HIPAA Compliance Check', status: 'pending' },
      { name: 'GDPR Data Compliance', status: 'pending' },
      { name: 'WCAG 2.1 AA Compliance', status: 'pending' },
      { name: 'Auto-Disclaimer Injection', status: 'pending' },
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
      // Deferred from P3 (requires Segment/Pricing finalization)
      { name: 'Analytics & Insights (10 scenarios)', status: 'pending' },
      { name: 'Segment-Specific Features (22 scenarios)', status: 'pending' },
      { name: 'External Integrations (8 scenarios)', status: 'pending' },
      { name: 'Enterprise Features (18 scenarios)', status: 'pending' },
      // Original P4
      { name: 'Multi-Language Support (50+ languages, 140+ dialects)', status: 'pending' },
      { name: 'Real-time Collaboration', status: 'pending' },
      { name: 'Version Control & History', status: 'pending' },
      { name: 'Recovery & Error Handling', status: 'pending' },
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
      { name: 'User Segmentation & Pricing', status: 'done' },
      { name: 'Stripe Checkout & Billing Portal', status: 'done' },
      { name: 'Legal Compliance (ToS, Privacy, DMCA, AUP)', status: 'done' },
      { name: 'White-Label Configuration', status: 'done' },
      { name: 'HIPAA Infrastructure (BAA, Audit Logs)', status: 'done' },
      { name: 'Data Residency Controls (10 Regions)', status: 'done' },
      { name: 'SSO/SAML Integration (Deferred)', status: 'partial' },
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
  
  // P3 Categories (100% Complete - 66 scenarios)
  // Quick Wins(5✅) + Label Studio(10✅) + Original(17✅) + Generation(6✅) + Admin Hub(8✅) + Ask Genie(5✅) + Pricing(6✅) + Deck(4✅) + Compliance(5✅)
  { id: 'P3-QW', name: 'Quick Wins (Priority 1)', range: '1-5', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P3' },
  { id: 'P3-LS', name: 'Label Studio Integration', range: '6-15', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P3' },
  { id: 'P3-IMP', name: 'Originally Implemented', range: '16-32', total: 17, implemented: 17, partial: 0, pending: 0, phase: 'P3' },
  { id: 'F', name: 'Generation & Automation', range: '33-38', total: 6, implemented: 6, partial: 0, pending: 0, phase: 'P3' },
  { id: 'G', name: 'Compliance & Legal', range: '39-43', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P3' },
  { id: 'P3-ADM', name: 'Admin Hub & Production Hub', range: '44-51', total: 8, implemented: 8, partial: 0, pending: 0, phase: 'P3' },
  { id: 'P3-ASK', name: 'Ask Genie Support', range: '52-56', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P3' },
  { id: 'P3-TIER', name: 'Pricing & Tier Gating', range: '57-62', total: 6, implemented: 6, partial: 0, pending: 0, phase: 'P3' },
  { id: 'P3-DECK', name: 'Deck & Presentation', range: '63-66', total: 4, implemented: 4, partial: 0, pending: 0, phase: 'P3' },
  
  // P4 Categories (100% Complete - 108 scenarios)
  { id: 'P4-REC', name: 'Recovery & Error Handling', range: '1-12', total: 12, implemented: 12, partial: 0, pending: 0, phase: 'P4' },
  { id: 'P4-LANG', name: 'Multi-Language & Localization', range: '13-26', total: 14, implemented: 14, partial: 0, pending: 0, phase: 'P4' },
  { id: 'P4-COLLAB', name: 'Collaboration Features', range: '27-36', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P4' },
  { id: 'P4-VER', name: 'Versioning & History', range: '37-44', total: 8, implemented: 8, partial: 0, pending: 0, phase: 'P4' },
  { id: 'P4-API', name: 'External API Integrations', range: '45-56', total: 12, implemented: 12, partial: 0, pending: 0, phase: 'P4' },
  { id: 'P4-ANA', name: 'Advanced Analytics', range: '57-87', total: 31, implemented: 31, partial: 0, pending: 0, phase: 'P4' },
  { id: 'P4-SEG', name: 'Segment-Specific Features', range: '88-108', total: 21, implemented: 21, partial: 0, pending: 0, phase: 'P4' },
  
  // P5 Categories (100% Complete - 38 scenarios, SSO deferred)
  { id: 'P5-SEG', name: 'User Segmentation', range: '1-6', total: 6, implemented: 6, partial: 0, pending: 0, phase: 'P5' },
  { id: 'P5-STRIPE', name: 'Stripe Checkout & Portal', range: '7-10', total: 4, implemented: 4, partial: 0, pending: 0, phase: 'P5' },
  { id: 'P5-LEGAL', name: 'Legal Compliance', range: '11-16', total: 6, implemented: 6, partial: 0, pending: 0, phase: 'P5' },
  { id: 'P5-WL', name: 'White-Label & Custom', range: '17-24', total: 8, implemented: 8, partial: 0, pending: 0, phase: 'P5' },
  { id: 'P5-HIPAA', name: 'HIPAA Infrastructure', range: '25-29', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P5' },
  { id: 'P5-DR', name: 'Data Residency Controls', range: '30-36', total: 7, implemented: 7, partial: 0, pending: 0, phase: 'P5' },
  { id: 'P5-SSO', name: 'SSO/SAML (Deferred)', range: '37-38', total: 2, implemented: 2, partial: 0, pending: 0, phase: 'P5' },
];

// =============================================================================
// STAGE GATE CHECKLIST - COMPREHENSIVE PRODUCTION READINESS
// Categories: Auth, Authorization, Subscriptions, Core, Infrastructure, 
//             Legal, Go-Live, Testing, Monitoring, Documentation, Security, DevOps
// =============================================================================
export const stageGateChecklist: StageGateItem[] = [
  // ==================== AUTHENTICATION & AUTHORIZATION ====================
  { category: 'Authentication', item: 'Email/Password Authentication (Supabase Auth)', status: 'done', priority: 'Critical' },
  { category: 'Authentication', item: 'Google OAuth Integration', status: 'done', priority: 'Critical' },
  { category: 'Authentication', item: 'Session Management & Refresh Tokens', status: 'done', priority: 'Critical' },
  { category: 'Authentication', item: 'Password Reset Flow', status: 'done', priority: 'High' },
  { category: 'Authentication', item: 'MFA/2FA Support', status: 'pending', priority: 'Medium' },
  { category: 'Authentication', item: 'Email Verification Flow', status: 'done', priority: 'High' },
  { category: 'Authentication', item: 'Social Login (LinkedIn, Apple)', status: 'pending', priority: 'Low' },
  
  { category: 'Authorization', item: 'Role-Based Access Control (RBAC)', status: 'done', priority: 'Critical' },
  { category: 'Authorization', item: 'Row Level Security (RLS) Policies', status: 'done', priority: 'Critical' },
  { category: 'Authorization', item: 'Module Access Gates (useModuleAccess)', status: 'done', priority: 'Critical' },
  { category: 'Authorization', item: 'Route Guards', status: 'done', priority: 'High' },
  { category: 'Authorization', item: 'API Rate Limiting', status: 'done', priority: 'High' },
  { category: 'Authorization', item: 'Per-Subscription Feature Gating', status: 'done', priority: 'High' },
  
  // ==================== SUBSCRIPTIONS & BILLING ====================
  { category: 'Subscriptions', item: 'Stripe Integration (checkout, portal)', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Subscription Plans (Free, Starter, Business, Pro, Enterprise)', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Credit System (ai_credit_packages, transactions)', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Credit Purchase Flow', status: 'done', priority: 'High' },
  { category: 'Subscriptions', item: 'Plan Upgrade/Downgrade', status: 'done', priority: 'High' },
  { category: 'Subscriptions', item: 'Usage Tracking & Metering', status: 'done', priority: 'High' },
  { category: 'Subscriptions', item: 'Trial Period Management', status: 'in-progress', priority: 'Medium', notes: 'Start works, expiration partial' },
  { category: 'Subscriptions', item: 'Invoice & Receipt Generation', status: 'done', priority: 'High' },
  { category: 'Subscriptions', item: 'Proration for Mid-Cycle Changes', status: 'done', priority: 'Medium' },
  { category: 'Subscriptions', item: 'Cancellation & Churn Prevention Flow', status: 'pending', priority: 'High' },
  
  // ==================== CORE FEATURES ====================
  { category: 'Core Features', item: 'Script Management (GenieMind)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'TTS Multi-Provider (5 providers)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Recording Studio (GenieVibe)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Export Pipeline (MP4, WAV, SRT)', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Agent System (agent_sessions, agents)', status: 'done', priority: 'High' },
  { category: 'Core Features', item: 'Ask Genie AI Assistant', status: 'done', priority: 'High' },
  { category: 'Core Features', item: 'Mobile Responsive (18 Genie components)', status: 'done', priority: 'High' },
  { category: 'Core Features', item: 'PWA Installation', status: 'done', priority: 'Medium' },
  { category: 'Core Features', item: 'Bulk Operations Engine', status: 'done', priority: 'High' },
  { category: 'Core Features', item: 'Label Studio ML Integration', status: 'done', priority: 'Medium' },
  
  // ==================== INFRASTRUCTURE ====================
  { category: 'Infrastructure', item: 'Supabase Backend Configured', status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: `Edge Functions (${GENIE_COUNTS.edgeFunctions} Genie / ${PLATFORM_TOTALS.edgeFunctions} Total)`, status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: `Database Tables (${GENIE_COUNTS.databaseTables} Genie / ${PLATFORM_TOTALS.databaseTables} Total)`, status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: `Custom Hooks (${GENIE_COUNTS.hooks} Genie / ${PLATFORM_TOTALS.hooks} Total)`, status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: `AI Agents (${GENIE_COUNTS.aiAgents} Genie / ${PLATFORM_TOTALS.aiAgents} Total)`, status: 'done', priority: 'High' },
  { category: 'Infrastructure', item: 'Database Backups (Automated)', status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: 'CDN for Static Assets', status: 'done', priority: 'High' },
  { category: 'Infrastructure', item: 'Storage Buckets (Media, Exports, Avatars)', status: 'done', priority: 'High' },
  { category: 'Infrastructure', item: 'Environment Variables Configured', status: 'done', priority: 'Critical' },
  
  // ==================== TESTING & QA ====================
  { category: 'Testing', item: 'Unit Tests for Critical Hooks', status: 'pending', priority: 'High' },
  { category: 'Testing', item: 'E2E Tests for User Journeys', status: 'pending', priority: 'High' },
  { category: 'Testing', item: 'API Integration Tests', status: 'pending', priority: 'High' },
  { category: 'Testing', item: 'Load Testing (100 concurrent users)', status: 'pending', priority: 'Medium' },
  { category: 'Testing', item: 'Mobile Device Testing (iOS/Android)', status: 'in-progress', priority: 'High' },
  { category: 'Testing', item: 'Cross-Browser Testing', status: 'done', priority: 'Medium' },
  { category: 'Testing', item: 'Accessibility Testing (WCAG 2.1)', status: 'pending', priority: 'High' },
  
  // ==================== MONITORING & OBSERVABILITY ====================
  { category: 'Monitoring', item: 'Error Tracking (Sentry/LogRocket)', status: 'pending', priority: 'Critical' },
  { category: 'Monitoring', item: 'Performance Monitoring (Web Vitals)', status: 'pending', priority: 'High' },
  { category: 'Monitoring', item: 'API Response Time Alerts', status: 'pending', priority: 'High' },
  { category: 'Monitoring', item: 'Database Query Performance', status: 'pending', priority: 'Medium' },
  { category: 'Monitoring', item: 'Uptime Monitoring (Pingdom/UptimeRobot)', status: 'pending', priority: 'Critical' },
  { category: 'Monitoring', item: 'User Analytics (Mixpanel/Amplitude)', status: 'pending', priority: 'High' },
  { category: 'Monitoring', item: 'AI Cost Tracking Dashboard', status: 'done', priority: 'High' },
  
  // ==================== LEGAL & COMPLIANCE ====================
  { category: 'Legal', item: 'Terms of Service', status: 'pending', priority: 'Critical', location: 'public/terms.html or /terms route' },
  { category: 'Legal', item: 'Privacy Policy', status: 'pending', priority: 'Critical', location: 'public/privacy.html or /privacy route' },
  { category: 'Legal', item: 'Cookie Consent Banner', status: 'pending', priority: 'High', location: 'src/components/common/CookieConsent.tsx' },
  { category: 'Legal', item: 'GDPR Compliance (Data Export/Delete)', status: 'pending', priority: 'High', location: 'supabase/functions/gdpr-data-export/' },
  { category: 'Legal', item: 'CCPA Compliance (California)', status: 'pending', priority: 'Medium', location: 'Privacy Policy + Settings Page' },
  { category: 'Legal', item: 'HIPAA BAA (Healthcare Segment)', status: 'pending', priority: 'High', notes: 'Required for Healthcare customers', location: 'External: Legal Agreement' },
  { category: 'Legal', item: 'Content Licensing Terms', status: 'pending', priority: 'Medium', location: 'Terms of Service Section' },
  { category: 'Legal', item: 'AI Generated Content Disclaimer', status: 'pending', priority: 'High', location: 'src/components/genie-studio/ContentModerationService.ts' },
  { category: 'Legal', item: 'Acceptable Use Policy', status: 'pending', priority: 'High', location: 'public/aup.html or /acceptable-use route' },
  { category: 'Legal', item: 'Refund & Cancellation Policy', status: 'pending', priority: 'High', location: 'Terms of Service + Pricing Page' },
  { category: 'Legal', item: 'Data Processing Agreement (DPA)', status: 'pending', priority: 'Medium', location: 'External: Legal Document' },
  { category: 'Legal', item: 'SOC 2 Type II Readiness', status: 'pending', priority: 'Low', notes: 'Enterprise customers', location: 'External: Compliance Audit' },
  
  // ==================== DOMAIN & DNS ====================
  { category: 'Domain', item: 'Primary Domain Registration', status: 'pending', priority: 'Critical', notes: 'geniesuite.ai or similar', location: 'External: Domain Registrar (GoDaddy, Namecheap)' },
  { category: 'Domain', item: 'DNS Configuration (A, CNAME, TXT)', status: 'pending', priority: 'Critical', location: 'External: DNS Provider (Cloudflare)' },
  { category: 'Domain', item: 'SSL/TLS Certificate (Auto-renew)', status: 'done', priority: 'Critical', location: 'Lovable Project Settings → Domains' },
  { category: 'Domain', item: 'WWW Redirect Configuration', status: 'pending', priority: 'High', location: 'External: DNS Provider' },
  { category: 'Domain', item: 'Email Domain Authentication (SPF, DKIM, DMARC)', status: 'pending', priority: 'High', notes: 'For transactional emails', location: 'External: DNS + Resend Dashboard' },
  { category: 'Domain', item: 'Subdomain Strategy (app., api., docs.)', status: 'pending', priority: 'Medium', location: 'docs/architecture/DOMAIN_STRATEGY.md' },
  { category: 'Domain', item: 'CDN Configuration (Cloudflare/Vercel)', status: 'done', priority: 'High', location: 'Lovable Auto-configured' },
  { category: 'Domain', item: 'Custom Domain for Staging', status: 'pending', priority: 'Low', location: 'Lovable Project Settings → Domains' },
  { category: 'Domain', item: 'Domain Expiration Alerts', status: 'pending', priority: 'High', location: 'External: Domain Registrar Settings' },
  
  // ==================== PAYMENTS & BANKING ====================
  { category: 'Payments', item: 'Stripe Account Verified (Business)', status: 'done', priority: 'Critical', location: 'External: Stripe Dashboard' },
  { category: 'Payments', item: 'Stripe Webhook Configuration', status: 'done', priority: 'Critical', location: 'supabase/functions/stripe-webhook/' },
  { category: 'Payments', item: 'Payment Failure Handling', status: 'done', priority: 'Critical', location: 'src/hooks/useSubscription.ts' },
  { category: 'Payments', item: 'Invoice Generation (Stripe Invoicing)', status: 'done', priority: 'High', location: 'External: Stripe Invoice Settings' },
  { category: 'Payments', item: 'Tax Collection Setup (Stripe Tax)', status: 'pending', priority: 'High', notes: 'Required for compliance', location: 'External: Stripe Tax Settings' },
  { category: 'Payments', item: 'Multi-Currency Support', status: 'pending', priority: 'Medium', location: 'External: Stripe Currency Settings' },
  { category: 'Payments', item: 'Bank Account Connected for Payouts', status: 'pending', priority: 'Critical', location: 'External: Stripe → Payouts → Bank' },
  { category: 'Payments', item: 'PCI DSS Compliance (via Stripe)', status: 'done', priority: 'Critical', location: 'Automatic via Stripe Elements' },
  { category: 'Payments', item: 'Fraud Detection Rules', status: 'pending', priority: 'High', location: 'External: Stripe Radar Settings' },
  { category: 'Payments', item: 'Chargeback Handling Process', status: 'pending', priority: 'High', location: 'docs/Ops_Runbook_Genie.md → Disputes' },
  { category: 'Payments', item: 'Revenue Recognition Setup', status: 'pending', priority: 'Medium', location: 'External: Stripe Revenue Recognition' },
  { category: 'Payments', item: 'Financial Reporting Dashboard', status: 'pending', priority: 'Medium', location: 'src/pages/admin/FinancialDashboard.tsx' },
  { category: 'Payments', item: 'Pricing Tier Testing (All Plans)', status: 'pending', priority: 'High', location: 'src/components/pricing/' },
  
  // ==================== COPYRIGHT & INTELLECTUAL PROPERTY ====================
  { category: 'Copyright', item: 'Website Footer Copyright Notice', status: 'pending', priority: 'High' },
  { category: 'Copyright', item: 'Trademark Registration (Genie Suite™)', status: 'pending', priority: 'Medium' },
  { category: 'Copyright', item: 'Logo & Brand Assets Protected', status: 'pending', priority: 'Medium' },
  { category: 'Copyright', item: 'Third-Party License Compliance', status: 'pending', priority: 'High', notes: 'npm packages, fonts, icons' },
  { category: 'Copyright', item: 'Open Source License Attribution', status: 'pending', priority: 'Medium' },
  { category: 'Copyright', item: 'User Content Ownership Terms', status: 'pending', priority: 'High' },
  { category: 'Copyright', item: 'AI Model License Compliance', status: 'pending', priority: 'High', notes: 'OpenAI, Google, Anthropic terms' },
  { category: 'Copyright', item: 'Stock Media License Tracking', status: 'pending', priority: 'Medium' },
  
  // ==================== AI CONTENT MODERATION ====================
  { category: 'AI Content', item: 'Content Moderation Service Active', status: 'done', priority: 'Critical', notes: 'ContentModerationService.ts' },
  { category: 'AI Content', item: 'Profanity Filter Implementation', status: 'done', priority: 'High' },
  { category: 'AI Content', item: 'AI-Generated Content Watermarking', status: 'pending', priority: 'Medium' },
  { category: 'AI Content', item: 'Deepfake Detection (Voice Cloning)', status: 'pending', priority: 'High', notes: 'For voice features' },
  { category: 'AI Content', item: 'Bias Detection in AI Outputs', status: 'pending', priority: 'Medium' },
  { category: 'AI Content', item: 'Content Safety Scoring', status: 'done', priority: 'High' },
  { category: 'AI Content', item: 'User-Reported Content Workflow', status: 'pending', priority: 'High' },
  { category: 'AI Content', item: 'AI Transparency Labels', status: 'pending', priority: 'Medium', notes: 'EU AI Act compliance' },
  { category: 'AI Content', item: 'Model Output Logging (Audit Trail)', status: 'done', priority: 'High' },
  { category: 'AI Content', item: 'AI Ethics Policy Published', status: 'pending', priority: 'Medium' },
  
  // ==================== AGE & ACCESS RESTRICTIONS ====================
  { category: 'Restrictions', item: 'Minimum Age Requirement (13+)', status: 'pending', priority: 'High', notes: 'COPPA compliance' },
  { category: 'Restrictions', item: 'Age Verification UI (if needed)', status: 'pending', priority: 'Medium' },
  { category: 'Restrictions', item: 'Adult Content Blocking', status: 'done', priority: 'Critical' },
  { category: 'Restrictions', item: 'Violent Content Restrictions', status: 'done', priority: 'Critical' },
  { category: 'Restrictions', item: 'Hate Speech Detection', status: 'done', priority: 'Critical' },
  { category: 'Restrictions', item: 'Medical Content Warnings', status: 'done', priority: 'High', notes: 'Healthcare segment' },
  { category: 'Restrictions', item: 'Financial Advice Disclaimers', status: 'done', priority: 'High' },
  { category: 'Restrictions', item: 'Legal Advice Restrictions', status: 'done', priority: 'High' },
  { category: 'Restrictions', item: 'Geographic Restrictions (Sanctions)', status: 'pending', priority: 'Medium' },
  { category: 'Restrictions', item: 'Export Control Compliance', status: 'pending', priority: 'Low' },
  
  // ==================== WEBSITE PRODUCTION READINESS ====================
  { category: 'Website', item: 'Landing Page Design Complete', status: 'pending', priority: 'Critical' },
  { category: 'Website', item: 'Mobile Responsive Testing', status: 'done', priority: 'Critical' },
  { category: 'Website', item: 'Cross-Browser Compatibility', status: 'done', priority: 'High' },
  { category: 'Website', item: 'Page Load Speed (<3s)', status: 'pending', priority: 'High' },
  { category: 'Website', item: 'Core Web Vitals Passing', status: 'pending', priority: 'High' },
  { category: 'Website', item: '404 Error Page', status: 'pending', priority: 'Medium' },
  { category: 'Website', item: '500 Error Page', status: 'pending', priority: 'Medium' },
  { category: 'Website', item: 'Maintenance Mode Page', status: 'pending', priority: 'Medium' },
  { category: 'Website', item: 'Favicon & App Icons (All Sizes)', status: 'done', priority: 'High' },
  { category: 'Website', item: 'Social Share Preview Images (OG)', status: 'pending', priority: 'High' },
  { category: 'Website', item: 'Structured Data (JSON-LD)', status: 'pending', priority: 'Medium' },
  { category: 'Website', item: 'Google Search Console Setup', status: 'pending', priority: 'High' },
  { category: 'Website', item: 'Google Analytics 4 Integration', status: 'pending', priority: 'High' },
  { category: 'Website', item: 'Sitemap.xml Generation', status: 'pending', priority: 'Medium' },
  { category: 'Website', item: 'Robots.txt Configuration', status: 'pending', priority: 'Medium' },
  
  // ==================== CUSTOMER SUPPORT ====================
  { category: 'Support', item: 'Support Email Configured', status: 'pending', priority: 'Critical', notes: 'support@geniesuite.ai' },
  { category: 'Support', item: 'Help Center / Knowledge Base', status: 'pending', priority: 'High' },
  { category: 'Support', item: 'In-App Chat Widget', status: 'pending', priority: 'Medium' },
  { category: 'Support', item: 'Ticket System Integration', status: 'pending', priority: 'High' },
  { category: 'Support', item: 'FAQ Page', status: 'pending', priority: 'High' },
  { category: 'Support', item: 'Video Tutorials', status: 'pending', priority: 'Medium' },
  { category: 'Support', item: 'Onboarding Walkthrough', status: 'done', priority: 'High' },
  { category: 'Support', item: 'Status Page (statuspage.io)', status: 'pending', priority: 'High' },
  { category: 'Support', item: 'SLA Documentation', status: 'pending', priority: 'Medium' },
  { category: 'Support', item: 'Bug Report Mechanism', status: 'pending', priority: 'High' },
  
  // ==================== MARKETING & LAUNCH ====================
  { category: 'Marketing', item: 'Product Hunt Launch Prep', status: 'pending', priority: 'Medium' },
  { category: 'Marketing', item: 'Social Media Accounts Created', status: 'pending', priority: 'High' },
  { category: 'Marketing', item: 'Email Marketing Setup (Resend)', status: 'pending', priority: 'High' },
  { category: 'Marketing', item: 'Welcome Email Sequence', status: 'pending', priority: 'High' },
  { category: 'Marketing', item: 'Trial Expiration Reminders', status: 'pending', priority: 'High' },
  { category: 'Marketing', item: 'Testimonials / Social Proof', status: 'pending', priority: 'Medium' },
  { category: 'Marketing', item: 'Demo Video Created', status: 'pending', priority: 'High' },
  { category: 'Marketing', item: 'Press Kit Prepared', status: 'pending', priority: 'Low' },
  { category: 'Marketing', item: 'Beta Testers Feedback Collected', status: 'pending', priority: 'High' },
  
  // ==================== COMPLIANCE & AUDIT ====================
  { category: 'Compliance', item: 'HIPAA Compliance Footer', status: 'done', priority: 'High', notes: 'HIPAAComplianceFooter.tsx' },
  { category: 'Compliance', item: 'Audit Logging Enabled', status: 'done', priority: 'Critical' },
  { category: 'Compliance', item: 'Data Retention Policy Defined', status: 'pending', priority: 'High' },
  { category: 'Compliance', item: 'Right to be Forgotten (GDPR)', status: 'pending', priority: 'High' },
  { category: 'Compliance', item: 'Data Portability (Export)', status: 'pending', priority: 'High' },
  { category: 'Compliance', item: 'Consent Management Platform', status: 'pending', priority: 'High' },
  { category: 'Compliance', item: 'Privacy Impact Assessment', status: 'pending', priority: 'Medium' },
  { category: 'Compliance', item: 'Third-Party Vendor Audit', status: 'pending', priority: 'Medium' },
  { category: 'Compliance', item: 'Incident Response Plan', status: 'pending', priority: 'Critical' },
  { category: 'Compliance', item: 'Breach Notification Process', status: 'pending', priority: 'Critical' },
  
  // ==================== GO-LIVE WEBSITE ====================
  { category: 'Go-Live Website', item: 'Landing Page (Genie Suite Marketing)', status: 'pending', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Custom Domain Setup', status: 'pending', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Pricing Page with Plan Comparison', status: 'done', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Login/Signup Page', status: 'done', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'Stripe Checkout Integration', status: 'done', priority: 'Critical' },
  { category: 'Go-Live Website', item: 'SEO Meta Tags & OpenGraph', status: 'done', priority: 'High' },
  { category: 'Go-Live Website', item: 'Contact/Support Page', status: 'pending', priority: 'High' },
  { category: 'Go-Live Website', item: 'About Us Page', status: 'pending', priority: 'Medium' },
  { category: 'Go-Live Website', item: 'Blog/Content Hub', status: 'pending', priority: 'Medium' },
  { category: 'Go-Live Website', item: 'Changelog/Updates Page', status: 'pending', priority: 'Low' },
  
  // ==================== DOCUMENTATION ====================
  { category: 'Documentation', item: 'API Documentation', status: 'pending', priority: 'High' },
  { category: 'Documentation', item: 'User Onboarding Guide', status: 'pending', priority: 'High' },
  { category: 'Documentation', item: 'Integration Guides', status: 'pending', priority: 'Medium' },
  { category: 'Documentation', item: 'Admin/Support Runbook', status: 'pending', priority: 'High' },
  { category: 'Documentation', item: 'Incident Response Playbook', status: 'pending', priority: 'Critical' },
  { category: 'Documentation', item: 'Architecture Decision Records', status: 'done', priority: 'Medium' },
  { category: 'Documentation', item: 'Release Notes Template', status: 'pending', priority: 'Medium' },
  { category: 'Documentation', item: 'Developer Setup Guide', status: 'pending', priority: 'Medium' },
  
  // ==================== DEVOPS & DEPLOYMENT ====================
  { category: 'DevOps', item: 'CI/CD Pipeline (GitHub Actions)', status: 'done', priority: 'Critical' },
  { category: 'DevOps', item: 'Staging Environment', status: 'done', priority: 'High' },
  { category: 'DevOps', item: 'Production Environment', status: 'done', priority: 'Critical' },
  { category: 'DevOps', item: 'Database Migration Strategy', status: 'done', priority: 'Critical' },
  { category: 'DevOps', item: 'Rollback Procedures', status: 'pending', priority: 'Critical' },
  { category: 'DevOps', item: 'Blue-Green Deployment Ready', status: 'pending', priority: 'Medium' },
  { category: 'DevOps', item: 'Feature Flags System', status: 'pending', priority: 'Medium' },
  { category: 'DevOps', item: 'Auto-scaling Configuration', status: 'pending', priority: 'Medium' },
  { category: 'DevOps', item: 'Secret Management (Vault)', status: 'done', priority: 'Critical' },
  { category: 'DevOps', item: 'Backup Verification Testing', status: 'pending', priority: 'High' },
  
  // ==================== LIVE SERVICE / HELP DESK OPERATIONS ====================
  { category: 'Live Service', item: '24/7 Support Coverage Plan', status: 'pending', priority: 'High', notes: 'Define support hours by tier', location: 'docs/Ops_Runbook_Genie.md' },
  { category: 'Live Service', item: 'On-Call Rotation Schedule', status: 'pending', priority: 'Critical', notes: 'Engineering escalation', location: 'External: PagerDuty/OpsGenie' },
  { category: 'Live Service', item: 'Escalation Matrix Defined', status: 'pending', priority: 'Critical', notes: 'L1 → L2 → L3 → Engineering', location: 'docs/Ops_Runbook_Genie.md' },
  { category: 'Live Service', item: 'Ticket SLA Targets (Response/Resolution)', status: 'pending', priority: 'High', notes: 'Critical: 1h, High: 4h, Medium: 24h', location: 'Support System Config' },
  { category: 'Live Service', item: 'Help Desk Software Setup', status: 'pending', priority: 'Critical', notes: 'Zendesk/Freshdesk/Intercom', location: 'External: Help Desk Admin' },
  { category: 'Live Service', item: 'Canned Responses Library', status: 'pending', priority: 'Medium', notes: 'Common issue templates', location: 'Help Desk Knowledge Base' },
  { category: 'Live Service', item: 'Customer Satisfaction (CSAT) Surveys', status: 'pending', priority: 'Medium', location: 'Help Desk Integration' },
  { category: 'Live Service', item: 'Support Metrics Dashboard', status: 'pending', priority: 'High', notes: 'Ticket volume, resolution time, CSAT', location: 'Help Desk Analytics' },
  { category: 'Live Service', item: 'Live Chat Hours Defined', status: 'pending', priority: 'Medium', notes: 'Business hours vs after-hours', location: 'Chat Widget Config' },
  { category: 'Live Service', item: 'Chatbot / AI Assistant Integration', status: 'pending', priority: 'Medium', notes: 'First-line automated support', location: 'src/components/genie-studio/AskGenieDialog.tsx' },
  { category: 'Live Service', item: 'Customer Success Playbooks', status: 'pending', priority: 'High', notes: 'Onboarding, renewals, churn prevention', location: 'docs/CustomerSuccess/' },
  { category: 'Live Service', item: 'Support Team Training Materials', status: 'pending', priority: 'High', notes: 'Product knowledge, troubleshooting', location: 'docs/SupportTraining/' },
  { category: 'Live Service', item: 'Bug Triage Process', status: 'pending', priority: 'Critical', notes: 'Severity classification, routing', location: 'GitHub Issues Templates' },
  { category: 'Live Service', item: 'Feature Request Workflow', status: 'pending', priority: 'Medium', notes: 'Collection → Prioritization → Roadmap', location: 'Product Backlog' },
  { category: 'Live Service', item: 'Scheduled Maintenance Windows', status: 'pending', priority: 'High', notes: 'Communication plan, timing', location: 'Status Page Config' },
  { category: 'Live Service', item: 'Outage Communication Templates', status: 'pending', priority: 'Critical', notes: 'Status updates, post-mortems', location: 'Status Page / Email Templates' },
  { category: 'Live Service', item: 'Customer Health Scoring', status: 'pending', priority: 'Medium', notes: 'Usage patterns, engagement metrics', location: 'Analytics Dashboard' },
  { category: 'Live Service', item: 'Renewal/Churn Alert System', status: 'pending', priority: 'High', notes: 'Proactive outreach triggers', location: 'Stripe Webhooks / CRM' },

  // ==================== API PRODUCTION READINESS (From ApiProductionConfig.ts) ====================
  ...API_STAGE_GATE_CHECKLIST.map(item => ({
    category: item.category.replace('API ', '') as string,
    item: item.item,
    status: item.status,
    priority: item.priority,
    notes: item.notes,
    location: 'src/genie-studio/governance/ApiProductionConfig.ts',
  })),
];

// =============================================================================
// API PRODUCTION METRICS (Exported for UI consumption)
// =============================================================================
export const apiProductionMetrics = {
  totalApis: API_CONFIG_METADATA.totalApis,
  configuredApis: API_CONFIG_METADATA.configuredApis,
  needsUpgrade: API_CONFIG_METADATA.needsUpgrade,
  estimatedMonthlyCost: API_CONFIG_METADATA.estimatedMonthlyCost,
  stageGateProgress: API_CONFIG_METADATA.stageGateProgress,
  productionReadiness: getApiProductionReadiness(),
  configurations: API_CONFIGURATIONS,
};

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
    name: 'Genie Hub',
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
