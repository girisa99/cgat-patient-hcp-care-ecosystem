/**
 * Cookie Policy Page
 * Public legal page for Cookie Policy
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Calendar, Settings, BarChart3, Shield } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  const lastUpdated = '2026-01-15';
  const version = '1.0';

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/genie-landing" className="text-lg font-bold text-primary">Genie Suite</Link>
          <Link to="/genie-landing" className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
        </div>
      </nav>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
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
              <CardTitle>What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Cookies are small text files that are placed on your device when you visit a website. 
                They are widely used to make websites work more efficiently and to provide information 
                to the owners of the site.
              </p>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, 
                and assist in our marketing efforts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Essential Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                These cookies are necessary for the Service to function and cannot be disabled.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Purpose</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">sb-auth-token</td>
                    <td className="p-2">Authentication session</td>
                    <td className="p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="p-2">sb-refresh-token</td>
                    <td className="p-2">Session refresh</td>
                    <td className="p-2">7 days</td>
                  </tr>
                  <tr>
                    <td className="p-2">cookie-consent</td>
                    <td className="p-2">Tracks consent preferences</td>
                    <td className="p-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Functional Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                These cookies enable enhanced functionality and personalization.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Purpose</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">theme</td>
                    <td className="p-2">User theme preference</td>
                    <td className="p-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-2">language</td>
                    <td className="p-2">User language preference</td>
                    <td className="p-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-2">region</td>
                    <td className="p-2">User region for pricing</td>
                    <td className="p-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                These cookies help us understand how visitors interact with our Service.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Purpose</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">_ga</td>
                    <td className="p-2">Google Analytics</td>
                    <td className="p-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-2">_gid</td>
                    <td className="p-2">Session tracking</td>
                    <td className="p-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4">
                You can opt out of analytics cookies in your settings or by using browser extensions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>You can control cookies through:</p>
              <ul>
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies</li>
                <li><strong>Our Settings:</strong> Use the cookie preferences in your account settings</li>
                <li><strong>Opt-Out Tools:</strong> Use industry opt-out tools for advertising cookies</li>
              </ul>
              <p>
                Note: Disabling essential cookies may impact the functionality of the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Some cookies are set by third-party services that appear on our pages. 
                We use cookies from:
              </p>
              <ul>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Google:</strong> Analytics and authentication</li>
                <li><strong>Supabase:</strong> Backend services</li>
              </ul>
              <p>
                These third parties have their own privacy and cookie policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We may update this Cookie Policy from time to time. We will notify you of any 
                changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>For questions about our use of cookies:</p>
              <p><strong>Email:</strong> privacy@genieaisuite.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
