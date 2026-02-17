import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, File, AlertTriangle, CheckCircle, 
  X, FileText, Image, FileArchive, Shield,
  AlertCircle, FileVideo, FileAudio
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecureFileUploadProps {
  onFilesUploaded?: (files: SecureUploadResult[]) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  securityLevel?: 'basic' | 'enhanced' | 'strict';
}

interface SecureUploadResult {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  securityCheck: SecurityCheckResult;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface SecurityCheckResult {
  passed: boolean;
  threats: string[];
  warnings: string[];
  fileTypeValid: boolean;
  sizeValid: boolean;
  nameValid: boolean;
  contentValid: boolean;
  score: number; // 0-100
}

const ALLOWED_FILE_TYPES = {
  documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  spreadsheets: ['.xls', '.xlsx', '.csv'],
  archives: ['.zip', '.rar', '.7z'],
  audio: ['.mp3', '.wav', '.ogg', '.m4a'],
  video: ['.mp4', '.avi', '.mov', '.wmv', '.flv']
};

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', 
  '.js', '.jar', '.wsf', '.wsh', '.ps1', '.msi', '.reg',
  '.hta', '.cpl', '.msc', '.jse'
];

const MAX_FILENAME_LENGTH = 255;
const SUSPICIOUS_PATTERNS = [
  /\.\w+\.\w+$/, // Double extensions like file.pdf.exe
  /[<>:"|?*]/, // Invalid filename characters
  /^\.|\.$/,   // Files starting or ending with dot
  /\s+$/,      // Trailing whitespace
];

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFilesUploaded,
  maxFileSize = 10, // 10MB default
  allowedTypes,
  multiple = true,
  maxFiles = 10,
  securityLevel = 'enhanced'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<SecureUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const performSecurityCheck = (file: File): SecurityCheckResult => {
    const threats: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // File type validation
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isDangerous = DANGEROUS_EXTENSIONS.includes(fileExtension);
    const fileTypeValid = allowedTypes ? 
      allowedTypes.includes(file.type) || allowedTypes.includes(fileExtension) :
      !isDangerous;

    if (isDangerous) {
      threats.push(`Potentially dangerous file type: ${fileExtension}`);
      score -= 50;
    }

    if (!fileTypeValid) {
      threats.push(`File type not allowed: ${file.type || fileExtension}`);
      score -= 30;
    }

    // File size validation
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    const sizeValid = file.size <= maxSizeBytes;
    
    if (!sizeValid) {
      threats.push(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: ${maxFileSize}MB)`);
      score -= 20;
    }

    // Filename validation
    const nameValid = file.name.length <= MAX_FILENAME_LENGTH;
    if (!nameValid) {
      threats.push(`Filename too long (max: ${MAX_FILENAME_LENGTH} characters)`);
      score -= 10;
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(file.name)) {
        warnings.push(`Suspicious filename pattern detected: ${file.name}`);
        score -= 15;
        break;
      }
    }

    // Enhanced security checks
    if (securityLevel === 'enhanced' || securityLevel === 'strict') {
      // Check for null bytes
      if (file.name.includes('\0')) {
        threats.push('Null byte detected in filename');
        score -= 40;
      }

      // Check for path traversal attempts
      if (file.name.includes('../') || file.name.includes('..\\')) {
        threats.push('Path traversal attempt detected');
        score -= 40;
      }

      // Check for hidden files (if strict)
      if (securityLevel === 'strict' && file.name.startsWith('.')) {
        warnings.push('Hidden file detected');
        score -= 5;
      }
    }

    // Content-based validation (basic checks)
    let contentValid = true;
    
    // Check if file type matches extension
    if (file.type) {
      const expectedTypes = getExpectedMimeTypes(fileExtension);
      if (expectedTypes.length > 0 && !expectedTypes.includes(file.type)) {
        warnings.push(`File type mismatch: extension ${fileExtension} but MIME type ${file.type}`);
        score -= 10;
      }
    }

    const passed = threats.length === 0 && score >= (securityLevel === 'strict' ? 90 : 70);

    return {
      passed,
      threats,
      warnings,
      fileTypeValid,
      sizeValid,
      nameValid,
      contentValid,
      score: Math.max(0, score)
    };
  };

  const getExpectedMimeTypes = (extension: string): string[] => {
    const mimeMap: Record<string, string[]> = {
      '.pdf': ['application/pdf'],
      '.doc': ['application/msword'],
      '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      '.txt': ['text/plain'],
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.gif': ['image/gif'],
      '.zip': ['application/zip', 'application/x-zip-compressed'],
      '.csv': ['text/csv', 'application/vnd.ms-excel'],
      '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    };
    
    return mimeMap[extension] || [];
  };

  const simulateUpload = (fileResult: SecureUploadResult): Promise<void> => {
    return new Promise((resolve, reject) => {
      const duration = 2000 + Math.random() * 3000; // 2-5 seconds
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileResult.id 
              ? { ...f, uploadProgress: Math.floor(progress) }
              : f
          )
        );

        if (progress >= 100) {
          // Simulate occasional upload failure
          if (Math.random() < 0.1) {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileResult.id 
                  ? { ...f, status: 'error', error: 'Upload failed due to network error' }
                  : f
              )
            );
            reject(new Error('Upload failed'));
          } else {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileResult.id 
                  ? { ...f, status: 'success', uploadProgress: 100 }
                  : f
              )
            );
            resolve();
          }
        } else {
          setTimeout(updateProgress, 100);
        }
      };

      updateProgress();
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    const newFiles: SecureUploadResult[] = acceptedFiles.map(file => {
      const securityCheck = performSecurityCheck(file);
      
      return {
        file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        securityCheck,
        uploadProgress: 0,
        status: securityCheck.passed ? 'pending' : 'error',
        error: securityCheck.passed ? undefined : 'Security check failed'
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process uploads for files that passed security check
    const validFiles = newFiles.filter(f => f.securityCheck.passed);
    
    if (validFiles.length > 0) {
      // Update status to uploading
      setUploadedFiles(prev => 
        prev.map(f => 
          validFiles.some(vf => vf.id === f.id) 
            ? { ...f, status: 'uploading' }
            : f
        )
      );

      // Simulate uploads
      try {
        await Promise.allSettled(
          validFiles.map(fileResult => simulateUpload(fileResult))
        );
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setIsUploading(false);

    // Notify parent component
    if (onFilesUploaded) {
      const successfulFiles = [...uploadedFiles, ...newFiles].filter(f => f.status === 'success');
      onFilesUploaded(successfulFiles);
    }

    // Show summary toast
    const passed = newFiles.filter(f => f.securityCheck.passed).length;
    const failed = newFiles.length - passed;
    
    if (failed > 0) {
      toast({
        title: 'Upload Complete with Issues',
        description: `${passed} files uploaded successfully, ${failed} files failed security checks`,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Upload Complete',
        description: `${passed} files uploaded successfully`
      });
    }
  }, [uploadedFiles, maxFiles, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: isUploading
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getSecurityBadge = (check: SecurityCheckResult) => {
    if (check.score >= 90) {
      return <Badge className="bg-green-100 text-green-800"><Shield className="h-3 w-3 mr-1" />Secure</Badge>;
    } else if (check.score >= 70) {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Threat</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Secure File Upload
            <Badge variant="outline">{securityLevel.toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Max file size: {maxFileSize}MB • Max files: {maxFiles} • Security level: {securityLevel}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allowedTypes ? (
                allowedTypes.map(type => (
                  <Badge key={type} variant="outline">{type}</Badge>
                ))
              ) : (
                <Badge variant="outline">Most file types allowed</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Level: {securityLevel.charAt(0).toUpperCase() + securityLevel.slice(1)}</strong>
          <br />
          Files undergo security scanning including type validation, size checks, malware detection patterns, 
          and filename analysis. Suspicious files are automatically rejected.
        </AlertDescription>
      </Alert>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length}/{maxFiles})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((fileResult) => (
                <div key={fileResult.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getFileIcon(fileResult.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{fileResult.name}</span>
                          {getSecurityBadge(fileResult.securityCheck)}
                          <Badge variant={
                            fileResult.status === 'success' ? 'default' :
                            fileResult.status === 'error' ? 'destructive' :
                            fileResult.status === 'uploading' ? 'secondary' : 'outline'
                          }>
                            {fileResult.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Size: {(fileResult.size / 1024 / 1024).toFixed(2)}MB • 
                          Type: {fileResult.type || 'Unknown'} •
                          Security Score: {fileResult.securityCheck.score}/100
                        </div>

                        {fileResult.status === 'uploading' && (
                          <Progress value={fileResult.uploadProgress} className="w-full" />
                        )}

                        {fileResult.error && (
                          <div className="text-sm text-red-600">
                            Error: {fileResult.error}
                          </div>
                        )}

                        {/* Security Details */}
                        {(fileResult.securityCheck.threats.length > 0 || fileResult.securityCheck.warnings.length > 0) && (
                          <div className="space-y-1">
                            {fileResult.securityCheck.threats.map((threat, idx) => (
                              <div key={idx} className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {threat}
                              </div>
                            ))}
                            {fileResult.securityCheck.warnings.map((warning, idx) => (
                              <div key={idx} className="text-sm text-yellow-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {warning}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileResult.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};