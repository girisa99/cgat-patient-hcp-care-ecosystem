/**
 * Create Template Dialog - Portal-based dropdowns
 * Uses React Portal to render dropdowns outside dialog for proper z-index and scroll
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  ArrowLeft,
  Wand2,
  Copy,
  Layers,
  Sparkles,
  Globe2,
  Loader2,
  Check,
  Languages,
  Search,
  ChevronDown,
  X,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { useVideoBlueprints } from '@/hooks/useVideoBlueprints';
import {
  MASTER_REGION_GROUPS,
  LANGUAGE_NAMES as SHARED_LANGUAGE_NAMES,
  getLanguagesForRegions,
  buildRegionDropdownOptions,
  toggleParentRegion,
} from '@/config/regionConfig';

export interface CreateTemplateInitialContext {
  product?: string;
  audience?: string;
  platform?: string;
  goal?: string;
}

interface CreateTemplateDialogProps {
  onCreated?: () => void;
  templateToClone?: VideoBlueprint | null;
  /** Controlled open state from parent (e.g., SmartTemplateRecommender fallback CTA) */
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
  /** Pre-fill context from SmartTemplateRecommender when no matches found */
  initialContext?: CreateTemplateInitialContext | null;
}

// Categories
const TEMPLATE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing', icon: '📈' },
  { value: 'educational', label: 'Educational', icon: '📚' },
  { value: 'storytelling', label: 'Storytelling', icon: '📖' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'corporate', label: 'Corporate', icon: '🏢' },
  { value: 'animation', label: 'Animation', icon: '🎨' },
  { value: '3d', label: '3D/VR', icon: '🧊' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'interactive', label: 'Interactive', icon: '🎮' },
  { value: 'ppt', label: 'PPT/Slides', icon: '📊' },
  { value: 'smb', label: 'SMB/Local', icon: '🏪' },
  { value: 'oil_gas', label: 'Oil & Gas', icon: '⛽' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'hospitality', label: 'Hospitality', icon: '🍽️' },
  { value: 'consulting', label: 'Consulting', icon: '💼' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'technology', label: 'Technology', icon: '💻' },
];

// Video styles
const VIDEO_STYLES = [
  // Video
  { value: 'photorealistic', label: 'Photorealistic', icon: '📸' },
  { value: 'hyper_real', label: 'Hyper-Realistic 4K', icon: '🎥' },
  { value: 'product_hero', label: 'Product Hero', icon: '🛍️' },
  { value: 'pixar_disney', label: 'Pixar/Disney', icon: '🎪' },
  { value: 'talking_head', label: 'Talking Head', icon: '👤' },
  { value: 'anime', label: 'Anime', icon: '🎌' },
  { value: 'whiteboard', label: 'Whiteboard', icon: '📝' },
  { value: 'explainer', label: 'Explainer', icon: '💡' },
  { value: 'motion_graphics', label: 'Motion Graphics', icon: '✨' },
  { value: 'documentary', label: 'Documentary', icon: '🎬' },
  { value: 'kinetic_typography', label: 'Kinetic Typography', icon: '🔤' },
  { value: 'cinematic', label: 'Cinematic', icon: '🎞️' },
  { value: 'stop_motion', label: 'Stop Motion', icon: '🎭' },
  { value: 'sketch_animation', label: 'Sketch Animation', icon: '✏️' },
  // PPT / Deck / Slides
  { value: 'ppt_animation', label: 'PPT/Deck Animation', icon: '📊' },
  { value: 'ppt_slides', label: 'PPT Slides (Static)', icon: '📑' },
  { value: 'pitch_deck', label: 'Pitch Deck', icon: '📋' },
  { value: 'report_deck', label: 'Report/Data Deck', icon: '📈' },
  // Asset Lab outputs
  { value: 'banner_static', label: 'Static Banner', icon: '🖼️' },
  { value: 'banner_animated', label: 'Animated Banner', icon: '🎆' },
  { value: 'infographic', label: 'Infographic', icon: '📊' },
  { value: 'social_card', label: 'Social Media Card', icon: '🃏' },
  { value: 'email_header', label: 'Email Header', icon: '📧' },
  { value: 'blog_hero', label: 'Blog Hero Image', icon: '📰' },
  // 3D / Avatar / VR
  { value: '3d_product', label: '3D Product Showcase', icon: '🧊' },
  { value: 'vr_experience', label: 'VR/AR Experience', icon: '🥽' },
  { value: 'avatar_presenter', label: 'Avatar Presenter', icon: '🧑' },
];

