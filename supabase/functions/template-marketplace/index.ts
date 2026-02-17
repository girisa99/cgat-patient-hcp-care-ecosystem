import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketplaceRequest {
  action: 'list_templates' | 'get_template' | 'install_template' | 'publish_template' | 'rate_template' | 'search' | 'get_categories' | 'get_featured';
  template_id?: string;
  category?: string;
  search_query?: string;
  rating?: number;
  review?: string;
  template_data?: {
    name: string;
    description: string;
    category: string;
    configuration: Record<string, unknown>;
    preview_url?: string;
    tags?: string[];
    price?: number;
  };
  page?: number;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    let currentUserId: string | null = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      currentUserId = user?.id || null;
    }

    const { action, template_id, category, search_query, rating, review, template_data, page = 1, limit = 20 } = await req.json() as MarketplaceRequest;

    console.log(`🏪 Template Marketplace: ${action}`, { template_id, category, search_query });

    switch (action) {
      case 'list_templates': {
        let query = supabase
          .from('marketplace_templates')
          .select(`
            id, name, description, category, tags, preview_url, 
            price, currency, avg_rating, install_count, 
            created_by, created_at, is_featured, is_verified
          `)
          .eq('status', 'published')
          .order('install_count', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error, count } = await query
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          templates: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            has_more: (data?.length || 0) === limit
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_template': {
        if (!template_id) throw new Error('template_id is required');

        const { data: template, error } = await supabase
          .from('marketplace_templates')
          .select('*')
          .eq('id', template_id)
          .single();

        if (error) throw error;

        // Get reviews
        const { data: reviews } = await supabase
          .from('template_reviews')
          .select(`
            id, rating, review, created_at,
            profiles:user_id (first_name, last_name, avatar_url)
          `)
          .eq('template_id', template_id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Check if user has installed
        let userInstalled = false;
        if (currentUserId) {
          const { data: installation } = await supabase
            .from('template_installations')
            .select('id')
            .eq('template_id', template_id)
            .eq('user_id', currentUserId)
            .single();
          userInstalled = !!installation;
        }

        return new Response(JSON.stringify({
          success: true,
          template: {
            ...template,
            reviews: reviews || [],
            user_installed: userInstalled
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'install_template': {
        if (!template_id) throw new Error('template_id is required');
        if (!currentUserId) throw new Error('Authentication required');

        // Get template
        const { data: template, error: templateError } = await supabase
          .from('marketplace_templates')
          .select('*')
          .eq('id', template_id)
          .single();

        if (templateError) throw templateError;

        // Check if already installed
        const { data: existing } = await supabase
          .from('template_installations')
          .select('id')
          .eq('template_id', template_id)
          .eq('user_id', currentUserId)
          .single();

        if (existing) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Template already installed'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create installation record
        const installationId = crypto.randomUUID();
        await supabase.from('template_installations').insert({
          id: installationId,
          template_id,
          user_id: currentUserId,
          installed_at: new Date().toISOString(),
          configuration: template.configuration
        });

        // Increment install count
        await supabase.rpc('increment_template_installs', { template_id });

        // Create agent from template if it's an agent template
        let createdAgentId = null;
        if (template.template_type === 'agent') {
          const { data: agent } = await supabase
            .from('agents')
            .insert({
              name: template.name,
              description: template.description,
              configuration: template.configuration,
              template_id,
              created_by: currentUserId,
              status: 'draft'
            })
            .select()
            .single();
          createdAgentId = agent?.id;
        }

        return new Response(JSON.stringify({
          success: true,
          installation_id: installationId,
          created_agent_id: createdAgentId,
          message: 'Template installed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'publish_template': {
        if (!currentUserId) throw new Error('Authentication required');
        if (!template_data) throw new Error('template_data is required');

        const templateId = crypto.randomUUID();
        const { data, error } = await supabase
          .from('marketplace_templates')
          .insert({
            id: templateId,
            name: template_data.name,
            description: template_data.description,
            category: template_data.category,
            configuration: template_data.configuration,
            preview_url: template_data.preview_url,
            tags: template_data.tags || [],
            price: template_data.price || 0,
            currency: 'USD',
            created_by: currentUserId,
            status: template_data.price && template_data.price > 0 ? 'pending_review' : 'published',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          template_id: templateId,
          status: data.status,
          message: data.status === 'pending_review' 
            ? 'Template submitted for review' 
            : 'Template published successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'rate_template': {
        if (!template_id || !rating) throw new Error('template_id and rating are required');
        if (!currentUserId) throw new Error('Authentication required');

        // Check if user has installed the template
        const { data: installation } = await supabase
          .from('template_installations')
          .select('id')
          .eq('template_id', template_id)
          .eq('user_id', currentUserId)
          .single();

        if (!installation) {
          return new Response(JSON.stringify({
            success: false,
            error: 'You must install the template before rating it'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Upsert review
        const { data, error } = await supabase
          .from('template_reviews')
          .upsert({
            template_id,
            user_id: currentUserId,
            rating: Math.min(5, Math.max(1, rating)),
            review: review || null,
            created_at: new Date().toISOString()
          }, { onConflict: 'template_id,user_id' })
          .select()
          .single();

        if (error) throw error;

        // Update average rating
        await supabase.rpc('update_template_avg_rating', { template_id });

        return new Response(JSON.stringify({
          success: true,
          review: data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'search': {
        if (!search_query) throw new Error('search_query is required');

        const { data, error } = await supabase
          .from('marketplace_templates')
          .select('id, name, description, category, tags, preview_url, avg_rating, install_count')
          .eq('status', 'published')
          .or(`name.ilike.%${search_query}%,description.ilike.%${search_query}%,tags.cs.{${search_query}}`)
          .order('install_count', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          results: data || [],
          query: search_query
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_categories': {
        const categories = [
          { id: 'healthcare', name: 'Healthcare', icon: '🏥', count: 0 },
          { id: 'sales', name: 'Sales & Marketing', icon: '📈', count: 0 },
          { id: 'support', name: 'Customer Support', icon: '🎧', count: 0 },
          { id: 'education', name: 'Education', icon: '📚', count: 0 },
          { id: 'hr', name: 'Human Resources', icon: '👥', count: 0 },
          { id: 'finance', name: 'Finance', icon: '💰', count: 0 },
          { id: 'legal', name: 'Legal', icon: '⚖️', count: 0 },
          { id: 'productivity', name: 'Productivity', icon: '⚡', count: 0 },
          { id: 'other', name: 'Other', icon: '📦', count: 0 }
        ];

        // Get counts for each category
        for (const cat of categories) {
          const { count } = await supabase
            .from('marketplace_templates')
            .select('id', { count: 'exact', head: true })
            .eq('category', cat.id)
            .eq('status', 'published');
          cat.count = count || 0;
        }

        return new Response(JSON.stringify({
          success: true,
          categories
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_featured': {
        const { data: featured, error } = await supabase
          .from('marketplace_templates')
          .select('id, name, description, category, preview_url, avg_rating, install_count, is_verified')
          .eq('status', 'published')
          .eq('is_featured', true)
          .order('install_count', { ascending: false })
          .limit(6);

        if (error) throw error;

        const { data: popular } = await supabase
          .from('marketplace_templates')
          .select('id, name, description, category, preview_url, avg_rating, install_count')
          .eq('status', 'published')
          .order('install_count', { ascending: false })
          .limit(10);

        const { data: newest } = await supabase
          .from('marketplace_templates')
          .select('id, name, description, category, preview_url, avg_rating, install_count')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        return new Response(JSON.stringify({
          success: true,
          featured: featured || [],
          popular: popular || [],
          newest: newest || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Template Marketplace error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
