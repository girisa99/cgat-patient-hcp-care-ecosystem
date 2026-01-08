/**
 * Centralized configuration for all shareable presentations
 * Add new presentations here to enable LinkedIn/social sharing with proper OG tags
 */

export interface PresentationShareConfig {
  id: string;
  title: string;
  description: string;
  ogImage: string; // Filename in /public/ folder (e.g., "og-document-processing.png")
  presentationPath: string; // Internal route to the actual presentation
  stats?: {
    value: string;
    label: string;
  }[];
  ctaText?: string;
  author?: string;
}

export const PRESENTATION_SHARE_CONFIGS: Record<string, PresentationShareConfig> = {
  'document-processing': {
    id: 'document-processing',
    title: 'AI Document Processing Platform | Genie AI',
    description: 'Revolutionize your document processing with multi-model AI. 95%+ accuracy, 75x faster processing, 99% cost reduction.',
    ogImage: 'og-document-processing.png',
    presentationPath: '/public/presentation/document-processing',
    stats: [
      { value: '95%+', label: 'Accuracy' },
      { value: '75x', label: 'Faster' },
      { value: '99%', label: 'Cost Reduction' }
    ],
    ctaText: 'View Interactive Presentation →',
    author: 'Genie AI'
  },
  
  // Add more presentations here as needed:
  // 'prescription-processing': {
  //   id: 'prescription-processing',
  //   title: 'AI Prescription Processing | Genie AI',
  //   description: 'Intelligent prescription extraction and validation with multi-model AI.',
  //   ogImage: 'og-prescription-processing.png',
  //   presentationPath: '/public/presentation/prescription-processing',
  //   stats: [
  //     { value: '98%', label: 'Accuracy' },
  //     { value: '50x', label: 'Faster' },
  //     { value: '85%', label: 'Cost Savings' }
  //   ],
  //   ctaText: 'View Prescription Demo →',
  //   author: 'Genie AI'
  // },
};

/**
 * Get the full share URL for a presentation
 */
export const getShareUrl = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string => {
  return `${baseUrl}/api/share/${presentationId}`;
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
 * Generate LinkedIn share URL with proper parameters
 */
export const generateLinkedInShareUrl = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string => {
  const shareUrl = getShareUrl(presentationId, baseUrl);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
};

/**
 * Generate share post content for clipboard
 */
export const generateSharePostContent = (presentationId: string, baseUrl: string = 'https://genieaiexpermentationhub.com'): string => {
  const config = PRESENTATION_SHARE_CONFIGS[presentationId];
  if (!config) return '';
  
  const publicUrl = `${baseUrl}${config.presentationPath}`;
  const statsText = config.stats?.map(s => `✅ ${s.value} ${s.label}`).join('\n') || '';
  
  return `🚀 ${config.title.replace(' | Genie AI', '')}

${statsText}

🔗 View the interactive presentation:
${publicUrl}

Built with @Lovable AI!

#AI #Healthcare #Automation #Lovable`;
};

export default PRESENTATION_SHARE_CONFIGS;
