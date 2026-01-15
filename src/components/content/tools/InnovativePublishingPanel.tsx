/**
 * Innovative Publishing Panel
 * Creative publishing formats for LinkedIn, YouTube, and more
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, MessageSquare, LayoutGrid, BarChart3, Mic, Video, FileText, Zap, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface InnovativePublishingPanelProps {
  contentId?: string;
  title?: string;
  description?: string;
  onPublish?: (result: any) => void;
}

const InnovativePublishingPanel: React.FC<InnovativePublishingPanelProps> = ({
  title = '',
  description = '',
  onPublish
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [content, setContent] = useState(description);

  const formats = [
    { id: 'thread', label: 'Thread Generator', icon: MessageSquare, desc: 'Turn video into LinkedIn/X thread', platform: 'linkedin', hot: true },
    { id: 'carousel', label: 'Carousel Creator', icon: LayoutGrid, desc: 'Auto-generate swipe posts', platform: 'instagram', hot: true },
    { id: 'poll', label: 'Poll from Content', icon: BarChart3, desc: 'AI-generate engaging polls', platform: 'linkedin' },
    { id: 'audiogram', label: 'Audiogram', icon: Mic, desc: 'Audio waveform video clip', platform: 'youtube' },
    { id: 'quote-cards', label: 'Quote Cards', icon: FileText, desc: 'Extract key quotes as images', platform: 'instagram' },
    { id: 'teaser', label: 'Teaser Clip', icon: Video, desc: '15s hook with CTA overlay', platform: 'tiktok' },
  ];

  const handleGenerate = () => {
    toast.success(`Generating ${selectedFormat} format...`);
    onPublish?.({ format: selectedFormat, content });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Creative Publishing Formats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {formats.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedFormat === format.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <format.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{format.label}</span>
                    {format.hot && <Badge variant="destructive" className="text-[9px] px-1">HOT</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{format.desc}</p>
                </button>
              ))}
            </div>

            {selectedFormat && (
              <>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add context or let AI generate..."
                  rows={3}
                />
                <Button onClick={handleGenerate} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate {formats.find(f => f.id === selectedFormat)?.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default InnovativePublishingPanel;
