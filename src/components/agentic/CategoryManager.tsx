/**
 * Category Manager Component
 * Allows users to create and manage custom categories for agents and connectors
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, Tag, Palette, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface CustomCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  type: 'agent' | 'connector' | 'both';
  created_at: string;
  is_default: boolean;
}

interface CategoryManagerProps {
  onCategoryAdded?: (category: CustomCategory) => void;
  onCategoryUpdated?: (category: CustomCategory) => void;
  onCategoryDeleted?: (categoryId: string) => void;
  existingCategories?: CustomCategory[];
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  onCategoryAdded,
  onCategoryUpdated,
  onCategoryDeleted,
  existingCategories = []
}) => {
  const [categories, setCategories] = useState<CustomCategory[]>(existingCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'Tag',
    type: 'both' as 'agent' | 'connector' | 'both'
  });

  // Default categories that are always available
  const defaultCategories: CustomCategory[] = [
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical and healthcare-related services',
      color: '#059669',
      icon: 'Stethoscope',
      type: 'both',
      created_at: new Date().toISOString(),
      is_default: true
    },
    {
      id: 'ai-models',
      name: 'AI Models',
      description: 'Language models and AI services',
      color: '#7c3aed',
      icon: 'Bot',
      type: 'connector',
      created_at: new Date().toISOString(),
      is_default: true
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Messaging and notification services',
      color: '#dc2626',
      icon: 'MessageSquare',
      type: 'connector',
      created_at: new Date().toISOString(),
      is_default: true
    },
    {
      id: 'data-management',
      name: 'Data Management',
      description: 'Database and storage services',
      color: '#ea580c',
      icon: 'Database',
      type: 'connector',
      created_at: new Date().toISOString(),
      is_default: true
    }
  ];

  const availableIcons = [
    'Tag', 'Bot', 'Database', 'MessageSquare', 'Settings', 'Globe',
    'Shield', 'Zap', 'Heart', 'Star', 'Workflow', 'Building',
    'Users', 'Phone', 'FileText', 'CreditCard', 'Stethoscope'
  ];

  const availableColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  useEffect(() => {
    // Load saved categories from localStorage
    const saved = localStorage.getItem('custom_categories');
    if (saved) {
      try {
        const savedCategories = JSON.parse(saved);
        setCategories([...defaultCategories, ...savedCategories]);
      } catch (error) {
        console.error('Error loading saved categories:', error);
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
    }
  }, []);

  const saveCategories = (newCategories: CustomCategory[]) => {
    const customCategories = newCategories.filter(cat => !cat.is_default);
    localStorage.setItem('custom_categories', JSON.stringify(customCategories));
    setCategories(newCategories);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      icon: 'Tag',
      type: 'both'
    });
    setEditingCategory(null);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    // Check for duplicate names
    const existingNames = categories.map(cat => cat.name.toLowerCase());
    if (existingNames.includes(formData.name.toLowerCase())) {
      toast({
        title: 'Validation Error',
        description: 'A category with this name already exists',
        variant: 'destructive'
      });
      return;
    }

    const newCategory: CustomCategory = {
      id: `custom_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      type: formData.type,
      created_at: new Date().toISOString(),
      is_default: false
    };

    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
    
    onCategoryAdded?.(newCategory);
    
    toast({
      title: 'Success',
      description: `Category "${newCategory.name}" created successfully`
    });

    resetForm();
    setIsOpen(false);
  };

  const handleUpdate = () => {
    if (!editingCategory || !formData.name.trim()) return;

    // Check for duplicate names (excluding current category)
    const existingNames = categories
      .filter(cat => cat.id !== editingCategory.id)
      .map(cat => cat.name.toLowerCase());
    
    if (existingNames.includes(formData.name.toLowerCase())) {
      toast({
        title: 'Validation Error',
        description: 'A category with this name already exists',
        variant: 'destructive'
      });
      return;
    }

    const updatedCategory: CustomCategory = {
      ...editingCategory,
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      type: formData.type
    };

    const updatedCategories = categories.map(cat => 
      cat.id === editingCategory.id ? updatedCategory : cat
    );
    
    saveCategories(updatedCategories);
    onCategoryUpdated?.(updatedCategory);
    
    toast({
      title: 'Success',
      description: `Category "${updatedCategory.name}" updated successfully`
    });

    resetForm();
    setIsOpen(false);
  };

  const handleDelete = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (category.is_default) {
      toast({
        title: 'Cannot Delete',
        description: 'Default categories cannot be deleted',
        variant: 'destructive'
      });
      return;
    }

    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    saveCategories(updatedCategories);
    onCategoryDeleted?.(categoryId);
    
    toast({
      title: 'Success',
      description: `Category "${category.name}" deleted successfully`
    });
  };

  const handleEdit = (category: CustomCategory) => {
    if (category.is_default) {
      toast({
        title: 'Cannot Edit',
        description: 'Default categories cannot be edited',
        variant: 'destructive'
      });
      return;
    }

    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      type: category.type
    });
    setIsOpen(true);
  };

  const customCategories = categories.filter(cat => !cat.is_default);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Category Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage custom categories for better organization
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Modify the category details below'
                  : 'Add a custom category for organizing your agents and connectors'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input 
                  id="categoryName"
                  placeholder="e.g., Custom Healthcare APIs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea 
                  id="categoryDescription"
                  placeholder="Brief description of this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Agents & Connectors</SelectItem>
                      <SelectItem value="agent">Agents Only</SelectItem>
                      <SelectItem value="connector">Connectors Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-lg border-2 ${
                        formData.color === color ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={editingCategory ? handleUpdate : handleCreate}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Default Categories */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Default Categories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {defaultCategories.map(category => (
            <Card key={category.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium">{category.name}</h5>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Categories */}
      {customCategories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Custom Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customCategories.map(category => (
              <Card key={category.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-medium">{category.name}</h5>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {category.type === 'both' ? 'Agents & Connectors' : 
                           category.type === 'agent' ? 'Agents Only' : 'Connectors Only'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {customCategories.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No Custom Categories</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create custom categories to better organize your agents and connectors
            </p>
            <Button variant="outline" onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Category
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};