/**
 * FLOATING PANE CONTEXT MENU
 * Appears on right-click on canvas pane (empty area)
 * Provides node addition and quick actions
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Settings,
  Search,
  Wrench,
  Brain,
  Shield,
  Globe,
  Server,
  Activity,
  BarChart3,
  Layers,
  Link2,
  Users,
  ChevronRight,
  Scan,
  Waves,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MULTI_AGENT_NODES, MULTI_AGENT_CATEGORIES } from './MultiAgentNodeRegistry';

interface AgentContext {
  name?: string;
  useCase?: { name: string; description?: string };
  useCaseId?: string;
}

interface PaneContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddNode: (type: string, category: string, label: string, position: { x: number; y: number }) => void;
  agentContext?: AgentContext;
}

interface NodeCategory {
  id: string;
  name: string;
  description?: string;
  nodes: NodeType[];
}

interface NodeType {
  id: string;
  type_key: string;
  display_name: string;
  description?: string;
  category_id: string;
}

export const PaneContextMenu: React.FC<PaneContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  onAddNode,
  agentContext,
}) => {
  // Initialize with static categories immediately so menu is never empty
  const getStaticCategoriesInitial = (): NodeCategory[] => [
    {
      id: 'workflow',
      name: 'Workflow',
      nodes: [
        { id: 'start', type_key: 'start', display_name: 'Start', description: 'Workflow entry point', category_id: 'workflow' },
        { id: 'end', type_key: 'end', display_name: 'End', description: 'Workflow exit point', category_id: 'workflow' },
        { id: 'condition', type_key: 'condition', display_name: 'Condition', description: 'Conditional branching', category_id: 'workflow' },
      ]
    },
    {
      id: 'ai-agents',
      name: 'AI Agents',
      nodes: [
        { id: 'agent', type_key: 'agent', display_name: 'AI Agent', description: 'Conversational AI', category_id: 'ai-agents' },
        { id: 'llm', type_key: 'llm', display_name: 'LLM Node', description: 'Language model', category_id: 'ai-agents' },
      ]
    },
    {
      id: 'data',
      name: 'Data',
      nodes: [
        { id: 'database', type_key: 'database', display_name: 'Database', description: 'DB operations', category_id: 'data' },
        { id: 'knowledge_base', type_key: 'knowledge_base', display_name: 'Knowledge Base', description: 'RAG store', category_id: 'data' },
      ]
    },
  ];

  const [categories, setCategories] = useState<NodeCategory[]>(getStaticCategoriesInitial());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Load categories and nodes
  useEffect(() => {
    if (isOpen) {
      loadCategoriesAndNodes();
    }
  }, [isOpen]);

  const loadCategoriesAndNodes = async () => {
    setIsLoading(true);
    try {
      // Try to load from database first
      const { data: categoriesData, error: catError } = await supabase
        .from('workflow_node_categories' as any)
        .select('id, name, description')
        .eq('is_active', true)
        .order('display_order');

      const { data: nodesData, error: nodesError } = await supabase
        .from('workflow_node_types')
        .select('id, type_key, display_name, description, category_id')
        .eq('is_active', true)
        .order('display_order');

      if (!catError && !nodesError && categoriesData && nodesData && categoriesData.length > 0) {
        const categoriesWithNodes: NodeCategory[] = (categoriesData as any[]).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          nodes: (nodesData as any[]).filter((node: any) => node.category_id === cat.id)
        })).filter((cat: NodeCategory) => cat.nodes.length > 0);

        if (categoriesWithNodes.length > 0) {
          setCategories(categoriesWithNodes);
          return;
        }
      }
      
      // Fallback to static categories if DB empty or errors
      console.log('Using static node categories (DB returned empty or error)');
      setCategories(getStaticCategories());
    } catch (error) {
      console.error('Failed to load node categories:', error);
      setCategories(getStaticCategories());
    } finally {
      setIsLoading(false);
    }
  };

  const getStaticCategories = (): NodeCategory[] => [
    {
      id: 'workflow',
      name: 'Workflow',
      nodes: [
        { id: 'start', type_key: 'start', display_name: 'Start', description: 'Workflow entry point', category_id: 'workflow' },
        { id: 'end', type_key: 'end', display_name: 'End', description: 'Workflow exit point', category_id: 'workflow' },
        { id: 'condition', type_key: 'condition', display_name: 'Condition', description: 'Conditional branching', category_id: 'workflow' },
        { id: 'loop', type_key: 'loop', display_name: 'Loop', description: 'Iterate over items', category_id: 'workflow' },
        { id: 'parallel', type_key: 'parallel', display_name: 'Parallel', description: 'Execute in parallel', category_id: 'workflow' },
      ]
    },
    {
      id: 'ai-agents',
      name: 'AI Agents',
      nodes: [
        { id: 'agent', type_key: 'agent', display_name: 'AI Agent', description: 'Conversational AI agent', category_id: 'ai-agents' },
        { id: 'llm', type_key: 'llm', display_name: 'LLM Node', description: 'Large language model', category_id: 'ai-agents' },
        { id: 'reasoning', type_key: 'reasoning', display_name: 'Reasoning Agent', description: 'Chain-of-thought reasoning', category_id: 'ai-agents' },
        { id: 'vision', type_key: 'vision', display_name: 'Vision Agent', description: 'Image analysis AI', category_id: 'ai-agents' },
      ]
    },
    {
      id: 'data',
      name: 'Data',
      nodes: [
        { id: 'database', type_key: 'database', display_name: 'Database', description: 'Database operations', category_id: 'data' },
        { id: 'knowledge_base', type_key: 'knowledge_base', display_name: 'Knowledge Base', description: 'RAG knowledge store', category_id: 'data' },
        { id: 'input', type_key: 'input', display_name: 'Input', description: 'Data input node', category_id: 'data' },
        { id: 'output', type_key: 'output', display_name: 'Output', description: 'Data output node', category_id: 'data' },
        { id: 'transform', type_key: 'transform', display_name: 'Transform', description: 'Data transformation', category_id: 'data' },
      ]
    },
    {
      id: 'integration',
      name: 'Integration',
      nodes: [
        { id: 'api', type_key: 'api', display_name: 'API Call', description: 'REST API integration', category_id: 'integration' },
        { id: 'webhook', type_key: 'webhook', display_name: 'Webhook', description: 'Webhook trigger/listener', category_id: 'integration' },
        { id: 'function', type_key: 'function', display_name: 'Function', description: 'Custom function call', category_id: 'integration' },
        { id: 'http', type_key: 'http', display_name: 'HTTP Request', description: 'Generic HTTP request', category_id: 'integration' },
      ]
    },
    {
      id: 'mcp',
      name: 'MCP Connectors',
      nodes: [
        { id: 'mcp_connector', type_key: 'mcp_connector', display_name: 'MCP Connector', description: 'Model Context Protocol', category_id: 'mcp' },
        { id: 'healthcare_mcp', type_key: 'healthcare_mcp', display_name: 'Healthcare MCP', description: 'Healthcare data sync', category_id: 'mcp' },
        { id: 'database_mcp', type_key: 'database_mcp', display_name: 'Database MCP', description: 'Database MCP sync', category_id: 'mcp' },
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      nodes: [
        { id: 'npi_verification', type_key: 'npi_verification', display_name: 'NPI Verification', description: 'Verify NPI numbers', category_id: 'healthcare' },
        { id: 'patient_intake', type_key: 'patient_intake', display_name: 'Patient Intake', description: 'Patient intake form', category_id: 'healthcare' },
        { id: 'ehr_integration', type_key: 'ehr_integration', display_name: 'EHR Integration', description: 'Electronic health records', category_id: 'healthcare' },
        { id: 'hipaa_compliance', type_key: 'hipaa_compliance', display_name: 'HIPAA Compliance', description: 'HIPAA compliance check', category_id: 'healthcare' },
        { id: 'insurance_verification', type_key: 'insurance_verification', display_name: 'Insurance Verification', description: 'Verify insurance', category_id: 'healthcare' },
      ]
    },
    {
      id: 'document-processing',
      name: 'Document Processing',
      nodes: [
        { id: 'document_upload', type_key: 'document_upload', display_name: 'Document Upload', description: 'Upload documents', category_id: 'document-processing' },
        { id: 'ocr_processor', type_key: 'ocr_processor', display_name: 'OCR Processor', description: 'Extract text from images', category_id: 'document-processing' },
        { id: 'google_vision_ocr', type_key: 'google_vision_ocr', display_name: 'Google Vision OCR', description: 'Google Cloud Vision', category_id: 'document-processing' },
        { id: 'azure_form_recognizer', type_key: 'azure_form_recognizer', display_name: 'Azure Form Recognizer', description: 'Azure Form Recognizer', category_id: 'document-processing' },
        { id: 'aws_textract', type_key: 'aws_textract', display_name: 'AWS Textract', description: 'AWS Textract OCR', category_id: 'document-processing' },
        { id: 'metadata_extractor', type_key: 'metadata_extractor', display_name: 'Metadata Extractor', description: 'Extract metadata', category_id: 'document-processing' },
        { id: 'form_mapping', type_key: 'form_mapping', display_name: 'Form Mapping', description: 'Map form fields', category_id: 'document-processing' },
      ]
    },
    {
      id: 'medication',
      name: 'Medication Processing',
      nodes: [
        { id: 'medication_processor', type_key: 'medication_processor', display_name: 'Medication Processor', description: 'Process prescriptions', category_id: 'medication' },
        { id: 'ndc_matcher', type_key: 'ndc_matcher', display_name: 'NDC Matcher', description: 'Match NDC codes', category_id: 'medication' },
        { id: 'quantity_calculator', type_key: 'quantity_calculator', display_name: 'Quantity Calculator', description: 'Calculate qty/days', category_id: 'medication' },
        { id: 'drug_interaction_check', type_key: 'drug_interaction_check', display_name: 'Drug Interaction Check', description: 'Check drug interactions', category_id: 'medication' },
      ]
    },
    {
      id: 'medical-imaging',
      name: 'Medical Imaging AI',
      nodes: [
        { id: 'vision_ai_hub', type_key: 'vision_ai_hub', display_name: 'Vision AI Hub', description: 'Multi-provider medical imaging AI', category_id: 'medical-imaging' },
        { id: 'xray_analysis', type_key: 'xray_analysis', display_name: 'X-Ray Analysis', description: 'CNN lung nodules, pneumonia, TB (qXR)', category_id: 'medical-imaging' },
        { id: 'ct_analysis', type_key: 'ct_analysis', display_name: 'CT Scan Analysis', description: 'U-Net hemorrhage, tumor segmentation', category_id: 'medical-imaging' },
        { id: 'mri_analysis', type_key: 'mri_analysis', display_name: 'MRI Analysis', description: 'U-Net brain tumor, Alzheimer (BraTS)', category_id: 'medical-imaging' },
        { id: 'ecg_analysis', type_key: 'ecg_analysis', display_name: 'ECG Analysis', description: 'RNN arrhythmia, AFib, MI detection', category_id: 'medical-imaging' },
        { id: 'ultrasound_analysis', type_key: 'ultrasound_analysis', display_name: 'Ultrasound Analysis', description: 'Fetal, cardiac, thyroid (SonoNet)', category_id: 'medical-imaging' },
        { id: 'mammogram_analysis', type_key: 'mammogram_analysis', display_name: 'Mammogram Analysis', description: 'Faster R-CNN mass detection, BI-RADS', category_id: 'medical-imaging' },
      ]
    },
    {
      id: 'communication',
      name: 'Communication',
      nodes: [
        { id: 'email', type_key: 'email', display_name: 'Email', description: 'Send email', category_id: 'communication' },
        { id: 'sms', type_key: 'sms', display_name: 'SMS', description: 'Send SMS', category_id: 'communication' },
        { id: 'notification', type_key: 'notification', display_name: 'Notification', description: 'Push notification', category_id: 'communication' },
      ]
    },
  ];

  // Filter based on search
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
    })).filter(cat => cat.nodes.length > 0);
  }, [categories, searchTerm]);

  // Quick add nodes
  const quickAddNodes = [
    { type: 'agent', category: 'ai-agents', label: 'AI Agent', icon: Bot },
    { type: 'condition', category: 'workflow', label: 'Condition', icon: GitBranch },
    { type: 'knowledge_base', category: 'data', label: 'Knowledge Base', icon: Database },
    { type: 'api', category: 'integration', label: 'API Call', icon: Zap },
  ];

  // Multi-agent nodes
  const multiAgentNodes = [
    { type: 'a2a_agent', category: 'multi-agent', label: 'A2A Agent', icon: Users },
    { type: 'agent_team', category: 'multi-agent', label: 'Agent Team', icon: Users },
    { type: 'react_loop', category: 'multi-agent', label: 'ReAct Loop', icon: Brain },
    { type: 'swarm_decision', category: 'multi-agent', label: 'Swarm Decision', icon: Brain },
    { type: 'task_handoff', category: 'multi-agent', label: 'Task Handoff', icon: Zap },
    { type: 'communication_hub', category: 'multi-agent', label: 'Communication Hub', icon: Server },
    { type: 'tool_sharing', category: 'multi-agent', label: 'Tool Sharing', icon: Layers },
    { type: 'tool_chain', category: 'multi-agent', label: 'Tool Chain', icon: Link2 },
    { type: 'self_reflection', category: 'multi-agent', label: 'Self Reflection', icon: Activity },
    { type: 'goal_decomposition', category: 'multi-agent', label: 'Goal Decomposition', icon: GitBranch },
  ];

  // Medical Imaging Vision AI nodes
  const medicalImagingNodes = [
    { type: 'vision_ai_hub', category: 'medical-imaging', label: 'Vision AI Hub', icon: Brain },
    { type: 'xray_analysis', category: 'medical-imaging', label: 'X-Ray Analysis', icon: Activity },
    { type: 'ct_analysis', category: 'medical-imaging', label: 'CT Scan Analysis', icon: Scan },
    { type: 'mri_analysis', category: 'medical-imaging', label: 'MRI Analysis', icon: Brain },
    { type: 'ecg_analysis', category: 'medical-imaging', label: 'ECG Analysis', icon: Activity },
    { type: 'ultrasound_analysis', category: 'medical-imaging', label: 'Ultrasound Analysis', icon: Waves },
    { type: 'mammogram_analysis', category: 'medical-imaging', label: 'Mammogram Analysis', icon: Target },
  ];

  const handleNodeClick = (type: string, category: string, label: string) => {
    onAddNode(type, category, label, position);
    onClose();
  };

  if (!isOpen) return null;

  // Calculate position to keep menu in viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 280),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 9999,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="w-64 bg-card border border-border rounded-lg shadow-xl animate-fade-in"
    >
      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-sm"
            autoFocus
          />
        </div>
      </div>

      <ScrollArea className="max-h-[350px]">
        {/* Quick Add */}
        <div className="p-1 border-b border-border">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Quick Add</div>
          {quickAddNodes.map((node) => (
            <button
              key={node.type}
              onClick={() => handleNodeClick(node.type, node.category, node.label)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
            >
              <node.icon className="h-4 w-4 text-primary" />
              {node.label}
            </button>
          ))}
        </div>

        {/* Multi-Agent Section */}
        <div className="p-1 border-b border-border">
          <button
            onClick={() => setExpandedCategory(expandedCategory === 'multi-agent' ? null : 'multi-agent')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Multi-Agent / A2A</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">New</Badge>
              <ChevronRight className={`h-4 w-4 transition-transform ${expandedCategory === 'multi-agent' ? 'rotate-90' : ''}`} />
            </div>
          </button>
          {expandedCategory === 'multi-agent' && (
            <div className="ml-2 border-l border-border pl-2">
              {multiAgentNodes.map((node) => (
                <button
                  key={node.type}
                  onClick={() => handleNodeClick(node.type, node.category, node.label)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <node.icon className="h-4 w-4 text-primary/70" />
                  {node.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Medical Imaging Vision AI Section */}
        <div className="p-1 border-b border-border">
          <button
            onClick={() => setExpandedCategory(expandedCategory === 'medical-imaging' ? null : 'medical-imaging')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-pink-500" />
              <span>Medical Imaging AI</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs bg-pink-500/10 text-pink-500">Vision</Badge>
              <ChevronRight className={`h-4 w-4 transition-transform ${expandedCategory === 'medical-imaging' ? 'rotate-90' : ''}`} />
            </div>
          </button>
          {expandedCategory === 'medical-imaging' && (
            <div className="ml-2 border-l border-border pl-2">
              {medicalImagingNodes.map((node) => (
                <button
                  key={node.type}
                  onClick={() => handleNodeClick(node.type, node.category, node.label)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <node.icon className="h-4 w-4 text-pink-500/70" />
                  {node.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Categories */}
        <div className="p-1">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex justify-between items-center">
            <span>All Node Categories</span>
            <Badge variant="secondary" className="text-xs">
              {categories.reduce((sum, cat) => sum + cat.nodes.length, 0)}
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No nodes found</div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{category.nodes.length}</Badge>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>
                {expandedCategory === category.id && (
                  <div className="ml-2 border-l border-border pl-2 max-h-40 overflow-y-auto">
                    {category.nodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => handleNodeClick(node.type_key, category.id, node.display_name)}
                        className="w-full flex flex-col items-start px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors"
                      >
                        <span className="font-medium">{node.display_name}</span>
                        {node.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">{node.description}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
