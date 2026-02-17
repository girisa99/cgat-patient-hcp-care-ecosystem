/**
 * Terms of Service Page
 * Public legal page for Terms of Service
 * Includes jurisdiction, arbitration, and US court compliance
 */

import React from 'react';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Calendar, Shield, Scale, Gavel, Globe, AlertTriangle } from 'lucide-react';
import { GlobalComplianceFooter } from '@/components/compliance/GlobalComplianceFooter';

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = '2026-01-28';
  const version = '2.0';

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

        {/* Important Notice */}
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Scale className="h-4 w-4" />
          <AlertDescription>
            <strong>PLEASE READ CAREFULLY:</strong> These Terms contain an arbitration agreement and class action waiver 
            that affect your legal rights. By using our Service, you agree to resolve disputes through binding individual arbitration.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                By accessing or using Genie Suite ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
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
                Genie Suite is an AI-powered content creation platform that provides tools for:
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
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
              </p>
              <ul>
                <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Our total liability shall not exceed the greater of (a) $100 or (b) the amounts paid by you in the 12 months preceding the claim</li>
                <li>We are not liable for any loss of data, profits, or business opportunities</li>
              </ul>
              <p>
                Some jurisdictions do not allow limitations on implied warranties or liability, so these limitations may not apply to you.
              </p>
            </CardContent>
          </Card>

          {/* NEW: Governing Law Section */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                9. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                <strong>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                United States of America</strong>, without regard to its conflict of law provisions.
              </p>
              <p>
                This choice of law applies regardless of your country of residence or where you access the Service. 
                The United Nations Convention on Contracts for the International Sale of Goods does not apply.
              </p>
            </CardContent>
          </Card>

          {/* NEW: Binding Arbitration Section */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-destructive" />
                10. Binding Arbitration Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>IMPORTANT:</strong> This section affects your legal rights. Please read carefully.
                </AlertDescription>
              </Alert>
              
              <h4 className="font-semibold mt-4">10.1 Agreement to Arbitrate</h4>
              <p>
                You and Genie AI Suite, Inc. agree that any dispute, claim, or controversy arising out of or relating to 
                these Terms or the Service (collectively, "Disputes") will be resolved solely by binding, individual arbitration 
                rather than in court, except that:
              </p>
              <ul>
                <li>Either party may seek injunctive or other equitable relief in court for infringement of intellectual property rights</li>
                <li>Claims within small claims court jurisdiction may be brought there</li>
              </ul>

              <h4 className="font-semibold mt-4">10.2 Arbitration Rules and Forum</h4>
              <p>
                The Federal Arbitration Act governs the interpretation and enforcement of this arbitration agreement. 
                Arbitration will be conducted by <strong>JAMS</strong> under its Streamlined Arbitration Rules and Procedures, 
                or by another mutually agreed arbitration provider.
              </p>
              <ul>
                <li><strong>Location:</strong> Arbitration shall take place in Wilmington, Delaware, unless otherwise agreed</li>
                <li><strong>Language:</strong> English</li>
                <li><strong>Virtual Option:</strong> Either party may elect to conduct arbitration by telephone or video conference</li>
              </ul>

              <h4 className="font-semibold mt-4">10.3 Arbitration Costs</h4>
              <p>
                Payment of arbitration fees will be governed by JAMS rules. If you demonstrate financial hardship, 
                we will consider paying your share of filing and arbitration fees, at our sole discretion.
              </p>

              <h4 className="font-semibold mt-4">10.4 Arbitrator Authority</h4>
              <p>
                The arbitrator shall have exclusive authority to resolve all Disputes, including whether a claim is arbitrable. 
                The arbitrator may grant any remedy that would be available in court, including injunctive relief.
              </p>
            </CardContent>
          </Card>

          {/* NEW: Class Action Waiver */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-destructive" />
                11. Class Action Waiver
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="font-semibold">
                YOU AND GENIE AI SUITE, INC. AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS 
                INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, 
                OR REPRESENTATIVE PROCEEDING.
              </p>
              <p>
                Unless both you and we agree otherwise, the arbitrator may not consolidate more than one person's claims 
                and may not otherwise preside over any form of representative or class proceeding.
              </p>
              <p>
                If this class action waiver is found to be unenforceable, then the entire arbitration agreement shall be void.
              </p>
            </CardContent>
          </Card>

          {/* NEW: Opt-Out Right */}
          <Card>
            <CardHeader>
              <CardTitle>12. 30-Day Right to Opt Out of Arbitration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                You have the right to opt out of the arbitration agreement within 30 days of first accepting these Terms.
              </p>
              <p>To opt out, you must:</p>
              <ul>
                <li>Send written notice to: <strong>legal@genieaisuite.com</strong></li>
                <li>Include: Your full name, email address, and a clear statement that you wish to opt out</li>
                <li>Subject line: "Arbitration Opt-Out"</li>
              </ul>
              <p>
                If you opt out, you may pursue claims in court, subject to the jurisdiction provisions below. 
                Opting out will not affect your ability to use the Service.
              </p>
            </CardContent>
          </Card>

          {/* NEW: Exclusive Jurisdiction for Litigation */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" />
                13. Exclusive Jurisdiction for Litigation
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                If arbitration is not applicable or has been opted out of, you agree that:
              </p>
              <ul>
                <li>
                  <strong>Exclusive Jurisdiction:</strong> Any litigation shall be brought exclusively in the state or federal courts 
                  located in <strong>New Castle County, Delaware, United States</strong>
                </li>
                <li>
                  <strong>Personal Jurisdiction:</strong> You consent to the personal jurisdiction of such courts and waive any 
                  objection based on venue or inconvenient forum
                </li>
                <li>
                  <strong>Jury Trial Waiver:</strong> TO THE EXTENT PERMITTED BY LAW, BOTH PARTIES WAIVE THE RIGHT TO A JURY TRIAL 
                  IN ANY ACTION OR PROCEEDING
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* NEW: International Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                14. International Users
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                If you access the Service from outside the United States:
              </p>
              <ul>
                <li>You are responsible for compliance with local laws</li>
                <li>You consent to the transfer of your data to the United States</li>
                <li>The governing law and dispute resolution provisions still apply</li>
                <li>For EU/EEA users, mandatory consumer protection laws of your country may apply in addition to these Terms</li>
              </ul>
              <p>
                <strong>For EU Users:</strong> Nothing in these Terms affects your rights under the EU Consumer Rights Directive 
                or other mandatory consumer protection laws that cannot be waived by contract.
              </p>
            </CardContent>
          </Card>

          {/* NEW: Statute of Limitations */}
          <Card>
            <CardHeader>
              <CardTitle>15. Time Limitation on Claims</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                <strong>Any claim or cause of action arising out of or related to these Terms or the Service must be filed 
                within ONE (1) YEAR after the claim arose.</strong> Otherwise, such claim or cause of action is permanently barred.
              </p>
              <p>
                This limitation applies regardless of whether the claim is based on contract, tort, statute, or any other legal theory.
              </p>
            </CardContent>
          </Card>

          {/* NEW: Severability */}
          <Card>
            <CardHeader>
              <CardTitle>16. Severability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                If any provision of these Terms is held to be invalid or unenforceable by a court or arbitrator, 
                that provision will be enforced to the maximum extent permissible, and the other provisions will remain in full force and effect.
              </p>
              <p>
                The failure to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>17. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>For questions about these Terms, contact us at:</p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p><strong>Genie AI Suite, Inc.</strong></p>
                <p><strong>Legal Department</strong></p>
                <p>Email: legal@genieaisuite.com</p>
                <p>Arbitration Opt-Out: legal@genieaisuite.com (Subject: "Arbitration Opt-Out")</p>
                <p>DMCA Agent: dmca@genieaisuite.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <GlobalComplianceFooter variant="minimal" />
    </GenieStudioLayout>
  );
};

export default TermsOfServicePage;
