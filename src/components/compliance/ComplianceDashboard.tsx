/**
 * Compliance Dashboard Component
 * Unified view for HIPAA, Data Residency, and Legal Compliance
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Globe, 
  FileText, 
  Check, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Lock,
  Database,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { useHIPAACompliance } from '@/hooks/useHIPAACompliance';
import { useDataResidency } from '@/hooks/useDataResidency';
import { useLegalCompliance } from '@/hooks/useLegalCompliance';
import { cn } from '@/lib/utils';

export const ComplianceDashboard: React.FC = () => {
  const hipaa = useHIPAACompliance();
  const residency = useDataResidency();
  const legal = useLegalCompliance();
  const [activeTab, setActiveTab] = useState('overview');

  const isLoading = hipaa.isLoading || residency.isLoading || legal.isLoading;

  const overallScore = Math.round(
    ((hipaa.complianceResult?.score || 0) + 
     (residency.config ? 100 : 0) + 
     (legal.isCompliant ? 100 : 0)) / 3
  );

  const handleRefreshAll = async () => {
    await Promise.all([
      hipaa.refresh(),
      residency.refresh(),
      legal.refresh()
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Center</h2>
          <p className="text-muted-foreground">
            Manage HIPAA certification, data residency, and legal compliance
          </p>
        </div>
        <Button variant="outline" onClick={handleRefreshAll} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh All
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold">{overallScore}%</p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                overallScore >= 80 ? "bg-primary/10 text-primary" :
                overallScore >= 50 ? "bg-accent text-accent-foreground" :
                "bg-destructive/10 text-destructive"
              )}>
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <Progress value={overallScore} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">HIPAA Status</p>
                <p className="text-lg font-semibold capitalize">
                  {hipaa.status?.certification_level || 'Not Started'}
                </p>
              </div>
              <Badge variant={hipaa.status?.baa_signed ? 'default' : 'secondary'}>
                {hipaa.status?.baa_signed ? 'BAA Signed' : 'Pending'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Residency</p>
                <p className="text-lg font-semibold">
                  {residency.config?.primary_region || 'Not Configured'}
                </p>
              </div>
              <Globe className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Legal</p>
                <p className="text-lg font-semibold">
                  {legal.isCompliant ? 'Compliant' : 'Action Required'}
                </p>
              </div>
              {legal.isCompliant ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Shield className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="hipaa" className="gap-2">
            <Lock className="h-4 w-4" />
            HIPAA
          </TabsTrigger>
          <TabsTrigger value="residency" className="gap-2">
            <Database className="h-4 w-4" />
            Data Residency
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2">
            <FileText className="h-4 w-4" />
            Legal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
              <CardDescription>
                Complete all items for full compliance certification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ComplianceItem 
                  label="Terms of Service Accepted"
                  completed={legal.status?.terms_of_service || false}
                />
                <ComplianceItem 
                  label="Privacy Policy Accepted"
                  completed={legal.status?.privacy_policy || false}
                />
                <ComplianceItem 
                  label="HIPAA BAA Signed"
                  completed={hipaa.status?.baa_signed || false}
                />
                <ComplianceItem 
                  label="Encryption at Rest Enabled"
                  completed={hipaa.status?.encryption_at_rest_enabled || false}
                />
                <ComplianceItem 
                  label="Data Residency Configured"
                  completed={!!residency.config?.primary_region}
                />
                <ComplianceItem 
                  label="Audit Logging Enabled"
                  completed={hipaa.status?.audit_logging_enabled || false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hipaa" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>HIPAA Certification Status</CardTitle>
              <CardDescription>
                Healthcare compliance and PHI protection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hipaa.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Certification Level</p>
                      <p className="text-xl font-semibold capitalize mt-1">
                        {hipaa.status?.certification_level || 'None'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Compliance Score</p>
                      <p className="text-xl font-semibold">
                        {hipaa.complianceResult?.score || 0}/100
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Security Controls</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <SecurityControl 
                        label="BAA Signed" 
                        enabled={hipaa.status?.baa_signed || false} 
                      />
                      <SecurityControl 
                        label="Encryption at Rest" 
                        enabled={hipaa.status?.encryption_at_rest_enabled || false} 
                      />
                      <SecurityControl 
                        label="Encryption in Transit" 
                        enabled={hipaa.status?.encryption_in_transit_enabled || false} 
                      />
                      <SecurityControl 
                        label="Audit Logging" 
                        enabled={hipaa.status?.audit_logging_enabled || false}
                      />
                      <SecurityControl 
                        label="Access Controls" 
                        enabled={hipaa.status?.access_controls_configured || false} 
                      />
                      <SecurityControl 
                        label="PHI Training" 
                        enabled={hipaa.status?.phi_handling_trained || false} 
                      />
                    </div>
                  </div>

                  {!hipaa.status?.baa_signed && (
                    <Button onClick={() => hipaa.signBAA()} className="w-full">
                      Sign Business Associate Agreement (BAA)
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residency" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Residency Configuration</CardTitle>
              <CardDescription>
                Control where your data is stored and processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {residency.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Primary Region</p>
                      <p className="text-xl font-semibold mt-1">
                        {residency.config?.primary_region || 'Not Set'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Data Sovereignty</p>
                      <Badge variant={residency.config?.data_sovereignty_required ? 'default' : 'secondary'}>
                        {residency.config?.data_sovereignty_required ? 'Required' : 'Not Required'}
                      </Badge>
                    </div>
                  </div>

                  {residency.config?.allowed_regions && residency.config.allowed_regions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3">Allowed Regions</h4>
                        <div className="flex flex-wrap gap-2">
                          {residency.config.allowed_regions.map((region) => (
                            <Badge key={region} variant="outline">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Document Acceptance</CardTitle>
              <CardDescription>
                Track your acceptance of required legal documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {legal.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  <LegalDocumentRow 
                    title="Terms of Service"
                    accepted={legal.status?.terms_of_service || false}
                    link="/terms"
                    onAccept={() => legal.acceptDocument('terms_of_service')}
                  />
                  <LegalDocumentRow 
                    title="Privacy Policy"
                    accepted={legal.status?.privacy_policy || false}
                    link="/privacy"
                    onAccept={() => legal.acceptDocument('privacy_policy')}
                  />
                  <LegalDocumentRow 
                    title="Cookie Policy"
                    accepted={legal.status?.cookie_policy || false}
                    link="/cookies"
                    onAccept={() => legal.acceptDocument('cookie_policy')}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {legal.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Acceptance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {legal.history.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="capitalize">{item.document_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(item.accepted_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper Components
const ComplianceItem = ({ label, completed }: { label: string; completed: boolean }) => (
  <div className="flex items-center justify-between py-2 border-b last:border-0">
    <span>{label}</span>
    {completed ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    ) : (
      <XCircle className="h-5 w-5 text-muted-foreground" />
    )}
  </div>
);

const SecurityControl = ({ label, enabled }: { label: string; enabled: boolean }) => (
  <div className={cn(
    "p-3 rounded-lg border flex items-center gap-2",
    enabled ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800" : "bg-muted/50"
  )}>
    {enabled ? (
      <Check className="h-4 w-4 text-emerald-600" />
    ) : (
      <XCircle className="h-4 w-4 text-muted-foreground" />
    )}
    <span className={cn("text-sm", enabled ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground")}>
      {label}
    </span>
  </div>
);

const LegalDocumentRow = ({ 
  title, 
  accepted, 
  link, 
  onAccept 
}: { 
  title: string; 
  accepted: boolean; 
  link: string; 
  onAccept: () => void;
}) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0">
    <div className="flex items-center gap-3">
      {accepted ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-amber-500" />
      )}
      <span>{title}</span>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <a href={link} target="_blank" rel="noopener noreferrer">View</a>
      </Button>
      {!accepted && (
        <Button size="sm" onClick={onAccept}>Accept</Button>
      )}
    </div>
  </div>
);

export default ComplianceDashboard;
