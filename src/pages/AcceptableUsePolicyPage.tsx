/**
 * ACCEPTABLE USE POLICY PAGE
 * Defines prohibited behaviors and content policies
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlobalComplianceFooter } from '@/components/compliance/GlobalComplianceFooter';
import { AlertTriangle, Ban, CheckCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AcceptableUsePolicyPage: React.FC = () => {
  const prohibitedActivities = [
    'Creating, uploading, or distributing pornographic, sexually explicit, or adult content',
    'Generating content that promotes violence, terrorism, or illegal activities',
    'Creating deepfakes or synthetic media intended to deceive or harm individuals',
    'Harassment, bullying, or targeted attacks against individuals or groups',
    'Hate speech, discrimination, or content promoting intolerance',
    'Spam, phishing, or fraudulent activities',
    'Impersonation of individuals, brands, or organizations without authorization',
    'Distribution of malware, viruses, or harmful code',
    'Circumventing security measures or accessing systems without authorization',
    'Violating intellectual property rights or copyright laws',
    'Creating content involving minors in inappropriate contexts',
    'Promoting self-harm, suicide, or dangerous activities',
  ];

  const acceptableUses = [
    'Creating professional presentations and marketing materials',
    'Educational content and training materials',
    'Business communications and internal documentation',
    'Creative projects with proper rights and licenses',
    'Personal projects that comply with our guidelines',
    'Research and development within ethical boundaries',
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            Acceptable Use Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Alert className="mb-8 border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription>
            Violation of this policy may result in immediate account termination, content removal, 
            and potential legal action. We actively monitor for policy violations.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Ban className="h-5 w-5" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The following activities are strictly prohibited on our platform:
              </p>
              <ul className="space-y-2">
                {prohibitedActivities.map((activity, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Ban className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    {activity}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Acceptable Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our platform is designed for the following legitimate purposes:
              </p>
              <ul className="space-y-2">
                {acceptableUses.map((use, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    {use}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                We employ automated systems and human review to detect policy violations. 
                Upon detection of a violation, we may:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Issue a warning to the account holder</li>
                <li>Remove or restrict access to violating content</li>
                <li>Temporarily or permanently suspend account access</li>
                <li>Report violations to appropriate law enforcement authorities</li>
                <li>Pursue legal action for damages or injunctive relief</li>
              </ul>
              <p>
                If you believe content violates our policies, please report it via our{' '}
                <Link to="/dmca" className="text-primary underline">DMCA/Reporting page</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <GlobalComplianceFooter variant="minimal" />
    </div>
  );
};

export default AcceptableUsePolicyPage;
