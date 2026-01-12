import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendInvitesRequest {
  session_id: string;
  participants?: string[]; // Optional: specific participant IDs to send to
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    // Use genieaiexperimentationhub.tech domain for all emails
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@genieaiexperimentationhub.tech';
    const defaultRecipient = 'dasikasaigiridhar@gmail.com';
    
    console.log('[send-session-invites] RESEND_API_KEY configured:', !!resendApiKey);
    console.log('[send-session-invites] FROM email:', fromEmail);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const body: SendInvitesRequest = await req.json();
    console.log('Sending invites for session:', body.session_id);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('genie_sessions')
      .select('*')
      .eq('id', body.session_id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Get participants
    let participantsQuery = supabase
      .from('genie_session_participants')
      .select('*')
      .eq('session_id', body.session_id);

    if (body.participants && body.participants.length > 0) {
      participantsQuery = participantsQuery.in('id', body.participants);
    }

    const { data: participants, error: participantsError } = await participantsQuery;

    if (participantsError) {
      throw new Error('Failed to fetch participants');
    }

    const results: any[] = [];
    const scheduledAt = new Date(session.scheduled_at);
    const formattedDate = scheduledAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = scheduledAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Generate calendar links
    const startTime = scheduledAt;
    const endTime = new Date(startTime.getTime() + (session.duration_minutes || 60) * 60 * 1000);
    const formatCalDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    for (const participant of participants || []) {
      const participantJoinUrl = `https://preview--genie-session.lovable.app/join/${session.session_token}?p=${participant.participant_token}`;
      
      // Generate participant-specific calendar links
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(session.title)}&dates=${formatCalDate(startTime)}/${formatCalDate(endTime)}&details=${encodeURIComponent(`Join: ${participantJoinUrl}`)}&location=${encodeURIComponent(participantJoinUrl)}`;
      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(session.title)}&startdt=${startTime.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(`Join: ${participantJoinUrl}`)}&location=${encodeURIComponent(participantJoinUrl)}`;

      if (resend) {
        try {
          // Prepare script content for email
          let scriptPreview = '';
          let scriptDownloadSection = '';
          
          if (session.script_content) {
            const cleanScript = session.script_content
              .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
              .replace(/[""]/g, '"')
              .replace(/['']/g, "'")
              .replace(/[\u200B-\u200D\uFEFF]/g, '')
              .trim();
            
            // Truncate to first 500 characters with ellipsis for preview
            scriptPreview = cleanScript.length > 500 
              ? cleanScript.substring(0, 500) + '...' 
              : cleanScript;
          }

          // Check for downloadable attachment URL
          if (session.script_attachment_url) {
            scriptDownloadSection = `
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; font-weight: 600;">📎 Script Attachment</p>
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">${session.script_filename || 'Script Document'}</p>
                <a href="${session.script_attachment_url}" 
                   style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  📥 Download Script
                </a>
              </div>
            `;
          }

          console.log('[send-session-invites] Sending email to:', participant.email);
          const emailResult = await resend.emails.send({
            from: `Genie Studio <${fromEmail}>`,
            to: [participant.email],
            subject: `You're invited: ${session.title}`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; margin: 10px 0; }
    .detail-label { font-weight: 600; width: 100px; color: #6b7280; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px; }
    .btn-primary { background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; }
    .btn-secondary { background: #e5e7eb; color: #374151; }
    .calendar-buttons { margin-top: 20px; }
    .script-preview { background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #8B5CF6; margin-top: 15px; font-family: monospace; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; max-height: 200px; overflow-y: auto; }
    .script-header { font-weight: 600; color: #6b7280; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 You're Invited!</h1>
    </div>
    <div class="content">
      <p>Hi ${participant.name},</p>
      <p>You've been invited to join a ${session.session_type} session by ${session.host_name}.</p>
      
      <div class="details">
        <h3 style="margin-top: 0;">${session.title}</h3>
        ${session.description ? `<p>${session.description}</p>` : ''}
        <div class="detail-row">
          <span class="detail-label">📅 Date:</span>
          <span>${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏰ Time:</span>
          <span>${formattedTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏱️ Duration:</span>
          <span>${session.duration_minutes || 60} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👤 Your Role:</span>
          <span style="text-transform: capitalize;">${participant.role}</span>
        </div>
        ${session.agenda ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <strong>📋 Agenda:</strong>
          <p style="margin: 5px 0; white-space: pre-wrap;">${session.agenda}</p>
        </div>
        ` : ''}
        ${scriptDownloadSection}
        ${scriptPreview ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <div class="script-header">
            📝 Script Preview
          </div>
          <div class="script-preview">${scriptPreview}</div>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">Full script available via download link above or during the session.</p>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${participantJoinUrl}" class="btn btn-primary">Join Session</a>
      </div>
      
      <div class="calendar-buttons" style="text-align: center;">
        <p style="color: #6b7280; font-size: 14px;">Add to your calendar:</p>
        <a href="${googleCalUrl}" class="btn btn-secondary" target="_blank">📅 Google Calendar</a>
        <a href="${outlookUrl}" class="btn btn-secondary" target="_blank">📧 Outlook</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
        The session link will be active 30 minutes before the scheduled time.<br>
        You'll receive reminder notifications before the session starts.
      </p>
    </div>
  </div>
</body>
</html>
            `,
          });

          results.push({
            participant_id: participant.id,
            email: participant.email,
            status: 'sent',
            result: emailResult,
          });

          // Update participant invite status
          await supabase
            .from('genie_session_participants')
            .update({ invite_status: 'sent' })
            .eq('id', participant.id);

        } catch (emailError: any) {
          console.error('Email send error for', participant.email, emailError);
          results.push({
            participant_id: participant.id,
            email: participant.email,
            status: 'failed',
            error: emailError.message,
          });
        }
      } else {
        // No Resend API key - just mark as sent and log
        console.log('Would send invite to:', participant.email, 'Join URL:', participantJoinUrl);
        results.push({
          participant_id: participant.id,
          email: participant.email,
          status: 'simulated',
          join_url: participantJoinUrl,
        });

        await supabase
          .from('genie_session_participants')
          .update({ invite_status: 'sent' })
          .eq('id', participant.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      total_sent: results.filter(r => r.status === 'sent' || r.status === 'simulated').length,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-session-invites:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
