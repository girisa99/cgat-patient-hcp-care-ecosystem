/**
 * INTEGRATION TARGET SELECTOR
 * Select where to deploy/integrate the agent:
 * - Patient Enrollment forms
 * - Order Management
 * - Treatment Center Onboarding
 * - Custom integration points
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserPlus, 
  Package, 
  Building2, 
  FileText, 
  MessageSquare,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationTarget {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'workflow' | 'channel' | 'custom';
  route?: string;
  isEnabled: boolean;
  config?: Record<string, any>;
}

interface IntegrationTargetSelectorProps {
  agentId: string;
  agentUseCase?: string;
  onSelectTargets: (targets: string[]) => void;
  selectedTargets: string[];
}

export const IntegrationTargetSelector: React.FC<IntegrationTargetSelectorProps> = ({
  agentId,
  agentUseCase,
  onSelectTargets,
  selectedTargets
}) => {
  const [targets, setTargets] = useState<IntegrationTarget[]>([]);

  useEffect(() => {
    // Generate universal targets that work for ALL use cases
    const workflowTargets: IntegrationTarget[] = [
      {
        id: 'patient-enrollment',
        name: 'Patient Enrollment',
        description: 'Integrate with patient enrollment forms and workflows',
        icon: <UserPlus className="h-4 w-4" />,
        category: 'workflow',
        route: '/patient-onboarding',
        isEnabled: true,
      },
      {
        id: 'order-management',
        name: 'Order Management',
        description: 'Connect to order status tracking and updates',
        icon: <Package className="h-4 w-4" />,
        category: 'workflow',
        route: '/order-management',
        isEnabled: true,
      },
      {
        id: 'treatment-center-onboarding',
        name: 'Treatment Center Onboarding',
        description: 'Support treatment center registration workflows',
        icon: <Building2 className="h-4 w-4" />,
        category: 'workflow',
        route: '/treatment-center-onboarding',
        isEnabled: true,
      },
      {
        id: 'manufacturing-onboarding',
        name: 'Manufacturing Onboarding',
        description: 'Manufacturing partner registration and compliance',
        icon: <Building2 className="h-4 w-4" />,
        category: 'workflow',
        route: '/manufacturing-onboarding',
        isEnabled: true,
      },
      {
        id: 'npi-registry',
        name: 'NPI Registry Verification',
        description: 'Verify healthcare provider NPI numbers',
        icon: <FileText className="h-4 w-4" />,
        category: 'workflow',
        isEnabled: true,
      },
      {
        id: 'credentialing',
        name: 'Provider Credentialing',
        description: 'Healthcare provider credentialing workflow',
        icon: <FileText className="h-4 w-4" />,
        category: 'workflow',
        isEnabled: true,
      },
      {
        id: 'document-processing',
        name: 'Document Processing',
        description: 'Handle document uploads, OCR, and validation',
        icon: <FileText className="h-4 w-4" />,
        category: 'workflow',
        isEnabled: true,
      },
      {
        id: 'insurance-verification',
        name: 'Insurance Verification',
        description: 'Verify patient insurance and benefits',
        icon: <FileText className="h-4 w-4" />,
        category: 'workflow',
        isEnabled: true,
      },
    ];

    const channelTargets: IntegrationTarget[] = [
      {
        id: 'web-chat',
        name: 'Web Chat Widget',
        description: 'Embed chat widget on web pages',
        icon: <MessageSquare className="h-4 w-4" />,
        category: 'channel',
        isEnabled: true,
      },
      {
        id: 'voice-call',
        name: 'Voice Call',
        description: 'Handle inbound and outbound voice calls',
        icon: <Phone className="h-4 w-4" />,
        category: 'channel',
        isEnabled: true,
      },
      {
        id: 'email',
        name: 'Email Integration',
        description: 'Process and respond to emails',
        icon: <Mail className="h-4 w-4" />,
        category: 'channel',
        isEnabled: true,
      },
      {
        id: 'api',
        name: 'API Endpoint',
        description: 'Expose agent as REST API',
        icon: <Globe className="h-4 w-4" />,
        category: 'channel',
        isEnabled: true,
      },
      {
        id: 'sms',
        name: 'SMS/Text Messaging',
        description: 'Send and receive SMS messages',
        icon: <MessageSquare className="h-4 w-4" />,
        category: 'channel',
        isEnabled: true,
      },
    ];

    // Prioritize targets based on use case (universal matching)
    let sortedTargets = [...workflowTargets, ...channelTargets];
    
    if (agentUseCase) {
      const useCaseLower = agentUseCase.toLowerCase();
      
      // Match patterns for all use cases
      const priorityMap: { [key: string]: string[] } = {
        'patient': ['patient-enrollment', 'web-chat', 'insurance-verification'],
        'enrollment': ['patient-enrollment', 'web-chat', 'document-processing'],
        'order': ['order-management', 'web-chat', 'email', 'sms'],
        'treatment': ['treatment-center-onboarding', 'web-chat', 'credentialing'],
        'center': ['treatment-center-onboarding', 'web-chat'],
        'manufacturing': ['manufacturing-onboarding', 'web-chat', 'api'],
        'npi': ['npi-registry', 'api', 'credentialing'],
        'credential': ['credentialing', 'npi-registry', 'document-processing'],
        'insurance': ['insurance-verification', 'patient-enrollment', 'document-processing'],
        'document': ['document-processing', 'api', 'email'],
        'onboarding': ['patient-enrollment', 'treatment-center-onboarding', 'web-chat'],
      };
      
      // Find matching priorities
      for (const [key, priorities] of Object.entries(priorityMap)) {
        if (useCaseLower.includes(key)) {
          sortedTargets = sortedTargets.sort((a, b) => {
            const aIndex = priorities.indexOf(a.id);
            const bIndex = priorities.indexOf(b.id);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
          break;
        }
      }
    }

    setTargets(sortedTargets);
  }, [agentUseCase]);

  const handleToggleTarget = (targetId: string) => {
    const newSelected = selectedTargets.includes(targetId)
      ? selectedTargets.filter(t => t !== targetId)
      : [...selectedTargets, targetId];
    onSelectTargets(newSelected);
  };

  const getRecommendedTargets = () => {
    if (!agentUseCase) return ['web-chat'];
    const useCaseLower = agentUseCase.toLowerCase();
    
    // Universal recommendations for ALL use cases
    const recommendationMap: { [key: string]: string[] } = {
      'patient': ['patient-enrollment', 'web-chat', 'insurance-verification'],
      'enrollment': ['patient-enrollment', 'web-chat'],
      'order': ['order-management', 'web-chat', 'email', 'sms'],
      'treatment': ['treatment-center-onboarding', 'web-chat'],
      'center': ['treatment-center-onboarding', 'web-chat'],
      'manufacturing': ['manufacturing-onboarding', 'api', 'web-chat'],
      'npi': ['npi-registry', 'api', 'credentialing'],
      'credential': ['credentialing', 'npi-registry', 'document-processing'],
      'insurance': ['insurance-verification', 'patient-enrollment'],
      'document': ['document-processing', 'api'],
      'onboarding': ['patient-enrollment', 'web-chat'],
      'verification': ['npi-registry', 'insurance-verification', 'api'],
      'compliance': ['credentialing', 'document-processing', 'api'],
    };
    
    for (const [key, recommendations] of Object.entries(recommendationMap)) {
      if (useCaseLower.includes(key)) {
        return recommendations;
      }
    }
    
    return ['web-chat'];
  };

  const recommendedTargets = getRecommendedTargets();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Workflow Integrations</h3>
        <div className="grid gap-2">
          {targets.filter(t => t.category === 'workflow').map((target) => (
            <Card 
              key={target.id}
              className={`cursor-pointer transition-all ${
                selectedTargets.includes(target.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleToggleTarget(target.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={selectedTargets.includes(target.id)}
                    onChange={() => handleToggleTarget(target.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {target.icon}
                      <span className="font-medium text-sm">{target.name}</span>
                      {recommendedTargets.includes(target.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {target.description}
                    </p>
                  </div>
                  {selectedTargets.includes(target.id) && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Channel Deployments</h3>
        <div className="grid gap-2">
          {targets.filter(t => t.category === 'channel').map((target) => (
            <Card 
              key={target.id}
              className={`cursor-pointer transition-all ${
                selectedTargets.includes(target.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleToggleTarget(target.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={selectedTargets.includes(target.id)}
                    onChange={() => handleToggleTarget(target.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {target.icon}
                      <span className="font-medium text-sm">{target.name}</span>
                      {recommendedTargets.includes(target.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {target.description}
                    </p>
                  </div>
                  {selectedTargets.includes(target.id) && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedTargets.length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-xs text-muted-foreground mb-2">
            Selected {selectedTargets.length} integration target(s)
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedTargets.map(targetId => {
              const target = targets.find(t => t.id === targetId);
              return target ? (
                <Badge key={targetId} variant="outline" className="text-xs">
                  {target.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
