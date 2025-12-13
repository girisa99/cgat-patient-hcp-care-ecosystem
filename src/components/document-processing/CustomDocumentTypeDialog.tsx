/**
 * Custom Document Type Creation Dialog
 * Allows users to add new document types dynamically
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, FileType, Tag } from 'lucide-react';
import { DocumentTypeConfig, DocumentField } from '@/config/documentTypes';

interface CustomDocumentTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (docType: DocumentTypeConfig) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'medical-imaging', label: 'Medical Imaging', icon: '🩻' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'identity', label: 'Identity Documents', icon: '🪪' },
  { value: 'business', label: 'Business', icon: '🏢' },
  { value: 'general', label: 'General', icon: '📄' },
];

const ICON_OPTIONS = ['📋', '📄', '📑', '📃', '🗂️', '📁', '📂', '🗃️', '💼', '📊', '📈', '🧾', '📝', '✉️', '📧'];

export default function CustomDocumentTypeDialog({
  open,
  onOpenChange,
  onSave,
}: CustomDocumentTypeDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentTypeConfig['category']>('general');
  const [icon, setIcon] = useState('📋');
  const [fields, setFields] = useState<DocumentField[]>([
    { key: 'field_1', label: 'Field 1', required: true }
  ]);
  const [subTypes, setSubTypes] = useState<string[]>([]);
  const [newSubType, setNewSubType] = useState('');

  const handleAddField = () => {
    const newKey = `field_${fields.length + 1}`;
    setFields([...fields, { key: newKey, label: `Field ${fields.length + 1}`, required: false }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index: number, updates: Partial<DocumentField>) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  };

  const handleAddSubType = () => {
    if (newSubType.trim() && !subTypes.includes(newSubType.trim())) {
      setSubTypes([...subTypes, newSubType.trim()]);
      setNewSubType('');
    }
  };

  const handleRemoveSubType = (subType: string) => {
    setSubTypes(subTypes.filter(s => s !== subType));
  };

  const generateId = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newDocType: DocumentTypeConfig = {
      id: `custom-${generateId(title)}`,
      title: title.trim(),
      icon,
      description: description.trim() || `Custom document type: ${title}`,
      color: 'bg-slate-500',
      category,
      targetFields: fields.filter(f => f.label.trim()),
      subTypes: subTypes.length > 0 ? subTypes : [title.trim()],
      specialTab: {
        id: `${generateId(title)}-details`,
        label: `${title} Details`,
        icon
      }
    };

    onSave(newDocType);
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('general');
    setIcon('📋');
    setFields([{ key: 'field_1', label: 'Field 1', required: true }]);
    setSubTypes([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5" />
            Create Custom Document Type
          </DialogTitle>
          <DialogDescription>
            Define a new document type with custom fields and categories. The system will automatically create extraction rules.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Type Name *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Medical Records"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DocumentTypeConfig['category'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span>{opt.icon}</span>
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this document type..."
              rows={2}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(ico => (
                <Button
                  key={ico}
                  type="button"
                  variant={icon === ico ? 'default' : 'outline'}
                  size="sm"
                  className="w-10 h-10 text-lg"
                  onClick={() => setIcon(ico)}
                >
                  {ico}
                </Button>
              ))}
            </div>
          </div>

          {/* Target Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Extraction Fields</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddField}>
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                  <Input
                    value={field.label}
                    onChange={(e) => handleUpdateField(index, { 
                      label: e.target.value,
                      key: e.target.value.toLowerCase().replace(/\s+/g, '_')
                    })}
                    placeholder="Field name"
                    className="flex-1 h-8"
                  />
                  <Select 
                    value={field.type || 'text'} 
                    onValueChange={(v) => handleUpdateField(index, { type: v as DocumentField['type'] })}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="currency">Currency</SelectItem>
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  {fields.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveField(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Types */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Document Variations
            </Label>
            <div className="flex gap-2">
              <Input
                value={newSubType}
                onChange={(e) => setNewSubType(e.target.value)}
                placeholder="e.g., Signed Copy, Draft, Final"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubType())}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddSubType}>
                Add
              </Button>
            </div>
            {subTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {subTypes.map(st => (
                  <Badge key={st} variant="secondary" className="flex items-center gap-1">
                    {st}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveSubType(st)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Document Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
