'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, Target, ArrowLeftRight, Trophy, 
  Sparkles, CheckCircle2, AlertCircle, 
  ChevronRight, Flame, Award, HelpCircle,
  TrendingUp, RefreshCw, Users, Play, Compass, Info
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

// === Particle sparks for desktop background ===
const SparkleParticles = () => {
  const [particles, setParticles] = useState<{ id: number; left: string; size: string; delay: string; duration: string; drift: string }[]>([]);
  useEffect(() => {
    const arr = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 6 + 6}s`,
      drift: `${(Math.random() - 0.5) * 80}px`
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="sparkle-particles">
      {particles.map(p => (
        <span
          key={p.id}
          className="sparkle-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--drift': p.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default function Home() {
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
  const [videoFilter, setVideoFilter] = useState<string>('Гайды');



  // === Swap States ===
  const [swapFromAmount, setSwapFromAmount] = useState<string>('');
  const [swapToAmount, setSwapToAmount] = useState<string>('');
  const [swapToken, setSwapToken] = useState<'TON' | 'STON'>('TON');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // === Mock Data ===
  const [lessons] = useState<Lesson[]>([
    {
      id: 'guide-stonbassadors-intro',
      title: 'Кто такой STONbassador и как им стать?',
      category: 'Гайды',
      description: 'Полное руководство по участию в амбассадорской программе STON.fi без сложных проверок и верификаций.',
      xpReward: 80,
      readTime: '3 мин',
      completed: false,
      duration: '3 мин',
      views: '12.4K просмотров',
      uploadedAt: 'Сегодня',
      imageUrl: 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black',
      content: [
        'STONbassadors — это официальные амбассадоры экосистемы STON.fi, которые помогают развивать бренд и сообщество. Это творческие люди, авторы контента, переводчики, инфлюенсеры и технические специалисты, разделяющие ценности децентрализации.',
        'Главная прелесть программы — отсутствие сложного отбора. Вам не нужно ждать одобрения заявки или проходить жесткую верификацию личности (KYC). Вы можете начать в любой момент!',
        'Чтобы присоединиться, достаточно выполнять полезные задания: создавать качественный контент (статьи, видео, инфографику), помогать новичкам в чатах сообщества или организовывать локальные мероприятия. В конце месяца вы отправляете отчет о проделанной работе через специальную форму.'
      ],
      quiz: {
        question: 'Нужно ли проходить сложную верификацию или заполнять заявку, чтобы стать STONbassador?',
        options: [
          'Да, требуется верификация личности (KYC) и одобрение анкеты',
          'Нет, можно сразу начать выполнять задания и отправлять отчеты',
          'Да, нужен специальный инвайт-код от администрации'
        ],
        answerIndex: 1
      }
    },
    {
      id: 'guide-stonbassadors-rewards',
      title: 'Система наград и правила отправки отчетов',
      category: 'Гайды',
      description: 'Как распределяется ежемесячный пул наград до 10,000 STON и как правильно отправлять свои работы на проверку.',
      xpReward: 90,
      readTime: '4 мин',
      completed: false,
      duration: '4 мин',
      views: '9.8K просмотров',
      uploadedAt: 'Вчера',
      imageUrl: 'bg-gradient-to-br from-zinc-900 via-stone-900 to-orange-950/20',
      content: [
        'Каждый месяц команда STON.fi выделяет крупный призовой пул — до 10,000 токенов STON — для вознаграждения лучших участников программы STONbassadors.',
        'Награды распределяются на основе качества, охвата аудитории и разнообразия вашего вклада. Все отправленные работы оцениваются модераторами вручную по нескольким критериям.',
        'Чтобы получить награду, необходимо в конце каждого месяца заполнить специальную форму отправки отчета в Telegram-боте. Убедитесь, что все ваши ссылки активны, а работы оформлены аккуратно. Плагиат и накрутка просмотров строго запрещены и ведут к дисквалификации.'
      ],
      quiz: {
        question: 'Какой максимальный ежемесячный пул наград выделяется для лучших STONbassadors?',
        options: [
          '1,000 STON',
          '5,000 STON',
          '10,000 STON'
        ],
        answerIndex: 2
      }
    },
    {
      id: 'guide-stonbassadors-content',
      title: 'Создание контента: Советы и лучшие практики',
      category: 'Гайды',
      description: 'Как создавать вовлекающий, качественный контент о STON.fi, который получит максимальные оценки от команды.',
      xpReward: 100,
      readTime: '5 мин',
      completed: false,
      duration: '5 мин',
      views: '7.5K просмотров',
      uploadedAt: '2 дня назад',
      imageUrl: 'bg-gradient-to-br from-neutral-900 via-orange-900/10 to-stone-950',
      content: [
        'Качественный контент — залог высокой оценки вашей работы. Команда STON.fi ценит уникальные материалы, которые действительно помогают пользователям разобраться в продукте.',
        'При написании статей или гайдов используйте понятную структуру: четкое введение, разделы с подзаголовками, пошаговые инструкции и качественные скриншоты. Если вы описываете сложные DeFi-механики, добавьте наглядные примеры.',
        'Продвигайте свои материалы на популярных платформах (Teletype, Medium, X, Telegram). Высокий органический охват и активные комментарии читателей существенно увеличат ваши шансы на получение повышенной награды.'
      ],
      quiz: {
        question: 'Что из перечисленного является важным при создании качественного гайда по мнению команды STON.fi?',
        options: [
          'Использование сложных терминов без объяснений',
          'Понятная структура, качественные скриншоты и пошаговые инструкции',
          'Простое копирование чужих материалов с других сайтов'
        ],
        answerIndex: 1
      }
    },
    {
      id: 'guide-stonbassadors-referrals',
      title: 'Реферальная программа для амбассадоров',
      category: 'Гайды',
      description: 'Узнайте, как приглашать друзей в программу и получать 10% от их наград в течение 6 месяцев.',
      xpReward: 70,
      readTime: '3 мин',
      completed: false,
      duration: '3 мин',
      views: '5.2K просмотров',
      uploadedAt: '3 дня назад',
      imageUrl: 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black',
      content: [
        'Программа STONbassadors включает в себя выгодную реферальную систему, которая позволяет получать пассивный доход за приглашение новых амбассадоров.',
        'Вы можете поделиться своей уникальной реферальной ссылкой с друзьями. Если приглашенный пользователь регистрируется в программе и начинает зарабатывать награды, вы будете получать бонус в размере 10% от его ежемесячных начислений.',
        'Этот реферальный бонус выплачивается из специального фонда команды STON.fi в течение 6 месяцев с момента регистрации реферала. При этом награда самого реферала никак не уменьшается.'
      ],
      quiz: {
        question: 'Какой процент от наград ваших рефералов вы будете получать в течение 6 месяцев?',
        options: [
          '5%',
          '10%',
          '15%'
        ],
        answerIndex: 1
      }
    },
    {
      id: 'lesson-1',
      title: 'Что такое STON.fi? Полный гайд для новичков',
      category: 'Академия',
      description: 'Узнайте о ведущем децентрализованном маркетмейкере (AMM DEX) на блокчейне TON, его преимуществах и возможностях.',
      xpReward: 75,
      readTime: '3 мин',
      completed: false,
      duration: '3 мин',
      views: '8.4K просмотров',
      uploadedAt: '2 дня назад',
      imageUrl: 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-black',
      content: [
        'STON.fi — это ведущий децентрализованный автоматический маркетмейкер (AMM DEX) на блокчейне TON, предлагающий пользователям сверхнизкие комиссии, минимальное проскальзывание и удобный интерфейс.',
        'В отличие от традиционных централизованных бирж, на STON.fi вам не нужно проходить регистрацию или доверять свои средства третьим лицам. Все обмены происходят напрямую между кошельками пользователей через безопасные смарт-контракты.',
        'Благодаря архитектуре блокчейна TON, транзакции на STON.fi проходят практически мгновенно, делая торговлю криптовалютой доступной и быстрой для каждого.'
      ],
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
      title: 'Как фармить STON на пулах ликвидности',
      category: 'Гайды',
      description: 'Поймите, как работают пулы ликвидности, как вносить средства и получать комиссионные с каждой сделки в экосистеме.',
      xpReward: 100,
      readTime: '5 мин',
      completed: false,
      duration: '5 мин',
      views: '6.1K просмотров',
      uploadedAt: '4 дня назад',
      imageUrl: 'bg-gradient-to-br from-zinc-900 via-stone-900 to-orange-950/20',
      content: [
        'Фарминг и предоставление ликвидности — один из самых популярных способов пассивного заработка в децентрализованных финансах (DeFi) на платформе STON.fi.',
        'Когда вы вносите пару токенов (например, TON и STON) в пул ликвидности, вы получаете LP-токены, подтверждающие вашу долю в пуле. Провайдеры ликвидности получают часть торговых комиссий с каждого обмена в этой паре.',
        'Дополнительно вы можете отправлять свои LP-токены в стейкинг в разделе фарминга, чтобы зарабатывать бонусные токены управления STON с высокой процентной ставкой APY.'
      ],
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
      title: 'Управление и стейкинг токена $STON',
      category: 'Академия',
      description: 'Роль нативного токена управления $STON, протоколы стейкинга и как участвовать в голосованиях за будущее платформы.',
      xpReward: 120,
      readTime: '4 мин',
      completed: false,
      duration: '4 мин',
      views: '3.2K просмотров',
      uploadedAt: '1 неделю назад',
      imageUrl: 'bg-gradient-to-br from-neutral-900 via-orange-900/10 to-stone-950',
      content: [
        'Токен $STON является ключевым элементом управления и стимуляции всей экосистемы децентрализованной биржи STON.fi.',
        'Стейкинг токенов STON позволяет пользователям блокировать свои средства на определенный период в обмен на получение специальных токенов AR-STON. Эти токены дают право участвовать в голосованиях за ключевые изменения платформы.',
        'Кроме того, стейкеры получают долю от доходов протокола, что делает долгосрочное удержание токена STON еще более выгодным и стратегически важным для участников.'
      ],
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
      title: 'Подключи кошелек',
      description: 'Подключите ваш TON кошелек (Tonkeeper, MyTonWallet и др.) к нашей системе.',
      xpReward: 50,
      type: 'web3',
      status: 'available',
      link: '#connect'
    },
    {
      id: 'm-2',
      title: 'Подпишись на STON.fi в X',
      description: 'Присоединяйтесь к официальному каналу X (Twitter) экосистемы STON.fi.',
      xpReward: 25,
      type: 'social',
      status: 'available',
      link: 'https://x.com/ston_fi'
    },
    {
      id: 'm-3',
      title: 'Пройди урок в Академии',
      description: 'Изучите любой гайд в разделе «Академия» и решите тест без ошибок.',
      xpReward: 75,
      type: 'daily',
      status: 'available',
      link: '#videos'
    },
    {
      id: 'm-4',
      title: 'Свопни любой токен',
      description: 'Совершите быстрый обмен TON/STON внутри нашего Mini App.',
      xpReward: 100,
      type: 'web3',
      status: 'available',
      link: '#swap'
    },
    {
      id: 'm-5',
      title: 'Пригласи 3 друзей',
      description: 'Поделитесь своей реферальной ссылкой и приведите 3 активных амбассадоров.',
      xpReward: 200,
      type: 'social',
      status: 'available',
      link: 'https://t.me/share/url?url=https://t.me/ston_vibe_studio_bot/app'
    }
  ]);

  const [leaders, setLeaders] = useState<Leader[]>([
    { rank: 1, name: 'tonlegend 👑', xp: 5420, badge: 'Diamond Vibe' },
    { rank: 2, name: 'cryptoboss', xp: 2890, badge: 'Diamond Vibe' },
    { rank: 3, name: 'stonmaster', xp: 2450, badge: 'Platinum Vibe' },
    { rank: 4, name: 'stonplayer', xp: 1980, badge: 'Platinum Vibe' },
    { rank: 5, name: 'stonlover', xp: 1760, badge: 'Gold Vibe' },
    { rank: 6, name: 'stonaddict', xp: 1230, badge: 'Gold Vibe' },
    { rank: 7, name: 'Твой рейтинг (Вы)', xp: 4250, badge: 'Gold Vibe', isCurrentUser: true }
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
    showNotificationMessage('Бонус собран! Получено +25 XP ⚡');
    
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
    showNotificationMessage('Задание отправлено на проверку! ⏳');

    setTimeout(() => {
      setMissions(prev => 
        prev.map(m => m.id === missionId ? { ...m, status: 'completed' } : m)
      );
      setUserXp(prev => prev + mission.xpReward);
      showNotificationMessage(`Задание проверено! Получено +${mission.xpReward} XP 🎉`);
    }, 3500);
  };

  const handleSwapAmountChange = (val: string) => {
    setSwapFromAmount(val);
    if (!val || isNaN(Number(val))) {
      setSwapToAmount('');
      return;
    }
    const amount = Number(val);
    if (swapToken === 'TON') {
      setSwapToAmount((amount * 1.58).toFixed(3));
    } else {
      setSwapToAmount((amount / 1.58).toFixed(3));
    }
  };

  const executeSwap = () => {
    if (!walletAddress) {
      showNotificationMessage('Пожалуйста, подключите TON кошелек! 🔌');
      return;
    }
    if (!swapFromAmount || Number(swapFromAmount) <= 0) {
      showNotificationMessage('Введите сумму для обмена! ⚠️');
      return;
    }

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setUserXp(prev => prev + 100);
      showNotificationMessage(`Обмен выполнен! Получено +100 XP 🚀`);
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
  const filteredLessons = videoFilter === 'Гайды' ? lessons : [];


  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-x-hidden">
      
      {/* ========================================== */}
      {/* === DESKTOP WRAPPER (Responsive Frame) === */}
      {/* ========================================== */}
      
      {/* Sparks particles for desktop only background */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none z-0">
        <SparkleParticles />
      </div>

      <div className="hidden sm:flex flex-col min-h-screen relative z-10 w-full max-w-6xl mx-auto px-6 py-4 justify-between">
        
        {/* Desktop Header */}
        <header className="flex justify-between items-center pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="STON Hub Logo" className="w-14 h-14 rounded-full object-cover border border-[#FF9900]/25 orange-glow" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tighter text-white">STON</span>
                <span className="ph-badge text-lg">Hub</span>
              </div>
              <span className="text-[10px] tracking-widest text-[#FF9900] font-extrabold uppercase mt-0.5 block">STON IS LOVE. STON IS LIFE.</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-8 text-sm font-bold text-neutral-300">
              <button onClick={() => { setActiveTab('videos'); setShowLeaderboard(false); }} className="hover:text-[#FF9900] transition flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#FF9900]" /> LEARN (Академия)
              </button>
              <button onClick={() => { setActiveTab('missions'); setShowLeaderboard(false); }} className="hover:text-[#FF9900] transition flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#FF9900]" /> EARN (Миссии)
              </button>
              <button onClick={() => { setShowSwapModal(true); }} className="hover:text-[#FF9900] transition flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-[#FF9900]" /> TRADE (Своп)
              </button>
              <button onClick={() => { setActiveTab('profile'); setShowLeaderboard(true); }} className="hover:text-[#FF9900] transition flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FF9900]" /> GROW (Рейтинг)
              </button>
            </nav>

            {/* Desktop Connect Wallet Button */}
            {walletAddress ? (
              <button 
                onClick={() => tonConnectUI.disconnect()}
                className="bg-neutral-900 hover:bg-neutral-850 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-black text-emerald-400 flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
              </button>
            ) : (
              <button 
                onClick={() => tonConnectUI.openModal()}
                className="bg-gradient-to-tr from-[#FF9900] to-[#FF5500] hover:from-[#FF5500] hover:to-[#FF9900] text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-[#FF9900]/10 hover:shadow-[#FF9900]/25 transition active:scale-95"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Desktop Body Main Content (Flanked by decorations and showing mobile frame) */}
        <div className="flex-1 my-8 grid grid-cols-12 gap-8 items-center">
          
          {/* Left info column */}
          <div className="col-span-4 space-y-6 text-left hidden lg:block">
            <div className="space-y-2">
              <div className="bg-[#FF9900]/10 border border-[#FF9900]/25 text-[#FF9900] text-[10px] font-black tracking-widest uppercase py-1 px-3.5 rounded-full inline-block">
                ⚡ AMBASSADOR OS
              </div>
              <h2 className="text-3xl font-black leading-tight text-white">Разгони свой вайб в экосистеме STON.fi</h2>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Выполняйте квесты, смотрите обучающие видеоролики в стиле любимого «Хаба» и проходите викторины, чтобы подниматься в рейтинге лидеров и зарабатывать ценный амбассадорский опыт.
            </p>
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-[#FF9900] flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Быстрая статистика
              </h4>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Нативный токен управления: <strong className="text-white">$STON</strong></li>
                <li>• Текущая цена: <strong className="text-[#FF9900]">${stonPrice}</strong></li>
                <li>• Ликвидность и Стейкинг до <strong className="text-emerald-400">78.5% APY</strong></li>
              </ul>
            </div>
          </div>

          {/* Center Column: Realistic Smartphone Simulator Frame */}
          <div className="col-span-12 lg:col-span-4 flex justify-center items-center">
            <div className="w-[380px] h-[780px] rounded-[48px] border-[10px] border-neutral-800 bg-black relative shadow-[0_20px_50px_rgba(255,153,0,0.1)] flex flex-col overflow-hidden">
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

          {/* Right Column: Mini FAQ list */}
          <div className="col-span-4 space-y-5 text-left hidden lg:block">
            <h3 className="text-lg font-black text-white border-l-2 border-[#FF9900] pl-3">Часто задаваемые вопросы</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white">Как получить опыт XP?</h5>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Смотрите обучающие материалы на вкладке «Видео», отвечайте правильно на тесты под ними и выполняйте миссии в хабе.
                </p>
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white">Зачем нужен TON кошелек?</h5>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Подключение кошелька позволяет выполнять Web3-миссии, производить свапы на STON.fi и получать начисления напрямую.
                </p>
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white">Как работают медали достижений?</h5>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Медали выдаются автоматически при достижении определенных порогов XP и успешном завершении ежедневных квестов.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Desktop Footer Banner */}
        <footer className="p-5 bg-neutral-950 border border-white/5 rounded-2xl flex items-center justify-between text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF9900]/5 to-transparent rounded-full blur-2xl" />
          <div className="flex items-center gap-4 relative z-10">
            <img src="/logo.png" alt="STON Hub Logo" className="w-12 h-12 rounded-xl object-cover border border-[#FF9900]/30" />
            <div>
              <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>STONHub</span>
                <span className="text-neutral-500 font-normal">—</span>
                <span className="text-neutral-400 text-xs font-medium">твой хаб в экосистеме STON.fi</span>
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-lg leading-snug">
                Децентрализованный доступ к торговле, ликвидности и обучению. Прокачивай уровень своего профиля и зарабатывай вместе с TON.
              </p>
            </div>
          </div>
          <div className="flex gap-6 relative z-10 text-[10px] uppercase font-bold text-neutral-400">
            <div className="space-y-1">
              <span className="text-[#FF9900]">🎓 АКАДЕМИЯ</span>
              <p className="text-[9px] font-normal text-neutral-500 lowercase">уроки, гайды и контент</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#FF9900]">🎯 МИССИИ</span>
              <p className="text-[9px] font-normal text-neutral-500 lowercase">задания каждый день</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#FF9900]">🔄 СТЕЙКИНГ</span>
              <p className="text-[9px] font-normal text-neutral-500 lowercase">заставляй STON работать</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#FF9900]">👥 РЕФЕРАЛЫ</span>
              <p className="text-[9px] font-normal text-neutral-500 lowercase">зарабатывай вместе</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#FF9900]">🏆 НАГРАДЫ</span>
              <p className="text-[9px] font-normal text-neutral-500 lowercase">эксклюзивные уровни</p>
            </div>
          </div>
        </footer>

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
              className="w-full max-w-sm glass-panel rounded-2xl p-5 border-[#FF9900]/30 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-5 h-5 text-[#FF9900]" />
                  <span className="font-black text-sm uppercase tracking-wider text-white">Vibe Swap 🔄</span>
                </div>
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="text-xs text-neutral-500 hover:text-white"
                >
                  Закрыть
                </button>
              </div>

              {/* Swap Input From */}
              <div className="bg-neutral-900/60 p-4 rounded-xl border border-white/5 relative">
                <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-2 font-medium">
                  <span>Вы отправляете:</span>
                  <span>Баланс: {swapToken === 'TON' ? '12.45' : '150.0'} {swapToken}</span>
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
                    onClick={() => {
                      setSwapToken(prev => prev === 'TON' ? 'STON' : 'TON');
                      setSwapFromAmount('');
                      setSwapToAmount('');
                    }}
                    className="bg-black hover:bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 text-[#FF9900]"
                  >
                    <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FF9900] to-[#FF5500] block" />
                    {swapToken}
                  </button>
                </div>
              </div>

              {/* Swap Swap direction arrow */}
              <div className="flex justify-center -my-6 relative z-10">
                <button 
                  onClick={() => {
                    setSwapToken(prev => prev === 'TON' ? 'STON' : 'TON');
                    setSwapFromAmount('');
                    setSwapToAmount('');
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
                  <span>Вы получаете:</span>
                  <span>Баланс: {swapToken === 'TON' ? '150.0' : '12.45'} {swapToken === 'TON' ? 'STON' : 'TON'}</span>
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
                    className="bg-black border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 text-white"
                  >
                    <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FF5500] to-white block" />
                    {swapToken === 'TON' ? 'STON' : 'TON'}
                  </button>
                </div>
              </div>

              {/* Swap details info card */}
              <div className="p-3 text-[11px] text-neutral-400 space-y-1 bg-black/40 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span>Курс обмена:</span>
                  <span className="text-white font-semibold">1 TON = 1.58 STON</span>
                </div>
                <div className="flex justify-between">
                  <span>Вайб-Бонус за сделку:</span>
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
                    <span>Выполняется обмен на STON.fi...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{walletAddress ? 'Обменять токены' : 'Сначала подключите кошелек'}</span>
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

          <div className="scale-[0.9] origin-right">
            {walletAddress ? (
              <button 
                onClick={() => tonConnectUI.disconnect()}
                className="bg-neutral-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black text-emerald-400 flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
              </button>
            ) : (
              <button 
                onClick={() => tonConnectUI.openModal()}
                className="bg-gradient-to-tr from-[#FF9900] to-[#FF5500] hover:from-[#FF5500] hover:to-[#FF9900] text-black px-3.5 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-[#FF9900]/10 hover:shadow-[#FF9900]/25 active:scale-95 transition whitespace-nowrap"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* === Live Price Bar === */}
        <div className="px-4 py-2 bg-neutral-950 border-b border-white/5 flex items-center justify-between text-[11px] font-sans">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-ping" />
            <span className="text-neutral-400 font-medium">Цена STON.fi:</span>
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
                            ? `Привет, ${tgUser.username ? `@${tgUser.username}` : tgUser.firstName}` 
                            : 'Привет, Амбассадор!'}
                        </h2>
                        <span className="bg-[#FF9900]/10 text-[#FF9900] text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase border border-[#FF9900]/20 shrink-0">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#FF9900]" />
                        Ранг: <span className="text-white font-semibold">{userRank}</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress bar to next rank */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-neutral-400 font-medium">Твой прогресс:</span>
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
                      <span className="italic font-medium">+{5000 - userXp} XP до ранга Diamond Vibe 💎</span>
                    </div>
                  </div>
                </div>

                {/* Balance $STON with dynamic drift chart */}
                <div className="glass-panel rounded-2xl p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full blur-2xl" />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Баланс $STON</span>
                      <h3 className="text-2xl font-black text-white flex items-center gap-1">
                        <span>1,250.75</span>
                        <span className="text-xs text-[#FF9900] font-black bg-[#FF9900]/10 py-0.5 px-2 rounded-full ml-1">STON</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 font-medium">~${(1250.75 * stonPrice).toLocaleString('en-US', {maximumFractionDigits: 2})}</span>
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-0.5 mt-0.5">
                        <TrendingUp className="w-3 h-3" /> +12.5% за 7д
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
                  <h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1 mb-2">Быстрые действия</h4>
                  <div className="grid grid-cols-4 gap-2.5">
                    <button 
                      onClick={() => setActiveTab('missions')}
                      className="p-3 bg-neutral-900 border border-white/5 rounded-xl hover:border-[#FF9900]/30 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Target className="w-5 h-5 text-[#FF9900]" />
                      <span className="text-[9px] font-bold text-white uppercase">Миссии</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('videos')}
                      className="p-3 bg-neutral-900 border border-white/5 rounded-xl hover:border-[#FF9900]/30 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95"
                    >
                      <BookOpen className="w-5 h-5 text-[#FF9900]" />
                      <span className="text-[9px] font-bold text-white uppercase">Академия</span>
                    </button>
                    <button 
                      onClick={() => setShowSwapModal(true)}
                      className="p-3 bg-neutral-900 border border-white/5 rounded-xl hover:border-[#FF9900]/30 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ArrowLeftRight className="w-5 h-5 text-[#FF9900]" />
                      <span className="text-[9px] font-bold text-white uppercase">Своп</span>
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
                      <span className="text-[9px] font-bold text-white uppercase">Бонусы</span>
                    </button>
                  </div>
                </div>

                {/* Welcome Info Box */}
                <div className="glass-panel rounded-xl p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF9900]" />
                    <h3 className="font-bold text-xs text-white">Добро пожаловать в STON Hub!</h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Это твой интерактивный путеводитель по блокчейну TON и экосистеме STON.fi. Смотри обучающие видео, сдавай тесты, выполняй квесты и докажи, что ты лучший амбассадор!
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs text-[#FF9900] font-bold cursor-pointer" onClick={() => setActiveTab('videos')}>
                    <span>Перейти к обучению</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Ecosystem Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-[#141416]/50 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] text-neutral-500 uppercase font-black">Выполнено квестов</p>
                    <p className="text-xs font-black mt-1 text-white">4 / 5</p>
                  </div>
                  <div className="p-3 bg-[#141416]/50 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] text-neutral-500 uppercase font-black">Пройдено уроков</p>
                    <p className="text-xs font-black mt-1 text-white">2 / 3</p>
                  </div>
                  <div className="p-3 bg-[#141416]/50 border border-white/5 rounded-xl text-center">
                    <p className="text-[8px] text-neutral-500 uppercase font-black">Сейвинг APY</p>
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
                        ← К списку гайдов
                      </button>
                    </div>

                    {/* Elegant Header Banner */}
                    <div className="w-full rounded-xl bg-gradient-to-br from-amber-950/20 via-neutral-900/80 to-black p-5 border border-white/5 relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF9900]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2 text-[10px] text-[#FF9900] font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Учебный материал</span>
                      </div>
                      <h2 className="text-sm font-black text-white leading-snug mb-3">
                        {selectedLesson.title}
                      </h2>
                      <div className="flex gap-4 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1 font-semibold">
                          <BookOpen className="w-3.5 h-3.5 text-[#FF9900]" />
                          Время чтения: {selectedLesson.readTime}
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
                        <span>Пройдите тест для получения +{selectedLesson.xpReward} XP:</span>
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
                          <span>Задание успешно выполнено! Награда начислена.</span>
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
                        <h2 className="text-base font-black text-white">Академия STONHub 🎓</h2>
                        <p className="text-[11px] text-neutral-400">Читай гайды, отвечай на тесты и прокачивайся</p>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold">
                        {videoFilter === 'Гайды' ? `Всего гайдов: ${filteredLessons.length}` : 'Скоро'}
                      </span>
                    </div>

                    {/* Horizontal Categories Scroll */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
                      {['Гайды', 'Видео'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setVideoFilter(cat)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border shrink-0 transition-all ${
                            videoFilter === cat
                              ? 'bg-[#FF9900] text-black border-[#FF9900] shadow-sm'
                              : 'bg-neutral-900 text-neutral-400 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {videoFilter === 'Видео' ? (
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
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Сдано
                                    </span>
                                  ) : (
                                    <>
                                      <span>Читать гайд</span>
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
                  <h2 className="text-base font-black text-white">Доступные квесты 🎯</h2>
                  <p className="text-[11px] text-neutral-400">Выполняйте задания каждый день и получайте амбассадорские награды</p>
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
                              <CheckCircle2 className="w-3 h-3" /> Выполнено
                            </div>
                          ) : mission.status === 'pending' ? (
                            <div className="bg-[#FF9900]/10 text-[#FF9900] text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#FF9900]/20 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Проверка
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (mission.id === 'm-1') {
                                  // Trigger wallet connect button (custom text alert helper)
                                  showNotificationMessage('Пожалуйста, кликните кнопку кошелька в шапке! 🔌');
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
                              Начать
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
                    <h3 className="font-bold text-xs text-white">Реферальная программа</h3>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-snug">
                    Приглашай друзей в STON Hub и получай <strong className="text-white">15%</strong> от их накопленного XP в экосистеме.
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
                        <h2 className="text-base font-black text-white flex items-center gap-1.5">
                          <Trophy className="w-5 h-5 text-[#FF9900]" /> Лидерборд
                        </h2>
                        <p className="text-[10px] text-neutral-400">Глобальный рейтинг амбассадоров</p>
                      </div>
                      <button 
                        onClick={() => setShowLeaderboard(false)}
                        className="text-xs text-[#FF9900] font-bold hover:underline"
                      >
                        ← Профиль
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
                        <span>Амбассадор</span>
                        <span>Очки XP</span>
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
                          <p className="text-xs font-black text-white">Твой рейтинг (Вы)</p>
                          <p className="text-[9px] text-neutral-400">{userRank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#FF9900] block">{userXp.toLocaleString()} XP</span>
                        <span className="text-[9px] font-bold text-neutral-500">В рейтинге: #4</span>
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
                          <span>Твой уровень</span>
                          <span className="text-[#FF9900] font-black">Lv. 12</span>
                        </h3>
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">ОФИЦИАЛЬНЫЙ АМБАССАДОР STON.fi</p>
                      </div>
                    </div>

                    {/* Stats box list */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-1">Статистика</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-neutral-500 uppercase font-black block">Миссии выполнено</span>
                          <span className="text-base font-black text-white mt-1 block">32</span>
                        </div>
                        <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-neutral-500 uppercase font-black block">Друзей приглашено</span>
                          <span className="text-base font-black text-white mt-1 block">18</span>
                        </div>
                        <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-neutral-500 uppercase font-black block">Общий заработок</span>
                          <span className="text-base font-black text-[#FF9900] mt-1 block">2,350 $STON</span>
                        </div>
                        <div 
                          onClick={() => setShowLeaderboard(true)}
                          className="p-3 bg-neutral-900 border border-white/10 hover:border-[#FF9900]/30 rounded-xl cursor-pointer transition active:scale-95"
                        >
                          <span className="text-[8px] text-[#FF9900] uppercase font-black flex items-center justify-between">
                            <span>В рейтинге</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-base font-black text-white mt-1 block">#4</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievements row */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pl-1 pr-1">
                        <h4 className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Достижения</h4>
                        <button onClick={() => showNotificationMessage("Ачивки обновляются автоматически!")} className="text-[9px] text-neutral-400 hover:text-white">Смотреть все</button>
                      </div>
                      
                      <div className="flex gap-2 justify-around bg-neutral-900/60 p-4 border border-white/5 rounded-xl">
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center text-sm shadow">🔥</div>
                          <span className="text-[8px] font-black text-neutral-400">Стрик 7д</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-slate-300/10 border border-slate-300 flex items-center justify-center text-sm shadow">💎</div>
                          <span className="text-[8px] font-black text-neutral-400">DeFi Гуру</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-amber-600/10 border border-amber-600 flex items-center justify-center text-sm shadow">👑</div>
                          <span className="text-[8px] font-black text-neutral-400">Топ Свапер</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group relative cursor-help">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm shadow opacity-40">⭐</div>
                          <span className="text-[8px] font-black text-neutral-500">Крипто-Царь</span>
                        </div>
                      </div>
                    </div>

                    {/* Disconnect button mockup */}
                    <div className="pt-2">
                      <button 
                        onClick={() => showNotificationMessage("Трансформация выполнена в стиле Pornhub! 🚀")}
                        className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-white/5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white active:scale-95 transition"
                      >
                        STONHub Ambassador OS v1.2
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
            <span className="text-[9px] font-black uppercase">Главная</span>
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
            <span className="text-[9px] font-black uppercase">Академия</span>
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
            <span className="text-[9px] font-black uppercase">Миссии</span>
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
            <span className="text-[9px] font-black uppercase">Профиль</span>
            {activeTab === 'profile' && (
              <motion.div layoutId="nav-glow" className="absolute -bottom-3 w-8 h-1 bg-[#FF9900] rounded-t-full shadow-lg shadow-[#FF9900]/50" />
            )}
          </button>

        </nav>

      </div>
    );
  }
}

