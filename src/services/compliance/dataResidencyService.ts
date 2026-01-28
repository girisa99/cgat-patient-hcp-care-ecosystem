/**
 * Data Residency Service - P5 Commercialization
 * 
 * Manages data residency controls, region configuration, and compliance tracking.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES
// ============================================

export type DataRegion = 
  | 'us-east-1' | 'us-west-2' 
  | 'eu-west-1' | 'eu-central-1' 
  | 'ap-southeast-1' | 'ap-northeast-1' | 'ap-south-1'
  | 'me-south-1' | 'af-south-1' | 'sa-east-1';

export type ResidencyEventType = 
  | 'region_changed' | 'cross_border_transfer' | 'data_exported'
  | 'gdpr_request' | 'deletion_request' | 'consent_updated'
  | 'compliance_check' | 'policy_violation';

export interface DataResidencyConfig {
  id: string;
  user_id: string;
  primary_region: DataRegion;
  allowed_regions: string[];
  restricted_regions: string[];
  gdpr_compliant: boolean;
  hipaa_compliant: boolean;
  ccpa_compliant: boolean;
  data_sovereignty_required: boolean;
  cross_border_transfers_allowed: boolean;
  transfer_requires_consent: boolean;
  sccs_in_place: boolean;
  retention_policy_days: number;
  auto_delete_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResidencyEvent {
  id: string;
  user_id: string;
  event_type: ResidencyEventType;
  from_region: string | null;
  to_region: string | null;
  event_details: Record<string, unknown>;
  occurred_at: string;
}

export interface RegionInfo {
  code: DataRegion;
  name: string;
  country: string;
  complianceFrameworks: string[];
  latencyTier: 'low' | 'medium' | 'high';
  available: boolean;
}

// ============================================
// REGION METADATA
// ============================================

export const REGION_INFO: Record<DataRegion, RegionInfo> = {
  'us-east-1': {
    code: 'us-east-1',
    name: 'US East (N. Virginia)',
    country: 'United States',
    complianceFrameworks: ['HIPAA', 'SOC2', 'FedRAMP'],
    latencyTier: 'low',
    available: true,
  },
  'us-west-2': {
    code: 'us-west-2',
    name: 'US West (Oregon)',
    country: 'United States',
    complianceFrameworks: ['HIPAA', 'SOC2'],
    latencyTier: 'low',
    available: true,
  },
  'eu-west-1': {
    code: 'eu-west-1',
    name: 'EU West (Ireland)',
    country: 'Ireland',
    complianceFrameworks: ['GDPR', 'ISO27001'],
    latencyTier: 'low',
    available: true,
  },
  'eu-central-1': {
    code: 'eu-central-1',
    name: 'EU Central (Frankfurt)',
    country: 'Germany',
    complianceFrameworks: ['GDPR', 'ISO27001', 'C5'],
    latencyTier: 'low',
    available: true,
  },
  'ap-southeast-1': {
    code: 'ap-southeast-1',
    name: 'Asia Pacific (Singapore)',
    country: 'Singapore',
    complianceFrameworks: ['PDPA', 'ISO27001'],
    latencyTier: 'medium',
    available: true,
  },
  'ap-northeast-1': {
    code: 'ap-northeast-1',
    name: 'Asia Pacific (Tokyo)',
    country: 'Japan',
    complianceFrameworks: ['APPI', 'ISO27001'],
    latencyTier: 'medium',
    available: true,
  },
  'ap-south-1': {
    code: 'ap-south-1',
    name: 'Asia Pacific (Mumbai)',
    country: 'India',
    complianceFrameworks: ['PDPB', 'ISO27001'],
    latencyTier: 'medium',
    available: true,
  },
  'me-south-1': {
    code: 'me-south-1',
    name: 'Middle East (Bahrain)',
    country: 'Bahrain',
    complianceFrameworks: ['PDPL', 'ISO27001'],
    latencyTier: 'medium',
    available: true,
  },
  'af-south-1': {
    code: 'af-south-1',
    name: 'Africa (Cape Town)',
    country: 'South Africa',
    complianceFrameworks: ['POPIA', 'ISO27001'],
    latencyTier: 'high',
    available: true,
  },
  'sa-east-1': {
    code: 'sa-east-1',
    name: 'South America (São Paulo)',
    country: 'Brazil',
    complianceFrameworks: ['LGPD', 'ISO27001'],
    latencyTier: 'medium',
    available: true,
  },
};

// ============================================
// SERVICE
// ============================================

class DataResidencyService {
  private static instance: DataResidencyService;

  private constructor() {}

  static getInstance(): DataResidencyService {
    if (!DataResidencyService.instance) {
      DataResidencyService.instance = new DataResidencyService();
    }
    return DataResidencyService.instance;
  }

  /**
   * Get available regions
   */
  getAvailableRegions(): RegionInfo[] {
    return Object.values(REGION_INFO).filter(r => r.available);
  }

  /**
   * Get region info
   */
  getRegionInfo(region: DataRegion): RegionInfo | null {
    return REGION_INFO[region] || null;
  }

  /**
   * Get or create data residency config for a user
   */
  async getConfig(userId: string): Promise<DataResidencyConfig | null> {
    try {
      const { data, error } = await supabase
        .from('data_residency_config' as any)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return this.initializeConfig(userId);
      }

      if (error) {
        console.error('[DataResidency] Error fetching config:', error);
        return null;
      }

      return data as unknown as DataResidencyConfig;
    } catch (error) {
      console.error('[DataResidency] Error:', error);
      return null;
    }
  }

  /**
   * Initialize data residency config for a new user
   */
  async initializeConfig(userId: string): Promise<DataResidencyConfig | null> {
    try {
      const { data, error } = await supabase
        .from('data_residency_config' as any)
        .insert({
          user_id: userId,
          primary_region: 'us-east-1',
          allowed_regions: ['us-east-1'],
          restricted_regions: [],
          gdpr_compliant: false,
          hipaa_compliant: false,
          ccpa_compliant: false,
          data_sovereignty_required: false,
          cross_border_transfers_allowed: true,
          transfer_requires_consent: false,
          sccs_in_place: false,
          retention_policy_days: 365,
          auto_delete_enabled: false,
        })
        .select()
        .single();

      if (error) {
        console.error('[DataResidency] Error initializing config:', error);
        return null;
      }

      return data as unknown as DataResidencyConfig;
    } catch (error) {
      console.error('[DataResidency] Error:', error);
      return null;
    }
  }

  /**
   * Update primary region
   */
  async setPrimaryRegion(userId: string, region: DataRegion): Promise<boolean> {
    try {
      const currentConfig = await this.getConfig(userId);
      const fromRegion = currentConfig?.primary_region;

      const { error } = await supabase
        .from('data_residency_config' as any)
        .update({
          primary_region: region,
          allowed_regions: [region], // Reset to only primary
        })
        .eq('user_id', userId);

      if (error) {
        console.error('[DataResidency] Error updating region:', error);
        return false;
      }

      await this.logEvent(userId, 'region_changed', fromRegion, region);
      return true;
    } catch (error) {
      console.error('[DataResidency] Error:', error);
      return false;
    }
  }

  /**
   * Update compliance settings
   */
  async updateComplianceSettings(
    userId: string,
    settings: Partial<Pick<DataResidencyConfig,
      'gdpr_compliant' | 'hipaa_compliant' | 'ccpa_compliant' |
      'data_sovereignty_required' | 'cross_border_transfers_allowed' |
      'transfer_requires_consent' | 'sccs_in_place'
    >>
  ): Promise<DataResidencyConfig | null> {
    try {
      const { data, error } = await supabase
        .from('data_residency_config' as any)
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[DataResidency] Error updating settings:', error);
        return null;
      }

      await this.logEvent(userId, 'compliance_check', null, null, {
        updated_settings: Object.keys(settings),
      });

      return data as unknown as DataResidencyConfig;
    } catch (error) {
      console.error('[DataResidency] Error:', error);
      return null;
    }
  }

  /**
   * Update data retention policy
   */
  async setRetentionPolicy(
    userId: string,
    retentionDays: number,
    autoDelete: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('data_residency_config' as any)
        .update({
          retention_policy_days: retentionDays,
          auto_delete_enabled: autoDelete,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('[DataResidency] Error updating retention:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[DataResidency] Error:', error);
      return false;
    }
  }

  /**
   * Log a data residency event
   */
  async logEvent(
    userId: string,
    eventType: ResidencyEventType,
    fromRegion?: string | null,
    toRegion?: string | null,
    details?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('data_residency_events' as any)
        .insert({
          user_id: userId,
          event_type: eventType,
          from_region: fromRegion || null,
          to_region: toRegion || null,
          event_details: details || {},
        });

      if (error) {
        console.error('[DataResidency] Error logging event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[DataResidency] Error:', error);
      return false;
    }
  }

  /**
   * Get residency event history
   */
  async getEventHistory(userId: string, limit = 50): Promise<ResidencyEvent[]> {
    try {
      const { data, error } = await supabase
        .from('data_residency_events' as any)
        .select('*')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[DataResidency] Error fetching events:', error);
        return [];
      }

      return (data || []) as unknown as ResidencyEvent[];
    } catch (error) {
      console.error('[DataResidency] Error:', error);
      return [];
    }
  }

  /**
   * Check if a cross-border transfer is allowed
   */
  async isTransferAllowed(
    userId: string,
    fromRegion: DataRegion,
    toRegion: DataRegion
  ): Promise<{ allowed: boolean; reason?: string }> {
    const config = await this.getConfig(userId);
    if (!config) {
      return { allowed: false, reason: 'Configuration not found' };
    }

    // Check if cross-border transfers are disabled
    if (!config.cross_border_transfers_allowed && fromRegion !== toRegion) {
      return { allowed: false, reason: 'Cross-border transfers are disabled' };
    }

    // Check if target region is restricted
    if (config.restricted_regions.includes(toRegion)) {
      return { allowed: false, reason: 'Target region is restricted' };
    }

    // Check if target region is in allowed list
    if (config.allowed_regions.length > 0 && !config.allowed_regions.includes(toRegion)) {
      return { allowed: false, reason: 'Target region is not in allowed list' };
    }

    // Check data sovereignty requirements
    if (config.data_sovereignty_required) {
      const fromInfo = REGION_INFO[fromRegion];
      const toInfo = REGION_INFO[toRegion];
      if (fromInfo?.country !== toInfo?.country) {
        return { allowed: false, reason: 'Data sovereignty requires same-country storage' };
      }
    }

    return { allowed: true };
  }

  /**
   * Get recommended region based on user location
   */
  getRecommendedRegion(userCountry: string): DataRegion {
    const regionMapping: Record<string, DataRegion> = {
      // North America
      'US': 'us-east-1',
      'CA': 'us-east-1',
      'MX': 'us-east-1',
      // Europe
      'GB': 'eu-west-1',
      'DE': 'eu-central-1',
      'FR': 'eu-west-1',
      'IT': 'eu-west-1',
      'ES': 'eu-west-1',
      'NL': 'eu-west-1',
      // Asia Pacific
      'JP': 'ap-northeast-1',
      'KR': 'ap-northeast-1',
      'SG': 'ap-southeast-1',
      'IN': 'ap-south-1',
      'AU': 'ap-southeast-1',
      // Middle East
      'AE': 'me-south-1',
      'SA': 'me-south-1',
      'BH': 'me-south-1',
      // Africa
      'ZA': 'af-south-1',
      'NG': 'af-south-1',
      'KE': 'af-south-1',
      // South America
      'BR': 'sa-east-1',
      'AR': 'sa-east-1',
      'CL': 'sa-east-1',
    };

    return regionMapping[userCountry] || 'us-east-1';
  }
}

export const dataResidencyService = DataResidencyService.getInstance();
