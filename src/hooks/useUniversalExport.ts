/**
 * UNIVERSAL EXPORT HOOK
 * 
 * Ecosystem-wide download functionality for all Genie products.
 * Provides unified API for exporting content to multiple formats:
 * - PPTX with 120+ language support, images, fonts, RTL
 * - PDF with DOM capture for animations, 3D, interactive content
 * - Images (ZIP) with full slide capture
 * - HTML with multi-language support
 * - Video export (via media service)
 * - JSON for reimport
 * 
 * Used by: Deck, Spark, Mind, Vibe, Arc, Hub, Ask Genie
 */

import { useState, useCallback } from 'react';
import { comprehensiveExportService, ExportConfig, ExportResult } from '@/services/comprehensiveExportService';
import { GeneratedSlide } from '@/services/universalPresentationService';
import { useMasterToast } from './useMasterToast';

export type UniversalExportFormat = 'pptx' | 'pdf' | 'images' | 'html' | 'video' | 'json' | 'csv' | 'txt' | 'md';

export interface UniversalExportOptions {
  format: UniversalExportFormat;
  language?: string;
  quality?: 'draft' | 'standard' | 'high' | 'ultra';
  captureFromDOM?: boolean;
  includeAnimationsAsStatic?: boolean;
  include3DAsSnapshot?: boolean;
  includeAvatarsAsStatic?: boolean;
  embedFonts?: boolean;
  containerSelector?: string;
}

export interface UniversalContentInput {
  // For presentations/slides
  slides?: GeneratedSlide[];
  
  // For text/markdown/html content
  content?: string;
  
  // For structured data (tables, CSVs)
  data?: any[];
  
  // Common metadata
  title: string;
  contentType?: 'presentation' | 'text' | 'html' | 'table' | 'code' | 'markdown';
  metadata?: Record<string, any>;
}

