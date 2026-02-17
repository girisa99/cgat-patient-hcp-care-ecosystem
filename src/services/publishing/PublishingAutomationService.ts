/**
 * Publishing Automation Service
 * Handles automated publishing to YouTube, TikTok, LinkedIn, etc.
 * Ready for n8n/Zapier webhook integration
 */

export interface PublishingJob {
  id: string;
  status: 'pending' | 'scheduled' | 'publishing' | 'complete' | 'failed';
  platform: PublishingPlatform;
  content: PublishingContent;
  schedule?: Date;
  webhookUrl?: string;
  result?: PublishingResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublishingContent {
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  hashtags?: string[];
  visibility: 'public' | 'private' | 'unlisted';
  category?: string;
}

export interface PublishingResult {
  platformId: string;
  url: string;
  publishedAt: Date;
  analytics?: {
    views?: number;
    likes?: number;
    shares?: number;
  };
}

export type PublishingPlatform = 
  | 'youtube' 
  | 'tiktok' 
  | 'linkedin' 
  | 'instagram' 
  | 'twitter' 
  | 'facebook';

export interface PlatformConfig {
  id: PublishingPlatform;
  name: string;
  icon: string;
  maxTitleLength: number;
  maxDescriptionLength: number;
  maxTags: number;
  supportsScheduling: boolean;
  supportsShorts: boolean;
  webhookTemplate: WebhookTemplate;
}

export interface WebhookTemplate {
  n8n: string;
  zapier: string;
  make: string;
}

// Platform configurations
export const PLATFORM_CONFIGS: Record<PublishingPlatform, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    maxTitleLength: 100,
    maxDescriptionLength: 5000,
    maxTags: 500,
    supportsScheduling: true,
    supportsShorts: true,
    webhookTemplate: {
      n8n: 'youtube-upload-workflow',
      zapier: 'youtube-upload',
      make: 'youtube-scenario',
    },
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    maxTitleLength: 150,
    maxDescriptionLength: 2200,
    maxTags: 100,
    supportsScheduling: true,
    supportsShorts: true,
    webhookTemplate: {
      n8n: 'tiktok-upload-workflow',
      zapier: 'tiktok-upload',
      make: 'tiktok-scenario',
    },
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    maxTitleLength: 200,
    maxDescriptionLength: 3000,
    maxTags: 30,
    supportsScheduling: true,
    supportsShorts: false,
    webhookTemplate: {
      n8n: 'linkedin-post-workflow',
      zapier: 'linkedin-post',
      make: 'linkedin-scenario',
    },
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    maxTitleLength: 0, // No title for reels
    maxDescriptionLength: 2200,
    maxTags: 30,
    supportsScheduling: true,
    supportsShorts: true,
    webhookTemplate: {
      n8n: 'instagram-reels-workflow',
      zapier: 'instagram-reels',
      make: 'instagram-scenario',
    },
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: '𝕏',
    maxTitleLength: 0,
    maxDescriptionLength: 280,
    maxTags: 10,
    supportsScheduling: true,
    supportsShorts: true,
    webhookTemplate: {
      n8n: 'twitter-video-workflow',
      zapier: 'twitter-video',
      make: 'twitter-scenario',
    },
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    maxTitleLength: 255,
    maxDescriptionLength: 63206,
    maxTags: 30,
    supportsScheduling: true,
    supportsShorts: true,
    webhookTemplate: {
      n8n: 'facebook-video-workflow',
      zapier: 'facebook-video',
      make: 'facebook-scenario',
    },
  },
};

// n8n Workflow Templates
export interface N8nWorkflowTemplate {
  id: string;
  name: string;
  platform: PublishingPlatform;
  description: string;
  nodes: N8nNode[];
  connections: N8nConnection[];
}

export interface N8nNode {
  id: string;
  type: string;
  name: string;
  position: [number, number];
  parameters: Record<string, unknown>;
}

export interface N8nConnection {
  source: string;
  target: string;
}

