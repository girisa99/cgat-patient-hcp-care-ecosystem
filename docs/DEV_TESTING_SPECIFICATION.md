# Genie Studio - DEV Environment Testing Specification

> **Purpose:** See everything working LIVE in dev before promoting to staging/production
> **URL (Dev):** https://geniestudiodev.genieaisuite.com
> **URL (UAT):** https://geniestudiouat.genieaisuite.com
> **URL (Prod):** https://www.genieaisuite.com
> **Access:** Internal team only

---

## 1. What You Can Test in DEV

```
DEV ENVIRONMENT CAPABILITIES
════════════════════════════

✅ Full AI Content Generation (real AI, real outputs)
✅ All 206 Pipelines functional
✅ All 7 Products working
✅ All 70+ Languages with dialects
✅ Transcreation (not just translation)
✅ Context-aware generation
✅ Admin content workflow
✅ Video preview and playback
✅ Geo-detection simulation
✅ Regional content switching
✅ Confidence scores
✅ Model selection visibility

The only difference from production:
- Separate database (test data)
- Separate storage bucket
- No real payments (Stripe test mode)
- Debug logging enabled
- No content approval required (faster iteration)
```

---

## 2. Admin Content Generation - Live Demo

### Step-by-Step: Creating India EdTech Content with Hinglish

