/**
 * Template Repository Component
 * Community-shared templates inspired by Canva/Gamma/GenPPT
 * Allows users to save, share, and discover AI-generated templates
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Download,
  Upload,
  Heart,
  Eye,
  Share2,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Bookmark,
  BookmarkPlus,
  Globe,
  Lock,
  Check,
  Copy,
  Palette,
  Layers,
  TrendingUp,
  Crown,
  Zap,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PresentationTemplate, PresentationTheme } from './types';

// Template repository categories
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Layers },
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'premium', name: 'Premium', icon: Crown },
  { id: 'ai-generated', name: 'AI Generated', icon: Sparkles },
  { id: 'business', name: 'Business', icon: Globe },
  { id: 'creative', name: 'Creative', icon: Palette },
  { id: 'education', name: 'Education', icon: Users },
];

interface CommunityTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  colors: { primary: string; secondary: string; accent: string };
  slides: number;
  features: string[];
  author: {
    name: string;
    avatar?: string;
    isPremium?: boolean;
  };
  stats: {
    views: number;
    downloads: number;
    likes: number;
  };
  tags: string[];
  isAIGenerated: boolean;
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
  templateData: PresentationTemplate;
}

interface TemplateRepositoryProps {
  onSelectTemplate: (template: PresentationTemplate) => void;
  onSaveTemplate?: (template: PresentationTemplate, isPublic: boolean) => void;
  currentTemplate?: PresentationTemplate | null;
  industryFilter?: string;
  segmentFilter?: string;
  contentTypeFilter?: string[];
  className?: string;
}

export function TemplateRepository({
  onSelectTemplate,
  onSaveTemplate,
  currentTemplate,
  industryFilter,
  segmentFilter,
  contentTypeFilter,
  className
}: TemplateRepositoryProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'downloads'>('popular');
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveConfig, setSaveConfig] = useState({
    name: '',
    description: '',
    tags: '',
    isPublic: true
  });

  // Fetch templates from database
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('presentation_templates')
        .select('*')
        .or('is_public.eq.true,is_system_template.eq.true');
      
      // Apply industry filter
      if (industryFilter) {
        query = query.eq('industry', industryFilter);
      }
      
      // Apply segment filter
      if (segmentFilter) {
        query = query.eq('segment', segmentFilter);
      }
      
      // Apply content type filter
      if (contentTypeFilter && contentTypeFilter.length > 0) {
        query = query.overlaps('content_types', contentTypeFilter);
      }
      
      const { data, error } = await query.order('downloads_count', { ascending: false });
      
      if (error) throw error;
      
      // Transform database records to CommunityTemplate format
      const transformed: CommunityTemplate[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        category: row.category,
        preview: row.preview_gradient || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        colors: {
          primary: row.primary_color,
          secondary: row.secondary_color,
          accent: row.accent_color
        },
        slides: row.slide_count || 10,
        features: row.features || [],
        author: {
          name: row.is_system_template ? 'Genie AI' : 'Community',
          isPremium: row.is_premium
        },
        stats: {
          views: row.views_count || 0,
          downloads: row.downloads_count || 0,
          likes: row.likes_count || 0
        },
        tags: row.tags || [],
        isAIGenerated: row.is_ai_generated || false,
        isPremium: row.is_premium || false,
        isPublic: row.is_public || true,
        createdAt: row.created_at,
        templateData: {
          id: row.id,
          name: row.name,
          description: row.description || '',
          category: (row.category as 'business' | 'creative' | 'education' | 'healthcare' | 'minimal' | 'tech') || 'business',
          theme: {
            id: `${row.id}-theme`,
            name: row.name,
            colors: {
              primary: row.primary_color,
              secondary: row.secondary_color,
              accent: row.accent_color,
              background: '#ffffff',
              foreground: '#1f2937',
              muted: '#f3f4f6',
              card: '#ffffff',
              cardForeground: '#1f2937',
              border: '#e5e7eb'
            },
            fonts: {
              heading: { family: row.heading_font || 'Inter', weight: 700 },
              body: { family: row.body_font || 'Inter', weight: 400 },
              accent: { family: row.heading_font || 'Inter', weight: 600 }
            },
            spacing: 'normal',
            borderRadius: 'medium',
            shadows: true
          },
          slideLayouts: []
        }
      }));
      
      setTemplates(transformed);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [industryFilter, segmentFilter, contentTypeFilter]);

  // Fetch user's saved templates
  const fetchSavedTemplates = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('user_saved_templates')
        .select('template_id')
        .eq('user_id', user.id);
      
      if (data) {
        setSavedTemplates(data.map(d => d.template_id));
      }
    } catch (error) {
      console.error('Failed to fetch saved templates:', error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchSavedTemplates();
  }, [fetchTemplates, fetchSavedTemplates]);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = activeCategory === 'all' || 
      activeCategory === 'trending' ||
      activeCategory === 'premium' && t.isPremium ||
      activeCategory === 'ai-generated' && t.isAIGenerated ||
      t.category === activeCategory;
    
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.stats.likes - a.stats.likes;
    if (sortBy === 'downloads') return b.stats.downloads - a.stats.downloads;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleSaveTemplate = useCallback(async () => {
    if (!currentTemplate || !saveConfig.name.trim()) {
      toast.error('Please provide a template name');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save templates');
        return;
      }

      const insertData = {
        name: saveConfig.name.trim(),
        description: saveConfig.description.trim(),
        category: currentTemplate.category || 'business',
        industry: industryFilter || null,
        segment: segmentFilter || null,
        content_types: contentTypeFilter || [],
        primary_color: currentTemplate.theme?.colors?.primary || '#3b82f6',
        secondary_color: currentTemplate.theme?.colors?.secondary || '#8b5cf6',
        accent_color: currentTemplate.theme?.colors?.accent || '#f59e0b',
        heading_font: currentTemplate.theme?.fonts?.heading?.family || 'Inter',
        body_font: currentTemplate.theme?.fonts?.body?.family || 'Inter',
        features: [] as string[],
        template_data: JSON.parse(JSON.stringify(currentTemplate)) as Json,
        theme_data: JSON.parse(JSON.stringify(currentTemplate.theme || {})) as Json,
        tags: saveConfig.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_ai_generated: true,
        is_public: saveConfig.isPublic,
        is_premium: false,
        created_by: user.id
      };

      const { error } = await supabase.from('presentation_templates').insert([insertData]);

      if (error) throw error;

      toast.success(`Template "${saveConfig.name}" saved to repository!`);
      setShowSaveDialog(false);
      setSaveConfig({ name: '', description: '', tags: '', isPublic: true });
      fetchTemplates(); // Refresh list
      
      if (onSaveTemplate) {
        onSaveTemplate(currentTemplate, saveConfig.isPublic);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  }, [currentTemplate, saveConfig, onSaveTemplate, industryFilter, segmentFilter, contentTypeFilter, fetchTemplates]);

  const toggleSaved = useCallback(async (templateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save templates');
        return;
      }

      const isSaved = savedTemplates.includes(templateId);
      
      if (isSaved) {
        await supabase
          .from('user_saved_templates')
          .delete()
          .eq('user_id', user.id)
          .eq('template_id', templateId);
        setSavedTemplates(prev => prev.filter(id => id !== templateId));
        toast.success('Removed from saved');
      } else {
        await supabase
          .from('user_saved_templates')
          .insert({ user_id: user.id, template_id: templateId });
        setSavedTemplates(prev => [...prev, templateId]);
        toast.success('Added to saved');
      }
    } catch (error) {
      toast.error('Failed to update saved templates');
    }
  }, [savedTemplates]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Template Repository</h3>
            <p className="text-xs text-muted-foreground">
              {templates.length} community templates available
            </p>
          </div>
        </div>
        
        {currentTemplate && (
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Save to Repository
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Template to Repository</DialogTitle>
                <DialogDescription>
                  Share your template with the community or save privately
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="My Awesome Template"
                    value={saveConfig.name}
                    onChange={(e) => setSaveConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="A brief description of your template"
                    value={saveConfig.description}
                    onChange={(e) => setSaveConfig(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="business, modern, minimal"
                    value={saveConfig.tags}
                    onChange={(e) => setSaveConfig(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {saveConfig.isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium">
                        {saveConfig.isPublic ? 'Public Template' : 'Private Template'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {saveConfig.isPublic ? 'Anyone can use this template' : 'Only you can access'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={saveConfig.isPublic}
                    onCheckedChange={(checked) => setSaveConfig(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="downloads">Downloads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Dropdown - Replaces scrolling pills */}
      <Select value={activeCategory} onValueChange={setActiveCategory}>
        <SelectTrigger className="w-full bg-background border">
          <div className="flex items-center gap-2">
            {(() => {
              const activeCat = TEMPLATE_CATEGORIES.find(c => c.id === activeCategory);
              const Icon = activeCat?.icon || Layers;
              return (
                <>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select category" />
                </>
              );
            })()}
          </div>
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover border shadow-lg">
          {TEMPLATE_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Template Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className="overflow-hidden group cursor-pointer hover:shadow-md transition-all"
            >
              {/* Preview */}
              <div 
                className="h-24 relative"
                style={{ background: template.preview }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {template.isAIGenerated && (
                    <Badge variant="secondary" className="text-[10px] bg-white/90">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      AI
                    </Badge>
                  )}
                  {template.isPremium && (
                    <Badge className="text-[10px] bg-amber-500">
                      <Crown className="h-2.5 w-2.5 mr-0.5" />
                      Premium
                    </Badge>
                  )}
                </div>
                
                {/* Save Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaved(template.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
                >
                  {savedTemplates.includes(template.id) ? (
                    <Bookmark className="h-3.5 w-3.5 text-primary fill-primary" />
                  ) : (
                    <BookmarkPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                
                {/* Stats */}
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <span className="text-[10px] text-white/80 flex items-center gap-0.5">
                    <Eye className="h-2.5 w-2.5" />
                    {formatNumber(template.stats.views)}
                  </span>
                  <span className="text-[10px] text-white/80 flex items-center gap-0.5">
                    <Download className="h-2.5 w-2.5" />
                    {formatNumber(template.stats.downloads)}
                  </span>
                  <span className="text-[10px] text-white/80 flex items-center gap-0.5">
                    <Heart className="h-2.5 w-2.5" />
                    {formatNumber(template.stats.likes)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">{template.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                  </div>
                  <div className="flex -space-x-1">
                    {[template.colors.primary, template.colors.secondary, template.colors.accent].map((color, idx) => (
                      <div 
                        key={idx}
                        className="w-4 h-4 rounded-full border-2 border-background"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-medium">{template.author.name}</span>
                      {template.author.isPremium && <Zap className="h-3 w-3 text-amber-500" />}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onSelectTemplate(template.templateData)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
