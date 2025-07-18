import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { 
      agentType, 
      agentPurpose, 
      categories, 
      businessUnits, 
      count = 5,
      context = 'healthcare'
    } = await req.json();

    // Get available AI models and MCP servers
    const { data: aiModels } = await supabaseClient
      .from('ai_model_integrations')
      .select('*')
      .eq('is_active', true);

    const { data: mcpServers } = await supabaseClient
      .from('mcp_servers')
      .select('*')
      .eq('is_active', true);

    // Generate templates using AI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate ${count} intelligent action templates for an AI agent with the following characteristics:

Agent Type: ${agentType || 'General Purpose'}
Agent Purpose: ${agentPurpose || 'Healthcare Assistant'}
Categories: ${categories?.join(', ') || 'General'}
Business Units: ${businessUnits?.join(', ') || 'Healthcare'}
Context: ${context}

Available AI Models: ${aiModels?.map(m => `${m.name} (${m.provider})`).join(', ')}
Available MCP Servers: ${mcpServers?.map(s => `${s.name} (${s.type})`).join(', ')}

For each template, provide:
1. name: A clear, specific action name
2. description: Detailed description of what the action does
3. category: One of [communication, data_processing, analysis, integration, automation, custom]
4. type: One of [trigger, scheduled, on_demand]
5. priority: One of [low, medium, high, critical]
6. estimated_duration: Duration in minutes (1-60)
7. requires_approval: Boolean
8. recommended_ai_model: Best AI model for this action
9. recommended_mcp_server: Best MCP server for this action
10. tasks: Array of 2-4 specific tasks with:
    - task_name: Clear task name
    - task_description: What this task does
    - task_order: Sequential order (1, 2, 3, etc.)
    - task_type: Type of task [action, validation, analysis, notification]
    - required_inputs: Array of required input parameters
    - expected_outputs: Array of expected outputs
    - timeout_minutes: Max time for this task (5-30)
    - is_critical: Boolean if task failure blocks the action

Focus on ${context} domain expertise and practical, actionable templates that would be valuable for the specified agent type and purpose.

Return a valid JSON array of templates.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI expert in healthcare automation and agent design. Generate practical, implementable action templates in valid JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const templatesContent = data.choices[0].message.content;
    
    // Parse the AI response
    let templates;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = templatesContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        templates = JSON.parse(jsonMatch[0]);
      } else {
        templates = JSON.parse(templatesContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', templatesContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Enhance templates with actual model/server IDs
    const enhancedTemplates = templates.map((template: any) => {
      // Find best matching AI model
      const aiModel = aiModels?.find(m => 
        m.name.toLowerCase().includes(template.recommended_ai_model?.toLowerCase()) ||
        m.provider.toLowerCase().includes(template.recommended_ai_model?.toLowerCase())
      ) || aiModels?.[0];

      // Find best matching MCP server
      const mcpServer = mcpServers?.find(s => 
        s.name.toLowerCase().includes(template.recommended_mcp_server?.toLowerCase()) ||
        s.type.toLowerCase().includes(template.recommended_mcp_server?.toLowerCase())
      ) || mcpServers?.[0];

      return {
        ...template,
        ai_model_id: aiModel?.id,
        mcp_server_id: mcpServer?.server_id,
        template_config: {
          generated_by: 'ai',
          generation_context: {
            agent_type: agentType,
            agent_purpose: agentPurpose,
            categories,
            business_units: businessUnits,
            context
          },
          recommended_ai_model: template.recommended_ai_model,
          recommended_mcp_server: template.recommended_mcp_server,
          generation_timestamp: new Date().toISOString()
        }
      };
    });

    return new Response(
      JSON.stringify({ 
        templates: enhancedTemplates,
        metadata: {
          generation_context: {
            agent_type: agentType,
            agent_purpose: agentPurpose,
            categories,
            business_units: businessUnits,
            context
          },
          available_models: aiModels?.length || 0,
          available_servers: mcpServers?.length || 0,
          generated_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-action-templates function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate action templates', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});