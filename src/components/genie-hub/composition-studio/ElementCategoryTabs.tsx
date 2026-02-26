/**
 * ELEMENT CATEGORY TABS
 * 
 * Organizes composition elements by type:
 * - Video: Pure AI-generated video elements
 * - Dialects: Multi-language dialect configurations
 * - Avatars: AI avatar presenters
 * - 3D: 3D models and scenes
 * - Combinations: Preset recipes combining multiple types
 * 
 * Each category supports: Add, Edit, Remove, Replace, Duplicate
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Video, User, Box, Globe, Layers, Plus, Edit, Trash2, Copy, 
  ArrowUpDown, Wand2, Play, Eye, Save, AlertCircle, Check,
  Languages, Film, CuboidIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CompositionChapter, CompositionElementType, ChapterVisual, ChapterVoiceover, AvatarStyle } from './types';

// Element category definitions
export type ElementCategory = 'video' | 'dialects' | 'avatars' | '3d' | 'combinations';

export interface CategoryElement {
  id: string;
  category: ElementCategory;
  name: string;
  description?: string;
  config: ElementConfig;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ElementConfig {
  // Video config
  videoPrompt?: string;
  videoDuration?: number;
  videoStyle?: 'cinematic' | 'professional' | 'casual' | 'animated';
  
  // Dialect config (multi-language)
  dialects?: DialectConfig[];
  primaryDialect?: string;
  
  // Avatar config
  avatarStyle?: AvatarStyle;
  avatarModel?: string;
  enableLipSync?: boolean;
  avatarScript?: string;
  
  // 3D config
  meshPrompt?: string;
  modelStyle?: 'realistic' | 'stylized' | 'low-poly';
  animationType?: 'static' | 'turntable' | 'exploded' | 'custom';
  
  // Combination config (preset recipes)
  combinationType?: CombinationType;
  componentElements?: string[]; // IDs of elements to combine
}

export interface DialectConfig {
  regionCode: string;
  regionName: string;
  languageCode: string;
  languageName: string;
  voiceProvider: 'elevenlabs' | 'azure' | 'alibaba' | 'google';
  voiceId?: string;
  script: string;
  isEnabled: boolean;
}

export type CombinationType = 
  | 'avatar_ppt'           // Avatar + PPT slides
  | 'avatar_3d_product'    // Avatar presenting 3D product
  | '3d_showcase_voice'    // 3D model with voiceover
  | 'full_production'      // Avatar + 3D + Video + Animation
  | 'dialect_showcase'     // Multi-dialect demo
  | 'interactive_demo';    // Step-by-step product demo

// Preset combination templates
export const COMBINATION_PRESETS: Record<CombinationType, { 
  name: string; 
  description: string; 
  components: ElementCategory[];
  tier: 'free' | 'creator' | 'pro' | 'business' | 'enterprise';
}> = {
  avatar_ppt: {
    name: 'Avatar + PPT',
    description: 'AI avatar narrating presentation slides',
    components: ['avatars', 'video'],
    tier: 'creator',
  },
  avatar_3d_product: {
    name: 'Avatar + 3D Product',
    description: 'AI avatar presenting a 3D product model',
    components: ['avatars', '3d'],
    tier: 'pro',
  },
  '3d_showcase_voice': {
    name: '3D Showcase + Voice',
    description: '3D model with professional voiceover',
    components: ['3d', 'dialects'],
    tier: 'pro',
  },
  full_production: {
    name: 'Full Production',
    description: 'Complete multi-modal video with all elements',
    components: ['avatars', '3d', 'video', 'dialects'],
    tier: 'business',
  },
  dialect_showcase: {
    name: 'Multi-Dialect Demo',
    description: 'Same content in multiple regional dialects',
    components: ['dialects', 'video'],
    tier: 'creator',
  },
  interactive_demo: {
    name: 'Interactive Demo',
    description: 'Step-by-step product walkthrough',
    components: ['avatars', 'video'],
    tier: 'pro',
  },
};

// Regional dialect presets
export const DIALECT_REGIONS = {
  arabic: {
    name: 'Arabic Dialects',
    dialects: [
      { code: 'ar-SA', name: 'Saudi/Gulf', voiceProvider: 'azure' as const },
      { code: 'ar-EG', name: 'Egyptian', voiceProvider: 'azure' as const },
      { code: 'ar-MA', name: 'Moroccan', voiceProvider: 'google' as const },
      { code: 'ar-LB', name: 'Levantine', voiceProvider: 'azure' as const },
    ],
  },
  indian: {
    name: 'Indian Languages',
    dialects: [
      { code: 'hi-IN', name: 'Hindi', voiceProvider: 'azure' as const },
      { code: 'ta-IN', name: 'Tamil', voiceProvider: 'azure' as const },
      { code: 'te-IN', name: 'Telugu', voiceProvider: 'azure' as const },
      { code: 'bn-IN', name: 'Bengali', voiceProvider: 'azure' as const },
      { code: 'mr-IN', name: 'Marathi', voiceProvider: 'azure' as const },
    ],
  },
  african: {
    name: 'African Languages',
    dialects: [
      { code: 'sw-KE', name: 'Swahili', voiceProvider: 'google' as const },
      { code: 'am-ET', name: 'Amharic', voiceProvider: 'google' as const },
      { code: 'yo-NG', name: 'Yoruba', voiceProvider: 'google' as const },
      { code: 'zu-ZA', name: 'Zulu', voiceProvider: 'azure' as const },
    ],
  },
  indoAsian: {
    name: 'Indo-Asian Languages',
    dialects: [
      { code: 'id-ID', name: 'Indonesian', voiceProvider: 'azure' as const },
      { code: 'ms-MY', name: 'Malay', voiceProvider: 'azure' as const },
      { code: 'th-TH', name: 'Thai', voiceProvider: 'azure' as const },
      { code: 'vi-VN', name: 'Vietnamese', voiceProvider: 'azure' as const },
      { code: 'tl-PH', name: 'Filipino', voiceProvider: 'google' as const },
    ],
  },
  cjk: {
    name: 'CJK Languages',
    dialects: [
      { code: 'zh-CN', name: 'Mandarin (Simplified)', voiceProvider: 'alibaba' as const },
      { code: 'zh-TW', name: 'Mandarin (Traditional)', voiceProvider: 'alibaba' as const },
      { code: 'ja-JP', name: 'Japanese', voiceProvider: 'alibaba' as const },
      { code: 'ko-KR', name: 'Korean', voiceProvider: 'azure' as const },
      { code: 'yue-CN', name: 'Cantonese', voiceProvider: 'alibaba' as const },
    ],
  },
};

interface ElementCategoryTabsProps {
  elements: CategoryElement[];
  onElementsChange: (elements: CategoryElement[]) => void;
  currentTier?: 'free' | 'creator' | 'pro' | 'business' | 'enterprise';
  className?: string;
}

export const ElementCategoryTabs: React.FC<ElementCategoryTabsProps> = ({
  elements,
  onElementsChange,
  currentTier = 'pro',
  className,
}) => {
  const [activeTab, setActiveTab] = useState<ElementCategory>('video');
  const [editingElement, setEditingElement] = useState<CategoryElement | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newElementType, setNewElementType] = useState<ElementCategory>('video');

  // Filter elements by category
  const getElementsByCategory = (category: ElementCategory) => 
    elements.filter(e => e.category === category).sort((a, b) => a.order - b.order);

  // CRUD operations
  const addElement = (category: ElementCategory, config?: Partial<ElementConfig>) => {
    const newElement: CategoryElement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      name: `New ${category.charAt(0).toUpperCase() + category.slice(1)} Element`,
      config: config || getDefaultConfig(category),
      order: elements.filter(e => e.category === category).length + 1,
      isActive: true,
      createdAt: new Date(),
    };
    onElementsChange([...elements, newElement]);
    setEditingElement(newElement);
    toast.success(`Added new ${category} element`);
  };

  const updateElement = (updated: CategoryElement) => {
    onElementsChange(elements.map(e => e.id === updated.id ? updated : e));
    setEditingElement(null);
    toast.success('Element updated');
  };

  const deleteElement = (id: string) => {
    onElementsChange(elements.filter(e => e.id !== id));
    toast.success('Element removed');
  };

  const duplicateElement = (element: CategoryElement) => {
    const duplicate: CategoryElement = {
      ...element,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${element.name} (Copy)`,
      order: elements.filter(e => e.category === element.category).length + 1,
      createdAt: new Date(),
    };
    onElementsChange([...elements, duplicate]);
    toast.success('Element duplicated');
  };

  const reorderElements = (category: ElementCategory, fromIndex: number, toIndex: number) => {
    const categoryElements = getElementsByCategory(category);
    const [removed] = categoryElements.splice(fromIndex, 1);
    categoryElements.splice(toIndex, 0, removed);
    
    const reordered = categoryElements.map((e, i) => ({ ...e, order: i + 1 }));
    const otherElements = elements.filter(e => e.category !== category);
    onElementsChange([...otherElements, ...reordered]);
  };

  const getDefaultConfig = (category: ElementCategory): ElementConfig => {
    switch (category) {
      case 'video':
        return { videoPrompt: '', videoDuration: 30, videoStyle: 'professional' };
      case 'dialects':
        return { dialects: [], primaryDialect: 'en' };
      case 'avatars':
        return { avatarStyle: 'professional_western', enableLipSync: true, avatarScript: '' };
      case '3d':
        return { meshPrompt: '', modelStyle: 'realistic', animationType: 'turntable' };
      case 'combinations':
        return { combinationType: 'avatar_ppt', componentElements: [] };
      default:
        return {};
    }
  };

  // Check tier access for combinations
  const canAccessCombination = (type: CombinationType): boolean => {
    const preset = COMBINATION_PRESETS[type];
    const tierLevels = { free: 0, creator: 1, pro: 2, business: 3, enterprise: 4 };
    return tierLevels[currentTier] >= tierLevels[preset.tier];
  };

  const renderCategoryContent = (category: ElementCategory) => {
    const categoryElements = getElementsByCategory(category);
    
    return (
      <div className="space-y-4">
        {/* Category header with add button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold capitalize">{category} Elements</h3>
            <p className="text-sm text-muted-foreground">
              {getCategoryDescription(category)}
            </p>
          </div>
          <Button onClick={() => addElement(category)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add {category}
          </Button>
        </div>

        <Separator />

        {/* Elements list */}
        <ScrollArea className="h-[400px]">
          {categoryElements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              {getCategoryIcon(category)}
              <p className="text-muted-foreground mt-2">No {category} elements yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => addElement(category)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Element
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryElements.map((element, index) => (
                <Card 
                  key={element.id} 
                  className={cn(
                    "border transition-all",
                    !element.isActive && "opacity-50"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{element.name}</h4>
                          {element.description && (
                            <p className="text-sm text-muted-foreground">{element.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {renderElementBadges(element)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingElement(element)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => duplicateElement(element)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteElement(element.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Preset templates for category */}
        {category === 'combinations' && (
          <div className="mt-4">
            <h4 className="font-medium mb-3">Preset Combinations</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(COMBINATION_PRESETS).map(([type, preset]) => {
                const isAccessible = canAccessCombination(type as CombinationType);
                return (
                  <Card 
                    key={type}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      !isAccessible && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => isAccessible && addElement('combinations', { combinationType: type as CombinationType })}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{preset.name}</h5>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                        <Badge variant={isAccessible ? 'default' : 'secondary'} className="text-xs">
                          {preset.tier}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Dialect region templates */}
        {category === 'dialects' && (
          <div className="mt-4">
            <h4 className="font-medium mb-3">Quick Add by Region</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DIALECT_REGIONS).map(([key, region]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => addElement('dialects', {
                    dialects: region.dialects.map(d => ({
                      regionCode: key,
                      regionName: region.name,
                      languageCode: d.code,
                      languageName: d.name,
                      voiceProvider: d.voiceProvider,
                      script: '',
                      isEnabled: true,
                    })),
                    primaryDialect: region.dialects[0].code,
                  })}
                >
                  <Globe className="w-3 h-3 mr-2" />
                  {region.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getCategoryIcon = (category: ElementCategory) => {
    switch (category) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'dialects': return <Languages className="w-5 h-5" />;
      case 'avatars': return <User className="w-5 h-5" />;
      case '3d': return <CuboidIcon className="w-5 h-5" />;
      case 'combinations': return <Layers className="w-5 h-5" />;
    }
  };

  const getCategoryDescription = (category: ElementCategory) => {
    switch (category) {
      case 'video': return 'Pure AI-generated video clips and animations';
      case 'dialects': return 'Multi-language and regional dialect configurations';
      case 'avatars': return 'AI avatar presenters with lip-sync';
      case '3d': return '3D models, scenes, and product showcases';
      case 'combinations': return 'Preset recipes combining multiple element types';
    }
  };

  const renderElementBadges = (element: CategoryElement) => {
    const badges: React.ReactNode[] = [];
    
    if (element.category === 'dialects' && element.config.dialects) {
      badges.push(
        <Badge key="dialects" variant="outline" className="text-xs">
          {element.config.dialects.length} dialects
        </Badge>
      );
    }
    
    if (element.category === 'avatars' && element.config.enableLipSync) {
      badges.push(
        <Badge key="lipsync" variant="secondary" className="text-xs">
          Lip-Sync
        </Badge>
      );
    }
    
    if (element.category === 'video' && element.config.videoDuration) {
      badges.push(
        <Badge key="duration" variant="outline" className="text-xs">
          {element.config.videoDuration}s
        </Badge>
      );
    }
    
    if (element.category === 'combinations' && element.config.combinationType) {
      const preset = COMBINATION_PRESETS[element.config.combinationType];
      badges.push(
        <Badge key="combo" variant="default" className="text-xs">
          {preset?.name || element.config.combinationType}
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ElementCategory)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="video" className="gap-2">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {getElementsByCategory('video').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="dialects" className="gap-2">
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">Dialects</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {getElementsByCategory('dialects').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="avatars" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Avatars</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {getElementsByCategory('avatars').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="3d" className="gap-2">
            <CuboidIcon className="w-4 h-4" />
            <span className="hidden sm:inline">3D</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {getElementsByCategory('3d').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="combinations" className="gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Combos</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {getElementsByCategory('combinations').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
          {renderCategoryContent('video')}
        </TabsContent>
        <TabsContent value="dialects" className="mt-4">
          {renderCategoryContent('dialects')}
        </TabsContent>
        <TabsContent value="avatars" className="mt-4">
          {renderCategoryContent('avatars')}
        </TabsContent>
        <TabsContent value="3d" className="mt-4">
          {renderCategoryContent('3d')}
        </TabsContent>
        <TabsContent value="combinations" className="mt-4">
          {renderCategoryContent('combinations')}
        </TabsContent>
      </Tabs>

      {/* Edit Element Dialog */}
      <ElementEditDialog
        element={editingElement}
        onClose={() => setEditingElement(null)}
        onSave={updateElement}
      />
    </div>
  );
};

// Edit dialog component
interface ElementEditDialogProps {
  element: CategoryElement | null;
  onClose: () => void;
  onSave: (element: CategoryElement) => void;
}

const ElementEditDialog: React.FC<ElementEditDialogProps> = ({ element, onClose, onSave }) => {
  const [localElement, setLocalElement] = useState<CategoryElement | null>(element);

  React.useEffect(() => {
    setLocalElement(element);
  }, [element]);

  if (!localElement) return null;

  const updateConfig = (updates: Partial<ElementConfig>) => {
    setLocalElement({
      ...localElement,
      config: { ...localElement.config, ...updates },
    });
  };

  return (
    <Dialog open={!!element} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {localElement.category.charAt(0).toUpperCase() + localElement.category.slice(1)} Element</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Element Name</Label>
            <Input
              value={localElement.name}
              onChange={(e) => setLocalElement({ ...localElement, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={localElement.description || ''}
              onChange={(e) => setLocalElement({ ...localElement, description: e.target.value })}
              rows={2}
            />
          </div>

          <Separator />

          {/* Category-specific fields */}
          {localElement.category === 'video' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Video Prompt</Label>
                <Textarea
                  value={localElement.config.videoPrompt || ''}
                  onChange={(e) => updateConfig({ videoPrompt: e.target.value })}
                  placeholder="Describe the video you want to generate..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={localElement.config.videoDuration || 30}
                    onChange={(e) => updateConfig({ videoDuration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select
                    value={localElement.config.videoStyle || 'professional'}
                    onValueChange={(v) => updateConfig({ videoStyle: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="animated">Animated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {localElement.category === 'avatars' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Avatar Style</Label>
                <Select
                  value={localElement.config.avatarStyle || 'professional_western'}
                  onValueChange={(v) => updateConfig({ avatarStyle: v as AvatarStyle })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional_western">Professional (Western)</SelectItem>
                    <SelectItem value="professional_mena">Professional (MENA)</SelectItem>
                    <SelectItem value="professional_cjk">Professional (CJK)</SelectItem>
                    <SelectItem value="professional_south_asian">Professional (South Asian)</SelectItem>
                    <SelectItem value="professional_latam">Professional (LATAM)</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Script</Label>
                <Textarea
                  value={localElement.config.avatarScript || ''}
                  onChange={(e) => updateConfig({ avatarScript: e.target.value })}
                  placeholder="What should the avatar say..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lipsync"
                  checked={localElement.config.enableLipSync ?? true}
                  onChange={(e) => updateConfig({ enableLipSync: e.target.checked })}
                />
                <Label htmlFor="lipsync">Enable Lip-Sync</Label>
              </div>
            </div>
          )}

          {localElement.category === '3d' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>3D Prompt</Label>
                <Textarea
                  value={localElement.config.meshPrompt || ''}
                  onChange={(e) => updateConfig({ meshPrompt: e.target.value })}
                  placeholder="Describe the 3D model..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model Style</Label>
                  <Select
                    value={localElement.config.modelStyle || 'realistic'}
                    onValueChange={(v) => updateConfig({ modelStyle: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="stylized">Stylized</SelectItem>
                      <SelectItem value="low-poly">Low Poly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Animation</Label>
                  <Select
                    value={localElement.config.animationType || 'turntable'}
                    onValueChange={(v) => updateConfig({ animationType: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="turntable">Turntable</SelectItem>
                      <SelectItem value="exploded">Exploded View</SelectItem>
                      <SelectItem value="custom">Custom Animation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(localElement)}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ElementCategoryTabs;
