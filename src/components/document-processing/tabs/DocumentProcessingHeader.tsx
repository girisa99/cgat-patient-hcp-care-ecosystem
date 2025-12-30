/**
 * Document Processing Header Component
 * Displays the page title and auto-process toggle
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileSearch, Settings } from 'lucide-react';

interface DocumentProcessingHeaderProps {
  isAutoProcessing: boolean;
  setIsAutoProcessing: (value: boolean) => void;
  onOpenSettings: () => void;
}

export function DocumentProcessingHeader({
  isAutoProcessing,
  setIsAutoProcessing,
  onOpenSettings
}: DocumentProcessingHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileSearch className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Document Processing</h1>
          <p className="text-muted-foreground">Upload, auto-process, and extract data from documents</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-process" className="text-sm">Auto-Process</Label>
          <Switch 
            id="auto-process" 
            checked={isAutoProcessing}
            onCheckedChange={setIsAutoProcessing}
          />
        </div>
        <Button variant="outline" onClick={onOpenSettings}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}

export default DocumentProcessingHeader;
