import React from 'react';
import type { CreateMode } from '@/hooks/useCreateMode';

interface CreateModeToggleProps {
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
  className?: string;
}

export const CreateModeToggle: React.FC<CreateModeToggleProps> = ({
  mode,
  onModeChange,
  className,
}) => (
  <div className={`inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5 ${className || ''}`}>
    {(['simple', 'advanced'] as const).map((m) => (
      <button
        key={m}
        onClick={() => onModeChange(m)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === m
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {m === 'simple' ? 'Simple' : 'Advanced'}
      </button>
    ))}
  </div>
);
