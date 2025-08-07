/**
 * Simple Direct Presentation Capture Hook
 * Directly captures the currently visible slide without navigation complexity
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

export const useSimplePresentationCapture = () => {
  const { toast } = useToast();

  const captureCurrentSlide = useCallback(async (): Promise<string> => {
    console.log('🎯 Capturing current visible slide...');
    
    try {
      // Find the current slide content
      const slideContent = document.querySelector('[data-slide-content]') as HTMLElement;
      
      if (!slideContent) {
        console.error('❌ No slide content found');
        return '';
      }

      console.log('✅ Found slide content');
      console.log('📏 Content dimensions:', slideContent.offsetWidth, 'x', slideContent.offsetHeight);
      
      // Wait a moment for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture the slide content directly with html2canvas
      const canvas = await html2canvas(slideContent, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        width: slideContent.offsetWidth || 1200,
        height: slideContent.offsetHeight || 800,
        logging: true,
        removeContainer: false,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          console.log('🔄 Processing clone for capture...');
          
          // Make sure all elements are visible in the clone
          const elements = clonedDoc.querySelectorAll('*') as NodeListOf<HTMLElement>;
          elements.forEach((el) => {
            // Force visibility
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            
            // Stop animations and show final state
            el.style.animation = 'none';
            el.style.transition = 'none';
            
            // For fade-in animations, ensure they're in visible state
            if (el.classList.contains('animate-fade-in')) {
              el.style.transform = 'translateY(0)';
              el.style.opacity = '1';
            }
            
            // For slide animations, reset position
            if (el.classList.contains('animate-slide-in-right')) {
              el.style.transform = 'translateX(0)';
            }
            
            // For scale animations, ensure normal scale
            if (el.classList.contains('animate-scale-in')) {
              el.style.transform = 'scale(1)';
              el.style.opacity = '1';
            }
          });
        }
      });

      if (canvas.width > 0 && canvas.height > 0) {
        const imageData = canvas.toDataURL('image/png', 0.95);
        console.log(`✅ Successfully captured current slide:`, {
          width: canvas.width,
          height: canvas.height,
          dataLength: imageData.length
        });
        return imageData;
      } else {
        console.error(`❌ Invalid canvas generated`);
        return '';
      }

    } catch (error) {
      console.error(`💥 Error capturing current slide:`, error);
      return '';
    }
  }, []);

  const captureAllSlides = useCallback(async (slides: Slide[]): Promise<string[]> => {
    console.log('🎯 Starting capture of all slides by navigating through them...');
    const results: string[] = [];
    
    // Get references to navigation
    const slideIndicators = document.querySelectorAll('button[title*="Slide"]');
    const currentSlideElement = document.querySelector('[data-slide-id]');
    const originalSlideIndex = currentSlideElement ? 
      parseInt(currentSlideElement.getAttribute('data-slide-id') || '0') : 0;

    console.log(`📍 Starting from slide ${originalSlideIndex + 1}`);
    console.log(`🎯 Found ${slideIndicators.length} slide indicators`);

    for (let i = 0; i < slides.length; i++) {
      toast({
        title: "📸 Capturing Slides",
        description: `Capturing slide ${i + 1} of ${slides.length}...`,
        variant: "default",
      });

      // Navigate to the slide
      if (slideIndicators[i]) {
        console.log(`👆 Clicking to slide ${i + 1}`);
        (slideIndicators[i] as HTMLElement).click();
        
        // Wait for slide change animation to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Capture the now-visible slide
      const capturedSlide = await captureCurrentSlide();
      results.push(capturedSlide);
      
      console.log(`${capturedSlide ? '✅' : '❌'} Slide ${i + 1} capture result: ${capturedSlide ? 'Success' : 'Failed'}`);
      
      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Restore original slide
    try {
      if (slideIndicators[originalSlideIndex]) {
        console.log(`🔄 Restoring to original slide ${originalSlideIndex + 1}`);
        (slideIndicators[originalSlideIndex] as HTMLElement).click();
      }
    } catch (error) {
      console.error('Error restoring slide:', error);
    }

    const successCount = results.filter(r => r !== '').length;
    console.log(`🏁 Capture complete: ${successCount}/${slides.length} slides captured successfully`);
    
    return results;
  }, [captureCurrentSlide, toast]);

  const downloadHTML = useCallback(async (slides: Slide[]) => {
    try {
      toast({
        title: "🔄 Exporting Presentation",
        description: "Capturing all slides...",
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
                   <img src="${imageData}" alt="Slide ${index + 1}: ${slide.title}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
                 </div>` : 
                `<div class="slide-placeholder">
                   <h3>❌ Slide ${index + 1}: ${slide.title}</h3>
                   <p>Content could not be captured</p>
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
            <title>Agentic AI Presentation - Complete Export</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 20px; background: #f8fafc; color: #1e293b;
              }
              .presentation-container {
                max-width: 1200px; margin: 0 auto; background: white;
                border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;
              }
              .slide {
                padding: 48px; min-height: 80vh; page-break-after: always;
                position: relative; background: white; border-bottom: 1px solid #e2e8f0;
              }
              .slide:last-child { page-break-after: avoid; border-bottom: none; }
              .slide-number {
                position: absolute; top: 24px; right: 32px;
                background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white;
                padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;
              }
              .slide-title {
                font-size: 32px; font-weight: 800; color: #1e293b; margin-bottom: 12px;
                text-align: center; background: linear-gradient(135deg, #4f46e5, #7c3aed);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
              }
              .slide-subtitle {
                font-size: 18px; color: #64748b; text-align: center;
                margin-bottom: 32px; font-weight: 500;
              }
              .slide-content { margin-top: 24px; text-align: center; }
              .slide-image-container { text-align: center; margin: 20px 0; }
              .slide-placeholder {
                padding: 40px; background: #fee2e2; border-radius: 12px;
                border: 2px solid #fecaca; text-align: center; color: #991b1b;
              }
              @media print {
                body { background: white !important; }
                .slide { box-shadow: none !important; margin: 0 !important; }
              }
            </style>
          </head>
          <body>
            <div class="presentation-container">
              <div class="presentation-header" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 40px; text-align: center;">
                <h1 style="font-size: 42px; margin: 0 0 16px 0;">🤖 Agentic AI Implementation</h1>
                <p style="font-size: 18px; margin: 0; opacity: 0.9;">Complete Healthcare Automation Platform</p>
                <p style="font-size: 14px; margin: 16px 0 0 0; opacity: 0.8;">
                  ${slides.length} slides • Generated ${new Date().toLocaleDateString()} • Captured with simplified method
                </p>
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
      a.download = `agentic-ai-presentation-simple-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const successCount = capturedImages.filter(img => img !== '').length;
      toast({
        title: successCount > 0 ? "✅ Export Complete" : "❌ Export Failed",
        description: `Downloaded with ${successCount}/${slides.length} slides captured`,
        variant: successCount > 0 ? "default" : "destructive",
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
    await downloadHTML(slides);
  }, [downloadHTML]);

  return {
    downloadHTML,
    downloadPDF,
    captureAllSlides,
    captureCurrentSlide
  };
};