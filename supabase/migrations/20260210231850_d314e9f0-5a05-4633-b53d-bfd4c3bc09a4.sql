
-- Drop old restrictive constraint and add expanded one
ALTER TABLE public.regional_narration_scripts DROP CONSTRAINT valid_tone;
ALTER TABLE public.regional_narration_scripts ADD CONSTRAINT valid_tone CHECK (emotional_tone = ANY (ARRAY[
  'inspiring', 'urgent', 'empathetic', 'authoritative', 'conversational',
  'empathetic-urgent', 'authoritative-empathetic', 'passionate-authentic',
  'respectful-empowering', 'inspiring-respectful', 'inspiring-proud',
  'energetic-practical', 'authoritative-respectful'
]));

-- NAM
UPDATE public.regional_narration_scripts SET
hook = 'What if your entire content supply chain — from the first spark of an idea to the final published asset — ran on AI that actually understands your business?',
problem_statement = 'Here''s the reality American marketers live with every day. Your content team is drowning. The average campaign takes 47 days from concept to launch. You''re spending $12,000 per campaign across a Frankenstein stack of 14 different tools. Your writers are burning out rewriting the same blog post for six platforms. Your designers are stuck in revision hell. And every quarter, leadership asks for more content, faster, cheaper — while your best people quietly update their LinkedIn profiles.',
solution = 'This is why we built the Genie Suite — seven AI products that work as one intelligent ecosystem. Start with Spark — it doesn''t just write content, it thinks like your best strategist, generating campaign-ready copy across every format in seconds. Feed that into Mind, which listens, transcribes, and extracts insights from every meeting, podcast, and customer call you''ve ever recorded. Vibe transforms those insights into scroll-stopping video scripts with emotional precision. Deck builds boardroom-ready presentations that make your CFO actually pay attention. Hub orchestrates everything — your creative command center where every asset, every workflow, every team member connects. Cast produces broadcast-quality video content that would cost you $50,000 at an agency — for a fraction of the price. And Ask Genie? It''s your AI strategist on call 24/7, answering any question about your content, your market, your competitors.',
cta = 'This isn''t another tool. This is the end of tool fatigue. Explore each product below and see what your team could do with 206 AI pipelines working together.',
emotional_tone = 'empathetic-urgent', version = 2
WHERE region_code = 'nam';

-- EU
UPDATE public.regional_narration_scripts SET
hook = 'In a continent where 24 languages aren''t just spoken — they''re felt — how do you create content that doesn''t just translate, but truly belongs?',
problem_statement = 'European businesses know this pain intimately. You launch a campaign in English, then spend three months and €40,000 localizing it for French, German, Spanish, Italian, Dutch, and Polish markets. But localization isn''t just translation — a joke that lands in London falls flat in Lyon. A call-to-action that converts in Berlin confuses in Barcelona. Your GDPR compliance team reviews every piece of content, adding weeks to every deadline. And your regional managers? They''re frustrated because the "localized" content still feels like it was written by someone who''s never set foot in their market.',
solution = 'The Genie Suite was built for Europe''s complexity. Spark generates culturally-native copy in every EU language — not translated, but genuinely crafted for each market''s sensibility. Mind captures and transcribes multilingual meetings across every European accent. Vibe creates video narratives that respect the emotional register of each culture — French elegance, German precision, Spanish warmth. Deck adapts your investor presentations with the right business etiquette for each capital. Hub keeps your pan-European campaigns synchronized across every market, every language, every compliance requirement. Cast produces region-specific video content that feels locally made, not globally templated. And Ask Genie navigates the regulatory maze so your team can focus on creativity, not compliance.',
cta = 'Paris is not Berlin is not Madrid — and your content shouldn''t pretend they are. Discover how each product adapts to your market below.',
emotional_tone = 'authoritative-empathetic', version = 2
WHERE region_code = 'eu';

-- LATAM
UPDATE public.regional_narration_scripts SET
hook = '¿Cuántas veces has visto una campaña brillante de Nueva York... que fracasa completamente en tu mercado?',
problem_statement = 'La frustración de los marketeros latinoamericanos es real y profunda. Las herramientas de contenido están diseñadas para el mercado anglosajón. La "localización" que ofrecen es Google Translate con un logo bonito. El español de México no es el de Argentina, ni el de Colombia, ni el de Chile — pero las plataformas los tratan como si fueran iguales. El portugués brasileño tiene su propio ritmo, su propia alma. Y mientras tanto, tu equipo creativo — talentoso, apasionado, lleno de ideas — pierde horas adaptando manualmente contenido que nunca debió llegar genérico.',
solution = 'Genie Suite entiende que Latinoamérica no es un mercado — son veinte mercados con un hilo cultural en común. Spark escribe como si fuera de tu ciudad, capturando modismos, humor local y el tono exacto que hace que tu audiencia diga "esto es para mí". Mind transcribe y analiza en español y portugués con precisión dialectal — distingue entre el "vos" argentino y el "tú" mexicano. Vibe crea guiones de video que emocionan con el ritmo narrativo latinoamericano — pasión, familia, resiliencia. Deck presenta tus ideas con la calidez y el profesionalismo que los negocios latinos valoran. Hub centraliza tus campañas regionales para que São Paulo y Ciudad de México lancen al mismo tiempo, sin caos. Cast produce videos con voces que suenan a casa, no a doblaje. Y Ask Genie es tu estratega bilingüe, siempre listo.',
cta = 'Tu mercado merece contenido que suene a casa. Explora cada producto abajo y siente la diferencia.',
emotional_tone = 'passionate-authentic', version = 2
WHERE region_code = 'latam';

