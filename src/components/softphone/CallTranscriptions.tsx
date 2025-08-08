import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  FileText, 
  Search, 
  Download,
  Play,
  Pause,
  Volume2,
  Brain,
  Eye,
  Star,
  StarOff,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

interface Transcription {
  id: string;
  call_session_id: string;
  transcript_text: string;
  confidence_score?: number;
  speaker_labels?: any;
  sentiment_analysis?: any;
  key_topics?: string[];
  is_reviewed: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationAnalysis {
  id: string;
  call_session_id: string;
  analysis_type: string;
  analysis_results: any;
  created_at: string;
}

export const CallTranscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch transcriptions
  const { data: transcriptions = [], isLoading } = useQuery({
    queryKey: ['call-transcriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_transcriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Transcription[];
    }
  });

  // Fetch conversation analyses
  const { data: analyses = [] } = useQuery({
    queryKey: ['conversation-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_analysis')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ConversationAnalysis[];
    }
  });

  // Mark transcription as reviewed
  const markAsReviewed = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('call_transcriptions')
        .update({ 
          is_reviewed: true,
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-transcriptions'] });
      setSelectedTranscription(null);
      setReviewNotes('');
      showSuccess('Transcription marked as reviewed');
    },
    onError: (error) => {
      console.error('Error marking as reviewed:', error);
      showError('Failed to mark as reviewed');
    }
  });

  const filteredTranscriptions = transcriptions.filter(t => 
    t.transcript_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.key_topics?.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const handleExportTranscription = (transcription: Transcription) => {
    const content = `Call Transcription
Date: ${format(new Date(transcription.created_at), 'PPpp')}
Confidence: ${transcription.confidence_score || 'N/A'}%
Topics: ${transcription.key_topics?.join(', ') || 'None'}

Transcript:
${transcription.transcript_text}

Sentiment Analysis: ${JSON.stringify(transcription.sentiment_analysis, null, 2)}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcription_${transcription.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{transcriptions.length}</p>
                <p className="text-sm text-muted-foreground">Total Transcriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {transcriptions.filter(t => t.is_reviewed).length}
                </p>
                <p className="text-sm text-muted-foreground">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {transcriptions.filter(t => !t.is_reviewed).length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{analyses.length}</p>
                <p className="text-sm text-muted-foreground">AI Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcriptions by content or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transcriptions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Transcriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading transcriptions...</div>
            ) : filteredTranscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transcriptions found
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredTranscriptions.map((transcription) => (
                  <div 
                    key={transcription.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                      selectedTranscription?.id === transcription.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedTranscription(transcription)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {format(new Date(transcription.created_at), 'MMM dd, HH:mm')}
                        </span>
                        {transcription.confidence_score && (
                          <Badge variant="outline" className="text-xs">
                            {transcription.confidence_score}% confidence
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {transcription.is_reviewed ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <StarOff className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {transcription.transcript_text}
                    </p>
                    
                    {transcription.key_topics && transcription.key_topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {transcription.key_topics.slice(0, 3).map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {transcription.sentiment_analysis?.overall && (
                      <Badge 
                        className={`mt-2 text-xs ${getSentimentColor(transcription.sentiment_analysis.overall)}`} 
                        variant="secondary"
                      >
                        {transcription.sentiment_analysis.overall} sentiment
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Transcription Details */}
        {selectedTranscription && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transcription Details</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportTranscription(selectedTranscription)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Full Transcript</h4>
                <div className="bg-accent/20 p-4 rounded-lg text-sm max-h-40 overflow-y-auto">
                  {selectedTranscription.transcript_text}
                </div>
              </div>

              {selectedTranscription.key_topics && selectedTranscription.key_topics.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTranscription.key_topics.map((topic, index) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTranscription.sentiment_analysis && (
                <div>
                  <h4 className="font-medium mb-2">Sentiment Analysis</h4>
                  <div className="bg-accent/20 p-3 rounded-lg text-sm">
                    <pre>{JSON.stringify(selectedTranscription.sentiment_analysis, null, 2)}</pre>
                  </div>
                </div>
              )}

              {!selectedTranscription.is_reviewed && (
                <div className="space-y-3">
                  <h4 className="font-medium">Review Notes</h4>
                  <Textarea
                    placeholder="Add review notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={() => markAsReviewed.mutate({ 
                      id: selectedTranscription.id, 
                      notes: reviewNotes 
                    })}
                    disabled={markAsReviewed.isPending}
                  >
                    Mark as Reviewed
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};