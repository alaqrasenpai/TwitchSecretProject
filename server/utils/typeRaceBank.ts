import type { ITypeRaceWord } from '~/types/game';

/**
 * Curated single-word bank for Type Race Speed Challenge.
 * Every word is strictly 1 single word without spaces or phrases.
 */
export const TYPE_RACE_WORDS: ITypeRaceWord[] = [
  // --- Gaming & Battle Royale (ألعاب وباتل رويال) ---
  { id: 'w1', textAr: 'فورتنايت', textEn: 'Fortnite', category: 'gaming', difficulty: 'EASY' },
  { id: 'w2', textAr: 'ماينكرافت', textEn: 'Minecraft', category: 'gaming', difficulty: 'EASY' },
  { id: 'w3', textAr: 'روبلوكس', textEn: 'Roblox', category: 'gaming', difficulty: 'EASY' },
  { id: 'w4', textAr: 'قناص', textEn: 'Sniper', category: 'gaming', difficulty: 'EASY' },
  { id: 'w5', textAr: 'سلاح', textEn: 'Weapon', category: 'gaming', difficulty: 'EASY' },
  { id: 'w6', textAr: 'درع', textEn: 'Shield', category: 'gaming', difficulty: 'EASY' },
  { id: 'w7', textAr: 'رصاص', textEn: 'Ammo', category: 'gaming', difficulty: 'EASY' },
  { id: 'w8', textAr: 'هيدشوت', textEn: 'Headshot', category: 'gaming', difficulty: 'MEDIUM' },
  { id: 'w9', textAr: 'فكتوريا', textEn: 'Victory', category: 'gaming', difficulty: 'EASY' },
  { id: 'w10', textAr: 'رويال', textEn: 'Royale', category: 'gaming', difficulty: 'EASY' },
  { id: 'w11', textAr: 'دروب', textEn: 'Airdrop', category: 'gaming', difficulty: 'EASY' },
  { id: 'w12', textAr: 'كلتش', textEn: 'Clutch', category: 'gaming', difficulty: 'MEDIUM' },
  { id: 'w13', textAr: 'كومبو', textEn: 'Combo', category: 'gaming', difficulty: 'MEDIUM' },
  { id: 'w14', textAr: 'نرد', textEn: 'Dice', category: 'gaming', difficulty: 'EASY' },
  { id: 'w15', textAr: 'كأس', textEn: 'Trophy', category: 'gaming', difficulty: 'EASY' },
  { id: 'w16', textAr: 'قنبلة', textEn: 'Bomb', category: 'gaming', difficulty: 'EASY' },
  { id: 'w17', textAr: 'صاروخ', textEn: 'Rocket', category: 'gaming', difficulty: 'EASY' },
  { id: 'w18', textAr: 'زعيم', textEn: 'Boss', category: 'gaming', difficulty: 'EASY' },
  { id: 'w19', textAr: 'سيف', textEn: 'Sword', category: 'gaming', difficulty: 'EASY' },
  { id: 'w20', textAr: 'خنجر', textEn: 'Dagger', category: 'gaming', difficulty: 'EASY' },
  { id: 'w21', textAr: 'زومبي', textEn: 'Zombie', category: 'gaming', difficulty: 'EASY' },
  { id: 'w22', textAr: 'وحش', textEn: 'Monster', category: 'gaming', difficulty: 'EASY' },
  { id: 'w23', textAr: 'تنين', textEn: 'Dragon', category: 'gaming', difficulty: 'EASY' },
  { id: 'w24', textAr: 'شبح', textEn: 'Ghost', category: 'gaming', difficulty: 'EASY' },
  { id: 'w25', textAr: 'بوشل', textEn: 'Portal', category: 'gaming', difficulty: 'MEDIUM' },
  { id: 'w26', textAr: 'متاهة', textEn: 'Maze', category: 'gaming', difficulty: 'EASY' },
  { id: 'w27', textAr: 'ساحة', textEn: 'Arena', category: 'gaming', difficulty: 'EASY' },
  { id: 'w28', textAr: 'حلبة', textEn: 'Ring', category: 'gaming', difficulty: 'EASY' },
  { id: 'w29', textAr: 'ناجي', textEn: 'Survivor', category: 'gaming', difficulty: 'MEDIUM' },
  { id: 'w30', textAr: 'اسطورة', textEn: 'Legend', category: 'gaming', difficulty: 'MEDIUM' },

  // --- Tech, Hardware & Streaming (تقنية وحواسيب وبث) ---
  { id: 'w31', textAr: 'كيبورد', textEn: 'Keyboard', category: 'tech', difficulty: 'EASY' },
  { id: 'w32', textAr: 'ماوس', textEn: 'Mouse', category: 'tech', difficulty: 'EASY' },
  { id: 'w33', textAr: 'شاشة', textEn: 'Monitor', category: 'tech', difficulty: 'EASY' },
  { id: 'w34', textAr: 'سماعة', textEn: 'Headset', category: 'tech', difficulty: 'EASY' },
  { id: 'w35', textAr: 'مايكروفون', textEn: 'Microphone', category: 'tech', difficulty: 'MEDIUM' },
  { id: 'w36', textAr: 'كاميرا', textEn: 'Camera', category: 'tech', difficulty: 'EASY' },
  { id: 'w37', textAr: 'معالج', textEn: 'Processor', category: 'tech', difficulty: 'MEDIUM' },
  { id: 'w38', textAr: 'ذاكرة', textEn: 'Memory', category: 'tech', difficulty: 'EASY' },
  { id: 'w39', textAr: 'سيرفر', textEn: 'Server', category: 'tech', difficulty: 'EASY' },
  { id: 'w40', textAr: 'تويتش', textEn: 'Twitch', category: 'tech', difficulty: 'EASY' },
  { id: 'w41', textAr: 'ديسكورد', textEn: 'Discord', category: 'tech', difficulty: 'EASY' },
  { id: 'w42', textAr: 'ستريمر', textEn: 'Streamer', category: 'tech', difficulty: 'EASY' },
  { id: 'w43', textAr: 'برمجة', textEn: 'Coding', category: 'tech', difficulty: 'EASY' },
  { id: 'w44', textAr: 'مطور', textEn: 'Developer', category: 'tech', difficulty: 'MEDIUM' },
  { id: 'w45', textAr: 'خوارزمية', textEn: 'Algorithm', category: 'tech', difficulty: 'HARD' },
  { id: 'w46', textAr: 'بيكسل', textEn: 'Pixel', category: 'tech', difficulty: 'EASY' },
  { id: 'w47', textAr: 'فريمات', textEn: 'Frames', category: 'tech', difficulty: 'EASY' },
  { id: 'w48', textAr: 'بينج', textEn: 'Ping', category: 'tech', difficulty: 'EASY' },
  { id: 'w49', textAr: 'لاغ', textEn: 'Lag', category: 'tech', difficulty: 'EASY' },
  { id: 'w50', textAr: 'شات', textEn: 'Chat', category: 'tech', difficulty: 'EASY' },

  // --- Speed, Reflexes & Challenges (سرعة وتحديات وردة فعل) ---
  { id: 'w51', textAr: 'برق', textEn: 'Lightning', category: 'challenge', difficulty: 'EASY' },
  { id: 'w52', textAr: 'سرعة', textEn: 'Speed', category: 'challenge', difficulty: 'EASY' },
  { id: 'w53', textAr: 'عاصفة', textEn: 'Storm', category: 'challenge', difficulty: 'EASY' },
  { id: 'w54', textAr: 'تركيز', textEn: 'Focus', category: 'challenge', difficulty: 'EASY' },
  { id: 'w55', textAr: 'تحدي', textEn: 'Challenge', category: 'challenge', difficulty: 'EASY' },
  { id: 'w56', textAr: 'حماسة', textEn: 'Enthusiasm', category: 'challenge', difficulty: 'MEDIUM' },
  { id: 'w57', textAr: 'نيران', textEn: 'Fire', category: 'challenge', difficulty: 'EASY' },
  { id: 'w58', textAr: 'زلزال', textEn: 'Earthquake', category: 'challenge', difficulty: 'MEDIUM' },
  { id: 'w59', textAr: 'طاقة', textEn: 'Energy', category: 'challenge', difficulty: 'EASY' },
  { id: 'w60', textAr: 'ذكاء', textEn: 'Intelligence', category: 'challenge', difficulty: 'EASY' },
  { id: 'w61', textAr: 'بطل', textEn: 'Champion', category: 'challenge', difficulty: 'EASY' },
  { id: 'w62', textAr: 'فائز', textEn: 'Winner', category: 'challenge', difficulty: 'EASY' },
  { id: 'w63', textAr: 'صمود', textEn: 'Endurance', category: 'challenge', difficulty: 'MEDIUM' },
  { id: 'w64', textAr: 'مغامر', textEn: 'Adventurer', category: 'challenge', difficulty: 'MEDIUM' },
  { id: 'w65', textAr: 'محارب', textEn: 'Warrior', category: 'challenge', difficulty: 'EASY' },
  { id: 'w66', textAr: 'فارس', textEn: 'Knight', category: 'challenge', difficulty: 'EASY' },
  { id: 'w67', textAr: 'نينجا', textEn: 'Ninja', category: 'challenge', difficulty: 'EASY' },
  { id: 'w68', textAr: 'ساموراي', textEn: 'Samurai', category: 'challenge', difficulty: 'MEDIUM' },
  { id: 'w69', textAr: 'قرصان', textEn: 'Pirate', category: 'challenge', difficulty: 'EASY' },
  { id: 'w70', textAr: 'كابتن', textEn: 'Captain', category: 'challenge', difficulty: 'EASY' },

  // --- Anime & Pop Culture (أنمي وثقافة عامة) ---
  { id: 'w71', textAr: 'لوفي', textEn: 'Luffy', category: 'anime', difficulty: 'EASY' },
  { id: 'w72', textAr: 'زورو', textEn: 'Zoro', category: 'anime', difficulty: 'EASY' },
  { id: 'w73', textAr: 'ناروتو', textEn: 'Naruto', category: 'anime', difficulty: 'EASY' },
  { id: 'w74', textAr: 'ساسكي', textEn: 'Sasuke', category: 'anime', difficulty: 'EASY' },
  { id: 'w75', textAr: 'غوكو', textEn: 'Goku', category: 'anime', difficulty: 'EASY' },
  { id: 'w76', textAr: 'فيجيتا', textEn: 'Vegeta', category: 'anime', difficulty: 'EASY' },
  { id: 'w77', textAr: 'ليفاي', textEn: 'Levi', category: 'anime', difficulty: 'EASY' },
  { id: 'w78', textAr: 'ميكاسا', textEn: 'Mikasa', category: 'anime', difficulty: 'EASY' },
  { id: 'w79', textAr: 'ايتاتشي', textEn: 'Itachi', category: 'anime', difficulty: 'MEDIUM' },
  { id: 'w80', textAr: 'كاكاشي', textEn: 'Kakashi', category: 'anime', difficulty: 'MEDIUM' },
  { id: 'w81', textAr: 'مانجا', textEn: 'Manga', category: 'anime', difficulty: 'EASY' },
  { id: 'w82', textAr: 'سينسي', textEn: 'Sensei', category: 'anime', difficulty: 'EASY' },
  { id: 'w83', textAr: 'شينوبي', textEn: 'Shinobi', category: 'anime', difficulty: 'MEDIUM' },
  { id: 'w84', textAr: 'بانكاي', textEn: 'Bankai', category: 'anime', difficulty: 'MEDIUM' },
  { id: 'w85', textAr: 'تيتان', textEn: 'Titan', category: 'anime', difficulty: 'EASY' },

  // --- Sci-Fi & Universe (فضاء وخيال علمي) ---
  { id: 'w86', textAr: 'كوكب', textEn: 'Planet', category: 'space', difficulty: 'EASY' },
  { id: 'w87', textAr: 'مجرة', textEn: 'Galaxy', category: 'space', difficulty: 'EASY' },
  { id: 'w88', textAr: 'نيزك', textEn: 'Meteor', category: 'space', difficulty: 'EASY' },
  { id: 'w89', textAr: 'قمر', textEn: 'Moon', category: 'space', difficulty: 'EASY' },
  { id: 'w90', textAr: 'شمس', textEn: 'Sun', category: 'space', difficulty: 'EASY' },
  { id: 'w91', textAr: 'سديم', textEn: 'Nebula', category: 'space', difficulty: 'MEDIUM' },
  { id: 'w92', textAr: 'مشتري', textEn: 'Jupiter', category: 'space', difficulty: 'MEDIUM' },
  { id: 'w93', textAr: 'مريخ', textEn: 'Mars', category: 'space', difficulty: 'EASY' },
  { id: 'w94', textAr: 'زحل', textEn: 'Saturn', category: 'space', difficulty: 'EASY' },
  { id: 'w95', textAr: 'جاذبية', textEn: 'Gravity', category: 'space', difficulty: 'MEDIUM' },

  // --- Fun, Sports & Dynamic Action (رياضة وحركة) ---
  { id: 'w96', textAr: 'هدف', textEn: 'Goal', category: 'sports', difficulty: 'EASY' },
  { id: 'w97', textAr: 'ملعب', textEn: 'Stadium', category: 'sports', difficulty: 'EASY' },
  { id: 'w98', textAr: 'مهاجم', textEn: 'Striker', category: 'sports', difficulty: 'EASY' },
  { id: 'w99', textAr: 'حارس', textEn: 'Goalkeeper', category: 'sports', difficulty: 'MEDIUM' },
  { id: 'w100', textAr: 'بطولة', textEn: 'Tournament', category: 'sports', difficulty: 'EASY' },
  { id: 'w101', textAr: 'ميدالية', textEn: 'Medal', category: 'sports', difficulty: 'MEDIUM' },
  { id: 'w102', textAr: 'مباراة', textEn: 'Match', category: 'sports', difficulty: 'EASY' },
  { id: 'w103', textAr: 'مدرب', textEn: 'Coach', category: 'sports', difficulty: 'EASY' },
  { id: 'w104', textAr: 'هاتريك', textEn: 'Hattrick', category: 'sports', difficulty: 'MEDIUM' },
  { id: 'w105', textAr: 'صافرة', textEn: 'Whistle', category: 'sports', difficulty: 'EASY' },

  // --- Arabic Vocabulary & Expressive Gems (مفردات عربية فريدة) ---
  { id: 'w106', textAr: 'فروسية', textEn: 'Chivalry', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w107', textAr: 'شجاعة', textEn: 'Bravery', category: 'general', difficulty: 'EASY' },
  { id: 'w108', textAr: 'عزيمة', textEn: 'Determination', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w109', textAr: 'طموح', textEn: 'Ambition', category: 'general', difficulty: 'EASY' },
  { id: 'w110', textAr: 'فطنة', textEn: 'Acumen', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w111', textAr: 'بصيرة', textEn: 'Insight', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w112', textAr: 'حكمة', textEn: 'Wisdom', category: 'general', difficulty: 'EASY' },
  { id: 'w113', textAr: 'شهامة', textEn: 'Nobility', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w114', textAr: 'براعة', textEn: 'Mastery', category: 'general', difficulty: 'EASY' },
  { id: 'w115', textAr: 'فصاحة', textEn: 'Eloquence', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w116', textAr: 'مروءة', textEn: 'Virtue', category: 'general', difficulty: 'HARD' },
  { id: 'w117', textAr: 'ابتكار', textEn: 'Innovation', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w118', textAr: 'مهارة', textEn: 'Skill', category: 'general', difficulty: 'EASY' },
  { id: 'w119', textAr: 'تألق', textEn: 'Brilliance', category: 'general', difficulty: 'MEDIUM' },
  { id: 'w120', textAr: 'إبداع', textEn: 'Creativity', category: 'general', difficulty: 'EASY' }
];

/**
 * Returns a random single word based on language mode (AR, EN, or MIXED)
 */
export function getRandomWord(
  languageMode: 'AR' | 'EN' | 'MIXED' = 'AR',
  excludeIds: string[] = []
): { word: ITypeRaceWord; displayWord: string } {
  const available = TYPE_RACE_WORDS.filter((w) => !excludeIds.includes(w.id));
  const pool = available.length > 0 ? available : TYPE_RACE_WORDS;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  let displayWord: string;
  if (languageMode === 'EN') {
    displayWord = picked.textEn;
  } else if (languageMode === 'MIXED') {
    // 50% chance Arabic, 50% chance English
    displayWord = Math.random() < 0.5 ? picked.textAr : picked.textEn;
  } else {
    displayWord = picked.textAr;
  }

  return { word: picked, displayWord };
}
