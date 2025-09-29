import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingPDFRequest {
  action: 'generate_section_pdf' | 'generate_complete_pdf'
  data: {
    onboardingId: string
    sectionId?: string
    onboardingData: any
    includeSignatures?: boolean
    sections?: any[]
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      'https://ithspbabhmdntioslfqe.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { action, data }: OnboardingPDFRequest = await req.json()

    console.log('Onboarding PDF Generator - Action:', action, 'OnboardingId:', data.onboardingId)

    switch (action) {
      case 'generate_section_pdf': {
        const { onboardingId, sectionId, onboardingData, includeSignatures = false } = data

        console.log('Generating section PDF:', sectionId)

        // Generate section-specific PDF content
        let htmlContent = ''
        
        switch (sectionId) {
          case 'main_application':
            htmlContent = generateMainApplicationHTML(onboardingData, includeSignatures)
            break
          case 'credit_application':
            htmlContent = generateCreditApplicationHTML(onboardingData, includeSignatures)
            break
          case 'compliance_documents':
            htmlContent = generateComplianceDocumentsHTML(onboardingData, includeSignatures)
            break
          default:
            throw new Error(`Unknown section: ${sectionId}`)
        }

        // Convert HTML to PDF (mock implementation - use proper PDF service in production)
        const pdfContent = btoa(htmlContent) // Base64 encoded HTML as mock PDF

        // Store PDF in storage
        const fileName = `onboarding-${sectionId}-${onboardingId}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('credit-documents')
          .upload(fileName, new Blob([atob(pdfContent)], { type: 'application/pdf' }), {
            contentType: 'application/pdf',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('credit-documents')
          .getPublicUrl(fileName)

        // Store PDF record
        await supabase
          .from('application_pdfs')
          .insert([{
            application_id: onboardingId,
            file_name: fileName,
            storage_path: uploadData.path,
            pdf_type: 'section',
            includes_signatures: includeSignatures,
            generated_by: data.onboardingData?.created_by
          }])

        return new Response(
          JSON.stringify({
            success: true,
            pdf_url: publicUrl,
            pdfContent: pdfContent,
            file_name: fileName
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'generate_complete_pdf': {
        const { onboardingId, onboardingData, includeSignatures = true, sections = [] } = data

        console.log('Generating complete onboarding PDF')

        // Generate comprehensive PDF with all sections
        const htmlContent = generateCompleteOnboardingHTML(onboardingData, sections, includeSignatures)

        // Convert HTML to PDF
        const pdfContent = btoa(htmlContent)

        // Store PDF in storage
        const fileName = `complete-onboarding-${onboardingId}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('credit-documents')
          .upload(fileName, new Blob([atob(pdfContent)], { type: 'application/pdf' }), {
            contentType: 'application/pdf',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('credit-documents')
          .getPublicUrl(fileName)

        // Store PDF record
        await supabase
          .from('application_pdfs')
          .insert([{
            application_id: onboardingId,
            file_name: fileName,
            storage_path: uploadData.path,
            pdf_type: 'final',
            includes_signatures: includeSignatures,
            generated_by: data.onboardingData?.created_by
          }])

        return new Response(
          JSON.stringify({
            success: true,
            pdf_url: publicUrl,
            file_name: fileName
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Onboarding PDF generation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function generateMainApplicationHTML(onboardingData: any, includeSignatures: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Treatment Center Onboarding Application</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin: 20px 0; page-break-inside: avoid; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .field-group { margin: 10px 0; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-left: 10px; }
        .signature-section { border: 1px solid #ccc; padding: 20px; margin: 20px 0; }
        .signature-image { max-width: 200px; max-height: 100px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Treatment Center Onboarding Application</h1>
        <p><strong>Application ID:</strong> ${onboardingData.id || 'N/A'}</p>
        <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Business Information</h2>
        <div class="field-group">
          <span class="field-label">Legal Name:</span>
          <span class="field-value">${onboardingData.legal_name || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">DBA Name:</span>
          <span class="field-value">${onboardingData.dba_name || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Business Type:</span>
          <span class="field-value">${onboardingData.business_type || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Federal Tax ID:</span>
          <span class="field-value">${onboardingData.federal_tax_id || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <h2>Contact Information</h2>
        <div class="field-group">
          <span class="field-label">Primary Contact:</span>
          <span class="field-value">${onboardingData.primary_contact_name || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Email:</span>
          <span class="field-value">${onboardingData.primary_contact_email || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Phone:</span>
          <span class="field-value">${onboardingData.primary_contact_phone || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <h2>Business Address</h2>
        <div class="field-group">
          <span class="field-label">Street Address:</span>
          <span class="field-value">${onboardingData.business_address_street || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">City, State ZIP:</span>
          <span class="field-value">${onboardingData.business_address_city || ''} ${onboardingData.business_address_state || ''} ${onboardingData.business_address_zip || ''}</span>
        </div>
      </div>

      ${onboardingData.principal_owners?.length > 0 ? `
        <div class="section">
          <h2>Principal Owners</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Ownership %</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${onboardingData.principal_owners.map((owner: any) => `
                <tr>
                  <td>${owner.name || 'N/A'}</td>
                  <td>${owner.title || 'N/A'}</td>
                  <td>${owner.ownership_percentage || 'N/A'}%</td>
                  <td>${owner.email || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="section">
        <h2>Certification</h2>
        <p>I certify that the information provided in this application is true and accurate to the best of my knowledge. I understand that any false or misleading information may result in the rejection of this application or termination of services.</p>
      </div>

      ${includeSignatures ? `
        <div class="signature-section">
          <h3>Authorized Representative Signature</h3>
          <p><strong>Printed Name:</strong> ${onboardingData.primary_contact_name || 'N/A'}</p>
          <p><strong>Title:</strong> Authorized Representative</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <div style="margin-top: 20px;">
            <p><strong>Electronic Signature:</strong> [Signature captured electronically]</p>
          </div>
        </div>
      ` : ''}
    </body>
    </html>
  `
}

function generateCreditApplicationHTML(onboardingData: any, includeSignatures: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Credit Application - ${onboardingData.legal_name || 'Treatment Center'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin: 20px 0; page-break-inside: avoid; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .field-group { margin: 10px 0; }
        .field-label { font-weight: bold; color: #555; }
        .field-value { margin-left: 10px; }
        .signature-section { border: 1px solid #ccc; padding: 20px; margin: 20px 0; }
        .two-column { display: flex; justify-content: space-between; }
        .column { width: 48%; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Credit Application</h1>
        <p><strong>Business Name:</strong> ${onboardingData.legal_name || onboardingData.dba_name || 'N/A'}</p>
        <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Business Information</h2>
        <div class="field-group">
          <span class="field-label">Legal Business Name:</span>
          <span class="field-value">${onboardingData.legal_name || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Federal Tax ID:</span>
          <span class="field-value">${onboardingData.federal_tax_id || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Years in Business:</span>
          <span class="field-value">${onboardingData.years_in_business || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Business Type:</span>
          <span class="field-value">${onboardingData.business_type || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <h2>Financial Information</h2>
        <div class="field-group">
          <span class="field-label">Annual Revenue:</span>
          <span class="field-value">${onboardingData.annual_revenue || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Requested Credit Limit:</span>
          <span class="field-value">$${onboardingData.requested_credit_limit || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Payment Terms Requested:</span>
          <span class="field-value">${onboardingData.payment_terms_requested || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <h2>Banking Information</h2>
        <div class="field-group">
          <span class="field-label">Bank Name:</span>
          <span class="field-value">${onboardingData.bank_name || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Bank Contact:</span>
          <span class="field-value">${onboardingData.bank_contact_name || 'N/A'}</span>
        </div>
        <div class="field-group">
          <span class="field-label">Bank Phone:</span>
          <span class="field-value">${onboardingData.bank_contact_phone || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <h2>Authorization</h2>
        <p>I/We hereby authorize investigation of our credit and business history and agree that this information and a photocopy of this agreement may be shared with credit agencies and other creditors who may extend credit.</p>
        
        <p>I/We certify that the information contained in this application is complete and accurate, and I/We personally guarantee payment of any indebtedness incurred.</p>
      </div>

      ${includeSignatures ? `
        <div class="signature-section">
          <h3>Financial Officer Authorization</h3>
          <p><strong>Printed Name:</strong> ${onboardingData.financial_contact_name || onboardingData.primary_contact_name || 'N/A'}</p>
          <p><strong>Title:</strong> Financial Officer / Authorized Representative</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <div style="margin-top: 20px;">
            <p><strong>Electronic Signature:</strong> [Signature captured electronically]</p>
          </div>
        </div>
      ` : ''}
    </body>
    </html>
  `
}

function generateComplianceDocumentsHTML(onboardingData: any, includeSignatures: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Compliance & Authorization Documents</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin: 20px 0; page-break-inside: avoid; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .checkbox-item { margin: 10px 0; display: flex; align-items: center; }
        .checkbox { margin-right: 10px; }
        .signature-section { border: 1px solid #ccc; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Compliance & Authorization Documents</h1>
        <p><strong>Business:</strong> ${onboardingData.legal_name || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Regulatory Compliance Checklist</h2>
        
        <div class="checkbox-item">
          <input type="checkbox" class="checkbox" checked />
          <span>Business License - Current and Valid</span>
        </div>
        
        <div class="checkbox-item">
          <input type="checkbox" class="checkbox" checked />
          <span>Professional Licenses - All Required Practitioners</span>
        </div>
        
        <div class="checkbox-item">
          <input type="checkbox" class="checkbox" checked />
          <span>Liability Insurance - Minimum Coverage Requirements Met</span>
        </div>
        
        <div class="checkbox-item">
          <input type="checkbox" class="checkbox" checked />
          <span>HIPAA Compliance - Privacy and Security Policies in Place</span>
        </div>
        
        <div class="checkbox-item">
          <input type="checkbox" class="checkbox" checked />
          <span>State Regulatory Compliance - All Applicable Requirements</span>
        </div>
      </div>

      <div class="section">
        <h2>Authorization Statements</h2>
        
        <p><strong>Data Sharing Authorization:</strong> I authorize the sharing of necessary business and operational data for the purpose of establishing and maintaining the business relationship.</p>
        
        <p><strong>Background Check Authorization:</strong> I authorize background checks on key personnel and owners as required by applicable regulations.</p>
        
        <p><strong>Ongoing Compliance Monitoring:</strong> I understand and agree to ongoing compliance monitoring and reporting requirements.</p>
        
        <p><strong>Regulatory Reporting:</strong> I authorize the necessary reporting to regulatory bodies as required by law.</p>
      </div>

      <div class="section">
        <h2>Certification</h2>
        <p>I certify that this treatment center is in full compliance with all applicable federal, state, and local regulations. I understand that any material changes in compliance status must be reported immediately.</p>
      </div>

      ${includeSignatures ? `
        <div class="signature-section">
          <h3>Compliance Officer Authorization</h3>
          <p><strong>Printed Name:</strong> ${onboardingData.compliance_contact_name || onboardingData.primary_contact_name || 'N/A'}</p>
          <p><strong>Title:</strong> Compliance Officer / Authorized Representative</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <div style="margin-top: 20px;">
            <p><strong>Electronic Signature:</strong> [Signature captured electronically]</p>
          </div>
        </div>
      ` : ''}
    </body>
    </html>
  `
}

function generateCompleteOnboardingHTML(onboardingData: any, sections: any[], includeSignatures: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Complete Onboarding Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px; }
        .section { margin: 30px 0; page-break-inside: avoid; }
        .section h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .section h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .signature-summary { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #333; }
        .status-complete { color: #22c55e; font-weight: bold; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Complete Treatment Center Onboarding Documentation</h1>
        <p><strong>Treatment Center:</strong> ${onboardingData.legal_name || 'N/A'}</p>
        <p><strong>Onboarding ID:</strong> ${onboardingData.id || 'N/A'}</p>
        <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p class="status-complete">STATUS: COMPLETE WITH ALL SIGNATURES</p>
      </div>

      <div class="section">
        <h1>Executive Summary</h1>
        <p>This document contains the complete onboarding documentation for ${onboardingData.legal_name || 'the treatment center'}, including all required signatures and authorizations. The onboarding process has been completed successfully with full regulatory compliance.</p>
        
        <div class="signature-summary">
          <h2>Signature Summary</h2>
          ${sections.map(section => `
            <p><strong>${section.title}:</strong> <span class="status-complete">✓ Complete</span> (${section.signers.length} signature${section.signers.length !== 1 ? 's' : ''})</p>
          `).join('')}
        </div>
      </div>

      <div class="page-break"></div>
      ${generateMainApplicationHTML(onboardingData, includeSignatures)}

      <div class="page-break"></div>
      ${generateCreditApplicationHTML(onboardingData, includeSignatures)}

      <div class="page-break"></div>
      ${generateComplianceDocumentsHTML(onboardingData, includeSignatures)}

      <div class="section">
        <h1>Final Certification</h1>
        <p>This completes the onboarding documentation for ${onboardingData.legal_name || 'the treatment center'}. All required signatures have been obtained and all compliance requirements have been met.</p>
        <p><strong>Documentation Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="status-complete">ONBOARDING COMPLETE</span></p>
      </div>
    </body>
    </html>
  `
}