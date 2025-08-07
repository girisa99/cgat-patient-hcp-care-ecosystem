/**
 * Debug Presentation Capture Hook
 * Minimal version to identify exactly what's going wrong
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

export const useDebugPresentationCapture = () => {
  const { toast } = useToast();

  const debugCurrentSlide = useCallback(async (): Promise<void> => {
    console.log('🔍=== DEBUGGING CURRENT SLIDE ===');
    
    // Step 1: Check if slide content exists
    const slideContent = document.querySelector('[data-slide-content]') as HTMLElement;
    console.log('1️⃣ Slide content element:', slideContent);
    
    if (!slideContent) {
      console.error('❌ No [data-slide-content] element found!');
      console.log('🔍 Available elements with data attributes:');
      document.querySelectorAll('[data-*]').forEach((el, i) => {
        console.log(`  ${i}: ${el.tagName} with data attributes:`, Array.from(el.attributes).filter(attr => attr.name.startsWith('data-')));
      });
      return;
    }
    
    // Step 2: Log slide dimensions and visibility
    console.log('2️⃣ Slide dimensions:', {
      width: slideContent.offsetWidth,
      height: slideContent.offsetHeight,
      clientWidth: slideContent.clientWidth,
      clientHeight: slideContent.clientHeight,
      scrollWidth: slideContent.scrollWidth,
      scrollHeight: slideContent.scrollHeight
    });
    
    // Step 3: Check visibility styles
    const computedStyle = window.getComputedStyle(slideContent);
    console.log('3️⃣ Slide computed styles:', {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      position: computedStyle.position,
      zIndex: computedStyle.zIndex
    });
    
    // Step 4: Check content inside
    console.log('4️⃣ Slide inner HTML length:', slideContent.innerHTML.length);
    console.log('5️⃣ Slide text content (first 200 chars):', slideContent.textContent?.substring(0, 200));
    
    // Step 5: Count children and their visibility
    const children = slideContent.querySelectorAll('*');
    console.log('6️⃣ Total child elements:', children.length);
    
    let visibleChildren = 0;
    let hiddenChildren = 0;
    children.forEach((child) => {
      const childStyle = window.getComputedStyle(child);
      if (childStyle.display !== 'none' && childStyle.visibility !== 'hidden' && parseFloat(childStyle.opacity) > 0) {
        visibleChildren++;
      } else {
        hiddenChildren++;
      }
    });
    
    console.log('7️⃣ Child visibility stats:', { visibleChildren, hiddenChildren });
    
    // Step 6: Find specific content elements
    const cards = slideContent.querySelectorAll('.card, [class*="card"]');
    const badges = slideContent.querySelectorAll('.badge, [class*="badge"]');
    const headings = slideContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    console.log('8️⃣ Content elements found:', {
      cards: cards.length,
      badges: badges.length,
      headings: headings.length
    });
    
    // Step 7: Log first few headings
    headings.forEach((heading, i) => {
      if (i < 3) console.log(`  📝 Heading ${i + 1}: "${heading.textContent?.substring(0, 50)}"`);
    });
    
    // Step 8: Try a simple capture
    console.log('🔥 Attempting simple capture...');
    try {
      const canvas = await html2canvas(slideContent, {
        logging: true,
        width: slideContent.offsetWidth || 1200,
        height: slideContent.offsetHeight || 800,
        backgroundColor: '#ffffff',
        scale: 1  // Lower scale for debugging
      });
      
      console.log('✅ Canvas created:', {
        width: canvas.width,
        height: canvas.height
      });
      
      const imageData = canvas.toDataURL('image/png');
      console.log('📊 Image data length:', imageData.length);
      
      // Check if it's a blank white image
      if (imageData.length < 5000) {
        console.warn('⚠️  Image seems very small, likely blank!');
        console.log('🖼️  Image data preview:', imageData.substring(0, 100));
      } else {
        console.log('🎉 Image data looks substantial');
        
        // Create a temporary link to see the image
        const link = document.createElement('a');
        link.download = 'debug-slide-capture.png';
        link.href = imageData;
        link.textContent = 'Download Debug Image';
        link.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 10000; background: red; color: white; padding: 10px;';
        document.body.appendChild(link);
        
        setTimeout(() => {
          document.body.removeChild(link);
        }, 10000);
      }
      
    } catch (error) {
      console.error('💥 Capture failed:', error);
    }
    
    console.log('🔍=== DEBUG COMPLETE ===');
  }, []);

  const testCapture = useCallback(async (slides: Slide[]) => {
    console.log('🧪 Starting test capture process...');
    
    toast({
      title: "🧪 Debug Mode",
      description: "Running slide capture debug - check console",
      variant: "default",
    });
    
    await debugCurrentSlide();
    
    toast({
      title: "🔍 Debug Complete",
      description: "Check browser console for detailed logs",
      variant: "default",
    });
  }, [debugCurrentSlide, toast]);

  return {
    downloadHTML: testCapture,
    downloadPDF: testCapture,
    captureAllSlides: testCapture,
    debugCurrentSlide
  };
};