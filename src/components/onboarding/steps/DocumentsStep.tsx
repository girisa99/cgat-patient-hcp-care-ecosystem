
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Check, Plus, Trash2 } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface DocumentsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ data, onUpdate }) => {
  const updateDocument = (field: string, value: boolean) => {
    onUpdate({
      documents: {
        ...data.documents,
        [field]: value
      }
    });
  };

  const addAdditionalDocument = () => {
    const currentDocs = data.documents?.additional_documents || [];
    onUpdate({
      documents: {
        ...data.documents,
        additional_documents: [
          ...currentDocs,
          { name: '', type: '', uploaded: false, file_path: '' }
        ]
      }
    });
  };

  const updateAdditionalDocument = (index: number, field: string, value: any) => {
    const currentDocs = data.documents?.additional_documents || [];
    const updatedDocs = [...currentDocs];
    updatedDocs[index] = { ...updatedDocs[index], [field]: value };
    onUpdate({
      documents: {
        ...data.documents,
        additional_documents: updatedDocs
      }
    });
  };

  const removeAdditionalDocument = (index: number) => {
    const currentDocs = data.documents?.additional_documents || [];
    onUpdate({
      documents: {
        ...data.documents,
        additional_documents: currentDocs.filter((_, i) => i !== index)
      }
    });
  };

  const requiredDocuments = [
    { key: 'voided_check', label: 'Voided Check', description: 'For ACH setup and payment verification' },
    { key: 'resale_tax_exemption_cert', label: 'Resale Tax Exemption Certificate', description: 'State-issued tax exemption document' },
    { key: 'dea_registration_copy', label: 'DEA Registration Copy', description: 'Current DEA registration certificate' },
    { key: 'state_pharmacy_license_copy', label: 'State Pharmacy License Copy', description: 'Current state pharmacy license' },
    { key: 'medical_license_copy', label: 'Medical License Copy', description: 'Current medical license certificate' },
    { key: 'financial_statements', label: 'Financial Statements', description: 'Most recent financial statements' },
    { key: 'supplier_statements', label: 'Supplier Statements', description: 'Recent statements from current suppliers' }
  ];

  return (
    <div className="space-y-6">
      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {requiredDocuments.map((doc) => (
              <div key={doc.key} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id={doc.key}
                  checked={data.documents?.[doc.key as keyof typeof data.documents] as boolean || false}
                  onCheckedChange={(checked) => updateDocument(doc.key, checked as boolean)}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={doc.key} className="font-medium">{doc.label}</Label>
                    {data.documents?.[doc.key as keyof typeof data.documents] && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="h-8">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8">
                      <FileText className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Additional Documents
            <Button onClick={addAdditionalDocument} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.documents?.additional_documents?.map((doc, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Document {index + 1}</h4>
                <Button
                  onClick={() => removeAdditionalDocument(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`doc_name_${index}`}>Document Name *</Label>
                  <Input
                    id={`doc_name_${index}`}
                    value={doc.name}
                    onChange={(e) => updateAdditionalDocument(index, 'name', e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <Label htmlFor={`doc_type_${index}`}>Document Type *</Label>
                  <Input
                    id={`doc_type_${index}`}
                    value={doc.type}
                    onChange={(e) => updateAdditionalDocument(index, 'type', e.target.value)}
                    placeholder="e.g., Certificate, License, etc."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`doc_uploaded_${index}`}
                  checked={doc.uploaded}
                  onCheckedChange={(checked) => updateAdditionalDocument(index, 'uploaded', checked)}
                />
                <Label htmlFor={`doc_uploaded_${index}`}>Document uploaded</Label>
                {doc.uploaded && <Check className="h-4 w-4 text-green-600" />}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="h-8">
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
                {doc.uploaded && (
                  <Button size="sm" variant="ghost" className="h-8">
                    <FileText className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional documents added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Accepted file formats: PDF, JPG, PNG, DOC, DOCX</p>
            <p>• Maximum file size: 10MB per document</p>
            <p>• Ensure documents are clear and legible</p>
            <p>• All documents must be current and valid</p>
            <p>• Sensitive documents are encrypted and stored securely</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