-- MENA
UPDATE public.regional_narration_scripts SET
hook = 'في كل مرة تطلق فيها حملة رقمية... هل تشعر أن الأدوات صُممت لعالم آخر غير عالمك؟',
problem_statement = 'المسوّقون في الشرق الأوسط يعرفون هذا الإحباط. المنصات لا تدعم العربية بشكل حقيقي — النصوص تنكسر، التصميم ينقلب، والمحتوى يبدو مترجماً وليس أصيلاً. الفرق بين العربية الفصحى ولهجة الخليج ولهجة مصر ولهجة المغرب — تجاهلته كل أداة في السوق. حملات رمضان تحتاج حساسية ثقافية لا تفهمها الخوارزميات الغربية. وفريقك الإبداعي — الذي يفهم السوق أفضل من أي شركة عالمية — محاصر بأدوات لم تُصمم له.',
solution = 'جيني سويت بُني بقلب يفهم المنطقة. سبارك يكتب بالعربية كأنه من فريقك — يعرف الفرق بين "يلا" الخليجية و"يلا" المصرية. مايند يستمع ويُحلل اجتماعاتك ومقابلاتك بكل اللهجات العربية السبع. فايب يصنع نصوص فيديو تحترم الإيقاع العاطفي العربي — من الشعر إلى الإعلان. ديك يبني عروضاً تقديمية بدعم كامل للـ RTL مع تصميم يليق بغرف الاجتماعات في دبي والرياض. هب ينسّق حملاتك عبر كل الأسواق — من المغرب إلى عُمان. كاست ينتج فيديوهات بأصوات عربية أصيلة وليست مُصطنعة. واسأل جيني؟ مستشارك الاستراتيجي الذي يفهم رمضان والأعياد والمواسم.',
cta = 'أدواتك يجب أن تفهم ثقافتك. اكتشف كل منتج أدناه وشاهد الفرق.',
emotional_tone = 'respectful-empowering', version = 2
WHERE region_code = 'mena';

-- Africa
UPDATE public.regional_narration_scripts SET
hook = 'Africa''s digital economy is exploding. But the tools the world built? They weren''t built for you.',
problem_statement = 'Let''s be honest about what African creators and businesses face every day. Your internet drops mid-upload. The "AI tools" everyone raves about? They crash on 3G connections. They don''t support Swahili, Yoruba, Amharic, Hausa, or Zulu — the languages your customers actually speak. Professional video production costs more than most small businesses earn in a month. And the global platforms? They see Africa as an afterthought — a market too complex, too fragmented, too "challenging" to properly serve. Meanwhile, you''re building world-class businesses with determination, creativity, and tools that actively work against you.',
solution = 'Genie Suite was built differently — built with Africa''s reality, not despite it. Spark creates professional marketing copy in Swahili, Yoruba, Amharic, Hausa, Igbo, and English — content that sounds like it was written by someone who grew up in your market. Mind works offline-first, transcribing and analyzing audio even when connectivity is unreliable. Vibe generates lightweight video scripts optimized for mobile-first audiences who consume content on WhatsApp and TikTok. Deck builds investor-ready presentations that help African startups compete for global funding. Hub keeps your lean team organized — because in Africa, one person often does the work of five. Cast produces broadcast-quality video at a fraction of traditional costs — democratizing professional content for every business, not just the funded ones. And Ask Genie speaks your languages, understands your markets, and never assumes one Africa fits all.',
cta = 'The future of content is being built in Lagos, Nairobi, Accra, and Addis Ababa. Explore the tools built for your journey below.',
emotional_tone = 'inspiring-respectful', version = 2
WHERE region_code = 'africa';

