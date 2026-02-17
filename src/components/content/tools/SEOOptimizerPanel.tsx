/**
 * SEO Optimizer Panel
 * AI-powered SEO optimization for titles, descriptions, and tags
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { seoOptimizationService, type SEOAnalysis, type OptimizedContent } from '@/services/seoOptimizationService';
import { toast } from 'sonner';

interface SEOOptimizerPanelProps {
  title?: string;
  description?: string;
  tags?: string[];
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'general';
  onOptimize?: (result: OptimizedContent) => void;
}

const SEOOptimizerPanel: React.FC<SEOOptimizerPanelProps> = ({
  title: initialTitle = '',
  description: initialDescription = '',
  tags: initialTags = [],
  platform = 'youtube' as 'youtube' | 'tiktok' | 'instagram' | 'general',
  onOptimize
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [optimized, setOptimized] = useState<OptimizedContent | null>(null);
  const [titleVariations, setTitleVariations] = useState<string[]>([]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await seoOptimizationService.analyzeContent(
        title,
        description,
        tags.split(',').map(t => t.trim()).filter(Boolean),
        platform
      );
      setAnalysis(result);
    } catch (err) {
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await seoOptimizationService.optimizeContent(
        title,
        description,
        tags.split(',').map(t => t.trim()).filter(Boolean),
        platform
      );
      setOptimized(result);
      onOptimize?.(result);
      toast.success('Content optimized!');
    } catch (err) {
      toast.error('Failed to optimize content');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateTitles = async () => {
    try {
      const variations = await seoOptimizationService.generateTitleVariations(
        title || 'Your Topic',
        'informative',
        5
      );
      setTitleVariations(variations);
    } catch (err) {
      toast.error('Failed to generate title variations');
    }
  };

  const applyOptimized = () => {
    if (optimized) {
      setTitle(optimized.optimized_title);
      setDescription(optimized.optimized_description);
      setTags(optimized.optimized_tags.join(', '));
      toast.success('Applied optimized content');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Input Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Content to Optimize
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <div className="flex gap-2 mt-1">
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your title..."
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleGenerateTitles}
                  title="Generate variations"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your description..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
              <Input 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !title}
                variant="outline"
                className="flex-1"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                Analyze
              </Button>
              <Button 
                onClick={handleOptimize} 
                disabled={isOptimizing || !title}
                className="flex-1"
              >
                {isOptimizing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Optimize with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Title Variations */}
        {titleVariations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Title Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {titleVariations.map((variation, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg group hover:bg-muted transition-colors"
                >
                  <span className="text-sm">{variation}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7"
                      onClick={() => setTitle(variation)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7"
                      onClick={() => copyToClipboard(variation)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  SEO Score
                </span>
                <Badge variant={analysis.score >= 70 ? 'default' : analysis.score >= 50 ? 'secondary' : 'destructive'}>
                  {analysis.score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Title</span>
                    <span>{analysis.title_score}%</span>
                  </div>
                  <Progress value={analysis.title_score} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Description</span>
                    <span>{analysis.description_score}%</span>
                  </div>
                  <Progress value={analysis.description_score} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Tags</span>
                    <span>{analysis.tags_score}%</span>
                  </div>
                  <Progress value={analysis.tags_score} className="h-2" />
                </div>
              </div>

              {analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Recommendations</h4>
                  {analysis.recommendations.map((rec, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg"
                    >
                      <AlertCircle className={`h-4 w-4 mt-0.5 ${
                        rec.priority === 'high' ? 'text-destructive' : 
                        rec.priority === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{rec.impact_description}</p>
                        {rec.suggested_value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 {rec.suggested_value}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +{rec.estimated_improvement}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Optimized Results */}
        {optimized && (
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI-Optimized Content
                </span>
                <Badge>Score: {optimized.seo_score}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Optimized Title</label>
                <div className="flex items-center gap-2 mt-1 p-2 bg-primary/5 rounded-lg">
                  <span className="text-sm flex-1">{optimized.optimized_title}</span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(optimized.optimized_title)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Optimized Description</label>
                <div className="mt-1 p-2 bg-primary/5 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{optimized.optimized_description}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Optimized Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {optimized.optimized_tags.slice(0, 15).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {optimized.optimized_tags.length > 15 && (
                    <Badge variant="outline" className="text-xs">
                      +{optimized.optimized_tags.length - 15} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button onClick={applyOptimized} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply All Optimizations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default SEOOptimizerPanel;
