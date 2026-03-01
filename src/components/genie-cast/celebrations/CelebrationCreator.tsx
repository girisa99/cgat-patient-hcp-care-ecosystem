/**
 * CelebrationCreator — 6-Step CREATE Wizard for Celebrations
 *
 * Step 1: Choose Ceremony Type (category tabs + ceremony tiles)
 * Step 2: Choose Region + City (region selector + city input + cultural preview)
 * Step 3: Choose Output Format (format tiles with duration/scene count)
 * Step 4: Personalization (names, date, venue, message, RSVP)
 * Step 5: Style + Upload (visual style picker + upload redesign toggle)
 * Step 6: Review & Generate (full preview + generate button)
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Sparkles, Upload, Search } from 'lucide-react';
import { useCelebrationProduction } from '@/hooks/useCelebrationProduction';
import { useCastContentRegistry } from '@/hooks/useCastContentRegistry';
import { CelebrationUploadPanel } from './CelebrationUploadPanel';
import { getSceneCount, getTargetDuration } from '@/config/celebrations/ceremony-scene-templates';
import { partitionStylesByMatch, getStyleCategoriesForCeremony } from '@/config/style-category-format-map';
import { ALL_STYLES } from '@/config/unified-style-registry';
import type { CeremonyCategory } from '@/config/celebrations/ceremony-type-registry';

/**
 * Fallback styles derived from the code-based unified registry (93 styles).
 * Used when the DB-based `cast_visual_styles` table is empty or unavailable.
 * Maps UnifiedVideoStyle → minimal shape needed for partitioning + rendering.
 */
const FALLBACK_STYLES = ALL_STYLES
  .filter(s => s.castCompatible)
  .map(s => ({
    id: s.id,
    label: s.title,
    description: s.description,
    category: s.category,
    icon: s.icon,
    sort_order: 0,
    sub_sort_order: 0,
    parent_style_id: null as string | null,
    is_active: true,
  }));

interface CelebrationCreatorProps {
  projectId?: string;
  onGenerate?: (result: ReturnType<ReturnType<typeof useCelebrationProduction>['generateProduction']>) => void;
}

const REGION_OPTIONS = [
  { code: 'NAM', name: 'North America' },
  { code: 'EU', name: 'Europe' },
  { code: 'EURASIA', name: 'Eurasia' },
  { code: 'TURKEY', name: 'Turkey' },
  { code: 'MENA', name: 'Middle East & North Africa' },
  { code: 'AFRICA', name: 'Africa' },
  { code: 'INDIA', name: 'India' },
  { code: 'PAKISTAN', name: 'Pakistan' },
  { code: 'BANGLADESH', name: 'Bangladesh' },
  { code: 'SOUTH_ASIA', name: 'South Asia' },
  { code: 'SEA', name: 'Southeast Asia' },
  { code: 'CJK', name: 'China / Japan / Korea' },
  { code: 'LATAM', name: 'Latin America' },
  { code: 'CARIBBEAN', name: 'Caribbean' },
  { code: 'OCEANIA', name: 'Oceania' },
  { code: 'CENTRAL_ASIA', name: 'Central Asia' },
];

