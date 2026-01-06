/**
 * API Selection Panel
 * Shows available APIs for a document type with status indicators
 * Indicates which are "ready to use" (free/AI-powered) vs "needs setup" (integration)
 */

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle,
  Settings,
  Sparkles,
  ExternalLink,
  Link2,
  Shield,
  Clock,
  Zap,
  AlertTriangle,
  ChevronRight,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXTERNAL_SYSTEMS_CONFIG, ExternalSystemConfig } from '@/utils/externalSystemsConfig';

export interface APIOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'eligibility' | 'pharmacy' | 'billing' | 'claims' | 'benefits' | 'realtime' | 'clinical' | 'verification' | 'ai-powered';
  status: 'ready' | 'linked' | 'needs-setup';
  provider?: string;
  requiredFields?: string[];
  setupSteps?: string[];
  hipaaCompliant?: boolean;
  authType?: 'oauth2' | 'api_key' | 'basic' | 'free';
  documentationUrl?: string;
}

// Map external system configs to API options
const getAPIOptionsForDocType = (documentTypeId: string): APIOption[] => {
  const options: APIOption[] = [];
  
  // AI-Powered APIs (always ready)
  const aiPoweredAPIs: APIOption[] = [
    {
      id: 'ai-eligibility-analysis',
      name: 'AI Eligibility Analysis',
      description: 'AI-powered insurance coverage analysis using Claude/Gemini',
      icon: '🤖',
      category: 'ai-powered',
      status: 'ready',
      provider: 'Universal AI',
      authType: 'free'
    },
    {
      id: 'ai-benefits-interpretation',
      name: 'AI Benefits Interpretation',
      description: 'Interpret benefits, copays, deductibles from extracted data',
      icon: '📊',
      category: 'ai-powered',
      status: 'ready',
      provider: 'Universal AI',
      authType: 'free'
    },
    {
      id: 'ai-drug-lookup',
      name: 'AI Drug Information',
      description: 'FDA OpenFDA API + AI enrichment for drug details',
      icon: '💊',
      category: 'ai-powered',
      status: 'ready',
      provider: 'OpenFDA + AI',
      authType: 'free'
    },
    {
      id: 'ai-npi-verification',
      name: 'NPI Verification',
      description: 'Free real-time NPI lookup via NPPES Registry',
      icon: '✅',
      category: 'ai-powered',
      status: 'ready',
      provider: 'NPPES Registry',
      authType: 'free'
    }
  ];
  
  // Optum APIs (needs setup)
  const optumAPIs: APIOption[] = [
    {
      id: 'optum-eligibility',
      name: 'Optum Eligibility API',
      description: 'Real-time eligibility verification via Optum/Change Healthcare',
      icon: '🔍',
      category: 'eligibility',
      status: 'needs-setup',
      provider: 'Optum',
      hipaaCompliant: true,
      authType: 'oauth2',
      requiredFields: ['client_id', 'client_secret', 'provider_npi'],
      setupSteps: ['Register at developer.optum.com', 'Request API credentials', 'Complete provider credentialing'],
      documentationUrl: 'https://developer.optum.com'
    },
    {
      id: 'optum-benefits',
      name: 'Optum Benefits & Copay API',
      description: 'Real-time copay, deductible, out-of-pocket via Optum',
      icon: '💵',
      category: 'benefits',
      status: 'needs-setup',
      provider: 'Optum',
      hipaaCompliant: true,
      authType: 'oauth2',
      requiredFields: ['client_id', 'client_secret', 'service_type_codes'],
      setupSteps: ['Enable Eligibility API first', 'Request Benefits scope', 'Map plan codes']
    },
    {
      id: 'optum-pharmacy',
      name: 'Optum Pharmacy Solutions',
      description: 'Pharmacy benefits, formulary status, drug pricing',
      icon: '💊',
      category: 'pharmacy',
      status: 'needs-setup',
      provider: 'Optum',
      hipaaCompliant: true,
      authType: 'oauth2',
      requiredFields: ['client_id', 'client_secret', 'pharmacy_npi'],
      setupSteps: ['Request Pharmacy API access', 'Complete PBM integration', 'Configure formulary access']
    },
    {
      id: 'optum-claims',
      name: 'Optum Claims Submission',
      description: 'Electronic 837 claims submission and status tracking',
      icon: '📤',
      category: 'claims',
      status: 'needs-setup',
      provider: 'Optum',
      hipaaCompliant: true,
      authType: 'oauth2',
      requiredFields: ['client_id', 'client_secret', 'submitter_id'],
      setupSteps: ['Request Claims API access', 'Configure 837 EDI', 'Complete clearinghouse enrollment']
    },
    {
      id: 'optum-payment',
      name: 'Optum Payment & ERA',
      description: 'Payment processing, 835 ERA automation',
      icon: '💰',
      category: 'billing',
      status: 'needs-setup',
      provider: 'Optum',
      hipaaCompliant: true,
      authType: 'oauth2',
      requiredFields: ['client_id', 'client_secret', 'bank_account_token'],
      setupSteps: ['Enable ERA enrollment', 'Link bank account', 'Configure auto-posting rules']
    },
    {
      id: 'optum-real',
      name: 'Optum Real-Time Exchange',
      description: 'Real-time eligibility + claims in single transaction',
      icon: '⚡',
      category: 'realtime',
      status: 'needs-setup',
      provider: 'Optum',
      hipaaCompliant: true,
      authType: 'oauth2',
      requiredFields: ['client_id', 'client_secret', 'provider_npi', 'real_time_enrollment'],
      setupSteps: ['Complete standard API setup', 'Request Real-Time access', 'Pass connectivity testing']
    }
  ];
  
  // Filter based on document type relevance
  switch (documentTypeId) {
    case 'insurance':
      return [
        aiPoweredAPIs[0], aiPoweredAPIs[1], aiPoweredAPIs[3], // AI eligibility, benefits, NPI
        optumAPIs[0], optumAPIs[1], optumAPIs[5] // Optum eligibility, benefits, real-time
      ];
    case 'prescription':
      return [
        aiPoweredAPIs[2], aiPoweredAPIs[0], aiPoweredAPIs[1], // AI drug, eligibility, benefits
        optumAPIs[2], optumAPIs[1] // Optum pharmacy, benefits
      ];
    case 'invoice':
    case 'billing':
      return [
        aiPoweredAPIs[0], aiPoweredAPIs[1], // AI eligibility, benefits
        optumAPIs[3], optumAPIs[4], optumAPIs[0], optumAPIs[1] // Optum claims, payment, eligibility, benefits
      ];
    case 'patient-onboarding':
      return [
        aiPoweredAPIs[3], aiPoweredAPIs[0], aiPoweredAPIs[1], // NPI, eligibility, benefits
        optumAPIs[0], optumAPIs[1] // Optum eligibility, benefits
      ];
    default:
      return [...aiPoweredAPIs, ...optumAPIs.slice(0, 3)];
  }
};

