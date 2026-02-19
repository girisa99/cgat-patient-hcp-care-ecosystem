/**
 * Informal Economy Business Profiles
 *
 * Pre-built personas and templates for micro/nano businesses across the world.
 * These are the businesses that have ZERO marketing tools today.
 * A food cart in Lagos, a chai stall in Mumbai, a taco stand in Oaxaca,
 * a satay seller in Jakarta — they all deserve world-class marketing intelligence.
 *
 * For Fortune 500, GenieSuite is a choice. For these businesses, we're THE tool.
 */

import type { InformalEconomyType, AudiencePersona, STORMFramework, BusinessTier } from './brandIntelligenceEngine';

// ─── Regional Business Archetypes ────────────────────────────────────────────
// Real businesses that exist on every street in developing economies.

export interface InformalBusinessArchetype {
  id: string;
  type: InformalEconomyType;
  tier: BusinessTier;
  name: string;                      // Generic name
  localNames: Record<string, string>; // What they're called locally
  description: string;
  regions: string[];                  // Where this archetype is common
  typicalProducts: string[];
  typicalRevenue: { min: number; max: number; currency: string; period: 'day' | 'month' };
  customerBase: string;
  marketingReality: string;           // How they actually market today
  biggestChallenge: string;
  contentNeeds: string[];             // What they'd actually use
  stormTemplate: STORMFramework;      // Pre-filled STORM framework
  samplePrompts: Record<string, string>; // Language → sample prompt in their language
}

// ─── Street Food Archetypes ──────────────────────────────────────────────────

