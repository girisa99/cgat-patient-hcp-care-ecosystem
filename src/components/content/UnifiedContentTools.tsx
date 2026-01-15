/**
 * Unified Content Tools Panel
 * 
 * Consolidates all content creation and optimization tools:
 * - SEO Optimization
 * - Auto Thumbnails
 * - Social Cuts
 * - Bulk Processing
 * - Innovative Publishing
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Image, 
  Scissors, 
  Layers, 
  Sparkles,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';

// Sub-panels
import SEOOptimizerPanel from './tools/SEOOptimizerPanel';
import ThumbnailGeneratorPanel from './tools/ThumbnailGeneratorPanel';
import SocialCutsPanel from './tools/SocialCutsPanel';
import InnovativePublishingPanel from './tools/InnovativePublishingPanel';
import BulkContentPanel from './tools/BulkContentPanel';

interface UnifiedContentToolsProps {
  contentId?: string;
  contentTitle?: string;
  contentDescription?: string;
  videoUrl?: string;
  onToolComplete?: (tool: string, result: any) => void;
}

const UnifiedContentTools: React.FC<UnifiedContentToolsProps> = ({
  contentId,
  contentTitle = '',
  contentDescription = '',
  videoUrl,
  onToolComplete
}) => {
  const [activeTab, setActiveTab] = useState('seo');

  const tools = [
    { 
      id: 'seo', 
      label: 'SEO', 
      icon: Search, 
      description: 'Optimize titles, tags & descriptions',
      badge: 'AI'
    },
    { 
      id: 'thumbnails', 
      label: 'Thumbnails', 
      icon: Image, 
      description: 'Generate click-worthy thumbnails',
      badge: 'AI'
    },
    { 
      id: 'social-cuts', 
      label: 'Social Cuts', 
      icon: Scissors, 
      description: 'Auto-cut for TikTok, Reels, Shorts',
      badge: 'NEW'
    },
    { 
      id: 'publish', 
      label: 'Publish+', 
      icon: Sparkles, 
      description: 'Creative publishing formats',
      badge: 'HOT'
    },
    { 
      id: 'bulk', 
      label: 'Bulk', 
      icon: Layers, 
      description: 'Process multiple items at once'
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Content Tools
          </h2>
          <p className="text-sm text-muted-foreground">
            Optimize, create, and publish your content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            5 Tools
          </Badge>
        </div>
      </div>

      {/* Tool Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
          {tools.map(tool => (
            <TabsTrigger
              key={tool.id}
              value={tool.id}
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4"
            >
              <div className="flex items-center gap-2">
                <tool.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tool.label}</span>
                {tool.badge && (
                  <Badge 
                    variant={tool.badge === 'HOT' ? 'destructive' : tool.badge === 'NEW' ? 'default' : 'secondary'}
                    className="text-[10px] px-1 py-0"
                  >
                    {tool.badge}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tool Content */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="seo" className="m-0 h-full">
            <SEOOptimizerPanel 
              title={contentTitle}
              description={contentDescription}
              onOptimize={(result) => onToolComplete?.('seo', result)}
            />
          </TabsContent>

          <TabsContent value="thumbnails" className="m-0 h-full">
            <ThumbnailGeneratorPanel 
              title={contentTitle}
              description={contentDescription}
              videoUrl={videoUrl}
              onGenerate={(result) => onToolComplete?.('thumbnails', result)}
            />
          </TabsContent>

          <TabsContent value="social-cuts" className="m-0 h-full">
            <SocialCutsPanel 
              contentId={contentId}
              videoUrl={videoUrl}
              onCutsGenerated={(result) => onToolComplete?.('social-cuts', result)}
            />
          </TabsContent>

          <TabsContent value="publish" className="m-0 h-full">
            <InnovativePublishingPanel 
              contentId={contentId}
              title={contentTitle}
              description={contentDescription}
              onPublish={(result) => onToolComplete?.('publish', result)}
            />
          </TabsContent>

          <TabsContent value="bulk" className="m-0 h-full">
            <BulkContentPanel 
              onJobCreated={(result) => onToolComplete?.('bulk', result)}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UnifiedContentTools;
