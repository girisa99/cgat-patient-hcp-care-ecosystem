/**
 * Terms of Service Page
 * Public legal page for Terms of Service
 */

import React from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Shield } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = '2026-01-15';
  const version = '1.0';

  return (
    <GenieStudioLayout variant="topbar">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
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
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                By accessing or using Genie Studio ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service. 
                By using the Service, you represent that you are at least 18 years of age.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Genie Studio is an AI-powered content creation platform that provides tools for:
              </p>
              <ul>
                <li>Presentation generation and editing</li>
                <li>Video production and dubbing</li>
                <li>Voice synthesis and cloning</li>
                <li>Knowledge management and AI assistance</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                When you create an account, you must provide accurate and complete information. 
                You are responsible for:
              </p>
              <ul>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Subscription and Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Some features require a paid subscription. By subscribing, you agree to:
              </p>
              <ul>
                <li>Pay all applicable fees as described in your plan</li>
                <li>Automatic renewal unless cancelled before the billing cycle</li>
                <li>Our refund policy as stated in the subscription terms</li>
              </ul>
              <p>
                Prices are subject to change with 30 days notice. Current subscribers will be notified of any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                You retain ownership of content you create using the Service. However:
              </p>
              <ul>
                <li>The Service and its original content remain our property</li>
                <li>You grant us a license to use your content for providing the Service</li>
                <li>AI-generated content is subject to our content policy</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Generate harmful, misleading, or illegal content</li>
                <li>Attempt to bypass security measures</li>
                <li>Use automated systems without authorization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Healthcare Compliance (HIPAA)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">For Healthcare Users</span>
              </div>
              <p>
                If you use the Service to process Protected Health Information (PHI):
              </p>
              <ul>
                <li>A Business Associate Agreement (BAA) must be signed</li>
                <li>You must use HIPAA-compliant features only</li>
                <li>You are responsible for ensuring proper data handling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use of the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>For questions about these Terms, contact us at:</p>
              <p><strong>Email:</strong> legal@genieaisuite.com</p>
              <p><strong>Address:</strong> Genie AI Suite, Inc.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </GenieStudioLayout>
  );
};

export default TermsOfServicePage;
