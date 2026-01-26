/**
 * Pipeline I/O Registry
 * 
 * Complete mapping of 141 pipelines (116 base + 25 marketing-specific) 
 * with full input/output format specifications
 * 
 * Includes 22 NEW critical user-demand pipelines:
 * - AI Background Removal, Video Upscaling, Audio Enhancement
 * - Auto-Captions, Teleprompter, Thumbnail Creator, etc.
 */

export type PipelineTier = 'Starter' | 'Pro' | 'Enterprise';

export interface PipelineIOEntry {
  id: string;
  name: string;
  tier: PipelineTier;
  inputFormats: string[];
  outputFormats: string[];
  category: PipelineIOCategory;
  isCovered: boolean;
  notes?: string;
  providers?: string[];
}

export type PipelineIOCategory =
  | 'text_based'
  | 'image_based'
  | 'voice_audio'
  | 'document_ppt'
  | 'video_based'
  | '3d_based'
  | 'ar_vr_scene'
  | 'complex_multimodal'
  | 'presentation'
  | 'repurposing'
  | 'training_ld'
  | 'marketing_sales'
  | 'localization'
  | 'creator_enhancement'
  | 'podcast_webcast'  // NEW: 16 Podcast/Webcast pipelines
  | 'editing'          // NEW: 15 FFmpeg-wrapped editing pipelines
  | 'mobile';          // NEW: 5 Mobile record-to-publish pipelines

