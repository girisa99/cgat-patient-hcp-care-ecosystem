/**
 * KNOWLEDGE SEARCH PANEL - Phase 1 Frontend
 * UI for RAG search with semantic reranking
 * Uses rag-search edge function via ragService
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Loader2, 
  BookOpen,
  Brain,
  Sparkles,
  FileText,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Filter,
  Zap,
  Database,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeSearchPanelProps {
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  category?: string;
  relevanceScore: number;
  aiReranked?: boolean;
  summary?: string;
  entities?: string[];
  classification?: string;
  createdAt?: string;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  reranked?: boolean;
  summary?: string;
  classification?: {
    category: string;
    confidence: number;
  };
  totalFound?: number;
  processingTime?: number;
  error?: string;
}

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'clinical', label: 'Clinical' },
  { value: 'research', label: 'Research' },
  { value: 'educational', label: 'Educational' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'operational', label: 'Operational' },
];

export function KnowledgeSearchPanel({ onResultSelect, className }: KnowledgeSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  
  // Search options
  const [limit, setLimit] = useState(10);
  const [enableReranking, setEnableReranking] = useState(true);
  const [enableSummarization, setEnableSummarization] = useState(false);
  const [enableClassification, setEnableClassification] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setResults([]);
    setResponse(null);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const { data, error } = await supabase.functions.invoke('rag-search', {
        body: {
          query: query.trim(),
          limit,
          enableReranking,
          enableSummarization,
          enableClassification,
          categoryFilter: categoryFilter !== 'all' ? categoryFilter : undefined,
        }
      });

      clearTimeout(timeoutId);

      if (error) {
        throw error;
      }

      const searchResponse = data as SearchResponse;
      setResponse(searchResponse);
      setResults(searchResponse.results || []);

      if (searchResponse.success) {
        toast.success(`Found ${searchResponse.results?.length || 0} results`);
      } else {
        toast.error(searchResponse.error || 'Search failed');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Search error:', error);
      const errorMessage = error?.name === 'AbortError' ? 'Search timed out' : 'An error occurred during search';
      toast.error(errorMessage);
      setResponse({ success: false, results: [], error: errorMessage });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedResults(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Knowledge Search
          </CardTitle>
          <CardDescription>
            AI-powered semantic search with reranking across your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your knowledge base..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <Collapsible open={showFilters}>
            <CollapsibleContent className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Results Limit */}
                <div className="space-y-2">
                  <Label className="text-sm">Results: {limit}</Label>
                  <Slider
                    value={[limit]}
                    onValueChange={([v]) => setLimit(v)}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {CATEGORY_FILTERS.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Features */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="rerank" 
                    checked={enableReranking} 
                    onCheckedChange={(c) => setEnableReranking(!!c)} 
                  />
                  <Label htmlFor="rerank" className="text-sm cursor-pointer flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    AI Reranking
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="summarize" 
                    checked={enableSummarization} 
                    onCheckedChange={(c) => setEnableSummarization(!!c)} 
                  />
                  <Label htmlFor="summarize" className="text-sm cursor-pointer flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Summarize Results
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="classify" 
                    checked={enableClassification} 
                    onCheckedChange={(c) => setEnableClassification(!!c)} 
                  />
                  <Label htmlFor="classify" className="text-sm cursor-pointer flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Classify Query
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Quick Stats */}
          {response && response.success && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {results.length} results
              </Badge>
              {response.reranked && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  AI Reranked
                </Badge>
              )}
              {response.classification && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {response.classification.category}
                </Badge>
              )}
              {response.processingTime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {response.processingTime}ms
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Summary */}
      {response?.summary && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{response.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Search Results
              </span>
              <Badge variant="outline">{results.length} found</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <Collapsible 
                    key={result.id}
                    open={expandedResults.has(result.id)}
                  >
                    <div className={cn(
                      "rounded-lg border p-4 transition-colors",
                      expandedResults.has(result.id) ? "bg-muted/50" : "hover:bg-muted/30"
                    )}>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                            <span className={cn("text-xs font-medium", getRelevanceColor(result.relevanceScore))}>
                              {Math.round(result.relevanceScore * 100)}% match
                            </span>
                            {result.aiReranked && (
                              <Badge variant="secondary" className="text-[10px] px-1">
                                <Zap className="h-2 w-2 mr-0.5" />
                                AI
                              </Badge>
                            )}
                            {result.category && (
                              <Badge variant="outline" className="text-[10px] px-1">
                                {result.category}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {result.content}
                          </p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleExpanded(result.id)}
                          >
                            {expandedResults.has(result.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      {/* Expanded Content */}
                      <CollapsibleContent className="pt-4 space-y-3">
                        {/* Full Content */}
                        <div className="text-sm bg-background rounded p-3 border">
                          {result.content}
                        </div>

                        {/* Summary */}
                        {result.summary && (
                          <div className="text-sm">
                            <Label className="text-xs text-muted-foreground">AI Summary</Label>
                            <p className="mt-1 text-muted-foreground italic">{result.summary}</p>
                          </div>
                        )}

                        {/* Entities */}
                        {result.entities && result.entities.length > 0 && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Extracted Entities</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.entities.map((entity, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {entity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {result.source && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {result.source}
                            </span>
                          )}
                          {result.createdAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(result.createdAt)}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(result.content)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          {result.sourceUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Source
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => onResultSelect?.(result)}
                          >
                            Use Result
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {response && response.success && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Results Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
