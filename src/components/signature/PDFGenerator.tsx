/**
 * PDF GENERATOR COMPONENT
 * Converts credit application to PDF with signatures
 */
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

interface PDFGeneratorProps {
  applicationData: any;
  signatures: any[];
  onGeneratePDF: () => Promise<string>; // Returns PDF URL
  onDownload?: (pdfUrl: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  applicationData,
  signatures,
  onGeneratePDF,
  onDownload,
  loading = false,
  error = null
}) => {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      const url = await onGeneratePDF();
      setPdfUrl(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl && onDownload) {
      onDownload(pdfUrl);
    } else if (pdfUrl) {
      // Default download behavior
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `credit-application-${applicationData?.id || 'draft'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const allSignaturesCompleted = signatures.every(sig => sig.status === 'signed');
  const hasRequiredData = applicationData && Object.keys(applicationData).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium">PDF Document Generation</h3>
            <p className="text-sm text-muted-foreground">
              Generate final PDF with all signatures and application data
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {allSignaturesCompleted && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready for PDF
            </Badge>
          )}
          
          {!allSignaturesCompleted && (
            <Badge variant="secondary">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Signatures Pending
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {!hasRequiredData && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Application data is incomplete. Please ensure all required fields are filled before generating PDF.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <h4 className="font-medium mb-2">PDF will include:</h4>
          <ul className="space-y-1">
            <li>• Complete application information</li>
            <li>• All collected signatures with timestamps</li>
            <li>• Terms and conditions acceptance</li>
            <li>• Uploaded supporting documents</li>
            <li>• Audit trail and submission details</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePDF}
            disabled={!hasRequiredData || generating || loading}
            className="flex items-center gap-2"
          >
            {(generating || loading) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>

          {pdfUrl && (
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>

        {pdfUrl && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              PDF generated successfully! You can download it using the button above.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {pdfUrl && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2">PDF Preview</h4>
          <iframe
            src={pdfUrl}
            className="w-full h-96 border rounded"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
};