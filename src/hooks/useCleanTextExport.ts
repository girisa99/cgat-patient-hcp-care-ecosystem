/**
 * Clean Text Export - Direct Content Extraction
 * Creates professional documents with properly structured text content
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
// @ts-ignore - PptxGenJS doesn't have perfect TypeScript support
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';

// Define clean content structure for each slide
const cleanSlideContent = [
  {
    id: 1,
    title: "Agentic AI Implementation for Treatment Centers",
    subtitle: "Comprehensive AI automation platform with proven results and real-world implementation",
    sections: [
      {
        heading: "Transform Your Treatment Center Operations",
        content: "Our comprehensive AI automation platform delivers measurable results across all aspects of treatment center management. From patient intake to care coordination, experience the power of intelligent automation."
      },
      {
        heading: "Key Features",
        items: [
          "Data Integration: Seamless integration with existing EHR systems and databases",
          "AI Conversations: Natural language processing for patient interactions", 
          "Automation: Streamlined workflows and automated processes"
        ]
      },
      {
        heading: "Proven Results",
        items: [
          "95% Efficiency Gain in operational processes",
          "60% Cost Reduction in administrative overhead",
          "24/7 AI Availability for patient support",
          "30+ System Integrations available"
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Complete AI Agent Architecture & Deployment System",
    subtitle: "End-to-End Agent Lifecycle Management with Multi-Channel Deployment & Advanced Features",
    sections: [
      {
        heading: "Comprehensive AI Infrastructure",
        content: "Our platform provides complete AI agent infrastructure supporting multiple deployment channels, real-time monitoring, and enterprise-grade security features."
      },
      {
        heading: "Core Components",
        items: [
          "Agent Registry: Centralized management for all AI agents with version control",
          "Multi-Channel Deployment: Deploy across web, mobile, SMS, voice, and social platforms",
          "Real-time Monitoring: Live performance metrics and conversation analytics"
        ]
      },
      {
        heading: "Deployment Channels",
        items: [
          "Web Chat", "Mobile App", "SMS/WhatsApp", "Voice Calls",
          "Email", "Social Media", "API Integration", "Webhook"
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Complete Agent Creation Journey Overview",
    subtitle: "End-to-End Process: Create → Test → Deploy → Monitor with Advanced Features",
    sections: [
      {
        heading: "4-Step Agent Creation Process",
        content: "Our streamlined process takes you from concept to deployment with guided workflows and intelligent automation."
      },
      {
        heading: "Step-by-Step Process",
        items: [
          "Step 1 - Setup: Session management, authentication, and initial configuration",
          "Step 2 - Design: Visual agent creation with templates and branding",
          "Step 3 - Configure: Actions, connectors, and workflow setup",
          "Step 4 - Deploy: Knowledge integration and multi-channel deployment"
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Session Management, User Authentication & Multi-Step Setup Process",
    sections: [
      {
        heading: "Streamlined Onboarding Process",
        content: "Intelligent defaults and guided configuration ensure quick setup while maintaining security and compliance standards."
      },
      {
        heading: "Key Features",
        items: [
          "Session Management: Secure session handling with auto-save and recovery",
          "User Authentication: Multi-factor authentication with role-based access",
          "Smart Defaults: Industry-specific templates and intelligent suggestions"
        ]
      },
      {
        heading: "Setup Process Flow",
        items: [
          "Account Creation & Verification: Email verification and security setup",
          "Organization Setup: Company details and team structure configuration",
          "Integration Preferences: EHR connections and API configurations"
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Step 2: Canvas Design & Visual Branding",
    subtitle: "Agent Creation, Template System, Use Cases & Complete Branding Implementation",
    sections: [
      {
        heading: "Visual Design & Branding",
        content: "Intuitive drag-and-drop interface for creating branded AI agents with professional templates and complete customization options."
      },
      {
        heading: "Core Features",
        items: [
          "Visual Canvas Editor: Drag-and-drop interface with real-time preview",
          "Branding System: Logo, colors, typography, and voice customization",
          "Template Library: Pre-built templates for common use cases"
        ]
      },
      {
        heading: "Available Templates",
        items: [
          "Patient Intake", "Appointment Booking", "Insurance Verification", "Follow-up Care"
        ]
      },
      {
        heading: "Customization Stats",
        items: [
          "50+ Design Templates", "100+ UI Components", "Unlimited Customization Options"
        ]
      }
    ]
  }
];

export const useCleanTextExport = () => {
  
  // Generate PowerPoint with clean, structured text content
  const generateCleanPowerPoint = useCallback(async () => {
    try {
      console.log('🎯 Generating clean text PowerPoint...');
      toast.success('Creating professional PowerPoint...', { duration: 2000 });
      
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
        x: 1, y: 2.5, w: 11.33, h: 1.5,
        fontSize: 32,
        bold: true,
        color: '1E293B',
        align: 'center'
      });
      
      titleSlide.addText('Comprehensive AI automation platform with proven results', {
        x: 1, y: 4.2, w: 11.33, h: 1,
        fontSize: 18,
        color: '64748B',
        align: 'center'
      });
      
      titleSlide.addText(`${new Date().toLocaleDateString()} • Professional Presentation`, {
        x: 1, y: 6.5, w: 11.33, h: 0.5,
        fontSize: 12,
        color: '64748B',
        align: 'center'
      });

      // Process each slide with clean content
      cleanSlideContent.forEach((slideData, index) => {
        console.log(`📝 Adding slide ${index + 1}: ${slideData.title}`);
        
        const slide = pptx.addSlide();
        slide.background = { fill: 'FFFFFF' };
        
        // Add title
        slide.addText(slideData.title, {
          x: 0.5, y: 0.5, w: 12.33, h: 1,
          fontSize: 24,
          bold: true,
          color: '1E293B',
          align: 'left'
        });
        
        // Add subtitle
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: 0.5, y: 1.3, w: 12.33, h: 0.6,
            fontSize: 14,
            color: '64748B',
            align: 'left'
          });
        }
        
        let yPosition = 2.2;
        
        // Add content sections
        slideData.sections.forEach((section) => {
          if (yPosition > 6.8) return; // Prevent overflow
          
          // Add section heading
          slide.addText(section.heading, {
            x: 0.5, y: yPosition, w: 12.33, h: 0.5,
            fontSize: 16,
            bold: true,
            color: '1E293B'
          });
          yPosition += 0.6;
          
          // Add section content
          if (section.content) {
            slide.addText(section.content, {
              x: 0.5, y: yPosition, w: 12.33, h: 0.8,
              fontSize: 12,
              color: '374151'
            });
            yPosition += 0.9;
          }
          
          // Add items as bullet points
          if (section.items) {
            section.items.forEach((item, itemIndex) => {
              if (yPosition > 6.8) return;
              
              slide.addText(`• ${item}`, {
                x: 0.8, y: yPosition, w: 11.53, h: 0.4,
                fontSize: 11,
                color: '374151'
              });
              yPosition += 0.45;
            });
            yPosition += 0.2; // Extra space after bullet section
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
      const fileName = `agentic-ai-professional-${new Date().toISOString().split('T')[0]}.pptx`;
      await pptx.writeFile({ fileName });
      
      toast.success(`✅ Professional PowerPoint generated! ${cleanSlideContent.length} slides with clean text`);
      console.log('✅ Clean PowerPoint generation completed');
      
    } catch (error) {
      console.error('❌ Clean PowerPoint generation failed:', error);
      toast.error('Failed to generate PowerPoint');
    }
  }, []);

  // Generate PDF with clean, structured text content
  const generateCleanPDF = useCallback(async () => {
    try {
      console.log('🎯 Generating clean text PDF...');
      toast.success('Creating professional PDF...', { duration: 2000 });
      
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
      pdf.setFontSize(28);
      pdf.setTextColor(30, 41, 59);
      const titleText = 'Agentic AI Implementation for Treatment Centers';
      pdf.text(titleText, pageWidth / 2, 60, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Comprehensive AI automation platform with proven results', pageWidth / 2, 80, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 250, { align: 'center' });

      // Process each slide
      cleanSlideContent.forEach((slideData, index) => {
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
        
        // Add content sections
        slideData.sections.forEach((section) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Add section heading
          pdf.setFontSize(14);
          pdf.setTextColor(30, 41, 59);
          const headingLines = pdf.splitTextToSize(section.heading, contentWidth);
          pdf.text(headingLines, margin, yPosition);
          yPosition += headingLines.length * 6 + 5;
          
          // Add section content
          if (section.content) {
            pdf.setFontSize(11);
            pdf.setTextColor(55, 65, 81);
            const contentLines = pdf.splitTextToSize(section.content, contentWidth);
            pdf.text(contentLines, margin, yPosition);
            yPosition += contentLines.length * 5 + 5;
          }
          
          // Add items as bullet points
          if (section.items) {
            section.items.forEach((item) => {
              if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = margin;
              }
              
              pdf.setFontSize(10);
              pdf.setTextColor(55, 65, 81);
              const bulletText = `• ${item}`;
              const bulletLines = pdf.splitTextToSize(bulletText, contentWidth - 10);
              pdf.text(bulletLines, margin + 5, yPosition);
              yPosition += bulletLines.length * 4 + 2;
            });
            yPosition += 5; // Extra space after bullet section
          }
        });
        
        // Add page number
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Page ${index + 2}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      });

      // Download the PDF
      const fileName = `agentic-ai-professional-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success(`✅ Professional PDF generated! ${cleanSlideContent.length} slides with clean content`);
      console.log('✅ Clean PDF generation completed');
      
    } catch (error) {
      console.error('❌ Clean PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    }
  }, []);

  return {
    generateCleanPowerPoint,
    generateCleanPDF
  };
};