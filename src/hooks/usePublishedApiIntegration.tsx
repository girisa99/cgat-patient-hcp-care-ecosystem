
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { externalApiManager } from '@/utils/api/ExternalApiManager';

export interface PublishedApiForDevelopers {
  id: string;
  external_name: string;
  external_description?: string;
  version: string;
  category?: string;
  base_url?: string;
  documentation_url?: string;
  sandbox_url?: string;
  pricing_model: string;
  rate_limits: Record<string, any>;
  authentication_methods: string[];
  supported_formats: string[];
  tags: string[];
  published_at?: string;
  endpoints?: Array<{
    id: string;
    external_path: string;
    method: string;
    summary: string;
    description?: string;
    is_public: boolean;
    requires_authentication: boolean;
  }>;
}

export const usePublishedApiIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get published APIs available for developers
  const {
    data: publishedApisForDevelopers,
    isLoading: isLoadingPublishedApis
  } = useQuery({
    queryKey: ['published-apis-for-developers'],
    queryFn: async (): Promise<PublishedApiForDevelopers[]> => {
      console.log('🔍 Fetching published APIs for developers...');
      
      // First, let's debug by fetching ALL external APIs to see what's in the database
      const { data: allExternalApis, error: allError } = await supabase
        .from('external_api_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('❌ Error fetching all external APIs for debugging:', allError);
      } else {
        console.log('🔍 DEBUG: All external APIs in database:', allExternalApis);
        console.log('🔍 DEBUG: APIs by status:', {
          draft: allExternalApis?.filter(api => api.status === 'draft').length || 0,
          review: allExternalApis?.filter(api => api.status === 'review').length || 0,
          published: allExternalApis?.filter(api => api.status === 'published').length || 0,
          deprecated: allExternalApis?.filter(api => api.status === 'deprecated').length || 0
        });
        console.log('🔍 DEBUG: APIs by visibility:', {
          private: allExternalApis?.filter(api => api.visibility === 'private').length || 0,
          public: allExternalApis?.filter(api => api.visibility === 'public').length || 0,
          marketplace: allExternalApis?.filter(api => api.visibility === 'marketplace').length || 0
        });
      }

      // Get published external APIs with the original query
      const { data: publishedApis, error } = await supabase
        .from('external_api_registry')
        .select(`
          *,
          external_api_endpoints (
            id,
            external_path,
            method,
            summary,
            description,
            is_public,
            requires_authentication
          )
        `)
        .eq('status', 'published')
        .in('visibility', ['public', 'marketplace'])
        .order('published_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching published APIs:', error);
        throw error;
      }

      console.log('✅ Original query result - published APIs:', publishedApis);
      console.log('📊 Published APIs count from original query:', publishedApis?.length || 0);

      // If no results with strict query, try a more lenient approach
      if (!publishedApis || publishedApis.length === 0) {
        console.log('🔍 No results with strict query, trying published status only...');
        
        const { data: publishedOnlyApis, error: publishedError } = await supabase
          .from('external_api_registry')
          .select(`
            *,
            external_api_endpoints (
              id,
              external_path,
              method,
              summary,
              description,
              is_public,
              requires_authentication
            )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (publishedError) {
          console.error('❌ Error fetching published-only APIs:', publishedError);
        } else {
          console.log('🔍 Published-only query result:', publishedOnlyApis);
          console.log('📊 Published-only APIs count:', publishedOnlyApis?.length || 0);
          
          // If we have published APIs but they don't match visibility criteria
          if (publishedOnlyApis && publishedOnlyApis.length > 0) {
            console.log('⚠️ Found published APIs but they may not match visibility criteria');
            console.log('🔍 Visibility values:', publishedOnlyApis.map(api => ({ 
              name: api.external_name, 
              visibility: api.visibility,
              status: api.status
            })));
            
            // Return published APIs regardless of visibility for debugging
            const mappedApis = publishedOnlyApis.map(api => ({
              id: api.id,
              external_name: api.external_name,
              external_description: api.external_description,
              version: api.version,
              category: api.category,
              base_url: api.base_url,
              documentation_url: api.documentation_url,
              sandbox_url: api.sandbox_url || generateSandboxUrl(api.id),
              pricing_model: api.pricing_model,
              rate_limits: (api.rate_limits as any) || {},
              authentication_methods: api.authentication_methods,
              supported_formats: api.supported_formats,
              tags: api.tags,
              published_at: api.published_at,
              endpoints: api.external_api_endpoints || []
            }));
            
            console.log('✅ Returning published APIs (ignoring visibility for now):', mappedApis);
            return mappedApis;
          }
        }
      }
      
      // Type cast the database results to match our interface
      const mappedResults = (publishedApis || []).map(api => ({
        id: api.id,
        external_name: api.external_name,
        external_description: api.external_description,
        version: api.version,
        category: api.category,
        base_url: api.base_url,
        documentation_url: api.documentation_url,
        sandbox_url: api.sandbox_url || generateSandboxUrl(api.id),
        pricing_model: api.pricing_model,
        rate_limits: (api.rate_limits as any) || {},
        authentication_methods: api.authentication_methods,
        supported_formats: api.supported_formats,
        tags: api.tags,
        published_at: api.published_at,
        endpoints: api.external_api_endpoints || []
      }));

      console.log('✅ Final mapped results:', mappedResults);
      return mappedResults;
    },
    staleTime: 60000
  });

  // Generate documentation for a published API
  const generateDocumentationMutation = useMutation({
    mutationFn: async (apiId: string) => {
      console.log('📚 Generating documentation for API:', apiId);
      
      const api = publishedApisForDevelopers?.find(a => a.id === apiId);
      if (!api) throw new Error('API not found');

      const documentation = {
        title: api.external_name,
        version: api.version,
        description: api.external_description || 'No description available',
        base_url: api.base_url || generateApiBaseUrl(apiId),
        authentication: {
          methods: api.authentication_methods,
          description: generateAuthDescription(api.authentication_methods)
        },
        rate_limits: api.rate_limits,
        endpoints: api.endpoints?.map(endpoint => ({
          path: endpoint.external_path,
          method: endpoint.method,
          summary: endpoint.summary,
          description: endpoint.description,
          authentication_required: endpoint.requires_authentication,
          public: endpoint.is_public
        })) || [],
        examples: generateCodeExamples(api),
        sdks: generateSdkInfo(api)
      };

      // Update the API with generated documentation URL
      const docUrl = await uploadDocumentation(apiId, documentation);
      
      const { error } = await supabase
        .from('external_api_registry')
        .update({ documentation_url: docUrl })
        .eq('id', apiId);

      if (error) throw error;

      return { apiId, documentation, docUrl };
    },
    onSuccess: (data) => {
      console.log('✅ Documentation generated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['published-apis-for-developers'] });
      toast({
        title: "Documentation Generated",
        description: `Documentation for ${data.apiId} has been generated successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Documentation generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate documentation.",
        variant: "destructive",
      });
    }
  });

  // Send notification to developers about new API
  const notifyDevelopersMutation = useMutation({
    mutationFn: async (apiId: string) => {
      console.log('📢 Sending notifications for new API:', apiId);
      
      const api = publishedApisForDevelopers?.find(a => a.id === apiId);
      if (!api) throw new Error('API not found');

      // Get all developers with notification preferences
      const { data: developers, error: devError } = await supabase
        .from('developer_notification_preferences')
        .select('user_id, new_apis, email_notifications, in_app_notifications')
        .eq('new_apis', true);

      if (devError) throw devError;

      // Create in-app notifications
      const notifications = developers
        .filter(dev => dev.in_app_notifications)
        .map(dev => ({
          user_id: dev.user_id,
          type: 'new_api',
          title: `New API Available: ${api.external_name}`,
          message: `A new ${api.category || 'API'} API "${api.external_name}" is now available in the developer portal. ${api.external_description || ''}`,
          metadata: {
            api_id: apiId,
            api_name: api.external_name,
            category: api.category,
            pricing_model: api.pricing_model
          }
        }));

      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from('developer_notifications')
          .insert(notifications);

        if (notifError) throw notifError;
      }

      return { apiId, notificationsSent: notifications.length };
    },
    onSuccess: (data) => {
      console.log('✅ Developer notifications sent:', data);
      toast({
        title: "Notifications Sent",
        description: `${data.notificationsSent} developers notified about the new API.`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Developer notifications failed:', error);
      toast({
        title: "Notification Failed",
        description: error.message || "Failed to send developer notifications.",
        variant: "destructive",
      });
    }
  });

  return {
    publishedApisForDevelopers: publishedApisForDevelopers || [],
    isLoadingPublishedApis,
    generateDocumentation: generateDocumentationMutation.mutate,
    isGeneratingDocs: generateDocumentationMutation.isPending,
    notifyDevelopers: notifyDevelopersMutation.mutate,
    isNotifyingDevelopers: notifyDevelopersMutation.isPending
  };
};

