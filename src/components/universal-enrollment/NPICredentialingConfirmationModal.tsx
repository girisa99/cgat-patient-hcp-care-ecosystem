/**
 * NPI & CREDENTIALING CONFIRMATION MODAL
 * Shows user what will be verified and gets confirmation before triggering agents
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Building2, 
  Users, 
  Globe, 
  Database,
  FileCheck,
  Stethoscope,
  CreditCard,
  Activity,
  Clock
} from 'lucide-react';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface NPICredentialingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (preferences: CredentialingPreferences) => void;
  moduleType: ModuleType;
  agentType: 'mcp_stepwise' | 'structured' | 'conversational';
}

interface CredentialingPreferences {
  enableNPIVerification: boolean;
  enableLicenseVerification: boolean;
  enableDEAVerification: boolean;
  enableInsuranceCredentialing: boolean;
  autoTrigger: boolean;
  requireManualApproval: boolean;
}

export const NPICredentialingConfirmationModal: React.FC<NPICredentialingConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  moduleType,
  agentType
}) => {
  const [preferences, setPreferences] = useState<CredentialingPreferences>({
    enableNPIVerification: true,
    enableLicenseVerification: true,
    enableDEAVerification: moduleType === 'treatment_center',
    enableInsuranceCredentialing: moduleType !== 'customer',
    autoTrigger: false,
    requireManualApproval: true
  });

  const getVerificationDetails = () => {
    const details = {
      patient: {
        title: 'Patient & Provider Verification',
        description: 'Verify patient information and referring provider credentials',
        verifications: [
          { name: 'Provider NPI Verification', api: 'NPPES Registry API', description: 'Verify referring provider NPI and basic information' },
          { name: 'Insurance Verification', api: 'Eligibility API', description: 'Verify patient insurance coverage and benefits' },
          { name: 'Clinical History', api: 'Internal Database', description: 'Cross-reference patient medical records' }
        ]
      },
      treatment_center: {
        title: 'Treatment Center Credentialing',
        description: 'Comprehensive facility and provider credentialing verification',
        verifications: [
          { name: 'Facility NPI Verification', api: 'NPPES Registry API', description: 'Verify facility NPI, type 2 provider information' },
          { name: 'Provider License Verification', api: 'State Medical Board APIs', description: 'Verify medical licenses across all states' },
          { name: 'DEA Registration', api: 'DEA Verification System', description: 'Verify DEA registration for controlled substances' },
          { name: 'Accreditation Status', api: 'Joint Commission API', description: 'Verify healthcare facility accreditation' },
          { name: 'Insurance Credentialing', api: 'CAQH ProView API', description: 'Verify provider insurance panel participation' },
          { name: 'Compliance Monitoring', api: 'OIG Exclusion API', description: 'Check exclusion lists and sanctions' }
        ]
      },
      customer: {
        title: 'Customer Verification',
        description: 'Basic identity and business verification',
        verifications: [
          { name: 'Business Verification', api: 'D&B API', description: 'Verify business registration and standing' },
          { name: 'Tax ID Verification', api: 'IRS API', description: 'Verify federal tax identification' },
          { name: 'Contact Verification', api: 'Internal System', description: 'Verify contact information and communications' }
        ]
      },
      manufacturer: {
        title: 'Manufacturer Credentialing',
        description: 'FDA registration and manufacturing compliance verification',
        verifications: [
          { name: 'FDA Registration', api: 'FDA Establishment API', description: 'Verify FDA facility registration' },
          { name: 'Manufacturing License', api: 'State Board APIs', description: 'Verify state manufacturing licenses' },
          { name: 'Quality Certifications', api: 'ISO Registry API', description: 'Verify quality management certifications' },
          { name: 'Product Registration', api: 'FDA NDC API', description: 'Verify product registrations and NDC numbers' },
          { name: 'Supply Chain Verification', api: 'DSCSA API', description: 'Verify drug supply chain security compliance' }
        ]
      }
    };
    return details[moduleType];
  };

  const getAgentCapabilities = () => {
    const capabilities = {
      mcp_stepwise: {
        realTimeSync: true,
        mcpIntegration: true,
        autoValidation: true,
        structuredData: true,
        smartRetry: true,
        timeEstimate: '5-8 minutes'
      },
      structured: {
        realTimeSync: false,
        mcpIntegration: false,
        autoValidation: true,
        structuredData: true,
        smartRetry: false,
        timeEstimate: '8-12 minutes'
      },
      conversational: {
        realTimeSync: false,
        mcpIntegration: false,
        autoValidation: true,
        structuredData: false,
        smartRetry: false,
        timeEstimate: '10-15 minutes'
      }
    };
    return capabilities[agentType];
  };

  const handleConfirm = () => {
    onConfirm(preferences);
    onClose();
  };

  const verificationDetails = getVerificationDetails();
  const agentCapabilities = getAgentCapabilities();
  const isHealthcareModule = moduleType === 'patient' || moduleType === 'treatment_center';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {verificationDetails.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Capabilities Overview */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {agentType === 'mcp_stepwise' && 'MCP Stepwise Agent'} 
                  {agentType === 'structured' && 'Structured AI Agent'}
                  {agentType === 'conversational' && 'Conversational AI Agent'} 
                  - {verificationDetails.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {agentCapabilities.realTimeSync && <Badge variant="default">Real-time Sync</Badge>}
                  {agentCapabilities.mcpIntegration && <Badge variant="default">MCP Integration</Badge>}
                  {agentCapabilities.autoValidation && <Badge variant="secondary">Auto Validation</Badge>}
                  {agentCapabilities.structuredData && <Badge variant="secondary">Structured Data</Badge>}
                  <Badge variant="outline">{agentCapabilities.timeEstimate}</Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Verification Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Verification & Credentialing Process
            </h3>
            
            <div className="grid gap-3">
              {verificationDetails.verifications.map((verification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-0.5">
                    {verification.name.includes('NPI') && <Building2 className="h-4 w-4 text-blue-500" />}
                    {verification.name.includes('License') && <FileCheck className="h-4 w-4 text-green-500" />}
                    {verification.name.includes('DEA') && <Shield className="h-4 w-4 text-orange-500" />}
                    {verification.name.includes('Insurance') && <CreditCard className="h-4 w-4 text-purple-500" />}
                    {verification.name.includes('Clinical') && <Stethoscope className="h-4 w-4 text-red-500" />}
                    {verification.name.includes('Business') && <Building2 className="h-4 w-4 text-blue-500" />}
                    {verification.name.includes('FDA') && <Shield className="h-4 w-4 text-red-500" />}
                    {verification.name.includes('Quality') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {!verification.name.match(/(NPI|License|DEA|Insurance|Clinical|Business|FDA|Quality)/) && <Activity className="h-4 w-4 text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{verification.name}</span>
                      <Badge variant="outline" className="text-xs">{verification.api}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{verification.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Preferences */}
          {isHealthcareModule && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Verification Preferences
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="npi-verification"
                    checked={preferences.enableNPIVerification}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, enableNPIVerification: !!checked }))
                    }
                  />
                  <label htmlFor="npi-verification" className="text-sm font-medium">
                    Enable NPI Verification
                  </label>
                  <Badge variant="default" className="text-xs">Required</Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="license-verification"
                    checked={preferences.enableLicenseVerification}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, enableLicenseVerification: !!checked }))
                    }
                  />
                  <label htmlFor="license-verification" className="text-sm font-medium">
                    Enable License Verification
                  </label>
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </div>

                {moduleType === 'treatment_center' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dea-verification"
                      checked={preferences.enableDEAVerification}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, enableDEAVerification: !!checked }))
                      }
                    />
                    <label htmlFor="dea-verification" className="text-sm font-medium">
                      Enable DEA Registration Verification
                    </label>
                    <Badge variant="secondary" className="text-xs">For Controlled Substances</Badge>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="insurance-credentialing"
                    checked={preferences.enableInsuranceCredentialing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, enableInsuranceCredentialing: !!checked }))
                    }
                  />
                  <label htmlFor="insurance-credentialing" className="text-sm font-medium">
                    Enable Insurance Credentialing
                  </label>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Trigger Preferences</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-trigger"
                    checked={preferences.autoTrigger}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, autoTrigger: !!checked }))
                    }
                  />
                  <label htmlFor="auto-trigger" className="text-sm">
                    Auto-trigger verification when provider information is entered
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="manual-approval"
                    checked={preferences.requireManualApproval}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, requireManualApproval: !!checked }))
                    }
                  />
                  <label htmlFor="manual-approval" className="text-sm">
                    Require manual approval before running verification
                  </label>
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Security & Compliance Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Security & Compliance</p>
                <ul className="text-sm space-y-1">
                  <li>• All verification data is encrypted in transit and at rest</li>
                  <li>• HIPAA compliant handling of all healthcare information</li>
                  <li>• Audit logs maintained for all credentialing activities</li>
                  <li>• API rate limits applied to prevent abuse</li>
                  <li>• Results cached for 30 days to reduce redundant calls</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Estimated Costs */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estimated Processing Time & API Usage
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• NPI Verification: ~2-3 seconds (NPPES Registry - Free)</p>
              <p>• License Verification: ~5-10 seconds per state (State APIs - Varies)</p>
              <p>• DEA Verification: ~3-5 seconds (DEA System - Fee applies)</p>
              <p>• Insurance Credentialing: ~10-15 seconds (CAQH - Fee applies)</p>
              <p>• Total estimated time: {agentCapabilities.timeEstimate}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Start with These Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};