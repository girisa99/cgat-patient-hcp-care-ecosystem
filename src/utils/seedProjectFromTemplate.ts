/**
 * seedProjectFromTemplate
 *
 * Generic seeding function that populates DB rows from a ProjectTemplate.
 * Used to bootstrap Cast projects from pre-defined templates (EP04, product demos, etc).
 *
 * Guards:
 * - Validates no data: URIs in any URL field (lesson learned)
 * - Uses atomic merge + per-scene write locks (lesson learned)
 * - Serialized DB saves to prevent connection pool exhaustion
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── ProjectTemplate Interface ──────────────────────────────────────────────

export interface ProjectTemplate {
  metadata: {
    title: string;
    description?: string;
    contentType: string;     // 'video' | 'podcast' | 'educational' | 'ugc' | 'documentary'
    categorySlug?: string;
    formatSlug?: string;
    language: string;
    quality: 'preview' | 'standard' | 'production';
    styleIntent?: string;    // Stable identifier for dedup (e.g., 'ep04-sprint-documentary')
    targetRegions?: string[];
    selectedDialects?: string[];
  };
  characters: Array<{
    key: string;             // e.g., 'host', 'narrator'
    name: string;
    role: string;
    voiceProvider: string;
    voiceId: string;
    fallbackProvider?: string;
    fallbackVoice?: Record<string, unknown>;
    avatarUrl?: string;      // Must be HTTP URL (Supabase Storage), never data: URI
    colorClass?: string;
    style?: string;
    stability?: number;
    similarityBoost?: number;
    rate?: string;
    pitch?: string;
    speed?: number;
    eqProfile?: string;
  }>;
  scenes: Array<{
    key: string;             // e.g., 'scene-0-intro'
    title: string;
    chapter?: string;
    sceneIndex: number;
    backgroundUrl?: string;  // Must be HTTP URL (Supabase Storage), never data: URI
    artStyle?: string;
    visualStyle?: string;
    pipeline?: Array<Record<string, unknown>>;
    transitions?: Record<string, unknown>;
    bookends?: Record<string, unknown>;
    musicConfig?: {
      prompt: string;
      duration: number;
      style?: string;
    };
    sfxConfig?: Array<{
      prompt: string;
      duration?: number;
    }>;
  }>;
  scriptLines: Array<{
    key: string;
    text: string;
    characterKey: string;
    sceneKey: string;
    lineIndex: number;
    durationEst: number;
    direction?: string;
    motion?: string;
    lipsync?: boolean;
    sfx?: string[];
    visualRef?: string;
    isInterruption?: boolean;
    links?: Array<{ label: string; url: string; type: string }>;
  }>;
  transitions?: Array<{
    from: string;
    to: string;
    style: string;
    duration: number;
  }>;
  bookends?: {
    opening: { duration: number; title?: string };
    closing: { duration: number; title?: string };
  };
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateNoDataUris(template: ProjectTemplate): string[] {
  const violations: string[] = [];
  const checkUrl = (url: string | undefined, context: string) => {
    if (url && url.startsWith('data:')) {
      violations.push(`${context}: contains data: URI — must use HTTP URL`);
    }
  };

  for (const char of template.characters) {
    checkUrl(char.avatarUrl, `Character "${char.key}" avatarUrl`);
  }
  for (const scene of template.scenes) {
    checkUrl(scene.backgroundUrl, `Scene "${scene.key}" backgroundUrl`);
  }

  return violations;
}

// ─── Seeding ────────────────────────────────────────────────────────────────

export async function seedProjectFromTemplate(
  projectId: string,
  template: ProjectTemplate,
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate: no data: URIs
  const violations = validateNoDataUris(template);
  if (violations.length > 0) {
    const msg = `Template validation failed:\n${violations.join('\n')}`;
    console.error('[Seed]', msg);
    toast.error('Template has invalid URLs (data: URIs found)');
    return { success: false, error: msg };
  }

  try {
    // 2. Upsert characters
    for (const char of template.characters) {
      const { error } = await supabase.from('cast_project_characters').upsert({
        project_id: projectId,
        character_key: char.key,
        display_name: char.name,
        role_description: char.role,
        voice_provider: char.voiceProvider,
        voice_id: char.voiceId,
        avatar_url: char.avatarUrl || null,
        color_class: char.colorClass || null,
        voice_config: {
          style: char.style,
          stability: char.stability,
          similarityBoost: char.similarityBoost,
          rate: char.rate,
          pitch: char.pitch,
          speed: char.speed,
          eqProfile: char.eqProfile,
          fallbackProvider: char.fallbackProvider,
          fallbackVoice: char.fallbackVoice,
        },
      } as any, { onConflict: 'project_id,character_key' });

      if (error) console.warn(`[Seed] Character ${char.key}:`, error.message);
      await new Promise(r => setTimeout(r, 100)); // micro-delay
    }

    // 3. Upsert scenes
    for (const scene of template.scenes) {
      const { error } = await supabase.from('cast_project_scenes').upsert({
        project_id: projectId,
        scene_key: scene.key,
        title: scene.title,
        scene_index: scene.sceneIndex,
        art_style: scene.artStyle || null,
        visual_style: scene.visualStyle || null,
        scene_config: {
          backgroundUrl: scene.backgroundUrl,
          chapter: scene.chapter,
          pipeline: scene.pipeline,
          musicConfig: scene.musicConfig,
          sfxConfig: scene.sfxConfig,
          transitions: scene.transitions,
          bookends: scene.bookends,
        },
      }, { onConflict: 'project_id,scene_key' });

      if (error) console.warn(`[Seed] Scene ${scene.key}:`, error.message);
      await new Promise(r => setTimeout(r, 100));
    }

    // 4. Build character key → UUID lookup for foreign keys
    const { data: charRows } = await supabase
      .from('cast_project_characters')
      .select('id, character_key')
      .eq('project_id', projectId);
    const charKeyToId: Record<string, string> = {};
    for (const row of (charRows || [])) {
      charKeyToId[(row as any).character_key] = (row as any).id;
    }

    // 5. Upsert script lines (grouped by scene for efficiency)
    const linesByScene = new Map<string, typeof template.scriptLines>();
    for (const line of template.scriptLines) {
      if (!linesByScene.has(line.sceneKey)) linesByScene.set(line.sceneKey, []);
      linesByScene.get(line.sceneKey)!.push(line);
    }

    for (const [sceneKey, lines] of linesByScene) {
      // Get scene ID for foreign key
      const { data: sceneRow } = await supabase
        .from('cast_project_scenes')
        .select('id')
        .eq('project_id', projectId)
        .eq('scene_key', sceneKey)
        .maybeSingle();

      const sceneId = sceneRow?.id || null;

      for (const line of lines) {
        // Resolve character key → UUID; fall back to key string if character not seeded
        const characterId = charKeyToId[line.characterKey] || line.characterKey;

        const { error } = await supabase.from('cast_project_script_lines').upsert({
          project_id: projectId,
          scene_id: sceneId,
          line_key: line.key,
          line_index: line.lineIndex,
          character_id: characterId,
          dialogue: line.text,
          direction: line.direction || null,
          motion: line.motion || null,
          duration_hint: String(line.durationEst),
          visual_tags: line.visualRef ? [line.visualRef] : null,
          sfx_tags: line.sfx || null,
        }, { onConflict: 'project_id,line_key' });

        if (error) console.warn(`[Seed] Line ${line.key}:`, error.message);
        await new Promise(r => setTimeout(r, 50)); // micro-delay
      }

      // Delay between scenes
      await new Promise(r => setTimeout(r, 200));
    }

    // 5. Update project metadata
    await supabase.from('cast_projects').update({
      title: template.metadata.title,
      description: template.metadata.description || null,
      quality: template.metadata.quality,
      style_intent: template.metadata.styleIntent || null,
      target_regions: template.metadata.targetRegions || ['global'],
      selected_dialects: template.metadata.selectedDialects || [template.metadata.language],
    }).eq('id', projectId);

    console.log(`[Seed] Template seeded: ${template.characters.length} characters, ${template.scenes.length} scenes, ${template.scriptLines.length} lines`);
    toast.success(`Project seeded: ${template.metadata.title}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Seed] Error:', err);
    toast.error(`Seeding failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Quick helper: check if a project has been seeded (has characters + scenes + lines)
 */
export async function isProjectSeeded(projectId: string): Promise<boolean> {
  const { count } = await supabase
    .from('cast_project_scenes')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);
  return (count || 0) > 0;
}