```
LIVE DEMO: ADMIN CREATES CONTENT
════════════════════════════════

URL: https://dev.geniestudio.ai/admin/content/create

┌─────────────────────────────────────────────────────────────────────────────┐
│  📝 CREATE NEW SHOWCASE CONTENT                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: BASIC INFO                                                        │
│  ─────────────────                                                         │
│                                                                             │
│  Content Type: ● Industry Showcase                                         │
│  Title: [India EdTech - Digital Learning Revolution_______________]        │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  STEP 2: REGIONAL TARGETING                                                │
│  ──────────────────────────                                                │
│                                                                             │
│  Region: [🇮🇳 IND - India & South Asia ▼]                                 │
│                                                                             │
│  Auto-loaded context:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 📍 Region: India & South Asia                                       │  │
│  │ 🏭 Primary Industries: EdTech, Technology, Finance, Retail          │  │
│  │ 🌐 Languages: English, Hindi, Bengali, Telugu, Tamil, Marathi...    │  │
│  │ 🎯 Themes: Digital India, EdTech Revolution, Fintech Inclusion      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Industry: [EdTech ▼]                                                      │
│  Theme: [EdTech Revolution ▼]                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Language Settings (THE KEY PART)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  STEP 3: LANGUAGE & DIALECT SETTINGS ⭐ CRITICAL                           │
│  ────────────────────────────────────────────                              │
│                                                                             │
│  Primary Language: [Hindi ▼]                                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 🗣️ DIALECT / STYLE SELECTION                                        │  │
│  │                                                                      │  │
│  │ How should the Hindi be spoken?                                     │  │
│  │                                                                      │  │
│  │ ○ Pure Hindi (शुद्ध हिंदी)                                           │  │
│  │   "कृपया हमारे उत्पाद को देखें"                                       │  │
│  │   Formal, textbook Hindi. Good for government, official content.    │  │
│  │                                                                      │  │
│  │ ● Hinglish (Hindi + English) ✓ RECOMMENDED FOR EDTECH               │  │
│  │   "अरे, ये product एकदम मस्त है! Try करो!"                           │  │
│  │   Natural urban speech. How people actually talk.                   │  │
│  │   Perfect for: EdTech, Technology, Marketing, Youth content         │  │
│  │                                                                      │  │
│  │ ○ Heavy Code-Mix                                                    │  │
│  │   "Basically, ये feature use करके you can create amazing content"  │  │
│  │   Very English-heavy. Good for tech-savvy urban audience.           │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 🎭 FORMALITY LEVEL                                                   │  │
│  │                                                                      │  │
│  │ ○ Casual (तू/तुम)                                                    │  │
│  │   "देख, ये feature try कर"                                           │  │
│  │   For: Friends, peers, informal content                             │  │
│  │                                                                      │  │
│  │ ● Business (आप - respectful)                                        │  │
│  │   "देखिए, ये feature आप try कीजिए"                                   │  │
│  │   For: Professional content, B2B, education                         │  │
│  │                                                                      │  │
│  │ ○ Formal (आप - very formal)                                         │  │
│  │   "कृपया इस सुविधा का उपयोग करें"                                     │  │
│  │   For: Government, legal, highly formal                             │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 💫 CULTURAL TONE                                                     │  │
│  │                                                                      │  │
│  │ ○ Neutral - Just the facts                                          │  │
│  │ ○ Professional - Business-like, trustworthy                         │  │
│  │ ● Inspiring - "Democratizing education!" energy                     │  │
│  │ ○ Exciting - "Dhamaka offer!" high energy                          │  │
│  │ ○ Friendly - Warm, approachable                                    │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Additional Languages for Dubbing:                                         │
│  [☑ Tamil (Tanglish style)] [☑ Telugu (Tenglish)] [☑ Bengali]            │
│  [☑ English] [☐ Marathi] [☐ Gujarati]                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 4: Content Brief with Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  STEP 4: CONTENT BRIEF (Context for AI Generation)                         │
│  ─────────────────────────────────────────────────                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 📝 BRIEF (What you want to create):                                 │  │
│  │                                                                      │  │
│  │ Create a 60-second showcase video demonstrating how Indian EdTech   │  │
│  │ companies use Genie to create courses in 12 regional languages.     │  │
│  │                                                                      │  │
│  │ KEY MESSAGES TO INCLUDE:                                            │  │
│  │ • 500M+ students now learning in their own language                 │  │
│  │ • One course → 12 Indian languages automatically                    │  │
│  │ • AI understands code-mixing (Hinglish, Tanglish, Tenglish)        │  │
│  │ • Show how a teacher's Hindi lecture becomes Tamil, Telugu, etc.   │  │
│  │ • Highlight: "Education ka democratization"                         │  │
│  │                                                                      │  │
│  │ TONE: Inspiring, "India is leading the education revolution"        │  │
│  │                                                                      │  │
│  │ INCLUDE LOCAL REFERENCES:                                           │  │
│  │ • BYJU's style learning                                             │  │
│  │ • Vernacular content demand                                         │  │
│  │ • Tier 2/3 city reach                                               │  │
│  │ • Government's Digital India vision                                 │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  🤖 AI CONTEXT PREVIEW (What the AI will understand):                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ GENERATION CONTEXT:                                                 │  │
│  │                                                                      │  │
│  │ {                                                                   │  │
│  │   "region": "IND",                                                  │  │
│  │   "industry": "edtech",                                             │  │
│  │   "theme": "edtech-revolution",                                     │  │
│  │   "primaryLanguage": "hi",                                          │  │
│  │   "dialectStyle": "hinglish",                                       │  │
│  │   "formality": "business",                                          │  │
│  │   "codeMixing": "allow-english",                                    │  │
│  │   "culturalTone": "inspiring",                                      │  │
│  │   "targetAudience": "professional",                                 │  │
│  │   "additionalLanguages": ["ta", "te", "bn", "en"],                  │  │
│  │   "localReferences": ["Digital India", "vernacular", "tier2-3"],   │  │
│  │   "brandVoice": "democratizing-education"                          │  │
│  │ }                                                                   │  │
│  │                                                                      │  │
│  │ ✅ AI will generate HINGLISH, not textbook Hindi                   │  │
│  │ ✅ Will use "आप" (respectful) not "तू" (casual)                     │  │
│  │ ✅ Will have inspiring tone, not dry/formal                        │  │
│  │ ✅ Will include local cultural references                          │  │
│  │ ✅ Dubbing to Tamil/Telugu will also be code-mixed style           │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  [Generate Content →]                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Live Generation with Provider Visibility

```
GENERATION IN PROGRESS (Visible in DEV)
═══════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  🤖 GENERATING: "India EdTech - Digital Learning Revolution"               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Overall Progress: ████████████████████████░░░░░░░░░░  62%                 │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP 1: SCRIPT GENERATION ✅ COMPLETE                                     │
│  ─────────────────────────────────────                                     │
│                                                                             │
│  Provider: Gemini 2.0 Flash                                                │
│  Why: Best for Indian language context + code-mixing understanding         │
│  Time: 8 seconds                                                           │
│  Confidence: 96%                                                           │
│                                                                             │
│  Generated Script (Hinglish):                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ "India में education का एक नया revolution आ गया है!                  │  │
│  │                                                                      │  │
│  │ सोचिए, एक teacher ने Hindi में course बनाया... और Genie ने उसे      │  │
│  │ automatically Tamil, Telugu, Bengali में convert कर दिया!           │  │
│  │                                                                      │  │
│  │ 500 million से ज़्यादा students अब अपनी भाषा में सीख रहे हैं।         │  │
│  │ Tier 2, Tier 3 cities तक education पहुंच रही है।                     │  │
│  │                                                                      │  │
│  │ यही है Digital India का असली power!                                  │  │
│  │ यही है education का democratization!                                 │  │
│  │                                                                      │  │
│  │ Genie के साथ, आप भी बन सकते हैं इस revolution का हिस्सा।             │  │
│  │ Try कीजिए आज ही!"                                                    │  │
│  │                                                                      │  │
│  │ ──────────────────────────────────────────────────────────          │  │
│  │ ✅ Hinglish style (English words mixed naturally)                   │  │
│  │ ✅ Business formality (आप, कीजिए)                                    │  │
│  │ ✅ Inspiring tone                                                    │  │
│  │ ✅ Local references (Digital India, Tier 2/3)                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP 2: SCRIPT ENHANCEMENT ✅ COMPLETE                                    │
│  ────────────────────────────────────                                      │
│                                                                             │
│  Provider: Claude 3.5 Sonnet                                               │
│  Why: Cultural refinement + ensuring tone consistency                      │
│  Time: 5 seconds                                                           │
│  Confidence: 94%                                                           │
│                                                                             │
│  Changes made:                                                             │
│  • Added emotional beats for "inspiring" tone                              │
│  • Ensured consistent Hinglish ratio throughout                           │
│  • Refined "democratization" messaging                                     │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP 3: HINDI VOICEOVER ✅ COMPLETE                                       │
│  ──────────────────────────────────                                        │
│                                                                             │
│  Provider: Azure Neural TTS                                                │
│  Voice: hi-IN-MadhurNeural (Male, Professional)                           │
│  Why: Best for Hinglish - handles English words naturally                 │
│  Time: 12 seconds                                                          │
│  Confidence: 97%                                                           │
│                                                                             │
│  Audio Preview: [▶️ Play] 0:00 / 0:58                                      │
│                                                                             │
│  Quality Check:                                                            │
│  ✅ English words pronounced correctly (not Indianized)                   │
│  ✅ Natural intonation                                                     │
│  ✅ Inspiring delivery                                                     │
│  ✅ Correct emphasis on key phrases                                        │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP 4: AI AVATAR GENERATION ⏳ IN PROGRESS (45%)                         │
│  ─────────────────────────────────────────────────                         │
│                                                                             │
│  Provider: Alibaba Wan2.2                                                  │
│  Avatar: Indian Male Professional                                          │
│  Why: Best for South Asian appearance + natural expressions               │
│  Est. time remaining: 25 seconds                                           │
│                                                                             │
│  Avatar Settings:                                                          │
│  • Ethnicity: South Asian (Indian)                                        │
│  • Age: 30-40 (professional)                                              │
│  • Attire: Business casual (shirt, no tie)                                │
│  • Background: Modern office / tech startup vibe                          │
│  • Expressions: Enthusiastic, engaging                                    │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP 5: MULTI-LANGUAGE DUBBING ⏸️ QUEUED                                  │
│  ───────────────────────────────────────                                   │
│                                                                             │
│  Languages to generate:                                                    │
│                                                                             │
│  │ Language │ Style      │ Provider       │ Voice              │          │
│  ├──────────┼────────────┼────────────────┼────────────────────┤          │
│  │ Tamil    │ Tanglish   │ Azure Neural   │ ta-IN-PallaviNeural│          │
│  │ Telugu   │ Tenglish   │ Azure Neural   │ te-IN-ShrutiNeural │          │
│  │ Bengali  │ Benglish   │ Azure Neural   │ bn-IN-TanishaNeural│          │
│  │ English  │ Indian Eng │ ElevenLabs     │ Raj (custom)       │          │
│                                                                             │
│  Note: Dubbing will ALSO be code-mixed, not pure language!                │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  STEP 6: VIDEO COMPOSITION ⏸️ QUEUED                                       │
│  STEP 7: CAPTIONS GENERATION ⏸️ QUEUED                                     │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  Estimated completion: 2 minutes 15 seconds                                │
│                                                                             │
│  [Cancel] [View Script] [Edit Settings]                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Preview with All Languages