// Platforms — expanded with asset lab & content platforms
const PLATFORM_OPTIONS = [
  // Social Video
  { value: 'tiktok', label: 'TikTok (9:16)', icon: '📱' },
  { value: 'instagram_reels', label: 'Instagram Reels (9:16)', icon: '📱' },
  { value: 'instagram_feed', label: 'Instagram Feed (1:1)', icon: '📷' },
  { value: 'instagram_stories', label: 'Instagram Stories (9:16)', icon: '📸' },
  { value: 'youtube', label: 'YouTube (16:9)', icon: '▶️' },
  { value: 'youtube_shorts', label: 'YouTube Shorts (9:16)', icon: '⚡' },
  { value: 'facebook', label: 'Facebook (16:9)', icon: '👍' },
  { value: 'linkedin', label: 'LinkedIn (16:9)', icon: '💼' },
  { value: 'x_twitter', label: 'X/Twitter (16:9)', icon: '🐦' },
  { value: 'snapchat', label: 'Snapchat (9:16)', icon: '👻' },
  // Content & Web
  { value: 'landing_page', label: 'Landing Page', icon: '🌐' },
  { value: 'blog_post', label: 'Blog Post', icon: '📝' },
  { value: 'email_campaign', label: 'Email Campaign', icon: '📧' },
  { value: 'newsletter', label: 'Newsletter', icon: '📰' },
  // Presentation
  { value: 'presentation', label: 'Presentation/PPT', icon: '📊' },
  { value: 'webinar', label: 'Webinar', icon: '🎥' },
  // Digital Ads
  { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
  { value: 'meta_ads', label: 'Meta Ads', icon: '📢' },
  { value: 'display_ads', label: 'Display Ads (Banner)', icon: '🖼️' },
  // Other
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'tv_broadcast', label: 'TV/Broadcast (16:9)', icon: '📺' },
];

// AI Capabilities — expanded
const AI_CAPABILITIES = [
  { value: 'text_to_video', label: 'Text-to-Video', icon: '📹' },
  { value: 'image_to_video', label: 'Image-to-Video', icon: '🎞️' },
  { value: '3d_generation', label: '3D Generation', icon: '🧊' },
  { value: 'avatar', label: 'Avatar/Talking Head', icon: '👤' },
  { value: 'lipsync', label: 'Lipsync', icon: '👄' },
  { value: 'tts', label: 'TTS Voiceover', icon: '🎙️' },
  { value: 'music_gen', label: 'Music Generation', icon: '🎵' },
  { value: 'video_effects', label: 'Video Effects/VFX', icon: '✨' },
  { value: 'text_to_image', label: 'Text-to-Image', icon: '🖼️' },
  { value: 'ppt_generation', label: 'PPT/Slide Generation', icon: '📊' },
  { value: 'transcreation', label: 'Regional Transcreation', icon: '🌍' },
  { value: 'voice_cloning', label: 'Voice Cloning', icon: '🔊' },
  { value: 'background_removal', label: 'Background Removal', icon: '🪄' },
  { value: 'ar_vr', label: 'AR/VR Rendering', icon: '🥽' },
  { value: 'subtitles_cc', label: 'Auto Subtitles/CC', icon: '💬' },
];

// Regions & Languages now imported from shared @/config/regionConfig
// Use MASTER_REGION_GROUPS, getLanguagesForRegions, buildRegionDropdownOptions, toggleParentRegion

// ============================================
// AI Providers - Following Master Routing Registry
// Locked defaults based on 4-zone regional routing
// ============================================
type ProviderCategory = 'video' | 'tts' | 'llm' | 'image' | '3d' | 'avatar' | 'audio';

interface AIProviderEntry {
  value: string;
  label: string;
  icon: string;
  category: ProviderCategory;
  priority: number;
  isDefault: boolean;
  locked?: boolean;
  zones?: string[];
}

