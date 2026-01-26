/**
 * Embedded Editor Panel for Step 7
 * Integrates Universal Editor into the wizard flow
 * Now with Universal Export, Dynamic Pipeline Selection, and Proactive Editing
 * 
 * ECOSYSTEM INTEGRATION:
 * - Proactive editing suggestions from proactivePipelineEditorService
 * - Confidence loop integration for quality assurance
 * - Ask Genie support awareness
 * - Works across all Genie Studio products (Spark, Mind, Vibe, Deck, Arc, Cast)
 * 
 * PRODUCT-AWARE MODE SWITCHING:
 * - Vibe: Timeline mode (video/audio production)
 * - Deck: Canvas mode (presentations)
 * - Spark/Mind: Document mode (scripts/enhancement)
 * - Cast: Canvas mode (distribution scheduling)
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Edit3, 
  Layers, 
  Eye, 
  Wand2, 
  Maximize2,
  Grid3X3,
  Film,
  FileText,
  Download,
  Presentation,
  FileImage,
  FileType,
  Loader2,
  ChevronDown,
  Sparkles,
  Music,
  Video,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorProvider, useEditor } from '@/components/universal-editor';
import { useUniversalExport } from '@/hooks/useUniversalExport';
import { useProactiveEditing } from '@/hooks/useProactiveEditing';
import { ProactiveEditingSuggestions } from '@/components/editor/ProactiveEditingSuggestions';
import { InlinePipelineSelector } from './DynamicPipelineSelector';
import { proactivePipelineEditorService } from '@/services/proactivePipelineEditorService';
import { GenieProduct, GENIE_PRODUCTS } from '@/constants/genie-products';
import type { PresentationSlide } from '../types';
import type { ActiveProject, UniversalElement } from '@/components/universal-editor/types';
import type { GeneratedSlide } from '@/services/universalPresentationService';

interface EmbeddedEditorPanelProps {
  slides: PresentationSlide[];
  onSlidesUpdate: (slides: PresentationSlide[]) => void;
  outputType: string;
  inputSource?: string;
  onPipelineChange?: (pipelineId: string) => void;
  onOpenFullEditor?: () => void;
  className?: string;
  productContext?: GenieProduct; // NEW: Product context for mode switching
}

// Product to icon mapping
const PRODUCT_ICONS: Record<GenieProduct, React.ReactNode> = {
  spark: <Sparkles className="h-4 w-4" />,
  mind: <FileEdit className="h-4 w-4" />,
  vibe: <Music className="h-4 w-4" />,
  deck: <Presentation className="h-4 w-4" />,
  arc: <Grid3X3 className="h-4 w-4" />,
  cast: <Video className="h-4 w-4" />,
  studio: <Layers className="h-4 w-4" />,
};

// Product to mode mapping
const PRODUCT_MODES: Record<GenieProduct, 'canvas' | 'timeline' | 'document'> = {
  spark: 'document',
  mind: 'document',
  vibe: 'timeline',
  deck: 'canvas',
  arc: 'canvas',
  cast: 'canvas',
  studio: 'canvas',
};

/**
 * Determine product from output type
 */
function getProductFromOutputType(outputType: string): GenieProduct {
  const lowerOutput = outputType.toLowerCase();
  
  if (lowerOutput.includes('video') || lowerOutput.includes('audio') || lowerOutput.includes('podcast')) {
    return 'vibe';
  }
  if (lowerOutput.includes('presentation') || lowerOutput.includes('slide') || lowerOutput.includes('ppt')) {
    return 'deck';
  }
  if (lowerOutput.includes('script') || lowerOutput.includes('doc')) {
    return 'spark';
  }
  if (lowerOutput.includes('social') || lowerOutput.includes('publish')) {
    return 'cast';
  }
  
  return 'studio'; // Default to studio (master orchestrator)
}

/**
 * Convert presentation slides to Universal Editor elements
 */
