import React from 'react';
import { Video, Image, Share2, LayoutTemplate } from 'lucide-react';

const INTENTS = [
  { id: 'product_video', label: 'Product Video', icon: Video },
  { id: 'hero_banner', label: 'Hero Banner', icon: Image },
  { id: 'social', label: 'Social Content', icon: Share2 },
  { id: 'landing', label: 'Landing Section', icon: LayoutTemplate },
] as const;

interface IntentSelectorProps {
  selectedIntent?: string;
  onSelectIntent: (intent: string) => void;
  className?: string;
}

export const IntentSelector: React.FC<IntentSelectorProps> = ({
  selectedIntent,
  onSelectIntent,
  className,
}) => (
  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className || ''}`}>
    {INTENTS.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onSelectIntent(id)}
        className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition-all ${
          selectedIntent === id
            ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-foreground'
            : 'border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium">{label}</span>
      </button>
    ))}
  </div>
);
