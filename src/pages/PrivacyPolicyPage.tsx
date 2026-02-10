/**
 * Privacy Policy Page
 * Public legal page for Privacy Policy
 */

import React from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Calendar, Database, Globe, Shield } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = '2026-01-15';
  const version = '1.0';

  return (
    <GenieStudioLayout variant="topbar">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <Badge variant="outline">Version {version}</Badge>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Genie AI Suite, Inc. ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our Genie Suite platform ("Service").
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this 
                privacy policy, please do not access the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4>Personal Information</h4>
              <ul>
                <li>Name and email address</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Profile preferences and settings</li>
              </ul>
              
              <h4>Usage Data</h4>
              <ul>
                <li>Features and tools used</li>
                <li>Content creation patterns</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
              </ul>

              <h4>Content Data</h4>
              <ul>
                <li>Documents and files you upload</li>
                <li>Presentations and media you create</li>
                <li>AI interaction history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>We use collected information to:</p>
              <ul>
                <li>Provide and maintain the Service</li>
                <li>Process transactions and send related information</li>
                <li>Personalize your experience</li>
                <li>Improve our AI models and features</li>
                <li>Communicate updates and marketing (with consent)</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                4. Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Third parties that help us operate (Stripe, Supabase, AI providers)</li>
                <li><strong>Business Partners:</strong> With your consent for collaborative features</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
              <p>
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                5. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>We implement security measures including:</p>
              <ul>
                <li>Encryption in transit (TLS) and at rest</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits and monitoring</li>
                <li>HIPAA-compliant infrastructure for healthcare users</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over the 
                Internet is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We retain your information for as long as your account is active or as needed to 
                provide services. Upon account deletion:
              </p>
              <ul>
                <li>Personal data is deleted within 30 days</li>
                <li>Backup copies are removed within 90 days</li>
                <li>Anonymized analytics may be retained</li>
                <li>Legal obligations may require longer retention</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>Depending on your location, you may have rights to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data ("right to be forgotten")</li>
                <li>Export your data (data portability)</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@genieaisuite.com.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Your data may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place, including:
              </p>
              <ul>
                <li>Standard contractual clauses</li>
                <li>Data residency options for enterprise users</li>
                <li>Compliance with GDPR and other regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                The Service is not intended for users under 18 years of age. We do not knowingly 
                collect information from children. If you become aware of data collected from a 
                child, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>For privacy-related questions or requests:</p>
              <p><strong>Email:</strong> privacy@genieaisuite.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@genieaisuite.com</p>
              <p><strong>Address:</strong> Genie AI Suite, Inc.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </GenieStudioLayout>
  );
};

export default PrivacyPolicyPage;
