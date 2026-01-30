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
  FileCheck,
  Package,
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
  // Review & Enhance - review generated content before publishing
  {
    title: "Review & Enhance",
    url: "/genie-admin?tab=composition&step=review",
    icon: FileCheck,
    description: "Review and enhance generated content before publishing",
    minTier: 'starter',
    category: 'publish',
  },
  // Assets - view all generated assets
  {
    title: "Assets",
    url: "/genie-admin?tab=composition&view=assets",
    icon: Package,
    description: "View and manage all generated assets",
    minTier: 'starter',
    category: 'publish',
  },
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
  // PLAN - Task management, scheduling, and meetings
  {
    title: "Task Board",
    url: "/genie-admin?tab=kanban",
    icon: KanbanSquare,
    description: "Organize production tasks with drag-and-drop kanban boards",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Plan',
  },
  {
    title: "Schedule",
    url: "/genie-admin?tab=calendar",
    icon: CalendarDays,
    description: "View and manage your production timeline calendar",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Plan',
  },
  {
    title: "Meetings",
    url: "/genie-admin?tab=appointments",
    icon: CalendarCheck,
    description: "Book and manage team meetings and client calls",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Plan',
  },
  // CREATE - Content library and composition tools
  {
    title: "Library",
    url: "/genie-admin?tab=library",
    icon: FolderOpen,
    description: "Browse, search, and organize all your media assets",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Create',
  },
  {
    title: "Studio",
    url: "/genie-admin?tab=composition",
    icon: Layers,
    description: "Create new compositions and combine media elements",
    minTier: 'starter',
    category: 'manage',
    subCategory: 'Create',
  },
  // ANALYZE - Performance metrics and business intelligence
  {
    title: "Metrics",
    url: "/genie-admin?tab=analytics",
    icon: BarChart3,
    description: "Track production KPIs, engagement, and content performance",
    minTier: 'pro',
    category: 'manage',
    subCategory: 'Analyze',
  },
  {
    title: "Business",
    url: "/genie-admin?tab=enterprise-analytics",
    icon: Globe,
    description: "Enterprise-level ROI, revenue, and growth analytics",
    minTier: 'enterprise',
    category: 'manage',
    subCategory: 'Analyze',
  },
  {
    title: "Health",
    url: "/genie-admin?tab=error-analytics",
    icon: AlertTriangle,
    description: "Monitor system health, errors, and service diagnostics",
    minTier: 'pro',
    category: 'manage',
    subCategory: 'Analyze',
  },
  // ADMIN - Team, workspace, and branding configuration
  {
    title: "Workspaces",
    url: "/genie-admin?tab=workspaces",
    icon: Layout,
    description: "Create and manage isolated project workspaces",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Admin',
  },
  {
    title: "Team",
    url: "/genie-admin?tab=team",
    icon: Users,
    description: "Invite members, assign roles, and manage permissions",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Admin',
  },
  {
    title: "Branding",
    url: "/genie-admin?tab=whitelabel",
    icon: Palette,
    description: "Customize logos, colors, and white-label settings",
    minTier: 'enterprise',
    category: 'manage',
    subCategory: 'Admin',
  },
  {
    title: "Activity",
    url: "/genie-admin?tab=collaboration",
    icon: MessageSquare,
    description: "View team activity feed and collaboration history",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Admin',
  },
  // AI - AI routing and system governance (Internal Only)
  {
    title: "Routing",
    url: "/genie-admin?tab=ai-intelligence",
    icon: Brain,
    description: "Configure AI model routing, comparison, and intent analysis",
    minTier: 'pro',
    category: 'manage',
    subCategory: 'AI',
    isInternal: true,
  },
  {
    title: "Command",
    url: "/genie-admin?tab=command-center",
    icon: Command,
    description: "System governance, roadmaps, and operational oversight",
    minTier: 'enterprise',
    category: 'manage',
    subCategory: 'AI',
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
    description: "View system architecture diagrams and technical documentation",
    minTier: 'free',
    category: 'manage',
    subCategory: 'AI',
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
