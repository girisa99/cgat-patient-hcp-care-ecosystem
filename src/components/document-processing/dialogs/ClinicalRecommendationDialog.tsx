/**
 * ClinicalRecommendationDialog Component
 * Displays detailed clinical recommendation information
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface ClinicalRecommendation {
  title: string;
  message: string;
  type: string;
}

interface ClinicalRecommendationDialogProps {
  recommendation: ClinicalRecommendation | null;
  onClose: () => void;
}

export default function ClinicalRecommendationDialog({
  recommendation,
  onClose
}: ClinicalRecommendationDialogProps) {
  return (
    <Dialog open={!!recommendation} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {recommendation?.type === 'error' ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : recommendation?.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <Sparkles className="h-5 w-5 text-primary" />
            )}
            {recommendation?.title}
          </DialogTitle>
          <DialogDescription className="pt-4">
            <p className="text-base leading-relaxed">{recommendation?.message}</p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
