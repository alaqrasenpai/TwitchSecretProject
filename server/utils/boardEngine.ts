import type {
  IBoardPartyState,
  IBoardTile,
  ITeamState,
  IMinigameState,
  IDirectionChoice,
  TeamId,
  MoveDirection,
  IPlayer,
  IGameLog,
  ITriviaQuestion
} from '~/types/game';
import { TRIVIA_QUESTIONS_BANK } from './triviaBank';

export const TEAM_ORDER: TeamId[] = ['crimson', 'cobalt', 'emerald', 'amber'];

export const INITIAL_TEAMS: Record<TeamId, ITeamState> = {
  crimson: {
    id: 'crimson',
    nameAr: 'الفريق القرمزي (Crimson)',
    nameEn: 'Crimson Knight',
    color: '#ef4444',
    badgeClass: 'bg-red-950 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    icon: '🔴',
    pawnIcon: '👑',
    characterType: 'knight',
    coins: 30,
    trophies: 0,
    tileIndex: 0,
    previousTileIndex: 0,
    membersCount: 0,
    lastRoll: null,
    enabled: true
  },
  cobalt: {
    id: 'cobalt',
    nameAr: 'الفريق الأزرق (Cobalt)',
    nameEn: 'Cobalt Boxhead',
    color: '#3b82f6',
    badgeClass: 'bg-blue-950 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    icon: '🔵',
    pawnIcon: '⚡',
    characterType: 'boxhead',
    coins: 30,
    trophies: 0,
    tileIndex: 0,
    previousTileIndex: 0,
    membersCount: 0,
    lastRoll: null,
    enabled: true
  },
  emerald: {
    id: 'emerald',
    nameAr: 'الفريق الزمردي (Emerald)',
    nameEn: 'Emerald Panda',
    color: '#10b981',
    badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    icon: '🟢',
    pawnIcon: '🛡️',
    characterType: 'panda',
    coins: 30,
    trophies: 0,
    tileIndex: 0,
    previousTileIndex: 0,
    membersCount: 0,
    lastRoll: null,
    enabled: true
  },
  amber: {
    id: 'amber',
    nameAr: 'الفريق الكهرماني (Amber)',
    nameEn: 'Amber Beast',
    color: '#f59e0b',
    badgeClass: 'bg-amber-950 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    icon: '🟡',
    pawnIcon: '⭐',
    characterType: 'beast',
    coins: 30,
    trophies: 0,
    tileIndex: 0,
    previousTileIndex: 0,
    membersCount: 0,
    lastRoll: null,
    enabled: true
  }
};

/**
 * MAP 1: WINTER OUTPOST (القمة الثلجية)
 * Authentic Pummel Party Snow Mountain Map Layout
 */
