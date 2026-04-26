// send-show-invite edge function v4.0 - Responsive templates + Centralized branding
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { 
  GENIE_BRANDING, 
  getCategory, 
  getShowType, 
  getRole, 
  getStage,
  getResponsiveEmailWrapper,
  getProductsSection,
  getEmailFooter
} from '../_shared/branding.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dynamic interface - accepts any string values for maximum flexibility
interface ShowInviteRequest {
  to: string;
  participantName: string;
  role?: string; // Dynamic - host, co-host, guest, panelist, speaker, attendee, stakeholder, etc.
  showType?: string; // Dynamic - any show type from the frontend
  showTitle: string;
  showDescription?: string;
  scheduledDate?: string;
  hostName?: string;
  hostEmail?: string;
  senderName?: string;
  senderEmail?: string;
  category?: string; // Dynamic - media_production, business_meeting, event, genie_demo, etc.
  stage?: string; // Dynamic - any stage value
  topics?: string;
  script?: string;
  scriptAttachmentUrl?: string;
  scriptFilename?: string;
  suggestedIntro?: string;
  joinUrl?: string;
  recordingUrl?: string;
  durationMinutes?: number;
  // Special email types
  isCancellation?: boolean;
  cancellationReason?: string;
  isReschedule?: boolean;
  newScheduledDate?: string;
  oldScheduledDate?: string;
  isFollowUp?: boolean;
  followUpMessage?: string;
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
      durationMinutes = 60,
      // Special email types
      isCancellation = false,
      cancellationReason,
      isReschedule = false,
      newScheduledDate,
      oldScheduledDate,
      isFollowUp = false,
      followUpMessage,
    }: ShowInviteRequest = await req.json();

    // Determine email type for logging
    const emailType = isCancellation ? 'CANCELLATION' : isReschedule ? 'RESCHEDULE' : isFollowUp ? 'FOLLOW-UP' : 'INVITE';
    console.log(`[send-show-invite] Sending ${emailType} to ${to} for ${showType || 'session'}: ${showTitle}`);
    console.log(`[send-show-invite] From: ${senderName} (${senderEmail}), Host: ${hostName} (${hostEmail})`);
    console.log(`[send-show-invite] scheduledDate received:`, scheduledDate);

    // Handle missing or invalid scheduledDate - default to now + 1 hour if not provided
    let date: Date;
    let formattedDate: string;
    let formattedTime: string;
    
    if (scheduledDate && scheduledDate.trim() !== '') {
      const parsedDate = new Date(scheduledDate);
      if (isNaN(parsedDate.getTime())) {
        console.warn(`[send-show-invite] Invalid date format: "${scheduledDate}", using fallback`);
        date = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        formattedDate = 'To Be Determined';
        formattedTime = 'TBD';
      } else {
        date = parsedDate;
        formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
      }
    } else {
      console.warn(`[send-show-invite] No scheduledDate provided, using fallback`);
      date = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now for calendar event
      formattedDate = 'To Be Determined';
      formattedTime = 'TBD';
    }

    // Use centralized branding for consistent display
    const categoryInfo = getCategory(category);
    const typeInfo = getShowType(showType || 'podcast');
    const roleInfo = getRole(role || 'attendee');
    const stageInfo = stage ? getStage(stage) : null;
    
    const roleText = roleInfo.name;
    const stageText = stageInfo?.name || '';
    
    console.log('[send-show-invite] Resolved display values:', {
      category: categoryInfo.name,
      type: typeInfo.name,
      role: roleText,
      stage: stageText
    });

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
    calendarDetails += `Powered by Genie Suite\n`;
    calendarDetails += `Your AI-Powered Production Platform`;
    
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${typeInfo.emoji} ${showTitle} - Genie Suite`)}&dates=${formatCalDate(date)}/${formatCalDate(endTime)}&details=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(`${typeInfo.emoji} ${showTitle} - Genie Suite`)}&startdt=${date.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(joinUrl || '')}`;
    const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(`${typeInfo.emoji} ${showTitle} - Genie Suite`)}&st=${formatCalDate(date)}&dur=${Math.floor(durationMinutes/60).toString().padStart(2,'0')}${(durationMinutes%60).toString().padStart(2,'0')}&desc=${encodeURIComponent(calendarDetails)}&in_loc=${encodeURIComponent(joinUrl || '')}`;
    
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
      'PRODID:-//Genie Suite//AI-Powered Production Platform//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'X-WR-CALNAME:Genie Suite',
      'BEGIN:VEVENT',
      `UID:${crypto.randomUUID()}@genie-suite`,
      `DTSTAMP:${formatCalDate(new Date())}`,
      `DTSTART:${formatCalDate(date)}`,
      `DTEND:${formatCalDate(endTime)}`,
      `SUMMARY:${showTitle.replace(/,/g, '\\,').replace(/;/g, '\\;')} - Genie Suite`,
      `DESCRIPTION:${calendarDetails.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')}`,
      joinUrl ? `LOCATION:${joinUrl.replace(/,/g, '\\,').replace(/;/g, '\\;')}` : '',
      joinUrl ? `URL:${joinUrl}` : '',
      `ORGANIZER;CN=${(hostName || 'Host').replace(/,/g, '').replace(/;/g, '')}:mailto:${hostEmail || fromEmail}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Genie Suite - Your session is now active! Join 30 minutes early.',
      'TRIGGER:-PT30M',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY', 
      'DESCRIPTION:Genie Suite - Session starts in 15 minutes',
      'TRIGGER:-PT15M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    
    const icsBase64 = utf8ToBase64(icsContent);

    // Build subject line with category, type, stage - different for special email types
    let emailSubject: string;
    
    if (isCancellation) {
      emailSubject = `❌ CANCELLED: "${showTitle}" - ${categoryInfo.name || 'Event'}`;
    } else if (isReschedule) {
      emailSubject = `📅 RESCHEDULED: "${showTitle}" - New Date: ${formattedDate}`;
    } else if (isFollowUp) {
      emailSubject = `📬 Follow-up: "${showTitle}" - ${categoryInfo.name || 'Session'}`;
    } else {
      const subjectParts: string[] = [typeInfo.emoji];
      if (category && categoryInfo.name) {
        subjectParts.push(categoryInfo.name);
      }
      subjectParts.push(`${typeInfo.name}:`);
      subjectParts.push(`"${showTitle}"`);
      if (stageText) {
        subjectParts.push(`(${stageText})`);
      }
      subjectParts.push(`- You're invited as ${roleText}`);
      emailSubject = subjectParts.join(' ');
    }

    // Sender display name
    const senderDisplayName = senderName || hostName || 'Genie Suite';
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
          <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0; text-align: center;">✨ Full script will be available in the Genie Suite teleprompter</p>
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

    // Genie Products Section with Links - Using centralized branding
    const { products, platform } = GENIE_BRANDING;
    const genieProductsSection = `
      <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 20px; padding: 32px; margin: 32px 0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <p style="color: #c4b5fd; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Discover</p>
          <h3 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">${platform.name} Products</h3>
          <p style="color: #a5b4fc; margin: 8px 0 0; font-size: 14px;">${platform.tagline}</p>
        </div>
        
        <div style="display: grid; gap: 16px;">
          <!-- Genie Hub -->
          <a href="${products.arc.url}" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, ${products.arc.color}, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">${products.arc.emoji}</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">${products.arc.name}</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">${products.arc.tagline}</p>
              </div>
            </div>
          </a>
          
          <!-- Genie Mind -->
          <a href="${products.mind.url}" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, ${products.mind.color}, #0ea5e9); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">${products.mind.emoji}</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">${products.mind.name}</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">${products.mind.tagline}</p>
              </div>
            </div>
          </a>
          
          <!-- Genie Spark -->
          <a href="${products.spark.url}" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, ${products.spark.color}, #f97316); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">${products.spark.emoji}</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">${products.spark.name}</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">${products.spark.tagline}</p>
              </div>
            </div>
          </a>
          
          <!-- Genie Vibe -->
          <a href="${products.vibe.url}" style="text-decoration: none; display: block; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, ${products.vibe.color}, #14b8a6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">${products.vibe.emoji}</span>
              </div>
              <div>
                <p style="color: white; margin: 0 0 4px; font-weight: 700; font-size: 16px;">${products.vibe.name}</p>
                <p style="color: #a5b4fc; margin: 0; font-size: 13px;">${products.vibe.tagline}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    `;

    // Build the email HTML based on email type
    let emailHtml: string;
    
    // Helper for common footer
    const footerHtml = `
      <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #7c3aed; font-size: 18px; margin: 0 0 4px; font-weight: 700;">✨ Genie Suite</p>
        <p style="color: #64748b; font-size: 13px; margin: 0 0 12px;">AI-Powered Production Platform</p>
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">This email was sent via Genie Suite</p>
      </div>
    `;
    
    if (isCancellation) {
      // CANCELLATION EMAIL - Responsive table-based layout
      const cancellationContent = `
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px 24px; text-align: center;">
            <div style="font-size: 56px; margin-bottom: 12px;">❌</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">Event Cancelled</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td class="content-padding" style="padding: 32px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; text-align: center;">
                  <h2 class="responsive-text" style="color: #dc2626; margin: 0 0 12px; font-size: 20px; word-wrap: break-word; overflow-wrap: break-word;">${showTitle}</h2>
                  <p style="color: #64748b; margin: 0; font-size: 15px;">Hi ${participantName},</p>
                  <p style="color: #374151; margin: 14px 0; font-size: 15px; line-height: 1.6;">
                    We regret to inform you that this event has been <strong>cancelled</strong>.
                  </p>
                  ${cancellationReason ? `
                    <div style="background: #ffffff; border-radius: 10px; padding: 14px; margin-top: 14px; border-left: 4px solid #ef4444; text-align: left;">
                      <p style="color: #6b7280; margin: 0 0 6px; font-size: 12px; text-transform: uppercase; font-weight: 600;">Reason</p>
                      <p class="responsive-text" style="color: #374151; margin: 0; font-size: 14px; word-wrap: break-word; overflow-wrap: break-word;">${cancellationReason}</p>
                    </div>
                  ` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 0; text-align: center;">
                  <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.6;">
                    Please update your calendar accordingly. We apologize for any inconvenience.
                  </p>
                </td>
              </tr>
              ${hostName ? `
              <tr>
                <td style="text-align: center;">
                  <p style="color: #374151; margin: 0; font-size: 14px;">
                    Questions? Contact <strong>${hostName}</strong>${hostEmail ? ` at <a href="mailto:${hostEmail}" style="color: #8b5cf6;">${hostEmail}</a>` : ''}
                  </p>
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
        ${getEmailFooter()}
      `;
      emailHtml = getResponsiveEmailWrapper(cancellationContent, `Event Cancelled - ${showTitle}`);
    } else if (isReschedule) {
      // RESCHEDULE EMAIL - Responsive table-based layout
      const oldDate = oldScheduledDate ? new Date(oldScheduledDate) : null;
      const newDate = newScheduledDate ? new Date(newScheduledDate) : new Date(scheduledDate || '');
      const oldFormattedDate = oldDate ? oldDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Previous Date';
      const oldFormattedTime = oldDate ? oldDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      const newFormattedDate = !isNaN(newDate.getTime()) ? newDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : formattedDate;
      const newFormattedTime = !isNaN(newDate.getTime()) ? newDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : formattedTime;
      
      const rescheduleContent = `
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 24px; text-align: center;">
            <div style="font-size: 56px; margin-bottom: 12px;">📅</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">Event Rescheduled</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td class="content-padding" style="padding: 32px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <h2 class="responsive-text" style="color: #1e293b; margin: 0 0 8px; font-size: 20px; word-wrap: break-word;">${showTitle}</h2>
                  <p style="color: #64748b; margin: 0; font-size: 15px;">Hi ${participantName}!</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px; text-align: center;">
                  <p style="color: #374151; margin: 0; font-size: 15px; line-height: 1.6;">
                    This event has been <strong>rescheduled</strong>. Please see the new date and time below.
                  </p>
                </td>
              </tr>
              ${oldDate ? `
              <tr>
                <td style="padding-bottom: 12px;">
                  <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 10px; padding: 14px; text-align: center;">
                    <p style="color: #dc2626; margin: 0 0 6px; font-size: 11px; text-transform: uppercase; font-weight: 600;">❌ Old Date (Cancelled)</p>
                    <p style="color: #9ca3af; margin: 0; font-size: 14px; text-decoration: line-through;">${oldFormattedDate} at ${oldFormattedTime}</p>
                  </div>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding-bottom: 20px;">
                  <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 18px; text-align: center;">
                    <p style="color: #16a34a; margin: 0 0 6px; font-size: 11px; text-transform: uppercase; font-weight: 600;">✅ New Date</p>
                    <p style="color: #166534; margin: 0; font-size: 18px; font-weight: 700;">${newFormattedDate}</p>
                    <p style="color: #16a34a; margin: 6px 0 0; font-size: 15px;">${newFormattedTime}</p>
                  </div>
                </td>
              </tr>
              ${joinUrl ? `
              <tr>
                <td style="text-align: center; padding: 16px 0;">
                  <a href="${joinUrl}" class="btn btn-primary" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                    ✨ Join Meeting
                  </a>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="text-align: center; padding-top: 12px;">
                  <p style="color: #64748b; margin: 0; font-size: 13px;">
                    Please update your calendar. A new calendar invite is attached.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${getEmailFooter()}
      `;
      emailHtml = getResponsiveEmailWrapper(rescheduleContent, `Event Rescheduled - ${showTitle}`);
    } else if (isFollowUp) {
      // FOLLOW-UP EMAIL - Responsive table-based layout
      const followUpContent = `
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 40px 24px; text-align: center;">
            <div style="font-size: 56px; margin-bottom: 12px;">📬</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">Follow-up Message</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td class="content-padding" style="padding: 32px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <h2 class="responsive-text" style="color: #1e293b; margin: 0 0 8px; font-size: 20px; word-wrap: break-word;">${showTitle}</h2>
                  <p style="color: #64748b; margin: 0; font-size: 15px;">Hi ${participantName}!</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  ${followUpMessage ? `
                    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border-left: 4px solid #8b5cf6;">
                      <p class="responsive-text" style="color: #374151; margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word;">${followUpMessage}</p>
                    </div>
                  ` : `
                    <p style="color: #374151; margin: 0; text-align: center; font-size: 15px; line-height: 1.6;">
                      Thank you for your participation in "${showTitle}". We wanted to follow up with you.
                    </p>
                  `}
                </td>
              </tr>
              ${joinUrl ? `
              <tr>
                <td style="text-align: center; padding: 16px 0;">
                  <a href="${joinUrl}" class="btn btn-primary" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                    🔗 Access Session
                  </a>
                </td>
              </tr>
              ` : ''}
              ${hostName ? `
              <tr>
                <td style="text-align: center; padding-top: 12px;">
                  <p style="color: #374151; margin: 0; font-size: 14px;">
                    Questions? Contact <strong>${hostName}</strong>${hostEmail ? ` at <a href="mailto:${hostEmail}" style="color: #8b5cf6;">${hostEmail}</a>` : ''}
                  </p>
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
        ${getEmailFooter()}
      `;
      emailHtml = getResponsiveEmailWrapper(followUpContent, `Follow-up: ${showTitle}`);
    } else {
      // REGULAR INVITE EMAIL - Responsive table-based layout
      const inviteContent = `
        <!-- Header -->
        <tr>
          <td class="header-padding" style="background: linear-gradient(135deg, ${typeInfo.color}, #8b5cf6); padding: 36px 24px; text-align: center;">
            <div style="font-size: 44px; margin-bottom: 10px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));">${typeInfo.emoji}</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Genie Suite</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 16px; font-size: 15px;">You're invited as <strong>${roleText}</strong></p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
              <tr>
                <td style="padding: 4px;">
                  <span style="display: inline-block; background: rgba(255,255,255,0.25); color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">${categoryInfo.emoji} ${categoryInfo.name}</span>
                </td>
                <td style="padding: 4px;">
                  <span style="display: inline-block; background: rgba(255,255,255,0.25); color: white; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">${typeInfo.emoji} ${typeInfo.name}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Sender Info -->
        <tr>
          <td class="content-padding" style="padding: 20px 24px 0;">
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 10px; padding: 12px; text-align: center;">
              <p style="color: #92400e; margin: 0; font-size: 13px;">📧 Invitation sent by ${invitedByText}</p>
            </div>
          </td>
        </tr>
        
        <!-- Welcome Message -->
        <tr>
          <td class="content-padding" style="padding: 20px 24px 0;">
            <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #c4b5fd;">
              <p style="color: #1e293b; margin: 0; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #7c3aed;">${participantName}</strong>! 👋
              </p>
              <p class="responsive-text" style="color: #64748b; margin: 12px 0 0; font-size: 14px; line-height: 1.5; word-wrap: break-word;">
                You've been invited to join <strong style="color: #1e293b;">"${showTitle}"</strong> on <strong style="color: #7c3aed;">Genie Suite</strong>
              </p>
            </div>
          </td>
        </tr>
        
        <!-- Main Content -->
        <tr>
          <td class="content-padding" style="padding: 20px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              
              <!-- Show Title & Description -->
              <tr>
                <td style="padding-bottom: 16px;">
                  <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 14px; padding: 20px;">
                    <h2 class="responsive-text" style="color: #1e293b; margin: 0 0 12px; font-size: 18px; font-weight: 700; word-wrap: break-word;">
                      ${typeInfo.emoji} ${showTitle}
                    </h2>
                    ${showDescription ? `<p class="responsive-text" style="color: #64748b; margin: 0; line-height: 1.6; font-size: 14px; word-wrap: break-word;">${showDescription}</p>` : ''}
                  </div>
                </td>
              </tr>
              
              <!-- Details Grid -->
              <tr>
                <td style="padding-bottom: 16px;">
                  <div style="background: #f8fafc; border-radius: 12px; padding: 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="details-table">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;" width="50%">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 10px; vertical-align: top;"><span style="font-size: 18px;">📅</span></td>
                              <td>
                                <p style="color: #94a3b8; margin: 0; font-size: 11px; text-transform: uppercase;">Date</p>
                                <p style="color: #1e293b; margin: 2px 0 0; font-size: 14px; font-weight: 600;">${formattedDate}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="padding: 8px 0; vertical-align: top;" width="50%">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 10px; vertical-align: top;"><span style="font-size: 18px;">⏰</span></td>
                              <td>
                                <p style="color: #94a3b8; margin: 0; font-size: 11px; text-transform: uppercase;">Time</p>
                                <p style="color: #1e293b; margin: 2px 0 0; font-size: 14px; font-weight: 600;">${formattedTime}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 10px; vertical-align: top;"><span style="font-size: 18px;">⏱️</span></td>
                              <td>
                                <p style="color: #94a3b8; margin: 0; font-size: 11px; text-transform: uppercase;">Duration</p>
                                <p style="color: #1e293b; margin: 2px 0 0; font-size: 14px; font-weight: 600;">${durationMinutes} min</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 10px; vertical-align: top;"><span style="font-size: 18px;">🌟</span></td>
                              <td>
                                <p style="color: #94a3b8; margin: 0; font-size: 11px; text-transform: uppercase;">Your Role</p>
                                <p style="color: #7c3aed; margin: 2px 0 0; font-size: 14px; font-weight: 700;">${roleText}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0; vertical-align: top;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding-right: 10px; vertical-align: top;"><span style="font-size: 18px;">👤</span></td>
                              <td>
                                <p style="color: #94a3b8; margin: 0; font-size: 11px; text-transform: uppercase;">Host</p>
                                <p class="responsive-text" style="color: #1e293b; margin: 2px 0 0; font-size: 14px; font-weight: 600; word-wrap: break-word;">${hostName}${hostEmail ? ` <a href="mailto:${hostEmail}" style="color: #8b5cf6; font-size: 12px;">(${hostEmail})</a>` : ''}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              
              <!-- Join Button -->
              ${joinUrl ? `
              <tr>
                <td style="padding: 16px 0; text-align: center;">
                  <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 14px; padding: 20px; border: 2px solid #8b5cf6;">
                    <p style="color: #7c3aed; font-size: 12px; margin: 0 0 6px; font-weight: 600;">🔔 Link activates 30 min before</p>
                    <a href="${joinUrl}" class="btn btn-primary" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #ffffff !important; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 8px;">
                      ✨ Join Meeting
                    </a>
                  </div>
                </td>
              </tr>
              ` : ''}
              
              <!-- Calendar Buttons -->
              <tr>
                <td style="padding: 16px 0;">
                  <div style="background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
                    <p style="color: #1e293b; font-size: 14px; margin: 0 0 12px; font-weight: 600;">📅 Add to calendar</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="padding: 4px;">
                          <a href="${googleCalUrl}" target="_blank" style="display: inline-block; background: #ffffff; color: #1e293b; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; border: 1px solid #e2e8f0;">📅 Google</a>
                        </td>
                        <td style="padding: 4px;">
                          <a href="${outlookUrl}" target="_blank" style="display: inline-block; background: #ffffff; color: #1e293b; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; border: 1px solid #e2e8f0;">📧 Outlook</a>
                        </td>
                        <td style="padding: 4px;">
                          <a href="${yahooUrl}" target="_blank" style="display: inline-block; background: #ffffff; color: #1e293b; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; border: 1px solid #e2e8f0;">🗓️ Yahoo</a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #94a3b8; font-size: 11px; margin: 10px 0 0;">📎 .ics file attached for Apple Calendar</p>
                  </div>
                </td>
              </tr>
              
              <!-- Products Section -->
              ${getProductsSection()}
              
              <!-- Contact -->
              <tr>
                <td style="padding: 16px 0 0;">
                  <div style="background: #f5f3ff; border-radius: 10px; padding: 16px; text-align: center;">
                    <p class="responsive-text" style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5; word-wrap: break-word;">
                      Questions? Contact <strong style="color: #1e293b;">${hostName}</strong>${hostEmail ? ` at <a href="mailto:${hostEmail}" style="color: #8b5cf6;">${hostEmail}</a>` : ''}
                    </p>
                    <p style="color: #7c3aed; margin: 10px 0 0; font-size: 13px; font-weight: 500;">We can't wait to see you! 🎉</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        ${getEmailFooter()}
      `;
      emailHtml = getResponsiveEmailWrapper(inviteContent, `You're Invited: ${showTitle} - Genie Suite`);
    } // End of email type conditional

    console.log('[send-show-invite] Sending email with ICS attachment to:', to);
    
    // Configure email options with CC for host email
    const displayFromName = senderName || hostName || 'Genie Suite';
    const ccEmail = senderEmail || hostEmail;
    
    // Build attachments array - use icsBase64 already computed above (line ~191)
    const attachments: any[] = [];
    
    // Add ICS calendar file attachment
    attachments.push({
      filename: `${showTitle.replace(/[^a-z0-9]/gi, '_')}_invite.ics`,
      content: icsBase64,
    });
    
    const emailOptions: any = {
      from: `${displayFromName} via Genie Suite <${fromEmail}>`,
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
      emailId: (emailResponse as any)?.data?.id || (emailResponse as any)?.id 
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
