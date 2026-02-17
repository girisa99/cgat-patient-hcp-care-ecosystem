/**
 * Google Slides Export Hook
 * Handles OAuth connection, export, PDF download, and social publishing
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

export interface GoogleDriveFolder {
  id: string;
  name: string;
  parents?: string[];
}

export interface GoogleSlidesExportResult {
  success: boolean;
  presentationId?: string;
  url?: string;
  slideCount?: number;
  error?: string;
}

export interface PublishResult {
  success: boolean;
  platform: string;
  publishedUrl?: string;
  presentationUrl?: string;
  error?: string;
}

export const useGoogleSlidesExport = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);

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
        sessionStorage.setItem('google_slides_oauth_state', data.state);
        sessionStorage.setItem('google_slides_redirect_uri', redirectUri);
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

  // List Google Drive folders
  const listDriveFolders = useCallback(async (): Promise<GoogleDriveFolder[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase.functions.invoke(
        'google-slides-export?action=list-folders',
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      if (error) throw error;

      const folderList = data?.folders || [];
      setFolders(folderList);
      return folderList;
    } catch (error) {
      console.error('Error listing folders:', error);
      return [];
    }
  }, []);

  // Export slides to Google Slides (saved directly to Drive)
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

      const connected = await checkConnection();
      if (!connected) {
        return {
          success: false,
          error: 'Google Slides not connected. Please connect your Google account first.'
        };
      }

      setExportProgress(30);

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
          description: `${data.slideCount} slides created in Google Drive`,
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

  // Download Google Slides as PDF
  const downloadAsPdf = useCallback(async (presentationId: string, filename?: string): Promise<boolean> => {
    try {
      setIsDownloading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to download');
      }

      toast.info('Generating PDF...', { duration: 2000 });

      const { data, error } = await supabase.functions.invoke(
        'google-slides-export?action=download-pdf',
        {
          body: { presentationId },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      if (error) throw error;

      if (data?.success && data.pdfBase64) {
        // Convert base64 to blob and download
        const byteCharacters = atob(data.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || data.filename || 'presentation.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('PDF downloaded successfully!');
        return true;
      }

      throw new Error('Failed to generate PDF');
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF', { description: error.message });
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Publish Google Slides to social platforms
  const publishToSocial = useCallback(async (
    presentationId: string,
    platform: 'linkedin' | 'youtube',
    metadata?: { title?: string; description?: string }
  ): Promise<PublishResult> => {
    try {
      setIsPublishing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to publish');
      }

      toast.info(`Publishing to ${platform}...`, { duration: 3000 });

      const { data, error } = await supabase.functions.invoke(
        'google-slides-export?action=publish-social',
        {
          body: { presentationId, platform, metadata },
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast.success(`Published to ${platform}!`, {
          description: 'Your presentation has been shared',
          action: data.publishedUrl ? {
            label: 'View',
            onClick: () => window.open(data.publishedUrl, '_blank'),
          } : undefined,
        });

        return {
          success: true,
          platform,
          publishedUrl: data.publishedUrl,
          presentationUrl: data.presentationUrl,
        };
      }

      throw new Error(data?.error || 'Publish failed');
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error(`Failed to publish to ${platform}`, { description: error.message });
      return {
        success: false,
        platform,
        error: error.message,
      };
    } finally {
      setIsPublishing(false);
    }
  }, []);

  // Disconnect Google Slides
  const disconnectGoogleSlides = useCallback(async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
    // Connection state
    isConnected,
    isConnecting,
    isExporting,
    isDownloading,
    isPublishing,
    exportProgress,
    folders,
    
    // Actions
    checkConnection,
    connectGoogleSlides,
    handleOAuthCallback,
    listDriveFolders,
    exportToGoogleSlides,
    downloadAsPdf,
    publishToSocial,
    disconnectGoogleSlides,
  };
};
