/**
 * Genie Spark - Content Creation Suite
 * "Ignite Your Ideas" - AI-powered content generation engine
 *
 * CONSOLIDATED: Uses QuadrantLayout + QuadrantProductHeader
 * AskGenie is now centralized in QuadrantLayout (removed from here)
 *
 * Day 3 (C-304): Fixed wizard onGenerate integration, removed temp IDs,
 * connected save flow to use returned DB ids
 *
 * Day 6: Phase 5 — Glass-morphism tabs. Create flow moved to GenieCast (Architecture B).
 * Spark stays focused: Guide (default) → Pipeline → Templates → Images.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QuadrantLayout, QuadrantProductHeader } from '@/components/navigation';
import { GlassTabs, GlassTabsList, GlassTabsTrigger, GlassTabsContent } from '@/components/ui/glass-primitives';
import { Sparkles, LayoutTemplate, Image, Wand2 } from 'lucide-react';
import { SmartContentPipeline } from '@/components/genie-studio/SmartContentPipeline';
import { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
import { toast } from 'sonner';
import type { GeneratedContent } from '@/components/genie-studio/PostGenerationActions';
import { ImageScriptAssembler } from '@/components/shared';
import { QuickTemplateSelector } from '@/components/templates';
import { SparkGuidedWizard } from '@/components/genie-spark/SparkGuidedWizard';
import { productionEpisodesService } from '@/services/production/productionEpisodesService';

const GenieSpark: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'guide');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  const [lastSavedScriptId, setLastSavedScriptId] = useState<string | null>(null);
  const { saveScript } = useGenieScripts();

  // Helper to build script stats from generated content
  const buildScriptStats = (content: GeneratedContent) => ({
    wordCount: content.metadata?.wordCount || 0,
    sentenceCount: 0,
    characterCount: content.script?.length || 0,
    estimatedReadingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
    estimatedSpeakingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
    readabilityScore: 'moderate' as const
  });

  // Map content type to script type
  const getScriptType = (type: string): 'audio' | 'video' => {
    if (type === 'podcast_script') return 'audio';
    return 'video';
  };

  /** Save content to DB and return the real script (with DB-generated ID) */
  const saveGeneratedContent = async (
    content: GeneratedContent,
    source: 'spark' | 'mind' = 'spark'
  ): Promise<GenieScript | null> => {
    const scriptInput = {
      name: content.title || 'Generated Script',
      content: content.script,
      type: getScriptType(content.type),
      source,
      stats: buildScriptStats(content),
    } as Omit<GenieScript, 'id' | 'createdAt' | 'updatedAt'>;

    return saveScript(scriptInput);
  };

  const handleSendToScriptEditor = async (content: GeneratedContent) => {
    try {
      const saved = await saveGeneratedContent(content);
      if (!saved) {
        toast.error('Failed to save script. Please try again.');
        return;
      }

      // Create production episode linking Spark → Mind
      await productionEpisodesService.createFromScript(saved.id, saved.name);

      navigate(`/genie-mind?tab=script-editor&scriptId=${saved.id}`);
      toast.success('Script sent to Script Editor for refinement!');
    } catch (err) {
      console.error('Failed to send to Script Editor:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSendToVibe = async (content: GeneratedContent) => {
    try {
      const saved = await saveGeneratedContent(content);
      if (!saved) {
        toast.error('Failed to save script. Please try again.');
        return;
      }
      navigate('/genie-vibe');
      toast.success('Script ready for recording in Vibe!');
    } catch (err) {
      console.error('Failed to send to Vibe:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSendToProductionHub = async (content: GeneratedContent) => {
    try {
      const saved = await saveGeneratedContent(content);
      if (!saved) {
        toast.error('Failed to save script. Please try again.');
        return;
      }
      // Use the real DB id for deep-linking
      navigate(`/genie-admin?tab=library&linkScript=${saved.id}`);
      toast.success('Script ready for Production Hub! Create a show to link it.');
    } catch (err) {
      console.error('Failed to send to Production Hub:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSaveToKnowledgeBase = async (content: GeneratedContent) => {
    try {
      const saved = await saveGeneratedContent(content);
      if (!saved) {
        toast.error('Failed to save to Knowledge Base.');
        return;
      }
      toast.success('Script saved to Knowledge Base for future AI reference!');
    } catch (err) {
      console.error('Failed to save to Knowledge Base:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <QuadrantLayout>
      {/* Unified Product Header - replaces redundant hero */}
      <QuadrantProductHeader productId="spark" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <GlassTabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <GlassTabsList>
            <GlassTabsTrigger value="guide" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Guide
            </GlassTabsTrigger>
            <GlassTabsTrigger value="pipeline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Pipeline
            </GlassTabsTrigger>
            <GlassTabsTrigger value="templates" className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </GlassTabsTrigger>
            <GlassTabsTrigger value="images" className="gap-2">
              <Image className="h-4 w-4" />
              Images
            </GlassTabsTrigger>
          </GlassTabsList>

            {/* Guided Wizard Tab */}
            <GlassTabsContent value="guide" className="mt-0">
              <SparkGuidedWizard
                onContentTypeSelect={(type) => {
                  toast.success(`Content type: ${type}`);
                }}
                onTemplateSelect={(category) => {
                  toast.success(`Template style: ${category}`);
                }}
                onGenerate={async (prompt) => {
                  toast.info('Generating content...');
                  const saved = await saveScript({
                    name: `Spark Draft — ${prompt.slice(0, 40)}...`,
                    content: prompt,
                    type: 'video',
                    source: 'spark',
                  });
                  if (saved) {
                    setLastSavedScriptId(saved.id);
                    setHasGeneratedContent(true);
                    toast.success('Content generated and saved!');
                  } else {
                    throw new Error('Save failed');
                  }
                }}
                onSendToEditor={() => {
                  const scriptParam = lastSavedScriptId ? `&scriptId=${lastSavedScriptId}` : '';
                  navigate(`/genie-mind?tab=script-editor${scriptParam}`);
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
            </GlassTabsContent>

            {/* Content Pipeline Tab */}
            <GlassTabsContent value="pipeline" className="mt-0">
              <SmartContentPipeline
                onSendToScriptEditor={handleSendToScriptEditor}
                onSendToVibe={handleSendToVibe}
                onSendToProductionHub={handleSendToProductionHub}
                onSaveToKnowledgeBase={handleSaveToKnowledgeBase}
              />
            </GlassTabsContent>

            {/* Quick Templates Tab */}
            <GlassTabsContent value="templates" className="mt-0">
              <QuickTemplateSelector
                onSelect={(template) => {
                  toast.success(`Template "${template.name}" selected!`);
                  handleTabChange('pipeline');
                }}
              />
            </GlassTabsContent>

            {/* Image to Script Tab */}
            <GlassTabsContent value="images" className="mt-0">
              <ImageScriptAssembler
                onAssemblyComplete={(slides) => {
                  toast.success(`Assembly complete with ${slides.length} slides!`);
                }}
                onGenerateVideo={(slides) => {
                  toast.success(`Generating video from ${slides.length} slides!`);
                  const scriptContent = slides.map(s => s.scriptText).join('\n\n');
                  saveScript({
                    name: 'Image-Based Script',
                    content: scriptContent,
                    type: 'video',
                    source: 'spark',
                  });
                }}
              />
          </GlassTabsContent>
        </GlassTabs>
      </div>
      {/* AskGenie removed - now centralized in QuadrantLayout */}
    </QuadrantLayout>
  );
};

export default GenieSpark;
