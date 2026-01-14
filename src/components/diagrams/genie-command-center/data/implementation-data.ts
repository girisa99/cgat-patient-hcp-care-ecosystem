/**
 * Genie Command Center - Implementation & Roadmap Data
 * Phase tracking, scenario categories, and stage gate requirements
 */

import type { ImplementationPhase, ScenarioCategory, StageGateItem, Product } from '../types';

// =============================================================================
// IMPLEMENTATION PHASES (P0-P5)
// =============================================================================
export const implementationPhases: ImplementationPhase[] = [
  {
    id: 'P0',
    name: 'Core MVP Foundation',
    weeks: '1-4',
    status: 'completed',
    completion: 94,
    scenariosTotal: 35,
    scenariosComplete: 33,
    features: [
      { name: 'Script Management & Storage', status: 'done' },
      { name: 'TTS Multi-Provider Integration', status: 'done' },
      { name: 'Recording Studio with Teleprompter', status: 'done' },
      { name: 'Export Pipeline (MP4, WAV, SRT)', status: 'done' },
      { name: 'Mind↔Vibe Bidirectional Bridge', status: 'done' },
      { name: 'Subscription Hooks & Credit System', status: 'done' },
      { name: 'User Authentication & Profiles', status: 'done' },
      { name: 'Agent Core Integration', status: 'partial' },
    ],
  },
  {
    id: 'P1',
    name: 'Essential Production',
    weeks: '5-8',
    status: 'in-progress',
    completion: 16,
    scenariosTotal: 32,
    scenariosComplete: 5,
    features: [
      { name: 'Route Guards & Protected Routes', status: 'done' },
      { name: 'Module Access Gates', status: 'done' },
      { name: 'B-Roll Integration', status: 'pending' },
      { name: 'Platform Publishing (YouTube, Social)', status: 'pending' },
      { name: 'Usage Tracking & Analytics', status: 'partial' },
      { name: 'Mobile Responsive Layouts', status: 'partial' },
    ],
  },
  {
    id: 'P2',
    name: 'AI Agents & UX Polish',
    weeks: '9-12',
    status: 'in-progress',
    completion: 24,
    scenariosTotal: 50,
    scenariosComplete: 12,
    features: [
      { name: 'Voice Coaching Agent', status: 'done' },
      { name: 'Scene Analysis Agent', status: 'done' },
      { name: 'Multi-Platform Publish', status: 'pending' },
      { name: 'Script-Video Matching', status: 'pending' },
      { name: 'PWA Installation', status: 'done' },
      { name: 'Service Worker Caching', status: 'done' },
      { name: 'Remix & Clip Assembly', status: 'pending' },
    ],
  },
  {
    id: 'P3',
    name: 'Differentiators',
    weeks: '13-18',
    status: 'planned',
    completion: 23,
    scenariosTotal: 26,
    scenariosComplete: 6,
    features: [
      { name: 'Bulk Video Generation', status: 'pending' },
      { name: 'Auto Thumbnail Creation', status: 'pending' },
      { name: 'SEO Optimization Tools', status: 'pending' },
      { name: 'Social Cuts (Auto-format)', status: 'pending' },
      { name: 'Voice Cloning Integration', status: 'pending' },
      { name: 'Universal AI Processor', status: 'done' },
    ],
  },
  {
    id: 'P4',
    name: 'Advanced Features',
    weeks: '19-24',
    status: 'planned',
    completion: 13,
    scenariosTotal: 24,
    scenariosComplete: 3,
    features: [
      { name: 'OpenAI GPT Integration', status: 'done' },
      { name: 'Anthropic Claude Integration', status: 'pending' },
      { name: 'ElevenLabs Voice Integration', status: 'partial' },
      { name: 'Multi-Language Support', status: 'pending' },
      { name: 'Real-time Collaboration', status: 'pending' },
      { name: 'Version Control & History', status: 'pending' },
    ],
  },
  {
    id: 'P5',
    name: 'Enterprise & Scale',
    weeks: '25+',
    status: 'planned',
    completion: 0,
    scenariosTotal: 10,
    scenariosComplete: 0,
    features: [
      { name: 'SSO/SAML Integration', status: 'pending' },
      { name: 'White-Label Options', status: 'pending' },
      { name: 'Full HIPAA Certification', status: 'pending' },
      { name: 'SLA Monitoring Dashboard', status: 'pending' },
      { name: 'Data Residency Controls', status: 'pending' },
      { name: 'Enterprise Admin Console', status: 'pending' },
    ],
  },
];

