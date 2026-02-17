import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Presentation, Loader2 } from 'lucide-react';

interface CreatePresentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const presentationTemplates = [
  { id: 'document-processing', name: 'Document Processing', description: 'AI-powered document processing platform' },
  { id: 'patient-onboarding', name: 'Patient Onboarding', description: 'Healthcare patient onboarding flow' },
  { id: 'agentic-ai', name: 'Agentic AI', description: 'AI agent orchestration platform' },
  { id: 'custom', name: 'Custom', description: 'Start from scratch' }
];

const categories = [
  'Healthcare',
  'AI/ML',
  'Document Processing',
  'Onboarding',
  'Platform Overview',
  'Technical',
  'Sales'
];

export const CreatePresentationDialog: React.FC<CreatePresentationDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: 'custom',
    category: '',
    isPublic: false,
    linkedinTemplate: ''
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();

      const { data, error } = await supabase
        .from('presentations')
        .insert({
          user_id: user.user.id,
          name: formData.name,
          description: formData.description,
          slug,
          presentation_type: formData.template,
          category: formData.category,
          is_public: formData.isPublic,
          linkedin_post_template: formData.linkedinTemplate,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Presentation created!');
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        template: 'custom',
        category: '',
        isPublic: false,
        linkedinTemplate: ''
      });
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error('Failed to create presentation');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-primary" />
            Create New Presentation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="My Presentation"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this presentation about?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={formData.template}
                onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {presentationTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Post Template</Label>
            <Textarea
              id="linkedin"
              placeholder="🚀 Check out my new presentation on..."
              value={formData.linkedinTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedinTemplate: e.target.value }))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This template will be used when sharing to LinkedIn
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium">Make Public</div>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this presentation
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => createMutation.mutate()}
            disabled={!formData.name || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Presentation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
