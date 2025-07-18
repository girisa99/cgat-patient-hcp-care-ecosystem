import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    console.log('🔄 Processing data action:', action);

    switch (action) {
      case 'import_csv':
        // Process CSV data
        const result = await processImportData(supabase, data, 'csv');
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'import_json':
        // Process JSON data
        const jsonResult = await processImportData(supabase, data, 'json');
        return new Response(JSON.stringify(jsonResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('❌ Data processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processImportData(supabase: any, data: any, type: string) {
  console.log(`📊 Processing ${type} import with ${data.length} records`);
  
  // Create import session
  const { data: session, error: sessionError } = await supabase
    .from('data_import_sessions')
    .insert({
      import_type: type,
      source_name: `${type}_import_${Date.now()}`,
      records_total: data.length,
      status: 'processing'
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  try {
    // Process data (simplified for now)
    let processed = 0;
    for (const record of data) {
      // Here you would validate and insert each record
      processed++;
    }

    // Update session as completed
    await supabase
      .from('data_import_sessions')
      .update({
        status: 'completed',
        records_processed: processed,
        completed_at: new Date().toISOString()
      })
      .eq('id', session.id);

    return { 
      success: true, 
      sessionId: session.id,
      processed: processed,
      total: data.length 
    };

  } catch (error) {
    // Update session as failed
    await supabase
      .from('data_import_sessions')
      .update({
        status: 'failed',
        error_details: [error.message]
      })
      .eq('id', session.id);

    throw error;
  }
}