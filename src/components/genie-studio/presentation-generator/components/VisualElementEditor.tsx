/**
 * Visual Element Editor - Full edit actions + style editor for slide visuals
 * Supports: Edit, Regenerate, AI Enhance, Revert, Style, Resize
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  RefreshCw, 
  Sparkles, 
  Undo2, 
  Palette, 
  Maximize2,
  Type,
  Image as ImageIcon,
  Layers,
  Download,
  X,
  Check,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  VisualElement, 
  VisualLayer, 
  ElementActionType,
  TextStyle,
  ExportFormat
} from '../types';

interface VisualElementEditorProps {
  element: VisualElement;
  onUpdate: (elementId: string, updates: Partial<VisualElement>) => void;
  onLayerUpdate: (elementId: string, layerId: string, updates: Partial<VisualLayer>) => void;
  onRegenerate: (elementId: string, prompt?: string) => Promise<void>;
  onEnhance: (elementId: string, instructions?: string) => Promise<void>;
  onRevert: (elementId: string) => void;
  onExport: (elementId: string, format: ExportFormat) => Promise<void>;
  onClose: () => void;
  className?: string;
}

// Action configuration
const ELEMENT_ACTIONS = [
  { type: 'edit' as const, label: 'Edit Text', icon: Edit3, description: 'Edit text directly' },
  { type: 'regenerate' as const, label: 'Regenerate', icon: RefreshCw, description: 'Create new content' },
  { type: 'enhance' as const, label: 'AI Enhance', icon: Sparkles, description: 'Improve current' },
  { type: 'revert' as const, label: 'Revert', icon: Undo2, description: 'Undo changes' },
  { type: 'style' as const, label: 'Style', icon: Palette, description: 'Colors & fonts' },
  { type: 'resize' as const, label: 'Resize', icon: Maximize2, description: 'Scale element' },
];

// Export formats
const EXPORT_FORMATS: { format: ExportFormat; label: string; description: string }[] = [
  { format: 'svg', label: 'SVG', description: 'Scalable vector, editable' },
  { format: 'png', label: 'PNG', description: 'High quality, transparent' },
  { format: 'webp', label: 'WebP', description: 'Optimized for web' },
  { format: 'pdf', label: 'PDF', description: 'Print-ready document' },
];

// Color palette presets
const COLOR_PRESETS = [
  '#1e3a5f', '#2563eb', '#0891b2', '#059669', '#84cc16',
  '#eab308', '#f97316', '#ef4444', '#ec4899', '#8b5cf6',
  '#64748b', '#1f2937', '#ffffff', '#f8fafc', '#0f172a',
];

// Font options
const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Source Sans Pro', 'Raleway', 'PT Sans', 'Merriweather'
];

export function VisualElementEditor({
  element,
  onUpdate,
  onLayerUpdate,
  onRegenerate,
  onEnhance,
  onRevert,
  onExport,
  onClose,
  className
}: VisualElementEditorProps) {
  const [activeTab, setActiveTab] = useState<'actions' | 'layers' | 'style' | 'export'>('actions');
  const [selectedAction, setSelectedAction] = useState<ElementActionType | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

  const hasOriginal = element.originalLayers && element.originalLayers.length > 0;
  const isLoading = element.isRegenerating || element.isEnhancing || isProcessing;

  // Get text layers for editing
  const textLayers = element.layers.filter(l => l.content.type === 'text');
  const visualLayers = element.layers.filter(l => l.content.type === 'visual');
  const vectorLayers = element.layers.filter(l => l.content.type === 'vector');

  const handleAction = useCallback(async (action: ElementActionType) => {
    if (isLoading) return;
    
    setSelectedAction(action);
    
    switch (action) {
      case 'regenerate':
        setIsProcessing(true);
        try {
          await onRegenerate(element.id, customPrompt || undefined);
        } finally {
          setIsProcessing(false);
          setCustomPrompt('');
        }
        break;
        
      case 'enhance':
        setIsProcessing(true);
        try {
          await onEnhance(element.id, customPrompt || undefined);
        } finally {
          setIsProcessing(false);
          setCustomPrompt('');
        }
        break;
        
      case 'revert':
        onRevert(element.id);
        break;
        
      case 'edit':
      case 'style':
      case 'resize':
        // These open sub-panels, handled by tab change
        break;
    }
  }, [element.id, customPrompt, isLoading, onRegenerate, onEnhance, onRevert]);

  const handleTextEdit = useCallback((layerId: string, text: string) => {
    const layer = element.layers.find(l => l.id === layerId);
    if (!layer || layer.content.type !== 'text') return;
    
    onLayerUpdate(element.id, layerId, {
      content: {
        ...layer.content,
        text
      }
    });
    setEditingTextId(null);
    setEditedText('');
  }, [element, onLayerUpdate]);

  const handleStyleChange = useCallback((layerId: string, style: Partial<TextStyle>) => {
    const layer = element.layers.find(l => l.id === layerId);
    if (!layer || layer.content.type !== 'text') return;
    
    onLayerUpdate(element.id, layerId, {
      content: {
        ...layer.content,
        style: { ...layer.content.style, ...style }
      }
    });
  }, [element, onLayerUpdate]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setIsProcessing(true);
    try {
      await onExport(element.id, format);
    } finally {
      setIsProcessing(false);
    }
  }, [element.id, onExport]);

  const selectedLayer = selectedLayerId 
    ? element.layers.find(l => l.id === selectedLayerId) 
    : null;

  return (
    <div className={cn(
      "rounded-lg border bg-card shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Visual Editor</span>
          <Badge variant="outline" className="text-[10px]">
            {element.type}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-9 p-0">
          <TabsTrigger value="actions" className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Actions
          </TabsTrigger>
          <TabsTrigger value="layers" className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Layers ({element.layers.length})
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Style
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
            Export
          </TabsTrigger>
        </TabsList>

        {/* Actions Tab */}
        <TabsContent value="actions" className="p-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {ELEMENT_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isDisabled = isLoading || (action.type === 'revert' && !hasOriginal);
              
              return (
                <button
                  key={action.type}
                  onClick={() => handleAction(action.type)}
                  disabled={isDisabled}
                  className={cn(
                    "p-2 rounded-lg border text-left transition-all",
                    selectedAction === action.type
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground line-clamp-1">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom prompt for regenerate/enhance */}
          {(selectedAction === 'regenerate' || selectedAction === 'enhance') && (
            <div className="space-y-2">
              <Label className="text-xs">
                {selectedAction === 'regenerate' ? 'New generation prompt' : 'Enhancement instructions'}
              </Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={
                  selectedAction === 'regenerate' 
                    ? 'Describe what you want...' 
                    : 'E.g., "Make text more readable" or "Add more contrast"'
                }
                rows={2}
                className="text-xs resize-none"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={() => handleAction(selectedAction)}
                disabled={isLoading}
                className="w-full text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedAction === 'regenerate' ? (
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1.5" />
                    )}
                    Apply {selectedAction === 'regenerate' ? 'Regeneration' : 'Enhancement'}
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Layers Tab */}
        <TabsContent value="layers" className="p-3 space-y-3">
          {/* Text Layers */}
          {textLayers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Type className="h-3 w-3" /> Text Layers
              </Label>
              <div className="space-y-1.5">
                {textLayers.map((layer) => {
                  const content = layer.content as { type: 'text'; text: string; style: TextStyle };
                  const isEditing = editingTextId === layer.id;
                  
                  return (
                    <div key={layer.id} className="flex items-start gap-2 p-2 rounded border bg-muted/30">
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <Textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="text-xs min-h-[60px]"
                            autoFocus
                          />
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => {
                                setEditingTextId(null);
                                setEditedText('');
                              }}
                            >
                              <X className="h-3 w-3 mr-1" /> Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleTextEdit(layer.id, editedText)}
                            >
                              <Check className="h-3 w-3 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="flex-1 text-xs line-clamp-2">{content.text}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 shrink-0"
                            onClick={() => {
                              setEditingTextId(layer.id);
                              setEditedText(content.text);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visual Layers */}
          {visualLayers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3" /> Visual Layers
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {visualLayers.map((layer) => {
                  const content = layer.content as { type: 'visual'; url: string; alt: string };
                  return (
                    <div 
                      key={layer.id} 
                      className={cn(
                        "rounded border overflow-hidden cursor-pointer transition-all",
                        selectedLayerId === layer.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedLayerId(layer.id)}
                    >
                      <img 
                        src={content.url} 
                        alt={content.alt}
                        className="w-full h-16 object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vector Layers */}
          {vectorLayers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Vector Layers (SVG)
              </Label>
              <div className="space-y-1.5">
                {vectorLayers.map((layer) => (
                  <div 
                    key={layer.id}
                    className={cn(
                      "p-2 rounded border text-xs cursor-pointer transition-all",
                      selectedLayerId === layer.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-primary/50"
                    )}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <span className="text-muted-foreground">Vector element</span>
                    <Badge variant="outline" className="ml-2 text-[9px]">Editable</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="p-3 space-y-4">
          {textLayers.length > 0 && (
            <>
              {/* Font Family */}
              <div className="space-y-2">
                <Label className="text-xs">Font Family</Label>
                <select 
                  className="w-full h-8 rounded border bg-background text-xs px-2"
                  onChange={(e) => {
                    textLayers.forEach(layer => {
                      handleStyleChange(layer.id, { fontFamily: e.target.value });
                    });
                  }}
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label className="text-xs">Font Size</Label>
                <Slider
                  defaultValue={[16]}
                  min={10}
                  max={48}
                  step={1}
                  onValueChange={([value]) => {
                    textLayers.forEach(layer => {
                      handleStyleChange(layer.id, { fontSize: value });
                    });
                  }}
                />
              </div>

              {/* Text Formatting */}
              <div className="space-y-2">
                <Label className="text-xs">Formatting</Label>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Italic className="h-3 w-3" />
                  </Button>
                  <div className="w-px bg-border mx-1" />
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <AlignLeft className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <AlignCenter className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <AlignRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-border/50 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        textLayers.forEach(layer => {
                          handleStyleChange(layer.id, { color });
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {textLayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No editable text layers
            </div>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="p-3 space-y-3">
          <Label className="text-xs">Export Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_FORMATS.map(({ format, label, description }) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                disabled={isLoading}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-muted/50",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Download className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{description}</p>
              </button>
            ))}
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Preparing export...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
