/**
 * Add Custom Agent Dialog
 * Inline agent creation within document processing workflow
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Plus,
  Sparkles,
  Database,
  Globe,
  Brain,
  Zap,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AddCustomAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTypeId: string;
  onAgentCreated?: (agent: CustomAgentConfig) => void;
}

export interface CustomAgentConfig {
  id: string;
  name: string;
  description: string;
  architectureType: 'single' | 'agentic' | 'a2a' | 'multi-agent';
  triggerCondition: string;
  capabilities: string[];
  documentTypeId: string;
}

const ARCHITECTURE_OPTIONS = [
  {
    id: 'single',
    label: 'Single Agent',
    description: 'Simple task execution',
    icon: <Bot className="h-4 w-4" />
  },
  {
    id: 'agentic',
    label: 'Agentic AI',
    description: 'Reasoning + tools',
    icon: <Brain className="h-4 w-4" />
  },
  {
    id: 'a2a',
    label: 'A2A Protocol',
    description: 'Agent-to-agent API',
    icon: <Globe className="h-4 w-4" />
  },
  {
    id: 'multi-agent',
    label: 'Multi-Agent',
    description: 'Team coordination',
    icon: <Sparkles className="h-4 w-4" />
  }
];

const CAPABILITY_OPTIONS = [
  { id: 'api', label: 'API Integration', icon: <Globe className="h-3 w-3" /> },
  { id: 'database', label: 'Database Query', icon: <Database className="h-3 w-3" /> },
  { id: 'ai', label: 'AI Analysis', icon: <Brain className="h-3 w-3" /> },
  { id: 'automation', label: 'Automation', icon: <Zap className="h-3 w-3" /> },
];

export function AddCustomAgentDialog({
  open,
  onOpenChange,
  documentTypeId,
  onAgentCreated
}: AddCustomAgentDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [architectureType, setArchitectureType] = useState<'single' | 'agentic' | 'a2a' | 'multi-agent'>('agentic');
  const [triggerCondition, setTriggerCondition] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>(['ai']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCapability = (capId: string) => {
    setCapabilities(prev =>
      prev.includes(capId)
        ? prev.filter(c => c !== capId)
        : [...prev, capId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const agentConfig: CustomAgentConfig = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        architectureType,
        triggerCondition: triggerCondition.trim() || `When ${documentTypeId} document processed`,
        capabilities,
        documentTypeId
      };

      // Call parent callback
      onAgentCreated?.(agentConfig);
      
      toast.success(`Agent "${name}" created`, {
        description: 'Added to workflow suggestions'
      });
      
      // Reset form
      setName('');
      setDescription('');
      setArchitectureType('agentic');
      setTriggerCondition('');
      setCapabilities(['ai']);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error('Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFullBuilder = () => {
    onOpenChange(false);
    navigate('/agents/canvas', {
      state: {
        fromDocumentProcessing: true,
        documentType: documentTypeId,
        prefillContext: {
          name: name || 'New Custom Agent',
          description: description,
          useCase: documentTypeId
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create Custom Agent
          </DialogTitle>
          <DialogDescription>
            Create a new agent for {documentTypeId} document processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input
              id="agent-name"
              placeholder="e.g., Insurance Verification Agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              placeholder="What does this agent do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Architecture Type */}
          <div className="space-y-2">
            <Label>Architecture Type</Label>
            <RadioGroup
              value={architectureType}
              onValueChange={(v) => setArchitectureType(v as any)}
              className="grid grid-cols-2 gap-2"
            >
              {ARCHITECTURE_OPTIONS.map((option) => (
                <div key={option.id}>
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    )}
                  >
                    {option.icon}
                    <span className="text-xs font-medium mt-1">{option.label}</span>
                    <span className="text-[10px] text-muted-foreground">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Trigger Condition */}
          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger Condition</Label>
            <Input
              id="trigger"
              placeholder={`e.g., When ${documentTypeId} is processed`}
              value={triggerCondition}
              onChange={(e) => setTriggerCondition(e.target.value)}
            />
          </div>

          {/* Capabilities */}
          <div className="space-y-2">
            <Label>Capabilities</Label>
            <div className="flex flex-wrap gap-2">
              {CAPABILITY_OPTIONS.map((cap) => (
                <Badge
                  key={cap.id}
                  variant={capabilities.includes(cap.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all gap-1",
                    capabilities.includes(cap.id) && "bg-primary"
                  )}
                  onClick={() => toggleCapability(cap.id)}
                >
                  {cap.icon}
                  {cap.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleOpenFullBuilder}
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Agent Builder
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isSubmitting}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create & Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddCustomAgentDialog;
