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
  joinUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, participantName, role, showType, showTitle, showDescription, scheduledDate, hostName, topics, script, suggestedIntro, joinUrl }: ShowInviteRequest = await req.json();

    console.log(`[send-show-invite] Sending invite to ${to} for ${showType}: ${showTitle}`);

    const date = new Date(scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    const showTypeDisplay = { podcast: { name: 'Podcast', emoji: '🎙️' }, webcast: { name: 'Webcast', emoji: '📺' }, broadcast: { name: 'Live Broadcast', emoji: '📡' } }[showType];
    const roleDisplay = { host: 'Host', 'co-host': 'Co-Host', guest: 'Guest Speaker', panelist: 'Panelist' }[role];

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // Use genieaiexperimentationhub.tech domain for all emails
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@genieaiexperimentationhub.tech';
    
    console.log('[send-show-invite] RESEND_API_KEY configured:', !!RESEND_API_KEY);
    console.log('[send-show-invite] FROM email:', fromEmail);

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: true, message: 'Invite recorded (email sending requires RESEND_API_KEY)', emailSent: false }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const { Resend } = await import('https://esm.sh/resend@4.0.0');
    const resend = new Resend(RESEND_API_KEY);

    const endTime = new Date(date.getTime() + 60 * 60 * 1000);
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(showTitle)}&dates=${formatCalDate(date)}/${formatCalDate(endTime)}&details=${encodeURIComponent(showDescription || '')}`;
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(showTitle)}&startdt=${date.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(showDescription || '')}`;

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>You're Invited!</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0f0f23; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.2);">
<div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px; text-align: center;">
<h1 style="color: white; margin: 0;">You're Invited!</h1>
<p style="color: rgba(255,255,255,0.9); margin: 12px 0 0;">Join as ${roleDisplay}</p>
<span style="background: rgba(255,255,255,0.2); color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px;">${showTypeDisplay?.emoji || '📺'} ${showTypeDisplay?.name || 'Show'}</span>
</div>
<div style="padding: 30px;">
<p style="color: #e2e8f0;">Hi <strong style="color: #a78bfa;">${participantName}</strong>,</p>
<p style="color: #94a3b8;">You've been invited to participate in <strong>${showTitle}</strong>.</p>
<div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
<h2 style="color: #f1f5f9; margin: 0 0 15px;">${showTitle}</h2>
${showDescription ? `<p style="color: #94a3b8;">${showDescription}</p>` : ''}
<p style="color: #e2e8f0;">📅 ${formattedDate} at ${formattedTime}</p>
<p style="color: #a78bfa;">👤 Your Role: ${roleDisplay}</p>
</div>
${topics ? `<div style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;"><strong style="color: #60a5fa;">📋 Topics:</strong><p style="color: #e2e8f0; margin: 8px 0 0;">${topics}</p></div>` : ''}
${script ? `<div style="background: rgba(16, 185, 129, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;"><strong style="color: #34d399;">📝 Script Preview:</strong><pre style="color: #cbd5e1; font-size: 12px; white-space: pre-wrap; margin: 8px 0 0;">${script.substring(0, 500)}${script.length > 500 ? '...' : ''}</pre></div>` : ''}
${joinUrl ? `<div style="text-align: center; margin: 30px 0;"><a href="${joinUrl}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold;">✨ Join Session</a></div>` : ''}
<div style="text-align: center; margin: 20px 0;">
<p style="color: #94a3b8; font-size: 14px;">Add to your calendar:</p>
<a href="${googleCalUrl}" style="background: #1e293b; color: #e2e8f0; padding: 10px 20px; border-radius: 8px; margin: 4px; text-decoration: none; display: inline-block;">📅 Google</a>
<a href="${outlookUrl}" style="background: #1e293b; color: #e2e8f0; padding: 10px 20px; border-radius: 8px; margin: 4px; text-decoration: none; display: inline-block;">📧 Outlook</a>
</div>
<p style="color: #94a3b8;">Questions? Contact <strong style="color: #e2e8f0;">${hostName}</strong>.</p>
</div>
<div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center;">
<p style="color: #64748b; font-size: 12px; margin: 0;">Powered by <strong style="color: #a78bfa;">Genie Studio</strong></p>
</div>
</div></body></html>`;

    console.log('[send-show-invite] Sending email to:', to);
    const emailResponse = await resend.emails.send({
      from: `Genie Studio <${fromEmail}>`,
      to: [to],
      subject: `${showTypeDisplay?.emoji || '📺'} You're invited to "${showTitle}"`,
      html: emailHtml,
    });

    console.log('[send-show-invite] Email sent:', emailResponse);
    return new Response(JSON.stringify({ success: true, message: `Invite sent to ${to}`, emailSent: true, emailId: emailResponse.id }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (error: any) {
    console.error('[send-show-invite] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
};

serve(handler);
