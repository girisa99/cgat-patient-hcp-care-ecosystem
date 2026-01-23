/**
 * Embedded Editor Panel for Step 7
 * Integrates Universal Editor into the wizard flow
 * Now with Universal Export for all 100+ pipelines
 */

import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { 
  Edit3, 
  Layers, 
  Eye, 
  Wand2, 
  Save,
  Maximize2,
  Grid3X3,
  Film,
  Download,
  FileText,
  Presentation,
  FileImage,
  FileType,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorProvider, useEditor } from '@/components/universal-editor';
import { useUniversalExport } from '@/hooks/useUniversalExport';
import type { PresentationSlide } from '../types';
import type { ActiveProject, UniversalElement } from '@/components/universal-editor/types';
import type { GeneratedSlide } from '@/services/universalPresentationService';

interface EmbeddedEditorPanelProps {
  slides: PresentationSlide[];
  onSlidesUpdate: (slides: PresentationSlide[]) => void;
  outputType: string;
  onOpenFullEditor?: () => void;
  className?: string;
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
 * Create initial project from slides
 */
function createProjectFromSlides(slides: PresentationSlide[], outputType: string): ActiveProject {
  const mode = outputType.includes('video') ? 'timeline' : 'canvas';
  
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
  onOpenFullEditor 
}: { 
  slides: PresentationSlide[]; 
  onOpenFullEditor?: () => void;
}) {
  const editor = useEditor();
  const [activeTab, setActiveTab] = React.useState('preview');
  const { 
    isExporting, 
    exportToPPTX, 
    exportToPDF, 
    exportToImages, 
    exportToJSON 
  } = useUniversalExport();

  if (!editor) return null;

  const { project, setMode, selectElements, getSelectedElements } = editor;
  const selectedElements = getSelectedElements();

  // Convert PresentationSlide to GeneratedSlide for export
  const convertToGeneratedSlides = (): GeneratedSlide[] => {
    return slides.map((slide, index) => {
      // Map slide type to GeneratedSlide compatible types
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
          type: 'bullets' as const, // Always use bullets as fallback for export compatibility
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

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={project.mode === 'canvas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('canvas')}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Canvas
          </Button>
          <Button
            variant={project.mode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('timeline')}
          >
            <Film className="h-4 w-4 mr-1" />
            Timeline
          </Button>
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enhance" className="mt-4">
          <div className="h-[400px] rounded-lg border bg-muted/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Wand2 className="h-8 w-8 mx-auto mb-2" />
              <p>AI Enhancement Options</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <Button variant="outline" size="sm">Regenerate</Button>
                <Button variant="outline" size="sm">Improve</Button>
                <Button variant="outline" size="sm">Translate</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{project.elements.length} slides</span>
        <span>Mode: {project.mode}</span>
        <span>Ready</span>
      </div>
    </div>
  );
}

/**
 * Main Embedded Editor Panel
 */
export function EmbeddedEditorPanel({
  slides,
  onSlidesUpdate,
  outputType,
  onOpenFullEditor,
  className,
}: EmbeddedEditorPanelProps) {
  const initialProject = useMemo(
    () => createProjectFromSlides(slides, outputType),
    [slides, outputType]
  );

  if (slides.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Layers className="h-8 w-8 mx-auto mb-2" />
          <p>Generate content first to enable editing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Review & Edit Content
          <Badge variant="secondary" className="ml-auto">{slides.length} slides</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EditorProvider initialProject={initialProject}>
          <EditorContent slides={slides} onOpenFullEditor={onOpenFullEditor} />
        </EditorProvider>
      </CardContent>
    </Card>
  );
}
