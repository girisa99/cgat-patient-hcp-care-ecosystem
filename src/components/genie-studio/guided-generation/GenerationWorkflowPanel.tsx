/**
 * Generation Workflow Panel
 * Entry point for P2 generation features within SmartContentPipeline
 * Provides guided access to: Multi-Language Dub, Content Recycling, 
 * Template Variants, and Voice Cloning
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wand2,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  GuidedGenerationSteps, 
  GenerationFeatureSelector,
  type GenerationFeature,
  type GenerationResult,
  type GenerationContext,
} from './GuidedGenerationSteps';

interface GenerationWorkflowPanelProps {
  context?: GenerationContext;
  onResult?: (result: GenerationResult) => void;
  className?: string;
}

export function GenerationWorkflowPanel({
  context,
  onResult,
  className,
}: GenerationWorkflowPanelProps) {
  const [selectedFeature, setSelectedFeature] = useState<GenerationFeature | null>(null);
  const [completedFeatures, setCompletedFeatures] = useState<GenerationFeature[]>([]);

  const handleFeatureComplete = (result: GenerationResult) => {
    if (result.success) {
      setCompletedFeatures(prev => [...prev, result.featureId]);
    }
    setSelectedFeature(null);
    onResult?.(result);
  };

  const handleCancel = () => {
    setSelectedFeature(null);
  };

  if (selectedFeature) {
    return (
      <div className={cn("space-y-4", className)}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Features
        </Button>
        <GuidedGenerationSteps
          feature={selectedFeature}
          context={context}
          onComplete={handleFeatureComplete}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Advanced Generation
              <Badge variant="outline" className="text-xs font-normal">P3</Badge>
            </CardTitle>
            <CardDescription>
              AI-powered generation workflows for your content
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Select a feature below to start a guided workflow. Each feature walks you through 
            step-by-step to achieve the best results.
          </p>
        </div>

        {/* Completed Features */}
        {completedFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {completedFeatures.map(f => (
              <Badge key={f} variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {f.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        )}

        {/* Feature Selector */}
        <GenerationFeatureSelector 
          onSelectFeature={setSelectedFeature}
        />
      </CardContent>
    </Card>
  );
}

export default GenerationWorkflowPanel;
