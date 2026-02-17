/**
 * Publishing Registry - Multi-Channel Distribution
 * 
 * Supports Export (files), Cloud (hosted), and Platform (social) publishing.
 */

import { LucideIcon, Download, Cloud, Share2, Youtube, Linkedin, Twitter, Facebook, Instagram, Globe, Mail, MessageSquare, FileText, Video, Image, Presentation, Link2, LayoutGrid, Printer, MousePointer2, MonitorPlay, Package } from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

export type PublishChannelType = 'export' | 'cloud' | 'platform';

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: LucideIcon;
  category: 'document' | 'video' | 'image' | 'data' | 'marketing';
  tier: 'free' | 'pro' | 'enterprise';
  description: string;
}

export interface CloudPublishOption {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  tier: 'free' | 'pro' | 'enterprise';
}

export interface PlatformPublishOption {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  supportedFormats: string[];
  requiresAuth: boolean;
  apiIntegration: boolean;
  tier: 'pro' | 'enterprise';
}

export interface PublishConfig {
  // Export settings
  exportFormats: string[];
  
  // Cloud publishing
  cloudPublish: boolean;
  cloudOptions: {
    generateUrl: boolean;
    generateEmbed: boolean;
    passwordProtect: boolean;
    expirationDate?: Date;
    customDomain?: string;
  };
  
  // Platform distribution
  platforms: string[];
  platformSettings: Record<string, {
    enabled: boolean;
    autoPost: boolean;
    scheduledDate?: Date;
    customCaption?: string;
  }>;
  
  // Notifications
  notifyEmail?: string;
  webhookUrl?: string;
}

// ==========================================
// EXPORT FORMATS
// ==========================================

export const EXPORT_FORMATS: ExportFormat[] = [
  // Documents
  {
    id: 'pdf',
    name: 'PDF Document',
    extension: '.pdf',
    icon: FileText,
    category: 'document',
    tier: 'free',
    description: 'Universal document format',
  },
  {
    id: 'pptx',
    name: 'PowerPoint',
    extension: '.pptx',
    icon: Presentation,
    category: 'document',
    tier: 'free',
    description: 'Editable presentation',
  },
  {
    id: 'docx',
    name: 'Word Document',
    extension: '.docx',
    icon: FileText,
    category: 'document',
    tier: 'free',
    description: 'Text document export',
  },
  {
    id: 'html',
    name: 'HTML Package',
    extension: '.zip',
    icon: Globe,
    category: 'document',
    tier: 'pro',
    description: 'Self-contained web presentation',
  },
  
  // Video
  {
    id: 'mp4',
    name: 'MP4 Video',
    extension: '.mp4',
    icon: Video,
    category: 'video',
    tier: 'pro',
    description: 'High-quality video with voiceover',
  },
  {
    id: 'webm',
    name: 'WebM Video',
    extension: '.webm',
    icon: Video,
    category: 'video',
    tier: 'pro',
    description: 'Web-optimized video format',
  },
  {
    id: 'gif',
    name: 'Animated GIF',
    extension: '.gif',
    icon: Image,
    category: 'video',
    tier: 'free',
    description: 'Animated preview for social',
  },
  
  // Images
  {
    id: 'png-slides',
    name: 'PNG Slides',
    extension: '.zip',
    icon: Image,
    category: 'image',
    tier: 'free',
    description: 'Individual slide images',
  },
  {
    id: 'svg-vector',
    name: 'SVG Vector',
    extension: '.zip',
    icon: Image,
    category: 'image',
    tier: 'pro',
    description: 'Scalable vector graphics',
  },
  
  // Data
  {
    id: 'json',
    name: 'JSON Data',
    extension: '.json',
    icon: FileText,
    category: 'data',
    tier: 'pro',
    description: 'Raw presentation data',
  },

  // ═══ NEW MARKETING EXPORTS ═══
  
  // Marketing Packs
  {
    id: 'social-media-pack',
    name: 'Social Media Pack',
    extension: '.zip',
    icon: Share2,
    category: 'marketing',
    tier: 'pro',
    description: 'Auto-resize for IG, FB, LinkedIn, Twitter, TikTok',
  },
  {
    id: 'email-html',
    name: 'Email HTML',
    extension: '.zip',
    icon: Mail,
    category: 'marketing',
    tier: 'pro',
    description: 'MJML → HTML with Resend integration',
  },
  {
    id: 'ad-pack',
    name: 'Ad Creative Pack',
    extension: '.zip',
    icon: LayoutGrid,
    category: 'marketing',
    tier: 'pro',
    description: 'All standard ad sizes (300x250, 728x90, 1200x628)',
  },
  {
    id: 'print-ready',
    name: 'Print-Ready PDF',
    extension: '.pdf',
    icon: Printer,
    category: 'marketing',
    tier: 'pro',
    description: '300dpi CMYK PDF for professional printing',
  },
  {
    id: 'interactive-pdf',
    name: 'Interactive PDF',
    extension: '.pdf',
    icon: MousePointer2,
    category: 'marketing',
    tier: 'enterprise',
    description: 'Clickable PDF with embedded video & forms',
  },
  {
    id: 'webinar-kit',
    name: 'Webinar Kit',
    extension: '.zip',
    icon: MonitorPlay,
    category: 'marketing',
    tier: 'pro',
    description: 'Slides + script + thumbnail + email invite',
  },
  {
    id: 'campaign-bundle',
    name: 'Campaign Bundle',
    extension: '.zip',
    icon: Package,
    category: 'marketing',
    tier: 'enterprise',
    description: 'All assets for a full campaign in one ZIP',
  },
];

