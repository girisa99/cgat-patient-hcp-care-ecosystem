/**
 * GENIE STUDIO LOCALIZED VIDEO SCRIPTS
 * 
 * Actual transcreated (not translated) voiceovers for all supported languages
 * Each script maintains cultural nuances and local expressions
 */

export interface LocalizedVoiceover {
  chapterId: string;
  language: string;
  script: string;
  ttsProvider: 'elevenlabs' | 'azure' | 'alibaba';
  voiceId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HINDI (हिंदी) - Bollywood-style dramatic flair
// ═══════════════════════════════════════════════════════════════════════════════
export const HINDI_SCRIPTS: Record<string, string> = {
  opening: `*दीपक हिलता है*

"आखिरकार! किसी ने दीपक रगड़ा! मैं सदियों से इंतज़ार कर रहा था... ठीक है, असल में 2024 से, लेकिन कौन गिन रहा है?

*नाटकीय ढंग से खींचता है*

मैं हूं जीनी स्टूडियो का जीनी! और मेरे उस चचेरे भाई से अलग जो सिर्फ तीन इच्छाएं पूरी करता है... मैं देता हूं असीमित रचनात्मक शक्तियां!

*भव्य तरीके से इशारा करता है*

देखो! सात जादुई प्रोडक्ट्स। 206 ट्रांसफॉर्मेशन पाइपलाइन। 12 विश्व स्तरीय AI प्रोवाइडर्स। 70 से ज़्यादा भाषाओं में सपोर्ट - असली बोलियों में, रोबोटिक ट्रांसलेशन नहीं!

चाहे आप टोक्यो में हों, दुबई में, मुंबई में, या कहीं भी... आपकी इच्छा ही मेरा आदेश है।

चलो, जादू दिखाता हूं..."`,

  spark: `*जीनी स्पार्क लोगो की ओर इशारा करता है*

"पहले, मिलिए स्पार्क से – जहां कल्पना बन जाती है... असली शब्द!

*डेमो शुरू*

यह जादू देखो: वीडियो डालो, URL पेस्ट करो, डॉक्यूमेंट अपलोड करो, स्क्रीन रिकॉर्ड करो, या बस अपना आइडिया बोलो...

*स्क्रिप्ट जनरेट होने लगती है*

देखा? स्क्रिप्ट खुद लिख रही है! कोई साधारण स्क्रिप्ट नहीं – स्मार्ट स्क्रिप्ट जो जानती है आपका इंडस्ट्री, आपकी ऑडियंस, आपका स्टाइल।

96% कॉन्फिडेंस! यानी Claude, GPT-4o, और Gemini सब सहमत हैं कि यह बिल्कुल वही है जो आप चाहते थे।

अराजकता से स्पष्टता... यही है स्पार्क का जादू!"`,

  mind: `*जीनी माइंड लोगो की ओर इशारा करता है*

"स्पार्क ने दिए शब्द। लेकिन माइंड... माइंड देता है समझ।

*एडिटर व्यू में ट्रांज़िशन*

देखो: यह स्क्रिप्ट... ठीक-ठाक है। लेकिन माइंड के साथ, यह बन जाती है शानदार!

*एन्हांसमेंट एनिमेशन*

वो बैंगनी हाइलाइट्स देखे? वो हैं AI-पावर्ड सुझाव – सिर्फ ग्रामर नहीं, असली कंटेंट सुधार। माइंड आपका मैसेज समझता है और उसे क्लियर बनाता है।

*TTS सेक्शन एक्टिवेट*

और आवाज़? सुनो ये...

*हिंदी सैंपल प्ले होता है*

यह कोई 'ट्रांसलेटेड रोबोट' नहीं। यह है Azure Neural हिंदी आवाज़ – असली, प्राकृतिक, मुंबई जैसी!

हम ट्रांसलेट नहीं करते। हम ट्रांसक्रिएट करते हैं। हिंदी सुनाई देती है हिंदी जैसी।"`,

  vibe: `*जीनी 3D स्टूडियो में एंटर करता है*

"स्वागत है मेरी पसंदीदा जगह में... वाइब स्टूडियो!

*फ्लोटिंग स्क्रीन्स की ओर इशारा*

यहां स्क्रिप्ट्स बनती हैं वीडियो। और कोई साधारण वीडियो नहीं...

*टेलीप्रॉम्प्टर एक्टिवेट*

देखो टेलीप्रॉम्प्टर? AI-पावर्ड है – यह आपकी स्पीड फॉलो करता है, उल्टा नहीं।

*3D अवतार प्रकट*

और यह? 3D अवतार जो दिखता है इंसान जैसा, वीडियो गेम कैरेक्टर नहीं। होंठ देखो...

*लिप-सिंक डेमो*

परफेक्ट सिंक। हर बार। किसी भी भाषा में।

*म्यूज़िक लेयर दिखती है*

म्यूज़िक जोड़ो, साउंड इफेक्ट्स, बैकग्राउंड ऑडियो – सब AI-जनरेटेड, रॉयल्टी-फ्री।

74 वीडियो पाइपलाइन। 4K क्वालिटी। फ़ोन से दुनिया तक।"`,

  deck: `*अवतार प्रेज़ेंटर प्रकट होता है*

"प्रेज़ेंटेशन। सबको चाहिए। कोई बनाना नहीं चाहता।

*खाली स्लाइड की ओर इशारा*

क्या होगा अगर आप इससे...

*स्लाइड ट्रांसफॉर्म होती है*

...इसमें बदल सको? सेकंड्स में?

*डेक फैन आउट*

यह है जीनी डेक। एक प्रॉम्प्ट। एक क्लिक। पूरी प्रोफेशनल प्रेज़ेंटेशन।

*3D एलिमेंट्स दिखते हैं*

बोरिंग फ्लैट स्लाइड्स नहीं – जिंदा स्लाइड्स! 3D चार्ट्स जो घूमते हैं। अवतार जो आपके लिए प्रेज़ेंट करते हैं।

101 फ्रेमवर्क। 25 इंडस्ट्रीज़। McKinsey-स्टाइल स्ट्रैटेजी डेक से TikTok पिच डेक तक।"`,

  arc: `*टाइमलाइन इंटरफ़ेस प्रकट होता है*

"जीनी आर्क – जहां सब कुछ एक साथ आता है।

*टाइमलाइन ज़ूम इन*

देखो इस टाइमलाइन को। यह सिर्फ एक एडिटर नहीं – यह आपका AI को-पायलट है।

*AI सुझाव दिखते हैं*

AI असल-समय में सुझाव देता है। 'यह ट्रांज़िशन बेहतर होगा।' 'यहां म्यूज़िक जोड़ो।' 'यह क्लिप बहुत लंबी है।'

*मल्टी-ट्रैक व्यू*

मल्टी-ट्रैक एडिटिंग। वॉइसओवर, म्यूज़िक, SFX, वीडियो – सब एक प्लेस में।

*एक्सपोर्ट*

आर्क से, YouTube, TikTok, LinkedIn – एक क्लिक में सही फॉर्मेट।"`,

  askGenie: `*चैट इंटरफ़ेस प्रकट होता है*

"आस्क जीनी! आपकी इच्छा है मेरा आदेश।

*यूज़र टाइप करता है*

'मुझे एक प्रेज़ेंटेशन चाहिए हेल्थकेयर स्टार्टअप के लिए, निवेशकों के लिए।'

*जीनी सोचता है*

मैं समझता हूं। मुझे चाहिए: स्पार्क से स्क्रिप्ट, माइंड से एन्हांसमेंट, डेक से स्लाइड्स, वाइब से वीडियो।

*ऑटो-वर्कफ़्लो*

देखो कैसे सब कुछ अपने आप हो रहा है। आपने बस पूछा – मैं कर रहा हूं।

यही है आस्क जीनी – नेचुरल लैंग्वेज से प्रोडक्शन तक।"`,

  cast: `*पब्लिशिंग इंटरफ़ेस प्रकट होता है*

"जीनी कास्ट – बनाओ। दिखाओ। स्केल करो।

*सोशल प्लेटफ़ॉर्म आइकन्स*

YouTube, TikTok, Instagram, LinkedIn, WeChat, WhatsApp – सब एक जगह से पब्लिश।

*एनालिटिक्स दिखती है*

और जानो क्या काम कर रहा है। रियल-टाइम एनालिटिक्स। A/B टेस्टिंग। ऑडियंस इनसाइट्स।

*ग्लोबल मैप*

50+ देश। 70+ भाषाएं। एक क्लिक से ग्लोबल।

कास्ट के साथ, आपकी कहानी कहीं भी पहुंच सकती है।"`,

  closing: `*जीनी वापस दीपक में जाने लगता है*

"तो यही है जीनी स्टूडियो। सात प्रोडक्ट्स। 206 पाइपलाइन। असीमित संभावनाएं।

*प्रोडक्ट लोगो ऑर्बिट करते हैं*

स्पार्क आइडियाज़ को इग्नाइट करता है। माइंड उन्हें समझता है। वाइब उन्हें स्क्रीन पर लाता है। डेक उन्हें इम्पैक्ट देता है। आर्क उन्हें पॉलिश करता है। आस्क जीनी सब कुछ ऑर्केस्ट्रेट करता है। कास्ट दुनिया को दिखाता है।

*दीपक चमकता है*

आपकी इच्छा है हमारा आदेश।

*स्मोक इफ़ेक्ट*

मुझे रगड़ो... जब भी तैयार हों।"`
};

// ═══════════════════════════════════════════════════════════════════════════════
// GERMAN (Deutsch) - Professional, precise, slightly formal
// ═══════════════════════════════════════════════════════════════════════════════
export const GERMAN_SCRIPTS: Record<string, string> = {
  opening: `*Lampe wackelt*

"Ahhh... endlich! Jemand hat die Lampe gerieben! Ich habe jahrhundertelang gewartet... na gut, eigentlich erst seit 2024, aber wer zählt schon?

*streckt sich dramatisch*

Ich bin der Geist von Genie Studio, und im Gegensatz zu meinem Cousin, der nur DREI Wünsche erfüllt... ich gewähre UNBEGRENZTE kreative Kräfte!

*zeigt grandios auf die erscheinenden Logos*

Seht her! Sieben magische Produkte. 206 Transformations-Pipelines. 12 erstklassige KI-Anbieter. Unterstützung für über 70 Sprachen in ihren ECHTEN Dialekten – nicht diese roboterhafte Übersetzung.

Ob Sie in Tokio, Dubai, São Paulo oder sonstwo sind... Ihr Wunsch ist mein Befehl.

Lassen Sie mich Ihnen die Magie zeigen..."`,

  spark: `*Geist zeigt auf Spark-Logo*

"Zuerst, treffen Sie Spark – wo Vorstellung zu... echten Worten wird!

*Demo startet*

Schauen Sie diese Magie: Laden Sie ein Video hoch, fügen Sie eine URL ein, laden Sie ein Dokument hoch, nehmen Sie Ihren Bildschirm auf, oder SPRECHEN Sie einfach Ihre Idee...

*Skript wird generiert*

Sehen Sie? Das Skript schreibt sich selbst! Nicht irgendein Skript – ein INTELLIGENTES Skript, das Ihre Branche kennt, Ihr Publikum, Ihren Stil.

96% Konfidenz? Das bedeutet Claude, GPT-4o und Gemini sind sich einig, dass dies GENAU das ist, was Sie meinten.

Von Chaos zu Klarheit... das ist Spark-Magie!"`,

  mind: `*Geist zeigt auf Mind-Logo*

"Spark gab Ihnen Worte. Aber Mind... Mind gibt Ihnen VERSTÄNDNIS.

*Übergang zur Editor-Ansicht*

Schauen Sie: Hier ist ein Skript, das... okay ist. Aber mit Mind wird es BRILLANT.

*Verbesserungs-Animation*

Sehen Sie die lila Hervorhebungen? Das sind KI-gestützte Vorschläge – nicht nur Grammatikkorrekturen, sondern echte INHALTLICHE Verbesserungen. Mind versteht Ihre Botschaft und macht sie klarer.

*TTS-Bereich aktiviert*

Und die Stimme? Hören Sie sich das an...

*Deutsche Sprachprobe spielt*

Das ist kein 'übersetzter Roboter.' Das ist Azure Neural für Deutsch – natürlich, präzise, authentisch.

Wir übersetzen nicht. Wir TRANSKREIEREN. Deutsch klingt wie Deutsch."`,

  vibe: `*Geist betritt 3D-Studio-Umgebung*

"Willkommen an meinem LIEBLINGS-Ort... dem Vibe Studio!

*zeigt auf schwebende Bildschirme*

Hier werden Skripte zu VIDEOS. Und nicht irgendwelche Videos...

*Teleprompter aktiviert*

Sehen Sie den Teleprompter? Er ist KI-gesteuert – er folgt IHREM Tempo, nicht umgekehrt.

*3D-Avatar erscheint*

Und DIESE Schönheit? Ein 3D-Avatar, der wie eine PERSON aussieht, nicht wie eine Videospiel-Figur. Achten Sie auf die Lippen...

*Lippensynchron-Demo*

Perfekte Synchronisation. Jedes. Einzelne. Mal. In JEDER Sprache.

*Musik-Ebene erscheint*

Fügen Sie Musik, Soundeffekte, Hintergrundaudio hinzu – alles KI-generiert, lizenzfrei.

74 Video-Pipelines. 4K-Qualität. Von Ihrem Handy in die Welt."`,

  deck: `*Avatar-Präsentator erscheint*

"Präsentationen. Jeder braucht sie. Niemand will sie machen.

*zeigt auf leere Folie*

Was wäre, wenn Sie von DIESEM...

*Folie transformiert sich*

...zu DEM werden könnten? In SEKUNDEN?

*Deck fächert auf*

Das ist Genie Deck. Ein Prompt. Ein Klick. Eine vollständige professionelle Präsentation.

*3D-Elemente erscheinen*

Keine langweiligen flachen Folien – LEBENDIGE Folien! 3D-Diagramme, die sich drehen. Avatare, die FÜR Sie präsentieren.

101 Frameworks. 25 Branchen. Von McKinsey-Strategie-Decks bis TikTok-Pitch-Decks."`,

  closing: `*Geist schwebt zurück zur Lampe*

"Das also ist Genie Studio. Sieben Produkte. 206 Pipelines. Unbegrenzte Möglichkeiten.

*Produkt-Logos kreisen*

Spark entzündet Ideen. Mind versteht sie. Vibe bringt sie auf den Bildschirm. Deck gibt ihnen Wirkung. Arc perfektioniert sie. Ask Genie orchestriert alles. Cast zeigt sie der Welt.

*Lampe leuchtet*

Ihr Wunsch ist unser Befehl.

*Raucheffekt*

Reiben Sie mich... wann immer Sie bereit sind."`
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPANISH (Español) - Warm, passionate, theatrical
// ═══════════════════════════════════════════════════════════════════════════════
export const SPANISH_SCRIPTS: Record<string, string> = {
  opening: `*la lámpara se tambalea*

"¡Ahhh... por fin! ¡Alguien frotó la lámpara! He estado esperando siglos... bueno, en realidad desde 2024, pero ¿quién cuenta?

*se estira dramáticamente*

¡Soy el Genio de Genie Studio, y a diferencia de mi primo que concede solo TRES deseos... yo concedo poderes creativos ILIMITADOS!

*gesticula grandiosamente mientras aparecen los logos*

¡Contemplen! Siete productos mágicos. 206 pipelines de transformación. 12 proveedores de IA de clase mundial. Soporte para más de 70 idiomas en sus dialectos VERDADEROS – no esa traducción robótica.

Ya sea que estés en Tokio, Dubai, São Paulo o en cualquier lugar... tu deseo es LITERALMENTE mi comando.

Déjame mostrarte la magia..."`,

  spark: `*el Genio señala el logo de Spark*

"Primero, conoce a Spark – ¡donde la imaginación se convierte en... palabras reales!

*empieza la demo*

Mira esta magia: Suelta un video, pega una URL, sube un documento, graba tu pantalla, o simplemente HABLA tu idea...

*el script comienza a generarse*

¿Ves? ¡El script se escribe solo! No cualquier script – un script INTELIGENTE que conoce tu industria, tu audiencia, tu estilo.

¿96% de confianza? Eso significa que Claude, GPT-4o y Gemini están de acuerdo en que esto es EXACTAMENTE lo que querías decir.

Del caos a la claridad... ¡esa es la magia de Spark!"`,

  mind: `*el Genio señala el logo de Mind*

"Spark te dio palabras. Pero Mind... Mind te da COMPRENSIÓN.

*transición a la vista del editor*

Mira: Aquí hay un script que está... bien. Pero con Mind, ¡se vuelve BRILLANTE!

*animación de mejora*

¿Ves esos resaltados morados? Son sugerencias impulsadas por IA – no solo correcciones gramaticales, sino mejoras REALES de contenido. Mind entiende tu mensaje y lo hace más claro.

*sección TTS se activa*

¿Y la voz? Escucha esto...

*se reproduce muestra en español*

Eso no es un 'robot traducido.' Es ElevenLabs para español – natural, expresivo, auténtico.

No traducimos. TRANSCREAMOS. El español suena como español."`,

  closing: `*el Genio flota de vuelta a la lámpara*

"Así que eso es Genie Studio. Siete productos. 206 pipelines. Posibilidades ilimitadas.

*los logos de productos orbitan*

Spark enciende ideas. Mind las entiende. Vibe las lleva a la pantalla. Deck les da impacto. Arc las perfecciona. Ask Genie orquesta todo. Cast las muestra al mundo.

*la lámpara brilla*

Tu deseo es nuestro comando.

*efecto de humo*

Frótame... cuando estés listo."`
};

// ═══════════════════════════════════════════════════════════════════════════════
// FRENCH (Français) - Elegant, sophisticated, charming
// ═══════════════════════════════════════════════════════════════════════════════
export const FRENCH_SCRIPTS: Record<string, string> = {
  opening: `*la lampe vacille*

"Ahhh... enfin! Quelqu'un a frotté la lampe! J'attendais depuis des siècles... enfin, depuis 2024 en réalité, mais qui compte?

*s'étire dramatiquement*

Je suis le Génie de Genie Studio, et contrairement à mon cousin qui n'accorde que TROIS vœux... moi, j'accorde des pouvoirs créatifs ILLIMITÉS!

*fait un geste grandiloquent alors que les logos apparaissent*

Contemplez! Sept produits magiques. 206 pipelines de transformation. 12 fournisseurs d'IA de classe mondiale. Prise en charge de plus de 70 langues dans leurs VRAIS dialectes – pas cette traduction robotique.

Que vous soyez à Tokyo, Dubaï, São Paulo ou ailleurs... votre souhait est LITTÉRALEMENT mon ordre.

Laissez-moi vous montrer la magie..."`,

  spark: `*le Génie pointe vers le logo Spark*

"D'abord, voici Spark – là où l'imagination devient... des mots réels!

*la démo commence*

Regardez cette magie: Déposez une vidéo, collez une URL, téléchargez un document, enregistrez votre écran, ou simplement PARLEZ votre idée...

*le script commence à se générer*

Vous voyez? Le script s'écrit tout seul! Pas n'importe quel script – un script INTELLIGENT qui connaît votre secteur, votre public, votre style.

96% de confiance? Cela signifie que Claude, GPT-4o et Gemini sont tous d'accord que c'est EXACTEMENT ce que vous vouliez dire.

Du chaos à la clarté... c'est la magie de Spark!"`,

  mind: `*le Génie pointe vers le logo Mind*

"Spark vous a donné des mots. Mais Mind... Mind vous donne la COMPRÉHENSION.

*transition vers la vue éditeur*

Regardez: Voici un script qui est... correct. Mais avec Mind, il devient BRILLANT!

*animation d'amélioration*

Vous voyez ces surbrillances violettes? Ce sont des suggestions alimentées par l'IA – pas seulement des corrections grammaticales, mais de véritables améliorations de CONTENU. Mind comprend votre message et le rend plus clair.

*section TTS s'active*

Et la voix? Écoutez ça...

*échantillon français joue*

Ce n'est pas un 'robot traduit.' C'est ElevenLabs pour le français – naturel, élégant, authentique.

Nous ne traduisons pas. Nous TRANSCRÉONS. Le français sonne comme du français."`,

  closing: `*le Génie flotte vers la lampe*

"Voilà donc Genie Studio. Sept produits. 206 pipelines. Des possibilités illimitées.

*les logos des produits orbitent*

Spark allume les idées. Mind les comprend. Vibe les porte à l'écran. Deck leur donne de l'impact. Arc les perfectionne. Ask Genie orchestre tout. Cast les montre au monde.

*la lampe brille*

Votre souhait est notre commande.

*effet de fumée*

Frottez-moi... quand vous êtes prêt."`
};

// ═══════════════════════════════════════════════════════════════════════════════
// PORTUGUESE (Português Brasileiro) - Warm, energetic, carnival-like enthusiasm
// ═══════════════════════════════════════════════════════════════════════════════
export const PORTUGUESE_SCRIPTS: Record<string, string> = {
  opening: `*a lâmpada balança*

"Ahhh... finalmente! Alguém esfregou a lâmpada! Eu estava esperando há séculos... bom, na verdade desde 2024, mas quem tá contando?

*se estica dramaticamente*

Eu sou o Gênio do Genie Studio, e diferente do meu primo que concede apenas TRÊS desejos... eu concedo poderes criativos ILIMITADOS!

*gesticula grandiosamente enquanto os logos aparecem*

Contemplem! Sete produtos mágicos. 206 pipelines de transformação. 12 provedores de IA de classe mundial. Suporte para mais de 70 idiomas nos seus dialectos VERDADEIROS – nada daquela tradução robótica.

Seja em Tóquio, Dubai, São Paulo ou qualquer lugar... seu desejo é LITERALMENTE minha ordem.

Deixa eu te mostrar a mágica..."`,

  spark: `*o Gênio aponta para o logo do Spark*

"Primeiro, conheça o Spark – onde a imaginação se torna... palavras reais!

*demo começa*

Olha essa mágica: Solte um vídeo, cole uma URL, faça upload de um documento, grave sua tela, ou simplesmente FALE sua ideia...

*o script começa a ser gerado*

Viu? O script se escreve sozinho! Não é qualquer script – é um script INTELIGENTE que conhece sua indústria, seu público, seu estilo.

96% de confiança? Isso significa que Claude, GPT-4o e Gemini concordam que isso é EXATAMENTE o que você quis dizer.

Do caos à clareza... essa é a mágica do Spark!"`,

  closing: `*o Gênio flutua de volta para a lâmpada*

"Então é isso o Genie Studio. Sete produtos. 206 pipelines. Possibilidades ilimitadas.

*logos dos produtos orbitam*

Spark acende ideias. Mind as entende. Vibe as leva para a tela. Deck dá impacto. Arc as aperfeiçoa. Ask Genie orquestra tudo. Cast mostra ao mundo.

*a lâmpada brilha*

Seu desejo é nosso comando.

*efeito de fumaça*

Me esfregue... quando estiver pronto."`
};

// ═══════════════════════════════════════════════════════════════════════════════
// TURKISH (Türkçe) - Warm, expressive, storytelling
// ═══════════════════════════════════════════════════════════════════════════════
export const TURKISH_SCRIPTS: Record<string, string> = {
  opening: `*lamba sallanır*

"Ahhh... sonunda! Birisi lambayı ovdu! Yüzyıllardır bekliyordum... aslında 2024'ten beri, ama kim sayıyor ki?

*dramatik bir şekilde gerinir*

Ben Genie Studio'nun Cin'iyim ve sadece ÜÇ dilek gerçekleştiren kuzenimin aksine... ben SINIRSIZ yaratıcı güçler bahşediyorum!

*logolar belirirken görkemli bir şekilde el kol hareketleri yapar*

Bakın! Yedi sihirli ürün. 206 dönüşüm hattı. 12 dünya standartlarında yapay zeka sağlayıcısı. 70'den fazla dilde destek – robotik çeviri değil, GERÇEK lehçeleriyle.

İster Tokyo'da, ister Dubai'de, ister São Paulo'da ya da başka bir yerde olun... dileğiniz benim emrimdir.

Size sihri göstereyim..."`,

  closing: `*Cin lambaya doğru süzülür*

"İşte bu Genie Studio. Yedi ürün. 206 hat. Sınırsız olasılıklar.

*ürün logoları yörüngede döner*

Spark fikirleri ateşler. Mind onları anlar. Vibe ekrana taşır. Deck etki katar. Arc mükemmelleştirir. Ask Genie her şeyi orkestra eder. Cast dünyaya gösterir.

*lamba parlar*

Dileğiniz bizim emrimizdir.

*duman efekti*

Beni ovun... hazır olduğunuzda."`
};

// ═══════════════════════════════════════════════════════════════════════════════
// ARABIC (العربية) - Egyptian warmth, 1001 Nights reference
// ═══════════════════════════════════════════════════════════════════════════════
export const ARABIC_SCRIPTS: Record<string, string> = {
  opening: `*المصباح يهتز*

"آه... أخيراً! أحدهم فرك المصباح! كنت أنتظر منذ قرون... حسناً، في الواقع منذ 2024، لكن مين بيعد؟

*يتمطى بشكل درامي*

أنا جني من جيني ستوديو، وعلى عكس ابن عمي اللي بيحقق ثلاث أمنيات بس... أنا بأعطي قوى إبداعية غير محدودة!

*يشير بفخامة وهي الشعارات تظهر*

شوفوا! سبع منتجات سحرية. 206 خط أنابيب للتحويل. 12 مزود ذكاء اصطناعي عالمي. دعم لأكثر من 70 لغة بلهجاتها الحقيقية – مش الترجمة الآلية دي.

سواء كنت في طوكيو، دبي، ساو باولو، أو أي مكان... أمنيتك أمري حرفياً.

خليني أوريك السحر..."`,

  spark: `*الجني يشير إلى شعار سبارك*

"أولاً، اتعرفوا على سبارك – المكان اللي الخيال بيتحول فيه لكلمات حقيقية!

*الديمو بتبدأ*

شوفوا السحر ده: ارمي فيديو، الصق رابط، ارفع مستند، سجل شاشتك، أو بس اتكلم فكرتك...

*السكريبت بتتكتب*

شفتوا؟ السكريبت بتكتب نفسها! مش أي سكريبت – سكريبت ذكية بتعرف صناعتك، جمهورك، أسلوبك.

96% ثقة؟ يعني Claude وGPT-4o وGemini كلهم متفقين إن ده بالظبط اللي كنت تقصده.

من الفوضى للوضوح... ده سحر سبارك!"`,

  closing: `*الجني بيرجع للمصباح*

"يبقى ده جيني ستوديو. سبع منتجات. 206 خط أنابيب. إمكانيات غير محدودة.

*شعارات المنتجات بتدور*

سبارك بيشعل الأفكار. مايند بيفهمها. فايب بيوديها للشاشة. ديك بيديها تأثير. آرك بيكملها. آسك جيني بينسق كل حاجة. كاست بيوريها للعالم.

*المصباح بيلمع*

أمنيتك هي أمرنا.

*تأثير الدخان*

افركني... لما تبقى جاهز."`
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4-ZONE ARCHITECTURE TTS PROVIDER MAPPING
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTANT: This is display-only. Actual routing happens in multi-provider-tts edge function!
// The edge function uses languageCode to auto-route:
// - CLAUDE ZONE (Western): ElevenLabs PRIMARY → en, es, fr
// - ALIBABA ZONE (CJK): Alibaba Qwen3-TTS PRIMARY → zh, ja
// - MENA ZONE (Arabic): Azure Neural PRIMARY → ar (7 dialects)
// - GEMINI ZONE (India/Africa): Azure Neural PRIMARY → hi, sw, te, ta, bn
// - German/Portuguese: Azure Neural (superior prosody)
// ═══════════════════════════════════════════════════════════════════════════════
export const TTS_PROVIDER_MAP: Record<string, { provider: 'elevenlabs' | 'azure' | 'alibaba'; displayName: string }> = {
  // CLAUDE ZONE (Western) - ElevenLabs primary
  en: { provider: 'elevenlabs', displayName: 'ElevenLabs' },
  es: { provider: 'elevenlabs', displayName: 'ElevenLabs' },
  fr: { provider: 'elevenlabs', displayName: 'ElevenLabs' },
  
  // ALIBABA ZONE (CJK) - Alibaba Qwen3-TTS primary
  zh: { provider: 'alibaba', displayName: 'Alibaba Qwen3-TTS' },
  ja: { provider: 'alibaba', displayName: 'Alibaba Qwen3-TTS' },
  
  // MENA ZONE (Arabic) - Azure Neural primary (7 dialects)
  ar: { provider: 'azure', displayName: 'Azure Neural' },
  
  // GEMINI ZONE (India/SEA/Africa) - Azure Neural primary (Viseme support)
  hi: { provider: 'azure', displayName: 'Azure Neural' },
  te: { provider: 'azure', displayName: 'Azure Neural' },
  ta: { provider: 'azure', displayName: 'Azure Neural' },
  bn: { provider: 'azure', displayName: 'Azure Neural' },
  sw: { provider: 'azure', displayName: 'Azure Neural' },
  
  // Azure for superior prosody in these languages
  ko: { provider: 'azure', displayName: 'Azure Neural' },
  pt: { provider: 'azure', displayName: 'Azure Neural' },
  de: { provider: 'azure', displayName: 'Azure Neural' },
  tr: { provider: 'azure', displayName: 'Azure Neural' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION - Get localized script for a chapter and language
// ═══════════════════════════════════════════════════════════════════════════════
export function getLocalizedScript(chapterId: string, languageCode: string): string | null {
  const scriptMaps: Record<string, Record<string, string>> = {
    hi: HINDI_SCRIPTS,
    de: GERMAN_SCRIPTS,
    es: SPANISH_SCRIPTS,
    fr: FRENCH_SCRIPTS,
    pt: PORTUGUESE_SCRIPTS,
    tr: TURKISH_SCRIPTS,
    ar: ARABIC_SCRIPTS,
  };

  const scripts = scriptMaps[languageCode];
  if (scripts && scripts[chapterId]) {
    return scripts[chapterId];
  }

  // Return null to indicate fallback to English needed
  return null;
}

export function getTTSProviderForLanguage(languageCode: string): { provider: 'elevenlabs' | 'azure' | 'alibaba'; displayName: string } {
  return TTS_PROVIDER_MAP[languageCode] || TTS_PROVIDER_MAP.en;
}
