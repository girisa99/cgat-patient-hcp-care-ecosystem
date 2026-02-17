import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMasterToast } from '@/hooks/useMasterToast';
import {
  FileText,
  Image,
  MessageSquare,
  Tag,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Download,
  Upload,
  Settings
} from 'lucide-react';

interface LabelTemplate {
  id: string;
  name: string;
  category: 'text' | 'image' | 'audio' | 'video' | 'medical' | 'custom';
  description: string;
  config: any;
  labels: string[];
  useCase: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  createdAt: string;
  lastUsed: string;
}

interface LSCustomTemplatesProps {
  projectId?: number;
  onTemplateSelect?: (template: LabelTemplate) => void;
}

export const LSCustomTemplates: React.FC<LSCustomTemplatesProps> = ({
  projectId,
  onTemplateSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);

  const { showSuccess, showError, showInfo } = useMasterToast();

  // Predefined templates for different use cases
  const templates: LabelTemplate[] = useMemo(() => [
    {
      id: 'text-sentiment',
      name: 'Sentiment Analysis',
      category: 'text',
      description: 'Classify text sentiment as positive, negative, or neutral',
      config: {
        type: 'Text',
        view: {
          type: 'Text',
          value: 'text'
        },
        labels: [
          { value: 'positive', background: 'green' },
          { value: 'negative', background: 'red' },
          { value: 'neutral', background: 'gray' }
        ]
      },
      labels: ['positive', 'negative', 'neutral'],
      useCase: 'Social media monitoring, product reviews, customer feedback',
      complexity: 'basic',
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20'
    },
    {
      id: 'image-object-detection',
      name: 'Object Detection',
      category: 'image',
      description: 'Detect and classify objects in images with bounding boxes',
      config: {
        type: 'Image',
        view: {
          type: 'Image',
          value: 'image'
        },
        regions: [
          {
            type: 'RectangleLabels',
            image: 'image',
            labels: ['person', 'car', 'building', 'tree', 'animal']
          }
        ]
      },
      labels: ['person', 'car', 'building', 'tree', 'animal'],
      useCase: 'Autonomous driving, security surveillance, inventory management',
      complexity: 'intermediate',
      createdAt: '2024-01-10',
      lastUsed: '2024-01-22'
    },
    {
      id: 'medical-xray',
      name: 'Medical X-Ray Analysis',
      category: 'medical',
      description: 'Analyze medical X-ray images for anomaly detection',
      config: {
        type: 'Image',
        view: {
          type: 'Image',
          value: 'image'
        },
        regions: [
          {
            type: 'RectangleLabels',
            image: 'image',
            labels: ['normal', 'fracture', 'pneumonia', 'tumor', 'other_abnormality']
          }
        ],
        choices: [
          {
            type: 'Choices',
            choice: 'single',
            labels: ['urgent', 'routine', 'follow_up']
          }
        ]
      },
      labels: ['normal', 'fracture', 'pneumonia', 'tumor', 'other_abnormality', 'urgent', 'routine', 'follow_up'],
      useCase: 'Medical diagnosis, radiologist assistance, healthcare automation',
      complexity: 'advanced',
      createdAt: '2024-01-08',
      lastUsed: '2024-01-21'
    },
    {
      id: 'text-ner',
      name: 'Named Entity Recognition',
      category: 'text',
      description: 'Extract and classify named entities from text',
      config: {
        type: 'Text',
        view: {
          type: 'Text',
          value: 'text'
        },
        labels: [
          { value: 'PERSON', background: 'blue' },
          { value: 'ORG', background: 'green' },
          { value: 'LOC', background: 'red' },
          { value: 'DATE', background: 'purple' },
          { value: 'MONEY', background: 'orange' }
        ]
      },
      labels: ['PERSON', 'ORG', 'LOC', 'DATE', 'MONEY'],
      useCase: 'Information extraction, document processing, knowledge graphs',
      complexity: 'intermediate',
      createdAt: '2024-01-12',
      lastUsed: '2024-01-19'
    },
    {
      id: 'audio-classification',
      name: 'Audio Classification',
      category: 'audio',
      description: 'Classify audio recordings by type or content',
      config: {
        type: 'Audio',
        view: {
          type: 'Audio',
          value: 'audio'
        },
        labels: ['speech', 'music', 'noise', 'silence', 'environmental']
      },
      labels: ['speech', 'music', 'noise', 'silence', 'environmental'],
      useCase: 'Voice assistants, content moderation, acoustic monitoring',
      complexity: 'basic',
      createdAt: '2024-01-14',
      lastUsed: '2024-01-18'
    },
    {
      id: 'healthcare-patient-intake',
      name: 'Patient Intake Form Analysis',
      category: 'medical',
      description: 'Extract structured data from patient intake forms',
      config: {
        type: 'Text',
        view: {
          type: 'Text',
          value: 'text'
        },
        labels: [
          { value: 'patient_name', background: 'blue' },
          { value: 'date_of_birth', background: 'green' },
          { value: 'medical_condition', background: 'red' },
          { value: 'medication', background: 'purple' },
          { value: 'allergy', background: 'orange' },
          { value: 'emergency_contact', background: 'teal' }
        ]
      },
      labels: ['patient_name', 'date_of_birth', 'medical_condition', 'medication', 'allergy', 'emergency_contact'],
      useCase: 'Healthcare data extraction, EMR automation, compliance documentation',
      complexity: 'advanced',
      createdAt: '2024-01-11',
      lastUsed: '2024-01-23'
    }
  ], []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.useCase.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchTerm]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <MessageSquare className="h-4 w-4" />;
      case 'video': return <MessageSquare className="h-4 w-4" />;
      case 'medical': return <Tag className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUseTemplate = (template: LabelTemplate) => {
    onTemplateSelect?.(template);
    showSuccess(`Template "${template.name}" applied successfully`);
  };

  const handleCopyTemplate = async (template: LabelTemplate) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(template.config, null, 2));
      showSuccess('Template configuration copied to clipboard');
    } catch (error) {
      showError('Failed to copy template configuration');
    }
  };

  const handleExportTemplate = (template: LabelTemplate) => {
    const exportData = {
      ...template,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Label Studio Template Manager'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `label-studio-template-${template.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess('Template exported successfully');
  };

  const handleDeleteTemplate = (templateId: string) => {
    // In a real implementation, this would delete from a database
    showInfo(`Template ${templateId} would be deleted`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Label Templates</h2>
          <p className="text-muted-foreground">
            Pre-configured templates for common annotation tasks
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Template</DialogTitle>
              <DialogDescription>
                Design a new labeling template for your specific use case
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input id="template-name" placeholder="My Custom Template" />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <select className="w-full p-2 border rounded">
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="medical">Medical</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea id="template-description" placeholder="Describe your template..." />
              </div>
              <div>
                <Label htmlFor="template-config">Label Studio Configuration (XML/JSON)</Label>
                <Textarea 
                  id="template-config" 
                  className="h-40 font-mono text-sm"
                  placeholder={`<View>
  <Text name="text" value="$text"/>
  <Choices name="sentiment" toName="text">
    <Choice value="positive"/>
    <Choice value="negative"/>
    <Choice value="neutral"/>
  </Choices>
</View>`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setIsCreating(false);
                showSuccess('Template created successfully');
              }}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search templates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge className={getComplexityColor(template.complexity)}>
                  {template.complexity}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Labels Preview */}
              <div>
                <p className="text-sm font-medium mb-2">Labels:</p>
                <div className="flex flex-wrap gap-1">
                  {template.labels.slice(0, 4).map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  {template.labels.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.labels.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Use Case */}
              <div>
                <p className="text-sm font-medium mb-1">Use Case:</p>
                <p className="text-xs text-muted-foreground">{template.useCase}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCopyTemplate(template)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleExportTemplate(template)}>
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No templates found</p>
            <p className="text-muted-foreground">
              Try adjusting your search or create a new template
            </p>
          </CardContent>
        </Card>
      )}

      {/* Template Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Used Category</p>
                <p className="text-lg font-bold capitalize">Medical</p>
              </div>
              <Tag className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custom Templates</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Usage</p>
                <p className="text-lg font-bold">Today</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};