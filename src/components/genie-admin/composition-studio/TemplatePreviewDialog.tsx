/**
 * TEMPLATE PREVIEW DIALOG
 * 
 * Shows detailed template information with:
 * - Chapter breakdown
 * - Landing page alignment info
 * - Video preview capability
 * - Regional publishing options
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Play, Pause, Volume2, VolumeX, Check, Globe, Layers,
  Video, User, Box, Sparkles, FileVideo, MapPin, Clock,
  Youtube, Linkedin, Facebook, Instagram, Music2, Twitter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateChapter {
  title: string;
  type: 'avatar' | '3d' | 'video' | 'animation' | 'screen_recording';
  duration: number;
  description?: string;
}

interface TemplateDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
  chapters: TemplateChapter[];
  landingPageSection: string;
  landingPageDescription: string;
  socialPlatforms: string[];
  previewVideoUrl?: string;
  totalDuration: number;
  regionalSupport: string[];
}

const TEMPLATE_ICON_MAP: Record<string, React.ReactNode> = {
  avatar: <User className="w-4 h-4" />,
  '3d': <Box className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  animation: <Sparkles className="w-4 h-4" />,
  screen_recording: <FileVideo className="w-4 h-4" />,
};

const SOCIAL_ICON_MAP: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
};

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'hero',
    label: 'Hero Video',
    icon: <Sparkles className="w-5 h-5" />,
    desc: '3 chapters, 60s',
    chapters: [
      { title: 'Opening Hook', type: 'animation', duration: 15, description: 'Attention-grabbing animated intro' },
      { title: 'Product Reveal', type: '3d', duration: 30, description: '3D product showcase with dynamic camera' },
      { title: 'Call to Action', type: 'video', duration: 15, description: 'Compelling CTA with brand elements' },
    ],
    landingPageSection: 'Hero Showcase',
    landingPageDescription: 'Main hero section at the top of landing page. First thing visitors see. High impact.',
    socialPlatforms: ['youtube', 'linkedin', 'facebook', 'twitter'],
    totalDuration: 60,
    regionalSupport: ['All regions - 14+ languages'],
  },
  {
    id: 'product',
    label: 'Product Demo',
    icon: <FileVideo className="w-5 h-5" />,
    desc: '4 chapters, 130s',
    chapters: [
      { title: 'Introduction', type: 'avatar', duration: 20, description: 'AI avatar introduces the product' },
      { title: 'Feature 1', type: 'video', duration: 45, description: 'Deep dive into key feature' },
      { title: 'Feature 2', type: '3d', duration: 45, description: '3D visualization of capabilities' },
      { title: 'Closing', type: 'avatar', duration: 20, description: 'Avatar wrap-up with CTA' },
    ],
    landingPageSection: 'Product Demo / Use Cases',
    landingPageDescription: 'Feature showcase section. Shows in "Explore" or "Use Cases" areas. Educational content.',
    socialPlatforms: ['youtube', 'linkedin', 'facebook'],
    totalDuration: 130,
    regionalSupport: ['All regions - 14+ languages'],
  },
  {
    id: 'tutorial',
    label: 'Tutorial',
    icon: <Video className="w-5 h-5" />,
    desc: '4 chapters, 180s',
    chapters: [
      { title: 'Overview', type: 'avatar', duration: 30, description: 'Avatar explains what will be covered' },
      { title: 'Step 1', type: 'screen_recording', duration: 60, description: 'Walkthrough with screen capture' },
      { title: 'Step 2', type: 'screen_recording', duration: 60, description: 'Continued walkthrough' },
      { title: 'Summary', type: 'avatar', duration: 30, description: 'Avatar summarizes key takeaways' },
    ],
    landingPageSection: 'Tutorial / How-to',
    landingPageDescription: 'Educational section. Step-by-step guides. Best for "Resources" or "Learn" areas.',
    socialPlatforms: ['youtube', 'linkedin'],
    totalDuration: 180,
    regionalSupport: ['Primary languages - 8+ languages'],
  },
  {
    id: 'testimonial',
    label: 'Testimonials',
    icon: <User className="w-5 h-5" />,
    desc: '3 chapters, 120s',
    chapters: [
      { title: 'Testimonial 1', type: 'avatar', duration: 45, description: 'AI avatar delivers testimonial 1' },
      { title: 'Testimonial 2', type: 'avatar', duration: 45, description: 'AI avatar delivers testimonial 2' },
      { title: 'Results', type: 'animation', duration: 30, description: 'Animated statistics and outcomes' },
    ],
    landingPageSection: 'Testimonials / Social Proof',
    landingPageDescription: 'Trust-building section. Shows customer success stories. Regional avatars available.',
    socialPlatforms: ['linkedin', 'facebook', 'instagram', 'twitter'],
    totalDuration: 120,
    regionalSupport: ['Regional avatars - 10+ regions'],
  },
];

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateDefinition | null;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplatePreviewDialog: React.FC<TemplatePreviewDialogProps> = ({
  open,
  onOpenChange,
  template,
  onSelectTemplate,
}) => {
  const [activeTab, setActiveTab] = useState('chapters');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.icon}
            {template.label}
          </DialogTitle>
          <DialogDescription>
            {template.desc} • {Math.floor(template.totalDuration / 60)}:{(template.totalDuration % 60).toString().padStart(2, '0')} total
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="chapters" className="gap-2">
              <Layers className="w-4 h-4" />
              Chapters
            </TabsTrigger>
            <TabsTrigger value="landing" className="gap-2">
              <Globe className="w-4 h-4" />
              Landing Page
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Youtube className="w-4 h-4" />
              Social
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Chapters Tab */}
            <TabsContent value="chapters" className="space-y-4 m-0">
              <div className="space-y-3">
                {template.chapters.map((ch, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{ch.title}</span>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          {TEMPLATE_ICON_MAP[ch.type]}
                          {ch.type}
                        </Badge>
                      </div>
                      {ch.description && (
                        <p className="text-sm text-muted-foreground">{ch.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {ch.duration}s
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Preview Placeholder */}
              <div className="rounded-lg border overflow-hidden bg-muted/30">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Preview will be available after generation
                    </p>
                  </div>
                  {/* Play Controls */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="gap-2"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : 'Preview'}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Landing Page Alignment Tab */}
            <TabsContent value="landing" className="space-y-4 m-0">
              <div className="rounded-lg border p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium">Landing Page Section</span>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 mb-3">
                  <span className="font-medium text-primary">{template.landingPageSection}</span>
                </div>
                <p className="text-sm text-muted-foreground">{template.landingPageDescription}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="font-medium text-sm">Regional Publishing</span>
                <div className="flex flex-wrap gap-2">
                  {template.regionalSupport.map((region, i) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      <Globe className="w-3 h-3" />
                      {region}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Videos are automatically generated in each selected language using regional voice providers 
                  (ElevenLabs for West/EU, CosyVoice for CJK, Azure for India/SEA, etc.)
                </p>
              </div>

              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium mb-1">How Landing Page Alignment Works:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Select template based on where content will appear</li>
                  <li>Content is optimized for that section's requirements</li>
                  <li>Regional variants are created for each target language</li>
                  <li>After publishing, content appears in the corresponding landing page section</li>
                </ol>
              </div>
            </TabsContent>

            {/* Social Platforms Tab */}
            <TabsContent value="social" className="space-y-4 m-0">
              <div className="space-y-2">
                <span className="font-medium text-sm">Recommended Platforms</span>
                <div className="grid grid-cols-2 gap-3">
                  {template.socialPlatforms.map((platform) => (
                    <div 
                      key={platform}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {SOCIAL_ICON_MAP[platform]}
                      </div>
                      <div>
                        <span className="font-medium capitalize">{platform}</span>
                        <div className="text-xs text-muted-foreground">
                          <Check className="w-3 h-3 inline mr-1" />
                          Optimized
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium mb-1">Multi-Platform Distribution</p>
                <p className="text-xs text-muted-foreground">
                  When published, content is automatically reformatted for each platform's requirements 
                  (aspect ratio, duration, captions) and queued in the scheduler for distribution.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onSelectTemplate(template.id);
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewDialog;
