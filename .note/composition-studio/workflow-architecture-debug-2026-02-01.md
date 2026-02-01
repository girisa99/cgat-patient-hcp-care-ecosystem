# Composition Studio Workflow Architecture & Debug

## Date: 2026-02-01

## Workflow Flow

```
CREATE STEP
├── Setup: Project Name, Templates, Languages, Visual Types
├── Chapters: Add/configure chapters with prompts
└── Generate All: Generates for each chapter:
    ├── Script (ai-universal-processor)
    ├── Transcreation (translationService)
    ├── Voice/TTS (multi-provider-tts via multiLanguageAudioOrchestrator)
    ├── Music (multi-provider-music via multiLanguageAudioOrchestrator)
    └── Video (ai-video-generator)

REVIEW STEP
├── View generated content with confidence scores
├── Regenerate individual assets (script/audio/video/music)
├── Multi-language audio player with language dropdown
└── Approve/reject chapters before publish

PUBLISH STEP
├── Combined output (stitch all chapter videos)
└── Individual outputs (separate files per chapter)
```

## TTS Generation Flow

1. **Create Step** → `generateChapter()` → `ecosystemServices.generateVoiceover()`
2. **useStudioEcosystem** → `multiLanguageAudioOrchestrator.executeSession()`
3. **Orchestrator** → calls `multi-provider-tts` edge function
4. **Edge Function** → returns `{ audioContent, audioUrl, provider, ... }`
5. **Orchestrator** → extracts `audioUrl` from response
6. **Chapter Update** → stores in `generatedContent.audioUrl`

## Project Persistence Flow

1. **localStorage Key**: `composition_studio_projects` (array of projects)
2. **sessionStorage Key**: `studio_current_draft` (current session backup)
3. **Auto-save**: Debounced 1-second save after any state change
4. **Project Switching**: `loadProject()` saves current → loads selected

## Audio Playback Flow

1. **ChapterPreviewPanel** receives `assets.audio.url` or `audioByLanguage[lang].audioUrl`
2. Creates `Audio()` element with the data URI or HTTP URL
3. Handles events: loadedmetadata, timeupdate, ended, error

## Identified Issues & Fixes Applied (2026-02-01)

### Issue 1: TTS Says "Generated" But Won't Play
- **Root Cause**: Audio URL might be null/undefined if edge function failed silently
- **Fix Applied**: 
  - Enhanced `multiLanguageAudioOrchestrator.executeJob()` to handle multiple response formats
  - Added fallback from `audioUrl` → `url` → `audio_url` → `audioContent` (converted to data URI)
  - Added detailed logging for debugging

### Issue 2: TTS Regeneration Failing Silently
- **Root Cause**: Direct ecosystem call failure wasn't handled with fallback
- **Fix Applied**: 
  - Added direct `multi-provider-tts` edge function call as fallback
  - Added `openai-tts` as secondary fallback
  - Better error messages shown to user

### Issue 3: Multi-language Audio (Telugu, Hindi, Kannada)
- **Status**: Now working - all 5 providers configured (ElevenLabs, OpenAI, Azure, Google, Alibaba)
- **Regional Routing**:
  - Telugu/Hindi/Kannada → Gemini Zone → Google TTS primary, Azure fallback
  - Arabic → MENA Zone → Azure primary
  - CJK → Alibaba Zone → Alibaba CosyVoice primary
  - Western → Claude Zone → ElevenLabs/OpenAI primary

### Issue 4: Project Visibility (Ramayana Missing)
- **Likely Cause**: Project saved with empty name or localStorage sync issue
- **User Action**: Check localStorage in browser dev tools for `composition_studio_projects`

### Issue 5: Chapter-wise vs Combined Video Confusion
- **Explanation**: 
  - Script: Generated PER CHAPTER (each has its own script)
  - Voice: Generated PER CHAPTER (each has its own audio)
  - Video: Generated PER CHAPTER, then COMBINED at end if `outputMode === 'combined'`
  - For 3 chapters with "combined" mode:
    1. Chapter 1: script → audio → video
    2. Chapter 2: script → audio → video
    3. Chapter 3: script → audio → video
    4. COMBINE: Stitch videos 1+2+3 into single output

## Debug Checklist

1. Check console logs for `[Studio]` prefixed messages
2. Check edge function logs for `multi-provider-tts`
3. Verify `audioUrl` in chapter's `generatedContent` object
4. Check network tab for failed edge function calls
