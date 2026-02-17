/**
 * Add Scene Dropdown
 * Comprehensive scene type picker with categories, descriptions, and custom option
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Sparkles,
  FileText,
  Layers,
  Video,
  Target,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  X,
  Image,
  Globe,
  TrendingUp,
  Award,
  MessageSquare,
  Zap,
  Users,
  ShieldCheck,
  PenTool,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';

interface AddSceneDropdownProps {
  scenes: BlueprintScene[];
  onScenesModified?: (scenes: BlueprintScene[], description: string) => void;
}

interface SceneTypeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'marketing' | 'content' | 'closing';
  defaults: {
    duration_seconds: number;
    min_duration_seconds: number;
    max_duration_seconds: number;
    script_template: string;
    is_optional: boolean;
    is_repeatable: boolean;
  };
}

const SCENE_TYPE_OPTIONS: SceneTypeOption[] = [
  // ── CORE SCENES ──
  {
    value: 'intro',
    label: 'Introduction / Hook',
    description: 'Grab attention in the first few seconds',
    icon: <Sparkles className="h-4 w-4" />,
    category: 'core',
    defaults: {
      duration_seconds: 10,
      min_duration_seconds: 5,
      max_duration_seconds: 15,
      script_template: 'What if you could {{value_proposition}} in half the time?',
      is_optional: false,
      is_repeatable: false,
    },
  },
  {
    value: 'hero_banner',
    label: 'Hero Banner',
    description: 'Full-width visual hero with headline, tagline & CTA overlay',
    icon: <Image className="h-4 w-4" />,
    category: 'core',
    defaults: {
      duration_seconds: 12,
      min_duration_seconds: 8,
      max_duration_seconds: 20,
      script_template: '{{headline}} — {{tagline}}. {{cta_text}}.',
      is_optional: false,
      is_repeatable: false,
    },
  },
  // ── MARKETING SCENES ──
  {
    value: 'positioning',
    label: 'Positioning Statement',
    description: 'Market position, unique value prop & competitive differentiation',
    icon: <Target className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 15,
      min_duration_seconds: 10,
      max_duration_seconds: 25,
      script_template: '{{product_name}} is the only {{category}} that {{differentiator}} for {{target_audience}}.',
      is_optional: true,
      is_repeatable: false,
    },
  },
  {
    value: 'stats',
    label: 'Stats & Data Points',
    description: 'Key metrics, percentages, ROI figures with visual emphasis',
    icon: <TrendingUp className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 12,
      min_duration_seconds: 8,
      max_duration_seconds: 20,
      script_template: '{{stat_value}} {{stat_metric}} — {{stat_context}}.',
      is_optional: true,
      is_repeatable: true,
    },
  },
  {
    value: 'benefits',
    label: 'Benefits & Value',
    description: 'Customer-centric benefits and outcomes, not features',
    icon: <Award className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 18,
      min_duration_seconds: 10,
      max_duration_seconds: 30,
      script_template: 'With {{product_name}}, you get: {{benefit_1}}, {{benefit_2}}, and {{benefit_3}}.',
      is_optional: true,
      is_repeatable: true,
    },
  },
  {
    value: 'regional_highlight',
    label: 'Regional / Market Highlight',
    description: 'Region-specific messaging, local stats & cultural context',
    icon: <Globe className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 15,
      min_duration_seconds: 10,
      max_duration_seconds: 25,
      script_template: 'In {{region_name}}, {{local_stat}}. {{product_name}} addresses this with {{local_solution}}.',
      is_optional: true,
      is_repeatable: true,
    },
  },
  {
    value: 'pain_point',
    label: 'Problem / Pain Point',
    description: 'Articulate the audience\'s challenge before presenting the solution',
    icon: <Zap className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 12,
      min_duration_seconds: 8,
      max_duration_seconds: 20,
      script_template: '{{target_audience}} struggle with {{pain_point}}. It costs them {{cost_of_inaction}}.',
      is_optional: true,
      is_repeatable: true,
    },
  },
  {
    value: 'social_proof',
    label: 'Social Proof / Testimonial',
    description: 'Customer quotes, logos, case study snippets',
    icon: <Users className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 20,
      min_duration_seconds: 10,
      max_duration_seconds: 45,
      script_template: '{{customer_name}} shares: "{{testimonial_quote}}"',
      is_optional: true,
      is_repeatable: true,
    },
  },
  {
    value: 'trust',
    label: 'Trust & Compliance',
    description: 'Security badges, certifications, compliance logos',
    icon: <ShieldCheck className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 10,
      min_duration_seconds: 5,
      max_duration_seconds: 15,
      script_template: 'Trusted by {{customer_count}}+ organizations. {{compliance_badges}}.',
      is_optional: true,
      is_repeatable: false,
    },
  },
  {
    value: 'pricing',
    label: 'Pricing / Plans',
    description: 'Tier comparison, pricing highlights, free trial info',
    icon: <DollarSign className="h-4 w-4" />,
    category: 'marketing',
    defaults: {
      duration_seconds: 15,
      min_duration_seconds: 10,
      max_duration_seconds: 25,
      script_template: 'Start free. Upgrade to {{plan_name}} for {{price}} — includes {{key_feature}}.',
      is_optional: true,
      is_repeatable: false,
    },
  },
  // ── CONTENT SCENES ──
  {
    value: 'feature',
    label: 'Feature Highlight',
    description: 'Showcase a specific product feature or capability',
    icon: <Layers className="h-4 w-4" />,
    category: 'content',
    defaults: {
      duration_seconds: 20,
      min_duration_seconds: 10,
      max_duration_seconds: 40,
      script_template: 'Key Feature: {{feature_name}} — {{feature_description}}',
      is_optional: true,
      is_repeatable: true,
    },
  },
  {
    value: 'demo',
    label: 'Product Demo',
    description: 'Screen recording or walkthrough of product features',
    icon: <Video className="h-4 w-4" />,
    category: 'content',
    defaults: {
      duration_seconds: 30,
      min_duration_seconds: 15,
      max_duration_seconds: 60,
      script_template: 'Watch how {{product_name}} helps you {{action_verb}} in just {{time_frame}}.',
      is_optional: false,
      is_repeatable: false,
    },
  },
  {
    value: 'content',
    label: 'Before vs After',
    description: 'Visual comparison showing transformation',
    icon: <BarChart3 className="h-4 w-4" />,
    category: 'content',
    defaults: {
      duration_seconds: 15,
      min_duration_seconds: 10,
      max_duration_seconds: 30,
      script_template: 'Before {{product_name}}: {{pain_point}}. After: {{benefit}}.',
      is_optional: true,
      is_repeatable: false,
    },
  },
  {
    value: 'messaging',
    label: 'Key Messaging',
    description: 'Core brand message, mission statement, or elevator pitch',
    icon: <MessageSquare className="h-4 w-4" />,
    category: 'content',
    defaults: {
      duration_seconds: 15,
      min_duration_seconds: 8,
      max_duration_seconds: 25,
      script_template: '{{brand_name}}: {{mission_statement}}. We help {{audience}} {{outcome}}.',
      is_optional: true,
      is_repeatable: false,
    },
  },
  // ── CLOSING SCENES ──
  {
    value: 'cta',
    label: 'Call to Action',
    description: 'Drive viewers to take the next step',
    icon: <ChevronRight className="h-4 w-4" />,
    category: 'closing',
    defaults: {
      duration_seconds: 10,
      min_duration_seconds: 5,
      max_duration_seconds: 20,
      script_template: '{{cta_text}} — Visit {{url}} to get started today.',
      is_optional: false,
      is_repeatable: false,
    },
  },
  {
    value: 'outro',
    label: 'Closing / Outro',
    description: 'Wrap up with brand outro and final message',
    icon: <CheckCircle2 className="h-4 w-4" />,
    category: 'closing',
    defaults: {
      duration_seconds: 8,
      min_duration_seconds: 5,
      max_duration_seconds: 15,
      script_template: '{{brand_name}} — {{tagline}}',
      is_optional: false,
      is_repeatable: false,
    },
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  core: { label: 'Core', color: 'text-primary' },
  marketing: { label: 'Marketing & Positioning', color: 'text-orange-500' },
  content: { label: 'Content & Product', color: 'text-blue-500' },
  closing: { label: 'Closing', color: 'text-green-500' },
};

export function AddSceneDropdown({ scenes, onScenesModified }: AddSceneDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customScript, setCustomScript] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAddScene = (option: SceneTypeOption) => {
    const newScene: BlueprintScene = {
      id: crypto.randomUUID(),
      blueprint_id: scenes[0]?.blueprint_id || '',
      scene_key: `custom_${option.value}_${Date.now()}`,
      title: option.label,
      description: option.description,
      order_index: scenes.length,
      scene_type: option.value,
      script_template: option.defaults.script_template,
      script_variables: [],
      duration_seconds: option.defaults.duration_seconds,
      min_duration_seconds: option.defaults.min_duration_seconds,
      max_duration_seconds: option.defaults.max_duration_seconds,
      visual_config: {},
      audio_config: {},
      transition_config: {},
      is_optional: option.defaults.is_optional,
      is_repeatable: option.defaults.is_repeatable,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert before CTA/outro if they exist, otherwise at end
    const insertIdx = scenes.findIndex(
      s => s.scene_type === 'cta' || s.scene_type === 'outro'
    );
    const updatedScenes = [...scenes];
    if (insertIdx >= 0) {
      updatedScenes.splice(insertIdx, 0, newScene);
    } else {
      updatedScenes.push(newScene);
    }

    // Re-index
    const reindexed = updatedScenes.map((s, i) => ({ ...s, order_index: i }));
    onScenesModified?.(reindexed, `Added "${option.label}" scene`);
    setIsOpen(false);
  };

  const handleAddCustomScene = () => {
    if (!customTitle.trim()) return;

    const newScene: BlueprintScene = {
      id: crypto.randomUUID(),
      blueprint_id: scenes[0]?.blueprint_id || '',
      scene_key: `custom_freeform_${Date.now()}`,
      title: customTitle.trim(),
      description: customDescription.trim() || 'Custom scene',
      order_index: scenes.length,
      scene_type: 'content',
      script_template: customScript.trim() || `{{${customTitle.trim().toLowerCase().replace(/\s+/g, '_')}_content}}`,
      script_variables: [],
      duration_seconds: 15,
      min_duration_seconds: 5,
      max_duration_seconds: 60,
      visual_config: {},
      audio_config: {},
      transition_config: {},
      is_optional: true,
      is_repeatable: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const insertIdx = scenes.findIndex(
      s => s.scene_type === 'cta' || s.scene_type === 'outro'
    );
    const updatedScenes = [...scenes];
    if (insertIdx >= 0) {
      updatedScenes.splice(insertIdx, 0, newScene);
    } else {
      updatedScenes.push(newScene);
    }

    const reindexed = updatedScenes.map((s, i) => ({ ...s, order_index: i }));
    onScenesModified?.(reindexed, `Added custom scene "${customTitle.trim()}"`);
    setIsOpen(false);
    setShowCustom(false);
    setCustomTitle('');
    setCustomDescription('');
    setCustomScript('');
  };

  // Group options by category
  const grouped = SCENE_TYPE_OPTIONS.reduce<Record<string, SceneTypeOption[]>>((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {});

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-9 text-xs gap-1.5 border-dashed"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Scene
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-96",
            "bg-popover border border-border rounded-lg shadow-xl",
            "z-[999999] overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
            {showCustom ? (
              <>
                <button
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCustom(false)}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
                <span className="text-xs font-medium">Create Custom Scene</span>
              </>
            ) : (
              <span className="text-xs font-medium">Choose Scene Type</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => { setIsOpen(false); setShowCustom(false); }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {showCustom ? (
            <div className="p-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Scene Title *</label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Market Opportunity, ROI Calculator"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Input
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Brief description of this scene's purpose"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Script Template</label>
                <Textarea
                  value={customScript}
                  onChange={(e) => setCustomScript(e.target.value)}
                  placeholder="Use {{variables}} for dynamic content..."
                  className="text-xs mt-1 min-h-[60px]"
                  rows={2}
                />
              </div>
              <Button
                size="sm"
                className="w-full text-xs"
                disabled={!customTitle.trim()}
                onClick={handleAddCustomScene}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Custom Scene
              </Button>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {Object.entries(grouped).map(([category, options]) => (
                <div key={category}>
                  <div className="px-3 pt-2 pb-1">
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", CATEGORY_LABELS[category]?.color || 'text-muted-foreground')}>
                      {CATEGORY_LABELS[category]?.label || category}
                    </span>
                  </div>
                  {options.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-2 text-left",
                        "hover:bg-accent/50 transition-colors cursor-pointer"
                      )}
                      onClick={() => handleAddScene(option)}
                    >
                      <div className="mt-0.5 text-muted-foreground">{option.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{option.label}</span>
                          {option.defaults.is_repeatable && (
                            <Badge variant="outline" className="text-[9px] h-4">Repeatable</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              {/* Custom Scene Option */}
              <div className="border-t border-border/50 mt-1 pt-1">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors"
                  onClick={() => setShowCustom(true)}
                >
                  <PenTool className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-primary">Create Custom Scene</span>
                    <p className="text-[11px] text-muted-foreground">Define your own scene type with custom script template</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
