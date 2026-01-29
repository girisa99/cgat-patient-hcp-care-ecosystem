/**
 * TEMPLATE PREVIEW DIALOG
 * 
 * Shows detailed template information with:
 * - Chapter breakdown with live preview
 * - Landing page alignment & flow visualization
 * - Video preview capability
 * - Regional publishing options
 * - Live generation preview during creation
 */

import React, { useState, useCallback } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Play, Pause, Volume2, VolumeX, Check, Globe, Layers,
  Video, User, Box, Sparkles, FileVideo, MapPin, Clock,
  Youtube, Linkedin, Facebook, Instagram, Music2, Twitter,
  ArrowRight, ArrowDown, Eye, Wand2, RefreshCw, Monitor,
  MessageSquare, Send, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

// Landing page section types for mapping
export type LandingPageSection = 
  | 'hero_showcase'
  | 'product_demo'
  | 'tutorial_howto'
  | 'testimonials'
  | 'dialect_demo'
  | 'industry_showcases'
  | 'global_success_stories'
  | 'explore_use_cases';

// Section metadata for the mapping UI
export const LANDING_PAGE_SECTIONS: Record<LandingPageSection, {
  label: string;
  description: string;
  component: string;
  userInteractive: boolean;
}> = {
  hero_showcase: {
    label: 'Hero Showcase',
    description: 'Main hero section - first thing visitors see',
    component: 'HeroDynamicVideo',
    userInteractive: true, // Users can enter prompts to play
  },
  product_demo: {
    label: 'Product Demo / Use Cases',
    description: 'Feature demonstrations and product walkthroughs',
    component: 'GenieVideoShowcaseSection',
    userInteractive: false,
  },
  tutorial_howto: {
    label: 'Tutorial / How-to',
    description: 'Educational step-by-step guides',
    component: 'GenieVideoShowcase',
    userInteractive: false,
  },
  testimonials: {
    label: 'Testimonials / Social Proof',
    description: 'Customer success stories with regional avatars',
    component: 'GlobalInspirationSection',
    userInteractive: false,
  },
  dialect_demo: {
    label: 'True Localization Demo',
    description: 'Arabic dialects, Indian languages, African languages showcase',
    component: 'LanguageDialectDemo',
    userInteractive: true, // Users can select dialects and hear TTS
  },
  industry_showcases: {
    label: 'Industry Showcases',
    description: 'IP/industry-based default videos for specific visitor segments',
    component: 'IndustryShowcases',
    userInteractive: true, // Auto-detects IP/industry, plays defaults
  },
  global_success_stories: {
    label: 'Global Success Stories',
    description: 'Regional customer success videos by geography',
    component: 'GlobalInspirationSection',
    userInteractive: false,
  },
  explore_use_cases: {
    label: 'Explore Use Cases',
    description: 'Showcase possibilities - users view but cannot generate live',
    component: 'CrossFunctionalSection',
    userInteractive: false, // View-only, no live generation
  },
};

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  // === ORIGINAL 4 TEMPLATES ===
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
    landingPageDescription: 'Main hero section at the top of landing page. First thing visitors see. High impact. Users can enter prompts to preview content.',
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
  
  // === NEW TEMPLATES FOR EXPANDED SECTIONS ===
  
  // ARABIC DIALECT DEMO
  {
    id: 'dialect_demo_arabic',
    label: 'Arabic Dialect Demo',
    icon: <Globe className="w-5 h-5" />,
    desc: '7 chapters, 90s',
    chapters: [
      { title: 'MSA Formal', type: 'avatar', duration: 12, description: 'Modern Standard Arabic - formal context' },
      { title: 'Saudi Dialect', type: 'avatar', duration: 12, description: 'Saudi Arabian regional voice' },
      { title: 'Gulf Dialect', type: 'avatar', duration: 12, description: 'UAE/Kuwait/Qatar regional voice' },
      { title: 'Egyptian Dialect', type: 'avatar', duration: 12, description: 'Egyptian Arabic natural speech' },
      { title: 'Levantine Dialect', type: 'avatar', duration: 12, description: 'Lebanon/Syria regional voice' },
      { title: 'Maghrebi Dialect', type: 'avatar', duration: 12, description: 'Morocco/Algeria regional voice' },
      { title: 'Iraqi Dialect', type: 'avatar', duration: 18, description: 'Iraqi Arabic with closing CTA' },
    ],
    landingPageSection: 'True Localization Demo',
    landingPageDescription: 'Arabic dialect showcase. Users can select from 7 regional Arabic dialects and hear native TTS in real-time.',
    socialPlatforms: ['youtube', 'linkedin', 'twitter'],
    totalDuration: 90,
    regionalSupport: ['7 Arabic dialects: MSA, Saudi, Gulf, Egyptian, Levantine, Maghrebi, Iraqi'],
  },
  
  // INDIAN LANGUAGES DEMO
  {
    id: 'dialect_demo_indian',
    label: 'Indian Languages Demo',
    icon: <Globe className="w-5 h-5" />,
    desc: '8 chapters, 100s',
    chapters: [
      { title: 'Hindi', type: 'avatar', duration: 12, description: 'Hindi - most widely spoken' },
      { title: 'Tamil', type: 'avatar', duration: 12, description: 'Tamil - South Indian classical language' },
      { title: 'Telugu', type: 'avatar', duration: 12, description: 'Telugu - Andhra Pradesh & Telangana' },
      { title: 'Bengali', type: 'avatar', duration: 12, description: 'Bengali - West Bengal & Bangladesh' },
      { title: 'Marathi', type: 'avatar', duration: 12, description: 'Marathi - Maharashtra state' },
      { title: 'Gujarati', type: 'avatar', duration: 12, description: 'Gujarati - Gujarat state' },
      { title: 'Kannada', type: 'avatar', duration: 12, description: 'Kannada - Karnataka state' },
      { title: 'Malayalam', type: 'avatar', duration: 16, description: 'Malayalam - Kerala state with CTA' },
    ],
    landingPageSection: 'True Localization Demo',
    landingPageDescription: 'Indian languages showcase. Demonstrates 22+ Indian language support with native TTS voices.',
    socialPlatforms: ['youtube', 'linkedin', 'twitter'],
    totalDuration: 100,
    regionalSupport: ['22 Indian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and more'],
  },
  
  // AFRICAN LANGUAGES DEMO
  {
    id: 'dialect_demo_african',
    label: 'African Languages Demo',
    icon: <Globe className="w-5 h-5" />,
    desc: '6 chapters, 75s',
    chapters: [
      { title: 'Swahili', type: 'avatar', duration: 12, description: 'Swahili - East Africa lingua franca' },
      { title: 'Yoruba', type: 'avatar', duration: 12, description: 'Yoruba - Nigeria & West Africa' },
      { title: 'Hausa', type: 'avatar', duration: 12, description: 'Hausa - Northern Nigeria & Niger' },
      { title: 'Amharic', type: 'avatar', duration: 12, description: 'Amharic - Ethiopia official language' },
      { title: 'Zulu', type: 'avatar', duration: 12, description: 'Zulu - South Africa' },
      { title: 'Igbo', type: 'avatar', duration: 15, description: 'Igbo - Nigeria with closing CTA' },
    ],
    landingPageSection: 'True Localization Demo',
    landingPageDescription: 'African languages showcase. Demonstrates support for major African languages with native TTS.',
    socialPlatforms: ['youtube', 'linkedin', 'twitter'],
    totalDuration: 75,
    regionalSupport: ['10 African languages: Swahili, Yoruba, Hausa, Amharic, Zulu, Igbo, Xhosa, Afrikaans, Somali, Tigrinya'],
  },
  
  // INDO-ASIAN / SEA LANGUAGES DEMO
  {
    id: 'dialect_demo_indoasia',
    label: 'Indo-Asian Languages Demo',
    icon: <Globe className="w-5 h-5" />,
    desc: '6 chapters, 75s',
    chapters: [
      { title: 'Indonesian', type: 'avatar', duration: 12, description: 'Bahasa Indonesia - 270M speakers' },
      { title: 'Thai', type: 'avatar', duration: 12, description: 'Thai - Thailand official language' },
      { title: 'Vietnamese', type: 'avatar', duration: 12, description: 'Vietnamese - 85M speakers' },
      { title: 'Malay', type: 'avatar', duration: 12, description: 'Malay - Malaysia, Singapore, Brunei' },
      { title: 'Tagalog', type: 'avatar', duration: 12, description: 'Tagalog/Filipino - Philippines' },
      { title: 'Khmer', type: 'avatar', duration: 15, description: 'Khmer - Cambodia with closing CTA' },
    ],
    landingPageSection: 'True Localization Demo',
    landingPageDescription: 'Southeast Asian languages showcase. Native TTS for Indonesian, Thai, Vietnamese, Malay, Tagalog, and more.',
    socialPlatforms: ['youtube', 'linkedin', 'twitter'],
    totalDuration: 75,
    regionalSupport: ['8 SEA languages: Indonesian, Thai, Vietnamese, Malay, Tagalog, Khmer, Burmese, Lao'],
  },
  
  // CJK LANGUAGES DEMO
  {
    id: 'dialect_demo_cjk',
    label: 'CJK Languages Demo',
    icon: <Globe className="w-5 h-5" />,
    desc: '6 chapters, 80s',
    chapters: [
      { title: 'Mandarin Chinese', type: 'avatar', duration: 12, description: 'Mandarin - Standard Chinese (Putonghua)' },
      { title: 'Cantonese', type: 'avatar', duration: 12, description: 'Cantonese - Hong Kong & Guangdong' },
      { title: 'Japanese', type: 'avatar', duration: 14, description: 'Japanese - 125M speakers' },
      { title: 'Korean', type: 'avatar', duration: 14, description: 'Korean - North & South Korea' },
      { title: 'Taiwanese Hokkien', type: 'avatar', duration: 12, description: 'Taiwanese - Taiwan regional' },
      { title: 'Shanghainese', type: 'avatar', duration: 16, description: 'Wu Chinese - Shanghai dialect with CTA' },
    ],
    landingPageSection: 'True Localization Demo',
    landingPageDescription: 'CJK languages showcase. High-fidelity TTS for Chinese dialects, Japanese, and Korean with CosyVoice integration.',
    socialPlatforms: ['youtube', 'linkedin', 'twitter'],
    totalDuration: 80,
    regionalSupport: ['CJK: Mandarin, Cantonese, Japanese, Korean, Taiwanese, Wu Chinese, Min Nan'],
  },
  {
    id: 'industry_showcase',
    label: 'Industry Showcase',
    icon: <Box className="w-5 h-5" />,
    desc: '4 chapters, 120s',
    chapters: [
      { title: 'Industry Intro', type: 'animation', duration: 20, description: 'Industry-specific animated intro' },
      { title: 'Use Case 1', type: 'video', duration: 40, description: 'Primary use case demonstration' },
      { title: 'Use Case 2', type: '3d', duration: 40, description: '3D product/feature visualization' },
      { title: 'Industry CTA', type: 'avatar', duration: 20, description: 'Industry-specific call to action' },
    ],
    landingPageSection: 'Industry Showcases',
    landingPageDescription: 'IP/industry-based videos that auto-play for visitors. Detects location and industry to show relevant content.',
    socialPlatforms: ['youtube', 'linkedin', 'facebook'],
    totalDuration: 120,
    regionalSupport: ['50+ industries', '14+ regions'],
  },
  {
    id: 'success_story',
    label: 'Success Story',
    icon: <Sparkles className="w-5 h-5" />,
    desc: '4 chapters, 150s',
    chapters: [
      { title: 'Customer Profile', type: 'avatar', duration: 30, description: 'Regional avatar introduces the customer' },
      { title: 'Challenge', type: 'video', duration: 40, description: 'Problem statement and context' },
      { title: 'Solution', type: '3d', duration: 40, description: 'How Genie solved the challenge' },
      { title: 'Results & Impact', type: 'animation', duration: 40, description: 'Metrics, ROI, and testimonial' },
    ],
    landingPageSection: 'Global Success Stories',
    landingPageDescription: 'Regional customer success videos. Shows real-world results organized by geography and industry.',
    socialPlatforms: ['youtube', 'linkedin', 'facebook', 'twitter'],
    totalDuration: 150,
    regionalSupport: ['All regions - localized avatars'],
  },
  {
    id: 'explore_preview',
    label: 'Explore Preview',
    icon: <Play className="w-5 h-5" />,
    desc: '3 chapters, 90s',
    chapters: [
      { title: 'Capability Overview', type: 'animation', duration: 30, description: 'What is possible with Genie' },
      { title: 'Pipeline Demo', type: 'screen_recording', duration: 40, description: 'Show the 206 pipelines in action' },
      { title: 'Get Started', type: 'avatar', duration: 20, description: 'Invite to sign up and try' },
    ],
    landingPageSection: 'Explore Use Cases',
    landingPageDescription: 'View-only showcase of possibilities. Users can see what Genie can do but cannot generate live content here.',
    socialPlatforms: ['youtube', 'linkedin'],
    totalDuration: 90,
    regionalSupport: ['All regions - 14+ languages'],
  },
];

