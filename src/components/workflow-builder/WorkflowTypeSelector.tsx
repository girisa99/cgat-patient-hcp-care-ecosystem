import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Data type options
export const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
];

// Operation types for workflow nodes
export const OPERATION_TYPES = [
  { value: 'agent', label: 'Agent', desc: 'Dynamic tool utilization with multi-step reasoning' },
  { value: 'condition', label: 'Condition', desc: 'Split flows based on if-else conditions' },
  { value: 'conditional_agent', label: 'Conditional Agent', desc: 'Use agent to split flows based on dynamic conditions' },
  { value: 'custom_function', label: 'Custom Function', desc: 'Execute custom function' },
  { value: 'direct_reply', label: 'Direct Reply', desc: 'Directly reply to user with a message' },
  { value: 'execute_flow', label: 'Execute Flow', desc: 'Execute another flow' },
  { value: 'http', label: 'HTTP', desc: 'Send HTTP request' },
  { value: 'human_input', label: 'Human Input', desc: 'Request human input, approval or rejection' },
  { value: 'iteration', label: 'Iteration', desc: 'Execute nodes within iteration block through N iterations' },
  { value: 'llm', label: 'LLM', desc: 'Large language models to analyze inputs and generate responses' },
  { value: 'retriever', label: 'Retriever', desc: 'Retrieve information from vector database' },
  { value: 'loop', label: 'Loop', desc: 'Loop back to a previous node' },
  { value: 'start', label: 'Start', desc: 'Starting point of agent flow' },
  { value: 'stick_note', label: 'Stick Note', desc: 'Add notes to the agent flow' },
  { value: 'tools', label: 'Tools', desc: 'LLM, SLM, Vision models, MCP, Labeling studio tools' },
];

// Condition operations
export const CONDITION_OPERATIONS = [
  { value: 'contains', label: 'Contains' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'equal', label: 'Equal' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'not_equal', label: 'Not Equal' },
  { value: 'regex', label: 'Regex' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'not_empty', label: 'Not Empty' },
];

interface WorkflowTypeSelectorProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; desc?: string }>;
  placeholder?: string;
}

export const WorkflowTypeSelector: React.FC<WorkflowTypeSelectorProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select option..."
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.desc && (
                  <span className="text-xs text-muted-foreground">{option.desc}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};