/**
 * ENHANCED CANVAS CONTEXT MENU
 * Full node library accessible via right-click
 * Loads categories and nodes from database
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Bot, 
  Database, 
  Workflow,
  MessageSquare,
  Zap,
  GitBranch,
  Play,
  CheckCircle,
  Settings,
  FileInput,
  FileOutput,
  Search,
  Wrench,
  Brain,
  Shield,
  Globe,
  Server,
  Code,
  Mail,
  Users,
  FileText,
  Activity,
  BarChart3,
  Clock,
  Layers,
  Link2,
  Cpu,
  CloudCog
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MULTI_AGENT_NODES, MULTI_AGENT_CATEGORIES } from './MultiAgentNodeRegistry';

interface AgentContext {
  name?: string;
  useCase?: { name: string; description?: string };
  useCaseId?: string;
}

interface CanvasContextMenuProps {
  children: React.ReactNode;
  position: { x: number; y: number };
  onAddNode: (type: string, category: string, label: string, position: { x: number; y: number }) => void;
  agentContext?: AgentContext;
}

interface NodeCategory {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  nodes: NodeType[];
}

interface NodeType {
  id: string;
  type_key: string;
  display_name: string;
  description?: string;
  category_id: string;
}

// Map icon names to Lucide icons
const iconMap: { [key: string]: React.ComponentType<any> } = {
  'workflow': Workflow,
  'bot': Bot,
  'database': Database,
  'zap': Zap,
  'settings': Settings,
  'brain': Brain,
  'shield': Shield,
  'globe': Globe,
  'server': Server,
  'code': Code,
  'mail': Mail,
  'users': Users,
  'file-text': FileText,
  'activity': Activity,
  'bar-chart': BarChart3,
  'clock': Clock,
  'layers': Layers,
  'link': Link2,
  'cpu': Cpu,
  'cloud': CloudCog,
  'wrench': Wrench,
  'message-square': MessageSquare,
  'git-branch': GitBranch,
  'play': Play,
  'check': CheckCircle,
  'file-input': FileInput,
  'file-output': FileOutput,
};

const getIconForCategory = (categoryName: string, iconName?: string): React.ComponentType<any> => {
  if (iconName && iconMap[iconName.toLowerCase()]) {
    return iconMap[iconName.toLowerCase()];
  }
  
  // Fallback based on category name
  const name = categoryName.toLowerCase();
  if (name.includes('ai') || name.includes('agent')) return Bot;
  if (name.includes('workflow') || name.includes('flow')) return Workflow;
  if (name.includes('data')) return Database;
  if (name.includes('integration') || name.includes('api')) return Zap;
  if (name.includes('mcp') || name.includes('connector')) return Wrench;
  if (name.includes('security') || name.includes('auth')) return Shield;
  if (name.includes('analytics') || name.includes('monitor')) return BarChart3;
  if (name.includes('communication') || name.includes('message')) return MessageSquare;
  if (name.includes('healthcare') || name.includes('medical')) return Activity;
  
  return Settings;
};

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  children,
  position,
  onAddNode,
  agentContext,
}) => {
  const [categories, setCategories] = useState<NodeCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get recommended nodes based on use case - UNIVERSAL for ALL use cases
  const getRecommendedNodes = useMemo(() => {
    if (!agentContext?.useCase?.name) return ['agent', 'knowledge_base', 'api', 'database'];
    const useCase = agentContext.useCase.name.toLowerCase();
    
    // Universal recommendation map for ALL use cases
    const recommendationMap: { [key: string]: string[] } = {
      'patient': ['patient_intake', 'npi_verification', 'hipaa_compliance', 'ehr_integration', 'knowledge_base', 'insurance_verification'],
      'enrollment': ['patient_intake', 'document_upload', 'npi_verification', 'consent_form', 'notification', 'form_mapping'],
      'order': ['database', 'notification', 'api', 'email', 'condition', 'status_update'],
      'treatment': ['npi_verification', 'database', 'email', 'notification', 'compliance_check'],
      'center': ['npi_verification', 'database', 'email', 'notification', 'document_upload'],
      'manufacturing': ['api', 'database', 'webhook', 'email', 'compliance_check', 'inventory_check'],
      'npi': ['npi_verification', 'api', 'database', 'validation', 'compliance_check'],
      'credential': ['npi_verification', 'document_upload', 'database', 'compliance_check', 'notification'],
      'insurance': ['insurance_verification', 'patient_intake', 'database', 'api', 'notification'],
      'document': ['document_upload', 'ocr_processor', 'metadata_extractor', 'form_mapping', 'validation', 'database'],
      'prescription': ['document_upload', 'medication_processor', 'ndc_din_matcher', 'quantity_calculator', 'pharmacy_integration'],
      'medication': ['medication_processor', 'ndc_din_matcher', 'quantity_calculator', 'drug_interaction_check', 'pharmacy_integration'],
      'pharmacy': ['medication_processor', 'ndc_din_matcher', 'quantity_calculator', 'inventory_check', 'api'],
      'onboarding': ['patient_intake', 'npi_verification', 'database', 'notification', 'email'],
      'verification': ['npi_verification', 'insurance_verification', 'api', 'validation', 'database'],
      'compliance': ['hipaa_compliance', 'compliance_check', 'audit_log', 'document_upload', 'database'],
      'analytics': ['database', 'transform', 'api', 'visualization', 'notification'],
      'notification': ['email', 'sms', 'push_notification', 'webhook', 'condition'],
      'workflow': ['condition', 'loop', 'parallel', 'transform', 'database'],
    };
    
    // Find matching recommendations
    for (const [key, recommendations] of Object.entries(recommendationMap)) {
      if (useCase.includes(key)) {
        return recommendations;
      }
    }
    
    // Default recommendations
    return ['agent', 'knowledge_base', 'api', 'database', 'notification'];
  }, [agentContext]);

  // Load categories and nodes from database
  useEffect(() => {
    loadCategoriesAndNodes();
  }, []);

  const loadCategoriesAndNodes = async () => {
    setIsLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await (supabase as any)
        .from('workflow_node_categories')
        .select('id, name, description')
        .eq('is_active', true)
        .order('display_order');

      // Load node types
      const { data: nodesData } = await supabase
        .from('workflow_node_types')
        .select('id, type_key, display_name, description, category_id')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesData && nodesData) {
        const categoriesWithNodes: NodeCategory[] = (categoriesData as any[]).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          nodes: (nodesData as any[]).filter((node: any) => node.category_id === cat.id)
        })).filter((cat: NodeCategory) => cat.nodes.length > 0);

        setCategories(categoriesWithNodes);
      }
    } catch (error) {
      console.error('Failed to load node categories:', error);
      // Fallback to static categories
      setCategories(getStaticCategories());
    } finally {
      setIsLoading(false);
    }
  };

  // Static fallback categories
  const getStaticCategories = (): NodeCategory[] => [
    {
      id: 'workflow',
      name: 'Workflow',
      nodes: [
        { id: 'start', type_key: 'start', display_name: 'Start', category_id: 'workflow' },
        { id: 'end', type_key: 'end', display_name: 'End', category_id: 'workflow' },
        { id: 'condition', type_key: 'condition', display_name: 'Condition', category_id: 'workflow' },
        { id: 'loop', type_key: 'loop', display_name: 'Loop', category_id: 'workflow' },
        { id: 'parallel', type_key: 'parallel', display_name: 'Parallel', category_id: 'workflow' },
      ]
    },
    {
      id: 'ai-agents',
      name: 'AI Agents',
      nodes: [
        { id: 'agent', type_key: 'agent', display_name: 'AI Agent', category_id: 'ai-agents' },
        { id: 'multi-agent', type_key: 'multi-agent', display_name: 'Multi-Agent Team', category_id: 'ai-agents' },
        { id: 'llm', type_key: 'llm', display_name: 'LLM Node', category_id: 'ai-agents' },
        { id: 'reasoning', type_key: 'reasoning', display_name: 'Reasoning Agent', category_id: 'ai-agents' },
        { id: 'vision', type_key: 'vision', display_name: 'Vision Agent', category_id: 'ai-agents' },
      ]
    },
    {
      id: 'data',
      name: 'Data',
      nodes: [
        { id: 'database', type_key: 'database', display_name: 'Database', category_id: 'data' },
        { id: 'input', type_key: 'input', display_name: 'Input', category_id: 'data' },
        { id: 'output', type_key: 'output', display_name: 'Output', category_id: 'data' },
        { id: 'knowledge_base', type_key: 'knowledge_base', display_name: 'Knowledge Base', category_id: 'data' },
        { id: 'rag_retrieval', type_key: 'rag_retrieval', display_name: 'RAG Retrieval', category_id: 'data' },
        { id: 'transform', type_key: 'transform', display_name: 'Transform', category_id: 'data' },
      ]
    },
    {
      id: 'integration',
      name: 'Integration',
      nodes: [
        { id: 'api', type_key: 'api', display_name: 'API Call', category_id: 'integration' },
        { id: 'webhook', type_key: 'webhook', display_name: 'Webhook', category_id: 'integration' },
        { id: 'function', type_key: 'function', display_name: 'Function', category_id: 'integration' },
        { id: 'http', type_key: 'http', display_name: 'HTTP Request', category_id: 'integration' },
      ]
    },
    {
      id: 'mcp',
      name: 'MCP Connectors',
      nodes: [
        { id: 'mcp_connector', type_key: 'mcp_connector', display_name: 'MCP Connector', category_id: 'mcp' },
        { id: 'healthcare_mcp', type_key: 'healthcare_mcp', display_name: 'Healthcare MCP', category_id: 'mcp' },
        { id: 'filesystem_mcp', type_key: 'filesystem_mcp', display_name: 'Filesystem MCP', category_id: 'mcp' },
        { id: 'database_mcp', type_key: 'database_mcp', display_name: 'Database MCP', category_id: 'mcp' },
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      nodes: [
        { id: 'npi_verification', type_key: 'npi_verification', display_name: 'NPI Verification', category_id: 'healthcare' },
        { id: 'patient_intake', type_key: 'patient_intake', display_name: 'Patient Intake', category_id: 'healthcare' },
        { id: 'ehr_integration', type_key: 'ehr_integration', display_name: 'EHR Integration', category_id: 'healthcare' },
        { id: 'hipaa_compliance', type_key: 'hipaa_compliance', display_name: 'HIPAA Compliance', category_id: 'healthcare' },
        { id: 'insurance_verification', type_key: 'insurance_verification', display_name: 'Insurance Verification', category_id: 'healthcare' },
      ]
    },
    {
      id: 'document-processing',
      name: 'Document Processing',
      nodes: [
        { id: 'document_upload', type_key: 'document_upload', display_name: 'Document Upload', category_id: 'document-processing' },
        { id: 'ocr_processor', type_key: 'ocr_processor', display_name: 'OCR Processor', category_id: 'document-processing' },
        { id: 'metadata_extractor', type_key: 'metadata_extractor', display_name: 'Metadata Extractor', category_id: 'document-processing' },
        { id: 'table_extractor', type_key: 'table_extractor', display_name: 'Table Extractor', category_id: 'document-processing' },
        { id: 'signature_detector', type_key: 'signature_detector', display_name: 'Signature Detector', category_id: 'document-processing' },
        { id: 'form_mapping', type_key: 'form_mapping', display_name: 'Form Mapping', category_id: 'document-processing' },
        { id: 'document_classifier', type_key: 'document_classifier', display_name: 'Document Classifier', category_id: 'document-processing' },
      ]
    },
    {
      id: 'medication',
      name: 'Medication Processing',
      nodes: [
        { id: 'medication_processor', type_key: 'medication_processor', display_name: 'Medication Processor', category_id: 'medication' },
        { id: 'ndc_din_matcher', type_key: 'ndc_din_matcher', display_name: 'NDC/DIN Matcher', category_id: 'medication' },
        { id: 'quantity_calculator', type_key: 'quantity_calculator', display_name: 'Quantity Calculator', category_id: 'medication' },
        { id: 'drug_interaction_check', type_key: 'drug_interaction_check', display_name: 'Drug Interaction Check', category_id: 'medication' },
        { id: 'prescription_parser', type_key: 'prescription_parser', display_name: 'Prescription Parser', category_id: 'medication' },
        { id: 'pharmacy_integration', type_key: 'pharmacy_integration', display_name: 'Pharmacy Integration', category_id: 'medication' },
      ]
    },
    {
      id: 'communication',
      name: 'Communication',
      nodes: [
        { id: 'email', type_key: 'email', display_name: 'Email', category_id: 'communication' },
        { id: 'sms', type_key: 'sms', display_name: 'SMS', category_id: 'communication' },
        { id: 'notification', type_key: 'notification', display_name: 'Notification', category_id: 'communication' },
        { id: 'voice', type_key: 'voice', display_name: 'Voice Call', category_id: 'communication' },
      ]
    },
  ];

  // Filter categories and nodes based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const term = searchTerm.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      nodes: cat.nodes.filter(node => 
        node.display_name.toLowerCase().includes(term) ||
        node.type_key.toLowerCase().includes(term) ||
        node.description?.toLowerCase().includes(term)
      )
    })).filter(cat => cat.nodes.length > 0 || cat.name.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  // Quick add nodes (most commonly used) - includes document processing + medication
  const quickAddNodes = [
    { type: 'agent', category: 'ai-agents', label: 'AI Agent', icon: Bot },
    { type: 'document_upload', category: 'document-processing', label: 'Document Upload', icon: FileText },
    { type: 'medication_processor', category: 'medication', label: 'Medication Processor', icon: Activity },
    { type: 'ndc_din_matcher', category: 'medication', label: 'NDC/DIN Matcher', icon: Search },
    { type: 'ocr_processor', category: 'document-processing', label: 'OCR Processor', icon: FileText },
    { type: 'condition', category: 'workflow', label: 'Condition', icon: GitBranch },
    { type: 'knowledge_base', category: 'data', label: 'Knowledge Base', icon: Database },
  ];

  // Document Processing nodes for submenu
  const documentProcessingNodes = [
    { type: 'ocr_document', category: 'document_processing', label: 'OCR Document', icon: FileText, description: 'Extract text from images/scans' },
    { type: 'doc_ai', category: 'document_processing', label: 'Document AI', icon: FileText, description: 'Intelligent document analysis' },
    { type: 'metadata_extraction', category: 'document_processing', label: 'Metadata Extraction', icon: FileText, description: 'Extract document metadata' },
    { type: 'form_recognition', category: 'document_processing', label: 'Form Recognition', icon: FileText, description: 'Extract data from forms' },
    { type: 'image_analysis', category: 'document_processing', label: 'Image Analysis', icon: FileText, description: 'Analyze image content' },
    { type: 'document_validation', category: 'document_processing', label: 'Document Validation', icon: FileText, description: 'Validate document authenticity' },
    { type: 'data_extraction', category: 'document_processing', label: 'Data Extraction', icon: Database, description: 'Extract structured data' },
    { type: 'document_comparison', category: 'document_processing', label: 'Document Comparison', icon: FileText, description: 'Compare documents' },
    { type: 'document_archive', category: 'document_processing', label: 'Document Archive', icon: FileText, description: 'Archive with versioning' },
    { type: 'document_to_database', category: 'document_processing', label: 'Doc to Database', icon: Database, description: 'Push to database tables' },
  ];

  // Enhanced Agentic AI nodes for submenu
  const enhancedAgenticNodes = [
    { type: 'plan_execute', category: 'enhanced_agentic', label: 'Plan & Execute', icon: Brain, description: 'Plan-execute-reflect cycle' },
    { type: 'reasoning_chain', category: 'enhanced_agentic', label: 'Reasoning Chain', icon: Link2, description: 'Chain of thought reasoning' },
    { type: 'memory_context', category: 'enhanced_agentic', label: 'Memory & Context', icon: Brain, description: 'Contextual memory management' },
    { type: 'critique_refinement', category: 'enhanced_agentic', label: 'Critique & Refinement', icon: Activity, description: 'Self-critique & improvement' },
    { type: 'multi_perspective', category: 'enhanced_agentic', label: 'Multi-Perspective', icon: Users, description: 'Multiple viewpoint analysis' },
    { type: 'knowledge_integration', category: 'enhanced_agentic', label: 'Knowledge Integration', icon: Database, description: 'Integrate multiple sources' },
    { type: 'hypothesis_testing', category: 'enhanced_agentic', label: 'Hypothesis Testing', icon: Activity, description: 'Generate & test hypotheses' },
    { type: 'skill_composition', category: 'enhanced_agentic', label: 'Skill Composition', icon: Layers, description: 'Compose complex skills' },
    { type: 'adaptive_learning', category: 'enhanced_agentic', label: 'Adaptive Learning', icon: Brain, description: 'Learn from feedback' },
    { type: 'workflow_orchestrator', category: 'enhanced_agentic', label: 'Workflow Orchestrator', icon: GitBranch, description: 'Orchestrate workflows' },
  ];

  // Multi-agent specific nodes for submenu - all 10 node types
  const multiAgentQuickNodes = [
    { type: 'a2a_agent', category: 'multi-agent', label: 'A2A Agent', icon: Users, description: 'Google A2A Protocol agent', subcategory: 'A2A Protocol' },
    { type: 'task_handoff', category: 'multi-agent', label: 'Task Handoff', icon: Zap, description: 'Transfer between agents', subcategory: 'A2A Protocol' },
    { type: 'communication_hub', category: 'multi-agent', label: 'Communication Hub', icon: Server, description: 'Central message routing', subcategory: 'A2A Protocol' },
    { type: 'agent_team', category: 'multi-agent', label: 'Agent Team', icon: Users, description: 'Coordinated agent team', subcategory: 'Orchestration' },
    { type: 'swarm_decision', category: 'multi-agent', label: 'Swarm Decision', icon: Brain, description: 'Collective intelligence', subcategory: 'Orchestration' },
    { type: 'tool_sharing', category: 'multi-agent', label: 'Tool Sharing', icon: Layers, description: 'Share tools between agents', subcategory: 'Orchestration' },
    { type: 'react_loop', category: 'multi-agent', label: 'ReAct Loop', icon: Brain, description: 'Reasoning + Acting loop', subcategory: 'Agentic AI' },
    { type: 'tool_chain', category: 'multi-agent', label: 'Tool Chain', icon: Link2, description: 'Sequential tool execution', subcategory: 'Agentic AI' },
    { type: 'self_reflection', category: 'multi-agent', label: 'Self Reflection', icon: Activity, description: 'Self-evaluation & adjustment', subcategory: 'Agentic AI' },
    { type: 'goal_decomposition', category: 'multi-agent', label: 'Goal Decomposition', icon: GitBranch, description: 'Break goals into sub-tasks', subcategory: 'Agentic AI' },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-background border shadow-xl">
        {/* Search */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Quick Add */}
        <div className="p-1 border-b">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Quick Add</div>
          {quickAddNodes.map((node) => (
            <ContextMenuItem
              key={node.type}
              onSelect={() => onAddNode(node.type, node.category, node.label, position)}
              className="text-sm"
            >
              <node.icon className="mr-2 h-4 w-4 text-primary" />
              {node.label}
            </ContextMenuItem>
          ))}
        </div>

        {/* Document Processing Quick Add */}
        <div className="p-1 border-b">
          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-sm">
              <FileText className="mr-2 h-4 w-4 text-emerald-600" />
              Document Processing
              <Badge variant="secondary" className="ml-auto text-xs bg-emerald-500/10 text-emerald-600">
                10
              </Badge>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56 bg-background border shadow-lg">
              {documentProcessingNodes.map((node) => (
                <ContextMenuItem
                  key={node.type}
                  onSelect={() => onAddNode(node.type, node.category, node.label, position)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center gap-2">
                    <node.icon className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">{node.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-6">
                    {node.description}
                  </span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </div>

        {/* Enhanced Agentic AI Quick Add */}
        <div className="p-1 border-b">
          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-sm">
              <Brain className="mr-2 h-4 w-4 text-violet-600" />
              Enhanced Agentic AI
              <Badge variant="secondary" className="ml-auto text-xs bg-violet-500/10 text-violet-600">
                10
              </Badge>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56 bg-background border shadow-lg">
              {enhancedAgenticNodes.map((node) => (
                <ContextMenuItem
                  key={node.type}
                  onSelect={() => onAddNode(node.type, node.category, node.label, position)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center gap-2">
                    <node.icon className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium">{node.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-6">
                    {node.description}
                  </span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </div>

        {/* Multi-Agent Quick Add */}
        <div className="p-1 border-b">
          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-sm">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Multi-Agent / A2A
              <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary">
                10
              </Badge>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56 bg-background border shadow-lg">
              {multiAgentQuickNodes.map((node) => (
                <ContextMenuItem
                  key={node.type}
                  onSelect={() => onAddNode(node.type, node.category, node.label, position)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center gap-2">
                    <node.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{node.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-6">
                    {node.description}
                  </span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </div>

        <ContextMenuSeparator />

        {/* Node Categories */}
        <div className="max-h-[400px] overflow-y-auto">
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Plus className="mr-2 h-4 w-4" />
              All Node Categories
              <Badge variant="secondary" className="ml-auto text-xs">
                {categories.reduce((sum, cat) => sum + cat.nodes.length, 0)}
              </Badge>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56 bg-background border shadow-lg">
              <ScrollArea className="max-h-[500px]">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading nodes...
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No nodes found
                  </div>
                ) : (
                  filteredCategories.map((category) => {
                    const CategoryIcon = getIconForCategory(category.name, category.icon_name);
                    return (
                      <ContextMenuSub key={category.id}>
                        <ContextMenuSubTrigger>
                          <CategoryIcon className="mr-2 h-4 w-4" />
                          {category.name}
                          <Badge variant="outline" className="ml-auto text-xs">
                            {category.nodes.length}
                          </Badge>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-52 bg-background border shadow-lg">
                          <ScrollArea className="max-h-[300px]">
                            {category.nodes.map((node) => (
                              <ContextMenuItem
                                key={node.id}
                                onSelect={() => onAddNode(
                                  node.type_key, 
                                  category.name.toLowerCase().replace(/\s+/g, '-'), 
                                  node.display_name, 
                                  position
                                )}
                                className="flex flex-col items-start py-2"
                              >
                                <span className="text-sm font-medium">{node.display_name}</span>
                                {node.description && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {node.description}
                                  </span>
                                )}
                              </ContextMenuItem>
                            ))}
                          </ScrollArea>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    );
                  })
                )}
              </ScrollArea>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
};
