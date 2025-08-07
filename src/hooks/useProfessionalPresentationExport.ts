/**
 * Professional Presentation Export - Clean PPT and PDF Generation
 * Uses structured data for perfect formatting without React conversion issues
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { structuredPresentationData, SlideData } from '@/data/structured-presentation-data';
// @ts-ignore - PptxGenJS doesn't have perfect TypeScript support
import PptxGenJS from 'pptxgenjs';
// @ts-ignore - html2pdf.js doesn't have TypeScript definitions
import html2pdf from 'html2pdf.js';

export const useProfessionalPresentationExport = () => {

  // Generate native PowerPoint with perfect formatting
  const generatePowerPoint = useCallback(async () => {
    try {
      console.log('🎯 Generating professional PowerPoint...');
      
      const pptx = new PptxGenJS();
      
      // Set presentation properties
      pptx.author = 'Healthcare AI Solutions';
      pptx.company = 'Treatment Center AI Implementation';
      pptx.title = 'Agentic AI Implementation for Treatment Centers';
      pptx.subject = 'AI Implementation Presentation';
      
      // Define slide layouts
      pptx.defineLayout({ name: 'TITLE_SLIDE', width: 10, height: 5.625 });
      pptx.defineLayout({ name: 'CONTENT_SLIDE', width: 10, height: 5.625 });

      // Add title slide
      const titleSlide = pptx.addSlide();
      titleSlide.background = { fill: 'F8FAFC' };
      
      // Main title
      titleSlide.addText('Agentic AI Implementation for Treatment Centers', {
        x: 0.5, y: 1.5, w: 9, h: 1.2,
        fontSize: 36,
        bold: true,
        color: '1E293B',
        align: 'center'
      });
      
      // Subtitle
      titleSlide.addText('Comprehensive AI automation platform with proven results and real-world implementation', {
        x: 0.5, y: 2.8, w: 9, h: 0.8,
        fontSize: 18,
        color: '64748B',
        align: 'center'
      });
      
      // Date and slide count
      titleSlide.addText(`${new Date().toLocaleDateString()} • ${structuredPresentationData.length} Slides`, {
        x: 0.5, y: 4.5, w: 9, h: 0.3,
        fontSize: 12,
        color: '64748B',
        align: 'center'
      });

      // Process each structured slide
      structuredPresentationData.forEach((slideData, index) => {
        console.log(`📄 Processing slide ${index + 1}: ${slideData.title}`);
        
        const slide = pptx.addSlide();
        slide.background = { fill: slideData.design.backgroundColor.replace('#', '') };
        
        // Slide number
        slide.addText(`${index + 1}`, {
          x: 9.2, y: 0.1, w: 0.5, h: 0.3,
          fontSize: 10,
          color: '64748B',
          align: 'center'
        });
        
        // Title
        slide.addText(slideData.title, {
          x: 0.5, y: 0.3, w: 9, h: 0.8,
          fontSize: 24,
          bold: true,
          color: slideData.design.primaryColor.replace('#', ''),
          align: 'center'
        });
        
        // Subtitle
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: 0.5, y: 1.1, w: 9, h: 0.5,
            fontSize: 14,
            color: '64748B',
            align: 'center',
            italic: true
          });
        }
        
        let contentY = slideData.subtitle ? 1.8 : 1.5;
        
        // Handle different slide types
        if (slideData.type === 'process' && slideData.content.processSteps) {
          // Process steps layout
          slideData.content.processSteps.forEach((step, stepIndex) => {
            const stepY = contentY + (stepIndex * 0.8);
            
            // Step number circle
            slide.addText(step.number, {
              x: 0.8, y: stepY, w: 0.6, h: 0.6,
              fontSize: 16,
              bold: true,
              color: 'FFFFFF',
              align: 'center',
              fill: { color: slideData.design.primaryColor.replace('#', '') },
              shape: 'ellipse'
            });
            
            // Step title
            slide.addText(step.title, {
              x: 1.8, y: stepY, w: 7, h: 0.3,
              fontSize: 14,
              bold: true,
              color: '1E293B'
            });
            
            // Step description
            slide.addText(step.description, {
              x: 1.8, y: stepY + 0.3, w: 7, h: 0.4,
              fontSize: 11,
              color: '64748B'
            });
          });
        } else if (slideData.type === 'stats' && slideData.content.stats) {
          // Stats layout
          slideData.content.stats.forEach((stat, statIndex) => {
            const statX = 1 + (statIndex * 2);
            
            slide.addText(stat.value, {
              x: statX, y: contentY, w: 1.8, h: 0.6,
              fontSize: 28,
              bold: true,
              color: slideData.design.primaryColor.replace('#', ''),
              align: 'center'
            });
            
            slide.addText(stat.label, {
              x: statX, y: contentY + 0.6, w: 1.8, h: 0.3,
              fontSize: 10,
              color: '64748B',
              align: 'center'
            });
          });
          
          contentY += 1.2;
        }
        
        // Add main content sections
        if (slideData.content.subSections) {
          slideData.content.subSections.forEach((section, sectionIndex) => {
            const sectionX = sectionIndex === 0 ? 0.5 : 5.25;
            
            // Section title
            slide.addText(section.title, {
              x: sectionX, y: contentY, w: 4.25, h: 0.4,
              fontSize: 14,
              bold: true,
              color: slideData.design.primaryColor.replace('#', '')
            });
            
            // Section items
            const itemsText = section.items.map(item => `• ${item}`).join('\n');
            slide.addText(itemsText, {
              x: sectionX, y: contentY + 0.5, w: 4.25, h: 2.5,
              fontSize: 11,
              color: '1E293B',
              lineSpacing: 18
            });
          });
        }
        
        // Add main points if no subsections
        if (slideData.content.mainPoints && !slideData.content.subSections) {
          const mainPointsText = slideData.content.mainPoints.map(point => `• ${point}`).join('\n');
          slide.addText(mainPointsText, {
            x: 0.5, y: contentY, w: 9, h: 3,
            fontSize: 12,
            color: '1E293B',
            lineSpacing: 20
          });
        }
      });

      // Generate and download
      const fileName = `agentic-ai-presentation-${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName });
      
      toast.success(`✅ PowerPoint generated! Downloaded: ${fileName}`);
      console.log('✅ PowerPoint generation completed successfully');
      
    } catch (error) {
      console.error('❌ PowerPoint generation failed:', error);
      toast.error('Failed to generate PowerPoint presentation');
    }
  }, []);

  // Generate professional PDF with proper slide formatting
  const generatePDF = useCallback(async () => {
    try {
      console.log('🎯 Generating professional PDF...');
      
      // Create clean HTML for PDF generation
      const slideHtml = structuredPresentationData.map((slideData, index) => {
        return `
          <div class="pdf-slide" style="
            page-break-after: always;
            width: 8.5in;
            height: 11in;
            padding: 0.75in;
            background: ${slideData.design.backgroundColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            box-sizing: border-box;
          ">
            <!-- Slide Header -->
            <div style="text-align: center; margin-bottom: 0.5in;">
              <div style="
                background: ${slideData.design.primaryColor};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 16px;
              ">
                Slide ${index + 1} of ${structuredPresentationData.length}
              </div>
              
              <h1 style="
                font-size: 28px;
                font-weight: bold;
                color: #1e293b;
                margin: 16px 0;
                line-height: 1.2;
              ">
                ${slideData.title}
              </h1>
              
              ${slideData.subtitle ? `
                <p style="
                  font-size: 16px;
                  color: #64748b;
                  margin-bottom: 24px;
                  font-style: italic;
                ">
                  ${slideData.subtitle}
                </p>
              ` : ''}
            </div>
            
            <!-- Slide Content -->
            <div style="margin-bottom: 0.5in;">
              ${slideData.type === 'process' && slideData.content.processSteps ? 
                slideData.content.processSteps.map((step, stepIndex) => `
                  <div style="
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  ">
                    <div style="
                      background: ${slideData.design.primaryColor};
                      color: white;
                      width: 40px;
                      height: 40px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: 16px;
                      margin-right: 16px;
                      flex-shrink: 0;
                    ">
                      ${step.number}
                    </div>
                    <div>
                      <h3 style="
                        font-size: 16px;
                        font-weight: bold;
                        color: #1e293b;
                        margin: 0 0 8px 0;
                      ">
                        ${step.title}
                      </h3>
                      <p style="
                        font-size: 14px;
                        color: #64748b;
                        margin: 0;
                        line-height: 1.5;
                      ">
                        ${step.description}
                      </p>
                    </div>
                  </div>
                `).join('') : ''
              }
              
              ${slideData.type === 'stats' && slideData.content.stats ? `
                <div style="
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 16px;
                  margin-bottom: 24px;
                ">
                  ${slideData.content.stats.map(stat => `
                    <div style="
                      text-align: center;
                      padding: 20px;
                      background: white;
                      border-radius: 8px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">
                      <div style="
                        font-size: 24px;
                        font-weight: bold;
                        color: ${slideData.design.primaryColor};
                        margin-bottom: 8px;
                      ">
                        ${stat.value}
                      </div>
                      <div style="
                        font-size: 12px;
                        color: #64748b;
                      ">
                        ${stat.label}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${slideData.content.subSections ? `
                <div style="
                  display: grid;
                  grid-template-columns: repeat(${slideData.content.subSections.length}, 1fr);
                  gap: 24px;
                ">
                  ${slideData.content.subSections.map(section => `
                    <div style="
                      background: white;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">
                      <h3 style="
                        font-size: 16px;
                        font-weight: bold;
                        color: ${slideData.design.primaryColor};
                        margin: 0 0 16px 0;
                      ">
                        ${section.title}
                      </h3>
                      <ul style="
                        margin: 0;
                        padding: 0;
                        list-style: none;
                      ">
                        ${section.items.map(item => `
                          <li style="
                            margin-bottom: 8px;
                            font-size: 14px;
                            color: #1e293b;
                            line-height: 1.4;
                            padding-left: 16px;
                            position: relative;
                          ">
                            <span style="
                              position: absolute;
                              left: 0;
                              color: ${slideData.design.primaryColor};
                              font-weight: bold;
                            ">•</span>
                            ${item}
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${slideData.content.mainPoints && !slideData.content.subSections ? `
                <div style="
                  background: white;
                  padding: 24px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                  <ul style="
                    margin: 0;
                    padding: 0;
                    list-style: none;
                  ">
                    ${slideData.content.mainPoints.map(point => `
                      <li style="
                        margin-bottom: 12px;
                        font-size: 14px;
                        color: #1e293b;
                        line-height: 1.5;
                        padding-left: 20px;
                        position: relative;
                      ">
                        <span style="
                          position: absolute;
                          left: 0;
                          color: ${slideData.design.primaryColor};
                          font-weight: bold;
                        ">•</span>
                        ${point}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
            
            <!-- Slide Footer -->
            <div style="
              position: absolute;
              bottom: 0.5in;
              right: 0.75in;
              font-size: 10px;
              color: #64748b;
            ">
              Treatment Center AI Implementation
            </div>
          </div>
        `;
      }).join('');

      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Agentic AI Implementation Presentation</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .pdf-slide { page-break-after: always; }
            @media print {
              .pdf-slide { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${slideHtml}
        </body>
        </html>
      `;

      // Generate PDF with proper settings
      const opt = {
        margin: 0,
        filename: `agentic-ai-presentation-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          width: 816, // 8.5 inches at 96 DPI
          height: 1056 // 11 inches at 96 DPI
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait',
          compress: true
        }
      };

      // Create element and generate PDF
      const element = document.createElement('div');
      element.innerHTML = fullHtml;
      
      await html2pdf().set(opt).from(element).save();
      
      toast.success(`✅ PDF generated! Professional ${structuredPresentationData.length}-slide presentation downloaded`);
      console.log('✅ PDF generation completed successfully');
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    }
  }, []);

  return {
    generatePowerPoint,
    generatePDF,
    // Backward compatibility
    downloadHTML: generatePDF,
    downloadPDF: generatePDF,
    captureAllSlides: generatePDF,
    captureCurrentSlide: () => Promise.resolve('')
  };
};