// =============================================================================
// SCENARIO CATEGORIES (A-U)
// =============================================================================
export const scenarioCategories: ScenarioCategory[] = [
  { id: 'A', name: 'Imagination → Production', range: '1-10', total: 10, implemented: 5, partial: 3, pending: 2, phase: 'P0' },
  { id: 'B', name: 'Upload → Production', range: '11-16', total: 6, implemented: 0, partial: 0, pending: 6, phase: 'P1' },
  { id: 'C', name: 'Video → Script → Enhance', range: '17-20', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P2' },
  { id: 'D', name: 'Record → Refine Loops', range: '21-24', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P1' },
  { id: 'E', name: 'Hybrid & Cross-Studio', range: '25-32', total: 8, implemented: 0, partial: 0, pending: 8, phase: 'P2' },
  { id: 'F', name: 'Generation & Automation', range: '33-42', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P3' },
  { id: 'G', name: 'Compliance & Legal', range: '43-46', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P3' },
  { id: 'H', name: 'Recovery & Error Handling', range: '47-50', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P4' },
  { id: 'I', name: 'Multi-Language & Localization', range: '51-54', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P4' },
  { id: 'J', name: 'Collaboration & Handoffs', range: '55-58', total: 4, implemented: 0, partial: 0, pending: 4, phase: 'P4' },
  { id: 'K', name: 'Versioning & Archival', range: '59-60', total: 2, implemented: 0, partial: 0, pending: 2, phase: 'P4' },
  { id: 'L', name: 'Bidirectional Mind↔Vibe', range: '61-65', total: 5, implemented: 5, partial: 0, pending: 0, phase: 'P0' },
  { id: 'M', name: 'Commercialization Infrastructure', range: '66-70', total: 5, implemented: 3, partial: 0, pending: 2, phase: 'P0' },
  { id: 'M2', name: 'Access Control', range: '71-75', total: 5, implemented: 0, partial: 0, pending: 5, phase: 'P1' },
  { id: 'M3', name: 'Public Landing & Pricing', range: '76-80', total: 5, implemented: 0, partial: 0, pending: 5, phase: 'P2' },
  { id: 'N', name: 'Mobile-First Features', range: '81-90', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P1' },
  { id: 'O', name: 'Segment-Specific Features', range: '91-100', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P3' },
  { id: 'P', name: 'Remix & Clip Assembly', range: '101-110', total: 10, implemented: 0, partial: 0, pending: 10, phase: 'P2' },
  { id: 'Q', name: 'Agent Integration Core', range: '111-120', total: 10, implemented: 4, partial: 1, pending: 5, phase: 'P0' },
  { id: 'Q2', name: 'Agent Advanced', range: '121-125', total: 5, implemented: 0, partial: 0, pending: 5, phase: 'P2' },
  { id: 'R', name: 'API Integration', range: '126-135', total: 10, implemented: 6, partial: 0, pending: 4, phase: 'P3' },
  { id: 'R2', name: 'External API Integration', range: '136-140', total: 5, implemented: 3, partial: 0, pending: 2, phase: 'P4' },
  { id: 'S', name: 'Subscription & Access', range: '141-150', total: 10, implemented: 10, partial: 0, pending: 0, phase: 'P0' },
  { id: 'S2', name: 'Subscription Extended', range: '151-155', total: 5, implemented: 2, partial: 2, pending: 1, phase: 'P1' },
  { id: 'T', name: 'Mobile Deployment', range: '156-165', total: 10, implemented: 2, partial: 0, pending: 8, phase: 'P2' },
  { id: 'U', name: 'P2 AI Agents', range: '166-177', total: 12, implemented: 12, partial: 0, pending: 0, phase: 'P2' },
];

// =============================================================================
// STAGE GATE CHECKLIST (Before Go-Live)
// =============================================================================
export const stageGateChecklist: StageGateItem[] = [
  // Authentication & Authorization
  { category: 'Auth & Security', item: 'Email/Password Authentication', status: 'done', priority: 'Critical' },
  { category: 'Auth & Security', item: 'Google OAuth Integration', status: 'done', priority: 'Critical' },
  { category: 'Auth & Security', item: 'Role-Based Access Control (RBAC)', status: 'done', priority: 'Critical' },
  { category: 'Auth & Security', item: 'Row Level Security (RLS) Policies', status: 'done', priority: 'Critical' },
  { category: 'Auth & Security', item: 'API Rate Limiting', status: 'done', priority: 'High' },
  { category: 'Auth & Security', item: 'Session Management', status: 'done', priority: 'High' },
  { category: 'Auth & Security', item: 'Password Reset Flow', status: 'done', priority: 'High' },
  { category: 'Auth & Security', item: 'MFA/2FA Support', status: 'pending', priority: 'Medium' },
  
  // Subscriptions & Billing
  { category: 'Subscriptions', item: 'Stripe Integration', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Subscription Plans Defined', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Credit System Implementation', status: 'done', priority: 'Critical' },
  { category: 'Subscriptions', item: 'Usage Tracking', status: 'in-progress', priority: 'High' },
  { category: 'Subscriptions', item: 'Invoice Generation', status: 'pending', priority: 'High' },
  { category: 'Subscriptions', item: 'Plan Upgrade/Downgrade', status: 'in-progress', priority: 'High' },
  { category: 'Subscriptions', item: 'Trial Period Management', status: 'pending', priority: 'Medium' },
  
  // Features & Capabilities
  { category: 'Core Features', item: 'Script Management', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'TTS Integration', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Recording Studio', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Export Pipeline', status: 'done', priority: 'Critical' },
  { category: 'Core Features', item: 'Agent System', status: 'in-progress', priority: 'High' },
  { category: 'Core Features', item: 'Mobile Responsive', status: 'in-progress', priority: 'High' },
  
  // Infrastructure
  { category: 'Infrastructure', item: 'Database Backups', status: 'done', priority: 'Critical' },
  { category: 'Infrastructure', item: 'CDN for Assets', status: 'done', priority: 'High' },
  { category: 'Infrastructure', item: 'Error Monitoring (Sentry)', status: 'pending', priority: 'High' },
  { category: 'Infrastructure', item: 'Performance Monitoring', status: 'pending', priority: 'Medium' },
  { category: 'Infrastructure', item: 'Auto-scaling Configuration', status: 'pending', priority: 'Medium' },
  
  // Legal & Compliance
  { category: 'Legal', item: 'Terms of Service', status: 'pending', priority: 'Critical' },
  { category: 'Legal', item: 'Privacy Policy', status: 'pending', priority: 'Critical' },
  { category: 'Legal', item: 'Cookie Consent', status: 'pending', priority: 'High' },
  { category: 'Legal', item: 'GDPR Compliance', status: 'pending', priority: 'High' },
  { category: 'Legal', item: 'HIPAA Documentation (Healthcare)', status: 'pending', priority: 'Medium', notes: 'Required for Healthcare segment' },
];

// =============================================================================
// PRODUCTS - Genie Suite with WoW Features
// =============================================================================
export const products: Product[] = [
  {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'AI-Powered Script Intelligence',
    description: 'Transform ideas into polished scripts with AI assistance. Genie Mind understands context, suggests improvements, and generates content tailored to your audience and platform.',
    icon: '🧠',
    color: 'hsl(258, 90%, 66%)',
    wowFeatures: [
      'Natural language → production-ready script in 60 seconds',
      'Platform-optimized formatting (YouTube, TikTok, LinkedIn)',
    ],
    status: 'complete',
    phase: 'P0',
    scenariosCovered: 35,
    agents: ['script_generator_agent', 'content_analyzer_agent', 'seo_optimizer_agent'],
    apis: ['ai-universal-processor', 'script-management'],
  },
  {
    id: 'ask',
    name: 'Ask Genie',
    tagline: 'Your Production Assistant',
    description: 'Conversational AI that guides you through the entire production process. Ask questions, get suggestions, and receive real-time help without leaving your workflow.',
    icon: '✨',
    color: 'hsl(38, 92%, 50%)',
    wowFeatures: [
      'Context-aware help - knows your project state',
      'Proactive suggestions during editing',
    ],
    status: 'partial',
    phase: 'P1',
    scenariosCovered: 20,
    agents: ['conversation_agent', 'suggestion_agent'],
    apis: ['genie-chat', 'context-manager'],
  },
  {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Production & Recording Studio',
    description: 'Professional recording studio with teleprompter, TTS narration, and real-time audio/video mixing. Create broadcast-quality content from any device.',
    icon: '🎬',
    color: 'hsl(350, 70%, 50%)',
    wowFeatures: [
      'Script-synced teleprompter with AI pacing',
      'One-click multi-format export (vertical, square, widescreen)',
    ],
    status: 'complete',
    phase: 'P0',
    scenariosCovered: 45,
    agents: ['tts_orchestrator_agent', 'recording_agent', 'export_agent'],
    apis: ['recording-studio', 'tts-providers', 'media-processor'],
  },
  {
    id: 'arc',
    name: 'Genie Arc',
    tagline: 'Collaboration & Workflows',
    description: 'Team collaboration hub with approval workflows, commenting, and version control. Keep stakeholders aligned and streamline production handoffs.',
    icon: '🔄',
    color: 'hsl(160, 84%, 39%)',
    wowFeatures: [
      'Multi-stakeholder approval chains',
      'Real-time co-editing with conflict resolution',
    ],
    status: 'planned',
    phase: 'P3',
    scenariosCovered: 15,
    agents: ['collaboration_agent', 'approval_workflow_agent'],
    apis: ['collaboration-engine', 'notification-service'],
  },
  {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Quick-Start Templates',
    description: 'Jump-start your production with AI-powered templates and presets. One-click content generation for common use cases across all segments.',
    icon: '⚡',
    color: 'hsl(199, 89%, 48%)',
    wowFeatures: [
      'Segment-specific templates (Healthcare, SMB, Creator)',
      '5-minute video from template to export',
    ],
    status: 'partial',
    phase: 'P2',
    scenariosCovered: 25,
    agents: ['template_agent', 'quick_start_agent'],
    apis: ['template-library', 'preset-manager'],
  },
];

// Calculate totals
export const getTotalScenarios = () => scenarioCategories.reduce((sum, cat) => sum + cat.total, 0);
export const getImplementedScenarios = () => scenarioCategories.reduce((sum, cat) => sum + cat.implemented + cat.partial, 0);
export const getOverallProgress = () => Math.round((getImplementedScenarios() / getTotalScenarios()) * 100);