function slidesToElements(slides: PresentationSlide[]): UniversalElement[] {
  return slides.map((slide, index) => ({
    id: slide.id || `slide-${index}`,
    type: 'slide' as const,
    position: { x: 0, y: index * 320, width: 960, height: 540 },
    content: {
      type: 'container' as const,
      value: {
        title: slide.title,
        subtitle: slide.subtitle,
        bullets: slide.content?.bullets?.map(b => b.text) || [],
        image: slide.image?.url || slide.image?.base64,
        speakerNotes: slide.speakerNotes,
      },
    },
    style: {
      opacity: 1,
      zIndex: index,
      backgroundColor: '#ffffff',
    },
    metadata: {
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: 1,
      slideNumber: slide.slideNumber,
      slideType: slide.type,
    },
    isLocked: false,
    isVisible: true,
  }));
}

/**
 * Create initial project from slides with product-aware mode
 */
function createProjectFromSlides(
  slides: PresentationSlide[], 
  outputType: string,
  productContext?: GenieProduct
): ActiveProject {
  // Determine mode from product context or output type
  const product = productContext || getProductFromOutputType(outputType);
  const mode = PRODUCT_MODES[product] || 'canvas';
  
  return {
    id: `wizard-project-${Date.now()}`,
    name: 'Generated Presentation',
    context: {
      projectHistory: [],
      userPreferences: {
        defaultMode: mode,
        autoSave: true,
        autoSaveInterval: 30,
        showPipelineSteps: true,
        qualityPreset: 'balanced',
        defaultTier: 'standard',
      },
    },
    inputs: [],
    mode,
    elements: slidesToElements(slides),
    viewport: {
      zoom: 0.5,
      panX: 0,
      panY: 0,
      mode,
      showGrid: true,
      showGuides: true,
      snapToGrid: true,
      gridSize: 10,
    },
    selection: { elementIds: [] },
    preview: {
      quality: 'preview',
      autoRefresh: true,
      showSafeZones: false,
      deviceFrame: 'none',
    },
    inspector: {
      isOpen: true,
      activeTab: 'properties',
    },
    credits: {
      balance: 1000,
      estimatedCost: 0,
      breakdown: [],
      optimizationSuggestions: [],
    },
    createdAt: new Date().toISOString(),
    savedAt: new Date().toISOString(),
    version: 1,
  };
}

/**
 * Inner editor component that uses the context
 */
