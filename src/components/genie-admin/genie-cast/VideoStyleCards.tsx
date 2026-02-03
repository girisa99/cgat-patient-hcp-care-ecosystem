/**
 * VIDEO STYLE CATEGORY CARDS
 * 
 * Atlabs-inspired style selector cards showing:
 * - Educational & Training
 * - Social Media Content
 * - UGC / Avatar Videos
 * - Anime Videos
 * - Video Ads
 * - Music Videos
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
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type VideoStyleType = 
  | 'educational' 
  | 'social' 
  | 'ugc_avatar' 
  | 'anime' 
  | 'video_ads' 
  | 'music_video'
  | 'micro_drama'
  | 'storyboarding';

interface VideoStyle {
  id: VideoStyleType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  popular?: boolean;
  comingSoon?: boolean;
}

const VIDEO_STYLES: VideoStyle[] = [
  {
    id: 'educational',
    title: 'Educational & Training',
    description: 'Explain concepts clearly with AI-generated visuals and voiceovers.',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    popular: true,
  },
  {
    id: 'social',
    title: 'Social Media Content',
    description: 'Create ready-to-post Reels, Shorts, and TikToks effortlessly.',
    icon: Share2,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-500/10 to-rose-500/10',
    popular: true,
  },
  {
    id: 'ugc_avatar',
    title: 'UGC / Avatar Videos',
    description: 'Create talking-head or animated character content.',
    icon: User,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-500/10 to-violet-500/10',
  },
  {
    id: 'anime',
    title: 'Anime Videos',
    description: 'Design characters and worlds in true anime style.',
    icon: Sparkles,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
  },
  {
    id: 'video_ads',
    title: 'Video Ads',
    description: 'Professional-quality ad campaigns at a fraction of the cost.',
    icon: Megaphone,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
  },
  {
    id: 'micro_drama',
    title: 'Micro-Dramas & Short Films',
    description: 'Turn scripts into cinematic stories, no production crew needed.',
    icon: Film,
    gradient: 'from-amber-500 to-yellow-500',
    bgGradient: 'from-amber-500/10 to-yellow-500/10',
  },
  {
    id: 'music_video',
    title: 'Music Videos',
    description: 'Sync lyrics, visuals, and motion perfectly.',
    icon: Music,
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-500/10 to-blue-500/10',
    comingSoon: true,
  },
  {
    id: 'storyboarding',
    title: 'Storyboarding & Pre-Prod',
    description: 'Prototype ideas and visualize scenes before you shoot.',
    icon: BookOpen,
    gradient: 'from-slate-500 to-gray-500',
    bgGradient: 'from-slate-500/10 to-gray-500/10',
  },
];

interface VideoStyleCardsProps {
  selectedStyle?: VideoStyleType;
  onSelectStyle: (style: VideoStyleType) => void;
  className?: string;
}

export const VideoStyleCards: React.FC<VideoStyleCardsProps> = ({
  selectedStyle,
  onSelectStyle,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Built for Any Story You Want to Tell
        </h3>
        <Badge variant="outline" className="text-xs">
          50+ Visual Styles
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {VIDEO_STYLES.map((style, index) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.id;
          
          return (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => !style.comingSoon && onSelectStyle(style.id)}
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
              
              {/* Popular Badge */}
              {style.popular && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 text-[10px] bg-primary/10 text-primary border-0"
                >
                  Popular
                </Badge>
              )}
              
              {/* Coming Soon Badge */}
              {style.comingSoon && (
                <Badge 
                  variant="outline" 
                  className="absolute top-2 right-2 text-[10px]"
                >
                  Soon
                </Badge>
              )}
              
              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
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
        })}
      </div>
    </div>
  );
};

export default VideoStyleCards;