```
GENERATION COMPLETE - PREVIEW ALL VERSIONS
══════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ CONTENT READY FOR REVIEW                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VIDEO PREVIEW:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │                      [VIDEO PLAYER]                                 │  │
│  │                                                                     │  │
│  │                   Indian presenter avatar                           │  │
│  │                   speaking in Hinglish                              │  │
│  │                                                                     │  │
│  │  ▶️ ─────────────────────────────────────────  0:58                │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  LANGUAGE VERSIONS (Click to switch):                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  [Hindi/Hinglish ●]  Confidence: 97%  ▶️ Play                      │  │
│  │   "India में education का एक नया revolution..."                     │  │
│  │   Style: Hinglish (code-mixed) ✓                                   │  │
│  │                                                                     │  │
│  │  [Tamil/Tanglish]    Confidence: 94%  ▶️ Play                      │  │
│  │   "India-ல education-ல ஒரு புது revolution..."                      │  │
│  │   Style: Tanglish (code-mixed) ✓                                   │  │
│  │                                                                     │  │
│  │  [Telugu/Tenglish]   Confidence: 93%  ▶️ Play                      │  │
│  │   "India లో education లో ఒక కొత్త revolution..."                    │  │
│  │   Style: Tenglish (code-mixed) ✓                                   │  │
│  │                                                                     │  │
│  │  [Bengali]           Confidence: 95%  ▶️ Play                      │  │
│  │   "India-তে education-এ একটা নতুন revolution..."                    │  │
│  │   Style: Benglish (code-mixed) ✓                                   │  │
│  │                                                                     │  │
│  │  [English]           Confidence: 98%  ▶️ Play                      │  │
│  │   "A new revolution is happening in Indian education..."           │  │
│  │   Style: Indian English accent ✓                                   │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Quality Comparison View

```
COMPARE: TRANSCREATION vs LITERAL TRANSLATION
═════════════════════════════════════════════

