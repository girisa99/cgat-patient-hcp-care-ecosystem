/**
 * Text-Based Export - Extracts Actual Content from Slides
 * Creates professional documents with real text instead of images
 */

import React, { useCallback } from 'react';
import { toast } from 'sonner';
// @ts-ignore - PptxGenJS doesn't have perfect TypeScript support
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';
import { presentationSlides } from '@/data/presentation-slides';

// Extract text content from React nodes
const extractTextContent = (node: any): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (!node) return '';
  
  if (React.isValidElement(node)) {
    if ((node.props as any)?.children) {
      return extractTextContent((node.props as any).children);
    }
    return '';
  }
  
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join(' ');
  }
  
  return '';
};

// Extract structured content from slide elements
const extractSlideData = (slideContent: any) => {
  const textContent = extractTextContent(slideContent);
  
  // Parse content to identify different sections
  const sections: Array<{
    type: 'heading' | 'text' | 'list' | 'stat' | 'badge';
    content: string;
    level?: number;
  }> = [];
  
  // Split by common patterns
  const lines = textContent.split(/[•\n]/).filter(line => line.trim());
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Detect headings (typically longer and more descriptive)
    if (trimmed.length > 50 && !trimmed.includes('%') && !trimmed.includes('•')) {
      sections.push({ type: 'heading', content: trimmed, level: 2 });
    }
    // Detect stats (contains percentage or numbers)
    else if (/\d+%|\d+\/\d+/.test(trimmed)) {
      sections.push({ type: 'stat', content: trimmed });
    }
    // Detect list items (short phrases)
    else if (trimmed.length < 100) {
      sections.push({ type: 'list', content: trimmed });
    }
    // Regular text
    else {
      sections.push({ type: 'text', content: trimmed });
    }
  });
  
  return sections;
};

