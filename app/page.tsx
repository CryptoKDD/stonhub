'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, Target, ArrowLeftRight, Trophy, 
  Sparkles, CheckCircle2, AlertCircle, 
  ChevronRight, Flame, Award, HelpCircle,
  TrendingUp, RefreshCw, Users, Play, Compass
} from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

// === interfaces ===
interface Lesson {
  id: string;
  title: string;
  category: string;
  description: string;
  xpReward: number;
  readTime: string;
  completed: boolean;
  duration: string;
  views: string;
  uploadedAt: string;
  imageUrl: string;
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
  };
  content?: string[];
}

interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'social' | 'web3' | 'daily';
  status: 'available' | 'pending' | 'completed';
  link: string;
}

interface Leader {
  rank: number;
  name: string;
  xp: number;
  badge: string;
  isCurrentUser?: boolean;
}


// === Dynamic Premium Token Logos (Proxied to bypass CORS/Hotlink restrictions and load exact official assets) ===
const TokenLogo = ({ symbol, className = "w-4 h-4 rounded-full shrink-0" }: { symbol: string; className?: string }) => {
  const [hasError, setHasError] = useState(false);
  const [tryRemote, setTryRemote] = useState(false);

  // Find token metadata matching symbol
  const tokenKey = Object.keys(SWAP_TOKENS).find(
    k => k.toLowerCase() === symbol.toLowerCase() || SWAP_TOKENS[k as keyof typeof SWAP_TOKENS].symbol.toLowerCase() === symbol.toLowerCase()
  ) as keyof typeof SWAP_TOKENS | undefined;
  
  const token = tokenKey ? SWAP_TOKENS[tokenKey] : null;
  let logoUrl = token ? token.logo : '';
  
  // Alternative highly reliable CDNs/URLs for popular tokens to bypass local blocks
  const symbolUpper = symbol.toUpperCase();
  if (symbolUpper === 'TON') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/TON/logo.png';
  } else if (symbolUpper === 'USDT' || symbolUpper === 'USD\u20AE') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/USD%E2%82%AE/logo.png';
  } else if (symbolUpper === 'STON') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/STON/logo.png';
  } else if (symbolUpper === 'NOT') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/NOT/logo.png';
  } else if (symbolUpper === 'DOGS') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/DOGS/logo.png';
  } else if (symbolUpper === 'TSTON' || symbolUpper === 'TSTON') {
    logoUrl = 'https://raw.githubusercontent.com/tonkeeper/ton-assets/main/jettons/tsTON/logo.png';
  }

  const proxiedUrl = logoUrl 
    ? `https://images.weserv.nl/?url=${encodeURIComponent(logoUrl)}&w=48&h=48&fit=cover`
    : `https://images.weserv.nl/?url=https%3A%2F%2Fraw.githubusercontent.com%2Ftonkeeper%2Fton-assets%2Fmain%2Fbranding%2Ftonkeeper%2Flogo_128x128.png&w=48&h=48&fit=cover`;

  // Get fallback styles for a premium gradient-based letter avatar
  const getFallbackStyle = (sym: string) => {
    const s = sym.toUpperCase();
    switch (s) {
      case 'TON':
        return {
          bg: 'bg-gradient-to-br from-[#0088CC] to-[#005588]',
          text: 'text-white',
          glow: 'shadow-[#0088CC]/30 border-[#0088CC]/30',
          char: 'T'
        };
      case 'STON':
        return {
          bg: 'bg-gradient-to-br from-[#FF9900] to-[#FF5500]',
          text: 'text-black font-extrabold',
          glow: 'shadow-[#FF9900]/30 border-[#FF9900]/30',
          char: 'S'
        };
      case 'USDT':
      case 'USD\u20AE':
      case 'JUSDT':
        return {
          bg: 'bg-gradient-to-br from-[#009393] to-[#005252]',
          text: 'text-white',
          glow: 'shadow-[#009393]/30 border-[#009393]/30',
          char: 'U'
        };
      case 'USDC':
      case 'JUSDC':
        return {
          bg: 'bg-gradient-to-br from-[#2775CA] to-[#143A6B]',
          text: 'text-white',
          glow: 'shadow-[#2775CA]/30 border-[#2775CA]/30',
          char: 'C'
        };
      case 'TSTON':
        return {
          bg: 'bg-gradient-to-br from-[#0088CC] via-[#4EAEFF] to-[#004477]',
          text: 'text-white',
          glow: 'shadow-[#0088CC]/30 border-[#4EAEFF]/30',
          char: 't'
        };
      case 'NOT':
        return {
          bg: 'bg-gradient-to-br from-[#E5C158] to-[#9E8231]',
          text: 'text-black font-extrabold',
          glow: 'shadow-[#E5C158]/30 border-[#E5C158]/30',
          char: 'N'
        };
      case 'DOGS':
        return {
          bg: 'bg-gradient-to-br from-[#FFFFFF] to-[#888888]',
          text: 'text-black font-extrabold',
          glow: 'shadow-white/20 border-white/20',
          char: 'D'
        };
      case 'REDO':
        return {
          bg: 'bg-gradient-to-br from-[#E02424] to-[#7A1212]',
          text: 'text-white',
          glow: 'shadow-[#E02424]/30 border-[#E02424]/30',
          char: 'R'
        };
      case 'CATI':
        return {
          bg: 'bg-gradient-to-br from-[#FF8A65] to-[#D84315]',
          text: 'text-white',
          glow: 'shadow-[#FF8A65]/30 border-[#FF8A65]/30',
          char: 'C'
        };
      case 'HMSTR':
        return {
          bg: 'bg-gradient-to-br from-[#D2B48C] to-[#8B5A2B]',
          text: 'text-white',
          glow: 'shadow-[#D2B48C]/30 border-[#D2B48C]/30',
          char: 'H'
        };
      default: {
        // Deterministic gradient from the symbol name characters
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
          hash = s.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h1 = Math.abs(hash % 360);
        const h2 = (h1 + 40) % 360;
        return {
          style: { background: `linear-gradient(135deg, hsl(${h1}, 75%, 45%), hsl(${h2}, 85%, 25%))` },
          bg: '',
          text: 'text-white',
          glow: 'shadow-black/20 border-white/10',
          char: s.charAt(0) || '?'
        };
      }
    }
  };

  const styleObj = getFallbackStyle(symbol);

  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center overflow-hidden shrink-0 rounded-full border shadow-sm ${styleObj.bg} ${styleObj.glow}`}
        style={styleObj.style}
        title={symbol}
      >
        <span className={`text-[10px] font-black tracking-tight ${styleObj.text}`}>
          {styleObj.char}
        </span>
      </div>
    );
  }

  // First step: Try loading from local public/tokens/ folder
  const localUrl = `/tokens/${symbol.toLowerCase()}.png`;

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden shrink-0 bg-neutral-900/50 border border-white/5 shadow-sm rounded-full`}>
      <img 
        src={tryRemote ? proxiedUrl : localUrl} 
        alt={symbol} 
        className="w-full h-full object-cover rounded-full"
        onError={() => {
          if (!tryRemote) {
            setTryRemote(true);
          } else {
            setHasError(true);
          }
        }}
      />
    </div>
  );
};


const SWAP_TOKENS = {
  TON: {
    symbol: 'TON',
    name: 'The Open Network',
    logo: 'https://assets.ston.fi/web/meta/ton/logo.png',
    priceUsd: 5.35,
    balance: '12.45'
  },
  STON: {
    symbol: 'STON',
    name: 'STON.fi',
    logo: 'https://assets.ston.fi/web/meta/EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO/logo.png',
    priceUsd: 3.38,
    balance: '150.00'
  },
  USDT: {
    symbol: 'USD₮',
    name: 'Tether USD',
    logo: 'https://assets.ston.fi/web/meta/EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs/logo.png',
    priceUsd: 1.00,
    balance: '42.10'
  },
  tsTON: {
    symbol: 'tsTON',
    name: 'Tonstakers Staked TON',
    logo: 'https://assets.ston.fi/web/meta/EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav/logo.png',
    priceUsd: 5.42,
    balance: '8.50'
  },
  NOT: {
    symbol: 'NOT',
    name: 'Notcoin',
    logo: 'https://assets.ston.fi/web/meta/EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT/logo.png',
    priceUsd: 0.0074,
    balance: '15,000.0'
  },
  DOGS: {
    symbol: 'DOGS',
    name: 'Dogs',
    logo: 'https://assets.ston.fi/web/meta/EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS/logo.png',
    priceUsd: 0.00062,
    balance: '85,000.0'
  },
  REDO: {
    symbol: 'REDO',
    name: 'Resistance Dog',
    logo: 'https://assets.ston.fi/web/meta/EQBZ_nnC3l1l1ZJdJ4s5Z8l_rZ-rV-t3Q9d8aX6M2-A3_s9L/logo.png',
    priceUsd: 0.68,
    balance: '120.00'
  },
  GEMSTON: {
    symbol: 'GEMSTON',
    name: 'Gemston',
    logo: 'https://assets.ston.fi/web/meta/EQBX6K9aXVl3nXINCyPPL86C4ONVmQ8vK360u6dykFKXpHCa/logo.png',
    priceUsd: 0.15,
    balance: '450.00'
  },
  UTYA: {
    symbol: 'UTYA',
    name: 'Utya',
    logo: 'https://assets.ston.fi/web/meta/EQBaCgUwOoc6gHCNln_oJzb0mVs79YG7wYoavh-o1ItaneLA/logo.png',
    priceUsd: 0.0014,
    balance: '12,500.0'
  },
  CATI: {
    symbol: 'CATI',
    name: 'Catizen',
    logo: 'https://assets.ston.fi/web/meta/EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7/logo.png',
    priceUsd: 0.38,
    balance: '280.00'
  },
  HMSTR: {
    symbol: 'HMSTR',
    name: 'Hamster Kombat',
    logo: 'https://assets.ston.fi/web/meta/EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo/logo.png',
    priceUsd: 0.0035,
    balance: '1,500.00'
  },
  DUREV: {
    symbol: 'DUREV',
    name: 'Povel Durev',
    logo: 'https://assets.ston.fi/web/meta/EQB02DJ0cdUD4iQDRbBv4aYG3htePHBRK1tGeRtCnatescK0/logo.png',
    priceUsd: 0.014,
    balance: '35,000.0'
  },
  SCALE: {
    symbol: 'SCALE',
    name: 'DUST (Scale)',
    logo: 'https://assets.ston.fi/web/meta/EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE/logo.png',
    priceUsd: 0.22,
    balance: '14.00'
  },
  PUNK: {
    symbol: 'PUNK',
    name: 'PunkCity',
    logo: 'https://assets.ston.fi/web/meta/EQCdpz6QhJtDtm2s9-krV2ygl45Pwl-KJJCV1-XrP-Xuuxoq/logo.png',
    priceUsd: 0.045,
    balance: '2,200.00'
  },
  FISH: {
    symbol: 'FISH',
    name: 'TON Fish',
    logo: 'https://assets.ston.fi/web/meta/EQATcUc69sGSCCMSadsVUKdGwM1BMKS-HKCWGPk60xZGgwsK/logo.png',
    priceUsd: 0.000000045,
    balance: '120,000,000'
  },
  BOLT: {
    symbol: 'BOLT',
    name: 'Huebel Bolt',
    logo: 'https://assets.ston.fi/web/meta/EQBS7qLzxOsPIzVRj6hjA5NMvA11oj6qS3oWNqCKJ04tGTkc/logo.png',
    priceUsd: 0.12,
    balance: '500.00'
  },
  jUSDT: {
    symbol: 'jUSDT',
    name: 'TON Bridged USDT',
    logo: 'https://assets.ston.fi/web/meta/EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA/logo.png',
    priceUsd: 1.00,
    balance: '25.00'
  },
  jUSDC: {
    symbol: 'jUSDC',
    name: 'TON Bridged USDC',
    logo: 'https://assets.ston.fi/web/meta/EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728/logo.png',
    priceUsd: 1.00,
    balance: '15.00'
  },
  RAFF: {
    symbol: 'RAFF',
    name: 'TonRaffles',
    logo: 'https://assets.ston.fi/web/meta/EQDMdC1zf-FquFgeN-wIvpkIclDLR3bXnDVaoOanpNpBVmm_/logo.png',
    priceUsd: 0.095,
    balance: '350.00'
  }
} as const;
const getTutorialSteps = (lang: 'ru' | 'en') => [
  {
    text: lang === 'ru' 
      ? "Здорово, крипто-сталкер! 🗿👋 Я твой личный гид по STON Hub. Будем знакомы! Мы тут построили крутейший игровой портал для DEX-биржи STON.fi. Давай быстро покажу, как тут рубить XP и делать грязь!"
      : "Yo, crypto stalker! 🗿👋 I'm your personal guide through STON Hub. Great to meet ya! We built the absolute coolest gaming portal for the STON.fi DEX here. Let me quickly show you how to grind XP and make some serious moves!",
    image: "/character_1.png"
  },
  {
    text: lang === 'ru'
      ? "Смотри сюда! В Академии 🎓 лежат такие сочные DeFi-гайды, что даже твоя бабушка разберется. Читай их внимательно, тут кладезь знаний!"
      : "Look here! The Academy 🎓 is packed with DeFi guides so juicy, even your grandma could master them. Read them closely, they're a goldmine!",
    image: "/character_2.png"
  },
  {
    text: lang === 'ru'
      ? "Но халявы не будет! Прочитал гайд — сдавай тест. Ответишь правильно — получишь гору опыта XP. Ошибся? Пойдешь пересдавать, пока не поумнеешь! 😂 Учи матчасть!"
      : "But no free rides here! Once you read a guide, you gotta pass the quiz. Answer right, and you get a mountain of XP. Messed up? Back to studying until you get smarter! 😂 Do your homework!",
    image: "/character_3.png"
  },
  {
    text: lang === 'ru'
      ? "А в Миссиях 🎯 каждый день падают новые квесты. Подпишись, репостни, помолись богам блокчейна... Выполнил — лови мгновенный зачет и респект от хаба!"
      : "And in Missions 🎯, fresh quests drop daily. Subscribe, retweet, pray to the blockchain gods... Complete them and get instant XP and respect from the hub!",
    image: "/character_4.png"
  },
  {
    text: lang === 'ru'
      ? "В Профиле 👤 хранится вся твоя подпольная бухгалтерия: баланс токенов $STON, кошелек, твои уникальные достижения и глобальный рейтинг. Будь активным и ворвись в топ игроков!"
      : "Your Profile 👤 holds all your under-the-table accounting: $STON token balance, active wallet address, your unique achievements, and global rankings. Stay active and storm the leaderboard!",
    image: "/character_5.png"
  },
  {
    text: lang === 'ru'
      ? "Кстати, о бабках. У нас тут прямо в игре встроен ультра-быстрый Своп 🔄! Меняй TON на STON быстрее, чем успеешь сказать 'камень'! И, конечно, получай за это XP! 💸"
      : "By the way, let's talk cash. We've got an ultra-fast Swap 🔄 built right into the app! Exchange TON to STON faster than you can say 'rock'! And of course, earn XP for it! 💸",
    image: "/character_6.png"
  },
  {
    text: lang === 'ru'
      ? "А еще — хватай свою рефку и тащи друзей! За их пот, слезы и заработанный опыт ты будешь пожизненно (ну ладно, пока идет сезон) получать 15% бонусов! Пассивный доход, все дела. 😎"
      : "Also—grab your ref link and drag your friends in! For all their sweat, tears, and XP earned, you'll get a lifetime (well, while the season lasts) 15% bonus! Passive income baby, that's how we roll. 😎",
    image: "/character_7.png"
  },
  {
    text: lang === 'ru'
      ? "Ну что, салага, готов стать DeFi-гигачадом и показать всем, кто тут батя? Хватай кошелек, жми кнопку и полетели покорять TON! 🪨🚀🔥"
      : "Alright, rookie, ready to become a DeFi GigaChad and show everyone who's boss? Grab your wallet, hit the button, and let's conquer TON! 🪨🚀🔥",
    image: "/character_8.png"
  }
];

