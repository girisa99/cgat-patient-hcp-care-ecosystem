// send-show-invite edge function v2.1 - Fixed attachment encoding
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShowInviteRequest {
  to: string;
  participantName: string;
  role: 'host' | 'co-host' | 'guest' | 'panelist' | 'speaker' | 'attendee' | 'stakeholder';
  showType: 'podcast' | 'webcast' | 'broadcast' | 'interview' | 'panel' | 'tutorial' | 'webinar' | 'workshop' | 'genie_studio_full' | 'genie_spark_demo' | 'genie_arc_demo' | 'genie_mind_demo' | 'genie_vibe_demo' | 'genie_suite_overview';
  showTitle: string;
  showDescription?: string;
  scheduledDate: string;
  hostName: string;
  hostEmail?: string;
  senderName?: string;
  senderEmail?: string;
  category?: 'media_production' | 'business_meeting' | 'event' | 'genie_demo';
  stage?: string;
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
      hostEmail,
      senderName,
      senderEmail,
      category = 'media_production',
      stage,
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
    console.log(`[send-show-invite] From: ${senderName} (${senderEmail}), Host: ${hostName} (${hostEmail})`);

    const date = new Date(scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    // Category display
    const categoryDisplay: Record<string, { name: string; emoji: string }> = {
      media_production: { name: 'Media Production', emoji: '🎬' },
      business_meeting: { name: 'Business Meeting', emoji: '💼' },
      event: { name: 'Event', emoji: '🎉' },
      genie_demo: { name: 'Genie Studio Demo', emoji: '✨' },
    };

    // Extended show type display
    const showTypeDisplay: Record<string, { name: string; emoji: string; color: string }> = {
      podcast: { name: 'Podcast', emoji: '🎙️', color: '#8B5CF6' },
      webcast: { name: 'Webcast', emoji: '📺', color: '#3B82F6' },
      broadcast: { name: 'Live Broadcast', emoji: '📡', color: '#EF4444' },
      interview: { name: 'Interview', emoji: '🎤', color: '#06B6D4' },
      panel: { name: 'Panel Discussion', emoji: '👥', color: '#6366F1' },
      tutorial: { name: 'Tutorial', emoji: '📚', color: '#10B981' },
      webinar: { name: 'Webinar', emoji: '🖥️', color: '#0EA5E9' },
      workshop: { name: 'Workshop', emoji: '🔧', color: '#F97316' },
      // Genie Demo types
      genie_studio_full: { name: 'Genie Studio Full Demo', emoji: '✨', color: '#8B5CF6' },
      genie_spark_demo: { name: 'Genie Spark Demo', emoji: '⚡', color: '#F59E0B' },
      genie_arc_demo: { name: 'Genie Arc Demo', emoji: '🎬', color: '#10B981' },
      genie_mind_demo: { name: 'Genie Mind Demo', emoji: '🧠', color: '#3B82F6' },
      genie_vibe_demo: { name: 'Genie Vibe Demo', emoji: '🎵', color: '#A855F7' },
      genie_suite_overview: { name: 'Genie Suite Overview', emoji: '🚀', color: '#EC4899' },
    };

    const categoryInfo = categoryDisplay[category] || { name: 'Production', emoji: '🎬' };
    const typeInfo = showTypeDisplay[showType] || { name: 'Show', emoji: '📺', color: '#8B5CF6' };
    const roleDisplay: Record<string, string> = {
      host: 'Host', 
      'co-host': 'Co-Host', 
      guest: 'Guest Speaker', 
      panelist: 'Panelist',
      speaker: 'Speaker',
      attendee: 'Attendee',
      stakeholder: 'Stakeholder'
    };
    const roleText = roleDisplay[role] || role;
    const stageText = stage ? stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // IMPORTANT: Use Resend's verified test sender to ensure delivery
    // For production, verify your domain at https://resend.com/domains
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';
    
    console.log('[send-show-invite] RESEND_API_KEY configured:', !!RESEND_API_KEY);
    console.log('[send-show-invite] FROM email:', fromEmail);
    console.log('[send-show-invite] Target recipients:', to);

    if (!RESEND_API_KEY) {
      console.warn('[send-show-invite] RESEND_API_KEY not configured - email will not be sent');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email service not configured. Please add RESEND_API_KEY to send invites.',
        message: 'RESEND_API_KEY is required to send email invites', 
        emailSent: false 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
    }

    const { Resend } = await import('https://esm.sh/resend@4.0.0');
    const resend = new Resend(RESEND_API_KEY);

    const endTime = new Date(date.getTime() + durationMinutes * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Build calendar event details
    let calendarDetails = '';
    if (joinUrl) {
      calendarDetails += `JOIN MEETING:\n${joinUrl}\n\n`;
    }
    calendarDetails += `NOTE: Your meeting will be activated 30 minutes before the scheduled time.\n\n`;
    if (showDescription) {
      calendarDetails += `${showDescription}\n\n`;
    }
    if (topics) {
      calendarDetails += `TOPICS:\n${topics}\n\n`;
    }
    calendarDetails += `Host: ${hostName}${hostEmail ? ` (${hostEmail})` : ''}\n`;
    calendarDetails += `Invited by: ${senderName || hostName}${senderEmail ? ` (${senderEmail})` : ''}\n`;
    calendarDetails += `Your Role: ${roleText}\n\n`;
    calendarDetails += `------------------------\n`;
    calendarDetails += `Powered by Genie Studio\n`;
    calendarDetails += `Your AI-Powered Production Platform`;
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${typeInfo.emoji} ${showTitle} - Genie Studio`)}&dates=${formatCalDate(date)}/${formatCalDate(endTime)}&details=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(`${typeInfo.emoji} ${showTitle} - Genie Studio`)}&startdt=${date.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(`${typeInfo.emoji} ${showTitle} - Genie Studio`)}&st=${formatCalDate(date)}&dur=${Math.floor(durationMinutes/60).toString().padStart(2,'0')}${(durationMinutes%60).toString().padStart(2,'0')}&desc=${encodeURIComponent(calendarDetails)}&in_loc=${encodeURIComponent(joinUrl || '')}`;
    
    // UTF-8 to base64 helper
    const utf8ToBase64 = (str: string): string => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };
    
    // Generate ICS file content
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
      `ORGANIZER;CN=${hostName.replace(/,/g, '').replace(/;/g, '')}:mailto:${hostEmail || fromEmail}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Genie Studio - Your session is now active! Join 30 minutes early.',
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

    // Build subject line with category, type, stage
    const subjectParts = [typeInfo.emoji];
    if (category && categoryInfo.name) {
      subjectParts.push(categoryInfo.name);
    }
    subjectParts.push(`${typeInfo.name}:`);
    subjectParts.push(`"${showTitle}"`);
    if (stageText) {
      subjectParts.push(`(${stageText})`);
    }
    subjectParts.push(`- You're invited as ${roleText}`);
    const emailSubject = subjectParts.join(' ');

    // Sender display name
    const senderDisplayName = senderName || hostName || 'Genie Studio';
    const invitedByText = senderName && senderEmail 
      ? `<strong style="color: #1e293b;">${senderName}</strong> (<a href="mailto:${senderEmail}" style="color: #8B5CF6;">${senderEmail}</a>)` 
      : `<strong style="color: #1e293b;">${hostName}</strong>`;

    // Build script attachment section
    let scriptSection = '';
    if (scriptAttachmentUrl) {
      scriptSection = `
        <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 2px solid #10b981; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 12px;">📎</div>
          <p style="color: #059669; margin: 0 0 8px; font-weight: 700; font-size: 16px;">Script Attached!</p>
          <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px;">${scriptFilename || 'Production Script Document'}</p>
          <a href="${scriptAttachmentUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            📥 Download Script
          </a>
        </div>
      `;
    } else if (script) {
      const cleanScript = script
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .trim();
      const previewText = cleanScript.length > 400 ? cleanScript.substring(0, 400) + '...' : cleanScript;
      
      scriptSection = `
        <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 2px solid #10b981; border-radius: 16px; padding: 24px; margin: 24px 0;">
          <p style="color: #059669; margin: 0 0 12px; font-weight: 700; font-size: 16px;">📝 Script Preview</p>
          <pre style="color: #374151; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; margin: 0; max-height: 180px; overflow-y: auto; background: white; padding: 16px; border-radius: 12px; line-height: 1.6; border: 1px solid #e5e7eb;">${previewText}</pre>
          <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0; text-align: center;">✨ Full script will be available in the Genie Studio teleprompter</p>
        </div>
      `;
    }

    // Build topics section
    let topicsSection = '';
    if (topics) {
      topicsSection = `
        <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #3b82f6; border-radius: 16px; padding: 24px; margin: 24px 0;">
          <p style="color: #1d4ed8; margin: 0 0 16px; font-weight: 700; font-size: 16px;">📋 Discussion Topics</p>
          <p style="color: #1e293b; margin: 0; line-height: 1.8; font-size: 15px;">${topics}</p>
        </div>
      `;
    }

    // Build suggested intro section
    let introSection = '';
    if (suggestedIntro) {
      introSection = `
        <div style="background: linear-gradient(135deg, #fdf4ff, #fae8ff); border: 2px solid #d946ef; border-radius: 16px; padding: 24px; margin: 24px 0;">
          <p style="color: #a21caf; margin: 0 0 16px; font-weight: 700; font-size: 16px;">✨ Your Introduction</p>
          <p style="color: #1e293b; margin: 0; font-style: italic; line-height: 1.8; font-size: 15px; padding: 16px; background: white; border-radius: 12px; border-left: 4px solid #d946ef;">"${suggestedIntro}"</p>
        </div>
      `;
    }

    // Build join/recording URL buttons
    let actionButtons = '';
    if (joinUrl || recordingUrl) {
      actionButtons = `
        <div style="text-align: center; margin: 32px 0; padding: 28px; background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 20px; border: 2px solid #8b5cf6;">
          <p style="color: #7c3aed; font-size: 14px; margin: 0 0 8px; font-weight: 600;">🔔 Important Notice</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 20px;">Your meeting link will be <strong style="color: #059669;">activated 30 minutes before</strong> the scheduled time</p>
          ${joinUrl ? `
            <a href="${joinUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 18px 48px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 18px; margin: 8px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);">
              ✨ Join Meeting
            </a>
            <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0;">Meeting URL: <a href="${joinUrl}" style="color: #8b5cf6;">${joinUrl}</a></p>
          ` : ''}
          ${recordingUrl ? `
            <a href="${recordingUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 18px 48px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 18px; margin: 8px; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);">
              🎬 Recording Studio
            </a>
          ` : ''}
        </div>
      `;
    }

    // Genie Products Section with Links
    const genieProductsSection = `
      <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 20px; padding: 32px; margin: 32px 0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <p style="color: #c4b5fd; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Discover</p>
          <h3 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Genie Studio Products</h3>
        </div>
        
        <div style="display: grid; gap: 16px;">
          <!-- Genie Arc -->
          <a href="https://genieaiexperimentationhub.tech/genie-arc" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎯</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">Genie Arc</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">AI-powered content creation and scriptwriting</p>
              </div>
            </div>
          </a>
          
          <!-- Production Hub -->
          <a href="https://genieaiexperimentationhub.tech/genie-studio/productions" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ec4899, #f43f5e); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎬</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">Production Hub</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">Schedule, manage, and produce shows seamlessly</p>
              </div>
            </div>
          </a>
          
          <!-- Genie Mind -->
          <a href="https://genieaiexperimentationhub.tech/genie-mind" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #06b6d4, #0ea5e9); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🧠</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">Genie Mind</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">Intelligent research and knowledge management</p>
              </div>
            </div>
          </a>
          
          <!-- Spark -->
          <a href="https://genieaiexperimentationhub.tech/genie-spark" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #f97316); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">⚡</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">Genie Spark</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">Quick ideas and creative brainstorming</p>
              </div>
            </div>
          </a>
          
          <!-- Vibe -->
          <a href="https://genieaiexperimentationhub.tech/genie-vibe" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #14b8a6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🎭</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">Genie Vibe</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">Live meeting studio with real-time collaboration</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    `;

    // Build the email HTML - LIGHT THEME
    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${showTitle} - Genie Studio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 640px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);">
    
    <!-- Header with Genie Studio Branding -->
    <div style="background: linear-gradient(135deg, ${typeInfo.color}, #8b5cf6); padding: 48px 32px; text-align: center;">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 48px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">${typeInfo.emoji}</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">Genie Studio</h1>
      <p style="color: rgba(255,255,255,0.95); margin: 12px 0 20px; font-size: 16px; font-weight: 500;">You're invited as <strong>${roleText}</strong></p>
      <div style="display: inline-flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <span style="display: inline-block; background: rgba(255,255,255,0.25); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
          ${categoryInfo.emoji} ${categoryInfo.name}
        </span>
        <span style="display: inline-block; background: rgba(255,255,255,0.25); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
          ${typeInfo.emoji} ${typeInfo.name}
        </span>
        ${stageText ? `<span style="display: inline-block; background: rgba(255,255,255,0.25); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">📍 ${stageText}</span>` : ''}
      </div>
    </div>
    
    <!-- Sender Info -->
    <div style="padding: 24px 32px 0;">
      <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; text-align: center;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          📧 Invitation sent by ${invitedByText}
        </p>
      </div>
    </div>
    
    <!-- Welcome Message -->
    <div style="padding: 24px 32px 0;">
      <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 16px; padding: 24px; text-align: center; border: 2px solid #c4b5fd;">
        <p style="color: #1e293b; margin: 0; font-size: 18px; line-height: 1.7;">
          Hi <strong style="color: #7c3aed; font-size: 20px;">${participantName}</strong>! 👋
        </p>
        <p style="color: #64748b; margin: 16px 0 0; font-size: 15px; line-height: 1.6;">
          You've been invited to join <strong style="color: #1e293b;">"${showTitle}"</strong> on <strong style="color: #7c3aed;">Genie Studio</strong> - the AI-powered production platform.
        </p>
      </div>
    </div>
    
    <!-- Content -->
    <div style="padding: 24px 32px 32px;">
      
      <!-- Show Details Card -->
      <div style="background: white; border: 2px solid #e2e8f0; border-radius: 20px; padding: 28px; margin: 24px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 12px;">
          <span>${typeInfo.emoji}</span> ${showTitle}
        </h2>
        ${showDescription ? `<p style="color: #64748b; margin: 0 0 24px; line-height: 1.7; font-size: 15px;">${showDescription}</p>` : ''}
        
        <div style="display: grid; gap: 16px; background: #f8fafc; padding: 20px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">📅</span>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
              <p style="color: #1e293b; margin: 4px 0 0; font-size: 16px; font-weight: 600;">${formattedDate}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">⏰</span>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Time</p>
              <p style="color: #1e293b; margin: 4px 0 0; font-size: 16px; font-weight: 600;">${formattedTime}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">⏱️</span>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
              <p style="color: #1e293b; margin: 4px 0 0; font-size: 16px; font-weight: 600;">${durationMinutes} minutes</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">🌟</span>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Role</p>
              <p style="color: #7c3aed; margin: 4px 0 0; font-size: 16px; font-weight: 700;">${roleText}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 22px;">👤</span>
            <div>
              <p style="color: #94a3b8; margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Host</p>
              <p style="color: #1e293b; margin: 4px 0 0; font-size: 16px; font-weight: 600;">${hostName}${hostEmail ? ` <a href="mailto:${hostEmail}" style="color: #8b5cf6; font-size: 14px;">(${hostEmail})</a>` : ''}</p>
            </div>
          </div>
        </div>
      </div>
      
      ${actionButtons}
      ${topicsSection}
      ${scriptSection}
      ${introSection}
      
      <!-- Calendar Buttons -->
      <div style="text-align: center; margin: 28px 0; padding: 24px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <p style="color: #1e293b; font-size: 15px; margin: 0 0 20px; font-weight: 600;">📅 Add to your calendar</p>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
          <a href="${googleCalUrl}" target="_blank" 
             style="display: inline-flex; align-items: center; gap: 8px; background: white; color: #1e293b; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            📅 Google
          </a>
          <a href="${outlookUrl}" target="_blank" 
             style="display: inline-flex; align-items: center; gap: 8px; background: white; color: #1e293b; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            📧 Outlook
          </a>
          <a href="${yahooUrl}" target="_blank" 
             style="display: inline-flex; align-items: center; gap: 8px; background: white; color: #1e293b; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 600; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            🗓️ Yahoo
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 16px 0 0;">
          📎 An .ics calendar file is attached for Apple Calendar
        </p>
      </div>
      
      ${genieProductsSection}
      
      <div style="text-align: center; padding: 20px; background: #f5f3ff; border-radius: 12px; margin-top: 24px;">
        <p style="color: #64748b; margin: 0; font-size: 15px; line-height: 1.6;">
          Questions? Reply to this email or contact <strong style="color: #1e293b;">${hostName}</strong>${hostEmail ? ` at <a href="mailto:${hostEmail}" style="color: #8b5cf6;">${hostEmail}</a>` : ''}
        </p>
        <p style="color: #7c3aed; margin: 12px 0 0; font-size: 14px; font-weight: 500;">
          We can't wait to see you! 🎉
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #7c3aed; font-size: 18px; margin: 0 0 4px; font-weight: 700;">
        ✨ Genie Studio
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 12px;">
        AI-Powered Production Platform
      </p>
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        This invitation was sent via Genie Studio on behalf of ${senderDisplayName}
      </p>
    </div>
  </div>
</body>
</html>`;

    console.log('[send-show-invite] Sending email with ICS attachment to:', to);
    
    // Configure email options with CC for host email
    const displayFromName = senderName || hostName || 'Genie Studio';
    const ccEmail = senderEmail || hostEmail;
    
    // Build attachments array - use icsBase64 already computed above (line ~191)
    const attachments: any[] = [];
    
    // Add ICS calendar file attachment
    attachments.push({
      filename: `${showTitle.replace(/[^a-z0-9]/gi, '_')}_invite.ics`,
      content: icsBase64,
    });
    
    const emailOptions: any = {
      from: `${displayFromName} via Genie Studio <${fromEmail}>`,
      to: [to],
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments,
    };
    
    // Add CC so host receives a copy of all invites sent
    if (ccEmail && ccEmail !== to) {
      emailOptions.cc = [ccEmail];
      console.log('[send-show-invite] CC set to:', ccEmail);
    }
    
    // Also keep reply-to for convenience
    if (ccEmail) {
      emailOptions.reply_to = ccEmail;
    }

    const emailResponse = await resend.emails.send(emailOptions);

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
