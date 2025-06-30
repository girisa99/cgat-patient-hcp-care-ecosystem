
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Edit, FileText, Users, Building, CreditCard, Shield, PenTool } from 'lucide-react';

interface ReviewStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
  onEditStep: (stepIndex: number) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onDataChange, onEditStep }) => {
  const isStepComplete = (stepKey: string, stepData: any): boolean => {
    switch (stepKey) {
      case 'company_info':
        return !!(stepData?.legal_name && stepData?.federal_tax_id && stepData?.legal_address?.street);
      case 'business_classification':
        return !!(stepData?.business_type?.length && stepData?.ownership_type);
      case 'contacts':
        return !!(stepData?.primary_contact?.name && stepData?.primary_contact?.email && stepData?.primary_contact?.phone);
      case 'ownership':
        return !!(stepData?.principal_owners?.length);
      case 'references':
        return !!(stepData?.primary_bank?.name && stepData?.primary_supplier?.name);
      case 'payment_banking':
        return !!(stepData?.bank_name && stepData?.bank_routing_number && stepData?.bank_account_number);
      case 'licenses':
        return true; // Optional step
      case 'documents':
        return !!(stepData?.voided_check && stepData?.resale_tax_exemption_cert);
      case 'authorizations':
        return !!(stepData?.authorized_signature?.name && stepData?.terms_accepted);
      default:
        return false;
    }
  };

  const reviewSections = [
    {
      key: 'company_info',
      title: 'Company Information',
      icon: Building,
      stepIndex: 0,
      data: data.company_info,
      items: [
        { label: 'Legal Name', value: data.company_info?.legal_name },
        { label: 'DBA Name', value: data.company_info?.dba_name || 'Not provided' },
        { label: 'Federal Tax ID', value: data.company_info?.federal_tax_id },
        { label: 'Website', value: data.company_info?.website || 'Not provided' },
        { 
          label: 'Legal Address', 
          value: data.company_info?.legal_address ? 
            `${data.company_info.legal_address.street}, ${data.company_info.legal_address.city}, ${data.company_info.legal_address.state} ${data.company_info.legal_address.zip}` : 
            'Not provided' 
        }
      ]
    },
    {
      key: 'business_classification',
      title: 'Business Classification',
      icon: FileText,
      stepIndex: 1,
      data: data.business_info,
      items: [
        { label: 'Business Types', value: data.business_info?.business_type?.join(', ') || 'Not provided' },
        { label: 'Ownership Type', value: data.business_info?.ownership_type || 'Not provided' },
        { label: 'Years in Business', value: data.business_info?.years_in_business?.toString() || 'Not provided' },
        { label: 'Number of Employees', value: data.business_info?.number_of_employees?.toString() || 'Not provided' }
      ]
    },
    {
      key: 'contacts',
      title: 'Key Contacts',
      icon: Users,
      stepIndex: 2,
      data: data.contacts,
      items: [
        { label: 'Primary Contact', value: data.contacts?.primary_contact?.name || 'Not provided' },
        { label: 'Primary Email', value: data.contacts?.primary_contact?.email || 'Not provided' },
        { label: 'Primary Phone', value: data.contacts?.primary_contact?.phone || 'Not provided' },
        { label: 'Additional Contacts', value: getAdditionalContactsCount(data.contacts) }
      ]
    },
    {
      key: 'ownership',
      title: 'Ownership Structure',
      icon: Shield,
      stepIndex: 3,
      data: data.ownership,
      items: [
        { label: 'Principal Owners', value: `${data.ownership?.principal_owners?.length || 0} owner(s)` },
        { label: 'Controlling Entity', value: data.ownership?.controlling_entity?.name || 'None' },
        { label: 'Bankruptcy History', value: data.ownership?.bankruptcy_history ? 'Yes' : 'No' }
      ]
    },
    {
      key: 'references',
      title: 'Business References',
      icon: FileText,
      stepIndex: 4,
      data: data.references,
      items: [
        { label: 'Primary Bank', value: data.references?.primary_bank?.name || 'Not provided' },
        { label: 'Primary Supplier', value: data.references?.primary_supplier?.name || 'Not provided' },
        { label: 'Technology Provider', value: data.references?.technology_provider?.name || 'Not provided' },
        { label: 'Additional References', value: `${data.references?.additional_references?.length || 0} reference(s)` }
      ]
    },
    {
      key: 'payment_banking',
      title: 'Payment & Banking',
      icon: CreditCard,
      stepIndex: 5,
      data: data.payment_info,
      items: [
        { label: 'ACH Preference', value: data.payment_info?.ach_preference || 'Not provided' },
        { label: 'Bank Name', value: data.payment_info?.bank_name || 'Not provided' },
        { label: 'Routing Number', value: data.payment_info?.bank_routing_number ? '****' + data.payment_info.bank_routing_number.slice(-4) : 'Not provided' },
        { label: 'Statement Delivery', value: data.payment_info?.statement_delivery_preference || 'Not provided' }
      ]
    },
    {
      key: 'licenses',
      title: 'Licenses & Certifications',
      icon: Shield,
      stepIndex: 6,
      data: data.licenses,
      items: [
        { label: 'DEA Number', value: data.licenses?.dea_number || 'Not provided' },
        { label: 'HIN Number', value: data.licenses?.hin_number || 'Not provided' },
        { label: 'Medical License', value: data.licenses?.medical_license || 'Not provided' },
        { label: 'Additional Licenses', value: `${data.licenses?.additional_licenses?.length || 0} license(s)` }
      ]
    },
    {
      key: 'documents',
      title: 'Required Documents',
      icon: FileText,
      stepIndex: 7,
      data: data.documents,
      items: [
        { label: 'Voided Check', value: data.documents?.voided_check ? 'Uploaded' : 'Not uploaded' },
        { label: 'Tax Exemption Cert', value: data.documents?.resale_tax_exemption_cert ? 'Uploaded' : 'Not uploaded' },
        { label: 'DEA Registration', value: data.documents?.dea_registration_copy ? 'Uploaded' : 'Not uploaded' },
        { label: 'Financial Statements', value: data.documents?.financial_statements ? 'Uploaded' : 'Not uploaded' }
      ]
    },
    {
      key: 'authorizations',
      title: 'Authorizations & Signatures',
      icon: PenTool,
      stepIndex: 8,
      data: data.authorizations,
      items: [
        { label: 'Authorized Signatory', value: data.authorizations?.authorized_signature?.name || 'Not provided' },
        { label: 'Signatory Title', value: data.authorizations?.authorized_signature?.title || 'Not provided' },
        { label: 'Terms Accepted', value: data.authorizations?.terms_accepted ? 'Yes' : 'No' },
        { label: 'Personal Guarantor', value: data.authorizations?.guarantor_signature?.name || 'Not provided' }
      ]
    }
  ];

  function getAdditionalContactsCount(contacts: any): string {
    if (!contacts) return '0 additional contacts';
    let count = 0;
    if (contacts.accounts_payable_contact) count++;
    if (contacts.shipping_contact) count++;
    if (contacts.alternate_contact) count++;
    return `${count} additional contact${count !== 1 ? 's' : ''}`;
  }

  const completedSections = reviewSections.filter(section => isStepComplete(section.key, section.data)).length;
  const completionPercentage = Math.round((completedSections / reviewSections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Application Review</span>
          </CardTitle>
          <CardDescription>
            Review your information before submitting your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary">
                {completionPercentage}%
              </div>
              <div>
                <p className="font-medium">Application Complete</p>
                <p className="text-sm text-muted-foreground">
                  {completedSections} of {reviewSections.length} sections completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={completionPercentage >= 80 ? "default" : "secondary"}>
                {completionPercentage >= 80 ? "Ready to Submit" : "Needs Attention"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Reviews */}
      <div className="space-y-4">
        {reviewSections.map((section) => {
          const isComplete = isStepComplete(section.key, section.data);
          const IconComponent = section.icon;
          
          return (
            <Card key={section.key} className={`border-l-4 ${isComplete ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isComplete ? "default" : "secondary"}>
                      {isComplete ? "Complete" : "Incomplete"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditStep(section.stepIndex)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">{item.label}</p>
                      <p className="text-sm">{item.value || 'Not provided'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pre-submission Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Submission Checklist</CardTitle>
          <CardDescription>
            Ensure all requirements are met before submitting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Company information is complete and accurate', checked: isStepComplete('company_info', data.company_info) },
              { label: 'At least one principal owner is listed', checked: isStepComplete('ownership', data.ownership) },
              { label: 'Primary bank and supplier references provided', checked: isStepComplete('references', data.references) },
              { label: 'Banking information is complete', checked: isStepComplete('payment_banking', data.payment_info) },
              { label: 'Required documents are uploaded', checked: isStepComplete('documents', data.documents) },
              { label: 'Terms and conditions are accepted', checked: data.authorizations?.terms_accepted || false }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                {item.checked ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={`text-sm ${item.checked ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">Important Notice</h4>
            <p className="text-sm text-amber-700 mt-1">
              Please review all information carefully. Once submitted, your application will be 
              reviewed by our compliance team. Any missing or incorrect information may delay 
              the approval process. You will receive email updates on your application status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
