import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID') || '';
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'authorize': {
        // Generate OAuth authorization URL
        const redirectUri = `${SUPABASE_URL}/functions/v1/linkedin-oauth?action=callback`;
        const state = crypto.randomUUID();
        const scope = 'openid profile email w_member_social';
        
        const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('scope', scope);

        // Store state with user ID for verification
        await supabaseClient.from('linkedin_oauth_tokens').upsert({
          user_id: user.id,
          access_token: 'pending',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          scope: state // Temporarily store state
        });

        return new Response(
          JSON.stringify({ authUrl: authUrl.toString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        // Handle OAuth callback
        const { code, state } = body;
        const redirectUri = `${SUPABASE_URL}/functions/v1/linkedin-oauth?action=callback`;

        // Exchange code for token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange failed:', errorText);
          return new Response(
            JSON.stringify({ error: 'Token exchange failed', details: errorText }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenData: LinkedInTokenResponse = await tokenResponse.json();

        // Store tokens
        await supabaseClient.from('linkedin_oauth_tokens').upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          scope: tokenData.scope,
        });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check': {
        // Check if user has valid LinkedIn token
        const { data: tokenData } = await supabaseClient
          .from('linkedin_oauth_tokens')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!tokenData || tokenData.access_token === 'pending') {
          return new Response(
            JSON.stringify({ connected: false, needsAuth: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const isExpired = new Date(tokenData.expires_at) < new Date();
        
        return new Response(
          JSON.stringify({ connected: !isExpired, needsAuth: isExpired }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'post': {
        const { content, url, imageUrl } = body;

        // Get user's token
        const { data: tokenData } = await supabaseClient
          .from('linkedin_oauth_tokens')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!tokenData || tokenData.access_token === 'pending') {
          return new Response(
            JSON.stringify({ needsAuth: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's LinkedIn URN
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          return new Response(
            JSON.stringify({ needsAuth: true, error: 'Token expired' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const profile = await profileResponse.json();
        const personUrn = `urn:li:person:${profile.sub}`;

        // Create post with link preview
        const postBody = {
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content
              },
              shareMediaCategory: url ? 'ARTICLE' : 'NONE',
              ...(url && {
                media: [{
                  status: 'READY',
                  originalUrl: url,
                  ...(imageUrl && { thumbnails: [{ url: imageUrl }] })
                }]
              })
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        };

        const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify(postBody),
        });

        if (!postResponse.ok) {
          const errorText = await postResponse.text();
          console.error('Post failed:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to post', details: errorText }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const postResult = await postResponse.json();

        return new Response(
          JSON.stringify({ success: true, postId: postResult.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disconnect': {
        // Remove LinkedIn connection
        await supabaseClient
          .from('linkedin_oauth_tokens')
          .delete()
          .eq('user_id', user.id);

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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
