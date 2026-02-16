import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSessionRequest {
  title: string;
  description?: string;
  session_type: string;
  session_mode: 'browser' | 'zoom' | 'google_meet' | 'teams';
  production_stage?: string;
  scheduled_at: string;
  duration_minutes?: number;
  timezone?: string;
  script_id?: string;
  script_content?: string; // Actual script content for invite attachment
  script_filename?: string; // Original filename of uploaded script
  agenda?: string;
  host_name: string;
  host_email?: string;
  external_meeting_url?: string;
  participants: {
    name: string;
    email: string;
    phone?: string;
    role: string;
    email_reminder_24h?: boolean;
    email_reminder_1h?: boolean;
    email_reminder_30m?: boolean;
    email_reminder_15m?: boolean;
    sms_reminder_30m?: boolean;
    sms_reminder_15m?: boolean;
  }[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const body: CreateSessionRequest = await req.json();
    console.log('Creating session:', body.title);
    console.log('Scheduled at input:', body.scheduled_at);

    // Parse scheduled_at - handle various input formats
    let scheduledAt: Date;
    if (body.scheduled_at) {
      // If it's a datetime-local format (YYYY-MM-DDTHH:MM), append :00Z for proper parsing
      const dateStr = body.scheduled_at.includes('Z') || body.scheduled_at.includes('+') 
        ? body.scheduled_at 
        : body.scheduled_at.length === 16 
          ? `${body.scheduled_at}:00` // Add seconds for datetime-local format
          : body.scheduled_at;
      
      scheduledAt = new Date(dateStr);
      console.log('Parsed scheduled date:', scheduledAt.toISOString());
    } else {
      // Default to 1 hour from now if not provided
      scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    }
    
    // Validate the date is valid
    if (isNaN(scheduledAt.getTime())) {
      throw new Error(`Invalid scheduled_at date: ${body.scheduled_at}`);
    }
    
    // Calculate when session becomes active (30 min before)
    const sessionActiveAt = new Date(scheduledAt.getTime() - 30 * 60 * 1000);

    // Generate join URL based on session mode - uses Genie Studio meeting route
    // This will be the origin where the app is hosted
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://genieaiexperimentationhub.tech';
    
    // Upload script to storage if content provided
    let scriptAttachmentUrl: string | null = null;
    let scriptFilename: string | null = body.script_filename || null;
    
    if (body.script_content && body.script_content.length > 0) {
      try {
        const sessionId = crypto.randomUUID();
        const timestamp = Date.now();
        const filename = scriptFilename || `script_${timestamp}.txt`;
        const storagePath = `sessions/${sessionId}/${filename}`;
        
        // Convert script content to Uint8Array
        const encoder = new TextEncoder();
        const scriptBytes = encoder.encode(body.script_content);
        
        // Upload to storage bucket
        const { error: uploadError } = await supabase.storage
          .from('genie-media')
          .upload(storagePath, scriptBytes, {
            contentType: 'text/plain',
            upsert: true
          });
        
        if (uploadError) {
          console.error('Script upload error:', uploadError);
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('genie-media')
            .getPublicUrl(storagePath);
          
          scriptAttachmentUrl = urlData.publicUrl;
          scriptFilename = filename;
          console.log('Script uploaded to:', scriptAttachmentUrl);
        }
      } catch (uploadErr) {
        console.error('Script upload failed:', uploadErr);
      }
    }
    
    // First, create a corresponding record in the shows table for ProductionHub visibility
    // Generate a show ID first
    const showId = crypto.randomUUID();
    const meetingLink = `${baseUrl}/meeting/${showId.substring(0, 36)}`;
    
    // Map session_type to show_type and determine category
    const showTypeMapping: Record<string, string> = {
      'genie_studio_full': 'podcast',
      'podcast': 'podcast',
      'video_podcast': 'video_podcast',
      'webinar': 'webinar',
      'interview': 'interview',
      'panel_discussion': 'panel_discussion',
      'tutorial': 'tutorial',
      'demo': 'demo',
    };
    const showType = showTypeMapping[body.session_type] || 'podcast';
    
    // Determine event category from production_stage
    // Valid enum values: 'genie_demo', 'media_production', 'business_meeting', 'event'
    const categoryMapping: Record<string, string> = {
      'demo_live': 'genie_demo',
      'demo_scheduled': 'genie_demo',
      'demo_completed': 'genie_demo',
      'demo_follow_up': 'genie_demo',
      'genie_demo': 'genie_demo',
      'recording': 'media_production',
      'post_production': 'media_production',
      'published': 'media_production',
      'scheduled': 'media_production',
      'in_progress': 'media_production',
      'meeting': 'business_meeting',
      'event': 'event',
    };
    const eventCategory = categoryMapping[body.production_stage || ''] || 'genie_demo';
    
    // Create the show record
    const showData: Record<string, any> = {
      id: showId,
      title: body.title,
      description: body.description || null,
      show_type: showType,
      event_category: eventCategory,
      current_stage: body.production_stage || 'recording',
      scheduled_date: scheduledAt.toISOString(),
      duration_minutes: body.duration_minutes || 60,
      host_name: body.host_name,
      guest_info: body.participants.map(p => ({
        name: p.name,
        email: p.email,
        phone: p.phone,
        role: p.role,
      })),
      meeting_link: meetingLink,
      agenda: body.agenda || null,
      metadata: {
        topics: body.agenda,
        session_mode: body.session_mode,
        timezone: body.timezone || 'UTC',
      },
    };
    
    // Only add user_id if valid
    if (userId && userId.trim() !== '') {
      showData.user_id = userId;
    }
    
    // Only add linked_script_id if valid UUID
    if (body.script_id && body.script_id.trim() !== '') {
      showData.linked_script_id = body.script_id;
    }
    
    console.log('Creating show record for ProductionHub:', JSON.stringify(showData, null, 2));
    
    const { data: showRecord, error: showError } = await supabase
      .from('shows')
      .insert(showData)
      .select()
      .single();
    
    if (showError) {
      console.error('Show creation error (non-blocking):', showError);
      // Don't throw - continue with session creation even if show fails
    } else {
      console.log('Show created for ProductionHub:', showRecord?.id);
    }
    
    // Create session - ensure empty strings are converted to null for UUID fields
    const sessionData: Record<string, any> = {
      title: body.title,
      description: body.description || null,
      session_type: body.session_type,
      session_mode: body.session_mode,
      production_stage: body.production_stage || 'recording',
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: body.duration_minutes || 60,
      timezone: body.timezone || 'UTC',
      script_content: body.script_content || null,
      script_attachment_url: scriptAttachmentUrl,
      script_filename: scriptFilename,
      agenda: body.agenda || null,
      host_name: body.host_name,
      host_email: body.host_email || null,
      external_meeting_url: body.session_mode !== 'browser' ? body.external_meeting_url : null,
      session_active_at: sessionActiveAt.toISOString(),
      waiting_room_enabled: true,
      recording_enabled: true,
      show_id: showRecord?.id || null, // Link to the shows table
    };

    // Only add user_id if it's a valid UUID (not empty)
    if (userId && userId.trim() !== '') {
      sessionData.user_id = userId;
    }

    // Only add script_id if it's a valid UUID (not empty)
    if (body.script_id && body.script_id.trim() !== '') {
      sessionData.script_id = body.script_id;
    }

    console.log('Session data:', JSON.stringify(sessionData, null, 2));

    const { data: session, error: sessionError } = await supabase
      .from('genie_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      throw sessionError;
    }

    // Generate join URL with session token
    const joinUrl = `${baseUrl}/join/${session.session_token}`;
    const hostUrl = `${baseUrl}/host/${session.host_token}`;

    // Update session with URLs
    await supabase
      .from('genie_sessions')
      .update({ join_url: joinUrl })
      .eq('id', session.id);
    
    // Also update the show with the join URL as meeting_link
    if (showRecord?.id) {
      await supabase
        .from('shows')
        .update({ meeting_link: joinUrl })
        .eq('id', showRecord.id);
    }

    // Create participants for genie_session_participants table
    const participantsToInsert = body.participants.map(p => ({
      session_id: session.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      role: p.role,
      email_reminder_24h: p.email_reminder_24h ?? true,
      email_reminder_1h: p.email_reminder_1h ?? true,
      email_reminder_30m: p.email_reminder_30m ?? true,
      email_reminder_15m: p.email_reminder_15m ?? true,
      sms_reminder_30m: p.sms_reminder_30m ?? false,
      sms_reminder_15m: p.sms_reminder_15m ?? false,
    }));

    const { data: participants, error: participantsError } = await supabase
      .from('genie_session_participants')
      .insert(participantsToInsert)
      .select();

    if (participantsError) {
      console.error('Participants creation error:', participantsError);
    }
    
    // Also create show_participants for ProductionHub visibility
    if (showRecord?.id && body.participants.length > 0) {
      const showParticipants = body.participants.map(p => ({
        show_id: showRecord.id,
        name: p.name,
        email: p.email,
        role: p.role || 'guest',
        status: 'invited',
      }));
      
      const { error: showParticipantsError } = await supabase
        .from('show_participants')
        .insert(showParticipants);
      
      if (showParticipantsError) {
        console.error('Show participants creation error:', showParticipantsError);
      } else {
        console.log('Show participants created:', showParticipants.length);
      }
    }
    
    // Add host as a show participant
    if (showRecord?.id && body.host_name) {
      const { error: hostParticipantError } = await supabase
        .from('show_participants')
        .insert({
          show_id: showRecord.id,
          name: body.host_name,
          email: body.host_email || null,
          role: 'host',
          status: 'confirmed',
        });
      
      if (hostParticipantError) {
        console.error('Host participant creation error:', hostParticipantError);
      } else {
        console.log('Host added as participant');
      }
    }

    // Generate calendar links - pass the validated scheduledAt date
    const calendarLinks = generateCalendarLinks(session, body, joinUrl, scheduledAt);

    console.log('Session created successfully:', session.id);
    
    // ========== SEND EMAIL INVITES ==========
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'info@genieaiexperimentationhub.tech';
    const emailResults: any[] = [];
    
    if (resendApiKey && body.participants.length > 0) {
      console.log('[create-session] Sending email invites to', body.participants.length, 'participants');
      const resend = new Resend(resendApiKey);
      
      // Format date for display
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
      
      // Generate calendar URLs for invite
      const endTime = new Date(scheduledAt.getTime() + (body.duration_minutes || 60) * 60 * 1000);
      const formatCalDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      for (const participant of body.participants) {
        try {
          const participantJoinUrl = joinUrl;
          const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(body.title)}&dates=${formatCalDate(scheduledAt)}/${formatCalDate(endTime)}&details=${encodeURIComponent(`Join: ${participantJoinUrl}`)}&location=${encodeURIComponent(participantJoinUrl)}`;
          const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(body.title)}&startdt=${scheduledAt.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(`Join: ${participantJoinUrl}`)}&location=${encodeURIComponent(participantJoinUrl)}`;
          
          console.log('[create-session] Sending invite to:', participant.email);
          
          // Build email payload with host CC'd (not other participants for privacy)
          const emailPayload: any = {
            from: `Genie Studio <${fromEmail}>`,
            to: [participant.email],
            subject: `You're invited: ${body.title}`,
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 You're Invited!</h1>
    </div>
    <div class="content">
      <p>Hi ${participant.name},</p>
      <p>You've been invited to join a ${body.session_type} session by ${body.host_name}.</p>
      
      <div class="details">
        <h3 style="margin-top: 0;">${body.title}</h3>
        ${body.description ? `<p>${body.description}</p>` : ''}
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
          <span>${body.duration_minutes || 60} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👤 Your Role:</span>
          <span style="text-transform: capitalize;">${participant.role}</span>
        </div>
        ${body.agenda ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <strong>📋 Agenda:</strong>
          <p style="margin: 5px 0; white-space: pre-wrap;">${body.agenda}</p>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${participantJoinUrl}" class="btn btn-primary">Join Session</a>
      </div>
      
      <div style="text-align: center;">
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
          };
          
          // CC the host on each participant email (not other participants for privacy)
          if (body.host_email && body.host_email !== participant.email) {
            emailPayload.cc = [body.host_email];
            console.log('[create-session] CC host:', body.host_email);
          }
          
          const emailResult = await resend.emails.send(emailPayload);
          
          emailResults.push({
            email: participant.email,
            status: 'sent',
            result: emailResult
          });
          console.log('[create-session] Email sent to:', participant.email);
          
        } catch (emailErr: any) {
          console.error('[create-session] Email error for', participant.email, emailErr);
          emailResults.push({
            email: participant.email,
            status: 'failed',
            error: emailErr.message
          });
        }
      }
      
      // Also send to host if email provided
      if (body.host_email) {
        try {
          console.log('[create-session] Sending host notification to:', body.host_email);
          await resend.emails.send({
            from: `Genie Studio <${fromEmail}>`,
            to: [body.host_email],
            subject: `Session Created: ${body.title}`,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
  <h2>🎬 Your session has been scheduled!</h2>
  <p><strong>${body.title}</strong></p>
  <p>📅 ${formattedDate} at ${formattedTime}</p>
  <p>👥 ${body.participants.length} participant(s) invited</p>
  <p style="margin-top: 20px;">
    <a href="${hostUrl}" style="background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      🎤 Start as Host
    </a>
  </p>
  <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
    Participants have been sent their invitation emails with calendar links.
  </p>
</body>
</html>
            `,
          });
          emailResults.push({ email: body.host_email, status: 'sent', type: 'host' });
        } catch (hostEmailErr: any) {
          console.error('[create-session] Host email error:', hostEmailErr);
        }
      }
      
      console.log('[create-session] Email sending complete:', emailResults.length, 'emails processed');
      
      // ========== SEND RECORDING CONSENT NOTIFICATION ==========
      // Notify all participants that the session will be recorded
      const participantEmails = body.participants.map(p => p.email).filter(Boolean);
      if (participantEmails.length > 0) {
        try {
          console.log('[create-session] Sending recording consent notifications');
          
          for (const email of participantEmails) {
            const participant = body.participants.find(p => p.email === email);
            const formattedDate = scheduledAt.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            
            await resend.emails.send({
              from: `Genie AI <${fromEmail}>`,
              to: [email],
              subject: `🎥 Recording Notice: ${body.title}`,
              html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); padding: 30px; color: white; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">🎥</div>
      <h1 style="margin: 0; font-size: 24px;">Recording Notice</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Important Privacy Information</p>
    </div>
    
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${participant?.name || 'there'},</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">${body.title}</h2>
        <p style="margin: 0; color: #666;"><strong>Host:</strong> ${body.host_name}</p>
        <p style="margin: 5px 0 0 0; color: #666;"><strong>When:</strong> ${formattedDate}</p>
      </div>
      
      <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Recording & Transcription Notice</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          <strong>This session will be recorded and transcribed.</strong> By joining, you consent to:
        </p>
        <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #856404;">
          <li>Audio/video recording of the session</li>
          <li>AI-powered transcription of spoken content</li>
          <li>Meeting minutes and summaries may be generated</li>
          <li>Recordings may be stored for future reference</li>
        </ul>
      </div>
      
      <div style="background: #d4edda; border: 1px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #155724;">🔒 Your Privacy Rights</h3>
        <ul style="margin: 0; padding-left: 20px; color: #155724;">
          <li>You can request to not be recorded (contact the host)</li>
          <li>You may request data removal after the session</li>
          <li>If you do not consent, please decline this invitation</li>
        </ul>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0;">
        By joining the session, you acknowledge that you have read and understood this recording notice.
      </p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #999; font-size: 11px;">Powered by Genie AI</p>
    </div>
  </div>
</body>
</html>
              `,
            });
          }
          
          // Mark consent notification as sent
          await supabase
            .from('genie_sessions')
            .update({ recording_consent_shown: true })
            .eq('id', session.id);
            
          console.log('[create-session] Recording consent notifications sent');
        } catch (consentErr) {
          console.error('[create-session] Recording consent notification error:', consentErr);
        }
      }
      
    } else if (!resendApiKey) {
      console.log('[create-session] RESEND_API_KEY not configured - skipping emails');
    }

    return new Response(JSON.stringify({
      success: true,
      session: {
        ...session,
        join_url: joinUrl,
        host_url: hostUrl,
      },
      participants,
      calendar_links: calendarLinks,
      emails_sent: emailResults,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in create-session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

function generateCalendarLinks(session: any, body: CreateSessionRequest, joinUrl: string, scheduledAt: Date) {
  // Use the pre-validated scheduledAt date instead of parsing body.scheduled_at again
  const startTime = scheduledAt;
  const endTime = new Date(startTime.getTime() + (body.duration_minutes || 60) * 60 * 1000);
  
  const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const title = encodeURIComponent(body.title);
  const description = encodeURIComponent(`${body.description || ''}\n\nJoin URL: ${joinUrl}`);
  const location = encodeURIComponent(joinUrl);
  
  // Google Calendar
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=${description}&location=${location}`;
  
  // Outlook Web
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startTime.toISOString()}&enddt=${endTime.toISOString()}&body=${description}&location=${location}`;
  
  // iCal file content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Genie Studio//Session//EN
BEGIN:VEVENT
UID:${session.id}@genie-studio
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${body.title}
DESCRIPTION:${body.description || ''} Join URL: ${joinUrl}
LOCATION:${joinUrl}
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Session starts in 24 hours
TRIGGER:-P1D
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Session starts in 1 hour
TRIGGER:-PT1H
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Session starts in 30 minutes
TRIGGER:-PT30M
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Session starts in 15 minutes
TRIGGER:-PT15M
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return {
    google: googleUrl,
    outlook: outlookUrl,
    ics_content: icsContent,
  };
}

serve(handler);
