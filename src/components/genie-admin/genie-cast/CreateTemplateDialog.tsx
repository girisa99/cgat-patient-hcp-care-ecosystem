/**
 * Create Template Dialog - Consolidated
 * Fixed dropdowns with proper scroll and interaction handling
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
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

interface CreateTemplateDialogProps {
  onCreated?: () => void;
  templateToClone?: VideoBlueprint | null;
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
  { value: 'photorealistic', label: 'Photorealistic', icon: '📸' },
  { value: 'hyper_real', label: 'Hyper-Realistic 4K', icon: '🎥' },
  { value: 'product_hero', label: 'Product Hero', icon: '🛍️' },
  { value: 'pixar_disney', label: 'Pixar/Disney', icon: '🎪' },
  { value: 'talking_head', label: 'Talking Head', icon: '👤' },
  { value: 'anime', label: 'Anime', icon: '🎌' },
  { value: 'whiteboard', label: 'Whiteboard', icon: '📝' },
  { value: 'explainer', label: 'Explainer', icon: '💡' },
  { value: 'motion_graphics', label: 'Motion Graphics', icon: '✨' },
  { value: 'documentary', label: 'Documentary', icon: '🎥' },
  { value: 'kinetic_typography', label: 'Kinetic Typography', icon: '📝' },
  { value: 'ppt_animation', label: 'PPT Animation', icon: '📊' },
];

// Platforms
const PLATFORM_OPTIONS = [
  { value: 'tiktok', label: 'TikTok (9:16)', icon: '' },
  { value: 'instagram_reels', label: 'Instagram Reels (9:16)', icon: '' },
  { value: 'instagram_feed', label: 'Instagram Feed (1:1)', icon: '' },
  { value: 'youtube', label: 'YouTube (16:9)', icon: '' },
  { value: 'youtube_shorts', label: 'YouTube Shorts (9:16)', icon: '' },
  { value: 'facebook', label: 'Facebook (16:9)', icon: '' },
  { value: 'linkedin', label: 'LinkedIn (16:9)', icon: '' },
];

// AI Capabilities
const AI_CAPABILITIES = [
  { value: 'text_to_video', label: 'Text-to-Video', icon: '📹' },
  { value: 'image_to_video', label: 'Image-to-Video', icon: '🎞️' },
  { value: '3d_generation', label: '3D Generation', icon: '🧊' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'lipsync', label: 'Lipsync', icon: '👄' },
  { value: 'tts', label: 'TTS Voiceover', icon: '🎙️' },
  { value: 'music_gen', label: 'Music Generation', icon: '🎵' },
  { value: 'video_effects', label: 'Video Effects', icon: '✨' },
];

// Regions
const REGIONS = [
  { value: 'western', label: 'Western/US', icon: '🇺🇸', languages: ['en', 'es', 'fr'] },
  { value: 'europe', label: 'Europe', icon: '🇪🇺', languages: ['en', 'de', 'fr', 'it', 'es'] },
  { value: 'cjk', label: 'CJK', icon: '🇨🇳', languages: ['zh', 'ja', 'ko'] },
  { value: 'india', label: 'India', icon: '🇮🇳', languages: ['hi', 'te', 'kn', 'ta', 'mr', 'bn'] },
  { value: 'mena', label: 'MENA', icon: '🇸🇦', languages: ['ar', 'he', 'fa', 'tr'] },
  { value: 'sea', label: 'Southeast Asia', icon: '🇸🇬', languages: ['id', 'ms', 'th', 'vi'] },
  { value: 'latam', label: 'Latin America', icon: '🇧🇷', languages: ['es', 'pt'] },
];

// Language names
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi',
  te: 'Telugu', kn: 'Kannada', ta: 'Tamil', mr: 'Marathi', bn: 'Bengali',
  ar: 'Arabic', he: 'Hebrew', fa: 'Persian', tr: 'Turkish', id: 'Indonesian',
  ms: 'Malay', th: 'Thai', vi: 'Vietnamese',
};

// AI Providers
const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI GPT-4o', icon: '🧠' },
  { value: 'gemini', label: 'Gemini 3.0', icon: '🔮' },
  { value: 'sora2', label: 'Sora 2', icon: '🌟' },
  { value: 'veo', label: 'Google Veo 3', icon: '🎬' },
  { value: 'alibaba_wan', label: 'Alibaba Wan', icon: '🌊' },
  { value: 'elevenlabs', label: 'ElevenLabs', icon: '🎙️' },
  { value: 'meshy_3d', label: 'Meshy 3D', icon: '🧊' },
];

// Custom Dropdown with fixed scroll and interactions
interface DropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: { value: string; label: string; icon?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
  placeholder?: string;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  icon,
  options,
  selected,
  onToggle,
  multi = true,
  placeholder = 'Select...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabels = options.filter(o => selected.includes(o.value));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleItemClick = (value: string) => {
    onToggle(value);
    if (!multi) {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <Label className="flex items-center gap-2 text-sm">
        {icon}
        {label}
      </Label>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between h-auto min-h-10 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1 pr-6">
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
          <ChevronDown className={cn("h-4 w-4 ml-2 shrink-0 transition-transform absolute right-3", isOpen && "rotate-180")} />
        </Button>
        
        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-[999999] overflow-hidden"
            style={{ maxHeight: '220px' }}
          >
            <div 
              className="overflow-y-auto p-1"
              style={{ maxHeight: '220px' }}
              onWheel={(e) => e.stopPropagation()}
            >
              {options.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleItemClick(opt.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent cursor-pointer transition-colors",
                    selected.includes(opt.value) && "bg-accent"
                  )}
                >
                  <Check className={cn("h-4 w-4 shrink-0", selected.includes(opt.value) ? "opacity-100" : "opacity-0")} />
                  {opt.icon && <span>{opt.icon}</span>}
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Clone Template Searchable Dropdown
interface CloneDropdownProps {
  templates: VideoBlueprint[];
  selected: VideoBlueprint | null;
  onSelect: (t: VideoBlueprint) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const CloneTemplateDropdown: React.FC<CloneDropdownProps> = ({
  templates,
  selected,
  onSelect,
  searchQuery,
  onSearchChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (template: VideoBlueprint) => {
    onSelect(template);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between h-auto min-h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selected.category}</Badge>
            <span className="truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Search 407 templates...</span>
        )}
        <ChevronDown className={cn("h-4 w-4 ml-2 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </Button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-[999999] overflow-hidden"
        >
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
          <div 
            className="overflow-y-auto p-1"
            style={{ maxHeight: '200px' }}
            onWheel={(e) => e.stopPropagation()}
          >
            {templates.length > 0 ? (
              templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent cursor-pointer transition-colors",
                    selected?.id === t.id && "bg-accent"
                  )}
                >
                  <Check className={cn("h-4 w-4 shrink-0", selected?.id === t.id ? "opacity-100" : "opacity-0")} />
                  <Badge variant="outline" className="text-[10px] shrink-0">{t.category}</Badge>
                  <span className="flex-1 truncate">{t.name}</span>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-muted-foreground">No templates found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function CreateTemplateDialog({ onCreated, templateToClone }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const { blueprints } = useVideoBlueprints();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(templateToClone ? 'clone' : 'ai');
  const [cloneSearchQuery, setCloneSearchQuery] = useState('');
  const [selectedCloneTemplate, setSelectedCloneTemplate] = useState<VideoBlueprint | null>(templateToClone || null);

  // Form state
  const [formData, setFormData] = useState({
    name: templateToClone?.name ? `${templateToClone.name} (Copy)` : '',
    description: templateToClone?.description || '',
    category: templateToClone?.category || 'marketing',
    videoStyle: 'motion_graphics',
    capabilities: [] as string[],
    regions: ['western'] as string[],
    languages: ['en'] as string[],
    providers: ['openai', 'elevenlabs'] as string[],
    platforms: ['youtube', 'tiktok'] as string[],
    aiPrompt: '',
  });

  // Get available languages based on regions
  const availableLanguages = [...new Set(
    REGIONS.filter(r => formData.regions.includes(r.value)).flatMap(r => r.languages)
  )];

  // Update languages when regions change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => availableLanguages.includes(l)) || availableLanguages.slice(0, 1),
    }));
  }, [formData.regions.join(',')]);

  // Toggle array helper
  const toggleArrayItem = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(item)
        ? (prev[key] as string[]).filter(i => i !== item)
        : [...(prev[key] as string[]), item]
    }));
  };

  // Set single value (wraps in array for consistency)
  const setSingleValue = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({ ...prev, [key]: item }));
  };

  // Clone templates filter
  const filteredCloneTemplates = blueprints.filter(bp =>
    bp.name.toLowerCase().includes(cloneSearchQuery.toLowerCase()) ||
    bp.description?.toLowerCase().includes(cloneSearchQuery.toLowerCase())
  ).slice(0, 30);

  // Select template to clone
  const selectTemplateToClone = (template: VideoBlueprint) => {
    setSelectedCloneTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: `${template.name} (Copy)`,
      description: template.description || '',
      category: template.category,
    }));
  };

  // AI Generation
  const generateWithAI = async () => {
    if (!formData.aiPrompt.trim()) {
      toast({ title: 'Please describe what template you want', variant: 'destructive' });
      return;
    }
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-template-ai', {
        body: { prompt: formData.aiPrompt, region: formData.regions[0] || 'western' }
      });
      if (error) throw error;
      if (data?.template) {
        setFormData(prev => ({
          ...prev,
          name: data.template.name || prev.name,
          description: data.template.description || prev.description,
          category: data.template.category || prev.category,
          videoStyle: data.template.videoStyle || prev.videoStyle,
          capabilities: data.template.capabilities || prev.capabilities,
          regions: data.template.regions || prev.regions,
        }));
        setActiveTab('visual');
        toast({ title: '✨ Generated!', description: 'Review configuration in Manual tab.' });
      }
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
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
      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        estimated_duration_seconds: 60,
        target_platform: formData.platforms,
        industry_tags: [formData.category, formData.videoStyle],
        default_settings: {
          videoStyle: formData.videoStyle,
          providers: formData.providers,
          platforms: formData.platforms,
          languages: formData.languages,
        },
        style_preset: {
          style: formData.videoStyle,
          capabilities: formData.capabilities,
        },
        is_system_default: false,
        created_by: user?.user?.id || null,
        is_active: true,
        is_public: true,
        usage_count: 0,
      };
      const { error } = await supabase.from('video_blueprints').insert(templateData);
      if (error) throw error;
      toast({ title: 'Template created!', description: formData.name });
      setOpen(false);
      onCreated?.();
      // Reset
      setFormData({
        name: '', description: '', category: 'marketing', videoStyle: 'motion_graphics',
        capabilities: [], regions: ['western'], languages: ['en'],
        providers: ['openai', 'elevenlabs'], platforms: ['youtube', 'tiktok'], aiPrompt: '',
      });
    } catch (err: any) {
      toast({ title: 'Failed to create template', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {templateToClone ? 'Clone' : 'Create Template'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" style={{ zIndex: 99998 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Create New Template
          </DialogTitle>
          <DialogDescription>Choose a method to create your template</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="ai" className="gap-1.5 text-xs">
                <Wand2 className="h-3.5 w-3.5" />
                AI-Assisted
              </TabsTrigger>
              <TabsTrigger value="clone" className="gap-1.5 text-xs">
                <Copy className="h-3.5 w-3.5" />
                Clone
              </TabsTrigger>
              <TabsTrigger value="visual" className="gap-1.5 text-xs">
                <Layers className="h-3.5 w-3.5" />
                Manual
              </TabsTrigger>
            </TabsList>

            {/* AI Tab */}
            <TabsContent value="ai" className="mt-4">
              <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Describe your template and AI will configure it
                </p>
                <Textarea
                  placeholder="E.g., Create a TikTok product demo template with 3D avatar for Indian Telugu audience..."
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                  className="min-h-[100px] bg-background"
                />
                <Button onClick={generateWithAI} disabled={aiGenerating || !formData.aiPrompt.trim()} className="w-full gap-2">
                  {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {aiGenerating ? 'Generating...' : 'Generate & Review'}
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </TabsContent>

            {/* Clone Tab */}
            <TabsContent value="clone" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Select template to clone</Label>
                <CloneTemplateDropdown
                  templates={filteredCloneTemplates}
                  selected={selectedCloneTemplate}
                  onSelect={selectTemplateToClone}
                  searchQuery={cloneSearchQuery}
                  onSearchChange={setCloneSearchQuery}
                />
              </div>

              {selectedCloneTemplate && (
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Cloning from:</p>
                      <p className="font-medium">{selectedCloneTemplate.name}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCloneTemplate(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>New Template Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Template (Copy)"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="visual" className="mt-4 space-y-4 pb-4">
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
                <CustomDropdown
                  label="Category"
                  options={TEMPLATE_CATEGORIES}
                  selected={[formData.category]}
                  onToggle={(v) => setSingleValue('category', v)}
                  multi={false}
                  placeholder="Select category"
                />
              </div>

              {/* Video Style */}
              <CustomDropdown
                label="Video Style"
                options={VIDEO_STYLES}
                selected={[formData.videoStyle]}
                onToggle={(v) => setSingleValue('videoStyle', v)}
                multi={false}
                placeholder="Select style"
              />

              {/* Platforms - Multi-select */}
              <CustomDropdown
                label="Target Platforms"
                icon={<Globe2 className="h-4 w-4" />}
                options={PLATFORM_OPTIONS}
                selected={formData.platforms}
                onToggle={(v) => toggleArrayItem('platforms', v)}
                multi={true}
                placeholder="Select platforms"
              />

              {/* AI Capabilities - Multi-select */}
              <CustomDropdown
                label="AI Capabilities"
                icon={<Sparkles className="h-4 w-4" />}
                options={AI_CAPABILITIES}
                selected={formData.capabilities}
                onToggle={(v) => toggleArrayItem('capabilities', v)}
                multi={true}
                placeholder="Select capabilities"
              />

              {/* Regions - Multi-select */}
              <CustomDropdown
                label="Target Regions"
                icon={<Globe2 className="h-4 w-4" />}
                options={REGIONS.map(r => ({ value: r.value, label: r.label, icon: r.icon }))}
                selected={formData.regions}
                onToggle={(v) => toggleArrayItem('regions', v)}
                multi={true}
                placeholder="Select regions"
              />

              {/* Languages - Multi-select */}
              {availableLanguages.length > 0 && (
                <CustomDropdown
                  label={`Languages (${availableLanguages.length} available)`}
                  icon={<Languages className="h-4 w-4" />}
                  options={availableLanguages.map(l => ({ value: l, label: LANGUAGE_NAMES[l] || l, icon: '' }))}
                  selected={formData.languages}
                  onToggle={(v) => toggleArrayItem('languages', v)}
                  multi={true}
                  placeholder="Select languages"
                />
              )}

              {/* AI Providers - Multi-select */}
              <CustomDropdown
                label="AI Providers"
                icon={<Wand2 className="h-4 w-4" />}
                options={AI_PROVIDERS}
                selected={formData.providers}
                onToggle={(v) => toggleArrayItem('providers', v)}
                multi={true}
                placeholder="Select providers"
              />

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
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={createTemplate}
            disabled={creating || !formData.name.trim() || (activeTab === 'clone' && !selectedCloneTemplate)}
            className="gap-2"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {creating ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}