// Pre-built n8n workflow templates
export const N8N_WORKFLOW_TEMPLATES: N8nWorkflowTemplate[] = [
  {
    id: 'youtube-upload-complete',
    name: 'YouTube Complete Upload',
    platform: 'youtube',
    description: 'Upload video to YouTube with metadata, thumbnail, and scheduling',
    nodes: [
      {
        id: 'webhook',
        type: 'n8n-nodes-base.webhook',
        name: 'Genie Webhook',
        position: [250, 300],
        parameters: {
          httpMethod: 'POST',
          path: 'genie-youtube-upload',
          responseMode: 'onReceived',
        },
      },
      {
        id: 'http-download',
        type: 'n8n-nodes-base.httpRequest',
        name: 'Download Video',
        position: [450, 300],
        parameters: {
          method: 'GET',
          url: '={{ $json.videoUrl }}',
          responseFormat: 'file',
        },
      },
      {
        id: 'youtube-upload',
        type: 'n8n-nodes-base.youTube',
        name: 'Upload to YouTube',
        position: [650, 300],
        parameters: {
          operation: 'upload',
          title: '={{ $json.title }}',
          description: '={{ $json.description }}',
          privacyStatus: '={{ $json.visibility }}',
          tags: '={{ $json.tags }}',
          categoryId: '={{ $json.categoryId || "22" }}',
        },
      },
      {
        id: 'set-thumbnail',
        type: 'n8n-nodes-base.youTube',
        name: 'Set Thumbnail',
        position: [850, 300],
        parameters: {
          operation: 'updateThumbnail',
          videoId: '={{ $json.id }}',
        },
      },
      {
        id: 'respond-webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        name: 'Send Response',
        position: [1050, 300],
        parameters: {
          respondWith: 'json',
          responseBody: {
            success: true,
            videoId: '={{ $json.id }}',
            url: '=https://youtube.com/watch?v={{ $json.id }}',
          },
        },
      },
    ],
    connections: [
      { source: 'webhook', target: 'http-download' },
      { source: 'http-download', target: 'youtube-upload' },
      { source: 'youtube-upload', target: 'set-thumbnail' },
      { source: 'set-thumbnail', target: 'respond-webhook' },
    ],
  },
  {
    id: 'tiktok-upload-complete',
    name: 'TikTok Video Upload',
    platform: 'tiktok',
    description: 'Upload video to TikTok with caption and hashtags',
    nodes: [
      {
        id: 'webhook',
        type: 'n8n-nodes-base.webhook',
        name: 'Genie Webhook',
        position: [250, 300],
        parameters: {
          httpMethod: 'POST',
          path: 'genie-tiktok-upload',
        },
      },
      {
        id: 'tiktok-upload',
        type: 'n8n-nodes-base.httpRequest',
        name: 'TikTok API Upload',
        position: [450, 300],
        parameters: {
          method: 'POST',
          url: 'https://open.tiktokapis.com/v2/post/publish/video/init/',
          authentication: 'oAuth2',
          body: {
            post_info: {
              title: '={{ $json.title }}',
              privacy_level: '={{ $json.visibility }}',
            },
            source_info: {
              source: 'PULL_FROM_URL',
              video_url: '={{ $json.videoUrl }}',
            },
          },
        },
      },
      {
        id: 'respond-webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        name: 'Send Response',
        position: [650, 300],
        parameters: {
          respondWith: 'json',
        },
      },
    ],
    connections: [
      { source: 'webhook', target: 'tiktok-upload' },
      { source: 'tiktok-upload', target: 'respond-webhook' },
    ],
  },
  {
    id: 'linkedin-post-complete',
    name: 'LinkedIn Video Post',
    platform: 'linkedin',
    description: 'Post video to LinkedIn with professional formatting',
    nodes: [
      {
        id: 'webhook',
        type: 'n8n-nodes-base.webhook',
        name: 'Genie Webhook',
        position: [250, 300],
        parameters: {
          httpMethod: 'POST',
          path: 'genie-linkedin-post',
        },
      },
      {
        id: 'linkedin-post',
        type: 'n8n-nodes-base.linkedIn',
        name: 'Create LinkedIn Post',
        position: [450, 300],
        parameters: {
          operation: 'createPost',
          text: '={{ $json.description }}\n\n{{ $json.hashtags }}',
          mediaCategory: 'VIDEO',
          mediaUrl: '={{ $json.videoUrl }}',
        },
      },
      {
        id: 'respond-webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        name: 'Send Response',
        position: [650, 300],
        parameters: {
          respondWith: 'json',
        },
      },
    ],
    connections: [
      { source: 'webhook', target: 'linkedin-post' },
      { source: 'linkedin-post', target: 'respond-webhook' },
    ],
  },
  {
    id: 'multi-platform-publish',
    name: 'Multi-Platform Publish',
    platform: 'youtube', // Primary
    description: 'Publish to multiple platforms simultaneously',
    nodes: [
      {
        id: 'webhook',
        type: 'n8n-nodes-base.webhook',
        name: 'Genie Multi-Publish',
        position: [250, 300],
        parameters: {
          httpMethod: 'POST',
          path: 'genie-multi-publish',
        },
      },
      {
        id: 'split-platforms',
        type: 'n8n-nodes-base.switch',
        name: 'Route by Platform',
        position: [450, 300],
        parameters: {
          rules: [
            { value: 'youtube', output: 0 },
            { value: 'tiktok', output: 1 },
            { value: 'linkedin', output: 2 },
          ],
        },
      },
      // Platform-specific nodes would follow...
    ],
    connections: [
      { source: 'webhook', target: 'split-platforms' },
    ],
  },
];

