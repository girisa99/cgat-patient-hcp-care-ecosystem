import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Brain, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  ExternalLink,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Recommendation {
  type: string;
  title: string;
  description: string;
  confidence: number;
  source?: string;
  category: string;
}

interface NextBestAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  timeline: string;
}

interface RAGRecommendationsProps {
  conversationId?: string;
  healthcareContext?: any;
}

export const RAGRecommendations: React.FC<RAGRecommendationsProps> = ({ 
  conversationId, 
  healthcareContext 
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [nextBestActions, setNextBestActions] = useState<NextBestAction[]>([]);
  const [clinicalInsights, setClinicalInsights] = useState<any>(null);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<any[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [sourceCount, setSourceCount] = useState<number>(0);

  const handleGetRecommendations = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a query to get recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rag-knowledge-processor', {
        body: {
          action: 'get_recommendations',
          query,
          conversationId,
          healthcareContext,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setNextBestActions(data.nextBestActions || []);
      setClinicalInsights(data.clinicalInsights || null);
      setTreatmentRecommendations(data.treatmentRecommendations || []);
      setConfidence(data.confidence || 0);
      setSourceCount(data.sourceCount || 0);

      toast({
        title: "Recommendations Generated",
        description: `Found ${data.recommendations?.length || 0} recommendations from ${data.sourceCount || 0} sources.`,
      });

    } catch (error: any) {
      toast({
        title: "Failed to Get Recommendations",
        description: error.message || 'An error occurred while getting recommendations.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600';
    if (conf >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5" />
            RAG Recommendations
          </h3>
          <p className="text-sm text-muted-foreground">
            Get AI-powered recommendations based on your healthcare knowledge base
          </p>
        </div>
      </div>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ask for Recommendations</CardTitle>
          <CardDescription>
            Enter your healthcare query to get personalized recommendations and next best actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g., What are the latest CAR-T cell therapy protocols for B-cell lymphoma?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGetRecommendations()}
              />
            </div>
            <Button 
              onClick={handleGetRecommendations}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Get Recommendations
                </div>
              )}
            </Button>
          </div>
          
          {confidence > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Confidence: </span>
                <span className={`font-medium ${getConfidenceColor(confidence)}`}>
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>Sources: {sourceCount}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5" />
              Healthcare Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.category.replace('_', ' ')}
                        </Badge>
                        <span className={`text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                          {(rec.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    {rec.source && (
                      <div className="flex items-center gap-1 text-xs">
                        <ExternalLink className="h-3 w-3" />
                        <a 
                          href={rec.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Source
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Next Best Actions */}
      {nextBestActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Next Best Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextBestActions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(action.priority)}
                    <Badge variant={getPriorityColor(action.priority) as any} className="text-xs">
                      {action.priority}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{action.action.replace('_', ' ')}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{action.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{action.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Recommendations */}
      {treatmentRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Treatment Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {treatmentRecommendations.map((treatment, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{treatment.modality?.replace('_', ' ')}</h4>
                    <Badge variant="outline" className="text-xs">
                      {treatment.evidence_level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{treatment.considerations}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Insights */}
      {clinicalInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Clinical Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Key Findings</h4>
                <div className="space-y-1">
                  {clinicalInsights.key_findings?.map((finding: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                      {finding}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Evidence Strength</h4>
                <Badge variant="outline" className="text-xs">
                  {clinicalInsights.evidence_strength}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Clinical Relevance</h4>
                <Badge variant="outline" className="text-xs">
                  {clinicalInsights.clinical_relevance}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Patient Populations</h4>
                <div className="space-y-1">
                  {clinicalInsights.patient_populations?.map((pop: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                      {pop}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && query && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No recommendations found for your query. Try rephrasing or adding more healthcare knowledge to the knowledge base.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};