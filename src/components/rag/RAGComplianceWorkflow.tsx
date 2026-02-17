import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Download, Share2, FileCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RAGComplianceWorkflowProps {
  knowledgeBaseIds: string[];
  complianceEnabled: boolean;
  onComplianceChange: (enabled: boolean) => void;
}

export const RAGComplianceWorkflow: React.FC<RAGComplianceWorkflowProps> = ({
  knowledgeBaseIds,
  complianceEnabled,
  onComplianceChange
}) => {
  const [workflowConfig, setWorkflowConfig] = useState({
    autoApproval: false,
    manualReview: true,
    contentFiltering: true,
    sourceVerification: true,
    versioning: true
  });

  const handleConfigChange = (key: string, value: boolean) => {
    setWorkflowConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleExportCompliance = () => {
    toast({
      title: 'Export Started',
      description: 'Compliance report is being generated...'
    });
  };

  const handleShareForReview = () => {
    toast({
      title: 'Shared for Review',
      description: 'Knowledge base sent to compliance team for review'
    });
  };

  return (
    <div className="space-y-6">
      {/* RAG Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            RAG Configuration
          </CardTitle>
          <CardDescription>
            Configure retrieval-augmented generation settings for your agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-approval">Automatic Content Approval</Label>
                <Switch
                  id="auto-approval"
                  checked={workflowConfig.autoApproval}
                  onCheckedChange={(value) => handleConfigChange('autoApproval', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="manual-review">Manual Review Required</Label>
                <Switch
                  id="manual-review"
                  checked={workflowConfig.manualReview}
                  onCheckedChange={(value) => handleConfigChange('manualReview', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="content-filtering">Content Filtering</Label>
                <Switch
                  id="content-filtering"
                  checked={workflowConfig.contentFiltering}
                  onCheckedChange={(value) => handleConfigChange('contentFiltering', value)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="source-verification">Source Verification</Label>
                <Switch
                  id="source-verification"
                  checked={workflowConfig.sourceVerification}
                  onCheckedChange={(value) => handleConfigChange('sourceVerification', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="versioning">Version Control</Label>
                <Switch
                  id="versioning"
                  checked={workflowConfig.versioning}
                  onCheckedChange={(value) => handleConfigChange('versioning', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compliance">Compliance Monitoring</Label>
                <Switch
                  id="compliance"
                  checked={complianceEnabled}
                  onCheckedChange={onComplianceChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Workflow */}
      {complianceEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Compliance Workflow
            </CardTitle>
            <CardDescription>
              Healthcare compliance and review workflow configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Review Process</h4>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Manual Review Required
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Automated Checks
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Compliance Standards</h4>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center">
                    HIPAA Compliant
                  </Badge>
                  <Badge variant="secondary" className="w-full justify-center">
                    FDA Guidelines
                  </Badge>
                  <Badge variant="secondary" className="w-full justify-center">
                    21 CFR Part 11
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleShareForReview}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share for Review
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleExportCompliance}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Knowledge Base Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Knowledge Base Status</h4>
              {knowledgeBaseIds.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {knowledgeBaseIds.map((id, index) => (
                    <div key={id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Knowledge Base {index + 1}</span>
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        Ready for Review
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No knowledge bases configured. Add knowledge bases in the previous step.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Workflow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Knowledge Bases Configured</span>
              <Badge variant="secondary">{knowledgeBaseIds.length}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Compliance Monitoring</span>
              <Badge variant={complianceEnabled ? "default" : "outline"}>
                {complianceEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Manual Review</span>
              <Badge variant={workflowConfig.manualReview ? "default" : "outline"}>
                {workflowConfig.manualReview ? "Required" : "Optional"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};