// ═══════════════════════════════════════════════════════════════
// CATEGORY 1: TEXT-BASED (10 Pipelines)
// ═══════════════════════════════════════════════════════════════
const TEXT_BASED_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'text-to-image',
    name: 'Text to Image',
    tier: 'Starter',
    inputFormats: ['txt', 'json'],
    outputFormats: ['png', 'jpg', 'webp'],
    category: 'text_based',
    isCovered: true,
    providers: ['OpenAI', 'ModelsLab', 'Replicate']
  },
  {
    id: 'text-to-video',
    name: 'Text to Video',
    tier: 'Pro',
    inputFormats: ['txt', 'json'],
    outputFormats: ['mp4', 'webm'],
    category: 'text_based',
    isCovered: true,
    providers: ['ModelsLab', 'Alibaba', 'Replicate']
  },
  {
    id: 'text-to-3d',
    name: 'Text to 3D',
    tier: 'Pro',
    inputFormats: ['txt', 'json'],
    outputFormats: ['glb', 'gltf', 'obj', 'usdz'],
    category: 'text_based',
    isCovered: true,
    providers: ['ModelsLab', 'Replicate', 'Huggingface']
  },
  {
    id: 'text-to-animation',
    name: 'Text to Animation',
    tier: 'Pro',
    inputFormats: ['txt', 'json'],
    outputFormats: ['mp4', 'gif', 'lottie', 'spine'],
    category: 'text_based',
    isCovered: true,
    notes: '+lottie, +spine',
    providers: ['ModelsLab', 'OpenAI']
  },
  {
    id: 'text-to-avatar',
    name: 'Text to Avatar',
    tier: 'Enterprise',
    inputFormats: ['txt', 'json'],
    outputFormats: ['avatar_model', 'glb', 'vrm'],
    category: 'text_based',
    isCovered: true,
    notes: '+vrm',
    providers: ['Alibaba', 'ModelsLab', 'Azure']
  },
  {
    id: 'text-to-vr',
    name: 'Text to VR',
    tier: 'Enterprise',
    inputFormats: ['txt', 'json'],
    outputFormats: ['glb', 'usdz', 'vr_experience'],
    category: 'text_based',
    isCovered: true,
    notes: '+vr_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'text-to-ar',
    name: 'Text to AR',
    tier: 'Enterprise',
    inputFormats: ['txt', 'json'],
    outputFormats: ['usdz', 'glb', 'ar_experience'],
    category: 'text_based',
    isCovered: true,
    notes: '+ar_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'text-to-interactive',
    name: 'Text to Interactive',
    tier: 'Pro',
    inputFormats: ['txt', 'json'],
    outputFormats: ['html', 'scorm', 'json'],
    category: 'text_based',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude', 'Gemini']
  },
  {
    id: 'text-to-music',
    name: 'Text to Music',
    tier: 'Pro',
    inputFormats: ['txt', 'json'],
    outputFormats: ['mp3', 'wav', 'midi'],
    category: 'text_based',
    isCovered: true,
    notes: '+midi',
    providers: ['ElevenLabs', 'Alibaba']
  },
  {
    id: 'text-to-sfx',
    name: 'Text to SFX',
    tier: 'Starter',
    inputFormats: ['txt', 'json'],
    outputFormats: ['wav', 'mp3', 'ogg'],
    category: 'text_based',
    isCovered: true,
    providers: ['ElevenLabs', 'Alibaba']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 2: IMAGE-BASED (8 Pipelines)
// ═══════════════════════════════════════════════════════════════
const IMAGE_BASED_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'image-to-video',
    name: 'Image to Video',
    tier: 'Pro',
    inputFormats: ['png', 'jpg', 'webp'],
    outputFormats: ['mp4', 'webm'],
    category: 'image_based',
    isCovered: true,
    providers: ['ModelsLab', 'Alibaba', 'Replicate']
  },
  {
    id: 'image-to-3d',
    name: 'Image to 3D',
    tier: 'Pro',
    inputFormats: ['png', 'jpg'],
    outputFormats: ['glb', 'gltf', 'obj', 'ply'],
    category: 'image_based',
    isCovered: true,
    providers: ['ModelsLab', 'Replicate', 'Huggingface']
  },
  {
    id: 'image-to-animation',
    name: 'Image to Animation',
    tier: 'Pro',
    inputFormats: ['png', 'jpg', 'gif'],
    outputFormats: ['mp4', 'gif', 'lottie'],
    category: 'image_based',
    isCovered: true,
    notes: '+lottie',
    providers: ['ModelsLab', 'Alibaba']
  },
  {
    id: 'image-to-avatar',
    name: 'Image to Avatar',
    tier: 'Enterprise',
    inputFormats: ['png', 'jpg'],
    outputFormats: ['avatar_model', 'glb', 'vrm'],
    category: 'image_based',
    isCovered: true,
    notes: '+vrm',
    providers: ['Alibaba', 'ModelsLab']
  },
  {
    id: 'image-to-vr',
    name: 'Image to VR',
    tier: 'Enterprise',
    inputFormats: ['png', 'jpg', 'equirectangular'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'image_based',
    isCovered: true,
    notes: '+equirect, +vr_exp',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'image-to-ar',
    name: 'Image to AR',
    tier: 'Enterprise',
    inputFormats: ['png', 'jpg'],
    outputFormats: ['usdz', 'ar_experience'],
    category: 'image_based',
    isCovered: true,
    notes: '+ar_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'image-to-vfx',
    name: 'Image to VFX',
    tier: 'Pro',
    inputFormats: ['png', 'jpg', 'exr'],
    outputFormats: ['mp4', 'mov_prores', 'exr_seq'],
    category: 'image_based',
    isCovered: true,
    notes: '+exr, +prores',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'image-to-portrait',
    name: 'Image to Portrait',
    tier: 'Starter',
    inputFormats: ['png', 'jpg'],
    outputFormats: ['png', 'jpg', 'mp4'],
    category: 'image_based',
    isCovered: true,
    providers: ['ModelsLab', 'Alibaba']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 3: VOICE/AUDIO (8 Pipelines)
// ═══════════════════════════════════════════════════════════════
const VOICE_AUDIO_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'voice-to-animation',
    name: 'Voice to Animation',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'webm'],
    outputFormats: ['mp4', 'gif', 'lottie'],
    category: 'voice_audio',
    isCovered: true,
    notes: '+lottie',
    providers: ['Azure', 'Alibaba', 'ModelsLab']
  },
  {
    id: 'voice-to-avatar',
    name: 'Voice to Avatar',
    tier: 'Enterprise',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['mp4', 'webm', 'avatar_model'],
    category: 'voice_audio',
    isCovered: true,
    providers: ['Alibaba', 'Azure', 'ModelsLab']
  },
  {
    id: 'voice-to-3d',
    name: 'Voice to 3D',
    tier: 'Enterprise',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['glb', 'gltf'],
    category: 'voice_audio',
    isCovered: true,
    providers: ['Alibaba', 'ModelsLab']
  },
  {
    id: 'voice-to-interactive',
    name: 'Voice to Interactive',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['html', 'scorm'],
    category: 'voice_audio',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Azure', 'Claude']
  },
  {
    id: 'voice-to-video',
    name: 'Voice to Video',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'aac'],
    outputFormats: ['mp4', 'webm'],
    category: 'voice_audio',
    isCovered: true,
    providers: ['ModelsLab', 'Alibaba']
  },
  {
    id: 'voice-to-vr',
    name: 'Voice to VR',
    tier: 'Enterprise',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'voice_audio',
    isCovered: true,
    notes: '+vr_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'audio-to-animation',
    name: 'Audio to Animation',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'midi'],
    outputFormats: ['mp4', 'gif'],
    category: 'voice_audio',
    isCovered: true,
    notes: '+midi input',
    providers: ['ModelsLab', 'Alibaba']
  },
  {
    id: 'audio-to-vfx',
    name: 'Audio to VFX',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav'],
    outputFormats: ['mp4', 'mov_prores'],
    category: 'voice_audio',
    isCovered: true,
    notes: '+prores',
    providers: ['ModelsLab', 'ElevenLabs']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 4: DOCUMENT/PPT (10 Pipelines)
// ═══════════════════════════════════════════════════════════════
const DOCUMENT_PPT_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'ppt-to-video',
    name: 'PPT to Video',
    tier: 'Pro',
    inputFormats: ['pptx', 'ppt', 'odp'],
    outputFormats: ['mp4', 'webm'],
    category: 'document_ppt',
    isCovered: true,
    notes: '+ppt, +odp',
    providers: ['Gemini', 'OpenAI', 'ElevenLabs']
  },
  {
    id: 'ppt-to-animation',
    name: 'PPT to Animation',
    tier: 'Pro',
    inputFormats: ['pptx'],
    outputFormats: ['mp4', 'gif', 'lottie'],
    category: 'document_ppt',
    isCovered: true,
    notes: '+lottie',
    providers: ['ModelsLab', 'OpenAI']
  },
  {
    id: 'ppt-to-interactive',
    name: 'PPT to Interactive',
    tier: 'Pro',
    inputFormats: ['pptx'],
    outputFormats: ['html', 'scorm'],
    category: 'document_ppt',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude']
  },
  {
    id: 'ppt-to-3d',
    name: 'PPT to 3D',
    tier: 'Pro',
    inputFormats: ['pptx'],
    outputFormats: ['glb', 'gltf'],
    category: 'document_ppt',
    isCovered: true,
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'ppt-to-vr',
    name: 'PPT to VR',
    tier: 'Enterprise',
    inputFormats: ['pptx'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'document_ppt',
    isCovered: true,
    notes: '+vr_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'document-to-video',
    name: 'Document to Video',
    tier: 'Pro',
    inputFormats: ['docx', 'pdf', 'txt'],
    outputFormats: ['mp4', 'webm'],
    category: 'document_ppt',
    isCovered: true,
    providers: ['OpenAI', 'Gemini', 'ElevenLabs']
  },
  {
    id: 'document-to-slides',
    name: 'Document to Slides',
    tier: 'Pro',
    inputFormats: ['docx', 'pdf', 'txt', 'md'],
    outputFormats: ['pptx', 'pdf'],
    category: 'document_ppt',
    isCovered: true,
    providers: ['OpenAI', 'Claude', 'Gemini']
  },
  {
    id: 'document-to-interactive',
    name: 'Document to Interactive',
    tier: 'Pro',
    inputFormats: ['docx', 'pdf'],
    outputFormats: ['html', 'scorm'],
    category: 'document_ppt',
    isCovered: true,
    providers: ['OpenAI', 'Claude']
  },
  {
    id: 'pdf-to-video',
    name: 'PDF to Video',
    tier: 'Pro',
    inputFormats: ['pdf'],
    outputFormats: ['mp4', 'webm'],
    category: 'document_ppt',
    isCovered: true,
    providers: ['OpenAI', 'Gemini', 'ElevenLabs']
  },
  {
    id: 'pdf-to-interactive',
    name: 'PDF to Interactive',
    tier: 'Pro',
    inputFormats: ['pdf'],
    outputFormats: ['html', 'scorm'],
    category: 'document_ppt',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 5: VIDEO-BASED (9 Pipelines)
// ═══════════════════════════════════════════════════════════════
const VIDEO_BASED_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'video-to-avatar',
    name: 'Video to Avatar',
    tier: 'Enterprise',
    inputFormats: ['mp4', 'mov', 'webm'],
    outputFormats: ['avatar_model', 'lora', 'vrm'],
    category: 'video_based',
    isCovered: true,
    notes: '+LABS, +vrm',
    providers: ['Alibaba', 'ModelsLab']
  },
  {
    id: 'video-to-3d',
    name: 'Video to 3D',
    tier: 'Enterprise',
    inputFormats: ['mp4', 'mov', 'webm'],
    outputFormats: ['glb', 'gltf', 'ply', 'splat'],
    category: 'video_based',
    isCovered: true,
    notes: 'Gaussian splat',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'video-to-animation',
    name: 'Video to Animation',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['gif', 'lottie', 'mp4'],
    category: 'video_based',
    isCovered: true,
    notes: '+lottie',
    providers: ['ModelsLab', 'Alibaba']
  },
  {
    id: 'video-to-interactive',
    name: 'Video to Interactive',
    tier: 'Pro',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['html', 'scorm'],
    category: 'video_based',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude']
  },
  {
    id: 'video-to-vr',
    name: 'Video to VR',
    tier: 'Enterprise',
    inputFormats: ['mp4', 'mov', 'equirect_video'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'video_based',
    isCovered: true,
    notes: '+equirect_video',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'video-to-vfx',
    name: 'Video to VFX',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov', 'prores'],
    outputFormats: ['mp4', 'mov_prores', 'exr_seq'],
    category: 'video_based',
    isCovered: true,
    notes: '+prores, +exr',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'video-to-multilingual',
    name: 'Video to Multilingual',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['mp4', 'srt', 'vtt'],
    category: 'video_based',
    isCovered: true,
    notes: '+srt, +vtt',
    providers: ['ElevenLabs', 'Alibaba', 'DeepL']
  },
  {
    id: 'video-to-clips',
    name: 'Video to Clips',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov', 'webm'],
    outputFormats: ['mp4', 'gif'],
    category: 'video_based',
    isCovered: true,
    providers: ['Gemini', 'OpenAI']
  },
  {
    id: 'video-to-summary',
    name: 'Video to Summary',
    tier: 'Starter',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['txt', 'json', 'md'],
    category: 'video_based',
    isCovered: true,
    providers: ['Gemini', 'Claude', 'OpenAI']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 6: 3D-BASED (5 Pipelines)
// ═══════════════════════════════════════════════════════════════
const _3D_BASED_PIPELINES: PipelineIOEntry[] = [
  {
    id: '3d-to-video',
    name: '3D to Video',
    tier: 'Pro',
    inputFormats: ['glb', 'gltf', 'fbx', 'obj'],
    outputFormats: ['mp4', 'webm'],
    category: '3d_based',
    isCovered: true,
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: '3d-to-animation',
    name: '3D to Animation',
    tier: 'Pro',
    inputFormats: ['glb', 'gltf', 'fbx'],
    outputFormats: ['mp4', 'gif'],
    category: '3d_based',
    isCovered: true,
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: '3d-to-vr',
    name: '3D to VR',
    tier: 'Enterprise',
    inputFormats: ['glb', 'gltf', 'obj'],
    outputFormats: ['glb', 'usdz', 'vr_experience'],
    category: '3d_based',
    isCovered: true,
    notes: '+vr_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: '3d-to-ar',
    name: '3D to AR',
    tier: 'Enterprise',
    inputFormats: ['glb', 'gltf', 'obj'],
    outputFormats: ['usdz', 'ar_experience'],
    category: '3d_based',
    isCovered: true,
    notes: '+ar_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: '3d-to-interactive',
    name: '3D to Interactive',
    tier: 'Pro',
    inputFormats: ['glb', 'gltf'],
    outputFormats: ['html', 'json'],
    category: '3d_based',
    isCovered: true,
    providers: ['ModelsLab', 'Replicate']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 7: AR/VR SCENE (6 Pipelines)
// ═══════════════════════════════════════════════════════════════
const AR_VR_SCENE_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'scene-to-vr',
    name: 'Scene to VR',
    tier: 'Enterprise',
    inputFormats: ['glb', 'gltf', 'json'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'ar_vr_scene',
    isCovered: true,
    notes: '+vr_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'scene-to-ar',
    name: 'Scene to AR',
    tier: 'Enterprise',
    inputFormats: ['glb', 'gltf', 'json'],
    outputFormats: ['usdz', 'ar_experience'],
    category: 'ar_vr_scene',
    isCovered: true,
    notes: '+ar_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'ar-to-video',
    name: 'AR to Video',
    tier: 'Pro',
    inputFormats: ['ar_recording', 'mp4'],
    outputFormats: ['mp4', 'webm'],
    category: 'ar_vr_scene',
    isCovered: true,
    notes: '+ar_recording',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'vr-to-video',
    name: 'VR to Video',
    tier: 'Pro',
    inputFormats: ['vr_recording', 'mp4'],
    outputFormats: ['mp4', 'webm', 'equirect'],
    category: 'ar_vr_scene',
    isCovered: true,
    notes: '+vr_recording',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'panorama-to-vr',
    name: 'Panorama to VR',
    tier: 'Pro',
    inputFormats: ['jpg', 'png', 'equirect'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'ar_vr_scene',
    isCovered: true,
    notes: '+equirect',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'floor-plan-to-vr',
    name: 'Floor Plan to VR',
    tier: 'Enterprise',
    inputFormats: ['pdf', 'png', 'dwg', 'dxf'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'ar_vr_scene',
    isCovered: true,
    notes: '+dwg, +dxf',
    providers: ['ModelsLab', 'Replicate']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 8: COMPLEX MULTI-MODAL (7 Pipelines)
// ═══════════════════════════════════════════════════════════════
const COMPLEX_MULTIMODAL_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'auto-record-to-avatar',
    name: 'Auto Record to Avatar',
    tier: 'Enterprise',
    inputFormats: ['webrtc', 'mp4', 'webcam'],
    outputFormats: ['avatar_model', 'mp4'],
    category: 'complex_multimodal',
    isCovered: true,
    notes: '+webcam',
    providers: ['Alibaba', 'Azure', 'ModelsLab']
  },
  {
    id: 'auto-record-to-3d',
    name: 'Auto Record to 3D',
    tier: 'Enterprise',
    inputFormats: ['webrtc', 'mp4'],
    outputFormats: ['glb', 'ply', 'splat'],
    category: 'complex_multimodal',
    isCovered: true,
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'auto-record-to-interactive',
    name: 'Auto Record to Interactive',
    tier: 'Pro',
    inputFormats: ['webrtc', 'mp4'],
    outputFormats: ['html', 'scorm'],
    category: 'complex_multimodal',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude']
  },
  {
    id: 'auto-record-to-video',
    name: 'Auto Record to Video',
    tier: 'Pro',
    inputFormats: ['webrtc', 'screen_capture'],
    outputFormats: ['mp4', 'webm'],
    category: 'complex_multimodal',
    isCovered: true,
    notes: '+screen_capture',
    providers: ['Gemini', 'OpenAI']
  },
  {
    id: 'auto-record-to-vr',
    name: 'Auto Record to VR',
    tier: 'Enterprise',
    inputFormats: ['webrtc', 'mp4'],
    outputFormats: ['glb', 'vr_experience'],
    category: 'complex_multimodal',
    isCovered: true,
    notes: '+vr_experience',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'multi-modal-mashup',
    name: 'Multi-modal Mashup',
    tier: 'Enterprise',
    inputFormats: ['mp4', 'mp3', 'png', 'txt', 'json'],
    outputFormats: ['mp4', 'html'],
    category: 'complex_multimodal',
    isCovered: true,
    providers: ['OpenAI', 'Gemini', 'ModelsLab']
  },
  {
    id: 'full-production-suite',
    name: 'Full Production Suite',
    tier: 'Enterprise',
    inputFormats: ['ALL FORMATS'],
    outputFormats: ['ALL FORMATS'],
    category: 'complex_multimodal',
    isCovered: true,
    notes: 'Complete',
    providers: ['All Core 12']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 9: PRESENTATION (5 Pipelines)
// ═══════════════════════════════════════════════════════════════
const PRESENTATION_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'idea-to-presentation',
    name: 'Idea to Presentation',
    tier: 'Starter',
    inputFormats: ['txt', 'json'],
    outputFormats: ['pptx', 'pdf', 'html'],
    category: 'presentation',
    isCovered: true,
    providers: ['OpenAI', 'Claude', 'Gemini']
  },
  {
    id: 'document-to-presentation',
    name: 'Document to Presentation',
    tier: 'Pro',
    inputFormats: ['docx', 'pdf', 'txt'],
    outputFormats: ['pptx', 'pdf'],
    category: 'presentation',
    isCovered: true,
    providers: ['OpenAI', 'Claude', 'Azure']
  },
  {
    id: 'data-to-presentation',
    name: 'Data to Presentation',
    tier: 'Pro',
    inputFormats: ['csv', 'xlsx', 'json'],
    outputFormats: ['pptx', 'pdf'],
    category: 'presentation',
    isCovered: true,
    providers: ['OpenAI', 'Gemini']
  },
  {
    id: 'brand-to-templates',
    name: 'Brand to Templates',
    tier: 'Pro',
    inputFormats: ['png', 'svg', 'json'],
    outputFormats: ['pptx', 'figma', 'sketch'],
    category: 'presentation',
    isCovered: true,
    notes: '+figma, +sketch',
    providers: ['Gemini', 'OpenAI']
  },
  {
    id: 'presentation-to-video',
    name: 'Presentation to Video',
    tier: 'Pro',
    inputFormats: ['pptx', 'pdf'],
    outputFormats: ['mp4', 'webm'],
    category: 'presentation',
    isCovered: true,
    providers: ['Gemini', 'OpenAI', 'ElevenLabs']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 10: REPURPOSING (8 Pipelines)
// ═══════════════════════════════════════════════════════════════
const REPURPOSING_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'long-to-shorts',
    name: 'Long to Shorts',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['mp4', 'webm'],
    category: 'repurposing',
    isCovered: true,
    providers: ['Gemini', 'OpenAI']
  },
  {
    id: 'blog-to-video',
    name: 'Blog to Video',
    tier: 'Pro',
    inputFormats: ['html', 'md', 'txt'],
    outputFormats: ['mp4', 'webm'],
    category: 'repurposing',
    isCovered: true,
    providers: ['OpenAI', 'ElevenLabs', 'ModelsLab']
  },
  {
    id: 'podcast-to-blog',
    name: 'Podcast to Blog',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'm4a'],
    outputFormats: ['md', 'html', 'docx'],
    category: 'repurposing',
    isCovered: true,
    providers: ['OpenAI', 'Claude', 'Gemini']
  },
  {
    id: 'webinar-to-course',
    name: 'Webinar to Course',
    tier: 'Pro',
    inputFormats: ['mp4', 'webm'],
    outputFormats: ['scorm', 'html', 'mp4'],
    category: 'repurposing',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude']
  },
  {
    id: 'meeting-to-summary',
    name: 'Meeting to Summary',
    tier: 'Starter',
    inputFormats: ['mp4', 'mp3', 'webrtc'],
    outputFormats: ['txt', 'md', 'pdf'],
    category: 'repurposing',
    isCovered: true,
    providers: ['Gemini', 'Claude', 'OpenAI']
  },
  {
    id: 'video-to-blog',
    name: 'Video to Blog',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['md', 'html', 'docx'],
    category: 'repurposing',
    isCovered: true,
    providers: ['Gemini', 'Claude']
  },
  {
    id: 'course-to-micro',
    name: 'Course to Micro',
    tier: 'Pro',
    inputFormats: ['scorm', 'mp4'],
    outputFormats: ['mp4', 'scorm'],
    category: 'repurposing',
    isCovered: true,
    providers: ['OpenAI', 'Gemini']
  },
  {
    id: 'content-atomizer',
    name: 'Content Atomizer',
    tier: 'Pro',
    inputFormats: ['mp4', 'pdf', 'docx'],
    outputFormats: ['mp4', 'png', 'txt', 'html'],
    category: 'repurposing',
    isCovered: true,
    providers: ['Gemini', 'OpenAI', 'Claude']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 11: TRAINING/L&D (6 Pipelines)
// ═══════════════════════════════════════════════════════════════
const TRAINING_LD_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'sop-to-training',
    name: 'SOP to Training',
    tier: 'Pro',
    inputFormats: ['docx', 'pdf', 'txt'],
    outputFormats: ['scorm', 'mp4', 'html'],
    category: 'training_ld',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude', 'ElevenLabs']
  },
  {
    id: 'assessment-builder',
    name: 'Assessment Builder',
    tier: 'Pro',
    inputFormats: ['txt', 'json', 'xlsx'],
    outputFormats: ['scorm', 'html', 'json'],
    category: 'training_ld',
    isCovered: true,
    providers: ['OpenAI', 'Claude']
  },
  {
    id: 'compliance-module',
    name: 'Compliance Module',
    tier: 'Enterprise',
    inputFormats: ['docx', 'pdf'],
    outputFormats: ['scorm', 'mp4'],
    category: 'training_ld',
    isCovered: true,
    notes: '+scorm',
    providers: ['Claude', 'OpenAI']
  },
  {
    id: 'onboarding-flow',
    name: 'Onboarding Flow',
    tier: 'Pro',
    inputFormats: ['txt', 'json', 'pptx'],
    outputFormats: ['scorm', 'html', 'mp4'],
    category: 'training_ld',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'ElevenLabs', 'ModelsLab']
  },
  {
    id: 'skill-simulator',
    name: 'Skill Simulator',
    tier: 'Enterprise',
    inputFormats: ['json', 'glb'],
    outputFormats: ['html', 'vr_experience', 'scorm'],
    category: 'training_ld',
    isCovered: true,
    notes: '+vr_exp, +scorm',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'certification-creator',
    name: 'Certification Creator',
    tier: 'Enterprise',
    inputFormats: ['json', 'xlsx'],
    outputFormats: ['scorm', 'pdf', 'html'],
    category: 'training_ld',
    isCovered: true,
    notes: '+scorm',
    providers: ['OpenAI', 'Claude']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 12: MARKETING/SALES - BASE (6 Pipelines)
// ═══════════════════════════════════════════════════════════════
const MARKETING_SALES_BASE_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'ad-generator',
    name: 'Ad Generator',
    tier: 'Pro',
    inputFormats: ['txt', 'png', 'mp4'],
    outputFormats: ['mp4', 'gif', 'png'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['OpenAI', 'ModelsLab', 'Claude']
  },
  {
    id: 'social-suite',
    name: 'Social Suite',
    tier: 'Pro',
    inputFormats: ['txt', 'png', 'mp4'],
    outputFormats: ['mp4', 'png', 'gif'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'OpenAI', 'ModelsLab']
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    tier: 'Pro',
    inputFormats: ['png', 'mp4', 'glb'],
    outputFormats: ['mp4', 'html', 'gif'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['ModelsLab', 'OpenAI', 'ElevenLabs']
  },
  {
    id: 'testimonial-creator',
    name: 'Testimonial Creator',
    tier: 'Pro',
    inputFormats: ['mp4', 'mp3', 'txt'],
    outputFormats: ['mp4', 'webm'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['ModelsLab', 'Alibaba', 'ElevenLabs']
  },
  {
    id: 'pitch-deck',
    name: 'Pitch Deck',
    tier: 'Pro',
    inputFormats: ['txt', 'json', 'xlsx'],
    outputFormats: ['pptx', 'pdf', 'mp4'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['OpenAI', 'Claude', 'Gemini']
  },
  {
    id: 'proposal-generator',
    name: 'Proposal Generator',
    tier: 'Pro',
    inputFormats: ['txt', 'json', 'docx'],
    outputFormats: ['pdf', 'docx', 'pptx'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'OpenAI']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 13: LOCALIZATION (6 Pipelines)
// ═══════════════════════════════════════════════════════════════
const LOCALIZATION_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'translate-video',
    name: 'Translate Video',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov', 'srt'],
    outputFormats: ['mp4', 'srt', 'vtt'],
    category: 'localization',
    isCovered: true,
    notes: '+srt, +vtt',
    providers: ['ElevenLabs', 'DeepL', 'Alibaba']
  },
  {
    id: 'dub-video',
    name: 'Dub Video',
    tier: 'Enterprise',
    inputFormats: ['mp4', 'mov'],
    outputFormats: ['mp4', 'mov'],
    category: 'localization',
    isCovered: true,
    providers: ['ElevenLabs', 'Alibaba', 'Azure']
  },
  {
    id: 'localize-slides',
    name: 'Localize Slides',
    tier: 'Pro',
    inputFormats: ['pptx', 'pdf'],
    outputFormats: ['pptx', 'pdf'],
    category: 'localization',
    isCovered: true,
    providers: ['DeepL', 'Alibaba', 'Google']
  },
  {
    id: 'multi-language-campaign',
    name: 'Multi-language Campaign',
    tier: 'Enterprise',
    inputFormats: ['mp4', 'png', 'txt'],
    outputFormats: ['mp4', 'png', 'txt'],
    category: 'localization',
    isCovered: true,
    providers: ['DeepL', 'ElevenLabs', 'Alibaba']
  },
  {
    id: 'voice-clone-dub',
    name: 'Voice Clone Dub',
    tier: 'Enterprise',
    inputFormats: ['mp4', 'mp3'],
    outputFormats: ['mp4', 'mp3'],
    category: 'localization',
    isCovered: true,
    providers: ['ElevenLabs', 'Alibaba']
  },
  {
    id: 'subtitle-generator',
    name: 'Subtitle Generator',
    tier: 'Starter',
    inputFormats: ['mp4', 'mp3'],
    outputFormats: ['srt', 'vtt', 'ass'],
    category: 'localization',
    isCovered: true,
    notes: '+srt, +vtt, +ass',
    providers: ['Azure', 'OpenAI', 'Alibaba']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 14: MARKETING-SPECIFIC (25 NEW Pipelines)
// ═══════════════════════════════════════════════════════════════
const MARKETING_SPECIFIC_PIPELINES: PipelineIOEntry[] = [
  {
    id: 'social-post-generator',
    name: 'Social Post Generator',
    tier: 'Pro',
    inputFormats: ['topic', 'brand'],
    outputFormats: ['10 platform-specific posts'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'Qwen', 'DALL-E']
  },
  {
    id: 'carousel-creator',
    name: 'Carousel Creator',
    tier: 'Pro',
    inputFormats: ['content', 'style'],
    outputFormats: ['Instagram carousel (10 slides)'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'DALL-E']
  },
  {
    id: 'social-video-script',
    name: 'Social Video Script',
    tier: 'Pro',
    inputFormats: ['topic'],
    outputFormats: ['60-sec video script + hooks'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'Gemini']
  },
  {
    id: 'hashtag-optimizer',
    name: 'Hashtag Optimizer',
    tier: 'Pro',
    inputFormats: ['content'],
    outputFormats: ['30 optimized hashtags + strategy'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'Qwen']
  },
  {
    id: 'thread-generator',
    name: 'Thread Generator',
    tier: 'Pro',
    inputFormats: ['article', 'topic'],
    outputFormats: ['Twitter/X thread (10-15 tweets)'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'reels-script-batch',
    name: 'Reels Script Batch',
    tier: 'Pro',
    inputFormats: ['5 topics'],
    outputFormats: ['5 Reels scripts with hooks'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'Gemini']
  },
  {
    id: 'linkedin-carousel',
    name: 'LinkedIn Carousel',
    tier: 'Pro',
    inputFormats: ['topic'],
    outputFormats: ['PDF carousel (10 slides)'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'DALL-E']
  },
  {
    id: 'ugc-brief-generator',
    name: 'UGC Brief Generator',
    tier: 'Pro',
    inputFormats: ['product'],
    outputFormats: ['UGC creator brief + shot list'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'email-sequence',
    name: 'Email Sequence',
    tier: 'Pro',
    inputFormats: ['product', 'goal'],
    outputFormats: ['5-email drip sequence'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'newsletter-template',
    name: 'Newsletter Template',
    tier: 'Pro',
    inputFormats: ['content'],
    outputFormats: ['Branded newsletter HTML'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'Resend']
  },
  {
    id: 'welcome-sequence',
    name: 'Welcome Sequence',
    tier: 'Pro',
    inputFormats: ['brand'],
    outputFormats: ['3-email onboarding flow'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'promo-email-ab',
    name: 'Promo Email A/B',
    tier: 'Pro',
    inputFormats: ['offer'],
    outputFormats: ['3 A/B variants of promo email'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'cold-outreach',
    name: 'Cold Outreach',
    tier: 'Pro',
    inputFormats: ['target', 'value'],
    outputFormats: ['5 cold email variants'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'ad-copy-generator',
    name: 'Ad Copy Generator',
    tier: 'Pro',
    inputFormats: ['product', 'audience'],
    outputFormats: ['10 ad copy variants'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'Gemini']
  },
  {
    id: 'ad-image-batch',
    name: 'Ad Image Batch',
    tier: 'Pro',
    inputFormats: ['brief'],
    outputFormats: ['5 ad images (1200x628)'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['DALL-E 3', 'ModelsLab']
  },
  {
    id: 'video-ad-script',
    name: 'Video Ad Script',
    tier: 'Pro',
    inputFormats: ['product'],
    outputFormats: ['30-sec video ad script'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'retargeting-ads',
    name: 'Retargeting Ads',
    tier: 'Pro',
    inputFormats: ['product'],
    outputFormats: ['5 retargeting ad variants'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'DALL-E']
  },
  {
    id: 'campaign-brief',
    name: 'Campaign Brief',
    tier: 'Pro',
    inputFormats: ['goal'],
    outputFormats: ['Full campaign brief + assets list'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'seo-blog-outline',
    name: 'SEO Blog Outline',
    tier: 'Pro',
    inputFormats: ['keyword'],
    outputFormats: ['SEO-optimized blog outline'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'meta-tags-batch',
    name: 'Meta Tags Batch',
    tier: 'Pro',
    inputFormats: ['5 pages'],
    outputFormats: ['Title + Description for 5 pages'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'content-repurpose',
    name: 'Content Repurpose',
    tier: 'Pro',
    inputFormats: ['blog post'],
    outputFormats: ['5 social posts + 1 thread + email'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'landing-page-copy',
    name: 'Landing Page Copy',
    tier: 'Pro',
    inputFormats: ['product'],
    outputFormats: ['Full landing page copy'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude']
  },
  {
    id: 'marketing-translate',
    name: 'Marketing Translate',
    tier: 'Pro',
    inputFormats: ['content', 'langs'],
    outputFormats: ['Translation to 5 languages'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['DeepL', 'Qwen']
  },
  {
    id: 'regional-adapt',
    name: 'Regional Adapt',
    tier: 'Pro',
    inputFormats: ['content', 'region'],
    outputFormats: ['Culturally adapted content'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['Claude', 'Qwen', 'Gemini']
  },
  {
    id: 'multilingual-campaign',
    name: 'Multilingual Campaign',
    tier: 'Enterprise',
    inputFormats: ['campaign'],
    outputFormats: ['Full campaign in 3 languages'],
    category: 'marketing_sales',
    isCovered: true,
    providers: ['DeepL', 'Regional LLM']
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY 15: CREATOR/ENHANCEMENT - CRITICAL USER DEMAND (22 NEW)
// ═══════════════════════════════════════════════════════════════
const CREATOR_ENHANCEMENT_PIPELINES: PipelineIOEntry[] = [
  // ─── VIDEO ENHANCEMENT ───────────────────────────────────────
  {
    id: 'ai-background-removal',
    name: 'AI Background Removal',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov', 'webm', 'png', 'jpg'],
    outputFormats: ['mp4', 'webm', 'png', 'mov_prores'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Remove/replace video backgrounds',
    providers: ['ModelsLab', 'Replicate', 'Azure']
  },
  {
    id: 'ai-video-upscaling',
    name: 'AI Video Upscaling',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov', 'webm'],
    outputFormats: ['mp4', 'mov', 'webm'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - 720p→4K enhancement',
    providers: ['ModelsLab', 'Replicate', 'Alibaba']
  },
  {
    id: 'ai-audio-enhancement',
    name: 'AI Audio Enhancement',
    tier: 'Pro',
    inputFormats: ['mp3', 'wav', 'mp4', 'mov'],
    outputFormats: ['mp3', 'wav', 'mp4'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Clean up bad audio, noise removal',
    providers: ['ElevenLabs', 'Azure', 'Alibaba']
  },
  {
    id: 'ai-green-screen',
    name: 'AI Green Screen',
    tier: 'Pro',
    inputFormats: ['mp4', 'mov', 'webm'],
    outputFormats: ['mp4', 'mov', 'webm'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'MEDIUM DEMAND - Auto-chroma key replacement',
    providers: ['ModelsLab', 'Replicate']
  },
  {
    id: 'ai-filler-removal',
    name: 'AI Filler Word Removal',
    tier: 'Pro',
    inputFormats: ['mp4', 'mp3', 'wav'],
    outputFormats: ['mp4', 'mp3', 'wav'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Remove ums, ahs, pauses',
    providers: ['ElevenLabs', 'Azure', 'OpenAI']
  },
  {
    id: 'ai-beat-sync-editing',
    name: 'AI Beat-Sync Editing',
    tier: 'Pro',
    inputFormats: ['mp4', 'mp3', 'clips_folder'],
    outputFormats: ['mp4', 'webm'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Auto-edit to music beats',
    providers: ['OpenAI', 'Gemini', 'ModelsLab']
  },
  
  // ─── CAPTIONS & SUBTITLES ────────────────────────────────────
  {
    id: 'ai-auto-captions',
    name: 'AI Auto-Captions',
    tier: 'Starter',
    inputFormats: ['mp4', 'mov', 'mp3', 'wav'],
    outputFormats: ['mp4', 'srt', 'vtt', 'ass'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'VERY HIGH DEMAND - Burned-in styled captions, table stakes',
    providers: ['Azure', 'OpenAI', 'Alibaba', 'ElevenLabs']
  },
  {
    id: 'ai-styled-captions',
    name: 'AI Styled Captions',
    tier: 'Pro',
    inputFormats: ['mp4', 'srt', 'vtt'],
    outputFormats: ['mp4', 'mov'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Trending caption styles (kinetic, highlight)',
    providers: ['ModelsLab', 'OpenAI']
  },
  {
    id: 'ai-realtime-translation',
    name: 'AI Real-time Translation',
    tier: 'Enterprise',
    inputFormats: ['webrtc', 'mp4_stream'],
    outputFormats: ['webrtc', 'srt_live'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'MEDIUM DEMAND - Live subtitle/dub during calls',
    providers: ['Azure', 'DeepL', 'Alibaba']
  },
  
  // ─── RECORDING TOOLS ─────────────────────────────────────────
  {
    id: 'ai-teleprompter',
    name: 'AI Teleprompter',
    tier: 'Pro',
    inputFormats: ['txt', 'docx', 'json'],
    outputFormats: ['overlay_stream', 'mp4'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Script scrolling while recording',
    providers: ['OpenAI', 'Claude']
  },
  {
    id: 'ai-screen-recording-edit',
    name: 'Screen Recording + AI Edit',
    tier: 'Pro',
    inputFormats: ['screen_capture', 'webrtc'],
    outputFormats: ['mp4', 'gif', 'webm'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Record screen, auto-edit highlights',
    providers: ['Gemini', 'OpenAI', 'ModelsLab']
  },
  {
    id: 'ai-meeting-clips',
    name: 'AI Meeting Clips',
    tier: 'Pro',
    inputFormats: ['mp4', 'webrtc', 'zoom_recording'],
    outputFormats: ['mp4', 'txt', 'json'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'MEDIUM DEMAND - Zoom/Teams→highlight clips',
    providers: ['Gemini', 'Claude', 'OpenAI']
  },
  
  // ─── CONTENT GENERATION ──────────────────────────────────────
  {
    id: 'ai-thumbnail-creator',
    name: 'AI Thumbnail Creator',
    tier: 'Starter',
    inputFormats: ['mp4', 'png', 'txt'],
    outputFormats: ['png', 'jpg', 'webp'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - YouTube/social thumbnails',
    providers: ['OpenAI', 'ModelsLab', 'Alibaba']
  },
  {
    id: 'ai-b-roll-generator',
    name: 'AI B-Roll Generator',
    tier: 'Pro',
    inputFormats: ['txt', 'mp4', 'json'],
    outputFormats: ['mp4', 'gif'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'MEDIUM DEMAND - Auto-generate B-roll footage',
    providers: ['ModelsLab', 'Alibaba', 'Replicate']
  },
  {
    id: 'ai-meme-generator',
    name: 'AI Meme Generator',
    tier: 'Starter',
    inputFormats: ['txt', 'trend_topic'],
    outputFormats: ['png', 'gif', 'mp4'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'MEDIUM DEMAND - Trend-aware meme creation',
    providers: ['OpenAI', 'Claude', 'ModelsLab']
  },
  {
    id: 'ai-photo-slideshow',
    name: 'AI Photo Slideshow',
    tier: 'Starter',
    inputFormats: ['png', 'jpg', 'photos_folder'],
    outputFormats: ['mp4', 'webm'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'MEDIUM DEMAND - Photos→animated video with Ken Burns',
    providers: ['ModelsLab', 'OpenAI']
  },
  {
    id: 'ai-progress-bar-animations',
    name: 'AI Progress Bar Animations',
    tier: 'Pro',
    inputFormats: ['mp4', 'json'],
    outputFormats: ['mp4', 'webm'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - TikTok-style progress indicators',
    providers: ['ModelsLab', 'OpenAI']
  },
  {
    id: 'ai-trending-templates',
    name: 'AI Trending Templates',
    tier: 'Pro',
    inputFormats: ['content', 'platform'],
    outputFormats: ['mp4', 'pptx', 'png'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Auto-apply trending formats',
    providers: ['Claude', 'Gemini', 'ModelsLab']
  },
  
  // ─── AVATAR & VOICE ──────────────────────────────────────────
  {
    id: 'ai-voice-clone-reuse',
    name: 'AI Voice Clone for Videos',
    tier: 'Enterprise',
    inputFormats: ['mp3', 'wav', 'voice_sample'],
    outputFormats: ['mp3', 'wav', 'mp4'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Clone my voice for other videos',
    providers: ['ElevenLabs', 'Alibaba', 'Azure']
  },
  {
    id: 'ai-streaming-avatars',
    name: 'AI Streaming Avatars',
    tier: 'Enterprise',
    inputFormats: ['webrtc', 'avatar_config'],
    outputFormats: ['webrtc_stream', 'mp4'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Real-time avatar for streaming',
    providers: ['Alibaba', 'ModelsLab', 'Azure']
  },
  {
    id: 'ai-avatar-library',
    name: 'Pre-built Avatar Library',
    tier: 'Pro',
    inputFormats: ['selection', 'script'],
    outputFormats: ['mp4', 'webm'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - 50+ ready-to-use avatars',
    providers: ['Alibaba', 'ModelsLab']
  },
  {
    id: 'ai-podcast-to-clips',
    name: 'AI Podcast to Clips',
    tier: 'Pro',
    inputFormats: ['mp3', 'mp4', 'wav'],
    outputFormats: ['mp4', 'mp3', 'json'],
    category: 'creator_enhancement',
    isCovered: true,
    notes: 'HIGH DEMAND - Turn podcast into viral clips',
    providers: ['Gemini', 'OpenAI', 'ElevenLabs']
  }
];

// ═══════════════════════════════════════════════════════════════
// COMBINED REGISTRY - ALL 141 PIPELINES (119 + 22 NEW)
// ═══════════════════════════════════════════════════════════════
export const PIPELINE_IO_REGISTRY: PipelineIOEntry[] = [
  ...TEXT_BASED_PIPELINES,           // 10
  ...IMAGE_BASED_PIPELINES,          // 8
  ...VOICE_AUDIO_PIPELINES,          // 8
  ...DOCUMENT_PPT_PIPELINES,         // 10
  ...VIDEO_BASED_PIPELINES,          // 9
  ..._3D_BASED_PIPELINES,            // 5
  ...AR_VR_SCENE_PIPELINES,          // 6
  ...COMPLEX_MULTIMODAL_PIPELINES,   // 7
  ...PRESENTATION_PIPELINES,         // 5
  ...REPURPOSING_PIPELINES,          // 8
  ...TRAINING_LD_PIPELINES,          // 6
  ...MARKETING_SALES_BASE_PIPELINES, // 6
  ...LOCALIZATION_PIPELINES,         // 6
  ...MARKETING_SPECIFIC_PIPELINES,   // 25
  ...CREATOR_ENHANCEMENT_PIPELINES,  // 22 NEW - Critical User Demand
];

// ═══════════════════════════════════════════════════════════════
// CATEGORY METADATA
// ═══════════════════════════════════════════════════════════════
export const PIPELINE_CATEGORY_METADATA: Record<PipelineIOCategory, {
  label: string;
  count: number;
  color: string;
  description: string;
}> = {
  text_based: {
    label: 'Category 1: Text-Based',
    count: 10,
    color: 'bg-blue-100 text-blue-800',
    description: 'Text input to various output formats'
  },
  image_based: {
    label: 'Category 2: Image-Based',
    count: 8,
    color: 'bg-green-100 text-green-800',
    description: 'Image input transformations'
  },
  voice_audio: {
    label: 'Category 3: Voice/Audio',
    count: 8,
    color: 'bg-purple-100 text-purple-800',
    description: 'Audio input transformations'
  },
  document_ppt: {
    label: 'Category 4: Document/PPT',
    count: 10,
    color: 'bg-orange-100 text-orange-800',
    description: 'Document and presentation transformations'
  },
  video_based: {
    label: 'Category 5: Video-Based',
    count: 9,
    color: 'bg-red-100 text-red-800',
    description: 'Video input transformations'
  },
  '3d_based': {
    label: 'Category 6: 3D-Based',
    count: 5,
    color: 'bg-cyan-100 text-cyan-800',
    description: '3D model transformations'
  },
  ar_vr_scene: {
    label: 'Category 7: AR/VR Scene',
    count: 6,
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Immersive experience generation'
  },
  complex_multimodal: {
    label: 'Category 8: Complex Multi-modal',
    count: 7,
    color: 'bg-pink-100 text-pink-800',
    description: 'Multi-input complex workflows'
  },
  presentation: {
    label: 'Category 9: Presentation',
    count: 5,
    color: 'bg-amber-100 text-amber-800',
    description: 'Presentation generation workflows'
  },
  repurposing: {
    label: 'Category 10: Repurposing',
    count: 8,
    color: 'bg-teal-100 text-teal-800',
    description: 'Content repurposing workflows'
  },
  training_ld: {
    label: 'Category 11: Training/L&D',
    count: 6,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Learning & development workflows'
  },
  marketing_sales: {
    label: 'Category 12-14: Marketing/Sales',
    count: 31, // 6 base + 25 specific
    color: 'bg-rose-100 text-rose-800',
    description: 'Marketing and sales content generation'
  },
  localization: {
    label: 'Category 13: Localization',
    count: 6,
    color: 'bg-emerald-100 text-emerald-800',
    description: 'Multi-language and regional adaptation'
  },
  creator_enhancement: {
    label: 'Category 15: Creator/Enhancement',
    count: 22,
    color: 'bg-fuchsia-100 text-fuchsia-800',
    description: 'Critical user-demand tools: captions, upscaling, backgrounds, thumbnails'
  },
  podcast_webcast: {
    label: 'Category 16: Podcast/Webcast',
    count: 16,
    color: 'bg-violet-100 text-violet-800',
    description: 'Podcast and webcast creation pipelines'
  },
  editing: {
    label: 'Category 17: Editing',
    count: 15,
    color: 'bg-slate-100 text-slate-800',
    description: 'FFmpeg-wrapped video/audio editing pipelines'
  },
  mobile: {
    label: 'Category 18: Mobile',
    count: 5,
    color: 'bg-lime-100 text-lime-800',
    description: 'Mobile record-to-publish pipelines'
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════
export function getPipelinesByIOCategory(category: PipelineIOCategory): PipelineIOEntry[] {
  return PIPELINE_IO_REGISTRY.filter(p => p.category === category);
}

export function getPipelinesByTier(tier: PipelineTier): PipelineIOEntry[] {
  return PIPELINE_IO_REGISTRY.filter(p => p.tier === tier);
}

export function getCoveredPipelines(): PipelineIOEntry[] {
  return PIPELINE_IO_REGISTRY.filter(p => p.isCovered);
}

export function getPipelineInputFormats(): string[] {
  const formats = new Set<string>();
  PIPELINE_IO_REGISTRY.forEach(p => p.inputFormats.forEach(f => formats.add(f)));
  return Array.from(formats).sort();
}

export function getPipelineOutputFormats(): string[] {
  const formats = new Set<string>();
  PIPELINE_IO_REGISTRY.forEach(p => p.outputFormats.forEach(f => formats.add(f)));
  return Array.from(formats).sort();
}

export function getPipelineStats() {
  const total = PIPELINE_IO_REGISTRY.length;
  const covered = PIPELINE_IO_REGISTRY.filter(p => p.isCovered).length;
  
  const byTier = {
    Starter: PIPELINE_IO_REGISTRY.filter(p => p.tier === 'Starter').length,
    Pro: PIPELINE_IO_REGISTRY.filter(p => p.tier === 'Pro').length,
    Enterprise: PIPELINE_IO_REGISTRY.filter(p => p.tier === 'Enterprise').length
  };

  const byCategory = Object.entries(PIPELINE_CATEGORY_METADATA).map(([key, meta]) => ({
    category: key,
    label: meta.label,
    count: PIPELINE_IO_REGISTRY.filter(p => p.category === key).length
  }));

  return {
    total,
    covered,
    coveragePercent: Math.round((covered / total) * 100),
    byTier,
    byCategory,
    inputFormatCount: getPipelineInputFormats().length,
    outputFormatCount: getPipelineOutputFormats().length
  };
}
