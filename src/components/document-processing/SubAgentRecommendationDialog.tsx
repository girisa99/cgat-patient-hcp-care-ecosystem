/**
 * Sub-Agent Recommendation Dialog
 * Clean, focused dialog for recommending sub-agents based on document type
 * Separate from the main architecture panel - focuses only on sub-agent workflows
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  CheckCircle,
  XCircle,
  Brain
} from 'lucide-react';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SubAgentRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentTypeConfig;
  extractedData?: Record<string, any>;
}

interface SubAgentSuggestion {
  id: string;
  name: string;
  description: string;
  icon: string;
  useCase: string;
  triggerCondition: string;
  architectureType: 'a2a' | 'agentic' | 'multi-agent' | 'single';
}

// Document-type specific sub-agent suggestions
const DOCUMENT_TYPE_SUBAGENTS: Record<string, SubAgentSuggestion[]> = {
  'insurance': [
    {
      id: 'insurance-verification',
      name: 'Insurance Verification Agent',
      description: 'Verifies insurance eligibility and coverage in real-time via payer APIs',
      icon: '🔍',
      useCase: 'insurance-verification',
      triggerCondition: 'After insurance card is processed',
      architectureType: 'a2a'
    },
    {
      id: 'eligibility-check',
      name: 'Eligibility Check Agent',
      description: 'Checks patient eligibility for specific services and procedures',
      icon: '✅',
      useCase: 'eligibility-check',
      triggerCondition: 'When coverage details are extracted',
      architectureType: 'agentic'
    },
    {
      id: 'benefits-verification',
      name: 'Benefits Verification Agent',
      description: 'Checks specific benefit coverage, copays, deductibles',
      icon: '💵',
      useCase: 'benefits-verification',
      triggerCondition: 'When benefit details needed',
      architectureType: 'a2a'
    },
    {
      id: 'prior-auth',
      name: 'Prior Authorization Agent',
      description: 'Automates prior authorization requests and status tracking',
      icon: '📋',
      useCase: 'prior-authorization',
      triggerCondition: 'When procedure requires pre-approval',
      architectureType: 'multi-agent'
    }
  ],
  'prescription': [
    {
      id: 'drug-interaction',
      name: 'Drug Interaction Checker',
      description: 'Checks for drug-drug and drug-allergy interactions',
      icon: '⚠️',
      useCase: 'drug-interaction',
      triggerCondition: 'When medication is identified',
      architectureType: 'agentic'
    },
    {
      id: 'medication-reconciliation',
      name: 'Medication Reconciliation Agent',
      description: 'Reconciles medications across care settings',
      icon: '📊',
      useCase: 'medication-reconciliation',
      triggerCondition: 'When patient transitions care',
      architectureType: 'multi-agent'
    },
    {
      id: 'pharmacy-finder',
      name: 'Pharmacy Finder Agent',
      description: 'Finds pharmacies with medication in stock and best pricing',
      icon: '🏥',
      useCase: 'pharmacy-finder',
      triggerCondition: 'When medication availability needed',
      architectureType: 'single'
    },
    {
      id: 'clinical-review',
      name: 'Clinical Review Agent',
      description: 'Reviews prescription for clinical appropriateness',
      icon: '🩺',
      useCase: 'clinical-review',
      triggerCondition: 'After medication extraction',
      architectureType: 'agentic'
    }
  ],
  'patient-onboarding': [
    {
      id: 'npi-verification',
      name: 'NPI Verification Agent',
      description: 'Verifies NPI numbers against NPPES database',
      icon: '✅',
      useCase: 'npi-verification',
      triggerCondition: 'When provider NPI is captured',
      architectureType: 'a2a'
    },
    {
      id: 'credentialing',
      name: 'Credentialing Agent',
      description: 'Automates provider credentialing verification',
      icon: '📜',
      useCase: 'credentialing',
      triggerCondition: 'When credentials need verification',
      architectureType: 'multi-agent'
    },
    {
      id: 'identity-verification',
      name: 'Identity Verification Agent',
      description: 'Verifies patient identity via document checks',
      icon: '🆔',
      useCase: 'identity-verification',
      triggerCondition: 'During new patient registration',
      architectureType: 'agentic'
    }
  ],
  'treatment-center': [
    {
      id: 'facility-credentialing',
      name: 'Facility Credentialing Agent',
      description: 'Handles treatment center licensing verification',
      icon: '🏢',
      useCase: 'facility-credentialing',
      triggerCondition: 'When facility onboarding initiated',
      architectureType: 'multi-agent'
    },
    {
      id: 'npi-registry',
      name: 'NPI Registry Agent',
      description: 'Verifies facility and provider NPIs',
      icon: '✅',
      useCase: 'npi-verification',
      triggerCondition: 'When NPI captured in documents',
      architectureType: 'a2a'
    },
    {
      id: 'compliance-check',
      name: 'Compliance Verification Agent',
      description: 'Checks regulatory compliance status',
      icon: '📋',
      useCase: 'compliance-verification',
      triggerCondition: 'When compliance docs processed',
      architectureType: 'agentic'
    }
  ],
  'invoice': [
    {
      id: 'claims-processor',
      name: 'Claims Processing Agent',
      description: 'Automates claims submission and tracking',
      icon: '📄',
      useCase: 'claims-processing',
      triggerCondition: 'When invoice ready for claims',
      architectureType: 'multi-agent'
    },
    {
      id: 'denial-management',
      name: 'Denial Management Agent',
      description: 'Handles claim denials and appeals',
      icon: '🔄',
      useCase: 'denial-management',
      triggerCondition: 'When claim is denied',
      architectureType: 'agentic'
    },
    {
      id: 'payment-posting',
      name: 'Payment Posting Agent',
      description: 'Automates ERA/EOB processing',
      icon: '💰',
      useCase: 'payment-posting',
      triggerCondition: 'When payment received',
      architectureType: 'a2a'
    }
  ],
  'xray': [
    {
      id: 'radiology-ai',
      name: 'Radiology AI Agent',
      description: 'AI-powered image analysis for X-ray interpretation',
      icon: '🔬',
      useCase: 'radiology-ai',
      triggerCondition: 'When X-ray image uploaded',
      architectureType: 'agentic'
    },
    {
      id: 'report-generation',
      name: 'Radiology Report Agent',
      description: 'Generates structured radiology reports',
      icon: '📝',
      useCase: 'radiology-report',
      triggerCondition: 'After AI analysis complete',
      architectureType: 'single'
    }
  ],
  'ct-scan': [
    {
      id: 'ct-analysis',
      name: 'CT Analysis Agent',
      description: 'Deep learning analysis for CT scan interpretation',
      icon: '🧠',
      useCase: 'ct-analysis',
      triggerCondition: 'When CT scan uploaded',
      architectureType: 'agentic'
    }
  ],
  'mri': [
    {
      id: 'mri-analysis',
      name: 'MRI Analysis Agent',
      description: 'AI-powered MRI interpretation and segmentation',
      icon: '🧠',
      useCase: 'mri-analysis',
      triggerCondition: 'When MRI scan uploaded',
      architectureType: 'agentic'
    }
  ],
  'ecg': [
    {
      id: 'ecg-interpretation',
      name: 'ECG Interpretation Agent',
      description: 'AI-powered ECG rhythm analysis',
      icon: '❤️',
      useCase: 'ecg-interpretation',
      triggerCondition: 'When ECG uploaded',
      architectureType: 'agentic'
    }
  ],
  'lab-results': [
    {
      id: 'critical-value-alert',
      name: 'Critical Value Alert Agent',
      description: 'Monitors for critical lab values and sends alerts',
      icon: '🚨',
      useCase: 'critical-value-alerting',
      triggerCondition: 'When lab result contains critical values',
      architectureType: 'a2a'
    },
    {
      id: 'trend-analysis',
      name: 'Lab Trend Analysis Agent',
      description: 'Analyzes historical lab trends and patterns',
      icon: '📈',
      useCase: 'lab-trend-analysis',
      triggerCondition: 'When comparing with historical results',
      architectureType: 'agentic'
    }
  ]
};

const getArchitectureBadge = (type: string) => {
  switch (type) {
    case 'a2a':
      return <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">A2A Protocol</Badge>;
    case 'agentic':
      return <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">Agentic AI</Badge>;
    case 'multi-agent':
      return <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Multi-Agent</Badge>;
    case 'single':
      return <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-700 border-gray-200">Single Agent</Badge>;
    default:
      return null;
  }
};

export default function SubAgentRecommendationDialog({
  open,
  onOpenChange,
  documentType,
  extractedData
}: SubAgentRecommendationDialogProps) {
  const navigate = useNavigate();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Get suggestions for current document type
  const suggestions = useMemo(() => {
    return DOCUMENT_TYPE_SUBAGENTS[documentType.id] || [];
  }, [documentType.id]);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleBuildAgents = () => {
    const selectedSubAgents = suggestions.filter(s => selectedAgents.includes(s.id));
    
    navigate('/agents/canvas', {
      state: {
        prefillContext: {
          name: `${documentType.title} Processing Workflow`,
          useCase: documentType.id,
          description: `Automated workflow for processing ${documentType.title.toLowerCase()} documents`,
          subAgents: selectedSubAgents.map(agent => ({
            id: agent.id,
            name: agent.name,
            useCase: agent.useCase,
            triggerCondition: agent.triggerCondition,
            architectureType: agent.architectureType,
            icon: agent.icon
          }))
        }
      }
    });
    
    onOpenChange(false);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            Would you like to add follow-up agents?
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select agents to automate processing for {documentType.title}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Agent List */}
        <ScrollArea className="flex-1 min-h-0 max-h-[45vh] pr-2">
          <div className="space-y-2 py-2">
            {suggestions.map(agent => (
              <div
                key={agent.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  selectedAgents.includes(agent.id)
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onClick={() => toggleAgent(agent.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">{agent.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{agent.name}</span>
                      {selectedAgents.includes(agent.id) && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {getArchitectureBadge(agent.architectureType)}
                      <span className="text-[10px] text-amber-600">⚡ {agent.triggerCondition}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Fixed Bottom Section - Always Visible */}
        <div className="flex-shrink-0 pt-3 border-t space-y-3">
          {selectedAgents.length > 0 && (
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                {selectedAgents.length} agent(s) selected
              </span>
            </div>
          )}

          {/* Action Buttons - Clear Yes/No */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
            >
              <XCircle className="h-4 w-4 mr-2" />
              No, Skip
            </Button>
            <Button 
              className="flex-1"
              onClick={handleBuildAgents}
              disabled={selectedAgents.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Yes, Build
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
