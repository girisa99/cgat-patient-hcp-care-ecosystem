/**
 * CONTENT UPLOAD GATE
 * Ensures users accept content guidelines before uploading
 * Prevents adult/harmful content from being uploaded
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertTriangle, Ban, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContentUploadGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  contentType?: 'image' | 'video' | 'audio' | 'document' | 'general';
}

export const ContentUploadGate: React.FC<ContentUploadGateProps> = ({
  open,
  onOpenChange,
  onAccept,
  contentType = 'general',
}) => {
  const [acceptances, setAcceptances] = useState({
    noAdultContent: false,
    noHarmfulContent: false,
    ownershipRights: false,
    contentGuidelines: false,
  });

  const allAccepted = Object.values(acceptances).every(Boolean);

  const handleAccept = () => {
    if (allAccepted) {
      // Store acceptance in session
      sessionStorage.setItem('content_upload_accepted', 'true');
      onAccept();
    }
  };

  const prohibitedContent = [
    { icon: Ban, text: 'Pornographic or sexually explicit material', color: 'text-red-500' },
    { icon: Ban, text: 'Violence, gore, or harmful content', color: 'text-red-500' },
    { icon: Ban, text: 'Hate speech or discriminatory content', color: 'text-red-500' },
    { icon: Ban, text: 'Illegal activities or substances', color: 'text-red-500' },
    { icon: Ban, text: 'Personal information of others without consent', color: 'text-red-500' },
    { icon: Ban, text: 'Copyrighted material without authorization', color: 'text-red-500' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Content Upload Agreement
          </DialogTitle>
          <DialogDescription>
            Before uploading {contentType} content, please review our content policies.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Prohibited Content:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              {prohibitedContent.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <item.icon className={`h-3 w-3 ${item.color}`} />
                  {item.text}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-2 border rounded-lg">
            <Checkbox
              id="no-adult"
              checked={acceptances.noAdultContent}
              onCheckedChange={(checked) => setAcceptances(p => ({ ...p, noAdultContent: !!checked }))}
            />
            <Label htmlFor="no-adult" className="text-sm cursor-pointer">
              I confirm this content does not contain adult, pornographic, or sexually explicit material.
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-2 border rounded-lg">
            <Checkbox
              id="no-harmful"
              checked={acceptances.noHarmfulContent}
              onCheckedChange={(checked) => setAcceptances(p => ({ ...p, noHarmfulContent: !!checked }))}
            />
            <Label htmlFor="no-harmful" className="text-sm cursor-pointer">
              I confirm this content does not promote violence, hate, or illegal activities.
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-2 border rounded-lg">
            <Checkbox
              id="ownership"
              checked={acceptances.ownershipRights}
              onCheckedChange={(checked) => setAcceptances(p => ({ ...p, ownershipRights: !!checked }))}
            />
            <Label htmlFor="ownership" className="text-sm cursor-pointer">
              I have the rights to upload and use this content, including any copyrighted material.
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-2 border rounded-lg">
            <Checkbox
              id="guidelines"
              checked={acceptances.contentGuidelines}
              onCheckedChange={(checked) => setAcceptances(p => ({ ...p, contentGuidelines: !!checked }))}
            />
            <Label htmlFor="guidelines" className="text-sm cursor-pointer">
              I agree to the{' '}
              <Link to="/content-guidelines" target="_blank" className="text-primary underline">
                Content Guidelines
              </Link>{' '}
              and{' '}
              <Link to="/acceptable-use" target="_blank" className="text-primary underline">
                Acceptable Use Policy
              </Link>.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!allAccepted}>
            <CheckCircle className="h-4 w-4 mr-2" />
            I Agree - Continue Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploadGate;
