/**
 * TEMPLATE GENERATOR
 * 
 * Dynamic template generation and customization:
 * - Generate templates by category, segment, topic
 * - Wide range: marketing, research, graphs, visuals
 * - Customizable and flexible
 * - Easy to understand customization options
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Sparkles,
  Palette,
  Layout,
  BarChart3,
  Image as ImageIcon,
  Type,
  Table,
  PieChart,
  TrendingUp,
  Calendar,
  Users,
  Quote,
  Zap,
  Check,
  Star,
  Lock,
  Settings2,
  Wand2,
  RefreshCw,
  Grid3X3,
  Layers,
  Target,
  Book,
  Briefcase,
  Heart,
  Cpu,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TEMPLATE_CATEGORIES,
  TemplateCategory,
  TemplateDefinition,
  ContentCategory,
  ContentSegment,
  DataRepresentationType,
  modelAlignmentService
} from '@/services/modelAlignmentService';

// ==================== TYPES ====================

interface TemplateGeneratorProps {
  onSelectTemplate: (template: TemplateDefinition) => void;
  onGenerateCustom: (config: CustomTemplateConfig) => Promise<void>;
  selectedTemplateId?: string;
  category?: ContentCategory;
  segment?: ContentSegment;
  topic?: string;
  className?: string;
}

interface CustomTemplateConfig {
  name: string;
  category: ContentCategory;
  segment: ContentSegment;
  topic: string;
  slideCount: number;
  includeCharts: boolean;
  includeTables: boolean;
  includeImages: boolean;
  includeTimeline: boolean;
  colorScheme: string;
  dataTypes: DataRepresentationType[];
}

// ==================== CATEGORY ICONS ====================

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  marketing: <Target className="h-5 w-5" />,
  research: <BarChart3 className="h-5 w-5" />,
  investor: <DollarSign className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  healthcare: <Heart className="h-5 w-5" />,
  technology: <Cpu className="h-5 w-5" />,
};

// ==================== COLOR SCHEMES ====================

const COLOR_SCHEMES = [
  { id: 'professional', name: 'Professional', colors: ['#1e3a5f', '#2d5a87', '#4a90a4', '#7fb3d5'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'] },
  { id: 'minimal', name: 'Minimal', colors: ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9'] },
  { id: 'corporate', name: 'Corporate', colors: ['#0c2461', '#1e3799', '#4a69bd', '#6a89cc'] },
  { id: 'warm', name: 'Warm', colors: ['#eb4d4b', '#f0932b', '#f9ca24', '#f6e58d'] },
  { id: 'cool', name: 'Cool', colors: ['#0984e3', '#74b9ff', '#81ecec', '#00cec9'] },
  { id: 'nature', name: 'Nature', colors: ['#27ae60', '#2ecc71', '#1abc9c', '#16a085'] },
  { id: 'dark', name: 'Dark Mode', colors: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6'] },
  { id: 'tech', name: 'Tech', colors: ['#6c5ce7', '#a29bfe', '#00b894', '#00cec9'] },
  { id: 'medical', name: 'Medical', colors: ['#00b894', '#00cec9', '#0984e3', '#74b9ff'] },
];

// ==================== DATA TYPE OPTIONS ====================

const DATA_TYPE_OPTIONS: { id: DataRepresentationType; label: string; icon: React.ReactNode }[] = [
  { id: 'bar-chart', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'line-chart', label: 'Line Chart', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'pie-chart', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
  { id: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
  { id: 'infographic', label: 'Infographic', icon: <Layers className="h-4 w-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <Calendar className="h-4 w-4" /> },
  { id: 'process-flow', label: 'Process Flow', icon: <Grid3X3 className="h-4 w-4" /> },
  { id: 'comparison-matrix', label: 'Comparison', icon: <Grid3X3 className="h-4 w-4" /> },
];

// ==================== COMPONENT ====================

export function TemplateGenerator({
  onSelectTemplate,
  onGenerateCustom,
  selectedTemplateId,
  category: initialCategory,
  segment: initialSegment,
  topic: initialTopic,
  className
}: TemplateGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'generate'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [selectedForCustomize, setSelectedForCustomize] = useState<TemplateDefinition | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Custom template config state
  const [customConfig, setCustomConfig] = useState<CustomTemplateConfig>({
    name: '',
    category: initialCategory || 'business',
    segment: initialSegment || 'general-audience',
    topic: initialTopic || '',
    slideCount: 12,
    includeCharts: true,
    includeTables: true,
    includeImages: true,
    includeTimeline: false,
    colorScheme: 'professional',
    dataTypes: ['bar-chart', 'table']
  });
  
  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let templates = modelAlignmentService.getAllTemplates();
    
    if (searchQuery) {
      templates = modelAlignmentService.searchTemplates(searchQuery);
    }
    
    if (selectedCategory) {
      templates = templates.filter(t => {
        const category = TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory);
        return category?.templates.some(ct => ct.id === t.id);
      });
    }
    
    return templates;
  }, [searchQuery, selectedCategory]);
  
  // Handle template selection
  const handleSelectTemplate = useCallback((template: TemplateDefinition) => {
    onSelectTemplate(template);
    toast.success(`Selected: ${template.name}`);
  }, [onSelectTemplate]);
  
  // Handle customize template
  const handleCustomize = useCallback((template: TemplateDefinition) => {
    setSelectedForCustomize(template);
    setCustomConfig(prev => ({
      ...prev,
      name: `Custom ${template.name}`,
      category: template.category,
      segment: template.segment,
      slideCount: template.slideCount,
      colorScheme: template.colorScheme,
      dataTypes: template.dataTypes
    }));
    setShowCustomizeDialog(true);
  }, []);
  
  // Handle generate custom template
  const handleGenerateCustom = useCallback(async () => {
    if (!customConfig.name || !customConfig.topic) {
      toast.error('Please provide a name and topic');
      return;
    }
    
    setIsGenerating(true);
    try {
      await onGenerateCustom(customConfig);
      setShowCustomizeDialog(false);
      toast.success('Custom template generated!');
    } catch (error) {
      toast.error('Failed to generate template');
    } finally {
      setIsGenerating(false);
    }
  }, [customConfig, onGenerateCustom]);
  
  // Toggle data type
  const toggleDataType = useCallback((dataType: DataRepresentationType) => {
    setCustomConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter(d => d !== dataType)
        : [...prev.dataTypes, dataType]
    }));
  }, []);
  
  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="browse">
            <Layout className="h-4 w-4 mr-2" /> Browse Templates
          </TabsTrigger>
          <TabsTrigger value="generate">
            <Wand2 className="h-4 w-4 mr-2" /> Generate Custom
          </TabsTrigger>
        </TabsList>
        
        {/* Browse Templates Tab */}
        <TabsContent value="browse" className="space-y-4 mt-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {TEMPLATE_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </Button>
            ))}
          </div>
          
          {/* Templates Grid */}
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
                    selectedTemplateId === template.id ? "border-primary ring-2 ring-primary/20" : "border-border"
                  )}
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Template Preview */}
                  <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <div className="text-center p-3">
                      <div className="flex justify-center gap-1 mb-2">
                        {template.dataTypes.slice(0, 3).map((dt, i) => {
                          const option = DATA_TYPE_OPTIONS.find(o => o.id === dt);
                          return option ? (
                            <span key={i} className="text-muted-foreground">{option.icon}</span>
                          ) : null;
                        })}
                      </div>
                      <div className="flex gap-1 justify-center">
                        {COLOR_SCHEMES.find(c => c.id === template.colorScheme)?.colors.slice(0, 4).map((color, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Template Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">{template.name}</h4>
                      {template.isPremium && (
                        <Badge variant="secondary" className="text-xs shrink-0 ml-1">
                          <Star className="h-3 w-3 mr-0.5" /> Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {template.slideCount} slides
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomize(template);
                        }}
                      >
                        <Settings2 className="h-3 w-3 mr-1" /> Customize
                      </Button>
                    </div>
                  </div>
                  
                  {/* Selected indicator */}
                  {selectedTemplateId === template.id && (
                    <div className="absolute top-2 right-2">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Generate Custom Tab */}
        <TabsContent value="generate" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                Generate Custom Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Template Name</Label>
                  <Input
                    value={customConfig.name}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Template"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Topic</Label>
                  <Input
                    value={customConfig.topic}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Q4 Sales Results"
                    className="mt-1"
                  />
                </div>
              </div>
              
              {/* Category and Segment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select 
                    value={customConfig.category}
                    onValueChange={(v) => setCustomConfig(prev => ({ ...prev, category: v as ContentCategory }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="investor-pitch">Investor Pitch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Audience</Label>
                  <Select 
                    value={customConfig.segment}
                    onValueChange={(v) => setCustomConfig(prev => ({ ...prev, segment: v as ContentSegment }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="general-audience">General Audience</SelectItem>
                      <SelectItem value="sales">Sales Team</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="investor">Investors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Slide Count */}
              <div>
                <Label className="text-xs">Number of Slides: {customConfig.slideCount}</Label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={customConfig.slideCount}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, slideCount: parseInt(e.target.value) }))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 (Quick)</span>
                  <span>30 (Comprehensive)</span>
                </div>
              </div>
              
              {/* Content Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Charts</span>
                  </div>
                  <Switch
                    checked={customConfig.includeCharts}
                    onCheckedChange={(v) => setCustomConfig(prev => ({ ...prev, includeCharts: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Tables</span>
                  </div>
                  <Switch
                    checked={customConfig.includeTables}
                    onCheckedChange={(v) => setCustomConfig(prev => ({ ...prev, includeTables: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Images</span>
                  </div>
                  <Switch
                    checked={customConfig.includeImages}
                    onCheckedChange={(v) => setCustomConfig(prev => ({ ...prev, includeImages: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Timeline</span>
                  </div>
                  <Switch
                    checked={customConfig.includeTimeline}
                    onCheckedChange={(v) => setCustomConfig(prev => ({ ...prev, includeTimeline: v }))}
                  />
                </div>
              </div>
              
              {/* Color Scheme */}
              <div>
                <Label className="text-xs mb-2 block">Color Scheme</Label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_SCHEMES.map(scheme => (
                    <button
                      key={scheme.id}
                      className={cn(
                        "p-2 rounded border-2 transition-all",
                        customConfig.colorScheme === scheme.id 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-transparent hover:border-muted"
                      )}
                      onClick={() => setCustomConfig(prev => ({ ...prev, colorScheme: scheme.id }))}
                    >
                      <div className="flex gap-0.5 justify-center mb-1">
                        {scheme.colors.map((color, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-center truncate">{scheme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Data Types */}
              <div>
                <Label className="text-xs mb-2 block">Data Visualizations</Label>
                <div className="flex flex-wrap gap-2">
                  {DATA_TYPE_OPTIONS.map(option => (
                    <Button
                      key={option.id}
                      variant={customConfig.dataTypes.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDataType(option.id)}
                    >
                      {option.icon}
                      <span className="ml-1">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <Button
                onClick={handleGenerateCustom}
                disabled={isGenerating || !customConfig.name || !customConfig.topic}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Template...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Custom Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Customize Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Customize: {selectedForCustomize?.name}
            </DialogTitle>
            <DialogDescription>
              Adjust the template to match your specific needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Same customization options as generate tab */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Custom Name</Label>
                <Input
                  value={customConfig.name}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Slide Count</Label>
                <Input
                  type="number"
                  min={5}
                  max={30}
                  value={customConfig.slideCount}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, slideCount: parseInt(e.target.value) || 12 }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs mb-2 block">Color Scheme</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_SCHEMES.map(scheme => (
                  <button
                    key={scheme.id}
                    className={cn(
                      "p-2 rounded border-2 transition-all",
                      customConfig.colorScheme === scheme.id 
                        ? "border-primary" 
                        : "border-transparent hover:border-muted"
                    )}
                    onClick={() => setCustomConfig(prev => ({ ...prev, colorScheme: scheme.id }))}
                  >
                    <div className="flex gap-0.5 justify-center mb-1">
                      {scheme.colors.map((color, i) => (
                        <div 
                          key={i} 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center">{scheme.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateCustom} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Apply Customization
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateGenerator;
