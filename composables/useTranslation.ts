export type Locale = 'en' | 'ar';

export const translations = {
  en: {
    // Navigation & Branding
    pageTitle: 'ChatWar // Interactive Live Stream Gaming Platform',
    brandName: 'ChatWar',
    brandTagline: 'Interactive Live Stream Gaming Platform',
    home: 'Home',
    games: 'Browse Games',
    miniGames: 'Mini Games 🎮',
    miniGamesSub: 'Fast-paced, quick elimination & quiz rounds for instant chat engagement',
    longGames: 'Long Battles 🏰',
    longGamesSub: 'Full-length 4-team maze boards & strategic tournaments',
    filterAll: 'All Games',
    filterMini: 'Mini Games 🎮',
    filterLong: 'Long Battles 🏰',
    miniGamesTag: 'MINI GAME ⚡',
    longGamesTag: 'LONG BATTLE 🏰',
    admin: 'Operations',
    login: 'Streamer Login',
    sfxOn: '🔊 Audio On',
    sfxMuted: '🔇 Mute SFX',
    language: 'Language',
    developedBy: 'Developed with passion by',

    // Hero Section
    badgeInteractive: 'Interactive Live Stream Gaming Arena ⚡',
    heroTitleLine1: 'IGNITE YOUR CHAT.',
    heroTitleLine2: 'PLAY IN CHATWAR',
    heroSubtitle: 'Turn your live stream chat into an interactive gaming arena. Viewers join via !join in chat, eliminate opponents with !kill, and battle live on stream.',
    enterTwitchChannel: '🎮 Quick Start — Select Platform & Enter Channel Name:',
    channelPlaceholder: 'e.g. shroud or your_channel',
    connectAndPlay: 'Connect & Play',
    channelNotice: '⚡ Connects instantly to your live chat. Zero OAuth setup required.',
    compatibleWith: 'Fully Compatible With:',

    // Games Showcase
    availableGames: 'Interactive Mini-Games',
    availableGamesSub: 'Select a game mode for your live stream and launch in seconds',
    allGames: 'All Games',
    partyCategory: 'Party & Minigames 🎲',
    rouletteCategory: 'Roulette & Elimination 🎯',
    triviaCategory: 'Trivia & Quizzes 🧠',
    casualCategory: 'Fast-Paced Bombs 💣',
    survivalCategory: 'Survival & Zone 🗺️',
    playNow: 'Play Now',
    comingSoon: 'Coming Soon',
    underDevelopment: 'Under Development',
    readyToStream: '● Ready for Instant Stream',
    maxContenders: 'Max Contenders',

    // Game: Board Party (Pummel Maze War)
    boardPartyTitle: 'Pummel Maze War (4 Factions & Minigames)',
    boardPartyTag: 'MAZE BOARD & MINIGAMES 🏆',
    boardPartyDesc: 'A large interactive maze board inspired by Pummel Party! 4 chat teams vote on movement directions at forks (!up, !down, !left, !right), hunt the wandering trophy, and fight in end-of-round minigames!',
    boardPartyFeat1: '4 Auto-balancing chat teams with direction voting at maze intersections',
    boardPartyFeat2: '32-tile branching maze graph with coins, traps, portals & wandering trophy 🏆',
    boardPartyFeat3: 'Streamer dice rolls + all-team minigames after each round with coin rewards',

    // Game 1: Roulette
    rouletteTitle: 'Roulette Elimination (Stream Roulette)',
    rouletteTag: 'MOST POPULAR 🔥',
    rouletteDesc: 'Contenders join with !join. The wheel spins dynamically to pick an executioner with 15 seconds to !kill a rival or !revive a fallen ally once. Last survivor wins!',
    rouletteFeat1: 'Smooth physics deceleration wheel with audio ratchet ticks',
    rouletteFeat2: 'Strict one-time strategic revive rule',
    rouletteFeat3: 'Direct on-screen interactive live stage',

    // Game 2: Trivia
    triviaTitle: 'General Trivia Arena (4 Options)',
    triviaTag: 'COMMUNITY QUIZ 🧠',
    triviaDesc: 'Live on-screen 4-choice trivia arena! Viewers answer directly in chat (1-4 or A-D). Features real-time vote percentage bars and chat leaderboard.',
    triviaFeat1: 'Massive question bank across 7 categories + OpenTDB fallback',
    triviaFeat2: 'Real-time vote progress bars & answer reveal animations',
    triviaFeat3: 'Contender scoring system with streak bonus multipliers',

    // Game 3: Hot Potato
    hotPotatoTitle: 'Hot Potato Bomb',
    hotPotatoTag: 'FAST PACED 💣',
    hotPotatoDesc: 'A ticking plasma bomb is passed between chatters with !pass <number>. When the secret random fuse ends, it detonates on the holder!',
    hotPotatoFeat1: 'Generates intense chat activity and rapid typing',
    hotPotatoFeat2: 'Surprise randomized detonation countdown',
    hotPotatoFeat3: 'Last survivor who outlasts all explosions wins 👑',

    // Game 4: Grid Royale
    gridRoyaleTitle: 'Grid Royale (Speed & Reflex Survival)',
    gridRoyaleTag: 'SPEED & REFLEX ⚡',
    gridRoyaleDesc: 'A fast-paced 16-tile Battle Royale grid where the storm closes in! Chatters rush to claim safe spots (!A1, !B2, !12) on a first-come, first-served basis. Slower participants are swallowed by the storm and eliminated!',
    gridRoyaleFeat1: '4x4 Grid arena with strictly limited spot capacity (first-come first-served)',
    gridRoyaleFeat2: 'Shrinking storm zone with sudden death champion round',
    gridRoyaleFeat3: 'Crowns the fastest reflex chatter and sole survivor as Champion 👑',

    // Game 5: Type Race
    typeRaceTitle: 'Type Race (Speed Typing Arena)',
    typeRaceTag: 'FASTEST FINGERS ⚡',
    typeRaceDesc: 'A lightning-fast speed typing showdown! Words and challenge phrases appear on screen, and the fastest viewer to type the exact word in live chat claims the point and leads the race!',
    typeRaceFeat1: 'Instant millisecond reaction tracking and speed leaderboard',
    typeRaceFeat2: 'Rich multi-category gaming, memes, and tech word bank',
    typeRaceFeat3: 'First to reach target score is crowned Type Race Champion 👑',

    // Game 6: Hangman (Word Guess Challenge)
    hangmanTitle: 'Secret Word Challenge (Wordle / Hangman)',
    hangmanTag: 'SECRET WORD 🕵️',
    hangmanDesc: 'Streamer enters a masked secret word. Viewers have 5 personal attempts to guess it in chat, receiving Wordle-style green, yellow, and gray letter feedback tiles! Fastest correct solver wins.',
    hangmanFeat1: 'Private masked word entry with zero stream leaks',
    hangmanFeat2: '5 attempts per chatter with green, yellow & gray Wordle letter hints',
    hangmanFeat3: 'Global countdown timer & auto-reveals on time expiration',

    // Game 7: Subway Runner
    subwayRunnerTitle: 'Subway Runner (Chat Reflex Rush)',
    subwayRunnerTag: 'REFLEX SPRINT 🏃‍♂️',
    subwayRunnerDesc: 'A 3-lane infinite railway runner driven by chat commands! Oncoming obstacles force chatters to type JUMP, DUCK, LEFT, or RIGHT in real-time. Speed accelerates continuously!',
    subwayRunnerFeat1: '3D perspective railway track with jumping, ducking & lane shifting',
    subwayRunnerFeat2: 'Instant chat command recognition with 3 hearts per chatter',
    subwayRunnerFeat3: 'Progressive speed tiers and reaction time down to 1.6 seconds ⚡',

    // How It Works
    howItWorksTitle: 'How Does ChatWar Work on Your Stream?',
    howItWorksSub: 'Three simple steps to start entertaining your viewers',
    step1Title: '1. Enter Channel Name',
    step1Desc: 'Type your Twitch channel username to establish instant IRC connection and read viewer commands.',
    step2Title: '2. Launch Game Stage',
    step2Desc: 'Open your interactive game room directly on screen with full automated chat command recognition.',
    step3Title: '3. Engage & Play with Chat',
    step3Desc: 'Tell viewers to type !join to enter. Spin the wheel live and watch the battle unfold!',

    // Controller Room
    roomController: 'Room Controller',
    liveLobby: 'LIVE (LOBBY)',
    running: 'RUNNING',
    roomId: 'Room ID',
    channelChat: 'Twitch Chat',
    timerLabel: 'Turn Timer',
    unlimitedTimer: 'Unlimited (No Timeout)',
    seconds: 'seconds',
    gameRulesBtn: '📜 Game Rules',
    gameSettingsBtn: '⚙️ Game Settings',
    copyObsBtn: '📋 Copy OBS Overlay URL',
    copiedObsBtn: '✓ OBS Link Copied!',
    previewObs: '↗ Preview OBS',
    chatStatusConnected: 'Connected to Twitch chat',
    chatStatusConnecting: 'Connecting to chat...',
    changeChannel: 'Change Channel',
    connectBtn: 'Connect',
    spinWheelBtn: '🎲 Spin Wheel',
    lockEntriesBtn: '🔒 Lock Entries',
    openLobbyBtn: '🔓 Open Lobby',
    resetGameBtn: '↺ Reset Game',
    focusModeBtn: '🔍 Fullscreen / Focus Mode',
    exitFocusBtn: 'Exit Focus View',
    chatSimulatorTitle: 'Twitch Chat Command Tester',
    chatSimulatorSub: 'Simulate chat commands without live chat',
    autoFillBtn: '+ Auto-Add 6 Contenders',
    contendersRoster: 'Contenders Roster',
    emptyLobbyMsg: 'Lobby is currently empty. Ask viewers to type !join in chat.',
    actionFeedTitle: 'Live Combat & Chat Feed',
    latestEvent: 'Latest Event',
    awaitingCommands: 'Awaiting match commands...',
    alive: 'ALIVE',
    eliminated: 'ELIMINATED',
    revived: 'REVIVED (1x)',
    championDeclared: '👑 ARENA CHAMPION • SOLE SURVIVOR 👑',
    totalKills: 'Total Eliminations',
    turnOfPlayer: '👉 Turn: Player',
    timeIsUnlimitedNotice: 'Unlimited time (no timeout). Player can type !kill or !revive in chat.',
    wheelStageTitle: 'Interactive Roulette Wheel (Live Stage)',
    wheelStageSub: 'Decelerates dynamically to choose the next contender',
    kickPlayerPrompt: 'Are you sure you want to kick Player',
    kickTooltip: 'Kick Player from Lobby',
    eliminateBtn: 'Eliminate 💥',
    reviveBtn: 'Revive ✨',
    kills: 'Kills:',
    revivedBadge: 'Revived',
    clickToKick: 'Click ✕ on any card to kick a player instantly',
    totalContenders: 'Total Contenders',
    quickActions: 'Quick Actions:',
    killPlayerShort: 'Kill',
    battleFeed: 'Battle Feed',
    simulatorTab: 'Chat Simulator',
    soleSurvivor: 'Sole Survivor',
    typeJoinToEnter: 'Type !join in chat to enter',
    chatInstructions: 'Type in chat: !kill <number> to eliminate or !revive <number> to revive',
    turnTimerCountdown: 'Turn Decision Countdown',
    secondsRemaining: 'seconds',
    noLogsYet: 'Awaiting match combat actions...',
    simulateKillFrom: 'Simulate: `!kill 1` (by Player',
    simulateReviveFrom: 'Simulate: `!revive 2` (by Player',
    viewerPlaceholder: 'Viewer Username (e.g. Alex)',
    commandPlaceholder: 'Command e.g. !join or !kill 2',
    sendToChatBtn: 'Send to Chat',

    // Roster Filters & Revivable Section
    allContendersTab: 'All',
    aliveContendersTab: 'Alive',
    revivableContendersTab: 'Revivable ✨',
    eliminatedContendersTab: 'Eliminated 💀',
    revivablePlayersTitle: '✨ Fallen Contenders Eligible for Revive',
    noRevivablePlayers: 'No fallen players eligible for revive',
    canBeRevivedBadge: 'Can Revive',
    reviveThisPlayer: 'Revive',

    // Available Powers Indicators
    availablePowersTitle: "🎯 Contender's Available Actions:",
    powerKillAndRevive: '💥 Eliminate + ✨ Revive Ally',
    powerKillOnly: '💥 Eliminate Only',
    reviveUsedNote: 'Revive already used ❌',
    noRevivableNote: 'No fallen players to revive',
    reviveAvailableBadge: '✨ Revive Ready',
    reviveUsedBadge: '⚡ Revive Used',

    // Rules Modal - Roulette
    rulesModalTitle: 'Roulette Elimination Rules & Guide',
    rulesModalSub: 'Streamer & viewer handbook for the match',
    closeRulesBtn: 'I Understand the Rules, Close',
    rule1Title: '1. Lobby Entry Phase',
    rule1Desc: 'Streamer opens the lobby. Viewers type !join in Twitch chat to enter and receive a unique number on the wheel.',
    rule2Title: '2. Wheel Spin & Executioner Selection',
    rule2Desc: 'Streamer clicks Spin Wheel. The roulette decelerates smoothly and selects a random active contender.',
    rule3Title: '3. Turn Decisions: Eliminate or Revive',
    rule3Desc: 'The chosen player writes !kill <number> to eliminate an alive player, or !revive <number> to bring back a dead player.',
    rule4Title: '4. Strict Revive Regulations',
    rule4Desc: 'Each contender can only use revive ONCE per match. A player can only be revived ONCE. Suicide is not allowed.',
    rule5Title: '5. Victory Royale',
    rule5Desc: 'Matches continue until 1 contender remains, crowning them Champion with fanfare and confetti!',

    // Rules Modal - Trivia
    triviaRulesModalTitle: 'Trivia Quiz Rules & Guide',
    triviaRulesModalSub: 'Streamer & viewer handbook for trivia rules and scoring',
    triviaRule1Title: '1. Match Setup & Launch (Lobby)',
    triviaRule1Desc: 'Streamer customizes question categories, question count, and answer timer, then clicks "Start Trivia Match" to begin.',
    triviaRule2Title: '2. Live Chat Voting System',
    triviaRule2Desc: 'Viewers type the answer number or letter in live chat (1, 2, 3, 4 or A, B, C, D). Each viewer gets 1 vote per question.',
    triviaRule3Title: '3. Points & Winning Streaks',
    triviaRule3Desc: 'Correct answers award +100 points. Consecutive correct answers activate a Streak Multiplier (🔥 x2, 🔥 x3) for bonus score!',
    triviaRule4Title: '4. Live Vote Distribution & Reveal',
    triviaRule4Desc: 'Chat vote percentages are updated live in real-time. The correct answer and bonus fact are revealed when time is up or by streamer.',
    triviaRule5Title: '5. Trivia Champion Crowning',
    triviaRule5Desc: 'At the end of all rounds, the leaderboard displays final scores and crowns the #1 trivia master as the Champion!',

    // Rules Modal - Board Party (Pummel Maze War)
    boardRulesModalTitle: 'Pummel Maze War & Minigames Rules',
    boardRulesModalSub: 'Streamer & viewer handbook for 4-faction maze board and minigames',
    boardRule1Title: '1. Four Factions & Chat Distribution',
    boardRule1Desc: 'Viewers join via !join and are automatically distributed into Crimson 🔴, Cobalt 🔵, Emerald 🟢, and Amber 🟡.',
    boardRule2Title: '2. Streamer Dice Roll & Team Movement',
    boardRule2Desc: 'The streamer rolls the digital dice (1-6). The active team pawn advances along the maze pathways.',
    boardRule3Title: '3. Chat Direction Voting at Maze Forks',
    boardRule3Desc: 'Whenever reaching an intersection in the maze, team members vote in chat (!up, !down, !left, !right) to choose their path!',
    boardRule4Title: '4. The Wandering Victory Trophy 🏆',
    boardRule4Desc: 'Reaching the trophy tile claims it for 30 coins. Once claimed, the trophy immediately relocates to a new random location in the maze!',
    boardRule5Title: '5. End-of-Round Minigames & Championship',
    boardRule5Desc: 'After all 4 teams complete their movement, a minigame launches where all teams compete for massive coin prizes! Most trophies wins the championship!',

    // Rules Modal - Grid Royale
    gridRoyaleRulesModalTitle: 'Grid Royale Speed Survival Rules',
    gridRoyaleRulesModalSub: 'Streamer & chat handbook for shrinking zone survival and rapid claiming',
    gridRule1Title: '1. 16-Tile Battle Royale Grid',
    gridRule1Desc: 'The match launches on a 4x4 matrix (16 tiles labeled A1 to D4 or 1 to 16). Each wave initiates a storm countdown.',
    gridRule2Title: '2. Rapid First-Come First-Served Spot Claiming',
    gridRule2Desc: 'Contenders write the safe tile code in chat (!A1, !B2, !12). The fastest typer claims the spot. Once full, the spot locks out others.',
    gridRule3Title: '3. Advancing Storm Collapse & Elimination',
    gridRule3Desc: 'When the wave timer reaches 0, dangerous tiles collapse with lightning strikes, eliminating any chatter caught outside safe spots.',
    gridRule4Title: '4. Progressive Shrinking & Sudden Death',
    gridRule4Desc: 'Safe tiles shrink every wave (16 -> 12 -> 8 -> 4 -> 1 final spot) until only one lone survivor remains standing.',
    gridRule5Title: '5. Champion Crowning',
    gridRule5Desc: 'The final surviving contender with the fastest reflexes is crowned the Grid Royale Champion with victory fanfare!',

    // Rules Modal - Type Race
    typeRaceRulesModalTitle: 'Type Race Speed Rules',
    typeRaceRulesModalSub: 'Streamer & chat handbook for rapid typing battles and reaction scoring',
    typeRule1Title: '1. Lobby & Viewer Joining',
    typeRule1Desc: 'Viewers join by typing !join in chat to register their username and avatar on the leaderboard.',
    typeRule2Title: '2. Lightning Word Prompts',
    typeRule2Desc: 'When a round starts, a gaming or challenge word/phrase flashes on screen with a countdown bar.',
    typeRule3Title: '3. Fastest Exact Typist Scores',
    typeRule3Desc: 'The first participant to type the exact word correctly in chat wins the round and gains 1 point instantly!',
    typeRule4Title: '4. Millisecond Precision',
    typeRule4Desc: 'The system computes typing reaction speed down to the exact millisecond, displaying response speed live.',
    typeRule5Title: '5. Victory Target',
    typeRule5Desc: 'The first contender to reach the match target score (e.g. 3 or 5 points) is crowned the Type Race Champion!',

    // Rules Modal - Hangman
    hangmanRulesModalTitle: 'Secret Word Challenge Rules & Guide',
    hangmanRulesModalSub: 'Streamer & chat handbook for masked secret word guessing and Wordle feedback',
    hangmanRule1Title: '1. Secret Word Entry (Masked)',
    hangmanRule1Desc: 'Streamer enters a secret word (or picks from categories). The word is securely masked so chat and overlay cannot see it.',
    hangmanRule2Title: '2. Chat Guessing Commands',
    hangmanRule2Desc: 'Viewers submit word guesses in chat using !guess <word>, !تخمين <word>, or by typing words directly.',
    hangmanRule3Title: '3. Wordle Letter Feedback',
    hangmanRule3Desc: 'Each guess displays tiles: 🟩 Green (correct letter & spot), 🟨 Yellow (in word, wrong spot), ⬛ Gray (not in word). Correct letters are also revealed on the main board.',
    hangmanRule4Title: '4. Strictly 5 Attempts Per Chatter',
    hangmanRule4Desc: 'Every player has exactly 5 attempts. Once all 5 attempts are used up, the chatter is locked out for the rest of the round.',
    hangmanRule5Title: '5. Timer & Victory',
    hangmanRule5Desc: 'The first participant to guess the exact word wins! If the timer expires before anyone solves it, the secret word is dramatically unveiled.',

    // Rules Modal - Hot Potato
    hotPotatoRulesModalTitle: 'Hot Potato Bomb Rules & Guide',
    hotPotatoRulesModalSub: 'Streamer & chat handbook for rapid passing and ticking fuse survival',
    hotPotatoRule1Title: '1. The Ticking Fuse',
    hotPotatoRule1Desc: 'A live ticking bomb is assigned to a random alive player with a secret randomized fuse (15-35s). Nobody knows the exact blast second!',
    hotPotatoRule2Title: '2. Rapid Passing (!pass <number>)',
    hotPotatoRule2Desc: 'The active bomb holder must type !pass <number> or !pass @username in chat immediately to pass it to another alive contender.',
    hotPotatoRule3Title: '3. Random Pass Option (!pass)',
    hotPotatoRule3Desc: 'Typing !pass or !مرر alone without a target tosses the bomb randomly to any surviving player!',
    hotPotatoRule4Title: '4. Detonation & Immediate Elimination',
    hotPotatoRule4Desc: 'When the secret fuse expires: BOOM! The bomb detonates on whoever is holding it, eliminating them permanently.',
    hotPotatoRule5Title: '5. Sole Survivor Victory',
    hotPotatoRule5Desc: 'Rounds continue consecutively with surviving contenders until 1 champion remains, crowned the Hot Potato Master 👑!',

    // Rules Modal - Subway Runner
    subwayRunnerRulesModalTitle: 'Subway Runner Challenge Rules & Guide',
    subwayRunnerRulesModalSub: 'Streamer & chat handbook for dodging obstacles, 3-lane navigation and reflexes',
    subwayRule1Title: '1. Instant Chat Joining',
    subwayRule1Desc: 'Viewers join automatically by typing any command (jump, duck, left, right, or !join) in chat, starting with 3 hearts (❤️❤️❤️).',
    subwayRule2Title: '2. On-Screen Obstacle Prompts',
    subwayRule2Desc: 'Obstacles approach rapidly across 3 lanes. A giant glowing badge prompts the required action (e.g. JUMP, DUCK, LEFT, RIGHT).',
    subwayRule3Title: '3. Fast Reaction Window',
    subwayRule3Desc: 'Chatters must type the required command before the countdown bar reaches zero. Failure results in losing 1 heart.',
    subwayRule4Title: '4. Accelerating Speed Tiers',
    subwayRule4Desc: 'Every 5 successful dodges, the runner speeds up, reducing reaction time from 4.2 seconds down to a lightning 1.6 seconds!',
    subwayRule5Title: '5. MVP Survivor & Distance High Score',
    subwayRule5Desc: 'When chatters run out of hearts, the run ends. The furthest surviving chatter is crowned the Subway Champion 👑!',

    // Settings Modal
    settingsModalTitle: 'Game & Turn Settings',
    settingsModalSub: 'Configure turn duration, revive rules, and max lobby capacity',
    timerSettingLabel: '⏱️ Turn Decision Timer:',
    limitedTimerBtn: 'Timed (Seconds)',
    unlimitedTimerBtn: '♾️ Unlimited (No Timeout)',
    seconds10: '10 Seconds (Fast & Intense)',
    seconds15: '15 Seconds (Standard Balanced)',
    seconds20: '20 Seconds (Medium Chat)',
    seconds30: '30 Seconds (Relaxed)',
    seconds60: '60 Seconds (1 Full Minute)',
    allowRevivesLabel: '✨ Allow Revives (!revive)',
    allowRevivesSub: 'Enable players to revive one fallen ally',
    maxPlayersLabel: '👥 Max Contenders Capacity:',
    commandsSettingsTitle: '⌨️ Custom Chat Commands & Aliases',
    commandsSettingsSub: 'Add multiple keywords separated by commas (e.g. !join, !enter, !play)',
    joinCommandsLabel: '🟢 Join Commands:',
    joinCommandsPlaceholder: '!join, !enter, !play',
    killCommandsLabel: '🔴 Eliminate / Kill Commands:',
    killCommandsPlaceholder: '!kill, !eliminate, !out',
    reviveCommandsLabel: '🟡 Revive Commands:',
    reviveCommandsPlaceholder: '!revive, !life, !res',
    cancel: 'Cancel',
    saveSettings: '💾 Save & Apply Settings',

    // Platform Connect Modal
    platformModalTitle: 'Connect Streaming Platform',
    platformModalSub: 'Select at least one platform to connect live chat',
    autoConnectAlways: 'Always Auto-Connect',
    autoConnectSub: 'Will remember your channel for future sessions',
    connectStreamBtn: 'Connect Platform',
    closeModal: 'Close',

    // Broadcaster Ownership Verification
    verifiedBroadcaster: '🛡️ Verified Channel Owner',
    unverifiedBroadcaster: '⚠️ Unverified Channel',
    verificationPromptTitle: '🔒 Verify Twitch Channel Ownership',
    verificationPromptSub: 'To confirm you own this channel, write this code in your Twitch chat:',
    copyVerifyCommand: 'Copy Command',
    copiedVerifyCommand: 'Copied!',
    verifyWithOAuthBtn: 'Verify Instantly with Twitch OAuth 🟣',
    broadcasterVerifiedNotice: '✅ You are verified as the official Twitch channel owner!',
    simulateVerifyFrom: 'Simulate: `!verify` (from Channel Owner)'
  },

  ar: {
    // Navigation & Branding
    pageTitle: 'ChatWar // منصة ألعاب البث المباشر التفاعلية',
    brandName: 'ChatWar',
    brandTagline: 'منصة ألعاب البث المباشر التفاعلية',
    home: 'الرئيسية',
    games: 'تصفّح الألعاب',
    miniGames: 'ألعاب مصغرة 🎮',
    miniGamesSub: 'ألعاب سريعة وخفيفة (روليت، أسئلة، قنابل) لتفاعل فوري مع الشات',
    longGames: 'ألعاب طويلة 🏰',
    longGamesSub: 'حرب المتاهة بالفرق والتحديات الاستراتيجية والألعاب اللوحية الطويلة',
    filterAll: 'جميع الألعاب',
    filterMini: 'ألعاب مصغرة 🎮',
    filterLong: 'ألعاب طويلة 🏰',
    miniGamesTag: 'لعبة مصغرة ⚡',
    longGamesTag: 'معركة طويلة 🏰',
    admin: 'لوحة الإدارة',
    login: 'تسجيل دخول الستريمر',
    sfxOn: '🔊 الصوت مفعّل',
    sfxMuted: '🔇 كتم',
    language: 'اللغة',
    developedBy: 'تم التطوير بكل شغف بواسطة',

    // Hero Section
    badgeInteractive: 'ساحة الألعاب التفاعلية للبثوث المباشرة ⚡',
    heroTitleLine1: 'أشعل حماس البث.',
    heroTitleLine2: 'في شات وور (ChatWar)',
    heroSubtitle: 'حوّل شات قناتك إلى ساحة لعب وتحديات مشتعلة. ألعاب روليت وبقاء يتفاعل معها المتابعون مباشرة بأوامر الشات لايف على شاشة البث.',
    enterTwitchChannel: '🎮 ابدأ البث الآن — اختر المنصة واكتب اسم قناتك:',
    channelPlaceholder: 'مثال: shroud أو aboflah',
    connectAndPlay: 'اتصل والعب',
    channelNotice: '⚡ يتصل بشات البث فوراً بدون الحاجة لكلمات سر أو إعدادات معقدة.',
    compatibleWith: 'متوافق مع:',

    // Games Showcase
    availableGames: 'الألعاب التفاعلية المتاحة',
    availableGamesSub: 'اختر اللعبة المناسبة لجمهورك وابدأ المتعة في ثوانٍ',
    allGames: 'جميع الألعاب',
    partyCategory: 'ألعاب الطاولة والتحديات 🎲',
    rouletteCategory: 'روليت الاستبعاد 🎯',
    triviaCategory: 'الأسئلة والمسابقات 🧠',
    casualCategory: 'القنابل والسرعة 💣',
    survivalCategory: 'البقاء والزون 🗺️',
    playNow: 'العب الآن',
    comingSoon: 'قريباً',
    underDevelopment: 'قيد التطوير',
    readyToStream: '● جاهز للبث الفوري',
    maxContenders: 'أقصى عدد مشاركين',

    // Game: Board Party (Pummel Maze War)
    boardPartyTitle: 'حرب المتاهة والألعاب المصغرة (4 فرق)',
    boardPartyTag: 'متاهة وكؤوس 🏆',
    boardPartyDesc: 'متاهة تكتيكية ضخمة مستوحاة من Pummel Party! تتنافس فيها 4 فرق من الشات بالتصويت على مسارات الحركة (!up, !down, !left, !right)، مع كأس متنقل، ونرد يديره الستريمر، وميني جيمز بعد كل جولة!',
    boardPartyFeat1: '4 فرق متوازنة تتنقل في المتاهة بتصويت المشاهدين على الاتجاهات في الشات',
    boardPartyFeat2: 'خريطة متاهة شبكية من 32 بلاطة مع فخاخ، بوابات عبور، وكأس أسطوري متنقل 🏆',
    boardPartyFeat3: 'رمي نرد من الستريمر + جولة ألعاب مصغرة تنافسية بين الفرق بنهاية كل دور',

    // Game 1: Roulette
    rouletteTitle: 'روليت الاستبعاد (Stream Roulette)',
    rouletteTag: 'الأكثر طلباً 🔥',
    rouletteDesc: 'يدخل المشاهدون بكتابة !join. تدور عجلة الروليت باحترافية وتختار متسابقاً لديه 15 ثانية لاستبعاد خصم بـ !kill أو إنعاش صديق بـ !revive. الناجي الأخير يفوز!',
    rouletteFeat1: 'عجلة دوارة سلسة مع مؤثرات صوتية حقيقية',
    rouletteFeat2: 'قانون الإنعاش التكتيكي لمرة واحدة فقط',
    rouletteFeat3: 'واجهة تحكم مباشرة وتفاعلية على الشاشة',

    // Game 2: Trivia
    triviaTitle: 'مسابقة وتحدي الأسئلة العامة (Trivia Arena)',
    triviaTag: 'تحدي الشات 🧠',
    triviaDesc: 'مسابقة أسئلة عامة بـ 4 خيارات على شاشة البث! المشاهدون يجيبون في الشات (1-4 أو A-D) مع إحصائيات ونسب تصويت حية ولوحة صدارة للمتسابقين.',
    triviaFeat1: 'بنك أسئلة ضخم ومصنف في 7 مجالات + أسئلة متجددة',
    triviaFeat2: 'نسب تصويت فورية لكل خيار وتأثيرات كشف الإجابة',
    triviaFeat3: 'نظام نقاط ولوحة صدارة وسلسلة إجابات صحيحة (Streak)',

    // Game 3: Hot Potato
    hotPotatoTitle: 'القنبلة الموقوتة (Hot Potato)',
    hotPotatoTag: 'سرعة وحماس 💣',
    hotPotatoDesc: 'يمرر المتابعون قنبلة بلازمية حارقة عبر أمر !pass بسرعة جنونية قبل أن ينتهي الفتيل السري وتنفجر في حاملها!',
    hotPotatoFeat1: 'تفاعل وسرعة كتابة عالية في الشات',
    hotPotatoFeat2: 'عداد تفجير عشوائي ومفاجئ مع تسارع صوتي',
    hotPotatoFeat3: 'تتويج الناجي الأخير من الانفجارات كبطل للقنبلة 👑',

    // Game 4: Grid Royale
    gridRoyaleTitle: 'حلبة البقاء (Grid Royale)',
    gridRoyaleTag: 'سرعة وردة فعل ⚡',
    gridRoyaleDesc: 'حلبة تكتيكية بـ 16 مربعاً تنكمش فيها العاصفة باستمرار! يتسابق المشاهدون في الشات لحجز المربعات الآمنة المتبقية أولاً بأول (!A1, !B2, !12)، ومن يتأخر يبتلعه الزون ويستبعد فوراً!',
    gridRoyaleFeat1: 'شبكة 4x4 مع سعة استيعاب محدودة وتنافس فوري في الشات',
    gridRoyaleFeat2: 'انكماش تدريجي لمنطقة الأمان مع تأثيرات عاصفة وصواعق حية',
    gridRoyaleFeat3: 'تتويج صاحب أسرع ردة فعل والناجي الأخير كبطل للبقاء 👑',

    // Game 5: Type Race
    typeRaceTitle: 'سباق سرعة الكتابة (Type Race)',
    typeRaceTag: 'أسرع أصابع ⚡',
    typeRaceDesc: 'تحدي كتابة ناري وسريع! تظهر كلمات وجمل سريعة على الشاشة، وأسرع من يكتب الكلمة بدقة في شات البث يحصل على النقطة ويتصدر السباق!',
    typeRaceFeat1: 'حساب سرعة رد الفعل بدقة أجزاء الثانية ولوحة صدارة حية',
    typeRaceFeat2: 'بنك كلمات ضخم ومتنوع (ألعاب، ميمز، مصطلحات تقنية وتحديات)',
    typeRaceFeat3: 'أول من يصل إلى النقاط المطلوبة يُتوّج كبطل لسباق الكتابة 👑',

    // Game 6: Hangman (Word Guess Challenge)
    hangmanTitle: 'تحدي الكلمة المخفية (Hangman / Wordle)',
    hangmanTag: 'تحدي الذكاء 🕵️',
    hangmanDesc: 'يدخل الستريمر كلمة سرية مخفية مشفرة. يملك كل متابع في الشات 5 محاولات لتخمين الكلمة مع إشارات ملونة (أخضر، أصفر، رمادي) تكشف تموضع الحروف! أسرع من يحزر يفوز.',
    hangmanFeat1: 'إدخال آمن ومشفر للكلمة بدون أي تسريب لشاشة البث أو المشاهدين',
    hangmanFeat2: '5 محاولات لكل متسابق مع تقييم ألوان الحروف (أخضر، أصفر، رمادي)',
    hangmanFeat3: 'مؤقت تنازلي عام وكشف تدريجي وتلقائي عند انتهاء الوقت',

    // Game 7: Subway Runner
    subwayRunnerTitle: 'مسار الهروب السريع (Subway Runner)',
    subwayRunnerTag: 'سرعة وردة فعل 🏃‍♂️',
    subwayRunnerDesc: 'شخصية تركض بأقصى سرعة على مسار سكة حديد بثلاثة مسارات! تظهر عقبات مفاجئة على الشاشة وتتطلب من الجميع كتابة الأوامر (قفز، انزل، يسار، يمين) لتفادي الاصطدام. تزداد السرعة باستمرار!',
    subwayRunnerFeat1: 'مسار ثلاثي الأبعاد تفاعلي مع قفز، انزلاق، وتغيير المسارات',
    subwayRunnerFeat2: 'تعرف فوري على أوامر الشات مع 3 قلوب ومحاولات لكل مشارك',
    subwayRunnerFeat3: 'تسارع تدريجي للسرعة مع تقليص مهلة رد الفعل حتى 1.6 ثانية ⚡',

    // How It Works
    howItWorksTitle: 'كيف تعمل منصة ChatWar في بثك؟',
    howItWorksSub: 'ثلاث خطوات بسيطة لتبدأ التفاعل مع متابعيك',
    step1Title: '1. اكتب اسم قناتك',
    step1Desc: 'أدخل اسم قناتك على تويتش لبدء الاتصال الفوري بدردشة البث وقراءة رسائل المشاهدين تلقائياً.',
    step2Title: '2. شغّل مسرح اللعبة',
    step2Desc: 'افتح غرفة اللعبة التفاعلية مباشرة على شاشتك مع قراءة تلقائية وفورية لأوامر الشات.',
    step3Title: '3. ابدأ اللعب مع الشات',
    step3Desc: 'اطلب من المتابعين كتابة !join ليدخلوا اللعبة وتدور العجلة أمام الجميع في البث!',

    // Controller Room
    roomController: 'غرفة تحكم',
    liveLobby: 'مباشر (لوبي)',
    running: 'جارية الآن',
    roomId: 'رمز الغرفة',
    channelChat: 'شات القناة',
    timerLabel: 'مهلة القرار',
    unlimitedTimer: 'غير محدود (بدون وقت)',
    seconds: 'ثانية',
    gameRulesBtn: '📜 قوانين اللعبة',
    gameSettingsBtn: '⚙️ إعدادات الجولة',
    copyObsBtn: '📋 نسخ رابط OBS Overlay',
    copiedObsBtn: '✓ تم نسخ رابط OBS!',
    previewObs: '↗ معاينة',
    chatStatusConnected: 'متصل الآن بقناة',
    chatStatusConnecting: 'جاري الاتصال بالشات...',
    changeChannel: 'تغيير اسم القناة',
    connectBtn: 'اتصال',
    spinWheelBtn: '🎲 تدوير العجلة',
    lockEntriesBtn: '🔒 قفل الدخول',
    openLobbyBtn: '🔓 فتح اللوبي',
    resetGameBtn: '↺ إعادة ضبط',
    focusModeBtn: '🔍 تكبير مسرح الروليت والتركيز',
    exitFocusBtn: 'تصغير العرض ←',
    chatSimulatorTitle: 'أداة محاكاة رسائل وأوامر الشات',
    chatSimulatorSub: 'لتجربة الأوامر بدون شات لايف',
    autoFillBtn: '+ إضافة 6 متسابقين تجريبيين',
    contendersRoster: 'قائمة المتسابقين',
    emptyLobbyMsg: 'اللوبي فارغ حالياً. اطلب من المتابعين كتابة !join في الشات.',
    actionFeedTitle: 'سجل أحداث الشات واللعبة',
    latestEvent: 'آخر حدث',
    awaitingCommands: 'بانتظار انطلاق الجولة...',
    alive: 'على قيد الحياة',
    eliminated: 'مستبعد',
    revived: 'تم إنعاشه (1x)',
    championDeclared: '👑 بطل جولة الروليت • ARENA CHAMPION 👑',
    totalKills: 'الاستبعادات',
    turnOfPlayer: '👉 الدور على اللاعب',
    timeIsUnlimitedNotice: 'الوقت مفتوح (بدون مهلة زمنية). اكتب !kill أو !revive في الشات للمتابعة.',
    wheelStageTitle: 'عجلة الروليت التفاعلية (مسرح البث)',
    wheelStageSub: 'تدور وتتباطأ لاختيار المنفذ التالي عشوائياً',
    kickPlayerPrompt: 'هل أنت متأكد من طرد المتسابق رقم',
    kickTooltip: 'طرد اللاعب من اللوبي',
    eliminateBtn: 'استبعاد 💥',
    reviveBtn: 'إنعاش ✨',
    kills: 'الاستبعادات:',
    revivedBadge: 'مُنعش',
    clickToKick: 'انقر على ✕ على أي بطاقة لطرد المتسابق فوراً',
    totalContenders: 'إجمالي المشاركين',
    quickActions: 'إجراءات سريعة:',
    killPlayerShort: 'استبعاد',
    battleFeed: 'سجل المعركة',
    simulatorTab: 'محاكي الشات',
    soleSurvivor: 'الناجي الأخير',
    typeJoinToEnter: 'اكتب !join في الشات للدخول',
    chatInstructions: 'اكتب في الشات: !kill <رقم> للاستبعاد أو !revive <رقم> للإنعاش',
    turnTimerCountdown: 'عداد مهلة اتخاذ القرار',
    secondsRemaining: 'ثانية',
    noLogsYet: 'بانتظار انطلاق أحداث الجولة...',
    simulateKillFrom: 'محاكاة: `!kill 1` (من اللاعب',
    simulateReviveFrom: 'محاكاة: `!revive 2` (من اللاعب',
    viewerPlaceholder: 'اسم المشاهد في الشات (مثل أحمد)',
    commandPlaceholder: 'الأمر مثل !join أو !kill 2',
    sendToChatBtn: 'إرسال للشات',

    // Roster Filters & Revivable Section
    allContendersTab: 'الكل',
    aliveContendersTab: 'الأحياء',
    revivableContendersTab: 'المؤهلون للإنعاش ✨',
    eliminatedContendersTab: 'المستبعدون 💀',
    revivablePlayersTitle: '✨ المتسابقون المستبعدون المؤهلون للإنعاش',
    noRevivablePlayers: 'لا يوجد متسابقون مستبعدون مؤهلون للإنعاش',
    canBeRevivedBadge: 'قابل للإنعاش',
    reviveThisPlayer: 'إنعاش',

    // Available Powers Indicators
    availablePowersTitle: '🎯 الصلاحيات المتاحة للمتسابق:',
    powerKillAndRevive: '💥 قتل (استبعاد) + ✨ إنعاش متسابق',
    powerKillOnly: '💥 قتل فقط',
    reviveUsedNote: 'استهلك فرصة الإنعاش مسبقاً ❌',
    noRevivableNote: 'لا يوجد متسابقين للإنعاش',
    reviveAvailableBadge: '✨ الإنعاش متاح',
    reviveUsedBadge: '⚡ استهلك الإنعاش',

    // Rules Modal - Roulette
    rulesModalTitle: 'قوانين وطريقة لعب روليت الاستبعاد',
    rulesModalSub: 'دليل الستريمر والمشاهدين لقواعد الجولة',
    closeRulesBtn: 'فهمت القوانين، إغلاق',
    rule1Title: '1. مرحلة دخول اللوبي (Lobby)',
    rule1Desc: 'يقوم الستريمر بفتح اللوبي، ويكتب المشاهدون أمر !join في شات تويتش للانضمام وتأخذ كل مشاركة رقماً تسلسلياً خاصاً به.',
    rule2Title: '2. تدوير العجلة واختيار المنفذ',
    rule2Desc: 'يضغط الستريمر على زر تدوير العجلة، فتدور الروليت وتتباطأ تدريجياً لاختيار أحد المتسابقين الأحياء عشوائياً.',
    rule3Title: '3. خيارات القرار: الاستبعاد أو الإنعاش',
    rule3Desc: 'اللاعب المختار يملك مهلة محددة في الشات لكتابة !kill <رقم> للاستبعاد أو !revive <رقم> للإنعاش.',
    rule4Title: '4. ضوابط وقوانين الإنعاش الصارمة',
    rule4Desc: 'يمكن لكل لاعب استخدام ميزة الإنعاش مرة واحدة فقط. ولا يمكن إنعاش أي متسابق أكثر من مرة واحدة.',
    rule5Title: '5. الفوز بالجولة (Victory Royale)',
    rule5Desc: 'تستمر جولات الاستبعاد حتى يتبقى متسابق واحد فقط حي، ويتم تتويجه كبطل السيرفر مع احتفالات بصرية!',

    // Rules Modal - Trivia
    triviaRulesModalTitle: 'قوانين وطريقة مسابقة الأسئلة العامة',
    triviaRulesModalSub: 'دليل الستريمر والمشاهدين لقواعد ونظام النقاط في المسابقة',
    triviaRule1Title: '1. إعداد وبدء المسابقة (Lobby)',
    triviaRule1Desc: 'يقوم الستريمر باختيار فئات الأسئلة وعددها والمهلة الزمنية، ثم يضغط على زر "بدء المسابقة" لإطلاق السؤال الأول.',
    triviaRule2Title: '2. طريقة التصويت والإجابة من الشات',
    triviaRule2Desc: 'يكتب المشاهدون في شات البث رقم أو حرف الإجابة (1، 2، 3، 4 أو A، B، C، D). يسجل كل مشاهد صوتاً واحداً لكل سؤال.',
    triviaRule3Title: '3. احتساب النقاط ومضاعف السلسلة (Streaks)',
    triviaRule3Desc: 'كل إجابة صحيحة تمنح المتسابق +100 نقطة. والإجابات الصحيحة المتتالية تفعل مضاعف سلسلة الفوز (🔥 x2, 🔥 x3) لزيادة النقاط بسرعة!',
    triviaRule4Title: '4. إحصائيات التصويت الحي وكشف النتيجة',
    triviaRule4Desc: 'تظهر نسب أصوات الشات بشكل فوري ومباشر على الشاشة، وتُكشف الإجابة الصحيحة مع معلومة إثرائية عند انتهاء الوقت أو يدوياً.',
    triviaRule5Title: '5. تتويج بطل المسابقة (Trivia Champion)',
    triviaRule5Desc: 'في نهاية الأسئلة، تظهر لوحة الصدارة الشاملة ويتم تتويج المتسابق صاحب أعلى مجموع نقاط كبطل المسابقة!',

    // Rules Modal - Board Party
    boardRulesModalTitle: 'قوانين حرب المتاهة والألعاب المصغرة',
    boardRulesModalSub: 'دليل الستريمر والمتابعين لقواعد المتاهة والتصويت والميني جيم',
    boardRule1Title: '1. توزيع المشاهدين على 4 فرق متوازنة',
    boardRule1Desc: 'يكتب المشاهدون أمر !join ويتم توزيعهم تلقائياً بالتساوي بين الفريق القرمزي 🔴، الأزرق 🔵، الزمردي 🟢، والكهرماني 🟡.',
    boardRule2Title: '2. رمي النرد من الستريمر وتحرك البيدق',
    boardRule2Desc: 'يقوم الستريمر برمي النرد الرقمي (1-6) بالتناوب لكل فريق، ويتحرك بيدق الفريق عبر مسارات المتاهة.',
    boardRule3Title: '3. تصويت الفريق على الاتجاه عند التقاطعات',
    boardRule3Desc: 'عند وصول البيدق إلى مفترق طرق أو تقاطع في المتاهة، يصوت أعضاء الفريق في الشات (!up, !down, !left, !right أو بالعربي !فوق, !تحت, !يسار, !يمين) لاختيار المسار!',
    boardRule4Title: '4. الكأس المتنقل الأسطوري 🏆 وتغيير موقعه',
    boardRule4Desc: 'شراء الكأس يكلف 30 عملة عند المرور عليه أو الهبوط عليه. بمجرد أن يحصل عليه أي فريق، ينتقل الكأس فوراً إلى موقع عشوائي جديد داخل المتاهة!',
    boardRule5Title: '5. الألعاب المصغرة بعد كل جولة والتتويج',
    boardRule5Desc: 'بعد أن تنتهي الفرق الـ 4 من أدوارها، تنطلق لعبة مصغرة (Minigame) تنافسية لربح عملات إضافية! الفريق الأكثر جمعاً للكؤوس يتوج بالبطولة!',

    // Rules Modal - Grid Royale
    gridRoyaleRulesModalTitle: 'قوانين وطريقة لعب حلبة البقاء (Grid Royale)',
    gridRoyaleRulesModalSub: 'دليل الستريمر والمتابعين لقواعد الحلبة وانكماش العاصفة وسرعة حجز المربعات',
    gridRule1Title: '1. شبكة حلبة البقاء المكونة من 16 مربعاً',
    gridRule1Desc: 'تنطلق المباراة بشبكة 4x4 (16 مربعاً من A1 إلى D4 أو 1 إلى 16). عند بدء كل موجة يبدأ عداد زحف العاصفة.',
    gridRule2Title: '2. حجز المربعات الآمنة بأسبقية الشات',
    gridRule2Desc: 'يكتب المشاهدون في الشات رمز المربع الآمن (!A1, !B2, !12). من يكتب أولاً يحجز المربع، وعند اكتمال سعة المربع يُقفل أمام البقية.',
    gridRule3Title: '3. انكماش العاصفة والاستبعاد الفوري',
    gridRule3Desc: 'عند انتهاء وقت الموجة، تنفجر المربعات الخطرة بالصواعق وتستبعد كل متسابق لم ينجح في حجز مكان آمن داخل المربعات المتبقية.',
    gridRule4Title: '4. تقليص المساحات وموجة الحسم المباشر',
    gridRule4Desc: 'تتقلص المربعات الآمنة في كل موجة (16 ثم 12 ثم 8 ثم 4 وأخيراً مربع واحد حاسم) حتى يبقى متسابق واحد فقط.',
    gridRule5Title: '5. تتويج بطل حلبة البقاء (Grid Champion)',
    gridRule5Desc: 'آخر ناجٍ يصمد حتى نهاية الموجة الأخيرة يتوج بطلاً لحلبة البقاء وصاحب أسرع ردة فعل مع احتفالات بصرية!',

    // Rules Modal - Type Race
    typeRaceRulesModalTitle: 'قوانين وطريقة لعب سباق سرعة الكتابة (Type Race)',
    typeRaceRulesModalSub: 'دليل الستريمر والمشاهدين لسباق الكتابة وحساب سرعة الاستجابة بأجزاء الثانية',
    typeRule1Title: '1. الانضمام والتسجيل في اللوبي',
    typeRule1Desc: 'يكتب المشاهدون !join في الشات للانضمام وتسجيل أسمائهم وصورهم في لوحة الصدارة.',
    typeRule2Title: '2. ظهور الكلمة وشريط التوقيت',
    typeRule2Desc: 'عند بدء الجولة، تظهر الكلمة أو العبارة التنافسية على الشاشة مع شريط توقيت سريع وتأثيرات بصرية.',
    typeRule3Title: '3. أسبقية الإجابة الصحيحة',
    typeRule3Desc: 'أول متسابق يكتب الكلمة بدقة في الشات يحسم الجولة لصالحه ويكسب نقطة فورية!',
    typeRule4Title: '4. حساب السرعة بدقة المللي ثانية',
    typeRule4Desc: 'يقوم النظام بحساب زمن كتابة الكلمة من لحظة ظهورها على الشاشة وحتى وصول الرسالة بدقة أجزاء الثانية.',
    typeRule5Title: '5. هدف الفوز وتتويج البطل',
    typeRule5Desc: 'أول متسابق يصل إلى عدد النقاط المستهدف (مثلاً 3 أو 5 نقاط) يُتوّج كبطل لسباق سرعة الكتابة!',

    // Rules Modal - Hangman
    hangmanRulesModalTitle: 'قوانين وطريقة لعب تحدي الكلمة المخفية',
    hangmanRulesModalSub: 'دليل الستريمر والمشاهدين لقواعد التخمين، المحاولات الـ 5 وألوان الحروف',
    hangmanRule1Title: '1. إدخال الكلمة السرية بأمان',
    hangmanRule1Desc: 'يدخل الستريمر كلمة التحدي بسرية تامة (أو يختار من البنك الجاهز). الكلمة مشفرة تماماً ولا تظهر في الشاشة أو كود الصفحة.',
    hangmanRule2Title: '2. تخمين الكلمة من الشات',
    hangmanRule2Desc: 'يخمن المتابعون الكلمة عبر الشات بكتابة الكلمة مباشرة أو باستخدام أمر !guess <كلمة> أو !تخمين <كلمة>.',
    hangmanRule3Title: '3. مؤشرات ألوان الحروف التفاعلية',
    hangmanRule3Desc: 'يظهر لكل تخمين إشارات ملونة: 🟩 أخضر (الحرف بمكانه الصحيح)، 🟨 أصفر (الحرف موجود بمكان مختلف)، ⬛ رمادي (الحرف غير موجود). الحروف الصحيحة تنكشف على اللوحة.',
    hangmanRule4Title: '4. خمس محاولات فقط لكل مشارك',
    hangmanRule4Desc: 'يملك كل متسابق 5 محاولات تخمين بالضبط. بعد استنفاد المحاولات الـ 5 يُقفل التخمين على اللاعب حتى الجولة التالية.',
    hangmanRule5Title: '5. مهلة الوقت وتتويج الفائز',
    hangmanRule5Desc: 'أسرع من يخمن الكلمة بالكامل يفوز بالجولة فوراً! وإذا نفد الوقت دون فائز، يتم كشف الكلمة الأصلية أمام الجميع بحماس.',

    // Rules Modal - Hot Potato
    hotPotatoRulesModalTitle: 'قوانين وطريقة لعب القنبلة الموقوتة',
    hotPotatoRulesModalSub: 'دليل الستريمر والمشاهدين للتمرير السريع، الفتيل السري، وتفادي الانفجار',
    hotPotatoRule1Title: '1. الفتيل السري الموقوت',
    hotPotatoRule1Desc: 'يتم إشعال القنبلة وتسليمها للاعب عشوائي مع وقت انفجار سري (من 15 إلى 35 ثانية). لا أحد يعلم اللحظة المحددة للانفجار!',
    hotPotatoRule2Title: '2. التمرير السريع (!pass <رقم>)',
    hotPotatoRule2Desc: 'حامل القنبلة الحالي يجب أن يمررها فوراً بكتابة !pass <رقم> أو !pass @اسم_اللاعب في الشات لتمريرها للاعب آخر حي.',
    hotPotatoRule3Title: '3. الرمي العشوائي (!pass أو !مرر)',
    hotPotatoRule3Desc: 'كتابة !pass أو !مرر بمفردها بدون رقم يرمي القنبلة عشوائياً لأي متسابق حي آخر!',
    hotPotatoRule4Title: '4. الانفجار والاستبعاد الفوري',
    hotPotatoRule4Desc: 'عند وصول العداد لصفر، تنفجر القنبلة فوراً! من يحملها في تلك اللحظة يُستبعد نهائياً من الجولة.',
    hotPotatoRule5Title: '5. تتويج الناجي الأخير',
    hotPotatoRule5Desc: 'تستمر الجولات تباعاً مع الناجين حتى يتبقى متسابق واحد فقط، ليتوج بطلاً للقنبلة الموقوتة 👑!',

    // Rules Modal - Subway Runner
    subwayRunnerRulesModalTitle: 'قوانين وطريقة لعب مسار الهروب السريع (Subway Runner)',
    subwayRunnerRulesModalSub: 'دليل الستريمر والمشاهدين لتفادي العقبات، التحكم بالشخصية عبر الشات، والسرعة المتزايدة',
    subwayRule1Title: '1. الانضمام التلقائي من الشات',
    subwayRule1Desc: 'ينضم المتابعون تلقائياً بمجرد كتابة أي أمر في الشات (jump, duck, left, right أو بالعربي قفز، انزل، يسار، يمين)، ويبدأ كل لاعب بـ 3 قلوب (❤️❤️❤️).',
    subwayRule2Title: '2. ظهور أوامر العقبات على الشاشة',
    subwayRule2Desc: 'تظهر عقبات مفاجئة (حواجز منخفضة، عوارض علوية، قطارات، صخور). وتظهر على الشاشة شارة مضيئة توضح الأمر المطلوب مثل: قفز! أو يمين! أو انزل! أو يسار!',
    subwayRule3Title: '3. نافذة ردة الفعل السريعة',
    subwayRule3Desc: 'يجب على كل متسابق كتابة الأمر المطلوب قبل نفاد شريط التوقيت على الشاشة، وإلا يفقد قلباً واحداً من محاولاته.',
    subwayRule4Title: '4. تسارع السرعة وتحدي الوقت',
    subwayRule4Desc: 'مع كل 5 عقبات يتم تفاديها، ترتفع سرعة اللعبة درجة إضافية وتنكمش نافذة رد الفعل من 4.2 ثانية نزولاً إلى 1.6 ثانية فقط!',
    subwayRule5Title: '5. تتويج بطل المسافة والناجي الأسطوري',
    subwayRule5Desc: 'تستمر الجولة حتى استبعاد القلوب أو نهاية المسار، ويتوج المتسابق صاحب أعلى مسافة وصمود بطلاً للسباق 👑!',

    // Settings Modal
    settingsModalTitle: 'إعدادات وقواعد الجولة',
    settingsModalSub: 'تخصيص الوقت، الإنعاش، وقدرة استيعاب اللوبي',
    timerSettingLabel: '⏱️ نظام مهلة اتخاذ القرار (Turn Timer):',
    limitedTimerBtn: 'محدد بوقت (ثوانٍ)',
    unlimitedTimerBtn: '♾️ بدون وقت (غير محدود)',
    seconds10: '10 ثوانٍ (سريع وحماسي)',
    seconds15: '15 ثانية (الافتراضي والمتوازن)',
    seconds20: '20 ثانية (مناسب للشات المتوسط)',
    seconds30: '30 ثانية (مهلة مريحة)',
    seconds60: '60 ثانية (دقيقة كاملة لكل دور)',
    allowRevivesLabel: '✨ السماح بالإنعاش (!revive)',
    allowRevivesSub: 'تمكين المتسابق من إنعاش حليف لمرة واحدة',
    maxPlayersLabel: '👥 سعة اللوبي القصوى:',
    commandsSettingsTitle: '⌨️ تخصيص أوامر وكلمات الشات المفتاحية',
    commandsSettingsSub: 'يمكنك كتابة عدة كلمات مفتاحية مفصولة بفواصل (مثل !join، !دخول، !انضمام)',
    joinCommandsLabel: '🟢 أوامر الانضمام للمباراة:',
    joinCommandsPlaceholder: '!join, !دخول, !انضمام, !شارك',
    killCommandsLabel: '🔴 أوامر القتل والاستبعاد:',
    killCommandsPlaceholder: '!kill, !قتل, !استبعاد, !طرد',
    reviveCommandsLabel: '🟡 أوامر الإنعاش والعودة:',
    reviveCommandsPlaceholder: '!revive, !انعاش, !إنعاش, !احياء',
    cancel: 'إلغاء',
    saveSettings: '💾 حفظ وتطبيق الإعدادات',

    // Platform Connect Modal
    platformModalTitle: 'اختر منصة البث',
    platformModalSub: 'اختر منصة واحدة على الأقل للمتابعة',
    autoConnectAlways: 'اتصال تلقائي دائماً',
    autoConnectSub: 'سيتطلب إدخال البيانات في كل مرة إذا تم التعطيل',
    connectStreamBtn: 'اتصال',
    closeModal: 'إلغاء',

    // Broadcaster Ownership Verification
    verifiedBroadcaster: '🛡️ مالك القناة المعتمد',
    unverifiedBroadcaster: '⚠️ بانتظار تأكيد الملكية',
    verificationPromptTitle: '🔒 تأكيد ملكية قناة التويتش',
    verificationPromptSub: 'لتأكيد أنك صاحب القناة الفعلي، اكتب هذا الكود في شات قناتك على تويتش:',
    copyVerifyCommand: 'نسخ الأمر',
    copiedVerifyCommand: 'تم النسخ!',
    verifyWithOAuthBtn: 'توثيق فوري بنقرة عبر تويتش 🟣',
    broadcasterVerifiedNotice: '✅ تم التحقق وتأكيد أنك صاحب القناة الفعلي!',
    simulateVerifyFrom: 'محاكاة: `!verify` (من صاحب القناة)'
  }
};