const AI_PROVIDERS_REGISTRY: AIProviderEntry[] = [
  // VIDEO GENERATION - Veo 3 → Sora 2 → Wan 2.6
  { value: 'vertex_veo3', label: 'Vertex Veo 3 (P1)', icon: '🎬', category: 'video', priority: 1, isDefault: true, locked: true, zones: ['global'] },
  { value: 'sora2', label: 'Sora 2 (P2)', icon: '🌟', category: 'video', priority: 2, isDefault: true, zones: ['western'] },
  { value: 'alibaba_wan26', label: 'Alibaba Wan 2.6 (P3)', icon: '🌊', category: 'video', priority: 3, isDefault: true, zones: ['cjk'] },
  { value: 'modelslab', label: 'ModelsLab AnimateDiff', icon: '🎞️', category: 'video', priority: 4, isDefault: false },
  { value: 'replicate_svd', label: 'Replicate SVD', icon: '📹', category: 'video', priority: 5, isDefault: false },
  
  // TTS - Azure Neural (Primary) → Qwen3-TTS (CJK)
  { value: 'azure_neural', label: 'Azure Neural TTS (P1)', icon: '🔊', category: 'tts', priority: 1, isDefault: true, locked: true, zones: ['western', 'europe', 'mena', 'india', 'latam', 'africa'] },
  { value: 'alibaba_qwen3_tts', label: 'Alibaba Qwen3-TTS (P1-CJK)', icon: '🗣️', category: 'tts', priority: 1, isDefault: true, zones: ['cjk'] },
  { value: 'elevenlabs', label: 'ElevenLabs (P3)', icon: '🎙️', category: 'tts', priority: 3, isDefault: false },
  { value: 'google_tts', label: 'Google Cloud TTS', icon: '📢', category: 'tts', priority: 4, isDefault: false },
  { value: 'amazon_polly', label: 'Amazon Polly', icon: '🔈', category: 'tts', priority: 5, isDefault: false },
  { value: 'openai_tts', label: 'OpenAI TTS', icon: '🎤', category: 'tts', priority: 6, isDefault: false },

  // LLM - Gemini 3 → GPT-4o → Claude → Qwen → DeepSeek
  { value: 'gemini3_pro', label: 'Gemini 3.0 Pro (P1)', icon: '🔮', category: 'llm', priority: 1, isDefault: true, locked: true, zones: ['global'] },
  { value: 'openai_gpt4o', label: 'OpenAI GPT-4o (P2)', icon: '🧠', category: 'llm', priority: 2, isDefault: true },
  { value: 'claude_35', label: 'Claude 3.5 Sonnet (P3)', icon: '🎭', category: 'llm', priority: 3, isDefault: false },
  { value: 'alibaba_qwen', label: 'Alibaba Qwen-Max (P4)', icon: '🌊', category: 'llm', priority: 4, isDefault: false, zones: ['cjk'] },
  { value: 'deepseek_v3', label: 'DeepSeek V3 (P5)', icon: '🔍', category: 'llm', priority: 5, isDefault: false },
  { value: 'gemini3_flash', label: 'Gemini 3.0 Flash', icon: '⚡', category: 'llm', priority: 6, isDefault: false },

  // IMAGE - Gemini 3 Pro → Imagen 3 → FLUX Pro
  { value: 'gemini3_image', label: 'Gemini 3 Pro Image (P1)', icon: '🖼️', category: 'image', priority: 1, isDefault: true, locked: true },
  { value: 'vertex_imagen3', label: 'Vertex Imagen 3 (P2)', icon: '🎨', category: 'image', priority: 2, isDefault: true },
  { value: 'flux_pro', label: 'FLUX Pro (P3)', icon: '✨', category: 'image', priority: 3, isDefault: false },
  { value: 'stability_sdxl', label: 'Stability SDXL', icon: '🌈', category: 'image', priority: 4, isDefault: false },
  { value: 'midjourney', label: 'Midjourney', icon: '🎆', category: 'image', priority: 5, isDefault: false },
  { value: 'openai_dalle', label: 'OpenAI DALL-E 3 (Fallback)', icon: '🖌️', category: 'image', priority: 6, isDefault: false },

  // 3D/VR/AR - Meshy AI (Primary) → Alibaba 3D
  { value: 'meshy_ai', label: 'Meshy AI (P1)', icon: '🧊', category: '3d', priority: 1, isDefault: true, locked: true },
  { value: 'alibaba_3d', label: 'Alibaba 3D (P2)', icon: '🔺', category: '3d', priority: 2, isDefault: true, zones: ['cjk'] },
  { value: 'rodin_gen1', label: 'Rodin Gen-1', icon: '🗿', category: '3d', priority: 3, isDefault: false },
  { value: 'tripo3d', label: 'Tripo3D AI', icon: '🔷', category: '3d', priority: 4, isDefault: false },
  { value: 'modelslab_3d', label: 'ModelsLab 3D', icon: '📦', category: '3d', priority: 5, isDefault: false },

  // AVATAR - Wan 2.2 S2V → OmniAvatar → HeyGen
  { value: 'alibaba_wan22', label: 'Alibaba Wan 2.2 S2V (P1)', icon: '👤', category: 'avatar', priority: 1, isDefault: true, locked: true },
  { value: 'omni_avatar', label: 'OmniAvatar (P2)', icon: '🧑', category: 'avatar', priority: 2, isDefault: true },
  { value: 'tao_avatar', label: 'TaoAvatar', icon: '👥', category: 'avatar', priority: 3, isDefault: false, zones: ['cjk'] },
  { value: 'heygen', label: 'HeyGen', icon: '🎭', category: 'avatar', priority: 4, isDefault: false },
  { value: 'synthesia', label: 'Synthesia', icon: '📺', category: 'avatar', priority: 5, isDefault: false },
  { value: 'd_id', label: 'D-ID', icon: '🖥️', category: 'avatar', priority: 6, isDefault: false },

  // AUDIO - Voice Cloning, Music, SFX
  { value: 'suno_music', label: 'Suno AI Music', icon: '🎵', category: 'audio', priority: 1, isDefault: false },
  { value: 'udio_music', label: 'Udio Music', icon: '🎶', category: 'audio', priority: 2, isDefault: false },
  { value: 'elevenlabs_clone', label: 'ElevenLabs Voice Clone', icon: '🔊', category: 'audio', priority: 3, isDefault: false },
];

