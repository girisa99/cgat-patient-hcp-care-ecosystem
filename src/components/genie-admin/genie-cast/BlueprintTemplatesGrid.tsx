/**
 * Blueprint Templates Grid
 * Displays all available templates with category filtering, AI thumbnails, and preview
 * Enhanced with provider-specific templates, industry filters, and regional variants
 * Now includes Create Template functionality
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  Layers,
  Play,
  Sparkles,
  Target,
  BookOpen,
  Megaphone,
  Film,
  RefreshCw,
  Database,
  Image as ImageIcon,
  Wand2,
  Heart,
  Stethoscope,
  Globe2,
  Plane,
  Building2,
  Cpu,
  Video,
  User,
  Palette,
  Zap,
  Music,
  Mic,
  Clapperboard,
  Box,
  MousePointer,
  ImagePlay,
  CalendarDays,
  Filter,
  Plus,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoBlueprints, type VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { BlueprintPreviewModal } from './BlueprintPreviewModal';
import { SmartTemplateRecommender } from './SmartTemplateRecommender';
import { TemplateComparisonView } from './TemplateComparisonView';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { 
  TemplateFilterBar, 
  type FilterState,
  matchesCombinationFilter,
  matchesDeviceFilter,
  REGION_FILTERS as NEW_REGION_FILTERS,
  CAPABILITY_FILTERS as NEW_CAPABILITY_FILTERS,
} from './TemplateFilterBar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlueprintTemplatesGridProps {
  onSelectBlueprint?: (blueprint: VideoBlueprint) => void;
  selectedBlueprintId?: string;
}

// Extended category icons including new categories
const categoryIcons: Record<string, React.ReactNode> = {
  marketing: <Target className="h-4 w-4" />,
  educational: <BookOpen className="h-4 w-4" />,
  storytelling: <Film className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
  healthcare: <Stethoscope className="h-4 w-4" />,
  entertainment: <Heart className="h-4 w-4" />,
  corporate: <Building2 className="h-4 w-4" />,
  animation: <Clapperboard className="h-4 w-4" />,
  '3d': <Box className="h-4 w-4" />,
  interactive: <MousePointer className="h-4 w-4" />,
  image_to_video: <ImagePlay className="h-4 w-4" />,
  seasonal: <CalendarDays className="h-4 w-4" />,
  travel: <Plane className="h-4 w-4" />,
  avatar: <User className="h-4 w-4" />,
  effects: <Palette className="h-4 w-4" />,
  ppt: <Layers className="h-4 w-4" />,
  smb: <Building2 className="h-4 w-4" />,
  oil_gas: <Zap className="h-4 w-4" />,
  combination: <Layers className="h-4 w-4" />,
  customer_journey: <Target className="h-4 w-4" />,
  fintech: <Building2 className="h-4 w-4" />,
  food_business: <Heart className="h-4 w-4" />,
  heritage: <Globe2 className="h-4 w-4" />,
  homecare: <Stethoscope className="h-4 w-4" />,
  infographic: <Layers className="h-4 w-4" />,
  nursing: <Stethoscope className="h-4 w-4" />,
  podcast: <Mic className="h-4 w-4" />,
  retail: <Building2 className="h-4 w-4" />,
  vision: <Target className="h-4 w-4" />,
  webcast: <Video className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  marketing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  educational: 'bg-green-500/20 text-green-400 border-green-500/30',
  storytelling: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  announcement: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  healthcare: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  entertainment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  corporate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  animation: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  '3d': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  interactive: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  image_to_video: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  seasonal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  travel: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  avatar: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  effects: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  ppt: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  smb: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  oil_gas: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
  combination: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  customer_journey: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  fintech: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  food_business: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  heritage: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  homecare: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  infographic: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  nursing: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  podcast: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  retail: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  vision: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  webcast: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Category gradient backgrounds for cards without thumbnails
const categoryGradients: Record<string, string> = {
  marketing: 'bg-gradient-to-br from-blue-600/30 via-blue-500/20 to-indigo-600/30',
  educational: 'bg-gradient-to-br from-green-600/30 via-emerald-500/20 to-teal-600/30',
  storytelling: 'bg-gradient-to-br from-purple-600/30 via-violet-500/20 to-fuchsia-600/30',
  announcement: 'bg-gradient-to-br from-orange-600/30 via-amber-500/20 to-yellow-600/30',
  healthcare: 'bg-gradient-to-br from-cyan-600/30 via-sky-500/20 to-blue-600/30',
  entertainment: 'bg-gradient-to-br from-pink-600/30 via-rose-500/20 to-red-600/30',
  corporate: 'bg-gradient-to-br from-slate-600/30 via-gray-500/20 to-zinc-600/30',
  animation: 'bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-fuchsia-600/30',
  '3d': 'bg-gradient-to-br from-rose-600/30 via-pink-500/20 to-red-600/30',
  interactive: 'bg-gradient-to-br from-amber-600/30 via-yellow-500/20 to-orange-600/30',
  image_to_video: 'bg-gradient-to-br from-indigo-600/30 via-blue-500/20 to-violet-600/30',
  seasonal: 'bg-gradient-to-br from-emerald-600/30 via-green-500/20 to-teal-600/30',
  travel: 'bg-gradient-to-br from-sky-600/30 via-cyan-500/20 to-blue-600/30',
  avatar: 'bg-gradient-to-br from-fuchsia-600/30 via-pink-500/20 to-purple-600/30',
  effects: 'bg-gradient-to-br from-teal-600/30 via-emerald-500/20 to-green-600/30',
  ppt: 'bg-gradient-to-br from-yellow-600/30 via-amber-500/20 to-orange-600/30',
  smb: 'bg-gradient-to-br from-lime-600/30 via-green-500/20 to-emerald-600/30',
  oil_gas: 'bg-gradient-to-br from-stone-600/30 via-slate-500/20 to-gray-600/30',
  combination: 'bg-gradient-to-br from-violet-600/30 via-indigo-500/20 to-blue-600/30',
  customer_journey: 'bg-gradient-to-br from-blue-600/30 via-indigo-500/20 to-purple-600/30',
  fintech: 'bg-gradient-to-br from-emerald-600/30 via-teal-500/20 to-cyan-600/30',
  food_business: 'bg-gradient-to-br from-orange-600/30 via-red-500/20 to-pink-600/30',
  heritage: 'bg-gradient-to-br from-amber-600/30 via-yellow-500/20 to-orange-600/30',
  homecare: 'bg-gradient-to-br from-sky-600/30 via-blue-500/20 to-indigo-600/30',
  infographic: 'bg-gradient-to-br from-indigo-600/30 via-violet-500/20 to-purple-600/30',
  nursing: 'bg-gradient-to-br from-teal-600/30 via-cyan-500/20 to-sky-600/30',
  podcast: 'bg-gradient-to-br from-purple-600/30 via-fuchsia-500/20 to-pink-600/30',
  retail: 'bg-gradient-to-br from-pink-600/30 via-rose-500/20 to-red-600/30',
  vision: 'bg-gradient-to-br from-cyan-600/30 via-teal-500/20 to-emerald-600/30',
  webcast: 'bg-gradient-to-br from-red-600/30 via-orange-500/20 to-yellow-600/30',
};

// Default placeholder thumbnails by category using Unsplash CDN for reliable display
// These ensure templates ALWAYS show a visual even if AI generation hasn't completed
const CATEGORY_PLACEHOLDER_THUMBNAILS: Record<string, string> = {
  marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop',
  educational: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=360&fit=crop',
  storytelling: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop',
  announcement: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&h=360&fit=crop',
  healthcare: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=640&h=360&fit=crop',
  entertainment: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=640&h=360&fit=crop',
  corporate: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=360&fit=crop',
  animation: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop',
  '3d': 'https://images.unsplash.com/photo-1620428268482-cf1851a36764?w=640&h=360&fit=crop',
  interactive: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=640&h=360&fit=crop',
  image_to_video: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=640&h=360&fit=crop',
  seasonal: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=640&h=360&fit=crop',
  travel: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=640&h=360&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop',
  effects: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&h=360&fit=crop',
  ppt: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=640&h=360&fit=crop',
  smb: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=640&h=360&fit=crop',
  oil_gas: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=640&h=360&fit=crop',
  combination: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=640&h=360&fit=crop',
  customer_journey: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop',
  fintech: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=360&fit=crop',
  food_business: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&h=360&fit=crop',
  heritage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop',
  homecare: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=640&h=360&fit=crop',
  infographic: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=360&fit=crop',
  nursing: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=640&h=360&fit=crop',
  podcast: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=640&h=360&fit=crop',
  retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=640&h=360&fit=crop',
  vision: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop',
  webcast: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop',
};

// Get effective thumbnail for a blueprint (actual or placeholder)
const getEffectiveThumbnail = (blueprint: VideoBlueprint): string | null => {
  // Use actual thumbnail if available
  if (blueprint.thumbnail_url) return blueprint.thumbnail_url;
  
  // Fallback to category placeholder
  return CATEGORY_PLACEHOLDER_THUMBNAILS[blueprint.category] || CATEGORY_PLACEHOLDER_THUMBNAILS.marketing;
};

// AI Provider info for badges
const AI_PROVIDER_BADGES: Record<string, { name: string; icon: string; color: string }> = {
  vertex_veo: { name: 'Vertex AI Veo', icon: '🎬', color: 'from-red-500 to-orange-500' },
  sora2: { name: 'Sora 2', icon: '🌟', color: 'from-purple-500 to-blue-500' },
  alibaba_wan: { name: 'Alibaba Wan', icon: '🌊', color: 'from-orange-500 to-red-500' },
  meshy_3d: { name: 'Meshy 3D', icon: '🧊', color: 'from-blue-500 to-cyan-500' },
  modelslab_flux: { name: 'ModelsLab FLUX', icon: '⚡', color: 'from-blue-600 to-cyan-500' },
  openai_dalle: { name: 'DALL-E 3', icon: '🖼️', color: 'from-green-600 to-emerald-500' },
  gemini_imagen: { name: 'Gemini Imagen', icon: '💎', color: 'from-red-500 to-orange-500' },
  alibaba_avatar: { name: 'OmniAvatar', icon: '👤', color: 'from-orange-600 to-red-500' },
  deepseek_image: { name: 'DeepSeek', icon: '🔍', color: 'from-teal-600 to-cyan-500' },
  elevenlabs: { name: 'ElevenLabs', icon: '🎙️', color: 'from-violet-600 to-purple-500' },
  replicate_svd: { name: 'Replicate SVD', icon: '🔄', color: 'from-purple-600 to-pink-500' },
};

// Capability tags for filtering
const CAPABILITY_FILTERS = [
  { value: 'all', label: 'All Capabilities' },
  { value: 'text_to_video', label: '📹 Text-to-Video' },
  { value: 'image_to_video', label: '🎞️ Image-to-Video' },
  { value: 'video_to_video', label: '🔄 Video-to-Video' },
  { value: '3d_generation', label: '🧊 3D Generation' },
  { value: 'avatar', label: '👤 Avatar' },
  { value: 'full_body_avatar', label: '🧍 Full Body Avatar' },
  { value: 'lipsync', label: '👄 Lipsync' },
  { value: 'tts', label: '🎙️ TTS Voiceover' },
  { value: 'music_gen', label: '🎵 Music Generation' },
  { value: 'video_effects', label: '✨ Video Effects' },
  { value: 'pixar_style', label: '🎨 Pixar Style' },
  { value: 'anime_style', label: '🎌 Anime Style' },
  { value: 'motion_control', label: '🎯 Motion Control' },
  { value: 'video_extend', label: '📏 Video Extend' },
  { value: 'transitions', label: '🔀 Transitions' },
  { value: 'voice_clone', label: '🎤 Voice Clone' },
];

// Regional filters
const REGION_FILTERS = [
  { value: 'all', label: 'All Regions' },
  { value: 'western', label: '🇺🇸 Western' },
  { value: 'europe', label: '🇪🇺 Europe' },
  { value: 'cjk', label: '🇨🇳 CJK (China/Japan/Korea)' },
  { value: 'india', label: '🇮🇳 India' },
  { value: 'mena', label: '🇸🇦 MENA' },
  { value: 'sea', label: '🇸🇬 Southeast Asia' },
  { value: 'africa', label: '🌍 Africa' },
  { value: 'latam', label: '🇧🇷 Latin America' },
  { value: 'caribbean', label: '🏝️ Caribbean' },
  { value: 'pakistan', label: '🇵🇰 Pakistan' },
  { value: 'indonesia', label: '🇮🇩 Indonesia' },
];

// Industry filters - EXPANDED with SMB, Oil & Gas, PPT
const INDUSTRY_FILTERS = [
  { value: 'all', label: 'All Industries' },
  { value: 'saas', label: '💻 SaaS/Tech' },
  { value: 'healthcare', label: '🏥 Healthcare' },
  { value: 'travel', label: '✈️ Travel/Tourism' },
  { value: 'finance', label: '💰 Finance/Banking' },
  { value: 'retail', label: '🛍️ Retail/E-commerce' },
  { value: 'education', label: '📚 Education' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'consulting', label: '📊 Consulting' },
  { value: 'automotive', label: '🚗 Automotive' },
  { value: 'real_estate', label: '🏠 Real Estate' },
  { value: 'hospitality', label: '🏨 Hospitality' },
  { value: 'gaming', label: '🎮 Gaming' },
  { value: 'fitness', label: '💪 Fitness/Wellness' },
  // NEW: SMB Industries
  { value: 'restaurants', label: '🍽️ Restaurants' },
  { value: 'coffee', label: '☕ Coffee Shops' },
  { value: 'grocery', label: '🛒 Grocery' },
  { value: 'auto_repair', label: '🔧 Auto Repair' },
  { value: 'cleaners', label: '🧹 Cleaners' },
  { value: 'salon', label: '💇 Salons/Beauty' },
  { value: 'food', label: '🍕 Food & Beverage' },
  { value: 'smb', label: '🏪 Small Business' },
  // NEW: Oil & Gas
  { value: 'oil_gas', label: '⛽ Oil & Gas' },
  { value: 'energy', label: '⚡ Energy' },
  // NEW: PPT & Presentations
  { value: 'ppt', label: '📊 PPT/Slides' },
  { value: 'presentations', label: '🎯 Presentations' },
  { value: 'schools', label: '🏫 Schools/Learning' },
];

export function BlueprintTemplatesGrid({
  onSelectBlueprint,
  selectedBlueprintId,
}: BlueprintTemplatesGridProps) {
  const { toast } = useToast();
  const {
    blueprints,
    blueprintsByCategory,
    categoryLabels,
    isLoading,
    error,
    refetch,
    useBlueprintWithScenes,
    seedBlueprints,
    isSeeding,
  } = useVideoBlueprints();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [capabilityFilter, setCapabilityFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [combinationFilter, setCombinationFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [previewBlueprintId, setPreviewBlueprintId] = useState<string | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isQueueing, setIsQueueing] = useState(false);
  
  // Comparison state
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleCompare = (blueprintId: string) => {
    setComparisonIds(prev => {
      if (prev.includes(blueprintId)) {
        return prev.filter(id => id !== blueprintId);
      }
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, blueprintId];
    });
  };

  const handleOpenComparison = (ids?: string[]) => {
    if (ids) setComparisonIds(ids);
    setShowComparison(true);
  };

  const comparisonBlueprints = blueprints.filter(bp => comparisonIds.includes(bp.id));

  // Unified filter state for TemplateFilterBar
  const filterState: FilterState = useMemo(() => ({
    search: searchQuery,
    category: activeCategory,
    combination: combinationFilter,
    device: deviceFilter,
    region: regionFilter,
    capability: capabilityFilter,
    industry: industryFilter,
  }), [searchQuery, activeCategory, combinationFilter, deviceFilter, regionFilter, capabilityFilter, industryFilter]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setSearchQuery(newFilters.search);
    setActiveCategory(newFilters.category);
    setCombinationFilter(newFilters.combination);
    setDeviceFilter(newFilters.device);
    setRegionFilter(newFilters.region);
    setCapabilityFilter(newFilters.capability);
    setIndustryFilter(newFilters.industry);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setCombinationFilter('all');
    setDeviceFilter('all');
    setRegionFilter('all');
    setCapabilityFilter('all');
    setIndustryFilter('all');
  };

  // Fetch blueprint with scenes for preview
  const { data: previewBlueprint } = useBlueprintWithScenes(previewBlueprintId);

  // Queue thumbnail generation for a single blueprint (async pattern)
  const queueThumbnailGeneration = async (blueprintId: string, region: string = 'global') => {
    setGeneratingId(blueprintId);
    try {
      // Insert into queue
      const { error: queueError } = await supabase
        .from('thumbnail_generation_queue')
        .insert({
          blueprint_id: blueprintId,
          region,
          status: 'pending',
        });
      
      if (queueError) throw queueError;
      
      // Trigger queue processor
      const { error: processError } = await supabase.functions.invoke('process-thumbnail-queue', {
        body: { limit: 1 },
      });
      
      if (processError) {
        console.warn('Queue processor call failed, but job is queued:', processError);
      }
      
      toast({
        title: 'Generation Queued',
        description: 'Thumbnail will be generated shortly. Refresh to see updates.',
      });
      
      // Poll for completion
      setTimeout(() => refetch(), 5000);
    } catch (err: any) {
      toast({
        title: 'Queue Failed',
        description: err.message || 'Could not queue generation',
        variant: 'destructive',
      });
    } finally {
      setGeneratingId(null);
    }
  };

  // Queue batch thumbnail generation
  const queueAllThumbnails = async () => {
    setIsQueueing(true);
    try {
      const missingThumbnails = blueprints.filter(bp => !bp.thumbnail_url);
      
      if (missingThumbnails.length === 0) {
        toast({ title: 'All Done', description: 'All templates already have thumbnails' });
        return;
      }

      // Queue all missing thumbnails
      const queueItems = missingThumbnails.map(bp => ({
        blueprint_id: bp.id,
        region: 'global',
        status: 'pending',
      }));

      const { error: queueError } = await supabase
        .from('thumbnail_generation_queue')
        .insert(queueItems);

      if (queueError) throw queueError;

      // Trigger processor
      const { error: processError } = await supabase.functions.invoke('process-thumbnail-queue', {
        body: { limit: 5 },
      });

      toast({
        title: 'Batch Queued',
        description: `${missingThumbnails.length} thumbnails queued for generation`,
      });

      // Poll for updates
      setTimeout(() => refetch(), 10000);
    } catch (err: any) {
      toast({
        title: 'Queue Failed',
        description: err.message || 'Could not queue thumbnails',
        variant: 'destructive',
      });
    } finally {
      setIsQueueing(false);
    }
  };

  // Seed comprehensive templates (150+ with all regions, providers, industries)
  const [isSeeding150, setIsSeeding150] = useState(false);
  const seedComprehensiveTemplates = async () => {
    setIsSeeding150(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-blueprints-comprehensive');
      if (error) throw error;
      toast({
        title: 'Full Template Library Loaded!',
        description: `Added ${data.created} templates (${data.skipped} already existed). Total: ${data.total}`,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Seeding Failed',
        description: err.message || 'Could not seed templates',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding150(false);
    }
  };

  // Seed provider-specific templates
  const [isSeedingProviders, setIsSeedingProviders] = useState(false);
  const seedProviderTemplates = async () => {
    setIsSeedingProviders(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-provider-templates');
      if (error) throw error;
      toast({
        title: 'Provider Templates Added',
        description: `Added ${data.created} provider-specific templates`,
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Seeding Failed',
        description: err.message || 'Could not seed provider templates',
        variant: 'destructive',
      });
    } finally {
      setIsSeedingProviders(false);
    }
  };

  // Filter blueprints - fully wired with all filters
  const filteredBlueprints = useMemo(() => {
    let filtered = blueprints;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(bp => bp.category === activeCategory);
    }

    // Industry filter - check industry_tags array
    if (industryFilter !== 'all') {
      filtered = filtered.filter(bp =>
        bp.industry_tags?.some(tag => tag.toLowerCase().includes(industryFilter.toLowerCase()))
      );
    }

    // Combination filter - NEW
    if (combinationFilter !== 'all') {
      filtered = filtered.filter(bp => matchesCombinationFilter(bp, combinationFilter));
    }

    // Device/Platform filter - NEW
    if (deviceFilter !== 'all') {
      filtered = filtered.filter(bp => matchesDeviceFilter(bp, deviceFilter));
    }

    // Capability filter - check default_settings.ai_capabilities or name
    if (capabilityFilter !== 'all') {
      filtered = filtered.filter(bp => {
        const settings = bp.default_settings as any;
        const capabilities = settings?.ai_capabilities || [];
        const capTags = capabilities.map((c: any) => c.type?.toLowerCase() || '');
        const nameLC = bp.name.toLowerCase();
        const descLC = (bp.description || '').toLowerCase();
        
        // Match capability
        if (capabilityFilter === 'text_to_video') return nameLC.includes('video') || capTags.includes('video');
        if (capabilityFilter === 'image_to_video') return nameLC.includes('image-to-video') || nameLC.includes('image to video');
        if (capabilityFilter === '3d_generation') return nameLC.includes('3d') || capTags.includes('3d');
        if (capabilityFilter === 'avatar') return nameLC.includes('avatar') || capTags.includes('avatar');
        if (capabilityFilter === 'full_body_avatar') return nameLC.includes('full body') || descLC.includes('full body');
        if (capabilityFilter === 'lipsync') return nameLC.includes('lipsync') || capTags.includes('lipsync');
        if (capabilityFilter === 'tts') return nameLC.includes('tts') || nameLC.includes('voiceover') || capTags.includes('audio');
        if (capabilityFilter === 'music_gen') return nameLC.includes('music') || capTags.includes('music');
        if (capabilityFilter === 'video_effects') return nameLC.includes('effect') || capTags.includes('effects');
        if (capabilityFilter === 'pixar_style') return nameLC.includes('pixar') || descLC.includes('pixar');
        if (capabilityFilter === 'anime_style') return nameLC.includes('anime') || descLC.includes('anime');
        if (capabilityFilter === 'motion_control') return nameLC.includes('motion') || descLC.includes('motion control');
        if (capabilityFilter === 'video_extend') return nameLC.includes('extend') || descLC.includes('extend');
        if (capabilityFilter === 'transitions') return nameLC.includes('transition') || capTags.includes('effects');
        if (capabilityFilter === 'voice_clone') return nameLC.includes('voice clone') || nameLC.includes('dubbing');
        
        return true;
      });
    }

    // Region filter - check default_settings.regional_variants or name
    if (regionFilter !== 'all') {
      filtered = filtered.filter(bp => {
        const settings = bp.default_settings as any;
        const regions = settings?.regional_variants || [];
        const nameLC = bp.name.toLowerCase();
        const descLC = (bp.description || '').toLowerCase();
        
        // Direct region match
        if (regions.includes(regionFilter)) return true;
        
        // Fallback to name/description match
        const regionKeywords: Record<string, string[]> = {
          western: ['western', 'us', 'american', 'english'],
          europe: ['europe', 'european', 'german', 'french', 'italian'],
          cjk: ['cjk', 'china', 'japan', 'korea', 'chinese', 'japanese', 'korean', 'anime'],
          india: ['india', 'indian', 'hindi', 'bollywood'],
          mena: ['mena', 'arabic', 'arab', 'middle east', 'rtl'],
          sea: ['sea', 'southeast asia', 'thailand', 'vietnam', 'indonesia'],
          africa: ['africa', 'african', 'nigeria'],
          latam: ['latam', 'latin america', 'spanish', 'portuguese', 'brazil'],
          caribbean: ['caribbean', 'tropical', 'island'],
          pakistan: ['pakistan', 'urdu', 'pakistani'],
          indonesia: ['indonesia', 'indonesian', 'jakarta'],
        };
        
        const keywords = regionKeywords[regionFilter] || [];
        return keywords.some(kw => nameLC.includes(kw) || descLC.includes(kw));
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bp =>
        bp.name.toLowerCase().includes(query) ||
        bp.description?.toLowerCase().includes(query) ||
        bp.industry_tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [blueprints, activeCategory, searchQuery, capabilityFilter, regionFilter, industryFilter, combinationFilter, deviceFilter]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleSelectBlueprint = (blueprint: VideoBlueprint) => {
    setPreviewBlueprintId(null);
    onSelectBlueprint?.(blueprint);
  };

  // Empty state - need to seed
  if (!isLoading && blueprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="p-4 rounded-full bg-primary/10">
          <Database className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium">No Templates Found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Seed the database with starter templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => seedBlueprints()} 
            disabled={isSeeding}
            variant="outline"
            className="gap-2"
          >
            {isSeeding ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Basic Templates
              </>
            )}
          </Button>
          <Button 
            onClick={seedComprehensiveTemplates}
            disabled={isSeeding150}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80"
          >
            {isSeeding150 ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Globe2 className="h-4 w-4" />
            )}
            Seed Full Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Smart Template Recommender */}
      <SmartTemplateRecommender
        blueprints={blueprints}
        onSelectBlueprint={(bp) => setPreviewBlueprintId(bp.id)}
        onCompare={handleOpenComparison}
      />

      {/* Comparison Bar */}
      {comparisonIds.length > 0 && (
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg p-2">
          <Badge variant="outline" className="text-xs">
            {comparisonIds.length}/3 selected
          </Badge>
          <span className="text-xs text-muted-foreground flex-1">
            Select up to 3 templates to compare side-by-side
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setComparisonIds([])}
          >
            Clear
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowComparison(true)}
            disabled={comparisonIds.length < 2}
          >
            <Layers className="h-3 w-3" />
            Compare ({comparisonIds.length})
          </Button>
        </div>
      )}
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
            {/* Create Template Button */}
            <CreateTemplateDialog onCreated={refetch} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={queueAllThumbnails}
              disabled={isQueueing}
              className="gap-2"
            >
              {isQueueing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate Thumbnails
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={seedProviderTemplates}
              disabled={isSeedingProviders}
              className="gap-2 hidden sm:flex"
              title="Add 100+ templates organized by AI provider capabilities (Vertex, Sora, Alibaba, etc.)"
            >
              {isSeedingProviders ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
              + Provider Templates
            </Button>
            <Button
              size="sm"
              onClick={seedComprehensiveTemplates}
              disabled={isSeeding150}
              className="gap-2 bg-gradient-to-r from-primary to-accent"
            >
              {isSeeding150 ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Sync Full Library
            </Button>
          </div>
        </div>

      {/* Smart Filter Bar - 6 filter types with chips */}
      <TemplateFilterBar
        filters={filterState}
        onFiltersChange={handleFiltersChange}
        totalCount={blueprints.length}
        filteredCount={filteredBlueprints.length}
        onReset={handleResetFilters}
        blueprints={blueprints}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-destructive">
          <p>Failed to load templates</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlueprints.map((blueprint) => (
            <Card
              key={blueprint.id}
              className={cn(
                "overflow-hidden transition-all cursor-pointer hover:border-primary/50 hover:shadow-lg group relative",
                selectedBlueprintId === blueprint.id && "border-primary ring-2 ring-primary/20",
                comparisonIds.includes(blueprint.id) && "ring-2 ring-accent/50 border-accent/50"
              )}
              onClick={() => setPreviewBlueprintId(blueprint.id)}
            >
              {/* Compare checkbox */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={e => e.stopPropagation()}
              >
                <Checkbox
                  checked={comparisonIds.includes(blueprint.id)}
                  onCheckedChange={() => toggleCompare(blueprint.id)}
                  className="h-4 w-4 bg-background/80 border-border"
                  disabled={!comparisonIds.includes(blueprint.id) && comparisonIds.length >= 3}
                />
              </div>
              {/* Thumbnail Area - AI Generated, Placeholder, or Gradient Fallback */}
              <div className="h-36 flex items-center justify-center relative overflow-hidden">
                {/* Always show an image - either actual thumbnail or category placeholder */}
                <img 
                  src={getEffectiveThumbnail(blueprint) || ''}
                  alt={blueprint.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // On image error, fall back to gradient
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add(
                      categoryGradients[blueprint.category] || categoryGradients.marketing
                    );
                  }}
                />
                
                {/* Category icon overlay for placeholder images */}
                {!blueprint.thumbnail_url && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <div className="text-white/80 flex flex-col items-center gap-1">
                      <div className="text-3xl opacity-80">
                        {categoryIcons[blueprint.category] || <Target className="h-8 w-8" />}
                      </div>
                      <span className="text-xs opacity-60">Template Preview</span>
                    </div>
                  </div>
                )}

                {/* AI Provider badge - shows which model generated the thumbnail */}
                {(blueprint.style_preset as any)?.thumbnail_provider && (
                  <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs border-0">
                    <Wand2 className="h-3 w-3 mr-1" />
                    {(blueprint.style_preset as any).thumbnail_provider_name || (blueprint.style_preset as any).thumbnail_provider}
                  </Badge>
                )}

                {/* Regional badge if applicable */}
                {(blueprint.style_preset as any)?.thumbnail_region && (blueprint.style_preset as any).thumbnail_region !== 'global' && (
                  <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                    <Globe2 className="h-3 w-3 mr-1" />
                    {(blueprint.style_preset as any).thumbnail_region.toUpperCase()}
                  </Badge>
                )}

                {/* Capability badges - show what this template can do */}
                {!(blueprint.style_preset as any)?.thumbnail_provider && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {(blueprint.default_settings as any)?.avatarEnabled && (
                      <Badge className="bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0 border-0">
                        Avatar
                      </Badge>
                    )}
                    {(blueprint.default_settings as any)?.['3dEnabled'] && (
                      <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0 border-0">
                        3D
                      </Badge>
                    )}
                    {(blueprint.default_settings as any)?.animationEnabled && !(blueprint.default_settings as any)?.avatarEnabled && !(blueprint.default_settings as any)?.['3dEnabled'] && (
                      <Badge className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0 border-0">
                        Animation
                      </Badge>
                    )}
                    {(blueprint.default_settings as any)?.arvrEnabled && (
                      <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0 border-0">
                        AR/VR
                      </Badge>
                    )}
                  </div>
                )}

                {/* Preview/Generate Button on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Play className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-2 bg-background/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      queueThumbnailGeneration(blueprint.id);
                    }}
                    disabled={generatingId === blueprint.id}
                  >
                    {generatingId === blueprint.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    {blueprint.thumbnail_url ? 'Regen' : 'Generate'}
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate flex-1">{blueprint.name}</h3>
                    {blueprint.thumbnail_url && (
                      <span title="Has AI thumbnail">
                        <ImageIcon className="h-3 w-3 text-primary" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {blueprint.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(blueprint.estimated_duration_seconds)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {blueprint.target_platform?.length || 0} platforms
                  </div>
                  {blueprint.is_system_default ? (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto border-primary/30 text-primary">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      Built-in
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto border-muted-foreground/30">
                      Custom
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {(blueprint.industry_tags || []).slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs capitalize">
                      {tag.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {(blueprint.industry_tags?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(blueprint.industry_tags?.length || 0) - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && filteredBlueprints.length === 0 && blueprints.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No templates match your search</p>
          <Button variant="ghost" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-2">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      <BlueprintPreviewModal
        blueprint={previewBlueprint || null}
        scenes={previewBlueprint?.scenes || []}
        isOpen={!!previewBlueprintId && !!previewBlueprint}
        onClose={() => setPreviewBlueprintId(null)}
        onSelect={handleSelectBlueprint}
      />

      {/* Comparison Modal */}
      <TemplateComparisonView
        blueprints={comparisonBlueprints}
        isOpen={showComparison && comparisonBlueprints.length >= 2}
        onClose={() => setShowComparison(false)}
        onSelect={handleSelectBlueprint}
        onRemove={(id) => setComparisonIds(prev => prev.filter(i => i !== id))}
      />
    </div>
  );
}

export default BlueprintTemplatesGrid;
