/**
 * Publishing Features for Capability Matrix
 * 
 * Defines all publishing-related features for the Provider Matrix.
 * Integrates with the PUBLISHING category across all analysis tabs.
 */

import type { Feature, ProviderCapability, FeatureCapabilityEntry } from './types';

// ==========================================
// PUBLISHING FEATURES
// ==========================================

export const PUBLISHING_FEATURES: Feature[] = [
  // Export Features
  {
    id: 'pdf_export',
    name: 'PDF Export',
    category: 'PUBLISHING',
    description: 'Export to PDF format',
    priority: 'critical',
  },
  {
    id: 'pptx_export',
    name: 'PowerPoint Export',
    category: 'PUBLISHING',
    description: 'Export to PPTX format',
    priority: 'critical',
  },
  {
    id: 'docx_export',
    name: 'Word Export',
    category: 'PUBLISHING',
    description: 'Export to DOCX format',
    priority: 'high',
  },
  {
    id: 'mp4_export',
    name: 'Video Export',
    category: 'PUBLISHING',
    description: 'Export to MP4 video',
    priority: 'high',
  },
  {
    id: 'html_export',
    name: 'HTML Export',
    category: 'PUBLISHING',
    description: 'Export as interactive HTML',
    priority: 'medium',
  },
  {
    id: 'scorm_export',
    name: 'SCORM Export',
    category: 'PUBLISHING',
    description: 'Export for LMS integration',
    priority: 'medium',
  },
  
  // Cloud Publishing Features
  {
    id: 'cloud_hosting',
    name: 'Cloud Hosting',
    category: 'PUBLISHING',
    description: 'Host on cloud with shareable URL',
    priority: 'critical',
  },
  {
    id: 'embed_code',
    name: 'Embed Code',
    category: 'PUBLISHING',
    description: 'Generate embeddable code for websites',
    priority: 'high',
  },
  {
    id: 'password_protect',
    name: 'Password Protection',
    category: 'PUBLISHING',
    description: 'Protect content with password',
    priority: 'medium',
  },
  {
    id: 'analytics_tracking',
    name: 'View Analytics',
    category: 'PUBLISHING',
    description: 'Track views and engagement',
    priority: 'medium',
  },
  
  // Platform Distribution Features
  {
    id: 'youtube_upload',
    name: 'YouTube Upload',
    category: 'PUBLISHING',
    description: 'Direct publish to YouTube',
    priority: 'high',
  },
  {
    id: 'linkedin_post',
    name: 'LinkedIn Post',
    category: 'PUBLISHING',
    description: 'Share on LinkedIn',
    priority: 'high',
  },
  {
    id: 'vimeo_upload',
    name: 'Vimeo Upload',
    category: 'PUBLISHING',
    description: 'Direct publish to Vimeo',
    priority: 'medium',
  },
  {
    id: 'slideshare_upload',
    name: 'SlideShare Upload',
    category: 'PUBLISHING',
    description: 'Upload to SlideShare',
    priority: 'medium',
  },
  {
    id: 'social_schedule',
    name: 'Social Scheduling',
    category: 'PUBLISHING',
    description: 'Schedule posts across platforms',
    priority: 'high',
  },
];

// ==========================================
// PUBLISHING CAPABILITY ENTRIES
// ==========================================

export const PUBLISHING_CAPABILITY_ENTRIES: FeatureCapabilityEntry[] = PUBLISHING_FEATURES.map(feature => ({
  feature,
  providers: getPublishingProviders(feature.id),
  primaryProvider: getPrimaryProvider(feature.id),
  fallbackChain: getFallbackChain(feature.id),
  overallStatus: getImplementationStatus(feature.id),
  gapAnalysis: getGapAnalysis(feature.id),
}));

// Provider capability mappings for publishing features
function getPublishingProviders(featureId: string): ProviderCapability[] {
  const providerMappings: Record<string, Partial<ProviderCapability>[]> = {
    pdf_export: [
      { providerId: 'lovable', status: 'configured', implementation: 'implemented', confidence: 95 },
    ],
    pptx_export: [
      { providerId: 'lovable', status: 'configured', implementation: 'implemented', confidence: 90 },
    ],
    docx_export: [
      { providerId: 'lovable', status: 'configured', implementation: 'implemented', confidence: 90 },
    ],
    mp4_export: [
      { providerId: 'lovable', status: 'configured', implementation: 'partial', confidence: 70 },
      { providerId: 'replicate', status: 'needs_key', implementation: 'planned', confidence: 0 },
    ],
    html_export: [
      { providerId: 'lovable', status: 'configured', implementation: 'implemented', confidence: 85 },
    ],
    scorm_export: [
      { providerId: 'lovable', status: 'configured', implementation: 'planned', confidence: 0 },
    ],
    cloud_hosting: [
      { providerId: 'lovable', status: 'configured', implementation: 'implemented', confidence: 95 },
    ],
    embed_code: [
      { providerId: 'lovable', status: 'configured', implementation: 'implemented', confidence: 90 },
    ],
    password_protect: [
      { providerId: 'lovable', status: 'configured', implementation: 'partial', confidence: 60 },
    ],
    analytics_tracking: [
      { providerId: 'lovable', status: 'configured', implementation: 'partial', confidence: 50 },
      { providerId: 'google', status: 'needs_key', implementation: 'planned', confidence: 0 },
    ],
    youtube_upload: [
      { providerId: 'google', status: 'needs_key', implementation: 'planned', confidence: 0 },
    ],
    linkedin_post: [
      { providerId: 'microsoft', status: 'needs_key', implementation: 'planned', confidence: 0 },
    ],
    vimeo_upload: [
      { providerId: 'lovable', status: 'configured', implementation: 'planned', confidence: 0 },
    ],
    slideshare_upload: [
      { providerId: 'lovable', status: 'configured', implementation: 'not_started', confidence: 0 },
    ],
    social_schedule: [
      { providerId: 'lovable', status: 'configured', implementation: 'planned', confidence: 0 },
    ],
  };

  const mapping = providerMappings[featureId] || [];
  return mapping.map(p => ({
    providerId: p.providerId as any,
    status: p.status as any,
    implementation: p.implementation as any,
    confidence: p.confidence || 0,
    quality: p.quality || 0,
    speed: p.speed || 0,
    cost: 'low' as const,
    features: [],
  }));
}