const currentLocale = ref<Locale>('en');

export function formatGameLog(log: any, isRtlValue?: boolean): string {
  if (!log) return '';
  const isArabic = isRtlValue !== undefined ? isRtlValue : currentLocale.value === 'ar';

  if (log.type === 'KILL') {
    if (log.actor && log.target) {
      return isArabic
        ? `💥 قام المتسابق ${log.actor} باستبعاد ${log.target}!`
        : `💥 Player ${log.actor} eliminated ${log.target}!`;
    }
    return isArabic ? '💥 تم استبعاد متسابق!' : '💥 A player was eliminated!';
  }

  if (log.type === 'REVIVE') {
    if (log.actor && log.target) {
      return isArabic
        ? `✨ قام المتسابق ${log.actor} بإنعاش ${log.target}!`
        : `✨ Player ${log.actor} revived ${log.target}!`;
    }
    return isArabic ? '✨ تم إنعاش متسابق!' : '✨ A player was revived!';
  }

  if (log.type === 'SPIN') {
    return isArabic ? '🎲 تدور العجلة لاختيار المتسابق القادم...' : '🎲 The wheel is spinning...';
  }

  if (log.type === 'JOIN') {
    if (log.actor) {
      return isArabic
        ? `🎯 انضم المتسابق ${log.actor} إلى اللوبي!`
        : `🎯 Player ${log.actor} joined the lobby!`;
    }
    return isArabic ? '🎯 انضم متسابق جديد!' : '🎯 A new player joined!';
  }

  if (log.type === 'TIMEOUT') {
    if (log.actor) {
      return isArabic
        ? `⏱️ انتهت مهلة المتسابق ${log.actor} وتم تمرير الدور.`
        : `⏱️ ${log.actor}'s turn timed out. Turn passed.`;
    }
    return isArabic ? '⏱️ انتهت المهلة.' : '⏱️ Turn timed out.';
  }

  if (log.type === 'WIN') {
    if (log.actor) {
      return isArabic
        ? `👑 توج المتسابق ${log.actor} كبطل لجولة اللعب!`
        : `👑 ${log.actor} is crowned the Champion!`;
    }
    return isArabic ? '👑 تم تتويج البطل!' : '👑 Champion crowned!';
  }

  if (log.type === 'GRID_MOVE') {
    if (log.actor && log.target) {
      return isArabic
        ? `🏃 حجز المتسابق ${log.actor} مكاناً في المربع الآمن [${log.target}]!`
        : `🏃 ${log.actor} claimed a safe spot in tile [${log.target}]!`;
    }
    return log.message || '';
  }

  if (log.type === 'GRID_COLLAPSE') {
    return isArabic
      ? `⚡ ضربت العاصفة وانهارت المربعات الخطرة! ${log.message || ''}`
      : `⚡ Storm struck and collapsed danger tiles! ${log.message || ''}`;
  }

  if (log.type === 'INFO') {
    if (log.message?.includes('تم فتح اللوبي') || log.message?.toLowerCase().includes('lobby opened')) {
      return isArabic ? '🎮 تم فتح اللوبي لدخول اللاعبين.' : '🎮 Lobby opened for new players.';
    }
    if (log.message?.includes('تم قفل الدخول') || log.message?.toLowerCase().includes('entries locked')) {
      return isArabic ? '🔒 تم قفل باب المشاركة.' : '🔒 Entries locked. Ready to start.';
    }
    if (log.message?.includes('إعادة ضبط') || log.message?.toLowerCase().includes('reset')) {
      return isArabic ? '↺ تمت إعادة ضبط اللعبة.' : '↺ Game has been reset.';
    }
    if (log.message?.includes('طرد') || log.message?.toLowerCase().includes('kicked')) {
      return isArabic ? `🚫 تم طرد متسابق من اللوبي.` : `🚫 A player was removed from the lobby.`;
    }
    if (log.message?.includes('إعدادات') || log.message?.toLowerCase().includes('settings')) {
      return isArabic ? '⚙️ تم تحديث إعدادات اللعبة.' : '⚙️ Game settings updated.';
    }
    if (log.message?.includes('استبعاد جميع') || log.message?.toLowerCase().includes('all players')) {
      return isArabic ? '💀 تم استبعاد جميع اللاعبين.' : '💀 All players eliminated. No winner.';
    }
  }

  if (!isArabic && log.message && /[\u0600-\u06FF]/.test(log.message)) {
    if (log.message.includes('بطل') || log.message.includes('فاز')) {
      return log.actor ? `👑 Champion! ${log.actor} won the match!` : '👑 Champion crowned!';
    }
    if (log.message.includes('انتهى السباق') || log.message.includes('صمد الجميع') || log.message.includes('انتهت اللعبة')) {
      return '🏁 Game concluded! Great effort by all contenders!';
    }
    if (log.message.includes('قنبلة') || log.message.includes('انفجار') || log.message.includes('انفجرت')) {
      return '💥 The bomb exploded!';
    }
    if (log.message.includes('تمرير') || log.message.includes('مرر')) {
      return '💣 The bomb was passed!';
    }
    if (log.message.includes('أسرع') || log.message.includes('كتب')) {
      return log.actor ? `⚡ ${log.actor} typed the fastest!` : '⚡ Round point awarded!';
    }
    if (log.message.includes('تخمين') || log.message.includes('كلمة') || log.message.includes('حزر')) {
      return log.actor ? `🕵️ ${log.actor} solved the word!` : '🕵️ Word guessed!';
    }
    if (log.message.includes('إجابة') || log.message.includes('سؤال')) {
      return log.actor ? `💡 ${log.actor} answered correctly!` : '💡 Correct answer!';
    }
    if (log.message.includes('اصطدم') || log.message.includes('عائق')) {
      return log.actor ? `💥 ${log.actor} hit an obstacle!` : '💥 Obstacle collision!';
    }
    return '⚡ Live match event';
  }

  return log.message || '';
}

