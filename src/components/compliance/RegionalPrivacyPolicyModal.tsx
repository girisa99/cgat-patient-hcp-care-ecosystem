/**
 * Regional Privacy Policy Modal
 * Displays region-specific privacy policy, terms, and consent requirements
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  Cookie, 
  Database, 
  Globe, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  Trash2,
  Download
} from 'lucide-react';
import { 
  getFullComplianceConfig, 
  type ComplianceRegion,
  type RegionalPrivacyPolicy,
  type RegionalTermsOfService 
} from '@/services/regionalComplianceRegistry';

interface RegionalPrivacyPolicyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  countryCode: string;
  userEmail?: string;
}

export const RegionalPrivacyPolicyModal: React.FC<RegionalPrivacyPolicyModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  countryCode,
  userEmail,
}) => {
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedCookies, setAcceptedCookies] = useState(false);
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies'>('privacy');

  const compliance = getFullComplianceConfig(countryCode);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAcceptedPrivacy(false);
      setAcceptedTerms(false);
      setAcceptedCookies(!compliance.privacy.cookieConsentRequired);
      setAcceptedDataProcessing(!compliance.privacy.requiresExplicitConsent);
    }
  }, [isOpen, compliance]);

  const canProceed = acceptedPrivacy && acceptedTerms && 
    (!compliance.privacy.cookieConsentRequired || acceptedCookies) &&
    (!compliance.privacy.requiresExplicitConsent || acceptedDataProcessing);

  const handleAccept = () => {
    if (canProceed) {
      // Store consent in localStorage with timestamp
      const consentRecord = {
        timestamp: new Date().toISOString(),
        region: compliance.region,
        privacy: acceptedPrivacy,
        terms: acceptedTerms,
        cookies: acceptedCookies,
        dataProcessing: acceptedDataProcessing,
        email: userEmail,
      };
      localStorage.setItem('regional_consent', JSON.stringify(consentRecord));
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Terms Agreement
            <Badge variant="outline" className="ml-2">
              <Globe className="h-3 w-3 mr-1" />
              {compliance.region}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Please review and accept our policies tailored to your region ({compliance.privacy.name})
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b pb-2">
          <Button 
            variant={activeTab === 'privacy' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('privacy')}
          >
            <Lock className="h-4 w-4 mr-1" />
            Privacy Policy
          </Button>
          <Button 
            variant={activeTab === 'terms' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('terms')}
          >
            <FileText className="h-4 w-4 mr-1" />
            Terms of Service
          </Button>
          <Button 
            variant={activeTab === 'cookies' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('cookies')}
          >
            <Cookie className="h-4 w-4 mr-1" />
            Cookie Policy
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {activeTab === 'privacy' && (
            <PrivacyPolicyContent privacy={compliance.privacy} region={compliance.region} />
          )}
          {activeTab === 'terms' && (
            <TermsOfServiceContent terms={compliance.terms} region={compliance.region} />
          )}
          {activeTab === 'cookies' && (
            <CookiePolicyContent privacy={compliance.privacy} region={compliance.region} />
          )}
        </ScrollArea>

        <Separator />

        {/* Consent Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="privacy" 
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
            />
            <label htmlFor="privacy" className="text-sm leading-tight cursor-pointer">
              I have read and agree to the <span className="font-medium text-primary">Privacy Policy</span>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            />
            <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
              I agree to the <span className="font-medium text-primary">Terms of Service</span>
            </label>
          </div>

          {compliance.privacy.cookieConsentRequired && (
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="cookies" 
                checked={acceptedCookies}
                onCheckedChange={(checked) => setAcceptedCookies(checked === true)}
              />
              <label htmlFor="cookies" className="text-sm leading-tight cursor-pointer">
                I consent to the use of cookies and similar technologies
              </label>
            </div>
          )}

          {compliance.privacy.requiresExplicitConsent && (
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="dataProcessing" 
                checked={acceptedDataProcessing}
                onCheckedChange={(checked) => setAcceptedDataProcessing(checked === true)}
              />
              <label htmlFor="dataProcessing" className="text-sm leading-tight cursor-pointer">
                I explicitly consent to the processing of my personal data as described in the Privacy Policy
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={!canProceed}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ═══ Privacy Policy Content ═══
const PrivacyPolicyContent: React.FC<{ privacy: RegionalPrivacyPolicy; region: ComplianceRegion }> = ({ 
  privacy, 
  region 
}) => (
  <div className="space-y-4 text-sm">
    <div className="bg-primary/5 p-4 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4" />
        {privacy.name}
      </h3>
      <p className="text-muted-foreground">
        This privacy policy complies with the following regulations: {privacy.regulations.join(', ')}
      </p>
    </div>

    <section>
      <h4 className="font-medium mb-2">1. Data Collection & Use</h4>
      <p className="text-muted-foreground mb-2">
        We collect and process your personal data to provide our services. This includes:
      </p>
      <ul className="list-disc list-inside text-muted-foreground space-y-1">
        <li>Account information (name, email, preferences)</li>
        <li>Usage data (interactions, features used)</li>
        <li>Content you create or upload</li>
        <li>Device and browser information</li>
      </ul>
    </section>

    <section>
      <h4 className="font-medium mb-2">2. Your Rights</h4>
      <div className="grid grid-cols-2 gap-2">
        {privacy.requiresDataDeletionOnRequest && (
          <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded text-green-700">
            <Trash2 className="h-4 w-4" />
            Right to Deletion
          </div>
        )}
        {privacy.requiresDataPortability && (
          <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded text-blue-700">
            <Download className="h-4 w-4" />
            Data Portability
          </div>
        )}
        <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded text-purple-700">
          <Database className="h-4 w-4" />
          Access to Data
        </div>
        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded text-orange-700">
          <Lock className="h-4 w-4" />
          Right to Rectification
        </div>
      </div>
    </section>

    <section>
      <h4 className="font-medium mb-2">3. Data Retention</h4>
      <p className="text-muted-foreground">
        We retain your personal data for a maximum of <strong>{privacy.dataRetentionDays} days</strong> after 
        account closure, unless legally required to retain it longer.
      </p>
    </section>

    <section>
      <h4 className="font-medium mb-2">4. Cross-Border Data Transfers</h4>
      <Alert variant={privacy.crossBorderTransferRules === 'prohibited' ? 'destructive' : 'default'}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {privacy.crossBorderTransferRules === 'prohibited' && 
            'Data must remain within the country/region. No cross-border transfers permitted.'}
          {privacy.crossBorderTransferRules === 'restricted' && 
            'Cross-border transfers are only allowed with adequate safeguards (e.g., Standard Contractual Clauses).'}
          {privacy.crossBorderTransferRules === 'allowed' && 
            'Cross-border data transfers are permitted under applicable law.'}
        </AlertDescription>
      </Alert>
    </section>

    <section>
      <h4 className="font-medium mb-2">5. Data Breach Notification</h4>
      <p className="text-muted-foreground">
        In the event of a data breach, we will notify you within <strong>{privacy.breachNotificationHours} hours</strong> as 
        required by {privacy.regulations[0]}.
      </p>
    </section>

    <section>
      <h4 className="font-medium mb-2">6. Age of Consent</h4>
      <p className="text-muted-foreground">
        You must be at least <strong>{privacy.ageOfConsent} years old</strong> to use our services in your region.
      </p>
    </section>

    <p className="text-xs text-muted-foreground italic">
      Last updated: {new Date().toLocaleDateString()}
    </p>
  </div>
);

// ═══ Terms of Service Content ═══
const TermsOfServiceContent: React.FC<{ terms: RegionalTermsOfService; region: ComplianceRegion }> = ({ 
  terms, 
  region 
}) => (
  <div className="space-y-4 text-sm">
    <div className="bg-primary/5 p-4 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4" />
        Terms of Service - {region} Region
      </h3>
      <p className="text-muted-foreground">
        Governing Law: {terms.governingLaw}
      </p>
    </div>

    <section>
      <h4 className="font-medium mb-2">1. Agreement to Terms</h4>
      <p className="text-muted-foreground">
        By accessing or using our services, you agree to be bound by these Terms of Service and all 
        applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
        from using or accessing our services.
      </p>
    </section>

    <section>
      <h4 className="font-medium mb-2">2. Prohibited Content</h4>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          The following content is strictly prohibited:
          <ul className="list-disc list-inside mt-2">
            <li>Adult, pornographic, or sexually explicit content</li>
            <li>Violent, gore, or harmful content</li>
            <li>Hate speech, discrimination, or harassment</li>
            <li>Content that violates privacy or exposes personal data</li>
            <li>Deepfakes or manipulated media</li>
            <li>Any content illegal in your jurisdiction</li>
          </ul>
        </AlertDescription>
      </Alert>
    </section>

    <section>
      <h4 className="font-medium mb-2">3. Dispute Resolution</h4>
      <p className="text-muted-foreground">
        Disputes will be resolved through <strong>{terms.disputeResolution}</strong> in the {terms.jurisdictionCourt}.
      </p>
      {terms.arbitrationOptOutPeriodDays > 0 && (
        <p className="text-muted-foreground mt-2">
          You may opt out of arbitration within {terms.arbitrationOptOutPeriodDays} days of accepting these terms.
        </p>
      )}
    </section>

    <section>
      <h4 className="font-medium mb-2">4. Cancellation Rights</h4>
      <p className="text-muted-foreground">
        You have the right to cancel your subscription within <strong>{terms.cancelationPeriodDays} days</strong> of 
        purchase for a full refund, as required by {terms.consumerProtectionLaws[0]}.
      </p>
    </section>

    <section>
      <h4 className="font-medium mb-2">5. AI-Generated Content</h4>
      <p className="text-muted-foreground">
        All AI-generated content is provided "as is" and may contain inaccuracies. You are responsible 
        for reviewing and verifying any content before use. We do not guarantee the accuracy, 
        completeness, or suitability of AI outputs.
      </p>
    </section>

    <p className="text-xs text-muted-foreground italic">
      Last updated: {new Date().toLocaleDateString()}
    </p>
  </div>
);

// ═══ Cookie Policy Content ═══
const CookiePolicyContent: React.FC<{ privacy: RegionalPrivacyPolicy; region: ComplianceRegion }> = ({ 
  privacy, 
  region 
}) => (
  <div className="space-y-4 text-sm">
    <div className="bg-primary/5 p-4 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2 mb-2">
        <Cookie className="h-4 w-4" />
        Cookie & Tracking Policy
      </h3>
      <p className="text-muted-foreground">
        {privacy.cookieConsentRequired 
          ? 'Your explicit consent is required for non-essential cookies.'
          : 'We use cookies to improve your experience.'}
      </p>
    </div>

    <section>
      <h4 className="font-medium mb-2">1. Essential Cookies</h4>
      <p className="text-muted-foreground">
        These cookies are necessary for the website to function and cannot be switched off. They are 
        usually only set in response to actions made by you, such as setting your privacy preferences, 
        logging in, or filling in forms.
      </p>
    </section>

    <section>
      <h4 className="font-medium mb-2">2. Analytics Cookies</h4>
      <p className="text-muted-foreground">
        These cookies allow us to count visits and traffic sources so we can measure and improve the 
        performance of our site. They help us know which pages are the most and least popular.
      </p>
    </section>

    <section>
      <h4 className="font-medium mb-2">3. Functional Cookies</h4>
      <p className="text-muted-foreground">
        These cookies enable the website to provide enhanced functionality and personalization, such as 
        remembering your preferences and settings.
      </p>
    </section>

    <section>
      <h4 className="font-medium mb-2">4. Managing Cookies</h4>
      <p className="text-muted-foreground">
        You can control and/or delete cookies as you wish. You can delete all cookies that are already 
        on your computer and you can set most browsers to prevent them from being placed.
      </p>
    </section>

    <p className="text-xs text-muted-foreground italic">
      Last updated: {new Date().toLocaleDateString()}
    </p>
  </div>
);

export default RegionalPrivacyPolicyModal;
