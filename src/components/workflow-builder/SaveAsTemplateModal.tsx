import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: any[];
  edges: any[];
  agentData?: any;
  onSave?: (templateId: string) => void;
}

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  agentData,
  onSave
}) => {
  const [templateName, setTemplateName] = useState(agentData?.name || '');
  const [description, setDescription] = useState(agentData?.description || '');
  const [category, setCategory] = useState('custom');
  const [templateType, setTemplateType] = useState('workflow');
  const [isPublic, setIsPublic] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    'custom',
    'healthcare',
    'insurance', 
    'onboarding',
    'clinical',
    'support',
    'safety',
    'development',
    'product',
    'crm',
    'scheduling',
    'quality',
    'research'
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Template name is required');
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save templates');
        return;
      }

      // Prepare template data
      const templateData = {
        name: templateName.trim(),
        description: description.trim(),
        template_type: templateType,
        category,
        is_public: isPublic,
        is_default: isDefault,
        created_by: user.id,
        configuration: {
          nodes,
          edges,
          metadata: {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            categories: [...new Set(nodes.map(n => n.data?.category).filter(Boolean))],
            agentTypes: [...new Set(nodes.map(n => n.data?.type_key).filter(Boolean))]
          }
        },
        canvas: { nodes, edges },
        tags,
        journey_stages: nodes.map((node, index) => ({
          id: node.id,
          title: node.data?.label || `Stage ${index + 1}`,
          description: node.data?.description || '',
          type: node.data?.type_key || 'action',
          category: node.data?.category || 'general',
          configuration: node.data?.configuration || {},
          order_index: index
        }))
      };

      const { data, error } = await supabase
        .from('agent_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;

      // Also create journey stages entries
      if (data.id && templateData.journey_stages.length > 0) {
        const stageEntries = templateData.journey_stages.map(stage => ({
          template_id: data.id,
          ...stage
        }));

        await supabase
          .from('agent_template_journey_stages')
          .insert(stageEntries);
      }

      toast.success(`Template "${templateName}" saved successfully! ${isPublic ? 'It will be available to all users.' : 'It\'s saved to your private collection.'}`);
      onSave?.(data.id);
      onClose();
      
      // Reset form
      setTemplateName('');
      setDescription('');
      setCategory('custom');
      setTemplateType('workflow');
      setIsPublic(false);
      setIsDefault(false);
      setTags([]);

    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(`Failed to save template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Save as Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this template does and when to use it"
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workflow">Workflow</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Public Template</Label>
                <p className="text-sm text-muted-foreground">Make this template available to all users</p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Default Template</Label>
                <p className="text-sm text-muted-foreground">Feature this template prominently</p>
              </div>
              <Switch
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>
          </div>

          {/* Template Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Template Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nodes:</span> {nodes.length}
              </div>
              <div>
                <span className="text-muted-foreground">Connections:</span> {edges.length}
              </div>
              <div>
                <span className="text-muted-foreground">Node Types:</span> {[...new Set(nodes.map(n => n.data?.type_key))].filter(Boolean).length}
              </div>
              <div>
                <span className="text-muted-foreground">Categories:</span> {[...new Set(nodes.map(n => n.data?.category))].filter(Boolean).length}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !templateName.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};