/**
 * Medical Report PDF Generator
 * Generates professional PDF reports from medical image analysis
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface AIInsight {
  category: string;
  description: string;
  confidence: number;
  region?: string;
  clinicalSignificance?: string;
  status?: string;
  measurementValue?: string;
  normalRange?: string;
}

interface Measurement {
  name: string;
  value: number;
  unit: string;
  normalRange?: { min: number; max: number; description?: string };
  status: string;
  clinicalImplication?: string;
}

interface PatientDetails {
  patient_name: string;
  patient_dob: string;
  patient_id: string;
  referring_physician: string;
  study_date: string;
}

interface ProviderDetails {
  provider_name: string;
  provider_npi: string;
  facility_name: string;
  facility_address: string;
  report_date: string;
}

interface MedicalReportPDFGeneratorProps {
  patientDetails: PatientDetails;
  providerDetails: ProviderDetails;
  aiInsights: AIInsight[];
  measurements?: Measurement[];
  clinicalNotes: string;
  documentType: string;
  modelUsed: string;
  disclaimer: string;
  onGenerated?: () => void;
}

export const MedicalReportPDFGenerator: React.FC<MedicalReportPDFGeneratorProps> = ({
  patientDetails,
  providerDetails,
  aiInsights,
  measurements = [],
  clinicalNotes,
  documentType,
  modelUsed,
  disclaimer,
  onGenerated
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const getDocumentTypeLabel = () => {
    const labels: Record<string, string> = {
      'xray': 'X-Ray',
      'ct-scan': 'CT Scan',
      'mri': 'MRI',
      'ecg': 'ECG/EKG',
      'ultrasound': 'Ultrasound',
      'mammogram': 'Mammogram'
    };
    return labels[documentType] || 'Medical Image';
  };

  const getStatusColor = (status?: string): [number, number, number] => {
    switch (status?.toLowerCase()) {
      case 'abnormal': return [220, 53, 69];
      case 'borderline': return [255, 193, 7];
      case 'normal': return [40, 167, 69];
      default: return [108, 117, 125];
    }
  };

  const generatePDF = async () => {
    if (!patientDetails.patient_name) {
      toast.error('Patient name is required to generate PDF');
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MEDICAL IMAGING REPORT', margin, 15);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Study Type: ${getDocumentTypeLabel()}`, margin, 23);
      pdf.text(`Report Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 23);

      yPos = 40;

      // Patient Information Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PATIENT INFORMATION', margin + 2, yPos + 5.5);
      yPos += 12;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const patientInfo = [
        ['Patient Name:', patientDetails.patient_name],
        ['Date of Birth:', patientDetails.patient_dob || 'Not provided'],
        ['Patient ID/MRN:', patientDetails.patient_id || 'Not provided'],
        ['Study Date:', patientDetails.study_date || 'Not provided'],
        ['Referring Physician:', patientDetails.referring_physician || 'Not provided']
      ];

      patientInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 40, yPos);
        yPos += 5;
      });

      yPos += 5;

      // Provider Information Section
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROVIDER INFORMATION', margin + 2, yPos + 5.5);
      yPos += 12;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const providerInfo = [
        ['Interpreting Provider:', providerDetails.provider_name || 'Not provided'],
        ['NPI:', providerDetails.provider_npi || 'Not provided'],
        ['Facility:', providerDetails.facility_name || 'Not provided'],
        ['Report Date:', providerDetails.report_date || new Date().toISOString().split('T')[0]]
      ];

      providerInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 40, yPos);
        yPos += 5;
      });

      yPos += 8;

      // Measurements Section (if available)
      if (measurements.length > 0) {
        checkPageBreak(40);
        
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MEASUREMENTS & REFERENCE VALUES', margin + 2, yPos + 5.5);
        yPos += 12;

        // Table header
        pdf.setFillColor(220, 220, 220);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Measurement', margin + 2, yPos + 5);
        pdf.text('Value', margin + 55, yPos + 5);
        pdf.text('Normal Range', margin + 85, yPos + 5);
        pdf.text('Status', margin + 130, yPos + 5);
        yPos += 9;

        pdf.setFont('helvetica', 'normal');
        measurements.forEach((m) => {
          checkPageBreak(8);
          
          pdf.text(m.name.substring(0, 30), margin + 2, yPos);
          pdf.text(`${m.value} ${m.unit}`, margin + 55, yPos);
          
          const rangeText = m.normalRange 
            ? `${m.normalRange.min}-${m.normalRange.max} ${m.unit}`
            : 'N/A';
          pdf.text(rangeText, margin + 85, yPos);
          
          // Status with color
          const [r, g, b] = getStatusColor(m.status);
          pdf.setTextColor(r, g, b);
          pdf.setFont('helvetica', 'bold');
          pdf.text(m.status.toUpperCase(), margin + 130, yPos);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          
          yPos += 6;
        });

        yPos += 5;
      }

      // AI Findings Section
      checkPageBreak(30);
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`AI-ASSISTED FINDINGS (${aiInsights.length} findings)`, margin + 2, yPos + 5.5);
      yPos += 12;

      // Abnormalities summary
      const abnormalFindings = aiInsights.filter(i => i.status === 'abnormal' || i.clinicalSignificance === 'high' || i.clinicalSignificance === 'critical');
      if (abnormalFindings.length > 0) {
        pdf.setFillColor(255, 235, 235);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 6 + (abnormalFindings.length * 4), 'F');
        pdf.setTextColor(220, 53, 69);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('⚠ ABNORMAL/HIGH SIGNIFICANCE FINDINGS:', margin + 2, yPos + 4);
        yPos += 6;
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        abnormalFindings.forEach((finding) => {
          const text = `• ${finding.description.substring(0, 100)}${finding.description.length > 100 ? '...' : ''}`;
          pdf.text(text, margin + 4, yPos);
          yPos += 4;
        });
        pdf.setTextColor(0, 0, 0);
        yPos += 4;
      }

      // All findings
      pdf.setFontSize(9);
      aiInsights.forEach((insight, index) => {
        checkPageBreak(20);
        
        const categoryColors: Record<string, [number, number, number]> = {
          'finding': [59, 130, 246],
          'observation': [40, 167, 69],
          'recommendation': [128, 90, 213],
          'concern': [255, 193, 7],
          'normal': [40, 167, 69],
          'abnormality': [220, 53, 69],
          'measurement': [23, 162, 184]
        };

        const [r, g, b] = categoryColors[insight.category] || [108, 117, 125];
        
        // Category badge
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(margin, yPos, 25, 5, 1, 1, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text(insight.category.toUpperCase(), margin + 2, yPos + 3.5);
        
        // Confidence
        pdf.setTextColor(108, 117, 125);
        pdf.setFontSize(7);
        pdf.text(`${insight.confidence}% confidence`, margin + 28, yPos + 3.5);
        
        // Status if available
        if (insight.status) {
          const [sr, sg, sb] = getStatusColor(insight.status);
          pdf.setTextColor(sr, sg, sb);
          pdf.text(`[${insight.status.toUpperCase()}]`, margin + 55, yPos + 3.5);
        }
        
        yPos += 7;
        
        // Description
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        const splitDescription = pdf.splitTextToSize(insight.description, pageWidth - 2 * margin - 5);
        splitDescription.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, margin + 2, yPos);
          yPos += 4;
        });
        
        // Additional details
        if (insight.region || insight.measurementValue || insight.normalRange) {
          pdf.setFontSize(8);
          pdf.setTextColor(108, 117, 125);
          let detailsLine = '';
          if (insight.region) detailsLine += `Region: ${insight.region}  `;
          if (insight.measurementValue) detailsLine += `Value: ${insight.measurementValue}  `;
          if (insight.normalRange) detailsLine += `Normal: ${insight.normalRange}`;
          pdf.text(detailsLine, margin + 2, yPos);
          yPos += 4;
        }
        
        yPos += 3;
      });

      // Clinical Notes
      if (clinicalNotes) {
        checkPageBreak(25);
        
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CLINICAL NOTES', margin + 2, yPos + 5.5);
        yPos += 12;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const splitNotes = pdf.splitTextToSize(clinicalNotes, pageWidth - 2 * margin);
        splitNotes.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, margin, yPos);
          yPos += 4;
        });
        yPos += 5;
      }

      // Provider Consultation Box
      checkPageBreak(35);
      
      pdf.setFillColor(255, 243, 205);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
      pdf.setDrawColor(255, 193, 7);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, 'S');
      
      pdf.setTextColor(133, 100, 4);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('⚠️ IMPORTANT: HEALTHCARE PROVIDER CONSULTATION REQUIRED', margin + 5, yPos + 7);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const consultText = 'This AI-assisted analysis requires review and interpretation by a qualified healthcare provider. Please schedule an appointment with your physician or radiologist to discuss these findings and receive proper medical guidance.';
      const splitConsult = pdf.splitTextToSize(consultText, pageWidth - 2 * margin - 10);
      splitConsult.forEach((line: string, i: number) => {
        pdf.text(line, margin + 5, yPos + 12 + (i * 4));
      });
      
      yPos += 30;

      // Disclaimer
      checkPageBreak(30);
      
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
      
      pdf.setTextColor(108, 117, 125);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DISCLAIMER', margin + 2, yPos + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const disclaimerText = disclaimer || 'This AI-assisted analysis is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. The analysis should be interpreted by qualified healthcare professionals. AI-generated findings may contain errors and should always be verified through clinical examination and professional medical judgment. Do not make medical decisions based solely on this report.';
      const splitDisclaimer = pdf.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 4);
      splitDisclaimer.forEach((line: string, i: number) => {
        pdf.text(line, margin + 2, yPos + 10 + (i * 3));
      });

      // Footer with model info
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`AI Model: ${modelUsed || 'Unknown'} | Generated: ${new Date().toISOString()}`, margin, pageHeight - 10);
      pdf.text('Page 1', pageWidth - margin - 15, pageHeight - 10);

      // Save the PDF
      const fileName = `medical_report_${patientDetails.patient_name.replace(/\s+/g, '_')}_${patientDetails.study_date || new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('PDF Report Generated', {
        description: 'Medical imaging report has been downloaded'
      });
      
      onGenerated?.();
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF}
      disabled={isGenerating || !patientDetails.patient_name || aiInsights.length === 0}
      variant="outline"
      className="flex-1"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF Report
        </>
      )}
    </Button>
  );
};

export default MedicalReportPDFGenerator;
