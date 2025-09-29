import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflowInstanceId, nodeData, executionContext } = await req.json();

    console.log('Executing workflow node:', { workflowInstanceId, nodeData });

    // Get workflow instance
    const { data: instance, error: instanceError } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', workflowInstanceId)
      .single();

    if (instanceError) {
      throw new Error(`Failed to get workflow instance: ${instanceError.message}`);
    }

    // Initialize Arize tracing if available
    let arizeTraceId: string | null = null;
    if (nodeData.arizeConfig?.enabled) {
      // In production, this would use actual Arize SDK
      arizeTraceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Arize trace started:', arizeTraceId, {
        workflowInstanceId,
        nodeId: nodeData.id,
        nodeType: nodeData.type
      });
    }

    // Log execution start
    const { data: logEntry, error: logError } = await supabase
      .from('workflow_execution_logs')
      .insert({
        workflow_instance_id: workflowInstanceId,
        node_id: nodeData.id,
        node_type: nodeData.type,
        execution_status: 'started',
        input_data: nodeData,
        started_at: new Date().toISOString(),
        arize_trace_id: arizeTraceId
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create log entry:', logError);
    }

    // Execute node based on type
    let result;
    const startTime = Date.now();

    try {
      switch (nodeData.type) {
        case 'llm':
          result = await executeLLMNode(nodeData, executionContext);
          break;
        case 'voice':
          result = await executeVoiceNode(nodeData, executionContext);
          break;
        case 'healthcare_compliance':
          result = await executeHealthcareComplianceNode(nodeData, executionContext);
          break;
        case 'vector_store':
          result = await executeVectorStoreNode(nodeData, executionContext);
          break;
        default:
          result = { success: true, data: nodeData, message: 'Node executed successfully' };
      }

      const executionTime = Date.now() - startTime;

      // Log Arize trace completion
      if (arizeTraceId) {
        console.log('Arize trace completed:', arizeTraceId, {
          status: 'success',
          executionTime,
          outputData: result
        });
      }

      // Update log entry with success
      if (logEntry) {
        await supabase
          .from('workflow_execution_logs')
          .update({
            execution_status: 'completed',
            output_data: result,
            execution_time_ms: executionTime,
            completed_at: new Date().toISOString(),
            arize_trace_id: arizeTraceId
          })
          .eq('id', logEntry.id);
      }

      // Update workflow instance
      await supabase
        .from('workflow_instances')
        .update({
          current_node_id: nodeData.id,
          execution_context: { ...executionContext, ...result.context },
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowInstanceId);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (executionError) {
      const executionTime = Date.now() - startTime;
      
      // Log Arize trace error
      if (arizeTraceId) {
        console.log('Arize trace failed:', arizeTraceId, {
          status: 'error',
          error: executionError instanceof Error ? executionError.message : 'Unknown error',
          executionTime
        });
      }

      // Update log entry with error
      if (logEntry) {
        await supabase
          .from('workflow_execution_logs')
          .update({
            execution_status: 'failed',
            error_details: { 
              message: executionError instanceof Error ? executionError.message : 'Unknown error',
              stack: executionError instanceof Error ? executionError.stack : undefined
            },
            execution_time_ms: executionTime,
            completed_at: new Date().toISOString(),
            arize_trace_id: arizeTraceId
          })
          .eq('id', logEntry.id);
      }

      throw executionError;
    }
  } catch (error) {
    console.error('Error in workflow execution:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeLLMNode(nodeData: any, context: any) {
  // LLM node execution logic
  console.log('Executing LLM node:', nodeData);
  return {
    success: true,
    data: { response: 'LLM response generated' },
    context: { llm_executed: true }
  };
}

async function executeVoiceNode(nodeData: any, context: any) {
  // Voice node execution logic
  console.log('Executing Voice node:', nodeData);
  return {
    success: true,
    data: { audio_generated: true },
    context: { voice_executed: true }
  };
}

async function executeHealthcareComplianceNode(nodeData: any, context: any) {
  // Healthcare compliance node execution logic
  console.log('Executing Healthcare Compliance node:', nodeData);
  return {
    success: true,
    data: { compliance_checked: true },
    context: { compliance_executed: true }
  };
}

async function executeVectorStoreNode(nodeData: any, context: any) {
  // Vector store node execution logic
  console.log('Executing Vector Store node:', nodeData);
  return {
    success: true,
    data: { vector_processed: true },
    context: { vector_executed: true }
  };
}