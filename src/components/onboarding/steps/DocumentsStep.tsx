
import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, X, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

interface DocumentRequirement {
  key: keyof NonNullable<TreatmentCenterOnboarding['documents']>;
  title: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
}

const requiredDocuments: DocumentRequirement[] = [
  {
    key: 'voided_check',
    title: 'Voided Check or Bank Letter',
    description: 'A voided check or official bank letter to verify banking information',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    key: 'dea_registration_copy',
    title: 'DEA Registration Certificate',
    description: 'Copy of current DEA registration certificate',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    key: 'state_pharmacy_license_copy',
    title: 'State Pharmacy License',
    description: 'Copy of current state pharmacy license',
    required: false,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    key: 'medical_license_copy',
    title: 'Medical License',
    description: 'Copy of current medical license (if applicable)',
    required: false,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    key: 'resale_tax_exemption_cert',
    title: 'Resale Tax Exemption Certificate',
    description: 'Valid resale tax exemption certificate',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    key: 'financial_statements',
    title: 'Financial Statements',
    description: 'Recent financial statements or bank statements (last 3 months)',
    required: true,
    acceptedFormats: ['PDF']
  },
  {
    key: 'supplier_statements',
    title: 'Supplier Reference Statements',
    description: 'Statements or letters from current suppliers',
    required: false,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  }
];

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const documents = data.documents || {
    voided_check: false,
    resale_tax_exemption_cert: false,
    dea_registration_copy: false,
    state_pharmacy_license_copy: false,
    medical_license_copy: false,
    financial_statements: false,
    supplier_statements: false,
    additional_documents: []
  };

  const handleFileUpload = async (documentKey: string, file: File) => {
    try {
      // Simulate file upload - in a real app, you'd upload to Supabase Storage or similar
      console.log(`Uploading ${file.name} for ${documentKey}`);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update document status
      const updatedDocuments = {
        ...documents,
        [documentKey]: true
      };

      // Add to additional documents if it's a custom upload
      if (!requiredDocuments.some(doc => doc.key === documentKey)) {
        const newDocument = {
          name: file.name,
          type: documentKey,
          uploaded: true,
          file_path: `/uploads/${file.name}` // Simulated path
        };
        
        updatedDocuments.additional_documents = [
          ...documents.additional_documents,
          newDocument
        ];
      }

      onDataChange({
        ...data,
        documents: updatedDocuments
      });

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (documentKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF, JPG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    handleFileUpload(documentKey, file);
  };

  const removeDocument = (documentKey: string) => {
    const updatedDocuments = {
      ...documents,
      [documentKey]: false
    };

    onDataChange({
      ...data,
      documents: updatedDocuments
    });

    toast({
      title: "Document Removed",
      description: "Document has been removed successfully.",
    });
  };

  const addCustomDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(`custom_${Date.now()}`, file);
      }
    };
    input.click();
  };

  const getUploadedCount = () => {
    return requiredDocuments.filter(doc => documents[doc.key]).length;
  };

  const getRequiredCount = () => {
    return requiredDocuments.filter(doc => doc.required).length;
  };

  return (
    <div className="space-y-6">
      {/* Upload Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Upload Progress</span>
          </CardTitle>
          <CardDescription>
            Upload required documents to complete your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-primary">
                {getUploadedCount()}/{requiredDocuments.length}
              </div>
              <div>
                <p className="text-sm font-medium">Documents Uploaded</p>
                <p className="text-xs text-muted-foreground">
                  {getRequiredCount() - requiredDocuments.filter(doc => doc.required && documents[doc.key]).length} required remaining
                </p>
              </div>
            </div>
            <div className="text-right">
              <Button onClick={addCustomDocument} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Add Custom Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <div className="space-y-4">
        {requiredDocuments.map((docReq) => {
          const isUploaded = documents[docReq.key];
          
          return (
            <Card key={docReq.key} className={`border-l-4 ${isUploaded ? 'border-l-green-500' : docReq.required ? 'border-l-red-500' : 'border-l-gray-300'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isUploaded ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <CardTitle className="text-base flex items-center space-x-2">
                        <span>{docReq.title}</span>
                        {docReq.required && (
                          <span className="text-red-500 text-sm">*</span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {docReq.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUploaded ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(docReq.key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Uploaded</span>
                        </div>
                      </>
                    ) : (
                      <Button
                        onClick={() => fileInputRefs.current[docReq.key]?.click()}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {!isUploaded && (
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    Accepted formats: {docReq.acceptedFormats.join(', ')} • Max size: 10MB
                  </div>
                  <input
                    ref={(el) => (fileInputRefs.current[docReq.key] = el)}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(docReq.key, e)}
                    className="hidden"
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Additional Documents */}
      {documents.additional_documents.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Additional Documents</CardTitle>
              <CardDescription>
                Custom documents you've uploaded
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.additional_documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedDocs = documents.additional_documents.filter((_, i) => i !== index);
                        onDataChange({
                          ...data,
                          documents: {
                            ...documents,
                            additional_documents: updatedDocs
                          }
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Document Upload Guidelines</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Ensure all documents are current and clearly legible</li>
              <li>• Files must be in PDF, JPG, or PNG format</li>
              <li>• Maximum file size is 10MB per document</li>
              <li>• Documents marked with * are required for approval</li>
              <li>• All uploaded documents will be securely stored and encrypted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
