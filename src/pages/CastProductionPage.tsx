/**
 * CastProductionPage — Generic Cast Production Page
 *
 * Config-driven production page that works for ANY Cast project type:
 * video, podcast, educational, UGC, documentary, animation.
 *
 * All config comes from DB (not hardcoded imports):
 * - Characters from cast_project_characters
 * - Scenes from cast_project_scenes
 * - Script lines from cast_project_script_lines
 * - Voice configs from character voice_config JSONB
 * - Pipelines from scene_config.pipeline JSONB
 *
 * Renders the same 5-phase production UI:
 * Phase 1: TTS Generation
 * Phase 2: TTS Approval
 * Phase 3: Visual Asset Generation
 * Phase 4: Music & SFX
 * Phase 5: Assembly + Polling
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play, Pause, Square, Loader2, CheckCircle2, AlertCircle,
  Mic, Film, Music, Clapperboard, Download, RefreshCw, ArrowLeft,
  Zap, XCircle, Wand2, Image,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Generic production hooks
import {
  useProductionPhaseManager,
  useTtsGeneration,
  useVisualGeneration,
  useMusicSfxGeneration,
  useAssemblyPipeline,
} from '@/hooks/cast-production';
import type { VoiceConfig, ScriptLineData, VisualGenerationConfig, MusicSfxConfig, AssemblySceneData } from '@/hooks/cast-production';
import { seedProjectFromTemplate, isProjectSeeded, type ProjectTemplate } from '@/utils/seedProjectFromTemplate';

// Credit enforcement
import { useAICredits } from '@/hooks/useAICredits';

// Content moderation (M1)
import { complianceCheckService } from '@/services/complianceCheckService';

// Pipeline overhaul: config-driven generation
import {
  generateProjectPipeline,
  type CastProjectConfig,
  type CastIndustry,
  type CastFormat,
  type CastTone,
  type CastQuality,
  type CastAudience,
} from '@/services/cast/projectPipelineGenerator';
import { composeMusicPrompt, composeSfxPrompts } from '@/config/musicAutoComposer';
import { getScriptTemplate, scaleTemplateToDuration } from '@/config/scriptTemplates';
import { generateScriptStructure, buildScriptGenerationPrompt, generateScriptContent, type ScriptGenerationInput } from '@/services/cast/scriptAutoGenerator';

// Centralized config + consent gates (M3 resolution, M6 GDPR/HIPAA)
import { CAST_RESOLUTIONS, DEFAULT_RESOLUTION, CAST_LIMITS, requiresConsentGate, getConsentTypes, type CastResolution } from '@/config/castProductionConfig';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DbCharacter {
  id: string;
  character_key: string;
  display_name: string;
  role_description: string;
  voice_provider: string;
  voice_id: string;
  avatar_url: string | null;
  color_class: string | null;
  voice_config: Record<string, unknown> | null;
}

interface DbScene {
  id: string;
  scene_key: string;
  title: string;
  scene_index: number;
  scene_config: Record<string, unknown> | null;
}

interface DbScriptLine {
  id: string;
  line_key: string;
  line_index: number;
  character_id: string;
  scene_id: string | null;
  dialogue: string;
  direction: string | null;
  duration_hint: string | null;
  sfx_tags: string[] | null;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CastProductionPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // ─── DB data loading ──────────────────────────────────────────────────
  const [characters, setCharacters] = useState<DbCharacter[]>([]);
  const [scenes, setScenes] = useState<DbScene[]>([]);
  const [scriptLines, setScriptLines] = useState<DbScriptLine[]>([]);
  const [projectTitle, setProjectTitle] = useState('Cast Production');
  const [projectLanguage, setProjectLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // M3: User-configurable output resolution
  const [outputResolution, setOutputResolution] = useState<CastResolution>(DEFAULT_RESOLUTION);

  // M6: GDPR/HIPAA consent tracking (industry-driven)
  const [consentAcknowledged, setConsentAcknowledged] = useState<Record<string, boolean>>({});
  const [projectIndustry, setProjectIndustry] = useState<string>('general');

  // Load project data from DB
  useEffect(() => {
    if (!projectId) {
      setLoadError('No project ID provided');
      setIsLoading(false);
      return;
    }

    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
      setLoadError('Loading timed out after 30 seconds');
    }, 30000);

    (async () => {
      try {
        // Load project metadata (lean query — no JSONB)
        // Security: RLS policy on cast_projects enforces auth.uid() = user_id
        // This query will return null if the user doesn't own the project (RLS blocks it)
        const { data: project } = await supabase
          .from('cast_projects')
          .select('id, title, status, quality, selected_dialects, target_regions, content_type, style_intent')
          .eq('id', projectId)
          .maybeSingle();

        if (!project) {
          setLoadError('Project not found or access denied');
          setIsLoading(false);
          clearTimeout(loadTimeout);
          return;
        }
        setProjectTitle(project.title || 'Cast Production');
        // Resolve language from selected_dialects (first entry) or default
        const dialects = project.selected_dialects as string[] | null;
        if (dialects && dialects.length > 0) {
          setProjectLanguage(dialects[0]);
        }
        // M6: Extract industry from style_intent (format: "industry-format-auto")
        const styleIntent = (project as any).style_intent as string | null;
        if (styleIntent) {
          const industry = styleIntent.split('-')[0];
          if (industry) setProjectIndustry(industry);
        }

        // Load characters, scenes (metadata only), and script lines in parallel
        const [charsRes, scenesRes, linesRes] = await Promise.all([
          supabase.from('cast_project_characters')
            .select('id, character_key, display_name, role_description, voice_provider, voice_id, avatar_url, color_class, voice_config')
            .eq('project_id', projectId),
          supabase.from('cast_project_scenes')
            .select('id, scene_key, title, scene_index, scene_config')
            .eq('project_id', projectId)
            .order('scene_index'),
          supabase.from('cast_project_script_lines')
            .select('id, line_key, line_index, character_id, scene_id, dialogue, direction, duration_hint, sfx_tags')
            .eq('project_id', projectId)
            .order('line_index'),
        ]);

        setCharacters((charsRes.data || []) as any);
        setScenes(scenesRes.data || []);
        setScriptLines(linesRes.data || []);

        if ((scenesRes.data?.length || 0) === 0) {
          console.warn('[CastProduction] No scenes found — project may need seeding');
        }
      } catch (err: any) {
        console.error('[CastProduction] Load error:', err);
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
        clearTimeout(loadTimeout);
      }
    })();

    return () => clearTimeout(loadTimeout);
  }, [projectId]);

  // ─── Derived config from DB data ──────────────────────────────────────

  const voiceConfigMap = useMemo<Record<string, VoiceConfig>>(() => {
    const map: Record<string, VoiceConfig> = {};
    for (const char of characters) {
      const vc = char.voice_config || {};
      map[char.character_key] = {
        provider: char.voice_provider,
        voiceId: char.voice_id,
        stability: vc.stability as number | undefined,
        similarityBoost: vc.similarityBoost as number | undefined,
        rate: vc.rate as string | undefined,
        pitch: vc.pitch as string | undefined,
        speed: vc.speed as number | undefined,
        style: vc.style as string | undefined,
        fallbackProvider: vc.fallbackProvider as string | undefined,
        fallbackVoice: vc.fallbackVoice as Record<string, unknown> | undefined,
      };
    }
    return map;
  }, [characters]);

  // Build scene UUID → scene_key lookup
  const sceneIdToKey = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of scenes) map[s.id] = s.scene_key;
    return map;
  }, [scenes]);

  // Build character UUID → character_key lookup (for display)
  const charIdToKey = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of characters) map[c.id] = c.character_key;
    return map;
  }, [characters]);

  const scriptLineData = useMemo<ScriptLineData[]>(() => {
    return scriptLines.map(l => ({
      key: l.line_key,
      text: l.dialogue,
      characterKey: charIdToKey[l.character_id] || l.character_id,
      sceneKey: l.scene_id ? (sceneIdToKey[l.scene_id] || '') : '',
      durationEst: parseFloat(l.duration_hint || '5'),
      direction: l.direction || undefined,
      sfx: l.sfx_tags || undefined,
    }));
  }, [scriptLines, sceneIdToKey, charIdToKey]);

  // Group script lines by scene
  const scriptLinesByScene = useMemo(() => {
    const map: Record<string, Array<{ key: string; characterKey: string; durationEst: number }>> = {};
    for (const line of scriptLineData) {
      if (!map[line.sceneKey]) map[line.sceneKey] = [];
      map[line.sceneKey].push({ key: line.key, characterKey: line.characterKey, durationEst: line.durationEst });
    }
    return map;
  }, [scriptLineData]);

  // ─── Production hooks ─────────────────────────────────────────────────

  const phaseManager = useProductionPhaseManager('tts');
  const tts = useTtsGeneration(projectId || null, scriptLineData, voiceConfigMap, projectLanguage);
  const visual = useVisualGeneration(projectId || null, scriptLinesByScene);
  const musicSfx = useMusicSfxGeneration(projectId || null);
  const assembly = useAssemblyPipeline(projectId || null);

  // Credit enforcement — pre-flight checks before expensive operations
  const { canAfford, useCredits, getFeatureCost } = useAICredits();

  // H5: Per-user concurrency limit (max 3 concurrent jobs)
  const MAX_CONCURRENT_JOBS = 3;
  const checkConcurrency = useCallback(async (): Promise<boolean> => {
    if (!projectId) return true;
    try {
      const { count } = await supabase
        .from('cast_generation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .in('status', ['processing', 'rendering', 'pending']);
      if ((count || 0) >= MAX_CONCURRENT_JOBS) {
        toast.error(`Too many concurrent jobs (${count}/${MAX_CONCURRENT_JOBS}). Wait for current jobs to finish.`);
        return false;
      }
      return true;
    } catch { return true; } // Fail open
  }, [projectId]);

  // Restore TTS from DB on load
  useEffect(() => {
    if (projectId && scriptLineData.length > 0) {
      tts.restoreFromDb(projectId, scriptLineData.map(l => l.key));
    }
  }, [projectId, scriptLineData.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Phase actions ────────────────────────────────────────────────────

  const approveTts = useCallback(async () => {
    const coverage = tts.doneCount / tts.totalCount;
    if (coverage < 0.9) {
      toast.error(`Need >= 90% TTS coverage (currently ${Math.round(coverage * 100)}%)`);
      return;
    }
    if (projectId) {
      await phaseManager.syncPhaseToDb(projectId, 'tts_approved');
    }
    phaseManager.setPhase('tts_approved');
    toast.success('TTS approved — moving to visual production');
  }, [tts.doneCount, tts.totalCount, projectId, phaseManager]);

  const startVisuals = useCallback(async () => {
    // H5: Concurrency check
    if (!(await checkConcurrency())) return;

    // Credit pre-flight: check balance for visual generation (avatar cost per scene)
    const avatarCost = getFeatureCost('avatar_generation');
    if (avatarCost && !canAfford('avatar_generation', scenes.length)) {
      toast.error(`Insufficient credits for visual generation (${scenes.length} scenes × ${avatarCost.credits_per_unit} credits)`);
      return;
    }

    const configs: VisualGenerationConfig[] = scenes.map(s => ({
      sceneKey: s.scene_key,
      sceneTitle: s.title,
      pipeline: (s.scene_config?.pipeline as any[]) || [],
      backgroundUrl: s.scene_config?.backgroundUrl as string | undefined,
    }));
    phaseManager.setPhase('visual');
    await visual.startAllVisualProduction(configs, tts.audioMap);

    // H3: Deduct credits only for SUCCESSFUL visual generations (proportional billing)
    if (avatarCost) {
      const successCount = Object.values(visual.sceneProduction).filter(s => s.visual === 'done').length;
      if (successCount > 0) {
        await useCredits('avatar_generation', successCount, { projectId, phase: 'visual', total: scenes.length, succeeded: successCount });
      }
    }

    phaseManager.setPhase('music');
  }, [scenes, tts.audioMap, visual, phaseManager, canAfford, useCredits, getFeatureCost, projectId, checkConcurrency]);

  const startMusic = useCallback(async () => {
    // H5: Concurrency check
    if (!(await checkConcurrency())) return;

    // Credit pre-flight: music_generation cost per scene
    if (!canAfford('music_generation', scenes.length)) {
      const cost = getFeatureCost('music_generation');
      toast.error(`Insufficient credits for music generation (${scenes.length} scenes × ${cost?.credits_per_unit || 10} credits)`);
      return;
    }

    const configs: MusicSfxConfig[] = scenes.map(s => ({
      sceneKey: s.scene_key,
      sceneTitle: s.title,
      musicPrompt: (s.scene_config?.musicConfig as any)?.prompt,
      musicDuration: (s.scene_config?.musicConfig as any)?.duration || 30,
      sfxList: (s.scene_config?.sfxConfig as any[]) || [],
    }));
    await musicSfx.startAllMusicProduction(configs, visual.setSceneProduction, visual.sceneProduction);

    // H3: Deduct credits only for SUCCESSFUL music generations (proportional billing)
    const musicSuccessCount = Object.values(visual.sceneProduction).filter(s => s.music === 'done').length;
    if (musicSuccessCount > 0) {
      await useCredits('music_generation', musicSuccessCount, { projectId, phase: 'music', total: scenes.length, succeeded: musicSuccessCount });
    }

    phaseManager.setPhase('assembly');
  }, [scenes, musicSfx, visual.setSceneProduction, phaseManager, canAfford, useCredits, getFeatureCost, projectId, checkConcurrency, visual.sceneProduction]);

  const startAssemblyPhase = useCallback(async () => {
    // M6: GDPR/HIPAA consent gate — block assembly for regulated industries without consent
    if (requiresConsentGate(projectIndustry)) {
      const requiredTypes = getConsentTypes(projectIndustry);
      const missingConsent = requiredTypes.filter(t => !consentAcknowledged[t]);
      if (missingConsent.length > 0) {
        toast.error(`Regulatory consent required before assembly: ${missingConsent.join(', ')}. Please acknowledge the disclaimers above.`);
        return;
      }
    }

    // M1: Content moderation pre-flight — check script text for compliance issues
    const allDialogue = scriptLineData.map(l => l.text).filter(Boolean).join('\n');
    if (allDialogue.length > 20) {
      try {
        const complianceResult = await complianceCheckService.checkContent(
          projectId || 'unknown',
          'text',
          allDialogue,
        );
        if (complianceResult.status === 'failed') {
          const criticalIssues = complianceResult.checks_performed
            .flatMap(c => c.issues)
            .filter(i => i.severity === 'critical')
            .map(i => i.description);
          toast.error(`Content blocked: ${criticalIssues.join('; ')}`);
          return;
        }
        if (complianceResult.status === 'flagged') {
          toast.warning('Content flagged for review — proceeding with caution. Check compliance before publishing.');
        }
      } catch (err) {
        console.warn('[CastProduction] Compliance check failed, proceeding:', err);
      }
    }

    const assemblyScenes: AssemblySceneData[] = scenes.map(s => ({
      sceneKey: s.scene_key,
      sceneTitle: s.title,
      scriptLines: (scriptLinesByScene[s.scene_key] || []).map(l => {
        const fullLine = scriptLineData.find(sl => sl.key === l.key);
        return {
          key: l.key,
          characterKey: l.characterKey,
          durationEst: l.durationEst,
          text: fullLine?.text || '',
        };
      }),
      pipeline: (s.scene_config?.pipeline as any[]) || [],
    }));

    // Build transitions from scene_config or empty array
    const transitions = scenes.slice(0, -1).map((s, i) => ({
      from: s.scene_key,
      to: scenes[i + 1]?.scene_key || '',
      style: 'dissolve',
      duration: 5,
    }));

    await assembly.startAssembly(
      assemblyScenes,
      visual.sceneProduction,
      tts.audioMap,
      transitions,
      null, // bookends — loaded from template if available
      'production',
      projectTitle,
      outputResolution, // M3: User-configurable resolution
    );
  }, [scenes, scriptLinesByScene, scriptLineData, visual.sceneProduction, tts.audioMap, assembly, projectTitle, outputResolution, projectIndustry, consentAcknowledged]);

  // ─── Pipeline Auto-Setup ─────────────────────────────────────────────
  // When a project has no scenes yet, show the auto-setup wizard that
  // generates the full pipeline from industry/format/tone config.

  const [setupConfig, setSetupConfig] = useState<Partial<CastProjectConfig>>({
    industry: 'general',
    format: 'explainer',
    tone: 'professional',
    targetAudience: 'general',
    quality: 'production',
    durationTarget: 180,
    speakerCount: 1,
    baseLanguage: 'en-US',
    targetLanguages: [],
  });
  const [setupPrompt, setSetupPrompt] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptGenProgress, setScriptGenProgress] = useState<string | null>(null);

  const handleAutoSetup = useCallback(async () => {
    if (!projectId || !setupPrompt.trim()) {
      toast.error('Please enter a project description');
      return;
    }
    setIsSeeding(true);
    try {
      const config: CastProjectConfig = {
        projectId,
        title: projectTitle,
        industry: (setupConfig.industry || 'general') as CastIndustry,
        format: (setupConfig.format || 'explainer') as CastFormat,
        tone: (setupConfig.tone || 'professional') as CastTone,
        targetAudience: (setupConfig.targetAudience || 'general') as CastAudience,
        quality: (setupConfig.quality || 'production') as CastQuality,
        durationTarget: setupConfig.durationTarget || 180,
        speakerCount: setupConfig.speakerCount || 1,
        baseLanguage: setupConfig.baseLanguage || 'en-US',
        targetLanguages: setupConfig.targetLanguages || [],
        userPrompt: setupPrompt,
      };

      // Generate the full pipeline
      const pipeline = generateProjectPipeline(config);

      // Convert to ProjectTemplate for DB seeding
      const template: ProjectTemplate = {
        metadata: {
          title: projectTitle,
          description: setupPrompt,
          contentType: config.format,
          language: config.baseLanguage,
          quality: config.quality === 'cinematic' ? 'production' : config.quality === 'draft' ? 'preview' : 'standard',
          styleIntent: `${config.industry}-${config.format}-auto`,
        },
        characters: pipeline.suggestedCharacters.map((c, i) => ({
          key: c.key || `speaker-${i + 1}`,
          name: c.name || `Speaker ${i + 1}`,
          role: c.role || 'Narrator',
          voiceProvider: c.voice?.provider || 'elevenlabs',
          voiceId: c.voice?.voiceId || '',
          style: c.motionStyle,
          speed: c.voice?.speed,
        })),
        scenes: pipeline.scenes.map((s, i) => ({
          key: s.id,
          title: s.title,
          sceneIndex: i,
          pipeline: [], // Pipeline steps will be auto-generated from scene type
          musicConfig: s.music ? {
            prompt: s.music.prompt || '',
            duration: s.durationEst,
            style: pipeline.musicConfig[s.id]?.style,
          } : undefined,
          sfxConfig: s.sfx?.map(sfx => ({
            prompt: sfx.prompt,
            timing: sfx.timing,
            duration: sfx.duration,
          })),
        })),
        scriptLines: Object.entries(
          pipeline.scenes.reduce<Array<{ key: string; text: string; characterKey: string; sceneKey: string; direction: string; duration: number }>>((lines, scene) => {
            for (const lineKey of scene.scriptKeys) {
              lines.push({
                key: lineKey,
                text: '', // AI will fill this via script generation
                characterKey: pipeline.suggestedCharacters[0]?.key || 'narrator',
                sceneKey: scene.id,
                direction: `Scene: ${scene.title}. Type: ${scene.sceneType}.`,
                duration: Math.round(scene.durationEst / scene.scriptKeys.length),
              });
            }
            return lines;
          }, [])
        ).map(([_, line]) => line as any),
      };

      // ── AI Script Content Generation ──────────────────────────────────
      // Credit pre-flight for script generation
      if (!canAfford('script_generation', 1)) {
        const cost = getFeatureCost('script_generation');
        toast.warning(`Insufficient credits for AI script generation (${cost?.credits_per_unit || 5} credits) — proceeding with empty dialogue`);
      }
      setScriptGenProgress('Generating script structure...');
      const scriptInput: ScriptGenerationInput = {
        prompt: setupPrompt,
        projectConfig: config,
        pipeline,
        characters: pipeline.suggestedCharacters,
        context: {
          brandIndustry: config.industry,
        },
      };

      const scriptStructure = generateScriptStructure(scriptInput);

      setScriptGenProgress('AI is writing dialogue...');
      setIsGeneratingScript(true);
      try {
        const aiResult = await generateScriptContent(scriptInput, scriptStructure.manifest);
        if (aiResult) {
          // Fill template script lines with AI-generated dialogue
          const aiLines = aiResult.manifest.scriptLines;
          for (const tl of template.scriptLines) {
            const aiLine = aiLines[(tl as any).key];
            if (aiLine?.text) {
              (tl as any).text = aiLine.text;
            }
          }
          // Deduct script generation credits
          await useCredits('script_generation', 1, { projectId, phase: 'script' });
          toast.success(`AI generated ${Object.values(aiLines).filter(l => l.text).length} dialogue lines`);
        } else {
          toast.warning('AI script generation returned empty — you can edit dialogue manually after setup');
        }
      } catch (err) {
        console.warn('[CastProduction] AI script generation failed, proceeding with empty lines:', err);
        toast.warning('AI script generation failed — proceeding with empty dialogue (edit manually)');
      } finally {
        setIsGeneratingScript(false);
        setScriptGenProgress(null);
      }

      await seedProjectFromTemplate(projectId, template);

      // Reload project data
      toast.success(`Project configured: ${pipeline.scenes.length} scenes, ${pipeline.estimatedDuration}s estimated`);
      window.location.reload();
    } catch (err: any) {
      console.error('[CastProduction] Auto-setup error:', err);
      toast.error(`Setup failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  }, [projectId, projectTitle, setupConfig, setupPrompt]);

  // ─── Render ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Loading Project...</h2>
          <p className="text-sm text-muted-foreground">Loading production data from database</p>
        </Card>
      </div>
    );
  }

  if (loadError || !projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h2 className="text-lg font-semibold mb-2">Load Failed</h2>
          <p className="text-sm text-muted-foreground mb-4">{loadError || 'No project ID'}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const currentPhase = phaseManager.phase;

  // ─── Auto-Setup Wizard (when project has no scenes) ─────────────────
  if (scenes.length === 0 && !isLoading) {
    const industries: CastIndustry[] = [
      'healthcare', 'pharma', 'tech', 'finance', 'education', 'entertainment',
      'food', 'fashion', 'real-estate', 'automotive', 'travel', 'fitness',
      'legal', 'nonprofit', 'government', 'general',
    ];
    const formats: CastFormat[] = [
      'documentary', 'explainer', 'podcast', 'social-clip', 'product-demo',
      'training', 'testimonial', 'interview', 'presentation', 'promo', 'tutorial',
    ];
    const tones: CastTone[] = [
      'professional', 'casual', 'cinematic', 'educational', 'dramatic',
      'playful', 'inspiring', 'authoritative', 'empathetic', 'conversational',
    ];
    const audiences: CastAudience[] = [
      'hcp', 'consumer', 'enterprise', 'student', 'developer', 'investor', 'patient', 'general',
    ];

    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-1">{projectTitle}</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Configure your production pipeline. All settings auto-generate scenes, music, and script structure.
              </p>

              {/* Prompt */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">Project Description</label>
                <textarea
                  className="w-full p-3 rounded-lg border bg-background text-sm min-h-[80px] resize-y"
                  placeholder="e.g., Create a 3-minute explainer about our new insulin delivery device for endocrinologists..."
                  value={setupPrompt}
                  onChange={e => setSetupPrompt(e.target.value)}
                />
              </div>

              {/* Config Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Industry</label>
                  <select
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={setupConfig.industry}
                    onChange={e => setSetupConfig(c => ({ ...c, industry: e.target.value as CastIndustry }))}
                  >
                    {industries.map(i => (
                      <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1).replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Format</label>
                  <select
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={setupConfig.format}
                    onChange={e => setSetupConfig(c => ({ ...c, format: e.target.value as CastFormat }))}
                  >
                    {formats.map(f => (
                      <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Tone</label>
                  <select
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={setupConfig.tone}
                    onChange={e => setSetupConfig(c => ({ ...c, tone: e.target.value as CastTone }))}
                  >
                    {tones.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Audience</label>
                  <select
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={setupConfig.targetAudience}
                    onChange={e => setSetupConfig(c => ({ ...c, targetAudience: e.target.value as CastAudience }))}
                  >
                    {audiences.map(a => (
                      <option key={a} value={a}>{a.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Duration (seconds)</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={setupConfig.durationTarget}
                    onChange={e => setSetupConfig(c => ({ ...c, durationTarget: parseInt(e.target.value) || 180 }))}
                    min={15}
                    max={3600}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Speakers</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={setupConfig.speakerCount}
                    onChange={e => setSetupConfig(c => ({ ...c, speakerCount: parseInt(e.target.value) || 1 }))}
                    min={1}
                    max={5}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Quality</label>
                  <select
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={setupConfig.quality}
                    onChange={e => setSetupConfig(c => ({ ...c, quality: e.target.value as CastQuality }))}
                  >
                    <option value="draft">Draft (fast, lower quality)</option>
                    <option value="production">Production (balanced)</option>
                    <option value="cinematic">Cinematic (highest quality)</option>
                  </select>
                </div>

                {/* M3: Output Resolution */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Output Resolution</label>
                  <select
                    className="w-full p-2 rounded-lg border bg-background text-sm"
                    value={outputResolution}
                    onChange={e => setOutputResolution(e.target.value as CastResolution)}
                  >
                    {Object.entries(CAST_RESOLUTIONS).map(([key, r]) => (
                      <option key={key} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* M6: GDPR/HIPAA Consent Gate */}
              {requiresConsentGate(setupConfig.industry || 'general') && (
                <div className="mb-6 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <h3 className="text-sm font-semibold mb-2 text-amber-600">Regulatory Compliance Required</h3>
                  {getConsentTypes(setupConfig.industry || 'general').map(consentType => (
                    <label key={consentType} className="flex items-center gap-2 text-xs mb-1">
                      <input
                        type="checkbox"
                        checked={!!consentAcknowledged[consentType]}
                        onChange={e => setConsentAcknowledged(prev => ({ ...prev, [consentType]: e.target.checked }))}
                        className="rounded"
                      />
                      I acknowledge {consentType.replace(/_/g, ' ')} requirements for {setupConfig.industry} content
                    </label>
                  ))}
                </div>
              )}

              {/* Template Preview */}
              {setupConfig.format && (
                <div className="mb-6 p-3 rounded-lg border bg-muted/30">
                  <h3 className="text-sm font-semibold mb-2">Script Template: {setupConfig.format}</h3>
                  {(() => {
                    const template = getScriptTemplate(setupConfig.format as string);
                    if (!template) return <p className="text-xs text-muted-foreground">No template found</p>;
                    const scaled = scaleTemplateToDuration(template, setupConfig.durationTarget || 180);
                    return (
                      <div className="space-y-1">
                        {scaled.map((beat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="text-[10px] shrink-0">{beat.durationSeconds}s</Badge>
                            <span className="font-medium">{beat.name}</span>
                            <span className="text-muted-foreground">— {beat.purpose}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {scriptGenProgress && (
                <div className="mb-4 p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span>{scriptGenProgress}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleAutoSetup}
                disabled={isSeeding || isGeneratingScript || !setupPrompt.trim()}
              >
                {isSeeding || isGeneratingScript ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> {isGeneratingScript ? 'Generating script...' : 'Setting up pipeline...'}</>
                ) : (
                  <><Wand2 className="h-4 w-4 mr-1" /> Generate Production Pipeline + Script</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{projectTitle}</h1>
              <p className="text-xs text-muted-foreground">
                {characters.length} characters | {scenes.length} scenes | {scriptLines.length} lines | {outputResolution}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Phase indicators */}
            {(['tts', 'visual', 'music', 'assembly', 'complete'] as const).map((p, i) => (
              <Badge
                key={p}
                variant={currentPhase === p ? 'default' : phaseManager.isPhaseComplete(p) ? 'secondary' : 'outline'}
                className={cn('text-xs', currentPhase === p && 'bg-primary')}
              >
                {phaseManager.isPhaseComplete(p) ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                {i + 1}. {p === 'tts' ? 'TTS' : p.charAt(0).toUpperCase() + p.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={currentPhase} onValueChange={(v) => phaseManager.setPhase(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="tts"><Mic className="h-4 w-4 mr-1" /> TTS</TabsTrigger>
            <TabsTrigger value="tts_approved" disabled={!phaseManager.isPhaseComplete('tts')}>Approve</TabsTrigger>
            <TabsTrigger value="visual" disabled={!phaseManager.isPhaseComplete('tts')}><Film className="h-4 w-4 mr-1" /> Visuals</TabsTrigger>
            <TabsTrigger value="music" disabled={!phaseManager.isPhaseComplete('visual')}><Music className="h-4 w-4 mr-1" /> Music</TabsTrigger>
            <TabsTrigger value="assembly" disabled={!phaseManager.isPhaseComplete('music')}><Clapperboard className="h-4 w-4 mr-1" /> Assembly</TabsTrigger>
          </TabsList>

          {/* ─── Phase 1: TTS Generation ─────────────────────────── */}
          <TabsContent value="tts">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Voice Generation</h2>
                    <p className="text-sm text-muted-foreground">
                      {tts.doneCount}/{tts.totalCount} lines generated
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {tts.batchProgress ? (
                      <Button variant="destructive" size="sm" onClick={tts.cancelBatch}>
                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    ) : (
                      <Button onClick={tts.generateAll} disabled={tts.doneCount === tts.totalCount}>
                        <Zap className="h-4 w-4 mr-1" /> Generate All
                      </Button>
                    )}
                  </div>
                </div>

                {tts.batchProgress && (
                  <Progress
                    value={(tts.batchProgress.current / tts.batchProgress.total) * 100}
                    className="mb-4"
                  />
                )}

                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {scriptLineData.map(line => (
                      <div
                        key={line.key}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border',
                          tts.statusMap[line.key] === 'done' && 'border-green-500/30 bg-green-500/5',
                          tts.statusMap[line.key] === 'error' && 'border-red-500/30 bg-red-500/5',
                          tts.statusMap[line.key] === 'generating' && 'border-blue-500/30 bg-blue-500/5',
                        )}
                      >
                        <Badge variant="outline" className="text-xs shrink-0">
                          {line.characterKey}
                        </Badge>
                        <p className="text-sm flex-1 truncate">{line.text || '(visual-only)'}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {tts.statusMap[line.key] === 'generating' && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          )}
                          {tts.statusMap[line.key] === 'done' && (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                              <Button variant="ghost" size="sm" onClick={() =>
                                tts.playingKey === line.key ? tts.stopPlayback() : tts.playLine(line.key)
                              }>
                                {tts.playingKey === line.key ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                              </Button>
                            </>
                          )}
                          {tts.statusMap[line.key] === 'error' && (
                            <Button variant="ghost" size="sm" onClick={() => tts.generateLine(line.key)}>
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                          {!tts.statusMap[line.key] && (
                            <Button variant="ghost" size="sm" onClick={() => tts.generateLine(line.key)}>
                              <Mic className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Phase 2: TTS Approval ───────────────────────────── */}
          <TabsContent value="tts_approved">
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h2 className="text-xl font-bold mb-2">TTS Review</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {tts.doneCount}/{tts.totalCount} lines ready ({Math.round((tts.doneCount / Math.max(tts.totalCount, 1)) * 100)}%)
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={tts.playAll}>
                    <Play className="h-4 w-4 mr-1" /> Play All
                  </Button>
                  <Button onClick={approveTts} disabled={tts.doneCount < tts.totalCount * 0.9}>
                    Approve & Continue to Visuals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Phase 3: Visual Production ──────────────────────── */}
          <TabsContent value="visual">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Visual Production</h2>
                    {visual.visualProgress && (
                      <p className="text-sm text-muted-foreground">
                        Scene {visual.visualProgress.current}/{visual.visualProgress.total}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {visual.visualProgress ? (
                      <Button variant="destructive" size="sm" onClick={visual.cancelProduction}>
                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    ) : (
                      <Button onClick={startVisuals}>
                        <Film className="h-4 w-4 mr-1" /> Generate All Visuals
                      </Button>
                    )}
                  </div>
                </div>
                {visual.visualProgress && (
                  <Progress
                    value={(visual.visualProgress.current / visual.visualProgress.total) * 100}
                    className="mb-4"
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scenes.map(scene => {
                    const status = visual.sceneProduction[scene.scene_key];
                    const totalAssets = status
                      ? Object.keys(status.videoUrls).length + Object.keys(status.imageUrls).length +
                        Object.keys(status.avatarUrls).length + Object.keys(status.lipsyncUrls).length
                      : 0;

                    return (
                      <Card key={scene.scene_key} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold truncate">{scene.title}</h3>
                          <Badge variant={status?.visual === 'done' ? 'default' : 'outline'} className="text-xs">
                            {status?.visual === 'done' ? 'Done' : status?.visual === 'generating' ? 'Generating...' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{totalAssets} assets generated</p>
                        {status?.visual === 'generating' && (
                          <Loader2 className="h-4 w-4 animate-spin mt-2 text-blue-400" />
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Phase 4: Music & SFX ────────────────────────────── */}
          <TabsContent value="music">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Music & Sound Effects</h2>
                  <Button onClick={startMusic}>
                    <Music className="h-4 w-4 mr-1" /> Generate All Music
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scenes.map(scene => {
                    const status = visual.sceneProduction[scene.scene_key];
                    return (
                      <Card key={scene.scene_key} className="p-4">
                        <h3 className="text-sm font-semibold truncate mb-1">{scene.title}</h3>
                        <div className="flex gap-2">
                          <Badge variant={status?.musicUrl ? 'default' : 'outline'} className="text-xs">
                            {status?.musicUrl ? 'Music ready' : 'No music'}
                          </Badge>
                          <Badge variant={status?.sfxUrls?.length ? 'default' : 'outline'} className="text-xs">
                            {status?.sfxUrls?.length || 0} SFX
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Phase 5: Assembly ────────────────────────────────── */}
          <TabsContent value="assembly">
            <Card>
              <CardContent className="p-6">
                {assembly.finalVideoUrl ? (
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                    <h2 className="text-xl font-bold mb-4">Video Complete!</h2>
                    <video
                      src={assembly.finalVideoUrl}
                      controls
                      className="w-full max-w-3xl mx-auto rounded-lg mb-4"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" asChild>
                        <a
                          href={assembly.finalVideoUrl}
                          download={`${projectTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-1" /> Download {projectTitle}
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : assembly.isAssembling || assembly.assemblyProgress ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <h2 className="text-xl font-bold mb-2">Assembling Video</h2>
                    <p className="text-sm text-muted-foreground mb-4">{assembly.assemblyProgress}</p>
                    <Button variant="destructive" size="sm" onClick={assembly.cancelAssembly}>
                      <XCircle className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Clapperboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-bold mb-2">Ready to Assemble</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {scenes.length} scenes with TTS, visuals, and music will be assembled into a final video.
                    </p>
                    <Button onClick={startAssemblyPhase}>
                      <Clapperboard className="h-4 w-4 mr-1" /> Start Assembly
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
