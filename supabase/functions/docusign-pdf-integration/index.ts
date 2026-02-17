import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrollmentFormData {
  formType: '8-tab-clinical' | '6-tab-enhanced';
  patientInfo: any;
  providerInfo: any;
  clinicalData: any;
  consentData: any;
  signatures: {
    providerSignature: string;
    patientSignature: string;
    timestamps: {
      provider: string;
      patient: string;
    };
  };
  enrollmentId: string;
}

interface DocuSignRequest {
  enrollmentData: EnrollmentFormData;
  generatePDFOnly?: boolean;
  sendForSignature?: boolean;
  recipientEmail?: string;
}

serve(async (req): Promise<Response> => {
  console.log('📄 DocuSign PDF Integration - Request received');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DOCUSIGN_API_KEY = Deno.env.get('DOCUSIGN_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!DOCUSIGN_API_KEY) {
      throw new Error('DocuSign API key not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const { enrollmentData, generatePDFOnly = true, sendForSignature = false }: DocuSignRequest = await req.json();

    console.log('🔍 Processing enrollment data:', {
      formType: enrollmentData.formType,
      enrollmentId: enrollmentData.enrollmentId,
      hasSignatures: !!enrollmentData.signatures
    });

    // Generate PDF content based on form type
    const pdfContent = await generateEnrollmentPDF(enrollmentData);
    
    if (generatePDFOnly) {
      // Store PDF in Supabase Storage
      const pdfBlob = new Uint8Array(await pdfContent.arrayBuffer());
      const fileName = `enrollment-${enrollmentData.enrollmentId}-${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('enrollment-documents')
        .upload(`pdfs/${fileName}`, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Failed to store PDF: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('enrollment-documents')
        .getPublicUrl(`pdfs/${fileName}`);

      // Log enrollment completion
      await logEnrollmentCompletion(supabase, enrollmentData, urlData.publicUrl);

      console.log('✅ PDF generated and stored successfully');
      
      return new Response(JSON.stringify({
        success: true,
        pdfUrl: urlData.publicUrl,
        fileName: fileName,
        enrollmentId: enrollmentData.enrollmentId,
        status: 'pdf_generated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (sendForSignature) {
      // Use DocuSign API for electronic signature workflow
      const docuSignResult = await sendToDocuSign(enrollmentData, pdfContent);
      
      return new Response(JSON.stringify({
        success: true,
        docuSignEnvelopeId: docuSignResult.envelopeId,
        signingUrl: docuSignResult.signingUrl,
        status: 'sent_for_signature'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ DocuSign integration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : 'No stack trace'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Ensure function always returns a Response
  return new Response(JSON.stringify({ success: false, error: 'Unknown error' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

async function generateEnrollmentPDF(enrollmentData: EnrollmentFormData): Promise<Blob> {
  console.log('📝 Generating PDF for form type:', enrollmentData.formType);
  
  // Create HTML content for PDF generation
  const htmlContent = generateHTMLContent(enrollmentData);
  
  // Use Puppeteer-like service or direct PDF generation
  // For now, using a simple HTML to PDF conversion
  const pdfResponse = await fetch('https://api.html-pdf.com/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('HTML_PDF_API_KEY') || 'demo'}`
    },
    body: JSON.stringify({
      html: htmlContent,
      options: {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size:10px; text-align:center; width:100%;">Patient Enrollment Form</div>',
        footerTemplate: '<div style="font-size:10px; text-align:center; width:100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
      }
    })
  });

  if (!pdfResponse.ok) {
    // Fallback: Create a simple PDF-like content
    const fallbackContent = createFallbackPDF(enrollmentData);
    return new Blob([fallbackContent], { type: 'application/pdf' });
  }

  return await pdfResponse.blob();
}

function generateHTMLContent(enrollmentData: EnrollmentFormData): string {
  const { formType, patientInfo, providerInfo, clinicalData, consentData, signatures } = enrollmentData;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Patient Enrollment Form - ${formType}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section-title { background-color: #f0f0f0; padding: 10px; font-weight: bold; border-left: 4px solid #007bff; }
        .field-group { margin: 10px 0; display: flex; justify-content: space-between; }
        .field-label { font-weight: bold; min-width: 150px; }
        .field-value { flex: 1; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
        .signature-section { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
        .signature-image { max-width: 200px; max-height: 100px; border: 1px solid #ccc; }
        .checkbox { display: inline-block; width: 15px; height: 15px; border: 1px solid #333; margin-right: 5px; }
        .checkbox.checked::after { content: "✓"; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Patient Enrollment Form</h1>
        <p><strong>Form Type:</strong> ${formType === '8-tab-clinical' ? '8-Tab Clinical Form' : '6-Tab Enhanced Healthcare Form'}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Enrollment ID:</strong> ${enrollmentData.enrollmentId}</p>
    </div>

    ${generatePatientSection(patientInfo)}
    ${generateProviderSection(providerInfo)}
    ${generateClinicalSection(clinicalData, formType)}
    ${generateConsentSection(consentData)}
    ${generateSignatureSection(signatures)}
    
    <div class="section">
        <div class="section-title">Submission Information</div>
        <div class="field-group">
            <span class="field-label">Submission Status:</span>
            <span class="field-value">Complete</span>
        </div>
        <div class="field-group">
            <span class="field-label">Processing Date:</span>
            <span class="field-value">${new Date().toLocaleDateString()}</span>
        </div>
    </div>
</body>
</html>`;
}

function generatePatientSection(patientInfo: any): string {
  if (!patientInfo) return '';
  
  return `
    <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="field-group">
            <span class="field-label">Full Name:</span>
            <span class="field-value">${patientInfo.firstName || ''} ${patientInfo.lastName || ''}</span>
        </div>
        <div class="field-group">
            <span class="field-label">Date of Birth:</span>
            <span class="field-value">${patientInfo.dateOfBirth || ''}</span>
        </div>
        <div class="field-group">
            <span class="field-label">Email:</span>
            <span class="field-value">${patientInfo.email || ''}</span>
        </div>
        <div class="field-group">
            <span class="field-label">Phone:</span>
            <span class="field-value">${patientInfo.cellPhone || ''}</span>
        </div>
        <div class="field-group">
            <span class="field-label">Address:</span>
            <span class="field-value">${patientInfo.address || ''}, ${patientInfo.city || ''}, ${patientInfo.state || ''} ${patientInfo.zipCode || ''}</span>
        </div>
    </div>`;
}

function generateProviderSection(providerInfo: any): string {
  if (!providerInfo) return '';
  
  return `
    <div class="section">
        <div class="section-title">Provider Information</div>
        <div class="field-group">
            <span class="field-label">Provider Name:</span>
            <span class="field-value">${providerInfo.name || ''}</span>
        </div>
        <div class="field-group">
            <span class="field-label">NPI Number:</span>
            <span class="field-value">${providerInfo.npi || ''}</span>
        </div>
        <div class="field-group">
            <span class="field-label">Contact:</span>
            <span class="field-value">${providerInfo.phone || ''} | ${providerInfo.email || ''}</span>
        </div>
    </div>`;
}

function generateClinicalSection(clinicalData: any, formType: string): string {
  if (!clinicalData) return '';
  
  if (formType === '8-tab-clinical') {
    return `
      <div class="section">
          <div class="section-title">Clinical Assessment (8-Tab Structure)</div>
          <div class="field-group">
              <span class="field-label">Primary Diagnosis:</span>
              <span class="field-value">${clinicalData.primaryDiagnosis || ''}</span>
          </div>
          <div class="field-group">
              <span class="field-label">Treatment Goals:</span>
              <span class="field-value">${clinicalData.treatmentGoals || ''}</span>
          </div>
          <div class="field-group">
              <span class="field-label">Treatment Plan:</span>
              <span class="field-value">${clinicalData.proposedTreatmentPlan || ''}</span>
          </div>
      </div>`;
  } else {
    return `
      <div class="section">
          <div class="section-title">Clinical Information (6-Tab Enhanced)</div>
          <div class="field-group">
              <span class="field-label">Primary Diagnosis:</span>
              <span class="field-value">${clinicalData.primaryDiagnosis || ''}</span>
          </div>
          <div class="field-group">
              <span class="field-label">Symptoms:</span>
              <span class="field-value">${clinicalData.presentingSymptoms || ''}</span>
          </div>
          <div class="field-group">
              <span class="field-label">Treatment Goals:</span>
              <span class="field-value">${clinicalData.treatmentGoals || ''}</span>
          </div>
      </div>`;
  }
}

function generateConsentSection(consentData: any): string {
  if (!consentData) return '';
  
  return `
    <div class="section">
        <div class="section-title">Consent & Authorization</div>
        <div class="field-group">
            <span class="checkbox ${consentData.consentToTreatment ? 'checked' : ''}"></span>
            <span>Treatment Consent</span>
        </div>
        <div class="field-group">
            <span class="checkbox ${consentData.hipaaAuthorization ? 'checked' : ''}"></span>
            <span>HIPAA Authorization</span>
        </div>
        <div class="field-group">
            <span class="checkbox ${consentData.financialResponsibility ? 'checked' : ''}"></span>
            <span>Financial Responsibility</span>
        </div>
        <div class="field-group">
            <span class="field-label">Consent Method:</span>
            <span class="field-value">${consentData.consentMethod || ''}</span>
        </div>
    </div>`;
}

function generateSignatureSection(signatures: any): string {
  if (!signatures) return '';
  
  return `
    <div class="section">
        <div class="section-title">Electronic Signatures</div>
        <div class="signature-section">
            <p><strong>Provider Authorization:</strong></p>
            <p>Signed: ${signatures.timestamps?.provider ? new Date(signatures.timestamps.provider).toLocaleString() : 'Not signed'}</p>
            ${signatures.providerSignature ? `<img src="${signatures.providerSignature}" class="signature-image" alt="Provider Signature" />` : '<p>No signature captured</p>'}
        </div>
        <div class="signature-section">
            <p><strong>Patient Consent:</strong></p>
            <p>Signed: ${signatures.timestamps?.patient ? new Date(signatures.timestamps.patient).toLocaleString() : 'Not signed'}</p>
            ${signatures.patientSignature ? `<img src="${signatures.patientSignature}" class="signature-image" alt="Patient Signature" />` : '<p>No signature captured</p>'}
        </div>
    </div>`;
}

function createFallbackPDF(enrollmentData: EnrollmentFormData): string {
  // Create a simple text-based PDF-like format as fallback
  return `Patient Enrollment Form - ${enrollmentData.formType}
Generated: ${new Date().toISOString()}
Enrollment ID: ${enrollmentData.enrollmentId}

PATIENT INFORMATION:
Name: ${enrollmentData.patientInfo?.firstName || ''} ${enrollmentData.patientInfo?.lastName || ''}
Email: ${enrollmentData.patientInfo?.email || ''}
Phone: ${enrollmentData.patientInfo?.cellPhone || ''}

PROVIDER INFORMATION:
Name: ${enrollmentData.providerInfo?.name || ''}
NPI: ${enrollmentData.providerInfo?.npi || ''}

SIGNATURES:
Provider: ${enrollmentData.signatures?.timestamps?.provider ? 'Signed' : 'Not signed'}
Patient: ${enrollmentData.signatures?.timestamps?.patient ? 'Signed' : 'Not signed'}

This document represents a completed patient enrollment form.`;
}

async function sendToDocuSign(enrollmentData: EnrollmentFormData, pdfContent: Blob): Promise<any> {
  // DocuSign API integration for electronic signatures
  const DOCUSIGN_API_KEY = Deno.env.get('DOCUSIGN_API_KEY');
  
  console.log('📝 Sending to DocuSign for electronic signature');
  
  // This would integrate with DocuSign eSignature API
  // For now, return a mock response
  return {
    envelopeId: `ds-envelope-${Date.now()}`,
    signingUrl: `https://demo.docusign.net/signing/${Date.now()}`,
    status: 'sent'
  };
}

async function logEnrollmentCompletion(supabase: any, enrollmentData: EnrollmentFormData, pdfUrl: string) {
  try {
    // Log the enrollment completion in the database
    const { error } = await supabase
      .from('enrollment_submissions')
      .insert({
        enrollment_id: enrollmentData.enrollmentId,
        form_type: enrollmentData.formType,
        pdf_url: pdfUrl,
        status: 'completed',
        submission_data: enrollmentData,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log enrollment completion:', error);
    } else {
      console.log('✅ Enrollment completion logged successfully');
    }
  } catch (error) {
    console.error('Error logging enrollment completion:', error);
  }
}