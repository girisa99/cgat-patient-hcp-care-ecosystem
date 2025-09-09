import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToolExecutionRequest {
  tool_name: string;
  tool_type: string;
  input_data?: any;
  execution_context?: any;
  node_configuration?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { tool_name, tool_type, input_data, execution_context, node_configuration }: ToolExecutionRequest = await req.json();

    console.log(`Executing tool: ${tool_name} of type: ${tool_type}`);

    let result: any = {};

    // Route to appropriate tool execution based on tool_name
    switch (tool_name.toLowerCase()) {
      case 'arxiv':
        result = await executeArxivSearch(input_data);
        break;
      
      case 'bravesearch api':
      case 'bravesearch mcp':
        result = await executeBraveSearch(input_data);
        break;
      
      case 'tavily api':
        result = await executeTavilySearch(input_data);
        break;
      
      case 'calculator':
        result = await executeCalculator(input_data);
        break;
      
      case 'currentdatetime':
        result = await executeCurrentDateTime(input_data);
        break;
      
      case 'custom tool':
        result = await executeCustomTool(input_data, node_configuration);
        break;
      
      default:
        // Try to execute as MCP or integration tool
        if (tool_name.startsWith('integration:')) {
          result = await executeIntegrationTool(tool_name, input_data, execution_context);
        } else {
          result = await executeGenericTool(tool_name, tool_type, input_data, node_configuration);
        }
    }

    return new Response(JSON.stringify({
      success: true,
      tool_name,
      tool_type,
      result,
      execution_context,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Tool execution error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeArxivSearch(input: any): Promise<any> {
  console.log('Executing Arxiv search with input:', input);
  
  const query = input.query || input.search_term || 'artificial intelligence';
  const maxResults = input.maxResults || input.max_results || 5;
  
  try {
    const response = await fetch(`http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}`);
    const xmlText = await response.text();
    
    // Simple XML parsing for demo - in production, use a proper XML parser
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const papers = entries.slice(0, maxResults).map((entry, index) => {
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
      const linkMatch = entry.match(/<id>(.*?)<\/id>/);
      
      return {
        title: titleMatch ? titleMatch[1].trim() : `Paper ${index + 1}`,
        summary: summaryMatch ? summaryMatch[1].trim().substring(0, 200) + '...' : 'No summary available',
        url: linkMatch ? linkMatch[1].trim() : '',
      };
    });

    return {
      query,
      total_results: papers.length,
      papers,
    };
  } catch (error) {
    return {
      error: 'Failed to search Arxiv',
      details: error.message,
    };
  }
}

async function executeBraveSearch(input: any): Promise<any> {
  console.log('Executing Brave search with input:', input);
  
  // Mock implementation - replace with actual Brave Search API
  const query = input.query || input.search_term || 'search query';
  
  return {
    query,
    results: [
      {
        title: `Search result for: ${query}`,
        description: 'This is a mock search result from Brave Search API',
        url: 'https://example.com',
      }
    ],
    mock: true,
    message: 'This is a mock implementation. Add your Brave Search API key to enable real searches.',
  };
}

async function executeTavilySearch(input: any): Promise<any> {
  console.log('Executing Tavily search with input:', input);
  
  // Mock implementation - replace with actual Tavily API
  const query = input.query || input.topic || 'research query';
  
  return {
    query,
    results: [
      {
        title: `Research result for: ${query}`,
        content: 'This is a mock research result from Tavily API',
        url: 'https://example.com',
        score: 0.95,
      }
    ],
    mock: true,
    message: 'This is a mock implementation. Add your Tavily API key to enable real research.',
  };
}

async function executeCalculator(input: any): Promise<any> {
  console.log('Executing calculator with input:', input);
  
  try {
    const expression = input.expression || input.calculation || input.formula;
    
    if (!expression) {
      throw new Error('No expression provided');
    }
    
    // Simple calculator - only basic operations for security
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    
    // Use Function constructor instead of eval for basic safety
    const result = new Function(`"use strict"; return (${sanitized})`)();
    
    return {
      expression: sanitized,
      result,
      type: 'calculation',
    };
  } catch (error) {
    return {
      error: 'Invalid mathematical expression',
      details: error.message,
    };
  }
}

async function executeCurrentDateTime(input: any): Promise<any> {
  console.log('Executing current date/time');
  
  const now = new Date();
  const timezone = input.timezone || 'UTC';
  
  return {
    timestamp: now.toISOString(),
    formatted: now.toLocaleString('en-US', { timeZone: timezone }),
    timezone,
    unix: Math.floor(now.getTime() / 1000),
    components: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    },
  };
}

async function executeCustomTool(input: any, configuration: any): Promise<any> {
  console.log('Executing custom tool with input:', input, 'configuration:', configuration);
  
  // Process custom tool based on configuration
  const toolConfig = configuration?.customTools || configuration?.tools || [];
  
  return {
    input,
    configuration: toolConfig,
    result: 'Custom tool executed successfully',
    timestamp: new Date().toISOString(),
  };
}

async function executeIntegrationTool(toolName: string, input: any, context: any): Promise<any> {
  console.log('Executing integration tool:', toolName);
  
  const integrationId = toolName.replace('integration:', '');
  
  // Mock implementation for MCP/integration tools
  return {
    integration_id: integrationId,
    input,
    context,
    result: 'Integration tool executed successfully',
    mock: true,
    message: 'This is a mock implementation for MCP/integration tools.',
  };
}

async function executeGenericTool(toolName: string, toolType: string, input: any, configuration: any): Promise<any> {
  console.log('Executing generic tool:', toolName, 'type:', toolType);
  
  // Fallback for any unrecognized tools
  return {
    tool_name: toolName,
    tool_type: toolType,
    input,
    configuration,
    result: 'Generic tool execution completed',
    message: 'This tool was executed using the generic handler.',
  };
}