This shows WHY context and dialect matter:

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  SAME MESSAGE, DIFFERENT APPROACHES                                        │
│                                                                             │
│  Original (English):                                                       │
│  "Try our AI-powered course creator for free!"                            │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  ❌ LITERAL TRANSLATION (What others do):                                  │
│                                                                             │
│  Hindi:    "हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं!"        │
│            Sounds robotic, textbook. Nobody talks like this.               │
│                                                                             │
│  Tamil:    "எங்கள் AI-இயங்கும் பாடநெறி உருவாக்கியை இலவசமாக முயற்சிக்கவும்!" │
│            Overly formal. Feels like government document.                  │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  ✅ GENIE TRANSCREATION (What we do):                                      │
│                                                                             │
│  Hinglish: "AI-powered course creator free में try करो!"                   │
│            Natural! This is how urban Indians actually speak.              │
│            Uses English words where natural.                               │
│            Casual but respectful.                                          │
│                                                                             │
│  Tanglish: "AI course creator-ஐ free-ல try பண்ணுங்க!"                      │
│            Natural Tamil + English mix.                                    │
│            How young professionals actually talk.                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  [▶️ Hear the difference] [See more examples]                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Arabic Dialect Comparison Demo

```
ARABIC DIALECTS - LIVE DEMO
═══════════════════════════

Same message in ALL 7 Arabic dialects:

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  MESSAGE: "Start creating amazing videos today!"                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  🇸🇦 SAUDI ARABIC                          Confidence: 96%         │  │
│  │  "ابدأ تسوي فيديوهات روعة اليوم!"                                   │  │
│  │  [▶️ Play] - Voice: Azure ar-SA-HamedNeural                        │  │
│  │  Note: Uses "تسوي" (Saudi verb form)                                │  │
│  │                                                                     │  │
│  │  ─────────────────────────────────────────────────────────         │  │
│  │                                                                     │  │
│  │  🇦🇪 GULF ARABIC (UAE/Kuwait/Qatar)        Confidence: 95%         │  │
│  │  "ابدا سوّي فيديوهات حلوة اليوم!"                                    │  │
│  │  [▶️ Play] - Voice: Azure ar-AE-FatimaNeural                       │  │
│  │  Note: Uses "سوّي" (Gulf verb), "حلوة" (Gulf adjective)            │  │
│  │                                                                     │  │
│  │  ─────────────────────────────────────────────────────────         │  │
│  │                                                                     │  │
│  │  🇪🇬 EGYPTIAN ARABIC                        Confidence: 97%         │  │
│  │  "ابدأ اعمل فيديوهات جامدة النهاردة!"                               │  │
│  │  [▶️ Play] - Voice: Azure ar-EG-SalmaNeural                        │  │
│  │  Note: Uses "اعمل" (Egyptian), "جامدة" (Egyptian slang for great)  │  │
│  │        "النهاردة" (Egyptian for "today")                           │  │
│  │                                                                     │  │
│  │  ─────────────────────────────────────────────────────────         │  │
│  │                                                                     │  │
│  │  🇱🇧 LEVANTINE ARABIC (Lebanon/Syria)       Confidence: 94%         │  │
│  │  "بلّش اعمل فيديوهات كتير حلوة اليوم!"                              │  │
│  │  [▶️ Play] - Voice: Azure ar-JO-SanaNeural                         │  │
│  │  Note: Uses "بلّش" (Levantine for "start"), "كتير" (very)          │  │
│  │                                                                     │  │
│  │  ─────────────────────────────────────────────────────────         │  │
│  │                                                                     │  │
│  │  🇲🇦 MAGHREBI ARABIC (Morocco/Algeria)      Confidence: 92%         │  │
│  │  "بدا دير فيديوهات زوينين اليوم!"                                   │  │
│  │  [▶️ Play] - Voice: Azure ar-MA-MounaNeural                        │  │
│  │  Note: Uses "دير" (Maghrebi verb), "زوينين" (beautiful/great)      │  │
│  │        Very different from Middle Eastern Arabic!                   │  │
│  │                                                                     │  │
│  │  ─────────────────────────────────────────────────────────         │  │
│  │                                                                     │  │
│  │  🇮🇶 IRAQI ARABIC                           Confidence: 93%         │  │
│  │  "ابدي سوّي فيديوهات روعة اليوم!"                                   │  │
│  │  [▶️ Play] - Voice: Azure ar-IQ-BasselNeural                       │  │
│  │  Note: Iraqi dialect features                                       │  │
│  │                                                                     │  │
│  │  ─────────────────────────────────────────────────────────         │  │
│  │                                                                     │  │
│  │  📜 MSA (Modern Standard Arabic)            Confidence: 98%         │  │
│  │  "ابدأ بإنشاء مقاطع فيديو رائعة اليوم!"                              │  │
│  │  [▶️ Play] - Voice: Azure ar-SA-HamedNeural (formal)               │  │
│  │  Note: Formal, understood everywhere, but nobody speaks this       │  │
│  │        colloquially. Use for news, official content only.          │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ⭐ COMPETITIVE ADVANTAGE: No other platform supports all 7 dialects!     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Admin Testing Checklist for DEV

```
DEV ENVIRONMENT TESTING CHECKLIST
═════════════════════════════════

