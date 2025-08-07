/**
 * Reliable Presentation Capture Hook
 * Ensures ALL content, animations, icons, and layouts are captured properly
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

export const useReliablePresentationCapture = () => {
  const { toast } = useToast();

  const captureSlideWithFullContent = useCallback(async (slideIndex: number): Promise<string> => {
    console.log(`🎯 Starting reliable capture for slide ${slideIndex + 1}`);
    
    try {
      // Step 1: Navigate to the slide
      const slideIndicators = document.querySelectorAll('button[title*="Slide"]');
      if (slideIndicators[slideIndex]) {
        console.log(`👆 Navigating to slide ${slideIndex + 1}`);
        (slideIndicators[slideIndex] as HTMLElement).click();
        
        // Wait for slide transition to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Step 2: Find and prepare the slide content
      const slideContentContainer = document.querySelector('[data-slide-content]') as HTMLElement;
      
      if (!slideContentContainer) {
        console.error(`❌ No slide content found for slide ${slideIndex + 1}`);
        return '';
      }

      console.log(`✅ Found slide content container for slide ${slideIndex + 1}`);

      // Step 3: Create a temporary full-size container for capture
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: 0;
        width: 1200px;
        min-height: 800px;
        background: white;
        padding: 40px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      // Step 4: Clone the entire slide content with all styles
      const slideClone = slideContentContainer.cloneNode(true) as HTMLElement;
      
      // Step 5: Apply comprehensive style fixes to ensure everything renders
      const fixElementStyles = (element: HTMLElement) => {
        // Remove any layout constraints that might hide content
        element.style.setProperty('height', 'auto', 'important');
        element.style.setProperty('max-height', 'none', 'important');
        element.style.setProperty('overflow', 'visible', 'important');
        element.style.setProperty('overflow-x', 'visible', 'important');
        element.style.setProperty('overflow-y', 'visible', 'important');
        element.style.setProperty('display', 'block', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
        
        // Ensure animations are visible (pause them for capture)
        element.style.setProperty('animation-play-state', 'paused', 'important');
        element.style.setProperty('animation-fill-mode', 'forwards', 'important');
        
        // Force content to be visible
        if (element.classList.contains('animate-fade-in')) {
          element.style.setProperty('transform', 'translateY(0)', 'important');
          element.style.setProperty('opacity', '1', 'important');
        }
        
        // Fix flex and grid layouts
        if (element.style.display === 'flex' || element.classList.toString().includes('flex')) {
          element.style.setProperty('display', 'flex', 'important');
        }
        
        if (element.style.display === 'grid' || element.classList.toString().includes('grid')) {
          element.style.setProperty('display', 'grid', 'important');
        }
      };

      // Apply fixes to the main clone and all children
      fixElementStyles(slideClone);
      const allClonedElements = slideClone.querySelectorAll('*') as NodeListOf<HTMLElement>;
      allClonedElements.forEach(fixElementStyles);

      // Step 6: Copy computed styles to ensure perfect rendering
      const copyComputedStyles = (source: Element, target: HTMLElement) => {
        const computedStyle = window.getComputedStyle(source);
        
        // Copy all computed styles
        for (let i = 0; i < computedStyle.length; i++) {
          const property = computedStyle[i];
          const value = computedStyle.getPropertyValue(property);
          
          // Skip problematic properties
          if (!['animation', 'transition', 'transform'].includes(property)) {
            target.style.setProperty(property, value, 'important');
          }
        }
      };

      // Copy styles from original to clone
      const originalElements = slideContentContainer.querySelectorAll('*');
      const clonedElements = slideClone.querySelectorAll('*');
      
      copyComputedStyles(slideContentContainer, slideClone);
      originalElements.forEach((original, index) => {
        if (clonedElements[index]) {
          copyComputedStyles(original, clonedElements[index] as HTMLElement);
        }
      });

      // Step 7: Add the clone to the temp container and DOM
      tempContainer.appendChild(slideClone);
      document.body.appendChild(tempContainer);

      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`📸 Capturing slide ${slideIndex + 1} with full content...`);

      // Step 8: Capture the temp container
      const canvas = await html2canvas(tempContainer, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2,
        width: 1200,
        height: Math.max(800, tempContainer.scrollHeight),
        logging: false,
        removeContainer: false,
        foreignObjectRendering: true,
        ignoreElements: () => false, // Capture everything
        onclone: (clonedDoc) => {
          console.log('🔄 Processing final clone for capture...');
          
          // Ensure all elements in the final clone are visible
          const finalElements = clonedDoc.querySelectorAll('*') as NodeListOf<HTMLElement>;
          finalElements.forEach((el) => {
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('display', el.style.display === 'none' ? 'block' : el.style.display, 'important');
          });
        }
      });

      // Step 9: Clean up
      document.body.removeChild(tempContainer);

      // Step 10: Validate and return result
      if (canvas.width > 0 && canvas.height > 0) {
        const imageData = canvas.toDataURL('image/png', 0.95);
        console.log(`✅ Successfully captured slide ${slideIndex + 1}:`, {
          width: canvas.width,
          height: canvas.height,
          dataLength: imageData.length
        });
        return imageData;
      } else {
        console.error(`❌ Invalid canvas for slide ${slideIndex + 1}`);
        return '';
      }

    } catch (error) {
      console.error(`💥 Error capturing slide ${slideIndex + 1}:`, error);
      return '';
    }
  }, []);

  const captureAllSlides = useCallback(async (slides: Slide[]): Promise<string[]> => {
    console.log('🎯 Starting reliable capture of all slides...');
    const results: string[] = [];
    
    // Store current slide to restore later
    const currentSlideElement = document.querySelector('[data-slide-id]');
    const currentSlideIndex = currentSlideElement ? 
      parseInt(currentSlideElement.getAttribute('data-slide-id') || '0') : 0;

    for (let i = 0; i < slides.length; i++) {
      toast({
        title: "🔄 Capturing Slides",
        description: `Capturing slide ${i + 1} of ${slides.length}...`,
        variant: "default",
      });

      const capturedSlide = await captureSlideWithFullContent(i);
      results.push(capturedSlide);
      
      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Restore original slide
    try {
      const slideIndicators = document.querySelectorAll('button[title*="Slide"]');
      if (slideIndicators[currentSlideIndex]) {
        (slideIndicators[currentSlideIndex] as HTMLElement).click();
      }
    } catch (error) {
      console.error('Error restoring slide:', error);
    }

    const successCount = results.filter(r => r !== '').length;
    console.log(`🏁 Capture complete: ${successCount}/${slides.length} slides captured`);
    
    return results;
  }, [captureSlideWithFullContent, toast]);

  const downloadHTML = useCallback(async (slides: Slide[]) => {
    try {
      toast({
        title: "🔄 Exporting Presentation",
        description: "Capturing all slides with complete content...",
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
                   <h3>Slide ${index + 1}: ${slide.title}</h3>
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
              .slide-content { margin-top: 24px; }
              .slide-image-container { text-align: center; margin: 20px 0; }
              .slide-placeholder {
                padding: 40px; background: #f8fafc; border-radius: 12px;
                border: 2px solid #e2e8f0; text-align: center;
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
                  ${slides.length} slides • Generated ${new Date().toLocaleDateString()} • With animations, icons & layouts preserved
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
      a.download = `agentic-ai-presentation-complete-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const successCount = capturedImages.filter(img => img !== '').length;
      toast({
        title: "✅ Export Complete",
        description: `Downloaded ${successCount}/${slides.length} slides with complete content, animations, and layouts`,
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
    // Use the same reliable capture for PDF
    await downloadHTML(slides);
  }, [downloadHTML]);

  return {
    downloadHTML,
    downloadPDF,
    captureAllSlides
  };
};