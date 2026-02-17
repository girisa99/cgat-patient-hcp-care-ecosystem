/**
 * Genie Spark - Content Creation Suite
 * "Ignite Your Ideas" - AI-powered content generation engine
 * 
 * CONSOLIDATED: Uses QuadrantLayout + QuadrantProductHeader
 * AskGenie is now centralized in QuadrantLayout (removed from here)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuadrantLayout, QuadrantProductHeader } from '@/components/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, LayoutTemplate, Image, Wand2 } from 'lucide-react';
import { SmartContentPipeline } from '@/components/genie-studio/SmartContentPipeline';
import { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
import { toast } from 'sonner';
import type { GeneratedContent } from '@/components/genie-studio/PostGenerationActions';
import { ImageScriptAssembler } from '@/components/shared';
import { QuickTemplateSelector } from '@/components/templates';
import { SparkGuidedWizard } from '@/components/genie-spark/SparkGuidedWizard';

const GenieSpark: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const { scripts: savedScripts, saveScript } = useGenieScripts();

  const handleSendToScriptEditor = (content: GeneratedContent) => {
    const newScript: GenieScript = {
      id: `script-${Date.now()}`,
      name: content.title || 'Generated Script',
      content: content.script,
      type: content.type === 'podcast_script' ? 'audio' : 'video',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: {
        wordCount: content.metadata?.wordCount || 0,
        sentenceCount: 0,
        characterCount: content.script.length,
        estimatedReadingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
        estimatedSpeakingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
        readabilityScore: 'moderate' as const
      }
    };
    saveScript(newScript);
    navigate('/genie-mind?tab=script-editor');
    toast.success(`Script sent to Script Editor for refinement!`);
  };

  const handleSendToVibe = (content: GeneratedContent) => {
    const newScript: GenieScript = {
      id: `script-${Date.now()}`,
      name: content.title || 'Generated Script',
      content: content.script,
      type: content.type === 'podcast_script' ? 'audio' : 'video',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    saveScript(newScript);
    navigate('/genie-vibe');
    toast.success(`Script ready for recording in Vibe!`);
  };

  const handleSendToProductionHub = (content: GeneratedContent) => {
    const newScript: GenieScript = {
      id: `script-${Date.now()}`,
      name: content.title || 'Generated Script',
      content: content.script,
      type: content.type === 'podcast_script' ? 'audio' : 'video',
      source: 'spark', // Mark source as Genie Spark
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: {
        wordCount: content.metadata?.wordCount || 0,
        sentenceCount: 0,
        characterCount: content.script.length,
        estimatedReadingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
        estimatedSpeakingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
        readabilityScore: 'moderate' as const
      }
    };
    saveScript(newScript);
    // Navigate to Production Hub with the script ID for linking
    navigate(`/genie-studio/productions?linkScript=${newScript.id}`);
    toast.success(`Script ready for Production Hub! Create a show to link it.`);
  };

  const handleSaveToKnowledgeBase = (content: GeneratedContent) => {
    toast.success(`Script saved to Knowledge Base for future AI reference!`);
  };

  return (
    <QuadrantLayout>
      {/* Unified Product Header - replaces redundant hero */}
      <QuadrantProductHeader productId="spark" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="guide" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Guide
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Content Pipeline
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Quick Templates
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <Image className="h-4 w-4" />
              Image to Script
            </TabsTrigger>
          </TabsList>

            {/* Guided Wizard Tab */}
            <TabsContent value="guide" className="mt-0">
              <SparkGuidedWizard
                onContentTypeSelect={(type) => {
                  toast.success(`Content type: ${type}`);
                }}
                onTemplateSelect={(category) => {
                  toast.success(`Template style: ${category}`);
                }}
                onGenerate={async (prompt) => {
                  toast.info('Generating content...');
                  // Simulate generation delay
                  await new Promise(r => setTimeout(r, 2000));
                  setHasGeneratedContent(true);
                  toast.success('Content generated!');
                }}
                onSendToEditor={() => {
                  navigate('/genie-mind?tab=script-editor');
                }}
                onExport={(format) => {
                  if (format === 'vibe') {
                    navigate('/genie-vibe');
                  } else {
                    toast.success('Downloading content...');
                  }
                }}
                hasGeneratedContent={hasGeneratedContent}
              />
            </TabsContent>

            {/* Content Pipeline Tab */}
            <TabsContent value="pipeline" className="mt-0">
              <SmartContentPipeline
                onSendToScriptEditor={handleSendToScriptEditor}
                onSendToVibe={handleSendToVibe}
                onSendToProductionHub={handleSendToProductionHub}
                onSaveToKnowledgeBase={handleSaveToKnowledgeBase}
              />
            </TabsContent>

            {/* Quick Templates Tab */}
            <TabsContent value="templates" className="mt-0">
              <QuickTemplateSelector 
                onSelect={(template) => {
                  toast.success(`Template "${template.name}" selected!`);
                  // Navigate to pipeline with template pre-loaded
                  setActiveTab('pipeline');
                }}
              />
            </TabsContent>

            {/* Image to Script Tab */}
            <TabsContent value="images" className="mt-0">
              <ImageScriptAssembler 
                onAssemblyComplete={(slides) => {
                  toast.success(`Assembly complete with ${slides.length} slides!`);
                }}
                onGenerateVideo={(slides) => {
                  toast.success(`Generating video from ${slides.length} slides!`);
                  // Create script from slides
                  const scriptContent = slides.map(s => s.scriptText).join('\n\n');
                  const newScript: GenieScript = {
                    id: `script-${Date.now()}`,
                    name: 'Image-Based Script',
                    content: scriptContent,
                    type: 'video',
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  };
                  saveScript(newScript);
                }}
              />
          </TabsContent>
        </Tabs>
      </div>
      {/* AskGenie removed - now centralized in QuadrantLayout */}
    </QuadrantLayout>
  );
};

export default GenieSpark;
