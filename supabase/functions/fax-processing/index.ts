import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      'https://ithspbabhmdntioslfqe.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { action, data } = await req.json()

    switch (action) {
      case 'setup_fax_reception': {
        const { patientId, expectedDocument, pdfTemplate } = data

        console.log('Setting up fax reception for patient:', patientId)

        // Generate unique fax number for this patient
        const faxNumber = `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`

        // Store fax expectation in database
        const { data: faxSetup, error } = await supabase
          .from('fax_processing_queue')
          .insert([{
            patient_id: patientId,
            expected_document: expectedDocument,
            fax_number: faxNumber,
            status: 'waiting',
            template_data: pdfTemplate,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({
            success: true,
            fax_number: faxNumber,
            setup_id: faxSetup.id,
            instructions: [
              'Fill out the downloaded form completely',
              'Sign and date all required fields', 
              `Fax completed form to: ${faxNumber}`,
              'You will receive confirmation once processed'
            ]
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'receive_fax': {
        const { faxNumber, faxContent, callerInfo } = data

        console.log('Processing received fax:', { faxNumber, callerInfo })

        // Find the expected fax
        const { data: faxSetup, error: setupError } = await supabase
          .from('fax_processing_queue')
          .select('*')
          .eq('fax_number', faxNumber)
          .eq('status', 'waiting')
          .single()

        if (setupError || !faxSetup) {
          return new Response(
            JSON.stringify({ error: 'No pending fax expected for this number' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404 
            }
          )
        }

        // Convert fax to PDF using OCR
        const ocrResult = await processFaxWithOCR(faxContent, faxSetup.template_data)

        // Store the processed fax
        const fileName = `fax-received-${faxSetup.patient_id}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('enrollment-forms')
          .upload(fileName, new Blob([faxContent], { type: 'application/pdf' }), {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('enrollment-forms')
          .getPublicUrl(fileName)

        // Update fax processing record
        await supabase
          .from('fax_processing_queue')
          .update({
            status: 'received',
            received_at: new Date().toISOString(),
            pdf_url: publicUrl,
            ocr_data: ocrResult.extractedData,
            confidence_score: ocrResult.confidenceScore
          })
          .eq('id', faxSetup.id)

        // Create enrollment record from OCR data
        if (ocrResult.confidenceScore > 0.7) {
          const { data: enrollment, error: enrollmentError } = await supabase
            .from('patient_enrollments')
            .insert([{
              patient_id: faxSetup.patient_id,
              enrollment_data: ocrResult.extractedData,
              submission_method: 'fax',
              status: 'review_needed',
              source_document_url: publicUrl,
              submitted_at: new Date().toISOString()
            }])
            .select()
            .single()

          if (!enrollmentError) {
            // Trigger collaborative review workflow
            await supabase.functions.invoke('docusign-integration', {
              body: {
                action: 'send_envelope',
                data: {
                  applicationId: enrollment.id,
                  documentType: 'fax_review',
                  signers: [
                    {
                      email: 'intake@facility.com',
                      name: 'Intake Coordinator',
                      role: 'intake_coordinator',
                      order: 1
                    },
                    {
                      email: 'medical@facility.com', 
                      name: 'Medical Reviewer',
                      role: 'medical_reviewer',
                      order: 2
                    }
                  ],
                  documents: [{
                    name: `Fax Review - Patient ${faxSetup.patient_id}`,
                    content: faxContent
                  }]
                }
              }
            })
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Fax received and processed',
            confidence_score: ocrResult.confidenceScore,
            requires_manual_review: ocrResult.confidenceScore <= 0.7,
            pdf_url: publicUrl
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'check_fax_status': {
        const { patientId, faxNumber } = data

        const { data: faxStatus, error } = await supabase
          .from('fax_processing_queue')
          .select('*')
          .eq('patient_id', patientId)
          .or(`fax_number.eq.${faxNumber}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({
            success: true,
            status: faxStatus.status,
            received_at: faxStatus.received_at,
            pdf_url: faxStatus.pdf_url,
            confidence_score: faxStatus.confidence_score,
            requires_review: faxStatus.confidence_score <= 0.7
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
    console.error('Fax processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : 'No stack trace'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processFaxWithOCR(faxContent: string, templateData: string) {
  // Mock OCR processing - in production, integrate with OCR service
  // This would extract form field data from the faxed document
  
  const mockExtractedData = {
    firstName: 'John',
    lastName: 'Doe', 
    dateOfBirth: '1980-01-01',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St',
    city: 'Anytown',
    state: 'NY',
    zipCode: '12345',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '(555) 765-4321',
    consentToTreatment: true,
    hipaaAuthorization: true,
    financialResponsibility: true,
    submissionMethod: 'fax'
  }

  // Mock confidence score based on document quality
  const confidenceScore = 0.85 + (Math.random() * 0.1) // 0.85-0.95

  return {
    extractedData: mockExtractedData,
    confidenceScore: confidenceScore
  }
}