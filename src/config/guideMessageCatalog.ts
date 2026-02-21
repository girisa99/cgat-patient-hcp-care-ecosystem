/**
 * REGIONAL GUIDE MESSAGE CATALOG — Full 82+ Region Coverage
 * 
 * Provides localized messages for Ori (Creative) and Arc (Systems) guides.
 * Uses parent→child inheritance from regional-routing-registry.ts:
 *   Sub-region code → Parent language → Zone default → English
 * 
 * Structure:
 *   - MESSAGES: Direct language translations (core 20+ languages)
 *   - REGION_LANG_MAP: Maps all 82+ region codes → language code
 *   - getGuideMessage(): Resolves with full inheritance chain
 *   - resolveGuideRegion(): IP/browser/manual → RegionalGuideContext
 */

import { 
  type RegionalZone, 
  getZoneFromLanguage, 
  getZoneFromCountry, 
  toLangBCP47,
} from '@/config/regional-routing-registry';

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
// TRANSLATIONS — Core languages (20+). Sub-regions inherit from these.
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

  // ── Spanish ───────────────────────────────────────────────────────────
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

  // ── French ────────────────────────────────────────────────────────────
  fr: {
    PAGE_LOAD_WELCOME: "Bienvenue. Dites-moi ce que vous voulez créer — je vous aiderai à façonner l'histoire.",
    PAGE_LOAD_CTA_START: 'Commencer avec une idée',
    PAGE_LOAD_CTA_EXPLORE: 'Explorer les exemples',
    HOVER_CATEGORY: 'Excellent choix. Cette catégorie fonctionne bien pour des résultats rapides et du contenu évolutif.',
    SELECT_CATEGORY: "Je vais structurer le flux de travail pour qu'il s'adapte facilement par la suite.",
    IDLE_TIMEOUT: "Besoin d'aide pour décider, ou vous savez déjà ce que vous voulez créer ?",
    IDLE_CTA_HELP: 'Aidez-moi à décider',
    IDLE_CTA_GOT_IT: "J'ai compris",
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

  // ── Portuguese ────────────────────────────────────────────────────────
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

  // ── Chinese ───────────────────────────────────────────────────────────
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

  // ── Italian ───────────────────────────────────────────────────────────
  it: {
    PAGE_LOAD_WELCOME: 'Benvenuto. Dimmi cosa vuoi creare — ti aiuterò a dare forma alla storia.',
    PAGE_LOAD_CTA_START: 'Inizia con un\'idea',
    PAGE_LOAD_CTA_EXPLORE: 'Esplora esempi',
    HOVER_CATEGORY: 'Ottima scelta. Questa categoria è ideale per risultati rapidi e contenuti scalabili.',
    SELECT_CATEGORY: 'Organizzerò il flusso di lavoro in modo che si espanda facilmente in seguito.',
    IDLE_TIMEOUT: 'Hai bisogno di aiuto per decidere, o sai già cosa vuoi creare?',
    IDLE_CTA_HELP: 'Aiutami a decidere',
    IDLE_CTA_GOT_IT: 'Lo so già',
    HELP_ME_DECIDE: 'Domanda veloce: stai creando contenuti per un prodotto, un workflow interno o un pubblico?',
    HELP_CTA_PRODUCT: 'Prodotto',
    HELP_CTA_WORKFLOW: 'Workflow',
    HELP_CTA_PUBLIC: 'Pubblico',
    STEP_COMPLETED: 'Bene. Tutto coerente finora.',
    PUBLISH_READY: 'Il sistema è pronto. Niente in sospeso.',
    PUBLISH_CTA: 'Pubblica',
  },

  // ── Dutch ─────────────────────────────────────────────────────────────
  nl: {
    PAGE_LOAD_WELCOME: 'Welkom. Vertel me wat je wilt maken — ik help je het verhaal vorm te geven.',
    PAGE_LOAD_CTA_START: 'Begin met een idee',
    PAGE_LOAD_CTA_EXPLORE: 'Bekijk voorbeelden',
    HOVER_CATEGORY: 'Goede keuze. Deze categorie werkt goed voor snelle resultaten en schaalbare content.',
    SELECT_CATEGORY: 'Ik structureer de workflow zodat deze later goed schaalt.',
    IDLE_TIMEOUT: 'Hulp nodig bij het kiezen, of weet je al wat je wilt maken?',
    IDLE_CTA_HELP: 'Help me kiezen',
    IDLE_CTA_GOT_IT: 'Ik weet het',
    HELP_ME_DECIDE: 'Snelle vraag: maak je content voor een product, interne workflow of publiek?',
    HELP_CTA_PRODUCT: 'Product',
    HELP_CTA_WORKFLOW: 'Workflow',
    HELP_CTA_PUBLIC: 'Publiek',
    STEP_COMPLETED: 'Goed. Alles is tot nu toe consistent.',
    PUBLISH_READY: 'Het systeem is klaar. Niets openstaand.',
    PUBLISH_CTA: 'Publiceren',
  },

  // ── Polish ────────────────────────────────────────────────────────────
  pl: {
    PAGE_LOAD_WELCOME: 'Witaj. Powiedz mi, co chcesz stworzyć — pomogę ukształtować historię.',
    PAGE_LOAD_CTA_START: 'Zacznij od pomysłu',
    PAGE_LOAD_CTA_EXPLORE: 'Przeglądaj przykłady',
    HOVER_CATEGORY: 'Świetny wybór. Ta kategoria sprawdza się w szybkich efektach i skalowalnych treściach.',
    SELECT_CATEGORY: 'Zorganizuję przepływ pracy tak, aby łatwo się skalował.',
    IDLE_TIMEOUT: 'Potrzebujesz pomocy w podjęciu decyzji, czy już wiesz, co chcesz stworzyć?',
    IDLE_CTA_HELP: 'Pomóż mi zdecydować',
    IDLE_CTA_GOT_IT: 'Już wiem',
    HELP_ME_DECIDE: 'Szybkie pytanie: tworzysz treści dla produktu, wewnętrznego procesu czy odbiorców publicznych?',
    HELP_CTA_PRODUCT: 'Produkt',
    HELP_CTA_WORKFLOW: 'Proces',
    HELP_CTA_PUBLIC: 'Publiczny',
    STEP_COMPLETED: 'Dobrze. Wszystko jest spójne.',
    PUBLISH_READY: 'System jest gotowy. Nic nie zostało.',
    PUBLISH_CTA: 'Opublikuj',
  },

  // ── Ukrainian ─────────────────────────────────────────────────────────
  uk: {
    PAGE_LOAD_WELCOME: 'Ласкаво просимо. Розкажіть, що хочете створити — я допоможу сформувати історію.',
    PAGE_LOAD_CTA_START: 'Почніть з ідеї',
    PAGE_LOAD_CTA_EXPLORE: 'Переглянути приклади',
    HOVER_CATEGORY: 'Чудовий вибір. Ця категорія підходить для швидких результатів і масштабованого контенту.',
    SELECT_CATEGORY: 'Я структурую робочий процес для легкого масштабування.',
    IDLE_TIMEOUT: 'Потрібна допомога з вибором, чи вже знаєте що створити?',
    IDLE_CTA_HELP: 'Допоможіть обрати',
    IDLE_CTA_GOT_IT: 'Я знаю',
    HELP_ME_DECIDE: 'Швидке запитання: ви створюєте контент для продукту, внутрішнього процесу чи публічної аудиторії?',
    HELP_CTA_PRODUCT: 'Продукт',
    HELP_CTA_WORKFLOW: 'Процес',
    HELP_CTA_PUBLIC: 'Публічний',
    STEP_COMPLETED: 'Чудово. Все послідовно.',
    PUBLISH_READY: 'Система готова. Нічого не залишилося.',
    PUBLISH_CTA: 'Опублікувати',
  },

  // ── Tamil (India South) ───────────────────────────────────────────────
  ta: {
    PAGE_LOAD_WELCOME: 'வரவேற்கிறோம். நீங்கள் என்ன உருவாக்க விரும்புகிறீர்கள் என்று சொல்லுங்கள் — கதையை வடிவமைக்க உதவுவேன்.',
    PAGE_LOAD_CTA_START: 'ஒரு யோசனையில் தொடங்குங்கள்',
    PAGE_LOAD_CTA_EXPLORE: 'எடுத்துக்காட்டுகள் பாருங்கள்',
    HOVER_CATEGORY: 'நல்ல தேர்வு. இந்த வகை விரைவான முடிவுகளுக்கும் அளவிடக்கூடிய உள்ளடக்கத்திற்கும் ஏற்றது.',
    SELECT_CATEGORY: 'பின்னர் எளிதாக விரிவடையும் வகையில் பணிப்பாய்வை ஒழுங்கமைக்கிறேன்.',
    IDLE_TIMEOUT: 'முடிவெடுக்க உதவி வேண்டுமா, அல்லது என்ன உருவாக்குவது என்று தெரியுமா?',
    IDLE_CTA_HELP: 'உதவுங்கள்',
    IDLE_CTA_GOT_IT: 'எனக்கு தெரியும்',
    HELP_ME_DECIDE: 'விரைவான கேள்வி: தயாரிப்பு, உள் பணிப்பாய்வு அல்லது பொது பார்வையாளர்களுக்கா உள்ளடக்கம் உருவாக்குகிறீர்கள்?',
    HELP_CTA_PRODUCT: 'தயாரிப்பு',
    HELP_CTA_WORKFLOW: 'பணிப்பாய்வு',
    HELP_CTA_PUBLIC: 'பொது',
    STEP_COMPLETED: 'நன்று. இதுவரை எல்லாம் சரியாக உள்ளது.',
    PUBLISH_READY: 'அமைப்பு தயார். எதுவும் நிலுவையில் இல்லை.',
    PUBLISH_CTA: 'வெளியிடு',
  },

  // ── Telugu (India South) ──────────────────────────────────────────────
  te: {
    PAGE_LOAD_WELCOME: 'స్వాగతం. మీరు ఏమి తయారు చేయాలనుకుంటున్నారో చెప్పండి — కథను రూపొందించడంలో సహాయం చేస్తాను.',
    PAGE_LOAD_CTA_START: 'ఒక ఆలోచనతో ప్రారంభించండి',
    PAGE_LOAD_CTA_EXPLORE: 'ఉదాహరణలు చూడండి',
    HOVER_CATEGORY: 'మంచి ఎంపిక. ఈ వర్గం త్వరిత ఫలితాలకు మరియు స్కేలబుల్ కంటెంట్‌కు అనుకూలం.',
    SELECT_CATEGORY: 'తర్వాత సులభంగా స్కేల్ అయ్యేలా వర్క్‌ఫ్లోను నిర్మిస్తాను.',
    IDLE_TIMEOUT: 'నిర్ణయించుకోవడంలో సహాయం కావాలా, లేదా ఏమి తయారు చేయాలో తెలుసా?',
    IDLE_CTA_HELP: 'సహాయం చేయండి',
    IDLE_CTA_GOT_IT: 'నాకు తెలుసు',
    HELP_ME_DECIDE: 'త్వరిత ప్రశ్న: మీరు ఉత్పత్తి, అంతర్గత వర్క్‌ఫ్లో లేదా పబ్లిక్ ప్రేక్షకుల కోసం కంటెంట్ తయారు చేస్తున్నారా?',
    HELP_CTA_PRODUCT: 'ఉత్పత్తి',
    HELP_CTA_WORKFLOW: 'వర్క్‌ఫ్లో',
    HELP_CTA_PUBLIC: 'పబ్లిక్',
    STEP_COMPLETED: 'బాగుంది. ఇప్పటివరకు అంతా సరిగ్గా ఉంది.',
    PUBLISH_READY: 'సిస్టమ్ సిద్ధంగా ఉంది. ఏమీ మిగిలి లేదు.',
    PUBLISH_CTA: 'ప్రచురించు',
  },

  // ── Marathi (India West) ──────────────────────────────────────────────
  mr: {
    PAGE_LOAD_WELCOME: 'स्वागत आहे. तुम्हाला काय बनवायचे आहे ते सांगा — मी कथा तयार करण्यात मदत करेन.',
    PAGE_LOAD_CTA_START: 'एका कल्पनेने सुरुवात करा',
    PAGE_LOAD_CTA_EXPLORE: 'उदाहरणे पहा',
    HOVER_CATEGORY: 'छान निवड. या श्रेणीत जलद निकाल आणि स्केलेबल कंटेंट चांगले काम करते.',
    SELECT_CATEGORY: 'मी वर्कफ्लो असा तयार करेन की नंतर सहज स्केल होईल.',
    IDLE_TIMEOUT: 'ठरवण्यात मदत हवी आहे, की तुम्हाला काय बनवायचे आहे ते माहीत आहे?',
    IDLE_CTA_HELP: 'मला मदत करा',
    IDLE_CTA_GOT_IT: 'मला माहीत आहे',
    HELP_ME_DECIDE: 'झटपट प्रश्न: तुम्ही प्रॉडक्ट, अंतर्गत वर्कफ्लो, की सार्वजनिक प्रेक्षकांसाठी कंटेंट बनवत आहात?',
    HELP_CTA_PRODUCT: 'प्रॉडक्ट',
    HELP_CTA_WORKFLOW: 'वर्कफ्लो',
    HELP_CTA_PUBLIC: 'सार्वजनिक',
    STEP_COMPLETED: 'छान. आतापर्यंत सर्वकाही सुसंगत आहे.',
    PUBLISH_READY: 'सिस्टम तयार आहे. काहीही बाकी नाही.',
    PUBLISH_CTA: 'प्रकाशित करा',
  },

  // ── Gujarati (India West) ─────────────────────────────────────────────
  gu: {
    PAGE_LOAD_WELCOME: 'સ્વાગત છે. તમે શું બનાવવા માંગો છો તે કહો — હું વાર્તા ઘડવામાં મદદ કરીશ.',
    PAGE_LOAD_CTA_START: 'એક વિચારથી શરૂ કરો',
    PAGE_LOAD_CTA_EXPLORE: 'ઉદાહરણો જુઓ',
    HOVER_CATEGORY: 'સરસ પસંદગી. આ શ્રેણી ઝડપી પરિણામો અને સ્કેલેબલ કન્ટેન્ટ માટે યોગ્ય છે.',
    SELECT_CATEGORY: 'હું વર્કફ્લોને એવી રીતે ગોઠવીશ કે પછીથી સરળતાથી સ્કેલ થાય.',
    IDLE_TIMEOUT: 'નિર્ણય લેવામાં મદદ જોઈએ છે, કે તમે જાણો છો શું બનાવવું છે?',
    IDLE_CTA_HELP: 'મને મદદ કરો',
    IDLE_CTA_GOT_IT: 'મને ખબર છે',
    HELP_ME_DECIDE: 'ઝડપી પ્રશ્ન: તમે પ્રોડક્ટ, આંતરિક વર્કફ્લો કે જાહેર દર્શકો માટે કન્ટેન્ટ બનાવી રહ્યા છો?',
    HELP_CTA_PRODUCT: 'પ્રોડક્ટ',
    HELP_CTA_WORKFLOW: 'વર્કફ્લો',
    HELP_CTA_PUBLIC: 'જાહેર',
    STEP_COMPLETED: 'સરસ. અત્યાર સુધી બધું સુસંગત છે.',
    PUBLISH_READY: 'સિસ્ટમ તૈયાર છે. કંઈ બાકી નથી.',
    PUBLISH_CTA: 'પ્રકાશિત કરો',
  },

  // ── Kannada (India South) ─────────────────────────────────────────────
  kn: {
    PAGE_LOAD_WELCOME: 'ಸ್ವಾಗತ. ನೀವು ಏನನ್ನು ರಚಿಸಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ಹೇಳಿ — ಕಥೆಯನ್ನು ರೂಪಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    PAGE_LOAD_CTA_START: 'ಒಂದು ಆಲೋಚನೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿ',
    PAGE_LOAD_CTA_EXPLORE: 'ಉದಾಹರಣೆಗಳನ್ನು ನೋಡಿ',
    HOVER_CATEGORY: 'ಉತ್ತಮ ಆಯ್ಕೆ. ಈ ವರ್ಗವು ತ್ವರಿತ ಫಲಿತಾಂಶಗಳು ಮತ್ತು ಸ್ಕೇಲೆಬಲ್ ವಿಷಯಕ್ಕೆ ಸೂಕ್ತ.',
    SELECT_CATEGORY: 'ನಂತರ ಸುಲಭವಾಗಿ ಸ್ಕೇಲ್ ಆಗುವಂತೆ ವರ್ಕ್‌ಫ್ಲೋ ಅನ್ನು ರಚಿಸುತ್ತೇನೆ.',
    IDLE_TIMEOUT: 'ನಿರ್ಧರಿಸಲು ಸಹಾಯ ಬೇಕೇ, ಅಥವಾ ಏನು ರಚಿಸಬೇಕೆಂದು ಗೊತ್ತಿದೆಯೇ?',
    IDLE_CTA_HELP: 'ಸಹಾಯ ಮಾಡಿ',
    IDLE_CTA_GOT_IT: 'ನನಗೆ ಗೊತ್ತು',
    HELP_ME_DECIDE: 'ತ್ವರಿತ ಪ್ರಶ್ನೆ: ನೀವು ಉತ್ಪನ್ನ, ಆಂತರಿಕ ವರ್ಕ್‌ಫ್ಲೋ ಅಥವಾ ಸಾರ್ವಜನಿಕ ಪ್ರೇಕ್ಷಕರಿಗಾಗಿ ವಿಷಯ ರಚಿಸುತ್ತಿದ್ದೀರಾ?',
    HELP_CTA_PRODUCT: 'ಉತ್ಪನ್ನ',
    HELP_CTA_WORKFLOW: 'ವರ್ಕ್‌ಫ್ಲೋ',
    HELP_CTA_PUBLIC: 'ಸಾರ್ವಜನಿಕ',
    STEP_COMPLETED: 'ಚೆನ್ನಾಗಿದೆ. ಇಲ್ಲಿಯವರೆಗೆ ಎಲ್ಲಾ ಸ್ಥಿರವಾಗಿದೆ.',
    PUBLISH_READY: 'ಸಿಸ್ಟಮ್ ಸಿದ್ಧವಾಗಿದೆ. ಏನೂ ಬಾಕಿ ಇಲ್ಲ.',
    PUBLISH_CTA: 'ಪ್ರಕಟಿಸಿ',
  },

  // ── Malayalam (India South) ───────────────────────────────────────────
  ml: {
    PAGE_LOAD_WELCOME: 'സ്വാഗതം. നിങ്ങൾ എന്ത് സൃഷ്ടിക്കാൻ ആഗ്രഹിക്കുന്നു എന്ന് പറയൂ — കഥ രൂപപ്പെടുത്താൻ സഹായിക്കാം.',
    PAGE_LOAD_CTA_START: 'ഒരു ആശയത്തിൽ നിന്ന് ആരംഭിക്കൂ',
    PAGE_LOAD_CTA_EXPLORE: 'ഉദാഹരണങ്ങൾ കാണുക',
    HOVER_CATEGORY: 'മികച്ച തിരഞ്ഞെടുപ്പ്. ഈ വിഭാഗം വേഗത്തിലുള്ള ഫലങ്ങൾക്കും സ്കെയിലബിൾ ഉള്ളടക്കത്തിനും അനുയോജ്യമാണ്.',
    SELECT_CATEGORY: 'പിന്നീട് എളുപ്പത്തിൽ സ്കെയിൽ ചെയ്യാവുന്ന വിധത്തിൽ വർക്ക്ഫ്ലോ ക്രമീകരിക്കാം.',
    IDLE_TIMEOUT: 'തീരുമാനിക്കാൻ സഹായം വേണോ, അതോ എന്ത് സൃഷ്ടിക്കണമെന്ന് അറിയാമോ?',
    IDLE_CTA_HELP: 'എന്നെ സഹായിക്കൂ',
    IDLE_CTA_GOT_IT: 'എനിക്ക് അറിയാം',
    HELP_ME_DECIDE: 'ദ്രുത ചോദ്യം: നിങ്ങൾ ഉൽപ്പന്നം, ആന്തരിക വർക്ക്ഫ്ലോ, അല്ലെങ്കിൽ പൊതു പ്രേക്ഷകർക്കായി ഉള്ളടക്കം സൃഷ്ടിക്കുകയാണോ?',
    HELP_CTA_PRODUCT: 'ഉൽപ്പന്നം',
    HELP_CTA_WORKFLOW: 'വർക്ക്ഫ്ലോ',
    HELP_CTA_PUBLIC: 'പൊതു',
    STEP_COMPLETED: 'നന്നായി. ഇതുവരെ എല്ലാം സ്ഥിരതയുള്ളതാണ്.',
    PUBLISH_READY: 'സിസ്റ്റം തയ്യാറാണ്. ഒന്നും ബാക്കിയില്ല.',
    PUBLISH_CTA: 'പ്രസിദ്ധീകരിക്കുക',
  },

  // ── Punjabi (India North) ─────────────────────────────────────────────
  pa: {
    PAGE_LOAD_WELCOME: 'ਜੀ ਆਇਆਂ ਨੂੰ। ਦੱਸੋ ਤੁਸੀਂ ਕੀ ਬਣਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ — ਮੈਂ ਕਹਾਣੀ ਘੜਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ।',
    PAGE_LOAD_CTA_START: 'ਇੱਕ ਵਿਚਾਰ ਨਾਲ ਸ਼ੁਰੂ ਕਰੋ',
    PAGE_LOAD_CTA_EXPLORE: 'ਉਦਾਹਰਣਾਂ ਵੇਖੋ',
    HOVER_CATEGORY: 'ਵਧੀਆ ਚੋਣ। ਇਹ ਸ਼੍ਰੇਣੀ ਤੇਜ਼ ਨਤੀਜਿਆਂ ਅਤੇ ਸਕੇਲੇਬਲ ਸਮੱਗਰੀ ਲਈ ਢੁਕਵੀਂ ਹੈ।',
    SELECT_CATEGORY: 'ਮੈਂ ਵਰਕਫ਼ਲੋ ਨੂੰ ਇਸ ਤਰ੍ਹਾਂ ਤਿਆਰ ਕਰਾਂਗਾ ਕਿ ਬਾਅਦ ਵਿੱਚ ਆਸਾਨੀ ਨਾਲ ਸਕੇਲ ਹੋ ਸਕੇ।',
    IDLE_TIMEOUT: 'ਫ਼ੈਸਲਾ ਕਰਨ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ, ਜਾਂ ਤੁਸੀਂ ਜਾਣਦੇ ਹੋ ਕੀ ਬਣਾਉਣਾ ਹੈ?',
    IDLE_CTA_HELP: 'ਮਦਦ ਕਰੋ',
    IDLE_CTA_GOT_IT: 'ਮੈਨੂੰ ਪਤਾ ਹੈ',
    HELP_ME_DECIDE: 'ਛੋਟਾ ਸਵਾਲ: ਤੁਸੀਂ ਪ੍ਰੋਡਕਟ, ਅੰਦਰੂਨੀ ਵਰਕਫ਼ਲੋ, ਜਾਂ ਜਨਤਕ ਦਰਸ਼ਕਾਂ ਲਈ ਸਮੱਗਰੀ ਬਣਾ ਰਹੇ ਹੋ?',
    HELP_CTA_PRODUCT: 'ਪ੍ਰੋਡਕਟ',
    HELP_CTA_WORKFLOW: 'ਵਰਕਫ਼ਲੋ',
    HELP_CTA_PUBLIC: 'ਜਨਤਕ',
    STEP_COMPLETED: 'ਬਹੁਤ ਵਧੀਆ। ਹੁਣ ਤੱਕ ਸਭ ਕੁਝ ਸਹੀ ਹੈ।',
    PUBLISH_READY: 'ਸਿਸਟਮ ਤਿਆਰ ਹੈ। ਕੁਝ ਵੀ ਬਾਕੀ ਨਹੀਂ।',
    PUBLISH_CTA: 'ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ',
  },

  // ── Hebrew (MENA Israel) ──────────────────────────────────────────────
  he: {
    PAGE_LOAD_WELCOME: 'ברוכים הבאים. ספרו לי מה אתם רוצים ליצור — אעזור לעצב את הסיפור.',
    PAGE_LOAD_CTA_START: 'התחילו עם רעיון',
    PAGE_LOAD_CTA_EXPLORE: 'חקרו דוגמאות',
    HOVER_CATEGORY: 'בחירה מצוינת. הקטגוריה הזו מתאימה לתוצאות מהירות ותוכן סקיילבילי.',
    SELECT_CATEGORY: 'אסדר את תהליך העבודה כך שיתרחב בקלות בהמשך.',
    IDLE_TIMEOUT: 'צריכים עזרה בהחלטה, או שכבר יודעים מה ליצור?',
    IDLE_CTA_HELP: 'עזרו לי להחליט',
    IDLE_CTA_GOT_IT: 'אני יודע',
    HELP_ME_DECIDE: 'שאלה מהירה: אתם יוצרים תוכן למוצר, תהליך פנימי, או קהל ציבורי?',
    HELP_CTA_PRODUCT: 'מוצר',
    HELP_CTA_WORKFLOW: 'תהליך',
    HELP_CTA_PUBLIC: 'ציבורי',
    STEP_COMPLETED: 'מצוין. הכל עקבי עד כה.',
    PUBLISH_READY: 'המערכת מוכנה. שום דבר לא תלוי.',
    PUBLISH_CTA: 'פרסום',
  },

  // ── Malay/Filipino (SEA) ──────────────────────────────────────────────
  ms: {
    PAGE_LOAD_WELCOME: 'Selamat datang. Beritahu saya apa yang anda mahu cipta — saya akan bantu membentuk cerita.',
    PAGE_LOAD_CTA_START: 'Mula dengan idea',
    PAGE_LOAD_CTA_EXPLORE: 'Terokai contoh',
    HOVER_CATEGORY: 'Pilihan bagus. Kategori ini sesuai untuk hasil cepat dan kandungan berskala.',
    SELECT_CATEGORY: 'Saya akan menyusun aliran kerja supaya boleh berkembang kemudian.',
    IDLE_TIMEOUT: 'Perlukan bantuan untuk memutuskan, atau sudah tahu apa yang mahu dicipta?',
    IDLE_CTA_HELP: 'Bantu saya',
    IDLE_CTA_GOT_IT: 'Saya tahu',
    HELP_ME_DECIDE: 'Soalan cepat: adakah anda mencipta kandungan untuk produk, aliran kerja dalaman, atau audiens awam?',
    HELP_CTA_PRODUCT: 'Produk',
    HELP_CTA_WORKFLOW: 'Aliran kerja',
    HELP_CTA_PUBLIC: 'Awam',
    STEP_COMPLETED: 'Bagus. Semuanya konsisten setakat ini.',
    PUBLISH_READY: 'Sistem sedia. Tiada yang tertunda.',
    PUBLISH_CTA: 'Terbit',
  },

  // ── Romanian ──────────────────────────────────────────────────────────
  ro: {
    PAGE_LOAD_WELCOME: 'Bine ați venit. Spuneți-mi ce doriți să creați — vă voi ajuta să conturați povestea.',
    PAGE_LOAD_CTA_START: 'Începeți cu o idee',
    PAGE_LOAD_CTA_EXPLORE: 'Explorați exemple',
    HOVER_CATEGORY: 'Alegere excelentă. Această categorie funcționează bine pentru rezultate rapide și conținut scalabil.',
    SELECT_CATEGORY: 'Voi structura fluxul de lucru pentru a se scala ușor ulterior.',
    IDLE_TIMEOUT: 'Aveți nevoie de ajutor să decideți, sau știți deja ce doriți să creați?',
    IDLE_CTA_HELP: 'Ajută-mă să decid',
    IDLE_CTA_GOT_IT: 'Știu deja',
    HELP_ME_DECIDE: 'Întrebare rapidă: creați conținut pentru un produs, un flux intern sau un public?',
    HELP_CTA_PRODUCT: 'Produs',
    HELP_CTA_WORKFLOW: 'Flux de lucru',
    HELP_CTA_PUBLIC: 'Public',
    STEP_COMPLETED: 'Bine. Totul este consistent până acum.',
    PUBLISH_READY: 'Sistemul este gata. Nimic în așteptare.',
    PUBLISH_CTA: 'Publică',
  },

  // ── Swedish ───────────────────────────────────────────────────────────
  sv: {
    PAGE_LOAD_WELCOME: 'Välkommen. Berätta vad du vill skapa — jag hjälper dig forma berättelsen.',
    PAGE_LOAD_CTA_START: 'Börja med en idé',
    PAGE_LOAD_CTA_EXPLORE: 'Utforska exempel',
    HOVER_CATEGORY: 'Bra val. Denna kategori fungerar bra för snabba resultat och skalbart innehåll.',
    SELECT_CATEGORY: 'Jag strukturerar arbetsflödet så att det skalas smidigt senare.',
    IDLE_TIMEOUT: 'Behöver du hjälp att bestämma, eller vet du redan vad du vill skapa?',
    IDLE_CTA_HELP: 'Hjälp mig',
    IDLE_CTA_GOT_IT: 'Jag vet',
    HELP_ME_DECIDE: 'Snabb fråga: skapar du innehåll för en produkt, internt arbetsflöde eller publik?',
    HELP_CTA_PRODUCT: 'Produkt',
    HELP_CTA_WORKFLOW: 'Arbetsflöde',
    HELP_CTA_PUBLIC: 'Publik',
    STEP_COMPLETED: 'Bra. Allt är konsekvent hittills.',
    PUBLISH_READY: 'Systemet är redo. Inget kvarstår.',
    PUBLISH_CTA: 'Publicera',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REGION CODE → LANGUAGE MAPPING (82+ codes → language inheritance)
// ═══════════════════════════════════════════════════════════════════════════
// Sub-region inherits from parent language. Parent inherits from zone default.
// Chain: Region code → REGION_LANG_MAP → MESSAGES[lang] → MESSAGES['en']

const REGION_LANG_MAP: Record<string, string> = {
  // ── NAM ──
  NAM_US: 'en', NAM_CA: 'en',
  // ── EU ──
  EU_WEST: 'en', EU_DE: 'de', EU_AT: 'de', EU_CH: 'de', EU_DACH: 'de',
  EU_FR: 'fr', EU_BE_FR: 'fr', EU_FRANCE: 'fr',
  EU_NL: 'nl', EU_BE_NL: 'nl', EU_BENELUX: 'nl',
  EU_ES: 'es', EU_PT: 'pt', EU_IBERIA: 'es',
  EU_ITALY: 'it',
  EU_SE: 'sv', EU_NO: 'sv', EU_DK: 'sv', EU_FI: 'sv', EU_NORDIC: 'sv',
  EU_PL: 'pl', EU_CZ: 'pl', EU_RO: 'ro', EU_HU: 'pl', EU_GR: 'en', EU_BG: 'en', EU_SK: 'pl', EU_EAST: 'pl',
  // ── Eastern Europe & Caucasus ──
  EU_UKRAINE: 'uk', EU_BALKANS: 'en', EU_CAUCASUS: 'en',
  // ── Turkey ──
  TURKEY: 'tr',
  // ── MENA ──
  MENA_GULF: 'ar', MENA_EGYPT: 'ar', MENA_LEVANT: 'ar', MENA_MAGHREB: 'ar', MENA_MSA: 'ar', MENA_ISRAEL: 'he',
  // ── Africa ──
  AFRICA_WEST: 'en', AFRICA_EAST: 'sw', AFRICA_SOUTH: 'en', AFRICA_FRANCO: 'fr',
  // ── India ──
  INDIA_NORTH: 'hi', INDIA_NORTH_HI: 'hi', INDIA_NORTH_UR: 'ur', INDIA_NORTH_PA: 'pa',
  INDIA_SOUTH: 'ta', INDIA_SOUTH_TA: 'ta', INDIA_SOUTH_TE: 'te', INDIA_SOUTH_KN: 'kn', INDIA_SOUTH_ML: 'ml',
  INDIA_WEST: 'mr', INDIA_WEST_MR: 'mr', INDIA_WEST_GU: 'gu',
  INDIA_EAST: 'bn', INDIA_EAST_BN: 'bn', INDIA_EAST_OR: 'hi',
  INDIA_PAN: 'en', INDIA_PAN_EN: 'en',
  // ── Pakistan & Bangladesh ──
  PAKISTAN: 'ur', BANGLADESH: 'bn',
  // ── South Asia ──
  SA_NEPAL: 'hi', SA_SRILANKA: 'ta', SA_BHUTAN: 'en', SA_MALDIVES: 'en',
  // ── SEA ──
  SEA_MALAY: 'ms', SEA_THAI: 'th', SEA_VIET: 'vi', SEA_PHIL: 'en', SEA_PAN: 'en',
  // ── CJK ──
  CJK_CN: 'zh', CJK_TW: 'zh', CJK_JP: 'ja', CJK_KR: 'ko',
  // ── LATAM ──
  LATAM_BRAZIL: 'pt', LATAM_MEXICO: 'es', LATAM_ANDEAN: 'es', LATAM_CONESUR: 'es', LATAM_CARIB: 'es',
  // ── Caribbean ──
  CARIBBEAN_EN: 'en', CARIBBEAN_FR: 'fr',
  // ── Oceania ──
  OCEANIA_AU: 'en', OCEANIA_NZ: 'en',
  // ── Central Asia ──
  ASIA_CENTRAL_KZ: 'en', ASIA_CENTRAL_UZ: 'en', ASIA_CENTRAL_AZ: 'tr',
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONE → DEFAULT LANGUAGE
// ═══════════════════════════════════════════════════════════════════════════

const ZONE_DEFAULT_LANGUAGE: Record<RegionalZone, string> = {
  western: 'en',
  cjk: 'zh',
  mena: 'ar',
  india: 'hi',
  africa: 'sw',
  oceania: 'en',
  turkey: 'tr',
  caribbean: 'en',
  eastern_europe: 'uk',
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
  regionCode?: string;  // e.g., 'INDIA_SOUTH_TA', 'MENA_GULF'
}

/**
 * Resolve regional context from available signals.
 * Priority: manual → browser lang → IP country → default
 */
export function resolveGuideRegion(
  browserLang?: string,
  countryCode?: string,
  manualLang?: string,
  regionCode?: string,
): RegionalGuideContext {
  // 1. If regionCode provided, use REGION_LANG_MAP directly
  if (regionCode) {
    const lang = REGION_LANG_MAP[regionCode] || REGION_LANG_MAP[regionCode.toUpperCase()] || 'en';
    const zone = getZoneFromLanguage(lang);
    return {
      zone,
      languageCode: toLangBCP47(lang),
      shortLang: lang,
      isRTL: ['ar', 'he', 'fa', 'ur'].includes(lang),
      regionCode,
    };
  }

  // 2. Manual override
  if (manualLang) {
    const short = manualLang.split('-')[0].toLowerCase();
    const zone = getZoneFromLanguage(short);
    return { zone, languageCode: toLangBCP47(short), shortLang: short, isRTL: ['ar', 'he', 'fa', 'ur'].includes(short) };
  }

  // 3. Browser language
  if (browserLang) {
    const short = browserLang.split('-')[0].toLowerCase();
    const zone = getZoneFromLanguage(short);
    return { zone, languageCode: toLangBCP47(short), shortLang: short, isRTL: ['ar', 'he', 'fa', 'ur'].includes(short) };
  }

  // 4. IP-based country code
  if (countryCode) {
    const zone = getZoneFromCountry(countryCode);
    const lang = ZONE_DEFAULT_LANGUAGE[zone];
    return { zone, languageCode: toLangBCP47(lang), shortLang: lang, isRTL: ['ar', 'he', 'fa', 'ur'].includes(lang) };
  }

  return { zone: 'western', languageCode: 'en-US', shortLang: 'en', isRTL: false };
}

/**
 * Get a localized guide message.
 * Inheritance: regionCode → REGION_LANG_MAP → exact lang → zone default → English
 */
export function getGuideMessage(key: GuideMessageKey, shortLang: string, regionCode?: string): string {
  // 1. If regionCode, resolve language from map
  if (regionCode) {
    const mappedLang = REGION_LANG_MAP[regionCode] || REGION_LANG_MAP[regionCode.toUpperCase()];
    if (mappedLang && MESSAGES[mappedLang]?.[key]) return MESSAGES[mappedLang][key];
  }

  // 2. Exact language match
  if (MESSAGES[shortLang]?.[key]) return MESSAGES[shortLang][key];

  // 3. English fallback
  return MESSAGES.en[key] || key;
}

/**
 * Get language code for a region code (e.g., 'INDIA_SOUTH_TA' → 'ta')
 */
export function getRegionLanguage(regionCode: string): string {
  return REGION_LANG_MAP[regionCode] || REGION_LANG_MAP[regionCode.toUpperCase()] || 'en';
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

/**
 * Get all mapped region codes
 */
export function getMappedRegionCodes(): string[] {
  return Object.keys(REGION_LANG_MAP);
}
