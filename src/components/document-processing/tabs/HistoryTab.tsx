/**
 * HistoryTab Component
 * Displays processing history with export functionality
 * Extracted from DocumentProcessing.tsx for maintainability
 */

import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ProcessingHistoryWithExport from '@/components/document-processing/ProcessingHistoryWithExport';
import { ProcessingResult } from '@/hooks/useDocumentProcessingState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HistoryTabProps {
  processingHistory: ProcessingResult[];
  setProcessingHistory: (history: ProcessingResult[] | ((prev: ProcessingResult[]) => ProcessingResult[])) => void;
  isLoadingHistory: boolean;
  setProcessingResult: (result: ProcessingResult | null) => void;
  setActiveTab: (tab: string) => void;
}

export default function HistoryTab({
  processingHistory,
  setProcessingHistory,
  isLoadingHistory,
  setProcessingResult,
  setActiveTab
}: HistoryTabProps) {
  const handleRestoreItem = (item: ProcessingResult) => {
    setProcessingResult(item);
    setActiveTab('upload');
    toast.info('Restored document for editing');
  };

  const handleDeleteItems = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('document_processing_jobs')
        .delete()
        .in('id', ids);
      
      if (error) {
        toast.error('Failed to delete items');
        console.error('Delete error:', error);
      } else {
        setProcessingHistory(prev => prev.filter(item => !ids.includes(item.id)));
        toast.success(`Deleted ${ids.length} item(s)`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete items');
    }
  };

  return (
    <ProcessingHistoryWithExport
      history={processingHistory}
      onViewResult={handleRestoreItem}
      onDeleteItems={handleDeleteItems}
    />
  );
}
