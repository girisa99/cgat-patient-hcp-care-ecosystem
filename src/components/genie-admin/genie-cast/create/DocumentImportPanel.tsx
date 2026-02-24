/**
 * DocumentImportPanel — Phase 4B: Document Import UI for CREATE flow
 *
 * Wires the existing edge functions into a usable UI:
 * - document-processor: PDF, DOCX, XLSX parsing + medical data extraction
 * - azure-form-recognizer: OCR for scanned documents + forms
 * - crawl-relevant-content: URL import via Firecrawl
 *
 * When a document is imported, the extracted text is passed to the
 * script generation pipeline as source material.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  FileText,
  Link,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Globe,
  FileImage,
  Music,
  Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────────────────────────

type ImportSource = 'file' | 'url';

interface ImportResult {
  id: string;
  source: ImportSource;
  filename: string;
  extractedText: string;
  wordCount: number;
  importedAt: string;
  metadata?: Record<string, any>;
}

interface DocumentImportPanelProps {
  /** Called with extracted text when import succeeds */
  onImportComplete?: (text: string, metadata: Record<string, any>) => void;
  /** Compact mode for inline rendering */
  compact?: boolean;
  className?: string;
}

// ── Supported formats ──────────────────────────────────────────────────────

const SUPPORTED_FORMATS = [
  { ext: '.pdf', label: 'PDF', icon: FileText, mime: 'application/pdf' },
  { ext: '.docx', label: 'DOCX', icon: FileText, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { ext: '.pptx', label: 'PPTX', icon: FileText, mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { ext: '.xlsx', label: 'XLSX', icon: FileText, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { ext: '.txt', label: 'TXT', icon: FileText, mime: 'text/plain' },
  { ext: '.mp3', label: 'Audio', icon: Music, mime: 'audio/*' },
  { ext: '.mp4', label: 'Video', icon: Video, mime: 'video/*' },
  { ext: '.png', label: 'Image', icon: FileImage, mime: 'image/*' },
];

const ACCEPT_STRING = SUPPORTED_FORMATS.map(f => f.mime).join(',');

// ── Component ──────────────────────────────────────────────────────────────

export const DocumentImportPanel: React.FC<DocumentImportPanelProps> = ({
  onImportComplete,
  compact = false,
  className,
}) => {
  const [activeSource, setActiveSource] = useState<ImportSource>('file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedFiles, setImportedFiles] = useState<ImportResult[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File upload handler ────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      // Determine processing route
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');

      let extractedText = '';
      let metadata: Record<string, any> = { source: 'file', filename: file.name, size: file.size };

      if (isImage) {
        // Route to azure-form-recognizer for OCR
        setProgress(30);
        const base64 = await fileToBase64(file);
        const { data, error: fnError } = await supabase.functions.invoke('azure-form-recognizer', {
          body: { image: base64, model: 'prebuilt-read' },
        });
        if (fnError) throw new Error(`OCR failed: ${fnError.message}`);
        extractedText = data?.content || data?.text || '';
        metadata = { ...metadata, ocrProvider: 'azure-form-recognizer', model: 'prebuilt-read' };
      } else if (isAudio || isVideo) {
        // For audio/video, signal that transcription is needed
        toast.info('Audio/video will be transcribed during script generation');
        extractedText = `[Audio/video file: ${file.name} — will be transcribed via Whisper during PRODUCE step]`;
        metadata = { ...metadata, requiresTranscription: true, mediaType: isAudio ? 'audio' : 'video' };
      } else {
        // Route to document-processor for text extraction
        setProgress(30);
        const base64 = await fileToBase64(file);
        const { data, error: fnError } = await supabase.functions.invoke('document-processor', {
          body: { document: base64, filename: file.name, mimeType: file.type },
        });
        if (fnError) throw new Error(`Document processing failed: ${fnError.message}`);
        extractedText = data?.text || data?.content || data?.extractedContent || '';
        metadata = { ...metadata, processor: 'document-processor', pages: data?.pages };
      }

      setProgress(80);

      const result: ImportResult = {
        id: `import-${Date.now()}`,
        source: 'file',
        filename: file.name,
        extractedText,
        wordCount: extractedText.split(/\s+/).filter(Boolean).length,
        importedAt: new Date().toISOString(),
        metadata,
      };

      setImportedFiles(prev => [...prev, result]);
      setProgress(100);
      onImportComplete?.(extractedText, metadata);
      toast.success(`Imported: ${file.name} (${result.wordCount} words)`);
    } catch (err: any) {
      setError(err.message || 'Import failed');
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [onImportComplete]);

  // ── URL import handler ─────────────────────────────────────────────────

  const handleUrlImport = useCallback(async () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      setProgress(30);
      const { data, error: fnError } = await supabase.functions.invoke('crawl-relevant-content', {
        body: {
          urls: [urlInput.trim()],
          topic: 'content extraction for script generation',
          agentType: 'content_extractor',
          agentPurpose: 'Extract text content for video script generation',
          maxPages: 1,
        },
      });
      if (fnError) throw new Error(`URL import failed: ${fnError.message}`);

      setProgress(80);

      const crawledItems = data?.results || data?.content || [];
      const extractedText = Array.isArray(crawledItems)
        ? crawledItems.map((item: any) => item.markdown || item.content || item.text || '').join('\n\n')
        : typeof data === 'string' ? data : JSON.stringify(data);

      const metadata = { source: 'url', url: urlInput.trim(), provider: 'firecrawl' };

      const result: ImportResult = {
        id: `import-${Date.now()}`,
        source: 'url',
        filename: new URL(urlInput.trim()).hostname,
        extractedText,
        wordCount: extractedText.split(/\s+/).filter(Boolean).length,
        importedAt: new Date().toISOString(),
        metadata,
      };

      setImportedFiles(prev => [...prev, result]);
      setProgress(100);
      setUrlInput('');
      onImportComplete?.(extractedText, metadata);
      toast.success(`Imported from URL: ${result.wordCount} words`);
    } catch (err: any) {
      setError(err.message || 'URL import failed');
      toast.error(`URL import failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [urlInput, onImportComplete]);

  // ── Drop zone handler ──────────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // ── Remove import ──────────────────────────────────────────────────────

  const removeImport = useCallback((id: string) => {
    setImportedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  return (
    <Card className={cn(compact && 'border-dashed', className)}>
      <CardHeader className={cn('pb-2', compact && 'pb-1')}>
        <CardTitle className={cn('flex items-center gap-2', compact ? 'text-sm' : 'text-base')}>
          <Upload className="w-4 h-4 text-primary" />
          Import Source Material
        </CardTitle>
        {!compact && (
          <CardDescription className="text-xs">
            Upload documents, paste URLs, or import media — extracted content feeds into script generation
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Source toggle */}
        <div className="flex gap-1.5">
          <Button
            variant={activeSource === 'file' ? 'default' : 'outline'}
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setActiveSource('file')}
          >
            <FileText className="w-3 h-3" /> File Upload
          </Button>
          <Button
            variant={activeSource === 'url' ? 'default' : 'outline'}
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setActiveSource('url')}
          >
            <Globe className="w-3 h-3" /> URL Import
          </Button>
        </div>

        {/* File upload zone */}
        {activeSource === 'file' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium">Drop a file here or click to upload</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              PDF, DOCX, PPTX, XLSX, TXT, images, audio, video
            </p>
          </div>
        )}

        {/* URL input */}
        {activeSource === 'url' && (
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article..."
                className="h-9 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
              />
            </div>
            <Button
              size="sm"
              disabled={isProcessing || !urlInput.trim()}
              onClick={handleUrlImport}
              className="gap-1.5"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />}
              Import
            </Button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">Processing document...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-red-50/50 dark:bg-red-900/10 border border-red-200/30 text-xs text-red-600">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Imported files list */}
        {importedFiles.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">
              Imported ({importedFiles.length})
            </p>
            {importedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="flex-1 truncate">{file.filename}</span>
                <Badge variant="outline" className="text-[9px]">{file.wordCount} words</Badge>
                <Badge variant="outline" className="text-[9px]">{file.source}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => removeImport(file.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default DocumentImportPanel;
