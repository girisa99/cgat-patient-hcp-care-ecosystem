/**
 * Centralized configuration for all shareable presentations
 * Supports images, videos, and rich media for LinkedIn/social sharing
 */

export type MediaType = 'image' | 'video' | 'gif';

export interface MediaAsset {
  type: MediaType;
  url: string; // Filename in /public/ or full URL
  thumbnail?: string; // Thumbnail image for videos
  alt?: string;
  width?: number;
  height?: number;
  duration?: number; // Video duration in seconds
}

export interface PresentationShareConfig {
  id: string;
  title: string;
  description: string;
  ogImage: string; // Primary OG image for social cards
  ogVideo?: string; // Optional video for platforms that support it
  presentationPath: string;
  media?: MediaAsset; // Primary media (image, video, gif)
  stats?: {
    value: string;
    label: string;
  }[];
  ctaText?: string;
  author?: string;
  tags?: string[]; // Hashtags for sharing
  category?: string;
}

export const PRESENTATION_SHARE_CONFIGS: Record<string, PresentationShareConfig> = {
  'document-processing': {
    id: 'document-processing',
    title: 'AI Document Processing Platform | Genie AI',
    description: 'Revolutionize your document processing with multi-model AI. 95%+ accuracy, 75x faster processing, 99% cost reduction.',
    ogImage: 'og-document-processing.png',
    presentationPath: '/public/presentation/document-processing',
    media: {
      type: 'image',
      url: 'og-document-processing.png',
      alt: 'AI Document Processing - Multi-model AI for healthcare automation',
      width: 1200,
      height: 640
    },
    stats: [
      { value: '95%+', label: 'Accuracy' },
      { value: '75x', label: 'Faster' },
      { value: '99%', label: 'Cost Reduction' }
    ],
    ctaText: 'View Interactive Presentation →',
    author: 'Genie AI',
    tags: ['AI', 'Healthcare', 'Automation', 'DocumentProcessing', 'Lovable'],
    category: 'Healthcare AI'
  },
  
  // Template for new presentations:
  // 'your-presentation-id': {
  //   id: 'your-presentation-id',
  //   title: 'Your Presentation Title | Genie AI',
  //   description: 'Description for social sharing (150-160 chars ideal)',
  //   ogImage: 'og-your-presentation.png', // 1200x640 image
  //   ogVideo: 'og-your-presentation.mp4', // Optional video
  //   presentationPath: '/public/presentation/your-presentation',
  //   media: {
  //     type: 'video', // 'image' | 'video' | 'gif'
  //     url: 'your-video.mp4',
  //     thumbnail: 'og-your-presentation.png',
  //     duration: 30
  //   },
  //   stats: [{ value: '99%', label: 'Accuracy' }],
  //   ctaText: 'View Demo →',
  //   author: 'Genie AI',
  //   tags: ['AI', 'Healthcare'],
  //   category: 'Healthcare AI'
  // },
};

/**
 * Get the full share URL for a presentation (static HTML page with OG tags)
 * This is the URL that should be shared on social media to get proper previews
 */
export const getShareUrl = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string => {
  // Use static HTML share page which has OG meta tags for social previews
  return `${baseUrl}/share/${presentationId}.html`;
};

/**
 * Get the OG image URL for a presentation
 */
export const getOgImageUrl = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string => {
  const config = PRESENTATION_SHARE_CONFIGS[presentationId];
  if (!config) return `${baseUrl}/og-default.png`;
  return `${baseUrl}/${config.ogImage}`;
};

/**
 * Get the media URL (image, video, gif) for a presentation
 */
export const getMediaUrl = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string | null => {
  const config = PRESENTATION_SHARE_CONFIGS[presentationId];
  if (!config?.media) return null;
  // If URL is absolute, return as-is
  if (config.media.url.startsWith('http')) return config.media.url;
  return `${baseUrl}/${config.media.url}`;
};

/**
 * Generate LinkedIn share URL with proper parameters
 */
export const generateLinkedInShareUrl = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string => {
  const shareUrl = getShareUrl(presentationId, baseUrl);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
};

/**
 * Generate share post content for clipboard with hashtags
 */
export const generateSharePostContent = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string => {
  const config = PRESENTATION_SHARE_CONFIGS[presentationId];
  if (!config) return '';
  
  const publicUrl = `${baseUrl}${config.presentationPath}`;
  const statsText = config.stats?.map(s => `✅ ${s.value} ${s.label}`).join('\n') || '';
  const hashtags = config.tags?.map(t => `#${t}`).join(' ') || '#AI #Healthcare #Automation #Lovable';
  
  return `🚀 ${config.title.replace(' | Genie AI', '')}

${statsText}

🔗 View the interactive presentation:
${publicUrl}

Built with @Lovable AI!

${hashtags}`;
};

/**
 * Get all media-related information for a presentation
 */
export const getPresentationMedia = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com') => {
  const config = PRESENTATION_SHARE_CONFIGS[presentationId];
  if (!config) return null;
  
  return {
    ogImage: getOgImageUrl(presentationId, baseUrl),
    media: config.media ? {
      ...config.media,
      url: config.media.url.startsWith('http') ? config.media.url : `${baseUrl}/${config.media.url}`,
      thumbnail: config.media.thumbnail 
        ? (config.media.thumbnail.startsWith('http') ? config.media.thumbnail : `${baseUrl}/${config.media.thumbnail}`)
        : undefined
    } : null,
    ogVideo: config.ogVideo ? `${baseUrl}/${config.ogVideo}` : null
  };
};

export default PRESENTATION_SHARE_CONFIGS;
