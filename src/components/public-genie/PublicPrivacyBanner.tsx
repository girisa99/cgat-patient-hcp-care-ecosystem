/**
 * PUBLIC PRIVACY BANNER
 * GDPR/CCPA compliant privacy notice for public Genie users
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Eye, Database, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface PublicPrivacyBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  onCookiesAccept: () => void;
}

export const PublicPrivacyBanner: React.FC<PublicPrivacyBannerProps> = ({
  onAccept,
  onDecline,
  onCookiesAccept
}) => {
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [analyticsAccepted, setAnalyticsAccepted] = useState(false);

  const handleAccept = () => {
    if (cookiesAccepted) {
      onCookiesAccept();
    }
    onAccept();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50"
      >
        <Card className="border-2 border-primary/20 bg-background/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Privacy & Terms</CardTitle>
            </div>
            <CardDescription>
              Welcome to GENIE AI Public Demo. Please review our privacy practices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Privacy Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Conversation Monitoring</p>
                  <p className="text-muted-foreground text-xs">
                    Conversations may be monitored for quality and safety
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Data Storage</p>
                  <p className="text-muted-foreground text-xs">
                    Conversations stored for 30 days, then automatically deleted
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">No Personal Data</p>
                  <p className="text-muted-foreground text-xs">
                    No registration required, IP-based rate limiting only
                  </p>
                </div>
              </div>
            </div>

            {/* Consent Options */}
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="cookies" 
                  checked={cookiesAccepted}
                  onCheckedChange={(checked) => setCookiesAccepted(checked as boolean)}
                />
                <label htmlFor="cookies" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Accept cookies for session management and rate limiting
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="analytics" 
                  checked={analyticsAccepted}
                  onCheckedChange={(checked) => setAnalyticsAccepted(checked as boolean)}
                />
                <label htmlFor="analytics" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Help improve our service with anonymous usage analytics (optional)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFullPolicy(true)}
              >
                View Full Policy
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onDecline}>
                  Decline
                </Button>
                <Button size="sm" onClick={handleAccept}>
                  Accept & Continue
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy. 
              This is a demo service - do not share sensitive personal information.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Privacy Policy Dialog */}
      <Dialog open={showFullPolicy} onOpenChange={setShowFullPolicy}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>GENIE AI Public Demo - Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Information We Collect</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Conversation messages and responses</li>
                <li>Session timestamps and usage patterns</li>
                <li>IP address for rate limiting (not stored long-term)</li>
                <li>Browser type and device information (if analytics accepted)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. How We Use Your Data</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Provide AI conversation services</li>
                <li>Prevent abuse and enforce rate limits</li>
                <li>Improve service quality and AI responses</li>
                <li>Monitor for safety and compliance</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Data Retention</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Conversations: Automatically deleted after 30 days</li>
                <li>Rate limiting data: Cleared every 24 hours</li>
                <li>Analytics: Aggregated data only, no personal identifiers</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Your Rights</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Request deletion of your conversation data</li>
                <li>Opt out of analytics at any time</li>
                <li>Access information about data processing</li>
                <li>File complaints with data protection authorities</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. AI & Healthcare Disclaimers</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All responses are AI-generated and should be verified</li>
                <li>Not a substitute for professional medical advice</li>
                <li>Always consult healthcare providers for medical decisions</li>
                <li>Technology information may become outdated</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Contact Information</h3>
              <p className="text-muted-foreground">
                For privacy concerns or data requests: privacy@genieaiexperimentationhub.tech
              </p>
            </section>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}<br/>
                This policy applies only to the public demo at genieaiexpermentationhub.tech
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};