export function CelebrationCreator({ projectId, onGenerate }: CelebrationCreatorProps) {
  const {
    categories,
    ceremoniesForCategory,
    selectedCeremony,
    availableFormats,
    culturalPreview,
    scenePreview,
    selection,
    selectCategory,
    selectCeremony,
    selectRegion,
    setCity,
    selectFormat,
    setVisualStyle,
    updatePersonalization,
    updateName,
    setWizardStep,
    searchCeremonies,
    generateProduction,
    isGenerating,
  } = useCelebrationProduction();

  const contentRegistry = useCastContentRegistry();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedSubStyleId, setSelectedSubStyleId] = useState<string | null>(null);
  const searchResults = searchQuery.length > 1 ? searchCeremonies(searchQuery) : [];

  // DB-driven styles with code-based fallback: partition into Best Match / Compatible / More
  // based on 'celebrations' category + selected format + ceremony-specific boost
  const stylePartition = useMemo(() => {
    const dbParentStyles = contentRegistry.visualStyles.filter(s => !s.parent_style_id);
    // Use DB styles if available, otherwise fall back to the 93-style unified registry
    const parentStyles = dbParentStyles.length > 0 ? dbParentStyles : FALLBACK_STYLES;
    if (parentStyles.length === 0) return { recommended: [], compatible: [], other: [] };

    // Base partition against 'celebrations' + selected format
    const formatName = selection.format ?? null;
    const { recommended, compatible, other } = partitionStylesByMatch(
      parentStyles, 'celebrations', formatName
    );

    // Ceremony-specific boost: styles whose category matches the ceremony's preferred categories
    const ceremonyStyleCats = getStyleCategoriesForCeremony(selection.category ?? null);
    if (ceremonyStyleCats.length === 0) return { recommended, compatible, other };

    // Move styles from compatible/other → recommended if their category is ceremony-preferred
    const boosted: typeof parentStyles = [];
    const remainingCompatible: typeof parentStyles = [];
    const remainingOther: typeof parentStyles = [];

    for (const s of compatible) {
      if (ceremonyStyleCats.includes(s.category)) boosted.push(s);
      else remainingCompatible.push(s);
    }
    for (const s of other) {
      if (ceremonyStyleCats.includes(s.category)) boosted.push(s);
      else remainingOther.push(s);
    }

    return {
      recommended: [...recommended, ...boosted],
      compatible: remainingCompatible,
      other: remainingOther,
    };
  }, [contentRegistry.visualStyles, selection.format, selection.category]);

  // Sub-styles for the selected parent style (only available from DB, not fallback)
  const subStyles = useMemo(() => {
    if (!selection.visualStyle) return [];
    return contentRegistry.visualStyles
      .filter(s => s.parent_style_id === selection.visualStyle)
      .sort((a, b) => (a.sub_sort_order ?? 0) - (b.sub_sort_order ?? 0));
  }, [contentRegistry.visualStyles, selection.visualStyle]);

  // Whether we're using the code-based fallback (no DB styles loaded)
  const usingFallbackStyles = contentRegistry.visualStyles.filter(s => !s.parent_style_id).length === 0;

  const handleGenerate = () => {
    const result = generateProduction();
    if (result && onGenerate) {
      onGenerate(result);
    }
  };

  const canProceed = (): boolean => {
    switch (selection.wizardStep) {
      case 1: return !!selection.ceremonyId;
      case 2: return !!selection.regionCode;
      case 3: return !!selection.format;
      case 4: return Object.keys(selection.personalization.names).length > 0;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Wizard Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map(step => (
          <div key={step} className="flex items-center gap-2">
            <button
              onClick={() => step < selection.wizardStep && setWizardStep(step)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === selection.wizardStep
                  ? 'bg-primary text-primary-foreground'
                  : step < selection.wizardStep
                  ? 'bg-primary/20 text-primary cursor-pointer'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </button>
            {step < 6 && <div className={`w-8 h-0.5 ${step < selection.wizardStep ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Ceremony Type */}
      {selection.wizardStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose Celebration Type</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search celebrations (e.g., wedding, birthday, Diwali...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {searchQuery.length > 1 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {searchResults.map(ct => (
                  <button
                    key={ct.id}
                    onClick={() => { selectCeremony(ct.id); setSearchQuery(''); }}
                    className={`p-3 rounded-lg border text-left transition-colors hover:bg-accent ${
                      selection.ceremonyId === ct.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <span className="text-xl">{ct.icon}</span>
                    <p className="text-sm font-medium mt-1">{ct.name}</p>
                    <p className="text-xs text-muted-foreground">{ct.description}</p>
                  </button>
                ))}
              </div>
            ) : (
              <Tabs value={selection.category || ''} onValueChange={(v) => selectCategory(v as CeremonyCategory)}>
                <TabsList className="flex flex-wrap h-auto gap-1">
                  {categories.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                      {cat.icon} {cat.name} ({cat.count})
                    </TabsTrigger>
                  ))}
                </TabsList>
                {categories.map(cat => (
                  <TabsContent key={cat.id} value={cat.id}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                      {ceremoniesForCategory.map(ct => (
                        <button
                          key={ct.id}
                          onClick={() => selectCeremony(ct.id)}
                          className={`p-3 rounded-lg border text-left transition-colors hover:bg-accent ${
                            selection.ceremonyId === ct.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <span className="text-xl">{ct.icon}</span>
                          <p className="text-sm font-medium mt-1">{ct.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{ct.description}</p>
                          {ct.supportsFusion && <Badge variant="outline" className="text-[10px] mt-1">Fusion</Badge>}
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Region + City */}
      {selection.wizardStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose Region & City</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {REGION_OPTIONS.map(r => (
                <button
                  key={r.code}
                  onClick={() => selectRegion(r.code)}
                  className={`p-3 rounded-lg border text-sm transition-colors hover:bg-accent ${
                    selection.regionCode === r.code ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            <div>
              <Label>City (for location-aware visuals)</Label>
              <Input
                placeholder="e.g., Jaipur, Dubai, Tokyo, Mexico City..."
                value={selection.city}
                onChange={e => setCity(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will generate scene backgrounds with your city's landmarks and architecture.
              </p>
            </div>

            {/* Cultural Preview */}
            {culturalPreview && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cultural Preview: {culturalPreview.localName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex gap-2 items-center">
                    <span className="font-medium">Colors:</span>
                    <div className="w-5 h-5 rounded border" style={{ backgroundColor: culturalPreview.colorPalette.primary }} />
                    <div className="w-5 h-5 rounded border" style={{ backgroundColor: culturalPreview.colorPalette.accent }} />
                  </div>
                  <div><span className="font-medium">Symbols:</span> {culturalPreview.symbols.map(s => s.name).join(', ')}</div>
                  <div><span className="font-medium">Music:</span> {culturalPreview.music.genres.join(', ')} ({culturalPreview.music.instruments.join(', ')})</div>
                  <div><span className="font-medium">Attire:</span> {culturalPreview.attire.primary}</div>
                  {culturalPreview.greetingPhrase && <div><span className="font-medium">Greeting:</span> {culturalPreview.greetingPhrase}</div>}
                  {culturalPreview.blessingPhrase && <div><span className="font-medium">Blessing:</span> {culturalPreview.blessingPhrase}</div>}
                  <div><span className="font-medium">Ritual Phases:</span> {culturalPreview.ritualPhases.join(' → ')}</div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Output Format */}
      {selection.wizardStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose Output Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFormats.map(fmt => {
                const sc = selection.ceremonyId ? getSceneCount(selection.ceremonyId, fmt) : 0;
                const dur = selection.ceremonyId ? getTargetDuration(selection.ceremonyId, fmt) : 0;
                const label = fmt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                return (
                  <button
                    key={fmt}
                    onClick={() => selectFormat(fmt)}
                    className={`p-4 rounded-lg border text-left transition-colors hover:bg-accent ${
                      selection.format === fmt ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <p className="text-sm font-medium">{label}</p>
                    <div className="flex gap-2 mt-1">
                      {sc > 0 && <Badge variant="outline" className="text-[10px]">{sc} scenes</Badge>}
                      {dur > 0 && <Badge variant="outline" className="text-[10px]">{dur}s</Badge>}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Personalization */}
      {selection.wizardStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personalization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dynamic name fields based on ceremony roles */}
            {selectedCeremony?.typicalRoles.map(role => {
              if (['narrator', 'officiant', 'performer', 'emcee', 'organizer'].includes(role)) return null;
              const label = role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
              return (
                <div key={role}>
                  <Label>{label} Name</Label>
                  <Input
                    placeholder={`Enter ${label.toLowerCase()} name`}
                    value={selection.personalization.names[role] || ''}
                    onChange={e => updateName(role, e.target.value)}
                  />
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={selection.personalization.eventDate || ''}
                  onChange={e => updatePersonalization({ eventDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Event Time</Label>
                <Input
                  type="time"
                  value={selection.personalization.eventTime || ''}
                  onChange={e => updatePersonalization({ eventTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Venue</Label>
              <Input
                placeholder="Venue name"
                value={selection.personalization.venue || ''}
                onChange={e => updatePersonalization({ venue: e.target.value })}
              />
            </div>

            <div>
              <Label>Custom Message / Quote</Label>
              <Textarea
                placeholder="A special message or quote for the invitation..."
                value={selection.personalization.customMessage || ''}
                onChange={e => updatePersonalization({ customMessage: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>RSVP Details (URL, phone, or email)</Label>
              <Input
                placeholder="https://rsvp.example.com or +1-555-0123"
                value={selection.personalization.rsvpDetails || ''}
                onChange={e => updatePersonalization({ rsvpDetails: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Style + Upload */}
      {selection.wizardStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visual Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Styles partitioned by ceremony relevance (DB-driven with code fallback) */}
            {(stylePartition.recommended.length > 0 || stylePartition.compatible.length > 0 || stylePartition.other.length > 0) ? (
              <div className="space-y-3">
                {stylePartition.recommended.length > 0 && (
                  <div>
                    <Label className="text-xs text-primary font-medium mb-2 block">Best Match</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {stylePartition.recommended.map(style => (
                        <button
                          key={style.id}
                          onClick={() => { setVisualStyle(style.id); setSelectedSubStyleId(null); }}
                          className={`p-3 rounded-lg border text-left transition-colors hover:bg-accent ${
                            selection.visualStyle === style.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <p className="text-sm font-medium">{style.label}</p>
                          <p className="text-xs text-muted-foreground">{style.description || style.category}</p>
                          <Badge variant="outline" className="text-[9px] mt-1">{style.category}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {stylePartition.compatible.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium mb-2 block">Compatible</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {stylePartition.compatible.map(style => (
                        <button
                          key={style.id}
                          onClick={() => { setVisualStyle(style.id); setSelectedSubStyleId(null); }}
                          className={`p-3 rounded-lg border text-left transition-colors hover:bg-accent ${
                            selection.visualStyle === style.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <p className="text-sm font-medium">{style.label}</p>
                          <p className="text-xs text-muted-foreground">{style.description || style.category}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {stylePartition.other.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground font-medium mb-2 block">More Styles</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {stylePartition.other.map(style => (
                        <button
                          key={style.id}
                          onClick={() => { setVisualStyle(style.id); setSelectedSubStyleId(null); }}
                          className={`p-3 rounded-lg border text-left transition-colors hover:bg-accent ${
                            selection.visualStyle === style.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <p className="text-sm font-medium">{style.label}</p>
                          <p className="text-xs text-muted-foreground">{style.description || style.category}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-style selection when a parent is chosen */}
                {subStyles.length > 0 && (
                  <div className="pt-2 border-t">
                    <Label className="text-xs font-medium mb-2 block">Sub-Styles</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {subStyles.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubStyleId(sub.id)}
                          className={`p-2 rounded-lg border text-left transition-colors hover:bg-accent text-xs ${
                            selectedSubStyleId === sub.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <p className="font-medium">{sub.label}</p>
                          {sub.description && <p className="text-muted-foreground mt-0.5">{sub.description}</p>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 border border-dashed rounded-lg text-xs text-muted-foreground">
                Loading styles...
              </div>
            )}

            {/* Upload toggle */}
            {selectedCeremony?.supportsUploadRedesign && (
              <div className="pt-4 border-t">
                <Button
                  variant={showUpload ? 'default' : 'outline'}
                  onClick={() => setShowUpload(!showUpload)}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {showUpload ? 'Hide Upload Panel' : 'Upload Existing Invitation to Redesign'}
                </Button>

                {showUpload && (
                  <div className="mt-4">
                    <CelebrationUploadPanel />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 6: Review & Generate */}
      {selection.wizardStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review & Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Ceremony:</span> {selectedCeremony?.name}</div>
              <div><span className="font-medium">Region:</span> {selection.regionCode} {selection.city ? `(${selection.city})` : ''}</div>
              <div><span className="font-medium">Format:</span> {selection.format?.replace(/_/g, ' ')}</div>
              <div><span className="font-medium">Style:</span> {selection.visualStyle}</div>
              <div><span className="font-medium">Language:</span> {selection.language}</div>
              {culturalPreview && <div><span className="font-medium">Local Name:</span> {culturalPreview.localName}</div>}
            </div>

            {/* Scene preview */}
            {scenePreview && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Scene Structure ({scenePreview.sceneCount} scenes, ~{scenePreview.targetDuration}s):</p>
                <div className="space-y-1">
                  {scenePreview.scenes.map((scene, i) => (
                    <div key={scene.key} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30">
                      <span className="font-mono text-muted-foreground w-4">{i + 1}</span>
                      <span className="font-medium">{scene.title}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">{scene.productionHint.replace(/_/g, ' ')}</Badge>
                      {scene.optional && <Badge variant="secondary" className="text-[10px]">optional</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Names preview */}
            {Object.keys(selection.personalization.names).length > 0 && (
              <div className="text-sm">
                <p className="font-medium">Names:</p>
                {Object.entries(selection.personalization.names).map(([role, name]) => (
                  <span key={role} className="mr-3">{role}: <strong>{name}</strong></span>
                ))}
              </div>
            )}

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Celebration'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setWizardStep(Math.max(1, selection.wizardStep - 1))}
          disabled={selection.wizardStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {selection.wizardStep < 6 && (
          <Button
            onClick={() => setWizardStep(selection.wizardStep + 1)}
            disabled={!canProceed()}
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
