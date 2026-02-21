/**
 * REGIONAL GUIDE MESSAGE CATALOG
 * 
 * Provides localized messages for Ori (Creative) and Arc (Systems) guides.
 * Uses the same parent-child regional hierarchy as regional-routing-registry.ts.
 * 
 * Structure:
 *   - English (en) = default fallback for all zones
 *   - Zone-level translations (e.g., 'ar' for MENA, 'hi' for India)
 *   - Sub-regional overrides where dialect matters
 * 
 * Message keys match ContextSignal types from guideStore.ts
 */

import { type RegionalZone, getZoneFromLanguage, getZoneFromCountry, toLangBCP47 } from '@/config/regional-routing-registry';

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE KEYS — map to ContextSignals in guideStore.ts
// ═══════════════════════════════════════════════════════════════════════════

export type GuideMessageKey =
  | 'PAGE_LOAD_WELCOME'
  | 'PAGE_LOAD_CTA_START'
  | 'PAGE_LOAD_CTA_EXPLORE'
  | 'HOVER_CATEGORY'
  | 'SELECT_CATEGORY'
  | 'IDLE_TIMEOUT'
  | 'IDLE_CTA_HELP'
  | 'IDLE_CTA_GOT_IT'
  | 'HELP_ME_DECIDE'
  | 'HELP_CTA_PRODUCT'
  | 'HELP_CTA_WORKFLOW'
  | 'HELP_CTA_PUBLIC'
  | 'STEP_COMPLETED'
  | 'PUBLISH_READY'
  | 'PUBLISH_CTA';

// ═══════════════════════════════════════════════════════════════════════════
// TRANSLATIONS — English default + regional languages
// ═══════════════════════════════════════════════════════════════════════════

