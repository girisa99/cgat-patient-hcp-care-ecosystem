/**
 * GENIE STUDIO NAVIGATION ITEMS
 * Isolated navigation for Genie Studio users
 * Filtered by subscription tier
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACCESS CONTROL CONFIGURATION - EASY TO MODIFY DURING TESTING
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Each nav item has:
 * - minTier: Minimum subscription tier required ('free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise')
 * - isInternal: If true, only visible to users with is_internal=true in genie_studio_users table
 * 
 * TIER HIERARCHY (lowest to highest):
 *   free < starter < creator < pro < business < enterprise
 * 
 * TO CHANGE ACCESS:
 * 1. Find the nav item by title below
 * 2. Change minTier to adjust subscription requirement
 * 3. Add/remove isInternal: true to show/hide from external users
 * 
 * CURRENT ACCESS MATRIX (per your specification):
 * ┌─────────────────────┬────────────┬─────────────┐
 * │ Tab/Feature         │ Min Tier   │ Internal?   │
 * ├─────────────────────┼────────────┼─────────────┤
 * │ PLAN                │            │             │
 * │   Taskboard         │ starter    │ No          │
 * │   Schedule          │ starter    │ No          │
 * │   Meetings          │ starter    │ No          │
 * ├─────────────────────┼────────────┼─────────────┤
 * │ CREATE              │            │             │
 * │   Library           │ free       │ YES         │
 * │   Studio            │ free       │ YES         │
 * ├─────────────────────┼────────────┼─────────────┤
 * │ ANALYZE             │            │             │
 * │   Metrics           │ free       │ YES         │
 * │   Business          │ free       │ YES         │
 * │   Health            │ free       │ YES         │
 * ├─────────────────────┼────────────┼─────────────┤
 * │ ADMIN               │            │             │
 * │   Workspaces        │ pro        │ YES         │
 * │   Teams             │ pro        │ YES         │
 * │   Branding          │ business   │ YES         │
 * │   Activity          │ enterprise │ YES         │
 * ├─────────────────────┼────────────┼─────────────┤
 * │ AI                  │            │             │
 * │   Routing           │ pro        │ YES         │
 * │   Command           │ enterprise │ YES         │
 * │   Architecture      │ free       │ YES         │
 * ├─────────────────────┼────────────┼─────────────┤
 * │ PUBLISH             │            │             │
 * │   Review & Enhance  │ business   │ YES         │
 * │   Assets            │ business   │ YES         │
 * │   Scheduler         │ pro        │ YES         │
 * │   Distribution      │ free       │ No (tiered) │
 * │     └─ Free         │ download only            │
 * │     └─ Pro+         │ YT/TikTok/FB/IG          │
 * │     └─ Business+    │ all channels             │
 * └─────────────────────┴────────────┴─────────────┘
 * 
 * ARCHITECTURE:
 * - WORKSPACE: Dashboard products (Studio, Deck)
 * - CREATE: Ideation tools (Spark, Mind, Content Tools)
 * - PRODUCE: Production tools (Vibe)
 * - PUBLISH: Distribution (Scheduler, Library)
 * - MANAGE: All admin/analytics/settings (merged from Production Hub)
 * - ACCOUNT: User settings
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
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
  Film,
  Camera,
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
  // Review & Enhance - Business+ tier, visible to internal users
  {
    title: "Review & Enhance",
    url: "/genie-admin?tab=composition&step=review",
    icon: FileCheck,
    description: "Review and enhance generated content before publishing",
    minTier: 'business',
    category: 'publish',
    isInternal: true,
  },
  // Assets - Business+ tier, visible to internal users
  {
    title: "Assets",
    url: "/genie-admin?tab=composition&view=assets",
    icon: Package,
    description: "View and manage all generated assets",
    minTier: 'business',
    category: 'publish',
    isInternal: true,
  },
  // Scheduler - Pro+ tier, visible to internal users
  {
    title: "Scheduler",
    url: "/genie-admin?tab=scheduler",
    icon: Send,
    description: "Schedule content across platforms",
    minTier: 'pro',
    category: 'publish',
    isInternal: true,
  },
  // Distribution - Available to ALL tiers with tiered capabilities:
  // - Free: Download only (manual distribution)
  // - Pro+: YouTube, TikTok, Facebook, Instagram
  // - Business/Enterprise/Internal: All channels including LinkedIn Company Pages
  {
    title: "Distribution",
    url: "/genie-admin?tab=library",
    icon: Megaphone,
    description: "Download & distribute content (Pro+: social platforms, Business+: all channels)",
    minTier: 'free',
    category: 'publish',
    // NOTE: Available to all users, but capabilities are tiered within the component
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
  // CREATE - Content library and composition tools (Internal Only)
  {
    title: "Library",
    url: "/genie-admin?tab=library",
    icon: FolderOpen,
    description: "Browse, search, and organize all your media assets",
    minTier: 'free',
    category: 'manage',
    subCategory: 'Create',
    isInternal: true,
  },
  {
    title: "Studio",
    url: "/genie-admin?tab=composition",
    icon: Layers,
    description: "Create new compositions and combine media elements",
    minTier: 'free',
    category: 'manage',
    subCategory: 'Create',
    isInternal: true,
  },
  // Genie Cast - Landing video production (Internal Only)
  {
    title: "Genie Cast",
    url: "/genie-admin?tab=landing-videos",
    icon: Film,
    description: "Generate and manage landing page marketing videos",
    minTier: 'free',
    category: 'manage',
    subCategory: 'Create',
    isInternal: true,
  },
  // ANALYZE - Performance metrics and business intelligence (Internal Only)
  {
    title: "Metrics",
    url: "/genie-admin?tab=analytics",
    icon: BarChart3,
    description: "Track production KPIs, engagement, and content performance",
    minTier: 'free',
    category: 'manage',
    subCategory: 'Analyze',
    isInternal: true,
  },
  {
    title: "Business",
    url: "/genie-admin?tab=enterprise-analytics",
    icon: Globe,
    description: "Enterprise-level ROI, revenue, and growth analytics",
    minTier: 'free',
    category: 'manage',
    subCategory: 'Analyze',
    isInternal: true,
  },
  {
    title: "Health",
    url: "/genie-admin?tab=error-analytics",
    icon: AlertTriangle,
    description: "Monitor system health, errors, and service diagnostics",
    minTier: 'free',
    category: 'manage',
    subCategory: 'Analyze',
    isInternal: true,
  },
  // ADMIN - Team, workspace, and branding configuration (Internal + Tiered)
  {
    title: "Workspaces",
    url: "/genie-admin?tab=workspaces",
    icon: Layout,
    description: "Create and manage isolated project workspaces",
    minTier: 'pro',
    category: 'manage',
    subCategory: 'Admin',
    isInternal: true,
  },
  {
    title: "Team",
    url: "/genie-admin?tab=team",
    icon: Users,
    description: "Invite members, assign roles, and manage permissions",
    minTier: 'pro',
    category: 'manage',
    subCategory: 'Admin',
    isInternal: true,
  },
  {
    title: "Branding",
    url: "/genie-admin?tab=whitelabel",
    icon: Palette,
    description: "Customize logos, colors, and white-label settings",
    minTier: 'business',
    category: 'manage',
    subCategory: 'Admin',
    isInternal: true,
  },
  {
    title: "Activity",
    url: "/genie-admin?tab=collaboration",
    icon: MessageSquare,
    description: "View team activity feed and collaboration history",
    minTier: 'enterprise',
    category: 'manage',
    subCategory: 'Admin',
    isInternal: true,
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