export const WINTER_OUTPOST_TILES: IBoardTile[] = [
  {
    index: 0,
    x: 28,
    y: 68,
    type: 'START',
    nameAr: 'نقطة الانطلاق الثلجية',
    nameEn: 'Glacier Outpost Start',
    icon: '🏁',
    descriptionAr: 'منطقة البداية الآمنة لجميع الفرق في القمة الثلجية',
    descriptionEn: 'Safe starting zone on the snow mountain',
    neighbors: { left: 1, up: 18, right: 38 }
  },
  {
    index: 1,
    x: 20,
    y: 77,
    type: 'COIN_10',
    nameAr: 'ممر الجليد الجنوبي',
    nameEn: 'South Ice Trail',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 مفاتيح/عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 2, right: 0 }
  },
  {
    index: 2,
    x: 12,
    y: 84,
    type: 'COIN_20',
    nameAr: 'كهف الياقوت',
    nameEn: 'Ruby Cave',
    icon: '💰',
    descriptionAr: 'كنز جليدي يمنح +20 عملة',
    descriptionEn: 'Massive treasure grants +20 coins',
    neighbors: { left: 3, right: 1 }
  },
  {
    index: 3,
    x: 6,
    y: 74,
    type: 'EVENT',
    nameAr: 'صندوق الثلوج',
    nameEn: 'Frost Box',
    icon: '❗',
    descriptionAr: 'حدث مفاجئ يمنح مكافأة +15 عملة',
    descriptionEn: 'Mystery event gives +15 coins',
    neighbors: { up: 4, down: 2 }
  },
  {
    index: 4,
    x: 5,
    y: 60,
    type: 'TRAP',
    nameAr: 'فخ الانهيار الجليدي',
    nameEn: 'Avalanche Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات من الفريق',
    descriptionEn: 'Avalanche deducts -10 coins',
    neighbors: { up: 5, down: 3 }
  },
  {
    index: 5,
    x: 7,
    y: 47,
    type: 'COIN_10',
    nameAr: 'صخور الجليد',
    nameEn: 'Glacier Rocks',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { up: 6, down: 4 }
  },
  {
    index: 6,
    x: 11,
    y: 35,
    type: 'SHOP',
    nameAr: 'محطة الإمداد الجليدية',
    nameEn: 'Frost Outpost Shop',
    icon: '➕',
    descriptionAr: 'تزود الفريق بمكافأة استثمارية +15 عملة',
    descriptionEn: 'Supply shop awards +15 coins',
    neighbors: { up: 7, down: 5 }
  },
  {
    index: 7,
    x: 13,
    y: 25,
    type: 'EVENT',
    nameAr: 'مفترق القمة الغربية',
    nameEn: 'West Ridge Fork',
    icon: '❗',
    descriptionAr: 'مفترق طرق! صوتوا في الشات: أعلى للقمة، أو يمين للاختصار!',
    descriptionEn: 'Intersection! Up to outer ridge or right into inner crevasse!',
    neighbors: { up: 8, right: 14 }
  },
  {
    index: 8,
    x: 18,
    y: 16,
    type: 'COIN_10',
    nameAr: 'طريق القمة',
    nameEn: 'Peak Path',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 9, down: 7 }
  },
  {
    index: 9,
    x: 25,
    y: 11,
    type: 'TRAP',
    nameAr: 'فخ الرياح العاتية',
    nameEn: 'Blizzard Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { right: 10, left: 8 }
  },
  {
    index: 10,
    x: 33,
    y: 10,
    type: 'EVENT',
    nameAr: 'مفترق الشلال المتجمد',
    nameEn: 'Frozen Falls Fork',
    icon: '❗',
    descriptionAr: 'مفترق طرق نحو كهف الكريستال أو الهبوط للممر الأوسط',
    descriptionEn: 'Fork to Crystal Cave or descent to middle corridor',
    neighbors: { right: 11, down: 17 }
  },
  {
    index: 11,
    x: 40,
    y: 11,
    type: 'COIN_10',
    nameAr: 'ممشى الكهف',
    nameEn: 'Cavern Walk',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 12, left: 10 }
  },
  {
    index: 12,
    x: 46,
    y: 13,
    type: 'COIN_20',
    nameAr: 'كنز الكريستال',
    nameEn: 'Crystal Treasure',
    icon: '💰',
    descriptionAr: 'كنز كبير +20 عملة',
    descriptionEn: 'Treasure grants +20 coins',
    neighbors: { right: 13, left: 11 }
  },
  {
    index: 13,
    x: 50,
    y: 16,
    type: 'COIN_20',
    nameAr: 'كهف الكريستال المتوهج (Ice Crystal Cavern)',
    nameEn: 'Ice Crystal Cavern',
    icon: '🏆',
    descriptionAr: 'قمة الجبل الجليدي وموقع ظهور الكأس الأسطوري!',
    descriptionEn: 'The radiant ice crystal peak where the trophy shines!',
    neighbors: { down: 20, right: 26, left: 12 }
  },
  {
    index: 14,
    x: 18,
    y: 33,
    type: 'SHOP',
    nameAr: 'ممر الشق الجليدي',
    nameEn: 'Crevasse Path',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على مكافأة +15 عملة',
    descriptionEn: 'Crevasse bonus +15 coins',
    neighbors: { right: 15, left: 7 }
  },
  {
    index: 15,
    x: 23,
    y: 40,
    type: 'COIN_10',
    nameAr: 'جسر الجليد الهش',
    nameEn: 'Fragile Ice Bridge',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 16, left: 14 }
  },
  {
    index: 16,
    x: 28,
    y: 44,
    type: 'TRAP',
    nameAr: 'فخ الجليد الرقيق',
    nameEn: 'Thin Ice Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { down: 18, up: 17, left: 15 }
  },
  {
    index: 17,
    x: 29,
    y: 28,
    type: 'COIN_10',
    nameAr: 'ممر المنحدر الأوسط',
    nameEn: 'Mid Slope Corridor',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { down: 16, up: 10 }
  },
  {
    index: 18,
    x: 27,
    y: 58,
    type: 'EVENT',
    nameAr: 'ملتقى الوديان الجليدية',
    nameEn: 'Valley Junction',
    icon: '❗',
    descriptionAr: 'مفترق طرق يربط الشق الجليدي بنقطة الانطلاق',
    descriptionEn: 'Junction linking crevasse shortcut to start hub',
    neighbors: { down: 0, up: 16, right: 19 }
  },
  {
    index: 19,
    x: 36,
    y: 63,
    type: 'COIN_10',
    nameAr: 'طريق الجسر المعلق',
    nameEn: 'Suspension Bridge Road',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 25, left: 18 }
  },
  {
    index: 20,
    x: 57,
    y: 24,
    type: 'COIN_10',
    nameAr: 'مدخل جسر السكة الحديدية',
    nameEn: 'Railway Bridge North',
    icon: '🗝️',
    descriptionAr: 'بداية جسر السكة الحديدية الخشبي المعلق',
    descriptionEn: 'Wooden railway bridge entrance',
    neighbors: { down: 21, up: 13 }
  },
  {
    index: 21,
    x: 57,
    y: 33,
    type: 'TRAP',
    nameAr: 'فخ ألواح الخشب',
    nameEn: 'Loose Plank Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { down: 22, up: 20 }
  },
  {
    index: 22,
    x: 57,
    y: 43,
    type: 'EVENT',
    nameAr: 'فانوس الجسر الأوسط',
    nameEn: 'Mid Bridge Lantern',
    icon: '❗',
    descriptionAr: 'حدث مفاجئ +15 عملة',
    descriptionEn: 'Mystery event +15 coins',
    neighbors: { down: 23, up: 21, right: 35 }
  },
  {
    index: 23,
    x: 57,
    y: 53,
    type: 'COIN_20',
    nameAr: 'كنز برج المراقبة',
    nameEn: 'Watchtower Treasure',
    icon: '💰',
    descriptionAr: 'كنز يمنح +20 عملة',
    descriptionEn: 'Treasure grants +20 coins',
    neighbors: { down: 24, up: 22 }
  },
  {
    index: 24,
    x: 57,
    y: 63,
    type: 'COIN_10',
    nameAr: 'مصباح الجسر الجنوبي',
    nameEn: 'South Bridge Lamp',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { down: 25, up: 23 }
  },
  {
    index: 25,
    x: 57,
    y: 73,
    type: 'SHOP',
    nameAr: 'قاعدة الجسر الكبرى',
    nameEn: 'Bridge Base Hub',
    icon: '➕',
    descriptionAr: 'مفترق استراتيجي! صوتوا يساراً للجليد أو يميناً لكوخ الغابة!',
    descriptionEn: 'Grand intersection! Left to glacier or right to cozy forest cabin!',
    neighbors: { left: 19, right: 36, up: 24 }
  },
  {
    index: 26,
    x: 64,
    y: 16,
    type: 'SHOP',
    nameAr: 'ممر أشجار الصنوبر',
    nameEn: 'Pine Forest Path',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على مكافأة +15 عملة',
    descriptionEn: 'Forest bonus +15 coins',
    neighbors: { right: 27, left: 13 }
  },
  {
    index: 27,
    x: 71,
    y: 15,
    type: 'COIN_10',
    nameAr: 'منحدر الصنوبر',
    nameEn: 'Pine Slope',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 28, left: 26 }
  },
  {
    index: 28,
    x: 79,
    y: 16,
    type: 'EVENT',
    nameAr: 'مفترق الغابة الشرقية',
    nameEn: 'East Forest Fork',
    icon: '❗',
    descriptionAr: 'مفترق طرق! يمين للدوران حول الصخور، أو أسفل نحو المخيم!',
    descriptionEn: 'Intersection! Right around boulders or down towards camp!',
    neighbors: { right: 29, down: 34 }
  },
  {
    index: 29,
    x: 87,
    y: 20,
    type: 'COIN_10',
    nameAr: 'صخرة الدب الثلجي',
    nameEn: 'Polar Bear Rock',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 30, left: 28 }
  },
  {
    index: 30,
    x: 93,
    y: 30,
    type: 'TRAP',
    nameAr: 'فخ الأشواك المتجمدة',
    nameEn: 'Frost Thorn Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { down: 31, left: 29 }
  },
  {
    index: 31,
    x: 94,
    y: 44,
    type: 'EVENT',
    nameAr: 'صندوق الغابة المفقود',
    nameEn: 'Lost Forest Box',
    icon: '❗',
    descriptionAr: 'حدث مفاجئ يمنح +15 عملة',
    descriptionEn: 'Mystery event +15 coins',
    neighbors: { down: 32, up: 30 }
  },
  {
    index: 32,
    x: 91,
    y: 56,
    type: 'SHOP',
    nameAr: 'متجر الحطاب',
    nameEn: 'Lumberjack Shop',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على مكافأة +15 عملة',
    descriptionEn: 'Shop bonus +15 coins',
    neighbors: { down: 33, up: 31 }
  },
  {
    index: 33,
    x: 84,
    y: 65,
    type: 'COIN_10',
    nameAr: 'ممر الحطب',
    nameEn: 'Firewood Path',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 36, up: 32 }
  },
  {
    index: 34,
    x: 79,
    y: 28,
    type: 'COIN_10',
    nameAr: 'ممر المخيم السري',
    nameEn: 'Secret Camp Path',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { down: 35, up: 28 }
  },
  {
    index: 35,
    x: 73,
    y: 38,
    type: 'EVENT',
    nameAr: 'مفترق مخيم الحطابين',
    nameEn: 'Campfire Fork',
    icon: '❗',
    descriptionAr: 'مفترق طرق يربط المخيم بالجسر الخشبي أو الكوخ الجنوبي',
    descriptionEn: 'Fork linking campfire to wooden bridge or south cabin',
    neighbors: { left: 22, down: 36 }
  },
  {
    index: 36,
    x: 71,
    y: 73,
    type: 'COIN_20',
    nameAr: 'كوخ الغابة الدافئ (Cozy Forest Cabin)',
    nameEn: 'Cozy Forest Cabin',
    icon: '💰',
    descriptionAr: 'كنز الكوخ الخشبي الدافئ يمنح +20 عملة',
    descriptionEn: 'Cozy cabin treasure grants +20 coins',
    neighbors: { left: 25, right: 33, up: 35 }
  },
  {
    index: 37,
    x: 48,
    y: 81,
    type: 'COIN_10',
    nameAr: 'ممر الأودية الجنوبية',
    nameEn: 'South Valley Path',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 38, right: 25 }
  },
  {
    index: 38,
    x: 38,
    y: 77,
    type: 'SHOP',
    nameAr: 'مستودع الجليد الغربي',
    nameEn: 'West Ice Depot',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على مكافأة +15 عملة',
    descriptionEn: 'Depot bonus +15 coins',
    neighbors: { left: 0, right: 37 }
  }
];

