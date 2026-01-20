/**
 * Step Guidance Panel
 * Provides visual walkthrough, diagrams, and proactive guidance for each wizard step
 * Shows what needs to be done and expected outcomes
 */

import React from 'react';
import { 
  FileText, 
  Settings, 
  Palette, 
  Image, 
  Bot, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Info,
  Play,
  Languages,
  Mic,
  LayoutGrid,
  Wand2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InlineTrainAIFeedback } from '@/components/genie-studio/InlineTrainAIFeedback';

interface StepGuidanceConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  keyActions: string[];
  expectedOutcome: string;
  tips: string[];
  flowDiagram?: FlowNode[];
}

interface FlowNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  type: 'input' | 'process' | 'output' | 'decision';
}

const STEP_CONFIGS: Record<number, StepGuidanceConfig> = {
  0: {
    title: 'Content Input',
    subtitle: 'Add your source content',
    icon: <FileText className="h-5 w-5" />,
    description: 'Provide the foundation for your presentation. You can type directly in your native language, upload documents, paste URLs, or add images.',
    keyActions: [
      'Select your input language (type in your native language)',
      'Enter content via text, document, URL, or image',
      'See real-time English translation preview',
      'AI extracts key topics automatically',
    ],
    expectedOutcome: 'Your content will be processed and translated, ready for AI-powered slide generation.',
    tips: [
      'Type in your native language for best results',
      'URLs are automatically parsed for key content',
      'Documents support PDF, DOCX, PPTX formats',
    ],
    flowDiagram: [
      { id: 'input', label: 'Your Content', icon: <FileText className="h-4 w-4" />, type: 'input' },
      { id: 'translate', label: 'AI Translation', icon: <Languages className="h-4 w-4" />, type: 'process' },
      { id: 'extract', label: 'Topic Extraction', icon: <Wand2 className="h-4 w-4" />, type: 'process' },
      { id: 'output', label: 'Structured Context', icon: <LayoutGrid className="h-4 w-4" />, type: 'output' },
    ],
  },
  1: {
    title: 'Configuration',
    subtitle: 'Set generation parameters',
    icon: <Settings className="h-5 w-5" />,
    description: 'Configure how your presentation should be structured. Set slide count, chapters, and let AI optimize based on your content.',
    keyActions: [
      'Choose AI Auto or Custom configuration mode',
      'Set number of slides and chapters',
      'Select industry and audience',
      'Enable auto-chapter for dynamic structuring',
    ],
    expectedOutcome: 'Optimal presentation structure tailored to your content and audience.',
    tips: [
      'AI Auto mode analyzes your content for best structure',
      'Custom mode gives you full control',
      'Industry selection affects terminology and style',
    ],
    flowDiagram: [
      { id: 'content', label: 'Your Context', icon: <FileText className="h-4 w-4" />, type: 'input' },
      { id: 'analyze', label: 'AI Analysis', icon: <Bot className="h-4 w-4" />, type: 'process' },
      { id: 'structure', label: 'Structure Plan', icon: <LayoutGrid className="h-4 w-4" />, type: 'output' },
    ],
  },
  2: {
    title: 'Template & Branding',
    subtitle: 'Design your visual identity',
    icon: <Palette className="h-5 w-5" />,
    description: 'Select templates, consulting frameworks, and branding. AI recommends styles based on your industry and content type.',
    keyActions: [
      'Choose AI-recommended or manual template',
      'Select consulting frameworks (McKinsey, BCG style)',
      'Upload logo for brand color extraction',
      'Customize color palette and fonts',
    ],
    expectedOutcome: 'Professional, branded visual design aligned with your industry standards.',
    tips: [
      'Upload your logo to auto-extract brand colors',
      'Consulting frameworks add strategic structure',
      'AI recommendations consider your industry',
    ],
    flowDiagram: [
      { id: 'industry', label: 'Industry Context', icon: <Settings className="h-4 w-4" />, type: 'input' },
      { id: 'recommend', label: 'AI Recommends', icon: <Sparkles className="h-4 w-4" />, type: 'process' },
      { id: 'brand', label: 'Brand Identity', icon: <Palette className="h-4 w-4" />, type: 'output' },
    ],
  },
  3: {
    title: 'Output Type',
    subtitle: 'Choose visual complexity',
    icon: <Image className="h-5 w-5" />,
    description: 'Select your output format and visual features. From simple 2D to interactive 3D, videos, and data visualizations.',
    keyActions: [
      'Select output format (2D, 3D, Video, Interactive)',
      'Enable visual features (charts, infographics)',
      'Choose data visualization styles',
      'Set export format preferences',
    ],
    expectedOutcome: 'Defined visual specifications for AI generation with appropriate complexity.',
    tips: [
      '2D is fastest and most compatible',
      '3D and Video require more generation time',
      'Visual features add professional polish',
    ],
    flowDiagram: [
      { id: 'type', label: 'Output Format', icon: <Image className="h-4 w-4" />, type: 'input' },
      { id: 'features', label: 'Visual Features', icon: <LayoutGrid className="h-4 w-4" />, type: 'process' },
      { id: 'config', label: 'Render Config', icon: <Settings className="h-4 w-4" />, type: 'output' },
    ],
  },
  4: {
    title: 'Agents & Languages',
    subtitle: 'Configure AI and localization',
    icon: <Bot className="h-5 w-5" />,
    description: 'Select AI models, architecture type, and target languages. Configure voiceover settings for narrated presentations.',
    keyActions: [
      'Select AI architecture (Single, Agentic, A2A)',
      'Choose text, image, and voice models',
      'Select output languages (up to 7)',
      'Configure voiceover settings',
    ],
    expectedOutcome: 'Multi-lingual presentation ready for global audiences with professional narration.',
    tips: [
      'Agentic AI provides highest quality',
      'Voice models vary by language',
      'First 3 languages get voiceover by default',
    ],
    flowDiagram: [
      { id: 'models', label: 'AI Models', icon: <Bot className="h-4 w-4" />, type: 'input' },
      { id: 'langs', label: 'Languages', icon: <Languages className="h-4 w-4" />, type: 'input' },
      { id: 'voice', label: 'Voice Synthesis', icon: <Mic className="h-4 w-4" />, type: 'process' },
      { id: 'output', label: 'Multi-Lingual Deck', icon: <Sparkles className="h-4 w-4" />, type: 'output' },
    ],
  },
  5: {
    title: 'Generate',
    subtitle: 'Review and create',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Review all your configurations, see AI reasoning and confidence scores, then generate your presentation.',
    keyActions: [
      'Review all selected options',
      'Check AI confidence scores',
      'Verify credit/token estimate',
      'Click Generate to start creation',
    ],
    expectedOutcome: 'Professional presentation generated with all configured features and languages.',
    tips: [
      'Higher confidence = better results',
      'Review model selections for quality',
      'Generation time varies by complexity',
    ],
    flowDiagram: [
      { id: 'config', label: 'All Configs', icon: <Settings className="h-4 w-4" />, type: 'input' },
      { id: 'validate', label: 'AI Validation', icon: <CheckCircle2 className="h-4 w-4" />, type: 'process' },
      { id: 'generate', label: 'Generation', icon: <Play className="h-4 w-4" />, type: 'process' },
      { id: 'deck', label: 'Your Deck', icon: <Sparkles className="h-4 w-4" />, type: 'output' },
    ],
  },
};

