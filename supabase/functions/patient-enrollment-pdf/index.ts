import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PatientEnrollmentData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  primaryPhysician: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  treatmentType: string;
  referralSource: string;
  admissionDate?: string;
  consentToTreatment: boolean;
  hipaaAuthorization: boolean;
  financialResponsibility: boolean;
  submissionMethod: 'fax' | 'pdf_submit' | 'online';
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
      case 'generate_blank_form': {
        const { patientId, formType, submissionMethod } = data

        console.log('Generating blank enrollment form:', { patientId, formType, submissionMethod })

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Patient Enrollment Form</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .section { 
                margin: 25px 0; 
                page-break-inside: avoid;
              }
              .section-title {
                background: #f5f5f5;
                padding: 10px;
                font-weight: bold;
                border-left: 4px solid #007acc;
                margin-bottom: 15px;
              }
              .field-group {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 15px;
              }
              .field {
                flex: 1;
                min-width: 200px;
              }
              .field label {
                display: block;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .field input, .field textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                min-height: 25px;
              }
              .field textarea {
                min-height: 60px;
                resize: vertical;
              }
              .checkbox-group {
                margin: 15px 0;
              }
              .checkbox-item {
                display: flex;
                align-items: center;
                margin: 10px 0;
              }
              .checkbox-item input {
                margin-right: 10px;
                width: 18px;
                height: 18px;
              }
              .signature-section {
                border: 2px solid #333;
                padding: 20px;
                margin: 30px 0;
                min-height: 100px;
              }
              .signature-line {
                border-top: 1px solid #333;
                margin-top: 80px;
                padding-top: 10px;
                display: flex;
                justify-content: space-between;
              }
              .instructions {
                background: #e8f4f8;
                padding: 15px;
                margin: 20px 0;
                border-left: 4px solid #007acc;
              }
              .required {
                color: red;
              }
              @media print {
                body { margin: 20px; }
                .page-break { page-break-after: always; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PATIENT ENROLLMENT FORM</h1>
              <h2>Treatment Center Registration</h2>
              <p><strong>Form ID:</strong> ${patientId || 'NEW'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            ${submissionMethod === 'fax' ? `
              <div class="instructions">
                <h3>FAX SUBMISSION INSTRUCTIONS</h3>
                <p><strong>1.</strong> Please fill out this form completely using black ink or type</p>
                <p><strong>2.</strong> Sign and date where indicated</p>
                <p><strong>3.</strong> Fax completed form to: <strong>(555) 123-4567</strong></p>
                <p><strong>4.</strong> For questions, call: <strong>(555) 123-4568</strong></p>
              </div>
            ` : ''}

            <div class="section">
              <div class="section-title">PATIENT INFORMATION</div>
              <div class="field-group">
                <div class="field">
                  <label>First Name <span class="required">*</span></label>
                  <input type="text" name="firstName" />
                </div>
                <div class="field">
                  <label>Middle Name</label>
                  <input type="text" name="middleName" />
                </div>
                <div class="field">
                  <label>Last Name <span class="required">*</span></label>
                  <input type="text" name="lastName" />
                </div>
              </div>
              <div class="field-group">
                <div class="field">
                  <label>Date of Birth <span class="required">*</span></label>
                  <input type="text" name="dateOfBirth" placeholder="MM/DD/YYYY" />
                </div>
                <div class="field">
                  <label>Social Security Number <span class="required">*</span></label>
                  <input type="text" name="ssn" placeholder="XXX-XX-XXXX" />
                </div>
              </div>
              <div class="field-group">
                <div class="field">
                  <label>Email Address <span class="required">*</span></label>
                  <input type="email" name="email" />
                </div>
                <div class="field">
                  <label>Phone Number <span class="required">*</span></label>
                  <input type="tel" name="phone" />
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">ADDRESS INFORMATION</div>
              <div class="field">
                <label>Street Address <span class="required">*</span></label>
                <input type="text" name="address" />
              </div>
              <div class="field-group">
                <div class="field">
                  <label>City <span class="required">*</span></label>
                  <input type="text" name="city" />
                </div>
                <div class="field">
                  <label>State <span class="required">*</span></label>
                  <input type="text" name="state" />
                </div>
                <div class="field">
                  <label>ZIP Code <span class="required">*</span></label>
                  <input type="text" name="zipCode" />
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">EMERGENCY CONTACT</div>
              <div class="field-group">
                <div class="field">
                  <label>Emergency Contact Name <span class="required">*</span></label>
                  <input type="text" name="emergencyContactName" />
                </div>
                <div class="field">
                  <label>Emergency Contact Phone <span class="required">*</span></label>
                  <input type="tel" name="emergencyContactPhone" />
                </div>
              </div>
            </div>

            <div class="page-break"></div>

            <div class="section">
              <div class="section-title">MEDICAL INFORMATION</div>
              <div class="field">
                <label>Primary Physician</label>
                <input type="text" name="primaryPhysician" />
              </div>
              <div class="field">
                <label>Medical History (Please describe any significant medical conditions)</label>
                <textarea name="medicalHistory" rows="4"></textarea>
              </div>
              <div class="field">
                <label>Current Medications (Include dosages)</label>
                <textarea name="currentMedications" rows="4"></textarea>
              </div>
              <div class="field">
                <label>Allergies (Medications, foods, environmental)</label>
                <textarea name="allergies" rows="3"></textarea>
              </div>
            </div>

            <div class="section">
              <div class="section-title">INSURANCE INFORMATION</div>
              <div class="field-group">
                <div class="field">
                  <label>Insurance Provider</label>
                  <input type="text" name="insuranceProvider" />
                </div>
                <div class="field">
                  <label>Policy Number</label>
                  <input type="text" name="insurancePolicyNumber" />
                </div>
              </div>
              <div class="field">
                <label>Group Number</label>
                <input type="text" name="insuranceGroupNumber" />
              </div>
            </div>

            <div class="section">
              <div class="section-title">TREATMENT INFORMATION</div>
              <div class="field-group">
                <div class="field">
                  <label>Treatment Type Requested</label>
                  <input type="text" name="treatmentType" />
                </div>
                <div class="field">
                  <label>Referral Source</label>
                  <input type="text" name="referralSource" />
                </div>
              </div>
              <div class="field">
                <label>Preferred Admission Date</label>
                <input type="text" name="admissionDate" placeholder="MM/DD/YYYY" />
              </div>
            </div>

            <div class="section">
              <div class="section-title">CONSENT AND AUTHORIZATION</div>
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <input type="checkbox" name="consentToTreatment" id="consent1" />
                  <label for="consent1">I consent to treatment and understand the nature of the proposed treatment program.</label>
                </div>
                <div class="checkbox-item">
                  <input type="checkbox" name="hipaaAuthorization" id="consent2" />
                  <label for="consent2">I acknowledge receipt of the HIPAA Privacy Notice and authorize the use and disclosure of my health information for treatment, payment, and healthcare operations.</label>
                </div>
                <div class="checkbox-item">
                  <input type="checkbox" name="financialResponsibility" id="consent3" />
                  <label for="consent3">I understand my financial responsibility for treatment and agree to the payment terms.</label>
                </div>
              </div>
            </div>

            <div class="signature-section">
              <h3>PATIENT SIGNATURE</h3>
              <p>I certify that the information provided is true and complete to the best of my knowledge. I understand that any false information may result in denial of services.</p>
              <div class="signature-line">
                <div>
                  <strong>Patient Signature:</strong> ________________________________
                </div>
                <div>
                  <strong>Date:</strong> ____________________
                </div>
              </div>
            </div>

            ${submissionMethod !== 'fax' ? `
              <div class="signature-section">
                <h3>PROVIDER AUTHORIZATION</h3>
                <p>As the healthcare provider, I authorize the processing of this enrollment and consent to team collaboration for completion.</p>
                <div class="signature-line">
                  <div>
                    <strong>Provider Signature:</strong> ________________________________
                  </div>
                  <div>
                    <strong>Date:</strong> ____________________
                  </div>
                </div>
              </div>
            ` : ''}

            <div class="instructions">
              <h3>FOR OFFICE USE ONLY</h3>
              <div class="field-group">
                <div class="field">
                  <label>Received Date:</label>
                  <input type="text" />
                </div>
                <div class="field">
                  <label>Processed By:</label>
                  <input type="text" />
                </div>
                <div class="field">
                  <label>Status:</label>
                  <input type="text" />
                </div>
              </div>
            </div>
          </body>
          </html>
        `

        // Convert to PDF (mock implementation - use proper PDF generator in production)
        const pdfData = btoa(unescape(encodeURIComponent(htmlContent)))
        
        // Store in storage
        const fileName = `patient-enrollment-blank-${patientId || 'new'}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('enrollment-forms')
          .upload(fileName, new Blob([atob(pdfData)], { type: 'application/pdf' }), {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('enrollment-forms')
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

      case 'generate_filled_form': {
        const { patientId, formData, includeSignatures, submissionReady } = data

        console.log('Generating filled enrollment form:', { patientId, submissionReady })

        const patient = formData as PatientEnrollmentData

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Patient Enrollment Form - ${patient.firstName} ${patient.lastName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                line-height: 1.4;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .section { 
                margin: 25px 0; 
                page-break-inside: avoid;
              }
              .section-title {
                background: #f5f5f5;
                padding: 10px;
                font-weight: bold;
                border-left: 4px solid #007acc;
                margin-bottom: 15px;
              }
              .field-group {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 15px;
              }
              .field {
                flex: 1;
                min-width: 200px;
                margin-bottom: 10px;
              }
              .field-label {
                font-weight: bold;
                margin-bottom: 3px;
              }
              .field-value {
                padding: 5px;
                border-bottom: 1px solid #333;
                min-height: 20px;
              }
              .checkbox-checked {
                color: #007acc;
                font-weight: bold;
              }
              .signature-section {
                border: 2px solid #333;
                padding: 20px;
                margin: 30px 0;
                min-height: 100px;
              }
              .signature-image {
                max-width: 200px;
                max-height: 80px;
                border: 1px solid #ccc;
              }
              .status-complete {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-left: 4px solid #28a745;
                margin: 20px 0;
              }
              @media print {
                body { margin: 20px; }
                .page-break { page-break-after: always; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PATIENT ENROLLMENT FORM</h1>
              <h2>Treatment Center Registration - COMPLETED</h2>
              <p><strong>Patient ID:</strong> ${patientId || 'NEW'}</p>
              <p><strong>Submission Method:</strong> ${patient.submissionMethod.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Completed Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            ${submissionReady ? `
              <div class="status-complete">
                <h3>✅ ENROLLMENT COMPLETED</h3>
                <p>This form has been completed and submitted for processing. All required information and signatures have been collected.</p>
              </div>
            ` : ''}

            <div class="section">
              <div class="section-title">PATIENT INFORMATION</div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">First Name:</div>
                  <div class="field-value">${patient.firstName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Middle Name:</div>
                  <div class="field-value">${patient.middleName || 'N/A'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Last Name:</div>
                  <div class="field-value">${patient.lastName}</div>
                </div>
              </div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Date of Birth:</div>
                  <div class="field-value">${patient.dateOfBirth}</div>
                </div>
                <div class="field">
                  <div class="field-label">SSN:</div>
                  <div class="field-value">***-**-${patient.ssn.slice(-4)}</div>
                </div>
              </div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Email:</div>
                  <div class="field-value">${patient.email}</div>
                </div>
                <div class="field">
                  <div class="field-label">Phone:</div>
                  <div class="field-value">${patient.phone}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">ADDRESS INFORMATION</div>
              <div class="field">
                <div class="field-label">Address:</div>
                <div class="field-value">${patient.address}</div>
              </div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">City:</div>
                  <div class="field-value">${patient.city}</div>
                </div>
                <div class="field">
                  <div class="field-label">State:</div>
                  <div class="field-value">${patient.state}</div>
                </div>
                <div class="field">
                  <div class="field-label">ZIP:</div>
                  <div class="field-value">${patient.zipCode}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">EMERGENCY CONTACT</div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Name:</div>
                  <div class="field-value">${patient.emergencyContactName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Phone:</div>
                  <div class="field-value">${patient.emergencyContactPhone}</div>
                </div>
              </div>
            </div>

            <div class="page-break"></div>

            <div class="section">
              <div class="section-title">MEDICAL INFORMATION</div>
              <div class="field">
                <div class="field-label">Primary Physician:</div>
                <div class="field-value">${patient.primaryPhysician || 'Not specified'}</div>
              </div>
              <div class="field">
                <div class="field-label">Medical History:</div>
                <div class="field-value">${patient.medicalHistory || 'None reported'}</div>
              </div>
              <div class="field">
                <div class="field-label">Current Medications:</div>
                <div class="field-value">${patient.currentMedications || 'None reported'}</div>
              </div>
              <div class="field">
                <div class="field-label">Allergies:</div>
                <div class="field-value">${patient.allergies || 'None reported'}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">INSURANCE INFORMATION</div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Provider:</div>
                  <div class="field-value">${patient.insuranceProvider || 'Not provided'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Policy Number:</div>
                  <div class="field-value">${patient.insurancePolicyNumber || 'Not provided'}</div>
                </div>
              </div>
              <div class="field">
                <div class="field-label">Group Number:</div>
                <div class="field-value">${patient.insuranceGroupNumber || 'Not provided'}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">TREATMENT INFORMATION</div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Treatment Type:</div>
                  <div class="field-value">${patient.treatmentType || 'To be determined'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Referral Source:</div>
                  <div class="field-value">${patient.referralSource || 'Not specified'}</div>
                </div>
              </div>
              ${patient.admissionDate ? `
                <div class="field">
                  <div class="field-label">Admission Date:</div>
                  <div class="field-value">${patient.admissionDate}</div>
                </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">CONSENT AND AUTHORIZATION</div>
              <p class="checkbox-checked">☑ Consent to Treatment: ${patient.consentToTreatment ? 'AGREED' : 'NOT AGREED'}</p>
              <p class="checkbox-checked">☑ HIPAA Authorization: ${patient.hipaaAuthorization ? 'AGREED' : 'NOT AGREED'}</p>
              <p class="checkbox-checked">☑ Financial Responsibility: ${patient.financialResponsibility ? 'AGREED' : 'NOT AGREED'}</p>
            </div>

            ${includeSignatures ? `
              <div class="signature-section">
                <h3>PATIENT SIGNATURE</h3>
                <p><strong>Signature Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Digital Signature Captured:</strong> Yes</p>
              </div>

              ${patient.providerConsentDate ? `
                <div class="signature-section">
                  <h3>PROVIDER AUTHORIZATION</h3>
                  <p><strong>Authorized By:</strong> ${patient.providerConsentBy}</p>
                  <p><strong>Authorization Date:</strong> ${new Date(patient.providerConsentDate).toLocaleDateString()}</p>
                  <p><strong>Digital Signature Captured:</strong> Yes</p>
                </div>
              ` : ''}
            ` : ''}

            <div class="section">
              <div class="section-title">PROCESSING INFORMATION</div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Submission Method:</div>
                  <div class="field-value">${patient.submissionMethod.replace('_', ' ').toUpperCase()}</div>
                </div>
                <div class="field">
                  <div class="field-label">Generated Date:</div>
                  <div class="field-value">${new Date().toLocaleString()}</div>
                </div>
                <div class="field">
                  <div class="field-label">Status:</div>
                  <div class="field-value">${submissionReady ? 'READY FOR REVIEW' : 'IN PROGRESS'}</div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `

        // Convert to PDF
        const pdfData = btoa(unescape(encodeURIComponent(htmlContent)))
        
        // Store in storage
        const fileName = `patient-enrollment-${patient.firstName}-${patient.lastName}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('enrollment-forms')
          .upload(fileName, new Blob([atob(pdfData)], { type: 'application/pdf' }), {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('enrollment-forms')
          .getPublicUrl(fileName)

        return new Response(
          JSON.stringify({
            success: true,
            pdf_url: publicUrl,
            pdf_content: pdfData,
            file_name: fileName
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'generate_final_document': {
        const { enrollmentId, patientData, collaborationSteps, signers } = data

        console.log('Generating final enrollment document:', enrollmentId)

        // Generate comprehensive final document with all collaboration data
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Final Patient Enrollment - ${patientData.firstName} ${patientData.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.4; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .status-approved { background: #d4edda; color: #155724; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; }
              .section { margin: 25px 0; page-break-inside: avoid; }
              .section-title { background: #f5f5f5; padding: 10px; font-weight: bold; border-left: 4px solid #28a745; margin-bottom: 15px; }
              .field-group { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 15px; }
              .field { flex: 1; min-width: 200px; margin-bottom: 10px; }
              .field-label { font-weight: bold; margin-bottom: 3px; }
              .field-value { padding: 5px; border-bottom: 1px solid #333; min-height: 20px; }
              .workflow-step { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #28a745; }
              .step-completed { color: #155724; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏥 PATIENT ENROLLMENT - APPROVED</h1>
              <h2>${patientData.firstName} ${patientData.lastName}</h2>
              <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="status-approved">
              <h3>✅ ENROLLMENT SUCCESSFULLY COMPLETED</h3>
              <p>All required steps have been completed by the healthcare team. Patient is approved for enrollment.</p>
            </div>

            <!-- Include all patient data sections here -->
            <div class="section">
              <div class="section-title">WORKFLOW COMPLETION SUMMARY</div>
              ${collaborationSteps?.map(step => `
                <div class="workflow-step">
                  <div class="step-completed">${step.title} - COMPLETED</div>
                  <p><strong>Assigned to:</strong> ${step.assignedRole}</p>
                  <p><strong>Completed:</strong> ${step.completedAt ? new Date(step.completedAt).toLocaleString() : 'Pending'}</p>
                  ${step.notes ? `<p><strong>Notes:</strong> ${step.notes}</p>` : ''}
                </div>
              `).join('') || ''}
            </div>

            <div class="section">
              <div class="section-title">TEAM SIGNATURES & APPROVALS</div>
              ${signers?.map(signer => `
                <div class="workflow-step">
                  <p><strong>Role:</strong> ${signer.role}</p>
                  <p><strong>Name:</strong> ${signer.name || 'Pending'}</p>
                  <p><strong>Status:</strong> ${signer.status}</p>
                </div>
              `).join('') || ''}
            </div>

            <div class="section">
              <div class="section-title">FINAL AUTHORIZATION</div>
              <p><strong>Document Generated:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>System Status:</strong> ENROLLMENT APPROVED</p>
              <p><strong>Next Steps:</strong> Patient may proceed with treatment planning</p>
            </div>
          </body>
          </html>
        `

        const pdfData = btoa(unescape(encodeURIComponent(htmlContent)))
        
        const fileName = `patient-enrollment-final-${enrollmentId}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('enrollment-forms')
          .upload(fileName, new Blob([atob(pdfData)], { type: 'application/pdf' }), {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('enrollment-forms')
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
    console.error('Patient enrollment PDF error:', error)
    
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