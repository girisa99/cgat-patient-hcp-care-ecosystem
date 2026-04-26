import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  action: 'submit' | 'respond' | 'update_status' | 'get_feedback' | 'get_review_status';
  session_id: string;
  participant_token?: string; // For participant authentication
  feedback_id?: string;
  
  // For submitting feedback
  feedback_type?: string;
  category?: string;
  subject?: string;
  content?: string;
  reference_type?: string;
  reference_value?: string;
  suggested_value?: string;
  priority?: string;
  
  // For responding
  response?: string;
  
  // For status updates
  status?: string;
  review_field?: string; // 'script_review_status', 'title_review_status', etc.
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const body: FeedbackRequest = await req.json();
    console.log('Processing feedback action:', body.action);

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('genie_sessions')
      .select('*')
      .eq('id', body.session_id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Verify participant if token provided
    let participant = null;
    if (body.participant_token) {
      const { data: p } = await supabase
        .from('genie_session_participants')
        .select('*')
        .eq('session_id', body.session_id)
        .eq('participant_token', body.participant_token)
        .single();
      participant = p;
    }

    switch (body.action) {
      case 'submit': {
        // Submit new feedback
        const { data: feedback, error: feedbackError } = await supabase
          .from('genie_session_feedback')
          .insert({
            session_id: body.session_id,
            participant_id: participant?.id,
            feedback_type: body.feedback_type || 'general',
            category: body.category || 'general',
            subject: body.subject,
            content: body.content,
            reference_type: body.reference_type,
            reference_value: body.reference_value,
            suggested_value: body.suggested_value,
            priority: body.priority || 'normal',
            is_from_host: !participant,
            status: 'pending',
          })
          .select()
          .single();

        if (feedbackError) throw feedbackError;

        // Notify host if feedback from participant
        if (participant && resend && session.host_email) {
          try {
            await resend.emails.send({
              from: 'Genie Suite <noreply@resend.dev>',
              to: [session.host_email],
              subject: `New feedback on "${session.title}" from ${participant.name}`,
              html: generateFeedbackNotificationEmail(session, participant, feedback, 'new'),
            });
          } catch (emailError) {
            console.error('Email notification failed:', emailError);
          }
        }

        // Notify participant if feedback from host
        if (!participant && body.participant_token === undefined) {
          const { data: allParticipants } = await supabase
            .from('genie_session_participants')
            .select('*')
            .eq('session_id', body.session_id);

          if (resend && allParticipants) {
            for (const p of allParticipants) {
              try {
                await resend.emails.send({
                  from: 'Genie Suite <noreply@resend.dev>',
                  to: [p.email],
                  subject: `New message from host: "${session.title}"`,
                  html: generateHostMessageEmail(session, p, feedback),
                });
              } catch (e) {
                console.error('Participant notification failed:', e);
              }
            }
          }
        }

        return new Response(JSON.stringify({ success: true, feedback }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'respond': {
        if (!body.feedback_id) throw new Error('feedback_id required');

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (participant) {
          // Participant responding to host
          updateData.read_by_participant = true;
          // Create a reply feedback
          const { data: reply } = await supabase
            .from('genie_session_feedback')
            .insert({
              session_id: body.session_id,
              participant_id: participant.id,
              parent_feedback_id: body.feedback_id,
              feedback_type: 'reply',
              category: 'general',
              content: body.response,
              is_from_host: false,
              status: 'pending',
            })
            .select()
            .single();

          return new Response(JSON.stringify({ success: true, reply }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else {
          // Host responding
          updateData.host_response = body.response;
          updateData.host_responded_at = new Date().toISOString();
          updateData.read_by_host = true;
          updateData.status = body.status || 'under_review';

          const { data: updated, error: updateError } = await supabase
            .from('genie_session_feedback')
            .update(updateData)
            .eq('id', body.feedback_id)
            .select(`
              *,
              participant:genie_session_participants(*)
            `)
            .single();

          if (updateError) throw updateError;

          // Notify participant
          if (resend && updated.participant?.email) {
            try {
              await resend.emails.send({
                from: 'Genie Suite <noreply@resend.dev>',
                to: [updated.participant.email],
                subject: `Response to your feedback: "${session.title}"`,
                html: generateFeedbackNotificationEmail(session, updated.participant, updated, 'response'),
              });
            } catch (e) {
              console.error('Response notification failed:', e);
            }
          }

          return new Response(JSON.stringify({ success: true, feedback: updated }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }

      case 'update_status': {
        if (body.feedback_id) {
          // Update individual feedback status
          const { data: updated, error } = await supabase
            .from('genie_session_feedback')
            .update({
              status: body.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', body.feedback_id)
            .select()
            .single();

          if (error) throw error;

          return new Response(JSON.stringify({ success: true, feedback: updated }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        if (body.review_field) {
          // Update review stage status
          const updateData: any = {
            [body.review_field]: body.status,
            updated_at: new Date().toISOString(),
          };

          // Add approval tracking if approved
          if (body.status === 'approved') {
            const approvalField = body.review_field.replace('_status', '_approved_at');
            updateData[approvalField] = new Date().toISOString();
          }

          const { data: updated, error } = await supabase
            .from('genie_session_review_status')
            .update(updateData)
            .eq('session_id', body.session_id)
            .select()
            .single();

          if (error) {
            // Create if not exists
            const { data: created } = await supabase
              .from('genie_session_review_status')
              .insert({
                session_id: body.session_id,
                ...updateData,
              })
              .select()
              .single();

            return new Response(JSON.stringify({ success: true, review_status: created }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          // Notify all participants of status change
          if (resend) {
            const { data: participants } = await supabase
              .from('genie_session_participants')
              .select('*')
              .eq('session_id', body.session_id);

            for (const p of participants || []) {
              try {
                await resend.emails.send({
                  from: 'Genie Suite <noreply@resend.dev>',
                  to: [p.email],
                  subject: `Status Update: "${session.title}"`,
                  html: generateStatusUpdateEmail(session, p, body.review_field, body.status),
                });
              } catch (e) {
                console.error('Status notification failed:', e);
              }
            }
          }

          return new Response(JSON.stringify({ success: true, review_status: updated }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        throw new Error('feedback_id or review_field required');
      }

      case 'get_feedback': {
        const { data: feedback, error } = await supabase
          .from('genie_session_feedback')
          .select(`
            *,
            participant:genie_session_participants(*),
            replies:genie_session_feedback(*)
          `)
          .eq('session_id', body.session_id)
          .is('parent_feedback_id', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, feedback }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      case 'get_review_status': {
        let { data: reviewStatus, error } = await supabase
          .from('genie_session_review_status')
          .select('*')
          .eq('session_id', body.session_id)
          .single();

        if (error) {
          // Create default if not exists
          const { data: created } = await supabase
            .from('genie_session_review_status')
            .insert({ session_id: body.session_id })
            .select()
            .single();
          reviewStatus = created;
        }

        return new Response(JSON.stringify({ success: true, review_status: reviewStatus }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

  } catch (error: any) {
    console.error('Error in session-feedback:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

function generateFeedbackNotificationEmail(session: any, participant: any, feedback: any, type: 'new' | 'response'): string {
  const isNew = type === 'new';
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${isNew ? '#3B82F6' : '#10B981'}, #8B5CF6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .feedback-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${isNew ? '#3B82F6' : '#10B981'}; margin: 20px 0; }
    .meta { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #FEF3C7; color: #92400E; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isNew ? '💬 New Feedback' : '✅ Response Received'}</h1>
    </div>
    <div class="content">
      <p>Hi ${isNew ? 'there' : participant.name},</p>
      <p>${isNew 
        ? `You have new feedback from <strong>${participant.name}</strong> on "${session.title}":` 
        : `The host has responded to your feedback on "${session.title}":`}</p>
      
      <div class="feedback-box">
        <div class="meta">
          ${feedback.feedback_type ? `Type: ${feedback.feedback_type.replace('_', ' ')}` : ''} 
          ${feedback.category ? `• Category: ${feedback.category}` : ''}
        </div>
        ${feedback.subject ? `<h4 style="margin: 0 0 10px 0;">${feedback.subject}</h4>` : ''}
        <p style="margin: 0;">${feedback.content}</p>
        ${feedback.suggested_value ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <strong>Suggested Change:</strong>
            <p style="margin: 5px 0; font-style: italic;">"${feedback.suggested_value}"</p>
          </div>
        ` : ''}
        ${!isNew && feedback.host_response ? `
          <div style="margin-top: 15px; padding: 15px; background: #ECFDF5; border-radius: 6px;">
            <strong style="color: #059669;">Host Response:</strong>
            <p style="margin: 5px 0;">${feedback.host_response}</p>
          </div>
        ` : ''}
        <div style="margin-top: 15px;">
          <span class="status">${feedback.status?.replace('_', ' ').toUpperCase() || 'PENDING'}</span>
        </div>
      </div>
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
        Reply directly to collaborate on this session.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateHostMessageEmail(session: any, participant: any, feedback: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8B5CF6; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 Message from Host</h1>
    </div>
    <div class="content">
      <p>Hi ${participant.name},</p>
      <p>The host of "${session.title}" has sent you a message:</p>
      
      <div class="message-box">
        ${feedback.subject ? `<h4 style="margin: 0 0 10px 0;">${feedback.subject}</h4>` : ''}
        <p style="margin: 0;">${feedback.content}</p>
      </div>
      
      <p>You can reply to provide your feedback or suggestions.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateStatusUpdateEmail(session: any, participant: any, field: string, status: string): string {
  const fieldLabel = field.replace('_review_status', '').replace('_', ' ');
  const statusColors: Record<string, string> = {
    'not_started': '#9CA3AF',
    'in_review': '#3B82F6',
    'changes_requested': '#F59E0B',
    'approved': '#10B981',
    'rejected': '#EF4444',
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${statusColors[status] || '#8B5CF6'}, #8B5CF6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .status-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .status { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: 600; background: ${statusColors[status] || '#8B5CF6'}; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Status Update</h1>
    </div>
    <div class="content">
      <p>Hi ${participant.name},</p>
      <p>There's a status update for "${session.title}":</p>
      
      <div class="status-box">
        <p style="color: #6b7280; margin: 0 0 10px 0; text-transform: capitalize;">${fieldLabel} Review</p>
        <span class="status">${status.replace('_', ' ').toUpperCase()}</span>
      </div>
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
        Check the session for more details.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(handler);