/**
 * MAP 2: SUBURBIA TOWN (حي الضواحي)
 * Authentic Pummel Party Neighborhood Map Layout
 */
export const SUBURBIA_TOWN_TILES: IBoardTile[] = [
  {
    index: 0,
    x: 45,
    y: 42,
    type: 'START',
    nameAr: 'نقطة الانطلاق (وسط حي الضواحي)',
    nameEn: 'Town Center Start',
    icon: '🏁',
    descriptionAr: 'منطقة البداية الآمنة لجميع الفرق في تقاطع الشارع الرئيسي',
    descriptionEn: 'Safe start zone at main town crossroads',
    neighbors: { up: 1, down: 7, left: 13, right: 17 }
  },
  {
    index: 1,
    x: 45,
    y: 31,
    type: 'COIN_10',
    nameAr: 'شارع الضواحي الشمالي',
    nameEn: 'North Boulevard',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { up: 2, down: 0 }
  },
  {
    index: 2,
    x: 45,
    y: 20,
    type: 'EVENT',
    nameAr: 'بوابة حديقة الحي',
    nameEn: 'Community Garden Gate',
    icon: '❗',
    descriptionAr: 'مفترق طرق! أعلى للحديقة، يسار للمنازل، يمين للكنيسة!',
    descriptionEn: 'Fork! Up into garden, left to houses, or right to church!',
    neighbors: { up: 3, left: 15, right: 19 }
  },
  {
    index: 3,
    x: 50,
    y: 11,
    type: 'SHOP',
    nameAr: 'مشتل الزهور',
    nameEn: 'Flower Nursery',
    icon: '➕',
    descriptionAr: 'مكافأة حديقة الزهور +15 عملة',
    descriptionEn: 'Garden bonus +15 coins',
    neighbors: { right: 4, down: 2 }
  },
  {
    index: 4,
    x: 58,
    y: 11,
    type: 'TRAP',
    nameAr: 'فخ رشاشات المياه',
    nameEn: 'Sprinkler Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { down: 5, left: 3 }
  },
  {
    index: 5,
    x: 58,
    y: 22,
    type: 'COIN_20',
    nameAr: 'صندوق أدوات البستنة',
    nameEn: 'Garden Tool Treasure',
    icon: '💰',
    descriptionAr: 'كنز يمنح الفريق +20 عملة',
    descriptionEn: 'Treasure grants +20 coins',
    neighbors: { down: 6, up: 4 }
  },
  {
    index: 6,
    x: 60,
    y: 31,
    type: 'SHOP',
    nameAr: 'مخرج الحديقة الشرقي',
    nameEn: 'Garden East Exit',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على +15 عملة',
    descriptionEn: 'Exit bonus +15 coins',
    neighbors: { down: 18, up: 5 }
  },
  {
    index: 7,
    x: 45,
    y: 55,
    type: 'COIN_10',
    nameAr: 'شارع الضواحي الجنوبي',
    nameEn: 'South Boulevard',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { down: 8, up: 0 }
  },
  {
    index: 8,
    x: 45,
    y: 67,
    type: 'EVENT',
    nameAr: 'تقاطع المقبرة والشارع الجنوبي',
    nameEn: 'South Cemetery Fork',
    icon: '❗',
    descriptionAr: 'مفترق طرق! يسار للمنازل، أسفل للمتجر، يمين للمقبرة المسكونة!',
    descriptionEn: 'Fork! Left to houses, down to shop, or right to spooky cemetery!',
    neighbors: { left: 9, down: 10, right: 28 }
  },
  {
    index: 9,
    x: 37,
    y: 67,
    type: 'COIN_10',
    nameAr: 'ممر المشاة الجنوبي',
    nameEn: 'South Crosswalk',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 35, right: 8 }
  },
  {
    index: 10,
    x: 45,
    y: 79,
    type: 'SHOP',
    nameAr: 'محطة الوقود الجنوبية',
    nameEn: 'South Gas Station',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على +15 عملة',
    descriptionEn: 'Station bonus +15 coins',
    neighbors: { down: 11, up: 8 }
  },
  {
    index: 11,
    x: 41,
    y: 89,
    type: 'COIN_20',
    nameAr: 'كنز الموقف الجنوبي',
    nameEn: 'South Lot Treasure',
    icon: '💰',
    descriptionAr: 'كنز يمنح +20 عملة',
    descriptionEn: 'Treasure gives +20 coins',
    neighbors: { left: 12, up: 10 }
  },
  {
    index: 12,
    x: 31,
    y: 89,
    type: 'COIN_10',
    nameAr: 'طريق الرصيف الجنوبي',
    nameEn: 'South Curb Road',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { up: 35, right: 11 }
  },
  {
    index: 13,
    x: 36,
    y: 42,
    type: 'COIN_10',
    nameAr: 'ممر المشاة الأوسط',
    nameEn: 'Mid Zebra Crosswalk',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 14, right: 0 }
  },
  {
    index: 14,
    x: 26,
    y: 42,
    type: 'SHOP',
    nameAr: 'رصيف الحي السكني',
    nameEn: 'Residential Sidewalk',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على +15 عملة',
    descriptionEn: 'Sidewalk bonus +15 coins',
    neighbors: { up: 37, down: 36, right: 13 }
  },
  {
    index: 15,
    x: 36,
    y: 20,
    type: 'COIN_10',
    nameAr: 'ممر المشاة الشمالي',
    nameEn: 'North Zebra Crosswalk',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 16, right: 2 }
  },
  {
    index: 16,
    x: 26,
    y: 20,
    type: 'EVENT',
    nameAr: 'حديقة المنزل الشمالي',
    nameEn: 'North Lawn',
    icon: '❗',
    descriptionAr: 'حدث مفاجئ +15 عملة',
    descriptionEn: 'Mystery event +15 coins',
    neighbors: { down: 38, up: 39, right: 15 }
  },
  {
    index: 17,
    x: 54,
    y: 42,
    type: 'COIN_10',
    nameAr: 'شارع الكنيسة الرئيسي',
    nameEn: 'Church Boulevard',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 18, left: 0 }
  },
  {
    index: 18,
    x: 63,
    y: 42,
    type: 'COIN_20',
    nameAr: 'ساحة الكنيسة الكبرى',
    nameEn: 'Church Square',
    icon: '💰',
    descriptionAr: 'كنز ساحة الكنيسة يمنح +20 عملة',
    descriptionEn: 'Church square treasure +20 coins',
    neighbors: { right: 19, left: 17, up: 6 }
  },
  {
    index: 19,
    x: 72,
    y: 42,
    type: 'EVENT',
    nameAr: 'مفترق الحي التجاري',
    nameEn: 'Commercial Fork',
    icon: '❗',
    descriptionAr: 'مفترق طرق! أعلى للمتجر، أسفل للمقبرة، يمين للمطعم!',
    descriptionEn: 'Fork! Up to store, down to graveyard, right to diner!',
    neighbors: { up: 20, down: 22, right: 24, left: 18 }
  },
  {
    index: 20,
    x: 72,
    y: 29,
    type: 'COIN_10',
    nameAr: 'طريق الكنيسة الشمالي',
    nameEn: 'North Church Path',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 21, down: 19 }
  },
  {
    index: 21,
    x: 81,
    y: 29,
    type: 'SHOP',
    nameAr: 'متجر الضواحي',
    nameEn: 'Town General Store',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على +15 عملة',
    descriptionEn: 'Store bonus +15 coins',
    neighbors: { down: 23, left: 20 }
  },
  {
    index: 22,
    x: 72,
    y: 55,
    type: 'TRAP',
    nameAr: 'فخ حفرة الطريق',
    nameEn: 'Pothole Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { down: 27, up: 19 }
  },
  {
    index: 23,
    x: 81,
    y: 42,
    type: 'COIN_10',
    nameAr: 'ممر المطعم',
    nameEn: 'Diner Alley',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { down: 24, up: 21 }
  },
  {
    index: 24,
    x: 89,
    y: 55,
    type: 'COIN_20',
    nameAr: 'مطعم الوجبات السريعة (Diner)',
    nameEn: 'Suburbia Diner',
    icon: '💰',
    descriptionAr: 'كنز المطعم يمنح الفريق +20 عملة',
    descriptionEn: 'Diner treasure grants +20 coins',
    neighbors: { down: 25, left: 19 }
  },
  {
    index: 25,
    x: 93,
    y: 65,
    type: 'SHOP',
    nameAr: 'موقف المطعم الشرقي',
    nameEn: 'East Diner Parking',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على +15 عملة',
    descriptionEn: 'Parking bonus +15 coins',
    neighbors: { down: 26, up: 24 }
  },
  {
    index: 26,
    x: 89,
    y: 78,
    type: 'TRAP',
    nameAr: 'فخ الأسلاك الشائكة',
    nameEn: 'Barbed Wire Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { left: 27, up: 25 }
  },
  {
    index: 27,
    x: 80,
    y: 80,
    type: 'COIN_10',
    nameAr: 'ممر المقبرة الشرقي',
    nameEn: 'Graveyard East Gate',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 32, up: 22 }
  },
  {
    index: 28,
    x: 54,
    y: 68,
    type: 'EVENT',
    nameAr: 'بوابة المقبرة المسكونة (Spooky Cemetery Gate)',
    nameEn: 'Spooky Cemetery Gate',
    icon: '❗',
    descriptionAr: 'مفترق طرق المقبرة! صوتوا للدخول حول الشجرة الميتة أو السور!',
    descriptionEn: 'Cemetery Fork! Enter inner dead tree circle or outer fence!',
    neighbors: { right: 29, left: 8 }
  },
  {
    index: 29,
    x: 60,
    y: 72,
    type: 'TRAP',
    nameAr: 'فخ شواهد القبور',
    nameEn: 'Tombstone Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { right: 30, down: 33, left: 28 }
  },
  {
    index: 30,
    x: 67,
    y: 67,
    type: 'COIN_20',
    nameAr: 'الشجرة الميتة العتيقة (Haunted Dead Tree)',
    nameEn: 'Haunted Dead Tree',
    icon: '🏆',
    descriptionAr: 'قلب المقبرة المسكونة حيث يتوهج الكأس الأسطوري!',
    descriptionEn: 'The haunted cemetery core where the trophy shines!',
    neighbors: { right: 31, left: 29 }
  },
  {
    index: 31,
    x: 72,
    y: 73,
    type: 'SHOP',
    nameAr: 'الضريح الحجري القديم',
    nameEn: 'Ancient Crypt',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على مكافأة +15 عملة',
    descriptionEn: 'Crypt bonus +15 coins',
    neighbors: { down: 32, left: 30 }
  },
  {
    index: 32,
    x: 68,
    y: 82,
    type: 'COIN_10',
    nameAr: 'ممر شواهد القبور الجنوبي',
    nameEn: 'South Crypt Trail',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { left: 33, right: 27, up: 31 }
  },
  {
    index: 33,
    x: 58,
    y: 84,
    type: 'EVENT',
    nameAr: 'بوابة المقبرة الخلفية',
    nameEn: 'Graveyard Back Gate',
    icon: '❗',
    descriptionAr: 'حدث مفاجئ +15 عملة',
    descriptionEn: 'Mystery event +15 coins',
    neighbors: { up: 29, left: 8 }
  },
  {
    index: 34,
    x: 26,
    y: 76,
    type: 'COIN_10',
    nameAr: 'رصيف المنزل الجنوبي',
    nameEn: 'South House Porch',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { up: 35, down: 12 }
  },
  {
    index: 35,
    x: 26,
    y: 64,
    type: 'SHOP',
    nameAr: 'مدخل السيارات',
    nameEn: 'Driveway',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على +15 عملة',
    descriptionEn: 'Driveway bonus +15 coins',
    neighbors: { up: 36, down: 34, right: 9 }
  },
  {
    index: 36,
    x: 26,
    y: 52,
    type: 'COIN_20',
    nameAr: 'شرفة المنزل الأزرق',
    nameEn: 'Blue House Porch',
    icon: '💰',
    descriptionAr: 'كنز الشرفة يمنح الفريق +20 عملة',
    descriptionEn: 'Porch treasure grants +20 coins',
    neighbors: { up: 14, down: 35 }
  },
  {
    index: 37,
    x: 26,
    y: 33,
    type: 'COIN_10',
    nameAr: 'ممشى الحديقة الأمامية',
    nameEn: 'Front Yard Walk',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { up: 38, down: 14 }
  },
  {
    index: 38,
    x: 26,
    y: 20,
    type: 'TRAP',
    nameAr: 'فخ كلب الجيران',
    nameEn: 'Guard Dog Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { up: 39, down: 37, right: 16 }
  },
  {
    index: 39,
    x: 26,
    y: 10,
    type: 'EVENT',
    nameAr: 'مفترق الحديقة الخلفية',
    nameEn: 'Backyard Fork',
    icon: '❗',
    descriptionAr: 'مفترق طرق! يمين للشارع الشمالي، أو يسار للحديقة الخلفية للمنازل!',
    descriptionEn: 'Fork! Right to north street, or left around the houses backyard!',
    neighbors: { right: 2, left: 40 }
  },
  {
    index: 40,
    x: 17,
    y: 16,
    type: 'COIN_10',
    nameAr: 'سور الحديقة الخلفية',
    nameEn: 'Backyard Fence Path',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { down: 41, right: 39 }
  },
  {
    index: 41,
    x: 10,
    y: 28,
    type: 'SHOP',
    nameAr: 'كوخ الأدوات الخلفي',
    nameEn: 'Backyard Shed',
    icon: '➕',
    descriptionAr: 'يحصل الفريق على +15 عملة',
    descriptionEn: 'Shed bonus +15 coins',
    neighbors: { down: 42, up: 40 }
  },
  {
    index: 42,
    x: 8,
    y: 44,
    type: 'COIN_20',
    nameAr: 'خزان المياه القديم',
    nameEn: 'Water Tank Treasure',
    icon: '💰',
    descriptionAr: 'كنز كبير +20 عملة',
    descriptionEn: 'Treasure grants +20 coins',
    neighbors: { down: 43, up: 41 }
  },
  {
    index: 43,
    x: 8,
    y: 60,
    type: 'TRAP',
    nameAr: 'فخ الطين الخلفي',
    nameEn: 'Mud Puddle Trap',
    icon: '☠️',
    descriptionAr: 'فخ يخصم -10 عملات',
    descriptionEn: 'Trap deducts -10 coins',
    neighbors: { down: 44, up: 42 }
  },
  {
    index: 44,
    x: 13,
    y: 75,
    type: 'COIN_10',
    nameAr: 'مخرج الحديقة الخلفية',
    nameEn: 'Backyard Exit',
    icon: '🗝️',
    descriptionAr: 'يحصل الفريق على +10 عملات',
    descriptionEn: 'Team earns +10 keys',
    neighbors: { right: 34, up: 43 }
  }
];

