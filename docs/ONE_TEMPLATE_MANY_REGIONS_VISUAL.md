 # One Template → Many Regional Videos: Visual Architecture
 
 > How a single template spawns culturally authentic variants across regions and sub-regions
 
 ---
 
 ## 🎯 The Core Concept
 
 ```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         SINGLE TEMPLATE                                      │
 │  ┌───────────────────────────────────────────────────────────────────────┐  │
 │  │  Blueprint: "Product Launch - Tech Startup"                           │  │
 │  │  Style Intent: photorealistic                                         │  │
 │  │  Scenes: 5 chapters (Intro → Problem → Solution → Demo → CTA)         │  │
 │  │  Visual Track: Product screenshots, 3D mockups, transitions           │  │
 │  └───────────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────┐
               │         STYLE INTENT RESOLVER            │
               │  (Selects optimal provider per region)   │
               └──────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
    ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
    │ VISUAL TRACK│            │ AUDIO TRACK │            │ TEXT/SCRIPT │
    │  (Shared)   │            │ (Regional)  │            │(Transcreated)│
    └─────────────┘            └─────────────┘            └─────────────┘
          │                           │                           │
          │                           ▼                           │
          │    ┌─────────────────────────────────────────────┐    │
          │    │           REGIONAL BRANCHING                │    │
          │    │                                             │    │
          │    │  Each region gets:                          │    │
          │    │  • Native TTS voice (dialect-specific)      │    │
          │    │  • Transcreated script (cultural context)   │    │
          │    │  • Regional pacing/tone adjustments         │    │
          │    └─────────────────────────────────────────────┘    │
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      ▼
                    ┌─────────────────────────────────┐
                    │     ASSEMBLED REGIONAL VIDEOS   │
                    │                                 │
                    │  Same visuals + Regional audio  │
                    │  = Culturally authentic output  │
                    └─────────────────────────────────┘
 ```
 
 ---
 
 ## 🇮🇳 India Example: North vs South vs East vs West
 
 ```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                    TEMPLATE: "Healthcare App Launch"                        │
 │                    Style Intent: corporate                                  │
 └─────────────────────────────────────────────────────────────────────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
              ┌────────────┐   ┌────────────┐   ┌────────────┐
              │   VISUAL   │   │   AUDIO    │   │   SCRIPT   │
              │   TRACK    │   │   TRACKS   │   │   TRACKS   │
              │  (SHARED)  │   │ (REGIONAL) │   │(TRANSCREATED)│
              └────────────┘   └────────────┘   └────────────┘
                    │                │                │
                    │                ▼                │
                    │    ┌───────────────────────┐    │
                    │    │   INDIA SUB-REGIONS   │    │
                    │    └───────────────────────┘    │
                    │                │                │
         ┌──────────┼────────────────┼────────────────┼──────────┐
         │          │                │                │          │
         ▼          ▼                ▼                ▼          ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                           NORTH INDIA                                    │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Language: Hindi (हिंदी)                                             │ │
 │  │ Dialect: Khariboli (Delhi/NCR standard)                            │ │
 │  │ TTS Provider: Azure Neural (hi-IN)                                 │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Formal "aap" (आप) for respect                                  │ │
 │  │   • References to family values, joint family concepts             │ │
 │  │   • Festival references: Diwali, Holi                              │ │
 │  │   • Business tone: Direct but respectful                           │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                           SOUTH INDIA                                    │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Languages: Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam │ │
 │  │ TTS Providers:                                                      │ │
 │  │   • Tamil: Azure Neural (ta-IN)                                    │ │
 │  │   • Telugu: Azure Neural (te-IN)                                   │ │
 │  │   • Kannada: Google TTS (kn-IN)                                    │ │
 │  │   • Malayalam: Google TTS (ml-IN)                                  │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • More formal, educational tone                                  │ │
 │  │   • References to technology hubs (Bangalore, Hyderabad, Chennai)  │ │
 │  │   • Festival references: Pongal, Onam, Ugadi                       │ │
 │  │   • Classical music/art references resonate                        │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                           EAST INDIA                                     │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Languages: Bengali (বাংলা), Odia (ଓଡ଼ିଆ), Assamese (অসমীয়া)          │ │
 │  │ TTS Providers:                                                      │ │
 │  │   • Bengali: Azure Neural (bn-IN)                                  │ │
 │  │   • Odia: Google TTS (or-IN)                                       │ │
 │  │   • Assamese: Google TTS (as-IN)                                   │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Literary, poetic tone (Bengal's cultural heritage)             │ │
 │  │   • References to Durga Puja, Bihu, Rath Yatra                     │ │
 │  │   • Intellectual/educational positioning                          │ │
 │  │   • Tea culture, riverine lifestyle references                    │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                           WEST INDIA                                     │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Languages: Marathi (मराठी), Gujarati (ગુજરાતી)                        │ │
 │  │ TTS Providers:                                                      │ │
 │  │   • Marathi: Azure Neural (mr-IN)                                  │ │
 │  │   • Gujarati: Google TTS (gu-IN)                                   │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Business-focused, entrepreneurial tone (Gujarat)               │ │
 │  │   • Cultural pride, regional identity (Maharashtra)                │ │
 │  │   • References to Ganesh Chaturthi, Navratri                       │ │
 │  │   • Mumbai/Pune startup ecosystem references                       │ │
 │  │   • Practical, ROI-focused messaging                               │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                         PAN-INDIA (Hinglish)                             │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Language: Hindi-English Mix (Hinglish)                             │ │
 │  │ TTS Provider: ElevenLabs (natural code-switching)                  │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Urban millennial/Gen-Z tone                                    │ │
 │  │   • Casual, friendly, startup-speak                                │ │
 │  │   • References to Netflix, cricket, Bollywood                      │ │
 │  │   • "Chill" but professional                                       │ │
 │  │   • Pan-Indian appeal (transcends regional boundaries)             │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 ## 🇸🇦 MENA Example: 7 Arabic Dialects
 
 ```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                    TEMPLATE: "Fintech Product Launch"                       │
 │                    Style Intent: corporate                                  │
 └─────────────────────────────────────────────────────────────────────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
              ┌────────────┐   ┌────────────┐   ┌────────────┐
              │   VISUAL   │   │   AUDIO    │   │   SCRIPT   │
              │   TRACK    │   │   TRACKS   │   │   TRACKS   │
              │  (SHARED)  │   │ (7 DIALECTS)│  │(TRANSCREATED)│
              │   + RTL    │   └────────────┘   └────────────┘
              │  LAYOUTS   │         │                │
              └────────────┘         ▼                │
                    │    ┌───────────────────────┐    │
                    │    │   MENA SUB-REGIONS    │    │
                    │    └───────────────────────┘    │
                    │                │                │
         ┌──────────┼────────────────┼────────────────┼──────────┐
         │          │                │                │          │
         ▼          ▼                ▼                ▼          ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                      GULF (ar-AE, ar-SA)                                 │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Dialects: Emirati (ar-AE), Saudi (ar-SA), Kuwaiti, Bahraini        │ │
 │  │ TTS Provider: Azure Neural (ar-AE, ar-SA)                          │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Formal business Arabic with Gulf accent                        │ │
 │  │   • References to Vision 2030, NEOM, Dubai Future Foundation       │ │
 │  │   • Wealth/investment focus                                        │ │
 │  │   • Conservative but progressive imagery                           │ │
 │  │   • Friday references (weekend), Ramadan business hours            │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                         EGYPT (ar-EG)                                    │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Dialect: Egyptian Arabic (Masri)                                   │ │
 │  │ TTS Provider: Azure Neural (ar-EG)                                 │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Warmest, most expressive Arabic dialect                        │ │
 │  │   • Humor and wit expected (Egyptian cinema influence)             │ │
 │  │   • References to Egyptian entrepreneurship, tech scene            │ │
 │  │   • Cairo/Alexandria startup ecosystem                             │ │
 │  │   • Colloquial expressions acceptable                              │ │
 │  │   • Most widely understood Arabic (media influence)                │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                      LEVANT (ar-JO, ar-LB)                               │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Dialects: Jordanian (ar-JO), Lebanese (ar-LB), Syrian, Palestinian │ │
 │  │ TTS Provider: Azure Neural (ar-JO)                                 │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Sophisticated, cosmopolitan tone                               │ │
 │  │   • French/English loanwords common (esp. Lebanese)                │ │
 │  │   • References to Beirut as regional creative hub                  │ │
 │  │   • Education/innovation focus                                     │ │
 │  │   • Softer, more melodic speech patterns                           │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                       MAGHREB (ar-MA)                                    │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Dialects: Moroccan (ar-MA), Algerian, Tunisian                     │ │
 │  │ TTS Provider: Azure Neural (ar-MA)                                 │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • French influence strong (bilingual positioning)                │ │
 │  │   • Distinct from Middle Eastern Arabic                            │ │
 │  │   • References to Morocco's tech/outsourcing growth                │ │
 │  │   • European proximity (business hours, trade)                     │ │
 │  │   • Darija vocabulary incorporated                                 │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                         IRAQ (ar-IQ)                                     │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Dialect: Iraqi Arabic (Mesopotamian)                               │ │
 │  │ TTS Provider: Azure Neural (ar-IQ)                                 │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Historical/heritage references resonate                        │ │
 │  │   • Rebuilding/innovation narrative                                │ │
 │  │   • Distinct pronunciation patterns                                │ │
 │  │   • Baghdad as cultural/tech center                                │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                       MSA (Modern Standard Arabic)                       │
 │  ┌─────────────────────────────────────────────────────────────────────┐ │
 │  │ Use Case: Pan-Arab formal content, government, education           │ │
 │  │ TTS Provider: Azure Neural (ar-SA formal)                          │ │
 │  │ Cultural Adaption:                                                 │ │
 │  │   • Formal, news-anchor style                                      │ │
 │  │   • Understood across all Arab nations                             │ │
 │  │   • Less emotional connection (not spoken natively)                │ │
 │  │   • Best for legal, regulatory, educational content                │ │
 │  └─────────────────────────────────────────────────────────────────────┘ │
 └──────────────────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 ## 🌍 Full Regional Branching Architecture
 
 ```
                                ┌─────────────────┐
                                │   TEMPLATE      │
                                │  (Blueprint)    │
                                │                 │
                                │ style_intent:   │
                                │ "photorealistic"│
                                └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
             ┌────────────┐       ┌────────────┐       ┌────────────┐
             │  VISUAL    │       │   AUDIO    │       │  SCRIPT    │
             │  TRACK     │       │   TRACK    │       │  TRACK     │
             │ (SHARED)   │       │ (BRANCHED) │       │ (BRANCHED) │
             └────────────┘       └─────┬──────┘       └─────┬──────┘
                    │                   │                    │
                    │     ┌─────────────┴─────────────┐      │
                    │     │    ZONE-BASED ROUTING     │      │
                    │     │                           │      │
                    │     │  IP Detection → Zone →    │      │
                    │     │  TTS Provider + Dialect   │      │
                    │     └─────────────┬─────────────┘      │
                    │                   │                    │
     ┌──────────────┼───────────────────┼────────────────────┼──────────────┐
     │              │                   │                    │              │
     ▼              ▼                   ▼                    ▼              ▼
 ┌────────┐   ┌──────────┐       ┌──────────┐       ┌──────────┐   ┌────────┐
 │ CLAUDE │   │ ALIBABA  │       │  GEMINI  │       │ ALIBABA  │   │FALLBACK│
 │  ZONE  │   │ ZONE-CJK │       │   ZONE   │       │ZONE-MENA │   │  ZONE  │
 │        │   │          │       │          │       │          │   │        │
 │Western │   │ China    │       │ India    │       │ Arab     │   │ Global │
 │ Europe │   │ Japan    │       │ SEA      │       │ World    │   │        │
 │ LATAM  │   │ Korea    │       │ Africa   │       │ RTL      │   │        │
 └────┬───┘   └────┬─────┘       └────┬─────┘       └────┬─────┘   └────┬───┘
      │            │                  │                  │              │
      ▼            ▼                  ▼                  ▼              ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                         SUB-REGIONAL VARIANTS                           │
 │                                                                         │
 │  CLAUDE ZONE         ALIBABA-CJK      GEMINI ZONE       ALIBABA-MENA   │
 │  ├─ en-US            ├─ zh-CN         ├─ hi-IN          ├─ ar-SA       │
 │  ├─ en-GB            ├─ zh-TW         ├─ ta-IN          ├─ ar-AE       │
 │  ├─ es-MX            ├─ ja-JP         ├─ te-IN          ├─ ar-EG       │
 │  ├─ es-ES            ├─ ko-KR         ├─ bn-IN          ├─ ar-JO       │
 │  ├─ fr-FR            ├─ yue-CN        ├─ mr-IN          ├─ ar-LB       │
 │  ├─ fr-CA            │ (Cantonese)    ├─ gu-IN          ├─ ar-MA       │
 │  ├─ de-DE            │                ├─ kn-IN          ├─ ar-IQ       │
 │  ├─ pt-BR            │                ├─ ml-IN          │              │
 │  ├─ pt-PT            │                ├─ th-TH          │              │
 │  ├─ it-IT            │                ├─ vi-VN          │              │
 │  └─ nl-NL            │                ├─ id-ID          │              │
 │                      │                ├─ sw-KE          │              │
 │                      │                ├─ yo-NG          │              │
 │                      │                └─ am-ET          │              │
 └─────────────────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 ## 🔄 How It Works: Step-by-Step
 
 ```
 STEP 1: User selects template "Product Launch - Tech Startup"
         └─ Template has: style_intent: "photorealistic"
 
 STEP 2: User selects target regions/languages
         └─ Example: [hi-IN, ta-IN, ar-AE, ar-EG, en-US]
 
 STEP 3: System generates VISUAL TRACK (once)
         └─ Style resolver: photorealistic → Gemini 3 Pro (primary)
         └─ Fallback: Vertex Imagen 3 → ModelsLab FLUX → DALL-E
         └─ OUTPUT: Product screenshots, 3D mockups, transitions
 
 STEP 4: System TRANSCREATES script per language (parallel)
         ┌─ hi-IN: Hindi script with North India cultural context
         ├─ ta-IN: Tamil script with South India cultural context  
         ├─ ar-AE: Gulf Arabic script with Dubai/Vision references
         ├─ ar-EG: Egyptian Arabic script with Cairo startup references
         └─ en-US: English script with US market positioning
 
 STEP 5: System generates TTS per dialect (parallel)
         ┌─ hi-IN: Azure Neural (hi-IN voice)
         ├─ ta-IN: Azure Neural (ta-IN voice)
         ├─ ar-AE: Azure Neural (ar-AE Gulf voice)
         ├─ ar-EG: Azure Neural (ar-EG Egyptian voice)
         └─ en-US: ElevenLabs (American English voice)
 
 STEP 6: System ASSEMBLES final videos (parallel)
         ┌─ Video-hi-IN: Shared visuals + Hindi audio + Hindi subtitles
         ├─ Video-ta-IN: Shared visuals + Tamil audio + Tamil subtitles
         ├─ Video-ar-AE: Shared visuals (RTL) + Gulf audio + Arabic subtitles
         ├─ Video-ar-EG: Shared visuals (RTL) + Egyptian audio + Arabic subtitles
         └─ Video-en-US: Shared visuals + English audio + English subtitles
 
 RESULT: 5 culturally authentic videos from 1 template
 ```
 
 ---
 
 ## 📊 Cultural Differentiation Matrix
 
 | Aspect | North India | South India | Gulf MENA | Egypt | Levant |
 |--------|-------------|-------------|-----------|-------|--------|
 | **Tone** | Direct, respectful | Formal, educational | Business-formal | Warm, expressive | Sophisticated |
 | **Humor** | Bollywood-style | Subtle, intellectual | Minimal | Expected, witty | Cosmopolitan |
 | **Trust Signals** | Family, tradition | Education, tech | Government, wealth | Entertainment, media | Innovation, culture |
 | **Festival Refs** | Diwali, Holi | Pongal, Onam | Eid, National Day | Ramadan, Sham El-Nessim | Eid, Independence |
 | **Business Refs** | Mumbai/Delhi corps | Bangalore/Hyderabad | Vision 2030, NEOM | Cairo startups | Beirut creative |
 | **Script Style** | Code-switching OK | Pure language preferred | Formal Arabic | Colloquial OK | French loanwords OK |
 | **Visual Aesthetic** | Vibrant, colorful | Classical, refined | Luxury, modern | Dynamic, media | Elegant, European |
 
 ---
 
 ## 🎛️ User Control: Regional Selection UI
 
 ```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  SELECT TARGET REGIONS                                                      │
 │                                                                             │
 │  ┌─────────────────────────────────────────────────────────────────────┐   │
 │  │  ZONE PRESETS                                                       │   │
 │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │   │
 │  │  │ Global 14    │ │ MENA 5       │ │ India 8      │                │   │
 │  │  │ (All zones)  │ │ (7 dialects) │ │ (North/South)│                │   │
 │  │  └──────────────┘ └──────────────┘ └──────────────┘                │   │
 │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │   │
 │  │  │ Europe 6     │ │ CJK 4        │ │ Africa 5     │                │   │
 │  │  │ (EU langs)   │ │ (CN/JP/KR)   │ │ (SW/YO/AM)   │                │   │
 │  │  └──────────────┘ └──────────────┘ └──────────────┘                │   │
 │  └─────────────────────────────────────────────────────────────────────┘   │
 │                                                                             │
 │  ┌─────────────────────────────────────────────────────────────────────┐   │
 │  │  GRANULAR SELECTION                                                 │   │
 │  │                                                                     │   │
 │  │  🇮🇳 INDIA                          🇸🇦 MENA                        │   │
 │  │  ☑ Hindi (North)                   ☑ Gulf Arabic (ar-AE)           │   │
 │  │  ☑ Tamil (South)                   ☑ Egyptian Arabic (ar-EG)       │   │
 │  │  ☐ Telugu (South)                  ☐ Levantine Arabic (ar-JO)      │   │
 │  │  ☐ Bengali (East)                  ☐ Moroccan Arabic (ar-MA)       │   │
 │  │  ☐ Marathi (West)                  ☐ Iraqi Arabic (ar-IQ)          │   │
 │  │  ☑ Hinglish (Pan-India)            ☑ MSA (Formal)                  │   │
 │  │                                                                     │   │
 │  └─────────────────────────────────────────────────────────────────────┘   │
 │                                                                             │
 │  ESTIMATED OUTPUT: 6 videos | ~45 credits | ~12 min generation time       │
 └─────────────────────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 ## ✅ Key Takeaways
 
 1. **Visual Track is SHARED** — Generated once, reused across all regional variants
 2. **Audio Track BRANCHES** — Each dialect gets its own TTS with native voice
 3. **Script is TRANSCREATED** — Not translated; culturally adapted with local context
 4. **Sub-regional differences matter** — North India ≠ South India ≠ East India
 5. **User controls granularity** — Zone presets for speed, granular selection for precision
 6. **Credits scale linearly** — More regions = more TTS calls, but visual is amortized
 
 ---
 
 **Related Documents:**
 - `docs/CONSOLIDATED_TEMPLATE_IMPLEMENTATION_PLAN.md`
 - `docs/TEMPLATE_REGIONAL_STRATEGY.md`