import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID');
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface LinkedInProfileResponse {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
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
        // Generate LinkedIn OAuth URL
        const redirectUri = url.searchParams.get('redirect_uri') || `${url.origin}/linkedin-oauth?action=callback`;
        const state = crypto.randomUUID();
        
        const scopes = [
          'openid',
          'profile',
          'email',
          'w_member_social',        // Required for personal posting
          'r_organization_social',  // Read company pages
          'w_organization_social'   // Post to company pages
        ].join(' ');

        const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID!);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('scope', scopes);

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
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri,
            client_id: LINKEDIN_CLIENT_ID!,
            client_secret: LINKEDIN_CLIENT_SECRET!,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('LinkedIn token error:', errorText);
          throw new Error(`Failed to exchange code: ${errorText}`);
        }

        const tokens: LinkedInTokenResponse = await tokenResponse.json();

        // Get user profile to get LinkedIn ID
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });

        let linkedinId = null;
        let profileName = null;
        if (profileResponse.ok) {
          const profile: LinkedInProfileResponse = await profileResponse.json();
          linkedinId = profile.sub;
          profileName = profile.name;
        }

        // Get company pages the user can post on
        let companyPages: Array<{ id: string; name: string; logoUrl?: string }> = [];
        try {
          const orgsResponse = await fetch(
            'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~(localizedName,logoV2(original~:playableStreams))))',
            {
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
              },
            }
          );
          
          if (orgsResponse.ok) {
            const orgsData = await orgsResponse.json();
            companyPages = (orgsData.elements || []).map((el: any) => ({
              id: el.organizationalTarget?.split(':').pop() || '',
              name: el['organizationalTarget~']?.localizedName || 'Unknown Company',
              logoUrl: el['organizationalTarget~']?.logoV2?.['original~']?.elements?.[0]?.identifiers?.[0]?.identifier
            })).filter((p: any) => p.id);
          }
        } catch (e) {
          console.log('Could not fetch company pages:', e);
        }

        // Store tokens in database
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        const { error: upsertError } = await supabaseAdmin
          .from('linkedin_oauth_tokens')
          .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || null,
            expires_at: expiresAt.toISOString(),
            scope: tokens.scope,
            linkedin_id: linkedinId,
            profile_name: profileName,
            company_pages: companyPages
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error('Error storing tokens:', upsertError);
          throw new Error('Failed to store tokens');
        }

        console.log('✅ LinkedIn OAuth tokens stored for user:', userId);

        return new Response(
          JSON.stringify({ 
            success: true,
            linkedinId,
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
          .from('linkedin_oauth_tokens')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError || !tokenData?.refresh_token) {
          throw new Error('No refresh token available');
        }

        // Refresh the token
        const refreshResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokenData.refresh_token,
            client_id: LINKEDIN_CLIENT_ID!,
            client_secret: LINKEDIN_CLIENT_SECRET!,
          }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        const newTokens: LinkedInTokenResponse = await refreshResponse.json();
        const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

        // Update tokens in database
        await supabaseAdmin
          .from('linkedin_oauth_tokens')
          .update({
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || tokenData.refresh_token,
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
          .from('linkedin_oauth_tokens')
          .select('expires_at')
          .eq('user_id', userId)
          .single();

        const connected = tokenData && new Date(tokenData.expires_at) > new Date();

        return new Response(
          JSON.stringify({ 
            connected,
            expiresAt: tokenData?.expires_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disconnect': {
        // Disconnect LinkedIn
        if (!userId) {
          throw new Error('User must be authenticated');
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        await supabaseAdmin
          .from('linkedin_oauth_tokens')
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
    console.error('LinkedIn OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