interface APISelectionPanelProps {
  documentTypeId: string;
  selectedAPIs: string[];
  onSelectionChange: (apis: string[]) => void;
  onAPISetupRequested?: (apiId: string) => void;
  compact?: boolean;
}

export const APISelectionPanel: React.FC<APISelectionPanelProps> = ({
  documentTypeId,
  selectedAPIs,
  onSelectionChange,
  onAPISetupRequested,
  compact = false
}) => {
  const apiOptions = useMemo(() => getAPIOptionsForDocType(documentTypeId), [documentTypeId]);
  
  const readyAPIs = apiOptions.filter(api => api.status === 'ready' || api.status === 'linked');
  const setupAPIs = apiOptions.filter(api => api.status === 'needs-setup');
  
  const toggleAPI = (apiId: string) => {
    const api = apiOptions.find(a => a.id === apiId);
    
    // If selecting a needs-setup API, trigger setup flow
    if (api?.status === 'needs-setup' && !selectedAPIs.includes(apiId)) {
      onAPISetupRequested?.(apiId);
    }
    
    onSelectionChange(
      selectedAPIs.includes(apiId)
        ? selectedAPIs.filter(id => id !== apiId)
        : [...selectedAPIs, apiId]
    );
  };
  
  const getStatusBadge = (api: APIOption) => {
    switch (api.status) {
      case 'ready':
        return (
          <Badge variant="outline" className="text-[9px] bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300">
            <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Ready to Use
          </Badge>
        );
      case 'linked':
        return (
          <Badge variant="outline" className="text-[9px] bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300">
            <Link2 className="h-2.5 w-2.5 mr-0.5" /> Linked
          </Badge>
        );
      case 'needs-setup':
        return (
          <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300">
            <Settings className="h-2.5 w-2.5 mr-0.5" /> Setup Needed
          </Badge>
        );
    }
  };
  
  const renderAPICard = (api: APIOption, isCompact: boolean) => {
    const isSelected = selectedAPIs.includes(api.id);
    
    return (
      <TooltipProvider key={api.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all",
                isSelected
                  ? api.status === 'needs-setup'
                    ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
                    : "border-green-400 bg-green-50/50 dark:bg-green-950/30"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
              onClick={() => toggleAPI(api.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted text-lg">
                  {api.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{api.name}</span>
                    {getStatusBadge(api)}
                    {isSelected && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  {!isCompact && (
                    <p className="text-xs text-muted-foreground mt-0.5">{api.description}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[10px]">
                    {api.provider && (
                      <span className="flex items-center gap-0.5 text-muted-foreground">
                        <Building2 className="h-2.5 w-2.5" /> {api.provider}
                      </span>
                    )}
                    {api.hipaaCompliant && (
                      <span className="flex items-center gap-0.5 text-green-600">
                        <Shield className="h-2.5 w-2.5" /> HIPAA
                      </span>
                    )}
                    {api.authType === 'free' && (
                      <span className="flex items-center gap-0.5 text-green-600">
                        <Zap className="h-2.5 w-2.5" /> No API Key Needed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          {api.status === 'needs-setup' && api.setupSteps && (
            <TooltipContent side="right" className="max-w-[280px] p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Settings className="h-4 w-4 text-amber-500" />
                  Setup Required
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground mb-2">Required credentials:</p>
                  <ul className="space-y-1">
                    {api.requiredFields?.map((field, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span className="capitalize">{field.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {api.documentationUrl && (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                    <a href={api.documentationUrl} target="_blank" rel="noopener noreferrer">
                      View Documentation <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Ready to Use Section */}
      {readyAPIs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Sparkles className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              Ready to Use (No API Keys Required)
            </span>
          </div>
          <div className={cn("space-y-2", compact ? "grid grid-cols-2 gap-2 space-y-0" : "")}>
            {readyAPIs.map(api => renderAPICard(api, compact))}
          </div>
        </div>
      )}
      
      {readyAPIs.length > 0 && setupAPIs.length > 0 && (
        <Separator className="my-3" />
      )}
      
      {/* Needs Setup Section */}
      {setupAPIs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Settings className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Integration APIs (Setup Required)
            </span>
          </div>
          <div className={cn("space-y-2", compact ? "grid grid-cols-2 gap-2 space-y-0" : "")}>
            {setupAPIs.map(api => renderAPICard(api, compact))}
          </div>
        </div>
      )}
      
      {/* Info about API selection */}
      {selectedAPIs.length > 0 && (
        <Alert className="bg-muted/50 border-muted-foreground/20">
          <AlertDescription className="text-xs flex items-center justify-between">
            <span>
              <span className="font-medium">{selectedAPIs.length}</span> API(s) selected
              {selectedAPIs.some(id => setupAPIs.find(a => a.id === id)) && (
                <span className="text-amber-600 ml-2">
                  • Some require setup before use
                </span>
              )}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Export for canvas integration
export { getAPIOptionsForDocType, type APIOption as APIOptionType };
