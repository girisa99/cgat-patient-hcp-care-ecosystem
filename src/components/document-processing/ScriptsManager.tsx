import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  FileText, 
  Mic, 
  Volume2, 
  Loader2, 
  Play, 
  Pause,
  Trash2,
  Plus,
  Clock,
  FileAudio,
  Video,
  RefreshCw,
  Edit3,
  Link,
  Camera
} from 'lucide-react';
import { VideoRecorder } from './VideoRecorder';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface GeneratedAudio {
  id: string;
  name: string;
  textLength: number;
  chunks: number;
  audioUrl: string;
  storagePath?: string; // Path in Supabase storage
  generatedAt: Date;
  voice: string;
  scriptText?: string; // Original script text for editing
  scriptType?: 'video' | 'audio'; // Type of script used
}

// Predefined scripts - Video Script with visual cues
const VIDEO_SCRIPT = `# AI Document Processing: Enterprise Edition
## Voice-Over Script — Part 1: Patient Onboarding

**Total Runtime: ~11 minutes**

---

# SCENE 1: OPENING
**[0:00 - 2:30]**

*[Show title card, then transition to screen recording]*

Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the **technical architecture** and **functional** sides.

**Technical Architecture Enhancements:**

**Multi-Model AI Routing System:**
- Content-aware model selection based on document characteristics
- Specialized models for different content types—tables, handwriting, medical images
- Dynamic routing logic that chooses the optimal AI model per document

**Configuration-Driven Architecture:**
- Document type configurations externalized from code
- Field mapping rules configurable per document category
- Processing hints that enable specialized pipelines like NDC lookup

**Two-Stage Pipeline with Provider Abstraction:**
- OCR layer with dynamic provider selection—Google Vision, AWS Textract, Azure Form Recognizer
- NLP layer with multi-model routing based on document complexity
- Interface patterns that allow swapping providers without pipeline changes

---

# SCENE 2: MULTI-MODEL ROUTING ARCHITECTURE
**[2:30 - 4:30]**

*[Navigate to Architecture Diagram → Content Type Routing tab]*

The biggest architectural change is **intelligent multi-model routing**.

Before — Single Model Approach:
- One AI model processed every document type
- Same extraction logic regardless of content
- Generic prompts with no document-type optimization
- Accuracy dropped significantly on specialized content

After — Content-Aware Routing System:

The system now analyzes document characteristics and routes to specialized models:

**Tables and Structured Data:**
- Gemini 2.5 Flash for structure recognition
- AWS Textract for precise cell extraction
- Optimized for invoices, forms, and tabular medical records

**Medical Imaging:**
- GPT-5 for radiology analysis and findings
- Med-PaLM 2 for clinical interpretation
- X-rays, CT scans, MRI reports

**Lab Results:**
- Claude Sonnet for result interpretation
- Gemini Pro for reference range validation
- Blood tests, pathology reports, urinalysis

**Handwritten Content:**
- Google Vision for handwriting OCR
- GPT-5 Mini for contextual correction
- Physician notes, handwritten prescriptions

Each routing decision is logged with the model selected, confidence threshold applied, and processing time.

---

# PRODUCTION NOTES

## Key Technical Points to Emphasize
1. Multi-model routing based on content type
2. Configuration-driven document types
3. Provider abstraction pattern (OCR and NLP)
4. Two-stage pipeline architecture
5. Per-field confidence scoring
6. Cross-document validation in workflows

## YouTube Timestamps
0:00 Introduction & Technical Enhancements
2:30 Multi-Model Routing Architecture
4:30 Configuration-Driven Document Types
6:30 Two-Stage Pipeline Architecture
8:00 Patient Onboarding Technical Demo
10:30 What's Next: Sub-Agent Architecture

---

*Version 3.0 | January 2025 | Technical Focus*`;

