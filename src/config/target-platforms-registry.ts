/**
 * Target Platforms Registry
 * Comprehensive platform definitions for Genie Cast output targeting.
 * Each platform defines aspect ratios, max duration constraints, and format metadata.
 */

export interface TargetPlatformDef {
  id: string;
  label: string;
  category: 'social' | 'web' | 'messaging' | 'broadcast' | 'presentation';
  icon: string; // lucide icon name
  aspectRatios: string[];
  maxDurationSeconds: number | null; // null = no limit
  outputFormats: string[]; // e.g., 'mp4', 'webm', 'gif', 'html5'
  description: string;
}

export const TARGET_PLATFORMS: TargetPlatformDef[] = [
  // === SOCIAL ===
  { id: 'youtube', label: 'YouTube', category: 'social', icon: 'Youtube', aspectRatios: ['16:9'], maxDurationSeconds: null, outputFormats: ['mp4'], description: 'Long-form video content' },
  { id: 'youtube_shorts', label: 'YouTube Shorts', category: 'social', icon: 'Youtube', aspectRatios: ['9:16'], maxDurationSeconds: 60, outputFormats: ['mp4'], description: 'Vertical short-form (≤60s)' },
  { id: 'tiktok', label: 'TikTok', category: 'social', icon: 'Music', aspectRatios: ['9:16'], maxDurationSeconds: 180, outputFormats: ['mp4'], description: 'Vertical short-form video' },
  { id: 'instagram_reels', label: 'Instagram Reels', category: 'social', icon: 'Instagram', aspectRatios: ['9:16'], maxDurationSeconds: 90, outputFormats: ['mp4'], description: 'Vertical reels (≤90s)' },
  { id: 'instagram_post', label: 'Instagram Post', category: 'social', icon: 'Instagram', aspectRatios: ['1:1', '4:5'], maxDurationSeconds: 60, outputFormats: ['mp4', 'gif'], description: 'Square or portrait post' },
  { id: 'linkedin', label: 'LinkedIn', category: 'social', icon: 'Linkedin', aspectRatios: ['16:9', '1:1'], maxDurationSeconds: 600, outputFormats: ['mp4'], description: 'Professional video content' },
  { id: 'facebook', label: 'Facebook', category: 'social', icon: 'Facebook', aspectRatios: ['16:9', '1:1', '9:16'], maxDurationSeconds: null, outputFormats: ['mp4'], description: 'Feed & Stories video' },
  { id: 'twitter', label: 'X (Twitter)', category: 'social', icon: 'Twitter', aspectRatios: ['16:9', '1:1'], maxDurationSeconds: 140, outputFormats: ['mp4', 'gif'], description: 'Short video & GIFs' },

  // === WEB ===
  { id: 'landing_page', label: 'Landing Page', category: 'web', icon: 'Globe', aspectRatios: ['16:9', '21:9'], maxDurationSeconds: null, outputFormats: ['mp4', 'webm', 'html5'], description: 'Hero video or product demo embed' },
  { id: 'website_embed', label: 'Website Embed', category: 'web', icon: 'Layout', aspectRatios: ['16:9', '4:3'], maxDurationSeconds: null, outputFormats: ['mp4', 'webm'], description: 'Embeddable player for any page' },
  { id: 'marketing_blog', label: 'Marketing Blog', category: 'web', icon: 'FileText', aspectRatios: ['16:9'], maxDurationSeconds: 300, outputFormats: ['mp4', 'gif'], description: 'Blog post video/GIF inserts' },
  { id: 'product_page', label: 'Product Page', category: 'web', icon: 'Package', aspectRatios: ['16:9', '1:1'], maxDurationSeconds: 120, outputFormats: ['mp4', 'webm'], description: 'Product showcase & demo' },
  { id: 'help_center', label: 'Help Center', category: 'web', icon: 'HelpCircle', aspectRatios: ['16:9'], maxDurationSeconds: null, outputFormats: ['mp4'], description: 'Tutorial & how-to videos' },

  // === MESSAGING ===
  { id: 'email_campaign', label: 'Email Campaign', category: 'messaging', icon: 'Mail', aspectRatios: ['16:9', '1:1'], maxDurationSeconds: 30, outputFormats: ['gif', 'mp4'], description: 'Email-friendly GIF or thumbnail link' },
  { id: 'whatsapp_status', label: 'WhatsApp Status', category: 'messaging', icon: 'MessageCircle', aspectRatios: ['9:16'], maxDurationSeconds: 30, outputFormats: ['mp4'], description: 'Vertical status video (≤30s)' },
  { id: 'sms_mms', label: 'SMS/MMS', category: 'messaging', icon: 'Smartphone', aspectRatios: ['1:1'], maxDurationSeconds: 15, outputFormats: ['gif'], description: 'Lightweight animated GIF' },

  // === BROADCAST ===
  { id: 'webinar', label: 'Webinar', category: 'broadcast', icon: 'Video', aspectRatios: ['16:9'], maxDurationSeconds: null, outputFormats: ['mp4'], description: 'Webinar intro/outro/inserts' },
  { id: 'digital_signage', label: 'Digital Signage', category: 'broadcast', icon: 'Monitor', aspectRatios: ['16:9', '9:16', '32:9'], maxDurationSeconds: null, outputFormats: ['mp4'], description: 'Lobby/event displays' },
  { id: 'ott_ctv', label: 'OTT/CTV', category: 'broadcast', icon: 'Tv', aspectRatios: ['16:9'], maxDurationSeconds: 30, outputFormats: ['mp4'], description: 'Connected TV advertising' },
  { id: 'podcast_video', label: 'Podcast Video', category: 'broadcast', icon: 'Headphones', aspectRatios: ['16:9', '1:1'], maxDurationSeconds: null, outputFormats: ['mp4'], description: 'Audio + visual podcast clips' },

  // === PRESENTATION ===
  { id: 'presentation_slides', label: 'Presentation Slides', category: 'presentation', icon: 'Presentation', aspectRatios: ['16:9', '4:3'], maxDurationSeconds: null, outputFormats: ['pptx', 'mp4'], description: 'Slide deck with embedded video' },
  { id: 'sales_deck', label: 'Sales Deck', category: 'presentation', icon: 'Briefcase', aspectRatios: ['16:9'], maxDurationSeconds: 120, outputFormats: ['mp4', 'pptx'], description: 'Sales enablement video clips' },
];

// Lookup helpers
export const getPlatformById = (id: string) => TARGET_PLATFORMS.find(p => p.id === id);
export const getPlatformsByCategory = (category: TargetPlatformDef['category']) => TARGET_PLATFORMS.filter(p => p.category === category);
export const getPlatformCategories = () => [...new Set(TARGET_PLATFORMS.map(p => p.category))];
export const getAspectRatiosForPlatforms = (platformIds: string[]): string[] => {
  const ratios = new Set<string>();
  platformIds.forEach(id => {
    const p = getPlatformById(id);
    p?.aspectRatios.forEach(r => ratios.add(r));
  });
  return Array.from(ratios);
};
