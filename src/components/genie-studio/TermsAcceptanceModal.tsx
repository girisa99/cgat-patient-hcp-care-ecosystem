/**
 * Terms and Privacy Acceptance Modal
 * Shows on first use of Genie Studio content generation
 * Covers AI-generated content disclaimers and monitoring notice
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, AlertTriangle, Lock, FileText } from 'lucide-react';

const TERMS_ACCEPTED_KEY = 'genie_terms_accepted';
const TERMS_VERSION = '1.0.0';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsAcceptanceModal({
  isOpen,
  onAccept,
  onDecline
}: TermsAcceptanceModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAI, setAcceptedAI] = useState(false);
  const [acceptedMonitoring, setAcceptedMonitoring] = useState(false);

  const canProceed = acceptedTerms && acceptedPrivacy && acceptedAI && acceptedMonitoring;

  const handleAccept = () => {
    if (canProceed) {
      // Store acceptance with version
      localStorage.setItem(TERMS_ACCEPTED_KEY, JSON.stringify({
        version: TERMS_VERSION,
        acceptedAt: new Date().toISOString(),
        terms: true,
        privacy: true,
        ai: true,
        monitoring: true
      }));
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Terms of Use & Privacy Policy
          </DialogTitle>
          <DialogDescription>
            Please review and accept the following terms before using Genie Studio content generation
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {/* AI-Generated Content Notice */}
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <p className="font-semibold mb-2">AI-Generated Content Disclaimer</p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>All content generated through Genie Studio is <strong>purely AI-generated</strong></li>
                  <li>We are <strong>not responsible</strong> for the accuracy, completeness, or appropriateness of generated content</li>
                  <li>You must <strong>verify and review</strong> all content before use or publication</li>
                  <li>AI outputs may contain errors, biases, or inaccuracies</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Content Policy */}
            <Alert className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <p className="font-semibold mb-2">Prohibited Content Policy</p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li><strong>Adult/NSFW content</strong> is strictly prohibited</li>
                  <li>No violent, harmful, dangerous, or illegal content</li>
                  <li>No hate speech, discrimination, or harassment</li>
                  <li>No content that violates intellectual property rights</li>
                  <li>Violations may result in <strong>immediate access restriction</strong></li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Monitoring Notice */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <Eye className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-2">Content Monitoring Notice</p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>All content generation requests are <strong>monitored for policy compliance</strong></li>
                  <li>Automated systems detect and flag potential violations</li>
                  <li>Repeated violations will result in <strong>progressive enforcement</strong>:
                    <ul className="pl-4 mt-1">
                      <li>Warning → Temporary restriction → Account suspension</li>
                    </ul>
                  </li>
                  <li>Violation logs are retained for security purposes</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Privacy */}
            <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800">
              <Lock className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-700 dark:text-purple-300">
                <p className="font-semibold mb-2">Privacy & Data Usage</p>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Your prompts may be processed by third-party AI providers</li>
                  <li>Do not include sensitive, confidential, or personal information</li>
                  <li>Usage data is collected for service improvement</li>
                  <li>Data is handled in accordance with our Privacy Policy</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </ScrollArea>

        {/* Acceptance Checkboxes */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(c) => setAcceptedTerms(!!c)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              I accept the <strong>Terms of Service</strong> and understand that I am responsible for reviewing and verifying all AI-generated content.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="privacy"
              checked={acceptedPrivacy}
              onCheckedChange={(c) => setAcceptedPrivacy(!!c)}
            />
            <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
              I accept the <strong>Privacy Policy</strong> and consent to data processing as described.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="ai"
              checked={acceptedAI}
              onCheckedChange={(c) => setAcceptedAI(!!c)}
            />
            <Label htmlFor="ai" className="text-sm leading-relaxed cursor-pointer">
              I understand this is <strong>AI-generated content</strong> and the platform is not responsible for outputs.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="monitoring"
              checked={acceptedMonitoring}
              onCheckedChange={(c) => setAcceptedMonitoring(!!c)}
            />
            <Label htmlFor="monitoring" className="text-sm leading-relaxed cursor-pointer">
              I acknowledge that content is <strong>monitored for policy compliance</strong> and violations may result in access restriction.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={!canProceed}>
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to check if terms have been accepted
 */
export function useTermsAcceptance() {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TERMS_ACCEPTED_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Check if current version matches
        if (data.version === TERMS_VERSION) {
          setHasAccepted(true);
          return;
        }
      } catch (e) {
        console.error('Error parsing terms acceptance:', e);
      }
    }
    setHasAccepted(false);
  }, []);

  const checkAndPrompt = () => {
    if (hasAccepted === false) {
      setShowModal(true);
      return false;
    }
    return true;
  };

  const handleAccept = () => {
    setHasAccepted(true);
    setShowModal(false);
  };

  const handleDecline = () => {
    setShowModal(false);
  };

  return {
    hasAccepted,
    showModal,
    checkAndPrompt,
    handleAccept,
    handleDecline,
    setShowModal,
    TermsModal: showModal ? (
      <TermsAcceptanceModal
        isOpen={showModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    ) : null
  };
}