export function getDisplayCommands(
  customList: string[] | undefined,
  type: 'join' | 'kill' | 'revive',
  isArabic: boolean
): string[] {
  const hasArabicChars = (str: string) => /[\u0600-\u06FF]/.test(str);

  if (customList && customList.length > 0) {
    if (isArabic) {
      return customList;
    } else {
      const enOnly = customList.filter((cmd) => !hasArabicChars(cmd));
      if (enOnly.length > 0) return enOnly;
      return type === 'join' ? ['!join'] : type === 'kill' ? ['!kill'] : ['!revive'];
    }
  }

  if (isArabic) {
    return type === 'join'
      ? ['!join', '!دخول']
      : type === 'kill'
      ? ['!kill', '!قتل']
      : ['!revive', '!انعاش'];
  } else {
    return type === 'join'
      ? ['!join']
      : type === 'kill'
      ? ['!kill']
      : ['!revive'];
  }
}

export function useTranslation() {
  function updateDocumentTitle(loc: Locale) {
    if (typeof document !== 'undefined') {
      document.title = (translations[loc] as any)?.pageTitle || 'ChatWar';
    }
  }

  function setLocale(locale: Locale) {
    currentLocale.value = locale;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatwar_locale', locale);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
      document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
      updateDocumentTitle(locale);
    }
  }

  function toggleLocale() {
    setLocale(currentLocale.value === 'en' ? 'ar' : 'en');
  }

  function t(key: keyof typeof translations['en']): string {
    const dict = translations[currentLocale.value] || translations.en;
    return dict[key] || translations.en[key] || key;
  }

  const isRtl = computed(() => currentLocale.value === 'ar');
  const locale = computed(() => currentLocale.value);

  onMounted(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('chatwar_locale') as Locale | null;
      if (savedLocale && (savedLocale === 'ar' || savedLocale === 'en')) {
        currentLocale.value = savedLocale;
      }
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', currentLocale.value);
      document.documentElement.setAttribute('dir', currentLocale.value === 'ar' ? 'rtl' : 'ltr');
      updateDocumentTitle(currentLocale.value);
    }
  });

  return {
    locale,
    isRtl,
    setLocale,
    toggleLocale,
    t,
    formatGameLog,
    getDisplayCommands
  };
}

