import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MCP Tool definitions following JSON-RPC spec
const MCP_TOOLS = {
  // Salesforce tools
  insert_salesforce_record: {
    name: 'insert_salesforce_record',
    description: 'Insert a new record into Salesforce',
    inputSchema: {
      type: 'object',
      properties: {
        sobject: { type: 'string', description: 'Salesforce object type (e.g., Account, Contact, Insurance_Policy__c)' },
        fields: { type: 'object', description: 'Field values to insert' }
      },
      required: ['sobject', 'fields']
    }
  },
  update_salesforce_record: {
    name: 'update_salesforce_record',
    description: 'Update an existing Salesforce record',
    inputSchema: {
      type: 'object',
      properties: {
        sobject: { type: 'string' },
        recordId: { type: 'string' },
        fields: { type: 'object' }
      },
      required: ['sobject', 'recordId', 'fields']
    }
  },
  
  // HubSpot tools
  create_hubspot_contact: {
    name: 'create_hubspot_contact',
    description: 'Create a new contact in HubSpot',
    inputSchema: {
      type: 'object',
      properties: {
        properties: { type: 'object', description: 'Contact properties' }
      },
      required: ['properties']
    }
  },
  create_hubspot_deal: {
    name: 'create_hubspot_deal',
    description: 'Create a new deal in HubSpot',
    inputSchema: {
      type: 'object',
      properties: {
        properties: { type: 'object' },
        associations: { type: 'array', description: 'Associated records' }
      },
      required: ['properties']
    }
  },
  
  // Veeva tools
  create_veeva_record: {
    name: 'create_veeva_record',
    description: 'Create a record in Veeva Vault',
    inputSchema: {
      type: 'object',
      properties: {
        objectType: { type: 'string' },
        fields: { type: 'object' }
      },
      required: ['objectType', 'fields']
    }
  }
};

// Salesforce API integration
async function executeSalesforceInsert(sobject: string, fields: Record<string, any>): Promise<any> {
  const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
  const clientSecret = Deno.env.get('SALESFORCE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('SALESFORCE_REFRESH_TOKEN');
  const instanceUrl = Deno.env.get('SALESFORCE_INSTANCE_URL') || 'https://login.salesforce.com';
  
  if (!clientId || !clientSecret || !refreshToken) {
    console.log('[MCP-CRM] Salesforce credentials not configured, returning mock response');
    return {
      success: true,
      mock: true,
      id: `mock_${Date.now()}`,
      message: 'Salesforce credentials not configured. Configure SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET, and SALESFORCE_REFRESH_TOKEN secrets for real integration.'
    };
  }
  
  // Step 1: Get access token via OAuth refresh
  const tokenResponse = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    })
  });
  
  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Salesforce OAuth failed: ${error}`);
  }
  
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  const apiInstanceUrl = tokenData.instance_url;
  
  // Step 2: Insert record via REST API
  const insertResponse = await fetch(
    `${apiInstanceUrl}/services/data/v59.0/sobjects/${sobject}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fields)
    }
  );
  
  if (!insertResponse.ok) {
    const error = await insertResponse.json();
    throw new Error(`Salesforce insert failed: ${JSON.stringify(error)}`);
  }
  
  const result = await insertResponse.json();
  console.log(`[MCP-CRM] Salesforce record created: ${result.id}`);
  
  return {
    success: true,
    id: result.id,
    sobject,
    message: `Record ${result.id} created in ${sobject}`
  };
}

