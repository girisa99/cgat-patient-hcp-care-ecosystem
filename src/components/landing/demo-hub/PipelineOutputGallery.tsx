/**
 * PipelineOutputGallery — Industry-aware case study cards
 * 
 * Shows Input → Pipeline → Output cards filtered by selected industry.
 * Full 7-pipeline coverage for every industry using correct provider routing:
 * - Deck: Gemini 3 Pro
 * - Video: Vertex Veo 3 + Azure Neural TTS
 * - Content: Claude 4 (Western) / Gemini 3 Pro
 * - TTS: Azure Neural (primary global) / Alibaba Qwen3-TTS (CJK)
 * - STT: Deepgram Nova 2
 * - Translation: DeepL / Azure Translator
 * - Transcreation: Zone-Routed LLM (Qwen-Max / Claude 4 / Gemini 3 Pro)
 */

import React, { useState } from 'react';
import {
  Presentation, Video, FileText, Volume2, Mic, Languages, Sparkles,
  ArrowRight, ArrowLeft, Eye, ChevronDown, ChevronUp, Zap,
  Globe, Clock, Layers, Play, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──

interface PipelineOutput {
  id: string;
  pipeline: string;
  pipelineIcon: React.ElementType;
  pipelineColor: string;
  product: string;
  industry: string;
  industryEmoji: string;
  input: {
    label: string;
    preview: string;
  };
  aiProviders: string[];
  output: {
    label: string;
    preview: string;
    details: string[];
    format: string;
  };
  stats: {
    time: string;
    languages?: number;
    slides?: number;
    scenes?: number;
    words?: number;
  };
  tags: string[];
  multiLangPreview?: string[];
}

// ── Helper to build a pipeline output entry ──

const deck = (id: string, industry: string, emoji: string, prompt: string, outputLabel: string, preview: string, details: string[], stats: Partial<PipelineOutput['stats']>, tags: string[], langs: string[]): PipelineOutput => ({
  id, pipeline: 'AI Deck', pipelineIcon: Presentation, pipelineColor: 'text-blue-500',
  product: 'Genie Deck', industry, industryEmoji: emoji,
  input: { label: 'Prompt', preview: prompt },
  aiProviders: ['Gemini 3 Pro'],
  output: { label: outputLabel, preview, details, format: 'PPTX / PDF' },
  stats: { time: '45s', ...stats }, tags, multiLangPreview: langs,
});

const video = (id: string, industry: string, emoji: string, concept: string, outputLabel: string, preview: string, details: string[], stats: Partial<PipelineOutput['stats']>, tags: string[], langs: string[]): PipelineOutput => ({
  id, pipeline: 'Video Script', pipelineIcon: Video, pipelineColor: 'text-purple-500',
  product: 'Genie Vibe', industry, industryEmoji: emoji,
  input: { label: 'Script Concept', preview: concept },
  aiProviders: ['Vertex Veo 3', 'Azure Neural TTS'],
  output: { label: outputLabel, preview, details, format: 'MP4 / Storyboard' },
  stats: { time: '60s', ...stats }, tags, multiLangPreview: langs,
});

const content = (id: string, industry: string, emoji: string, topic: string, outputLabel: string, preview: string, details: string[], stats: Partial<PipelineOutput['stats']>, tags: string[], langs: string[]): PipelineOutput => ({
  id, pipeline: 'Content Writer', pipelineIcon: FileText, pipelineColor: 'text-emerald-500',
  product: 'Genie Spark', industry, industryEmoji: emoji,
  input: { label: 'Topic', preview: topic },
  aiProviders: ['Claude 4', 'Gemini 3 Pro'],
  output: { label: outputLabel, preview, details, format: 'HTML / Markdown' },
  stats: { time: '35s', ...stats }, tags, multiLangPreview: langs,
});

const tts = (id: string, industry: string, emoji: string, text: string, outputLabel: string, preview: string, details: string[], stats: Partial<PipelineOutput['stats']>, tags: string[], langs: string[]): PipelineOutput => ({
  id, pipeline: 'Text-to-Speech', pipelineIcon: Volume2, pipelineColor: 'text-orange-500',
  product: 'Genie Cast', industry, industryEmoji: emoji,
  input: { label: 'Text', preview: text },
  aiProviders: ['Azure Neural TTS', 'Alibaba Qwen3-TTS (CJK)'],
  output: { label: outputLabel, preview, details, format: 'MP3 / WAV' },
  stats: { time: '12s', ...stats }, tags, multiLangPreview: langs,
});

const stt = (id: string, industry: string, emoji: string, audioInput: string, outputLabel: string, preview: string, details: string[], tags: string[], langs: string[]): PipelineOutput => ({
  id, pipeline: 'Speech-to-Text', pipelineIcon: Mic, pipelineColor: 'text-rose-500',
  product: 'Genie Mind', industry, industryEmoji: emoji,
  input: { label: 'Audio Input', preview: audioInput },
  aiProviders: ['Deepgram Nova 2', 'Azure STT'],
  output: { label: outputLabel, preview, details, format: 'TXT / SRT / VTT' },
  stats: { time: '8s' }, tags, multiLangPreview: langs,
});

const translation = (id: string, industry: string, emoji: string, source: string, outputLabel: string, preview: string, details: string[], stats: Partial<PipelineOutput['stats']>, tags: string[], langs: string[]): PipelineOutput => ({
  id, pipeline: 'Translation', pipelineIcon: Languages, pipelineColor: 'text-cyan-500',
  product: 'Genie Hub', industry, industryEmoji: emoji,
  input: { label: 'Source Text', preview: source },
  aiProviders: ['DeepL', 'Azure Translator'],
  output: { label: outputLabel, preview, details, format: 'JSON / CSV' },
  stats: { time: '6s', ...stats }, tags, multiLangPreview: langs,
});

const transcreation = (id: string, industry: string, emoji: string, source: string, outputLabel: string, preview: string, details: string[], stats: Partial<PipelineOutput['stats']>, tags: string[], langs: string[]): PipelineOutput => ({
  id, pipeline: 'Transcreation', pipelineIcon: Sparkles, pipelineColor: 'text-yellow-500',
  product: 'Genie Suite', industry, industryEmoji: emoji,
  input: { label: 'Source Copy', preview: source },
  aiProviders: ['Qwen-Max (CJK/MENA)', 'Claude 4 (Western/EU)', 'Gemini 3 Pro (India/SEA)'],
  output: { label: outputLabel, preview, details, format: 'Localized Copy' },
  stats: { time: '18s', ...stats }, tags, multiLangPreview: langs,
});

// ── Full Curated Output Library ──

const CURATED_OUTPUTS: PipelineOutput[] = [
  // ═══════ HEALTHCARE ═══════
  deck('hc-deck', 'healthcare', '🩺',
    'Create a patient education deck about managing Type 2 Diabetes including lifestyle changes, medication adherence, and when to seek emergency care.',
    '6-Slide Deck', 'Complete patient education presentation with evidence-based guidance and actionable self-management steps.',
    ['Slide 1: Understanding Type 2 Diabetes — glucose metabolism visual', 'Slide 2: Daily Management Checklist — medication schedule', 'Slide 3: Nutrition Guidelines — plate method with regional food examples', 'Slide 4: Exercise & Activity — safe protocols by fitness level', 'Slide 5: Warning Signs — when to call 911 vs visit doctor', 'Slide 6: Support Resources — apps, helplines, community groups'],
    { slides: 6 }, ['Patient Education', 'Compliance-Ready'], ['🇸🇦 Arabic (Gulf)', '🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish', '🇹🇷 Turkish']),

  video('hc-video', 'healthcare', '🩺',
    'Create a 30-second telemedicine onboarding video explaining how patients can book virtual consultations and share vitals remotely.',
    '4-Scene Storyboard', 'Patient-friendly explainer with step-by-step UI walkthrough and reassuring narration.',
    ['Scene 1 (8s): Problem — long wait times, travel barriers', 'Scene 2 (8s): Solution — tap to connect with your doctor from home', 'Scene 3 (8s): Demo — app walkthrough: booking, vitals upload, video call', 'Scene 4 (6s): CTA — "Download the app and see your doctor today"'],
    { scenes: 4 }, ['Telemedicine', 'Patient Onboarding'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish']),

  content('hc-content', 'healthcare', '🩺',
    'Write an article about how AI-powered diagnostics are reducing misdiagnosis rates in developing countries.',
    'Blog Article', '1,200-word thought leadership article with embedded statistics and expert quotes.',
    ['H1: AI Diagnostics Are Saving Lives Where Doctors Are Scarce', 'Section: The Misdiagnosis Crisis — 5M deaths/year from diagnostic errors', 'Section: How AI Reads Medical Images — 94% accuracy in TB detection', 'Section: Case Study — 60% faster diagnosis in rural India', 'Conclusion: The Future Is AI-Assisted, Not AI-Replaced', 'SEO: 8 target keywords, meta description, 3 image alt texts'],
    { words: 1200 }, ['Blog', 'SEO-Optimized', 'Healthcare AI'], ['🇮🇳 Hindi', '🇧🇩 Bengali', '🇫🇷 French', '🇪🇸 Spanish']),

  tts('hc-tts', 'healthcare', '🩺',
    'Take your medication with food every morning. If you experience dizziness, chest pain, or shortness of breath, call your healthcare provider immediately.',
    'Patient Audio Guides', 'Natural, native-sounding audio in 7 Arabic dialects + 4 Indian languages for patient safety.',
    ['🇸🇦 Gulf Arabic — Riyadh dialect with empathetic tone', '🇪🇬 Egyptian Arabic — Cairo dialect for hospital PA', '🇱🇧 Levantine Arabic — Beirut variant', '🇮🇳 Hindi — Standard with medical register', '🇮🇳 Tamil — Chennai dialect for southern hospitals'],
    { languages: 11 }, ['Multi-Dialect', 'Patient Safety', '7 Arabic Dialects'], ['🇸🇦 7 Arabic Dialects', '🇮🇳 4 Indian Languages', '🇹🇷 Turkish']),

  stt('hc-stt', 'healthcare', '🩺',
    '3-minute doctor-patient consultation recording with medical terminology, multiple speakers, and background hospital noise.',
    'Clinical Transcript', 'HIPAA-formatted transcript with speaker diarization and medical term recognition.',
    ['[0:00-0:45] Dr. Patel: "Blood pressure is 140/90, slightly elevated..."', '[0:45-1:30] Patient: "I\'ve been feeling dizzy since Tuesday..."', '[1:30-2:20] Dr. Patel: "Let\'s adjust your Lisinopril to 20mg..."', '[2:20-3:00] Summary: Diagnosis codes, medication changes logged', 'Confidence: 96.1% | Medical term accuracy: 98.3%'],
    ['Medical NLP', 'Speaker Diarization', 'HIPAA-Ready'], ['🇮🇳 Hindi', '🇸🇦 Arabic', '🇫🇷 French', '🇩🇪 German']),

  translation('hc-translate', 'healthcare', '🩺',
    'IMPORTANT: Do not take this medication on an empty stomach. Side effects may include nausea, headache, and drowsiness. Consult your pharmacist if symptoms persist beyond 48 hours.',
    '8 Translations', 'Medical-grade literal translations preserving safety-critical terminology.',
    ['🇫🇷 French: "IMPORTANT: Ne prenez pas ce médicament à jeun..."', '🇸🇦 Arabic: "مهم: لا تتناول هذا الدواء على معدة فارغة..."', '🇮🇳 Hindi: "महत्वपूर्ण: इस दवा को खाली पेट न लें..."', '🇹🇷 Turkish: "ÖNEMLİ: Bu ilacı aç karnına almayın..."', '🇩🇪 German: "WICHTIG: Nehmen Sie dieses Medikament nicht auf..."'],
    { languages: 8 }, ['Medical', 'Safety-Critical', 'RTL Support'], ['🇫🇷 French', '🇸🇦 Arabic', '🇮🇳 Hindi', '🇹🇷 Turkish', '🇩🇪 German']),

  transcreation('hc-transcreate', 'healthcare', '🩺',
    'Your health, your way. Connect with top specialists from the comfort of your home. Book your first virtual visit today — it\'s free.',
    'Cultural Adaptations', 'Context-aware healthcare messaging adapted for cultural health attitudes per market.',
    ['🇸🇦 Gulf Arabic: Family health emphasis, mentions "trusted by Ministry-approved doctors" — cultural authority framing', '🇮🇳 Hindi: Affordability-first, references ABHA health ID and government insurance schemes', '🇯🇵 Japanese: Emphasizes privacy (個人情報保護), politeness level (keigo), and clinic reputation', '🇧🇷 Portuguese: Community health focus, SUS integration messaging, warm family tone'],
    { languages: 4 }, ['Cultural Context', 'Zone-Routed', 'Health Attitudes'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇯🇵 Japanese', '🇧🇷 Portuguese']),

  // ═══════ FINANCE ═══════
  deck('fin-deck', 'finance', '💼',
    'Create an investor pitch deck for an AI-powered wealth management platform targeting MENA and South Asian markets.',
    '8-Slide Deck', 'Data-driven investor presentation with market analysis, growth projections, and competitive positioning.',
    ['Slide 1: Executive Summary — $4.2B TAM in target markets', 'Slide 2: Problem — 78% unbanked population in South Asia', 'Slide 3: Solution — AI-powered micro-investing with Sharia compliance', 'Slide 4: Market Traction — 120K users, $8M AUM', 'Slide 5-6: Growth Strategy — expansion roadmap', 'Slide 7: Financials — 18-month projections', 'Slide 8: The Ask — $15M Series A'],
    { slides: 8 }, ['Investor Pitch', 'Data-Driven'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇩🇪 German', '🇯🇵 Japanese']),

  video('fin-video', 'finance', '💼',
    'Create a 30-second explainer video for an AI-powered savings account that auto-optimizes interest rates across currencies.',
    '4-Scene Storyboard', 'Professional financial product explainer with data visualizations and compelling CTA.',
    ['Scene 1 (8s): Problem — money sitting idle in low-yield accounts', 'Scene 2 (8s): Solution — AI scanning 50+ rate options in real-time', 'Scene 3 (8s): Proof — animated dashboard showing 3.2x return improvement', 'Scene 4 (6s): CTA — "Start optimizing today" with app download QR'],
    { scenes: 4 }, ['Product Explainer', 'Data Viz'], ['🇸🇦 Arabic', '🇩🇪 German', '🇫🇷 French', '🇯🇵 Japanese']),

  content('fin-content', 'finance', '💼',
    'Write an analysis of how embedded finance and AI are transforming SME lending in emerging markets.',
    'Blog Article', '1,400-word analysis with market data, expert insights, and regulatory considerations.',
    ['H1: How AI Is Unlocking $5 Trillion in SME Lending', 'Section: The Credit Gap — 65M SMEs lack access to formal credit', 'Section: AI Underwriting — alternative data scoring models', 'Section: Regulatory Landscape — sandbox frameworks in UAE, India, Kenya', 'Conclusion: Embedded finance will bank the next billion SMEs', 'SEO: 10 keywords, regulatory compliance mentions'],
    { words: 1400 }, ['Fintech', 'SEO-Optimized', 'Emerging Markets'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇩🇪 German', '🇫🇷 French']),

  tts('fin-tts', 'finance', '💼',
    'Your portfolio has been rebalanced. Equity allocation is now 60%, bonds 25%, and alternatives 15%. Expected annual return: 8.2% based on current market conditions.',
    'Client Audio Updates', 'Professional, trust-building audio notifications in native dialects for wealth management.',
    ['🇸🇦 Gulf Arabic — Formal business tone with Islamic finance terminology', '🇮🇳 Hindi — Standard with financial register, ₹ references', '🇬🇧 British English — Conservative, reassuring wealth manager tone', '🇯🇵 Japanese — Keigo formal level with yen-based metrics', '🇩🇪 German — Precise, compliance-aware banking terminology'],
    { languages: 8 }, ['Financial', 'Trust-Building', 'Multi-Dialect'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇬🇧 English', '🇯🇵 Japanese', '🇩🇪 German']),

  stt('fin-stt', 'finance', '💼',
    '5-minute earnings call recording with CEO presenting Q3 results, analyst Q&A, and financial terminology.',
    'Earnings Transcript', 'Speaker-diarized earnings call transcript with financial term accuracy and timestamp markers.',
    ['[0:00-1:30] CEO: "Revenue grew 23% year-over-year to $847M..."', '[1:30-2:45] CFO: "EBITDA margin expanded 340bps to 28.7%..."', '[2:45-4:00] Analyst Q&A: "What\'s your guidance for FY26?"', '[4:00-5:00] CEO: "We\'re guiding $1.1B revenue, 30% margin..."', 'Confidence: 97.2% | Financial term accuracy: 99.1%'],
    ['Earnings Call', 'Speaker ID', 'Financial NLP'], ['🇩🇪 German', '🇯🇵 Japanese', '🇸🇦 Arabic', '🇫🇷 French']),

  translation('fin-translate', 'finance', '💼',
    'Your account balance is $12,450.00. A transfer of $2,500 was processed on Feb 5, 2026. Transaction fee: $4.99. Available credit: $7,550.',
    '10 Translations', 'Currency-aware financial translations with locale-specific number and date formatting.',
    ['🇸🇦 Arabic: "رصيد حسابك هو ١٢,٤٥٠.٠٠ دولار..." (RTL + Eastern Arabic numerals)', '🇯🇵 Japanese: "口座残高: $12,450.00。2026年2月5日に$2,500の..."', '🇮🇳 Hindi: "आपका खाता शेष ₹10,35,250 है..." (₹ conversion)', '🇩🇪 German: "Ihr Kontostand beträgt 12.450,00 $..." (comma/dot swap)', '🇧🇷 Portuguese: "Seu saldo é de R$ 63.250,00..." (BRL conversion)'],
    { languages: 10 }, ['Currency-Aware', 'Locale Formatting', 'RTL'], ['🇸🇦 Arabic', '🇯🇵 Japanese', '🇮🇳 Hindi', '🇩🇪 German', '🇧🇷 Portuguese']),

  transcreation('fin-transcreate', 'finance', '💼',
    'Grow your wealth with AI-powered portfolio management. Start investing with just $50.',
    'Cultural Adaptations', 'Context-aware financial messaging adapted for regulatory language and cultural investment attitudes.',
    ['🇸🇦 Gulf Arabic: Sharia-compliant framing — "حلال" (halal) investing, family wealth preservation', '🇮🇳 Hindi: SIP (Systematic Investment Plan) reference, ₹500 equivalent — Indian retail investors', '🇯🇵 Japanese: Stability and long-term planning (安定) — conservative framing', '🇩🇪 German: DSGVO data protection emphasis — trust-first regulatory positioning'],
    { languages: 4 }, ['Cultural Context', 'Zone-Routed', 'Regulatory'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇯🇵 Japanese', '🇩🇪 German']),

  // ═══════ EDUCATION ═══════
  deck('edu-deck', 'education', '🎓',
    'Create a classroom presentation about renewable energy sources for high school students.',
    '8-Slide Deck', 'Engaging student-friendly presentation with infographics, quizzes, and discussion prompts.',
    ['Slide 1: What Is Renewable Energy? — visual comparison', 'Slide 2: Solar Power — how photovoltaics work', 'Slide 3: Wind Energy — turbine mechanics animation', 'Slide 4: Hydropower — dam vs run-of-river', 'Slide 5: Geothermal & Biomass — lesser-known sources', 'Slide 6: Global Adoption Map — interactive data', 'Slide 7: Quiz — 5 multiple-choice questions', 'Slide 8: Discussion — "What can your community do?"'],
    { slides: 8 }, ['Student-Friendly', 'Interactive'], ['🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish', '🇸🇦 Arabic', '🇰🇪 Swahili']),

  video('edu-video', 'education', '🎓',
    'Create a 60-second animated explainer about the water cycle for middle school science class.',
    '5-Scene Animation', 'Colorful, age-appropriate science explainer with narration and captions.',
    ['Scene 1 (12s): Evaporation — sun heats ocean surface', 'Scene 2 (12s): Condensation — water vapor forms clouds', 'Scene 3 (12s): Precipitation — rain, snow, sleet explained', 'Scene 4 (12s): Collection — rivers, lakes, groundwater', 'Scene 5 (12s): Recap — full cycle animation loop with quiz prompt'],
    { scenes: 5 }, ['Animated', 'Age-Appropriate', 'Science'], ['🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish', '🇸🇦 Arabic']),

  content('edu-content', 'education', '🎓',
    'Write an insightful article about how AI tutors and vernacular content are closing the education gap in developing countries.',
    'Blog Article', '1,200-word thought leadership article with SEO optimization and embedded statistics.',
    ['H1: How AI Tutors Are Bridging the Education Gap in 35+ Languages', 'Section: The Vernacular Content Challenge — 6.2B people lack native-language learning', 'Section: AI-Powered Personalization — adaptive learning paths per student', 'Section: Case Study — 40% improvement in rural India test scores', 'Conclusion: The Future is Multilingual and AI-Driven', 'SEO: 8 target keywords, meta description, alt texts'],
    { words: 1200 }, ['Blog', 'SEO-Optimized', 'Thought Leadership'], ['🇮🇳 Hindi', '🇧🇩 Bengali', '🇰🇪 Swahili', '🇧🇷 Portuguese', '🇫🇷 French']),

  tts('edu-tts', 'education', '🎓',
    'Welcome to today\'s lesson on photosynthesis. Plants convert sunlight, water, and carbon dioxide into glucose and oxygen. Let\'s explore each step.',
    'Lesson Narrations', 'Clear, well-paced educational audio with age-appropriate vocabulary per language.',
    ['🇮🇳 Hindi — Standard with simple scientific terms for rural schools', '🇸🇦 Arabic — Modern Standard with educational register', '🇫🇷 French — Clear pronunciation for West African students', '🇰🇪 Swahili — East African standard for Kenyan schools', '🇪🇸 Spanish — Latin American neutral for LATAM classrooms'],
    { languages: 12 }, ['Educational', 'Age-Appropriate', 'Multi-Dialect'], ['🇮🇳 Hindi', '🇸🇦 Arabic', '🇫🇷 French', '🇰🇪 Swahili', '🇪🇸 Spanish']),

  stt('edu-stt', 'education', '🎓',
    '10-minute recorded lecture on quantum mechanics with professor speaking in English, occasional Hindi terms, and student questions.',
    'Lecture Transcript', 'Timestamped transcript with speaker labels, technical terms, and question markers.',
    ['[0:00-3:00] Professor: "Quantum superposition means a particle exists in multiple states..."', '[3:00-5:30] Professor: "Think of Schrödinger\'s cat — both alive and dead..."', '[5:30-6:00] Student Q: "How does this relate to quantum computing?"', '[6:00-9:00] Professor: "Excellent question. Qubits leverage superposition to..."', '[9:00-10:00] Summary: Key terms extracted for study guide'],
    ['Lecture', 'Speaker ID', 'Study Guide'], ['🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish', '🇯🇵 Japanese']),

  translation('edu-translate', 'education', '🎓',
    'Homework Assignment: Read Chapter 5 and answer questions 1-10. Submit your essay by Friday. Late submissions will lose 10% per day.',
    '12 Translations', 'Precise academic translations maintaining formal register and institutional terminology.',
    ['🇫🇷 French: "Devoir: Lisez le chapitre 5 et répondez aux questions 1 à 10..."', '🇸🇦 Arabic: "الواجب المنزلي: اقرأ الفصل الخامس وأجب عن الأسئلة..."', '🇮🇳 Hindi: "गृहकार्य: अध्याय 5 पढ़ें और प्रश्न 1-10 के उत्तर दें..."', '🇰🇪 Swahili: "Kazi ya Nyumbani: Soma Sura ya 5 na ujibu maswali 1-10..."', '🇪🇸 Spanish: "Tarea: Lea el capítulo 5 y responda las preguntas 1 a 10..."'],
    { languages: 12 }, ['Academic', 'Formal Register', 'Multi-Script'], ['🇫🇷 French', '🇸🇦 Arabic', '🇮🇳 Hindi', '🇰🇪 Swahili', '🇪🇸 Spanish']),

  transcreation('edu-transcreate', 'education', '🎓',
    'Learn at your own pace. Our AI tutor adapts to your learning style. Start your free trial and watch your grades improve.',
    'Cultural Adaptations', 'Educationally contextualized messaging adapted for regional learning cultures and parental expectations.',
    ['🇮🇳 Hindi: Emphasizes competitive exam prep (JEE/NEET), parental approval, "your child\'s future"', '🇸🇦 Arabic: Islamic educational values, memorization excellence, family honor through education', '🇯🇵 Japanese: Juku (cram school) culture reference, group harmony, incremental improvement (改善)', '🇰🇪 Swahili: Community education focus, scholarship pathways, "education opens doors"'],
    { languages: 4 }, ['Cultural Context', 'Zone-Routed', 'Parental Messaging'], ['🇮🇳 Hindi', '🇸🇦 Arabic', '🇯🇵 Japanese', '🇰🇪 Swahili']),

  // ═══════ GOVERNMENT ═══════
  deck('gov-deck', 'government', '🏛️',
    'Create a public briefing deck about a new digital identity program for citizens.',
    '6-Slide Deck', 'Clear, accessible government communication with compliance messaging.',
    ['Slide 1: Program Overview — what is the Digital ID', 'Slide 2: Benefits — streamlined services, reduced fraud', 'Slide 3: How to Register — step-by-step with screenshots', 'Slide 4: Privacy & Security — data protection measures', 'Slide 5: FAQ — top 10 citizen questions answered', 'Slide 6: Contact & Support — helpline, offices, website'],
    { slides: 6 }, ['Public Communication', 'Accessible'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇫🇷 French', '🇰🇪 Swahili', '🇪🇸 Spanish']),

  video('gov-video', 'government', '🏛️',
    'Create a 45-second public service announcement about emergency flood preparedness for multi-ethnic communities.',
    '4-Scene PSA', 'Urgent but calm emergency preparedness video with clear step-by-step instructions.',
    ['Scene 1 (10s): Alert — flood warning issued for your area', 'Scene 2 (12s): Prepare — emergency kit checklist with visuals', 'Scene 3 (12s): Evacuate — route map and shelter locations', 'Scene 4 (11s): Stay Safe — emergency numbers and live updates'],
    { scenes: 4 }, ['Emergency', 'PSA', 'Multi-Ethnic'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇰🇪 Swahili', '🇫🇷 French', '🇪🇸 Spanish']),

  content('gov-content', 'government', '🏛️',
    'Write a policy brief on implementing AI-powered citizen services across government departments.',
    'Policy Brief', '1,800-word policy document with implementation framework, cost analysis, and risk assessment.',
    ['H1: AI-Powered Government: A Framework for Digital Citizen Services', 'Section: Current State — 67% of citizens find government services frustrating', 'Section: AI Opportunities — chatbots, document processing, fraud detection', 'Section: Implementation Roadmap — 3-phase deployment plan', 'Section: Cost-Benefit Analysis — 40% cost reduction, 3x faster processing', 'Section: Risk Mitigation — bias testing, transparency requirements'],
    { words: 1800 }, ['Policy Brief', 'Government AI', 'Framework'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇫🇷 French', '🇪🇸 Spanish']),

  tts('gov-tts', 'government', '🏛️',
    'Important public safety announcement: Residents in Zone 4 should prepare for severe weather. Stock essential supplies and follow evacuation routes.',
    'Multi-Dialect Broadcast', 'Natural, native-sounding audio in 7 Arabic dialects + 4 Indian languages for public broadcast.',
    ['🇸🇦 Gulf Arabic — Riyadh dialect with formal government tone', '🇪🇬 Egyptian Arabic — Cairo dialect for mass broadcast', '🇱🇧 Levantine Arabic — Damascus/Beirut variant', '🇮🇳 Hindi — Standard with government register', '🇮🇳 Tamil — Chennai dialect for southern broadcast', '🇰🇪 Swahili — East African with clear diction'],
    { languages: 11 }, ['Multi-Dialect', 'Emergency', 'Government'], ['🇸🇦 7 Arabic Dialects', '🇮🇳 Hindi & Tamil', '🇰🇪 Swahili', '🇫🇷 French']),

  stt('gov-stt', 'government', '🏛️',
    '20-minute multilingual town hall recording with speakers in English, Arabic, and Hindi discussing infrastructure projects.',
    'Town Hall Transcript', 'Multi-language transcript with speaker labels and translation-ready segments.',
    ['[0:00-5:00] Mayor (English): "The new highway project will reduce commute by 40%..."', '[5:00-10:00] Citizen (Arabic): "ما هي الخطة للمناطق السكنية المتأثرة؟"', '[10:00-15:00] Engineer (Hindi): "हम एक विस्तृत पुनर्वास योजना तैयार कर रहे हैं..."', '[15:00-20:00] Panel Discussion — mixed languages with real-time labels', 'Confidence: 95.4% | 3 languages detected automatically'],
    ['Multilingual', 'Town Hall', 'Auto-Detect'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇫🇷 French', '🇰🇪 Swahili']),

  translation('gov-translate', 'government', '🏛️',
    'NOTICE: All residents must register for the new national identity card by March 31, 2026. Visit your nearest registration center with valid photo ID and proof of address.',
    '15 Translations', 'Official government translations with formal register and legal precision.',
    ['🇸🇦 Arabic: "إعلان: يجب على جميع المقيمين التسجيل للحصول على..."', '🇮🇳 Hindi: "सूचना: सभी निवासियों को 31 मार्च 2026 तक नए..."', '🇫🇷 French: "AVIS: Tous les résidents doivent s\'inscrire pour la..."', '🇰🇪 Swahili: "TAARIFA: Wakazi wote lazima wasajiliwe kwa kitambulisho..."', '🇹🇷 Turkish: "DUYURU: Tüm sakinlerin 31 Mart 2026\'ya kadar yeni..."'],
    { languages: 15 }, ['Official', 'Legal Precision', 'Multi-Script'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇫🇷 French', '🇰🇪 Swahili', '🇹🇷 Turkish']),

  transcreation('gov-transcreate', 'government', '🏛️',
    'Your government is working for you. New digital services make it easier to access healthcare, education, and social benefits. Register today.',
    'Cultural Adaptations', 'Government messaging adapted for cultural trust levels and civic engagement norms.',
    ['🇸🇦 Arabic: Community-centered, references Islamic governance principles, tribal council endorsement', '🇮🇳 Hindi: Aadhaar/DigiLocker integration messaging, emphasis on subsidy access', '🇰🇪 Swahili: "Serikali yako inakufanyia kazi" — Ubuntu philosophy, community benefit', '🇧🇷 Portuguese: SUS and Bolsa Família references, social inclusion messaging'],
    { languages: 4 }, ['Civic Engagement', 'Zone-Routed', 'Trust-Building'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇰🇪 Swahili', '🇧🇷 Portuguese']),

  // ═══════ TOURISM ═══════
  deck('tour-deck', 'tourism', '✈️',
    'Create a destination marketing deck for a luxury eco-resort targeting Gulf and European travelers.',
    '7-Slide Deck', 'Stunning visual presentation with immersive imagery and tiered pricing.',
    ['Slide 1: Hero Shot — aerial view with brand positioning', 'Slide 2: The Experience — unique selling points', 'Slide 3: Accommodations — room categories with pricing', 'Slide 4: Activities — curated experiences and excursions', 'Slide 5: Dining — farm-to-table and halal options', 'Slide 6: Sustainability — eco-certifications and impact', 'Slide 7: Book Now — seasonal pricing and contact'],
    { slides: 7 }, ['Destination Marketing', 'Luxury'], ['🇸🇦 Arabic', '🇩🇪 German', '🇫🇷 French', '🇷🇺 Russian', '🇯🇵 Japanese']),

  video('tour-video', 'tourism', '✈️',
    'Create a 30-second promotional video for a heritage walking tour through a historic Middle Eastern city.',
    '4-Scene Promo', 'Cinematic destination video with immersive narration and cultural storytelling.',
    ['Scene 1 (8s): Dawn call to prayer — atmospheric establishing shot', 'Scene 2 (8s): Souq walkthrough — spices, textiles, artisan crafts', 'Scene 3 (8s): Heritage sites — mosques, palaces, museums', 'Scene 4 (6s): CTA — "Walk through 1,000 years of history"'],
    { scenes: 4 }, ['Destination Promo', 'Heritage', 'Cinematic'], ['🇸🇦 Arabic', '🇩🇪 German', '🇫🇷 French', '🇯🇵 Japanese']),

  content('tour-content', 'tourism', '✈️',
    'Write a travel guide blog about the top 10 hidden gems in Southeast Asia for 2026.',
    'Travel Guide', '1,500-word SEO-optimized travel guide with insider tips and practical information.',
    ['H1: 10 Hidden Gems in Southeast Asia You Need to Visit in 2026', 'Section: Off-the-beaten-path islands in Philippines', 'Section: Secret temples in northern Laos', 'Section: Underground rivers in Vietnam', 'Section: Practical Tips — visas, best seasons, budget', 'SEO: 12 long-tail travel keywords, image alt texts'],
    { words: 1500 }, ['Travel Guide', 'SEO-Optimized', 'Insider Tips'], ['🇯🇵 Japanese', '🇰🇷 Korean', '🇸🇦 Arabic', '🇩🇪 German']),

  tts('tour-tts', 'tourism', '✈️',
    'Welcome to the Royal Palace. Built in 1782, this magnificent complex showcases the finest Thai architecture. Please follow the guided path and enjoy your visit.',
    'Audio Tour Guides', 'Warm, informative narration for self-guided tours in native tourist languages.',
    ['🇸🇦 Gulf Arabic — Luxury traveler tone with cultural context', '🇩🇪 German — Detailed, informative style for European tourists', '🇯🇵 Japanese — Polite keigo level with historical context', '🇷🇺 Russian — Rich descriptive style for Russian travelers', '🇫🇷 French — Elegant narration with art history references'],
    { languages: 10 }, ['Audio Tour', 'Cultural Context', 'Multi-Dialect'], ['🇸🇦 Arabic', '🇩🇪 German', '🇯🇵 Japanese', '🇷🇺 Russian', '🇫🇷 French']),

  stt('tour-stt', 'tourism', '✈️',
    '2-minute multilingual hotel review recorded by a traveler mixing English and Arabic while describing their stay experience.',
    'Review Transcript', 'Bilingual transcript with sentiment analysis and key theme extraction.',
    ['[0:00-0:40] Guest (English): "The room was absolutely stunning, ocean view..."', '[0:40-1:10] Guest (Arabic): "الخدمة كانت ممتازة، الموظفين كانوا لطيفين جداً"', '[1:10-1:40] Guest (English): "Only complaint — the breakfast buffet was limited"', '[1:40-2:00] Summary: Sentiment: 4.2/5 | Themes: Room ⭐, Service ⭐, F&B ⚠️', 'Confidence: 95.8% | Bilingual auto-detection: English + Arabic'],
    ['Sentiment Analysis', 'Bilingual', 'Review Mining'], ['🇸🇦 Arabic', '🇩🇪 German', '🇷🇺 Russian', '🇯🇵 Japanese']),

  translation('tour-translate', 'tourism', '✈️',
    'Check-in time: 3:00 PM. Check-out: 11:00 AM. Free cancellation until 48 hours before arrival. Airport shuttle available upon request.',
    '12 Translations', 'Hospitality translations with locale-specific time/date formatting and service terminology.',
    ['🇸🇦 Arabic: "وقت تسجيل الوصول: ٣:٠٠ مساءً..." (Eastern Arabic numerals)', '🇯🇵 Japanese: "チェックイン: 午後3時。チェックアウト: 午前11時..."', '🇩🇪 German: "Check-in: 15:00 Uhr. Check-out: 11:00 Uhr..."', '🇷🇺 Russian: "Заезд: 15:00. Выезд: 11:00..."', '🇫🇷 French: "Heure d\'arrivée: 15h00. Départ: 11h00..."'],
    { languages: 12 }, ['Hospitality', 'Locale Formatting', 'Service'], ['🇸🇦 Arabic', '🇯🇵 Japanese', '🇩🇪 German', '🇷🇺 Russian', '🇫🇷 French']),

  transcreation('tour-transcreate', 'tourism', '✈️',
    'Escape to paradise. Crystal-clear waters, white sandy beaches, and unforgettable sunsets await you. Book your dream vacation today.',
    'Cultural Adaptations', 'Context-aware cultural adaptations — imagery, values, and emotional triggers adapted per market.',
    ['🇸🇦 Gulf Arabic: Family-friendly luxury, halal dining, private beach — cultural modesty values', '🇮🇳 Hindi: Monsoon escape, spiritual rejuvenation, Ayurvedic wellness — Indian travelers', '🇯🇵 Japanese: Harmony with nature, seasonal beauty (四季), attention to detail — wa (和) aesthetic', '🇧🇷 Portuguese: Energy, carnival spirit, group experiences — collectivist framing'],
    { languages: 4 }, ['Cultural Context', 'Zone-Routed', 'Emotional'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇯🇵 Japanese', '🇧🇷 Portuguese']),

  // ═══════ RETAIL ═══════
  deck('ret-deck', 'retail', '🛍️',
    'Create a seasonal marketing campaign deck for a fashion e-commerce platform launching in MENA and India.',
    '7-Slide Deck', 'Visually rich campaign deck with audience segmentation and channel strategy.',
    ['Slide 1: Campaign Overview — "Global Style, Local Soul"', 'Slide 2: Target Audiences — 4 persona profiles', 'Slide 3: Product Lines — seasonal collection highlights', 'Slide 4: Channel Strategy — social, influencer, paid media', 'Slide 5: Regional Adaptations — MENA modest fashion, India festive wear', 'Slide 6: Budget Allocation — channel-by-channel breakdown', 'Slide 7: KPIs & Timeline — 90-day campaign calendar'],
    { slides: 7 }, ['Campaign', 'Multi-Market'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇫🇷 French', '🇯🇵 Japanese']),

  video('ret-video', 'retail', '🛍️',
    'Create a 15-second product showcase video for a premium smartwatch launch targeting Gen Z and millennials.',
    '3-Scene Product Launch', 'Fast-paced, TikTok-style product video with kinetic text and 3D product model.',
    ['Scene 1 (5s): Teaser — quick cuts of lifestyle shots with countdown', 'Scene 2 (5s): Reveal — 360° 3D product rotation with feature callouts', 'Scene 3 (5s): CTA — price flash, "Available Now" with swipe-up prompt'],
    { scenes: 3 }, ['Product Launch', 'Social-First', '3D Product'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇯🇵 Japanese', '🇧🇷 Portuguese']),

  content('ret-content', 'retail', '🛍️',
    'Write a product comparison guide: AI-powered smart home devices for the modern family.',
    'Comparison Guide', '1,300-word buyer\'s guide with feature comparison table, pros/cons, and verdict.',
    ['H1: Best AI Smart Home Devices for Families in 2026', 'Section: Selection Criteria — voice control, privacy, ecosystem', 'Section: Product Comparison Table — 5 devices, 8 features', 'Section: Best Overall, Best Value, Best Privacy', 'Section: Setup Guide — beginner-friendly installation steps', 'SEO: 10 commercial intent keywords'],
    { words: 1300 }, ['Buyer\'s Guide', 'Product Comparison', 'SEO'], ['🇩🇪 German', '🇫🇷 French', '🇯🇵 Japanese', '🇸🇦 Arabic']),

  tts('ret-tts', 'retail', '🛍️',
    'Flash sale alert! For the next 48 hours, enjoy 40% off our entire premium collection. Free shipping on orders over $50. Don\'t miss out!',
    'Promotional Audio', 'Energetic, brand-consistent promotional audio for in-store and digital campaigns.',
    ['🇸🇦 Gulf Arabic — Exciting but respectful tone for mall announcements', '🇮🇳 Hindi — Festive Diwali-season energy with ₹ pricing', '🇯🇵 Japanese — Polite urgency with seasonal sale framing (セール)', '🇧🇷 Portuguese — High-energy Black Friday tone', '🇫🇷 French — Sophisticated "soldes" promotional style'],
    { languages: 8 }, ['Promotional', 'Brand-Consistent', 'Multi-Market'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇯🇵 Japanese', '🇧🇷 Portuguese', '🇫🇷 French']),

  stt('ret-stt', 'retail', '🛍️',
    '1-minute customer service call with a shopper asking about return policy, order tracking, and size exchange in Hindi-English mix.',
    'Support Transcript', 'Code-switched transcript with intent classification and action items.',
    ['[0:00-0:20] Customer (Hindi-English): "Mujhe ye order return karna hai, size galat hai"', '[0:20-0:35] Agent: "I can help with that. Your order #4521 was shipped on..."', '[0:35-0:50] Customer: "Exchange possible hai kya? Same color chahiye"', '[0:50-1:00] Intent: Size Exchange | Action: Generate return label', 'Confidence: 94.7% | Code-switch detection: Hindi ↔ English'],
    ['Code-Switch', 'Intent Detection', 'Customer Service'], ['🇮🇳 Hindi', '🇸🇦 Arabic', '🇯🇵 Japanese', '🇩🇪 German']),

  translation('ret-translate', 'retail', '🛍️',
    'Flash Sale! 48 hours only — Get 40% off our entire premium collection. Free shipping on orders over $50. Use code SUMMER2026.',
    '8 Translations', 'Marketing-optimized translations preserving urgency and promotional language.',
    ['🇫🇷 French: "Vente Flash ! 48 heures seulement — Profitez de -40%..."', '🇩🇪 German: "Blitzverkauf! Nur 48 Stunden — 40% Rabatt auf..."', '🇯🇵 Japanese: "フラッシュセール！48時間限定 — 全品40%OFF..."', '🇸🇦 Arabic: "تخفيضات خاطفة! 48 ساعة فقط — خصم 40%..."', '🇰🇷 Korean: "플래시 세일! 48시간 한정 — 전 제품 40% 할인..."'],
    { languages: 8 }, ['Marketing', 'Multi-Market', 'RTL Support'], ['🇫🇷 French', '🇩🇪 German', '🇯🇵 Japanese', '🇸🇦 Arabic', '🇰🇷 Korean']),

  transcreation('ret-transcreate', 'retail', '🛍️',
    'Look good. Feel amazing. Our new collection is designed for you. Shop now and express your unique style.',
    'Cultural Adaptations', 'Fashion messaging adapted for cultural style values and shopping behaviors.',
    ['🇸🇦 Gulf Arabic: Modest fashion emphasis, "elegance meets tradition" — family approval messaging', '🇮🇳 Hindi: Festival-ready styling, Bollywood-inspired, "shine this Diwali" — aspirational', '🇯🇵 Japanese: Subtle sophistication, seasonal trends (旬), minimalist aesthetic', '🇧🇷 Portuguese: Body positivity, carnival confidence, "be bold, be you" — self-expression'],
    { languages: 4 }, ['Fashion', 'Zone-Routed', 'Cultural Style'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇯🇵 Japanese', '🇧🇷 Portuguese']),

  // ═══════ MANUFACTURING ═══════
  deck('mfg-deck', 'manufacturing', '⚙️',
    'Create a safety training presentation for factory floor workers covering equipment protocols and emergency procedures.',
    '6-Slide Deck', 'OSHA-compliant training deck with clear visual instructions and multilingual captions.',
    ['Slide 1: Safety First — PPE requirements checklist', 'Slide 2: Equipment Protocols — machine-by-machine guide', 'Slide 3: Hazard Zones — floor map with color-coded areas', 'Slide 4: Emergency Procedures — evacuation routes, first aid', 'Slide 5: Incident Reporting — step-by-step with QR code', 'Slide 6: Quiz — 5-question safety assessment'],
    { slides: 6 }, ['Safety Training', 'OSHA-Compliant'], ['🇮🇳 Hindi', '🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin', '🇹🇷 Turkish']),

  video('mfg-video', 'manufacturing', '⚙️',
    'Create a 45-second equipment maintenance tutorial showing proper CNC machine calibration procedure.',
    '4-Scene Tutorial', 'Step-by-step visual tutorial with safety callouts and tool identification.',
    ['Scene 1 (10s): Setup — PPE check, machine power-down protocol', 'Scene 2 (12s): Calibration — pressure gauge adjustment with close-ups', 'Scene 3 (12s): Testing — validation procedure with tolerance checks', 'Scene 4 (11s): Logging — maintenance record entry and next schedule'],
    { scenes: 4 }, ['Maintenance', 'Step-by-Step', 'Safety'], ['🇮🇳 Hindi', '🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin']),

  content('mfg-content', 'manufacturing', '⚙️',
    'Write a technical whitepaper on how predictive maintenance AI is reducing unplanned downtime by 60%.',
    'Technical Whitepaper', '2,000-word industry whitepaper with data analysis, ROI calculations, and implementation guide.',
    ['H1: Predictive Maintenance AI: Cutting Unplanned Downtime by 60%', 'Section: The Cost of Downtime — $260K/hour average for manufacturers', 'Section: How AI Predicts Failures — vibration analysis, thermal imaging', 'Section: Case Study — auto parts manufacturer saves $4.2M annually', 'Section: Implementation Guide — 90-day rollout framework', 'SEO: 8 technical keywords, citation-ready statistics'],
    { words: 2000 }, ['Whitepaper', 'Technical', 'ROI Analysis'], ['🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin', '🇰🇷 Korean']),

  tts('mfg-tts', 'manufacturing', '⚙️',
    'Attention: Line 3 is now entering maintenance mode. All operators must clear the work area. Estimated downtime: 45 minutes.',
    'Factory Floor Announcements', 'Clear, authoritative audio for noisy industrial environments across multiple languages.',
    ['🇮🇳 Hindi — Standard with industrial terminology for Indian factories', '🇩🇪 German — Precise, safety-critical factory announcement style', '🇯🇵 Japanese — Formal factory protocol language', '🇨🇳 Mandarin — Standard with manufacturing register', '🇹🇷 Turkish — Clear diction for Turkish manufacturing plants'],
    { languages: 8 }, ['Industrial', 'Safety-Critical', 'Noise-Optimized'], ['🇮🇳 Hindi', '🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin', '🇹🇷 Turkish']),

  stt('mfg-stt', 'manufacturing', '⚙️',
    '45-second factory floor recording with equipment noise, multiple speakers, and technical terminology in mixed Hindi-English.',
    'Floor Transcript', 'Noise-filtered, speaker-diarized transcript with technical term recognition.',
    ['[0:00-0:12] Speaker 1: "CNC machine unit 4 calibration — pressure at 42 PSI"', '[0:12-0:25] Speaker 2: "Confirmed. Temperature steady at 180°C"', '[0:25-0:38] Speaker 1: "Running quality check on batch #4892..."', '[0:38-0:45] Speaker 2: "All clear. Logging to maintenance system."', 'Confidence: 94.2% | Noise filtered: 68dB ambient'],
    ['Noise-Filtered', 'Speaker ID', 'Technical'], ['🇮🇳 Hindi', '🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin']),

  translation('mfg-translate', 'manufacturing', '⚙️',
    'WARNING: Do not operate this machine without proper PPE. Safety goggles, gloves, and ear protection are mandatory. Violation may result in disciplinary action.',
    '10 Translations', 'Safety-critical translations with standardized industrial terminology.',
    ['🇩🇪 German: "WARNUNG: Bedienen Sie diese Maschine nicht ohne..."', '🇯🇵 Japanese: "警告: 適切なPPEなしでこの機械を操作しないでください..."', '🇨🇳 Mandarin: "警告：未佩戴适当个人防护装备，请勿操作本机器..."', '🇮🇳 Hindi: "चेतावनी: उचित पीपीई के बिना इस मशीन को न चलाएं..."', '🇹🇷 Turkish: "UYARI: Uygun KKD olmadan bu makineyi çalıştırmayın..."'],
    { languages: 10 }, ['Safety-Critical', 'Industrial', 'Standardized'], ['🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin', '🇮🇳 Hindi', '🇹🇷 Turkish']),

  transcreation('mfg-transcreate', 'manufacturing', '⚙️',
    'Precision engineering meets AI innovation. Our smart factory solutions reduce waste by 40% and boost output by 25%. Transform your production line today.',
    'Cultural Adaptations', 'Industrial messaging adapted for regional manufacturing culture and business decision-making.',
    ['🇩🇪 German: "Industrie 4.0" framing, references German engineering excellence (Qualität)', '🇯🇵 Japanese: Kaizen (改善) continuous improvement philosophy, Toyota Production System references', '🇨🇳 Mandarin: "Made in China 2025" alignment, smart manufacturing (智能制造) positioning', '🇮🇳 Hindi: Make in India initiative alignment, cost reduction emphasis for Indian SMEs'],
    { languages: 4 }, ['Industrial', 'Zone-Routed', 'Manufacturing Culture'], ['🇩🇪 German', '🇯🇵 Japanese', '🇨🇳 Mandarin', '🇮🇳 Hindi']),

  // ═══════ REAL ESTATE ═══════
  deck('re-deck', 'realestate', '🏢',
    'Create an investment property portfolio deck for Gulf investors showcasing luxury developments in Dubai and London.',
    '8-Slide Deck', 'Premium investor deck with 3D renders, ROI projections, and market analysis.',
    ['Slide 1: Portfolio Overview — 12 premium properties', 'Slide 2: Dubai Marina Tower — 3D render, pricing, ROI', 'Slide 3: London Mayfair Residence — heritage building conversion', 'Slide 4: Market Analysis — 5-year price appreciation data', 'Slide 5: Rental Yield Comparison — Dubai vs London vs Singapore', 'Slide 6: Payment Plans — flexible structures for GCC investors', 'Slide 7: Legal Framework — ownership rights, visa programs', 'Slide 8: Contact & Next Steps — private viewing booking'],
    { slides: 8 }, ['Investment Portfolio', 'Luxury', 'GCC Investors'], ['🇸🇦 Arabic (Gulf)', '🇷🇺 Russian', '🇨🇳 Mandarin', '🇬🇧 English']),

  video('re-video', 'realestate', '🏢',
    'Create a 45-second virtual tour narration for a luxury waterfront penthouse targeting Gulf investors.',
    '5-Scene Tour Script', 'Luxury property showcase with 3D product visualization and AI avatar presenter.',
    ['Scene 1: Aerial approach — drone shot with city skyline', 'Scene 2: Grand entrance — marble lobby with 3D furniture staging', 'Scene 3: Living space — panoramic ocean view with lighting simulation', 'Scene 4: Amenities — pool, gym, spa with AI avatar walkthrough', 'Scene 5: Investment CTA — ROI projections with regional pricing'],
    { scenes: 5 }, ['Virtual Tour', '3D Staging', 'Luxury'], ['🇸🇦 Arabic (Gulf)', '🇷🇺 Russian', '🇨🇳 Mandarin', '🇫🇷 French']),

  content('re-content', 'realestate', '🏢',
    'Write a market analysis report on the rise of AI-powered property valuation in emerging real estate markets.',
    'Market Report', '1,600-word analysis with data visualizations, expert commentary, and market projections.',
    ['H1: AI Property Valuation Is Transforming Emerging Real Estate Markets', 'Section: Traditional vs AI Valuation — accuracy comparison (AI: 97.3%)', 'Section: Top 5 Markets Adopting AI — UAE, India, Turkey, Brazil, Kenya', 'Section: Case Study — 30% faster transactions in Dubai with AI appraisal', 'Section: Future Outlook — AI-driven fractional ownership', 'SEO: 10 real estate keywords, market data citations'],
    { words: 1600 }, ['Market Analysis', 'AI PropTech', 'Data-Driven'], ['🇸🇦 Arabic', '🇮🇳 Hindi', '🇹🇷 Turkish', '🇧🇷 Portuguese']),

  tts('re-tts', 'realestate', '🏢',
    'Welcome to The Residences at Marina Bay. This exclusive 42-story tower features panoramic ocean views, private beach access, and world-class amenities. Your dream home awaits.',
    'Property Tour Audio', 'Luxurious, brand-elevating narration for virtual property tours and showroom displays.',
    ['🇸🇦 Gulf Arabic — Premium investor tone, references privacy and family living', '🇷🇺 Russian — Opulent descriptive style for Russian HNWI market', '🇨🇳 Mandarin — Feng shui and investment growth framing', '🇬🇧 British English — Refined, Savills-quality narration', '🇫🇷 French — Elegant Côte d\'Azur lifestyle framing'],
    { languages: 8 }, ['Luxury', 'Property Tour', 'HNWI-Targeted'], ['🇸🇦 Arabic', '🇷🇺 Russian', '🇨🇳 Mandarin', '🇬🇧 English', '🇫🇷 French']),

  stt('re-stt', 'realestate', '🏢',
    '3-minute property viewing feedback from an investor speaking in Arabic-English mix, discussing unit features and pricing concerns.',
    'Investor Feedback Transcript', 'Bilingual transcript with sentiment scoring and key decision factors.',
    ['[0:00-0:50] Investor (Arabic): "الموقع ممتاز والإطلالة رائعة" (Location excellent, view great)', '[0:50-1:30] Investor (English): "What\'s the payment plan? 60/40 split?"', '[1:30-2:15] Agent: "We offer 70/30 with 5-year post-handover..."', '[2:15-3:00] Investor: "Yalla, send me the full brochure and floor plans"', 'Sentiment: Very Positive (4.5/5) | Key: Location ⭐, View ⭐, Price ⚠️'],
    ['Bilingual', 'Investor Feedback', 'Sentiment'], ['🇸🇦 Arabic', '🇷🇺 Russian', '🇨🇳 Mandarin', '🇫🇷 French']),

  translation('re-translate', 'realestate', '🏢',
    '2-bedroom apartment, 1,450 sq ft. Price: AED 2,800,000. Service charge: AED 15/sq ft. Handover: Q4 2027. Community: gated, pool, gym, park.',
    '10 Translations', 'Property listing translations with locale-specific unit conversions and currency formatting.',
    ['🇸🇦 Arabic: "شقة غرفتين نوم، ١,٤٥٠ قدم مربع. السعر: ٢,٨٠٠,٠٠٠ درهم..."', '🇷🇺 Russian: "2-комнатная квартира, 135 м². Цена: $762,000..."', '🇨🇳 Mandarin: "两居室公寓，135平方米。价格：￥5,460,000..."', '🇮🇳 Hindi: "2-बेडरूम अपार्टमेंट, 135 वर्ग मीटर। कीमत: ₹6.3 करोड़..."', '🇬🇧 English: "2-bed apartment, 1,450 sq ft. Price: $762,000..."'],
    { languages: 10 }, ['Property Listing', 'Unit Conversion', 'Currency'], ['🇸🇦 Arabic', '🇷🇺 Russian', '🇨🇳 Mandarin', '🇮🇳 Hindi', '🇬🇧 English']),

  transcreation('re-transcreate', 'realestate', '🏢',
    'Your dream home is closer than you think. Luxury living with world-class amenities. Invest in your future today.',
    'Cultural Adaptations', 'Real estate messaging adapted for cultural property values and investment mindsets.',
    ['🇸🇦 Gulf Arabic: Family home legacy, generational wealth, "an address befitting your stature"', '🇷🇺 Russian: Investment security, golden visa, "a safe haven for your capital"', '🇨🇳 Mandarin: Feng shui principles, education zone proximity, "your family\'s prosperity starts here"', '🇮🇳 Hindi: Dream ownership achievement, NRI investment, "your piece of the global dream"'],
    { languages: 4 }, ['Property Marketing', 'Zone-Routed', 'Investment Mindset'], ['🇸🇦 Arabic', '🇷🇺 Russian', '🇨🇳 Mandarin', '🇮🇳 Hindi']),
];

// ── Helper ──

const getOutputsForIndustry = (industryId: string): PipelineOutput[] => {
  return CURATED_OUTPUTS.filter(o => o.industry === industryId);
};

const PIPELINE_FILTERS = [
  { label: 'All', value: null },
  { label: 'Deck', value: 'AI Deck', icon: Presentation },
  { label: 'Video', value: 'Video Script', icon: Video },
  { label: 'Content', value: 'Content Writer', icon: FileText },
  { label: 'TTS', value: 'Text-to-Speech', icon: Volume2 },
  { label: 'STT', value: 'Speech-to-Text', icon: Mic },
  { label: 'Translate', value: 'Translation', icon: Languages },
  { label: 'Transcreate', value: 'Transcreation', icon: Sparkles },
];

// ── Component ──

// Map tab IDs to pipeline names to avoid showing duplicates with the active demo tab
const TAB_TO_PIPELINE: Record<string, string> = {
  deck: 'AI Deck',
  video: 'Video Script',
  content: 'Content Writer',
  tts: 'Text-to-Speech',
  stt: 'Speech-to-Text',
  translation: 'Translation',
  transcreation: 'Transcreation',
};

interface PipelineOutputGalleryProps {
  industryId: string;
  industryName: string;
  excludePipeline?: string;
}

export const PipelineOutputGallery: React.FC<PipelineOutputGalleryProps> = ({ industryId, industryName, excludePipeline }) => {
  const [filterPipeline, setFilterPipeline] = useState<string | null>(null);
  const [blogViewId, setBlogViewId] = useState<string | null>(null);

  const excludeName = excludePipeline ? TAB_TO_PIPELINE[excludePipeline] : undefined;
  const outputs = getOutputsForIndustry(industryId).filter(o => !excludeName || o.pipeline !== excludeName);
  const filtered = filterPipeline ? outputs.filter(o => o.pipeline === filterPipeline) : outputs;
  const blogItem = blogViewId ? outputs.find(o => o.id === blogViewId) : null;

  // ── Blog detail view ──
  if (blogItem) {
    const Icon = blogItem.pipelineIcon;
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="space-y-5"
      >
        <button
          onClick={() => setBlogViewId(null)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {industryName} Outputs
        </button>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-5 sm:p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-muted ${blogItem.pipelineColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">{blogItem.pipeline} — {industryName}</h3>
                <p className="text-xs text-muted-foreground">Powered by {blogItem.aiProviders.join(' + ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{blogItem.product}</Badge>
              <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" />{blogItem.stats.time}</Badge>
              {blogItem.stats.slides && <Badge variant="outline" className="text-xs">{blogItem.stats.slides} slides</Badge>}
              {blogItem.stats.scenes && <Badge variant="outline" className="text-xs">{blogItem.stats.scenes} scenes</Badge>}
              {blogItem.stats.words && <Badge variant="outline" className="text-xs">{blogItem.stats.words} words</Badge>}
              {blogItem.stats.languages && <Badge variant="outline" className="text-xs">{blogItem.stats.languages} languages</Badge>}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">📥 {blogItem.input.label}</p>
              <div className="bg-muted/40 rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground">{blogItem.input.preview}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <div className="flex items-center gap-1.5 flex-wrap">
                {blogItem.aiProviders.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px] gap-1">
                    <Zap className="h-2.5 w-2.5" /> {p}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-primary mb-2">📤 {blogItem.output.label} — {blogItem.output.format}</p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-foreground mb-3">{blogItem.output.preview}</p>
                <div className="space-y-2">
                  {blogItem.output.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-xs text-foreground">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {blogItem.multiLangPreview && (
              <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-accent" />
                  <p className="text-sm font-bold text-foreground">Convert to Multi-Language</p>
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-[9px]">1-Click</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  This output can be transcreated into 50+ languages with zone-routed AI — not just translated, but culturally adapted.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {blogItem.multiLangPreview.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-[10px]">{lang}</Badge>
                  ))}
                  <Badge variant="secondary" className="text-[10px]">+ 135 more</Badge>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              {blogItem.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Gallery grid view ──
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {PIPELINE_FILTERS.map((f) => {
          const isActive = filterPipeline === f.value;
          const FilterIcon = f.icon;
          return (
            <button
              key={f.label}
              onClick={() => setFilterPipeline(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent/10 hover:text-foreground border border-border'
              }`}
            >
              {FilterIcon && <FilterIcon className="h-3 w-3" />}
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((output) => {
          const Icon = output.pipelineIcon;
          return (
            <motion.div
              key={output.id}
              layout
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-muted ${output.pipelineColor}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{output.pipeline}</p>
                  <p className="text-[9px] text-muted-foreground">{output.product}</p>
                </div>
                <Badge variant="outline" className="text-[9px] gap-1">
                  <Clock className="h-2.5 w-2.5" /> {output.stats.time}
                </Badge>
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[8px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 shrink-0">IN</span>
                  <p className="text-[11px] text-foreground line-clamp-2">{output.input.preview}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap">
                    {output.aiProviders.slice(0, 2).map((p) => (
                      <Badge key={p} variant="outline" className="text-[7px] px-1 py-0 h-3.5 gap-0.5">
                        <Zap className="h-2 w-2" /> {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[8px] font-bold uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5 shrink-0">OUT</span>
                  <p className="text-[11px] text-foreground line-clamp-2">{output.output.preview}</p>
                </div>

                {output.multiLangPreview && (
                  <div className="flex items-center gap-1 pt-1">
                    <Globe className="h-3 w-3 text-accent shrink-0" />
                    <div className="flex items-center gap-1 overflow-hidden">
                      {output.multiLangPreview.slice(0, 3).map((l) => (
                        <span key={l} className="text-[8px] text-muted-foreground whitespace-nowrap">{l}</span>
                      ))}
                      <span className="text-[8px] text-accent font-medium">+more</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-3 pb-3 flex items-center gap-2">
                <button
                  onClick={() => setBlogViewId(output.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium py-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  View Full Output
                </button>
                <button
                  onClick={() => setBlogViewId(output.id)}
                  className="flex items-center gap-1 text-[10px] text-accent hover:text-accent/80 font-medium py-2 px-3 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <Languages className="h-3 w-3" />
                  Multi-Lang
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No examples for this pipeline in {industryName}. Try "All" to see available outputs.
        </div>
      )}
    </div>
  );
};

export default PipelineOutputGallery;
