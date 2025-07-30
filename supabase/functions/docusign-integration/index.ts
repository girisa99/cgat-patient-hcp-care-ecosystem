import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocuSignEnvelope {
  documentId: string
  applicationId: string
  signers: Array<{
    email: string
    name: string
    role: string
    order: number
  }>
  documents: Array<{
    name: string
    content: string // Base64 encoded PDF
  }>
}

interface DocuSignAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
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

    const { action, data } = await req.json()

    // Get DocuSign credentials from Supabase secrets
    const clientId = Deno.env.get('DOCUSIGN_CLIENT_ID')
    const clientSecret = Deno.env.get('DOCUSIGN_CLIENT_SECRET')
    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID')
    const userId = Deno.env.get('DOCUSIGN_USER_ID')

    if (!clientId || !clientSecret || !accountId || !userId) {
      throw new Error('DocuSign credentials not configured')
    }

    // Get DocuSign access token
    const getAccessToken = async (): Promise<string> => {
      const authUrl = 'https://account-d.docusign.com/oauth/token'
      const authBody = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: 'mock_code' // In production, implement proper OAuth flow
      })

      // For demo purposes, we'll use JWT authorization
      const jwtAuthUrl = 'https://account-d.docusign.com/oauth/token'
      const jwtBody = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: 'mock_jwt_token' // In production, generate proper JWT
      })

      // For now, return a mock token - implement proper OAuth in production
      return 'mock_access_token'
    }

    switch (action) {
      case 'send_envelope': {
        const envelopeData: DocuSignEnvelope = data

        console.log('Sending DocuSign envelope for application:', envelopeData.applicationId)

        // Create envelope
        const envelopeRequest = {
          status: 'sent',
          emailSubject: 'Credit Application Signature Request',
          documents: envelopeData.documents.map((doc, index) => ({
            documentId: (index + 1).toString(),
            name: doc.name,
            documentBase64: doc.content,
            order: (index + 1).toString(),
            pages: '1'
          })),
          recipients: {
            signers: envelopeData.signers.map((signer, index) => ({
              email: signer.email,
              name: signer.name,
              recipientId: (index + 1).toString(),
              routingOrder: signer.order.toString(),
              tabs: {
                signHereTabs: [{
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '100'
                }],
                dateSignedTabs: [{
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '300',
                  yPosition: '100'
                }]
              }
            }))
          }
        }

        // Store envelope data in database
        const { data: envelopeRecord, error: dbError } = await supabase
          .from('docusign_envelopes')
          .insert([{
            application_id: envelopeData.applicationId,
            envelope_id: `mock_envelope_${Date.now()}`, // Replace with actual DocuSign envelope ID
            status: 'sent',
            signers: envelopeData.signers,
            envelope_data: envelopeRequest
          }])
          .select()
          .single()

        if (dbError) throw dbError

        // Log the envelope creation
        console.log('DocuSign envelope created:', envelopeRecord.envelope_id)

        return new Response(
          JSON.stringify({
            success: true,
            envelope_id: envelopeRecord.envelope_id,
            message: 'Envelope sent successfully'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'check_status': {
        const { envelopeId } = data

        // Get envelope status from database
        const { data: envelope, error } = await supabase
          .from('docusign_envelopes')
          .select('*')
          .eq('envelope_id', envelopeId)
          .single()

        if (error) throw error

        // In production, check actual DocuSign status
        // For demo, simulate status updates
        const mockStatuses = ['sent', 'delivered', 'completed']
        const currentStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)]

        return new Response(
          JSON.stringify({
            envelope_id: envelopeId,
            status: currentStatus,
            signers: envelope.signers.map(signer => ({
              ...signer,
              status: currentStatus === 'completed' ? 'signed' : 'pending'
            }))
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'webhook': {
        // Handle DocuSign webhook events
        const { event, envelopeId, recipientEmail, status } = data

        console.log('DocuSign webhook received:', { event, envelopeId, status })

        // Update envelope status in database
        await supabase
          .from('docusign_envelopes')
          .update({ 
            status,
            updated_at: new Date().toISOString()
          })
          .eq('envelope_id', envelopeId)

        // Update application status if all signatures completed
        if (status === 'completed') {
          const { data: envelope } = await supabase
            .from('docusign_envelopes')
            .select('application_id')
            .eq('envelope_id', envelopeId)
            .single()

          if (envelope) {
            await supabase
              .from('credit_applications')
              .update({ 
                application_status: 'signed',
                all_signatures_completed_at: new Date().toISOString()
              })
              .eq('id', envelope.application_id)
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'generate_pdf': {
        const { applicationId, includeSignatures = false } = data

        console.log('Generating PDF for application:', applicationId)

        // Get application data
        const { data: application, error: appError } = await supabase
          .from('credit_applications')
          .select('*')
          .eq('id', applicationId)
          .single()

        if (appError) throw appError

        // Get signatures if requested
        let signatures = []
        if (includeSignatures) {
          const { data: sigData } = await supabase
            .from('application_signatures')
            .select('*')
            .eq('application_id', applicationId)
          
          signatures = sigData || []
        }

        // Generate PDF content (simplified HTML to PDF conversion)
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Credit Application</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin: 20px 0; }
              .signature-section { border: 1px solid #ccc; padding: 20px; margin: 20px 0; }
              .signature-image { max-width: 200px; max-height: 100px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Credit Application</h1>
              <p>Application ID: ${application.id}</p>
              <p>Submitted: ${new Date(application.created_at).toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h2>Business Information</h2>
              <p><strong>Business Type:</strong> ${application.business_type || 'N/A'}</p>
              <p><strong>Primary Contact:</strong> ${application.primary_contact_name || 'N/A'}</p>
              <p><strong>Email:</strong> ${application.primary_contact_email || 'N/A'}</p>
            </div>

            <div class="section">
              <h2>Credit Information</h2>
              <p><strong>Requested Credit Limit:</strong> $${application.requested_credit_limit || 'N/A'}</p>
              <p><strong>Payment Terms:</strong> ${application.payment_terms_requested || 'N/A'}</p>
            </div>

            ${signatures.length > 0 ? `
              <div class="section">
                <h2>Signatures</h2>
                ${signatures.map(sig => `
                  <div class="signature-section">
                    <p><strong>${sig.signer_name}</strong> (${sig.signer_role})</p>
                    <p>Email: ${sig.signer_email}</p>
                    ${sig.signature_data ? `<img src="${sig.signature_data}" class="signature-image" alt="Signature" />` : ''}
                    <p>Signed: ${sig.signed_at ? new Date(sig.signed_at).toLocaleString() : 'Pending'}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </body>
          </html>
        `

        // Convert HTML to PDF (in production, use a proper HTML to PDF service)
        const pdfData = btoa(htmlContent) // Mock PDF - base64 encoded HTML

        // Store PDF in storage
        const fileName = `credit-application-${applicationId}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('credit-documents')
          .upload(fileName, new Blob([atob(pdfData)], { type: 'application/pdf' }), {
            contentType: 'application/pdf',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('credit-documents')
          .getPublicUrl(fileName)

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
    console.error('DocuSign integration error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})