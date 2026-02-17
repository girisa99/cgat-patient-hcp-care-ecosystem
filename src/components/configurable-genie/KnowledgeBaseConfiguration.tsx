/**
 * KNOWLEDGE BASE CONFIGURATION
 * Manage knowledge base entries for GENIE configurations
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  BookOpen, 
  Search,
  Tag
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeBaseConfigurationProps {
  selectedKnowledgeBaseIds: string[];
  onKnowledgeBaseChange: (ids: string[]) => void;
}

export const KnowledgeBaseConfiguration: React.FC<KnowledgeBaseConfigurationProps> = ({
  selectedKnowledgeBaseIds,
  onKnowledgeBaseChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch knowledge base entries
  const { data: knowledgeEntries, isLoading } = useQuery({
    queryKey: ['knowledge-base-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, name, processed_content, raw_content, content_type, healthcare_tags, metadata')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredEntries = knowledgeEntries?.filter(entry => 
    entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.processed_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.raw_content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleKnowledgeBase = (id: string) => {
    if (selectedKnowledgeBaseIds.includes(id)) {
      onKnowledgeBaseChange(selectedKnowledgeBaseIds.filter(kbId => kbId !== id));
    } else {
      onKnowledgeBaseChange([...selectedKnowledgeBaseIds, id]);
    }
  };

  const selectAll = () => {
    if (filteredEntries) {
      onKnowledgeBaseChange(filteredEntries.map(e => e.id));
    }
  };

  const deselectAll = () => {
    onKnowledgeBaseChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Base Selection
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={deselectAll}
            >
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="kb_search">Search Knowledge Base</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="kb_search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or content..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total Entries: {filteredEntries?.length || 0}</span>
          <span>Selected: {selectedKnowledgeBaseIds.length}</span>
        </div>

        {/* Knowledge Base List */}
        <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading knowledge base entries...
            </div>
          ) : filteredEntries?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No knowledge base entries found</p>
            </div>
          ) : (
            filteredEntries?.map((entry) => (
              <Card 
                key={entry.id}
                className={`cursor-pointer transition-all ${
                  selectedKnowledgeBaseIds.includes(entry.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => toggleKnowledgeBase(entry.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Switch
                      checked={selectedKnowledgeBaseIds.includes(entry.id)}
                      onCheckedChange={() => toggleKnowledgeBase(entry.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium truncate">{entry.name || 'Untitled'}</h4>
                        {entry.content_type && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.content_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {entry.processed_content || entry.raw_content || 'No content available'}
                      </p>
                      {entry.healthcare_tags && entry.healthcare_tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {entry.healthcare_tags.slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {entry.healthcare_tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.healthcare_tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Text */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">About Knowledge Base</p>
          <p>
            Select knowledge base entries to include in this GENIE configuration. 
            The selected entries will be used for RAG (Retrieval Augmented Generation) 
            to provide contextually relevant responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
