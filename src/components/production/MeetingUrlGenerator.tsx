/**
 * Meeting URL Generator Component
 * Provides options to auto-generate or connect to external platforms
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RefreshCw, ExternalLink, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  MeetingPlatform, 
  MEETING_PLATFORMS, 
  generateMeetingUrl,
  generateAutoMeetingUrl,
} from '@/utils/meetingUrlGenerator';

interface MeetingUrlGeneratorProps {
  showId: string;
  currentUrl?: string;
  onUrlChange: (url: string, platform: MeetingPlatform) => void;
  scheduledDate?: string;
  compact?: boolean;
}

export function MeetingUrlGenerator({
  showId,
  currentUrl = '',
  onUrlChange,
  scheduledDate,
  compact = false,
}: MeetingUrlGeneratorProps) {
  const [platform, setPlatform] = useState<MeetingPlatform>('auto');
  const [customUrl, setCustomUrl] = useState(currentUrl);
  const [googleMeetCode, setGoogleMeetCode] = useState('');
  const [zoomMeetingId, setZoomMeetingId] = useState('');
  const [zoomPasscode, setZoomPasscode] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState(currentUrl);
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    const result = generateMeetingUrl(showId, {
      platform,
      customUrl,
      googleMeetCode,
      zoomMeetingId,
      zoomPasscode,
    });
    
    setGeneratedUrl(result.url);
    onUrlChange(result.url, platform);
    toast.success('Meeting URL generated - routes to Genie Vibe Studio');
  };

  const handleAutoGenerate = () => {
    const url = generateAutoMeetingUrl(showId);
    setGeneratedUrl(url);
    onUrlChange(url, 'auto');
    toast.success('Genie Vibe meeting URL generated!');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Meeting URL (or generate one)"
            value={generatedUrl || customUrl}
            onChange={(e) => {
              setCustomUrl(e.target.value);
              onUrlChange(e.target.value, 'custom');
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoGenerate}
            title="Auto-generate URL"
          >
            <Zap className="h-4 w-4" />
          </Button>
          {generatedUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {MEETING_PLATFORMS.map((p) => (
            <Badge
              key={p.id}
              variant={platform === p.id ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setPlatform(p.id)}
            >
              <span className="mr-1">{p.icon}</span>
              {p.label.split(' ')[0]}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Meeting Platform
      </Label>
      
      <RadioGroup 
        value={platform} 
        onValueChange={(v) => setPlatform(v as MeetingPlatform)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {MEETING_PLATFORMS.map((p) => (
          <Card
            key={p.id}
            className={cn(
              "p-3 cursor-pointer transition-colors",
              platform === p.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
            )}
            onClick={() => setPlatform(p.id)}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem value={p.id} id={p.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={p.id} className="cursor-pointer font-medium flex items-center gap-2">
                  <span>{p.icon}</span>
                  {p.label}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </RadioGroup>

      {/* Platform-specific inputs */}
      {platform === 'google_meet' && (
        <div className="space-y-2 pl-4 border-l-2 border-primary/30">
          <Label htmlFor="google_code" className="text-sm">Google Meet Code (optional)</Label>
          <Input
            id="google_code"
            placeholder="abc-defg-hij"
            value={googleMeetCode}
            onChange={(e) => setGoogleMeetCode(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to create a new meeting via Google Calendar
          </p>
        </div>
      )}

      {platform === 'zoom' && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/30">
          <div className="space-y-2">
            <Label htmlFor="zoom_id" className="text-sm">Meeting ID</Label>
            <Input
              id="zoom_id"
              placeholder="123 456 7890"
              value={zoomMeetingId}
              onChange={(e) => setZoomMeetingId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zoom_pass" className="text-sm">Passcode (optional)</Label>
            <Input
              id="zoom_pass"
              placeholder="abc123"
              value={zoomPasscode}
              onChange={(e) => setZoomPasscode(e.target.value)}
            />
          </div>
        </div>
      )}

      {platform === 'teams' && (
        <div className="space-y-2 pl-4 border-l-2 border-primary/30">
          <Label htmlFor="teams_url" className="text-sm">Teams Meeting URL</Label>
          <Input
            id="teams_url"
            placeholder="https://teams.microsoft.com/l/meetup-join/..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        </div>
      )}

      {platform === 'custom' && (
        <div className="space-y-2 pl-4 border-l-2 border-primary/30">
          <Label htmlFor="custom_url" className="text-sm">Custom Meeting URL</Label>
          <Input
            id="custom_url"
            placeholder="https://your-meeting-platform.com/join/..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        </div>
      )}

      {/* Generate button */}
      <div className="flex gap-2">
        <Button onClick={handleGenerateUrl} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          {platform === 'auto' ? 'Generate URL' : 'Apply URL'}
        </Button>
      </div>

      {/* Generated URL display */}
      {generatedUrl && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Generated Meeting URL:</p>
            <p className="text-sm font-mono truncate">{generatedUrl}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopyUrl}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.open(generatedUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default MeetingUrlGenerator;