export const STREET_FOOD_ARCHETYPES: InformalBusinessArchetype[] = [
  {
    id: 'sf-india-chaat',
    type: 'street_food',
    tier: 'nano',
    name: 'Indian Chaat & Snacks Cart',
    localNames: {
      hi: 'चाट ठेला', ta: 'சாட் கடை', te: 'చాట్ బండి', bn: 'চাট গাড়ি',
      mr: 'चाट गाडी', gu: 'ચાટ લારી', kn: 'ಚಾಟ್ ಗಾಡಿ', ml: 'ചാട്ട് കട',
    },
    description: 'Roadside cart selling chaat, samosas, gol gappas, and regional snacks',
    regions: ['INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_WEST', 'INDIA_EAST', 'INDIA_PAN'],
    typicalProducts: ['Pani Puri / Gol Gappa', 'Samosa', 'Bhel Puri', 'Aloo Tikki', 'Dahi Vada', 'Papdi Chaat'],
    typicalRevenue: { min: 500, max: 3000, currency: 'INR', period: 'day' },
    customerBase: 'Walk-by office workers, students, families, evening snackers',
    marketingReality: 'Zero marketing budget. Relies on foot traffic, word of mouth, and a good location.',
    biggestChallenge: 'Competition from other carts, weather, inconsistent foot traffic, no online presence',
    contentNeeds: ['WhatsApp status updates', 'Menu poster', 'Google Maps listing photo', 'Festival special announcements'],
    stormTemplate: {
      story: {
        whoAreYou: 'I make the best chaat in the neighborhood — fresh ingredients, family recipes',
        whyDoYouDoThis: 'Because great street food brings people together and makes their day better',
        whatMakesYouSpecial: 'Everything is made fresh right in front of you — no shortcuts',
      },
      trust: {
        socialProof: ['Serving this locality for 15+ years', '500+ happy customers daily'],
        guarantees: ['Fresh oil every day', 'Clean hands, clean cart'],
        credentials: ['FSSAI license displayed', 'Uses filtered water'],
      },
      offer: {
        whatYouSell: 'Fresh chaat, samosas, and snacks — made while you watch',
        whyNow: 'Evening special: 2 plates for the price of 1.5',
        pricingMessage: 'Best taste at honest prices — starts at ₹10',
      },
      reach: {
        whereCustomersAre: ['Outside office buildings at lunch and evening', 'Near schools at 3 PM', 'WhatsApp groups'],
        howToFind: 'Look for the yellow cart at [Location] junction — you\'ll smell us before you see us!',
        bestTimeToReach: '11 AM - 1 PM and 5 PM - 9 PM',
      },
      momentum: {
        repeatStrategy: 'Loyalty card — 10th plate free',
        referralStrategy: 'Bring a friend on their first visit, both get extra chutney free',
        growthGoal: 'Start accepting UPI payments, add evening delivery on Swiggy/Zomato',
      },
    },
    samplePrompts: {
      hi: 'मेरे चाट ठेले के लिए एक WhatsApp स्टेटस बनाओ — आज शाम स्पेशल पानी पूरी ₹20 में',
      ta: 'என் சாட் கடைக்கு ஒரு WhatsApp நிலை உருவாக்குங்கள் — இன்று மாலை சிறப்பு பானி பூரி ₹20',
      en: 'Create a WhatsApp status for my chaat cart — evening special pani puri at ₹20',
      te: 'నా చాట్ బండికి WhatsApp స్టేటస్ తయారు చేయండి — ఈ రోజు సాయంత్రం స్పెషల్ పానీ పూరి ₹20',
    },
  },

  {
    id: 'sf-india-chai',
    type: 'street_food',
    tier: 'nano',
    name: 'Indian Tea Stall',
    localNames: {
      hi: 'चाय की दुकान', ta: 'டீ கடை', te: 'చాయ్ అంగడి', bn: 'চায়ের দোকান',
      mr: 'चहाचे दुकान', ml: 'ചായക്കട',
    },
    description: 'The most ubiquitous business in India — roadside tea stall with biscuits/snacks',
    regions: ['INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_WEST', 'INDIA_EAST', 'INDIA_PAN'],
    typicalProducts: ['Chai', 'Cutting Chai', 'Special Masala Chai', 'Bun Maska', 'Biscuits', 'Bread Omelette'],
    typicalRevenue: { min: 300, max: 2000, currency: 'INR', period: 'day' },
    customerBase: 'Everyone — auto drivers, office workers, students, morning walkers',
    marketingReality: 'No marketing. Location IS the marketing. Regular customers come daily.',
    biggestChallenge: 'Rising milk/sugar prices, competition, weather dependency',
    contentNeeds: ['Morning special photo for WhatsApp', 'Festive greetings with shop name', 'Google Maps photo'],
    stormTemplate: {
      story: {
        whoAreYou: 'I brew the best chai on this road — strong, sweet, made with love',
        whyDoYouDoThis: 'A good cup of chai can turn anyone\'s bad day around',
        whatMakesYouSpecial: 'Special masala blend — my grandmother\'s recipe. No one else has this taste.',
      },
      trust: {
        socialProof: ['Open since 5:30 AM, 365 days a year', 'Ask anyone on this street'],
        guarantees: ['If you don\'t like the first sip, next cup is free'],
        credentials: ['Fresh milk daily from local dairy'],
      },
      offer: {
        whatYouSell: 'The best chai you\'ll have today — cutting chai ₹10, special masala ₹15',
        whyNow: 'Monsoon special — extra ginger, extra adrak',
        pricingMessage: 'Cheapest therapy in the city',
      },
      reach: {
        whereCustomersAre: ['Morning crowd: auto/taxi stands', 'Afternoon: office area', 'Evening: residential'],
        howToFind: 'Corner of MG Road and Station Road — look for the blue stall',
        bestTimeToReach: '5:30 AM - 9 PM, busiest 7-9 AM and 4-6 PM',
      },
      momentum: {
        repeatStrategy: 'Remember regulars\' preferences — "the usual?"',
        referralStrategy: 'Free biscuit when you bring a new colleague',
        growthGoal: 'Add evening snacks (samosa, vada pav) to increase ticket size',
      },
    },
    samplePrompts: {
      hi: 'मेरी चाय की दुकान के लिए एक सुंदर पोस्टर बनाओ — "राम की चाय" — बेस्ट मसाला चाय',
      en: 'Make a poster for my tea stall "Ram\'s Chai" — best masala chai in the area',
    },
  },

  {
    id: 'sf-nigeria-suya',
    type: 'street_food',
    tier: 'nano',
    name: 'Nigerian Suya Spot',
    localNames: {
      yo: 'Ilé Suya', ha: 'Wurin Suya', ig: 'Ebe Suya', en: 'Suya Spot',
    },
    description: 'Roadside suya (spiced grilled meat) seller — evening/night business',
    regions: ['AFRICA_WEST'],
    typicalProducts: ['Beef Suya', 'Chicken Suya', 'Ram Suya', 'Kidney Suya', 'Suya with bread'],
    typicalRevenue: { min: 5000, max: 30000, currency: 'NGN', period: 'day' },
    customerBase: 'After-work crowd, night owls, bar-goers, families picking up takeaway',
    marketingReality: 'Smoke from the grill IS the marketing. Location near bars/joints.',
    biggestChallenge: 'Meat prices, charcoal costs, competition, health inspections',
    contentNeeds: ['Instagram/WhatsApp photo of fresh suya', 'Price list poster', 'Location announcement'],
    stormTemplate: {
      story: {
        whoAreYou: 'I am Mallam [Name], the suya king of this area',
        whyDoYouDoThis: 'My father taught me, his father taught him — this is our family art',
        whatMakesYouSpecial: 'Our special yaji spice mix — nobody else has this blend',
      },
      trust: {
        socialProof: ['This spot has been here for 20 years', 'Ask any taxi driver where the best suya is'],
        guarantees: ['Watch me grill it fresh — no old meat, no recycled suya'],
        credentials: ['NAFDAC aware', 'Clean grill, clean hands'],
      },
      offer: {
        whatYouSell: 'The best suya in [Area] — beef, chicken, kidney, ram',
        whyNow: 'Weekend special: extra meat, same price',
        pricingMessage: '₦500 will change your evening',
      },
      reach: {
        whereCustomersAre: ['Near bars and lounges', 'Residential estates at night', 'WhatsApp status updates'],
        howToFind: 'Look for the smoke and the crowd at [Location] junction',
        bestTimeToReach: '6 PM - 2 AM',
      },
      momentum: {
        repeatStrategy: 'Regulars get priority — no queue, just call ahead on WhatsApp',
        referralStrategy: 'Tag us on Instagram, get free extra wrap',
        growthGoal: 'Start delivery via dispatch rider within 3km radius',
      },
    },
    samplePrompts: {
      en: 'Create a WhatsApp status for my suya spot — fresh beef suya ready now at Ikeja junction',
      yo: 'Ṣe WhatsApp status fún ilé suya mi — suya ẹran tuntun ti ṣetán ní Ikeja junction',
      ha: 'Yi WhatsApp status don wurin suya na — sabon suya a shirye a Ikeja junction',
    },
  },

  {
    id: 'sf-mexico-taco',
    type: 'street_food',
    tier: 'nano',
    name: 'Mexican Taco Stand',
    localNames: {
      es: 'Puesto de Tacos', 'es-MX': 'Taquería de la esquina',
    },
    description: 'Street taco stand — the backbone of Mexican street food culture',
    regions: ['LATAM_MEXICO'],
    typicalProducts: ['Tacos al Pastor', 'Tacos de Suadero', 'Tacos de Carnitas', 'Quesadillas', 'Aguas Frescas'],
    typicalRevenue: { min: 500, max: 5000, currency: 'MXN', period: 'day' },
    customerBase: 'Everyone — workers, students, families, late-night crowd',
    marketingReality: 'The trompo (rotating spit) is the marketing. Smell and sight.',
    biggestChallenge: 'Meat prices, competition, permits, location fees',
    contentNeeds: ['Instagram reel of trompo spinning', 'Menu card', 'Google Maps listing', 'WhatsApp specials'],
    stormTemplate: {
      story: {
        whoAreYou: 'Somos la taquería de Don [Name] — tacos al pastor como los de antes',
        whyDoYouDoThis: 'Porque los buenos tacos hacen feliz a la gente',
        whatMakesYouSpecial: 'Nuestro adobo es receta familiar de 3 generaciones',
      },
      trust: {
        socialProof: ['30 años en esta esquina', 'Más de 1000 tacos al día'],
        guarantees: ['Carne fresca del día, nunca congelada'],
        credentials: ['Permiso de salud al día'],
      },
      offer: {
        whatYouSell: 'Los mejores tacos al pastor de la colonia',
        whyNow: 'Martes de tacos: 5 tacos por $50',
        pricingMessage: 'Tacos desde $12 — el mejor sabor al mejor precio',
      },
      reach: {
        whereCustomersAre: ['Esquina de [calle]', 'Facebook del barrio', 'WhatsApp'],
        howToFind: 'Busca el trompo girando en la esquina de [dirección]',
        bestTimeToReach: '12 PM - 2 AM',
      },
      momentum: {
        repeatStrategy: 'Tarjeta de lealtad: tu taco #11 es gratis',
        referralStrategy: 'Trae un amigo, los dos se llevan salsa extra gratis',
        growthGoal: 'Abrir segundo puesto en la colonia vecina',
      },
    },
    samplePrompts: {
      es: 'Crea una imagen para mi puesto de tacos — "Tacos Don Beto" — los mejores tacos al pastor',
      en: 'Create a poster for my taco stand "Tacos Don Beto" — best tacos al pastor in the neighborhood',
    },
  },

  {
    id: 'sf-indonesia-warung',
    type: 'street_food',
    tier: 'nano',
    name: 'Indonesian Warung',
    localNames: { id: 'Warung Makan', ms: 'Warung', jv: 'Warung' },
    description: 'Small roadside eatery — the heart of Indonesian daily food culture',
    regions: ['SEA_MALAY'],
    typicalProducts: ['Nasi Goreng', 'Mie Goreng', 'Nasi Padang', 'Soto Ayam', 'Es Teh Manis'],
    typicalRevenue: { min: 200000, max: 2000000, currency: 'IDR', period: 'day' },
    customerBase: 'Workers, ojek drivers, students, neighborhood families',
    marketingReality: 'Banner and foot traffic. Maybe a GrabFood/GoFood listing.',
    biggestChallenge: 'Ingredient costs, competition, GrabFood commissions eating margins',
    contentNeeds: ['GrabFood listing photo', 'WhatsApp daily menu', 'Instagram food photo', 'Promo poster'],
    stormTemplate: {
      story: {
        whoAreYou: 'Warung Makan [Nama] — masakan rumahan dengan cita rasa istimewa',
        whyDoYouDoThis: 'Karena semua orang berhak makan enak dengan harga terjangkau',
        whatMakesYouSpecial: 'Resep turun-temurun dari nenek — bumbu asli, bukan instan',
      },
      trust: {
        socialProof: ['Sudah 10 tahun melayani warga sini', 'Rating 4.8 di GrabFood'],
        guarantees: ['Masak segar setiap hari, tidak pakai MSG berlebihan'],
        credentials: ['Izin usaha lengkap', 'Dapur bersih'],
      },
      offer: {
        whatYouSell: 'Nasi goreng spesial, mie goreng, aneka lauk — dari Rp 10.000',
        whyNow: 'Promo hari ini: beli 2 nasi goreng, gratis es teh',
        pricingMessage: 'Enak, kenyang, hemat — mulai Rp 10.000',
      },
      reach: {
        whereCustomersAre: ['Depan gang [alamat]', 'GrabFood & GoFood', 'WhatsApp grup RT'],
        howToFind: 'Cari spanduk merah di depan gang [alamat]',
        bestTimeToReach: '10 AM - 9 PM',
      },
      momentum: {
        repeatStrategy: 'Menu harian berbeda setiap hari — pelanggan selalu penasaran',
        referralStrategy: 'Ajak teman, dapat tambahan lauk gratis',
        growthGoal: 'Daftar di GrabFood untuk jangkau pelanggan lebih jauh',
      },
    },
    samplePrompts: {
      id: 'Buatkan poster untuk warung saya "Warung Bu Sari" — nasi goreng spesial Rp 15.000',
      en: 'Create a poster for my warung "Warung Bu Sari" — special fried rice Rp 15.000',
    },
  },

  {
    id: 'sf-thailand-cart',
    type: 'street_food',
    tier: 'nano',
    name: 'Thai Street Food Cart',
    localNames: { th: 'รถเข็นขายอาหาร' },
    description: 'Mobile cart selling pad thai, som tam, grilled meats, or desserts',
    regions: ['SEA_THAI'],
    typicalProducts: ['Pad Thai', 'Som Tam', 'Moo Ping', 'Khao Pad', 'Mango Sticky Rice'],
    typicalRevenue: { min: 1000, max: 5000, currency: 'THB', period: 'day' },
    customerBase: 'Lunch workers, tourists, market shoppers',
    marketingReality: 'Location at markets or office areas. Maybe a Facebook page.',
    biggestChallenge: 'Location permits, ingredient costs, inconsistent tourist traffic',
    contentNeeds: ['Facebook post with food photo', 'LINE message for regulars', 'Menu board design'],
    stormTemplate: {
      story: {
        whoAreYou: 'ร้านผัดไทย [ชื่อ] — สูตรเด็ดจากย่านเยาวราช',
        whyDoYouDoThis: 'อาหารอร่อยทำให้คนมีความสุข',
        whatMakesYouSpecial: 'สูตรน้ำปรุงลับ ไม่มีใครเหมือน',
      },
      trust: {
        socialProof: ['ขายมา 15 ปีแล้ว', 'ลูกค้าประจำมาทุกวัน'],
        guarantees: ['ผัดสดๆ ต่อหน้า ไม่ใช้ของค้างคืน'],
        credentials: ['ใบอนุญาตขายอาหาร อย.'],
      },
      offer: {
        whatYouSell: 'ผัดไทยสูตรเด็ด จานละ 40-60 บาท',
        whyNow: 'วันนี้พิเศษ — ผัดไทยกุ้งสด 50 บาท',
        pricingMessage: 'อร่อย อิ่ม ไม่แพง',
      },
      reach: {
        whereCustomersAre: ['หน้าตลาด', 'ใกล้ออฟฟิศ', 'Facebook กลุ่มคนรักอาหาร'],
        howToFind: 'หาร้านรถเข็นสีเหลืองหน้าตลาด [ชื่อ]',
        bestTimeToReach: '11:00 - 14:00 และ 17:00 - 21:00',
      },
      momentum: {
        repeatStrategy: 'เพิ่มเมนูใหม่ทุกสัปดาห์',
        referralStrategy: 'พาเพื่อนมา 3 คน ได้ส้มตำฟรี',
        growthGoal: 'เปิด Grab/LINE MAN เพิ่มช่องทางขาย',
      },
    },
    samplePrompts: {
      th: 'ทำโปสเตอร์ร้านผัดไทยของฉัน "ผัดไทยป้าแดง" ผัดไทยกุ้งสด 50 บาท',
      en: 'Make a poster for my pad thai cart "Auntie Daeng Pad Thai" — fresh shrimp pad thai 50 baht',
    },
  },

  {
    id: 'sf-egypt-koshary',
    type: 'street_food',
    tier: 'nano',
    name: 'Egyptian Koshary Cart',
    localNames: { ar: 'عربة كشري', 'ar-EG': 'عربية كشري' },
    description: 'Cart or small shop selling Egypt\'s national street food — koshary',
    regions: ['MENA_EGYPT'],
    typicalProducts: ['Koshary', 'Koshary with extra sauce', 'Hawawshi', 'Foul', 'Tamiya'],
    typicalRevenue: { min: 200, max: 1500, currency: 'EGP', period: 'day' },
    customerBase: 'Workers, students, everyone — koshary is Egypt\'s democratic food',
    marketingReality: 'Location and reputation. Maybe a WhatsApp group for the neighborhood.',
    biggestChallenge: 'Ingredient costs (rice, lentils, pasta), competition, inflation',
    contentNeeds: ['WhatsApp status', 'Price list', 'Festive greeting with shop name'],
    stormTemplate: {
      story: {
        whoAreYou: 'كشري [الاسم] — أحسن كشري في الحتة دي',
        whyDoYouDoThis: 'عشان الكشري أكلة كل الناس — الغني والفقير',
        whatMakesYouSpecial: 'الدقة بتاعتنا (الصلصة) سر من أيام جدي',
      },
      trust: {
        socialProof: ['من 20 سنة في نفس المكان', 'اسأل أي حد في الشارع'],
        guarantees: ['كشري طازة كل يوم — مفيش بايت'],
        credentials: ['ترخيص صحي'],
      },
      offer: {
        whatYouSell: 'كشري — صغير ٢٠ جنيه، وسط ٣٠، كبير ٤٠',
        whyNow: 'عرض الجمعة — كشري كبير بسعر الوسط',
        pricingMessage: 'أحسن طعم بأقل سعر',
      },
      reach: {
        whereCustomersAre: ['شارع [العنوان]', 'واتساب الحارة', 'فيسبوك المنطقة'],
        howToFind: 'دور على العربية الخضرا قدام مسجد [الاسم]',
        bestTimeToReach: '12 ظهر — 11 بالليل',
      },
      momentum: {
        repeatStrategy: 'كل عاشر طلب — كشري مجاني',
        referralStrategy: 'جيب صاحبك — الاتنين ياخدوا صلصة زيادة',
        growthGoal: 'نفتح محل صغير بدل العربية',
      },
    },
    samplePrompts: {
      ar: 'اعملي بوست واتساب لعربية الكشري بتاعتي — "كشري أبو علي" — كشري طازة كل يوم',
      en: 'Create a WhatsApp post for my koshary cart "Abu Ali Koshary" — fresh koshary daily',
    },
  },

  {
    id: 'sf-kenya-mama',
    type: 'street_food',
    tier: 'nano',
    name: 'Kenyan Mama Mboga / Kibanda',
    localNames: { sw: 'Kibanda cha Mama', en: 'Mama\'s Food Stall' },
    description: 'Informal roadside food stall — the everyday lunch spot for workers',
    regions: ['AFRICA_EAST'],
    typicalProducts: ['Ugali + Sukuma Wiki', 'Nyama Choma', 'Chapati', 'Mandazi', 'Chai'],
    typicalRevenue: { min: 500, max: 5000, currency: 'KES', period: 'day' },
    customerBase: 'Workers, boda boda riders, market vendors, students',
    marketingReality: 'Location and steam from the pot. M-Pesa number on a cardboard sign.',
    biggestChallenge: 'Rising food costs, county permits, competition, weather',
    contentNeeds: ['M-Pesa payment poster', 'Menu board', 'WhatsApp status', 'Google Maps pin'],
    stormTemplate: {
      story: {
        whoAreYou: 'Mama [Jina] — chakula cha nyumbani kwa bei ya mtaani',
        whyDoYouDoThis: 'Kila mtu anastahili chakula kizuri — hata kwa bajeti ndogo',
        whatMakesYouSpecial: 'Mapishi ya mama yangu — ladha ya nyumbani halisi',
      },
      trust: {
        socialProof: ['Miaka 10 hapa — waulize boda boda', 'M-Pesa ipo — ni rahisi kulipa'],
        guarantees: ['Chakula kipya kila siku — hakuna mabaki'],
        credentials: ['County permit up to date'],
      },
      offer: {
        whatYouSell: 'Ugali + sukuma + nyama — KSh 100-250',
        whyNow: 'Leo special: chapati + maharage KSh 80',
        pricingMessage: 'Kula vizuri, lipa kidogo',
      },
      reach: {
        whereCustomersAre: ['Karibu na soko', 'WhatsApp', 'Boda boda riders spread the word'],
        howToFind: 'Tafuta moshi wa kupika karibu na [mahali]',
        bestTimeToReach: '11 AM - 3 PM na 6 PM - 9 PM',
      },
      momentum: {
        repeatStrategy: 'Kumbuka jina la kila mteja — "Karibu tena!"',
        referralStrategy: 'Lete rafiki — wote mnapata chai bure',
        growthGoal: 'Pata listing kwenye Google Maps na Glovo',
      },
    },
    samplePrompts: {
      sw: 'Tengeneza poster ya kibanda changu "Mama Njeri Foods" — ugali na nyama choma KSh 200',
      en: 'Create a poster for my food stall "Mama Njeri Foods" — ugali and nyama choma KSh 200',
    },
  },

  {
    id: 'sf-philippines-karinderya',
    type: 'street_food',
    tier: 'nano',
    name: 'Filipino Karinderya / Carinderia',
    localNames: { tl: 'Karinderya', en: 'Eatery' },
    description: 'Small neighborhood eatery with home-cooked meals in turo-turo (point-point) style',
    regions: ['SEA_PHIL'],
    typicalProducts: ['Adobo', 'Sinigang', 'Fried Chicken', 'Pancit', 'Rice + Ulam combo'],
    typicalRevenue: { min: 500, max: 5000, currency: 'PHP', period: 'day' },
    customerBase: 'Jeepney drivers, construction workers, office staff, students',
    marketingReality: 'Tarpaulin sign, location near workplaces. Maybe Facebook page.',
    biggestChallenge: 'Rice prices, meat costs, competition, keeping food fresh all day',
    contentNeeds: ['Facebook post with daily menu', 'GCash payment poster', 'Promo flyer'],
    stormTemplate: {
      story: {
        whoAreYou: 'Karinderya ni Aling [Pangalan] — lutong bahay na pang-araw-araw',
        whyDoYouDoThis: 'Dahil ang masarap na pagkain ay para sa lahat, hindi lang sa may pera',
        whatMakesYouSpecial: 'Luto ng nanay ko — walang katulad ang lasa',
      },
      trust: {
        socialProof: ['10 taon na sa kanto na ito', 'Tanong mo sa mga driver — alam nila'],
        guarantees: ['Luto araw-araw, walang leftover mula kahapon'],
        credentials: ['May permit sa barangay', 'Malinis na kusina'],
      },
      offer: {
        whatYouSell: 'Rice + ulam combo — ₱45-80. Masarap, busog, sulit.',
        whyNow: 'Biyernes special: lechon kawali ₱65 lang',
        pricingMessage: 'Busog ka na, ₱50 lang!',
      },
      reach: {
        whereCustomersAre: ['Sa kanto ng [address]', 'Facebook ng barangay', 'GCash accepted'],
        howToFind: 'Hanapin ang kulay dilaw na karinderya sa tabi ng [landmark]',
        bestTimeToReach: '10 AM - 2 PM at 5 PM - 8 PM',
      },
      momentum: {
        repeatStrategy: 'Iba-ibang ulam araw-araw — laging may bago',
        referralStrategy: 'Mag-tag sa Facebook, may libreng sabaw',
        growthGoal: 'Mag-partner sa Foodpanda para sa delivery',
      },
    },
    samplePrompts: {
      tl: 'Gumawa ng Facebook post para sa karinderya ko "Aling Rosa\'s Lutong Bahay" — adobo special ₱55',
      en: 'Create a Facebook post for my eatery "Aling Rosa\'s Home Cooking" — adobo special ₱55',
    },
  },

  {
    id: 'sf-brazil-barraca',
    type: 'street_food',
    tier: 'nano',
    name: 'Brazilian Barraca / Food Stand',
    localNames: { pt: 'Barraca de Comida', 'pt-BR': 'Barraquinha' },
    description: 'Street food stand selling acarajé, pastel, açaí, or espetinho',
    regions: ['LATAM_BRAZIL'],
    typicalProducts: ['Pastel', 'Coxinha', 'Acarajé', 'Açaí', 'Espetinho', 'Churrasquinho'],
    typicalRevenue: { min: 50, max: 500, currency: 'BRL', period: 'day' },
    customerBase: 'Beach-goers, market shoppers, workers on lunch break',
    marketingReality: 'Location at feira/market/beach. Instagram maybe.',
    biggestChallenge: 'Ingredient costs, permits, weather dependency, competition',
    contentNeeds: ['Instagram photo with prices', 'WhatsApp status', 'Cardápio (menu) design'],
    stormTemplate: {
      story: {
        whoAreYou: 'Barraquinha do [Nome] — o melhor pastel da feira',
        whyDoYouDoThis: 'Porque comida boa de rua é patrimônio do Brasil',
        whatMakesYouSpecial: 'Massa crocante feita na hora — receita da vó',
      },
      trust: {
        socialProof: ['15 anos na mesma feira', '5 estrelas no Google'],
        guarantees: ['Feito na hora, na sua frente'],
        credentials: ['Alvará sanitário em dia'],
      },
      offer: {
        whatYouSell: 'Pastel de todos os sabores — R$8 a R$15',
        whyNow: 'Combo sexta-feira: pastel + caldo de cana R$12',
        pricingMessage: 'O melhor pastel pelo melhor preço',
      },
      reach: {
        whereCustomersAre: ['Feira de [bairro]', 'Instagram', 'WhatsApp da vizinhança'],
        howToFind: 'Procura a barraca amarela na feira de [bairro] — sexta e sábado',
        bestTimeToReach: '8h - 14h (feira) e 17h - 22h (noite)',
      },
      momentum: {
        repeatStrategy: 'Sabor novo toda semana — cliente sempre volta pra provar',
        referralStrategy: 'Traga um amigo — os dois ganham caldo de cana grátis',
        growthGoal: 'Abrir uma segunda barraca na feira do outro bairro',
      },
    },
    samplePrompts: {
      pt: 'Cria um post pro Instagram da minha barraca "Pastel do Zé" — pastel de carne R$10',
      en: 'Create an Instagram post for my food stand "Pastel do Zé" — meat pastel R$10',
    },
  },
];

