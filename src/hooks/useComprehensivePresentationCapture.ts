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
    console.log('🎯 Starting captureAllSlides with', slides.length, 'slides');
    const capturedSlides: string[] = [];
    
    // First, let's try a much simpler approach - just capture what's currently visible
    console.log('🔍 Looking for slide elements...');
    
    // Check if we can find the presentation container
    const presentationContainer = document.querySelector('[data-slide-content]');
    console.log('📍 Presentation container found:', !!presentationContainer);
    
    if (!presentationContainer) {
      console.error('❌ No presentation container found');
      return slides.map(() => ''); // Return empty array
    }

    // Store the current slide to restore later
    const currentSlideElement = document.querySelector('[data-slide-id]');
    const currentSlideIndex = currentSlideElement ? 
      parseInt(currentSlideElement.getAttribute('data-slide-id') || '0') : 0;
    console.log('📌 Current slide index:', currentSlideIndex);

    for (let i = 0; i < slides.length; i++) {
      try {
        console.log(`\n🎬 Processing slide ${i + 1}/${slides.length}`);
        
        // Navigate to the slide using button clicks
        const slideIndicators = document.querySelectorAll('button[title*="Slide"]');
        console.log('🔘 Found slide indicators:', slideIndicators.length);
        
        if (slideIndicators[i]) {
          console.log(`👆 Clicking slide indicator ${i + 1}`);
          (slideIndicators[i] as HTMLElement).click();
          
          // Wait for slide transition
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify we're on the right slide
          const currentSlideAfterClick = document.querySelector('[data-slide-id]');
          const newSlideIndex = currentSlideAfterClick ? 
            parseInt(currentSlideAfterClick.getAttribute('data-slide-id') || '0') : -1;
          console.log(`✅ After click, slide index is:`, newSlideIndex);
        } else {
          console.warn(`⚠️ No slide indicator found for slide ${i + 1}`);
        }

        // Find the current slide content
        const slideContentElement = document.querySelector('[data-slide-content]') as HTMLElement;
        if (!slideContentElement) {
          console.error(`❌ No slide content element found for slide ${i + 1}`);
          capturedSlides.push('');
          continue;
        }

        console.log(`📏 Slide content dimensions:`, {
          width: slideContentElement.offsetWidth,
          height: slideContentElement.offsetHeight,
          scrollWidth: slideContentElement.scrollWidth,
          scrollHeight: slideContentElement.scrollHeight
        });

        // Try to capture the slide content directly (simpler approach)
        console.log(`📸 Attempting to capture slide ${i + 1}...`);
        
        const canvas = await html2canvas(slideContentElement, {
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          scale: 1,
          width: 1200,
          height: 800,
          logging: true, // Enable html2canvas logging
          removeContainer: false,
          foreignObjectRendering: true
        });
        
        console.log(`🎨 Canvas created:`, {
          width: canvas.width,
          height: canvas.height,
          hasData: canvas.width > 0 && canvas.height > 0
        });
        
        if (canvas.width > 0 && canvas.height > 0) {
          const imageData = canvas.toDataURL('image/png', 0.9);
          const isValidImage = imageData.length > 1000; // Basic validation
          console.log(`✅ Image data generated for slide ${i + 1}:`, {
            length: imageData.length,
            isValid: isValidImage,
            preview: imageData.substring(0, 50) + '...'
          });
          capturedSlides.push(imageData);
        } else {
          console.error(`❌ Invalid canvas for slide ${i + 1}`);
          capturedSlides.push('');
        }
        
      } catch (error) {
        console.error(`💥 Error capturing slide ${i + 1}:`, error);
        capturedSlides.push('');
      }
    }

    // Restore original slide
    try {
      const slideIndicators = document.querySelectorAll('button[title*="Slide"]');
      if (slideIndicators[currentSlideIndex]) {
        console.log(`🔙 Restoring to slide ${currentSlideIndex + 1}`);
        (slideIndicators[currentSlideIndex] as HTMLElement).click();
      }
    } catch (error) {
      console.error('❌ Error restoring original slide:', error);
    }

    const successCount = capturedSlides.filter(slide => slide !== '').length;
    console.log(`🏁 Capture complete: ${successCount}/${slides.length} slides captured successfully`);
    
    return capturedSlides;
  }, []);

  const downloadHTML = useCallback(async (slides: Slide[]) => {
    try {
      console.log('Starting HTML export for', slides.length, 'slides');
      
      toast({
        title: "🔄 Capturing All Slides",
        description: "Please wait while we capture all slides...",
        variant: "default",
      });

      const capturedImages = await captureAllSlides(slides);
      console.log('Captured images:', capturedImages.length, 'successful captures:', capturedImages.filter(img => img !== '').length);

      // Ensure we have some content even if capture fails
      const slidesHTML = slides.map((slide, index) => {
        const imageData = capturedImages[index];
        console.log(`Slide ${index + 1}: ${imageData ? 'captured' : 'using fallback'}`);
        
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
                   <h3>Slide ${index + 1}: ${slide.title}</h3>
                   ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ''}
                   <p style="margin-top: 20px; color: #64748b;">
                     Visual content could not be captured. This slide contains interactive elements and comprehensive content.
                   </p>
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
              
              .slide-placeholder h3 {
                color: #1e293b;
                margin-bottom: 16px;
                font-size: 24px;
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
                  ${slides.length} slides • Generated ${new Date().toLocaleDateString()} • Complete presentation export
                </p>
              </div>
              ${slidesHTML}
              <div class="presentation-footer" style="background: #f8fafc; padding: 40px; text-align: center; border-top: 2px solid #e2e8f0;">
                <h3 style="color: #1e293b; margin: 0 0 16px 0;">📋 Export Complete</h3>
                <p style="color: #64748b; margin: 0;">All ${slides.length} slides have been exported with ${capturedImages.filter(img => img !== '').length} visual captures.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      console.log('Creating download blob...');
      const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentic-ai-presentation-${slides.length}-slides-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Download triggered successfully');
      toast({
        title: "✅ Export Complete",
        description: `Downloaded ${slides.length} slides with ${capturedImages.filter(img => img !== '').length} visual captures`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error in HTML export:', error);
      toast({
        title: "❌ Export Failed",
        description: `Error: ${error.message}`,
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