// ==========================================
// CLOUD PUBLISHING OPTIONS
// ==========================================

export const CLOUD_OPTIONS: CloudPublishOption[] = [
  {
    id: 'shareable-url',
    name: 'Shareable URL',
    icon: Link2,
    description: 'Generate a public link to your presentation',
    features: ['Instant sharing', 'View analytics', 'Mobile-friendly'],
    tier: 'free',
  },
  {
    id: 'embed-code',
    name: 'Embed Widget',
    icon: Globe,
    description: 'Embed in websites or apps',
    features: ['Responsive iframe', 'Customizable size', 'White-label option'],
    tier: 'pro',
  },
  {
    id: 'password-protected',
    name: 'Password Protected',
    icon: Cloud,
    description: 'Secure sharing with password',
    features: ['Password gate', 'Expiration date', 'Access logs'],
    tier: 'pro',
  },
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    icon: Globe,
    description: 'Host on your own domain',
    features: ['CNAME setup', 'SSL certificate', 'Full branding'],
    tier: 'enterprise',
  },
];

// ==========================================
// PLATFORM PUBLISHING OPTIONS
// ==========================================

export const PLATFORM_OPTIONS: PlatformPublishOption[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    description: 'Upload video presentations',
    supportedFormats: ['mp4', 'webm'],
    requiresAuth: true,
    apiIntegration: true,
    tier: 'pro',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    description: 'Share as document or video',
    supportedFormats: ['pdf', 'mp4', 'png-slides'],
    requiresAuth: true,
    apiIntegration: true,
    tier: 'pro',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Twitter,
    description: 'Share as thread or video',
    supportedFormats: ['mp4', 'gif', 'png-slides'],
    requiresAuth: true,
    apiIntegration: true,
    tier: 'pro',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    description: 'Share to page or group',
    supportedFormats: ['mp4', 'png-slides'],
    requiresAuth: true,
    apiIntegration: false,
    tier: 'pro',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    description: 'Share as reels or carousel',
    supportedFormats: ['mp4', 'png-slides'],
    requiresAuth: true,
    apiIntegration: false,
    tier: 'pro',
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    icon: Video,
    description: 'Professional video hosting',
    supportedFormats: ['mp4', 'webm'],
    requiresAuth: true,
    apiIntegration: true,
    tier: 'enterprise',
  },
  {
    id: 'slideshare',
    name: 'SlideShare',
    icon: Presentation,
    description: 'Professional slide sharing',
    supportedFormats: ['pptx', 'pdf'],
    requiresAuth: true,
    apiIntegration: true,
    tier: 'pro',
  },
  {
    id: 'email',
    name: 'Email Distribution',
    icon: Mail,
    description: 'Send directly via email',
    supportedFormats: ['pdf', 'pptx', 'mp4', 'shareable-url'],
    requiresAuth: false,
    apiIntegration: true,
    tier: 'pro',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Share to Slack channels',
    supportedFormats: ['shareable-url', 'pdf'],
    requiresAuth: true,
    apiIntegration: true,
    tier: 'pro',
  },
];

// ==========================================
// DEFAULT CONFIG
// ==========================================

export const DEFAULT_PUBLISH_CONFIG: PublishConfig = {
  exportFormats: ['pdf'],
  cloudPublish: false,
  cloudOptions: {
    generateUrl: false,
    generateEmbed: false,
    passwordProtect: false,
  },
  platforms: [],
  platformSettings: {},
};

// ==========================================
// HELPERS
// ==========================================

export function getExportFormat(id: string): ExportFormat | undefined {
  return EXPORT_FORMATS.find(f => f.id === id);
}

export function getCloudOption(id: string): CloudPublishOption | undefined {
  return CLOUD_OPTIONS.find(o => o.id === id);
}

export function getPlatform(id: string): PlatformPublishOption | undefined {
  return PLATFORM_OPTIONS.find(p => p.id === id);
}

export function getExportsByTier(tier: 'free' | 'pro' | 'enterprise'): ExportFormat[] {
  const tierOrder = { free: 0, pro: 1, enterprise: 2 };
  return EXPORT_FORMATS.filter(f => tierOrder[f.tier] <= tierOrder[tier]);
}

export function getCloudByTier(tier: 'free' | 'pro' | 'enterprise'): CloudPublishOption[] {
  const tierOrder = { free: 0, pro: 1, enterprise: 2 };
  return CLOUD_OPTIONS.filter(o => tierOrder[o.tier] <= tierOrder[tier]);
}

export function getPlatformsByTier(tier: 'free' | 'pro' | 'enterprise'): PlatformPublishOption[] {
  if (tier === 'free') return [];
  const tierOrder = { pro: 0, enterprise: 1 };
  return PLATFORM_OPTIONS.filter(p => tierOrder[p.tier] <= tierOrder[tier]);
}

// Check if platform supports a format
export function platformSupportsFormat(platformId: string, formatId: string): boolean {
  const platform = getPlatform(platformId);
  if (!platform) return false;
  return platform.supportedFormats.includes(formatId);
}

// Get recommended formats for a platform
export function getRecommendedFormats(platformId: string): ExportFormat[] {
  const platform = getPlatform(platformId);
  if (!platform) return [];
  
  return platform.supportedFormats
    .map(id => getExportFormat(id))
    .filter(Boolean) as ExportFormat[];
}
