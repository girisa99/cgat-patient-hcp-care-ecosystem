-- Move format UI metadata (editor_placeholder, checklist) from hardcoded
-- FormatStudioRouter FORMAT_REGISTRY into DB so new formats added to the
-- cast_content_formats table automatically get full UI support.

-- ============================================================================
-- 1. Add columns
-- ============================================================================
ALTER TABLE public.cast_content_formats
  ADD COLUMN IF NOT EXISTS editor_placeholder text,
  ADD COLUMN IF NOT EXISTS checklist text[] DEFAULT '{}';

COMMENT ON COLUMN public.cast_content_formats.editor_placeholder IS 'Placeholder text shown in the format-specific editor area';
COMMENT ON COLUMN public.cast_content_formats.checklist IS 'Readiness checklist items for this format (array of labels)';

-- ============================================================================
-- 2. Backfill all 17 formats
-- ============================================================================

-- Video
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Video timeline + scene editor will render here. Add scenes, arrange clips, sync voiceover, and preview transitions.',
  checklist = ARRAY['All scenes rendered', 'TTS audio synced to scenes', 'Transitions applied', 'Final preview reviewed']
WHERE name = 'video';

-- UGC
UPDATE public.cast_content_formats SET
  editor_placeholder = 'UGC video timeline + scene editor will render here. Arrange clips, add captions, and apply UGC-style effects.',
  checklist = ARRAY['All scenes rendered', 'TTS audio synced to scenes', 'Captions generated', 'UGC style filters applied']
WHERE name = 'ugc';

-- Presentation
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Slide editor will render here. Design individual slides, embed videos or animations, and add speaker notes.',
  checklist = ARRAY['All slides complete', 'Optional videos embedded', 'Speaker notes added', 'Slide transitions configured']
WHERE name = 'presentation';

-- Podcast
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Audio timeline will render here. Arrange voice tracks, add music beds, insert SFX, and fine-tune levels.',
  checklist = ARRAY['Audio tracks mixed', 'Intro/outro attached', 'Music beds leveled', 'Final audio mastered']
WHERE name = 'podcast';

-- Voice
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Voice editor will render here. Generate TTS, adjust pacing, and apply audio enhancements.',
  checklist = ARRAY['TTS generated for all segments', 'Pacing and pauses adjusted', 'Audio post-processing applied', 'Quality review passed']
WHERE name = 'voice';

-- TTS
UPDATE public.cast_content_formats SET
  editor_placeholder = 'TTS studio will render here. Select voices, adjust prosody, and generate speech output.',
  checklist = ARRAY['Voice profile selected', 'All text segments converted', 'Prosody tuned', 'Output quality verified']
WHERE name = 'tts';

-- Webcast
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Webcast editor will render here. Arrange slides with video overlay, configure live settings, and set up interactive elements.',
  checklist = ARRAY['Slide deck linked', 'Video overlay configured', 'Live stream settings saved', 'Interactive elements tested']
WHERE name = 'webcast';

-- Script
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Script editor will render here. Write scene headings, dialogue, and action descriptions with industry-standard formatting.',
  checklist = ARRAY['All scenes written', 'Dialogue finalized', 'Stage directions added', 'Script review completed']
WHERE name = 'script';

-- Website
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Page section builder will render here. Drag-and-drop sections, embed media, and preview responsive layouts.',
  checklist = ARRAY['All sections built', 'Responsive preview passed', 'Media assets embedded', 'SEO metadata configured']
WHERE name = 'website';

-- Infographic
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Infographic canvas will render here. Place data visualizations, add motion keyframes, and configure animation timings.',
  checklist = ARRAY['Data visualizations placed', 'Motion keyframes set', 'Animation timing reviewed', 'Static fallback exported']
WHERE name = 'infographic';

-- Training
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Training module editor will render here. Create chapters, add assessments, and configure learner progress tracking.',
  checklist = ARRAY['All chapters/modules created', 'Assessments configured', 'Media assets embedded', 'Learning path validated']
WHERE name = 'training';

-- Meeting Intelligence
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Diagram/flow editor will render here. Visualize meeting flow, highlight decisions, and map action items.',
  checklist = ARRAY['Meeting flow diagrammed', 'Key decisions highlighted', 'Action items mapped', 'Summary document generated']
WHERE name = 'meeting_intelligence';

-- Email Campaign
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Email sequence builder will render here. Design email templates, configure send sequences, and set up A/B variants.',
  checklist = ARRAY['Email templates designed', 'Send sequence configured', 'A/B variants created', 'Preview across clients tested']
WHERE name = 'email_campaign';

-- Kids Education
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Kids education editor will render here. Build interactive lessons, add gamification elements, and set difficulty levels.',
  checklist = ARRAY['Lesson modules created', 'Interactive elements added', 'Age-appropriate review passed', 'Gamification configured']
WHERE name = 'kids_education';

-- Event Content
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Event highlight reel editor will render here. Arrange multi-camera footage, add branding overlays, and trim highlights.',
  checklist = ARRAY['Highlight clips selected', 'Branding overlays applied', 'Timeline arranged', 'Final reel reviewed']
WHERE name = 'event_content';

-- Document
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Document editor will render here. Write and format content, embed media, and configure export settings.',
  checklist = ARRAY['Content drafted', 'Formatting applied', 'Media embedded', 'Export format configured']
WHERE name = 'document';

-- Live Streaming
UPDATE public.cast_content_formats SET
  editor_placeholder = 'Live streaming studio will render here. Configure RTMP/HLS endpoints, set up overlays, manage real-time chat, and control streaming quality.',
  checklist = ARRAY['Stream endpoint configured', 'Overlays and scenes set up', 'Audio/video sources tested', 'Chat and interactivity enabled']
WHERE name = 'live_streaming';
