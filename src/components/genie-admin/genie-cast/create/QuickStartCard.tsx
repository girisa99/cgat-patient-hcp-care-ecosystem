import React from 'react';
import { Sparkles } from 'lucide-react';

interface QuickStartCardProps {
  onSelect?: (template: string) => void;
  className?: string;
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({ onSelect, className }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 ${className || ''}`}>
    <div className="flex items-center gap-2 mb-3">
      <Sparkles className="h-4 w-4 text-emerald-400" />
      <h3 className="text-sm font-semibold">Quick Start</h3>
    </div>
    <p className="text-xs text-muted-foreground">
      Choose a template to get started quickly, or start from scratch.
    </p>
  </div>
);
