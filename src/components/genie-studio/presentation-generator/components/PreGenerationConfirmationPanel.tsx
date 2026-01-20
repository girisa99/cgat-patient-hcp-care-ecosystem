/**
 * Pre-Generation Confirmation Panel
 * Shows complete summary of all selections across Steps 0-5 before generation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Check,
  AlertCircle,
  FileText,
  Settings2,
  Layout,
  Layers,
  Brain,
  Wand2,
  Globe,
  Sparkles,
  Image as ImageIcon,
  Mic,
  Languages,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { VisualFeatureSelection } from './VisualFeaturesDropdown';
import type { OutputTypeSettings } from '../OutputTypePanel';

export interface GenerationContextSummary {
  // Step 0: Input
  inputSource: string;
  inputContentPreview: string;
  hasUploadedFile: boolean;
  
  // Step 1: Configuration - NOW with independent mode tracking
  industryCategory: string;
  industryName: string;
  segment: string;
  contentTypes: string[];
  isAIAutoMode: boolean; // Legacy - kept for backward compat
  step1Mode: 'ai' | 'custom'; // NEW: Independent Step 1 mode
  
  // Step 2: Template & Branding - NOW with independent mode tracking
  templateId: string;
  templateName: string;
  themeName: string;
  brandColors: { primary: string; secondary: string; accent: string };
  hasLogo: boolean;
  selectedFrameworkCategories: string[];
  selectedFrameworkIds: string[];
  visualFeatures: VisualFeatureSelection[];
  step2Mode: 'ai' | 'custom'; // NEW: Independent Step 2 mode
  
  // Step 3: Output Type
  outputSettings: OutputTypeSettings;
  
  // Step 4: Agents & Languages
  useAgenticGeneration: boolean;
  selectedAgents: string[];
  selectedLanguages: string[];
  primaryLanguage: string;
  includeVoiceover: boolean;
  voiceProvider: string;
  
  // AI Models
  aiModels: {
    textModel: string;
    imageModel: string;
    voiceModel: string;
    translationModel: string;
  };
}

interface PreGenerationConfirmationPanelProps {
  summary: GenerationContextSummary;
  onConfirm: () => void;
  onEdit: (stepIndex: number) => void;
  isGenerating: boolean;
  creditEstimate?: number;
  className?: string;
}

// Visual feature labels
const VISUAL_FEATURE_LABELS: Record<string, string> = {
  'infographics': 'Infographics',
  'journey-maps': 'Journey Maps',
  'data-tables': 'Data Tables',
  'charts': 'Charts',
  'timelines': 'Timelines',
  'diagrams': 'Diagrams',
  'quote-blocks': 'Quote Blocks',
  'icon-sets': 'Icon Sets',
};

export function PreGenerationConfirmationPanel({
  summary,
  onConfirm,
  onEdit,
  isGenerating,
  creditEstimate,
  className,
}: PreGenerationConfirmationPanelProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['input', 'config', 'template', 'output', 'agents']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const hasValidation = (section: string): boolean => {
    switch (section) {
      case 'input':
        return summary.inputContentPreview.length > 0;
      case 'config':
        return !!summary.industryCategory && summary.contentTypes.length > 0;
      case 'template':
        return !!summary.templateId;
      case 'output':
        return !!summary.outputSettings.outputType;
      case 'agents':
        return summary.selectedLanguages.length > 0;
      default:
        return true;
    }
  };

  const sections = [
    { id: 'input', title: 'Step 0: Input', icon: FileText, step: 0 },
    { id: 'config', title: 'Step 1: Configuration', icon: Settings2, step: 1 },
    { id: 'template', title: 'Step 2: Template & Branding', icon: Layout, step: 2 },
    { id: 'output', title: 'Step 3: Output Type', icon: Layers, step: 3 },
    { id: 'agents', title: 'Step 4: Agents & Languages', icon: Brain, step: 4 },
  ];

  return (
    <Card className={cn('border-primary/30', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 className="h-5 w-5 text-primary" />
          Pre-Generation Review
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review all your selections before generating. Click any section to edit.
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sections.map((section) => (
              <Collapsible
                key={section.id}
                open={expandedSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    'flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors',
                    !hasValidation(section.id) && 'border-destructive/50'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-1.5 rounded-md',
                        hasValidation(section.id) ? 'bg-primary/10' : 'bg-destructive/10'
                      )}>
                        <section.icon className={cn(
                          'h-4 w-4',
                          hasValidation(section.id) ? 'text-primary' : 'text-destructive'
                        )} />
                      </div>
                      <span className="font-medium text-sm">{section.title}</span>
                      {hasValidation(section.id) ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(section.step);
                        }}
                      >
                        Edit
                      </Button>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-3 pt-2 ml-6 border-l-2 border-muted space-y-2">
                    {section.id === 'input' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Source:</span>
                            <Badge variant="outline" className="ml-2">{summary.inputSource}</Badge>
                          </div>
                          {summary.hasUploadedFile && (
                            <div>
                              <Badge variant="secondary" className="text-xs">📎 File Uploaded</Badge>
                            </div>
                          )}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Content Preview:</span>
                          <p className="mt-1 text-xs bg-muted/50 p-2 rounded line-clamp-2">
                            {summary.inputContentPreview || 'No content entered'}
                          </p>
                        </div>
                      </>
                    )}

                    {section.id === 'config' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Industry:</span>
                            <span className="ml-2 font-medium">{summary.industryName || 'Not selected'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Segment:</span>
                            <span className="ml-2 font-medium">{summary.segment || 'Not selected'}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Content Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {summary.contentTypes.length > 0 ? (
                              summary.contentTypes.map(ct => (
                                <Badge key={ct} variant="secondary" className="text-xs">{ct}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None selected</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Step 1 Mode:</span>
                          <Badge variant={summary.step1Mode === 'ai' ? 'default' : 'outline'} className="ml-2">
                            {summary.step1Mode === 'ai' ? '🤖 AI Auto' : '🔧 Custom'}
                          </Badge>
                        </div>
                      </>
                    )}

                    {section.id === 'template' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Template:</span>
                            <span className="ml-2 font-medium">{summary.templateName || 'Default'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Theme:</span>
                            <span className="ml-2 font-medium">{summary.themeName || 'Default'}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Step 2 Mode:</span>
                          <Badge variant={summary.step2Mode === 'ai' ? 'default' : 'outline'} className="ml-2">
                            {summary.step2Mode === 'ai' ? '🤖 AI Auto' : '🔧 Custom'}
                          </Badge>
                        </div>
                        {summary.selectedFrameworkCategories.length > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Frameworks:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {summary.selectedFrameworkCategories.map(fc => (
                                <Badge key={fc} variant="outline" className="text-xs">{fc}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="text-muted-foreground">Visual Features:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {summary.visualFeatures.length > 0 ? (
                              summary.visualFeatures.map(vf => (
                                <Badge key={vf.featureId} variant="secondary" className="text-xs">
                                  {VISUAL_FEATURE_LABELS[vf.featureId] || vf.featureId}
                                  {vf.subOptions.length > 0 && ` (+${vf.subOptions.length})`}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None selected</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div 
                            className="h-6 w-6 rounded border" 
                            style={{ backgroundColor: summary.brandColors.primary }}
                            title="Primary"
                          />
                          <div 
                            className="h-6 w-6 rounded border" 
                            style={{ backgroundColor: summary.brandColors.secondary }}
                            title="Secondary"
                          />
                          <div 
                            className="h-6 w-6 rounded border" 
                            style={{ backgroundColor: summary.brandColors.accent }}
                            title="Accent"
                          />
                          {summary.hasLogo && (
                            <Badge variant="outline" className="text-xs">📷 Logo</Badge>
                          )}
                        </div>
                      </>
                    )}

                    {section.id === 'output' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Output Type:</span>
                            <Badge variant="default" className="ml-2">{summary.outputSettings.outputType}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Structure:</span>
                            <span className="ml-2 font-medium">{summary.outputSettings.structureMode}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Slides:</span>
                            <span className="ml-2 font-medium">{summary.outputSettings.slideCount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Resolution:</span>
                            <span className="ml-2 font-medium">{summary.outputSettings.resolution}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap text-sm">
                          {summary.outputSettings.includeVoiceover && (
                            <Badge variant="secondary" className="text-xs">🎙️ Voiceover</Badge>
                          )}
                          {summary.outputSettings.includeMusic && (
                            <Badge variant="secondary" className="text-xs">🎵 Music</Badge>
                          )}
                        </div>
                      </>
                    )}

                    {section.id === 'agents' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Architecture:</span>
                            <Badge variant={summary.useAgenticGeneration ? 'default' : 'outline'} className="ml-2">
                              {summary.useAgenticGeneration ? 'Multi-Agent' : 'Single Agent'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Languages:</span>
                            <span className="ml-2 font-medium">{summary.selectedLanguages.length}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Selected Languages:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {summary.selectedLanguages.map(lang => (
                              <Badge 
                                key={lang} 
                                variant={lang === summary.primaryLanguage ? 'default' : 'outline'} 
                                className="text-xs"
                              >
                                {lang.toUpperCase()}
                                {lang === summary.primaryLanguage && ' (Primary)'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {summary.includeVoiceover && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Voice Provider:</span>
                            <Badge variant="outline" className="ml-2">{summary.voiceProvider}</Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* AI Models Summary */}
            <div className="p-3 rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">AI Models</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="text-xs justify-start">
                  <FileText className="h-3 w-3 mr-1" />
                  Text: {summary.aiModels.textModel?.split('/').pop() || 'Auto'}
                </Badge>
                <Badge variant="outline" className="text-xs justify-start">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Image: {summary.aiModels.imageModel || 'Auto'}
                </Badge>
                <Badge variant="outline" className="text-xs justify-start">
                  <Mic className="h-3 w-3 mr-1" />
                  Voice: {summary.aiModels.voiceModel || 'Auto'}
                </Badge>
                <Badge variant="outline" className="text-xs justify-start">
                  <Languages className="h-3 w-3 mr-1" />
                  Translation: {summary.aiModels.translationModel || 'Auto'}
                </Badge>
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Credit Estimate & Confirm */}
        <div className="flex items-center justify-between">
          {creditEstimate !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground">Estimated Credits:</span>
              <Badge variant="outline" className="ml-2 font-mono">{creditEstimate}</Badge>
            </div>
          )}
          <Button 
            onClick={onConfirm}
            disabled={isGenerating}
            className="ml-auto"
          >
            {isGenerating ? 'Generating...' : 'Confirm & Generate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
