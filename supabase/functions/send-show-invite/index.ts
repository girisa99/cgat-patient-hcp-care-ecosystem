import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShowInviteRequest {
  to: string;
  participantName: string;
  role: 'host' | 'co-host' | 'guest' | 'panelist';
  showType: 'podcast' | 'webcast' | 'broadcast' | 'interview' | 'panel' | 'tutorial' | 'webinar' | 'workshop';
  showTitle: string;
  showDescription?: string;
  scheduledDate: string;
  hostName: string;
  topics?: string;
  script?: string;
  scriptAttachmentUrl?: string;
  scriptFilename?: string;
  suggestedIntro?: string;
  joinUrl?: string;
  recordingUrl?: string;
  durationMinutes?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      participantName, 
      role, 
      showType, 
      showTitle, 
      showDescription, 
      scheduledDate, 
      hostName, 
      topics, 
      script, 
      scriptAttachmentUrl,
      scriptFilename,
      suggestedIntro, 
      joinUrl,
      recordingUrl,
      durationMinutes = 60
    }: ShowInviteRequest = await req.json();

    console.log(`[send-show-invite] Sending invite to ${to} for ${showType}: ${showTitle}`);

    const date = new Date(scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    // Extended show type display with all types
    const showTypeDisplay: Record<string, { name: string; emoji: string; color: string }> = {
      podcast: { name: 'Podcast', emoji: '🎙️', color: '#8B5CF6' },
      webcast: { name: 'Webcast', emoji: '📺', color: '#3B82F6' },
      broadcast: { name: 'Live Broadcast', emoji: '📡', color: '#EF4444' },
      interview: { name: 'Interview', emoji: '🎤', color: '#06B6D4' },
      panel: { name: 'Panel Discussion', emoji: '👥', color: '#6366F1' },
      tutorial: { name: 'Tutorial', emoji: '📚', color: '#10B981' },
      webinar: { name: 'Webinar', emoji: '🖥️', color: '#0EA5E9' },
      workshop: { name: 'Workshop', emoji: '🔧', color: '#F97316' },
    };

    const typeInfo = showTypeDisplay[showType] || { name: 'Show', emoji: '📺', color: '#8B5CF6' };
    const roleDisplay: Record<string, string> = { 
      host: 'Host', 
      'co-host': 'Co-Host', 
      guest: 'Guest Speaker', 
      panelist: 'Panelist' 
    };
    const roleText = roleDisplay[role] || role;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // Use genieaiexperimentationhub.tech domain for all emails
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@genieaiexperimentationhub.tech';
    
    console.log('[send-show-invite] RESEND_API_KEY configured:', !!RESEND_API_KEY);
    console.log('[send-show-invite] FROM email:', fromEmail);

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Invite recorded (email sending requires RESEND_API_KEY)', 
        emailSent: false 
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const { Resend } = await import('https://esm.sh/resend@4.0.0');
    const resend = new Resend(RESEND_API_KEY);

    const endTime = new Date(date.getTime() + durationMinutes * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Build rich calendar event details with meeting URL prominently featured
    let calendarDetails = '';
    if (joinUrl) {
      calendarDetails += `🎬 JOIN MEETING:\n${joinUrl}\n\n`;
    }
    if (showDescription) {
      calendarDetails += `${showDescription}\n\n`;
    }
    if (topics) {
      calendarDetails += `📋 TOPICS:\n${topics}\n\n`;
    }
    calendarDetails += `🎙️ Host: ${hostName}\n`;
    calendarDetails += `👤 Your Role: ${roleText}\n\n`;
    calendarDetails += `─────────────────────\n`;
    calendarDetails += `📺 Powered by Genie Studio\n`;
    calendarDetails += `🌐 genieaiexperimentationhub.tech`;
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(showTitle)}&dates=${formatCalDate(date)}/${formatCalDate(endTime)}&details=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(showTitle)}&startdt=${date.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(showTitle)}&st=${formatCalDate(date)}&dur=${Math.floor(durationMinutes/60).toString().padStart(2,'0')}${(durationMinutes%60).toString().padStart(2,'0')}&desc=${encodeURIComponent(calendarDetails)}&in_loc=${encodeURIComponent(joinUrl || '')}`;
    
    // Generate ICS file content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Genie Studio//genieaiexperimentationhub.tech//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'X-WR-CALNAME:Genie Studio',
      'BEGIN:VEVENT',
      `UID:${crypto.randomUUID()}@genie-studio`,
      `DTSTAMP:${formatCalDate(new Date())}`,
      `DTSTART:${formatCalDate(date)}`,
      `DTEND:${formatCalDate(endTime)}`,
      `SUMMARY:${showTitle.replace(/,/g, '\\,').replace(/;/g, '\\;')}`,
      `DESCRIPTION:${calendarDetails.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')}`,
      joinUrl ? `LOCATION:${joinUrl.replace(/,/g, '\\,').replace(/;/g, '\\;')}` : '',
      joinUrl ? `URL:${joinUrl}` : '',
      `ORGANIZER;CN=${hostName.replace(/,/g, '').replace(/;/g, '')}:mailto:${fromEmail}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Genie Studio - Session starts in 30 minutes',
      'TRIGGER:-PT30M',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY', 
      'DESCRIPTION:Genie Studio - Session starts in 15 minutes',
      'TRIGGER:-PT15M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    
    const icsBase64 = btoa(icsContent);

    // Build script attachment section
    let scriptSection = '';
    if (scriptAttachmentUrl) {
      scriptSection = `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #34d399; margin: 0 0 12px; font-weight: 600;">📎 Script Attachment</p>
          <p style="color: #94a3b8; margin: 0 0 16px; font-size: 14px;">${scriptFilename || 'Script Document'}</p>
          <a href="${scriptAttachmentUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
            📥 Download Script
          </a>
        </div>
      `;
    } else if (script) {
      // Show script preview if no attachment URL
      const cleanScript = script
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .trim();
      const previewText = cleanScript.length > 500 ? cleanScript.substring(0, 500) + '...' : cleanScript;
      
      scriptSection = `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="color: #34d399; margin: 0 0 12px; font-weight: 600;">📝 Script Preview</p>
          <pre style="color: #cbd5e1; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; margin: 0; max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">${previewText}</pre>
          <p style="color: #64748b; font-size: 11px; margin: 12px 0 0;">Full script will be available during the session teleprompter.</p>
        </div>
      `;
    }

    // Build topics section
    let topicsSection = '';
    if (topics) {
      topicsSection = `
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="color: #60a5fa; margin: 0 0 12px; font-weight: 600;">📋 Discussion Topics</p>
          <p style="color: #e2e8f0; margin: 0; line-height: 1.6;">${topics}</p>
        </div>
      `;
    }

    // Build suggested intro section
    let introSection = '';
    if (suggestedIntro) {
      introSection = `
        <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="color: #f472b6; margin: 0 0 12px; font-weight: 600;">✨ Suggested Introduction</p>
          <p style="color: #e2e8f0; margin: 0; font-style: italic; line-height: 1.6;">"${suggestedIntro}"</p>
        </div>
      `;
    }

    // Build join/recording URL buttons
    let actionButtons = '';
    if (joinUrl || recordingUrl) {
      actionButtons = `
        <div style="text-align: center; margin: 30px 0;">
          ${joinUrl ? `
            <a href="${joinUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 6px;">
              ✨ Join Session
            </a>
          ` : ''}
          ${recordingUrl ? `
            <a href="${recordingUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 6px;">
              🎬 Recording Studio
            </a>
          ` : ''}
        </div>
      `;
    }

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${showTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f23; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.2); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${typeInfo.color}, #ec4899); padding: 40px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">${typeInfo.emoji}</div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">You're Invited!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 12px 0 16px; font-size: 16px;">Join as <strong>${roleText}</strong></p>
      <span style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 8px 20px; border-radius: 24px; font-size: 14px; font-weight: 500; backdrop-filter: blur(10px);">
        ${typeInfo.emoji} ${typeInfo.name}
      </span>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px;">
      <p style="color: #e2e8f0; margin: 0 0 16px; font-size: 16px;">
        Hi <strong style="color: #a78bfa;">${participantName}</strong>,
      </p>
      <p style="color: #94a3b8; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
        You've been invited by <strong style="color: #e2e8f0;">${hostName}</strong> to participate in an exciting ${typeInfo.name.toLowerCase()}.
      </p>
      
      <!-- Show Details Card -->
      <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h2 style="color: #f1f5f9; margin: 0 0 16px; font-size: 22px; font-weight: 600;">${showTitle}</h2>
        ${showDescription ? `<p style="color: #94a3b8; margin: 0 0 20px; line-height: 1.6;">${showDescription}</p>` : ''}
        
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px;">📅</span>
            <span style="color: #e2e8f0; font-size: 15px;">${formattedDate}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px;">⏰</span>
            <span style="color: #e2e8f0; font-size: 15px;">${formattedTime}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px;">⏱️</span>
            <span style="color: #e2e8f0; font-size: 15px;">${durationMinutes} minutes</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px;">👤</span>
            <span style="color: #a78bfa; font-size: 15px; font-weight: 600;">Your Role: ${roleText}</span>
          </div>
        </div>
      </div>
      
      ${topicsSection}
      ${scriptSection}
      ${introSection}
      ${actionButtons}
      
      <!-- Calendar Buttons -->
      <div style="text-align: center; margin: 24px 0; padding: 20px; background: rgba(30, 41, 59, 0.5); border-radius: 12px;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px;">📅 Add to your calendar (includes meeting URL):</p>
        <a href="${googleCalUrl}" target="_blank" 
           style="display: inline-block; background: #1e293b; color: #e2e8f0; padding: 12px 20px; border-radius: 8px; margin: 4px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.1);">
          📅 Google
        </a>
        <a href="${outlookUrl}" target="_blank" 
           style="display: inline-block; background: #1e293b; color: #e2e8f0; padding: 12px 20px; border-radius: 8px; margin: 4px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.1);">
          📧 Outlook
        </a>
        <a href="${yahooUrl}" target="_blank" 
           style="display: inline-block; background: #1e293b; color: #e2e8f0; padding: 12px 20px; border-radius: 8px; margin: 4px; text-decoration: none; font-size: 13px; border: 1px solid rgba(255,255,255,0.1);">
          🗓️ Yahoo
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0 0 16px;">
        📎 An .ics calendar file is also attached to this email for Apple Calendar and other apps.
      </p>
      
      <p style="color: #94a3b8; margin: 24px 0 0; font-size: 14px; line-height: 1.6;">
        Questions? Contact <strong style="color: #e2e8f0;">${hostName}</strong>.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: rgba(0,0,0,0.3); padding: 24px; text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.1);">
      <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">
        Powered by <strong style="color: #a78bfa;">Genie Studio</strong>
      </p>
      <p style="color: #475569; font-size: 11px; margin: 0;">
        genieaiexperimentationhub.tech
      </p>
    </div>
  </div>
</body>
</html>`;

    console.log('[send-show-invite] Sending email with ICS attachment to:', to);
    const emailResponse = await resend.emails.send({
      from: `Genie Studio <${fromEmail}>`,
      to: [to],
      subject: `${typeInfo.emoji} You're invited to "${showTitle}" - ${roleText}`,
      html: emailHtml,
      attachments: [
        {
          filename: `${showTitle.replace(/[^a-z0-9]/gi, '_')}_genie_studio.ics`,
          content: icsBase64,
          type: 'text/calendar',
        }
      ],
    });

    console.log('[send-show-invite] Email sent successfully:', emailResponse);
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Invite sent to ${to}`, 
      emailSent: true, 
      emailId: emailResponse.id 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  } catch (error: any) {
    console.error('[send-show-invite] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
};

serve(handler);
