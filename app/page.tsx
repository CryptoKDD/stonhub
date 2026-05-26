'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, Target, ArrowLeftRight, Trophy, 
  Coins, Sparkles, CheckCircle2, AlertCircle, Wallet, 
  ChevronRight, ArrowUpRight, Flame, Award, HelpCircle,
  TrendingUp, RefreshCw, Users
} from 'lucide-react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

// === interfaces ===
interface Lesson {
  id: string;
  title: string;
  category: string;
  description: string;
  xpReward: number;
  readTime: string;
  completed: boolean;
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
  };
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

export default function Home() {
  // === Web3 states ===
  const walletAddress = useTonAddress();

  // === App local states ===
  const [activeTab, setActiveTab] = useState<'profile' | 'academy' | 'missions' | 'swap' | 'leaderboard'>('profile');
  const [userXp, setUserXp] = useState<number>(350);
  const [userRank, setUserRank] = useState<string>('Silver Vibe');
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [stonPrice, setStonPrice] = useState<number>(3.25);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down'>('up');
  const [notification, setNotification] = useState<string | null>(null);
  const [tgUser, setTgUser] = useState<{ 
    firstName?: string; 
    lastName?: string; 
    username?: string; 
    photoUrl?: string; 
  } | null>(null);

  // === Academy States ===
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // === Swap States ===
  const [swapFromAmount, setSwapFromAmount] = useState<string>('');
  const [swapToAmount, setSwapToAmount] = useState<string>('');
  const [swapToken, setSwapToken] = useState<'TON' | 'STON'>('TON');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // === Mock Data ===
  const [lessons] = useState<Lesson[]>([
    {
      id: 'lesson-1',
      title: 'Что такое STON.fi?',
      category: 'Основы DeFi',
      description: 'Узнайте о ведущем децентрализованном маркетмейкере (AMM DEX) на блокчейне TON, его преимуществах и возможностях.',
      xpReward: 50,
      readTime: '3 мин',
      completed: false,
      quiz: {
        question: 'Какую архитектуру использует STON.fi DEX?',
        options: [
          'Order Book (Книга ордеров)',
          'AMM (Автоматический маркетмейкер)',
          'Централизованный оракул'
        ],
        answerIndex: 1
      }
    },
    {
      id: 'lesson-2',
      title: 'Предоставление ликвидности',
      category: 'Yield Farming',
      description: 'Поймите, как работают пулы ликвидности, как вносить средства и получать комиссионные с каждой сделки в экосистеме.',
      xpReward: 75,
      readTime: '5 мин',
      completed: false,
      quiz: {
        question: 'Что получает провайдер ликвидности взамен внесенных токенов?',
        options: [
          'LP токены',
          'NFT ваучеры',
          'Только устную благодарность'
        ],
        answerIndex: 0
      }
    },
    {
      id: 'lesson-3',
      title: 'Управление и токен $STON',
      category: 'Токеномика',
      description: 'Роль нативного токена управления $STON, протоколы стейкинга и как участвовать в голосованиях за будущее платформы.',
      xpReward: 100,
      readTime: '4 мин',
      completed: false,
      quiz: {
        question: 'Какое ключевое преимущество стейкинга $STON на платформе STON.fi?',
        options: [
          'Снижение лимитов обмена',
          'Получение AR-STON и доли в доходах протокола',
          'Автоматическая покупка TON'
        ],
        answerIndex: 1
      }
    }
  ]);

  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'm-1',
      title: 'Подписка на STON.fi Telegram',
      description: 'Присоединяйтесь к официальному новостному каналу экосистемы STON.fi.',
      xpReward: 40,
      type: 'social',
      status: 'available',
      link: 'https://t.me/stonfidex'
    },
    {
      id: 'm-2',
      title: 'Сделать первый Vibe Swap',
      description: 'Совершите обмен любого объема TON/STON внутри нашего Mini App.',
      xpReward: 120,
      type: 'web3',
      status: 'available',
      link: '#swap'
    },
    {
      id: 'm-3',
      title: 'Пригласить 3х амбассадоров',
      description: 'Поделитесь реферальной ссылкой и помогите друзьям повысить свой вайб.',
      xpReward: 150,
      type: 'social',
      status: 'available',
      link: 'https://t.me/share/url?url=https://t.me/ston_vibe_studio_bot/app'
    }
  ]);

  const [leaders, setLeaders] = useState<Leader[]>([
    { rank: 1, name: 'StonFi_King 💎', xp: 2840, badge: 'Diamond Vibe' },
    { rank: 2, name: 'Ton_DeFi_Expert', xp: 2450, badge: 'Diamond Vibe' },
    { rank: 3, name: 'VibeFinder 🚀', xp: 2190, badge: 'Platinum Vibe' },
    { rank: 4, name: 'Ston_Ambassador_99', xp: 1850, badge: 'Platinum Vibe' },
    { rank: 5, name: 'STON_Vibe_User (Вы)', xp: 350, badge: 'Silver Vibe', isCurrentUser: true },
    { rank: 6, name: 'DeFi_Master_Chef', xp: 1210, badge: 'Gold Vibe' },
    { rank: 7, name: 'LiquidityPanda', xp: 980, badge: 'Gold Vibe' }
  ]);

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
        console.warn('GeckoTerminal fetch failed, using simulator fallback', err);
      }
      return false;
    };

    // Initial fetch
    fetchRealPrice();

    // Poll every 15 seconds
    const interval = setInterval(async () => {
      const success = await fetchRealPrice();
      // If fetch failed, run simulator drift to keep UI feeling alive
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
        
        // Динамически обновляем имя в рейтинге лидеров
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
    if (userXp >= 1500) {
      currentRank = 'Diamond Vibe 💎';
    } else if (userXp >= 1000) {
      currentRank = 'Platinum Vibe 👑';
    } else if (userXp >= 600) {
      currentRank = 'Gold Vibe 🌟';
    } else if (userXp >= 300) {
      currentRank = 'Silver Vibe ✨';
    }

    setUserRank(currentRank);

    // Update inside leaders table
    setLeaders(prev => 
      prev.map(l => l.isCurrentUser ? { ...l, xp: userXp, badge: currentRank } : l)
        .sort((a, b) => b.xp - a.xp)
        .map((l, idx) => ({ ...l, rank: idx + 1 }))
    );
  }, [userXp]);

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
    showNotificationMessage('Вайб-чек пройден! Получено +25 XP ⚡');
    
    // Simulate haptic feedback if running in Telegram
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
        } catch (err) {
          console.warn('Failed to call HapticFeedback:', err);
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
    showNotificationMessage('Задание отправлено на проверку! ⏳');

    setTimeout(() => {
      setMissions(prev => 
        prev.map(m => m.id === missionId ? { ...m, status: 'completed' } : m)
      );
      setUserXp(prev => prev + mission.xpReward);
      showNotificationMessage(`Вайб подтвержден! Получено +${mission.xpReward} XP 🎉`);
    }, 4000);
  };

  const handleSwapAmountChange = (val: string) => {
    setSwapFromAmount(val);
    if (!val || isNaN(Number(val))) {
      setSwapToAmount('');
      return;
    }
    const amount = Number(val);
    if (swapToken === 'TON') {
      // 1 TON = ~1.6 STON (simulated)
      setSwapToAmount((amount * 1.58).toFixed(3));
    } else {
      setSwapToAmount((amount / 1.58).toFixed(3));
    }
  };

  const executeSwap = () => {
    if (!walletAddress) {
      showNotificationMessage('Пожалуйста, подключите кошелек TON! 🔌');
      return;
    }
    if (!swapFromAmount || Number(swapFromAmount) <= 0) {
      showNotificationMessage('Введите корректную сумму для обмена! ⚠️');
      return;
    }

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setUserXp(prev => prev + 60);
      showNotificationMessage(`Транзакция отправлена! Обмен выполнен! Получено +60 XP 🚀`);
      setSwapFromAmount('');
      setSwapToAmount('');
      
      // Update first swap mission if available
      setMissions(prev => 
        prev.map(m => m.id === 'm-2' ? { ...m, status: 'completed' } : m)
      );
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col font-sans max-w-md mx-auto relative pb-24 shadow-2xl">
      
      {/* === TOP ACCENT AURA === */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-[#7A5CFF]/15 to-transparent rounded-full filter blur-[60px] pointer-events-none -z-10" />

      {/* === HEADER === */}
      <header className="p-4 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#050816]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo.png" 
            alt="STONHUB Logo" 
            className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-md shadow-[#00D2FF]/10"
          />
          <div>
            <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-white via-[#00D2FF] to-[#00FFA3] bg-clip-text text-transparent">STONHUB</h1>
          </div>
        </div>

        <div className="scale-90 origin-right">
          <TonConnectButton />
        </div>
      </header>

      {/* === Live Price Widget === */}
      <div className="px-4 py-2 bg-gradient-to-r from-[#0B1120] to-[#050816] border-b border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-ping" />
          <span className="text-[#A0AEC0] font-medium">STON.fi Price:</span>
          <motion.span 
            key={stonPrice}
            initial={{ opacity: 0.5, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-semibold tracking-wider ${priceDirection === 'up' ? 'text-[#00FFA3]' : 'text-rose-500'}`}
          >
            ${stonPrice.toFixed(3)}
          </motion.span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#A0AEC0] bg-white/5 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3 text-[#00D2FF]" />
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
            className="fixed top-14 left-4 right-4 z-50 p-3 rounded-xl glass-panel text-center text-xs font-semibold flex items-center justify-center gap-2 text-white border-primary/30"
          >
            <Sparkles className="w-4 h-4 text-[#00D2FF]" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === MAIN CONTENT SCROLL AREA === */}
      <main className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* ==================== TAB 1: PROFILE ==================== */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {/* Ambassador Card */}
              <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00D2FF]/20 to-transparent rounded-full blur-2xl" />
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7A5CFF] to-[#00D2FF] p-0.5 shadow-xl animate-pulse">
                      <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center overflow-hidden">
                        {tgUser?.photoUrl ? (
                          <img 
                            src={tgUser.photoUrl} 
                            alt="User Profile" 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : tgUser?.firstName ? (
                          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#7A5CFF] to-[#00D2FF] flex items-center justify-center font-bold text-lg text-white">
                            {(tgUser.firstName).charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <User className="w-8 h-8 text-[#A0AEC0]" />
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#00FFA3] text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0B1120] shadow-md">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base tracking-tight text-white leading-tight">
                        {tgUser 
                          ? `Приветствую, ${tgUser.username ? `@${tgUser.username}` : tgUser.firstName} Амбассадор` 
                          : 'Приветствую, STON Амбассадор'}
                      </h2>
                      <span className="bg-[#00D2FF]/10 text-[#00D2FF] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border border-[#00D2FF]/20 shrink-0">Active</span>
                    </div>
                    <p className="text-xs text-[#A0AEC0] flex items-center gap-1.5 mt-0.5">
                      <Award className="w-3.5 h-3.5 text-[#00FFA3]" />
                      Ранг: <span className="text-white font-semibold">{userRank}</span>
                    </p>
                  </div>
                </div>

                {/* Progress bar to next rank */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A0AEC0] font-medium">Ваш Вайб-Опыт:</span>
                    <span className="text-[#00D2FF] font-bold">{userXp} / 1000 XP</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#7A5CFF] via-[#00D2FF] to-[#00FFA3] rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((userXp / 1000) * 100, 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-[10px] text-[#A0AEC0] text-right italic font-medium">
                    +650 XP до ранга Gold Vibe 🌟
                  </p>
                </div>
              </div>

              {/* Action Buttons grid */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleDailyClaim}
                  disabled={dailyClaimed}
                  className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border text-center transition-all duration-300 ${
                    dailyClaimed 
                      ? 'bg-white/5 border-white/5 text-[#A0AEC0]' 
                      : 'bg-gradient-to-br from-[#0B1120] to-[#121A2F] border-[#7A5CFF]/30 text-white shadow-lg hover:border-[#7A5CFF]/60 hover:shadow-[#7A5CFF]/5 active:scale-[0.97]'
                  }`}
                >
                  <Flame className={`w-6 h-6 ${dailyClaimed ? 'text-gray-500' : 'text-[#7A5CFF] animate-pulse'}`} />
                  <span className="text-xs font-bold">Daily Check-in</span>
                  <span className="text-[9px] opacity-80">{dailyClaimed ? 'Уже собрано сегодня' : 'Получить +25 XP'}</span>
                </button>

                <div className="p-4 rounded-xl bg-gradient-to-br from-[#0B1120] to-[#121A2F] border-white/5 flex flex-col items-center justify-center gap-2 text-center">
                  <Wallet className="w-6 h-6 text-[#00D2FF]" />
                  <span className="text-xs font-bold">Wallet Connect</span>
                  <span className="text-[9px] text-[#A0AEC0] truncate max-w-full px-1">
                    {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Кошелек не подключен'}
                  </span>
                </div>
              </div>

              {/* Welcome Info Box */}
              <div className="glass-panel rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00FFA3]" />
                  <h3 className="font-bold text-sm">Ваш Web3-онбординг в STON.fi</h3>
                </div>
                <p className="text-xs text-[#A0AEC0] leading-relaxed">
                  STON Vibe Studio открывает дорогу в амбассадоры. Выполняйте квесты, проходите интерактивные викторины в Академии и копите XP, чтобы разблокировать премиум-награды, реферальные фичи и подняться в общем рейтинге лидеров.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-[#00D2FF] font-semibold cursor-pointer" onClick={() => setActiveTab('academy')}>
                  <span>Перейти в Академию</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Ecosystem Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <p className="text-[9px] text-[#A0AEC0] uppercase font-bold tracking-wider">Квесты</p>
                  <p className="text-sm font-bold mt-1 text-white">0 / 3</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <p className="text-[9px] text-[#A0AEC0] uppercase font-bold tracking-wider">Уроки</p>
                  <p className="text-sm font-bold mt-1 text-white">0 / 3</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <p className="text-[9px] text-[#A0AEC0] uppercase font-bold tracking-wider">Награды</p>
                  <p className="text-sm font-bold mt-1 text-white">100 $STON</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== TAB 2: ACADEMY ==================== */}
          {activeTab === 'academy' && (
            <motion.div
              key="academy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold">STON.fi Academy 🎓</h2>
                <p className="text-xs text-[#A0AEC0]">Учите основы DeFi и получайте XP за сдачу тестов.</p>
              </div>

              {selectedLesson ? (
                // --- Detailed Lesson view ---
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel rounded-2xl p-5 space-y-4 border-[#7A5CFF]/30"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-[#7A5CFF] uppercase bg-[#7A5CFF]/10 px-2.5 py-1 rounded-full border border-[#7A5CFF]/20">
                      {selectedLesson.category}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedLesson(null);
                        setQuizAnswer(null);
                        setQuizResult(null);
                      }}
                      className="text-xs text-[#A0AEC0] hover:text-white"
                    >
                      Назад к урокам
                    </button>
                  </div>

                  <h3 className="text-base font-bold">{selectedLesson.title}</h3>
                  <div className="text-xs text-[#A0AEC0] space-y-3 leading-relaxed">
                    <p>{selectedLesson.description}</p>
                    <p className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <strong>Как это работает:</strong> Децентрализованные биржи работают на смарт-контрактах без посредников. STON.fi обеспечивает мгновенный обмен токенов с низким проскальзыванием благодаря ликвидности, предоставляемой пользователями. За это пользователи получают процент от сделок в пуле.
                    </p>
                  </div>

                  {/* Interactive Quiz */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <HelpCircle className="w-4 h-4 text-[#7A5CFF]" />
                      <span>Пройдите тест для получения +{selectedLesson.xpReward} XP:</span>
                    </div>
                    
                    <p className="text-xs text-white font-medium bg-white/5 p-3 rounded-xl border border-white/5">
                      {selectedLesson.quiz.question}
                    </p>

                    <div className="space-y-2">
                      {selectedLesson.quiz.options.map((opt, idx) => (
                        <button
                          key={idx}
                          disabled={quizResult === 'correct'}
                          onClick={() => handleLessonQuizSubmit(idx)}
                          className={`w-full text-left text-xs p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                            quizAnswer === idx
                              ? quizResult === 'correct'
                                ? 'bg-[#00FFA3]/10 border-[#00FFA3] text-[#00FFA3]'
                                : 'bg-rose-500/10 border-rose-500 text-rose-500'
                              : 'bg-[#0B1120] border-white/5 text-white hover:border-[#7A5CFF]/30'
                          }`}
                        >
                          <span>{opt}</span>
                          {quizAnswer === idx && (
                            quizResult === 'correct' 
                              ? <CheckCircle2 className="w-4 h-4 text-[#00FFA3]" /> 
                              : <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </button>
                      ))}
                    </div>

                    {quizResult === 'correct' && (
                      <div className="bg-[#00FFA3]/10 border border-[#00FFA3]/30 p-3 rounded-xl flex items-center gap-2 text-xs text-[#00FFA3]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Вы ответили верно! Тест пройден.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                // --- Lessons list ---
                <div className="space-y-3">
                  {lessons.map(lesson => {
                    const isCompleted = completedLessonIds.includes(lesson.id);
                    return (
                      <div 
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className="glass-panel-interactive rounded-xl p-4 flex flex-col justify-between cursor-pointer relative overflow-hidden"
                      >
                        {isCompleted && (
                          <div className="absolute top-0 right-0 bg-[#00FFA3] text-black text-[9px] font-bold uppercase py-1 px-3.5 rounded-bl-xl shadow-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </div>
                        )}

                        <div className="space-y-1 pr-14">
                          <span className="text-[9px] font-bold text-[#00D2FF] uppercase tracking-wider">
                            {lesson.category}
                          </span>
                          <h3 className="font-bold text-sm text-white mt-1">{lesson.title}</h3>
                          <p className="text-xs text-[#A0AEC0] line-clamp-2 mt-1 leading-relaxed">
                            {lesson.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3 text-[10px] text-[#A0AEC0]">
                          <div className="flex items-center gap-3">
                            <span>⏱ {lesson.readTime}</span>
                            <span className="text-[#00FFA3] font-semibold">⚡ +{lesson.xpReward} XP</span>
                          </div>
                          <span className="text-[#00D2FF] font-semibold flex items-center gap-0.5">
                            Изучить <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ==================== TAB 3: MISSIONS ==================== */}
          {activeTab === 'missions' && (
            <motion.div
              key="missions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold">Missions Hub 🎯</h2>
                <p className="text-xs text-[#A0AEC0]">Выполняйте квесты и доказывайте свой вклад в STON.fi.</p>
              </div>

              <div className="space-y-3">
                {missions.map(mission => (
                  <div 
                    key={mission.id}
                    className={`glass-panel rounded-xl p-4 border transition-all duration-300 relative ${
                      mission.status === 'completed' 
                        ? 'border-[#00FFA3]/20 bg-[#00FFA3]/5' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            mission.type === 'web3' 
                              ? 'bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/20'
                              : 'bg-[#7A5CFF]/10 text-[#7A5CFF] border-[#7A5CFF]/20'
                          }`}>
                            {mission.type}
                          </span>
                          <span className="text-xs font-semibold text-[#00FFA3]">⚡ +{mission.xpReward} XP</span>
                        </div>
                        <h3 className="font-bold text-sm text-white mt-1">{mission.title}</h3>
                        <p className="text-xs text-[#A0AEC0] leading-relaxed mt-1">{mission.description}</p>
                      </div>

                      {/* Action buttons based on status */}
                      <div className="shrink-0 pt-1">
                        {mission.status === 'completed' ? (
                          <div className="bg-[#00FFA3]/10 text-[#00FFA3] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#00FFA3]/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Выполнено
                          </div>
                        ) : mission.status === 'pending' ? (
                          <div className="bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#00D2FF]/20 animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Проверка
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (mission.id === 'm-2') {
                                setActiveTab('swap');
                              } else {
                                handleMissionComplete(mission.id, mission.link);
                              }
                            }}
                            className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#050816] text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
                          >
                            Выполнить
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Referral Widget */}
              <div className="p-4 rounded-xl bg-gradient-to-tr from-[#7A5CFF]/20 to-[#0B1120] border border-[#7A5CFF]/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#7A5CFF]/20 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#7A5CFF]" />
                  <h3 className="font-bold text-sm">Реферальная программа</h3>
                </div>
                <p className="text-xs text-[#A0AEC0] leading-relaxed">
                  Приглашайте других крипто-энтузиастов и получайте 15% от их накопленного XP! Ваш реферальный код генерируется автоматически.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="text" 
                    readOnly 
                    value="https://t.me/ston_vibe_studio_bot/app?startapp=ref_350" 
                    className="flex-1 bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-[#A0AEC0] select-all cursor-pointer font-mono outline-none" 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("https://t.me/ston_vibe_studio_bot/app?startapp=ref_350");
                      showNotificationMessage("Ссылка скопирована! 📋");
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white text-[10px] px-3 py-1.5 rounded-lg font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== TAB 4: SWAP (VIBE SWAP) ==================== */}
          {activeTab === 'swap' && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold">Vibe Swap 🔄</h2>
                <p className="text-xs text-[#A0AEC0]">Обменивайте токены мгновенно в сети TON через протокол STON.fi.</p>
              </div>

              {/* Swap Box */}
              <div className="glass-panel rounded-2xl p-4 space-y-3 relative">
                
                {/* Swap Input From */}
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 relative">
                  <div className="flex justify-between items-center text-xs text-[#A0AEC0] mb-2">
                    <span>Вы отправляете:</span>
                    <span>Баланс: {swapToken === 'TON' ? '12.45' : '150.0'} {swapToken}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <input 
                      type="number"
                      placeholder="0.0"
                      value={swapFromAmount}
                      onChange={(e) => handleSwapAmountChange(e.target.value)}
                      className="bg-transparent text-white font-bold text-xl outline-none w-1/2"
                    />
                    <button 
                      onClick={() => {
                        setSwapToken(prev => prev === 'TON' ? 'STON' : 'TON');
                        setSwapFromAmount('');
                        setSwapToAmount('');
                      }}
                      className="bg-[#050816] hover:bg-[#121A2F] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#00D2FF] to-[#7A5CFF] block" />
                      {swapToken}
                    </button>
                  </div>
                </div>

                {/* Swap Arrow middle */}
                <div className="flex justify-center -my-6 relative z-10">
                  <button 
                    onClick={() => {
                      setSwapToken(prev => prev === 'TON' ? 'STON' : 'TON');
                      setSwapFromAmount('');
                      setSwapToAmount('');
                    }}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D2FF] to-[#7A5CFF] p-0.5 shadow-lg shadow-[#00D2FF]/20 active:rotate-180 transition-all duration-300"
                  >
                    <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center">
                      <ArrowLeftRight className="w-4 h-4 text-[#00D2FF]" />
                    </div>
                  </button>
                </div>

                {/* Swap Input To */}
                <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 relative mt-1">
                  <div className="flex justify-between items-center text-xs text-[#A0AEC0] mb-2">
                    <span>Вы получаете:</span>
                    <span>Баланс: {swapToken === 'TON' ? '150.0' : '12.45'} {swapToken === 'TON' ? 'STON' : 'TON'}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <input 
                      type="number" 
                      placeholder="0.0"
                      readOnly
                      value={swapToAmount}
                      className="bg-transparent text-white/70 font-bold text-xl outline-none w-1/2"
                    />
                    <button 
                      className="bg-[#050816] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#7A5CFF] to-[#00FFA3] block" />
                      {swapToken === 'TON' ? 'STON' : 'TON'}
                    </button>
                  </div>
                </div>

                {/* Swap details */}
                <div className="pt-2 px-1 text-xs text-[#A0AEC0] space-y-1 bg-white/5 p-3 rounded-xl border border-white/5 mt-2">
                  <div className="flex justify-between">
                    <span>Курс обмена:</span>
                    <span className="text-white font-semibold">1 TON = 1.58 STON</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Мин. получено:</span>
                    <span className="text-white font-semibold">{(Number(swapToAmount) * 0.99).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Вайб-Бонус:</span>
                    <span className="text-[#00FFA3] font-semibold">+60 XP за сделку ⚡</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={executeSwap}
                  disabled={isSwapping}
                  className="w-full mt-3 bg-gradient-to-r from-[#00D2FF] to-[#00FFA3] text-[#050816] font-bold p-3.5 rounded-xl shadow-lg shadow-[#00D2FF]/20 flex items-center justify-center gap-2 hover:shadow-[#00D2FF]/40 active:scale-[0.99] transition-all duration-300 disabled:opacity-75"
                >
                  {isSwapping ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Выполняется своп через STON.fi...</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-5 h-5" />
                      <span>{walletAddress ? 'Обменять токены' : 'Подключить кошелек в шапке'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Yield Pool Info */}
              <div className="glass-panel rounded-xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#00FFA3]" />
                  <h3 className="font-bold text-sm">Стейкинг & Пулы ликвидности</h3>
                </div>
                <p className="text-xs text-[#A0AEC0] leading-relaxed">
                  Поставляйте ликвидность в пул TON / STON под <span className="text-[#00FFA3] font-bold">78.5% APY</span> и зарабатывайте пассивный доход! ИнтеграцияYield пулов будет запущена в следующей фазе.
                </p>
                <div className="flex items-center justify-between text-xs text-[#00FFA3] font-semibold border-t border-white/5 pt-3">
                  <span>Общая заблокированная стоимость (TVL):</span>
                  <span>$12,458,732 📈</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== TAB 5: LEADERBOARD ==================== */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold">Лидеры Вайба 🏆</h2>
                <p className="text-xs text-[#A0AEC0]">Лучшие амбассадоры экосистемы по очкам опыта.</p>
              </div>

              {/* Top 3 podium */}
              <div className="grid grid-cols-3 gap-2 pb-2">
                
                {/* 2nd Place */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center mt-4">
                  <div className="w-10 h-10 rounded-full bg-slate-400/20 flex items-center justify-center border border-slate-400 mb-1 text-sm font-bold">2</div>
                  <span className="text-[10px] font-bold truncate max-w-full text-white">DeFi_Expert</span>
                  <span className="text-[11px] text-[#00D2FF] font-bold mt-1">2,450 XP</span>
                </div>

                {/* 1st Place */}
                <div className="bg-gradient-to-b from-[#7A5CFF]/10 to-[#0B1120] border border-[#7A5CFF]/30 rounded-xl p-4 flex flex-col items-center justify-center text-center relative -translate-y-2 shadow-xl shadow-[#7A5CFF]/5">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
                  <div className="w-12 h-12 rounded-full bg-[#7A5CFF]/20 flex items-center justify-center border-2 border-[#7A5CFF] mb-1 text-base font-bold text-white shadow-lg">1</div>
                  <span className="text-[11px] font-bold truncate max-w-full text-white">StonFi_King</span>
                  <span className="text-xs text-[#00FFA3] font-bold mt-1">2,840 XP</span>
                </div>

                {/* 3rd Place */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center mt-6">
                  <div className="w-8 h-8 rounded-full bg-amber-700/20 flex items-center justify-center border border-amber-700 mb-1 text-xs font-bold">3</div>
                  <span className="text-[10px] font-bold truncate max-w-full text-white">VibeFinder</span>
                  <span className="text-[11px] text-[#00D2FF] font-bold mt-1">2,190 XP</span>
                </div>

              </div>

              {/* Full list table */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-3 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-[#A0AEC0] flex justify-between">
                  <span>Амбассадор</span>
                  <span>Ранг & XP</span>
                </div>
                
                <div className="divide-y divide-white/5">
                  {leaders.map(leader => (
                    <div 
                      key={leader.rank}
                      className={`p-3.5 flex justify-between items-center text-xs transition-all duration-150 ${
                        leader.isCurrentUser ? 'bg-[#00D2FF]/5 font-semibold' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 text-center font-bold ${
                          leader.rank === 1 ? 'text-amber-400' : leader.rank === 2 ? 'text-slate-300' : leader.rank === 3 ? 'text-amber-600' : 'text-[#A0AEC0]'
                        }`}>
                          #{leader.rank}
                        </span>
                        <div>
                          <p className="text-white font-medium">{leader.name}</p>
                          <p className="text-[9px] text-[#A0AEC0]">{leader.badge}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[#00D2FF] font-bold">{leader.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* === BOTTOM PREMIUM DOCKED NAVIGATION === */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#050816]/90 backdrop-blur-lg border-t border-white/5 px-2 py-3 flex justify-around">
        
        {/* Profile Tab */}
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
            activeTab === 'profile' ? 'text-[#00D2FF]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-5.5 h-5.5" />
          <span className="text-[10px] font-semibold">Профиль</span>
          {activeTab === 'profile' && (
            <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#00D2FF] rounded-t-full shadow-lg shadow-[#00D2FF]/50" />
          )}
        </button>

        {/* Academy Tab */}
        <button 
          onClick={() => setActiveTab('academy')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
            activeTab === 'academy' ? 'text-[#7A5CFF]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5.5 h-5.5" />
          <span className="text-[10px] font-semibold">Академия</span>
          {activeTab === 'academy' && (
            <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#7A5CFF] rounded-t-full shadow-lg shadow-[#7A5CFF]/50" />
          )}
        </button>

        {/* Swap Tab */}
        <button 
          onClick={() => setActiveTab('swap')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
            activeTab === 'swap' ? 'text-[#00FFA3]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowLeftRight className="w-5.5 h-5.5" />
          <span className="text-[10px] font-semibold">Своп</span>
          {activeTab === 'swap' && (
            <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#00FFA3] rounded-t-full shadow-lg shadow-[#00FFA3]/50" />
          )}
        </button>

        {/* Missions Tab */}
        <button 
          onClick={() => setActiveTab('missions')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
            activeTab === 'missions' ? 'text-[#00D2FF]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Target className="w-5.5 h-5.5" />
          <span className="text-[10px] font-semibold">Миссии</span>
          {activeTab === 'missions' && (
            <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#00D2FF] rounded-t-full shadow-lg shadow-[#00D2FF]/50" />
          )}
        </button>

        {/* Leaderboard Tab */}
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
            activeTab === 'leaderboard' ? 'text-[#00D2FF]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5.5 h-5.5" />
          <span className="text-[10px] font-semibold">Лидеры</span>
          {activeTab === 'leaderboard' && (
            <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#00D2FF] rounded-t-full shadow-lg shadow-[#00D2FF]/50" />
          )}
        </button>

      </nav>

    </div>
  );
}