// ========== LIVE PREVIEW COMPONENT ==========
interface LivePreviewPanelProps {
  template: TemplateDefinition;
  isGenerating: boolean;
  generationProgress: number;
  currentChapter: number;
  onGenerate: () => void;
  previewUrl?: string;
}

const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  template,
  isGenerating,
  generationProgress,
  currentChapter,
  onGenerate,
  previewUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      {/* Preview Area */}
      <div className="aspect-video bg-gradient-to-br from-primary/10 via-background to-accent/10 relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4 p-6"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                <Wand2 className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  Generating Chapter {currentChapter + 1}: {template.chapters[currentChapter]?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {template.chapters[currentChapter]?.description}
                </p>
                <Progress value={generationProgress} className="w-64 mx-auto mt-3" />
                <p className="text-xs text-muted-foreground">{Math.round(generationProgress)}% complete</p>
              </div>
            </motion.div>
          ) : previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full relative"
            >
              <video
                src={previewUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                autoPlay={isPlaying}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Play Preview'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Video className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">No Preview Available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a preview to see how this template looks
                </p>
              </div>
              <Button onClick={onGenerate} className="gap-2">
                <Wand2 className="w-4 h-4" />
                Generate Preview
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls overlay */}
        {(previewUrl || isGenerating) && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isGenerating}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              {!isGenerating && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-background/80 backdrop-blur-sm"
                  onClick={onGenerate}
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Chapter Progress */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex gap-1">
          {template.chapters.map((ch, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors",
                i < currentChapter ? "bg-primary" :
                i === currentChapter && isGenerating ? "bg-primary/50 animate-pulse" :
                "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{template.chapters.length} chapters</span>
          <span>{Math.floor(template.totalDuration / 60)}:{(template.totalDuration % 60).toString().padStart(2, '0')} total</span>
        </div>
      </div>
    </div>
  );
};

// ========== FLOW VISUALIZATION ==========
const WorkflowFlowDiagram: React.FC<{ template: TemplateDefinition }> = ({ template }) => {
  const sectionKey = Object.keys(LANDING_PAGE_SECTIONS).find(
    key => LANDING_PAGE_SECTIONS[key as LandingPageSection].label === template.landingPageSection ||
           template.landingPageSection.includes(LANDING_PAGE_SECTIONS[key as LandingPageSection].label.split(' ')[0])
  ) as LandingPageSection | undefined;

  const sectionInfo = sectionKey ? LANDING_PAGE_SECTIONS[sectionKey] : null;

  return (
    <div className="space-y-4">
      {/* Flow Diagram */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Content Flow: Production Hub → Landing Page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-3 py-4">
            {/* Step 1: Create */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-center">1. Create<br/>in Studio</span>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

            {/* Step 2: Generate */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-medium text-center">2. Generate<br/>Regionally</span>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

            {/* Step 3: Publish */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 border">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Send className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-center">3. Publish<br/>to Section</span>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

            {/* Step 4: Landing Page */}
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted border">
              <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center">
                <Monitor className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-center">4. View on<br/>Landing Page</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landing Page Section Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Target Section: {template.landingPageSection}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{template.landingPageDescription}</p>
          
          {sectionInfo && (
            <div className="flex flex-wrap gap-2">
              <Badge variant={sectionInfo.userInteractive ? "default" : "secondary"}>
                {sectionInfo.userInteractive ? (
                  <><MessageSquare className="w-3 h-3 mr-1" /> Users Can Enter Prompts</>
                ) : (
                  <><Eye className="w-3 h-3 mr-1" /> View Only</>
                )}
              </Badge>
              <Badge variant="outline">
                Component: {sectionInfo.component}
              </Badge>
            </div>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">How it works:</p>
            {sectionInfo?.userInteractive ? (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Admin generates content in Production Hub using this template</li>
                <li>Content is published to the landing page section</li>
                <li>Users on landing page can enter prompts to explore (preview only)</li>
                <li>User-entered prompts do NOT save - admin controls published content</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Admin generates content in Production Hub using this template</li>
                <li>Content is published to the landing page section</li>
                <li>Users view the published content (no interaction)</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  // Simulate generation for preview
  const handleGeneratePreview = useCallback(() => {
    if (!template) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentChapter(0);

    const totalChapters = template.chapters.length;
    let progress = 0;
    let chapter = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        setGenerationProgress(100);
        setIsGenerating(false);
        setPreviewUrl('/placeholder-video.mp4'); // Placeholder
        clearInterval(interval);
        return;
      }

      const newChapter = Math.floor((progress / 100) * totalChapters);
      if (newChapter !== chapter) {
        chapter = Math.min(newChapter, totalChapters - 1);
        setCurrentChapter(chapter);
      }

      setGenerationProgress(progress);
    }, 200);

    return () => clearInterval(interval);
  }, [template]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.icon}
            {template.label} - Preview & Flow
          </DialogTitle>
          <DialogDescription>
            {template.desc} • {Math.floor(template.totalDuration / 60)}:{(template.totalDuration % 60).toString().padStart(2, '0')} total
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="preview" className="gap-2">
              <Play className="w-4 h-4" />
              Live Preview
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-2">
              <Layers className="w-4 h-4" />
              Chapters
            </TabsTrigger>
            <TabsTrigger value="flow" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Globe className="w-4 h-4" />
              Distribution
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 pr-4 h-[calc(85vh-220px)]">
            {/* Live Preview Tab */}
            <TabsContent value="preview" className="space-y-4 m-0">
              <LivePreviewPanel
                template={template}
                isGenerating={isGenerating}
                generationProgress={generationProgress}
                currentChapter={currentChapter}
                onGenerate={handleGeneratePreview}
                previewUrl={previewUrl}
              />

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Target Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="text-xs">{template.landingPageSection}</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      {template.landingPageDescription.slice(0, 80)}...
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Regional Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {template.regionalSupport.slice(0, 2).map((region, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Chapters Tab */}
            <TabsContent value="chapters" className="space-y-4 m-0">
              <div className="space-y-3">
                {template.chapters.map((ch, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border bg-card transition-colors",
                      isGenerating && i === currentChapter && "border-primary bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                      i < currentChapter ? "bg-primary text-primary-foreground" :
                      i === currentChapter && isGenerating ? "bg-primary/50 text-primary-foreground animate-pulse" :
                      "bg-primary/10 text-primary"
                    )}>
                      {i < currentChapter ? <Check className="w-4 h-4" /> : i + 1}
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
            </TabsContent>

            {/* Workflow Tab */}
            <TabsContent value="flow" className="space-y-4 m-0">
              <WorkflowFlowDiagram template={template} />
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="social" className="space-y-4 m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Social Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.socialPlatforms.map((platform, i) => (
                      <Badge key={i} variant="outline" className="gap-2 py-2 px-3">
                        {SOCIAL_ICON_MAP[platform]}
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Content will be automatically formatted and published to selected platforms
                    with optimal dimensions and duration for each.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Regional Auto-Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {template.regionalSupport.map((region, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        <Globe className="w-3 h-3" />
                        {region}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Videos are automatically transcreated (not just translated) for each region
                    using native-dialect TTS providers. This ensures cultural resonance and
                    authenticity across all target markets.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Select this template to start creating your project
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onSelectTemplate(template.id);
              onOpenChange(false);
            }} className="gap-2">
              <Check className="w-4 h-4" />
              Use Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewDialog;
