import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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

    // Build consent notification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recording Notice: ${session_title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header with warning colors -->
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); padding: 30px; color: white; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎥</div>
            <h1 style="margin: 0; font-size: 24px;">Recording Notice</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Important Privacy Information</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello,
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              You are invited to participate in the following session:
            </p>
            
            <!-- Session Details Box -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">${session_title}</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Host:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${host_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>When:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${meetingDate}</td>
                </tr>
              </table>
            </div>
            
            <!-- Recording Notice Box -->
            <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #856404; display: flex; align-items: center;">
                ⚠️ Recording & Transcription Notice
              </h3>
              <p style="margin: 0; color: #856404; line-height: 1.6;">
                <strong>This session will be recorded and transcribed.</strong> By joining this session, you acknowledge and consent to the following:
              </p>
              <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #856404;">
                <li style="margin: 8px 0;">The session will be audio/video recorded</li>
                <li style="margin: 8px 0;">AI-powered transcription will capture spoken content</li>
                <li style="margin: 8px 0;">Meeting minutes and summaries may be generated and shared</li>
                <li style="margin: 8px 0;">Recordings may be stored for future reference</li>
              </ul>
            </div>
            
            <!-- Privacy Rights Box -->
            <div style="background: #d4edda; border: 1px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #155724;">🔒 Your Privacy Rights</h3>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li style="margin: 8px 0;">You can request to not be recorded (contact the host)</li>
                <li style="margin: 8px 0;">You may request removal of your data after the session</li>
                <li style="margin: 8px 0;">Recordings will be handled according to our privacy policy</li>
                <li style="margin: 8px 0;">If you do not consent, please decline this invitation</li>
              </ul>
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${publicSiteUrl}/session/${session_id}/join" 
                 style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 5px;">
                ✓ I Consent & Will Join
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
              By clicking "I Consent & Will Join", you acknowledge that you have read and understood this recording notice.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              Questions about privacy? Contact the host or visit our <a href="${publicSiteUrl}/privacy" style="color: #007bff;">Privacy Policy</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
              Powered by Genie AI
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails to all participants
    const emailPromises = participant_emails.map((email) =>
      resend.emails.send({
        from: "Genie AI <notifications@resend.dev>",
        to: [email],
        subject: `🎥 Recording Notice: ${session_title}`,
        html: emailHtml,
      })
    );

    const emailResults = await Promise.allSettled(emailPromises);

    const successCount = emailResults.filter((r) => r.status === "fulfilled").length;
    const failedCount = emailResults.filter((r) => r.status === "rejected").length;

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
