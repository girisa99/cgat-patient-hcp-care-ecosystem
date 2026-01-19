/**
 * Template Repository Component
 * Community-shared templates inspired by Canva/Gamma/GenPPT
 * Allows users to save, share, and discover AI-generated templates
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  className?: string;
}

export function TemplateRepository({
  onSelectTemplate,
  onSaveTemplate,
  currentTemplate,
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

  // Mock community templates (would come from database)
  const mockTemplates: CommunityTemplate[] = [
    {
      id: 'community-1',
      name: 'Modern Pitch Deck',
      description: 'Clean, investor-ready presentation with data-driven layouts',
      category: 'business',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      colors: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
      slides: 12,
      features: ['Charts', 'Timeline', 'Stats'],
      author: { name: 'GenieAI', isPremium: true },
      stats: { views: 12500, downloads: 3200, likes: 890 },
      tags: ['pitch', 'investor', 'startup'],
      isAIGenerated: true,
      isPremium: false,
      isPublic: true,
      createdAt: '2025-01-15',
      templateData: {
        id: 'community-1',
        name: 'Modern Pitch Deck',
        description: 'Clean, investor-ready presentation',
        category: 'business',
        theme: {
          id: 'pitch-theme',
          name: 'Modern Pitch',
          colors: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb', background: '#fff', foreground: '#1a1a2e', muted: '#f4f4f5', card: '#fff', cardForeground: '#1a1a2e', border: '#e4e4e7' },
          fonts: { heading: { family: 'Inter', weight: 700 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Inter', weight: 600 } },
          spacing: 'normal',
          borderRadius: 'medium',
          shadows: true
        },
        slideLayouts: []
      }
    },
    {
      id: 'community-2',
      name: 'Healthcare Essentials',
      description: 'HIPAA-ready medical presentation template',
      category: 'healthcare',
      preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      colors: { primary: '#11998e', secondary: '#38ef7d', accent: '#06b6d4' },
      slides: 14,
      features: ['HIPAA Ready', 'Data Charts', 'Patient Journey'],
      author: { name: 'MedTech Pro', isPremium: true },
      stats: { views: 8900, downloads: 2100, likes: 650 },
      tags: ['healthcare', 'medical', 'hipaa'],
      isAIGenerated: true,
      isPremium: true,
      isPublic: true,
      createdAt: '2025-01-14',
      templateData: {
        id: 'community-2',
        name: 'Healthcare Essentials',
        description: 'HIPAA-ready medical template',
        category: 'healthcare',
        theme: {
          id: 'healthcare-theme',
          name: 'Healthcare',
          colors: { primary: '#11998e', secondary: '#38ef7d', accent: '#06b6d4', background: '#f0fdfa', foreground: '#134e4a', muted: '#ccfbf1', card: '#fff', cardForeground: '#134e4a', border: '#99f6e4' },
          fonts: { heading: { family: 'Inter', weight: 700 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Inter', weight: 600 } },
          spacing: 'normal',
          borderRadius: 'medium',
          shadows: true
        },
        slideLayouts: []
      }
    },
    {
      id: 'community-3',
      name: 'Creative Agency',
      description: 'Bold, vibrant designs for creative professionals',
      category: 'creative',
      preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      colors: { primary: '#f093fb', secondary: '#f5576c', accent: '#4facfe' },
      slides: 10,
      features: ['Animations', 'Portfolio', 'Case Study'],
      author: { name: 'DesignHub' },
      stats: { views: 15200, downloads: 4500, likes: 1200 },
      tags: ['creative', 'agency', 'portfolio'],
      isAIGenerated: false,
      isPremium: false,
      isPublic: true,
      createdAt: '2025-01-13',
      templateData: {
        id: 'community-3',
        name: 'Creative Agency',
        description: 'Bold creative designs',
        category: 'creative',
        theme: {
          id: 'creative-theme',
          name: 'Creative',
          colors: { primary: '#f093fb', secondary: '#f5576c', accent: '#4facfe', background: '#fff', foreground: '#1a1a2e', muted: '#fdf4ff', card: '#fff', cardForeground: '#1a1a2e', border: '#f5d0fe' },
          fonts: { heading: { family: 'Playfair Display', weight: 700 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Inter', weight: 600 } },
          spacing: 'relaxed',
          borderRadius: 'large',
          shadows: true
        },
        slideLayouts: []
      }
    },
    {
      id: 'community-4',
      name: 'Tech Startup',
      description: 'Futuristic dark theme for tech companies',
      category: 'tech',
      preview: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#22d3ee' },
      slides: 12,
      features: ['Dark Mode', 'Code Blocks', 'Tech Icons'],
      author: { name: 'TechVision', isPremium: true },
      stats: { views: 11000, downloads: 3800, likes: 980 },
      tags: ['tech', 'startup', 'dark'],
      isAIGenerated: true,
      isPremium: false,
      isPublic: true,
      createdAt: '2025-01-12',
      templateData: {
        id: 'community-4',
        name: 'Tech Startup',
        description: 'Futuristic dark theme',
        category: 'tech',
        theme: {
          id: 'tech-theme',
          name: 'Tech Dark',
          colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#22d3ee', background: '#0f0c29', foreground: '#e2e8f0', muted: '#1e1b4b', card: '#1e1b4b', cardForeground: '#e2e8f0', border: '#3730a3' },
          fonts: { heading: { family: 'Inter', weight: 700 }, body: { family: 'Inter', weight: 400 }, accent: { family: 'Fira Code', weight: 500 } },
          spacing: 'normal',
          borderRadius: 'medium',
          shadows: true
        },
        slideLayouts: []
      }
    }
  ];

  useEffect(() => {
    // Load templates (mock for now)
    setTemplates(mockTemplates);
  }, []);

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
      // Would save to database here
      toast.success(`Template "${saveConfig.name}" saved to repository!`);
      setShowSaveDialog(false);
      setSaveConfig({ name: '', description: '', tags: '', isPublic: true });
      
      if (onSaveTemplate) {
        onSaveTemplate(currentTemplate, saveConfig.isPublic);
      }
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  }, [currentTemplate, saveConfig, onSaveTemplate]);

  const toggleSaved = (templateId: string) => {
    setSavedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
    toast.success(savedTemplates.includes(templateId) ? 'Removed from saved' : 'Added to saved');
  };

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

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TEMPLATE_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-3 w-3" />
              {cat.name}
            </button>
          );
        })}
      </div>

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
