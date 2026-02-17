import React from 'react';
import { Button } from '@/components/ui/button';
import { useAgentBuilder } from './AgentBuilderProvider';
import { Badge } from '@/components/ui/badge';

const modes: Array<{ id: 'prompt' | 'visual' | 'manual'; label: string; hint: string }> = [
  { id: 'prompt', label: 'Prompt', hint: 'Describe in natural language' },
  { id: 'visual', label: 'Visual', hint: 'Drag-and-connect canvas' },
  { id: 'manual', label: 'Manual', hint: 'Form-based configuration' },
];

const ModePicker: React.FC = () => {
  const { mode, setMode } = useAgentBuilder();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Build Mode:</span>
        <Badge variant="secondary">Switch anytime</Badge>
      </div>
      <div className="flex items-center gap-2">
        {modes.map(m => (
          <Button
            key={m.id}
            size="sm"
            variant={mode === m.id ? 'default' : 'outline'}
            onClick={() => setMode(m.id)}
            className="whitespace-nowrap"
            aria-pressed={mode === m.id}
          >
            {m.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ModePicker;