export function getTilesForMap(mapTheme?: 'winter_outpost' | 'suburbia_town'): IBoardTile[] {
  if (mapTheme === 'suburbia_town') {
    return JSON.parse(JSON.stringify(SUBURBIA_TOWN_TILES));
  }
  return JSON.parse(JSON.stringify(WINTER_OUTPOST_TILES));
}

export function createInitialBoardPartyState(mapTheme: 'winter_outpost' | 'suburbia_town' = 'winter_outpost'): IBoardPartyState {
  const initialTeams: Record<TeamId, ITeamState> = JSON.parse(JSON.stringify(INITIAL_TEAMS));
  const tiles: IBoardTile[] = getTilesForMap(mapTheme);
  const trophyTileIndex = mapTheme === 'suburbia_town' ? 30 : 13;

  return {
    status: 'LOBBY',
    activeTeamId: 'crimson',
    activeTurnIndex: 0,
    roundNumber: 1,
    maxRounds: 5,
    tiles,
    teams: initialTeams,
    trophyTileIndex,
    trophyPrice: 30,
    lastDiceRoll: null,
    remainingSteps: 0,
    isRollingDice: false,
    directionChoice: null,
    lastTileEventMessage: null,
    minigameState: null,
    mapTheme,
    winnerTeamId: null
  };
}

