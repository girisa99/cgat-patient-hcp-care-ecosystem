/**
 * Vibe to Mind Bridge Component
 * Quick action panel to send content from Vibe to Mind/Spark for AI processing
 * Part of Genie Studio
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Brain, 
  FileText, 
  Video, 
  Image, 
  Globe, 
  Sparkles,
  Upload,
  Monitor,
  Film,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import Mind logo
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';

interface ContentItem {
  id: string;
  type: 'recording' | 'screen' | 'import' | 'url';
  name: string;
  thumbnail?: string;
  hasScript?: boolean;
}

interface VibeToMindBridgeProps {
  recentRecordings?: ContentItem[];
  onAnalyzeContent: (content: ContentItem) => void;
  onImportForAnalysis: () => void;
  className?: string;
  compact?: boolean;
}

export function VibeToMindBridge({
  recentRecordings = [],
  onAnalyzeContent,
  onImportForAnalysis,
  className,
  compact = false
}: VibeToMindBridgeProps) {
  const contentTypeIcons: Record<ContentItem['type'], React.ReactNode> = {
    recording: <Video className="h-4 w-4" />,
    screen: <Monitor className="h-4 w-4" />,
    import: <Upload className="h-4 w-4" />,
    url: <Globe className="h-4 w-4" />
  };

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="h-3.5 w-3.5 text-purple-500" />
          <span>Need a script? Send to Mind</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onImportForAnalysis}
            className="gap-1.5 text-xs h-7 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10"
          >
            <Upload className="h-3 w-3" />
            Import & Analyze
          </Button>
          {recentRecordings.slice(0, 2).map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant="ghost"
              onClick={() => onAnalyzeContent(item)}
              className="gap-1.5 text-xs h-7"
              disabled={item.hasScript}
            >
              {contentTypeIcons[item.type]}
              <span className="max-w-[80px] truncate">{item.name}</span>
              {item.hasScript && <Badge variant="secondary" className="text-[10px] h-4 px-1">Has Script</Badge>}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden p-0.5">
            <img src={genieMindLogo} alt="Genie Mind" className="h-full w-full object-contain rounded" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Generate Script with AI</h3>
            <p className="text-xs text-muted-foreground">
              Send content to Genie Mind & Spark for analysis
            </p>
          </div>
        </div>

        {/* Flow Visualization - Updated with Spark */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-pink-500" />
            <span className="text-xs font-medium">Vibe</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium">Mind</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium">Spark</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium">Script</span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            <Film className="h-4 w-4 text-pink-500" />
            <span className="text-xs font-medium">Vibe</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={onImportForAnalysis}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Content for Analysis
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>

          {recentRecordings.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Or analyze recent content:</p>
              <div className="grid gap-1.5">
                {recentRecordings.slice(0, 3).map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onAnalyzeContent(item)}
                    className="justify-start gap-2 h-8"
                    disabled={item.hasScript}
                  >
                    {contentTypeIcons[item.type]}
                    <span className="flex-1 text-left truncate">{item.name}</span>
                    {item.hasScript ? (
                      <Badge variant="secondary" className="text-[10px]">Has Script</Badge>
                    ) : (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-[10px] text-muted-foreground text-center">
          AI will analyze your content and generate a script, TTS, and music
        </p>
      </div>
    </Card>
  );
}
