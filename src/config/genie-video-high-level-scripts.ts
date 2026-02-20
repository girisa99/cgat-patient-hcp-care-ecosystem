/**
 * GENIE SUITE HIGH-LEVEL VIDEO SCRIPTS
 * 
 * Simplified, product-focused scripts for landing page showcase
 * Focus: What each product IS and its VALUE, not UI/feature details
 * 
 * 4-Zone TTS Routing:
 * - CLAUDE ZONE (Western): ElevenLabs → en, es, fr
 * - ALIBABA ZONE (CJK): Alibaba Qwen3-TTS → zh, ja
 * - MENA ZONE: Azure Neural → ar (7 dialects)
 * - GEMINI ZONE (India/SEA/Africa): Azure Neural → hi, bn, te, ta, ur, sw, id
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER CONFIGURATIONS - HIGH LEVEL PRODUCT OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
export interface ChapterScript {
  id: string;
  product: string;
  tagline: string;
  durationSeconds: number;
}

export const CHAPTERS: ChapterScript[] = [
  { id: 'opening', product: 'Genie Suite', tagline: 'Mind to Media', durationSeconds: 25 },
  { id: 'spark', product: 'Genie Spark', tagline: 'Ignite Your Ideas', durationSeconds: 20 },
  { id: 'mind', product: 'Genie Mind', tagline: 'AI That Understands', durationSeconds: 20 },
  { id: 'vibe', product: 'Genie Vibe', tagline: 'Script to Screen', durationSeconds: 20 },
  { id: 'deck', product: 'Genie Deck', tagline: 'Ideas to Impact', durationSeconds: 20 },
  { id: 'arc', product: 'Production Hub', tagline: 'Infinite Possibilities', durationSeconds: 18 },
  { id: 'askGenie', product: 'Ask Genie', tagline: 'Your Wish is My Command', durationSeconds: 18 },
  { id: 'cast', product: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', durationSeconds: 18 },
  { id: 'closing', product: 'Genie Suite', tagline: 'Your Wish is Our Command', durationSeconds: 15 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENGLISH (en-US) - Professional, energetic, clear
// ═══════════════════════════════════════════════════════════════════════════════
export const ENGLISH_SCRIPTS: Record<string, string> = {
  opening: `Welcome to Genie Suite – where your ideas become reality.

Seven powerful products. 206 AI pipelines. 19 world-class providers. Over 140 languages with authentic regional voices.

From Tokyo to Dubai, São Paulo to Mumbai – your creative vision, instantly realized.

Let me show you the magic.`,

  spark: `Genie Spark transforms chaos into clarity.

Drop any input – a video, a document, a URL, or just speak your idea – and watch as AI crafts the perfect script for your audience, your industry, your style.

From idea to words in seconds.`,

  mind: `Genie Mind doesn't just write – it understands.

AI-powered enhancement that elevates your message. Native voices in your language that sound authentic, not robotic.

We don't translate. We transcreate. Every language sounds like home.`,

  vibe: `Genie Vibe brings scripts to life.

Professional video production with AI avatars that speak naturally in any language. Perfect lip-sync. Cinematic quality.

74 video pipelines. 4K resolution. From your phone to the world.`,

  deck: `Genie Deck ends presentation pain.

One prompt. One click. A complete professional presentation with 3D elements, animated charts, and avatars that present for you.

101 frameworks. 25 industries. From boardroom to social media.`,

  arc: `Production Hub is your creative command center.

AI-powered timeline editing with real-time suggestions. Multi-track audio, effects, and transitions – all in one place.

Edit like a pro. Export anywhere.`,

  askGenie: `Ask Genie understands natural language.

Just tell it what you need. A presentation for investors? A training video? A social campaign?

Ask, and Genie orchestrates every tool to deliver exactly what you imagined.`,

  cast: `Genie Cast takes you global.

Publish to YouTube, TikTok, Instagram, LinkedIn, WeChat, WhatsApp – all from one place.

Real-time analytics. A/B testing. 50+ countries. 70+ languages.

Your story, everywhere.`,

  closing: `This is Genie Suite. Seven products. 206 pipelines. Unlimited possibilities.

Spark ignites ideas. Mind understands. Vibe visualizes. Deck presents. Hub perfects. Ask Genie orchestrates. Cast amplifies.

Your wish is our command.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// HINDI (hi-IN) - Azure Neural TTS (Gemini Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const HINDI_SCRIPTS: Record<string, string> = {
  opening: `जीनी स्टूडियो में आपका स्वागत है – जहां आपके आइडियाज़ हकीकत बन जाते हैं।

सात शक्तिशाली प्रोडक्ट्स। 206 AI पाइपलाइन। 12 विश्व स्तरीय प्रोवाइडर्स। 70 से ज़्यादा भाषाएं असली क्षेत्रीय आवाज़ों के साथ।

टोक्यो से दुबई, साओ पाउलो से मुंबई तक – आपकी रचनात्मक कल्पना, तुरंत साकार।

चलिए जादू दिखाते हैं।`,

  spark: `जीनी स्पार्क अराजकता को स्पष्टता में बदलता है।

कोई भी इनपुट डालें – वीडियो, डॉक्यूमेंट, URL, या बस अपना आइडिया बोलें – और देखें AI कैसे परफेक्ट स्क्रिप्ट बनाता है।

आइडिया से शब्द, सेकंड्स में।`,

  mind: `जीनी माइंड सिर्फ लिखता नहीं – समझता है।

AI-पावर्ड एन्हांसमेंट जो आपके मैसेज को ऊंचाई देता है। आपकी भाषा में असली आवाज़ें।

हम ट्रांसलेट नहीं करते। ट्रांसक्रिएट करते हैं। हर भाषा घर जैसी लगती है।`,

  vibe: `जीनी वाइब स्क्रिप्ट्स को जिंदा करता है।

AI अवतारों के साथ प्रोफेशनल वीडियो प्रोडक्शन। परफेक्ट लिप-सिंक। सिनेमैटिक क्वालिटी।

74 वीडियो पाइपलाइन। 4K रेज़ॉल्यूशन। आपके फ़ोन से दुनिया तक।`,

  deck: `जीनी डेक प्रेज़ेंटेशन का दर्द खत्म करता है।

एक प्रॉम्प्ट। एक क्लिक। 3D एलिमेंट्स और एनिमेटेड चार्ट्स के साथ पूरी प्रोफेशनल प्रेज़ेंटेशन।

101 फ्रेमवर्क। 25 इंडस्ट्रीज़। बोर्डरूम से सोशल मीडिया तक।`,

  arc: `प्रोडक्शन हब आपका क्रिएटिव कमांड सेंटर है।

रियल-टाइम सुझावों के साथ AI-पावर्ड टाइमलाइन एडिटिंग। मल्टी-ट्रैक ऑडियो, इफेक्ट्स – सब एक जगह।

प्रो की तरह एडिट करें। कहीं भी एक्सपोर्ट करें।`,

  askGenie: `आस्क जीनी नेचुरल लैंग्वेज समझता है।

बस बताइए क्या चाहिए। इन्वेस्टर्स के लिए प्रेज़ेंटेशन? ट्रेनिंग वीडियो? सोशल कैम्पेन?

पूछिए, और जीनी आपकी कल्पना को साकार करता है।`,

  cast: `जीनी कास्ट आपको ग्लोबल ले जाता है।

YouTube, TikTok, Instagram, LinkedIn, WhatsApp – एक जगह से सब पर पब्लिश करें।

रियल-टाइम एनालिटिक्स। 50+ देश। 70+ भाषाएं।

आपकी कहानी, हर जगह।`,

  closing: `यह है जीनी स्टूडियो। सात प्रोडक्ट्स। 206 पाइपलाइन। असीमित संभावनाएं।

आपकी इच्छा ही हमारा आदेश है।`
};

// ═══════════════════════════════════════════════════════════════════════════════
// BENGALI (bn-BD/bn-IN) - Azure Neural TTS (Gemini Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const BENGALI_SCRIPTS: Record<string, string> = {
  opening: `জিনি স্টুডিওতে স্বাগতম – যেখানে আপনার ধারণা বাস্তবে পরিণত হয়।

সাতটি শক্তিশালী প্রোডাক্ট। ২০৬টি AI পাইপলাইন। ১২টি বিশ্বমানের প্রোভাইডার। ৭০টিরও বেশি ভাষায় আসল আঞ্চলিক কণ্ঠস্বর।

টোকিও থেকে দুবাই, সাও পাওলো থেকে মুম্বাই – আপনার সৃজনশীল দৃষ্টি, তাৎক্ষণিকভাবে বাস্তবায়িত।

আসুন জাদু দেখাই।`,

  spark: `জিনি স্পার্ক বিশৃঙ্খলাকে স্পষ্টতায় রূপান্তরিত করে।

যেকোনো ইনপুট দিন – একটি ভিডিও, ডকুমেন্ট, URL, অথবা শুধু আপনার ধারণা বলুন – এবং দেখুন AI কীভাবে নিখুঁত স্ক্রিপ্ট তৈরি করে।

ধারণা থেকে শব্দ, সেকেন্ডে।`,

  mind: `জিনি মাইন্ড শুধু লেখে না – বোঝে।

AI-চালিত উন্নতি যা আপনার বার্তাকে উন্নীত করে। আপনার ভাষায় প্রামাণিক কণ্ঠস্বর।

আমরা অনুবাদ করি না। ট্রান্সক্রিয়েট করি। প্রতিটি ভাষা ঘরের মতো শোনায়।`,

  vibe: `জিনি ভাইব স্ক্রিপ্টকে জীবন্ত করে।

AI অবতারের সাথে পেশাদার ভিডিও প্রোডাকশন। নিখুঁত লিপ-সিঙ্ক। সিনেমাটিক কোয়ালিটি।

৭৪টি ভিডিও পাইপলাইন। 4K রেজোলিউশন। আপনার ফোন থেকে বিশ্বে।`,

  deck: `জিনি ডেক প্রেজেন্টেশনের কষ্ট শেষ করে।

একটি প্রম্পট। একটি ক্লিক। 3D উপাদান এবং অ্যানিমেটেড চার্ট সহ সম্পূর্ণ পেশাদার প্রেজেন্টেশন।

১০১টি ফ্রেমওয়ার্ক। ২৫টি শিল্প। বোর্ডরুম থেকে সোশ্যাল মিডিয়া।`,

  closing: `এটি জিনি স্টুডিও। সাতটি প্রোডাক্ট। ২০৬টি পাইপলাইন। অসীম সম্ভাবনা।

আপনার ইচ্ছাই আমাদের আদেশ।`
};

// ═══════════════════════════════════════════════════════════════════════════════
// URDU (ur-PK) - Azure Neural TTS (Gemini Zone) - Pakistan
// ═══════════════════════════════════════════════════════════════════════════════
export const URDU_SCRIPTS: Record<string, string> = {
  opening: `جینی اسٹوڈیو میں خوش آمدید – جہاں آپ کے خیالات حقیقت بنتے ہیں۔

سات طاقتور پروڈکٹس۔ 206 AI پائپ لائنز۔ 12 عالمی معیار کے پرووائیڈرز۔ 70 سے زیادہ زبانوں میں اصلی علاقائی آوازیں۔

ٹوکیو سے دبئی، ساؤ پالو سے ممبئی تک – آپ کی تخلیقی نظر، فوری طور پر حقیقت میں۔

آئیے جادو دکھاتا ہوں۔`,

  spark: `جینی سپارک افراتفری کو وضاحت میں بدلتا ہے۔

کوئی بھی ان پٹ ڈالیں – ویڈیو، دستاویز، URL، یا بس اپنا خیال بولیں – اور دیکھیں AI کیسے کامل اسکرپٹ بناتا ہے۔

خیال سے الفاظ، سیکنڈوں میں۔`,

  mind: `جینی مائنڈ صرف لکھتا نہیں – سمجھتا ہے۔

AI سے چلنے والی بہتری جو آپ کے پیغام کو بلند کرتی ہے۔ آپ کی زبان میں اصلی آوازیں۔

ہم ترجمہ نہیں کرتے۔ ٹرانسکریئیٹ کرتے ہیں۔ ہر زبان گھر جیسی لگتی ہے۔`,

  vibe: `جینی وائب اسکرپٹس کو زندہ کرتا ہے۔

AI اوتاروں کے ساتھ پیشہ ورانہ ویڈیو پروڈکشن۔ کامل لپ سنک۔ سنیماٹک کوالٹی۔

74 ویڈیو پائپ لائنز۔ 4K ریزولوشن۔ آپ کے فون سے دنیا تک۔`,

  closing: `یہ ہے جینی اسٹوڈیو۔ سات پروڈکٹس۔ 206 پائپ لائنز۔ لامحدود امکانات۔

آپ کی خواہش ہمارا حکم ہے۔`
};

// ═══════════════════════════════════════════════════════════════════════════════
// INDONESIAN (id-ID) - Azure Neural TTS (Gemini Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const INDONESIAN_SCRIPTS: Record<string, string> = {
  opening: `Selamat datang di Genie Suite – tempat ide-idemu menjadi kenyataan.

Tujuh produk andalan. 206 pipeline AI. 12 penyedia kelas dunia. Lebih dari 70 bahasa dengan suara regional asli.

Dari Tokyo ke Dubai, São Paulo ke Mumbai – visi kreatifmu, langsung terwujud.

Mari saya tunjukkan keajaibannya.`,

  spark: `Genie Spark mengubah kekacauan menjadi kejelasan.

Masukkan apa saja – video, dokumen, URL, atau cukup ucapkan idemu – dan lihat AI membuat skrip sempurna untuk audiensmu.

Dari ide ke kata, dalam hitungan detik.`,

  mind: `Genie Mind tidak hanya menulis – dia memahami.

Peningkatan berbasis AI yang mengangkat pesanmu. Suara asli dalam bahasamu yang terdengar autentik, bukan robotik.

Kami tidak menerjemahkan. Kami mentranskreasi. Setiap bahasa terdengar seperti rumah.`,

  vibe: `Genie Vibe menghidupkan skrip.

Produksi video profesional dengan avatar AI yang berbicara alami dalam bahasa apa pun. Lip-sync sempurna. Kualitas sinematik.

74 pipeline video. Resolusi 4K. Dari ponselmu ke dunia.`,

  deck: `Genie Deck mengakhiri penderitaan presentasi.

Satu prompt. Satu klik. Presentasi profesional lengkap dengan elemen 3D dan grafik animasi.

101 framework. 25 industri. Dari ruang rapat ke media sosial.`,

  closing: `Inilah Genie Suite. Tujuh produk. 206 pipeline. Kemungkinan tak terbatas.

Keinginanmu adalah perintah kami.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// SWAHILI (sw-KE) - Azure Neural TTS (Gemini Zone) - East Africa
// ═══════════════════════════════════════════════════════════════════════════════
export const SWAHILI_SCRIPTS: Record<string, string> = {
  opening: `Karibu Genie Suite – mahali ambapo mawazo yako yanakuwa kweli.

Bidhaa saba zenye nguvu. Mabomba 206 ya AI. Watoa huduma 12 wa kiwango cha dunia. Zaidi ya lugha 70 na sauti za kweli za kikanda.

Kutoka Tokyo hadi Dubai, São Paulo hadi Mumbai – maono yako ya ubunifu, yakitimizwa papo hapo.

Niruhusu nikuonyeshe uchawi.`,

  spark: `Genie Spark inabadilisha machafuko kuwa uwazi.

Weka pembejeo yoyote – video, hati, URL, au sema tu wazo lako – na uone AI inavyounda hati kamili kwa hadhira yako.

Kutoka wazo hadi maneno, kwa sekunde.`,

  mind: `Genie Mind haiandiki tu – inaelewa.

Uboreshaji unaotumia AI unaoinua ujumbe wako. Sauti za asili katika lugha yako zinazosikika halisi, si roboti.

Hatutafsiri. Tunatranskreate. Kila lugha inasikika kama nyumbani.`,

  vibe: `Genie Vibe inaifanya hati iwe hai.

Uzalishaji wa video wa kitaalamu na avatars za AI zinazozungumza kwa kawaida katika lugha yoyote. Lip-sync kamili. Ubora wa sinema.

Mabomba 74 ya video. Ubora wa 4K. Kutoka simu yako hadi dunia.`,

  closing: `Hii ni Genie Suite. Bidhaa saba. Mabomba 206. Uwezekano usio na kikomo.

Tamaa yako ni amri yetu.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// ARABIC (ar-SA) - Azure Neural TTS (MENA Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const ARABIC_SCRIPTS: Record<string, string> = {
  opening: `مرحباً بك في جيني ستوديو – حيث تتحول أفكارك إلى واقع.

سبعة منتجات قوية. 206 خط أنابيب للذكاء الاصطناعي. 12 مزودًا عالميًا. أكثر من 70 لغة بأصوات إقليمية أصيلة.

من طوكيو إلى دبي، من ساو باولو إلى مومباي – رؤيتك الإبداعية تتحقق فورًا.

دعني أريك السحر.`,

  spark: `جيني سبارك يحول الفوضى إلى وضوح.

أدخل أي مدخل – فيديو، مستند، رابط، أو فقط تحدث بفكرتك – وشاهد كيف يصنع الذكاء الاصطناعي النص المثالي لجمهورك.

من الفكرة إلى الكلمات، في ثوانٍ.`,

  mind: `جيني مايند لا يكتب فقط – بل يفهم.

تحسين مدعوم بالذكاء الاصطناعي يرتقي برسالتك. أصوات أصيلة بلغتك تبدو طبيعية، ليست آلية.

نحن لا نترجم. نحن نبدع من جديد. كل لغة تبدو كالوطن.`,

  vibe: `جيني فايب يحيي النصوص.

إنتاج فيديو احترافي مع أفاتارات ذكاء اصطناعي تتحدث بشكل طبيعي بأي لغة. مزامنة شفاه مثالية. جودة سينمائية.

74 خط أنابيب فيديو. دقة 4K. من هاتفك إلى العالم.`,

  closing: `هذا هو جيني ستوديو. سبعة منتجات. 206 خط أنابيب. إمكانيات لا حدود لها.

أمنيتك هي أمرنا.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// GERMAN (de-DE) - Azure Neural TTS (Superior Prosody)
// ═══════════════════════════════════════════════════════════════════════════════
export const GERMAN_SCRIPTS: Record<string, string> = {
  opening: `Willkommen bei Genie Suite – wo Ihre Ideen Wirklichkeit werden.

Sieben leistungsstarke Produkte. 206 KI-Pipelines. 19 erstklassige Anbieter. Über 70 Sprachen mit authentischen regionalen Stimmen.

Von Tokio bis Dubai, von São Paulo bis Mumbai – Ihre kreative Vision, sofort verwirklicht.

Lassen Sie mich Ihnen die Magie zeigen.`,

  spark: `Genie Spark verwandelt Chaos in Klarheit.

Geben Sie beliebige Eingaben ein – ein Video, ein Dokument, eine URL, oder sprechen Sie einfach Ihre Idee – und sehen Sie, wie die KI das perfekte Skript erstellt.

Von der Idee zu Worten, in Sekunden.`,

  mind: `Genie Mind schreibt nicht nur – es versteht.

KI-gestützte Verbesserung, die Ihre Botschaft auf ein höheres Niveau hebt. Authentische Stimmen in Ihrer Sprache, die natürlich klingen.

Wir übersetzen nicht. Wir transkreieren. Jede Sprache klingt wie Zuhause.`,

  vibe: `Genie Vibe erweckt Skripte zum Leben.

Professionelle Videoproduktion mit KI-Avataren, die in jeder Sprache natürlich sprechen. Perfekte Lippensynchronisation. Kinoqualität.

74 Video-Pipelines. 4K-Auflösung. Von Ihrem Handy in die Welt.`,

  closing: `Das ist Genie Suite. Sieben Produkte. 206 Pipelines. Unbegrenzte Möglichkeiten.

Ihr Wunsch ist unser Befehl.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// FRENCH (fr-FR) - ElevenLabs TTS (Claude Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const FRENCH_SCRIPTS: Record<string, string> = {
  opening: `Bienvenue dans Genie Suite – où vos idées deviennent réalité.

Sept produits puissants. 206 pipelines IA. 19 fournisseurs de classe mondiale. Plus de 70 langues avec des voix régionales authentiques.

De Tokyo à Dubaï, de São Paulo à Mumbai – votre vision créative, instantanément réalisée.

Laissez-moi vous montrer la magie.`,

  spark: `Genie Spark transforme le chaos en clarté.

Déposez n'importe quelle entrée – une vidéo, un document, une URL, ou parlez simplement de votre idée – et regardez l'IA créer le script parfait.

De l'idée aux mots, en quelques secondes.`,

  mind: `Genie Mind n'écrit pas seulement – il comprend.

Amélioration propulsée par l'IA qui élève votre message. Des voix authentiques dans votre langue qui sonnent vraies, pas robotiques.

Nous ne traduisons pas. Nous transcréons. Chaque langue sonne comme chez soi.`,

  vibe: `Genie Vibe donne vie aux scripts.

Production vidéo professionnelle avec des avatars IA qui parlent naturellement dans n'importe quelle langue. Synchronisation labiale parfaite. Qualité cinématographique.

74 pipelines vidéo. Résolution 4K. De votre téléphone au monde.`,

  closing: `Voici Genie Suite. Sept produits. 206 pipelines. Des possibilités illimitées.

Votre souhait est notre commande.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPANISH (es-ES) - ElevenLabs TTS (Claude Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const SPANISH_SCRIPTS: Record<string, string> = {
  opening: `Bienvenido a Genie Suite – donde tus ideas se hacen realidad.

Siete productos potentes. 206 pipelines de IA. 19 proveedores de clase mundial. Más de 70 idiomas con voces regionales auténticas.

De Tokio a Dubái, de São Paulo a Mumbai – tu visión creativa, realizada al instante.

Déjame mostrarte la magia.`,

  spark: `Genie Spark transforma el caos en claridad.

Introduce cualquier entrada – un video, un documento, una URL, o simplemente habla tu idea – y mira cómo la IA crea el guión perfecto.

De la idea a las palabras, en segundos.`,

  mind: `Genie Mind no solo escribe – entiende.

Mejora impulsada por IA que eleva tu mensaje. Voces auténticas en tu idioma que suenan reales, no robóticas.

No traducimos. Transcreamos. Cada idioma suena como en casa.`,

  vibe: `Genie Vibe da vida a los guiones.

Producción de video profesional con avatares de IA que hablan naturalmente en cualquier idioma. Sincronización labial perfecta. Calidad cinematográfica.

74 pipelines de video. Resolución 4K. De tu teléfono al mundo.`,

  closing: `Esto es Genie Suite. Siete productos. 206 pipelines. Posibilidades ilimitadas.

Tu deseo es nuestra orden.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// PORTUGUESE (pt-BR) - Azure Neural TTS (Superior Prosody)
// ═══════════════════════════════════════════════════════════════════════════════
export const PORTUGUESE_SCRIPTS: Record<string, string> = {
  opening: `Bem-vindo ao Genie Suite – onde suas ideias se tornam realidade.

Sete produtos poderosos. 206 pipelines de IA. 19 provedores de classe mundial. Mais de 70 idiomas com vozes regionais autênticas.

De Tóquio a Dubai, de São Paulo a Mumbai – sua visão criativa, instantaneamente realizada.

Deixe-me mostrar a mágica.`,

  spark: `Genie Spark transforma caos em clareza.

Coloque qualquer entrada – um vídeo, um documento, uma URL, ou simplesmente fale sua ideia – e veja a IA criar o roteiro perfeito.

Da ideia às palavras, em segundos.`,

  mind: `Genie Mind não apenas escreve – entende.

Aprimoramento com IA que eleva sua mensagem. Vozes autênticas no seu idioma que soam reais, não robóticas.

Não traduzimos. Transcriamos. Cada idioma soa como em casa.`,

  vibe: `Genie Vibe dá vida aos roteiros.

Produção de vídeo profissional com avatares de IA que falam naturalmente em qualquer idioma. Sincronização labial perfeita. Qualidade cinematográfica.

74 pipelines de vídeo. Resolução 4K. Do seu celular para o mundo.`,

  closing: `Este é o Genie Suite. Sete produtos. 206 pipelines. Possibilidades ilimitadas.

Seu desejo é nossa ordem.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHINESE (zh-CN) - Alibaba Qwen3-TTS (Alibaba Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const CHINESE_SCRIPTS: Record<string, string> = {
  opening: `欢迎来到 Genie Suite – 让您的想法变为现实。

七款强大产品。206条AI管道。19家世界级供应商。140多种语言，配备真实的区域语音。

从东京到迪拜，从圣保罗到孟买 – 您的创意愿景，即刻实现。

让我向您展示魔法。`,

  spark: `Genie Spark 将混乱转化为清晰。

输入任何内容 – 视频、文档、URL，或直接说出您的想法 – 看AI如何创造完美的脚本。

从想法到文字，只需几秒。`,

  mind: `Genie Mind 不仅仅是写作 – 它理解。

AI增强功能提升您的信息。您语言中的真实声音，听起来自然，不像机器人。

我们不翻译。我们创译。每种语言都像家一样。`,

  vibe: `Genie Vibe 让脚本栩栩如生。

专业视频制作，配备AI虚拟形象，以任何语言自然说话。完美唇形同步。电影级品质。

74条视频管道。4K分辨率。从您的手机到全世界。`,

  closing: `这就是 Genie Suite。七款产品。206条管道。无限可能。

您的愿望就是我们的使命。`
};

// ═══════════════════════════════════════════════════════════════════════════════
// JAPANESE (ja-JP) - Alibaba Qwen3-TTS (Alibaba Zone)
// ═══════════════════════════════════════════════════════════════════════════════
export const JAPANESE_SCRIPTS: Record<string, string> = {
  opening: `Genie Suiteへようこそ – あなたのアイデアが現実になる場所。

7つの強力な製品。206のAIパイプライン。19の世界クラスのプロバイダー。140以上の言語で本物の地域音声。

東京からドバイ、サンパウロからムンバイまで – あなたのクリエイティブなビジョンを即座に実現。

魔法をお見せしましょう。`,

  spark: `Genie Sparkは混乱を明確さに変えます。

どんな入力でも – 動画、ドキュメント、URL、またはアイデアを話すだけ – AIが完璧なスクリプトを作成する様子をご覧ください。

アイデアから言葉へ、数秒で。`,

  mind: `Genie Mindは書くだけではありません – 理解します。

あなたのメッセージを高めるAI強化。あなたの言語での本物の声は、ロボットのようではなく、本物に聞こえます。

私たちは翻訳しません。トランスクリエイトします。すべての言語が故郷のように聞こえます。`,

  vibe: `Genie Vibeはスクリプトに命を吹き込みます。

どの言語でも自然に話すAIアバターによるプロフェッショナルなビデオ制作。完璧なリップシンク。シネマティック品質。

74のビデオパイプライン。4K解像度。スマートフォンから世界へ。`,

  closing: `これがGenie Suiteです。7つの製品。206のパイプライン。無限の可能性。

あなたの願いは私たちの命令です。`
};

// ═══════════════════════════════════════════════════════════════════════════════
// KOREAN (ko-KR) - Azure Neural TTS
// ═══════════════════════════════════════════════════════════════════════════════
export const KOREAN_SCRIPTS: Record<string, string> = {
  opening: `Genie Suite에 오신 것을 환영합니다 – 아이디어가 현실이 되는 곳.

7가지 강력한 제품. 206개의 AI 파이프라인. 19개의 세계적 수준의 제공업체. 140개 이상의 언어로 진정한 지역 음성.

도쿄에서 두바이, 상파울루에서 뭄바이까지 – 여러분의 창의적 비전이 즉시 실현됩니다.

마법을 보여드리겠습니다.`,

  spark: `Genie Spark는 혼란을 명확함으로 바꿉니다.

어떤 입력이든 – 비디오, 문서, URL 또는 아이디어를 말씀하세요 – AI가 완벽한 스크립트를 만드는 것을 보세요.

아이디어에서 단어로, 몇 초 만에.`,

  mind: `Genie Mind는 쓰기만 하지 않습니다 – 이해합니다.

메시지를 높이는 AI 기반 향상. 로봇이 아닌 진짜처럼 들리는 여러분 언어의 진정한 목소리.

우리는 번역하지 않습니다. 트랜스크리에이트합니다. 모든 언어가 고향처럼 들립니다.`,

  vibe: `Genie Vibe는 스크립트에 생명을 불어넣습니다.

어떤 언어로든 자연스럽게 말하는 AI 아바타와 함께하는 전문 비디오 제작. 완벽한 립싱크. 시네마틱 품질.

74개의 비디오 파이프라인. 4K 해상도. 휴대폰에서 세계로.`,

  closing: `이것이 Genie Suite입니다. 7가지 제품. 206개 파이프라인. 무한한 가능성.

여러분의 소원이 우리의 명령입니다.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// TTS PROVIDER ROUTING - 4-ZONE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════
export type TTSProvider = 'elevenlabs' | 'azure' | 'alibaba' | 'google';

export interface TTSConfig {
  provider: TTSProvider;
  displayName: string;
  zone: string;
}

export const TTS_ROUTING: Record<string, TTSConfig> = {
  // CLAUDE ZONE (Western) - ElevenLabs primary
  en: { provider: 'elevenlabs', displayName: 'ElevenLabs', zone: 'Claude Zone' },
  es: { provider: 'elevenlabs', displayName: 'ElevenLabs', zone: 'Claude Zone' },
  fr: { provider: 'elevenlabs', displayName: 'ElevenLabs', zone: 'Claude Zone' },
  
  // ALIBABA ZONE (CJK) - Alibaba Qwen3-TTS primary
  zh: { provider: 'alibaba', displayName: 'Alibaba Qwen3-TTS', zone: 'Alibaba Zone' },
  ja: { provider: 'alibaba', displayName: 'Alibaba Qwen3-TTS', zone: 'Alibaba Zone' },
  
  // MENA ZONE (Arabic) - Azure Neural primary (7 dialects)
  ar: { provider: 'azure', displayName: 'Azure Neural', zone: 'MENA Zone' },
  
  // GEMINI ZONE (India/SEA/Africa) - Azure Neural primary (Viseme support)
  hi: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  bn: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  te: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  ta: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  ur: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  sw: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  id: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  ms: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  th: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  vi: { provider: 'azure', displayName: 'Azure Neural', zone: 'Gemini Zone' },
  
  // Azure Neural for superior prosody
  ko: { provider: 'azure', displayName: 'Azure Neural', zone: 'Alibaba Zone' },
  de: { provider: 'azure', displayName: 'Azure Neural', zone: 'Claude Zone' },
  pt: { provider: 'azure', displayName: 'Azure Neural', zone: 'Claude Zone' },
  tr: { provider: 'azure', displayName: 'Azure Neural', zone: 'Claude Zone' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const SCRIPT_MAPS: Record<string, Record<string, string>> = {
  en: ENGLISH_SCRIPTS,
  hi: HINDI_SCRIPTS,
  bn: BENGALI_SCRIPTS,
  ur: URDU_SCRIPTS,
  id: INDONESIAN_SCRIPTS,
  sw: SWAHILI_SCRIPTS,
  ar: ARABIC_SCRIPTS,
  de: GERMAN_SCRIPTS,
  fr: FRENCH_SCRIPTS,
  es: SPANISH_SCRIPTS,
  pt: PORTUGUESE_SCRIPTS,
  zh: CHINESE_SCRIPTS,
  ja: JAPANESE_SCRIPTS,
  ko: KOREAN_SCRIPTS,
};

/**
 * Get localized script for a chapter and language
 * Falls back to English if not available
 */
