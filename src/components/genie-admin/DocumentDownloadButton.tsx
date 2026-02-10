/**
 * Document Download Button Component
 * 
 * Provides quick access to download ecosystem documentation.
 * Used in Production Hub, Command Center, and Governance panels.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileJson, Loader2, Database, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import {
  downloadEcosystemMatrix,
  downloadProviderMatrix,
  downloadEcosystemJSON,
  downloadEcosystemMarkdown,
} from '@/services/documentDownloadService';

interface DocumentDownloadButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const DocumentDownloadButton: React.FC<DocumentDownloadButtonProps> = ({
  variant = 'outline',
  size = 'sm',
  className,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (
    downloadFn: () => Promise<void> | void,
    label: string
  ) => {
    setIsDownloading(true);
    try {
      await downloadFn();
      toast.success(`Downloaded: ${label}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Docs
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Ecosystem Documentation
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Complete Matrix */}
        <DropdownMenuItem
          onClick={() => handleDownload(downloadEcosystemMatrix, 'Ecosystem Matrix')}
          className="gap-2"
        >
          <Database className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">Complete Ecosystem Matrix</span>
            <span className="text-xs text-muted-foreground">
              21 Categories, 206 Pipelines, 19 Providers
            </span>
          </div>
        </DropdownMenuItem>
        
        {/* Provider Matrix */}
        <DropdownMenuItem
          onClick={() => handleDownload(downloadProviderMatrix, 'Provider Matrix')}
          className="gap-2"
        >
          <Cpu className="h-4 w-4 text-purple-500" />
          <div className="flex flex-col">
            <span className="font-medium">AI Provider Matrix</span>
            <span className="text-xs text-muted-foreground">
              19 Providers, 7 Zones, Fallback Chains
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Quick Exports
        </DropdownMenuLabel>
        
        {/* Markdown Summary */}
        <DropdownMenuItem
          onClick={() => handleDownload(downloadEcosystemMarkdown, 'Ecosystem Summary')}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          <span>Ecosystem Summary (.md)</span>
        </DropdownMenuItem>
        
        {/* JSON Export */}
        <DropdownMenuItem
          onClick={() => handleDownload(downloadEcosystemJSON, 'Ecosystem JSON')}
          className="gap-2"
        >
          <FileJson className="h-4 w-4" />
          <span>Ecosystem Data (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DocumentDownloadButton;