// Get default locked providers
const DEFAULT_LOCKED_PROVIDERS = AI_PROVIDERS_REGISTRY
  .filter(p => p.isDefault)
  .map(p => p.value);

// Providers that cannot be removed
const LOCKED_PROVIDER_VALUES = AI_PROVIDERS_REGISTRY
  .filter(p => p.locked)
  .map(p => p.value);

// Format for dropdown with category grouping
const AI_PROVIDERS = AI_PROVIDERS_REGISTRY.map(p => ({
  value: p.value,
  label: p.locked ? `🔒 ${p.label}` : p.label,
  icon: p.icon,
}));

// Category labels
const PROVIDER_CATEGORIES: Record<ProviderCategory, string> = {
  video: '🎬 Video Generation',
  tts: '🔊 Text-to-Speech',
  llm: '🧠 Language Models',
  image: '🖼️ Image Generation',
  '3d': '🧊 3D/VR/AR',
  avatar: '👤 Avatar/Talking Head',
  audio: '🎵 Audio/Music',
};

// ============================================
// Portal-based Dropdown with search and scroll
// ============================================
interface PortalDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: { value: string; label: string; icon?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
  placeholder?: string;
  maxHeight?: number;
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  label,
  icon,
  options,
  selected,
  onToggle,
  multi = true,
  placeholder = 'Select...',
  maxHeight = 280,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const selectedLabels = options.filter(o => selected.includes(o.value));
  
