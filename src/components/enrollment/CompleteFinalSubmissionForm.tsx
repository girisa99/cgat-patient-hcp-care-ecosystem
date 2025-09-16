/**
 * COMPLETE FINAL SUBMISSION FORM
 * All 23 fields from online form
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  FileText, 
  Shield, 
  AlertCircle,
  Clock,
  Send,
  User,
  FileCheck
} from 'lucide-react';
import { SignatureCapture } from '@/components/signature/SignatureCapture';
import type { CompleteFinalSubmission } from '@/types/completeEnrollmentMapping';

interface CompleteFinalSubmissionFormProps {
  formData: CompleteFinalSubmission;
  updateFormData: (field: keyof CompleteFinalSubmission, value: any) => void;
  readOnly?: boolean;
  onSubmit?: () => void;
}

export const CompleteFinalSubmissionForm: React.FC<CompleteFinalSubmissionFormProps> = ({
  formData,
  updateFormData,
  readOnly = false,
  onSubmit
}) => {
  const allReviewsComplete = 
    formData.patientInformationReviewed &&
    formData.providerInformationVerified &&
    formData.insuranceInformationConfirmed &&
    formData.clinicalInformationValidated &&
    formData.treatmentPlanApproved;

  const allConsentsComplete = 
    formData.consentToTreatment &&
    formData.hipaaAuthorizationSigned &&
    formData.financialResponsibilityAccepted;

  const allSignaturesComplete = 
    formData.patientSignature &&
    formData.patientSignatureDate &&
    formData.providerSignature &&
    formData.providerSignatureDate;

  const canSubmit = allReviewsComplete && allConsentsComplete && allSignaturesComplete;

  return (
    <div className="space-y-6">
      {/* Review & Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Review & Verification
            {allReviewsComplete && (
              <Badge variant="secondary" className="ml-auto">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="patientInformationReviewed"
                checked={formData.patientInformationReviewed}
                onCheckedChange={(checked) => updateFormData('patientInformationReviewed', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="patientInformationReviewed" className="text-sm font-medium">
                Patient information has been reviewed and verified for accuracy *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="providerInformationVerified"
                checked={formData.providerInformationVerified}
                onCheckedChange={(checked) => updateFormData('providerInformationVerified', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="providerInformationVerified" className="text-sm font-medium">
                Provider and treatment center information has been verified *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="insuranceInformationConfirmed"
                checked={formData.insuranceInformationConfirmed}
                onCheckedChange={(checked) => updateFormData('insuranceInformationConfirmed', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="insuranceInformationConfirmed" className="text-sm font-medium">
                Insurance information has been confirmed and benefits verified *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="clinicalInformationValidated"
                checked={formData.clinicalInformationValidated}
                onCheckedChange={(checked) => updateFormData('clinicalInformationValidated', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="clinicalInformationValidated" className="text-sm font-medium">
                Clinical and treatment information has been validated *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="treatmentPlanApproved"
                checked={formData.treatmentPlanApproved}
                onCheckedChange={(checked) => updateFormData('treatmentPlanApproved', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="treatmentPlanApproved" className="text-sm font-medium">
                Treatment plan has been approved by the medical team *
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consents & Authorizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consents & Authorizations
            {allConsentsComplete && (
              <Badge variant="secondary" className="ml-auto">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentToTreatment"
                checked={formData.consentToTreatment}
                onCheckedChange={(checked) => updateFormData('consentToTreatment', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="consentToTreatment" className="text-sm font-medium">
                Consent to treatment has been obtained *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hipaaAuthorizationSigned"
                checked={formData.hipaaAuthorizationSigned}
                onCheckedChange={(checked) => updateFormData('hipaaAuthorizationSigned', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="hipaaAuthorizationSigned" className="text-sm font-medium">
                HIPAA authorization has been signed *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="financialResponsibilityAccepted"
                checked={formData.financialResponsibilityAccepted}
                onCheckedChange={(checked) => updateFormData('financialResponsibilityAccepted', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="financialResponsibilityAccepted" className="text-sm font-medium">
                Financial responsibility has been accepted *
              </Label>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Optional Consents</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="communicationConsentProvided"
                  checked={formData.communicationConsentProvided || false}
                  onCheckedChange={(checked) => updateFormData('communicationConsentProvided', checked)}
                  disabled={readOnly}
                />
                <Label htmlFor="communicationConsentProvided" className="text-sm">
                  Communication consent for appointment reminders and updates
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketingConsentGiven"
                  checked={formData.marketingConsentGiven || false}
                  onCheckedChange={(checked) => updateFormData('marketingConsentGiven', checked)}
                  disabled={readOnly}
                />
                <Label htmlFor="marketingConsentGiven" className="text-sm">
                  Marketing communications consent
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Required Signatures
            {allSignaturesComplete && (
              <Badge variant="secondary" className="ml-auto">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Signature */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Patient Signature *</Label>
            <SignatureCapture
              title="Patient Signature"
              onSignatureChange={(signature) => updateFormData('patientSignature', signature)}
              disabled={readOnly}
              value={formData.patientSignature}
            />
            <div>
              <Label htmlFor="patientSignatureDate">Signature Date *</Label>
              <Input
                id="patientSignatureDate"
                type="date"
                value={formData.patientSignatureDate}
                onChange={(e) => updateFormData('patientSignatureDate', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <Separator />

          {/* Provider Signature */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Provider Signature *</Label>
            <SignatureCapture
              title="Provider Signature"
              onSignatureChange={(signature) => updateFormData('providerSignature', signature)}
              disabled={readOnly}
              value={formData.providerSignature}
            />
            <div>
              <Label htmlFor="providerSignatureDate">Signature Date *</Label>
              <Input
                id="providerSignatureDate"
                type="date"
                value={formData.providerSignatureDate}
                onChange={(e) => updateFormData('providerSignatureDate', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <Separator />

          {/* Witness Signature (Optional) */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Witness Signature (Optional)</Label>
            <SignatureCapture
              title="Witness Signature"
              onSignatureChange={(signature) => updateFormData('witnessSignature', signature)}
              disabled={readOnly}
              value={formData.witnessSignature}
            />
            <div>
              <Label htmlFor="witnessSignatureDate">Witness Signature Date</Label>
              <Input
                id="witnessSignatureDate"
                type="date"
                value={formData.witnessSignatureDate || ''}
                onChange={(e) => updateFormData('witnessSignatureDate', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Submission Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submissionDate">Submission Date *</Label>
              <Input
                id="submissionDate"
                type="date"
                value={formData.submissionDate}
                onChange={(e) => updateFormData('submissionDate', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="submittedBy">Submitted By *</Label>
              <Input
                id="submittedBy"
                value={formData.submittedBy}
                onChange={(e) => updateFormData('submittedBy', e.target.value)}
                placeholder="Name of person submitting"
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submissionMethod">Submission Method *</Label>
              <Select 
                value={formData.submissionMethod} 
                onValueChange={(value) => updateFormData('submissionMethod', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Portal</SelectItem>
                  <SelectItem value="fax">Fax</SelectItem>
                  <SelectItem value="mail">Mail</SelectItem>
                  <SelectItem value="portal">Provider Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="confirmationNumber">Confirmation Number</Label>
              <Input
                id="confirmationNumber"
                value={formData.confirmationNumber || ''}
                onChange={(e) => updateFormData('confirmationNumber', e.target.value)}
                placeholder="Auto-generated on submission"
                disabled={readOnly}
                readOnly
              />
            </div>
          </div>

          <Separator />

          {/* Additional Processing Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Additional Processing Options</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgentProcessingRequested"
                checked={formData.urgentProcessingRequested || false}
                onCheckedChange={(checked) => updateFormData('urgentProcessingRequested', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="urgentProcessingRequested">
                Request urgent processing
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={formData.followUpRequired || false}
                onCheckedChange={(checked) => updateFormData('followUpRequired', checked)}
                disabled={readOnly}
              />
              <Label htmlFor="followUpRequired">
                Follow-up required after submission
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions || ''}
              onChange={(e) => updateFormData('specialInstructions', e.target.value)}
              placeholder="Any special handling or processing instructions"
              disabled={readOnly}
            />
          </div>

          <div>
            <Label htmlFor="notesForProcessing">Notes for Processing Team</Label>
            <Textarea
              id="notesForProcessing"
              value={formData.notesForProcessing || ''}
              onChange={(e) => updateFormData('notesForProcessing', e.target.value)}
              placeholder="Internal notes for the processing team"
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Submission Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Review & Verification</span>
              {allReviewsComplete ? (
                <Badge variant="secondary">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Consents & Authorizations</span>
              {allConsentsComplete ? (
                <Badge variant="secondary">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Required Signatures</span>
              {allSignaturesComplete ? (
                <Badge variant="secondary">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              )}
            </div>

            <Separator className="my-4" />

            {!readOnly && (
              <Button 
                className="w-full" 
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                {canSubmit ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Enrollment Application
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Complete All Required Sections to Submit
                  </>
                )}
              </Button>
            )}

            {canSubmit && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                By submitting this form, you confirm that all information provided is accurate and complete.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Default empty data helper
export const createEmptyCompleteFinalSubmissionData = (): CompleteFinalSubmission => ({
  patientInformationReviewed: false,
  providerInformationVerified: false,
  insuranceInformationConfirmed: false,
  clinicalInformationValidated: false,
  treatmentPlanApproved: false,
  consentToTreatment: false,
  hipaaAuthorizationSigned: false,
  financialResponsibilityAccepted: false,
  communicationConsentProvided: false,
  marketingConsentGiven: false,
  patientSignature: '',
  patientSignatureDate: '',
  providerSignature: '',
  providerSignatureDate: '',
  witnessSignature: '',
  witnessSignatureDate: '',
  submissionDate: new Date().toISOString().split('T')[0],
  submittedBy: '',
  submissionMethod: 'online',
  confirmationNumber: '',
  specialInstructions: '',
  urgentProcessingRequested: false,
  followUpRequired: false,
  notesForProcessing: ''
});