const MESSAGES: Record<string, Record<GuideMessageKey, string>> = {
  // ── English (Default) ─────────────────────────────────────────────────
  en: {
    PAGE_LOAD_WELCOME: "Welcome. Tell me what you want to build — I'll help shape the story.",
    PAGE_LOAD_CTA_START: 'Start with an idea',
    PAGE_LOAD_CTA_EXPLORE: 'Explore examples',
    HOVER_CATEGORY: 'Great choice. This category works well for quick wins and scalable content.',
    SELECT_CATEGORY: "I'll structure the workflow so this scales cleanly later.",
    IDLE_TIMEOUT: "Want help deciding, or do you already know what you're building?",
    IDLE_CTA_HELP: 'Help me decide',
    IDLE_CTA_GOT_IT: "I've got it",
    HELP_ME_DECIDE: 'Quick question: are you creating content for a product, an internal workflow, or a public audience?',
    HELP_CTA_PRODUCT: 'Product',
    HELP_CTA_WORKFLOW: 'Workflow',
    HELP_CTA_PUBLIC: 'Public',
    STEP_COMPLETED: "Nice. Everything's consistent so far.",
    PUBLISH_READY: 'The system is ready. Nothing left dangling.',
    PUBLISH_CTA: 'Publish',
  },

  // ── Arabic (MENA) ─────────────────────────────────────────────────────
  ar: {
    PAGE_LOAD_WELCOME: 'مرحباً. أخبرني ماذا تريد أن تبني — سأساعدك في تشكيل القصة.',
    PAGE_LOAD_CTA_START: 'ابدأ بفكرة',
    PAGE_LOAD_CTA_EXPLORE: 'استكشف الأمثلة',
    HOVER_CATEGORY: 'اختيار رائع. هذه الفئة مناسبة للنتائج السريعة والمحتوى القابل للتوسع.',
    SELECT_CATEGORY: 'سأنظم سير العمل بحيث يتوسع بسلاسة لاحقاً.',
    IDLE_TIMEOUT: 'هل تحتاج مساعدة في الاختيار، أم تعرف ماذا تريد أن تبني؟',
    IDLE_CTA_HELP: 'ساعدني في القرار',
    IDLE_CTA_GOT_IT: 'أنا أعرف',
    HELP_ME_DECIDE: 'سؤال سريع: هل تنشئ محتوى لمنتج، سير عمل داخلي، أو جمهور عام؟',
    HELP_CTA_PRODUCT: 'منتج',
    HELP_CTA_WORKFLOW: 'سير عمل',
    HELP_CTA_PUBLIC: 'جمهور عام',
    STEP_COMPLETED: 'ممتاز. كل شيء متسق حتى الآن.',
    PUBLISH_READY: 'النظام جاهز. لا شيء معلّق.',
    PUBLISH_CTA: 'نشر',
  },

  // ── Hindi (India) ─────────────────────────────────────────────────────
  hi: {
    PAGE_LOAD_WELCOME: 'स्वागत है। बताइए आप क्या बनाना चाहते हैं — मैं कहानी को आकार देने में मदद करूँगा।',
    PAGE_LOAD_CTA_START: 'एक विचार से शुरू करें',
    PAGE_LOAD_CTA_EXPLORE: 'उदाहरण देखें',
    HOVER_CATEGORY: 'बढ़िया चुनाव। यह श्रेणी त्वरित परिणामों और स्केलेबल कंटेंट के लिए उपयुक्त है।',
    SELECT_CATEGORY: 'मैं वर्कफ़्लो को ऐसे व्यवस्थित करूँगा कि बाद में आसानी से स्केल हो सके।',
    IDLE_TIMEOUT: 'क्या आपको तय करने में मदद चाहिए, या आप जानते हैं क्या बनाना है?',
    IDLE_CTA_HELP: 'मुझे मदद चाहिए',
    IDLE_CTA_GOT_IT: 'मुझे पता है',
    HELP_ME_DECIDE: 'छोटा सवाल: आप किसके लिए कंटेंट बना रहे हैं — प्रोडक्ट, इंटरनल वर्कफ़्लो, या पब्लिक ऑडियंस?',
    HELP_CTA_PRODUCT: 'प्रोडक्ट',
    HELP_CTA_WORKFLOW: 'वर्कफ़्लो',
    HELP_CTA_PUBLIC: 'पब्लिक',
    STEP_COMPLETED: 'बहुत बढ़िया। अभी तक सब कुछ सही है।',
    PUBLISH_READY: 'सिस्टम तैयार है। कोई अधूरा काम नहीं।',
    PUBLISH_CTA: 'प्रकाशित करें',
  },

  // ── Spanish (LATAM/EU) ────────────────────────────────────────────────
  es: {
    PAGE_LOAD_WELCOME: 'Bienvenido. Cuéntame qué quieres construir — te ayudaré a dar forma a la historia.',
    PAGE_LOAD_CTA_START: 'Empezar con una idea',
    PAGE_LOAD_CTA_EXPLORE: 'Explorar ejemplos',
    HOVER_CATEGORY: 'Gran elección. Esta categoría funciona bien para resultados rápidos y contenido escalable.',
    SELECT_CATEGORY: 'Voy a estructurar el flujo de trabajo para que escale sin problemas después.',
    IDLE_TIMEOUT: '¿Necesitas ayuda para decidir, o ya sabes qué quieres crear?',
    IDLE_CTA_HELP: 'Ayúdame a decidir',
    IDLE_CTA_GOT_IT: 'Ya lo tengo',
    HELP_ME_DECIDE: 'Pregunta rápida: ¿estás creando contenido para un producto, un flujo de trabajo interno, o una audiencia pública?',
    HELP_CTA_PRODUCT: 'Producto',
    HELP_CTA_WORKFLOW: 'Flujo de trabajo',
    HELP_CTA_PUBLIC: 'Público',
    STEP_COMPLETED: 'Bien. Todo está consistente hasta ahora.',
    PUBLISH_READY: 'El sistema está listo. Nada pendiente.',
    PUBLISH_CTA: 'Publicar',
  },

  // ── French (EU/Africa) ────────────────────────────────────────────────
  fr: {
    PAGE_LOAD_WELCOME: "Bienvenue. Dites-moi ce que vous voulez créer — je vous aiderai à façonner l'histoire.",
    PAGE_LOAD_CTA_START: 'Commencer avec une idée',
    PAGE_LOAD_CTA_EXPLORE: 'Explorer les exemples',
    HOVER_CATEGORY: 'Excellent choix. Cette catégorie fonctionne bien pour des résultats rapides et du contenu évolutif.',
    SELECT_CATEGORY: "Je vais structurer le flux de travail pour qu'il s'adapte facilement par la suite.",
    IDLE_TIMEOUT: 'Besoin d\'aide pour décider, ou vous savez déjà ce que vous voulez créer ?',
    IDLE_CTA_HELP: 'Aidez-moi à décider',
    IDLE_CTA_GOT_IT: 'J\'ai compris',
    HELP_ME_DECIDE: 'Question rapide : créez-vous du contenu pour un produit, un processus interne ou un public ?',
    HELP_CTA_PRODUCT: 'Produit',
    HELP_CTA_WORKFLOW: 'Processus',
    HELP_CTA_PUBLIC: 'Public',
    STEP_COMPLETED: 'Bien. Tout est cohérent pour le moment.',
    PUBLISH_READY: 'Le système est prêt. Rien en suspens.',
    PUBLISH_CTA: 'Publier',
  },

  // ── German (DACH) ─────────────────────────────────────────────────────
  de: {
    PAGE_LOAD_WELCOME: 'Willkommen. Sagen Sie mir, was Sie erstellen möchten — ich helfe Ihnen, die Geschichte zu formen.',
    PAGE_LOAD_CTA_START: 'Mit einer Idee starten',
    PAGE_LOAD_CTA_EXPLORE: 'Beispiele erkunden',
    HOVER_CATEGORY: 'Tolle Wahl. Diese Kategorie eignet sich gut für schnelle Erfolge und skalierbaren Inhalt.',
    SELECT_CATEGORY: 'Ich strukturiere den Workflow, damit er später sauber skaliert.',
    IDLE_TIMEOUT: 'Brauchen Sie Hilfe bei der Entscheidung, oder wissen Sie schon, was Sie erstellen möchten?',
    IDLE_CTA_HELP: 'Helfen Sie mir',
    IDLE_CTA_GOT_IT: 'Ich weiß Bescheid',
    HELP_ME_DECIDE: 'Kurze Frage: Erstellen Sie Inhalte für ein Produkt, einen internen Workflow oder ein öffentliches Publikum?',
    HELP_CTA_PRODUCT: 'Produkt',
    HELP_CTA_WORKFLOW: 'Workflow',
    HELP_CTA_PUBLIC: 'Öffentlich',
    STEP_COMPLETED: 'Gut. Alles ist bisher konsistent.',
    PUBLISH_READY: 'Das System ist bereit. Nichts offen.',
    PUBLISH_CTA: 'Veröffentlichen',
  },

  // ── Portuguese (Brazil) ───────────────────────────────────────────────
  pt: {
    PAGE_LOAD_WELCOME: 'Bem-vindo. Me conte o que você quer construir — vou ajudar a moldar a história.',
    PAGE_LOAD_CTA_START: 'Começar com uma ideia',
    PAGE_LOAD_CTA_EXPLORE: 'Explorar exemplos',
    HOVER_CATEGORY: 'Ótima escolha. Esta categoria funciona bem para resultados rápidos e conteúdo escalável.',
    SELECT_CATEGORY: 'Vou estruturar o fluxo de trabalho para escalar bem depois.',
    IDLE_TIMEOUT: 'Precisa de ajuda para decidir, ou já sabe o que quer criar?',
    IDLE_CTA_HELP: 'Me ajude a decidir',
    IDLE_CTA_GOT_IT: 'Já sei',
    HELP_ME_DECIDE: 'Pergunta rápida: você está criando conteúdo para um produto, fluxo de trabalho interno ou público?',
    HELP_CTA_PRODUCT: 'Produto',
    HELP_CTA_WORKFLOW: 'Fluxo de trabalho',
    HELP_CTA_PUBLIC: 'Público',
    STEP_COMPLETED: 'Ótimo. Tudo consistente até agora.',
    PUBLISH_READY: 'O sistema está pronto. Nada pendente.',
    PUBLISH_CTA: 'Publicar',
  },

  // ── Chinese (CJK) ────────────────────────────────────────────────────
  zh: {
    PAGE_LOAD_WELCOME: '欢迎。告诉我你想要创建什么——我会帮助你构思故事。',
    PAGE_LOAD_CTA_START: '从一个想法开始',
    PAGE_LOAD_CTA_EXPLORE: '探索示例',
    HOVER_CATEGORY: '很好的选择。这个类别非常适合快速成果和可扩展的内容。',
    SELECT_CATEGORY: '我会组织工作流程，确保之后可以顺利扩展。',
    IDLE_TIMEOUT: '需要帮助做决定，还是你已经知道要创建什么了？',
    IDLE_CTA_HELP: '帮我决定',
    IDLE_CTA_GOT_IT: '我知道了',
    HELP_ME_DECIDE: '快速提问：你是在为产品、内部工作流程，还是公共受众创建内容？',
    HELP_CTA_PRODUCT: '产品',
    HELP_CTA_WORKFLOW: '工作流程',
    HELP_CTA_PUBLIC: '公共',
    STEP_COMPLETED: '很好。到目前为止一切一致。',
    PUBLISH_READY: '系统已就绪。没有遗留问题。',
    PUBLISH_CTA: '发布',
  },

  // ── Japanese ──────────────────────────────────────────────────────────
  ja: {
    PAGE_LOAD_WELCOME: 'ようこそ。何を作りたいか教えてください — ストーリーの形を整えるお手伝いをします。',
    PAGE_LOAD_CTA_START: 'アイデアから始める',
    PAGE_LOAD_CTA_EXPLORE: '例を見る',
    HOVER_CATEGORY: '素晴らしい選択です。このカテゴリは迅速な成果とスケーラブルなコンテンツに適しています。',
    SELECT_CATEGORY: '後でスムーズにスケールできるようにワークフローを構成します。',
    IDLE_TIMEOUT: '決定にお困りですか？それとも何を作るかもう決まっていますか？',
    IDLE_CTA_HELP: '手伝ってください',
    IDLE_CTA_GOT_IT: 'わかっています',
    HELP_ME_DECIDE: '簡単な質問：製品、社内ワークフロー、一般向けのどれのコンテンツを作成しますか？',
    HELP_CTA_PRODUCT: '製品',
    HELP_CTA_WORKFLOW: 'ワークフロー',
    HELP_CTA_PUBLIC: '一般向け',
    STEP_COMPLETED: 'いいですね。ここまで一貫しています。',
    PUBLISH_READY: 'システムの準備ができました。未処理の項目はありません。',
    PUBLISH_CTA: '公開する',
  },

  // ── Korean ────────────────────────────────────────────────────────────
  ko: {
    PAGE_LOAD_WELCOME: '환영합니다. 무엇을 만들고 싶은지 말씀해 주세요 — 스토리를 만드는 데 도움을 드리겠습니다.',
    PAGE_LOAD_CTA_START: '아이디어로 시작',
    PAGE_LOAD_CTA_EXPLORE: '예시 둘러보기',
    HOVER_CATEGORY: '좋은 선택입니다. 이 카테고리는 빠른 성과와 확장 가능한 콘텐츠에 적합합니다.',
    SELECT_CATEGORY: '나중에 원활하게 확장할 수 있도록 워크플로를 구성하겠습니다.',
    IDLE_TIMEOUT: '결정에 도움이 필요하신가요, 아니면 이미 만들 것을 알고 계신가요?',
    IDLE_CTA_HELP: '도와주세요',
    IDLE_CTA_GOT_IT: '알겠습니다',
    HELP_ME_DECIDE: '간단한 질문: 제품, 내부 워크플로, 공개 대상 중 어떤 콘텐츠를 만들고 계신가요?',
    HELP_CTA_PRODUCT: '제품',
    HELP_CTA_WORKFLOW: '워크플로',
    HELP_CTA_PUBLIC: '공개',
    STEP_COMPLETED: '좋습니다. 지금까지 모두 일관성이 있습니다.',
    PUBLISH_READY: '시스템이 준비되었습니다. 남은 작업이 없습니다.',
    PUBLISH_CTA: '게시',
  },

  // ── Turkish ───────────────────────────────────────────────────────────
  tr: {
    PAGE_LOAD_WELCOME: 'Hoş geldiniz. Ne oluşturmak istediğinizi söyleyin — hikayeyi şekillendirmenize yardımcı olacağım.',
    PAGE_LOAD_CTA_START: 'Bir fikirle başla',
    PAGE_LOAD_CTA_EXPLORE: 'Örnekleri keşfet',
    HOVER_CATEGORY: 'Harika seçim. Bu kategori hızlı sonuçlar ve ölçeklenebilir içerik için idealdir.',
    SELECT_CATEGORY: 'İş akışını daha sonra sorunsuz ölçeklenecek şekilde yapılandıracağım.',
    IDLE_TIMEOUT: 'Karar vermekte yardıma mı ihtiyacınız var, yoksa ne oluşturacağınızı biliyor musunuz?',
    IDLE_CTA_HELP: 'Karar vermeme yardım et',
    IDLE_CTA_GOT_IT: 'Biliyorum',
    HELP_ME_DECIDE: 'Kısa bir soru: Bir ürün, dahili iş akışı veya genel bir kitle için mi içerik oluşturuyorsunuz?',
    HELP_CTA_PRODUCT: 'Ürün',
    HELP_CTA_WORKFLOW: 'İş akışı',
    HELP_CTA_PUBLIC: 'Genel',
    STEP_COMPLETED: 'Güzel. Şu ana kadar her şey tutarlı.',
    PUBLISH_READY: 'Sistem hazır. Askıda kalan bir şey yok.',
    PUBLISH_CTA: 'Yayınla',
  },

  // ── Urdu (Pakistan) ───────────────────────────────────────────────────
  ur: {
    PAGE_LOAD_WELCOME: 'خوش آمدید۔ مجھے بتائیں آپ کیا بنانا چاہتے ہیں — میں کہانی کو شکل دینے میں مدد کروں گا۔',
    PAGE_LOAD_CTA_START: 'ایک خیال سے شروع کریں',
    PAGE_LOAD_CTA_EXPLORE: 'مثالیں دیکھیں',
    HOVER_CATEGORY: 'بہترین انتخاب۔ یہ زمرہ فوری نتائج اور قابل توسیع مواد کے لیے موزوں ہے۔',
    SELECT_CATEGORY: 'میں ورک فلو کو ایسے ترتیب دوں گا کہ بعد میں آسانی سے بڑھایا جا سکے۔',
    IDLE_TIMEOUT: 'کیا آپ کو فیصلے میں مدد چاہیے، یا آپ جانتے ہیں کیا بنانا ہے؟',
    IDLE_CTA_HELP: 'مدد کریں',
    IDLE_CTA_GOT_IT: 'مجھے پتا ہے',
    HELP_ME_DECIDE: 'فوری سوال: آپ پروڈکٹ، اندرونی ورک فلو، یا عوامی سامعین کے لیے مواد بنا رہے ہیں؟',
    HELP_CTA_PRODUCT: 'پروڈکٹ',
    HELP_CTA_WORKFLOW: 'ورک فلو',
    HELP_CTA_PUBLIC: 'عوامی',
    STEP_COMPLETED: 'بہت اچھا۔ ابھی تک سب کچھ مطابق ہے۔',
    PUBLISH_READY: 'سسٹم تیار ہے۔ کوئی بھی کام ادھورا نہیں۔',
    PUBLISH_CTA: 'شائع کریں',
  },

  // ── Swahili (Africa) ──────────────────────────────────────────────────
  sw: {
    PAGE_LOAD_WELCOME: 'Karibu. Niambie unataka kuunda nini — nitakusaidia kuunda hadithi.',
    PAGE_LOAD_CTA_START: 'Anza na wazo',
    PAGE_LOAD_CTA_EXPLORE: 'Angalia mifano',
    HOVER_CATEGORY: 'Chaguo zuri. Kategoria hii inafaa kwa matokeo ya haraka na maudhui yanayoweza kupanuka.',
    SELECT_CATEGORY: 'Nitapanga mtiririko wa kazi ili upanuke vizuri baadaye.',
    IDLE_TIMEOUT: 'Je, unahitaji msaada kuamua, au tayari unajua unataka kuunda nini?',
    IDLE_CTA_HELP: 'Nisaidie kuamua',
    IDLE_CTA_GOT_IT: 'Ninaelewa',
    HELP_ME_DECIDE: 'Swali la haraka: je, unaunda maudhui kwa bidhaa, mtiririko wa kazi wa ndani, au hadhira ya umma?',
    HELP_CTA_PRODUCT: 'Bidhaa',
    HELP_CTA_WORKFLOW: 'Mtiririko',
    HELP_CTA_PUBLIC: 'Umma',
    STEP_COMPLETED: 'Vizuri. Kila kitu ni sawa hadi sasa.',
    PUBLISH_READY: 'Mfumo uko tayari. Hakuna kilichobaki.',
    PUBLISH_CTA: 'Chapisha',
  },

  // ── Indonesian (SEA) ──────────────────────────────────────────────────
  id: {
    PAGE_LOAD_WELCOME: 'Selamat datang. Ceritakan apa yang ingin Anda buat — saya akan membantu membentuk ceritanya.',
    PAGE_LOAD_CTA_START: 'Mulai dengan ide',
    PAGE_LOAD_CTA_EXPLORE: 'Jelajahi contoh',
    HOVER_CATEGORY: 'Pilihan bagus. Kategori ini cocok untuk hasil cepat dan konten yang dapat diskalakan.',
    SELECT_CATEGORY: 'Saya akan menyusun alur kerja agar bisa berkembang dengan baik nanti.',
    IDLE_TIMEOUT: 'Perlu bantuan memutuskan, atau sudah tahu apa yang ingin dibuat?',
    IDLE_CTA_HELP: 'Bantu saya',
    IDLE_CTA_GOT_IT: 'Saya tahu',
    HELP_ME_DECIDE: 'Pertanyaan cepat: apakah Anda membuat konten untuk produk, alur kerja internal, atau audiens publik?',
    HELP_CTA_PRODUCT: 'Produk',
    HELP_CTA_WORKFLOW: 'Alur kerja',
    HELP_CTA_PUBLIC: 'Publik',
    STEP_COMPLETED: 'Bagus. Semuanya konsisten sejauh ini.',
    PUBLISH_READY: 'Sistem siap. Tidak ada yang tertunda.',
    PUBLISH_CTA: 'Terbitkan',
  },

  // ── Vietnamese (SEA) ──────────────────────────────────────────────────
  vi: {
    PAGE_LOAD_WELCOME: 'Chào mừng. Hãy cho tôi biết bạn muốn tạo gì — tôi sẽ giúp định hình câu chuyện.',
    PAGE_LOAD_CTA_START: 'Bắt đầu với ý tưởng',
    PAGE_LOAD_CTA_EXPLORE: 'Khám phá ví dụ',
    HOVER_CATEGORY: 'Lựa chọn tuyệt vời. Danh mục này phù hợp cho kết quả nhanh và nội dung có thể mở rộng.',
    SELECT_CATEGORY: 'Tôi sẽ cấu trúc quy trình để có thể mở rộng dễ dàng sau này.',
    IDLE_TIMEOUT: 'Bạn cần giúp quyết định, hay đã biết muốn tạo gì?',
    IDLE_CTA_HELP: 'Giúp tôi',
    IDLE_CTA_GOT_IT: 'Tôi biết rồi',
    HELP_ME_DECIDE: 'Câu hỏi nhanh: bạn đang tạo nội dung cho sản phẩm, quy trình nội bộ, hay đối tượng công chúng?',
    HELP_CTA_PRODUCT: 'Sản phẩm',
    HELP_CTA_WORKFLOW: 'Quy trình',
    HELP_CTA_PUBLIC: 'Công chúng',
    STEP_COMPLETED: 'Tốt. Mọi thứ đều nhất quán cho đến nay.',
    PUBLISH_READY: 'Hệ thống đã sẵn sàng. Không còn gì chưa hoàn thành.',
    PUBLISH_CTA: 'Xuất bản',
  },

  // ── Bengali (Bangladesh/India East) ───────────────────────────────────
  bn: {
    PAGE_LOAD_WELCOME: 'স্বাগতম। আপনি কী তৈরি করতে চান বলুন — আমি গল্প তৈরি করতে সাহায্য করব।',
    PAGE_LOAD_CTA_START: 'একটি ধারণা দিয়ে শুরু করুন',
    PAGE_LOAD_CTA_EXPLORE: 'উদাহরণ দেখুন',
    HOVER_CATEGORY: 'চমৎকার পছন্দ। এই ক্যাটেগরি দ্রুত ফলাফল এবং স্কেলযোগ্য কন্টেন্টের জন্য উপযুক্ত।',
    SELECT_CATEGORY: 'আমি ওয়ার্কফ্লো এমনভাবে সাজাব যাতে পরে সহজে স্কেল করা যায়।',
    IDLE_TIMEOUT: 'সিদ্ধান্ত নিতে সাহায্য দরকার, নাকি আপনি জানেন কী তৈরি করবেন?',
    IDLE_CTA_HELP: 'আমাকে সাহায্য করুন',
    IDLE_CTA_GOT_IT: 'আমি জানি',
    HELP_ME_DECIDE: 'দ্রুত প্রশ্ন: আপনি পণ্য, অভ্যন্তরীণ ওয়ার্কফ্লো, নাকি পাবলিক দর্শকদের জন্য কন্টেন্ট তৈরি করছেন?',
    HELP_CTA_PRODUCT: 'পণ্য',
    HELP_CTA_WORKFLOW: 'ওয়ার্কফ্লো',
    HELP_CTA_PUBLIC: 'পাবলিক',
    STEP_COMPLETED: 'চমৎকার। এখন পর্যন্ত সব ঠিক আছে।',
    PUBLISH_READY: 'সিস্টেম প্রস্তুত। কিছুই বাকি নেই।',
    PUBLISH_CTA: 'প্রকাশ করুন',
  },

  // ── Thai (SEA) ────────────────────────────────────────────────────────
  th: {
    PAGE_LOAD_WELCOME: 'ยินดีต้อนรับ บอกฉันว่าคุณต้องการสร้างอะไร — ฉันจะช่วยกำหนดเรื่องราว',
    PAGE_LOAD_CTA_START: 'เริ่มต้นด้วยไอเดีย',
    PAGE_LOAD_CTA_EXPLORE: 'สำรวจตัวอย่าง',
    HOVER_CATEGORY: 'เลือกได้ดี หมวดนี้เหมาะสำหรับผลลัพธ์ที่รวดเร็วและเนื้อหาที่ขยายได้',
    SELECT_CATEGORY: 'ฉันจะจัดโครงสร้างเวิร์กโฟลว์เพื่อให้ขยายได้ง่ายในภายหลัง',
    IDLE_TIMEOUT: 'ต้องการความช่วยเหลือในการตัดสินใจ หรือรู้แล้วว่าจะสร้างอะไร?',
    IDLE_CTA_HELP: 'ช่วยฉันตัดสินใจ',
    IDLE_CTA_GOT_IT: 'ฉันรู้แล้ว',
    HELP_ME_DECIDE: 'คำถามสั้นๆ: คุณกำลังสร้างเนื้อหาสำหรับผลิตภัณฑ์ เวิร์กโฟลว์ภายใน หรือผู้ชมทั่วไป?',
    HELP_CTA_PRODUCT: 'ผลิตภัณฑ์',
    HELP_CTA_WORKFLOW: 'เวิร์กโฟลว์',
    HELP_CTA_PUBLIC: 'ทั่วไป',
    STEP_COMPLETED: 'ดี ทุกอย่างสอดคล้องกันจนถึงตอนนี้',
    PUBLISH_READY: 'ระบบพร้อมแล้ว ไม่มีอะไรค้างอยู่',
    PUBLISH_CTA: 'เผยแพร่',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONE → LANGUAGE RESOLUTION (parent-child)
// ═══════════════════════════════════════════════════════════════════════════

/** Map zones to their primary language for message lookup */
const ZONE_DEFAULT_LANGUAGE: Record<RegionalZone, string> = {
  western: 'en',
  cjk: 'zh',
  mena: 'ar',
  india: 'hi',
  africa: 'sw',
  oceania: 'en',
  turkey: 'tr',
  caribbean: 'en',
  eastern_europe: 'en', // English default, regional languages added later
  central_asia: 'en',
  pakistan: 'ur',
  bangladesh: 'bn',
  sea: 'id',
  south_asia: 'en',
  fallback: 'en',
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

export interface RegionalGuideContext {
  zone: RegionalZone;
  languageCode: string; // BCP47
  shortLang: string;    // 2-letter
  isRTL: boolean;
}

/**
 * Resolve regional context from available signals (IP country, browser lang, manual override).
 * Uses the same detection chain as landing pages and script/TTS.
 */
export function resolveGuideRegion(
  browserLang?: string,
  countryCode?: string,
  manualLang?: string,
): RegionalGuideContext {
  // 1. Manual override (highest priority)
  if (manualLang) {
    const short = manualLang.split('-')[0].toLowerCase();
    const zone = getZoneFromLanguage(short);
    return {
      zone,
      languageCode: toLangBCP47(short),
      shortLang: short,
      isRTL: ['ar', 'he', 'fa', 'ur'].includes(short),
    };
  }

  // 2. Browser language
  if (browserLang) {
    const short = browserLang.split('-')[0].toLowerCase();
    const zone = getZoneFromLanguage(short);
    return {
      zone,
      languageCode: toLangBCP47(short),
      shortLang: short,
      isRTL: ['ar', 'he', 'fa', 'ur'].includes(short),
    };
  }

  // 3. IP-based country code
  if (countryCode) {
    const zone = getZoneFromCountry(countryCode);
    const lang = ZONE_DEFAULT_LANGUAGE[zone];
    return {
      zone,
      languageCode: toLangBCP47(lang),
      shortLang: lang,
      isRTL: ['ar', 'he', 'fa', 'ur'].includes(lang),
    };
  }

  // 4. Default
  return { zone: 'western', languageCode: 'en-US', shortLang: 'en', isRTL: false };
}

/**
 * Get a localized guide message.
 * Falls back: exact language → zone default language → English
 */
export function getGuideMessage(key: GuideMessageKey, shortLang: string): string {
  // 1. Exact language match
  if (MESSAGES[shortLang]?.[key]) return MESSAGES[shortLang][key];
  
  // 2. English fallback
  return MESSAGES.en[key] || key;
}

/**
 * Get all messages for a language (useful for pre-loading)
 */
export function getGuideMessages(shortLang: string): Record<GuideMessageKey, string> {
  return { ...MESSAGES.en, ...(MESSAGES[shortLang] || {}) };
}

/**
 * Check if a language has translations available
 */
export function hasGuideTranslation(shortLang: string): boolean {
  return shortLang in MESSAGES;
}

/**
 * Get all supported guide languages
 */
export function getSupportedGuideLanguages(): string[] {
  return Object.keys(MESSAGES);
}