// ─── Service Business Archetypes ─────────────────────────────────────────────

export const SERVICE_BUSINESS_ARCHETYPES: InformalBusinessArchetype[] = [
  {
    id: 'sv-india-tailor',
    type: 'personal_service',
    tier: 'micro',
    name: 'Indian Tailor / Darzi',
    localNames: { hi: 'दर्ज़ी', ta: 'தையல்காரர்', te: 'దర్జీ', ur: 'درزی', bn: 'দর্জি' },
    description: 'Neighborhood tailor — alterations, custom stitching, festival wear',
    regions: ['INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_WEST', 'INDIA_EAST', 'PAKISTAN', 'BANGLADESH'],
    typicalProducts: ['Alterations', 'Custom kurta/salwar', 'Blouse stitching', 'School uniforms', 'Wedding outfits'],
    typicalRevenue: { min: 500, max: 5000, currency: 'INR', period: 'day' },
    customerBase: 'Women (blouses, salwar), men (alterations), families (festival wear)',
    marketingReality: 'Shop signboard and word of mouth. Busiest before festivals.',
    biggestChallenge: 'Seasonal demand (pre-Diwali/Eid rush), ready-made competition, late delivery reputation',
    contentNeeds: ['Festival season poster', 'Before/after photos on WhatsApp', 'Price list', 'Google Maps listing'],
    stormTemplate: {
      story: {
        whoAreYou: 'I am a master tailor — 25 years of craftsmanship in every stitch',
        whyDoYouDoThis: 'Because perfectly fitted clothes make people feel confident and beautiful',
        whatMakesYouSpecial: 'Precision fitting guaranteed — I measure twice, cut once',
      },
      trust: {
        socialProof: ['Serving this locality for 25 years', '3 generations of families trust us'],
        guarantees: ['Perfect fit or free alterations', 'On-time delivery — especially for weddings'],
        credentials: ['Master craftsman trained in Lucknow/Chennai'],
      },
      offer: {
        whatYouSell: 'Custom stitching, alterations, festival wear — all occasions',
        whyNow: 'Diwali/Eid season — book now to avoid the rush',
        pricingMessage: 'Quality stitching at fair prices — better than ready-made',
      },
      reach: {
        whereCustomersAre: ['Shop at [location]', 'WhatsApp for booking', 'Word of mouth'],
        howToFind: '[Shop name] near [landmark]',
        bestTimeToReach: '9 AM - 8 PM, closed Sundays',
      },
      momentum: {
        repeatStrategy: 'Keep measurement records — "Welcome back, I have your measurements ready"',
        referralStrategy: 'Refer a friend — free button/hemming service',
        growthGoal: 'Add online booking via WhatsApp Business — show fabric samples digitally',
      },
    },
    samplePrompts: {
      hi: 'मेरी दर्ज़ी दुकान के लिए दीवाली स्पेशल पोस्टर बनाओ — "शर्मा टेलर्स" — ऑर्डर अभी बुक करें',
      en: 'Create a Diwali special poster for my tailoring shop "Sharma Tailors" — book your orders now',
    },
  },

  {
    id: 'sv-africa-salon',
    type: 'personal_service',
    tier: 'micro',
    name: 'African Hair Salon / Braiding',
    localNames: { sw: 'Saluni ya Nywele', yo: 'Ilé Ìrun', ha: 'Salon', fr: 'Salon de Coiffure' },
    description: 'Hair braiding, weaving, styling salon — a cultural institution',
    regions: ['AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO'],
    typicalProducts: ['Box Braids', 'Cornrows', 'Weave-on', 'Locs', 'Natural Hair Styling', 'Relaxer'],
    typicalRevenue: { min: 2000, max: 20000, currency: 'KES', period: 'day' },
    customerBase: 'Women of all ages, some men, wedding parties',
    marketingReality: 'Instagram/Facebook photos of completed styles. WhatsApp booking.',
    biggestChallenge: 'Product costs (extensions), keeping up with trends, competition, space rent',
    contentNeeds: ['Before/after Instagram posts', 'Price list', 'Style catalog', 'Booking link'],
    stormTemplate: {
      story: {
        whoAreYou: 'I create beautiful hairstyles that celebrate African beauty',
        whyDoYouDoThis: 'Your hair is your crown — I help you wear it proudly',
        whatMakesYouSpecial: 'Gentle hands, latest styles, no hair damage — your hair health is my priority',
      },
      trust: {
        socialProof: ['Check my Instagram for 500+ happy clients', '5-star reviews on Google'],
        guarantees: ['Gentle handling — no breakage', 'Style lasts 4-8 weeks'],
        credentials: ['Trained in Lagos/Nairobi', 'Premium products only'],
      },
      offer: {
        whatYouSell: 'All styles — braids, weaves, locs, natural hair — from KSh 1500',
        whyNow: 'December special — free treatment with any braiding service',
        pricingMessage: 'Quality styling that lasts — worth every shilling',
      },
      reach: {
        whereCustomersAre: ['Instagram for style inspiration', 'WhatsApp for booking', 'Walk-ins welcome'],
        howToFind: '[Salon name] at [location] — look for the pink sign',
        bestTimeToReach: '8 AM - 7 PM, Tues-Sunday',
      },
      momentum: {
        repeatStrategy: 'Send appointment reminders on WhatsApp — "Time for a touch-up?"',
        referralStrategy: 'Refer 3 friends, get free braiding',
        growthGoal: 'Add nail and makeup services — one-stop beauty destination',
      },
    },
    samplePrompts: {
      en: 'Create an Instagram carousel for my salon "Queen\'s Crown Braids" showing 6 braiding styles with prices',
      sw: 'Tengeneza picha za Instagram za saluni yangu "Queen\'s Crown Braids" — onyesha mitindo 6 na bei',
    },
  },
];

