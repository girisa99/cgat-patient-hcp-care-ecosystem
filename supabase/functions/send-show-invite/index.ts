import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShowInviteRequest {
  to: string;
  participantName: string;
  role: 'host' | 'co-host' | 'guest' | 'panelist';
  showType: 'podcast' | 'webcast' | 'broadcast';
  showTitle: string;
  showDescription?: string;
  scheduledDate: string;
  hostName: string;
  topics?: string;
  script?: string;
  suggestedIntro?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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
      suggestedIntro
    }: ShowInviteRequest = await req.json();

    console.log(`[send-show-invite] Sending invite to ${to} for ${showType}: ${showTitle}`);

    // Format the date nicely
    const date = new Date(scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Get show type display name and emoji
    const showTypeDisplay = {
      podcast: { name: 'Podcast', emoji: '🎙️', color: '#8B5CF6' },
      webcast: { name: 'Webcast', emoji: '📺', color: '#3B82F6' },
      broadcast: { name: 'Live Broadcast', emoji: '📡', color: '#EF4444' }
    }[showType];

    const roleDisplay = {
      host: 'Host',
      'co-host': 'Co-Host',
      guest: 'Guest Speaker',
      panelist: 'Panelist'
    }[role];

    // Check if Resend API key is configured
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.log('[send-show-invite] RESEND_API_KEY not configured, returning success without sending email');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invite recorded (email sending requires RESEND_API_KEY)',
          emailSent: false
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Import Resend from esm.sh (Deno-compatible)
    const { Resend } = await import('https://esm.sh/resend@4.0.0');
    const resend = new Resend(RESEND_API_KEY);

    // Build the email HTML with Genie AI branding
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${showTitle}!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3); border: 1px solid rgba(139, 92, 246, 0.2);">
    
    <!-- Header with Genie AI Branding -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); padding: 40px 30px; text-align: center; position: relative;">
      <!-- Genie Logo -->
      <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: rgba(255,255,255,0.15); border-radius: 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
        <span style="font-size: 40px;">✨</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">You're Invited!</h1>
      <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0; font-size: 18px; font-weight: 500;">Join as ${roleDisplay}</p>
      <div style="margin-top: 16px;">
        <span style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          ${showTypeDisplay.emoji} ${showTypeDisplay.name}
        </span>
      </div>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #e2e8f0; margin-top: 0; line-height: 1.6;">
        Hi <strong style="color: #a78bfa;">${participantName}</strong>,
      </p>
      
      <p style="color: #94a3b8; line-height: 1.7; font-size: 16px;">
        You've been invited to participate in an upcoming ${showTypeDisplay.name.toLowerCase()}. We'd love to have you join us as a ${roleDisplay.toLowerCase()}!
      </p>

      <!-- Show Details Card -->
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin: 28px 0;">
        <h2 style="margin: 0 0 20px; color: #f1f5f9; font-size: 24px; font-weight: 700;">${showTitle}</h2>
        ${showDescription ? `<p style="color: #94a3b8; margin: 0 0 20px; line-height: 1.6; font-size: 15px;">${showDescription}</p>` : ''}
        ${suggestedIntro ? `<p style="color: #a78bfa; margin: 0 0 20px; line-height: 1.6; font-size: 15px; font-style: italic; border-left: 3px solid #8b5cf6; padding-left: 16px;">${suggestedIntro}</p>` : ''}
        
        <div style="border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 20px; margin-top: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">
                <span style="margin-right: 8px;">📅</span> <strong style="color: #e2e8f0;">Date:</strong>
              </td>
              <td style="padding: 8px 0; color: #e2e8f0; font-size: 14px; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">
                <span style="margin-right: 8px;">🕐</span> <strong style="color: #e2e8f0;">Time:</strong>
              </td>
              <td style="padding: 8px 0; color: #e2e8f0; font-size: 14px; text-align: right;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">
                <span style="margin-right: 8px;">👤</span> <strong style="color: #e2e8f0;">Your Role:</strong>
              </td>
              <td style="padding: 8px 0; color: #a78bfa; font-size: 14px; text-align: right; font-weight: 600;">${roleDisplay}</td>
            </tr>
          </table>
        </div>
      </div>

      ${topics ? `
      <!-- Topics Section -->
      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; color: #60a5fa; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
          📋 Topics We'll Cover
        </h3>
        <p style="color: #e2e8f0; margin: 0; line-height: 1.6; font-size: 15px;">${topics}</p>
      </div>
      ` : ''}

      ${script ? `
      <!-- Script Preview Section -->
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; color: #34d399; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
          📝 Script Preview
        </h3>
        <p style="color: #cbd5e1; margin: 0; line-height: 1.6; font-size: 14px; font-family: 'Monaco', 'Consolas', monospace; white-space: pre-wrap;">${script}${script.length >= 500 ? '...' : ''}</p>
      </div>
      ` : ''}

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 36px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4); transition: all 0.3s;">
          ✨ Accept Invitation
        </a>
      </div>

      <p style="color: #94a3b8; line-height: 1.7; font-size: 15px;">
        If you have any questions or need to discuss timing, please reply to this email or contact <strong style="color: #e2e8f0;">${hostName}</strong>.
      </p>

      <p style="color: #94a3b8; margin-bottom: 0; line-height: 1.6;">
        Looking forward to having you!<br><br>
        <span style="color: #e2e8f0;">Best regards,</span><br>
        <strong style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 18px;">${hostName}</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: rgba(0,0,0,0.3); padding: 24px 30px; text-align: center; border-top: 1px solid rgba(139, 92, 246, 0.2);">
      <div style="margin-bottom: 12px;">
        <span style="font-size: 24px;">✨</span>
      </div>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">
        Powered by <strong style="color: #a78bfa;">Genie Studio</strong>
      </p>
      <p style="color: #475569; font-size: 12px; margin: 0;">
        Professional AI-Powered Media Production
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: 'Genie Studio <onboarding@resend.dev>',
      to: [to],
      subject: `${showTypeDisplay.emoji} You're invited to "${showTitle}" - ${showTypeDisplay.name}`,
      html: emailHtml,
    });

    console.log('[send-show-invite] Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invite sent to ${to}`,
        emailSent: true,
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('[send-show-invite] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
