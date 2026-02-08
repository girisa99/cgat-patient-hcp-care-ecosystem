/**
 * Add Scene Dropdown
 * Scene type picker with descriptions, wired to onScenesModified
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';

interface AddSceneDropdownProps {
  scenes: BlueprintScene[];
  onScenesModified?: (scenes: BlueprintScene[], description: string) => void;
}

const SCENE_TYPE_OPTIONS = [
  {
    value: 'intro',
    label: 'Introduction / Hook',
    description: 'Grab attention in the first few seconds',
    icon: <Sparkles className="h-4 w-4" />,
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
    value: 'feature',
    label: 'Feature Highlight',
    description: 'Showcase a specific product feature or benefit',
    icon: <Layers className="h-4 w-4" />,
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
    value: 'testimonial',
    label: 'Customer Testimonial',
    description: 'Social proof with real customer story',
    icon: <Target className="h-4 w-4" />,
    defaults: {
      duration_seconds: 20,
      min_duration_seconds: 10,
      max_duration_seconds: 45,
      script_template: '{{customer_name}} shares their experience: "{{testimonial_quote}}"',
      is_optional: true,
      is_repeatable: true,
    },
  },
  {
    value: 'content',
    label: 'Before vs After',
    description: 'Visual comparison showing transformation',
    icon: <BarChart3 className="h-4 w-4" />,
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
    value: 'cta',
    label: 'Call to Action',
    description: 'Drive viewers to take the next step',
    icon: <ChevronRight className="h-4 w-4" />,
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
    defaults: {
      duration_seconds: 8,
      min_duration_seconds: 5,
      max_duration_seconds: 15,
      script_template: '{{brand_name}} — {{tagline}}',
      is_optional: false,
      is_repeatable: false,
    },
  },
] as const;

export function AddSceneDropdown({ scenes, onScenesModified }: AddSceneDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAddScene = (option: typeof SCENE_TYPE_OPTIONS[number]) => {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-9 text-xs gap-1.5 border-dashed"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Custom Scene
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80",
            "bg-popover border border-border rounded-lg shadow-xl",
            "z-[999999] overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
            <span className="text-xs font-medium">Choose Scene Type</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {SCENE_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 text-left",
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
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    Duration: {option.defaults.min_duration_seconds}s–{option.defaults.max_duration_seconds}s
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
