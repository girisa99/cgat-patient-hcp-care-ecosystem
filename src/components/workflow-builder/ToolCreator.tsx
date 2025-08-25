import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useWorkflowNodes } from '@/hooks/useWorkflowNodes';
import { useMasterToast } from '@/hooks/useMasterToast';

export const ToolCreator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const { categories, createNodeType, isCreating } = useWorkflowNodes();
  const { toast } = useMasterToast();

  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    detailed_explanation: '',
    category_id: '',
    type_key: '',
    icon: 'settings',
    color: '#6366f1',
    capabilities: [] as string[],
    is_draggable: true,
    is_configurable: true,
    default_config: {},
    input_schema: {},
    output_schema: {},
    requirements: {},
    order_index: 100
  });

  const [newCapability, setNewCapability] = useState('');

  useEffect(() => {
    const handleOpenToolCreator = () => {
      setIsCreatingCategory(false);
      setIsOpen(true);
    };

    const handleOpenCategoryCreator = () => {
      setIsCreatingCategory(true);
      setIsOpen(true);
    };

    window.addEventListener('open-tool-creator', handleOpenToolCreator as EventListener);
    window.addEventListener('open-category-creator', handleOpenCategoryCreator as EventListener);

    return () => {
      window.removeEventListener('open-tool-creator', handleOpenToolCreator as EventListener);
      window.removeEventListener('open-category-creator', handleOpenCategoryCreator as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.display_name || !formData.description || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    const typeKey = formData.type_key || formData.display_name.toLowerCase().replace(/\s+/g, '_');

    try {
      await createNodeType({
        ...formData,
        type_key: typeKey,
        is_active: true
      });
      
      // Reset form
      setFormData({
        display_name: '',
        description: '',
        detailed_explanation: '',
        category_id: '',
        type_key: '',
        icon: 'settings',
        color: '#6366f1',
        capabilities: [],
        is_draggable: true,
        is_configurable: true,
        default_config: {},
        input_schema: {},
        output_schema: {},
        requirements: {},
        order_index: 100
      });
      
      setIsOpen(false);
      toast.success('Tool created successfully!');
    } catch (error) {
      console.error('Failed to create tool:', error);
    }
  };

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, newCapability.trim()]
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  if (isCreatingCategory) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input placeholder="e.g., Custom AI Models" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Brief description of this category..." />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Icon</Label>
                <Select defaultValue="settings">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="bot">Bot</SelectItem>
                    <SelectItem value="brain">Brain</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Color</Label>
                <Input type="color" defaultValue="#6366f1" />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1" disabled>
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Tool/Node</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Tool Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="e.g., Custom AI Agent"
                required
              />
            </div>
            <div>
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this tool does"
              required
            />
          </div>

          <div>
            <Label htmlFor="detailed_explanation">Detailed Explanation</Label>
            <Textarea
              id="detailed_explanation"
              value={formData.detailed_explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, detailed_explanation: e.target.value }))}
              placeholder="Detailed explanation of the tool's functionality..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type_key">Type Key</Label>
              <Input
                id="type_key"
                value={formData.type_key}
                onChange={(e) => setFormData(prev => ({ ...prev, type_key: e.target.value }))}
                placeholder="Auto-generated from name"
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="bot">Bot</SelectItem>
                  <SelectItem value="brain">Brain</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="zap">Lightning</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Capabilities</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                placeholder="Add capability (e.g., 'text processing')"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
              />
              <Button type="button" onClick={addCapability} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.capabilities.map(capability => (
                <Badge key={capability} variant="secondary" className="text-xs">
                  {capability}
                  <button
                    type="button"
                    onClick={() => removeCapability(capability)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" onClick={() => setIsOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="flex-1">
              {isCreating ? 'Creating...' : 'Create Tool'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};