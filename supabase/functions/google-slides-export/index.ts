/**
 * Google Slides Export Edge Function
 * Exports Genie Deck presentations to Google Slides using existing OAuth
 * 
 * Actions:
 * - auth-url: Get OAuth URL with Slides scope
 * - callback: Handle OAuth callback and store tokens
 * - export: Create Google Slides presentation from slides data
 * - check-connection: Verify if user has valid Google Slides token
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

// Google Slides API scopes
const GOOGLE_SLIDES_SCOPES = [
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'export';

    console.log(`[Google Slides Export] Action: ${action}`);

    switch (action) {
      case 'auth-url':
        return await handleAuthUrl(req, url);
      case 'callback':
        return await handleCallback(req);
      case 'export':
        return await handleExport(req);
      case 'check-connection':
        return await handleCheckConnection(req);
      case 'download-pdf':
        return await handleDownloadPdf(req);
      case 'list-folders':
        return await handleListFolders(req);
      case 'get-presentation':
        return await handleGetPresentation(req);
      case 'publish-social':
        return await handlePublishToSocial(req);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error('[Google Slides Export] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate OAuth URL with Slides scope
async function handleAuthUrl(req: Request, url: URL): Promise<Response> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID not configured');
  }

  const redirectUri = url.searchParams.get('redirect_uri') || 
    `${SUPABASE_URL}/functions/v1/google-slides-export?action=callback`;
  const state = crypto.randomUUID();

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_SLIDES_SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  console.log('[Auth URL] Generated for Google Slides');

  return new Response(
    JSON.stringify({ authUrl: authUrl.toString(), state }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle OAuth callback
async function handleCallback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const redirectUri = url.searchParams.get('redirect_uri') || 
    `${SUPABASE_URL}/functions/v1/google-slides-export?action=callback`;

  if (!code) {
    // Check for body
    const body = await req.json().catch(() => ({}));
    if (!body.code) {
      throw new Error('Authorization code not provided');
    }
    return await processCallback(body.code, body.redirect_uri || redirectUri, req);
  }

  return await processCallback(code, redirectUri, req);
}

async function processCallback(code: string, redirectUri: string, req: Request): Promise<Response> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('[Callback] Token exchange failed:', error);
    throw new Error('Failed to exchange authorization code');
  }

  const tokens = await tokenResponse.json();
  console.log('[Callback] Token exchange successful');

  // Get user ID from auth header
  const authHeader = req.headers.get('authorization');
  let userId: string | null = null;

  if (authHeader) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id || null;
  }

  if (!userId) {
    // Try to extract from state or use anonymous storage
    console.warn('[Callback] No user ID found, tokens will need manual association');
  }

  // Store tokens
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  if (userId) {
    const { error: upsertError } = await supabaseAdmin
      .from('google_slides_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: expiresAt.toISOString(),
        scope: tokens.scope,
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('[Callback] Token storage error:', upsertError);
      // Don't fail - return success with token for client-side handling
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      expiresAt: expiresAt.toISOString(),
      hasRefreshToken: !!tokens.refresh_token,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Check if user has valid connection
async function handleCheckConnection(req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ connected: false, reason: 'Not authenticated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) {
    return new Response(
      JSON.stringify({ connected: false, reason: 'Invalid token' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check for stored tokens
  const { data: tokenData } = await supabase
    .from('google_slides_tokens')
    .select('expires_at, refresh_token')
    .eq('user_id', user.id)
    .single();

  if (!tokenData) {
    return new Response(
      JSON.stringify({ connected: false, reason: 'No Google Slides connection' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const isExpired = new Date(tokenData.expires_at) < new Date();
  const canRefresh = !!tokenData.refresh_token;

  return new Response(
    JSON.stringify({ 
      connected: !isExpired || canRefresh,
      expired: isExpired,
      canRefresh,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Export presentation to Google Slides
async function handleExport(req: Request): Promise<Response> {
  const body = await req.json();
  const { slides, title, folderId } = body;

  if (!slides || !Array.isArray(slides)) {
    throw new Error('Slides data is required');
  }

  // Get user token
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const userToken = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(userToken);

  if (!user) {
    throw new Error('Invalid authentication');
  }

  // Get Google access token
  const accessToken = await getValidAccessToken(user.id, supabase);

  console.log(`[Export] Creating presentation with ${slides.length} slides`);

  // Create presentation
  const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title || 'Genie Deck Presentation',
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error('[Export] Create presentation failed:', error);
    throw new Error('Failed to create Google Slides presentation');
  }

  const presentation = await createResponse.json();
  const presentationId = presentation.presentationId;
  console.log(`[Export] Created presentation: ${presentationId}`);

  // Build batch update requests
  const requests = buildSlideRequests(slides, presentation);

  // Apply slide content
  if (requests.length > 0) {
    const batchResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!batchResponse.ok) {
      const error = await batchResponse.text();
      console.error('[Export] Batch update failed:', error);
      // Continue anyway - presentation was created
    }
  }

  // Optionally move to folder
  if (folderId) {
    await moveToFolder(presentationId, folderId, accessToken);
  }

  const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;
  console.log(`[Export] Presentation URL: ${presentationUrl}`);

  return new Response(
    JSON.stringify({
      success: true,
      presentationId,
      url: presentationUrl,
      slideCount: slides.length,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get valid access token, refreshing if needed
async function getValidAccessToken(userId: string, supabase: any): Promise<string> {
  const { data: tokenData, error } = await supabase
    .from('google_slides_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    throw new Error('Google Slides not connected. Please connect your Google account first.');
  }

  const isExpired = new Date(tokenData.expires_at) < new Date();

  if (!isExpired) {
    return tokenData.access_token;
  }

  // Refresh token
  if (!tokenData.refresh_token) {
    throw new Error('Token expired and no refresh token available. Please reconnect.');
  }

  console.log('[Token] Refreshing expired token');

  const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh token. Please reconnect.');
  }

  const newTokens = await refreshResponse.json();
  const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

  // Update stored token
  await supabase
    .from('google_slides_tokens')
    .update({
      access_token: newTokens.access_token,
      expires_at: expiresAt.toISOString(),
    })
    .eq('user_id', userId);

  return newTokens.access_token;
}

// Build Google Slides API requests from slide data
function buildSlideRequests(slides: any[], presentation: any): any[] {
  const requests: any[] = [];
  const existingSlideIds = presentation.slides?.map((s: any) => s.objectId) || [];

  slides.forEach((slide, index) => {
    // Create new slide (except for first which exists)
    if (index > 0 || existingSlideIds.length === 0) {
      const slideId = `slide_${index}_${Date.now()}`;
      requests.push({
        createSlide: {
          objectId: slideId,
          insertionIndex: index,
          slideLayoutReference: {
            predefinedLayout: getLayoutForSlide(slide),
          },
        },
      });
    }

    const targetSlideId = index === 0 && existingSlideIds.length > 0 
      ? existingSlideIds[0] 
      : `slide_${index}_${Date.now()}`;

    // Add title
    if (slide.title) {
      const titleId = `title_${index}_${Date.now()}`;
      requests.push({
        createShape: {
          objectId: titleId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: targetSlideId,
            size: { width: { magnitude: 600, unit: 'PT' }, height: { magnitude: 50, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: 'PT' },
          },
        },
      });
      requests.push({
        insertText: {
          objectId: titleId,
          text: slide.title,
        },
      });
    }

    // Add content/body text
    const content = slide.content?.body || slide.content?.keyPoints?.join('\n• ') || '';
    if (content) {
      const contentId = `content_${index}_${Date.now()}`;
      requests.push({
        createShape: {
          objectId: contentId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: targetSlideId,
            size: { width: { magnitude: 600, unit: 'PT' }, height: { magnitude: 300, unit: 'PT' } },
            transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 100, unit: 'PT' },
          },
        },
      });
      requests.push({
        insertText: {
          objectId: contentId,
          text: content,
        },
      });
    }

    // Add speaker notes
    if (slide.speakerNotes) {
      requests.push({
        createParagraphBullets: {
          objectId: targetSlideId,
          textRange: { type: 'ALL' },
          bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
        },
      });
    }
  });

  return requests;
}

// Map slide type to Google Slides layout
function getLayoutForSlide(slide: any): string {
  const type = slide.type || slide.layout || 'content';
  
  const layoutMap: Record<string, string> = {
    'title': 'TITLE',
    'title-slide': 'TITLE',
    'section': 'SECTION_HEADER',
    'section-header': 'SECTION_HEADER',
    'content': 'TITLE_AND_BODY',
    'two-column': 'TITLE_AND_TWO_COLUMNS',
    'comparison': 'TITLE_AND_TWO_COLUMNS',
    'blank': 'BLANK',
    'cta': 'TITLE_AND_BODY',
    'hook': 'TITLE',
    'quote': 'TITLE',
    'image': 'CAPTION_ONLY',
  };

  return layoutMap[type] || 'TITLE_AND_BODY';
}

// Move presentation to a specific folder
async function moveToFolder(presentationId: string, folderId: string, accessToken: string): Promise<void> {
  try {
    // Get current parents
    const getResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${presentationId}?fields=parents`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!getResponse.ok) return;

    const file = await getResponse.json();
    const previousParents = file.parents?.join(',') || '';

    // Move to new folder
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${presentationId}?addParents=${folderId}&removeParents=${previousParents}`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    console.log(`[Export] Moved presentation to folder: ${folderId}`);
  } catch (error) {
    console.warn('[Export] Could not move to folder:', error);
  }
}

// Download presentation as PDF
async function handleDownloadPdf(req: Request): Promise<Response> {
  const body = await req.json();
  const { presentationId } = body;

  if (!presentationId) {
    throw new Error('Presentation ID is required');
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const userToken = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(userToken);

  if (!user) {
    throw new Error('Invalid authentication');
  }

  const accessToken = await getValidAccessToken(user.id, supabase);

  console.log(`[PDF] Downloading presentation ${presentationId} as PDF`);

  // Export as PDF using Google Drive API
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${presentationId}/export?mimeType=application/pdf`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[PDF] Export failed:', error);
    throw new Error('Failed to export presentation as PDF');
  }

  // Return PDF as base64 for client download
  const pdfBuffer = await response.arrayBuffer();
  const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

  return new Response(
    JSON.stringify({
      success: true,
      pdfBase64,
      mimeType: 'application/pdf',
      filename: `presentation_${presentationId}.pdf`,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// List Google Drive folders for save location selection
async function handleListFolders(req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const userToken = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(userToken);

  if (!user) {
    throw new Error('Invalid authentication');
  }

  const accessToken = await getValidAccessToken(user.id, supabase);

  console.log('[Folders] Listing Google Drive folders');

  // Query for folders only
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,parents)&orderBy=name`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[Folders] List failed:', error);
    throw new Error('Failed to list folders');
  }

  const data = await response.json();

  return new Response(
    JSON.stringify({
      success: true,
      folders: data.files || [],
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get presentation details
async function handleGetPresentation(req: Request): Promise<Response> {
  const body = await req.json();
  const { presentationId } = body;

  if (!presentationId) {
    throw new Error('Presentation ID is required');
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const userToken = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(userToken);

  if (!user) {
    throw new Error('Invalid authentication');
  }

  const accessToken = await getValidAccessToken(user.id, supabase);

  // Get presentation metadata
  const response = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get presentation');
  }

  const presentation = await response.json();

  // Get thumbnail for each slide
  const thumbnails: string[] = [];
  for (const slide of presentation.slides || []) {
    try {
      const thumbResponse = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}/pages/${slide.objectId}/thumbnail`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );
      if (thumbResponse.ok) {
        const thumbData = await thumbResponse.json();
        thumbnails.push(thumbData.contentUrl);
      }
    } catch {
      thumbnails.push('');
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      title: presentation.title,
      slideCount: presentation.slides?.length || 0,
      presentationId,
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
      thumbnails,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Publish Google Slides to social platforms (LinkedIn/YouTube)
async function handlePublishToSocial(req: Request): Promise<Response> {
  const body = await req.json();
  const { presentationId, platform, metadata } = body;

  if (!presentationId || !platform) {
    throw new Error('Presentation ID and platform are required');
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const userToken = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(userToken);

  if (!user) {
    throw new Error('Invalid authentication');
  }

  const accessToken = await getValidAccessToken(user.id, supabase);

  console.log(`[Social] Publishing presentation ${presentationId} to ${platform}`);

  // First, export presentation as PDF for sharing
  const pdfResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${presentationId}/export?mimeType=application/pdf`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );

  if (!pdfResponse.ok) {
    throw new Error('Failed to export presentation for sharing');
  }

  const pdfBuffer = await pdfResponse.arrayBuffer();

  // Get presentation URL for sharing
  const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/view`;

  // Delegate to distribution-agent for actual publishing
  const SUPABASE_URL_ENV = Deno.env.get('SUPABASE_URL');
  
  const publishResponse = await fetch(
    `${SUPABASE_URL_ENV}/functions/v1/distribution-agent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        action: 'distribute',
        platform,
        videoUrl: presentationUrl, // Using presentation URL as content URL
        metadata: {
          ...metadata,
          title: metadata?.title || 'Presentation',
          description: metadata?.description || `View presentation: ${presentationUrl}`,
          type: 'document',
          presentationId,
          source: 'google_slides',
        },
        integrationMode: 'direct',
      }),
    }
  );

  if (!publishResponse.ok) {
    const error = await publishResponse.text();
    console.error(`[Social] Publish to ${platform} failed:`, error);
    throw new Error(`Failed to publish to ${platform}`);
  }

  const publishResult = await publishResponse.json();

  return new Response(
    JSON.stringify({
      success: true,
      platform,
      publishedUrl: publishResult.url,
      presentationUrl,
      metadata: publishResult.metadata,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