export function setBoardMap(
  state: IBoardPartyState,
  mapTheme: 'winter_outpost' | 'suburbia_town'
): { logs: Partial<IGameLog>[] } {
  state.mapTheme = mapTheme;
  state.tiles = getTilesForMap(mapTheme);
  state.trophyTileIndex = mapTheme === 'suburbia_town' ? 30 : 13;

  for (const teamId of TEAM_ORDER) {
    if (state.teams[teamId]) {
      state.teams[teamId].tileIndex = 0;
      state.teams[teamId].previousTileIndex = 0;
    }
  }

  const mapNameAr = mapTheme === 'suburbia_town' ? 'حي الضواحي (Suburbia Town)' : 'القمة الثلجية (Winter Outpost)';
  const logs: Partial<IGameLog>[] = [
    {
      id: `map-change-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: `🗺️ تم تغيير خريطة بامل بارتي إلى: ${mapNameAr}!`
    }
  ];

  return { logs };
}

export function getEnabledTeams(state: IBoardPartyState): TeamId[] {
  return TEAM_ORDER.filter((id) => state.teams[id] && state.teams[id].enabled);
}

export function getActiveTeamsWithPlayers(state: IBoardPartyState, players: IPlayer[]): TeamId[] {
  const enabled = getEnabledTeams(state);
  const withPlayers = enabled.filter((id) => players.some((p) => p.team === id));
  return withPlayers.length > 0 ? withPlayers : enabled;
}

export function toggleTeamEnabled(
  state: IBoardPartyState,
  teamId: TeamId,
  enabled: boolean,
  players?: IPlayer[]
): boolean {
  if (!state.teams[teamId]) return false;

  const currentEnabled = getEnabledTeams(state);
  if (!enabled && currentEnabled.length <= 2 && currentEnabled.includes(teamId)) {
    return false;
  }

  state.teams[teamId].enabled = enabled;

  if (players && !enabled) {
    const remainingEnabled = getEnabledTeams(state);
    players.forEach((p) => {
      if (p.team === teamId) {
        p.team = remainingEnabled[Math.floor(Math.random() * remainingEnabled.length)];
      }
    });
    TEAM_ORDER.forEach((id) => {
      if (state.teams[id]) {
        state.teams[id].membersCount = players.filter((p) => p.team === id).length;
      }
    });
  }

  const activeEnabled = getEnabledTeams(state);
  if (!activeEnabled.includes(state.activeTeamId)) {
    state.activeTeamId = activeEnabled[0];
    state.activeTurnIndex = 0;
  }

  return true;
}

export function shufflePlayersAcrossTeams(
  players: IPlayer[],
  state: IBoardPartyState
): { logs: Partial<IGameLog>[] } {
  const enabledTeams = getEnabledTeams(state);
  if (enabledTeams.length === 0) return { logs: [] };

  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  shuffledPlayers.forEach((player, idx) => {
    player.team = enabledTeams[idx % enabledTeams.length];
  });

  TEAM_ORDER.forEach((teamId) => {
    if (state.teams[teamId]) {
      state.teams[teamId].membersCount = players.filter((p) => p.team === teamId).length;
    }
  });

  const logs: Partial<IGameLog>[] = [
    {
      id: `shuffle-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: `🔀 قام الستريمر بخلط وتوزيع جميع اللاعبين (${players.length} لاعب) بالتساوي بين الفرق النشطة!`
    }
  ];

  return { logs };
}

