import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY');
const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

interface TikTokUserInfo {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  display_name?: string;
  is_verified?: boolean;
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
        const body = await req.json().catch(() => ({}));
        const redirectUri = body.redirect_uri || `${url.origin}/tiktok-oauth?action=callback`;
        const state = crypto.randomUUID();
        const codeVerifier = crypto.randomUUID() + crypto.randomUUID(); // Simple PKCE
        
        // Generate code challenge (S256)
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // TikTok OAuth scopes for Business
        const scopes = [
          'user.info.basic',
          'user.info.profile',
          'user.info.stats',
          'video.list',
          'video.publish',
          'video.upload'
        ].join(',');

        const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
        authUrl.searchParams.set('client_key', TIKTOK_CLIENT_KEY!);
        authUrl.searchParams.set('scope', scopes);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');

        console.log('[tiktok-oauth] Generated auth URL for user:', userId);

        return new Response(
          JSON.stringify({ 
            authUrl: authUrl.toString(),
            state,
            codeVerifier // Store this for the callback
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        const body = await req.json();
        const { code, redirect_uri, code_verifier } = body;

        if (!code) {
          throw new Error('Authorization code is required');
        }

        if (!userId) {
          throw new Error('User must be authenticated');
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_key: TIKTOK_CLIENT_KEY!,
            client_secret: TIKTOK_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri,
            code_verifier: code_verifier || ''
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('[tiktok-oauth] Token error:', errorText);
          throw new Error(`Failed to exchange code: ${errorText}`);
        }

        const tokens: TikTokTokenResponse = await tokenResponse.json();

        // Get user info
        const userInfoResponse = await fetch(
          'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,is_verified',
          {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
            },
          }
        );

        let userInfo: TikTokUserInfo | null = null;
        if (userInfoResponse.ok) {
          const userData = await userInfoResponse.json();
          userInfo = userData.data?.user;
        }

        // Check if business account (simplified check)
        const isBusinessAccount = userInfo?.is_verified || false;

        // Store tokens in database
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        const { error: upsertError } = await supabaseAdmin
          .from('tiktok_oauth_tokens')
          .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: expiresAt.toISOString(),
            open_id: tokens.open_id,
            display_name: userInfo?.display_name || null,
            avatar_url: userInfo?.avatar_url || null,
            is_business_account: isBusinessAccount,
            business_info: {
              union_id: userInfo?.union_id,
              is_verified: userInfo?.is_verified,
              scope: tokens.scope
            }
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error('[tiktok-oauth] Error storing tokens:', upsertError);
          throw new Error('Failed to store tokens');
        }

        console.log(`✅ [tiktok-oauth] Tokens stored for user: ${userId}, display_name: ${userInfo?.display_name}`);

        return new Response(
          JSON.stringify({ 
            success: true,
            openId: tokens.open_id,
            displayName: userInfo?.display_name,
            isBusinessAccount,
            expiresAt: expiresAt.toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh': {
        if (!userId) {
          throw new Error('User must be authenticated');
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: tokenData, error: fetchError } = await supabaseAdmin
          .from('tiktok_oauth_tokens')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError || !tokenData?.refresh_token) {
          throw new Error('No refresh token available');
        }

        // Refresh the token
        const refreshResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_key: TIKTOK_CLIENT_KEY!,
            client_secret: TIKTOK_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: tokenData.refresh_token
          }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        const newTokens: TikTokTokenResponse = await refreshResponse.json();
        const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

        // Update tokens in database
        await supabaseAdmin
          .from('tiktok_oauth_tokens')
          .update({
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || tokenData.refresh_token,
            expires_at: expiresAt.toISOString(),
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
        if (!userId) {
          return new Response(
            JSON.stringify({ connected: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: tokenData } = await supabaseAdmin
          .from('tiktok_oauth_tokens')
          .select('expires_at, display_name, is_business_account, business_info')
          .eq('user_id', userId)
          .single();

        const connected = tokenData && new Date(tokenData.expires_at) > new Date();

        return new Response(
          JSON.stringify({ 
            connected,
            displayName: tokenData?.display_name,
            isBusinessAccount: tokenData?.is_business_account,
            businessInfo: tokenData?.business_info,
            expiresAt: tokenData?.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disconnect': {
        if (!userId) {
          throw new Error('User must be authenticated');
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        await supabaseAdmin
          .from('tiktok_oauth_tokens')
          .delete()
          .eq('user_id', userId);

        console.log(`[tiktok-oauth] Disconnected for user: ${userId}`);

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
    console.error('[tiktok-oauth] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
