import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Plus, Database, Bot, Link, Zap, 
  Upload, Download, Edit, Trash2, Settings,
  Library, Brain, Code, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssetItem {
  id: string;
  name: string;
  type: 'ai_model' | 'connector' | 'api' | 'library' | 'action' | 'template';
  description: string;
  category: string;
  scope: string;
  classification?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

interface AssetLibraryManagerProps {
  onAssetSelect?: (assets: AssetItem[]) => void;
  selectedAssets?: AssetItem[];
  mode?: 'select' | 'manage';
  contextFilter?: {
    domain?: string;
    nodeType?: string;
    relevantAssets?: any[];
  };
}

export const AssetLibraryManager: React.FC<AssetLibraryManagerProps> = ({
  onAssetSelect,
  selectedAssets = [],
  mode = 'select'
}) => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  const mockAssets: AssetItem[] = [
    {
      id: '1',
      name: 'GPT-4 Turbo',
      type: 'ai_model',
      description: 'Advanced language model for complex reasoning and analysis',
      category: 'Language Model',
      scope: 'Healthcare AI processing and customer interaction',
      classification: 'Core AI Model',
      isActive: true,
      metadata: {
        provider: 'OpenAI',
        maxTokens: 128000,
        capabilities: ['text', 'reasoning', 'analysis']
      },
      createdAt: '2024-01-15',
      createdBy: 'system'
    },
    {
      id: '2',
      name: 'Salesforce CRM Connector',
      type: 'connector',
      description: 'Connect to Salesforce CRM for customer data access',
      category: 'CRM Integration',
      scope: 'Customer data synchronization and management',
      classification: 'Data Integration',
      isActive: true,
      metadata: {
        apiVersion: 'v58.0',
        supportedObjects: ['Contact', 'Account', 'Lead', 'Case'],
        authentication: 'OAuth 2.0'
      },
      createdAt: '2024-01-20',
      createdBy: 'admin'
    },
    {
      id: '3',
      name: 'Healthcare Knowledge Base',
      type: 'library',
      description: 'Comprehensive medical and healthcare information repository',
      category: 'Knowledge Base',
      scope: 'Medical information and treatment guidelines',
      classification: 'Healthcare Domain',
      isActive: true,
      metadata: {
        documentCount: 15420,
        categories: ['Treatment', 'Diagnosis', 'Procedures', 'Medications'],
        lastUpdated: '2024-01-25'
      },
      createdAt: '2024-01-10',
      createdBy: 'medical_team'
    },
    {
      id: '4',
      name: 'Patient Appointment Scheduler',
      type: 'action',
      description: 'Schedule, reschedule, and cancel patient appointments',
      category: 'Appointment Management',
      scope: 'Patient scheduling and calendar management',
      classification: 'Core Action',
      isActive: true,
      metadata: {
        permissions: ['schedule', 'modify', 'cancel'],
        integration: 'EMR System',
        workflowSteps: 3
      },
      createdAt: '2024-01-18',
      createdBy: 'workflow_team'
    },
    {
      id: '5',
      name: 'FHIR API Gateway',
      type: 'api',
      description: 'Healthcare data exchange using FHIR standards',
      category: 'Healthcare API',
      scope: 'Medical data interoperability and exchange',
      classification: 'Healthcare Standard',
      isActive: true,
      metadata: {
        version: 'R4',
        endpoints: 12,
        securityLevel: 'HIPAA Compliant'
      },
      createdAt: '2024-01-22',
      createdBy: 'integration_team'
    }
  ];

  useEffect(() => {
    // Initialize with mock data - replace with API call
    setAssets(mockAssets);
    setFilteredAssets(mockAssets);
  }, []);

  useEffect(() => {
    // Filter assets based on search and filters
    let filtered = assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesType = selectedType === 'all' || asset.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType && asset.isActive;
    });
    
    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedCategory, selectedType]);

  const getAssetIcon = (type: AssetItem['type']) => {
    switch (type) {
      case 'ai_model': return <Brain className="h-4 w-4" />;
      case 'connector': return <Link className="h-4 w-4" />;
      case 'api': return <Code className="h-4 w-4" />;
      case 'library': return <Library className="h-4 w-4" />;
      case 'action': return <Zap className="h-4 w-4" />;
      case 'template': return <Settings className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getAssetTypeColor = (type: AssetItem['type']) => {
    switch (type) {
      case 'ai_model': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'connector': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'api': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'library': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'action': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'template': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleAssetToggle = (assetId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedItems(newSelected);
    
    if (onAssetSelect) {
      const selectedAssetsList = assets.filter(asset => newSelected.has(asset.id));
      onAssetSelect(selectedAssetsList);
    }
  };

  const handleCreateAsset = async (assetData: Partial<AssetItem>) => {
    try {
      // Mock API call - replace with actual implementation
      const newAsset: AssetItem = {
        id: Date.now().toString(),
        name: assetData.name || '',
        type: assetData.type || 'library',
        description: assetData.description || '',
        category: assetData.category || '',
        scope: assetData.scope || '',
        classification: assetData.classification,
        isActive: true,
        metadata: assetData.metadata || {},
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'current_user'
      };
      
      setAssets(prev => [...prev, newAsset]);
      setShowCreateDialog(false);
      toast({
        title: "Asset Created",
        description: `${newAsset.name} has been successfully created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create asset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = [...new Set(assets.map(asset => asset.category))];
  const types = [...new Set(assets.map(asset => asset.type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Library</h2>
          <p className="text-muted-foreground">
            Manage AI models, connectors, APIs, libraries, and actions
          </p>
        </div>
        {mode === 'manage' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Asset</DialogTitle>
              </DialogHeader>
              <CreateAssetForm onSubmit={handleCreateAsset} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getAssetIcon(asset.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{asset.name}</h3>
                    <Badge variant="secondary" className={`text-xs ${getAssetTypeColor(asset.type)}`}>
                      {asset.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {mode === 'select' && (
                  <Checkbox
                    checked={selectedItems.has(asset.id)}
                    onCheckedChange={() => handleAssetToggle(asset.id)}
                  />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {asset.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{asset.category}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Scope:</span>
                  <span className="font-medium truncate ml-2">{asset.scope}</span>
                </div>
                
                {asset.classification && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Classification:</span>
                    <span className="font-medium">{asset.classification}</span>
                  </div>
                )}
              </div>

              {mode === 'manage' && (
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => setEditingAsset(asset)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
            <p className="text-muted-foreground">
              No assets match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface CreateAssetFormProps {
  initialData?: Partial<AssetItem>;
  onSubmit: (data: Partial<AssetItem>) => void;
}

const CreateAssetForm: React.FC<CreateAssetFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<AssetItem>>(initialData || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as AssetItem['type'] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai_model">AI Model</SelectItem>
              <SelectItem value="connector">Connector</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="template">Template</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="classification">Classification</Label>
          <Input
            id="classification"
            value={formData.classification || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope">Scope</Label>
        <Textarea
          id="scope"
          value={formData.scope || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
          placeholder="Describe the scope and intended use of this asset"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Create Asset
        </Button>
      </div>
    </form>
  );
};