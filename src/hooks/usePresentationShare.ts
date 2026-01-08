import { toast } from 'sonner';
import { 
  PRESENTATION_SHARE_CONFIGS, 
  generateLinkedInShareUrl, 
  generateSharePostContent,
  getShareUrl,
  getOgImageUrl
} from '@/config/presentationShareConfig';

const BASE_URL = 'https://genieaiexpermentationhub.com';

interface UsePresentationShareOptions {
  presentationId: string;
  baseUrl?: string;
}

/**
 * Hook for standardized presentation sharing across LinkedIn and other platforms
 * 
 * Usage:
 * ```tsx
 * const { shareToLinkedIn, copyLink, getShareUrls } = usePresentationShare({
 *   presentationId: 'document-processing'
 * });
 * 
 * // In your component:
 * <Button onClick={shareToLinkedIn}>Share on LinkedIn</Button>
 * ```
 */
export const usePresentationShare = ({ 
  presentationId, 
  baseUrl = BASE_URL 
}: UsePresentationShareOptions) => {
  
  const config = PRESENTATION_SHARE_CONFIGS[presentationId];
  
  /**
   * Get all share-related URLs for this presentation
   */
  const getShareUrls = () => ({
    sharePageUrl: getShareUrl(presentationId, baseUrl),
    ogImageUrl: getOgImageUrl(presentationId, baseUrl),
    linkedInShareUrl: generateLinkedInShareUrl(presentationId, baseUrl),
    presentationUrl: config ? `${baseUrl}${config.presentationPath}` : baseUrl
  });
  
  /**
   * Share to LinkedIn with proper OG tags
   * - Copies post content to clipboard
   * - Opens LinkedIn share dialog with share page URL (has OG tags)
   */
  const shareToLinkedIn = async () => {
    if (!config) {
      toast.error('Presentation not configured for sharing');
      console.error(`Presentation "${presentationId}" not found in PRESENTATION_SHARE_CONFIGS`);
      return;
    }
    
    const postContent = generateSharePostContent(presentationId, baseUrl);
    const urls = getShareUrls();
    
    try {
      // Copy post content to clipboard
      await navigator.clipboard.writeText(postContent);
      toast.success('✅ LinkedIn post copied to clipboard!', {
        description: 'Paste (Ctrl+V / Cmd+V) in the LinkedIn composer.',
        duration: 6000
      });
    } catch (err) {
      console.error('Clipboard error:', err);
      toast.info('📋 Copy this post manually', {
        description: postContent.substring(0, 100) + '...',
        duration: 8000
      });
    }
    
    // Open LinkedIn share dialog with proper share page URL
    window.open(urls.linkedInShareUrl, '_blank', 'width=600,height=600');
  };
  
  /**
   * Copy the shareable link to clipboard
   */
  const copyLink = async () => {
    if (!config) {
      toast.error('Presentation not configured');
      return;
    }
    
    const urls = getShareUrls();
    
    try {
      await navigator.clipboard.writeText(urls.presentationUrl);
      toast.success('✅ Link copied!', {
        description: urls.presentationUrl,
        duration: 4000
      });
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };
  
  /**
   * Copy the share page URL (with OG tags) for social sharing
   */
  const copySharePageUrl = async () => {
    if (!config) {
      toast.error('Presentation not configured');
      return;
    }
    
    const urls = getShareUrls();
    
    try {
      await navigator.clipboard.writeText(urls.sharePageUrl);
      toast.success('✅ Share page URL copied!', {
        description: 'Use this URL for social media sharing (has preview image)',
        duration: 4000
      });
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };
  
  /**
   * Open the presentation in a new tab
   */
  const openPresentation = () => {
    if (!config) {
      toast.error('Presentation not configured');
      return;
    }
    
    const urls = getShareUrls();
    window.open(urls.presentationUrl, '_blank');
  };
  
  /**
   * Share to Twitter/X
   */
  const shareToTwitter = async () => {
    if (!config) {
      toast.error('Presentation not configured');
      return;
    }
    
    const urls = getShareUrls();
    const text = encodeURIComponent(`🚀 ${config.title}\n\n${config.description}\n\n`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(urls.sharePageUrl)}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };
  
  return {
    config,
    shareToLinkedIn,
    copyLink,
    copySharePageUrl,
    openPresentation,
    shareToTwitter,
    getShareUrls,
    isConfigured: !!config
  };
};

export default usePresentationShare;