const DICTIONARY = {
  ru: {
    walletConnectSuccess: 'Добро пожаловать в игру! 🪨🔥',
    connectWalletBtn: 'Подключить кошелек',
    dailyClaimSuccess: 'Бонус собран! Получено +25 XP ⚡',
    hiUser: 'Привет, ',
    hiAmbassador: 'Привет, Амбассадор!',
    active: 'АКТИВЕН',
    rankLabel: 'Ранг: ',
    progressLabel: 'Твой прогресс:',
    nextRankText: 'до ранга Diamond Vibe 💎',
    balanceLabel: 'Баланс $STON',
    sevenDaysText: 'за 7д',
    quickActions: 'Быстрые действия',
    swapActionBtn: 'Своп',
    dailyClaimBtn: 'Бонусы',
    welcomeTitle: 'Добро пожаловать в STON Hub!',
    welcomeDesc: 'Это твой интерактивный путеводитель по блокчейну TON и экосистеме STON.fi. Смотри обучающие видео, сдавай тесты, выполняй квесты и докажи, что ты лучший амбассадор!',
    goToAcademy: 'Перейти к обучению',
    completedQuests: 'Выполнено квестов',
    completedLessons: 'Пройдено уроков',
    savingApy: 'Сейвинг APY',
    guideName: 'Проводник STONHub 🗿',
    skip: 'Пропустить',
    next: 'Дальше →',
    finish: 'Погнали! 🚀',
    readTime: 'Время чтения:',
    views: 'просмотров',
    quizPrompt: 'Пройдите тест для получения +',
    quizSuccess: 'Задание успешно выполнено! Награда начислена.',
    backToList: '← К списку гайдов',
    studyMaterial: 'Учебный материал',
    academyTitle: 'Академия STONHub 🎓',
    academyDesc: 'Читай гайды, отвечай на тесты и прокачивайся',
    totalGuides: 'Всего гайдов:',
    completed: 'Сдано',
    readGuide: 'Читать гайд',
    videoAcademyTitle: 'Видеокурсы — Скоро будет 🎬',
    videoAcademyDesc: 'Мы готовим для вас серию эксклюзивных видеоматериалов по трейдингу, ликвидности и стейкингу в экосистеме STON.fi.',
    missionsTitle: 'Доступные квесты 🎯',
    missionsDesc: 'Выполняйте задания каждый день и получайте амбассадорские награды',
    done: 'Выполнено',
    pending: 'Проверка',
    start: 'Начать',
    connectWalletAlert: 'Пожалуйста, кликните кнопку кошелька в шапке! 🔌',
    referralTitle: 'Реферальная программа',
    referralDesc: 'Приглашай друзей в STON Hub и получай 15% от их накопленного XP в экосистеме.',
    referralCopied: 'Реферальная ссылка скопирована! 📋',
    leaderboardTitle: 'Лидерборд',
    leaderboardDesc: 'Глобальный рейтинг амбассадоров',
    backToProfile: '← Профиль',
    tableAmbassador: 'Амбассадор',
    tableXp: 'Очки XP',
    inRank: 'В рейтинге: #4',
    yourLevel: 'Твой уровень',
    officialAmbassador: 'ОФИЦИАЛЬНЫЙ АМБАССАДОР STON.fi',
    statsTitle: 'Статистика',
    statsQuests: 'Миссии выполнено',
    statsFriends: 'Друзей приглашено',
    statsEarnings: 'Общий заработок',
    statsRanking: 'В рейтинге',
    achievementsTitle: 'Достижения',
    achievementsAlert: 'Ачивки обновляются автоматически!',
    viewAll: 'Смотреть все',
    badgeStreak: 'Стрик 7д',
    badgeGuru: 'DeFi Гуру',
    badgeSwaper: 'Топ Свапер',
    badgeKing: 'Крипто-Царь',
    funnyAlert: 'Трансформация выполнена в стиле Pornhub! 🚀',
    swapSend: 'Вы отправляете:',
    swapBalance: 'Баланс:',
    swapReceive: 'Вы получаете:',
    swapRate: 'Курс обмена:',
    swapBonus: 'Вайб-Бонус за сделку:',
    swappingProgress: 'Выполняется обмен на STON.fi...',
    swapButtonActive: 'Обменять токены',
    swapButtonInactive: 'Сначала подключите кошелек',
    swapAmountAlert: 'Введите сумму для обмена! ⚠️',
    swapSuccess: 'Обмен выполнен! Получено +100 XP 🚀',
    close: 'Закрыть',
    walletAlert: 'Пожалуйста, подключите TON кошелек! 🔌',
    missionPendingAlert: 'Задание отправлено на проверку! ⏳',
    missionCompletedAlert: 'Задание проверено! Получено +'
  },
  en: {
    walletConnectSuccess: 'Welcome to the game! 🪨🔥',
    connectWalletBtn: 'Connect Wallet',
    dailyClaimSuccess: 'Bonus claimed! Received +25 XP ⚡',
    hiUser: 'Hello, ',
    hiAmbassador: 'Hello, Ambassador!',
    active: 'ACTIVE',
    rankLabel: 'Rank: ',
    progressLabel: 'Your progress:',
    nextRankText: 'to Diamond Vibe rank 💎',
    balanceLabel: '$STON Balance',
    sevenDaysText: 'over 7d',
    quickActions: 'Quick Actions',
    swapActionBtn: 'Swap',
    dailyClaimBtn: 'Daily',
    welcomeTitle: 'Welcome to STON Hub!',
    welcomeDesc: 'This is your interactive guide to the TON blockchain and the STON.fi ecosystem. Read guides, pass quizzes, complete missions, and prove you are the best ambassador!',
    goToAcademy: 'Go to Academy',
    completedQuests: 'Missions completed',
    completedLessons: 'Lessons completed',
    savingApy: 'Saving APY',
    guideName: 'STONHub Guide 🗿',
    skip: 'Skip',
    next: 'Next →',
    finish: 'Let\'s go! 🚀',
    readTime: 'Read time:',
    views: 'views',
    quizPrompt: 'Take the quiz to receive +',
    quizSuccess: 'Quiz completed successfully! Reward credited.',
    backToList: '← Back to guides',
    studyMaterial: 'Study Material',
    academyTitle: 'STONHub Academy 🎓',
    academyDesc: 'Read guides, pass quizzes, and level up',
    totalGuides: 'Total guides:',
    completed: 'Completed',
    readGuide: 'Read Guide',
    videoAcademyTitle: 'Video Courses — Coming Soon 🎬',
    videoAcademyDesc: 'We are preparing a series of exclusive video materials on trading, liquidity, and staking in the STON.fi ecosystem.',
    missionsTitle: 'Available Quests 🎯',
    missionsDesc: 'Complete tasks daily and earn ambassador rewards',
    done: 'Done',
    pending: 'Checking',
    start: 'Start',
    connectWalletAlert: 'Please click the connect button in the header! 🔌',
    referralTitle: 'Referral Program',
    referralDesc: 'Invite friends to STON Hub and get 15% of their accumulated XP in the ecosystem.',
    referralCopied: 'Referral link copied! 📋',
    leaderboardTitle: 'Leaderboard',
    leaderboardDesc: 'Global rankings of ambassadors',
    backToProfile: '← Profile',
    tableAmbassador: 'Ambassador',
    tableXp: 'XP Points',
    inRank: 'Ranked: #4',
    yourLevel: 'Your level',
    officialAmbassador: 'OFFICIAL STON.fi AMBASSADOR',
    statsTitle: 'Statistics',
    statsQuests: 'Missions completed',
    statsFriends: 'Friends invited',
    statsEarnings: 'Total earnings',
    statsRanking: 'Leaderboard Rank',
    achievementsTitle: 'Achievements',
    achievementsAlert: 'Achievements are updated automatically!',
    viewAll: 'View all',
    badgeStreak: '7d Streak',
    badgeGuru: 'DeFi Guru',
    badgeSwaper: 'Top Swapper',
    badgeKing: 'Crypto King',
    funnyAlert: 'Transformation completed in Pornhub style! 🚀',
    swapSend: 'You send:',
    swapBalance: 'Balance:',
    swapReceive: 'You receive:',
    swapRate: 'Exchange rate:',
    swapBonus: 'Vibe-Bonus for deal:',
    swappingProgress: 'Swapping on STON.fi...',
    swapButtonActive: 'Swap tokens',
    swapButtonInactive: 'Connect wallet first',
    swapAmountAlert: 'Enter amount to swap! ⚠️',
    swapSuccess: 'Swap completed! Received +100 XP 🚀',
    close: 'Close',
    walletAlert: 'Please connect TON wallet! 🔌',
    missionPendingAlert: 'Task submitted for verification! ⏳',
    missionCompletedAlert: 'Task verified! Received +'
  }
};