export function useUniversalExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  // Helper: Create download link
  const triggerDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Helper: Sanitize filename
  const sanitizeFilename = useCallback((name: string) => {
    return name.replace(/[^a-z0-9]/gi, '_');
  }, []);

  // Export slides to PPTX
  const exportToPPTX = useCallback(async (
    input: UniversalContentInput,
    options?: Partial<UniversalExportOptions>
  ): Promise<ExportResult> => {
    if (!input.slides || input.slides.length === 0) {
      return { success: false, error: 'No slides provided' };
    }

    setIsExporting(true);
    setExportProgress(10);
    setLastError(null);

    try {
      let result: ExportResult;

      if (options?.captureFromDOM) {
        setExportProgress(30);
        result = await comprehensiveExportService.exportFromDOM(
          input.slides, 
          input.title, 
          'pptx',
          options.containerSelector
        );
      } else {
        setExportProgress(50);
        result = await comprehensiveExportService.exportToPPTX(input.slides, input.title, {
          language: options?.language,
          quality: options?.quality || 'high'
        });
      }

      setExportProgress(90);

      if (result.success && result.blob) {
        triggerDownload(result.blob, `${sanitizeFilename(input.title)}.pptx`);
        showSuccess('PowerPoint downloaded with 120+ language support!');
      } else {
        throw new Error(result.error || 'PPTX export failed');
      }

      setExportProgress(100);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PPTX export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Export slides to PDF
  const exportToPDF = useCallback(async (
    input: UniversalContentInput,
    options?: Partial<UniversalExportOptions>
  ): Promise<ExportResult> => {
    if (!input.slides || input.slides.length === 0) {
      return { success: false, error: 'No slides provided' };
    }

    setIsExporting(true);
    setExportProgress(10);
    setLastError(null);

    try {
      let result: ExportResult;

      if (options?.captureFromDOM) {
        setExportProgress(30);
        result = await comprehensiveExportService.exportFromDOM(
          input.slides, 
          input.title, 
          'pdf',
          options.containerSelector
        );
      } else {
        setExportProgress(50);
        result = await comprehensiveExportService.exportToPDF(input.slides, input.title, {
          language: options?.language,
          quality: options?.quality || 'high'
        });
      }

      setExportProgress(90);

      if (result.success && result.blob) {
        triggerDownload(result.blob, `${sanitizeFilename(input.title)}.pdf`);
        showSuccess('PDF downloaded with all fonts and images!');
      } else {
        throw new Error(result.error || 'PDF export failed');
      }

      setExportProgress(100);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Export slides as images (ZIP)
  const exportToImages = useCallback(async (
    input: UniversalContentInput,
    options?: Partial<UniversalExportOptions>
  ): Promise<ExportResult> => {
    if (!input.slides || input.slides.length === 0) {
      return { success: false, error: 'No slides provided' };
    }

    setIsExporting(true);
    setExportProgress(10);
    setLastError(null);

    try {
      let capturedSlides;
      
      if (options?.captureFromDOM) {
        setExportProgress(30);
        capturedSlides = await comprehensiveExportService.captureAllSlidesFromDOM(
          options.containerSelector || '[data-slide-content]',
          input.slides
        );
      }

      setExportProgress(60);
      const result = await comprehensiveExportService.exportToImages(input.slides, input.title, capturedSlides);
      setExportProgress(90);

      if (result.success && result.blob) {
        triggerDownload(result.blob, `${sanitizeFilename(input.title)}_images.zip`);
        showSuccess('Images downloaded as ZIP!');
      } else {
        throw new Error(result.error || 'Images export failed');
      }

      setExportProgress(100);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Images export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Export text/content as HTML
  const exportToHTML = useCallback(async (
    input: UniversalContentInput,
    options?: Partial<UniversalExportOptions>
  ): Promise<ExportResult> => {
    if (!input.content) {
      return { success: false, error: 'No content provided' };
    }

    setIsExporting(true);
    setLastError(null);

    try {
      // Detect RTL for language
      const language = options?.language || 'en';
      const isRTL = ['ar', 'he', 'fa', 'ur', 'ps', 'ks', 'sd'].some(rtl => language.startsWith(rtl));

      const htmlDoc = `<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${input.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600&family=Noto+Sans+Arabic:wght@400;600&family=Noto+Sans+SC:wght@400;600&family=Noto+Sans+JP:wght@400;600&family=Noto+Sans+KR:wght@400;600&family=Noto+Sans+Devanagari:wght@400;600&family=Noto+Sans+Bengali:wght@400;600&family=Noto+Sans+Tamil:wght@400;600&family=Noto+Sans+Thai:wght@400;600&family=Noto+Sans+Hebrew:wght@400;600&family=Noto+Sans+Ethiopic:wght@400;600&display=swap');
        body { font-family: 'Noto Sans', sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; direction: ${isRTL ? 'rtl' : 'ltr'}; }
        .header { border-bottom: 2px solid #8b5cf6; padding-bottom: 15px; margin-bottom: 30px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: ${isRTL ? 'right' : 'left'}; }
        th { background-color: #f8fafc; font-weight: 600; }
        code { background-color: #1e293b; color: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
        pre { background-color: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧞‍♂️ ${input.title}</h1>
        <p>Generated: ${new Date().toLocaleString(language)}</p>
    </div>
    <div class="content">${input.content}</div>
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
        <p>Generated by Genie AI</p>
    </footer>
</body>
</html>`;

      const blob = new Blob([htmlDoc], { type: 'text/html' });
      triggerDownload(blob, `${sanitizeFilename(input.title)}.html`);
      showSuccess('HTML downloaded!');

      return { success: true, blob };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'HTML export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    } finally {
      setIsExporting(false);
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Export as JSON
  const exportToJSON = useCallback((
    input: UniversalContentInput,
    _options?: Partial<UniversalExportOptions>
  ): ExportResult => {
    try {
      const data = {
        title: input.title,
        slides: input.slides,
        content: input.content,
        data: input.data,
        metadata: input.metadata,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      triggerDownload(blob, `${sanitizeFilename(input.title)}.json`);
      showSuccess('JSON exported!');

      return { success: true, blob };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'JSON export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Export as plain text
  const exportToText = useCallback((
    input: UniversalContentInput,
    _options?: Partial<UniversalExportOptions>
  ): ExportResult => {
    try {
      let textContent = input.content || '';
      
      // If slides, convert to text
      if (input.slides && input.slides.length > 0) {
        textContent = input.slides.map(slide => {
          const parts = [
            `# ${slide.title}`,
            slide.subtitle ? slide.subtitle : '',
            slide.content.bullets?.join('\n• ') || '',
            slide.content.paragraphs?.join('\n') || '',
            slide.speakerNotes ? `\nNotes: ${slide.speakerNotes}` : ''
          ].filter(Boolean);
          return parts.join('\n');
        }).join('\n\n---\n\n');
      }

      const blob = new Blob([textContent], { type: 'text/plain' });
      triggerDownload(blob, `${sanitizeFilename(input.title)}.txt`);
      showSuccess('Text file downloaded!');

      return { success: true, blob };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Text export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Export as Markdown
  const exportToMarkdown = useCallback((
    input: UniversalContentInput,
    _options?: Partial<UniversalExportOptions>
  ): ExportResult => {
    try {
      let mdContent = input.content || '';
      
      // If slides, convert to markdown
      if (input.slides && input.slides.length > 0) {
        mdContent = `# ${input.title}\n\n${input.slides.map(slide => {
          const parts = [
            `## ${slide.title}`,
            slide.subtitle ? `*${slide.subtitle}*` : '',
            slide.content.bullets?.map(b => `- ${b}`).join('\n') || '',
            slide.content.paragraphs?.join('\n') || '',
            slide.speakerNotes ? `\n> **Notes:** ${slide.speakerNotes}` : ''
          ].filter(Boolean);
          return parts.join('\n\n');
        }).join('\n\n---\n\n')}`;
      }

      const blob = new Blob([mdContent], { type: 'text/markdown' });
      triggerDownload(blob, `${sanitizeFilename(input.title)}.md`);
      showSuccess('Markdown file downloaded!');

      return { success: true, blob };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Markdown export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Export as CSV (for table data)
  const exportToCSV = useCallback((
    input: UniversalContentInput,
    _options?: Partial<UniversalExportOptions>
  ): ExportResult => {
    try {
      let csvContent = '';

      // If HTML table, parse it
      if (input.content && input.content.includes('<table')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input.content, 'text/html');
        const rows = doc.querySelectorAll('tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          const rowData = Array.from(cells).map(cell => {
            const text = cell.textContent || '';
            return text.includes(',') ? `"${text.replace(/"/g, '""')}"` : text;
          });
          csvContent += rowData.join(',') + '\n';
        });
      } else if (input.data) {
        // Convert array of objects to CSV
        const headers = Object.keys(input.data[0] || {});
        csvContent = headers.join(',') + '\n';
        input.data.forEach(row => {
          const values = headers.map(h => {
            const val = String(row[h] || '');
            return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
          });
          csvContent += values.join(',') + '\n';
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      triggerDownload(blob, `${sanitizeFilename(input.title)}.csv`);
      showSuccess('CSV file downloaded!');

      return { success: true, blob };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'CSV export failed';
      setLastError(message);
      showError(message);
      return { success: false, error: message };
    }
  }, [triggerDownload, sanitizeFilename, showSuccess, showError]);

  // Universal export handler
  const universalExport = useCallback(async (
    input: UniversalContentInput,
    options: UniversalExportOptions
  ): Promise<ExportResult> => {
    switch (options.format) {
      case 'pptx':
        return exportToPPTX(input, options);
      case 'pdf':
        return exportToPDF(input, options);
      case 'images':
        return exportToImages(input, options);
      case 'html':
        return exportToHTML(input, options);
      case 'json':
        return exportToJSON(input, options);
      case 'txt':
        return exportToText(input, options);
      case 'md':
        return exportToMarkdown(input, options);
      case 'csv':
        return exportToCSV(input, options);
      default:
        return { success: false, error: `Unsupported format: ${options.format}` };
    }
  }, [exportToPPTX, exportToPDF, exportToImages, exportToHTML, exportToJSON, exportToText, exportToMarkdown, exportToCSV]);

  return {
    // State
    isExporting,
    exportProgress,
    lastError,

    // Individual exporters
    exportToPPTX,
    exportToPDF,
    exportToImages,
    exportToHTML,
    exportToJSON,
    exportToText,
    exportToMarkdown,
    exportToCSV,

    // Universal handler
    universalExport
  };
}

export default useUniversalExport;
