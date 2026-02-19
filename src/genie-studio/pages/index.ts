/**
 * Genie Suite Pages - Barrel Export
 * Re-exports all Genie Suite page components
 * Note: GenieArc removed - merged into Production Hub (/genie-admin)
 */

// Main pages - Re-export from original locations for backward compatibility
// These will be gradually migrated to this folder
export { default as GenieStudio } from '@/pages/GenieStudio';
export { default as GenieSpark } from '@/pages/GenieSpark';
export { default as GenieVibe } from '@/pages/GenieVibe';
export { default as GenieMind } from '@/pages/GenieMind';
// GenieArc removed - now redirects to /genie-admin?tab=calendar
export { default as GenieAnalyticsPage } from '@/pages/GenieAnalyticsPage';
export { default as GenieStudioAuth } from '@/pages/GenieStudioAuth';
export { default as GenieStudioPricing } from '@/pages/GenieStudioPricing';
export { ConfigurableGeniePage } from '@/pages/ConfigurableGeniePage';
export { default as GenieManagementPage } from '@/pages/GenieManagementPage';
