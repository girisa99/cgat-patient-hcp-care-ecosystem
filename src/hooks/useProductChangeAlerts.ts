/**
 * useProductChangeAlerts Hook
 * 
 * React hook for subscribing to product change alerts from the version tracking service.
 * Used by Genie Cast to detect when screenshots/videos need regeneration.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  productVersionTrackingService, 
  type ProductChangeAlert,
  type GenieProductId,
  GENIE_PRODUCTS,
} from '@/services/marketing/productVersionTrackingService';
import { toast } from 'sonner';

interface UseProductChangeAlertsOptions {
  /** Whether to show toast notifications for new alerts */
  showNotifications?: boolean;
  /** Filter to specific product IDs */
  productIds?: GenieProductId[];
  /** Auto-poll interval in ms (0 = disabled) */
  pollInterval?: number;
}

interface UseProductChangeAlertsReturn {
  /** All active alerts (unresolved) */
  alerts: ProductChangeAlert[];
  /** Alerts filtered by severity */
  criticalAlerts: ProductChangeAlert[];
  warningAlerts: ProductChangeAlert[];
  infoAlerts: ProductChangeAlert[];
  /** Products that need attention */
  productsNeedingAttention: { productId: string; productName: string; alertCount: number; severity: string }[];
  /** Summary stats */
  summary: {
    totalProducts: number;
    productsNeedingUpdate: number;
    totalActiveAlerts: number;
    criticalAlerts: number;
  };
  /** Resolve an alert */
  resolveAlert: (alertId: string, productId: string) => void;
  /** Mark screenshots as captured for a product */
  markScreenshotsCaptured: (productId: string) => void;
  /** Mark video as generated for a product */
  markVideoGenerated: (productId: string) => void;
  /** Register a product change manually */
  registerChange: (
    productId: GenieProductId,
    changedFeatures: { featureId: string; featureName: string; changeType: 'added' | 'modified' | 'removed' | 'ui_update'; description: string; affectedScreens: string[]; messagingNeedsUpdate: boolean }[],
    changeDescription: string
  ) => void;
  /** Get alerts for a specific product */
  getProductAlerts: (productId: string) => ProductChangeAlert[];
  /** Refresh alerts */
  refresh: () => void;
}

export function useProductChangeAlerts(
  options: UseProductChangeAlertsOptions = {}
): UseProductChangeAlertsReturn {
  const { showNotifications = true, productIds, pollInterval = 0 } = options;
  
  const [alerts, setAlerts] = useState<ProductChangeAlert[]>([]);

  // Fetch alerts
  const fetchAlerts = useCallback(() => {
    let allAlerts = productVersionTrackingService.getAllActiveAlerts();
    
    // Filter by product IDs if specified
    if (productIds && productIds.length > 0) {
      allAlerts = allAlerts.filter(a => productIds.includes(a.productId as GenieProductId));
    }
    
    setAlerts(allAlerts);
  }, [productIds]);

  // Subscribe to new alerts
  useEffect(() => {
    fetchAlerts();

    const unsubscribe = productVersionTrackingService.onChangeAlert((alert) => {
      // Filter if needed
      if (productIds && productIds.length > 0 && !productIds.includes(alert.productId as GenieProductId)) {
        return;
      }

      setAlerts(prev => [...prev, alert]);

      // Show toast notification
      if (showNotifications) {
        const toastFn = alert.severity === 'critical' ? toast.error : 
                        alert.severity === 'warning' ? toast.warning : 
                        toast.info;
        
        toastFn(alert.message, {
          description: alert.actionRequired,
          duration: alert.severity === 'critical' ? 10000 : 5000,
        });
      }
    });

    return () => unsubscribe();
  }, [fetchAlerts, showNotifications, productIds]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(fetchAlerts, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, fetchAlerts]);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string, productId: string) => {
    productVersionTrackingService.resolveAlert(alertId, productId);
    fetchAlerts();
  }, [fetchAlerts]);

  // Mark screenshots captured
  const markScreenshotsCaptured = useCallback((productId: string) => {
    productVersionTrackingService.markScreenshotsCaptured(productId);
    fetchAlerts();
    toast.success(`Screenshots updated for ${GENIE_PRODUCTS[productId as GenieProductId]?.name || productId}`);
  }, [fetchAlerts]);

  // Mark video generated
  const markVideoGenerated = useCallback((productId: string) => {
    productVersionTrackingService.markVideoGenerated(productId);
    fetchAlerts();
    toast.success(`Video regenerated for ${GENIE_PRODUCTS[productId as GenieProductId]?.name || productId}`);
  }, [fetchAlerts]);

  // Register change
  const registerChange = useCallback((
    productId: GenieProductId,
    changedFeatures: { featureId: string; featureName: string; changeType: 'added' | 'modified' | 'removed' | 'ui_update'; description: string; affectedScreens: string[]; messagingNeedsUpdate: boolean }[],
    changeDescription: string
  ) => {
    productVersionTrackingService.registerProductChange(productId, changedFeatures, changeDescription);
    fetchAlerts();
  }, [fetchAlerts]);

  // Get product alerts
  const getProductAlerts = useCallback((productId: string) => {
    return productVersionTrackingService.getProductAlerts(productId);
  }, []);

  // Derived values
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');
  const productsNeedingAttention = productVersionTrackingService.getProductsNeedingAttention();
  const summary = productVersionTrackingService.getSummary();

  return {
    alerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    productsNeedingAttention,
    summary,
    resolveAlert,
    markScreenshotsCaptured,
    markVideoGenerated,
    registerChange,
    getProductAlerts,
    refresh: fetchAlerts,
  };
}

export default useProductChangeAlerts;
