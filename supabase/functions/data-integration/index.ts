import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataOperation {
  operation: 'import' | 'export' | 'update' | 'bulk_update' | 'import_from_api' | 'sync_to_api';
  tableName: string;
  data?: any;
  filters?: Record<string, any>;
  format?: 'json' | 'csv';
  mapping?: Record<string, string>;
  apiEndpoint?: string;
  headers?: Record<string, string>;
}

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

    const { operation, tableName, data, filters, format, mapping, apiEndpoint, headers }: DataOperation = await req.json();

    console.log('Data integration operation:', { operation, tableName, format });

    switch (operation) {
      case 'import': {
        const result = await handleImport(supabaseClient, tableName, data, mapping);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'export': {
        const result = await handleExport(supabaseClient, tableName, filters, format);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update': {
        const result = await handleUpdate(supabaseClient, tableName, data.id, data.updates);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bulk_update': {
        const result = await handleBulkUpdate(supabaseClient, tableName, data);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'import_from_api': {
        const result = await handleImportFromAPI(supabaseClient, tableName, apiEndpoint!, headers, mapping);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync_to_api': {
        const result = await handleSyncToAPI(supabaseClient, tableName, apiEndpoint!, filters, headers);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid operation');
    }
  } catch (error) {
    console.error('Error in data-integration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleImport(supabaseClient: any, tableName: string, data: any[], mapping?: Record<string, string>) {
  const result = { success: 0, errors: 0, details: [] as any[] };
  
  for (let i = 0; i < data.length; i++) {
    try {
      const transformedData = transformData(data[i], mapping);
      
      const { error } = await supabaseClient
        .from(tableName)
        .upsert({
          ...transformedData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      result.success++;
    } catch (error: any) {
      result.errors++;
      result.details.push({
        row: i + 1,
        error: error.message
      });
    }
  }

  return result;
}

async function handleExport(supabaseClient: any, tableName: string, filters?: Record<string, any>, format?: string) {
  let query = supabaseClient.from(tableName).select('*');
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;
  if (error) throw error;

  if (format === 'csv') {
    const csvContent = convertJSONToCSV(data);
    return { data: csvContent, format: 'csv', count: data.length };
  }

  return { data, format: 'json', count: data.length };
}

async function handleUpdate(supabaseClient: any, tableName: string, id: string, updates: any) {
  const { error } = await supabaseClient
    .from(tableName)
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;

  return { success: true, updated_id: id };
}

async function handleBulkUpdate(supabaseClient: any, tableName: string, updates: Array<{ id: string; data: any }>) {
  const result = { success: 0, errors: 0, details: [] as any[] };
  
  for (let i = 0; i < updates.length; i++) {
    try {
      const { id, data } = updates[i];
      await handleUpdate(supabaseClient, tableName, id, data);
      result.success++;
    } catch (error: any) {
      result.errors++;
      result.details.push({
        row: i + 1,
        error: error.message
      });
    }
  }

  return result;
}

function transformData(data: any, mapping?: Record<string, string>): any {
  if (!mapping) return data;
  
  const transformed: any = {};
  Object.entries(data).forEach(([key, value]) => {
    const mappedKey = mapping[key] || key;
    transformed[mappedKey] = value;
  });
  
  return transformed;
}

function convertJSONToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

async function handleImportFromAPI(supabaseClient: any, tableName: string, apiEndpoint: string, headers?: Record<string, string>, mapping?: Record<string, string>) {
  const result = { success: 0, errors: 0, details: [] as any[] };
  
  try {
    // Fetch data from external API
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: fetchHeaders
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData = await response.json();
    const dataArray = Array.isArray(apiData) ? apiData : [apiData];

    // Process and import each record
    for (let i = 0; i < dataArray.length; i++) {
      try {
        const transformedData = transformData(dataArray[i], mapping);
        
        const { error } = await supabaseClient
          .from(tableName)
          .upsert({
            ...transformedData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        
        result.success++;
      } catch (error: any) {
        result.errors++;
        result.details.push({
          row: i + 1,
          error: error.message
        });
      }
    }

    return result;
  } catch (error: any) {
    throw new Error(`API import failed: ${error.message}`);
  }
}

async function handleSyncToAPI(supabaseClient: any, tableName: string, apiEndpoint: string, filters?: Record<string, any>, headers?: Record<string, string>) {
  try {
    // Get data from Supabase
    let query = supabaseClient.from(tableName).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    if (error) throw error;

    // Send data to external API
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API sync failed: ${response.status} ${response.statusText}`);
    }

    return { 
      success: true, 
      count: data.length,
      message: 'Data successfully synced to external API'
    };
  } catch (error: any) {
    throw new Error(`API sync failed: ${error.message}`);
  }
}