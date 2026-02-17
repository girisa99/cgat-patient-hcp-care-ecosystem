/**
 * Hierarchical Agent Canvas Node Types
 * Canvas nodes for domain orchestrators and sub-agents
 */

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Building2, Shield, Pill, HeartPulse, FileCheck, CreditCard, Banknote, Activity, AlertTriangle, ArrowUpCircle, FileSearch, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Document Router Node (Top-Level)
export const DocumentRouterNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-5 rounded-xl border-3 min-w-[240px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950", selected ? "border-indigo-500 shadow-lg" : "border-indigo-300")}>
    <Handle type="target" position={Position.Top} className="w-4 h-4" />
    <div className="flex items-center gap-2 mb-3">
      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
        <Route className="w-6 h-6 text-indigo-600" />
      </div>
      <div>
        <span className="font-bold text-lg">Document Router</span>
        <div className="text-xs text-muted-foreground">Top-Level Orchestrator</div>
      </div>
    </div>
    <div className="flex gap-1 flex-wrap">
      <Badge variant="secondary" className="text-xs">Classify</Badge>
      <Badge variant="secondary" className="text-xs">Route</Badge>
      <Badge variant="secondary" className="text-xs">Monitor</Badge>
    </div>
    <div className="mt-3 text-xs text-muted-foreground border-t pt-2">
      → Insurance | Coding | Adherence
    </div>
    <Handle type="source" position={Position.Bottom} className="w-4 h-4" />
  </div>
);

// Insurance Pipeline Nodes
export const InsuranceOrchestratorNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-4 rounded-lg border-2 min-w-[200px] bg-blue-50 dark:bg-blue-950", selected ? "border-blue-500" : "border-blue-300")}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <Building2 className="w-5 h-5 text-blue-600" />
      <span className="font-semibold">Insurance Orchestrator</span>
    </div>
    <Badge variant="outline" className="text-xs">Pipeline Pattern</Badge>
    <div className="mt-2 text-xs text-muted-foreground">V → B → PA → C → AF</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

export const VerificationAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-green-50 dark:bg-green-950", selected ? "border-green-500" : "border-green-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <Shield className="w-4 h-4 text-green-600" />
      <span className="font-medium text-sm">Verification</span>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{(data as any)?.status || 'pending'}</div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

export const BenefitsAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-purple-50 dark:bg-purple-950", selected ? "border-purple-500" : "border-purple-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <FileCheck className="w-4 h-4 text-purple-600" />
      <span className="font-medium text-sm">Benefits Investigation</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

export const PriorAuthAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-orange-50 dark:bg-orange-950", selected ? "border-orange-500" : "border-orange-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <FileCheck className="w-4 h-4 text-orange-600" />
      <span className="font-medium text-sm">Prior Authorization</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

export const CopayAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-teal-50 dark:bg-teal-950", selected ? "border-teal-500" : "border-teal-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <CreditCard className="w-4 h-4 text-teal-600" />
      <span className="font-medium text-sm">Copay Assistance</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

export const AltFundingAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-emerald-50 dark:bg-emerald-950", selected ? "border-emerald-500" : "border-emerald-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <Banknote className="w-4 h-4 text-emerald-600" />
      <span className="font-medium text-sm">Alt Funding</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

// Coding Nodes
export const CodingOrchestratorNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-4 rounded-lg border-2 min-w-[200px] bg-amber-50 dark:bg-amber-950", selected ? "border-amber-500" : "border-amber-300")}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <Pill className="w-5 h-5 text-amber-600" />
      <span className="font-semibold">Coding Orchestrator</span>
    </div>
    <Badge variant="outline" className="text-xs">Auto-Suggest + Validate</Badge>
    <div className="mt-2 text-xs text-muted-foreground">ICD / HCPCS / NDC</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

// Adherence Nodes
export const AdherenceOrchestratorNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-4 rounded-lg border-2 min-w-[200px] bg-rose-50 dark:bg-rose-950", selected ? "border-rose-500" : "border-rose-300")}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <HeartPulse className="w-5 h-5 text-rose-600" />
      <span className="font-semibold">Adherence Orchestrator</span>
    </div>
    <Badge variant="outline" className="text-xs">Event-Driven</Badge>
    <div className="mt-2 text-xs text-muted-foreground">Monitor → Intervene → Escalate</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

export const MonitoringAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-cyan-50 dark:bg-cyan-950", selected ? "border-cyan-500" : "border-cyan-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <Activity className="w-4 h-4 text-cyan-600" />
      <span className="font-medium text-sm">Monitoring</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

export const InterventionAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-yellow-50 dark:bg-yellow-950", selected ? "border-yellow-500" : "border-yellow-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-yellow-600" />
      <span className="font-medium text-sm">Intervention</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

export const EscalationAgentNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div className={cn("p-3 rounded-lg border-2 min-w-[160px] bg-red-50 dark:bg-red-950", selected ? "border-red-500" : "border-red-300")}>
    <Handle type="target" position={Position.Top} className="w-2 h-2" />
    <div className="flex items-center gap-2">
      <ArrowUpCircle className="w-4 h-4 text-red-600" />
      <span className="font-medium text-sm">Escalation</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
  </div>
);

// Node type registry
export const hierarchicalAgentNodeTypes = {
  documentRouter: DocumentRouterNode,
  insuranceOrchestrator: InsuranceOrchestratorNode,
  verificationAgent: VerificationAgentNode,
  benefitsAgent: BenefitsAgentNode,
  priorAuthAgent: PriorAuthAgentNode,
  copayAgent: CopayAgentNode,
  altFundingAgent: AltFundingAgentNode,
  codingOrchestrator: CodingOrchestratorNode,
  adherenceOrchestrator: AdherenceOrchestratorNode,
  monitoringAgent: MonitoringAgentNode,
  interventionAgent: InterventionAgentNode,
  escalationAgent: EscalationAgentNode,
};

export const HIERARCHICAL_AGENT_NODE_DEFINITIONS = [
  { type: 'documentRouter', label: 'Document Router', category: 'orchestrators', domain: 'router', description: 'Classifies and routes documents to domain pipelines' },
  { type: 'insuranceOrchestrator', label: 'Insurance Orchestrator', category: 'orchestrators', domain: 'insurance' },
  { type: 'verificationAgent', label: 'Verification Agent', category: 'insurance-pipeline', domain: 'insurance' },
  { type: 'benefitsAgent', label: 'Benefits Agent', category: 'insurance-pipeline', domain: 'insurance' },
  { type: 'priorAuthAgent', label: 'Prior Auth Agent', category: 'insurance-pipeline', domain: 'insurance' },
  { type: 'copayAgent', label: 'Copay Agent', category: 'insurance-pipeline', domain: 'insurance' },
  { type: 'altFundingAgent', label: 'Alt Funding Agent', category: 'insurance-pipeline', domain: 'insurance' },
  { type: 'codingOrchestrator', label: 'Coding Orchestrator', category: 'orchestrators', domain: 'medication' },
  { type: 'adherenceOrchestrator', label: 'Adherence Orchestrator', category: 'orchestrators', domain: 'adherence' },
  { type: 'monitoringAgent', label: 'Monitoring Agent', category: 'adherence-pipeline', domain: 'adherence' },
  { type: 'interventionAgent', label: 'Intervention Agent', category: 'adherence-pipeline', domain: 'adherence' },
  { type: 'escalationAgent', label: 'Escalation Agent', category: 'adherence-pipeline', domain: 'adherence' },
];
