/**
 * Rich Slide Editor - Inline editing with rich text support
 * Supports: HTML content, formatting, slide-specific prompts
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Wand2,
  Check,
  X,
  RefreshCw,
  Loader2,
  Sparkles,
  Type,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresentationSlide, BulletPoint } from './types';

interface RichSlideEditorProps {
  slide: PresentationSlide;
  onUpdate: (slideId: string, updates: Partial<PresentationSlide>) => void;
  onRegenerateWithPrompt: (slideId: string, customPrompt: string) => Promise<void>;
  isRegenerating?: boolean;
  className?: string;
}

export function RichSlideEditor({
  slide,
  onUpdate,
  onRegenerateWithPrompt,
  isRegenerating = false,
  className
}: RichSlideEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [editedContent, setEditedContent] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);

  // Convert bullets to HTML
  const bulletsToHtml = useCallback((bullets?: BulletPoint[]): string => {
    if (!bullets || bullets.length === 0) return '';
    return `<ul>${bullets.map(b => `<li>${b.text}</li>`).join('')}</ul>`;
  }, []);

  // Convert HTML to bullets
  const htmlToBullets = useCallback((html: string): BulletPoint[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const listItems = doc.querySelectorAll('li');
    return Array.from(listItems).map((li, idx) => ({
      id: `bullet-${slide.id}-${idx}`,
      text: li.textContent || ''
    }));
  }, [slide.id]);

  // Initialize editor content
  useEffect(() => {
    if (isEditing) {
      setEditedContent(bulletsToHtml(slide.content.bullets));
    }
  }, [isEditing, slide.content.bullets, bulletsToHtml]);

  // Apply formatting command
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Handle save
  const handleSave = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const bullets = htmlToBullets(html);
      onUpdate(slide.id, {
        content: {
          ...slide.content,
          bullets
        }
      });
    }
    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(bulletsToHtml(slide.content.bullets));
  };

  // Handle regenerate with custom prompt
  const handleRegenerate = async () => {
    if (customPrompt.trim()) {
      await onRegenerateWithPrompt(slide.id, customPrompt);
      setCustomPrompt('');
      setShowPromptInput(false);
    }
  };

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Slide Content Editor</span>
            {slide.content.type && (
              <Badge variant="outline" className="text-[10px]">
                {slide.content.type}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditing(true)}
                  title="Edit content"
                >
                  <Palette className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowPromptInput(!showPromptInput)}
                  title="Modify with prompt"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-green-600"
                  onClick={handleSave}
                  title="Save changes"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleCancel}
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Custom Prompt Input */}
        {showPromptInput && (
          <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Label className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Modify This Slide
            </Label>
            <Textarea
              placeholder="Describe what changes you want... e.g., 'Make it more concise', 'Add more statistics', 'Make it more engaging'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleRegenerate}
                disabled={!customPrompt.trim() || isRegenerating}
                className="text-xs h-7"
              >
                {isRegenerating ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPromptInput(false)}
                className="text-xs h-7"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Rich Text Toolbar (when editing) */}
        {isEditing && (
          <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('bold')}
              title="Bold"
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('italic')}
              title="Italic"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('underline')}
              title="Underline"
            >
              <Underline className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-7 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('insertUnorderedList')}
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('insertOrderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-7 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('formatBlock', 'h1')}
              title="Heading 1"
            >
              <Heading1 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('formatBlock', 'h2')}
              title="Heading 2"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => execCommand('formatBlock', 'blockquote')}
              title="Quote"
            >
              <Quote className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Rich Content Editor */}
        {isEditing ? (
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[120px] p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editedContent) }}
            onInput={(e) => setEditedContent((e.target as HTMLDivElement).innerHTML)}
          />
        ) : (
          <div className="space-y-1">
            {slide.content.bullets?.map((bullet, idx) => (
              <div key={bullet.id} className="flex items-start gap-2 text-sm py-1 px-2 hover:bg-muted/50 rounded">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span 
                  className="flex-1 cursor-text"
                  onClick={() => setIsEditing(true)}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bullet.text) }}
                />
              </div>
            ))}
            {(!slide.content.bullets || slide.content.bullets.length === 0) && (
              <p className="text-xs text-muted-foreground italic">
                No content. Click edit to add bullet points.
              </p>
            )}
          </div>
        )}

        {/* Stats if present */}
        {slide.content.stats && slide.content.stats.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {slide.content.stats.map((stat, idx) => (
              <div key={idx} className="text-center p-2 bg-primary/5 rounded-lg">
                <div className="text-lg font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Journey Steps if present */}
        {slide.content.journeySteps && slide.content.journeySteps.length > 0 && (
          <div className="flex items-start gap-2 overflow-x-auto pb-2 mt-2">
            {slide.content.journeySteps.map((step, idx) => (
              <div 
                key={step.id} 
                className={cn(
                  "flex-shrink-0 w-28 p-2 rounded-lg border text-center",
                  step.status === 'current' && "border-primary bg-primary/5",
                  step.status === 'completed' && "border-green-500/50 bg-green-500/5"
                )}
              >
                <div className="text-sm mb-0.5">{step.icon || `${idx + 1}`}</div>
                <div className="text-[10px] font-medium">{step.title}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
