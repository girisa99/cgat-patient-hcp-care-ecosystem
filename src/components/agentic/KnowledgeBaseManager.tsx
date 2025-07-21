import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Globe, FileText, Link, Zap, Download,
  CheckCircle, AlertCircle, PlusCircle, Trash2,
  RefreshCw, ExternalLink, Upload, Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeSource {
  id: string;
  type: 'url' | 'file' | 'ai_generated' | 'scraped_content';
  title: string;
  content: string;
  url?: string;
  metadata: {
    source_type: string;
    confidence_score: number;
    last_updated: string;
    content_type: string;
    language: string;
    tags: string[];
    references: Reference[];
  };
  status: 'active' | 'processing' | 'failed' | 'archived';
  auto_generated: boolean;
  relevance_score: number;
}

interface Reference {
  title: string;
  url: string;
  type: 'source' | 'citation' | 'related';
  confidence: number;
}

interface ContentGenerationConfig {
  enabled: boolean;
  sources: string[];
  update_frequency: 'realtime' | 'daily' | 'weekly' | 'manual';
  quality_threshold: number;
  max_content_per_action: number;
  include_references: boolean;
  auto_crawl_urls: boolean;
}

interface KnowledgeBaseManagerProps {
  agentId: string;
  actions: Array<{
    id: string;
    name: string;
    type: string;
    category: string;
    description?: string;
  }>;
  onKnowledgeSourcesChange: (sources: KnowledgeSource[]) => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  agentId,
  actions,
  onKnowledgeSourcesChange
}) => {
  const { toast } = useToast();
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [config, setConfig] = useState<ContentGenerationConfig>({
    enabled: true,
    sources: ['web_search', 'documentation', 'research_papers'],
    update_frequency: 'daily',
    quality_threshold: 75,
    max_content_per_action: 5,
    include_references: true,
    auto_crawl_urls: true
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sources');
  const [newUrl, setNewUrl] = useState('');
  const [generatingContent, setGeneratingContent] = useState(false);

  useEffect(() => {
    loadKnowledgeSources();
    if (config.enabled) {
      generateActionBasedContent();
    }
  }, [agentId, actions, config.enabled]);

  const loadKnowledgeSources = async () => {
    try {
      // Load existing knowledge base sources
      const { data, error } = await supabase
        .from('agent_knowledge_bases')
        .select(`
          *,
          knowledge_base:knowledge_base_id(*)
        `)
        .eq('agent_id', agentId);

      if (error) throw error;

      // Transform the data to match our interface
      const sources: KnowledgeSource[] = (data || []).map(item => ({
        id: item.id,
        type: 'url',
        title: item.knowledge_base?.name || 'Untitled',
        content: item.knowledge_base?.processed_content || item.knowledge_base?.raw_content || '',
        metadata: {
          source_type: 'knowledge_base',
          confidence_score: 100,
          last_updated: item.created_at,
          content_type: item.knowledge_base?.content_type || 'text',
          language: 'en',
          tags: item.knowledge_base?.healthcare_tags || [],
          references: []
        },
        status: 'active',
        auto_generated: false,
        relevance_score: 100
      }));

      setKnowledgeSources(sources);
    } catch (error) {
      console.error('Error loading knowledge sources:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base sources",
        variant: "destructive"
      });
    }
  };

  const generateActionBasedContent = async () => {
    if (!config.enabled || generatingContent) return;
    
    setGeneratingContent(true);
    try {
      const newSources: KnowledgeSource[] = [];

      for (const action of actions) {
        // Generate AI content based on action context
        const aiContent = await generateAIContent(action);
        if (aiContent) {
          newSources.push(aiContent);
        }

        // Auto-crawl relevant URLs if enabled
        if (config.auto_crawl_urls) {
          const crawledContent = await findAndCrawlRelevantUrls(action);
          newSources.push(...crawledContent);
        }

        // Respect the max content limit
        if (newSources.length >= config.max_content_per_action * actions.length) {
          break;
        }
      }

      // Filter by quality threshold
      const qualitySources = newSources.filter(source => 
        source.relevance_score >= config.quality_threshold
      );

      setKnowledgeSources(prev => [...prev, ...qualitySources]);
      onKnowledgeSourcesChange([...knowledgeSources, ...qualitySources]);

      toast({
        title: "Content Generated",
        description: `Generated ${qualitySources.length} new knowledge sources`,
      });

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive"
      });
    }
    setGeneratingContent(false);
  };

  const generateAIContent = async (action: any): Promise<KnowledgeSource | null> => {
    try {
      // Try to call AI service, fallback to client-side generation
      try {
        const { data, error } = await supabase.functions.invoke('generate-knowledge-content', {
          body: {
            action: action,
            agent_id: agentId,
            config: config
          }
        });

        if (error) throw error;

        const source: KnowledgeSource = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'ai_generated',
          title: `AI Generated: ${action.name} Knowledge`,
          content: data.content,
          metadata: {
            source_type: 'ai_generated',
            confidence_score: data.confidence || 85,
            last_updated: new Date().toISOString(),
            content_type: 'text',
            language: 'en',
            tags: data.tags || [action.category, action.type],
            references: data.references || []
          },
          status: 'active',
          auto_generated: true,
          relevance_score: data.relevance_score || 80
        };

        return source;
      } catch (edgeFunctionError) {
        console.warn('Edge function unavailable, generating fallback content');
        
        // Generate fallback content based on action
        const fallbackContent = generateFallbackContent(action);
        
        const source: KnowledgeSource = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'ai_generated',
          title: `Knowledge Base: ${action.name}`,
          content: fallbackContent,
          metadata: {
            source_type: 'fallback_generated',
            confidence_score: 75,
            last_updated: new Date().toISOString(),
            content_type: 'text',
            language: 'en',
            tags: [action.category, action.type, 'healthcare'],
            references: []
          },
          status: 'active',
          auto_generated: true,
          relevance_score: 70
        };

        return source;
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      return null;
    }
  };

  const generateFallbackContent = (action: any): string => {
    const templates = {
      communication: `# ${action.name} - Communication Guidelines

## Overview
This action handles communication workflows for healthcare operations.

## Key Features
- Secure messaging protocols
- HIPAA-compliant communications
- Multi-channel support
- Real-time notifications

## Best Practices
- Always verify recipient identity
- Use encrypted channels for sensitive data
- Maintain audit trails
- Follow escalation procedures

## Integration Points
- EHR systems
- Notification services
- Audit logging
- Compliance monitoring`,

      data_processing: `# ${action.name} - Data Processing

## Overview
Healthcare data processing action with focus on accuracy and compliance.

## Data Types Supported
- Patient records
- Clinical observations
- Lab results
- Imaging data

## Processing Steps
1. Data validation and cleansing
2. Format standardization
3. Privacy protection
4. Quality assurance

## Compliance Requirements
- HIPAA compliance
- Data retention policies
- Access controls
- Audit requirements`,

      analysis: `# ${action.name} - Clinical Analysis

## Overview
Advanced analytics for healthcare decision support.

## Analysis Capabilities
- Pattern recognition
- Trend analysis
- Predictive modeling
- Risk assessment

## Healthcare Applications
- Clinical decision support
- Population health management
- Quality improvement
- Outcome prediction

## Data Sources
- Electronic health records
- Laboratory systems
- Imaging systems
- Wearable devices`
    };

    return templates[action.category as keyof typeof templates] || `# ${action.name}

## Overview
This action supports ${action.category} operations in healthcare environments.

## Description
${action.description || 'Healthcare action for improving patient care and operational efficiency.'}

## Key Benefits
- Improved efficiency
- Enhanced patient care
- Regulatory compliance
- Data-driven insights

## Implementation Notes
- Follow healthcare best practices
- Ensure regulatory compliance
- Maintain data security
- Document all processes`;
  };

  const findAndCrawlRelevantUrls = async (action: any): Promise<KnowledgeSource[]> => {
    try {
      // Try to search for relevant URLs, fallback gracefully
      try {
        const { data, error } = await supabase.functions.invoke('crawl-relevant-content', {
          body: {
            action: action,
            agent_id: agentId,
            max_results: 3
          }
        });

        if (error) throw error;

        return (data.sources || []).map((source: any) => ({
          id: `crawled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'scraped_content' as const,
          title: source.title,
          content: source.content,
          url: source.url,
          metadata: {
            source_type: 'web_crawl',
            confidence_score: source.confidence || 75,
            last_updated: new Date().toISOString(),
            content_type: source.content_type || 'text',
            language: source.language || 'en',
            tags: source.tags || [],
            references: source.references || []
          },
          status: 'active' as const,
          auto_generated: true,
          relevance_score: source.relevance_score || 70
        }));
      } catch (edgeFunctionError) {
        console.warn('Content crawling service unavailable');
        return []; // Return empty array instead of failing
      }
    } catch (error) {
      console.error('Error crawling content:', error);
      return [];
    }
  };

  const addUrlSource = async () => {
    if (!newUrl.trim()) return;

    setLoading(true);
    try {
      // Try to crawl the URL, fallback to manual entry
      let source: KnowledgeSource;
      
      try {
        const { data, error } = await supabase.functions.invoke('crawl-url-content', {
          body: { url: newUrl }
        });

        if (error) throw error;

        source = {
          id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'url',
          title: data.title || newUrl,
          content: data.content || '',
          url: newUrl,
          metadata: {
            source_type: 'manual_url',
            confidence_score: 90,
            last_updated: new Date().toISOString(),
            content_type: data.content_type || 'text',
            language: data.language || 'en',
            tags: data.tags || [],
            references: data.references || []
          },
          status: 'active',
          auto_generated: false,
          relevance_score: 85
        };
      } catch (crawlError) {
        console.warn('URL crawling failed, creating placeholder entry');
        
        source = {
          id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'url',
          title: `URL Reference: ${newUrl}`,
          content: `This is a reference to an external URL that will be used as a knowledge source.\n\nURL: ${newUrl}\n\nNote: Content crawling is currently unavailable. Please manually add relevant content or configure the crawling service.`,
          url: newUrl,
          metadata: {
            source_type: 'manual_url_placeholder',
            confidence_score: 70,
            last_updated: new Date().toISOString(),
            content_type: 'text',
            language: 'en',
            tags: ['url_reference', 'manual_entry'],
            references: []
          },
          status: 'active',
          auto_generated: false,
          relevance_score: 75
        };
      }

      const updatedSources = [...knowledgeSources, source];
      setKnowledgeSources(updatedSources);
      onKnowledgeSourcesChange(updatedSources);
      setNewUrl('');

      toast({
        title: "URL Added",
        description: `URL reference has been added to knowledge base`,
      });

    } catch (error) {
      console.error('Error adding URL:', error);
      toast({
        title: "Error",
        description: "Failed to add URL to knowledge base",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const removeSource = (sourceId: string) => {
    const updatedSources = knowledgeSources.filter(source => source.id !== sourceId);
    setKnowledgeSources(updatedSources);
    onKnowledgeSourcesChange(updatedSources);
  };

  const refreshAllSources = async () => {
    setLoading(true);
    try {
      const refreshedSources = await Promise.all(
        knowledgeSources.map(async (source) => {
          if (source.type === 'url' && source.url) {
            try {
              const { data } = await supabase.functions.invoke('crawl-url-content', {
                body: { url: source.url }
              });
              
              return {
                ...source,
                content: data.content || source.content,
                metadata: {
                  ...source.metadata,
                  last_updated: new Date().toISOString()
                }
              };
            } catch (error) {
              return source;
            }
          }
          return source;
        })
      );

      setKnowledgeSources(refreshedSources);
      onKnowledgeSourcesChange(refreshedSources);

      toast({
        title: "Sources Refreshed",
        description: "All knowledge sources have been updated",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh some sources",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const updateConfig = (updates: Partial<ContentGenerationConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'url': return <Globe className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'ai_generated': return <Brain className="h-4 w-4" />;
      case 'scraped_content': return <Search className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'archived': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Knowledge Base Manager
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={generateActionBasedContent}
                disabled={generatingContent}
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                {generatingContent ? 'Generating...' : 'Generate Content'}
              </Button>
              <Button
                onClick={refreshAllSources}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{knowledgeSources.length}</div>
              <div className="text-sm text-muted-foreground">Total Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {knowledgeSources.filter(s => s.auto_generated).length}
              </div>
              <div className="text-sm text-muted-foreground">AI Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {knowledgeSources.filter(s => s.type === 'url').length}
              </div>
              <div className="text-sm text-muted-foreground">URL Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  knowledgeSources.reduce((acc, s) => acc + s.relevance_score, 0) / 
                  Math.max(knowledgeSources.length, 1)
                )}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Relevance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources">Knowledge Sources</TabsTrigger>
          <TabsTrigger value="configuration">Auto-Generation Config</TabsTrigger>
          <TabsTrigger value="add-content">Add Content</TabsTrigger>
        </TabsList>

        {/* Knowledge Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          {knowledgeSources.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No Knowledge Sources Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add URLs, upload files, or enable auto-generation to build your agent's knowledge base
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => setActiveTab('add-content')} size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
                <Button 
                  onClick={generateActionBasedContent} 
                  variant="outline" 
                  size="sm"
                  disabled={generatingContent}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Generate
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {knowledgeSources.map(source => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getSourceIcon(source.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{source.title}</h4>
                            <Badge variant="outline" className={getStatusColor(source.status)}>
                              {source.status}
                            </Badge>
                            {source.auto_generated && (
                              <Badge variant="secondary">Auto</Badge>
                            )}
                          </div>
                          
                          {source.url && (
                            <div className="flex items-center gap-1 mb-2">
                              <ExternalLink className="h-3 w-3" />
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {source.url}
                              </a>
                            </div>
                          )}
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {source.content.substring(0, 200)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Relevance: {source.relevance_score}%</span>
                          <span>Confidence: {source.metadata.confidence_score}%</span>
                          <span>Updated: {new Date(source.metadata.last_updated).toLocaleDateString()}</span>
                        </div>
                        
                        {source.metadata.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {source.metadata.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                         </div>
                       </div>
                       
                       <Button
                         size="sm"
                         variant="ghost"
                         onClick={() => removeSource(source.id)}
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Auto-Generation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate knowledge content based on agent actions
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(enabled) => updateConfig({ enabled })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Update Frequency</Label>
                  <select
                    className="w-full p-2 border rounded mt-1"
                    value={config.update_frequency}
                    onChange={(e) => updateConfig({ 
                      update_frequency: e.target.value as any 
                    })}
                  >
                    <option value="realtime">Real-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <Label>Quality Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.quality_threshold}
                    onChange={(e) => updateConfig({ 
                      quality_threshold: parseInt(e.target.value) 
                    })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Max Content per Action</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={config.max_content_per_action}
                    onChange={(e) => updateConfig({ 
                      max_content_per_action: parseInt(e.target.value) 
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Include References</Label>
                  <Switch
                    checked={config.include_references}
                    onCheckedChange={(include_references) => 
                      updateConfig({ include_references })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Auto-crawl URLs</Label>
                  <Switch
                    checked={config.auto_crawl_urls}
                    onCheckedChange={(auto_crawl_urls) => 
                      updateConfig({ auto_crawl_urls })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Content Tab */}
        <TabsContent value="add-content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add URL Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL to crawl and add to knowledge base"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={addUrlSource}
                  disabled={loading || !newUrl.trim()}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Drag and drop files here</p>
                <p className="text-sm text-muted-foreground">Supports PDF, TXT, DOCX files</p>
                <Button variant="outline" className="mt-2">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};