export function assignPlayerToNextTeam(
  players: IPlayer[],
  state?: IBoardPartyState
): TeamId {
  const enabledTeams = state ? getEnabledTeams(state) : TEAM_ORDER;
  const counts: Record<TeamId, number> = { crimson: 0, cobalt: 0, emerald: 0, amber: 0 };

  players.forEach((p) => {
    if (p.team && counts[p.team] !== undefined) {
      counts[p.team]++;
    }
  });

  let lowestTeam: TeamId = enabledTeams[0] || 'crimson';
  let lowestCount = Infinity;

  for (const teamId of enabledTeams) {
    if (counts[teamId] < lowestCount) {
      lowestCount = counts[teamId];
      lowestTeam = teamId;
    }
  }

  return lowestTeam;
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function getAvailableDirections(
  tile: IBoardTile,
  previousTileIndex?: number
): MoveDirection[] {
  const neighbors = tile.neighbors || {};
  const allDirs = (Object.keys(neighbors) as MoveDirection[]).filter(
    (dir) => neighbors[dir] !== undefined
  );

  if (allDirs.length <= 1 || previousTileIndex === undefined) {
    return allDirs;
  }

  const forwardDirs = allDirs.filter((dir) => neighbors[dir] !== previousTileIndex);
  return forwardDirs.length > 0 ? forwardDirs : allDirs;
}

export function relocateTrophy(state: IBoardPartyState): number {
  const eligibleTiles = state.tiles.filter(
    (t) => t.index !== 0 && t.index !== state.trophyTileIndex
  );
  if (eligibleTiles.length === 0) return 13;
  const picked = eligibleTiles[Math.floor(Math.random() * eligibleTiles.length)];
  state.trophyTileIndex = picked.index;
  return picked.index;
}

export function stepTeamInDirection(
  state: IBoardPartyState,
  direction: MoveDirection
): { logs: Partial<IGameLog>[]; isIntersection: boolean } {
  const team = state.teams[state.activeTeamId];
  if (!team || state.remainingSteps <= 0) return { logs: [], isIntersection: false };

  const currentTile = state.tiles.find((t) => t.index === team.tileIndex) || state.tiles[team.tileIndex];
  const nextTileIndex = currentTile?.neighbors?.[direction];

  if (nextTileIndex === undefined) {
    return { logs: [], isIntersection: false };
  }

  team.previousTileIndex = team.tileIndex;
  team.tileIndex = nextTileIndex;
  state.remainingSteps--;

  const logs: Partial<IGameLog>[] = [];
  const nextTile = state.tiles.find((t) => t.index === nextTileIndex) || state.tiles[nextTileIndex];

  // ===== CHECK TROPHY ACQUISITION & PRICE REQUIREMENT =====
  if (team.tileIndex === state.trophyTileIndex) {
    if (team.coins >= state.trophyPrice) {
      team.coins -= state.trophyPrice;
      team.trophies++;
      const oldIndex = state.trophyTileIndex;
      const newTrophyIndex = relocateTrophy(state);

      logs.push({
        id: `trophy-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'WIN',
        message: `🏆 مبروووك! اشترى ${team.nameAr} كأس النصر مقابل ${state.trophyPrice} عملة! وانتقل الكأس إلى موقع جديد (#${newTrophyIndex})!`,
        details: { teamId: team.id, oldTrophyIndex: oldIndex, newTrophyIndex }
      });
      state.lastTileEventMessage = {
        ar: `🏆 اشترى ${team.nameAr} كأس النصر مقابل ${state.trophyPrice} عملة! وانتقل الكأس لموقع جديد (#${newTrophyIndex})!`,
        en: `🏆 ${team.nameEn} purchased the Victory Trophy for ${state.trophyPrice} coins! Relocated to tile #${newTrophyIndex}!`
      };
    } else {
      logs.push({
        id: `trophy-no-funds-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'INFO',
        message: `⚠️ وصل ${team.nameAr} إلى الكأس لكن لا يملك عملات كافية للشراء (${team.coins}/${state.trophyPrice} عملة)! بقي الكأس في مكانه.`,
        details: { teamId: team.id, coins: team.coins, trophyPrice: state.trophyPrice }
      });
      state.lastTileEventMessage = {
        ar: `⚠️ وصل ${team.nameAr} إلى الكأس لكن لا يملك رصيداً كافياً للشراء (${team.coins}/${state.trophyPrice})!`,
        en: `⚠️ ${team.nameEn} reached the Trophy but cannot afford it (${team.coins}/${state.trophyPrice} coins)!`
      };
    }
  }

  // If steps remain, check if next tile is a fork (intersection)
  if (state.remainingSteps > 0 && nextTile) {
    const availableDirs = getAvailableDirections(nextTile, team.previousTileIndex);
    if (availableDirs.length > 1) {
      state.status = 'DIRECTION_CHOICE';
      state.directionChoice = {
        teamId: team.id,
        fromTileIndex: nextTile.index,
        availableDirections: availableDirs,
        votes: {},
        voteCounts: { up: 0, down: 0, left: 0, right: 0 },
        timeRemainingSeconds: 15,
        remainingSteps: state.remainingSteps
      };
      return { logs, isIntersection: true };
    } else if (availableDirs.length === 1) {
      return stepTeamInDirection(state, availableDirs[0]);
    }
  }

  // No remaining steps -> resolve final tile effect
  state.status = 'TILE_ACTION';
  state.directionChoice = null;
  if (nextTile) {
    const tileEffectLogs = resolveFinalTileAction(state, team, nextTile);
    logs.push(...tileEffectLogs);
  }

  return { logs, isIntersection: false };
}

export function resolveFinalTileAction(
  state: IBoardPartyState,
  team: ITeamState,
  tile: IBoardTile
): Partial<IGameLog>[] {
  const logs: Partial<IGameLog>[] = [];

  switch (tile.type) {
    case 'COIN_10':
      team.coins += 10;
      state.lastTileEventMessage = {
        ar: `🗝️ وصل ${team.nameAr} إلى ${tile.nameAr} وحصل على +10 مفاتيح/عملات!`,
        en: `🗝️ ${team.nameEn} reached ${tile.nameEn} and gained +10 coins!`
      };
      break;

    case 'COIN_20':
      team.coins += 20;
      state.lastTileEventMessage = {
        ar: `💰 كنز كبير! حصل ${team.nameAr} على +20 عملة ذهبية!`,
        en: `💰 Huge treasure! ${team.nameEn} received +20 golden coins!`
      };
      break;

    case 'TRAP':
      const deducted = Math.min(team.coins, 10);
      team.coins = Math.max(0, team.coins - 10);
      state.lastTileEventMessage = {
        ar: `☠️ فخ غادر! خسر ${team.nameAr} ${deducted} عملات!`,
        en: `☠️ Trap! ${team.nameEn} lost ${deducted} coins!`
      };
      break;

    case 'WARP':
      state.lastTileEventMessage = {
        ar: `🌀 بوابة انتقال آني! تم تفعيل طاقة السرعة لـ ${team.nameAr}!`,
        en: `🌀 Warp Portal! Speed boost activated for ${team.nameEn}!`
      };
      team.coins += 10;
      break;

    case 'SHOP':
    case 'EVENT':
      team.coins += 15;
      state.lastTileEventMessage = {
        ar: `🎁 مكافأة حدث مفاجئ! حصل ${team.nameAr} على +15 عملة!`,
        en: `🎁 Mystery Event! ${team.nameEn} earned +15 coins!`
      };
      break;

    case 'START':
    default:
      state.lastTileEventMessage = {
        ar: `🚩 استقر ${team.nameAr} في ${tile.nameAr}.`,
        en: `🚩 ${team.nameEn} settled at ${tile.nameEn}.`
      };
      break;
  }

  logs.push({
    id: `tile-action-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: state.lastTileEventMessage?.ar || `وصل ${team.nameAr} إلى ${tile.nameAr}`,
    details: { teamId: team.id, tileIndex: tile.index, tileType: tile.type }
  });

  return logs;
}

export function submitDirectionVote(
  state: IBoardPartyState,
  username: string,
  direction: MoveDirection,
  playerTeam?: TeamId
): boolean {
  if (
    !state.directionChoice ||
    state.status !== 'DIRECTION_CHOICE'
  ) {
    return false;
  }

  if (playerTeam && state.directionChoice.teamId !== playerTeam) {
    return false;
  }

  if (!state.directionChoice.availableDirections.includes(direction)) {
    return false;
  }

  const prevVote = state.directionChoice.votes[username];
  if (prevVote) {
    state.directionChoice.voteCounts[prevVote] = Math.max(
      0,
      (state.directionChoice.voteCounts[prevVote] || 0) - 1
    );
  }

  state.directionChoice.votes[username] = direction;
  state.directionChoice.voteCounts[direction] =
    (state.directionChoice.voteCounts[direction] || 0) + 1;

  return true;
}

export function resolveDirectionChoice(
  state: IBoardPartyState,
  manualDirection?: MoveDirection
): { logs: Partial<IGameLog>[] } {
  if (!state.directionChoice) return { logs: [] };

  let chosenDirection: MoveDirection = manualDirection || state.directionChoice.availableDirections[0];

  if (!manualDirection) {
    let maxVotes = -1;
    for (const dir of state.directionChoice.availableDirections) {
      const vCount = state.directionChoice.voteCounts[dir] || 0;
      if (vCount > maxVotes) {
        maxVotes = vCount;
        chosenDirection = dir;
      }
    }
  }

  state.status = 'TEAM_TURN';
  const result = stepTeamInDirection(state, chosenDirection);
  return { logs: result.logs };
}

export function createRandomMinigame(
  state: IBoardPartyState,
  players: IPlayer[],
  preferredType: 'TEAM_TRIVIA' | 'TEAM_ROULETTE' | 'LASER_GRID' = 'TEAM_TRIVIA'
): IMinigameState {
  const baseTeamVotes: Record<TeamId, Record<string | number, number>> = {
    crimson: {},
    cobalt: {},
    emerald: {},
    amber: {}
  };

  const baseTeamRewards: Record<TeamId, number> = {
    crimson: 0,
    cobalt: 0,
    emerald: 0,
    amber: 0
  };

  const question = TRIVIA_QUESTIONS_BANK[Math.floor(Math.random() * TRIVIA_QUESTIONS_BANK.length)];
  return {
    type: 'TEAM_TRIVIA',
    status: 'ACTIVE',
    titleAr: '🧠 تحدي الأسئلة بين الفرق (Team Trivia Clash)',
    titleEn: '🧠 Team Trivia Clash',
    descAr: 'سؤال عام من بنك الأسئلة! صوتوا في الشات على الإجابة (1، 2، 3، 4 أو A، B، C، D). الفريق الأكثر إجابات صحيحة يحصد مكافأة العملات!',
    descEn: 'Answer in chat (1, 2, 3, 4 or A, B, C, D). Team with most correct answers wins bonus coins!',
    timeRemainingSeconds: 20,
    triviaQuestion: question,
    votes: {},
    teamVotes: baseTeamVotes,
    teamScores: { crimson: 0, cobalt: 0, emerald: 0, amber: 0 },
    teamRewards: baseTeamRewards,
    winnerTeamId: null
  };
}

export function resolveMinigame(
  state: IBoardPartyState,
  players: IPlayer[]
): { logs: Partial<IGameLog>[] } {
  const minigame = state.minigameState;
  if (!minigame || minigame.status === 'COMPLETED') return { logs: [] };

  minigame.status = 'COMPLETED';
  const logs: Partial<IGameLog>[] = [];
  const enabledTeams = getEnabledTeams(state);

  const teamScores: Record<TeamId, number> = { crimson: 0, cobalt: 0, emerald: 0, amber: 0 };

  if (minigame.type === 'TEAM_TRIVIA' && minigame.triviaQuestion) {
    const correctIdx = minigame.triviaQuestion.correctIndex;
    for (const [username, choice] of Object.entries(minigame.votes)) {
      const player = players.find((p) => p.username === username);
      if (!player || !player.team) continue;

      let chosenNum = -1;
      if (typeof choice === 'number') chosenNum = choice;
      else if (typeof choice === 'string') {
        const c = choice.trim().toUpperCase();
        if (['1', 'A'].includes(c)) chosenNum = 0;
        else if (['2', 'B'].includes(c)) chosenNum = 1;
        else if (['3', 'C'].includes(c)) chosenNum = 2;
        else if (['4', 'D'].includes(c)) chosenNum = 3;
      }

      if (chosenNum === correctIdx) {
        teamScores[player.team]++;
      }
    }
    minigame.teamScores = teamScores;
  }

  // Rank enabled teams
  const sortedTeams = [...enabledTeams].sort((a, b) => (teamScores[b] || 0) - (teamScores[a] || 0));
  const rewards = [45, 25, 15, 5];

  sortedTeams.forEach((teamId, idx) => {
    const reward = rewards[idx] || 5;
    minigame.teamRewards[teamId] = reward;
    if (state.teams[teamId]) {
      state.teams[teamId].coins += reward;
    }
  });

  minigame.winnerTeamId = sortedTeams[0];
  const winningTeam = state.teams[sortedTeams[0]];

  logs.push({
    id: `minigame-win-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'WIN',
    message: `🎉 انتهت لعبة ${minigame.titleAr}! فاز ${winningTeam?.nameAr || 'الفريق المتصدر'} بالمركز الأول (+45 عملة)!`,
    details: { winnerTeamId: sortedTeams[0], teamScores, rewards: minigame.teamRewards }
  });

  return { logs };
}

export function advanceToNextTurn(
  state: IBoardPartyState,
  players: IPlayer[]
): {
  isRoundEnd: boolean;
  isMatchOver: boolean;
  logs: Partial<IGameLog>[];
} {
  const logs: Partial<IGameLog>[] = [];
  state.lastDiceRoll = null;
  state.remainingSteps = 0;
  state.directionChoice = null;

  const validTeams = getActiveTeamsWithPlayers(state, players);
  const nextTurnIndex = state.activeTurnIndex + 1;

  if (nextTurnIndex < validTeams.length) {
    state.activeTurnIndex = nextTurnIndex;
    state.activeTeamId = validTeams[nextTurnIndex];
    state.status = 'TEAM_TURN';
    return { isRoundEnd: false, isMatchOver: false, logs };
  }

  // All active teams moved -> End of round -> Trigger Trivia Minigame Phase!
  state.activeTurnIndex = 0;
  state.activeTeamId = validTeams[0] || 'crimson';
  state.status = 'MINIGAME';
  state.minigameState = createRandomMinigame(state, players, 'TEAM_TRIVIA');

  logs.push({
    id: `round-end-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'INFO',
    message: `🚨 اكتملت تحركات الجولة ${state.roundNumber}! انطلقت الآن مسابقة الأسئلة السريعة بين الفرق: ${state.minigameState.titleAr}!`,
    details: { roundNumber: state.roundNumber, minigameType: state.minigameState.type }
  });

  return { isRoundEnd: true, isMatchOver: false, logs };
}

export function advanceToNextRound(
  state: IBoardPartyState,
  players: IPlayer[]
): {
  isMatchOver: boolean;
  logs: Partial<IGameLog>[];
} {
  const logs: Partial<IGameLog>[] = [];
  state.minigameState = null;
  state.roundNumber++;

  const enabledTeams = getEnabledTeams(state);

  if (state.roundNumber > state.maxRounds) {
    state.status = 'MATCH_OVER';
    let bestTeamId: TeamId = enabledTeams[0] || 'crimson';
    let maxScore = -1;

    for (const teamId of enabledTeams) {
      const t = state.teams[teamId];
      if (!t) continue;
      const score = (t.trophies * 1000) + t.coins;
      if (score > maxScore) {
        maxScore = score;
        bestTeamId = teamId;
      }
    }

    state.winnerTeamId = bestTeamId;
    const champion = state.teams[bestTeamId];

    logs.push({
      id: `match-champion-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'WIN',
      message: `👑 انتهت المباراة! تُوّج ${champion.nameAr} بطلاً لحرب المتاهة برصيد ${champion.trophies} كؤوس و ${champion.coins} عملة!`,
      details: { winnerTeamId: bestTeamId, trophies: champion.trophies, coins: champion.coins }
    });

    return { isMatchOver: true, logs };
  }

  const validTeams = getActiveTeamsWithPlayers(state, players);
  state.activeTurnIndex = 0;
  state.activeTeamId = validTeams[0] || enabledTeams[0] || 'crimson';
  state.status = 'TEAM_TURN';

  return { isMatchOver: false, logs };
}

