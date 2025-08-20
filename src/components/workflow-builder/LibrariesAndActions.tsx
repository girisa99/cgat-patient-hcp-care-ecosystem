import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, Zap, Calculator, Database, Globe, Code, 
  Search, Plus, Star, Download, Book, Settings,
  Filter, Tag, Clock, TrendingUp, Shield, Workflow,
  Edit, Trash2, Eye, Save, X, Check, Loader2, RefreshCw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useWorkflowResources, WorkflowLibrary, WorkflowAction, WorkflowOperator } from '@/hooks/useWorkflowResources';

interface CreateLibraryForm {
  name: string;
  description: string;
  version: string;
  category: string;
  author: string;
  tags: string;
  documentation_url: string;
}

interface CreateActionForm {
  name: string;
  description: string;
  type: string;
  category: string;
  code: string;
}

interface CreateOperatorForm {
  name: string;
  symbol: string;
  description: string;
  category: string;
  syntax: string;
  examples: string;
}

export const LibrariesAndActions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('libraries');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [createForm, setCreateForm] = useState<CreateLibraryForm>({
    name: '',
    description: '',
    version: '1.0.0',
    category: 'utility',
    author: '',
    tags: '',
    documentation_url: ''
  });
  const [createActionForm, setCreateActionForm] = useState<CreateActionForm>({
    name: '',
    description: '',
    type: 'transform',
    category: 'Custom',
    code: ''
  });
  const [createOperatorForm, setCreateOperatorForm] = useState<CreateOperatorForm>({
    name: '',
    symbol: '',
    description: '',
    category: 'logical',
    syntax: '',
    examples: ''
  });

  const {
    libraries,
    actions,
    operators,
    isLoading,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    toggleInstallLibrary,
    createAction,
    updateAction,
    deleteAction,
    useAction,
    createOperator,
    isCreatingLibrary,
    isCreatingAction,
    isCreatingOperator,
    isTogglingInstall,
    isUsingAction
  } = useWorkflowResources({ 
    category: selectedCategory, 
    search: searchQuery 
  });

  // Handle Library CRUD
  const handleCreateLibrary = () => {
    if (!createForm.name.trim()) return;
    
    createLibrary({
      name: createForm.name,
      description: createForm.description,
      version: createForm.version,
      category: createForm.category as any,
      author: createForm.author,
      tags: createForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      documentation_url: createForm.documentation_url,
      is_custom: true
    });

    setCreateForm({
      name: '',
      description: '',
      version: '1.0.0',
      category: 'utility',
      author: '',
      tags: '',
      documentation_url: ''
    });
    setIsCreateDialogOpen(false);
  };

  const handleInstallLibrary = (library: WorkflowLibrary) => {
    toggleInstallLibrary({
      libraryId: library.id,
      install: !library.is_installed
    });
  };

  // Handle Action CRUD
  const handleCreateAction = () => {
    if (!createActionForm.name.trim()) return;
    
    createAction({
      name: createActionForm.name,
      description: createActionForm.description,
      type: createActionForm.type as any,
      category: createActionForm.category,
      code: createActionForm.code,
      inputs: [],
      outputs: [],
      is_custom: true
    });

    setCreateActionForm({
      name: '',
      description: '',
      type: 'transform',
      category: 'Custom',
      code: ''
    });
    setIsCreateDialogOpen(false);
  };

  const handleUseAction = (action: WorkflowAction) => {
    useAction(action.id);
  };

  // Handle Operator CRUD
  const handleCreateOperator = () => {
    if (!createOperatorForm.name.trim()) return;
    
    createOperator({
      name: createOperatorForm.name,
      symbol: createOperatorForm.symbol,
      description: createOperatorForm.description,
      category: createOperatorForm.category as any,
      syntax: createOperatorForm.syntax,
      examples: createOperatorForm.examples.split(',').map(ex => ex.trim()).filter(Boolean)
    });

    setCreateOperatorForm({
      name: '',
      symbol: '',
      description: '',
      category: 'logical',
      syntax: '',
      examples: ''
    });
    setIsCreateDialogOpen(false);
  };

  const LibraryCard = ({ library }: { library: WorkflowLibrary }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Package className="h-4 w-4 text-primary flex-shrink-0" />
              <h4 className="font-medium text-sm truncate">{library.name}</h4>
              {library.is_core && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">Core</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => window.open(library.documentation_url, '_blank')}
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
              {library.is_custom && (
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
            <Button
              size="sm"
              variant={library.is_installed ? "outline" : "default"}
              className="h-6 px-2 text-xs"
              onClick={() => handleInstallLibrary(library)}
              disabled={isTogglingInstall}
            >
              {isTogglingInstall ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : library.is_installed ? (
                "Uninstall"
              ) : (
                "Install"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ action }: { action: WorkflowAction }) => (
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
              {action.is_custom && (
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
            <span>Inputs: {action.inputs?.length || 0}</span>
            <span>Outputs: {action.outputs?.length || 0}</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{action.usage_count} uses</span>
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
              onClick={() => handleUseAction(action)}
              disabled={isUsingAction}
            >
              {isUsingAction ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Use
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OperatorCard = ({ operator }: { operator: WorkflowOperator }) => (
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{operator.usage_count} uses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create Custom {
              activeTab === 'libraries' ? 'Library' : 
              activeTab === 'actions' ? 'Action' : 'Operator'
            }
          </DialogTitle>
        </DialogHeader>
        
        {activeTab === 'libraries' && (
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
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
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
              <Label htmlFor="documentation_url">Documentation URL</Label>
              <Input
                id="documentation_url"
                value={createForm.documentation_url}
                onChange={(e) => setCreateForm(prev => ({ ...prev, documentation_url: e.target.value }))}
                placeholder="https://docs.example.com"
              />
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
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
                    <SelectItem value="trigger">Trigger</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
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

        {activeTab === 'operators' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="operator-name">Name</Label>
              <Input
                id="operator-name"
                value={createOperatorForm.name}
                onChange={(e) => setCreateOperatorForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Operator name"
              />
            </div>
            <div>
              <Label htmlFor="operator-symbol">Symbol</Label>
              <Input
                id="operator-symbol"
                value={createOperatorForm.symbol}
                onChange={(e) => setCreateOperatorForm(prev => ({ ...prev, symbol: e.target.value }))}
                placeholder="e.g., ==, >, <"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="operator-description">Description</Label>
              <Textarea
                id="operator-description"
                value={createOperatorForm.description}
                onChange={(e) => setCreateOperatorForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this operator do?"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="operator-category">Category</Label>
              <Select
                value={createOperatorForm.category}
                onValueChange={(value) => setCreateOperatorForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arithmetic">Arithmetic</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="logical">Logical</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operator-syntax">Syntax</Label>
              <Input
                id="operator-syntax"
                value={createOperatorForm.syntax}
                onChange={(e) => setCreateOperatorForm(prev => ({ ...prev, syntax: e.target.value }))}
                placeholder="value1 operator value2"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="operator-examples">Examples (comma-separated)</Label>
              <Textarea
                id="operator-examples"
                value={createOperatorForm.examples}
                onChange={(e) => setCreateOperatorForm(prev => ({ ...prev, examples: e.target.value }))}
                placeholder="age > 18, score >= 80"
                rows={2}
                className="font-mono"
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={
              activeTab === 'libraries' ? handleCreateLibrary :
              activeTab === 'actions' ? handleCreateAction : 
              handleCreateOperator
            }
            disabled={
              activeTab === 'libraries' ? isCreatingLibrary :
              activeTab === 'actions' ? isCreatingAction :
              isCreatingOperator
            }
          >
            {(isCreatingLibrary || isCreatingAction || isCreatingOperator) ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Libraries & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

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
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 h-8 mx-4 mb-2">
            <TabsTrigger value="libraries" className="text-xs">
              Libraries ({libraries.length})
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">
              Actions ({actions.length})
            </TabsTrigger>
            <TabsTrigger value="operators" className="text-xs">
              Operators ({operators.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-4">
              <TabsContent value="libraries" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Available Libraries</h4>
                  <Badge variant="secondary" className="text-xs">
                    {libraries.length} total
                  </Badge>
                </div>
                {libraries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No libraries found</p>
                    <p className="text-xs">Create a custom library to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {libraries.map((library) => (
                      <LibraryCard key={library.id} library={library} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Workflow Actions</h4>
                  <Badge variant="secondary" className="text-xs">
                    {actions.length} total
                  </Badge>
                </div>
                {actions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No actions found</p>
                    <p className="text-xs">Create a custom action to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {actions.map((action) => (
                      <ActionCard key={action.id} action={action} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="operators" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Logical Operators</h4>
                  <Badge variant="secondary" className="text-xs">
                    {operators.length} total
                  </Badge>
                </div>
                {operators.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No operators found</p>
                    <p className="text-xs">Create a custom operator to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {operators.map((operator) => (
                      <OperatorCard key={operator.id} operator={operator} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>

      <CreateDialog />
    </Card>
  );
};