// Audio Script - Voice-over only, no visual cues
const AUDIO_SCRIPT = `Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the technical architecture and functional sides.

On the technical architecture side:

First, a Multi-Model AI Routing System. The platform now performs content-aware model selection based on document characteristics. Specialized models handle different content types—tables, handwriting, medical images. Dynamic routing logic chooses the optimal AI model for each document.

Second, Configuration-Driven Architecture. Document type configurations are externalized from code. Field mapping rules are configurable per document category. Processing hints enable specialized pipelines like NDC medication lookup.

Third, a Two-Stage Pipeline with Provider Abstraction. The OCR layer dynamically selects providers—Google Vision, AWS Textract, or Azure Form Recognizer. The NLP layer routes to different models based on document complexity. Interface patterns allow swapping providers without changing the pipeline.

On the functional side:

Intelligent multi-model routing means automatic model selection based on document type, confidence-based routing with fallback strategies, and cost optimization through model tiering.

Dynamic field discovery allows extracting fields from any document type without pre-configuration, schema inference from document structure, and flexible field mapping with validation rules.

Enhanced confidence scoring provides per-field confidence from zero to 100 percent, healthcare-specific validation against clinical rules, and human-in-the-loop triggers at configurable thresholds.

Healthcare-specific integrations include NDC medication database lookups for prescription validation, ICD-10 and CPT code search, insurance payer database integration, and seamless patient onboarding workflow integration.

What started as a proof-of-concept now has production-ready architecture and functionality.

Let me walk you through the technical transformation.

The biggest architectural change is intelligent multi-model routing.

Before, with the single model approach, one AI model processed every document type. The same extraction logic ran regardless of content. Generic prompts had no document-type optimization. Accuracy dropped significantly on specialized content.

Now, with the content-aware routing system, the platform analyzes document characteristics and routes to specialized models.

For tables and structured data: Gemini 2.5 Flash handles structure recognition. AWS Textract performs precise cell extraction. This path is optimized for invoices, forms, and tabular medical records.

For medical imaging: GPT-5 analyzes radiology findings. Med-PaLM 2 provides clinical interpretation. This handles X-rays, CT scans, and MRI reports.

For lab results: Claude Sonnet interprets results. Gemini Pro validates reference ranges. This covers blood tests, pathology reports, and urinalysis.

For handwritten content: Google Vision performs handwriting OCR. GPT-5 Mini applies contextual correction. This handles physician notes and handwritten prescriptions.

Each routing decision is logged with the model selected, confidence threshold applied, and processing time.

The second major enhancement is configuration-driven architecture.

Previously, adding a new document type meant writing custom code—new components, new extraction logic, new field mappings.

Now, document types are defined in configuration. A document type config includes the ID, category, expected fields, and processing hints. Processing hints specify options like enable OCR, enable medication lookup, and preferred OCR provider.

What does this enable? You can add new document types without code changes. You can A/B test different field extraction strategies. Per-document-type model selection becomes trivial. Custom validation rules can be defined per category.

The processing hints system drives dynamic behavior. Enable medication lookup triggers NDC database integration. Enable table extraction activates the AWS Textract pipeline. Preferred OCR provider routes to a specific OCR service. Confidence threshold sets the human review trigger level.

This pattern follows the Open/Closed Principle—the system is open for extension but closed for modification.

The processing foundation is a two-stage pipeline with provider abstraction.

Stage 1 is the OCR layer with provider selection. The system dynamically selects OCR providers based on document characteristics. Google Cloud Vision for general-purpose printed text. AWS Textract for superior table and form extraction. Azure Form Recognizer for structured documents.

Provider selection logic considers document type from classification, presence of tables or forms, handwriting detection results, and cost optimization rules.

Stage 2 is NLP entity extraction. After OCR, the text flows through entity extraction. Prompt templates are document-type-specific. Field schemas define expected fields with types and validation rules. Confidence scoring provides per-field certainty from zero to 100 percent.

The key technical pattern is provider abstraction. Both OCR and NLP layers use a provider interface pattern. This means swapping providers—or adding new ones—requires zero changes to the processing pipeline.

Let's see the architecture in action with patient onboarding.

Patient onboarding is architecturally interesting because it demonstrates multi-document workflow chaining, cross-document validation, and multiple extraction pipelines in sequence.

Watch the processing stages. Document classification identifies type as patient enrollment. Config lookup loads processing hints and field schema. OCR provider selected is Google Vision for printed form. NLP model routed is Gemini 2.5 Flash for structured extraction.

Each extracted field includes metadata. Value is the extracted content. Confidence is model certainty from zero to one. Source indicates OCR-derived or NLP-inferred. Validation status shows passed, warning, or failed.

The system performs cross-document validation. Patient name is checked for consistency across all documents. Date of birth is verified between forms. Insurance member ID is matched against card scan.

This is enabled by workflow context that persists across document processing.

So that's the technical architecture—configuration-driven document types, multi-model routing, and a two-stage pipeline with provider abstraction.

But there's one more architectural pattern I haven't shown yet.

You might have noticed a dialog appearing after processing—Sub-Agent Recommendations.

This is the next evolution: after extracting data, the system can recommend and orchestrate follow-up AI agents. Insurance eligibility verification agent. Prior authorization agent. Care team notification agent.

These agents are dynamically generated based on document context and connected through an MCP SDK integration layer.

But that architecture deserves its own deep dive.

In Part 2, I'll cover sub-agent generation from document context, the workflow canvas for visual agent orchestration, MCP SDK integration patterns, and event-driven agent communication.

If you're building AI-powered document systems, subscribe for the technical deep dive.

Full architecture documentation is linked in the description.

Thanks for watching!`;

