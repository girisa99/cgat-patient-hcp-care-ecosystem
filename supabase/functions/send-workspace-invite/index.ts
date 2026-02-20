import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const fromEmail = Deno.env.get('FROM_EMAIL') || 'info@genieaiexperimentationhub.tech';
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://cgat-patient-hcp-care-ecosystem.lovable.app';

    const { inviteeEmail, inviteeName, workspaceName, inviterName, role } = await req.json();

    if (!inviteeEmail || !workspaceName) {
      throw new Error('Missing required fields: inviteeEmail, workspaceName');
    }

    const resend = new Resend(resendApiKey);

    const displayName = inviteeName || inviteeEmail;
    const inviter = inviterName || 'A team member';
    const roleBadge = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';

    const { data, error } = await resend.emails.send({
      from: `Genie Suite <${fromEmail}>`,
      to: [inviteeEmail],
      subject: `You've been invited to "${workspaceName}" on Genie Suite`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; color: #1a1a2e; margin: 0;">🎉 You're Invited!</h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${displayName},
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            <strong>${inviter}</strong> has invited you to join the workspace 
            <strong>"${workspaceName}"</strong> as a <strong>${roleBadge}</strong>.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${siteUrl}/genie-admin?tab=workspaces" 
               style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Open Genie Suite
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.5;">
            You've been added automatically. Just sign in to access the workspace and start collaborating.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Genie Suite — AI-Powered Content & Collaboration Platform
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[send-workspace-invite] Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[send-workspace-invite] Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true, emailId: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('[send-workspace-invite] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
