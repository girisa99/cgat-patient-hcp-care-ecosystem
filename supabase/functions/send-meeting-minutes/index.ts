import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMeetingMinutesRequest {
  meeting_minutes_id: string;
  recipient_emails?: string[];
  include_transcript?: boolean;
  include_action_items?: boolean;
  include_summary?: boolean;
  custom_message?: string;
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
      meeting_minutes_id,
      recipient_emails,
      include_transcript = true,
      include_action_items = true,
      include_summary = true,
      custom_message,
    }: SendMeetingMinutesRequest = await req.json();

    console.log(`Sending meeting minutes: ${meeting_minutes_id}`);

    // Fetch meeting minutes
    const { data: minutes, error: minutesError } = await supabase
      .from("meeting_minutes")
      .select("*")
      .eq("id", meeting_minutes_id)
      .single();

    if (minutesError || !minutes) {
      console.error("Failed to fetch meeting minutes:", minutesError);
      return new Response(
        JSON.stringify({ error: "Meeting minutes not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recipient emails - either provided or from participants
    let emails: string[] = recipient_emails || [];
    if (emails.length === 0 && minutes.participants) {
      emails = (minutes.participants as any[])
        .filter((p) => p.email)
        .map((p) => p.email);
    }

    if (emails.length === 0) {
      console.error("No recipient emails found");
      return new Response(
        JSON.stringify({ error: "No recipient emails provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format meeting date
    const meetingDate = new Date(minutes.meeting_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Format duration
    const durationMinutes = Math.floor((minutes.duration_seconds || 0) / 60);
    const durationFormatted = durationMinutes > 0 ? `${durationMinutes} minutes` : "N/A";

    // Build action items HTML
    let actionItemsHtml = "";
    if (include_action_items && minutes.action_items && (minutes.action_items as any[]).length > 0) {
      actionItemsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
          <h3 style="margin: 0 0 10px 0; color: #856404;">📋 Action Items</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${(minutes.action_items as any[])
              .map(
                (item) => `
              <li style="margin: 8px 0; color: #333;">
                <strong>${item.title || item.task || item}</strong>
                ${item.assignee ? `<br><small style="color: #666;">Assigned to: ${item.assignee}</small>` : ""}
                ${item.due_date ? `<br><small style="color: #666;">Due: ${item.due_date}</small>` : ""}
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `;
    }

    // Build key points HTML
    let keyPointsHtml = "";
    if (minutes.key_points && (minutes.key_points as any[]).length > 0) {
      keyPointsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
          <h3 style="margin: 0 0 10px 0; color: #155724;">🎯 Key Points</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${(minutes.key_points as any[])
              .map(
                (point) => `<li style="margin: 8px 0; color: #333;">${typeof point === "string" ? point : point.text || point.content}</li>`
              )
              .join("")}
          </ul>
        </div>
      `;
    }

    // Build decisions HTML
    let decisionsHtml = "";
    if (minutes.decisions && (minutes.decisions as any[]).length > 0) {
      decisionsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #cce5ff; border-radius: 8px; border-left: 4px solid #004085;">
          <h3 style="margin: 0 0 10px 0; color: #004085;">✅ Decisions Made</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${(minutes.decisions as any[])
              .map(
                (decision) => `<li style="margin: 8px 0; color: #333;">${typeof decision === "string" ? decision : decision.text || decision.content}</li>`
              )
              .join("")}
          </ul>
        </div>
      `;
    }

    // Build summary section
    let summaryHtml = "";
    if (include_summary && (minutes.summary || minutes.ai_summary)) {
      summaryHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #6c757d;">
          <h3 style="margin: 0 0 10px 0; color: #495057;">📝 Meeting Summary</h3>
          <p style="margin: 0; color: #333; line-height: 1.6;">${minutes.ai_summary || minutes.summary}</p>
        </div>
      `;
    }

    // Build transcript section (collapsible summary)
    let transcriptHtml = "";
    if (include_transcript && minutes.transcript && (minutes.transcript as any[]).length > 0) {
      const transcriptItems = (minutes.transcript as any[]).slice(0, 10); // Show first 10 entries
      transcriptHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #e2e3e5; border-radius: 8px; border-left: 4px solid #383d41;">
          <h3 style="margin: 0 0 10px 0; color: #383d41;">🎙️ Transcript Highlights</h3>
          <div style="max-height: 300px; overflow-y: auto;">
            ${transcriptItems
              .map(
                (entry) => `
              <div style="margin: 8px 0; padding: 8px; background: white; border-radius: 4px;">
                <strong style="color: #007bff;">${entry.speaker || "Speaker"}:</strong>
                <span style="color: #333;"> ${entry.text || entry.content}</span>
                ${entry.timestamp ? `<small style="color: #999; display: block;">@ ${entry.timestamp}</small>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
          ${(minutes.transcript as any[]).length > 10 ? `<p style="color: #666; font-style: italic; margin-top: 10px;">...and ${(minutes.transcript as any[]).length - 10} more entries</p>` : ""}
        </div>
      `;
    }

    // Build participants list
    let participantsHtml = "";
    if (minutes.participants && (minutes.participants as any[]).length > 0) {
      participantsHtml = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f1f3f5; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #495057;">👥 Attendees</h4>
          <p style="margin: 0; color: #666;">
            ${(minutes.participants as any[])
              .map((p) => p.name || p.email || "Unknown")
              .join(", ")}
          </p>
        </div>
      `;
    }

    // Build full email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Minutes: ${minutes.meeting_title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Meeting Minutes</h1>
            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal; opacity: 0.9;">${minutes.meeting_title}</h2>
          </div>
          
          <!-- Meeting Info -->
          <div style="padding: 25px;">
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="flex: 1; min-width: 150px;">
                <strong style="color: #666; font-size: 12px; text-transform: uppercase;">Date & Time</strong>
                <p style="margin: 5px 0 0 0; color: #333;">${meetingDate}</p>
              </div>
              <div style="flex: 1; min-width: 150px;">
                <strong style="color: #666; font-size: 12px; text-transform: uppercase;">Duration</strong>
                <p style="margin: 5px 0 0 0; color: #333;">${durationFormatted}</p>
              </div>
              ${minutes.host_name ? `
              <div style="flex: 1; min-width: 150px;">
                <strong style="color: #666; font-size: 12px; text-transform: uppercase;">Host</strong>
                <p style="margin: 5px 0 0 0; color: #333;">${minutes.host_name}</p>
              </div>
              ` : ""}
            </div>
            
            ${custom_message ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 8px; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #333; font-style: italic;">${custom_message}</p>
            </div>
            ` : ""}
            
            ${participantsHtml}
            ${summaryHtml}
            ${keyPointsHtml}
            ${decisionsHtml}
            ${actionItemsHtml}
            ${transcriptHtml}
            
            <!-- Footer CTA -->
            <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
              <a href="${publicSiteUrl}/meeting-minutes/${meeting_minutes_id}" 
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Full Minutes Online
              </a>
            </div>
          </div>
          
          <!-- Email Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              This meeting was recorded with consent from all participants.
            </p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
              Powered by Genie AI | <a href="${publicSiteUrl}" style="color: #667eea;">Visit our platform</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails to all recipients
    const emailPromises = emails.map((email) =>
      resend.emails.send({
        from: "Genie AI Meetings <meetings@resend.dev>",
        to: [email],
        subject: `📋 Meeting Minutes: ${minutes.meeting_title}`,
        html: emailHtml,
      })
    );

    const emailResults = await Promise.allSettled(emailPromises);

    const successCount = emailResults.filter((r) => r.status === "fulfilled").length;
    const failedCount = emailResults.filter((r) => r.status === "rejected").length;

    console.log(`Emails sent: ${successCount} success, ${failedCount} failed`);

    // Update meeting minutes with sharing info
    const sharedWithUpdate = emails.map((email) => ({
      email,
      shared_at: new Date().toISOString(),
    }));

    await supabase
      .from("meeting_minutes")
      .update({
        shared_with: sharedWithUpdate,
        last_shared_at: new Date().toISOString(),
        status: "shared",
      })
      .eq("id", meeting_minutes_id);

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: successCount,
        emails_failed: failedCount,
        recipients: emails,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending meeting minutes:", error);
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
