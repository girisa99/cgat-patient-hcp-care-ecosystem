/**
 * Document Upload Zone - Spark-style drag-and-drop upload
 * Auto-detects document type from filename/content
 */

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Loader2,
  Sparkles,
  CloudUpload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentTypeConfig } from '@/config/documentTypes';

interface DocumentUploadZoneProps {
  documentConfig: DocumentTypeConfig;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export function DocumentUploadZone({
  documentConfig,
  onFileUpload,
  isProcessing
}: DocumentUploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.heic', '.heif', '.bmp', '.gif'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/dicom': ['.dcm', '.dicom'],
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <Image className="h-8 w-8" />;
    if (mimeType.includes('pdf')) return <FileText className="h-8 w-8" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-8 w-8" />;
    }
    return <FileText className="h-8 w-8" />;
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 border-2 border-dashed",
        isDragActive && "border-primary bg-primary/5 scale-[1.02]",
        isDragAccept && "border-green-500 bg-green-50 dark:bg-green-950/20",
        isDragReject && "border-destructive bg-destructive/5",
        !isDragActive && "hover:border-primary/50 hover:bg-muted/30",
        isProcessing && "pointer-events-none opacity-70"
      )}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-50" />
      
      {/* Sparkle decorations */}
      <div className="absolute top-4 right-4 text-primary/30">
        <Sparkles className="h-6 w-6 animate-pulse" />
      </div>
      <div className="absolute bottom-4 left-4 text-primary/20">
        <Sparkles className="h-4 w-4 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <CardContent className="p-8 relative z-10">
        <div 
          {...getRootProps()} 
          className="flex flex-col items-center justify-center gap-4 cursor-pointer py-8"
        >
          <input {...getInputProps()} />
          
          {/* Upload Icon */}
          <div className={cn(
            "p-6 rounded-full transition-all duration-300",
            isDragActive ? "bg-primary/20 scale-110" : "bg-muted",
            isProcessing && "animate-pulse"
          )}>
            {isProcessing ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            ) : (
              <CloudUpload className={cn(
                "h-12 w-12 transition-colors",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
            )}
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h3 className={cn(
              "text-lg font-semibold transition-colors",
              isDragActive ? "text-primary" : "text-foreground"
            )}>
              {isProcessing ? (
                "Processing document..."
              ) : isDragActive ? (
                "Drop to upload"
              ) : (
                "Drop your document here"
              )}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {isProcessing ? (
                "Auto-detecting document type and extracting fields..."
              ) : (
                <>
                  or <span className="text-primary font-medium">click to browse</span>
                  <br />
                  Supports PDF, images, Excel, and DICOM files
                </>
              )}
            </p>
          </div>

          {/* Document Type Badge */}
          <Badge variant="secondary" className="mt-2 gap-2">
            <span>{documentConfig.icon}</span>
            {documentConfig.title}
          </Badge>

          {/* Auto-detect hint */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>AI auto-detects document type, models, and field mappings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentUploadZone;