Before promoting ANY content to staging, verify in DEV:

LANGUAGE & DIALECT TESTING:
───────────────────────────
□ Script generated in correct dialect (not just language)
□ Code-mixing applied correctly (Hinglish, Tanglish, etc.)
□ Formality level matches selection (casual/business/formal)
□ Cultural tone is correct (inspiring/exciting/professional)
□ English loanwords pronounced correctly (not Indianized weirdly)
□ All language versions sound natural, not robotic

VOICE QUALITY:
──────────────
□ Voice matches region (Indian voice for India, Gulf voice for Gulf)
□ Pronunciation is natural
□ Intonation matches content mood
□ No audio artifacts or glitches
□ Volume consistent throughout

AVATAR (if used):
─────────────────
□ Avatar ethnicity matches target region
□ Lip-sync accurate for primary language
□ Lip-sync works for dubbed languages
□ Expressions match content tone
□ Attire appropriate for industry/region

CONTENT ACCURACY:
─────────────────
□ Key messages from brief are included
□ Local references are correct
□ Industry terminology accurate
□ Confidence scores above 90%
□ No factual errors

TECHNICAL:
──────────
□ Video plays in browser (Chrome, Safari, Firefox)
□ Video plays on mobile
□ Thumbnail displays correctly
□ All language versions accessible
□ Captions match audio

EXAMPLE TEST SCENARIOS:
───────────────────────

1. INDIA EDTECH TEST
   - Generate: Hindi content for EdTech
   - Verify: Output is Hinglish, not pure Hindi
   - Verify: Uses "आप" not "तू"
   - Verify: References "Digital India"

2. SAUDI FINANCE TEST
   - Generate: Arabic content for finance
   - Verify: Output is Saudi dialect, not MSA
   - Verify: Uses Saudi-specific terms
   - Verify: Vision 2030 references included

3. NIGERIA FINTECH TEST
   - Generate: English content for fintech
   - Verify: Nigerian English phrasing
   - Verify: Mobile money references
   - Verify: Local context (not US-centric)
```

---

## 8. Quick Demo: Regional Content Switching

```
GEO-DETECTION SIMULATION IN DEV
═══════════════════════════════

