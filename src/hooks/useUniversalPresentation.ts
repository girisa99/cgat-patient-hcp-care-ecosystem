/**
 * Hook for Universal Presentation Generator
 * Wraps the universalPresentationService with React state management
 * Supports: PPTX, PDF, Images downloads + RAG storage
 * 
 * UPDATED: Now uses comprehensiveExportService for proper image embedding,
 * font support, language handling, and DOM capture for animations/3D
 */

import { useState, useCallback } from 'react';
import { 
  universalPresentationService, 
  PresentationRequest, 
  PresentationResult,
  GeneratedSlide 
} from '@/services/universalPresentationService';
import { comprehensiveExportService } from '@/services/comprehensiveExportService';
import { useMasterToast } from './useMasterToast';
import { supabase } from '@/integrations/supabase/client';

export type DownloadFormat = 'pptx' | 'pdf' | 'images' | 'json';

export interface PresentationDownloadOptions {
  format: DownloadFormat;
  includeNotes?: boolean;
  includeReferences?: boolean;
  quality?: 'standard' | 'high';
  language?: string;
  captureFromDOM?: boolean; // NEW: Capture actual rendered slides
}

export function useUniversalPresentation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingToRAG, setIsSavingToRAG] = useState(false);
  const [result, setResult] = useState<PresentationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  const generatePresentation = useCallback(async (request: PresentationRequest) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const presentationResult = await universalPresentationService.generatePresentation(request);
      
      if (presentationResult.success) {
        setResult(presentationResult);
        showSuccess(`Generated ${presentationResult.slides.length} slides with ${presentationResult.metadata.imagesGenerated} images`);
      } else {
        setError(presentationResult.error || 'Generation failed');
        showError(presentationResult.error || 'Failed to generate presentation');
      }
      
      return presentationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      showError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [showSuccess, showError]);

  // Download as PPTX - NOW WITH PROPER IMAGE EMBEDDING
  const downloadPPTX = useCallback(async (
    slides: GeneratedSlide[], 
    title: string, 
    options?: { includeReferences?: boolean; language?: string; captureFromDOM?: boolean }
  ) => {
    setIsDownloading(true);
    try {
      if (options?.captureFromDOM) {
        // Use DOM capture for animations, 3D, interactive content
        const result = await comprehensiveExportService.exportFromDOM(slides, title, 'pptx');
        if (result.success && result.blob) {
          const url = URL.createObjectURL(result.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // Standard export with image URL-to-base64 conversion
        await comprehensiveExportService.download(slides, title, 'pptx', {
          language: options?.language,
          quality: 'high'
        });
      }
      showSuccess('PowerPoint downloaded with all images!');
    } catch (err) {
      console.error('PPTX download error:', err);
      showError('PPTX download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [showSuccess, showError]);

  // Download as PDF - NOW WITH PROPER IMAGE EMBEDDING & 120+ LANGUAGES
  const downloadPDF = useCallback(async (
    slides: GeneratedSlide[], 
    title: string,
    options?: { language?: string; captureFromDOM?: boolean }
  ) => {
    setIsDownloading(true);
    try {
      if (options?.captureFromDOM) {
        // Use DOM capture for animations, 3D, interactive content
        const result = await comprehensiveExportService.exportFromDOM(slides, title, 'pdf');
        if (result.success && result.blob) {
          const url = URL.createObjectURL(result.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // Standard export with image URL-to-base64 conversion
        await comprehensiveExportService.download(slides, title, 'pdf', {
          language: options?.language,
          quality: 'high'
        });
      }
      showSuccess('PDF downloaded with all images and fonts!');
    } catch (err) {
      console.error('PDF download error:', err);
      showError('PDF download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [showSuccess, showError]);

  // Download slides as images (ZIP) - NOW WITH COMPREHENSIVE CAPTURE
  const downloadImages = useCallback(async (
    slides: GeneratedSlide[], 
    title: string,
    options?: { captureFromDOM?: boolean }
  ) => {
    setIsDownloading(true);
    try {
      if (options?.captureFromDOM) {
        // Capture actual rendered slides including animations, 3D, avatars
        const capturedSlides = await comprehensiveExportService.captureAllSlidesFromDOM('[data-slide-content]', slides);
        const result = await comprehensiveExportService.exportToImages(slides, title, capturedSlides);
        
        if (result.success && result.blob) {
          const url = URL.createObjectURL(result.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_images.zip`;
          a.click();
          URL.revokeObjectURL(url);
          showSuccess('Downloaded images as ZIP (including animations/3D as static)!');
        }
      } else {
        // Use comprehensive service for ZIP export
        await comprehensiveExportService.download(slides, title, 'images');
        showSuccess('Downloaded images as ZIP!');
      }
    } catch (err) {
      console.error('Images download error:', err);
      showError('Image download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [showSuccess, showError]);

  // Download as JSON (for reimport/editing)
  const downloadJSON = useCallback((slides: GeneratedSlide[], title: string, metadata?: any) => {
    const data = {
      title,
      slides,
      metadata,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('JSON exported!');
  }, [showSuccess]);

  // Universal download handler
  const download = useCallback(async (
    slides: GeneratedSlide[], 
    title: string, 
    format: DownloadFormat,
    metadata?: any
  ) => {
    switch (format) {
      case 'pptx':
        await downloadPPTX(slides, title);
        break;
      case 'pdf':
        await downloadPDF(slides, title);
        break;
      case 'images':
        await downloadImages(slides, title);
        break;
      case 'json':
        downloadJSON(slides, title, metadata);
        break;
    }
  }, [downloadPPTX, downloadPDF, downloadImages, downloadJSON]);

  // Save to RAG/Knowledge Base
  const saveToRAG = useCallback(async (
    slides: GeneratedSlide[], 
    title: string, 
    metadata?: { sourceType?: string; sourceContent?: string; tags?: string[] }
  ) => {
    setIsSavingToRAG(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Please sign in to save to Knowledge Base');
        return false;
      }
      
      // Prepare content for RAG
      const slideContent = slides.map(s => ({
        slideNumber: s.slideNumber,
        title: s.title,
        content: s.content.bullets?.map(b => typeof b === 'string' ? b : b).join('\n') || s.content.paragraphs?.join('\n') || '',
        speakerNotes: s.speakerNotes,
        references: []
      }));
      
      const documentContent = `# ${title}\n\n${slideContent.map(s => 
        `## Slide ${s.slideNumber}: ${s.title}\n\n${s.content}\n\n${s.speakerNotes ? `Notes: ${s.speakerNotes}` : ''}`
      ).join('\n\n')}`;
      
      // Save to universal_knowledge_base using correct schema
      const { error } = await supabase
        .from('universal_knowledge_base')
        .insert({
          domain: 'presentations',
          content_type: 'presentation',
          finding_name: title,
          description: documentContent.slice(0, 5000), // Limit for description field
          clinical_context: null,
          metadata: {
            slideCount: slides.length,
            generatedAt: new Date().toISOString(),
            sourceType: metadata?.sourceType || 'generated',
            sourceContent: metadata?.sourceContent,
            tags: metadata?.tags || ['presentation', 'generated'],
            slides: slideContent
          }
        });
      
      if (error) throw error;
      
      showSuccess('Saved to Knowledge Base for future AI reference!');
      return true;
    } catch (err) {
      console.error('RAG save error:', err);
      showError('Failed to save to Knowledge Base');
      return false;
    } finally {
      setIsSavingToRAG(false);
    }
  }, [showSuccess, showError]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    // State
    isGenerating,
    isDownloading,
    isSavingToRAG,
    result,
    error,
    
    // Actions
    generatePresentation,
    download,
    downloadPPTX,
    downloadPDF,
    downloadImages,
    downloadJSON,
    saveToRAG,
    reset
  };
}