const getLessons = (lang: 'ru' | 'en'): Lesson[] => [
  {
    id: 'guide-stonbassadors-intro',
    title: lang === 'ru' ? 'Кто такой STONbassador и как им стать?' : 'Who is a STONbassador and how to become one?',
    category: lang === 'ru' ? 'Гайды' : 'Guides',
    description: lang === 'ru' 
      ? 'Полное руководство по участию в амбассадорской программе STON.fi без сложных проверок и верификаций.' 
      : 'A complete guide to participating in the STON.fi ambassador program without complex checks or verifications.',
    xpReward: 80,
    readTime: lang === 'ru' ? '3 мин' : '3 min',
    completed: false,
    duration: lang === 'ru' ? '3 мин' : '3 min',
    views: lang === 'ru' ? '12.4K просмотров' : '12.4K views',
    uploadedAt: lang === 'ru' ? 'Сегодня' : 'Today',
    imageUrl: 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black',
    content: lang === 'ru' ? [
      'STONbassadors — это официальные амбассадоры экосистемы STON.fi, которые помогают развивать бренд и сообщество. Это творческие люди, авторы контента, переводчики, инфлюенсеры и технические специалисты, разделяющие ценности децентрализации.',
      'Главная прелесть программы — отсутствие сложного отбора. Вам не нужно ждать одобрения заявки или проходить жесткую верификацию личности (KYC). Вы можете начать в любой момент!',
      'Чтобы присоединиться, достаточно выполнять полезные задания: создавать качественный контент (статьи, видео, инфографику), помогать новичкам в чатах сообщества или организовывать локальные мероприятия. В конце месяца вы отправляете отчет о проделанной работе через специальную форму.'
    ] : [
      'STONbassadors are the official ambassadors of the STON.fi ecosystem who help grow the brand and community. They are creative minds, content creators, translators, influencers, and technical experts who share the values of decentralization.',
      'The main beauty of the program is the lack of complex selection. You don\'t need to wait for application approval or undergo strict KYC identity verification. You can start at any moment!',
      'To join, all you need to do is perform helpful tasks: create quality content (articles, videos, infographics), help beginners in community chats, or organize local events. At the end of the month, you submit a report on your work via a special form.'
    ],
    quiz: {
      question: lang === 'ru' 
        ? 'Нужно ли проходить сложную верификацию или заполнять заявку, чтобы стать STONbassador?' 
        : 'Do you need to undergo complex verification or fill out an application to become a STONbassador?',
      options: lang === 'ru' ? [
        'Да, требуется верификация личности (KYC) и одобрение анкеты',
        'Нет, можно сразу начать выполнять задания и отправлять отчеты',
        'Да, нужен специальный инвайт-код от администрации'
      ] : [
        'Yes, KYC identity verification and application approval are required',
        'No, you can start doing tasks and sending reports right away',
        'Yes, you need a special invite code from the administration'
      ],
      answerIndex: 1
    }
  },
  {
    id: 'guide-stonbassadors-rewards',
    title: lang === 'ru' ? 'Система наград и правила отправки отчетов' : 'Rewards System and Report Submission Rules',
    category: lang === 'ru' ? 'Гайды' : 'Guides',
    description: lang === 'ru' 
      ? 'Как распределяется ежемесячный пул наград до 10,000 STON и как правильно отправлять свои работы на проверку.' 
      : 'How the monthly reward pool of up to 10,000 STON is distributed and how to properly submit your work for review.',
    xpReward: 90,
    readTime: lang === 'ru' ? '4 мин' : '4 min',
    completed: false,
    duration: lang === 'ru' ? '4 мин' : '4 min',
    views: lang === 'ru' ? '9.8K просмотров' : '9.8K views',
    uploadedAt: lang === 'ru' ? 'Вчера' : 'Yesterday',
    imageUrl: 'bg-gradient-to-br from-zinc-900 via-stone-900 to-orange-950/20',
    content: lang === 'ru' ? [
      'Каждый месяц команда STON.fi выделяет крупный призовой пул — до 10,000 токенов STON — для вознаграждения лучших участников программы STONbassadors.',
      'Награды распределяются на основе качества, охвата аудитории и разнообразия вашего вклада. Все отправленные работы оцениваются модераторами вручную по нескольким критериям.',
      'Чтобы получить награду, необходимо в конце каждого месяца заполнить специальную форму отправки отчета в Telegram-боте. Убедитесь, что все ваши ссылки активны, а работы оформлены аккуратно. Плагиат и накрутка просмотров строго запрещены и ведут к дисквалификации.'
    ] : [
      'Every month, the STON.fi team allocates a large prize pool—up to 10,000 STON tokens—to reward the best participants in the STONbassadors program.',
      'Rewards are distributed based on quality, audience reach, and the variety of your contribution. All submitted works are manually evaluated by moderators based on several criteria.',
      'To receive a reward, you must fill out a special report submission form in the Telegram bot at the end of each month. Make sure all your links are active and your work is neatly presented. Plagiarism and fake views are strictly prohibited and will lead to disqualification.'
    ],
    quiz: {
      question: lang === 'ru' 
        ? 'Какой максимальный ежемесячный пул наград выделяется для лучших STONbassadors?' 
        : 'What is the maximum monthly reward pool allocated for the best STONbassadors?',
      options: ['1,000 STON', '5,000 STON', '10,000 STON'],
      answerIndex: 2
    }
  },
  {
    id: 'guide-stonbassadors-content',
    title: lang === 'ru' ? 'Создание контента: Советы и лучшие практики' : 'Content Creation: Tips and Best Practices',
    category: lang === 'ru' ? 'Гайды' : 'Guides',
    description: lang === 'ru' 
      ? 'Как создавать вовлекающий, качественный контент о STON.fi, который получит максимальные оценки от команды.' 
      : 'How to create engaging, high-quality content about STON.fi that will get maximum scores from the team.',
    xpReward: 100,
    readTime: lang === 'ru' ? '5 мин' : '5 min',
    completed: false,
    duration: lang === 'ru' ? '5 мин' : '5 min',
    views: lang === 'ru' ? '7.5K просмотров' : '7.5K views',
    uploadedAt: lang === 'ru' ? '2 дня назад' : '2 days ago',
    imageUrl: 'bg-gradient-to-br from-neutral-900 via-orange-900/10 to-stone-950',
    content: lang === 'ru' ? [
      'Качественный контент — залог высокой оценки вашей работы. Команда STON.fi ценит уникальные материалы, которые действительно помогают пользователям разобраться в продукте.',
      'При написании статей или гайдов используйте понятную структуру: четкое введение, разделы с подзаголовками, пошаговые инструкции и качественные скриншоты. Если вы описываете сложные DeFi-механики, добавьте наглядные примеры.',
      'Продвигайте свои материалы на популярных платформах (Teletype, Medium, X, Telegram). Высокий органический охват и активные комментарии читателей существенно увеличат ваши шансы на получение повышенной награды.'
    ] : [
      'High-quality content is key to getting a high score for your work. The STON.fi team values unique materials that actually help users understand the product.',
      'When writing articles or guides, use a clear structure: a solid introduction, sections with subheadings, step-by-step instructions, and high-quality screenshots. If you describe complex DeFi mechanics, add illustrative examples.',
      'Promote your materials on popular platforms (Teletype, Medium, X, Telegram). High organic reach and active reader comments will significantly increase your chances of getting an upgraded reward.'
    ],
    quiz: {
      question: lang === 'ru' 
        ? 'Что из перечисленного является важным при создании качественного гайда по мнению команды STON.fi?' 
        : 'What is considered important when creating a high-quality guide, according to the STON.fi team?',
      options: lang === 'ru' ? [
        'Использование сложных терминов без объяснений',
        'Понятная структура, качественные скриншоты и пошаговые инструкции',
        'Простое копирование чужих материалов с других сайтов'
      ] : [
        'Using complex terms without explanations',
        'Clear structure, quality screenshots, and step-by-step instructions',
        'Simply copying someone else\'s material from other websites'
      ],
      answerIndex: 1
    }
  },
  {
    id: 'guide-stonbassadors-referrals',
    title: lang === 'ru' ? 'Реферальная программа для амбассадоров' : 'Referral Program for Ambassadors',
    category: lang === 'ru' ? 'Гайды' : 'Guides',
    description: lang === 'ru' 
      ? 'Узнайте, как приглашать друзей в программу и получать 10% от их наград в течение 6 месяцев.' 
      : 'Learn how to invite friends to the program and receive 10% of their rewards for 6 months.',
    xpReward: 70,
    readTime: lang === 'ru' ? '3 мин' : '3 min',
    completed: false,
    duration: lang === 'ru' ? '3 мин' : '3 min',
    views: lang === 'ru' ? '5.2K просмотров' : '5.2K views',
    uploadedAt: lang === 'ru' ? '3 дня назад' : '3 days ago',
    imageUrl: 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black',
    content: lang === 'ru' ? [
      'Программа STONbassadors включает в себя выгодную реферальную систему, которая позволяет получать пассивный доход за приглашение новых амбассадоров.',
      'Вы можете поделиться своей уникальной реферальной ссылкой с друзьями. Если приглашенный пользователь регистрируется в программе и начинает зарабатывать награды, вы будете получать бонус в размере 10% от его ежемесячных начислений.',
      'Этот реферальный бонус выплачивается из специального фонда команды STON.fi в течение 6 месяцев с момента регистрации реферала. При этом награда самого реферала никак не уменьшается.'
    ] : [
      'The STONbassadors program includes a lucrative referral system that allows you to earn passive income by inviting new ambassadors.',
      'You can share your unique referral link with friends. If the invited user registers in the program and starts earning rewards, you will receive a bonus equal to 10% of their monthly payouts.',
      'This referral bonus is paid from a special fund allocated by the STON.fi team for 6 months from the moment of the referral\'s registration. Meanwhile, the referral\'s own reward is not reduced in any way.'
    ],
    quiz: {
      question: lang === 'ru' 
        ? 'Какой процент от наград ваших рефералов вы будете получать в течение 6 месяцев?' 
        : 'What percentage of your referrals\' rewards will you receive for 6 months?',
      options: ['5%', '10%', '15%'],
      answerIndex: 1
    }
  },
  {
    id: 'lesson-1',
    title: lang === 'ru' ? 'Что такое STON.fi? Полный гайд для новичков' : 'What is STON.fi? Complete Guide for Beginners',
    category: lang === 'ru' ? 'Академия' : 'Academy',
    description: lang === 'ru' 
      ? 'Узнайте о ведущем децентрализованном маркетмейкере (AMM DEX) на блокчейне TON, его преимуществах и возможностях.' 
      : 'Learn about the leading decentralized automated market maker (AMM DEX) on the TON blockchain, its advantages, and opportunities.',
    xpReward: 75,
    readTime: lang === 'ru' ? '3 мин' : '3 min',
    completed: false,
    duration: lang === 'ru' ? '3 мин' : '3 min',
    views: lang === 'ru' ? '8.4K просмотров' : '8.4K views',
    uploadedAt: lang === 'ru' ? '2 дня назад' : '2 days ago',
    imageUrl: 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black',
    content: lang === 'ru' ? [
      'STON.fi — это ведущий децентрализованный автоматический маркетмейкер (AMM DEX) на блокчейне TON, предлагающий пользователям сверхнизкие комиссии, минимальное проскальзывание и удобный интерфейс.',
      'В отличие от традиционных централизованных бирж, на STON.fi вам не нужно проходить регистрацию или доверять свои средства третьим лицам. Все обмены происходят напрямую между кошельками пользователей через безопасные смарт-контракты.',
      'Благодаря архитектуре блокчейна TON, транзакции на STON.fi проходят практически мгновенно, делая торговлю криптовалютой доступной и быстрой для каждого.'
    ] : [
      'STON.fi is the leading decentralized automatic market maker (AMM DEX) on the TON blockchain, offering users ultra-low fees, minimal slippage, and an intuitive user interface.',
      'Unlike traditional centralized exchanges, on STON.fi you do not need to register or trust your funds to third parties. All exchanges happen directly between users\' wallets through secure smart contracts.',
      'Thanks to the architecture of the TON blockchain, transactions on STON.fi occur almost instantly, making cryptocurrency trading accessible and fast for everyone.'
    ],
    quiz: {
      question: lang === 'ru' 
        ? 'Какую архитектуру использует STON.fi DEX?' 
        : 'Which architecture does the STON.fi DEX use?',
      options: lang === 'ru' ? [
        'Order Book (Книга ордеров)',
        'AMM (Автоматический маркетмейкер)',
        'Централизованный оракул'
      ] : [
        'Order Book',
        'AMM (Automated Market Maker)',
        'Centralized Oracle'
      ],
      answerIndex: 1
    }
  },
  {
    id: 'lesson-2',
    title: lang === 'ru' ? 'Как фармить STON на пулах ликвидности' : 'How to Farm STON on Liquidity Pools',
    category: lang === 'ru' ? 'Гайды' : 'Guides',
    description: lang === 'ru' 
      ? 'Поймите, как работают пулы ликвидности, как вносить средства и получать комиссионные с каждой сделки в экосистеме.' 
      : 'Understand how liquidity pools work, how to deposit funds, and earn commission fees on every trade in the ecosystem.',
    xpReward: 100,
    readTime: lang === 'ru' ? '5 мин' : '5 min',
    completed: false,
    duration: lang === 'ru' ? '5 мин' : '5 min',
    views: lang === 'ru' ? '6.1K просмотров' : '6.1K views',
    uploadedAt: lang === 'ru' ? '4 дня назад' : '4 days ago',
    imageUrl: 'bg-gradient-to-br from-zinc-900 via-stone-900 to-orange-950/20',
    content: lang === 'ru' ? [
      'Фарминг и предоставление ликвидности — один из самых популярных способов пассивного заработка в децентрализованных финансах (DeFi) на платформе STON.fi.',
      'Когда вы вносите пару токенов (например, TON и STON) в пул ликвидности, вы получаете LP-токены, подтверждающие вашу долю в пуле. Провайдеры ликвидности получают часть торговых комиссий с каждого обмена в этой паре.',
      'Дополнительно вы можете отправлять свои LP-токены в стейкинг в разделе фарминга, чтобы зарабатывать бонусные токены управления STON с высокой процентной ставкой APY.'
    ] : [
      'Farming and providing liquidity is one of the most popular ways to earn passive income in decentralized finance (DeFi) on the STON.fi platform.',
      'When you deposit a pair of tokens (e.g., TON and STON) into a liquidity pool, you receive LP tokens that confirm your share in the pool. Liquidity providers receive a portion of the trading fees from each swap in that pair.',
      'Additionally, you can stake your LP tokens in the farming section to earn bonus STON governance tokens with a high APY interest rate.'
    ],
    quiz: {
      question: lang === 'ru' 
        ? 'Что получает провайдер ликвидности взамен внесенных токенов?' 
        : 'What does a liquidity provider receive in return for deposited tokens?',
      options: lang === 'ru' ? [
        'LP токены',
        'NFT ваучеры',
        'Только устную благодарность'
      ] : [
        'LP tokens',
        'NFT vouchers',
        'Only verbal appreciation'
      ],
      answerIndex: 0
    }
  },
  {
    id: 'lesson-3',
    title: lang === 'ru' ? 'Управление и стейкинг токена $STON' : 'Governance and Staking of the $STON Token',
    category: lang === 'ru' ? 'Академия' : 'Academy',
    description: lang === 'ru' 
      ? 'Роль нативного токена управления $STON, протоколы стейкинга и как участвовать в голосованиях за будущее платформы.' 
      : 'The role of the native governance token $STON, staking protocols, and how to participate in voting on the platform\'s future.',
    xpReward: 120,
    readTime: lang === 'ru' ? '4 мин' : '4 min',
    completed: false,
    duration: lang === 'ru' ? '4 мин' : '4 min',
    views: lang === 'ru' ? '3.2K просмотров' : '3.2K views',
    uploadedAt: lang === 'ru' ? '1 неделю назад' : '1 week ago',
    imageUrl: 'bg-gradient-to-br from-neutral-900 via-orange-900/10 to-stone-950',
    content: lang === 'ru' ? [
      'Токен $STON является ключевым элементом управления и стимуляции всей экосистемы децентрализованной биржи STON.fi.',
      'Стейкинг токенов STON позволяет пользователям блокировать свои средства на определенный период в обмен на получение специальных токенов AR-STON. Эти токены дают право участвовать в голосованиях за ключевые изменения платформы.',
      'Кроме того, стейкеры получают долю от доходов протокола, что делает долгосрочное удержание токена STON еще более выгодным и стратегически важным для участников.'
    ] : [
      'The $STON token is a key element of governance and incentivization for the entire STON.fi decentralized exchange ecosystem.',
      'Staking STON tokens allows users to lock their funds for a specific period in exchange for receiving special AR-STON tokens. These tokens grant the right to vote on key changes to the platform.',
      'In addition, stakers receive a share of the protocol\'s revenue, making holding STON tokens long-term even more lucrative and strategically important for participants.'
    ],
    quiz: {
      question: lang === 'ru' 
        ? 'Какое ключевое преимущество стейкинга $STON на платформе STON.fi?' 
        : 'What is the key benefit of staking $STON on the STON.fi platform?',
      options: lang === 'ru' ? [
        'Снижение лимитов обмена',
        'Получение AR-STON и доли в доходах протокола',
        'Автоматическая покупка TON'
      ] : [
        'Lower swap limits',
        'Receiving AR-STON and a share of the protocol\'s revenue',
        'Automatic purchase of TON'
      ],
      answerIndex: 1
    }
  }
];

