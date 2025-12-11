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
  Cloud,
  Zap,
  Link,
  FileText,
  Users,
  Activity,
  Lock,
  GitBranch,
  Bell,
  Search,
  Mic,
  Video,
  Mail,
  Hash,
  Terminal,
  Code,
  Package,
  Plug
} from 'lucide-react';

// Tool/Service logos as styled components
const LogoIcon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  const logoStyles: Record<string, { bg: string; text: string; icon: string }> = {
    // AI Models
    'GPT-4o': { bg: 'bg-emerald-600', text: 'text-white', icon: 'O' },
    'GPT-5': { bg: 'bg-emerald-700', text: 'text-white', icon: '5' },
    'Claude 3': { bg: 'bg-orange-500', text: 'text-white', icon: 'C' },
    'Gemini': { bg: 'bg-blue-500', text: 'text-white', icon: 'G' },
    'Gemini 3': { bg: 'bg-blue-600', text: 'text-white', icon: 'G3' },
    'Llama': { bg: 'bg-purple-600', text: 'text-white', icon: 'L' },
    'Mistral': { bg: 'bg-cyan-600', text: 'text-white', icon: 'M' },
    'Vertex AI': { bg: 'bg-blue-700', text: 'text-white', icon: 'V' },
    // Development Platforms
    'Lovable': { bg: 'bg-pink-500', text: 'text-white', icon: '💜' },
    'Bolt': { bg: 'bg-yellow-500', text: 'text-black', icon: '⚡' },
    // Tools
    'LangChain': { bg: 'bg-green-600', text: 'text-white', icon: '🦜' },
    'LangWatch': { bg: 'bg-indigo-600', text: 'text-white', icon: 'LW' },
    'Arize': { bg: 'bg-pink-600', text: 'text-white', icon: 'A' },
    'Label Studio': { bg: 'bg-red-600', text: 'text-white', icon: 'LS' },
    'W&B': { bg: 'bg-yellow-500', text: 'text-black', icon: 'W' },
    // Integrations
    'MCP SDK': { bg: 'bg-violet-600', text: 'text-white', icon: '⚡' },
    'Miro': { bg: 'bg-yellow-400', text: 'text-black', icon: 'M' },
    'n8n': { bg: 'bg-orange-600', text: 'text-white', icon: 'n8' },
    'Notion': { bg: 'bg-slate-800', text: 'text-white', icon: 'N' },
    'Linear': { bg: 'bg-indigo-500', text: 'text-white', icon: 'Li' },
    'Zapier': { bg: 'bg-orange-500', text: 'text-white', icon: 'Z' },
    // CRMs
    'Salesforce': { bg: 'bg-blue-600', text: 'text-white', icon: 'SF' },
    'HubSpot': { bg: 'bg-orange-600', text: 'text-white', icon: 'HS' },
    'Veeva': { bg: 'bg-green-700', text: 'text-white', icon: 'V' },
    // Platforms
    'Supabase': { bg: 'bg-emerald-600', text: 'text-white', icon: '⚡' },
    'WhatsApp': { bg: 'bg-green-500', text: 'text-white', icon: 'W' },
    'Slack': { bg: 'bg-purple-700', text: 'text-white', icon: 'S' },
    'Teams': { bg: 'bg-indigo-600', text: 'text-white', icon: 'T' },
    'Alexa': { bg: 'bg-cyan-500', text: 'text-white', icon: 'A' },
    'ElevenLabs': { bg: 'bg-slate-700', text: 'text-white', icon: '11' },
  };

  const style = logoStyles[name] || { bg: 'bg-slate-600', text: 'text-white', icon: name.charAt(0) };
  return (
    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${style.bg} ${style.text} ${className}`}>
      {style.icon}
    </div>
  );
};

interface ToolItemProps {
  name: string;
  hasLogo?: boolean;
}

const ToolItem: React.FC<ToolItemProps> = ({ name, hasLogo = false }) => {
  if (hasLogo) {
    return (
      <div className="flex items-center gap-1.5 bg-white/10 rounded px-2 py-1 border border-white/20">
        <LogoIcon name={name} />
        <span className="text-xs text-white/90">{name}</span>
      </div>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs bg-white/10 text-white/90 border-white/20">
      {name}
    </Badge>
  );
};

interface ArchitectureBlockProps {
  title: string;
  items: { name: string; hasLogo?: boolean }[];
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
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <ToolItem key={index} name={item.name} hasLogo={item.hasLogo} />
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
            items={[
              { name: 'Traditional IVR' },
              { name: 'Conversational IVR' },
              { name: 'Dialogflow' }
            ]}
            variant="teal"
          />
          <ArchitectureBlock
            title="Voice Assistants"
            icon={<Mic className="h-4 w-4 text-teal-400" />}
            items={[
              { name: 'Alexa', hasLogo: true },
              { name: 'Google Assistant' },
              { name: 'ElevenLabs', hasLogo: true },
              { name: 'Apple Siri' }
            ]}
            variant="teal"
          />
          <ArchitectureBlock
            title="Social/Messaging"
            icon={<MessageSquare className="h-4 w-4 text-teal-400" />}
            items={[
              { name: 'WhatsApp', hasLogo: true },
              { name: 'Messenger' },
              { name: 'SMS' },
              { name: 'Slack', hasLogo: true },
              { name: 'Teams', hasLogo: true }
            ]}
            variant="teal"
          />
          <ArchitectureBlock
            title="Mobile"
            icon={<Smartphone className="h-4 w-4 text-teal-400" />}
            items={[
              { name: 'iOS App' },
              { name: 'Android App' },
              { name: 'React Native' },
              { name: 'Flutter' }
            ]}
            variant="teal"
          />
          <ArchitectureBlock
            title="Web"
            icon={<Monitor className="h-4 w-4 text-teal-400" />}
            items={[
              { name: 'Web Chat' },
              { name: 'Embedded Widget' },
              { name: 'Portal' },
              { name: 'Public Genie' }
            ]}
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
              items={[
                { name: 'GPT-5', hasLogo: true },
                { name: 'Claude 3', hasLogo: true },
                { name: 'Gemini 3', hasLogo: true },
                { name: 'Llama', hasLogo: true },
                { name: 'Mistral', hasLogo: true },
                { name: 'Vertex AI', hasLogo: true }
              ]}
              variant="blue"
            />
            <ArchitectureBlock
              title="Small Language Models"
              icon={<Sparkles className="h-4 w-4 text-blue-400" />}
              items={[
                { name: 'Phi-3 Mini' },
                { name: 'Gemma 2B' },
                { name: 'Qwen 0.5B' },
                { name: 'TinyLlama' }
              ]}
              variant="blue"
            />
            <ArchitectureBlock
              title="Vision Models"
              icon={<Eye className="h-4 w-4 text-blue-400" />}
              items={[
                { name: 'GPT-4o Vision' },
                { name: 'Claude Vision' },
                { name: 'Gemini Vision' },
                { name: 'LLaVA' }
              ]}
              variant="blue"
            />
            <ArchitectureBlock
              title="Health/Bio Models"
              icon={<Microscope className="h-4 w-4 text-blue-400" />}
              items={[
                { name: 'MedPaLM 2' },
                { name: 'BioMistral' },
                { name: 'ClinicalBERT' },
                { name: 'PubMedBERT' },
                { name: 'BioGPT' }
              ]}
              variant="blue"
            />
          </div>

          {/* Agent Services Row */}
          <div className="grid grid-cols-4 gap-3">
            <ArchitectureBlock
              title="Agent Augmentation"
              icon={<Bot className="h-4 w-4 text-green-400" />}
              items={[
                { name: 'CRM Integration' },
                { name: 'Knowledge Mgmt' },
                { name: 'Context Memory' }
              ]}
              variant="green"
            />
            <ArchitectureBlock
              title="Conversation Engine"
              icon={<MessageSquare className="h-4 w-4 text-green-400" />}
              items={[
                { name: 'NPI Registry' },
                { name: 'Credentialing' },
                { name: 'Enrollment' },
                { name: 'Order Status' }
              ]}
              variant="green"
            />
            <ArchitectureBlock
              title="Virtual Agent"
              icon={<Brain className="h-4 w-4 text-green-400" />}
              items={[
                { name: 'Dialogue Manager' },
                { name: 'Router' },
                { name: 'Universal KB' },
                { name: 'RAG Pipeline' }
              ]}
              variant="green"
            />
            <ArchitectureBlock
              title="Analytics Applications"
              icon={<BarChart3 className="h-4 w-4 text-orange-400" />}
              items={[
                { name: 'Journey Analytics' },
                { name: 'Next Best Action' },
                { name: 'Satisfaction' },
                { name: 'Churn Prediction' }
              ]}
              variant="orange"
            />
          </div>

          {/* Tools & Middleware Row */}
          <div className="grid grid-cols-4 gap-3">
            <ArchitectureBlock
              title="Dev Platforms"
              icon={<Code className="h-4 w-4 text-purple-400" />}
              items={[
                { name: 'Lovable', hasLogo: true },
                { name: 'Bolt', hasLogo: true },
                { name: 'Cursor' },
                { name: 'Replit' }
              ]}
              variant="purple"
            />
            <ArchitectureBlock
              title="AI/ML Tools"
              icon={<Wrench className="h-4 w-4 text-purple-400" />}
              items={[
                { name: 'LangChain', hasLogo: true },
                { name: 'LangWatch', hasLogo: true },
                { name: 'Arize', hasLogo: true },
                { name: 'Label Studio', hasLogo: true },
                { name: 'W&B', hasLogo: true }
              ]}
              variant="purple"
            />
            <ArchitectureBlock
              title="MCP SDK & Integrations"
              icon={<Plug className="h-4 w-4 text-purple-400" />}
              items={[
                { name: 'MCP SDK', hasLogo: true },
                { name: 'Miro', hasLogo: true },
                { name: 'n8n', hasLogo: true },
                { name: 'Notion', hasLogo: true },
                { name: 'Linear', hasLogo: true },
                { name: 'Zapier', hasLogo: true }
              ]}
              variant="purple"
            />
            <ArchitectureBlock
              title="API Services / Middleware"
              icon={<Server className="h-4 w-4 text-purple-400" />}
              items={[
                { name: 'API Registry' },
                { name: 'Edge Functions' },
                { name: 'Webhooks' },
                { name: 'Rate Limiting' },
                { name: 'Auth' }
              ]}
              variant="purple"
            />
          </div>

          {/* Business Process Row */}
          <div className="grid grid-cols-4 gap-3">
            <ArchitectureBlock
              title="Business Process Automation"
              icon={<Workflow className="h-4 w-4 text-teal-400" />}
              items={[
                { name: 'Workflow Engine' },
                { name: 'Case Management' },
                { name: 'RPA' }
              ]}
              variant="teal"
            />
            <ArchitectureBlock
              title="Dashboard / Reports"
              icon={<BarChart3 className="h-4 w-4 text-orange-400" />}
              items={[
                { name: 'Insights' },
                { name: 'Operations' },
                { name: 'Reporting' }
              ]}
              variant="orange"
            />
            <ArchitectureBlock
              title="Advanced Analytics"
              icon={<Brain className="h-4 w-4 text-orange-400" />}
              items={[
                { name: 'Cognitive' },
                { name: 'Predictive' },
                { name: 'Prescriptive' },
                { name: 'ML Pipeline' }
              ]}
              variant="orange"
            />
            <ArchitectureBlock
              title="NLP Processing"
              icon={<MessageSquare className="h-4 w-4 text-orange-400" />}
              items={[
                { name: 'Entity Extraction' },
                { name: 'Sentiment' },
                { name: 'Intent Classification' }
              ]}
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
              items={[
                { name: 'Profiles' },
                { name: 'Organizations' },
                { name: 'Facilities' }
              ]}
              variant="gray"
            />
            <ArchitectureBlock
              title="Interaction History"
              icon={<MessageSquare className="h-4 w-4 text-gray-400" />}
              items={[
                { name: 'Conversations' },
                { name: 'Sessions' },
                { name: 'Omni-channel' }
              ]}
              variant="gray"
            />
            <ArchitectureBlock
              title="Knowledge Sources"
              icon={<Brain className="h-4 w-4 text-gray-400" />}
              items={[
                { name: 'Universal KB' },
                { name: 'Vector Store' },
                { name: 'Embeddings' }
              ]}
              variant="gray"
            />
            <ArchitectureBlock
              title="External Systems"
              icon={<Cloud className="h-4 w-4 text-gray-400" />}
              items={[
                { name: 'Salesforce', hasLogo: true },
                { name: 'HubSpot', hasLogo: true },
                { name: 'Veeva', hasLogo: true },
                { name: 'EHR/EMR' }
              ]}
              variant="gray"
            />
            <ArchitectureBlock
              title="Analytics Store"
              icon={<BarChart3 className="h-4 w-4 text-gray-400" />}
              items={[
                { name: 'Metrics' },
                { name: 'Traces' },
                { name: 'Logs' },
                { name: 'Performance' }
              ]}
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
              icon={<Zap className="h-4 w-4 text-green-400" />}
              items={[
                { name: 'PostgreSQL' },
                { name: 'Auth' },
                { name: 'Storage' },
                { name: 'Realtime' },
                { name: 'Edge Functions' }
              ]}
              variant="green"
            />
            <ArchitectureBlock
              title="Deployment"
              icon={<Cloud className="h-4 w-4 text-blue-400" />}
              items={[
                { name: 'Channel Deploy' },
                { name: 'Agent Deploy' },
                { name: 'Version Control' }
              ]}
              variant="blue"
            />
            <ArchitectureBlock
              title="Security"
              icon={<Shield className="h-4 w-4 text-orange-400" />}
              items={[
                { name: 'RLS Policies' },
                { name: 'HIPAA' },
                { name: 'Encryption' },
                { name: 'Audit Logs' }
              ]}
              variant="orange"
            />
            <ArchitectureBlock
              title="Monitoring"
              icon={<Activity className="h-4 w-4 text-purple-400" />}
              items={[
                { name: 'Genie Analytics' },
                { name: 'Observability' },
                { name: 'Alerts' },
                { name: 'Tracing' }
              ]}
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
