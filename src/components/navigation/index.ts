/**
 * Navigation Components Index
 * 
 * Exports all navigation-related components including the new
 * 4-Quadrant Architecture components
 */

// 4-Quadrant Architecture (New)
export { QuadrantNavigation, QUADRANT_CONFIG } from './QuadrantNavigation';
export type { Quadrant, QuadrantConfig } from './QuadrantNavigation';
export { QuadrantDashboard } from './QuadrantDashboard';
export { QuadrantLayout } from './QuadrantLayout';
export { QuadrantProductHeader, PRODUCT_BRANDING, QUADRANT_PRODUCTS, ProductBadge } from './QuadrantProductHeader';
export type { ProductBranding } from './QuadrantProductHeader';

// Legacy Navigation (To be deprecated)
export { GenieStudioNavigation } from './GenieStudioNavigation';
export { RoleBasedNavigation } from './RoleBasedNavigation';
export { EnrollmentQuickAccess } from './EnrollmentQuickAccess';
