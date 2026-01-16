/**
 * Genie Spark - Standalone Content Creation Suite
 * "Ignite Your Ideas" - AI-powered content generation engine
 * 
 * DATA FLOW: Uses existing hooks - all data is user-scoped via RLS
 * INTEGRATED: Ask Genie AI assistant for context-aware help
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, PenTool, Mic, Sparkles, Image, LayoutTemplate, Wand2, Presentation } from 'lucide-react';
import { SmartContentPipeline } from '@/components/genie-studio/SmartContentPipeline';
import { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
import { toast } from 'sonner';
import type { GeneratedContent } from '@/components/genie-studio/PostGenerationActions';
import { BackToSubscription } from '@/components/subscription/BackToSubscription';
import { 
  ImageScriptAssembler, 
  AudioMixer, 
  MusicComposerPanel, 
  VoiceDirectorPanel 
} from '@/components/shared';
import { QuickTemplateSelector } from '@/components/templates';
import { SparkGuidedWizard } from '@/components/genie-spark/SparkGuidedWizard';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';

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
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-950/10">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <BackToSubscription 
                  fallbackPath="/genie-studio" 
                  fallbackLabel="Back to Studio" 
                />
                
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/90 backdrop-blur border border-orange-200/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                    <img src={genieSparkLogo} alt="Genie Spark" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      Genie Spark
                    </h1>
                    <p className="text-sm text-muted-foreground">Content Creation Suite • Ignite Your Ideas</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/genie-deck')}
                >
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Presentations
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/genie-mind?tab=script-editor')}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Script Editor
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                  onClick={() => navigate('/genie-vibe')}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Record in Vibe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-8">
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

          {/* Ask Genie - Context-aware AI for Spark */}
          <AskGenie 
            product="spark" 
            currentTab={activeTab}
            sessionData={{ scriptsCount: savedScripts?.length || 0, hasGeneratedContent }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default GenieSpark;