  // Filtered options
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recalculate position continuously while open (handles dialog scroll)
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < maxHeight + 20 && rect.top > spaceBelow;
      setPosition({
        top: openAbove ? rect.top - Math.min(maxHeight + 50, rect.top - 8) : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [maxHeight]);

  // Update position when opened and on scroll/resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Listen for scroll on any ancestor (captures dialog scroll)
      const scrollHandler = () => updatePosition();
      window.addEventListener('scroll', scrollHandler, true);
      window.addEventListener('resize', scrollHandler);
      return () => {
        window.removeEventListener('scroll', scrollHandler, true);
        window.removeEventListener('resize', scrollHandler);
      };
    }
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleItemClick = (value: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(value);
    if (!multi) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-popover border rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 999999,
      }}
    >
      {/* Search input for long lists */}
      {options.length > 10 && (
        <div className="p-2 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>
      )}
      <div 
        className="overflow-y-auto p-1"
        style={{ maxHeight }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map(opt => (
            <div
              key={opt.value}
              onMouseDown={(e) => handleItemClick(opt.value, e)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                selected.includes(opt.value) 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-accent"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                selected.includes(opt.value) 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30"
              )}>
                {selected.includes(opt.value) && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span className="truncate">{opt.label}</span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No options found
          </div>
        )}
      </div>
      {multi && selected.length > 0 && (
        <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
          {selected.length} selected
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </Label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 min-h-10 text-left",
          "border rounded-md bg-background",
          "hover:bg-accent/50 transition-colors",
          isOpen && "ring-2 ring-primary"
        )}
      >
        {selectedLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1 pr-4 flex-1">
            {selectedLabels.slice(0, 3).map(opt => (
              <Badge key={opt.value} variant="secondary" className="text-xs">
                {opt.icon && <span className="mr-1">{opt.icon}</span>}
                {opt.label}
              </Badge>
            ))}
            {selectedLabels.length > 3 && (
              <Badge variant="outline" className="text-xs">+{selectedLabels.length - 3}</Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {dropdownContent}
    </div>
  );
};

// ============================================
// Portal-based Clone Template Dropdown
// ============================================
interface PortalCloneDropdownProps {
  templates: VideoBlueprint[];
  selected: VideoBlueprint | null;
  onSelect: (t: VideoBlueprint) => void;
}

const PortalCloneDropdown: React.FC<PortalCloneDropdownProps> = ({
  templates,
  selected,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Filtered templates
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleSelect = (template: VideoBlueprint) => {
    onSelect(template);
    setIsOpen(false);
    setSearchQuery('');
  };

  const dropdownContent = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-popover border rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 999999,
      }}
    >
      <div className="p-2 border-b bg-muted/30">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
      </div>
      <div 
        className="overflow-y-auto p-1"
        style={{ maxHeight: '300px' }}
      >
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(t => (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-sm rounded-md cursor-pointer transition-colors",
                selected?.id === t.id 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-accent"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                selected?.id === t.id 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30"
              )}>
                {selected?.id === t.id && (
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">{t.category}</Badge>
              <span className="flex-1 truncate">{t.name}</span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No templates found for "{searchQuery}"
          </div>
        )}
      </div>
      <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
        {filteredTemplates.length} of {templates.length} templates
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 min-h-10 text-left",
          "border rounded-md bg-background",
          "hover:bg-accent/50 transition-colors",
          isOpen && "ring-2 ring-primary"
        )}
      >
        {selected ? (
          <div className="flex items-center gap-2 flex-1">
            <Badge variant="secondary">{selected.category}</Badge>
            <span className="truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Search {templates.length} templates...</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>
      {dropdownContent}
    </>
  );
};

