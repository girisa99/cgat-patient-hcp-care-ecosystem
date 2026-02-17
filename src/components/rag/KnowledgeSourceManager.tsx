import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, X, RefreshCw, Globe, FileText, Database, 
  Sparkles, Settings, Search, Filter, Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Source {
  id: string;
  name: string;
  type: 'url' | 'document' | 'database' | 'api';
  status: 'active' | 'inactive' | 'processing';
  lastSync: string;
  url?: string;
}

interface KnowledgeSourceManagerProps {
  sources: string[];
  autoGenConfig: {
    enabled: boolean;
    topics: string[];
    refreshInterval: number;
  };
  onSourcesChange: (sources: string[]) => void;
  onAutoGenConfigChange: (config: any) => void;
  onRefresh: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const KnowledgeSourceManager: React.FC<KnowledgeSourceManagerProps> = ({
  sources,
  autoGenConfig,
  onSourcesChange,
  onAutoGenConfigChange,
  onRefresh,
  onGenerate,
  isGenerating
}) => {
  const [managedSources, setManagedSources] = useState<Source[]>([
    {
      id: '1',
      name: 'FDA Drug Database',
      type: 'database',
      status: 'active',
      lastSync: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Medical Literature Review',
      type: 'document',
      status: 'processing',
      lastSync: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const [newSourceDialog, setNewSourceDialog] = useState(false);
  const [newSource, setNewSource] = useState<{
    name: string;
    type: 'url' | 'document' | 'database' | 'api';
    url: string;
  }>({
    name: '',
    type: 'url',
    url: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(autoGenConfig.topics);

  const availableTopics = [
    'Clinical Guidelines',
    'Drug Information',
    'Medical Procedures',
    'Patient Safety',
    'Regulatory Compliance',
    'Treatment Protocols',
    'Diagnostic Criteria',
    'Healthcare Technology'
  ];

  const addSource = () => {
    if (!newSource.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Source name is required",
        variant: "destructive"
      });
      return;
    }

    const source: Source = {
      id: Date.now().toString(),
      name: newSource.name,
      type: newSource.type,
      status: 'processing',
      lastSync: new Date().toISOString(),
      url: newSource.url || undefined
    };

    setManagedSources(prev => [...prev, source]);
    onSourcesChange([...sources, source.name]);
    
    // Reset form
    setNewSource({ name: '', type: 'url', url: '' });
    setNewSourceDialog(false);
    
    toast({
      title: "Source Added",
      description: `${source.name} has been added to your knowledge base`
    });

    // Simulate processing
    setTimeout(() => {
      setManagedSources(prev => 
        prev.map(s => s.id === source.id ? { ...s, status: 'active' as const } : s)
      );
      toast({
        title: "Source Ready",
        description: `${source.name} is now active and syncing`
      });
    }, 2000);
  };

  const removeSource = (sourceId: string) => {
    const source = managedSources.find(s => s.id === sourceId);
    if (source) {
      setManagedSources(prev => prev.filter(s => s.id !== sourceId));
      onSourcesChange(sources.filter(s => s !== source.name));
      
      toast({
        title: "Source Removed",
        description: `${source.name} has been removed from your knowledge base`
      });
    }
  };

  const syncSource = (sourceId: string) => {
    const source = managedSources.find(s => s.id === sourceId);
    if (source) {
      setManagedSources(prev => 
        prev.map(s => s.id === sourceId ? { ...s, status: 'processing' as const } : s)
      );
      
      toast({
        title: "Syncing Source",
        description: `${source.name} is being synchronized`
      });

      setTimeout(() => {
        setManagedSources(prev => 
          prev.map(s => s.id === sourceId ? { 
            ...s, 
            status: 'active' as const,
            lastSync: new Date().toISOString()
          } : s)
        );
        toast({
          title: "Sync Complete",
          description: `${source.name} has been successfully synchronized`
        });
      }, 3000);
    }
  };

  const toggleTopic = (topic: string) => {
    const updatedTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    
    setSelectedTopics(updatedTopics);
    onAutoGenConfigChange({
      ...autoGenConfig,
      topics: updatedTopics
    });
  };

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'url': return Globe;
      case 'document': return FileText;
      case 'database': return Database;
      case 'api': return Settings;
      default: return FileText;
    }
  };

  const getStatusBadge = (status: Source['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Knowledge Sources</h3>
          <p className="text-sm text-muted-foreground">
            Manage data sources and auto-generation configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={newSourceDialog} onOpenChange={setNewSourceDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Knowledge Source</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Source Name</Label>
                  <Input
                    value={newSource.name}
                    onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    placeholder="e.g., Medical Research Database"
                  />
                </div>
                
                <div>
                  <Label>Source Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['url', 'document', 'database', 'api'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={newSource.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewSource({ ...newSource, type })}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {(newSource.type === 'url' || newSource.type === 'api') && (
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      placeholder="https://example.com/api"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={addSource}>Add Source</Button>
                  <Button variant="outline" onClick={() => setNewSourceDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="auto-gen">Auto-Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sources</CardTitle>
              <CardDescription>
                Manage your knowledge base data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {managedSources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sources configured</p>
                    <p className="text-sm">Add your first knowledge source to get started</p>
                  </div>
                ) : (
                  managedSources.map((source) => {
                    const IconComponent = getSourceIcon(source.type);
                    return (
                      <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{source.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Last sync: {new Date(source.lastSync).toLocaleString()}
                            </p>
                            {source.url && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {source.url}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(source.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => syncSource(source.id)}
                            disabled={source.status === 'processing'}
                          >
                            <RefreshCw className={`h-4 w-4 ${source.status === 'processing' ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSource(source.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-gen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Generation Configuration</CardTitle>
              <CardDescription>
                Configure automatic content generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Enable Auto-Generation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate knowledge base content from sources
                  </p>
                </div>
                <Switch
                  checked={autoGenConfig.enabled}
                  onCheckedChange={(enabled) => onAutoGenConfigChange({ ...autoGenConfig, enabled })}
                />
              </div>

              {autoGenConfig.enabled && (
                <>
                  <div className="space-y-3">
                    <Label>Refresh Interval (hours)</Label>
                    <Input
                      type="number"
                      value={autoGenConfig.refreshInterval}
                      onChange={(e) => onAutoGenConfigChange({
                        ...autoGenConfig,
                        refreshInterval: parseInt(e.target.value) || 24
                      })}
                      min={1}
                      max={168}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Content Topics</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableTopics.map((topic) => (
                        <Button
                          key={topic}
                          variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleTopic(topic)}
                          className="justify-start text-left"
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={onGenerate}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <Sparkles className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
                      {isGenerating ? 'Generating...' : 'Generate Content'}
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};