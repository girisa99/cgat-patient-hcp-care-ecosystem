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

    // Generate calendar links - pass the validated scheduledAt date
    const calendarLinks = generateCalendarLinks(session, body, joinUrl, scheduledAt);

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
