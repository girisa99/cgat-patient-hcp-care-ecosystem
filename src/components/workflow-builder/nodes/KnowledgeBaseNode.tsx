import React, { useState } from 'react';
import { BaseWorkflowNode } from './BaseWorkflowNode';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Database, Plus, X, Upload, FileText } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  type: 'document' | 'faq' | 'url' | 'text';
  content: string;
  tags: string[];
  enabled: boolean;
}

export const KnowledgeBaseNode: React.FC<{ id: string; data: any; selected: boolean }> = ({ id, data, selected }) => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(data.knowledge || [
    {
      id: '1',
      title: 'Product Documentation',
      type: 'document',
      content: 'Complete product documentation...',
      tags: ['product', 'docs'],
      enabled: true
    },
    {
      id: '2',
      title: 'Common FAQs',
      type: 'faq',
      content: 'Q: How to get started?\nA: Follow the onboarding guide...',
      tags: ['faq', 'support'],
      enabled: true
    }
  ]);
  const [isExpanded, setIsExpanded] = useState(false);

  const addKnowledgeItem = () => {
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title: 'New Knowledge Item',
      type: 'text',
      content: '',
      tags: [],
      enabled: true
    };
    setKnowledge([...knowledge, newItem]);
  };

  const updateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledge(knowledge.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteKnowledgeItem = (id: string) => {
    setKnowledge(knowledge.filter(item => item.id !== id));
  };

  const getTypeColor = (type: KnowledgeItem['type']) => {
    const colors = {
      document: 'bg-blue-100 text-blue-800',
      faq: 'bg-green-100 text-green-800',
      url: 'bg-purple-100 text-purple-800',
      text: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="h-3 w-3" />;
      case 'faq':
        return <Database className="h-3 w-3" />;
      case 'url':
        return <Upload className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <BaseWorkflowNode
      id={id}
      data={data}
      selected={selected}
      icon={Database}
      title="Knowledge Base"
      className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {knowledge.length} Item{knowledge.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs text-green-600">
              {knowledge.filter(k => k.enabled).length} Active
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? 'Collapse' : 'Manage'}
          </Button>
        </div>

        {!isExpanded && (
          <div className="space-y-1">
            {knowledge.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getTypeIcon(item.type)}
                  <span className="text-xs truncate">{item.title}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1 ${getTypeColor(item.type)}`}>
                  {item.type}
                </Badge>
              </div>
            ))}
            {knowledge.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{knowledge.length - 3} more items
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {knowledge.map((item) => (
              <div key={item.id} className="p-2 bg-white rounded border space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={item.title}
                    onChange={(e) => updateKnowledgeItem(item.id, { title: e.target.value })}
                    className="h-6 text-xs flex-1 mr-2"
                    placeholder="Knowledge item title"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteKnowledgeItem(item.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={item.type} onValueChange={(value: any) => updateKnowledgeItem(item.id, { type: value })}>
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Tags</Label>
                    <Input
                      value={item.tags.join(', ')}
                      onChange={(e) => updateKnowledgeItem(item.id, { 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      placeholder="tag1, tag2"
                      className="h-6 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Content</Label>
                  {item.type === 'url' ? (
                    <Input
                      value={item.content}
                      onChange={(e) => updateKnowledgeItem(item.id, { content: e.target.value })}
                      placeholder="https://example.com/knowledge"
                      className="h-6 text-xs"
                    />
                  ) : (
                    <Textarea
                      value={item.content}
                      onChange={(e) => updateKnowledgeItem(item.id, { content: e.target.value })}
                      className="min-h-[60px] text-xs"
                      placeholder={`Enter ${item.type} content...`}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => updateKnowledgeItem(item.id, { enabled: e.target.checked })}
                      className="w-3 h-3"
                    />
                    <Label className="text-xs">Enabled</Label>
                  </div>
                  <div className="flex gap-1">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={addKnowledgeItem}
              className="w-full h-8 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Knowledge Item
            </Button>
          </div>
        )}
      </div>
    </BaseWorkflowNode>
  );
};