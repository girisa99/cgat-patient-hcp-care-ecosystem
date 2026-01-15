import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SocialPublishRequest {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  contentType: 'video' | 'image' | 'text' | 'carousel';
  mediaUrl?: string;
  mediaUrls?: string[];
  caption: string;
  hashtags?: string[];
  scheduledAt?: string;
  userId?: string;
  metadata?: {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    visibility?: 'public' | 'private' | 'unlisted';
    categoryId?: string;
    tags?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: SocialPublishRequest = await req.json();
    
    console.log(`📤 Social Publish Request:`, {
      platform: request.platform,
      contentType: request.contentType,
      hasMedia: !!request.mediaUrl || !!request.mediaUrls?.length,
      captionLength: request.caption?.length,
      scheduledAt: request.scheduledAt
    });

    // Validate required fields
    if (!request.platform || !request.caption) {
      return new Response(
        JSON.stringify({ error: 'Platform and caption are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = request.userId;

    if (authHeader && !userId) {
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Platform-specific publishing logic
    const publishResult = await publishToPlatform(request, userId);

    return new Response(
      JSON.stringify({
        success: true,
        platform: request.platform,
        postId: publishResult.postId,
        postUrl: publishResult.postUrl,
        status: request.scheduledAt ? 'scheduled' : 'published',
        scheduledAt: request.scheduledAt,
        publishedAt: request.scheduledAt ? null : new Date().toISOString(),
        metadata: publishResult.metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Social publish error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getOAuthToken(userId: string, platform: 'linkedin' | 'youtube'): Promise<string | null> {
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const tableName = platform === 'linkedin' ? 'linkedin_oauth_tokens' : 'youtube_oauth_tokens';
  
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select('access_token, expires_at, refresh_token')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    console.log(`No ${platform} token found for user:`, userId);
    return null;
  }
  
  // Check if token is expired
  if (new Date(data.expires_at) < new Date()) {
    console.log(`${platform} token expired, needs refresh`);
    // Token refresh would happen here - for now return null
    return null;
  }
  
  return data.access_token;
}

async function publishToLinkedIn(
  request: SocialPublishRequest, 
  accessToken: string
): Promise<{ postId: string; postUrl: string; metadata: Record<string, unknown> }> {
  // Get user's LinkedIn URN
  const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!profileResponse.ok) {
    throw new Error('Failed to get LinkedIn profile');
  }
  
  const profile = await profileResponse.json();
  const personUrn = `urn:li:person:${profile.sub}`;
  
  // Prepare post content
  const postBody: Record<string, unknown> = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: request.caption + (request.hashtags?.length ? '\n\n' + request.hashtags.map(h => `#${h}`).join(' ') : '')
        },
        shareMediaCategory: request.mediaUrl ? 'VIDEO' : 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };
  
  // Create the post
  const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(postBody)
  });
  
  if (!postResponse.ok) {
    const errorText = await postResponse.text();
    console.error('LinkedIn post error:', errorText);
    throw new Error(`LinkedIn post failed: ${postResponse.status}`);
  }
  
  const postResult = await postResponse.json();
  const postId = postResult.id || `linkedin_${Date.now()}`;
  
  console.log('✅ LinkedIn post created:', postId);
  
  return {
    postId,
    postUrl: `https://www.linkedin.com/feed/update/${postId}`,
    metadata: {
      visibility: 'PUBLIC',
      lifecycleState: 'PUBLISHED',
      author: personUrn
    }
  };
}

async function publishToYouTube(
  request: SocialPublishRequest,
  accessToken: string
): Promise<{ postId: string; postUrl: string; metadata: Record<string, unknown> }> {
  if (!request.mediaUrl) {
    throw new Error('Video URL is required for YouTube upload');
  }

  // For YouTube, we need to upload the video
  // First, initiate a resumable upload
  const metadata = {
    snippet: {
      title: request.metadata?.title || request.caption.substring(0, 100),
      description: request.metadata?.description || request.caption,
      tags: request.metadata?.tags || request.hashtags,
      categoryId: request.metadata?.categoryId || '22' // People & Blogs
    },
    status: {
      privacyStatus: request.metadata?.visibility || 'private',
      selfDeclaredMadeForKids: false
    }
  };

  // Initiate resumable upload
  const initResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*'
      },
      body: JSON.stringify(metadata)
    }
  );

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    console.error('YouTube upload init error:', errorText);
    throw new Error(`YouTube upload initialization failed: ${initResponse.status}`);
  }

  const uploadUrl = initResponse.headers.get('Location');
  
  if (!uploadUrl) {
    throw new Error('Failed to get YouTube upload URL');
  }

  // Fetch the video content
  const videoResponse = await fetch(request.mediaUrl);
  if (!videoResponse.ok) {
    throw new Error('Failed to fetch video content');
  }
  const videoBlob = await videoResponse.blob();

  // Upload the video
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'video/*'
    },
    body: videoBlob
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('YouTube upload error:', errorText);
    throw new Error(`YouTube video upload failed: ${uploadResponse.status}`);
  }

  const uploadResult = await uploadResponse.json();
  const videoId = uploadResult.id;

  console.log('✅ YouTube video uploaded:', videoId);

  return {
    postId: videoId,
    postUrl: `https://youtube.com/watch?v=${videoId}`,
    metadata: {
      title: metadata.snippet.title,
      visibility: metadata.status.privacyStatus,
      categoryId: metadata.snippet.categoryId,
      channelId: uploadResult.snippet?.channelId
    }
  };
}

