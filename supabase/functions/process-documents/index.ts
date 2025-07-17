import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentRequest {
  documentId: string;
  knowledgeBaseId: string;
  documentType: string; 
  complianceCheck: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { documentId, knowledgeBaseId, documentType, complianceCheck } = await req.json() as DocumentRequest;

    // Update document processing queue status to 'processing'
    const { error: updateError } = await supabase
      .from('document_processing_queue')
      .update({ status: 'processing', progress_data: { stage: 'started' } })
      .eq('id', documentId);

    if (updateError) {
      throw new Error(`Failed to update document status: ${updateError.message}`);
    }

    // Simulate document processing with different stages
    let progressData = { stage: 'extraction', progress: 0 };
    
    // Extract text - simulate processing
    for (let progress = 0; progress <= 100; progress += 20) {
      progressData = { stage: 'extraction', progress };
      await supabase
        .from('document_processing_queue')
        .update({ progress_data: progressData })
        .eq('id', documentId);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Processing stage
    progressData = { stage: 'processing', progress: 0 };
    await supabase
      .from('document_processing_queue')
      .update({ progress_data: progressData })
      .eq('id', documentId);
    
    // Simulate processing
    for (let progress = 0; progress <= 100; progress += 20) {
      progressData = { stage: 'processing', progress };
      await supabase
        .from('document_processing_queue')
        .update({ progress_data: progressData })
        .eq('id', documentId);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Compliance check stage
    if (complianceCheck) {
      progressData = { stage: 'compliance_check', progress: 0 };
      await supabase
        .from('document_processing_queue')
        .update({ progress_data: progressData })
        .eq('id', documentId);
      
      // Simulate compliance check
      for (let progress = 0; progress <= 100; progress += 25) {
        progressData = { stage: 'compliance_check', progress };
        await supabase
          .from('document_processing_queue')
          .update({ progress_data: progressData })
          .eq('id', documentId);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Simulate a compliance report
      const complianceReport = {
        status: 'approved',
        score: 95,
        issues: [],
        reviewer: 'automated',
        timestamp: new Date().toISOString()
      };
      
      progressData = { stage: 'completed', progress: 100, compliance: complianceReport };
    } else {
      progressData = { stage: 'completed', progress: 100 };
    }

    // Update document status to completed
    const { error: completionError } = await supabase
      .from('document_processing_queue')
      .update({ 
        status: 'completed', 
        processed_at: new Date().toISOString(),
        progress_data: progressData 
      })
      .eq('id', documentId);

    if (completionError) {
      throw new Error(`Failed to update document completion status: ${completionError.message}`);
    }

    // Update knowledge base with processed content (simulated here)
    const { error: knowledgeBaseError } = await supabase
      .from('knowledge_base')
      .update({ 
        processed_content: `Processed content for document ${documentId}`, 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', knowledgeBaseId);

    if (knowledgeBaseError) {
      throw new Error(`Failed to update knowledge base: ${knowledgeBaseError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId, 
        status: 'completed',
        message: 'Document processed successfully' 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});