function getPrimaryProvider(featureId: string): any {
  const platformFeatures = ['youtube_upload', 'linkedin_post', 'vimeo_upload'];
  if (platformFeatures.includes(featureId)) {
    return featureId === 'youtube_upload' ? 'google' : 
           featureId === 'linkedin_post' ? 'microsoft' : 'lovable';
  }
  return 'lovable';
}

function getFallbackChain(featureId: string): any[] {
  return ['lovable'];
}

function getImplementationStatus(featureId: string): any {
  const implemented = ['pdf_export', 'pptx_export', 'docx_export', 'html_export', 'cloud_hosting', 'embed_code'];
  const partial = ['mp4_export', 'password_protect', 'analytics_tracking'];
  const planned = ['scorm_export', 'youtube_upload', 'linkedin_post', 'vimeo_upload', 'social_schedule'];
  
  if (implemented.includes(featureId)) return 'implemented';
  if (partial.includes(featureId)) return 'partial';
  if (planned.includes(featureId)) return 'planned';
  return 'not_started';
}

function getGapAnalysis(featureId: string): string | undefined {
  const gaps: Record<string, string> = {
    youtube_upload: 'Requires Google OAuth integration',
    linkedin_post: 'Requires LinkedIn API credentials',
    social_schedule: 'Needs scheduling backend infrastructure',
    scorm_export: 'SCORM packaging library needed',
    analytics_tracking: 'Full analytics dashboard pending',
  };
  return gaps[featureId];
}

// ==========================================
// PUBLISHING USE CASES
// ==========================================

export const PUBLISHING_USE_CASES = [
  {
    id: 'export_all_formats',
    name: 'Multi-Format Export',
    description: 'Export content in PDF, PPTX, DOCX, and video formats',
    requiredFeatures: ['pdf_export', 'pptx_export', 'docx_export', 'mp4_export'],
    genieProducts: ['deck', 'vibe', 'spark', 'arc'],
  },
  {
    id: 'cloud_distribution',
    name: 'Cloud Distribution',
    description: 'Host and share content via cloud URLs with analytics',
    requiredFeatures: ['cloud_hosting', 'embed_code', 'analytics_tracking'],
    genieProducts: ['deck', 'vibe', 'spark'],
  },
  {
    id: 'social_publishing',
    name: 'Social Media Publishing',
    description: 'Publish directly to YouTube, LinkedIn, and other platforms',
    requiredFeatures: ['youtube_upload', 'linkedin_post', 'social_schedule'],
    genieProducts: ['vibe', 'spark'],
  },
  {
    id: 'enterprise_lms',
    name: 'Enterprise LMS Integration',
    description: 'Export SCORM packages for learning management systems',
    requiredFeatures: ['scorm_export', 'analytics_tracking'],
    genieProducts: ['deck', 'arc'],
  },
];

// ==========================================
// MOBILE SUPPORT MAPPING
// ==========================================

export const PUBLISHING_MOBILE_SUPPORT = {
  // Export (offline capable)
  pdf_export: { mobile: true, offline: true, priority: 'P1' },
  pptx_export: { mobile: true, offline: false, priority: 'P2' },
  mp4_export: { mobile: false, offline: false, priority: 'P3' },
  
  // Cloud (online only)
  cloud_hosting: { mobile: true, offline: false, priority: 'P1' },
  embed_code: { mobile: true, offline: false, priority: 'P2' },
  
  // Platform (online only)
  youtube_upload: { mobile: true, offline: false, priority: 'P2' },
  linkedin_post: { mobile: true, offline: false, priority: 'P2' },
  social_schedule: { mobile: true, offline: false, priority: 'P3' },
};

export default {
  features: PUBLISHING_FEATURES,
  entries: PUBLISHING_CAPABILITY_ENTRIES,
  useCases: PUBLISHING_USE_CASES,
  mobileSupport: PUBLISHING_MOBILE_SUPPORT,
};
