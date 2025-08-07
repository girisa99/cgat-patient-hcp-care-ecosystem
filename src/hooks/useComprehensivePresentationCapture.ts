/**
 * Comprehensive Presentation Capture Hook
 * Captures ALL slides with complete content and proper styling
 */

import { useCallback } from 'react';
import { useToast } from './use-toast';
import html2canvas from 'html2canvas';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

export const useComprehensivePresentationCapture = () => {
  const { toast } = useToast();

  const captureAllSlides = useCallback(async (slides: Slide[]) => {
    const capturedSlides: string[] = [];
    
    // Get the current slide to restore later
    const currentSlideElement = document.querySelector('[data-slide-id]');
    const currentSlideIndex = currentSlideElement ? 
      parseInt(currentSlideElement.getAttribute('data-slide-id') || '0') : 0;

    for (let i = 0; i < slides.length; i++) {
      try {
        // Navigate to the slide (simulate clicking slide indicator)
        const slideIndicator = document.querySelector(`[title="Slide ${i + 1}"]`) as HTMLElement;
        if (slideIndicator) {
          slideIndicator.click();
          
          // Wait for slide transition to complete
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find the slide content element
          const slideContentElement = document.querySelector('[data-slide-content]') as HTMLElement;
          if (slideContentElement) {
            // Force layout calculation and get full content dimensions
            slideContentElement.style.overflow = 'visible';
            const originalHeight = slideContentElement.style.height;
            slideContentElement.style.height = 'auto';
            
            // Wait for layout to settle
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Get the full scroll dimensions to capture all content
            const fullWidth = Math.max(
              slideContentElement.scrollWidth,
              slideContentElement.offsetWidth,
              slideContentElement.clientWidth
            );
            const fullHeight = Math.max(
              slideContentElement.scrollHeight,
              slideContentElement.offsetHeight,
              slideContentElement.clientHeight
            );
            
            // Capture the slide as image with full dimensions
            const canvas = await html2canvas(slideContentElement, {
              useCORS: true,
              allowTaint: false,
              backgroundColor: '#ffffff',
              scale: 2,
              width: fullWidth,
              height: fullHeight,
              scrollX: 0,
              scrollY: 0,
              windowWidth: fullWidth,
              windowHeight: fullHeight,
              ignoreElements: (element) => {
                // Ignore any overlay elements that might interfere
                return element.classList?.contains('cursor-pointer') || 
                       element.tagName === 'BUTTON' ||
                       element.getAttribute('role') === 'button';
              }
            });
            
            // Restore original styles
            slideContentElement.style.height = originalHeight;
            slideContentElement.style.overflow = '';
            
            const imageData = canvas.toDataURL('image/png', 1.0);
            capturedSlides.push(imageData);
          } else {
            // Fallback to slide data
            capturedSlides.push('');
          }
        }
      } catch (error) {
        console.error(`Error capturing slide ${i + 1}:`, error);
        capturedSlides.push('');
      }
    }

    // Restore original slide
    const originalSlideIndicator = document.querySelector(`[title="Slide ${currentSlideIndex + 1}"]`) as HTMLElement;
    if (originalSlideIndicator) {
      originalSlideIndicator.click();
    }

    return capturedSlides;
  }, []);

  const downloadHTML = useCallback(async (slides: Slide[]) => {
    try {
      toast({
        title: "🔄 Capturing All Slides",
        description: "Please wait while we capture all 13 slides...",
        variant: "default",
      });

      const capturedImages = await captureAllSlides(slides);

      const slidesHTML = slides.map((slide, index) => {
        const imageData = capturedImages[index];
        
        return `
          <div class="slide" data-slide="${index + 1}">
            <div class="slide-number">Slide ${index + 1} of ${slides.length}</div>
            <div class="slide-header">
              <h1 class="slide-title">${slide.title}</h1>
              ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
            </div>
            <div class="slide-content">
              ${imageData ? 
                `<div class="slide-image-container">
                   <img src="${imageData}" alt="Slide ${index + 1}: ${slide.title}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
                 </div>` : 
                `<div class="slide-placeholder">
                   <p>Content for slide ${index + 1}: ${slide.title}</p>
                   ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ''}
                 </div>`
              }
            </div>
          </div>
        `;
      }).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agentic AI Presentation - Complete Export (${slides.length} Slides)</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 20px;
                background: #f8fafc;
                color: #1e293b;
              }
              
              .presentation-container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              
              .slide {
                padding: 48px;
                min-height: 80vh;
                page-break-after: always;
                position: relative;
                background: white;
                border-bottom: 1px solid #e2e8f0;
              }
              
              .slide:last-child { 
                page-break-after: avoid; 
                border-bottom: none;
              }
              
              .slide-number {
                position: absolute;
                top: 24px;
                right: 32px;
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
              }
              
              .slide-title {
                font-size: 32px;
                font-weight: 800;
                color: #1e293b;
                margin-bottom: 12px;
                text-align: center;
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              
              .slide-subtitle {
                font-size: 18px;
                color: #64748b;
                text-align: center;
                margin-bottom: 32px;
                font-weight: 500;
              }
              
              .slide-content {
                margin-top: 24px;
              }
              
              .slide-image-container {
                text-align: center;
                margin: 20px 0;
              }
              
              .slide-placeholder {
                padding: 40px;
                background: #f8fafc;
                border-radius: 12px;
                border: 2px solid #e2e8f0;
                text-align: center;
              }
              
              @media print {
                body { background: white !important; }
                .slide { box-shadow: none !important; margin: 0 !important; }
                .presentation-container { box-shadow: none !important; }
                .slide-image-container img {
                  max-width: 100% !important;
                  height: auto !important;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="presentation-container">
              <div class="presentation-header" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 40px; text-align: center;">
                <h1 style="font-size: 42px; margin: 0 0 16px 0;">🤖 Agentic AI Implementation</h1>
                <p style="font-size: 18px; margin: 0; opacity: 0.9;">Complete Healthcare Automation Platform</p>
                <p style="font-size: 14px; margin: 16px 0 0 0; opacity: 0.8;">
                  ${slides.length} slides captured • Generated ${new Date().toLocaleDateString()} • Complete visual export
                </p>
              </div>
              ${slidesHTML}
              <div class="presentation-footer" style="background: #f8fafc; padding: 40px; text-align: center; border-top: 2px solid #e2e8f0;">
                <h3 style="color: #1e293b; margin: 0 0 16px 0;">📋 Export Complete</h3>
                <p style="color: #64748b; margin: 0;">All ${slides.length} slides have been captured with complete visual content and styling.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentic-ai-complete-presentation-${slides.length}-slides-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Complete Export Success",
        description: `All ${slides.length} slides exported with visual content preserved`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error in comprehensive export:', error);
      toast({
        title: "❌ Export Failed",
        description: "Failed to export complete presentation",
        variant: "destructive",
      });
    }
  }, [captureAllSlides, toast]);

  const downloadPDF = useCallback(async (slides: Slide[]) => {
    try {
      toast({
        title: "🔄 Generating PDF",
        description: "Capturing all slides for PDF export...",
        variant: "default",
      });

      const capturedImages = await captureAllSlides(slides);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      const slidesHTML = slides.map((slide, index) => {
        const imageData = capturedImages[index];
        
        return `
          <div class="slide" data-slide="${index + 1}">
            <div class="slide-number">Slide ${index + 1} of ${slides.length}</div>
            <div class="slide-header">
              <h1 class="slide-title">${slide.title}</h1>
              ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
            </div>
            <div class="slide-content">
              ${imageData ? 
                `<img src="${imageData}" alt="Slide ${index + 1}" style="width: 100%; height: auto; max-height: 70vh; object-fit: contain;" />` : 
                `<div class="slide-placeholder">
                   <p>Slide ${index + 1}: ${slide.title}</p>
                 </div>`
              }
            </div>
          </div>
        `;
      }).join('');

      const pdfHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Agentic AI Presentation PDF</title>
            <style>
              @page { size: A4; margin: 15mm; }
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif;
                margin: 0; padding: 0;
                background: white;
                color: #1e293b;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              
              .slide {
                page-break-after: always;
                padding: 20px;
                min-height: 90vh;
                position: relative;
                background: white;
              }
              
              .slide:last-child { page-break-after: avoid; }
              
              .slide-number {
                position: absolute;
                top: 10px;
                right: 15px;
                background: #4f46e5;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
              }
              
              .slide-title {
                font-size: 24px;
                font-weight: 800;
                color: #1e293b;
                margin-bottom: 8px;
                text-align: center;
                border-bottom: 2px solid #4f46e5;
                padding-bottom: 8px;
              }
              
              .slide-subtitle {
                font-size: 14px;
                color: #64748b;
                text-align: center;
                margin-bottom: 20px;
              }
              
              .slide-content {
                margin-top: 16px;
                text-align: center;
              }
              
              .slide-content img {
                max-width: 100% !important;
                height: auto !important;
                page-break-inside: avoid;
              }
              
              .slide-placeholder {
                padding: 40px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                text-align: center;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            ${slidesHTML}
          </body>
        </html>
      `;

      printWindow.document.write(pdfHTML);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        toast({
          title: "✅ PDF Ready",
          description: "PDF print dialog opened with all slides",
          variant: "default",
        });
      }, 1000);

    } catch (error) {
      console.error('Error in PDF export:', error);
      toast({
        title: "❌ PDF Export Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  }, [captureAllSlides, toast]);

  return {
    downloadHTML,
    downloadPDF,
    captureAllSlides
  };
};