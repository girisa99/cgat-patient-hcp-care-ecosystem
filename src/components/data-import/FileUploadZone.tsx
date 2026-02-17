import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileDrop: (files: File[]) => void;
  acceptedTypes: string[];
  multiple?: boolean;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileDrop,
  acceptedTypes,
  multiple = false,
  uploadedFiles,
  onRemoveFile,
  className
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileDrop(acceptedFiles);
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          {isDragActive ? "Drop files here" : "Upload Files"}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-sm text-muted-foreground">
          Supported formats: {acceptedTypes.join(', ')}
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(index)}
                className="p-1 hover:bg-destructive/10 rounded"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};