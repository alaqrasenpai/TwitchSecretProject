export interface IHangmanPresetWord {
  word: string;
  category: string;
  hint: string;
}

export const HANGMAN_PRESET_WORDS: IHangmanPresetWord[] = [
  // Gaming
  { word: 'فورتنايت', category: 'ألعاب', hint: 'لعبة باتل رويال وبناء شهيرة' },
  { word: 'ماينكرافت', category: 'ألعاب', hint: 'عالم البلوكات والدايموند' },
  { word: 'كلاش رويال', category: 'ألعاب', hint: 'لعبة استراتيجية وبطاقات وبرج الملك' },
  { word: 'ببجي موبايل', category: 'ألعاب', hint: 'الدروب والمقلاة وطائرة البداية' },
  { word: 'جراند ثفت اوتو', category: 'ألعاب', hint: 'عالم مفتوح وسيارات وشرطة' },
  { word: 'كول اوف ديوتي', category: 'ألعاب', hint: 'سلسلة حروب وتصويب شهيرة' },
  { word: 'ليج اوف ليجيندز', category: 'ألعاب', hint: 'لعبة موبا وميد لين وجنغل' },
  { word: 'ريد ديد ريديملشن', category: 'ألعاب', hint: 'عالم الغرب الأمريكي ورعاة البقر' },
  { word: 'سايبر بانك', category: 'ألعاب', hint: 'مدينة المستقبل نايت سيتي' },
  { word: 'روكيت ليق', category: 'ألعاب', hint: 'كرة قدم بالسيارات الطائرة' },

  // Anime & Cartoons
  { word: 'ون بيس', category: 'أنمي', hint: 'ملك القراصنة وقبعة القش' },
  { word: 'ناروتو شيبودن', category: 'أنمي', hint: 'قرية كونوها والنينجا ورامين' },
  { word: 'هجوم العمالقة', category: 'أنمي', hint: 'الأسوار والعمالقة وإيرين' },
  { word: 'دراجون بول', category: 'أنمي', hint: 'كرات التنين وغوكو والسوبر سايان' },
  { word: 'هنتر اكس هنتر', category: 'أنمي', hint: 'غون وكيلوا وامتحان الصيادين' },
  { word: 'ديث نوت', category: 'أنمي', hint: 'مذكرة الموت وإل وريوك' },

  // Streamers & Tech
  { word: 'تويتش شات', category: 'ستريمينغ', hint: 'المكان الذي يلعب فيه المتابعون' },
  { word: 'كيبورد ميكانيكي', category: 'تقنية', hint: 'سويتشات زرقاء وحمراء وصوت نقرات' },
  { word: 'ماوس باد ار جي بي', category: 'تقنية', hint: 'إضاءة ملونة وسرعة تحريك الماوس' },
  { word: 'شاشة اوليد', category: 'تقنية', hint: 'ألوان حقيقية وأسود عميق' },

  // General & Fun
  { word: 'برج خليفة', category: 'معالم', hint: 'أطول ناطحة سحاب في العالم' },
  { word: 'الأهرامات', category: 'تاريخ', hint: 'عجائب الدنيا السبع في الجيزة' },
  { word: 'سبيس تون', category: 'ذكريات', hint: 'قناة شباب المستقبل' }
];

export function getRandomHangmanPreset(): IHangmanPresetWord {
  return HANGMAN_PRESET_WORDS[Math.floor(Math.random() * HANGMAN_PRESET_WORDS.length)];
}
