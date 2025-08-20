import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, Zap, Calculator, Database, Globe, Code, 
  Search, Plus, Star, Download, Book, Settings,
  Filter, Tag, Clock, TrendingUp, Shield, Workflow,
  Edit, Trash2, Eye, Save, X, Check
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useMasterToast } from '@/hooks/useMasterToast';

interface Library {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'utility' | 'ai' | 'data' | 'api' | 'ui' | 'security';
  rating: number;
  downloads: number;
  author: string;
  tags: string[];
  documentation: string;
  examples: any[];
  isInstalled: boolean;
  isCore: boolean;
}

interface DefaultAction {
  id: string;
  name: string;
  description: string;
  type: 'transform' | 'validate' | 'calculate' | 'request' | 'condition' | 'loop';
  category: string;
  inputs: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  code: string;
  isCustom: boolean;
  usage: number;
}

interface Operator {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: 'arithmetic' | 'comparison' | 'logical' | 'string' | 'array' | 'object';
  syntax: string;
  examples: string[];
}

interface CreateLibraryForm {
  name: string;
  description: string;
  version: string;
  category: string;
  author: string;
  tags: string;
  documentation: string;
}

interface CreateActionForm {
  name: string;
  description: string;
  type: string;
  category: string;
  code: string;
}

export const LibrariesAndActions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('libraries');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [actions, setActions] = useState<DefaultAction[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [createForm, setCreateForm] = useState<CreateLibraryForm>({
    name: '',
    description: '',
    version: '1.0.0',
    category: 'utility',
    author: '',
    tags: '',
    documentation: ''
  });
  const [createActionForm, setCreateActionForm] = useState<CreateActionForm>({
    name: '',
    description: '',
    type: 'transform',
    category: 'Custom',
    code: ''
  });
  const { showSuccess, showError } = useMasterToast();

  // Initialize with mock data
  useEffect(() => {
    setLibraries([
      {
        id: '1',
        name: 'Healthcare Utilities',
        description: 'Essential utilities for healthcare workflow automation',
        version: '2.1.0',
        category: 'utility',
        rating: 4.8,
        downloads: 12500,
        author: 'HealthTech Inc',
        tags: ['healthcare', 'validation', 'conversion'],
        documentation: 'https://docs.healthtech.com',
        examples: [],
        isInstalled: true,
        isCore: true
      },
      {
        id: '2',
        name: 'AI Model Connectors',
        description: 'Connect to various AI models and services',
        version: '1.5.2',
        category: 'ai',
        rating: 4.6,
        downloads: 8900,
        author: 'AI Solutions',
        tags: ['ai', 'llm', 'integration'],
        documentation: 'https://docs.ai-solutions.com',
        examples: [],
        isInstalled: false,
        isCore: false
      },
      {
        id: '3',
        name: 'Data Transformation Suite',
        description: 'Comprehensive data transformation and validation tools',
        version: '3.0.1',
        category: 'data',
        rating: 4.9,
        downloads: 15600,
        author: 'DataFlow Corp',
        tags: ['data', 'etl', 'validation'],
        documentation: 'https://docs.dataflow.com',
        examples: [],
        isInstalled: true,
        isCore: false
      }
    ]);

    setActions([
      {
        id: '1',
        name: 'Format Patient ID',
        description: 'Standardize patient ID format across systems',
        type: 'transform',
        category: 'Healthcare',
        inputs: [
          { name: 'patientId', type: 'string', required: true, description: 'Raw patient ID' },
          { name: 'format', type: 'string', required: false, description: 'Target format pattern' }
        ],
        outputs: [
          { name: 'formattedId', type: 'string', description: 'Standardized patient ID' }
        ],
        code: `function formatPatientId(patientId, format = 'PAT-{id}') {
  const cleanId = patientId.replace(/[^0-9]/g, '');
  return format.replace('{id}', cleanId.padStart(6, '0'));
}`,
        isCustom: false,
        usage: 450
      },
      {
        id: '2',
        name: 'Validate Email',
        description: 'Validate email address format and domain',
        type: 'validate',
        category: 'Validation',
        inputs: [
          { name: 'email', type: 'string', required: true, description: 'Email address to validate' }
        ],
        outputs: [
          { name: 'isValid', type: 'boolean', description: 'Validation result' },
          { name: 'errors', type: 'array', description: 'List of validation errors' }
        ],
        code: `function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const errors = [];
  
  if (!isValid) {
    errors.push('Invalid email format');
  }
  
  return { isValid, errors };
}`,
        isCustom: false,
        usage: 890
      }
    ]);

    setOperators([
      {
        id: '1',
        name: 'Equals',
        symbol: '==',
        description: 'Compare two values for equality',
        category: 'comparison',
        syntax: 'value1 == value2',
        examples: ['age == 25', 'status == "active"']
      },
      {
        id: '2',
        name: 'Greater Than',
        symbol: '>',
        description: 'Check if first value is greater than second',
        category: 'comparison',
        syntax: 'value1 > value2',
        examples: ['score > 80', 'temperature > 98.6']
      }
    ]);
  }, []);

  // CRUD Operations for Libraries
  const createLibrary = () => {
    if (!createForm.name.trim()) {
      showError('Library name is required');
      return;
    }

    const newLibrary: Library = {
      id: Date.now().toString(),
      name: createForm.name,
      description: createForm.description,
      version: createForm.version,
      category: createForm.category as any,
      rating: 0,
      downloads: 0,
      author: createForm.author,
      tags: createForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      documentation: createForm.documentation,
      examples: [],
      isInstalled: false,
      isCore: false
    };

    setLibraries(prev => [...prev, newLibrary]);
    setCreateForm({
      name: '',
      description: '',
      version: '1.0.0',
      category: 'utility',
      author: '',
      tags: '',
      documentation: ''
    });
    setIsCreateDialogOpen(false);
    showSuccess('Library created successfully');
  };

  const updateLibrary = (id: string, updates: Partial<Library>) => {
    setLibraries(prev => prev.map(lib => lib.id === id ? { ...lib, ...updates } : lib));
    showSuccess('Library updated successfully');
  };

  const deleteLibrary = (id: string) => {
    setLibraries(prev => prev.filter(lib => lib.id !== id));
    showSuccess('Library deleted successfully');
  };

  const installLibrary = (id: string) => {
    updateLibrary(id, { isInstalled: true });
    showSuccess('Library installed successfully');
  };

  const uninstallLibrary = (id: string) => {
    updateLibrary(id, { isInstalled: false });
    showSuccess('Library uninstalled successfully');
  };

  // CRUD Operations for Actions
  const createAction = () => {
    if (!createActionForm.name.trim()) {
      showError('Action name is required');
      return;
    }

    const newAction: DefaultAction = {
      id: Date.now().toString(),
      name: createActionForm.name,
      description: createActionForm.description,
      type: createActionForm.type as any,
      category: createActionForm.category,
      inputs: [],
      outputs: [],
      code: createActionForm.code,
      isCustom: true,
      usage: 0
    };

    setActions(prev => [...prev, newAction]);
    setCreateActionForm({
      name: '',
      description: '',
      type: 'transform',
      category: 'Custom',
      code: ''
    });
    setIsCreateDialogOpen(false);
    showSuccess('Action created successfully');
  };

  const updateAction = (id: string, updates: Partial<DefaultAction>) => {
    setActions(prev => prev.map(action => action.id === id ? { ...action, ...updates } : action));
    showSuccess('Action updated successfully');
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(action => action.id !== id));
    showSuccess('Action deleted successfully');
  };

  const useAction = (action: DefaultAction) => {
    updateAction(action.id, { usage: action.usage + 1 });
    showSuccess(`Added "${action.name}" to workflow`);
  };

  // Filter functions
  const filteredLibraries = libraries.filter(lib => {
    const matchesSearch = lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lib.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lib.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOperators = operators.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         op.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || op.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const LibraryCard = ({ library }: { library: Library }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Package className="h-4 w-4 text-primary flex-shrink-0" />
              <h4 className="font-medium text-sm truncate">{library.name}</h4>
              {library.isCore && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">Core</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => window.open(library.documentation, '_blank')}
              >
                <Book className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setEditingItem(library)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              {!library.isCore && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => deleteLibrary(library.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {library.description}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              v{library.version}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{library.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{library.downloads.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {library.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">
              by {library.author}
            </span>
            {library.isInstalled ? (
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={() => uninstallLibrary(library.id)}
              >
                Uninstall
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                className="h-6 px-2 text-xs"
                onClick={() => installLibrary(library.id)}
              >
                Install
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ action }: { action: DefaultAction }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              <h4 className="font-medium text-sm truncate">{action.name}</h4>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {action.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setEditingItem(action)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setEditingItem(action)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              {action.isCustom && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => deleteAction(action.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {action.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Inputs: {action.inputs.length}</span>
            <span>Outputs: {action.outputs.length}</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{action.usage} uses</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {action.category}
            </Badge>
            <Button
              size="sm"
              variant="default"
              className="h-6 px-2 text-xs"
              onClick={() => useAction(action)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OperatorCard = ({ operator }: { operator: Operator }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Calculator className="h-4 w-4 text-primary flex-shrink-0" />
              <h4 className="font-medium text-sm truncate">{operator.name}</h4>
              <Badge variant="outline" className="text-xs font-mono flex-shrink-0">
                {operator.symbol}
              </Badge>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {operator.description}
          </p>
          
          <div className="bg-muted p-2 rounded text-xs font-mono">
            {operator.syntax}
          </div>
          
          <div className="space-y-1">
            {operator.examples.slice(0, 2).map((example, index) => (
              <div key={index} className="text-xs text-muted-foreground font-mono bg-muted/50 p-1 rounded">
                {example}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {operator.category}
            </Badge>
            <Button size="sm" variant="default" className="h-6 px-2 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Create Custom {activeTab === 'libraries' ? 'Library' : 'Action'}
          </DialogTitle>
        </DialogHeader>
        
        {activeTab === 'libraries' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Library name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this library do?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={createForm.version}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={createForm.category}
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="ai">AI & ML</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={createForm.author}
                onChange={(e) => setCreateForm(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Your name or organization"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={createForm.tags}
                onChange={(e) => setCreateForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="healthcare, validation, utility"
              />
            </div>
            <div>
              <Label htmlFor="documentation">Documentation URL</Label>
              <Input
                id="documentation"
                value={createForm.documentation}
                onChange={(e) => setCreateForm(prev => ({ ...prev, documentation: e.target.value }))}
                placeholder="https://docs.example.com"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-name">Name</Label>
              <Input
                id="action-name"
                value={createActionForm.name}
                onChange={(e) => setCreateActionForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Action name"
              />
            </div>
            <div>
              <Label htmlFor="action-description">Description</Label>
              <Textarea
                id="action-description"
                value={createActionForm.description}
                onChange={(e) => setCreateActionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this action do?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="action-type">Type</Label>
                <Select
                  value={createActionForm.type}
                  onValueChange={(value) => setCreateActionForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transform">Transform</SelectItem>
                    <SelectItem value="validate">Validate</SelectItem>
                    <SelectItem value="calculate">Calculate</SelectItem>
                    <SelectItem value="request">Request</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                    <SelectItem value="loop">Loop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action-category">Category</Label>
                <Input
                  id="action-category"
                  value={createActionForm.category}
                  onChange={(e) => setCreateActionForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Custom"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="action-code">Code</Label>
              <Textarea
                id="action-code"
                value={createActionForm.code}
                onChange={(e) => setCreateActionForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="function myAction(input) {&#10;  // Your code here&#10;  return output;&#10;}"
                rows={6}
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={activeTab === 'libraries' ? createLibrary : createAction}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Libraries & Actions
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Create Custom
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search libraries, actions, operators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="ai">AI & ML</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="api">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 h-8 mx-4 mb-2">
            <TabsTrigger value="libraries" className="text-xs">Libraries</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
            <TabsTrigger value="operators" className="text-xs">Operators</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-4">
              <TabsContent value="libraries" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Available Libraries</h4>
                  <Badge variant="secondary" className="text-xs">
                    {filteredLibraries.length} libraries
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {filteredLibraries.map((library) => (
                    <LibraryCard key={library.id} library={library} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Default Actions</h4>
                  <Badge variant="secondary" className="text-xs">
                    {filteredActions.length} actions
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {filteredActions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="operators" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Available Operators</h4>
                  <Badge variant="secondary" className="text-xs">
                    {filteredOperators.length} operators
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {filteredOperators.map((operator) => (
                    <OperatorCard key={operator.id} operator={operator} />
                  ))}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>

      <CreateDialog />
    </Card>
  );
};