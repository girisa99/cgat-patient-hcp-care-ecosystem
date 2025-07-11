
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'sms' | 'voice' | 'email' | 'whatsapp';
  to: string;
  message: string;
  subject?: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Missing Twilio credentials');
    }

    const { type, to, message, subject, userId }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification to ${to}`);

    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    let response;

    switch (type) {
      case 'sms':
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: to,
            Body: message,
          }),
        });
        break;

      case 'whatsapp':
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${twilioPhoneNumber}`,
            To: `whatsapp:${to}`,
            Body: message,
          }),
        });
        break;

      case 'voice':
        const twimlUrl = `https://twimlets.com/message?Message%5B0%5D=${encodeURIComponent(message)}`;
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: to,
            Url: twimlUrl,
          }),
        });
        break;

      case 'email':
        // Using Twilio SendGrid for email
        const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
        if (!sendGridApiKey) {
          throw new Error('SendGrid API key not configured');
        }

        response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: 'notifications@yourdomain.com', name: 'Healthcare Portal' },
            subject: subject || 'Healthcare Portal Notification',
            content: [{ type: 'text/plain', value: message }],
          }),
        });
        break;

      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Twilio API error:`, errorText);
      throw new Error(`Failed to send ${type} notification: ${errorText}`);
    }

    const result = await response.json();
    console.log(`${type} notification sent successfully:`, result);

    // Log the notification in the database if userId is provided
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('user_activity_logs').insert({
        user_id: userId,
        activity_type: 'notification_sent',
        activity_description: `${type.toUpperCase()} notification sent to ${to}`,
        metadata: {
          notification_type: type,
          recipient: to,
          message_preview: message.substring(0, 100),
        },
      });
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in twilio-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