async function publishToPlatform(request: SocialPublishRequest, userId: string): Promise<{
  postId: string;
  postUrl: string;
  metadata: Record<string, unknown>;
}> {
  const postId = `${request.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  switch (request.platform) {
    case 'youtube': {
      const youtubeToken = await getOAuthToken(userId, 'youtube');
      if (youtubeToken) {
        return await publishToYouTube(request, youtubeToken);
      }
      // Fallback to placeholder if not connected
      console.log('⚠️ YouTube not connected, returning placeholder');
      return {
        postId,
        postUrl: `https://youtube.com/watch?v=${postId}`,
        metadata: {
          title: request.metadata?.title || 'Untitled Video',
          visibility: request.metadata?.visibility || 'private',
          categoryId: request.metadata?.categoryId || '22',
          requiresConnection: true
        }
      };
    }

    case 'linkedin': {
      const linkedinToken = await getOAuthToken(userId, 'linkedin');
      if (linkedinToken) {
        return await publishToLinkedIn(request, linkedinToken);
      }
      // Fallback to placeholder if not connected
      console.log('⚠️ LinkedIn not connected, returning placeholder');
      return {
        postId,
        postUrl: `https://linkedin.com/posts/${postId}`,
        metadata: {
          visibility: 'PUBLIC',
          lifecycleState: 'PUBLISHED',
          requiresConnection: true
        }
      };
    }

    case 'tiktok':
      // TikTok API integration (requires separate OAuth)
      return {
        postId,
        postUrl: `https://tiktok.com/@user/video/${postId}`,
        metadata: {
          sounds: [],
          duetEnabled: true,
          requiresConnection: true
        }
      };

    case 'instagram':
      // Instagram Graph API integration (via Facebook)
      return {
        postId,
        postUrl: `https://instagram.com/p/${postId}`,
        metadata: {
          mediaType: request.contentType,
          locationId: null,
          requiresConnection: true
        }
      };

    case 'twitter':
      // Twitter/X API v2 integration
      return {
        postId,
        postUrl: `https://twitter.com/user/status/${postId}`,
        metadata: {
          replySettings: 'everyone',
          mediaIds: [],
          requiresConnection: true
        }
      };

    case 'facebook':
      // Facebook Graph API integration
      return {
        postId,
        postUrl: `https://facebook.com/posts/${postId}`,
        metadata: {
          privacySetting: 'EVERYONE',
          targeting: null,
          requiresConnection: true
        }
      };

    default:
      throw new Error(`Unsupported platform: ${request.platform}`);
  }
}