// ============================================
// Main Component — Single AI-First Flow
// ============================================
export function CreateTemplateDialog({ onCreated, templateToClone, externalOpen, onExternalOpenChange, initialContext }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const { blueprints } = useVideoBlueprints();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onExternalOpenChange) onExternalOpenChange(value);
    setInternalOpen(value);
  };
  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  // Two-stage flow: 'describe' → 'review'
  const [stage, setStage] = useState<'describe' | 'review'>('describe');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'marketing',
    videoStyles: ['motion_graphics'] as string[],
    capabilities: [] as string[],
    regions: ['NAM', 'NAM_US', 'NAM_CA', 'NAM_US_SOUTH', 'NAM_US_WEST'] as string[],
    languages: ['en'] as string[],
    providers: DEFAULT_LOCKED_PROVIDERS,
    platforms: ['youtube', 'tiktok'] as string[],
    aiPrompt: '',
  });

  // Pre-fill from intent context when dialog opens
  useEffect(() => {
    if (open && initialContext) {
      const productToCategoryMap: Record<string, string> = {
        saas: 'technology', healthcare: 'healthcare', education: 'educational',
        ecommerce: 'retail', finance: 'finance', travel: 'travel',
        food: 'hospitality', corporate: 'corporate', entertainment: 'entertainment',
        smb: 'smb', marketing: 'marketing', social: 'marketing',
        creative: 'entertainment', enterprise: 'corporate', events: 'corporate',
      };
      const category = productToCategoryMap[initialContext.product || ''] || formData.category;

      const promptParts = [
        initialContext.product && `for ${initialContext.product} industry`,
        initialContext.audience && `targeting ${initialContext.audience.replace(/_/g, ' ')}`,
        initialContext.platform && `optimized for ${initialContext.platform}`,
        initialContext.goal && `focused on: ${initialContext.goal}`,
      ].filter(Boolean);

      const aiPrompt = promptParts.length > 0
        ? `Create a video template ${promptParts.join(', ')}`
        : '';

      setFormData(prev => ({
        ...prev,
        category,
        aiPrompt,
        name: initialContext.goal
          ? `${(initialContext.goal as string).split(' — ')[0]} Template`
          : prev.name,
        description: initialContext.goal
          ? `Custom template ${promptParts.join(', ')}`
          : prev.description,
      }));
      setStage('describe');
    }
  }, [open, initialContext]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStage('describe');
    }
  }, [open]);

  // Build flat region options from shared config
  const regionOptions = buildRegionDropdownOptions();

  // Get all available languages based on selected regions
  const availableLanguages = getLanguagesForRegions(formData.regions);

  // Update languages when regions change
  useEffect(() => {
    const validLangCodes = availableLanguages.map(l => l.value);
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => validLangCodes.includes(l)).length > 0 
        ? prev.languages.filter(l => validLangCodes.includes(l))
        : validLangCodes.slice(0, 1) as string[],
    }));
  }, [formData.regions.join(',')]);

  const toggleArrayItem = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(item)
        ? (prev[key] as string[]).filter(i => i !== item)
        : [...(prev[key] as string[]), item]
    }));
  };

  const setSingleValue = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({ ...prev, [key]: item }));
  };

  // AI Generation — enhances the prompt and populates all fields
  const generateWithAI = async () => {
    if (!formData.aiPrompt.trim()) {
      toast({ title: 'Please describe what template you want', variant: 'destructive' });
      return;
    }
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-ai', {
        body: { 
          prompt: formData.aiPrompt, 
          region: formData.regions[0] || 'western',
          context: {
            selectedCapabilities: formData.capabilities,
            selectedVideoStyles: formData.videoStyles,
            selectedPlatforms: formData.platforms,
            selectedRegions: formData.regions,
            selectedLanguages: formData.languages,
            category: formData.category,
          },
          seed: Date.now(),
        }
      });
      if (error) throw error;
      if (data?.template) {
        const t = data.template;
        // Map AI region codes to our MASTER_REGION_GROUPS codes
        const regionCodeMap: Record<string, string[]> = {
          western: ['NAM', 'NAM_US', 'NAM_CA'],
          europe: ['EUR', 'EUR_WEST', 'EUR_NORTH'],
          cjk: ['CJK', 'CJK_JP', 'CJK_KR', 'CJK_CN'],
          india: ['INDIA', 'INDIA_NORTH', 'INDIA_SOUTH'],
          mena: ['MENA', 'MENA_GCC', 'MENA_LEVANT'],
          africa: ['AFRICA', 'AFRICA_WEST', 'AFRICA_EAST'],
          latam: ['LATAM', 'LATAM_BR', 'LATAM_MX'],
          sea: ['SEA', 'SEA_ID', 'SEA_PH'],
          global: ['NAM', 'NAM_US', 'EUR', 'INDIA', 'MENA', 'CJK'],
          caribbean: ['CARIBBEAN'],
          pakistan: ['PAKISTAN'],
          oceania: ['OCEANIA'],
          central_asia: ['CENTRAL_ASIA'],
          russia: ['EASTERN_EUR'],
        };
        const mappedRegions = (t.regions || []).flatMap((r: string) => 
          regionCodeMap[r] || (MASTER_REGION_GROUPS.some(g => g.parent === r || g.regions.some(sr => sr.code === r)) ? [r] : [])
        );

        setFormData(prev => {
          const finalRegions = mappedRegions.length > 0 ? [...new Set(mappedRegions)] : prev.regions;
          return {
            ...prev,
            name: t.name || prev.name,
            description: t.description || prev.description,
            category: t.category || prev.category,
            videoStyles: Array.isArray(t.videoStyles) && t.videoStyles.length > 0 
              ? t.videoStyles 
              : (t.videoStyle ? [t.videoStyle] : prev.videoStyles),
            capabilities: Array.isArray(t.capabilities) && t.capabilities.length > 0 ? t.capabilities : prev.capabilities,
            regions: finalRegions as string[],
            platforms: Array.isArray(t.platforms) && t.platforms.length > 0 ? t.platforms : prev.platforms,
            languages: Array.isArray(t.languages) && t.languages.length > 0 ? t.languages : prev.languages,
          };
        });
      }
      setStage('review');
      toast({ title: '✨ AI configured your template', description: 'Review and adjust the settings below.' });
    } catch (err: any) {
      // On AI failure, still advance to review with what we have
      setStage('review');
      toast({ title: 'AI generation failed — configure manually', description: err.message, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  // Skip AI, go straight to manual review
  const skipToManual = () => {
    setStage('review');
  };

  // Generate a thumbnail via ai-image-generator
  const generateThumbnail = async (name: string, category: string, styles: string[]): Promise<string | null> => {
    try {
      const prompt = `Professional video template thumbnail for "${name}". Category: ${category}. Style: ${styles.join(', ')}. Modern, vibrant, cinematic quality. 16:9 aspect ratio. No text.`;
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: { prompt, size: '1024x576', quality: 'high', style_intent: styles[0] || 'cinematic' }
      });
      if (error || !data?.imageUrl) {
        console.warn('Thumbnail generation failed, using placeholder', error);
        return null;
      }
      return data.imageUrl;
    } catch (err) {
      console.warn('Thumbnail generation error:', err);
      return null;
    }
  };

  // Create template
  const createTemplate = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Template name is required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Generate unique thumbnail
      const thumbnailUrl = await generateThumbnail(formData.name, formData.category, formData.videoStyles);
      
      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        estimated_duration_seconds: 60,
        target_platform: formData.platforms,
        industry_tags: [formData.category, ...formData.videoStyles],
        default_settings: {
          videoStyles: formData.videoStyles,
          providers: formData.providers,
          platforms: formData.platforms,
          languages: formData.languages,
          regions: formData.regions,
          capabilities: formData.capabilities,
        },
        style_preset: {
          style: formData.videoStyles[0] || 'motion_graphics',
          capabilities: formData.capabilities,
        },
        style_intent: formData.videoStyles[0] || 'motion_graphics',
        target_regions: formData.regions,
        tone_modifier: formData.category,
        aesthetic_keywords: [...formData.videoStyles, ...formData.capabilities],
        is_system_default: false,
        created_by: user?.user?.id || null,
        is_active: true,
        is_public: true,
        usage_count: 0,
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
      };
      const { error } = await supabase.from('video_blueprints').insert(templateData);
      if (error) throw error;
      toast({ title: 'Template created!', description: formData.name });
      setOpen(false);
      onCreated?.();
      setFormData({
        name: '', description: '', category: 'marketing', videoStyles: ['motion_graphics'],
        capabilities: [], regions: ['NAM', 'NAM_US', 'NAM_CA', 'NAM_US_SOUTH', 'NAM_US_WEST'], languages: ['en'],
        providers: DEFAULT_LOCKED_PROVIDERS, platforms: ['youtube', 'tiktok'], aiPrompt: '',
      });
    } catch (err: any) {
      toast({ title: 'Failed to create template', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const isExternallyControlled = externalOpen !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      {!isExternallyControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {templateToClone ? 'Clone' : 'Create Template'}
          </Button>
        </DialogTrigger>
      )}
      {/* Manual backdrop since modal={false} removes default overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-[99997]" onClick={() => setOpen(false)} />}
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-visible" style={{ zIndex: 99998 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Create Custom Template
          </DialogTitle>
          <DialogDescription>
            {stage === 'describe'
              ? 'Describe your template — AI will configure everything for you'
              : 'Review and adjust the AI-configured settings'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {/* ═══ STAGE 1: DESCRIBE ═══ */}
          {stage === 'describe' && (
            <div className="space-y-4 mt-2">
              {/* Context Banner — shows what intent was passed */}
              {initialContext?.goal && (
                <div className="p-3 border rounded-lg bg-primary/5 border-primary/20 flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Creating from intent:</p>
                    <p className="text-sm font-medium truncate">{initialContext.goal}</p>
                  </div>
                </div>
              )}

              <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Describe your template and AI will auto-configure category, style, platforms, regions, and providers
                </p>
                <Textarea
                  placeholder="E.g., Create a TikTok product demo template with 3D avatar for Indian Telugu audience..."
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                  className="min-h-[120px] bg-background"
                />
                <div className="flex gap-2">
                  <Button onClick={generateWithAI} disabled={aiGenerating || !formData.aiPrompt.trim()} className="flex-1 gap-2">
                    {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {aiGenerating ? 'AI Configuring...' : 'Generate & Configure'}
                  </Button>
                  <Button variant="outline" onClick={skipToManual} disabled={aiGenerating}>
                    Configure Manually
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STAGE 2: REVIEW & EDIT ═══ */}
          {stage === 'review' && (
            <div className="space-y-4 mt-2">
              {/* Back to describe */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                onClick={() => setStage('describe')}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to prompt
              </Button>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Template"
                  />
                </div>
                <PortalDropdown
                  label="Category"
                  options={TEMPLATE_CATEGORIES}
                  selected={[formData.category]}
                  onToggle={(v) => setSingleValue('category', v)}
                  multi={false}
                  placeholder="Select category"
                />
              </div>

              {/* Video Styles (Multi-Select) */}
              <PortalDropdown
                label="Video Styles"
                options={VIDEO_STYLES}
                selected={formData.videoStyles}
                onToggle={(v) => toggleArrayItem('videoStyles', v)}
                multi={true}
                placeholder="Select one or more styles"
              />

              {/* Platforms */}
              <PortalDropdown
                label="Target Platforms"
                icon={<Globe2 className="h-4 w-4" />}
                options={PLATFORM_OPTIONS}
                selected={formData.platforms}
                onToggle={(v) => toggleArrayItem('platforms', v)}
                multi={true}
                placeholder="Select platforms"
              />

              {/* AI Capabilities */}
              <PortalDropdown
                label="AI Capabilities"
                icon={<Sparkles className="h-4 w-4" />}
                options={AI_CAPABILITIES}
                selected={formData.capabilities}
                onToggle={(v) => toggleArrayItem('capabilities', v)}
                multi={true}
                placeholder="Select capabilities"
              />

              {/* Regions with Sub-Regions */}
              <PortalDropdown
                label="Target Regions & Sub-Regions"
                icon={<Globe2 className="h-4 w-4" />}
                options={regionOptions}
                selected={formData.regions}
                onToggle={(v) => {
                  // Check if it's a parent region
                  const isParent = MASTER_REGION_GROUPS.some(g => g.parent === v);
                  if (isParent) {
                    setFormData(prev => ({
                      ...prev,
                      regions: toggleParentRegion(v, prev.regions),
                    }));
                  } else {
                    toggleArrayItem('regions', v);
                  }
                }}
                multi={true}
                placeholder="Select regions & sub-regions"
                maxHeight={360}
              />

              {/* Languages */}
              {availableLanguages.length > 0 && (
                <PortalDropdown
                  label={`Languages (${availableLanguages.length} available)`}
                  icon={<Languages className="h-4 w-4" />}
                  options={availableLanguages}
                  selected={formData.languages}
                  onToggle={(v) => toggleArrayItem('languages', v)}
                  multi={true}
                  placeholder="Select languages"
                  maxHeight={320}
                />
              )}

              {/* AI Providers */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Wand2 className="h-4 w-4" />
                  AI Providers (4-Zone Routing)
                </Label>
                <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/30 rounded-md border flex items-center gap-2">
                  <span className="text-primary">🔒</span>
                  <span>Locked providers follow the master routing strategy. You can add optional providers.</span>
                </div>
                <PortalDropdown
                  label=""
                  options={AI_PROVIDERS}
                  selected={formData.providers}
                  onToggle={(v) => {
                    if (LOCKED_PROVIDER_VALUES.includes(v) && formData.providers.includes(v)) return;
                    toggleArrayItem('providers', v);
                  }}
                  multi={true}
                  placeholder="Select providers"
                  maxHeight={360}
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.providers
                    .map(v => AI_PROVIDERS_REGISTRY.find(p => p.value === v))
                    .filter(Boolean)
                    .sort((a, b) => (a?.priority || 99) - (b?.priority || 99))
                    .slice(0, 6)
                    .map(provider => (
                      <Badge 
                        key={provider!.value} 
                        variant={provider!.locked ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          provider!.locked && "bg-primary/20 text-primary border-primary/30"
                        )}
                      >
                        {provider!.locked && <span className="mr-1">🔒</span>}
                        {provider!.icon} {provider!.label.replace('🔒 ', '').split(' (')[0]}
                      </Badge>
                    ))}
                  {formData.providers.length > 6 && (
                    <Badge variant="outline" className="text-xs">+{formData.providers.length - 6} more</Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this template for..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <div className="flex gap-2">
            {stage === 'review' && (
              <Button
                onClick={createTemplate}
                disabled={creating || !formData.name.trim()}
                className="gap-2"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {creating ? 'Creating...' : 'Create Template'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}