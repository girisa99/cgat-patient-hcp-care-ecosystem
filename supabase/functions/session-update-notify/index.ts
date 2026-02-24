import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionUpdateRequest {
  session_id: string;
  update_type: 'script_updated' | 'title_changed' | 'schedule_changed' | 'attachment_updated' | 'description_changed';
  previous_value?: any;
  new_value?: any;
  notify_participants?: boolean;
  custom_message?: string;
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const body: SessionUpdateRequest = await req.json();
    console.log('Processing session update notification:', body);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('genie_sessions')
      .select('*')
      .eq('id', body.session_id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Get activity title and description based on update type
    const activityDetails = getActivityDetails(body.update_type, body.previous_value, body.new_value);

    // Log the activity
    const { data: activity, error: activityError } = await supabase
      .from('genie_session_activity')
      .insert({
        session_id: body.session_id,
        user_id: userId,
        activity_type: body.update_type,
        activity_title: activityDetails.title,
        activity_description: activityDetails.description,
        previous_value: body.previous_value ? JSON.stringify(body.previous_value) : null,
        new_value: body.new_value ? JSON.stringify(body.new_value) : null,
        metadata: { custom_message: body.custom_message }
      })
      .select()
      .single();

    if (activityError) {
      console.error('Activity logging error:', activityError);
    }

    const results: any[] = [];

    // If notify_participants is true, send notifications
    if (body.notify_participants !== false) {
      // Get all participants
      const { data: participants, error: participantsError } = await supabase
        .from('genie_session_participants')
        .select('*')
        .eq('session_id', body.session_id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
      }

      // Create in-app notifications for each participant
      for (const participant of participants || []) {
        // Insert notification record
        const { data: notification, error: notificationError } = await supabase
          .from('genie_session_notifications')
          .insert({
            session_id: body.session_id,
            participant_id: participant.id,
            activity_id: activity?.id,
            notification_type: 'in_app',
            title: activityDetails.title,
            message: body.custom_message || activityDetails.description,
          })
          .select()
          .single();

        if (notificationError) {
          console.error('Notification insert error:', notificationError);
        }

        // Send email notification if Resend is configured
        if (resend && participant.email) {
          try {
            const emailResult = await resend.emails.send({
              from: 'Genie Suite <noreply@resend.dev>',
              to: [participant.email],
              subject: `Update: ${session.title} - ${activityDetails.title}`,
              html: generateUpdateEmail(session, participant, activityDetails, body.custom_message, body.new_value),
            });

            // Update notification as sent
            await supabase
              .from('genie_session_notifications')
              .update({ 
                sent_at: new Date().toISOString(),
                notification_type: 'email'
              })
              .eq('id', notification?.id);

            results.push({
              participant_id: participant.id,
              email: participant.email,
              status: 'sent',
              result: emailResult,
            });
          } catch (emailError: any) {
            console.error('Email send error:', emailError);
            results.push({
              participant_id: participant.id,
              email: participant.email,
              status: 'failed',
              error: emailError.message,
            });
          }
        } else {
          results.push({
            participant_id: participant.id,
            email: participant.email,
            status: 'in_app_only',
          });
        }
      }
    }

    console.log('Session update notification completed');

    return new Response(JSON.stringify({
      success: true,
      activity,
      notifications_sent: results.length,
      results,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in session-update-notify:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

function getActivityDetails(updateType: string, previousValue: any, newValue: any): { title: string; description: string } {
  switch (updateType) {
    case 'script_updated':
      return {
        title: 'Script Updated',
        description: 'The session script has been updated. Please review the latest version before the session.',
      };
    case 'title_changed':
      return {
        title: 'Session Title Changed',
        description: `Session title changed from "${previousValue}" to "${newValue}"`,
      };
    case 'schedule_changed':
      return {
        title: 'Schedule Changed',
        description: `Session has been rescheduled. Please check the new date and time.`,
      };
    case 'attachment_updated':
      return {
        title: 'Attachment Updated',
        description: 'A new document has been attached to the session. Please download and review.',
      };
    case 'description_changed':
      return {
        title: 'Description Updated',
        description: 'The session description has been updated.',
      };
    default:
      return {
        title: 'Session Updated',
        description: 'The session has been updated. Please review the changes.',
      };
  }
}

function generateUpdateEmail(session: any, participant: any, activityDetails: { title: string; description: string }, customMessage?: string, newValue?: any): string {
  const downloadSection = newValue?.script_attachment_url ? `
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0;">📎 Updated Attachment</h4>
      <p style="margin: 0 0 10px 0;">${newValue.script_filename || 'Script Document'}</p>
      <a href="${newValue.script_attachment_url}" 
         style="display: inline-block; background: #8B5CF6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
        Download Script
      </a>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #F59E0B, #EC4899); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .update-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Session Update</h1>
    </div>
    <div class="content">
      <p>Hi ${participant.name},</p>
      <p>There's an update for the session <strong>"${session.title}"</strong>:</p>
      
      <div class="update-box">
        <h3 style="margin-top: 0; color: #F59E0B;">${activityDetails.title}</h3>
        <p style="margin-bottom: 0;">${customMessage || activityDetails.description}</p>
      </div>
      
      ${downloadSection}
      
      <p style="margin-top: 30px;">
        <strong>Session Details:</strong><br>
        📅 ${new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
        ⏰ ${new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}<br>
        ⏱️ Duration: ${session.duration_minutes || 60} minutes
      </p>
      
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
        You're receiving this because you're a participant in this session.<br>
        Your join link remains the same.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(handler);
