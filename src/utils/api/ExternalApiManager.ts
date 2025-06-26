
/**
 * External API Management and Publishing System
 * Handles external API publishing, marketplace listings, and developer portal
 */

import { supabase } from '@/integrations/supabase/client';

export interface ExternalApiRegistry {
  id: string;
  internal_api_id: string;
  external_name: string;
  external_description?: string;
  version: string;
  status: 'draft' | 'review' | 'published' | 'deprecated';
  visibility: 'private' | 'public' | 'marketplace';
  pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise';
  category?: string;
  base_url?: string;
  documentation_url?: string;
  sandbox_url?: string;
  rate_limits: Record<string, any>;
  authentication_methods: string[];
  supported_formats: string[];
  tags: string[];
  marketplace_config: Record<string, any>;
  analytics_config: Record<string, any>;
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  published_by?: string;
}

export interface ExternalApiEndpoint {
  id: string;
  external_api_id: string;
  internal_endpoint_id?: string;
  external_path: string;
  method: string;
  summary: string;
  description?: string;
  is_public: boolean;
  requires_authentication: boolean;
  rate_limit_override?: Record<string, any>;
  request_schema?: Record<string, any>;
  response_schema?: Record<string, any>;
  example_request?: Record<string, any>;
  example_response?: Record<string, any>;
  tags: string[];
  deprecated: boolean;
  deprecation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DeveloperPortalApplication {
  id: string;
  user_id: string;
  application_name: string;
  application_type: 'web' | 'mobile' | 'server' | 'integration';
  company_name?: string;
  website_url?: string;
  description: string;
  use_case?: string;
  requested_apis: string[];
  requested_scopes: string[];
  environment: 'sandbox' | 'development' | 'production';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approval_notes?: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface MarketplaceListing {
  id: string;
  external_api_id: string;
  title: string;
  short_description: string;
  long_description?: string;
  category: string;
  subcategory?: string;
  featured: boolean;
  featured_order?: number;
  logo_url?: string;
  screenshots: string[];
  video_url?: string;
  demo_url?: string;
  support_url?: string;
  pricing_info: Record<string, any>;
  metrics: Record<string, any>;
  seo_keywords: string[];
  seo_description?: string;
  is_verified: boolean;
  verification_date?: string;
  listing_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
  published_at?: string;
}

class ExternalApiManagerClass {
  /**
   * Publishes an internal API as an external API
   */
  async publishInternalApi(
    internalApiId: string,
    publishConfig: Omit<ExternalApiRegistry, 'id' | 'internal_api_id' | 'created_at' | 'updated_at' | 'created_by'>
  ): Promise<ExternalApiRegistry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the internal API details to extract category
    const { data: internalApi } = await supabase
      .from('api_integration_registry')
      .select('category, name')
      .eq('id', internalApiId)
      .single();

    const { data, error } = await supabase
      .from('external_api_registry')
      .insert({
        internal_api_id: internalApiId,
        created_by: user.id,
        category: internalApi?.category || 'general',
        ...publishConfig
      })
      .select()
      .single();

    if (error) {
      console.error('Error publishing external API:', error);
      throw error;
    }

    return data as ExternalApiRegistry;
  }

  /**
   * Gets all external APIs
   */
  async getExternalApis(): Promise<ExternalApiRegistry[]> {
    const { data, error } = await supabase
      .from('external_api_registry')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching external APIs:', error);
      throw error;
    }

    return (data || []) as ExternalApiRegistry[];
  }

