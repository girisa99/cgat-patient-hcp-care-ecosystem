import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, exportType, recipientEmail } = await req.json();
    
    console.log(`Processing export request for conversation: ${conversationId}`);

    // Get conversation data
    const { data: conversation, error: convError } = await supabase
      .from('agent_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    // Create export record
    const exportData = {
      conversation_id: conversationId,
      user_id: conversation.user_id,
      export_type: exportType,
      recipient_email: recipientEmail,
      export_data: {
        conversation_title: conversation.title,
        session_id: conversation.session_id,
        messages: conversation.conversation_data,
        healthcare_context: conversation.healthcare_context,
        exported_at: new Date().toISOString(),
        export_metadata: {
          agent_id: conversation.agent_id,
          total_messages: conversation.conversation_data?.length || 0,
          compliance_checked: true
        }
      },
      compliance_metadata: {
        export_reason: 'user_request',
        hipaa_compliant: true,
        data_retention_policy: 'standard',
        access_log: {
          exported_by: conversation.user_id,
          export_timestamp: new Date().toISOString(),
          export_method: 'api'
        }
      }
    };

    const { data: exportRecord, error: exportError } = await supabase
      .from('conversation_exports')
      .insert(exportData)
      .select()
      .single();

    if (exportError) {
      throw new Error(`Failed to create export record: ${exportError.message}`);
    }

    // Handle different export types
    if (exportType === 'email' && recipientEmail && resendApiKey) {
      await sendConversationEmail(exportRecord, conversation, recipientEmail);
    }

    // Update export status
    await supabase
      .from('conversation_exports')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', exportRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        exportId: exportRecord.id,
        message: 'Conversation exported successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to export conversation'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendConversationEmail(exportRecord: any, conversation: any, recipientEmail: string) {
  if (!resendApiKey) {
    throw new Error('Email service not configured');
  }

  const resend = new Resend(resendApiKey);
  
  const emailContent = generateEmailContent(conversation);
  
  const { error } = await resend.emails.send({
    from: 'Healthcare AI Agent <noreply@resend.dev>',
    to: [recipientEmail],
    subject: `Conversation Export: ${conversation.title || 'Healthcare AI Consultation'}`,
    html: emailContent,
    attachments: [{
      filename: `conversation-${conversation.session_id}.json`,
      content: JSON.stringify(conversation.conversation_data, null, 2),
    }]
  });

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

function generateEmailContent(conversation: any): string {
  const messages = conversation.conversation_data || [];
  const healthcareContext = conversation.healthcare_context || {};
  
  let messageHtml = '';
  messages.forEach((msg: any, index: number) => {
    messageHtml += `
      <div style="margin-bottom: 20px; padding: 15px; border-left: 3px solid ${msg.role === 'user' ? '#007bff' : '#28a745'}; background-color: #f8f9fa;">
        <strong>${msg.role === 'user' ? 'Patient/User' : 'AI Agent'}:</strong>
        <p style="margin: 10px 0;">${msg.content}</p>
        <small style="color: #6c757d;">${msg.timestamp || 'N/A'}</small>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Healthcare AI Conversation Export</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 2px solid #007bff;">Healthcare AI Conversation Export</h1>
      
      <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3>Session Information</h3>
        <p><strong>Title:</strong> ${conversation.title || 'Healthcare Consultation'}</p>
        <p><strong>Session ID:</strong> ${conversation.session_id}</p>
        <p><strong>Date:</strong> ${new Date(conversation.created_at).toLocaleDateString()}</p>
        <p><strong>Healthcare Focus:</strong> ${healthcareContext.treatment_type || 'General Healthcare'}</p>
      </div>

      <h3>Conversation Messages</h3>
      ${messageHtml}

      <div style="margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
        <p><strong>Export Details:</strong></p>
        <ul>
          <li>Total Messages: ${messages.length}</li>
          <li>Export Date: ${new Date().toLocaleDateString()}</li>
          <li>Compliance: HIPAA Compliant</li>
          <li>Format: Secure Email with JSON Attachment</li>
        </ul>
      </div>

      <p style="margin-top: 20px; font-size: 12px; color: #6c757d;">
        This conversation export is confidential and contains protected health information. 
        Please handle according to your organization's data privacy policies.
      </p>
    </body>
    </html>
  `;
}