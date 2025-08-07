/**
 * Direct PPT and PDF Export - No HTML Conversion
 * Uses PptxGenJS for PowerPoint and html2pdf.js for PDF generation
 * Leverages DocuSign integration for professional PDF handling
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { presentationSlides } from '@/data/presentation-slides';
// @ts-ignore - PptxGenJS doesn't have perfect TypeScript support
import PptxGenJS from 'pptxgenjs';
// @ts-ignore - html2pdf.js doesn't have TypeScript definitions
import html2pdf from 'html2pdf.js';
import { createClient } from '@supabase/supabase-js';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

export const useDirectPresentationExport = () => {

  // Extract slide content as structured data for PPT generation
  const extractSlideData = useCallback((slide: Slide) => {
    // Convert React content to structured data points
    const extractTextContent = (element: any): string[] => {
      const texts: string[] = [];
      
      if (!element) return texts;
      
      if (typeof element === 'string' || typeof element === 'number') {
        texts.push(String(element));
        return texts;
      }
      
      if (typeof element === 'object' && element.props) {
        const { children } = element.props;
        
        if (Array.isArray(children)) {
          children.forEach(child => {
            texts.push(...extractTextContent(child));
          });
        } else if (children) {
          texts.push(...extractTextContent(children));
        }
      }
      
      if (Array.isArray(element)) {
        element.forEach(item => {
          texts.push(...extractTextContent(item));
        });
      }
      
      return texts;
    };

    // Get all text content and structure it
    const contentTexts = extractTextContent(slide.content);
    
    // Filter and structure the content
    const bulletPoints = contentTexts
      .filter(text => text.trim().length > 0)
      .filter(text => !text.includes('className') && !text.includes('style'))
      .slice(0, 10); // Limit to 10 bullet points per slide

    return {
      title: slide.title,
      subtitle: slide.subtitle || '',
      bulletPoints
    };
  }, []);

  // Generate PowerPoint presentation directly
  const generatePowerPoint = useCallback(async () => {
    try {
      console.log('🎯 Starting direct PowerPoint generation...');
      
      const pptx = new PptxGenJS();
      
      // Set presentation properties
      pptx.author = 'Treatment Center AI Implementation';
      pptx.company = 'Healthcare AI Solutions';
      pptx.title = 'Agentic AI Implementation for Treatment Centers';
      pptx.subject = 'AI Implementation Presentation';
      
      // Define slide master with consistent styling
      pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { fill: 'F8FAFC' },
        margin: [0.5, 0.25, 0.5, 0.25],
        objects: [
          {
            placeholder: {
              options: { name: 'title', type: 'title', x: 0.5, y: 0.7, w: 12, h: 1.5 },
              text: 'Title Placeholder'
            }
          },
          {
            placeholder: {
              options: { name: 'body', type: 'body', x: 0.5, y: 2.5, w: 12, h: 5.25 },
              text: 'Content Placeholder'
            }
          }
        ]
      });

      // Add title slide
      const titleSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      titleSlide.addText('Agentic AI Implementation for Treatment Centers', {
        x: 1, y: 2, w: 11, h: 2,
        fontSize: 44,
        bold: true,
        color: '1E293B',
        align: 'center',
        breakLine: true
      });
      
      titleSlide.addText('Comprehensive AI automation platform with proven results and real-world implementation', {
        x: 1, y: 4, w: 11, h: 1.5,
        fontSize: 20,
        color: '64748B',
        align: 'center'
      });

      // Add content slides
      presentationSlides.forEach((slide, index) => {
        console.log(`📄 Processing slide ${index + 1}: ${slide.title}`);
        
        const slideData = extractSlideData(slide);
        const contentSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
        
        // Add slide title
        contentSlide.addText(slideData.title, {
          x: 0.5, y: 0.5, w: 12, h: 1,
          fontSize: 32,
          bold: true,
          color: '2563EB',
          align: 'center'
        });
        
        // Add subtitle if exists
        if (slideData.subtitle) {
          contentSlide.addText(slideData.subtitle, {
            x: 0.5, y: 1.5, w: 12, h: 0.8,
            fontSize: 18,
            color: '64748B',
            align: 'center',
            italic: true
          });
        }
        
        // Add bullet points
        if (slideData.bulletPoints.length > 0) {
          const bulletText = slideData.bulletPoints
            .slice(0, 8)
            .map(point => `• ${point}`)
            .join('\n');
            
          contentSlide.addText(bulletText, {
            x: 1, y: slideData.subtitle ? 2.7 : 2.2, w: 11, h: 5,
            fontSize: 16,
            color: '1E293B',
            lineSpacing: 24,
            align: 'left'
          });
        }
        
        // Add slide number
        contentSlide.addText(`${index + 1} / ${presentationSlides.length}`, {
          x: 11, y: 7, w: 2, h: 0.3,
          fontSize: 12,
          color: '64748B',
          align: 'right'
        });
      });

      // Generate and download PowerPoint
      const fileName = `agentic-ai-presentation-${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName });
      
      toast.success(`PowerPoint generated successfully! Downloaded: ${fileName}`);
      console.log('✅ PowerPoint generation completed');
      
    } catch (error) {
      console.error('❌ PowerPoint generation failed:', error);
      toast.error('Failed to generate PowerPoint presentation');
    }
  }, [extractSlideData]);

  // Generate PDF using html2pdf.js (better than React conversion)
  const generatePDF = useCallback(async () => {
    try {
      console.log('🎯 Starting direct PDF generation...');
      
      // Create a clean HTML representation of slides
      const slidesHTML = presentationSlides.map((slide, index) => {
        const slideData = extractSlideData(slide);
        
        return `
          <div class="slide-page" style="
            page-break-after: always;
            padding: 40px;
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="
                background: #2563eb;
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                display: inline-block;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 20px;
              ">
                Slide ${index + 1} of ${presentationSlides.length}
              </div>
              
              <h1 style="
                font-size: 2.5rem;
                font-weight: bold;
                color: #1e293b;
                margin: 20px 0;
                line-height: 1.2;
              ">
                ${slideData.title}
              </h1>
              
              ${slideData.subtitle ? `
                <p style="
                  font-size: 1.25rem;
                  color: #64748b;
                  margin-bottom: 30px;
                  max-width: 800px;
                  margin-left: auto;
                  margin-right: auto;
                ">
                  ${slideData.subtitle}
                </p>
              ` : ''}
            </div>
            
            <div style="
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 1000px;
              margin: 0 auto;
            ">
              ${slideData.bulletPoints.length > 0 ? `
                <ul style="
                  list-style: none;
                  padding: 0;
                  margin: 0;
                  line-height: 1.8;
                ">
                  ${slideData.bulletPoints.slice(0, 10).map(point => `
                    <li style="
                      margin-bottom: 12px;
                      padding-left: 20px;
                      position: relative;
                      font-size: 16px;
                      color: #1e293b;
                    ">
                      <span style="
                        position: absolute;
                        left: 0;
                        color: #2563eb;
                        font-weight: bold;
                      ">•</span>
                      ${point}
                    </li>
                  `).join('')}
                </ul>
              ` : '<p style="color: #64748b; font-style: italic;">Content structure optimized for presentation format</p>'}
            </div>
          </div>
        `;
      }).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Agentic AI Implementation Presentation</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .slide-page { page-break-after: always; }
            @media print {
              .slide-page { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${slidesHTML}
        </body>
        </html>
      `;

      // Generate PDF with high quality settings
      const element = document.createElement('div');
      element.innerHTML = fullHTML;
      
      const opt = {
        margin: 0.5,
        filename: `agentic-ai-presentation-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true 
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast.success('PDF generated successfully with professional formatting!');
      console.log('✅ PDF generation completed');
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    }
  }, [extractSlideData]);

  // Generate PDF using DocuSign integration for enterprise-grade output
  const generateDocuSignPDF = useCallback(async () => {
    try {
      console.log('🎯 Starting DocuSign PDF generation...');
      
      // Create structured presentation data for DocuSign
      const presentationData = {
        title: 'Agentic AI Implementation for Treatment Centers',
        subtitle: 'Comprehensive AI automation platform with proven results',
        slides: presentationSlides.map((slide, index) => ({
          slideNumber: index + 1,
          ...extractSlideData(slide)
        })),
        metadata: {
          author: 'Healthcare AI Solutions',
          createdDate: new Date().toISOString(),
          totalSlides: presentationSlides.length
        }
      };

      // Use DocuSign edge function for professional PDF generation
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const response = await supabase.functions.invoke('docusign-integration', {
        body: {
          action: 'generate_presentation_pdf',
          data: {
            presentation: presentationData,
            template: 'professional_presentation',
            branding: {
              primaryColor: '#2563eb',
              secondaryColor: '#64748b',
              logo: 'healthcare_ai_logo'
            }
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.pdf_url) {
        // Download the professionally generated PDF
        const link = document.createElement('a');
        link.href = response.data.pdf_url;
        link.download = `agentic-ai-presentation-professional-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        
        toast.success('Professional PDF generated via DocuSign integration!');
      }
      
    } catch (error) {
      console.error('❌ DocuSign PDF generation failed:', error);
      toast.error('DocuSign PDF generation not available - using standard PDF generation');
      // Fallback to standard PDF generation
      await generatePDF();
    }
  }, [extractSlideData, generatePDF]);

  return {
    generatePowerPoint,
    generatePDF,
    generateDocuSignPDF,
    // Backward compatibility
    downloadHTML: generatePDF,
    downloadPDF: generatePDF,
    captureAllSlides: generatePDF,
    captureCurrentSlide: () => Promise.resolve('')
  };
};