async function executeSalesforceUpdate(sobject: string, recordId: string, fields: Record<string, any>): Promise<any> {
  const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
  const clientSecret = Deno.env.get('SALESFORCE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('SALESFORCE_REFRESH_TOKEN');
  const instanceUrl = Deno.env.get('SALESFORCE_INSTANCE_URL') || 'https://login.salesforce.com';
  
  if (!clientId || !clientSecret || !refreshToken) {
    return {
      success: true,
      mock: true,
      id: recordId,
      message: 'Salesforce credentials not configured. Configure secrets for real integration.'
    };
  }
  
  // Get access token
  const tokenResponse = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    })
  });
  
  const tokenData = await tokenResponse.json();
  
  // Update record
  const updateResponse = await fetch(
    `${tokenData.instance_url}/services/data/v59.0/sobjects/${sobject}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fields)
    }
  );
  
  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    throw new Error(`Salesforce update failed: ${JSON.stringify(error)}`);
  }
  
  return {
    success: true,
    id: recordId,
    sobject,
    message: `Record ${recordId} updated in ${sobject}`
  };
}

// HubSpot API integration
async function executeHubSpotCreateContact(properties: Record<string, any>): Promise<any> {
  const accessToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN');
  
  if (!accessToken) {
    console.log('[MCP-CRM] HubSpot credentials not configured, returning mock response');
    return {
      success: true,
      mock: true,
      id: `mock_contact_${Date.now()}`,
      message: 'HubSpot credentials not configured. Configure HUBSPOT_ACCESS_TOKEN secret for real integration.'
    };
  }
  
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ properties })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`HubSpot contact creation failed: ${JSON.stringify(error)}`);
  }
  
  const result = await response.json();
  console.log(`[MCP-CRM] HubSpot contact created: ${result.id}`);
  
  return {
    success: true,
    id: result.id,
    message: `Contact ${result.id} created in HubSpot`
  };
}

async function executeHubSpotCreateDeal(properties: Record<string, any>, associations?: any[]): Promise<any> {
  const accessToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN');
  
  if (!accessToken) {
    return {
      success: true,
      mock: true,
      id: `mock_deal_${Date.now()}`,
      message: 'HubSpot credentials not configured. Configure HUBSPOT_ACCESS_TOKEN secret for real integration.'
    };
  }
  
  const body: any = { properties };
  if (associations) {
    body.associations = associations;
  }
  
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`HubSpot deal creation failed: ${JSON.stringify(error)}`);
  }
  
  const result = await response.json();
  return {
    success: true,
    id: result.id,
    message: `Deal ${result.id} created in HubSpot`
  };
}

// Veeva Vault API integration
async function executeVeevaCreate(objectType: string, fields: Record<string, any>): Promise<any> {
  const vaultDomain = Deno.env.get('VEEVA_VAULT_DOMAIN');
  const sessionId = Deno.env.get('VEEVA_SESSION_ID');
  
  if (!vaultDomain || !sessionId) {
    console.log('[MCP-CRM] Veeva credentials not configured, returning mock response');
    return {
      success: true,
      mock: true,
      id: `mock_veeva_${Date.now()}`,
      message: 'Veeva credentials not configured. Configure VEEVA_VAULT_DOMAIN and VEEVA_SESSION_ID secrets for real integration.'
    };
  }
  
  const response = await fetch(`https://${vaultDomain}/api/v24.1/vobjects/${objectType}`, {
    method: 'POST',
    headers: {
      'Authorization': sessionId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fields)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Veeva record creation failed: ${JSON.stringify(error)}`);
  }
  
  const result = await response.json();
  console.log(`[MCP-CRM] Veeva record created: ${result.data?.id}`);
  
  return {
    success: true,
    id: result.data?.id,
    objectType,
    message: `Record created in Veeva ${objectType}`
  };
}

// MCP JSON-RPC handler
async function handleToolsCall(toolName: string, args: Record<string, any>): Promise<any> {
  console.log(`[MCP-CRM] Executing tool: ${toolName}`, args);
  
  switch (toolName) {
    case 'insert_salesforce_record':
      return await executeSalesforceInsert(args.sobject, args.fields);
      
    case 'update_salesforce_record':
      return await executeSalesforceUpdate(args.sobject, args.recordId, args.fields);
      
    case 'create_hubspot_contact':
      return await executeHubSpotCreateContact(args.properties);
      
    case 'create_hubspot_deal':
      return await executeHubSpotCreateDeal(args.properties, args.associations);
      
    case 'create_veeva_record':
      return await executeVeevaCreate(args.objectType, args.fields);
      
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await req.json();
    const { method, params, id } = body;
    
    console.log(`[MCP-CRM] Received request: ${method}`, params);
    
    // Handle MCP JSON-RPC methods
    switch (method) {
      case 'tools/list':
        // Discovery: Return available tools
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
              tools: Object.values(MCP_TOOLS)
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'tools/call':
        // Execution: Call a specific tool
        const { name, arguments: toolArgs } = params;
        const result = await handleToolsCall(name, toolArgs);
        
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result)
                }
              ]
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      default:
        // Legacy direct call support
        if (body.target && body.data) {
          const legacyResult = await handleLegacyRequest(body);
          return new Response(
            JSON.stringify(legacyResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error) {
    console.error('[MCP-CRM] Error:', error);
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: error.message
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handle legacy format requests for backward compatibility
async function handleLegacyRequest(body: any): Promise<any> {
  const { target, data, sobject, objectType } = body;
  
  switch (target) {
    case 'salesforce':
      return await executeSalesforceInsert(sobject || 'Custom_Object__c', data);
    case 'hubspot':
      return await executeHubSpotCreateContact(data);
    case 'veeva':
      return await executeVeevaCreate(objectType || 'document__v', data);
    default:
      return { success: false, error: `Unknown target: ${target}` };
  }
}
