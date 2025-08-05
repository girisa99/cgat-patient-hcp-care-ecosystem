import { useCallback } from 'react';
import { useToast } from './use-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const usePresentationDownloader = () => {
  const { toast } = useToast();

  const captureSlideAsImage = useCallback(async (slideElement: HTMLElement): Promise<string> => {
    const canvas = await html2canvas(slideElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      width: 1920,
      height: 1080,
      useCORS: true,
      logging: false,
      removeContainer: true
    });
    return canvas.toDataURL('image/png', 0.95);
  }, []);

  const downloadHTML = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      toast({
        title: "🔄 Generating HTML Export",
        description: "Capturing all slides...",
        variant: "default",
      });

      const originalSlide = document.querySelector('[data-current-slide]')?.getAttribute('data-current-slide') || '0';
      const slideData: { title: string; subtitle?: string; imageData: string }[] = [];

      for (let i = 0; i < slides.length; i++) {
        navigationCallback(i);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const slideContainer = document.querySelector('[data-slide-content]') as HTMLElement;
        if (slideContainer) {
          const imageData = await captureSlideAsImage(slideContainer);
          slideData.push({
            title: slides[i].title,
            subtitle: slides[i].subtitle,
            imageData
          });
        }
      }

      // Return to original slide
      navigationCallback(parseInt(originalSlide));

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Treatment Center AI Implementation Guide - HTML Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f8fafc;
            color: #1e293b;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            padding: 60px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 16px;
            margin-bottom: 40px;
            box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
        }
        .header h1 {
            font-size: 3rem;
            font-weight: 800;
            margin: 0 0 20px 0;
        }
        .header p {
            font-size: 1.25rem;
            margin: 10px 0;
            opacity: 0.95;
        }
        .slide {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 40px;
            overflow: hidden;
        }
        .slide-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .slide-title {
            font-size: 2rem;
            font-weight: 800;
            margin: 0 0 10px 0;
        }
        .slide-subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin: 0;
        }
        .slide-content {
            padding: 40px;
            text-align: center;
        }
        .slide-image {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .slide-footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Treatment Center AI Implementation Guide</h1>
            <p>Complete ${slides.length}-Slide Implementation Guide</p>
            <p><strong>HTML Export</strong> - Generated on ${new Date().toLocaleDateString()}</p>
            <p>Comprehensive Agentic AI Platform for Healthcare Onboarding</p>
        </div>
        
        ${slideData.map((slide, index) => `
        <div class="slide">
            <div class="slide-header">
                <h2 class="slide-title">${slide.title}</h2>
                ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
            </div>
            <div class="slide-content">
                <img src="${slide.imageData}" alt="Slide ${index + 1}" class="slide-image" />
            </div>
            <div class="slide-footer">
                Slide ${index + 1} of ${slides.length}
            </div>
        </div>
        `).join('')}
    </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment-center-ai-guide-${slides.length}-slides.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📄 HTML Export Complete",
        description: `${slides.length} slides exported successfully`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error generating HTML:', error);
      toast({
        title: "❌ HTML Export Failed",
        description: "Could not generate HTML export",
        variant: "destructive",
      });
    }
  }, [captureSlideAsImage, toast]);

  const downloadPDF = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      toast({
        title: "🔄 Generating PDF",
        description: "Capturing all slides as high-quality images...",
        variant: "default",
      });

      const originalSlide = document.querySelector('[data-current-slide]')?.getAttribute('data-current-slide') || '0';
      const slideImages: string[] = [];

      for (let i = 0; i < slides.length; i++) {
        navigationCallback(i);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const slideContainer = document.querySelector('[data-slide-content]') as HTMLElement;
        if (slideContainer) {
          const imageData = await captureSlideAsImage(slideContainer);
          slideImages.push(imageData);
        }
      }

      // Return to original slide
      navigationCallback(parseInt(originalSlide));

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080]
      });

      // Add title page
      pdf.setFillColor(102, 126, 234);
      pdf.rect(0, 0, 1920, 1080, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(80);
      pdf.text('🏥 Treatment Center AI', 960, 400, { align: 'center' });
      pdf.text('Implementation Guide', 960, 500, { align: 'center' });
      
      pdf.setFontSize(40);
      pdf.text(`Complete ${slides.length}-Slide Guide`, 960, 600, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 960, 700, { align: 'center' });

      // Add slide images
      slideImages.forEach((imageData, index) => {
        pdf.addPage([1920, 1080], 'landscape');
        pdf.addImage(imageData, 'PNG', 0, 0, 1920, 1080);
      });

      pdf.save(`treatment-center-ai-guide-${slides.length}-slides.pdf`);

      toast({
        title: "📄 PDF Generated Successfully",
        description: `${slides.length} slides saved as PDF`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "❌ PDF Generation Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [captureSlideAsImage, toast]);

  const downloadPPT = useCallback(async (slides: any[], navigationCallback: (index: number) => void) => {
    try {
      toast({
        title: "🔄 Generating PowerPoint",
        description: "Creating presentation file...",
        variant: "default",
      });

      const originalSlide = document.querySelector('[data-current-slide]')?.getAttribute('data-current-slide') || '0';
      const slideData: { title: string; subtitle?: string; imageData: string }[] = [];

      for (let i = 0; i < slides.length; i++) {
        navigationCallback(i);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const slideContainer = document.querySelector('[data-slide-content]') as HTMLElement;
        if (slideContainer) {
          const imageData = await captureSlideAsImage(slideContainer);
          slideData.push({
            title: slides[i].title,
            subtitle: slides[i].subtitle,
            imageData
          });
        }
      }

      // Return to original slide
      navigationCallback(parseInt(originalSlide));

      // Create PowerPoint-formatted HTML that will work with PowerPoint import
      const pptHTML = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
    <meta charset="utf-8">
    <title>Treatment Center AI Implementation Guide - PowerPoint Export</title>
    <style>
        @page {
            size: 10in 7.5in;
            margin: 0;
        }
        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
        }
        .slide {
            width: 10in;
            height: 7.5in;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            background: white;
            border: 1px solid #ddd;
        }
        .slide:last-child {
            page-break-after: avoid;
        }
        .slide-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 40px;
            text-align: center;
            min-height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .slide-title {
            font-size: 36px;
            font-weight: bold;
            margin: 0 0 10px 0;
        }
        .slide-subtitle {
            font-size: 24px;
            margin: 0;
            opacity: 0.9;
        }
        .slide-content {
            flex: 1;
            padding: 40px;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .slide-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .title-slide {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .title-slide h1 {
            font-size: 72px;
            font-weight: bold;
            margin: 0 0 30px 0;
        }
        .title-slide p {
            font-size: 36px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="slide title-slide">
        <div>
            <h1>🏥 Treatment Center AI<br>Implementation Guide</h1>
            <p>Complete ${slides.length}-Slide Guide</p>
            <p>Agentic AI Platform for Healthcare</p>
            <p style="font-size: 24px;">Generated: ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
    
    ${slideData.map((slide, index) => `
    <div class="slide">
        <div class="slide-header">
            <h2 class="slide-title">${slide.title}</h2>
            ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
        </div>
        <div class="slide-content">
            <img src="${slide.imageData}" alt="Slide ${index + 1}" class="slide-image" />
        </div>
    </div>
    `).join('')}
</body>
</html>`;

      const blob = new Blob([pptHTML], { type: 'application/vnd.ms-powerpoint' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment-center-ai-guide-${slides.length}-slides.ppt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "📊 PowerPoint Export Complete",
        description: `${slides.length} slides exported as PowerPoint`,
        variant: "default",
      });

    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      toast({
        title: "❌ PowerPoint Export Failed",
        description: "Could not generate PowerPoint export",
        variant: "destructive",
      });
    }
  }, [captureSlideAsImage, toast]);

  return {
    downloadHTML,
    downloadPDF,
    downloadPPT
  };
};