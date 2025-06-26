
/**
 * External API Publishing Workflow Manager
 * Handles the complete publishing workflow with proper status transitions
 */

import { supabase } from '@/integrations/supabase/client';
import { externalApiManager } from './ExternalApiManager';
import { externalApiSyncManager } from './ExternalApiSyncManager';

export interface PublishingWorkflowConfig {
  external_name: string;
  external_description?: string;
  version?: string;
  category?: string;
  visibility: 'private' | 'public' | 'marketplace';
  pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise';
  base_url?: string;
  documentation_url?: string;
  sandbox_url?: string;
  rate_limits?: Record<string, any>;
  authentication_methods?: string[];
  supported_formats?: string[];
  tags?: string[];
}

export interface WorkflowResult {
  success: boolean;
  message: string;
  external_api_id?: string;
  current_status: string;
  next_available_actions: string[];
}

class ExternalApiPublishingWorkflowClass {
  /**
   * Step 1: Create draft external API
   */
  async createDraft(internalApiId: string, config: PublishingWorkflowConfig): Promise<WorkflowResult> {
    console.log('📝 Creating draft external API:', { internalApiId, config });
    
    try {
      // First check if API already exists
      const existingApi = await this.checkExistingApi(internalApiId, config.external_name);
      
      if (existingApi) {
        console.log('⚠️ API already exists, updating to draft status');
        
        // Update existing API to draft status
        const updatedApi = await externalApiManager.updateExternalApiStatus(existingApi.id, 'draft');
        
        return {
          success: true,
          message: `API "${config.external_name}" updated to draft status`,
          external_api_id: updatedApi.id,
          current_status: 'draft',
          next_available_actions: ['move_to_review', 'edit_draft', 'delete_draft']
        };
      }

      // Create new draft API
      const draftApi = await externalApiManager.publishInternalApi(internalApiId, {
        ...config,
        status: 'draft', // Explicitly set to draft
        version: config.version || '1.0.0',
        rate_limits: config.rate_limits || { requests: 1000, period: 'hour' },
        authentication_methods: config.authentication_methods || ['api_key'],
        supported_formats: config.supported_formats || ['json'],
        tags: config.tags || []
      });

      console.log('✅ Draft API created successfully:', draftApi);

      return {
        success: true,
        message: `Draft API "${config.external_name}" created successfully`,
        external_api_id: draftApi.id,
        current_status: 'draft',
        next_available_actions: ['move_to_review', 'edit_draft', 'delete_draft']
      };

    } catch (error: any) {
      console.error('❌ Failed to create draft:', error);
      return {
        success: false,
        message: `Failed to create draft: ${error.message}`,
        current_status: 'error',
        next_available_actions: ['retry_create_draft']
      };
    }
  }

  /**
   * Step 2: Move draft to review
   */
  async moveToReview(externalApiId: string): Promise<WorkflowResult> {
    console.log('📋 Moving API to review:', externalApiId);
    
    try {
      // Update status to review
      const updatedApi = await externalApiManager.updateExternalApiStatus(externalApiId, 'review');
      
      // Sync endpoints if needed
      await externalApiSyncManager.syncAllEndpoints(externalApiId, updatedApi.internal_api_id);
      
      console.log('✅ API moved to review successfully');

      return {
        success: true,
        message: 'API moved to review status successfully',
        external_api_id: externalApiId,
        current_status: 'review',
        next_available_actions: ['publish', 'move_to_draft', 'reject']
      };

    } catch (error: any) {
      console.error('❌ Failed to move to review:', error);
      return {
        success: false,
        message: `Failed to move to review: ${error.message}`,
        current_status: 'error',
        next_available_actions: ['retry_move_to_review']
      };
    }
  }