// Helper functions
function generateSandboxUrl(apiId: string): string {
  return `${window.location.origin}/api/sandbox/${apiId}`;
}

function generateApiBaseUrl(apiId: string): string {
  return `${window.location.origin}/api/v1/${apiId}`;
}

function generateAuthDescription(methods: string[]): string {
  if (methods.includes('api_key')) {
    return 'API Key authentication required. Include your API key in the Authorization header: `Authorization: Bearer YOUR_API_KEY`';
  }
  return 'Authentication method not specified.';
}

function generateCodeExamples(api: PublishedApiForDevelopers) {
  const baseUrl = api.base_url || generateApiBaseUrl(api.id);
  
  return {
    curl: `curl -X GET "${baseUrl}/endpoint" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    javascript: `const response = await fetch('${baseUrl}/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,
    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('${baseUrl}/endpoint', headers=headers)
data = response.json()`
  };
}

function generateSdkInfo(api: PublishedApiForDevelopers) {
  return {
    javascript: {
      package: `@healthcare-api/${api.external_name.toLowerCase().replace(/\s+/g, '-')}-sdk`,
      install: `npm install @healthcare-api/${api.external_name.toLowerCase().replace(/\s+/g, '-')}-sdk`,
      usage: `import { ${api.external_name.replace(/\s+/g, '')}Client } from '@healthcare-api/${api.external_name.toLowerCase().replace(/\s+/g, '-')}-sdk';

const client = new ${api.external_name.replace(/\s+/g, '')}Client('YOUR_API_KEY');`
    }
  };
}

async function uploadDocumentation(apiId: string, documentation: any): Promise<string> {
  // In a real implementation, this would upload to a documentation service
  // For now, we'll return a generated URL
  return `${window.location.origin}/docs/api/${apiId}`;
}
