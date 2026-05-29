'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight as SwapIcon, 
  Send as SendIcon, 
  Wallet as WalletIcon, 
  ChevronDown, 
  Info, 
  Shield, 
  Check, 
  Zap, 
  Clock, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare,
  Languages, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Wrench,
  Search,
  MessageCircle
} from 'lucide-react';
import { TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import {
  useRfq,
  useOmniston,
  type AssetId,
  type QuoteRequest
} from '@ston-fi/omniston-sdk-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// === Dynamic Premium Token Logos with Local /tokens/ Priority ===
const TokenLogo = ({ symbol, className = "w-5 h-5 rounded-full shrink-0" }: { symbol: string; className?: string }) => {
  const [hasError, setHasError] = useState(false);
  const symbolUpper = symbol.toUpperCase();
  
  // Format to match public/tokens/*.png filenames
  let tokenKey = symbol.toLowerCase();
  if (symbolUpper === 'USD₮') tokenKey = 'usdt';
  if (symbolUpper === 'JUSDC') tokenKey = 'jusdc';
  if (symbolUpper === 'JUSDT') tokenKey = 'jusdt';

  const localUrl = `/tokens/${tokenKey}.png`;

  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-neutral-900 border border-white/10 rounded-full text-[9px] font-black text-[#FF9900]`}>
        {symbol.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden shrink-0 bg-neutral-950 border border-white/10 rounded-full`}>
      <img 
        src={localUrl} 
        alt={symbol} 
        className="w-full h-full object-cover rounded-full"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

// === Data Structures ===
const OMNISTON_CHAINS = {
  TON: { id: 'ton', name: 'The Open Network', icon: '💎', symbol: 'TON' },
  BASE: { id: 'base', name: 'Base (EVM)', icon: '🔵', symbol: 'ETH' },
  POLYGON: { id: 'polygon', name: 'Polygon (EVM)', icon: '🟣', symbol: 'POL' }
} as const;

const OMNISTON_TOKENS = {
  ton: [
    { symbol: 'TON', name: 'Toncoin', priceUsd: 5.35 },
    { symbol: 'STON', name: 'STON.fi', priceUsd: 3.38 },
    { symbol: 'USDT', name: 'Tether USD', priceUsd: 1.00 }
  ],
  base: [
    { symbol: 'ETH', name: 'Ethereum', priceUsd: 3450.00 },
    { symbol: 'USDC', name: 'USD Coin', priceUsd: 1.00 }
  ],
  polygon: [
    { symbol: 'POL', name: 'Polygon Token', priceUsd: 0.62 },
    { symbol: 'USDC', name: 'USD Coin', priceUsd: 1.00 }
  ]
} as const;

const getAssetId = (chain: string, token: string): AssetId | null => {
  if (chain === 'ton') {
    if (token === 'TON') return { chain: { $case: "ton", value: { kind: { $case: "native", value: {} } } } };
    if (token === 'STON') return { chain: { $case: "ton", value: { kind: { $case: "jetton", value: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO" } } } };
    if (token === 'USDT') return { chain: { $case: "ton", value: { kind: { $case: "jetton", value: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs" } } } };
  } else if (chain === 'base') {
    if (token === 'ETH') return { chain: { $case: "base", value: { kind: { $case: "native", value: {} } } } };
    if (token === 'USDC') return { chain: { $case: "base", value: { kind: { $case: "erc20", value: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" } } } };
  } else if (chain === 'polygon') {
    if (token === 'POL') return { chain: { $case: "polygon", value: { kind: { $case: "native", value: {} } } } };
    if (token === 'USDC') return { chain: { $case: "polygon", value: { kind: { $case: "erc20", value: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" } } } };
  }
  return null;
};

// === DICTIONARY ===
const DICTIONARY = {
  ru: {
    appName: 'STONHub',
    appSubName: 'CROSS-CHAIN PORTAL',
    letsGo: 'ПОГНАЛИ! 🚀',
    loading: 'Загрузка премиальной среды...',
    tabCoPilot: 'Co-Pilot',
    tabProSwap: 'Pro Своп',
    tabInfo: 'Инфо',
    tabSupport: 'Саппорт',
    walletConnectTon: 'TON Кошелек',
    walletConnectEvm: 'EVM Кошелек',
    
    // Onboarding Dialogue Steps with Stone character
    onboardTitle: 'Штурман STONHub 🗿',
    onboardStep1: 'Здорово, крипто-сталкер! 🗿👋 Я твой личный гид по STONHub. Будем знакомы! Мы построили лучший кросс-чейн портал для мгновенных обменов. Давай покажу, как тут всё устроено!',
    onboardStep2: 'Главная фича — Co-Pilot 💬. Это умный ИИ-чат со штурманом Mira. Просто напиши: "Своп 20 TON на USDC на Base", и она создаст живую сделку прямо в чате!',
    onboardStep3: 'Предпочитаешь классику? Вкладка Pro Своп 🔄 — это доведенная до идеала, чистая стеклянная форма для ручного обмена активов.',
    onboardStep4: 'Но для начала подключи кошельки! Вверху справа можно привязать TON кошелек (через TonConnect) и EVM (через RainbowKit). Это нужно, чтобы подписывать транзакции.',
    onboardStep5: 'Во время обмена ты увидишь премиальный стеклянный трекер сделки 🛰️. Он показывает блокировку котировки RFQ, подпись и подтверждение релей-сети Cocoon в реальном времени.',
    onboardStep6: 'Вкладка Инфо 📚 — твоя база знаний. Здесь лежат интерактивные карточки-справки и живое табло активности релеев, где я буду рассказывать тебе о деталях.',
    onboardStep7: 'А если что-то пойдет не так — заглядывай во вкладку Саппорт 🛠️. Там я побуду инженером-диагностом, помогу проверить статус транзакций и дам кнопку связи с админами.',
    onboardStep8: 'Ну что, готов стать кросс-чейн гигачадом и показать всем, кто тут батя? Жми "Погнали" и давай сделаем этот своп! 🪨🚀🔥',
    onboardStartBtn: 'Погнали! 🚀',
    next: 'Далее →',
    skip: 'Пропустить',
    
    // Chat & AI
    chatPlaceholder: 'Напишите запрос (например: Свопни 5 TON на USDC на Base)...',
    assistantGreeting: 'Привет! Я Mira, твой кросс-чейн штурман. Нажмите одну из кнопок быстрого старта ниже или напишите мне, что вы хотите обменять!',
    quickQuery1: 'Своп 20 TON на USDC (Base)',
    quickQuery2: 'Своп 15 USDC (Polygon) на TON',
    quickQuery3: 'Обменять 0.05 ETH (Base) на POL',
    aiThinking: 'Mira анализирует маршруты Omniston...',
    aiWidgetTitle: 'Кросс-чейн Своп подготовлен',
    
    // Pro Swap UI
    sendLabel: 'Вы отправляете',
    receiveLabel: 'Вы получаете',
    chainLabel: 'Сеть:',
    tokenLabel: 'Токен:',
    balanceLabel: 'Баланс:',
    rateLabel: 'Курс обмена:',
    slippageLabel: 'Допустимое проскальзывание:',
    gasFeeLabel: 'Ориентировочный газ:',
    routeLabel: 'Маршрут:',
    swapBtnActive: 'Выполнить обмен',
    swapBtnConnect: 'Сначала подключите кошельки',
    swapBtnAmount: 'Введите сумму',
    noRoute: 'Маршрут не найден',
    swappingProgress: 'Выполнение кросс-чейн сделки...',
    
    // Visual Stepper
    step1: 'Блокировка курса RFQ',
    step2: 'Подпись транзакции кошельком',
    step3: 'Обработка релеем Cocoon',
    step4: 'Зачисление активов на кошелек',
    
    // Info Tab
    infoTitle: 'База знаний STONHub 📚',
    infoSub: 'Изучайте тонкости кросс-чейн обменов с Камушком',
    infoCard1Title: 'Что такое Omniston?',
    infoCard1Desc: 'Omniston — это революционный протокол, который объединяет ликвидность разных сетей. Вместо долгих ручных мостов он использует быстрые котировки RFQ.',
    infoCard2Title: 'Безопасность сделок',
    infoCard2Desc: 'Ваши средства никогда не хранятся на промежуточных смарт-контрактах. Все транзакции защищены криптографической подписью и исполняются атомарно.',
    infoCard3Title: 'Скорость и Газ',
    infoCard3Desc: 'Обмен занимает в среднем всего 24 секунды! Сеть релеев Cocoon берет на себя все хлопоты по оплате газа в целевой сети за вас.',
    statsTitle: 'Активность Сети',
    statRelayers: 'Статус Релеев',
    statSpeed: 'Ср. время бриджа',
    statFee: 'Кросс-чейн газ',
    statActive: 'Активен 🟢',
    statSpeedVal: '24 сек ⏱️',
    statFeeVal: 'минимальный 💎',
    
    // Support Tab
    supportTitle: 'Техническая поддержка 🛠️',
    supportSub: 'Проверяйте хэши транзакций и отправляйте тикеты Камушку',
    supportMascotMsg: 'Привет! Я твой инженер-диагност 🗿🔧. Заметил задержку? Или есть вопросы? Давай решим это быстро!',
    faqTitle: 'Частые Вопросы',
    faq1: 'Где взять хэш транзакции?',
    faq1Ans: 'Скопируйте хэш транзакции (Tx Hash) в истории вашего кошелька (Tonkeeper или MetaMask).',
    faq2: 'Что делать, если кошелек не подключается?',
    faq2Ans: 'Убедитесь, что ваше приложение кошелька обновлено до последней версии и разблокировано.',
    diagTitle: 'Диагностика транзакции',
    diagPlaceholder: 'Вставьте хэш транзакции (0x... или EQ...)',
    diagBtn: 'Проверить статус',
    diagLoading: 'Сканирование блоков...',
    diagSuccess: 'Доставлено! Релей Cocoon успешно перевел средства.',
    formTitle: 'Отправить обращение',
    formEmail: 'Telegram Username / Email',
    formMsg: 'Описание вашей проблемы',
    formSubmit: 'Отправить тикет',
    formSuccess: 'Тикет успешно создан! Мой номер: STH-9924-OK. Я скоро свяжусь с тобой в Telegram! 😉',
    directSupportBtn: 'Написать саппорту в Telegram 📢',
    
    successMsg: 'Обмен успешно завершен! 🎉',
    errorMsg: 'Произошла ошибка при обмене. Попробуйте еще раз. ❌',
    close: 'Закрыть'
  },
  en: {
    appName: 'STONHub',
    appSubName: 'CROSS-CHAIN PORTAL',
    letsGo: 'LET\'S GO! 🚀',
    loading: 'Loading premium environment...',
    tabCoPilot: 'Co-Pilot',
    tabProSwap: 'Pro Swap',
    tabInfo: 'Info',
    tabSupport: 'Support',
    walletConnectTon: 'TON Wallet',
    walletConnectEvm: 'EVM Wallet',
    
    // Onboarding Dialogue Steps with Stone character
    onboardTitle: 'STONHub Companion 🗿',
    onboardStep1: 'Yo, crypto stalker! 🗿👋 I\'m your guide through STONHub. Great to meet ya! We built the ultimate cross-chain portal for instant swaps. Let me show you how to start!',
    onboardStep2: 'Our main feature is Co-Pilot 💬. It\'s a smart AI chat with co-pilot Mira. Just type: "Swap 20 TON to USDC on Base", and she\'ll configure a live trade directly in the feed!',
    onboardStep3: 'Prefer the classics? The Pro Swap tab 🔄 is a visually perfect, clean glass widget for manual cross-chain swaps.',
    onboardStep4: 'But first, connect your wallets! At the top right, connect your TON wallet (via TonConnect) and EVM wallet (via RainbowKit). This is required to sign transactions.',
    onboardStep5: 'During the swap, you\'ll see a premium glass transaction stepper 🛰️ tracking RFQ rate lock, wallet signatures, and Cocoon relayer consensus in real-time.',
    onboardStep6: 'The Info tab 📚 is your library. Here you\'ll find interactive card guides and live relayer activity stats, where I\'ll explain all the technical details.',
    onboardStep7: 'And if anything goes wrong, visit the Support tab 🛠️. I\'ll act as a troubleshooter, help verify transaction hashes, and give you a direct button to connect with support.',
    onboardStep8: 'So, ready to become a cross-chain giga-chad and show everyone who\'s boss? Hit "Let\'s Go" and let\'s make that first trade! 🪨🚀🔥',
    onboardStartBtn: 'Let\'s Go! 🚀',
    next: 'Next →',
    skip: 'Skip',
    
    // Chat & AI
    chatPlaceholder: 'Write a request (e.g. Swap 5 TON to USDC on Base)...',
    assistantGreeting: 'Hi! I\'m Mira, your cross-chain co-pilot. Click one of the quick start suggestions below or type what you would like to swap!',
    quickQuery1: 'Swap 20 TON to USDC (Base)',
    quickQuery2: 'Swap 15 USDC (Polygon) to TON',
    quickQuery3: 'Swap 0.05 ETH (Base) to POL',
    aiThinking: 'Mira is analyzing Omniston routes...',
    aiWidgetTitle: 'Cross-chain Swap Configured',
    
    // Pro Swap UI
    sendLabel: 'You send',
    receiveLabel: 'You receive',
    chainLabel: 'Chain:',
    tokenLabel: 'Token:',
    balanceLabel: 'Balance:',
    rateLabel: 'Exchange rate:',
    slippageLabel: 'Allowed slippage:',
    gasFeeLabel: 'Estimated gas:',
    routeLabel: 'Route:',
    swapBtnActive: 'Execute Swap',
    swapBtnConnect: 'Connect wallets first',
    swapBtnAmount: 'Enter amount',
    noRoute: 'No route found',
    swappingProgress: 'Executing cross-chain transaction...',
    
    // Visual Stepper
    step1: 'Locking RFQ rate',
    step2: 'Signing wallet transaction',
    step3: 'Processing by Cocoon relayer',
    step4: 'Disbursing assets to destination',
    
    // Info Tab
    infoTitle: 'STONHub Library 📚',
    infoSub: 'Learn the secrets of cross-chain swaps with the Stone guide',
    infoCard1Title: 'What is Omniston?',
    infoCard1Desc: 'Omniston is a revolutionary protocol that aggregates liquidity across different chains. Instead of long manual bridges, it locks rapid RFQ quotes.',
    infoCard2Title: 'Trade Security',
    infoCard2Desc: 'Your assets are never stored on intermediate smart contracts. All swaps are secured by cryptographic signatures and executed atomically.',
    infoCard3Title: 'Speed & Gas',
    infoCard3Desc: 'An exchange takes just 24 seconds on average! The Cocoon relayer network handles all target network gas payments for you.',
    statsTitle: 'Network Activity',
    statRelayers: 'Relayers Status',
    statSpeed: 'Avg. bridge speed',
    statFee: 'Cross-chain gas',
    statActive: 'Active 🟢',
    statSpeedVal: '24 sec ⏱️',
    statFeeVal: 'minimal 💎',
    
    // Support Tab
    supportTitle: 'Technical Support 🛠️',
    supportSub: 'Verify transaction hashes and send tickets directly to the Stone',
    supportMascotMsg: 'Hey! I\'m your troubleshooter engineer 🗿🔧. Noticed a delay? Or have a question? Let\'s fix this quickly!',
    faqTitle: 'Frequent Questions',
    faq1: 'Where to find the Tx Hash?',
    faq1Ans: 'Copy the transaction hash (Tx Hash) in your wallet history (Tonkeeper or MetaMask).',
    faq2: 'What if my wallet won\'t connect?',
    faq2Ans: 'Make sure your wallet application is updated to the latest version and is unlocked.',
    diagTitle: 'Transaction Diagnostics',
    diagPlaceholder: 'Paste transaction hash (0x... or EQ...)',
    diagBtn: 'Verify Status',
    diagLoading: 'Scanning blocks...',
    diagSuccess: 'Delivered! Cocoon relayer successfully routed the assets.',
    formTitle: 'Submit a ticket',
    formEmail: 'Telegram Username / Email',
    formMsg: 'Describe your issue',
    formSubmit: 'Submit Ticket',
    formSuccess: 'Ticket submitted! My number: STH-9924-OK. I\'ll contact you in Telegram soon! 😉',
    directSupportBtn: 'Write to Support in Telegram 📢',
    
    successMsg: 'Swap completed successfully! 🎉',
    errorMsg: 'Transaction failed. Please try again. ❌',
    close: 'Close'
  }
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  widgetData?: {
    srcChain: 'ton' | 'base' | 'polygon';
    srcToken: string;
    dstChain: 'ton' | 'base' | 'polygon';
    dstToken: string;
    amount: string;
  };
}

export default function Home() {
  // === Language States ===
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stonhub_lang');
      if (saved === 'ru' || saved === 'en') {
        setLang(saved);
      } else {
        const isBrowserRu = window.navigator.language.startsWith('ru');
        setLang(isBrowserRu ? 'ru' : 'en');
      }
    }
  }, []);

  const toggleLang = () => {
    const nextLang = lang === 'ru' ? 'en' : 'ru';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stonhub_lang', nextLang);
    }
  };

  const t = DICTIONARY[lang];

  // === Splash Screen States ===
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashPercent, setSplashPercent] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSplashPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 5;
        return Math.min(prev + step, 100);
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // === Onboarding Welcome Dialogue States ===
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);

  useEffect(() => {
    if (!showSplash) {
      const seen = localStorage.getItem('stonhub_onboarding_completed');
      if (!seen) {
        setShowOnboarding(true);
      }
    }
  }, [showSplash]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('stonhub_onboarding_completed', 'true');
  };

  // === Core Wallet Connections ===
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { address: evmAddress } = useAccount();

  // === App Navigation States ===
  const [activeTab, setActiveTab] = useState<'copilot' | 'pro' | 'info' | 'support'>('copilot');

  // === Main Swap Parameter States ===
  const [srcChain, setSrcChain] = useState<'ton' | 'base' | 'polygon'>('ton');
  const [srcToken, setSrcToken] = useState<string>('TON');
  const [dstChain, setDstChain] = useState<'ton' | 'base' | 'polygon'>('base');
  const [dstToken, setDstToken] = useState<string>('USDC');
  const [srcAmount, setSrcAmount] = useState<string>('');
  const [dstAmount, setDstAmount] = useState<string>('');

  // Dropdowns
  const [showSrcChainDrop, setShowSrcChainDrop] = useState<boolean>(false);
  const [showSrcTokenDrop, setShowSrcTokenDrop] = useState<boolean>(false);
  const [showDstChainDrop, setShowDstChainDrop] = useState<boolean>(false);
  const [showDstTokenDrop, setShowDstTokenDrop] = useState<boolean>(false);

  // === Co-Pilot Chat States ===
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat greeting
  useEffect(() => {
    setChatMessages([
      {
        id: 'greet',
        sender: 'assistant',
        text: t.assistantGreeting,
        timestamp: new Date()
      }
    ]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // === Transaction Progress Overlay ===
  const [showTxOverlay, setShowTxOverlay] = useState<boolean>(false);
  const [txStep, setTxStep] = useState<number>(0);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);

  // === Info Tab States ===
  const [infoModalCard, setInfoModalCard] = useState<number | null>(null);

  // === Support Tab States ===
  const [supportTxHash, setSupportTxHash] = useState<string>('');
  const [isSupportSearching, setIsSupportSearching] = useState<boolean>(false);
  const [supportTxResult, setSupportTxResult] = useState<boolean>(false);
  const [supportFormEmail, setSupportFormEmail] = useState<string>('');
  const [supportFormMsg, setSupportFormMsg] = useState<string>('');
  const [isSupportFormSubmitted, setIsSupportFormSubmitted] = useState<boolean>(false);

  // === Omniston SDK Integration Hooks ===
  const omniston = useOmniston();
  const inputAsset = getAssetId(srcChain, srcToken);
  const outputAsset = getAssetId(dstChain, dstToken);

  const quoteRequest: QuoteRequest | undefined = useMemo(() => {
    if (!inputAsset || !outputAsset || !srcAmount || Number(srcAmount) <= 0) return undefined;
    return {
      inputAsset,
      outputAsset,
      amount: {
        $case: "inputUnits",
        value: (Number(srcAmount) * 1e9).toFixed(0),
      },
      settlementParams: [
        {
          params: {
            $case: "swap",
            value: { maxPriceSlippagePips: 10_000, flexibleIntegratorFee: true },
          },
        },
        {
          params: {
            $case: "order",
            value: {},
          },
        }
      ]
    } as QuoteRequest;
  }, [inputAsset, outputAsset, srcAmount]);

  const { data: quoteEvent } = useRfq(quoteRequest as any);
  const activeQuote = quoteEvent?.$case === 'quoteUpdated' ? quoteEvent.value : null;

  useEffect(() => {
    if (activeQuote && !showTxOverlay) {
      setDstAmount((Number(activeQuote.expectedOutput) / 1e9).toFixed(4));
    } else if (quoteEvent?.$case === 'noQuote') {
      setDstAmount('0.00');
    }
  }, [activeQuote, quoteEvent, showTxOverlay]);

  // Trigger dynamic selection side-effects to ensure valid pair choices
  const handleChainChange = (type: 'src' | 'dst', chain: 'ton' | 'base' | 'polygon') => {
    if (type === 'src') {
      setSrcChain(chain);
      const defaultToken = OMNISTON_TOKENS[chain][0].symbol;
      setSrcToken(defaultToken);
      setShowSrcChainDrop(false);
      
      // Prevent same destination
      if (chain === dstChain) {
        const otherChain = chain === 'ton' ? 'base' : 'ton';
        setDstChain(otherChain);
        setDstToken(OMNISTON_TOKENS[otherChain][0].symbol);
      }
    } else {
      setDstChain(chain);
      const defaultToken = OMNISTON_TOKENS[chain][0].symbol;
      setDstToken(defaultToken);
      setShowDstChainDrop(false);
      
      // Prevent same source
      if (chain === srcChain) {
        const otherChain = chain === 'ton' ? 'base' : 'ton';
        setSrcChain(otherChain);
        setSrcToken(OMNISTON_TOKENS[otherChain][0].symbol);
      }
    }
    setSrcAmount('');
    setDstAmount('');
  };

  // === Local Simulated AI Parser & Action router ===
  const handleSendChat = (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    // 2. Mock AI Parsing Delay
    setTimeout(() => {
      let replyText = '';
      let parsedWidget: ChatMessage['widgetData'] = undefined;

      const lowerText = text.toLowerCase();
      
      // Basic natural language parser for multi-chain intents
      if (lowerText.includes('ton') && lowerText.includes('usdc') && (lowerText.includes('base') || lowerText.includes('бейс'))) {
        replyText = lang === 'ru' 
          ? "Отлично! Я подготовила кросс-чейн сделку для перевода TON из сети The Open Network в USDC на Base. Ниже представлен активный виджет Omniston. Вы можете настроить количество и подписать сделку."
          : "Excellent! I have configured the cross-chain swap from TON on The Open Network to USDC on Base. The active Omniston widget is ready below. Feel free to adjust the amount and execute.";
        parsedWidget = {
          srcChain: 'ton',
          srcToken: 'TON',
          dstChain: 'base',
          dstToken: 'USDC',
          amount: '10'
        };
      } else if (lowerText.includes('usdc') && (lowerText.includes('polygon') || lowerText.includes('полигон')) && lowerText.includes('ton')) {
        replyText = lang === 'ru'
          ? "Хорошо. Я переключила терминал на кросс-чейн мост: USDC на Polygon в TON. Вы можете нажать кнопку ниже, чтобы запросить живую котировку RFQ."
          : "Sure. I have configured the interface for a cross-chain swap: USDC on Polygon to TON. Click the execution button below to pull the live RFQ quote.";
        parsedWidget = {
          srcChain: 'polygon',
          srcToken: 'USDC',
          dstChain: 'ton',
          dstToken: 'TON',
          amount: '20'
        };
      } else if (lowerText.includes('eth') && (lowerText.includes('base') || lowerText.includes('бейс')) && (lowerText.includes('pol') || lowerText.includes('polygon') || lowerText.includes('полигон'))) {
        replyText = lang === 'ru'
          ? "Готово! Сконфигурирован обмен ETH из Base в Polygon экосистемный токен (POL). Виджет настроен на симуляцию котировки."
          : "Done! Configured the exchange from ETH on Base to Polygon ecosystem token (POL). The live widget is set up below.";
        parsedWidget = {
          srcChain: 'base',
          srcToken: 'ETH',
          dstChain: 'polygon',
          dstToken: 'POL',
          amount: '0.02'
        };
      } else {
        replyText = lang === 'ru'
          ? "Я понимаю твой запрос! Давай подготовим стандартный обмен TON на USDC в Base, так как это наиболее частый и выгодный маршрут с низким газом. Вот виджет:"
          : "I understand! Let's configure a cross-chain swap from TON to USDC on Base, as it represents our most optimized, low-gas route. Here is the active widget:";
        parsedWidget = {
          srcChain: 'ton',
          srcToken: 'TON',
          dstChain: 'base',
          dstToken: 'USDC',
          amount: '5'
        };
      }

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date(),
        widgetData: parsedWidget
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 1500);
  };

  // Trigger swap from the chat widget
  const handleExecuteWidgetSwap = (data: NonNullable<ChatMessage['widgetData']>) => {
    setSrcChain(data.srcChain);
    setSrcToken(data.srcToken);
    setDstChain(data.dstChain);
    setDstToken(data.dstToken);
    setSrcAmount(data.amount);
    
    // Switch to Pro tab to complete execution seamlessly
    setActiveTab('pro');
  };

  // === Cross-chain execution workflow stepper ===
  const triggerTxWorkflow = () => {
    setShowTxOverlay(true);
    setTxStep(1);
    setTxSuccess(null);

    // Step 1: RFQ Lock
    setTimeout(() => {
      setTxStep(2);
      
      // Step 2: Signature
      setTimeout(() => {
        setTxStep(3);
        
        // Step 3: Relayer
        setTimeout(() => {
          setTxStep(4);
          
          // Step 4: Finalized
          setTimeout(() => {
            setTxStep(5);
            setTxSuccess(true);
          }, 2000);
        }, 2200);
      }, 1800);
    }, 1500);
  };

  // Handle support check simulation
  const handleSupportCheckHash = () => {
    if (!supportTxHash.trim()) return;
    setIsSupportSearching(true);
    setSupportTxResult(false);

    setTimeout(() => {
      setIsSupportSearching(false);
      setSupportTxResult(true);
    }, 2000);
  };

  // Handle support ticket form submit
  const handleSupportFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportFormEmail.trim() || !supportFormMsg.trim()) return;
    setIsSupportFormSubmitted(true);
  };

  // 8 Onboarding steps with mapped emotions images
  const onboardingSteps = [
    { text: t.onboardStep1, image: '/character_1.png' },
    { text: t.onboardStep2, image: '/character_2.png' },
    { text: t.onboardStep3, image: '/character_3.png' },
    { text: t.onboardStep4, image: '/character_4.png' },
    { text: t.onboardStep5, image: '/character_5.png' },
    { text: t.onboardStep6, image: '/character_6.png' },
    { text: t.onboardStep7, image: '/character_7.png' },
    { text: t.onboardStep8, image: '/character_8.png' }
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* Background Soft Gradients (Premium non-neon aesthetic) */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-[#FF9900]/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF5500]/1 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#FF9900]/1 blur-[120px] pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 1. STARTING SPLASH SCREEN (GLUSHER) WITH LOGO.PNG */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            className="fixed inset-0 bg-[#060608] z-50 flex flex-col items-center justify-center p-6"
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } }}
          >
            <div className="w-full max-w-sm flex flex-col items-center justify-center text-center space-y-8">
              
              {/* Spinning Premium Rings around logo.png */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/5 border-t-2 border-t-[#FF9900] animate-spin" style={{ animationDuration: '1.8s' }} />
                <div className="absolute w-28 h-28 rounded-full border border-white/5 border-r-2 border-r-[#FF5500] animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(255,153,0,0.2)] z-10 glossy-reflection p-2">
                  <img src="/logo.png" alt="STONHub Logo" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Title & Brand */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-3xl font-black tracking-tighter text-white">STON</span>
                  <span className="bg-[#FF9900] text-black text-sm font-black px-2 py-0.5 rounded uppercase tracking-wider">HUB</span>
                </div>
                <p className="text-[10px] tracking-[0.25em] text-[#8C8C96] uppercase font-bold">
                  {t.appSubName}
                </p>
              </div>

              {/* Progress and Action Button */}
              <div className="w-full space-y-4">
                {splashPercent < 100 ? (
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-500 font-medium tracking-wide animate-pulse">
                      {t.loading}
                    </div>
                    <div className="relative w-48 h-[2px] bg-neutral-900 rounded-full overflow-hidden mx-auto">
                      <motion.div 
                        className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#FF9900] to-[#FF5500]"
                        style={{ width: `${splashPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-black text-neutral-600 tracking-wider">
                      {splashPercent}%
                    </div>
                  </div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowSplash(false)}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-sm tracking-wider shadow-[0_4px_25px_rgba(255,153,0,0.3)] hover:shadow-[0_4px_30px_rgba(255,153,0,0.45)] transition-all cursor-pointer select-none glossy-reflection"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t.letsGo}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. 8-STEP DIALOGUE-ONBOARDING WITH EMOTIONAL STONE CHARACTERS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md liquid-glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col items-center"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9900] to-[#FF5500]" />
              
              {/* Mascot Emotion Image */}
              <div className="w-40 h-40 flex items-center justify-center relative mb-4 shrink-0 rounded-2xl overflow-hidden bg-black/45 border border-white/5">
                <img 
                  src={onboardingSteps[onboardingStep].image} 
                  alt="STONHub Companion Emotion" 
                  className="w-full h-full object-contain scale-[1.05]"
                />
              </div>

              {/* Guide Title Banner */}
              <h3 className="text-base font-black text-[#FF9900] tracking-wide mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                {t.onboardTitle}
              </h3>

              {/* Progress Stepper indicators */}
              <div className="flex items-center gap-1 mb-4">
                {onboardingSteps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-[3px] rounded-full transition-all duration-300 ${idx === onboardingStep ? 'w-5 bg-[#FF9900]' : 'w-1.5 bg-neutral-800'}`}
                  />
                ))}
              </div>

              {/* Description Box */}
              <div className="bg-black/35 border border-white/5 rounded-xl p-4 min-h-[110px] w-full flex flex-col justify-center mb-6 relative">
                <p className="text-sm font-medium leading-relaxed text-neutral-200 text-center">
                  {onboardingSteps[onboardingStep].text}
                </p>
              </div>

              {/* Dialogue Navigation Buttons */}
              <div className="flex items-center justify-between w-full">
                <button 
                  onClick={completeOnboarding}
                  className="text-xs text-neutral-500 hover:text-white font-black tracking-wide cursor-pointer"
                >
                  {t.skip}
                </button>
                
                {onboardingStep < onboardingSteps.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((p) => p + 1)}
                    className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black tracking-wide transition-all cursor-pointer"
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    onClick={completeOnboarding}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-xs tracking-wider shadow-lg glossy-reflection cursor-pointer"
                  >
                    {t.onboardStartBtn}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. APP HEADER WITH LOGO.PNG */}
      {/* ========================================================================= */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2 z-10 relative">
        <div className="flex items-center justify-between gap-4 mb-4">
          
          {/* Logo Brand using public/logo.png */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('copilot')}>
            <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-white/10 flex items-center justify-center shadow-lg relative p-1.5 glossy-reflection shrink-0">
              <img src="/logo.png" alt="STONHub Logo" className="w-full h-full object-contain" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#060608]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tighter text-white">STONHub</span>
              <span className="text-[8px] tracking-[0.18em] text-[#8C8C96] font-bold uppercase">{t.appSubName}</span>
            </div>
          </div>

          {/* Action Header items */}
          <div className="flex items-center gap-2">
            
            {/* Language toggle */}
            <button 
              onClick={toggleLang}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all cursor-pointer"
            >
              <Languages className="w-4 h-4 text-neutral-400 hover:text-white" />
            </button>

            {/* EVM Rainbow Wallet Connect */}
            <div className="scale-90 origin-right">
              <ConnectButton 
                label={t.walletConnectEvm}
                accountStatus="avatar"
                chainStatus="icon"
                showBalance={false}
              />
            </div>

            {/* TON Connect button */}
            <div className="scale-90 origin-right">
              <TonConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. MAIN DISPLAY CARD WITH ANIMATIONS */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-28 z-10 relative flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CO-PILOT CHAT INTERFACE */}
          {activeTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-full max-w-xl flex flex-col h-[60vh] liquid-glass-card rounded-2xl overflow-hidden"
            >
              <div className="px-4 py-3 bg-black/35 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black tracking-wider text-neutral-300">MIRA CO-PILOT IS ONLINE</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF9900]">
                  <Sparkles className="w-3 h-3" />
                  Omniston Aggregator
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-neutral-950/20">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#FF9900]/20 to-[#FF5500]/10 border border-[#FF9900]/20 text-white' : 'bg-white/5 border border-white/5 text-neutral-200'}`}
                    >
                      {msg.text}
                    </div>

                    {/* Inline active widget if triggered */}
                    {msg.widgetData && (
                      <div className="w-full max-w-sm mt-3 liquid-glass-card border border-[#FF9900]/20 rounded-xl p-4 space-y-3 bg-black/40">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] font-black text-neutral-400 tracking-wider uppercase">{t.aiWidgetTitle}</span>
                          <span className="text-[10px] font-black text-[#FF9900] bg-[#FF9900]/10 px-1.5 py-0.5 rounded">LIVE RFQ</span>
                        </div>

                        {/* Chain path visualization */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <TokenLogo symbol={msg.widgetData.srcToken} className="w-4 h-4" />
                            <span className="text-xs font-black">{msg.widgetData.srcToken}</span>
                            <span className="text-[10px] text-neutral-500">({msg.widgetData.srcChain.toUpperCase()})</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-600 animate-pulse" />
                          <div className="flex items-center gap-1.5 text-right">
                            <TokenLogo symbol={msg.widgetData.dstToken} className="w-4 h-4" />
                            <span className="text-xs font-black">{msg.widgetData.dstToken}</span>
                            <span className="text-[10px] text-neutral-500">({msg.widgetData.dstChain.toUpperCase()})</span>
                          </div>
                        </div>

                        {/* Amount configured */}
                        <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-white/5">
                          <span className="text-[10px] text-neutral-500 font-bold">{t.sendLabel}:</span>
                          <span className="text-xs font-black text-[#FF9900]">{msg.widgetData.amount} {msg.widgetData.srcToken}</span>
                        </div>

                        <button 
                          onClick={() => handleExecuteWidgetSwap(msg.widgetData!)}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-xs tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer glossy-reflection"
                        >
                          {t.swapBtnActive}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Typing Indicator */}
                {isAiTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 max-w-[120px]">
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggesters */}
              {chatMessages.length === 1 && (
                <div className="p-3 bg-black/20 border-t border-white/5 flex flex-wrap gap-2 justify-center shrink-0">
                  <button 
                    onClick={() => handleSendChat(t.quickQuery1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF9900]/10 border border-white/5 hover:border-[#FF9900]/20 text-[10px] text-neutral-400 hover:text-white font-bold transition-all cursor-pointer"
                  >
                    {t.quickQuery1}
                  </button>
                  <button 
                    onClick={() => handleSendChat(t.quickQuery2)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF9900]/10 border border-white/5 hover:border-[#FF9900]/20 text-[10px] text-neutral-400 hover:text-white font-bold transition-all cursor-pointer"
                  >
                    {t.quickQuery2}
                  </button>
                  <button 
                    onClick={() => handleSendChat(t.quickQuery3)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF9900]/10 border border-white/5 hover:border-[#FF9900]/20 text-[10px] text-neutral-400 hover:text-white font-bold transition-all cursor-pointer"
                  >
                    {t.quickQuery3}
                  </button>
                </div>
              )}

              {/* Input Chat Box */}
              <div className="p-3 bg-black/35 border-t border-white/5 flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat(chatInput)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 bg-black/45 border border-white/5 rounded-xl px-4 text-xs focus:border-[#FF9900]/40 outline-none transition-all placeholder-neutral-600"
                />
                <button 
                  onClick={() => handleSendChat(chatInput)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#FF5500] text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PRO SWAP FORM */}
          {activeTab === 'pro' && (
            <motion.div
              key="pro"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-full max-w-md liquid-glass-card rounded-2xl p-6 space-y-6 relative overflow-hidden"
            >
              
              {/* Asset Box 1: SOURCE */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
                  <span>{t.sendLabel}</span>
                  <span>{t.balanceLabel} 12.45</span>
                </div>
                
                <div className="bg-black/45 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                  <input 
                    type="text" 
                    value={srcAmount}
                    onChange={(e) => {
                      setSrcAmount(e.target.value);
                      if (activeQuote) setDstAmount('...');
                    }}
                    placeholder="0.0"
                    className="flex-1 bg-transparent border-none text-2xl font-black focus:outline-none placeholder-neutral-700 min-w-0"
                  />
                  
                  {/* Select Source Chain / Asset */}
                  <div className="flex gap-1.5 shrink-0">
                    
                    {/* Chain Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSrcChainDrop(!showSrcChainDrop)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 flex items-center gap-1 text-[10px] font-black tracking-wide cursor-pointer transition-all"
                      >
                        <span>{OMNISTON_CHAINS[srcChain.toUpperCase() as keyof typeof OMNISTON_CHAINS].icon}</span>
                        <span className="uppercase">{srcChain}</span>
                        <ChevronDown className="w-3 h-3 text-neutral-500" />
                      </button>

                      {showSrcChainDrop && (
                        <div className="absolute right-0 mt-1 w-32 bg-[#121215] border border-white/10 rounded-lg p-1 shadow-2xl z-20">
                          {(['ton', 'base', 'polygon'] as const).map((chain) => (
                            <button
                              key={chain}
                              onClick={() => handleChainChange('src', chain)}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 text-[10px] font-black uppercase flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{OMNISTON_CHAINS[chain.toUpperCase() as keyof typeof OMNISTON_CHAINS].icon}</span>
                              {chain}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Token Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSrcTokenDrop(!showSrcTokenDrop)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 flex items-center gap-1.5 text-xs font-black cursor-pointer transition-all"
                      >
                        <TokenLogo symbol={srcToken} className="w-3.5 h-3.5" />
                        <span>{srcToken}</span>
                        <ChevronDown className="w-3 h-3 text-neutral-500" />
                      </button>

                      {showSrcTokenDrop && (
                        <div className="absolute right-0 mt-1 w-28 bg-[#121215] border border-white/10 rounded-lg p-1 shadow-2xl z-20">
                          {OMNISTON_TOKENS[srcChain].map((tkn) => (
                            <button
                              key={tkn.symbol}
                              onClick={() => {
                                setSrcToken(tkn.symbol);
                                setShowSrcTokenDrop(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                            >
                              <TokenLogo symbol={tkn.symbol} className="w-3.5 h-3.5" />
                              {tkn.symbol}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Centered Switcher */}
              <div className="flex justify-center -my-3 relative z-10">
                <button 
                  onClick={() => {
                    const tempChain = srcChain;
                    const tempToken = srcToken;
                    setSrcChain(dstChain);
                    setSrcToken(dstToken);
                    setDstChain(tempChain);
                    setDstToken(tempToken);
                    setSrcAmount('');
                    setDstAmount('');
                  }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#FF5500] border border-white/10 text-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                >
                  <SwapIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Asset Box 2: DESTINATION */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
                  <span>{t.receiveLabel}</span>
                  <span>{t.balanceLabel} 0.00</span>
                </div>
                
                <div className="bg-black/45 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 bg-transparent text-2xl font-black text-neutral-300">
                    {dstAmount || '0.0'}
                  </div>
                  
                  <div className="flex gap-1.5 shrink-0">
                    
                    {/* Destination Chain Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowDstChainDrop(!showDstChainDrop)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 flex items-center gap-1 text-[10px] font-black tracking-wide cursor-pointer transition-all"
                      >
                        <span>{OMNISTON_CHAINS[dstChain.toUpperCase() as keyof typeof OMNISTON_CHAINS].icon}</span>
                        <span className="uppercase">{dstChain}</span>
                        <ChevronDown className="w-3 h-3 text-neutral-500" />
                      </button>

                      {showDstChainDrop && (
                        <div className="absolute right-0 mt-1 w-32 bg-[#121215] border border-white/10 rounded-lg p-1 shadow-2xl z-20">
                          {(['ton', 'base', 'polygon'] as const).map((chain) => (
                            <button
                              key={chain}
                              onClick={() => handleChainChange('dst', chain)}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 text-[10px] font-black uppercase flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{OMNISTON_CHAINS[chain.toUpperCase() as keyof typeof OMNISTON_CHAINS].icon}</span>
                              {chain}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Destination Token Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowDstTokenDrop(!showDstTokenDrop)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 flex items-center gap-1.5 text-xs font-black cursor-pointer transition-all"
                      >
                        <TokenLogo symbol={dstToken} className="w-3.5 h-3.5" />
                        <span>{dstToken}</span>
                        <ChevronDown className="w-3 h-3 text-neutral-500" />
                      </button>

                      {showDstTokenDrop && (
                        <div className="absolute right-0 mt-1 w-28 bg-[#121215] border border-white/10 rounded-lg p-1 shadow-2xl z-20">
                          {OMNISTON_TOKENS[dstChain].map((tkn) => (
                            <button
                              key={tkn.symbol}
                              onClick={() => {
                                setDstToken(tkn.symbol);
                                setShowDstTokenDrop(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                            >
                              <TokenLogo symbol={tkn.symbol} className="w-3.5 h-3.5" />
                              {tkn.symbol}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote details */}
              {activeQuote && (
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t.rateLabel}</span>
                    <span className="text-neutral-300 font-bold">1 {srcToken} ≈ {(Number(activeQuote.expectedOutput) / Number(activeQuote.expectedInput)).toFixed(4)} {dstToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t.slippageLabel}</span>
                    <span className="text-neutral-300 font-bold">1.0%</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-neutral-500">{t.routeLabel}</span>
                    <span className="text-[#FF9900] font-black uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Omniston Multi-Bridge
                    </span>
                  </div>
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={triggerTxWorkflow}
                disabled={!tonAddress || !evmAddress || !srcAmount}
                className={`w-full py-4 rounded-xl font-black text-sm tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${(!tonAddress || !evmAddress) ? 'bg-white/5 border border-white/5 text-neutral-500 cursor-not-allowed' : !srcAmount ? 'bg-white/10 text-neutral-300' : 'bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black shadow-[0_4px_20px_rgba(255,153,0,0.2)] hover:scale-[1.01] glossy-reflection'}`}
              >
                {(!tonAddress || !evmAddress) ? (
                  <>
                    <WalletIcon className="w-4 h-4" />
                    {t.swapBtnConnect}
                  </>
                ) : !srcAmount ? (
                  t.swapBtnAmount
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {t.swapBtnActive}
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* TAB 3: INFO LIBRARY PAGE */}
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-full max-w-md space-y-6"
            >
              
              {/* Info Header */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black tracking-wider text-white">{t.infoTitle}</h2>
                <p className="text-xs text-neutral-400 font-medium">{t.infoSub}</p>
              </div>

              {/* Mini Guide Cards */}
              <div className="space-y-3">
                {[
                  { id: 1, title: t.infoCard1Title, desc: t.infoCard1Desc, charImg: '/character_2.png' },
                  { id: 2, title: t.infoCard2Title, desc: t.infoCard2Desc, charImg: '/character_6.png' },
                  { id: 3, title: t.infoCard3Title, desc: t.infoCard3Desc, charImg: '/character_5.png' }
                ].map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setInfoModalCard(card.id)}
                    className="p-4 rounded-xl liquid-glass-card-interactive flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white">{card.title}</h4>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{card.desc}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={card.charImg} alt={card.title} className="w-full h-full object-contain" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Network Stats */}
              <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black tracking-wider text-neutral-400 uppercase border-b border-white/5 pb-2">
                  {t.statsTitle}
                </h3>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold block">{t.statRelayers}</span>
                    <span className="text-xs font-black text-green-400 block">{t.statActive}</span>
                  </div>
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold block">{t.statSpeed}</span>
                    <span className="text-xs font-black text-[#FF9900] block">{t.statSpeedVal}</span>
                  </div>
                  <div className="p-3 bg-black/35 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold block">{t.statFee}</span>
                    <span className="text-xs font-black text-blue-400 block">{t.statFeeVal}</span>
                  </div>
                </div>
              </div>

              {/* Guide Modal Popups */}
              <AnimatePresence>
                {infoModalCard !== null && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-sm liquid-glass-card rounded-2xl p-6 space-y-4 relative flex flex-col items-center"
                    >
                      <button 
                        onClick={() => setInfoModalCard(null)}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10"
                      >
                        <X className="w-4 h-4 text-neutral-400" />
                      </button>

                      {/* Modal Emotional Character */}
                      <div className="w-28 h-28 overflow-hidden rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
                        <img 
                          src={infoModalCard === 1 ? '/character_2.png' : infoModalCard === 2 ? '/character_6.png' : '/character_5.png'} 
                          alt="Stoneguide character" 
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <h3 className="text-base font-black text-white mt-2">
                        {infoModalCard === 1 && t.infoCard1Title}
                        {infoModalCard === 2 && t.infoCard2Title}
                        {infoModalCard === 3 && t.infoCard3Title}
                      </h3>

                      <p className="text-xs text-neutral-300 leading-relaxed text-center bg-black/30 border border-white/5 p-3.5 rounded-xl">
                        {infoModalCard === 1 && t.infoCard1Desc}
                        {infoModalCard === 2 && t.infoCard2Desc}
                        {infoModalCard === 3 && t.infoCard3Desc}
                      </p>

                      <button
                        onClick={() => setInfoModalCard(null)}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-xs tracking-wider shadow-md cursor-pointer"
                      >
                        {t.close}
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* TAB 4: SUPPORT TROUBLESHOOTER PAGE */}
          {activeTab === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-full max-w-md space-y-6"
            >
              {/* Support Header */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black tracking-wider text-white">{t.supportTitle}</h2>
                <p className="text-xs text-neutral-400 font-medium">{t.supportSub}</p>
              </div>

              {/* Mascot Bubble welcome */}
              <div className="liquid-glass-card rounded-2xl p-4 flex items-center gap-4 bg-black/45">
                <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/character_7.png" alt="Stone engineer mascot" className="w-full h-full object-contain scale-110" />
                </div>
                <div className="bg-black/35 rounded-xl p-3 border border-white/5 flex-1 relative">
                  <p className="text-xs font-semibold text-neutral-200 leading-relaxed">{t.supportMascotMsg}</p>
                </div>
              </div>

              {/* Transaction Diagnostic checker */}
              <div className="liquid-glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black tracking-wider text-neutral-400 uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#FF9900]" />
                  {t.diagTitle}
                </h3>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={supportTxHash}
                    onChange={(e) => setSupportTxHash(e.target.value)}
                    placeholder={t.diagPlaceholder}
                    className="flex-1 bg-black/45 border border-white/5 rounded-xl px-3 text-xs focus:border-[#FF9900]/40 outline-none transition-all placeholder-neutral-600"
                  />
                  <button
                    onClick={handleSupportCheckHash}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-xs shrink-0 hover:scale-103 cursor-pointer glossy-reflection"
                  >
                    {t.diagBtn}
                  </button>
                </div>

                {isSupportSearching && (
                  <div className="text-center py-2 text-xs text-neutral-400 font-bold animate-pulse flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-t-2 border-t-[#FF9900] animate-spin" />
                    {t.diagLoading}
                  </div>
                )}

                {supportTxResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {t.diagSuccess}
                  </motion.div>
                )}
              </div>

              {/* Support Email Ticket form */}
              <div className="liquid-glass-card rounded-2xl p-5 space-y-4 relative">
                
                {/* Form Re-render successfully */}
                {isSupportFormSubmitted ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4 py-4"
                  >
                    <div className="w-20 h-20 overflow-hidden mx-auto bg-black/40 rounded-xl border border-white/5 flex items-center justify-center">
                      <img src="/character_1.png" alt="Happy stone companion" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-[280px] mx-auto bg-green-500/5 border border-green-500/20 p-3 rounded-xl font-semibold">
                      {t.formSuccess}
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSupportFormSubmit} className="space-y-4">
                    <h3 className="text-xs font-black tracking-wider text-neutral-400 uppercase border-b border-white/5 pb-2">
                      {t.formTitle}
                    </h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-500 font-bold uppercase">{t.formEmail}</label>
                      <input 
                        type="text" 
                        required
                        value={supportFormEmail}
                        onChange={(e) => setSupportFormEmail(e.target.value)}
                        placeholder="@username или email"
                        className="w-full bg-black/45 border border-white/5 rounded-xl px-3 py-2 text-xs focus:border-[#FF9900]/40 outline-none transition-all placeholder-neutral-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-500 font-bold uppercase">{t.formMsg}</label>
                      <textarea 
                        rows={3}
                        required
                        value={supportFormMsg}
                        onChange={(e) => setSupportFormMsg(e.target.value)}
                        placeholder="Опишите проблему подробно..."
                        className="w-full bg-black/45 border border-white/5 rounded-xl px-3 py-2 text-xs focus:border-[#FF9900]/40 outline-none transition-all placeholder-neutral-600 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black tracking-wide cursor-pointer transition-all"
                    >
                      {t.formSubmit}
                    </button>
                  </form>
                )}
              </div>

              {/* Direct Telegram Support Button */}
              <a 
                href="https://t.me/stonhubapp" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF9900] to-[#FF5500] text-black font-black text-sm tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer glossy-reflection hover:scale-[1.01]"
              >
                <MessageCircle className="w-5 h-5" />
                {t.directSupportBtn}
              </a>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* 5. PHYSICAL STEPS TRANSACTION OVERLAY */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showTxOverlay && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm liquid-glass-card rounded-2xl p-6 relative text-center space-y-6"
            >
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">{t.swappingProgress}</h4>
                <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">Powered by Cocoon Relayer</p>
              </div>

              {txSuccess === null && (
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-2 border-t-[#FF9900] animate-spin" />
                  <TokenLogo symbol={srcToken} className="w-12 h-12" />
                </div>
              )}

              {txSuccess === true && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
              )}

              {/* Stepper details */}
              <div className="space-y-3 text-left">
                {[
                  { step: 1, label: t.step1 },
                  { step: 2, label: t.step2 },
                  { step: 3, label: t.step3 },
                  { step: 4, label: t.step4 }
                ].map((item) => {
                  const isActive = txStep === item.step;
                  const isCompleted = txStep > item.step || txSuccess;
                  return (
                    <div 
                      key={item.step} 
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-300 ${isCompleted ? 'bg-green-500/5 border-green-500/20 text-neutral-300' : isActive ? 'bg-[#FF9900]/5 border-[#FF9900]/30 text-white' : 'bg-black/20 border-white/5 text-neutral-600'}`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : isActive ? (
                        <div className="w-3.5 h-3.5 rounded-full border border-t-2 border-t-[#FF9900] animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-neutral-800" />
                      )}
                    </div>
                  );
                })}
              </div>

              {txSuccess === true && (
                <button
                  onClick={() => {
                    setShowTxOverlay(false);
                    setSrcAmount('');
                    setDstAmount('');
                  }}
                  className="w-full py-3 rounded-lg bg-green-500 text-black font-black text-xs tracking-wider shadow-lg shadow-green-500/20 cursor-pointer"
                >
                  {t.letsGo}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. NEW BOTTOM LIQUID-GLASS NAVBAR */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 z-30 shrink-0 bg-gradient-to-t from-[#060608] via-[#060608]/90 to-transparent">
        <div className="w-full max-w-md mx-auto bg-neutral-950/45 backdrop-blur-xl border border-white/5 p-1 rounded-2xl flex shadow-2xl justify-between">
          
          {/* Tab 1: Co-Pilot */}
          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'copilot' ? 'bg-[#FF9900] text-black shadow-md' : 'text-neutral-500 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.tabCoPilot}</span>
          </button>
          
          {/* Tab 2: Pro Swap */}
          <button
            onClick={() => setActiveTab('pro')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'pro' ? 'bg-[#FF9900] text-black shadow-md' : 'text-neutral-500 hover:text-white'}`}
          >
            <SwapIcon className="w-4 h-4" />
            <span>{t.tabProSwap}</span>
          </button>
          
          {/* Tab 3: Info */}
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'info' ? 'bg-[#FF9900] text-black shadow-md' : 'text-neutral-500 hover:text-white'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.tabInfo}</span>
          </button>
          
          {/* Tab 4: Support */}
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-wider uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'support' ? 'bg-[#FF9900] text-black shadow-md' : 'text-neutral-500 hover:text-white'}`}
          >
            <Wrench className="w-4 h-4" />
            <span>{t.tabSupport}</span>
          </button>
          
        </div>
      </footer>

    </div>
  );
}
