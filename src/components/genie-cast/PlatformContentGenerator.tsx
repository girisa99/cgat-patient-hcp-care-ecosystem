/**
 * PlatformContentGenerator
 *
 * After assembly, auto-generates platform-specific written content
 * (descriptions, articles, captions, show notes, threads) from the
 * project's script lines + video metadata.
 *
 * Sits in the Publish tab alongside ContentRepurposingPanel and TeaserClipsSection.
 *
 * Covers ALL distribution channels:
 * YouTube, LinkedIn, X, Instagram, TikTok, WhatsApp, Facebook,
 * Medium, Podcast/Spotify, Email Newsletter
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2, Copy, Check, RefreshCw, Zap,
  Youtube, Linkedin, Twitter, Instagram, Facebook, Mail,
  FileText, Headphones, MessageCircle, Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ScriptLine {
  key: string;
  text: string;
  characterKey: string;
  sceneKey: string;
  durationEst: number;
}

export interface SceneData {
  sceneKey: string;
  title: string;
  durationEst: number;
}

export interface CharacterData {
  key: string;
  name: string;
  role: string;
}

export interface PlatformContentGeneratorProps {
  projectId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  sessionTitle: string;
  sessionDescription?: string;
  scriptLines: ScriptLine[];
  scenes: SceneData[];
  characters: CharacterData[];
  totalDuration: number;
  selectedRegion?: string;
  contentFormat?: string;
}

type Platform = 'youtube' | 'linkedin' | 'x' | 'instagram' | 'tiktok' | 'whatsapp' | 'facebook' | 'medium' | 'podcast' | 'newsletter';

interface PlatformConfig {
  label: string;
  icon: React.ReactNode;
  maxLength?: number;
  format: string;
}

interface GeneratedContent {
  platform: Platform;
  content: string;
  generated: boolean;
}

const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: { label: 'YouTube', icon: <Youtube className="h-4 w-4" />, format: 'Title + Description + Tags + Chapters' },
  linkedin: { label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, format: 'Article + Post' },
  x: { label: 'X / Twitter', icon: <Twitter className="h-4 w-4" />, maxLength: 280, format: 'Thread (5-8 posts)' },
  instagram: { label: 'Instagram', icon: <Instagram className="h-4 w-4" />, maxLength: 2200, format: 'Caption + Story text' },
  tiktok: { label: 'TikTok', icon: <Hash className="h-4 w-4" />, maxLength: 300, format: 'Description + Hashtags' },
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" />, maxLength: 500, format: 'Broadcast message' },
  facebook: { label: 'Facebook', icon: <Facebook className="h-4 w-4" />, format: 'Post + Group post' },
  medium: { label: 'Medium', icon: <FileText className="h-4 w-4" />, format: 'Full article (2000-3000 words)' },
  podcast: { label: 'Podcast', icon: <Headphones className="h-4 w-4" />, format: 'Show notes + Description' },
  newsletter: { label: 'Newsletter', icon: <Mail className="h-4 w-4" />, format: 'HTML template' },
};

const ALL_PLATFORMS: Platform[] = Object.keys(PLATFORM_CONFIGS) as Platform[];

// ─── Content Generation Logic ───────────────────────────────────────────────

function buildChapterTimestamps(scenes: SceneData[]): string {
  let cumulativeSeconds = 0;
  return scenes.map(scene => {
    const timestamp = formatTimestamp(cumulativeSeconds);
    cumulativeSeconds += scene.durationEst;
    return `${timestamp} ${scene.title}`;
  }).join('\n');
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const rmins = mins % 60;
    return `${hrs}h ${rmins}m`;
  }
  return `${mins}m ${secs}s`;
}

function extractKeyInsights(scriptLines: ScriptLine[], maxInsights = 5): string[] {
  // Pull key lines — prefer longer, more substantive dialogue
  const substantive = scriptLines
    .filter(l => l.text.length > 50 && !l.text.startsWith('['))
    .sort((a, b) => b.text.length - a.text.length)
    .slice(0, maxInsights);
  return substantive.map(l => l.text.length > 150 ? l.text.slice(0, 147) + '...' : l.text);
}

function generateForPlatform(
  platform: Platform,
  props: PlatformContentGeneratorProps,
): string {
  const { sessionTitle, sessionDescription, scriptLines, scenes, characters, totalDuration, videoUrl } = props;
  const insights = extractKeyInsights(scriptLines);
  const chapters = buildChapterTimestamps(scenes);
  const duration = formatDuration(totalDuration);
  const charBios = characters.map(c => `${c.name} — ${c.role}`).join('\n');

  switch (platform) {
    case 'youtube':
      return [
        `# ${sessionTitle}`,
        '',
        sessionDescription || `Watch the full ${duration} video.`,
        '',
        '---',
        '',
        '## Chapters',
        chapters,
        '',
        '## Key Insights',
        ...insights.map((i, idx) => `${idx + 1}. ${i}`),
        '',
        '## Credits',
        charBios,
        '',
        '## Tags',
        '#AI #Production #GenieSuite #Documentary #Sprint #ContentCreation #Innovation',
      ].join('\n');

    case 'linkedin':
      return [
        `**${sessionTitle}**`,
        '',
        `${duration} | ${scenes.length} scenes | ${characters.length} characters`,
        '',
        insights[0] || sessionDescription || '',
        '',
        'Key takeaways:',
        ...insights.slice(0, 3).map((i, idx) => `${idx + 1}. ${i}`),
        '',
        `Watch the full video: ${videoUrl}`,
        '',
        '#AI #ContentProduction #Innovation #GenieSuite',
      ].join('\n');

    case 'x':
      return [
        `THREAD: ${sessionTitle}`,
        '',
        ...insights.slice(0, 5).map((insight, idx) => `${idx + 1}/${Math.min(insights.length, 5)} ${insight.slice(0, 250)}`),
        '',
        `Full video (${duration}): ${videoUrl}`,
        '',
        '#AI #GenieSuite #Innovation',
      ].join('\n\n');

    case 'instagram':
      return [
        sessionTitle,
        '',
        insights[0] || sessionDescription || '',
        '',
        `${duration} video with ${scenes.length} scenes`,
        '',
        'Link in bio for full video!',
        '',
        '#AI #ContentCreation #Innovation #GenieSuite #Documentary #Sprint #Production #Tech #Creator #Video',
      ].join('\n');

    case 'tiktok':
      return [
        `${sessionTitle} | ${duration}`,
        '',
        insights[0]?.slice(0, 200) || sessionDescription || '',
        '',
        '#AI #GenieSuite #Documentary #ContentCreation #Innovation #FYP',
      ].join('\n');

    case 'whatsapp':
      return [
        `*${sessionTitle}*`,
        '',
        insights[0]?.slice(0, 200) || sessionDescription || '',
        '',
        `Watch: ${videoUrl}`,
        '',
        `${duration} | ${scenes.length} scenes`,
      ].join('\n');

    case 'facebook':
      return [
        sessionTitle,
        '',
        insights[0] || sessionDescription || '',
        '',
        'Key moments:',
        ...insights.slice(0, 3).map((i, idx) => `- ${i.slice(0, 200)}`),
        '',
        `Watch the full ${duration} video: ${videoUrl}`,
        '',
        'What do you think? Share your thoughts in the comments!',
      ].join('\n');

    case 'medium':
      return [
        `# ${sessionTitle}`,
        '',
        `*${duration} | ${scenes.length} scenes | ${characters.length} characters*`,
        '',
        '---',
        '',
        sessionDescription || `This is the story of ${sessionTitle}.`,
        '',
        ...scenes.map(s => [
          `## ${s.title}`,
          '',
          scriptLines
            .filter(l => l.sceneKey === s.sceneKey)
            .map(l => `> ${l.text}`)
            .join('\n\n'),
          '',
        ].join('\n')),
        '---',
        '',
        '## Credits',
        '',
        charBios,
        '',
        `[Watch the full video](${videoUrl})`,
      ].join('\n');

    case 'podcast':
      return [
        `## ${sessionTitle} — Show Notes`,
        '',
        `**Duration:** ${duration}`,
        `**Format:** ${scenes.length} chapters`,
        '',
        '### Episode Description',
        sessionDescription || `Listen to ${sessionTitle}.`,
        '',
        '### Timestamps',
        chapters,
        '',
        '### Key Takeaways',
        ...insights.map((i, idx) => `${idx + 1}. ${i}`),
        '',
        '### Characters / Speakers',
        ...characters.map(c => `- **${c.name}** — ${c.role}`),
        '',
        `Full video version: ${videoUrl}`,
      ].join('\n');

    case 'newsletter':
      return [
        `Subject: ${sessionTitle}`,
        `Preview: ${(insights[0] || sessionDescription || '').slice(0, 100)}`,
        '',
        '---',
        '',
        `# ${sessionTitle}`,
        '',
        sessionDescription || '',
        '',
        `**${duration}** | ${scenes.length} scenes | ${characters.length} characters`,
        '',
        '## Highlights',
        '',
        ...insights.slice(0, 5).map((i, idx) => `${idx + 1}. ${i}`),
        '',
        `[Watch the Full Video](${videoUrl})`,
        '',
        '---',
        '*Generated with GenieSuite Cast*',
      ].join('\n');

    default:
      return `${sessionTitle}\n\n${sessionDescription || ''}\n\n${videoUrl}`;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PlatformContentGenerator(props: PlatformContentGeneratorProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(['youtube', 'linkedin', 'x']));
  const [generatedContent, setGeneratedContent] = useState<Record<Platform, GeneratedContent>>({} as any);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);
  const [activeTab, setActiveTab] = useState<Platform>('youtube');

  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  }, []);

  const generateAll = useCallback(async () => {
    if (selectedPlatforms.size === 0) {
      toast.error('Select at least one platform');
      return;
    }

    setIsGenerating(true);
    const results: Record<string, GeneratedContent> = {};

    for (const platform of selectedPlatforms) {
      try {
        const content = generateForPlatform(platform, props);
        results[platform] = { platform, content, generated: true };
      } catch (err: any) {
        console.error(`[Content] ${platform} failed:`, err);
        results[platform] = { platform, content: `Generation failed: ${err.message}`, generated: false };
      }
    }

    setGeneratedContent(results as Record<Platform, GeneratedContent>);
    setIsGenerating(false);

    // Switch to first generated platform
    const firstGenerated = [...selectedPlatforms][0];
    if (firstGenerated) setActiveTab(firstGenerated);

    toast.success(`Generated content for ${selectedPlatforms.size} platforms`);
  }, [selectedPlatforms, props]);

  const copyToClipboard = useCallback(async (platform: Platform) => {
    const content = generatedContent[platform]?.content;
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
      toast.success(`${PLATFORM_CONFIGS[platform].label} content copied!`);
    } catch {
      toast.error('Copy failed');
    }
  }, [generatedContent]);

  const updateContent = useCallback((platform: Platform, newContent: string) => {
    setGeneratedContent(prev => ({
      ...prev,
      [platform]: { ...prev[platform], content: newContent },
    }));
  }, []);

  const generatedPlatforms = Object.keys(generatedContent).filter(p => generatedContent[p as Platform]?.generated) as Platform[];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Platform Content Writeups</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-generate platform-specific content from your video's script
            </p>
          </div>
          <Button onClick={generateAll} disabled={isGenerating || selectedPlatforms.size === 0}>
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating...</>
            ) : (
              <><Zap className="h-4 w-4 mr-1" /> Generate All Writeups</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Platform selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ALL_PLATFORMS.map(platform => {
            const config = PLATFORM_CONFIGS[platform];
            const isSelected = selectedPlatforms.has(platform);
            return (
              <Button
                key={platform}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePlatform(platform)}
                className="gap-1"
              >
                {config.icon}
                {config.label}
                {isSelected && <Check className="h-3 w-3 ml-1" />}
              </Button>
            );
          })}
        </div>

        {/* Generated content tabs */}
        {generatedPlatforms.length > 0 && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Platform)}>
            <TabsList className="flex-wrap">
              {generatedPlatforms.map(platform => (
                <TabsTrigger key={platform} value={platform} className="gap-1 text-xs">
                  {PLATFORM_CONFIGS[platform].icon}
                  {PLATFORM_CONFIGS[platform].label}
                </TabsTrigger>
              ))}
            </TabsList>

            {generatedPlatforms.map(platform => (
              <TabsContent key={platform} value={platform}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {PLATFORM_CONFIGS[platform].format}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(platform)}
                      >
                        {copiedPlatform === platform ? (
                          <><Check className="h-3 w-3 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="h-3 w-3 mr-1" /> Copy</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const content = generateForPlatform(platform, props);
                          updateContent(platform, content);
                          toast.success(`Regenerated ${PLATFORM_CONFIGS[platform].label} content`);
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={generatedContent[platform]?.content || ''}
                    onChange={(e) => updateContent(platform, e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {generatedPlatforms.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select platforms above and click "Generate All Writeups"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
