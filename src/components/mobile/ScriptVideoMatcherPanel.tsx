/**
 * Script-to-Video Matcher Panel
 * UI for matching script segments to video clips using vector embeddings
 * Integrates with Phase 3: Organize/Arrange in Guided Experience
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  FileText, 
  Video, 
  Sparkles, 
  ArrowRight, 
  X, 
  RefreshCw,
  CheckCircle2,
  Link2,
  Layers,
  Shuffle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScriptVideoMatcher, ScriptSegment, VideoClipMeta, MatchResult, MatchingConfig } from '@/hooks/useScriptVideoMatcher';

type MatchingMode = 'transcript' | 'visual' | 'semantic' | 'hybrid';

interface ScriptVideoMatcherPanelProps {
  videoClips?: Array<{ id: string; name: string; url?: string; thumbnailUrl?: string; duration?: number }>;
  onMatchingComplete?: (matches: MatchResult[]) => void;
  onApplyArrangement?: (arrangement: MatchResult[]) => void;
  onClose?: () => void;
  className?: string;
}

export const ScriptVideoMatcherPanel: React.FC<ScriptVideoMatcherPanelProps> = ({
  videoClips = [],
  onMatchingComplete,
  onApplyArrangement,
  onClose,
  className,
}) => {
  const [scriptText, setScriptText] = useState('');
  const [matchMode, setMatchMode] = useState<MatchingMode>('hybrid');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { matchScriptToClips, parseScriptText, optimizeArrangement, isMatching, progress, error } = useScriptVideoMatcher();

  const handleMatch = useCallback(async () => {
    if (!scriptText.trim()) return;

    // Parse script into segments
    const segments: ScriptSegment[] = parseScriptText(scriptText);

    // Convert video clips to the expected format
    const clips: VideoClipMeta[] = videoClips.map(clip => ({
      id: clip.id,
      url: clip.url || '',
      thumbnailUrl: clip.thumbnailUrl,
      duration: clip.duration || 5,
    }));

    const results = await matchScriptToClips(segments, clips, { matchingMode: matchMode });
    setMatches(results);
    onMatchingComplete?.(results);
  }, [scriptText, videoClips, matchMode, matchScriptToClips, parseScriptText, onMatchingComplete]);

  const handleOptimize = useCallback(async () => {
    if (matches.length === 0) return;
    setIsOptimizing(true);
    const optimized = optimizeArrangement(matches);
    setMatches(optimized);
    setIsOptimizing(false);
  }, [matches, optimizeArrangement]);

  const handleApply = useCallback(() => {
    onApplyArrangement?.(matches);
    onClose?.();
  }, [matches, onApplyArrangement, onClose]);

  const modeOptions: { value: MatchingMode; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'transcript', label: 'Transcript', icon: <FileText className="h-3.5 w-3.5" />, description: 'Match by spoken words' },
    { value: 'visual', label: 'Visual', icon: <Video className="h-3.5 w-3.5" />, description: 'Match by scene content' },
    { value: 'semantic', label: 'Semantic', icon: <Sparkles className="h-3.5 w-3.5" />, description: 'Match by meaning' },
    { value: 'hybrid', label: 'Hybrid', icon: <Layers className="h-3.5 w-3.5" />, description: 'Best of all methods' },
  ];

  return (
    <Card className={cn("w-full bg-card/95 backdrop-blur-sm shadow-xl border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-sm">Script-to-Video Matcher</CardTitle>
              <p className="text-xs text-muted-foreground">AI-powered matching using vector embeddings</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid grid-cols-2 h-8">
            <TabsTrigger value="script" className="text-xs">
              <FileText className="h-3 w-3 mr-1" /> Script
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Results ({matches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="space-y-3 mt-3">
            {/* Script Input */}
            <Textarea
              placeholder="Paste your script here... Each paragraph will be matched to the best video clip."
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="min-h-[120px] text-sm resize-none"
            />

            {/* Matching Mode */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Matching Mode</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {modeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMatchMode(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all",
                      matchMode === option.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    {option.icon}
                    <span className="text-xs font-medium">{option.label}</span>
                    <span className="text-[9px] text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Clips Preview */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Available Clips ({videoClips.length})
              </p>
              <ScrollArea className="h-20">
                <div className="flex gap-2">
                  {videoClips.map((clip) => (
                    <div
                      key={clip.id}
                      className="shrink-0 w-16 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden"
                    >
                      {clip.thumbnailUrl ? (
                        <img src={clip.thumbnailUrl} alt={clip.name} className="w-full h-full object-cover" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                    </div>
                  ))}
                  {videoClips.length === 0 && (
                    <p className="text-xs text-muted-foreground">No video clips available</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Progress */}
            {isMatching && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Matching...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            {/* Match Button */}
            <Button
              className="w-full"
              onClick={handleMatch}
              disabled={!scriptText.trim() || videoClips.length === 0 || isMatching}
            >
              {isMatching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Match Script to Videos
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="results" className="space-y-3 mt-3">
            {matches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No matches yet</p>
                <p className="text-xs">Add a script and click match</p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-2">
                    {matches.map((match, index) => (
                      <div
                        key={match.segmentId}
                        onClick={() => setSelectedMatch(match.segmentId)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          selectedMatch === match.segmentId
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {index + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs line-clamp-2 mb-1">Segment: {match.segmentId}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Clip: {match.clipId.slice(0, 8)}...
                              </span>
                              <ArrowRight className="h-3 w-3" />
                              <Badge 
                                variant={match.confidence > 70 ? "default" : "secondary"}
                                className="text-[9px]"
                              >
                                {Math.round(match.confidence)}% match
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    {isOptimizing ? 'Optimizing...' : 'Optimize Order'}
                  </Button>
                  <Button className="flex-1" onClick={handleApply}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Apply Arrangement
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScriptVideoMatcherPanel;
