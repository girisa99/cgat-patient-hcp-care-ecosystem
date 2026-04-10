import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume2, Mic, Phone, Settings, Plus, Trash2 } from 'lucide-react';

interface VoiceConfigProps {
  nodeType: string;
  configuration: any;
  onChange: (config: any) => void;
  form: any;
}

export const VoiceConfig: React.FC<VoiceConfigProps> = ({
  nodeType,
  configuration,
  onChange,
  form
}) => {
  const renderTextToSpeech = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-blue-500" />
          Text-to-Speech Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="ttsProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TTS Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select TTS provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="openai">🤖 OpenAI TTS</SelectItem>
                  <SelectItem value="elevenlabs">🎙️ ElevenLabs</SelectItem>
                  <SelectItem value="google">🌐 Google Text-to-Speech</SelectItem>
                  <SelectItem value="aws-polly">☁️ Amazon Polly</SelectItem>
                  <SelectItem value="azure">🔵 Azure Cognitive Services</SelectItem>
                  <SelectItem value="speechify">📢 Speechify</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter API key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="voiceModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice Model *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {configuration.ttsProvider === 'openai' && (
                    <>
                      <SelectItem value="tts-1">🎯 TTS-1 (Standard)</SelectItem>
                      <SelectItem value="tts-1-hd">💎 TTS-1 HD (High Quality)</SelectItem>
                    </>
                  )}
                  {configuration.ttsProvider === 'elevenlabs' && (
                    <>
                      <SelectItem value="eleven_multilingual_v2">🌎 Multilingual v2</SelectItem>
                    </>
                  )}
                  {!configuration.ttsProvider && (
                    <SelectItem value="default">Default Model</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="voiceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice ID/Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="alloy">🎭 Alloy (Neutral)</SelectItem>
                  <SelectItem value="echo">🎪 Echo (Male)</SelectItem>
                  <SelectItem value="fable">📚 Fable (British Male)</SelectItem>
                  <SelectItem value="onyx">💎 Onyx (Deep Male)</SelectItem>
                  <SelectItem value="nova">⭐ Nova (Female)</SelectItem>
                  <SelectItem value="shimmer">✨ Shimmer (Soft Female)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="speed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Speech Speed: {field.value || 1.0}x</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 1.0]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={4.0}
                    min={0.25}
                    step={0.25}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pitch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pitch: {field.value || 0}</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 0]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={20}
                    min={-20}
                    step={1}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume: {field.value || 100}%</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value || 100]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={200}
                    min={0}
                    step={5}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="outputFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Output Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'mp3'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mp3">🎵 MP3</SelectItem>
                  <SelectItem value="wav">🔊 WAV</SelectItem>
                  <SelectItem value="ogg">📀 OGG</SelectItem>
                  <SelectItem value="aac">🎶 AAC</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enableSSML"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable SSML</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="streaming"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Enable Streaming</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderSpeechToText = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-red-500" />
          Speech-to-Text Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="sttProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>STT Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select STT provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="openai-whisper">🤖 OpenAI Whisper</SelectItem>
                  <SelectItem value="google-stt">🌐 Google Speech-to-Text</SelectItem>
                  <SelectItem value="aws-transcribe">☁️ Amazon Transcribe</SelectItem>
                  <SelectItem value="azure-stt">🔵 Azure Speech Services</SelectItem>
                  <SelectItem value="deepgram">🎯 Deepgram</SelectItem>
                  <SelectItem value="assembly-ai">🔧 AssemblyAI</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter API key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'en'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="fr">🇫🇷 French</SelectItem>
                  <SelectItem value="de">🇩🇪 German</SelectItem>
                  <SelectItem value="it">🇮🇹 Italian</SelectItem>
                  <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                  <SelectItem value="ru">🇷🇺 Russian</SelectItem>
                  <SelectItem value="ja">🇯🇵 Japanese</SelectItem>
                  <SelectItem value="ko">🇰🇷 Korean</SelectItem>
                  <SelectItem value="zh">🇨🇳 Chinese</SelectItem>
                  <SelectItem value="auto">🔄 Auto-detect</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="audioFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio Format</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'wav'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="wav">🔊 WAV</SelectItem>
                    <SelectItem value="mp3">🎵 MP3</SelectItem>
                    <SelectItem value="ogg">📀 OGG</SelectItem>
                    <SelectItem value="flac">💿 FLAC</SelectItem>
                    <SelectItem value="webm">🌐 WebM</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sampleRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Rate (Hz)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || '16000'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="8000">8,000 Hz</SelectItem>
                    <SelectItem value="16000">16,000 Hz</SelectItem>
                    <SelectItem value="22050">22,050 Hz</SelectItem>
                    <SelectItem value="44100">44,100 Hz</SelectItem>
                    <SelectItem value="48000">48,000 Hz</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="enablePunctuation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Auto Punctuation</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableTimestamps"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Word Timestamps</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filterProfanity"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Filter Profanity</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="confidenceThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confidence Threshold: {field.value || 0.7}</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value || 0.7]}
                  onValueChange={(value) => field.onChange(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Custom Vocabulary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Custom Vocabulary</FormLabel>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => {
                const vocab = configuration.customVocabulary || [];
                onChange({ 
                  ...configuration, 
                  customVocabulary: [...vocab, { word: '', pronunciation: '', weight: 1 }] 
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Word
            </Button>
          </div>
          
          {(configuration.customVocabulary || []).map((vocab: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={vocab.word || ''}
                  onChange={(e) => {
                    const vocabs = [...(configuration.customVocabulary || [])];
                    vocabs[index] = { ...vocabs[index], word: e.target.value };
                    onChange({ ...configuration, customVocabulary: vocabs });
                  }}
                  placeholder="Word or phrase"
                />
                <Input
                  value={vocab.pronunciation || ''}
                  onChange={(e) => {
                    const vocabs = [...(configuration.customVocabulary || [])];
                    vocabs[index] = { ...vocabs[index], pronunciation: e.target.value };
                    onChange({ ...configuration, customVocabulary: vocabs });
                  }}
                  placeholder="Pronunciation (optional)"
                />
                <Input
                  type="number"
                  value={vocab.weight || 1}
                  onChange={(e) => {
                    const vocabs = [...(configuration.customVocabulary || [])];
                    vocabs[index] = { ...vocabs[index], weight: parseFloat(e.target.value) };
                    onChange({ ...configuration, customVocabulary: vocabs });
                  }}
                  placeholder="Weight"
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="w-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const vocabs = [...(configuration.customVocabulary || [])];
                    vocabs.splice(index, 1);
                    onChange({ ...configuration, customVocabulary: vocabs });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderVoiceCallChannel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-green-500" />
          Voice Call Channel Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="voiceProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice Provider *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="twilio">📞 Twilio</SelectItem>
                  <SelectItem value="vonage">📱 Vonage (Nexmo)</SelectItem>
                  <SelectItem value="plivo">☎️ Plivo</SelectItem>
                  <SelectItem value="bandwidth">📡 Bandwidth</SelectItem>
                  <SelectItem value="signalwire">📶 SignalWire</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountSid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account SID *</FormLabel>
                <FormControl>
                  <Input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auth Token *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter auth token" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL</FormLabel>
              <FormControl>
                <Input placeholder="https://your-app.com/webhook/voice" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="recordCalls"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Record Calls</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableTranscription"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Live Transcription</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableDTMF"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>DTMF Support</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="callTimeout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Call Timeout (seconds)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fallbackMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fallback Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Sorry, I didn't understand. Please try again."
                  rows={2}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderGenericVoice = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {nodeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="voiceService"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice Service *</FormLabel>
              <FormControl>
                <Input placeholder="Enter voice service name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="configuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Configuration</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter voice service configuration..."
                  rows={4}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Service Enabled</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="debugMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Debug Mode</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Main render logic based on node type
  switch (nodeType) {
    case 'text_to_speech':
    case 'tts':
      return renderTextToSpeech();
    case 'speech_to_text':
    case 'stt':
      return renderSpeechToText();
    case 'voice_call_channel':
    case 'voice_channel':
      return renderVoiceCallChannel();
    default:
      return renderGenericVoice();
  }
};