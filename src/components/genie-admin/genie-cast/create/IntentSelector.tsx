/**
 * INTENT SELECTOR - Compact guided step for CREATE workflow
 * 
 * Database-driven intent selection with:
 * - Grouped dropdown by category
 * - "Add New Intent" dialog with AI-assisted context capture
 * - No auto-advance flicker (user confirms explicitly)
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, CheckCircle2, Plus, Loader2, Wand2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useContentIntents } from '@/hooks/useContentIntents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IntentSelectorProps {
  selectedIntent: string | null;
  onIntentSelect: (intentId: string) => void;
  onIntentConfirmed: () => void;
  className?: string;
}

const CATEGORY_ORDER = ['marketing', 'education', 'enterprise', 'social'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  marketing: '🎯 Marketing',
  education: '📚 Educational',
  enterprise: '🏢 Enterprise',
  social: '📱 Social',
};

const CONTENT_TYPE_OPTIONS = [
  'video', 'infographic', 'animation', 'chart', 'whitepaper',
  'statistics_card', 'customer_journey', 'process_flow', 'presentation', 'social_post',
];

const INDUSTRY_OPTIONS = [
  'Healthcare', 'Finance', 'Education', 'Technology', 'Real Estate',
  'Retail', 'Manufacturing', 'Legal', 'Hospitality', 'Energy',
  'Automotive', 'Agriculture', 'Logistics', 'Government', 'Non-Profit',
];

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onIntentSelect,
  onIntentConfirmed,
  className,
}) => {
  const { intents, getByKey, getByCategory, createIntent, refetch } = useContentIntents();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newIntent, setNewIntent] = useState({
    label: '',
    description: '',
    category: 'marketing',
    content_types: [] as string[],
    industry: '',
    nl_description: '',
  });

  const selectedIntentData = selectedIntent ? getByKey(selectedIntent) : null;

  const handleSelectIntent = useCallback((value: string) => {
    if (value === '__create_new__') {
      setShowCreateDialog(true);
      return;
    }
    onIntentSelect(value);
  }, [onIntentSelect]);

  const handleAnalyzeWithAI = useCallback(async () => {
    if (!newIntent.nl_description.trim()) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('intent-analyzer', {
        body: { description: newIntent.nl_description },
      });
      if (error) throw error;
      if (data?.analysis) {
        setNewIntent(prev => ({
          ...prev,
          label: data.analysis.label || prev.label,
          description: data.analysis.description || prev.description,
          category: data.analysis.category || prev.category,
          content_types: data.analysis.content_types || prev.content_types,
          industry: data.analysis.industry || prev.industry,
        }));
        toast({ title: 'AI Analysis Complete', description: 'Fields auto-populated. Review and adjust.' });
      }
    } catch (err) {
      console.warn('[IntentSelector] AI analysis failed, manual entry available:', err);
      toast({ title: 'AI unavailable', description: 'Please fill in the fields manually.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [newIntent.nl_description, toast]);

  const handleCreateIntent = useCallback(async () => {
    if (!newIntent.label.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    const intentKey = newIntent.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      await createIntent.mutateAsync({
        intent_key: intentKey,
        label: newIntent.label,
        description: newIntent.description || newIntent.label,
        category: newIntent.category,
        default_styles: [],
        metadata: {
          content_types: newIntent.content_types,
          industry: newIntent.industry,
          capability_requirements: newIntent.content_types.map(t => {
            const caps: Record<string, string[]> = {
              infographic: ['image_generation', 'layout_engine'],
              animation: ['video_generation', 'motion_graphics'],
              chart: ['data_visualization', 'image_generation'],
              whitepaper: ['llm_generation', 'pdf_export'],
              statistics_card: ['data_visualization', 'image_generation'],
              customer_journey: ['diagram_generation', 'image_generation'],
              process_flow: ['diagram_generation', 'image_generation'],
              video: ['video_generation', 'tts', 'avatar'],
              presentation: ['slide_generation', 'image_generation'],
              social_post: ['image_generation', 'copywriting'],
            };
            return caps[t] || [];
          }).flat(),
          ai_analyzed: !!newIntent.nl_description,
        },
      } as any);
      toast({ title: 'Intent Created', description: `"${newIntent.label}" added to your library.` });
      setShowCreateDialog(false);
      setNewIntent({ label: '', description: '', category: 'marketing', content_types: [], industry: '', nl_description: '' });
      await refetch();
      onIntentSelect(intentKey);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [newIntent, createIntent, toast, refetch, onIntentSelect]);

  const toggleContentType = (type: string) => {
    setNewIntent(prev => ({
      ...prev,
      content_types: prev.content_types.includes(type)
        ? prev.content_types.filter(t => t !== type)
        : [...prev.content_types, type],
    }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('max-w-xl mx-auto', className)}
      >
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="pt-6 space-y-4">
            {/* Step indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">What are you creating?</h3>
                <p className="text-sm text-muted-foreground">Pick a content type or create your own</p>
              </div>
            </div>

            {/* Dropdown selector — no auto-advance, user confirms via button */}
            <Select value={selectedIntent || ''} onValueChange={handleSelectIntent}>
              <SelectTrigger className="h-12 text-base bg-background">
                <SelectValue placeholder="Choose content type..." />
              </SelectTrigger>
              <SelectContent className="z-[100000] bg-popover">
                {CATEGORY_ORDER.map((category) => {
                  const categoryIntents = getByCategory(category);
                  if (categoryIntents.length === 0) return null;
                  return (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-xs font-semibold">
                        {CATEGORY_LABELS[category]}
                      </SelectLabel>
                      {categoryIntents.map((intent) => (
                        <SelectItem key={intent.intent_key} value={intent.intent_key}>
                          <div className="flex items-center gap-2">
                            <span>{intent.label}</span>
                            <span className="text-muted-foreground text-xs">— {intent.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
                {/* Add New Intent option */}
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold">✨ Custom</SelectLabel>
                  <SelectItem value="__create_new__">
                    <div className="flex items-center gap-2 text-primary">
                      <Plus className="w-3.5 h-3.5" />
                      <span className="font-medium">Create New Intent...</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Selection confirmation + next step */}
            {selectedIntentData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center justify-between gap-3 pt-2 border-t"
              >
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="font-medium">{selectedIntentData.label}</span>
                  {selectedIntentData.default_styles?.slice(0, 1).map(s => (
                    <Badge key={s} variant="secondary" className="text-[10px]">
                      {s.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
                <Button onClick={onIntentConfirmed} size="sm" className="gap-1.5">
                  Next: Choose Template
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create New Intent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg z-[100001]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create New Content Intent
            </DialogTitle>
            <DialogDescription>
              Describe what you want to create and AI will auto-populate the fields, or fill them manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* AI-assisted NL input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Describe your intent (AI-assisted)</Label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="e.g., I need animated infographics showing patient journey flows for healthcare providers..."
                  value={newIntent.nl_description}
                  onChange={(e) => setNewIntent(prev => ({ ...prev, nl_description: e.target.value }))}
                  className="min-h-[60px] text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzing || !newIntent.nl_description.trim()}
                  className="shrink-0 self-end"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Structured fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input
                  placeholder="e.g., Patient Journey Flow"
                  value={newIntent.label}
                  onChange={(e) => setNewIntent(prev => ({ ...prev, label: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select value={newIntent.category} onValueChange={(v) => setNewIntent(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100002]">
                    {CATEGORY_ORDER.map(c => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                placeholder="Brief description of this intent"
                value={newIntent.description}
                onChange={(e) => setNewIntent(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <Label className="text-xs">Industry (optional)</Label>
              <Select value={newIntent.industry || 'none'} onValueChange={(v) => setNewIntent(prev => ({ ...prev, industry: v === 'none' ? '' : v }))}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Any industry" />
                </SelectTrigger>
                <SelectContent className="z-[100002]">
                  <SelectItem value="none">Any Industry</SelectItem>
                  {INDUSTRY_OPTIONS.map(i => (
                    <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content type chips */}
            <div className="space-y-1.5">
              <Label className="text-xs">Content Types (what outputs does this produce?)</Label>
              <div className="flex flex-wrap gap-1.5">
                {CONTENT_TYPE_OPTIONS.map(type => (
                  <Badge
                    key={type}
                    variant={newIntent.content_types.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs capitalize"
                    onClick={() => toggleContentType(type)}
                  >
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateIntent} disabled={!newIntent.label.trim() || createIntent.isPending}>
              {createIntent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Intent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IntentSelector;
