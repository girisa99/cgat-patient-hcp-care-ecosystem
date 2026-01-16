/**
 * Hook for Universal Presentation Generator
 * Wraps the universalPresentationService with React state management
 * Supports: PPTX, PDF, Images downloads + RAG storage
 */

import { useState, useCallback } from 'react';
import { 
  universalPresentationService, 
  PresentationRequest, 
  PresentationResult,
  GeneratedSlide 
} from '@/services/universalPresentationService';
import { useMasterToast } from './useMasterToast';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export type DownloadFormat = 'pptx' | 'pdf' | 'images' | 'json';

export interface PresentationDownloadOptions {
  format: DownloadFormat;
  includeNotes?: boolean;
  includeReferences?: boolean;
  quality?: 'standard' | 'high';
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

  // Download as PPTX
  const downloadPPTX = useCallback(async (slides: GeneratedSlide[], title: string, options?: { includeReferences?: boolean }) => {
    setIsDownloading(true);
    try {
      const blob = await universalPresentationService.downloadAsPPTX(slides, title);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('PowerPoint downloaded!');
    } catch (err) {
      showError('PPTX download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [showSuccess, showError]);

  // Download as PDF
  const downloadPDF = useCallback(async (slides: GeneratedSlide[], title: string) => {
    setIsDownloading(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [960, 540] });
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        if (i > 0) pdf.addPage();
        
        // Title
        pdf.setFontSize(28);
        pdf.setTextColor(30, 41, 59);
        pdf.text(slide.title, 40, 60);
        
        // Subtitle
        if (slide.subtitle) {
          pdf.setFontSize(14);
          pdf.setTextColor(100, 116, 139);
          pdf.text(slide.subtitle, 40, 85);
        }
        
        // Bullets
        if (slide.content.bullets && slide.content.bullets.length > 0) {
          pdf.setFontSize(14);
          pdf.setTextColor(30, 41, 59);
          slide.content.bullets.forEach((bullet, idx) => {
            const bulletText = typeof bullet === 'string' ? bullet : bullet;
            pdf.text(`• ${bulletText}`, 50, 120 + (idx * 30));
          });
        }
        
        // Stats
        if (slide.content.stats && slide.content.stats.length > 0) {
          pdf.setFontSize(24);
          pdf.setTextColor(139, 92, 246);
          slide.content.stats.forEach((stat, idx) => {
            pdf.text(`${stat.value}`, 50 + (idx * 200), 200);
            pdf.setFontSize(12);
            pdf.setTextColor(100, 116, 139);
            pdf.text(stat.label, 50 + (idx * 200), 220);
            pdf.setFontSize(24);
            pdf.setTextColor(139, 92, 246);
          });
        }
        
        // Slide number
        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`${i + 1} / ${slides.length}`, 900, 520);
      }
      
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      showSuccess('PDF downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      showError('PDF download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [showSuccess, showError]);

  // Download slides as images (ZIP)
  const downloadImages = useCallback(async (slides: GeneratedSlide[], title: string) => {
    setIsDownloading(true);
    try {
      // For now, download individual images from slides that have them
      const imagesWithUrls = slides.filter(s => s.image?.url);
      
      if (imagesWithUrls.length === 0) {
        showError('No images to download');
        return;
      }
      
      // Download each image
      for (let i = 0; i < imagesWithUrls.length; i++) {
        const slide = imagesWithUrls[i];
        if (slide.image?.url) {
          const a = document.createElement('a');
          a.href = slide.image.url;
          a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_slide_${slide.slideNumber}.png`;
          a.click();
          await new Promise(r => setTimeout(r, 300)); // Stagger downloads
        }
      }
      
      showSuccess(`Downloaded ${imagesWithUrls.length} images!`);
    } catch (err) {
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
