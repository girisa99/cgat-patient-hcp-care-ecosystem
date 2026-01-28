/**
 * MobileMultiPublisher - One-tap multi-platform publishing for mobile
 * 
 * Optimized mobile UI for selecting platforms and publishing in one action.
 * Includes offline queue support and reward prompts for company pages.
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Send,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Building2,
  Globe,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflinePublishQueue } from '@/hooks/useOfflinePublishQueue';
import { CompanyPageRewardPrompt } from './CompanyPageRewardPrompt';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  isCompanyPage?: boolean;
}

interface MobileMultiPublisherProps {
  contentData: any;
  contentTitle?: string;
  availablePlatforms?: Platform[];
  companyPages?: Array<{ id: string; name: string; platform: string; logoUrl?: string }>;
  onPublish?: (platforms: string[], includeCompanyPages: string[]) => Promise<void>;
  isBetaUser?: boolean;
  currentStreak?: number;
}

const DEFAULT_PLATFORMS: Platform[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-600', connected: true },
  { id: 'twitter', name: 'X (Twitter)', icon: <Globe className="h-4 w-4" />, color: 'bg-black', connected: true },
  { id: 'youtube', name: 'YouTube', icon: <Globe className="h-4 w-4" />, color: 'bg-red-600', connected: true },
  { id: 'tiktok', name: 'TikTok', icon: <Globe className="h-4 w-4" />, color: 'bg-pink-500', connected: true },
  { id: 'instagram', name: 'Instagram', icon: <Globe className="h-4 w-4" />, color: 'bg-purple-500', connected: false },
  { id: 'facebook', name: 'Facebook', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500', connected: true },
];

export const MobileMultiPublisher: React.FC<MobileMultiPublisherProps> = ({
  contentData,
  contentTitle,
  availablePlatforms = DEFAULT_PLATFORMS,
  companyPages = [],
  onPublish,
  isBetaUser = false,
  currentStreak = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [showRewardPrompt, setShowRewardPrompt] = useState(false);
  
  const { isOnline, addToQueue, queuedCount } = useOfflinePublishQueue();

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

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return;

    // Show reward prompt if company pages available
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
        // Queue for later
        await addToQueue(contentData, selectedPlatforms);
        setIsPublishing(false);
        setIsOpen(false);
        return;
      }

      // Simulate progress
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
      console.error('[MobilePublisher] Publish failed:', error);
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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="lg" 
            className="w-full gap-2 h-14 text-lg"
          >
            <Send className="h-5 w-5" />
            Publish
            {queuedCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {queuedCount} queued
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Quick Publish
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>Connected - ready to publish</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-amber-500" />
                  <span>Offline - will queue for later</span>
                </>
              )}
            </SheetDescription>
          </SheetHeader>

          {/* Content preview */}
          {contentTitle && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Publishing:</p>
              <p className="font-medium truncate">{contentTitle}</p>
            </div>
          )}

          {/* Platform selection */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Select Platforms</p>
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All ({connectedPlatforms.length})
            </Button>
          </div>

          <ScrollArea className="h-[40vh] pr-4">
            <div className="space-y-2">
              <AnimatePresence>
                {availablePlatforms.map((platform, index) => (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-primary bg-primary/5'
                        : platform.connected
                        ? 'border-border hover:border-primary/50'
                        : 'border-border opacity-50'
                    }`}
                    onClick={() => platform.connected && togglePlatform(platform.id)}
                  >
                    <Checkbox
                      checked={selectedPlatforms.includes(platform.id)}
                      disabled={!platform.connected}
                      onCheckedChange={() => togglePlatform(platform.id)}
                    />
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {platform.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {platform.connected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                    {selectedPlatforms.includes(platform.id) && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Company pages hint */}
            {companyPages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-1">
                      Earn Bonus Credits
                      <Sparkles className="h-4 w-4 text-primary" />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Share on {companyPages.length} company page{companyPages.length > 1 ? 's' : ''} for rewards
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </ScrollArea>

          {/* Publishing progress */}
          {isPublishing && (
            <div className="my-4">
              <Progress value={publishProgress} className="h-2" />
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Publishing to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 space-y-3">
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2"
              disabled={selectedPlatforms.length === 0 || isPublishing}
              onClick={handlePublish}
            >
              {isPublishing ? (
                <>Publishing...</>
              ) : isOnline ? (
                <>
                  <Send className="h-5 w-5" />
                  Publish to {selectedPlatforms.length || 'Selected'} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5" />
                  Queue for Later
                </>
              )}
            </Button>

            {queuedCount > 0 && (
              <Button variant="outline" size="lg" className="w-full gap-2">
                <Clock className="h-4 w-4" />
                View Queue ({queuedCount})
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Reward Prompt Dialog */}
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

export default MobileMultiPublisher;