export function getHighLevelScript(chapterId: string, languageCode: string): string {
  const scripts = SCRIPT_MAPS[languageCode];
  if (scripts && scripts[chapterId]) {
    return scripts[chapterId];
  }
  // Fallback to English
  return ENGLISH_SCRIPTS[chapterId] || '';
}

/**
 * Get TTS routing configuration for a language
 */
export function getTTSRouting(languageCode: string): TTSConfig {
  return TTS_ROUTING[languageCode] || TTS_ROUTING.en;
}

/**
 * Get full language code with region
 */
export function getFullLanguageCode(langCode: string): string {
  const langCodeMap: Record<string, string> = {
    hi: 'hi-IN',
    bn: 'bn-BD',
    te: 'te-IN',
    ta: 'ta-IN',
    ur: 'ur-PK',
    ar: 'ar-SA',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    pt: 'pt-BR',
    tr: 'tr-TR',
    ko: 'ko-KR',
    sw: 'sw-KE',
    zh: 'zh-CN',
    ja: 'ja-JP',
    id: 'id-ID',
    ms: 'ms-MY',
    th: 'th-TH',
    vi: 'vi-VN',
    en: 'en-US',
  };
  return langCodeMap[langCode] || langCode;
}

/**
 * Showcase language picker — curated subset with UI fields (flag, zone).
 * For the comprehensive language list, use ALL_AVAILABLE_LANGUAGES from regionLanguageBundles.ts.
 */
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', zone: 'Claude Zone' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', zone: 'Gemini Zone' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩', zone: 'Gemini Zone' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', zone: 'Gemini Zone' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', zone: 'MENA Zone' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', zone: 'Gemini Zone' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', zone: 'Gemini Zone' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', zone: 'Claude Zone' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', zone: 'Claude Zone' },
  { code: 'es', name: 'Español', flag: '🇪🇸', zone: 'Claude Zone' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', zone: 'Claude Zone' },
  { code: 'zh', name: '中文', flag: '🇨🇳', zone: 'Alibaba Zone' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', zone: 'Alibaba Zone' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', zone: 'Alibaba Zone' },
];
