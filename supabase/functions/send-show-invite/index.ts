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
      hostName 
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
      podcast: { name: 'Podcast', emoji: '🎙️' },
      webcast: { name: 'Webcast', emoji: '📺' },
      broadcast: { name: 'Live Broadcast', emoji: '📡' }
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

    // Import Resend dynamically
    const { Resend } = await import('npm:resend@2.0.0');
    const resend = new Resend(RESEND_API_KEY);

    // Build the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">${showTypeDisplay.emoji}</div>
      <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Join us as a ${roleDisplay}</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #333; margin-top: 0;">Hi ${participantName},</p>
      
      <p style="color: #666; line-height: 1.6;">
        You've been invited to participate in an upcoming ${showTypeDisplay.name.toLowerCase()}. We'd love to have you join us!
      </p>

      <!-- Show Details Card -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h2 style="margin: 0 0 16px; color: #333; font-size: 20px;">${showTitle}</h2>
        ${showDescription ? `<p style="color: #666; margin: 0 0 16px; line-height: 1.5;">${showDescription}</p>` : ''}
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 16px;">📅</span>
            <span style="color: #333;"><strong>Date:</strong> ${formattedDate}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 16px;">🕐</span>
            <span style="color: #333;"><strong>Time:</strong> ${formattedTime}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 16px;">👤</span>
            <span style="color: #333;"><strong>Your Role:</strong> ${roleDisplay}</span>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px;">
          Accept Invitation
        </a>
      </div>

      <p style="color: #666; line-height: 1.6;">
        If you have any questions or need to discuss timing, please reply to this email or contact ${hostName}.
      </p>

      <p style="color: #666; margin-bottom: 0;">
        Looking forward to having you!<br><br>
        Best regards,<br>
        <strong>${hostName}</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Sent via Genie Studio • Professional Media Production
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
