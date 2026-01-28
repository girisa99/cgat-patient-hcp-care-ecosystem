/**
 * GENIE STUDIO NAVIGATION ITEMS
 * Isolated navigation for Genie Studio users
 * Filtered by subscription tier
 * 
 * ARCHITECTURE:
 * - WORKSPACE: Dashboard products (Studio, Deck)
 * - CREATE: Ideation tools (Spark, Mind, Content Tools)
 * - PRODUCE: Production tools (Vibe)
 * - PUBLISH: Distribution (Scheduler, Library)
 * - MANAGE: All admin/analytics/settings (merged from Production Hub)
 * - ACCOUNT: User settings
 */

import {
  Sparkles,
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
  Video,
  Crown,
  Send,
  Megaphone,
  KanbanSquare,
  CalendarDays,
  CalendarCheck,
  FolderOpen,
  Layers,
  AlertTriangle,
  MessageSquare,
  Command,
} from "lucide-react";

export type SubscriptionTier = 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';

export interface GenieNavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  minTier: SubscriptionTier;
  category: 'main' | 'tools' | 'production' | 'publish' | 'manage' | 'account';
  isInternal?: boolean;
  subCategory?: string; // For grouping within MANAGE
}

export const TIER_HIERARCHY: SubscriptionTier[] = ['free', 'starter', 'creator', 'pro', 'business', 'enterprise'];

export function meetsTierRequirement(userTier: SubscriptionTier, minTier: SubscriptionTier): boolean {
  return TIER_HIERARCHY.indexOf(userTier) >= TIER_HIERARCHY.indexOf(minTier);
}

/**
 * Genie Studio navigation items
 * MANAGE category now contains all Production Hub tabs directly
 */
export const genieStudioNavItems: GenieNavItem[] = [
  // === WORKSPACE ===
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
  
  // === CREATE ===
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
  
  // === PRODUCE ===
  {
    title: "Genie Vibe",
    url: "/genie-vibe",
    icon: Video,
    description: "Audio/Video production & editing",
    minTier: 'creator',
    category: 'production',
  },

  // === PUBLISH ===
  {
    title: "Scheduler",
    url: "/genie-admin?tab=scheduler",
    icon: Send,
    description: "Schedule content across platforms",
    minTier: 'starter',
    category: 'publish',
  },
  {
    title: "Distribution",
    url: "/genie-admin?tab=library",
    icon: Megaphone,
    description: "Manage content distribution",
    minTier: 'starter',
    category: 'publish',
  },
  
  // === MANAGE (Merged Production Hub) ===
  // Workflow
  {
    title: "Task Board",
    url: "/genie-admin?tab=kanban",
    icon: KanbanSquare,
    description: "Drag-and-drop task management",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Workflow',
  },
  {
    title: "Schedule",
    url: "/genie-admin?tab=calendar",
    icon: CalendarDays,
    description: "Calendar timeline view",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Workflow',
  },
  {
    title: "Meetings",
    url: "/genie-admin?tab=appointments",
    icon: CalendarCheck,
    description: "Book & manage meetings",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Workflow',
  },
  // Assets
  {
    title: "Library",
    url: "/genie-admin?tab=library",
    icon: FolderOpen,
    description: "Browse all your content",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Assets',
  },
  {
    title: "Create",
    url: "/genie-admin?tab=composition",
    icon: Layers,
    description: "New composition studio",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Assets',
  },
  // Insights
  {
    title: "Performance",
    url: "/genie-admin?tab=analytics",
    icon: BarChart3,
    description: "Production metrics",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Insights',
  },
  {
    title: "Enterprise",
    url: "/genie-admin?tab=enterprise-analytics",
    icon: Globe,
    description: "Business analytics",
    minTier: 'enterprise',
    category: 'manage',
    subCategory: 'Insights',
  },
  {
    title: "Diagnostics",
    url: "/genie-admin?tab=error-analytics",
    icon: AlertTriangle,
    description: "Error tracking & health",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Insights',
  },
  // Settings
  {
    title: "Workspaces",
    url: "/genie-admin?tab=workspaces",
    icon: Layout,
    description: "Manage workspaces",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Settings',
  },
  {
    title: "Team",
    url: "/genie-admin?tab=team",
    icon: Users,
    description: "Team members & roles",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Settings',
  },
  {
    title: "Branding",
    url: "/genie-admin?tab=whitelabel",
    icon: Palette,
    description: "Custom branding",
    minTier: 'enterprise',
    category: 'manage',
    subCategory: 'Settings',
  },
  {
    title: "Activity",
    url: "/genie-admin?tab=collaboration",
    icon: MessageSquare,
    description: "Team activity feed",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Settings',
  },
  // AI Tools
  {
    title: "AI Hub",
    url: "/genie-admin?tab=ai-intelligence",
    icon: Brain,
    description: "AI routing & models",
    minTier: 'pro',
    category: 'manage',
    subCategory: 'AI Tools',
    isInternal: true,
  },
  {
    title: "Control Center",
    url: "/genie-admin?tab=command-center",
    icon: Command,
    description: "System overview",
    minTier: 'enterprise',
    category: 'manage',
    subCategory: 'AI Tools',
    isInternal: true,
  },
  
  // === ACCOUNT ===
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
  
  // === INTERNAL ONLY ===
  {
    title: "Architecture",
    url: "/architecture",
    icon: Settings,
    description: "System architecture diagrams",
    minTier: 'free',
    category: 'manage',
    subCategory: 'AI Tools',
    isInternal: true,
  },
];

export function getGenieStudioNavItems(
  userTier: SubscriptionTier = 'free',
  isInternal: boolean = false
): GenieNavItem[] {
  return genieStudioNavItems.filter(item => {
    if (!meetsTierRequirement(userTier, item.minTier)) {
      return false;
    }
    if (item.isInternal && !isInternal) {
      return false;
    }
    return true;
  });
}

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
 * Get MANAGE items grouped by subCategory
 */
export function getManageItemsBySubCategory(
  userTier: SubscriptionTier = 'free',
  isInternal: boolean = false
): Record<string, GenieNavItem[]> {
  const items = getGenieStudioNavItems(userTier, isInternal)
    .filter(item => item.category === 'manage' && item.subCategory);
  
  return items.reduce((acc, item) => {
    const subCat = item.subCategory || 'Other';
    if (!acc[subCat]) {
      acc[subCat] = [];
    }
    acc[subCat].push(item);
    return acc;
  }, {} as Record<string, GenieNavItem[]>);
}

export function isGenieStudioAccessiblePath(
  path: string,
  userTier: SubscriptionTier = 'free',
  isInternal: boolean = false
): boolean {
  const cleanPath = path.split('?')[0];
  const accessibleItems = getGenieStudioNavItems(userTier, isInternal);
  
  return accessibleItems.some(item => {
    const itemPath = item.url.split('?')[0];
    return cleanPath === itemPath || cleanPath.startsWith(itemPath + '/');
  });
}

export const TIER_INFO: Record<SubscriptionTier, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  free: { name: 'Free', icon: Sparkles, color: 'text-muted-foreground' },
  starter: { name: 'Starter', icon: Zap, color: 'text-blue-500' },
  creator: { name: 'Creator', icon: Video, color: 'text-green-500' },
  pro: { name: 'Professional', icon: BarChart3, color: 'text-purple-500' },
  business: { name: 'Business', icon: Users, color: 'text-orange-500' },
  enterprise: { name: 'Enterprise', icon: Crown, color: 'text-yellow-500' },
};
