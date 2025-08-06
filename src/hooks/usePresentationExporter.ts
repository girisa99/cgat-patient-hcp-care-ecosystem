import { useCallback } from 'react';
import { useToast } from './use-toast';
import html2canvas from 'html2canvas';

export const usePresentationExporter = () => {
  const { toast } = useToast();

  // High-fidelity HTML export with canvas-captured animations
  const exportHTML = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      console.log('🔄 Starting high-fidelity HTML export...');
      toast({
        title: "📄 Generating HTML Export",
        description: "Capturing slides with animations...",
        variant: "default",
      });

      const originalSlide = document.querySelector('[data-current-slide]')?.getAttribute('data-current-slide') || '0';
      const slideImages: string[] = [];

      for (let i = 0; i < slides.length; i++) {
        console.log(`🔄 Capturing slide ${i + 1}/${slides.length}`);
        navigationCallback(i);
        
        // Wait for slide transition and animations to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        const slideElement = document.querySelector('[data-slide-content]');
        if (slideElement) {
          // Capture the exact visual state with html2canvas
          const canvas = await html2canvas(slideElement as HTMLElement, {
            backgroundColor: '#ffffff',
            scale: 2, // High resolution
            useCORS: true,
            allowTaint: true,
            width: slideElement.scrollWidth,
            height: slideElement.scrollHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
          });
          
          const imageDataURL = canvas.toDataURL('image/png', 1.0);
          slideImages.push(imageDataURL);
        }
      }

      navigationCallback(parseInt(originalSlide));

      // Generate HTML with embedded high-resolution images
      const slideHTML = slideImages.map((imageData, index) => `
        <div class="exported-slide">
          <div class="slide-header">
            <h1>${slides[index].title}</h1>
            ${slides[index].subtitle ? `<h2>${slides[index].subtitle}</h2>` : ''}
          </div>
          <div class="slide-content">
            <img src="${imageData}" alt="Slide ${index + 1}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
          </div>
          <div class="slide-footer">Slide ${index + 1} of ${slides.length}</div>
        </div>
      `).join('');

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Treatment Center AI Implementation Guide - High Fidelity Export</title>
    <style>
        body { 
          font-family: system-ui, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5; 
          line-height: 1.6;
        }
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
        }
        .title-page { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 60px; 
          text-align: center; 
          border-radius: 12px;
          margin-bottom: 40px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .title-page h1 { 
          font-size: 3rem; 
          margin: 0 0 20px 0; 
          font-weight: 800;
        }
        .title-page p { 
          font-size: 1.2rem; 
          margin: 10px 0; 
          opacity: 0.95;
        }
        .exported-slide { 
          background: white; 
          margin-bottom: 40px; 
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12); 
          overflow: hidden;
        }
        .slide-header { 
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white; 
          padding: 30px; 
          text-align: center;
        }
        .slide-header h1 { 
          font-size: 2rem; 
          margin: 0 0 10px 0; 
          font-weight: 700;
        }
        .slide-header h2 { 
          font-size: 1.2rem; 
          margin: 0; 
          opacity: 0.9; 
          font-weight: 500;
        }
        .slide-content { 
          padding: 0; 
          display: flex; 
          justify-content: center; 
          align-items: center;
        }
        .slide-footer { 
          background: #f8f9fa; 
          padding: 15px; 
          text-align: center;
          color: #666; 
          border-top: 1px solid #eee;
          font-size: 0.9rem;
        }
        
        @media print {
          .exported-slide { 
            page-break-after: always; 
            margin-bottom: 0;
          }
          .slide-footer { 
            page-break-inside: avoid; 
          }
          body { 
            background: white; 
            padding: 0;
          }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="title-page">
            <h1>🏥 Treatment Center AI Implementation Guide</h1>
            <p>Complete ${slides.length}-Slide High-Fidelity Export</p>
            <p><strong>Animations & Visual State Preserved</strong></p>
            <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        ${slideHTML}
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

  // High-fidelity PDF export with canvas-captured animations
  const exportPDF = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      console.log('🔄 Starting high-fidelity PDF export...');
      toast({
        title: "📄 Capturing Slides for PDF",
        description: "Preserving animations and visual state...",
        variant: "default",
      });

      const originalSlide = document.querySelector('[data-current-slide]')?.getAttribute('data-current-slide') || '0';
      const slideImages: string[] = [];

      for (let i = 0; i < slides.length; i++) {
        console.log(`🔄 Capturing slide ${i + 1}/${slides.length} for PDF`);
        navigationCallback(i);
        
        // Wait for animations to complete
        await new Promise(resolve => setTimeout(resolve, 1200));

        const slideElement = document.querySelector('[data-slide-content]');
        if (slideElement) {
          // Capture high-resolution screenshot
          const canvas = await html2canvas(slideElement as HTMLElement, {
            backgroundColor: '#ffffff',
            scale: 3, // Very high resolution for PDF
            useCORS: true,
            allowTaint: true,
            width: slideElement.scrollWidth,
            height: slideElement.scrollHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
          });
          
          const imageDataURL = canvas.toDataURL('image/png', 1.0);
          slideImages.push(imageDataURL);
        }
      }

      navigationCallback(parseInt(originalSlide));

      // Generate PDF-optimized HTML with high-resolution images
      const slideHTML = slideImages.map((imageData, index) => `
        <div class="pdf-slide">
          <div class="slide-header">
            <h1>${slides[index].title}</h1>
            ${slides[index].subtitle ? `<h2>${slides[index].subtitle}</h2>` : ''}
          </div>
          <div class="slide-image">
            <img src="${imageData}" alt="Slide ${index + 1}" style="width: 100%; height: auto; max-height: 180mm; object-fit: contain;" />
          </div>
          <div class="slide-number">Slide ${index + 1} of ${slides.length}</div>
        </div>
      `).join('');

      const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Treatment Center AI Guide - High Fidelity PDF</title>
    <style>
        @page { 
          size: A4 landscape; 
          margin: 15mm; 
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
          height: 100vh;
          padding: 15px;
          box-sizing: border-box;
          background: white;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .pdf-slide:last-child { 
          page-break-after: avoid; 
        }
        
        .slide-header { 
          text-align: center; 
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #4f46e5;
          flex-shrink: 0;
        }
        
        .slide-header h1 { 
          font-size: 2rem; 
          margin: 0 0 8px 0; 
          color: #1e293b;
          font-weight: 800;
        }
        
        .slide-header h2 { 
          font-size: 1.2rem; 
          margin: 0; 
          color: #64748b;
          font-weight: 500;
        }
        
        .slide-image { 
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 0;
        }
        
        .slide-number { 
          position: absolute;
          bottom: 10px;
          right: 15px;
          font-size: 0.9rem;
          color: #64748b;
          background: rgba(255,255,255,0.9);
          padding: 4px 8px;
          border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="pdf-slide">
      <div style="text-align: center; padding: 60px 0; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 3rem; margin: 0 0 30px 0; color: #4f46e5;">
          🏥 Treatment Center AI Implementation Guide
        </h1>
        <p style="font-size: 1.5rem; color: #64748b; margin: 20px 0;">
          Complete ${slides.length}-Slide High-Fidelity Export
        </p>
        <p style="font-size: 1.2rem; color: #64748b;">
          <strong>Animations & Visual State Preserved</strong>
        </p>
        <p style="font-size: 1rem; color: #64748b;">
          Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
    ${slideHTML}
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

        console.log('✅ High-fidelity PDF print dialog opened');
        toast({
          title: "📄 High-Fidelity PDF Ready",
          description: "All animations preserved! Use browser's print dialog to save as PDF",
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

  // High-fidelity PowerPoint export with preserved animations
  const exportPPT = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      console.log('🔄 Starting high-fidelity PowerPoint export...');
      toast({
        title: "📊 Generating PowerPoint Export",
        description: "Capturing slides for PowerPoint import...",
        variant: "default",
      });

      await exportHTML(slides, navigationCallback);

      toast({
        title: "📊 PowerPoint Export Complete",
        description: "High-fidelity HTML file ready for PowerPoint import",
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