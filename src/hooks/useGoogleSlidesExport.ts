/**
 * Google Slides Export Hook
 * Handles OAuth connection and export functionality for Genie Deck
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SlideData {
  title?: string;
  type?: string;
  layout?: string;
  content?: {
    body?: string;
    keyPoints?: string[];
    hook?: any;
    cta?: any;
  };
  speakerNotes?: string;
  visualUrl?: string;
}

export interface GoogleSlidesExportResult {
  success: boolean;
  presentationId?: string;
  url?: string;
  slideCount?: number;
  error?: string;
}

export const useGoogleSlidesExport = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Check if user has Google Slides connected
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsConnected(false);
        return false;
      }

      const { data, error } = await supabase.functions.invoke(
        'google-slides-export?action=check-connection',
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      if (error) throw error;

      const connected = data?.connected ?? false;
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Error checking Google Slides connection:', error);
      setIsConnected(false);
      return false;
    }
  }, []);

  // Initiate Google OAuth for Slides
  const connectGoogleSlides = useCallback(async (): Promise<void> => {
    try {
      setIsConnecting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to connect Google Slides');
        return;
      }

      // Get current URL for redirect
      const redirectUri = `${window.location.origin}/oauth/google-slides/callback`;

      const { data, error } = await supabase.functions.invoke(
        'google-slides-export?action=auth-url',
        {
          body: { redirect_uri: redirectUri },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      if (error) throw error;

      if (data?.authUrl) {
        // Store state for verification
        sessionStorage.setItem('google_slides_oauth_state', data.state);
        sessionStorage.setItem('google_slides_redirect_uri', redirectUri);

        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting Google Slides:', error);
      toast.error('Failed to connect Google Slides');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (
    code: string,
    state: string
  ): Promise<boolean> => {
    try {
      const storedState = sessionStorage.getItem('google_slides_oauth_state');
      const redirectUri = sessionStorage.getItem('google_slides_redirect_uri');

      if (state !== storedState) {
        throw new Error('Invalid OAuth state');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke(
        'google-slides-export?action=callback',
        {
          body: { code, redirect_uri: redirectUri },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      if (error) throw error;

      // Clean up stored state
      sessionStorage.removeItem('google_slides_oauth_state');
      sessionStorage.removeItem('google_slides_redirect_uri');

      setIsConnected(true);
      toast.success('Successfully connected Google Slides!');
      return true;
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error('Failed to complete Google Slides connection');
      return false;
    }
  }, []);

  // Export slides to Google Slides
  const exportToGoogleSlides = useCallback(async (
    slides: SlideData[],
    title: string,
    folderId?: string
  ): Promise<GoogleSlidesExportResult> => {
    try {
      setIsExporting(true);
      setExportProgress(10);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to export');
      }

      // Check connection first
      const connected = await checkConnection();
      if (!connected) {
        return {
          success: false,
          error: 'Google Slides not connected. Please connect your Google account first.'
        };
      }

      setExportProgress(30);

      // Transform slides to API format
      const transformedSlides = slides.map((slide, index) => ({
        title: slide.title || `Slide ${index + 1}`,
        type: slide.type || slide.layout || 'content',
        content: slide.content,
        speakerNotes: slide.speakerNotes,
        visualUrl: slide.visualUrl,
      }));

      setExportProgress(50);

      const { data, error } = await supabase.functions.invoke(
        'google-slides-export?action=export',
        {
          body: {
            slides: transformedSlides,
            title: title || 'Genie Deck Presentation',
            folderId,
          },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      setExportProgress(90);

      if (error) throw error;

      if (data?.success) {
        setExportProgress(100);
        toast.success('Exported to Google Slides!', {
          description: `${data.slideCount} slides created`,
          action: {
            label: 'Open',
            onClick: () => window.open(data.url, '_blank'),
          },
        });

        return {
          success: true,
          presentationId: data.presentationId,
          url: data.url,
          slideCount: data.slideCount,
        };
      }

      throw new Error(data?.error || 'Export failed');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export to Google Slides', {
        description: error.message,
      });
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [checkConnection]);

  // Disconnect Google Slides
  const disconnectGoogleSlides = useCallback(async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Delete token from database
      const { error } = await supabase
        .from('google_slides_tokens')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      setIsConnected(false);
      toast.success('Disconnected from Google Slides');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    isExporting,
    exportProgress,
    checkConnection,
    connectGoogleSlides,
    handleOAuthCallback,
    exportToGoogleSlides,
    disconnectGoogleSlides,
  };
};