// ─── All Archetypes Combined ─────────────────────────────────────────────────

export const ALL_BUSINESS_ARCHETYPES: InformalBusinessArchetype[] = [
  ...STREET_FOOD_ARCHETYPES,
  ...SERVICE_BUSINESS_ARCHETYPES,
];

// ─── Archetype Lookup Functions ──────────────────────────────────────────────

export function findArchetypesByRegion(regionCode: string): InformalBusinessArchetype[] {
  return ALL_BUSINESS_ARCHETYPES.filter(a =>
    a.regions.some(r => regionCode.startsWith(r) || r.startsWith(regionCode))
  );
}

export function findArchetypesByType(type: InformalEconomyType): InformalBusinessArchetype[] {
  return ALL_BUSINESS_ARCHETYPES.filter(a => a.type === type);
}

export function findArchetypeById(id: string): InformalBusinessArchetype | undefined {
  return ALL_BUSINESS_ARCHETYPES.find(a => a.id === id);
}

export function getLocalizedArchetypeName(archetype: InformalBusinessArchetype, languageCode: string): string {
  return archetype.localNames[languageCode] || archetype.name;
}

export function getSamplePrompt(archetype: InformalBusinessArchetype, languageCode: string): string {
  return archetype.samplePrompts[languageCode] || archetype.samplePrompts['en'] || '';
}

