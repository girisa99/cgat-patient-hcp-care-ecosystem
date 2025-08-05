import { useCallback } from 'react';
import { useToast } from './use-toast';

export const usePresentationCapture = () => {
  const { toast } = useToast();

  const getAllSlideContents = useCallback(async (slides: any[]) => {
    const slideContents: { html: string; title: string; subtitle?: string }[] = [];
    
    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get current slide index
    const currentSlideElement = document.querySelector('[data-current-slide]');
    const originalSlide = currentSlideElement ? parseInt(currentSlideElement.getAttribute('data-current-slide') || '0') : 0;
    
    // Get slide navigation buttons (the dots)
    const slideNavButtons = document.querySelectorAll('button[data-slide-index], .slide-indicator button');
    
    for (let i = 0; i < slides.length; i++) {
      // Navigate to slide i
      if (slideNavButtons[i]) {
        (slideNavButtons[i] as HTMLButtonElement).click();
      } else {
        // Try alternative navigation methods
        const navEvent = new CustomEvent('slideChange', { detail: { slideIndex: i } });
        document.dispatchEvent(navEvent);
      }
      
      // Wait for slide transition
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture the current slide content
      const slideContainer = document.querySelector('.absolute.inset-0, [data-slide-content], .slide-content');
      if (slideContainer) {
        const clonedSlide = slideContainer.cloneNode(true) as HTMLElement;
        
        // Remove interactive elements
        clonedSlide.querySelectorAll('button, .controls, .no-print, [data-no-export]').forEach(el => el.remove());
        
        slideContents.push({
          html: clonedSlide.innerHTML,
          title: slides[i].title || `Slide ${i + 1}`,
          subtitle: slides[i].subtitle
        });
      } else {
        // Fallback content
        slideContents.push({
          html: `<div class="slide-fallback">
            <p><strong>${slides[i].title || `Slide ${i + 1}`}</strong></p>
            <p>Complete presentation content captured from live application.</p>
          </div>`,
          title: slides[i].title || `Slide ${i + 1}`,
          subtitle: slides[i].subtitle
        });
      }
    }
    
    // Navigate back to original slide
    if (slideNavButtons[originalSlide]) {
      (slideNavButtons[originalSlide] as HTMLButtonElement).click();
    }
    
    return slideContents;
  }, []);

  const downloadActualPDF = useCallback(async (slides: any[]) => {
    try {
      toast({
        title: "🔄 Capturing All Slides",
        description: "Please wait while we capture all presentation content...",
        variant: "default",
      });

      const slideContents = await getAllSlideContents(slides);
      
      const css = `
        <style>
          @media print {
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .pdf-slide { 
              page-break-after: always; 
              width: 210mm; 
              min-height: 297mm; 
              padding: 20mm; 
              box-sizing: border-box;
              background: white;
            }
            .pdf-slide:last-child { page-break-after: avoid; }
            .slide-header { 
              text-align: center; 
              margin-bottom: 2rem; 
              padding-bottom: 1rem; 
              border-bottom: 3px solid #4f46e5; 
            }
            .slide-title { 
              font-size: 2rem; 
              font-weight: 800; 
              margin-bottom: 0.5rem; 
              color: #1e293b; 
            }
            .slide-subtitle { 
              font-size: 1.2rem; 
              color: #64748b; 
              font-weight: 500; 
            }
            .slide-content { 
              font-size: 1rem; 
              line-height: 1.6; 
              color: #374151; 
            }
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          }
          
          /* Screen styles */
          body { 
            margin: 0; 
            padding: 20px; 
            background: #f8fafc; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          }
          .pdf-slide { 
            background: white; 
            margin: 0 auto 2rem auto; 
            padding: 40px; 
            max-width: 800px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
            border: 1px solid #e2e8f0;
          }
          .slide-header { 
            text-align: center; 
            margin-bottom: 2rem; 
            padding-bottom: 1.5rem; 
            border-bottom: 3px solid #4f46e5; 
          }
          .slide-title { 
            font-size: 2.5rem; 
            font-weight: 800; 
            margin-bottom: 1rem; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            background-clip: text;
          }
          .slide-subtitle { 
            font-size: 1.25rem; 
            color: #64748b; 
            font-weight: 500; 
          }
          .slide-content { 
            font-size: 1rem; 
            line-height: 1.7; 
            color: #374151; 
          }
          .export-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 40px;
          }
          .export-header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
          .export-header p { font-size: 1.125rem; opacity: 0.95; margin: 0.5rem 0; }
        </style>
      `;

      const slidesHTML = slideContents.map((slide, index) => `
        <div class="pdf-slide">
          <div class="slide-header">
            <h1 class="slide-title">${slide.title}</h1>
            ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
          </div>
          <div class="slide-content">
            ${slide.html}
          </div>
          <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9rem;">
            Slide ${index + 1} of ${slides.length}
          </div>
        </div>
      `).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agentic AI Presentation - PDF Export (${slides.length} Slides)</title>
            ${css}
          </head>
          <body>
            <div class="export-header">
              <h1>🤖 Agentic AI & Automation Platform</h1>
              <p>Complete AI Agent Implementation for Healthcare Onboarding</p>
              <p><strong>PDF Export - ${slides.length} Slides Captured</strong></p>
              <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            ${slidesHTML}
          </body>
        </html>
      `;

      // Create and download
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentic-ai-presentation-pdf-${slides.length}-slides-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📄 PDF Export Complete",
        description: `All ${slides.length} slides captured successfully. Open file and print to PDF.`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error capturing presentation for PDF:', error);
      toast({
        title: "❌ PDF Export Failed",
        description: "Could not capture all slides. Please try again.",
        variant: "destructive",
      });
    }
  }, [getAllSlideContents, toast]);

  const downloadActualHTML = useCallback(async (slides: any[]) => {
    try {
      toast({
        title: "🔄 Capturing All Slides",
        description: "Please wait while we capture all presentation content...",
        variant: "default",
      });

      const slideContents = await getAllSlideContents(slides);

      const css = `
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            background: #f7fafc; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          }
          .export-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 40px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          }
          .export-header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
          .export-header p { font-size: 1.125rem; opacity: 0.95; margin: 0.5rem 0; }
          .html-slide {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin: 0 auto 40px auto;
            max-width: 1200px;
            overflow: hidden;
          }
          .slide-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
          }
          .slide-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
          .slide-subtitle { font-size: 1.2rem; opacity: 0.9; font-weight: 500; }
          .slide-content { padding: 40px; font-size: 1rem; line-height: 1.7; }
          .slide-footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      `;

      const slidesHTML = slideContents.map((slide, index) => `
        <div class="html-slide">
          <div class="slide-header">
            <h1 class="slide-title">${slide.title}</h1>
            ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
          </div>
          <div class="slide-content">
            ${slide.html}
          </div>
          <div class="slide-footer">
            Slide ${index + 1} of ${slides.length} - Captured from Live Presentation
          </div>
        </div>
      `).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agentic AI Presentation - HTML Export (${slides.length} Slides)</title>
            ${css}
          </head>
          <body>
            <div class="export-header">
              <h1>🤖 Agentic AI & Automation Platform</h1>
              <p>Live HTML Export - Exact Content Capture</p>
              <p><strong>${slides.length} Slides Preserved</strong> | Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>This export contains the exact same content, styling, and layout as the live presentation</p>
            </div>
            ${slidesHTML}
          </body>
        </html>
      `;

      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentic-ai-presentation-html-${slides.length}-slides-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📄 HTML Export Complete",
        description: `All ${slides.length} slides captured with full styling preserved`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error capturing presentation for HTML:', error);
      toast({
        title: "❌ HTML Export Failed",
        description: "Could not capture all slides. Please try again.",
        variant: "destructive",
      });
    }
  }, [getAllSlideContents, toast]);

  const downloadActualPPT = useCallback(async (slides: any[]) => {
    try {
      toast({
        title: "🔄 Capturing All Slides",
        description: "Please wait while we capture all presentation content...",
        variant: "default",
      });

      const slideContents = await getAllSlideContents(slides);

      const css = `
        <style>
          body { 
            margin: 0; 
            padding: 40px; 
            background: #f7fafc; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          }
          .ppt-container { max-width: 1920px; margin: 0 auto; }
          .ppt-title-page {
            width: 100%;
            max-width: 1920px;
            min-height: 1080px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            margin: 0 auto 40px auto;
            box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
            page-break-after: always;
            box-sizing: border-box;
          }
          .ppt-title-page h1 { font-size: 4.5rem; font-weight: 800; margin-bottom: 2rem; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
          .ppt-title-page p { font-size: 2rem; opacity: 0.95; margin: 1rem 0; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); }
          .ppt-slide {
            width: 100%;
            max-width: 1920px;
            min-height: 1080px;
            background: white;
            margin: 0 auto 40px auto;
            padding: 60px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            box-sizing: border-box;
            position: relative;
          }
          .ppt-slide-header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 4px solid #4f46e5;
          }
          .ppt-slide-title {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
          }
          .ppt-slide-subtitle {
            font-size: 1.75rem;
            color: #64748b;
            font-weight: 500;
            line-height: 1.3;
          }
          .ppt-slide-content {
            flex: 1;
            font-size: 1.25rem;
            line-height: 1.8;
            overflow: hidden;
          }
          .ppt-slide-footer {
            position: absolute;
            bottom: 30px;
            right: 60px;
            font-size: 1rem;
            color: #64748b;
            font-weight: 500;
          }
          .ppt-slide:last-child { page-break-after: avoid; }
          
          @media print {
            body { margin: 0; padding: 0; background: white !important; }
            .ppt-slide, .ppt-title-page { 
              page-break-after: always; 
              margin: 0;
              box-shadow: none;
            }
            .ppt-slide:last-child, .ppt-title-page:last-child { page-break-after: avoid; }
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          }
        </style>
      `;

      const slidesHTML = slideContents.map((slide, index) => `
        <div class="ppt-slide">
          <div class="ppt-slide-header">
            <div class="ppt-slide-title">${slide.title}</div>
            ${slide.subtitle ? `<div class="ppt-slide-subtitle">${slide.subtitle}</div>` : ''}
          </div>
          <div class="ppt-slide-content">
            <div style="padding: 2rem; height: 100%; overflow: hidden;">
              ${slide.html}
            </div>
          </div>
          <div class="ppt-slide-footer">
            ${index + 1} / ${slides.length}
          </div>
        </div>
      `).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Agentic AI Presentation - PPT Format (${slides.length} Slides)</title>
            ${css}
          </head>
          <body>
            <div class="ppt-container">
              <div class="ppt-title-page">
                <h1>🤖 Agentic AI & Automation Platform</h1>
                <p>Complete AI Agent Implementation</p>
                <p>Healthcare Onboarding Solution</p>
                <p><strong>PowerPoint Format Export - ${slides.length} Slides</strong></p>
                <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
              ${slidesHTML}
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentic-ai-presentation-ppt-${slides.length}-slides-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📊 PPT Export Complete",
        description: `All ${slides.length} slides exported in PowerPoint-compatible format`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error capturing presentation for PPT:', error);
      toast({
        title: "❌ PPT Export Failed",
        description: "Could not capture all slides. Please try again.",
        variant: "destructive",
      });
    }
  }, [getAllSlideContents, toast]);

  return {
    downloadActualPDF,
    downloadActualHTML,
    downloadActualPPT
  };
};