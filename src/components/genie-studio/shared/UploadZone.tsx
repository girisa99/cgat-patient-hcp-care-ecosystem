/**
 * Upload Zone Component
 * Reusable file upload area with drag-and-drop support
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DetectedFile } from './types';

interface UploadZoneProps {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  uploadedFiles: DetectedFile[];
  onRemoveFile: (index: number) => void;
  acceptedTypes: string;
  isImage?: boolean;
  isMultiple?: boolean;
  className?: string;
}

export function UploadZone({ 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  uploadedFiles, 
  onRemoveFile, 
  acceptedTypes,
  isImage,
  isMultiple,
  className,
}: UploadZoneProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border hover:border-primary/50",
          uploadedFiles.length > 0 && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
        )}
      >
        <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            isDragActive ? "bg-primary/10" : "bg-secondary"
          )}>
            <Upload className={cn(
              "h-6 w-6",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium text-sm">
              {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {acceptedTypes} {isMultiple && '(multiple files allowed)'}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {uploadedFiles.map((df, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg border bg-secondary/30"
            >
              {isImage && df.preview ? (
                <img 
                  src={df.preview} 
                  alt={df.file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{df.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(df.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