-- India
UPDATE public.regional_narration_scripts SET
hook = 'One billion people. Twenty-two official languages. And every content tool on the market treats India like it''s just "English plus Hindi."',
problem_statement = 'Indian businesses live with a frustration the rest of the world doesn''t understand. Your campaign crushes it in Mumbai — but nobody in Chennai sees it because it''s not in Tamil. Your Kolkata team creates beautiful Bengali content — that your Bangalore office can''t use. You hire multilingual writers, but they''re expensive and can''t scale. The "AI tools" that promise multilingual support? They handle Hindi and maybe Tamil — and butcher everything else. Marathi, Gujarati, Telugu, Kannada, Malayalam, Punjabi — these aren''t niche languages. They''re spoken by hundreds of millions of people. Your people. Your customers. And they deserve content that feels like it was made for them.',
solution = 'Genie Suite doesn''t just support Indian languages — it celebrates them. Spark writes marketing copy with the cultural nuance that makes a Diwali campaign in Gujarat feel different from one in Kerala — because it should. Mind transcribes meetings and customer calls across Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, and more — catching the code-switching that''s natural to Indian business. Vibe creates video narratives with the storytelling warmth that Indian audiences love — Bollywood-inspired emotion meets Silicon Valley precision. Deck builds presentations that impress in Nariman Point boardrooms and Whitefield tech parks alike. Hub manages your pan-India campaigns so Delhi and Hyderabad launch together, not three weeks apart. Cast produces professional video in every Indian language — with voices that sound like family, not robots. And Ask Genie? Your multilingual strategist who knows that India isn''t one market — it''s a universe.',
cta = 'Your billion customers deserve content in their mother tongue. Explore each product below and see India''s potential unleashed.',
emotional_tone = 'inspiring-proud', version = 2
WHERE region_code = 'india';

-- SEA
UPDATE public.regional_narration_scripts SET
hook = '680 million people. Eleven countries. And a digital landscape so fragmented, most global tools don''t even try.',
problem_statement = 'Southeast Asian marketers know the chaos. Your Indonesian campaign doesn''t work in Thailand. Your Vietnamese content team can''t collaborate with your Filipino office because every tool assumes everyone speaks English. LINE dominates Japan and Thailand, but your CRM doesn''t integrate with it. Grab and Shopee are your real marketing channels — but try finding an AI tool that understands Bahasa product descriptions or Thai social media slang. Your audience is mobile-only — 87% of them will never open your content on a desktop — but your tools keep generating PDF-heavy, desktop-first assets. And bandwidth? Half your customers are on connections that make a 2MB image feel like a luxury.',
solution = 'Genie Suite was engineered for Southeast Asia''s beautiful complexity. Spark writes in Bahasa Indonesia, Thai, Vietnamese, Tagalog, and Malay — with the casual, mobile-native tone that SEA audiences actually engage with. Mind transcribes your cross-border team calls, handling the multilingual chaos of a typical ASEAN meeting where three languages happen in one sentence. Vibe creates vertical-first, mobile-optimized video scripts for TikTok, Reels, and Stories — because that''s where your audience lives. Deck builds lightweight, visual-heavy presentations that load fast and look stunning on any device. Hub coordinates your 11-country campaigns from a single command center — syncing launches across time zones from Bangkok to Manila. Cast produces ultra-lightweight video content optimized for low-bandwidth delivery — professional quality that doesn''t require 5G. And Ask Genie navigates the regulatory patchwork of ASEAN — from Thailand''s PDPA to Indonesia''s data localization rules.',
cta = 'Southeast Asia isn''t waiting for the world to catch up. Explore the tools built for your speed below.',
emotional_tone = 'energetic-practical', version = 2
WHERE region_code = 'sea';

-- CJK
UPDATE public.regional_narration_scripts SET
hook = 'In markets where perfection isn''t a goal but a baseline expectation, every piece of content is a reflection of your honor.',
problem_statement = 'The CJK market punishes mediocrity. Japanese consumers will abandon a brand over a single misused keigo honorific. Korean audiences can spot machine-translated content in three seconds — and they''ll screenshot it for ridicule on Naver. Chinese marketing requires not just Mandarin fluency, but native understanding of WeChat ecosystem dynamics, Douyin trends, and Xiaohongshu aesthetics. Western AI tools generate content that reads like a textbook — technically correct but culturally dead. Your team spends more time fixing AI output than they would writing from scratch. And the cost? Premium native copywriters in Tokyo, Seoul, and Shanghai command rates that make your budget weep.',
solution = 'Genie Suite meets the CJK standard. Spark writes with the linguistic precision these markets demand — proper keigo levels for Japanese business communication, 존댓말 formality for Korean corporate content, and culturally-fluent Simplified and Traditional Chinese. Mind transcribes and analyzes with tonal accuracy — it hears the difference between 妈 and 骂, between 行く and 逝く. Vibe crafts video narratives with the aesthetic philosophy each culture prizes — Japanese wabi-sabi restraint, Korean dynamic storytelling, Chinese cinematic grandeur. Deck creates presentations that respect the visual hierarchy and information density that CJK boardrooms expect. Hub orchestrates campaigns across WeChat, LINE, KakaoTalk, and Douyin simultaneously. Cast produces video with Qwen3-TTS voices that achieve native tonal fidelity — not the robotic Mandarin that makes viewers cringe. And Ask Genie navigates the complex regulatory landscapes from China''s content regulations to Japan''s APPI to Korea''s PIPA.',
cta = 'Excellence demands tools that understand excellence. Explore each product below and experience the precision your market deserves.',
emotional_tone = 'authoritative-respectful', version = 2
WHERE region_code = 'cjk';
