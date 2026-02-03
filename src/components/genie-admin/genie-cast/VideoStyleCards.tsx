/**
 * VIDEO STYLE CATEGORY CARDS
 * 
 * Rich video style selector with 20+ categories:
 * - Storytelling & Narrative
 * - Educational & Training
 * - UGC / Avatar Videos (Multi-avatar types)
 * - Anime & Animation
 * - Interactive Learning
 * - And many more...
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Share2, 
  User, 
  Palette,
  Megaphone,
  Music,
  Film,
  Sparkles,
  BookOpen,
  MessageSquare,
  Check,
  Image,
  Wand2,
  Users,
  Heart,
  Gamepad2,
  Trophy,
  MousePointer,
  Navigation,
  HelpCircle,
  Play,
  Timer,
  Box,
  Mic2,
  Camera,
  Brush
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type VideoStyleType = 
  | 'smart_storytelling'
  | 'educational' 
  | 'social' 
  | 'ugc_avatar_photorealistic'
  | 'ugc_avatar_3d_pixar'
  | 'ugc_avatar_2d_animated'
  | 'anime' 
  | 'video_ads' 
  | 'micro_drama'
  | 'music_video'
  | 'storyboarding'
  | 'image_to_life'
  | 'talking_photos'
  | 'interactive_quiz'
  | 'chapter_navigation'
  | 'cta_videos'
  | 'progress_tracking'
  | 'hook_videos'
  | 'explainer_3d'
  | 'product_demo'
  | 'testimonial';

// Avatar Style Types for UGC
export type AvatarStyleType = 'photorealistic' | '3d_pixar' | '2d_animated';

interface VideoStyle {
  id: VideoStyleType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  category: 'storytelling' | 'avatar' | 'animation' | 'interactive' | 'marketing' | 'production';
  popular?: boolean;
  comingSoon?: boolean;
  new?: boolean;
}

const VIDEO_STYLES: VideoStyle[] = [
  // === STORYTELLING CATEGORY ===
  {
    id: 'smart_storytelling',
    title: 'Smart Storytelling',
    description: 'AI-driven narratives with hooks, story arcs, and emotional beats.',
    icon: BookOpen,
    gradient: 'from-violet-600 to-purple-600',
    bgGradient: 'from-violet-500/10 to-purple-500/10',
    category: 'storytelling',
    popular: true,
    new: true,
  },
  {
    id: 'hook_videos',
    title: 'Hook Videos',
    description: 'Attention-grabbing intros that stop the scroll and captivate viewers.',
    icon: Sparkles,
    gradient: 'from-rose-500 to-pink-600',
    bgGradient: 'from-rose-500/10 to-pink-500/10',
    category: 'storytelling',
    popular: true,
  },
  {
    id: 'micro_drama',
    title: 'Micro-Dramas & Short Films',
    description: 'Turn scripts into cinematic stories, no production crew needed.',
    icon: Film,
    gradient: 'from-amber-500 to-yellow-500',
    bgGradient: 'from-amber-500/10 to-yellow-500/10',
    category: 'storytelling',
  },

  // === AVATAR CATEGORY (3 Avatar Types) ===
  {
    id: 'ugc_avatar_photorealistic',
    title: 'Photorealistic Avatar',
    description: 'Ultra-realistic human presenters with natural expressions and lip-sync.',
    icon: User,
    gradient: 'from-sky-500 to-blue-600',
    bgGradient: 'from-sky-500/10 to-blue-500/10',
    category: 'avatar',
    popular: true,
  },
  {
    id: 'ugc_avatar_3d_pixar',
    title: '3D Cartoon / Pixar Style',
    description: 'Charming 3D characters with expressive animations and vibrant colors.',
    icon: Box,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    category: 'avatar',
    new: true,
  },
  {
    id: 'ugc_avatar_2d_animated',
    title: '2D Animated Characters',
    description: 'Classic 2D animation style with hand-drawn aesthetic and fluid motion.',
    icon: Brush,
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-500/10 to-cyan-500/10',
    category: 'avatar',
  },
  {
    id: 'talking_photos',
    title: 'Talking Photos',
    description: 'Bring any photo to life with realistic speech and facial movements.',
    icon: Mic2,
    gradient: 'from-fuchsia-500 to-pink-500',
    bgGradient: 'from-fuchsia-500/10 to-pink-500/10',
    category: 'avatar',
  },

  // === ANIMATION CATEGORY ===
  {
    id: 'anime',
    title: 'Anime Videos',
    description: 'Design characters and worlds in true anime style with dynamic action.',
    icon: Wand2,
    gradient: 'from-red-500 to-orange-500',
    bgGradient: 'from-red-500/10 to-orange-500/10',
    category: 'animation',
    popular: true,
  },
  {
    id: 'image_to_life',
    title: 'Bring Images to Life',
    description: 'Animate static images with motion, parallax, and cinematic effects.',
    icon: Image,
    gradient: 'from-emerald-500 to-green-500',
    bgGradient: 'from-emerald-500/10 to-green-500/10',
    category: 'animation',
    new: true,
  },
  {
    id: 'explainer_3d',
    title: '3D Explainer Videos',
    description: 'Complex concepts visualized with stunning 3D graphics and motion.',
    icon: Box,
    gradient: 'from-indigo-500 to-violet-500',
    bgGradient: 'from-indigo-500/10 to-violet-500/10',
    category: 'animation',
  },
  {
    id: 'music_video',
    title: 'Music Videos',
    description: 'Sync lyrics, visuals, and motion perfectly to your audio tracks.',
    icon: Music,
    gradient: 'from-purple-500 to-indigo-500',
    bgGradient: 'from-purple-500/10 to-indigo-500/10',
    category: 'animation',
    comingSoon: true,
  },

  // === INTERACTIVE / LEARNING CATEGORY ===
  {
    id: 'educational',
    title: 'Educational & Training',
    description: 'Explain concepts clearly with AI-generated visuals and voiceovers.',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    category: 'interactive',
    popular: true,
  },
  {
    id: 'chapter_navigation',
    title: 'Chapter Navigation',
    description: 'Interactive chapter markers for easy navigation through long content.',
    icon: Navigation,
    gradient: 'from-slate-600 to-gray-600',
    bgGradient: 'from-slate-500/10 to-gray-500/10',
    category: 'interactive',
  },
  {
    id: 'interactive_quiz',
    title: 'Quiz & Knowledge Checks',
    description: 'Embed interactive quizzes and assessments directly in your videos.',
    icon: HelpCircle,
    gradient: 'from-yellow-500 to-amber-500',
    bgGradient: 'from-yellow-500/10 to-amber-500/10',
    category: 'interactive',
    new: true,
  },
  {
    id: 'progress_tracking',
    title: 'Progress Tracking',
    description: 'Visual progress indicators and completion tracking for learners.',
    icon: Timer,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    category: 'interactive',
  },
  {
    id: 'cta_videos',
    title: 'Call-to-Action Videos',
    description: 'Strategic CTA placements with clickable buttons and overlays.',
    icon: MousePointer,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-500/10 to-rose-500/10',
    category: 'interactive',
  },

  // === MARKETING CATEGORY ===
  {
    id: 'social',
    title: 'Social Media Content',
    description: 'Create ready-to-post Reels, Shorts, and TikToks effortlessly.',
    icon: Share2,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-500/10 to-rose-500/10',
    category: 'marketing',
    popular: true,
  },
  {
    id: 'video_ads',
    title: 'Video Ads',
    description: 'Professional-quality ad campaigns at a fraction of the cost.',
    icon: Megaphone,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    category: 'marketing',
  },
  {
    id: 'product_demo',
    title: 'Product Demos',
    description: 'Showcase product features with dynamic visuals and voiceovers.',
    icon: Camera,
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/10 to-blue-500/10',
    category: 'marketing',
  },
  {
    id: 'testimonial',
    title: 'AI Testimonials',
    description: 'Generate authentic-looking customer testimonial videos.',
    icon: Heart,
    gradient: 'from-red-400 to-pink-500',
    bgGradient: 'from-red-400/10 to-pink-500/10',
    category: 'marketing',
  },

  // === PRODUCTION CATEGORY ===
  {
    id: 'storyboarding',
    title: 'Storyboarding & Pre-Prod',
    description: 'Prototype ideas and visualize scenes before you shoot.',
    icon: Palette,
    gradient: 'from-slate-500 to-gray-500',
    bgGradient: 'from-slate-500/10 to-gray-500/10',
    category: 'production',
  },
];

// Category labels for grouping
const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  storytelling: { label: '📖 Storytelling & Narrative', description: 'Hook your audience with compelling stories' },
  avatar: { label: '👤 Avatar & Presenters', description: 'Multiple avatar styles to choose from' },
  animation: { label: '🎨 Animation & Motion', description: 'Bring static content to life' },
  interactive: { label: '🎯 Interactive & Learning', description: 'Engage viewers with interactive elements' },
  marketing: { label: '📢 Marketing & Ads', description: 'Convert viewers into customers' },
  production: { label: '🎬 Pre-Production', description: 'Plan before you create' },
};

interface VideoStyleCardsProps {
  selectedStyle?: VideoStyleType;
  onSelectStyle: (style: VideoStyleType) => void;
  showCategories?: boolean;
  className?: string;
}

export const VideoStyleCards: React.FC<VideoStyleCardsProps> = ({
  selectedStyle,
  onSelectStyle,
  showCategories = true,
  className,
}) => {
  // Group styles by category
  const groupedStyles = VIDEO_STYLES.reduce((acc, style) => {
    if (!acc[style.category]) acc[style.category] = [];
    acc[style.category].push(style);
    return acc;
  }, {} as Record<string, VideoStyle[]>);

  const categoryOrder: Array<keyof typeof CATEGORY_LABELS> = [
    'storytelling', 
    'avatar', 
    'animation', 
    'interactive', 
    'marketing', 
    'production'
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Built for Any Story You Want to Tell
        </h3>
        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
          {VIDEO_STYLES.length}+ Visual Styles
        </Badge>
      </div>

      {showCategories ? (
        // Grouped by category view
        <div className="space-y-6">
          {categoryOrder.map((category) => {
            const styles = groupedStyles[category] || [];
            const categoryInfo = CATEGORY_LABELS[category];
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {categoryInfo.label}
                  </h4>
                  <span className="text-xs text-muted-foreground/60">
                    — {categoryInfo.description}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {styles.map((style, index) => (
                    <StyleCard
                      key={style.id}
                      style={style}
                      index={index}
                      isSelected={selectedStyle === style.id}
                      onClick={() => !style.comingSoon && onSelectStyle(style.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat grid view
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {VIDEO_STYLES.map((style, index) => (
            <StyleCard
              key={style.id}
              style={style}
              index={index}
              isSelected={selectedStyle === style.id}
              onClick={() => !style.comingSoon && onSelectStyle(style.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Extracted card component for reuse
const StyleCard: React.FC<{
  style: VideoStyle;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}> = ({ style, index, isSelected, onClick }) => {
  const Icon = style.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border cursor-pointer transition-all duration-300 group overflow-hidden",
        "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5",
        isSelected 
          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
          : "border-border bg-card hover:border-primary/30",
        style.comingSoon && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br",
        style.bgGradient
      )} />
      
      {/* Badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {style.popular && (
          <Badge 
            variant="secondary" 
            className="text-[10px] bg-primary/10 text-primary border-0"
          >
            Popular
          </Badge>
        )}
        {style.new && (
          <Badge 
            variant="secondary" 
            className="text-[10px] bg-green-500/10 text-green-600 border-0"
          >
            New
          </Badge>
        )}
        {style.comingSoon && (
          <Badge 
            variant="outline" 
            className="text-[10px]"
          >
            Soon
          </Badge>
        )}
      </div>
      
      {/* Selected Check */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br",
          style.gradient
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-semibold text-sm mb-1 line-clamp-1">{style.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{style.description}</p>
      </div>
    </motion.div>
  );
};

export default VideoStyleCards;
