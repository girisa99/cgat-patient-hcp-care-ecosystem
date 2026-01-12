import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Calculate when session becomes active (30 min before)
    const scheduledAt = new Date(body.scheduled_at);
    const sessionActiveAt = new Date(scheduledAt.getTime() - 30 * 60 * 1000);

    // Generate join URL based on session mode - uses Genie Vibe recording studio
    // Production: genieaiexperimentationhub.tech, Development: lovable.app preview
    const baseUrl = 'https://genieaiexperimentationhub.tech';
    
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
    
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('genie_sessions')
      .insert({
        user_id: userId,
        title: body.title,
        description: body.description,
        session_type: body.session_type,
        session_mode: body.session_mode,
        production_stage: body.production_stage || 'recording',
        scheduled_at: body.scheduled_at,
        duration_minutes: body.duration_minutes || 60,
        timezone: body.timezone || 'UTC',
        script_id: body.script_id,
        script_content: body.script_content, // Store script content for invite preview
        script_attachment_url: scriptAttachmentUrl, // Downloadable URL
        script_filename: scriptFilename,
        agenda: body.agenda,
        host_name: body.host_name,
        host_email: body.host_email,
        external_meeting_url: body.session_mode !== 'browser' ? body.external_meeting_url : null,
        session_active_at: sessionActiveAt.toISOString(),
        waiting_room_enabled: true,
        recording_enabled: true,
      })
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

    // Create participants
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

    // Generate calendar links
    const calendarLinks = generateCalendarLinks(session, body, joinUrl);

    console.log('Session created successfully:', session.id);

    return new Response(JSON.stringify({
      success: true,
      session: {
        ...session,
        join_url: joinUrl,
        host_url: hostUrl,
      },
      participants,
      calendar_links: calendarLinks,
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

function generateCalendarLinks(session: any, body: CreateSessionRequest, joinUrl: string) {
  const startTime = new Date(body.scheduled_at);
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
