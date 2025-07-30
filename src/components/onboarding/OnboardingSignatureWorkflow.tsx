/**
 * ONBOARDING SIGNATURE WORKFLOW COMPONENT
 * Manages signatures for onboarding forms
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Users, 
  Send, 
  Download, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Building
} from 'lucide-react';
import { SignatureCapture } from '@/components/signature/SignatureCapture';
import { MultiPartySignature, type Signer } from '@/components/signature/MultiPartySignature';
import { PDFGenerator } from '@/components/signature/PDFGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface OnboardingSignatureWorkflowProps {
  onboardingId: string;
  onboardingData: any;
  onComplete?: () => void;
  readOnly?: boolean;
}

interface DocumentSection {
  id: string;
  title: string;
  description: string;
  signers: Signer[];
  status: 'pending' | 'in_progress' | 'completed';
  requiresAuthorization: boolean;
}

export const OnboardingSignatureWorkflow: React.FC<OnboardingSignatureWorkflowProps> = ({
  onboardingId,
  onboardingData,
  onComplete,
  readOnly = false
}) => {
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([]);
  const [primarySignature, setPrimarySignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  useEffect(() => {
    initializeDocumentSections();
  }, [onboardingId, onboardingData]);

  const initializeDocumentSections = () => {
    const sections: DocumentSection[] = [
      {
        id: 'main_application',
        title: 'Main Onboarding Application',
        description: 'Complete treatment center onboarding form with business information',
        signers: [
          {
            id: 'primary_contact',
            name: onboardingData?.primary_contact_name || '',
            email: onboardingData?.primary_contact_email || '',
            role: 'primary_contact',
            order: 1,
            status: 'pending'
          }
        ],
        status: 'pending',
        requiresAuthorization: true
      },
      {
        id: 'credit_application',
        title: 'Credit Application',
        description: 'Separate credit application for financial assessment',
        signers: [
          {
            id: 'financial_officer',
            name: onboardingData?.financial_contact_name || onboardingData?.primary_contact_name || '',
            email: onboardingData?.financial_contact_email || onboardingData?.primary_contact_email || '',
            role: 'financial_officer',
            order: 1,
            status: 'pending'
          }
        ],
        status: 'pending',
        requiresAuthorization: true
      },
      {
        id: 'compliance_documents',
        title: 'Compliance & Authorization',
        description: 'Regulatory compliance and authorization documents',
        signers: [
          {
            id: 'compliance_officer',
            name: onboardingData?.compliance_contact_name || onboardingData?.primary_contact_name || '',
            email: onboardingData?.compliance_contact_email || onboardingData?.primary_contact_email || '',
            role: 'compliance_officer',
            order: 1,
            status: 'pending'
          }
        ],
        status: 'pending',
        requiresAuthorization: true
      }
    ];

    // Add additional signers if they exist
    if (onboardingData?.principal_owners?.length > 0) {
      onboardingData.principal_owners.forEach((owner: any, index: number) => {
        if (owner.name && owner.email) {
          sections[0].signers.push({
            id: `owner_${index}`,
            name: owner.name,
            email: owner.email,
            role: 'principal_owner',
            order: index + 2,
            status: 'pending'
          });
        }
      });
    }

    setDocumentSections(sections);
  };

  const handleSectionSignersChange = (sectionId: string, signers: Signer[]) => {
    setDocumentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, signers }
          : section
      )
    );
  };

  const handleSendForSignatures = async (sectionId: string, signers: Signer[]) => {
    try {
      setLoading(true);

      const section = documentSections.find(s => s.id === sectionId);
      if (!section) return;

      // Generate PDF for this section
      const response = await supabase.functions.invoke('onboarding-pdf-generator', {
        body: {
          action: 'generate_section_pdf',
          data: {
            onboardingId,
            sectionId,
            onboardingData,
            includeSignatures: false
          }
        }
      });

      if (response.error) throw response.error;

      // Send to DocuSign
      const docusignResponse = await supabase.functions.invoke('docusign-integration', {
        body: {
          action: 'send_envelope',
          data: {
            applicationId: onboardingId,
            documentType: sectionId,
            signers: signers,
            documents: [{
              name: section.title,
              content: response.data.pdfContent
            }]
          }
        }
      });

      if (docusignResponse.error) throw docusignResponse.error;

      showSuccess('Signature requests sent successfully');

      // Update section status
      setDocumentSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? { ...s, status: 'in_progress' as const, signers }
            : s
        )
      );

    } catch (error) {
      console.error('Send for signatures error:', error);
      showError('Failed to send signature requests');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCompletePDF = async (): Promise<string> => {
    try {
      setPdfGenerating(true);

      const response = await supabase.functions.invoke('onboarding-pdf-generator', {
        body: {
          action: 'generate_complete_pdf',
          data: {
            onboardingId,
            onboardingData,
            includeSignatures: true,
            sections: documentSections
          }
        }
      });

      if (response.error) throw response.error;

      return response.data.pdf_url;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    } finally {
      setPdfGenerating(false);
    }
  };

  const allSectionsCompleted = documentSections.every(section => 
    section.signers.every(signer => signer.status === 'signed')
  );

  const getSectionStatusBadge = (status: DocumentSection['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Onboarding Signature Workflow</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete the signature process for {onboardingData?.legal_name || 'this treatment center'}
                </p>
              </div>
            </div>
            {allSectionsCompleted && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                All Signatures Complete
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Primary Authorization Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Primary Authorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignatureCapture
            title="Authorized Representative Signature"
            description="I hereby authorize the submission of this onboarding application and certify that all information provided is accurate"
            required={true}
            onSignatureChange={setPrimarySignature}
            value={primarySignature}
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Document Sections */}
      <div className="space-y-4">
        {documentSections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                {getSectionStatusBadge(section.status)}
              </div>
            </CardHeader>
            <CardContent>
              <MultiPartySignature
                applicationId={`${onboardingId}_${section.id}`}
                signers={section.signers}
                onSignersChange={(signers) => handleSectionSignersChange(section.id, signers)}
                currentUserEmail={onboardingData?.primary_contact_email}
                onSubmitForSigning={(signers) => handleSendForSignatures(section.id, signers)}
                readOnly={readOnly || section.status === 'completed'}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complete PDF Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Final Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PDFGenerator
            applicationData={onboardingData}
            signatures={documentSections.flatMap(section => section.signers)}
            onGeneratePDF={handleGenerateCompletePDF}
            loading={pdfGenerating}
          />

          {allSectionsCompleted && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All signatures have been completed! You can now generate the final documentation and proceed with onboarding.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {allSectionsCompleted && onComplete && (
        <div className="flex justify-end gap-2">
          <Button onClick={onComplete} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Complete Onboarding
          </Button>
        </div>
      )}
    </div>
  );
};