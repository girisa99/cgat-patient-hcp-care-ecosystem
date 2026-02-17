import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google OAuth credentials - GOOGLE_CLIENT_ID is separate from GOOGLE_API_KEY
// GOOGLE_API_KEY is for Google AI/Gemini services
// GOOGLE_CLIENT_ID/SECRET are for OAuth flows (YouTube, Calendar, etc.)
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || Deno.env.get('GOOGLE_API_KEY'); // Fallback for backward compatibility
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

interface YouTubeChannelResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title: string;
      description: string;
      thumbnails?: {
        default?: { url: string };
      };
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    switch (action) {
      case 'auth-url': {
        // Generate Google OAuth URL with YouTube scopes
        const redirectUri = url.searchParams.get('redirect_uri') || `${SUPABASE_URL}/functions/v1/youtube-oauth?action=callback`;
        const state = crypto.randomUUID();
        
        // YouTube-specific scopes
        const scopes = [
          'https://www.googleapis.com/auth/youtube.upload',
          'https://www.googleapis.com/auth/youtube',
          'https://www.googleapis.com/auth/youtube.readonly'
        ].join(' ');

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID!);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scopes);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token

        return new Response(
          JSON.stringify({ 
            authUrl: authUrl.toString(),
            state 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        // Exchange authorization code for tokens
        const body = await req.json();
        const { code, redirect_uri } = body;

        if (!code) {
          throw new Error('Authorization code is required');
        }

        if (!userId) {
          throw new Error('User must be authenticated');
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri,
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Google token error:', errorText);
          throw new Error(`Failed to exchange code: ${errorText}`);
        }

        const tokens: GoogleTokenResponse = await tokenResponse.json();

        // Get YouTube channel info
        const channelResponse = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
          {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
            },
          }
        );

        let channelId = null;
        let channelName = null;

        if (channelResponse.ok) {
          const channelData: YouTubeChannelResponse = await channelResponse.json();
          if (channelData.items && channelData.items.length > 0) {
            channelId = channelData.items[0].id;
            channelName = channelData.items[0].snippet?.title;
          }
        }

        // Store tokens in database
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        const { error: upsertError } = await supabaseAdmin
          .from('youtube_oauth_tokens')
          .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || null,
            expires_at: expiresAt.toISOString(),
            scope: tokens.scope,
            channel_id: channelId,
            channel_name: channelName,
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error('Error storing YouTube tokens:', upsertError);
          throw new Error('Failed to store tokens');
        }

        console.log('✅ YouTube OAuth tokens stored for user:', userId, 'Channel:', channelName);

        return new Response(
          JSON.stringify({ 
            success: true,
            channelId,
            channelName,
            expiresAt: expiresAt.toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh': {
        // Refresh access token
        if (!userId) {
          throw new Error('User must be authenticated');
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Get current tokens
        const { data: tokenData, error: fetchError } = await supabaseAdmin
          .from('youtube_oauth_tokens')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError || !tokenData?.refresh_token) {
          throw new Error('No refresh token available');
        }

        // Refresh the token
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokenData.refresh_token,
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
          }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        const newTokens: GoogleTokenResponse = await refreshResponse.json();
        const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

        // Update tokens in database
        await supabaseAdmin
          .from('youtube_oauth_tokens')
          .update({
            access_token: newTokens.access_token,
            expires_at: expiresAt.toISOString(),
            scope: newTokens.scope,
          })
          .eq('user_id', userId);

        return new Response(
          JSON.stringify({ 
            success: true,
            expiresAt: expiresAt.toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        // Check connection status
        if (!userId) {
          return new Response(
            JSON.stringify({ connected: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: tokenData } = await supabaseAdmin
          .from('youtube_oauth_tokens')
          .select('expires_at, channel_id, channel_name')
          .eq('user_id', userId)
          .single();

        const connected = tokenData && new Date(tokenData.expires_at) > new Date();

        return new Response(
          JSON.stringify({ 
            connected,
            channelId: tokenData?.channel_id,
            channelName: tokenData?.channel_name,
            expiresAt: tokenData?.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disconnect': {
        // Disconnect YouTube
        if (!userId) {
          throw new Error('User must be authenticated');
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        await supabaseAdmin
          .from('youtube_oauth_tokens')
          .delete()
          .eq('user_id', userId);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('YouTube OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
