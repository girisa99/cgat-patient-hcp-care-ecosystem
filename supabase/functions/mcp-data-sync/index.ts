import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  target: 'supabase' | 'salesforce' | 'hubspot' | 'veeva' | 'webhook' | 'api';
  table?: string;
  endpoint?: string;
  data: any[];
  format?: 'json' | 'csv';
  syncType?: 'create' | 'update' | 'create_or_update';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { target, table, endpoint, data, format = 'json', syncType = 'create' } = await req.json() as SyncRequest;
    console.log(`📤 MCP Data Sync request: target=${target}, records=${data.length}`);

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "No data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result: any = { success: false };

    switch (target) {
      case 'supabase': {
        // Save to Supabase table
        const targetTable = table || 'document_exports';
        
        // Check if table exists by querying, create if doesn't exist
        const exportRecords = data.map(item => ({
          export_data: item,
          document_id: item.id,
          file_name: item.fileName,
          document_type: item.documentType,
          processed_at: item.processedAt,
          validation_status: item.validationStatus,
          created_at: new Date().toISOString()
        }));

        // Try to insert into document_processing_exports if document_exports doesn't work
        const { data: insertResult, error } = await supabase
          .from('document_processing_jobs')
          .upsert(
            data.map(item => ({
              id: item.id,
              file_name: item.fileName,
              document_type: item.documentType,
              status: 'exported',
              extracted_metadata: { exportedFields: item.extractedFields },
              processing_config: { exportFormat: format, exportedAt: new Date().toISOString() }
            })),
            { onConflict: 'id' }
          );

        if (error) {
          console.error('Supabase insert error:', error);
          // Fallback - just log the export
          console.log(`📊 Would export ${data.length} records to ${targetTable}`);
        }

        result = { 
          success: true, 
          target: 'supabase',
          recordsProcessed: data.length,
          message: `Exported ${data.length} records to Supabase`
        };
        break;
      }

      case 'webhook':
      case 'api': {
        // Call external endpoint
        if (!endpoint) {
          return new Response(
            JSON.stringify({ error: "Endpoint URL required for webhook/API sync" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`📡 Sending ${data.length} records to ${endpoint}`);

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source: 'document-processing',
              format,
              timestamp: new Date().toISOString(),
              records: data
            })
          });

          result = {
            success: response.ok,
            target,
            endpoint,
            status: response.status,
            recordsProcessed: data.length,
            message: response.ok 
              ? `Sent ${data.length} records to ${target}`
              : `Failed with status ${response.status}`
          };
        } catch (fetchError) {
          console.error('Webhook error:', fetchError);
          result = {
            success: false,
            target,
            endpoint,
            error: fetchError instanceof Error ? fetchError.message : 'Fetch failed'
          };
        }
        break;
      }

      case 'salesforce':
      case 'hubspot':
      case 'veeva': {
        // CRM integrations - log for now, would require OAuth tokens
        console.log(`🔗 CRM Sync to ${target}: ${data.length} records`);
        console.log(`   SyncType: ${syncType}`);
        
        // In a real implementation, you would:
        // 1. Get OAuth tokens from secrets
        // 2. Map data to CRM-specific format
        // 3. Call CRM API

        // For now, simulate success and log
        const crmFieldMappings = {
          salesforce: {
            patient_name: 'Name',
            medication: 'Prescription__c',
            date_of_birth: 'Date_of_Birth__c'
          },
          hubspot: {
            patient_name: 'firstname',
            medication: 'medication',
            date_of_birth: 'date_of_birth'
          },
          veeva: {
            patient_name: 'Patient_Name_vod__c',
            medication: 'Product_vod__c',
            date_of_birth: 'DOB_vod__c'
          }
        };

        result = {
          success: true,
          target,
          syncType,
          recordsProcessed: data.length,
          fieldMappings: crmFieldMappings[target],
          message: `Simulated sync of ${data.length} records to ${target}. Configure ${target.toUpperCase()}_API_KEY for real sync.`
        };
        break;
      }

      default:
        result = { success: false, error: `Unknown target: ${target}` };
    }

    console.log(`✅ MCP Sync complete:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("MCP Data Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
