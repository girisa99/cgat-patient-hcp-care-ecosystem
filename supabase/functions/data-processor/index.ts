import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessDataRequest {
  data: Array<Record<string, unknown>>;
  type: 'csv' | 'json' | 'api';
  schema?: Record<string, string>;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: requestData, type, schema, userId }: ProcessDataRequest = await req.json();

    console.log(`Processing ${type} data for user ${userId}:`, {
      recordCount: requestData.length,
      hasSchema: !!schema
    });

    // Create import session
    const { data: session, error: sessionError } = await supabase
      .from('data_import_sessions')
      .insert({
        user_id: userId,
        import_type: type,
        source_name: `${type}_import_${Date.now()}`,
        records_total: requestData.length,
        status: 'processing',
        schema_detected: schema || {}
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Failed to create import session: ${sessionError.message}`);
    }

    // Process data in batches
    const batchSize = 50;
    const results = [];
    
    for (let i = 0; i < requestData.length; i += batchSize) {
      const batch = requestData.slice(i, i + batchSize);
      
      try {
        // Process each record in the batch
        for (const [index, record] of batch.entries()) {
          const globalIndex = i + index;
          
          // Validate record
          const validationResult = validateRecord(record, schema);
          
          if (validationResult.isValid) {
            // Insert the record into imported_data table
            const { error: insertError } = await supabase
              .from('imported_data')
              .insert({
                import_session_id: session.id,
                user_id: userId,
                row_data: record,
                row_index: globalIndex,
                validation_status: 'valid'
              });

            if (insertError) {
              console.error(`Failed to insert record ${globalIndex}:`, insertError);
              results.push({
                success: false,
                rowIndex: globalIndex,
                error: insertError.message
              });
            } else {
              results.push({
                success: true,
                rowIndex: globalIndex,
                data: record
              });
            }
          } else {
            // Insert record with validation errors
            const { error: insertError } = await supabase
              .from('imported_data')
              .insert({
                import_session_id: session.id,
                user_id: userId,
                row_data: record,
                row_index: globalIndex,
                validation_status: 'invalid',
                validation_errors: validationResult.errors
              });

            results.push({
              success: false,
              rowIndex: globalIndex,
              error: `Validation failed: ${validationResult.errors.join(', ')}`
            });
          }
        }

        // Update session progress
        const processed = Math.min(i + batchSize, requestData.length);
        await supabase
          .from('data_import_sessions')
          .update({
            records_processed: processed,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

      } catch (batchError) {
        console.error(`Batch processing error:`, batchError);
        
        // Mark failed records
        for (let j = 0; j < batch.length; j++) {
          results.push({
            success: false,
            rowIndex: i + j,
            error: `Batch processing failed: ${batchError}`
          });
        }
      }
    }

    // Calculate final stats
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    // Update session with final results
    await supabase
      .from('data_import_sessions')
      .update({
        status: failCount === 0 ? 'completed' : 'completed_with_errors',
        records_processed: successCount,
        records_failed: failCount,
        completed_at: new Date().toISOString(),
        error_details: failCount > 0 ? results.filter(r => !r.success).map(r => r.error) : null
      })
      .eq('id', session.id);

    return new Response(JSON.stringify({
      sessionId: session.id,
      totalRecords: requestData.length,
      successfulRecords: successCount,
      failedRecords: failCount,
      results: results.slice(0, 100), // Return first 100 results for preview
      status: failCount === 0 ? 'success' : 'partial_success'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in data-processor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Data processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function validateRecord(record: Record<string, unknown>, schema?: Record<string, string>) {
  const errors: string[] = [];
  
  if (!schema) {
    return { isValid: true, errors: [] };
  }

  // Basic validation based on schema
  for (const [field, type] of Object.entries(schema)) {
    const value = record[field];
    
    if (value === null || value === undefined) {
      continue; // Allow null/undefined values
    }

    switch (type) {
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`Field '${field}' should be a number`);
        }
        break;
      case 'email':
        if (typeof value === 'string' && !value.includes('@')) {
          errors.push(`Field '${field}' should be a valid email`);
        }
        break;
      case 'date':
        if (typeof value === 'string' && isNaN(Date.parse(value))) {
          errors.push(`Field '${field}' should be a valid date`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean' && !['true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
          errors.push(`Field '${field}' should be a boolean`);
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}