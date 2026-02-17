import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRecordingConsentRequest {
  session_id: string;
  show_id?: string;
  session_title: string;
  host_name: string;
  scheduled_time: string;
  participant_emails: string[];
}

/**
 * Responsive email wrapper for consent notification
 */
const getResponsiveWrapper = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
    }
    
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .responsive-text { word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; }
    .content-padding { padding: 24px; }
    
    .btn {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
    }
    
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .content-padding { padding: 16px !important; }
      .header-padding { padding: 28px 16px !important; }
      .btn { display: block !important; width: 100% !important; padding: 12px 16px !important; box-sizing: border-box !important; }
      h1 { font-size: 22px !important; }
      h2 { font-size: 18px !important; }
      h3 { font-size: 16px !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 16px 8px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://genieaiexperimentationhub.tech";

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const {
      session_id,
      show_id,
      session_title,
      host_name,
      scheduled_time,
      participant_emails,
    }: NotifyRecordingConsentRequest = await req.json();

    console.log(`Sending recording consent notification for session: ${session_id}`);

    if (!participant_emails || participant_emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No participant emails provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const meetingDate = new Date(scheduled_time).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Build responsive consent notification email
    const emailContent = `
      <!-- Header -->
      <tr>
        <td class="header-padding" style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); padding: 32px 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">🎥</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Recording Notice</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Important Privacy Information</p>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="content-padding" style="padding: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding-bottom: 16px;">
                <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
                  Hello,
                </p>
                <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 12px 0 0;">
                  You are invited to participate in the following session:
                </p>
              </td>
            </tr>
            
            <!-- Session Details -->
            <tr>
              <td style="padding-bottom: 16px;">
                <div style="background: #f8f9fa; padding: 16px; border-radius: 10px;">
                  <h2 class="responsive-text" style="margin: 0 0 12px; color: #333; font-size: 18px; word-wrap: break-word;">${session_title}</h2>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Host:</strong></td>
                      <td style="padding: 6px 0; color: #333; font-size: 14px;">${host_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>When:</strong></td>
                      <td class="responsive-text" style="padding: 6px 0; color: #333; font-size: 14px; word-wrap: break-word;">${meetingDate}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            
            <!-- Recording Notice -->
            <tr>
              <td style="padding-bottom: 16px;">
                <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 16px; border-radius: 10px;">
                  <h3 style="margin: 0 0 10px; color: #856404; font-size: 16px;">⚠️ Recording & Transcription Notice</h3>
                  <p style="margin: 0 0 12px; color: #856404; line-height: 1.5; font-size: 14px;">
                    <strong>This session will be recorded and transcribed.</strong> By joining, you acknowledge and consent to:
                  </p>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr><td style="padding: 4px 0 4px 12px; color: #856404; font-size: 13px;">• The session will be audio/video recorded</td></tr>
                    <tr><td style="padding: 4px 0 4px 12px; color: #856404; font-size: 13px;">• AI transcription will capture spoken content</td></tr>
                    <tr><td style="padding: 4px 0 4px 12px; color: #856404; font-size: 13px;">• Meeting minutes may be generated and shared</td></tr>
                    <tr><td style="padding: 4px 0 4px 12px; color: #856404; font-size: 13px;">• Recordings may be stored for future reference</td></tr>
                  </table>
                </div>
              </td>
            </tr>
            
            <!-- Privacy Rights -->
            <tr>
              <td style="padding-bottom: 20px;">
                <div style="background: #d4edda; border: 1px solid #28a745; padding: 16px; border-radius: 10px;">
                  <h3 style="margin: 0 0 10px; color: #155724; font-size: 16px;">🔒 Your Privacy Rights</h3>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr><td style="padding: 4px 0 4px 12px; color: #155724; font-size: 13px;">• You can request to not be recorded (contact the host)</td></tr>
                    <tr><td style="padding: 4px 0 4px 12px; color: #155724; font-size: 13px;">• You may request removal of your data after the session</td></tr>
                    <tr><td style="padding: 4px 0 4px 12px; color: #155724; font-size: 13px;">• Recordings will be handled per our privacy policy</td></tr>
                    <tr><td style="padding: 4px 0 4px 12px; color: #155724; font-size: 13px;">• If you do not consent, please decline this invitation</td></tr>
                  </table>
                </div>
              </td>
            </tr>
            
            <!-- Action Button -->
            <tr>
              <td style="text-align: center; padding-bottom: 16px;">
                <a href="${publicSiteUrl}/session/${session_id}/join" class="btn" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px;">
                  ✓ I Consent & Will Join
                </a>
              </td>
            </tr>
            
            <tr>
              <td style="text-align: center;">
                <p style="color: #666; font-size: 12px; margin: 0; line-height: 1.5;">
                  By clicking "I Consent & Will Join", you acknowledge that you have read and understood this recording notice.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td style="background: #f8f9fa; padding: 16px 24px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            Questions? Contact the host or visit our <a href="${publicSiteUrl}/privacy" style="color: #007bff;">Privacy Policy</a>
          </p>
          <p style="margin: 8px 0 0; color: #8B5CF6; font-size: 13px; font-weight: 600;">
            ✨ Genie Studio
          </p>
        </td>
      </tr>
    `;

    const emailHtml = getResponsiveWrapper(emailContent, `Recording Notice: ${session_title}`);

    // Send emails to all participants with rate limiting
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const results: { email: string; status: string; error?: string }[] = [];
    
    for (let i = 0; i < participant_emails.length; i++) {
      const email = participant_emails[i];
      try {
        await resend.emails.send({
          from: "Genie Studio <notifications@resend.dev>",
          to: [email],
          subject: `🎥 Recording Notice: ${session_title}`,
          html: emailHtml,
        });
        results.push({ email, status: "sent" });
        
        // Rate limit: 600ms between emails
        if (i < participant_emails.length - 1) {
          await delay(600);
        }
      } catch (err: any) {
        console.error(`Failed to send consent notification to ${email}:`, err);
        results.push({ email, status: "failed", error: err.message });
      }
    }

    const successCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    console.log(`Consent notifications sent: ${successCount} success, ${failedCount} failed`);

    // Update session to mark consent notification as sent
    await supabase
      .from("genie_sessions")
      .update({
        recording_consent_shown: true,
      })
      .eq("id", session_id);

    // Also update shows table if show_id is provided
    if (show_id) {
      await supabase
        .from("shows")
        .update({
          metadata: {
            recording_consent_sent: true,
            consent_sent_at: new Date().toISOString(),
          },
        })
        .eq("id", show_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: successCount,
        notifications_failed: failedCount,
        recipients: participant_emails,
        details: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending recording consent notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