const getMissions = (lang: 'ru' | 'en'): Mission[] => [
  {
    id: 'm-1',
    title: lang === 'ru' ? 'Подключи кошелек' : 'Connect Wallet',
    description: lang === 'ru' 
      ? 'Подключите ваш TON кошелек (Tonkeeper, MyTonWallet и др.) к нашей системе.' 
      : 'Connect your TON wallet (Tonkeeper, MyTonWallet, etc.) to our system.',
    xpReward: 50,
    type: 'web3',
    status: 'available',
    link: '#connect'
  },
  {
    id: 'm-2',
    title: lang === 'ru' ? 'Подпишись на STON.fi в X' : 'Follow STON.fi on X',
    description: lang === 'ru' 
      ? 'Присоединяйтесь к официальному каналу X (Twitter) экосистемы STON.fi.' 
      : 'Join the official X (Twitter) channel of the STON.fi ecosystem.',
    xpReward: 25,
    type: 'social',
    status: 'available',
    link: 'https://x.com/ston_fi'
  },
  {
    id: 'm-3',
    title: lang === 'ru' ? 'Пройди урок в Академии' : 'Complete an Academy Lesson',
    description: lang === 'ru' 
      ? 'Изучите любой гайд в разделе «Академия» и решите тест без ошибок.' 
      : 'Study any guide in the Academy and pass the test without errors.',
    xpReward: 75,
    type: 'daily',
    status: 'available',
    link: '#videos'
  },
  {
    id: 'm-4',
    title: lang === 'ru' ? 'Свопни любой токен' : 'Swap Any Token',
    description: lang === 'ru' 
      ? 'Совершите быстрый обмен TON/STON внутри нашего Mini App.' 
      : 'Perform a quick TON/STON exchange inside our Mini App.',
    xpReward: 100,
    type: 'web3',
    status: 'available',
    link: '#swap'
  },
  {
    id: 'm-5',
    title: lang === 'ru' ? 'Пригласи 3 друзей' : 'Invite 3 Friends',
    description: lang === 'ru' 
      ? 'Поделитесь своей реферальной ссылкой и приведите 3 активных амбассадоров.' 
      : 'Share your referral link and invite 3 active ambassadors.',
    xpReward: 200,
    type: 'social',
    status: 'available',
    link: 'https://t.me/share/url?url=https://t.me/ston_vibe_studio_bot/app'
  }
];

const getLeaders = (lang: 'ru' | 'en'): Leader[] => [
  { rank: 1, name: 'tonlegend 👑', xp: 5420, badge: lang === 'ru' ? 'Алмазный Вайб' : 'Diamond Vibe' },
  { rank: 2, name: 'cryptoboss', xp: 2890, badge: lang === 'ru' ? 'Алмазный Вайб' : 'Diamond Vibe' },
  { rank: 3, name: 'stonmaster', xp: 2450, badge: lang === 'ru' ? 'Платиновый Вайб' : 'Platinum Vibe' },
  { rank: 4, name: 'stonplayer', xp: 1980, badge: lang === 'ru' ? 'Платиновый Вайб' : 'Platinum Vibe' },
  { rank: 5, name: 'stonlover', xp: 1760, badge: lang === 'ru' ? 'Золотой Вайб' : 'Gold Vibe' },
  { rank: 6, name: 'stonaddict', xp: 1230, badge: lang === 'ru' ? 'Золотой Вайб' : 'Gold Vibe' },
  { rank: 7, name: lang === 'ru' ? 'Твой рейтинг (Вы)' : 'Your rank (You)', xp: 4250, badge: lang === 'ru' ? 'Золотой Вайб' : 'Gold Vibe', isCurrentUser: true }
];


