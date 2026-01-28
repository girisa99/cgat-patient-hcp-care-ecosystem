/**
 * GENIE STUDIO NAVIGATION ITEMS
 * Isolated navigation for Genie Studio users
 * Filtered by subscription tier
 */

import {
  Sparkles,
  Factory,
  Presentation,
  Wrench,
  BarChart3,
  HelpCircle,
  CreditCard,
  Users,
  Settings,
  Layout,
  Palette,
  Zap,
  Globe,
  Brain,
  Mic,
  Video,
  FileText,
  Crown,
} from "lucide-react";

export type SubscriptionTier = 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';

export interface GenieNavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  minTier: SubscriptionTier;
  category: 'main' | 'production' | 'tools' | 'account' | 'admin';
  isInternal?: boolean; // Only visible to internal users
}

/**
 * Tier hierarchy for comparison
 */
export const TIER_HIERARCHY: SubscriptionTier[] = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];

/**
 * Check if user tier meets minimum requirement
 */
export function meetsTierRequirement(userTier: SubscriptionTier, minTier: SubscriptionTier): boolean {
  return TIER_HIERARCHY.indexOf(userTier) >= TIER_HIERARCHY.indexOf(minTier);
}

/**
 * Genie Studio specific navigation items
 * These are the ONLY pages visible when logged into Genie Studio
 */
export const genieStudioNavItems: GenieNavItem[] = [
  // === WORKSPACE (Home) ===
  {
    title: "Genie Studio",
    url: "/genie-studio",
    icon: Sparkles,
    description: "Your creative workspace dashboard",
    minTier: 'free',
    category: 'main',
  },
  {
    title: "Genie Deck",
    url: "/genie-deck",
    icon: Presentation,
    description: "AI-powered presentation generation",
    minTier: 'starter',
    category: 'main',
  },
  
  // === CREATE (Tools for ideation & scripting) ===
  {
    title: "Genie Spark",
    url: "/genie-spark",
    icon: Zap,
    description: "Multi-modal script generation from ideas",
    minTier: 'starter',
    category: 'tools',
  },
  {
    title: "Genie Mind",
    url: "/genie-mind",
    icon: Brain,
    description: "Script editing, voice generation & music",
    minTier: 'starter',
    category: 'tools',
  },
  {
    title: "Content Tools",
    url: "/content-tools",
    icon: Wrench,
    description: "Utilities for content enhancement",
    minTier: 'free',
    category: 'tools',
  },
  
  // === PRODUCE (Video/Audio production) ===
  {
    title: "Genie Vibe",
    url: "/genie-vibe",
    icon: Video,
    description: "Audio/Video production & editing",
    minTier: 'creator',
    category: 'production',
  },
  {
    title: "Production Hub",
    url: "/genie-admin",
    icon: Factory,
    description: "Unified production management & scheduling",
    minTier: 'starter',
    category: 'production',
  },
  
  // === MANAGE (Analytics & Admin) ===
  {
    title: "Analytics",
    url: "/genie-analytics",
    icon: BarChart3,
    description: "Performance insights & reporting",
    minTier: 'business',
    category: 'admin',
  },
  
  // === ACCOUNT SECTION ===
  {
    title: "Subscription",
    url: "/subscription",
    icon: CreditCard,
    description: "Manage your plan",
    minTier: 'free',
    category: 'account',
  },
  {
    title: "Support",
    url: "/genie-support",
    icon: HelpCircle,
    description: "Get help",
    minTier: 'free',
    category: 'account',
  },
  
  // === ADMIN (Internal only) ===
  {
    title: "Team Management",
    url: "/genie-admin?tab=team",
    icon: Users,
    description: "Manage team members",
    minTier: 'business',
    category: 'admin',
  },
  {
    title: "Workspaces",
    url: "/genie-admin?tab=workspaces",
    icon: Layout,
    description: "Manage workspaces",
    minTier: 'business',
    category: 'admin',
  },
  {
    title: "Whitelabel",
    url: "/genie-admin?tab=whitelabel",
    icon: Palette,
    description: "Custom branding",
    minTier: 'enterprise',
    category: 'admin',
  },
  {
    title: "Localization",
    url: "/genie-admin?tab=scheduler",
    icon: Globe,
    description: "Multi-region publishing",
    minTier: 'pro',
    category: 'admin',
  },
  
  // === INTERNAL ONLY ===
  {
    title: "Architecture",
    url: "/architecture",
    icon: Settings,
    description: "System architecture diagrams",
    minTier: 'free',
    category: 'admin',
    isInternal: true,
  },
];

/**
 * Get navigation items filtered by user tier and internal status
 */
export function getGenieStudioNavItems(
  userTier: SubscriptionTier = 'free',
  isInternal: boolean = false
): GenieNavItem[] {
  return genieStudioNavItems.filter(item => {
    // Check tier requirement
    if (!meetsTierRequirement(userTier, item.minTier)) {
      return false;
    }
    
    // Check internal-only items
    if (item.isInternal && !isInternal) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get items grouped by category
 */
export function getGenieNavByCategory(
  userTier: SubscriptionTier = 'free',
  isInternal: boolean = false
): Record<string, GenieNavItem[]> {
  const items = getGenieStudioNavItems(userTier, isInternal);
  
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GenieNavItem[]>);
}

/**
 * Check if a path is accessible for Genie Studio users
 */
export function isGenieStudioAccessiblePath(
  path: string,
  userTier: SubscriptionTier = 'free',
  isInternal: boolean = false
): boolean {
  const cleanPath = path.split('?')[0]; // Remove query params
  const accessibleItems = getGenieStudioNavItems(userTier, isInternal);
  
  return accessibleItems.some(item => {
    const itemPath = item.url.split('?')[0];
    return cleanPath === itemPath || cleanPath.startsWith(itemPath + '/');
  });
}

/**
 * Get tier display info
 */
export const TIER_INFO: Record<SubscriptionTier, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  free: { name: 'Free', icon: Sparkles, color: 'text-muted-foreground' },
  starter: { name: 'Starter', icon: Zap, color: 'text-blue-500' },
  creator: { name: 'Creator', icon: Mic, color: 'text-green-500' },
  pro: { name: 'Professional', icon: BarChart3, color: 'text-purple-500' },
  business: { name: 'Business', icon: Users, color: 'text-orange-500' },
  enterprise: { name: 'Enterprise', icon: Crown, color: 'text-yellow-500' },
};
