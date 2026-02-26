/**
 * CreateWizardDemo — Proof-of-concept wiring of StepWizard into Genie Cast
 * Shows the CREATE flow with 3 steps using Liquid Glass design
 */

import React, { useState, useMemo } from 'react';
import { StepWizardProvider, StepWizard, TranscreationInput, type WizardStep } from '@/components/shared/step-wizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Palette, Rocket, Video, Globe, Mic, Type, Film } from 'lucide-react';
import { toast } from 'sonner';

// AI-generated step thumbnails
import stepIntentThumb from '@/assets/wizard-icons/step-intent.png';
import stepStyleThumb from '@/assets/wizard-icons/step-style.png';
import stepReviewThumb from '@/assets/wizard-icons/step-review.png';

// ── Step 1: What (Intent + Messaging) ─────────────────────────────────────

const StepWhat: React.FC = () => {
  const [intentTitle, setIntentTitle] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const formats = [
    { id: 'short', label: 'Short-form', localLabel: 'فيديو قصير', icon: Video, desc: '15-60s social clips' },
    { id: 'long', label: 'Long-form', localLabel: 'فيديو طويل', icon: Film, desc: '2-10min explainers' },
    { id: 'audio', label: 'Audio/Podcast', localLabel: 'بودكاست', icon: Mic, desc: 'Voice-first content' },
    { id: 'text', label: 'Script Only', localLabel: 'نص فقط', icon: Type, desc: 'Written scripts & copy' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">What do you want to create?</h2>
        <p className="text-sm text-muted-foreground mt-1">Define your content intent and format</p>
      </div>

      <TranscreationInput
        label="Content Title"
        localLabel="عنوان المحتوى"
        value={intentTitle}
        onChange={setIntentTitle}
        placeholder="e.g. Product launch announcement for Q2..."
        localPlaceholder="مثال: إعلان إطلاق المنتج للربع الثاني..."
        transcreatedPreview={intentTitle ? 'إعلان إطلاق المنتج للربع الثاني من عام 2026' : undefined}
        transcreatedLang="العربية"
        showLanguageBadge
        showTranscreationPreview={!!intentTitle}
      />

      <div>
        <p className="text-sm font-medium text-foreground mb-3">Content Format</p>
        <div className="grid grid-cols-2 gap-3">
          {formats.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`group relative p-4 rounded-xl border transition-all duration-300 text-left ${
                selectedFormat === f.id
                  ? 'border-primary/40 bg-primary/[0.06] shadow-[0_0_20px_rgba(var(--primary-rgb,99,102,241),0.15)]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]'
              }`}
            >
              {/* Liquid glass shine */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
              
              <f.icon className={`w-5 h-5 mb-2 ${
                selectedFormat === f.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/70'
              }`} />
              <p className="text-sm font-medium text-foreground">{f.label}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">{f.localLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Step 2: How (Style + AI + Region) ─────────────────────────────────────

const StepHow: React.FC = () => {
  const [briefing, setBriefing] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">How should it look & feel?</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure style, AI models, and regional targeting</p>
      </div>

      <TranscreationInput
        label="Creative Briefing"
        localLabel="ملخص إبداعي"
        value={briefing}
        onChange={setBriefing}
        placeholder="Describe the tone, style, and audience..."
        localPlaceholder="صف النبرة والأسلوب والجمهور المستهدف..."
        multiline
        rows={4}
        transcreatedPreview={briefing ? 'وصف النبرة والأسلوب والجمهور المستهدف لهذا المحتوى الإبداعي' : undefined}
        transcreatedLang="العربية"
        showTranscreationPreview={!!briefing}
      />

      {/* Region selector placeholder */}
      <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Target Regions
            <Badge variant="outline" className="text-[10px] border-white/10">6 regions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {['Europe', 'CJK', 'MENA', 'India', 'SEA', 'Africa'].map(r => (
              <div key={r} className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-center text-xs text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.04] cursor-pointer transition-all">
                {r}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Step 3: Review ────────────────────────────────────────────────────────

const StepReview: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-foreground">Review & Launch</h2>
      <p className="text-sm text-muted-foreground mt-1">Verify your configuration before generating</p>
    </div>

    <Card className="border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
          <span className="text-sm text-muted-foreground">Content Format</span>
          <Badge className="bg-primary/10 text-primary border-primary/20">Short-form</Badge>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
          <span className="text-sm text-muted-foreground">Target Regions</span>
          <span className="text-sm text-foreground">3 selected</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
          <span className="text-sm text-muted-foreground">Transcreation</span>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">Active</Badge>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">Estimated Credits</span>
          <span className="text-sm font-medium text-foreground">12 credits</span>
        </div>
      </CardContent>
    </Card>

    <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] text-center">
      <Rocket className="w-6 h-6 text-primary mx-auto mb-2" />
      <p className="text-sm text-foreground">Ready to generate</p>
      <p className="text-xs text-muted-foreground mt-1">Click "Launch" to start production</p>
    </div>
  </div>
);

// ── Main Demo Wrapper ─────────────────────────────────────────────────────

export const CreateWizardDemo: React.FC<{
  direction?: 'ltr' | 'rtl';
  locale?: string;
}> = ({ direction = 'ltr', locale = 'en' }) => {
  const steps = useMemo<WizardStep[]>(() => [
    {
      id: 'what',
      label: 'Content Intent',
      localLabel: direction === 'rtl' ? 'نية المحتوى' : undefined,
      description: 'Define what you want to create',
      thumbnail: stepIntentThumb,
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      id: 'how',
      label: 'Style & Config',
      localLabel: direction === 'rtl' ? 'النمط والإعدادات' : undefined,
      description: 'Choose style, AI, and regions',
      thumbnail: stepStyleThumb,
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'review',
      label: 'Review & Launch',
      localLabel: direction === 'rtl' ? 'مراجعة وإطلاق' : undefined,
      description: 'Verify and start generation',
      thumbnail: stepReviewThumb,
      icon: <Rocket className="w-4 h-4" />,
    },
  ], [direction]);

  return (
    <StepWizardProvider
      config={{
        steps,
        direction,
        locale,
        onComplete: () => toast.success('🚀 Production started!'),
        allowJumpBack: true,
      }}
    >
      <StepWizard
        completeLabel="Launch"
        localCompleteLabel={direction === 'rtl' ? 'إطلاق' : undefined}
        nextLabel="Next"
        localNextLabel={direction === 'rtl' ? 'التالي' : undefined}
        prevLabel="Back"
        localPrevLabel={direction === 'rtl' ? 'السابق' : undefined}
      >
        <StepWhat />
        <StepHow />
        <StepReview />
      </StepWizard>
    </StepWizardProvider>
  );
};

export default CreateWizardDemo;