export default function Home() {
  // === Language States ===
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('stonhub_lang');
    if (saved === 'ru' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    const nextLang = lang === 'ru' ? 'en' : 'ru';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stonhub_lang', nextLang);
    }
  };

  const TUTORIAL_STEPS = getTutorialSteps(lang);
  // === Onboarding Tutorial States ===
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  const handleNextTutorial = () => {
    if (tutorialStep === null) return;
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      handleSkipTutorial();
    }
  };

  const handleSkipTutorial = () => {
    setTutorialStep(null);
    localStorage.setItem('stonhub_tutorial_seen', 'true');
    showNotificationMessage(DICTIONARY[lang].walletConnectSuccess);
  };
  // === Web3 states ===
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // === App navigation states ===
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'missions' | 'profile'>('home');
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);

  // === App local states ===
  const [userXp, setUserXp] = useState<number>(4250);
  const [userRank, setUserRank] = useState<string>('Silver Vibe');
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [stonPrice, setStonPrice] = useState<number>(3.25);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down'>('up');
  const [notification, setNotification] = useState<string | null>(null);
  
  // Telegram User Information
  const [tgUser, setTgUser] = useState<{ 
    firstName?: string; 
    lastName?: string; 
    username?: string; 
    photoUrl?: string; 
  } | null>(null);

  // === Video / Academy States ===
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [videoFilter, setVideoFilter] = useState<string>('guides');



  // === Swap States ===
  const [swapFromToken, setSwapFromToken] = useState<keyof typeof SWAP_TOKENS>('TON');
  const [swapToToken, setSwapToToken] = useState<keyof typeof SWAP_TOKENS>('STON');
  const [swapFromAmount, setSwapFromAmount] = useState<string>('');
  const [swapToAmount, setSwapToAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | null>(null);

  // === Mock Data with multi-language synchronization ===
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons('ru'));
  const [missions, setMissions] = useState<Mission[]>(() => getMissions('ru'));
  const [leaders, setLeaders] = useState<Leader[]>(() => getLeaders('ru'));

  // Synchronize dynamic localized lists when lang updates
  useEffect(() => {
    // 1. Lessons
    const freshLessons = getLessons(lang);
    setLessons(freshLessons);

    // 2. Missions
    const freshMissions = getMissions(lang);
    setMissions(prev => {
      return freshMissions.map(fresh => {
        const existing = prev.find(m => m.id === fresh.id);
        return {
          ...fresh,
          status: existing ? existing.status : fresh.status
        };
      });
    });

    // 3. Leaders
    const freshLeaders = getLeaders(lang);
    setLeaders(prev => {
      return freshLeaders.map(fresh => {
        const existing = prev.find(l => l.rank === fresh.rank || l.isCurrentUser === fresh.isCurrentUser);
        if (fresh.isCurrentUser && existing) {
          let currentName = fresh.name;
          if (tgUser) {
            currentName = tgUser.username ? `@${tgUser.username} (${lang === 'ru' ? 'Вы' : 'You'})` : `${tgUser.firstName} (${lang === 'ru' ? 'Вы' : 'You'})`;
          }
          return {
            ...fresh,
            name: currentName,
            xp: userXp,
            badge: userRank
          };
        }
        return fresh;
      });
    });
  }, [lang, tgUser, userXp, userRank]);



  // === Real Price Fetcher & Simulator fallback ===
  useEffect(() => {
    const fetchRealPrice = async () => {
      try {
        const res = await fetch(
          'https://api.geckoterminal.com/api/v2/networks/ton/tokens/EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
          { headers: { 'Accept': 'application/json;version=20230203' } }
        );
        const json = await res.json();
        const priceStr = json?.data?.attributes?.price_usd;
        if (priceStr) {
          const nextPrice = parseFloat(priceStr);
          setStonPrice(prev => {
            setPriceDirection(nextPrice >= prev ? 'up' : 'down');
            return Number(nextPrice.toFixed(3));
          });
          return true;
        }
      } catch (err) {
        console.warn('GeckoTerminal price fetch failed, using simulator', err);
      }
      return false;
    };

    fetchRealPrice();
    const interval = setInterval(async () => {
      const success = await fetchRealPrice();
      if (!success) {
        const change = (Math.random() - 0.48) * 0.04;
        setStonPrice(prev => {
          const nextPrice = Number((prev + change).toFixed(3));
          setPriceDirection(nextPrice >= prev ? 'up' : 'down');
          return nextPrice;
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // === Fetch Telegram User Info ===
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as unknown as { 
        Telegram?: { 
          WebApp?: { 
            initDataUnsafe?: { 
              user?: { 
                first_name?: string; 
                last_name?: string; 
                username?: string; 
                photo_url?: string; 
              } 
            } 
          } 
        } 
      }).Telegram?.WebApp;
      
      const user = tg?.initDataUnsafe?.user;
      if (user) {
        setTgUser({
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          photoUrl: user.photo_url
        });
        
        // Update user name in leaderboard list
        const userName = user.username ? `@${user.username} (Вы)` : `${user.first_name} (Вы)`;
        setLeaders(prev => 
          prev.map(l => l.isCurrentUser ? { ...l, name: userName } : l)
        );
      }
    }
  }, []);

  // === Dynamic Rank Update ===
  useEffect(() => {
    let currentRank = 'Bronze Vibe 🚀';
    if (userXp >= 5000) {
      currentRank = 'Diamond Vibe 💎';
    } else if (userXp >= 4000) {
      currentRank = 'Platinum Vibe 👑';
    } else if (userXp >= 2000) {
      currentRank = 'Gold Vibe 🌟';
    } else if (userXp >= 1000) {
      currentRank = 'Silver Vibe ✨';
    }
    setUserRank(currentRank);

    // Update in rankings
    setLeaders(prev => 
      prev.map(l => l.isCurrentUser ? { ...l, xp: userXp, badge: currentRank } : l)
        .sort((a, b) => b.xp - a.xp)
        .map((l, idx) => ({ ...l, rank: idx + 1 }))
    );
  }, [userXp]);

  // Wallet address updates specific missions
  useEffect(() => {
    if (walletAddress) {
      setMissions(prev =>
        prev.map(m => m.id === 'm-1' ? { ...m, status: 'completed' } : m)
      );
    }
  }, [walletAddress]);

  // Onboarding trigger - always for testing
  useEffect(() => {
    setTutorialStep(0);
  }, []);

  const showNotificationMessage = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // === Handlers ===
  const handleDailyClaim = () => {
    if (dailyClaimed) return;
    setUserXp(prev => prev + 25);
    setDailyClaimed(true);
    showNotificationMessage(DICTIONARY[lang].dailyClaimSuccess);
    
    if (typeof window !== 'undefined') {
      const tg = (window as unknown as { 
        Telegram?: { 
          WebApp?: { 
            HapticFeedback?: { 
              notificationOccurred: (type: 'success' | 'warning' | 'error') => void 
            } 
          } 
        } 
      }).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.notificationOccurred('success');
        } catch (e) {
          console.warn(e);
        }
      }
    }
  };

  const handleLessonQuizSubmit = (index: number) => {
    if (!selectedLesson) return;
    setQuizAnswer(index);

    if (index === selectedLesson.quiz.answerIndex) {
      setQuizResult('correct');
      if (!completedLessonIds.includes(selectedLesson.id)) {
        setCompletedLessonIds(prev => [...prev, selectedLesson.id]);
        setUserXp(prev => prev + selectedLesson.xpReward);
        showNotificationMessage(`Тест пройден! +${selectedLesson.xpReward} XP 🔥`);

        // Complete the mission 'm-3' if this lesson quiz is solved
        setMissions(prev => 
          prev.map(m => m.id === 'm-3' ? { ...m, status: 'completed' } : m)
        );
      }
    } else {
      setQuizResult('wrong');
      showNotificationMessage('Неверный ответ. Попробуйте еще раз! ❌');
    }
  };

  const handleMissionComplete = (missionId: string, link: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.status === 'completed') return;

    if (link.startsWith('http')) {
      window.open(link, '_blank');
    }

    setMissions(prev => 
      prev.map(m => m.id === missionId ? { ...m, status: 'pending' } : m)
    );
    showNotificationMessage(DICTIONARY[lang].missionPendingAlert);

    setTimeout(() => {
      setMissions(prev => 
        prev.map(m => m.id === missionId ? { ...m, status: 'completed' } : m)
      );
      setUserXp(prev => prev + mission.xpReward);
      showNotificationMessage(`${DICTIONARY[lang].missionCompletedAlert}${mission.xpReward} XP 🎉`);
    }, 3500);
  };

  const handleSwapAmountChange = (
    val: string, 
    fromTokenOverride?: keyof typeof SWAP_TOKENS, 
    toTokenOverride?: keyof typeof SWAP_TOKENS
  ) => {
    setSwapFromAmount(val);
    if (!val || isNaN(Number(val))) {
      setSwapToAmount('');
      return;
    }
    const amount = Number(val);
    const fromToken = fromTokenOverride || swapFromToken;
    const toToken = toTokenOverride || swapToToken;
    
    const priceFrom = SWAP_TOKENS[fromToken].priceUsd;
    const priceTo = SWAP_TOKENS[toToken].priceUsd;
    const output = amount * (priceFrom / priceTo);
    
    // Use more decimals for tiny rates like NOT (Notcoin)
    const decimals = (priceFrom / priceTo) < 0.01 ? 5 : 3;
    setSwapToAmount(output.toFixed(decimals));
  };

  const handleSelectToken = (type: 'from' | 'to', token: keyof typeof SWAP_TOKENS) => {
    if (type === 'from') {
      if (token === swapToToken) {
        setSwapToToken(swapFromToken);
        setSwapFromToken(token);
        handleSwapAmountChange(swapFromAmount, token, swapFromToken);
      } else {
        setSwapFromToken(token);
        handleSwapAmountChange(swapFromAmount, token, swapToToken);
      }
    } else {
      if (token === swapFromToken) {
        setSwapFromToken(swapToToken);
        setSwapToToken(token);
        handleSwapAmountChange(swapFromAmount, swapToToken, token);
      } else {
        setSwapToToken(token);
        handleSwapAmountChange(swapFromAmount, swapFromToken, token);
      }
    }
    setActiveDropdown(null);
  };

  const executeSwap = () => {
    if (!walletAddress) {
      showNotificationMessage(DICTIONARY[lang].walletAlert);
      return;
    }
    if (!swapFromAmount || Number(swapFromAmount) <= 0) {
      showNotificationMessage(DICTIONARY[lang].swapAmountAlert);
      return;
    }

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setUserXp(prev => prev + 100);
      showNotificationMessage(DICTIONARY[lang].swapSuccess);
      setSwapFromAmount('');
      setSwapToAmount('');
      setShowSwapModal(false);
      
      // Update swap mission
      setMissions(prev => 
        prev.map(m => m.id === 'm-4' ? { ...m, status: 'completed' } : m)
      );
    }, 2500);
  };



  // Filter lessons
  const filteredLessons = videoFilter === 'guides' ? lessons : [];


  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden">
      
      {/* ========================================== */}
      {/* === DESKTOP WRAPPER (Responsive Frame) === */}
      {/* ========================================== */}
      <div className="hidden sm:flex min-h-screen w-full items-center justify-center bg-black py-8">
        {/* Smartphone Simulator Frame */}
        <div className="w-[380px] h-[780px] rounded-[48px] border-[10px] border-neutral-800 bg-black relative shadow-[0_20px_50px_rgba(255,153,0,0.15)] flex flex-col overflow-hidden">
          {/* Speaker & camera notch decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-neutral-800 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1 bg-black rounded-full mb-1" />
          </div>
          
          {/* Screen Content */}
          <div className="flex-1 flex flex-col relative pt-4 overflow-y-auto no-scrollbar pb-20">
            <MobileAppContent />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* === MOBILE INTERFACE (TMA View / Fullscreen fallback) === */}
      {/* ========================================================= */}
      <div className="block sm:hidden w-full min-h-screen flex flex-col pb-20 overflow-y-auto no-scrollbar">
        <MobileAppContent />
      </div>

      {/* ========================================== */}
      {/* === GLOBAL FLOATING SWAP OVERLAY MODAL === */}
      {/* ========================================== */}
      <AnimatePresence>
        {showSwapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm glass-panel rounded-2xl p-5 border-[#FF9900]/30 space-y-4 relative"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-5 h-5 text-[#FF9900]" />
                  <span className="font-black text-sm uppercase tracking-wider text-white">SWAP 🔄</span>
                </div>
                <button
                  onClick={() => {
                    setShowSwapModal(false);
                    setActiveDropdown(null);
                  }}
                  className="text-xs text-neutral-500 hover:text-white"
                >
                  {DICTIONARY[lang].close}
                </button>
              </div>

              {/* Swap Input From */}
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 relative">
                <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-2 font-medium">
                  <span>{DICTIONARY[lang].swapSend}</span>
                  <span>{DICTIONARY[lang].swapBalance} {SWAP_TOKENS[swapFromToken].balance} {swapFromToken}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <input 
                    type="number"
                    placeholder="0.0"
                    value={swapFromAmount}
                    onChange={(e) => handleSwapAmountChange(e.target.value)}
                    className="bg-transparent text-white font-black text-lg outline-none w-1/2"
                  />
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'from' ? null : 'from')}
                    className="bg-black hover:bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white active:scale-95 transition"
                  >
                    <TokenLogo symbol={swapFromToken} className="w-4 h-4 rounded-full shrink-0" />
                    <span>{swapFromToken}</span>
                    <span className="text-[8px] text-neutral-500">▼</span>
                  </button>
                </div>

                {/* Dropdown From */}
                {activeDropdown === 'from' && (
                  <div className="absolute right-4 top-14 z-50 bg-[#141416] border border-white/10 p-1.5 rounded-xl shadow-2xl space-y-1 w-44 max-h-64 overflow-y-auto no-scrollbar animate-fade-in">
                    {Object.keys(SWAP_TOKENS).map((sym) => {
                      const t = SWAP_TOKENS[sym as keyof typeof SWAP_TOKENS];
                      return (
                        <button
                          key={sym}
                          onClick={() => handleSelectToken('from', sym as keyof typeof SWAP_TOKENS)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-left text-xs font-bold transition text-white"
                        >
                          <TokenLogo symbol={sym} className="w-4.5 h-4.5 rounded-full shrink-0" />
                          <div className="flex flex-col">
                            <span className="leading-tight">{sym}</span>
                            <span className="text-[8px] text-neutral-500 leading-none">{t.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Swap Swap direction arrow */}
              <div className="flex justify-center -my-6 relative z-10">
                <button 
                  onClick={() => {
                    setSwapFromToken(swapToToken);
                    setSwapToToken(swapFromToken);
                    handleSwapAmountChange(swapFromAmount, swapToToken, swapFromToken);
                  }}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF9900] to-[#FF5500] p-0.5 shadow-lg active:rotate-180 transition-all duration-300"
                >
                  <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#FF9900]" />
                  </div>
                </button>
              </div>

              {/* Swap Input To */}
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 relative mt-1">
                <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-2 font-medium">
                  <span>{DICTIONARY[lang].swapReceive}</span>
                  <span>{DICTIONARY[lang].swapBalance} {SWAP_TOKENS[swapToToken].balance} {swapToToken}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    readOnly
                    value={swapToAmount}
                    className="bg-transparent text-white/70 font-black text-lg outline-none w-1/2"
                  />
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'to' ? null : 'to')}
                    className="bg-black hover:bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white active:scale-95 transition"
                  >
                    <TokenLogo symbol={swapToToken} className="w-4 h-4 rounded-full shrink-0" />
                    <span>{swapToToken}</span>
                    <span className="text-[8px] text-neutral-500">▼</span>
                  </button>
                </div>

                {/* Dropdown To */}
                {activeDropdown === 'to' && (
                  <div className="absolute right-4 top-14 z-50 bg-[#141416] border border-white/10 p-1.5 rounded-xl shadow-2xl space-y-1 w-44 max-h-64 overflow-y-auto no-scrollbar animate-fade-in">
                    {Object.keys(SWAP_TOKENS).map((sym) => {
                      const t = SWAP_TOKENS[sym as keyof typeof SWAP_TOKENS];
                      return (
                        <button
                          key={sym}
                          onClick={() => handleSelectToken('to', sym as keyof typeof SWAP_TOKENS)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-left text-xs font-bold transition text-white"
                        >
                          <TokenLogo symbol={sym} className="w-4.5 h-4.5 rounded-full shrink-0" />
                          <div className="flex flex-col">
                            <span className="leading-tight">{sym}</span>
                            <span className="text-[8px] text-neutral-500 leading-none">{t.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Swap details info card */}
              <div className="p-3 text-[11px] text-neutral-400 space-y-1 bg-black/40 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span>{DICTIONARY[lang].swapRate}</span>
                  <span className="text-white font-semibold">
                    1 {swapFromToken} = {(SWAP_TOKENS[swapFromToken].priceUsd / SWAP_TOKENS[swapToToken].priceUsd).toFixed(swapToToken === 'NOT' ? 4 : 3)} {swapToToken}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{DICTIONARY[lang].swapBonus}</span>
                  <span className="text-[#FF9900] font-semibold flex items-center gap-1">⚡ +100 XP</span>
                </div>
              </div>

              {/* Action swap button */}
              <button
                onClick={executeSwap}
                disabled={isSwapping}
                className="w-full bg-[#FF9900] text-black font-black p-3.5 rounded-xl shadow-lg hover:shadow-[#FF9900]/10 active:scale-[0.99] transition-all duration-300 disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {isSwapping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{DICTIONARY[lang].swappingProgress}</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{walletAddress ? DICTIONARY[lang].swapButtonActive : DICTIONARY[lang].swapButtonInactive}</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  // ===============================================
  // ===============================================
  // === INNER CORE MOBILE CONTENT COMPONENT ===
  // ===============================================
  // ===============================================
  function MobileAppContent() {
    return (
      <div className="flex flex-col flex-1 bg-black min-h-full pb-20 relative">
        
        {/* === HEADER === */}
        <header className="p-4 flex items-center justify-between border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-2" onClick={() => { setActiveTab('home'); setShowLeaderboard(false); }}>
            <img 
              src="/logo.png" 
              alt="STON Hub Logo" 
              className="w-8 h-8 rounded-full object-cover border border-[#FF9900]/30 shadow-md shadow-[#FF9900]/5"
            />
            <div className="flex items-center gap-1">
              <span className="text-sm font-black tracking-tighter text-white">STON</span>
              <span className="ph-badge text-[10px] py-[1px] px-[4px]">Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Premium segmented language toggle */}
            <div className="flex items-center p-0.5 bg-neutral-900/60 backdrop-blur border border-white/10 rounded-xl relative overflow-hidden h-[30px] w-[70px]">
              <div 
                className={`absolute top-0.5 bottom-0.5 w-[31px] rounded-lg bg-[#FF9900] shadow-md shadow-[#FF9900]/20 transition-all duration-300 ${
                  lang === 'en' ? 'left-[36px]' : 'left-0.5'
                }`}
              />
              <button 
                onClick={() => lang !== 'ru' && toggleLang()}
                className={`flex-1 text-[10px] font-black z-10 text-center transition-colors duration-200 ${
                  lang === 'ru' ? 'text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                RU
              </button>
              <button 
                onClick={() => lang !== 'en' && toggleLang()}
                className={`flex-1 text-[10px] font-black z-10 text-center transition-colors duration-200 ${
                  lang === 'en' ? 'text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <div className="scale-[0.9] origin-right">
              {walletAddress ? (
                <button 
                  onClick={() => tonConnectUI.disconnect()}
                  className="bg-neutral-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black text-emerald-400 flex items-center gap-1.5 shadow-sm active:scale-95 transition whitespace-nowrap"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
                </button>
              ) : (
                <button 
                  onClick={() => tonConnectUI.openModal()}
                  className="bg-gradient-to-tr from-[#FF9900] to-[#FF5500] hover:from-[#FF5500] hover:to-[#FF9900] text-black px-3.5 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-[#FF9900]/10 hover:shadow-[#FF9900]/25 active:scale-95 transition whitespace-nowrap"
                >
                  {DICTIONARY[lang].connectWalletBtn}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* === Live Price Bar === */}
        <div className="px-4 py-2 bg-neutral-950 border-b border-white/5 flex items-center justify-between text-[11px] font-sans">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-ping" />
            <span className="text-neutral-400 font-medium">{lang === 'ru' ? 'Цена STON.fi:' : 'STON.fi Price:'}</span>
            <motion.span 
              key={stonPrice}
              initial={{ opacity: 0.5, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-bold tracking-wider ${priceDirection === 'up' ? 'text-[#FF9900]' : 'text-rose-500'}`}
            >
              ${stonPrice.toFixed(3)}
            </motion.span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 text-[#FF9900]" />
            <span>+4.25% 24h</span>
          </div>
        </div>

        {/* === GLOBAL NOTIFICATION === */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 12, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-12 left-4 right-4 z-50 p-3 rounded-xl glass-panel text-center text-xs font-bold flex items-center justify-center gap-2 text-[#FF9900] border-[#FF9900]/30 shadow-[0_5px_20px_rgba(0,0,0,0.8)]"
            >
              <Sparkles className="w-4 h-4 text-[#FF9900]" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* === MAIN TAB CONTAINER === */}
        <main className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* === TAB 1: ГЛАВНАЯ (HOME DASHBOARD) === */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                {/* Ambassador Card (Welcome) */}
                <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FF9900]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF9900] to-[#FF5500] p-0.5 shadow-xl animate-pulse">
                        <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
                          {tgUser?.photoUrl ? (
                            <img 
                              src={tgUser.photoUrl} 
                              alt="Profile" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <img src="/logo.png" className="w-full h-full object-cover" />
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#FF9900] text-black w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-neutral-900 shadow-md">
                        <Flame className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-sm text-white leading-tight">
                          {tgUser 
                            ? `${DICTIONARY[lang].hiUser}${tgUser.username ? `@${tgUser.username}` : tgUser.firstName}` 
                            : DICTIONARY[lang].hiAmbassador}
                        </h2>
                        <span className="bg-[#FF9900]/10 text-[#FF9900] text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase border border-[#FF9900]/20 shrink-0">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#FF9900]" />
                        <span className="text-neutral-400 font-medium">{DICTIONARY[lang].rankLabel}</span><span className="text-white font-semibold">{userRank}</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress bar to next rank */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-neutral-400 font-medium">{DICTIONARY[lang].progressLabel}</span>
                      <span className="text-[#FF9900] font-black">{userXp} / 5000 XP</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF9900] rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((userXp / 5000) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-neutral-500">
                      <span>Уровень 12</span>
                      <span className="italic font-medium">+{5000 - userXp} XP {DICTIONARY[lang].nextRankText}</span>
                    </div>
                  </div>
                </div>

                {/* Balance $STON with dynamic drift chart */}
                <div className="glass-panel rounded-2xl p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-2xl" />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">{DICTIONARY[lang].balanceLabel}</span>
                      <h3 className="text-2xl font-black text-white flex items-center gap-1">
                        <span>1,250.75</span>
                        <span className="text-xs text-[#FF9900] font-black bg-[#FF9900]/10 py-0.5 px-2 rounded-full ml-1">STON</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 font-medium">~${(1250.75 * stonPrice).toLocaleString('en-US', {maximumFractionDigits: 2})}</span>
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                        <TrendingUp className="w-3 h-3" /> +12.5% {DICTIONARY[lang].sevenDaysText}
                      </p>
                    </div>
                  </div>

                  {/* Gorgeous simulated chart line in orange gradient */}
                  <div className="h-12 w-full mt-2 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF9900" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#FF9900" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid line helper */}
                      <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                      <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                      <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                      {/* Chart area fill */}
                      <path d="M 0 25 Q 15 28, 30 18 T 60 12 T 85 8 T 100 5 L 100 30 L 0 30 Z" fill="url(#chartGrad)" />
                      {/* Chart path stroke */}
                      <path d="M 0 25 Q 15 28, 30 18 T 60 12 T 85 8 T 100 5" fill="none" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
                      {/* Glow dot indicator */}
                      <circle cx="100" cy="5" r="2.5" fill="#FFFFFF" className="orange-glow animate-ping" />
                      <circle cx="100" cy="5" r="1.5" fill="#FF9900" />
                    </svg>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                  <h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1 mb-2">{DICTIONARY[lang].quickActions}</h4>
                  <div className="grid grid-cols-4 gap-2.5">
                    <button 
                      onClick={() => setActiveTab('missions')}
                      className="p-3 bg-neutral-900 border border-white/5 rounded-xl hover:border-[#FF9900]/30 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Target className="w-5 h-5 text-[#FF9900]" />
                      <span className="text-[9px] font-bold text-white uppercase">{lang === 'ru' ? 'Миссии' : 'Missions'}</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('videos')}
                      className="p-3 bg-neutral-900 border border-white/5 rounded-xl hover:border-[#FF9900]/30 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95"
                    >
                      <BookOpen className="w-5 h-5 text-[#FF9900]" />
                      <span className="text-[9px] font-bold text-white uppercase">{lang === 'ru' ? 'Академия' : 'Academy'}</span>
                    </button>
                    <button 
                      onClick={() => setShowSwapModal(true)}
                      className="p-3 bg-neutral-900 border border-white/5 rounded-xl hover:border-[#FF9900]/30 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ArrowLeftRight className="w-5 h-5 text-[#FF9900]" />
                      <span className="text-[9px] font-bold text-white uppercase">{DICTIONARY[lang].swapActionBtn}</span>
                    </button>
                    <button 
                      onClick={handleDailyClaim}
                      disabled={dailyClaimed}
                      className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                        dailyClaimed 
                          ? 'bg-neutral-950 border-neutral-900 text-neutral-600'
                          : 'bg-neutral-900 border-white/5 hover:border-[#FF9900]/30 text-[#FF9900]'
                      }`}
                    >
                      <Flame className={`w-5 h-5 ${dailyClaimed ? 'text-neutral-600' : 'animate-pulse'}`} />
                      <span className="text-[9px] font-bold text-white uppercase">{DICTIONARY[lang].dailyClaimBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Welcome Info Box */}
                <div className="glass-panel rounded-xl p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF9900]" />
                    <h3 className="font-bold text-xs text-white">{DICTIONARY[lang].welcomeTitle}</h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {DICTIONARY[lang].welcomeDesc}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs text-[#FF9900] font-bold cursor-pointer" onClick={() => setActiveTab('videos')}>
                    <span>{DICTIONARY[lang].goToAcademy}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Ecosystem Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-[#141416]/50 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] text-neutral-500 uppercase font-black">{DICTIONARY[lang].completedQuests}</p>
                    <p className="text-xs font-black mt-1 text-white">4 / 5</p>
                  </div>
                  <div className="p-3 bg-[#141416]/50 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] text-neutral-500 uppercase font-black">{DICTIONARY[lang].completedLessons}</p>
                    <p className="text-xs font-black mt-1 text-white">2 / 3</p>
                  </div>
                  <div className="p-3 bg-[#141416]/50 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] text-neutral-500 uppercase font-black">{DICTIONARY[lang].savingApy}</p>
                    <p className="text-xs font-black mt-1 text-emerald-400">78.5%</p>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* === TAB 2: ВИДЕО (ACADEMY VIDEO HUB) === */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                {selectedLesson ? (
                  // --- Detailed Text Guide View ---
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel rounded-2xl p-5 space-y-5 border-[#FF9900]/20 text-left"
                  >
                    {/* Back Button */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-[9px] font-black text-[#FF9900] uppercase bg-[#FF9900]/10 px-2.5 py-0.5 rounded-full border border-[#FF9900]/20">
                        {selectedLesson.category}
                      </span>
                      <button 
                        onClick={() => setSelectedLesson(null)}
                        className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.5 font-bold"
                      >
                        {DICTIONARY[lang].backToList}
                      </button>
                    </div>

                    {/* Elegant Header Banner */}
                    <div className="w-full rounded-xl bg-gradient-to-br from-amber-950/20 via-neutral-900/80 to-black p-5 border border-white/5 relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF9900]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2 text-[10px] text-[#FF9900] font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{DICTIONARY[lang].studyMaterial}</span>
                      </div>
                      <h2 className="text-sm font-black text-white leading-snug mb-3">
                        {selectedLesson.title}
                      </h2>
                      <div className="flex gap-4 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1 font-semibold">
                          <BookOpen className="w-3.5 h-3.5 text-[#FF9900]" />
                          {DICTIONARY[lang].readTime} {selectedLesson.readTime}
                        </span>
                        <span>•</span>
                        <span>{selectedLesson.views}</span>
                      </div>
                    </div>

                    {/* Reading Content Pane */}
                    <div className="text-xs text-neutral-300 space-y-4 leading-relaxed font-sans border-b border-white/5 pb-4">
                      {selectedLesson.content ? (
                        selectedLesson.content.map((paragraph, index) => (
                          <p key={index} className="text-neutral-300">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="text-neutral-300">
                          {selectedLesson.description}
                        </p>
                      )}
                    </div>

                    {/* Interactive Lesson Quiz */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-white">
                        <HelpCircle className="w-4 h-4 text-[#FF9900]" />
                        <span>{DICTIONARY[lang].quizPrompt}{selectedLesson.xpReward} XP:</span>
                      </div>
                      
                      <p className="text-xs text-white font-bold bg-neutral-900/60 p-4 rounded-xl border border-white/5 leading-snug">
                        {selectedLesson.quiz.question}
                      </p>

                      <div className="space-y-2.5">
                        {selectedLesson.quiz.options.map((opt, idx) => (
                          <button
                            key={idx}
                            disabled={quizResult === 'correct'}
                            onClick={() => handleLessonQuizSubmit(idx)}
                            className={`w-full text-left text-xs p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                              quizAnswer === idx
                                ? quizResult === 'correct'
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                                  : 'bg-rose-500/10 border-rose-500 text-rose-500 font-bold'
                                : 'bg-neutral-900 border-white/5 text-white hover:border-[#FF9900]/30 active:scale-[0.99]'
                            }`}
                          >
                            <span>{opt}</span>
                            {quizAnswer === idx && (
                              quizResult === 'correct' 
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" /> 
                                : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                            )}
                          </button>
                        ))}
                      </div>

                      {quizResult === 'correct' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{DICTIONARY[lang].quizSuccess}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  // --- Academy Section Main View ---
                  <div className="space-y-4">
                    {/* Header titles */}
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-base font-black text-white">{DICTIONARY[lang].academyTitle}</h2>
                        <p className="text-[11px] text-neutral-400">{DICTIONARY[lang].academyDesc}</p>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold">
                        {videoFilter === 'guides' ? `${DICTIONARY[lang].totalGuides} ${filteredLessons.length}` : (lang === 'ru' ? 'Скоро' : 'Soon')}
                      </span>
                    </div>

                    {/* Horizontal Categories Scroll */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
                      {[
                        { key: 'guides', label: lang === 'ru' ? 'Гайды' : 'Guides' },
                        { key: 'videos', label: lang === 'ru' ? 'Видео' : 'Videos' }
                      ].map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => setVideoFilter(cat.key)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border shrink-0 transition-all ${
                            videoFilter === cat.key
                              ? 'bg-[#FF9900] text-black border-[#FF9900] shadow-sm'
                              : 'bg-neutral-900 text-neutral-400 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {videoFilter === 'videos' ? (
                      /* Coming Soon Video Empty State */
                      <div className="glass-panel rounded-2xl p-8 text-center space-y-4 border-white/5 my-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-[#FF9900]/30 flex items-center justify-center mx-auto shadow-lg relative">
                          <Play className="w-6 h-6 text-[#FF9900] animate-pulse" />
                          <div className="absolute inset-0 rounded-full border border-[#FF9900]/20 animate-ping opacity-70" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-white">Видеокурсы — Скоро будет 🎬</h3>
                          <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                            Мы готовим для вас серию эксклюзивных видеоматериалов по трейдингу, ликвидности и стейкингу в экосистеме STON.fi. 
                          </p>
                        </div>
                        <span className="inline-block bg-[#FF9900]/10 text-[#FF9900] text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase border border-[#FF9900]/20">
                          COMING SOON
                        </span>
                      </div>
                    ) : (
                      /* Elegant list of Text Guides */
                      <div className="space-y-3.5">
                        {filteredLessons.map(lesson => {
                          const isCompleted = completedLessonIds.includes(lesson.id);
                          return (
                            <div 
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className="glass-panel-interactive rounded-xl p-4 cursor-pointer border border-white/5 relative group text-left transition-all duration-300 hover:border-[#FF9900]/30 hover:shadow-[0_4px_20px_rgba(255,153,0,0.05)]"
                            >
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="text-[8px] font-black text-[#FF9900] uppercase bg-[#FF9900]/10 border border-[#FF9900]/20 px-2.5 py-0.5 rounded-full">
                                  {lesson.category}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  ⚡ +{lesson.xpReward} XP
                                </span>
                              </div>
                              
                              <h3 className="font-black text-xs text-white group-hover:text-[#FF9900] transition duration-200 line-clamp-2 leading-snug mb-1.5">
                                {lesson.title}
                              </h3>
                              
                              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                                {lesson.description}
                              </p>
                              
                              <div className="flex justify-between items-center text-[10px] text-neutral-500 border-t border-white/5 pt-2.5">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                                    {lesson.readTime}
                                  </span>
                                  <span>{lesson.views}</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 font-bold text-[#FF9900] group-hover:translate-x-0.5 transition-transform duration-200">
                                  {isCompleted ? (
                                    <span className="text-emerald-400 flex items-center gap-0.5 text-[9px] font-black uppercase">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> {DICTIONARY[lang].completed}
                                    </span>
                                  ) : (
                                    <>
                                      <span>{DICTIONARY[lang].readGuide}</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* === TAB 3: МИССИИ (MISSIONS HUB) === */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {activeTab === 'missions' && (
              <motion.div
                key="missions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h2 className="text-base font-black text-white">{DICTIONARY[lang].missionsTitle}</h2>
                  <p className="text-[11px] text-neutral-400">{DICTIONARY[lang].missionsDesc}</p>
                </div>

                {/* Quests Lists */}
                <div className="space-y-3">
                  {missions.map(mission => (
                    <div 
                      key={mission.id}
                      className={`glass-panel rounded-xl p-4 border transition-all duration-300 relative ${
                        mission.status === 'completed' 
                          ? 'border-emerald-500/25 bg-emerald-500/[0.02]' 
                          : 'border-white/5 hover:border-[#FF9900]/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              mission.type === 'web3' 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20'
                            }`}>
                              {mission.type}
                            </span>
                            <span className="text-[10px] font-bold text-[#FF9900]">⚡ +{mission.xpReward} XP</span>
                          </div>
                          <h3 className="font-bold text-xs text-white mt-1.5">{mission.title}</h3>
                          <p className="text-[10px] text-neutral-400 leading-snug mt-1">{mission.description}</p>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="shrink-0 pt-0.5">
                          {mission.status === 'completed' ? (
                            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> {DICTIONARY[lang].done}
                            </div>
                          ) : mission.status === 'pending' ? (
                            <div className="bg-[#FF9900]/10 text-[#FF9900] text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#FF9900]/20 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" /> {DICTIONARY[lang].pending}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (mission.id === 'm-1') {
                                  // Trigger wallet connect button (custom text alert helper)
                                  showNotificationMessage(DICTIONARY[lang].connectWalletAlert);
                                } else if (mission.id === 'm-3') {
                                  setActiveTab('videos');
                                } else if (mission.id === 'm-4') {
                                  setShowSwapModal(true);
                                } else {
                                  handleMissionComplete(mission.id, mission.link);
                                }
                              }}
                              className="bg-[#FF9900] hover:bg-[#FF9900]/80 text-black text-[10px] font-black px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
                            >
                              {DICTIONARY[lang].start}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Referral system Card */}
                <div className="p-4 rounded-xl bg-gradient-to-tr from-amber-950/15 via-[#141416] to-black border border-[#FF9900]/15 space-y-3 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF9900]/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FF9900]" />
                    <h3 className="font-bold text-xs text-white">{DICTIONARY[lang].referralTitle}</h3>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-snug">
                    {DICTIONARY[lang].referralDesc}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="text" 
                      readOnly 
                      value="https://t.me/ston_hub_bot/app?startapp=ref_328" 
                      className="flex-1 bg-black/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-[9px] text-neutral-400 select-all cursor-pointer font-mono outline-none" 
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("https://t.me/ston_hub_bot/app?startapp=ref_328");
                        showNotificationMessage("Реферальная ссылка скопирована! 📋");
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg"
                    >
                      Copy
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* === TAB 4: ПРОФИЛЬ (PROFILE STATS) === */}
            {/* ======================================= */}
            {/* ======================================= */}
            {/* ======================================= */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                {showLeaderboard ? (
                  // --- Leaderboard Overlay ---
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                      <div>
                        <h2 className="text-base font-black text-white flex items-center gap-1.5"><Trophy className="w-5 h-5 text-[#FF9900]" /> {DICTIONARY[lang].leaderboardTitle}</h2>
                        <p className="text-[10px] text-neutral-400">Глобальный рейтинг амбассадоров</p>
                      </div>
                      <button 
                        onClick={() => setShowLeaderboard(false)}
                        className="text-xs text-[#FF9900] font-bold hover:underline"
                      >
                        {DICTIONARY[lang].backToProfile}
                      </button>
                    </div>

                    {/* Top 3 podium display */}
                    <div className="grid grid-cols-3 gap-2.5 pb-2 pt-4">
                      {/* 2nd Place */}
                      <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center mt-3 relative">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-[11px] font-black text-white mb-1 shadow">2</div>
                        <span className="text-[9px] font-black truncate max-w-full text-white">cryptoboss</span>
                        <span className="text-[10px] text-[#FF9900] font-bold mt-1">2,890 XP</span>
                      </div>

                      {/* 1st Place */}
                      <div className="bg-gradient-to-b from-amber-500/10 to-neutral-900/80 border border-[#FF9900]/30 rounded-xl p-3.5 flex flex-col items-center justify-center text-center relative -translate-y-2.5 shadow-xl shadow-[#FF9900]/5">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm animate-bounce">👑</div>
                        <div className="w-10 h-10 rounded-full bg-[#FF9900]/20 flex items-center justify-center border-2 border-[#FF9900] text-[12px] font-black text-white mb-1 shadow-lg">1</div>
                        <span className="text-[10px] font-black truncate max-w-full text-white">tonlegend</span>
                        <span className="text-xs text-emerald-400 font-bold mt-1">5,420 XP</span>
                      </div>

                      {/* 3rd Place */}
                      <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center mt-6 relative">
                        <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-[10px] font-black text-white mb-1 shadow">3</div>
                        <span className="text-[9px] font-black truncate max-w-full text-white">stonmaster</span>
                        <span className="text-[10px] text-[#FF9900] font-bold mt-1">2,450 XP</span>
                      </div>
                    </div>

                    {/* Table lists */}
                    <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
                      <div className="p-3 border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-neutral-400 flex justify-between">
                        <span>{DICTIONARY[lang].tableAmbassador}</span>
                        <span>{DICTIONARY[lang].tableXp}</span>
                      </div>
                      
                      <div className="divide-y divide-white/5">
                        {leaders.filter(l => !l.isCurrentUser).map((leader, i) => (
                          <div 
                            key={i}
                            className="p-3 flex justify-between items-center text-xs hover:bg-white/5 transition"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 text-center font-bold text-[10px] ${
                                leader.rank === 1 ? 'text-amber-400' : leader.rank === 2 ? 'text-neutral-300' : leader.rank === 3 ? 'text-amber-700' : 'text-neutral-500'
                              }`}>
                                #{leader.rank}
                              </span>
                              <div>
                                <p className="text-white font-bold text-[11px]">{leader.name}</p>
                                <p className="text-[8px] text-neutral-500">{leader.badge}</p>
                              </div>
                            </div>
                            <span className="text-[#FF9900] font-bold text-[11px]">{leader.xp.toLocaleString()} XP</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlighted current user footer ranking */}
                    <div className="bg-[#FF9900]/10 border border-[#FF9900]/30 p-3.5 rounded-xl flex justify-between items-center relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-[#FF9900]/30 flex items-center justify-center overflow-hidden">
                          <img src="/logo.png" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-white">{lang === 'ru' ? 'Твой рейтинг (Вы)' : 'Your rank (You)'}</p>
                          <p className="text-[9px] text-neutral-400">{userRank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#FF9900] block">{userXp.toLocaleString()} XP</span>
                        <span className="text-[9px] font-bold text-neutral-500">{lang === 'ru' ? 'В рейтинге: #4' : 'Ranked: #4'}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // --- Profile main view ---
                  <div className="space-y-4">
                    {/* Ambassador status */}
                    <div className="glass-panel rounded-xl p-4 text-center relative overflow-hidden space-y-3">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5500] to-[#FF9900]" />
                      <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-[#FF9900] mx-auto overflow-hidden flex items-center justify-center orange-glow-sm">
                        <img src="/logo.png" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white flex items-center justify-center gap-1">
                          <span>{DICTIONARY[lang].yourLevel}</span>
                          <span className="text-[#FF9900] font-black">Lv. 12</span>
                        </h3>
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">{DICTIONARY[lang].officialAmbassador}</p>
                      </div>
                    </div>

                    {/* Stats box list */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1">{DICTIONARY[lang].statsTitle}</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-neutral-500 uppercase font-black block">{DICTIONARY[lang].statsQuests}</span>
                          <span className="text-base font-black text-white mt-1 block">32</span>
                        </div>
                        <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-neutral-500 uppercase font-black block">{DICTIONARY[lang].statsFriends}</span>
                          <span className="text-base font-black text-white mt-1 block">18</span>
                        </div>
                        <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-neutral-500 uppercase font-black block">{DICTIONARY[lang].statsEarnings}</span>
                          <span className="text-base font-black text-[#FF9900] mt-1 block">2,350 $STON</span>
                        </div>
                        <div 
                          onClick={() => setShowLeaderboard(true)}
                          className="p-3 bg-neutral-900 border border-white/10 hover:border-[#FF9900]/30 rounded-xl cursor-pointer transition active:scale-95"
                        >
                          <span className="text-[8px] text-[#FF9900] uppercase font-black flex items-center justify-between">
                            <span>{DICTIONARY[lang].statsRanking}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-base font-black text-white mt-1 block">#4</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievements row */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pl-1 pr-1">
                        <h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">{DICTIONARY[lang].achievementsTitle}</h4>
                        <button onClick={() => showNotificationMessage("Ачивки обновляются автоматически!")} className="text-[9px] text-neutral-400 hover:text-white">{DICTIONARY[lang].viewAll}</button>
                      </div>
                      
                      <div className="flex gap-2 justify-around bg-neutral-900/60 p-4 border border-white/5 rounded-xl">
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center text-sm shadow">🔥</div>
                          <span className="text-[8px] font-black text-neutral-400">{DICTIONARY[lang].badgeStreak}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-slate-300/10 border border-slate-300 flex items-center justify-center text-sm shadow">💎</div>
                          <span className="text-[8px] font-black text-neutral-400">{DICTIONARY[lang].badgeGuru}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-amber-600/10 border border-amber-600 flex items-center justify-center text-sm shadow">👑</div>
                          <span className="text-[8px] font-black text-neutral-400">{DICTIONARY[lang].badgeSwaper}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm shadow opacity-40">⭐</div>
                          <span className="text-[8px] font-black text-neutral-500">{DICTIONARY[lang].badgeKing}</span>
                        </div>
                      </div>
                    </div>

                    {/* Disconnect button mockup */}
                    <div className="pt-2">
                      <button 
                        onClick={() => showNotificationMessage("Трансформация выполнена в стиле Pornhub! 🚀")}
                        className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-white/5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white active:scale-95 transition"
                      >
                        STONHub OS v1.2
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* === BOTTOM PREMIUM DOCKED NAVIGATION === */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-black/90 backdrop-blur-lg border-t border-white/5 px-2 py-3 flex justify-around select-none">
          
          {/* Home Tab */}
          <button 
            onClick={() => { setActiveTab('home'); setShowLeaderboard(false); }}
            className={`flex flex-col items-center gap-1.5 transition duration-300 relative ${
              activeTab === 'home' ? 'text-[#FF9900]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">{lang === 'ru' ? 'Главная' : 'Home'}</span>
            {activeTab === 'home' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#FF9900] rounded-t-full shadow-lg shadow-[#FF9900]/50" />
            )}
          </button>

          {/* Videos Tab */}
          <button 
            onClick={() => { setActiveTab('videos'); setShowLeaderboard(false); }}
            className={`flex flex-col items-center gap-1.5 transition duration-300 relative ${
              activeTab === 'videos' ? 'text-[#FF9900]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">{lang === 'ru' ? 'Академия' : 'Academy'}</span>
            {activeTab === 'videos' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#FF9900] rounded-t-full shadow-lg shadow-[#FF9900]/50" />
            )}
          </button>

          {/* Missions Tab */}
          <button 
            onClick={() => { setActiveTab('missions'); setShowLeaderboard(false); }}
            className={`flex flex-col items-center gap-1.5 transition duration-300 relative ${
              activeTab === 'missions' ? 'text-[#FF9900]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">{lang === 'ru' ? 'Миссии' : 'Missions'}</span>
            {activeTab === 'missions' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#FF9900] rounded-t-full shadow-lg shadow-[#FF9900]/50" />
            )}
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => { setActiveTab('profile'); setShowLeaderboard(false); }}
            className={`flex flex-col items-center gap-1.5 transition duration-300 relative ${
              activeTab === 'profile' ? 'text-[#FF9900]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase">{lang === 'ru' ? 'Профиль' : 'Profile'}</span>
            {activeTab === 'profile' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#FF9900] rounded-t-full shadow-lg shadow-[#FF9900]/50" />
            )}
          </button>

        </nav>

        {/* ========================================== */}
        {/* === INTERACTIVE TUTORIAL CHARACTER GUIDE === */}
        {/* ========================================== */}
        <AnimatePresence>
          {tutorialStep !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed sm:absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-4 font-sans select-none"
            >
              <div className="relative w-full flex flex-row items-center gap-2.5">
                
                {/* Character Image (Left Column) */}
                <motion.div 
                  key={TUTORIAL_STEPS[tutorialStep].image}
                  initial={{ x: -30, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 pointer-events-none z-10"
                >
                  <img 
                    src={TUTORIAL_STEPS[tutorialStep].image} 
                    alt="Intro Character" 
                    className="w-full h-full object-contain filter drop-shadow-[0_5px_15px_rgba(255,153,0,0.25)]" 
                  />
                </motion.div>

                {/* Chat Bubble / Cloud (Right Column) */}
                <motion.div
                  key={tutorialStep}
                  initial={{ opacity: 0, x: 20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 bg-neutral-900/95 border-2 border-[#FF9900]/30 rounded-2xl p-4 shadow-[0_15px_40px_rgba(255,153,0,0.15)] relative text-left"
                >
                  <h4 className="text-[10px] font-black text-[#FF9900] uppercase tracking-wider mb-1">{DICTIONARY[lang].guideName}</h4>
                  <p className="text-[11px] text-white leading-relaxed font-semibold">
                    {TUTORIAL_STEPS[tutorialStep].text}
                  </p>
                  
                  {/* Navigation Controls */}
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5">
                    <button 
                      onClick={handleSkipTutorial}
                      className="text-[10px] text-neutral-500 hover:text-white font-bold transition"
                    >
                      {DICTIONARY[lang].skip}
                    </button>
                    <button 
                      onClick={handleNextTutorial}
                      className="bg-[#FF9900] hover:bg-[#FF9900]/80 text-black text-[10px] font-black py-1.5 px-4 rounded-lg active:scale-95 transition"
                    >
                      {tutorialStep === TUTORIAL_STEPS.length - 1 ? DICTIONARY[lang].finish : DICTIONARY[lang].next}
                    </button>
                  </div>
                  
                  {/* Speech bubble tail pointing left to the character, vertically centered */}
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-[#FF9900]/30" />
                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-neutral-900" />
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }
}

