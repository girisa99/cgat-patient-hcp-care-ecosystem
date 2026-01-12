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
    // Use verified domain for Resend - genieaiexperimentationhub.tech is verified
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'info@genieaiexperimentationhub.tech';
    
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
    
    // Build rich calendar event details with meeting URL prominently featured (ASCII only for ICS)
    let calendarDetails = '';
    if (joinUrl) {
      calendarDetails += `JOIN MEETING:\n${joinUrl}\n\n`;
    }
    if (showDescription) {
      calendarDetails += `${showDescription}\n\n`;
    }
    if (topics) {
      calendarDetails += `TOPICS:\n${topics}\n\n`;
    }
    calendarDetails += `Host: ${hostName}\n`;
    calendarDetails += `Your Role: ${roleText}\n\n`;
    calendarDetails += `------------------------\n`;
    calendarDetails += `Powered by Genie Studio\n`;
    calendarDetails += `Your AI-Powered Production Platform`;
    
    // Rich calendar details with emojis for web-based calendar links (these support Unicode)
    let richCalendarDetails = '';
    if (joinUrl) {
      richCalendarDetails += `🎬 JOIN MEETING:\n${joinUrl}\n\n`;
    }
    if (showDescription) {
      richCalendarDetails += `${showDescription}\n\n`;
    }
    if (topics) {
      richCalendarDetails += `📋 TOPICS:\n${topics}\n\n`;
    }
    richCalendarDetails += `🎙️ Host: ${hostName}\n`;
    richCalendarDetails += `👤 Your Role: ${roleText}\n\n`;
    richCalendarDetails += `─────────────────────\n`;
    richCalendarDetails += `✨ Powered by Genie Studio\n`;
    richCalendarDetails += `🚀 AI-Powered Production Platform`;
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`🎬 ${showTitle} - Genie Studio`)}&dates=${formatCalDate(date)}/${formatCalDate(endTime)}&details=${encodeURIComponent(richCalendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(`🎬 ${showTitle} - Genie Studio`)}&startdt=${date.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(richCalendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(`🎬 ${showTitle} - Genie Studio`)}&st=${formatCalDate(date)}&dur=${Math.floor(durationMinutes/60).toString().padStart(2,'0')}${(durationMinutes%60).toString().padStart(2,'0')}&desc=${encodeURIComponent(richCalendarDetails)}&in_loc=${encodeURIComponent(joinUrl || '')}`;
    
    // Helper function to encode UTF-8 string to base64 (handles Unicode)
    const utf8ToBase64 = (str: string): string => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };
    
    // Generate ICS file content (ASCII only - no emojis for compatibility)
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Genie Studio//AI-Powered Production Platform//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'X-WR-CALNAME:Genie Studio',
      'BEGIN:VEVENT',
      `UID:${crypto.randomUUID()}@genie-studio`,
      `DTSTAMP:${formatCalDate(new Date())}`,
      `DTSTART:${formatCalDate(date)}`,
      `DTEND:${formatCalDate(endTime)}`,
      `SUMMARY:${showTitle.replace(/,/g, '\\,').replace(/;/g, '\\;')} - Genie Studio`,
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
    
    const icsBase64 = utf8ToBase64(icsContent);

    // Build script attachment section
    let scriptSection = '';
    if (scriptAttachmentUrl) {
      scriptSection = `
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1)); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 12px;">📎</div>
          <p style="color: #34d399; margin: 0 0 8px; font-weight: 700; font-size: 16px;">Your Script is Ready!</p>
          <p style="color: #94a3b8; margin: 0 0 20px; font-size: 14px;">${scriptFilename || 'Production Script Document'}</p>
          <a href="${scriptAttachmentUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);">
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
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1)); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
          <p style="color: #34d399; margin: 0 0 12px; font-weight: 700; font-size: 16px;">📝 Script Preview</p>
          <pre style="color: #cbd5e1; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; margin: 0; max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 16px; border-radius: 12px; line-height: 1.6;">${previewText}</pre>
          <p style="color: #64748b; font-size: 12px; margin: 16px 0 0; text-align: center;">✨ Full script available in Genie Studio teleprompter during your session</p>
        </div>
      `;
    }

    // Build topics section
    let topicsSection = '';
    if (topics) {
      topicsSection = `
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1)); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
          <p style="color: #60a5fa; margin: 0 0 16px; font-weight: 700; font-size: 16px;">📋 Discussion Topics</p>
          <p style="color: #e2e8f0; margin: 0; line-height: 1.8; font-size: 15px;">${topics}</p>
        </div>
      `;
    }

    // Build suggested intro section
    let introSection = '';
    if (suggestedIntro) {
      introSection = `
        <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
          <p style="color: #f472b6; margin: 0 0 16px; font-weight: 700; font-size: 16px;">✨ Your Introduction</p>
          <p style="color: #e2e8f0; margin: 0; font-style: italic; line-height: 1.8; font-size: 15px; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; border-left: 4px solid #ec4899;">"${suggestedIntro}"</p>
        </div>
      `;
    }

    // Build join/recording URL buttons - PROMINENT SECTION
    let actionButtons = '';
    if (joinUrl || recordingUrl) {
      actionButtons = `
        <div style="text-align: center; margin: 32px 0; padding: 28px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15)); border-radius: 20px; border: 2px solid rgba(139, 92, 246, 0.3);">
          <p style="color: #a78bfa; font-size: 14px; margin: 0 0 20px; font-weight: 600;">🚀 Click below to join when it's time!</p>
          ${joinUrl ? `
            <a href="${joinUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 48px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 18px; margin: 8px; box-shadow: 0 12px 30px rgba(139, 92, 246, 0.4); transition: all 0.3s;">
              ✨ Join Session Now
            </a>
            <p style="color: #64748b; font-size: 12px; margin: 16px 0 0;">Meeting URL: ${joinUrl}</p>
          ` : ''}
          ${recordingUrl ? `
            <a href="${recordingUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 18px 48px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 18px; margin: 8px; box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4);">
              🎬 Recording Studio
            </a>
          ` : ''}
        </div>
      `;
    }

    // Genie Studio benefits section
    const benefitsSection = `
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid rgba(139, 92, 246, 0.2);">
        <p style="color: #a78bfa; font-size: 16px; margin: 0 0 16px; font-weight: 700; text-align: center;">✨ Why Genie Studio?</p>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px;">🎙️</span>
            <div>
              <p style="color: #e2e8f0; margin: 0; font-weight: 600; font-size: 14px;">Professional Production Tools</p>
              <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Teleprompter, real-time editing, multi-camera support</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px;">🤖</span>
            <div>
              <p style="color: #e2e8f0; margin: 0; font-weight: 600; font-size: 14px;">AI-Powered Assistance</p>
              <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Smart scripts, auto-captions, content suggestions</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px;">🎬</span>
            <div>
              <p style="color: #e2e8f0; margin: 0; font-weight: 600; font-size: 14px;">Seamless Recording & Streaming</p>
              <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">HD quality with instant publish to all platforms</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${showTitle} - Genie Studio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f23; margin: 0; padding: 20px;">
  <div style="max-width: 640px; margin: 0 auto; background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.3); box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);">
    
    <!-- Header with Genie Studio Branding -->
    <div style="background: linear-gradient(135deg, ${typeInfo.color}, #ec4899, #8b5cf6); padding: 48px 32px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 48px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${typeInfo.emoji}</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">Welcome to Genie Studio!</h1>
      <p style="color: rgba(255,255,255,0.95); margin: 16px 0 20px; font-size: 18px; font-weight: 500;">You're invited as <strong>${roleText}</strong></p>
      <span style="display: inline-block; background: rgba(255,255,255,0.25); color: white; padding: 10px 24px; border-radius: 30px; font-size: 15px; font-weight: 600; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
        ${typeInfo.emoji} ${typeInfo.name}
      </span>
    </div>
    
    <!-- Welcome Message -->
    <div style="padding: 36px 32px 0;">
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border-radius: 16px; padding: 24px; text-align: center; border: 1px solid rgba(139, 92, 246, 0.2);">
        <p style="color: #e2e8f0; margin: 0; font-size: 18px; line-height: 1.7;">
          Hi <strong style="color: #a78bfa; font-size: 20px;">${participantName}</strong>! 👋
        </p>
        <p style="color: #94a3b8; margin: 16px 0 0; font-size: 16px; line-height: 1.6;">
          <strong style="color: #e2e8f0;">${hostName}</strong> has invited you to an exciting ${typeInfo.name.toLowerCase()} production on <strong style="color: #a78bfa;">Genie Studio</strong> - the AI-powered production platform.
        </p>
      </div>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px;">
      
      <!-- Show Details Card -->
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(99, 102, 241, 0.08)); border: 1px solid rgba(139, 92, 246, 0.35); border-radius: 20px; padding: 28px; margin: 24px 0;">
        <h2 style="color: #f1f5f9; margin: 0 0 20px; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 12px;">
          <span>${typeInfo.emoji}</span> ${showTitle}
        </h2>
        ${showDescription ? `<p style="color: #94a3b8; margin: 0 0 24px; line-height: 1.7; font-size: 15px;">${showDescription}</p>` : ''}
        
        <div style="display: grid; gap: 16px; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">📅</span>
            <div>
              <p style="color: #64748b; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
              <p style="color: #e2e8f0; margin: 4px 0 0; font-size: 16px; font-weight: 600;">${formattedDate}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">⏰</span>
            <div>
              <p style="color: #64748b; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Time</p>
              <p style="color: #e2e8f0; margin: 4px 0 0; font-size: 16px; font-weight: 600;">${formattedTime}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">⏱️</span>
            <div>
              <p style="color: #64748b; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
              <p style="color: #e2e8f0; margin: 4px 0 0; font-size: 16px; font-weight: 600;">${durationMinutes} minutes</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">🌟</span>
            <div>
              <p style="color: #64748b; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Role</p>
              <p style="color: #a78bfa; margin: 4px 0 0; font-size: 16px; font-weight: 700;">${roleText}</p>
            </div>
          </div>
        </div>
      </div>
      
      ${actionButtons}
      ${topicsSection}
      ${scriptSection}
      ${introSection}
      ${benefitsSection}
      
      <!-- Calendar Buttons -->
      <div style="text-align: center; margin: 28px 0; padding: 24px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <p style="color: #e2e8f0; font-size: 15px; margin: 0 0 20px; font-weight: 600;">📅 Save to your calendar <span style="color: #64748b; font-weight: 400;">(includes meeting link)</span></p>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
          <a href="${googleCalUrl}" target="_blank" 
             style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #1e293b, #0f172a); color: #e2e8f0; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; border: 1px solid rgba(139, 92, 246, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            📅 Google Calendar
          </a>
          <a href="${outlookUrl}" target="_blank" 
             style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #1e293b, #0f172a); color: #e2e8f0; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; border: 1px solid rgba(59, 130, 246, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            📧 Outlook
          </a>
          <a href="${yahooUrl}" target="_blank" 
             style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #1e293b, #0f172a); color: #e2e8f0; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; border: 1px solid rgba(168, 85, 247, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            🗓️ Yahoo
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 20px 0 0;">
          📎 An .ics calendar file is also attached for Apple Calendar and other apps
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; background: rgba(139, 92, 246, 0.08); border-radius: 12px; margin-top: 24px;">
        <p style="color: #94a3b8; margin: 0; font-size: 15px; line-height: 1.6;">
          Questions? Reach out to <strong style="color: #e2e8f0;">${hostName}</strong>
        </p>
        <p style="color: #a78bfa; margin: 12px 0 0; font-size: 14px; font-weight: 500;">
          We can't wait to see you! 🎉
        </p>
      </div>
    </div>
    
    <!-- Footer with Genie Studio Branding -->
    <div style="background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%); padding: 32px; text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.2);">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 28px;">✨</span>
      </div>
      <p style="color: #a78bfa; font-size: 18px; margin: 0 0 8px; font-weight: 700;">
        Genie Studio
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 16px;">
        AI-Powered Production Platform
      </p>
      <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <span style="color: #475569; font-size: 11px;">🎙️ Podcasts</span>
        <span style="color: #475569; font-size: 11px;">📺 Webcasts</span>
        <span style="color: #475569; font-size: 11px;">🎤 Interviews</span>
        <span style="color: #475569; font-size: 11px;">📚 Tutorials</span>
      </div>
    </div>
  </div>
  
  <!-- Legal Footer -->
  <div style="text-align: center; padding: 24px; max-width: 640px; margin: 0 auto;">
    <p style="color: #475569; font-size: 11px; margin: 0; line-height: 1.6;">
      This invitation was sent via Genie Studio. If you received this in error, please ignore it.
    </p>
  </div>
</body>
</html>`;

    console.log('[send-show-invite] Sending email with ICS attachment to:', to);
    const emailResponse = await resend.emails.send({
      from: `Genie Studio <${fromEmail}>`,
      to: [to],
      subject: `✨ ${participantName}, you're invited to "${showTitle}" as ${roleText} - Genie Studio`,
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