import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SocialPlatform = 'linkedin' | 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'facebook' | 'bluesky';

interface CompanyPage {
  id: string;
  name: string;
  logoUrl?: string;
  platform?: string;
}

interface BusinessAccount {
  instagram_id?: string;
  username?: string;
  profile_picture_url?: string;
  facebook_page_id?: string;
  facebook_page_name?: string;
}

interface ConnectionStatus {
  connected: boolean;
  expiresAt?: string;
  channelName?: string;
  channelId?: string;
  profileName?: string;
  linkedinId?: string;
  companyPages?: CompanyPage[];
  // Instagram-specific
  username?: string;
  businessAccounts?: BusinessAccount[];
  // TikTok-specific
  displayName?: string;
  isBusinessAccount?: boolean;
  openId?: string;
}

interface UseSocialOAuthReturn {
  connections: Record<SocialPlatform, ConnectionStatus>;
  isLoading: boolean;
  isConnecting: SocialPlatform | null;
  connect: (platform: SocialPlatform) => Promise<void>;
  disconnect: (platform: SocialPlatform) => Promise<void>;
  refreshStatus: () => Promise<void>;
  // Aggregated company pages across all platforms
  allCompanyPages: CompanyPage[];
}

export const useSocialOAuth = (): UseSocialOAuthReturn => {
  const [connections, setConnections] = useState<Record<SocialPlatform, ConnectionStatus>>({
    linkedin: { connected: false },
    youtube: { connected: false },
    tiktok: { connected: false },
    twitter: { connected: false },
    instagram: { connected: false },
    facebook: { connected: false },
    bluesky: { connected: false }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<SocialPlatform | null>(null);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Check LinkedIn status - query from DB directly for company pages
      const { data: linkedinTokens } = await supabase
        .from('linkedin_oauth_tokens')
        .select('expires_at, linkedin_id, profile_name, company_pages')
        .eq('user_id', session.user.id)
        .single();

      // Check YouTube status from DB
      const { data: youtubeTokens } = await supabase
        .from('youtube_oauth_tokens')
        .select('expires_at, channel_id, channel_name')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Check Instagram status from DB
      const { data: instagramTokens } = await supabase
        .from('instagram_oauth_tokens')
        .select('expires_at, username, business_accounts')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Check TikTok status from DB
      const { data: tiktokTokens } = await supabase
        .from('tiktok_oauth_tokens')
        .select('expires_at, display_name, is_business_account, open_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const linkedinConnected = linkedinTokens && new Date(linkedinTokens.expires_at) > new Date();
      const youtubeConnected = youtubeTokens && new Date(youtubeTokens.expires_at) > new Date();
      const instagramConnected = instagramTokens && new Date(instagramTokens.expires_at) > new Date();
      const tiktokConnected = tiktokTokens && new Date(tiktokTokens.expires_at) > new Date();

      setConnections(prev => ({
        ...prev,
        linkedin: {
          connected: linkedinConnected || false,
          expiresAt: linkedinTokens?.expires_at,
          linkedinId: linkedinTokens?.linkedin_id,
          profileName: linkedinTokens?.profile_name,
          companyPages: (linkedinTokens?.company_pages as unknown as CompanyPage[])?.map(p => ({
            ...p,
            platform: 'linkedin'
          })) || []
        },
        youtube: {
          connected: youtubeConnected || false,
          expiresAt: youtubeTokens?.expires_at,
          channelId: youtubeTokens?.channel_id,
          channelName: youtubeTokens?.channel_name,
          // YouTube brand channels as company pages
          companyPages: youtubeTokens?.channel_id ? [{
            id: youtubeTokens.channel_id,
            name: youtubeTokens.channel_name || 'YouTube Channel',
            platform: 'youtube'
          }] : []
        },
        instagram: {
          connected: instagramConnected || false,
          expiresAt: instagramTokens?.expires_at,
          username: instagramTokens?.username,
          businessAccounts: (instagramTokens?.business_accounts as unknown as BusinessAccount[]) || [],
          companyPages: ((instagramTokens?.business_accounts as unknown as BusinessAccount[]) || []).map(acc => ({
            id: acc.instagram_id || '',
            name: acc.username || acc.facebook_page_name || 'Instagram Business',
            logoUrl: acc.profile_picture_url,
            platform: 'instagram'
          }))
        },
        tiktok: {
          connected: tiktokConnected || false,
          expiresAt: tiktokTokens?.expires_at,
          displayName: tiktokTokens?.display_name,
          isBusinessAccount: tiktokTokens?.is_business_account,
          openId: tiktokTokens?.open_id,
          // TikTok business accounts as company pages
          companyPages: tiktokTokens?.is_business_account ? [{
            id: tiktokTokens.open_id || '',
            name: tiktokTokens.display_name || 'TikTok Business',
            platform: 'tiktok'
          }] : []
        }
      }));
    } catch (error) {
      console.error('Error checking social connection status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connect = useCallback(async (platform: SocialPlatform) => {
    setIsConnecting(platform);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to connect social accounts');
        return;
      }

      const redirectUri = `${window.location.origin}/social-oauth-callback?platform=${platform}`;

      if (platform === 'linkedin') {
        // Get LinkedIn auth URL
        const { data, error } = await supabase.functions.invoke('linkedin-oauth?action=auth-url', {
          body: { redirect_uri: redirectUri },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (error) throw error;
        
        // Store state for verification
        sessionStorage.setItem('linkedin_oauth_state', data.state);
        sessionStorage.setItem('linkedin_redirect_uri', redirectUri);
        
        // Redirect to LinkedIn
        window.location.href = data.authUrl;
        
      } else if (platform === 'youtube') {
        // Get YouTube auth URL (using Google OAuth with YouTube scopes)
        const { data, error } = await supabase.functions.invoke('youtube-oauth?action=auth-url', {
          body: { redirect_uri: redirectUri },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (error) throw error;
        
        // Store state for verification
        sessionStorage.setItem('youtube_oauth_state', data.state);
        sessionStorage.setItem('youtube_redirect_uri', redirectUri);
        
        // Redirect to Google
        window.location.href = data.authUrl;
        
      } else if (platform === 'instagram') {
        // Get Instagram auth URL (uses Facebook Graph API)
        const { data, error } = await supabase.functions.invoke('instagram-oauth?action=auth-url', {
          body: { redirect_uri: redirectUri },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (error) throw error;
        
        sessionStorage.setItem('instagram_oauth_state', data.state);
        sessionStorage.setItem('instagram_redirect_uri', redirectUri);
        
        window.location.href = data.authUrl;
        
      } else if (platform === 'tiktok') {
        // Get TikTok auth URL
        const { data, error } = await supabase.functions.invoke('tiktok-oauth?action=auth-url', {
          body: { redirect_uri: redirectUri },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (error) throw error;
        
        sessionStorage.setItem('tiktok_oauth_state', data.state);
        sessionStorage.setItem('tiktok_redirect_uri', redirectUri);
        sessionStorage.setItem('tiktok_code_verifier', data.codeVerifier);
        
        window.location.href = data.authUrl;
        
      } else {
        // Other platforms not yet implemented
        toast.info(`${platform} connection coming soon!`);
      }
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      toast.error(`Failed to connect ${platform}`);
    } finally {
      setIsConnecting(null);
    }
  }, []);

  const disconnect = useCallback(async (platform: SocialPlatform) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const functionMap: Partial<Record<SocialPlatform, string>> = {
        linkedin: 'linkedin-oauth',
        youtube: 'youtube-oauth',
        instagram: 'instagram-oauth',
        tiktok: 'tiktok-oauth'
      };

      const functionName = functionMap[platform];
      if (functionName) {
        await supabase.functions.invoke(`${functionName}?action=disconnect`, {
          body: {},
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
      }

      setConnections(prev => ({
        ...prev,
        [platform]: { connected: false, companyPages: [] }
      }));

      toast.success(`Disconnected from ${platform}`);
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      toast.error(`Failed to disconnect ${platform}`);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    await checkConnectionStatus();
  }, [checkConnectionStatus]);

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  // Aggregate all company pages across platforms
  const allCompanyPages: CompanyPage[] = useMemo(() => {
    const pages: CompanyPage[] = [];
    Object.values(connections).forEach(conn => {
      if (conn.companyPages) {
        pages.push(...conn.companyPages);
      }
    });
    return pages;
  }, [connections]);

  return {
    connections,
    isLoading,
    isConnecting,
    connect,
    disconnect,
    refreshStatus,
    allCompanyPages
  };
};

// Helper hook for handling OAuth callback
export const useSocialOAuthCallback = () => {
  const handleCallback = useCallback(async (platform: SocialPlatform, code: string, state: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const storedState = sessionStorage.getItem(`${platform}_oauth_state`);
      const redirectUri = sessionStorage.getItem(`${platform}_redirect_uri`);

      if (state !== storedState) {
        throw new Error('Invalid OAuth state');
      }

      // Map platforms to their OAuth edge functions
      const functionMap: Partial<Record<SocialPlatform, string>> = {
        linkedin: 'linkedin-oauth',
        youtube: 'youtube-oauth',
        instagram: 'instagram-oauth',
        tiktok: 'tiktok-oauth'
      };

      const functionName = functionMap[platform];
      if (!functionName) {
        throw new Error(`OAuth not implemented for ${platform}`);
      }

      // Build callback body (TikTok needs code_verifier for PKCE)
      const callbackBody: Record<string, string> = { 
        code, 
        redirect_uri: redirectUri || '' 
      };
      
      if (platform === 'tiktok') {
        const codeVerifier = sessionStorage.getItem('tiktok_code_verifier');
        if (codeVerifier) {
          callbackBody.code_verifier = codeVerifier;
        }
      }

      const { data, error } = await supabase.functions.invoke(`${functionName}?action=callback`, {
        body: callbackBody,
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      // Clean up stored state
      sessionStorage.removeItem(`${platform}_oauth_state`);
      sessionStorage.removeItem(`${platform}_redirect_uri`);
      if (platform === 'tiktok') {
        sessionStorage.removeItem('tiktok_code_verifier');
      }

      toast.success(`Successfully connected to ${platform}!`);
      
      return data;
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error(`Failed to complete ${platform} connection`);
      throw error;
    }
  }, []);

  return { handleCallback };
};