  /**
   * Gets published external APIs for public consumption
   */
  async getPublishedExternalApis(): Promise<ExternalApiRegistry[]> {
    const { data, error } = await supabase
      .from('external_api_registry')
      .select('*')
      .eq('status', 'published')
      .in('visibility', ['public', 'marketplace'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published external APIs:', error);
      throw error;
    }

    return (data || []) as ExternalApiRegistry[];
  }

  /**
   * Creates external API endpoints
   */
  async createExternalEndpoints(
    externalApiId: string,
    endpoints: Omit<ExternalApiEndpoint, 'id' | 'external_api_id' | 'created_at' | 'updated_at'>[]
  ): Promise<ExternalApiEndpoint[]> {
    const endpointsToInsert = endpoints.map(endpoint => ({
      external_api_id: externalApiId,
      ...endpoint
    }));

    const { data, error } = await supabase
      .from('external_api_endpoints')
      .insert(endpointsToInsert)
      .select();

    if (error) {
      console.error('Error creating external endpoints:', error);
      throw error;
    }

    return (data || []) as ExternalApiEndpoint[];
  }

  /**
   * Gets external API endpoints
   */
  async getExternalApiEndpoints(externalApiId: string): Promise<ExternalApiEndpoint[]> {
    const { data, error } = await supabase
      .from('external_api_endpoints')
      .select('*')
      .eq('external_api_id', externalApiId)
      .order('external_path');

    if (error) {
      console.error('Error fetching external API endpoints:', error);
      throw error;
    }

    return (data || []) as ExternalApiEndpoint[];
  }

  /**
   * Submits a developer portal application
   */
  async submitDeveloperApplication(
    application: Omit<DeveloperPortalApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<DeveloperPortalApplication> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('developer_portal_applications')
      .insert({
        user_id: user.id,
        ...application
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting developer application:', error);
      throw error;
    }

    return data as DeveloperPortalApplication;
  }

  /**
   * Gets developer applications
   */
  async getDeveloperApplications(): Promise<DeveloperPortalApplication[]> {
    const { data, error } = await supabase
      .from('developer_portal_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching developer applications:', error);
      throw error;
    }

    return (data || []) as DeveloperPortalApplication[];
  }

  /**
   * Approves or rejects a developer application
   */
  async reviewDeveloperApplication(
    applicationId: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<DeveloperPortalApplication> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      approval_notes: notes
    };

    if (decision === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = user.id;
    }

    const { data, error } = await supabase
      .from('developer_portal_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error reviewing developer application:', error);
      throw error;
    }

    return data as DeveloperPortalApplication;
  }

  /**
   * Creates a marketplace listing
   */
  async createMarketplaceListing(
    listing: Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MarketplaceListing> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert(listing)
      .select()
      .single();

    if (error) {
      console.error('Error creating marketplace listing:', error);
      throw error;
    }

    return data as MarketplaceListing;
  }

  /**
   * Gets marketplace listings
   */
  async getMarketplaceListings(): Promise<MarketplaceListing[]> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('listing_status', 'approved')
      .order('featured', { ascending: false })
      .order('featured_order', { ascending: true });

    if (error) {
      console.error('Error fetching marketplace listings:', error);
      throw error;
    }

    return (data || []) as MarketplaceListing[];
  }

  /**
   * Updates external API status
   */
  async updateExternalApiStatus(
    externalApiId: string,
    status: ExternalApiRegistry['status']
  ): Promise<ExternalApiRegistry> {
    const updateData: any = { status };
    
    if (status === 'published') {
      const { data: { user } } = await supabase.auth.getUser();
      updateData.published_at = new Date().toISOString();
      updateData.published_by = user?.id;
    }

    const { data, error } = await supabase
      .from('external_api_registry')
      .update(updateData)
      .eq('id', externalApiId)
      .select()
      .single();

    if (error) {
      console.error('Error updating external API status:', error);
      throw error;
    }

    return data as ExternalApiRegistry;
  }

  /**
   * Records API usage analytics
   */
  async recordApiUsage(
    externalApiId: string,
    usage: {
      api_key_id?: string;
      endpoint_path: string;
      method: string;
      status_code: number;
      response_time_ms?: number;
      request_size_bytes?: number;
      response_size_bytes?: number;
      user_agent?: string;
      ip_address?: string;
      error_message?: string;
      rate_limited?: boolean;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('api_usage_analytics')
      .insert({
        external_api_id: externalApiId,
        ...usage
      });

    if (error) {
      console.error('Error recording API usage:', error);
      throw error;
    }
  }

  /**
   * Gets API usage analytics
   */
  async getApiUsageAnalytics(
    externalApiId: string,
    timeRange: { start: string; end: string }
  ) {
    const { data, error } = await supabase
      .from('api_usage_analytics')
      .select('*')
      .eq('external_api_id', externalApiId)
      .gte('timestamp', timeRange.start)
      .lte('timestamp', timeRange.end)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching API usage analytics:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Gets marketplace statistics
   */
  async getMarketplaceStats() {
    const { data: publishedApis } = await supabase
      .from('external_api_registry')
      .select('id, category')
      .eq('status', 'published');

    const { data: applications } = await supabase
      .from('developer_portal_applications')
      .select('status');

    const { data: listings } = await supabase
      .from('marketplace_listings')
      .select('category, listing_status');

    return {
      totalPublishedApis: publishedApis?.length || 0,
      totalApplications: applications?.length || 0,
      pendingApplications: applications?.filter(app => app.status === 'pending').length || 0,
      approvedApplications: applications?.filter(app => app.status === 'approved').length || 0,
      totalListings: listings?.length || 0,
      approvedListings: listings?.filter(listing => listing.listing_status === 'approved').length || 0,
      apisByCategory: this.groupByCategory(publishedApis || []),
      listingsByCategory: this.groupByCategory(listings || [])
    };
  }

  private groupByCategory(items: any[]) {
    return items.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }
}

export const externalApiManager = new ExternalApiManagerClass();
