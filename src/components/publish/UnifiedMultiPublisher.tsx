/**
 * UnifiedMultiPublisher - Cross-platform Multi-Platform Publishing
 * 
 * Responsive design that adapts to mobile (bottom sheet), tablet, and desktop (dialog).
 * Includes offline queue support and company page rewards.
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Send,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Building2,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile, useIsMobileOrTablet } from '@/hooks/use-mobile';
import { useOfflinePublishQueue } from '@/hooks/useOfflinePublishQueue';
import { CompanyPageRewardPrompt } from './CompanyPageRewardPrompt';

interface Platform {
  id: string;
  name: string;
  icon?: React.ReactNode;
  color: string;
  connected: boolean;
  isCompanyPage?: boolean;
  accountName?: string;
}

interface UnifiedMultiPublisherProps {
  contentData: any;
  contentTitle?: string;
  contentThumbnail?: string;
  availablePlatforms?: Platform[];
  companyPages?: Array<{ id: string; name: string; platform: string; logoUrl?: string }>;
  onPublish?: (platforms: string[], includeCompanyPages: string[]) => Promise<void>;
  isBetaUser?: boolean;
  currentStreak?: number;
  triggerButton?: React.ReactNode;
}

const DEFAULT_PLATFORMS: Platform[] = [
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600', connected: true, accountName: '@yourprofile' },
  { id: 'twitter', name: 'X (Twitter)', color: 'bg-black', connected: true, accountName: '@yourhandle' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600', connected: true, accountName: 'Your Channel' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-pink-500', connected: true, accountName: '@yourtiktok' },
  { id: 'instagram', name: 'Instagram', color: 'bg-purple-500', connected: false },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-500', connected: true, accountName: 'Your Page' },
];

const PlatformItem: React.FC<{
  platform: Platform;
  selected: boolean;
  onToggle: () => void;
  compact?: boolean;
}> = ({ platform, selected, onToggle, compact }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
      selected
        ? 'border-primary bg-primary/5'
        : platform.connected
        ? 'border-border hover:border-primary/50'
        : 'border-border opacity-50 cursor-not-allowed'
    }`}
    onClick={() => platform.connected && onToggle()}
  >
    <Checkbox
      checked={selected}
      disabled={!platform.connected}
      onCheckedChange={onToggle}
    />
    <div className={`h-8 w-8 rounded-full ${platform.color} flex items-center justify-center text-white`}>
      {platform.icon || <Globe className="h-4 w-4" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm">{platform.name}</p>
      {!compact && platform.accountName && (
        <p className="text-xs text-muted-foreground truncate">{platform.accountName}</p>
      )}
    </div>
    {selected ? (
      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
    ) : !platform.connected ? (
      <Badge variant="outline" className="text-xs shrink-0">Connect</Badge>
    ) : null}
  </motion.div>
);

const PublisherContent: React.FC<{
  contentTitle?: string;
  contentThumbnail?: string;
  availablePlatforms: Platform[];
  selectedPlatforms: string[];
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  isOnline: boolean;
  queuedCount: number;
  isPublishing: boolean;
  publishProgress: number;
  companyPages: Array<{ id: string; name: string; platform: string; logoUrl?: string }>;
  onPublish: () => void;
  onViewQueue?: () => void;
  compact?: boolean;
}> = ({
  contentTitle,
  contentThumbnail,
  availablePlatforms,
  selectedPlatforms,
  setSelectedPlatforms,
  isOnline,
  queuedCount,
  isPublishing,
  publishProgress,
  companyPages,
  onPublish,
  onViewQueue,
  compact,
}) => {
  const connectedPlatforms = useMemo(() => 
    availablePlatforms.filter(p => p.connected), 
    [availablePlatforms]
  );

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const selectAll = () => {
    setSelectedPlatforms(connectedPlatforms.map(p => p.id));
  };

  const deselectAll = () => {
    setSelectedPlatforms([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg ${
        isOnline ? 'bg-green-50 dark:bg-green-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-400">Ready to publish</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700 dark:text-amber-400">Offline - will queue</span>
          </>
        )}
      </div>

      {/* Content Preview */}
      {(contentTitle || contentThumbnail) && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center gap-3">
          {contentThumbnail && (
            <img 
              src={contentThumbnail} 
              alt="Content" 
              className="w-16 h-10 object-cover rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Publishing:</p>
            <p className="font-medium text-sm truncate">{contentTitle}</p>
          </div>
        </div>
      )}

      {/* Platform Selection Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Select Platforms</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7">
            All ({connectedPlatforms.length})
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-7">
            None
          </Button>
        </div>
      </div>

      {/* Platform List */}
      <ScrollArea className={compact ? 'flex-1' : 'h-[300px]'}>
        <div className="space-y-2 pr-4">
          {availablePlatforms.map((platform) => (
            <PlatformItem
              key={platform.id}
              platform={platform}
              selected={selectedPlatforms.includes(platform.id)}
              onToggle={() => togglePlatform(platform.id)}
              compact={compact}
            />
          ))}

          {/* Company Pages Hint */}
          {companyPages.length > 0 && (
            <>
              <Separator className="my-3" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-1">
                      Earn Bonus Credits
                      <Sparkles className="h-4 w-4 text-primary" />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Share on {companyPages.length} company page{companyPages.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </motion.div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Publishing Progress */}
      <AnimatePresence>
        {isPublishing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="my-4"
          >
            <Progress value={publishProgress} className="h-2" />
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Publishing to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        <Button
          size="lg"
          className="w-full gap-2"
          disabled={selectedPlatforms.length === 0 || isPublishing}
          onClick={onPublish}
        >
          {isPublishing ? (
            'Publishing...'
          ) : isOnline ? (
            <>
              <Send className="h-4 w-4" />
              Publish to {selectedPlatforms.length || 'Selected'} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              Queue for Later
            </>
          )}
        </Button>

        {queuedCount > 0 && onViewQueue && (
          <Button variant="outline" className="w-full gap-2" onClick={onViewQueue}>
            <Clock className="h-4 w-4" />
            View Queue ({queuedCount})
          </Button>
        )}
      </div>
    </div>
  );
};

export const UnifiedMultiPublisher: React.FC<UnifiedMultiPublisherProps> = ({
  contentData,
  contentTitle,
  contentThumbnail,
  availablePlatforms = DEFAULT_PLATFORMS,
  companyPages = [],
  onPublish,
  isBetaUser = false,
  currentStreak = 0,
  triggerButton,
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [showRewardPrompt, setShowRewardPrompt] = useState(false);
  
  const { isOnline, addToQueue, queuedCount } = useOfflinePublishQueue();

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return;

    if (companyPages.length > 0) {
      setShowRewardPrompt(true);
      return;
    }

    await executePublish([]);
  };

  const executePublish = async (selectedCompanyPages: string[]) => {
    setIsPublishing(true);
    setPublishProgress(0);

    try {
      if (!isOnline) {
        await addToQueue(contentData, selectedPlatforms);
        setIsPublishing(false);
        setIsOpen(false);
        return;
      }

      const interval = setInterval(() => {
        setPublishProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      if (onPublish) {
        await onPublish(selectedPlatforms, selectedCompanyPages);
      }

      clearInterval(interval);
      setPublishProgress(100);

      setTimeout(() => {
        setIsPublishing(false);
        setIsOpen(false);
        setSelectedPlatforms([]);
        setPublishProgress(0);
      }, 500);
    } catch (error) {
      console.error('[UnifiedPublisher] Publish failed:', error);
      setIsPublishing(false);
    }
  };

  const handleRewardAccept = (pages: string[]) => {
    setShowRewardPrompt(false);
    executePublish(pages);
  };

  const handleRewardDecline = () => {
    setShowRewardPrompt(false);
    executePublish([]);
  };

  const defaultTrigger = (
    <Button size="lg" className="gap-2">
      <Send className="h-5 w-5" />
      Publish
      {queuedCount > 0 && (
        <Badge variant="secondary" className="ml-1">
          {queuedCount} queued
        </Badge>
      )}
    </Button>
  );

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            {triggerButton || defaultTrigger}
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Quick Publish
              </SheetTitle>
              <SheetDescription>
                Publish your content to multiple platforms at once
              </SheetDescription>
            </SheetHeader>

            <PublisherContent
              contentTitle={contentTitle}
              contentThumbnail={contentThumbnail}
              availablePlatforms={availablePlatforms}
              selectedPlatforms={selectedPlatforms}
              setSelectedPlatforms={setSelectedPlatforms}
              isOnline={isOnline}
              queuedCount={queuedCount}
              isPublishing={isPublishing}
              publishProgress={publishProgress}
              companyPages={companyPages}
              onPublish={handlePublish}
              compact
            />
          </SheetContent>
        </Sheet>

        <CompanyPageRewardPrompt
          open={showRewardPrompt}
          onOpenChange={setShowRewardPrompt}
          availablePages={companyPages}
          bonusCredits={5}
          onAccept={handleRewardAccept}
          onDecline={handleRewardDecline}
          contentTitle={contentTitle}
          isBetaUser={isBetaUser}
          currentStreak={currentStreak}
        />
      </>
    );
  }

  // Desktop/Tablet: Dialog
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {triggerButton || defaultTrigger}
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Publish to Platforms
            </DialogTitle>
            <DialogDescription>
              Select platforms and publish your content instantly
            </DialogDescription>
          </DialogHeader>

          <PublisherContent
            contentTitle={contentTitle}
            contentThumbnail={contentThumbnail}
            availablePlatforms={availablePlatforms}
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
            isOnline={isOnline}
            queuedCount={queuedCount}
            isPublishing={isPublishing}
            publishProgress={publishProgress}
            companyPages={companyPages}
            onPublish={handlePublish}
          />
        </DialogContent>
      </Dialog>

      <CompanyPageRewardPrompt
        open={showRewardPrompt}
        onOpenChange={setShowRewardPrompt}
        availablePages={companyPages}
        bonusCredits={5}
        onAccept={handleRewardAccept}
        onDecline={handleRewardDecline}
        contentTitle={contentTitle}
        isBetaUser={isBetaUser}
        currentStreak={currentStreak}
      />
    </>
  );
};

export default UnifiedMultiPublisher;