URL: https://dev.geniestudio.ai/?simulate_region=MENA

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🌍 SIMULATE REGION (DEV ONLY)                                             │
│                                                                             │
│  [NAM 🇺🇸] [EUR 🇪🇺] [MENA 🇦🇪] [IND 🇮🇳] [AFR 🌍] [APAC 🌏] [LATAM 🌎]    │
│       ↑ Click to switch                                                    │
│                                                                             │
│  Current: MENA (UAE)                                                       │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  HOMEPAGE PREVIEW:                                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  [Hero Video: Saudi Vision 2030 - Tourism Transformation]          │  │
│  │  Language: Gulf Arabic                                              │  │
│  │  Confidence: 96%                                                    │  │
│  │                                                                     │  │
│  │  Industries shown:                                                  │  │
│  │  [Government] [Real Estate] [Tourism] [Finance]                    │  │
│  │                                                                     │  │
│  │  Direction: RTL ✓                                                  │  │
│  │  Currency: AED ✓                                                   │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  Switch to IND to see:                                                     │
│  • Hindi/Hinglish hero video                                              │
│  • EdTech, Technology, Finance industries                                 │
│  • LTR direction                                                          │
│  • INR currency                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Summary: What DEV Environment Proves

```
DEV ENVIRONMENT VALIDATES:
══════════════════════════

1. ✅ AI GENERATION WORKS
   - All providers connected
   - All pipelines functional
   - Real outputs generated

2. ✅ DIALECT/CONTEXT SYSTEM WORKS
   - Hinglish vs Pure Hindi
   - 7 Arabic dialects
   - Code-mixing for Indian languages
   - Cultural tone adaptation

3. ✅ TRANSCREATION (NOT TRANSLATION)
   - Meaning preserved, not just words
   - Local references included
   - Natural speech patterns

4. ✅ MULTI-LANGUAGE DUBBING WORKS
   - All 70+ languages
   - Dialect-aware dubbing
   - Lip-sync for avatars

5. ✅ REGIONAL CONTENT WORKS
   - Geo-detection functional
   - Right content for right region
   - Industries match region

6. ✅ ADMIN WORKFLOW WORKS
   - Context input → AI generation
   - Preview all versions
   - Quality scores visible

ONLY AFTER DEV VALIDATION → Promote to Staging for QA
```

---

## 10. Environment URLs (Actual)

```
GENIE STUDIO SITE STRUCTURE (ACTUAL CONFIGURATION)
═══════════════════════════════════════════════════

DEVELOPMENT (Lovable):
──────────────────────
https://geniestudiodev.genieaisuite.com/genie-landing        # Landing page (geo-aware)
https://geniestudiodev.genieaisuite.com/genie-landing?simulate_region=IND   # Force India view
https://geniestudiodev.genieaisuite.com/genie-landing?simulate_region=MENA  # Force MENA view
https://geniestudiodev.genieaisuite.com/explore               # Global showcase
https://geniestudiodev.genieaisuite.com/genie-studio-pricing  # Pricing page
https://geniestudiodev.genieaisuite.com/genie-studio-auth     # Authentication

UAT (Netlify):
──────────────
https://geniestudiouat.genieaisuite.com/genie-landing        # Landing page
https://geniestudiouat.genieaisuite.com/genie-studio         # Dashboard (auth required)

PRODUCTION (Netlify):
─────────────────────
https://www.genieaisuite.com/genie-landing                   # Production landing
https://www.genieaisuite.com/genie-studio                    # Production dashboard

Admin Routes (All Environments):
────────────────────────────────
/genie-admin                    # Admin dashboard (internal users)
/genie-admin/content/create     # Create showcase content
/internal/users                 # User management
/genie-support                  # Support interface

Testing Tools (DEV only):
─────────────────────────
/command-center                 # Architecture diagrams & monitoring
/presentation/document-processing   # Interactive presentations
```

## 11. Environment Detection Logic

The application automatically detects environment based on hostname:

```typescript
// From src/services/environmentService.ts
ENVIRONMENT_DOMAINS = {
  'geniestudiodev.genieaisuite.com': 'development',  // Lovable
  'geniestudiouat.genieaisuite.com': 'uat',          // Netlify UAT
  'www.genieaisuite.com': 'production',              // Netlify Prod
  'genieaisuite.com': 'production',                   // Apex domain
  'localhost': 'local',                               // Local development
}
```

---

*This document defines how to validate content generation with dialects and context in the DEV environment before promoting to staging/production.*