interface StepGuidancePanelProps {
  currentStep: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function StepGuidancePanel({ 
  currentStep, 
  isExpanded = true,
  onToggle,
  className 
}: StepGuidancePanelProps) {
  const config = STEP_CONFIGS[currentStep];
  
  if (!config) return null;

  return (
    <div className={cn(
      "rounded-lg border bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">Step {currentStep}: {config.title}</h3>
            <p className="text-xs text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Guidance
        </Badge>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Description */}
          <p className="text-sm text-foreground/80 leading-relaxed">
            {config.description}
          </p>

          {/* Flow Diagram */}
          {config.flowDiagram && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Process Flow
              </p>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {config.flowDiagram.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium",
                      node.type === 'input' && "bg-blue-500/10 text-blue-600 border border-blue-500/30",
                      node.type === 'process' && "bg-amber-500/10 text-amber-600 border border-amber-500/30",
                      node.type === 'output' && "bg-green-500/10 text-green-600 border border-green-500/30",
                      node.type === 'decision' && "bg-purple-500/10 text-purple-600 border border-purple-500/30",
                    )}>
                      {node.icon}
                      <span className="whitespace-nowrap">{node.label}</span>
                    </div>
                    {index < config.flowDiagram!.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Key Actions */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              What to do
            </p>
            <ul className="space-y-1">
              {config.keyActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="text-primary mt-0.5">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-[10px] uppercase tracking-wide text-amber-600 mb-2 font-medium flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Pro Tips
            </p>
            <ul className="space-y-1">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                  <span className="mt-0.5">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Outcome */}
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
            <p className="text-[10px] uppercase tracking-wide text-green-600 mb-1 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Expected Outcome
            </p>
            <p className="text-xs text-green-700">{config.expectedOutcome}</p>
          </div>

          {/* RLHF Feedback */}
          <div className="pt-2 border-t">
            <InlineTrainAIFeedback
              data={{
                context: 'slide_generation',
                product: 'deck',
                contentId: `step_guidance_${currentStep}`,
                metadata: { step: currentStep, stepTitle: config.title }
              }}
              variant="minimal"
              showTextFeedback={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StepGuidancePanel;