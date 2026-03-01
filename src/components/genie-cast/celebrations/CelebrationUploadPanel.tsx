/**
 * CelebrationUploadPanel — Upload & Redesign Existing Invitation
 *
 * Drag-and-drop zone → AI extraction → extracted data review → photo upload with consent.
 * Uses useCelebrationUploadRedesign hook for all logic.
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, Image, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useCelebrationUploadRedesign } from '@/hooks/useCelebrationUploadRedesign';

interface CelebrationUploadPanelProps {
  onRedesignReady?: (request: ReturnType<ReturnType<typeof useCelebrationUploadRedesign>['buildRedesignRequest']>) => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
const MAX_FILE_SIZE_MB = 20;
const MAX_PHOTO_SIZE_MB = 10;
const PHOTO_ROLES = ['bride', 'groom', 'couple', 'venue'] as const;
const CONSENT_TEXT = 'I grant permission to use this photo for AI-generated video/image content in my celebration project';

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs',
  '.js', '.jar', '.wsf', '.wsh', '.ps1', '.msi', '.reg',
];
const SUSPICIOUS_PATTERNS = [
  /\.\w+\.\w+$/, // Double extensions like file.pdf.exe
  /[<>:"|?*]/,   // Invalid filename characters
];

/** Validate file before processing — mirrors SecureFileUpload patterns */
function validateUploadFile(
  file: File,
  allowedTypes: string[],
  allowedExtensions: string[],
  maxSizeMB: number,
): { valid: boolean; error?: string } {
  // Extension check
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Dangerous file type: ${ext}` };
  }
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported file type: ${ext}. Use ${allowedExtensions.join(', ')}` };
  }

  // MIME type check
  if (file.type && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}` };
  }

  // Size check
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${maxSizeMB}MB)` };
  }

  // Suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(file.name)) {
      return { valid: false, error: `Suspicious filename pattern: ${file.name}` };
    }
  }

  // Null byte / path traversal
  if (file.name.includes('\0') || file.name.includes('../') || file.name.includes('..\\')) {
    return { valid: false, error: 'Invalid filename detected' };
  }

  return { valid: true };
}

