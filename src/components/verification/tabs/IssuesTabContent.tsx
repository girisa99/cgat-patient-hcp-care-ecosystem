
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Database, Shield, Code } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface IssuesTabContentProps {
  verificationSummary: VerificationSummary;
}

const IssuesTabContent: React.FC<IssuesTabContentProps> = ({ verificationSummary }) => {
  const databaseIssues = verificationSummary.databaseValidation?.violations?.length || 0;
  const codeQualityIssues = verificationSummary.codeQuality?.issues?.length || 0;
  const securityVulnerabilities = verificationSummary.securityScan?.vulnerabilities?.length || 0;
  const schemaIssues = verificationSummary.schemaValidation?.violations?.length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{verificationSummary.totalIssues}</div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{verificationSummary.criticalIssues}</div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{verificationSummary.autoFixesApplied || 0}</div>
                <p className="text-sm text-muted-foreground">Auto-Fixed</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{verificationSummary.fixedIssues}</div>
                <p className="text-sm text-muted-foreground">Fixed Issues</p>
              </div>
              <CheckCircle className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issue Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Schema Violations</span>
                <Badge variant={schemaIssues > 0 ? "destructive" : "default"}>
                  {schemaIssues}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Violations</span>
                <Badge variant={databaseIssues > 0 ? "destructive" : "default"}>
                  {databaseIssues}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Code Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Security Vulnerabilities</span>
                <Badge variant={securityVulnerabilities > 0 ? "destructive" : "default"}>
                  {securityVulnerabilities}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Code Quality Issues</span>
                <Badge variant={codeQualityIssues > 0 ? "destructive" : "default"}>
                  {codeQualityIssues}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {verificationSummary.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {verificationSummary.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IssuesTabContent;
