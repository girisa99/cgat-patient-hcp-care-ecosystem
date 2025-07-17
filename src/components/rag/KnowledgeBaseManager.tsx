import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Upload, 
  Link as LinkIcon, 
  Globe, 
  BookOpen, 
  Dna, 
  Heart, 
  Brain,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface KnowledgeEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  source_type: string;
  source_url?: string;
  healthcare_tags: string[];
  modality_type?: string;
  treatment_category?: string;
  regulatory_status?: string;
  created_at: string;
  created_by: string;
}

export const KnowledgeBaseManager: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    description: '',
    category: 'general',
    sourceType: 'manual_entry',
    content: '',
    url: '',
    healthcareTags: '',
    modalityType: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: knowledgeEntries = [], isLoading, refetch } = useQuery({
    queryKey: ['knowledge-base', searchQuery, filterCategory],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_base')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
  });

  const handleAddKnowledge = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rag-knowledge-processor', {
        body: {
          action: 'add_knowledge',
          ...newEntry,
          healthcareTags: newEntry.healthcareTags.split(',').map(tag => tag.trim()).filter(Boolean),
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Knowledge Added Successfully",
        description: "New knowledge entry has been added to the database.",
      });

      setIsAddDialogOpen(false);
      setNewEntry({
        name: '',
        description: '',
        category: 'general',
        sourceType: 'manual_entry',
        content: '',
        url: '',
        healthcareTags: '',
        modalityType: '',
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Failed to Add Knowledge",
        description: error.message || 'An error occurred while adding knowledge.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessUrl = async (url: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('rag-knowledge-processor', {
        body: {
          action: 'process_url',
          url,
          category: newEntry.category,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "URL Processed Successfully",
        description: `Content from ${url} has been added to the knowledge base.`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "URL Processing Failed",
        description: error.message || 'Failed to process the URL.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cell_therapy': return <Dna className="h-4 w-4" />;
      case 'gene_therapy': return <Dna className="h-4 w-4" />;
      case 'radioland_treatment': return <Heart className="h-4 w-4" />;
      case 'personalized_medicine': return <Brain className="h-4 w-4" />;
      case 'clinical_protocols': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'html_link': return <LinkIcon className="h-4 w-4" />;
      case 'web_crawl': return <Globe className="h-4 w-4" />;
      case 'document_upload': return <Upload className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">
            Manage healthcare knowledge for RAG-powered recommendations
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Knowledge Entry</DialogTitle>
              <DialogDescription>
                Add new healthcare knowledge to improve AI recommendations.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
                <TabsTrigger value="crawl">Web Crawl</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                    placeholder="e.g., CAR-T Cell Therapy Protocol"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    placeholder="Brief description of the knowledge..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newEntry.category} onValueChange={(value) => setNewEntry({...newEntry, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cell_therapy">Cell Therapy</SelectItem>
                        <SelectItem value="gene_therapy">Gene Therapy</SelectItem>
                        <SelectItem value="radioland_treatment">Radioland Treatment</SelectItem>
                        <SelectItem value="personalized_medicine">Personalized Medicine</SelectItem>
                        <SelectItem value="clinical_protocols">Clinical Protocols</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="modality">Modality Type</Label>
                    <Select value={newEntry.modalityType} onValueChange={(value) => setNewEntry({...newEntry, modalityType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select modality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cell_therapy">Cell Therapy</SelectItem>
                        <SelectItem value="gene_therapy">Gene Therapy</SelectItem>
                        <SelectItem value="small_molecule">Small Molecule</SelectItem>
                        <SelectItem value="biologics">Biologics</SelectItem>
                        <SelectItem value="device">Device</SelectItem>
                        <SelectItem value="combination">Combination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tags">Healthcare Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newEntry.healthcareTags}
                    onChange={(e) => setNewEntry({...newEntry, healthcareTags: e.target.value})}
                    placeholder="oncology, immunotherapy, clinical trial"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    placeholder="Enter the detailed knowledge content..."
                    rows={6}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <DocumentUpload 
                  onUploadComplete={(files) => {
                    toast({
                      title: "Documents Uploaded",
                      description: `${files.length} documents have been processed and added to knowledge base.`,
                    });
                    refetch();
                    setIsAddDialogOpen(false);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newEntry.url}
                    onChange={(e) => setNewEntry({...newEntry, url: e.target.value})}
                    placeholder="https://example.com/healthcare-article"
                  />
                </div>
                
                <div>
                  <Label htmlFor="url-category">Category</Label>
                  <Select value={newEntry.category} onValueChange={(value) => setNewEntry({...newEntry, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cell_therapy">Cell Therapy</SelectItem>
                      <SelectItem value="gene_therapy">Gene Therapy</SelectItem>
                      <SelectItem value="radioland_treatment">Radioland Treatment</SelectItem>
                      <SelectItem value="personalized_medicine">Personalized Medicine</SelectItem>
                      <SelectItem value="clinical_protocols">Clinical Protocols</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => handleProcessUrl(newEntry.url)}
                  disabled={!newEntry.url || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Process URL'}
                </Button>
              </TabsContent>
              
              <TabsContent value="crawl" className="space-y-4">
                <div className="text-sm text-muted-foreground p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">Web Crawling</p>
                  <p>This will crawl multiple pages starting from the provided URL to build comprehensive knowledge.</p>
                </div>
                
                <div>
                  <Label htmlFor="crawl-url">Starting URL</Label>
                  <Input
                    id="crawl-url"
                    value={newEntry.url}
                    onChange={(e) => setNewEntry({...newEntry, url: e.target.value})}
                    placeholder="https://example.com/healthcare-docs"
                  />
                </div>
                
                <Button 
                  onClick={() => supabase.functions.invoke('rag-knowledge-processor', {
                    body: {
                      action: 'web_crawl',
                      startUrl: newEntry.url,
                      maxPages: 5,
                      category: newEntry.category,
                      userId: 'current-user-id'
                    }
                  })}
                  disabled={!newEntry.url || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Crawling...' : 'Start Web Crawl'}
                </Button>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddKnowledge}
                disabled={isProcessing || !newEntry.name || !newEntry.content}
              >
                {isProcessing ? 'Adding...' : 'Add Knowledge'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="w-48">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cell_therapy">Cell Therapy</SelectItem>
              <SelectItem value="gene_therapy">Gene Therapy</SelectItem>
              <SelectItem value="radioland_treatment">Radioland Treatment</SelectItem>
              <SelectItem value="personalized_medicine">Personalized Medicine</SelectItem>
              <SelectItem value="clinical_protocols">Clinical Protocols</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Knowledge Entries */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading knowledge base...</span>
          </div>
        ) : knowledgeEntries.length > 0 ? (
          knowledgeEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(entry.category)}
                    <CardTitle className="text-base">{entry.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSourceIcon(entry.source_type)}
                    <Badge variant="outline" className="text-xs">
                      {entry.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{entry.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entry.healthcare_tags && entry.healthcare_tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {entry.healthcare_tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Added {new Date(entry.created_at).toLocaleDateString()}</span>
                    {entry.modality_type && (
                      <Badge variant="outline" className="text-xs">
                        {entry.modality_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  {entry.source_url && (
                    <div className="flex items-center gap-1 text-xs">
                      <LinkIcon className="h-3 w-3" />
                      <a 
                        href={entry.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-xs"
                      >
                        {entry.source_url}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No knowledge entries found. Add some healthcare knowledge to get started.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};