function EditorContent({ 
  slides, 
  onOpenFullEditor,
  pipelineId,
  productContext,
}: { 
  slides: PresentationSlide[]; 
  onOpenFullEditor?: () => void;
  pipelineId?: string | null;
  productContext: GenieProduct;
}) {
  const editor = useEditor();
  const [activeTab, setActiveTab] = useState('preview');
  const { 
    isExporting, 
    exportToPPTX, 
    exportToPDF, 
    exportToImages, 
    exportToJSON 
  } = useUniversalExport();

  // Auto-switch mode based on product context
  useEffect(() => {
    if (editor && productContext) {
      const targetMode = PRODUCT_MODES[productContext];
      if (targetMode && editor.project.mode !== targetMode) {
        editor.setMode(targetMode);
      }
    }
  }, [productContext, editor]);

  if (!editor) return null;

  const { project, setMode, selectElements, getSelectedElements } = editor;
  const selectedElements = getSelectedElements();

  // Get product info for display
  const productInfo = GENIE_PRODUCTS[productContext];

  // Convert PresentationSlide to GeneratedSlide for export
  const convertToGeneratedSlides = (): GeneratedSlide[] => {
    return slides.map((slide, index) => {
      const typeMap: Record<string, 'title' | 'content' | 'section' | 'conclusion' | 'stats' | 'journey' | 'cta' | 'infographic'> = {
        'title': 'title',
        'content': 'content',
        'section': 'section',
        'closing': 'conclusion',
        'conclusion': 'conclusion',
        'stats': 'stats',
        'journey': 'journey',
        'cta': 'cta',
        'infographic': 'infographic',
      };
      
      return {
        id: slide.id || `slide-${index}`,
        slideNumber: slide.slideNumber || index + 1,
        title: slide.title,
        subtitle: slide.subtitle,
        type: typeMap[slide.type] || 'content',
        content: {
          type: 'bullets' as const,
          bullets: slide.content?.bullets?.map(b => typeof b === 'string' ? b : b.text || '') || [],
          paragraphs: slide.content?.paragraphs,
          stats: slide.content?.stats,
          journeySteps: slide.content?.journeySteps,
          quote: slide.content?.quote,
        },
        image: slide.image,
        speakerNotes: slide.speakerNotes,
      } as GeneratedSlide;
    });
  };

  const handleExport = async (format: 'pptx' | 'pdf' | 'images' | 'json') => {
    const generatedSlides = convertToGeneratedSlides();
    const input = {
      slides: generatedSlides,
      title: 'Generated Presentation',
    };

    switch (format) {
      case 'pptx':
        await exportToPPTX(input, { captureFromDOM: true, containerSelector: '[data-slide-content]' });
        break;
      case 'pdf':
        await exportToPDF(input, { captureFromDOM: true, containerSelector: '[data-slide-content]' });
        break;
      case 'images':
        await exportToImages(input, { captureFromDOM: true, containerSelector: '[data-slide-content]' });
        break;
      case 'json':
        exportToJSON(input);
        break;
    }
  };

  // Get available modes based on product
  const availableModes = productContext === 'vibe' 
    ? ['timeline', 'canvas'] 
    : productContext === 'deck' 
    ? ['canvas', 'timeline'] 
    : ['canvas', 'timeline', 'document'];

  return (
    <div className="space-y-4">
      {/* Product Context Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("flex items-center gap-1", productInfo?.bgColor)}>
            {PRODUCT_ICONS[productContext]}
            <span>{productInfo?.name || 'Genie Studio'}</span>
          </Badge>
          <span className="text-xs text-muted-foreground">{productInfo?.tagline}</span>
        </div>
      </div>

      {/* Mode Switcher - Product Aware */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {availableModes.includes('canvas') && (
            <Button
              variant={project.mode === 'canvas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('canvas')}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Canvas
            </Button>
          )}
          {availableModes.includes('timeline') && (
            <Button
              variant={project.mode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('timeline')}
            >
              <Film className="h-4 w-4 mr-1" />
              Timeline
            </Button>
          )}
          {availableModes.includes('document') && (
            <Button
              variant={project.mode === 'document' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('document' as any)}
            >
              <FileText className="h-4 w-4 mr-1" />
              Document
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Universal Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('pptx')}>
                <Presentation className="h-4 w-4 mr-2" />
                PowerPoint (.pptx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileType className="h-4 w-4 mr-2" />
                PDF Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('images')}>
                <FileImage className="h-4 w-4 mr-2" />
                Images (ZIP)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileText className="h-4 w-4 mr-2" />
                JSON (Re-import)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {onOpenFullEditor && (
            <Button variant="outline" size="sm" onClick={onOpenFullEditor}>
              <Maximize2 className="h-4 w-4 mr-1" />
              Full Editor
            </Button>
          )}
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="enhance">
            <Wand2 className="h-4 w-4 mr-1" />
            Enhance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <ScrollArea className="h-[400px] rounded-lg border bg-muted/30">
            <div className="p-4 space-y-4">
              {project.elements.map((element, idx) => (
                <div
                  key={element.id}
                  className={cn(
                    'p-4 rounded-lg border bg-background cursor-pointer transition-all',
                    selectedElements.some(e => e.id === element.id) && 'ring-2 ring-primary'
                  )}
                  onClick={() => selectElements([element.id])}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Slide {idx + 1}</Badge>
                    <Badge variant="outline">{element.type}</Badge>
                  </div>
                  <h4 className="font-medium">
                    {(element.content?.value as { title?: string })?.title || 'Untitled'}
                  </h4>
                  {(element.content?.value as { subtitle?: string })?.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {(element.content.value as { subtitle?: string }).subtitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <div className="h-[400px] rounded-lg border bg-muted/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Edit3 className="h-8 w-8 mx-auto mb-2" />
              <p>Select an element to edit</p>
              <p className="text-xs mt-1">{project.elements.length} elements available</p>
              <p className="text-xs mt-2 text-primary">
                Mode: {project.mode} ({productInfo?.name})
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enhance" className="mt-4">
          <EnhanceTabContent 
            pipelineId={pipelineId || undefined} 
            productContext={productContext}
          />
        </TabsContent>
      </Tabs>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{project.elements.length} slides</span>
        <span>Mode: {project.mode}</span>
        <span className="flex items-center gap-1">
          {PRODUCT_ICONS[productContext]}
          {productInfo?.name}
        </span>
      </div>
    </div>
  );
}

/**
 * Enhance Tab Content - Integrated with Proactive Editing (Product-Aware)
 */
function EnhanceTabContent({ 
  pipelineId,
  productContext,
}: { 
  pipelineId?: string;
  productContext: GenieProduct;
}) {
  const { 
    suggestions, 
    isAnalyzing, 
    triggerEdit, 
    dismissSuggestion,
    analyzePipeline 
  } = useProactiveEditing({ 
    pipelineId, 
    autoShow: true,
    productContext, // Pass product context for filtering
  });

  // Filter suggestions by product context
  const filteredSuggestions = suggestions.filter(s => {
    if (!s.primaryProduct) return true;
    return s.primaryProduct === productContext || productContext === 'studio';
  });

  // Get product-specific capabilities
  const productCapabilities = proactivePipelineEditorService.getCapabilitiesByProduct(productContext);
  const productInfo = GENIE_PRODUCTS[productContext];

  return (
    <div className="space-y-4">
      {/* Product Context Info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Editing capabilities for</span>
        <Badge variant="outline" className="text-xs">
          {productInfo?.name}
        </Badge>
        <span>({productCapabilities.length} tools available)</span>
      </div>

      {/* Proactive AI Suggestions */}
      {filteredSuggestions.length > 0 && (
        <ProactiveEditingSuggestions
          suggestions={filteredSuggestions}
          onApply={triggerEdit}
          onDismiss={dismissSuggestion}
        />
      )}
      
      {/* Loading state */}
      {isAnalyzing && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Analyzing content for suggestions...</span>
        </div>
      )}
      
      {/* Default actions when no suggestions */}
      {!isAnalyzing && filteredSuggestions.length === 0 && (
        <div className="h-[300px] rounded-lg border bg-muted/30 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Wand2 className="h-8 w-8 mx-auto mb-2" />
            <p>AI Enhancement Options</p>
            <p className="text-xs mt-1">
              {productContext === 'vibe' && 'Trim, add voiceover, music, captions'}
              {productContext === 'deck' && 'Adjust layout, enhance visuals, add animations'}
              {productContext === 'mind' && 'Refine script, adjust tone, translate'}
              {productContext === 'spark' && 'Restructure, expand, summarize'}
              {productContext === 'cast' && 'Optimize for platforms, schedule distribution'}
              {!['vibe', 'deck', 'mind', 'spark', 'cast'].includes(productContext) && 'Generate content to see proactive suggestions'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {productCapabilities.slice(0, 3).map(cap => (
                <Button key={cap.id} variant="outline" size="sm">
                  {cap.icon} {cap.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main Embedded Editor Panel - Product Aware
 */
export function EmbeddedEditorPanel({
  slides,
  onSlidesUpdate,
  outputType,
  inputSource,
  onPipelineChange,
  onOpenFullEditor,
  className,
  productContext: propProductContext,
}: EmbeddedEditorPanelProps) {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  
  // Determine product context from props or output type
  const productContext = propProductContext || getProductFromOutputType(outputType);
  const productInfo = GENIE_PRODUCTS[productContext];
  
  const initialProject = useMemo(
    () => createProjectFromSlides(slides, outputType, productContext),
    [slides, outputType, productContext]
  );

  const handlePipelineSelect = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    onPipelineChange?.(pipelineId);
  };

  if (slides.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Layers className="h-8 w-8 mx-auto mb-2" />
          <p>Generate content first to enable editing</p>
          <p className="text-xs mt-2">
            Editor will open in {PRODUCT_MODES[productContext]} mode for {productInfo?.name}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {PRODUCT_ICONS[productContext]}
          Review & Edit Content
          <Badge variant="secondary" className="ml-auto">{slides.length} slides</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dynamic Pipeline Selector */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between h-8">
              <span className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3 w-3" />
                {selectedPipelineId ? `Pipeline: ${selectedPipelineId}` : 'Select Transformation Pipeline'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <InlinePipelineSelector
              inputSource={inputSource}
              outputType={outputType}
              selectedPipelineId={selectedPipelineId}
              onPipelineSelect={handlePipelineSelect}
            />
          </CollapsibleContent>
        </Collapsible>
        
        <EditorProvider initialProject={initialProject}>
          <EditorContent 
            slides={slides} 
            onOpenFullEditor={onOpenFullEditor} 
            pipelineId={selectedPipelineId}
            productContext={productContext}
          />
        </EditorProvider>
      </CardContent>
    </Card>
  );
}
