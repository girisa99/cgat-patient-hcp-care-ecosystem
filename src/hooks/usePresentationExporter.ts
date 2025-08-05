import { useCallback } from 'react';
import { useToast } from './use-toast';

export const usePresentationExporter = () => {
  const { toast } = useToast();

  // Simple HTML export with embedded images
  const exportHTML = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      console.log('🔄 Starting HTML export...');
      toast({
        title: "📄 Generating HTML Export",
        description: "Creating downloadable presentation...",
        variant: "default",
      });

      const originalSlide = document.querySelector('[data-current-slide]')?.getAttribute('data-current-slide') || '0';
      const slideHTML: string[] = [];

      for (let i = 0; i < slides.length; i++) {
        console.log(`🔄 Processing slide ${i + 1}/${slides.length}`);
        navigationCallback(i);
        await new Promise(resolve => setTimeout(resolve, 500));

        const slideElement = document.querySelector('[data-slide-content]');
        console.log('📍 Found slide element:', !!slideElement);
        if (slideElement) {
          const clonedSlide = slideElement.cloneNode(true) as HTMLElement;
          
          // Remove interactive elements
          clonedSlide.querySelectorAll('button, [role="button"]').forEach(el => el.remove());
          
          slideHTML.push(`
            <div class="exported-slide">
              <div class="slide-header">
                <h1>${slides[i].title}</h1>
                ${slides[i].subtitle ? `<h2>${slides[i].subtitle}</h2>` : ''}
              </div>
              <div class="slide-content">
                ${clonedSlide.innerHTML}
              </div>
              <div class="slide-footer">Slide ${i + 1} of ${slides.length}</div>
            </div>
          `);
        }
      }

      navigationCallback(parseInt(originalSlide));

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Treatment Center AI Implementation Guide</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .title-page { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; padding: 60px; text-align: center; border-radius: 12px;
          margin-bottom: 40px;
        }
        .title-page h1 { font-size: 3rem; margin: 0 0 20px 0; }
        .title-page p { font-size: 1.2rem; margin: 10px 0; }
        .exported-slide { 
          background: white; margin-bottom: 40px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;
        }
        .slide-header { 
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white; padding: 30px; text-align: center;
        }
        .slide-header h1 { font-size: 2rem; margin: 0 0 10px 0; }
        .slide-header h2 { font-size: 1.2rem; margin: 0; opacity: 0.9; }
        .slide-content { padding: 40px; }
        .slide-footer { 
          background: #f8f9fa; padding: 15px; text-align: center;
          color: #666; border-top: 1px solid #eee;
        }
        
        /* Preserve original styling */
        .grid { display: grid; gap: 1.5rem; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .p-6 { padding: 1.5rem; }
        .rounded { border-radius: 0.375rem; }
        .shadow { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
        
        @media print {
          .exported-slide { page-break-after: always; }
          .slide-footer { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title-page">
            <h1>🏥 Treatment Center AI Implementation Guide</h1>
            <p>Complete ${slides.length}-Slide Implementation Guide</p>
            <p><strong>HTML Export</strong> | Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        ${slideHTML.join('')}
    </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `treatment-center-ai-guide-${slides.length}-slides.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ HTML export completed');
      toast({
        title: "📄 HTML Export Successful",
        description: "Presentation downloaded as HTML file",
        variant: "default",
      });

    } catch (error) {
      console.error('❌ HTML export failed:', error);
      toast({
        title: "❌ Export Failed",
        description: "Could not generate HTML file",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Print-to-PDF method (most reliable)
  const exportPDF = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      console.log('🔄 Starting PDF export...');
      toast({
        title: "📄 Preparing PDF Export",
        description: "Opening print dialog for PDF generation...",
        variant: "default",
      });

      // Generate print-optimized HTML
      const originalSlide = document.querySelector('[data-current-slide]')?.getAttribute('data-current-slide') || '0';
      const slideHTML: string[] = [];

      for (let i = 0; i < slides.length; i++) {
        navigationCallback(i);
        await new Promise(resolve => setTimeout(resolve, 300));

        const slideElement = document.querySelector('[data-slide-content]');
        if (slideElement) {
          const clonedSlide = slideElement.cloneNode(true) as HTMLElement;
          clonedSlide.querySelectorAll('button, [role="button"]').forEach(el => el.remove());
          
          slideHTML.push(`
            <div class="pdf-slide">
              <div class="slide-header">
                <h1>${slides[i].title}</h1>
                ${slides[i].subtitle ? `<h2>${slides[i].subtitle}</h2>` : ''}
              </div>
              <div class="slide-body">
                ${clonedSlide.innerHTML}
              </div>
              <div class="slide-number">Slide ${i + 1} of ${slides.length}</div>
            </div>
          `);
        }
      }

      navigationCallback(parseInt(originalSlide));

      const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Treatment Center AI Guide - PDF Export</title>
    <style>
        @page { 
          size: A4 landscape; 
          margin: 20mm; 
        }
        
        body { 
          font-family: system-ui, sans-serif; 
          margin: 0; 
          padding: 0;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .pdf-slide { 
          page-break-after: always; 
          width: 100%;
          min-height: 210mm;
          padding: 20px;
          box-sizing: border-box;
          background: white;
          position: relative;
        }
        
        .pdf-slide:last-child { 
          page-break-after: avoid; 
        }
        
        .slide-header { 
          text-align: center; 
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #4f46e5;
        }
        
        .slide-header h1 { 
          font-size: 2.5rem; 
          margin: 0 0 10px 0; 
          color: #1e293b;
          font-weight: 800;
        }
        
        .slide-header h2 { 
          font-size: 1.5rem; 
          margin: 0; 
          color: #64748b;
          font-weight: 500;
        }
        
        .slide-body { 
          font-size: 1rem; 
          line-height: 1.6;
          color: #374151;
        }
        
        .slide-number { 
          position: absolute;
          bottom: 15px;
          right: 20px;
          font-size: 0.9rem;
          color: #64748b;
        }
        
        /* Preserve layouts */
        .grid { display: grid; gap: 1.5rem; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(2, 1fr); } /* Fit better on PDF */
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .p-6 { padding: 1.5rem; }
        .rounded { border-radius: 0.375rem; }
        
        /* Card styling for PDF */
        .card-content, [class*="Card"] {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          background: #f8fafc;
        }
    </style>
</head>
<body>
    <div class="pdf-slide">
      <div style="text-align: center; padding: 60px 0;">
        <h1 style="font-size: 3.5rem; margin: 0 0 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          🏥 Treatment Center AI Implementation Guide
        </h1>
        <p style="font-size: 1.5rem; color: #64748b; margin: 20px 0;">
          Complete ${slides.length}-Slide Implementation Guide
        </p>
        <p style="font-size: 1.2rem; color: #64748b;">
          PDF Export - Generated: ${new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
    ${slideHTML.join('')}
</body>
</html>`;

      // Open in new window for print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        };

        console.log('✅ PDF print dialog opened');
        toast({
          title: "📄 PDF Ready",
          description: "Use your browser's print dialog to save as PDF",
          variant: "default",
        });
      } else {
        throw new Error('Could not open print window');
      }

    } catch (error) {
      console.error('❌ PDF export failed:', error);
      toast({
        title: "❌ PDF Export Failed",
        description: "Could not prepare PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Simple PowerPoint export (HTML format)
  const exportPPT = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      console.log('🔄 Starting PowerPoint export...');
      toast({
        title: "📊 Generating PowerPoint Export",
        description: "Creating presentation file...",
        variant: "default",
      });

      await exportHTML(slides, navigationCallback);

      toast({
        title: "📊 PowerPoint Export Complete",
        description: "HTML file generated - can be imported into PowerPoint",
        variant: "default",
      });

    } catch (error) {
      console.error('❌ PowerPoint export failed:', error);
      toast({
        title: "❌ PowerPoint Export Failed",
        description: "Could not generate PowerPoint file",
        variant: "destructive",
      });
    }
  }, [exportHTML, toast]);

  return {
    exportHTML,
    exportPDF,
    exportPPT
  };
};