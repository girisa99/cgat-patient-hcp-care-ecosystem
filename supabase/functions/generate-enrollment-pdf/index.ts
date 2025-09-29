import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { moduleType, formData, instanceId, signatureData } = await req.json();

    console.log('Generating PDF for:', { moduleType, instanceId });

    // Generate PDF content based on module type
    const pdfContent = generatePDFContent(moduleType, formData, signatureData);
    
    // Store PDF metadata in database
    const { data: pdfRecord, error: dbError } = await supabase
      .from('enrollment_documents')
      .insert({
        enrollment_instance_id: instanceId,
        document_type: 'enrollment_pdf',
        document_name: `${moduleType}_enrollment_${instanceId}.pdf`,
        document_data: pdfContent,
        generated_at: new Date().toISOString(),
        status: 'generated'
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Generate download URL (for demo purposes, return base64)
    const pdfUrl = `data:application/pdf;base64,${btoa(pdfContent)}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl,
        documentId: pdfRecord.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generatePDFContent(moduleType: string, formData: any, signatureData?: string): string {
  // Simple PDF generation (in production, use proper PDF library)
  const title = getModuleTitle(moduleType);
  const timestamp = new Date().toISOString();
  
  let content = `
ENROLLMENT DOCUMENT
${title}
Generated: ${timestamp}

COLLECTED INFORMATION:
`;

  // Add form data
  Object.entries(formData).forEach(([key, value]) => {
    const fieldName = formatFieldName(key);
    const fieldValue = formatFieldValue(value);
    content += `\n${fieldName}: ${fieldValue}`;
  });

  // Add signature section
  if (signatureData) {
    content += `\n\nDIGITAL SIGNATURE:
Signature captured on: ${timestamp}
Signature data: [Digital signature attached]`;
  }

  content += `\n\nCERTIFICATION:
This document represents a complete enrollment record collected through
our conversational AI enrollment system. All information has been
verified and confirmed by the enrollee.`;

  return content;
}

function getModuleTitle(moduleType: string): string {
  const titles = {
    patient: 'Patient Enrollment',
    treatment_center: 'Treatment Center Onboarding',
    customer: 'Customer Registration',
    manufacturer: 'Manufacturer Registration'
  };
  return titles[moduleType] || moduleType;
}

function formatFieldName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
}

function formatFieldValue(value: any): string {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}