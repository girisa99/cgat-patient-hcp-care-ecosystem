import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MessageSquare, 
  Globe, 
  Smartphone,
  Monitor,
  Bot,
  Brain,
  Database,
  Workflow,
  Settings,
  BarChart3,
  Shield,
  Layers,
  Cpu,
  Eye,
  Sparkles,
  Microscope,
  Wrench,
  Server,
  Cloud
} from 'lucide-react';

interface ArchitectureBlockProps {
  title: string;
  items: string[];
  icon?: React.ReactNode;
  variant?: 'teal' | 'orange' | 'blue' | 'green' | 'purple' | 'gray';
  className?: string;
}

const ArchitectureBlock: React.FC<ArchitectureBlockProps> = ({ 
  title, 
  items, 
  icon, 
  variant = 'teal',
  className = '' 
}) => {
  const variantStyles = {
    teal: 'bg-teal-900/80 border-teal-600',
    orange: 'bg-orange-900/80 border-orange-600',
    blue: 'bg-blue-900/80 border-blue-600',
    green: 'bg-green-900/80 border-green-600',
    purple: 'bg-purple-900/80 border-purple-600',
    gray: 'bg-gray-800/80 border-gray-600',
  };

  return (
    <div className={`border rounded-lg p-3 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold text-sm text-white">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/90 border-white/20">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const LayerLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-center bg-orange-500 text-white font-bold px-3 py-2 rounded-l-lg writing-mode-vertical h-full min-w-[40px]">
    <span className="rotate-180" style={{ writingMode: 'vertical-rl' }}>{label}</span>
  </div>
);

export const ComprehensiveArchitectureDiagram: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 rounded-xl min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Genie AI Agent Platform Architecture</h1>
        <p className="text-slate-400">Comprehensive Multi-Channel Intelligent Agent System</p>
      </div>

      {/* Channel Layer */}
      <div className="flex mb-4">
        <LayerLabel label="Channel" />
        <div className="flex-1 grid grid-cols-5 gap-3 p-4 bg-slate-800/50 rounded-r-lg border border-slate-700">
          <ArchitectureBlock
            title="Phone"
            icon={<Phone className="h-4 w-4 text-teal-400" />}
            items={['Traditional IVR', 'Conversational IVR', 'Dialogflow']}
            variant="teal"
          />
          <ArchitectureBlock
            title="Voice Assistants"
            icon={<MessageSquare className="h-4 w-4 text-teal-400" />}
            items={['Amazon Alexa', 'Google Assistant', 'ElevenLabs', 'Apple Siri']}
            variant="teal"
          />
          <ArchitectureBlock
            title="Social/Messaging"
            icon={<MessageSquare className="h-4 w-4 text-teal-400" />}
            items={['WhatsApp', 'Messenger', 'SMS', 'Slack', 'Teams']}
            variant="teal"
          />
          <ArchitectureBlock
            title="Mobile"
            icon={<Smartphone className="h-4 w-4 text-teal-400" />}
            items={['iOS App', 'Android App', 'React Native', 'Flutter']}
            variant="teal"
          />
          <ArchitectureBlock
            title="Web"
            icon={<Monitor className="h-4 w-4 text-teal-400" />}
            items={['Web Chat', 'Embedded Widget', 'Portal', 'Public Genie']}
            variant="teal"
          />
        </div>
      </div>

      {/* Service Layer */}
      <div className="flex mb-4">
        <LayerLabel label="Service" />
        <div className="flex-1 p-4 bg-slate-800/50 rounded-r-lg border border-slate-700 space-y-3">
          {/* AI Models Row */}
          <div className="grid grid-cols-4 gap-3">
            <ArchitectureBlock
              title="Large Language Models"
              icon={<Cpu className="h-4 w-4 text-blue-400" />}
              items={['GPT-4o', 'Claude 3', 'Gemini 2.5', 'Llama 3', 'Mistral']}
              variant="blue"
            />
            <ArchitectureBlock
              title="Small Language Models"
              icon={<Sparkles className="h-4 w-4 text-blue-400" />}
              items={['Phi-3 Mini', 'Gemma 2B', 'Qwen 0.5B', 'TinyLlama']}
              variant="blue"
            />
            <ArchitectureBlock
              title="Vision Models"
              icon={<Eye className="h-4 w-4 text-blue-400" />}
              items={['GPT-4o Vision', 'Claude Vision', 'Gemini Vision', 'LLaVA']}
              variant="blue"
            />
            <ArchitectureBlock
              title="Health/Bio Models"
              icon={<Microscope className="h-4 w-4 text-blue-400" />}
              items={['MedPaLM 2', 'BioMistral', 'ClinicalBERT', 'PubMedBERT', 'BioGPT']}
              variant="blue"
            />
          </div>

          {/* Agent Services Row */}
          <div className="grid grid-cols-4 gap-3">
            <ArchitectureBlock
              title="Agent Augmentation"
              icon={<Bot className="h-4 w-4 text-green-400" />}
              items={['CRM Integration', 'Knowledge Management', 'Context Memory']}
              variant="green"
            />
            <ArchitectureBlock
              title="Conversation Engine"
              icon={<MessageSquare className="h-4 w-4 text-green-400" />}
              items={['NPI Registry', 'Credentialing', 'Enrollment', 'Order Status']}
              variant="green"
            />
            <ArchitectureBlock
              title="Virtual Agent"
              icon={<Brain className="h-4 w-4 text-green-400" />}
              items={['Dialogue Manager', 'Router', 'Universal KB', 'RAG Pipeline']}
              variant="green"
            />
            <ArchitectureBlock
              title="Analytics Applications"
              icon={<BarChart3 className="h-4 w-4 text-orange-400" />}
              items={['Journey Analytics', 'Next Best Action', 'Satisfaction', 'Churn']}
              variant="orange"
            />
          </div>

          {/* Tools & Middleware Row */}
          <div className="grid grid-cols-3 gap-3">
            <ArchitectureBlock
              title="AI/ML Tools"
              icon={<Wrench className="h-4 w-4 text-purple-400" />}
              items={['LangChain', 'LangWatch', 'Arize AI', 'Label Studio', 'Weights & Biases']}
              variant="purple"
            />
            <ArchitectureBlock
              title="MCP SDK & Integrations"
              icon={<Settings className="h-4 w-4 text-purple-400" />}
              items={['MCP SDK', 'Miro', 'n8n', 'Notion', 'Linear', 'Zapier']}
              variant="purple"
            />
            <ArchitectureBlock
              title="API Services / Middleware"
              icon={<Server className="h-4 w-4 text-purple-400" />}
              items={['API Registry', 'Edge Functions', 'Webhooks', 'Rate Limiting', 'Auth']}
              variant="purple"
            />
          </div>

          {/* Business Process Row */}
          <div className="grid grid-cols-4 gap-3">
            <ArchitectureBlock
              title="Business Process Automation"
              icon={<Workflow className="h-4 w-4 text-teal-400" />}
              items={['Workflow Engine', 'Case Management', 'RPA']}
              variant="teal"
            />
            <ArchitectureBlock
              title="Dashboard / Reports"
              icon={<BarChart3 className="h-4 w-4 text-orange-400" />}
              items={['Insights', 'Operations', 'Reporting']}
              variant="orange"
            />
            <ArchitectureBlock
              title="Advanced Analytics"
              icon={<Brain className="h-4 w-4 text-orange-400" />}
              items={['Cognitive', 'Predictive', 'Prescriptive', 'ML Pipeline']}
              variant="orange"
            />
            <ArchitectureBlock
              title="NLP Processing"
              icon={<MessageSquare className="h-4 w-4 text-orange-400" />}
              items={['Entity Extraction', 'Sentiment', 'Intent Classification']}
              variant="orange"
            />
          </div>
        </div>
      </div>

      {/* Data Layer */}
      <div className="flex mb-4">
        <LayerLabel label="Data" />
        <div className="flex-1 p-4 bg-slate-800/50 rounded-r-lg border border-slate-700">
          <div className="text-center mb-3">
            <span className="text-white font-semibold">Single View of the Customer (Data Management)</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <ArchitectureBlock
              title="Master Data"
              icon={<Database className="h-4 w-4 text-gray-400" />}
              items={['Profiles', 'Organizations', 'Facilities']}
              variant="gray"
            />
            <ArchitectureBlock
              title="Interaction History"
              icon={<MessageSquare className="h-4 w-4 text-gray-400" />}
              items={['Conversations', 'Sessions', 'Omni-channel']}
              variant="gray"
            />
            <ArchitectureBlock
              title="Knowledge Sources"
              icon={<Brain className="h-4 w-4 text-gray-400" />}
              items={['Universal KB', 'Vector Store', 'Embeddings']}
              variant="gray"
            />
            <ArchitectureBlock
              title="External Systems"
              icon={<Cloud className="h-4 w-4 text-gray-400" />}
              items={['Salesforce', 'HubSpot', 'Veeva', 'EHR/EMR']}
              variant="gray"
            />
            <ArchitectureBlock
              title="Analytics Store"
              icon={<BarChart3 className="h-4 w-4 text-gray-400" />}
              items={['Metrics', 'Traces', 'Logs', 'Performance']}
              variant="gray"
            />
          </div>
        </div>
      </div>

      {/* Infrastructure Layer */}
      <div className="flex">
        <LayerLabel label="Infra" />
        <div className="flex-1 p-4 bg-slate-800/50 rounded-r-lg border border-slate-700">
          <div className="grid grid-cols-4 gap-3">
            <ArchitectureBlock
              title="Supabase"
              icon={<Database className="h-4 w-4 text-green-400" />}
              items={['PostgreSQL', 'Auth', 'Storage', 'Realtime', 'Edge Functions']}
              variant="green"
            />
            <ArchitectureBlock
              title="Deployment"
              icon={<Cloud className="h-4 w-4 text-blue-400" />}
              items={['Channel Deploy', 'Agent Deploy', 'Version Control']}
              variant="blue"
            />
            <ArchitectureBlock
              title="Security"
              icon={<Shield className="h-4 w-4 text-orange-400" />}
              items={['RLS Policies', 'HIPAA', 'Encryption', 'Audit Logs']}
              variant="orange"
            />
            <ArchitectureBlock
              title="Monitoring"
              icon={<BarChart3 className="h-4 w-4 text-purple-400" />}
              items={['Genie Analytics', 'Observability', 'Alerts', 'Tracing']}
              variant="purple"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-teal-600"></div>
            <span className="text-slate-300">Channel & Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-slate-300">AI Models</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-slate-300">Agent Services</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-600"></div>
            <span className="text-slate-300">Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-600"></div>
            <span className="text-slate-300">Tools & Middleware</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-600"></div>
            <span className="text-slate-300">Data Layer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveArchitectureDiagram;