// ─── Default Persona Generator ───────────────────────────────────────────────

export function generatePersonaFromArchetype(archetype: InformalBusinessArchetype, ownerName: string): AudiencePersona {
  return {
    id: `persona-${archetype.id}-${ownerName.toLowerCase().replace(/\s/g, '-')}`,
    name: `${ownerName} (${archetype.name})`,
    tier: archetype.tier,
    demographics: {
      ageRange: [25, 55],
      regions: archetype.regions,
      languages: Object.keys(archetype.localNames),
      education: archetype.tier === 'nano' ? 'secondary' : 'vocational',
      techSavviness: archetype.tier === 'nano' ? 2 : 3,
      internetAccess: archetype.tier === 'nano' ? 'mobile_only' : 'limited',
    },
    psychographics: {
      goals: ['Increase daily sales', 'Build loyal customer base', 'Grow the business'],
      painPoints: [archetype.biggestChallenge, 'No marketing budget', 'No time for marketing'],
      motivations: ['Family financial security', 'Pride in craft', 'Community recognition'],
      fears: ['Business slowing down', 'Being replaced by bigger competitors', 'Rising costs'],
      dailyRoutine: archetype.stormTemplate.reach.bestTimeToReach,
    },
    businessContext: {
      industry: 'Food & Beverage',
      businessType: archetype.type,
      monthlyRevenue: `${archetype.typicalRevenue.currency} ${archetype.typicalRevenue.min * 25}-${archetype.typicalRevenue.max * 25}/mo`,
      employeeCount: archetype.tier === 'nano' ? '0-1' : '1-5',
      marketingBudget: 'zero',
      currentTools: ['WhatsApp', 'Word of mouth'],
      biggestChallenge: archetype.biggestChallenge,
    },
    contentPreferences: {
      preferredFormats: archetype.contentNeeds.includes('video') ?
        ['whatsapp', 'image', 'video', 'poster'] : ['whatsapp', 'image', 'poster', 'flyer'],
      attentionSpan: 'short',
      bestReachChannel: 'WhatsApp',
      languagePreference: Object.keys(archetype.localNames)[0] || 'en',
      deviceType: archetype.tier === 'nano' ? 'low_end_smartphone' : 'smartphone',
    },
  };
}
