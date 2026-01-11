import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function can be triggered by a cron job or manually
const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const now = new Date();
    const results: any[] = [];

    // Get upcoming sessions in the next 24 hours
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: upcomingSessions, error: sessionsError } = await supabase
      .from('genie_sessions')
      .select(`
        *,
        genie_session_participants(*)
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', in24Hours.toISOString());

    if (sessionsError) {
      throw sessionsError;
    }

    console.log(`Found ${upcomingSessions?.length || 0} upcoming sessions`);

    for (const session of upcomingSessions || []) {
      const scheduledAt = new Date(session.scheduled_at);
      const timeDiffMinutes = Math.floor((scheduledAt.getTime() - now.getTime()) / (60 * 1000));
      
      for (const participant of session.genie_session_participants || []) {
        const participantJoinUrl = `https://preview--genie-session.lovable.app/join/${session.session_token}?p=${participant.participant_token}`;

        // Check each reminder threshold
        const reminders = [
          { threshold: 24 * 60, type: '24h', emailField: 'email_reminder_24h', sentField: 'reminder_24h_sent' },
          { threshold: 60, type: '1h', emailField: 'email_reminder_1h', sentField: 'reminder_1h_sent' },
          { threshold: 30, type: '30m', emailField: 'email_reminder_30m', sentField: 'reminder_30m_sent', smsField: 'sms_reminder_30m', smsSentField: 'sms_30m_sent' },
          { threshold: 15, type: '15m', emailField: 'email_reminder_15m', sentField: 'reminder_15m_sent', smsField: 'sms_reminder_15m', smsSentField: 'sms_15m_sent' },
        ];

        for (const reminder of reminders) {
          // Check if within reminder window (±5 minutes)
          if (timeDiffMinutes <= reminder.threshold && timeDiffMinutes > reminder.threshold - 10) {
            
            // Send email reminder if enabled and not sent
            if (participant[reminder.emailField] && !participant[reminder.sentField] && resend) {
              try {
                await resend.emails.send({
                  from: 'Genie Studio <noreply@resend.dev>',
                  to: [participant.email],
                  subject: `⏰ Reminder: ${session.title} starts ${reminder.type === '24h' ? 'tomorrow' : `in ${reminder.type}`}`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                      <h2>⏰ Session Reminder</h2>
                      <p>Hi ${participant.name},</p>
                      <p>Your session <strong>${session.title}</strong> ${reminder.type === '24h' ? 'is scheduled for tomorrow' : `starts in ${reminder.type}`}.</p>
                      <p>
                        <a href="${participantJoinUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                          Join Session
                        </a>
                      </p>
                      <p style="color: #6b7280; font-size: 14px;">
                        ${session.host_name ? `Hosted by: ${session.host_name}` : ''}
                      </p>
                    </div>
                  `,
                });

                await supabase
                  .from('genie_session_participants')
                  .update({ [reminder.sentField]: true })
                  .eq('id', participant.id);

                results.push({
                  type: 'email',
                  reminder: reminder.type,
                  participant: participant.email,
                  status: 'sent',
                });
              } catch (emailError: any) {
                console.error('Email reminder error:', emailError);
                results.push({
                  type: 'email',
                  reminder: reminder.type,
                  participant: participant.email,
                  status: 'failed',
                  error: emailError.message,
                });
              }
            }

            // Send SMS reminder if enabled and not sent (30m and 15m only)
            if (reminder.smsField && participant[reminder.smsField] && !participant[reminder.smsSentField!] && participant.phone && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
              try {
                const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
                const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                    From: twilioPhoneNumber,
                    To: participant.phone,
                    Body: `⏰ Reminder: "${session.title}" starts in ${reminder.type}. Join: ${participantJoinUrl}`,
                  }),
                });

                if (smsResponse.ok) {
                  await supabase
                    .from('genie_session_participants')
                    .update({ [reminder.smsSentField!]: true })
                    .eq('id', participant.id);

                  results.push({
                    type: 'sms',
                    reminder: reminder.type,
                    participant: participant.phone,
                    status: 'sent',
                  });
                }
              } catch (smsError: any) {
                console.error('SMS reminder error:', smsError);
                results.push({
                  type: 'sms',
                  reminder: reminder.type,
                  participant: participant.phone,
                  status: 'failed',
                  error: smsError.message,
                });
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed_sessions: upcomingSessions?.length || 0,
      results,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in session-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
