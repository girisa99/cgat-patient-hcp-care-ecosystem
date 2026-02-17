/**
 * DISTRIBUTION TIER CONFIGURATION
 * Defines which distribution channels are available per subscription tier
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * TIERED DISTRIBUTION ACCESS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * FREE TIER:
 *   - Download only (MP4, MP3, images)
 *   - Manual distribution (copy link, share via email)
 * 
 * PRO TIER:
 *   - All Free features
 *   - YouTube
 *   - TikTok
 *   - Facebook
 *   - Instagram
 * 
 * BUSINESS TIER:
 *   - All Pro features
 *   - LinkedIn (personal + company pages)
 *   - Twitter/X
 *   - Threads
 * 
 * ENTERPRISE TIER:
 *   - All Business features
 *   - WhatsApp Business API
 *   - Slack integration
 *   - Custom webhooks
 *   - White-label embed codes
 * 
 * INTERNAL:
 *   - All features unlocked
 *   - Admin publishing (publish to all company pages)
 *   - Bulk distribution
 *   - Analytics access
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { SubscriptionTier, TIER_HIERARCHY } from './genieStudioNavItems';

export type DistributionChannel = 
  | 'download'
  | 'copy_link'
  | 'email'
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'twitter'
  | 'threads'
  | 'whatsapp_business'
  | 'slack'
  | 'webhook'
  | 'embed';

export interface ChannelConfig {
  id: DistributionChannel;
  label: string;
  icon: string; // Lucide icon name
  minTier: SubscriptionTier;
  requiresOAuth?: boolean;
  description: string;
}

/**
 * All distribution channels with their tier requirements
 */
export const DISTRIBUTION_CHANNELS: ChannelConfig[] = [
  // === FREE TIER ===
  {
    id: 'download',
    label: 'Download',
    icon: 'Download',
    minTier: 'free',
    description: 'Download as MP4, MP3, or image files',
  },
  {
    id: 'copy_link',
    label: 'Copy Link',
    icon: 'Link',
    minTier: 'free',
    description: 'Copy shareable link to clipboard',
  },
  {
    id: 'email',
    label: 'Email',
    icon: 'Mail',
    minTier: 'free',
    description: 'Share via email',
  },
  
  // === PRO TIER ===
  {
    id: 'youtube',
    label: 'YouTube',
    icon: 'Youtube',
    minTier: 'pro',
    requiresOAuth: true,
    description: 'Publish directly to YouTube',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: 'Music2',
    minTier: 'pro',
    requiresOAuth: true,
    description: 'Share on TikTok',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'Facebook',
    minTier: 'pro',
    requiresOAuth: true,
    description: 'Post to Facebook',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'Instagram',
    minTier: 'pro',
    requiresOAuth: true,
    description: 'Share on Instagram',
  },
  
  // === BUSINESS TIER ===
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'Linkedin',
    minTier: 'business',
    requiresOAuth: true,
    description: 'Post to LinkedIn personal or company pages',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    icon: 'Twitter',
    minTier: 'business',
    requiresOAuth: true,
    description: 'Tweet on X',
  },
  {
    id: 'threads',
    label: 'Threads',
    icon: 'AtSign',
    minTier: 'business',
    requiresOAuth: true,
    description: 'Post to Threads',
  },
  
  // === ENTERPRISE TIER ===
  {
    id: 'whatsapp_business',
    label: 'WhatsApp Business',
    icon: 'MessageCircle',
    minTier: 'enterprise',
    requiresOAuth: true,
    description: 'Send via WhatsApp Business API',
  },
  {
    id: 'slack',
    label: 'Slack',
    icon: 'Hash',
    minTier: 'enterprise',
    requiresOAuth: true,
    description: 'Share to Slack channels',
  },
  {
    id: 'webhook',
    label: 'Custom Webhook',
    icon: 'Webhook',
    minTier: 'enterprise',
    description: 'Send to custom webhook endpoint',
  },
  {
    id: 'embed',
    label: 'Embed Code',
    icon: 'Code',
    minTier: 'enterprise',
    description: 'Generate white-label embed code',
  },
];

/**
 * Get channels available for a specific tier
 */
export function getChannelsForTier(
  userTier: SubscriptionTier,
  isInternal: boolean = false
): ChannelConfig[] {
  // Internal users get all channels
  if (isInternal) {
    return DISTRIBUTION_CHANNELS;
  }
  
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
  
  return DISTRIBUTION_CHANNELS.filter(channel => {
    const channelTierIndex = TIER_HIERARCHY.indexOf(channel.minTier);
    return userTierIndex >= channelTierIndex;
  });
}

/**
 * Check if user can access a specific channel
 */
export function canAccessChannel(
  channelId: DistributionChannel,
  userTier: SubscriptionTier,
  isInternal: boolean = false
): boolean {
  if (isInternal) return true;
  
  const channel = DISTRIBUTION_CHANNELS.find(c => c.id === channelId);
  if (!channel) return false;
  
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
  const channelTierIndex = TIER_HIERARCHY.indexOf(channel.minTier);
  
  return userTierIndex >= channelTierIndex;
}

/**
 * Get upgrade message for locked channel
 */
export function getUpgradeMessageForChannel(channelId: DistributionChannel): string {
  const channel = DISTRIBUTION_CHANNELS.find(c => c.id === channelId);
  if (!channel) return 'Upgrade to access this feature';
  
  const tierNames: Record<SubscriptionTier, string> = {
    free: 'Free',
    starter: 'Starter',
    creator: 'Creator',
    pro: 'Pro',
    business: 'Business',
    enterprise: 'Enterprise',
  };
  
  return `Upgrade to ${tierNames[channel.minTier]} to publish on ${channel.label}`;
}

/**
 * Group channels by tier for UI display
 */
export function getChannelsByTierGroup(): Record<string, ChannelConfig[]> {
  return {
    'Download & Share': DISTRIBUTION_CHANNELS.filter(c => c.minTier === 'free'),
    'Social Media': DISTRIBUTION_CHANNELS.filter(c => c.minTier === 'pro'),
    'Professional Networks': DISTRIBUTION_CHANNELS.filter(c => c.minTier === 'business'),
    'Enterprise Integrations': DISTRIBUTION_CHANNELS.filter(c => c.minTier === 'enterprise'),
  };
}

/**
 * Tier display info for upgrade prompts
 */
export const DISTRIBUTION_TIER_INFO = {
  free: {
    name: 'Free',
    channels: ['Download', 'Copy Link', 'Email'],
    upgradePrompt: 'Upgrade to Pro for social media publishing',
  },
  starter: {
    name: 'Starter',
    channels: ['Download', 'Copy Link', 'Email'],
    upgradePrompt: 'Upgrade to Pro for social media publishing',
  },
  creator: {
    name: 'Creator',
    channels: ['Download', 'Copy Link', 'Email'],
    upgradePrompt: 'Upgrade to Pro for social media publishing',
  },
  pro: {
    name: 'Pro',
    channels: ['YouTube', 'TikTok', 'Facebook', 'Instagram'],
    upgradePrompt: 'Upgrade to Business for LinkedIn & Twitter',
  },
  business: {
    name: 'Business',
    channels: ['LinkedIn', 'Twitter', 'Threads'],
    upgradePrompt: 'Upgrade to Enterprise for WhatsApp & webhooks',
  },
  enterprise: {
    name: 'Enterprise',
    channels: ['WhatsApp Business', 'Slack', 'Webhooks', 'Embeds'],
    upgradePrompt: null,
  },
};
