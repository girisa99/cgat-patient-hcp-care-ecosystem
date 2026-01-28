/**
 * useDataResidency Hook
 * React hook for managing data residency configuration.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  dataResidencyService,
  type DataResidencyConfig,
  type ResidencyEvent,
  type DataRegion,
  type RegionInfo,
  REGION_INFO
} from '@/services/compliance/dataResidencyService';

export function useDataResidency() {
  const [userId, setUserId] = useState<string | null>(null);
  const [config, setConfig] = useState<DataResidencyConfig | null>(null);
  const [events, setEvents] = useState<ResidencyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableRegions = Object.values(REGION_INFO).filter(r => r.available);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setConfig(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const configData = await dataResidencyService.getConfig(userId);
      setConfig(configData);
    } catch (err) {
      setError('Failed to load data residency configuration');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const setPrimaryRegion = useCallback(async (region: DataRegion) => {
    if (!userId) return false;
    const success = await dataResidencyService.setPrimaryRegion(userId, region);
    if (success) await refresh();
    return success;
  }, [userId, refresh]);

  const updateComplianceSettings = useCallback(async (settings: Partial<DataResidencyConfig>) => {
    if (!userId) return false;
    const updated = await dataResidencyService.updateComplianceSettings(userId, settings);
    if (updated) { setConfig(updated); return true; }
    return false;
  }, [userId]);

  const setRetentionPolicy = useCallback(async (days: number, autoDelete: boolean) => {
    if (!userId) return false;
    const success = await dataResidencyService.setRetentionPolicy(userId, days, autoDelete);
    if (success) await refresh();
    return success;
  }, [userId, refresh]);

  const isTransferAllowed = useCallback(async (from: DataRegion, to: DataRegion) => {
    if (!userId) return { allowed: false, reason: 'Not authenticated' };
    return dataResidencyService.isTransferAllowed(userId, from, to);
  }, [userId]);

  const getRegionInfo = (region: DataRegion): RegionInfo | null => dataResidencyService.getRegionInfo(region);
  const getRecommendedRegion = (countryCode: string): DataRegion => dataResidencyService.getRecommendedRegion(countryCode);

  const loadEventHistory = useCallback(async (limit = 50) => {
    if (!userId) return;
    const data = await dataResidencyService.getEventHistory(userId, limit);
    setEvents(data);
  }, [userId]);

  useEffect(() => {
    if (userId) refresh();
  }, [userId, refresh]);

  return { config, events, availableRegions, isLoading, error, refresh, setPrimaryRegion, updateComplianceSettings, setRetentionPolicy, isTransferAllowed, getRegionInfo, getRecommendedRegion, loadEventHistory };
}

export default useDataResidency;
