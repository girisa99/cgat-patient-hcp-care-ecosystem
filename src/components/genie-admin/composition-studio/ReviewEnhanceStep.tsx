/**
 * REVIEW & ENHANCE STEP
 * 
 * Dedicated step between Create and Publish for:
 * - Full project preview
 * - Per-chapter approval/rejection
 * - Quality scoring
 * - Selective regeneration
 * - Final adjustments before publishing
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2, XCircle, AlertCircle, Play, Pause,
  ThumbsUp, ThumbsDown, MessageSquare, Download,
  Send, ArrowLeft, ArrowRight, Sparkles, RefreshCw,
  Eye, Edit2, Loader2, FileCheck, Clock, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChapterPreviewPanel } from './ChapterPreviewPanel';

interface ChapterAssets {
  script?: { content?: string; status: string };
  audio?: { url?: string; base64?: string; status: string; provider?: string };
  video?: { url?: string; status: string; provider?: string };
  music?: { url?: string; base64?: string; status: string };
}

interface ReviewChapter {
  id: string;
  title: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  feedback?: string;
  qualityScore?: number;
  assets: ChapterAssets;
}

interface ReviewEnhanceStepProps {
  projectName: string;
  chapters: ReviewChapter[];
  languages: string[];
  primaryLanguage: string;
  onChapterApprove: (chapterId: string) => void;
  onChapterReject: (chapterId: string, feedback: string) => void;
  onChapterRegenerate: (chapterId: string, assetType: 'script' | 'audio' | 'video' | 'music') => Promise<void>;
  onUpdateScript: (chapterId: string, newScript: string) => void;
  onBack: () => void;
  onPublish: () => void;
  className?: string;
}

export const ReviewEnhanceStep: React.FC<ReviewEnhanceStepProps> = ({
  projectName,
  chapters,
  languages,
  primaryLanguage,
  onChapterApprove,
  onChapterReject,
  onChapterRegenerate,
  onUpdateScript,
  onBack,
  onPublish,
  className,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(chapters[0]?.id || null);
  const [feedbackDialog, setFeedbackDialog] = useState<{ chapterId: string; open: boolean }>({ chapterId: '', open: false });
  const [feedbackText, setFeedbackText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'detail'>('overview');

  // Stats
  const stats = useMemo(() => {
    const approved = chapters.filter(c => c.status === 'approved').length;
    const rejected = chapters.filter(c => c.status === 'rejected' || c.status === 'needs_revision').length;
    const pending = chapters.filter(c => c.status === 'pending').length;
    const avgQuality = chapters.reduce((acc, c) => acc + (c.qualityScore || 0), 0) / chapters.length || 0;
    
    return { approved, rejected, pending, avgQuality, total: chapters.length };
  }, [chapters]);

  const canPublish = stats.approved === stats.total;
  const selectedChapterData = chapters.find(c => c.id === selectedChapter);

  const handleReject = () => {
    if (feedbackDialog.chapterId && feedbackText.trim()) {
      onChapterReject(feedbackDialog.chapterId, feedbackText);
      setFeedbackDialog({ chapterId: '', open: false });
      setFeedbackText('');
      toast.info('Chapter marked for revision');
    }
  };

  const getStatusIcon = (status: ReviewChapter['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
      case 'needs_revision':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: ReviewChapter['status']) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'needs_revision': return 'Needs Revision';
      default: return 'Pending Review';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Review & Enhance
          </h2>
          <p className="text-sm text-muted-foreground">
            Review generated content before publishing
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{projectName}</p>
            <p className="text-xs text-muted-foreground">
              {languages.length} language{languages.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Approved</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.approved}/{stats.total}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium">Needs Work</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.rejected}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">Quality</span>
          </div>
          <p className="text-2xl font-bold mt-1">{Math.round(stats.avgQuality)}%</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Review Progress</span>
          <span>{Math.round((stats.approved / stats.total) * 100)}% Complete</span>
        </div>
        <Progress value={(stats.approved / stats.total) * 100} className="h-2" />
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'detail')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detail">Detail View</TabsTrigger>
        </TabsList>

        {/* Overview Tab - All chapters at a glance */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                  selectedChapter === chapter.id && "ring-2 ring-primary",
                  chapter.status === 'approved' && "border-green-200 bg-green-50/50",
                  (chapter.status === 'rejected' || chapter.status === 'needs_revision') && "border-red-200 bg-red-50/50"
                )}
                onClick={() => {
                  setSelectedChapter(chapter.id);
                  setActiveTab('detail');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Ch. {index + 1}
                  </Badge>
                  {getStatusIcon(chapter.status)}
                </div>
                <h4 className="font-medium text-sm truncate">{chapter.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {chapter.duration}s • {getStatusLabel(chapter.status)}
                </p>
                {chapter.qualityScore && (
                  <div className="mt-2">
                    <Progress value={chapter.qualityScore} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Quality: {chapter.qualityScore}%
                    </p>
                  </div>
                )}
                {chapter.feedback && (
                  <p className="text-xs text-red-600 mt-2 truncate">
                    💬 {chapter.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                chapters.forEach(c => {
                  if (c.status === 'pending') onChapterApprove(c.id);
                });
              }}
              disabled={stats.pending === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve All Pending ({stats.pending})
            </Button>
          </div>
        </TabsContent>

        {/* Detail Tab - Per-chapter review */}
        <TabsContent value="detail" className="space-y-4">
          {/* Chapter Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {chapters.map((chapter, index) => (
              <Button
                key={chapter.id}
                size="sm"
                variant={selectedChapter === chapter.id ? 'default' : 'outline'}
                onClick={() => setSelectedChapter(chapter.id)}
                className="flex-shrink-0 gap-2"
              >
                {getStatusIcon(chapter.status)}
                Ch. {index + 1}
              </Button>
            ))}
          </div>

          {/* Selected Chapter Preview */}
          {selectedChapterData && (
            <ChapterPreviewPanel
              chapterId={selectedChapterData.id}
              chapterTitle={selectedChapterData.title}
              chapterIndex={chapters.findIndex(c => c.id === selectedChapterData.id)}
              assets={selectedChapterData.assets as any}
              languages={languages}
              onRegenerate={onChapterRegenerate}
              onUpdateScript={onUpdateScript}
              onApprove={() => onChapterApprove(selectedChapterData.id)}
              onReject={() => setFeedbackDialog({ chapterId: selectedChapterData.id, open: true })}
            />
          )}

          {/* Chapter Navigation Arrows */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={!selectedChapter || chapters.findIndex(c => c.id === selectedChapter) === 0}
              onClick={() => {
                const currentIndex = chapters.findIndex(c => c.id === selectedChapter);
                if (currentIndex > 0) {
                  setSelectedChapter(chapters[currentIndex - 1].id);
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button
              variant="outline"
              disabled={!selectedChapter || chapters.findIndex(c => c.id === selectedChapter) === chapters.length - 1}
              onClick={() => {
                const currentIndex = chapters.findIndex(c => c.id === selectedChapter);
                if (currentIndex < chapters.length - 1) {
                  setSelectedChapter(chapters[currentIndex + 1].id);
                }
              }}
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Studio
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Preview
          </Button>
          <Button
            disabled={!canPublish}
            onClick={onPublish}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {canPublish ? 'Publish Content' : `Review ${stats.pending + stats.rejected} chapters`}
          </Button>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog({ ...feedbackDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Describe what needs to be improved for this chapter.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="e.g., Script needs to be more concise, audio quality is too low..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialog({ chapterId: '', open: false })}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={!feedbackText.trim()}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewEnhanceStep;
