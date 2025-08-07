/**
 * Screen Capture Export - Captures Exactly What You See
 * Takes screenshots of the actual displayed slides for perfect fidelity
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
// @ts-ignore - PptxGenJS doesn't have perfect TypeScript support
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';

export const useScreenCaptureExport = () => {

  // Wait for animations and content to load
  const waitForContent = (ms: number = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Capture current slide as high-quality image with proper content handling
  const captureCurrentSlide = useCallback(async (): Promise<string> => {
    try {
      console.log('📸 Capturing current slide...');
      
      // Find the slide content element
      const slideElement = document.querySelector('[data-slide-content]') as HTMLElement;
      if (!slideElement) {
        throw new Error('Slide content not found');
      }

      // Wait for animations and content to settle
      await waitForContent(1500);

      // Get the actual content height (including scrollable content)
      const contentElement = slideElement.querySelector('.h-\\[calc\\(100\\%-120px\\)\\]') as HTMLElement;
      let actualHeight = slideElement.offsetHeight;
      
      if (contentElement) {
        // Calculate the full content height including scrolled content
        const contentScrollHeight = contentElement.scrollHeight;
        const headerHeight = 120; // Approximate header height
        actualHeight = Math.max(actualHeight, contentScrollHeight + headerHeight + 100);
      }

      console.log(`📏 Capturing dimensions: ${slideElement.offsetWidth}x${actualHeight} (original: ${slideElement.offsetHeight})`);

      // Temporarily expand element to capture all content
      const originalOverflow = slideElement.style.overflow;
      const originalHeight = slideElement.style.height;
      const contentOriginalOverflow = contentElement?.style.overflow || '';
      const contentOriginalHeight = contentElement?.style.height || '';
      
      slideElement.style.overflow = 'visible';
      slideElement.style.height = `${actualHeight}px`;
      if (contentElement) {
        contentElement.style.overflow = 'visible';
        contentElement.style.height = 'auto';
      }

      // Wait for layout to stabilize
      await waitForContent(500);

      // Capture with high quality settings
      const canvas = await html2canvas(slideElement, {
        scale: 2, // Good quality without being too large
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        width: slideElement.offsetWidth,
        height: actualHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        onclone: (clonedDoc) => {
          // Ensure cloned content is fully visible
          const clonedSlide = clonedDoc.querySelector('[data-slide-content]') as HTMLElement;
          if (clonedSlide) {
            clonedSlide.style.overflow = 'visible';
            clonedSlide.style.height = `${actualHeight}px`;
            const clonedContent = clonedSlide.querySelector('.h-\\[calc\\(100\\%-120px\\)\\]') as HTMLElement;
            if (clonedContent) {
              clonedContent.style.overflow = 'visible';
              clonedContent.style.height = 'auto';
            }
          }
        }
      });

      // Restore original styles
      slideElement.style.overflow = originalOverflow;
      slideElement.style.height = originalHeight;
      if (contentElement) {
        contentElement.style.overflow = contentOriginalOverflow;
        contentElement.style.height = contentOriginalHeight;
      }

      console.log(`✅ Slide captured: ${canvas.width}x${canvas.height}`);
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('❌ Failed to capture slide:', error);
      throw error;
    }
  }, []);

  // Navigate through all slides and capture each one
  const captureAllSlides = useCallback(async (): Promise<string[]> => {
    try {
      console.log('🎯 Starting capture of all slides...');
      
      const capturedSlides: string[] = [];
      const slideIndicators = document.querySelectorAll('[title^="Slide "]');
      const totalSlides = slideIndicators.length;
      
      console.log(`Found ${totalSlides} slides to capture`);
      
      for (let i = 0; i < totalSlides; i++) {
        console.log(`📸 Capturing slide ${i + 1}/${totalSlides}`);
        
        // Navigate to slide
        const slideIndicator = slideIndicators[i] as HTMLButtonElement;
        slideIndicator.click();
        
        // Wait for slide transition and content to load
        await waitForContent(2000);
        
        // Capture the slide
        const slideImage = await captureCurrentSlide();
        capturedSlides.push(slideImage);
        
        // Show progress
        toast.success(`Captured slide ${i + 1}/${totalSlides}`, { duration: 1000 });
      }
      
      console.log(`✅ Successfully captured ${capturedSlides.length} slides`);
      return capturedSlides;
      
    } catch (error) {
      console.error('❌ Failed to capture slides:', error);
      throw error;
    }
  }, [captureCurrentSlide]);

  // Generate PowerPoint with captured slide images
  const generatePowerPoint = useCallback(async () => {
    try {
      console.log('🎯 Generating PowerPoint from screen captures...');
      toast.success('Starting PowerPoint generation...', { duration: 2000 });
      
      const slideImages = await captureAllSlides();
      
      const pptx = new PptxGenJS();
      
      // Set presentation properties
      pptx.author = 'Treatment Center AI Implementation';
      pptx.company = 'Healthcare AI Solutions';
      pptx.title = 'Agentic AI Implementation for Treatment Centers';
      pptx.subject = 'AI Implementation Presentation';
      
      // Define slide layout (16:9 aspect ratio)
      pptx.defineLayout({ name: 'CUSTOM', width: 13.33, height: 7.5 });

      // Add title slide
      const titleSlide = pptx.addSlide();
      titleSlide.background = { fill: 'F8FAFC' };
      
      titleSlide.addText('Agentic AI Implementation for Treatment Centers', {
        x: 1, y: 2, w: 11.33, h: 1.5,
        fontSize: 32,
        bold: true,
        color: '1E293B',
        align: 'center'
      });
      
      titleSlide.addText('Comprehensive AI automation platform with proven results', {
        x: 1, y: 3.8, w: 11.33, h: 1,
        fontSize: 18,
        color: '64748B',
        align: 'center'
      });
      
      titleSlide.addText(`${new Date().toLocaleDateString()} • ${slideImages.length} Slides`, {
        x: 1, y: 6, w: 11.33, h: 0.5,
        fontSize: 12,
        color: '64748B',
        align: 'center'
      });

      // Add each captured slide as an image
      slideImages.forEach((slideImage, index) => {
        console.log(`🖼️ Adding slide ${index + 1} to PowerPoint`);
        
        const slide = pptx.addSlide();
        slide.background = { fill: 'FFFFFF' };
        
        // Add the captured slide image
        slide.addImage({
          data: slideImage,
          x: 0.5,
          y: 0.5,
          w: 12.33,
          h: 6.5,
          sizing: { type: 'contain', w: 12.33, h: 6.5 }
        });
        
        // Add slide number
        slide.addText(`${index + 1}`, {
          x: 12.5, y: 0.2, w: 0.5, h: 0.3,
          fontSize: 10,
          color: '64748B',
          align: 'center'
        });
      });

      // Generate and download
      const fileName = `agentic-ai-presentation-captured-${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName });
      
      toast.success(`✅ PowerPoint generated! ${slideImages.length} slides captured perfectly`);
      console.log('✅ PowerPoint generation completed with screen captures');
      
    } catch (error) {
      console.error('❌ PowerPoint generation failed:', error);
      toast.error('Failed to generate PowerPoint presentation');
    }
  }, [captureAllSlides]);

  // Generate PDF with captured slide images (one slide per page)
  const generatePDF = useCallback(async () => {
    try {
      console.log('🎯 Generating PDF from screen captures...');
      toast.success('Starting PDF generation...', { duration: 2000 });
      
      const slideImages = await captureAllSlides();
      
      // Create PDF with proper dimensions (letter size)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: 'letter'
      });
      
      // Add title page
      pdf.setFontSize(24);
      pdf.setTextColor(30, 41, 59); // #1e293b
      pdf.text('Agentic AI Implementation for Treatment Centers', 5.5, 3, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(100, 116, 139); // #64748b
      pdf.text('Comprehensive AI automation platform with proven results', 5.5, 4, { align: 'center' });
      pdf.text(`${new Date().toLocaleDateString()} • ${slideImages.length} Slides`, 5.5, 7, { align: 'center' });

      // Add each captured slide
      slideImages.forEach((slideImage, index) => {
        console.log(`📄 Adding slide ${index + 1} to PDF`);
        
        pdf.addPage();
        
        // Add the slide image (full page)
        pdf.addImage(
          slideImage,
          'PNG',
          0.5,    // x position
          0.5,    // y position  
          10,     // width (10 inches for landscape letter)
          7.5,    // height (7.5 inches for landscape letter)
          `slide-${index + 1}`,
          'FAST'
        );
        
        // Add slide number
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Slide ${index + 1} of ${slideImages.length}`, 10.5, 8.2);
      });

      // Download the PDF
      const fileName = `agentic-ai-presentation-captured-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success(`✅ PDF generated! ${slideImages.length} slides captured perfectly`);
      console.log('✅ PDF generation completed with screen captures');
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    }
  }, [captureAllSlides]);

  return {
    generatePowerPoint,
    generatePDF,
    captureAllSlides,
    captureCurrentSlide,
    // Backward compatibility
    downloadHTML: generatePDF,
    downloadPDF: generatePDF
  };
};