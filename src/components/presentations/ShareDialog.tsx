import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Linkedin, Twitter, Copy, ExternalLink, 
  Check, Mail, QrCode, Share2, ClipboardCopy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Presentation {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  thumbnail_url: string | null;
  og_image_url: string | null;
  linkedin_post_template: string | null;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presentation: Presentation;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  presentation
}) => {
  const [copied, setCopied] = useState(false);
  const [postContent, setPostContent] = useState(
    presentation.linkedin_post_template || 
    `🚀 Check out this presentation: ${presentation.name}\n\n${presentation.description || ''}\n\n#Presentation #AI #Healthcare`
  );

  // Use production URL for sharing
  const productionDomain = 'https://genieaiexpermentationhub.com';
  const publicUrl = `${productionDomain}/public/presentation/${presentation.slug}`;
  
  // Static share page URL for proper OG tag support
  const sharePageUrl = `${productionDomain}/share/${presentation.slug}.html`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const copyFullPost = async () => {
    try {
      const fullPost = `${postContent}\n\n🔗 ${publicUrl}`;
      await navigator.clipboard.writeText(fullPost);
      toast.success('Post content + URL copied! Paste it in LinkedIn.');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const shareToLinkedIn = async () => {
    // First copy the post content to clipboard
    const fullPost = `${postContent}\n\n🔗 ${publicUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullPost);
      toast.success('✅ Post copied to clipboard! Paste it in LinkedIn.', {
        duration: 5000,
        description: 'The post content has been copied. Just paste (Ctrl+V) in the LinkedIn composer.'
      });
    } catch (err) {
      console.error('Clipboard error:', err);
    }

    // Open LinkedIn share dialog with the static share page URL (has proper OG tags)
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePageUrl)}`;
    window.open(linkedInShareUrl, '_blank', 'width=600,height=600');
    
    trackShare('linkedin');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${presentation.name}\n\n${postContent.slice(0, 200)}`);
    const url = encodeURIComponent(publicUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
    trackShare('twitter');
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Check out: ${presentation.name}`);
    const body = encodeURIComponent(`${postContent}\n\nView presentation: ${publicUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackShare('email');
  };

  const trackShare = async (platform: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('presentation_shares').insert({
          presentation_id: presentation.id,
          user_id: user.user.id,
          platform,
          share_url: publicUrl,
          post_content: postContent,
          status: 'shared'
        });

        // Update share count manually
        const { data: currentPres } = await supabase
          .from('presentations')
          .select('share_count')
          .eq('id', presentation.id)
          .single();
        
        if (currentPres) {
          await supabase
            .from('presentations')
            .update({ share_count: (currentPres.share_count || 0) + 1 })
            .eq('id', presentation.id);
        }
      }
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Presentation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="linkedin" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="linkedin" className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">How LinkedIn Sharing Works:</h4>
              <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                <li>Click "Share on LinkedIn" below</li>
                <li>Your post content is copied to clipboard</li>
                <li>LinkedIn opens → <strong>Paste (Ctrl+V)</strong> your content</li>
                <li>LinkedIn will show the preview card with image</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label>Your LinkedIn Post</Label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={5}
                placeholder="Write your post content..."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {postContent.length}/3000 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={shareToLinkedIn}
                className="flex-1 gap-2 bg-[#0A66C2] hover:bg-[#004182]"
              >
                <Linkedin className="w-4 h-4" />
                Share on LinkedIn
              </Button>
              <Button
                onClick={copyFullPost}
                variant="outline"
                className="gap-2"
              >
                <ClipboardCopy className="w-4 h-4" />
                Copy Post
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              The preview image will appear after you paste the link
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Public Link</Label>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="flex-1 font-mono text-sm" />
                <Button onClick={copyLink} variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>OG Image Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-muted/50">
                {presentation.og_image_url || presentation.thumbnail_url ? (
                  <img 
                    src={presentation.og_image_url || presentation.thumbnail_url || ''} 
                    alt="OG Preview"
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <QrCode className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No thumbnail set</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                This image will appear when sharing to social media
              </p>
            </div>

            <Button onClick={() => window.open(publicUrl, '_blank')} className="w-full gap-2">
              <ExternalLink className="w-4 h-4" />
              Open Presentation
            </Button>
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={shareToTwitter}
                variant="outline"
                className="gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter/X
              </Button>
              
              <Button 
                onClick={shareByEmail}
                variant="outline"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Manual Sharing Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Copy the post content below</li>
                  <li>Go to your preferred social platform</li>
                  <li>Create a new post and paste</li>
                  <li>The link preview will load automatically</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label>Copy Full Post</Label>
                <div className="relative">
                  <Textarea
                    value={`${postContent}\n\n🔗 ${publicUrl}`}
                    readOnly
                    rows={5}
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={copyFullPost}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};