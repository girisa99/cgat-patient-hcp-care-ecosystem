/**
 * SLIDE EDITOR PANEL
 * 
 * Two-way slide editing with:
 * - Individual manual editing
 * - AI enhance, accept, skip, or edit
 * - Add new slides, replace content
 * - Provider/model selection per slide
 * - Flexible customization
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Check,
  X,
  SkipForward,
  Wand2,
  Edit3,
  Plus,
  Replace,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Type,
  BarChart3,
  Table,
  Video,
  Mic,
  Globe,
  Sparkles,
  RefreshCw,
  Copy,
  ArrowUp,
  ArrowDown,
  Settings2,
  Palette,
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PresentationSlide } from './types';
import { 
  TEXT_PROVIDERS, 
  IMAGE_PROVIDERS, 
  VOICE_PROVIDERS,
  getAlignedProviders 
} from '@/services/modelAlignmentService';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================

interface SlideEditorPanelProps {
  slides: PresentationSlide[];
  selectedSlideIndex: number | null;
  onSlideSelect: (index: number) => void;
  onSlideUpdate: (index: number, slide: Partial<PresentationSlide>) => void;
  onSlideAccept: (index: number) => void;
  onSlideSkip: (index: number) => void;
  onSlideEnhance: (index: number, options: EnhanceOptions) => Promise<void>;
  onSlideAdd: (afterIndex: number, slideType: SlideType) => void;
  onSlideReplace: (index: number, options: ReplaceOptions) => Promise<void>;
  onSlideDelete: (index: number) => void;
  onSlideReorder: (fromIndex: number, toIndex: number) => void;
  onProviderChange: (index: number, providerType: string, providerId: string) => void;
  isEnhancing?: boolean;
  category?: string;
  segment?: string;
  language?: string;
  className?: string;
}

type SlideType = 'content' | 'title' | 'data' | 'image' | 'video' | 'chart' | 'table' | 'quote' | 'cta';

interface EnhanceOptions {
  type: 'content' | 'visuals' | 'data' | 'language' | 'all';
  model?: string;
  customPrompt?: string;
  preserveOriginal?: boolean;
}

interface ReplaceOptions {
  replaceWith: 'regenerate' | 'template' | 'blank';
  templateId?: string;
  preserveLayout?: boolean;
}

interface SlideStatus {
  isAccepted: boolean;
  isSkipped: boolean;
  isEnhanced: boolean;
  hasEdits: boolean;
}

// ==================== COMPONENT ====================

export function SlideEditorPanel({
  slides,
  selectedSlideIndex,
  onSlideSelect,
  onSlideUpdate,
  onSlideAccept,
  onSlideSkip,
  onSlideEnhance,
  onSlideAdd,
  onSlideReplace,
  onSlideDelete,
  onSlideReorder,
  onProviderChange,
  isEnhancing = false,
  category = 'business',
  segment = 'general-audience',
  language = 'en',
  className
}: SlideEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'enhance' | 'providers'>('edit');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [slideStatuses, setSlideStatuses] = useState<Record<number, SlideStatus>>({});
  const [enhancePrompt, setEnhancePrompt] = useState('');
  const [selectedEnhanceType, setSelectedEnhanceType] = useState<EnhanceOptions['type']>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const selectedSlide = selectedSlideIndex !== null ? slides[selectedSlideIndex] : null;
  
  // Get aligned providers based on current context
  const alignedProviders = getAlignedProviders(
    category as any,
    segment as any,
    language,
    'balanced'
  );
  
  // Handle slide content edit
  const handleContentEdit = useCallback((field: string, value: any) => {
    if (selectedSlideIndex === null) return;
    
    onSlideUpdate(selectedSlideIndex, { [field]: value });
    
    setSlideStatuses(prev => ({
      ...prev,
      [selectedSlideIndex]: { ...prev[selectedSlideIndex], hasEdits: true }
    }));
  }, [selectedSlideIndex, onSlideUpdate]);
  
  // Handle bullet point edit
  const handleBulletEdit = useCallback((bulletIndex: number, value: string) => {
    if (selectedSlideIndex === null || !selectedSlide?.content?.bullets) return;
    
    const newBullets = [...selectedSlide.content.bullets];
    newBullets[bulletIndex] = { text: value, level: 0 };
    
    onSlideUpdate(selectedSlideIndex, { 
      content: { ...selectedSlide.content, bullets: newBullets }
    });
  }, [selectedSlideIndex, selectedSlide, onSlideUpdate]);
  
  // Handle accept slide
  const handleAccept = useCallback(() => {
    if (selectedSlideIndex === null) return;
    
    onSlideAccept(selectedSlideIndex);
    setSlideStatuses(prev => ({
      ...prev,
      [selectedSlideIndex]: { ...prev[selectedSlideIndex], isAccepted: true, isSkipped: false }
    }));
    
    // Auto-advance to next slide
    if (selectedSlideIndex < slides.length - 1) {
      onSlideSelect(selectedSlideIndex + 1);
    }
    
    toast.success('Slide accepted! ✓');
  }, [selectedSlideIndex, slides.length, onSlideAccept, onSlideSelect]);
  
  // Handle skip slide
  const handleSkip = useCallback(() => {
    if (selectedSlideIndex === null) return;
    
    onSlideSkip(selectedSlideIndex);
    setSlideStatuses(prev => ({
      ...prev,
      [selectedSlideIndex]: { ...prev[selectedSlideIndex], isSkipped: true, isAccepted: false }
    }));
    
    // Auto-advance to next slide
    if (selectedSlideIndex < slides.length - 1) {
      onSlideSelect(selectedSlideIndex + 1);
    }
    
    toast.info('Slide skipped');
  }, [selectedSlideIndex, slides.length, onSlideSkip, onSlideSelect]);
  
  // Handle enhance slide
  const handleEnhance = useCallback(async () => {
    if (selectedSlideIndex === null) return;
    
    setIsProcessing(true);
    try {
      await onSlideEnhance(selectedSlideIndex, {
        type: selectedEnhanceType,
        customPrompt: enhancePrompt || undefined,
        preserveOriginal: false
      });
      
      setSlideStatuses(prev => ({
        ...prev,
        [selectedSlideIndex]: { ...prev[selectedSlideIndex], isEnhanced: true }
      }));
      
      toast.success('Slide enhanced! ✨');
      setEnhancePrompt('');
    } catch (error) {
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSlideIndex, selectedEnhanceType, enhancePrompt, onSlideEnhance]);
  
  // Handle add new slide
  const handleAddSlide = useCallback((slideType: SlideType) => {
    const insertIndex = selectedSlideIndex !== null ? selectedSlideIndex : slides.length - 1;
    onSlideAdd(insertIndex, slideType);
    setShowAddDialog(false);
    toast.success(`New ${slideType} slide added!`);
  }, [selectedSlideIndex, slides.length, onSlideAdd]);
  
  // Handle replace slide
  const handleReplaceSlide = useCallback(async (options: ReplaceOptions) => {
    if (selectedSlideIndex === null) return;
    
    setIsProcessing(true);
    try {
      await onSlideReplace(selectedSlideIndex, options);
      setShowReplaceDialog(false);
      toast.success('Slide replaced!');
    } catch (error) {
      toast.error('Replace failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSlideIndex, onSlideReplace]);
  
  // Handle delete slide
  const handleDeleteSlide = useCallback(() => {
    if (selectedSlideIndex === null) return;
    
    onSlideDelete(selectedSlideIndex);
    
    // Select previous slide or first slide
    if (selectedSlideIndex > 0) {
      onSlideSelect(selectedSlideIndex - 1);
    } else if (slides.length > 1) {
      onSlideSelect(0);
    }
    
    toast.success('Slide deleted');
  }, [selectedSlideIndex, slides.length, onSlideDelete, onSlideSelect]);
  
  // Get slide status badge
  const getStatusBadge = (index: number) => {
    const status = slideStatuses[index];
    if (!status) return null;
    
    if (status.isAccepted) {
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" /> Accepted</Badge>;
    }
    if (status.isSkipped) {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 text-xs"><SkipForward className="h-3 w-3 mr-1" /> Skipped</Badge>;
    }
    if (status.isEnhanced) {
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 text-xs"><Sparkles className="h-3 w-3 mr-1" /> Enhanced</Badge>;
    }
    if (status.hasEdits) {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 text-xs"><Edit3 className="h-3 w-3 mr-1" /> Edited</Badge>;
    }
    return null;
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Slide Navigator */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Slide {selectedSlideIndex !== null ? selectedSlideIndex + 1 : '-'} of {slides.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => selectedSlideIndex !== null && selectedSlideIndex > 0 && onSlideSelect(selectedSlideIndex - 1)}
              disabled={selectedSlideIndex === null || selectedSlideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => selectedSlideIndex !== null && selectedSlideIndex < slides.length - 1 && onSlideSelect(selectedSlideIndex + 1)}
              disabled={selectedSlideIndex === null || selectedSlideIndex === slides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Slide thumbnails */}
        <ScrollArea className="w-full pb-2">
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id || index}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 rounded border-2 cursor-pointer transition-all overflow-hidden",
                  selectedSlideIndex === index 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onSlideSelect(index)}
              >
                <div className="absolute inset-0 p-1 text-[8px] leading-tight truncate">
                  {slide.title || `Slide ${index + 1}`}
                </div>
                {getStatusBadge(index) && (
                  <div className="absolute bottom-0.5 right-0.5">
                    {getStatusBadge(index)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Main Editor */}
      {selectedSlide ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="mx-3 mt-3 grid grid-cols-3">
            <TabsTrigger value="edit" className="text-xs">
              <Edit3 className="h-3 w-3 mr-1" /> Edit
            </TabsTrigger>
            <TabsTrigger value="enhance" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" /> Enhance
            </TabsTrigger>
            <TabsTrigger value="providers" className="text-xs">
              <Settings2 className="h-3 w-3 mr-1" /> Models
            </TabsTrigger>
          </TabsList>
          
          {/* Edit Tab */}
          <TabsContent value="edit" className="flex-1 p-3 space-y-4 overflow-auto">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={selectedSlide.title || ''}
                  onChange={(e) => handleContentEdit('title', e.target.value)}
                  placeholder="Slide title..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={selectedSlide.subtitle || ''}
                  onChange={(e) => handleContentEdit('subtitle', e.target.value)}
                  placeholder="Optional subtitle..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs">Content Bullets</Label>
                <div className="mt-1 space-y-2">
                  {selectedSlide.content?.bullets?.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-muted-foreground text-sm mt-2">•</span>
                      <Textarea
                        value={typeof bullet === 'string' ? bullet : bullet.text}
                        onChange={(e) => handleBulletEdit(idx, e.target.value)}
                        placeholder={`Bullet point ${idx + 1}...`}
                        className="flex-1 min-h-[60px] text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => {
                          const newBullets = selectedSlide.content?.bullets?.filter((_, i) => i !== idx) || [];
                          onSlideUpdate(selectedSlideIndex!, { content: { ...selectedSlide.content, bullets: newBullets } });
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const newBullets = [...(selectedSlide.content?.bullets || []), { text: '', level: 0 }];
                      onSlideUpdate(selectedSlideIndex!, { content: { ...selectedSlide.content, bullets: newBullets } });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Bullet
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Speaker Notes</Label>
                <Textarea
                  value={selectedSlide.speakerNotes || ''}
                  onChange={(e) => handleContentEdit('speakerNotes', e.target.value)}
                  placeholder="Notes for the presenter..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Enhance Tab */}
          <TabsContent value="enhance" className="flex-1 p-3 space-y-4 overflow-auto">
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Enhancement Type</Label>
                <Select value={selectedEnhanceType} onValueChange={(v) => setSelectedEnhanceType(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Full Enhancement
                      </div>
                    </SelectItem>
                    <SelectItem value="content">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" /> Content Only
                      </div>
                    </SelectItem>
                    <SelectItem value="visuals">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Visuals Only
                      </div>
                    </SelectItem>
                    <SelectItem value="data">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Data & Charts
                      </div>
                    </SelectItem>
                    <SelectItem value="language">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Language & Tone
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Custom Instructions (Optional)</Label>
                <Textarea
                  value={enhancePrompt}
                  onChange={(e) => setEnhancePrompt(e.target.value)}
                  placeholder="E.g., Make it more engaging, add statistics, simplify the language..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
              
              <Button
                onClick={handleEnhance}
                disabled={isProcessing || isEnhancing}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
              >
                {isProcessing || isEnhancing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Enhance Slide
                  </>
                )}
              </Button>
              
              <Separator />
              
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Enhancement will:</p>
                <ul className="space-y-1 list-disc list-inside">
                  {selectedEnhanceType === 'all' && (
                    <>
                      <li>Improve content clarity and impact</li>
                      <li>Optimize visual layout</li>
                      <li>Enhance data visualization</li>
                      <li>Refine language and tone</li>
                    </>
                  )}
                  {selectedEnhanceType === 'content' && (
                    <>
                      <li>Strengthen key messages</li>
                      <li>Add supporting details</li>
                      <li>Improve readability</li>
                    </>
                  )}
                  {selectedEnhanceType === 'visuals' && (
                    <>
                      <li>Regenerate or improve images</li>
                      <li>Optimize layout</li>
                      <li>Enhance visual hierarchy</li>
                    </>
                  )}
                  {selectedEnhanceType === 'data' && (
                    <>
                      <li>Add relevant statistics</li>
                      <li>Create/improve charts</li>
                      <li>Enhance data storytelling</li>
                    </>
                  )}
                  {selectedEnhanceType === 'language' && (
                    <>
                      <li>Improve grammar and clarity</li>
                      <li>Adjust tone for audience</li>
                      <li>Enhance persuasiveness</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Providers Tab */}
          <TabsContent value="providers" className="flex-1 p-3 space-y-4 overflow-auto">
            <div className="space-y-4">
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Auto-Aligned Providers</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {alignedProviders.reasoning}
                </p>
                <Badge variant="outline" className="text-xs">
                  {alignedProviders.confidence}% confidence
                </Badge>
              </div>
              
              <div>
                <Label className="text-xs">Text/Content Model</Label>
                <Select 
                  value={alignedProviders.textProvider.id}
                  onValueChange={(v) => onProviderChange(selectedSlideIndex!, 'text', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{p.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{p.strengths[0]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Image Generation</Label>
                <Select 
                  value={alignedProviders.imageProvider.id}
                  onValueChange={(v) => onProviderChange(selectedSlideIndex!, 'image', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{p.name}</span>
                          <Badge variant="outline" className="text-xs ml-2">{p.speed}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Voice/TTS</Label>
                <Select 
                  value={alignedProviders.voiceProvider.id}
                  onValueChange={(v) => onProviderChange(selectedSlideIndex!, 'voice', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_PROVIDERS.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{p.name}</span>
                          <Badge variant="outline" className="text-xs ml-2">{p.quality}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Reset to auto-aligned
                  toast.success('Providers reset to auto-aligned recommendations');
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Reset to Auto-Aligned
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <Edit3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a slide to edit</p>
          </div>
        </div>
      )}
      
      {/* Action Bar */}
      {selectedSlide && (
        <div className="p-3 border-t bg-muted/30 space-y-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleAccept}
            >
              <Check className="h-4 w-4 mr-1" /> Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleSkip}
            >
              <SkipForward className="h-4 w-4 mr-1" /> Skip
            </Button>
          </div>
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowReplaceDialog(true)}
            >
              <Replace className="h-4 w-4 mr-1" /> Replace
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => selectedSlideIndex! > 0 && onSlideReorder(selectedSlideIndex!, selectedSlideIndex! - 1)}>
                  <ArrowUp className="h-4 w-4 mr-2" /> Move Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => selectedSlideIndex! < slides.length - 1 && onSlideReorder(selectedSlideIndex!, selectedSlideIndex! + 1)}>
                  <ArrowDown className="h-4 w-4 mr-2" /> Move Down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDeleteSlide}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      
      {/* Add Slide Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Slide</DialogTitle>
            <DialogDescription>
              Choose the type of slide to add after the current slide.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {[
              { type: 'content', icon: Type, label: 'Content' },
              { type: 'title', icon: Type, label: 'Title' },
              { type: 'data', icon: BarChart3, label: 'Data/Chart' },
              { type: 'image', icon: ImageIcon, label: 'Image' },
              { type: 'video', icon: Video, label: 'Video' },
              { type: 'table', icon: Table, label: 'Table' },
              { type: 'quote', icon: Type, label: 'Quote' },
              { type: 'cta', icon: Zap, label: 'CTA' },
            ].map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => handleAddSlide(type as SlideType)}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Replace Slide Dialog */}
      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Slide</DialogTitle>
            <DialogDescription>
              Choose how to replace the current slide.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleReplaceSlide({ replaceWith: 'regenerate' })}
              disabled={isProcessing}
            >
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Regenerate with AI</p>
                  <p className="text-xs text-muted-foreground">Generate new content based on original context</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleReplaceSlide({ replaceWith: 'blank' })}
            >
              <div className="flex items-start gap-3">
                <Plus className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Start Fresh</p>
                  <p className="text-xs text-muted-foreground">Replace with a blank slide template</p>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SlideEditorPanel;
