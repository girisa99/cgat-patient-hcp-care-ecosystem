import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Instagram uses Facebook Graph API for Business accounts
const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID');
const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface InstagramBusinessAccount {
  id: string;
  username: string;
  profile_picture_url?: string;
  name?: string;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: InstagramBusinessAccount;
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
        const redirectUri = body.redirect_uri || `${url.origin}/instagram-oauth?action=callback`;
        const state = crypto.randomUUID();
        
        // Facebook OAuth scopes for Instagram Business
        const scopes = [
          'instagram_basic',
          'instagram_content_publish',
          'instagram_manage_comments',
          'instagram_manage_insights',
          'pages_show_list',
          'pages_read_engagement',
          'business_management'
        ].join(',');

        const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
        authUrl.searchParams.set('client_id', FACEBOOK_APP_ID!);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('scope', scopes);
        authUrl.searchParams.set('response_type', 'code');

        console.log('[instagram-oauth] Generated auth URL for user:', userId);

        return new Response(
          JSON.stringify({ 
            authUrl: authUrl.toString(),
            state 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        const body = await req.json();
        const { code, redirect_uri } = body;

        if (!code) {
          throw new Error('Authorization code is required');
        }

        if (!userId) {
          throw new Error('User must be authenticated');
        }

        // Exchange code for short-lived token
        const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
        tokenUrl.searchParams.set('client_id', FACEBOOK_APP_ID!);
        tokenUrl.searchParams.set('client_secret', FACEBOOK_APP_SECRET!);
        tokenUrl.searchParams.set('redirect_uri', redirect_uri);
        tokenUrl.searchParams.set('code', code);

        const tokenResponse = await fetch(tokenUrl.toString());

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('[instagram-oauth] Token error:', errorText);
          throw new Error(`Failed to exchange code: ${errorText}`);
        }

        const tokenData: FacebookTokenResponse = await tokenResponse.json();

        // Exchange for long-lived token
        const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
        longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
        longLivedUrl.searchParams.set('client_id', FACEBOOK_APP_ID!);
        longLivedUrl.searchParams.set('client_secret', FACEBOOK_APP_SECRET!);
        longLivedUrl.searchParams.set('fb_exchange_token', tokenData.access_token);

        const longLivedResponse = await fetch(longLivedUrl.toString());
        const longLivedData: FacebookTokenResponse = await longLivedResponse.json();

        const accessToken = longLivedData.access_token || tokenData.access_token;
        const expiresIn = longLivedData.expires_in || 60 * 24 * 60 * 60; // Default 60 days

        // Get Facebook pages with Instagram Business accounts
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url,name}&access_token=${accessToken}`
        );

        const pagesData = await pagesResponse.json();
        const pages: FacebookPage[] = pagesData.data || [];

        // Find Instagram Business accounts
        const businessAccounts: Array<{
          instagram_id: string;
          username: string;
          profile_picture_url?: string;
          facebook_page_id: string;
          facebook_page_name: string;
          page_access_token: string;
        }> = [];

        for (const page of pages) {
          if (page.instagram_business_account) {
            businessAccounts.push({
              instagram_id: page.instagram_business_account.id,
              username: page.instagram_business_account.username,
              profile_picture_url: page.instagram_business_account.profile_picture_url,
              facebook_page_id: page.id,
              facebook_page_name: page.name,
              page_access_token: page.access_token
            });
          }
        }

        const primaryAccount = businessAccounts[0];

        // Store tokens in database
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        const { error: upsertError } = await supabaseAdmin
          .from('instagram_oauth_tokens')
          .upsert({
            user_id: userId,
            access_token: accessToken,
            expires_at: expiresAt.toISOString(),
            instagram_user_id: primaryAccount?.instagram_id || null,
            username: primaryAccount?.username || null,
            profile_picture_url: primaryAccount?.profile_picture_url || null,
            facebook_page_id: primaryAccount?.facebook_page_id || null,
            facebook_page_name: primaryAccount?.facebook_page_name || null,
            business_accounts: businessAccounts
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error('[instagram-oauth] Error storing tokens:', upsertError);
          throw new Error('Failed to store tokens');
        }

        console.log(`✅ [instagram-oauth] Tokens stored for user: ${userId}, ${businessAccounts.length} business accounts found`);

        return new Response(
          JSON.stringify({ 
            success: true,
            username: primaryAccount?.username,
            businessAccountsCount: businessAccounts.length,
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
          .from('instagram_oauth_tokens')
          .select('expires_at, username, business_accounts')
          .eq('user_id', userId)
          .single();

        const connected = tokenData && new Date(tokenData.expires_at) > new Date();

        return new Response(
          JSON.stringify({ 
            connected,
            username: tokenData?.username,
            businessAccounts: tokenData?.business_accounts || [],
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
          .from('instagram_oauth_tokens')
          .delete()
          .eq('user_id', userId);

        console.log(`[instagram-oauth] Disconnected for user: ${userId}`);

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
    console.error('[instagram-oauth] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
