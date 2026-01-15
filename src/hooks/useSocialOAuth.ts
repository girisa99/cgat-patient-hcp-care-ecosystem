import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SocialPlatform = 'linkedin' | 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'facebook';

interface CompanyPage {
  id: string;
  name: string;
  logoUrl?: string;
}

interface ConnectionStatus {
  connected: boolean;
  expiresAt?: string;
  channelName?: string;
  channelId?: string;
  profileName?: string;
  linkedinId?: string;
  companyPages?: CompanyPage[];
}

interface UseSocialOAuthReturn {
  connections: Record<SocialPlatform, ConnectionStatus>;
  isLoading: boolean;
  isConnecting: SocialPlatform | null;
  connect: (platform: SocialPlatform) => Promise<void>;
  disconnect: (platform: SocialPlatform) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useSocialOAuth = (): UseSocialOAuthReturn => {
  const [connections, setConnections] = useState<Record<SocialPlatform, ConnectionStatus>>({
    linkedin: { connected: false },
    youtube: { connected: false },
    tiktok: { connected: false },
    twitter: { connected: false },
    instagram: { connected: false },
    facebook: { connected: false }
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
        .single();

      const linkedinConnected = linkedinTokens && new Date(linkedinTokens.expires_at) > new Date();
      const youtubeConnected = youtubeTokens && new Date(youtubeTokens.expires_at) > new Date();

      setConnections(prev => ({
        ...prev,
        linkedin: {
          connected: linkedinConnected || false,
          expiresAt: linkedinTokens?.expires_at,
          linkedinId: linkedinTokens?.linkedin_id,
          profileName: linkedinTokens?.profile_name,
          companyPages: (linkedinTokens?.company_pages as unknown as CompanyPage[]) || []
        },
        youtube: {
          connected: youtubeConnected || false,
          expiresAt: youtubeTokens?.expires_at,
          channelId: youtubeTokens?.channel_id,
          channelName: youtubeTokens?.channel_name
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

      if (platform === 'linkedin') {
        await supabase.functions.invoke('linkedin-oauth?action=disconnect', {
          body: {},
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
      } else if (platform === 'youtube') {
        await supabase.functions.invoke('youtube-oauth?action=disconnect', {
          body: {},
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
      }

      setConnections(prev => ({
        ...prev,
        [platform]: { connected: false }
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

  return {
    connections,
    isLoading,
    isConnecting,
    connect,
    disconnect,
    refreshStatus
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

      const functionName = platform === 'linkedin' ? 'linkedin-oauth' : 'youtube-oauth';

      const { data, error } = await supabase.functions.invoke(`${functionName}?action=callback`, {
        body: { code, redirect_uri: redirectUri },
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      // Clean up stored state
      sessionStorage.removeItem(`${platform}_oauth_state`);
      sessionStorage.removeItem(`${platform}_redirect_uri`);

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
