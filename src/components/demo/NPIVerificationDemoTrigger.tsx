import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Play, Eye } from 'lucide-react';
import { NPIVerificationWorkflowDemo } from './NPIVerificationWorkflowDemo';

export const NPIVerificationDemoTrigger: React.FC = () => {
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [triggerData, setTriggerData] = useState({
    providerName: '',
    treatmentCenter: '',
    referralNetwork: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setTriggerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTriggerStatus = () => {
    const hasAnyInput = Object.values(triggerData).some(value => value.length > 0);
    return hasAnyInput ? 'READY' : 'WAITING';
  };

  const getFieldStatus = (value: string) => {
    return value.length > 0 ? 'POPULATED' : 'EMPTY';
  };

  console.log('✅ NPIVerificationDemoTrigger is rendering');
  
  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          NPI Verification & Credentialing Agent Demo
        </h1>
        <p className="text-muted-foreground">
          Demonstration of real-time backend processing, CMS validation, and database operations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agent Trigger Simulation</span>
            <Badge variant={getTriggerStatus() === 'READY' ? 'default' : 'secondary'}>
              {getTriggerStatus()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name" className="flex items-center justify-between">
                Provider Name
                <Badge variant="outline" className="text-xs">
                  {getFieldStatus(triggerData.providerName)}
                </Badge>
              </Label>
              <Input
                id="provider-name"
                placeholder="e.g., Dr. John Smith"
                value={triggerData.providerName}
                onChange={(e) => handleInputChange('providerName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment-center" className="flex items-center justify-between">
                Treatment Center
                <Badge variant="outline" className="text-xs">
                  {getFieldStatus(triggerData.treatmentCenter)}
                </Badge>
              </Label>
              <Input
                id="treatment-center"
                placeholder="e.g., Metro Health Center"
                value={triggerData.treatmentCenter}
                onChange={(e) => handleInputChange('treatmentCenter', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral-network" className="flex items-center justify-between">
                Referral Network
                <Badge variant="outline" className="text-xs">
                  {getFieldStatus(triggerData.referralNetwork)}
                </Badge>
              </Label>
              <Input
                id="referral-network"
                placeholder="e.g., Regional Care Network"
                value={triggerData.referralNetwork}
                onChange={(e) => handleInputChange('referralNetwork', e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold mb-2 text-sm">Agent Trigger Logic:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Trigger Condition:</strong> ANY field populated triggers verification</li>
              <li>• <strong>Verification Mode:</strong> Real-time backend processing</li>
              <li>• <strong>CMS Integration:</strong> Direct NPPES registry lookup</li>
              <li>• <strong>Database Storage:</strong> Individual UUID-mapped tables with RLS</li>
              <li>• <strong>Response Time:</strong> ~3-5 seconds for complete workflow</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setIsWorkflowOpen(true)}
              className="flex items-center gap-2"
              disabled={getTriggerStatus() !== 'READY'}
            >
              <Play className="w-4 h-4" />
              Demonstrate Workflow
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsWorkflowOpen(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Process Flow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Insights Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-time Process Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Trigger Detection</h4>
              <p className="text-xs text-muted-foreground">Monitors form fields for provider data entry</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">CMS NPPES Query</h4>
              <p className="text-xs text-muted-foreground">Validates against official healthcare provider registry</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Database Operations</h4>
              <p className="text-xs text-muted-foreground">UUID-mapped storage with RLS security</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">UI Auto-Population</h4>
              <p className="text-xs text-muted-foreground">Automatically fills verified data fields</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <NPIVerificationWorkflowDemo
        isOpen={isWorkflowOpen}
        onOpenChange={setIsWorkflowOpen}
        triggerData={triggerData}
      />
    </div>
  );
};