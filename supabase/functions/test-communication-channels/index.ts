import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  channel: 'sms' | 'whatsapp' | 'email' | 'voice';
  to: string;
  message?: string;
  subject?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testing communication channels...');
    
    const { channel, to, message = 'Test message from healthcare enrollment system', subject = 'Test Communication' }: TestRequest = await req.json();
    
    // Check for required secrets
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    const missingSecrets = [];
    if (!twilioAccountSid) missingSecrets.push('TWILIO_ACCOUNT_SID');
    if (!twilioAuthToken) missingSecrets.push('TWILIO_AUTH_TOKEN');
    if (!twilioPhoneNumber) missingSecrets.push('TWILIO_PHONE_NUMBER');
    if (channel === 'email' && !sendGridApiKey) missingSecrets.push('SENDGRID_API_KEY');
    
    if (missingSecrets.length > 0) {
      console.error('❌ Missing secrets:', missingSecrets);
      return new Response(JSON.stringify({ 
        error: 'Missing required secrets', 
        missing: missingSecrets,
        status: 'configuration_error'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`📱 Testing ${channel} to ${to}`);
    
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    let response;
    let testResult;

    switch (channel) {
      case 'sms':
        console.log('🔍 Testing SMS via Twilio...');
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber as string,
            To: to,
            Body: `${message} - ${new Date().toISOString()}`,
          }),
        });
        break;

      case 'whatsapp':
        console.log('🔍 Testing WhatsApp via Twilio...');
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${twilioPhoneNumber}`,
            To: `whatsapp:${to}`,
            Body: `${message} - WhatsApp Test - ${new Date().toISOString()}`,
          }),
        });
        break;

      case 'voice':
        console.log('🔍 Testing Voice Call via Twilio...');
        const twimlUrl = `https://twimlets.com/message?Message%5B0%5D=${encodeURIComponent(message)}`;
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber as string,
            To: to,
            Url: twimlUrl,
          }),
        });
        break;

      case 'email':
        console.log('🔍 Testing Email via SendGrid...');
        response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: 'noreply@healthcare-enrollment.com', name: 'Healthcare Enrollment System' },
            subject: `${subject} - ${new Date().toISOString()}`,
            content: [{ 
              type: 'text/html', 
              value: `
                <h2>Test Email from Healthcare Enrollment System</h2>
                <p>${message}</p>
                <p><em>Sent at: ${new Date().toISOString()}</em></p>
                <hr>
                <p>This is a test message to verify email delivery is working properly.</p>
              `
            }],
          }),
        });
        break;

      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ${channel.toUpperCase()} API error:`, errorText);
      
      testResult = {
        channel,
        status: 'failed',
        error: errorText,
        timestamp: new Date().toISOString(),
        to,
        response_status: response.status
      };
    } else {
      const result = await response.json();
      console.log(`✅ ${channel.toUpperCase()} test successful:`, result);
      
      testResult = {
        channel,
        status: 'success',
        result,
        timestamp: new Date().toISOString(),
        to,
        response_status: response.status
      };
    }

    // Log test result to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('communication_test_logs').insert({
      channel_type: channel,
      recipient: to,
      test_status: testResult.status,
      test_details: testResult,
      created_at: new Date().toISOString()
    });

    return new Response(JSON.stringify(testResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ Error in test-communication-channels function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);