/**
 * Publishing Automation Service
 */
export class PublishingAutomationService {
  private webhookBaseUrl: string;

  constructor(webhookBaseUrl?: string) {
    this.webhookBaseUrl = webhookBaseUrl || '';
  }

  /**
   * Trigger publishing via webhook (n8n, Zapier, Make)
   */
  async triggerPublish(
    platform: PublishingPlatform,
    content: PublishingContent,
    webhookUrl: string,
    schedule?: Date
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    console.log(`[PublishingAutomation] Triggering ${platform} publish via webhook`);

    const config = PLATFORM_CONFIGS[platform];
    
    // Validate content against platform limits
    if (content.title && content.title.length > config.maxTitleLength) {
      return { success: false, error: `Title exceeds ${config.maxTitleLength} characters for ${platform}` };
    }
    if (content.description.length > config.maxDescriptionLength) {
      return { success: false, error: `Description exceeds ${config.maxDescriptionLength} characters for ${platform}` };
    }

    const payload = {
      platform,
      content: {
        ...content,
        // Ensure hashtags are formatted correctly
        hashtags: content.hashtags?.map(h => h.startsWith('#') ? h : `#${h}`),
      },
      schedule: schedule?.toISOString(),
      metadata: {
        source: 'genie-studio',
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors', // Handle CORS for webhooks
        body: JSON.stringify(payload),
      });

      // With no-cors, we can't read the response, but the request was sent
      return {
        success: true,
        jobId: `job-${Date.now()}`,
      };
    } catch (error) {
      console.error('[PublishingAutomation] Webhook error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook trigger failed',
      };
    }
  }

  /**
   * Get n8n workflow template for a platform
   */
  getN8nTemplate(platform: PublishingPlatform): N8nWorkflowTemplate | undefined {
    return N8N_WORKFLOW_TEMPLATES.find(t => t.platform === platform);
  }

  /**
   * Export n8n workflow as JSON (for import into n8n)
   */
  exportN8nWorkflow(template: N8nWorkflowTemplate): string {
    const workflow = {
      name: template.name,
      nodes: template.nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        typeVersion: 1,
        position: node.position,
        parameters: node.parameters,
      })),
      connections: template.connections.reduce((acc, conn) => {
        if (!acc[conn.source]) acc[conn.source] = { main: [[]] as Array<Array<{ node: string; type: string; index: number }>> };
        (acc[conn.source].main as Array<Array<{ node: string; type: string; index: number }>>)[0].push({ node: conn.target, type: 'main', index: 0 });
        return acc;
      }, {} as Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }>),
      active: false,
      settings: {},
      tags: ['genie-studio', 'publishing-automation'],
    };

    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Get platform configuration
   */
  getPlatformConfig(platform: PublishingPlatform): PlatformConfig {
    return PLATFORM_CONFIGS[platform];
  }

  /**
   * Validate content for a platform
   */
  validateContent(platform: PublishingPlatform, content: PublishingContent): { valid: boolean; errors: string[] } {
    const config = PLATFORM_CONFIGS[platform];
    const errors: string[] = [];

    if (config.maxTitleLength > 0 && content.title) {
      if (content.title.length > config.maxTitleLength) {
        errors.push(`Title exceeds ${config.maxTitleLength} characters`);
      }
    }

    if (content.description.length > config.maxDescriptionLength) {
      errors.push(`Description exceeds ${config.maxDescriptionLength} characters`);
    }

    if (content.tags && content.tags.length > config.maxTags) {
      errors.push(`Too many tags (max ${config.maxTags})`);
    }

    return { valid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const publishingAutomation = new PublishingAutomationService();
