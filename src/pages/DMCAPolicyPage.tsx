/**
 * DMCA POLICY PAGE
 * Copyright infringement reporting and takedown procedures
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlobalComplianceFooter } from '@/components/compliance/GlobalComplianceFooter';
import { Scale, FileText, AlertTriangle, Mail, Shield } from 'lucide-react';

const DMCAPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            DMCA Policy & Copyright
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                Genie Studio respects the intellectual property rights of others and expects our users 
                to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and similar 
                international copyright laws.
              </p>
              <p>
                We will respond expeditiously to claims of copyright infringement committed using our 
                service that are reported to our designated copyright agent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Filing a DMCA Takedown Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                If you believe that your copyrighted work has been copied in a way that constitutes 
                copyright infringement, please provide our copyright agent with the following information:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing, with enough detail to locate it</li>
                <li>Your contact information (address, telephone number, email)</li>
                <li>A statement that you have a good faith belief that the use is not authorized</li>
                <li>A statement that the information is accurate, under penalty of perjury</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>Send DMCA notices to our designated copyright agent:</p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>DMCA Agent</strong></p>
                <p>Genie Studio Legal Department</p>
                <p>Email: dmca@geniestudio.com</p>
                <p>Subject Line: DMCA Takedown Request</p>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please note that under Section 512(f) of the DMCA, any person who knowingly 
                  materially misrepresents that material is infringing may be subject to liability.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Counter-Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                If you believe your content was removed in error, you may file a counter-notification containing:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Your physical or electronic signature</li>
                <li>Identification of the material that was removed</li>
                <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                <li>Your name, address, and telephone number</li>
                <li>Consent to the jurisdiction of federal court in your district</li>
                <li>Agreement to accept service of process from the complainant</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repeat Infringer Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                In accordance with the DMCA, we will terminate the accounts of users who are 
                determined to be repeat infringers. We reserve the right to terminate any account 
                at our sole discretion.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <GlobalComplianceFooter variant="minimal" />
    </div>
  );
};

export default DMCAPolicyPage;
