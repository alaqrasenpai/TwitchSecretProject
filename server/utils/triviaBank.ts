import type { ITriviaQuestion } from '~/types/game';

export interface ITriviaCategoryMeta {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const TRIVIA_CATEGORIES: ITriviaCategoryMeta[] = [
  { id: 'all', nameAr: 'جميع المجالات (منوع)', nameEn: 'All Categories (Mixed)', icon: '✨', descriptionAr: 'أسئلة مختارة عشوائياً من كافة الفئات', descriptionEn: 'Random mixed questions across all categories' },
  { id: 'anime_gaming', nameAr: 'أنمي وألعاب فيديو', nameEn: 'Anime & Gaming', icon: '🎮', descriptionAr: 'عالم الأنمي، ون بيس، وأشهر ألعاب الفيديو', descriptionEn: 'Anime worlds, One Piece, gaming trivia' },
  { id: 'cinema_tv', nameAr: 'مسلسلات وسينما', nameEn: 'Movies & TV Series', icon: '🎬', descriptionAr: 'أفلام هوليوود، مسلسلات شهيرة وشخصيات سينمائية', descriptionEn: 'Hit movies, TV shows, and cinema icons' },
  { id: 'tech_science', nameAr: 'تكنولوجيا وفضاء وعلوم', nameEn: 'Tech, Science & Space', icon: '🚀', descriptionAr: 'برمجة، حواسيب، فيزياء، وكواكب الفضاء', descriptionEn: 'Coding, hardware, AI, astronomy & science' },
  { id: 'general', nameAr: 'معلومات عامة', nameEn: 'General Knowledge', icon: '🧠', descriptionAr: 'حقائق متنوعة ومعلومات شيقة وذكاء', descriptionEn: 'Fun facts, trivia, and global knowledge' },
  { id: 'sports', nameAr: 'رياضة وكرة قدم', nameEn: 'Sports & Football', icon: '⚽', descriptionAr: 'كأس العالم، أبطال أوروبا، وأساطير الرياضة', descriptionEn: 'World Cup, UEFA, and sports history' },
  { id: 'history_geo', nameAr: 'تاريخ وجغرافيا وعواصم', nameEn: 'History & Geography', icon: '🌍', descriptionAr: 'حضارات قديمة، دول، عواصم ومعالم كبرى', descriptionEn: 'Ancient history, capitals, and landmarks' },
  { id: 'islamic_arab', nameAr: 'ثقافة إسلامية وعربية', nameEn: 'Islamic & Arab Culture', icon: '🕌', descriptionAr: 'القرآن الكريم، التاريخ الإسلامي، والشعر العربي', descriptionEn: 'Islamic heritage, Quran, and Arab history' }
];

export const TRIVIA_QUESTIONS_BANK: ITriviaQuestion[] = [
  // ================= 1. ANIME & GAMING (أنمي وألعاب فيديو) =================
  {
    id: 'ag-1',
    categoryId: 'anime_gaming',
    question: 'في أنيمي ون بيس (One Piece)، ما هو حلم البطل مونكي دي لوفي؟',
    questionEn: 'In the anime One Piece, what is Monkey D. Luffy\'s ultimate dream?',
    options: ['أن يصبح أعظم سياف', 'أن يجد أمه المفقودة', 'أن يصبح ملك القراصنة', 'أن يصبح أميرالاً بالبحرية'],
    optionsEn: ['Become the greatest swordsman', 'Find his lost mother', 'Become the King of the Pirates', 'Become a Navy Admiral'],
    correctIndex: 2,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'حلم لوفي الأبدي هو العثور على كنز الـ One Piece ويصبح ملك القراصنة.',
    explanationEn: 'Luffy\'s lifelong dream is to find the One Piece treasure and become King of the Pirates.'
  },
  {
    id: 'ag-2',
    categoryId: 'anime_gaming',
    question: 'ما هي لعبة الفيديو الأكثر مبيعاً في تاريخ صناعة الألعاب حتى اليوم؟',
    questionEn: 'What is the best-selling video game of all time?',
    options: ['Grand Theft Auto V', 'Minecraft', 'Tetris', 'Wii Sports'],
    optionsEn: ['Grand Theft Auto V', 'Minecraft', 'Tetris', 'Wii Sports'],
    correctIndex: 1,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'لعبة Minecraft باعت أكثر من 300 مليون نسخة حول العالم.',
    explanationEn: 'Minecraft has sold over 300 million copies worldwide.'
  },
  {
    id: 'ag-3',
    categoryId: 'anime_gaming',
    question: 'من هو بطل سلسلة ألعاب The Legend of Zelda القابل للعب؟',
    questionEn: 'Who is the playable protagonist in The Legend of Zelda series?',
    options: ['Zelda', 'Link', 'Ganon', 'Mario'],
    optionsEn: ['Zelda', 'Link', 'Ganon', 'Mario'],
    correctIndex: 1,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'البطل القابل للعب هو لينك (Link) بينما زيلدا هي الأميرة.',
    explanationEn: 'Link is the playable hero, while Zelda is the princess.'
  },
  {
    id: 'ag-4',
    categoryId: 'anime_gaming',
    question: 'في أنيمي هجوم العمالقة (Attack on Titan)، ما هو اسم الجدار الخارجي الأول؟',
    questionEn: 'In Attack on Titan, what is the name of the outermost wall?',
    options: ['جدار سينا (Sina)', 'جدار روز (Rose)', 'جدار ماريا (Maria)', 'جدار يمير (Ymir)'],
    optionsEn: ['Wall Sina', 'Wall Rose', 'Wall Maria', 'Wall Ymir'],
    correctIndex: 2,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'MEDIUM',
    explanation: 'الجدار الخارجي الأبعد الذي سقط في أول حلقة هو جدار ماريا (Wall Maria).',
    explanationEn: 'The outermost wall that fell in the first episode is Wall Maria.'
  },
  {
    id: 'ag-5',
    categoryId: 'anime_gaming',
    question: 'أي استوديو هو المطور لسلسلة ألعاب Dark Souls و Elden Ring؟',
    questionEn: 'Which studio developed Dark Souls and Elden Ring?',
    options: ['Capcom', 'FromSoftware', 'Square Enix', 'Bethesda'],
    optionsEn: ['Capcom', 'FromSoftware', 'Square Enix', 'Bethesda'],
    correctIndex: 1,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'استوديو FromSoftware الياباني بقيادة المخرج هيديتاكا ميازاكي.',
    explanationEn: 'FromSoftware directed by Hidetaka Miyazaki.'
  },
  {
    id: 'ag-6',
    categoryId: 'anime_gaming',
    question: 'في لعبة GTA San Andreas، ما هو الاسم المختصر للشخصية الرئيسية؟',
    questionEn: 'In GTA San Andreas, what is the nickname of the main protagonist?',
    options: ['CJ', 'Big Smoke', 'Tommy', 'Trevor'],
    optionsEn: ['CJ', 'Big Smoke', 'Tommy', 'Trevor'],
    correctIndex: 0,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'كارل جونسون مشهور بلقب CJ.',
    explanationEn: 'Carl Johnson is known as CJ.'
  },
  {
    id: 'ag-7',
    categoryId: 'anime_gaming',
    question: 'ما هي قدرة غوكو الأيقونية التي يجمع فيها طاقة الكائنات الحية في Dragon Ball؟',
    questionEn: 'What is Goku\'s iconic technique where he gathers energy from all living things in Dragon Ball?',
    options: ['Kamehameha', 'Genki Dama (Spirit Bomb)', 'Kaioken', 'Solar Flare'],
    optionsEn: ['Kamehameha', 'Genki Dama (Spirit Bomb)', 'Kaioken', 'Solar Flare'],
    correctIndex: 1,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'كرة الغينكي داما (Spirit Bomb) تجمع طاقة الطبيعة والكائنات الحية.',
    explanationEn: 'The Spirit Bomb (Genki Dama) gathers life energy.'
  },

  // ================= 2. MOVIES & TV SERIES (مسلسلات وسينما) =================
  {
    id: 'cin-1',
    categoryId: 'cinema_tv',
    question: 'في سلسلة أفلام The Matrix، ما هو الاسم الحركي للشخصية التي يؤديها كيانو ريفز؟',
    questionEn: 'In The Matrix, what is the alias of Keanu Reeves\' character?',
    options: ['مورفيوس (Morpheus)', 'نيو (Neo)', 'العميل سميث (Smith)', 'سايفر (Cypher)'],
    optionsEn: ['Morpheus', 'Neo', 'Agent Smith', 'Cypher'],
    correctIndex: 1,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'EASY',
    explanation: 'نيو (The One) ويؤدي دوره الممثل كيانو ريفز.',
    explanationEn: 'Neo (The One) played by Keanu Reeves.'
  },
  {
    id: 'cin-2',
    categoryId: 'cinema_tv',
    question: 'في مسلسل Game of Thrones، ما هي العبارة الشهيرة لشعار عائلة ستارك (House Stark)؟',
    questionEn: 'In Game of Thrones, what is the official motto of House Stark?',
    options: ['Hear Me Roar', 'Winter is Coming', 'Fire and Blood', 'Family, Duty, Honor'],
    optionsEn: ['Hear Me Roar', 'Winter is Coming', 'Fire and Blood', 'Family, Duty, Honor'],
    correctIndex: 1,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'EASY',
    explanation: 'شعار عائلة ستارك هو: الشتاء قادم (Winter is Coming).',
    explanationEn: 'The Stark motto is "Winter is Coming".'
  },
  {
    id: 'cin-3',
    categoryId: 'cinema_tv',
    question: 'ما هو الفيلم الأكثر حصداً لجوائز الأوسكار (11 جائزة) بجانب Ben-Hur و The Lord of the Rings؟',
    questionEn: 'Which movie won 11 Academy Awards alongside Ben-Hur and Lord of the Rings: Return of the King?',
    options: ['Titanic (1997)', 'Avatar (2009)', 'Inception (2010)', 'Gladiator (2000)'],
    optionsEn: ['Titanic (1997)', 'Avatar (2009)', 'Inception (2010)', 'Gladiator (2000)'],
    correctIndex: 0,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'MEDIUM',
    explanation: 'فيلم تيتانيك (Titanic) حقق 11 جائزة أوسكار عام 1998.',
    explanationEn: 'Titanic won 11 Oscars at the 70th Academy Awards.'
  },
  {
    id: 'cin-4',
    categoryId: 'cinema_tv',
    question: 'في مسلسل Breaking Bad، ما هو الاسم المستعار الذي اختاره والتر وايت في تجارته؟',
    questionEn: 'In Breaking Bad, what is Walter White\'s criminal alias?',
    options: ['Scarface', 'Heisenberg', 'Gus Fring', 'Saul Goodman'],
    optionsEn: ['Scarface', 'Heisenberg', 'Gus Fring', 'Saul Goodman'],
    correctIndex: 1,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'EASY',
    explanation: 'اختار والتر وايت اسم الفيزيائي الشهير هايزنبرغ (Heisenberg).',
    explanationEn: 'Walter White chose the alias Heisenberg.'
  },
  {
    id: 'cin-5',
    categoryId: 'cinema_tv',
    question: 'من أخرج ثلاثية أفلام The Dark Knight و فيلم Interstellar و Oppenheimer؟',
    questionEn: 'Who directed The Dark Knight trilogy, Interstellar, and Oppenheimer?',
    options: ['ستيفن سبيلبرغ', 'كريستوفر نولان', 'جيمس كاميرون', 'كوينتن تارانتينو'],
    optionsEn: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Quentin Tarantino'],
    correctIndex: 1,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'EASY',
    explanation: 'المخرج البريطاني الشهير كريستوفر نولان (Christopher Nolan).',
    explanationEn: 'British director Christopher Nolan.'
  },

  // ================= 3. TECH, SCIENCE & SPACE (تكنولوجيا وفضاء وعلوم) =================
  {
    id: 'ts-1',
    categoryId: 'tech_science',
    question: 'ما هو الرمز الكيميائي لعنصر الذهب في الجدول الدوري؟',
    questionEn: 'What is the chemical symbol for Gold in the periodic table?',
    options: ['Ag', 'Au', 'Fe', 'Gd'],
    optionsEn: ['Ag', 'Au', 'Fe', 'Gd'],
    correctIndex: 1,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'الرمز Au مشتق من الكلمة اللاتينية Aurum.',
    explanationEn: 'Au comes from the Latin word Aurum.'
  },
  {
    id: 'ts-2',
    categoryId: 'tech_science',
    question: 'كم يبلغ عدد كواكب المجموعة الشمسية المعترف بها رسمياً؟',
    questionEn: 'How many planets are officially recognized in our solar system?',
    options: ['7 كواكب', '8 كواكب', '9 كواكب', '10 كواكب'],
    optionsEn: ['7 planets', '8 planets', '9 planets', '10 planets'],
    correctIndex: 1,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'المجموعة الشمسية تضم 8 كواكب رئيسية بعد إعادة تصنيف بلوتو ككوكب قزم.',
    explanationEn: 'There are 8 major planets after Pluto was reclassified as a dwarf planet.'
  },
  {
    id: 'ts-3',
    categoryId: 'tech_science',
    question: 'ما هو الغاز الأكثر وفرة في الغلاف الجوي لكوكب الأرض؟',
    questionEn: 'What is the most abundant gas in Earth\'s atmosphere?',
    options: ['الأكسجين (Oxygen)', 'النيتروجين (Nitrogen)', 'ثاني أكسيد الكربون', 'الهيدروجين'],
    optionsEn: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    correctIndex: 1,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'غاز النيتروجين يشكل حوالي 78% من الغلاف الجوي للأرض.',
    explanationEn: 'Nitrogen makes up approximately 78% of Earth\'s atmosphere.'
  },
  {
    id: 'ts-4',
    categoryId: 'tech_science',
    question: 'ما هي سرعة الضوء في الفراغ تقريباً؟',
    questionEn: 'What is the approximate speed of light in a vacuum?',
    options: ['30,000 كم/ثانية', '300,000 كم/ثانية', '300,000 كم/ساعة', '1,000,000 كم/ثانية'],
    optionsEn: ['30,000 km/s', '300,000 km/s', '300,000 km/h', '1,000,000 km/s'],
    correctIndex: 1,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'MEDIUM',
    explanation: 'سرعة الضوء تساوي 299,792 كم/ثانية تقريباً.',
    explanationEn: 'The speed of light is approximately 299,792 km/second.'
  },
  {
    id: 'ts-5',
    categoryId: 'tech_science',
    question: 'ما هي لغة البرمجة التي يعتمد عليها المتصفح لتشغيل الواجهات التفاعلية للويب؟',
    questionEn: 'Which programming language natively runs inside web browsers for interactive UI?',
    options: ['Python', 'C++', 'JavaScript', 'Rust'],
    optionsEn: ['Python', 'C++', 'JavaScript', 'Rust'],
    correctIndex: 2,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'جافاسكريبت (JavaScript) هي لغة الويب الأساسية للمتصفحات.',
    explanationEn: 'JavaScript is the standard language executed by web browsers.'
  },
  {
    id: 'ts-6',
    categoryId: 'tech_science',
    question: 'ما هو أكبر كوكب حجماً وكتلة في نظامنا الشمسي؟',
    questionEn: 'What is the largest planet in our solar system?',
    options: ['المشتري (Jupiter)', 'زحل (Saturn)', 'نبتون (Neptune)', 'المريخ (Mars)'],
    optionsEn: ['Jupiter', 'Saturn', 'Neptune', 'Mars'],
    correctIndex: 0,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'كوكب المشتري هو الأكبر على الإطلاق بكتلة تفوق كل الكواكب مجتمعة.',
    explanationEn: 'Jupiter is the largest planet by mass and volume.'
  },

  // ================= 4. GENERAL KNOWLEDGE (معلومات عامة) =================
  {
    id: 'gen-1',
    categoryId: 'general',
    question: 'ما هو أطول نهر في العالم وفقاً لمعظم الموسوعات الجغرافية؟',
    questionEn: 'What is generally considered the longest river in the world?',
    options: ['نهر الأمازون', 'نهر النيل', 'نهر المسيسيبي', 'نهر اليانغتسي'],
    optionsEn: ['Amazon River', 'Nile River', 'Mississippi River', 'Yangtze River'],
    correctIndex: 1,
    category: 'معلومات عامة',
    categoryEn: 'General Knowledge',
    difficulty: 'EASY',
    explanation: 'نهر النيل يبلغ طوله حوالي 6,650 كم.',
    explanationEn: 'The Nile River spans approximately 6,650 km.'
  },
  {
    id: 'gen-2',
    categoryId: 'general',
    question: 'ما هي أكبر قارة في العالم من حيث المساحة وعدد السكان؟',
    questionEn: 'What is the largest continent by both area and population?',
    options: ['قارة إفريقيا', 'قارة أمريكا الشمالية', 'قارة آسيا', 'قارة أوروبا'],
    optionsEn: ['Africa', 'North America', 'Asia', 'Europe'],
    correctIndex: 2,
    category: 'معلومات عامة',
    categoryEn: 'General Knowledge',
    difficulty: 'EASY',
    explanation: 'آسيا تشكل نحو 30% من مساحة اليابسة وتضم أكثر من 4.7 مليار نسمة.',
    explanationEn: 'Asia covers 30% of Earth\'s land area and hosts over 4.7 billion people.'
  },
  {
    id: 'gen-3',
    categoryId: 'general',
    question: 'ما هو الحيوان البري الأسرع على وجه الأرض في الركض؟',
    questionEn: 'What is the fastest land animal on Earth?',
    options: ['الأسد', 'الفهد الصياد (Cheetah)', 'الغزال العربي', 'الحصان البري'],
    optionsEn: ['Lion', 'Cheetah', 'Gazelle', 'Wild Horse'],
    correctIndex: 1,
    category: 'معلومات عامة',
    categoryEn: 'General Knowledge',
    difficulty: 'EASY',
    explanation: 'الفهد الصياد يمكنه الوصول لسرعة 110 كم/ساعة في ثوانٍ.',
    explanationEn: 'The cheetah can reach sprint speeds up to 110 km/h.'
  },
  {
    id: 'gen-4',
    categoryId: 'general',
    question: 'كم عدد ألوان قوس قزح الرئيسية المعترف بها علمياً؟',
    options: ['5 ألوان', '6 ألوان', '7 ألوان', '8 ألوان'],
    optionsEn: ['5 colors', '6 colors', '7 colors', '8 colors'],
    correctIndex: 2,
    category: 'معلومات عامة',
    categoryEn: 'General Knowledge',
    difficulty: 'EASY',
    explanation: 'ألوان قوس قزح هي 7: الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، البنفسجي.',
    explanationEn: 'Rainbow has 7 primary spectral colors: ROYGBIV.'
  },
  {
    id: 'gen-5',
    categoryId: 'general',
    question: 'كم يبلغ عدد عظام الهيكل العظمي لجسم الإنسان البالغ؟',
    questionEn: 'How many bones are in the adult human body?',
    options: ['180 عظمة', '206 عظمات', '250 عظمة', '300 عظمة'],
    optionsEn: ['180 bones', '206 bones', '250 bones', '300 bones'],
    correctIndex: 1,
    category: 'معلومات عامة',
    categoryEn: 'General Knowledge',
    difficulty: 'MEDIUM',
    explanation: 'يحتوي جسم الإنسان البالغ على 206 عظمات.',
    explanationEn: 'An adult human skeleton consists of 206 bones.'
  },

  // ================= 5. SPORTS & FOOTBALL (رياضة وكرة قدم) =================
  {
    id: 'sp-1',
    categoryId: 'sports',
    question: 'من هو المنتخب الأكثر تتويجاً بلقب كأس العالم لكرة القدم (5 مرات)؟',
    questionEn: 'Which national team has won the most FIFA World Cup titles (5 times)?',
    options: ['ألمانيا', 'إيطاليا', 'البرازيل', 'الأرجنتين'],
    optionsEn: ['Germany', 'Italy', 'Brazil', 'Argentina'],
    correctIndex: 2,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'EASY',
    explanation: 'منتخب البرازيل توج باللقب في 1958، 1962، 1970، 1994، و2002.',
    explanationEn: 'Brazil won in 1958, 1962, 1970, 1994, and 2002.'
  },
  {
    id: 'sp-2',
    categoryId: 'sports',
    question: 'كم عدد لاعبي فريق كرة السلة داخل الملعب أثناء سير المباراة؟',
    questionEn: 'How many players per team are on the court in a basketball game?',
    options: ['4 لاعبين', '5 لاعبين', '6 لاعبين', '7 لاعبين'],
    optionsEn: ['4 players', '5 players', '6 players', '7 players'],
    correctIndex: 1,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'EASY',
    explanation: 'يتكون كل فريق داخل الملعب من 5 لاعبين نشطين.',
    explanationEn: '5 players per team are active on the court simultaneously.'
  },
  {
    id: 'sp-3',
    categoryId: 'sports',
    question: 'من هو الهداف التاريخي لبطولة دوري أبطال أوروبا (UEFA Champions League)؟',
    questionEn: 'Who is the all-time top goalscorer in the UEFA Champions League?',
    options: ['ليونيل ميسي', 'كريستيانو رونالدو', 'روبرت ليفاندوفسكي', 'كريم بنزيما'],
    optionsEn: ['Lionel Messi', 'Cristiano Ronaldo', 'Robert Lewandowski', 'Karim Benzema'],
    correctIndex: 1,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'EASY',
    explanation: 'كريستيانو رونالدو يتصدر القائمة بأكثر من 140 هدفاً.',
    explanationEn: 'Cristiano Ronaldo holds the record with over 140 goals.'
  },
  {
    id: 'sp-4',
    categoryId: 'sports',
    question: 'من توج ببطولة كأس العالم قطر 2022؟',
    questionEn: 'Which country won the FIFA World Cup Qatar 2022?',
    options: ['فرنسا', 'كرواتيا', 'الأرجنتين', 'المغرب'],
    optionsEn: ['France', 'Croatia', 'Argentina', 'Morocco'],
    correctIndex: 2,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'EASY',
    explanation: 'فاز منتخب الأرجنتين بقيادة ليونيل ميسي باللقب في 2022.',
    explanationEn: 'Argentina captained by Lionel Messi won the 2022 World Cup.'
  },

  // ================= 6. HISTORY & GEOGRAPHY (تاريخ وجغرافيا وعواصم) =================
  {
    id: 'hg-1',
    categoryId: 'history_geo',
    question: 'ما هي عاصمة اليابان؟',
    questionEn: 'What is the capital city of Japan?',
    options: ['كيوتو (Kyoto)', 'أوساكا (Osaka)', 'طوكيو (Tokyo)', 'هيروشيما (Hiroshima)'],
    optionsEn: ['Kyoto', 'Osaka', 'Tokyo', 'Hiroshima'],
    correctIndex: 2,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'EASY',
    explanation: 'طوكيو هي عاصمة اليابان وتعتبر أكبر تجمع حضري في العالم.',
    explanationEn: 'Tokyo is the capital of Japan and the world\'s most populous metropolitan area.'
  },
  {
    id: 'hg-2',
    categoryId: 'history_geo',
    question: 'في أي عام انتهت الحرب العالمية الثانية رسمياً؟',
    questionEn: 'In what year did World War II officially end?',
    options: ['1943', '1944', '1945', '1946'],
    optionsEn: ['1943', '1944', '1945', '1946'],
    correctIndex: 2,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'EASY',
    explanation: 'انتهت الحرب العالمية الثانية عام 1945.',
    explanationEn: 'World War II concluded in 1945.'
  },
  {
    id: 'hg-3',
    categoryId: 'history_geo',
    question: 'ما هي أصغر دولة في العالم من حيث المساحة الجغرافية؟',
    questionEn: 'What is the smallest country in the world by land area?',
    options: ['موناكو', 'دولة الفاتيكان', 'سان مارينو', 'ليختنشتاين'],
    optionsEn: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
    correctIndex: 1,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'EASY',
    explanation: 'الفاتيكان تبلغ مساحتها حوالي 0.49 كيلومتر مربع فقط.',
    explanationEn: 'Vatican City measures approximately 0.49 square kilometers.'
  },
  {
    id: 'hg-4',
    categoryId: 'history_geo',
    question: 'ما هي عاصمة كندا الفيدرالية؟',
    questionEn: 'What is the capital city of Canada?',
    options: ['تورونتو', 'مونتريال', 'فانكوفر', 'أوتاوا'],
    optionsEn: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa'],
    correctIndex: 3,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'MEDIUM',
    explanation: 'أوتاوا هي العاصمة الفيدرالية الرسمية لكندا.',
    explanationEn: 'Ottawa is Canada\'s national capital.'
  },
  {
    id: 'hg-5',
    categoryId: 'history_geo',
    question: 'ما هي أعلى قمة جبلية على سطح كوكب الأرض فوق مستوى البحر؟',
    questionEn: 'What is the highest mountain peak above sea level on Earth?',
    options: ['كي 2 (K2)', 'قمة إيفرست (Mount Everest)', 'كليمنجارو (Kilimanjaro)', 'كانغشنجونغا'],
    optionsEn: ['K2', 'Mount Everest', 'Kilimanjaro', 'Kangchenjunga'],
    correctIndex: 1,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'EASY',
    explanation: 'قمة إيفرست في الهيمالايا ترتفع 8,848 متراً.',
    explanationEn: 'Mount Everest peaks at 8,848.86 meters.'
  },

  // ================= 7. ISLAMIC & ARAB CULTURE (ثقافة إسلامية وعربية) =================
  {
    id: 'ia-1',
    categoryId: 'islamic_arab',
    question: 'كم عدد سور القرآن الكريم؟',
    questionEn: 'How many Surahs (chapters) are in the Holy Quran?',
    options: ['110 سور', '114 سورة', '118 سورة', '120 سورة'],
    optionsEn: ['110 Surahs', '114 Surahs', '118 Surahs', '120 Surahs'],
    correctIndex: 1,
    category: 'ثقافة إسلامية وعربية',
    categoryEn: 'Islamic & Arab Culture',
    difficulty: 'EASY',
    explanation: 'القرآن الكريم يضم 114 سورة تبدأ بالفاتحة وتنتهي بالناس.',
    explanationEn: 'The Holy Quran consists of 114 Surahs starting with Al-Fatiha.'
  },
  {
    id: 'ia-2',
    categoryId: 'islamic_arab',
    question: 'ما هي أطول سورة في القرآن الكريم؟',
    questionEn: 'What is the longest Surah in the Holy Quran?',
    options: ['سورة البقرة', 'سورة آل عمران', 'سورة النساء', 'سورة المائدة'],
    optionsEn: ['Surah Al-Baqarah', 'Surah Ali \'Imran', 'Surah An-Nisa', 'Surah Al-Ma\'idah'],
    correctIndex: 0,
    category: 'ثقافة إسلامية وعربية',
    categoryEn: 'Islamic & Arab Culture',
    difficulty: 'EASY',
    explanation: 'سورة البقرة هي الأطول وتتكون من 286 آية.',
    explanationEn: 'Surah Al-Baqarah is the longest with 286 verses.'
  },
  {
    id: 'ia-3',
    categoryId: 'islamic_arab',
    question: 'من هو العالم المسلم الملقب بمؤسس علم الجبر ومخترع الصفر كقيمة حسابية؟',
    questionEn: 'Which Muslim scholar is recognized as the father of algebra?',
    options: ['الخوارزمي', 'ابن سينا', 'جابر بن حيان', 'ابن الهيثم'],
    optionsEn: ['Al-Khwarizmi', 'Ibn Sina (Avicenna)', 'Jabir ibn Hayyan', 'Ibn al-Haytham'],
    correctIndex: 0,
    category: 'ثقافة إسلامية وعربية',
    categoryEn: 'Islamic & Arab Culture',
    difficulty: 'EASY',
    explanation: 'محمد بن موسى الخوارزمي أسس علم الجبر واشتقت كلمة Algorithm من اسمه.',
    explanationEn: 'Muhammad ibn Musa al-Khwarizmi pioneered algebra and gave his name to algorithms.'
  },
  {
    id: 'ia-4',
    categoryId: 'islamic_arab',
    question: 'من هو الشاعر العربي الشهير الملقب بـ "أمير الشعراء"؟',
    questionEn: 'Which famous Arab poet was bestowed the title "Prince of Poets"?',
    options: ['أحمد شوقي', 'المتنبي', 'حافظ إبراهيم', 'نزار قباني'],
    optionsEn: ['Ahmed Shawqi', 'Al-Mutanabbi', 'Hafez Ibrahim', 'Nizar Qabbani'],
    correctIndex: 0,
    category: 'ثقافة إسلامية وعربية',
    categoryEn: 'Islamic & Arab Culture',
    difficulty: 'EASY',
    explanation: 'الشاعر المصري أحمد شوقي بويع أميراً للشعراء عام 1927.',
    explanationEn: 'Egyptian poet Ahmed Shawqi was crowned Prince of Poets in 1927.'
  },

  // ================= 8. MORE GAMING & ESPORTS (المزيد من الألعاب) =================
  {
    id: 'ag-5',
    categoryId: 'anime_gaming',
    question: 'في لعبة The Witcher 3، ما هو اسم بطل اللعبة الملقب بالذئب الأبيض؟',
    questionEn: 'In The Witcher 3, what is the name of the protagonist known as the White Wolf?',
    options: ['Geralt of Rivia', 'Vesemir', 'Dandelion', 'Ciri'],
    optionsEn: ['Geralt of Rivia', 'Vesemir', 'Dandelion', 'Ciri'],
    correctIndex: 0,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'جيرالت من ريفيا هو صائد الوحوش البطل الملقب بالذئب الأبيض.',
    explanationEn: 'Geralt of Rivia is the witcher protagonist known as the White Wolf.'
  },
  {
    id: 'ag-6',
    categoryId: 'anime_gaming',
    question: 'ما هي الشركة المطورة لسلسلة ألعاب Grand Theft Auto (GTA) الشهيرة؟',
    questionEn: 'Which company developed the legendary Grand Theft Auto (GTA) series?',
    options: ['Rockstar Games', 'Ubisoft', 'Electronic Arts', 'Activision'],
    optionsEn: ['Rockstar Games', 'Ubisoft', 'Electronic Arts', 'Activision'],
    correctIndex: 0,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'روكستار جيمز هي المطورة والناشرة لسلسلة GTA.',
    explanationEn: 'Rockstar Games is the creator and publisher of the GTA series.'
  },
  {
    id: 'ag-7',
    categoryId: 'anime_gaming',
    question: 'في أنيمي مذكرة الموت (Death Note)، ما هو الاسم المستعار للمحقق العبقري الغامض؟',
    questionEn: 'In Death Note, what is the alias of the brilliant eccentric detective?',
    options: ['L', 'Near', 'Kira', 'Mello'],
    optionsEn: ['L', 'Near', 'Kira', 'Mello'],
    correctIndex: 0,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'المحقق العبقري هو L واسمه الحقيقي L Lawliet.',
    explanationEn: 'The eccentric master detective is L (L Lawliet).'
  },
  {
    id: 'ag-8',
    categoryId: 'anime_gaming',
    question: 'ما هي اللعبة الفائزة بجائزة لعبة العام (Game of the Year) لعام 2022؟',
    questionEn: 'Which game won the Game of the Year award in 2022?',
    options: ['God of War Ragnarok', 'Elden Ring', 'Horizon Forbidden West', 'Stray'],
    optionsEn: ['God of War Ragnarok', 'Elden Ring', 'Horizon Forbidden West', 'Stray'],
    correctIndex: 1,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'MEDIUM',
    explanation: 'لعبة Elden Ring من استوديو FromSoftware فازت بلعبة العام 2022.',
    explanationEn: 'Elden Ring by FromSoftware won Game of the Year in 2022.'
  },
  {
    id: 'ag-9',
    categoryId: 'anime_gaming',
    question: 'في عالم بوكيمون، ما هو البوكيمون الكهربائي الأصفر المرافق لـ آش كيتشام؟',
    questionEn: 'In Pokémon, who is Ash Ketchum\'s famous electric yellow companion?',
    options: ['Charmander', 'Pikachu', 'Squirtle', 'Eevee'],
    optionsEn: ['Charmander', 'Pikachu', 'Squirtle', 'Eevee'],
    correctIndex: 1,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'بيكاتشو هو الرفيق الأول والأيقوني لـ آش.',
    explanationEn: 'Pikachu is Ash\'s beloved first partner.'
  },
  {
    id: 'ag-10',
    categoryId: 'anime_gaming',
    question: 'في أنيمي قاتل الشياطين (Demon Slayer)، ما هو اسم بطل القصة؟',
    questionEn: 'In Demon Slayer (Kimetsu no Yaiba), what is the name of the protagonist?',
    options: ['Tanjiro Kamado', 'Zenitsu Agatsuma', 'Inosuke Hashibira', 'Giyu Tomioka'],
    optionsEn: ['Tanjiro Kamado', 'Zenitsu Agatsuma', 'Inosuke Hashibira', 'Giyu Tomioka'],
    correctIndex: 0,
    category: 'أنمي وألعاب فيديو',
    categoryEn: 'Anime & Gaming',
    difficulty: 'EASY',
    explanation: 'تانجيرو كامادو هو البطل الذي يسعى لإعادة أخته نيزوكو إلى إنسان.',
    explanationEn: 'Tanjiro Kamado is the kindhearted protagonist.'
  },

  // ================= 9. MORE TECH, SCIENCE & SPACE =================
  {
    id: 'ts-5',
    categoryId: 'tech_science',
    question: 'ما هو أسرع شيء تم رصده في الكون؟',
    questionEn: 'What is the fastest known thing in the universe?',
    options: ['سرعة الصوت', 'سرعة الضوء في الفراغ', 'سرعة الرياح الشمسية', 'حركة الكواكب'],
    optionsEn: ['Speed of sound', 'Speed of light in vacuum', 'Solar wind speed', 'Planetary motion'],
    correctIndex: 1,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'سرعة الضوء في الفراغ تبلغ حوالي 300,000 كيلومتر بالثانية.',
    explanationEn: 'The speed of light in a vacuum is approximately 300,000 km/s.'
  },
  {
    id: 'ts-6',
    categoryId: 'tech_science',
    question: 'ما هو العنصر الكيميائي الأكثر وفرة في الكون؟',
    questionEn: 'What is the most abundant chemical element in the universe?',
    options: ['الأكسجين', 'الكربون', 'الهيدروجين', 'الهيليوم'],
    optionsEn: ['Oxygen', 'Carbon', 'Hydrogen', 'Helium'],
    correctIndex: 2,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'MEDIUM',
    explanation: 'الهيدروجين يشكل نحو 75% من الكتلة العنصرية للكون.',
    explanationEn: 'Hydrogen constitutes roughly 75% of all elemental mass in the universe.'
  },
  {
    id: 'ts-7',
    categoryId: 'tech_science',
    question: 'ماذا يطلق على الوحدة الأساسية المسؤولة عن معالجة البيانات داخل الحاسوب؟',
    questionEn: 'What is the primary computer hardware unit that executes instructions?',
    options: ['GPU', 'CPU', 'RAM', 'SSD'],
    optionsEn: ['GPU', 'CPU', 'RAM', 'SSD'],
    correctIndex: 1,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'وحدة المعالجة المركزية (CPU) هي عقل الحاسوب الرئيسي.',
    explanationEn: 'The Central Processing Unit (CPU) executes computing instructions.'
  },
  {
    id: 'ts-8',
    categoryId: 'tech_science',
    question: 'ما هو الكوكب الأقرب إلى الشمس في نظامنا الشمسي؟',
    questionEn: 'Which planet is closest to the Sun in our solar system?',
    options: ['الزهرة', 'عطارد', 'المريخ', 'الأرض'],
    optionsEn: ['Venus', 'Mercury', 'Mars', 'Earth'],
    correctIndex: 1,
    category: 'تكنولوجيا وفضاء وعلوم',
    categoryEn: 'Tech, Science & Space',
    difficulty: 'EASY',
    explanation: 'عطارد هو الكوكب الأقرب للشمس والأصغر بين الكواكب الثمانية.',
    explanationEn: 'Mercury is the closest and smallest planet to the Sun.'
  },

  // ================= 10. MORE FOOTBALL & SPORTS =================
  {
    id: 'sp-5',
    categoryId: 'sports',
    question: 'كم عدد ألقاب كأس العالم التي فازت بها البرازيل في تاريخها؟',
    questionEn: 'How many FIFA World Cup titles has Brazil won in history?',
    options: ['3 ألقاب', '4 ألقاب', '5 ألقاب', '6 ألقاب'],
    optionsEn: ['3 titles', '4 titles', '5 titles', '6 titles'],
    correctIndex: 2,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'EASY',
    explanation: 'البرازيل هي صاحبة الرقم القياسي بـ 5 بطولات كأس عالم.',
    explanationEn: 'Brazil holds the record with 5 World Cup trophies.'
  },
  {
    id: 'sp-6',
    categoryId: 'sports',
    question: 'من هو اللاعب الأكثر تتويجاً بجائزة الكرة الذهبية (Ballon d\'Or) في التاريخ؟',
    questionEn: 'Which player has won the most Ballon d\'Or awards in history?',
    options: ['كريستيانو رونالدو', 'ليونيل ميسي', 'بيليه', 'دييغو مارادونا'],
    optionsEn: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Diego Maradona'],
    correctIndex: 1,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'EASY',
    explanation: 'ليونيل ميسي حقق الكرة الذهبية 8 مرات.',
    explanationEn: 'Lionel Messi has won 8 Ballon d\'Or trophies.'
  },
  {
    id: 'sp-7',
    categoryId: 'sports',
    question: 'ما هو النادي الأكثر فوزاً ببطولة دوري أبطال أوروبا (UEFA Champions League)؟',
    questionEn: 'Which club has won the most UEFA Champions League titles?',
    options: ['بايرن ميونخ', 'إيه سي ميلان', 'ريال مدريد', 'ليفربول'],
    optionsEn: ['Bayern Munich', 'AC Milan', 'Real Madrid', 'Liverpool'],
    correctIndex: 2,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'EASY',
    explanation: 'ريال مدريد يتصدر بـ 15 لقباً في دوري أبطال أوروبا.',
    explanationEn: 'Real Madrid leads European history with 15 UCL titles.'
  },
  {
    id: 'sp-8',
    categoryId: 'sports',
    question: 'في أي دولة أقيمت أول بطولة لكأس العالم لكرة القدم عام 1930؟',
    questionEn: 'In which country was the first FIFA World Cup held in 1930?',
    options: ['البرازيل', 'أوروغواي', 'إيطاليا', 'فرنسا'],
    optionsEn: ['Brazil', 'Uruguay', 'Italy', 'France'],
    correctIndex: 1,
    category: 'رياضة وكرة قدم',
    categoryEn: 'Sports & Football',
    difficulty: 'MEDIUM',
    explanation: 'أقيمت البطولة في أوروغواي وفازت أوروغواي باللقب أيضاً.',
    explanationEn: 'The inaugural 1930 tournament was hosted and won by Uruguay.'
  },

  // ================= 11. MORE MOVIES & CINEMA =================
  {
    id: 'ct-5',
    categoryId: 'cinema_tv',
    question: 'من أخرج فيلم الخيال العلمي الشهير Interstellar (بين النجوم)؟',
    questionEn: 'Who directed the acclaimed sci-fi masterpiece Interstellar?',
    options: ['ستيفن سبيلبرغ', 'كريستوفر نولان', 'جيمس كاميرون', 'ريدلي سكوت'],
    optionsEn: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Ridley Scott'],
    correctIndex: 1,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'EASY',
    explanation: 'الفيلم من إخراج المخرج البريطاني كريستوفر نولان عام 2014.',
    explanationEn: 'Interstellar was directed by Christopher Nolan in 2014.'
  },
  {
    id: 'ct-6',
    categoryId: 'cinema_tv',
    question: 'في مسلسل Breaking Bad، ما هو الاسم المستعار لوالتر وايت في عالم الجريمة؟',
    questionEn: 'In Breaking Bad, what is Walter White\'s infamous criminal alias?',
    options: ['Heisenberg', 'Gus Fring', 'Saul Goodman', 'Jesse'],
    optionsEn: ['Heisenberg', 'Gus Fring', 'Saul Goodman', 'Jesse'],
    correctIndex: 0,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'EASY',
    explanation: 'والتر وايت اختار اسم هايزنبرغ تيمناً بعالم الفيزياء الألماني.',
    explanationEn: 'Walter White adopted the alias Heisenberg.'
  },
  {
    id: 'ct-7',
    categoryId: 'cinema_tv',
    question: 'من لعب دور الجوكر الأسطوري في فيلم The Dark Knight عام 2008؟',
    questionEn: 'Who played the iconic Joker in The Dark Knight (2008)?',
    options: ['خواكين فينيكس', 'هيث ليدجر', 'جاك نيكلسون', 'جاريد ليتو'],
    optionsEn: ['Joaquin Phoenix', 'Heath Ledger', 'Jack Nicholson', 'Jared Leto'],
    correctIndex: 1,
    category: 'مسلسلات وسينما',
    categoryEn: 'Movies & TV Series',
    difficulty: 'EASY',
    explanation: 'الممثل هيث ليدجر نال جائزة الأوسكار عن هذا الدور الاستثنائي.',
    explanationEn: 'Heath Ledger won a posthumous Academy Award for his performance.'
  },

  // ================= 12. MORE HISTORY & GEOGRAPHY =================
  {
    id: 'hg-5',
    categoryId: 'history_geo',
    question: 'ما هي عاصمة اليابان؟',
    questionEn: 'What is the capital city of Japan?',
    options: ['كيوتو', 'أوساكا', 'طوكيو', 'هيروشيما'],
    optionsEn: ['Kyoto', 'Osaka', 'Tokyo', 'Hiroshima'],
    correctIndex: 2,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'EASY',
    explanation: 'طوكيو هي عاصمة اليابان وواحدة من أكبر مدن العالم سكاناً.',
    explanationEn: 'Tokyo is the bustling capital of Japan.'
  },
  {
    id: 'hg-6',
    categoryId: 'history_geo',
    question: 'ما هو أكبر محيط على وجه الكرة الأرضية من حيث المساحة؟',
    questionEn: 'What is the largest ocean on Earth by surface area?',
    options: ['المحيط الأطلسي', 'المحيط الهادي', 'المحيط الهندي', 'المحيط المتجمد الشمالي'],
    optionsEn: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean'],
    correctIndex: 1,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'EASY',
    explanation: 'المحيط الهادي يغطي أكثر من 30% من إجمالي مساحة كوكب الأرض.',
    explanationEn: 'The Pacific Ocean covers more than 30% of Earth\'s surface.'
  },
  {
    id: 'hg-7',
    categoryId: 'history_geo',
    question: 'في أي قارة تقع أهرامات الجيزة ونهر النيل؟',
    questionEn: 'On which continent are the Giza Pyramids and the Nile River located?',
    options: ['آسيا', 'أفريقيا', 'أمريكا الجنوبية', 'أوروبا'],
    optionsEn: ['Asia', 'Africa', 'South America', 'Europe'],
    correctIndex: 1,
    category: 'تاريخ وجغرافيا وعواصم',
    categoryEn: 'History & Geography',
    difficulty: 'EASY',
    explanation: 'تقع الأهرامات ونهر النيل في قارة أفريقيا بمصر.',
    explanationEn: 'Located in Egypt on the African continent.'
  },

  // ================= 13. MORE GENERAL KNOWLEDGE =================
  {
    id: 'gk-5',
    categoryId: 'general',
    question: 'كم عدد ألوان قوس قزح الرئيسية؟',
    questionEn: 'How many primary colors are in a standard rainbow spectrum?',
    options: ['5 ألوان', '6 ألوان', '7 ألوان', '8 ألوان'],
    optionsEn: ['5 colors', '6 colors', '7 colors', '8 colors'],
    correctIndex: 2,
    category: 'معلومات عامة',
    categoryEn: 'General Knowledge',
    difficulty: 'EASY',
    explanation: 'ألوان قوس قزح هي 7: الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، والبنفسجي.',
    explanationEn: 'Red, orange, yellow, green, blue, indigo, and violet (7 colors).'
  },
  {
    id: 'gk-6',
    categoryId: 'general',
    question: 'ما هو الطائر الوحيد القادر على الطيران إلى الخلف؟',
    questionEn: 'Which is the only bird species capable of flying backwards?',
    options: ['الصقر', 'طائر الطنان', 'النسر', 'البومة'],
    optionsEn: ['Falcon', 'Hummingbird', 'Eagle', 'Owl'],
    correctIndex: 1,
    category: 'معلومات عامة',
    categoryEn: 'General Knowledge',
    difficulty: 'MEDIUM',
    explanation: 'طائر الطنان يمتلك مفاصل أجنحة فريدة تمكنه من الطيران بالاتجاه العكسي.',
    explanationEn: 'Hummingbirds can fly backwards and even upside down.'
  }
];

// OpenTDB decode helper
function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

/**
 * Fetch dynamic trivia questions from OpenTDB API with fallback to local bank.
 */
export async function fetchOpenTDBQuestions(count: number = 10): Promise<ITriviaQuestion[]> {
  try {
    const url = `https://opentdb.com/api.php?amount=${count}&type=multiple`;
    const response = await fetch(url, { headers: { 'User-Agent': 'ChatWar-Trivia-Engine' } });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('No results from OpenTDB');
    }

    return data.results.map((item: any, idx: number) => {
      const decodedQuestion = decodeHTMLEntities(item.question);
      const decodedCorrect = decodeHTMLEntities(item.correct_answer);
      const decodedIncorrect = (item.incorrect_answers || []).map((ans: string) => decodeHTMLEntities(ans));
      
      const allOptions = [decodedCorrect, ...decodedIncorrect].slice(0, 4);
      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
      }
      const correctIndex = allOptions.indexOf(decodedCorrect);

      return {
        id: `otdb_${Date.now()}_${idx}`,
        categoryId: 'general',
        question: decodedQuestion,
        questionEn: decodedQuestion,
        options: [allOptions[0] || 'A', allOptions[1] || 'B', allOptions[2] || 'C', allOptions[3] || 'D'],
        optionsEn: [allOptions[0] || 'A', allOptions[1] || 'B', allOptions[2] || 'C', allOptions[3] || 'D'],
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        category: decodeHTMLEntities(item.category || 'معلومات عامة'),
        categoryEn: decodeHTMLEntities(item.category || 'General Knowledge'),
        difficulty: (item.difficulty || 'medium').toUpperCase() as any
      };
    });
  } catch (error) {
    console.warn('[TriviaEngine] OpenTDB fetch fallback to built-in bank', error);
    return getLocalTriviaQuestions(count);
  }
}

/**
 * Get random questions from the local curated bank matching one or multiple category filters.
 */
export function getLocalTriviaQuestions(
  count: number = 10,
  categoriesFilter?: string[] | string
): ITriviaQuestion[] {
  let pool = [...TRIVIA_QUESTIONS_BANK];

  if (categoriesFilter) {
    const rawFilterList = Array.isArray(categoriesFilter) ? categoriesFilter : [categoriesFilter];
    const cleanList = rawFilterList.map(c => c.trim().toLowerCase());

    if (cleanList.length > 0 && !cleanList.includes('all') && !cleanList.includes('الكل') && !cleanList.includes('all categories')) {
      const filtered = pool.filter(q => {
        return cleanList.includes(q.categoryId.toLowerCase()) ||
               cleanList.includes(q.category.toLowerCase()) ||
               (q.categoryEn && cleanList.includes(q.categoryEn.toLowerCase()));
      });
      if (filtered.length > 0) {
        pool = filtered;
      }
    }
  }

  // Fisher-Yates Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}