export function CelebrationUploadPanel({ onRedesignReady }: CelebrationUploadPanelProps) {
  const {
    uploadInvitation,
    clearUpload,
    uploadPhoto,
    grantConsent,
    revokeConsent,
    removePhoto,
    updateExtractedField,
    overrideDetectedCeremony,
    overrideDetectedRegion,
    buildRedesignRequest,
    state,
  } = useCelebrationUploadRedesign();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── Upload handlers ──────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const check = validateUploadFile(file, ACCEPTED_TYPES, ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_MB);
    if (!check.valid) {
      setValidationError(check.error ?? 'Invalid file');
      return;
    }
    setValidationError(null);
    uploadInvitation(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateUploadFile(file, ACCEPTED_TYPES, ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_MB);
    if (!check.valid) {
      setValidationError(check.error ?? 'Invalid file');
      return;
    }
    setValidationError(null);
    uploadInvitation(file);
  };

  const handlePhotoUpload = (role: typeof PHOTO_ROLES[number], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateUploadFile(file, ['image/png', 'image/jpeg', 'image/webp'], ['.png', '.jpg', '.jpeg', '.webp'], MAX_PHOTO_SIZE_MB);
    if (!check.valid) {
      setValidationError(check.error ?? 'Invalid photo');
      return;
    }
    setValidationError(null);
    uploadPhoto(role, file);
  };

  const handleBuildRequest = () => {
    const request = buildRedesignRequest();
    if (request && onRedesignReady) {
      onRedesignReady(request);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!state.uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Drop your invitation here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, WebP, PDF (max {MAX_FILE_SIZE_MB}MB)</p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Files are security-validated before processing</span>
          </div>
          {validationError && (
            <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {validationError}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Uploaded file preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
            {state.uploadedFileUrl && (
              <img src={state.uploadedFileUrl} alt="Uploaded invitation" className="w-16 h-16 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{state.uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(state.uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {state.isExtracting && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            {state.extractedData && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {state.extractionError && <AlertCircle className="w-5 h-5 text-destructive" />}
            <Button variant="ghost" size="sm" onClick={clearUpload}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Extraction progress */}
          {state.isExtracting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing invitation with AI vision...
            </div>
          )}

          {/* Extraction error */}
          {state.extractionError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {state.extractionError}
            </div>
          )}

          {/* Extracted Data Review */}
          {state.extractedData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  Extracted Information
                  <Badge variant="outline" className="text-[10px]">
                    {(state.extractedData.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                  {state.detectedLanguage && (
                    <Badge variant="secondary" className="text-[10px]">
                      {state.detectedLanguage.code.toUpperCase()}
                    </Badge>
                  )}
                  {state.extractedData.isMultiLanguage && (
                    <Badge variant="secondary" className="text-[10px]">Multi-language</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Names */}
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(state.extractedData.names).map(([role, name]) => (
                    name ? (
                      <div key={role}>
                        <Label className="text-xs">{role.charAt(0).toUpperCase() + role.slice(1)}</Label>
                        <Input
                          value={name}
                          onChange={e => {
                            const updated = { ...state.extractedData!.names, [role]: e.target.value };
                            updateExtractedField('names', JSON.stringify(updated));
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    ) : null
                  ))}
                </div>

                {/* Event details */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input
                      value={state.extractedData.eventDate}
                      onChange={e => updateExtractedField('eventDate', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Time</Label>
                    <Input
                      value={state.extractedData.eventTime}
                      onChange={e => updateExtractedField('eventTime', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Venue</Label>
                  <Input
                    value={state.extractedData.venue}
                    onChange={e => updateExtractedField('venue', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">City</Label>
                  <Input
                    value={state.extractedData.city}
                    onChange={e => updateExtractedField('city', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                {/* Detected ceremony + region */}
                <div className="flex gap-2">
                  {state.detectedCeremony && (
                    <Badge className="text-xs">Ceremony: {state.detectedCeremony}</Badge>
                  )}
                  {state.detectedRegion && (
                    <Badge variant="outline" className="text-xs">Region: {state.detectedRegion}</Badge>
                  )}
                </div>

                {/* Scripts detected */}
                {state.extractedData.scripts.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Scripts detected: {state.extractedData.scripts.join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Photo Uploads with Consent */}
          {state.extractedData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Upload Photos (Optional)</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Photos will be used as reference for AI-generated scenes.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PHOTO_ROLES.map(role => {
                    const photo = state.photos[role];
                    const consent = role !== 'venue' ? state.photoConsents[role as 'bride' | 'groom' | 'couple'] : null;
                    const label = role.charAt(0).toUpperCase() + role.slice(1);

                    return (
                      <div key={role} className="space-y-2">
                        {photo ? (
                          <div className="relative">
                            <img
                              src={photo.previewUrl}
                              alt={label}
                              className="w-full aspect-square object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => removePhoto(role)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => photoInputRefs.current[role]?.click()}
                            className="w-full aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
                          >
                            <Image className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{label}</span>
                          </button>
                        )}
                        <input
                          ref={el => { photoInputRefs.current[role] = el; }}
                          type="file"
                          accept="image/*"
                          onChange={e => handlePhotoUpload(role, e)}
                          className="hidden"
                        />

                        {/* Consent checkbox for person photos */}
                        {photo && consent && (
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={consent.granted}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  grantConsent(role, CONSENT_TEXT);
                                } else {
                                  revokeConsent(role);
                                }
                              }}
                              className="mt-0.5"
                            />
                            <span className="text-[10px] text-muted-foreground leading-tight">
                              I consent to use this photo for AI content generation
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Build Redesign Button */}
          {state.extractedData && state.detectedCeremony && state.detectedRegion && (
            <Button className="w-full gap-2" onClick={handleBuildRequest}>
              <Upload className="w-4 h-4" />
              Redesign as Cinematic Production
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
