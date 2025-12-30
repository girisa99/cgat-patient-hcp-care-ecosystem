/**
 * HistoryTab Component
 * Displays processing history with export functionality
 * Extracted from DocumentProcessing.tsx for maintainability
 */

import React from 'react';
import ProcessingHistoryWithExport from '@/components/document-processing/ProcessingHistoryWithExport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HistoryTabProps {
  processingHistory: any[];
  setProcessingHistory: (updater: (prev: any[]) => any[]) => void;
  selectedDocType: string;
  setProcessingResult: (result: any) => void;
  setSelectedDocType: (docType: string) => void;
  setActiveTab: (tab: string) => void;
  setShowVerificationDialog: (show: boolean) => void;
  setPendingResult: (result: any) => void;
}

export default function HistoryTab({
  processingHistory,
  setProcessingHistory,
  selectedDocType,
  setProcessingResult,
  setSelectedDocType,
  setActiveTab,
  setShowVerificationDialog,
  setPendingResult
}: HistoryTabProps) {
  const handleViewResult = (result: any) => {
    setProcessingResult(result);
    
    // For invoices/billing, switch to RCM analysis tab
    if (result.documentType === 'invoice' || result.documentType === 'billing') {
      setSelectedDocType(result.documentType);
      setActiveTab('rcm-analysis');
      toast.info('Loaded invoice for RCM analysis');
    } else {
      // For other document types, show verification dialog
      setShowVerificationDialog(true);
      setPendingResult(result);
    }
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
      filterByDocType={selectedDocType}
      onViewResult={handleViewResult}
      onDeleteItems={handleDeleteItems}
    />
  );
}