  /**
   * Step 3: Publish API
   */
  async publishApi(externalApiId: string): Promise<WorkflowResult> {
    console.log('🚀 Publishing API:', externalApiId);
    
    try {
      // Update status to published
      const publishedApi = await externalApiManager.updateExternalApiStatus(externalApiId, 'published');
      
      // Perform full sync
      const syncResult = await externalApiSyncManager.publishWithFullSync(
        publishedApi.internal_api_id,
        {
          external_name: publishedApi.external_name,
          external_description: publishedApi.external_description,
          version: publishedApi.version,
          category: publishedApi.category,
          visibility: publishedApi.visibility,
          pricing_model: publishedApi.pricing_model,
          status: 'published'
        },
        {
          check_duplicates: false,
          force_republish: true,
          sync_endpoints_only: false
        }
      );

      console.log('✅ API published successfully:', syncResult);

      return {
        success: true,
        message: `API "${publishedApi.external_name}" published successfully with ${syncResult.synced_endpoints_count} endpoints`,
        external_api_id: externalApiId,
        current_status: 'published',
        next_available_actions: ['deprecate', 'update_version', 'view_analytics']
      };

    } catch (error: any) {
      console.error('❌ Failed to publish API:', error);
      return {
        success: false,
        message: `Failed to publish API: ${error.message}`,
        current_status: 'error',
        next_available_actions: ['retry_publish']
      };
    }
  }

  /**
   * Get current workflow status
   */
  async getWorkflowStatus(externalApiId: string): Promise<WorkflowResult> {
    try {
      const { data: api, error } = await supabase
        .from('external_api_registry')
        .select('*')
        .eq('id', externalApiId)
        .single();

      if (error) throw error;

      if (!api) {
        return {
          success: false,
          message: 'API not found',
          current_status: 'not_found',
          next_available_actions: []
        };
      }

      const nextActions = this.getNextAvailableActions(api.status);

      return {
        success: true,
        message: `API is currently in ${api.status} status`,
        external_api_id: externalApiId,
        current_status: api.status,
        next_available_actions: nextActions
      };

    } catch (error: any) {
      console.error('❌ Failed to get workflow status:', error);
      return {
        success: false,
        message: `Failed to get status: ${error.message}`,
        current_status: 'error',
        next_available_actions: []
      };
    }
  }

  /**
   * Complete publishing workflow (draft → review → publish)
   */
  async completePublishingWorkflow(
    internalApiId: string, 
    config: PublishingWorkflowConfig
  ): Promise<WorkflowResult> {
    console.log('🔄 Starting complete publishing workflow');
    
    try {
      // Step 1: Create draft
      const draftResult = await this.createDraft(internalApiId, config);
      if (!draftResult.success || !draftResult.external_api_id) {
        return draftResult;
      }

      // Step 2: Move to review
      const reviewResult = await this.moveToReview(draftResult.external_api_id);
      if (!reviewResult.success) {
        return reviewResult;
      }

      // Step 3: Publish
      const publishResult = await this.publishApi(draftResult.external_api_id);
      
      return publishResult;

    } catch (error: any) {
      console.error('❌ Complete workflow failed:', error);
      return {
        success: false,
        message: `Complete workflow failed: ${error.message}`,
        current_status: 'error',
        next_available_actions: ['retry_complete_workflow']
      };
    }
  }

  /**
   * Check if API already exists
   */
  private async checkExistingApi(internalApiId: string, externalName: string) {
    const { data: existingApis, error } = await supabase
      .from('external_api_registry')
      .select('*')
      .or(`internal_api_id.eq.${internalApiId},external_name.eq.${externalName}`)
      .limit(1);

    if (error) {
      console.error('Error checking existing API:', error);
      return null;
    }

    return existingApis && existingApis.length > 0 ? existingApis[0] : null;
  }

  /**
   * Get next available actions based on current status
   */
  private getNextAvailableActions(status: string): string[] {
    switch (status) {
      case 'draft':
        return ['move_to_review', 'edit_draft', 'delete_draft'];
      case 'review':
        return ['publish', 'move_to_draft', 'reject'];
      case 'published':
        return ['deprecate', 'update_version', 'view_analytics'];
      case 'deprecated':
        return ['reactivate', 'delete'];
      default:
        return [];
    }
  }
}

export const externalApiPublishingWorkflow = new ExternalApiPublishingWorkflowClass();