// Preset scripts for loading
const PRESET_SCRIPTS = {
  videoScript: {
    name: 'Video Script - Patient Onboarding',
    content: VIDEO_SCRIPT,
    type: 'video' as const
  },
  audioScript: {
    name: 'Audio Script - Patient Onboarding',
    content: AUDIO_SCRIPT,
    type: 'audio' as const
  }
};

export const ScriptsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scripts');
  const [scriptText, setScriptText] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [scriptType, setScriptType] = useState<'video' | 'audio'>('audio');
  const [selectedVoice, setSelectedVoice] = useState('onyx');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});
  const { showSuccess, showError } = useMasterToast();

  // Load saved audios metadata from localStorage on mount (only metadata, not audio data)
  useEffect(() => {
    const saved = localStorage.getItem('generatedAudiosMetadata');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reconstruct audio URLs from storage paths
        const audiosWithUrls = parsed.map((a: any) => {
          let audioUrl = a.audioUrl;
          if (a.storagePath) {
            const { data } = supabase.storage.from('generated-audio').getPublicUrl(a.storagePath);
            audioUrl = data.publicUrl;
          }
          return {
            ...a,
            audioUrl,
            generatedAt: new Date(a.generatedAt),
            scriptText: a.scriptText, // Preserve script text
            scriptType: a.scriptType // Preserve script type
          };
        });
        setGeneratedAudios(audiosWithUrls);
      } catch (e) {
        console.error('Failed to load saved audios:', e);
      }
    }
    
    // Clear old localStorage data that was storing full audio
    localStorage.removeItem('generatedAudios');
  }, []);

  // Save only metadata to localStorage (not audio data, but include scriptText)
  useEffect(() => {
    if (generatedAudios.length > 0) {
      const metadata = generatedAudios.map(a => ({
        id: a.id,
        name: a.name,
        textLength: a.textLength,
        chunks: a.chunks,
        storagePath: a.storagePath,
        generatedAt: a.generatedAt,
        voice: a.voice,
        audioUrl: a.storagePath ? '' : a.audioUrl, // Only keep URL if no storage path
        scriptText: a.scriptText, // Store script text for editing/regenerating
        scriptType: a.scriptType // Store script type
      }));
      localStorage.setItem('generatedAudiosMetadata', JSON.stringify(metadata));
    }
  }, [generatedAudios]);

  const cleanScriptForTTS = (text: string): string => {
    return text
      .replace(/^#.*$/gm, '') // Remove headers
      .replace(/\*\*.*?\*\*/g, (match) => match.replace(/\*\*/g, '')) // Remove bold markers
      .replace(/\*.*?\*/g, (match) => match.replace(/\*/g, '')) // Remove italic markers
      .replace(/`.*?`/g, (match) => match.replace(/`/g, '')) // Remove code markers
      .replace(/---/g, '') // Remove horizontal rules
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();
  };

  const [generationProgress, setGenerationProgress] = useState<string>('');

  const handleGenerateAudio = async () => {
    if (!scriptText.trim()) {
      showError('Please enter or paste a script first');
      return;
    }

    if (!scriptName.trim()) {
      showError('Please enter a name for this audio');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Preparing...');
    
    try {
      const cleanedScript = cleanScriptForTTS(scriptText);
      
      console.log(`Sending ${cleanedScript.length} characters to TTS`);

      // First call to get chunks info or direct audio
      const { data: initialData, error: initialError } = await supabase.functions.invoke('openai-tts', {
        body: { 
          text: cleanedScript, 
          voice: selectedVoice,
          speed: 1.0 
        }
      });

      if (initialError) throw initialError;

      let audioBlob: Blob;
      let totalChunks = 1;

      if (initialData?.needsChunking) {
        // Process chunks client-side to avoid memory issues on server
        const chunks = initialData.chunks as string[];
        totalChunks = chunks.length;
        const audioChunks: string[] = [];

        console.log(`Processing ${totalChunks} chunks client-side`);

        for (let i = 0; i < chunks.length; i++) {
          setGenerationProgress(`Processing chunk ${i + 1} of ${totalChunks}...`);
          
          const { data: chunkData, error: chunkError } = await supabase.functions.invoke('openai-tts', {
            body: { 
              text: chunks[i], 
              voice: selectedVoice,
              speed: 1.0,
              chunkIndex: i,
              totalChunks: totalChunks
            }
          });

          if (chunkError) throw chunkError;
          if (!chunkData?.audioContent) throw new Error(`No audio content for chunk ${i + 1}`);
          
          audioChunks.push(chunkData.audioContent);
        }

        setGenerationProgress('Combining audio...');
        
        // Combine audio chunks client-side
        const combinedBlobs: Blob[] = [];
        for (const base64Chunk of audioChunks) {
          const binaryString = atob(base64Chunk);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          combinedBlobs.push(new Blob([bytes], { type: 'audio/mpeg' }));
        }

        // Create combined blob
        audioBlob = new Blob(combinedBlobs, { type: 'audio/mpeg' });
        
      } else if (initialData?.audioContent) {
        // Short text processed directly - convert base64 to blob
        const binaryString = atob(initialData.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      } else {
        throw new Error('No audio content received');
      }

      setGenerationProgress('Uploading to storage...');
      
      // Upload to Supabase Storage instead of storing in localStorage
      const audioId = crypto.randomUUID();
      const storagePath = `${audioId}.mp3`;
      
      const { error: uploadError } = await supabase.storage
        .from('generated-audio')
        .upload(storagePath, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to save audio: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('generated-audio')
        .getPublicUrl(storagePath);

      // Also save to generated_media table so it appears in Video Studio
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('generated_media')
          .insert({
            user_id: user.id,
            name: scriptName,
            file_type: 'audio',
            storage_bucket: 'generated-audio',
            storage_path: storagePath,
            file_url: urlData.publicUrl,
            source: 'generated',
            metadata: { 
              voice: selectedVoice, 
              scriptType: scriptType,
              textLength: cleanedScript.length,
              chunks: totalChunks
            },
          });
      }

      const newAudio: GeneratedAudio = {
        id: audioId,
        name: scriptName,
        textLength: cleanedScript.length,
        chunks: totalChunks,
        audioUrl: urlData.publicUrl,
        storagePath,
        generatedAt: new Date(),
        voice: selectedVoice,
        scriptText: scriptText, // Store original script for editing
        scriptType: scriptType // Store script type (video or audio)
      };

      setGeneratedAudios(prev => [newAudio, ...prev]);
      setActiveTab('library');
      
      showSuccess(`Audio generated and saved! (${totalChunks} chunk${totalChunks > 1 ? 's' : ''}, ${Math.round(cleanedScript.length / 1000)}k chars)`);
      
      // Clear the form
      setScriptText('');
      setScriptName('');
      setScriptType('audio');
      
    } catch (error) {
      console.error('TTS generation error:', error);
      showError('Failed to generate audio: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const handleDownloadAudio = async (audio: GeneratedAudio) => {
    try {
      // Fetch the audio as blob to force download (download attribute doesn't work for cross-origin URLs)
      const response = await fetch(audio.audioUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${audio.name.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      showSuccess('Audio downloaded');
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(audio.audioUrl, '_blank');
      showError('Could not download directly, opened in new tab');
    }
  };

  const handlePlayPause = (audio: GeneratedAudio) => {
    if (playingId === audio.id) {
      // Pause current
      audioElements[audio.id]?.pause();
      setPlayingId(null);
    } else {
      // Stop any currently playing
      if (playingId && audioElements[playingId]) {
        audioElements[playingId].pause();
      }

      // Create or play audio
      let audioEl = audioElements[audio.id];
      if (!audioEl) {
        audioEl = new Audio(audio.audioUrl);
        audioEl.onended = () => setPlayingId(null);
        setAudioElements(prev => ({ ...prev, [audio.id]: audioEl }));
      }
      
      audioEl.play();
      setPlayingId(audio.id);
    }
  };

  const handleDeleteAudio = async (id: string) => {
    const audioToDelete = generatedAudios.find(a => a.id === id);
    
    if (playingId === id && audioElements[id]) {
      audioElements[id].pause();
      setPlayingId(null);
    }
    
    // Delete from Supabase Storage if storagePath exists
    if (audioToDelete?.storagePath) {
      try {
        const { error } = await supabase.storage
          .from('generated-audio')
          .remove([audioToDelete.storagePath]);
        
        if (error) {
          console.error('Failed to delete from storage:', error);
          showError('Audio removed from library but failed to delete from storage');
        } else {
          console.log('Deleted from storage:', audioToDelete.storagePath);
        }
      } catch (err) {
        console.error('Storage deletion error:', err);
      }
    }
    
    setGeneratedAudios(prev => prev.filter(a => a.id !== id));
    const newAudios = generatedAudios.filter(a => a.id !== id);
    if (newAudios.length === 0) {
      localStorage.removeItem('generatedAudiosMetadata');
    }
    showSuccess('Audio deleted');
  };

  const handleAttachScript = (audioId: string, scriptKey: 'videoScript' | 'audioScript') => {
    const preset = PRESET_SCRIPTS[scriptKey];
    setGeneratedAudios(prev => prev.map(audio => 
      audio.id === audioId 
        ? { ...audio, scriptText: preset.content, scriptType: preset.type }
        : audio
    ));
    showSuccess(`Attached ${preset.type} script to audio`);
  };

  const handleEditScript = (audio: GeneratedAudio) => {
    if (audio.scriptText) {
      setScriptText(audio.scriptText);
      setScriptName(audio.name);
      setSelectedVoice(audio.voice);
      setScriptType(audio.scriptType || 'audio');
      setActiveTab('generate');
      showSuccess(`Loaded ${audio.scriptType || 'audio'} script: ${audio.name}`);
    } else {
      showError('Script text not available for this audio');
    }
  };

  const handleRegenerateAudio = async (audio: GeneratedAudio) => {
    if (!audio.scriptText) {
      showError('Script text not available - cannot regenerate');
      return;
    }

    // Delete old file from storage first
    if (audio.storagePath) {
      try {
        await supabase.storage
          .from('generated-audio')
          .remove([audio.storagePath]);
      } catch (err) {
        console.error('Failed to delete old audio:', err);
      }
    }

    // Set form with audio's script and regenerate
    setScriptText(audio.scriptText);
    setScriptName(audio.name);
    setSelectedVoice(audio.voice);
    setScriptType(audio.scriptType || 'audio');
    
    // Remove the old entry
    setGeneratedAudios(prev => prev.filter(a => a.id !== audio.id));
    
    // Switch to generate tab and trigger generation
    setActiveTab('generate');
    showSuccess('Ready to regenerate - click Generate MP3');
  };

  const loadPresetScript = (key: keyof typeof PRESET_SCRIPTS) => {
    const preset = PRESET_SCRIPTS[key];
    setScriptText(preset.content);
    setScriptName(preset.name);
    setScriptType(preset.type);
    showSuccess(`Loaded preset: ${preset.name}`);
  };

  const handleDownloadScript = () => {
    if (!scriptText.trim()) {
      showError('No script to download');
      return;
    }
    const blob = new Blob([scriptText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptName || 'script'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Script downloaded');
  };

  const handleDownloadPresetScript = (key: keyof typeof PRESET_SCRIPTS) => {
    const preset = PRESET_SCRIPTS[key];
    const blob = new Blob([preset.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.name.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess(`Downloaded: ${preset.name}`);
  };

  const estimateAudioDuration = (text: string): string => {
    // Average speaking rate is about 150 words per minute
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 150);
    return `~${minutes} min`;
  };

  return (
    <Card style={{ backgroundColor: '#1e293b', borderColor: '#475569' }} className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#ffffff' }}>
          <FileAudio className="h-5 w-5" style={{ color: '#4ade80' }} />
          Scripts & Audio Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full gap-2 p-2 rounded-lg border border-border/50 shadow-sm" style={{ backgroundColor: '#1e293b' }}>
            <TabsTrigger 
              value="scripts" 
              className="flex-1 rounded-md font-medium transition-all data-[state=active]:shadow-md px-3 py-2 text-sm whitespace-nowrap" 
              style={{ 
                backgroundColor: activeTab === 'scripts' ? '#7c3aed' : '#334155',
                color: '#ffffff',
                border: 'none'
              }}
            >
              <FileText className="h-4 w-4 mr-1.5 shrink-0" />
              <span>Scripts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="generate" 
              className="flex-1 rounded-md font-medium transition-all data-[state=active]:shadow-md px-3 py-2 text-sm whitespace-nowrap"
              style={{ 
                backgroundColor: activeTab === 'generate' ? '#16a34a' : '#334155',
                color: '#ffffff',
                border: 'none'
              }}
            >
              <Volume2 className="h-4 w-4 mr-1.5 shrink-0" />
              <span>Generate Audio</span>
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="flex-1 rounded-md font-medium transition-all data-[state=active]:shadow-md px-3 py-2 text-sm whitespace-nowrap"
              style={{ 
                backgroundColor: activeTab === 'video' ? '#ea580c' : '#334155',
                color: '#ffffff',
                border: 'none'
              }}
            >
              <Camera className="h-4 w-4 mr-1.5 shrink-0" />
              <span>Video Studio</span>
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="flex-1 rounded-md font-medium transition-all data-[state=active]:shadow-md px-3 py-2 text-sm whitespace-nowrap"
              style={{ 
                backgroundColor: activeTab === 'library' ? '#2563eb' : '#334155',
                color: '#ffffff',
                border: 'none'
              }}
            >
              <FileAudio className="h-4 w-4 mr-1.5 shrink-0" />
              <span>Library ({generatedAudios.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Scripts Tab - Download original scripts */}
          <TabsContent value="scripts" className="mt-4 space-y-4">
            <p style={{ color: '#ffffff', fontWeight: 500 }} className="text-sm">
              Download the complete scripts for Part 1: Patient Onboarding <span style={{ color: '#fbbf24' }}>(~11 minutes)</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Video Script Card */}
              <div className="rounded-lg border p-4" style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#7c3aed33' }}>
                    <Video className="h-5 w-5" style={{ color: '#a78bfa' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#ffffff' }}>Video Script</h3>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>With visual cues & timestamps</p>
                  </div>
                </div>
                <ul className="text-xs space-y-1 mb-4" style={{ color: '#cbd5e1' }}>
                  <li>• Scene-by-scene breakdown</li>
                  <li>• Visual direction notes</li>
                  <li>• Production notes included</li>
                  <li>• Technical architecture focus</li>
                </ul>
                <Button 
                  onClick={() => handleDownloadPresetScript('videoScript')}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: 'none' }}
                >
                  <Download className="h-4 w-4" />
                  Download Video Script
                </Button>
              </div>

              {/* Audio Script Card */}
              <div className="rounded-lg border p-4" style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#22c55e33' }}>
                    <Mic className="h-5 w-5" style={{ color: '#4ade80' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#ffffff' }}>Audio Script</h3>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Voice-over only, no visual cues</p>
                  </div>
                </div>
                <ul className="text-xs space-y-1 mb-4" style={{ color: '#cbd5e1' }}>
                  <li>• Clean voice-over text</li>
                  <li>• Ready for recording</li>
                  <li>• Natural speech flow</li>
                  <li>• Technical content focus</li>
                </ul>
                <Button 
                  onClick={() => handleDownloadPresetScript('audioScript')}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#22c55e', color: '#ffffff', border: 'none' }}
                >
                  <Download className="h-4 w-4" />
                  Download Audio Script
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1e3a5f', border: '1px solid #3b82f6' }}>
              <p className="text-sm" style={{ color: '#ffffff' }}>
                <strong style={{ color: '#60a5fa' }}>Part 1 covers:</strong> Multi-model routing architecture, configuration-driven document types, 
                two-stage pipeline with provider abstraction, and patient onboarding demo with cross-document validation.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="mt-4 space-y-4">
            {/* Preset Scripts */}
            <div className="p-3 rounded-lg border" style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}>
              <Label className="text-sm mb-2 block" style={{ color: '#ffffff', fontWeight: 500 }}>Load Preset Script (for TTS generation)</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => loadPresetScript('audioScript')}
                  className="text-xs"
                  style={{ backgroundColor: '#22c55e', color: '#ffffff', border: 'none' }}
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Audio Script (~11 min)
                </Button>
                <Button
                  size="sm"
                  onClick={() => loadPresetScript('videoScript')}
                  className="text-xs"
                  style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: 'none' }}
                >
                  <Video className="h-3 w-3 mr-1" />
                  Video Script (with cues)
                </Button>
              </div>
            </div>

            {/* Script Input */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="scriptName" className="text-sm" style={{ color: '#ffffff', fontWeight: 500 }}>Audio Name</Label>
                  <Input
                    id="scriptName"
                    value={scriptName}
                    onChange={(e) => setScriptName(e.target.value)}
                    placeholder="e.g., Patient Onboarding Part 1"
                    className="border"
                    style={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#ffffff' }}
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor="scriptType" className="text-sm" style={{ color: '#ffffff', fontWeight: 500 }}>Script Type</Label>
                  <select
                    id="scriptType"
                    value={scriptType}
                    onChange={(e) => setScriptType(e.target.value as 'video' | 'audio')}
                    className="w-full h-10 px-3 rounded-md border text-sm"
                    style={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#ffffff' }}
                  >
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="w-40">
                  <Label htmlFor="voice" className="text-sm" style={{ color: '#ffffff', fontWeight: 500 }}>Voice</Label>
                  <select
                    id="voice"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border text-sm"
                    style={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#ffffff' }}
                  >
                    <option value="alloy">Alloy (Neutral)</option>
                    <option value="echo">Echo (Male)</option>
                    <option value="fable">Fable (British)</option>
                    <option value="onyx">Onyx (Deep Male)</option>
                    <option value="nova">Nova (Female)</option>
                    <option value="shimmer">Shimmer (Soft Female)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="scriptText" className="font-medium" style={{ color: '#ffffff' }}>Script Text</Label>
                  {scriptText && (
                    <span className="text-xs px-2 py-1 rounded" style={{ color: '#e2e8f0', backgroundColor: '#334155' }}>
                      {scriptText.length.toLocaleString()} chars | {scriptText.split(/\s+/).length.toLocaleString()} words | {estimateAudioDuration(scriptText)}
                    </span>
                  )}
                </div>
                <textarea
                  id="scriptText"
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Paste or type your script here. Markdown formatting will be removed for TTS."
                  className="w-full min-h-[450px] rounded-md border font-mono text-sm leading-relaxed focus:ring-2 focus:outline-none resize-y p-4"
                  style={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#475569',
                    color: '#f1f5f9',
                    caretColor: '#22c55e'
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateAudio}
                disabled={isGenerating || !scriptText.trim() || !scriptName.trim()}
                className="flex-1"
                style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {generationProgress || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Generate MP3
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadScript}
                disabled={!scriptText.trim()}
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                <Download className="h-4 w-4 mr-2" />
                Save Script
              </Button>
            </div>

            {isGenerating && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#422006', border: '1px solid #f59e0b' }}>
                <p className="text-sm" style={{ color: '#fef3c7' }}>
                  <strong style={{ color: '#fbbf24' }}>Processing:</strong> Long scripts are automatically split into chunks and combined. 
                  This may take a few moments for longer scripts.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Video Studio Tab */}
          <TabsContent value="video" className="mt-4">
            <VideoRecorder />
          </TabsContent>

          <TabsContent value="library" className="mt-4">
            {generatedAudios.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#94a3b8' }}>
                <FileAudio className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p style={{ color: '#ffffff' }}>No audio files generated yet</p>
                <p className="text-sm mt-1">Generate your first audio from the "Generate Audio" tab</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {generatedAudios.map((audio) => (
                    <div key={audio.id} className="rounded-lg border p-4" style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayPause(audio)}
                            className="h-10 w-10 rounded-full"
                            style={{ backgroundColor: '#22c55e33' }}
                          >
                            {playingId === audio.id ? (
                              <Pause className="h-5 w-5" style={{ color: '#4ade80' }} />
                            ) : (
                              <Play className="h-5 w-5" style={{ color: '#4ade80' }} />
                            )}
                          </Button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium" style={{ color: '#ffffff' }}>{audio.name}</h4>
                              {audio.scriptType && (
                                <span 
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{ 
                                    backgroundColor: audio.scriptType === 'video' ? '#7c3aed33' : '#22c55e33',
                                    color: audio.scriptType === 'video' ? '#a78bfa' : '#4ade80'
                                  }}
                                >
                                  {audio.scriptType === 'video' ? (
                                    <span className="flex items-center gap-1">
                                      <Video className="h-3 w-3" />
                                      Video
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Mic className="h-3 w-3" />
                                      Audio
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs" style={{ color: '#94a3b8' }}>
                              <span className="flex items-center gap-1">
                                <Mic className="h-3 w-3" />
                                {audio.voice}
                              </span>
                              <span>{Math.round(audio.textLength / 1000)}k chars</span>
                              <span>{audio.chunks} chunk{audio.chunks > 1 ? 's' : ''}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {audio.generatedAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {audio.scriptText ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleEditScript(audio)}
                                title="Edit script"
                                style={{ backgroundColor: '#8b5cf6', color: '#ffffff', border: 'none' }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRegenerateAudio(audio)}
                                title="Regenerate audio"
                                style={{ backgroundColor: '#f59e0b', color: '#ffffff', border: 'none' }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleAttachScript(audio.id, 'audioScript')}
                                title="Attach Audio Script"
                                style={{ backgroundColor: '#22c55e', color: '#ffffff', border: 'none' }}
                              >
                                <Link className="h-3 w-3 mr-1" />
                                <Mic className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAttachScript(audio.id, 'videoScript')}
                                title="Attach Video Script"
                                style={{ backgroundColor: '#7c3aed', color: '#ffffff', border: 'none' }}
                              >
                                <Link className="h-3 w-3 mr-1" />
                                <Video className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              handleDownloadAudio(audio);
                              setActiveTab('scripts');
                            }}
                            title="Download audio & back to scripts"
                            style={{ backgroundColor: '#3b82f6', color: '#ffffff', border: 'none' }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAudio(audio.id)}
                            title="Delete audio"
                            style={{ color: '#f87171' }}
                            className="hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScriptsManager;