export const useTextBasedExport = () => {
  
  // Generate PowerPoint with actual text content
  const generateTextPowerPoint = useCallback(async () => {
    try {
      console.log('🎯 Generating text-based PowerPoint...');
      toast.success('Creating PowerPoint with text content...', { duration: 2000 });
      
      const pptx = new PptxGenJS();
      
      // Set presentation properties
      pptx.author = 'Treatment Center AI Implementation';
      pptx.company = 'Healthcare AI Solutions';
      pptx.title = 'Agentic AI Implementation for Treatment Centers';
      pptx.subject = 'AI Implementation Presentation';
      
      // Define slide layout (16:9 aspect ratio)
      pptx.defineLayout({ name: 'CUSTOM', width: 13.33, height: 7.5 });

      // Process each slide
      presentationSlides.forEach((slideData, index) => {
        console.log(`📝 Processing slide ${index + 1}: ${slideData.title}`);
        
        const slide = pptx.addSlide();
        slide.background = { fill: 'F8FAFC' };
        
        // Add title
        slide.addText(slideData.title, {
          x: 0.5, y: 0.5, w: 12.33, h: 1,
          fontSize: 28,
          bold: true,
          color: '1E293B',
          align: 'center'
        });
        
        // Add subtitle if exists
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: 0.5, y: 1.5, w: 12.33, h: 0.8,
            fontSize: 16,
            color: '64748B',
            align: 'center'
          });
        }
        
        // Extract and add content
        const sections = extractSlideData(slideData.content);
        let yPosition = slideData.subtitle ? 2.5 : 2;
        
        sections.forEach((section, sectionIndex) => {
          if (yPosition > 6.5) return; // Don't overflow the slide
          
          switch (section.type) {
            case 'heading':
              slide.addText(section.content, {
                x: 0.5, y: yPosition, w: 12.33, h: 0.6,
                fontSize: 18,
                bold: true,
                color: '1E293B'
              });
              yPosition += 0.8;
              break;
              
            case 'list':
              slide.addText(`• ${section.content}`, {
                x: 1, y: yPosition, w: 11.33, h: 0.4,
                fontSize: 14,
                color: '374151'
              });
              yPosition += 0.5;
              break;
              
            case 'stat':
              slide.addText(section.content, {
                x: 0.5, y: yPosition, w: 12.33, h: 0.5,
                fontSize: 16,
                bold: true,
                color: '059669',
                align: 'center'
              });
              yPosition += 0.7;
              break;
              
            default:
              slide.addText(section.content, {
                x: 0.5, y: yPosition, w: 12.33, h: 0.5,
                fontSize: 14,
                color: '374151'
              });
              yPosition += 0.6;
          }
        });
        
        // Add slide number
        slide.addText(`${index + 1}`, {
          x: 12.5, y: 7, w: 0.5, h: 0.3,
          fontSize: 10,
          color: '64748B',
          align: 'center'
        });
      });

      // Generate and download
      const fileName = `agentic-ai-presentation-text-${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName });
      
      toast.success(`✅ Text-based PowerPoint generated! ${presentationSlides.length} slides with real content`);
      console.log('✅ Text-based PowerPoint generation completed');
      
    } catch (error) {
      console.error('❌ Text-based PowerPoint generation failed:', error);
      toast.error('Failed to generate text-based PowerPoint');
    }
  }, []);

  // Generate PDF with actual text content and proper formatting
  const generateTextPDF = useCallback(async () => {
    try {
      console.log('🎯 Generating text-based PDF...');
      toast.success('Creating PDF with text content...', { duration: 2000 });
      
      // Create PDF with proper dimensions (letter size)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title page
      pdf.setFontSize(24);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Agentic AI Implementation', pageWidth / 2, 40, { align: 'center' });
      pdf.text('for Treatment Centers', pageWidth / 2, 55, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Comprehensive AI automation platform with proven results', pageWidth / 2, 80, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 260, { align: 'center' });

      // Process each slide
      presentationSlides.forEach((slideData, index) => {
        console.log(`📄 Adding slide ${index + 1} to PDF: ${slideData.title}`);
        
        pdf.addPage();
        let yPosition = margin;
        
        // Add slide title
        pdf.setFontSize(20);
        pdf.setTextColor(30, 41, 59);
        const titleLines = pdf.splitTextToSize(slideData.title, contentWidth);
        pdf.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 8 + 5;
        
        // Add subtitle
        if (slideData.subtitle) {
          pdf.setFontSize(12);
          pdf.setTextColor(100, 116, 139);
          const subtitleLines = pdf.splitTextToSize(slideData.subtitle, contentWidth);
          pdf.text(subtitleLines, margin, yPosition);
          yPosition += subtitleLines.length * 6 + 10;
        }
        
        // Extract and add content
        const sections = extractSlideData(slideData.content);
        
        sections.forEach((section) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          
          switch (section.type) {
            case 'heading':
              pdf.setFontSize(14);
              pdf.setTextColor(30, 41, 59);
              const headingLines = pdf.splitTextToSize(section.content, contentWidth);
              pdf.text(headingLines, margin, yPosition);
              yPosition += headingLines.length * 6 + 5;
              break;
              
            case 'list':
              pdf.setFontSize(11);
              pdf.setTextColor(55, 65, 81);
              const listText = `• ${section.content}`;
              const listLines = pdf.splitTextToSize(listText, contentWidth - 10);
              pdf.text(listLines, margin + 5, yPosition);
              yPosition += listLines.length * 5 + 2;
              break;
              
            case 'stat':
              pdf.setFontSize(12);
              pdf.setTextColor(5, 150, 105);
              const statLines = pdf.splitTextToSize(section.content, contentWidth);
              pdf.text(statLines, margin, yPosition);
              yPosition += statLines.length * 5 + 3;
              break;
              
            default:
              pdf.setFontSize(11);
              pdf.setTextColor(55, 65, 81);
              const textLines = pdf.splitTextToSize(section.content, contentWidth);
              pdf.text(textLines, margin, yPosition);
              yPosition += textLines.length * 5 + 3;
          }
        });
        
        // Add page number
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Page ${index + 2}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      });

      // Download the PDF
      const fileName = `agentic-ai-presentation-text-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success(`✅ Text-based PDF generated! ${presentationSlides.length} slides with complete content`);
      console.log('✅ Text-based PDF generation completed');
      
    } catch (error) {
      console.error('❌ Text-based PDF generation failed:', error);
      toast.error('Failed to generate text-based PDF');
    }
  }, []);

  return {
    generateTextPowerPoint,
    generateTextPDF,
    // Legacy compatibility
    generatePowerPoint: generateTextPowerPoint,
    generatePDF: generateTextPDF
  };
};