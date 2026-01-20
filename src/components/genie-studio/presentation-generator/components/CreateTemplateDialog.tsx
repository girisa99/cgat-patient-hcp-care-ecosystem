/**
 * CreateTemplateDialog - Dialog for creating new frameworks and templates
 * Includes AI model configuration with confidence scores
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Briefcase,
  Layers,
  Globe,
  Lock,
  Sparkles,
  Loader2,
  Wand2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useTemplateLibrary, {
  type ConsultingFramework,
  type IndustryTemplate,
  type TemplateAIModelConfig,
  getRecommendedAIConfig,
} from '@/hooks/useTemplateLibrary';
import { TemplateAIModelSelector } from './TemplateAIModelSelector';

// Framework categories
const FRAMEWORK_CATEGORIES = [
  { id: 'strategy', label: 'Strategy' },
  { id: 'growth', label: 'Growth' },
  { id: 'operations', label: 'Operations' },
  { id: 'universal', label: 'Universal' },
  { id: 'industry-specific', label: 'Industry-Specific' },
  { id: 'custom', label: 'Custom' },
] as const;

// Visual styles
const VISUAL_STYLES = [
  { id: 'minimal', label: 'Minimal', description: 'Clean, text-focused layouts' },
  { id: 'balanced', label: 'Balanced', description: 'Mix of visuals and content' },
  { id: 'data-heavy', label: 'Data Heavy', description: 'Charts, graphs, dashboards' },
] as const;

// Industries
const INDUSTRIES = [
  'Healthcare', 'Technology', 'Finance', 'Manufacturing', 'Retail',
  'Consulting', 'Education', 'Energy', 'Pharma', 'Legal', 'Real Estate',
  'Travel', 'Media', 'Automotive', 'Aerospace', 'Government', 'Other',
];

// Template types
const TEMPLATE_TYPES = [
  { id: 'presentation', label: 'Presentation' },
  { id: 'pitch-deck', label: 'Pitch Deck' },
  { id: 'report', label: 'Report' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'training', label: 'Training' },
  { id: 'infographic', label: 'Infographic' },
];

interface CreateTemplateDialogProps {
  type: 'framework' | 'template';
  trigger?: React.ReactNode;
  onCreated?: (item: ConsultingFramework | IndustryTemplate) => void;
  defaultIndustry?: string;
  defaultLanguages?: string[];
}

export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  type,
  trigger,
  onCreated,
  defaultIndustry = '',
  defaultLanguages = [],
}) => {
  const { createFramework, createTemplate } = useTemplateLibrary();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'ai-config'>('details');

  // Form state for framework
  const [frameworkForm, setFrameworkForm] = useState({
    name: '',
    description: '',
    category: 'custom' as ConsultingFramework['category'],
    frameworks: [] as string[],
    newFramework: '',
    tags: '',
    useCases: '',
    visualStyle: 'balanced' as ConsultingFramework['visualStyle'],
    industries: [] as string[],
    visibility: 'private' as ConsultingFramework['visibility'],
  });

  // Form state for template
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    industry: defaultIndustry,
    subIndustry: '',
    templateType: 'presentation',
    frameworks: '',
    tags: '',
    recommendedVisuals: '',
    visibility: 'private' as IndustryTemplate['visibility'],
  });

  // AI Model config
  const [aiConfig, setAIConfig] = useState<TemplateAIModelConfig>(() => 
    getRecommendedAIConfig(defaultIndustry, defaultLanguages)
  );

  // Get current industry for AI recommendations
  const currentIndustry = type === 'framework' 
    ? frameworkForm.industries[0] || '' 
    : templateForm.industry;

  // Update AI config when industry changes
  const handleIndustryChange = (industry: string) => {
    if (type === 'template') {
      setTemplateForm(prev => ({ ...prev, industry }));
    } else {
      setFrameworkForm(prev => ({ 
        ...prev, 
        industries: prev.industries.includes(industry) 
          ? prev.industries.filter(i => i !== industry)
          : [...prev.industries, industry]
      }));
    }
    setAIConfig(getRecommendedAIConfig(industry, defaultLanguages));
  };

  // Add framework item
  const addFrameworkItem = () => {
    if (frameworkForm.newFramework.trim()) {
      setFrameworkForm(prev => ({
        ...prev,
        frameworks: [...prev.frameworks, prev.newFramework.trim()],
        newFramework: '',
      }));
    }
  };

  // Remove framework item
  const removeFrameworkItem = (index: number) => {
    setFrameworkForm(prev => ({
      ...prev,
      frameworks: prev.frameworks.filter((_, i) => i !== index),
    }));
  };

  // Handle create
  const handleCreate = async () => {
    setIsCreating(true);
    try {
      if (type === 'framework') {
        const result = await createFramework({
          name: frameworkForm.name,
          description: frameworkForm.description,
          category: frameworkForm.category,
          frameworks: frameworkForm.frameworks,
          tags: frameworkForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          useCases: frameworkForm.useCases.split(',').map(t => t.trim()).filter(Boolean),
          visualStyle: frameworkForm.visualStyle,
          industries: frameworkForm.industries,
          visibility: frameworkForm.visibility,
        }, aiConfig);
        
        if (result) {
          onCreated?.(result);
          setOpen(false);
          resetForm();
        }
      } else {
        const result = await createTemplate({
          name: templateForm.name,
          description: templateForm.description,
          industry: templateForm.industry,
          subIndustry: templateForm.subIndustry,
          templateType: templateForm.templateType,
          frameworks: templateForm.frameworks.split(',').map(t => t.trim()).filter(Boolean),
          tags: templateForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          slideSuggestions: [],
          recommendedVisuals: templateForm.recommendedVisuals.split(',').map(t => t.trim()).filter(Boolean),
          visibility: templateForm.visibility,
        }, aiConfig);
        
        if (result) {
          onCreated?.(result);
          setOpen(false);
          resetForm();
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFrameworkForm({
      name: '',
      description: '',
      category: 'custom',
      frameworks: [],
      newFramework: '',
      tags: '',
      useCases: '',
      visualStyle: 'balanced',
      industries: [],
      visibility: 'private',
    });
    setTemplateForm({
      name: '',
      description: '',
      industry: defaultIndustry,
      subIndustry: '',
      templateType: 'presentation',
      frameworks: '',
      tags: '',
      recommendedVisuals: '',
      visibility: 'private',
    });
    setActiveTab('details');
  };

  // Validation
  const isValid = type === 'framework'
    ? frameworkForm.name.trim() && frameworkForm.frameworks.length > 0
    : templateForm.name.trim() && templateForm.industry;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create {type === 'framework' ? 'Framework' : 'Template'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            {type === 'framework' ? (
              <Briefcase className="h-5 w-5 text-primary" />
            ) : (
              <Layers className="h-5 w-5 text-primary" />
            )}
            Create New {type === 'framework' ? 'Consulting Framework' : 'Industry Template'}
          </DialogTitle>
          <DialogDescription>
            {type === 'framework'
              ? 'Define a reusable consulting framework with AI-optimized generation settings'
              : 'Create an industry-specific template with AI model configuration'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="details" className="gap-2">
              <Layers className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="ai-config" className="gap-2">
              <Wand2 className="h-4 w-4" />
              AI Models
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto mt-4 pr-2" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            <TabsContent value="details" className="mt-4 space-y-4 pr-4">
              {type === 'framework' ? (
                // Framework form
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Framework Name *</Label>
                      <Input
                        placeholder="e.g., Strategic Growth Matrix"
                        value={frameworkForm.name}
                        onChange={(e) => setFrameworkForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select 
                        value={frameworkForm.category} 
                        onValueChange={(v) => setFrameworkForm(prev => ({ ...prev, category: v as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FRAMEWORK_CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe when and how to use this framework..."
                      value={frameworkForm.description}
                      onChange={(e) => setFrameworkForm(prev => ({ ...prev, description: e.target.value }))}
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Framework Components *</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add component (e.g., 'Market Analysis')"
                        value={frameworkForm.newFramework}
                        onChange={(e) => setFrameworkForm(prev => ({ ...prev, newFramework: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFrameworkItem())}
                      />
                      <Button type="button" onClick={addFrameworkItem} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {frameworkForm.frameworks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {frameworkForm.frameworks.map((f, i) => (
                          <Badge key={i} variant="secondary" className="gap-1 pr-1">
                            {f}
                            <button onClick={() => removeFrameworkItem(i)} className="ml-1 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Visual Style</Label>
                      <Select 
                        value={frameworkForm.visualStyle} 
                        onValueChange={(v) => setFrameworkForm(prev => ({ ...prev, visualStyle: v as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISUAL_STYLES.map(style => (
                            <SelectItem key={style.id} value={style.id}>
                              <div>
                                <span className="font-medium">{style.label}</span>
                                <span className="text-xs text-muted-foreground ml-2">{style.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Use Cases (comma-separated)</Label>
                      <Input
                        placeholder="strategic, investor, proposal"
                        value={frameworkForm.useCases}
                        onChange={(e) => setFrameworkForm(prev => ({ ...prev, useCases: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Industries</Label>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map(ind => (
                        <Badge
                          key={ind}
                          variant={frameworkForm.industries.includes(ind) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleIndustryChange(ind)}
                        >
                          {ind}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Template form
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name *</Label>
                      <Input
                        placeholder="e.g., Healthcare Executive Summary"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry *</Label>
                      <Select 
                        value={templateForm.industry} 
                        onValueChange={handleIndustryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map(ind => (
                            <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sub-Industry</Label>
                      <Input
                        placeholder="e.g., Biotech, Fintech"
                        value={templateForm.subIndustry}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, subIndustry: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Template Type</Label>
                      <Select 
                        value={templateForm.templateType} 
                        onValueChange={(v) => setTemplateForm(prev => ({ ...prev, templateType: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_TYPES.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe when and how to use this template..."
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frameworks (comma-separated)</Label>
                      <Input
                        placeholder="SWOT, BCG Matrix, Value Chain"
                        value={templateForm.frameworks}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, frameworks: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Recommended Visuals (comma-separated)</Label>
                      <Input
                        placeholder="charts, timelines, flowcharts"
                        value={templateForm.recommendedVisuals}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, recommendedVisuals: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Common fields */}
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="strategic, executive, quarterly"
                    value={type === 'framework' ? frameworkForm.tags : templateForm.tags}
                    onChange={(e) => type === 'framework' 
                      ? setFrameworkForm(prev => ({ ...prev, tags: e.target.value }))
                      : setTemplateForm(prev => ({ ...prev, tags: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      {(type === 'framework' ? frameworkForm.visibility : templateForm.visibility) === 'public' 
                        ? <Globe className="h-4 w-4 text-primary" /> 
                        : <Lock className="h-4 w-4 text-muted-foreground" />
                      }
                      <div>
                        <p className="text-sm font-medium">
                          {(type === 'framework' ? frameworkForm.visibility : templateForm.visibility) === 'public' 
                            ? 'Public' 
                            : 'Private'
                          }
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={(type === 'framework' ? frameworkForm.visibility : templateForm.visibility) === 'public'}
                      onCheckedChange={(checked) => {
                        const visibility = checked ? 'public' : 'private';
                        if (type === 'framework') {
                          setFrameworkForm(prev => ({ ...prev, visibility }));
                        } else {
                          setTemplateForm(prev => ({ ...prev, visibility }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-config" className="mt-4 pr-4">
              <TemplateAIModelSelector
                industry={currentIndustry}
                languages={defaultLanguages}
                value={aiConfig}
                onChange={setAIConfig}
                showRecommendations
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4 shrink-0 border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid || isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create {type === 'framework' ? 'Framework' : 'Template'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;
